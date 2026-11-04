"""CC（帳號 A）11-04：BIKE_shop——慢輪單車（LAWWW 049592a15 進得去／買車／換車／自動停車；f63591e37 AA_651 補胎、櫃台小東西、換車後兩句；933b9c36d 室內 v1b；5c8450327 自動停車避開店門；c7fde4f3e REPAIR_BIKE 打開時加導航阻擋）。測 c7fde4f3e；CASES=R 測 555b9e0cb（BIKE-PARK-1104 停車架）。
  真實玩家流程（不用 ?turbo、不瞬移、不改劇情狀態）；只有前置讀檔，標【前置／捷徑】。每一段都做卡住檢查、逐句印對話（transcript）、截圖。
  P 錢不夠：【前置／捷徑】讀檔：公館、慢輪單車門口南邊 (−0.3, 14)、2025-09-23（二）15:00、money 50、條件事件關閉。
     P1 走到店門口 →「進入慢輪單車」→ 進店（zone bikeshop）
     P2 看淑女車 → 選「買這台」→ 老闆「這台不急。……下次再來看。」、不扣錢、沒有多一台車
     P3 找車行老闆 →「補胎」→ 老闆「先打氣撐一下，……明天再來。」、不扣錢
  M 錢夠：【前置／捷徑】同上、money 30000。
     M1 進店；室內 v1b（933b9c36d）：正式模型接上以後修車架上的車（GLB 節點 REPAIR_BIKE*）是藏的（visible＝false）；
        修車架旁邊走得過去：真的走到兩支修車架後面、工作台前的走道 (2.0, −4.85)，再走到左邊那條縫 (0.65, −4.0)
     M1c（c7fde4f3e）：【前置／捷徑】直接叫遊戲自己的 BIKESHOP.repairBike(true)（調座墊、補胎、打氣那一幕用的同一個入口）打開修車架上的車：
        BIKE_LAYOUT.bike.repairBike.blockWhenShown 那一塊的導航格全部 E.nav.free＝false（走不進去）；repairBike(false) 收起來：同一塊回到打開前的樣子（原本 free 的格子都 free），
        而且真的走得到那一塊裡站得住的一點（L.go_to）
     M2 看淑女車 → 買這台 → 奶油白：扣 4,200、現在騎的＝淑女車奶油白、買過的車 2 台、時間 +10 分；台詞：調座墊、旁白、「騎看看。」
     M3 找車行老闆 → 換一台騎 → 城市通勤車：AA_651「好，這台。……那台先放我這裡。」＋旁白「（座墊還是你上次調的高度。）」；再換回淑女車（同兩句）
     M4 補胎：扣 100、時間 +15 分；台詞：老闆「扎到釘子了。……十五分鐘。」、旁白「（老闆把輪胎泡進水盆，看了一圈，沒有氣泡了。）」、老闆「好了。最近那條路在施工，繞一下。」
     M5 車燈・車鈴・鎖 → 車燈：扣 350、G.bike.parts.light；旁白＋老闆「晚上騎河濱要開。」
     M6 再點一次：選項寫「買過了」、老闆「你上次買過了。……還在用吧？」、不扣錢
     M7 離開慢輪單車：車停在車行門口的停車位（BIKESHOP.PARK，z<19 不在騎樓）、站得住不擋門（BIKE.parkOK）
     M8 騎車：公館 → 溫州街（進一棟、出來）→ 回公館 → 校園（進一棟、出來）→ 118 巷（進一棟、出來）。
        每次出來：車在這一區、停在 bike_shop_park_unit.js 的規則下的位置（最近的合法停車處 ≤ BIKE.MAXD；都太遠才停門旁）、BIKE.parkOK（站得住、不擋門）、公館不在騎樓；
        （M7、M8 每次）停好的車身（場景裡 bike_ride 的外框）不和任何店門交疊：店門＝這一區所有店的門口互動點（含打烊時換成的字、溫州街 wzShop 的「進入」）為圓心、1.2 m 寬（半徑 0.6）；
        公館另外加 zones3d.js DOORS 九個門（含第二批四間還沒有互動點的門）門前 1.2 m 寬的通道（門x±0.6、z 16.5～21.6）；
        走到車停的地方站上去 → 卡住檢查；走到車旁邊 →「騎腳踏車」→ 上車。
     M9 存檔（GAME.autosave，和換區域的自動存檔同一個）→ 重新整理 → 標題「繼續」：車還在、位置一樣、是買的那一台（淑女車奶油白）。
  R 騎車實走（555b9e0cb，LAWWW2 的停車架：校園 11 座、公館校門外 1、新生南路 4、溫州街 3 個停車位；CASES=R，EXITS 可以挑）：
     【前置／捷徑】先讀檔算校園的 BIKE.parkSpots，再讀檔：校園體育館南邊 (74, 50)、10:00，車停在最近的那一個合法停車處。之後全部真的騎、真的走。
     出口（照 555b9e0cb 的互動點）：體育館（classes3d.js DOORS gym (74, 59.4)）→ 總圖（「進入總圖書館」(86.4, 0)）→ 法律系館 B（「進入法律系館B」(90.68, −83.65)）
       → 博雅（DOORS boya「博思教學館」(−38, −72.8)）→ 側門 → 新生南路 山嵐書店（(−15.6, 10.2)；新生南路的店都還沒有室內，只能「看」）→ 往溫州街 → 溫州街 阿德影印輸出（(−8, 4.6)）。
     每個出口：騎到門口 → 停好（體育館、新生南路：騎到門口按「下車」〔遊戲的下車〕；總圖、法律系館 B、博雅、溫州街：騎著直接按門〔進門前遊戲自己下車〕；記實際走的路徑）
       → 截圖 park_<出口>_door.png → 進去（博雅、體育館的選單選「進館裡逛逛」）→ 店裡 G.bike.zone 還是外面那一區 → 出來
       → 截圖 park_<出口>.png（鏡頭轉到車和最近的停車架／停車位中間）→ 檢查：
         ① 車還在：G.bike 的區域是外面那一區、場景裡停著的車就在 G.bike 的位置（≤ 0.05 m）、等 3 秒不會動
         ② 不在騎樓：公館 z < 19、溫州街 |z| ≤ 4.3（路邊機車排 z ±3.95～4.1 是合法的）、新生南路不在 x −16.5～−13.0（騎樓）；校園沒有騎樓（只記）
         ③ 不擋門：車身外框不碰任何門口 0.6 m（同 M7／M8 的交疊量測）；BIKE.parkOK
         ④ 停車那一格站得住、站上去推得動；走到車旁邊有「騎腳踏車」、上得了車
         ⑤ 自動停車的規則（出建築：最近的合法停車處 ≤ BIKE.MAXD，都太遠才停門旁；沒進建築〔新生南路只能看〕：車留在按下車的地方）
         INFO：車離最近的停車架／停車位幾公尺、是不是停在架子格位上（BIKE.parkSpots 的 src rack／row／spot）
       → 卡住檢查
  卡住檢查：對話框關掉、GAME.D.busyDepth 0、搖桿推得動 ≥ 0.3 m（四個方向試）、GAME.walkFallbacks 沒有增加、沒有 JS 例外。
用法：LW_TESTS=<wt>/tests [CASES=P,M,R] [LEGS=wenzhou,campus,lane118] [EXITS=gym,library,wancai,boya,xinsheng,wenzhou] python3 cc_bike_shop_probe.py <url> <out>"""
import os, sys, json, asyncio, time, math
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
CASES = [c.strip() for c in (os.environ.get('CASES') or 'P,M').split(',') if c.strip()]
EXITS = [c.strip() for c in (os.environ.get('EXITS') or 'gym,library,wancai,boya,xinsheng,wenzhou').split(',') if c.strip()]
LEGS = [c.strip() for c in (os.environ.get('LEGS') or 'wenzhou,campus,lane118').split(',') if c.strip()]
J = lambda o: json.dumps(o, ensure_ascii=False)
FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True, 'BIKE_TIP': True}
DAY, WD = 7, 2          # 2025-09-23（二）：慢輪單車週一公休
DOOR = (-0.3, 21.0)     # 公館店門口互動點（zones3d.js：sx−0.6、FZ+2）
OUTDOOR = ['campus', 'gongguan', 'wenzhou', 'lane118', 'xinsheng']
LADY_WHITE = '#efe8d8'
# 台詞（AA_646／AA_651 原文；f63591e37）
LN = {'poor': '這台不急。……下次再來看。', 'fit': '好，我幫你調一下座墊。……十分鐘。', 'fitDone': '（老闆把座墊調到你的高度，按了兩下車鈴。）', 'try': '騎看看。',
      'which': '哪一台？', 'swapDone': '好，這台。……那台先放我這裡。', 'swapNarr': '（座墊還是你上次調的高度。）',
      'fix': '扎到釘子了。……十五分鐘。', 'fixNarr': '（老闆把輪胎泡進水盆，看了一圈，沒有氣泡了。）', 'fixDone': '好了。最近那條路在施工，繞一下。', 'fixPoor': '先打氣撐一下，……明天再來。',
      'light1': '（老闆把車燈鎖在把手上，按了一下。前面的地上亮了一圈。）', 'light2': '晚上騎河濱要開。', 'again': '你上次買過了。……還在用吧？',
      'ladyDesc': '（前面一個大車籃，後座可以裝載人墊。）', 'ladyLine': '買菜、上課都好用。'}
