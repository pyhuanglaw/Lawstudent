"""CC（帳號 A）11-11：三件事一支探針（BB 交辦；受測＝開發分支 f5e1ef4e8，舊版對照 65212b697＝G10 還是鐵捲門、上師沒有 3D 人物、沛珊第二批還沒合）。
Windows＋GPU（PC runner）≠ iPhone；雲端 SwiftShader 只做探針自檢，結果不算判定。判定歸 BB（角色美術 LAWWW 標）：探針只 R.check（功能：出現、位置、開收時間、走得過去、字對不對）／R.note 照實記、照片拍清楚。
每一個 PART 開一個新的瀏覽器（模型下載計時要從乾淨的快取開始）。讀檔後遊戲時間一直走（PC 約 0.45 遊戲分鐘／秒）：判開收一律用「那一刻的 G.hour」。
對照的程式（f5e1ef4e8）：
  src/limao3d.js 160～180 行：S.placeMaster（STORY.populate('tingzhou') 後坐到 TINGZHOU_LAYOUT.limao.table.seatMaster (29.35,4.6) yaw π，addNPC pose sit、frozen、isExtra）、
    S.masterShow（n.obj.visible＝S.canTalk：19:00～23:30、不颱風、他在、法律系學期）——只在 applyTimeOutdoor（engine3d.js 281 行：每 5 幀一次）設；engine3d.js 405 行 updateNPC 每一幀照視錐重設 o.visible（看 n.hidden）。
    S.masterModel：lazy，第一次進汀州路才 ASSETS.loadOne('char.limao_shangshi')（assets3d.js 251 行，lazy:true）；到之前 CHAR.build 的備用人藏著（userData.degradedHidden），GM.upgradeModels（game3d.js 223 行，每 1.5 秒）換上。
    S.who('ms')：人物在這區、看得到才帶 obj（說話時帶他的人物）。
  src/zones3d.js 937～948 行：公館店面街 shops[10]＝G10 lane:true（套件畫暗的開口＋門楣；正式模型 gongguan_shops.glb）、G09 shut:true（鐵捲門）；柱子例外清單多 10＝G10 騎樓中間沒有柱子（世界 (G10 中心 x, 19.3)）。
    「往汀州路（巷子）」tzGate 互動點＝(37.1, 21) r1.6（zones3d.js 146 行）；汀州路「往公館（羅斯福路）」(28.6,0) r1.4 → 公館 (37.1,18) yaw π（tingzhou_layout.js 53 行）。
  沛珊第二批（merge 7d365bfb4）：src/data/ladder.js（byTerm Y1S2／Y2S1／Y3S1／Y3S2／Y4S1／Y4S2）、heroine_arcs.js（八拍）、feed_y1s1.js ps4…feed_pg.js ps2i（動態牆八則）、
    fest_events.js（節日）、r2y4b_events.js ev_peishan_open_class（4/14 公開課媽媽）、termend_opts.js GF.classmate_peishan.tableByTerm.Y4S2（6/8 台南，r2y4b3d.js psDinner）。
    每組第一句、最後一句的期望字＝fixtures/ps_batch2/expect.json（git show 兩個 SHA 抽的，extract.js）。
PARTS：
  SS_WALK  ②a 走進去計時：【前置／捷徑】讀檔到公館 G10 巷口前 (37.1,17.5) 19:54（大一上、法律系、沒有 LM_*）→ 真的走到「往汀州路（巷子）」按 → 進汀州路那一刻開始計：
           上師 NPC 什麼時候建好、桌後是空的（備用人藏著 degradedHidden）還是有人、正式模型（driver vrm、key char.limao_shangshi）幾秒出現；出現那一刻遊戲截圖。
  SS_MAIN  ②a 讀檔計時（另一個乾淨的瀏覽器）：【前置／捷徑】直接讀檔到汀州路算命桌前 20:00，同樣記；
           ②b 20:00 正面近拍、左右側面近拍、客人位置斜看（SNAP 全尺寸，獨立相機）＋遊戲畫面；坐的高度（身體最低點 vs 椅面，射線量）、腳底 vs 地面、面向（rotation.y 和肩線兩種 vs 客人座位 seatGuest 的方向角差）；
           ②c 18:00、18:56→19:00 以後、20:00、23:25→23:30 以後、23:40：每個時間連續 3 秒逐幀記 obj.visible／看得到（不是 degradedHidden）的幀數，遊戲截圖＋SNAP；
           ②d 19:36 從巷 A 真的走到算命桌按「算命桌」→ 初次見面：上師第一句、第二句時頭的投影位置（遊戲鏡頭）、對話框 rect、頭有沒有被框蓋住、那一點最上面是什麼、這句帶不帶 obj；截圖。
           ②e console 的 error／warning 全記。
  G10      ①a G10 正面 12:00、20:00（SNAP＋遊戲）；①b 走到巷口往裡看（遊戲＋SNAP）、搖桿直直往裡推到停下來、停下來的地方往裡看／往回看（遊戲）、【捷徑】相機放在通道裡往裡、往回看；
           通道 x 37.1 每 0.5 m 站不站得住；①c 巷口的按鈕是「往汀州路（巷子）」→ 按 → 汀州路（出生點）→ 走到「往公館」按 → 回公館落在哪；
           ①d 搖桿（照 E.pathTo 前方 1.5 m 推、近目標推輕；cc_fn_lib.joy_to）：沿柱子那一排 z 19.3 從 G10 西到東來回兩趟（直線）、x＝G10 中心從人行道穿過騎樓來回兩趟（直線），記卡住、跳、walkFallbacks；
           ①e G09 正面（鐵捲門）。
  PS2      ③b 沛珊第二批六組（PSG＝lad,arc,feed,fest,open,tn）：每組【捷徑】用遊戲自己的播放函式演（STORY.ladPlay／ARCS.play／FEED 動態頁／FEST.play／EVENTS.run／R2Y4B.psDinner），
           字從 DOM 讀（#dlgName、#dlgText、GAME.D.full；動態頁讀卡片 innerText）；第一句、最後一句各一張截圖（ps2_<組>_first／last.jpg），每一句另存 ps2_<組>_<序號>.jpg；
           比對 fixtures/ps_batch2/expect.json 的受測 SHA（SHA 前 9 碼；沒有就用 f5e1ef4e8）那一份；同時記是不是另一版（舊稿）的字；所有句子不能是空的、不能有 undefined。
雲端自檢（11-11，SwiftShader，不算判定）發現：18:00、23:32、23:41（收著）上師 3 秒裡 8～9／10 幀照樣畫出來、閃 3～4 次——S.masterShow 只在 applyTime（每 5 幀）設 visible，
  updateNPC 每一幀照視錐蓋回 true（engine3d.js 405 行；events3d.js 107 行的註解就是這件事：要設 n.hidden）。PC 上照跑確認。
用法：LW_TESTS=<wt>/tests SHA=<40 碼> PARTS=SS_WALK,SS_MAIN,G10,PS2 [PSG=lad,arc,feed,fest,open,tn] python3 cc_ss3d_g10_ps2_probe.py <url> <out>
  只跑幾步（自檢用）：SS_STEPS=a,b,c,d（SS_MAIN；a 讀檔計時一定跑）、G10_STEPS=a,b,c,d、PS_TERMS=Y1S2,…（階梯的學期）"""
import os, sys, json, asyncio, time, base64, math, shutil
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
import cc_fn_lib as F
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
PARTS = (os.environ.get('PARTS') or 'SS_WALK,SS_MAIN,G10,PS2').split(',')
PSG = (os.environ.get('PSG') or 'lad,arc,feed,fest,open,tn').split(',')
SS_STEPS = (os.environ.get('SS_STEPS') or 'a,b,c,d').split(',')
G10_STEPS = (os.environ.get('G10_STEPS') or 'a,b,c,d').split(',')   # G10 只跑其中幾步（a 照片；b 巷口、通道；c 按鈕來回；d 搖桿）   # SS_MAIN 只跑其中幾步（雲端自檢用；PC 照預設全跑）
SHA = os.environ.get('SHA') or ''
R = L.Run('ss3d_g10_ps2', OUT); F.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
PS = 'classmate_peishan'
MK = 'char.limao_shangshi'
SEAT_M = (29.35, 4.6); SEAT_G = (29.35, 3.05); TABLE_AT = (28.3, 3.3); LANE = (27.0, -0.5)   # 配置讀不到時（f5e1ef4e8 tingzhou_layout.js 91 行）
CONSOLE = []


def hhmm(h):
    h = h % 24; return '%02d:%02d' % (int(h), int(round((h % 1) * 60)) % 60)


def save(u, fn):
    if u: open(os.path.join(OUT, fn), 'wb').write(base64.b64decode(u.split(',', 1)[1]))


# ---------------------------------------------------------------- 遊戲裡讀的東西
ME = "(()=>{ const E=GAME.E, P=E.player, p=P.obj.position; return {zone:GAME.G.zone, h:+(+GAME.G.hour).toFixed(3), x:+p.x.toFixed(2), z:+p.z.toFixed(2), ry:+P.obj.rotation.y.toFixed(3), lv:P.lv|0, stand:E.canStand?!!E.canStand(p.x,p.z,0.3,P.lv|0):null, ent:!!(GAME.isEntering&&GAME.isEntering()), busy:!!P.busy, fb:GAME.walkFallbacks|0}; })()"
ITS = "(()=>(GAME.E.interactables||[]).filter(i=>!i.hidden).map(i=>({label:i.label,x:+i.x.toFixed(2),z:+i.z.toFixed(2),r:i.radius||1.2,to:i.exit?i.exit.to:null,gate:!!i.tzGate,lm:!!i.lmTable})))()"
LAYJS = "(()=>{ const T=typeof TINGZHOU_LAYOUT!=='undefined'?TINGZHOU_LAYOUT:null; return T&&T.limao?{table:T.limao.table||null, from:T.limao.from, to:T.limao.to}:null; })()"
DAYS = r"""(()=>{ for(let d=-420; d<2600; d++){ let t=null, id=null; try{ t=CALENDAR.termOf(d); id=(typeof STORY!=='undefined'&&STORY.termAt)?STORY.termAt(d):(t&&t.id); }catch(e){}
    if(!id||!/^Y1S1/.test(id)||!t||t.week!==6) continue; try{ if(CALENDAR.typhoon&&(CALENDAR.typhoon(d)||CALENDAR.typhoon(d+1))) continue; }catch(e){}
    let dk=null; try{ dk=CALENDAR.dateOf(d).key; }catch(e){} return {day:d, id, week:t.week, date:dk}; } return null; })()"""
