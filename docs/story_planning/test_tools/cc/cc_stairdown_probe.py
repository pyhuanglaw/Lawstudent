"""CC（帳號 A）11-11：STAIRDOWN——多樓層樓梯「從上層直線推到樓梯底」回歸（BB 指派；LAWWW：木曜日的毛病別的樓梯可能也有）。
起因：木曜日（wz_mokuyobi）樓梯下樓時，第 1 層的導航格一路延伸到樓梯底，人走到樓梯底還算第 1 層，有時卡 45 秒（修正 2c962ad66：第 1 層在樓梯下半段擋起來）。
這支把同一種走法套到其他四棟的樓梯（PARTS）：
  LINZE  法律系館A（霖澤館，zone linze）：LINZE_LAYOUT.stair（src/data/linze_layout.js、src/building3d.js）第二跑 → 中間平台 → 第一跑，一直線（x 是樓梯中線）
  DORM   男生宿舍（zone dorm_hall）：DORM_LAYOUT.stair（src/data/dorm_layout.js、src/dorm3d.js）B 跑往北下到平台 → 平台上往西轉 → A 跑往南下到一樓走廊
  LIB_C／LIB_L／LIB_R 總圖（zone library_hall）：
         LIBRARY_LAYOUT.version＝2（現在的遊戲；src/library_hall_v2.js）沒有帝國式三跑，只有「台階書牆」中間走的那一跑（bookstair.walk，兩層共用；兩側是坐的大階梯，導航擋住）
           → LIB_C＝走道中線、LIB_L／LIB_R＝走道左右兩條線（離走道邊 0.45 m），都從二樓北側連廊直線推到一樓
         version＝1（帝國式，src/library3d.js）才照原本的三跑：LIB_L／LIB_R＝二樓連廊 → 左／右那一跑 → 平台；LIB_C＝平台 → 中間那一跑 → 大廳
  WANCAI 法律系館B（萬才館，zone wancai）：WANCAI_LAYOUT.stair（src/data/wancai_layout.js、src/wancai3d.js）西側樓梯，二樓門廳往北：第二跑 → 平台 → 第一跑
樓梯座標一律在遊戲裡讀上面那幾個全域配置（ROUTES_JS），不寫死；log 開頭印每座用了哪些點、從哪裡讀；每座第一次讀檔後用 E.canStand 驗每一點站不站得住（站不住就找 0.8 m 內最近站得住的點，log 標明）。
每一趟：
  【前置／捷徑】day46 存檔（fixtures/user_saves_1107）改日期 STAIR_DAY（預設 2025-11-05 週三）STAIR_H（15:00）、區域、位置＝上層樓梯口前約 1 m（lv 照該層），關條件事件、手機自動打開。
  只用搖桿（cc_fn_lib.joy_to straight＝一直朝目標推、不繞路），照路線分段推：中間平台（折返的在平台上轉向）→ 樓梯底外 0.5 m。不瞬移、不用 ?turbo。
  跑步＝觸控按 #btnRun（切換；走的趟數確定是關的）。
  每段記：到了沒、秒數、推幾次、到的時候與停下 0.8 秒後的 x/z/y/lv；20 秒沒前進 0.3 m＝卡住（joy_to 判）→ 截圖＋診斷
    （卡住座標；人所在那條線往前後 0.7 m、樓梯底往上 1.6 m～往外 1.0 m 每 0.2 m 第 0／1 層站不站得住 s0／s1、高度 h0／h1；2.5 m 內 NPC；E.pathTo；E.unstick 次數）
    → 脫困：往回推 1 m、往左 1 m、往右 1 m（各推完再直線推向目標）、點地（L.tap_ground）到目標再往外 0.5 m（＝樓梯底外 1 m）；記出不出得來、幾秒；還是出不來就結束這一趟（下一趟重新讀檔）。
  上樓：每座走 UP 趟、跑 UP 趟（預設各 1）：【前置／捷徑】讀檔到下層樓梯底外 1 m，反方向推到樓梯頂外 1 m，記到頂時的 lv（不脫困，卡住只記診斷）。
判定（每趟一個 check）：
  下樓 PASS＝每一段都到了、沒有卡住、到底（停下 0.8 秒後）lv＝該樓梯下層的 lv（都是 0）；中間平台也檢查 lv（平台都在第 0 層）。
  還在上層的 lv、或卡住（即使脫困成功）＝FAIL（FAIL 才截圖）。
  上樓 PASS＝到了樓梯頂外 1 m、lv＝上層的 lv（總圖 v1 的 LIB_C 上層是平台＝lv0）。
結尾印每座總表：走／跑各幾趟到底 lv 正確、卡住幾次與座標、脫困結果、上樓到頂的 lv。
Playwright 手機模擬（PC GPU 或雲端 SwiftShader）≠ iPhone 實機。
用法：LW_TESTS=<wt>/tests SHA=<sha> PARTS=LINZE,DORM,LIB_C,LIB_L,LIB_R,WANCAI RUNS=5 [UP=1] [MAX_S=60] [FPSCAP=0|10] python3 cc_stairdown_probe.py <url> <out>"""
import os, sys, json, time, math, asyncio, datetime
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
import cc_fn_lib as F
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
SHA = os.environ.get('SHA') or ''
ALL_PARTS = ['LINZE', 'DORM', 'LIB_C', 'LIB_L', 'LIB_R', 'WANCAI']
PARTS = [p.strip().upper() for p in (os.environ.get('PARTS') or ','.join(ALL_PARTS)).split(',') if p.strip()]
RUNS = int(os.environ.get('RUNS') or '5')
UP = int(os.environ.get('UP') or '1')
MAX_S = float(os.environ.get('MAX_S') or '60')
FPSCAP = int(os.environ.get('FPSCAP') or '0')
STAIR_DAY = os.environ.get('STAIR_DAY') or '2025-11-05'
STAIR_H = float(os.environ.get('STAIR_H') or '15.0')
NEAR_MID = 0.3    # 中間平台：到目標 0.3 m 內（目標在平台裡面 ≥0.5 m，到的時候一定已經離開上一跑）
NEAR_BOT = 0.3    # 樓梯底：目標在樓梯底外 0.5 m，到 0.3 m 內＝至少已經走出樓梯 0.2 m
R = L.Run('stairdown', OUT); F.setup(R, OUT)
J = F.J
DAY1 = datetime.date(2025, 9, 17)