FAILS = []


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)
    return ok


class Run:   # playlib.go_to 要的最小介面
    def note(self, s): print('  ' + s, flush=True)
    def check(self, n, ok, info=''): return check(n, ok, info)


ST = """(()=>{ const G=GAME.G, E=GAME.E, P=E.player, p=P.obj.position, D=GAME.D||{}; const it=document.getElementById('interact');
  return {zone:G.zone, hour:+(+G.hour).toFixed(4), x:+p.x.toFixed(2), z:+p.z.toFixed(2), dlg:!!D.active, depth:D.busyDepth|0, busy:!!P.busy, money:G.money|0, riding:!!P.riding,
    name:((document.getElementById('dlgName')||{}).textContent||'').trim(), text:String(D.full||((document.getElementById('dlgText')||{}).textContent)||'').slice(0,160),
    choices:[...document.querySelectorAll('#choices:not(.hide) button')].map(b=>(b.textContent||'').trim()),
    interact:(it&&!it.classList.contains('hide')&&getComputedStyle(it).display!=='none')?(it.textContent||'').trim():'', fb:GAME.walkFallbacks||0,
    toast:((document.getElementById('toast')||{}).textContent||'').trim().slice(0,60)}; })()"""
BK = """(()=>{ const E=GAME.E, G=GAME.G, P=E.player; const pk=E.zone&&E.zone.group.children.find(o=>o.name==='bike_ride');
  return {zone:G.zone, riding:!!P.riding, parked:pk?[+pk.position.x.toFixed(2),+pk.position.z.toFixed(2)]:null, bike:G.bike?JSON.parse(JSON.stringify(G.bike)):null}; })()"""
FIND_JS = """(q=>{ const its=GAME.E.interactables.filter(i=>!i.hidden&&(q.look?i.bikeLook===q.look:(q.exitTo?(i.exit&&i.exit.to===q.exitTo):(i.label||'').startsWith(q.label))));
  const p=GAME.E.player.obj.position; its.sort((a,b)=>Math.hypot(a.x-p.x,a.z-p.z)-Math.hypot(b.x-p.x,b.z-p.z)); const it=its[0];
  return it?{x:+it.x.toFixed(2),z:+it.z.toFixed(2),r:it.radius||1.5,label:it.label,to:it.exit?it.exit.to:null,lv:it.lv==null?null:it.lv}:null; })(%s)"""
# 一棟可以進去的建築：最近的、看得到的、通往室內的出口（溫州街優先阿德影印輸出，和 bike_shop_park_unit.js 同一間）
BLDG_JS = """(([outdoor,prefer])=>{ const p=GAME.E.player.obj.position; const its=GAME.E.interactables.filter(i=>!i.hidden&&i.exit&&i.exit.to&&!outdoor.includes(i.exit.to)&&(i.lv|0)===0);
  its.sort((a,b)=>((prefer&&a.exit.to===prefer)?-1e6:0)+Math.hypot(a.x-p.x,a.z-p.z)-((prefer&&b.exit.to===prefer)?-1e6:0)-Math.hypot(b.x-p.x,b.z-p.z)); const it=its[0];
  return it?{x:+it.x.toFixed(2),z:+it.z.toFixed(2),r:it.radius||1.5,label:it.label,to:it.exit.to}:null; })(%s)"""
PCHK = """(()=>{ const E=GAME.E, G=GAME.G, s=G.bike||{}, z=G.zone; const spots=BIKE.parkSpots(E,z); const p=E.player.obj.position;
  const inSpot=spots.find(q=>Math.hypot(q.x-s.x,q.z-s.z)<0.01)||null; const leg=BIKE.legalSpot(E,z,p.x,p.z);
  const doors=E.interactables.filter(i=>i.exit&&!i.bike).map(i=>({l:i.label,d:+(Math.hypot(i.x-s.x,i.z-s.z)-(i.radius||1.5)).toFixed(2)})).sort((a,b)=>a.d-b.d).slice(0,2);
  return {zone:s.zone, x:s.x, z:s.z, yaw:s.yaw, kind:s.kind, color:s.color, inSpot:inSpot?inSpot.src:null, ok:BIKE.parkOK(E,{x:s.x,z:s.z,yaw:s.yaw||0}), nSpots:spots.length,
    legal:leg?{x:+leg.x.toFixed(2),z:+leg.z.toFixed(2),d:+leg.d.toFixed(1)}:null, maxd:BIKE.MAXD, dPlayer:+Math.hypot(s.x-p.x,s.z-p.z).toFixed(2), doors}; })()"""
REPAIR_JS = """(()=>{ const z=GAME.E.zone; if(!z||!z.group) return null; const ns=[]; z.group.traverse(o=>{ if(/^REPAIR_BIKE/.test(o.name)) ns.push({n:o.name,v:o.visible}); });
  return {formal:!!z.formal, nodes:ns, stand:[GAME.E.canStand(2.0,-2.85,0.3,0),GAME.E.canStand(0.65,-3.4,0.3,0)]}; })()"""