DAYOF = "(k=>{ if(typeof STORY!=='undefined'&&STORY.dayOfKey) return STORY.dayOfKey(k); for(let d=0;d<4000;d++){ try{ if(CALENDAR.dateOf(d).key===k) return d; }catch(e){} } return null; })"
# 上師 NPC 的狀態（f5e1ef4e8 limao3d.js：LM.masterNpc、MODEL_KEY、_mFail；CHAR：userData.driver／key／wantModel／degradedHidden）
MS = r"""(()=>{ const E=GAME.E, G=GAME.G, X=typeof LM!=='undefined'?LM:null; if(!X) return {lm:false}; const z=E.zone||{}, n=X.masterNpc;
  const r={lm:true, api:!!X.placeMaster, has:!!n, zone:G.zone, ent:!!(GAME.isEntering&&GAME.isEntering()), h:+(+G.hour).toFixed(3), canTalk:X.canTalk?!!X.canTalk(G,z):null, term:X.term?X.term(G):null, open:z.tzLimao?!!z.tzLimao.open:null,
    off:!!z.tzLimaoOff, away:!!z.tzLimaoAway, key:X.MODEL_KEY||null, fail:!!X._mFail, loading:!!X._mLoading, assetHas:(typeof ASSETS!=='undefined'&&ASSETS.has&&X.MODEL_KEY)?!!ASSETS.has(X.MODEL_KEY):null};
  if(!n||!n.obj) return r; const o=n.obj, u=o.userData||{};
  Object.assign(r,{inNpcs:(E.npcs||[]).includes(n), vis:!!o.visible, hidden:!!n.hidden, driver:u.driver||null, ukey:u.key||null, want:u.wantModel||null, degr:!!u.degradedHidden,
    kidsVis:o.children.filter(c=>c.visible).length, kids:o.children.length, x:+o.position.x.toFixed(3), y:+o.position.y.toFixed(3), z:+o.position.z.toFixed(3), ry:+o.rotation.y.toFixed(3), pose:n.pose||null, seat:n.seat||null});
  r.model=r.driver==='vrm'&&r.ukey===r.key; r.shown=r.vis&&!r.degr&&r.kidsVis>0; return r; })()"""
# 逐幀取樣：排在遊戲那一格 requestAnimationFrame 後面（遊戲的 frame 先登記），看到的是那一格畫出來的狀態
VISF = r"""(ms=>new Promise(res=>{ const t0=performance.now(); let n=0, v=0, s=0, m=0, flips=0, last=null; const f=()=>{ const X=typeof LM!=='undefined'?LM:null, q=X&&X.masterNpc; n++;
    if(q&&q.obj){ const o=q.obj, u=o.userData||{}, sh=o.visible&&!u.degradedHidden&&o.children.some(c=>c.visible); if(o.visible) v++; if(sh) s++; if(u.driver==='vrm'&&u.key===X.MODEL_KEY) m++; if(last!==null&&last!==sh) flips++; last=sh; }
    if(performance.now()-t0<ms) requestAnimationFrame(f); else res({frames:n, visFrames:v, shownFrames:s, modelFrames:m, flips, h:+(+GAME.G.hour).toFixed(3)}); }; requestAnimationFrame(f); }))"""
# 坐姿幾何：真實骨架（VRM humanoid raw bones）、射線（SkinnedMesh 的 raycast 照骨架變形算；包圍球先清掉）
POSE = r"""(a=>{ const X=typeof LM!=='undefined'?LM:null, n=X&&X.masterNpc; if(!n||!n.obj) return null; const E=GAME.E, o=n.obj, u=o.userData||{}, vrm=u.vrm, V=THREE.Vector3; E.scene.updateMatrixWorld(true);
  const r3=p=>p?[+p.x.toFixed(3),+p.y.toFixed(3),+p.z.toFixed(3)]:null;
  const bone=nm=>{ try{ const b=vrm&&vrm.humanoid&&vrm.humanoid.getRawBoneNode(nm); return b?b.getWorldPosition(new V()):null; }catch(e){ return null; } };
  const B={}; for(const k of ['hips','spine','chest','neck','head','leftEye','rightEye','leftUpperLeg','rightUpperLeg','leftLowerLeg','rightLowerLeg','leftFoot','rightFoot','leftToes','rightToes','leftUpperArm','rightUpperArm']) B[k]=bone(k);
  const under=(m,root)=>{ for(let q=m;q;q=q.parent) if(q===root) return true; return false; };
  const wvis=m=>{ for(let q=m;q;q=q.parent) if(q.visible===false) return false; return true; };
  const mine=[]; o.traverse(c=>{ if(c.isMesh){ mine.push(c); if(c.isSkinnedMesh){ c.boundingSphere=null; c.boundingBox=null; } } });
  const rc=new THREE.Raycaster(); const P=E.player&&E.player.obj;
  const upHit=(x,z)=>{ rc.set(new V(x,-0.5,z),new V(0,1,0)); rc.near=0; rc.far=3; const h=rc.intersectObjects(mine,false); return h.length?{y:+h[0].point.y.toFixed(3), mesh:h[0].object.name||h[0].object.parent&&h[0].object.parent.name||''}:null; };
  const downHit=(x,y,z)=>{ rc.set(new V(x,y,z),new V(0,-1,0)); rc.near=0; rc.far=y+1; const h=rc.intersectObject(E.scene,true).filter(q=>q.object.isMesh&&!under(q.object,o)&&!(P&&under(q.object,P))&&wvis(q.object)&&!(q.object.material&&q.object.material.visible===false));
    return h.slice(0,3).map(q=>({y:+q.point.y.toFixed(3), name:(q.object.name||'')+'<'+((q.object.parent&&q.object.parent.name)||'')+'>'})); };
  const hp=B.hips||o.position, seat=n.seat||{x:o.position.x,z:o.position.z};
  const thigh=s=>{ const a=B[s+'UpperLeg'], b=B[s+'LowerLeg']; return a&&b?new V((a.x+b.x)/2,(a.y+b.y)/2,(a.z+b.z)/2):null; };
  const pts=[['hips',hp],['thighL',thigh('left')],['thighR',thigh('right')]].filter(p=>p[1]);
  const body=pts.map(([k,p])=>({at:k, xz:[+p.x.toFixed(3),+p.z.toFixed(3)], bodyBottom:upHit(p.x,p.z), below:downHit(p.x,Math.max(0.3,(p.y||0.6)-0.02),p.z)}));
  const seatC=downHit(seat.x,1.0,seat.z);
  const feet=['left','right'].map(s=>{ const f=B[s+'Foot']; if(!f) return null; return {side:s, foot:r3(f), sole:upHit(f.x,f.z), floor:downHit(f.x,Math.max(0.2,f.y-0.02),f.z)}; });
  let faceYaw=null; if(B.leftUpperArm&&B.rightUpperArm){ const sx=B.leftUpperArm.x-B.rightUpperArm.x, sz=B.leftUpperArm.z-B.rightUpperArm.z; faceYaw=Math.atan2(-sz,sx); }   /* 角色的左肩→右肩：前方＝(−sz, sx)，換成和 rotation.y 一樣的 atan2(x,z) */
  const g=a.guest, want=Math.atan2(g[0]-o.position.x,g[1]-o.position.z), dd=v=>v==null?null:+((Math.atan2(Math.sin(v-want),Math.cos(v-want)))*180/Math.PI).toFixed(1);
  const head=B.head;
  return {pos:r3(o.position), ry:+o.rotation.y.toFixed(3), driver:u.driver||null, key:u.key||null, bones:Object.fromEntries(Object.entries(B).map(([k,v])=>[k,r3(v)])), body, seatC, feet,
    faceYaw:faceYaw==null?null:+faceYaw.toFixed(3), wantYaw:+want.toFixed(3), dRy:dd(o.rotation.y), dFace:dd(faceYaw), headY:head?+head.y.toFixed(3):null, meshes:mine.length}; })"""