# ---------------------------------------------------------------- 樓梯資料（從遊戲的全域配置讀）
ROUTES_JS = r"""(part=>{ const f2=v=>+(+v).toFixed(2); const P=(x,z,lv,label,o)=>Object.assign({x:f2(x),z:f2(z),lv:lv,label:label},o||{});
  const T=0.5, U=1.0;
  if(part==='LINZE'){ if(typeof LINZE_LAYOUT==='undefined') return {ok:false, why:'沒有 LINZE_LAYOUT'};
    const L=LINZE_LAYOUT, S=L.stair, LD=S.landing, F1=S.flight1, F2=S.flight2, sx=(S.x0+S.x1)/2, ldz=(LD.z0+LD.z1)/2;
    return {ok:true, part:part, zone:'linze', name:'法律系館A（霖澤館）樓梯：第二跑＋中間平台＋第一跑', yawDown:0,
      src:'LINZE_LAYOUT.stair（src/data/linze_layout.js v'+L.version+'）x '+S.x0+'～'+S.x1+'；第二跑 z '+F2.z0+'（頂，接二樓迴廊 lv1）～'+F2.z1+'；平台 z '+LD.z0+'～'+LD.z1+' y '+LD.y+'；第一跑 z '+F1.z0+'～'+F1.z1+'（底）',
      start:P(sx,F2.z0-U,1,'二樓迴廊、樓梯頂外 1 m'),
      down:[P(sx,ldz,0,'中間平台（第二跑底）',{diag:{x:sx,edge:F2.z1,dir:1}}), P(sx,F1.z1+T,0,'一樓樓梯底外 0.5 m',{bottom:true,diag:{x:sx,edge:F1.z1,dir:1}})],
      upStart:P(sx,F1.z1+U,0,'一樓樓梯底外 1 m'),
      up:[P(sx,ldz,0,'中間平台'), P(sx,F2.z0-U,1,'二樓迴廊（樓梯頂外 1 m）',{top:true})]}; }
  if(part==='DORM'){ if(typeof DORM_LAYOUT==='undefined') return {ok:false, why:'沒有 DORM_LAYOUT'};
    const L=DORM_LAYOUT, S=L.stair, A=S.A, B=S.B, LD=S.landing, ax=(A.x0+A.x1)/2, bx=(B.x0+B.x1)/2, ldz=(LD.z0+LD.z1)/2;
    return {ok:true, part:part, zone:'dorm_hall', name:'男生宿舍雙跑樓梯：B 跑（往北下）＋平台轉向＋A 跑（往南下）', yawDown:Math.PI,
      src:'DORM_LAYOUT.stair（src/data/dorm_layout.js v'+L.version+'）B 跑 x '+B.x0+'～'+B.x1+' z '+B.z0+'（底，平台）～'+B.z1+'（頂，二樓走廊 lv1）；平台 x '+LD.x0+'～'+LD.x1+' z '+LD.z0+'～'+LD.z1+' y '+LD.y+'；A 跑 x '+A.x0+'～'+A.x1+' z '+A.z0+'（頂，平台）～'+A.z1+'（底，一樓走廊）',
      start:P(bx,B.z1+U,1,'二樓走廊、B 跑頂外 1 m'),
      down:[P(bx,ldz,0,'平台（B 跑底）',{diag:{x:bx,edge:B.z0,dir:-1}}), P(ax,ldz,0,'平台上轉到 A 跑頂',{diag:{x:ax,edge:A.z0,dir:-1}}), P(ax,A.z1+T,0,'一樓走廊（A 跑底外 0.5 m）',{bottom:true,diag:{x:ax,edge:A.z1,dir:1}})],
      upStart:P(ax,A.z1+U,0,'一樓走廊、A 跑底外 1 m'),
      up:[P(ax,ldz,0,'平台（A 跑頂）'), P(bx,ldz,0,'平台上轉到 B 跑底'), P(bx,B.z1+U,1,'二樓走廊（B 跑頂外 1 m）',{top:true})]}; }
  if(part==='WANCAI'){ if(typeof WANCAI_LAYOUT==='undefined') return {ok:false, why:'沒有 WANCAI_LAYOUT'};
    const L=WANCAI_LAYOUT, S=L.stair, LD=S.landing, F1=S.flight1, F2=S.flight2, sx=(S.x0+S.x1)/2, ldz=(LD.z0+LD.z1)/2;
    return {ok:true, part:part, zone:'wancai', name:'法律系館B（萬才館）西側樓梯：第二跑＋中間平台＋第一跑（往北下）', yawDown:Math.PI,
      src:'WANCAI_LAYOUT.stair（src/data/wancai_layout.js v'+L.version+'）x '+S.x0+'～'+S.x1+'；第二跑 z '+F2.z0+'～'+F2.z1+'（頂，二樓門廳 lv1）；平台 z '+LD.z0+'～'+LD.z1+' y '+LD.y+'；第一跑 z '+F1.z0+'（底）～'+F1.z1,
      start:P(sx,F2.z1+U,1,'二樓門廳、樓梯頂外 1 m'),
      down:[P(sx,ldz,0,'中間平台（第二跑底）',{diag:{x:sx,edge:F2.z0,dir:-1}}), P(sx,F1.z0-T,0,'一樓樓梯底外 0.5 m',{bottom:true,diag:{x:sx,edge:F1.z0,dir:-1}})],
      upStart:P(sx,F1.z0-U,0,'一樓樓梯底外 1 m'),
      up:[P(sx,ldz,0,'中間平台'), P(sx,F2.z1+U,1,'二樓門廳（樓梯頂外 1 m）',{top:true})]}; }
  if(part==='LIB_C'||part==='LIB_L'||part==='LIB_R'){ if(typeof LIBRARY_LAYOUT==='undefined') return {ok:false, why:'沒有 LIBRARY_LAYOUT'};
    const L=LIBRARY_LAYOUT;
    if(L.version===2&&L.bookstair){ const BS=L.bookstair, K=BS.walk, lowZ1=(BS.low||'z1')==='z1', bot=lowZ1?BS.z1:BS.z0, top=lowZ1?BS.z0:BS.z1, dd=lowZ1?1:-1;
      const x=part==='LIB_C'?(K.x0+K.x1)/2:(part==='LIB_L'?K.x0+0.45:K.x1-0.45), line=part==='LIB_C'?'中線':(part==='LIB_L'?'左線（離走道西邊 0.45 m）':'右線（離走道東邊 0.45 m）');
      return {ok:true, part:part, zone:'library_hall', name:'總圖 v2 台階書牆（中間走的那一跑，兩層共用）'+line+' x='+f2(x), yawDown:dd>0?0:Math.PI, v2:true,
        src:'LIBRARY_LAYOUT.version 2 的 bookstair（src/data/library_layout.js、src/library_hall_v2.js）z '+BS.z0+'～'+BS.z1+'（低端 '+(BS.low||'z1')+'）、走道 walk x '+K.x0+'～'+K.x1+' '+K.risers+' 階；上層＝二樓北側連廊 upper.north z '+L.upper.north.z0+'～'+L.upper.north.z1+'。v2 沒有帝國式的左右兩跑（兩側是坐的大階梯，導航擋住）：LIB_L／LIB_R 改測走道左右兩條線',
        start:P(x,top-dd*U,1,'二樓北側連廊、樓梯頂外 1 m'),
        down:[P(x,bot+dd*T,0,'一樓大廳（樓梯底外 0.5 m）',{bottom:true,diag:{x:x,edge:bot,dir:dd}})],
        upStart:P(x,bot+dd*U,0,'一樓大廳、樓梯底外 1 m'),
        up:[P(x,top-dd*U,1,'二樓北側連廊（樓梯頂外 1 m）',{top:true})]}; }
    const S=L.stair, C=S.center, LD=S.landing, SD=S.side;
    if(part==='LIB_C') return {ok:true, part:part, zone:'library_hall', name:'總圖 v1 帝國式大樓梯：中間那一跑（平台 → 大廳）', yawDown:0,
      src:'LIBRARY_LAYOUT.version '+L.version+' 的 stair.center（src/data/library_layout.js、src/library3d.js）x '+C.x0+'～'+C.x1+' z '+C.z0+'（頂，平台 y '+LD.y+'，第 0 層）～'+C.z1+'（底，大廳）',
      start:P(0,C.z0-U,0,'平台、中間那一跑頂外 1 m（平台在第 0 層）'),
      down:[P(0,C.z1+T,0,'一樓大廳（中間那一跑底外 0.5 m）',{bottom:true,diag:{x:0,edge:C.z1,dir:1}})],
      upStart:P(0,C.z1+U,0,'一樓大廳、中間那一跑底外 1 m'),
      up:[P(0,C.z0-U,0,'平台（中間那一跑頂外 1 m，第 0 層）',{top:true})]};
    const sd=S.sides[part==='LIB_L'?0:1], sx=(sd.x0+sd.x1)/2;
    return {ok:true, part:part, zone:'library_hall', name:'總圖 v1 帝國式大樓梯：'+(part==='LIB_L'?'左':'右')+'那一跑（二樓連廊 → 平台）', yawDown:Math.PI,
      src:'LIBRARY_LAYOUT.version '+L.version+' 的 stair.sides['+(part==='LIB_L'?0:1)+']／stair.side（src/data/library_layout.js、src/library3d.js）x '+sd.x0+'～'+sd.x1+' z '+SD.z0+'（底，平台）～'+SD.z1+'（頂，二樓連廊 lv1）',
      start:P(sx,SD.z1+U,1,'二樓連廊、樓梯頂外 1 m'),
      down:[P(sx,SD.z0-T,0,'平台（這一跑底外 0.5 m）',{bottom:true,diag:{x:sx,edge:SD.z0,dir:-1}})],
      upStart:P(sx,SD.z0-U,0,'平台、這一跑底外 1 m'),
      up:[P(sx,SD.z1+U,1,'二樓連廊（樓梯頂外 1 m）',{top:true})]}; }
  return {ok:false, why:'不認得的 PART '+part}; })"""