DOORHIT_JS = """(([outdoor,ggDoors])=>{ const E=GAME.E, G=GAME.G, pk=E.zone&&E.zone.group.children.find(o=>o.name==='bike_ride'); if(!pk) return null;
  pk.updateMatrixWorld(true); const B=new THREE.Box3().setFromObject(pk); const bb={x0:+B.min.x.toFixed(2),x1:+B.max.x.toFixed(2),z0:+B.min.z.toFixed(2),z1:+B.max.z.toFixed(2)};
  const doors=[]; for(const i of E.interactables){ if(i.bike) continue; const lb=i.label||''; const isDoor=(i.exit&&i.exit.to&&!outdoor.includes(i.exit.to))||(i.wzShop&&i.kind==='enter')||lb.startsWith('進入')||(i.look&&/鐵捲門|打烊|公休/.test(i.look));
    if(isDoor) doors.push({k:'c',l:lb,x:i.x,z:i.z,r:0.6}); }
  if(G.zone==='gongguan') for(const d of ggDoors) doors.push({k:'r',l:'公館店門 x '+d,x0:d-0.6,x1:d+0.6,z0:16.5,z1:21.6});
  const hit=[]; for(const d of doors){ if(d.k==='c'){ const dx=Math.max(bb.x0-d.x,0,d.x-bb.x1), dz=Math.max(bb.z0-d.z,0,d.z-bb.z1); if(Math.hypot(dx,dz)<d.r) hit.push(d); }
    else if(bb.x0<d.x1&&bb.x1>d.x0&&bb.z0<d.z1&&bb.z1>d.z0) hit.push(d); }
  return {bb, nDoors:doors.length, hit:hit.slice(0,4)}; })(%s)"""
REPNAV_JS = """(op=>{ const E=GAME.E, nav=E.nav, BL=(typeof BIKE_LAYOUT!=='undefined'&&BIKE_LAYOUT.bike.repairBike)?BIKE_LAYOUT.bike.repairBike.blockWhenShown:null; if(!BL||typeof BIKESHOP==='undefined') return {err:'沒有 blockWhenShown 或 BIKESHOP'};
  const [cx,cz,w,d]=BL, pts=[]; for(let x=cx-w/2+0.1;x<=cx+w/2-0.1+1e-6;x+=0.1) for(let z=cz-d/2+0.1;z<=cz+d/2-0.1+1e-6;z+=0.1) pts.push([x,z]);
  if(op==='open'){ GAME._ccRepFree=pts.map(([x,z])=>!!nav.free(x,z)); const n=BIKESHOP.repairBike(true); const fr=pts.filter(([x,z])=>nav.free(x,z)); let vis=null; E.zone.group.traverse(o=>{ if(/^REPAIR_BIKE/.test(o.name)) vis=o.visible; });
    return {BL, nodes:n, n:pts.length, freeBefore:GAME._ccRepFree.filter(Boolean).length, freeNow:fr.length, sample:fr.slice(0,3), visible:vis}; }
  const n=BIKESHOP.repairBike(false); const before=GAME._ccRepFree||[]; const lost=pts.filter(([x,z],i)=>before[i]&&!nav.free(x,z)); let vis=null; E.zone.group.traverse(o=>{ if(/^REPAIR_BIKE/.test(o.name)) vis=o.visible; });
  let tgt=null; for(const [x,z] of pts){ if(E.canStand(x,z,0.3,0)){ tgt=[+x.toFixed(2),+z.toFixed(2)]; break; } }
  return {BL, nodes:n, n:pts.length, freeBefore:before.filter(Boolean).length, freeNow:pts.filter(([x,z])=>nav.free(x,z)).length, lost:lost.length, visible:vis, target:tgt}; })(%s)"""
ARCADE_RULE = {'gongguan': '公館 z < 19', 'wenzhou': '溫州街 |z| ≤ 4.3', 'xinsheng': '新生南路 x 不在 −16.5～−13.0'}


def arcade(zone, x, z):
    """在騎樓裡＝True；這一區沒有騎樓的判斷＝None"""
    if zone == 'gongguan': return z >= 19
    if zone == 'wenzhou': return abs(z) > 4.3
    if zone == 'xinsheng': return -16.5 <= x <= -13.0
    return None


NEARRACK_JS = """(()=>{ const E=GAME.E, G=GAME.G, s=G.bike||{}, D=BIKE.PARKS[G.zone]||{}; const a=[];
  for(const r of D.racks||[]) a.push({k:'rack',x:r[0],z:r[1]}); for(const r of D.spots||[]) a.push({k:'spot',x:r[0],z:r[1]}); for(const r of D.rows||[]) a.push({k:'row',x:(r[0]+r[1])/2,z:r[2],x0:r[0],x1:r[1]});
  for(const q of a) q.d=+(q.x0!=null?Math.hypot(Math.max(q.x0-s.x,0,s.x-q.x1),q.z-s.z):Math.hypot(q.x-s.x,q.z-s.z)).toFixed(2); a.sort((p,q)=>p.d-q.d);
  const sp=BIKE.parkSpots(E,G.zone).find(q=>Math.hypot(q.x-s.x,q.z-s.z)<0.01);
  return {nearest:a[0]||null, inSpot:sp?sp.src:null, bike:[+(+s.x).toFixed(2),+(+s.z).toFixed(2)]}; })()"""
GG_DOORS = [-63, -52.8, -36.4, -29.4, -10.6, -0.3, 7.93, 53.97, 70.94]   # zones3d.js 公館騎樓前機車的 DOORS（c7fde4f3e）
FARSIDE_JS = """(([bx,bz])=>{ const E=GAME.E; const ds=E.interactables.filter(i=>i.exit&&!i.bike).sort((a,b)=>Math.hypot(a.x-bx,a.z-bz)-Math.hypot(b.x-bx,b.z-bz)); const d=ds[0];
  const cand=[]; for(let k=0;k<12;k++){ const a=k/12*Math.PI*2; for(const r of [0.7,0.95]){ const x=bx+Math.sin(a)*r, z=bz+Math.cos(a)*r; if(!E.canStand(x,z,0.3,0)) continue; cand.push({x:+x.toFixed(2),z:+z.toFixed(2),dd:d?Math.hypot(d.x-x,d.z-z)-(d.radius||1.5):99}); } }
  cand.sort((a,b)=>b.dd-a.dd); return cand.slice(0,4); })(%s)"""


async def converse(pg, cdp, tag, plan=None, max_s=180):
    """逐句印對話（transcript）、點到底；選單照 plan 的順序挑（字開頭），plan 用完或對不上：選「不用了／再看看」或最後一個。回傳 (台詞清單, 選單清單, 對不上的選單)"""
    plan = list(plan or []); lines = []; menus = []; odd = []; last = None; t0 = time.time(); idle = None
    while time.time() - t0 < max_s:
        s = await pg.evaluate(ST)
        if s['choices']:
            menus.append(s['choices']); k = None
            if plan:
                k = next((i for i, c in enumerate(s['choices']) if c.startswith(plan[0])), None)
                if k is not None: plan.pop(0)
            if k is None:
                odd.append(s['choices']); k = next((i for i, c in enumerate(s['choices']) if c.startswith(('不用了', '再看看'))), len(s['choices']) - 1)
            print('  [%s] 選單 %s → %s' % (tag, J(s['choices']), s['choices'][k]), flush=True)
            await L.tap(pg, cdp, '#choices button:nth-child(%d)' % (k + 1)); await pg.wait_for_timeout(900); idle = None; last = None; continue
        if s['dlg']:
            if (s['name'], s['text']) != last:
                last = (s['name'], s['text']); lines.append(((s['name'] + '：') if s['name'] else '') + s['text'])
                print('  [%s] %s：%s' % (tag, s['name'] or '（旁白）', s['text']), flush=True)
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700); idle = None; continue
        if s['depth'] == 0 and not s['busy']:
            if idle is None: idle = time.time()
            if time.time() - idle > 2.5: break
        await pg.wait_for_timeout(500)
    if plan: print('  [%s] 選單計畫沒用完：%s' % (tag, J(plan)), flush=True)
    return lines, menus, odd


