"""CC-C（帳號 C）11-04：SITAMB 探針——坐著的 NPC 會動（NPC-AMBIENT-ANIM-1104，2acb34afd 合併；X222）。
  期望值、地點、判準的出處：BB-C 14:41 SITAMB 規格（CC-C 轉來）。**探針只錄影、只記錄，不判 PASS／FAIL**（穿模、同步、效能都歸 BB 判）；
  下面的 PASS／FAIL 只是「流程有沒有走通」（讀到地點、找到坐著的人、sitAmbFidget 叫得動、圖存得出來、沒有 JS 例外）。
  **Windows＋GPU（Playwright 有視窗）≠ iPhone**：使用者電腦的顯示卡跑；雲端 SwiftShader 只驗流程，數字不採信（CC_50 第 15 條）。

  讀過的實作（src/character3d.js 587～770 行，48b4c898）：
    - 狀態在 obj.userData.amb（m）：m.fx＝正在做的小動作（m.fx.kind、m.fx.t、m.fx.dur），m.lastKind／m.n／m.kinds＝最後一個、第幾個、各做過幾次，
      m.next＝離下一個還有幾秒（第一個 3～18 秒、之後每 8～25 秒，做完一個才開始算），m.chatRole＝同桌聊天 talk／nod，m.ov／m.ow＝疊加片段（look、hair、talk、nod）和權重。
    - u.ambOn＝這一格坐姿循環有在跑（片段沒載到、?nositamb＝false＝舊的靜態坐姿）。
    - CHAR.sitAmbFidget(obj, kind)：kind＝look、side、up、glance、stretch、hair、posture、page；要 u.ambOn、VRM、坐著才有用；
      手上有東西（read、跪坐、腿上筆電）時 hair 會變 side；page 只有拿書（read＋書）才有翻頁的手；有同桌聊天的一組（u.sitChat）時下一格會被聊天蓋掉（page 例外）。
    - LAWWW-C 寫的 E3.npcs[i].obj 不對：遊戲裡是 GAME.E.npcs[i].obj（engine3d.js E.npcs）。
    - C.ambRand＝Math.random（載入時抓的）：cc_det.install 在 goto 之前換成固定種子 → 坐姿的亂數也固定。

  LOC（一次一個地點；每個佇列項目 ≤ 20 分鐘，CC_50 第 39 條）：
    cafe   兩點半（區域 cafe）15:00：撥頭髮、轉頭、翻頁、沙發（booth／lounge）換坐姿＋伸懶腰；兩點半沒有「兩個人一桌聊天」的組（SEATACT 的 chat 只排在 crowd3d 的店），
           聊天比劃、滑手機改在 afar café 15:00 錄（CAFE2=afar，可以改；CAFE2= 空＝不去）。
    lib    總圖大廳二樓自習區（library_hall 第 1 層）、3F 閱覽區（library）、法圖（lawlib）、社科圖（soclib），14:00：低頭看桌子、手放大腿、同一排同步。
           自然坐著的人很少（大廳二樓 3 人、各在不同桌）：【前置／捷徑】同一排補到 ROW_N 人（遊戲自己的 CHAR.build＋E.addNPC，和 story3d.js populate 同一種寫法）再量同步。
    tea    一盞茶屋（wz_teahouse）15:00：跪坐（u.sitFloor）的人身體動的時候手有沒有還在大腿上。
    eat    林家乾麵（wz_lin）12:15（EAT=noodle 改公館燒臘）。
    class  霖澤館 201（classroom，2025-09-24 刑總 09:10）、博思 101（boya，2025-09-23 國文 09:10）上課中：整排學生、階梯座位的腳。
    player 玩家自己坐下讀書（總圖二樓，【前置／捷徑】GAME.sitAt＋pose read，和 story3d.js 讀書時一樣）、和坐著的 NPC 說話（兩點半，按互動鍵「說話」）的鏡頭。
    fps    總圖二樓坐約 FILL（20）人：一般網址和 ?nositamb 各量 FPS_S（30）秒（平均、每一秒的最低、最慢一格、1% low）。
  CTL：0＝只跑一般網址、1＝只跑 ?nositamb（舊的靜態坐姿，對照組）、both（預設）＝同一支探針兩種都跑（一般 → ?nositamb，同一個鏡頭、同一個時間、同一份排程）。

  錄影（每段 SEG_S 秒，預設 12，REC_FPS 30）：
    【前置／捷徑】遊戲主迴圈暫停（E.paused），探針自己一格一格 E.update(1/30)＋E.render()（固定步長：GPU 快慢都是 30 fps 的遊戲時間、兩種網址同一個時間）；
    每一格 render 之後同一個 task 裡把 E.canvas drawImage 到 OffscreenCanvas（WebGL 沒開 preserveDrawingBuffer），縮成寬 DIFF_W（640）算和前一格的平均差；
    只留「差最多的 TOPN（10）格」＋每個小動作開始後 REP_T（0.5、1.5）秒的代表格，存原尺寸 JPEG（convertToBlob；使用者電腦沒有 PIL、numpy，全部在瀏覽器裡做）。
    【前置／捷徑】固定鏡頭（E.cinematic；避開牆、桌子擋住頭和胸口：raycast 挑角度）、手動叫 CHAR.sitAmbFidget（排程固定：每種動作照片段長度排開，不會互相打斷）、
    玩家藏起來（visible=false；NPC 不藏）、讀檔指定地點時間（條件事件關閉）。HUD 是 DOM，不在 canvas 上，不用藏。
  同步（lib、class）：SYNC_S（30）秒不叫 sitAmbFidget，記每個人自己開始的小動作（m.n 變了＝開始，m.lastKind＝哪一種）；
    同一排（同一層、同一個方向、同一條線上，或 seat.row 一樣）ROW_MIN（4）人以上：每 10 秒一窗，「和同一排另一個人在 ±0.5 秒內開始同一種」的比例（也給 ±1 秒）；
    坐姿循環的相位（m.t×片段長度）也記下來（BB 判同步；BB-C 14:41：同一排一起動的比例 > 50% 算 P3）。
  輸出：<out>/<mode>/*.jpg、<out>/sitamb_<LOC>.json（每段的排程、叫了什麼、實際開始了什麼、每一格的差、存了哪幾格、同步、FPS）。
  日子：DAY（預設 9＝2025-09-25 週四）、CAFE_DAY（預設 4＝2025-09-20 週六，兩點半有人坐卡座）；上課是課表上的 day 7、8。主線第一～三天（day 1～3）不用（劇情會換區域）。
用法：LW_TESTS=<wt>/tests LOC=cafe [CTL=both] [SEG_S=12] [KINDS=look,side,...] python3 cc_sitamb_probe.py <url> <out>
  雲端縮小版：VIEW=844x390 SEG_S=3 KINDS=look,hair REC_FPS=10 SYNC_S=6 FPS_S=6"""
import os, sys, json, asyncio, time, math, base64
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
E_ = os.environ.get
os.environ.setdefault('CC_SEED', '1104')   # BB-C 14:41：固定 CC_SEED（cc_det.py）；沒給就用 1104
LOC = (E_('LOC') or 'cafe').strip()
CTL = (E_('CTL') or 'both').strip()
SEG_S = float(E_('SEG_S') or 12)        # BB-C 14:41：每段 10～15 秒
SEG_MAX = float(E_('SEG_MAX') or 15)
REC_FPS = float(E_('REC_FPS') or 30)    # BB-C 14:41：30 fps 連拍
ALL_KINDS = ['look', 'side', 'hair', 'glance', 'stretch', 'page', 'posture', 'up']
KINDS = [k.strip() for k in (E_('KINDS') or ','.join(ALL_KINDS)).split(',') if k.strip()]
TOPN = int(E_('TOPN') or 10)            # BB-C 14:41：每段只交「和前一格差最多的 10 格」＋每種動作的代表格
REP_T = [float(x) for x in (E_('REP_T') or '0.5,1.5').split(',') if x.strip()]   # 代表格：開始後 0.5 秒（BB-C 14:41）；1.5 秒是 CC 加的（撥頭髮、伸懶腰最大的那一下）
DIFF_W = int(E_('DIFF_W') or 640)
JPEG_Q = float(E_('JPEG_Q') or 0.85)
SYNC_S = float(E_('SYNC_S') or 30)
SYNC_TOL = [0.5, 1.0]
ROW_MIN = int(E_('ROW_MIN') or 4)       # BB-C 14:41：同一排 4 人以上
ROW_N = int(E_('ROW_N') or 6)
FILL = int(E_('FILL') or 20)            # BB-C 14:41：總圖二樓坐大約 20 人
FPS_S = float(E_('FPS_S') or 30)        # BB-C 14:41：各量 30 秒
VIEW = E_('VIEW') or '1280x720'          # 錄影的視窗大小（FPS 照 playlib 的 844×390）
CAFE2 = E_('CAFE2', 'afar')
EAT = E_('EAT') or 'wz_lin'
DAY = int(E_('DAY') or 9)              # 2025-09-25（週四）。不要用 day 1～3：主線第一～三天（day 2＝9/18 民總劇情課，story3d.js:3764／1292／1328 會把人換到校園；雲端 r1 錄到一半變成校園）
CAFE_DAY = int(E_('CAFE_DAY') or 4)    # 2025-09-20（週六）：兩點半 14～18 點的兩位客人之一坐卡座（booth，S.cafeCustomers 照日期排；day 9 兩位都坐一般桌）
LIBZ = [z.strip() for z in (E_('LIBZ') or 'library_hall,library,lawlib,soclib').split(',') if z.strip()]
SEED = cc_det.seed()
FAILS = []
T0 = time.time()
# 片段長度（秒；雲端 SwiftShader 讀 CHAR._amb.raw.animations 量到的，048b4c898）：look＝Sitting_Idle02_Loop 2.5、hair＝Sitting_Idle03_Loop 4.167；
# 小動作的長度（character3d.js ambStart：side 最長 0.6＋1.6＋0.8＋1.2＋0.7、glance 最長 2.6＋0.9、up 最長 2.2＋1、stretch 2.6、posture 1.6、page 1.1；疊片段的 orate 最慢 0.85＋0.3）
CLIP = {'look': 2.5, 'hair': 4.167}
DUR = {'look': CLIP['look'] / 0.85 + 0.3, 'hair': CLIP['hair'] / 0.85 + 0.3, 'side': 4.9, 'glance': 3.5, 'up': 3.2, 'stretch': 2.6, 'posture': 2.4, 'page': 1.5}
GAP = 0.6


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + '[流程] ' + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)
    return ok


