#!/usr/bin/env python3
"""AA_852 辯論社、登山社、系籃大一下～大二下的社課旁白（CLUB-LATER-TERMS-1112）→ src/data/club_later_terms.js（CLUB_LATER_TERMS）。

來源（企劃線，照 docs/handoff/story_import_allow.json 的 sha）：docs/story_planning/AA_852_club_later_terms.json
- _meta.rule：「term 加 Y1S2、Y2S1、Y2S2；週次、星期、時間、地點照大一上不變」「大三起這三個社團不再排社課」「每學期一組新的旁白（narr）…一次社課出一句，輪流」
- <活動 id>.<學期>＝那一學期的旁白（一句一格）

**旁白一字照稿**（只過 import_guard.read_fix 的換名；換到了會印出來）。這支工具另外做的（都是從稿上的字讀出來的，不是另外定的）：
- terms＝稿的 rule 寫的那三個學期（「term 加 A、B、C」）；每個社團剛好要有這三個學期、每學期至少一句。
- rain＝{活動 id: {學期: 第幾句}}：那一學期開頭寫「（下雨」的那一句＝下雨場才演的（系籃下雨改在體育館走廊：activities.js 的 rain）——
  晴天照順序輪的時候跳過它、下雨那一場固定演它（和大一上「走廊那一句」同一個做法，src/classes3d.js）。一學期最多一句；活動沒有 rain 設定卻有「（下雨」的句子＝停。
  那一學期沒有「（下雨」的句子（系籃大二上）＝下雨那一場照順序演（不拿大一上那一句來用：稿的 rule「不重複大一上那幾句」）。
- 核對 src/data/activities.js：這三個活動都在、kind 是 club、term 剛好是 ['Y1S1']＋terms（activities.js 是手寫檔，term 手改；對不上＝停）。
稿上有工具不認得的欄位、社團、學期＝停下來，不默默丟掉。

怎麼演：src/classes3d.js 的 clubNarr（那一學期有這裡的旁白就用這裡的，沒有＝照舊用 activities.js 的 narr）。測試 tests/club_later_terms_1112_unit.js。

用法：python3 tools/story/import_club_later_terms.py [--check]"""
import json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
import import_guard as IG

PATH = 'docs/story_planning/AA_852_club_later_terms.json'
OUT = 'src/data/club_later_terms.js'
ACT_JS = 'src/data/activities.js'
CLUBS = ('club_debate', 'club_hiking', 'dept_basketball')
BASE_TERM = 'Y1S1'
CHANGED = []


def die(m):
    raise SystemExit('import_club_later_terms：' + m)


def txt(x, where):
    if not isinstance(x, str) or not x.strip():
        die(f'{where}：要是一句字（{json.dumps(x, ensure_ascii=False)[:60]}）')
    y = IG.read_fix(x)
    if y != x:
        CHANGED.append(f'{where}：「{x}」→「{y}」')
    if not (y.startswith('（') and y.endswith('）')):
        die(f'{where}「{y}」：社課的旁白要整句在（）裡（和大一上一樣）')
    return y


def act_row(src, cid):
    m = re.search(r"\{id:'" + re.escape(cid) + r"',[^\n]*", src)
    if not m:
        die(f'{ACT_JS}：沒有 {cid}')
    return m.group(0)