VERIFY_JS = r"""(pts=>{ const E=GAME.E, Ls=E.levels||[E.nav]; return {zone:GAME.G.zone, nlv:Ls.length, pts:pts.map(p=>{ const ok=!!E.canStand(p.x,p.z,0.3,p.lv); let fix=null;
  if(!ok){ for(let r=0.1;r<=0.81&&!fix;r+=0.1) for(let a=0;a<360;a+=30){ const x=p.x+r*Math.sin(a*Math.PI/180), z=p.z+r*Math.cos(a*Math.PI/180); if(E.canStand(x,z,0.3,p.lv)){ fix={x:+x.toFixed(2),z:+z.toFixed(2)}; break; } } }
  const n=Ls[p.lv]; return {label:p.label, lv:p.lv, x:p.x, z:p.z, stand:ok, h:(n&&n.heightAt)?+n.heightAt(p.x,p.z).toFixed(2):null, fix:fix}; })}; })"""

UNSTICK_JS = r"""(()=>{ const E=GAME.E; if(!E||E.__ccUnw||!E.unstick) return; const f=E.unstick; E.unstick=function(){ const r=f.apply(this,arguments); if(r) window.__ccUnstick=(window.__ccUnstick|0)+1; return r; }; E.__ccUnw=1; })()"""
FPSCAP_JS = r"""(cap=>{ const W=window; if(!W.__rafOrig) W.__rafOrig=W.requestAnimationFrame.bind(W); const orig=W.__rafOrig;
  if(!cap){ W.requestAnimationFrame=orig; W.__fpsCap=0; return 0; } const gap=1000/cap; W.__fpsCap=cap; let last=0;
  W.requestAnimationFrame=cb=>orig(function tick(t){ if(t===last||t-last>=gap-1){ last=t; cb(t); } else orig(tick); }); return cap; })"""   # 同 cc_stair_probe（CC 08:4x 修過的版本）