def info(name, txt=''):
    print('INFO ' + name + (('  ' + txt) if txt else ''), flush=True)


def setup(s): print('  [前置／捷徑] ' + s, flush=True)


def wd_of(day): return (day + 2) % 7   # day 0＝2025-09-16（週二）；雲端讀檔量到 day 2＝週四（weekday 4）、day 7＝週二、day 8＝週三


# ---------- 頁面裡的 JS（一律用「函式字串 + '(' + JSON + ')'」呼叫，不用 Python 的 % 格式化）----------
SEATED_JS = r"""(()=>{ const E=GAME.E, P=E.player; const sa=typeof SEATACT!=='undefined'?SEATACT.state():null;
  const actAt=(x,z)=>{ if(!sa) return null; const r=sa.list.find(q=>Math.abs(q.x-x)<0.02&&Math.abs(q.z-z)<0.02); return r?{act:r.act,set:r.set,hold:r.hold,named:r.named}:null; };
  const out=[]; E.npcs.forEach((n,i)=>{ if(!n||!n.obj||!(n.pose==='sit'||n.pose==='read')) return; const o=n.obj, u=o.userData||{}, st=n.seat||null;
    const pi=n.lookAt?E.npcs.findIndex(m=>m!==n&&m.obj&&m.obj.position===n.lookAt):-1;
    const held=[]; if(u.props&&typeof PROPS!=='undefined'&&PROPS.DEF){ for(const k in u.props){ const d=PROPS.DEF[k], q=u.props[k]; if(q&&q.visible&&d&&/LowerArm$|Hand$/.test(d.bone||'')&&k!=='bandage') held.push(k); } }
    const m=u.amb; const zs=st?(E.zone.seats||[]).find(q=>Math.abs(q.x-st.x)<0.05&&Math.abs(q.z-st.z)<0.05&&((q.lv|0)===(st.lv|0)||q.lv==null)):null;
    let lookN=null; if(n.lookAt&&pi<0){ let bd=1e9; for(const q of E.npcs){ if(q===n||!q.obj) continue; const d=Math.hypot(q.obj.position.x-n.lookAt.x,q.obj.position.z-n.lookAt.z); if(d<bd){ bd=d; lookN=+d.toFixed(2); } } }
    out.push({i, name:n.name||'', pose:n.pose, x:+o.position.x.toFixed(3), y:+o.position.y.toFixed(3), z:+o.position.z.toFixed(3), yaw:+(st&&st.yaw!=null?+st.yaw:o.rotation.y).toFixed(3), lv:n.lv|0,
      seat:st?{x:+(+st.x).toFixed(2),z:+(+st.z).toFixed(2),table:st.table==null?null:st.table,kind:st.kind||null,row:st.row==null?null:st.row,col:st.col==null?null:st.col,room:st.room||null,floor:st.floor||0,y:st.y==null?null:+(+st.y).toFixed(2)}:null,
      drv:u.driver||null, vis:!!o.visible, ambOn:!!u.ambOn, stat:!!(u.anim&&u.anim.static), chat:u.sitChat?((m&&m.chatRole)||'pair'):null, focus:!!u.sitFocus, floor:!!u.sitFloor, far:!!u.isFar,
      item:n.pose==='read'?(u.readItem||'book'):null, lap:!!(u.props&&u.props.laptop_lap&&u.props.laptop_lap.visible), held, sex:(u.spec&&u.spec.sex)||null, extra:!!n.isExtra, cls:!!n.clsStudent,
      zseat:zs?{table:zs.table==null?null:String(zs.table),kind:zs.kind||null,label:zs.label||null}:null, look:n.lookAt?[+(+n.lookAt.x).toFixed(2),+(+n.lookAt.z).toFixed(2)]:null, lookStale:!!(n.lookAt&&pi<0), lookNear:lookN,
      hidden:!!n.hidden, talk:!!(n.talk||n.talkLabel), partner:pi, mutual:pi>=0&&E.npcs[pi].lookAt===o.position, act:st?actAt(+st.x,+st.z):null,
      amb:m?{n:m.n|0,kinds:m.kinds,fx:m.fx?m.fx.kind:null,next:+(+m.next||0).toFixed(2),t:+(+m.t||0).toFixed(3),rate:+(+m.rate||0).toFixed(4),base:m.base||null,pst:(m.pst||[]).map(v=>+v.toFixed(3))}:null}); });
  let clips=null; try{ const r=CHAR._amb&&CHAR._amb.raw; if(r&&r.animations) clips=r.animations.map(a=>[a.name,+a.duration.toFixed(3)]); }catch(e){}
  return {zone:GAME.G.zone, hour:+(+GAME.G.hour).toFixed(2), day:GAME.G.day, weekday:GAME.G.weekday, date:typeof CALENDAR!=='undefined'?CALENDAR.dateOf(GAME.G.day).key:null,
    sitAmb:!!CHAR.sitAmb, ready:!!(CHAR.sitAmbReady&&CHAR.sitAmbReady()), npcs:E.npcs.length, seatact:sa?{zone:sa.zone,place:SEATACT.placeOf?SEATACT.placeOf(GAME.G.zone):null,n:sa.n,loaded:sa.loaded,acts:sa.list.map(r=>r.act+(r.named?'*':''))}:null,
    pairs:(typeof SEATACT!=='undefined'&&SEATACT.pairs)?SEATACT.pairs().length:null, fig:(typeof CLS!=='undefined'&&CLS.figState)?CLS.figState():null,
    player:{x:+P.obj.position.x.toFixed(2),y:+P.obj.position.y.toFixed(2),z:+P.obj.position.z.toFixed(2),lv:P.lv|0,pose:P.pose||null,seat:!!P.seat}, seated:out, clips}; })()"""

SEATS_JS = r"""(lv=>(GAME.E.zone.seats||[]).map((s,k)=>({k,x:+(+s.x).toFixed(3),z:+(+s.z).toFixed(3),yaw:+(+s.yaw||0).toFixed(3),lv:s.lv|0,table:s.table==null?null:String(s.table),kind:s.kind||null,row:s.row==null?null:s.row,room:s.room||null,floor:s.floor||0,y:s.y==null?null:+s.y}))
  .filter(s=>lv==null||s.lv===lv))"""

# 【前置／捷徑】補人：遊戲自己的做法（story3d.js populate 的 mk：CHAR.build(extraSpec)＋E.addNPC，坐在座位上、frozen），只坐沒有人的位子
FILL_JS = r"""(P=>{ const E=GAME.E, ss=E.zone.seats||[]; const occ=st=>E.npcs.some(n=>{ const s=n.seat||n.seatTarget; return s&&Math.hypot(s.x-st.x,s.z-st.z)<0.35&&((s.lv|0)===(st.lv|0)); })||!!(E.player.seat&&Math.hypot(E.player.seat.x-st.x,E.player.seat.z-st.z)<0.35);
  const sitN=()=>E.npcs.filter(n=>n.pose==='sit'||n.pose==='read').length; let added=0; const at=[]; for(const k of P.ks){ if(P.want!=null&&sitN()>=P.want) break; const st=ss[k]; if(!st||occ(st)) continue; const o=CHAR.build(STORY.extraSpec(P.base+added*2+(P.male&&added%2?1:0))); o.position.set(st.x,0,st.z); o.rotation.y=st.yaw||0;
    E.addNPC({obj:o,name:'',beh:'idle',pose:P.pose||'read',idlePose:P.pose||'read',frozen:true,isExtra:true,lv:st.lv|0,seat:{x:st.x,z:st.z,yaw:st.yaw||0,lv:st.lv|0},ccFill:true}); added++; at.push(k); }
  try{ if(typeof SEATACT!=='undefined') SEATACT.tick(GAME); }catch(e){}
  return {added, at, seated:E.npcs.filter(n=>n.pose==='sit'||n.pose==='read').length}; })"""

# 鏡頭：從候選角度裡挑一個「到頭、到胸口都沒有牆、桌子、櫃子擋住」的（人不算擋：探針的主角是 NPC）
AIM_FIND_JS = r"""(P=>{ const E=GAME.E, V=THREE.Vector3; const people=new Set(); for(const n of E.npcs) if(n&&n.obj) n.obj.traverse(q=>people.add(q)); if(E.player&&E.player.obj) E.player.obj.traverse(q=>people.add(q));
  const list=[]; E.scene.traverseVisible(q=>{ if(!q.isMesh||q.isSprite||people.has(q)) return; const mt=q.material; if(mt&&!Array.isArray(mt)&&mt.transparent&&(mt.opacity==null||mt.opacity<0.6)) return; list.push(q); });
  const rc=new THREE.Raycaster(); const hit=(e,l)=>{ const d=new V(l[0]-e[0],l[1]-e[1],l[2]-e[2]); const L=d.length(); if(L<0.2) return null; rc.set(new V(e[0],e[1],e[2]),d.normalize()); rc.near=0.05; rc.far=Math.max(0.06,L-0.15); let h=[]; try{ h=rc.intersectObjects(list,false); }catch(err){ h=[]; } return h.length?{d:+h[0].distance.toFixed(2),name:h[0].object.name||'(無名)'}:null; };
  const tries=[]; for(const c of P.cands){ const a=P.yaw+c[0]; const e=[P.c[0]+Math.sin(a)*c[1], P.base+c[2], P.c[1]+Math.cos(a)*c[1]], l=[P.c[0]+(c[4]||0)*Math.sin(P.yaw), P.base+c[3], P.c[1]+(c[4]||0)*Math.cos(P.yaw)];
    const bad=[]; for(const h of P.checks){ const r=hit(e,[P.c[0],P.base+h,P.c[1]]); if(r) bad.push(r); } tries.push({c, bad:bad.slice(0,2)}); if(!bad.length) return {eye:e.map(v=>+v.toFixed(3)), look:l.map(v=>+v.toFixed(3)), cand:c, ok:true, n:tries.length}; }
  const c=P.cands[0], a=P.yaw+c[0]; return {eye:[P.c[0]+Math.sin(a)*c[1],P.base+c[2],P.c[1]+Math.cos(a)*c[1]], look:[P.c[0],P.base+c[3],P.c[1]], cand:c, ok:false, tries:tries.slice(0,6)}; })"""