def has(lines, t):
    return any(t in x for x in lines)


async def stuck_check(pg, cdp, tag, fb0, e0, errs):
    """卡住檢查：對話框關掉、busyDepth 0、搖桿推得動 ≥ 0.3 m（前、後、右、左都試，前面是牆不算卡住）、walkFallbacks 沒增加、沒有新的 JS 例外"""
    await converse(pg, cdp, tag, None, 15)
    moved = 0.0
    for dx, dy in ((0, -60), (0, 60), (60, 0), (-60, 0)):
        moved, _, _ = await L.push_until(pg, cdp, dx, dy, 0.3, max_pushes=2, ms=1500)
        if moved >= 0.3: break
    s = await pg.evaluate(ST); new = errs[e0:]
    ok = (not s['dlg'] and not s['choices'] and s['depth'] == 0 and moved >= 0.3 and s['fb'] == fb0 and not new)
    check('[%s] 卡住檢查（對話關、busyDepth 0、搖桿 ≥0.3 m、walkFallbacks 沒增加、沒有 JS 例外）' % tag, ok,
          J({'zone': s['zone'], 'dlg': s['dlg'], 'depth': s['depth'], 'moved': round(moved, 2), 'fb': [fb0, s['fb']], 'errs': new[:2]}))
    if not ok: await pg.screenshot(path=os.path.join(OUT, 'STUCK_%s.png' % tag))
    return ok


async def wait_js(pg, js, secs):
    t0 = time.time()
    while time.time() - t0 < secs:
        if await pg.evaluate(js): return True
        await pg.wait_for_timeout(800)
    return False


async def walk_tap(pg, cdp, tag, q, label_prefix, near=None):
    """走到互動點 → 互動按鈕要是 label_prefix → 按下去。回傳互動點（dict）或 None"""
    it = await pg.evaluate(FIND_JS % J(q))
    if not check('[%s] 有「%s」互動點' % (tag, label_prefix), bool(it), J(it)): return None
    await L.go_to(pg, cdp, Run(), it['x'], it['z'], near if near is not None else max(0.4, it['r'] * 0.7), it['label'], max_s=600, lv=it['lv'])
    await pg.wait_for_timeout(1000); s = await pg.evaluate(ST)
    if not check('[%s] 走到旁邊：互動按鈕是「%s…」' % (tag, label_prefix), s['interact'].startswith(label_prefix), J({k: s[k] for k in ('x', 'z', 'interact')})):
        await pg.screenshot(path=os.path.join(OUT, 'NOBTN_%s.png' % tag)); return None
    await L.tap(pg, cdp, '#interact'); return it


async def enter_via(pg, cdp, tag, q, label_prefix, want_zone, near=None):
    z0 = (await pg.evaluate(ST))['zone']
    it = await walk_tap(pg, cdp, tag, q, label_prefix, near)
    if not it: return False
    ok = await wait_js(pg, "GAME.G.zone===%s&&!GAME.E.player.busy" % J(want_zone), 60); await pg.wait_for_timeout(2500)
    s = await pg.evaluate(ST)
    check('[%s] 按「%s」：%s → %s' % (tag, it['label'], z0, want_zone), ok and s['zone'] == want_zone, J({k: s[k] for k in ('zone', 'x', 'z', 'toast')}))
    return ok


async def load_door(pg, cdp, money, tag):
    print('  [前置／捷徑] 讀檔：公館慢輪單車門口南邊 (−0.3, 14)、2025-09-23（二）15:00、money %d、條件事件關閉（%s）' % (money, tag), flush=True)
    await L.load_state(pg, {'zone': 'gongguan', 'hour': 15.0, 'day': DAY, 'weekday': WD, 'weather': 'clear', 'flags': FLAGS, 'money': money, 'pos': {'x': -0.3, 'z': 14.0, 'yaw': math.pi, 'lv': 0}}, quiet_events=True)
    await pg.wait_for_timeout(7000); await L.close_panels(pg, cdp)


async def go_in_shop(pg, cdp, tag, errs):
    fb0 = (await pg.evaluate(ST))['fb']; e0 = len(errs)
    ok = await enter_via(pg, cdp, tag, {'label': '進入慢輪單車'}, '進入慢輪單車', 'bikeshop', near=1.2)
    await pg.wait_for_timeout(2000); await pg.screenshot(path=os.path.join(OUT, '%s_inside.png' % tag))
    if ok:
        s = await pg.evaluate(ST)
        check('[%s] 一進門的按鈕不是「離開慢輪單車」' % tag, not s['interact'].startswith('離開'), s['interact'])
        await stuck_check(pg, cdp, tag + '_inside', fb0, e0, errs)
    return ok


async def talk_owner(pg, cdp, tag, plan):
    if not await walk_tap(pg, cdp, tag, {'label': '找車行老闆'}, '找車行老闆'): return [], [], []
    return await converse(pg, cdp, tag, plan)


