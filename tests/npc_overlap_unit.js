// 兩個人站在同一點（BUG-04，使用者 10-15 第 25 項「禮拜三晚上去法服：溫學姊在圖書館外只是站著，人物變得很怪（兩個臉的感覺）」）。
// 原因（v9.7 ebebce9f4 重現）：週三 18:48～21 萬才館大廳，舊的學姊（legacy GM.spawnNPC('sis') 在 (-3,3.6)）和照作息 act:'club' 的第一個社員
// （CLUB_SPOTS[0] 也是 (-3,3.6)：子晴、伯涵）生在同一點、朝向差不多 → 兩個人疊成一個，看起來兩張臉。那一段 legacy 後來拿掉了（讀書會停用），
// 但 spawnAt 的 club／linger 照舊不看那一點有沒有人：別的程式（legacy、劇情、店員）先在那裡放了人，就會再疊一次。修正：story3d.js 的 standBusy／standFree。
// 不需要瀏覽器：照 schedule_roommove_unit.js 的替身，載入真正的 calendar、courses、characters、places、activities、heroine_circle、各區配置、story3d、hcircle3d、classes3d，
// 跑真正的 STORY.populate。用法：node tests/npc_overlap_unit.js [ROOT]
//   ① 萬才館週三 19:05（大一上第 6 週）：先在 CLUB_SPOTS[0] 放一個站著的人（＝v9.7 的 legacy 學姊）→ 子晴（吉他社）不能生在他身上。修改前 FAIL。
//   ② 同上沒有先放人：子晴照舊站 CLUB_SPOTS[0]（沒人的時候位置不變）。
//   ③ 在日程寫的位置站一下（linger）：從資料找第一個真的站在 at 的人（④），那一點先有人站著 → 往旁邊挪、不疊。修改前 FAIL。
//   ④ 前提：沒有先放人時，他照舊站在作息寫的那一點（位置不變）。
//   ⑤ 抽樣掃描（每 9 天、7:00～23:30 每半小時、有站著的作息的區域）：站著、看得見的兩個人距離 < 0.35 m 的組數＝0（兩個都在走路線的不算：剛生出來同一個路點，下一步就分開）。
const vm=require('vm'), fs=require('fs'), path=require('path');
const ROOT=path.resolve(process.argv[2]||path.join(__dirname,'..'));
global.window=global; global.THREE={Vector3:function(x,y,z){this.x=x;this.y=y;this.z=z;}};
global.P3={CAST:new Proxy({},{get:(t,k)=>({name:String(k)})})};
const mkObj=()=>({visible:true,position:{x:0,y:0,z:0,set(x,y,z){this.x=x;this.y=y;this.z=z;}},rotation:{y:0},userData:{}});
global.CHAR={build:()=>mkObj(),setExpr(){}}; global.location={search:''};
global.SOCIAL={displayName:id=>(CHARACTERS[id]&&CHARACTERS[id].name)||id,stage:()=>'ACQ',noticed(){},reveal:()=>'ACQUAINTANCE',has:()=>true};
let GM=null; const ALIAS={heroine_01:'an',heroine_05:'sis',prof_zhou:'prof'};
global.EVENTS={npcOf:id=>GM.npc[id]||GM.npc[ALIAS[id]]||null,onEnter(){},tick(){}};
const LAY=fs.readdirSync(path.join(ROOT,'src/data')).filter(f=>/_layouts?\.js$/.test(f)).map(f=>'src/data/'+f);
const FILES=LAY.concat(['src/data/calendar.js','src/data/courses.js','src/data/characters.js','src/data/places.js','src/data/activities.js','src/data/heroine_circle.js','src/story3d.js','src/hcircle3d.js','src/classes3d.js']).filter(f=>fs.existsSync(path.join(ROOT,f)));
for(const f of FILES){ try{ vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const ([A-Z0-9_]+_LAYOUTS?|CALENDAR|COURSES|CHARACTERS|STORY|PLACES|SOCIAL_GRAPH|UNFAMILIAR_POOL|PORTRAITS|ACTIVITIES|HCIRCLE|HEROINE_CIRCLE|HC3|CLS)\s*=/mg,'global.$1='),{filename:f}); }catch(e){ console.log('（載入失敗，略過）',f,String(e).slice(0,120)); } }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const F0={afternoonDone:true,classDone:true,metAn:true,met_an:true,introDone:true,campusIntro:true,lawclub:true,zheInvite:true,zheNoodleDone:true};
function newGM(zone,day,hour){
  let seats=Array.from({length:40},(_,i)=>({x:20+i,z:30,yaw:0}));   // 座位放遠處：坐著的人不算疊
  if(zone==='classroom'&&typeof CLASSROOM_LAYOUT!=='undefined'){ const L=CLASSROOM_LAYOUT; seats=[]; for(let r=0;r<=L.rows;r++) for(let c=0;c<=L.cols;c++) seats.push({x:L.colX0+c*L.colDX,z:L.rowZ0+r*L.rowDepth+L.seat.dz,yaw:0,row:r,col:c}); }   // 201：替身照 row/col 找位子
  const E={npcs:[],q:{level:'high'},zone:{id:zone,seats,spawn:{x:0,z:8.5,lv:0},spots:{}},levels:null,navOf:null,nav:null,indoor:zone!=='campus'&&zone!=='gongguan'&&zone!=='wenzhou',camera:null,interactables:[],
    player:{obj:{position:{x:0,y:0,z:8},rotation:{y:0}},busy:false,lv:0},addNPC(n){this.npcs.push(n);return n;},moveTo:()=>false,canStand:()=>true};
  const wd=CALENDAR.dateOf(day); const G={day,weekday:(wd&&(wd.wd!=null?wd.wd:wd.weekday))||0,hour,flags:Object.assign({},F0),social:{},zone,goal:'',events:{done:{}}};
  const gm={E,G,npc:{},extras:[],D:{active:false},hourRate:1/150};
  gm.spawnNPC=(id,spec,x,z,opts)=>{opts=opts||{};const o=mkObj();o.position.set(x,0,z);o.rotation.y=opts.yaw||0;const n=E.addNPC({obj:o,id,charId:opts.charId||id,name:(spec&&spec.name)||id,beh:opts.beh||'idle',seat:opts.seat,pose:opts.pose,waypoints:opts.waypoints,lv:opts.lv|0});gm.npc[id]=n;return n;};
  gm.spawnCharacter=(id,x,z,opts)=>{const c=CHARACTERS[id];if(!c)return null;if(gm.npc[id])return gm.npc[id];const n=gm.spawnNPC(id,{name:c.name},x,z,Object.assign({charId:id},opts)); n.charId=id; return n;};
  gm.removeNPC=id=>{ const n=gm.npc[id]; if(n){ E.npcs=E.npcs.filter(m=>m!==n); delete gm.npc[id]; } };
  gm.spawnExtra=()=>{}; gm.spawnRider=()=>{};
  gm.sitAt=(n,st)=>{ n.seat=st; n.pose='sit'; n.frozen=true; n.obj.position.set(st.x,0,st.z); };
  gm.standUp=n=>{ n.seat=null; n.pose='idle'; n.frozen=false; };
  gm.seatApproach=st=>[st.x,st.z+0.6]; gm.face=()=>{}; gm.sceneBegin=()=>{}; gm.sceneEnd=()=>{};
  gm.knownIds=()=>Object.keys(CHARACTERS).filter(id=>CHARACTERS[id].social_layer!=='B');
  return gm; }
