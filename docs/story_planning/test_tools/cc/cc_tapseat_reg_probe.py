"""CC（帳號 A）11-11：TAPSEAT_REG——「點椅子」改動（開發分支 0d7922555：點地面時落點沒對到椅子，沿畫面射線看離地 0.3～0.75 m 有沒有穿過某張椅子（0.32 m 內），
  有就導去那張椅子坐；src/game3d.js tapToSeat、src/engine3d.js 把射線傳給 tapRedirect、tapPref 用那張椅子的位置）影響所有店和教室，BB 要的回歸。
  舊版（線上 779ddd650）的 tapToSeat 只接受「地板落點站不住、離椅子 0.45 m 內」：俯角淺時點椅面，地板落點在椅子後面，預期部分椅面點不到（FAIL 是預期，照記）。
  Playwright 手機模擬（844×390 橫向、CDP 觸控）≠ iPhone 實機。

區域（PARTS，逗號分隔；可以單跑一區）：
  CLASS201  法律系館A（霖澤館）201 階梯教室（zone 'classroom'，配置 src/data/classroom_layout.js：6 排 × 8 張，一排比一排高 0.3 m；講台在 −z、門口在 +z）
  LIBHALL   總圖二樓自習區長桌（zone 'library_hall' 第 1 層，配置 src/data/library_layout.js 的 studyTable）
  DORMHALL  宿舍一樓交誼廳（zone 'dorm_hall'，配置 src/data/dorm_layout.js 的 lounge：長桌 (5.4,4.2)、兩張沙發 x 9.0）
  CAFE      2:30 AM（兩點半 Café，zone 'cafe'）
每一區做的事（每一下點擊之前都【前置／捷徑】讀檔回同一個起點，免得上一下坐下、走過去的狀態影響下一下）：
  ① 椅面（判）：把椅面那一點（椅子 x,z；高度＝那張椅子所在的地板＋0.45＋lift）投影到螢幕，那一點是遊戲畫面（elementFromPoint 是 #c）才用手指點（CDP 觸控）；
     畫面外或被按鈕蓋住就用手指滑轉鏡頭（L.turn_camera_to）再試；還不行就先點地走近（L.go_to 到那張椅子 2.5 m 內）再試。
     記：screenToFloor 落點、tapRedirect（照遊戲自己的呼叫，帶射線）導去哪、走到的位置、tapPref、互動鍵（D.NEAR_IT）；
     判準：走到以後互動鍵是那張椅子的「坐下」類按鈕而且最近的座位就是這一張 → 按 #interact → player.seat 和這一張差 ≤0.15 m、walkFallbacks 沒增加。
  ② 走道地板 5 下（判）：站得住、0.8 m 內沒有椅子（E.zone.seats＋所有座位互動點）的地板點。判準：沒有坐下（player.seat）、tapRedirect 沒有導去椅子、
     最後停的位置離點的地方 ≤FLOOR_NEAR（預設 0.6 m）；互動鍵只記。
  ③ 兩張椅子中間 3 下、④ 桌面 3 下（只記不判）：被導去哪張椅子（tapRedirect／tapPref／走到以後最近的座位）、或走到哪、互動鍵。
     桌面高度用往下打的射線量（那一點附近 0.5 m 內、站不住、不是椅子的地方，第一個在地板上 0.35～1.0 m 的面）。
挑了哪幾張（座標寫死在 ZONES，log 會寫為什麼；有人坐就換下一個候補，記錄）：見 ZONES 的說明欄。
時間：DAY＝2025-10-08（三）15:00（平日；總圖 08–22、Café 11–02:30 都開；讀檔關掉條件事件與手機自動打開＝quiet，教室不觸發上課劇情）。可用 DAY、HOUR、HOUR_<PART> 改。
截圖（out/，jpg，少量）：每張椅子坐下一張【遊戲鏡頭】、FAIL 一張。
用法：LW_TESTS=<wt>/tests SHA=<sha> PARTS=CLASS201,LIBHALL,DORMHALL,CAFE python3 cc_tapseat_reg_probe.py <url> <out>
  其他環境變數：FLOOR_NEAR（預設 0.6）、ONLY_SEATS=1,3（每區只跑第幾張椅子，從 1 起）、N_FLOOR／N_BETWEEN／N_TABLE（每區跑幾下，預設 5／3／3；0＝不跑）、WAIT（讀檔後等幾毫秒，預設 5000）"""
import os, sys, json, asyncio, time, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests')); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
import cc_fn_lib as F
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
PARTS = [p.strip().upper() for p in (os.environ.get('PARTS') or 'CLASS201,LIBHALL,DORMHALL,CAFE').split(',') if p.strip()]
SHA = os.environ.get('SHA', '?'); SHA7 = SHA[:7] if SHA != '?' else 'nosha'
DAY = os.environ.get('DAY') or '2025-10-08'
FLOOR_NEAR = float(os.environ.get('FLOOR_NEAR') or 0.6)
ONLY_SEATS = [int(x) for x in (os.environ.get('ONLY_SEATS') or '').split(',') if x.strip()]
N_FLOOR = int(os.environ.get('N_FLOOR') or 5); N_BETWEEN = int(os.environ.get('N_BETWEEN') or 3); N_TABLE = int(os.environ.get('N_TABLE') or 3)
WAIT = int(os.environ.get('WAIT') or 5000)
R = L.Run('tapseat_reg', OUT); D.setup(R, OUT)
J = D.J

