/* ===== 坐著的人在做什麼、桌上有什麼（SEATACT-1104；任務 SEAT-ACTIVITY-1104、USER_WANTS X217）=====
   使用者 2026-11-04 06:2x：「坐下讀書的人他不一定是讀書……有可能會出現筆記型電腦、平板或者單純在滑手機，這才是現代人坐下在咖啡廳或者圖書館最常見的事情　桌上要有東西呀」。
   咖啡廳、圖書館（總圖大廳二樓自習區、3F 閱覽區、書庫、研究小間、B1、法圖、社科圖）、各家店裡坐著的人：
   - 一個人坐的路人（crowd3d.js 店裡的客人、story3d.js 各區域的背景人物）照「這一天、這個位子」挑一件事做（S.plan）：
       book      手上捧一本打開的書（pose read；character3d.js readIK）      桌上：閉著的筆記本＋杯子（咖啡廳）／課本＋螢光筆（圖書館）
       phone     滑手機（pose read，手上換成手機：CHAR.setReadItem 'phone'）  桌上：杯子＋筆記本（沒有第二支手機）
       laptop    用筆電（pose sit）                                           桌上：打開的筆電（tset_laptop／rset_laptop）；桌子放不下＝腿上的筆電（laptop_lap，有這個配件的人）
       notes     寫筆記（pose sit）                                           桌上：攤開的筆記本、筆、筆袋（tset_notes／rset_notes）
       textbook  看桌上的書（pose sit）                                       桌上：攤開的書、螢光筆（tset_book／rset_book）
       rest      休息、發呆（pose sit）                                       桌上：闔上的筆電、課本、杯子、蓋著的手機（圖書館 tset_away）／杯子＋蓋著的手機（店裡）
       tablet    看平板（之後：desk_props 有 item_tablet／hold_tablet 才會出現，S.TABLET_OK）
     場所的限制：圖書館不放杯子以外的吃的喝的（desk_props 裡本來就沒有吃的；S.FOOD 是之後加模型時的擋板）；吃飯的店（meal）、早午餐（brunch）不用筆電；
     同一張長桌相鄰的人不做同一件事（1.05 m 內一定不同，1.05～1.8 m 盡量不同）；同一天同一個位子同一件事（種子＝區域＋日期＋座位座標），換一天換。
   - 兩個人一桌在聊天的（crowd3d.js 轉頭看對方的那一組）：姿勢不動，桌上各一個杯子（咖啡廳、茶屋、早午餐）；吃飯的店不放。
     兩個都是路人＝標成一組（userData.sitChat，下面 pairChat）：character3d.js 讓他們輪流說話、點頭（NPC-AMBIENT-ANIM-1104）。
   - 有名字的人（作息 act read／study 坐下的、劇情的人）：姿勢、手上的東西照劇情（不改），只在桌上配一組合得起來的：手上捧書的＝閉著的筆記本、課本；坐著的＝杯子（店裡）／筆記（圖書館）。
     劇情指定：n.deskSet＝組名（desk_props 裡的 tset_／rset_／lset_ 或 S.CUSTOM 的名字）、或 false＝不放。
   - 桌上小物＝LAWWW2 的 desk_props.glb（VISUAL_REVIEW（second_ai）第 27 節）：tset_*＝自習雙人桌（0.9×0.6）一個人面前那一半、rset_*＝圓桌（Ø1.0）一個人面前那一塊，
     原點＝坐的人正前方的桌緣、y＝桌面、+z＝往桌子裡面；item_*＝單件（原點＝底面中心、+z＝離開坐的人）。桌子在哪裡：從座位往前打向下的射線找桌面（S.probe：
     正式模型、備用的方塊都可以；高度 0.55～1.2 m 的一般桌、吧台，或隔著一段地板、0.3～0.55 m 的矮桌），找到桌緣、桌面高度、夠不夠深、夠不夠寬：
       寬（左右 ±0.36 m 都是桌面、旁邊 0.75 m 內沒有同一邊的人）＝tset；不寬但夠深（0.3 m）＝rset；只夠放一兩件（0.2 m）＝單件；找不到＝桌上不放（手上的照放）。
     正式模型還沒載好：找不到桌子的過 1.5 秒、5 秒、之後每 4 秒（模型數量變了）再找一次。
   - 畫面：同一種網格一個 InstancedMesh（每一層樓一個群組，跟著那一層顯示／隱藏）；7 m 內用 LOD0、7.5 m 外換 _lod1（筆、螢光筆省略；單件沒有 _lod1＝照用），12 m 外單件不畫。
     一個區域最多 S.CAP 組（24）。人起身、走了、換區域：那一組拿掉。載入失敗：人照樣坐、桌上沒有東西。
   - 每 30 格（game3d.js 主迴圈，和 STORY.tick 同一格）跑 S.tick。測試：node tests/seat_activity_1104_unit.js
   平板（S.TABLET_OK）：desk_props 現在沒有平板；美術做了 item_tablet（桌上：原點＝底面中心、+z 離開人、螢幕朝上，約 0.25×0.17×0.007 m）、hold_tablet（手上：同 item 的座標，遊戲端轉到手上）就自動加進去。 */
