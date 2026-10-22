// 邀約與訊息（D54 ⑥；src/invites3d.js、src/data/invites.js）——不需要瀏覽器。照使用者 2026-10-11 的七點：
//   認識的人才有聯絡方式（開場阿哲、阿凱）；可以約的人；答不答應看在不在學校、關係、天氣、開沒開、既有約定、作息；「改天」一定附具體時間；
//   約好的時間人在那個地方（作息被覆寫，人物線索也一樣）；過了時間沒赴約＝不扣分、留一筆小記憶；一起走過去、到了就見面（時間過去、記憶、熟一點點）；
//   對方約你（答應／改天／不了）、臨時改約（好／那就下次／我自己去）；事件的後果 contact／invite／inviteChange；存檔來回。
// 用法：node tests/invites_unit.js
const vm=require('vm'), fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.THREE={Vector3:function(x,y,z){this.x=x;this.y=y;this.z=z;}};
global.P3={CAST:new Proxy({},{get:(t,k)=>({name:String(k)})})};
const mkObj=()=>({position:{x:0,y:0,z:0,set(x,y,z){this.x=x;this.y=y;this.z=z;}},rotation:{y:0},userData:{}});
global.CHAR={build:()=>mkObj(),setExpr(){}}; global.location={search:''}; global.document={getElementById:()=>null,addEventListener(){}};
const STAGE={heroine_02:'FAMILIAR',zhe:'CLOSE_FRIEND',kai:'FRIEND',yu:'FRIEND',heroine_01:'FRIEND',classmate_bohan:'ACQUAINTANCE',heroine_04:'STRANGER'};
const MEM=[], ADJ=[];
global.SOCIAL={STAGES:['STRANGER','ACQUAINTANCE','FAMILIAR','FRIEND','CLOSE_FRIEND','POSSIBLE_ROMANTIC_INTEREST','ROMANTIC_TENSION','RELATIONSHIP'],stage:id=>STAGE[id]||'STRANGER',
  displayName:id=>(CHARACTERS[id]&&(CHARACTERS[id].nickname||CHARACTERS[id].name))||id,remember:(id,tag,note)=>MEM.push([id,tag,note]),memories:id=>MEM.filter(m=>m[0]===id).map(m=>({tag:m[1],note:m[2]})),adjust:(id,d)=>ADJ.push([id,d]),noticed(){},reveal:()=>'ACQUAINTANCE',has:()=>true};
let GM=null; const ALIAS={heroine_01:'an',heroine_05:'sis',prof_zhou:'prof'}; const HAB=[];
global.EVENTS={npcOf:id=>GM.npc[id]||GM.npc[ALIAS[id]]||null,onEnter(){},tick(){},habit:k=>HAB.push(k)};
for(const f of ['src/data/characters.js','src/data/places.js','src/data/calendar.js','src/data/courses.js','src/story3d.js','src/classes3d.js','src/data/invites.js','src/invites3d.js'])
  vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (CHARACTERS|STORY|PLACES|SOCIAL_GRAPH|UNFAMILIAR_POOL|PORTRAITS|CALENDAR|COURSES|CLS|INVITE_DATA|INV)\s*=/mg,'global.$1='),{filename:f});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
function newGM(zone,day,hour,weather){ const wd=(3+day-1)%7; const E={npcs:[],interactables:[],q:{level:'high'},zone:{seats:[],spawn:{x:0,z:0}},levels:null,player:{obj:mkObj(),busy:false,lv:0},addNPC(n){this.npcs.push(n);return n;},canStand:()=>true};
  const G={day,weekday:wd,hour,flags:{afternoonDone:true,classDone:true,metAn:true},social:{},zone,goal:'',weather:weather||'sunny'};
  const said=[]; const gm={E,G,npc:{},extras:[],D:{active:false},said,
    sceneBegin(){},sceneEnd(){},say:async(w,t)=>{ said.push(t); },fade:async()=>{},advance:dh=>{ G.hour+=dh; },caption(){},sleep:async()=>{},autosave(){},toast(){},
    spawnCharacter:(id,x,z,o)=>{ const n=E.addNPC(Object.assign({obj:mkObj(),id,charId:id},o||{})); n.obj.position.set(x,0,z); gm.npc[id]=n; return n; },spawnNPC(){},spawnExtra(){},spawnRider(){},removeNPC(){},knownIds:()=>Object.keys(CHARACTERS)};
  return gm; }