# 相機投影：頭（骨架 head +8 cm）在遊戲鏡頭的螢幕位置、對話框 rect、那一點最上面是什麼
PROJ = r"""(()=>{ const X=typeof LM!=='undefined'?LM:null, n=X&&X.masterNpc; const E=GAME.E, cam=E.camera, V=THREE.Vector3; const out={has:!!(n&&n.obj)};
  const dl=document.getElementById('dlg'), rb=dl&&!dl.classList.contains('hide')?dl.getBoundingClientRect():null; out.dlg=rb?[Math.round(rb.left),Math.round(rb.top),Math.round(rb.width),Math.round(rb.height)]:null;
  out.vw=innerWidth; out.vh=innerHeight; out.adv=typeof ADV!=='undefined'&&ADV.root?{active:!!ADV.active, mode:ADV.root.className}:null; out.camPos=[+cam.position.x.toFixed(2),+cam.position.y.toFixed(2),+cam.position.z.toFixed(2)];
  if(!n||!n.obj) return out; const o=n.obj, u=o.userData||{}; let hp=null; try{ const b=u.vrm&&u.vrm.humanoid&&u.vrm.humanoid.getRawBoneNode('head'); if(b) hp=b.getWorldPosition(new V()).add(new V(0,0.08,0)); }catch(e){}
  if(!hp) hp=o.position.clone().add(new V(0,1.25,0)); o.updateWorldMatrix(true,false); cam.updateMatrixWorld(); const v=hp.clone().project(cam), c=E.renderer.domElement.getBoundingClientRect();
  const px=c.left+(v.x+1)/2*c.width, py=c.top+(1-v.y)/2*c.height; out.head=[+hp.x.toFixed(2),+hp.y.toFixed(2),+hp.z.toFixed(2)]; out.px=[Math.round(px),Math.round(py)]; out.ndcZ=+v.z.toFixed(3);
  out.onScreen=v.z<1&&v.z>-1&&px>=0&&py>=0&&px<innerWidth&&py<innerHeight; out.underDlg=!!rb&&px>=rb.left&&px<=rb.right&&py>=rb.top&&py<=rb.bottom;
  const e=out.onScreen?document.elementFromPoint(px,py):null; out.topEl=e?(e.id||e.className||e.tagName):null; try{ out.canvasFilter=getComputedStyle(E.renderer.domElement).filter||null; const ar=document.getElementById('adv'); out.advFilter=ar?(getComputedStyle(ar).backdropFilter||getComputedStyle(ar).webkitBackdropFilter||null):null; }catch(_){} out.vis=!!o.visible; out.degr=!!u.degradedHidden;
  const fw=new V(); cam.getWorldDirection(fw); const to=hp.clone().sub(cam.position).normalize(); out.offAxisDeg=+(Math.acos(Math.max(-1,Math.min(1,fw.dot(to))))*180/Math.PI).toFixed(1); out.dist=+hp.distanceTo(cam.position).toFixed(2);
  return out; })()"""
# 獨立相機照相（同 cc_tingzhou_probe.py 的 SNAP；多：上師的 visible 照 LM.canTalk 重設——主迴圈照跟隨鏡頭的視錐設 visible，換相機以後要重算；記原本的值）
SNAP = r"""(a=>{ const E=GAME.E, r=E.renderer, c=r.domElement; const cam=new THREE.PerspectiveCamera(a.fov||50, c.width/c.height, 0.05, 400); cam.position.set(...a.from); cam.lookAt(...a.at); cam.updateMatrixWorld(true);
  const z=E.zone, P=E.player&&E.player.obj; if(z&&z.fadeWalls){ try{ z.fadeWalls(cam,P?P.position:cam.position); if(E.hideFaded) E.hideFaded(); }catch(e){} }
  const hid=[]; if(P){ hid.push([P,P.visible]); P.visible=false; } const X=typeof LM!=='undefined'?LM:null, m=X&&X.masterNpc&&X.masterNpc.obj; let mv=null;
  if(m){ mv=m.visible; if(!a.keep){ hid.push([m,m.visible]); m.visible=!!(X.canTalk&&X.canTalk(GAME.G,z)); } }   /* keep：照主迴圈這一格留下的 visible 畫（量開收時用）*/
  try{ r.render(E.scene,cam); const k=document.createElement('canvas'); k.width=c.width; k.height=c.height; const g=k.getContext('2d'); g.drawImage(c,0,0);
    g.fillStyle='rgba(0,0,0,0.6)'; g.fillRect(0,0,k.width,22); g.fillStyle='#fff'; g.font='15px sans-serif'; g.fillText(a.label,6,16); return {u:k.toDataURL('image/jpeg',0.9), masterVisBefore:mv, masterVisSnap:m?m.visible:null}; }
  finally { for(const [o,v] of hid) o.visible=v; if(z&&z.fadeWalls&&E.camera){ try{ z.fadeWalls(E.camera,P.position); if(E.hideFaded) E.hideFaded(); }catch(e){} } } })"""
HOOK = r"""(()=>{ if(window.__ssHook===GAME) return 'already'; window.__ssHook=GAME; window.__SSLOG=window.__SSLOG||[]; const s0=GAME.say;
  GAME.say=function(who,text,opts){ const p=s0.apply(this,arguments); try{ window.__SSLOG.push({who:who?(who.name||String(who)):null, cid:(who&&who.charId)||null, obj:!!(who&&who.obj), text:String(text), t:+performance.now().toFixed(0), gh:+(+GAME.G.hour).toFixed(3)}); }catch(e){} return p; };
  return 'installed'; })()"""
DRV = r"""(()=>{ const D=GAME.D||{}, E=GAME.E, ch=document.getElementById('choices'), fd=document.getElementById('fade');
  const txt=b=>((b.firstChild&&b.firstChild.nodeType===3)?b.firstChild.textContent:(b.textContent||'')).trim();
  const choices=(ch&&!ch.classList.contains('hide'))?[...ch.querySelectorAll('button')].filter(b=>b.offsetParent!==null).map(txt):[];
  return {dlg:!!D.active, typing:!!D.typing, choices, busy:!!E.player.busy, depth:GAME.sceneDepth?GAME.sceneDepth():null, fade:!!(fd&&fd.classList.contains('on')), phone:!!(GAME.phoneIsOpen&&GAME.phoneIsOpen()),
    done:window.__PSDONE===1, err:window.__PSERR||null, zone:GAME.G.zone, h:+(+GAME.G.hour).toFixed(3)}; })()"""
DLGDOM = r"""(()=>{ const n=document.getElementById('dlgName'), t=document.getElementById('dlgText'); return {name:n?(n.style.display==='none'?'':(n.textContent||'').trim()):null, text:t?(t.textContent||'').trim():null, full:(GAME.D&&GAME.D.full)!=null?String(GAME.D.full).trim():null}; })()"""
DEFFLAGS = [None]


async def flags0(pg):
    if DEFFLAGS[0] is None: DEFFLAGS[0] = await pg.evaluate("JSON.parse(JSON.stringify(GAME.defaults('祐廷').flags))")
    return dict(DEFFLAGS[0])


async def ld(pg, cdp, why, zone, day, hour, x=None, z=None, yaw=0.0, flags=None, wait=6000):
    """【前置／捷徑】讀檔（遊戲自己的 applySave；條件事件關著、手機不自己打開）。flags＝GAME.defaults 的旗標再加上這些"""
    Fl = await flags0(pg); Fl.update(flags or {})
    st = {'stage': 'law', 'zone': zone, 'day': day, 'hour': hour, 'weather': 'clear', 'flags': Fl}
    if x is not None: st['pos'] = {'x': x, 'z': z, 'yaw': yaw, 'lv': 0}
    R.setup('%s：讀檔到 %s 第 %s 天 %s%s（條件事件關著）' % (why, zone, day, hhmm(hour), '' if x is None else ' (%.2f,%.2f)' % (x, z)))
    try: await L.load_state(pg, st, quiet_events=True, quiet_phone=True)
    except TypeError: await L.load_state(pg, st, quiet_events=True)
    await pg.wait_for_timeout(wait); await L.close_panels(pg, cdp); await pg.evaluate(HOOK)
    return await pg.evaluate(ME)


async def y1s1(pg):
    d = await pg.evaluate(DAYS); R.note('用的日子（大一上第 6 週、不是颱風假）：%s' % J(d))
    return d['day'] if d else await pg.evaluate(DAYOF + "('2025-10-22')")


async def snap(pg, lab, frm, at_, fov, fn, keep=False):
    r = await pg.evaluate(SNAP, {'from': list(frm), 'at': list(at_), 'fov': fov, 'label': lab, 'keep': keep})
    if r: save(r['u'], fn); R.note('[照片] %s → %s（上師 visible：主迴圈留下的 %s、照相時 %s）' % (lab, fn, r['masterVisBefore'], r['masterVisSnap']))
    return r


async def gshot(pg, fn):
    await pg.screenshot(path=os.path.join(OUT, fn), type='jpeg', quality=85); R.note('[遊戲截圖] %s' % fn)


async def wait_zone(pg, want, t0, secs=60):
    while time.time() - t0 < secs:
        me = await pg.evaluate(ME)
        if me['zone'] == want and not me['ent']: return round(time.time() - t0, 2), me
        await pg.wait_for_timeout(200)
    return None, await pg.evaluate(ME)


async def tap_it(pg, cdp, it, tag, max_s=120):
    ok = await L.go_to(pg, cdp, R, it['x'], it['z'], min(0.9, it['r'] * 0.6), '%s 走到「%s」' % (tag, it['label']), max_s=max_s)
    s = await D.settle(pg)
    for _ in range(6):
        if s['interact']: break
        await pg.wait_for_timeout(400); s = await D.st(pg)
    R.note('%s 走到 (%.2f,%.2f)：按鈕「%s」' % (tag, s['x'], s['z'], s['interact']))
    await L.tap(pg, cdp, '#interact'); return ok, s


# ---------------------------------------------------------------- ② 上師 3D 人物
async def watch_model(pg, tag, t0, secs=120, shot_fn=None):
    """從 t0 起每 0.25 秒看上師 NPC：建好、正式模型、看得到各在第幾秒；狀態有變才記"""
    first = {}; last = None; tl = []
    while time.time() - t0 < secs:
        m = await pg.evaluate(MS); t = round(time.time() - t0, 2)
        key = (m.get('has'), m.get('driver'), m.get('degr'), m.get('vis'), m.get('model'), m.get('fail'), m.get('zone'), m.get('ent'), m.get('loading'))
        if key != last: tl.append([t, {k: m.get(k) for k in ('zone', 'ent', 'h', 'has', 'driver', 'ukey', 'degr', 'vis', 'kidsVis', 'model', 'shown', 'fail', 'loading', 'assetHas', 'canTalk')}]); last = key
        if m.get('zone') == 'tingzhou' and not m.get('ent') and 'zone_in' not in first: first['zone_in'] = t
        for k in ('has', 'model', 'shown'):
            if m.get(k) and k not in first: first[k] = t
        if 'model' in first and 'shown' in first: break
        if not m.get('lm') or (m.get('zone') == 'tingzhou' and m.get('api') is False): break
        await pg.wait_for_timeout(250)
    R.note('%s 上師 NPC 狀態變化（秒, 狀態）：%s' % (tag, J(tl)))
    if shot_fn and 'shown' in first: await gshot(pg, shot_fn)
    return first, tl


