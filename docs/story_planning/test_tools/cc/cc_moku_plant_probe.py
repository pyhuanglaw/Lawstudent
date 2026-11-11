"""CC（帳號 A）11-11：MOKU-PLANT-CORNER-1111——木曜日（wz_mokuyobi）二樓店門口的小孤島、植物東南角卡住（BB 清單第 2～8 項）的「真瀏覽器」版本。
對照：LAWWW 的 Node 單元測試 tests/mokuyobi_plant_corner_1111_unit.js（同一套項目編號；那支用 E.stepEntity 直接推，這支走真的遊戲畫面）。
受測版本：c170218dd（src/mokuyobi3d.js 的縫補成阻擋 A／B／C、src/engine3d.js stepEntity 的 cornerSlip）。第 1 層＝二樓、第 0 層＝一樓。
做法（Playwright 手機模擬（雲端 SwiftShader／PC GPU）≠ iPhone 真機）：
  【前置／捷徑】讀 day46 存檔（fixtures/user_saves_1107）、改成 2025-11-05 週三 15:00 木曜日某一點（像舊存檔把人放在那裡），關條件事件與手機自動打開；
  【前置／捷徑】限幀率：包 requestAnimationFrame（cc_stair_probe 的 FPSCAP，含「同一時間戳記放行」的修正）限 30 或 10 fps，只改幀率。
  移動一律用 CDP 觸控按住搖桿 #joy（遊戲真的主迴圈、真的 stepEntity）；走路＝搖桿推 28 px（m≈0.64）、跑步＝推到底 50 px（game3d.js setupJoystick：R 44 px、m>0.92 就跑）。
  固定世界方向的推法：每 80 ms 依當下鏡頭角度（E.cam.yaw−swingAcc，和 engine3d.js 換算一致）重算搖桿方向（cc_fn_lib.joy_to 同一個換算）。
  「N 秒」一律是遊戲時間：頁面裡每一幀累加 dt＝min(0.1, 實際間隔)（game3d.js frame 的同一條），暫停時不算——雲端 1～4 fps 時，3 遊戲秒要 10 幾秒真實時間。
項目（編號照 BB 清單／LAWWW 的 Node 測試）：
  2 (−2.54,3.33)、(−2.49,3.04) 第 1 層站不進去；存檔放在那裡讀進來，被拉到站得住的地方（記拉到哪裡）
  3 從 2 拉出來的兩點、(−1.82,4.00) 往樓梯頂（MOKUYOBI_LAYOUT.stairTop）推、往反方向推：3 秒內離開 0.5 m（走／跑 × 30／10 fps）
  4 (−1.82,4.00) 一直往樓梯頂推：12 秒內到樓梯口（x < −2.6、z < 2.6）（4 種模式）
  5 樓梯頂平台西北角：(−3.8,2.1) 往 225°（西北、往角裡）推 3 秒：最後 1 秒移動 < 0.05 m（不會被推著滑）（4 種模式）
  6 CC 14:37 的走法：(−1.97,1.05) 直線推往樓梯底 (−3.35,5.60) 8 秒；停下來的地方站得住、往回／左／右各 3 秒內離開 0.5 m（預設 4 種模式，MODES6 可改）
  7 從 6 停下的地方、(−1.85,2.65)、(−2.15,2.55) 點地走（playlib go_to，6 秒一段）到樓梯底 (−3.35,5.60)，到了在第 0 層（30／10 fps，ITEM7_FPS 可改）
  8 (−3.75,1.0) 第 1 層站不進去；存檔放在那裡讀進來，被拉到站得住的地方
每一個 FAIL 都附診斷：位置、層、附近 5×5 格兩層站不站得住、E.player.blockedAt（含 slide）、busy／對話／選項、E.cam.mode、從停下的地方 E.pathTo 到樓梯底／樓梯頂、截圖（每一項第一次失敗才截）。
用法：LW_TESTS=<wt>/tests SHA=<sha> PARTS=2,3,4,5,6,7,8 python3 cc_moku_plant_probe.py <url> <out>"""
import os, sys, json, time, math, asyncio, datetime
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
import cc_fn_lib as F
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
SHA = os.environ.get('SHA') or ''
PARTS = set(p.strip() for p in (os.environ.get('PARTS') or '2,3,4,5,6,7,8').split(',') if p.strip())
DAY_KEY = os.environ.get('MOKU_DAY') or '2025-11-05'   # 木曜日週二休（cc_stair_probe 同一天）
HOUR = float(os.environ.get('MOKU_H') or '15.0')
R = L.Run('moku_plant', OUT); F.setup(R, OUT)
J = F.J
DAY1 = datetime.date(2025, 9, 17)
ZONE = 'wz_mokuyobi'

