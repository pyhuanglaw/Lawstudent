"""CC（帳號 A）11-11：STAIRX——候選版 7d9c46786 修的三座樓梯，照木曜日（cc_stair_probe.py）的走法在瀏覽器裡跑（BB 指派）。
7d9c46786（LAWWW 整合 LAWWW2 的 STAIR-LEVEL-AUDIT-1111）修了：
  FLOWER 花序 Flower Notes（zone flower_notes，src/flower_notes3d.js）：下樓過了一半還留在第 1 層（和木曜日 2c962ad66 同一類）→ 第 1 層樓梯下半段 blockRect
  LIBC   總圖大廳台階書牆中間那一跑（zone library_hall，src/library_hall_v2.js 的 bookstair.walk）：同一類 → 同一種 blockRect
  BURGER 大口漢堡（zone xs_dakou，src/dakou3d.js）樓梯頂右側接牆：跑步、10 fps 一步 0.62 m 整步落進牆裡就停住 → engine3d.js stepEntity「試走半步」
樓梯從哪裡來（不猜）：LAWWW 的 Node 測試 tests/stair_levels_audit_1111_unit.js（7d9c46786）的找法——
  E.levels[0].surf 和 E.levels[1].surf 都有、有坡度 axis 的那一段＝兩層共用的樓梯；
  左中右＝樓梯中間那一條橫線上「任一層站得住（NavGrid.clear，半徑 0.32）」的最左＋0.02、中間、最右−0.02；
  兩端點＝從樓梯端往外 0.5 m 往裡找（每 0.05 m）第一個「某一層站得住、高度差 < 0.35 m」的點（樓梯端直接接牆的就停在樓梯上最靠端的那一點）。
  探針在遊戲裡照同一套算一次（GEO_JS），再和寫死的 REF 比（REF＝那支測試的算法在 Node 對 7d9c46786 算出來的值；線上 779ddd650 的總圖、大口算出來一模一樣，線上沒有花序）。
  兩者差超過 0.05 m 就在 log 標出來、照遊戲裡算的走。
  三座都是單跑、往 −z 爬（上層 lv1、下層 lv0）；「左」＝上樓時的左手邊＝x 小的那一側。
做法（Playwright 手機模擬（PC GPU 或雲端 SwiftShader）≠ iPhone 實機）：
  【前置／捷徑】day46 存檔（fixtures/user_saves_1107）改日期 STAIR_DAY（預設 2025-11-05 週三）STAIR_H（15:00）、區域、位置＝那條線的樓梯底外（lv0），
     關條件事件（quiet_events）、STORY.phoneAuto=()=>{}。花序沒有營業時間表（整天開）、大口漢堡 24 小時（crowd3d.js、xs_close3d.js），總圖平日下午開。
  每條線 TRIPS 趟（預設 5），每趟：
    上：從樓梯底外，搖桿直線推（cc_fn_lib.joy_to straight＝一直朝目標推、不繞路）到同一條線的樓梯頂外（lv1）；
    下：（離樓梯頂外那一點 > 0.4 m 才先直線推回去）從樓梯頂外直線推到樓梯底外（lv0）。下一趟從這裡接著上。
    不瞬移、不用 ?turbo；跑步＝觸控按 #btnRun（切換；走的時候確定是關的）；FPSCAP＝10：包 requestAnimationFrame 限 10 fps（【前置／捷徑】只改幀率；
    同一幀的時間戳記全部放行——CC 08:4x 修過的版本，不然量幀率的回呼會餓死）。
  每一段記：到了沒、秒數、推幾次、到的時候與停下 0.8 秒後的 x/z/y/lv；下樓另外記「過了樓梯一半以後還在第 1 層」的取樣數（資訊，不算失敗）。
  20 秒沒前進 0.3 m＝卡住（joy_to 判）→ 截圖＋診斷（位置、blockedAt、2.5 m 內 NPC、E.pathTo、E.unstick 次數；
     人所在那條線前後 0.7 m、樓梯底往上 1 m～往外 1 m、樓梯頂往下 1 m～往外 1 m 每 0.2 m 第 0／1 層站不站得住 s0／s1 與高度 h0／h1）
     → 脫困四法（前一個已脫困就不試後面的）：往回 1 m、往左 1 m、往右 1 m（各推完再直線推向目標）、點地（L.tap_ground）到樓梯外 1 m
       （那一點站不住＝樓梯端接牆，改點目標點，log 標明）；還是出不來＝【捷徑】重新讀檔到下一段的起點。
判準（每一段一個 check）：
  上樓 PASS＝搖桿推到樓梯頂外（near 0.3 m；端點接牆的 0.25 m；兩次取樣之間穿過也算）那時是 lv1、停下 0.8 秒後還是 lv1、沒卡住。
  下樓 PASS＝推到樓梯底外那時是 lv0、停下 0.8 秒後還是 lv0、沒卡住。停下後離目標多遠只記（> 0.45 m 印「注意」）。
  卡住過的那一段，就算後來脫困也算 FAIL。
結尾：每座、每條線印總表：上 n/TRIPS、下 n/TRIPS、卡住座標（與脫困結果）、下樓過半還在第 1 層的趟數。
新版和線上 779ddd650 各跑一組（線上沒有花序：FLOWER 印 SKIP、不算失敗）。新版佇列用 0d1eaadc7（BB 10:2x：含 7d9c46786 全部，只差 game3d.js 點椅面的射線判，樓梯相關檔案一樣）。
用法：LW_TESTS=<wt>/tests SHA=<sha> STAIRS=FLOWER,LIBC,BURGER RUN=0|1 FPSCAP=0|10 TRIPS=5 LINES=L,C,R [MAX_S=60] python3 cc_stairx_probe.py <url> <out>"""
import os, sys, json, time, math, asyncio, datetime
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
import cc_fn_lib as F
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
SHA = os.environ.get('SHA') or ''
ALL_STAIRS = ['FLOWER', 'LIBC', 'BURGER']
STAIRS = [s.strip().upper() for s in (os.environ.get('STAIRS') or ','.join(ALL_STAIRS)).split(',') if s.strip()]
RUN = os.environ.get('RUN') == '1'
FPSCAP = int(os.environ.get('FPSCAP') or '0')
TRIPS = int(os.environ.get('TRIPS') or '5')
LINES = [s.strip().upper() for s in (os.environ.get('LINES') or 'L,C,R').split(',') if s.strip()]
MAX_S = float(os.environ.get('MAX_S') or '60')
STAIR_DAY = os.environ.get('STAIR_DAY') or '2025-11-05'
STAIR_H = float(os.environ.get('STAIR_H') or '15.0')
NEAR_OUT = 0.3    # 端點在樓梯外 0.5 m：到 0.3 m 內＝至少已經走出樓梯 0.2 m
NEAR_WALL = 0.25  # 端點接牆（在樓梯上）：到 0.25 m 內
R = L.Run('stairx', OUT); F.setup(R, OUT)
J = F.J
DAY1 = datetime.date(2025, 9, 17)
TAG = '%s%s' % ('跑' if RUN else '走', ('、%d fps' % FPSCAP) if FPSCAP else '、不限幀率')
LINE_NAME = {'L': '左', 'C': '中', 'R': '右'}

