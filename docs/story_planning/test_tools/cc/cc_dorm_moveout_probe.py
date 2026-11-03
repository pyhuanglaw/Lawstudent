"""CC（帳號 A）11-02：BUG-DORM-AFTER-MOVEOUT（P0）瀏覽器探針——退宿以後手機「地點」不再列宿舍、最上面有「回臺北的家」。
修正：86dd272df（game3d.js PLACE_LIST 在 HOME.baseMode(G)（econ 且 flags.Y0_MOVED_OUT）時濾掉 dorm、dorm_hall）
     ＋93cca8726（placesHTML 最上面「回臺北的家」data-gohome）。b1b249873 另外：econ 退宿濾掉整個台大（NTU_ZONES）；
     法律系 HOME.movedOut（flags.MOVED_OUT 有值）／JP.movedOut 也濾宿舍。
對照（修正前）：86dd272df^＝3c6207b60。預期：修正後全 PASS；修正前 econ 的 a FAIL（b 也會 FAIL：還沒有 data-gohome）。
不是 iPhone：Playwright 手機橫向模擬（844×390，SwiftShader）。不用 ?turbo。

CASES（同一個瀏覽器依序跑）：
  econ_ctrl  【前置／捷徑】load_state：經濟系（stage econ）2024-10-19（六）19:00 公館便利商店門口 (-29.4,18)，**沒有**退宿旗標 → d：宿舍要在列表裡（避免探針永遠 PASS）
  econ_moved 【前置／捷徑】同上＋flags.Y0_MOVED_OUT=true（HOME.baseMode 成立）→ a：沒有宿舍；b：最上面有「回臺北的家」（data-gohome）
  law_ctrl   【前置／捷徑】load_state：法律系第 8 天（週四）13:30 校園 (34,-98)，沒有 MOVED_OUT → d：宿舍要在列表裡
  law_moved  【前置／捷徑】同上＋flags.MOVED_OUT=8（HOME.movedOut 的旗標；日期是人造的，正式遊戲是大四畢業後才有）→ a：沒有宿舍；
             b：有沒有「回臺北的家」只記錄，另外比對「有 data-gohome」＝「HOME.canGo(G)&&!HOME.at(G)」（照程式該不該有）
  econ_old / law_old  c：【前置／捷徑】把「舊格式存檔」（v:1、沒有 social／events／legal 等欄位＝退宿前的存檔樣子，加上退宿旗標）寫進 localStorage 欄位 1，
             重新整理 → 標題畫面「讀取／匯入存檔」→ 欄位 1「讀取」（照玩家點；走 validate＋migrate）→ 沒有宿舍（econ 另查有回家）
驗證動作照玩家：CDP 觸控點 #btnPhone（手機）→ #phoneTabs 的「地點」分頁；讀 #phoneBody 的 .phrow（名稱、data-place 的 zone、data-gohome），不讀畫面判斷別的。
讀檔後的條件事件、手機自動打開關掉（quiet_events／STORY.phoneAuto；【前置】）。
經濟系退宿（休學在家）人在外面、空下來 3 秒，遊戲會自動回家（src/econff3d.js ECONFF.tick2，D102 ③）——PC（快）上 3.5 秒的等待裡就回家了，
  手機沒開、HOME.at=true，讀到的是上一個案例留下來的舊列表（2026-11-03 A2_dorm FAIL 的原因）。【前置】讀檔前把 ECONFF.tick2 換成空函式（只關自動回家，
  判斷不變），讀檔後等「旗標、stage、zone、遊戲在跑、不在家、沒有對話」真的成立才打開手機；讀列表時再要求手機開著、不在家。
用法：LW_TESTS=<工作樹>/tests [SHA=<sha>] [CASES=econ_ctrl,...] python3 cc_dorm_moveout_probe.py '<URL>/index.html' <輸出資料夾>
exit 0＝ALL PASS；1＝有 FAIL。"""
import os, sys, json, asyncio
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
SHA = os.environ.get('SHA', '?')
CASES = [c.strip() for c in os.environ.get('CASES', 'econ_ctrl,econ_moved,law_ctrl,law_moved,econ_old,law_old').split(',') if c.strip()]
J = lambda o: json.dumps(o, ensure_ascii=False)
DORMS = ('dorm', 'dorm_hall')
LAW_FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True,
             'fundsV2': 1, 'allowanceMonth': 9}
