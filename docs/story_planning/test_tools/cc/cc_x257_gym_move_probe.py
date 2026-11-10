"""CC X257「體育館搬家」探針（GYM-MOVE-1105＝XS-GATE-NORTH-1105；LAWWW 08:54 交、BB 排）。
改後＝開發分支 1c767edf8（GYM-MOVE-1105 已整合待測試）；改前＝210b0663d（cf6a29f7e 的上一個，LAWWW2 分支的樹：沒有 gym3d.js、placemap3d.js、xinsheng_layout.js、sis_b13_events.js）。
讀程式得到的座標（1c767edf8）：
  側門＝Z3.XSG (−101.4, −141)、門洞 5.2 m；出口互動點「往新生南路（側門）」(−101.4, −139.4) r 2.0 → xinsheng 落點 (14.3, 10) 面西；
  新生南路回校園「回到首都帝大（新生南路側門）」→ 校園 (−101.4, −137.2)；
  體育館門口＝CLS.DOORS.gym (−75, −125) r 1.6、label「體育館」、door:'gym'、enter:'gym'；館內落點 GYM_LAYOUT.spawn (0, 17.6)；
  「離開體育館」(0, 18.5) r 0.8 → 校園 (−75, −123.4) yaw 0（GYM_LAYOUT.exit.spawn＝GY3.CAMPUS）；
  體育課 pe_y1s1＝星期一 pm2、room GYM（door gym）：門口選單「進去上課：體育／進館裡逛逛（不上課）／不上了」→ 進 gym 站 CLS.PE_IN_GYM (0, −2.6)（游泳週 gym_b1 站 CLS.PE_POOL）；
  停車架 Z3.BIKE_RACKS.campus 有 (−68, −123, 0)（體育館門前）、(−94.6, −131)（側門內小廣場）；下車按鈕 #btnBike；車的互動點「騎腳踏車」(it.bike)；
  ev_sis13_pool：2029-05-07～05-10 週一～四 08:00～08:40、near (−75, −123.4) r 7、SISB13.poolOk（法律系、met_sis、學姊朋友以上、沒交往、不是前任、在臺灣）；
  手機地圖：PLACEMAP.PINS 的 gym (190, 59)、cx −75 cz −125；DOM＝#phoneBody 裡 svg[data-pmapsvg] > g[data-pmap="gym"] > circle；「你在這裡」＝r 11 的紅圈。
CASES（依序；預設全跑）：
  exit    從映月湖和博思中間 (−50,−98) 真的走到北牆側門、按「往新生南路」→ 新生南路 → 走到人行道 → 回頭看（截圖兩張＋往南一張參考）→ 走回側門按「回到首都帝大」→ 落在 (−101.4,−137.2)
  gymdoor 從 (−80,−98) 走到 (−75,−125) 按「體育館」→ 進館（落點 0.6 m 內）→ 走到「離開體育館」按 → 校園 (−75,−123.4) 0.3 m 內、推得動。改前 FAIL、改後 PASS
  map     站在體育館門前，打開手機「地點」：體育館圖釘在、cx/cz 對門口、和其他圖釘的相對方位跟世界座標一致、紅圈在體育館、點圖釘下面列出新體育館
  pe      【前置】讀使用者存檔、找下一堂體育課那天、開始前 15 分鐘站在體育館門前 → 走到門口按 → 選「進去上課」→ 點完 → 出席紀錄、時間往前、人站得住、walkFallbacks 0、沒有 JS 例外 → 走出館
  bike    【前置】讀檔把自己的車停在體育館門前西邊 → 走到車旁「騎腳踏車」→ 騎到門前停車架 (−68,−123) 最近的合法停車位 → 按「下車」→ 車停在那裡
  pool    【前置】讀檔 2029-05-08（二）08:01、學姊朋友以上 → 從 (−80,−98) 真的走到體育館門口 → ev_sis13_pool 在 7 m 內開始 → 點完 → SIS13_POOL
  oldsite 舊門口 (74,59.4)／舊館 (74,68)：附近 6 m 內沒有體育館的互動點、gym_ext 不在那裡、走到舊門口互動鍵不是「體育館」；截圖。改前 FAIL、改後 PASS
規則：沒有 ?turbo、不瞬移；讀檔只當前置（R.setup 寫【前置／捷徑】）；走路用 L.go_to（點地面／搖桿）、按 #interact、點選項按鈕。Playwright／SwiftShader ≠ iPhone。
這支沒在雲端跑過（磁碟不夠開 worktree）：找不到東西時 R.note 印出候選、R.check FAIL 附資訊。
用法：LW_TESTS=<wt>/tests TAG=old|new [CASES=exit,gymdoor,...] [DAY=52] [FIX=tests/fixtures/user_save_day51b_1110.json] [RELOAD=1] python3 cc_x257_gym_move_probe.py <url> <out>"""
import os, sys, json, asyncio, math, time
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
TAG = os.environ.get('TAG') or 'x'
CASES = [c.strip() for c in (os.environ.get('CASES') or 'exit,gymdoor,map,pe,bike,pool,oldsite').split(',') if c.strip()]
DAY = int(os.environ.get('DAY') or 52)
FIX = os.environ.get('FIX') or 'tests/fixtures/user_save_day51b_1110.json'
RELOAD = os.environ.get('RELOAD', '1') == '1'
R = L.Run('x257_gym_move_' + TAG, OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
BF = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheInvite': True, 'zheNoodleDone': True}
GATE = (-101.4, -141.0); GATE_IN = (-101.4, -137.2); XS_SPAWN = (14.3, 10.0)
DOOR = (-75.0, -125.0); DOOR_OUT = (-75.0, -123.4); RACK = (-68.0, -123.0)
OLD_DOOR = (74.0, 59.4); OLD_HALL = (74.0, 68.0)
MID = (-50.0, -98.0); PATH_W = (-80.0, -98.0)

ST = r"""(()=>{ const E=GAME.E, P=E.player, o=P.obj.position, DG=GAME.D; const ch=document.getElementById('choices'), it=document.getElementById('interact');
  const vis=e=>!!e&&!e.classList.contains('hide')&&getComputedStyle(e).display!=='none';
  return {zone:GAME.G.zone, day:GAME.G.day, hour:+(+GAME.G.hour).toFixed(3), x:+o.x.toFixed(3), z:+o.z.toFixed(3), y:+o.y.toFixed(3), lv:P.lv|0, ry:+P.obj.rotation.y.toFixed(3),
    busy:!!P.busy, seat:!!P.seat, riding:!!P.riding, dlg:!!(DG&&DG.active), dtext:((document.getElementById('dlgText')||{}).textContent||'').trim().slice(0,80),
    choices:vis(ch)?[...ch.querySelectorAll('button')].map(b=>(b.innerText||b.textContent||'').trim()):[],
    interact:vis(it)?(it.textContent||'').trim().slice(0,30):'', stand:E.canStand?!!E.canStand(o.x,o.z,0.3,P.lv|0):null, fb:GAME.walkFallbacks|0, paused:!!E.paused}; })()"""
ITS = r"""((f)=>{ const fn=new Function('i','return ('+f+');'); return (GAME.E.interactables||[]).filter(i=>{ try{ return !i.hidden&&fn(i); }catch(e){ return false; } })
  .map(i=>({label:i.label||'', x:+(+i.x).toFixed(2), z:+(+i.z).toFixed(2), r:i.radius||1.5, lv:i.lv|0, door:i.door||null, to:i.exit?i.exit.to||null:null, bike:!!i.bike})); })"""
NEAR_ITS = r"""((q)=>(GAME.E.interactables||[]).filter(i=>Math.hypot(i.x-q[0],i.z-q[1])<=q[2]).map(i=>({label:i.label||'', x:+(+i.x).toFixed(2), z:+(+i.z).toFixed(2), r:i.radius||1.5, door:i.door||null, to:i.exit?i.exit.to||null:null, hidden:!!i.hidden})))"""


def errs_since(errs, n0):
    return errs[n0:]


async def close_panels(pg, cdp):
    f = getattr(L, 'close_panels', None)   # 210b0663d 的 playlib 沒有 close_panels
    if f: return await f(pg, cdp)
    return []


async def st(pg):
    return await pg.evaluate(ST)


async def settle(pg, ms=700, max_s=8):
    t0 = time.time(); last = None; still = 0
    while time.time() - t0 < max_s:
        s = await st(pg); cur = (round(s['x'], 2), round(s['z'], 2))
        if cur == last: still += 150
        else: still = 0
        if still >= ms: return s
        last = cur; await pg.wait_for_timeout(150)
    return await st(pg)


async def pick(pg, cdp, i):
    c = await pg.evaluate("(i=>{ const b=[...document.querySelectorAll('#choices button')]; const e=b[i]||b[0]; if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%d)" % i)
    if c: await L.touch_tap(cdp, c[0], c[1])
    return bool(c)


async def drain(pg, cdp, prefer=(), max_s=150, quiet_s=3.0, stop=None):
    """像玩家一樣點完對話、選選項（prefer＝想選的選項開頭，依序比；沒有就選第一個）；連續 quiet_s 秒沒有對話、選項、busy 才停。回傳 (台詞, 選過的)"""
    lines, picked = [], []; t0 = time.time(); idle = 0.0
    while time.time() - t0 < max_s:
        s = await st(pg)
        if stop and stop(s): break
        if s['paused'] and await close_panels(pg, cdp): continue
        if s['choices']:
            k = next((i for p in prefer for i, o in enumerate(s['choices']) if o.startswith(p)), 0)
            picked.append(s['choices'][k]); await pick(pg, cdp, k); await pg.wait_for_timeout(1000); idle = 0; continue
        if s['dlg']:
            if not lines or lines[-1] != s['dtext']: lines.append(s['dtext'])
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700); idle = 0; continue
        if s['busy']:
            await pg.wait_for_timeout(500); idle = 0; continue
        await pg.wait_for_timeout(500); idle += 0.5
        if idle >= quiet_s: break
    return lines, picked


