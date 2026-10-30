// 宿舍睡覺要有畫面（DORM-SLEEP-1030）——不需要瀏覽器。
// 使用者 10-30 04:2x（對 LAWWW2）：「我覺得宿舍玩加上去睡覺要真的有畫面 不然從頭到尾都是站在門口說睡完覺 很沒有真實感」。
// 資料：DORM_ROOM 玩家那一組（L2）的 sleep_scene（LAWWW2-B 98f8a41f7：approach、steps、bed_entry、lie、cam）。
// 檢查（用遊戲真正的 STORY.interact → bedScene → sleepNow／CLS.skipTo，GM 是假的）：
//   ① 選「睡覺」以後先走到梯子前（approach）
//   ② 沿四階踏點一階一階往上（每一階的 (x,y,z) 都到過、高度不往下、姿勢 climb）、再到上床點
//   ③ 躺在床上：位置＝腳的位置、高度＝床墊頂、朝向＝頭的方向＋π（root 的 −z 指向頭）、姿勢 lie
//   ④ 鏡頭：爬梯子時用梯子側面的鏡頭（S.climbCam），躺下以後用 sleep_scene.cam（eye、look）
//   ⑤ 熄燈：躺下以後房間變暗（沒有 z.lightsOff＝曝光 E.toneK 壓到 0.18；有 z.lightsOff＝叫 lightsOff(1)、不動曝光）
//   ⑥ 時間照原本跳（睡到明天早上＝第二天、醒來的時間照選項）；醒來先躺在床上、再一階一階下來，站在梯子前；busy、劇情鎖、熄燈、床的狀態都放開；
//      進房間的劇情（STORY.onEnter）在站好以後才叫一次；小睡：黑幕裡放回梯子前、時間照跳；睡著被叫醒以外的保底（S.tick）也會放回梯子前
//   ⑦ 沒有 sleep_scene 的房間（或不在宿舍房間）照舊：不走去梯子、不爬、醒來在門口 (0, 2.4)
//   ⑧ 讀檔中途（爬到一半）：LOADLOCKS 放開床的狀態、熄燈、GM.onBlack；人在床上時存檔存梯子前
//   ⑨ 床欄透空（LAWWW2-B #120，engine3d.js 的 E.cam.seeThru）：躺下（S.lieDown）才設——中心＝躺著的身體中段、床墊上 0.28 m、r 0.2、aspect 0.5；
//      爬梯子時沒有；醒來躺在床上有；爬下來、保底（S.tick）、小睡醒來、換區域（S.populate）、讀檔（一定換區域＝S.populate）都清掉。修改前（ca39039fe）⑨ 八項 FAIL 6 項（從來不設；「爬梯子沒有」「爬下來沒有」本來就過）
// 修改前（postrel-1030）：沒有 STORY.sleepSceneOf（第 1 項就失敗）。用法：node tests/dorm_sleep_scene_unit.js
const vm=require('vm'), fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.THREE={Vector3:function(x,y,z){this.x=x;this.y=y;this.z=z;}};
global.P3={CAST:new Proxy({},{get:(t,k)=>({name:String(k)})})};
const mkObj=()=>({position:{x:0,y:0,z:0,set(x,y,z){this.x=x;this.y=y;this.z=z;}},rotation:{y:0},userData:{}});
global.CHAR={build:()=>mkObj(),setExpr(){}}; global.location={search:''}; global.document={getElementById:()=>null,addEventListener(){}};
global.SOCIAL={displayName:id=>(CHARACTERS[id]&&CHARACTERS[id].name)||id,stage:()=>'ACQ',noticed(){},reveal:()=>'ACQUAINTANCE',has:()=>true,remember(){},meet(){}};
let GM=null;
global.EVENTS={npcOf:id=>GM&&GM.npc[id]||null,onEnter(){},tick(){}};
for(const f of ['src/data/characters.js','src/data/places.js','src/data/calendar.js','src/data/courses.js','src/data/dorm_room_layout.js','src/story3d.js','src/classes3d.js']) vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (CHARACTERS|STORY|PLACES|SOCIAL_GRAPH|UNFAMILIAR_POOL|PORTRAITS|CALENDAR|COURSES|CLS|DORM_ROOM)\s*=/mg,'global.$1='),{filename:f});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
check('有 STORY.sleepSceneOf（宿舍睡覺的畫面）',typeof STORY.sleepSceneOf==='function');
if(fails){ console.log('FAILED '+fails); process.exit(1); }
const U=DORM_ROOM.units.find(u=>u.id===(DORM_ROOM.player_unit||'L2')); const SC0=JSON.parse(JSON.stringify(U.sleep_scene||null));
check('DORM_ROOM 玩家那一組（L2）有 sleep_scene（approach、四階 steps、lie、cam）',!!SC0&&SC0.steps.length===4&&!!SC0.lie&&!!SC0.cam,JSON.stringify(SC0&&SC0.approach));
const F0={afternoonDone:true,classDone:true,metAn:true,zheInvite:true,zheNoodleDone:true,introDone:true};
const near=(a,b,e)=>Math.abs(a-b)<(e||1e-6);
const angN=a=>Math.atan2(Math.sin(a),Math.cos(a));
/* 假的 GM：記錄每一次 GM.sleep 時人物的位置、姿勢、鏡頭（＝每一個畫面）*/
function mkGM(o){ o=o||{}; const G={day:o.day||6,weekday:(3+(o.day||6)-1)%7,hour:o.hour!=null?o.hour:22,flags:Object.assign({},F0,o.flags||{}),social:{},zone:o.zone||'dorm',goal:'',stage:'law',money:20000,stats:{steps:0,classes:0,study:0},visited:{},daily:{},events:{done:{}},weather:'clear'};
  const P={obj:mkObj(),pose:'idle',idlePose:'idle',busy:false,lv:0,radius:0.32}; P.obj.position.set(-0.5,0,2.0);
  const E={zone:{id:G.zone},player:P,npcs:[],interactables:[],toneK:1,hour:G.hour,cam:{mode:'follow'},q:{level:'high'},levels:null,indoor:true,
    placeAt(ent,x,z){ ent.obj.position.x=x; ent.obj.position.z=z; ent.obj.position.y=0; },prePose(){},applyTime(h){ this.exposure=this.toneK; this.applied=(this.applied|0)+1; },endCinematic(){ this.cam.mode='follow'; },setWeather(){},addNPC(n){ this.npcs.push(n); return n; },canStand:()=>true};
  if(o.lightsOff){ E.zone.lightsOff=k=>{ E.zone.lk=k; (E.zone.lks=E.zone.lks||[]).push(k); }; }
  const gm={G,E,npc:{},extras:[],D:{active:false,busyDepth:0},loadGen:0,turbo:false,frames:[],cams:[],fades:[],enters:[],walks:[],log:[],depth:0,onEnterN:0};
  const frame=tag=>gm.frames.push({tag,x:P.obj.position.x,y:P.obj.position.y,z:P.obj.position.z,yaw:P.obj.rotation.y,pose:P.pose,cam:E.cam.mode,dark:STORY._dark||0,toneK:E.toneK,busy:P.busy,bed:!!STORY._bed,eyes:!!P.obj.userData.eyesShut,see:E.cam.seeThru?Object.assign({},E.cam.seeThru):null});
  gm.sleep=async ms=>{ if(gm.hang) await new Promise(()=>{}); frame('sleep'); if(gm.onSleep) await gm.onSleep(); };
  gm.fade=async on=>{ gm.fades.push(on); frame(on?'fade1':'fade0'); if(gm.hang) await new Promise(()=>{}); if(on&&gm.onBlack){ const cb=gm.onBlack; gm.onBlack=null; cb(); } };   /* 和 game3d.js 的 fade 一樣：全黑以後做一次 onBlack */
  gm.walkTo=async(ent,x,z)=>{ gm.walks.push([x,z]); ent.obj.position.x=x; ent.obj.position.z=z; ent.obj.position.y=0; frame('walk'); return true; };
  gm.cine=(k,A,B,opt)=>{ E.cam.mode='cinematic'; gm.cams.push({pos:opt&&opt.pos&&[opt.pos.x,opt.pos.y,opt.pos.z],look:opt&&opt.look&&[opt.look.x,opt.look.y,opt.look.z],snap:!!(opt&&opt.snap)}); };
  gm.sceneBegin=()=>{ gm.depth++; P.busy=true; }; gm.sceneEnd=()=>{ gm.depth=Math.max(0,gm.depth-1); if(!gm.depth){ P.busy=false; E.endCinematic(); } };
  gm.choose=async opts=>{ gm.lastOpts=opts; return o.pick?o.pick(opts):0; };
  gm.titleCard=async(a,b)=>{ gm.log.push('title:'+a+' '+b); frame('title'); };
  gm.enter=async(zone,spawn,opts)=>{ opts=opts||{}; gm.enters.push({zone,spawn,opts}); G.zone=zone; E.zone={id:zone}; if(o.lightsOff) E.zone.lightsOff=k=>{ E.zone.lk=k; (E.zone.lks=E.zone.lks||[]).push(k); };
    P.obj.position.set(spawn?spawn.x:0,0,spawn?spawn.z:0); P.obj.rotation.y=spawn?spawn.yaw||0:0; P.pose='idle'; P.idlePose='idle'; P.seat=null;
    try{ STORY.populate(zone,gm); }catch(e){ /* 假的 GM 生不了 NPC：populate 第一行（清床的狀態）已經跑過 */ }
    if(opts.onLoaded) opts.onLoaded(E.zone); frame('entered'); if(!opts.noAutosave) gm.autosave('enter'); if(!opts.deferStory) gm.onEnterN++; };   /* 和 game3d.js 的 enter 一樣：換完區域存一次 */
  gm.advance=h=>{ G.hour+=h; E.hour=G.hour; }; gm.setGoal=()=>{}; gm.autosave=tag=>{ gm.saves=(gm.saves|0)+1; if(tag==='enter') gm.enterSave={bed:STORY.bedSavePos(gm),pose:P.pose}; }; gm.money=()=>{}; gm.toast=t=>gm.log.push('toast:'+t); gm.caption=(a,t)=>gm.log.push('cap:'+t);
  gm.memo=()=>{}; gm.updateHUD=()=>{}; gm.energy=()=>{}; gm.standUp=ent=>{ ent.pose='idle'; ent.seat=null; }; gm.say=async()=>{}; gm.isEntering=()=>false;
  gm.spawnNPC=(id,spec,x,z)=>{ const n=E.addNPC({obj:mkObj(),id}); gm.npc[id]=n; return n; }; gm.spawnCharacter=()=>null; gm.removeNPC=id=>{ delete gm.npc[id]; }; gm.knownIds=()=>[];
  GM=gm; global.GAME=gm; return gm; }