# 每座樓梯：區域、名字、程式檔、REF（tests/stair_levels_audit_1111_unit.js 的算法在 Node 對 7d9c46786 算的；779ddd650 的 LIBC、BURGER 相同，沒有 flower_notes）
# lines：[x（線，axis z 時是 x）, 底端 {u, d, acc}, 頂端 {u, d, acc}]；d＞0＝樓梯外、d≤0＝樓梯端接牆、停在樓梯上
INFO = {
    'FLOWER': {'zone': 'flower_notes', 'name': '花序 Flower Notes 一樓→二樓教室（沿東牆一跑往北爬）', 'src': 'src/flower_notes3d.js（配置 src/data/flower_notes_layout.js）',
               'ref': {'axis': 'z', 'surf': [3.5, 4.9, -5.18, 1.4], 'y': [0, 3.9], 'uLow': 1.4, 'uHigh': -5.18,
                       'lines': [[3.84, {'u': 1.9, 'd': 0.5, 'acc': [0]}, {'u': -5.68, 'd': 0.5, 'acc': [1]}],
                                 [4.12, {'u': 1.9, 'd': 0.5, 'acc': [0]}, {'u': -5.68, 'd': 0.5, 'acc': [1]}],
                                 [4.4, {'u': 1.9, 'd': 0.5, 'acc': [0]}, {'u': -5.68, 'd': 0.5, 'acc': [1]}]]}},
    'LIBC': {'zone': 'library_hall', 'name': '總圖大廳台階書牆中間那一跑（一樓大廳→二樓北側連廊）', 'src': 'src/library_hall_v2.js（LIBRARY_LAYOUT v2 bookstair.walk，src/data/library_layout.js）',
             'ref': {'axis': 'z', 'surf': [-0.9, 0.9, -14.25, -6.0], 'y': [0, 5], 'uLow': -6.0, 'uHigh': -14.25,
                     'lines': [[-0.56, {'u': -5.5, 'd': 0.5, 'acc': [0]}, {'u': -14.75, 'd': 0.5, 'acc': [1]}],
                               [0.0, {'u': -5.5, 'd': 0.5, 'acc': [0]}, {'u': -14.75, 'd': 0.5, 'acc': [1]}],
                               [0.54, {'u': -5.5, 'd': 0.5, 'acc': [0]}, {'u': -14.75, 'd': 0.5, 'acc': [1]}]]}},
    'BURGER': {'zone': 'xs_dakou', 'name': '大口漢堡一樓→二樓（右線樓梯頂、樓梯底都直接接牆）', 'src': 'src/dakou3d.js',
               'ref': {'axis': 'z', 'surf': [4.62, 5.88, -1.6, 4.0], 'y': [0, 3.6], 'uLow': 4.0, 'uHigh': -1.6,
                       'lines': [[4.98, {'u': 4.5, 'd': 0.5, 'acc': [0]}, {'u': -2.1, 'd': 0.5, 'acc': [1]}],
                                 [5.26, {'u': 4.5, 'd': 0.5, 'acc': [0]}, {'u': -2.1, 'd': 0.5, 'acc': [1]}],
                                 [5.54, {'u': 3.95, 'd': -0.05, 'acc': [0]}, {'u': -1.6, 'd': 0.0, 'acc': [1]}]]}},
}