async def part_ss_walk(pg, cdp):
    d = await y1s1(pg)
    await ld(pg, cdp, '【前置／捷徑】②a 走進去計時：公館 G10 巷口前、大一上、沒有 LM_*', 'gongguan', d, 19.9, 37.1, 17.5, 0.0)
    m0 = await pg.evaluate(MS); R.note('[SS_WALK] 公館時 LM：%s' % J(m0))
    it = next((i for i in await pg.evaluate(ITS) if i['gate']), None)
    if not R.check('[SS_WALK] 公館有「往汀州路（巷子）」', bool(it), ''): return
    ok, s = await tap_it(pg, cdp, it, '[SS_WALK]'); t0 = time.time()
    first, tl = await watch_model(pg, '[SS_WALK]', t0, 150, 'ss_walk_model_in.jpg')   # 從按下去就開始看（換區域的黑幕裡模型可能已經在下載）
    tz = first.get('zone_in'); me = await pg.evaluate(ME)
    R.note('[SS_WALK] 按下去 → 進到汀州路 %s 秒（黑幕收掉）；%s' % (tz, J(me)))
    if not R.check('[SS_WALK] 真的走巷口進到汀州路', me['zone'] == 'tingzhou', J(me)): return
    m = await pg.evaluate(MS); R.note('[SS_WALK] 最後：%s' % J(m))
    pre = [x for x in tl if not x[1].get('model') and x[1].get('zone') == 'tingzhou']
    R.note('[SS_WALK] 正式模型出現以前：%s' % ('；'.join('%.2f 秒 %s' % (x[0], '沒有 NPC' if not x[1]['has'] else ('桌後是空的（備用人藏著 degradedHidden）' if x[1]['degr'] else ('有備用人（driver %s）看得到＝%s' % (x[1]['driver'], x[1]['vis'])))) for x in pre) or '一進來就是正式模型'))
    R.check('[SS_WALK] 上師 NPC 有建（LM.masterNpc；從按下去算 %s 秒）' % first.get('has'), 'has' in first, J(m))
    R.check('[SS_WALK] 正式模型 char.limao_shangshi 出現（從按下去算 %s 秒；進汀州路後 %s 秒）' % (first.get('model'), None if first.get('model') is None or tz is None else round(first['model'] - tz, 2)), 'model' in first, J({k: m.get(k) for k in ('driver', 'ukey', 'fail', 'assetHas')}))
    R.check('[SS_WALK] 20:00 前後店開著時看得到（不是藏著的備用人）', 'shown' in first and m.get('canTalk') is True, J({k: m.get(k) for k in ('h', 'canTalk', 'vis', 'degr', 'kidsVis')}))
    await gshot(pg, 'ss_walk_end.jpg')


async def part_ss_main(pg, cdp):
    d = await y1s1(pg)
    lay = await pg.evaluate(LAYJS); R.note('[SS_MAIN] 配置 limao：%s' % J(lay))
    T = (lay or {}).get('table') or {}
    sm = T.get('seatMaster') or {'x': SEAT_M[0], 'z': SEAT_M[1]}; sg = T.get('seatGuest') or {'x': SEAT_G[0], 'z': SEAT_G[1]}; at = T.get('at') or {'x': TABLE_AT[0], 'z': TABLE_AT[1]}
    face = math.atan2(sm['x'] - at['x'], sm['z'] - at['z'])
    # a 讀檔計時（乾淨的瀏覽器）
    t0 = time.time()
    await ld(pg, cdp, '【前置／捷徑】②a 讀檔計時：直接讀檔到汀州路算命桌前（面向上師）', 'tingzhou', d, 20.0, at['x'], at['z'], face, wait=200)
    first, tl = await watch_model(pg, '[SS_MAIN 讀檔]', t0, 150, 'ss_load_model_in.jpg')
    R.check('[SS_MAIN 讀檔] 正式模型出現（從叫讀檔算 %s 秒）' % first.get('model'), 'model' in first, J(tl[-1] if tl else None))
    await pg.wait_for_timeout(2500)
    # b 20:00 照片＋幾何
    if 'b' in SS_STEPS: await ss_photos(pg, cdp, sm, sg, at)
    if 'c' in SS_STEPS: await ss_hours(pg, cdp, d, sm, sg, at, face)
    if 'd' in SS_STEPS: await ss_talk(pg, cdp, d, at)


async def ss_photos(pg, cdp, sm, sg, at):
    m = await pg.evaluate(MS); R.note('[SS_MAIN 20:00] 狀態：%s' % J(m))
    try: await L.turn_camera_to(pg, cdp, sm['x'], sm['z'])
    except Exception as e: R.note('[SS_MAIN] 轉鏡頭失敗：%r' % e)
    await pg.wait_for_timeout(800); await gshot(pg, 'ss_2000_game.jpg')
    mx, mz = sm['x'], sm['z']
    for lab, frm, to, fov, fn in [('正面近拍（客人座位的眼睛高度）', (mx, 1.25, sg['z'] + 0.15), (mx, 1.05, mz), 42, 'ss_2000_front.jpg'),
                                  ('正面特寫（臉、帽子、眼鏡）', (mx, 1.30, mz - 0.95), (mx, 1.25, mz), 30, 'ss_2000_face.jpg'),
                                  ('左側面（x 小那一邊＝面向巷子時他的左手邊）', (mx - 1.35, 1.15, mz - 0.1), (mx, 1.0, mz), 45, 'ss_2000_left.jpg'),
                                  ('右側面（x 大那一邊）', (mx + 1.35, 1.15, mz - 0.1), (mx, 1.0, mz), 45, 'ss_2000_right.jpg'),
                                  ('客人站的地方斜看（玩家位置）', (at['x'], 1.55, at['z'] - 0.2), (mx, 1.0, mz), 50, 'ss_2000_player_view.jpg'),
                                  ('巷子裡看整張桌子', (mx - 0.6, 1.6, 0.3), (mx, 0.9, mz - 0.4), 50, 'ss_2000_lane.jpg')]:
        await snap(pg, '上師 20:00 %s' % lab, frm, to, fov, fn)
    P_ = await pg.evaluate(POSE, {'guest': [sg['x'], sg['z']]})
    R.note('[SS_MAIN 坐姿] %s' % J(P_))
    R.check('[SS_MAIN 坐姿] 量得到上師的人物（LM.masterNpc）', bool(P_), '')
    if P_:
        cand = [h['y'] for h in (P_.get('seatC') or []) if 0.25 < h['y'] < 0.9]
        R.note('[SS_MAIN 坐姿] 座位中心 (seatMaster) 往下打到的第一個 0.25～0.9 m 的面：%s' % (max(cand) if cand else '沒有（下面沒有椅面）'))
        gap = None; rows_ = []
        for b in P_['body']:   # 每一點：身體最低點（往上打到他的網格）vs 同一點往下打到的第一個面（不是他）
            bb_ = b['bodyBottom']['y'] if b.get('bodyBottom') else None; un = next((h for h in (b.get('below') or []) if h['y'] < (bb_ if bb_ is not None else 9) + 0.15), None)
            g_ = None if bb_ is None or un is None else round(bb_ - un['y'], 3); rows_.append((b['at'], bb_, un and un['y'], un and un['name'], g_))
            if b['at'] == 'hips': gap = g_ if un is not None and 0.25 < un['y'] < 0.9 else None
        R.note('[SS_MAIN 坐姿] 每一點（臀＝hips 骨正下方、大腿＝大腿骨中點）：身體最低點、正下方第一個面、差（負＝陷進去、正＝浮起來）：%s' % J(rows_))
        R.note('[SS_MAIN 坐姿] 臀部底 − 椅面＝%s m（大腿那兩點正下方如果是地面＝大腿超出椅子前緣，只記）' % gap)
        for f in P_.get('feet') or []:
            if not f: continue
            fl = next((h['y'] for h in (f.get('floor') or [])), None); so = f['sole']['y'] if f.get('sole') else None
            R.note('[SS_MAIN 坐姿] %s 腳：腳底 %s、下面的地面 %s → 差 %s m' % (f['side'], so, fl, None if so is None or fl is None else round(so - fl, 3)))
        R.note('[SS_MAIN 面向] rotation.y %s、肩線算的面向 %s；朝客人座位 %s 該是 %s → 差 rotation %s°、肩線 %s°' % (P_['ry'], P_['faceYaw'], J([sg['x'], sg['z']]), P_['wantYaw'], P_['dRy'], P_['dFace']))
        R.check('[SS_MAIN 位置] 人在上師的座位（離 seatMaster ≤ 0.15 m）', math.hypot(P_['pos'][0] - mx, P_['pos'][2] - mz) <= 0.15, J(P_['pos']))
        R.check('[SS_MAIN 面向] 面向客人座位（肩線算的差 ≤ 20°）', P_['dFace'] is not None and abs(P_['dFace']) <= 20, '%s°' % P_['dFace'])
        R.check('[SS_MAIN 坐姿] 坐在椅子上：臀部底和正下方椅面差 ±5 cm 內（臀部正下方要是椅面）', gap is not None and abs(gap) <= 0.05, 'gap %s' % gap)