ECON_FLAGS = {'ECON_CAMP_OPEN': True, 'E15_BUS': 'nosleep', 'E15_WENT': True, 'ECON_CAMP_DONE': True, 'E01_DONE': True, 'fundsV2': 1, 'allowanceMonth': 10,
              'KX_FIRST_MSG': True}
FAILS = []


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)
    return ok


def info(s): print('INFO ' + s, flush=True)


async def close_panels(pg, cdp):
    """有 playlib.close_panels（10-17 以後的 tests/playlib.py）就用它；舊版沒有（例如 dc36b401e、v9.5）：照同樣的做法像玩家按「收起來／返回遊戲」"""
    if hasattr(L, 'close_panels'):
        return await L.close_panels(pg, cdp)
    shut = []
    for pid, btn in (('phone', '#btnPhoneClose'), ('menu', '#btnClose'), ('bigmap', '#bmClose')):
        if await pg.evaluate("(id=>{ const e=document.getElementById(id); return !!e&&!e.classList.contains('hide'); })('%s')" % pid):
            if await pg.evaluate("(s=>!!document.querySelector(s))('%s')" % btn): await L.tap(pg, cdp, btn)
            else: await pg.keyboard.press('Escape')
            await pg.wait_for_timeout(600); shut.append(pid)
    return shut


def setup(s): print('  [前置／捷徑] ' + s, flush=True)


async def econ_state(pg, moved):
    d = await pg.evaluate("STORY.dayOfKey('2024-10-19')")
    fl = dict(ECON_FLAGS)
    if moved: fl['Y0_MOVED_OUT'] = True
    return {'stage': 'econ', 'zone': 'gongguan', 'day': d, 'weekday': 6, 'hour': 19, 'money': 12000, 'weather': 'clear',
            'pos': {'x': -29.4, 'z': 18, 'yaw': 3.1416}, 'flags': fl, 'visited': {'dorm': True, 'campus': True, 'gongguan': True}}


def law_state(moved):
    fl = dict(LAW_FLAGS)
    if moved: fl['MOVED_OUT'] = 8
    return {'stage': 'law', 'zone': 'campus', 'day': 8, 'weekday': 4, 'hour': 13.5, 'weather': 'clear', 'pos': {'x': 34, 'z': -98, 'yaw': 0}, 'flags': fl,
            'visited': {'dorm': True, 'campus': True, 'gongguan': True, 'wenzhou': True}}


PLACES_JS = """(()=>{ const body=document.getElementById('phoneBody'); if(!body) return null; const rows=[...body.querySelectorAll('.phrow')];
  const out=rows.map((r,i)=>{ const nm=((r.firstElementChild&&r.firstElementChild.firstChild&&r.firstElementChild.firstChild.textContent)||'').trim();
    const bp=r.querySelector('[data-place]'), bh=r.querySelector('[data-gohome]');
    return {i, name:nm, place:bp?bp.dataset.place:null, gohome:!!bh, sub:((r.querySelector('.muted')||{}).textContent||'').slice(0,30)}; });
  const G=GAME.G; const H=(typeof HOME!=='undefined')?HOME:null;
  return {rows:out, tab:(document.querySelector('#phoneTabs button.on')||{}).dataset?document.querySelector('#phoneTabs button.on').dataset.ptab:null,
    stage:G.stage||'law', zone:G.zone, hour:+G.hour.toFixed(2), Y0_MOVED_OUT:G.flags.Y0_MOVED_OUT===undefined?null:G.flags.Y0_MOVED_OUT, MOVED_OUT:G.flags.MOVED_OUT===undefined?null:G.flags.MOVED_OUT,
    baseMode:!!(H&&H.baseMode&&H.baseMode(G)), movedOut:(H&&H.movedOut)?!!H.movedOut(G):'無 HOME.movedOut', canGo:!!(H&&H.canGo&&H.canGo(G)), atHome:!!(H&&H.at&&H.at(G)),
    v:G.v, hasSocial:!!G.social, phoneOpen:!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())||(!!document.getElementById('phone')&&!document.getElementById('phone').classList.contains('hide')) }; })()"""