const fri=(term,week)=>{ for(let d=1;d<2000;d++){ const t=CALENDAR.termOf(d); if(t&&t.id===term&&t.week===week&&(3+d-1)%7===5&&!CALENDAR.holiday(d)) return d; } return null; };
const D2=fri('Y1S2',5);   // 大一下第 5 週的週五（芷若週五 11–15 Café 打工、19–22 打工）

// ---------- 聯絡方式、可以約的人 ----------
{ GM=newGM('campus',D2,10); const G=GM.G;
  check('開場就有聯絡方式的：阿哲、阿凱（現有設定）；芷若沒有',INV.hasContact(G,'zhe')&&INV.hasContact(G,'kai')&&!INV.hasContact(G,'heroine_02'));
  INV.addContact(G,'heroine_02'); check('拿到聯絡方式（事件的後果 contact）：芷若有了、訊息有一則',INV.hasContact(G,'heroine_02')&&G.msgs.length===1&&G.contacts.heroine_02===D2);
  check('可以約的人：芷若（主角）、阿哲（熟同學）可以；教授、不熟的同學、還是陌生人的子晴不行',INV.canInvite(G,'heroine_02')&&INV.canInvite(G,'zhe')&&!INV.canInvite(G,'prof_zhou')&&!INV.canInvite(G,'pool_1')&&!INV.canInvite(G,'heroine_04')); }
// ---------- 答不答應 ----------
{ GM=newGM('campus',D2,10); const G=GM.G;
  const r1=INV.decide(G,'heroine_02','cafe',D2,12);
  check('芷若週五 12:00 在 Café 打工（作息）＝改天，附具體時間（15:00 下班之後）',r1.res==='resched'&&r1.why==='busy'&&r1.act==='barista'&&r1.alt&&r1.alt.day===D2&&r1.alt.h>=15&&r1.alt.h<19,JSON.stringify(r1));
  check('旁白照實說（沒有替人物編台詞）',/打工/.test(INV.reply(G,'heroine_02','cafe',r1))&&/15:00|15:30/.test(INV.reply(G,'heroine_02','cafe',r1)),INV.reply(G,'heroine_02','cafe',r1));
  const r2=INV.decide(G,'heroine_02','wenzhou',D2,16);
  check('關係還不到朋友（芷若「熟悉」）：散步這種沒有理由的不答應；喝咖啡可以',r2.res==='decline'&&r2.why==='rel'&&INV.decide(G,'heroine_02','cafe',D2,16).res==='accept',JSON.stringify(r2));
  { const saved=MEM.splice(0); SOCIAL.remember('heroine_02','WALKED_TOGETHER','（測試）');
    const r2b=INV.decide(G,'heroine_02','wenzhou',D2,16); check('一起散步過（WALKED_TOGETHER）：再約散步不會因為「還不太熟」拒絕（關係這一關過了，接著照作息）',!(r2b.res==='decline'&&r2b.why==='rel'),JSON.stringify(r2b));
    /* 新遊戲的阿哲：舊版 rel 12 → 「認識」（2026-10-13 批次 3：第三天約吃飯說「還不太熟」，可是第一天就一起吃過麵）*/
    MEM.splice(0); const keep=STAGE.zhe; STAGE.zhe='ACQUAINTANCE';
    const a=INV.decide(G,'zhe','noodle',D2,19); SOCIAL.remember('zhe','SHARED_MEAL','阿鳳麵店'); const b=INV.decide(G,'zhe','noodle',D2,19);
    check('阿哲「認識」、沒一起吃過飯：吃飯「還不太熟」；第一天一起吃過麵（SHARED_MEAL，story3d.js 記下的）：答應',a.res==='decline'&&a.why==='rel'&&b.res==='accept',JSON.stringify([a,b]));
    STAGE.zhe=keep; MEM.splice(0); MEM.push(...saved); }
  const r3=INV.decide(G,'zhe','noodle',D2,19); check('阿哲週五 19:00 去麵店：答應',r3.res==='accept',JSON.stringify(r3));
  const iv=INV.accept(G,'zhe','noodle',D2,19);
  check('約好：G.invites 一筆（accepted、給「跳過時間」停的 accepted:true）、訊息一則',iv&&iv.state==='accepted'&&iv.accepted===true&&G.invites.length===1&&/約好了/.test(G.msgs[G.msgs.length-1].text));
  const r4=INV.decide(G,'zhe','cafe',D2,19.25); check('阿哲 19:15 已經跟你約了麵店＝改天（你那個時間有約）',r4.res==='resched'&&(r4.why==='mine'||r4.why==='booked')&&r4.alt&&r4.alt.h>=19.75,JSON.stringify(r4));
  const r5=INV.decide(G,'yu','cafe',D2,19); check('你 19:00 已經約了阿哲，再約小語同一個時間＝你那個時間有約',r5.res==='resched'&&r5.why==='mine',JSON.stringify(r5));
  G.weather='rain'; const r6=INV.decide(G,'yu','wenzhou',D2,16); G.weather='sunny';
  check('今天下雨：散步改成 Café（同一個時間）',r6.res==='resched'&&r6.why==='weather'&&r6.alt&&r6.alt.place==='cafe'&&r6.alt.h===16,JSON.stringify(r6));
  const r7=INV.decide(G,'yu','library',D2,23); check('總圖 23:00 沒開＝改天、附一個開著的時間',r7.res==='resched'&&r7.why==='closed'&&r7.alt&&(r7.alt.day>D2||r7.alt.h<22),JSON.stringify(r7)); }