# ---------------------------------------------------------------- 遊戲裡照 tests/stair_levels_audit_1111_unit.js 的算法找樓梯
GEO_JS = r"""(()=>{ const E=GAME.E, LV=E.levels; if(!LV||LV.length<2) return {ok:false, why:'這個區域沒有兩層導航（E.levels '+(LV?LV.length:0)+' 層）'};
  const R=0.32, f3=v=>+(+v).toFixed(3), key=s=>[s.x0,s.x1,s.z0,s.z1,s.axis,s.ya,s.yb].map(v=>v==null?'':(+v).toFixed(3)).join(',');
  const kb=new Set((LV[1].surf||[]).map(key)), stairs=(LV[0].surf||[]).filter(s=>s.axis&&kb.has(key(s)));
  if(!stairs.length) return {ok:false, why:'找不到兩層共用、有坡度的樓梯段'};
  const s=stairs[0], ax=s.axis, lo=ax==='z'?[s.z0,s.z1]:[s.x0,s.x1], cr=ax==='z'?[s.x0,s.x1]:[s.z0,s.z1];
  const uLow=s.ya<=s.yb?lo[0]:lo[1], uHigh=s.ya<=s.yb?lo[1]:lo[0], yLow=Math.min(s.ya,s.yb), yHigh=Math.max(s.ya,s.yb), du=Math.sign(uHigh-uLow);
  const P=(u,v)=>ax==='z'?[v,u]:[u,v], um=(uLow+uHigh)/2, okV=[];
  for(let v=cr[0];v<=cr[1]+1e-6;v+=0.02){ const p=P(um,v); if(LV.some(n=>n.clear(p[0],p[1],R))) okV.push(v); }
  const vs=okV.length?[...new Set([okV[0]+0.02,okV[Math.floor(okV.length/2)],okV[okV.length-1]-0.02].map(v=>+v.toFixed(3)))]:[(cr[0]+cr[1])/2];
  const okAt=(lv,p,y)=>LV[lv].clear(p[0],p[1],R)&&Math.abs(LV[lv].heightAt(p[0],p[1])-y)<0.35;
  const yAt=u=>{ const t=Math.max(0,Math.min(1,(u-uLow)/(uHigh-uLow))); return yLow+(yHigh-yLow)*t; };
  const beyond=(u,y,sg,v)=>{ for(let d=0.5;d>=-1.0;d-=0.05){ const uu=u+sg*d, yy=d>0?y:yAt(uu), acc=[0,1].filter(lv=>okAt(lv,P(uu,v),yy)); if(acc.length) return {u:f3(uu),d:+d.toFixed(2),acc:acc}; } return {u:f3(u),d:0,acc:[]}; };
  return {ok:true, zone:GAME.G.zone, nlv:LV.length, nStairs:stairs.length, axis:ax, surf:[s.x0,s.x1,s.z0,s.z1].map(f3), y:[yLow,yHigh], uLow:f3(uLow), uHigh:f3(uHigh),
    lines:vs.map(v=>[v, beyond(uLow,yLow,-du,v), beyond(uHigh,yHigh,du,v)])}; })()"""

ZONE_HAS_JS = "(id=>!!(typeof Z3!=='undefined'&&Z3.ZONES&&Z3.ZONES[id]))"
DAY_JS = "(k=>{ let d=null; if(typeof STORY!=='undefined'&&STORY.dayOfKey) d=STORY.dayOfKey(k); if(d==null){ for(let i=0;i<4000;i++){ try{ if(CALENDAR.dateOf(i).key===k){ d=i; break; } }catch(e){} } } let wd=null; try{ wd=CALENDAR.dateOf(d).wd%7; }catch(e){} return {d:d, wd:wd}; })"
PHONE_JS = "(()=>{ if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}; return true; })()"
UNSTICK_JS = r"""(()=>{ const E=GAME.E; if(!E||E.__ccUnw||!E.unstick) return; const f=E.unstick; E.unstick=function(){ const r=f.apply(this,arguments); if(r) window.__ccUnstick=(window.__ccUnstick|0)+1; return r; }; E.__ccUnw=1; })()"""
FPSCAP_JS = r"""(cap=>{ const W=window; if(!W.__rafOrig) W.__rafOrig=W.requestAnimationFrame.bind(W); const orig=W.__rafOrig;
  if(!cap){ W.requestAnimationFrame=orig; W.__fpsCap=0; return 0; } const gap=1000/cap; W.__fpsCap=cap; let last=0;
  W.requestAnimationFrame=cb=>orig(function tick(t){ if(t===last||t-last>=gap-1){ last=t; cb(t); } else orig(tick); }); return cap; })"""   # 同 cc_stair_probe（CC 08:4x 修過的版本：同一幀的時間戳記全部放行）