# ---- 門檻與出處 ----
STAND_R = 0.3          # E.canStand 的半徑（BB 清單第 2 項「E.canStand(x,z,0.3,1)」；Node 測試同值）
ESC_D, ESC_T = 0.5, 3.0  # BB 清單第 3、6 項：3 秒內離開 0.5 m 以上（Node 測試 push secs 3、until 0.5）
MOUTH_X, MOUTH_Z, MOUTH_T = -2.6, 2.6, 12.0   # BB 清單第 4 項：12 秒內 x < −2.6、z < 2.6（樓梯口；Node 測試同值）
CORNER = (-3.8, 2.1)   # BB 清單第 5 項：樓梯頂平台西北角（Node 測試同一點）
CORNER_DEG, CORNER_T, CORNER_LAST, CORNER_MV = 225.0, 3.0, 1.0, 0.05   # BB 清單第 5 項：225° 推 3 秒、最後 1 秒移動 < 0.05 m（Node 測試更嚴：< 0.02 且和關掉 cornerSlip 同一點）
CC_A, CC_B, CC_T = (-1.97, 1.05), (-3.35, 5.60), 8.0   # BB 清單第 6 項：CC 14:37（V25_STAIR_run10）的走法，直線推 8 秒
STAIR_BOT = (-3.35, 5.60)   # BB 清單第 7 項：樓梯底（第 0 層）
ARRIVE_NEAR = 0.6      # 第 7 項「到了」：go_to 判到達的距離（cc_stair_probe 用 0.5；Node simWalk 到最後路點 0.25 m）
GAP_PTS = [(-2.54, 3.33), (-2.49, 3.04)]   # BB 清單第 2 項（Node 測試 GAP）
PLANT_SE = (-1.82, 4.00)   # BB 清單第 3、4 項：植物東南角
ISLAND_C = (-3.75, 1.0)    # BB 清單第 8 項：西牆書櫃和 table 3 之間的小孤島（src/mokuyobi3d.js 的 C）
ISLAND_C2 = (-3.55, 1.05)  # CC 17:0x：f312c 上 (-3.75,1.0) 本來就站不進去（MOKU_PLANT_old 8 PASS＝分不出新舊）；Node 在 f312c 掃到的小孤島中心是 (-3.55,1.05) 3 格——加這一點才有 D34
ITEM7_EXTRA = [(-1.85, 2.65), (-2.15, 2.55)]
STAIR_TOP_FALLBACK = (-3.75, 2.04)   # src/data/mokuyobi_layout.js stairTop；執行時改讀 MOKUYOBI_LAYOUT.stairTop
JOY_WALK, JOY_RUN = 28, 50   # game3d.js setupJoystick：R＝44 px，m＝min(1,d/44)；m>0.15 才動、m>0.92 就跑
ALL_MODES = [('走30', False, 30), ('走10', False, 10), ('跑30', True, 30), ('跑10', True, 10)]
MODES6 = [m for m in ALL_MODES if m[0] in (os.environ.get('MODES6') or '走30,走10,跑30,跑10').split(',')]
ITEM7_FPS = [int(x) for x in (os.environ.get('ITEM7_FPS') or '30,10').split(',') if x.strip()]

FPSCAP_JS = r"""(cap=>{ const W=window; if(!W.__rafOrig) W.__rafOrig=W.requestAnimationFrame.bind(W); const orig=W.__rafOrig;
  if(!cap){ W.requestAnimationFrame=orig; W.__fpsCap=0; return 0; } const gap=1000/cap; W.__fpsCap=cap; let last=0;
  W.requestAnimationFrame=cb=>orig(function tick(t){ if(t===last||t-last>=gap-1){ last=t; cb(t); } else orig(tick); }); return cap; })"""   # 照抄 cc_stair_probe（CC 08:4x 修正：同一個時間戳記的其他回呼也放行）

# 每一幀記一次（用遊戲同一個、限幀後的 rAF；和遊戲的幀對齊）：遊戲時間 simT（dt＝min(0.1,實際間隔)，game3d.js frame；E.paused 不算）、位置、層、slide、站不站得住
TRK_INSTALL_JS = r"""(()=>{ const W=window; if(W.__ccTrkOn) return 1; W.__ccTrkOn=1;
  const tick=(t)=>{ try{ const T=W.__ccTrk, E=(typeof GAME!=='undefined')?GAME.E:null, P=E&&E.player;
      if(T&&T.on&&P){ const o=P.obj.position, lv=P.lv|0;
        if(T.prevT!==null&&!E.paused&&!document.hidden){ const dt=Math.min(0.1,(t-T.prevT)/1000); if(dt>0){ T.simT+=dt; T.frames++; } }
        T.prevT=t;
        const d=Math.hypot(o.x-T.x0,o.z-T.z0); if(d>T.maxD) T.maxD=d;
        if(T.t05===null&&d>T.escD) T.t05=+T.simT.toFixed(3);
        if(T.mouth&&T.tMouth===null&&o.x<T.mouth[0]&&o.z<T.mouth[1]) T.tMouth=+T.simT.toFixed(3);
        const n=E.levels&&E.levels[lv]; if(n&&n.clear&&!n.clear(o.x,o.z,T.r-0.02)){ T.bad++; if(!T.badAt) T.badAt=[+o.x.toFixed(3),+o.z.toFixed(3),lv,+T.simT.toFixed(2)]; }
        if(P.pose==='run') T.nRun++; else if(P.pose==='walk') T.nWalk++;
        if(T.samples.length<6000) T.samples.push([+T.simT.toFixed(3),+o.x.toFixed(3),+o.z.toFixed(3),lv,P.blockedAt?(P.blockedAt.slide||'?'):null]); } }
    catch(e){ if(W.__ccTrk) W.__ccTrk.err=String(e).slice(0,200); }
    W.requestAnimationFrame(tick); };
  W.requestAnimationFrame(tick); return 1; })()"""
TRK_START_JS = r"""(a=>{ const E=GAME.E, P=E.player, o=P.obj.position;
  window.__ccTrk={on:true, simT:0, frames:0, prevT:null, real0:performance.now(), x0:o.x, z0:o.z, lv0:P.lv|0, r:P.radius||0.32, escD:a.escD, mouth:a.mouth||null,
    maxD:0, t05:null, tMouth:null, bad:0, badAt:null, nRun:0, nWalk:0, samples:[], err:null};
  return {x:+o.x.toFixed(3), z:+o.z.toFixed(3), y:+o.y.toFixed(3), lv:P.lv|0, runHold:!!P.runHold}; })"""