FPS_JS = "new Promise(res=>{ let n=0; const t0=performance.now(); const f=()=>{ n++; if(performance.now()-t0<2000) requestAnimationFrame(f); else res(+(n/((performance.now()-t0)/1000)).toFixed(1)); }; requestAnimationFrame(f); })"
RUN_JS = "(()=>!!GAME.E.player.runHold)()"
CAL_JS = "(d=>{ const x=CALENDAR.dateOf(d); return {key:x.key, wd:x.wd%7}; })"
STUCK_JS = r"""(a=>{ const E=GAME.E, P=E.player, o=P.obj.position, lv=P.lv|0, f2=v=>v==null?null:+(+v).toFixed(2), Ls=E.levels||[];
  const cell=(x,z)=>({x:f2(x), z:f2(z), s0:!!E.canStand(x,z,0.3,0), s1:Ls.length>1?!!E.canStand(x,z,0.3,1):null, h0:(Ls[0]&&Ls[0].heightAt)?f2(Ls[0].heightAt(x,z)):null, h1:(Ls[1]&&Ls[1].heightAt)?f2(Ls[1].heightAt(x,z)):null});
  const near=(E.npcs||[]).filter(n=>n&&n.obj&&Math.hypot(n.obj.position.x-o.x,n.obj.position.z-o.z)<2.5).map(n=>{ const q=n.obj.position; return {id:n.charId||n.id||'', name:n.name||'', x:f2(q.x), z:f2(q.z), y:f2(q.y), lv:n.lv|0, walking:!!(n.path&&n.path.length), extra:!!n.isExtra}; });
  const around=[]; for(let k=-7;k<=7;k++) around.push(cell(o.x,o.z+k*0.1));
  const bottom=[]; for(let k=-8;k<=5;k++){ const d=k*0.2; bottom.push(Object.assign({d:f2(d)},cell(o.x,a.edge+a.dir*d))); }
  const line=[]; if(Math.abs(o.x-a.x)>0.05) for(let k=-8;k<=5;k++){ const d=k*0.2; line.push(Object.assign({d:f2(d)},cell(a.x,a.edge+a.dir*d))); }
  let path=null; try{ const p=E.pathTo(o.x,o.z,lv,a.tx,a.tz,a.tlv); path=p?p.slice(0,8).map(q=>Array.isArray(q)?q.map(f2):[f2(q.x),f2(q.z),q.lv]):null; }catch(e){ path=String(e); }
  return {pos:{x:f2(o.x), z:f2(o.z), y:f2(o.y), lv:lv}, near:near, around:around, bottom:bottom, line:line, path:path, unstick:window.__ccUnstick|0, fb:GAME.walkFallbacks||0, run:!!P.runHold, blockedAt:P.blockedAt||null}; })"""


