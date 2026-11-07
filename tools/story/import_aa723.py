#!/usr/bin/env python3
"""AA_723：告白第一次失敗、再約幾次還能告白（使用者 Q2）＋沛珊沒交往的線（使用者 Q4）——AA723-CONFESS-PS-1107。
企劃 AA_723（docs/story_planning/AA_723_confess_retry_ps_silence.json，企劃線）→ src/data/aa723.js（AA723）：
  confess.heart（她 AA_719 key 決定的分數）、confess.lines（fail／normal／ready／second）；peishan.reply1、peishan.reunion（含 noGroup 的 msgs、opts、optAlt）、peishan.posts.bohan.lines。
規則文字（confess.rule、peishan.timeline、peishan.remove、keep、posts.rule、noGroup.rule／note）是給實作看的，不進遊戲。白名單照 import_guard；讀稿照 read_fix。
用法：python3 tools/story/import_aa723.py [--ref <commit>] [--check]"""
import json, os, re, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import import_guard as IG

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PATH = 'docs/story_planning/AA_723_confess_retry_ps_silence.json'
OUT = 'src/data/aa723.js'
WHO = ('heroine_01', 'heroine_02', 'heroine_03', 'heroine_04', 'heroine_05', 'classmate_peishan', 'kexin')
KINDS = ('fail', 'normal', 'ready', 'second')
HEART_KEY = re.compile(r'^[a-z_]+(@(space|tease|push|support))?(\+(hi|lo))?$')


def git(*a):
    return subprocess.check_output(['git', '-C', ROOT] + list(a)).decode('utf-8')


def lines(v, w):
    if not isinstance(v, list) or not v or not all(isinstance(t, str) and t.strip() for t in v):
        raise SystemExit(f'{w}：要是非空字串的陣列')
    return [IG.read_fix(t) for t in v]


