#!/usr/bin/env python3
"""源稿改了、遊戲還是舊字（AA-C 2026-11-12 發現 AA_712、AA_732～734：上一任 AA 11-11 改過源稿，沒人重新匯入）。
對 docs/handoff/story_import_allow.json 每個 approved 的檔，比「白名單 sha 的內容」和「企劃分支現在的內容」；不一樣＝待重匯或待 AA 確認。
用法：python3 tools/story/check_stale_sources.py [--ref origin/<AA 的分支>]... ；結束碼 1＝有不一樣的。只讀，不 fetch。"""
import json, subprocess, sys
def git(*a):
    r = subprocess.run(['git', *a], capture_output=True, text=True)
    return r.stdout.strip() if r.returncode == 0 else None
def main():
    refs = [sys.argv[i + 1] for i, a in enumerate(sys.argv) if a == '--ref'] or ['origin/claude/magical-albattani-bk7b4n', 'origin/claude/story-planning']
    refs = [r for r in refs if git('rev-parse', '--verify', '-q', r)]
    allow = json.load(open('docs/handoff/story_import_allow.json', encoding='utf-8'))
    seen, stale, unk = set(), [], []
    for e in allow.get('files', []):
        p, s = e.get('path'), str(e.get('sha') or '')
        if e.get('status') != 'approved' or not p or not s or p in seen:
            continue
        seen.add(p)
        # staleCheckedAt（STALE-SOURCES-1112，LAWWW-C 11-13）：LAWWW 逐份核過「白名單 sha 以後到這個企劃 commit 為止只換代號／遊戲已經是新字／AA 註明不要再從本檔重匯」＝不用重匯；
        # 之後企劃分支這個檔又有新的改動才再報。白名單 sha（匯入工具真正讀的版本）不動。
        ck = str(e.get('staleCheckedAt') or '')
        if ck and git('rev-parse', f'{ck}:{p}'):
            s = ck
        base = git('rev-parse', f'{s}:{p}')
        if not base:
            unk.append(f'{p}@{s}（本機沒有這個 commit）'); continue
        for r in refs:
            cur = git('rev-parse', f'{r}:{p}')
            if cur and cur != base:
                # 白名單的版本是不是這條分支上這個檔的舊版（分支比較新）
                if git('merge-base', '--is-ancestor', s, r) is None:
                    continue
                last = git('log', '-1', '--format=%h %ci %s', r, '--', p) or ''
                n = git('diff', '--shortstat', f'{s}:{p}', f'{r}:{p}') or ''
                stale.append(f'{p}｜白名單 {s}｜{r.split("/")[-1]} 最新 {last[:90]}｜{n.strip()}｜{e.get("task","")}')
                break
    for x in stale: print('[待重匯]', x)
    for x in unk: print('[查不了]', x)
    print(f'結果：白名單 {len(seen)} 個檔，源稿比遊戲新的 {len(stale)} 個、查不了 {len(unk)} 個')
    sys.exit(1 if stale else 0)
main()