# 起點 start＝(x, z, 面向 yaw, 層)：遊戲讀檔後鏡頭在玩家背後（E.cam.yaw＝yaw＋π），yaw＝atan2(dx,dz) 就是看向 (dx,dz) 那一邊
# seats：(名稱, 首選座位, [候補…], 為什麼挑這張)；between／tables／floors：(點, 說明)；floors 不足 5 個時自動補（站得住、0.8 m 內沒有椅子、離起點 ≥2 m，分散挑）
ZONES = {
    'CLASS201': {
        'zone': 'classroom', 'name': '霖澤館 201 階梯教室', 'start': (0.0, 7.4, math.pi, 0), 'start_why': '後門進門的位置（區域出生點，往講台看）',
        'seats': [
            ('前排', (0.75, -3.8), [(-0.75, -3.8), (2.25, -3.8)], '第 1 排（z −3.8，最靠講台、離門口最遠 11 m；俯角最淺）中間偏右'),
            ('中排', (-2.25, 0.4), [(-0.75, 0.4), (-3.75, 0.4)], '第 3 排（z 0.4，地板高 0.9 m）中間偏左'),
            ('後排', (3.75, 6.7), [(2.25, 6.7), (5.25, 6.7)], '第 6 排（z 6.7，最高、離門口最近）；不挑 x 0 附近（會被玩家自己擋住）'),
            ('走道邊', (5.25, 2.5), [(5.25, 0.4), (5.25, 4.6)], '第 4 排最右邊（x 5.25，右側走道 x 6.2～7.6 旁邊）'),
            ('牆邊', (-5.25, -1.7), [(-5.25, 0.4), (-5.25, -3.8)], '第 2 排最左邊（x −5.25，左側窗戶那面牆旁）'),
        ],
        'between': [((-1.5, -1.7), '第 2 排 x −2.25 和 −0.75 兩張中間'), ((1.5, 2.5), '第 4 排 x 0.75 和 2.25 中間'), ((-4.5, 4.6), '第 5 排 x −5.25 和 −3.75 中間')],
        'tables': [((0.0, -4.345), '第 1 排長桌（座位前 0.545 m）'), ((3.0, -0.145), '第 3 排長桌'), ((-3.0, 4.055), '第 5 排長桌')],
        'floors': [((7.0, 0.0), '右側走道（第 3 排旁）'), ((3.0, -6.0), '講台前的空地'),
                   ((1.5, 3.25), '第 4 排椅子後面的橫走道（兩張椅子之間的後方）'), ((-3.0, -1.25), '第 2 排椅子後面的橫走道')],
    },
    'LIBHALL': {
        'zone': 'library_hall', 'name': '總圖二樓自習區', 'start': (-4.0, 0.0, -0.785, 1), 'start_why': '二樓走廊、自習區東北角外面（面向西南的長桌）',
        'seats': [
            ('第一張桌北側西端', (-10.175, 2.2), [(-8.075, 2.2)], '北邊那張長桌（z 3.0）北側最西邊、靠牆（小安劇情「二樓靠牆的長桌」那一帶）'),
            ('第一張桌南側東端', (-7.025, 3.8), [(-9.125, 3.8)], '同一張長桌南側最東邊（隔壁 (−8.07,3.8) 常有 NPC 坐）'),
            ('第二張桌北側', (-8.075, 5.8), [(-10.175, 5.8)], '南邊那張長桌（z 6.6）北側；離起點最遠'),
        ],
        'between': [((-9.65, 2.2), '北桌北側 x −10.175 和 −9.125 兩張中間'), ((-7.55, 3.8), '北桌南側 x −8.075 和 −7.025 中間'), ((-8.6, 5.8), '南桌北側 x −9.125 和 −8.075 中間')],
        'tables': [((-9.6, 3.0), '北桌西半'), ((-7.5, 3.0), '北桌東半'), ((-8.6, 6.6), '南桌中間')],
        'floors': [((-8.5, 5.0), '兩張長桌中間的通道'), ((-11.0, 6.5), '長桌西邊靠牆的走道'), ((-2.0, 0.5), '二樓東西向走廊'),
                   ((-9.0, -0.5), '走廊西段（往北的通道口）'), ((-6.0, 1.0), '自習區東北角')],
    },
    'DORMHALL': {
        'zone': 'dorm_hall', 'name': '宿舍一樓交誼廳', 'start': (0.0, 5.6, 1.5708, 0), 'start_why': '宿舍大門進來的位置（區域出生點），面向東邊的交誼廳',
        'seats': [
            ('長桌椅子', (6.0, 3.42), [(6.0, 4.98), (4.8, 3.42)], '交誼廳長桌 (5.4,4.2) 北側東邊那張'),
            ('沙發', (9.0, 5.85), [(9.0, 3.35)], '南邊那張沙發（座位點在沙發中間、互動點在沙發前 0.7 m）'),
        ],
        'between': [((5.4, 3.42), '長桌北側兩張中間'), ((5.4, 4.98), '長桌南側兩張中間（(4.8,4.98) 常有人坐）'), ((9.0, 4.6), '兩張沙發中間')],
        'tables': [((5.0, 4.2), '長桌西半'), ((5.8, 4.2), '長桌東半'), ((10.2, 4.6), '沙發前面的矮桌（有就量得到）')],
        'floors': [((2.0, 1.0), '門廳往交誼廳的走道'), ((7.5, 6.5), '交誼廳南邊'), ((11.5, 3.0), '沙發東邊'), ((3.0, 6.0), '門廳南邊')],
    },
    'CAFE': {
        'zone': 'cafe', 'name': '2:30 AM（兩點半 Café）', 'start': (0.0, 4.6, math.pi, 0), 'start_why': '進門的位置（區域出生點，往吧檯看）',
        'seats': [
            ('雙人桌', (0.85, 1.5), [(-0.85, 1.5)], '中間雙人桌 (0,1.5) 東邊那張'),
            ('吧檯高腳椅', (-1.3, -3.3), [(-2.9, -3.3), (0.3, -3.3)], '吧檯高腳椅（座面 0.72＝lift 0.25；俯角最淺、椅面高）'),
        ],
        'between': [((-2.1, -3.3), '吧檯高腳椅 x −2.9 和 −1.3 中間'), ((-0.5, -3.3), '吧檯高腳椅 x −1.3 和 0.3 中間'), ((-6.3, 0.0), '卡座兩個位子中間')],
        'tables': [((0.0, 1.5), '中間雙人桌'), ((-5.5, 0.0), '卡座的桌子'), ((5.0, 2.3), '窗邊雙人桌（照座位往外找）')],
        'floors': [((2.5, 3.5), '門口往裡的走道'), ((-2.5, -1.5), '吧檯前'), ((3.0, -2.0), '店中間偏東'), ((-3.0, 2.0), '店中間偏西'), ((1.5, -0.5), '店中間')],
    },
}