'use strict';
const SEATACT=(function(){
  const S={};
  S.PROP_KEY='prop.desk_props';
  S.CAP=24;
  S.FOOD=/(food|snack|bento|cake|sandwich|plate|bowl|toast|bread|noodle|rice|dessert)/i;
  /* 場所：圖書館、咖啡廳（可以用筆電）、輕食（茶屋、早午餐、茶飲：不用筆電）、吃飯的店（只有滑手機、什麼都不做）*/
  S.LIB_ZONES={library:1,library_hall:1,library_stacks:1,library_carrels:1,library_b1:1,lawlib:1,soclib:1,us_lawlib:1,us_lawlib_2f:1};
  S.CAFE_ZONES={cafe:1,afar:1,l118_cafe2:1,wz_mokuyobi:1,wz_offbeat:1};
  S.LIGHT_ZONES={daybreak:1,wz_brunch:1,wz_teahouse:1,aoki:1,l118_tea:1,wz_tea:1};
  S.placeOf=function(zone){ if(!zone) return null; if(S.LIB_ZONES[zone]) return 'library'; if(S.CAFE_ZONES[zone]) return 'cafe'; if(S.LIGHT_ZONES[zone]) return 'light';
    const d=typeof CROWD!=='undefined'&&CROWD.SHOP_ZONES&&CROWD.SHOP_ZONES[zone]; if(d){ if(d.kind==='meal') return 'meal'; if(d.kind==='cafe') return 'cafe'; if(d.kind==='brunch'||d.kind==='tea'||d.kind==='drink') return 'light'; } return null; };
  /* 一個人坐的路人可以做的事（順序不重要：每個位子照種子洗牌）*/
  S.TABLET_OK=false;   /* desk_props 有 item_tablet＋hold_tablet 才打開（S.ready 檢查）*/
  S.actsFor=function(place){ const t=['tablet'];   /* 一律排進當天的計畫（不看 desk_props 載好了沒）：同一天出去再進來要一樣；模型還沒好的時候 decide 把平板換成手機 */
    if(place==='library') return ['book','laptop','notes','textbook','phone','rest'].concat(t);
    if(place==='cafe') return ['book','laptop','phone','notes','rest','textbook'].concat(t);
    if(place==='light') return ['phone','book','rest','notes'].concat(t);
    if(place==='meal') return ['eat','phone','eat2']; return []; };
  /* 每一件事的姿勢、手上的東西、桌上（wide＝tset、narrow＝rset、tiny＝單件）；lib／shop 不同的用 {library:…, other:…} */
  const C_=(lib,other)=>({library:lib,other});
  S.ACT={
    book:{pose:'read',hold:'book',desk:C_({wide:'L_book_side',narrow:'L_book_side',tiny:'L_book_tiny'},{wide:'rset_cup',narrow:'rset_cup',tiny:'S_cup'})},
    phone:{pose:'read',hold:'phone',desk:C_({wide:'L_phone_side',narrow:'L_phone_side',tiny:'L_book_tiny'},{wide:'rset_cup',narrow:'rset_cup',tiny:'S_cup'})},
    tablet:{pose:'read',hold:'tablet',desk:C_({wide:'L_book_tiny',narrow:'L_book_tiny',tiny:null},{wide:'S_cup',narrow:'S_cup',tiny:'S_cup'})},
    laptop:{pose:'sit',desk:{wide:'tset_laptop',narrow:'rset_laptop',tiny:'S_laptop'},lap:true},
    notes:{pose:'sit',desk:{wide:'tset_notes',narrow:'rset_notes',tiny:'S_notes'},alt:'book'},
    textbook:{pose:'sit',desk:{wide:'tset_book',narrow:'rset_book',tiny:'S_textbook'},alt:'book'},
    rest:{pose:'sit',desk:C_({wide:'tset_away',narrow:'L_book_tiny',tiny:'L_book_tiny'},{wide:'S_cup_phone',narrow:'S_cup_phone',tiny:'S_cup'})},
    eat:{pose:null,desk:{wide:'S_meal',narrow:'S_meal',tiny:'S_meal_t'}}, eat2:{pose:null,desk:{wide:'S_meal2',narrow:'S_meal2',tiny:'S_meal_t'}},   /* 吃飯的店：LAWWW2 60fd15d38 的碗盤（item_bowl_noodle／bowl／plate／chopsticks）；模型沒有就不放 */
    chat:{pose:null,desk:{wide:'S_cup',narrow:'S_cup',tiny:'S_cup'}} };
  /* 自己組的（單件 item_*；座標＝桌緣、+z 往桌子裡面、yaw 繞 y 轉；單件的 +z＝離開坐的人＝桌子裡面）：放得下一個人面前 x ±0.3、z 0.02～0.3 */
  S.CUSTOM={
    S_cup:[['item_cup',0.17,0.13,0]],
    S_cup_phone:[['item_cup',0.17,0.14,0],['item_phone_off',-0.1,0.12,0.25]],
    L_book_side:[['item_textbook',0.2,0.16,-0.12],['item_highlighter',0.2,0.04,1.3]],
    L_phone_side:[['item_textbook',-0.18,0.15,0.08],['item_notebook_closed_b',0.19,0.15,-0.1]],
    L_book_tiny:[['item_notebook_closed',0.12,0.14,-0.08]],
    S_laptop:[['item_laptop_open',0,0.112,0]],
    S_notes:[['item_notebook_open',0.03,0.135,-0.06],['item_pen',-0.21,0.1,0.7]],
    S_textbook:[['item_code_open',0,0.118,0.05]],
    S_meal:[['item_bowl_noodle',0,0.16,0],['item_chopsticks',0.17,0.04,0],['item_plate',-0.2,0.13,0]],
    S_meal2:[['item_bowl',0.02,0.15,0],['item_plate',-0.19,0.14,0],['item_chopsticks',0.18,0.04,0]],
    S_meal_t:[['item_bowl_noodle',0,0.13,0],['item_chopsticks',0.14,0.03,0]] };
  const prng=seed=>{ let s=(seed>>>0)%2147483646+1; return ()=>{ s=(s*16807)%2147483647; return (s-1)/2147483646; }; };
  const hash=str=>{ let h=2166136261; for(let i=0;i<str.length;i++){ h^=str.charCodeAt(i); h=Math.imul(h,16777619); } return h>>>0; };
  const skey=st=>(+st.x).toFixed(2)+','+(+st.z).toFixed(2)+','+(st.lv|0);
  /* ---------- 這一天每個位子做什麼（區域的座位表；種子＝區域＋日期＋座位座標）----------
     座位照 (樓層, x, z) 排好依序決定：每個位子把可以做的事照自己的種子洗牌，選第一個「1.05 m 內已經決定的位子都沒在做」的；都撞到＝選 1.8 m 內撞到最少的 */
  const planCache=new Map();
  S.plan=function(zone,day,seats,place){ place=place||S.placeOf(zone); const acts=S.actsFor(place); const k=zone+'|'+day+'|'+place+'|'+acts.join(',')+'|'+(seats||[]).length; const c=planCache.get(zone); if(c&&c.k===k) return c.m;
    const L=(seats||[]).map(st=>({st,key:skey(st)})).sort((a,b)=>((a.st.lv|0)-(b.st.lv|0))||(a.st.x-b.st.x)||(a.st.z-b.st.z)); const m=new Map(), done=[];
    for(const s of L){ if(m.has(s.key)) continue; const r=prng(hash('seatact|'+zone+'|'+day+'|'+s.key)); const order=acts.slice(); for(let i=order.length-1;i>0;i--){ const j=Math.floor(r()*(i+1)); [order[i],order[j]]=[order[j],order[i]]; }
      const near=done.filter(q=>(q.st.lv|0)===(s.st.lv|0)&&Math.hypot(q.st.x-s.st.x,q.st.z-s.st.z)<1.8);
      const fam=a=>a==='eat2'?'eat':a;   /* eat、eat2＝同一件事（吃飯的店：兩個人裡大約一個在吃、一個在滑手機）；相鄰不同只看 phone */
      let pick=order.find(a=>!near.some(q=>fam(q.act)===fam(a)&&Math.hypot(q.st.x-s.st.x,q.st.z-s.st.z)<1.05&&a!=='eat'&&a!=='eat2'));
      if(!pick){ let best=1e9; for(const a of order){ const n=near.filter(q=>fam(q.act)===fam(a)).length; if(n<best){ best=n; pick=a; } } }
      m.set(s.key,pick); done.push({st:s.st,act:pick}); }
    planCache.set(zone,{k,m}); return m; };
  /* 不在座位表上的位子（劇情、背景人物自己寫的座標）：照種子挑，避開 1.05 m 內正在坐的人在做的事 */
  S.actAt=function(zone,day,st,place,busy){ const acts=S.actsFor(place); if(!acts.length) return null; const zs=S._zoneSeats||[]; let b=null, bd=0.35;
    for(const q of zs){ if((q.lv|0)!==(st.lv|0)) continue; const d=Math.hypot(q.x-st.x,q.z-st.z); if(d<bd){ bd=d; b=q; } }
    if(b){ const a=S.plan(zone,day,zs,place).get(skey(b)); if(a&&!(busy||[]).some(q=>q.act===a&&Math.hypot(q.st.x-st.x,q.st.z-st.z)<1.05&&a!=='eat'&&a!=='eat2')) return a; }
    const r=prng(hash('seatact|'+zone+'|'+day+'|'+skey(st))); const order=acts.slice(); for(let i=order.length-1;i>0;i--){ const j=Math.floor(r()*(i+1)); [order[i],order[j]]=[order[j],order[i]]; }
    return order.find(a=>!(busy||[]).some(q=>q.act===a&&Math.hypot(q.st.x-st.x,q.st.z-st.z)<1.05))||order[0]; };
  // ---------- 桌子在哪裡（S.probe）----------
  /* 不用 Raycaster（正式模型是照材質合併的大網格：afar 一個網格 1.9 萬個三角形，每一條射線都要全部算一次）：
     區域裡朝上的三角形（法線 y ≥ 0.85）照 xz 放進 0.25 m 的格子（一個區域算一次；正式模型載好、網格數量變了才重算），查「這一點往下第一個面」只看那一格。
     人物、桌上小物、替身不算；看不到的不算（載入失敗的備用方塊藏起來以後），但每一層樓的群組（上下樓時藏起來）照算 */
  let meshList=null, triIx=null;
  S.MESH_TTL=4000;   /* 區域的網格清單多久重新看一次（毫秒）：正式模型載好、備用方塊藏起來＝清單變了＝索引重算、每個人重找桌子 */
  const ownGroup=o=>{ for(let p=o;p;p=p.parent){ if(p.userData&&(p.userData.seatAct||p.userData.driver)) return true; if(/^seated_figures/.test(p.name||'')) return true; } return false; };
  function meshesOf(zone){ const sig=zone&&zone.group?zone.group.children.length:0; if(meshList&&meshList.zone===zone&&meshList.sig===sig&&meshList.t>Date.now()-S.MESH_TTL) return meshList.list;
    const lvg=new Set(((zone&&zone.levelGroups)||[]).map(q=>q&&q.group).filter(Boolean));
    const list=[]; const walk=o=>{ if((!o.visible&&!lvg.has(o))||ownGroup(o)) return; if(o.isMesh&&!o.isSkinnedMesh){ const m=Array.isArray(o.material)?o.material[0]:o.material; if(m&&m.visible!==false&&!(m.transparent&&m.opacity<0.3)) list.push(o); } for(const c of o.children) walk(c); };
    if(zone&&zone.group){ zone.group.updateMatrixWorld(true); walk(zone.group); } let n=0; for(const o of list) n+=o.id; meshList={zone,sig,list,t:Date.now(),ids:n}; return list; }
  S.meshSig=zone=>{ meshesOf(zone); return meshList?meshList.list.length+':'+meshList.ids:'0'; };
  const CELL=0.25;
  /* 分段做（S.INDEX_MS：每 30 格最多算幾毫秒；一個網格是最小的一段）：手機上一個區域約 1～2 億次乘法，一次做完會卡一下 */
  S.INDEX_MS=6;
  const nowMs=()=>(typeof performance!=='undefined'&&performance.now)?performance.now():Date.now();
  function addMesh(I,o){ const g=o.geometry, P=g&&g.attributes&&g.attributes.position; if(!P) return; const ix=g.index, nt=ix?ix.count/3:P.count/3, nv=P.count, ni=o.isInstancedMesh?o.count:1; if(I.W.length<nv*3) I.W=new Float32Array(nv*3); const W=I.W, M=I.M, IM=I.IM, near=I.near, grid=I.grid, T=I.T;
    for(let k=0;k<ni;k++){ if(o.isInstancedMesh){ o.getMatrixAt(k,IM); M.multiplyMatrices(o.matrixWorld,IM); } else M.copy(o.matrixWorld); const e=M.elements;
      for(let v=0;v<nv;v++){ const x=P.getX(v), y=P.getY(v), z=P.getZ(v); W[v*3]=e[0]*x+e[4]*y+e[8]*z+e[12]; W[v*3+1]=e[1]*x+e[5]*y+e[9]*z+e[13]; W[v*3+2]=e[2]*x+e[6]*y+e[10]*z+e[14]; }   /* 每個頂點只轉一次 */
      for(let t=0;t<nt;t++){ const a=(ix?ix.getX(t*3):t*3)*3, b=(ix?ix.getX(t*3+1):t*3+1)*3, c=(ix?ix.getX(t*3+2):t*3+2)*3; I.nTri++;
        const ux=W[b]-W[a], uy=W[b+1]-W[a+1], uz=W[b+2]-W[a+2], vx=W[c]-W[a], vy=W[c+1]-W[a+1], vz=W[c+2]-W[a+2], nx=uy*vz-uz*vy, ny=uz*vx-ux*vz, nz=ux*vy-uy*vx, nl=Math.hypot(nx,ny,nz);
        if(nl<1e-9||Math.abs(ny)<0.85*nl) continue;   /* 朝上（或朝下：雙面的面板、翻過來的網格；高度一樣）的面才算 */
        const x0=Math.floor(Math.min(W[a],W[b],W[c])/CELL), x1=Math.floor(Math.max(W[a],W[b],W[c])/CELL), z0=Math.floor(Math.min(W[a+2],W[b+2],W[c+2])/CELL), z1=Math.floor(Math.max(W[a+2],W[b+2],W[c+2])/CELL);
        if((x1-x0+1)*(z1-z0+1)>4096) continue;   /* 大到不合理的面（整片地板一個三角形）：地板本來就不是桌子 */
        let id=-1; for(let gx=x0;gx<=x1;gx++) for(let gz=z0;gz<=z1;gz++){ const key=gx*100003+gz; if(!near.has(key)) continue; if(id<0){ id=T.length; T.push([W[a],W[a+1],W[a+2],W[b],W[b+1],W[b+2],W[c],W[c+1],W[c+2]]); } let L=grid.get(key); if(!L){ L=[]; grid.set(key,L); } L.push(id); } } } }
  /* 只收座位附近（1.5 m 內）的格子：桌子一定在座位前面；其他地方的面不收（省時間、省記憶體）*/
  function indexStep(zone,budget){ const sig=S.meshSig(zone); if(!triIx||triIx.zone!==zone||triIx.sig!==sig){
      const near=new Set(); for(const st of (zone.seats||[])){ const gx=Math.floor(st.x/CELL), gz=Math.floor(st.z/CELL), R=Math.ceil(1.5/CELL); for(let a=-R;a<=R;a++) for(let b=-R;b<=R;b++) near.add((gx+a)*100003+gz+b); }
      triIx={zone,sig,list:meshList.list.slice(),i:0,grid:new Map(),T:[],nTri:0,near,W:new Float32Array(0),M:new THREE.Matrix4(),IM:new THREE.Matrix4(),done:false,ms:0}; }
    const I=triIx; if(I.done) return I; const t0=nowMs(); while(I.i<I.list.length){ addMesh(I,I.list[I.i++]); if(nowMs()-t0>budget) break; } I.ms+=nowMs()-t0; if(I.i>=I.list.length){ I.done=true; I.W=null; } return I; }
  const indexOf=zone=>indexStep(zone,Infinity);
  S.indexing=()=>!!(triIx&&!triIx.done);   /* 測試用：桌子的索引還在分段算 */
  S.indexStat=zone=>{ const I=indexOf(zone); return {tris:I.nTri,up:I.T.length,cells:I.grid.size,ms:+I.ms.toFixed(1)}; };   /* 測試、效能用 */
  /* (x, z) 往下第一個面：地板 y0 上方 0.03～1.45 m 之間最高的那一個（離地板的高度）；沒有＝null */
  function topAt(I,x,y0,z){ const L=I.grid.get(Math.floor(x/CELL)*100003+Math.floor(z/CELL)); if(!L) return null; let best=null;
    for(const id of L){ const t=I.T[id];
      const x1=t[0],z1=t[2],x2=t[3],z2=t[5],x3=t[6],z3=t[8], den=(z2-z3)*(x1-x3)+(x3-x2)*(z1-z3); if(Math.abs(den)<1e-12) continue;
      const w1=((z2-z3)*(x-x3)+(x3-x2)*(z-z3))/den, w2=((z3-z1)*(x-x3)+(x1-x3)*(z-z3))/den, w3=1-w1-w2; if(w1<-1e-6||w2<-1e-6||w3<-1e-6) continue;
      const y=w1*t[1]+w2*t[4]+w3*t[7]-y0; if(y<0.03||y>1.45) continue; if(best==null||y>best) best=y; }
    return best; }
  const floorOf=(E,st)=>st.y!=null?+st.y:(E&&E.heightAt?E.heightAt(st.x,st.z,st.lv|0):0)||0;
  /* 回傳 {edge, y（世界座標的桌面高度）, h（離地板）, depth, wide} 或 null */
  S.probe=function(E,st){ if(typeof THREE==='undefined'||!E||!E.zone) return null; const I=indexOf(E.zone); if(!I.T.length) return null;
    const y0=floorOf(E,st), fx=Math.sin(st.yaw||0), fz=Math.cos(st.yaw||0), lx=fz, lz=-fx;   /* l：坐的人的左手邊（+x 在人物座標）*/
    const seatTop=st.seatH!=null?+st.seatH:(0.45+(+st.lift||0));
    const at=(f,s)=>topAt(I,st.x+fx*f+lx*(s||0),y0,st.z+fz*f+lz*(s||0));
    let f0=null, h=null, gap=false;
    for(let f=0.02;f<=0.9;f+=0.04){ const t=at(f); if(t==null||t<0.25){ if(f>0.12) gap=true; continue; }
      if(t>=Math.max(0.55,seatTop+0.12)&&t<=1.2){ f0=f; h=t; break; }
      if(gap&&t>=0.3&&t<0.55&&f>=0.3){ f0=f; h=t; break; } }   /* 矮桌：隔著一段地板 */
    if(f0==null) return null;
    let a=Math.max(0,f0-0.04), b=f0; for(let i=0;i<4;i++){ const m=(a+b)/2, t=at(m); if(t!=null&&Math.abs(t-h)<0.02) b=m; else a=m; }
    const same=(f,s)=>{ const t=at(b+f,s); return t!=null&&Math.abs(t-h)<0.03; };
    const depth=same(0.3)&&same(0.15)?0.3:(same(0.2)&&same(0.1)?0.2:(same(0.1)?0.1:0));
    const wide=depth>=0.3&&same(0.15,0.36)&&same(0.15,-0.36);
    return {edge:+b.toFixed(3),y:+(y0+h).toFixed(3),h:+h.toFixed(3),depth,wide}; };
  /* 旁邊的座位：同一邊 0.75 m 內有位子（長桌）＝不用 tset（左右各 0.35 m，會蓋到旁邊那一組）；
     對面有位子（面對面、左右差 0.4 m 內）：兩個人中間的一半是自己的（oppD＝兩個位子前後的距離；自己的桌上能用到 oppD/2 − 桌緣）*/
  S.roomOf=function(st,seats){ const yaw=st.yaw||0, fx=Math.sin(yaw), fz=Math.cos(yaw); let side=false, oppD=null;
    for(const q of seats||[]){ if(q===st||(q.lv|0)!==(st.lv|0)) continue; const dx=q.x-st.x, dz=q.z-st.z; if(Math.hypot(dx,dz)<0.05) continue; const fw=dx*fx+dz*fz, lat=-dx*fz+dz*fx, dy=Math.abs(Math.atan2(Math.sin((q.yaw||0)-yaw),Math.cos((q.yaw||0)-yaw)));
      if(dy<0.5&&Math.abs(fw)<0.3&&Math.abs(lat)<0.75) side=true; if(dy>2.6&&fw>0.3&&fw<2.2&&Math.abs(lat)<0.4&&(oppD==null||fw<oppD)) oppD=fw; }
    return {side,oppD}; };
  // ---------- 狀態 ----------
  const R={zone:null,zid:null,on:new Map(),groups:new Map(),dirty:false,props:null,loading:null,failed:false,t:0,day:null};
  S.state=()=>({zone:R.zid,n:R.on.size,loaded:!!R.props,list:[...R.on.values()].map(r=>({act:r.act,set:r.set,kind:r.kind,named:r.named,x:r.st.x,z:r.st.z,lv:r.st.lv|0,items:(r.items||[]).map(i=>i.name),pose:r.n.pose,hold:r.hold||null}))});   /* 測試用（BB-C 11-04 13:13：cafe、library、lawlib、afar、daybreak 的 r.items 是 null，探針一讀就例外）*/
  S.groups=()=>[...R.groups.values()];   /* 測試用 */
  function load(){ if(R.props||R.loading||R.failed) return; if(typeof ASSETS==='undefined'||!ASSETS.manifest||!ASSETS.manifest[S.PROP_KEY]){ R.failed=true; return; }
    R.loading=ASSETS.loadOne(S.PROP_KEY).then(c=>{ const m={}; if(c&&c.scene) c.scene.traverse(o=>{ if(o.isMesh&&o.name) m[o.name]=o; }); R.props=m; R.loading=null; S.TABLET_OK=!!(m.item_tablet&&m.hold_tablet); R.dirty=true; for(const r of R.on.values()) r.items=null; },
      e=>{ console.warn('SEATACT desk_props（人照樣坐，桌上沒有東西）',e); R.failed=true; R.loading=null; }); }
  S.ready=()=>!!R.props;
  function clearAll(){ for(const g of R.groups.values()) disposeG(g); R.groups.clear(); for(const r of R.on.values()){ unhold(r); unChat(r); } R.on.clear(); R.dirty=false; }
  /* 同桌聊天的兩個人（NPC-AMBIENT-ANIM-1104，USER_WANTS X222）：兩個都是 chat（crowd3d.js 一桌兩個人、互相看著對方的那一組）、都不是有名字的人＝一組；
     兩個人的 obj.userData.sitChat＝{pair}（共用的 pair：na、nb、輪到誰 turn、時鐘 t、這一輪多久 dur）——character3d.js 的 sitAmbient 照它輪流說話（Sitting_Talking_Loop）、點頭（Sitting_Nodding_Loop）。
     有一個人走了、起身、換區域＝兩個人都拿掉（剩下那一個照舊坐著）。有名字的人照劇情，不配（姿勢、手不動）*/
  const partnerOf=(E,n)=>n&&n.lookAt?E.npcs.find(m=>m!==n&&m.obj&&m.obj.position===n.lookAt)||null:null;
  function setChat(r){ const o=r.n&&r.n.obj; if(!o||!r.pair) return; const u=o.userData||(o.userData={}); if(!u.sitChat||u.sitChat.pair!==r.pair) u.sitChat={pair:r.pair}; }
  function unChat(r){ const P=r&&r.pair; if(!P) return; for(const n of [P.na,P.nb]){ const o=n&&n.obj, u=o&&o.userData; if(u&&u.sitChat&&u.sitChat.pair===P) delete u.sitChat; const rr=R.on.get(n); if(rr&&rr.pair===P) rr.pair=null; } }
  function pairChat(E){ for(const r of R.on.values()){ if(r.act!=='chat'||r.named) continue; if(r.pair){ setChat(r); continue; }   /* 換過模型（CHAR.upgrade）的人：新的 obj 再標一次 */
      const m=partnerOf(E,r.n), rm=m&&R.on.get(m); if(!rm||rm===r||rm.act!=='chat'||rm.named||rm.pair||partnerOf(E,m)!==r.n) continue;
      const P={na:r.n,nb:m,turn:Math.random()<0.5?0:1,t:0,dur:3+Math.random()*4}; r.pair=rm.pair=P; setChat(r); setChat(rm); } }
  S.pairs=()=>{ const out=new Set(); for(const r of R.on.values()) if(r.pair) out.add(r.pair); return [...out]; };   /* 測試用 */
  function unhold(r){ if(!r||r.named) return; const o=r.n&&r.n.obj; if(r.hold&&r.hold!=='book'&&o&&typeof CHAR!=='undefined'&&CHAR.setReadItem) CHAR.setReadItem(o,'book'); if(o&&o.userData) delete o.userData.sitFocus; }
  /* 看著桌上的東西（NPC-AMBIENT-ANIM-1104）：用筆電、寫筆記、看桌上的書（sit、桌上有那一組）的路人，obj.userData.sitFocus＝桌上那一組的中間（世界座標）：
     character3d.js 的 sitAmbient 讓他低頭、眼睛看著那裡（舊版：坐著直直看前面）；起身、走了、換區域拿掉 */
  S.FOCUS={laptop:1,notes:1,textbook:1};
  function focusOf(r,act,pose){ if(pose!=='sit'||!S.FOCUS[act]||!r.set||!r.tb) return null; const st=r.st, yaw=st.yaw||0, d=r.tb.edge+Math.min(0.16,(r.tb.depth||0.2)*0.6);
    const f=r.focus||(r.focus={x:0,y:0,z:0}); f.x=st.x+Math.sin(yaw)*d; f.y=r.tb.y; f.z=st.z+Math.cos(yaw)*d; return f; }
  /* 這個人現在可以配嗎：坐著（seat、sit／read）、不是上課的同學、店員、玩家；換了姿勢（起身）＝不能 */
  const seatedOk=n=>!!(n&&n.seat&&n.obj&&!n.hidden&&(n.pose==='sit'||n.pose==='read')&&!n.clsStudent&&!n.clerk&&!n.seatTarget&&!n.leaving);
  const named=n=>!n.isExtra||!!(n.id||(n.name&&n.name!==''));
  const chatting=(E,n)=>!!(n.lookAt&&E.npcs.some(m=>m!==n&&m.obj&&m.obj.position===n.lookAt));
  /* 桌上的組：名字＋這一組的單件（世界矩陣用）*/
  function itemsOf(set){ if(!set) return []; if(S.CUSTOM[set]) return S.CUSTOM[set].map(([nm,x,z,yaw])=>({name:nm,x,z,yaw,lod:false})); return [{name:set,x:0,z:0,yaw:0,lod:true}]; }
  function deskFor(act,place,tb,forced){ if(forced!=null) return forced||null; const A=S.ACT[act]; if(!A||!A.desk||!tb) return null; const D=A.desk.library||A.desk.other?(place==='library'?A.desk.library:A.desk.other):A.desk;
    const kind=tb.wide?'wide':(tb.depth>=0.3?'narrow':(tb.depth>=0.2?'tiny':null)); if(!kind) return null; let set=D[kind];
    if(set&&place==='library'&&itemsOf(set).some(i=>S.FOOD.test(i.name))) set=null;   /* 圖書館：杯子以外吃的喝的不放 */
    return set||null; }
  const haveMesh=nm=>!!(R.props&&(R.props[nm]||R.props[nm+'_lod1']));
  /* 這個人做什麼：路人照座位表；有名字的人＝照他現在的姿勢配桌上 */
  function decide(GM,n,place,busy){ const E=GM.E, G=GM.G, st=n.seat;
    if(named(n)){ if(n.deskSet===false) return null; if(typeof n.deskSet==='string') return {act:'story',set:n.deskSet,named:true};
      if(place==='meal') return null; const act=n.pose==='read'?'book':(place==='library'?'notes':'chat'); return {act,named:true}; }
    if(chatting(E,n)) return place==='meal'?null:{act:'chat'};
    const act=S.actAt(G.zone,G.day,st,place,busy); return act?{act}:null; }
  /* 套用到人身上（只有路人）：姿勢、手上的東西、腿上的筆電 */
  function applyBody(r){ if(r.named) return; const A=S.ACT[r.act]; const n=r.n, o=n.obj; if(!A||!A.pose) return;
    let act=r.act, pose=A.pose, hold=A.hold||null;
    if(hold==='tablet'&&!S.TABLET_OK){ hold='phone'; }
    const lap=A.lap&&!r.set;   /* 筆電放不上桌子：腿上 */
    if(lap){ const u=o.userData||{}; const has=!!(u.props&&u.props.laptop_lap); if(has&&typeof CHAR!=='undefined'&&CHAR.setProp) CHAR.setProp(o,'laptop_lap',true); else { act='book'; pose='read'; hold='book'; } }
    else if(o.userData&&o.userData.props&&o.userData.props.laptop_lap&&typeof CHAR!=='undefined'&&CHAR.setProp) CHAR.setProp(o,'laptop_lap',false);   /* 筆電在桌上了：腿上那台收起來 */
    if(n.pose!==pose){ n.pose=pose; } n.idlePose=pose; r.pose=pose; r.hold=pose==='read'?hold:null; r.bodyAct=act;
    if(typeof CHAR!=='undefined'&&CHAR.setReadItem) CHAR.setReadItem(o,pose==='read'?(hold||'book'):'book');
    const fo=focusOf(r,act,pose); if(o.userData){ if(fo) o.userData.sitFocus=fo; else delete o.userData.sitFocus; } }
  // ---------- 每 30 格 ----------
  S.tick=function(GM){ const E=GM&&GM.E, G=GM&&GM.G; if(!E||!G) return;
    if(E.zone!==R.zone){ clearAll(); R.zone=E.zone; R.zid=G.zone; R.t=0; S._zoneSeats=(E.zone&&E.zone.seats)||[]; }
    const place=S.placeOf(G.zone); if(!place||!E.zone){ if(R.on.size) clearAll(); return; }
    if(R.day!==G.day){ R.day=G.day; for(const r of [...R.on.values()]) drop(r); }   /* 換日：重新挑 */
    load(); R.t++;
    const live=new Set();
    /* 已經配好的：人還坐著就留著（姿勢被別人改回來的路人＝再套一次） */
    for(const r of [...R.on.values()]){ if(!E.npcs.includes(r.n)||!seatedOk(r.n)||r.n.seat!==r.st){ drop(r); continue; } live.add(r.n);
      if(!r.named&&r.pose&&r.n.pose!==r.pose&&(r.n.pose==='sit'||r.n.pose==='read')) applyBody(r); }
    const busy=[...R.on.values()].map(r=>({st:r.st,act:r.act}));
    const PP=E.player&&E.player.obj&&E.player.obj.position, cand=E.npcs.filter(n=>!live.has(n)&&seatedOk(n));
    if(PP&&cand.length+R.on.size>S.CAP) cand.sort((a,b)=>Math.hypot(a.seat.x-PP.x,a.seat.z-PP.z)-Math.hypot(b.seat.x-PP.x,b.seat.z-PP.z));   /* 超過上限：離玩家近的先配 */
    const ixDone=indexStep(E.zone,S.INDEX_MS).done;   /* 桌子的索引還在分段算：人先照做的事坐好（手上的照拿），桌上等算好再放 */
    for(const n of cand){ if(R.on.size>=S.CAP) break; const d=decide(GM,n,place,busy); if(!d) continue;
      const r={n,st:n.seat,act:d.act,named:!!d.named,forced:d.set,set:null,items:null,tb:undefined,tbT:0,tbN:0,pose:null,hold:null,kind:null};
      R.on.set(n,r); busy.push({st:r.st,act:r.act}); if(ixDone) retable(E,r,place); applyBody(r); R.dirty=true; }
    /* 還沒找過的；找不到桌子的 1.5 秒、5 秒後再找；模型變了（正式模型載好、備用方塊藏起來＝索引重算完）每個人都重找（桌面高度可能不一樣）*/
    if(ixDone){ const sig=triIx.sig; for(const r of R.on.values()){ const due=!r.tbN||r.tbSig!==sig||(!r.tb&&r.tbN<3&&Date.now()-r.tbT>(r.tbN===1?1500:5000)); if(!due) continue;
        const had=r.set, hy=r.tb&&r.tb.y; retable(E,r,place,sig); if(r.set!==had||r.tbN===1||(r.tb&&r.tb.y)!==hy){ applyBody(r); r.items=null; R.dirty=true; } } }
    pairChat(E);
    if(R.dirty&&R.props) rebuild(E);
    lodTick(E); };
  function retable(E,r,place,sig){ r.tb=S.probe(E,r.st); r.tbT=Date.now(); r.tbN=(r.tbN|0)+1; r.tbSig=sig!=null?sig:(triIx&&triIx.sig);
    if(r.tb){ const rm=S.roomOf(r.st,S._zoneSeats); if(rm.side) r.tb.wide=false;
      if(rm.oppD!=null){ const half=rm.oppD/2-r.tb.edge; if(half<r.tb.depth){ r.tb.depth=half>=0.3?0.3:(half>=0.2?0.2:(half>=0.1?0.1:0)); if(r.tb.depth<0.3) r.tb.wide=false; } } }   /* 對面也有位子：只用自己那一半 */
    let set=deskFor(r.act,place,r.tb,r.forced); const A=S.ACT[r.act];
    if(!set&&A&&A.alt&&!r.named){ r.act=A.alt; set=deskFor(r.act,place,r.tb,null); }   /* 寫筆記、看桌上的書，桌子放不下：改成手上捧書 */
    r.set=set; r.kind=r.tb?(r.tb.wide?'wide':(r.tb.depth>=0.3?'narrow':(r.tb.depth>=0.2?'tiny':null))):null; r.items=null; }
  function drop(r){ unChat(r); R.on.delete(r.n); unhold(r); if(r.set) R.dirty=true; }
  S.drop=function(n){ const r=R.on.get(n); if(r){ drop(r); } };
  S.clear=clearAll;
  // ---------- 畫出來 ----------
  const near=new Map();   /* r → true／false（7 m 內）*/
  function worldItems(r){ if(r.items) return r.items; const out=[]; if(!r.set||!r.tb) return (r.items=out);
    const yaw=r.st.yaw||0, fx=Math.sin(yaw), fz=Math.cos(yaw), lx=fz, lz=-fx, ex=r.st.x+fx*r.tb.edge, ez=r.st.z+fz*r.tb.edge;
    const lset=/^lset_|^hold_/.test(r.set);
    for(const it of itemsOf(r.set)){ if(!haveMesh(it.name)) continue;
      if(lset){ out.push({name:it.name,lod:true,x:r.st.x,y:floorOf(null,r.st),z:r.st.z,yaw}); continue; }   /* 講堂的組：原點＝座位的地面中心 */
      out.push({name:it.name,lod:it.lod,x:ex+lx*it.x+fx*it.z,y:r.tb.y,z:ez+lz*it.x+fz*it.z,yaw:yaw+it.yaw}); }
    return (r.items=out); }
  const disposeG=g=>{ if(g.parent) g.parent.remove(g); for(const im of g.children) if(im.dispose) im.dispose(); };   /* InstancedMesh.dispose 只放掉自己的矩陣（網格、材質是 desk_props 共用的，不放）*/
  function rebuild(E){ R.dirty=false; for(const g of R.groups.values()) disposeG(g); R.groups.clear(); near.clear();
    const P=E.player&&E.player.obj&&E.player.obj.position;
    const byLv=new Map(); for(const r of R.on.values()){ const its=worldItems(r); if(!its.length) continue; const lv=r.st.lv|0; if(!byLv.has(lv)) byLv.set(lv,[]); byLv.get(lv).push(r); }
    for(const [lv,rs] of byLv){ const g=new THREE.Group(); g.name='seatact:'+lv; g.userData.seatAct=true; const cnt=new Map();
      for(const r of rs) for(const it of worldItems(r)){ cnt.set(it.name,(cnt.get(it.name)||0)+1); }
      const ims={}; for(const [nm,n] of cnt){ const a=R.props[nm], b=R.props[nm+'_lod1']; const mk=(src,name)=>{ const im=new THREE.InstancedMesh(src.geometry,src.material,n); im.count=0; im.castShadow=false; im.receiveShadow=true; im.name=name; im.frustumCulled=true; g.add(im); return im; };
        const A=a?mk(a,'desk:'+nm):null; ims[nm]={near:A,far:b?mk(b,'desk:'+nm+'_lod1'):A,item:!b}; }
      g.userData.rs=rs; g.userData.ims=ims;
      const LG=E.zone.levelGroups, lg=LG&&LG[lv]; (lg&&lg.group||E.zone.group||E.scene).add(g); R.groups.set(lv,g); lay(g,P,true); } }
  let M4=null, Q4=null, V4=null, ONE=null, UP=null;   /* 第一次畫的時候才建（只載資料、THREE 是假的測試環境也載得起來）*/
  S.NEAR=7; S.ITEM_FAR=12;
  function lay(g,P,force){ if(!M4){ M4=new THREE.Matrix4(); Q4=new THREE.Quaternion(); V4=new THREE.Vector3(); ONE=new THREE.Vector3(1,1,1); UP=new THREE.Vector3(0,1,0); } const rs=g.userData.rs, ims=g.userData.ims; let ch=!!force;
    for(const r of rs){ const d=P?Math.hypot(r.st.x-P.x,r.st.z-P.z):1e9, was=near.get(r), nr=was==null?d<S.NEAR:(was?d<S.NEAR+0.5:d<S.NEAR-0.5), far2=d>S.ITEM_FAR; const k=(nr?1:0)+(far2?2:0); if(r._lk!==k){ r._lk=k; ch=true; } near.set(r,nr); }
    if(!ch) return false; for(const im of g.children) im.count=0;
    for(const r of rs){ const nr=near.get(r), far2=r._lk>=2; for(const it of worldItems(r)){ const e=ims[it.name]; if(!e) continue; if(e.item&&far2) continue; const im=nr?(e.near||e.far):e.far; if(!im) continue;
        Q4.setFromAxisAngle(UP,it.yaw); V4.set(it.x,it.y,it.z); M4.compose(V4,Q4,ONE); im.setMatrixAt(im.count++,M4); } }
    for(const im of g.children){ im.visible=im.count>0; im.instanceMatrix.needsUpdate=true; if(im.count) im.computeBoundingSphere(); } return true; }
  function lodTick(E){ const P=E.player&&E.player.obj&&E.player.obj.position; for(const g of R.groups.values()) lay(g,P,false); }
  return S;
})();