const dayOf=iso=>{ for(let d=0;d<2000;d++){ const t=CALENDAR.dateOf(d); if(!t) continue; const s=t.key||t.iso||t.str||(t.y+'-'+String(t.m).padStart(2,'0')+'-'+String(t.d).padStart(2,'0')); if(String(s).startsWith(iso)) return d; } return null; };
// 先放一個站著的人（＝v9.7 在那一點的 legacy 學姊），再跑 STORY.populate
function runWith(zone,day,hour,blocker){ GM=newGM(zone,day,hour); let b=null; if(blocker){ const o=mkObj(); o.position.set(blocker[0],0,blocker[1]); b=GM.E.addNPC({obj:o,id:'blocker',name:'先站在那裡的人',beh:'idle',pose:'idle',frozen:true,lv:0}); } STORY.populate(zone,GM); return {gm:GM,b}; }
const dist=(a,b)=>Math.hypot(a.obj.position.x-b.obj.position.x,a.obj.position.z-b.obj.position.z);
const pos=n=>n?'('+n.obj.position.x.toFixed(2)+','+n.obj.position.z.toFixed(2)+')':'—';

// ①② 萬才館週三 19:05：子晴（吉他社，act:'club'）站 CLUB_SPOTS[0] (-3,3.6)
{ const day=dayOf('2025-10-08'); const free=runWith('wancai',day,19.05,null); const zq=free.gm.npc.heroine_04;
  check('② 前提：萬才館 2025-10-08（週三）19:05 子晴照作息在大廳（吉他社）',!!zq,zq?pos(zq):'沒有生出來');
  if(zq) check('② 沒有人先站在那裡：子晴照舊站 CLUB_SPOTS[0] (-3,3.6)',Math.hypot(zq.obj.position.x+3,zq.obj.position.z-3.6)<0.01,pos(zq));
  const r=runWith('wancai',day,19.05,[-3,3.6]); const z2=r.gm.npc.heroine_04;
  check('① (-3,3.6) 先有人站著（v9.7 的 legacy 學姊）：子晴不能生在他身上（≥ 0.45 m）',!!z2&&dist(z2,r.b)>=0.45,z2?pos(z2)+' 距離 '+dist(z2,r.b).toFixed(2)+' m':'沒有生出來'); }
