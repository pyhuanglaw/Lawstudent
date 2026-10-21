// 阿凱的國界第二晚（ev_kai_tape2）開場鏡頭貼近膠帶，讀得到「法律系免簽」（UX-KAI-TAPE-CAM-1021；BB_218、LAWWW2 6437fcf6 對照圖：一般鏡頭看不清楚地上的字）——不需要瀏覽器。
// 膠帶的位置照 assets/models/env/second_ai/dorm_y1_items.glb 的節點表（Y1_KAI_TAPE_TEXT_m 的範圍）；字頭朝牆（+x，dorm_y1_items.py 的 n），字從 −z 往 +z 寫。
// 檢查：1. 事件：background freeze（不模糊）、portraitLater（開場不擺立繪，阿凱說話才出來）、有 shot；
//       2. Y1FILL.tapeShot：中間那段換成寫字的版本（TEXT 顯示、MID 藏）；鏡頭對著字的中心，在房間那一側（x 比字小）、從上往下看；
//       3. 手機橫向（844×390）、直向（390×844）：五個字整段都在畫面裡，字是正的（字頭在畫面上方、從左往右讀），字的高度至少 12 px；
//       4. EVENTS.run 用 shot 的鏡頭（GM.cine 拿到 pos／look），ADV.begin 沒有立繪；演完膠帶照 done 是寫字的版本。
// 修改前：沒有 shot／tapeShot，第 1、2、3、4 項 FAIL。用法：node tests/kai_tape_cam_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){}, createElement:()=>({getContext:()=>null,style:{}}), createElementNS:()=>({style:{}}) }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
load('lib/three.bundle.js');
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/story3d.js','src/classes3d.js','src/holff3d.js','src/data/y1fill_events.js','src/y1fill3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info&&!ok?'　'+info:'')); if(!ok) fails++; };
const ev=STORY_EVENTS.find(e=>e.id==='ev_kai_tape2');
check('1. ev_kai_tape2：background freeze、portraitLater、有 shot',!!ev&&ev.background==='freeze'&&ev.portraitLater===true&&typeof ev.shot==='function',ev?JSON.stringify({bg:ev.background,pl:ev.portraitLater,shot:typeof ev.shot}):'沒有事件');
/* 房間裡的膠帶（照 GLB 的範圍做一塊薄板）*/
const scene=new THREE.Scene(), root=new THREE.Group(); root.name='dorm_y1_items'; scene.add(root);
const mk=(name,vis)=>{ const g=new THREE.Group(); g.name=name; g.visible=vis; const m=new THREE.Mesh(new THREE.BoxGeometry(1.5435-1.4934,0.0007,0.5340+0.1082)); m.position.set((1.5435+1.4934)/2,0.0022,(0.5340-0.1082)/2); g.add(m); root.add(g); return g; };
const MID=mk('Y1_KAI_TAPE_MID',true), TEXT=mk('Y1_KAI_TAPE_TEXT',false);
const C=new THREE.Vector3((1.5435+1.4934)/2,0.0022,(0.5340-0.1082)/2);
const shotFor=(w,h)=>{ const cam=new THREE.PerspectiveCamera(46,w/h,0.1,200); MID.visible=true; TEXT.visible=false; const s=typeof Y1FILL!=='undefined'&&Y1FILL.tapeShot?Y1FILL.tapeShot({E:{scene,camera:cam}}):null; return {s,cam}; };
{ const {s}=shotFor(844,390);
  check('2. tapeShot：寫字的那段顯示、沒字的藏起來；鏡頭對著字的中心、在房間那一側（x 比字小）從上往下看',!!s&&TEXT.visible&&!MID.visible&&s.look.distanceTo(C)<0.01&&s.pos.x<C.x-0.3&&s.pos.y>0.5&&s.pos.y<2.6&&Math.abs(s.pos.z-C.z)<0.01,s?JSON.stringify({pos:s.pos,look:s.look}):'null'); }
for(const [w,h,nm] of [[844,390,'橫向'],[390,844,'直向']]){ const {s,cam}=shotFor(w,h); if(!s){ check('3. '+nm+'：有鏡頭',false); continue; }
  cam.position.copy(s.pos); cam.lookAt(s.look); cam.updateMatrixWorld(true); cam.updateProjectionMatrix();
  const P=v=>v.clone().project(cam), a=P(new THREE.Vector3(C.x,0.0022,-0.1082)), b=P(new THREE.Vector3(C.x,0.0022,0.5340)), head=P(new THREE.Vector3(C.x+0.024,0.0022,C.z)), foot=P(new THREE.Vector3(C.x-0.024,0.0022,C.z));
  const inside=[a,b].every(p=>Math.abs(p.x)<0.98&&Math.abs(p.y)<0.98), px=(head.y-foot.y)/2*h;
  check('3. '+nm+'（'+w+'×'+h+'）：五個字整段在畫面裡、字頭在上、從左往右讀，字高 '+px.toFixed(1)+' px（至少 12）',inside&&head.y>foot.y&&b.x>a.x&&px>=12,JSON.stringify({a:[a.x,a.y],b:[b.x,b.y],px})); }