TRK_READ_JS = r"""(()=>{ const T=window.__ccTrk||{}, E=GAME.E, P=E.player, o=P.obj.position, D=GAME.D, ch=document.getElementById('choices');
  return {simT:T.simT||0, frames:T.frames||0, t05:(T.t05===undefined?null:T.t05), tMouth:(T.tMouth===undefined?null:T.tMouth), x:+o.x.toFixed(3), z:+o.z.toFixed(3), lv:P.lv|0,
    yaw:E.cam.yaw-(E.cam.swingAcc||0), busy:!!P.busy, dlg:!!(D&&D.active), nch:(ch&&!ch.classList.contains('hide'))?ch.querySelectorAll('button').length:0,
    camMode:E.cam.mode, paused:!!E.paused}; })()"""
TRK_STOP_JS = r"""(()=>{ const T=window.__ccTrk; if(!T) return null; T.on=false; const real=(performance.now()-T.real0)/1000;
  return {simT:+T.simT.toFixed(3), frames:T.frames, real:+real.toFixed(2), fps:real>0?+(T.frames/real).toFixed(2):null, maxD:+T.maxD.toFixed(3), t05:T.t05, tMouth:T.tMouth,
    bad:T.bad, badAt:T.badAt, nRun:T.nRun, nWalk:T.nWalk, err:T.err, samples:T.samples}; })()"""
DIAG_JS = r"""(a=>{ const E=GAME.E, P=E.player, o=P.obj.position, lv=P.lv|0, f2=v=>(v===null||v===undefined)?null:+(+v).toFixed(2); const two=!!(E.levels&&E.levels.length>1);
  const grid=[]; for(let j=-2;j<=2;j++){ const row=[]; for(let i=-2;i<=2;i++){ const x=o.x+i*0.15, z=o.z+j*0.15; row.push((E.canStand(x,z,0.3,0)?'0':'-')+(two?(E.canStand(x,z,0.3,1)?'1':'-'):'')); } grid.push('z'+f2(o.z+j*0.15)+':'+row.join(' ')); }
  const pth=(x,z,l)=>{ try{ const p=E.pathTo(o.x,o.z,lv,x,z,l); return p?{n:p.length, pts:p.slice(0,6).map(q=>[f2(q[0]),f2(q[1]),q.length>2?q[2]:null])}:null; }catch(e){ return 'err '+String(e).slice(0,80); } };
  const b=P.blockedAt, D=GAME.D, ch=document.getElementById('choices');
  const npcs=(E.npcs||[]).filter(n=>n&&n.obj&&Math.hypot(n.obj.position.x-o.x,n.obj.position.z-o.z)<2).map(n=>({id:n.charId||n.id||n.name||'', x:f2(n.obj.position.x), z:f2(n.obj.position.z), lv:n.lv|0}));
  return {pos:{x:f2(o.x),z:f2(o.z),y:f2(o.y),lv}, standHere:!!E.canStand(o.x,o.z,0.3,lv), grid, blockedAt:b?{x:f2(b.x),z:f2(b.z),slide:b.slide||null}:null,
    busy:!!P.busy, dlg:!!(D&&D.active), choices:(ch&&!ch.classList.contains('hide'))?[...ch.querySelectorAll('button')].map(q=>(q.innerText||'').trim().slice(0,16)):[],
    camMode:E.cam.mode, camCtl:!!E.cam.ctl, paused:!!E.paused, runHold:!!P.runHold, pathBot:pth(a.bot[0],a.bot[1],0), pathTop:pth(a.top[0],a.top[1],1), npcs}; })"""
PULL_JS = r"""(a=>{ const E=GAME.E, P=E.player, o=P.obj.position, lv=P.lv|0, f3=v=>+(+v).toFixed(3); const n1=E.levels&&E.levels[1];
  let pb=null; try{ const p=E.pathTo(o.x,o.z,lv,a.bot[0],a.bot[1],0); pb=p?p.length:null; }catch(e){ pb='err '+String(e).slice(0,60); }
  return {zone:GAME.G.zone, levels:E.levels?E.levels.length:0, origStand1:!!E.canStand(a.x,a.z,0.3,1), origClear1:n1&&n1.clear?!!n1.clear(a.x,a.z,0.32):null,
    x:f3(o.x), z:f3(o.z), y:f3(o.y), lv, stand1:!!E.canStand(o.x,o.z,0.3,1), standLv:!!E.canStand(o.x,o.z,0.3,lv), lastSpawn:E.lastSpawn||null, pathBot:pb}; })"""
LAYOUT_JS = r"""(()=>{ const L=(typeof MOKUYOBI_LAYOUT!=='undefined')?MOKUYOBI_LAYOUT:null; const z=GAME.E.zone; return {stairTop:L&&L.stairTop?[L.stairTop.x,L.stairTop.z]:null, cornerSlip:!!(z&&z.cornerSlip), levels:GAME.E.levels?GAME.E.levels.length:0, spd:GAME.E.SPD||null}; })()"""

STAIR_TOP = list(STAIR_TOP_FALLBACK)
# BB 19:46：第 7 項的「樓梯底」改成第一階前面的地板（離樓梯 ≥0.3 m）——點在樓梯上＝走完這一跑（規則），不算走錯
BOT_FLOOR_JS = r"""(a=>{ const E=GAME.E; const H=(x,z)=>E.heightAt(x,z,0); const flat=(x,z)=>Math.abs(H(x,z)-a.base)<0.03;
  let best=null; for(let dx=-1.5;dx<=1.5001;dx+=0.05) for(let dz=-1.5;dz<=1.5001;dz+=0.05){ const x=a.bot[0]+dx, z=a.bot[1]+dz, d=Math.hypot(dx,dz); if(best&&d>=best.d) continue;
    if(!E.canStand(x,z,0.3,0)||!flat(x,z)) continue; let ok=true; for(let k=0;k<16&&ok;k++){ const t=k*Math.PI/8; if(!flat(x+0.3*Math.cos(t),z+0.3*Math.sin(t))) ok=false; } if(!ok) continue;
    best={x:+x.toFixed(2),z:+z.toFixed(2),d:+d.toFixed(2),h:+H(x,z).toFixed(3)}; }
  return {best, base:a.base, hBot:+H(a.bot[0],a.bot[1]).toFixed(3)}; })"""