SET_CAM_JS = r"""(([e,l])=>{ const E=GAME.E; E.cinematic(new THREE.Vector3(...e),new THREE.Vector3(...l)); E.camera.position.set(...e); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look); E.camera.updateMatrixWorld(); return true; })"""
UNCAM_JS = "(()=>{ const E=GAME.E; if(E.cam.mode==='cinematic'&&E.endCinematic){ E.cam.cine&&(E.cam.cine.back=null); E.endCinematic(); } return E.cam.mode; })()"
HIDE_PLAYER_JS = "(on=>{ const P=GAME.E.player; if(P&&P.obj) P.obj.visible=!on; return true; })"
# 【前置／捷徑】玩家（藏起來的）放到要拍的那一層、那一個人旁邊：多樓層的區域只畫玩家那一層以下（engine3d.js updateLevelVis、shadowLevels）
MOVE_PLAYER_JS = r"""(([x,z,lv])=>{ const E=GAME.E, P=E.player; const ok=(a,b)=>!E.canStand||E.canStand(a,b,0.3,lv); let best=null;
  for(const r of [0.9,1.3,1.8,2.5,3.5]){ for(let k=0;k<12;k++){ const a=k*Math.PI/6, px=x+Math.sin(a)*r, pz=z+Math.cos(a)*r; if(ok(px,pz)){ best=[px,pz]; break; } } if(best) break; }
  if(!best) best=[x,z]; if(E.setLv) E.setLv(P,lv); P.obj.position.x=best[0]; P.obj.position.z=best[1]; P.obj.position.y=E.heightAt?E.heightAt(best[0],best[1],lv):P.obj.position.y; P.path=null; return {at:best.map(v=>+v.toFixed(2)), lv:P.lv|0}; })"""

# 錄一段（固定步長）：排程 P.trig＝[{f,t,kind}]（t＝window.__ccT 的第幾個人），代表格 P.reps＝[{f,why}]
REC_JS = r"""(async P=>{ const E=GAME.E, R=E.renderer, cv=R.domElement; const W=cv.width, H=cv.height, sw=Math.min(P.w,W), sh=Math.max(1,Math.round(H*Math.min(P.w,W)/W));
  const sm=new OffscreenCanvas(sw,sh), sc=sm.getContext('2d',{willReadFrequently:true}); const T=window.__ccT||[]; const shots=window.__ccShots||(window.__ccShots={});
  const trk=E.npcs.filter(n=>n&&n.obj&&(n.pose==='sit'||n.pose==='read')); if(P.player&&E.player) trk.push(E.player); const ix=n=>n===E.player?-1:E.npcs.indexOf(n);
  const am=n=>n.obj&&n.obj.userData&&n.obj.userData.amb; const last=trk.map(n=>{ const m=am(n); return m?m.n|0:0; }), lastR=trk.map(n=>{ const m=am(n); return m&&m.chatRole||null; });
  const trig={}; for(const q of (P.trig||[])) (trig[q.f]=trig[q.f]||[]).push(q); const repAt={}; for(const r of (P.reps||[])) (repAt[r.f]=repAt[r.f]||[]).push(r.why);
  const starts=[], roles=[], fid=[], diffs=[], top=[], kept=[]; let prev=null, err=null; const t0=performance.now(), paused0=E.paused; E.paused=true;
  if(P.cam){ E.cinematic(new THREE.Vector3(...P.cam[0]),new THREE.Vector3(...P.cam[1])); E.camera.position.set(...P.cam[0]); E.cam.look=new THREE.Vector3(...P.cam[1]); E.camera.lookAt(E.cam.look); }
  try{ for(let f=0;f<P.n;f++){
      for(const q of (trig[f]||[])){ const n=T[q.t], o=n&&n.obj; let ok=false; try{ ok=!!(o&&CHAR.sitAmbFidget(o,q.kind)); }catch(e){ ok='ERR '+String(e).slice(0,80); } const m=o&&am(n); fid.push({f,t:q.t,i:n?ix(n):null,kind:q.kind,ok,got:ok===true&&m?(m.fx?m.fx.kind:(m.lastKind||null)):null,live:null,_n:n}); }
      E.update(P.dt); E.render();
      for(const q of fid) if(q._n&&q.live===null&&q.f===f){ const m=am(q._n); q.live=!!(m&&m.fx&&m.fx.kind===q.got); q.chat=m?(m.chatRole||null):null; delete q._n; }
      sc.drawImage(cv,0,0,sw,sh); const px=sc.getImageData(0,0,sw,sh).data; let d=0;
      if(prev){ let s=0, c=0; for(let k=0;k<px.length;k+=8){ s+=Math.abs(px[k]-prev[k])+Math.abs(px[k+1]-prev[k+1])+Math.abs(px[k+2]-prev[k+2]); c++; } d=s/(c*3); } prev=px; diffs.push(+d.toFixed(3));
      const rw=repAt[f], minTop=top.length<P.top?-1:top[top.length-1].d, isTop=f>0&&d>minTop;
      if(rw||isTop){ const fc=new OffscreenCanvas(W,H); fc.getContext('2d').drawImage(cv,0,0); const rec={f,d,why:rw?rw.slice():[],fc,top:false};
        if(isTop){ rec.top=true; top.push(rec); top.sort((a,b)=>b.d-a.d); while(top.length>P.top){ const x=top.pop(); x.top=false; } } if(rw) kept.push(rec); }
      for(let k=0;k<trk.length;k++){ const m=am(trk[k]); if(!m) continue; if((m.n|0)!==last[k]){ last[k]=m.n|0; starts.push({f,i:ix(trk[k]),kind:m.lastKind||null}); } const cr=m.chatRole||null; if(cr!==lastR[k]){ lastR[k]=cr; roles.push({f,i:ix(trk[k]),role:cr}); } }
      if(f%15===14) await new Promise(r=>setTimeout(r,0)); } }
  catch(e){ err=String(e&&e.stack||e).slice(0,500); } finally { E.paused=paused0; }
  const ms=Math.round(performance.now()-t0); const all=[...new Set(top.concat(kept))].sort((a,b)=>a.f-b.f); const list=[]; let k=0;
  for(const rec of all){ const key=P.key+'_'+(k++); try{ const blob=await rec.fc.convertToBlob({type:'image/jpeg',quality:P.q}); shots[key]=blob; list.push({key,f:rec.f,d:+rec.d.toFixed(3),top:rec.top,why:rec.why,size:blob.size}); }catch(e){ list.push({key,f:rec.f,err:String(e).slice(0,120)}); } rec.fc=null; }
  return {W,H,sw,sh,n:P.n,dt:P.dt,ms,err,fid,starts,roles,diffs,shots:list,trk:trk.map(ix)}; })"""

GET_SHOT_JS = r"""(async key=>{ const b=window.__ccShots&&window.__ccShots[key]; if(!b) return null; const u=new Uint8Array(await b.arrayBuffer()); let s='';
  for(let i=0;i<u.length;i+=0x8000) s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000)); delete window.__ccShots[key]; return btoa(s); })"""

# FPS：遊戲自己的主迴圈（不暫停），包一層 E.render 記每一格的時間
FPS_JS = r"""(async P=>{ const E=GAME.E, ts=[], gf=[]; const r0=E.render, sk0=E.skipped|0; E.render=function(){ const r=r0.apply(this,arguments); ts.push(performance.now()); return r; };
  const t0=performance.now(); while(performance.now()-t0<P.ms){ await new Promise(r=>setTimeout(r,1000)); gf.push(+(+GAME.fps||0).toFixed(1)); } E.render=r0;
  const n=ts.length; if(n<3) return {n}; const dur=(ts[n-1]-ts[0])/1000, dts=[]; for(let i=1;i<n;i++) dts.push(ts[i]-ts[i-1]);
  const per=[]; for(let s=ts[0]; s+1000<=ts[n-1]; s+=1000){ let c=0; for(const t of ts) if(t>=s&&t<s+1000) c++; per.push(c); }
  const srt=dts.slice().sort((a,b)=>b-a), k=Math.max(1,Math.round(srt.length*0.01)), p1=srt.slice(0,k).reduce((a,b)=>a+b,0)/k;
  const ri=E.renderer.info.render;
  return {n, dur:+dur.toFixed(2), avg:+((n-1)/dur).toFixed(2), minSec:per.length?Math.min(...per):null, perSec:per, worstMs:+srt[0].toFixed(1), worstFps:+(1000/srt[0]).toFixed(2), p1LowFps:+(1000/p1).toFixed(2),
    gameFps:gf, skipped:(E.skipped|0)-sk0, calls:ri.calls, tris:ri.triangles, canvas:[E.renderer.domElement.width,E.renderer.domElement.height], pr:E.renderer.getPixelRatio()}; })"""

PLAYER_SIT_JS = r"""(([k,pose])=>{ const E=GAME.E, P=E.player, st=(E.zone.seats||[])[k]; if(!st) return null; GAME.sitAt(P,st); if(pose){ P.pose=pose; P.idlePose=pose; } E.player.obj.visible=true;
  return {seat:{x:st.x,z:st.z,yaw:st.yaw||0,lv:st.lv|0}, pose:P.pose, cam:E.cam.mode}; })"""
ALL_NPC_JS = "(()=>GAME.E.npcs.map((n,i)=>[i,n.name||'',n.pose,+n.obj.position.x.toFixed(2),+n.obj.position.z.toFixed(2),n.lv|0,!!n.hidden,n.beh,n.leaving||false]))()"
ZONE_MESH_JS = "(()=>{ let n=0; const z=GAME.E.zone; if(z&&z.group) z.group.traverse(o=>{ if(o.isMesh) n++; }); return n; })()"


# ---------- 讀檔、等 ----------
CUR = {'zone': None}