async def wait_zone(pg, cdp, zone, max_s=60):
    t0 = time.time()
    while time.time() - t0 < max_s:
        s = await st(pg)
        if s['zone'] == zone and not s['busy'] and not s['dlg'] and not s['choices']: return s
        if s['choices']: await pick(pg, cdp, 0)
        elif s['dlg']: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(500)
    return await st(pg)


async def standable_near(pg, x, z, r, lv=0):
    return await pg.evaluate("""((e)=>{ const E=GAME.E, P=E.player.obj.position; if(!E.canStand) return {x:e.x,z:e.z,d:0,nocheck:true}; let best=null;
      for(let r=0; r<=e.r+1e-6; r+=0.1) for(let a=0; a<360; a+=15){ const x=e.x+r*Math.sin(a*Math.PI/180), z=e.z+r*Math.cos(a*Math.PI/180);
        if(!E.canStand(x,z,0.3,e.lv)) continue; const d=Math.hypot(x-P.x,z-P.z); if(!best||d<best.d) best={x:+x.toFixed(2),z:+z.toFixed(2),d}; }
      return best; })""", {'x': x, 'z': z, 'r': r, 'lv': lv})


async def cam_yaw(pg, yaw, wait=2500):
    """只為截圖：遊戲鏡頭直接轉到 yaw（鏡頭在玩家的 (sin yaw, cos yaw) 那一側；yaw 0＝鏡頭在南邊、看北）"""
    await pg.evaluate("a=>{ const C=GAME.E.cam; C.yaw=a; C.manualT=8; }", yaw); await pg.wait_for_timeout(wait)


async def shot(pg, name, hud=False, judge_black=True):
    if not hud: await pg.evaluate(D.HUD + '(false)'); await pg.wait_for_timeout(300)
    m = await D.shot(pg, '%s_%s' % (TAG, name), judge_black=judge_black)
    if not hud: await pg.evaluate(D.HUD + '(true)')
    R.note('[截圖] %s_%s.png 亮度 %s' % (TAG, name, J(m)))
    return m


async def day_info(pg, day):
    return await pg.evaluate("(d=>{ try{ const q=CALENDAR.dateOf(d); return {key:q.key, wd:q.wd%7}; }catch(e){ return null; } })(%d)" % day)


async def day_of_key(pg, key):
    return await pg.evaluate("(k=>{ if(typeof STORY!=='undefined'&&STORY.dayOfKey) return STORY.dayOfKey(k); for(let d=-800;d<4000;d++){ try{ if(CALENDAR.dateOf(d).key===k) return d; }catch(e){} } return null; })(%s)" % J(key))


async def load(pg, cdp, zone, day, hour, x, z, yaw=0.0, flags=None, quiet=True, extra=None, why=''):
    di = await day_info(pg, day)
    st0 = {'zone': zone, 'hour': hour, 'day': day, 'stage': 'law', 'weather': 'clear', 'pos': {'x': x, 'z': z, 'yaw': yaw, 'lv': 0}, 'flags': dict(BF, **(flags or {}))}
    if di: st0['weekday'] = di['wd']
    if extra: st0.update(extra)
    R.setup('【前置／捷徑】讀檔：day %s（%s）%05.2f %s (%s, %s) yaw %.2f；%s%s' % (day, di and di['key'], hour, zone, x, z, yaw,
            '條件事件、手機自動打開關掉' if quiet else '條件事件照開、只關手機自動打開', ('；' + why) if why else ''))
    try: await L.load_state(pg, st0, quiet_events=quiet, quiet_phone=True)
    except TypeError: await L.load_state(pg, st0, quiet_events=quiet)   # 舊 playlib 沒有 quiet_phone
    await pg.wait_for_timeout(7000); await close_panels(pg, cdp)
    s = await st(pg)
    if s['dlg'] or s['choices']: await drain(pg, cdp, max_s=30)
    s = await st(pg); R.note('讀檔後：%s' % J(s))
    return s