def day_of(key):
    return (datetime.date.fromisoformat(key) - DAY1).days + 1


def base(zone, p, yaw):
    s = F.day46(); d = datetime.date.fromisoformat(STAIR_DAY)
    s['day'] = day_of(STAIR_DAY); s['weekday'] = d.isoweekday() % 7; s['hour'] = STAIR_H; s['zone'] = zone
    s['pos'] = {'x': p['x'], 'z': p['z'], 'yaw': yaw, 'lv': p['lv']}; s['weather'] = 'clear'; s['invites'] = []
    return s


def pt(p):
    return '(%.2f, %.2f) lv%d' % (p['x'], p['z'], p['lv'])


def end4(e):
    return [e['x'], e['z'], e.get('y'), e['lv']]


async def load_at(pg, cdp, rt, p, yaw, run, why):
    s = base(rt['zone'], p, yaw)
    try: await L.load_state(pg, s, quiet_events=True, quiet_phone=True)
    except TypeError: await L.load_state(pg, s, quiet_events=True)
    await pg.wait_for_timeout(4000); await L.close_panels(pg, cdp); await pg.evaluate(UNSTICK_JS); await F.ready(pg, cdp, 30)
    if FPSCAP: await pg.evaluate(FPSCAP_JS, FPSCAP)
    on = await pg.evaluate(RUN_JS)
    if on != run: await L.tap(pg, cdp, '#btnRun'); await pg.wait_for_timeout(400)
    run_now = await pg.evaluate(RUN_JS); st = await D.st(pg); c = await pg.evaluate(CAL_JS, s['day'])
    R.setup('%s：day46 存檔 → %s %05.2f %s %s「%s」%s（站在 (%.2f, %.2f) y=%s lv%d、站得住 %s；跑步 %s%s）' % (
        why, c['key'], STAIR_H, rt['zone'], pt(p), p['label'], '、【捷徑】限 %d fps' % FPSCAP if FPSCAP else '', st['x'], st['z'], st['y'], st['lv'], st['stand'], run_now, '（觸控按「跑」）' if run else ''))
    ok = st['zone'] == rt['zone'] and st['lv'] == p['lv'] and math.hypot(st['x'] - p['x'], st['z'] - p['z']) < 0.6 and run_now == run
    if not ok: R.note('%s 讀檔後的位置／層／跑步不對：%s' % (why, J(st)))
    return ok, st


