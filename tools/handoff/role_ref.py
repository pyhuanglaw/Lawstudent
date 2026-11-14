#!/usr/bin/env python3
"""某個職位現在的分支（origin/<分支>）——從 docs/handoff/duty.json 讀（BRANCH-CLEAN-1114）。
起因：匯入、稽核工具把企劃線寫死成 origin/claude/story-planning、美術線寫死成 origin/claude/second-ai-env-art；
換帳號以後各職位的分支會變（duty.json 的 roles.<職位>.branch），寫死的名字讓舊分支不能刪、預設還讀到舊稿。
用法：from role_ref import ref;  ref('AA')  → 'origin/claude/…'（讀不到 duty.json 就回 fallback）
      python3 tools/handoff/role_ref.py AA"""
import json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OLD = {'AA': 'origin/claude/story-planning', 'BB': 'origin/claude/story-planning', 'LAWWW2': 'origin/claude/second-ai-env-art', 'CC': 'origin/claude/cc-testing'}


def ref(role, fallback=None):
    try:
        with open(os.path.join(ROOT, 'docs/handoff/duty.json'), encoding='utf-8') as f:
            b = ((json.load(f).get('roles') or {}).get(role) or {}).get('branch')
        if b: return 'origin/' + b
    except Exception:
        pass
    return fallback or OLD.get(role)


if __name__ == '__main__':
    print(ref(sys.argv[1] if len(sys.argv) > 1 else 'AA'))