async def apply_fixture(pg, cdp, sv, quiet=True):
    js = "(async(s)=>{ document.getElementById('titleScreen').classList.add('hide'); const rot=document.getElementById('rotate'); if(rot) rot.classList.remove('want'); " + \
         ("EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; " if quiet else "") + "if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}; await GAME.applySave(s); })"
    await pg.evaluate(js, sv); await pg.wait_for_timeout(8000); await close_panels(pg, cdp)
    s = await st(pg)
    if s['dlg'] or s['choices']: await drain(pg, cdp, max_s=30)
    return await st(pg)


async def walk_it(pg, cdp, tag, filt, label0, near_pt=None, max_s=300):
    """走到第一個符合 filt（JS 條件，i＝互動點）的互動點範圍裡站得住的點（範圍六成以內），等互動鍵是 label0 開頭。回傳 (互動點, state) 或 (None, state)"""
    its = await pg.evaluate(ITS, filt)
    if near_pt and its: its.sort(key=lambda q: math.hypot(q['x'] - near_pt[0], q['z'] - near_pt[1]))
    if not R.check('%s 有互動點「%s」（%s）' % (tag, label0, filt), bool(its), J(its)):
        s = await st(pg); cand = await pg.evaluate(NEAR_ITS, [s['x'], s['z'], 40]); R.note('%s 40 m 內的互動點（候選）：%s' % (tag, J(cand)))
        return None, s
    it = its[0]; R.note('%s 「%s」在 (%s, %s) r %s（同條件的 %d 個：%s）' % (tag, it['label'], it['x'], it['z'], it['r'], len(its), J(its[:4])))
    s = await st(pg)
    if s['interact'].startswith(label0): return it, s
    tgt = await standable_near(pg, it['x'], it['z'], it['r'] * 0.6, it['lv'])
    if not R.check('%s 「%s」範圍裡有站得住的地方' % (tag, label0), bool(tgt), J(it)): return it, s
    await L.go_to(pg, cdp, R, tgt['x'], tgt['z'], 0.3, '%s %s' % (tag, label0), max_s=max_s, lv=it['lv'])
    s = await settle(pg)
    if not s['interact'].startswith(label0):
        await L.go_to(pg, cdp, R, it['x'], it['z'], 0.5, '%s %s（往中心）' % (tag, label0), max_s=90, lv=it['lv']); s = await settle(pg)
    for _ in range(8):
        if s['interact'].startswith(label0): break
        await pg.wait_for_timeout(500); s = await st(pg)
    R.check('%s 走到那裡，互動鍵是「%s」' % (tag, label0), s['interact'].startswith(label0), J({k: s[k] for k in ('zone', 'x', 'z', 'lv', 'interact', 'stand', 'fb')}))
    return it, s


async def pushable(pg, cdp):
    for dx, dy in ((0, 60), (60, 0), (-60, 0), (0, -60)):
        moved, _, _ = await L.push_until(pg, cdp, dx, dy, 0.3, max_pushes=2)
        if moved >= 0.3: return round(moved, 2)
    return 0.0


# ---------------------------------------------------------------- 1 exit
async def case_exit(pg, cdp, errs):
    n0 = len(errs)
    s = await load(pg, cdp, 'campus', DAY, 14.0, MID[0], MID[1], 0.0, why='映月湖和博思中間那條步道')
    R.check('exit 起點 (−50,−98) 站得住', bool(s['stand']), J(s)); fb0 = s['fb']
    ex = await pg.evaluate(ITS, "i.exit&&i.exit.to==='xinsheng'")
    R.note('exit 往新生南路的出口：%s' % J(ex))
    if not R.check('exit 校園有往新生南路的出口', bool(ex), J(ex)):
        cand = await pg.evaluate(NEAR_ITS, [GATE[0], GATE[1], 60]); R.note('exit 側門 60 m 內的互動點（候選）：%s' % J(cand)); return
    e = ex[0]
    R.check('exit 出口在北牆（z −141 往內 2.5 m 內）、靠西北角 x −110～−90，不在西牆（x < −118 是公館那一側）', -141.5 < e['z'] < -138.5 and -110 < e['x'] < -90, J(e))
    xsg = await pg.evaluate("(()=>typeof Z3!=='undefined'&&Z3.XSG?{x:Z3.XSG.x,z:Z3.XSG.z,gw:Z3.XSG.gw,gym:Z3.XSG.gym,xh:Z3.XSG.xh}:null)()")
    R.note('exit Z3.XSG：%s' % J(xsg))
    # 先走到門內小廣場 (−101.4, −135.5)：截圖「走出側門時」（鏡頭在南邊往北看，門洞外是新生南路）
    tgt = await standable_near(pg, GATE[0], -135.5, 1.5)
    if not R.check('exit 側門內 (−101.4, −135.5) 附近有站得住的點', bool(tgt), ''): return
    ok = await L.go_to(pg, cdp, R, tgt['x'], tgt['z'], 0.6, 'exit 走到側門內 (−101.4, −135.5)', max_s=420)
    s = await settle(pg)
    R.check('exit 從映月湖和博思中間真的走到側門內（沒有被放到目的地）', bool(ok) and s['fb'] == fb0 and math.hypot(s['x'] - tgt['x'], s['z'] - tgt['z']) < 1.0, J(s))
    await cam_yaw(pg, 0.0); await shot(pg, 'exit_1_gate_north')
    it, s = await walk_it(pg, cdp, 'exit', "i.exit&&i.exit.to==='xinsheng'", '往新生南路')
    if not s['interact'].startswith('往新生南路'): return
    await shot(pg, 'exit_2_at_gate', hud=True, judge_black=False)
    await L.tap(pg, cdp, '#interact'); s = await wait_zone(pg, cdp, 'xinsheng'); await pg.wait_for_timeout(3000); s = await settle(pg)
    R.check('exit 按下去到了新生南路（xinsheng）、站得住', s['zone'] == 'xinsheng' and bool(s['stand']), J(s))
    if s['zone'] != 'xinsheng': return
    sp = await pg.evaluate("(()=>typeof XINSHENG_LAYOUT!=='undefined'?XINSHENG_LAYOUT.sideGate.spawn:null)()")
    R.check('exit 落在新生南路側門前 %s（0.6 m 內）' % J(sp), bool(sp) and math.hypot(s['x'] - sp['x'], s['z'] - sp['z']) <= 0.6, J(s))
    # 走得到新生南路：走到人行道上（側門往北 8 m）
    tgt = await standable_near(pg, 13.5, 2.0, 2.0)
    if R.check('exit 新生南路人行道 (13.5, 2) 附近有站得住的點', bool(tgt), ''):
        ok = await L.go_to(pg, cdp, R, tgt['x'], tgt['z'], 0.6, 'exit 走到新生南路人行道', max_s=240); s = await settle(pg)
        R.check('exit 在新生南路上真的走得動（到人行道、沒有被放到目的地）', bool(ok) and s['fb'] == fb0, J(s))
    await cam_yaw(pg, -1.5708); await shot(pg, 'exit_3_xinsheng_lookback')   # 鏡頭在西邊、往東看側門
    await cam_yaw(pg, 3.1416); await shot(pg, 'exit_4_xinsheng_south_ref')   # 參考：往南（公館方向）看
    R.note('exit【人工看】exit_1（側門往北看出去）、exit_3（新生南路回頭看側門）：校門外不應該看到公館的店面街／騎樓；exit_4 只是參考')
    it, s = await walk_it(pg, cdp, 'exit 回程', "i.exit&&i.exit.to==='campus'", '回到首都帝大')
    if s['interact'].startswith('回到首都帝大'):
        await L.tap(pg, cdp, '#interact'); s = await wait_zone(pg, cdp, 'campus'); await pg.wait_for_timeout(3000); s = await settle(pg)
        R.check('exit 回到校園、落在側門內 (−101.4, −137.2) 0.6 m 內、站得住', s['zone'] == 'campus' and bool(s['stand']) and math.hypot(s['x'] - GATE_IN[0], s['z'] - GATE_IN[1]) <= 0.6, J(s))
        mv = await pushable(pg, cdp); R.check('exit 回來以後推得動（≥0.3 m）', mv >= 0.3, str(mv))
    s = await st(pg); R.check('exit walkFallbacks 沒有增加（%s → %s）' % (fb0, s['fb']), s['fb'] == fb0, '')
    R.check('exit 沒有 JS 例外', not errs_since(errs, n0), J(errs_since(errs, n0)[:3]))