async def open_places(pg, cdp):
    """照玩家：點手機按鈕 → 點「地點」分頁"""
    await close_panels(pg, cdp)
    s = await L.state(pg)
    if s['dlg'] or s['choices']:
        info('讀檔後有對話／選項，先照玩家點掉：' + J({k: s[k] for k in ('dtext', 'choices')}))
        await L.advance_dialogs(pg, cdp, type('R', (), {'note': staticmethod(info)})(), lambda q: not q['dlg'] and not q['choices'] and not q['busy'], max_steps=40)
    ok1 = await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1500)
    ok2 = await L.tap(pg, cdp, '#phoneTabs button[data-ptab="places"]'); await pg.wait_for_timeout(1500)
    return ok1 and ok2


QUIET_HOME_JS = "(()=>{ if(typeof ECONFF!=='undefined'&&ECONFF.tick2){ ECONFF.tick2=function(){}; return true; } return false; })()"


async def quiet_autohome(pg):
    setup('關掉經濟系休學在家「人在外面空下來 3 秒自動回家」（ECONFF.tick2→空函式；沒有這個函式的舊版=%s）' % (not await pg.evaluate(QUIET_HOME_JS)))


async def wait_ready(pg, case, st, econ, moved):
    """等讀檔的狀態真的成立（不是固定秒數）：遊戲在跑、標題收起、stage／zone 對、退宿旗標對、不在家、沒有對話／選項／ADV"""
    js = """(()=>{ const G=GAME.G; if(!G||!GAME.running) return null; const H=(typeof HOME!=='undefined')?HOME:null;
      return {stage:G.stage||'law', zone:G.zone, Y0:G.flags.Y0_MOVED_OUT===undefined?null:G.flags.Y0_MOVED_OUT, MO:G.flags.MOVED_OUT===undefined?null:G.flags.MOVED_OUT,
        title:!document.getElementById('titleScreen').classList.contains('hide'), at:!!(H&&H.at&&H.at(G)), adv:!!(typeof ADV!=='undefined'&&ADV.active),
        dlg:!!(GAME.D&&GAME.D.active), ev:!!(typeof EVENTS!=='undefined'&&EVENTS.running), hour:+G.hour.toFixed(2)}; })()"""
    want_flag = (True if econ else 8) if moved else None
    q = None
    for i in range(80):
        q = await pg.evaluate(js)
        if q and not q['title'] and q['stage'] == st['stage'] and q['zone'] == st['zone'] and (q['Y0'] if econ else q['MO']) == want_flag \
                and not q['at'] and not q['adv'] and not q['dlg'] and not q['ev']:
            if i >= 2: break   # 至少連看 1 秒，讀檔後的 enter 跑完
        await pg.wait_for_timeout(500)
    info('%s 讀檔後狀態（打開手機前）：%s' % (case, J(q)))
    return q


def dorm_rows(r): return [x for x in r['rows'] if (x['place'] and x['place'].split('|')[0] in DORMS) or x['name'].startswith('宿舍') or x['name'].startswith('男生宿舍')]