FPS_JS = "new Promise(res=>{ let n=0; const t0=performance.now(); const f=()=>{ n++; if(performance.now()-t0<2000) requestAnimationFrame(f); else res(+(n/((performance.now()-t0)/1000)).toFixed(1)); }; requestAnimationFrame(f); })"
RUN_JS = "(()=>!!GAME.E.player.runHold)()"
STAND_JS = "(a=>!!GAME.E.canStand(a[0],a[1],0.3,a[2]))"
STUCK_JS = r"""(a=>{ const E=GAME.E, P=E.player, o=P.obj.position, lv=P.lv|0, f2=v=>v==null?null:+(+v).toFixed(2), Ls=E.levels||[], ax=a.axis;
  const XZ=(u,v)=>ax==='z'?[v,u]:[u,v];
  const cell=(x,z)=>({x:f2(x), z:f2(z), s0:!!E.canStand(x,z,0.3,0), s1:Ls.length>1?!!E.canStand(x,z,0.3,1):null, h0:(Ls[0]&&Ls[0].heightAt)?f2(Ls[0].heightAt(x,z)):null, h1:(Ls[1]&&Ls[1].heightAt)?f2(Ls[1].heightAt(x,z)):null});
  const near=(E.npcs||[]).filter(n=>n&&n.obj&&Math.hypot(n.obj.position.x-o.x,n.obj.position.z-o.z)<2.5).map(n=>{ const q=n.obj.position; return {id:n.charId||n.id||'', name:n.name||'', x:f2(q.x), z:f2(q.z), y:f2(q.y), lv:n.lv|0, walking:!!(n.path&&n.path.length), extra:!!n.isExtra}; });
  const around=[]; for(let k=-7;k<=7;k++){ const p=ax==='z'?[o.x,o.z+k*0.1]:[o.x+k*0.1,o.z]; around.push(cell(p[0],p[1])); }
  const pu=ax==='z'?o.x:o.z;   /* 人所在那條線（橫向座標）*/
  const end=(u,sg)=>{ const r=[]; for(let k=-5;k<=5;k++){ const d=k*0.2, p=XZ(u+sg*d,pu); r.push(Object.assign({d:f2(d)},cell(p[0],p[1]))); } return r; };
  let path=null; try{ const p=E.pathTo(o.x,o.z,lv,a.tx,a.tz,a.tlv); path=p?p.slice(0,8).map(q=>Array.isArray(q)?q.map(f2):[f2(q.x),f2(q.z),q.lv]):null; }catch(e){ path=String(e); }
  return {pos:{x:f2(o.x), z:f2(o.z), y:f2(o.y), lv:lv}, near:near, around:around, bottom:end(a.uLow,-a.du), top:end(a.uHigh,a.du), path:path, unstick:window.__ccUnstick|0, fb:GAME.walkFallbacks||0, run:!!P.runHold, blockedAt:P.blockedAt||null}; })"""


def P(ax, u, v):
    return (v, u) if ax == 'z' else (u, v)


def end4(e):
    return [e['x'], e['z'], e.get('y'), e['lv']]


def pt(p):
    return '(%.2f, %.2f) lv%d' % (p['x'], p['z'], p['lv'])


async def load_at(pg, cdp, st, p, yaw, why):
    s = F.day46()
    s['day'] = st['day']; s['weekday'] = st['wd']; s['hour'] = STAIR_H; s['zone'] = st['zone']
    s['pos'] = {'x': p['x'], 'z': p['z'], 'yaw': yaw, 'lv': p['lv']}; s['weather'] = 'clear'; s['invites'] = []
    try: await L.load_state(pg, s, quiet_events=True, quiet_phone=True)
    except TypeError: await L.load_state(pg, s, quiet_events=True)
    await pg.wait_for_timeout(4000); await L.close_panels(pg, cdp)
    await pg.evaluate(PHONE_JS); await pg.evaluate(UNSTICK_JS)
    q, did = await F.ready(pg, cdp, 30)
    if FPSCAP: await pg.evaluate(FPSCAP_JS, FPSCAP)
    on = await pg.evaluate(RUN_JS)
    if on != RUN: await L.tap(pg, cdp, '#btnRun'); await pg.wait_for_timeout(400)
    run_now = await pg.evaluate(RUN_JS); s1 = await D.st(pg)
    R.setup('%s：day46 存檔 → %s %05.2f %s %s「%s」、關條件事件、STORY.phoneAuto 關%s（站在 (%.2f, %.2f) y=%s lv%d、站得住 %s；跑步 %s%s；ready 做了 %s）' % (
        why, STAIR_DAY, STAIR_H, st['zone'], pt(p), p['label'], '、【捷徑】限 %d fps' % FPSCAP if FPSCAP else '', s1['x'], s1['z'], s1['y'], s1['lv'], s1['stand'], run_now, '（觸控按「跑」）' if RUN else '', J(did)))
    ok = s1['zone'] == st['zone'] and s1['lv'] == p['lv'] and math.hypot(s1['x'] - p['x'], s1['z'] - p['z']) < 0.6 and run_now == RUN
    if not ok: R.note('%s 讀檔後的區域／位置／層／跑步不對：%s（跑步 %s）' % (why, J(s1), run_now))
    return ok