async def stuck_diag(pg, tag, wp):
    dg = dict(wp['diag']) if wp.get('diag') else {'x': wp['x'], 'edge': wp['z'], 'dir': 1}
    dg.update({'tx': wp['x'], 'tz': wp['z'], 'tlv': wp['lv']})
    d = await pg.evaluate(STUCK_JS, dg)
    R.note('%s 【卡住診斷】位置 %s；blockedAt %s；2.5 m 內 NPC %s；E.pathTo 到目標 %s；E.unstick 成功 %s 次；walkFallbacks %s；跑步 %s' % (tag, J(d['pos']), J(d['blockedAt']), J(d['near']), J(d['path']), d['unstick'], d['fb'], d['run']))
    R.note('%s 【卡住診斷】人所在那條線往前後 0.7 m（s0／s1＝第 0／1 層站不站得住、h0／h1＝高度）%s' % (tag, J(d['around'])))
    R.note('%s 【卡住診斷】樓梯底附近（同一個 x；d＝離樓梯底邊 %.2f 往外的距離，負＝在樓梯上）%s' % (tag, dg['edge'], J(d['bottom'])))
    if d['line']: R.note('%s 【卡住診斷】樓梯中線 x=%.2f 的同一段 %s' % (tag, dg['x'], J(d['line'])))
    await snap(pg, tag)
    return d


async def snap(pg, tag):
    nm = 'stairdown_' + ''.join(ch for ch in tag if ch.isalnum() and ord(ch) < 128)[:40].lower() + '_%d' % int(time.time() * 10 % 100000)
    try:
        await pg.screenshot(path=os.path.join(OUT, nm + '.png')); R.note('%s 截圖 %s.png' % (tag, nm))
    except Exception as e:
        R.note('%s 截圖失敗 %r' % (tag, e))


async def seg(pg, cdp, tag, tx, tz, near):
    r = await F.joy_to(pg, cdp, tag, tx, tz, near=near, lv=None, max_s=MAX_S, straight=True)
    e = r['end']
    R.note('%s → (%.2f, %.2f)：%s、%s 秒、推 %d 次、到 (%.2f, %.2f) y=%s lv%d、跳 %s' % (tag, tx, tz, '到了' if r['ok'] else '沒到：' + str(r.get('why')), r['t'], r['pushes'], e['x'], e['z'], e.get('y'), e['lv'], J(r['jumps'])))
    return r


def passed(s, wp, u, near):
    """到了這一點：在該層、而且沿行進方向已經走到目標前 near 以內（或超過）"""
    if s['lv'] != wp['lv']: return False
    along = (s['x'] - wp['x']) * u[0] + (s['z'] - wp['z']) * u[1]
    side = abs(-(s['x'] - wp['x']) * u[1] + (s['z'] - wp['z']) * u[0])
    return along >= -near - 0.05 and side <= 0.8


async def escape(pg, cdp, t, wp, u, near):
    """依序試：往回推 1 m、往左 1 m、往右 1 m（各推完再直線推向目標）、點地到目標再往外 0.5 m；前一個已脫困就不試後面的。回傳 [(方法, 出得來, 秒)]"""
    out = []
    async def ok_now():
        return passed(await D.st(pg), wp, u, near)
    lx, lz = u[1], -u[0]   # 面向行進方向 u 的左手邊（x 往東、z 往南：往北走時左邊是西）；log 印實際推到的座標
    for nm, dx, dz in (('往回推 1 m', -u[0], -u[1]), ('往左 1 m', lx, lz), ('往右 1 m', -lx, -lz)):
        if await ok_now(): out.append([nm, None, None]); continue
        t0 = time.time(); q = await D.st(pg)
        await seg(pg, cdp, '%s 【脫困】%s（到 (%.2f, %.2f)）' % (t, nm, q['x'] + dx, q['z'] + dz), q['x'] + dx, q['z'] + dz, 0.3)
        r = await seg(pg, cdp, '%s 【脫困】%s後再直線推向目標' % (t, nm), wp['x'], wp['z'], near)
        ok = await ok_now(); out.append([nm, ok, round(time.time() - t0, 1)])
        R.note('%s 【脫困】%s：%s（%.1f 秒；停在 %s）' % (t, nm, '出來了' if ok else '還是出不來', time.time() - t0, J(end4(r['end']))))
    if not await ok_now():
        gx, gz = wp['x'] + u[0] * 0.5, wp['z'] + u[1] * 0.5
        t0 = time.time(); p = await L.tap_ground(pg, cdp, gx, gz, lv=wp['lv'])
        for _ in range(40):
            await pg.wait_for_timeout(500)
            if await ok_now(): break
        ok = await ok_now(); q = await D.st(pg); out.append(['點地到目標外 0.5 m', ok, round(time.time() - t0, 1)])
        R.note('%s 【脫困】點地 (%.2f, %.2f) lv%d：%s（%.1f 秒；%s；停在 (%.2f, %.2f) y=%s lv%d）' % (t, gx, gz, wp['lv'], '出來了' if ok else '還是出不來', time.time() - t0, '點到 %s' % J(p.get('hit')) if p else '那一點不在畫面上／被按鈕蓋住，沒點', q['x'], q['z'], q['y'], q['lv']))
    else: out.append(['點地到目標外 0.5 m', None, None])
    R.note('%s 【脫困】結果（None＝前面已脫困、沒試）%s' % (t, J(out)))
    return out