TAP_PT = r"""(([x,y,z])=>{ const E=GAME.E; const v=new THREE.Vector3(x,y,z).project(E.camera); if(v.z>1) return {off:true, behind:true}; const sx=(v.x+1)/2*innerWidth, sy=(1-v.y)/2*innerHeight;
  if(sx<10||sy<10||sx>innerWidth-10||sy>innerHeight-10) return {off:true, sx:+sx.toFixed(1), sy:+sy.toFixed(1)}; const el=document.elementFromPoint(sx,sy); const h=E.screenToFloor?E.screenToFloor(sx,sy):null;
  let r=null; if(h&&E.tapRedirect&&!(h.obj&&h.obj.userData&&h.obj.userData.stairEnds)) r=E.tapRedirect(h.x,h.z,h.lv==null?(E.player.lv|0):h.lv,{ray:E.ray.ray,fy:h.y,hit:{x:h.x,y:h.y,z:h.z}});  let fh=null; if(h&&E.rayFirstHit){ const R0=E.ray.ray, tF=Math.hypot(h.x-R0.origin.x,h.y-R0.origin.y,h.z-R0.origin.z); const q=E.rayFirstHit(R0,tF-0.03); if(q){ const o=q.object; let nm=o.name||''; for(let a=o.parent;!nm&&a;a=a.parent) nm=a.name||''; const mm=[].concat(o.material)[0]; fh={obj:nm||o.type, mat:mm&&mm.name||'', p:[+q.point.x.toFixed(2),+q.point.y.toFixed(2),+q.point.z.toFixed(2)]}; } }
  let seat=null; if(r){ if(r[3]) seat=[+r[3].x.toFixed(3),+r[3].z.toFixed(3)]; else if(GAME.seatApproach){ for(const it of E.interactables){ if(!it.seat||it.hidden) continue; const ap=GAME.seatApproach(it.seat); if(ap&&Math.hypot(ap[0]-r[0],ap[1]-r[1])<0.05){ seat=[+it.seat.x.toFixed(3),+it.seat.z.toFixed(3)]; break; } } } }
  const cam=E.camera.position, p=new THREE.Vector3(x,y,z), dir=p.clone().sub(cam), dist=dir.length(); dir.normalize(); const pitch=+(Math.asin(-dir.y)*180/Math.PI).toFixed(1);
  return {sx:+sx.toFixed(1), sy:+sy.toFixed(1), canvas:!!el&&el.id==='c'&&!['hud','hudR','minimap','ctlR','joy','interact','toast','choices','btnGo','btnQuick','clockBox','nextClass','titleBar'].some(id=>{ const e=document.getElementById(id); if(!e||e.offsetParent===null) return false; const r=e.getBoundingClientRect(); return sx>=r.left-4&&sx<=r.right+4&&sy>=r.top-4&&sy<=r.bottom+4; }), el:el?(el.id||el.tagName):null, hit:h?[+h.x.toFixed(2),+h.z.toFixed(2),h.lv|0,+(+h.y).toFixed(2)]:null,
    redirect:r?[+r[0].toFixed(2),+r[1].toFixed(2)]:null, rseat:seat, first:fh, dist:+dist.toFixed(2), pitch}; })"""
PSTATE = r"""(()=>{ const P=GAME.E.player, o=P.obj.position, s=P.seat; return {x:+o.x.toFixed(3), z:+o.z.toFixed(3), lv:P.lv|0, path:!!(P.path&&P.path.length), tp:P.tapPref?[+P.tapPref.x.toFixed(2),+P.tapPref.z.toFixed(2)]:null, seat:s?[+s.x.toFixed(3),+s.z.toFixed(3)]:null}; })()"""
OCC_JS = r"""(([x,z])=>(GAME.E.npcs||[]).filter(n=>n&&((n.seat&&Math.hypot(n.seat.x-x,n.seat.z-z)<0.4)||(n.seatTarget&&Math.hypot(n.seatTarget.x-x,n.seatTarget.z-z)<0.4))).map(n=>String(n.id||n.name||(n.isExtra?'extra':'?'))))"""
ALLSEATS = r"""((lv)=>{ const E=GAME.E; return [].concat((E.zone&&E.zone.seats||[]).filter(s=>(s.lv|0)===lv),(E.interactables||[]).filter(i=>i.seat&&!i.hidden&&((i.seat.lv|0)===lv)).map(i=>i.seat)).map(s=>[+s.x.toFixed(3),+s.z.toFixed(3)]); })"""
# 走道地板點：站得住（半徑 0.3）、0.8 m 內沒有椅子；pref 給了就找離它最近（r 內）的；沒給就在起點周圍 10 m 內分散挑 n 個（離起點 ≥2 m、投影在遊戲畫面上）
FLOOR_PICK = r"""((a)=>{ const E=GAME.E, P=E.player.obj.position; const seats=[].concat((E.zone&&E.zone.seats||[]).filter(s=>(s.lv|0)===a.lv),(E.interactables||[]).filter(i=>i.seat&&((i.seat.lv|0)===a.lv)).map(i=>i.seat));
  const ok=(x,z)=>E.canStand(x,z,0.3,a.lv)&&!seats.some(s=>Math.hypot(s.x-x,s.z-z)<0.8);
  if(a.pref){ let best=null; for(let dx=-a.r;dx<=a.r+1e-6;dx+=0.1) for(let dz=-a.r;dz<=a.r+1e-6;dz+=0.1){ const x=a.pref[0]+dx, z=a.pref[1]+dz; if(!ok(x,z)) continue; const d=Math.hypot(dx,dz); if(!best||d<best.d) best={x:+x.toFixed(2),z:+z.toFixed(2),d:+d.toFixed(2)}; } return best; }
  const cand=[]; for(let x=Math.round(P.x)-10;x<=Math.round(P.x)+10;x+=0.5) for(let z=Math.round(P.z)-10;z<=Math.round(P.z)+10;z+=0.5){ if(Math.hypot(x-P.x,z-P.z)<2||!ok(x,z)) continue;
    const v=new THREE.Vector3(x,E.heightAt(x,z,a.lv),z).project(E.camera); if(v.z>1||Math.abs(v.x)>0.85||Math.abs(v.y)>0.85) continue; const sx=(v.x+1)/2*innerWidth, sy=(1-v.y)/2*innerHeight; const el=document.elementFromPoint(sx,sy); if(!el||el.id!=='c') continue; if(['hud','hudR','minimap','ctlR','joy','interact','toast','choices','btnGo','btnQuick','clockBox','nextClass','titleBar'].some(id=>{ const e=document.getElementById(id); if(!e||e.offsetParent===null) return false; const r=e.getBoundingClientRect(); return sx>=r.left-4&&sx<=r.right+4&&sy>=r.top-4&&sy<=r.bottom+4; })) continue; cand.push([x,z]); }
  const out=[]; const have=a.have||[]; while(out.length<a.n&&cand.length){ let bi=-1,bd=-1; for(let i=0;i<cand.length;i++){ const c=cand[i]; let m=1e9; for(const q of have.concat(out)) m=Math.min(m,Math.hypot(q[0]-c[0],q[1]-c[1])); if(!have.length&&!out.length) m=Math.hypot(c[0]-P.x,c[1]-P.z); if(m>bd){ bd=m; bi=i; } } out.push(cand.splice(bi,1)[0]); }
  return out; })"""
# 桌面：pref 附近 r 內、站不住、0.35 m 內沒有椅子的點，往下打射線，第一個（不高於地板＋1.0）的面在地板上 0.35～1.0 m＝桌面；挑離 pref 最近的
TABLE_TOP = r"""((a)=>{ const E=GAME.E, V=THREE.Vector3; const vis=o=>{ for(let p=o;p;p=p.parent) if(!p.visible) return false; return true; };
  const skip=new Set(); E.player.obj.traverse(o=>skip.add(o)); for(const n of (E.npcs||[])) if(n&&n.obj) n.obj.traverse(o=>skip.add(o));
  const T=[]; E.scene.traverse(o=>{ if(!o.isMesh||o.isSkinnedMesh||skip.has(o)||!vis(o)) return; const m=[].concat(o.material)[0]; if(m&&(m.visible===false||m.colorWrite===false)) return; if(o.userData&&o.userData.walkLv!=null) return; T.push(o); });
  const seats=[].concat((E.zone&&E.zone.seats||[]),(E.interactables||[]).filter(i=>i.seat).map(i=>i.seat)).filter(s=>(s.lv|0)===a.lv);
  const rc=new THREE.Raycaster(); let best=null;
  for(let dx=-a.r;dx<=a.r+1e-6;dx+=0.1) for(let dz=-a.r;dz<=a.r+1e-6;dz+=0.1){ const x=a.x+dx, z=a.z+dz; const d=Math.hypot(dx,dz); if(best&&d>=best.d) continue; if(E.canStand(x,z,0.3,a.lv)) continue; if(seats.some(s=>Math.hypot(s.x-x,s.z-z)<0.35)) continue;
    rc.set(new V(x,a.fy+1.5,z),new V(0,-1,0)); rc.near=0; rc.far=1.45; const hs=rc.intersectObjects(T,false); const h=hs.find(q=>q.point.y<=a.fy+1.0); if(!h||h.point.y<a.fy+0.35) continue;
    best={x:+x.toFixed(2),z:+z.toFixed(2),y:+h.point.y.toFixed(3),d:+d.toFixed(2),mesh:h.object.name||'',mat:([].concat(h.object.material)[0]||{}).name||''}; }
  return best; })"""
