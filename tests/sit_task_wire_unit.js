// 坐在桌前做事的循環的接線（NPC-ANIM-LOOPS-1104；LAWWW2-C 交件 2962616ac 的片段 ual_sit_tasks.glb、配件 hand_props.glb）——不需要瀏覽器。
// 在 Node 載入遊戲的 three.js／three-vrm／CHAR／SEATACT（不算圖）、坐姿循環、做事的片段、右手配件、桌上小物（desk_props）的 GLB，
// 用真的 VRoid 路人（vroid_npc_f1／m1、LAWWW2 的 bl_npc_nf2／nm8／nm1）坐在測試用的桌子前，跑 SEATACT.tick（每 30 格）＋CHAR.animate（每格 1/30 秒）：
//   A  manifest：char.ual_sit_tasks（clips、lazy）、prop.hand_props（building、lazy）都有、檔案在、LICENSES.md 有；開場預載（ASSETS.preload）不會載它們
//   B  SEATACT 的路人：用筆電＝Sit_Type／Sit_TypePad、寫筆記＝Sit_Write、看桌上的書＝Sit_Page、滑手機＝Sit_Phone（姿勢從 read 換成 sit、手上的手機換成配件）；
//      片段的名字照骨架分 _F／_M（女生 npc_f1、nf2；男生 npc_m1、nm8）；速度 1（60 格＝片段走 2 秒）；手臂吃片段：照片段播的時候兩手手腕、右手中指根和
//      LAWWW2 量的位置（ual_sit_tasks.json 的 expect）差 ≤ 2.5 cm（同 tests/sit_task_loops_unit.js，但走真正的接線、不換 manifest），從 0 秒自己播到 2.33 秒寫字的右手 ≤ 1.5 cm
//   C  配件：寫字＝右手骨頭上的 hand_pen（位置 0、不轉、看得到，筆尖在筆記本上）、滑手機＝hand_phone（眼睛看著它）；一次只開一個；桌上那支筆藏起來
//      （自習桌 tset_notes：近的換成拆開的單件、沒有筆；遠的照用 _lod1）；不做了（?nositask／拿掉）＝手上的藏、桌上的放回來；起身＝配件藏、那一組拿掉；換區域＝全部拿掉
//   D  照舊（沒有片段）：吧台的高腳椅、矮桌、太高的桌子（0.85 m）、太遠的桌子（桌緣 0.60 m）、有名字的人、聊天、手上捧書
//   E  桌緣比參考遠（0.42 m）：人往前坐 12 cm、手和桌緣的相對位置跟參考一樣（≤ 1 cm）
//   F  載不到：片段的 GLB 不見＝不報錯、和沒有這個功能一模一樣（骨頭的四元數分量）；載入失敗以後 30 秒內不再下載；配件的 GLB 不見＝要拿東西的（寫字、滑手機）照舊、打字照樣
//   G  不留垃圾：每一格不會一直加配件；C.release 把配件從骨頭拿下來（VRM 的第一個實例會被下一個人重用）；CHAR.upgrade（換模型）接著做
//   D2 每個人自己的骨架：照片段擺一次量手（量完骨頭全部放回去）、和參考差很多的（bl_npc_nm1）照舊；一次量的人數有上限
//   H  C.SIT_TASK.WIN（桌緣的範圍）和量到的一樣：前臂在桌面上的那一段離桌面不到 1.5 cm 的地方不能在桌子上（女生不比參考的桌子更糟）、放在桌上的手腕往前 3 cm 在桌上、男生打字的指尖不過筆電的鉸鏈
// 修改前（開發分支 060f12491）：沒有 manifest、沒有 CHAR.sitTaskFit：A～H 幾乎全部 FAIL。用法：node tests/sit_task_wire_unit.js
const {preload,ROOT}=require('../tools/dev_scratch/spring_sim/harness.js');
const fs=require('fs'), path=require('path'), vm=require('vm');
global.CROWD={SHOP_ZONES:{test_meal:{kind:'meal'}}};   /* SEATACT.placeOf 用：測試用的吃飯的店 */
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'src/seatact3d.js'),'utf8'),{filename:'src/seatact3d.js'});
const scene=new THREE.Scene(), DT=1/30;
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const cm=v=>(v*100).toFixed(1)+' cm';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const HAS=typeof CHAR.sitTaskFit==='function'&&typeof CHAR.setSitTask==='function';
const MAN=ASSETS.manifest;
const JS=(()=>{ try{ return JSON.parse(fs.readFileSync(path.join(ROOT,'assets/models/char/second_ai/ual_sit_tasks.json'),'utf8')); }catch(e){ return null; } })();
const seeded=s=>()=>{ s=(s*16807)%2147483647; return (s-1)/2147483646; };
CHAR.ambRand=seeded(20261104);
const put=k=>{ const m=MAN[k]; if(!m) return Promise.resolve(null); const f=path.join(ROOT,m.url); if(!fs.existsSync(f)) return Promise.resolve(null); window.ASSET_DATA[m.url]=fs.readFileSync(f).toString('base64'); return ASSETS.loadOne(k).catch(()=>null); };
const raw=(h,n)=>h.userData.vrm.humanoid.getRawBoneNode(n);
const L=(h,n)=>h.worldToLocal(raw(h,n).getWorldPosition(new THREE.Vector3()));
const amb=h=>h.userData.amb||{};
/* 兩個四元數／向量差多少（分量最大差）：不用 angleTo——骨頭的四元數不是剛好單位長，angleTo 自己跟自己比也有 0.04°（2·acos(|q|²)）*/
const qd=(a,b)=>Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y),Math.abs(a.z-b.z),Math.abs((a.w||0)-(b.w||0)));
/* 測試用的區域：每個位子一張自己的桌子（寬 0.9、深 0.6、頂面 top、桌緣在座位前面 edge）；lift＝高腳椅；low＝矮桌（前面隔一段地板）*/
function mkZone(desks,zoneId){ const grp=new THREE.Group(); const seats=[]; const mat=new THREE.MeshBasicMaterial();
  desks.forEach((d,i)=>{ const st={x:i*2.0,z:0,yaw:0,lv:0,act:d.act}; if(d.lift) st.lift=d.lift; seats.push(st);
    const t=new THREE.Mesh(new THREE.BoxGeometry(0.9,0.04,0.6),mat); t.position.set(st.x,d.top-0.02,st.z+d.edge+0.3); grp.add(t); });
  scene.add(grp); return {zone:{seats,group:grp},id:zoneId||'library'}; }