// ---------- 約好的時間人在那裡 ----------
{ GM=newGM('campus',D2,18.9); const G=GM.G; INV.accept(G,'heroine_01','cafe',D2,19);
  const w=STORY.whereIs(GM,'heroine_01'); check('約好的時間（前 15 分鐘起）：作息被覆寫，人物線索寫「在 Café」',w&&w.zone==='cafe',JSON.stringify(w));
  G.zone='cafe'; GM.E.zone.seats=Array.from({length:12},(_,i)=>({x:i,z:0,yaw:0,row:0,col:i})); STORY.populate('cafe',GM);
  check('走進 Café：她在（坐著等你），可以見面',!!GM.npc.an||!!GM.npc.heroine_01,Object.keys(GM.npc).join(','));
  const mv=INV.meetable(G,'heroine_01'); check('meetable：在約好的地方、約好的時間',!!mv);
  const h0=G.hour; MEM.length=0; ADJ.length=0; HAB.length=0; INV.meet(GM,mv,null).then(()=>{
    check('見面：時間過去（1 小時）、記憶「咖啡廳的下午」、熟一點點（fam +2，不是戀愛）、習慣記憶 place:cafe:with',Math.abs(G.hour-h0-1)<1e-6&&MEM.some(m=>m[1]==='CAFE_AFTERNOON')&&ADJ.some(a=>a[1].fam===2&&!a[1].rom)&&HAB.includes('place:cafe:with:heroine_01')&&mv.state==='done',`${h0}→${G.hour} ${JSON.stringify(MEM)}`); }); }