async def snap(pg, tag):
    nm = 'stairx_' + ''.join(ch for ch in tag if ch.isalnum() and ord(ch) < 128)[:40].lower() + '_%d' % int(time.time() * 10 % 100000)
    try:
        await pg.screenshot(path=os.path.join(OUT, nm + '.png')); R.note('%s 截圖 %s.png' % (tag, nm))
    except Exception as e:
        R.note('%s 截圖失敗 %r' % (tag, e))


async def stuck_diag(pg, tag, st, wp):
    a = {'axis': st['axis'], 'uLow': st['uLow'], 'uHigh': st['uHigh'], 'du': st['du'], 'tx': wp['x'], 'tz': wp['z'], 'tlv': wp['lv']}
    d = await pg.evaluate(STUCK_JS, a)
    R.note('%s 【卡住診斷】位置 %s；blockedAt %s；2.5 m 內 NPC %s；E.pathTo 到目標 %s；E.unstick 成功 %s 次；walkFallbacks %s；跑步 %s' % (tag, J(d['pos']), J(d['blockedAt']), J(d['near']), J(d['path']), d['unstick'], d['fb'], d['run']))
    R.note('%s 【卡住診斷】人所在那條線往前後 0.7 m（s0／s1＝第 0／1 層站不站得住、h0／h1＝高度）%s' % (tag, J(d['around'])))
    R.note('%s 【卡住診斷】樓梯底（%s=%.2f；d＝往外的距離，負＝在樓梯上）%s' % (tag, st['axis'], st['uLow'], J(d['bottom'])))
    R.note('%s 【卡住診斷】樓梯頂（%s=%.2f；d＝往外的距離，負＝在樓梯上）%s' % (tag, st['axis'], st['uHigh'], J(d['top'])))
    await snap(pg, tag)
    return d


async def seg(pg, cdp, tag, tx, tz, near, lv):
    r = await F.joy_to(pg, cdp, tag, tx, tz, near=near, lv=lv, max_s=MAX_S, straight=True)
    e = r['end']
    R.note('%s → (%.2f, %.2f)%s：%s、%s 秒、推 %d 次、到 (%.2f, %.2f) y=%s lv%d、跳 %s' % (tag, tx, tz, '' if lv is None else ' lv%d' % lv, '到了' if r['ok'] else '沒到：' + str(r.get('why')), r['t'], r['pushes'], e['x'], e['z'], e.get('y'), e['lv'], J(r['jumps'])))
    return r


def passed(s, wp, u, near):
    """到了這一點：在該層、而且沿行進方向已經走到目標前 near 以內（或超過）、橫向偏不到 0.8 m"""
    if s['lv'] != wp['lv']: return False
    along = (s['x'] - wp['x']) * u[0] + (s['z'] - wp['z']) * u[1]
    side = abs(-(s['x'] - wp['x']) * u[1] + (s['z'] - wp['z']) * u[0])
    return along >= -near - 0.05 and side <= 0.8


async def escape(pg, cdp, t, wp, u, near, tap_pt):
    """脫困四法：往回 1 m、往左 1 m、往右 1 m（各推完再直線推向目標）、點地到樓梯外 1 m（tap_pt；站不住就點目標點）。前一個已脫困就不試後面的。回傳 [(方法, 出得來, 秒)]"""
    out = []
    async def ok_now():
        return passed(await D.st(pg), wp, u, near)
    lx, lz = u[1], -u[0]   # 面向行進方向 u 的左手邊（x 往東、z 往南：往北走時左邊是西）
    for nm, dx, dz in (('往回 1 m', -u[0], -u[1]), ('往左 1 m', lx, lz), ('往右 1 m', -lx, -lz)):
        if await ok_now(): out.append([nm, None, None]); continue
        t0 = time.time(); q = await D.st(pg)
        await seg(pg, cdp, '%s 【脫困】%s（到 (%.2f, %.2f)）' % (t, nm, q['x'] + dx, q['z'] + dz), q['x'] + dx, q['z'] + dz, 0.3, None)
        r = await seg(pg, cdp, '%s 【脫困】%s後再直線推向目標' % (t, nm), wp['x'], wp['z'], near, wp['lv'])
        ok = await ok_now(); out.append([nm, ok, round(time.time() - t0, 1)])
        R.note('%s 【脫困】%s：%s（%.1f 秒；停在 %s）' % (t, nm, '出來了' if ok else '還是出不來', time.time() - t0, J(end4(r['end']))))
    if not await ok_now():
        gx, gz, how = tap_pt
        t0 = time.time(); p = await L.tap_ground(pg, cdp, gx, gz, lv=wp['lv'])
        for _ in range(40):
            await pg.wait_for_timeout(500)
            if await ok_now(): break
        ok = await ok_now(); q = await D.st(pg); out.append(['點地到樓梯外 1 m', ok, round(time.time() - t0, 1)])
        R.note('%s 【脫困】點地 (%.2f, %.2f) lv%d（%s）：%s（%.1f 秒；%s；停在 (%.2f, %.2f) y=%s lv%d）' % (t, gx, gz, wp['lv'], how, '出來了' if ok else '還是出不來', time.time() - t0, '點到 %s' % J(p.get('hit')) if p else '那一點不在畫面上／被按鈕蓋住，沒點', q['x'], q['z'], q['y'], q['lv']))
    else: out.append(['點地到樓梯外 1 m', None, None])
    R.note('%s 【脫困】結果（None＝前面已脫困、沒試）%s' % (t, J(out)))
    return out