# ---------------------------------------------------------------- 2 gymdoor
async def door_here(pg, tag):
    """體育館門口（door:'gym'）在 (−75, −125) 1 m 內才走過去；不在（改前在 (74, 59.4)）就不走（橫越整個校園沒有意義），FAIL 附位置"""
    its = await pg.evaluate(ITS, "i.door==='gym'")
    its.sort(key=lambda q: math.hypot(q['x'] - DOOR[0], q['z'] - DOOR[1]))
    ok = bool(its) and math.hypot(its[0]['x'] - DOOR[0], its[0]['z'] - DOOR[1]) <= 1.0
    R.check('%s 體育館門口互動點（door gym）在 (−75, −125)（1 m 內）' % tag, ok, J(its))
    if not ok:
        cand = await pg.evaluate(NEAR_ITS, [DOOR[0], DOOR[1], 15]); R.note('%s (−75, −125) 15 m 內的互動點（候選）：%s' % (tag, J(cand)))
        lab = await pg.evaluate(ITS, "/體育館/.test(i.label||'')"); R.note('%s label 有「體育館」的互動點：%s' % (tag, J(lab)))
    return ok


async def enter_gym_and_out(pg, cdp, tag, fb0):
    if not await door_here(pg, tag): return False
    it, s = await walk_it(pg, cdp, tag, "i.door==='gym'", '體育館', near_pt=DOOR, max_s=420)
    if not it or not s['interact'].startswith('體育館'): return False
    await cam_yaw(pg, 0.0); await shot(pg, 'gymdoor_1_front')
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
    s = await st(pg)
    if s['choices']:
        R.note('%s 門口選單：%s' % (tag, J(s['choices'])))
        k = next((i for i, o in enumerate(s['choices']) if o.startswith('進館')), 0); await pick(pg, cdp, k)
    s = await wait_zone(pg, cdp, 'gym'); await pg.wait_for_timeout(3000); s = await settle(pg)
    gsp = await pg.evaluate("(()=>typeof GYM_LAYOUT!=='undefined'?{spawn:GYM_LAYOUT.spawn,exit:GYM_LAYOUT.exit,enterAt:GYM_LAYOUT.enterAt}:null)()")
    R.note('%s GYM_LAYOUT：%s' % (tag, J(gsp)))
    R.check('%s 按「體育館」進館（zone gym、站得住）' % tag, s['zone'] == 'gym' and bool(s['stand']), J(s))
    if s['zone'] != 'gym':
        cand = await pg.evaluate(NEAR_ITS, [s['x'], s['z'], 6]); R.note('%s 沒進館：附近互動點 %s' % (tag, J(cand))); return False
    if gsp: R.check('%s 館內落點在 GYM_LAYOUT.spawn %s 0.6 m 內' % (tag, J(gsp['spawn'])), math.hypot(s['x'] - gsp['spawn']['x'], s['z'] - gsp['spawn']['z']) <= 0.6, J(s))
    await shot(pg, 'gymdoor_2_inside')
    it, s = await walk_it(pg, cdp, tag + ' 出館', "i.exit&&i.exit.to==='campus'", '離開體育館')
    if not s['interact'].startswith('離開體育館'): return False
    await L.tap(pg, cdp, '#interact'); s = await wait_zone(pg, cdp, 'campus'); await pg.wait_for_timeout(3000); s = await settle(pg)
    d = math.hypot(s['x'] - DOOR_OUT[0], s['z'] - DOOR_OUT[1])
    R.check('%s 出館以後站在 (−75, −123.4) 0.3 m 內（離 %.2f m）、站得住' % (tag, d), s['zone'] == 'campus' and d <= 0.3 and bool(s['stand']), J(s))
    R.note('%s 出館面向 ry %s（配置 yaw 0＝面向南）；GY3.CAMPUS %s' % (tag, s['ry'], J(await pg.evaluate("(()=>typeof GY3!=='undefined'&&GY3.CAMPUS?GY3.CAMPUS:null)()"))))
    await cam_yaw(pg, 0.0); await shot(pg, 'gymdoor_3_out')
    mv = await pushable(pg, cdp); s = await st(pg)
    R.check('%s 出館以後推得動 ≥0.3 m、沒有被放到目的地' % tag, mv >= 0.3 and s['fb'] == fb0, J({'moved': mv, 'fb': s['fb']}))
    return True


async def case_gymdoor(pg, cdp, errs):
    n0 = len(errs)
    s = await load(pg, cdp, 'campus', DAY, 10.5, PATH_W[0], PATH_W[1], 0.0, why='往體育館的步道（映月湖和博思中間往西那一條）')
    R.check('gymdoor 起點 (−80,−98) 站得住', bool(s['stand']), J(s)); fb0 = s['fb']
    await enter_gym_and_out(pg, cdp, 'gymdoor', fb0)
    s = await st(pg); R.check('gymdoor walkFallbacks 沒有增加（%s → %s）' % (fb0, s['fb']), s['fb'] == fb0, '')
    R.check('gymdoor 沒有 JS 例外', not errs_since(errs, n0), J(errs_since(errs, n0)[:3]))


# ---------------------------------------------------------------- 3 map
PINS_JS = r"""(()=>{ const svg=document.querySelector('#phoneBody svg[data-pmapsvg]')||document.querySelector('svg[data-pmapsvg]'); if(!svg) return null; svg.scrollIntoView({block:'center'});
  const pins=[...svg.querySelectorAll('g[data-pmap]')].map(g=>{ const c=g.querySelector('circle'); const r=c.getBoundingClientRect(); return {id:g.getAttribute('data-pmap'), cx:+c.getAttribute('cx'), cy:+c.getAttribute('cy'), sx:+(r.left+r.width/2).toFixed(1), sy:+(r.top+r.height/2).toFixed(1), text:(g.textContent||'').trim()}; });
  const rings=[...svg.children].filter(c=>c.tagName.toLowerCase()==='circle'&&c.getAttribute('r')==='11').map(c=>({cx:+c.getAttribute('cx'),cy:+c.getAttribute('cy')}));
  const world=typeof PLACEMAP!=='undefined'?PLACEMAP.PINS.filter(p=>p.cx!=null).map(p=>({id:p.id,cx:p.cx,cz:p.cz,m:p.m})):null;
  return {attr:svg.getAttribute('data-pmapsvg'), pins, rings, world, door:(typeof CLS!=='undefined'&&CLS.DOORS&&CLS.DOORS.gym)?{x:CLS.DOORS.gym.x,z:CLS.DOORS.gym.z}:null}; })()"""