// ③④ 在日程寫的位置站一下（act:'linger'）：從資料裡找第一個真的照作息站在 at 的人（例：學姊「坐在總圖門口的台階看手機」(83,3)），那一點先有人站著 → 往旁邊挪、不疊
{ let hit=null; const L=[]; for(const id in CHARACTERS) if(!ALIAS[id]&&!['zhe','yu','kai'].includes(id)) for(const e of (CHARACTERS[id].daily_schedule||[])) if(e.act==='linger'&&e.at&&e.zone&&!(e.at[3]|0)) L.push({id,e});   /* 舊的 legacy 人物（以安、學姊、阿哲…）不走 spawnAt；hcircle3d 帶去站的（_hcWith）也不算 */
  for(const {id,e} of L){ for(let d=0;d<1500&&!hit;d++){ const t=CALENDAR.dateOf(d); if(!t) continue; const wd=t.wd!=null?t.wd:t.weekday; if(!(e.days||[]).includes(wd)) continue; const hr=typeof e.from==='number'&&typeof e.to==='number'&&e.to<=24?(e.from+e.to)/2:null; if(hr==null) continue;
      GM=newGM(e.zone,d,hr); try{ STORY.populate(e.zone,GM); }catch(err){ continue; } const n=GM.npc[id]||GM.npc[ALIAS[id]]; if(n&&!n.seat&&!n._hcWith&&n.charId===id&&Math.hypot(n.obj.position.x-e.at[0],n.obj.position.z-e.at[1])<0.01) hit={id,e,d,hr}; } if(hit) break; }
  check('④ 前提：找到照作息站在 at 的人（linger）',!!hit,hit?hit.id+' '+hit.e.zone+' ('+hit.e.at[0]+','+hit.e.at[1]+') '+JSON.stringify(CALENDAR.dateOf(hit.d)).slice(0,50)+' '+hit.hr.toFixed(2)+'「'+(hit.e.label||'')+'」':'找不到');
  if(hit){ const r=runWith(hit.e.zone,hit.d,hit.hr,[hit.e.at[0],hit.e.at[1]]); const n=r.gm.npc[hit.id]||r.gm.npc[ALIAS[hit.id]];
    check('③ 那一點先有人站著：往旁邊挪、不疊（≥ 0.45 m）',!!n&&dist(n,r.b)>=0.45,n?pos(n)+' 距離 '+dist(n,r.b).toFixed(2)+' m':'沒有生出來');
    if(n) check('③ 挪的距離不超過 1.5 m（還在作息寫的那一帶）',Math.hypot(n.obj.position.x-hit.e.at[0],n.obj.position.z-hit.e.at[1])<=1.5,pos(n)); } }
// ⑤ 抽樣掃描
{ const zs=new Set(['wancai','classroom','cafe','campus','lawlib','library','gongguan','wenzhou','noodle']);
  for(const c of Object.values(CHARACTERS)) for(const e of (c.daily_schedule||[])) if(e.zone&&/^(linger|club|ta|help|barista|wait)$/.test(e.act||'')) zs.add(e.zone);
  const W=n=>n.beh==='wander'||!!(n.waypoints&&n.waypoints.length); const found=new Map(); let runs=0, errs=0; const t0=Date.now();
  for(const zone of zs) for(let day=0;day<1500;day+=9){ if(!CALENDAR.dateOf(day)) continue;
    for(let h=7;h<24;h+=0.5){ try{ GM=newGM(zone,day,h+0.05); STORY.populate(zone,GM); runs++; }catch(e){ errs++; continue; }
      const L=GM.E.npcs.filter(n=>!n.seat&&n.obj&&!n.hidden&&n.obj.visible!==false);
      for(let i=0;i<L.length;i++) for(let j=i+1;j<L.length;j++){ if((L[i].lv|0)!==(L[j].lv|0)) continue; const a=L[i].obj.position, b=L[j].obj.position; if(Math.hypot(a.x-b.x,a.z-b.z)<0.35&&(Math.abs(a.x)+Math.abs(a.z))>0.01&&!(W(L[i])&&W(L[j]))){ const k=zone+' '+[L[i].id||'路人',L[j].id||'路人'].sort().join('+')+' @('+a.x.toFixed(1)+','+a.z.toFixed(1)+')'; if(!found.has(k)) found.set(k,day+' '+(h+0.05).toFixed(2)); } } } }
  check('⑤ 抽樣掃描（'+zs.size+' 區、'+runs+' 次 populate）：站著的兩個人疊在同一點＝0 組',found.size===0&&runs>0,[...found].slice(0,6).map(([k,v])=>k+' 第一次 day '+v).join('；')+(errs?'（populate 例外 '+errs+' 次）':'')+'（'+((Date.now()-t0)/1000).toFixed(0)+' 秒）'); }
console.log(fails?('FAIL '+fails):'ALL PASS'); process.exit(fails?1:0);
