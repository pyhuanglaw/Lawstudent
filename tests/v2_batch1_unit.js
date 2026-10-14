// 交接包 v2（大一下）第 1 批：先改的現有文字（交接包_v2_大一下_草稿 第 1 節、第 3 節）——不需要瀏覽器。修改前每一節都會失敗：
//   語彤 4 ev_yutong_absent：原因改輕（阿姨扭到手腕）、放在期中這兩週（第 8～9 週）、記憶備註改新的；舊存檔的舊備註在人物面板顯示新的（存檔不改）
//   語彤 5 ev_yutong_thanks：三句改字，「你的字很醜。……謝謝。」不動
//   慈 2 ev_xinci_double：第四個選項「經濟那科我陪妳看。」；她的反應照 ECON_PAST_SHARED（full／half）；不知道的由玩家選說多少（三種）；
//     都記 ECON_TOGETHER；以安不在場，KNOWS_ECON_YEAR 不變；有 P4B_SEEN 的玩家問法不同
// 用法：node tests/v2_batch1_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}}; global.THREE={Vector3:function(){}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/calendar.js','src/data/characters.js','src/data/events.js','src/social3d.js','src/events3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){},cg(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], G=null;
const GM={get G(){ return G; },E:{q:{level:'medium'},player:{busy:false,obj:{position:{x:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null},D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(){},setGoal(){},toast(){},advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const wk=(term,w,wd)=>{ for(let d=1;d<2000;d++){ const t=CALENDAR.termOf(d); if(t&&t.id===term&&t.week===w&&(!wd||CALENDAR.dateOf(d).wd===wd)) return d; } return null; };
const fresh=(day,hour,zone,flags)=>{ G={day,hour,zone,weekday:wdOf(day),weather:'clear',flags:Object.assign({},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,energy:80,money:5000}; SOCIAL.bind(G); EVENTS.bind(GM); said=[]; opts=[]; picks=[]; };
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const lines=()=>said.map(s=>(s.who?s.who+'：':'')+s.t);
(async()=>{
  /* ---------- 語彤 4 ---------- */
  { const e=ev('ev_yutong_absent'); const prep=day=>{ fresh(day,18,'noodle'); SOCIAL.meet('heroine_03','campus'); SOCIAL.remember('heroine_03','TALKED_FAMILY','x'); };
    const w3=wk('Y1S2',3,2), w8=wk('Y1S2',8,2), w9=wk('Y1S2',9,4), w10=wk('Y1S2',10,2);
    const r=[w3,w8,w9,w10].map(d=>{ prep(d); return EVENTS.check(e); });
    check('語彤 4：大一下期中這兩週（第 8、9 週）的週二、週四晚上才有；第 3 週、第 10 週沒有',JSON.stringify(r)==='[false,true,true,false]',JSON.stringify(r));
    prep(w8); await EVENTS.run(e); const L=lines();
    check('語彤 4：「阿姨右手包著護腕，用左手撈麵。」＋「手扭到了，這禮拜都是她在顧，顧到打烊。今天我叫她先回去睡。」＋「那孩子什麼都不講。…」',L[0]==='櫃台後面沒有語彤。阿姨右手包著護腕，用左手撈麵。'&&L[1]==='阿姨：「手扭到了，這禮拜都是她在顧，顧到打烊。今天我叫她先回去睡。」'&&L[2]==='「那孩子什麼都不講。你是她同學？下次叫她不要什麼都自己扛。」'&&!L.some(t=>/醫院|回診/.test(t)),JSON.stringify(L));
    const m=SOCIAL.memories('heroine_03').find(x=>x.tag==='IMPORTANT_CONVERSATION');
    check('語彤 4：設 yutong_hospital（旗標名不改）、記憶備註「阿姨扭到手腕，那週她顧店到打烊」',G.flags.yutong_hospital===true&&!!m&&m.note==='阿姨扭到手腕，那週她顧店到打烊',JSON.stringify(m));
    fresh(w8,18,'noodle'); SOCIAL.remember('heroine_03','IMPORTANT_CONVERSATION','阿姨說她帶媽媽去醫院'); const old=SOCIAL.memories('heroine_03').find(x=>x.tag==='IMPORTANT_CONVERSATION');
    check('語彤 4：舊存檔記的是舊備註——存檔不改，人物面板顯示新的',old.note==='阿姨說她帶媽媽去醫院'&&SOCIAL.noteShown('heroine_03',old)==='阿姨扭到手腕，那週她顧店到打烊'); }
  /* ---------- 語彤 5 ---------- */
  { const e=ev('ev_yutong_thanks'); const T=JSON.stringify(e.dialogue);
    check('語彤 5：「沒事，手腕扭到而已。」「講了阿姨的手也不會快一點好。……但謝謝。」「店收了才來的。這裡比較安靜。」；沒有回診、睡不著',/沒事，手腕扭到而已。/.test(T)&&/講了阿姨的手也不會快一點好。……但謝謝。/.test(T)&&/店收了才來的。這裡比較安靜。/.test(T)&&!/回診|睡不著才來/.test(T));
    check('語彤 5：「你的字很醜。……謝謝。」不動',/你的字很醜。……謝謝。/.test(T));
    for(const [k,want] of [[1,'講了阿姨的手也不會快一點好。……但謝謝。'],[2,'店收了才來的。這裡比較安靜。']]){ fresh(wk('Y1S2',10,3),15,'library',{yutong_hospital:true}); SOCIAL.meet('heroine_03','campus'); picks=[k]; await EVENTS.run(e); check('語彤 5：選第 '+(k+1)+' 個 →「'+want+'」',said.some(s=>s.t===want),JSON.stringify(lines())); } }
  /* ---------- 慈 2 ---------- */
  { const e=ev('ev_xinci_double'), day=wk('Y1S2',6,3);
    const go=async(flags,pk)=>{ fresh(day,15,'library',flags); SOCIAL.meet('classmate_xinci','campus'); SOCIAL.remember('classmate_xinci','LENT_NOTES','x'); picks=pk.slice(); await EVENTS.run(e); return lines(); };
    let L=await go({ECON_PAST_SHARED:'full'},[3]);
    check('慈 2：第四個選項「經濟那科我陪妳看。」（所有玩家都有）',opts[0].length===4&&opts[0][3]==='「經濟那科我陪妳看。」',JSON.stringify(opts[0]));
    check('慈 2（full）：「你念過的那一年，第三章有教嗎？」→ 你「有。我那時候沒聽懂。」→「那這次一起懂。」→ 對經濟題、ECON_TOGETHER',L.includes('吳芯慈：（小聲）你念過的那一年，第三章有教嗎？')&&L.includes('祐廷：有。我那時候沒聽懂。')&&L.includes('吳芯慈：（小聲）那這次一起懂。')&&L.includes('（你們在總圖對經濟題。）')&&SOCIAL.has('classmate_xinci','ECON_TOGETHER')&&L[L.length-1]==='吳芯慈：（小聲）謝謝。我要繼續讀了。',JSON.stringify(L));
    L=await go({ECON_PAST_SHARED:'half'},[3]);
    check('慈 2（half）：「自學的人，第三章懂嗎？」→「懂一半。」→「一半也好。」',L.includes('吳芯慈：（小聲）自學的人，第三章懂嗎？')&&L.includes('祐廷：懂一半。')&&L.includes('吳芯慈：（小聲）一半也好。')&&opts.length===1,JSON.stringify(L));
    L=await go({},[3,0]);
    check('慈 2（沒說過）：「……你怎麼這麼熟？」→ 玩家選說多少（三個）→「念過一年。」→「我就知道。」→ full',L.includes('吳芯慈：（小聲）……你怎麼這麼熟？')&&JSON.stringify(opts[1])==='["「念過一年。」","「自學過一點。」","「第三章我也還在念。」"]'&&L.includes('吳芯慈：（小聲）我就知道。')&&G.flags.ECON_PAST_SHARED==='full'&&SOCIAL.has('classmate_xinci','ECON_TOGETHER'),JSON.stringify(L));
    check('慈 2：以安不在場，KNOWS_ECON_YEAR 不變',!SOCIAL.has('heroine_01','KNOWS_ECON_YEAR'));
    L=await go({ECON_PAST_SHARED:'none'},[3,1]);
    check('慈 2（none）：「自學過一點。」→「自學的人，第三章懂嗎？」「懂一半。」「一半也好。」→ half',L.includes('吳芯慈：（小聲）自學的人，第三章懂嗎？')&&L.includes('祐廷：懂一半。')&&G.flags.ECON_PAST_SHARED==='half',JSON.stringify(L));
    L=await go({},[3,2]);
    check('慈 2：「第三章我也還在念。」→「……好，不說也行。」→ 不變（還是沒有）、也對經濟題',L.includes('吳芯慈：（小聲）……好，不說也行。')&&G.flags.ECON_PAST_SHARED===undefined&&SOCIAL.has('classmate_xinci','ECON_TOGETHER'),JSON.stringify(L));
    L=await go({P4B_SEEN:true},[3,2]);
    check('慈 2：有 P4B_SEEN 的玩家：「上次問你，你只笑。這次是第三章，你總要說了吧。」（不問「你怎麼這麼熟」）',L.includes('吳芯慈：（小聲）上次問你，你只笑。這次是第三章，你總要說了吧。')&&!L.some(t=>/你怎麼這麼熟/.test(t)),JSON.stringify(L));
    L=await go({},[2]);
    check('慈 2：原本的三個選項照舊（「妳為什麼要雙主修？」→ 會計師那句 → 謝謝）、沒有 ECON_TOGETHER',L.includes('吳芯慈：（小聲）我爸說法律系畢業沒有第二專長會餓死。他是會計師。')&&L[L.length-1]==='吳芯慈：（小聲）謝謝。我要繼續讀了。'&&!SOCIAL.has('classmate_xinci','ECON_TOGETHER'),JSON.stringify(L)); }
  /* ---------- 語彤 6 房東來過了（C12；AA_11 事件 6）---------- */
  { const e=ev('ev_yutong_landlord'); check('語彤 6：事件在',!!e);
    if(e){ const at=(term,w,wd,h)=>{ const d=wk(term,w,wd); fresh(d,h,'noodle'); return EVENTS.check(e); };
      const r={w10tue:at('Y1S2',10,2,18.5),w9:at('Y1S2',9,2,18.5),w12thu:at('Y1S2',12,4,19),wed:at('Y1S2',10,3,18.5),late:at('Y1S2',10,2,21),y2:at('Y2S1',10,2,18.5)};
      check('語彤 6：大一下第 10 週以後的週二、週四晚上進麵店才有（第 9 週、週三、21:00、大二都沒有）',r.w10tue&&!r.w9&&r.w12thu&&!r.wed&&!r.late&&!r.y2,JSON.stringify(r));
      fresh(wk('Y1S2',10,2),18.5,'noodle'); await EVENTS.run(e); let L=lines();
      check('語彤 6（還不認識語彤）：流程旁白＋阿哲「那誰？」＋阿姨「沒事啦…」＋語彤「……嗯。」；沒有問的選項、沒有 RENT_RUMOR',L[0]==='一個穿西裝的中年人拿著捲尺量店面的寬度，跟阿姨講了幾句就走。'&&L[1]==='阿姨把湯勺放下，站著不動，然後又拿起來。'&&/那誰？$/.test(L[2])&&L[3]==='語彤端麵過來。'&&L[4]==='阿姨：沒事啦，房東的朋友，來看房子。'&&/……嗯。$/.test(L[6])&&!opts.length&&!SOCIAL.has('heroine_03','RENT_RUMOR'),JSON.stringify(L));
      fresh(wk('Y1S2',10,2),18.5,'noodle'); SOCIAL.meet('heroine_03','campus'); picks=[0]; await EVENTS.run(e); L=lines();
      check('語彤 6（認識）：問 →「房東想把整棟賣掉。還沒確定。……你吃你的。」、記 RENT_RUMOR',JSON.stringify(opts[0])==='["（問語彤）","（不問）"]'&&L.some(t=>/房東想把整棟賣掉。還沒確定。……你吃你的。$/.test(t))&&SOCIAL.has('heroine_03','RENT_RUMOR'),JSON.stringify(L.slice(-2)));
      fresh(wk('Y1S2',10,2),18.5,'noodle'); SOCIAL.meet('heroine_03','campus'); picks=[1]; await EVENTS.run(e);
      check('語彤 6（認識）：不問就不記 RENT_RUMOR、只演一次',!SOCIAL.has('heroine_03','RENT_RUMOR')&&!EVENTS.check(e)); } }
  /* ---------- 學姊 W4 空的保溫瓶（BB_96 2-5）---------- */
  { const e=ev('ev_sis_empty_flask'); check('學姊 W4：事件在',!!e);
    if(e){ const R5=(fam,trust)=>{ const r=SOCIAL.rel('heroine_05'); r.fam=fam; r.trust=trust||0; };
      const at=(term,w,wd,h,fam,zone)=>{ fresh(wk(term,w,wd),h,zone||'library'); SOCIAL.meet('heroine_05','campus'); R5(fam); return EVENTS.check(e); };
      const r={ok:at('Y1S2',8,2,15,25),w9:at('Y1S2',9,4,16,25),w7:at('Y1S2',7,2,15,25),eve:at('Y1S2',8,2,18,25),acq:at('Y1S2',8,2,15,10),cafe:at('Y1S2',8,2,15,25,'cafe'),y1s1:at('Y1S1',8,2,15,25)};
      check('學姊 W4：大一下第 8～9 週、總圖、平日 14～17、有點熟以上（第 7 週、18:00、只是認識、Café、大一上都沒有）',r.ok&&r.w9&&!r.w7&&!r.eve&&!r.acq&&!r.cafe&&!r.y1s1,JSON.stringify(r));
      const play=async k=>{ fresh(wk('Y1S2',8,2),15,'library'); SOCIAL.meet('heroine_05','campus'); R5(25); picks=[k]; await EVENTS.run(e); return lines(); };
      let L=await play(0);
      check('學姊 W4：旁白兩句；三個選項（原文）',L[0]==='她在讀判決，左手拿著保溫瓶，喝了一口。又喝了一口。'&&L[1]==='保溫瓶是空的。她已經對著空瓶喝了三次。'&&JSON.stringify(opts[0])==='["「學姊，妳的保溫瓶是空的。」","（去 Café 買一杯黑咖啡，放在她桌上）","（什麼都不說）"]',JSON.stringify([L.slice(0,2),opts[0]]));
      check('學姊 W4 選 1：「……喔。」「我早上九點裝的。我以為我還沒喝完。」（她笑出來。）「這件事很蠢。你看到了，就算了。」、NOTICED_HER',L.some(t=>/……喔。$/.test(t))&&L.some(t=>/我早上九點裝的。我以為我還沒喝完。$/.test(t))&&L.includes('（她笑出來。）')&&L.some(t=>/這件事很蠢。你看到了，就算了。$/.test(t))&&SOCIAL.has('heroine_05','NOTICED_HER')&&!L.some(t=>/不要跟/.test(t)),JSON.stringify(L.slice(2)));
      L=await play(1); check('學姊 W4 選 2：「……你翹課？」你「下課了。」「……好。」（她把咖啡倒進保溫瓶。）、HELPED',L.some(t=>/……你翹課？$/.test(t))&&L.includes('祐廷：下課了。')&&L.includes('（她把咖啡倒進保溫瓶。）')&&SOCIAL.has('heroine_05','HELPED'),JSON.stringify(L.slice(2)));
      L=await play(2); check('學姊 W4 選 3：她自己發現去裝水；「你看到了吧。」你「……沒有。」「說謊的時候，不要看別的地方。」、NOTICED_HER',L.includes('（她自己發現，起身去裝水。）')&&L.some(t=>/你看到了吧。$/.test(t))&&L.includes('祐廷：……沒有。')&&L.some(t=>/說謊的時候，不要看別的地方。$/.test(t))&&SOCIAL.has('heroine_05','NOTICED_HER'),JSON.stringify(L.slice(2)));
      check('學姊 W4：只一次',!EVENTS.check(e)); } }
  /* ---------- 子晴 Q4 比賽那天（BB_96 4-1 改寫）---------- */
  { const e=ev('ev_ziqing_contest_day'); check('子晴 Q4：事件在',!!e);
    if(e){ const at=(term,w,wd,h,zone,noMem)=>{ fresh(wk(term,w,wd),h,zone||'gongguan'); SOCIAL.meet('heroine_04','campus'); if(!noMem) SOCIAL.remember('heroine_04','ARGUED_ABOUT_CAREER','x'); return EVENTS.check(e); };
      const r={ok:at('Y1S2',8,6,14),h13:at('Y1S2',8,6,13.2),noMem:at('Y1S2',8,6,14,null,true),w7:at('Y1S2',7,6,14),w9:at('Y1S2',9,6,14),fri:at('Y1S2',8,5,14),sun:at('Y1S2',8,7,14),eve:at('Y1S2',8,6,16.5),cafe:at('Y1S2',8,6,14,'cafe'),y1s1:at('Y1S1',8,6,14)};
      check('子晴 Q4：只在大一下第 8 週的週六 13～16、公館、問過比賽（ARGUED_ABOUT_CAREER）（沒問過、第 7／9 週、週五、週日、16:30、Café、大一上都沒有）',r.ok&&r.h13&&!r.noMem&&!r.w7&&!r.w9&&!r.fri&&!r.sun&&!r.eve&&!r.cafe&&!r.y1s1,JSON.stringify(r));
      const play=async k=>{ fresh(wk('Y1S2',8,6),14,'gongguan'); SOCIAL.meet('heroine_04','campus'); SOCIAL.remember('heroine_04','ARGUED_ABOUT_CAREER','x'); picks=[k]; await EVENTS.run(e); return lines(); };
      let L=await play(0);
      check('子晴 Q4：旁白「（她坐在騎樓的長椅，旁邊三個空的咖啡罐。）」＋三句（第三罐咖啡）；三個選項（原文）',L[0]==='（她坐在騎樓的長椅，旁邊三個空的咖啡罐。）'&&/……今天是那個比賽。系上的人現在都在會場。$/.test(L[1])&&/我在這裡喝第三罐咖啡。$/.test(L[2])&&/你說，我是不是很爛。$/.test(L[3])&&JSON.stringify(opts[0])==='["「妳不想去，就不是爛。」","「現在去還來得及嗎？」","（陪她喝第四罐）"]',JSON.stringify([L.slice(0,4),opts[0]]));
      const m=SOCIAL.memories('heroine_04').find(x=>x.tag==='CONTEST_DAY');
      check('子晴 Q4 選 1：「……你這樣講，好像我很勇敢。」（她笑。）「我只是怕輸。」→「……第四罐。你請。」、CONTEST_DAY（比賽那天，公館騎樓）',L.some(t=>/……你這樣講，好像我很勇敢。$/.test(t))&&L.includes('（她笑。）')&&L.some(t=>/我只是怕輸。$/.test(t))&&/……第四罐。你請。$/.test(L[L.length-1])&&!!m&&m.note==='比賽那天，公館騎樓'&&!L.some(t=>/來不及|你也喝/.test(t)),JSON.stringify(L.slice(4)));
      L=await play(1); check('子晴 Q4 選 2：「來不及了。第一輪已經結束了。」（她把手機蓋在長椅上。）「……好爽。好爛。兩個都有。」→ 第四罐、CONTEST_DAY',L.some(t=>/來不及了。第一輪已經結束了。$/.test(t))&&L.includes('（她把手機蓋在長椅上。）')&&L.some(t=>/……好爽。好爛。兩個都有。$/.test(t))&&/……第四罐。你請。$/.test(L[L.length-1])&&SOCIAL.has('heroine_04','CONTEST_DAY')&&!L.some(t=>/勇敢|你也喝/.test(t)),JSON.stringify(L.slice(4)));
      L=await play(2); check('子晴 Q4 選 3：「欸不是，你也喝？」你「嗯。」「……你很奇怪。」（她第一次沒有吐槽下去。）→ 第四罐、CONTEST_DAY',L.some(t=>/欸不是，你也喝？$/.test(t))&&L.includes('祐廷：嗯。')&&L.some(t=>/……你很奇怪。$/.test(t))&&L.includes('（她第一次沒有吐槽下去。）')&&/……第四罐。你請。$/.test(L[L.length-1])&&SOCIAL.has('heroine_04','CONTEST_DAY')&&!L.some(t=>/勇敢|來不及/.test(t)),JSON.stringify(L.slice(4)));
      const T=JSON.stringify(e.dialogue);
      check('子晴 Q4：舊版刪掉的選項「有一點。但明年還有。」與舊的 IMPORTANT_CONVERSATION 備註都不在；錢照舊 −120',!/有一點。但明年還有。/.test(T)&&!/IMPORTANT_CONVERSATION/.test(T)&&e.consequences&&e.consequences.money===-120);
      check('子晴 Q4：只一次',!EVENTS.check(e)); } }
  /* ---------- 子晴 Q6 測試我的遊戲。現在。（BB_96 4-2 改門檻）---------- */
  { const e=ev('ev_ziqing_secret_game'); check('子晴 Q6：事件在',!!e);
    if(e){ const Z4=(fam)=>{ const r=SOCIAL.rel('heroine_04'); r.fam=fam; };
      const at=(term,w,wd,h,opt)=>{ opt=opt||{}; fresh(wk(term,w,wd),h,opt.zone||'wancai'); SOCIAL.meet('heroine_04','campus'); Z4(opt.fam==null?25:opt.fam); for(const t of (opt.mem||['CONTEST_DAY'])) SOCIAL.remember('heroine_04',t,'x'); return EVENTS.check(e); };
      const r={contest:at('Y1S2',11,1,19.5),clapped:at('Y1S2',15,3,20,{mem:['CLAPPED']}),none:at('Y1S2',11,1,19.5,{mem:[]}),careerOnly:at('Y1S2',11,1,19.5,{mem:['ARGUED_ABOUT_CAREER']}),acq:at('Y1S2',11,1,19.5,{fam:10}),w10:at('Y1S2',10,1,19.5),tue:at('Y1S2',11,2,19.5),late:at('Y1S2',11,1,21.5),lib:at('Y1S2',11,1,19.5,{zone:'library'}),y1s1:at('Y1S1',11,1,19.5)};
      check('子晴 Q6：Q4（CONTEST_DAY）或 Q5（CLAPPED）任一＋有點熟以上；大一下第 11 週以後、週一三 19～21、萬才館（都沒有、只問過比賽、只是認識、第 10 週、週二、21:30、總圖、大一上都沒有）',r.contest&&r.clapped&&!r.none&&!r.careerOnly&&!r.acq&&!r.w10&&!r.tue&&!r.late&&!r.lib&&!r.y1s1,JSON.stringify(r));
      check('子晴 Q6：舊的前置（FRIEND，沒有事件會到）拿掉了',!(e.prereq.stage&&e.prereq.stage.min==='FRIEND'));
      const play=async(k,opt)=>{ opt=opt||{}; fresh(wk('Y1S2',11,1),19.5,'wancai',opt.flags||{}); SOCIAL.meet('heroine_04','campus'); Z4(25); for(const t of (opt.mem||['ARGUED_ABOUT_CAREER','CONTEST_DAY'])) SOCIAL.remember('heroine_04',t,'x'); picks=[k]; await EVENTS.run(e); return lines(); };
      let L=await play(0,{flags:{}});
      check('子晴 Q6：三句（原文）；知道比賽的玩家三個選項是「貓為什麼要找插座？」「這比比賽有用多了。」「總圖二樓靠窗那排的插座是壞的。」',/（把筆電轉過來）測試我的遊戲。現在。$/.test(L[0])&&/一隻在校園裡找插座的貓。做了半年。$/.test(L[1])&&/沒有人知道。……除了阿凱。他是工程師，不算。$/.test(L[2])&&JSON.stringify(opts[0])==='["「貓為什麼要找插座？」","「這比比賽有用多了。」","「總圖二樓靠窗那排的插座是壞的。」"]',JSON.stringify([L.slice(0,3),opts[0]]));
      check('子晴 Q6 選 1：「因為牠的手機沒電了。」（她說得很認真，然後自己笑到趴在桌上。）、PLAYTESTED、沒有 FIRST_BUG',L.some(t=>/因為牠的手機沒電了。$/.test(t))&&L.includes('（她說得很認真，然後自己笑到趴在桌上。）')&&SOCIAL.has('heroine_04','PLAYTESTED')&&!G.flags.FIRST_BUG,JSON.stringify(L.slice(3)));
      L=await play(1,{flags:{}}); check('子晴 Q6 選 2（單身）：「你不要突然講這種話，我會當真。」',L.some(t=>/你不要突然講這種話，我會當真。$/.test(t))&&!L.some(t=>/把它做完/.test(t))&&SOCIAL.has('heroine_04','PLAYTESTED'),JSON.stringify(L.slice(3)));
      L=await play(1,{flags:{dating_kexin:true}}); check('子晴 Q6 選 2（交往中，AA_112 8-1）：「你不要突然講這種話。我會真的把它做完。」',L.some(t=>/你不要突然講這種話。我會真的把它做完。$/.test(t))&&!L.some(t=>/我會當真/.test(t)),JSON.stringify(L.slice(3)));
      L=await play(2,{flags:{}}); check('子晴 Q6 選 3：（她愣住，打開程式碼。）「……真的假的。我加進去。」、FIRST_BUG（祐廷的第一個貢獻）、PLAYTESTED',L.includes('（她愣住，打開程式碼。）')&&L.some(t=>/……真的假的。我加進去。$/.test(t))&&G.flags.FIRST_BUG===true&&SOCIAL.has('heroine_04','PLAYTESTED'),JSON.stringify(L.slice(3)));
      L=await play(1,{flags:{},mem:['CLAPPED']}); check('子晴 Q6：不知道比賽的玩家（只有 CLAPPED）第二個選項換成「這比我想的好玩。」',JSON.stringify(opts[0])==='["「貓為什麼要找插座？」","「這比我想的好玩。」","「總圖二樓靠窗那排的插座是壞的。」"]'&&L.some(t=>/你不要突然講這種話，我會當真。$/.test(t)),JSON.stringify(opts[0]));
      check('子晴 Q6：表情沒有 embarrassed（第一次留給 Q5）、沒有舊台詞「不准笑」「交出去」',!JSON.stringify(e.dialogue).includes("'embarrassed'")&&!/embarrassed/.test(JSON.stringify(e.dialogue))&&!/不准笑|交出去/.test(JSON.stringify(e.dialogue)));
      check('子晴 Q6：只一次',!EVENTS.check(e)); } }
  /* ---------- 人物面板：每一種記憶都有中文名稱（沒有的話面板直接顯示英文代號）---------- */
  { const src=fs.readdirSync(path.join(ROOT,'src')).filter(f=>f.endsWith('.js')).map(f=>fs.readFileSync(path.join(ROOT,'src',f),'utf8')).join('\n')+fs.readdirSync(path.join(ROOT,'src/data')).filter(f=>f.endsWith('.js')).map(f=>fs.readFileSync(path.join(ROOT,'src/data',f),'utf8')).join('\n');
    const used=new Set(); for(const m of src.matchAll(/tag:'([A-Z_0-9]+)'/g)) used.add(m[1]); for(const m of src.matchAll(/remember\([^,()]+,'([A-Z_0-9]+)'/g)) used.add(m[1]); used.delete('ADJUST');
    const miss=[...used].filter(t=>!SOCIAL.MEMORY_LABEL[t]);
    check('人物面板：遊戲裡用到的 '+used.size+' 種記憶都有中文名稱（ADJUST 不顯示）',used.size>30&&!miss.length,miss.join(' ')); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+e.stack); process.exit(1); });
