// 交接包 v1（大一上）第 8 批：A14 以安新 3（轉述）、A15 G1 考完試走出教室——不需要瀏覽器。
// 檢查（修改前都會失敗：事件、群組訊息、考完的事件都不存在）：
//   A14：第 7 週週二晚上麵店團群組：Alison 兩則（「報告！……」）、阿哲「……她說得對耶」、以安隔一陣子才回「三頁是因為字很大。」；只給那天以前就在群組裡的玩家；
//     沒有群組（或之後才加入）的玩家：第 7 週起找沛珊說話，她當面說同樣的內容；只一次；旗標 AN_DORM_RULES（group／peishan），不寫成玩家在場的記憶。
//   A15 G1：民總期中考考完接著演（一般的課、別科的考試、翹課都不會）；只有認識的人在場（柏翰沒見過＝第一句變成旁白；芯慈和柏翰那段兩個都認識才有；Alison、明軒、以安各自）；
//     第一個選項要第一天讀過案例；三個選項的反應；SHARED_CLASS 只記認識的人；只一次。
// （2026-10-28 AA_519 1-3（企劃線 d75cd0228，NPC-STORY2-1028）：C19 大一下期末那三句的第二、三句再換——送小菜第三處「（每個人的湯碗裡，都多了兩顆餛飩。）」、阿姨「一年了。……今天的湯，算我的。」）
// 用法：node tests/v1_batch8_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|OUT|COURSES|CLS|ACTIVITIES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/story3d.js','src/classes3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){},cg(){},setBg(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], caps=[], G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption:(a,t)=>{ caps.push(t); },sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}};
  SOCIAL.bind(G); EVENTS.bind(GM); said=[]; opts=[]; picks=[]; caps=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; E.player.obj.position.x=0; E.player.obj.position.z=0; };