def build(d):
    if set(d) != {'_meta'} | set(CLUBS):
        die(f'最上層的欄位改了（{sorted(d)}）；這支工具只認 {CLUBS}')
    M = d['_meta']
    if set(M) != {'doc', 'by', 'rule', 'arc', 'notes', 'status'}:
        die(f'_meta 的欄位改了（{sorted(M)}）')
    m = re.search(r'term 加 ([A-Z0-9、]+)；週次、星期、時間、地點照大一上不變', M['rule'])
    if not m:
        die(f'_meta.rule：讀不到「term 加 …；週次、星期、時間、地點照大一上不變」（{M["rule"]}）')
    terms = m.group(1).split('、')
    if not all(re.fullmatch(r'Y[1-4]S[12]', t) for t in terms) or len(set(terms)) != len(terms) or BASE_TERM in terms:
        die(f'_meta.rule：不認得的學期 {terms}')
    if '大三起這三個社團不再排社課' not in M['rule'] or any(t.startswith(('Y3', 'Y4')) for t in terms):
        die('_meta.rule：原本寫「大三起這三個社團不再排社課」，寫法換了，先改這支工具')
    if '一次社課出一句，輪流' not in M['rule']:
        die('_meta.rule：原本寫「一次社課出一句，輪流」，寫法換了，先改這支工具和 src/classes3d.js 的 clubNarr')
    act = open(os.path.join(ROOT, ACT_JS), encoding='utf-8').read()
    clubs, rain = {}, {}
    for cid in CLUBS:
        row = act_row(act, cid)
        if "kind:'club'" not in row:
            die(f'{ACT_JS} {cid}：不是 club')
        want = "term:[" + ','.join(f"'{t}'" for t in [BASE_TERM] + terms) + "]"
        if want not in row:
            die(f'{ACT_JS} {cid}：term 要是 {want}（手寫檔，照稿的 rule 手改）')
        has_rain = bool(re.search(r"\{id:'" + re.escape(cid) + r"',[^\n]*\n\s*rain:\{", act))
        v = d[cid]
        if not isinstance(v, dict) or sorted(v) != sorted(terms):
            die(f'{cid}：要剛好有 {terms}（{sorted(v) if isinstance(v, dict) else v}）')
        clubs[cid] = {}
        for t in terms:
            if not isinstance(v[t], list) or not v[t]:
                die(f'{cid}.{t}：至少一句')
            L = [txt(x, f'{cid}.{t}[{i}]') for i, x in enumerate(v[t])]
            if len(set(L)) != len(L):
                die(f'{cid}.{t}：有重複的句子')
            clubs[cid][t] = L
            r = [i for i, x in enumerate(L) if x.startswith('（下雨')]
            if r and not has_rain:
                die(f'{cid}.{t}：有「（下雨」的句子，可是 {ACT_JS} 的 {cid} 沒有 rain（下雨場）設定')
            if len(r) > 1:
                die(f'{cid}.{t}：「（下雨」的句子有 {len(r)} 句，下雨場只認一句')
            if r:
                rain.setdefault(cid, {})[t] = r[0]
    return {'terms': terms, 'clubs': clubs, 'rain': rain, 'rule': M['rule'], 'arc': M['arc'], 'notes': M['notes'], 'status': M['status']}


def main():
    allow = IG.load(ROOT)
    hits = [e for e in allow.get('files', []) if e.get('path') == PATH and e.get('status') == 'approved']
    if not hits:
        die(f'{PATH}：不在匯入白名單')
    sha = hits[-1]['sha']
    ok, why = IG.allowed(PATH, sha, allow)
    if not ok:
        die(why)
    data = {'src': f'{PATH}@{sha}'}
    data.update(build(json.loads(IG.read_fix(subprocess.check_output(['git', 'show', f'{sha}:{PATH}'], cwd=ROOT).decode('utf-8')))))   # 讀稿先過 read_fix（Alison、校名、店名的換名；tests/alison_unit.js 第 4 項）
    js = ('/* 自動產生：tools/story/import_club_later_terms.py（' + data['src'] + '）。不要手改，改企劃稿再重新匯入。\n'
          '   辯論社、登山社、系籃大一下～大二下的社課旁白（CLUB-LATER-TERMS-1112）：clubs[活動][學期]＝那一學期的旁白（一字照 AA_852）；\n'
          '   terms、rain（開頭「（下雨」的那一句＝下雨場才演）是從稿上的字讀出來的。怎麼演：src/classes3d.js 的 clubNarr */\n'
          "'use strict';\nconst CLUB_LATER_TERMS=" + json.dumps(data, ensure_ascii=False, indent=1) + ";\nif(typeof module!=='undefined') module.exports=CLUB_LATER_TERMS;\n")
    p = os.path.join(ROOT, OUT)
    if '--check' in sys.argv:
        cur = open(p, encoding='utf-8').read() if os.path.exists(p) else ''
        if cur != js:
            die(f'{OUT} 和來源不一樣：重新匯入')
        print('OK', why)
        return
    open(p, 'w', encoding='utf-8').write(js)
    print('寫入', OUT, '學期', data['terms'], '；句數', {c: {t: len(L) for t, L in v.items()} for c, v in data['clubs'].items()}, '；下雨場那一句', data['rain'], '；', why)
    for c in CHANGED:
        print('  換名（import_guard.read_fix）', c)


if __name__ == '__main__':
    main()