function mkNPC(key,st,o){ o=o||{}; const h=CHAR.build(Object.assign({model:key,height:MAN[key].height||1.7},o.spec||{})); h.position.set(st.x,(st.lift||0),st.z); h.rotation.y=st.yaw||0; scene.add(h);
  return Object.assign({obj:h,seat:st,pose:o.pose||'sit',idlePose:o.pose||'sit',isExtra:true,name:'',lv:0,frozen:true},o.n||{}); }
function mkGM(Z,npcs,player){ const E={zone:Z.zone,npcs,player:{obj:{position:player||new THREE.Vector3(0,0,1.5)}},scene}; return {E,G:{zone:Z.id,day:7}}; }
async function run(GM,frames){ for(let f=0;f<frames;f++){ if(f%30===0){ SEATACT.tick(GM); await sleep(1); } for(const n of GM.E.npcs) CHAR.animate(n.obj,DT,{pose:n.pose,speed:0}); scene.updateMatrixWorld(true); } }
const recOf=(n)=>SEATACT.state().list.find(r=>Math.abs(r.x-n.seat.x)<1e-6&&Math.abs(r.z-n.seat.z)<1e-6);
const cleanup=(GM,Z)=>{ SEATACT.clear(); for(const n of GM.E.npcs){ scene.remove(n.obj); CHAR.release(n.obj); } scene.remove(Z.zone.group); };
const actAt0=SEATACT.actAt; SEATACT.actAt=(zone,day,st)=>st.act||'rest';   /* 每個位子做什麼：照測試指定（真正的種子分配有 seat_activity_1104_unit 測）*/
(async()=>{
  await preload(['char.npc_f1','char.npc_m1','char.npc_nf2','char.npc_nm8','char.npc_nm1','char.heroine_01']);
  /* ---------- A：manifest ---------- */
  { const T=MAN['char.ual_sit_tasks'], P=MAN['prop.hand_props']; const lic=fs.readFileSync(path.join(ROOT,'LICENSES.md'),'utf8');
    check('A manifest：char.ual_sit_tasks（clips、lazy）、prop.hand_props（building、lazy），檔案都在',!!T&&T.type==='clips'&&T.lazy===true&&!!P&&P.type==='building'&&P.lazy===true&&fs.existsSync(path.join(ROOT,T.url))&&fs.existsSync(path.join(ROOT,P.url)),T?T.url+'、'+(P&&P.url):'沒有 char.ual_sit_tasks');
    check('A LICENSES.md 有 ual_sit_tasks.glb、hand_props.glb 兩列',/ual_sit_tasks\.glb/.test(lic)&&/hand_props\.glb/.test(lic));
    let asked=[]; const lo=ASSETS.loadOne; ASSETS.loadOne=k=>{ asked.push(k); return Promise.resolve(null); }; ASSETS.preload(['char.ual_sit_tasks','prop.hand_props']); ASSETS.loadOne=lo;
    check('A 開場預載不會載（lazy：ASSETS.preload 跳過）',!asked.includes('char.ual_sit_tasks')&&!asked.includes('prop.hand_props'),asked.join('、')||'沒有載'); }
  for(const k of ['char.ual_sit_clips','prop.desk_props','char.ual_sit_tasks','prop.hand_props']) await put(k);
  check('0 有接線（CHAR.sitTaskFit／setSitTask）、片段載得到',HAS&&!!ASSETS.getRaw('char.ual_sit_tasks'),HAS?'':'修改前：沒有 CHAR.sitTaskFit');
  if(!HAS){ for(const n of ['B','C','D','E','F','G','H']) check(n+'（沒有接線）',false); console.log('FAILED '+fails); process.exit(1); }
  const REF=CHAR.SIT_TASK.REF, E=JS&&JS.expect&&JS.expect.pos;
  /* ---------- B：SEATACT 的路人拿到對的片段、速度 1、手臂吃片段 ---------- */
  { const acts=['laptop','notes','textbook','phone'];
    for(const [B,key] of [['F','char.npc_f1'],['M','char.npc_m1'],['F','char.npc_nf2'],['M','char.npc_nm8']]){
      const Z=mkZone(acts.map(a=>({act:a,top:0.75,edge:0.30}))); const npcs=Z.zone.seats.map(st=>mkNPC(key,st,{pose:st.act==='phone'?'read':'sit'})); const GM=mkGM(Z,npcs);
      await run(GM,150);
      const got=npcs.map(n=>{ const r=recOf(n), t=CHAR.sitTaskOf(n.obj); return {act:n.seat.act,rec:r,t,pose:n.pose}; });
      const want={laptop:/^Sit_Type(Pad)?_/,notes:/^Sit_Write_/,textbook:/^Sit_Page_/,phone:/^Sit_Phone_/};
      const ok=got.every(g=>g.t&&want[g.act].test(g.t.playing||'')&&new RegExp('_'+B+'_Loop$').test(g.t.playing)&&g.t.w>=0.999&&g.rec&&g.rec.clip===g.t.clip&&g.t.body===B);
      check('B '+key+'（'+B+'）：用筆電＝Type／TypePad、寫筆記＝Write、看桌上的書＝Page、滑手機＝Phone，名字是 _'+B+'_Loop、權重到 1',ok,got.map(g=>g.act+'→'+(g.t?g.t.playing+' w'+g.t.w.toFixed(2):'沒有')).join('、'));
      const ph=got.find(g=>g.act==='phone');
      check('B '+key+' 滑手機：姿勢換成 sit（不是 read）、手上沒有捧著的手機（read 的）、配件 hand_phone',ph&&ph.pose==='sit'&&ph.rec&&ph.rec.pose==='sit'&&ph.rec.hold==null&&ph.t&&ph.t.prop==='hand_phone',ph&&('pose '+ph.pose+'、配件 '+(ph.t&&ph.t.prop)));
      /* 速度 1：60 格＝片段的時間走 2 秒；坐姿循環的速度沒變（baseRate 0.5 × ±15%）*/
      { const h=npcs[0].obj, m=amb(h), t0=m.tt, r0=m.rate; for(let i=0;i<60;i++){ CHAR.animate(h,DT,{pose:'sit',speed:0}); } check('B '+key+' 速度 1：60 格片段走 2.00 秒',Math.abs((m.tt-t0)-60*DT)<1e-6&&m.rate===r0&&r0<0.6,'走了 '+(m.tt-t0).toFixed(3)+' 秒、坐姿循環 '+r0.toFixed(3)); }
      /* 手臂吃片段：照片段播（t＝0、1、2.35 秒）手的位置＝LAWWW2 量的（只有 npc_f1／m1：產生片段用的骨架）*/
      if(E&&(key==='char.npc_f1'||key==='char.npc_m1')){ for(const kind of ['type','write']){ const n=npcs.find(q=>q.seat.act===(kind==='type'?'laptop':'notes')), h=n.obj, m=amb(h); let worst=0, wb='';
          const tk=CHAR.sitTaskOf(h); const nm=kind==='type'&&tk&&/TypePad/.test(tk.playing)?null:kind;   /* 觸控板版本 1.6～3.4 秒右手去觸控板：只比 0、1 秒 */
          for(const t of [0,1,2.35]){ if(!nm&&t>1.5) continue; m.tt=t-DT; CHAR.animate(h,DT,{pose:'sit',speed:0}); scene.updateMatrixWorld(true); const ex=E[B+'_'+kind+'_'+t.toFixed(2)]; if(!ex) continue;
            for(const [b,vb] of [['hand_r','rightHand'],['hand_l','leftHand'],['middle_01_r','rightMiddleProximal']]){ const p=L(h,vb), e=ex[b], d=Math.hypot(p.x-e[0],p.y-e[1],p.z-e[2]); if(d>worst){ worst=d; wb=b+' @'+t+'s'; } } }
          check('B '+key+' '+kind+'：兩手手腕、右手中指根和 LAWWW2 量的差 ≤ 2.5 cm（真正的接線、坐在 SEATACT 的桌前）',worst<=0.025,'最大 '+cm(worst)+'（'+wb+'）');
          if(kind==='write'){ m.tt=-DT; for(let i=0;i<71;i++) CHAR.animate(h,DT,{pose:'sit',speed:0}); scene.updateMatrixWorld(true); const p=L(h,'rightHand'), e=E[B+'_write_2.35'].hand_r, d=Math.hypot(p.x-e[0],p.y-e[1],p.z-e[2]);
            check('B '+key+' 寫字從 0 秒自己播 70 格（2.33 秒）：右手腕在 2.35 秒的位置（≤ 1.5 cm；速度 0.5 會差 2 cm 以上）',d<=0.015,cm(d)+'、片段時間 '+m.tt.toFixed(2)); } } }
      /* C：配件 */
      { const w=npcs.find(q=>q.seat.act==='notes'), u=w.obj.userData, P=u.taskProps||{}, pen=P.hand_pen, bone=raw(w.obj,'rightHand');
        const local=pen&&pen.position.lengthSq()<1e-12&&Math.abs(pen.quaternion.w)>1-1e-9;
        let tipY=null; if(pen){ const bb=new THREE.Box3(); tipY=9; for(let i=0;i<150;i++){ CHAR.animate(w.obj,DT,{pose:'sit',speed:0}); scene.updateMatrixWorld(true); bb.setFromObject(pen,true); tipY=Math.min(tipY,bb.min.y-(w.obj.position.y||0)); } }   /* 一整圈（5 秒）裡筆最低的那一點（頂點，不是外框）*/
        check('C '+key+' 寫字：右手骨頭上的 hand_pen 看得到（位置 0、不轉）、其他配件藏著；筆的最低點在桌面（0.75）上下 1.5 cm',!!pen&&pen.visible&&pen.parent===bone&&local&&Object.keys(P).every(k=>k==='hand_pen'||!P[k].visible)&&tipY!=null&&Math.abs(tipY-0.755)<=0.015,pen?('最低點 '+tipY.toFixed(3)+'、配件 '+Object.keys(P).join('、')):'沒有 hand_pen');
        const p=npcs.find(q=>q.seat.act==='phone'), up=p.obj.userData, hp=up.taskProps&&up.taskProps.hand_phone;
        let lookD=null; if(hp&&hp.visible){ const wp=p.obj.worldToLocal(hp.getWorldPosition(new THREE.Vector3())); lookD=up.look.position.distanceTo(wp); }
        check('C '+key+' 滑手機：hand_phone 看得到、眼睛看著它（≤ 3 cm，上一格的位置）',!!hp&&hp.visible&&lookD!=null&&lookD<=0.03,lookD!=null?cm(lookD):'沒有 hand_phone');
        const rw=recOf(w); check('C '+key+' 寫字的人桌上那支筆藏起來（tset_notes 近的換成拆開的單件：筆記本、筆袋、杯子，沒有筆；遠的 tset_notes_lod1）',!!rw&&rw.hide==='hand_pen'&&rw.set==='tset_notes'&&!rw.items.includes('item_pen')&&rw.items.includes('item_notebook_open')&&rw.items.includes('item_pencil_case')&&rw.items.includes('tset_notes'),rw?rw.set+'：'+rw.items.join('、'):'沒有配'); }
      cleanup(GM,Z); } }
  /* ---------- C：近、遠的畫法；不做了＝放回來；起身、換區域 ---------- */
  { const Z=mkZone([{act:'notes',top:0.75,edge:0.30}]); const n=mkNPC('char.npc_f1',Z.zone.seats[0]); const GM=mkGM(Z,[n]); await run(GM,90);
    const cnt=nm=>SEATACT.groups().reduce((a,g)=>a+g.children.filter(i=>i.name===nm).reduce((b,i)=>b+i.count,0),0);
    const nearOk=cnt('desk:item_notebook_open')===1&&cnt('desk:tset_notes')===0&&cnt('desk:tset_notes_lod1')===0&&cnt('desk:item_pen')===0;
    GM.E.player.obj.position.set(30,0,0); await run(GM,31); const farOk=cnt('desk:tset_notes_lod1')===1&&cnt('desk:item_notebook_open')===0; GM.E.player.obj.position.set(0,0,1.5); await run(GM,31);
    check('C 手上拿著筆：近處畫拆開的單件（沒有筆）、遠處畫 tset_notes_lod1（本來就沒有筆）',nearOk&&farOk,'近 '+nearOk+'、遠 '+farOk);
    CHAR.sitTask=false; await run(GM,61); const pen=n.obj.userData.taskProps&&n.obj.userData.taskProps.hand_pen;
    const back=!CHAR.sitTaskOf(n.obj)&&(!pen||!pen.visible)&&cnt('desk:tset_notes')===1&&cnt('desk:item_notebook_open')===0&&n.obj.userData.model.position.z===0;
    check('C 不做了（?nositask、坐著沒起來）：手上的筆藏起來、桌上的 tset_notes 放回來、手臂回大腿上',back,'片段 '+JSON.stringify(CHAR.sitTaskOf(n.obj))+'、tset_notes '+cnt('desk:tset_notes'));
    CHAR.sitTask=true; await run(GM,61); const again=CHAR.sitTaskOf(n.obj);
    n.pose='idle'; n.idlePose='idle'; await run(GM,31); const pen2=n.obj.userData.taskProps&&n.obj.userData.taskProps.hand_pen;
    check('C 起身：手上的筆藏起來、那一組從桌上拿掉、片段拿掉',!!again&&!CHAR.sitTaskOf(n.obj)&&!!pen2&&!pen2.visible&&SEATACT.state().n===0,'起身前 '+(again&&again.playing)+'、起身後 '+JSON.stringify(CHAR.sitTaskOf(n.obj)));
    n.pose='sit'; n.idlePose='sit'; await run(GM,61); const had=!!CHAR.sitTaskOf(n.obj); SEATACT.clear(); for(let i=0;i<2;i++) CHAR.animate(n.obj,DT,{pose:'sit',speed:0});
    check('C 換區域（SEATACT.clear）：片段、配件拿掉',had&&!CHAR.sitTaskOf(n.obj)&&!n.obj.userData.taskProps.hand_pen.visible);
    cleanup(GM,Z); }
  /* ---------- D：照舊（沒有片段）---------- */
  { const Z=mkZone([{act:'laptop',top:1.05,edge:0.30,lift:0.27},{act:'laptop',top:0.45,edge:0.40},{act:'laptop',top:0.85,edge:0.30},{act:'laptop',top:0.75,edge:0.60},{act:'notes',top:0.75,edge:0.30},{act:'laptop',top:0.75,edge:0.30}]);
    const st=Z.zone.seats; const npcs=[mkNPC('char.npc_m1',st[0]),mkNPC('char.npc_m1',st[1]),mkNPC('char.npc_m1',st[2]),mkNPC('char.npc_m1',st[3]),mkNPC('char.heroine_01',st[4],{spec:{id:'an',name:'沈以安'},n:{id:'an',name:'沈以安',isExtra:false}}),mkNPC('char.npc_m1',st[5],{pose:'read',n:{lookAt:null}})];
    st[5].act='book'; const GM=mkGM(Z,npcs); await run(GM,120);
    const lab=['吧台高腳椅（1.05 m）','矮桌（0.45 m）','太高的桌子（0.85 m）','太遠的桌子（桌緣 0.60 m）','有名字的人（以安）','手上捧書'];
    const bad=npcs.map((n,i)=>CHAR.sitTaskOf(n.obj)?lab[i]+'：'+CHAR.sitTaskOf(n.obj).playing:null).filter(Boolean);
    const lap=npcs.slice(0,4).every(n=>{ const w=L(n.obj,'rightHand'), t=L(n.obj,'rightUpperLeg'); return w.y<t.y+0.25&&w.z<0.42; });
    check('D 吧台、矮桌、太高、太遠、有名字的人、手上捧書：沒有片段（照舊：坐姿循環、手放在大腿上）',!bad.length&&lap,bad.join('；')||('手在大腿上 '+lap));
    cleanup(GM,Z); }
  /* ---------- D2：每個人自己的骨架 ---------- */
  { const Z=mkZone([{act:'laptop',top:0.75,edge:0.30},{act:'notes',top:0.75,edge:0.30}]); const npcs=Z.zone.seats.map(st=>mkNPC('char.npc_nm1',st)); const GM=mkGM(Z,npcs); await run(GM,90);
    const dv=CHAR._taskDev(npcs[0].obj,'Sit_Type_M_Loop'), R0=CHAR.SIT_TASK.HANDS.M.type, dy=dv?((dv.l.y-R0.l[1])+(dv.r.y-R0.r[1]))/2:null;
    check('D2 骨架和參考差很多（LAWWW2 的 bl_npc_nm1：照片段擺，手比參考低 4 cm 以上）：照舊，沒有片段',dy!=null&&dy<-0.04&&npcs.every(n=>!CHAR.sitTaskOf(n.obj)),dy!=null?'手低了 '+cm(-dy):'量不到');
    cleanup(GM,Z); }
  { const h=mkNPC('char.npc_nf2',{x:0,z:0,yaw:0,lv:0}).obj; for(let i=0;i<10;i++){ CHAR.animate(h,DT,{pose:'sit',speed:0}); } scene.updateMatrixWorld(true);
    const H=h.userData.vrm.humanoid, names=['hips','spine','chest','neck','head','leftUpperArm','leftLowerArm','leftHand','rightUpperArm','rightLowerArm','rightHand','rightIndexProximal','leftUpperLeg','leftLowerLeg','leftFoot'];
    const snap=()=>names.map(n=>[H.getRawBoneNode(n).quaternion.clone(),H.getNormalizedBoneNode(n).quaternion.clone(),H.getRawBoneNode(n).getWorldPosition(new THREE.Vector3())]).concat([[h.userData.model.position.clone()]]);
    const s0=snap(); delete h.userData.taskDev; const f=CHAR.sitTaskFit(h,'write',{h:0.75,edge:0.30,depth:0.3}); const s1=snap();
    let worst=0; s0.forEach((a,i)=>a.forEach((v,j)=>{ worst=Math.max(worst,qd(v,s1[i][j])); }));
    check('D2 量骨架（照片段擺一次）以後骨頭、位置全部放回去（真實的、正規化的骨頭、世界位置都一模一樣；不會留一格錯的畫面）',!!f&&!!h.userData.taskDev&&worst<1e-12,'最大差 '+worst.toExponential(1));
    const P0=CHAR.SIT_TASK.probesPer; CHAR.SIT_TASK.probesPer=1; const g1=mkNPC('char.npc_nf2',{x:3,z:0,yaw:0,lv:0}).obj, g2=mkNPC('char.npc_nf2',{x:5,z:0,yaw:0,lv:0}).obj; for(const g of [g1,g2]) CHAR.animate(g,DT,{pose:'sit',speed:0});
    await sleep(25); const a1=!!CHAR.sitTaskFit(g1,'type',{h:0.75,edge:0.30,depth:0.3}), a2=!!CHAR.sitTaskFit(g2,'type',{h:0.75,edge:0.30,depth:0.3}); await sleep(25); const a3=!!CHAR.sitTaskFit(g2,'type',{h:0.75,edge:0.30,depth:0.3});
    CHAR.SIT_TASK.probesPer=P0; check('D2 一次量的人數有上限（probesPer：同一段時間第二個人等下一次 SEATACT）',a1&&!a2&&a3,a1+'／'+a2+'／'+a3);
    for(const o of [h,g1,g2]){ scene.remove(o); CHAR.release(o); } }
  /* ---------- E：桌緣比參考遠：往前坐 ---------- */
  { const Z=mkZone([{act:'laptop',top:0.75,edge:0.30},{act:'laptop',top:0.75,edge:0.42}]); const npcs=Z.zone.seats.map(st=>mkNPC('char.npc_m1',st)); const GM=mkGM(Z,npcs); await run(GM,120);
    const [a,b]=npcs, ta=CHAR.sitTaskOf(a.obj), tb=CHAR.sitTaskOf(b.obj);
    const sh=b.obj.userData.model.position.z;
    amb(b.obj).tt=amb(a.obj).tt; for(const n of npcs) CHAR.animate(n.obj,DT,{pose:'sit',speed:0}); scene.updateMatrixWorld(true);
    const da=L(a.obj,'leftHand').z-0.30, db=L(b.obj,'leftHand').z-0.42;   /* 左手（打字、打字＋觸控板的左手一樣）*/
    check('E 桌緣 0.42 m：人往前坐 0.12 m、手腕到桌緣的距離和參考（0.30 m）一樣（≤ 1 cm）；桌緣 0.30 不挪',!!ta&&!!tb&&Math.abs(sh-0.12)<0.003&&Math.abs(a.obj.userData.model.position.z)<1e-9&&Math.abs(da-db)<=0.01,'往前 '+cm(sh)+'、手腕到桌緣 '+cm(da)+'／'+cm(db)+'（'+(tb&&tb.playing)+'）');
    cleanup(GM,Z); }
  /* ---------- F：載不到 ---------- */
  { const keep={c:ASSETS.cache['char.ual_sit_tasks'],d:window.ASSET_DATA[MAN['char.ual_sit_tasks'].url]};
    delete ASSETS.cache['char.ual_sit_tasks']; delete ASSETS.status['char.ual_sit_tasks']; delete window.ASSET_DATA[MAN['char.ual_sit_tasks'].url]; CHAR._taskReset();
    let calls=0; const lo=ASSETS.loadOne; ASSETS.loadOne=k=>{ if(k==='char.ual_sit_tasks') calls++; return lo(k); }; const ow=console.warn; console.warn=()=>{};
    const runOne=async flag=>{ CHAR.ambRand=seeded(99); const was=CHAR.sitTask; CHAR.sitTask=flag; const Z=mkZone([{act:'laptop',top:0.75,edge:0.30},{act:'notes',top:0.75,edge:0.30}]); const npcs=Z.zone.seats.map(st=>mkNPC('char.npc_f1',st)); const GM=mkGM(Z,npcs);
      let err=null; try{ await run(GM,120); }catch(e){ err=e; } const q=npcs.map(n=>['LeftArm','RightForeArm','RightHand','Spine1','Head'].map(b=>n.obj.userData.bones[b].quaternion.clone())); const t=npcs.map(n=>CHAR.sitTaskOf(n.obj)), clean=npcs.every(n=>{ const u=n.obj.userData; return !u.sitTask&&!u.taskProps&&u.model.position.z===0&&!(u.amb&&u.amb.tc); }); CHAR.sitTask=was; cleanup(GM,Z); return {err,q,t,clean}; };
    const A=await runOne(true), B=await runOne(false); console.warn=ow;
    let worst=0; A.q.forEach((L1,i)=>L1.forEach((q,j)=>{ worst=Math.max(worst,qd(q,B.q[i][j])); }));
    check('F 片段的 GLB 不見：不報錯、沒有片段、骨頭和沒有這個功能（sitTask=false）一模一樣',!A.err&&A.t.every(x=>!x)&&A.clean&&worst<1e-12,A.err?String(A.err).slice(0,120):'四元數分量最大差 '+worst.toExponential(1));
    check('F 載入失敗以後 30 秒內不再下載（120 格、好幾個人：1 次）',calls===1&&CHAR._task.failed===true,'下載 '+calls+' 次');
    ASSETS.loadOne=lo; ASSETS.cache['char.ual_sit_tasks']=keep.c; window.ASSET_DATA[MAN['char.ual_sit_tasks'].url]=keep.d; CHAR._taskReset(); CHAR.ambRand=seeded(5); }
  { const keep=ASSETS.cache['prop.hand_props']; delete ASSETS.cache['prop.hand_props']; delete ASSETS.status['prop.hand_props']; const du=MAN['prop.hand_props'].url, dd=window.ASSET_DATA[du]; delete window.ASSET_DATA[du]; CHAR._taskReset(); const ow=console.warn; console.warn=()=>{};
    const Z=mkZone([{act:'laptop',top:0.75,edge:0.30},{act:'notes',top:0.75,edge:0.30},{act:'phone',top:0.75,edge:0.30},{act:'textbook',top:0.75,edge:0.30}]); const npcs=Z.zone.seats.map(st=>mkNPC('char.npc_m1',st,{pose:st.act==='phone'?'read':'sit'})); const GM=mkGM(Z,npcs);
    let err=null; try{ await run(GM,120); }catch(e){ err=e; } console.warn=ow; const t=npcs.map(n=>CHAR.sitTaskOf(n.obj)), ph=npcs[2];
    check('F 配件的 GLB 不見：寫字、滑手機照舊（滑手機＝read 捧著手機）、打字、翻書照樣有片段、不報錯',!err&&!!t[0]&&!t[1]&&!t[2]&&!!t[3]&&ph.pose==='read',err?String(err).slice(0,100):npcs.map((n,i)=>n.seat.act+'→'+(t[i]?t[i].playing:'照舊（'+n.pose+'）')).join('、'));
    cleanup(GM,Z); ASSETS.cache['prop.hand_props']=keep; window.ASSET_DATA[du]=dd; CHAR._taskReset(); }
  /* ---------- 吃飯的店：坐著吃 ---------- */
  { const Z=mkZone([{act:'eat',top:0.75,edge:0.30},{act:'eat',top:0.75,edge:0.30}],'test_meal'); const npcs=[mkNPC('char.npc_f1',Z.zone.seats[0]),mkNPC('char.npc_f1',Z.zone.seats[1],{pose:'read'})]; const GM=mkGM(Z,npcs); await run(GM,120);
    const r0=recOf(npcs[0]), t0=CHAR.sitTaskOf(npcs[0].obj), t1=CHAR.sitTaskOf(npcs[1].obj);
    check('B 吃飯的店：坐著（sit）吃的人＝Sit_Eat_F_Loop（桌上有碗；手上沒有配件）、坐著 read 的照舊（姿勢不動）',!!t0&&t0.playing==='Sit_Eat_F_Loop'&&!t0.prop&&!!r0&&r0.items.some(x=>/^item_bowl/.test(x))&&!t1&&npcs[1].pose==='read',(t0?t0.playing:'沒有')+'、桌上 '+(r0?r0.items.join('、'):'-'));
    cleanup(GM,Z); }
  /* ---------- G：不留垃圾、換模型 ---------- */
  { const Z=mkZone([{act:'notes',top:0.75,edge:0.30}]); const n=mkNPC('char.npc_nf2',Z.zone.seats[0]); const GM=mkGM(Z,[n]); await run(GM,60);
    const bone=raw(n.obj,'rightHand'), c0=bone.children.length; await run(GM,90); const c1=bone.children.length;
    check('G 每一格不會一直加配件（右手骨頭的子物件 60 格→150 格一樣多）',c0===c1&&bone.children.filter(o=>/^taskProp:/.test(o.name)).length===1,c0+' → '+c1);
    const before=CHAR.sitTaskOf(n.obj); const nh=CHAR.upgrade(n.obj); let upOk=false;
    if(nh){ n.obj=nh; for(let i=0;i<3;i++) CHAR.animate(nh,DT,{pose:'sit',speed:0}); const a=CHAR.sitTaskOf(nh), p=nh.userData.taskProps&&nh.userData.taskProps.hand_pen; upOk=!!a&&a.clip===before.clip&&!!p&&p.visible&&p.parent===raw(nh,'rightHand'); }
    check('G CHAR.upgrade（換成正式模型）：接著做、配件掛到新的骨頭上',upOk,before&&before.playing);
    const h=n.obj, tplBone=raw(h,'rightHand'); SEATACT.clear(); scene.remove(h); CHAR.release(h);
    check('G CHAR.release：配件從骨頭拿下來（VRM 的第一個實例會被下一個人重用）',!tplBone.children.some(o=>/^taskProp:/.test(o.name)));
    scene.remove(Z.zone.group); }
  /* ---------- H：WIN 和量到的一樣 ---------- */
  { const REST={type:['left','right'],typepad:['left'],write:['left','right'],phone:['left'],page:['left'],drink:['left'],eat:['left']}; const bad=[];
    for(const [B,key] of [['F','char.npc_f1'],['M','char.npc_m1']]) for(const kind of Object.keys(CHAR.SIT_TASK.WIN)){
      const h=CHAR.build({model:key,height:MAN[key].height}); scene.add(h); for(let i=0;i<3;i++){ CHAR.animate(h,DT,{pose:'sit',speed:0}); }
      const f=CHAR.sitTaskFit(h,kind,{h:0.75,edge:0.30,depth:0.3}); if(!f){ bad.push(B+kind+' 沒有 fit'); scene.remove(h); CHAR.release(h); continue; } CHAR.setSitTask(h,f);
      for(let i=0;i<20;i++) CHAR.animate(h,DT,{pose:'sit',speed:0}); let zc=-1, far=9, tip=-1;
      for(let i=0;i<150;i++){ CHAR.animate(h,DT,{pose:'sit',speed:0}); scene.updateMatrixWorld(true);
        for(const s of ['left','right']){ const S0=L(h,s+'UpperArm'), E0=L(h,s+'LowerArm'), W0=L(h,s+'Hand'); for(const [a,b] of [[S0,E0],[E0,W0]]) for(let k=0;k<=20;k++){ const p=a.clone().lerp(b,k/20); if(p.y<0.765&&p.z>zc) zc=p.z; } }
        for(const s of REST[kind]) far=Math.min(far,L(h,s+'Hand').z+0.03);
        if(kind==='type') for(const s of ['left','right']) tip=Math.max(tip,L(h,s+'MiddleDistal').z+0.02); }
      const w=CHAR.SIT_TASK.WIN[kind][B], nearMin=Math.min(REF.edge,zc)-0.011;
      if(w[0]<nearMin) bad.push(B+' '+kind+' 近 '+w[0]+' < 量到的 '+nearMin.toFixed(3));
      if(w[1]>far+0.001) bad.push(B+' '+kind+' 遠 '+w[1]+' > 量到的 '+far.toFixed(3));
      if(kind==='type'&&w[0]+0.216<tip) bad.push(B+' 打字的指尖 '+tip.toFixed(3)+' 過了鉸鏈 '+(w[0]+0.216).toFixed(3));
      scene.remove(h); CHAR.release(h); }
    check('H C.SIT_TASK.WIN 不比量到的鬆：女生不比參考的桌子更貼、放在桌上的手腕往前 3 cm 在桌上、打字的指尖不過筆電的鉸鏈',!bad.length,bad.join('；')); }
  SEATACT.actAt=actAt0;
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error('ERR',e); process.exit(2); });