const keepOn=(day,hour,zone,flags)=>{ const ev=G.events, soc=G.social, msgs=G.msgs, phone=G.phone, contacts=G.contacts, ch=G.choices, act=G.activities; fresh(day,hour,zone,Object.assign({},G.flags,flags||{})); G.events=ev; G.social=soc; SOCIAL.bind(G); if(msgs) G.msgs=msgs; if(phone) G.phone=phone; if(contacts) G.contacts=contacts; G.choices=ch; if(act) G.activities=act; };
const lines=()=>said.map(s=>s.t);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const npc=(id,x,z)=>{ const n={id,charId:id,name:id,obj:{position:{x,y:0,z}},seat:null,lv:0}; GM.npc[id]=n; E.npcs.push(n); return n; };
const tickEv=()=>{ const r=EVENTS.tick(0.1); return r; };
const termDay=(w,wd)=>STORY.termDay('Y1S1',w,wd);
const run=(h0,h1,st)=>{ st=st||0.05; for(let h=h0;h<=h1+1e-9;h+=st){ G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(G); } };
const meet=id=>SOCIAL.remember(id,'FIRST_MET','');
(async()=>{
  const W7TUE=termDay(7,2);
  /* ---------- A14 以安新 3 宿舍的規則 ---------- */
  { fresh(W7TUE,8,'campus'); PHONE.join(G,'noodle_team','麵店團'); G.phone.groups.noodle_team.day=10; run(8,23);
    const gm=G.msgs.filter(m=>m.tag==='an_rules_grp'||m.tag==='an_rules_an');
    check('A14：第 7 週週二晚上麵店團群組：Alison 兩則、阿哲一則、以安隔一陣子才回（交接包_v1 第 3 節原文）',JSON.stringify(gm.map(m=>[m.from,m.text]))===JSON.stringify([['yu','報告！聽說以安為了樓層會議，把整本宿舍規則讀完了，還寫了三頁意見。'],['yu','大家笑她，她說：「規則是我們要住的，總要有人讀完。」'],['zhe','……她說得對耶'],['heroine_01','三頁是因為字很大。']])&&gm.every(m=>m.th==='g:noodle_team')&&gm[3].h-gm[2].h>0.5,JSON.stringify(gm.map(m=>[m.from,m.h])));
    check('A14：旗標 AN_DORM_RULES=group；不寫成玩家在場的記憶（以安沒有新的記憶）',G.flags.AN_DORM_RULES==='group'&&SOCIAL.memories('heroine_01').length===0);
    fresh(W7TUE,8,'campus'); meet('classmate_peishan'); run(8,23); check('A14：沒有麵店團群組：群組沒有訊息',!G.msgs||!G.msgs.some(m=>m.tag==='an_rules_grp'));
    const e=ev('ev_an_dorm_rules_peishan'); fresh(W7TUE,13,'campus'); meet('classmate_peishan'); const a=EVENTS.check(e);
    fresh(W7TUE-7,13,'campus'); meet('classmate_peishan'); const b=EVENTS.check(e);
    fresh(W7TUE,13,'campus'); const c=EVENTS.check(e);
    fresh(W7TUE,13,'campus'); meet('classmate_peishan'); PHONE.join(G,'noodle_team','麵店團'); G.phone.groups.noodle_team.day=10; const d=EVENTS.check(e);
    fresh(W7TUE,13,'campus'); meet('classmate_peishan'); PHONE.join(G,'noodle_team','麵店團'); G.phone.groups.noodle_team.day=W7TUE+3; const f=EVENTS.check(e);
    check('A14：沛珊當面說——第 7 週起、要認識她；早就在群組裡的不會；第 7 週之後才加入群組的會',a&&!b&&!c&&!d&&f,JSON.stringify({a,b,c,d,f}));
    fresh(W7TUE,13,'campus'); meet('classmate_peishan'); npc('classmate_peishan',1,1); await EVENTS.run(e);
    check('A14：沛珊先問自己的問題、再說聽說的（AA_207 附錄 §2）、以安那句照原文、AN_DORM_RULES=peishan、只一次',JSON.stringify(lines())===JSON.stringify(['欸，你們宿舍規則有人全部讀完嗎？','我聽說以安讀完了，還寫了三頁意見。','大家笑她，她說：「規則是我們要住的，總要有人讀完。」'])&&G.flags.AN_DORM_RULES==='peishan'&&!EVENTS.check(e),JSON.stringify(lines()));
    fresh(W7TUE,8,'campus'); PHONE.join(G,'noodle_team','麵店團'); G.phone.groups.noodle_team.day=W7TUE+3; run(8,23);
    check('A14：第 7 週週二之後才加入群組：看不到加入以前的群組訊息',!G.msgs||!G.msgs.some(m=>m.tag==='an_rules_grp')); }
  /* ---------- A15 G1 考完試走出教室 ---------- */
  { const e=ev('ev_midterm_walkout'); check('G1 事件存在（民總期中考考完）',!!e&&e.afterClass==='civ_general'&&e.afterExam==='mid');
    let midDay=null; for(let d=termDay(8,1);d<=termDay(9,7);d++){ const it=CLS.dayItems(G,d).find(x=>x.c.id==='civ_general'&&x.exam==='mid'); if(it){ midDay=d; break; } }
    check('G1：民總期中考在第 8～9 週（第 '+midDay+' 天）',!!midDay);
    const exam=async(flags,setup,pk)=>{ fresh(midDay,13.2,'classroom',Object.assign({readCase:'full'},flags||{})); PHONE.join(G,'noodle_team','麵店團'); /* 有麵店團群組：G1 最後不當面問宵夜（第 9 批 A15，v1_batch9_unit 檢查沒有群組的）*/ if(setup) setup(); picks=pk||[]; const it=CLS.dayItems(G,midDay).find(x=>x.c.id==='civ_general'); await CLS.attend(GM,it); return lines(); };
    let L=await exam({},null,['引誘']);
    check('G1：考完接著演：走廊的旁白；柏翰沒見過＝「有人在問：第二題，……」旁白；阿哲「……有第二題？」；Alison、芯慈、明軒、以安沒見過都不在',L.includes('走廊上一群人。有人在翻課本，有人已經在滑手機。')&&L.includes('有人在問：第二題，是寫要約之引誘還是要約？')&&L.includes('……有第二題？')&&!L.some(t=>/我寫要約。我覺得|反對意見|不要對了啦|對答案沒有用/.test(t)),JSON.stringify(L.slice(-8)));
    check('G1：讀過案例：三個選項都在',JSON.stringify(opts[opts.length-1])===JSON.stringify(['「我寫引誘，第二天那個案子就是這個。」','「我寫要約。」','「去吃飯。」']),JSON.stringify(opts[opts.length-1]));
    L=await exam({readCase:'none'},null,['要約']);
    check('G1：第一天沒讀案例：沒有「第二天那個案子就是這個」',JSON.stringify(opts[opts.length-1])===JSON.stringify(['「我寫要約。」','「去吃飯。」']),JSON.stringify(opts[opts.length-1]));
    L=await exam({met_yu:true},()=>{ for(const id of ['classmate_bohan','classmate_xinci','classmate_mingxuan','heroine_01']) meet(id); },['要約']);
    const want=['第二題，你們是寫要約之引誘還是要約？','……有第二題？','我寫要約。我覺得是要約。（停）完了，我寫要約。','（小聲）我寫引誘，然後補了一段反對意見。','反對意見誰的？','我自己的。','……可以這樣寫嗎？','不要對了啦，去吃飯。','（從教室出來，把筆收進筆袋）對答案沒有用。考完了就是考完了。','……我寫引誘。','同一國的！'];
    check('G1：大家都認識：AA_13 G1 原文照順序；選「我寫要約。」→ Alison「同一國的！」',want.every((t,i)=>L.indexOf(t)>=0&&(i===0||L.indexOf(t)>L.indexOf(want[i-1]))),JSON.stringify(L.slice(-12)));
    check('G1：SHARED_CLASS 記在認識的同學（阿哲、柏翰、Alison、芯慈、明軒、以安）',['zhe','classmate_bohan','yu','classmate_xinci','classmate_mingxuan','heroine_01'].every(id=>SOCIAL.has(id,'SHARED_CLASS')));
    L=await exam({},()=>meet('classmate_xinci'),['吃飯']);
    check('G1：只認識芯慈（不認識柏翰）：她和柏翰那段沒有；「去吃飯。」→ 阿哲「走！」（明軒不認識）',!L.includes('我自己的。')&&L[L.length-1]==='走！'&&said[said.length-1].who!=='阿哲、明軒'&&!SOCIAL.has('classmate_bohan','SHARED_CLASS'),JSON.stringify(said.slice(-1)));
    L=await exam({},()=>{ meet('classmate_mingxuan'); meet('classmate_bohan'); },['引誘']);
    check('G1：「我寫引誘……」→ 柏翰「你也讀了判決？」',L[L.length-1]==='你也讀了判決？');
    L=await exam({},()=>meet('classmate_mingxuan'),['吃飯']); check('G1：「去吃飯。」、認識明軒：「阿哲、明軒：走！」',L[L.length-1]==='走！'&&said[said.length-1].who==='阿哲、明軒',JSON.stringify(said.slice(-1)));
    /* 只在民總期中考之後 */
    fresh(midDay,13.2,'classroom',{readCase:'full'}); G.events.done.ev_midterm_walkout=1; picks=[]; await CLS.attend(GM,CLS.dayItems(G,midDay).find(x=>x.c.id==='civ_general')); check('G1：只一次（演過就不再演）',!lines().includes('……有第二題？'));
    let other=null; for(let d=termDay(8,1);d<=termDay(9,7)&&!other;d++){ const it=CLS.dayItems(G,d).find(x=>x.c.id!=='civ_general'&&x.exam==='mid'&&x.c.kind!=='service'); if(it) other=it; }
    fresh(other.day,other.t0,'classroom',{readCase:'full'}); picks=[]; await CLS.attend(GM,other); check('G1：別科（'+other.c.name+'）的期中考考完不會演',!lines().includes('……有第二題？'));
    const W4THU=termDay(4,4); fresh(W4THU,13.2,'classroom',{readCase:'full'}); picks=[]; await CLS.attend(GM,CLS.dayItems(G,W4THU).find(x=>x.c.id==='civ_general')); check('G1：一般的民總下課不會演',!lines().includes('……有第二題？')); }
  /* ---------- A19 以安的邀約（期末前的總圖）---------- */
  { const W16=termDay(15,1);   /* 16 週制：第 15 週（AA_243 #68；變數名照舊）*/ const knowAn=()=>{ meet('heroine_01'); SOCIAL.talkedTo('heroine_01'); };   /* 認識以上（AA_70 2-1）：說過話 */
    fresh(3,20,'campus',{afternoonDone:true}); STORY.phoneRules(GM); check('A19 前提：第二天下午和以安一起過的玩家有她的聯絡方式（舊存檔也補；不跳通知）',INV.hasContact(G,'heroine_01')&&!(G.msgs||[]).some(m=>/沈以安的聯絡方式/.test(m.text||'')));
    fresh(3,20,'campus'); STORY.phoneRules(GM); check('A19 前提：沒有第二天下午的玩家沒有她的聯絡方式',!INV.hasContact(G,'heroine_01'));
    const at=(day,hour,flags,setup)=>{ fresh(day,hour,'campus',Object.assign({afternoonDone:true},flags||{})); knowAn(); if(setup) setup(); STORY.phoneRules(GM); return (G.invites||[]).find(iv=>iv.who==='heroine_01')||null; };
    const a=at(W16,20), b=at(W16,18), c=at(W16-1,20), d=at(W16+4,20), e=at(W16,20,{afternoonDone:false});
    check('A19：第 15 週週一 20:00（認識以上）：以安約隔天 8:00 總圖（邀約系統，等你回）；18:00、第 14 週、週五、沒有她的聯絡方式：不約',!!a&&a.place==='library'&&a.day===W16+1&&a.h===8&&a.state==='offered'&&a.by==='npc'&&!b&&!c&&!d&&!e,JSON.stringify({a,b:!!b,c:!!c,d:!!d,e:!!e}));
    fresh(W16,20,'campus',{afternoonDone:true}); meet('heroine_01'); STORY.phoneRules(GM); check('A19：還不認識（STRANGER）不約',!(G.invites||[]).some(iv=>iv.who==='heroine_01'));
    fresh(W16,20,'campus',{afternoonDone:true}); knowAn(); STORY.phoneRules(GM); const t=(G.msgs||[]).filter(x=>x.who==='heroine_01').map(x=>x.text);
    check('A19：訊息原文「明天 8:00 總圖。周老師那題，我寫了反方的理由。你來反駁。」',t.includes('明天 8:00 總圖。周老師那題，我寫了反方的理由。你來反駁。'),JSON.stringify(t));
    STORY.phoneRules(GM); G.hour=21; STORY.phoneRules(GM); check('A19：只約一次',(G.invites||[]).filter(iv=>iv.who==='heroine_01').length===1);
    const iv=G.invites.find(x=>x.who==='heroine_01'); const r=INV.answer(G,iv.id,'yes'); check('A19：答應＝約好了（之後照邀約系統見面）',r&&r.res==='accept'&&iv.state==='accepted');
    fresh(W16,20,'campus',{afternoonDone:true}); knowAn(); STORY.phoneRules(GM); const iv2=G.invites.find(x=>x.who==='heroine_01'); const r2=INV.answer(G,iv2.id,'later'); const r3=(fresh(W16,20,'campus',{afternoonDone:true}),knowAn(),STORY.phoneRules(GM),INV.answer(G,G.invites.find(x=>x.who==='heroine_01').id,'no'));
    const fam0=SOCIAL.rel('heroine_01').fam; check('A19：改天、不了都可以（不扣分：關係數值不變）',r2&&r2.res==='later'&&r3&&r3.res==='no'&&fam0===5,JSON.stringify({r2,r3,fam0})); }
  /* ---------- A21 跨年（BB_95 9-7、AA_71 2-7）---------- */
  { const NYE=termDay(18,3); check('跨年：第 18 週週三＝2025-12-31',CALENDAR.dateOf(NYE).key==='2025-12-31');
    const ask=(pick,setup)=>{ fresh(NYE-7,20,'campus',{dating_kexin:true}); if(setup) setup(); run(20,21.2); const m=G.msgs.find(x=>x.tag==='kx_nye_ask'); if(pick!=null) PHONE.answer(G,m.ask.id,pick); run(21.2,21.4); return m; };
    const m=ask(null);
    check('跨年：一週前（12/24）21:00 可昕問「跨年要不要來高雄？這邊河邊人比較少。」（AA_276 第 3 節），兩個回覆（原文）',!!m&&m.day===NYE-7&&m.text==='跨年要不要來高雄？這邊河邊人比較少。'&&JSON.stringify(m.ask.opts.map(o=>o.t))==='["好。","我想在臺北跟阿哲他們跨年。"]');
    const toNye=(h)=>{ const F0=Object.assign({},G.flags), ms=G.msgs, ph=G.phone, soc=G.social, ev=G.events; fresh(NYE,h||20,'dorm',F0); G.msgs=ms; G.phone=ph; G.social=soc; SOCIAL.bind(G); G.events=ev; run(h||20,(h||20)+0.1); };
    ask(0); check('跨年：「好。」＝KX_NYE {1:river}',JSON.stringify(G.flags.KX_NYE)==='{"1":"river"}'&&!G.flags.KX_NYE_PICK);
    toNye(20); let o=OUT.get(G,'nye'); check('跨年（高雄）：12/31 23:30 高雄・愛河邊（高鐵約一個半小時，AA_276 第 3 節）',!!o&&o.ev==='ev_nye_river'&&o.h===23.5&&o.day===NYE&&o.place==='高雄・愛河邊'&&o.travelH===1.5&&o.title==='去高雄跨年（高鐵約一個半小時）',JSON.stringify(o));
    PHONE.join(G,'noodle_team','麵店團'); G.hour=23; picks=['出發','把民總讀完']; await OUT.tick(GM); const L=lines();
    check('跨年（河堤）：旁白、她的兩句、三個選項、選「把民總讀完。」→「好無聊。」她數到三「新年快樂。」（AA_295）、最後「十分鐘。看完就回去。我媽說十二點半以前要到家。」（AA_369 M5）＋旁白「（凌晨一點，加開的那班高鐵。你在車上睡著了。）」（AA_276 第 3 節）',L[0]==='河堤上的人不多。煙火在很遠的地方，聲音晚了好幾秒才到。'&&L.includes('今年我們不去人多的地方。')&&L.includes('明年你最想做什麼？……一件就好。')&&JSON.stringify(opts[1])==='["「每個禮拜都見到妳。」","「把民總讀完。」","「妳先說。」"]'&&L.includes('好無聊。')&&L.includes('她數到三。')&&L[L.length-2]==='十分鐘。看完就回去。我媽說十二點半以前要到家。'&&L[L.length-1]==='（凌晨一點，加開的那班高鐵。你在車上睡著了。）',JSON.stringify({L,o:opts[1]}));
    run(G.hour,24.4); const ph=G.msgs.filter(x=>x.tag==='nye_roof_photo').map(x=>x.text);
    check('跨年（河堤）：回宿舍的路上麵店團群組：頂樓的照片＋阿哲「我們就說有看到」',JSON.stringify(ph)==='["📷（宿舍頂樓，遠遠的煙火）","我們就說有看到"]',JSON.stringify(ph));
    ask(0); toNye(20); { const o1=OUT.get(G,'nye'); o1.state='missed'; OUT.onMissed(GM,o1); const qc1=OUT.get(G,'kx_nye_call_y1');
      check('跨年（高雄）答應了沒出發：KX_NYE[1]＝missed、00:05 她打來（演出來的電話，AA_313 第 2 節第 15 列、2-3 B；原本什麼都沒有）',G.flags.KX_NYE[1]==='missed'&&!!qc1&&qc1.day===NYE+1&&Math.abs(qc1.h-5/60)<1e-6&&qc1.ev==='ev_kexin_nye_missed_call'&&qc1.verb==='接起來',JSON.stringify(qc1)); }
    ask(1); const r=G.msgs.filter(x=>x.th==='p:kexin'&&x.from==='kexin').map(x=>x.text);
    check('跨年：「我想在臺北跟阿哲他們跨年。」＝她回「好。那你幫我跟阿哲說新年快樂。」、KX_NYE {1:roof}（不扣分）',r.includes('好。那你幫我跟阿哲說新年快樂。')&&G.flags.KX_NYE[1]==='roof');
    toNye(20); o=OUT.get(G,'nye'); check('跨年（頂樓）：12/31 23:40 宿舍頂樓（AA_204 2-3）',!!o&&o.ev==='ev_nye_roof'&&Math.abs(o.h-(23+40/60))<1e-6,JSON.stringify(o));
    G.hour=23.6; picks=['出發']; await OUT.tick(GM); let L2=lines();
    check('跨年（頂樓）：AA 的群戲（「我們就說有看到。」）＋零點前一分鐘她的視訊「三、二、一——」、訊號慢一秒、「……你那邊卡了一秒啦。新年快樂。」（AA_207 §5／BB_167 SC4 第 33 列）；沒見過她的阿哲喊「木柵大學的那位，新年快樂！」',L2[0]==='（十一點四十，男生宿舍頂樓。風很大。信義區那邊的天空，亮了一塊。）'&&L2.includes('……我們就說有看到。')&&L2.includes('三、二、一——')&&L2.includes('……你那邊卡了一秒啦。新年快樂。')&&L2.includes('木柵大學的那位，新年快樂！'),JSON.stringify(L2));
    check('跨年（頂樓）：她的視訊（零點前一分鐘）排在群戲「倒數是 Alison 起的頭」之前、零點的旁白之後沒有她（AA_313 第 2 節第 16 列）',L2.indexOf('……你那邊卡了一秒啦。新年快樂。')>=0&&L2.indexOf('……你那邊卡了一秒啦。新年快樂。')<L2.indexOf('（倒數是 Alison 起的頭，數到三，大家才跟上。）')&&L2.indexOf('（倒數是 Alison 起的頭，數到三，大家才跟上。）')<L2.indexOf('（零點。很遠的地方，煙火亮了。只看得到上半截。）'),JSON.stringify(L2));
    ask(1); G.flags.KX_MET_NOODLE_TEAM=true; toNye(20); G.hour=23.6; picks=['出發']; await OUT.tick(GM); L2=lines();
    check('跨年（頂樓）：中秋烤肉見過她的阿哲喊「可昕新年快樂！」',L2.includes('可昕新年快樂！'));
    ask(null); PHONE.join(G,'noodle_team','麵店團'); toNye(20); o=OUT.get(G,'nye'); G.hour=23.6; picks=['出發']; await OUT.tick(GM); L2=lines();
    check('跨年：沒有回她、在麵店團群組：頂樓（AA 的群戲），沒有視訊',!!o&&o.ev==='ev_nye_roof'&&L2.includes('……我們就說有看到。')&&!L2.includes('三、二、一——'),JSON.stringify(L2));
    ask(null); toNye(20); check('跨年：沒有回她、沒有麵店團群組：沒有排',!OUT.get(G,'nye')); }
  /* ---------- A22 期末最後一頓（AA_71 2-13）---------- */
  { fresh(100,10,'campus'); const le=CLS.lastExamEnd(G,'Y1S1','final'); const tm=le&&CALENDAR.termOf(le.day);
    check('A22：大一上最後一科期末考考完的時間在第 16 週（16 週制；第 '+(le&&le.day)+' 天 '+(le&&le.h)+'）',!!le&&tm&&tm.id==='Y1S1'&&tm.week===16);
    const e=ev('ev_term_last_meal'); const at=(day,h,flags,zone)=>{ fresh(day,h,zone||'noodle',flags); return EVENTS.check(e); };
    const r={after:at(le.day,Math.max(le.h+0.2,17.5),{noodleTableDay:9}),before:at(le.day-1,18,{noodleTableDay:9}),noTeam:at(le.day,Math.max(le.h+0.2,17.5),{}),cafe:at(le.day,18,{noodleTableDay:9},'cafe'),later:at(le.day+1,19,{noodleTableDay:9}),late:at(le.day,22.5,{noodleTableDay:9})};
    check('A22：最後一科考完以後傍晚進麵店才有（考完前一天、沒有麵店團、不是麵店、22:00 以後：沒有；隔天還有）',r.after&&!r.before&&!r.noTeam&&!r.cafe&&r.later&&!r.late,JSON.stringify(r));
    fresh(le.day,18,'noodle',{noodleTableDay:9}); await EVENTS.run(e);
    check('A22：旁白＋阿姨「考完了，吃好一點。」（AA_71 2-13 原文）；只一次',JSON.stringify(lines())===JSON.stringify(['期末最後一科考完。阿哲在群組喊了一聲。','阿姨多送了一盤小菜。','考完了，吃好一點。'])&&said[2].who==='阿姨'&&!EVENTS.check(e),JSON.stringify(said)); }
  /* ---------- 交接包 v2 C19：大一下的期末最後一頓（同一段原文，另一個 id）---------- */
  { fresh(250,10,'campus'); const le=CLS.lastExamEnd(G,'Y1S2','final'); const tm=le&&CALENDAR.termOf(le.day); const e=ev('ev_term_last_meal_y1s2');
    check('C19：大一下最後一科期末考考完在第 16 週（16 週制）',!!le&&tm&&tm.id==='Y1S2'&&tm.week===16,JSON.stringify(le));
    const at=(day,h,flags)=>{ fresh(day,h,'noodle',flags); return EVENTS.check(e); };
    const r={after:at(le.day,Math.max(le.h+0.2,17.5),{noodleTableDay:9}),before:at(le.day-1,18,{noodleTableDay:9}),noTeam:at(le.day,Math.max(le.h+0.2,17.5),{})};
    check('C19：大一下最後一科考完以後傍晚進麵店才有（之前、沒有麵店團：沒有）',r.after&&!r.before&&!r.noTeam,JSON.stringify(r));
    fresh(le.day,18,'noodle',{noodleTableDay:9}); G.events.done.ev_term_last_meal=true; await EVENTS.run(e);
    check('C19：大一上演過了，大一下照樣有一次（AA_467 第 1 節換字、AA_519 1-3 再換：兩句旁白＋阿姨「一年了。……今天的湯，算我的。」）',JSON.stringify(lines())===JSON.stringify(['（大一最後一科考完。長桌又併起來了。）','（每個人的湯碗裡，都多了兩顆餛飩。）','一年了。……今天的湯，算我的。'])&&!EVENTS.check(e),JSON.stringify(lines())); }
  /* ---------- 可昕：期末成績寒假第一天一起打開（BB_95 9-8）---------- */
  { const LAST=termDay(16,5), BRK=CALENDAR.gradeDay('Y1S1');   /* 16 週制（AA_198 第 2 節第 3 點）：12/19 期末最後一天約、1/5 成績公布那天一起看；變數名照舊。台詞「寒假第一天一起打開」要 AA 改（已通知） */
    check('期末成績：期末考週最後一天＝'+CALENDAR.dateOf(LAST).key+'、成績公布＝'+CALENDAR.dateOf(BRK).key,CALENDAR.dateOf(LAST).key==='2025-12-19'&&CALENDAR.dateOf(BRK).key==='2026-01-05'&&!CALENDAR.termOf(BRK));
    const ask=(pick)=>{ fresh(LAST,20,'dorm',{dating_kexin:true}); run(20,21.2); const m=G.msgs.find(x=>x.tag==='kx_grades_ask'); if(pick!=null) PHONE.answer(G,m.ask.id,pick); return m; };
    const m=ask(null); check('期末成績：12/19 21:00 她傳「成績出來先不要給對方看。一月五號那天一起打開。」、兩個回覆（原文）',!!m&&m.text==='成績出來先不要給對方看。一月五號那天一起打開。'&&JSON.stringify(m.ask.opts.map(o=>o.t))==='["好。","我會忍不住。"]');
    ask(1); check('期末成績：「我會忍不住。」→「那你偷看的時候，表情不要寫在訊息裡。」（約定照樣成立）',G.msgs.some(x=>x.text==='那你偷看的時候，表情不要寫在訊息裡。')&&G.flags.KX_GRADES_PACT_SET===true);
    const morning=async(flags,pk)=>{ fresh(BRK,7.5,'dorm',Object.assign({dating_kexin:true},flags||{})); picks=pk||[]; await CLS.morning(GM); return lines(); };
    let L=await morning({},[]); check('期末成績：沒有約定的玩家：寒假第一天早上直接發成績單',L[0]==='大一上的成績出來了。'&&!!CLS.rec(G).grades.Y1S1&&!opts.some(o=>o.includes('先看。')),JSON.stringify(L));
    L=await morning({KX_GRADES_PACT_SET:true},['等五號']);
    check('期末成績（等）：早上先問「先看。／等五號一起看。」，選等＝早上不發、KX_GRADES_PACT=kept、排 21:00「接起來：可昕的視訊」',JSON.stringify(opts[0])==='["先看。","等五號一起看。"]'&&!CLS.rec(G).grades.Y1S1&&G.flags.KX_GRADES_PACT==='kept'&&OUT.get(G,'kx_grades')&&OUT.get(G,'kx_grades').verb==='接起來',JSON.stringify({L,o:opts}));
    said=[]; opts=[]; G.hour=20.8; picks=['接起來']; await OUT.tick(GM); L=lines();
    check('期末成績（等）：21:00 視訊「三、二、一——」「……都過了。好，這次才是真的放假。」，接著發成績單',opts[0][0]==='接起來：可昕的視訊：一起打開成績'&&L[0]==='三、二、一——'&&L[1]==='……都過了。好，這次才是真的放假。'&&L[2]==='大一上的成績出來了。'&&!!CLS.rec(G).grades.Y1S1,JSON.stringify({o:opts[0],L}));
    L=await morning({KX_GRADES_PACT_SET:true},['先看']);
    check('期末成績（先看）：早上照常發成績單、KX_GRADES_PACT=peeked、晚上照樣一起打開（不吵）',L.includes('大一上的成績出來了。')&&!!CLS.rec(G).grades.Y1S1&&G.flags.KX_GRADES_PACT==='peeked'&&!!OUT.get(G,'kx_grades'));
    run(7.6,21.1); const pk=G.msgs.filter(x=>x.tag==='kx_grades_peek').map(x=>x.text);
    check('期末成績（先看）：那天 21:00 她傳「你偷看了吧。你今天訊息都只回一個字。」（AA_207 §5／BB_167 SC4 第 34 列）',JSON.stringify(pk)==='["你偷看了吧。你今天訊息都只回一個字。"]',JSON.stringify(pk));
    await morning({KX_GRADES_PACT_SET:true},['等五號']); G.hour=22; await OUT.tick(GM); const missed=OUT.get(G,'kx_grades').state; const F0=Object.assign({},G.flags), C0=G.courses, O0=G.outings; fresh(BRK+1,7.5,'dorm',F0); G.courses=C0; G.outings=O0; picks=[]; await CLS.morning(GM); L=lines();
    check('期末成績（等，但那晚沒接）：隔天早上照常發成績單',missed==='missed'&&L.includes('大一上的成績出來了。')&&!!CLS.rec(G).grades.Y1S1,JSON.stringify({missed,L})); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