async def case_map(pg, cdp, errs):
    n0 = len(errs)
    s = await load(pg, cdp, 'campus', DAY, 10.5, -78.0, -122.8, 0.0, why='體育館門前（看「你在這裡」的紅圈）')
    if not s['stand']:
        t = await standable_near(pg, -78.0, -122.8, 3.0); R.note('map 起點站不住，附近站得住的：%s' % J(t))
    ok = await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1200)
    R.check('map 按得到手機按鈕 #btnPhone', ok, '')
    ok = await L.tap(pg, cdp, '#phoneTabs [data-ptab="places"]'); await pg.wait_for_timeout(1800)
    R.check('map 按得到「地點」頁籤', ok, '')
    m = await pg.evaluate(PINS_JS)
    if not R.check('map 地點頁有地圖（svg[data-pmapsvg]）', bool(m), ''):
        tabs = await pg.evaluate("[...document.querySelectorAll('#phoneTabs button')].map(b=>b.dataset.ptab+':'+(b.textContent||'').trim())")
        body = await pg.evaluate("((document.getElementById('phoneBody')||{}).innerText||'').slice(0,300)")
        R.note('map 頁籤 %s；#phoneBody 開頭：%s' % (J(tabs), J(body))); await shot(pg, 'map_0_nomap', hud=True, judge_black=False); await close_panels(pg, cdp); return
    R.note('map 圖釘：%s；紅圈：%s' % (J([[p['id'], p['cx'], p['cy']] for p in m['pins']]), J(m['rings'])))
    g = next((p for p in m['pins'] if p['id'] == 'gym'), None)
    R.check('map 體育館自己一顆圖釘（g[data-pmap="gym"]）', bool(g), J(m['attr']))
    W = {w['id']: w for w in (m['world'] or [])}; gw = W.get('gym')
    R.check('map 體育館圖釘的世界座標 %s 對到門口 %s（3 m 內）' % (J(gw and [gw['cx'], gw['cz']]), J(m['door'])), bool(gw) and bool(m['door']) and math.hypot(gw['cx'] - m['door']['x'], gw['cz'] - m['door']['z']) <= 3.0, '')
    dorm = W.get('dorm') or next((p for p in (await pg.evaluate("(()=>typeof PLACEMAP!=='undefined'?PLACEMAP.PINS.filter(p=>p.id==='dorm'):[])()")) or []), None)
    R.check('map 宿舍圖釘不再包含體育館', bool(dorm) and not any(x[0] == 'gym' for x in dorm.get('m', [])), J(dorm and dorm.get('m')))
    if g and gw:
        bad, used = [], []
        for p in m['pins']:
            w = W.get(p['id'])
            if p['id'] == 'gym' or not w: continue
            dxw, dzw, dxm, dym = gw['cx'] - w['cx'], gw['cz'] - w['cz'], g['cx'] - p['cx'], g['cy'] - p['cy']
            for nm, a, b in (('東西', dxw, dxm), ('南北', dzw, dym)):
                if abs(a) < 8: continue
                used.append(p['id'] + nm)
                if (a > 0) != (b > 0): bad.append('%s %s：世界 %+.0f m、圖上 %+.0f' % (p['id'], nm, a, b))
        R.check('map 體育館圖釘和其他圖釘的相對方位跟世界座標一致（%d 組）' % len(used), not bad and bool(used), '；'.join(bad))
        R.check('map 「你在這裡」紅圈在體育館圖釘上（人站在體育館門前）', any(abs(r['cx'] - g['cx']) < 0.5 and abs(r['cy'] - g['cy']) < 0.5 for r in m['rings']), J(m['rings']))
        await shot(pg, 'map_1_places', hud=True, judge_black=False)
        await L.touch_tap(cdp, g['sx'], g['sy']); await pg.wait_for_timeout(1500)
        body = await pg.evaluate("((document.getElementById('phoneBody')||{}).innerText||'')")
        R.check('map 點體育館圖釘，下面列出「新體育館」', '新體育館' in body, J(body[:200]))
        await shot(pg, 'map_2_gym_pin', hud=True, judge_black=False)
    await close_panels(pg, cdp)
    R.check('map 沒有 JS 例外', not errs_since(errs, n0), J(errs_since(errs, n0)[:3]))


# ---------------------------------------------------------------- 4 pe
FIND_PE = r"""((o)=>{ const G=GAME.G; if(typeof CLS==='undefined') return {why:'沒有 CLS'}; const R=CLS.rec(G), swim=(CLS.PE_SWIM&&CLS.PE_SWIM.pe_y1s1)||[]; let first=null;
  for(let d=G.day; d<=G.day+o.span; d++){ let its=[]; try{ its=CLS.dayItems(G,d); }catch(e){ continue; }
    for(const it of its){ if(!it.room||it.room.door!=='gym'||it.exam||R.done[it.key]) continue; const q={day:d,key:it.key,t0:it.t0,t1:it.t1,week:it.week,cid:it.c.id,swim:swim.includes(it.week)};
      if(!first) first=q; if(!q.swim) return q; } }
  return first||{why:'找不到體育課'}; })"""