def build(src):
    c = src.get('confess') or {}
    heart = {}
    for who, decs in (c.get('heart') or {}).items():
        if who not in WHO:
            raise SystemExit(f'confess.heart.{who}：不是七位之一')
        heart[who] = {}
        for dk, m in decs.items():
            if not re.match(r'^[A-Z]+-\d+$', dk):
                raise SystemExit(f'confess.heart.{who}.{dk}：決定拍的 id 要像 AN-1')
            heart[who][dk] = {}
            for k, v in m.items():
                if not HEART_KEY.match(k) or not isinstance(v, int):
                    raise SystemExit(f'confess.heart.{who}.{dk}.{k}：「值@stance+trust」→ 整數')
                heart[who][dk][k] = v
    L = {}
    for who in WHO:
        e = (c.get('lines') or {}).get(who)
        if not e:
            raise SystemExit(f'confess.lines.{who}：沒有')
        L[who] = {k: lines(e.get(k), f'confess.lines.{who}.{k}') for k in KINDS}
        sy = e.get('secondYes')   # eca6139aa（AA-B 11-07 18:0x）：第二次告白（失敗過、走 second）接原本答應那一場時換掉的句子；keep＝照原本
        if sy:
            if sy.get('keep'):
                L[who]['secondYes'] = {'keep': True}
            else:
                rep = sy.get('replace') or []
                if not rep or not all(isinstance(t, str) and t.strip() for t in rep):
                    raise SystemExit(f'confess.lines.{who}.secondYes.replace：要是非空字串的陣列')
                L[who]['secondYes'] = {'replace': [IG.read_fix(t) for t in rep], 'with': [IG.read_fix(t) for t in (sy.get('with') or [])]}
        if e.get('pending'):   # 21e9f6c50（AA-B 11-07 13:42）：失敗以後、條件還沒到就又告白（期末回家路上）＝pending，不算數、不重新起算、不答應
            L[who]['pending'] = lines(e['pending'], f'confess.lines.{who}.pending')
    p = src.get('peishan') or {}
    r = p.get('reply1') or {}
    reply1 = {'thread': lines(r.get('thread'), 'peishan.reply1.thread'), 'text': IG.read_fix(r.get('text') or ''),
              'opts': [{'t': IG.read_fix(o['t']), 'rel': o.get('rel') or {}, 'say': lines(o.get('say'), f'peishan.reply1.opts[{i}].say')} for i, o in enumerate(r.get('opts') or [])],
              'end': lines(r.get('end'), 'peishan.reply1.end')}
    if not reply1['text'] or len(reply1['opts']) < 2:
        raise SystemExit('peishan.reply1：text、opts 不完整')
    u = p.get('reunion') or {}
    group = []
    for i, g in enumerate(u.get('group') or []):
        if not (isinstance(g, list) and len(g) == 2 and all(isinstance(x, str) for x in g)):
            raise SystemExit(f'peishan.reunion.group[{i}]：[人, 那一句]')
        group.append([g[0], IG.read_fix(g[1])])
    plan = u.get('plan') or {}
    reunion = {'group': group, 'plan': plan, 'scene': lines(u.get('scene'), 'peishan.reunion.scene'),
               'last2': lines((u.get('sceneAlt') or {}).get('last2'), 'peishan.reunion.sceneAlt.last2')}
    ng = u.get('noGroup')   # f5cb310d6／d8570a14b（AA-B 11-07）：不在 public_law 群組＝2028-12-30 21:00 她私訊你；optAlt＝沉默期一則私訊都沒傳時換掉第 replaces 個選項
    if ng:
        opt = lambda o, w: {'t': IG.read_fix(o['t']), 'rel': o.get('rel') or {}, 'say': lines(o.get('say'), w + '.say')}
        reunion['noGroup'] = {'msgs': lines(ng.get('msgs'), 'peishan.reunion.noGroup.msgs'),
                              'opts': [opt(o, f'peishan.reunion.noGroup.opts[{i}]') for i, o in enumerate(ng.get('opts') or [])]}
        if len(reunion['noGroup']['opts']) < 2:
            raise SystemExit('peishan.reunion.noGroup.opts：不完整')
        a = ng.get('optAlt')
        if a:
            if not isinstance(a.get('replaces'), int) or not 0 <= a['replaces'] < len(reunion['noGroup']['opts']):
                raise SystemExit('peishan.reunion.noGroup.optAlt.replaces：要是 opts 的第幾個（從 0 算）')
            reunion['noGroup']['optAlt'] = dict(opt(a, 'peishan.reunion.noGroup.optAlt'), replaces=a['replaces'])
    out = {'reply1': reply1, 'reunion': reunion}
    bh = ((p.get('posts') or {}).get('bohan') or {}).get('lines')   # f5cb310d6：柏翰聊她貼文的那幾句（h506～h509）沒交往的線換成這一句（2027-06）
    if bh is not None:
        out['posts'] = {'bohan': {'lines': lines(bh, 'peishan.posts.bohan.lines')}}
    return {'confess': {'heart': heart, 'lines': L}, 'peishan': out}


def main():
    allow = IG.load(ROOT)
    hits = [e for e in allow.get('files', []) if e.get('path') == PATH and e.get('status') == 'approved']
    if not hits:
        raise SystemExit(f'{PATH}：不在匯入白名單')
    sha = sys.argv[sys.argv.index('--ref') + 1] if '--ref' in sys.argv else hits[-1]['sha']
    ok, why = IG.allowed(PATH, sha, allow)
    if not ok:
        raise SystemExit(why)
    data = {'src': f'{PATH}@{sha}'}
    data.update(build(json.loads(git('show', f'{sha}:{PATH}'))))
    js = ('/* 自動產生：tools/story/import_aa723.py（' + data['src'] + '）。不要手改，改企劃 AA_723 再重新匯入。\n'
          '   告白第一次失敗以後的接法（confess）、沛珊沒交往的線（peishan）：src/confess723_3d.js、src/ps_silence3d.js 讀 */\n'
          "'use strict';\nconst AA723=" + json.dumps(data, ensure_ascii=False, indent=1) + ';\n')
    p = os.path.join(ROOT, OUT)
    if '--check' in sys.argv:
        cur = open(p, encoding='utf-8').read() if os.path.exists(p) else ''
        if cur != js:
            raise SystemExit(f'{OUT} 和 {data["src"]} 不一樣：重新匯入')
        print('OK', why)
        return
    open(p, 'w', encoding='utf-8').write(js)
    print('寫入', OUT, why)


if __name__ == '__main__':
    main()
