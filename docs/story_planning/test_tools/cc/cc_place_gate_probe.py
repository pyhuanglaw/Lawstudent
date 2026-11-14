"""CC-C 11-12：地點關卡第二層（D154／HV-35；PLACE-GATE-TOOL-1112；規則 RULE_SOURCE 42926c764f docs/rules/ROLE_BB.md 2.6、ROLE_CC.md 2.3）。
起因：使用者 11-12 線上版自己玩 10 分鐘就看到——泰米村食沒店員沒客人、窗戶一片深藍、東南大聯沒天花板、新生南路店外看進去是一張 2D 圖、日常失速一直閃。
這支每個地點（ZONES，區域 id）白天、晚上（HOURS，預設 14、20.5）各走進去一次，機器先判七項（判定歸 BB；判不出來＝UNKNOWN，存圖、exit 1，不准猜成 PASS——ROLE_CC 2.3 第 9 點）：
  ① 店員、客人：櫃檯類互動點（點餐／結帳／櫃台…）2 m 內有 NPC＝店員；其他 NPC＝客人。數字照記，判定照第一層對（這支只標「營業中沒有店員」）。
  ② 往窗外：找區域裡窗玻璃的網格（名字或材質名有 glass／window／窗，或透明材質），投影到「往窗外」那張的畫面上；框內同一色（每通道 32 級量化）超過 80%＝沒窗景（FAIL）；
     找不到窗的網格＝UNKNOWN（標出來給 BB 看圖）。
  ③ 天花板：房間中間 1.6 m 往上打一條射線，6 m 內打到網格＝有；沒打到而且往上拍那張「天空色」≥30%＝沒天花板（FAIL）；沒打到、天空色不到＝UNKNOWN。
  ④ 純色／洋紅：每張洋紅像素（r>170、b>140、g<90）≥0.5%＝FAIL；最大的同一色區塊 ≥60%＝標出來（UNKNOWN，給 BB 看是不是牆）。
  ⑤ 店外往裡看立不立體：門外 spawn 往門看拍三張（中、左右各 1.5 m，給 BB 看）；機器判用射線：從店外往門面打 24×16 條（略過玻璃、半透明、人），門面後面 0.8 m 以上還打得到東西的比例 deep < PAR_LO＝平面（FAIL）；
     > PAR_HI＝有立體（PASS）；中間＝UNKNOWN。門檻用有問題的版本校正（dc3d 新生南路 xs 櫥窗、1cd2 泰米）；像素差只當參考。
  ⑥ 閃：①、② 兩個鏡頭各轉 0.05° 前後兩張逐點比（同 cc_shop_flicker_probe），亮度差 >40 的像素比例 ≥ZF_HI＝閃（FAIL）、≤ZF_LO＝PASS、中間 UNKNOWN；
     另外走動＋轉鏡頭 5 秒連拍（每 0.2 秒，遊戲鏡頭），8×8 區塊亮度來回跳 ≥3 次的區塊數照記（給 BB 看）。
  ⑦ 做得到：點餐／買一樣（選單照字選第一個能點的、再「點好了」；錢有扣或說了話）、坐下（第一張位子，D.sit_all）、走到「離開…」按了換區域；主控台 console.error＋pageerror 0。
  每間每個時間一張拼圖 gate_<區域>_<時間>.jpg（標★的是機器判 FAIL／UNKNOWN 的項目）＋ gate.json。
【前置／捷徑】load_zone 讀檔進店（區域出生點）／門外（出口的 spawn）；5 秒連拍的轉鏡頭直接設 E.cam.yaw（只為了看閃）。Windows＋GPU（Playwright 有視窗）≠ iPhone。
11-12 BB-C 14:43：⑥ 機器判改看藏人那一輪連拍（有人那一輪翻的多半是客人在走，只記、也切條圖 strip_*_people_*）。
11-12 BB-C 15:21：③ 櫃檯鏡頭改從門口方向看（退 min(2.5, 到門口距離×0.8) m）；⑦b 店外取色框往內往下收到玻璃以內。
CC_02 清單 2026-11-13：1✓（營業時間：讀檔進不去＝記「沒開」跳過，不判） 2✓（房間、門、櫃檯、窗網格全從遊戲當下讀） 3✓（點餐選單照順序試第一個能點的；位子取第一張） 4✓（選單照字、按互動鍵前看字） 5✓（go_to 分段、到了看互動鍵） 6✓（等 ASSETS 載完再拍） 7✓ 8✓（門檻：80%／30%／0.5% 是規則原文或 CC 訂的參考值；天花板以往上拍天空≥30% 為準（bd86 東南大聯校正）；窗改「最大那塊和中間色差 ≤16 的比例」、店外改射線深度、閃改看連拍（PC GATE_CAL 1cd2／bd86／2771 兩輪校正，探針錯誤記 CC_02 乙8）；視差、閃的門檻先在有問題的版本校正，判不出來＝UNKNOWN） 9✓（拍照鏡頭先跑 fadeWalls；進門、櫃檯照不藏玩家；②窗、⑤店外藏玩家與路人） 10✓ 11✓ 12✓（每項記證據數字；⑥連拍圈翻動格子＋藏人再拍、①b 近照（BB-C 07:19）；⑦b 店外窗內 vs 進門全景 牆／地板平均色（使用者 06:4x）；⑤射線只略過玻璃／半透明、記打到的網格名字（X352 r1 修）、判法改門面後深度分散（X352 r2）；⑦b 店外窗框只取門口 4.5 m 內、投影不到用固定框（X352_CON r1）；⑦b 進門那張藏人（連 n.hidden 一起設：引擎每幀照 n.hidden 重設 visible，XS_REAL_cal_old_r3 店員沒藏到）、牆框下移、改 Lab Δab，⑤ 射線只打櫥窗那一塊（XS_REAL r1）；窗範圍改用射線找玻璃（南洋 r1）、有 Z3.shopWindowRects 用店自己的櫥窗四角（LAWWW-C 08:23）；框太小（<6% 或寬 <15%）換下一個來源（TZ_REAL_consist 框到店外展示台）；⑤加店外連拍 outside_burst（只記）；STRIPS=1 藏人那一輪每個翻動格子切 12 張條圖（BB-C 10:23）；①b 店員站進家具、客人臉對牆＝BB-C 05:26 ③） 13✓
用法：LW_TESTS=<wt>/tests SHA=<sha> TAG=<名字> ZONES=tz_taimi,… [HOURS=14,20.5] [PARTS=1,2,3,4,5,6,7] [PAR_LO=0.05 PAR_HI=0.15 WIN_LO=40 WIN_HI=55 BURST_FAIL=3] python3 cc_place_gate_probe.py <url> <out>"""
import os, sys, json, asyncio, base64, math, time, re
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
SHA = os.environ.get('SHA') or ''
TAG = os.environ.get('TAG') or 'x'
ZONES = [z for z in (os.environ.get('ZONES') or 'tz_taimi').split(',') if z]
HOURS = [float(h) for h in (os.environ.get('HOURS') or '14,20.5').split(',') if h]
PARTS = set((os.environ.get('PARTS') or '1,2,3,4,5,6,7').split(','))
# 11-13 BB-C／LAWWW-C（ab9ab0fbe8 L118 cam_dist 3.6）：ENTERCAM=1＝從門外照玩家走到門口按進去，進門那一下（0／0.4／1／2 秒）鏡頭到頭之間有沒有被擋；
#   ALLSEATS=1＝⑦ 每一張位子都坐（不只第一張），坐下以後鏡頭到頭之間有沒有被擋（牆、門框）。都只記＋截圖，判定歸 BB。
ENTERCAM = (os.environ.get('ENTERCAM') or '0') == '1'; ALLSEATS = (os.environ.get('ALLSEATS') or '0') == '1'; SEAT_AP_ONLY = (os.environ.get('SEAT_AP_ONLY') or '0') == '1'
GATE_FLAGS = [k for k in (os.environ.get('GATE_FLAGS') or '').split(',') if k]   # BB-C 11-14：讀進店以後墊成 true 的旗標（例 LM_STUDY）
SEAT_ONLY = [tuple(float(v) for v in s.split(',')) for s in (os.environ.get('SEAT_ONLY') or '').split('/') if s]   # BB-C 11-14 WZ_LIN_SEAT_r2：只點這幾張（x,z/x,z）   # BB-C 11-14 TZ_SEAT：ALLSEATS 只點有走近點（ap）的
OCC_JS = r"""(()=>{ const E=GAME.E, P=E.player.obj, cam=E.camera; const rc=new THREE.Raycaster(); rc.camera=cam;
  const head=new THREE.Vector3(P.position.x,P.position.y+1.5,P.position.z), from=cam.getWorldPosition(new THREE.Vector3()), dir=head.clone().sub(from); const dist=dir.length(); rc.set(from, dir.normalize()); rc.far=Math.max(0,dist-0.35);
  const mine=new Set(); P.traverse(o=>mine.add(o)); const skip=o=>{ if(mine.has(o)||o.visible===false||o.isSprite) return true; const m=o.material; if(!m) return false; const ms=Array.isArray(m)?m:[m];
    return ms.every(x=>x.transparent&&x.opacity<0.6) || /glass|window|窗/i.test((o.name||'')+' '+ms.map(x=>x.name||'').join(' ')); };
  let vis=true; for(let q=P; q; q=q.parent) if(q.visible===false) vis=false;
  const h=rc.intersectObjects(E.scene.children,true).find(x=>!skip(x.object)&&x.object.isMesh);
  const r2=v=>+(+v).toFixed(2); return {cam:[r2(from.x),r2(from.y),r2(from.z)], head:[r2(head.x),r2(head.y),r2(head.z)], camDist:r2(dist), hit:h?{name:h.object.name||(h.object.parent&&h.object.parent.name)||'?', d:r2(h.distance)}:null, zone:G_zone()};
  function G_zone(){ try{ return GAME.G.zone; }catch(e){ return null; } } })()"""
PAN = (os.environ.get('PAN') or '0') == '1'   # BB-C 11:38：預設連拍鏡頭完全固定；PAN=1＝舊做法（每格轉 0.01 rad）
STRIPS = (os.environ.get('STRIPS') or '0') == '1'   # BB-C 10:23：每個翻動的格子切成條圖（同一格 12 張並排、每張時間戳），分陰影跳／窗外車人／疊面閃
PAR_LO, PAR_HI = float(os.environ.get('PAR_LO') or '0.05'), float(os.environ.get('PAR_HI') or '0.15')   # 射線：門面後面還有東西的比例
SPR_LO, SPR_HI = float(os.environ.get('SPR_LO') or '0.3'), float(os.environ.get('SPR_HI') or '0.8')   # ⑤ 門面後面打到的深度分散 p90−p10（m，暫定，等大步新舊 r3 校正）
CON_LO, CON_HI = float(os.environ.get('CON_LO') or '8'), float(os.environ.get('CON_HI') or '18')   # ⑦b 店外 vs 進門 牆／地板平均色的 Lab Δab（色調＋飽和度，不看亮度；暫定，等 dc3d 大步灰牆 vs 木牆校正）
WIN_LO, WIN_HI = float(os.environ.get('WIN_LO') or '40'), float(os.environ.get('WIN_HI') or '55')   # 窗：最大那塊和中間色差 ≤16 的比例（%）
ZF_LO, ZF_HI = float(os.environ.get('ZF_LO') or '0.3'), float(os.environ.get('ZF_HI') or '1.5')   # 只當參考（校正 r2）
BURST_FAIL = int(os.environ.get('BURST_FAIL') or '3')
NODEBUG = (os.environ.get('NODEBUG') or '0') == '1'
ORDER_POOR = (os.environ.get('ORDER_POOR') or '') == '1'   # BB-C 01:45：點餐選第一項（不選「不點、要水」）、檢查有扣錢；另外先用 10 元打開選單看錢不夠的選項是不是灰的
SPAWN = [float(v) for v in (os.environ.get('SPAWN') or '').split(',') if v]   # BB-C 01:32（木曜日 2F）：讀檔站的位置 x,z[,lv]——二樓的店從樓梯間出生，①～③ 鏡頭拍不到店內，改站二樓
CUST_HOURS = [float(x) for x in (os.environ.get('CUST_HOURS') or '').split(',') if x]; MIN_CUST = int(os.environ.get('MIN_CUST') or 1)   # BB-C 11-14：這幾個時間要看客人（0 人＝FAIL）
DEBUGTXT_JS = r"""(()=>{ const re=/career\s*A\s*\d|\bA\d+\s+B\d+\s+C\d+\b|\bfps\s*[:=]?\s*\d|\bdraw\s*calls?\b/i, hits=[];
  for(const el of document.querySelectorAll('body *')){ if(el.children.length) continue; const t=(el.textContent||'').trim(); if(!t||!re.test(t)) continue; const c=getComputedStyle(el); if(c.display==='none'||c.visibility==='hidden'||+c.opacity<0.05) continue;
    const r=el.getBoundingClientRect(); if(!r.width||!r.height||r.right<0||r.bottom<0||r.left>innerWidth||r.top>innerHeight) continue; hits.push({id:el.id||'',cls:String(el.className||'').slice(0,40),t:t.slice(0,60),x:Math.round(r.left),y:Math.round(r.top)}); }
  return {url:location.search||'(沒有參數)', hits:hits.slice(0,8)}; })()"""