async def load_zone(pg, cdp, zone, hour, day, pos=None):
    CUR['zone'] = zone
    st = {'zone': zone, 'hour': hour, 'day': day, 'weekday': wd_of(day), 'weather': 'clear'}
    if pos: st['pos'] = pos
    setup('讀檔：%s、day %d（weekday %d）%05.2f 時、晴天、條件事件關閉（playlib quiet_events）' % (zone, day, wd_of(day), hour))
    await L.load_state(pg, st, quiet_events=True)
    t1 = time.time(); last = -1; stable = 0
    while time.time() - t1 < 120:
        await pg.wait_for_timeout(1000)
        if not await pg.evaluate("GAME.G.zone===%s&&!GAME.E.player.busy" % J(zone)): continue
        n = await pg.evaluate(ZONE_MESH_JS)
        stable = stable + 1 if n == last else 0; last = n
        if stable >= 4: break
    await L.close_panels(pg, cdp)
    return await pg.evaluate("GAME.G.zone===%s" % J(zone))


async def wait_people(pg, ctl, want_idx=None, max_s=90, min_s=8):
    """坐著的人都換成 VRM（一般網址：畫面裡的人坐姿循環也在跑 u.ambOn）、SEATACT 配好（人數、配好幾組、聊天幾組連續兩次一樣）才開始錄；
    至少等 min_s 秒（SEATACT.tick 每 30 格才跑一次：兩種網址要比同一個狀態）。回傳 (SEATED_JS 的結果, 有沒有等到, 秒)"""
    t1 = time.time(); r = None; sig0 = None
    while time.time() - t1 < max_s:
        r = await pg.evaluate(SEATED_JS)
        ppl = [s for s in r['seated'] if not s['hidden'] and (want_idx is None or s['i'] in want_idx)]
        sa = r.get('seatact') or {}
        sig = (len(ppl), sa.get('n'), r.get('pairs'), sum(1 for s in ppl if s['drv'] == 'vrm'))
        # 畫面外 16 m 以上的人不更新骨架（engine3d.js updateNPC）＝ambOn 一直是 false：只看畫面裡的人
        # SEATACT（坐著做什麼、桌上的東西）每 30 格才跑一次：要等它處理過這個區域（state().zone＝這一區；不是 SEATACT 管的地方＝不用等）
        sa_ok = not sa or not sa.get('place') or (sa.get('zone') == r['zone'] and (sa.get('n') or 0) > 0)
        ok = bool(ppl) and sa_ok and all(s['drv'] == 'vrm' for s in ppl) and (ctl or (r['ready'] and all(s['ambOn'] for s in ppl if s['vis']) and any(s['ambOn'] for s in ppl)))
        if ok and sig == sig0 and time.time() - t1 >= min_s: return r, True, time.time() - t1
        sig0 = sig
        await pg.wait_for_timeout(2000)
    return r, False, time.time() - t1


# ---------- 挑人、鏡頭、排程 ----------
def arms_free(s): return s['pose'] == 'sit' and not s['floor'] and not s['lap'] and not s['held']


ROLE = {
    'hair': lambda s: arms_free(s) and not s['chat'],
    'book': lambda s: s['pose'] == 'read' and s['item'] == 'book',
    'phone': lambda s: s['pose'] == 'read' and s['item'] in ('phone', 'tablet'),
    'sofa': lambda s: bool(s.get('zseat')) and str(s['zseat'].get('table')) in ('booth', 'lounge'),   # 兩點半：booth＝沙發卡座、lounge＝單人沙發（zones3d.js 座位表）
    'floor': lambda s: s['floor'],
    'chair': lambda s: not s['floor'],
    'chat': lambda s: bool(s['chat']) or s['mutual'],
    'desk': lambda s: s['focus'] or (s['pose'] == 'read' and s['item'] == 'book'),
    'any': lambda s: True,
}


def pick(seated, role, used, prefer_f=False, lv=None):
    c = [s for s in seated if not s['hidden'] and s['i'] not in used and ROLE[role](s) and (lv is None or s['lv'] == lv)]
    # 同桌聊天的一組（u.sitChat）：小動作下一格就被聊天蓋掉（character3d.js sitAmbient ④），叫小動作的段先挑不在聊天的人
    c.sort(key=lambda s: ((bool(s['chat']) and role != 'chat'), (s['sex'] != 'f') if prefer_f else False))
    return c[0] if c else None


def kind_ok(s, kind):
    """這個人做得出這一種嗎（character3d.js：hair 要手上沒東西；page 要拿書；跪坐、拿東西的 hair 會變 side）"""
    if s is None: return False
    if kind == 'hair': return arms_free(s)
    if kind == 'page': return s['pose'] == 'read' and s['item'] == 'book'
    return True


def schedule(kinds, t0=0.5):
    """一個人的排程：每種動作照長度排開（不會互相打斷）；回傳 [(秒, kind)]、結束秒數"""
    out = []; t = t0
    for k in kinds:
        out.append((round(t, 3), k)); t += DUR.get(k, 3.0) + GAP
    return out, t


def cam_close(s, mode='close3q'):
    """近景候選：[繞著他轉幾度, 距離, 眼睛高, 看的高, 看的點往前偏]；高度從他腳下（obj.position.y）算"""
    if mode == 'low':      # 跪坐、手在大腿上：低一點、斜前方
        cands = [[0.6, 1.3, 0.95, 0.45], [-0.6, 1.3, 0.95, 0.45], [1.0, 1.2, 1.0, 0.5], [-1.0, 1.2, 1.0, 0.5], [0, 1.5, 1.1, 0.5], [1.4, 1.3, 1.1, 0.5], [-1.4, 1.3, 1.1, 0.5]]
        checks = [0.75, 0.45]
    elif mode == 'side':   # 側面（沙發靠背和背之間的空隙、伸懶腰）
        cands = [[1.45, 1.4, 1.2, 0.75], [-1.45, 1.4, 1.2, 0.75], [1.1, 1.5, 1.3, 0.8], [-1.1, 1.5, 1.3, 0.8], [0.7, 1.5, 1.35, 0.8], [-0.7, 1.5, 1.35, 0.8]]
        checks = [1.05, 0.75]
    else:                  # 斜前方 35° 左右（手、頭髮、脖子都看得到）
        cands = [[0.6, 1.35, 1.35, 0.85], [-0.6, 1.35, 1.35, 0.85], [0.35, 1.2, 1.45, 0.85], [-0.35, 1.2, 1.45, 0.85], [0.9, 1.3, 1.5, 0.85], [-0.9, 1.3, 1.5, 0.85],
                 [0, 1.4, 1.6, 0.85], [1.3, 1.2, 1.5, 0.85], [-1.3, 1.2, 1.5, 0.85], [0.6, 1.8, 1.9, 0.8], [-0.6, 1.8, 1.9, 0.8]]
        checks = [1.15, 0.85]
    return {'c': [s['x'], s['z']], 'base': s['y'], 'yaw': s['yaw'], 'cands': cands, 'checks': checks}   # obj.position.y＝座位那一層的地板（坐姿往下 0.47×身高比例在 u.model 裡）


def cam_wide(ppl, mode='row'):
    """一排人的全景：中心、他們面向的平均方向（sin yaw、cos yaw）"""
    cx = sum(p['x'] for p in ppl) / len(ppl); cz = sum(p['z'] for p in ppl) / len(ppl); by = sum(p['y'] for p in ppl) / len(ppl)
    fx = sum(math.sin(p['yaw']) for p in ppl); fz = sum(math.cos(p['yaw']) for p in ppl); yaw = math.atan2(fx, fz)
    span = max([math.hypot(p['x'] - cx, p['z'] - cz) for p in ppl] + [1.0])
    d = min(8.0, max(2.6, span * 1.6 + 1.2))
    ds = [d, d * 0.7, d * 0.5, 2.6]   # 遠的被牆擋住（鏡頭跑到教室外面）就近一點
    if mode == 'feet':     # 階梯座位的腳：側面、低
        cands = [[a, x, 0.7 + 0.1 * k, 0.35] for x in ds for k, a in enumerate((1.57, -1.57, 1.2, -1.2, 2.0, -2.0))]
        checks = [0.4]
    else:
        cands = [[a, x, 2.3, 0.8] for x in ds for a in (0.5, -0.5, 0.0, 0.9, -0.9, 1.3, -1.3)]
        checks = [0.9]
    return {'c': [cx, cz], 'base': by, 'yaw': yaw, 'cands': cands, 'checks': checks}


def rows_of(ppl):
    """同一排：同一層；有 seat.row 的（教室）照 row；其他照「面向的方向一樣、同一條線上（面向南北＝z 一樣、東西＝x 一樣，差 0.25 m 內）」"""
    rows = {}
    for p in ppl:
        st = p['seat'] or {}
        if st.get('row') is not None: key = ('r', p['lv'], st.get('room'), st['row'], round(p['yaw'], 1))
        else:
            ns = abs(math.sin(p['yaw'])) < 0.5
            key = ('l', p['lv'], round(p['yaw'], 1), round((p['z'] if ns else p['x']) / 0.25))
        rows.setdefault(key, []).append(p)
    return [v for v in rows.values() if len(v) >= 2]


def sync_stats(rec, ppl, dt):
    """BB-C 14:41：同一排 4 人以上，10 秒內同時開始同一種動作的比例（±0.5 秒，另給 ±1 秒）；坐姿循環的相位分散度"""
    out = []
    for row in rows_of(ppl):
        ids = set(p['i'] for p in row)
        ev = [(s['f'] * dt, s['i'], s['kind']) for s in rec['starts'] if s['i'] in ids]
        dur = rec['n'] * dt
        r = {'n': len(row), 'who': sorted(ids), 'seat0': [row[0]['x'], row[0]['z'], row[0]['lv']], 'starts': len(ev), 'events': [[round(t, 2), i, k] for t, i, k in ev]}
        for tol in SYNC_TOL:
            same = [e for e in ev if any(o[1] != e[1] and o[2] == e[2] and abs(o[0] - e[0]) <= tol for o in ev)]
            anyk = [e for e in ev if any(o[1] != e[1] and abs(o[0] - e[0]) <= tol for o in ev)]
            wins = []
            w = 0.0
            while w < dur - 1e-6:
                we = [e for e in ev if w <= e[0] < w + 10]; ws = [e for e in we if any(o[1] != e[1] and o[2] == e[2] and abs(o[0] - e[0]) <= tol for o in ev)]
                wins.append({'t': [w, min(dur, w + 10)], 'starts': len(we), 'same': len(ws), 'ratio': round(len(ws) / len(we), 3) if we else None}); w += 10
            r['tol%.1f' % tol] = {'same_kind': len(same), 'any_kind': len(anyk), 'ratio_same': round(len(same) / len(ev), 3) if ev else None, 'windows': wins}
        ph = []
        for p in row:
            a = p.get('amb') or {}
            if a.get('base'): ph.append(round((a['t'] / CLIP_BASE) % 1.0, 3))
        if ph:
            cxs = sum(math.cos(2 * math.pi * x) for x in ph) / len(ph); sns = sum(math.sin(2 * math.pi * x) for x in ph) / len(ph)
            r['base_phase'] = ph; r['phase_R'] = round(math.hypot(cxs, sns), 3)   # 1＝完全同相、0＝完全分散
        out.append(r)
    return out


