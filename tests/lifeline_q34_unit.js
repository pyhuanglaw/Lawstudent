// LIFE-LINE 補（AA_224 2-c，AA-C ff3f2a4b＋2026-10-17 Q3 回覆）——不需要瀏覽器。
// Q3 法律系時期「為什麼重考？」：宿營夜談選「我念過經濟系，一個多月，重考的。」→ 明軒問；honest＝長句＋阿哲「差四分喔……那真的很煩。」，其他和只玩法律系＝短句＋明軒「好，懂了。」；
//    夜談沒說的，迎新選「我二十歲。念過經濟系，一個多月。」→ Alison 補問（「好，懂了。」是 Alison）；兩處合計只問一次；「大一歲」不問。
// Q4 K7 第二～四年：第二年 2026-10-17（六）「下禮拜六週年。這次我選地方。」＝政大山下；第三年 2027-10-17（日）、第四年 2028-10-17（二）三個地點照第一年；
//    前一晚 21:00 起選準備的東西（四樣）、當天 18:30 出遊；卡片換句（第一年那句「那天在最高的地方，你說在一起吧。我說好。」不再出現；AA_303 第 2 節 9）；沒選地點＝卡片照片；
//    第四年那天在美國＝視訊（照 AA_158 的日期不會發生，測試暫時把美國的日期改到包含那一天）；沒在交往＝沒有。
// 改版前會失敗。用法：node tests/lifeline_q34_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|NEEDED_MSGS|ROM)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/camp_y1.js','src/data/ladder.js','src/data/home_lines.js','src/data/needed_msgs.js','src/romance3d.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){},cg(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); said=[]; opts=[]; picks=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; if(STORY._fy) STORY._fy.reset(); };
const R=(id,fam,trust,comf)=>{ const r=SOCIAL.rel(id); r.fam=fam; r.trust=trust||0; r.comf=comf||0; };
const LV={ACQ:[10],FAM:[25],FRI:[45,30],CLO:[65,50,45]};
const run=(h0,h1,st)=>{ st=st||0.05; for(let h=h0;h<=h1+1e-9;h+=st){ G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(G); } };
const termDay=(term,w,wd)=>STORY.termDay(term,w,wd);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const lines=()=>said.map(s=>(s.who?s.who+'：':'')+s.t);
const TH=(th)=>(G.msgs||[]).filter(m=>m.th===th);
const txt=(th)=>TH(th).map(m=>(m.from||'')+':'+m.text);
const meet=id=>SOCIAL.remember(id,'FIRST_MET','');
const D=k=>STORY.dayOfKey(k), Tm=(d,h)=>d*24+h;
(async()=>{
  const J=x=>JSON.stringify(x);
  const LONG='祐廷：第一次社會考壞了，差四分。先去念了一個多月的經濟。', SHORT='祐廷：本來就想念法律。第一次沒考上。';
  /* ---------- Q3 ---------- */
  const talk=async(flags,pick)=>{ fresh(D('2025-08-23'),22.5,'dorm',Object.assign({introDone:true},flags)); picks=[pick]; await EVENTS.run(ev('ev_camp_d2_talk')); return lines(); };
  { const L=await talk({E24C_REASON:'honest'},'念過經濟系'); const i=L.indexOf('江明軒：為什麼重考？');
    check('Q3 夜談 econ＋honest：明軒「為什麼重考？」→ 長句 → 阿哲「差四分喔……那真的很煩。」；記 WHY_RETAKE_ASKED',i>0&&L[i+1]===LONG&&L[i+2]==='阿哲：差四分喔……那真的很煩。'&&G.flags.WHY_RETAKE_ASKED===true&&!L.includes('江明軒：好，懂了。'),J(L.slice(i-1,i+4))); }
  for(const r of ['short','later',undefined,'understand']){ const L=await talk(r?{E24C_REASON:r}:{},'念過經濟系'); const i=L.indexOf('江明軒：為什麼重考？');
    check('Q3 夜談 econ＋'+(r||'只玩法律系')+'：短句 → 明軒「好，懂了。」',i>0&&L[i+1]===SHORT&&L[i+2]==='江明軒：好，懂了。'&&!L.some(t=>t.includes('差四分')),J(L.slice(i,i+3))); }
  { const L=await talk({},'大一歲'); check('Q3 夜談選「大一歲」：不問、不記',!L.some(t=>t.includes('為什麼重考'))&&!G.flags.WHY_RETAKE_ASKED); }
  const welcome=async(flags,pick)=>{ fresh(D('2025-09-03'),15,'campus',Object.assign({introDone:true},flags)); picks=[pick,0]; await EVENTS.run(ev('ev_welcome_y1s1')); return lines(); };
  { const L=await welcome({},'念過經濟系'); const i=L.findIndex(t=>/：欸，為什麼重考？$/.test(t));
    check('Q3 迎新 econ（夜談沒問過）：Alison「欸，為什麼重考？」→ 短句 →「好，懂了。」（Alison）→ 大地遊戲',i>0&&L[i].split('：')[0]===L[i+2].split('：')[0]&&L[i+1]===SHORT&&/：好，懂了。$/.test(L[i+2])&&L[i+3].startsWith('大地遊戲')&&G.flags.WHY_RETAKE_ASKED===true,J(L.slice(i-1,i+4))); }
  { const L=await welcome({E24C_REASON:'honest'},'念過經濟系'); const i=L.findIndex(t=>/：欸，為什麼重考？$/.test(t));
    check('Q3 迎新 econ＋honest：長句 → 阿哲「差四分喔……那真的很煩。」',i>0&&L[i+1]===LONG&&L[i+2]==='阿哲：差四分喔……那真的很煩。',J(L.slice(i,i+3))); }
  { const L=await welcome({WHY_RETAKE_ASKED:true},'念過經濟系'); check('Q3 夜談問過：迎新選 econ 不再問',!L.some(t=>t.includes('為什麼重考'))&&L.some(t=>t.startsWith('大地遊戲'))); }
  { const L=await welcome({},'大一歲'); check('Q3 迎新選「大一歲」：不問',!L.some(t=>t.includes('為什麼重考'))&&!G.flags.WHY_RETAKE_ASKED); }
  /* ---------- Q4 ---------- */
  const A=n=>D(['','2025-10-17','2026-10-17','2027-10-17','2028-10-17'][n]);
  check('Q4 日子：第二年六、第三年日、第四年二',wdOf(A(2))===6&&wdOf(A(3))===0&&wdOf(A(4))===2,J([wdOf(A(2)),wdOf(A(3)),wdOf(A(4))]));
  const playYear=async(n,giftPick,cardPick)=>{ said=[]; opts=[]; picks=[giftPick]; G.day=A(n)-1; G.hour=21.05; const gp=ev('ev_k7_gift_prep_n'); const ok=EVENTS.check(gp); if(ok) await EVENTS.run(gp); const g=lines(), go=opts.slice();
    said=[]; opts=[]; picks=[cardPick]; G.day=A(n); G.hour=17.5; const q=OUT.get(G,'kx_anniv'+n); if(q){ q.state='planned'; await OUT.go(GM,q); } return {g,go,L:lines(),o:opts.slice(),q}; };
  { fresh(A(2)-7,20.9,'dorm',{introDone:true,classDone:true,afternoonDone:true,dating_kexin:true,KX_ANNIV:{1:'wheel'}}); run(20.9,21.1);
    const P=TH('p:kexin').filter(m=>m.tag==='kx_anniv_ask2'), q=OUT.get(G,'kx_anniv2');
    check('Q4 第二年 10/10 21:00：「下禮拜六週年。這次我選地方。」（沒有選項）→ 木柵大學山下、排 10/17 18:30',J(P.map(m=>m.text))===J(['下禮拜六週年。這次我選地方。'])&&!P[0].ask&&G.flags.KX_ANNIV_PLACE_2==='shop'&&q&&q.day===A(2)&&q.h===18.5&&q.ap==='shop'&&q.place==='木柵大學・山下的小吃街',J([P,q]));
    const r=await playYear(2,'票根','明年也是');
    check('Q4 第二年 10/16 21:00 選準備的東西（同第一年；第二年地點是木柵大學山下＝沒有湯餃那一樣，AA_313 第 2 節第 10 列）→ K7_GIFT_2；不動第一年的 K7_GIFT',r.g[0]==='明天是週年。你準備的東西：'&&r.go[0].length===3&&!r.go[0].some(t=>t.includes('酸辣湯餃'))&&G.flags.K7_GIFT_2==='ticket'&&G.flags.K7_GIFT===undefined,J([r.g,G.flags.K7_GIFT_2]));
    check('Q4 第二年：反應同第一年（票根「（笑了）好。那這張我收。」，AA_306 附）→ 卡片「第二年。」三選一 →「你說的喔。」；沒有第一年那句；KX_ANNIV {2:shop}、暫存旗標清掉',r.L.includes('杜可昕：（笑了）好。那這張我收。')&&r.L.some(t=>t.endsWith('第二年。'))&&J(r.o[0])===J(['「明年也是。」','「時間好快。」','（握住她的手）'])&&r.L.includes('杜可昕：你說的喔。')&&!r.L.some(t=>t.includes('你說在一起吧'))&&G.flags.KX_ANNIV[2]==='shop'&&G.flags.KX_ANNIV[1]==='wheel'&&G.flags._kxAY===undefined&&G.flags._kxAP===undefined,J(r.L));
    const k=r.L.indexOf('杜可昕：你說的喔。'); check('Q4 第二年：卡片之後是「後面幾頁，她說：『回去再看。』」（同第一年）',k>0&&r.L[k+1]==='後面幾頁，她說：『回去再看。』',J(r.L.slice(k,k+2))); }
  { fresh(A(2)-7,20.9,'dorm',{introDone:true,classDone:true,afternoonDone:true,dating_kexin:true}); run(20.9,21.1); G.day=A(2); G.hour=17.5; const q=OUT.get(G,'kx_anniv2'); q.state='planned'; said=[]; picks=['握住']; await OUT.go(GM,q); const L=lines();
    check('Q4 第二年沒選準備的東西＝「你人來了就好。」；握住她的手＝「（她沒有說話。手握緊了一點。）」',L.includes('杜可昕：你人來了就好。')&&L.includes('（她沒有說話。手握緊了一點。）')&&G.flags.K7_GIFT_2==='none',J(L)); }
  { fresh(A(3)-7,20.9,'dorm',{introDone:true,classDone:true,afternoonDone:true,dating_kexin:true}); run(20.9,21.1);
    const P=TH('p:kexin').filter(m=>m.tag==='kx_anniv_ask3');
    check('Q4 第三年 10/10 21:00：「下禮拜天。第三年。地點你選。」三個地點（同第一年）',P.length===1&&P[0].text==='下禮拜天。第三年。地點你選。'&&J(P[0].ask.opts.map(o=>o.t))===J(['摩天輪。','木柵大學山下，我們的店。','河堤。']),J(P));
    PHONE.answer(G,P[0].ask.id,2); run(21.1,21.2); const q=OUT.get(G,'kx_anniv3');
    check('Q4 第三年選河堤：回覆同第一年、排 10/17 18:30 河堤',TH('p:kexin').some(m=>m.text==='好。河堤晚上風大，穿外套。')&&G.flags.KX_ANNIV_PLACE_3==='river'&&q&&q.day===A(3)&&q.ap==='river'&&q.place==='河堤',J(q));
    const r=await playYear(3,'行事曆','每年都寫');   /* AA_259 (b) 第 5 點 K13（AA_312 第 3 節 B-7）：第三年的卡片、b0 選項、回覆 */
    check('Q4 第三年：卡片「（把卡片翻到第一頁）第三年。」→「每年都寫這麼多？」→「你每年都只看第一頁。」（原本「第三年。我們好像真的會一直轉下去。」「轉到頭暈怎麼辦？」「那就一起暈。」）；KX_ANNIV {3:river}',r.L.includes('杜可昕：……這本我要用完。')&&r.L.some(t=>t.endsWith('（把卡片翻到第一頁）第三年。'))&&J(r.o[0])===J(['「明年換我寫。」','「每年都寫這麼多？」','（不說話，看著她）'])&&r.L.includes('杜可昕：你每年都只看第一頁。')&&G.flags.KX_ANNIV[3]==='river',J(r.L)); }
  { fresh(A(3)-7,20.9,'dorm',{introDone:true,classDone:true,afternoonDone:true,dating_kexin:true}); run(20.9,21.1); G.day=A(3); run(19,19.6);
    const qc=OUT.get(G,'kx_anniv_call3');
    check('Q4 第三年沒選地點：KX_ANNIV {3:missed}、沒有出遊；當晚 21:00 她打來（AA_313 2-3 A），卡片的照片不在當晚傳',(G.flags.KX_ANNIV||{})[3]==='missed'&&!OUT.get(G,'kx_anniv3')&&!!qc&&qc.day===A(3)&&qc.h===21&&qc.ev==='ev_kexin_anniv_missed_call'&&!TH('p:kexin').some(m=>m.tag==='kx_anniv_photo3'),J(qc));
    G.day=A(3)+1; run(11.9,12.1);
    check('Q4 第三年沒選地點：卡片的照片「週年快樂。下次你準備。」隔天中午（AA_313 2-3 A）',TH('p:kexin').some(m=>m.tag==='kx_anniv_photo3'&&m.text==='週年快樂。下次你準備。'&&m.day===A(3)+1&&Math.abs(m.h-12)<0.06)); }
  /* AA_313 第 2 節第 36 列：和前一年送一樣的（前一年有見到她）＝換句 */
  for(const [gp,prev,ap,pick,want,old] of [['ticket',{2:'shop'},2,'票根','杜可昕：……又一張。去年那張我還留著。','杜可昕：……原本那張呢？'],['planner',{2:'shop'},2,'行事曆','杜可昕：……去年那本我用完了。','杜可昕：……這本我要用完。'],['dumpling',{2:'shop'},2,'湯餃','杜可昕：又是這個。……好，我吃。','杜可昕：這是禮物？']]){
    fresh(A(3)-7,20.9,'dorm',{introDone:true,classDone:true,afternoonDone:true,dating_kexin:true,K7_GIFT_2:gp,KX_ANNIV:prev}); run(20.9,21.1); const P=TH('p:kexin').filter(m=>m.tag==='kx_anniv_ask3'); PHONE.answer(G,P[0].ask.id,ap); run(21.1,21.2);
    const r=await playYear(3,pick,'會啊');
    check('Q4 第三年送和第二年一樣的（'+gp+'）：「'+want.replace('杜可昕：','')+'」，沒有「'+old.replace('杜可昕：','')+'」；暫存旗標清掉',r.L.includes(want)&&!r.L.includes(old)&&G.flags.K7_GIFT_3===gp&&G.flags._kxAGR===undefined,J(r.L)); }
  { fresh(A(3)-7,20.9,'dorm',{introDone:true,classDone:true,afternoonDone:true,dating_kexin:true,K7_GIFT_2:'ticket',KX_ANNIV:{2:'missed'}}); run(20.9,21.1); const P=TH('p:kexin').filter(m=>m.tag==='kx_anniv_ask3'); PHONE.answer(G,P[0].ask.id,2); run(21.1,21.2);
    const r=await playYear(3,'票根','會啊');
    check('Q4 第三年送票根、第二年也是票根但那年沒去（她沒收到）＝照原本「……原本那張呢？」',r.L.includes('杜可昕：……原本那張呢？')&&!r.L.includes('杜可昕：……又一張。去年那張我還留著。'),J(r.L)); }
  { fresh(A(4)-7,20.9,'dorm',{introDone:true,classDone:true,afternoonDone:true,dating_kexin:true,EXCHANGE_ROUTE:'TW'}); run(20.9,21.1);
    const P=TH('p:kexin').filter(m=>m.tag==='kx_anniv_ask4');
    check('Q4 第四年（台灣路線）：「下禮拜二。第四年。……平日也要過。」三個地點；不是視訊',P.length===1&&P[0].text==='下禮拜二。第四年。……平日也要過。'&&P[0].ask.opts.length===3&&!OUT.get(G,'kx_anniv4v')&&!STORY.kxAnnivVideo(G,4),J(P));
    PHONE.answer(G,P[0].ask.id,0); run(21.1,21.2); const r=await playYear(4,'湯餃','不說話');
    check('Q4 第四年：卡片「第四年。……明年這一天，我們都畢業了。」、自己一組選項（AA_378 #10，照 BB_209 第 4 節：「明年也一起過。」「時間好快。」不說話）→「……幹嘛一直看。」；KX_ANNIV {4:wheel}',r.L.includes('杜可昕：……這是我收過最燙的禮物。')&&r.L.includes('杜可昕：（把卡片翻到第一頁）第四年。……明年這一天，我們都畢業了。')&&r.o.some(o=>J(o)===J(['「明年也一起過。」','「時間好快。」','（不說話，看著她）']))&&!r.o.some(o=>o.includes('「轉到頭暈怎麼辦？」'))&&r.L.includes('杜可昕：……幹嘛一直看。')&&G.flags.KX_ANNIV[4]==='wheel',J([r.L,r.o])); }
  { /* 美國路線 2028-08-02～12-23（AA_260 第 4 節第 1 點）：第四年（2028-10-17）那天人在美國 */
    { fresh(A(4)-7,20.9,'dorm',{introDone:true,classDone:true,afternoonDone:true,dating_kexin:true,EXCHANGE_ROUTE:'US'}); run(20.9,21.1); const q=OUT.get(G,'kx_anniv4v');
      G.day=A(4)-1; G.hour=21.1; const gift=EVENTS.check(ev('ev_k7_gift_prep_n'));
      said=[]; G.day=A(4); G.hour=20.5; q.state='planned'; await OUT.go(GM,q); const L=lines();
      check('Q4 第四年那天在美國：沒有邀約、沒有準備的東西；她台灣 21:00＝當地早上 09:00 打視訊（AA_340 S8；接起來）三句；KX_ANNIV {4:video}',!TH('p:kexin').some(m=>m.tag==='kx_anniv_ask4')&&!gift&&q&&q.h===9&&q.verb==='接起來'&&J(L.filter(t=>t.startsWith('杜可昕')).slice(0,3))===J(['杜可昕：週年快樂。你那邊是早上吧。','杜可昕：卡片我寄了，下禮拜才會到。','杜可昕：……你回來我們再去一次摩天輪。'])&&G.flags.KX_ANNIV[4]==='video',J([q,L])); }
  }
  { fresh(A(2)-7,20.9,'dorm',{introDone:true,classDone:true,afternoonDone:true}); run(20.9,21.1); check('Q4 沒在交往：第二年沒有邀約、沒有出遊',!TH('p:kexin').some(m=>/^kx_anniv/.test(m.tag||''))&&!OUT.get(G,'kx_anniv2')); }
  { fresh(D('2025-10-10'),20.9,'dorm',{introDone:true,classDone:true,afternoonDone:true,dating_kexin:true}); run(20.9,21.1); check('Q4 第一年照舊（kx_anniv_ask 兩句、三個地點），沒有第二年的訊息',TH('p:kexin').filter(m=>m.tag==='kx_anniv_ask').length===2&&!TH('p:kexin').some(m=>m.tag==='kx_anniv_ask2')); }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
