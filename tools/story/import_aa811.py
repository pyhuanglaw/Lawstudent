#!/usr/bin/env python3
"""AA_811：學姊合歡山北峰那一趟（SIS_HEHUAN）、子晴之後的十則語音（ZQ_VOICE_MEMO）——MOVIE-TALK-1110 欠的兩組（任務 DLG-FULL-REVIEW-1110）。
企劃 AA_811（docs/story_planning/AA_811_movie_talk_hehuan_voice.json，企劃線）→ src/data/aa811_lines.js（AA811_LINES）：
  hehuan：id、title、who、accept（when 裡「她答應的句子：「…」」那一句）、dialogue（照稿：speaker／text、choice{t,say,fx}、{if,line}、set）；
  zq_voice：who、flag、msgs（十則，照順序）、reply9（第九則的兩個回覆）。
規則文字（when、trip、versions、notes、_meta）是給實作看的，不進遊戲（播放、時間在 src/aa811_3d.js）。台詞一字不改；白名單照 import_guard；讀稿照 read_fix。
用法：python3 tools/story/import_aa811.py [--ref <commit>] [--check]"""
import json, os, re, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import import_guard as IG

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PATH = 'docs/story_planning/AA_811_movie_talk_hehuan_voice.json'
OUT = 'src/data/aa811_lines.js'
SPEAKERS = (None, 'heroine_05')
FX_KEYS = ('love', 'friend')


def git(*a):
    return subprocess.check_output(['git', '-C', ROOT] + list(a)).decode('utf-8')


def text(v, w):
    if not isinstance(v, str) or not v.strip():
        raise SystemExit(f'{w}：要是非空字串')
    return IG.read_fix(v)


def line(x, w):
    if not isinstance(x, dict) or x.get('speaker') not in SPEAKERS:
        raise SystemExit(f'{w}：要是 {{speaker: null|heroine_05, text}}')
    return {'speaker': x['speaker'], 'text': text(x.get('text'), w + '.text')}


def fx(v, w):
    if not isinstance(v, dict) or any(k not in FX_KEYS or not isinstance(n, int) for k, n in v.items()):
        raise SystemExit(f'{w}：fx 只能有 love、friend（整數）')
    return dict(v)


def build(src):
    h = src.get('hehuan') or {}
    m = re.search(r'她答應的句子：「(.+?)」', h.get('when') or '')
    if not m:
        raise SystemExit('hehuan.when：找不到「她答應的句子：「…」」')
    dia = []
    for i, x in enumerate(h.get('dialogue') or []):
        w = f'hehuan.dialogue[{i}]'
        if 'choice' in x:
            C = x['choice']
            if not isinstance(C, list) or len(C) < 2:
                raise SystemExit(f'{w}.choice：至少兩個選項')
            dia.append({'choice': [{'t': text(c.get('t'), f'{w}.choice[{k}].t'), 'say': [line(s, f'{w}.choice[{k}].say[{j}]') for j, s in enumerate(c.get('say') or [])],
                                    'fx': fx(c.get('fx') or {}, f'{w}.choice[{k}].fx')} for k, c in enumerate(C)]})
        elif 'if' in x:
            if x['if'] not in ('dating', 'friend'):
                raise SystemExit(f'{w}.if：只能是 dating／friend')
            dia.append({'if': x['if'], 'line': line(x.get('line'), w + '.line')})
        elif 'set' in x:
            if not isinstance(x['set'], dict) or not x['set']:
                raise SystemExit(f'{w}.set：要是 {{旗標: 值}}')
            dia.append({'set': dict(x['set'])})
        else:
            dia.append(line(x, w))
    if not dia:
        raise SystemExit('hehuan.dialogue：沒有')
    z = src.get('zq_voice') or {}
    msgs = [text(t, f'zq_voice.msgs[{i}]') for i, t in enumerate(z.get('msgs') or [])]
    if len(msgs) != 10:
        raise SystemExit(f'zq_voice.msgs：要十則（現在 {len(msgs)}）')
    opts = (z.get('reply9') or {}).get('opts') or []
    if len(opts) != 2:
        raise SystemExit('zq_voice.reply9.opts：要兩個')
    reply9 = {'opts': [{'t': text(o.get('t'), f'zq_voice.reply9.opts[{k}].t'), 'say': [text(s, f'zq_voice.reply9.opts[{k}].say[{j}]') for j, s in enumerate(o.get('say') or [])],
                        'fx': fx(o.get('fx') or {}, f'zq_voice.reply9.opts[{k}].fx')} for k, o in enumerate(opts)]}
    return {'hehuan': {'id': text(h.get('id'), 'hehuan.id'), 'title': text(h.get('title'), 'hehuan.title'), 'who': text(h.get('who'), 'hehuan.who'),
                       'accept': IG.read_fix(m.group(1)), 'dialogue': dia},
            'zq_voice': {'who': text(z.get('who'), 'zq_voice.who'), 'flag': text(z.get('flag'), 'zq_voice.flag'), 'msgs': msgs, 'reply9': reply9}}


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
    js = ('/* 自動產生：tools/story/import_aa811.py（' + data['src'] + '）。不要手改，改企劃 AA_811 再重新匯入。\n'
          '   學姊合歡山北峰那一趟（hehuan）、子晴之後的十則語音（zq_voice）：src/aa811_3d.js 讀；逐句對稿 tests/aa811_hehuan_voice_1111_unit.js */\n'
          "'use strict';\nconst AA811_LINES=" + json.dumps(data, ensure_ascii=False, indent=1) + ';\n')
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
