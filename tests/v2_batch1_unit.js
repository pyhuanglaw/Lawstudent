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
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+e.stack); process.exit(1); });
