#!/usr/bin/env python3
"""花序 Flower Notes 二樓花藝課（FLOWER-CLASS-1112，USER_WANTS X346）：AA_820 → src/data/flower_class.js（FLOWER_CLASS；播放 src/flower_class3d.js）。
- 只讀匯入白名單（docs/handoff/story_import_allow.json）上的版本（tools/story/import_guard.py）；白名單沒有 AA_820＝停下來。
- 每一句、名字、價錢、時數照稿逐字搬；讀稿照 import_guard.read_fix（和其他匯入工具一樣）。_meta、各節的 note／cond／when 是給程式的說明，照搬不演。
- 檢查：三門課（price、hours、makes 指到 items）、三樣成品 buy:false／love、no 空的、give／together 七位、story.first_class／sis.s1～s3／after 六位；
  句子是「（旁白）」的字串或 {who,t[,if]}；選項 {t,re,fx 或 set}。對不上就停下來。
用法：python3 tools/flower/import_flower_class.py [--check]"""
import json, os, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'story'))
import import_guard as IG
IG.use_canon897()   # CANON-NO-ECON-1112 第四批：讀稿再照 AA_897 第 2 節換整句（tools/story/canon897_fix.json）

DOC = 'docs/story_planning/AA_820_flower_class.json'
OUT = 'src/data/flower_class.js'
PEOPLE = ['heroine_01', 'heroine_02', 'heroine_03', 'heroine_04', 'heroine_05', 'classmate_peishan', 'kexin']
STAFF = '花藝師'


def git(*a):
    return subprocess.check_output(['git', '-C', ROOT] + list(a)).decode('utf-8')


def stop(msg):
    raise SystemExit('AA_820 ' + msg)


def fix(x):
    if isinstance(x, str):
        return IG.read_fix(x)
    if isinstance(x, list):
        return [fix(y) for y in x]
    if isinstance(x, dict):
        return {k: fix(v) for k, v in x.items()}
    return x


def s_ok(t, where):
    if not isinstance(t, str) or not t.strip():
        stop(f'{where}：要是非空字串')


def line_ok(e, where, whos, narr_only=True):
    """一句：字串（narr_only＝一定是（旁白））或 {who,t[,if]}"""
    if isinstance(e, str):
        s_ok(e, where)
        if narr_only and not (e.startswith('（') and e.endswith('）')):
            stop(f'{where}「{e}」：沒有 who 的字串要是（旁白）')
        return
    if not isinstance(e, dict) or set(e) - {'who', 't', 'if'} or e.get('who') not in whos:
        stop(f'{where}：要是字串或 {{who,t[,if]}}，who 是 {whos}')
    s_ok(e['t'], where + '.t')
    if 'if' in e and not str(e['if']).startswith('FC_DESC_'):
        stop(f'{where}.if：只認 FC_DESC_*')


def lines_ok(L, where, whos, narr_only=True):
    if not isinstance(L, list) or not L:
        stop(f'{where}：要是非空的陣列')
    for i, e in enumerate(L):
        line_ok(e, f'{where}[{i}]', whos, narr_only)


def choice_ok(C, where, keys):
    if not isinstance(C, list) or len(C) < 2:
        stop(f'{where}：至少兩個選項')
    for i, c in enumerate(C):
        w = f'{where}[{i}]'
        if not isinstance(c, dict) or set(c) - {'t', 're', 'fx', 'set'}:
            stop(f'{w}：要是 {{t,re,fx|set}}')
        s_ok(c.get('t'), w + '.t')
        lines_ok(c.get('re'), w + '.re', [], narr_only=False)
        if 'fx' in keys:
            fx = c.get('fx')
            if not isinstance(fx, dict) or not fx or set(fx) - {'love', 'fr'} or any(not isinstance(v, int) or v <= 0 for v in fx.values()):
                stop(f'{w}.fx：要是 love／fr 的正整數（兩個都不扣分）')
        if 'set' in keys and not str(c.get('set', '')).startswith('FC_DESC_'):
            stop(f'{w}.set：要是 FC_DESC_*')