R = L.Run('gate_' + TAG, OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
DAY = os.environ.get('DAY') or '2025-10-22'   # BB-C 09:45（BB_379 木曜日 r3 TEST_SETUP）：10/22 是期中考週，木曜日進「考試週坐滿」模式——可以改日期
SEAT_BARSIDE = (os.environ.get('SEAT_BARSIDE') or '0') == '1'
US_DIAG = (os.environ.get('US_DIAG') or '0') == '1'   # BB-C 10:14（BB_379 美國兩間沒店員 P1）：讀檔後記 SH831.staffed、G 的日期時間、店裡全部 NPC（店員 id 61／62／63）
US_DIAG_JS = r"""(z=>{ const G=GAME.G, f=v=>+(+v).toFixed(2); let st=null; try{ st=typeof SH831==='undefined'?'沒有 SH831':(SH831.staffed?SH831.staffed(z,G):'沒有 staffed'); }catch(e){ st='ERR '+e.message; }
  const d=CALENDAR.dateOf(G.day); let us=null; try{ us=typeof US!=='undefined'&&US.inUS?!!US.inUS(G):null; }catch(e){ us='ERR'; }
  const N=Object.entries(GAME.npc||{}).map(([k,n])=>({key:k, id:n&&(n.id||n.charId)||null, num:n&&(n.num!=null?n.num:(n.cid!=null?n.cid:null)), clerk:!!(n&&(n.clerk||n.clerkFlag)), x:n&&n.obj?f(n.obj.position.x):null, z:n&&n.obj?f(n.obj.position.z):null, hidden:!!(n&&n.hidden)}));
  const E=(GAME.E.npcs||[]).map(n=>({id:n.id||n.charId||null, num:n.num!=null?n.num:null, clerk:!!(n.clerk||n.clerkFlag), x:n.obj?f(n.obj.position.x):null, z:n.obj?f(n.obj.position.z):null, hidden:!!n.hidden, vis:n.obj?n.obj.visible!==false:null}));
  return {zone:G.zone, staffed:st, key:d.key, wd:d.wd, hour:f(G.hour), inUS:us, gameNpc:N, eNpcs:E}; })"""
US_CLERK_JS = r"""(()=>{ const E=GAME.E, f=v=>+(+v).toFixed(2); const inE=new Set(E.npcs||[]);
  const all=Object.entries(GAME.npc||{}).map(([k,n])=>({k,n})).concat((E.npcs||[]).filter(n=>!Object.values(GAME.npc||{}).includes(n)).map(n=>({k:null,n})));
  const C=all.filter(({n})=>n&&(n.clerk||n.clerkFlag||[61,62,63].includes(n.num)||[61,62,63].includes(n.cid))).map(({k,n})=>({key:k, id:n.id||n.charId||null, num:n.num!=null?n.num:(n.cid!=null?n.cid:null), inNpcs:inE.has(n), hidden:!!n.hidden, hasObj:!!n.obj, parent:n.obj?(n.obj.parent?(n.obj.parent.name||n.obj.parent.type):null):null, inScene:n.obj?(()=>{ let q=n.obj; while(q.parent) q=q.parent; return q===E.scene; })():false, visible:n.obj?n.obj.visible!==false:null, x:n.obj?f(n.obj.position.x):null, z:n.obj?f(n.obj.position.z):null}));
  const cam=E.camera, d=new THREE.Vector3(); try{ cam.getWorldDirection(d); }catch(e){} const P=E.player&&E.player.obj;
  return {gmZone:(GAME.G&&GAME.G.zone)||null, eZone:E.zone&&E.zone.def?E.zone.def.id:null, nNpcs:(E.npcs||[]).length, cam:cam?{pos:[f(cam.position.x),f(cam.position.y),f(cam.position.z)], dir:[f(d.x),f(d.y),f(d.z)]}:null, player:P?[f(P.position.x),f(P.position.z)]:null, clerks:C}; })()"""
SIDE_OFF = float(os.environ.get('SIDE_OFF') or 0)   # BB-C 11-14 LIMAO_PARALLAX_r2：⑤ 店外左右固定平移這麼多公尺（例 0.8），站不站得住都照拍；0＝照舊 1.5／1.0／0.6   # BB-C 09:45 ②：考試週只驗「坐吧檯旁邊」那一個位子（MOKS.barSide），要真的坐下（ok）才算
SETTLED = "(async()=>{ for(let i=0;i<120;i++){ const A=ASSETS; const n=Object.keys(A.status).filter(k=>!A.cache[k]&&!A.errors.some(e=>e.startsWith(k+':'))).length; if(!n) return i; await new Promise(r=>setTimeout(r,250)); } return -1; })()"
ROOM_JS = r"""(()=>{ const E=GAME.E, N=E.nav, f=v=>+(+v).toFixed(2); let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9,n=0;
  if(N&&N.cols){ for(let j=0;j<N.rows;j++) for(let i=0;i<N.cols;i++){ const w=N.toWorld(i,j); if(E.canStand(w[0],w[1],0.3,0)){ n++; x0=Math.min(x0,w[0]); x1=Math.max(x1,w[0]); z0=Math.min(z0,w[1]); z1=Math.max(z1,w[1]); } } }
  const IT=(E.interactables||[]).filter(i=>!i.hidden); const lab=i=>String(typeof i.label==='function'?i.label():i.label||'');
  const ex=IT.filter(i=>i.exit).sort((a,b)=>(lab(b).startsWith('離開')?1:0)-(lab(a).startsWith('離開')?1:0))[0]||null;
  const CTW=[/點餐|點飲料|點菜/,/結帳|收銀/,/買|店員|老闆/,/吧台|吧檯|櫃/]; const ctr=i=>{ const k=CTW.findIndex(r=>r.test(lab(i))); return k<0?99:k; };   // 11-13 BB-C：辛亥韓食先挑到「小菜櫃」（只看旁白、不點餐）＝點餐、結帳類優先
  const ct=IT.filter(i=>!i.exit&&!i.seat&&ctr(i)<99).sort((a,b)=>ctr(a)-ctr(b))[0]||null;
  const seat=IT.filter(i=>i.seat)[0]||null;
  return {n, box:n?[f(x0),f(x1),f(z0),f(z1)]:null, c:n?[f((x0+x1)/2),f((z0+z1)/2)]:null, exit:ex?{x:f(ex.x),z:f(ex.z),label:lab(ex),to:ex.exit.to||null,spawn:ex.exit.spawn||null}:null,
    counter:ct?{x:f(ct.x),z:f(ct.z),label:lab(ct)}:null, seat:seat?{x:f(seat.seat.x),z:f(seat.seat.z),label:lab(seat)}:null, name:(E.zone&&E.zone.name)||GAME.G.zone}; })()"""
PEOPLE_JS = r"""(a=>{ const E=GAME.E, f=v=>+(+v).toFixed(2); const ex=new Set(); for(const n of (E.npcs||[])) if(n.obj) n.obj.traverse(o=>ex.add(o)); if(E.player&&E.player.obj) E.player.obj.traverse(o=>ex.add(o));
  const rc=new THREE.Raycaster(); const face=n=>{ const ry=n.obj.rotation.y, o=n.obj.position; rc.set(new THREE.Vector3(o.x,o.y+1.5,o.z), new THREE.Vector3(Math.sin(ry),0,Math.cos(ry))); rc.far=3;
    const h=rc.intersectObjects(E.scene.children,true).find(x=>!ex.has(x.object)&&x.object.visible!==false); return h?f(h.distance):null; };
  const P=(E.npcs||[]).filter(n=>n&&n.obj&&!n.hidden&&(n.hidden!==undefined||n.obj.visible!==false)).map(   /* 11-13 BB-C ⑧：在不在場看 n.hidden（遊戲自己的），obj.visible 會被遠近切換關掉 */n=>({id:n.charId||n.id||'', x:f(n.obj.position.x), z:f(n.obj.position.z), clerkFlag:!!n.clerk, pose:n.pose||null, seat:!!n.seat,
    stand:E.canStand?!!E.canStand(n.obj.position.x,n.obj.position.z,0.2,n.lv|0):null, face_m:face(n)}));
  const clerk=a?P.filter(p=>Math.hypot(p.x-a.x,p.z-a.z)<2||p.clerkFlag):P.filter(p=>p.clerkFlag); const cust=P.filter(p=>!clerk.includes(p));
  /* BB-C 05:26 ③：店員有沒有站進櫃檯／貨架裡（站的那一點站不住＝在家具裡；坐著的不算）；新加的客人是不是臉對空牆（頭的高度往正前方 0.45 m 內就撞到東西）*/
  /* BB-C 11:53（20998a0887）：店員站在櫃台後面（櫃台 2.5 m 內、那一格在導航上擋著）、坐著的客人面向窗邊吧檯——這兩種看圖都是 PASS，不再算 */
  /* BB-C 01:32（洋洋 1b TEST_BUG）：滷味展示台比櫃台寬——走道判斷放到 1.8 m */
  /* BB-C 01:11（GATE2 青木 1b TEST_BUG）：店員在櫃台後面但離「櫃台」互動點 >2.5 m（或沒抓到櫃台點）也照櫃台後面算——clerkFlag 的店員、1.2 m 內有一格站得住（＝櫃台另一側是走道），就是站在櫃台後面那一側，不算在家具裡 */
  const nearFloor=p=>{ if(!E.canStand) return false; for(let k=0;k<16;k++){ const t=k*Math.PI/8; for(const r of [0.6,0.9,1.2,1.5,1.8]) if(E.canStand(p.x+Math.cos(t)*r,p.z+Math.sin(t)*r,0.2,0)) return true; } return false; };
  const behindCounter=p=>(!!a&&clerk.includes(p)&&Math.hypot(p.x-a.x,p.z-a.z)<2.5)||(p.clerkFlag&&nearFloor(p));
  const inFurn=P.filter(p=>!p.seat&&p.stand===false&&!behindCounter(p)), wall=cust.filter(p=>!p.seat&&p.face_m!=null&&p.face_m<0.45);
  return {total:P.length, clerk:clerk.length, customers:cust.length, clerk_in_furniture:inFurn.map(p=>[p.id,p.x,p.z]), face_wall:wall.map(p=>[p.id,p.x,p.z,p.face_m]), people:P.slice(0,12)}; })"""
# 拍照：另一台相機（先跑 fadeWalls，同 cc_tingzhou_probe）；同時回傳窗玻璃網格投影到畫面上的框（0～1）
SNAPX = r"""(a=>{ const E=GAME.E, r=E.renderer, c=r.domElement; const cam=new THREE.PerspectiveCamera(a.fov||60, c.width/c.height, 0.05, 400); cam.position.set(...a.from); cam.lookAt(...a.at); cam.updateMatrixWorld(true); cam.updateProjectionMatrix();
  const z=E.zone, P=E.player&&E.player.obj; if(z&&z.fadeWalls){ try{ z.fadeWalls(cam,P?P.position:cam.position); if(E.hideFaded) E.hideFaded(); }catch(e){} }
  const rects=[]; if(a.win){ const isWin=o=>{ const m=o.material, mn=(m&&(Array.isArray(m)?m.map(x=>x&&x.name).join(' '):m.name))||''; return /glass|window|窗|vitrine/i.test((o.name||'')+' '+mn)||(m&&!Array.isArray(m)&&m.transparent&&m.opacity<0.9&&m.opacity>0.05); };
    const root=(z&&z.group)||E.scene; root.traverse(o=>{ if(!o.isMesh||!o.visible||!isWin(o)) return; const b=new THREE.Box3().setFromObject(o); if(b.isEmpty()) return; const pts=[];
      if(a.box){ const cx=(b.min.x+b.max.x)/2, cz=(b.min.z+b.max.z)/2, B=a.box; if(Math.min(cx-B[0],B[1]-cx,cz-B[2],B[3]-cz)>0.6) return; }   /* 11-14 BB-C（BB_379 禮貌生財 2_window TEST_BUG）：② 只認靠牆（離房間邊 0.6 m 內）的玻璃＝窗；店裡的玻璃展示櫃（S_glass）不算 */
      if(a.near){ const cx=(b.min.x+b.max.x)/2, cz=(b.min.z+b.max.z)/2; if(Math.hypot(cx-a.near[0],cz-a.near[1])>a.near[2]||(b.max.x-b.min.x)>9||(b.max.z-b.min.z)>9) return; }   /* ⑦b：店外只要這間店門口附近的窗（X352_CON r1：整條街的玻璃投影成整個畫面）*/
      for(const x of [b.min.x,b.max.x]) for(const y of [b.min.y,b.max.y]) for(const zz of [b.min.z,b.max.z]){ const v=new THREE.Vector3(x,y,zz).project(cam); if(v.z<1&&v.z>-1) pts.push([(v.x+1)/2,(1-v.y)/2]); }
      if(pts.length<2) return; let x0=Math.max(0,Math.min(...pts.map(p=>p[0]))), x1=Math.min(1,Math.max(...pts.map(p=>p[0]))), y0=Math.max(0,Math.min(...pts.map(p=>p[1]))), y1=Math.min(1,Math.max(...pts.map(p=>p[1])));
      if(x1-x0>0.03&&y1-y0>0.03) rects.push([+x0.toFixed(3),+y0.toFixed(3),+x1.toFixed(3),+y1.toFixed(3),String(o.name||'').slice(0,24)]); }); }
  try{ r.render(E.scene,cam); return {u:c.toDataURL('image/png'), rects}; } finally { if(z&&z.fadeWalls&&E.camera){ try{ z.fadeWalls(E.camera,P.position); if(E.hideFaded) E.hideFaded(); }catch(e){} } } })"""
ANA_JS = r"""(async a=>{ const im=await new Promise(res=>{ const q=new Image(); q.onload=()=>res(q); q.src=a.u; }); const W=200, H=Math.round(200*im.height/im.width);
  const k=document.createElement('canvas'); k.width=W; k.height=H; const g=k.getContext('2d'); g.drawImage(im,0,0,W,H); const d=g.getImageData(0,0,W,H).data;
  const bin=(x0,y0,x1,y1)=>{ const m=new Map(); let n=0; for(let y=Math.floor(y0*H);y<Math.ceil(y1*H);y++) for(let x=Math.floor(x0*W);x<Math.ceil(x1*W);x++){ const o=(y*W+x)*4, key=(d[o]>>3)+'_'+(d[o+1]>>3)+'_'+(d[o+2]>>3); m.set(key,(m.get(key)||0)+1); n++; }
    let best=0, bk=null; for(const [kk,v] of m) if(v>best){ best=v; bk=kk; } let ed=0, ne=0; const L=o=>0.299*d[o]+0.587*d[o+1]+0.114*d[o+2];
    for(let y=Math.floor(y0*H);y<Math.ceil(y1*H);y++) for(let x=Math.floor(x0*W);x<Math.ceil(x1*W)-1&&x<W-1;x++){ const o=(y*W+x)*4; ne++; if(Math.abs(L(o)-L(o+4))>12) ed++; }
    const R_=[],G_=[],B_=[]; for(let y=Math.floor(y0*H);y<Math.ceil(y1*H);y++) for(let x=Math.floor(x0*W);x<Math.ceil(x1*W);x++){ const o=(y*W+x)*4; R_.push(d[o]); G_.push(d[o+1]); B_.push(d[o+2]); }
    const md=A=>{ const q=A.slice().sort((p,r)=>p-r); return q[q.length>>1]||0; }, mr=md(R_), mg=md(G_), mb=md(B_); let nm=0; for(let i=0;i<R_.length;i++) if(Math.max(Math.abs(R_[i]-mr),Math.abs(G_[i]-mg),Math.abs(B_[i]-mb))<=16) nm++;
    return {top_pct:n?+(best*100/n).toFixed(1):0, top_rgb:bk?bk.split('_').map(v=>v*8+4):null, n, edge_pct:ne?+(ed*100/ne).toFixed(1):0, near_med_pct:R_.length?+(nm*100/R_.length).toFixed(1):0, med:[mr,mg,mb]}; };
  let mag=0, sky=0, n3=0; for(let i=0;i<d.length;i+=4){ if(d[i]>170&&d[i+2]>140&&d[i+1]<90) mag++; } for(let y=0;y<Math.floor(H/3);y++) for(let x=0;x<W;x++){ const o=(y*W+x)*4; n3++; if(d[o+2]>d[o]+20&&d[o+2]>=d[o+1]&&d[o+2]>=60) sky++; }
  let skyAll=0; for(let i=0;i<d.length;i+=4){ if(d[i+2]>d[i]+20&&d[i+2]>=d[i+1]&&d[i+2]>=60) skyAll++; }
  return {magenta_pct:+(mag*100/(W*H)).toFixed(2), sky_top_pct:+(sky*100/n3).toFixed(1), sky_all_pct:+(skyAll*400/d.length).toFixed(1), whole:bin(0,0,1,1), rects:(a.rects||[]).map(r=>Object.assign({rect:r},bin(r[0],r[1],r[2],r[3])))}; })"""
CROPDIFF_JS = r"""(async a=>{ const load=u=>new Promise(res=>{ const q=new Image(); q.onload=()=>res(q); q.src=u; }); const ims=await Promise.all(a.us.map(load)); const W=120, H=Math.round(120*ims[0].height/ims[0].width);
  const px=ims.map(im=>{ const k=document.createElement('canvas'); k.width=W; k.height=H; const g=k.getContext('2d'); g.drawImage(im,0,0,W,H); return g.getImageData(Math.floor(W*0.35),Math.floor(H*0.35),Math.ceil(W*0.3),Math.ceil(H*0.3)).data; });
  const md=(A,B)=>{ let s=0,n=0; for(let i=0;i<A.length;i+=4){ s+=Math.abs(A[i]-B[i])+Math.abs(A[i+1]-B[i+1])+Math.abs(A[i+2]-B[i+2]); n+=3; } return +(s/n).toFixed(2); };
  return {lc:md(px[0],px[1]), cr:md(px[1],px[2]), lr:md(px[0],px[2])}; })"""
ZF_JS = r"""(a=>{ const E=GAME.E, r=E.renderer, c=r.domElement, W=200, H=Math.round(200*c.height/c.width); const k=document.createElement('canvas'); k.width=W; k.height=H; const g=k.getContext('2d',{willReadFrequently:true});
  const cam=new THREE.PerspectiveCamera(60, c.width/c.height, 0.05, 400); const z=E.zone, P=E.player&&E.player.obj;
  const shot=yaw=>{ cam.position.set(...a.from); cam.rotation.set(0,0,0); cam.lookAt(...a.at); cam.rotateY(yaw); cam.updateMatrixWorld(true); if(z&&z.fadeWalls){ try{ z.fadeWalls(cam,P?P.position:cam.position); if(E.hideFaded) E.hideFaded(); }catch(e){} } r.render(E.scene,cam); g.drawImage(c,0,0,W,H); return g.getImageData(0,0,W,H).data; };
  const out=[]; for(let i=0;i<12;i++){ const b=(i-6)*0.004; const A=shot(b), B=shot(b+0.05*Math.PI/180); let n=0,m=0; for(let y=Math.floor(H*0.15);y<Math.floor(H*0.85);y++) for(let x=Math.floor(W*0.15);x<Math.floor(W*0.85);x++){ const o=(y*W+x)*4; const la=0.299*A[o]+0.587*A[o+1]+0.114*A[o+2], lb=0.299*B[o]+0.587*B[o+1]+0.114*B[o+2]; m++; if(Math.abs(la-lb)>40) n++; } out.push(+(n*100/m).toFixed(3)); }
  if(z&&z.fadeWalls&&E.camera){ try{ z.fadeWalls(E.camera,P.position); if(E.hideFaded) E.hideFaded(); }catch(e){} } r.render(E.scene,E.camera); const s=out.slice().sort((x,y)=>x-y); return {pct:out, median:s[6], max:s[11]}; })"""
CEIL_JS = r"""(a=>{ const E=GAME.E, rc=new THREE.Raycaster(new THREE.Vector3(a[0],(a[2]||0)+1.6,a[1]), new THREE.Vector3(0,1,0), 0.05, 6); const ex=new Set(); const P=E.player&&E.player.obj; if(P) P.traverse(o=>ex.add(o)); for(const n of (E.npcs||[])) if(n.obj) n.obj.traverse(o=>ex.add(o));
  const hs=rc.intersectObjects(E.scene.children,true).filter(x=>x.object.visible!==false&&!ex.has(x.object)); const h=hs[0];
  const nm=x=>String(x.object.name||(x.object.parent&&x.object.parent.name)||''); const ce=hs.find(x=>/^CEIL_/i.test(nm(x))&&!/light|lamp|glow|fan/i.test(nm(x)));   /* 11-14 BB-C a：白天花板＋燈管被當成天空——射線打到模型的 CEIL_*（不算燈）就以射線為準 */
  return h?{hit:true, d:+h.distance.toFixed(2), name:nm(h).slice(0,30), ceil:ce?{d:+ce.distance.toFixed(2), name:nm(ce).slice(0,30)}:null, hits:hs.slice(0,5).map(x=>[nm(x).slice(0,24),+x.distance.toFixed(2)])}:{hit:false}; })"""
BURST_JS = r"""(async a=>{ const E=GAME.E, r=E.renderer, c=r.domElement, W=64, H=Math.round(64*c.height/c.width), k=document.createElement('canvas'); k.width=W; k.height=H; const g=k.getContext('2d',{willReadFrequently:true});
  const B=8, bw=Math.floor(W/B), bh=Math.floor(H/B), seq=[]; const y0=E.cam.yaw;
  const fr=[], t00=performance.now(); const FW=640, FH=Math.round(640*c.height/c.width);
  /* BB-C 11:43：先等鏡頭停穩（連續 10 幀相機位置差 <1 mm，最多 3 秒）再拍；記拍之前、整段連拍期間遊戲鏡頭和拍照鏡頭各漂了幾 mm */
  const P=new THREE.Vector3(), Q=new THREE.Vector3(); let still=0, waited=0; E.camera.getWorldPosition(P); const tw=performance.now();
  while(still<10&&performance.now()-tw<3000){ await new Promise(res=>requestAnimationFrame(res)); E.camera.getWorldPosition(Q); if(Q.distanceTo(P)<0.001) still++; else still=0; P.copy(Q); waited++; }
  const settle={frames:waited, still, ms:Math.round(performance.now()-tw)}; const G0=new THREE.Vector3(); E.camera.getWorldPosition(G0);
  const C0=E.camera.clone(); C0.updateMatrixWorld(true); const R0=new THREE.Vector3(); C0.getWorldPosition(R0); const PO=E.player&&E.player.obj, PV=PO?PO.visible:null; if(PO&&!a.pan) PO.visible=false;   /* BB-C 11:38：連拍鏡頭完全固定（拷一台不動的相機；原本每格轉 0.01 rad＝25 格約 14°，條圖整個畫面在平移、會誤判成閃）；PAN=1 才照舊轉 */
  for(let f=0;f<25;f++){ if(a.pan) E.cam.yaw=y0+f*0.01; await new Promise(res=>setTimeout(res,200)); r.render(E.scene,a.pan?E.camera:C0); g.drawImage(c,0,0,W,H); const d=g.getImageData(0,0,W,H).data; const v=[];
    if(a.strips){ const q=document.createElement('canvas'); q.width=FW; q.height=FH; q.getContext('2d').drawImage(c,0,0,FW,FH); const G=GAME.G; fr.push({q, ms:Math.round(performance.now()-t00), gh:G?(+G.hour).toFixed(3):''}); }
    for(let by=0;by<B;by++) for(let bx=0;bx<B;bx++){ let s=0,n=0; for(let y=by*bh;y<(by+1)*bh;y++) for(let x=bx*bw;x<(bx+1)*bw;x++){ const o=(y*W+x)*4; s+=0.299*d[o]+0.587*d[o+1]+0.114*d[o+2]; n++; } v.push(s/n); } seq.push(v); }
  if(a.pan) E.cam.yaw=y0; if(PO) PO.visible=PV; let flick=0; const per=[]; for(let i=0;i<B*B;i++){ let flips=0, prev=0; for(let f=1;f<seq.length;f++){ const dd=seq[f][i]-seq[f-1][i]; if(Math.abs(dd)>12){ const sg=Math.sign(dd); if(prev&&sg!==prev) flips++; prev=sg; } } per.push(flips); if(flips>=3) flick++; }
  let img=null; if(a.overlay){ r.render(E.scene,a.pan?E.camera:C0); const ow=640, oh=Math.round(640*c.height/c.width), q=document.createElement('canvas'); q.width=ow; q.height=oh; const qg=q.getContext('2d'); qg.drawImage(c,0,0,ow,oh);
    const sx=ow/B, sy=oh/B; qg.lineWidth=3; qg.font='bold 14px sans-serif'; for(let i=0;i<B*B;i++){ if(per[i]<3) continue; const bx=i%B, by=Math.floor(i/B); qg.strokeStyle='#ff2d55'; qg.strokeRect(bx*sx+2,by*sy+2,sx-4,sy-4); qg.fillStyle='#ff2d55'; qg.fillText(String(per[i]),bx*sx+6,by*sy+18); }
    img=q.toDataURL('image/jpeg',0.85); }
  let strips=null; if(a.strips&&fr.length){ strips=[]; const sx=FW/B, sy=FH/B, pick=[]; for(let f=0;f<fr.length&&pick.length<12;f+=2) pick.push(f);
    const order=per.map((n,i)=>[n,i]).filter(x=>x[0]>=3).sort((a2,b2)=>b2[0]-a2[0]).slice(0,10);
    for(const [n,i] of order){ const bx=i%B, by=Math.floor(i/B), cw=Math.round(sx), ch=Math.round(sy), sc=2, tw=cw*sc, th=ch*sc; const k2=document.createElement('canvas'); k2.width=tw*pick.length; k2.height=th+34; const g2=k2.getContext('2d'); g2.fillStyle='#000'; g2.fillRect(0,0,k2.width,k2.height);
      g2.font='bold 12px sans-serif'; pick.forEach((f,j)=>{ g2.drawImage(fr[f].q, bx*sx, by*sy, sx, sy, j*tw, 34, tw, th); g2.fillStyle='#fff'; g2.fillText(fr[f].ms+'ms', j*tw+3, 13); g2.fillStyle='#ffd24d'; g2.fillText('g'+fr[f].gh, j*tw+3, 28); });
      strips.push({i, bx, by, flips:n, url:k2.toDataURL('image/jpeg',0.88)}); } }
  const G1=new THREE.Vector3(); E.camera.getWorldPosition(G1); const RC=a.pan?E.camera:C0, R1=new THREE.Vector3(); RC.getWorldPosition(R1);
  return {blocks_flipping:flick, max_flips:Math.max(...per), per, img, strips, settle, game_cam_drift_mm:+(G1.distanceTo(G0)*1000).toFixed(1), cam_drift_mm:+(R1.distanceTo(R0)*1000).toFixed(1)}; })"""
SHEET_JS = r"""(async a=>{ const ims=await Promise.all(a.urls.map(u=>new Promise(res=>{ if(!u) return res(null); const q=new Image(); q.onload=()=>res(q); q.onerror=()=>res(null); q.src=u; })));
  const w=420, h=236, cols=4, rows=Math.ceil(ims.length/cols), k=document.createElement('canvas'); k.width=w*cols; k.height=h*rows+56; const g=k.getContext('2d'); g.fillStyle='#000'; g.fillRect(0,0,k.width,k.height);
  g.fillStyle='#fff'; g.font='bold 18px sans-serif'; g.fillText(a.title,8,22); g.font='13px sans-serif'; g.fillStyle='#ffd24d'; g.fillText(a.verdict,8,46);
  ims.forEach((im,i)=>{ const x=(i%cols)*w, y=56+Math.floor(i/cols)*h; if(im) g.drawImage(im,x,y,w,h); g.fillStyle='rgba(0,0,0,0.6)'; g.fillRect(x,y,w,20); g.fillStyle=a.flags[i]?'#ff6b6b':'#fff'; g.fillText(a.labels[i]+(a.flags[i]?'  ★'+a.flags[i]:''),x+4,y+15);
    if(im&&a.rects&&a.rects[i]) for(const r of a.rects[i]){ g.strokeStyle='#00e5ff'; g.lineWidth=2; g.strokeRect(x+r[0]*w,y+r[1]*h,(r[2]-r[0])*w,(r[3]-r[1])*h); } });
  return k.toDataURL('image/jpeg',0.85); })"""
DEPTH_JS = r"""(a=>{ const E=GAME.E, c=E.renderer.domElement; const cam=new THREE.PerspectiveCamera(60, c.width/c.height, 0.05, 400); cam.position.set(...a.from); cam.lookAt(...a.at); cam.updateMatrixWorld(true); cam.updateProjectionMatrix();
  const ex=new Set(); const P=E.player&&E.player.obj; if(P) P.traverse(o=>ex.add(o)); for(const n of (E.npcs||[])) if(n.obj) n.obj.traverse(o=>ex.add(o)); for(const x of (E.extras||[])) if(x.obj) x.obj.traverse(o=>ex.add(o));
  const skip=o=>{ if(ex.has(o)||o.visible===false) return true; const m=Array.isArray(o.material)?o.material[0]:o.material, nm=((o.name||'')+' '+(m&&m.name||'')); if(/glass|玻璃/i.test(nm)) return true; if(m&&m.transparent&&m.opacity<0.9) return true; return false; };   /* X352 r1：原本連名字有 window 的都略過＝新的立體櫥窗（SHOP-WINDOW-3D）整個被跳過，新舊數字一樣；只略過玻璃、半透明 */
  const hitName=[];
  const rc=new THREE.Raycaster(); const ds=[]; const RX=a.rect||[0.2,0.25,0.8,0.75]; for(let i=0;i<24;i++) for(let j=0;j<16;j++){ const u=RX[0]+(RX[2]-RX[0])*(0.05+0.9*i/23), v=RX[1]+(RX[3]-RX[1])*(0.05+0.9*j/15), nx=2*u-1, ny=1-2*v;   /* XS_REAL r1：只打櫥窗那一塊（原本 ±0.6／±0.5 大半打在街上，好幾間數字一樣）*/ rc.setFromCamera(new THREE.Vector2(nx,ny),cam); rc.far=60;
    const h=rc.intersectObjects(E.scene.children,true).find(x=>!skip(x.object)); if(h){ ds.push(h.distance); if(h.distance>0) hitName.push(String(h.object.name||(h.object.parent&&h.object.parent.name)||'').slice(0,30)); } }
  if(!ds.length) return {n:0}; const bk=new Map(); for(const d of ds){ const k=Math.round(d*4); bk.set(k,(bk.get(k)||0)+1); } let mk=0, mv=0; for(const [k,v] of bk) if(v>mv){ mv=v; mk=k; } const face=mk/4;
  const deep=ds.filter(d=>d>face+0.8).length/ds.length; const s=ds.slice().sort((x,y)=>x-y);
  const bh=ds.filter(d=>d>face+0.3).sort((x,y)=>x-y), sp=bh.length>=6?+(bh[Math.floor(bh.length*0.9)]-bh[Math.floor(bh.length*0.1)]).toFixed(2):null;   /* 門面後面打到的東西深度分不分散：平面卡片≈0、立體店內有前後 */
  const nc={}; for(const x of hitName) nc[x]=(nc[x]||0)+1; const top=Object.entries(nc).sort((p,q)=>q[1]-p[1]).slice(0,8);
  return {n:ds.length, face:+face.toFixed(2), deep:+deep.toFixed(3), behind_n:bh.length, behind_spread:sp, hit_names:top, p10:+s[Math.floor(s.length*0.1)].toFixed(2), p50:+s[Math.floor(s.length*0.5)].toFixed(2), p90:+s[Math.floor(s.length*0.9)].toFixed(2)}; })"""
UI_JS = r"""(()=>{ const out=[]; for(const el of document.querySelectorAll('body *')){ if(!el.id&&!(el.className&&String(el.className).match(/panel|sheet|menu|shop|toast|modal|pop/i))) continue; const cs=getComputedStyle(el); if(cs.display==='none'||cs.visibility==='hidden'||el.offsetParent===null&&cs.position!=='fixed') continue; const t=(el.innerText||'').trim(); if(!t) continue; const r=el.getBoundingClientRect(); if(r.width<40||r.height<20) continue; out.push([el.id||String(el.className).slice(0,30), t.replace(/\s+/g,' ').slice(0,120)]); if(out.length>=8) break; } return out; })()"""
GLASSRECT_JS = r"""(a=>{ const E=GAME.E, c=E.renderer.domElement; const cam=new THREE.PerspectiveCamera(60, c.width/c.height, 0.05, 400); cam.position.set(...a.from); cam.lookAt(...a.at); cam.updateMatrixWorld(true); cam.updateProjectionMatrix();
  const ex=new Set(); const P=E.player&&E.player.obj; if(P) P.traverse(o=>ex.add(o)); for(const n of (E.npcs||[])) if(n.obj) n.obj.traverse(o=>ex.add(o)); for(const x of (E.extras||[])) if(x.obj) x.obj.traverse(o=>ex.add(o));
  const isG=o=>{ const m=Array.isArray(o.material)?o.material[0]:o.material, nm=((o.name||'')+' '+(m&&m.name||'')); return /glass|玻璃/i.test(nm)||(m&&m.transparent&&m.opacity<0.9&&m.opacity>0.02); };
  const rc=new THREE.Raycaster(), xs=[], ys=[]; const NX=48, NY=27;
  for(let i=0;i<NX;i++) for(let j=0;j<NY;j++){ const u=(i+0.5)/NX, v=(j+0.5)/NY; rc.setFromCamera(new THREE.Vector2(2*u-1,1-2*v),cam); rc.far=30;
    const h=rc.intersectObjects(E.scene.children,true).find(x=>!ex.has(x.object)&&x.object.visible!==false); if(h&&isG(h.object)){ xs.push(u); ys.push(v); } }
  if(xs.length<12) return {n:xs.length};
  const q=(A,p)=>{ const s=A.slice().sort((x,y)=>x-y); return s[Math.min(s.length-1,Math.max(0,Math.floor(s.length*p)))]; };
  return {n:xs.length, rect:[+q(xs,0.05).toFixed(3), +q(ys,0.05).toFixed(3), +q(xs,0.95).toFixed(3), +q(ys,0.95).toFixed(3)]}; })"""
WINRECT_JS = r"""(a=>{ if(typeof Z3==='undefined'||!Z3.shopWindowRects) return {why:'沒有 Z3.shopWindowRects'}; let L=null; try{ L=Z3.shopWindowRects(GAME.E.zone); }catch(e){ return {why:String(e).slice(0,80)}; }
  const w=(L||[]).find(q=>q&&(q.place===a.zid||q.id===a.zid)); if(!w) return {why:'這一區沒有這間店的櫥窗資料', n:(L||[]).length};
  const c=GAME.E.renderer.domElement, cam=new THREE.PerspectiveCamera(60, c.width/c.height, 0.05, 400); cam.position.set(...a.from); cam.lookAt(...a.at); cam.updateMatrixWorld(true); cam.updateProjectionMatrix();
  const pts=w.corners.map(p=>{ const v=new THREE.Vector3(p[0],p[1],p[2]).project(cam); return [(v.x+1)/2,(1-v.y)/2,v.z]; }).filter(p=>p[2]<1&&p[2]>-1);
  if(pts.length<3) return {why:'櫥窗四角不在畫面裡', w};
  const xs=pts.map(p=>p[0]), ys=pts.map(p=>p[1]); return {rect:[Math.max(0,Math.min(...xs)),Math.max(0,Math.min(...ys)),Math.min(1,Math.max(...xs)),Math.min(1,Math.max(...ys))].map(v=>+v.toFixed(3)), id:w.id, place:w.place}; })"""
AIM_JS = r"""(a=>{ const f=v=>+(+v).toFixed(2);
  try{ if(typeof Z3!=='undefined'&&Z3.shopWindowRects){ const w=(Z3.shopWindowRects(GAME.E.zone)||[]).find(q=>q&&(q.place===a.zid||q.id===a.zid)); if(w&&w.corners&&w.corners.length){ const n=w.corners.length, c=[0,1,2].map(i=>w.corners.reduce((s,p)=>s+p[i],0)/n); return {c:c.map(f), from:'shopWindowRects', id:w.id}; } } }catch(e){}
  const L=(GAME.E.interactables||[]).filter(i=>i.exit&&i.exit.to===a.zid&&!i.hidden).map(i=>({x:i.x,z:i.z,d:Math.hypot(i.x-a.sx,i.z-a.sz)})).sort((p,q)=>p.d-q.d);
  if(L[0]) return {c:[f(L[0].x),1.4,f(L[0].z)], from:'door'}; return {c:null, from:'none'}; })"""
MEANS_JS = r"""(async a=>{ const im=await new Promise(res=>{ const q=new Image(); q.onload=()=>res(q); q.src=a.u; }); const W=240, H=Math.round(240*im.height/im.width);
  const k=document.createElement('canvas'); k.width=W; k.height=H; const g=k.getContext('2d'); g.drawImage(im,0,0,W,H); const d=g.getImageData(0,0,W,H).data; const out={};
  for(const n in a.regs){ const [x0,y0,x1,y1]=a.regs[n]; let r=0,gg=0,b=0,c=0; for(let y=Math.max(0,Math.floor(y0*H));y<Math.min(H,Math.ceil(y1*H));y++) for(let x=Math.max(0,Math.floor(x0*W));x<Math.min(W,Math.ceil(x1*W));x++){ const o=(y*W+x)*4; r+=d[o]; gg+=d[o+1]; b+=d[o+2]; c++; }
    out[n]=c?[Math.round(r/c),Math.round(gg/c),Math.round(b/c)]:[0,0,0]; } return out; })"""
PAIR_JS = r"""(async a=>{ const ld=u=>new Promise(res=>{ const q=new Image(); q.onload=()=>res(q); q.onerror=()=>res(null); q.src=u; }); const A=await ld(a.a), B=await ld(a.b);
  const w=640, h=360, k=document.createElement('canvas'); k.width=w*2; k.height=h+36; const g=k.getContext('2d'); g.fillStyle='#000'; g.fillRect(0,0,k.width,k.height); g.fillStyle='#ffd24d'; g.font='bold 16px sans-serif'; g.fillText(a.title,8,24);
  const put=(im,x,rs)=>{ if(im) g.drawImage(im,x,36,w,h); g.lineWidth=2; rs.forEach((r,i)=>{ g.strokeStyle=i?'#ff6b6b':'#00e5ff'; g.strokeRect(x+r[0]*w,36+r[1]*h,(r[2]-r[0])*w,(r[3]-r[1])*h); }); };
  put(A,0,a.ra); put(B,w,a.rb); return k.toDataURL('image/jpeg',0.85); })"""
HIDE_PEOPLE = "(h=>{ const E=GAME.E; const run=()=>{ const L=[E.player].concat(E.npcs||[]).concat(E.extras||[]); for(const n of L){ if(n&&n.obj){ if(h){ if(n.obj.userData._ccv===undefined){ n.obj.userData._ccv=n.obj.visible; n.obj.userData._cch=n.hidden; } n.hidden=true; n.obj.visible=false; } else if(n.obj.userData._ccv!==undefined){ n.hidden=n.obj.userData._cch; n.obj.visible=n.obj.userData._ccv; delete n.obj.userData._ccv; delete n.obj.userData._cch; } } } return L.length; }; clearInterval(window.__ccHideIv); if(h) window.__ccHideIv=setInterval(run,100); return run(); })"   # 11-12 BB-C 16:37：連 E.extras、藏人期間每 0.1 秒重藏（日和 14:00 漏一位客人）   # XS_REAL_cal_old_r3：engine3d.js 每一幀 o.visible=!n.hidden&&…，只關 visible 下一幀店員又出現＝要連 n.hidden 一起設
GAMECAM = "(()=>{ const E=GAME.E, r=E.renderer; r.render(E.scene,E.camera); return r.domElement.toDataURL('image/png'); })()"


def v3(lo, hi, x, low_bad):
    """門檻判斷：low_bad＝數字小是壞的（視差）；否則數字大是壞的（閃）"""
    if low_bad: return 'FAIL' if x < lo else ('PASS' if x > hi else 'UNKNOWN')
    return 'PASS' if x <= lo else ('FAIL' if x >= hi else 'UNKNOWN')


async def snap(pg, frm, at, fov=60, win=False, near=None, box=None):
    return await pg.evaluate(SNAPX, {'from': list(frm), 'at': list(at), 'fov': fov, 'win': win, 'near': near, 'box': box})


async def do_func(pg, cdp, tag, rm, zid):
    res = {}
    ct = rm['counter']
    if ct:
        m0 = await pg.evaluate("GAME.G.money|0")
        ok_reach = False
        for k in range(3):
            q = await D.st(pg)
            if q['interact'].startswith(ct['label'][:4]): ok_reach = True; break
            await L.go_to(pg, cdp, R, ct['x'], ct['z'], 0.8 if k == 0 else 0.5, '%s ⑦ 走到「%s」（第 %d 段）' % (tag, ct['label'], k + 1), max_s=30)
            await pg.wait_for_timeout(600)
        q = await D.st(pg); ok_reach = ok_reach or q['interact'].startswith(ct['label'][:4])
        said = 0; picked = []; poor = None; lines = []; menu_shot = False
        OPTS_JS = "(()=>[...document.querySelectorAll('#choices button')].filter(b=>b.offsetParent).map(b=>({t:b.textContent.trim(), dim:!!(b.disabled||b.classList.contains('dim')||b.getAttribute('aria-disabled')==='true')})))()"
        if ok_reach and ORDER_POOR:   # BB-C 01:45（木曜日）：錢不夠的選項要是灰的——先把錢設成 10 元打開選單記每一項灰不灰，再關掉、錢還原
            await pg.evaluate("GAME.G.money=10"); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1200)
            for _ in range(10):
                q = await D.st(pg)
                if q['choices']: poor = await pg.evaluate(OPTS_JS); await pg.screenshot(path=os.path.join(OUT, '%s_order_poor.png' % tag.strip('[]').replace(' ', '_'))); break
                if q['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
                await pg.wait_for_timeout(400)
            await L.close_panels(pg, cdp)
            for _ in range(10):
                q = await D.st(pg)
                if q['choices']:
                    k = next((i for i, t in enumerate(q['choices']) if any(w in t for w in ('不點', '算了', '離開', '不用', '返回'))), None)
                    if k is None: R.note('%s 錢 10 元的選單沒有「不點／算了／離開」可以退出：%s——照實記、讀檔重來' % (tag, J(q['choices']))); break
                    await L.tap(pg, cdp, '#choices button:nth-child(%d)' % (k + 1)); await pg.wait_for_timeout(700); continue
                if q['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
                if not q['busy']: break
                await pg.wait_for_timeout(400)
            await pg.evaluate("(m=>{ GAME.G.money=m; })", m0); R.note('%s 錢設 10 元時的點餐選單（每一項灰不灰）：%s' % (tag, J(poor)))
            await L.go_to(pg, cdp, R, ct['x'], ct['z'], 0.6, ct['label'], max_s=60, lv=ct.get('lv', 0)); await D.settle(pg)
        if ok_reach:
            await L.tap(pg, cdp, '#interact'); t0 = time.time()
            while time.time() - t0 < 60:
                q = await D.st(pg)
                if q['choices']:
                    if not menu_shot: menu_shot = True; await pg.screenshot(path=os.path.join(OUT, '%s_order_menu.png' % tag.strip('[]').replace(' ', '_')))   # BB-C 09:45：截一張點餐選單
                    opts = q['choices']; bad = ('不用了', '算了', '離開', '返回', '不買', '下次', '先不要', '不點', '要水')   # BB-C 01:45：木曜日「不點、要水」不收錢，不能當點餐
                    k = next((i for i, t in enumerate(opts) if t.startswith('點好了') or t.startswith('結帳')), None) if picked else None
                    if k is None: k = next((i for i, t in enumerate(opts) if not any(t.startswith(b) for b in bad)), 0)
                    picked.append(opts[k]); await L.tap(pg, cdp, '#choices button:nth-child(%d)' % (k + 1)); await pg.wait_for_timeout(900)
                    if len(picked) > 8: break
                    continue
                if q['dlg']:
                    said += 1; lines.append(await pg.evaluate("(()=>[(document.getElementById('dlgName')||{}).textContent||'', (document.getElementById('dlgText')||{}).textContent||''])()"))   # BB-C 09:45：點餐那幾句原文
                    await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
                if not q['busy']: break
                await pg.wait_for_timeout(400)
            R.note('%s ⑦ 點餐：選了 %s；台詞原文 %s' % (tag, J(picked), J(lines)))
        m1 = await pg.evaluate("GAME.G.money|0")
        ui = await pg.evaluate(UI_JS) if ok_reach and not picked and not said else None
        # PC GATE_CAL_bd86：便利商店按「結帳」沒有出選單也沒有對話＝探針看不懂那個畫面，記下畫面上的字、判 UNKNOWN（交 BB 看圖），不當 FAIL
        if ORDER_POOR and poor is not None:
            pricey = [o for o in poor if not any(w in o['t'] for w in ('不點', '算了', '離開', '不用', '返回', '要水'))]
            R.check('%s 錢不夠（10 元）時要花錢的選項是灰的' % tag, bool(pricey) and all(o['dim'] for o in pricey), J(poor))
        if ORDER_POOR: R.check('%s 點了第一項有扣錢' % tag, m1 < m0, J({'picked': picked, 'money': [m0, m1]}))
        res['order'] = {'reach': ok_reach, 'picked': picked, 'said': said, 'money': [m0, m1], 'ui': ui, 'poor': poor, 'lines': lines,
                        'verdict': 'PASS' if ok_reach and (m1 < m0 or said > 0) else ('UNKNOWN' if (not ok_reach or (not picked and not said)) else 'FAIL')}
    else:
        res['order'] = {'verdict': 'UNKNOWN', 'why': '沒有點餐／結帳類的互動點（這間可能不賣東西：交 BB 看）'}
    zn = await pg.evaluate("(()=>({zone:GAME.G.zone, h:+(+GAME.G.hour).toFixed(2)}))()")
    if zn['zone'] != zid:   # 11-14 L118_CAFE2 18:30：點餐（吃 40 分鐘）過了 19:00 打烊＝被請出店外，座位 0 張、找不到「離開」——照實記，座位、出口兩項不做（不算 FAIL_SETUP）
        R.note('%s ⑦ 點完以後人已經不在店裡（%s %.2f）：吃完過了打烊被請出去？座位、出口兩項跳過' % (tag, zn['zone'], zn['h']))
        res['sit'] = {'verdict': 'n/a', 'why': 'out:%s %.2f' % (zn['zone'], zn['h'])}; res['exit'] = {'verdict': 'n/a', 'why': 'out:%s' % zn['zone']}
        return res
    if rm['seat']:
        occs = []

        async def _occ(k, s_, t_):
            o = await pg.evaluate(OCC_JS); occs.append({'seat': [s_['sx'], s_['sz']], 'occ': o}); R.note('%s 坐下鏡頭：%s' % (t_, J(o)))
        only_ = SEAT_ONLY or (None if ALLSEATS else [(rm['seat']['x'], rm['seat']['z'])])
        if SEAT_BARSIDE:
            bs = await pg.evaluate("(()=>{ if(typeof MOKS==='undefined'||!MOKS.barSide) return {why:'沒有 MOKS.barSide'}; const s=MOKS.barSide(GAME.E); return {seat:s?{x:s.x,z:s.z,lv:s.lv|0,taken:s.taken||null}:null, examFull:MOKS.examFull?!!MOKS.examFull(GAME.G):null, examWeek:MOKS.examWeek?!!MOKS.examWeek(GAME.G):null}; })()")
            R.note('%s ⑦ 吧檯旁邊那一個位子：%s' % (tag, J(bs)))
            if not R.check('FAIL_SETUP 檢查：%s 找得到「坐吧檯旁邊」那一個位子（MOKS.barSide）' % tag, bool(bs.get('seat')), J(bs)):
                res['sit'] = {'verdict': 'UNKNOWN', 'why': 'no barSide'}; return res
            only_ = [(bs['seat']['x'], bs['seat']['z'])]
        rs = await D.sit_all(pg, cdp, tag + ' ⑦', 'gate_%s_%s_seat' % (TAG, zid), only=only_, on_seated=_occ if ALLSEATS else None, ap_only=SEAT_AP_ONLY)
        res['sit'] = {'res': rs, 'verdict': 'PASS' if rs and (rs[0][1] == 'ok' if SEAT_BARSIDE else rs[0][1] in ('ok', 'occupied')) else 'FAIL'}
        if ALLSEATS:
            blk = [o for o in occs if o['occ'].get('hit')]
            res['sit_cam'] = {'n': len(occs), 'blocked': blk, 'all': occs, 'verdict': 'UNKNOWN' if blk else ('PASS' if occs else 'UNKNOWN')}
    else:
        res['sit'] = {'verdict': 'n/a', 'why': '沒有位子'}
    ex = rm['exit']; ok_out = False
    # 11-13 BB-C：SOFA_SOCLIB2F_r2 點出口中心停在牆邊＝改成 route 那種「出口範圍六成以內站得住的點」（D.use_exit 同一套），走不到再往中心
    exr = next((e for e in await pg.evaluate(D.EXITS) if e['label'] == ex['label']), None)
    tgt = await D.standable_near(pg, ex['x'], ex['z'], exr['r'] * 0.6, exr['lv']) if exr else None
    R.note('%s ⑦ 出口「%s」範圍 %s；走到範圍裡站得住的 %s' % (tag, ex['label'], J(exr), J(tgt)))
    if not tgt:
        R.check('FAIL_SETUP 檢查：%s ⑦ 出口範圍裡有站得住的點' % tag, False, J(exr))
        # BB-C 11-14（L118_CAFE2_e23d 18:30）：附出口附近的俯視圖（交 LAWWW2），並記這一區所有出口（看是不是字對不上）
        try:
            allex = await pg.evaluate(D.EXITS); R.note('%s ⑦ 這一區的出口：%s；房間 rm.exit %s' % (tag, J(allex), J(ex)))
            ov = await snap(pg, (ex['x'], 7.5, ex['z'] + 0.01), (ex['x'], 0.0, ex['z']), 60)
            open(os.path.join(OUT, 'exit_top_%s_%d.png' % (zid, int(time.time()))), 'wb').write(base64.b64decode(ov['u'].split(',', 1)[1]))
        except Exception as e: R.note('%s ⑦ 出口俯視圖拍不了：%r' % (tag, e))
    # 11-13 BB-C：出口和玩家不同層（社科院 2F「回閱覽室」出口在一樓、被二樓樓板蓋住，點不到）＝先照遊戲的 E.pathTo 走到換層那一段（樓梯），到那一層再走出口
    q0 = await D.st(pg)
    if exr and (q0.get('lv') or 0) != exr['lv']:
        g0 = tgt or {'x': ex['x'], 'z': ex['z']}
        path = await pg.evaluate("(a=>{ const P=GAME.E.player, p=P.obj.position; const r=GAME.E.pathTo&&GAME.E.pathTo(p.x,p.z,P.lv|0,a.x,a.z,a.lv); return r?r.map(q=>Array.isArray(q)?[+(+q[0]).toFixed(2),+(+q[1]).toFixed(2),q[2]|0]:[+q.x.toFixed(2),+q.z.toFixed(2),q.lv|0]):null; })", {'x': g0['x'], 'z': g0['z'], 'lv': exr['lv']})
        wps = []
        for i in range(1, len(path or [])):
            if path[i][2] != path[i - 1][2]: wps += [path[max(0, i - 2)], path[min(len(path) - 1, i + 3)]]
        R.note('%s ⑦ 出口在第 %s 層、人在第 %s 層：E.pathTo %d 點，換層處 %s' % (tag, exr['lv'], q0.get('lv'), len(path or []), J(wps)))
        if not R.check('FAIL_SETUP 檢查：%s ⑦ 遊戲找得到往出口那一層的路' % tag, bool(wps), J((path or [])[:6])): wps = []
        for j, w in enumerate(wps):
            await L.go_to(pg, cdp, R, w[0], w[1], 0.5, '%s ⑦ 換層第 %d 點' % (tag, j + 1), max_s=60, lv=w[2]); await pg.wait_for_timeout(400)
    for k in range(3):
        q = await D.st(pg)
        if q['zone'] != zid or q['interact'].startswith('離開') or q['interact'].startswith(ex['label'][:3]): break
        gx, gz = (tgt['x'], tgt['z']) if (tgt and k < 2) else (ex['x'], ex['z'])
        await L.go_to(pg, cdp, R, gx, gz, 0.3 if tgt and k < 2 else 0.6, '%s ⑦ 走到「%s」（第 %d 段）' % (tag, ex['label'], k + 1), max_s=40, lv=exr['lv'] if exr else None); await pg.wait_for_timeout(600)
    q = await D.st(pg)
    if q['zone'] != zid: ok_out = True   # PC GATE_CAL_1cd2 泰米：走到門口就自己出去了（門是走進去就觸發）＝出得去
    elif q['interact'].startswith(ex['label'][:3]):
        await L.tap(pg, cdp, '#interact'); s = await D.wait_zone(pg, cdp, ex['to'] or '', 20); ok_out = s['zone'] != zid
    res['out'] = {'verdict': 'PASS' if ok_out else 'FAIL', 'zone_after': (await D.st(pg))['zone']}
    return res


async def enter_cam(pg, cdp, tag, rm, zid, h):
    sp = rm['exit']['spawn']; oz = rm['exit']['to']
    await D.load_zone(pg, cdp, oz, DAY, h, x=sp['x'], z=sp['z'], yaw=sp.get('yaw', 0.0), wait=8000)
    R.setup('%s 【前置／捷徑】讀檔到門外 %s (%.2f, %.2f)，接著照玩家走到門口按進去' % (tag, oz, sp['x'], sp['z']))
    await pg.evaluate(SETTLED); await pg.wait_for_timeout(1500)
    door = await pg.evaluate("(z=>{ const i=GAME.E.interactables.find(i=>i.exit&&i.exit.to===z&&!i.hidden); return i?{label:i.label, x:+i.x.toFixed(2), z:+i.z.toFixed(2), r:i.radius||1, lv:i.lv|0}:null; })", zid)
    if not R.check('FAIL_SETUP 檢查：%s 門外找得到進 %s 的門' % (tag, zid), bool(door), ''): return {'verdict': 'UNKNOWN', 'why': 'no door'}
    tgt = await D.standable_near(pg, door['x'], door['z'], door['r'] * 0.6, door['lv'])
    q = await D.st(pg)
    if not q['interact'].startswith(door['label'][:3]):
        await L.go_to(pg, cdp, R, (tgt or door)['x'], (tgt or door)['z'], 0.3, '%s 進門：走到「%s」' % (tag, door['label']), max_s=60, lv=door['lv']); q = await D.settle(pg)
    out = {'door': door, 'shots': []}
    if q['zone'] != zid:
        if not R.check('FAIL_SETUP 檢查：%s 門口按鈕是「%s」' % (tag, door['label']), q['interact'].startswith(door['label'][:3]), J(q)): out['verdict'] = 'UNKNOWN'; return out
        await L.tap(pg, cdp, '#interact')
    t0 = time.time()
    while time.time() - t0 < 20:
        if (await pg.evaluate("GAME.G.zone")) == zid: break
        await pg.wait_for_timeout(100)
    t1 = time.time(); out['load_s'] = round(t1 - t0, 2)
    for k, at in enumerate((0, 0.4, 1.0, 2.0)):
        dt = at - (time.time() - t1)
        if dt > 0: await pg.wait_for_timeout(int(dt * 1000))
        o = await pg.evaluate(OCC_JS); o['t'] = round(time.time() - t1, 2)
        await pg.screenshot(path=os.path.join(OUT, 'enter_%s_%s_%d.png' % (TAG, zid, k))); out['shots'].append(o)
    blk = [o for o in out['shots'] if o.get('hit')]
    out['verdict'] = 'UNKNOWN' if blk else 'PASS'
    if blk: R.check('%s 進門那一下鏡頭到頭之間被擋（交 BB 看 enter_*.png）' % tag, False, J(blk))
    return out


async def gate_zone(pg, cdp, zid, h, rows, cons):
    hh = '%02d%02d' % (int(h), int(round((h % 1) * 60))); tag = '[%s %s]' % (zid, hh)
    s = await (D.load_zone(pg, cdp, zid, DAY, h, x=SPAWN[0], z=SPAWN[1], lv=int(SPAWN[2]) if len(SPAWN) > 2 else 0, wait=(500 if US_DIAG else 8000)) if len(SPAWN) >= 2 else D.load_zone(pg, cdp, zid, DAY, h, wait=(500 if US_DIAG else 8000)))
    if US_DIAG:   # BB-C 10:16（LAWWW 要的）：讀檔後 0.5／5／15 秒各記一次 clerk 的 NPC（一開始就沒有，還是後來才不見：obj.parent、visible、在不在 E.npcs）＋GM.G.zone
        ts_ = []
        for at_ in (0.5, 5, 15):
            if ts_: await pg.wait_for_timeout(int((at_ - ts_[-1]['at']) * 1000))
            snap_ = await pg.evaluate(US_CLERK_JS); snap_['at'] = at_; ts_.append(snap_)
            R.note('%s US_DIAG 讀檔後 %s 秒：%s' % (tag, at_, J(snap_)))
        # LAWWW-C 10:36：② 玩家走到店員前 1.5 m（主鏡頭跟著轉向收銀台）以後 visible 變不變 true ③ 那裡的互動鍵字、按下去有沒有點餐選單
        ck_ = next((c_ for c_ in (ts_[-1].get('clerks') or []) if c_.get('x') is not None), None)
        if ck_:
            tg_ = await D.standable_near(pg, ck_['x'], ck_['z'] - 1.5, 1.0, 0) or await D.standable_near(pg, ck_['x'], ck_['z'], 2.0, 0)
            if tg_: await L.go_to(pg, cdp, R, tg_['x'], tg_['z'], 0.3, '%s US_DIAG 走到店員前' % tag, max_s=60, lv=0)
            await pg.wait_for_timeout(2000); near_ = await pg.evaluate(US_CLERK_JS); near_['at'] = 'near_clerk'; ts_.append(near_)
            R.note('%s US_DIAG 走到店員前 1.5 m 以後：%s' % (tag, J(near_)))
            q_ = await D.settle(pg); it_ = q_.get('interact')
            await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2500)
            st_ = await pg.evaluate("(()=>({choices:[...document.querySelectorAll('#choices button')].filter(b=>b.offsetParent).map(b=>b.textContent.trim().slice(0,40)), dlg:((document.getElementById('dlgText')||{}).textContent||'').trim().slice(0,60), who:((document.getElementById('dlgName')||{}).textContent||'').trim()}))()")
            await pg.screenshot(path=os.path.join(OUT, 'us_diag_%s_%s_interact.png' % (zid, int(h * 100))))
            ts_.append({'at': 'interact', 'label': it_, 'after': st_})
            R.note('%s US_DIAG 店員前的互動鍵「%s」→ 按下去：%s' % (tag, it_, J(st_)))
            await L.close_panels(pg, cdp) if hasattr(L, 'close_panels') else None
            for _ in range(10):
                c2_ = await pg.evaluate("(()=>[...document.querySelectorAll('#choices button')].filter(b=>b.offsetParent).map(b=>b.textContent.trim()))()")
                if not c2_: break
                k2_ = next((i_ for i_, t_ in enumerate(c2_) if any(w_ in t_ for w_ in ('算了', '不用', '離開', '不買', '先不要'))), len(c2_) - 1)
                await L.tap(pg, cdp, '#choices button:nth-child(%d)' % (k2_ + 1)); await pg.wait_for_timeout(700)
        open(os.path.join(OUT, 'us_diag_clerk_%s_%s.json' % (zid, int(h * 100))), 'w', encoding='utf-8').write(J(ts_))
    R.setup('%s 【前置／捷徑】讀檔進 %s %s %.2f 時（區域的出生點）、錢補到 5000（⑦ 要買得起）' % (tag, zid, DAY, h))
    await pg.evaluate("(()=>{ if(GAME.G) GAME.G.money=Math.max(GAME.G.money|0,5000); })()")
    if GATE_FLAGS:   # BB-C 11-14 SHOP_B5：禮貌生財書房要解鎖（LM_STUDY）才進得去——墊旗標以後用遊戲自己的讀檔再讀一次，區域照旗標重建
        fl = await pg.evaluate("(async a=>{ const F=GAME.G.flags||(GAME.G.flags={}); for(const k of a) F[k]=true; const s=JSON.parse(JSON.stringify(GAME.snapshot())); await GAME.applySave(s); return a.map(k=>[k,!!GAME.G.flags[k]]); })", GATE_FLAGS)
        await pg.wait_for_timeout(6000); R.setup('%s 【捷徑】墊旗標 %s、GAME.snapshot 再讀一次' % (tag, J(fl)))
    await pg.evaluate(SETTLED); await pg.wait_for_timeout(1500)
    row = {'zone': zid, 'hour': h, 'v': {}, 'm': {}}
    if s['zone'] != zid:
        R.note('%s 讀檔以後在 %s＝沒開／進不去，這個時間跳過（不判）' % (tag, s['zone'])); row['skipped'] = 'closed:' + s['zone']; rows.append(row); return
    c0 = len(cons)
    if NODEBUG:   # BB-C 11-14 L118_SELF：玩家版（沒有 ?dev）畫面上不能有除錯字（AA 對照圖左下角「career A0 B0 C0 = 0」）
        dbg = await pg.evaluate(DEBUGTXT_JS); row['debugText'] = dbg
        await pg.screenshot(path=os.path.join(OUT, '%s_%s_nodebug.png' % (zid, hh)))
        R.check('%s 玩家版畫面上沒有除錯字（career A0 B0 C0 那一類；網址 %s）' % (tag, dbg['url']), not dbg['hits'], J(dbg))
    if US_DIAG:
        ud = await pg.evaluate(US_DIAG_JS, zid); row['m']['us_diag'] = ud; R.note('%s US_DIAG：%s' % (tag, J(ud)))
    rm = await pg.evaluate(ROOM_JS); row['room'] = rm
    if not R.check('%s 量得到房間範圍、有門' % tag, bool(rm['box']) and bool(rm['exit']), J(rm)): rows.append(row); return
    cx, cz = rm['c']; ex, ez = rm['exit']['x'], rm['exit']['z']; by = 0.0
    if len(SPAWN) >= 2:   # BB-C 01:5x（BB_379 木曜日 r2 4_solid TEST_BUG）：二樓的店，①～③ 固定鏡頭改從 SPAWN（二樓）算，高度加上玩家站的那層地板
        ex, ez = SPAWN[0], SPAWN[1]; by = await pg.evaluate("(()=>{ const P=GAME.E.player&&GAME.E.player.obj; return P?+P.position.y.toFixed(2):0; })()") or 0.0
        R.note('%s ①～③ 鏡頭從 SPAWN (%.2f, %.2f) 算、地板高 %.2f m（房間中心 %s）' % (tag, ex, ez, by, J(rm['c'])))
    dx, dz = cx - ex, cz - ez; m = math.hypot(dx, dz) or 1; ux, uz = dx / m, dz / m
    ck = rm['counter'] or {'x': cx + ux * m * 0.8, 'z': cz + uz * m * 0.8, 'label': '（沒有櫃檯類互動點）'}
    # ① 人
    ppl = await pg.evaluate(PEOPLE_JS, rm['counter']); row['m']['people'] = ppl
    row['v']['1_clerk'] = 'PASS' if ppl['clerk'] > 0 else ('FAIL' if rm['counter'] else 'UNKNOWN')
    nc = await pg.evaluate("(z=>{ try{ return (typeof SHOPLIFE!=='undefined'&&SHOPLIFE.NO_CLERK&&SHOPLIFE.NO_CLERK[z])||null; }catch(e){ return null; } })", zid)
    if nc and ppl['clerk'] == 0:   # BB-C 11-14（BB_379）：SHOPLIFE.NO_CLERK 裡的店（洗樂、禮貌生財）照設計沒有店員＝例外 PASS，寫原因
        row['v']['1_clerk'] = 'PASS'; row['m']['no_clerk_reason'] = nc; R.note('%s ① 這間在 SHOPLIFE.NO_CLERK（照設計沒有店員）：%s→1_clerk 算 PASS（例外）' % (tag, nc))
    if CUST_HOURS and any(abs(h - ch) < 0.01 for ch in CUST_HOURS):   # BB-C 11-14 L118_KD：刀削麵新版 19:00 一個客人都沒有、舊版有——記在場客人、zone／座位，0 人＝FAIL
        cl = [p_ for p_ in ppl.get('people') or [] if not p_.get('clerkFlag')]
        R.note('%s 在場客人 %d（店員 %d）：%s' % (tag, ppl['customers'], ppl['clerk'], J([[p_.get('id'), p_.get('x'), p_.get('z'), p_.get('seat'), zid] for p_ in cl])))
        await pg.screenshot(path=os.path.join(OUT, '%s_%s_customers.png' % (zid, hh)))
        R.check('%s 客人至少 %d 個（%d）' % (tag, MIN_CUST, ppl['customers']), ppl['customers'] >= MIN_CUST, J(ppl.get('people'))[:600])
    # BB-C 07:19 ③：站進家具的店員、面壁的客人（0.45 m 內）各一張近照（從他正前方 1.8 m、0.9 m 高看腳和櫃台）
    for kind_, lst_ in (('furn', ppl.get('clerk_in_furniture') or []), ('wall', ppl.get('face_wall') or [])):
        for j_, q_ in enumerate(lst_[:4]):
            try:
                ry = await pg.evaluate("((a)=>{ const n=(GAME.E.npcs||[]).find(n=>n&&n.obj&&Math.abs(n.obj.position.x-a[0])<0.02&&Math.abs(n.obj.position.z-a[1])<0.02); return n?n.obj.rotation.y:null; })", [q_[1], q_[2]])
                if ry is None: continue
                fx, fz = math.sin(ry), math.cos(ry)
                u_ = await snap(pg, (q_[1] + fx * 1.8, 1.3, q_[2] + fz * 1.8), (q_[1], 0.7, q_[2]), 55)
                open(os.path.join(OUT, 'close_%s_%s_%s_%d.png' % (kind_, zid, hh, j_ + 1)), 'wb').write(base64.b64decode(u_['u'].split(',', 1)[1]))
            except Exception: pass
    row['v']['1b_people_pos'] = 'FAIL' if (ppl.get('clerk_in_furniture') or ppl.get('face_wall')) else ('PASS' if ppl['total'] else 'UNKNOWN')
    await pg.evaluate(D.HUD + '(false)'); await pg.wait_for_timeout(400)
    s1 = await snap(pg, (ex + ux * 1.0, by + 1.6, ez + uz * 1.0), (cx + ux * m * 0.8, by + 1.2, cz + uz * m * 0.8), 66)
    await pg.evaluate(HIDE_PEOPLE + '(true)')   # ⑦b 比色用：同一個鏡頭藏人（XS_REAL r1：進門那張玩家的頭擋在畫面上）
    s1h = await snap(pg, (ex + ux * 1.0, by + 1.6, ez + uz * 1.0), (cx + ux * m * 0.8, by + 1.2, cz + uz * m * 0.8), 66)
    await pg.evaluate(HIDE_PEOPLE + '(false)')
    await pg.evaluate(HIDE_PEOPLE + '(true)')   # PC GATE_CAL_1cd2：人站在窗前，泰米夜窗深藍只算到 42.9%＝誤判 PASS
    s2 = await snap(pg, (cx, by + 1.6, cz), (ex - ux * 2.0, by + 1.8, ez - uz * 2.0), 60, win=True, box=rm.get('box'))
    await pg.evaluate(HIDE_PEOPLE + '(false)')
    vx, vz = ex - ck['x'], ez - ck['z']; vm = math.hypot(vx, vz) or 1   # 11-12 BB-C 15:21：改從門口方向看櫃檯（原本往房間中心退 2.5 m，櫃檯離中心 <1 m 時退進後面的牆，19:00 全黑）
    back = min(2.5, max(1.0, vm * 0.8))
    s3 = await snap(pg, (ck['x'] + vx / vm * back, by + 1.6, ck['z'] + vz / vm * back), (ck['x'], by + 1.1, ck['z']), 60)
    sup = await snap(pg, (cx, by + 1.6, cz), (cx + 0.01, by + 8.0, cz + 0.3), 70)
    u5 = await pg.evaluate(GAMECAM)
    a1 = await pg.evaluate(ANA_JS, {'u': s1['u']}); a2 = await pg.evaluate(ANA_JS, {'u': s2['u'], 'rects': s2['rects']}); a3 = await pg.evaluate(ANA_JS, {'u': s3['u']})
    aup = await pg.evaluate(ANA_JS, {'u': sup['u']}); a5 = await pg.evaluate(ANA_JS, {'u': u5})
    # ② 窗景
    if a2['rects']:
        area = lambda r: (r['rect'][2] - r['rect'][0]) * (r['rect'][3] - r['rect'][1])
        main = max(a2['rects'], key=area); worst = max(a2['rects'], key=lambda r: r['top_pct']); row['m']['window'] = {'rects': a2['rects'][:6]}
        # 校正 r2（PC GATE_CAL 1cd2_r2／2771，CC 在雲端用電腦拍的圖算）：最大那一塊窗，和中間色差 ≤16 的像素比例 near_med_pct——
        #   有問題的 1cd2 泰米夜窗 67%（白天 65%）；修好的 2771 泰米 26%／18%、東南大聯 15%；日常失速 28～31%（門邊小塊的不算：面積小、雜）。
        nmp = main.get('near_med_pct', 0)
        if worst['top_pct'] > 80 or nmp >= WIN_HI: row['v']['2_window'] = 'FAIL'
        elif nmp >= WIN_LO: row['v']['2_window'] = 'UNKNOWN'
        else: row['v']['2_window'] = 'PASS'
        row['m']['window']['worst'] = [worst['top_pct'], worst['top_rgb'], worst['rect'][4]]; row['m']['window']['main'] = [nmp, main.get('med'), main['rect'][4], round(area(main), 3), main.get('edge_pct')]
    else:
        row['v']['2_window'] = 'UNKNOWN'; row['m']['window'] = {'why': '找不到窗玻璃的網格（名字／材質沒有 glass、window、窗，也沒有半透明材質）'}
    # ③ 天花板
    ce = await pg.evaluate(CEIL_JS, [cx, cz, by]); row['m']['ceiling'] = {'ray': ce, 'sky_up_pct': aup['sky_all_pct'], 'sky_top_entry': a1['sky_top_pct'], 'sky_top_counter': a3['sky_top_pct']}
    # 往上拍是主要證據（bd86 東南大聯沒天花板：往上 100% 天空，但射線打到 1.5 m 高的吊燈／彩旗，舊判法誤判 PASS）
    if ce.get('ceil') and 0.6 <= ce['ceil']['d'] <= 4.5: row['v']['3_ceiling'] = 'PASS'; row['m']['ceiling']['by'] = 'ray CEIL_*（上半偏藍 %s%% 只記：白天花板＋燈管會被當成天空，BB-C 11-14 a）' % aup['sky_all_pct']
    elif aup['sky_all_pct'] >= 30: row['v']['3_ceiling'] = 'FAIL'
    elif ce['hit'] and ce['d'] >= 1.0: row['v']['3_ceiling'] = 'PASS'
    else: row['v']['3_ceiling'] = 'UNKNOWN'
    # ④ 純色／洋紅
    mags = {k: a['magenta_pct'] for k, a in (('1', a1), ('2', a2), ('3', a3), ('5', a5))}; flat = {k: a['whole']['top_pct'] for k, a in (('1', a1), ('2', a2), ('3', a3), ('5', a5))}
    row['m']['solid'] = {'magenta': mags, 'flat_top_pct': flat}
    row['v']['4_solid'] = 'FAIL' if max(mags.values()) >= 0.5 else ('UNKNOWN' if max(flat.values()) >= 60 else 'PASS')
    # ⑥ 閃（固定鏡頭轉 0.05°）＋5 秒連拍
    if '6' in PARTS:
        z1 = await pg.evaluate(ZF_JS, {'from': [ex + ux * 1.0, by + 1.6, ez + uz * 1.0], 'at': [cx + ux * m * 0.8, by + 1.2, cz + uz * m * 0.8]})
        z2 = await pg.evaluate(ZF_JS, {'from': [cx, by + 1.6, cz], 'at': [ex - ux * 2.0, by + 1.8, ez - uz * 2.0]})
        bu = await pg.evaluate(BURST_JS, {'overlay': True, 'pan': PAN, 'strips': STRIPS})   # 11-12 BB-C 14:43：有人那一輪也切條圖（日和 20:30 有人 4 格翻、藏人 0 格，原本沒有條圖）
        await pg.evaluate(HIDE_PEOPLE + '(true)'); bu2 = await pg.evaluate(BURST_JS, {'overlay': True, 'strips': STRIPS, 'pan': PAN}); await pg.evaluate(HIDE_PEOPLE + '(false)')
        for st_ in (bu2.pop('strips', None) or []):   # 藏人那一輪的翻動格子：同一格 12 張並排（上面 ms＝連拍開始後幾毫秒、g＝遊戲時間）
            open(os.path.join(OUT, 'strip_%s_%s_b%02d_r%dc%d_f%d.jpg' % (zid, hh, st_['i'], st_['by'], st_['bx'], st_['flips'])), 'wb').write(base64.b64decode(st_['url'].split(',', 1)[1]))
        for st_ in (bu.pop('strips', None) or []):   # 有人那一輪（檔名 _people）
            open(os.path.join(OUT, 'strip_%s_%s_people_b%02d_r%dc%d_f%d.jpg' % (zid, hh, st_['i'], st_['by'], st_['bx'], st_['flips'])), 'wb').write(base64.b64decode(st_['url'].split(',', 1)[1]))
        # BB-C 07:19 ②：翻動的格子圈在截圖上（數字＝翻幾次）；另外把人都藏起來再連拍一次＝分得出是人在走還是真的閃
        for nm_, x_ in (('', bu), ('_nopeople', bu2)):
            if x_.get('img'): open(os.path.join(OUT, 'burst_%s_%s%s.jpg' % (zid, hh, nm_)), 'wb').write(base64.b64decode(x_['img'].split(',', 1)[1]))
            x_.pop('img', None)
        row['m']['burst_nopeople'] = {'blocks_flipping': bu2.get('blocks_flipping'), 'max_flips': bu2.get('max_flips')}
        zmax = max(z1['median'], z2['median']); row['m']['flicker'] = {'zf_entry': z1, 'zf_window': z2, 'burst': bu}
        # 校正 r2：0.05° 成對差在正常和已知會閃的店都在 0.2～1.1%（鋸齒），分不出來＝只當參考；改看連拍：同一格畫面亮度來回翻 ≥3 次的格子數
        #   0 格＝PASS；1～2 格＝UNKNOWN（交 BB 看連拍）；≥ BURST_FAIL 格＝FAIL（暫定，等有已知會閃的室內再校正）
        # 11-12 BB-C 14:43（日和 20:30）：有人那一輪翻的格子多半是客人在走；機器判改看藏人那一輪，有人那一輪只記（兩輪的格子都切條圖）
        nb = (bu2 or {}).get('blocks_flipping', 0) or 0
        row['m']['burst_people'] = {'blocks_flipping': (bu or {}).get('blocks_flipping'), 'max_flips': (bu or {}).get('max_flips'), 'flip3': [i for i, v in enumerate((bu or {}).get('per') or []) if v >= 3]}
        row['m']['cam_drift_mm'] = {'burst': (bu or {}).get('cam_drift_mm'), 'burst_nopeople': (bu2 or {}).get('cam_drift_mm'), 'game_cam': [(bu or {}).get('game_cam_drift_mm'), (bu2 or {}).get('game_cam_drift_mm')], 'settle': [(bu or {}).get('settle'), (bu2 or {}).get('settle')]}
        row['v']['6_flicker'] = 'PASS' if nb == 0 else ('FAIL' if nb >= BURST_FAIL else 'UNKNOWN')
        if max(row['m']['cam_drift_mm']['burst'] or 0, row['m']['cam_drift_mm']['burst_nopeople'] or 0) > 5: row['v']['6_flicker'] = 'INVALID'   # BB-C 11:43：拍照鏡頭漂 >5 mm＝這次連拍不能判（不標 FAIL）
        R.note('%s ⑥ 連拍鏡頭：拍照鏡頭漂 %s／%s mm、遊戲鏡頭漂 %s mm；開拍前等穩 %s' % (tag, row['m']['cam_drift_mm']['burst'], row['m']['cam_drift_mm']['burst_nopeople'], row['m']['cam_drift_mm']['game_cam'], J(row['m']['cam_drift_mm']['settle'])))
    await pg.evaluate(D.HUD + '(true)')
    # ⑦ 做得到
    fn = None
    if '7' in PARTS:
        try: fn = await do_func(pg, cdp, tag, rm, zid)
        except Exception as e: fn = {'error': repr(e)[:200]}
        row['m']['func'] = fn
        vs = [x.get('verdict') for x in (fn or {}).values() if isinstance(x, dict)]
        row['v']['7_func'] = 'FAIL' if 'FAIL' in vs or (fn or {}).get('error') else ('UNKNOWN' if 'UNKNOWN' in vs else 'PASS')
    # ⑤ 店外往裡看（三個位置）
    sp = rm['exit']['spawn']; oz = rm['exit']['to']; s4 = s4l = s4r = None
    if sp and oz and '5' in PARTS:
        s2z = await D.load_zone(pg, cdp, oz, DAY, h, x=sp['x'], z=sp['z'], yaw=sp.get('yaw', 0.0), wait=8000)
        R.setup('%s 【前置／捷徑】讀檔到門外 %s (%.2f, %.2f)' % (tag, oz, sp['x'], sp['z']))
        await pg.evaluate(SETTLED); await pg.wait_for_timeout(1500)
        oy = sp.get('yaw', 0.0); fx, fz = math.sin(oy), math.cos(oy); px, pz = fz, -fx
        tgt = (sp['x'] - fx * 2.0, 1.4, sp['z'] - fz * 2.0); base = (sp['x'] + fx * 2.5, 1.6, sp['z'] + fz * 2.5)
        # 11-14 BB-C c：L118 的店外鏡頭照出生點的朝向，對著巷子、沒對到店面——改成對準這間店的櫥窗（Z3.shopWindowRects 四角中心）或進這間店的門（出口 to＝這一區）
        aim = await pg.evaluate(AIM_JS, {'zid': zid, 'sx': sp['x'], 'sz': sp['z']}); row['m']['outside_aim'] = aim
        if aim and aim.get('c'):
            ax, az = aim['c'][0], aim['c'][2]; dx, dz = sp['x'] - ax, sp['z'] - az; dd = math.hypot(dx, dz)
            if dd < 0.5: dx, dz, dd = fx, fz, 1.0
            ux, uz = dx / dd, dz / dd; back = max(3.5, min(6.0, dd + 1.0))
            tgt = (ax, 1.4, az); base = (ax + ux * back, 1.6, az + uz * back); fx, fz = ux, uz; px, pz = uz, -ux
        # 左右 1.5 m 那兩張：位置站不住（柱子、牆）就往中間收到 1.0／0.6 m（11-14 BB-C：L118 店外右 1.5 m 卡進柱子）
        side = {}
        for sg in (-1, 1):
            if SIDE_OFF: side[sg] = ((base[0] + sg * px * SIDE_OFF, base[2] + sg * pz * SIDE_OFF), SIDE_OFF); continue
            for off in (1.5, 1.0, 0.6):
                q = (base[0] + sg * px * off, base[2] + sg * pz * off)
                if await pg.evaluate("(a=>{ try{ return !!GAME.E.canStand(a[0],a[1],0.25,0); }catch(e){ return true; } })", list(q)): side[sg] = (q, off); break
            else: side[sg] = ((base[0] + sg * px * 0.6, base[2] + sg * pz * 0.6), 0.6)
        row['m']['outside_side_offsets'] = {'L': side[-1][1], 'R': side[1][1]}
        row['m']['outside_cams'] = {'base': [round(v, 2) for v in base], 'L': [round(v, 2) for v in side[-1][0]], 'R': [round(v, 2) for v in side[1][0]], 'tgt': [round(v, 2) for v in tgt], 'px_pz': [round(px, 3), round(pz, 3)]}
        R.note('%s ⑤ 店外鏡頭位置 %s' % (tag, J(row['m']['outside_cams'])))   # BB-C 11-14：禮貌生財店外中／左兩張構圖一樣——記下三個鏡頭的位置
        await pg.evaluate(D.HUD + '(false)')
        await pg.evaluate(HIDE_PEOPLE + '(true)')  # 視差只看店面：玩家、路人在畫面中間會把差值灌高
        s4 = await snap(pg, base, tgt, win=True, near=[tgt[0], tgt[2], 4.5]); s4l = await snap(pg, (side[-1][0][0], 1.6, side[-1][0][1]), tgt); s4r = await snap(pg, (side[1][0][0], 1.6, side[1][0][1]), tgt)
        await pg.evaluate(HIDE_PEOPLE + '(false)'); await pg.evaluate(D.HUD + '(true)')
        pd = await pg.evaluate(CROPDIFF_JS, {'us': [s4l['u'], s4['u'], s4r['u']]}); a4 = await pg.evaluate(ANA_JS, {'u': s4['u']})
        # 判法改射線（PC GATE_CAL：左右移 1.5 m 連平面圖的畫面也整個變，像素差不能分立體）：從店外鏡頭往門面打 24×16 條，略過玻璃、半透明、人；
        # 門面距離＝最常見的距離（0.25 m 一格），門面後面 0.8 m 以上還打得到東西的比例＝deep；平面圖／貼在玻璃後面的卡片 deep≈0
        # 窗的範圍：從店外鏡頭打 48×27 條，第一個打到玻璃（名字 glass／玻璃或半透明）的格子＝窗；整條街的玻璃合成一塊網格時 bbox 投影不準（南洋 r1 地板框落到騎樓）
        _gr = await pg.evaluate(GLASSRECT_JS, {'from': list(base), 'at': list(tgt)})
        _rr = [r for r in (s4.get('rects') or []) if (r[2] - r[0]) * (r[3] - r[1]) < 0.6]
        _wr = await pg.evaluate(WINRECT_JS, {'from': list(base), 'at': list(tgt), 'zid': zid}); row['m']['win_rect_data'] = _wr
        # 有 Z3.shopWindowRects（PLACE-GATE-WINDOW-RECT-1112，LAWWW-C 08:23）＝用這間店自己的櫥窗四角投影，不會混到隔壁；沒有才用射線找玻璃
        # TZ_REAL_consist（2bfea29f）：沒有 shopWindowRects 的版本，射線找到的「玻璃」是店門口展示台的小玻璃（面積 1.5～3%）→ 框到店外的展示物。太小（面積 <6% 或寬 <15%）的不用、換下一個來源，最後固定框
        _cands = ([(_wr['rect'], 'shopWindowRects')] if _wr.get('rect') else []) + ([(_gr['rect'], 'raycast_glass')] if _gr.get('rect') else []) + ([(max(_rr, key=lambda r: (r[2] - r[0]) * (r[3] - r[1]))[:4], 'window_proj')] if _rr else [])
        _skip = []; _win = None
        for _r, _src in _cands:
            _a = (_r[2] - _r[0]) * (_r[3] - _r[1])
            if _a >= 0.06 and (_r[2] - _r[0]) >= 0.15: _win = list(_r[:4]) + [_src]; break
            _skip.append([_src, round(_a, 3)])
        if _win is None: _win = [0.2, 0.33, 0.78, 0.8, 'fixed' + ('（%s 太小）' % '、'.join('%s %.1f%%' % (x[0], x[1] * 100) for x in _skip) if _skip else '')]
        row['m']['win_rect_skipped'] = _skip
        row['m']['glass_rect'] = _gr
        rays = await pg.evaluate(DEPTH_JS, {'from': list(base), 'at': list(tgt), 'rect': [max(0, _win[0]), max(0, _win[1]), min(1, _win[2]), min(1, _win[3])]})
        # BB-C 06:26（X352 SHOP-WINDOW-3D）：店外也連拍——遊戲鏡頭在門外，邊轉 5 秒（同 BURST_JS），看櫥窗裡有沒有閃
        try:
            ob = await pg.evaluate(BURST_JS, {'overlay': True})
            await pg.evaluate(HIDE_PEOPLE + '(true)'); ob2 = await pg.evaluate(BURST_JS, {'overlay': True}); await pg.evaluate(HIDE_PEOPLE + '(false)')
            for nm_, x_ in (('', ob), ('_nopeople', ob2)):
                if x_.get('img'): open(os.path.join(OUT, 'burst_out_%s_%s%s.jpg' % (zid, hh, nm_)), 'wb').write(base64.b64decode(x_['img'].split(',', 1)[1]))
                x_.pop('img', None); x_.pop('per', None)
            row['m']['outside_burst'] = ob; row['m']['outside_burst_nopeople'] = ob2
        except Exception as e: row['m']['outside_burst'] = {'error': repr(e)[:120]}
        row['m']['parallax'] = {'pixel_diff_info_only': pd, 'rays': rays}; row['m']['outside_magenta'] = a4['magenta_pct']
        # X352 r2：大步舊版（照片卡片放在門面後面）和新版（立體店內）deep 一樣＝deep 分不出卡片；改看門面後面打到的深度分散（p90−p10）
        bn, bsp = rays.get('behind_n', 0), rays.get('behind_spread')
        row['v']['5_parallax'] = 'FAIL' if bn < 6 else ('UNKNOWN' if bsp is None else ('PASS' if bsp >= SPR_HI else ('FAIL' if bsp < SPR_LO else 'UNKNOWN')))
        _hn = rays.get('hit_names') or []; _top = _hn[0] if _hn else None
        if _top and rays.get('n') and _top[1] >= 0.8 * rays['n'] and re.search(r'zone|merged|static', _top[0], re.I) and row['v']['5_parallax'] != 'PASS':
            # 11-14 BB-C b：汀州路店內和街道合成一個網格（tingzhou_zone），射線分不出門面和店內——不能寫 FAIL，改 UNKNOWN＋三張圖給 BB 看
            row['m']['parallax']['why'] = '射線 %d／%d 打到同一個合併網格「%s」，分不出門面和店內（看 ⑤ 店外 中／左／右 三張）' % (_top[1], rays['n'], _top[0]); row['v']['5_parallax'] = 'UNKNOWN'
        # ⑦b 店外看到的和走進去一致（使用者 06:4x：「大步球鞋店外面看進去牆壁是灰色 可是人在店裡面居然墻壁是木頭的……你應該審查所有的店面會不會有一樣的問題」；BB-C 06:46）
        #   店外中間那張：最大那塊窗（從店外投影的窗玻璃框）上半＝牆、下半＝地板 的平均色；進門全景：畫面中上（x 0.2～0.8、y 0.15～0.45）＝牆、下面（x 0.25～0.75、y 0.8～0.97）＝地板
        #   色差＝RGB 距離；兩個都 ≤ CON_LO＝PASS、任一 ≥ CON_HI＝FAIL（★）、中間＝UNKNOWN（暫定門檻，等大步 FAIL 那一間校正）
        if s1:
            # 窗的範圍用上面射線找到的（_win：raycast_glass ＞ 門口附近的窗投影 ＞ 固定框）；地板框不會低於窗的下框（BB-C 07:51：南洋 r1 地板框落在騎樓地面）
            big = _win
            x0, y0, x1, y1 = big[:4]; w_, h_ = x1 - x0, y1 - y0
            regs = {'out_wall': [x0 + w_ * 0.15, y0 + h_ * 0.25, x1 - w_ * 0.15, y0 + h_ * 0.55], 'out_floor': [x0 + w_ * 0.15, y0 + h_ * 0.66, x1 - w_ * 0.15, y1 - h_ * 0.08],   # 11-12 BB-C 15:21：r 框到雨遮和招牌 → 往內、往下收到玻璃以內
                    'in_wall': [0.15, 0.3, 0.85, 0.6], 'in_floor': [0.25, 0.8, 0.75, 0.97]}   # 牆往下移（r1 框到天花板的燈）
            mo = await pg.evaluate(MEANS_JS, {'u': s4['u'], 'regs': {k: v for k, v in regs.items() if k.startswith('out')}})
            mi = await pg.evaluate(MEANS_JS, {'u': s1h['u'], 'regs': {k: v for k, v in regs.items() if k.startswith('in')}})
            # 比色改看色調和飽和度（Lab 的 a、b；不看亮度 L）：木頭 vs 灰是色調差，店裡燈亮暗不算（XS_REAL r1：RGB 距離被亮度、天花板燈灌大）
            def lab(c):
                def lin(v):
                    v = v / 255.0
                    return v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4
                r_, g_, b_ = [lin(v) for v in c]
                X = (0.4124 * r_ + 0.3576 * g_ + 0.1805 * b_) / 0.95047; Y = 0.2126 * r_ + 0.7152 * g_ + 0.0722 * b_; Z = (0.0193 * r_ + 0.1192 * g_ + 0.9505 * b_) / 1.08883
                f = lambda t: t ** (1 / 3) if t > 0.008856 else 7.787 * t + 16 / 116
                return (116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z)))
            dab = lambda a, b: round(math.hypot(lab(a)[1] - lab(b)[1], lab(a)[2] - lab(b)[2]), 1)
            dist = lambda a, b: round(math.sqrt(sum((a[i] - b[i]) ** 2 for i in range(3))), 1)
            dw, df = dab(mo['out_wall'], mi['in_wall']), dab(mo['out_floor'], mi['in_floor'])
            rgb_w, rgb_f = dist(mo['out_wall'], mi['in_wall']), dist(mo['out_floor'], mi['in_floor'])
            row['m']['consistent'] = {'out': mo, 'in': mi, 'd_wall': dw, 'd_floor': df, 'rgb_wall': rgb_w, 'rgb_floor': rgb_f, 'metric': 'Lab Δab', 'win_rect': [round(v, 3) for v in big[:4]], 'rect_from': big[4] if len(big) > 4 else '', 'regs': {k: [round(v, 3) for v in r] for k, r in regs.items()}}
            row['v']['7b_consistent'] = 'FAIL' if max(dw, df) >= CON_HI else ('PASS' if max(dw, df) <= CON_LO else 'UNKNOWN')
            pair = await pg.evaluate(PAIR_JS, {'a': s4['u'], 'b': s1h['u'], 'ra': [regs['out_wall'], regs['out_floor']], 'rb': [regs['in_wall'], regs['in_floor']],
                                               'title': '%s %s 店外（左）vs 進門（右，藏人）  牆 Δab %.0f  地板 Δab %.0f  %s  框：%s' % (rm['name'], hh, dw, df, '★不一致' if row['v']['7b_consistent'] == 'FAIL' else row['v']['7b_consistent'], big[4] if len(big) > 4 else '')})
            open(os.path.join(OUT, 'consist_%s_%s.jpg' % (zid, hh)), 'wb').write(base64.b64decode(pair.split(',', 1)[1]))
        else:
            row['v']['7b_consistent'] = 'UNKNOWN'; row['m']['consistent'] = {'why': '店外看不到窗玻璃的網格（投影不到）或沒有進門那張'}
    elif '5' in PARTS:
        row['v']['5_parallax'] = 'UNKNOWN'; row['m']['parallax'] = {'why': '出口沒有 spawn／to'}
    if '5' in PARTS and '7b_consistent' not in row['v']:   # BB-C 08:08：每間一定要有 consist 並排圖；沒有＝那間 ⑦b 沒驗，要看得出來
        row['v']['7b_consistent'] = 'UNKNOWN'; row['m'].setdefault('consistent', {'why': '沒有店外鏡頭（出口沒有 spawn／to）或店外那一段中斷＝⑦b 沒驗、沒有並排圖'})
    errs = cons[c0:]; row['m']['console'] = errs[:5]
    row['v']['7_console'] = 'PASS' if not errs else 'FAIL'
    # 拼圖
    labels = ['① 進門全景', '② 往窗外（青框＝窗網格）', '③ 櫃檯：' + ck['label'][:8], '③ 往上（天花板）', '⑤ 店外 中', '⑤ 店外 左 1.5 m', '⑤ 店外 右 1.5 m', '遊戲鏡頭']
    urls = [s1['u'], s2['u'], s3['u'], sup['u'], s4 and s4['u'], s4l and s4l['u'], s4r and s4r['u'], u5]
    fl = ['', '' if row['v'].get('2_window') == 'PASS' else row['v'].get('2_window', ''), '', '' if row['v'].get('3_ceiling') == 'PASS' else row['v'].get('3_ceiling', ''),
          '' if row['v'].get('5_parallax') in ('PASS', None) else row['v'].get('5_parallax'), '', '', '']
    verdict = '  '.join('%s=%s' % (k, v) for k, v in sorted(row['v'].items()))
    sh = await pg.evaluate(SHEET_JS, {'urls': urls, 'labels': labels, 'flags': fl, 'rects': [None, [r['rect'] for r in a2.get('rects', [])], None, None, None, None, None, None],
                                      'title': '%s %s %s（%s，%s）' % (rm['name'], zid, hh, TAG, SHA[:9]), 'verdict': verdict})
    open(os.path.join(OUT, 'gate_%s_%s.jpg' % (zid, hh)), 'wb').write(base64.b64decode(sh.split(',', 1)[1]))
    for i, u in enumerate(urls):
        if u: open(os.path.join(OUT, 'gate_%s_%s_%d.png' % (zid, hh, i + 1)), 'wb').write(base64.b64decode(u.split(',', 1)[1]))
    R.note('%s 【機器判】%s；證據 %s' % (tag, verdict, J({k: row['m'].get(k) for k in ('people', 'ceiling', 'parallax', 'solid')})))
    R.note('%s 窗 %s；閃 %s；做得到 %s' % (tag, J(row['m'].get('window')), J({k: (v.get('median') if isinstance(v, dict) and 'median' in v else v) for k, v in (row['m'].get('flicker') or {}).items()}), J(fn)[:600]))
    for k, v in sorted(row['v'].items()):
        if v == 'FAIL': R.check('%s %s 機器判 FAIL' % (tag, k), False, J(row['m'].get({'1_clerk': 'people', '1b_people_pos': 'people', '7b_consistent': 'consistent', '2_window': 'window', '3_ceiling': 'ceiling', '4_solid': 'solid', '5_parallax': 'parallax', '6_flicker': 'flicker', '7_func': 'func', '7_console': 'console'}.get(k, k)))[:400])
        elif v == 'UNKNOWN': R.check('%s %s 機器判不出來＝UNKNOWN（交 BB 看圖；不能當 PASS）' % (tag, k), False, J(row['m'].get({'1_clerk': 'people', '1b_people_pos': 'people', '7b_consistent': 'consistent', '2_window': 'window', '3_ceiling': 'ceiling', '4_solid': 'solid', '5_parallax': 'parallax', '6_flicker': 'flicker', '7_func': 'func'}.get(k, k)))[:400])
        elif v == 'INVALID': R.check('%s %s＝INVALID（連拍鏡頭漂 >5 mm，這次不能判；不算 FAIL，要重拍）' % (tag, k), False, J(row['m'].get('cam_drift_mm')))
    if ENTERCAM and rm.get('exit') and rm['exit'].get('spawn') and rm['exit'].get('to'):
        try: row['m']['enter'] = await enter_cam(pg, cdp, tag, rm, zid, h)
        except Exception as e: row['m']['enter'] = {'error': repr(e)[:200]}
        R.note('%s 進門那一下：%s' % (tag, J(row['m']['enter'])))
    rows.append(row)


async def main():
    print('CC 地點關卡第二層：TAG %s；SHA %s；ZONES %s；HOURS %s；Windows＋GPU ≠ iPhone' % (TAG, SHA or '?', ','.join(ZONES), HOURS), flush=True)
    rows = []; cons = []
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        pg.on('console', lambda m: cons.append(m.text[:200]) if m.type == 'error' else None)
        pg.on('pageerror', lambda e: cons.append('pageerror: ' + str(e)[:200]))
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); sys.exit(1)
        for zid in ZONES:
            for h in HOURS:
                try: await gate_zone(pg, cdp, zid, h, rows, cons)
                except Exception as e: R.check('[%s %s] 沒有中斷' % (zid, h), False, repr(e)[:300])
                open(os.path.join(OUT, 'gate_%s.json' % TAG), 'w', encoding='utf-8').write(J({'sha': SHA, 'tag': TAG, 'rows': rows}))
        await b.close()
    summ = {}
    for r in rows:
        for k, v in (r.get('v') or {}).items(): summ.setdefault(k, {}).setdefault(v, []).append('%s@%s' % (r['zone'], r['hour']))
    print('【總表】' + J(summ), flush=True)
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
