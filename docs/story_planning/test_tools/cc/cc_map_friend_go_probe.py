"""CC（帳號 A）11-03：MAP-FRIEND-GO-1103（LAWWW bf6dbda44；使用者 22:5x「我希望地圖上看到朋友在那邊可以選直接過去」）。
  【前置／捷徑】讀檔到校園（認識小安、阿哲等開場的人；條件事件關閉），試幾個時段，直到有一個朋友在別的地方、可以直接過去。
  M 大地圖：點右上角小地圖（#minimap）打開大地圖 → 按 👥（#bmWho）→ 每一行記下有沒有「直接過去（約 N 分鐘）」→ 按第一個「直接過去」。
     ① 👥 那一頁每一行都有「直接過去」或「帶我去」，至少一行有「直接過去（約 N 分鐘）」
     ② 按下去以後大地圖關掉（#bigmap.hide）
     ③ 90 秒內換到那個人所在的區域（或同一區、到了那一點），而且人在那個朋友旁邊 8 m 內——或「帶我去」接上了（指著那個人）
  P 手機朋友頁：點 #btnPhone → 「朋友」（[data-ptab=friends]）→ 按第一個「直接過去」；③ 同樣檢查。
  截圖：👥 那一頁、按下去之後、到了以後；手機朋友頁、到了以後。修正前（4ce25dc1d）M ① 應該 FAIL（大地圖沒有「直接過去」）。
用法：LW_TESTS=<wt>/tests [CASES=M,P] python3 cc_map_friend_go_probe.py <url> <out>"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
CASES = [c.strip() for c in (os.environ.get('CASES') or 'M,P').split(',') if c.strip()]
J = lambda o: json.dumps(o, ensure_ascii=False)
FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True}
# (第幾天, 週幾, 幾點)：第 1 天＝2025-09-17（三）
SLOTS = [(8, 4, 14.0), (8, 4, 17.5), (9, 5, 12.3), (10, 6, 15.0), (7, 3, 19.0), (11, 0, 16.0)]
FAILS = []


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)
    return ok


ROWS = """(sel=>{ const el=document.querySelector(sel); if(!el) return null; return [...el.querySelectorAll('.row2, .item')].map(r=>({text:(r.textContent||'').trim().slice(0,80), fgo:(r.querySelector('[data-fgo]')||{}).dataset?r.querySelector('[data-fgo]')&&r.querySelector('[data-fgo]').dataset.fgo:null, fgoText:r.querySelector('[data-fgo]')?(r.querySelector('[data-fgo]').textContent||'').trim():null, find:!!r.querySelector('[data-find]')})); })(%s)"""
WHERE = """(id=>{ const G=GAME.G, E=GAME.E, p=E.player.obj.position; let n=null; if(GAME.npc&&GAME.npc[id]) n=GAME.npc[id]; if(!n) n=(E.npcs||[]).find(q=>q.id===id||q.charId===id)||null;
  const np=n&&n.obj?n.obj.position:null; const gd=(typeof GUIDE!=='undefined'&&GUIDE._st)?GUIDE._st:{};
  return {zone:G.zone, x:+p.x.toFixed(1), z:+p.z.toFixed(1), npc:np?[+np.x.toFixed(1),+np.z.toFixed(1)]:null, d:np?+Math.hypot(np.x-p.x,np.z-p.z).toFixed(1):null,
    mapHidden:document.getElementById('bigmap').classList.contains('hide'), follow:(G.flags&&G.flags.findWho===id&&G.goalDest&&G.goalDest.npc===id)?id:null, wz:(STORY.whereIs&&STORY.whereIs(GAME,id)||{}).zone||null, busy:!!E.player.busy,
    where:(typeof STORY!=='undefined'&&STORY.whereIs)?String(JSON.stringify(STORY.whereIs(GAME,id))).slice(0,120):null}; })(%s)"""


async def arrive(pg, tag, fid, z0):
    t0 = time.time(); w = None; shot1 = False
    while time.time() - t0 < 90:
        await pg.wait_for_timeout(1500); w = await pg.evaluate(WHERE % J(fid))
        if not shot1: await pg.screenshot(path=os.path.join(OUT, '%s_after_tap.png' % tag)); shot1 = True
        if not w['busy'] and ((w['d'] is not None and w['d'] <= 8) or (w['wz'] and w['zone'] == w['wz'] and (w['zone'] != z0 or w['follow']))): break
    await pg.wait_for_timeout(1500); w = await pg.evaluate(WHERE % J(fid))
    await pg.screenshot(path=os.path.join(OUT, '%s_arrived.png' % tag))
    return w


async def main():
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); check('遊戲載入', await L.wait_loaded(pg))
        await pg.evaluate("localStorage.clear(); STORY.phoneAuto=()=>{}")
        found = None
        for (day, wd, hour) in SLOTS:
            st = {'zone': 'campus', 'hour': hour, 'day': day, 'weekday': wd, 'weather': 'clear', 'flags': FLAGS, 'pos': {'x': 30, 'z': 30, 'yaw': 0}}
            print('  [前置／捷徑] 讀檔：校園第 %d 天（週%d）%.2f 時（條件事件關閉）' % (day, wd, hour), flush=True)
            await L.load_state(pg, st, quiet_events=True); await pg.wait_for_timeout(8000); await L.close_panels(pg, cdp)
            ids = await pg.evaluate("(()=>{ const out=[]; for(const id of Object.keys(CHARACTERS||{})){ const g=GAME.friendGoInfo&&GAME.friendGoInfo(id); if(g&&!g.why) out.push([id,g.mins]); } return out; })()")
            print('  可以直接過去的人：%s' % J(ids), flush=True)
            if ids or not await pg.evaluate("!!GAME.friendGoInfo"): found = st; break
        check('前置：找到有朋友可以直接過去的時段', bool(found))
        if not found: found = st
        if 'M' in CASES:
            print('== M 大地圖', flush=True)
            await L.load_state(pg, found, quiet_events=True); await pg.wait_for_timeout(8000); await L.close_panels(pg, cdp)
            check('M：點右上角小地圖打開大地圖', await L.tap(pg, cdp, '#minimap'))
            await pg.wait_for_timeout(1500)
            if await pg.evaluate("document.getElementById('bmPeople').classList.contains('hide')"):
                check('M：按 👥', await L.tap(pg, cdp, '#bmWho')); await pg.wait_for_timeout(1200)
            rows = await pg.evaluate(ROWS % J('#bmPeople')) or []
            await pg.screenshot(path=os.path.join(OUT, 'M_people.png'))
            print('  👥 每一行：%s' % J(rows), flush=True)
            rr = [r for r in rows if r['find'] or r['fgo']]
            go = [r for r in rr if r['fgo'] and r['fgoText'] and r['fgoText'].startswith('直接過去')]
            check('M ① 👥 每一行都有「帶我去」或「直接過去」，至少一行有「直接過去（約 N 分鐘）」', bool(rr) and bool(go) and any('分鐘' in r['fgoText'] for r in go), J([[r['text'][:20], r['fgoText']] for r in rows]))
            if go:
                fid = go[0]['fgo']; z0 = await pg.evaluate("GAME.G.zone")
                print('  按「%s」（%s）' % (go[0]['fgoText'], fid), flush=True)
                await L.tap(pg, cdp, '#bmPeople [data-fgo="%s"]' % fid)
                await pg.wait_for_timeout(800)
                check('M ② 按下去以後大地圖關掉', await pg.evaluate("document.getElementById('bigmap').classList.contains('hide')"))
                w = await arrive(pg, 'M', fid, z0)
                check('M ③ 到那個朋友所在的區域，而且在他旁邊 8 m 內、或「帶我去」接上指著他（goalDest.npc）', w['zone'] == w['wz'] and ((w['d'] is not None and w['d'] <= 8) or bool(w['follow'])), J(w))
        if 'P' in CASES:
            print('== P 手機朋友頁', flush=True)
            await L.load_state(pg, found, quiet_events=True); await pg.wait_for_timeout(8000); await L.close_panels(pg, cdp)
            check('P：點手機', await L.tap(pg, cdp, '#btnPhone')); await pg.wait_for_timeout(1200)
            check('P：點「朋友」', await L.tap(pg, cdp, '#phoneTabs [data-ptab="friends"]')); await pg.wait_for_timeout(1500)
            btns = await pg.evaluate("[...document.querySelectorAll('#phoneBody [data-fgo]')].map(b=>[b.dataset.fgo,(b.textContent||'').trim()])")
            await pg.screenshot(path=os.path.join(OUT, 'P_friends.png'))
            print('  手機朋友頁的「直接過去」：%s' % J(btns), flush=True)
            check('P：朋友頁至少一個「直接過去」', bool(btns), J(btns))
            if btns:
                fid = btns[0][0]; z0 = await pg.evaluate("GAME.G.zone")
                await pg.evaluate("(id=>{ const b=document.querySelector('#phoneBody [data-fgo=\"'+id+'\"]'); b&&b.scrollIntoView({block:'center'}); })(%s)" % J(fid))
                await L.tap(pg, cdp, '#phoneBody [data-fgo="%s"]' % fid)
                w = await arrive(pg, 'P', fid, z0)
                check('P ③ 到那個朋友所在的區域，而且在他旁邊 8 m 內、或「帶我去」接上指著他（goalDest.npc）', w['zone'] == w['wz'] and ((w['d'] is not None and w['d'] <= 8) or bool(w['follow'])), J(w))
        check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS[:8])), flush=True)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