# 點地時遊戲 E.screenToFloor 打到什麼（E.update 呼叫的那幾次＝真的點擊）：命中點、在不在樓梯（userData.stairEnds）
TAPREC_JS = r"""(()=>{ const E=GAME.E; window.__ccTapHits=[]; if(!E.__ccTapHook){ E.__ccTapHook=1; const s0=E.screenToFloor; E.screenToFloor=function(x,y){ const h=s0.apply(this,arguments); try{ const st=String(new Error().stack||''); if(st.indexOf('update')>=0) window.__ccTapHits.push({sx:Math.round(x),sy:Math.round(y),hit:h?[+h.x.toFixed(2),+(+h.y).toFixed(2),+h.z.toFixed(2),h.lv|0]:null,stair:!!(h&&h.obj&&h.obj.userData&&h.obj.userData.stairEnds),pl:[+E.player.obj.position.x.toFixed(2),+E.player.obj.position.z.toFixed(2),E.player.lv|0]}); }catch(_){ } return h; }; } return true; })()"""
SHOT_DONE = set()
PULLED = {}     # 第 2／8 項：讀檔放在 (x,z) 第 1 層 → 拉到哪裡 (x,z,lv)
CC_ENDS = []    # 第 6 項：停下來的地方 (x,z,lv,模式)


def day_of(key):
    return (datetime.date.fromisoformat(key) - DAY1).days + 1


def base(x, z, lv, yaw):
    s = json.load(open(F.SAVE, encoding='utf-8')); s = dict(s.get('G', s))
    d = datetime.date.fromisoformat(DAY_KEY)
    s['day'] = day_of(DAY_KEY); s['weekday'] = d.isoweekday() % 7; s['hour'] = HOUR; s['zone'] = ZONE
    s['pos'] = {'x': x, 'z': z, 'yaw': yaw, 'lv': lv}; s['weather'] = 'clear'; s['invites'] = []
    return s


def face(ux, uz):
    """人面向 (sin yaw, cos yaw)：存檔的 yaw 讓人面向推的方向（鏡頭在背後，像玩家先轉向再推）"""
    return math.atan2(ux, uz)


def unit(dx, dz):
    m = math.hypot(dx, dz) or 1.0
    return dx / m, dz / m


async def load_at(pg, cdp, x, z, lv, yaw, why):
    """【前置／捷徑】讀檔把人放到 (x,z) 第 lv 層；回傳 (D.st, E.lastSpawn)"""
    await pg.evaluate(FPSCAP_JS, 0)   # 讀檔時不限幀，讀完才依模式限
    await pg.evaluate("(()=>{ if(GAME.E) GAME.E.lastSpawn=null; })()")
    s = base(x, z, lv, yaw)
    try: await L.load_state(pg, s, quiet_events=True, quiet_phone=True)
    except TypeError: await L.load_state(pg, s, quiet_events=True)
    await pg.wait_for_timeout(3000)
    try: await L.close_panels(pg, cdp)
    except AttributeError: pass
    q, did = await F.ready(pg, cdp, 30)
    if await pg.evaluate("(()=>!!GAME.E.player.runHold)()"):   # 「跑」按鈕開著就像玩家一樣按掉：走／跑只由搖桿推多大決定
        await L.tap(pg, cdp, '#btnRun'); await pg.wait_for_timeout(300)
    st = await D.st(pg); sp = await pg.evaluate("(()=>GAME.E.lastSpawn||null)()")
    R.setup('%s：day46 存檔 → %s %05.2f 木曜日 (%.2f, %.2f) 第 %d 層、yaw %.2f、關條件事件／手機自動打開（站在 (%.3f, %.3f) 第 %d 層；E.lastSpawn %s；收尾 %s）' % (
        why, DAY_KEY, HOUR, x, z, lv, yaw, st.get('x', 0), st.get('z', 0), st.get('lv', -1), J(sp), J(did)))
    return st, sp


async def set_mode(pg, cap):
    """【前置／捷徑】只改幀率（包 requestAnimationFrame）"""
    return await pg.evaluate(FPSCAP_JS, cap)


async def diag(pg, tag, item, shot_name):
    d = await pg.evaluate(DIAG_JS, {'bot': list(STAIR_BOT), 'top': STAIR_TOP})
    nm = None
    if item not in SHOT_DONE:
        SHOT_DONE.add(item); nm = 'item%s_%s' % (item, shot_name)
        try: await pg.screenshot(path=os.path.join(OUT, nm + '.png'))
        except Exception as e: R.note('%s 截圖失敗 %s' % (tag, repr(e)[:120]))
    R.note('%s 【診斷】位置 %s、站得住 %s、blockedAt %s、busy %s、對話 %s、選項 %s、鏡頭 %s（ctl %s、paused %s）、跑步鍵 %s；附近 2 m NPC %s' % (
        tag, J(d.get('pos')), d.get('standHere'), J(d.get('blockedAt')), d.get('busy'), d.get('dlg'), J(d.get('choices')), d.get('camMode'), d.get('camCtl'), d.get('paused'), d.get('runHold'), J(d.get('npcs'))))
    R.note('%s 【診斷】附近 5×5 格（每格 0.15 m；「0」「1」＝第 0／1 層站得住、「-」站不住；中間＝人）%s' % (tag, J(d.get('grid'))))
    R.note('%s 【診斷】從停下的地方 E.pathTo → 樓梯底 (%.2f, %.2f) 第 0 層 %s；→ 樓梯頂 (%.2f, %.2f) 第 1 層 %s；截圖 %s' % (
        tag, STAIR_BOT[0], STAIR_BOT[1], J(d.get('pathBot')), STAIR_TOP[0], STAIR_TOP[1], J(d.get('pathTop')), nm or '（這一項已截過）'))
    return d