def half_upper(st, log):
    """下樓：在樓梯下半段（從樓梯底算起 0～一半）取樣時還在第 1 層的次數（木曜日／花序／總圖修的那一種；資訊）"""
    n = 0; L_ = abs(st['uHigh'] - st['uLow'])
    for row in log:
        u = row[2] if st['axis'] == 'z' else row[1]
        k = (u - st['uLow']) * st['du']
        if 0 < k < L_ * 0.5 - 0.05 and row[3] == 1: n += 1
    return n


async def leg(pg, cdp, st, ln, k, up, stats):
    """一段：up＝樓梯底外 → 樓梯頂外；否則反過來。回傳 (ok, 是否停在這一段的終點)"""
    a, b = (ln['bot'], ln['top']) if up else (ln['top'], ln['bot'])
    dirn = '上樓' if up else '下樓'
    t = '[%s %s線 x=%.2f %s 第 %d 趟 %s]' % (st['key'], LINE_NAME.get(ln['name'], ln['name']), ln['v'], TAG, k, dirn)
    u = (b['x'] - a['x'], b['z'] - a['z']); m = math.hypot(*u) or 1.0; u = (u[0] / m, u[1] / m)
    near = b['near']
    r = await seg(pg, cdp, '%s 直線推到「%s」' % (t, b['label']), b['x'], b['z'], near, b['lv'])
    rec = {'trip': k, 'stuck': None}
    if not r['ok']:
        d = await stuck_diag(pg, t, st, b)
        esc = await escape(pg, cdp, t, b, u, near, b['tap'])
        rec['stuck'] = {'pos': d['pos'], 'why': r.get('why'), 'escape': esc}
    await pg.wait_for_timeout(800); s = await D.st(pg)
    arr = end4(r['end']); now = [s['x'], s['z'], s['y'], s['lv']]
    hu = half_upper(st, r['log']) if not up else None
    # 到了＝joy_to 到目標 near 內（或兩次取樣之間的線段穿過 near 內：PC 上會衝過頭）而且那時是該層；再看停下 0.8 秒後還在該層。
    # 停下後的位置只記不判（雲端自檢 11-11：大口右線跑 10 fps 穿過樓梯頂 lv1 之後，最後一次取樣退回樓梯上 0.5 m、仍是 lv1）
    ok = r['ok'] and s['lv'] == b['lv']
    back = round(math.hypot(s['x'] - b['x'], s['z'] - b['z']), 2)
    R.check('%s 到「%s」、lv%d、沒卡住' % (t, b['label'], b['lv']), ok, J({'到的時候 x,z,y,lv': arr, '停下 0.8 秒後': now, '停下後離目標 m': back, '穿過算到': bool(r.get('crossed')), '最後幾次取樣 t,x,z,lv': r['log'][-4:], '秒': r['t'], '推': r['pushes'], '跳': r['jumps'], '卡住': rec['stuck'], '下樓過半還在第 1 層的取樣': hu}))
    if r['ok'] and back > 0.45: R.note('%s 注意：到了以後停下的位置離目標 %.2f m（停在 %s）' % (t, back, J(now)))
    if r['ok'] and not ok: await snap(pg, t + ' wronglv')
    key = 'up' if up else 'down'
    if ok: stats[key + '_ok'] += 1
    if rec['stuck']: stats[key + '_stuck'].append({'趟': k, '座標 x,z,y,lv': [rec['stuck']['pos'][q] for q in ('x', 'z', 'y', 'lv')], '脫困': rec['stuck']['escape']})
    if hu: stats['half_upper'].append({'趟': k, '取樣': hu})
    at_end = s['lv'] == b['lv'] and back < 0.9
    return ok, at_end