async def ss_hours(pg, cdp, d, sm, sg, at, face):
    mx, mz = sm['x'], sm['z']; rows = []
    for tag, h0, until, want in [('18:00', 18.0, None, False), ('18:56→19:00', 18.93, 19.02, True), ('20:00', 20.0, None, True), ('23:25→23:30', 23.42, 23.52, False), ('23:40', 23.67, None, False)]:
        await ld(pg, cdp, '【前置／捷徑】②c %s：汀州路算命桌前' % tag, 'tingzhou', d, h0, at['x'], at['z'], face, wait=4000)
        if until is not None:
            t1 = time.time()
            while time.time() - t1 < 150 and (await pg.evaluate("+GAME.G.hour")) < until: await pg.wait_for_timeout(500)
            R.note('[SS_MAIN %s] 站著等遊戲時間走到 %s（%.0f 秒）' % (tag, hhmm(until), time.time() - t1))
        try: await L.turn_camera_to(pg, cdp, mx, mz)   # 先讓遊戲鏡頭對著他（不在畫面裡的人本來就不畫，收著／開著才判得出來）
        except Exception: pass
        await pg.wait_for_timeout(1200)
        st = await pg.evaluate(MS); vf = await pg.evaluate(VISF, 3000); pj = await pg.evaluate(PROJ)
        R.note('[SS_MAIN %s] 遊戲鏡頭：上師的頭投影 %s、在畫面裡 %s、離中線 %s°' % (tag, pj.get('px'), pj.get('onScreen'), pj.get('offAxisDeg')))
        fn = 'ss_hour_%s.jpg' % tag.replace(':', '').replace('→', '_'); await gshot(pg, fn)
        for k3 in range(3):   # 獨立相機、照主迴圈那一格的 visible 畫（不改它）；連拍三張（隔 0.25 秒）：閃的話三張會不一樣
            await snap(pg, '上師 %s（G.hour %s）正面 第 %d 張（照遊戲當下的 visible）' % (tag, hhmm(vf['h']), k3 + 1), (mx, 1.25, sg['z'] + 0.15), (mx, 1.05, mz), 42, 'ss_hour_%s_snap%d.jpg' % (tag.replace(':', '').replace('→', '_'), k3 + 1), keep=True)
            await pg.wait_for_timeout(250)
        rows.append((tag, vf['h'], st.get('canTalk'), vf))
        R.note('[SS_MAIN %s] G.hour %s：LM.canTalk %s、zone.tzLimao.open %s；3 秒 %d 幀：obj.visible %d 幀、看得到 %d 幀、閃 %d 次；狀態 %s' % (tag, hhmm(vf['h']), st.get('canTalk'), st.get('open'), vf['frames'], vf['visFrames'], vf['shownFrames'], vf['flips'], J({k: st.get(k) for k in ('has', 'driver', 'degr', 'vis', 'hidden')})))
        if want: R.check('[SS_MAIN %s] 店開著（G.hour %s）：每一幀都看得到上師' % (tag, hhmm(vf['h'])), vf['frames'] > 0 and vf['shownFrames'] == vf['frames'], J(vf))
        else: R.check('[SS_MAIN %s] 收著（G.hour %s）：遊戲鏡頭對著他的位子（頭的投影在畫面裡）、沒有一幀看得到上師' % (tag, hhmm(vf['h'])), vf['frames'] > 0 and vf['shownFrames'] == 0 and bool(pj.get('onScreen')), J(dict(vf, onScreen=pj.get('onScreen'))))
    open(os.path.join(OUT, 'ss_hours.md'), 'w', encoding='utf-8').write('| 時間 | 量的那一刻 G.hour | LM.canTalk | 幀數 | visible 幀 | 看得到幀 | 閃 |\n|---|---|---|---|---|---|---|\n' + '\n'.join('| %s | %s | %s | %d | %d | %d | %d |' % (r[0], hhmm(r[1]), r[2], r[3]['frames'], r[3]['visFrames'], r[3]['shownFrames'], r[3]['flips']) for r in rows) + '\n')


async def ss_talk(pg, cdp, d, at):
    await ld(pg, cdp, '【前置／捷徑】②d 對話：19:36 巷 A 禮貌生財前面、沒有 LM_*', 'tingzhou', d, 19.6, LANE[0], LANE[1], 0.0)
    await L.go_to(pg, cdp, R, at["x"], at["z"], 0.45, '[SS_MAIN 對話] 算命桌', max_s=120); s = await D.settle(pg)
    for _ in range(6):
        if s['interact']: break
        await pg.wait_for_timeout(400); s = await D.st(pg)
    if not R.check('[SS_MAIN 對話] 算命桌前按鈕是「算命桌」（%s）' % hhmm(s['hour']), s['interact'] == '算命桌', J({k: s[k] for k in ('x', 'z', 'interact')})): return
    n0 = await pg.evaluate("(window.__SSLOG||[]).length"); await L.tap(pg, cdp, '#interact')
    t0 = time.time(); k = 0; mslines = 0; idle = 0; shot_first = False; lastt = None
    while time.time() - t0 < 150:
        q = await pg.evaluate(DRV)
        if q['phone']: await L.phone_away(pg, cdp); continue
        if q['choices']:
            i = next((j for j, o in enumerate(q['choices']) if o.startswith('離開')), len(q['choices']) - 1)
            R.note('[SS_MAIN 對話] 選單 %s → 選「%s」' % (J(q['choices']), q['choices'][i])); await L.tap(pg, cdp, '#choices button:nth-of-type(%d)' % (i + 1)); await pg.wait_for_timeout(700); idle = 0; continue
        if q['dlg']:
            await full_line(pg, cdp); dd = await pg.evaluate(DLGDOM)
            if dd['text'] != lastt:
                lastt = dd['text']; k += 1
                lg = await pg.evaluate("(n=>(window.__SSLOG||[]).slice(n))", n0); cur = (dd['full'] or dd['text'] or '').strip()
                e = next((x for x in reversed(lg) if (x.get('text') or '').strip() == cur), lg[-1] if lg else {})   # 這一句是誰說的：照 GAME.say 的紀錄對字
                if not shot_first: shot_first = True; await gshot(pg, 'ss_talk_line01.jpg')
                if e.get('who') == '上師' and mslines < 2:
                    mslines += 1; pj = await pg.evaluate(PROJ); fn = 'ss_talk_ms%d.jpg' % mslines; await gshot(pg, fn)
                    R.note('[SS_MAIN 對話] 上師第 %d 句「%s」（畫面名字「%s」、帶 obj＝%s）：頭的投影 %s（畫面 %dx%d、在畫面裡 %s、離鏡頭中線 %s°、距離 %s m）、對話框 %s、頭在框裡 %s、那一點最上面 %s、ADV %s（畫布 filter %s、#adv backdrop-filter %s：模糊背景的 ADV 會把 3D 畫面糊掉，看截圖）；截圖 %s' % (
                        mslines, dd['text'], dd['name'], e.get('obj'), pj.get('px'), pj['vw'], pj['vh'], pj.get('onScreen'), pj.get('offAxisDeg'), pj.get('dist'), pj.get('dlg'), pj.get('underDlg'), pj.get('topEl'), J(pj.get('adv')), pj.get('canvasFilter'), pj.get('advFilter'), fn))
                    R.check('[SS_MAIN 對話] 上師第 %d 句：說話的人帶他的 3D 人物（obj）' % mslines, bool(e.get('obj')), J(e))
                    R.check('[SS_MAIN 對話] 上師第 %d 句：頭在畫面裡、沒有被對話框蓋住（投影 %s、框 %s）' % (mslines, pj.get('px'), pj.get('dlg')), bool(pj.get('onScreen')) and not pj.get('underDlg'), J({k2: pj.get(k2) for k2 in ('px', 'dlg', 'topEl', 'onScreen')}))
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(380); idle = 0; continue
        if not q['busy'] and not q['fade'] and q['depth'] in (0, None):
            idle += 1
            if idle >= 3: break
        else: idle = 0
        await pg.wait_for_timeout(330)
    lg = await pg.evaluate("(n=>(window.__SSLOG||[]).slice(n))", n0)
    R.note('[SS_MAIN 對話] 全部 %d 句：%s' % (len(lg), J([[e['who'], e['obj'], e['text']] for e in lg])))
    R.check('[SS_MAIN 對話] 有上師的句子', mslines > 0, '')


# ---------------------------------------------------------------- ① G10 巷口
async def part_g10(pg, cdp):
    d = await y1s1(pg)
    for h in ((12.0, 20.0) if 'a' in G10_STEPS else ()):
        hh = hhmm(h).replace(':', '')
        await ld(pg, cdp, '【前置／捷徑】①a G10 正面', 'gongguan', d, h, 37.1, 16.5, 0.0, wait=5000)
        bx = await pg.evaluate("(()=>{ const o={}; for(const b of (GAME.E.zone.buildings||[])) if(b.userData&&b.userData.ggShop) o[b.userData.ggShop]=+b.position.x.toFixed(2); return o; })()")
        glb = await pg.evaluate("!!GAME.E.scene.getObjectByName('gongguan_shops_glb')")
        R.note('[G10 %s] 棟號 x：%s；正式店面模型 gongguan_shops_glb＝%s' % (hh, J({k: bx[k] for k in ('G08', 'G09', 'G10', 'G11') if k in bx}), glb))
        x10 = bx.get('G10', 37.1); x09 = bx.get('G09')
        await snap(pg, 'G10 正面 %s' % hhmm(h), (x10, 1.7, 11.0), (x10, 2.6, 20.0), 55, 'g10_front_%s.jpg' % hh)
        await snap(pg, 'G10 正面近（騎樓前）%s' % hhmm(h), (x10, 1.6, 16.0), (x10, 1.9, 22.0), 62, 'g10_front_near_%s.jpg' % hh)
        await snap(pg, 'G10 巷口往裡看（相機在騎樓裡）%s' % hhmm(h), (x10, 1.6, 20.2), (x10, 1.5, 34.0), 60, 'g10_mouth_in_snap_%s.jpg' % hh)
        await gshot(pg, 'g10_front_game_%s.jpg' % hh)
        if x09 is not None and h == 12.0:
            await snap(pg, 'G09 正面 12:00（應該還是鐵捲門）', (x09, 1.7, 11.0), (x09, 2.6, 20.0), 55, 'g09_front_1200.jpg')
            await snap(pg, 'G09＋G10＋G11 一起 12:00', (x10, 1.7, 6.0), (x10, 3.0, 20.0), 70, 'g0910_wide_1200.jpg')
    if 'b' in G10_STEPS or 'c' in G10_STEPS: await g10_lane(pg, cdp, d)
    if 'd' in G10_STEPS: await g10_pillar(pg, cdp, d)