async def guard(pg, cdp, tag):
    """推之前先看狀態：有對話、選項、busy 就停下來處理／記錄，不盲點（CC_02 乙 5、13）。回傳 True＝可以推"""
    s = await D.st(pg)
    if not (s.get('dlg') or s.get('choices') or s.get('busy')): return True
    R.note('%s 推之前畫面有東西：對話 %s、選項 %s、busy %s（%s）→ 只點掉對話，不選選項' % (tag, s.get('dlg'), J(s.get('choices')), s.get('busy'), J(await L.state(pg))))
    await F.ready(pg, cdp, 20)
    s = await D.st(pg)
    if s.get('dlg') or s.get('choices') or s.get('busy'):
        R.note('%s 還是有對話／選項／busy，這一趟不推（不是移動問題）' % tag); return False
    return True


async def hold(pg, cdp, tag, wdir, run, sim_s, until=None, mouth=None):
    """按住搖桿往世界方向 wdir 推，直到遊戲時間 sim_s 秒、或 until（'d05'＝離開 ESC_D、'mouth'＝到樓梯口）成立。
    回傳追蹤結果（遊戲時間、t05、tMouth、最遠、站不住的幀、跑／走的幀數、實際幀率、逐幀樣本）"""
    await pg.evaluate(TRK_INSTALL_JS)
    c = await L.center_of(pg, '#joy')
    if not c: return {'interrupted': '找不到搖桿 #joy（被蓋住或沒顯示）'}
    jx, jy = c
    start = await pg.evaluate(TRK_START_JS, {'escD': ESC_D, 'mouth': mouth})
    mag = JOY_RUN if run else JOY_WALK
    ux, uz = unit(*wdir)
    t0 = time.time(); max_real = sim_s * 25 + 30   # 雲端最慢約 0.5 fps：1 遊戲秒＝10 幀＝20 秒；超過就停（記「真實時間逾時」）
    why = None; q = {}
    await cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': jx, 'y': jy}]})
    try:
        while True:
            q = await pg.evaluate(TRK_READ_JS)
            if q.get('dlg') or q.get('nch') or q.get('busy'): why = '推到一半出現對話／選項／busy（%s）' % J({'dlg': q.get('dlg'), 'nch': q.get('nch'), 'busy': q.get('busy')}); break
            if q.get('simT', 0) >= sim_s: break
            if until == 'd05' and q.get('t05') is not None: break
            if until == 'mouth' and q.get('tMouth') is not None: break
            if time.time() - t0 > max_real: why = '真實時間逾時（%.0f 秒，遊戲時間只走了 %.2f 秒）' % (time.time() - t0, q.get('simT', 0)); break
            a = q.get('yaw', 0.0)
            sx, sy = ux * math.cos(a) - uz * math.sin(a), ux * math.sin(a) + uz * math.cos(a)   # engine3d.js：dx＝mv.x·cos+mv.z·sin、dz＝−mv.x·sin+mv.z·cos 的反算
            m = math.hypot(sx, sy) or 1.0
            await cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': jx + sx / m * mag, 'y': jy + sy / m * mag}]})
            await pg.wait_for_timeout(80)
    finally:
        await cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
    await pg.wait_for_timeout(150)
    r = await pg.evaluate(TRK_STOP_JS) or {}
    r['start'] = start; r['interrupted'] = why; r['camMode'] = q.get('camMode')
    smp = r.get('samples') or []
    r['end'] = smp[-1] if smp else None
    r['modeOK'] = (r.get('nRun', 0) > 0 and r.get('nWalk', 0) == 0) if run else (r.get('nWalk', 0) > 0 and r.get('nRun', 0) == 0)
    return r


def at_time(smp, t):
    """逐幀樣本裡第一個遊戲時間 ≥ t 的那一幀"""
    for s in smp:
        if s[0] >= t: return s
    return smp[-1] if smp else None


def brief(r):
    e = r.get('end') or [None] * 5
    return {'起點': [r.get('start', {}).get('x'), r.get('start', {}).get('z'), r.get('start', {}).get('lv')], '終點': e[1:4], '遊戲秒': r.get('simT'), '真實秒': r.get('real'),
            '幀率': r.get('fps'), '最遠': r.get('maxD'), '離開0.5m': r.get('t05'), '站不住幀': r.get('bad'), '第一個站不住': r.get('badAt'), '跑／走幀': [r.get('nRun'), r.get('nWalk')],
            '最後slide': e[4] if len(e) > 4 else None, '打斷': r.get('interrupted'), 'err': r.get('err')}


async def push_from(pg, cdp, tag, x, z, lv, wdir, mode, sim_s, until=None, mouth=None, load=True, why=''):
    """（讀檔放到起點）→ 限幀 → 推之前看狀態 → 按住搖桿推。回傳 hold 的結果（沒推就 {'interrupted':…}）"""
    name, run, cap = mode
    if load: await load_at(pg, cdp, x, z, lv, face(*unit(*wdir)), '【前置／捷徑】%s %s 起點' % (tag, why))
    await set_mode(pg, cap)
    if not await guard(pg, cdp, tag): return {'interrupted': '推之前有對話／選項，沒推'}
    r = await hold(pg, cdp, tag, wdir, run, sim_s, until, mouth)
    R.note('%s %s' % (tag, J(brief(r))))
    return r