def build_lines(key, geo):
    """把（遊戲裡算的，或 REF）樓梯資料轉成每條線的兩個端點"""
    info = INFO[key]; ax = geo['axis']; du = 1 if geo['uHigh'] > geo['uLow'] else -1
    st = {'key': key, 'zone': info['zone'], 'name': info['name'], 'axis': ax, 'uLow': geo['uLow'], 'uHigh': geo['uHigh'], 'du': du, 'lines': []}
    names = ['L', 'C', 'R'] if len(geo['lines']) == 3 else ['C'] if len(geo['lines']) == 1 else ['L', 'R']
    # 線依橫向座標由小到大排：axis z 往 −z 爬（往北）左手邊＝西＝x 小；往 +z 爬就反過來。axis x 往 +x 爬（往東）左手邊＝北＝z 小；往 −x 爬反過來（這三座都是 axis z、往 −z 爬）
    if (ax == 'z' and du > 0) or (ax == 'x' and du < 0): names = list(reversed(names))
    for nm, (v, lo, hi) in zip(names, geo['lines']):
        def endp(e, lv, u0, sg, label):
            x, z = P(ax, e['u'], v); wall = e['d'] <= 0
            tx, tz = P(ax, u0 + sg * 1.0, v)
            return {'x': round(x, 3), 'z': round(z, 3), 'lv': lv, 'near': NEAR_WALL if wall else NEAR_OUT, 'wall': wall, 'd': e['d'],
                    'label': label + ('（端點接牆，停在樓梯上 %.2f m）' % -e['d'] if wall else '（樓梯外 %.2f m）' % e['d']),
                    'tap': [round(tx, 3), round(tz, 3), '樓梯外 1 m']}
        bot = endp(lo, 0, geo['uLow'], -du, '樓梯底外'); top = endp(hi, 1, geo['uHigh'], du, '樓梯頂外')
        st['lines'].append({'name': nm, 'v': v, 'bot': bot, 'top': top})
    return st


