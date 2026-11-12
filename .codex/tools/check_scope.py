#!/usr/bin/env python3
"""Fail a delivery if committed, staged or untracked changes exceed its file grant.

This is a pre-delivery policy check, not a sandbox or a second task database.
The task ID, file grant and exclusive writer must live in the existing dispatch.
"""

from __future__ import annotations

import argparse
from pathlib import Path, PurePosixPath
import subprocess
import sys


ROLES = ("SETUP", "LAWWW", "LAWWW2", "AA", "BB", "CC")
RULES = {
    "CLAUDE.md", "docs/AI_SESSION_HANDOFF.md", "docs/HANDOFF_GAP_MATRIX.md",
    "docs/PROJECT_DECISIONS.md", "docs/USER_INSTRUCTION_LOG.md",
}
CENTRAL = {
    "docs/handoff/tasks.json", "docs/handoff/deliveries.json",
    "docs/handoff/watermarks.json", "docs/handoff/duty.json",
    "docs/handoff/wip.json", "docs/handoff/story_import_allow.json",
}


def git(root: Path, *args: str) -> str:
    return subprocess.check_output(["git", "-C", str(root), *args], text=True)


def changed(root: Path, base: str) -> set[str]:
    git(root, "rev-parse", "--verify", f"{base}^{{commit}}")
    # A base-to-worktree diff alone can hide an out-of-scope staged change
    # when the worktree is restored to the base before checking. Inspect each
    # layer separately so committed/index/worktree changes cannot cancel out.
    committed = git(root, "diff", "--name-only", "--no-renames", "-z", base, "HEAD", "--")
    staged = git(root, "diff", "--cached", "--name-only", "--no-renames", "-z", "--")
    unstaged = git(root, "diff", "--name-only", "--no-renames", "-z", "--")
    untracked = git(root, "ls-files", "--others", "--exclude-standard", "-z")
    return set(filter(None, (committed + staged + unstaged + untracked).split("\0")))


def valid_path(root: Path, path: str) -> bool:
    value = PurePosixPath(path)
    return (
        bool(path) and not value.is_absolute() and ".." not in value.parts
        and ".git" not in value.parts and str(value) == path
        and not (root / path).is_symlink()
        and (root / path).resolve().is_relative_to(root.resolve())
    )


def in_role(role: str, path: str) -> bool:
    if path in RULES or path.startswith(".claude/"):
        return False
    if role == "SETUP":
        return path == "AGENTS.md" or path.startswith((".agents/skills/", ".codex/"))
    if path in CENTRAL:
        return role == "LAWWW"
    if path.startswith("docs/handoff/"):
        leaf = PurePosixPath(path).name
        own = {f"duty_{role}.json", f"outbox_{role}.json", f"user_asks_{role}.json"}
        return role == "LAWWW" or leaf in own or path.startswith("docs/handoff/snapshots/")
    if role == "LAWWW":
        return path == "index.html" or path.startswith(("src/", "lib/", "assets/", "tests/"))
    if role == "LAWWW2":
        # A ceiling, not semantic authorization: LAWWW must assign scene files.
        return path.startswith(("assets/models/", "tools/blender/", "src/", "tests/", "docs/art-rebuild/"))
    if role == "AA":
        return path.startswith("docs/story_planning/") and not path.startswith(
            ("docs/story_planning/CC/", "docs/story_planning/test_tools/")
        )
    if role == "BB":
        return path.startswith(("docs/story_planning/", "docs/test-reports/", "tests/")) and not path.startswith(
            ("docs/story_planning/CC/", "docs/story_planning/test_tools/cc/")
        )
    return path == "tools/cc_local/queue.txt" or path.startswith(
        ("docs/story_planning/CC/", "docs/story_planning/test_tools/cc/")
    )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base", required=True, help="dispatch baseline commit")
    parser.add_argument("--role", choices=ROLES, required=True)
    parser.add_argument("--allow", action="append", default=[], help="one exact repository-relative file; repeat")
    parser.add_argument("--peer", action="append", default=[], help="peer worktree to check for overlapping changes; repeat")
    args = parser.parse_args()
    try:
        root = Path(subprocess.check_output(["git", "rev-parse", "--show-toplevel"], text=True).strip()).resolve()
        branch = git(root, "branch", "--show-current").strip()
        if branch in ("main", "master"):
            raise ValueError("refusing delivery from a production branch")
        for path in args.allow:
            if not valid_path(root, path) or not in_role(args.role, path):
                raise ValueError(f"invalid or protected grant: {path}")
        paths = changed(root, args.base)
        denied = sorted(p for p in paths if p not in args.allow or not valid_path(root, p) or not in_role(args.role, p))
        if denied:
            raise ValueError("outside exact file grant: " + ", ".join(denied))
        for raw_peer in args.peer:
            peer = Path(raw_peer).resolve(strict=True)
            if Path(git(peer, "rev-parse", "--show-toplevel").strip()).resolve() != peer or peer == root:
                raise ValueError("peer must be another worktree root")
            overlap = paths & changed(peer, args.base)
            if overlap:
                raise ValueError("parallel writers changed the same paths: " + ", ".join(sorted(overlap)))
        print(f"PASS {args.role}: {len(paths)} changed files within exact grant; {len(args.peer)} peer checks")
        return 0
    except (ValueError, OSError, subprocess.SubprocessError) as error:
        print(f"FAIL {error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