CLIP_BASE = 1.667   # Sitting_Idle_Loop（雲端量到 1.667 秒）


async def save_shots(pg, rec, sub, tag):
    os.makedirs(os.path.join(OUT, sub), exist_ok=True); files = []
    for s in rec['shots']:
        if s.get('err'): files.append({'f': s['f'], 'err': s['err']}); continue
        b64 = await pg.evaluate(GET_SHOT_JS + '(' + J(s['key']) + ')')
        if not b64: files.append({'f': s['f'], 'err': 'blob 不見了'}); continue
        why = ('top' if s['top'] else '') + ('_' if s['top'] and s['why'] else '') + '_'.join(s['why'])
        fn = '%s_f%04d_%s.jpg' % (tag, s['f'], why.replace('.', 'p') or 'x')
        with open(os.path.join(OUT, sub, fn), 'wb') as fh: fh.write(base64.b64decode(b64))
        files.append({'f': s['f'], 'd': s['d'], 'top': s['top'], 'why': s['why'], 'file': sub + '/' + fn, 'kb': round(s['size'] / 1024, 1)})
    return files


async def record(pg, mode, tag, targets, plans, cam, secs, player=False, top=TOPN, Rz=None):
    """targets：要叫 sitAmbFidget 的人（SEATED_JS 的項目或 'player'）；plans：每個人的 [kind…]；cam：[eye, look] 或 None（遊戲自己的鏡頭）"""
    dt = 1.0 / REC_FPS
    zn = await pg.evaluate('GAME.G.zone')
    if zn != CUR['zone']:   # 劇情、作息把人換到別的區域（雲端 r1：day 2 錄到一半變成校園）＝這一段不錄
        check('[%s] 錄影前還在 %s' % (tag, CUR['zone']), False, '現在是 %s' % zn)
        if Rz is not None: Rz.setdefault('missing', []).append({'seg': tag, 'why': '區域被換成 %s' % zn})
        return None, None
    if any(t != 'player' for t in targets):   # E.npcs 的順序在主迴圈裡會變（店裡的客人進出、換模型）：照座位座標重新找同一個人
        cur = (await pg.evaluate(SEATED_JS))['seated']; t2 = []
        for t in targets:
            if t == 'player': t2.append(t); continue
            m = [c for c in cur if c['lv'] == t['lv'] and abs(c['x'] - t['x']) < 0.08 and abs(c['z'] - t['z']) < 0.08]
            if not m:
                allp = await pg.evaluate(ALL_NPC_JS)
                info('[%s] 找不到原本的 #%d（%.2f, %.2f）：他起身走了？現在的人 %s' % (tag, t['i'], t['x'], t['z'], J(allp)[:900])); continue
            if m[0]['i'] != t['i']: info('[%s] #%d 現在是 E.npcs[%d]' % (tag, t['i'], m[0]['i']))
            t2.append(m[0])
        if len(t2) != len(targets):
            plans = [pl for t, pl in zip(targets, plans) if t == 'player' or any(abs(c['x'] - t['x']) < 0.08 and abs(c['z'] - t['z']) < 0.08 for c in t2 if c != 'player')]
        targets = t2
    await pg.evaluate("(ids=>{ const E=GAME.E; window.__ccT=ids.map(i=>i===-1?E.player:E.npcs[i]); return window.__ccT.length; })(" + J([(-1 if t == 'player' else t['i']) for t in targets]) + ")")
    trig = []; reps = []; end = secs; sched = []
    for ti, ks in enumerate(plans):
        sc, t_end = schedule(ks)
        end = max(end, t_end)
        for t, k in sc:
            f = int(round(t / dt)); trig.append({'f': f, 't': ti, 'kind': k}); sched.append([round(t, 2), ti, k])
            for rt in REP_T: reps.append({'f': f + int(round(rt / dt)), 'why': '%s%s_%gs' % (k, ti, rt)})
    end = min(max(end, secs), max(SEG_MAX, secs))
    n = int(round(end / dt))
    trig = [q for q in trig if q['f'] < n]; reps = [r for r in reps if r['f'] < n]
    if seed_ok(): await pg.evaluate('window.__ccSeed(%d)' % ((SEED or 0) + len(tag)))
    print('  [%s] 錄 %.1f 秒（%d 格、%g fps 固定步長）、鏡頭 %s、排程 %s' % (tag, end, n, REC_FPS, J(cam) if cam else '遊戲自己的', J(sched)), flush=True)
    t1 = time.time()
    rec = await pg.evaluate(REC_JS + '(' + J({'n': n, 'dt': dt, 'w': DIFF_W, 'top': top, 'q': JPEG_Q, 'trig': trig, 'reps': reps, 'cam': cam, 'key': tag, 'player': player}) + ')')
    files = await save_shots(pg, rec, mode, tag)
    d = rec['diffs']; dm = round(sum(d) / len(d), 3) if d else None
    oks = [q for q in rec['fid'] if q['ok'] is True]
    print('  [%s] %.1f 秒（頁面裡 %.1f 秒）；畫面 %dx%d；sitAmbFidget %d/%d 叫得動 %s；自己開始的小動作 %d 個 %s；聊天輪替 %d 次；每格平均差 %s、最大 %s；存了 %d 張' % (
        tag, time.time() - t1, rec['ms'] / 1000.0, rec['W'], rec['H'], len(oks), len(rec['fid']), J([[q['kind'], q['got'], 'live' if q.get('live') else ('下一格就沒了（%s）' % (q.get('chat') or '?') if q['ok'] is True else '-')] for q in rec['fid']]),
        len(rec['starts']), J([[round(s['f'] * dt, 2), s['i'], s['kind']] for s in rec['starts']][:12]), len(rec['roles']), dm, max(d) if d else None, len(files)), flush=True)
    if rec['err']: check('[%s] 錄影迴圈沒有例外' % tag, False, rec['err'][:300])
    out = {'tag': tag, 'secs': round(end, 2), 'n': n, 'dt': dt, 'cam': cam, 'sched': sched, 'targets': [('player' if t == 'player' else {k: t.get(k) for k in ('i', 'name', 'pose', 'item', 'x', 'z', 'lv', 'floor', 'sex', 'seat', 'act', 'chat')}) for t in targets],
           'fid': rec['fid'], 'starts': rec['starts'], 'roles': rec['roles'], 'diff_mean': dm, 'diffs': d, 'shots': files, 'page_ms': rec['ms'], 'canvas': [rec['W'], rec['H']], 'err': rec['err']}
    if Rz is not None: Rz.setdefault('segs', []).append(out)
    return out, rec


def seed_ok(): return SEED is not None


# ---------- 每個地點 ----------
async def aim_at(pg, spec):
    a = await pg.evaluate(AIM_FIND_JS + '(' + J(spec) + ')')
    if not a.get('ok'): info('鏡頭：候選角度都有東西擋（用第一個）', J(a.get('tries'))[:400])
    return [a['eye'], a['look']], a


async def stop_people(pg, mode, Rz, ctl, key='seated0'):
    r, ok, secs = await wait_people(pg, ctl)
    Rz[key] = r; Rz[key + '_wait_s'] = round(secs, 1)
    ppl = [s for s in (r['seated'] if r else []) if not s['hidden']]
    info('[%s] %s %s：坐著的人 %d（VRM %d、坐姿循環 ambOn %d、跪坐 %d、拿書 %d、手機平板 %d、看桌上 %d、聊天 %d、互相看著 %d）；片段 ready=%s sitAmb=%s；SEATACT %s；pairs %s；等了 %.0f 秒%s' % (
        mode, r['zone'] if r else '?', r['date'] if r else '', len(ppl), sum(1 for s in ppl if s['drv'] == 'vrm'), sum(1 for s in ppl if s['ambOn']), sum(1 for s in ppl if s['floor']),
        sum(1 for s in ppl if s['item'] == 'book'), sum(1 for s in ppl if s['item'] in ('phone', 'tablet')), sum(1 for s in ppl if s['focus']), sum(1 for s in ppl if s['chat']),
        sum(1 for s in ppl if s['mutual']), r and r['ready'], r and r['sitAmb'], J(r and r['seatact']), r and r['pairs'], secs, '' if ok else '（沒等到全部換好）'))
    return r, ppl


async def go_level(pg, s):
    setup('玩家（藏起來）放到 (%.2f, %.2f) 第 %d 層旁邊：多樓層區域只畫玩家那一層以下' % (s['x'], s['z'], s['lv']))
    r = await pg.evaluate(MOVE_PLAYER_JS + '(' + J([s['x'], s['z'], s['lv']]) + ')')
    for _ in range(3): await pg.wait_for_timeout(700)
    return r