// ---------- 沒赴約 ----------
{ GM=newGM('campus',D2,18); const G=GM.G; INV.accept(G,'zhe','noodle',D2,19); MEM.length=0;
  G.hour=19.4; INV.tick(GM); check('19:24 還沒到（30 分鐘內）：還算約著',G.invites[0].state==='accepted');   /* AA_137 第 7 節：等 30 分鐘（原本 45）*/
  G.hour=19.55; INV.tick(GM); check('過了 30 分鐘＝沒赴約（她自己走掉）：不扣分、留一筆「放過鴿子」、訊息',G.invites[0].state==='missed'&&MEM.some(m=>m[1]==='MISSED_DINNER')&&/沒有赴約/.test(G.msgs[G.msgs.length-1].text)&&!ADJ.some(a=>a[1].fam<0||a[1].trust<0)); }
// ---------- 提醒、「你在哪？」（AA_137 第 7 節）----------
{ GM=newGM('campus',D2,18); const G=GM.G; INV.accept(G,'zhe','noodle',D2,19); const posted=[], toasts=[]; global.PHONE={post:(GG,m)=>posted.push(m)}; GM.toast=t=>toasts.push(t); G.contacts=G.contacts||{}; G.contacts.zhe=1;
  G.hour=18.4; INV.tick(GM); check('18:24（30 分鐘前以前）：還不提醒',!toasts.length);
  G.hour=18.6; INV.tick(GM); check('18:36（約定前 30 分鐘內）：提醒一次',toasts.length===1&&/提醒/.test(toasts[0]),toasts.join('|')); INV.tick(GM); check('不重複提醒',toasts.filter(t=>/提醒/.test(t)).length===1);
  G.hour=19.3; G.zone='campus'; INV.tick(GM); check('19:18（過了 15 分鐘、你不在麵店）：他傳「你在哪？」',posted.length===1&&posted[0].text==='你在哪？'&&posted[0].from==='zhe'&&posted[0].th==='p:zhe',JSON.stringify(posted));
  delete global.PHONE; }
// ---------- 現在一起走過去 ----------
{ GM=newGM('campus',D2,16); const G=GM.G; const iv=INV.accept(G,'yu','wenzhou',D2,16,{now:true});
  const e=INV.entryFor(G,'yu'); check('一起走過去：作息被覆寫成「和你在一起」（在玩家這一區）',iv.state==='going'&&e&&e.act==='follow'&&e.zone==='campus');
  G.zone='wenzhou'; const h0=G.hour; INV.arrive(GM,'wenzhou').then(ok=>{ check('走到溫州街：見面（散步 45 分鐘、記憶「一起走過校園」）',ok&&iv.state==='done'&&Math.abs(G.hour-h0-0.75)<1e-6); }); }
