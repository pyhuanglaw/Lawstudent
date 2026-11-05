// 坐在桌前做事的循環的接線（NPC-ANIM-LOOPS-1104；LAWWW2-C 交件 2962616ac 的片段 ual_sit_tasks.glb、配件 hand_props.glb）——不需要瀏覽器。
// 在 Node 載入遊戲的 three.js／three-vrm／CHAR／SEATACT（不算圖）、坐姿循環、做事的片段、右手配件、桌上小物（desk_props）的 GLB，
// 用真的 VRoid 路人（vroid_npc_f1／m1、LAWWW2 的 bl_npc_nf2／nm8／nm1／nm5）坐在測試用的桌子前，跑 SEATACT.tick（每 30 格）＋CHAR.animate（每格 1/30 秒）：
//   A  manifest：char.ual_sit_tasks（clips、lazy）、prop.hand_props（building、lazy）都有、檔案在、LICENSES.md 有；開場預載（ASSETS.preload）不會載它們
//   B  SEATACT 的路人：用筆電＝Sit_Type／Sit_TypePad、寫筆記＝Sit_Write、看桌上的書＝Sit_Page、滑手機＝Sit_Phone（姿勢從 read 換成 sit、手上的手機換成配件）；
//      片段的名字照骨架分 _F／_M（女生 npc_f1、nf2；男生 npc_m1、nm8）；速度 1（60 格＝片段走 2 秒）；手臂吃片段：照片段播的時候兩手手腕、右手中指根和
//      LAWWW2 量的位置（ual_sit_tasks.json 的 expect）差 ≤ 2.5 cm（同 tests/sit_task_loops_unit.js，但走真正的接線、不換 manifest），從 0 秒自己播到 2.33 秒寫字的右手 ≤ 1.5 cm
//   C  配件：寫字＝右手骨頭上的 hand_pen（位置 0、不轉、看得到，筆尖在筆記本上）、滑手機＝hand_phone（眼睛看著它）；一次只開一個；桌上那支筆藏起來
//      （自習桌 tset_notes：近的換成拆開的單件、沒有筆；遠的照用 _lod1）；不做了（?nositask／拿掉）＝手上的藏、桌上的放回來；起身＝配件藏、那一組拿掉；換區域＝全部拿掉
//   D  照舊（沒有片段）：吧台的高腳椅、矮桌、太高的桌子（0.85 m）、太遠的桌子（桌緣 0.60 m）、有名字的人、聊天、手上捧書
//   E  桌緣比參考遠（0.42 m）：人往前坐 12 cm、手和桌緣的相對位置跟參考一樣（≤ 1 cm）；E2 桌子 0.77 m：往上坐 1.5 cm，筆照樣在紙上
//   E3 桌緣近（CAFE-EDGE-1105：afar、Daybreak、林家、木曜日、社科圖 0.14～0.25）：0.20、0.14 的桌子用 _E20 那一組（0.14＝往後坐 3 cm）、手腕到桌緣的距離和 0.20 參考一樣（≤ 1 cm）；
//      0.27（118 巷的店）照舊用參考那一組（往後 3 cm）；0.10 太近（肚子會頂到桌子）＝照舊沒有片段
//   F  載不到：片段的 GLB 不見＝不報錯、和沒有這個功能一模一樣（骨頭的四元數分量）；載入失敗以後 30 秒內不再下載；配件的 GLB 不見＝要拿東西的（寫字、滑手機）照舊、打字照樣
//   G  不留垃圾：每一格不會一直加配件；C.release 把配件從骨頭拿下來（VRM 的第一個實例會被下一個人重用）；CHAR.upgrade（換模型）接著做
//   D2 每個人自己的骨架：照片段擺一次量手（量完骨頭全部放回去）、和參考差很多的照舊、差一點的往上下坐補（SIT-HEIGHT-1104 以後照新的坐下高度：Sakurada 改的 nm8 手低 3 cm＝打字往上坐、寫字照舊；
//      手臂長的 nm11 寫字 M 合不上 → 換 M2、打字 M 往下坐）；一次量的人數有上限、同一個模型共用、滑手機不排隊、走路的時候不量
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
  await preload(['char.npc_f1','char.npc_m1','char.npc_nf2','char.npc_nm8','char.npc_nm9','char.npc_nm1','char.npc_nm5','char.heroine_01','char.npc_nf10','char.npc_nm11']);   /* nf10、nm11＝F2、M2 的參考骨架（LAWWW2-C 補件 2）*/
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
    for(const [B,key] of [['F','char.npc_f1'],['M','char.npc_m1'],['F','char.npc_nf2'],['M','char.npc_nm9']]){   /* nm9：HairSample_Male 改的（SIT-HEIGHT-1104 以前用 nm8，坐下高度照模型以後 nm8 的手比參考低 3 cm，寫字、看書、滑手機合不上）*/
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
  { const Z=mkZone([{act:'laptop',top:0.75,edge:0.30},{act:'notes',top:0.75,edge:0.30},{act:'laptop',top:0.75,edge:0.30},{act:'notes',top:0.75,edge:0.30}]); const st=Z.zone.seats;
    const npcs=[mkNPC('char.npc_nm8',st[0]),mkNPC('char.npc_nm8',st[1]),mkNPC('char.npc_nm11',st[2]),mkNPC('char.npc_nm11',st[3])]; const GM=mkGM(Z,npcs); await run(GM,180);   /* 第二種身材（M2）要多等一次 SEATACT：一格量骨架的人數有上限（probesPer）*/
    const dyOf=(h,cl,kind)=>{ const dv=CHAR._taskDev(h,cl), R0=CHAR.SIT_TASK.HANDS.M[kind]; return dv?((dv.l.y-R0.l[1])+(dv.r.y-R0.r[1]))/2:null; };
    const sitY=n=>{ const u=n.obj.userData; return (u.model.userData.baseY||0)-(CHAR.sitDrop?CHAR.sitDrop(n.obj):0.47*u.k); };   /* 坐下往下多少：SIT-HEIGHT-1104 以後照模型（CHAR.sitDrop），以前一律 0.47×身高比例 */
    const d8=dyOf(npcs[0].obj,'Sit_Type_M_Loop','type'), t8=CHAR.sitTaskOf(npcs[0].obj), w8=CHAR.sitTaskOf(npcs[1].obj), u8=npcs[0].obj.userData;
    const dw=dyOf(npcs[3].obj,'Sit_Write_M_Loop','write'), t11=CHAR.sitTaskOf(npcs[2].obj), w11=CHAR.sitTaskOf(npcs[3].obj), u11=npcs[2].obj.userData;
    check('D2 手比參考低 3 cm 的骨架（Sakurada 改的 bl_npc_nm8）：打字＝M、往上坐 1.5 cm（補完差 3 cm 以內）；寫字 M、M2 都合不上（筆尖只容許 1 cm）＝照舊',d8!=null&&d8<-0.025&&!!t8&&/^Sit_Type(Pad)?_M_Loop$/.test(t8.playing||'')&&Math.abs(t8.lift-0.015)<1e-6&&Math.abs((u8.model.position.y-sitY(npcs[0]))-0.015)<1e-4&&!w8,
      (d8!=null?'手低了 '+cm(-d8):'量不到')+'、打字 '+(t8?t8.playing+' 往上 '+cm(t8.lift)+'（人物實際往上 '+cm(u8.model.position.y-sitY(npcs[0]))+'）':'照舊')+'、寫字 '+(w8?w8.playing+'（錯）':'照舊'));
    check('D2 手臂長的骨架（bl_npc_nm11＝M2 的參考）：寫字＝M 手高 2.5 cm 以上合不上 → 換 M2（Sit_Write_M2_Loop）；打字＝先試 M、往下坐 1.5 cm',dw!=null&&dw>0.025&&!!w11&&w11.playing==='Sit_Write_M2_Loop'&&w11.body==='M2'&&!!t11&&/^Sit_Type(Pad)?_M_Loop$/.test(t11.playing||'')&&Math.abs(t11.lift+0.015)<1e-6&&Math.abs((u11.model.position.y-sitY(npcs[2]))+0.015)<1e-4,
      (dw!=null?'寫字 M 的手高了 '+cm(dw):'量不到')+'、寫字 '+(w11?w11.playing:'照舊')+'、打字 '+(t11?t11.playing+' 往上 '+cm(t11.lift)+'（人物實際往上 '+cm(u11.model.position.y-sitY(npcs[2]))+'）':'沒有'));
    cleanup(GM,Z); }
  { const h=mkNPC('char.npc_nf2',{x:0,z:0,yaw:0,lv:0}).obj; for(let i=0;i<10;i++){ CHAR.animate(h,DT,{pose:'sit',speed:0}); } scene.updateMatrixWorld(true);
    const H=h.userData.vrm.humanoid, names=['hips','spine','chest','neck','head','leftUpperArm','leftLowerArm','leftHand','rightUpperArm','rightLowerArm','rightHand','rightIndexProximal','leftUpperLeg','leftLowerLeg','leftFoot'];
    const snap=()=>names.map(n=>[H.getRawBoneNode(n).quaternion.clone(),H.getNormalizedBoneNode(n).quaternion.clone(),H.getRawBoneNode(n).getWorldPosition(new THREE.Vector3())]).concat([[h.userData.model.position.clone()]]);
    const s0=snap(); delete h.userData.taskDev; const f=CHAR.sitTaskFit(h,'write',{h:0.75,edge:0.30,depth:0.3}); const s1=snap();
    let worst=0; s0.forEach((a,i)=>a.forEach((v,j)=>{ worst=Math.max(worst,qd(v,s1[i][j])); }));
    check('D2 量骨架（照片段擺一次）以後骨頭、位置全部放回去（真實的、正規化的骨頭、世界位置都一模一樣；不會留一格錯的畫面）',!!f&&!!h.userData.taskDev&&worst<1e-12,'最大差 '+worst.toExponential(1));
    /* 一次量的人數有上限（probesPer）；同一個模型、同一個縮放量過就共用（TDEV）；urgent（滑手機）不排隊 */
    const P0=CHAR.SIT_TASK.probesPer; CHAR.SIT_TASK.probesPer=1; CHAR._taskDevCache.clear();
    const g1=mkNPC('char.npc_nf2',{x:3,z:0,yaw:0,lv:0}).obj, g2=mkNPC('char.npc_f1',{x:5,z:0,yaw:0,lv:0}).obj, g3=mkNPC('char.npc_nf2',{x:7,z:0,yaw:0,lv:0}).obj, g4=mkNPC('char.npc_m1',{x:9,z:0,yaw:0,lv:0}).obj; for(const g of [g1,g2,g3,g4]) CHAR.animate(g,DT,{pose:'sit',speed:0});
    const D={h:0.75,edge:0.30,depth:0.3}; await sleep(25);
    const a1=!!CHAR.sitTaskFit(g1,'type',D), a2=!!CHAR.sitTaskFit(g2,'type',D), a3=!!CHAR.sitTaskFit(g3,'type',D), a4=!!CHAR.sitTaskFit(g4,'phone',D,true); await sleep(25); const a5=!!CHAR.sitTaskFit(g2,'type',D);
    CHAR.SIT_TASK.probesPer=P0;
    check('D2 一次量的人數有上限（probesPer＝1：第一個量、別的模型等下一次）、同一個模型量過就共用（不用再量）、滑手機（urgent）不排隊',a1&&!a2&&a3&&a4&&a5,'第一個 '+a1+'、別的模型 '+a2+'、同模型 '+a3+'、urgent '+a4+'、過 25 ms '+a5);
    for(const o of [h,g1,g2,g3,g4]){ scene.remove(o); CHAR.release(o); }
    /* 站著、正在播走路／站著的動畫（骨盆被動畫轉過）＝不量（量錯會整個模型共用）；坐下以後才量 */
    CHAR._taskDevCache.clear(); const w=mkNPC('char.npc_nf2',{x:11,z:0,yaw:0,lv:0},{pose:'idle'}).obj; for(let i=0;i<5;i++) CHAR.animate(w,DT,{pose:'walk',speed:1.2});
    const w1=CHAR.sitTaskFit(w,'type',{h:0.75,edge:0.30,depth:0.3},true), wc=CHAR._taskDevCache.size; for(let i=0;i<3;i++) CHAR.animate(w,DT,{pose:'sit',speed:0}); const w2=CHAR.sitTaskFit(w,'type',{h:0.75,edge:0.30,depth:0.3},true);
    check('D2 走路、站著的時候不量骨架（不存進整個模型共用的結果）；坐下以後才量',!w1&&wc===0&&!!w2&&CHAR._taskDevCache.size===1,'走路 '+!!w1+'（共用 '+wc+'）、坐下 '+!!w2);
    scene.remove(w); CHAR.release(w); }
  /* ---------- E：桌緣比參考遠：往前坐 ---------- */
  { const Z=mkZone([{act:'laptop',top:0.75,edge:0.30},{act:'laptop',top:0.75,edge:0.42}]); const npcs=Z.zone.seats.map(st=>mkNPC('char.npc_m1',st)); const GM=mkGM(Z,npcs); await run(GM,120);
    const [a,b]=npcs, ta=CHAR.sitTaskOf(a.obj), tb=CHAR.sitTaskOf(b.obj);
    const sh=b.obj.userData.model.position.z;
    amb(b.obj).tt=amb(a.obj).tt; for(const n of npcs) CHAR.animate(n.obj,DT,{pose:'sit',speed:0}); scene.updateMatrixWorld(true);
    const da=L(a.obj,'leftHand').z-0.30, db=L(b.obj,'leftHand').z-0.42;   /* 左手（打字、打字＋觸控板的左手一樣）*/
    check('E 桌緣 0.42 m：人往前坐 0.12 m、手腕到桌緣的距離和參考（0.30 m）一樣（≤ 1 cm）；桌緣 0.30 不挪',!!ta&&!!tb&&Math.abs(sh-0.12)<0.003&&Math.abs(a.obj.userData.model.position.z)<1e-9&&Math.abs(da-db)<=0.01,'往前 '+cm(sh)+'、手腕到桌緣 '+cm(da)+'／'+cm(db)+'（'+(tb&&tb.playing)+'）');
    cleanup(GM,Z); }
  /* ---------- E2：0.77 m 的桌子（法圖、Café 常見）：往上坐 1.5 cm 補，筆照樣在紙上 ---------- */
  { const Z=mkZone([{act:'notes',top:0.77,edge:0.30}]); const n=mkNPC('char.npc_f1',Z.zone.seats[0]); const GM=mkGM(Z,[n]); await run(GM,90);
    const t=CHAR.sitTaskOf(n.obj), pen=n.obj.userData.taskProps&&n.obj.userData.taskProps.hand_pen; let lo=9; const bb=new THREE.Box3();
    if(pen) for(let i=0;i<150;i++){ CHAR.animate(n.obj,DT,{pose:'sit',speed:0}); scene.updateMatrixWorld(true); bb.setFromObject(pen,true); lo=Math.min(lo,bb.min.y-0.77); }
    check('E2 桌子 0.77 m（比參考高 2 cm）：寫字照樣有片段、往上坐 1.5 cm、筆最低的那一點在桌面上下 1.5 cm',!!t&&/^Sit_Write_F/.test(t.playing||'')&&Math.abs(t.lift-0.015)<1e-6&&!!pen&&Math.abs(lo-0.005)<=0.015,t?(t.playing+' 往上 '+cm(t.lift)+'、筆最低點離桌面 '+cm(lo)):'沒有片段');
    cleanup(GM,Z); }
  /* ---------- E3：桌緣近：用 _E20 那一組（CAFE-EDGE-1105）---------- */
  { const Z=mkZone([{act:'laptop',top:0.75,edge:0.20},{act:'notes',top:0.75,edge:0.14},{act:'laptop',top:0.75,edge:0.27},{act:'laptop',top:0.75,edge:0.10}]); const npcs=Z.zone.seats.map(st=>mkNPC('char.npc_f1',st)); const GM=mkGM(Z,npcs); await run(GM,180);
    const T=npcs.map(n=>CHAR.sitTaskOf(n.obj)), Z0=npcs.map(n=>n.obj.userData.model.position.z);
    for(const n of npcs) amb(n.obj).tt=amb(npcs[0].obj).tt; for(const n of npcs) CHAR.animate(n.obj,DT,{pose:'sit',speed:0}); scene.updateMatrixWorld(true);
    const dA=L(npcs[0].obj,'leftHand').z-0.20, ok=!!T[0]&&/^Sit_Type(Pad)?_F_E20_Loop$/.test(T[0].playing||'')&&T[0].ref===0.20&&Math.abs(Z0[0])<0.003&&Math.abs(dA-(CHAR.SIT_TASK.HANDS.F_E20.type.l[2]-0.20))<=0.01;
    check('E3 桌緣 0.20：用 Sit_Type_F_E20（桌緣 0.20 那一組）、不挪、手腕到桌緣的距離和參考一樣（≤ 1 cm）',ok,T[0]?(T[0].playing+' 參考 '+T[0].ref+'、挪 '+cm(Z0[0])+'、手腕到桌緣 '+cm(dA)):'沒有片段');
    check('E3 桌緣 0.14：寫字用 Sit_Write_F_E20、往後坐 3 cm',!!T[1]&&T[1].playing==='Sit_Write_F_E20_Loop'&&Math.abs(Z0[1]+0.03)<0.003,T[1]?(T[1].playing+' 挪 '+cm(Z0[1])):'沒有片段');
    check('E3 桌緣 0.27（118 巷的店）：照舊用參考那一組（Sit_Type_F_Loop、往後 3 cm）；桌緣 0.10（肚子會頂到桌子）：沒有片段',!!T[2]&&/^Sit_Type(Pad)?_F_Loop$/.test(T[2].playing||'')&&Math.abs(Z0[2]+0.03)<0.003&&!T[3],
      (T[2]?T[2].playing+' 挪 '+cm(Z0[2]):'0.27 沒有片段')+'；0.10 '+(T[3]?T[3].playing+'（錯）':'沒有'));
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
    const u0=npcs[0].obj.userData, ch0=u0.taskProps&&u0.taskProps.hand_chopsticks;
    check('B 吃飯的店：吃飯用片段（11-05 LAWWW-C 開：SIT-HEIGHT-1104 坐下高度改好以後 S.TASK_EAT 併進 S.TASK）＝吃的人播 Sit_Eat_F_Loop、右手拿筷子（hand_chopsticks）、桌上那雙筷子拿掉（碗還在）；坐著 read 的照舊',SEATACT.TASK.eat==='eat'&&SEATACT.TASK.eat2==='eat'&&!!t0&&t0.playing==='Sit_Eat_F_Loop'&&t0.prop==='hand_chopsticks'&&!!ch0&&ch0.visible&&ch0.parent===raw(npcs[0].obj,'rightHand')&&!!r0&&r0.items.some(x=>/^item_bowl/.test(x))&&!r0.items.some(x=>/^item_chopsticks$/.test(x))&&!t1&&npcs[1].pose==='read',(t0?t0.playing+'／'+(t0.prop||'-'):'沒有')+'、桌上 '+(r0?r0.items.join('、'):'-'));
    cleanup(GM,Z);
    { const T0=Object.assign({},SEATACT.TASK); delete SEATACT.TASK.eat; delete SEATACT.TASK.eat2; CHAR._taskReset();   /* 關掉的開關（seatact3d.js 刪掉 Object.assign(S.TASK,S.TASK_EAT) 那一行）：照舊坐姿、桌上照舊有碗和筷子 */ const Z2=mkZone([{act:'eat',top:0.75,edge:0.30},{act:'eat',top:0.75,edge:0.30}],'test_meal'); const n2=[mkNPC('char.npc_f1',Z2.zone.seats[0]),mkNPC('char.npc_f1',Z2.zone.seats[1],{pose:'read'})]; const GM2=mkGM(Z2,n2); await run(GM2,120);
      const r2=recOf(n2[0]), t2=CHAR.sitTaskOf(n2[0].obj), t3=CHAR.sitTaskOf(n2[1].obj), u2=n2[0].obj.userData, ch=u2.taskProps&&u2.taskProps.hand_chopsticks;
      check('B 吃飯：把 eat 從 S.TASK 拿掉（關掉的開關）＝坐著吃的人照舊坐姿、手上沒有筷子、桌上照舊有碗和筷子；坐著 read 的照舊',!t2&&!(ch&&ch.visible)&&!!r2&&r2.items.some(x=>/^item_bowl/.test(x))&&r2.items.some(x=>/^item_chopsticks$/.test(x))&&!t3&&n2[1].pose==='read',(t2?t2.playing:'沒有')+'、桌上 '+(r2?r2.items.join('、'):'-'));
      cleanup(GM2,Z2); for(const k of Object.keys(SEATACT.TASK)) delete SEATACT.TASK[k]; Object.assign(SEATACT.TASK,T0); CHAR._taskReset(); }
  }
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
    const ALT0=CHAR.SIT_TASK.ALT, REFS0=CHAR.SIT_TASK.REFS, MEAS=[];
    const LIST=[['F','char.npc_f1'],['M','char.npc_m1'],['F2','char.npc_nf10'],['M2','char.npc_nm11']].concat(REFS0?[['F_E20','char.npc_f1'],['M_E20','char.npc_m1']]:[]);   /* _E20＝桌緣 0.20 的那一組（CAFE-EDGE-1105）*/
    for(const [B,key] of LIST) for(const kind of Object.keys(CHAR.SIT_TASK.WIN)){ const B0=B.split('_E')[0], RE=/_E20$/.test(B)?0.20:REF.edge;
      if(ALT0) CHAR.SIT_TASK.ALT={F:[B0[0]==='F'?B0:'F'],M:[B0[0]==='M'?B0:'M']};   /* 量那一種身材自己的片段（F2、M2 的參考骨架 bl_npc_nf10、bl_npc_nm11）*/
      if(REFS0) CHAR.SIT_TASK.REFS=REFS0.filter(r=>Math.abs(r.edge-RE)<1e-6);
      const h=CHAR.build({model:key,height:MAN[key].height}); scene.add(h); for(let i=0;i<3;i++){ CHAR.animate(h,DT,{pose:'sit',speed:0}); }
      const f=CHAR.sitTaskFit(h,kind,{h:0.75,edge:RE,depth:0.3}); if(!f){ bad.push(B+kind+' 沒有 fit'); scene.remove(h); CHAR.release(h); continue; } CHAR.setSitTask(h,f);
      for(let i=0;i<20;i++) CHAR.animate(h,DT,{pose:'sit',speed:0}); let zc=-1, far=9, tip=-1;
      for(let i=0;i<150;i++){ CHAR.animate(h,DT,{pose:'sit',speed:0}); scene.updateMatrixWorld(true);
        for(const s of ['left','right']){ const S0=L(h,s+'UpperArm'), E0=L(h,s+'LowerArm'), W0=L(h,s+'Hand'); for(const [a,b] of [[S0,E0],[E0,W0]]) for(let k=0;k<=20;k++){ const p=a.clone().lerp(b,k/20); if(p.y<0.765&&p.z>zc) zc=p.z; } }
        for(const s of REST[kind]) far=Math.min(far,L(h,s+'Hand').z+0.03);
        if(kind==='type') for(const s of ['left','right']) tip=Math.max(tip,L(h,s+'MiddleDistal').z+0.02); }
      const w=CHAR.SIT_TASK.WIN[kind][B], nearMin=Math.min(RE,zc)-0.011; MEAS.push(B+' '+kind+' 近≥'+nearMin.toFixed(3)+' 遠≤'+far.toFixed(3)+(f.body!==B?'（fit 用了 '+f.body+'）':''));
      if(f.body!==B) bad.push(B+' '+kind+' fit 用了 '+f.body);
      if(w[0]<nearMin) bad.push(B+' '+kind+' 近 '+w[0]+' < 量到的 '+nearMin.toFixed(3));
      if(w[1]>far+0.001) bad.push(B+' '+kind+' 遠 '+w[1]+' > 量到的 '+far.toFixed(3));
      if(kind==='type'&&w[0]+0.216<tip) bad.push(B+' 打字的指尖 '+tip.toFixed(3)+' 過了鉸鏈 '+(w[0]+0.216).toFixed(3));
      scene.remove(h); CHAR.release(h); }
    if(ALT0) CHAR.SIT_TASK.ALT=ALT0; if(REFS0) CHAR.SIT_TASK.REFS=REFS0; if(process.env.SIT_WIN_LOG) console.log(MEAS.join('\n'));
    check('H C.SIT_TASK.WIN 不比量到的鬆：女生不比參考的桌子更貼、放在桌上的手腕往前 3 cm 在桌上、打字的指尖不過筆電的鉸鏈',!bad.length,bad.join('；')); }
  SEATACT.actAt=actAt0;
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error('ERR',e); process.exit(2); });
