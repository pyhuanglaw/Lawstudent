#!/usr/bin/env python3
"""Create five detached, sparse worktrees for read-only configuration smoke tests.

No tasks, role registrations, role branches, game edits or remote pushes occur.
Existing paths are never overwritten. Worktrees remain available for inspection.
"""

from __future__ import annotations

import argparse
from pathlib import Path
import subprocess


ROLES = ("LAWWW", "LAWWW2", "AA", "BB", "CC")


def run(root: Path, *args: str) -> str:
    return subprocess.check_output(["git", "-C", str(root), *args], text=True).strip()


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", required=True, help="new directory outside the project checkout")
    parser.add_argument("--base", default="HEAD", help="committed configuration revision")
    args = parser.parse_args()
    repo = Path(subprocess.check_output(["git", "rev-parse", "--show-toplevel"], text=True).strip()).resolve()
    target = Path(args.root).resolve()
    if target.exists() or target.is_relative_to(repo) or repo.is_relative_to(target):
        parser.error("root must be a new directory outside and not containing the checkout")
    sha = run(repo, "rev-parse", "--verify", f"{args.base}^{{commit}}")
    for required in ("AGENTS.md", ".codex/config.toml", ".agents/skills/lawstudent-handoff/SKILL.md"):
        run(repo, "cat-file", "-e", f"{sha}:{required}")
    target.mkdir(parents=True)
    gitdirs = set()
    for role in ROLES:
        worktree = target / role
        run(repo, "worktree", "add", "--detach", "--no-checkout", str(worktree), sha)
        run(worktree, "sparse-checkout", "set", "--cone", ".agents", ".codex", "docs/handoff")
        # --no-checkout leaves an empty index. Populate only this new worktree,
        # honoring its sparse rules; otherwise status reports every file deleted.
        run(worktree, "read-tree", "-mu", sha)
        assert Path(run(worktree, "rev-parse", "--show-toplevel")).resolve() == worktree
        assert run(worktree, "rev-parse", "HEAD") == sha
        assert not run(worktree, "status", "--porcelain")
        gitdir = run(worktree, "rev-parse", "--absolute-git-dir")
        assert gitdir not in gitdirs
        gitdirs.add(gitdir)
        print(f"PASS {role}: {worktree}; detached {sha}; distinct Git index; clean")
    print("PASS 5 isolated worktrees; no production branches or task data changed")


if __name__ == "__main__":
    main()