PHONE_OPEN = r"""(()=>{ const p=document.getElementById('phone'); return !!p&&!p.classList.contains('hide')&&p.offsetParent!==null; })()"""
OFFS = [(0.0, 0.0), (0.15, 0.0), (-0.15, 0.0), (0.0, 0.1), (0.0, -0.1)]
# 椅面：椅子中心被柱子、桌子擋住時，點椅子露出來的那一邊（BB 19:08／LAWWW2：總圖椅子 2 中心那個像素被白柱子擋住，左半邊點得到）
OFFS_SEAT = OFFS + [(0.1, 0.1), (-0.1, 0.1), (0.1, -0.1), (-0.1, -0.1), (0.2, 0.0), (-0.2, 0.0)]
# 走近用的點：(x,z) 1 m 內站得住、0.8 m 內沒有椅子、離 (x,z) 最近（不走到別張椅子的 seatApproach 上，免得走近時互動鍵先變成別張）
NEAR_STAND = r"""((a)=>{ const E=GAME.E; const seats=[].concat((E.zone&&E.zone.seats||[]).filter(s=>(s.lv|0)===a.lv),(E.interactables||[]).filter(i=>i.seat&&((i.seat.lv|0)===a.lv)).map(i=>i.seat)); let best=null;
  for(let dx=-1;dx<=1+1e-6;dx+=0.1) for(let dz=-1;dz<=1+1e-6;dz+=0.1){ const x=a.x+dx, z=a.z+dz; if(!E.canStand(x,z,0.3,a.lv)||seats.some(s=>Math.hypot(s.x-x,s.z-z)<0.8)) continue; const d=Math.hypot(dx,dz); if(!best||d<best.d) best={x,z,d}; }
  return best?[+best.x.toFixed(2),+best.z.toFixed(2)]:null; })"""
HEIGHT = r"""(([x,z,lv])=>+GAME.E.heightAt(x,z,lv).toFixed(3))"""
FORMAL = r"""(()=>{ const z=GAME.E.zone; return z?(z.formal===undefined?'none':!!z.formal):null; })()"""
SUMMARY = {}


def jpg(name):
    return os.path.join(OUT, 'tsr_%s_%s.jpg' % (SHA7, name))


async def shot(pg, name):
    try: await pg.screenshot(path=jpg(name), type='jpeg', quality=80)
    except Exception as e: R.note('截圖失敗 %s：%s' % (name, repr(e)[:120]))


async def at_start(pg, cdp, key, Z, why):
    x, z, yaw, lv = Z['start']; h = float(os.environ.get('HOUR_' + key) or os.environ.get('HOUR') or 15.0)
    s = await D.load_zone(pg, cdp, Z['zone'], DAY, h, x, z, yaw, lv, wait=WAIT)
    R.setup('【前置／捷徑】讀檔到 %s（%s）(%.2f, %.2f) 第 %d 層 %s %05.2f：%s；%s' % (Z['zone'], Z['name'], x, z, lv, DAY, h, Z['start_why'], why))
    for _ in range(30):   # 正式模型載完（有 formal 旗標的區域）
        f = await pg.evaluate(FORMAL)
        if f is True or f == 'none': break
        await pg.wait_for_timeout(1000)
    for _ in range(8):
        s = await D.st(pg)
        if not s['dlg']: break
        await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500)
    await L.close_panels(pg, cdp); s = await D.st(pg)
    ok = s['zone'] == Z['zone'] and s['lv'] == lv and not s['seat']
    if not ok: R.note('[%s] 起點狀態不對：%s' % (key, J(s)))
    return ok


async def wait_settle(pg, max_s=60):
    t0 = time.time(); last = None; still = 0; m = None
    while time.time() - t0 < max_s:
        await pg.wait_for_timeout(500)
        m = await pg.evaluate(PSTATE)
        if last and not m['path'] and math.hypot(m['x'] - last['x'], m['z'] - last['z']) < 0.01: still += 1
        else: still = 0
        last = m
        if still >= 2: break
    s = await D.settle(pg)
    return s, await pg.evaluate(PSTATE), round(time.time() - t0, 1)