# ---------------------------------------------------------------- 2、8：站不進去、讀檔被拉出來
async def item_pull(pg, cdp, no, pts, checks=True):
    for (x, z) in pts:
        tag = '[%s (%.2f,%.2f)]' % (no, x, z)
        await load_at(pg, cdp, x, z, 1, 0.0, '【前置／捷徑】%s 第 %s 項：像舊存檔一樣把人放在 (%.2f, %.2f) 第 1 層' % (tag, no, x, z))
        q = await pg.evaluate(PULL_JS, {'x': x, 'z': z, 'bot': list(STAIR_BOT)})
        PULLED[(x, z)] = (q.get('x'), q.get('z'), q.get('lv'))
        moved = math.hypot((q.get('x') or 0) - x, (q.get('z') or 0) - z)
        R.note('%s 讀檔後：區域 %s、站在 (%s, %s) y %s 第 %s 層、離原點 %.2f m；E.lastSpawn %s；原點第 1 層 canStand %s、clear(0.32) %s' % (
            tag, q.get('zone'), q.get('x'), q.get('z'), q.get('y'), q.get('lv'), moved, J(q.get('lastSpawn')), q.get('origStand1'), q.get('origClear1')))
        if not checks: continue
        ok1 = R.check('%s. (%.2f, %.2f) 第 1 層站不進去（E.canStand 半徑 %.1f 是 false）' % (no, x, z, STAND_R), q.get('zone') == ZONE and not q.get('origStand1'), J({'canStand': q.get('origStand1'), 'clear': q.get('origClear1'), 'zone': q.get('zone')}))
        ok2 = R.check('%s. 存檔放在 (%.2f, %.2f) 第 1 層：讀進來被拉到站得住的地方（E.canStand(x,z,0.3,1) true、不是原來那一點）→ (%s, %s) 第 %s 層' % (no, x, z, q.get('x'), q.get('z'), q.get('lv')),
                      q.get('zone') == ZONE and bool(q.get('stand1')) and q.get('lv') == 1 and moved > 0.05, J({'stand1': q.get('stand1'), 'standLv': q.get('standLv'), 'lv': q.get('lv'), '離原點': round(moved, 3)}))
        ok3 = R.check('%s. 拉出來的位置走得到樓梯底（E.pathTo 有路，不是另一個小孤島；LAWWW Node 第 2 項「拉出來的位置在大區」）' % no, isinstance(q.get('pathBot'), int) and q.get('pathBot') > 0, J({'pathTo 點數': q.get('pathBot')}))
        if not (ok1 and ok2 and ok3): await diag(pg, tag, no, 'pull')


# ---------------------------------------------------------------- 3：往樓梯推、往回推
async def item3(pg, cdp):
    starts = []
    for p in GAP_PTS:
        if p not in PULLED:
            await item_pull(pg, cdp, '3（前置：第 2 項的拉出點）', [p], checks=False)
        q = PULLED.get(p)
        if q and q[0] is not None: starts.append(('縫口 (%.2f,%.2f) 拉出來的位置' % (p[0], p[1]), (q[0], q[1], q[2] if q[2] is not None else 1)))
        else: R.check('3. 縫口 (%.2f, %.2f) 拉出來的位置拿不到（前一步沒成功，跳過）' % (p[0], p[1]), False)
    starts.append(('植物東南角 (−1.82,4.00)', (PLANT_SE[0], PLANT_SE[1], 1)))
    for nm, (x, z, lv) in starts:
        tdir = (STAIR_TOP[0] - x, STAIR_TOP[1] - z)
        for dname, wdir in (('往樓梯頂', tdir), ('往反方向', (-tdir[0], -tdir[1]))):
            for mode in ALL_MODES:
                tag = '[3 %s %s %s]' % (nm, dname, mode[0])
                r = await push_from(pg, cdp, tag, x, z, lv, wdir, mode, ESC_T, until='d05', why='')
                t05 = r.get('t05')
                ok = (r.get('interrupted') is None) and t05 is not None and t05 <= ESC_T + 1e-6 and not r.get('bad') and r.get('modeOK')
                info = J(brief(r)) + ('' if r.get('modeOK', True) else '  （探針：走／跑模式不對）')
                if not R.check('3. %s %s（%s）：%.0f 秒內離開 %.1f m 以上、每一幀都站得住' % (nm, dname, mode[0], ESC_T, ESC_D), ok, info):
                    await diag(pg, tag, '3', 'push')


# ---------------------------------------------------------------- 4：植物東南角一直推到樓梯口
async def item4(pg, cdp):
    x, z = PLANT_SE; wdir = (STAIR_TOP[0] - x, STAIR_TOP[1] - z)
    for mode in ALL_MODES:
        tag = '[4 %s]' % mode[0]
        r = await push_from(pg, cdp, tag, x, z, 1, wdir, mode, MOUTH_T, until='mouth', mouth=[MOUTH_X, MOUTH_Z])
        tm = r.get('tMouth')
        ok = (r.get('interrupted') is None) and tm is not None and tm <= MOUTH_T + 1e-6 and not r.get('bad') and r.get('modeOK')
        info = J(dict(brief(r), 到樓梯口=tm)) + ('' if r.get('modeOK', True) else '  （探針：走／跑模式不對）')
        if not R.check('4. (−1.82, 4.00) 一直往樓梯頂推（%s）：%.0f 秒內到樓梯口（x < %.1f、z < %.1f）、每一幀都站得住' % (mode[0], MOUTH_T, MOUTH_X, MOUTH_Z), ok, info):
            await diag(pg, tag, '4', 'mouth')