async def g10_lane(pg, cdp, d):
    await ld(pg, cdp, '【前置／捷徑】①b 公館 G10 前人行道 12:00', 'gongguan', d, 12.0, 37.1, 16.5, 0.0, wait=5000)
    gate = next((i for i in await pg.evaluate(ITS) if i['gate']), None); R.note('[G10] 「往汀州路」互動點：%s' % J(gate))
    gx = gate['x'] if gate else 37.1
    lane = await pg.evaluate("(x=>{ const E=GAME.E, o=[]; for(let z=18; z<=37.01; z+=0.5) o.push([+z.toFixed(1), E.canStand?!!E.canStand(x,z,0.3,0):null]); return o; })", gx)
    R.note('[G10 通道] x %.1f、z 18～37 每 0.5 m 站不站得住：%s' % (gx, J(lane)))
    await L.go_to(pg, cdp, R, gx, 20.4, 0.4, '[G10] 走到巷口', max_s=60); await D.settle(pg)
    if 'b' in G10_STEPS: await g10_inside(pg, cdp, gx)
    if 'c' in G10_STEPS: await g10_gate(pg, cdp, gate, gx)


async def g10_inside(pg, cdp, gx):
    try: await L.turn_camera_to(pg, cdp, gx, 34.0)
    except Exception as e: R.note('[G10] 轉鏡頭失敗 %r' % e)
    await pg.wait_for_timeout(700); await gshot(pg, 'g10_mouth_in_game.jpg')
    s = await D.st(pg); R.note('[G10] 巷口 (%.2f,%.2f) 按鈕「%s」' % (s['x'], s['z'], s['interact']))
    R.check('[G10 ①c] 巷口看得到「往汀州路（巷子）」按鈕', s['interact'].startswith('往汀州路'), s['interact'])
    r = await F.joy_to(pg, cdp, '[G10 ①b 往裡直推]', gx, 36.0, near=0.5, straight=True, max_s=25)
    end = r['end']; R.note('[G10 ①b] 搖桿直直往通道裡推（目標 z 36）：停在 (%.2f,%.2f)（%s；推 %d 下）' % (end['x'], end['z'], r.get('why') or '到了', r['pushes']))
    pth = await pg.evaluate("(a=>{ const E=GAME.E,P=E.player,o=P.obj.position; const r=E.pathTo?E.pathTo(o.x,o.z,0,a[0],a[1],0):null; return r?r.length:null; })", [gx, 34.0])
    R.note('[G10 ①b] 從停下的位置 E.pathTo 到 (%.1f,34)：%s' % (gx, '找不到路' if pth is None else '%s 點' % pth))
    for tgt, fn in (((gx, 45.0), 'g10_deep_look_in.jpg'), ((gx, 8.0), 'g10_deep_look_back.jpg')):
        try: await L.turn_camera_to(pg, cdp, tgt[0], tgt[1])
        except Exception: pass
        await pg.wait_for_timeout(700); await gshot(pg, fn)
    zin = max(end['z'], 21.0)
    for lab, frm, to, fn in [('【捷徑】相機放在玩家停下的地方往裡看', (gx, 1.6, zin), (gx, 1.5, zin + 20), 'g10_snap_stop_in.jpg'),
                             ('【捷徑】相機放在通道中間 z 27 往裡看', (gx, 1.6, 27.0), (gx, 1.5, 45.0), 'g10_snap_mid_in.jpg'),
                             ('【捷徑】相機放在通道最裡面 z 34 往裡看（另一頭）', (gx, 1.6, 34.0), (gx, 1.5, 50.0), 'g10_snap_end_in.jpg'),
                             ('【捷徑】相機放在通道最裡面 z 34 往回看（公館）', (gx, 1.6, 34.0), (gx, 1.5, 12.0), 'g10_snap_end_back.jpg')]:
        await snap(pg, 'G10 %s' % lab, frm, to, 60, fn)


async def g10_gate(pg, cdp, gate, gx):
    ok, s = await tap_it(pg, cdp, gate or {'x': 37.1, 'z': 21.0, 'r': 1.6, 'label': '往汀州路（巷子）'}, '[G10 ①c]')
    t0 = time.time(); tz, me = await wait_zone(pg, 'tingzhou', t0); await pg.wait_for_timeout(1500); me2 = await pg.evaluate(ME)
    R.note('[G10 ①c] 按「%s」→ %s 秒進汀州路；出生 %s；1.5 秒後 %s' % (s['interact'], tz, J(me), J(me2)))
    if R.check('[G10 ①c] 按了真的到汀州路、站得住', me2['zone'] == 'tingzhou' and me2['stand'] is not False, J(me2)):
        await gshot(pg, 'g10_tz_arrive.jpg')
        back = next((i for i in await pg.evaluate(ITS) if i['to'] == 'gongguan'), None); R.note('[G10 ①c] 汀州路「往公館」：%s' % J(back))
        if R.check('[G10 ①c] 汀州路有「往公館」', bool(back), ''):
            ok, s = await tap_it(pg, cdp, back, '[G10 ①c 回]')
            t0 = time.time(); tz, me = await wait_zone(pg, 'gongguan', t0); await pg.wait_for_timeout(1500); me2 = await pg.evaluate(ME)
            R.note('[G10 ①c] 回公館：%s 秒；落在 %s；1.5 秒後 %s（配置 toGongguan.spawn (37.1,18) yaw π）' % (tz, J(me), J(me2)))
            R.check('[G10 ①c] 回到公館、站得住、在 G10 巷口前人行道（離 (%.1f,18) ≤ 1.5 m）' % gx, me2['zone'] == 'gongguan' and me2['stand'] is not False and math.hypot(me2['x'] - gx, me2['z'] - 18.0) <= 1.5, J(me2))
            await gshot(pg, 'g10_back_gongguan.jpg')


async def g10_pillar(pg, cdp, d):
    await ld(pg, cdp, '【前置／捷徑】①d 公館 G10 前人行道 12:00', 'gongguan', d, 12.0, 37.1, 17.5, 0.0, wait=5000)
    bx = await pg.evaluate("(()=>{ const o={}; for(const b of (GAME.E.zone.buildings||[])) if(b.userData&&b.userData.ggShop) o[b.userData.ggShop]=+b.position.x.toFixed(2); return o; })()")
    x10 = bx.get('G10', 37.1)
    pil = await pg.evaluate("(x=>{ const E=GAME.E, N=E.nav; return {free:N?!!N.free(x,19.3):null, stand:E.canStand?!!E.canStand(x,19.3,0.3,0):null, standW:E.canStand?!!E.canStand(x-4.5,19.3,0.3,0):null}; })", x10)
    R.note('[G10 ①d] 原本中間柱子的位置 (%.2f,19.3)：導航格 free %s、站得住 %s；西邊分界柱 (%.2f,19.3) 站得住 %s' % (x10, pil['free'], pil['stand'], x10 - 4.5, pil['standW']))
    R.check('[G10 ①d] 原本中間柱子的位置站得住（柱子拿掉了）', bool(pil['stand']), J(pil))
    fb0 = await pg.evaluate("GAME.walkFallbacks|0")
    await L.go_to(pg, cdp, R, x10 - 3.4, 19.3, 0.5, '[G10 ①d] 走到柱子那一排西端', max_s=60)
    legs = [('沿柱子那一排 z 19.3 往東', x10 + 3.4, 19.3), ('往西', x10 - 3.4, 19.3), ('第二趟往東', x10 + 3.4, 19.3), ('往西', x10 - 3.4, 19.3)]
    res = []
    for lab, tx, tz2 in legs:
        r = await F.joy_to(pg, cdp, '[G10 ①d %s]' % lab, tx, tz2, near=0.5, straight=True, max_s=40); res.append((lab, r))
        R.note('[G10 ①d %s] %s：%s 秒、推 %d 下、跳 %s、停在 (%.2f,%.2f)%s' % (lab, '到了' if r['ok'] else '沒到', r['t'], r['pushes'], J(r['jumps']), r['end']['x'], r['end']['z'], '' if r['ok'] else '（%s）' % r.get('why')))
    await L.go_to(pg, cdp, R, x10, 17.6, 0.5, '[G10 ①d] 走到 G10 中心的人行道', max_s=60)
    for lab, tx, tz2 in [('x＝G10 中心穿過騎樓往裡（經過原本柱子的位置）', x10, 21.4), ('往外', x10, 17.6), ('第二趟往裡', x10, 21.4), ('往外', x10, 17.6)]:
        r = await F.joy_to(pg, cdp, '[G10 ①d %s]' % lab, tx, tz2, near=0.5, straight=True, max_s=40); res.append((lab, r))
        R.note('[G10 ①d %s] %s：%s 秒、推 %d 下、跳 %s、停在 (%.2f,%.2f)%s' % (lab, '到了' if r['ok'] else '沒到', r['t'], r['pushes'], J(r['jumps']), r['end']['x'], r['end']['z'], '' if r['ok'] else '（%s）' % r.get('why')))
    await gshot(pg, 'g10_pillar_walk_end.jpg')
    bad = [lab for lab, r in res if not r['ok'] or r['jumps']]
    R.check('[G10 ①d] 搖桿來回兩趟（沿柱子那一排、穿過騎樓）每一段都走得到、沒有被傳送（%d 段）' % len(res), not bad, J(bad))
    R.check('[G10 ①d] walkFallbacks 沒有增加（%d → %d）' % (fb0, await pg.evaluate("GAME.walkFallbacks|0")), (await pg.evaluate("GAME.walkFallbacks|0")) == fb0, '')