async def aim(pg, cdp, x, y, z, tag, near_pt=None, lv=0, want=None, floor=False):
    """椅面／地板那一點投影到螢幕，要是遊戲畫面才點；不行就轉鏡頭、再不行就先點地走近。回傳 (pt, 怎麼瞄到的)
    want＝(椅子 x, z)：點椅面時，那個像素射線第一個打到的要是這張椅子（遊戲 tapToSeat 帶 hit 算出來的 rseat＝這張）；被柱子、桌子擋住就換點、轉鏡頭、走近（CC_02 乙 4）"""
    bad0 = lambda q: not q or q.get('off') or not q.get('canvas')
    # 看不看得到用和遊戲無關的幾何判斷（LAWWW2 19:15：用 rseat＝拿遊戲的判斷決定要不要考遊戲，tapToSeat 壞了會全部變「擋住、不判」）：
    #   椅面：射線第一個打到的點離椅子中心水平 ≤0.35 m（BB 19:15）、離椅面高度 ≤0.6 m＝看得到；
    #   走道：射線在地板以前沒打到東西（first 是 null）、或打到的點離地板落點 ≤0.2 m＝看得到。rseat 只印 log 對照，PASS／FAIL 照舊看實際走到哪、按鈕是什麼
    def hits(q):
        f = (q.get('first') or {}).get('p'); hp = q.get('hit')
        if floor: return (not f) or bool(hp and math.hypot(f[0] - hp[0], f[2] - hp[1]) <= 0.2)
        if not want: return True
        return bool(f and math.hypot(f[0] - want[0], f[2] - want[1]) <= 0.35 and abs(f[1] - y) <= 0.6)
    # floor＝點走道：那個像素射線第一個打到的不能是椅子（階梯教室點後排走道，前排椅子在前面：照規則就是點到椅子，不算「走道被導去椅子」）
    bad = lambda q: bad0(q) or not hits(q)

    async def try_pts(how):
        """那一點被 HUD（例：教室的「下一堂課」）蓋住時，像玩家點同一張椅子／同一塊地看得到的旁邊一點（左右 0.15 m、前後 0.1 m）"""
        first = None
        for ox, oz in (OFFS_SEAT if want else OFFS):
            q = await pg.evaluate(TAP_PT, [x + ox, y, z + oz])
            if first is None: first = q
            if not bad(q):
                q['off_xz'] = [ox, oz]; return q, how + ('' if (ox, oz) == (0.0, 0.0) else '（中心被蓋住，點旁邊 %s）' % J([ox, oz]))
        return first, how
    pt, how = await try_pts('直接')
    if bad(pt):
        R.note('%s 從起點看，那一點在畫面外或被按鈕蓋住（%s）：用手指滑轉鏡頭' % (tag, J(pt)))
        await L.turn_camera_to(pg, cdp, x, z); pt, how = await try_pts('轉鏡頭')
    if bad(pt) and near_pt:
        R.note('%s 轉了鏡頭還點不到（%s）：先點地走到 %s（往起點那邊離目標約 4 m、站得住的點）' % (tag, J(pt), J(near_pt)))
        await L.go_to(pg, cdp, R, near_pt[0], near_pt[1], 0.6, '%s（走近）' % tag, max_s=150, lv=lv); await D.settle(pg)
        if (await D.st(pg))['seat']: R.note('%s 走近時坐下了（不應該）' % tag); return None, '走近時坐下'
        await L.turn_camera_to(pg, cdp, x, z); pt, how = await try_pts('走近＋轉鏡頭')
    if bad0(pt): return None, how
    if bad(pt):   # 畫面上點得到，但每一個點射線都先打到別的東西（柱子、桌子、別張椅子）
        R.note('%s %s：射線先打到 %s、遊戲會導去 %s（椅子 %s）' % (tag, '這塊地板每一個點前面都有椅子擋著' if floor else '這張椅子每一個點都被擋住', J(pt.get('first')), J(pt.get('redirect')), J(pt.get('rseat'))))
        return None, 'blocked'
    return pt, how


def find_seat(seats, xz):
    return next((q for q in seats if abs(q['sx'] - xz[0]) < 0.06 and abs(q['sz'] - xz[1]) < 0.06), None)


CENTER_STD = r"""(async b64=>{ const im=new Image(); im.src='data:image/png;base64,'+b64; await im.decode(); const W=im.width, H=im.height, c=document.createElement('canvas'); c.width=W; c.height=H;
  const x=c.getContext('2d'); x.drawImage(im,0,0); const d=x.getImageData(Math.round(W*0.2),Math.round(H*0.2),Math.round(W*0.6),Math.round(H*0.6)).data; let n=0,s=0,s2=0;
  for(let i=0;i<d.length;i+=16){ const y=0.299*d[i]+0.587*d[i+1]+0.114*d[i+2]; s+=y; s2+=y*y; n++; } const m=s/n; return [+m.toFixed(1), +Math.sqrt(Math.max(0,s2/n-m*m)).toFixed(1)]; })"""


async def sit_cam(pg, t, name):
    """BB 08:52：坐下後的遊戲鏡頭——選單收起【捷徑】截圖，量畫面中央 60% 的亮度、標準差（<15＝一片單色，例如鏡頭貼牆）"""
    import base64
    await pg.evaluate("(()=>{ const c=document.getElementById('choices'); if(c) c.style.visibility='hidden'; })()")
    await pg.wait_for_timeout(400); b = await pg.screenshot(type='png')
    await pg.evaluate("(()=>{ const c=document.getElementById('choices'); if(c) c.style.visibility=''; })()")
    try: open(jpg(name).replace('.jpg', '.png'), 'wb').write(b)
    except Exception: pass
    try: m = await pg.evaluate(CENTER_STD, base64.b64encode(b).decode())
    except Exception as e: m = None; R.note('%s 量中央標準差失敗 %r' % (t, e))
    cam = await pg.evaluate("(()=>{ const E=GAME.E, c=E.camera.position, o=E.player.obj.position; return {cam:[+c.x.toFixed(2),+c.y.toFixed(2),+c.z.toFixed(2)], player:[+o.x.toFixed(2),+o.y.toFixed(2),+o.z.toFixed(2)], dist:+c.distanceTo(o).toFixed(2)}; })()")
    R.note('%s 【坐下後的遊戲鏡頭】%s（【捷徑】選單暫時收起）：畫面中央 60%% 亮度／標準差 %s%s；鏡頭 %s' % (t, os.path.basename(jpg(name).replace('.jpg', '.png')), J(m), '  ★中央一片單色（標準差 <15，疑似鏡頭貼牆、看不到人）' if m and m[1] < 15 else '', J(cam)))
    return m


async def joy_seat(pg, cdp, key, Z, k, s):
    """BB 08:52：吧檯高腳椅（lift>0）也用搖桿走過去按「坐下」那條路拍一張坐下後的遊戲鏡頭"""
    t = '[%s 椅子 %d 搖桿]' % (key, k)
    if not await at_start(pg, cdp, key, Z, '搖桿走到椅子 %d 按「坐下」' % k): return
    ap = s['ap'] or [s['x'], s['z']]
    r = await F.joy_to(pg, cdp, t, ap[0], ap[1], near=0.3, lv=s['slv'], max_s=60)
    b = await D.st(pg); R.note('%s 搖桿走到 seatApproach %s：%s、停在 (%s, %s)、互動鍵「%s」' % (t, J(ap), '到了' if r['ok'] else '沒到', b['x'], b['z'], b['interact']))
    if not b['interact'].startswith(s['label']): R.note('%s 互動鍵不是「%s」，不拍' % (t, s['label'])); return
    await L.tap(pg, cdp, '#interact')
    for _ in range(20):
        await pg.wait_for_timeout(500)
        if (await pg.evaluate(PSTATE))['seat']: break
    await pg.wait_for_timeout(800); await sit_cam(pg, t, '%s_seat%d_joysit' % (key, k))