async def seg_close(pg, mode, Rz, ppl, tag, role, kinds, camm='close3q', prefer_f=False, used=None, fallback=('any',)):
    used = used if used is not None else set()
    s = pick(ppl, role, used, prefer_f)
    for fb in fallback:
        if s: break
        s = pick(ppl, fb, used, prefer_f)
    if not s:
        info('[%s] 沒有可以拍的人（%s）' % (tag, role)); Rz.setdefault('missing', []).append({'seg': tag, 'role': role, 'why': '沒有這種人'}); return None
    used.add(s['i'])
    ks = [k for k in kinds if k in KINDS and kind_ok(s, k)]
    skipped = [k for k in kinds if k in KINDS and not kind_ok(s, k)]
    if skipped: Rz.setdefault('skipped', []).append({'seg': tag, 'who': s['i'], 'kinds': skipped, 'why': '這個人做不出來（hair 要手上沒東西、page 要拿書）'})
    if s['lv'] != (await pg.evaluate("GAME.E.player.lv|0")): await go_level(pg, s)
    cam, a = await aim_at(pg, cam_close(s, camm))
    setup('固定鏡頭 %s（%s、%s）；手動叫 CHAR.sitAmbFidget %s' % (tag, camm, '沒被擋' if a.get('ok') else '有東西擋', J(ks)))
    info('[%s] 拍 #%d %s pose=%s item=%s floor=%s sex=%s seat=%s act=%s chat=%s held=%s' % (tag, s['i'], s['name'] or '(路人)', s['pose'], s['item'], s['floor'], s['sex'], J(s['seat']), J(s['act']), s['chat'], J(s['held'])))
    seg, rec = await record(pg, mode, tag, [s], [ks], cam, SEG_S, Rz=Rz)
    return seg


async def seg_sync(pg, mode, Rz, ppl, tag, row):
    if row[0]['lv'] != (await pg.evaluate("GAME.E.player.lv|0")): await go_level(pg, row[0])
    cam, a = await aim_at(pg, cam_wide(row))
    setup('固定鏡頭 %s（同一排 %d 人的全景）；不叫 sitAmbFidget，只記每個人自己開始的小動作 %.0f 秒' % (tag, len(row), SYNC_S))
    seg, rec = await record(pg, mode, tag, [], [], cam, SYNC_S, top=5, Rz=Rz)
    if rec is None: return None
    r2 = await pg.evaluate(SEATED_JS)
    near = lambda p: any(p['lv'] == q['lv'] and abs(p['x'] - q['x']) < 0.08 and abs(p['z'] - q['z']) < 0.08 for q in row)   # 照座位座標找回同一排（E.npcs 的順序可能變了）
    st = sync_stats(rec, [p for p in r2['seated'] if near(p)] or row, seg['dt'])
    seg['sync'] = st
    for x in st:
        t5 = x.get('tol0.5') or {}
        info('[%s] 同一排 %d 人（%s）：%.0f 秒內開始 %d 個；±0.5 秒內和別人同時開始同一種 %s 個（比例 %s）、±1 秒 %s；坐姿循環相位 R=%s（1＝同相）' % (
            tag, x['n'], J(x['seat0']), seg['secs'], x['starts'], t5.get('same_kind'), t5.get('ratio_same'), (x.get('tol1.0') or {}).get('ratio_same'), x.get('phase_R')))
    return seg


def best_row(ppl, minn=ROW_MIN):
    rs = sorted(rows_of(ppl), key=lambda v: -len(v))
    return rs[0] if rs and len(rs[0]) >= minn else None


async def fill_row(pg, Rz, zone, lv=None, want=ROW_N, pose='read'):
    """【前置／捷徑】同一排補到 want 人：挑「已經有人坐的那一排」（沒有就挑座位最多的一排），照遊戲 populate 的寫法加路人"""
    seats = await pg.evaluate(SEATS_JS + '(' + J(lv) + ')')
    r = await pg.evaluate(SEATED_JS)
    occ = [(p['x'], p['z'], p['lv']) for p in r['seated']]
    rows = {}
    for s in seats:
        if s['floor']: continue
        ns = abs(math.sin(s['yaw'])) < 0.5
        key = (s['lv'], round(s['yaw'], 1), round((s['z'] if ns else s['x']) / 0.25), s['room'])
        rows.setdefault(key, []).append(s)
    def score(v):
        have = sum(1 for s in v if any(abs(s['x'] - o[0]) < 0.35 and abs(s['z'] - o[1]) < 0.35 and s['lv'] == o[2] for o in occ))
        return (len(v) >= want, have, len(v))
    if not rows: return None
    row = max(rows.values(), key=score)
    row.sort(key=lambda s: (s['x'], s['z']))
    ks = [s['k'] for s in row][:max(want, 1) + 2]
    setup('%s：同一排（第 %d 層、yaw %.2f、%d 個位子）補路人到 %d 人：CHAR.build(STORY.extraSpec)＋E.addNPC（和 story3d.js populate 一樣），補完叫一次 SEATACT.tick' % (zone, row[0]['lv'], row[0]['yaw'], len(row), want))
    res = await pg.evaluate(FILL_JS + '(' + J({'ks': ks[:want + 2], 'base': 300, 'pose': pose}) + ')')
    # 補多了（want 以外）不要緊：最多 want+2 個位子
    Rz.setdefault('fill', []).append({'row': [[s['x'], s['z']] for s in row], 'res': res})
    info('[%s] 補人 %s' % (zone, J(res)))
    return row


async def loc_cafe(pg, cdp, mode, R, ctl):
    Rz = {'zone': 'cafe', 'hour': 15.0, 'day': CAFE_DAY}; R['stops'].append(Rz)
    if not check('[%s] 讀到兩點半（cafe 15:00）' % mode, await load_zone(pg, cdp, 'cafe', 15.0, CAFE_DAY)): return
    await pg.evaluate(HIDE_PLAYER_JS + '(true)')
    r, ppl = await stop_people(pg, mode, Rz, ctl)
    if not check('[%s] 兩點半有坐著的 NPC' % mode, bool(ppl), str(len(ppl))): return
    used = set()
    # BB-C 14:41 ①：長髮女生撥頭髮（手有沒有穿進頭髮）、轉頭（脖子、頭髮）
    await seg_close(pg, mode, Rz, ppl, 'cafe_hair', 'hair', ['hair', 'look', 'side'], prefer_f=True, used=used, fallback=('chair', 'any'))
    # 翻頁（拇指）、低頭看書抬頭
    await seg_close(pg, mode, Rz, ppl, 'cafe_page', 'book', ['page', 'glance', 'page', 'up'], used=used, fallback=('any',))
    # 沙發（booth／lounge）身體前傾、背和靠背之間的空隙：側面
    await seg_close(pg, mode, Rz, ppl, 'cafe_sofa', 'sofa', ['posture', 'stretch', 'posture'], camm='side', used=set(), fallback=('chair',))
    await pg.evaluate(UNCAM_JS)
    if CAFE2:
        Rz2 = {'zone': CAFE2, 'hour': 15.0, 'day': DAY, 'why': '兩點半沒有同桌聊天的一組（SEATACT chat 只在 crowd3d 的店）、沒有滑手機的人'}; R['stops'].append(Rz2)
        if not check('[%s] 讀到 %s 15:00' % (mode, CAFE2), await load_zone(pg, cdp, CAFE2, 15.0, DAY)): return
        await pg.evaluate(HIDE_PLAYER_JS + '(true)')
        r, ppl = await stop_people(pg, mode, Rz2, ctl)
        if not ppl: return
        # 聊天比劃的手有沒有穿過桌面：不叫 fidget（聊天時會被蓋掉），錄 talk／nod 輪替
        chat = [s for s in ppl if s['chat']]
        if chat:
            await seg_close(pg, mode, Rz2, ppl, 'cafe2_chat', 'chat', [], used=set())
        else:
            mut = [s for s in ppl if s['mutual']]
            stale = [s for s in ppl if s['lookStale']]
            info('[%s] %s 沒有 u.sitChat 的一組（SEATACT pairs=%s）；互相看著的 %d 人 %s；n.lookAt 有值、卻不是任何一個人現在的 obj.position 的 %d 人 %s' % (
                mode, CAFE2, r['pairs'], len(mut), J([[s['i'], s['x'], s['z'], s['act']] for s in mut]), len(stale), J([[s['i'], s['x'], s['z'], (s['act'] or {}).get('act'), s['look'], s['lookNear']] for s in stale])))
            Rz2['lookStale'] = [{k: s.get(k) for k in ('i', 'x', 'z', 'act', 'look', 'lookNear', 'pose')} for s in stale]
            Rz2.setdefault('missing', []).append({'seg': 'cafe2_chat', 'why': '沒有 u.sitChat（SEATACT.pairs()=%s；互相看著 %d 人）' % (r['pairs'], len(mut))})
            if mut: await seg_close(pg, mode, Rz2, ppl, 'cafe2_mutual', 'chat', ['look'], used=set())
        # 兩點半這個時段沒有手上空的人（全部在讀書、滑手機＝pose read）：撥頭髮改在這裡補
        if 'hair' in KINDS and not any(q['ok'] is True and q.get('live') and q.get('got') == 'hair' for sg in Rz.get('segs', []) for q in sg['fid']):
            await seg_close(pg, mode, Rz2, ppl, 'cafe2_hair', 'hair', ['hair', 'side'], prefer_f=True, used=set(), fallback=())
        # 滑手機的拇指（每 2～6 秒自己滑一下，不用叫）＋抬頭
        await seg_close(pg, mode, Rz2, ppl, 'cafe2_phone', 'phone', ['glance'], used=set(), fallback=())
        await pg.evaluate(UNCAM_JS)