def validate(d):
    for k in ('signup', 'classes', 'items', 'give', 'together', 'story'):
        if not isinstance(d.get(k), dict):
            stop(f'沒有 {k}')
    for k in ('button', 'menu_title', 'staff_ask', 'no_money', 'week_limit', 'closed'):
        s_ok(d['signup'].get(k), 'signup.' + k)
    lines_ok(d['signup'].get('done'), 'signup.done', [STAFF])   # 下課（自己上、成品放進包包時）：三門課共用，{物}＝成品名
    if list(d['classes']) != ['basic', 'design', 'season']:
        stop('classes：要是 basic、design、season')
    made = []
    for k, c in d['classes'].items():
        w = 'classes.' + k
        s_ok(c.get('name'), w + '.name')
        s_ok(c.get('again'), w + '.again')
        if not isinstance(c.get('price'), int) or c['price'] <= 0 or not isinstance(c.get('hours'), (int, float)) or c['hours'] <= 0:
            stop(f'{w}：price、hours 要是正的數字')
        if c.get('makes') not in d['items']:
            stop(f'{w}.makes「{c.get("makes")}」不在 items')
        made.append(c['makes'])
        lines_ok(c.get('lines'), w + '.lines', [STAFF])
        if not isinstance(c['lines'][0], str):
            stop(f'{w}.lines[0]：第一句要是旁白（story.first_class 接在它後面）')
    if sorted(made) != sorted(d['items']):
        stop('items 和三門課的 makes 對不上')
    for g, it in d['items'].items():
        w = 'items.' + g
        if not g.startswith('g_fc_'):
            stop(f'{w}：代號要是 g_fc_*')
        s_ok(it.get('name'), w + '.name')
        s_ok(it.get('line'), w + '.line')
        if it.get('buy') is not False or it.get('love') != [] or it.get('no') != [] or 'price' in it:
            stop(f'{w}：要是 buy:false、love／no 空的、沒有價錢（只能上課做，X325 不設定花卉喜好）')
    for sec in ('give', 'together'):
        got = [k for k in d[sec] if k not in ('note', 'cond', 'invite_button')]
        if got != PEOPLE:
            stop(f'{sec}：要是這七位 {PEOPLE}，稿是 {got}')
    for p in PEOPLE:
        for b in ('dating', 'friend'):
            lines_ok(d['give'][p].get(b), f'give.{p}.{b}', [], narr_only=False)
        T = d['together'][p]
        lines_ok(T.get('lines'), f'together.{p}.lines', [p])
        choice_ok(T.get('choice'), f'together.{p}.choice', ('fx',))
        line_ok(T.get('end'), f'together.{p}.end', [])
    s_ok(d['together'].get('invite_button'), 'together.invite_button')
    S = d['story']
    F = S.get('first_class') or {}
    lines_ok(F.get('lines'), 'story.first_class.lines', [STAFF])
    choice_ok(F.get('choice'), 'story.first_class.choice', ('set',))
    sis = S.get('sis') or {}
    for k in ('s1', 's2', 's3'):
        sc = sis.get(k) or {}
        w = 'story.sis.' + k
        s_ok(sc.get('title'), w + '.title')
        lines_ok(sc.get('lines'), w + '.lines', ['heroine_05', STAFF])
        choice_ok(sc.get('choice'), w + '.choice', ('fx',))
        if k != 's3':
            lines_ok(sc.get('end'), w + '.end', ['heroine_05'])
        if not str(sc.get('set', '')).startswith('FC_SIS_' + k.upper()):
            stop(f'{w}.set：要是 FC_SIS_{k.upper()}')
    A = S.get('after') or {}
    if [k for k in A if k != 'when'] != [p for p in PEOPLE if p != 'heroine_05']:
        stop('story.after：要是學姊以外的六位')
    for p in PEOPLE:
        if p != 'heroine_05':
            s_ok(A[p], 'story.after.' + p)


def main():
    allow = IG.load(ROOT)
    hits = [e for e in allow.get('files', []) if e.get('path') == DOC and e.get('status') == 'approved']
    if not hits:
        raise SystemExit(f'{DOC}：不在匯入白名單')
    sha = hits[-1]['sha']
    ok, why = IG.allowed(DOC, sha, allow)
    if not ok:
        raise SystemExit(why)
    d = fix(json.loads(git('show', f'{sha}:{DOC}')))
    validate(d)
    data = {'src': f'{DOC}@{sha}', 'staff': STAFF, 'people': PEOPLE}
    for k in ('signup', 'classes', 'items', 'give', 'together', 'story'):
        data[k] = d[k]
    js = ('/* 自動產生：tools/flower/import_flower_class.py（' + data['src'] + '）。不要手改，改企劃 AA_820 再重新匯入。\n'
          '   花序 Flower Notes 二樓花藝課（FLOWER-CLASS-1112，USER_WANTS X346；播放 src/flower_class3d.js）：signup＝報名、classes＝三門課、items＝三樣成品（不能買）、\n'
          '   give＝送她的反應、together＝一起上課、story＝第一次上課／學姊三場／其他六位幾天以後的一句。note、cond、when 是說明，不演。 */\n'
          "'use strict';\nconst FLOWER_CLASS=" + json.dumps(data, ensure_ascii=False, indent=1) + ';\n'
          "if(typeof module!=='undefined') module.exports=FLOWER_CLASS;\n")
    p = os.path.join(ROOT, OUT)
    if '--check' in sys.argv:
        cur = open(p, encoding='utf-8').read() if os.path.exists(p) else None
        if cur != js:
            print(f'不一致：{OUT} 和白名單上的 AA_820（{DOC}@{sha}）不同，請重新匯入')
            sys.exit(1)
        print(f'OK {OUT} 和白名單上的稿一致（{DOC}@{sha}）')
        return
    open(p, 'w', encoding='utf-8').write(js)
    print('寫入', OUT, why)


if __name__ == '__main__':
    main()