async def case_pe(pg, cdp, errs):
    n0 = len(errs)
    sv = await pg.evaluate("fetch(%s).then(r=>r.ok?r.json():null).catch(()=>null)" % J(FIX))
    if sv:
        R.setup('【前置／捷徑】讀使用者存檔 %s（day %s），先放在校園找下一堂體育課（CLS.dayItems，不改狀態）' % (FIX, sv.get('day')))
        sv['zone'] = 'campus'; sv['pos'] = {'x': -78.0, 'z': -122.8, 'yaw': 0.0, 'lv': 0}; sv['weather'] = 'clear'
        b = sv.get('bike') if isinstance(sv.get('bike'), dict) else {}
        sv['bike'] = dict(b, riding=False, zone='campus', x=25, z=57.9, yaw=1.5708, fix=False)   # 存檔是騎著的：改成停在宿舍門口（只測走路上課）
        await apply_fixture(pg, cdp, sv, quiet=True)
    else:
        R.note('pe 讀不到 %s：改用預設存檔' % FIX); await load(pg, cdp, 'campus', DAY, 10.0, -78.0, -122.8)
    pe = await pg.evaluate(FIND_PE, {'span': 120})
    R.note('pe 下一堂體育課：%s' % J(pe))
    if not R.check('pe 找得到下一堂體育課（pe_y1s1，星期一 pm2，GYM）', bool(pe) and 'day' in pe, J(pe)): return
    h0 = round(pe['t0'] - 0.25, 3)
    if sv:
        R.setup('【前置／捷徑】同一份存檔改成 day %s（第 %s 週%s）%05.2f（開始前 15 分鐘）、站在體育館門前 (−82, −123)；條件事件、手機自動打開關掉' % (pe['day'], pe['week'], '、游泳週' if pe['swim'] else '', h0))
        di = await day_info(pg, pe['day']); sv['day'] = pe['day']; sv['hour'] = h0; sv['pos'] = {'x': -82.0, 'z': -123.0, 'yaw': 0.0, 'lv': 0}
        if di: sv['weekday'] = di['wd']
        s = await apply_fixture(pg, cdp, sv, quiet=True)
    else:
        s = await load(pg, cdp, 'campus', pe['day'], h0, -82.0, -123.0)
    R.note('pe 起點：%s' % J(s)); fb0 = s['fb']; t_start = s['day'] * 24 + s['hour']
    if not await door_here(pg, 'pe'): return
    it, s = await walk_it(pg, cdp, 'pe', "i.door==='gym'", '體育館', near_pt=DOOR, max_s=300)
    if not s['interact'].startswith('體育館'): return
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500); s = await st(pg)
    R.note('pe 門口選單：%s' % J(s['choices']))
    k = next((i for i, o in enumerate(s['choices']) if o.startswith('進去上課')), None)
    if not R.check('pe 門口選單有「進去上課：體育」', k is not None, J(s['choices'])):
        await shot(pg, 'pe_0_menu', hud=True, judge_black=False); await drain(pg, cdp, prefer=('不上了',), max_s=20); return
    await shot(pg, 'pe_1_menu', hud=True, judge_black=False)
    await pick(pg, cdp, k)
    want = 'gym_b1' if pe['swim'] else 'gym'
    t0 = time.time()
    while time.time() - t0 < 60:
        s = await st(pg)
        if s['zone'] in ('gym', 'gym_b1'): break
        await pg.wait_for_timeout(500)
    R.check('pe 選了以後進館（%s；游泳週＝gym_b1，B1 休館照舊 gym）' % want, s['zone'] in ('gym', 'gym_b1'), J(s))
    await pg.wait_for_timeout(2500); await shot(pg, 'pe_2_in_class', hud=True)
    lines, picked = await drain(pg, cdp, max_s=240, quiet_s=4.0)
    R.note('pe 課堂台詞（%d 句）：%s；選過：%s' % (len(lines), J(lines[:20]), J(picked)))
    s = await settle(pg); await pg.wait_for_timeout(1000); s = await st(pg)
    done = await pg.evaluate("(k=>{ try{ return !!CLS.rec(GAME.G).done[k]; }catch(e){ return null; } })(%s)" % J(pe['key']))
    t_end = s['day'] * 24 + s['hour']
    R.check('pe 上完：出席紀錄有這一堂（%s）' % pe['key'], done is True, J(done))
    R.check('pe 時間往前（%.2f → %.2f，至少 0.25 小時）' % (t_start, t_end), t_end - t_start >= 0.25, J({k_: s[k_] for k_ in ('day', 'hour')}))
    spot = await pg.evaluate("(z=>{ const q=z==='gym_b1'?CLS.PE_POOL:CLS.PE_IN_GYM; return q?{x:q.x,z:q.z}:null; })(%s)" % J(s['zone']))
    dd = math.hypot(s['x'] - spot['x'], s['z'] - spot['z']) if spot else 99
    R.check('pe 下課後人在合理位置：%s 裡、站得住、離上課站位 %s %.2f m（≤ 3）、沒有對話卡著' % (s['zone'], J(spot), dd), s['zone'] in ('gym', 'gym_b1') and bool(s['stand']) and dd <= 3 and not s['dlg'] and not s['choices'] and not s['busy'], J(s))
    await shot(pg, 'pe_3_after', hud=True)
    mv = await pushable(pg, cdp); R.check('pe 下課後推得動（≥0.3 m）', mv >= 0.3, str(mv))
    if s['zone'] == 'gym':
        it, s = await walk_it(pg, cdp, 'pe 下課出館', "i.exit&&i.exit.to==='campus'", '離開體育館')
        if s['interact'].startswith('離開體育館'):
            await L.tap(pg, cdp, '#interact'); s = await wait_zone(pg, cdp, 'campus'); await pg.wait_for_timeout(2500); s = await settle(pg)
            R.check('pe 走出館回到校園 (−75, −123.4) 0.3 m 內', s['zone'] == 'campus' and math.hypot(s['x'] - DOOR_OUT[0], s['z'] - DOOR_OUT[1]) <= 0.3, J(s))
    else:
        R.note('pe 在 B1 游泳池上課：出館要先上樓（這支不走），只看站得住、推得動')
    s = await st(pg); R.check('pe walkFallbacks 0（%s → %s）' % (fb0, s['fb']), s['fb'] == fb0, '')
    R.check('pe 沒有 JS 例外', not errs_since(errs, n0), J(errs_since(errs, n0)[:3]))