async def seat_one(pg, cdp, key, Z, k, pick):
    nm, first, alts, why = pick
    t = '[%s 椅子 %d %s]' % (key, k, nm)
    if not await at_start(pg, cdp, key, Z, '點椅子 %d（%s）' % (k, nm)): R.check('%s 起點讀檔成功' % t, False, ''); return 'nostart'
    seats = await pg.evaluate(D.SEATS); s = None
    for xz in [first] + alts:
        q = find_seat(seats, xz)
        if not q: R.note('%s (%s, %s) 這一版沒有這張座位' % (t, xz[0], xz[1])); continue
        occ = await pg.evaluate(OCC_JS, [q['sx'], q['sz']])
        if occ: R.note('%s (%s, %s) 有人坐 %s：跳過，換候補' % (t, q['sx'], q['sz'], J(occ))); continue
        s = q; break
    if not s: R.note('%s 首選和候補都沒有／有人坐：這一張不測' % t); return 'skip'
    lv = s['slv']; base = s['sy'] if s['sy'] is not None else await pg.evaluate(HEIGHT, [(s['ap'] or [s['x'], s['z']])[0], (s['ap'] or [s['x'], s['z']])[1], lv])
    y = round(base + 0.45 + (s.get('lift') or 0), 3)
    R.note('%s 挑 (%s, %s)「%s」：%s%s；seatApproach %s；椅面高 %s（地板 %s＋0.45＋lift %s）' % (t, s['sx'], s['sz'], s['label'], why, '' if (s['sx'], s['sz']) == first else '（首選有人坐或不存在，用候補）', J(s['ap']), y, base, s.get('lift') or 0))
    sx0, sz0 = Z['start'][0], Z['start'][1]; dd = math.hypot(sx0 - s['sx'], sz0 - s['sz'])
    nb = await pg.evaluate(NEAR_STAND, {'x': s['sx'] + (sx0 - s['sx']) * min(1.0, 4.0 / max(dd, 0.01)), 'z': s['sz'] + (sz0 - s['sz']) * min(1.0, 4.0 / max(dd, 0.01)), 'lv': lv})
    pt, how = await aim(pg, cdp, s['sx'], y, s['sz'], t, near_pt=nb, lv=lv, want=(s['sx'], s['sz']))
    if not pt and how == 'blocked':
        R.note('%s 從起點、轉鏡頭、走近都看不到這張椅子沒被擋住的地方：不判（玩家也點不到被擋住的那一點）' % t); await shot(pg, '%s_seat%d_blocked' % (key, k)); return 'blocked'
    if not pt:
        R.check('%s 畫面上點得到這張椅面（%s）' % (t, how), False, ''); await shot(pg, '%s_seat%d_notap' % (key, k))
        if s.get('lift'):   # N1_TSR_CAFEBAR（b77a）：高腳椅一直在 HUD 下面點不到——這一行要看的「坐下後鏡頭」改走搖桿那一條，照樣量
            try: await joy_seat(pg, cdp, key, Z, k, s)
            except Exception as e: R.note('%s 搖桿那一條沒跑完 %r' % (t, e))
        return 'notap'
    if await pg.evaluate(PHONE_OPEN):   # CC 11-11 19:1x：宿舍椅子 1 兩次都是點椅面那一下手機開著——分清楚是點之前就開著（走近那一步、自動打開），還是這一下點出來的
        R.note('%s 點椅面之前手機已經開著（%s）：先收起來再點' % (t, await pg.evaluate("(()=>{ const a=document.querySelector('#phone .on, #phone .sel, #phone [aria-selected=true]'); return a?a.textContent.trim():''; })()")))
        await shot(pg, '%s_seat%d_phone_before' % (key, k))
        try: await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(400)
        except Exception as e: R.note('%s 收手機失敗 %r' % (t, e))
        pt2 = await pg.evaluate(TAP_PT, [s['sx'] + (pt.get('off_xz') or [0, 0])[0], y, s['sz'] + (pt.get('off_xz') or [0, 0])[1]])
        if pt2 and not pt2.get('off'): pt2['off_xz'] = pt.get('off_xz'); pt = pt2
    fb0 = (await D.st(pg))['fb']
    R.note('%s 點椅面（%s）螢幕 (%s, %s)、離鏡頭 %s m、視線俯角 %s°：地板落點 %s、射線先打到 %s、tapRedirect 導去 %s（椅子 %s）' % (t, how, pt['sx'], pt['sy'], pt['dist'], pt['pitch'], J(pt['hit']), J(pt.get('first')), J(pt['redirect']), J(pt['rseat'])))
    await L.touch_tap(cdp, pt['sx'], pt['sy'])
    b, m, secs = await wait_settle(pg); ni = await pg.evaluate(D.NEAR_IT)
    pho = await pg.evaluate("(()=>{ const p=document.getElementById('phone'); return !!p&&!p.classList.contains('hide')&&p.offsetParent!==null; })()")
    if pho:   # CC 11-11 19:0x（N1_TSR_DORM 椅子 1）：點椅面後手機開著＝這一下沒點到遊戲畫面，記「HUD 蓋住」不判（CC_02 乙 4）
        R.note('%s 點椅面後手機開著（這一下沒點到遊戲畫面）：不判，收起手機；tapPref %s' % (t, J(m['tp']))); await shot(pg, '%s_seat%d_hud' % (key, k))
        try: await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(400)
        except Exception as e: R.note('%s 收手機失敗 %r' % (t, e))
        return 'hud'
    mine = bool(ni and ni['seat'] and abs(ni['seat'][0] - s['sx']) < 0.01 and abs(ni['seat'][1] - s['sz']) < 0.01)
    ok_btn = b['interact'].startswith(s['label']) and mine
    dap = math.hypot(b['x'] - s['ap'][0], b['z'] - s['ap'][1]) if s['ap'] else None
    R.note('%s 走到 (%s, %s)（%s 秒；離 seatApproach %s m；tapPref %s）：互動鍵「%s」、最近的互動 %s' % (t, b['x'], b['z'], secs, None if dap is None else round(dap, 2), J(m['tp']), b['interact'], J(ni)))
    if not R.check('%s 點椅面走過去，互動鍵是「%s」而且就是這一張' % (t, s['label']), ok_btn, J({'interact': b['interact'], 'near': ni, 'at': [b['x'], b['z']], 'redirect': pt['redirect']})):
        await shot(pg, '%s_seat%d_nobtn' % (key, k))
        if s.get('lift'):   # 點椅面不行也要看搖桿那條路坐下後的鏡頭（舊版對照：線上是不是本來就整片牆，BB 08:52）
            try: await joy_seat(pg, cdp, key, Z, k, s)
            except Exception as e: R.note('%s 搖桿那一條沒跑完 %r' % (t, e))
        return 'nobtn'
    await L.tap(pg, cdp, '#interact'); sat = None
    for i_ in range(24):
        await pg.wait_for_timeout(500)
        sat = (await pg.evaluate(PSTATE))['seat']
        if sat: break
        if i_ == 8:   # 4 秒還沒坐下：收掉對話、按鈕還是這一張就再按一次
            c0 = await D.st(pg)
            if c0['dlg']: await L.tap(pg, cdp, '#dlg')
            elif c0['interact'].startswith(s['label']): R.note('%s 按了 4 秒沒坐下（%s），再按一次' % (t, J(c0))); await L.tap(pg, cdp, '#interact')
    d = math.hypot(sat[0] - s['sx'], sat[1] - s['sz']) if sat else None
    good = sat is not None and d <= 0.15
    R.check('%s 按下去坐到這一張（座位差 %s ≤0.15 m）' % (t, None if d is None else round(d, 3)), good, J({'sat': sat, 'want': [s['sx'], s['sz']]}))
    R.check('%s walkFallbacks 沒增加' % t, (await D.st(pg))['fb'] == fb0, '')
    await pg.wait_for_timeout(800); await shot(pg, '%s_seat%d_sit' % (key, k) if good else '%s_seat%d_wrong' % (key, k))
    if sat: await sit_cam(pg, t, '%s_seat%d_sitcam' % (key, k))
    if s.get('lift'):
        try: await joy_seat(pg, cdp, key, Z, k, s)
        except Exception as e: R.note('%s 搖桿那一條沒跑完 %r' % (t, e))
    return 'ok' if good else 'wrong'