async def loc_lib(pg, cdp, mode, R, ctl):
    HOURS = {'library_hall': 14.0, 'library': 14.0, 'lawlib': 14.0, 'soclib': 14.0}
    for z in LIBZ:
        Rz = {'zone': z, 'hour': HOURS.get(z, 14.0), 'day': DAY}; R['stops'].append(Rz)
        ok = await load_zone(pg, cdp, z, Rz['hour'], DAY)
        if not check('[%s] 讀到 %s 14:00' % (mode, z), ok):
            Rz['missing'] = [{'why': '沒有這個區域（讀不到）'}]; continue
        await pg.evaluate(HIDE_PLAYER_JS + '(true)')
        r, ppl = await stop_people(pg, mode, Rz, ctl)
        if not check('[%s] %s 有坐著的 NPC' % (mode, z), bool(ppl), str(len(ppl))): continue
        lv = 1 if z == 'library_hall' else None   # 總圖大廳：二樓自習區（第 1 層）
        pl = [s for s in ppl if lv is None or s['lv'] == lv] or ppl
        used = set()
        # ② 低頭看桌子（sitFocus：筆電、筆記、桌上的書；拿書的人看手上的書）
        await seg_close(pg, mode, Rz, pl, z + '_desk', 'desk', ['glance', 'up', 'side'], used=used, fallback=('any',))
        # 手放大腿（手上沒東西的 sit）：身體動的時候有沒有穿過桌子、扶手
        await seg_close(pg, mode, Rz, pl, z + '_lap', 'hair', ['stretch', 'posture', 'look'], used=used, fallback=('chair', 'any'))
        # 同一排同步：自然坐著的人照實記；不到 ROW_MIN 人就補
        nat = best_row(pl)
        Rz['natural_rows'] = [[len(v), v[0]['x'], v[0]['z'], v[0]['lv']] for v in rows_of(pl)]
        info('[%s] %s 自然坐著的同一排（2 人以上）%s；%d 人以上的排 %s' % (mode, z, J(Rz['natural_rows']), ROW_MIN, '有' if nat else '沒有'))
        if not nat:
            await fill_row(pg, Rz, z, lv=lv if lv is not None else (pl[0]['lv']), want=ROW_N)
            r, ppl2 = await stop_people(pg, mode, Rz, ctl, key='seated_after_fill')
            pl2 = [s for s in ppl2 if lv is None or s['lv'] == lv] or ppl2
            nat = best_row(pl2)
        if nat: await seg_sync(pg, mode, Rz, ppl, z + '_sync', nat)
        else: Rz.setdefault('missing', []).append({'seg': z + '_sync', 'why': '補了還是湊不到 %d 人一排' % ROW_MIN})
        await pg.evaluate(UNCAM_JS)


async def loc_tea(pg, cdp, mode, R, ctl):
    Rz = {'zone': 'wz_teahouse', 'hour': 15.0, 'day': DAY}; R['stops'].append(Rz)
    if not check('[%s] 讀到一盞茶屋 15:00' % mode, await load_zone(pg, cdp, 'wz_teahouse', 15.0, DAY)): return
    await pg.evaluate(HIDE_PLAYER_JS + '(true)')
    r, ppl = await stop_people(pg, mode, Rz, ctl)
    if not check('[%s] 一盞有坐著的 NPC' % mode, bool(ppl), str(len(ppl))): return
    fl = [s for s in ppl if s['floor']]
    if not fl: Rz.setdefault('missing', []).append({'seg': 'tea_seiza', 'why': '15:00 沒有跪坐（u.sitFloor）的客人'})
    used = set()
    # ③ 跪坐：身體動的時候手有沒有還放在大腿上（低、斜前方）
    await seg_close(pg, mode, Rz, ppl, 'tea_seiza1', 'floor', ['posture', 'stretch', 'side'], camm='low', used=used, fallback=())
    await seg_close(pg, mode, Rz, ppl, 'tea_seiza2', 'floor', ['look', 'glance', 'hair'], camm='low', used=used, fallback=())
    await seg_close(pg, mode, Rz, ppl, 'tea_chair', 'chair', ['hair', 'look', 'up'], used=used, fallback=())
    await pg.evaluate(UNCAM_JS)


async def loc_eat(pg, cdp, mode, R, ctl):
    z = EAT; h = 12.25
    Rz = {'zone': z, 'hour': h, 'day': DAY}; R['stops'].append(Rz)
    if not check('[%s] 讀到 %s 12:15' % (mode, z), await load_zone(pg, cdp, z, h, DAY)): return
    await pg.evaluate(HIDE_PLAYER_JS + '(true)')
    r, ppl = await stop_people(pg, mode, Rz, ctl)
    if not check('[%s] %s 有坐著的 NPC' % (mode, z), bool(ppl), str(len(ppl))): return
    used = set()
    await seg_close(pg, mode, Rz, ppl, 'eat_1', 'hair', ['look', 'side', 'stretch'], prefer_f=True, used=used, fallback=('any',))
    await seg_close(pg, mode, Rz, ppl, 'eat_2', 'any', ['posture', 'hair', 'glance', 'up'], used=used, fallback=())
    await seg_close(pg, mode, Rz, ppl, 'eat_phone', 'phone', ['page', 'glance'], used=set(), fallback=())
    await pg.evaluate(UNCAM_JS)


async def loc_class(pg, cdp, mode, R, ctl):
    # 課表（雲端只讀 CLS.dayItems 找到的；預設法律系大一上）：霖澤館 201＝2025-09-24（day 8）刑總 09:10～12:10；博思 101＝2025-09-23（day 7）國文 09:10～12:10
    for z, day, label in (('classroom', 8, '霖澤館 201'), ('boya', 7, '博思 101')):
        Rz = {'zone': z, 'hour': 9.5, 'day': day, 'label': label}; R['stops'].append(Rz)
        if not check('[%s] 讀到 %s 上課中（day %d 09:30）' % (mode, label, day), await load_zone(pg, cdp, z, 9.5, day)): continue
        await pg.evaluate(HIDE_PLAYER_JS + '(true)')
        r, ppl = await stop_people(pg, mode, Rz, ctl)
        if not check('[%s] %s 有坐著的同學' % (mode, label), bool(ppl), '%d 人；替身（不會動的 InstancedMesh）%s' % (len(ppl), J(r.get('fig')))): continue
        cls = [s for s in ppl if s['cls'] or s['extra']] or ppl
        if cls[0]['lv'] != (await pg.evaluate("GAME.E.player.lv|0")): await go_level(pg, cls[0])
        # 整排學生（正面全景）：叫兩三個同學做小動作，其他人照自己的
        row = best_row(cls, 2) or cls[:6]
        cam, a = await aim_at(pg, cam_wide(cls))
        tg = [s for s in cls if s['i'] in set(q['i'] for q in row)][:3]
        pl = [[k] for k in (['look', 'stretch', 'posture'] if len(tg) >= 3 else ['look', 'stretch'])][:len(tg)]
        setup('固定鏡頭 %s_rows（教室正面全景）；手動叫 %s' % (z, J([[t['i'], p] for t, p in zip(tg, pl)])))
        await record(pg, mode, z + '_rows', tg, pl, cam, SEG_S, Rz=Rz)
        # 階梯座位的腳有沒有凸出去：側面、低
        cam, a = await aim_at(pg, cam_wide(cls, 'feet'))
        setup('固定鏡頭 %s_feet（側面低角度，看階梯座位的腳）' % z)
        await record(pg, mode, z + '_feet', [], [], cam, SEG_S, top=5, Rz=Rz)
        # 同一排同步
        nat = best_row(cls)
        Rz['natural_rows'] = [[len(v), v[0]['x'], v[0]['z'], v[0]['lv']] for v in rows_of(cls)]
        if nat: await seg_sync(pg, mode, Rz, cls, z + '_sync', nat)
        else: Rz.setdefault('missing', []).append({'seg': z + '_sync', 'why': '沒有 %d 人以上的一排' % ROW_MIN})
        await pg.evaluate(UNCAM_JS)


async def loc_player(pg, cdp, mode, R, ctl):
    # 玩家自己坐下讀書：總圖二樓自習區，玩家旁邊的位子有人
    Rz = {'zone': 'library_hall', 'hour': 14.0, 'day': DAY, 'what': '玩家坐下讀書'}; R['stops'].append(Rz)
    if check('[%s] 讀到總圖大廳 14:00' % mode, await load_zone(pg, cdp, 'library_hall', 14.0, DAY)):
        r, ppl = await stop_people(pg, mode, Rz, ctl)
        seats = await pg.evaluate(SEATS_JS + '(1)')
        occ = [(p['x'], p['z']) for p in ppl if p['lv'] == 1]
        free = [s for s in seats if not any(abs(s['x'] - o[0]) < 0.35 and abs(s['z'] - o[1]) < 0.35 for o in occ)]
        free.sort(key=lambda s: min([math.hypot(s['x'] - o[0], s['z'] - o[1]) for o in occ] + [99]))
        if check('[%s] 二樓有空位' % mode, bool(free), str(len(free))):
            st = free[0]
            setup('GAME.sitAt(玩家, 二樓 (%.2f, %.2f))＋pose read（story3d.js 讀書時 P.pose=\'read\'）：不走座位選單（選「讀書」會淡出快轉）' % (st['x'], st['z']))
            await pg.evaluate("(()=>{ const P=GAME.E.player; if(GAME.E.setLv) GAME.E.setLv(P,1); return true; })()")
            res = await pg.evaluate(PLAYER_SIT_JS + '(' + J([st['k'], 'read']) + ')')
            await pg.evaluate(UNCAM_JS)
            await pg.wait_for_timeout(4000)
            info('[%s] 玩家坐下 %s' % (mode, J(res)))
            await record(pg, mode, 'player_read', ['player'], [['posture', 'page', 'posture', 'page']], None, SEG_S, player=True, Rz=Rz)
            res = await pg.evaluate(PLAYER_SIT_JS + '(' + J([st['k'], 'sit']) + ')')
            await pg.wait_for_timeout(1500)
            await record(pg, mode, 'player_sit', ['player'], [['posture', 'look', 'posture']], None, SEG_S, player=True, Rz=Rz)
            await pg.evaluate("(()=>{ const P=GAME.E.player; GAME.standUp&&GAME.standUp(P); return true; })()")
    # 和坐著的 NPC 說話：兩點半，坐在長椅上看講義的女生（有名字、會說話）
    Rz = {'zone': 'cafe', 'hour': 15.0, 'day': DAY, 'what': '和坐著的 NPC 說話'}; R['stops'].append(Rz)
    if not check('[%s] 讀到兩點半 15:00' % mode, await load_zone(pg, cdp, 'cafe', 15.0, DAY)): return
    r, ppl = await stop_people(pg, mode, Rz, ctl)
    tk = [s for s in ppl if s['talk'] and not s['extra']] or [s for s in ppl if s['talk']]
    if not check('[%s] 有會說話的坐著的 NPC' % mode, bool(tk), J([[s['i'], s['name']] for s in ppl])): return
    s = tk[0]
    setup('玩家放到 #%d %s 前面 1 m（不是走過去），按互動鍵說話' % (s['i'], s['name'] or '(路人)'))
    await pg.evaluate("(([x,z,yaw])=>{ const P=GAME.E.player; const fx=Math.sin(yaw), fz=Math.cos(yaw); let px=x+fx*1.0, pz=z+fz*1.0; if(GAME.E.canStand&&!GAME.E.canStand(px,pz,0.3,0)){ px=x+fx*1.4; pz=z+fz*1.4; } P.obj.position.x=px; P.obj.position.z=pz; P.obj.rotation.y=yaw+Math.PI; P.path=null; P.obj.visible=true; return true; })(" + J([s['x'], s['z'], s['yaw']]) + ")")
    await pg.wait_for_timeout(2500)
    btn = await pg.evaluate("(()=>{ const it=document.getElementById('interact'); return it&&!it.classList.contains('hide')?(it.textContent||'').trim():''; })()")
    info('[%s] 互動鍵：%s' % (mode, J(btn)))
    talked = False
    if btn and ('說' in btn or '聊' in btn or '聽' in btn or (s['name'] and s['name'][:3] in btn)):   # 是「說話」才按（坐下、看東西的按鈕不按）
        await L.tap(pg, cdp, '#interact')
        for _ in range(16):
            await pg.wait_for_timeout(500)
            st = await L.state(pg)
            if st['dlg'] or st['choices']: talked = True; break
    Rz['talk'] = {'btn': btn, 'dialog': talked}
    if not talked:
        setup('對話沒有開起來：改成手動設定注視（n.lookAt＝玩家，和遊戲說話時一樣）＋過肩鏡頭')
        await pg.evaluate("(i=>{ const E=GAME.E, n=E.npcs[i]; n.lookAt=E.player.obj.position; return true; })(" + J(s['i']) + ")")
        cam, a = await aim_at(pg, cam_close(s))
    else:
        cam = None
    await record(pg, mode, 'player_talk', [s], [['look', 'side']], cam, SEG_S, player=True, Rz=Rz)
    for _ in range(30):   # 對話點完（選第一個）
        st = await L.state(pg)
        if st['choices']: await L.tap(pg, cdp, '#choices button')
        elif st['dlg']: await L.tap(pg, cdp, '#dlg')
        else: break
        await pg.wait_for_timeout(700)