async def run_case(pg, cdp, case):
    print('---- %s ----' % case, flush=True)
    econ = case.startswith('econ'); moved = not case.endswith('_ctrl'); old = case.endswith('_old')
    st = await econ_state(pg, moved) if econ else law_state(moved)
    if old:
        st = dict(st); st['v'] = 1; st['name'] = '祐廷'
        setup('寫舊格式存檔（v:1，只有 %s；退宿旗標 %s）到 localStorage 欄位 1 → 重新整理 → 標題「讀取／匯入存檔」→ 欄位 1「讀取」（照玩家點）' %
              (','.join(sorted(st.keys())), 'Y0_MOVED_OUT' if econ else 'MOVED_OUT=8'))
        await pg.evaluate("(s=>{ localStorage.removeItem('fatiao3d_auto'); localStorage.setItem('fatiao3d_slot_1',s); })(%s)" % J(J(st)))
        await pg.reload(); await L.wait_loaded(pg)
        setup('讀檔前關掉條件事件、要回覆訊息自動打開手機（EVENTS.onEnter/tick、STORY.phoneAuto）')
        await pg.evaluate("(()=>{ EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}; })()")
        await quiet_autohome(pg)
        await L.tap(pg, cdp, '#btnLoadMenu'); await pg.wait_for_timeout(1500)
        c = await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#saveSlots button')].filter(x=>(x.textContent||'').trim().startsWith('讀取')); const e=b.find(x=>x.closest('.item')&&x.closest('.item').textContent.includes('欄位 1')); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
        check('%s 標題畫面欄位 1 有「讀取」' % case, bool(c))
        if not c: return
        await L.touch_tap(cdp, c[0], c[1])
        for _ in range(60):
            if await pg.evaluate("!!GAME.G&&!!GAME.running&&document.getElementById('titleScreen').classList.contains('hide')"): break
            await pg.wait_for_timeout(500)
        await wait_ready(pg, case, st, econ, moved)
        g = await pg.evaluate("({v:GAME.G.v,stage:GAME.G.stage,zone:GAME.G.zone,social:!!GAME.G.social,Y0:GAME.G.flags.Y0_MOVED_OUT,MO:GAME.G.flags.MOVED_OUT})")
        check('%s 舊存檔讀進來（migrate 後 v=2、stage、zone、旗標都在）' % case, g['v'] == 2 and g['stage'] == st['stage'] and g['zone'] == st['zone'] and (g['Y0'] if econ else g['MO'] == 8), J(g))
    else:
        setup('load_state（quiet_events）：%s %s %s %s；退宿旗標=%s' % (st['stage'], st['day'], st['hour'], st['zone'],
              (st['flags'].get('Y0_MOVED_OUT') if econ else st['flags'].get('MOVED_OUT'))))
        await quiet_autohome(pg)
        await L.load_state(pg, st, quiet_events=True)
        await wait_ready(pg, case, st, econ, moved)
    ok = await open_places(pg, cdp)
    r = await pg.evaluate(PLACES_JS)
    check('%s 照玩家打開手機「地點」分頁' % case, ok and r and r['phoneOpen'] and r['tab'] == 'places' and len(r['rows']) > 0,
          'tab=%s rows=%d phoneOpen=%s' % (r and r['tab'], len(r['rows']) if r else -1, r and r['phoneOpen']))
    if r and r['atHome'] and r['zone'] == st['zone']:
        info('%s 讀列表時 HOME.at=true（人被送回家了）：列表可能是舊的' % case)
    await pg.screenshot(path=os.path.join(OUT, '%s_places.png' % case))
    json.dump(r, open(os.path.join(OUT, '%s_places.json' % case), 'w'), ensure_ascii=False, indent=1)
    info('%s 狀態：stage=%s zone=%s baseMode=%s movedOut=%s canGo=%s atHome=%s；列表=%s' % (case, r['stage'], r['zone'], r['baseMode'], r['movedOut'], r['canGo'], r['atHome'],
         J([(x['name'], x['place'].split('|')[0] if x['place'] else ('回家' if x['gohome'] else None)) for x in r['rows']])))
    dr = dorm_rows(r)
    gh = [x for x in r['rows'] if x['gohome']]
    if not moved:
        check('%s d 對照（沒退宿）：宿舍在列表裡' % case, bool(dr), J(dr))
    else:
        tag = 'c 舊存檔' if old else 'a'
        check('%s %s 退宿後列表裡沒有宿舍（dorm／dorm_hall）' % (case, tag), not dr, '找到的宿舍列=%s' % J(dr))
        if econ:
            check('%s b 最上面有「回臺北的家」（data-gohome，第一列）' % case, bool(gh) and r['rows'][0]['gohome'], 'gohome 列=%s 第一列=%s' % (J(gh), J(r['rows'][0])))
        else:
            exp = r['canGo'] and not r['atHome']
            info('%s b 法律系退宿：「回臺北的家」%s（HOME.canGo=%s、HOME.at=%s）' % (case, '有' if gh else '沒有', r['canGo'], r['atHome']))
            check('%s b 「回臺北的家」有無＝HOME.canGo&&!HOME.at（照程式）' % case, bool(gh) == exp, 'gohome=%s 預期=%s' % (bool(gh), exp))
    await close_panels(pg, cdp)


async def main():
    os.makedirs(OUT, exist_ok=True)
    print('cc_dorm_moveout_probe  SHA=%s  URL=%s  CASES=%s' % (SHA, URL, ','.join(CASES)), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        check('遊戲載入', await L.wait_loaded(pg))
        for c in CASES:
            try:
                await run_case(pg, cdp, c)
            except Exception as e:
                check('%s 執行' % c, False, '例外：%r' % e)
        check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not FAILS else 'FAILED %d' % len(FAILS), flush=True)
    return 1 if FAILS else 0


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