async def point_one(pg, cdp, key, Z, kind, k, xz, desc, lv):
    """kind：floor（判）、between、table（只記）"""
    lab = {'floor': '走道', 'between': '兩張椅子中間', 'table': '桌面'}[kind]
    t = '[%s %s %d]' % (key, lab, k)
    if not await at_start(pg, cdp, key, Z, '點%s %d（%s）' % (lab, k, desc)): R.check('%s 起點讀檔成功' % t, False, ''); return {'r': 'nostart'}
    x, z = xz; seats = await pg.evaluate(D.SEATS)
    if kind == 'floor':
        y = await pg.evaluate(HEIGHT, [x, z, lv]); what = '地板（heightAt %s）' % y
    elif kind == 'between':
        near = sorted([q for q in seats if q['slv'] == lv], key=lambda q: math.hypot(q['sx'] - x, q['sz'] - z))
        base = 0.0
        if near:
            q = near[0]; ap = q['ap'] or [q['x'], q['z']]
            base = q['sy'] if q['sy'] is not None else await pg.evaluate(HEIGHT, [ap[0], ap[1], lv])
        y = round(base + 0.45, 3); what = '椅面高度（最近的座位那一層地板 %s＋0.45）' % base
    else:
        fy = await pg.evaluate(HEIGHT, [x, z, lv])
        if kind == 'table':
            near = sorted([q for q in seats if q['slv'] == lv], key=lambda q: math.hypot(q['sx'] - x, q['sz'] - z))
            if near:
                q = near[0]; ap = q['ap'] or [q['x'], q['z']]
                fy = q['sy'] if q['sy'] is not None else await pg.evaluate(HEIGHT, [ap[0], ap[1], lv])
        tt = await pg.evaluate(TABLE_TOP, {'x': x, 'z': z, 'lv': lv, 'fy': fy, 'r': 0.5})
        if not tt:
            R.note('%s (%s, %s) %s：附近 0.5 m 量不到桌面（地板 %s 上 0.35～1.0 m 沒有面），不點' % (t, x, z, desc, fy)); return {'r': 'notable', 'at': [x, z]}
        x, z, y = tt['x'], tt['z'], tt['y']; what = '桌面（射線量到 y %s，網格「%s」材質「%s」，離原本的點 %s m）' % (y, tt['mesh'], tt['mat'], tt['d'])
    pt, how = await aim(pg, cdp, x, y, z, t, floor=(kind == 'floor'))
    if not pt:
        R.note('%s (%s, %s) %s：畫面上點不到（%s），不測' % (t, x, z, desc, how)); return {'r': 'notap', 'at': [x, z]}
    fb0 = (await D.st(pg))['fb']
    R.note('%s 點 (%s, %s) %s——%s；螢幕 (%s, %s)（%s）、離鏡頭 %s m、俯角 %s°：地板落點 %s、tapRedirect 導去 %s（椅子 %s）' % (t, x, z, desc, what, pt['sx'], pt['sy'], how, pt['dist'], pt['pitch'], J(pt['hit']), J(pt['redirect']), J(pt['rseat'])))
    tap64 = 'tsr_%s_%s_%s%d_tap64.png' % (SHA7, key, kind, k)   # BB 10:13：點的那一點螢幕上看到什麼（64×64 小圖，點的位置在正中央）
    try:
        await pg.screenshot(path=os.path.join(OUT, tap64), clip={'x': max(0, pt['sx'] - 32), 'y': max(0, pt['sy'] - 32), 'width': 64, 'height': 64})
        R.note('%s 點擊螢幕座標 (%s, %s)；那一點的 64×64 小圖 %s' % (t, pt['sx'], pt['sy'], tap64))
    except Exception as e: R.note('%s 64×64 小圖失敗 %r' % (t, e))
    await L.touch_tap(cdp, pt['sx'], pt['sy'])
    b, m, secs = await wait_settle(pg); ni = await pg.evaluate(D.NEAR_IT)
    d = math.hypot(b['x'] - x, b['z'] - z)
    dh = math.hypot(b['x'] - pt['hit'][0], b['z'] - pt['hit'][1]) if pt['hit'] else None
    res = {'r': 'done', 'at': [x, z], 'stop': [b['x'], b['z']], 'd': round(d, 2), 'seat': m['seat'], 'redirect': pt['redirect'], 'rseat': pt['rseat'], 'tp': m['tp'], 'interact': b['interact'], 'near': ni, 'dlg': b['dlg'], 'fb': b['fb'] - fb0}
    R.note('%s 結果：停在 (%s, %s)（%s 秒；離點的地方 %.2f m、離地板落點 %s m）；坐下 %s；tapPref %s；互動鍵「%s」；最近的互動 %s；對話 %s；walkFallbacks +%d' % (
        t, b['x'], b['z'], secs, d, None if dh is None else round(dh, 2), J(m['seat']), J(m['tp']), b['interact'], J(ni), b['dlg'], b['fb'] - fb0))
    # CC 11-11 19:0x（N1_TSR_DORM 走道 5）：點到 HUD 旁邊、打開了手機＝這一下沒點到遊戲畫面，記「HUD 蓋住」不判（CC_02 乙 4）
    pho = await pg.evaluate("(()=>{ const p=document.getElementById('phone'); return !!p&&!p.classList.contains('hide')&&p.offsetParent!==null; })()")
    if pho:
        R.note('%s 點下去打開了手機（點到 HUD 旁邊，沒點到遊戲畫面）：不判，收起手機' % t); await shot(pg, '%s_%s%d_hud' % (key, kind, k))
        try: await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(400)
        except Exception as e: R.note('%s 收手機失敗 %r' % (t, e))
        res['r'] = 'HUD 蓋住'; return res
    if kind == 'floor':
        ok = not m['seat'] and pt['redirect'] is None and d <= FLOOR_NEAR
        if not R.check('%s 點走道 (%s, %s)：沒有坐下、沒有被導去椅子、停在點的地方 %.2f m 內（≤%s）' % (t, x, z, d, FLOOR_NEAR), ok, J({k_: res[k_] for k_ in ('stop', 'd', 'seat', 'redirect', 'rseat', 'tp', 'interact')})):
            await shot(pg, '%s_floor%d_fail' % (key, k))
        res['r'] = 'PASS' if ok else 'FAIL'
    else:
        if pt['rseat']: res['r'] = '導去椅子 (%s, %s)' % (pt['rseat'][0], pt['rseat'][1])
        elif pt['redirect']: res['r'] = '導去 %s' % J(pt['redirect'])
        else: res['r'] = '走過去（停在離點 %.2f m）' % d
        if m['seat']: res['r'] += '＋坐下了'
    return res