# ---------------------------------------------------------------- 5：牆角往角裡推，不會被推著滑
async def item5(pg, cdp):
    a = math.radians(CORNER_DEG); wdir = (math.sin(a), math.cos(a))   # Node 測試：stepEntity(ent, sin a, cos a)＝(−0.71, −0.71) 往西北
    for mode in ALL_MODES:
        tag = '[5 %s]' % mode[0]
        r = await push_from(pg, cdp, tag, CORNER[0], CORNER[1], 1, wdir, mode, CORNER_T)
        smp = r.get('samples') or []
        p2 = at_time(smp, CORNER_T - CORNER_LAST); p3 = smp[-1] if smp else None
        mv = math.hypot(p3[1] - p2[1], p3[2] - p2[2]) if (p2 and p3) else None
        lv_ok = bool(p3) and p3[3] == 1
        full = r.get('simT', 0) >= CORNER_T - 0.05
        ok = (r.get('interrupted') is None) and full and mv is not None and mv < CORNER_MV and lv_ok and r.get('modeOK')
        info = J(dict(brief(r), 最後1秒起點=p2, 最後1秒移動=None if mv is None else round(mv, 4)))
        if not R.check('5. 樓梯頂平台西北角 (−3.8, 2.1) 往 225° 推 %.0f 秒（%s）：最後 %.0f 秒移動 < %.2f m、還在第 1 層' % (CORNER_T, mode[0], CORNER_LAST, CORNER_MV), ok, info):
            await diag(pg, tag, '5', 'corner')


# ---------------------------------------------------------------- 6：CC 14:37 的走法
async def item6(pg, cdp):
    u = unit(CC_B[0] - CC_A[0], CC_B[1] - CC_A[1])
    back, left, right = (-u[0], -u[1]), (u[1], -u[0]), (-u[1], u[0])   # 鏡頭的「右」＝(−fz, fx)：面向 u 時右邊＝(−uz, ux)
    for mode in MODES6:
        tag = '[6 %s]' % mode[0]
        r = await push_from(pg, cdp, tag, CC_A[0], CC_A[1], 1, u, mode, CC_T, why='CC 14:37 走法')
        e = r.get('end')
        if r.get('interrupted') or not e:
            R.check('6. （%s）直線推往樓梯底 %.0f 秒：沒推完（%s），跳過後面' % (mode[0], CC_T, r.get('interrupted')), False); await diag(pg, tag, '6', 'push'); continue
        ex, ez, elv = e[1], e[2], e[3]
        stand = await pg.evaluate("(a=>!!GAME.E.canStand(a[0],a[1],0.3,a[2]))", [ex, ez, elv])
        CC_ENDS.append((ex, ez, elv, mode[0]))
        if not R.check('6. （%s）(−1.97, 1.05) 直線推往樓梯底 %.0f 秒：停在 (%.2f, %.2f) 第 %d 層，站得住' % (mode[0], CC_T, ex, ez, elv), bool(stand) and r.get('modeOK'), J(brief(r))):
            await diag(pg, tag, '6', 'stop')
        res = []
        for k, (dn, wd) in enumerate((('往回', back), ('往左', left), ('往右', right))):
            t2 = '%s 從停下的地方%s' % (tag, dn)
            # 往回：直接從停下的地方接著推（玩家就是這樣）；往左、往右：【前置／捷徑】讀檔放回停下的地方再推（讀檔只在站不住時才會被拉走，站得住的小孤島不會被拉掉）
            q = await push_from(pg, cdp, t2, ex, ez, elv, wd, mode, ESC_T, until='d05', load=(k > 0), why='第 6 項停下的地方')
            ok = (q.get('interrupted') is None) and q.get('t05') is not None and q.get('t05') <= ESC_T + 1e-6
            res.append({'方向': dn, '離開': ok, '離開0.5m': q.get('t05'), '最遠': q.get('maxD'), '終點': (q.get('end') or [None] * 4)[1:4], '打斷': q.get('interrupted')})
            if not ok: await diag(pg, t2, '6', 'esc')
        n_ok = sum(1 for x in res if x['離開'])
        R.check('6. （%s）從停下的地方 (%.2f, %.2f) 往回／左／右各 %.0f 秒內離開 %.1f m 以上：%d/3' % (mode[0], ex, ez, ESC_T, ESC_D, n_ok), n_ok == 3, J(res))


# ---------------------------------------------------------------- 7：點地走到樓梯底
async def walk_segments(pg, cdp, tag, tx, tz, lv, total_s):
    """go_to 每段 6 秒（CC_02 乙 13：每段之前先看 busy／對話／選項，不讓 go_to 盲點）；回傳 (到了, 原因)"""
    t0 = time.time()
    while time.time() - t0 < total_s:
        s = await D.st(pg)
        if s.get('dlg') or s.get('choices') or s.get('busy'):
            R.note('%s 走路途中畫面有東西：%s → 停下來' % (tag, J({'dlg': s.get('dlg'), 'choices': s.get('choices'), 'busy': s.get('busy')}))); return False, '途中出現對話／選項／busy'
        if math.hypot(s['x'] - tx, s['z'] - tz) <= ARRIVE_NEAR and s.get('lv') == lv: return True, None
        if await L.go_to(pg, cdp, R, tx, tz, ARRIVE_NEAR, tag, max_s=6, lv=lv):
            await D.settle(pg)
            s = await D.st(pg)
            if math.hypot(s['x'] - tx, s['z'] - tz) <= ARRIVE_NEAR + 0.3 and s.get('lv') == lv: return True, None
    return False, '%.0f 秒沒走到' % total_s