// ---------- 一起走到有座位的地點：兩個人都到了＝直接開始，一起坐下（使用者 10-21 23:2x「只要兩個都在場 就不用一起走或說話才能開始」；
//            取代 10-16 的「她先坐下，你坐到旁邊或跟她說話才開始」——那時的問題「一進總圖大廳就念完了，根本還沒坐下」：現在先一起坐下再演）----------
(async()=>{ const gm=GM=newGM('campus',D2,16); const G=gm.G; const iv=INV.accept(G,'yu','library',D2,16,{now:true}); const n=gm.spawnCharacter('yu',1,1,{beh:'follow'});
  const E=gm.E; E.zone.seats=[{x:5,z:5,yaw:0,lv:1},{x:6,z:5,yaw:0,lv:1},{x:20,z:20,yaw:0,lv:1},{x:-3,z:2,yaw:0,label:'長椅'}];
  const sat=[]; gm.sitAt=(ent,st)=>{ sat.push([ent.charId||'P',st.x,st.z]); ent.seat=st; }; gm.standUp=ent=>{ ent.seat=null; ent.pose=ent.idlePose='idle'; }; gm.seatApproach=st=>[st.x,st.z+0.6];
  G.zone=iv.zone; G.hour=16.9; const h0=G.hour, said0=gm.said.length; const ok=await INV.arrive(gm,iv.zone);
  check('到了總圖：直接開始，兩個人一起坐下——她坐桌邊、旁邊還有空位的位子（不選長椅、不選旁邊沒位子的），你坐她旁邊；演見面（念書、時間過去）',ok&&iv.state==='done'&&sat.length===2&&sat[0][0]==='yu'&&sat[0][1]===5&&sat[1][0]==='P'&&sat[1][1]===6&&n.pose==='read'&&gm.said.length>said0&&G.hour>h0,JSON.stringify({st:iv.state,sat,said:gm.said.slice(said0),pose:n.pose}));
  check('約定時間改成到的時間（路上花的時間不算遲到）；演完你站起來',Math.abs(iv.h-16.9)<1e-6&&!(E.player&&E.player.seat),String(iv.h));
  const again=await INV.seatMeet(gm,{x:6,z:5,lv:1}); check('已經開始過：之後坐到那裡不會再演一次',!again&&iv.state==='done');
})().then(()=>{});
// ---------- 對方約你、臨時改約 ----------
{ GM=newGM('campus',D2,12); const G=GM.G;
  const of=INV.offer(G,'zhe','noodle',D2,19,'（測試）阿哲約你去吃麵');
  check('對方約你：offered、手機有一則訊息（等你回）',of.state==='offered'&&G.msgs.some(m=>m.iv===of.id));
  check('答應：accepted',INV.answer(G,of.id,'yes').res==='accept'&&of.state==='accepted');
  const of2=INV.offer(G,'kai','noodle',D2,21); check('不了：declined（不扣分）',INV.answer(G,of2.id,'no').res==='no'&&of2.state==='declined');
  const ch=INV.change(G,of.id,{day:D2+1,h:19},'（測試）阿哲問能不能改明天');
  check('臨時改約：changed、問你新的時間',ch&&ch.state==='changed'&&ch.to.day===D2+1);
  check('回「好」：改到明天 19:00、又是 accepted',INV.answerChange(G,of.id,'ok').res==='moved'&&of.state==='accepted'&&of.day===D2+1&&of.h===19);
  const ch2=INV.change(G,of.id,null); check('對方取消、你回「沒關係，我自己去」：取消（你照樣可以自己去）',ch2&&INV.answerChange(G,of.id,'alone').res==='alone'&&of.state==='cancelled'); }
// ---------- 事件的後果 ----------
{ GM=newGM('campus',D2,12); const G=GM.G; G.events={done:{},last:{}};
  vm.runInThisContext(fs.readFileSync(path.join(ROOT,'src/events3d.js'),'utf8').replace(/^const EVENTS\s*=/m,'global.EV2='),{filename:'events3d.js'}); EV2.bind(GM);
  EV2.applyConsequences({contact:'heroine_03',invite:{who:'zhe',place:'cafe',day:1,h:15.5,text:'（測試）'}});
  const of=(G.invites||[]).find(v=>v.state==='offered'); check('事件後果 contact、invite：語彤的聯絡方式、阿哲明天 15:30 約你',INV.hasContact(G,'heroine_03')&&of&&of.who==='zhe'&&of.day===D2+1&&of.h===15.5);
  INV.answer(G,of.id,'yes'); EV2.applyConsequences({inviteChange:{who:'zhe',to:null,text:'（測試）'}}); check('事件後果 inviteChange：阿哲的那一筆變成 changed',of.state==='changed'); }
// ---------- 存檔 ----------
{ GM=newGM('campus',D2,12); const G=GM.G; INV.accept(G,'zhe','noodle',D2,19); INV.addContact(G,'heroine_02');
  const G2=JSON.parse(JSON.stringify(G)); check('存檔來回：邀約、訊息、聯絡方式都在',G2.invites.length===1&&G2.invites[0].state==='accepted'&&G2.msgs.length===2&&G2.contacts.heroine_02===D2);
  const old={day:5,hour:10,weekday:0,flags:{}}; INV.rec(old); check('舊存檔沒有這三個欄位：第一次用到時補上空的',Array.isArray(old.invites)&&Array.isArray(old.msgs)&&typeof old.contacts==='object'); }
setTimeout(()=>{ console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0); },50);