async def park_check(pg, cdp, tag, errs, zone, rule_on=True):
    """出建築以後：車停的位置合法（bike_shop_park_unit.js 的規則）、站上去不會卡住、走到車旁邊上車"""
    await wait_js(pg, "!!GAME.E.zone.group.children.find(o=>o.name==='bike_ride')", 30)
    k = await pg.evaluate(BK); c = await pg.evaluate(PCHK)
    print('  [%s] 車：%s' % (tag, J(c)), flush=True)
    check('[%s] 車在這一區（%s）、場景裡看得到停著的車' % (tag, zone), c['zone'] == zone and bool(k['parked']), J({'bike': c['zone'], 'parked': k['parked']}))
    rule = (c['inSpot'] is not None and c['legal'] is not None and abs(c['legal']['x'] - c['x']) < 0.01 and abs(c['legal']['z'] - c['z']) < 0.01 and c['legal']['d'] <= c['maxd']) or \
           (c['inSpot'] is None and (c['legal'] is None or c['legal']['d'] > c['maxd']))
    if rule_on: check('[%s] 停在最近的合法停車處（≤ %s m；都太遠才停門旁）' % (tag, c['maxd']), rule, J({'inSpot': c['inSpot'], 'legal': c['legal'], 'at': [round(c['x'], 2), round(c['z'], 2)]}))
    else: print('INFO [%s] 沒有進建築（沒有自動停車）：車留在按下車的地方 %s；最近的合法停車處 %s' % (tag, J([round(c['x'], 2), round(c['z'], 2)]), J(c['legal'])), flush=True)
    check('[%s] 停車位置站得住、不擋出入口（BIKE.parkOK）' % tag, c['ok'], J(c['doors']))
    arc = arcade(zone, c['x'], c['z'])
    if arc is None: print('INFO [%s] %s 沒有騎樓的判斷（車在 %s）' % (tag, zone, J([round(c['x'], 2), round(c['z'], 2)])), flush=True)
    else: check('[%s] 車不在騎樓（%s）' % (tag, ARCADE_RULE[zone]), not arc, J([round(c['x'], 2), round(c['z'], 2)]))
    nr = await pg.evaluate(NEARRACK_JS)
    print('INFO [%s] 最近的停車架／停車位：%s' % (tag, J(nr)), flush=True)
    dh = await pg.evaluate(DOORHIT_JS % J([OUTDOOR, GG_DOORS]))
    check('[%s] 停好的車身不和任何店門交疊（門 1.2 m 寬%s）' % (tag, '，含公館 DOORS 門前通道' if zone == 'gongguan' else ''), bool(dh) and dh['nDoors'] > 0 and not dh['hit'], J(dh))
    await pg.screenshot(path=os.path.join(OUT, '%s_parked.png' % tag))
    if not k['parked']: return False
    bx, bz = k['parked']
    fb0 = (await pg.evaluate(ST))['fb']; e0 = len(errs)
    await L.go_to(pg, cdp, Run(), bx, bz, 0.45, '車停的地方（站上去）')
    await stuck_check(pg, cdp, tag + '_on_bike_spot', fb0, e0, errs)
    for cand in await pg.evaluate(FARSIDE_JS % J([bx, bz])):
        await L.go_to(pg, cdp, Run(), cand['x'], cand['z'], 0.3, '車旁邊（離門遠的那一邊）')
        await pg.wait_for_timeout(900)
        if (await pg.evaluate(ST))['interact'].startswith('騎腳踏車'): break
    s = await pg.evaluate(ST)
    if not check('[%s] 車旁邊出現「騎腳踏車」' % tag, s['interact'].startswith('騎腳踏車'), s['interact']): return False
    await L.tap(pg, cdp, '#interact')
    ok = await wait_js(pg, "!!GAME.E.player.riding", 30)
    return check('[%s] 上車' % tag, ok)


async def ride_exit(pg, cdp, tag, to):
    """騎到往 to 的出口、按下去"""
    it = await pg.evaluate(FIND_JS % J({'exitTo': to}))
    if not check('[%s] 有往 %s 的出口' % (tag, to), bool(it), J(it)): return False
    return await enter_via(pg, cdp, tag, {'exitTo': to}, it['label'], to, near=min(2.2, max(0.6, it['r'] - 0.4)))


async def in_and_out(pg, cdp, tag, errs, zone, prefer=None):
    """騎到這一區最近的一棟可以進去的建築 → 進去（車停門旁）→ 卡住檢查 → 走出來 → 停車檢查 → 上車"""
    b = await pg.evaluate(BLDG_JS % J([OUTDOOR, prefer]))
    if not check('[%s] %s 有一棟可以進去的建築' % (tag, zone), bool(b), J(b)): return False
    print('  [%s] 進 %s（%s）' % (tag, b['label'], b['to']), flush=True)
    if not await enter_via(pg, cdp, tag + '_in', {'exitTo': b['to']}, b['label'], b['to'], near=min(1.8, max(0.5, b['r'] * 0.7))): return False
    k = await pg.evaluate(BK)
    check('[%s] 騎著進門：先下車（室內沒有車）' % tag, not k['riding'], J(k))
    fb0 = (await pg.evaluate(ST))['fb']; e0 = len(errs)
    await pg.screenshot(path=os.path.join(OUT, '%s_inside.png' % tag))
    await stuck_check(pg, cdp, tag + '_inside', fb0, e0, errs)
    if not await enter_via(pg, cdp, tag + '_out', {'exitTo': zone}, '', zone, near=None): return False
    return await park_check(pg, cdp, tag, errs, zone)


# ---------- R 騎車實走（555b9e0cb 停車架）----------
R_EXITS = [   # 出口 id, 外面那一區, 門口互動點（555b9e0cb）, 按鈕字開頭, 怎麼停（ride＝騎著按門、dismount＝門口按下車）, 下車的地方, 選單, 進去的區域
    ('gym', 'campus', (74.0, 59.4), '體育館', 'dismount', (74.0, 57.4), ['進館裡逛逛'], 'gym'),
    ('library', 'campus', (86.4, 0.0), '進入總圖書館', 'ride', None, [], 'library_hall'),
    ('wancai', 'campus', (90.68, -83.65), '進入法律系館B', 'ride', None, [], 'wancai'),
    ('boya', 'campus', (-38.0, -72.8), '博思教學館', 'ride', None, ['進館裡逛逛'], 'boya'),
    ('xinsheng', 'xinsheng', (-15.6, 10.2), '', 'dismount', (-11.6, 10.2), [], None),
    ('wenzhou', 'wenzhou', (-8.0, 4.6), '進去阿德影印輸出', 'ride', None, [], 'wz_print')]
FINDAT_JS = """(([x,z])=>{ const its=GAME.E.interactables.filter(i=>!i.hidden&&!i.bike&&Math.hypot(i.x-x,i.z-z)<0.3); const it=its[0];
  return it?{x:+it.x.toFixed(2),z:+it.z.toFixed(2),r:it.radius||1.5,label:it.label,to:it.exit?it.exit.to:null,look:!!it.look,lv:it.lv|0}:null; })(%s)"""
CSPOTS_JS = """(z=>BIKE.parkSpots(GAME.E,z).map(q=>({x:+q.x.toFixed(2),z:+q.z.toFixed(2),yaw:q.yaw||0,src:q.src})))(%s)"""
SAME_JS = """(()=>{ const s=GAME.G.bike||{}, pk=GAME.E.zone.group.children.find(o=>o.name==='bike_ride'); return {zone:s.zone, x:s.x, z:s.z, pk:pk?[pk.position.x,pk.position.z]:null}; })()"""


async def r_mount_near(pg, cdp, tag):
    k = await pg.evaluate(BK)
    if not k['parked']: return check('[%s] 場景裡有停著的車' % tag, False, J(k))
    for cand in await pg.evaluate(FARSIDE_JS % J(k['parked'])):
        await L.go_to(pg, cdp, Run(), cand['x'], cand['z'], 0.3, '車旁邊')
        await pg.wait_for_timeout(900)
        if (await pg.evaluate(ST))['interact'].startswith('騎腳踏車'): break
    s = await pg.evaluate(ST)
    if not check('[%s] 車旁邊出現「騎腳踏車」' % tag, s['interact'].startswith('騎腳踏車'), s['interact']): return False
    await L.tap(pg, cdp, '#interact')
    return check('[%s] 上車' % tag, await wait_js(pg, "!!GAME.E.player.riding", 30))


