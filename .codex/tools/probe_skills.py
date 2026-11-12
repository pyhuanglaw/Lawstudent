#!/usr/bin/env python3
"""Ask Codex's real skill loader to verify the six repository skills.

This calls only initialize, skills/list and config/read: no model, thread, or turn
is started. A temporary SQLite/log location preserves a read-only CODEX_HOME.
Server responses and stderr are deliberately not dumped because they may contain
unrelated local configuration metadata.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import queue
import subprocess
import sys
import tempfile
import threading
import time
import tomllib


SKILLS = (
    "lawstudent-orchestrator",
    "lawstudent-story",
    "lawstudent-3d-art",
    "lawstudent-qa",
    "lawstudent-local-test",
    "lawstudent-handoff",
)
TIMEOUT_SECONDS = 60
ROLES = ("LAWWW", "LAWWW2", "AA", "BB", "CC")


class ProbeError(Exception):
    """An intentionally safe, locally generated diagnostic."""


def repository(argument: str | None) -> Path:
    if argument:
        root = Path(argument).expanduser().resolve(strict=True)
    else:
        result = subprocess.run(
            ["git", "rev-parse", "--show-toplevel"],
            check=True,
            capture_output=True,
            text=True,
            timeout=10,
        )
        root = Path(result.stdout.strip()).resolve(strict=True)
    if not root.is_dir():
        raise ProbeError("repository is not a directory")
    return root


def probe(root: Path, runtime: Path) -> None:
    messages: queue.Queue = queue.Queue()
    deadline = time.monotonic() + TIMEOUT_SECONDS
    command = [
        "codex", "--strict-config",
        "-c", "sqlite_home=" + json.dumps(str(runtime / "sqlite")),
        "-c", "log_dir=" + json.dumps(str(runtime / "logs")),
    ]
    command += ["app-server", "--listen", "stdio://"]
    with subprocess.Popen(
        command,
        cwd=root,
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL,
        text=True,
        encoding="utf-8",
    ) as server:
        assert server.stdin is not None and server.stdout is not None

        def read_messages() -> None:
            try:
                for line in server.stdout:
                    try:
                        messages.put(json.loads(line))
                    except json.JSONDecodeError:
                        messages.put(ProbeError("server emitted invalid JSON"))
                        return
            except (OSError, ValueError):
                messages.put(ProbeError("server output could not be read"))
            finally:
                messages.put(None)

        reader = threading.Thread(target=read_messages, daemon=True)
        reader.start()

        def send(message: dict) -> None:
            server.stdin.write(json.dumps(message) + "\n")
            server.stdin.flush()

        def response(request_id: int) -> dict:
            while True:
                remaining = deadline - time.monotonic()
                if remaining <= 0:
                    raise ProbeError("app-server response timed out")
                try:
                    message = messages.get(timeout=remaining)
                except queue.Empty:
                    raise ProbeError("app-server response timed out") from None
                if message is None:
                    raise ProbeError("app-server exited before completing the probe")
                if isinstance(message, ProbeError):
                    raise message
                if not isinstance(message, dict):
                    raise ProbeError("app-server response was not an object")
                if message.get("id") != request_id:
                    # Startup notifications are not needed for skill discovery.
                    continue
                if "error" in message:
                    raise ProbeError("app-server rejected a discovery request")
                result = message.get("result")
                if not isinstance(result, dict):
                    raise ProbeError("app-server returned an invalid result")
                return result

        try:
            send({
                "jsonrpc": "2.0",
                "id": 1,
                "method": "initialize",
                "params": {
                    "clientInfo": {"name": "lawstudent-skill-probe", "version": "1.0"},
                    "capabilities": {"experimentalApi": True},
                },
            })
            response(1)
            send({"jsonrpc": "2.0", "method": "initialized"})
            send({
                "jsonrpc": "2.0",
                "id": 2,
                "method": "skills/list",
                "params": {"cwds": [str(root)], "forceReload": True},
            })
            result = response(2)
            send({
                "jsonrpc": "2.0",
                "id": 3,
                "method": "config/read",
                "params": {"cwd": str(root), "includeLayers": True},
            })
            configuration = response(3)
        finally:
            # Closing stdin asks this dedicated server to stop; never stop a
            # shared daemon or another session. Enforce bounded cleanup as well.
            server.stdin.close()
            try:
                server.wait(timeout=5)
            except subprocess.TimeoutExpired:
                server.terminate()
                try:
                    server.wait(timeout=5)
                except subprocess.TimeoutExpired:
                    server.kill()
                    server.wait(timeout=5)

    entries = result.get("data")
    if not isinstance(entries, list):
        raise ProbeError("skills/list omitted its entries")
    matching = [
        entry for entry in entries
        if isinstance(entry, dict) and entry.get("cwd") == str(root)
    ]
    if len(matching) != 1:
        raise ProbeError("skills/list did not return exactly one requested repository")
    entry = matching[0]
    errors = entry.get("errors")
    if not isinstance(errors, list) or errors:
        raise ProbeError("skill loader reported errors; details withheld from safe summary")
    discovered = entry.get("skills")
    if not isinstance(discovered, list):
        raise ProbeError("skills/list omitted its skills")

    failed = False
    for name in SKILLS:
        candidates = [
            skill for skill in discovered
            if isinstance(skill, dict) and skill.get("name") == name
        ]
        valid = False
        if len(candidates) == 1:
            skill = candidates[0]
            expected = root / ".agents" / "skills" / name / "SKILL.md"
            raw_path = skill.get("path")
            valid = (
                skill.get("enabled") is True
                and skill.get("scope") == "repo"
                and isinstance(raw_path, str)
                and Path(raw_path).is_absolute()
                and Path(raw_path).resolve() == expected.resolve()
                and expected.is_file()
            )
        print(f"{'PASS' if valid else 'FAIL'} {name}: "
              f"{'enabled repository skill at expected path' if valid else 'missing, duplicate, disabled, wrong scope or wrong path'}")
        failed |= not valid
    if failed:
        raise ProbeError("repository skill discovery failed")
    print("PASS real Codex skills/list: 6/6; loader errors=0; no model invoked")
    verify_roles(root, configuration)


def verify_roles(root: Path, response: dict) -> None:
    """Inspect only role fields, never print the complete effective config."""
    project_file = root / ".codex" / "config.toml"
    with project_file.open("rb") as source:
        expected = tomllib.load(source).get("agents", {})
    layers = response.get("layers")
    if not isinstance(layers, list):
        raise ProbeError("config/read omitted configuration layers")
    project_layers = []
    for layer in layers:
        if not isinstance(layer, dict):
            continue
        name = layer.get("name", {})
        folder = name.get("dotCodexFolder") if isinstance(name, dict) else None
        if (isinstance(name, dict) and name.get("type") == "project" and isinstance(folder, str)
                and Path(folder).resolve() == project_file.parent.resolve()):
            project_layers.append(layer)
    if len(project_layers) != 1 or project_layers[0].get("disabledReason"):
        raise ProbeError(
            "project config was ignored or disabled; use an approved trusted project "
            "through Codex's project trust settings, then retry"
        )
    effective = response.get("config", {}).get("agents", {})
    loaded = project_layers[0].get("config", {}).get("agents", {})
    if not all(isinstance(value, dict) for value in (expected, effective, loaded)):
        raise ProbeError("config/read did not expose valid agent-role settings")

    def role_matches(role: object, description: str, path: Path) -> bool:
        if not isinstance(role, dict) or role.get("description") != description:
            return False
        raw = role.get("config_file")
        if not isinstance(raw, str):
            return False
        resolved = Path(raw)
        if not resolved.is_absolute():
            resolved = project_file.parent / resolved
        return resolved.resolve() == path.resolve() and path.is_file()

    failed = False
    for name in ROLES:
        declared = expected.get(name, {})
        description = declared.get("description") if isinstance(declared, dict) else None
        path = project_file.parent / "agents" / (name + ".toml")
        valid = (
            isinstance(description, str) and bool(description.strip())
            and role_matches(declared, description, path)
            and role_matches(loaded.get(name), description, path)
            and role_matches(effective.get(name), description, path)
        )
        print(f"{'PASS' if valid else 'FAIL'} {name}: "
              f"{'project description and role config path loaded' if valid else 'role config was not loaded as declared'}")
        failed |= not valid
    if failed:
        raise ProbeError("project agent-role configuration failed verification")
    print("PASS real Codex config/read: 5/5 role settings; project layer active")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", help="repository root (default: current Git root)")
    args = parser.parse_args()
    try:
        with tempfile.TemporaryDirectory(prefix="lawstudent-codex-probe-") as temporary:
            probe(repository(args.repo), Path(temporary))
    except ProbeError as error:
        print(f"FAIL {error}", file=sys.stderr)
        return 1
    except (OSError, subprocess.SubprocessError, ValueError):
        print("FAIL probe could not run; check Git root, Codex availability and local configuration", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