const realOnEnter=STORY.onEnter; STORY.onEnter=async function(z,gm){ gm.onEnterN++; gm.onEnterAt=gm.frames.length; };   /* 只數叫了幾次、什麼時候叫（真的 onEnter 要整個遊戲）*/
const SC=SC0, A=SC.approach, ST=SC.steps, L=SC.lie;
const inBed=f=>f.pose==='lie'&&near(f.x,L.feet[0])&&near(f.z,L.feet[2])&&near(f.y,L.mattress_top_y);
const SEE={x:(L.feet[0]+L.head[0])/2,y:L.mattress_top_y+0.28,z:(L.feet[2]+L.head[2])/2,r:0.2,aspect:0.5};   /* ⑨ LAWWW2-B #120 建議：身體中段、床墊上 0.25～0.3 m、r 0.2、aspect 0.5 */
const seeOK=s=>!!s&&near(s.x,SEE.x,1e-6)&&near(s.y,SEE.y,1e-6)&&near(s.z,SEE.z,1e-6)&&near(s.r,SEE.r,1e-9)&&near(s.aspect,SEE.aspect,1e-9);
(async()=>{
  /* ===== ①～⑥：晚上 22:00 在 203（第 6 天＝9/22 週一）選「睡到明天早上」===== */
  { const gm=mkGM({day:6,hour:22}); const d0=gm.G.day; const want=STORY.bedOptions(gm.G)[0];
    await STORY.interact({sleep:true},gm); const Fr=gm.frames;
    check('① 選「睡覺」以後先走到梯子前（sleep_scene.approach）',gm.walks.length>=1&&near(gm.walks[0][0],A[0])&&near(gm.walks[0][1],A[1]),JSON.stringify(gm.walks));
    const lie0=Fr.findIndex(f=>inBed(f)); const up=Fr.slice(0,lie0<0?Fr.length:lie0).filter(f=>f.pose==='climb'&&f.bed);   /* 上床那一段（第一次躺下以前）*/
    const hit=ST.map(s=>up.findIndex(f=>near(f.x,s[0])&&near(f.y,s[1])&&near(f.z,s[2])));
    let mono=true; for(let i=1;i<up.length;i++) if(up[i].y<up[i-1].y-1e-9) mono=false;
    check('② 沿四階踏點一階一階往上：每一階的 (x,y,z) 都到過、順序對、高度不往下、姿勢 climb',hit.every(i=>i>=0)&&hit.every((v,i)=>i===0||v>hit[i-1])&&mono&&up.length>=8,'踏點在第 '+hit.join('、')+' 格（共 '+up.length+' 格）');
    const be=SC.bed_entry; check('② 爬完再到上床點（bed_entry）',up.some(f=>near(f.x,be[0])&&near(f.y,be[1])&&near(f.z,be[2])),JSON.stringify(be));
    const ly=Fr.filter(f=>inBed(f)&&f.dark===0&&f.cam==='cinematic'&&!f.eyes);
    const lyF=Fr.find(f=>inBed(f));
    const hx=-Math.sin(lyF?lyF.yaw:0), hz=-Math.cos(lyF?lyF.yaw:0), dx=L.head[0]-L.feet[0], dz=L.head[2]-L.feet[2], dl=Math.hypot(dx,dz);
    check('③ 躺在床上：位置＝腳 '+JSON.stringify([L.feet[0],L.feet[2]])+'、高度＝床墊頂 '+L.mattress_top_y+'、姿勢 lie、root 的 −z 指向頭（頭朝 −z）',ly.length>=1&&near(angN(lyF.yaw),angN(L.head_dir_yaw+Math.PI),1e-3)&&near(hx,dx/dl,1e-3)&&near(hz,dz/dl,1e-3),lyF&&('yaw '+lyF.yaw.toFixed(3)));
    const cc=STORY.climbCam(SC), ci=gm.cams.findIndex(c=>c.pos&&near(c.pos[0],cc.pos[0])&&near(c.pos[2],cc.pos[2])), bi=gm.cams.findIndex(c=>c.pos&&near(c.pos[0],SC.cam.eye[0])&&near(c.pos[1],SC.cam.eye[1])&&near(c.pos[2],SC.cam.eye[2])&&near(c.look[0],SC.cam.look[0])&&near(c.look[2],SC.cam.look[2]));
    check('④ 鏡頭：先用梯子側面的鏡頭（climbCam '+cc.pos.map(v=>v.toFixed(2)).join(',')+'，在房間的走道裡），躺下以後換成 sleep_scene.cam（eye '+SC.cam.eye.join(',')+'）',ci>=0&&bi>ci&&Math.abs(cc.pos[0])<=1.6&&Math.abs(cc.pos[2])<=3.15,'climb '+ci+' bed '+bi);
    const dk=Fr.filter(f=>inBed(f)&&f.dark>0), dmax=Fr.reduce((m,f)=>Math.max(m,f.dark),0), lowT=Fr.reduce((m,f)=>Math.min(m,f.toneK),9);
    const dIdx=Fr.findIndex(f=>f.dark>=1), sIdx=Fr.findIndex((f,i)=>i>dIdx&&f.tag==='fade1');
    check('⑤ 熄燈：躺下以後房間慢慢變暗到 1（曝光 E.toneK 1 → 0.18），然後才淡出睡覺',dk.length>=3&&dmax===1&&near(lowT,0.18,1e-6)&&dIdx>=0&&sIdx>dIdx&&inBed(Fr[sIdx]),'dark 格數 '+dk.length+' 最低曝光 '+lowT);
    check('⑤ 熄燈以後閉眼（eyesShut）',Fr.some(f=>inBed(f)&&f.dark===1&&f.eyes));
    const wi=gm.enters.findIndex(e=>e.zone==='dorm'), we=gm.enters[wi];
    check('⑥ 時間照原本跳：第 '+(d0+1)+' 天、醒來時間＝選項的 '+want.wake,gm.G.day===d0+1&&near(gm.G.hour,want.wake,1e-6),'day '+gm.G.day+' hour '+gm.G.hour);
    const afterEnter=Fr.slice(Fr.findIndex(f=>f.tag==='entered'));
    check('⑥ 醒來先躺在床上（進房間、淡入以前就躺好，睡覺鏡頭，燈是開的）',we&&we.opts.deferStory&&afterEnter.length&&inBed(afterEnter[0])&&afterEnter[0].cam==='cinematic'&&afterEnter[0].dark===0,we&&JSON.stringify(we.spawn));
    const down=afterEnter.filter(f=>f.pose==='climbdown'); const dHit=ST.slice().reverse().map(s=>down.findIndex(f=>near(f.x,s[0])&&near(f.y,s[1])&&near(f.z,s[2])));
    let mono2=true; for(let i=1;i<down.length;i++) if(down[i].y>down[i-1].y+1e-9) mono2=false;
    check('⑥ 再一階一階下來（踏點反過來都到過、高度不往上、姿勢 climbdown）',dHit.every(i=>i>=0)&&dHit.every((v,i)=>i===0||v>dHit[i-1])&&mono2,'踏點在第 '+dHit.join('、')+' 格');
    const P=gm.E.player, s0=ST[0];
    check('⑥ 最後站在梯子前（approach、地板高度、站姿、面向房間）',near(P.obj.position.x,A[0])&&near(P.obj.position.z,A[1])&&P.obj.position.y===0&&P.pose==='idle'&&near(P.obj.rotation.y,Math.atan2(A[0]-s0[0],A[1]-s0[2]),1e-6),JSON.stringify(P.obj.position)+' '+P.pose);
    check('⑥ 不卡住：busy、場景深度、劇情鎖（S._sleeping）、床的狀態、熄燈、GM.onBlack 都放開，曝光回到 1，跟隨鏡頭',!P.busy&&gm.depth===0&&!STORY._sleeping&&!STORY._bed&&!STORY._bedBusy&&(STORY._dark||0)===0&&gm.E.toneK===1&&!gm.onBlack&&gm.E.cam.mode==='follow',`busy ${P.busy} depth ${gm.depth} sleeping ${STORY._sleeping} bed ${!!STORY._bed} toneK ${gm.E.toneK} cam ${gm.E.cam.mode}`);
    check('⑥ 進房間的劇情（STORY.onEnter）叫一次，而且在人站好以後',gm.onEnterN===1&&gm.onEnterAt>=Fr.length-1-2&&!inBed(Fr[gm.onEnterAt-1]||{}),'onEnter '+gm.onEnterN+' 次，第 '+gm.onEnterAt+'／'+Fr.length+' 格');
    const es=gm.enterSave; check('⑥ 醒來時進房間那一次存檔（GM.enter 內，人躺在床上）＝存梯子前，不是床上',!!es&&es.pose==='lie'&&!!es.bed&&near(es.bed.x,A[0],0.01)&&near(es.bed.z,A[1],0.01)&&es.bed.y===0,JSON.stringify(es));
    /* ⑨ 床欄透空 */
    const upF=Fr.slice(0,lie0<0?Fr.length:lie0).filter(f=>f.pose==='climb');
    check('⑨ 爬梯子的時候沒有床欄透空（E.cam.seeThru 是空的）',upF.length>0&&upF.every(f=>!f.see),upF.filter(f=>f.see).length+' 格有');
    const lyAll=Fr.slice(0,Fr.findIndex(f=>f.tag==='entered')).filter(f=>inBed(f)&&f.cam==='cinematic');
    check('⑨ 躺下以後（睡覺鏡頭）：床欄透空，中心＝身體中段 ('+SEE.x.toFixed(3)+', '+SEE.y.toFixed(2)+', '+SEE.z.toFixed(3)+')、床墊上 0.28 m、r 0.2、aspect 0.5（橫的）',lyAll.length>=3&&lyAll.every(f=>seeOK(f.see)),JSON.stringify(lyAll[0]&&lyAll[0].see));
    check('⑨ 醒來躺在床上（進房間、淡入以前）：床欄照樣透空',afterEnter.length&&inBed(afterEnter[0])&&seeOK(afterEnter[0].see),JSON.stringify(afterEnter[0]&&afterEnter[0].see));
    const dnF=afterEnter.filter(f=>f.pose==='climbdown');
    check('⑨ 爬下來（不躺了）：透空收掉；站好以後回到跟隨鏡頭也是空的',dnF.length>0&&dnF.every(f=>!f.see)&&gm.E.cam.seeThru==null,dnF.filter(f=>f.see).length+' 格有；最後 '+JSON.stringify(gm.E.cam.seeThru)); }
  /* ===== ⑤ 有熄燈光照貼圖（z.lightsOff）：用它、不動曝光 ===== */
  { const gm=mkGM({day:6,hour:22,lightsOff:true}); const z0=gm.E.zone; await STORY._bedFx.goToBed(gm,STORY.sleepSceneOf(gm));
    check('⑤ 區域有 z.lightsOff（LAWWW2 的熄燈光照貼圖）：叫 lightsOff 一路到 1、曝光不動',z0.lk===1&&z0.lks.length>=3&&gm.E.toneK===1,'lks '+(z0.lks||[]).map(v=>v.toFixed(2)).join(','));
    check('⑧ 人在床上時存檔＝存梯子前（STORY.bedSavePos）',(()=>{ const p=STORY.bedSavePos(gm); return p&&near(p.x,A[0],0.01)&&near(p.z,A[1],0.01)&&p.y===0&&p.lv===0; })(),JSON.stringify(STORY.bedSavePos(gm)));
    const see0=gm.E.cam.seeThru&&Object.assign({},gm.E.cam.seeThru); gm.E.player.busy=false; STORY.tick(gm,0.5);
    check('⑥ 保底：人還躺在床上、沒有在演、玩家空下來（S.tick）＝放回梯子前、開燈',!STORY._bed&&gm.E.player.pose==='idle'&&near(gm.E.player.obj.position.x,A[0])&&z0.lk===0,gm.E.player.pose+' lk '+z0.lk);
    check('⑨ 躺著時有透空；保底放回梯子前（S.tick → bedClear）以後清掉',seeOK(see0)&&gm.E.cam.seeThru==null,JSON.stringify(see0)+' → '+JSON.stringify(gm.E.cam.seeThru)); }
  /* ===== ⑥ 小睡（白天 09:30 小睡 1 小時）：爬上去、黑幕裡放回梯子前、時間照跳 ===== */
  { const gm=mkGM({day:6,hour:9.5,pick:opts=>opts.findIndex(q=>/小睡 1 小時/.test(q.t))}); await STORY.interact({sleep:true},gm); const Fr=gm.frames;
    const b1=Fr.findIndex((f,i)=>f.tag==='fade1'&&f.dark===1);
    check('⑥ 小睡：先爬上床躺好、熄燈',Fr.some(f=>f.pose==='climb')&&b1>=0&&inBed(Fr[b1]),'b1 '+b1);
    const P=gm.E.player;
    check('⑥ 小睡：時間照跳（10:30）、醒來站在梯子前（黑幕裡放回去）、沒有卡住',near(gm.G.hour,10.5,1e-6)&&near(P.obj.position.x,A[0])&&near(P.obj.position.z,A[1])&&P.pose==='idle'&&!P.busy&&gm.depth===0&&!STORY._bed&&gm.E.toneK===1&&!gm.onBlack,`hour ${gm.G.hour} ${JSON.stringify(P.obj.position)} ${P.pose}`);
    check('⑥ 小睡醒來：淡入的那一格已經站在梯子前（不是在床上）',(()=>{ const f=Fr.find((q,i)=>i>b1&&q.tag==='fade0'); return f&&f.pose==='idle'&&near(f.x,A[0]); })());
    check('⑨ 小睡：躺著的時候透空、黑幕裡放回梯子前以後清掉（淡入那一格已經沒有）',seeOK(Fr[b1].see)&&(()=>{ const f=Fr.find((q,i)=>i>b1&&q.tag==='fade0'); return f&&!f.see; })()&&gm.E.cam.seeThru==null); }
  /* ===== ⑦ 沒有 sleep_scene 的房間：照舊 ===== */
  { delete U.sleep_scene; const gm=mkGM({day:6,hour:22}); await STORY.interact({sleep:true},gm);
    const we=gm.enters.find(e=>e.zone==='dorm');
    check('⑦ 沒有 sleep_scene：不走去梯子、不爬、不躺、不熄燈；醒來在門口 (0, 2.4)、進房間的劇情照原本由 GM.enter 叫',!gm.walks.length&&!gm.frames.some(f=>f.pose==='climb'||f.pose==='lie'||f.dark>0)&&we&&we.spawn.x===0&&we.spawn.z===2.4&&!we.opts.deferStory&&gm.G.day===7,JSON.stringify(we&&we.spawn));
    U.sleep_scene=JSON.parse(JSON.stringify(SC0)); }
  { const gm=mkGM({day:6,hour:22,zone:'us_apartment'}); check('⑦ 不在宿舍房間（美國公寓）：STORY.sleepSceneOf＝null',STORY.sleepSceneOf(gm)===null); }
  /* ===== ⑧ 讀檔中途：爬到第二階的時候讀檔 ===== */
  { const gm=mkGM({day:6,hour:22}); let n=0; gm.onSleep=async()=>{ const P=gm.E.player; if(P.pose==='climb'&&near(P.obj.position.y,ST[1][1])&&!gm.hang){ n++; gm.hang=true; gm.loadGen++; } };
    const pr=STORY.interact({sleep:true},gm); await new Promise(r=>setTimeout(r,30));
    const mid={bed:!!STORY._bed,busy:!!STORY._bedBusy};
    for(const f of Object.values(globalThis.LOADLOCKS||{})) f();
    check('⑧ 爬到一半讀檔：LOADLOCKS 放開床的狀態、爬梯子的鎖（S._bed、S._bedBusy、S._dark）',n===1&&mid.bed&&mid.busy&&!STORY._bed&&!STORY._bedBusy&&(STORY._dark||0)===0,JSON.stringify(mid));
    gm.hang=false; gm.loadGen++; await gm.enter('dorm',{x:0,z:2.4,yaw:Math.PI},{fromLoad:true});   /* 讀檔（applySave）一定換區域 */
    const P=gm.E.player; check('⑧ 讀進來以後：站著（不是 climb／lie）、不是 busy、沒有床的狀態',P.pose==='idle'&&!STORY._bed&&!STORY._bedBusy,P.pose);
    void pr; }
  { const gm=mkGM({day:6,hour:22}); await STORY._bedFx.goToBed(gm,STORY.sleepSceneOf(gm)); const s1=gm.E.cam.seeThru&&Object.assign({},gm.E.cam.seeThru); await gm.enter('campus',{x:20,z:54,yaw:0},{});
    check('⑨ 躺著的時候換到別的區域（S.populate）：透空清掉',seeOK(s1)&&gm.E.cam.seeThru==null,JSON.stringify(s1)+' → '+JSON.stringify(gm.E.cam.seeThru)); }
  { const gm=mkGM({day:6,hour:22}); await STORY._bedFx.goToBed(gm,STORY.sleepSceneOf(gm)); const k0=gm.E.toneK; gm.onBlack=STORY.bedOnBlack; const s2=gm.E.cam.seeThru&&Object.assign({},gm.E.cam.seeThru); for(const f of Object.values(globalThis.LOADLOCKS||{})) f();
    await gm.enter('dorm',{x:0,z:2.4,yaw:Math.PI},{fromLoad:true});
    check('⑨ 熄燈以後讀檔：讀檔換區域（S.populate）時透空清掉（LOADLOCKS 只放開旗標）',seeOK(s2)&&gm.E.cam.seeThru==null,JSON.stringify(s2)+' → '+JSON.stringify(gm.E.cam.seeThru));
    check('⑧ 熄燈以後讀檔：換區域時（S.populate 第一行）曝光還原（0.18 → 1）',near(k0,0.18,1e-6)&&gm.E.toneK===1,k0+' → '+gm.E.toneK);
    let ok=true; try{ gm.fade(true); }catch(e){ ok=false; } await new Promise(r=>setTimeout(r,5));
    check('⑧ 讀檔前留下的 GM.onBlack（萬一沒被 loadRelease 清掉）在新的一局觸發也不出錯、不動玩家',ok&&gm.E.player.pose==='idle'&&near(gm.E.player.obj.position.z,2.4)&&gm.E.toneK===1);
    const g3=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8');
    check('⑧ game3d.js：loadRelease 清掉 GM.onBlack；fade(true) 全黑以後才叫 GM.onBlack',/function loadRelease\(\)\{[^\n]*GM\.onBlack=null;/.test(g3)&&/function fade\(on\)\{[^\n]*sleep\(on\?480:500\)\.then\(\(\)=>\{ if\(on&&GM\.onBlack\)/.test(g3)); }
  STORY.onEnter=realOnEnter;
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0); })().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); console.log('FAILED '+(fails+1)); process.exit(1); });