def unit(a, b):
    dx, dz = b['x'] - a['x'], b['z'] - a['z']; m = math.hypot(dx, dz) or 1.0
    return (dx / m, dz / m)


async def trip_down(pg, cdp, rt, k, run, st):
    t = '[%s %s 下樓 第 %d 趟]' % (rt['part'], '跑' if run else '走', k)
    ok_load, _ = await load_at(pg, cdp, rt, rt['start'], rt['yawDown'], run, '【前置／捷徑】%s 讀檔到上層樓梯口前 1 m' % t)
    rec = {'trip': k, 'stuck': None, 'bottom': None, 'mids': []}
    if not ok_load:
        R.check('%s 讀檔到起點（前置）' % t, False); st['bad_load'] += 1; return rec
    prev = rt['start']; good = True
    for wp in rt['down']:
        near = NEAR_BOT if wp.get('bottom') else NEAR_MID
        u = unit(prev, wp)
        r = await seg(pg, cdp, '%s 推到「%s」' % (t, wp['label']), wp['x'], wp['z'], near)
        if not r['ok']:
            d = await stuck_diag(pg, t, wp)
            esc = await escape(pg, cdp, t, wp, u, near)
            rec['stuck'] = {'seg': wp['label'], 'pos': d['pos'], 'why': r.get('why'), 'escape': esc}
            good = False
            if not any(e[1] for e in esc):
                R.check('%s 卡在往「%s」的路上、脫困不出來' % (t, wp['label']), False, J(d['pos'])); break
        await pg.wait_for_timeout(800); s = await D.st(pg)
        arr = end4(r['end']); now = [s['x'], s['z'], s['y'], s['lv']]
        if wp.get('bottom'):
            rec['bottom'] = {'arrive': arr, 'settled': now}
            ok = good and s['lv'] == wp['lv'] and passed(s, wp, u, near)
            R.check('%s 到樓梯底、lv%d（%s）' % (t, wp['lv'], wp['label']), ok, J({'到的時候 x,z,y,lv': arr, '停下 0.8 秒後': now, '秒': r['t'], '卡住': rec['stuck']}))
            if not ok and good: await snap(pg, t + ' bottom')
            if ok: st['ok'] += 1
        else:
            rec['mids'].append({'label': wp['label'], 'arrive': arr, 'settled': now})
            okm = s['lv'] == wp['lv']
            R.check('%s 到「%s」時是 lv%d' % (t, wp['label'], wp['lv']), okm, J({'到的時候': arr, '停下後': now, '秒': r['t']}))
            if not okm: await snap(pg, t + ' mid')
        prev = wp
    if rec['stuck']: st['stuck'].append(rec['stuck'])
    st['n'] += 1; st['trips'].append(rec)
    return rec


async def trip_up(pg, cdp, rt, k, run, up):
    t = '[%s %s 上樓 第 %d 趟]' % (rt['part'], '跑' if run else '走', k)
    ok_load, _ = await load_at(pg, cdp, rt, rt['upStart'], (rt['yawDown'] + math.pi) % (2 * math.pi), run, '【前置／捷徑】%s 讀檔到下層樓梯底外 1 m' % t)
    if not ok_load:
        R.check('%s 讀檔到起點（前置）' % t, False); return
    prev = rt['upStart']; res = {'trip': k, 'run': run}
    for wp in rt['up']:
        near = NEAR_BOT if wp.get('top') else NEAR_MID
        u = unit(prev, wp)
        r = await seg(pg, cdp, '%s 推到「%s」' % (t, wp['label']), wp['x'], wp['z'], near)
        if not r['ok']:
            d = await stuck_diag(pg, t, wp); res['stuck'] = {'seg': wp['label'], 'pos': d['pos']}
            R.check('%s 往「%s」卡住' % (t, wp['label']), False, J(d['pos'])); break
        await pg.wait_for_timeout(800); s = await D.st(pg)
        if wp.get('top'):
            res['top'] = [s['x'], s['z'], s['y'], s['lv']]
            ok = s['lv'] == wp['lv'] and passed(s, wp, u, near)
            R.check('%s 到樓梯頂外、lv%d（%s）' % (t, wp['lv'], wp['label']), ok, J({'到的時候': end4(r['end']), '停下後': res['top'], '秒': r['t']}))
            if not ok: await snap(pg, t + ' top')
        prev = wp
    up.append(res)