async def item7(pg, cdp):
    starts = []; seen = set()
    if '6' not in PARTS and not CC_ENDS: R.note('[7] 這次沒跑第 6 項：只走 (−1.85,2.65)、(−2.15,2.55) 兩點')
    for (x, z, lv, mn) in CC_ENDS:
        k = (round(x, 1), round(z, 1), lv)
        if k in seen: continue
        seen.add(k); starts.append(('第 6 項（%s）停下的地方 (%.2f,%.2f)' % (mn, x, z), x, z, lv))
    for (x, z) in ITEM7_EXTRA: starts.append(('(%.2f,%.2f)' % (x, z), x, z, 1))
    if not CC_ENDS: starts.append(('一樓 (-4.17,6.67)（b77a 第 6 項走 30 停下、30 fps 點樓梯底被帶上二樓的那一點）', -4.17, 6.67, 0))   # BB 19:46：記那一下命中點在不在樓梯上
    for nm, x, z, lv in starts:
        for cap in ITEM7_FPS:
            tag = '[7 %s %d fps]' % (nm, cap)
            u = unit(STAIR_BOT[0] - x, STAIR_BOT[1] - z)
            await load_at(pg, cdp, x, z, lv, face(*u), '【前置／捷徑】%s 起點' % tag)
            await set_mode(pg, cap)
            if not await guard(pg, cdp, tag):
                R.check('7. %s 點地走到樓梯底：推之前有對話／選項，沒走' % nm, False); continue
            t0 = time.time()
            if lv == 1:   # N1_MOKU_PLANT（b77a）：從二樓直接 go_to 一樓的點，一樓地板從上面看不到，go_to 一下都沒點（「點地面 0 次」）＝探針的盲點。像玩家一樣：先走到樓梯頂（二樓），再點樓梯底
                ok1, why1 = await walk_segments(pg, cdp, tag + '（先到樓梯頂）', STAIR_TOP[0], STAIR_TOP[1], 1, 150)
                s1 = await D.st(pg)
                R.note('%s 走的路：先點地走到樓梯頂 %s（第 1 層）＝%s（%s，停在 %s）→ 再點樓梯底' % (tag, J(STAIR_TOP), '到了' if ok1 else '沒到', why1, J([s1.get('x'), s1.get('z'), s1.get('lv')])))
            await pg.evaluate(TAPREC_JS)
            bf = await pg.evaluate(BOT_FLOOR_JS, {'bot': list(STAIR_BOT), 'base': await pg.evaluate("GAME.E.heightAt(%f,%f,0)" % (x, z)) if lv == 0 else 0.0})
            tgt = (bf['best']['x'], bf['best']['z']) if bf.get('best') else STAIR_BOT
            R.note('%s 目標：第一階前面的地板 %s（離 BB 的樓梯底 %s m；地板高 %s、樓梯底那一點高 %s）' % (tag, J(tgt), (bf.get('best') or {}).get('d'), bf.get('base'), bf.get('hBot')))
            ok, why = await walk_segments(pg, cdp, tag, tgt[0], tgt[1], 0, 300 if lv == 1 else 420)
            th = await pg.evaluate("(window.__ccTapHits||[]).slice(-12)")
            R.note('%s 這一趟遊戲收到的點擊（命中點、在不在樓梯上）：%s' % (tag, J(th)))
            s9 = await D.st(pg)
            if lv == 0 and s9.get('lv') == 1:
                R.check('7. %s 被帶上二樓時，點的命中點在樓梯上（規則：點在樓梯上＝走完這一跑；命中在地板還被帶上樓＝遊戲問題）' % nm, any(q['stair'] for q in th), J(th[-6:]))
            s = await D.st(pg)
            info = J({'終點': [s.get('x'), s.get('z'), s.get('y'), s.get('lv')], '秒': round(time.time() - t0, 1), 'walkFallbacks': s.get('fb'), '原因': why})
            if not R.check('7. %s 點地走（go_to）到樓梯底 (%.2f, %.2f)（%d fps）：%.1f m 內、在第 0 層' % (nm, STAIR_BOT[0], STAIR_BOT[1], cap, ARRIVE_NEAR), ok, info):
                await diag(pg, tag, '7', 'walk')


async def main():
    global STAIR_TOP
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        R.check('遊戲載入', await L.wait_loaded(pg))
        ver = await pg.evaluate("(document.body.innerText.match(/版本 v[0-9.]+/)||[''])[0]")
        R.note('CC MOKU-PLANT：受測 SHA %s、%s；項目 %s；Playwright 手機模擬（雲端 SwiftShader／PC GPU）≠ iPhone；「秒」都是遊戲時間' % (SHA or '（沒給）', ver, ','.join(sorted(PARTS))))
        n0 = len(errs)
        try:
            await load_at(pg, cdp, PLANT_SE[0], PLANT_SE[1], 1, 0.0, '【前置／捷徑】開場：讀檔進木曜日二樓（拿區域資料、總覽截圖）')
            lay = await pg.evaluate(LAYOUT_JS)
            if lay.get('stairTop'): STAIR_TOP = lay['stairTop']
            R.note('木曜日：stairTop %s（MOKUYOBI_LAYOUT）、cornerSlip %s、層數 %s、速度 %s' % (J(lay.get('stairTop')), lay.get('cornerSlip'), lay.get('levels'), J(lay.get('spd'))))
            R.check('木曜日有兩層導航（第 0 層一樓、第 1 層二樓）', lay.get('levels') == 2, J(lay))
            await R.shot(pg, 'overview')
        except Exception as e:
            R.check('開場讀檔沒有例外', False, repr(e)[:300])
        for no, fn in (('2', lambda: item_pull(pg, cdp, '2', GAP_PTS)), ('8', lambda: item_pull(pg, cdp, '8', [ISLAND_C, ISLAND_C2])), ('3', lambda: item3(pg, cdp)),
                       ('4', lambda: item4(pg, cdp)), ('5', lambda: item5(pg, cdp)), ('6', lambda: item6(pg, cdp)), ('7', lambda: item7(pg, cdp))):
            if no not in PARTS: continue
            print('== 第 %s 項' % no, flush=True); t0 = time.time()
            try: await fn()
            except Exception as e:
                R.check('第 %s 項探針沒有例外' % no, False, repr(e)[:300])
                try: await diag(pg, '[%s 例外]' % no, no, 'exc')
                except Exception: pass
            R.note('第 %s 項用了 %.0f 秒' % (no, time.time() - t0))
        try: await pg.evaluate(FPSCAP_JS, 0)
        except Exception: pass
        R.check('沒有 JS 例外', len(errs) == n0, J(errs[n0:n0 + 3]))
        await b.close()
    return R.finish()


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