# ---------------------------------------------------------------- ③b 沛珊第二批
EXP_ALL = json.load(open(os.path.join(HERE, 'fixtures', 'ps_batch2', 'expect.json'), encoding='utf-8'))
EKEY = next((k for k in EXP_ALL if not k.startswith('_') and SHA.startswith(k)), 'f5e1ef4e8')
OKEY = next((k for k in EXP_ALL if not k.startswith('_') and k != EKEY), None)
EXP, OLDX = EXP_ALL[EKEY], (EXP_ALL[OKEY] if OKEY else {})
WHO = "(()=>({name:(typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName('classmate_peishan'):null)||(typeof CHARACTERS!=='undefined'&&CHARACTERS.classmate_peishan&&CHARACTERS.classmate_peishan.name)||'沛珊',charId:'classmate_peishan'}))()"
ALLSEEN = []


async def full_line(pg, cdp):
    """打字中點一下＝整句顯示（已經整句就不點，不然會翻到下一句）；同 cc_lm2_probe.py"""
    await pg.wait_for_timeout(250)
    if await pg.evaluate("!!(GAME.D&&GAME.D.active&&GAME.D.typing)"): await L.tap(pg, cdp, '#dlg')
    for _ in range(10):
        if not await pg.evaluate("!!(GAME.D&&GAME.D.typing)"): break
        await pg.wait_for_timeout(200)
    await pg.wait_for_timeout(200)


async def run_play(pg, cdp, tag, body, targets, pick=None, max_s=150):
    """【捷徑】在頁面裡叫遊戲自己的播放函式（body＝async 函式本體），像玩家一樣點對話、選選項；每一句從 DOM 讀、截圖；
    targets＝{名稱: 期望的字}：DOM 的字（或 GAME.D.full）一字相同就另存 ps2_<tag>_<名稱>.jpg。回傳 (看到的每一句, {名稱: 檔名})"""
    await pg.evaluate("(()=>{ window.__PSDONE=0; window.__PSERR=null; })()")
    await pg.evaluate("void (async()=>{ try{ if(GAME.sceneBegin) GAME.sceneBegin(); " + body + " }catch(e){ window.__PSERR=String(e&&e.stack||e).slice(0,400); } finally{ try{ if(GAME.sceneEnd) GAME.sceneEnd(); }catch(e){} window.__PSDONE=1; } })()")
    t0 = time.time(); seen = []; hits = {}; idle = 0; lastt = None
    while time.time() - t0 < max_s:
        q = await pg.evaluate(DRV)
        if q['phone']: await L.phone_away(pg, cdp); continue
        if q['choices']:
            k = pick(q['choices']) if pick else 0
            if k is None or k < 0 or k >= len(q['choices']): k = 0
            seen.append({'choice': q['choices'], 'picked': q['choices'][k]}); await L.tap(pg, cdp, '#choices button:nth-of-type(%d)' % (k + 1)); await pg.wait_for_timeout(700); idle = 0; continue
        if q['dlg']:
            await full_line(pg, cdp); dd = await pg.evaluate(DLGDOM)
            if dd['text'] != lastt:
                lastt = dd['text']; i = len([x for x in seen if 'text' in x]) + 1; fn = 'ps2_%s_%02d.jpg' % (tag, i)
                await pg.screenshot(path=os.path.join(OUT, fn), type='jpeg', quality=72); dd['shot'] = fn; seen.append(dd)
                for nm, want in targets.items():
                    if nm not in hits and want and (dd['text'] == want or dd['full'] == want):
                        hits[nm] = 'ps2_%s_%s.jpg' % (tag, nm); shutil.copyfile(os.path.join(OUT, fn), os.path.join(OUT, hits[nm]))
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(380); idle = 0; continue
        if q['done'] and not q['busy'] and not q['fade']:
            idle += 1
            if idle >= 3: break
        else: idle = 0
        await pg.wait_for_timeout(330)
    q = await pg.evaluate(DRV)
    R.note('[PS2 %s] 演完（%s；%.0f 秒）例外 %s；畫面上的每一句（名字｜字）：%s' % (tag, '結束' if q['done'] else '逾時', time.time() - t0, q['err'], J([(x['name'], x['text']) if 'text' in x else ('選項', x['choice'], x['picked']) for x in seen])))
    R.check('[PS2 %s] 播放函式沒有丟例外' % tag, not q['err'], str(q['err'])[:200])
    ALLSEEN.extend([(tag, x) for x in seen if 'text' in x])
    return seen, hits


def judge(tag, nm, want, old, seen, hits):
    if nm in hits:
        R.check('[PS2 %s] %s在遊戲裡顯示、DOM 的字＝%s 原始碼「%s」（截圖 %s）' % (tag, '第一句' if nm.startswith('first') else '最後一句', EKEY, want, hits[nm]), True, ''); return True
    txt = [x['text'] for x in seen if 'text' in x]
    was_old = bool(old) and old in txt
    R.check('[PS2 %s] %s在遊戲裡顯示、DOM 的字＝%s 原始碼「%s」' % (tag, '第一句' if nm.startswith('first') else '最後一句', EKEY, want), False, '畫面上沒有這一句%s；畫面上的：%s' % ('（出現的是另一版的「%s」）' % old if was_old else '', J(txt[:3] + ['…'] + txt[-3:] if len(txt) > 6 else txt)))
    return False


async def ps_base(pg, cdp, why, day_key='2026-10-20', hour=14.0, flags=None, zone='gongguan'):
    d = await pg.evaluate(DAYOF + "('%s')" % day_key)
    return await ld(pg, cdp, '【前置／捷徑】③b %s' % why, zone, d, hour, 0.0, 16.0, 0.0, flags=flags, wait=4500)


def pick_text(t):
    return lambda opts: next((i for i, o in enumerate(opts) if t and (o == t or o.strip('「」') == t.strip('「」') or t in o)), 0)


async def ps_lad(pg, cdp):
    for term in (os.environ.get('PS_TERMS') or 'Y1S2,Y2S1,Y3S1,Y3S2,Y4S1,Y4S2').split(','):   # PS_TERMS：只跑其中幾個學期（雲端自檢用）
        e, o = EXP.get('lad_' + term) or {}, OLDX.get('lad_' + term) or {}
        await ps_base(pg, cdp, '閒聊階梯 %s（STORY.ladPlay 演第一層、第八層）' % term)
        sid = await pg.evaluate("(t=>{ const P=LADDER.byTerm[t]&&LADDER.byTerm[t].classmate_peishan; return P?[P.steps[0].id,P.steps[7].id,P.steps.length,!!P.steps[7].linesIf]:null; })('%s')" % term)
        R.note('[PS2 lad_%s] 遊戲裡的 LADDER：%s；期望（%s）%s' % (term, J(sid), EKEY, J(e)))
        base = "const who=" + WHO + "; const P=LADDER.byTerm['" + term + "'].classmate_peishan; await STORY.ladPlay(GAME,who,'classmate_peishan',P.steps[%d]);"
        s1, h1 = await run_play(pg, cdp, 'lad_%s_L1' % term, base.replace('%d', '0'), {'first': e.get('first')}, pick=pick_text(None))
        judge('lad_%s' % term, 'first', e.get('first'), o.get('first'), s1, h1)
        s8, h8 = await run_play(pg, cdp, 'lad_%s_L8' % term, base.replace('%d', '7'), {'last': e.get('last')}, pick=pick_text(e.get('c0')))
        judge('lad_%s' % term, 'last', e.get('last'), o.get('last'), s8, h8)
        for src, dst in (('ps2_lad_%s_L1_first.jpg' % term, 'ps2_lad_%s_first.jpg' % term), ('ps2_lad_%s_L8_last.jpg' % term, 'ps2_lad_%s_last.jpg' % term)):
            if os.path.exists(os.path.join(OUT, src)): shutil.copyfile(os.path.join(OUT, src), os.path.join(OUT, dst))


async def ps_arc(pg, cdp):
    e, o = EXP.get('arc') or {}, OLDX.get('arc') or {}
    base = "const who=" + WHO + "; const b=HEROINE_ARCS.people.classmate_peishan.beats[%d]; await ARCS.play(GAME,who,'classmate_peishan',ARCS.resolve(GAME.G,'classmate_peishan',b));"
    await ps_base(pg, cdp, '故事線第 1 拍（ARCS.play）')
    s1, h1 = await run_play(pg, cdp, 'arc_b1', base.replace('%d', '0'), {'first': e.get('first')})
    judge('arc', 'first', e.get('first'), o.get('first'), s1, h1)
    await ps_base(pg, cdp, '故事線第 8 拍（ARCS.play；選稿上第一個選項）')
    s8, h8 = await run_play(pg, cdp, 'arc_b8', base.replace('%d', '7'), {'last': e.get('last')}, pick=pick_text(e.get('o0')))
    judge('arc', 'last', e.get('last'), o.get('last'), s8, h8)
    for src, dst in (('ps2_arc_b1_first.jpg', 'ps2_arc_first.jpg'), ('ps2_arc_b8_last.jpg', 'ps2_arc_last.jpg')):
        if os.path.exists(os.path.join(OUT, src)): shutil.copyfile(os.path.join(OUT, src), os.path.join(OUT, dst))