async def run_stair(pg, cdp, errs, key, day, table):
    info = INFO[key]
    print('== %s %s' % (key, info['zone']), flush=True)
    row = {'座': key, '區域': info['zone'], '樓梯': info['name'], '線': []}
    if not await pg.evaluate(ZONE_HAS_JS, info['zone']):
        R.note('[%s] SKIP：這一版沒有區域 %s（線上 779ddd650 還沒有花序；花序是之後才加的）' % (key, info['zone']))
        row['SKIP'] = '這一版沒有區域 %s' % info['zone']; table.append(row); return
    n0 = len(errs); t0 = time.time()
    try:
        ref = info['ref']
        st0 = build_lines(key, ref); st0.update(day)
        c0 = st0['lines'][len(st0['lines']) // 2]
        await load_at(pg, cdp, st0, c0['bot'], math.pi if st0['du'] < 0 else 0.0, '【前置／捷徑】[%s] 讀檔到中線樓梯底外、在遊戲裡找樓梯' % key)
        geo = await pg.evaluate(GEO_JS)
        if geo.get('ok'):
            diff = []
            if geo['axis'] != ref['axis'] or len(geo['lines']) != len(ref['lines']): diff.append('axis／線數不同')
            else:
                for (v, lo, hi), (v2, lo2, hi2) in zip(geo['lines'], ref['lines']):
                    if abs(v - v2) > 0.05 or abs(lo['u'] - lo2['u']) > 0.05 or abs(hi['u'] - hi2['u']) > 0.05: diff.append([v, lo['u'], hi['u'], '≠ REF', v2, lo2['u'], hi2['u']])
            R.note('[%s] 遊戲裡照 stair_levels_audit_1111_unit.js 的算法找到的樓梯：%s；和 REF（Node 對 7d9c46786 算的）%s' % (key, J(geo), '一致（差 ≤ 0.05 m）' if not diff else '不一致 %s——照遊戲裡算的走' % J(diff)))
            st = build_lines(key, geo); st.update(day)
        else:
            R.check('[%s] 遊戲裡找得到兩層共用的樓梯' % key, False, geo.get('why', '')); st = st0
            R.note('[%s] 改用 REF（Node 對 7d9c46786 算的）' % key)
        R.note('[%s] %s；程式 %s；樓梯 %s 從 %.2f（底，y %s，lv0）到 %.2f（頂，y %s，lv1）' % (key, info['name'], info['src'], st['axis'], st['uLow'], ref['y'][0], st['uHigh'], ref['y'][1]))
        for ln in st['lines']:
            for e in (ln['bot'], ln['top']):
                e_stand = await pg.evaluate(STAND_JS, [e['x'], e['z'], e['lv']]); t_stand = await pg.evaluate(STAND_JS, [e['tap'][0], e['tap'][1], e['lv']])
                if not t_stand: e['tap'] = [e['x'], e['z'], '樓梯外 1 m 站不住（端點接牆），改點目標點']
                e['stand'] = e_stand
            R.note('[%s] %s線 x=%.2f：樓梯底外 %s「%s」站得住 %s；樓梯頂外 %s「%s」站得住 %s；脫困點地 底 %s、頂 %s' % (
                key, LINE_NAME.get(ln['name'], ln['name']), ln['v'], pt(ln['bot']), ln['bot']['label'], ln['bot']['stand'], pt(ln['top']), ln['top']['label'], ln['top']['stand'], J(ln['bot']['tap']), J(ln['top']['tap'])))
        if FPSCAP: R.note('[%s] 限 %d fps 後實際幀率 %s fps' % (key, FPSCAP, await pg.evaluate(FPS_JS)))
        else: R.note('[%s] 幀率 %s fps' % (key, await pg.evaluate(FPS_JS)))
        for ln in st['lines']:
            if ln['name'] not in LINES: continue
            stats = {'線': ln['name'], 'x': ln['v'], 'up_ok': 0, 'down_ok': 0, 'up_stuck': [], 'down_stuck': [], 'half_upper': [], 'reload': 0}
            t1 = time.time(); yaw_up = math.pi if st['du'] < 0 else 0.0
            await load_at(pg, cdp, st, ln['bot'], yaw_up, '【前置／捷徑】[%s %s線] 讀檔到樓梯底外' % (key, ln['name']))
            for k in range(1, TRIPS + 1):
                q = await D.st(pg); b = ln['bot']
                if not (q['lv'] == 0 and math.hypot(q['x'] - b['x'], q['z'] - b['z']) < 0.9):
                    stats['reload'] += 1
                    await load_at(pg, cdp, st, b, yaw_up, '【前置／捷徑】[%s %s線 第 %d 趟] 上一趟沒回到樓梯底外，放回去' % (key, ln['name'], k))
                ok_up, at_top = await leg(pg, cdp, st, ln, k, True, stats)
                q = await D.st(pg); tp = ln['top']
                if at_top and math.hypot(q['x'] - tp['x'], q['z'] - tp['z']) > 0.4:
                    await seg(pg, cdp, '[%s %s線 第 %d 趟] 回到同一條線的樓梯頂外' % (key, ln['name'], k), tp['x'], tp['z'], 0.3, 1)
                    q = await D.st(pg); at_top = q['lv'] == 1 and math.hypot(q['x'] - tp['x'], q['z'] - tp['z']) < 0.9
                if not at_top:
                    stats['reload'] += 1
                    await load_at(pg, cdp, st, tp, (yaw_up + math.pi) % (2 * math.pi), '【前置／捷徑】[%s %s線 第 %d 趟] 上樓沒到樓梯頂外，放到樓梯頂外再測下樓' % (key, ln['name'], k))
                await leg(pg, cdp, st, ln, k, False, stats)
            stats['秒'] = round(time.time() - t1)
            R.note('[%s %s線 x=%.2f] 用了 %d 秒；上 %d/%d、下 %d/%d' % (key, ln['name'], ln['v'], stats['秒'], stats['up_ok'], TRIPS, stats['down_ok'], TRIPS))
            row['線'].append(stats)
    except Exception as e:
        R.check('[%s] 探針沒有例外' % key, False, repr(e)[:300])
    R.check('[%s] 沒有 JS 例外' % key, len(errs) == n0, J(errs[n0:n0 + 3]))
    R.note('[%s] 用了 %.0f 秒' % (key, time.time() - t0))
    table.append(row)


async def main():
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        R.check('遊戲載入', await L.wait_loaded(pg))
        ver = await pg.evaluate("(document.body.innerText.match(/版本 v[0-9.]+/)||[''])[0]")
        dd = await pg.evaluate(DAY_JS, STAIR_DAY)
        if dd['d'] is None:
            dd = {'d': (datetime.date.fromisoformat(STAIR_DAY) - DAY1).days + 1, 'wd': datetime.date.fromisoformat(STAIR_DAY).isoweekday() % 7}
        R.note('CC STAIRX：受測 SHA %s、%s；STAIRS %s、LINES %s、每條線 %d 趟（上＋下）；%s；每段最多 %.0f 秒；%s %05.2f（第 %s 天、週 %s）；Playwright 手機模擬 ≠ iPhone' % (
            SHA or '（沒給）', ver, J(STAIRS), J(LINES), TRIPS, TAG, MAX_S, STAIR_DAY, STAIR_H, dd['d'], dd['wd']))
        table = []
        for key in STAIRS:
            if key not in INFO:
                R.check('[%s] 認得的樓梯（%s）' % (key, '、'.join(ALL_STAIRS)), False); continue
            await run_stair(pg, cdp, errs, key, {'day': dd['d'], 'wd': dd['wd']}, table)
        rows = []
        for row in table:
            if row.get('SKIP'):
                rows.append({'座': row['座'], '區域': row['區域'], 'SKIP': row['SKIP']}); continue
            for s in row['線']:
                rows.append({'座': row['座'], '區域': row['區域'], '線': '%s x=%.2f' % (s['線'], s['x']), '上': '%d/%d' % (s['up_ok'], TRIPS), '下': '%d/%d' % (s['down_ok'], TRIPS),
                             '上卡住': s['up_stuck'], '下卡住': s['down_stuck'], '下樓過半還在第1層': s['half_upper'], '重新讀檔': s['reload'], '秒': s.get('秒')})
        R.note('【總表 %s｜SHA %s】%s' % (TAG, SHA or '（沒給）', J(rows)))
        for r in rows:
            if r.get('SKIP'): print('  %-6s SKIP（%s）' % (r['座'], r['SKIP']), flush=True); continue
            print('  %-6s %-10s 上 %s 下 %s｜上卡 %s｜下卡 %s｜過半在上層 %s｜重讀 %d' % (r['座'], r['線'], r['上'], r['下'], J([q['座標 x,z,y,lv'] for q in r['上卡住']]), J([q['座標 x,z,y,lv'] for q in r['下卡住']]), len(r['下樓過半還在第1層']), r['重新讀檔']), flush=True)
        await b.close()
    return R.finish()


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