async def main():
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        R.check('遊戲載入', await L.wait_loaded(pg))
        ver = await pg.evaluate("(document.body.innerText.match(/版本 v[0-9.]+/)||[''])[0]")
        R.note('CC STAIRDOWN：受測 SHA %s、%s；PARTS %s；每座下樓走 %d 趟＋跑 %d 趟、上樓走 %d＋跑 %d；每段最多 %.0f 秒；%s；Playwright 手機模擬 ≠ iPhone' % (
            SHA or '（沒給）', ver, J(PARTS), RUNS, RUNS, UP, UP, MAX_S, ('限 %d fps' % FPSCAP) if FPSCAP else '不限幀率'))
        table = []
        for part in PARTS:
            print('== %s' % part, flush=True)
            rt = await pg.evaluate(ROUTES_JS, part)
            if not rt.get('ok'):
                R.check('[%s] 讀得到樓梯資料' % part, False, rt.get('why', '')); continue
            R.note('[%s] %s；zone %s' % (part, rt['name'], rt['zone']))
            R.note('[%s] 樓梯資料來源：%s' % (part, rt['src']))
            R.note('[%s] 下樓起點 %s「%s」→ %s；上樓起點 %s → %s' % (part, pt(rt['start']), rt['start']['label'], '、'.join('%s「%s」' % (pt(w), w['label']) for w in rt['down']), pt(rt['upStart']), '、'.join('%s「%s」' % (pt(w), w['label']) for w in rt['up'])))
            stats = {'part': part, 'name': rt['name'], 'walk': {'n': 0, 'ok': 0, 'stuck': [], 'trips': [], 'bad_load': 0}, 'run': {'n': 0, 'ok': 0, 'stuck': [], 'trips': [], 'bad_load': 0}, 'up': []}
            n0 = len(errs); t0 = time.time()
            try:
                # 第一次讀檔：驗每一點站不站得住（站不住就換成 0.8 m 內最近站得住的點）
                await load_at(pg, cdp, rt, rt['start'], rt['yawDown'], False, '【前置／捷徑】[%s] 驗樓梯點' % part)
                allp = [rt['start']] + rt['down'] + [rt['upStart']] + rt['up']
                v = await pg.evaluate(VERIFY_JS, allp)
                R.note('[%s] 區域 %s、%d 層；每一點站不站得住（stand）、高度（h）、站不住時換成的點（fix）%s' % (part, v['zone'], v['nlv'], J(v['pts'])))
                R.check('[%s] 區域對、有兩層導航' % part, v['zone'] == rt['zone'] and v['nlv'] >= 2, J({'zone': v['zone'], 'nlv': v['nlv']}))
                for q, r0 in zip(allp, v['pts']):
                    if not r0['stand'] and r0['fix']:
                        R.note('[%s] 「%s」%s 站不住 → 改用 (%.2f, %.2f)' % (part, q['label'], pt(q), r0['fix']['x'], r0['fix']['z'])); q['x'], q['z'] = r0['fix']['x'], r0['fix']['z']
                    elif not r0['stand']: R.note('[%s] 「%s」%s 站不住、0.8 m 內也找不到站得住的點（照原點推）' % (part, q['label'], pt(q)))
                fps = await pg.evaluate(FPS_JS); R.note('[%s] 幀率 %s fps' % (part, fps))
                for k in range(1, RUNS + 1):
                    for run in (False, True):
                        await trip_down(pg, cdp, rt, k, run, stats['run' if run else 'walk'])
                for k in range(1, UP + 1):
                    for run in (False, True):
                        await trip_up(pg, cdp, rt, k, run, stats['up'])
            except Exception as e:
                R.check('[%s] 探針沒有例外' % part, False, repr(e)[:300])
            R.check('[%s] 沒有 JS 例外' % part, len(errs) == n0, J(errs[n0:n0 + 3]))
            R.note('[%s] 用了 %.0f 秒' % (part, time.time() - t0))
            table.append(stats)
        rows = []
        for s in table:
            row = {'座': s['part'], '樓梯': s['name']}
            for m, nm in (('walk', '走'), ('run', '跑')):
                x = s[m]
                row[nm + '：到底 lv 正確'] = '%d/%d' % (x['ok'], x['n']) + (('（讀檔失敗 %d）' % x['bad_load']) if x['bad_load'] else '')
                row[nm + '：卡住'] = '%d 次' % len(x['stuck'])
                row[nm + '：卡住座標與脫困'] = [{'段': q['seg'], '座標 x,z,y,lv': [q['pos']['x'], q['pos']['z'], q['pos']['y'], q['pos']['lv']], '脫困': q['escape']} for q in x['stuck']]
                row[nm + '：到底（停下後 x,z,y,lv）'] = [tr['bottom']['settled'] if tr['bottom'] else None for tr in x['trips']]
            row['上樓到頂（x,z,y,lv）'] = [{'跑' if u['run'] else '走': u.get('top'), '卡住': u.get('stuck')} for u in s['up']]
            rows.append(row)
        R.note('【總表】%s' % J(rows))
        for row in rows:
            print('  %-6s 走 %s 卡 %s｜跑 %s 卡 %s｜上樓 %s' % (row['座'], row['走：到底 lv 正確'], row['走：卡住'], row['跑：到底 lv 正確'], row['跑：卡住'], J(row['上樓到頂（x,z,y,lv）'])), flush=True)
        await b.close()
    return R.finish()


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