async def loc_fps(pg, cdp, mode, R, ctl):
    Rz = {'zone': 'library_hall', 'hour': 14.0, 'day': DAY, 'what': 'FPS'}; R['stops'].append(Rz)
    if not check('[%s] 讀到總圖大廳 14:00' % mode, await load_zone(pg, cdp, 'library_hall', 14.0, DAY)): return
    await pg.evaluate(HIDE_PLAYER_JS + '(true)')
    r = await pg.evaluate(SEATED_JS)
    have = sum(1 for s in r['seated'] if s['lv'] == 1)
    seats = await pg.evaluate(SEATS_JS + '(1)')
    seats0 = await pg.evaluate(SEATS_JS + '(0)')
    total0 = len(r['seated'])
    setup('總圖二樓坐 %d 人：自然二樓 %d 人（整區 %d 人）；二樓只有 %d 個座位（E.zone.seats 第 1 層），先補滿二樓，不夠的補一樓（CHAR.build＋E.addNPC，同一份座位順序、同一個種子）' % (FILL, have, total0, len(seats)))
    res = await pg.evaluate(FILL_JS + '(' + J({'ks': [s['k'] for s in seats] + [s['k'] for s in seats0], 'base': 300, 'pose': 'read', 'want': FILL + (total0 - have)}) + ')')
    left = await pg.evaluate("GAME.E.npcs.filter(n=>(n.pose==='sit'||n.pose==='read')&&(n.lv|0)===1).length")
    info('[%s] 補人 %s → 二樓坐著 %d 人（二樓座位 %d 個）' % (mode, J({k: res.get(k) for k in ('added', 'seated')}), left, len(seats)))
    Rz['fill'] = {'natural': have, 'res': res, 'lv1': left}
    r, ok, secs = await wait_people(pg, ctl, max_s=120)
    lv1 = [s for s in r['seated'] if s['lv'] == 1]
    if lv1: await go_level(pg, lv1[0])
    cam, a = await aim_at(pg, cam_wide(lv1 or r['seated']))
    setup('固定鏡頭（二樓自習區全景，坐著的人都在畫面裡）；遊戲自己的主迴圈（不暫停）')
    await pg.evaluate(SET_CAM_JS + '(' + J(cam) + ')')
    await pg.wait_for_timeout(8000)   # 熱身
    f = await pg.evaluate(FPS_JS + '(' + J({'ms': int(FPS_S * 1000)}) + ')')
    Rz['fps'] = f; Rz['seated'] = len(lv1); Rz['ambOn'] = sum(1 for s in lv1 if s['ambOn'])
    info('[%s] FPS（%d 人坐著、ambOn %d）：平均 %s、每一秒最低 %s、最慢一格 %s ms（%s fps）、1%% low %s；GAME.fps %s；calls %s tris %s 畫面 %s' % (
        mode, len(lv1), Rz['ambOn'], f.get('avg'), f.get('minSec'), f.get('worstMs'), f.get('worstFps'), f.get('p1LowFps'), J(f.get('gameFps')), f.get('calls'), f.get('tris'), J(f.get('canvas'))))
    await pg.screenshot(path=os.path.join(OUT, mode, 'fps_view.jpg'), type='jpeg', quality=80)
    await pg.evaluate(UNCAM_JS)


LOCS = {'cafe': loc_cafe, 'lib': loc_lib, 'tea': loc_tea, 'eat': loc_eat, 'class': loc_class, 'player': loc_player, 'fps': loc_fps}


async def run_mode(p, mode):
    ctl = mode == 'ctl'
    R = {'mode': mode, 'url_extra': '?nositamb' if ctl else '', 'stops': []}
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    if LOC != 'fps' and VIEW:
        w, h = [int(x) for x in VIEW.lower().split('x')]
        await pg.set_viewport_size({'width': w, 'height': h})
    os.makedirs(os.path.join(OUT, mode), exist_ok=True)
    await cc_det.install(pg)
    url = URL + (('&' if '?' in URL else '?') + 'nositamb' if ctl else '')
    print('== %s：%s' % (mode, url), flush=True)
    t1 = time.time(); await pg.goto(url)
    if check('[%s] 遊戲載入' % mode, await L.wait_loaded(pg), '%.0f 秒' % (time.time() - t1)):
        await pg.evaluate("localStorage.clear(); if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}")
        sa = await pg.evaluate("[!!CHAR.sitAmb, typeof CHAR.sitAmbFidget]")
        check('[%s] CHAR.sitAmb=%s（%s）、有 CHAR.sitAmbFidget' % (mode, sa[0], '?nositamb 要 false' if ctl else '一般網址要 true'), sa[0] == (not ctl) and sa[1] == 'function', J(sa))
        try: await LOCS[LOC](pg, cdp, mode, R, ctl)
        except Exception as e:
            import traceback; traceback.print_exc()
            check('[%s] 探針沒有例外' % mode, False, repr(e)[:300])
            try: await pg.screenshot(path=os.path.join(OUT, mode, 'EXC.png'))
            except Exception: pass
    R['js_errors'] = errs[:10]
    check('[%s] 沒有 JS 例外' % mode, not errs, J(errs[:3]))
    R['secs'] = round(time.time() - t1, 1)
    await b.close()
    return R


def coverage(R):
    """每一種動作實際開始了沒（一般網址：sitAmbFidget 回 true、m.fx 是那一種，而且下一格還在＝沒被同桌聊天蓋掉）"""
    got = {}
    for st in R['stops']:
        for sg in st.get('segs', []):
            for q in sg['fid']:
                if q['ok'] is True and q.get('live'): got.setdefault(q['got'] or '?', []).append(sg['tag'])
    return got


async def main():
    os.makedirs(OUT, exist_ok=True)
    modes = {'0': ['amb'], '1': ['ctl']}.get(CTL, ['amb', 'ctl'])
    print('CC SITAMB 探針 LOC=%s CTL=%s modes=%s；SHA=%s；CC_SEED=%s；SEG_S=%g REC_FPS=%g KINDS=%s VIEW=%s；Windows＋GPU（Playwright 有視窗）≠ iPhone；只記錄、不判（BB-C 14:41）' % (
        LOC, CTL, ','.join(modes), E_('SHA', '?'), SEED, SEG_S, REC_FPS, ','.join(KINDS), VIEW), flush=True)
    if LOC not in LOCS:
        check('LOC 是 %s 之一' % '/'.join(LOCS), False, LOC); sys.exit(1)
    REP = {'loc': LOC, 'sha': E_('SHA'), 'seed': SEED, 'seg_s': SEG_S, 'rec_fps': REC_FPS, 'kinds': KINDS, 'view': VIEW, 'runs': []}
    async with async_playwright() as p:
        for m in modes:
            R = await run_mode(p, m); REP['runs'].append(R)
            if m == 'amb':
                cv = coverage(R); R['coverage'] = cv
                miss = [k for k in KINDS if k not in cv]
                info('[amb] 每種動作實際開始了：%s；沒做到：%s' % (J({k: len(v) for k, v in cv.items()}), J(miss)))
                for st in R['stops']:
                    for x in st.get('missing', []) + st.get('skipped', []): info('[amb] %s 缺：%s' % (st['zone'], J(x)))
    fps = [st['fps'] for R in REP['runs'] for st in R['stops'] if st.get('fps')]
    if len(fps) == 2 and fps[0].get('avg') and fps[1].get('avg'):
        drop = (fps[1]['avg'] - fps[0]['avg']) / fps[1]['avg'] * 100.0
        REP['fps_drop_pct'] = round(drop, 2)
        info('FPS 一般 %s／?nositamb %s：平均掉 %.1f%%（BB-C 14:41：> 15%% 或最低 < 30 算 FAIL，BB 判）；每一秒最低 一般 %s、?nositamb %s' % (fps[0]['avg'], fps[1]['avg'], drop, fps[0].get('minSec'), fps[1].get('minSec')))
    REP['secs'] = round(time.time() - T0, 1)
    with open(os.path.join(OUT, 'sitamb_%s.json' % LOC), 'w', encoding='utf-8') as fh: json.dump(REP, fh, ensure_ascii=False, indent=1)
    info('總共 %.0f 秒；JSON：sitamb_%s.json' % (time.time() - T0, LOC))
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS)), flush=True)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