async def r_one(pg, cdp, errs, ex):
    eid, outz, door, lb, how, dpos, plan, inz = ex; tag = 'R_' + eid
    print('== R %s（%s，門口 %s，%s）' % (eid, outz, J(door), '騎著按門' if how == 'ride' else '門口按下車'), flush=True)
    fb0 = (await pg.evaluate(ST))['fb']; e0 = len(errs)
    it = await pg.evaluate(FINDAT_JS % J(list(door)))
    if not check('[%s] 門口互動點在 %s（555b9e0cb）' % (tag, J(door)), bool(it), J(it)): return False
    lb = lb or it['label']
    # 1 騎到門口、2 停好
    if how == 'dismount':
        await L.go_to(pg, cdp, Run(), dpos[0], dpos[1], 0.8, '%s 門口（騎車）' % eid, max_s=600)
        k = await pg.evaluate(BK)
        check('[%s] 騎到門口（還在騎）' % tag, k['riding'], J(k))
        await L.tap(pg, cdp, '#btnBike'); await pg.wait_for_timeout(2000)
        k = await pg.evaluate(BK); path = '門口按「下車」→ 停在下車的地方 %s' % J(k['parked'])
        check('[%s] 按「下車」：車停在門口' % tag, not k['riding'] and bool(k['parked']), J(k))
        await L.turn_camera_to(pg, cdp, door[0], door[1]); await pg.wait_for_timeout(1500)
        await pg.screenshot(path=os.path.join(OUT, 'park_%s_door.png' % eid))
        await L.go_to(pg, cdp, Run(), it['x'], it['z'], max(0.4, min(1.0, it['r'] * 0.6)), it['label'])
    else:
        await L.go_to(pg, cdp, Run(), it['x'], it['z'], max(0.5, min(1.2, it['r'] * 0.6)), '%s 門口（騎車）' % eid, max_s=600)
        k = await pg.evaluate(BK)
        check('[%s] 騎到門口（還在騎）' % tag, k['riding'], J(k))
        await L.turn_camera_to(pg, cdp, door[0], door[1]); await pg.wait_for_timeout(1200)
        await pg.screenshot(path=os.path.join(OUT, 'park_%s_door.png' % eid))
        path = '騎著按門'
    await pg.wait_for_timeout(800); s = await pg.evaluate(ST)
    if not check('[%s] 門口的按鈕是「%s…」' % (tag, lb), s['interact'].startswith(lb), J({k2: s[k2] for k2 in ('x', 'z', 'interact')})): return False
    await L.tap(pg, cdp, '#interact')
    # 4 進去再出來（新生南路的店沒有室內：只能看）
    entered = False
    if inz:
        t0 = time.time()
        while time.time() - t0 < 60:
            s = await pg.evaluate(ST)
            if s['zone'] == inz and not s['busy']: break
            if s['choices'] or s['dlg']: await converse(pg, cdp, tag + '_door', plan, 60)
            await pg.wait_for_timeout(700)
        await pg.wait_for_timeout(2000); s = await pg.evaluate(ST)
        entered = check('[%s] 進去（%s）' % (tag, inz), s['zone'] == inz, J({k2: s[k2] for k2 in ('zone', 'x', 'z', 'toast')}))
        if entered:
            k = await pg.evaluate(BK); bi = k['bike'] or {}
            path += '；進門時車停在 %s' % J([round(bi.get('x') or 0, 2), round(bi.get('z') or 0, 2)])
            check('[%s] 在裡面：先下車、G.bike.zone 還是 %s' % (tag, outz), not k['riding'] and bi.get('zone') == outz, J(bi))
            await stuck_check(pg, cdp, tag + '_inside', fb0, e0, errs)
            if not await enter_via(pg, cdp, tag + '_out', {'exitTo': outz}, '', outz): return False
    else:
        lines, menus, odd = await converse(pg, cdp, tag + '_look', None, 60)
        obs = '這間沒有室內（「看」）：%s' % J(lines[:2])
        print('INFO [%s] %s；進去再出來做不到' % (tag, obs), flush=True)
        await stuck_check(pg, cdp, tag + '_look', fb0, e0, errs)
    # 5 檢查
    await wait_js(pg, "!!GAME.E.zone.group.children.find(o=>o.name==='bike_ride')", 30)
    a = await pg.evaluate(SAME_JS); await pg.wait_for_timeout(3000); b2 = await pg.evaluate(SAME_JS)
    path += '；%s以後車在 %s' % ('出來' if entered else '看完', J([round(a['x'] or 0, 2), round(a['z'] or 0, 2)]))
    print('INFO [%s] 實際的停車路徑：%s' % (tag, path), flush=True)
    check('[%s] ① 車還在：G.bike 在 %s、場景裡停著的車就在 G.bike 的位置、3 秒後沒動' % (tag, outz),
          a['zone'] == outz and bool(a['pk']) and math.hypot(a['pk'][0] - a['x'], a['pk'][1] - a['z']) <= 0.05 and b2['x'] == a['x'] and b2['z'] == a['z'] and bool(b2['pk']), J({'a': a, 'b': b2}))
    nr = await pg.evaluate(NEARRACK_JS)
    if a['pk']:
        n = nr.get('nearest') or {}
        mx, mz = ((a['pk'][0] + n['x']) / 2, (a['pk'][1] + n['z']) / 2) if n else (a['pk'][0], a['pk'][1])
        await L.turn_camera_to(pg, cdp, mx, mz); await pg.wait_for_timeout(2000)
    await pg.screenshot(path=os.path.join(OUT, 'park_%s.png' % eid)); print('  [%s] 截圖 park_%s.png（車＋最近的停車處 %s）' % (tag, eid, J(nr.get('nearest'))), flush=True)
    ok = await park_check(pg, cdp, tag, errs, outz, rule_on=entered)
    fb0 = (await pg.evaluate(ST))['fb']; e0 = len(errs)
    await stuck_check(pg, cdp, tag + '_end', fb0, e0, errs)
    if ok and not (await pg.evaluate(BK))['riding']: ok = await r_mount_near(pg, cdp, tag + '_remount')
    return ok


async def case_r(pg, cdp, errs):
    print('== R 騎車實走（555b9e0cb 停車架）', flush=True)
    fl = dict(FLAGS, BIKE_PARK_TIP=True)
    print('  [前置／捷徑] 讀檔：校園體育館南邊 (74, 50)、2025-09-23（二）10:00、條件事件關閉（先算停車位）', flush=True)
    await L.load_state(pg, {'zone': 'campus', 'hour': 10.0, 'day': 7, 'weekday': 2, 'weather': 'clear', 'flags': fl, 'money': 3000, 'pos': {'x': 74, 'z': 50, 'yaw': 0, 'lv': 0}}, quiet_events=True)
    await pg.wait_for_timeout(6000)
    sp = await pg.evaluate(CSPOTS_JS % J('campus'))
    sp = sorted(sp, key=lambda q: math.hypot(q['x'] - 74, q['z'] - 50))
    if not check('R 前置：校園有合法停車處', bool(sp), J(sp[:3])): return
    q = sp[0]; bike = {'zone': 'campus', 'x': q['x'], 'z': q['z'], 'yaw': q['yaw'], 'riding': False, 'kind': 'city', 'color': None, 'owned': [{'kind': 'city', 'color': None}]}
    print('  [前置／捷徑] 讀檔：同一個地方、車停在校園最近的合法停車處 %s（%s）' % (J([q['x'], q['z']]), q['src']), flush=True)
    await L.load_state(pg, {'zone': 'campus', 'hour': 10.0, 'day': 7, 'weekday': 2, 'weather': 'clear', 'flags': fl, 'money': 3000, 'bike': bike, 'pos': {'x': 74, 'z': 50, 'yaw': 0, 'lv': 0}}, quiet_events=True)
    await pg.wait_for_timeout(6000); await L.close_panels(pg, cdp)
    await wait_js(pg, "!!GAME.E.zone.group.children.find(o=>o.name==='bike_ride')", 60)
    if not await r_mount_near(pg, cdp, 'R_start'): return
    cur = 'campus'
    for ex in R_EXITS:
        if ex[0] not in EXITS: continue
        if ex[1] != cur:
            k = await pg.evaluate(BK)
            if not k['riding'] and not await r_mount_near(pg, cdp, 'R_to_' + ex[1]): return
            if not await ride_exit(pg, cdp, 'R_to_' + ex[1], ex[1]): return
            cur = ex[1]
            k = await pg.evaluate(BK); check('R 騎到%s：還在騎' % cur, k['riding'], J(k))
        k = await pg.evaluate(BK)
        if not k['riding'] and not await r_mount_near(pg, cdp, 'R_pre_' + ex[0]): return
        if not await r_one(pg, cdp, errs, ex): check('R %s 沒跑完，後面的出口不測' % ex[0], False); return