# ---------------------------------------------------------------- 5 bike
async def case_bike(pg, cdp, errs):
    n0 = len(errs)
    bk = {'zone': 'campus', 'x': -87.0, 'z': -123.8, 'yaw': 1.5708, 'riding': False, 'kind': 'city', 'color': None, 'owned': [{'kind': 'city', 'color': None}], 'fix': False}
    s = await load(pg, cdp, 'campus', DAY, 10.5, -91.0, -123.5, 0.0, extra={'bike': bk}, why='自己的車停在體育館門前西邊 (−87, −123.8)')
    ok_bk = await pg.evaluate("(()=>{ const E=GAME.E; return E.canStand?E.canStand(-87,-123.8,0.45,0):null; })()")
    if not ok_bk:
        alt = await standable_near(pg, -87.0, -123.8, 3.0)
        R.note('bike 車的位置 (−87, −123.8) 站不住（%s），改放 %s 再讀一次' % (ok_bk, J(alt)))
        if alt:
            bk['x'], bk['z'] = alt['x'], alt['z']; s = await load(pg, cdp, 'campus', DAY, 10.5, -91.0, -123.5, 0.0, extra={'bike': bk}, why='車放到站得住的地方')
    fb0 = s['fb']
    racks = await pg.evaluate("(()=>typeof Z3!=='undefined'&&Z3.BIKE_RACKS?Z3.BIKE_RACKS.campus:null)()")
    rk = min(racks or [], key=lambda r: math.hypot(r[0] - RACK[0], r[1] - RACK[1]), default=None)
    R.check('bike 體育館門前有停車架（Z3.BIKE_RACKS.campus 有 (−68, −123) 一座；離門口 10 m 內）', bool(rk) and math.hypot(rk[0] - RACK[0], rk[1] - RACK[1]) < 0.5 and math.hypot(rk[0] - DOOR[0], rk[1] - DOOR[1]) < 10, J(racks))
    for _ in range(20):
        if await pg.evaluate(ITS, "i.bike"): break
        await pg.wait_for_timeout(1000)
    it, s = await walk_it(pg, cdp, 'bike', "i.bike", '騎腳踏車')
    if not s['interact'].startswith('騎腳踏車'): return
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2000); s = await st(pg)
    if not R.check('bike 按「騎腳踏車」上車（player.riding）', s['riding'], J(s)): return
    q = await pg.evaluate("(()=>typeof BIKE!=='undefined'&&BIKE.legalSpot?BIKE.legalSpot(GAME.E,'campus',%s,%s):null)()" % RACK)
    R.note('bike 停車架 (−68, −123) 最近的合法停車位：%s' % J(q))
    if not R.check('bike 停車架旁有合法停車位（4 m 內）', bool(q) and q['d'] <= 4.0, J(q)): return
    ok = await L.go_to(pg, cdp, R, q['x'], q['z'], 0.5, 'bike 騎到停車架旁 (%.2f, %.2f)' % (q['x'], q['z']), max_s=240)
    s = await settle(pg)
    R.check('bike 騎得到停車架旁（0.5 m 內、還在騎、沒有被放到目的地）', bool(ok) and s['riding'] and s['fb'] == fb0, J(s))
    await cam_yaw(pg, 0.6); await shot(pg, 'bike_1_riding_at_rack')
    ok = await L.tap(pg, cdp, '#btnBike'); await pg.wait_for_timeout(2000); s = await st(pg)
    R.check('bike 按「下車」（#btnBike）下車', ok and not s['riding'], J(s))
    pk = await pg.evaluate("(()=>{ const G=GAME.G, b=G.bike||{}; return {zone:b.zone,x:b.x,z:b.z,yaw:b.yaw,riding:b.riding, ok:typeof BIKE!=='undefined'&&BIKE.parkOK?BIKE.parkOK(GAME.E,{x:b.x,z:b.z,yaw:b.yaw||0}):null}; })()")
    dq = math.hypot(pk['x'] - q['x'], pk['z'] - q['z']) if pk.get('x') is not None else 99
    R.check('bike 車停在停車架旁（離合法停車位 %.2f m ≤ 1.0、離架子 ≤ 4 m、BIKE.parkOK）' % dq, pk['zone'] == 'campus' and not pk['riding'] and dq <= 1.0 and math.hypot(pk['x'] - RACK[0], pk['z'] - RACK[1]) <= 4.0 and pk['ok'] is not False, J(pk))
    its = await pg.evaluate(ITS, "i.bike")
    R.check('bike 停好的車有「騎腳踏車」互動點（在車的位置 0.5 m 內）', any(math.hypot(i['x'] - pk['x'], i['z'] - pk['z']) < 0.5 for i in its), J(its))
    await cam_yaw(pg, 0.6); await shot(pg, 'bike_2_parked')
    mv = await pushable(pg, cdp); s = await st(pg)
    R.check('bike 下車以後站得住、推得動', bool(s['stand']) and mv >= 0.3, J({'moved': mv, 'stand': s['stand']}))
    s = await st(pg); R.check('bike walkFallbacks 沒有增加（%s → %s）' % (fb0, s['fb']), s['fb'] == fb0, '')
    R.check('bike 沒有 JS 例外', not errs_since(errs, n0), J(errs_since(errs, n0)[:3]))


# ---------------------------------------------------------------- 6 pool
POOL_DIAG = r"""(()=>{ const G=GAME.G, X=typeof SISB13!=='undefined'?SISB13:null, ev=(typeof STORY_EVENTS!=='undefined'?STORY_EVENTS:[]).find(e=>e.id==='ev_sis13_pool')||null;
  const sf=(f)=>{ try{ return f(); }catch(e){ return 'err:'+e.message; } };
  return {ev:ev?{near:ev.near,time:ev.time,weekday:ev.weekday,location:ev.location}:null, poolOk:X?sf(()=>X.poolOk(G)):null, stage:sf(()=>SOCIAL.stage('heroine_05')),
    dating:X?sf(()=>X.dating(G)):null, isEx:X?sf(()=>X.isEx(G)):null, route:sf(()=>STORY.route?STORY.route(G):null), abroad:sf(()=>STORY.abroad?STORY.abroad(G):null),
    reach:sf(()=>STORY.reachable?STORY.reachable('heroine_05',G):null), met:!!(G.flags&&G.flags.met_sis), stageLaw:G.stage, day:G.day, hour:G.hour, weekday:G.weekday,
    done:!!(G.events&&G.events.done&&G.events.done.ev_sis13_pool), flag:G.flags?G.flags.SIS13_POOL:null}; })()"""


async def case_pool(pg, cdp, errs):
    n0 = len(errs)
    d = await day_of_key(pg, '2029-05-08')
    di = await day_info(pg, d) if d is not None else None
    if not R.check('pool 2029-05-08 是第幾天（%s）、星期二（%s）' % (d, J(di)), d is not None and bool(di) and di['wd'] == 2, ''): return
    fl = {'EXCHANGE_ROUTE': 'TW', 'EXCH_RULE': 1, 'met_sis': True, 'SIS_W1': True}
    s = await load(pg, cdp, 'campus', d, 8.02, PATH_W[0], PATH_W[1], 0.0, flags=fl, quiet=False, why='學姊：認識（met_sis、SIS_W1）、臺灣路線（EXCHANGE_ROUTE TW，同 tests/aa512_sis_b13_unit.js 的 fresh）')
    R.setup('【前置／捷徑】學姊的關係設成朋友（SOCIAL.rel heroine_05：fam ≥45、trust ≥30、FIRST_MET＝tests/pg_harness.js 的 H.FRIEND），加聯絡人')
    await pg.evaluate("(()=>{ const r=SOCIAL.rel('heroine_05'); r.fam=Math.max(r.fam||0,45); r.trust=Math.max(r.trust||0,30); try{ SOCIAL.remember('heroine_05','FIRST_MET',''); }catch(e){} try{ if(typeof INV!=='undefined'&&INV.addContact) INV.addContact(GAME.G,'heroine_05'); }catch(e){} })()")
    dg = await pg.evaluate(POOL_DIAG); R.note('pool 條件：%s' % J(dg))
    R.check('pool 事件 ev_sis13_pool 的觸發位置在新門口 (−75, −123.4) r 7', bool(dg['ev']) and bool(dg['ev']['near']) and math.hypot(dg['ev']['near']['x'] - DOOR_OUT[0], dg['ev']['near']['z'] - DOOR_OUT[1]) <= 1.0, J(dg['ev']))
    R.check('pool 前置條件成立（SISB13.poolOk）', dg['poolOk'] is True, J(dg))
    R.check('pool 起點離觸發點 > 7 m（%.1f m），還沒演' % math.hypot(s['x'] - DOOR_OUT[0], s['z'] - DOOR_OUT[1]), math.hypot(s['x'] - DOOR_OUT[0], s['z'] - DOOR_OUT[1]) > 7.5 and not dg['done'], J(s))
    await pg.wait_for_timeout(3000); s = await st(pg)
    R.check('pool 站在起點 3 秒沒有觸發（離得遠）', '新體育館門口' not in s['dtext'], J(s)); fb0 = s['fb']
    hit = lambda q: '新體育館門口' in (q.get('dtext') or '')
    await L.go_to(pg, cdp, R, DOOR_OUT[0], DOOR_OUT[1] + 1.6, 0.8, 'pool 從步道走到體育館門口', max_s=420, stop=hit)
    s = await st(pg)
    dist = math.hypot(s['x'] - DOOR_OUT[0], s['z'] - DOOR_OUT[1])
    if not hit(s):
        dg = await pg.evaluate(POOL_DIAG)
        R.check('pool 走到門口 7 m 內學姊的事件開始（「（新體育館門口。…」）', dg['done'], J({'state': s, 'diag': dg}))
        if not dg['done']: await shot(pg, 'pool_0_none', hud=True); return
    else:
        R.check('pool 走到門口 7 m 內（%.2f m）、08:00～08:40（%.2f）學姊的事件開始' % (dist, s['hour']), dist <= 7.6 and 8.0 <= s['hour'] <= 8.7, J(s))
        await shot(pg, 'pool_1_start', hud=True)
    lines, picked = await drain(pg, cdp, max_s=180, quiet_s=4.0)
    R.note('pool 台詞（%d 句）：%s；選過：%s' % (len(lines), J(lines[:24]), J(picked)))
    dg = await pg.evaluate(POOL_DIAG)
    R.check('pool 演完：events.done.ev_sis13_pool、flags.SIS13_POOL', dg['done'] and dg['flag'] is True, J(dg))
    s = await settle(pg); await shot(pg, 'pool_2_after', hud=True)
    R.check('pool 演完以後站得住、沒有對話卡著', bool(s['stand']) and not s['dlg'] and not s['choices'], J(s))
    s = await st(pg); R.check('pool walkFallbacks 沒有增加（%s → %s）' % (fb0, s['fb']), s['fb'] == fb0, '')
    R.check('pool 沒有 JS 例外', not errs_since(errs, n0), J(errs_since(errs, n0)[:3]))