async def part(pg, cdp, key):
    Z = ZONES[key]; lv = Z['start'][3]; sm = SUMMARY.setdefault(key, {'seats': [], 'floor': [], 'between': [], 'table': []})
    R.note('===== %s：%s（zone %s）SHA %s =====' % (key, Z['name'], Z['zone'], SHA))
    if not await pg.evaluate("(z=>!!(typeof Z3!=='undefined'&&Z3.ZONES&&Z3.ZONES[z]))", Z['zone']):
        R.check('[%s] 這一版有區域 %s' % (key, Z['zone']), False, ''); return
    for k, pick in enumerate(Z['seats'], 1):
        if ONLY_SEATS and k not in ONLY_SEATS: continue
        try: r = await seat_one(pg, cdp, key, Z, k, pick)
        except Exception as e: R.check('[%s 椅子 %d] 沒有中斷' % (key, k), False, repr(e)[:300]); r = 'error'
        sm['seats'].append((pick[0], r))
    # 走道地板點：先照 floors 的首選找最近合格的點，不夠再自動補
    if N_FLOOR:
        await at_start(pg, cdp, key, Z, '挑走道地板點（只讀資料、不點）')
        pts = []
        for xz, desc in Z['floors']:
            q = await pg.evaluate(FLOOR_PICK, {'pref': list(xz), 'r': 0.6, 'lv': lv})
            if q: pts.append(((q['x'], q['z']), '%s（首選 (%s, %s)，移 %s m 到合格的點）' % (desc, xz[0], xz[1], q['d'])))
            else: R.note('[%s] 走道首選 (%s, %s) %s：0.6 m 內沒有「站得住、0.8 m 內沒有椅子」的點，換自動挑' % (key, xz[0], xz[1], desc))
            if len(pts) >= N_FLOOR: break
        if len(pts) < N_FLOOR:
            more = await pg.evaluate(FLOOR_PICK, {'pref': None, 'n': N_FLOOR - len(pts), 'lv': lv, 'have': [list(p[0]) for p in pts]})
            for q in more: pts.append(((q[0], q[1]), '自動挑（站得住、0.8 m 內沒有椅子、起點畫面上看得到、和其他點分散）'))
        R.note('[%s] 走道地板點 %d 個：%s' % (key, len(pts), J(pts)))
        for k, (xz, desc) in enumerate(pts[:N_FLOOR], 1):
            try: r = await point_one(pg, cdp, key, Z, 'floor', k, xz, desc, lv)
            except Exception as e: R.check('[%s 走道 %d] 沒有中斷' % (key, k), False, repr(e)[:300]); r = {'r': 'error'}
            sm['floor'].append(r)
    for kind, lst, n in (('between', Z['between'], N_BETWEEN), ('table', Z['tables'], N_TABLE)):
        for k, (xz, desc) in enumerate(lst[:n], 1):
            try: r = await point_one(pg, cdp, key, Z, kind, k, xz, desc, lv)
            except Exception as e: R.check('[%s %s %d] 沒有中斷' % (key, kind, k), False, repr(e)[:300]); r = {'r': 'error'}
            r['desc'] = desc; sm[kind].append(r)


def print_summary():
    print('=' * 20 + ' 總表（SHA %s，%s 15:00 類；FLOOR_NEAR %s m）' % (SHA, DAY, FLOOR_NEAR), flush=True)
    for key, sm in SUMMARY.items():
        seats = sm['seats']; fl = sm['floor']
        print('【%s】%s' % (key, ZONES[key]['name']), flush=True)
        nj = ['椅子 %s：%s' % (a, r) for a, r in seats if r in ('blocked', 'notap', 'hud')] + ['走道 %s：%s' % (J(r.get('at')), r['r']) for r in fl if r['r'] not in ('PASS', 'FAIL')]
        tot = len(seats) + len(fl)
        R.check('[%s] 不判（被擋住、點不到、HUD 蓋住）的不超過一半：%d／%d（LAWWW2 19:15：全部不判不能當成過）' % (key, len(nj), tot), tot == 0 or len(nj) * 2 <= tot, J(nj))
        print('  椅面 %d 張：ok %d｜%s' % (len(seats), sum(1 for _, r in seats if r == 'ok'), '；'.join('%s＝%s' % (a, r) for a, r in seats)), flush=True)
        print('  走道 %d 下：PASS %d、FAIL %d、其他 %d｜%s' % (len(fl), sum(1 for r in fl if r['r'] == 'PASS'), sum(1 for r in fl if r['r'] == 'FAIL'), sum(1 for r in fl if r['r'] not in ('PASS', 'FAIL')),
                                                         '；'.join('%s→%s（%s）' % (J(r.get('at')), r['r'], r.get('d')) for r in fl)), flush=True)
        for kind, lab in (('between', '兩張椅子中間'), ('table', '桌面')):
            print('  %s（只記）：%s' % (lab, '；'.join('%s %s→%s｜互動鍵「%s」' % (r.get('desc', ''), J(r.get('at')), r['r'], r.get('interact', '')) for r in sm[kind]) or '（沒跑）'), flush=True)


async def main():
    print('CC TAPSEAT_REG：PARTS %s；SHA %s；DAY %s；Playwright 手機模擬 ≠ iPhone' % (','.join(PARTS), SHA, DAY), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return R.finish()
        await pg.evaluate("(()=>{ try{ localStorage.clear(); }catch(e){} if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}; })()")
        cal = await pg.evaluate("(k=>{ try{ const d=STORY.dayOfKey(k); const c=CALENDAR.dateOf(d); return {day:d, wd:c.wd, key:c.key, hol:c.holiday||c.hol||null}; }catch(e){ return String(e); } })", DAY)
        R.note('日期 %s：%s（wd 3＝星期三）；tapToSeat 有沒有射線判斷（0d7922555 起）：%s' % (DAY, J(cal), await pg.evaluate("(()=>{ try{ return /o\\.ray/.test(String(GAME.E.tapRedirect)); }catch(e){ return null; } })()")))
        for key in PARTS:
            if key not in ZONES: R.check('[%s] 認得這個 PART' % key, False, '可用：' + ','.join(ZONES)); continue
            print('== %s' % key, flush=True)
            try: await part(pg, cdp, key)
            except Exception as e: R.check('[%s] 沒有中斷' % key, False, repr(e)[:300])
        R.check('沒有 JS 例外（pageerror）', not errs, J(errs[:3]))
        await b.close()
    print_summary()
    return R.finish()

sys.exit(asyncio.run(main()))