async def main():
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); check('遊戲載入', await L.wait_loaded(pg))
        await pg.evaluate("localStorage.clear(); if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}")
        if 'P' in CASES:
            print('== P 錢不夠', flush=True)
            await load_door(pg, cdp, 50, 'P')
            if await go_in_shop(pg, cdp, 'P1', errs):
                fb0 = (await pg.evaluate(ST))['fb']; e0 = len(errs); m0 = (await pg.evaluate(ST))['money']; n0 = len(((await pg.evaluate(BK))['bike'] or {}).get('owned') or [])
                if await walk_tap(pg, cdp, 'P2', {'look': 'lady'}, '看這台車'):
                    lines, menus, odd = await converse(pg, cdp, 'P2', ['買這台'])
                    s = await pg.evaluate(ST); k = await pg.evaluate(BK)
                    check('P2 錢不夠買淑女車：款式說明、老闆「%s」、不扣錢、沒有多一台' % LN['poor'], has(lines, LN['ladyDesc']) and has(lines, LN['poor']) and s['money'] == m0 and len(((k['bike'] or {}).get('owned') or [])) <= max(n0, 1),
                          J({'money': [m0, s['money']], 'lines': lines[-3:]}))
                    await pg.screenshot(path=os.path.join(OUT, 'P2_after.png'))
                lines, menus, odd = await talk_owner(pg, cdp, 'P3', ['補胎'])
                s = await pg.evaluate(ST)
                check('P3 補胎錢不夠：老闆「%s」、不扣錢、沒有過 15 分鐘那一段' % LN['fixPoor'], has(lines, LN['fixPoor']) and s['money'] == m0 and not has(lines, LN['fix']), J({'money': [m0, s['money']], 'lines': lines[-3:]}))
                await stuck_check(pg, cdp, 'P_end', fb0, e0, errs)
        if 'M' in CASES:
            print('== M 錢夠', flush=True)
            await load_door(pg, cdp, 30000, 'M')
            if not await go_in_shop(pg, cdp, 'M1', errs):
                check('M 進不了店，後面不測', False)
            else:
                fb0 = (await pg.evaluate(ST))['fb']; e0 = len(errs)
                # M1b 室內 v1b：REPAIR_BIKE 預設藏、修車架旁邊走得過去
                await wait_js(pg, "!!(GAME.E.zone&&GAME.E.zone.formal)", 60)
                r = await pg.evaluate(REPAIR_JS)
                check('M1b 慢輪單車室內正式模型接上（zone.formal）', bool(r) and r['formal'], J(r))
                check('M1b 修車架上的車（REPAIR_BIKE*）是藏的（visible＝false）', bool(r) and bool(r['nodes']) and all(not q['v'] for q in r['nodes']), J(r and r['nodes']))
                for tx, tz, nm in ((2.0, -4.85, '修車架後面、工作台前的走道'), (0.65, -4.0, '左邊修車架和鐵架之間的縫')):
                    ok = await L.go_to(pg, cdp, Run(), tx, tz, 0.5, nm, max_s=300)
                    s = await pg.evaluate(ST)
                    check('M1b 修車架旁邊走得過去：走到%s (%.2f,%.2f)' % (nm, tx, tz), ok and math.hypot(s['x'] - tx, s['z'] - tz) <= 0.7, J({k: s[k] for k in ('x', 'z')}))
                await pg.screenshot(path=os.path.join(OUT, 'M1b_repair_area.png'))
                await stuck_check(pg, cdp, 'M1b_repair_area', fb0, e0, errs)
                # M1c 修車架上的車打開時擋住、收起來還原（c7fde4f3e）
                print('  [前置／捷徑] 直接呼叫遊戲的 BIKESHOP.repairBike(true)（調座墊、補胎那一幕用的同一個入口）', flush=True)
                ro = await pg.evaluate(REPNAV_JS % J('open'))
                await pg.wait_for_timeout(1200); await pg.screenshot(path=os.path.join(OUT, 'M1c_repair_bike_shown.png'))
                check('M1c 打開：REPAIR_BIKE 看得到、blockWhenShown 那一塊導航格全部擋住（nav.free＝false，走不進去）', 'err' not in ro and ro['visible'] is True and ro['freeNow'] == 0, J(ro))
                rc = await pg.evaluate(REPNAV_JS % J('close'))
                check('M1c 收起來：REPAIR_BIKE 藏回去、那一塊回到打開前（原本 free 的格子都 free）', 'err' not in rc and rc['visible'] is False and rc['lost'] == 0 and rc['freeNow'] == rc['freeBefore'] and rc['freeBefore'] > 0, J(rc))
                if rc.get('target'):
                    tx, tz = rc['target']
                    ok = await L.go_to(pg, cdp, Run(), tx, tz, 0.4, '修車架上的車原本佔的地方 (%.2f,%.2f)' % (tx, tz), max_s=300)
                    s = await pg.evaluate(ST)
                    check('M1c 收起來以後真的走得進那一塊（%.2f,%.2f）' % (tx, tz), ok and math.hypot(s['x'] - tx, s['z'] - tz) <= 0.6, J({k: s[k] for k in ('x', 'z')}))
                else:
                    check('M1c 收起來以後那一塊有站得住的點', False, J(rc))
                await stuck_check(pg, cdp, 'M1c_after', fb0, e0, errs)
                # M2 買車
                if await walk_tap(pg, cdp, 'M2', {'look': 'lady'}, '看這台車'):
                    s0 = await pg.evaluate(ST)
                    lines, menus, odd = await converse(pg, cdp, 'M2', ['買這台', '奶油白'])
                    s = await pg.evaluate(ST); k = await pg.evaluate(BK); bk = k['bike'] or {}
                    check('M2 買淑女車（奶油白）：扣 4,200', s['money'] == s0['money'] - 4200, J([s0['money'], s['money']]))
                    check('M2 現在騎的＝淑女車奶油白、買過的車 2 台', bk.get('kind') == 'lady' and bk.get('color') == LADY_WHITE and len(bk.get('owned') or []) == 2, J(bk))
                    check('M2 調座墊：時間 +10 分（10/60 h）', 10 / 60 - 0.005 <= s['hour'] - s0['hour'] < 10 / 60 + 0.12, '%.3f h' % (s['hour'] - s0['hour']))
                    check('M2 台詞：款式說明、老闆一句、調座墊、旁白、「騎看看。」', all(has(lines, LN[x]) for x in ('ladyDesc', 'ladyLine', 'fit', 'fitDone', 'try')), J(lines))
                    await pg.screenshot(path=os.path.join(OUT, 'M2_bought.png'))
                # M3 換車（換成城市通勤車、再換回來）
                for want, kind in (('城市通勤車', 'city'), ('淑女車', 'lady')):
                    lines, menus, odd = await talk_owner(pg, cdp, 'M3_' + kind, ['換一台騎', want])
                    k = await pg.evaluate(BK); bk = k['bike'] or {}
                    check('M3 換成%s：「%s」、AA_651 兩句（%s／%s）' % (want, LN['which'], LN['swapDone'], LN['swapNarr']), bk.get('kind') == kind and has(lines, LN['which']) and has(lines, LN['swapDone']) and has(lines, LN['swapNarr']),
                          J({'kind': bk.get('kind'), 'color': bk.get('color'), 'lines': lines[-4:]}))
                # M4 補胎
                s0 = await pg.evaluate(ST)
                lines, menus, odd = await talk_owner(pg, cdp, 'M4', ['補胎'])
                s = await pg.evaluate(ST)
                check('M4 補胎：扣 100', s['money'] == s0['money'] - 100, J([s0['money'], s['money']]))
                check('M4 補胎：時間過 15 分鐘', 0.25 - 0.005 <= s['hour'] - s0['hour'] < 0.25 + 0.15, '%.3f h（含走到老闆旁邊）' % (s['hour'] - s0['hour']))
                check('M4 補胎台詞：老闆兩句＋旁白（AA_651）', has(lines, LN['fix']) and has(lines, LN['fixNarr']) and has(lines, LN['fixDone']), J(lines[-4:]))
                # M5 車燈
                s0 = await pg.evaluate(ST)
                if await walk_tap(pg, cdp, 'M5', {'label': '車燈'}, '車燈'):
                    lines, menus, odd = await converse(pg, cdp, 'M5', ['車燈'])
                    s = await pg.evaluate(ST); bk = (await pg.evaluate(BK))['bike'] or {}
                    check('M5 買車燈：扣 350、記在 G.bike.parts.light', s['money'] == s0['money'] - 350 and bool((bk.get('parts') or {}).get('light')), J({'money': [s0['money'], s['money']], 'parts': bk.get('parts')}))
                    check('M5 車燈台詞：旁白＋老闆「%s」' % LN['light2'], has(lines, LN['light1']) and has(lines, LN['light2']), J(lines))
                # M6 再點一次
                s0 = await pg.evaluate(ST)
                if await walk_tap(pg, cdp, 'M6', {'label': '車燈'}, '車燈'):
                    lines, menus, odd = await converse(pg, cdp, 'M6', ['車燈'])
                    s = await pg.evaluate(ST)
                    lt = next((c for m in menus for c in m if c.startswith('車燈')), '')
                    check('M6 已經買過：選項寫「買過了」、老闆「%s」、不扣錢（不會再賣）' % LN['again'], '買過了' in lt and has(lines, LN['again']) and s['money'] == s0['money'] and not has(lines, LN['light1']), J({'opt': lt, 'money': [s0['money'], s['money']], 'lines': lines}))
                await stuck_check(pg, cdp, 'M6_end', fb0, e0, errs)
                # M7 出店
                ok = await enter_via(pg, cdp, 'M7', {'label': '離開慢輪單車'}, '離開慢輪單車', 'gongguan')
                pk = await pg.evaluate("typeof BIKESHOP!=='undefined'?BIKESHOP.PARK:null")
                c = await pg.evaluate(PCHK) if ok else {}
                if ok: check('M7 出店：車停在車行門口的停車位 %s' % J(pk), bool(pk) and abs(c['x'] - pk['x']) < 0.01 and abs(c['z'] - pk['z']) < 0.01 and c['zone'] == 'gongguan', J(c))
                riding = ok and await park_check(pg, cdp, 'M7', errs, 'gongguan')
                await pg.screenshot(path=os.path.join(OUT, 'M7_riding.png'))
                # M8 騎車去三區
                cur = 'gongguan'
                route = []
                if 'wenzhou' in LEGS: route += [('wenzhou', 'wz_print')]
                if 'campus' in LEGS or 'lane118' in LEGS: route += [('campus', None)]
                if 'lane118' in LEGS: route += [('lane118', None)]
                for zone, prefer in route:
                    if not riding: check('M8 還沒騎上車，後面的 %s 不測' % zone, False); break
                    if zone == 'campus' and cur == 'wenzhou':
                        if not await ride_exit(pg, cdp, 'M8_wz_gg', 'gongguan'): break
                        cur = 'gongguan'
                    if not await ride_exit(pg, cdp, 'M8_%s' % zone, zone): riding = False; break
                    k = await pg.evaluate(BK)
                    check('M8 騎到%s：還在騎' % zone, k['riding'], J(k))
                    cur = zone
                    if zone == 'campus' and 'campus' not in LEGS: continue
                    riding = await in_and_out(pg, cdp, 'M8_%s' % zone, errs, zone, prefer)
                # M9 存檔、重新整理、繼續
                if riding:
                    await L.tap(pg, cdp, '#btnBike'); await pg.wait_for_timeout(2000)
                await converse(pg, cdp, 'M9_pre', None, 10)
                saved = (await pg.evaluate(BK))['bike'] or {}; zs = (await pg.evaluate(ST))['zone']
                print('  [捷徑] 存檔：GAME.autosave()（和換區域時的自動存檔同一個）；存檔裡的車 %s' % J(saved), flush=True)
                await pg.evaluate("GAME.autosave()"); await pg.wait_for_timeout(1000)
                await pg.reload(); await L.wait_loaded(pg); await L.no_phone_auto(pg); await pg.wait_for_timeout(1500)
                check('M9 標題有「繼續」', await L.tap(pg, cdp, '#btnContinue'))
                await pg.wait_for_timeout(8000); await L.close_panels(pg, cdp)
                await wait_js(pg, "!!GAME.E.zone.group.children.find(o=>o.name==='bike_ride')", 60)
                k = await pg.evaluate(BK); nb = k['bike'] or {}
                check('M9 重新整理、繼續：車還在（同一區、同一個位置、場景裡有停著的車）', k['zone'] == zs and nb.get('zone') == saved.get('zone') and abs((nb.get('x') or 0) - (saved.get('x') or 0)) < 0.01 and abs((nb.get('z') or 0) - (saved.get('z') or 0)) < 0.01 and bool(k['parked']), J({'zone': k['zone'], 'bike': nb, 'parked': k['parked']}))
                check('M9 是買的那一台（淑女車奶油白）、車燈還在', nb.get('kind') == 'lady' and nb.get('color') == LADY_WHITE and bool((nb.get('parts') or {}).get('light')), J(nb))
                await pg.screenshot(path=os.path.join(OUT, 'M9_after_reload.png'))
                fb0 = (await pg.evaluate(ST))['fb']; e0 = len(errs)
                await stuck_check(pg, cdp, 'M9_after_reload', fb0, e0, errs)
        if 'R' in CASES:
            try: await case_r(pg, cdp, errs)
            except Exception as e: check('R 探針本身沒有例外', False, repr(e)[:300])
        check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS[:10])), flush=True)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