# ---------------------------------------------------------------- 7 oldsite
GYMEXT = r"""(()=>{ const out=[]; GAME.E.scene.traverse(o=>{ const u=o.userData||{}; if(u.ckTag==='gym_ext'||/^gym/i.test(o.name||'')){ const b=new THREE.Box3().setFromObject(o); if(b.isEmpty()) return; const c=b.getCenter(new THREE.Vector3()); out.push({name:o.name||'', tag:u.ckTag||null, x:+c.x.toFixed(1), z:+c.z.toFixed(1)}); } }); return out.slice(0,20); })()"""


async def case_oldsite(pg, cdp, errs):
    n0 = len(errs)
    s = await load(pg, cdp, 'campus', DAY, 10.5, 74.0, 54.0, 3.1416, why='舊體育館門口 (74, 59.4) 北邊 5 m')
    if not s['stand']:
        t = await standable_near(pg, 74.0, 54.0, 4.0); R.note('oldsite 起點站不住，附近站得住的：%s' % J(t))
        if t: s = await load(pg, cdp, 'campus', DAY, 10.5, t['x'], t['z'], 3.1416, why='換到站得住的起點')
    fb0 = s['fb']
    for nm, p in (('舊門口 (74, 59.4)', OLD_DOOR), ('舊館 (74, 68)', OLD_HALL)):
        near = await pg.evaluate(NEAR_ITS, [p[0], p[1], 6.0])
        bad = [i for i in near if i['door'] == 'gym' or (i['to'] or '').startswith('gym') or '體育館' in i['label']]
        R.note('oldsite %s 6 m 內的互動點：%s' % (nm, J(near)))
        R.check('oldsite %s 6 m 內沒有體育館的入口互動點' % nm, not bad, J(bad))
    gx = await pg.evaluate(GYMEXT); R.note('oldsite 場景裡 gym_ext／gym* 物件：%s' % J(gx))
    R.check('oldsite 體育館外觀（gym_ext）不在舊位置 (74, 68) 20 m 內', not any(math.hypot(o['x'] - OLD_HALL[0], o['z'] - OLD_HALL[1]) < 20 for o in gx if o['tag'] == 'gym_ext'), J(gx))
    tgt = await standable_near(pg, OLD_DOOR[0], OLD_DOOR[1] - 0.8, 1.5)
    if tgt:
        ok = await L.go_to(pg, cdp, R, tgt['x'], tgt['z'], 0.4, 'oldsite 走到舊門口前 (%.2f, %.2f)' % (tgt['x'], tgt['z']), max_s=180)
        s = await settle(pg); await pg.wait_for_timeout(800); s = await st(pg)
        R.check('oldsite 走到舊門口前，互動鍵不是「體育館」（現在是：%s）' % J(s['interact']), bool(ok) and not s['interact'].startswith('體育館'), J(s))
    else: R.note('oldsite 舊門口前沒有站得住的點（只看互動點清單）')
    await cam_yaw(pg, 3.1416); await shot(pg, 'oldsite_1_game_cam')
    await D.user_shot(pg, cdp, '%s_oldsite_2_front' % TAG, {'eye': [74.0, 6.0, 44.0], 'look': [74.0, 7.0, 68.0], 'lens': 24})
    await D.user_shot(pg, cdp, '%s_oldsite_3_side' % TAG, {'eye': [56.0, 9.0, 50.0], 'look': [74.0, 7.0, 68.0], 'lens': 24})
    await pg.set_viewport_size({'width': 844, 'height': 390}); await pg.wait_for_timeout(800)
    R.note('oldsite【人工看】oldsite_2／_3：(74, 68) 是一棟沒有名字的系館（不寫「體育館」）')
    s = await st(pg); R.check('oldsite walkFallbacks 沒有增加（%s → %s）' % (fb0, s['fb']), s['fb'] == fb0, '')
    R.check('oldsite 沒有 JS 例外', not errs_since(errs, n0), J(errs_since(errs, n0)[:3]))


FUN = {'exit': case_exit, 'gymdoor': case_gymdoor, 'map': case_map, 'pe': case_pe, 'bike': case_bike, 'pool': case_pool, 'oldsite': case_oldsite}


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC X257 體育館搬家：worktree %s；TAG %s；CASES %s；Playwright／SwiftShader ≠ iPhone' % (real or '?', TAG, ','.join(CASES)), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return 1
        for k, c in enumerate(CASES):
            if c not in FUN: R.check('CASES 裡的 %s 認得' % c, False, J(list(FUN))); continue
            print('==== %s ====' % c, flush=True)
            if k and RELOAD:   # 每一段重開頁面：quiet_events 會把 EVENTS.onEnter／tick 換掉（pool 要條件事件）、上一段的狀態不帶過去
                await pg.goto(URL)
                if not R.check('%s 重新載入遊戲' % c, await L.wait_loaded(pg), ''): continue
            try: await FUN[c](pg, cdp, errs)
            except Exception as e:
                import traceback
                R.check('%s 探針例外（這一段中斷）' % c, False, ' / '.join(traceback.format_exc().strip().split('\n')[-3:]))
                try: await shot(pg, '%s_exception' % c, hud=True, judge_black=False)
                except Exception: pass
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    return 1 if R.fails else 0


sys.exit(asyncio.run(main()))