/* 5. 讀檔後第一次進 203：膠帶的模型還沒載到就不演（BB 10-21 21:4x C_L／C_P FAIL），載到了才演；載不到待滿 12 秒照原本的鏡頭演 */
{ const had=typeof ASSETS!=='undefined', A0=had?ASSETS:undefined; global.ASSETS={manifest:{'bldg.dorm_y1_items':{url:'x.glb'}}};
  const empty=new THREE.Scene(); global.GAME={E:{scene:empty}}; const G0={flags:{},zone:'dorm',stage:'law',day:1,hour:20};
  const tk=s=>{ for(let i=0;i<Math.ceil(s);i++) Y1FILL.tick({G:G0,E:{zone:{},player:{busy:true}},D:{active:false}},1); };   /* player busy＝不跑事件、只算時間 */
  const a=Y1FILL.tapeReady&&Y1FILL.tapeReady(); tk(5); const b=Y1FILL.tapeReady&&Y1FILL.tapeReady(); global.GAME={E:{scene}}; const c=Y1FILL.tapeReady&&Y1FILL.tapeReady();
  global.GAME={E:{scene:empty}}; tk(9); const d=Y1FILL.tapeReady&&Y1FILL.tapeReady(); G0.zone='dorm_hall'; tk(1); G0.zone='dorm'; const e=Y1FILL.tapeReady&&Y1FILL.tapeReady();
  const pre=ev&&ev.prereq&&ev.prereq.custom&&String(ev.prereq.custom);
  check('5. 膠帶模型還沒載到：不演（剛進門、待 5 秒都是 false）；載到了＝可以演；一直載不到待滿 12 秒＝照原本的鏡頭演；出去再進來重新算；事件條件有 tapeReady',typeof Y1FILL.tapeReady==='function'&&a===false&&b===false&&c===true&&d===true&&e===false&&/tapeReady/.test(pre||''),JSON.stringify({a,b,c,d,e}));
  delete global.GAME; if(had) global.ASSETS=A0; else delete global.ASSETS; }
/* EVENTS.run：用 shot 的鏡頭、開場沒有立繪 */
{ let G={v:3,day:STORY.dayOfKey('2025-10-30'),hour:19,zone:'dorm',stage:'law',weekday:4,weather:'clear',energy:70,money:5000,flags:{KAI_TAPE:true},choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0},contacts:{}};
  const cines=[], begins=[], said=[]; const cam=new THREE.PerspectiveCamera(46,844/390,0.1,200);
  global.ADV={active:false,preload(){},begin(o){ this.active=true; begins.push(o); },end(){ this.active=false; },log(){},speaker(){},cg(){ return true; },setBg(){},hide(){},show(){},narrate(){}}; global.CHAR={setExpr(){}};
  const E={q:{level:'medium'},scene,camera:cam,player:{busy:false,obj:{position:new THREE.Vector3(0,0,2),rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
  const GM={get G(){ return G; },E,D:{active:false},npc:{},sceneBegin(){},sceneEnd(){},face(){},cine:(k,A,B,o)=>{ cines.push({k,o}); },caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
    titleCard:async()=>{},enter:async()=>{},advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},say:async(w,t)=>{ said.push(t); },choose:async()=>0};
  SOCIAL.bind(G); EVENTS.bind(GM); MID.visible=true; TEXT.visible=false;
  (async()=>{ if(ev) await EVENTS.run(ev);
    const c=cines[0]; check('4. EVENTS.run：開場鏡頭是 shot 的（close＋pos／look 對著膠帶），ADV.begin 沒有擺立繪；旁白那句照演',!!ev&&!!c&&c.k==='close'&&c.o&&c.o.look&&c.o.look.distanceTo(C)<0.01&&begins.length&&!begins[0].right&&!begins[0].left&&said.some(t=>/法律系免簽/.test(t)),JSON.stringify({cines:cines.map(x=>x.k),begin:begins[0]&&{right:begins[0].right,bg:begins[0].background}}));
    check('4. 演完記 done（zones3d.js 照 done 顯示寫字的那段，不會跳回「國界」）',!!(G.events.done&&G.events.done.ev_kai_tape2));
    console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0); })().catch(e=>{ console.log('FAIL 例外',e&&e.stack); process.exit(1); }); }
