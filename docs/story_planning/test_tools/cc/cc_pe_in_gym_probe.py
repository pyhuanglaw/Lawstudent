"""CC（帳號 A）11-03：BUG-PE-DOOR-2D-1103（LAWWW 4ce25dc1d；使用者 22:5x 截圖「體育課上課 用對話呈現？體育館都已經建立好了」「然後背景是校園？」）。
  A 門口：【前置／捷徑】讀檔到校園、2025-09-22（一）體育課開著的時間、體育館門口南邊幾公尺（條件事件關閉）。
     玩家流程：走到「體育館」互動點 → 按互動鍵 → 選「進去上課：…」→ 點對話直到下課。
     ① 上課的第一句對話出現時，人已經在體育館（G.zone＝gym）——不是在校園門口演
     ② 人站在球場中圈前 (0, −2.6) 1.2 m 內
     ③ 上課時 ADV 的背景是館內 3D（ADV.bgMode＝freeze），不是校園的模糊背景
     ④ 下課後這堂課記成上過（CLS.status＝done）
  B 館內：【前置／捷徑】讀檔到體育館（gym）同一個時間、中圈附近。走到「體育課集合」→ 互動 → 「上課：…」
     ⑤ 上課時人在 gym、ADV 背景 freeze ⑥ 下課記成上過
  截圖：A、B 上課第一句（橫向）、A 選單、B 下課後。修正前（c6814325c）A ①②③ 應該 FAIL。
用法：LW_TESTS=<wt>/tests [CASES=A,B] python3 cc_pe_in_gym_probe.py <url> <out>"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
CASES = [c.strip() for c in (os.environ.get('CASES') or 'A,B').split(',') if c.strip()]
J = lambda o: json.dumps(o, ensure_ascii=False)
FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True}
PE = (0.0, -2.6)
FAILS = []


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)
    return ok


class Run:   # playlib.go_to 要的最小介面
    def note(self, s): print('  ' + s, flush=True)
    def check(self, n, ok, info=''): return check(n, ok, info)


ST = """(()=>{ const G=GAME.G, p=GAME.E.player.obj.position, A=(typeof ADV!=='undefined')?ADV:{}; const it=CLS.liveDoor?CLS.liveDoor(G,'gym'):null; const D=GAME.D||{};
  return {zone:G.zone, x:+p.x.toFixed(2), z:+p.z.toFixed(2), adv:!!A.active, bg:A.bgMode||null, freeze:!!(A.root&&A.root.classList.contains('freeze')),
    dlg:!!D.active, name:((document.getElementById('dlgName')||{}).textContent||'').trim(), text:((document.getElementById('dlgText')||{}).textContent||'').slice(0,40),
    choices:[...document.querySelectorAll('#choices:not(.hide) button')].map(b=>(b.textContent||'').trim()), it:it?{id:it.c.id, name:it.c.name, st:CLS.status(G,it)}:null}; })()"""
FIND_H = """(()=>{ const G=GAME.G; for(const h of [13.3,13.4,13.5,13.75,14,14.5,15,15.2,15.5]){ const g={day:G.day,hour:h,zone:'campus',flags:G.flags||{},weekday:G.weekday}; const x=CLS.liveDoor(g,'gym'); if(x&&CLS.status(g,x)==='open') return {h, id:x.c.id, name:x.c.name}; } return null; })()"""
DONE = """(id=>{ const G=GAME.G; const it=(CLS.dayItems(G)||[]).find(q=>q.c&&q.c.id===id); return it?CLS.status(G,it):null; })(%s)"""


async def tap_choice(pg, cdp, prefix):
    s = await pg.evaluate(ST)
    i = next((k for k, t in enumerate(s['choices']) if t.startswith(prefix)), None)
    if i is None: return None
    await L.tap(pg, cdp, '#choices button:nth-child(%d)' % (i + 1)); return s['choices'][i]


async def run_class(pg, cdp, tag, where_prefix, verb_prefix):
    """走到互動點、按互動、選上課；回傳 {first: 第一句對話時的狀態, end: 下課後的狀態}"""
    it = await L.find_it(pg, where_prefix)
    check('%s：有「%s」互動點' % (tag, where_prefix), bool(it), J(it))
    if not it: return None
    ok = await L.go_to(pg, cdp, Run(), it['x'], it['z'], it['r'] * 0.8, where_prefix)
    check('%s：走到「%s」' % (tag, where_prefix), ok)
    await pg.wait_for_timeout(800)
    s = await L.state(pg)
    check('%s：互動按鈕是「%s…」' % (tag, where_prefix), (s.get('interact') or '').startswith(where_prefix), s.get('interact'))
    await L.tap(pg, cdp, '#interact')
    t0 = time.time(); picked = None
    while time.time() - t0 < 30 and not picked:
        await pg.wait_for_timeout(600); picked = await tap_choice(pg, cdp, verb_prefix)
        if not picked:
            s = await pg.evaluate(ST)
            if s['choices']: await pg.screenshot(path=os.path.join(OUT, '%s_menu.png' % tag))
    check('%s：選單有「%s…」並選了它' % (tag, verb_prefix), bool(picked), str(picked))
    if not picked: return None
    first = None; t0 = time.time(); last = None
    while time.time() - t0 < 600:
        s = await pg.evaluate(ST)
        if s['dlg'] and not first:
            await pg.wait_for_timeout(1200); s = await pg.evaluate(ST); first = s
            await pg.screenshot(path=os.path.join(OUT, '%s_first_line.png' % tag))
            print('  %s 第一句：%s' % (tag, J(s)), flush=True)
        if first and not s['dlg'] and not s['choices'] and not s['adv']:
            await pg.wait_for_timeout(2000); s2 = await pg.evaluate(ST)
            if not s2['dlg'] and not s2['choices'] and not s2['adv']: break
        if s['choices']:
            await L.tap(pg, cdp, '#choices button:nth-child(1)'); await pg.wait_for_timeout(900); continue
        if s['dlg']:
            sig = (s['name'], s['text'])
            if sig != last: print('  %-6s %s' % (s['name'] or '（旁白）', s['text']), flush=True); last = sig
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700); continue
        await pg.wait_for_timeout(600)
    end = await pg.evaluate(ST)
    await pg.screenshot(path=os.path.join(OUT, '%s_after.png' % tag))
    return {'first': first, 'end': end}


async def main():
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); check('遊戲載入', await L.wait_loaded(pg))
        await pg.evaluate("localStorage.clear(); STORY.phoneAuto=()=>{}")
        day = await pg.evaluate("STORY.dayOfKey('2025-09-22')")
        base = {'zone': 'campus', 'hour': 13.0, 'day': day, 'weekday': 1, 'weather': 'clear', 'flags': FLAGS, 'pos': {'x': 74, 'z': 54, 'yaw': 0}}
        print('  [前置／捷徑] 讀檔：2025-09-22（一，day %s）13:00 校園體育館門口南邊（條件事件關閉）' % day, flush=True)
        await L.load_state(pg, base, quiet_events=True); await pg.wait_for_timeout(9000); await L.close_panels(pg, cdp)
        fh = await pg.evaluate(FIND_H)
        check('前置：這天下午有一堂可以上的體育課（門口 gym）', bool(fh), J(fh))
        if not fh: await b.close(); print('FAILED'); sys.exit(1)
        h = fh['h'] + 0.05
        if 'A' in CASES:
            print('== A 門口', flush=True)
            print('  [前置／捷徑] 讀檔到 %.2f 時、體育館門口南邊 (74, 54)' % h, flush=True)
            await L.load_state(pg, dict(base, hour=h), quiet_events=True); await pg.wait_for_timeout(9000); await L.close_panels(pg, cdp)
            r = await run_class(pg, cdp, 'A', '體育館', '進去上課')
            if r and r['first']:
                f = r['first']
                check('A ① 上課第一句時人已經在體育館（zone＝gym）', f['zone'] == 'gym', J(f))
                check('A ② 站在球場中圈前 (0,−2.6) 1.2 m 內', f['zone'] == 'gym' and ((f['x'] - PE[0]) ** 2 + (f['z'] - PE[1]) ** 2) ** 0.5 <= 1.2, J([f['x'], f['z']]))
                check('A ③ 上課時 ADV 背景是館內 3D（bgMode＝freeze）', f['adv'] and f['bg'] == 'freeze' and f['freeze'], J({k: f[k] for k in ('adv', 'bg', 'freeze')}))
                st = await pg.evaluate(DONE % J(fh['id']))
                check('A ④ 下課後這堂課記成上過（done）', st == 'done', '%s；下課後 %s' % (st, J(r['end'])))
            else:
                check('A：上課的對話有出現', False, J(r))
        if 'B' in CASES:
            print('== B 館內中圈', flush=True)
            print('  [前置／捷徑] 讀檔到 %.2f 時、體育館（gym）中圈南邊 (0, 2)' % h, flush=True)
            await L.load_state(pg, dict(base, hour=h, zone='gym', pos={'x': 0, 'z': 2, 'yaw': 0}), quiet_events=True); await pg.wait_for_timeout(9000); await L.close_panels(pg, cdp)
            r = await run_class(pg, cdp, 'B', '體育課集合', '上課')
            if r and r['first']:
                f = r['first']
                check('B ⑤ 上課時人在 gym、ADV 背景 freeze', f['zone'] == 'gym' and f['adv'] and f['bg'] == 'freeze', J(f))
                st = await pg.evaluate(DONE % J(fh['id']))
                check('B ⑥ 下課後這堂課記成上過（done）', st == 'done', st)
            else:
                check('B：上課的對話有出現', False, J(r))
        check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS[:8])), flush=True)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