async def feed_one(pg, cdp, pid, nm, want, old, mode):
    info = await pg.evaluate("(id=>{ const p=typeof FEED!=='undefined'&&FEED.post?FEED.post(id,GAME.G):null; return p?{t:p.t, who:p.who, say:p.say, pic:p.pic, dm:p.dm}:null; })('%s')" % pid)
    R.note('[PS2 feed %s] 遊戲裡的這一則：%s' % (pid, J(info)))
    if not R.check('[PS2 feed %s] 遊戲裡有這一則' % pid, bool(info), ''): return
    date, hm = info['t'].split(' '); hh, mm = hm.split(':'); h = int(hh) + int(mm) / 60.0
    d = await pg.evaluate(DAYOF + "('%s')" % date)
    FE = {'start': d - 1, 'items': [{'id': pid, 'who': PS, 'day': d, 'h': round(h, 3)}], 'done': {pid: 'p'}, 'dm': {}, 'seen': -1e9, 'dq': [], 'dt': {}, 'dtTrip': {}}
    await ld(pg, cdp, '【前置／捷徑】③b 動態牆 %s：G.flags.FEED 只放這一則（%s 貼的），讀檔到隔天 14:00' % (pid, info['t']), 'gongguan', d + 1, 14.0, 0.0, 16.0, 0.0, flags={'FEED': FE}, wait=4500)
    await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1000); await L.tap(pg, cdp, '[data-ptab="feed"]'); await pg.wait_for_timeout(1000)
    CARD = "(k=>{ const c=[...document.querySelectorAll('#phoneBody .feedItem')].find(e=>(e.innerText||'').includes(k)); if(!c) return null; c.scrollIntoView({block:'center'}); return c.innerText; })"
    t1 = await pg.evaluate(CARD, info['pic'])
    fn1 = 'ps2_feed_%s_card.jpg' % pid; await pg.screenshot(path=os.path.join(OUT, fn1), type='jpeg', quality=85)
    R.note('[PS2 feed %s] 動態頁的卡片：%s（截圖 %s）' % (pid, J(t1), fn1))
    txt = t1 or ''
    if mode == 'dm':
        sel = '[data-fd="%s|dm"]' % pid; okb = await L.tap(pg, cdp, sel); await pg.wait_for_timeout(1200)
        txt = (await pg.evaluate(CARD, info['pic'])) or ''
        fn2 = 'ps2_feed_%s_dm.jpg' % pid; await pg.screenshot(path=os.path.join(OUT, fn2), type='jpeg', quality=85)
        R.note('[PS2 feed %s] 按「（私訊問一句）」（按到＝%s）以後的卡片：%s（截圖 %s）' % (pid, okb, J(txt), fn2)); fn1 = fn2
    for bad in ('undefined', 'null'):
        if bad in txt: R.check('[PS2 feed %s] 卡片沒有「%s」' % (pid, bad), False, txt)
    ok = bool(want) and want in txt
    if ok: shutil.copyfile(os.path.join(OUT, fn1), os.path.join(OUT, 'ps2_feed_%s.jpg' % nm))
    R.check('[PS2 feed] %s（%s）在動態頁顯示、字＝%s 原始碼「%s」（截圖 ps2_feed_%s.jpg）' % ('第一句' if nm == 'first' else '最後一句', pid, EKEY, want, nm), ok, '' if ok else ('卡片上是另一版的「%s」' % old if old and old in txt else txt[:200]))
    ALLSEEN.append(('feed_' + pid, {'name': '', 'text': txt}))
    await L.close_panels(pg, cdp)


async def ps_feed(pg, cdp):
    e, o = EXP.get('feed') or {}, OLDX.get('feed') or {}
    await feed_one(pg, cdp, 'ps4', 'first', e.get('first'), o.get('first'), 'say')
    await feed_one(pg, cdp, 'ps2i', 'last', e.get('last'), o.get('last'), 'dm')


async def ps_fest(pg, cdp):
    e, o = EXP.get('fest') or {}, OLDX.get('fest') or {}
    await ps_base(pg, cdp, '節日：情人節（FEST.play vday、沒有交往＝s6）', '2026-02-14', 18.0)
    s1, h1 = await run_play(pg, cdp, 'fest_vday', "await FEST.play(GAME,{id:'classmate_peishan',k:'vday',y:2026,mode:'meet'});", {'first': e.get('first')})
    judge('fest', 'first', e.get('first'), o.get('first'), s1, h1)
    await ps_base(pg, cdp, '節日：聖誕（FEST.play xmas、沒有交往＝s6；禮物選「沒有準備」）', '2025-12-24', 18.0)
    s2, h2 = await run_play(pg, cdp, 'fest_xmas', "await FEST.play(GAME,{id:'classmate_peishan',k:'xmas',y:2025,mode:'meet'});", {'last': e.get('last'), 'none': e.get('none')},
                            pick=lambda opts: next((i for i, t in enumerate(opts) if '沒有準備' in t), len(opts) - 1))
    judge('fest', 'last', e.get('last'), o.get('last'), s2, h2)
    R.note('[PS2 fest] 沒帶禮物那一句（稿 none「%s」）：%s（禮物有 gifthol3d 包住時可能是另一套反應，只記）' % (e.get('none'), '有出現 ' + h2['none'] if 'none' in h2 else '沒出現'))
    for src, dst in (('ps2_fest_vday_first.jpg', 'ps2_fest_first.jpg'), ('ps2_fest_xmas_last.jpg', 'ps2_fest_last.jpg')):
        if os.path.exists(os.path.join(OUT, src)): shutil.copyfile(os.path.join(OUT, src), os.path.join(OUT, dst))


async def ps_open(pg, cdp):
    e, o = EXP.get('open') or {}, OLDX.get('open') or {}
    await ps_base(pg, cdp, '4/14 公開課（EVENTS.run ev_peishan_open_class）', '2029-04-14', 9.0)
    s, h = await run_play(pg, cdp, 'open', "const ev=STORY_EVENTS.find(e=>e.id==='ev_peishan_open_class'); if(!ev) throw new Error('沒有 ev_peishan_open_class'); await EVENTS.run(ev);", {'first': e.get('first'), 'last': e.get('last')})
    judge('open', 'first', e.get('first'), o.get('first'), s, h); judge('open', 'last', e.get('last'), o.get('last'), s, h)   # 截圖 ps2_open_first／last.jpg（run_play 的 tag 就是 open）


async def ps_tn(pg, cdp):
    e, o = EXP.get('tn') or {}, OLDX.get('tn') or {}
    if not e: e = {'first': EXP.get('tnFallback'), 'last': EXP.get('tnFallback')}
    if not o and OLDX.get('tnFallback'): o = {'first': OLDX.get('tnFallback'), 'last': OLDX.get('tnFallback')}
    await ps_base(pg, cdp, '大四下 6/8 台南那一頓（R2Y4B.psDinner，女朋友版 kind gf）', '2029-06-08', 18.0, flags={'PS_TE_KIND': 'gf'})
    s, h = await run_play(pg, cdp, 'tn', "await R2Y4B.psDinner(GAME,{ps61:{kind:'gf'}});", {'first': e.get('first'), 'firstDelayed': e.get('firstDelayed'), 'last': e.get('last')}, pick=pick_text(e.get('o0')))
    if 'firstDelayed' in h and 'first' not in h:
        R.note('[PS2 tn] 第一句是延畢版（DELAYED）「%s」' % e.get('firstDelayed')); h['first'] = h['firstDelayed']; shutil.copyfile(os.path.join(OUT, h['firstDelayed']), os.path.join(OUT, 'ps2_tn_first.jpg'))
    judge('tn', 'first', e.get('first'), o.get('first'), s, h); judge('tn', 'last', e.get('last'), o.get('last'), s, h)


async def part_ps2(pg, cdp):
    R.note('[PS2] 期望字用 fixtures/ps_batch2/expect.json 的 %s（SHA=%s）；另一版 %s 當「舊稿」對照' % (EKEY, SHA[:9] or '（沒給）', OKEY))
    for g, fn in (('lad', ps_lad), ('arc', ps_arc), ('feed', ps_feed), ('fest', ps_fest), ('open', ps_open), ('tn', ps_tn)):
        if g not in PSG: continue
        t0 = time.time()
        try: await fn(pg, cdp)
        except Exception as ex: R.check('[PS2 %s] 沒有中斷' % g, False, repr(ex)[:300])
        R.note('[PS2 %s] 花了 %.0f 秒' % (g, time.time() - t0))
    bad = [(t, x['text']) for t, x in ALLSEEN if not (x.get('text') or '').strip() or 'undefined' in (x.get('text') or '')]
    R.check('[PS2] 畫面上所有句子沒有空白、沒有 undefined（%d 句）' % len(ALLSEEN), not bad, J(bad[:5]))
    oldhit = [(t, x['text']) for t, x in ALLSEEN if any(isinstance(v, str) and v and v == x.get('text') for k, grp in OLDX.items() if isinstance(grp, dict) for v in grp.values()) and not any(isinstance(v, str) and v == x.get('text') for k, grp in EXP.items() if isinstance(grp, dict) for v in grp.values())]
    R.note('[PS2] 畫面上出現另一版（%s）才有的句子：%s' % (OKEY, J(oldhit) if oldhit else '沒有'))


# ---------------------------------------------------------------- main
async def main():
    print('CC 上師 3D／G10 巷口／沛珊第二批：PARTS %s；SHA %s；Windows＋GPU（PC）／SwiftShader（雲端）≠ iPhone' % (','.join(PARTS), SHA[:9]), flush=True)
    async with async_playwright() as p:
        for part, fn in (('SS_WALK', part_ss_walk), ('SS_MAIN', part_ss_main), ('G10', part_g10), ('PS2', part_ps2)):
            if part not in PARTS: continue
            t0 = time.time(); b, ctx, pg, cdp, errs = await L.launch(p, landscape=True); cons = []
            pg.on('console', lambda m, cons=cons: cons.append((m.type, m.text[:300])) if m.type in ('error', 'warning') else None)
            try:
                await pg.goto(URL)
                if R.check('[%s] 遊戲載入（新的瀏覽器）' % part, await L.wait_loaded(pg), ''):
                    await pg.evaluate(HOOK)
                    await fn(pg, cdp)
            except Exception as e: R.check('[%s] 沒有中斷' % part, False, repr(e)[:300])
            R.note('[%s] console error／warning %d 則：%s' % (part, len(cons), J(cons[:40])))
            lmw = [c for c in cons if 'LM' in c[1] or 'limao' in c[1].lower() or 'shangshi' in c[1].lower()]
            R.note('[%s] 和上師（LM／limao／shangshi）有關的 console：%s' % (part, J(lmw) if lmw else '沒有'))
            R.check('[%s] 沒有 JS 例外（pageerror）' % part, not errs, J(errs[:3]))
            CONSOLE.extend((part,) + c for c in cons)
            R.note('[%s] 花了 %.0f 秒' % (part, time.time() - t0))
            await b.close()
    open(os.path.join(OUT, 'console.json'), 'w', encoding='utf-8').write(J(CONSOLE))
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
