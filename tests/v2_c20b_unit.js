// 交接包 v2 C20 重訪日 1——麵店團併桌、單身不在麵店團的版本（AA 50da3a9、d1fa44f；BB_96 第 11 節 b7c89d1）——不需要瀏覽器。
// 修改前沒有 ev_revisit_y1_noodle（第 1 項失敗）。檢查：誰走哪個版本（交往中＝可昕版、麵店團＝併桌、其他＝最親近的人）；17:00 群組揪人；併桌的回應與他們各說一件；
//   最親近的人（先看階段再看熟悉、至少有點熟；學姊、沛珊有伴侶不算；女生要有聯絡方式）；男生四人的台詞與阿凱好朋友前後；女生 18:00 的訊息（芷若、子晴的條件）；
//   都不到有點熟＝筆記本；記 REVISIT_Y1
// 用法：node tests/v2_c20b_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
(async()=>{
  const noo=ev('ev_revisit_y1_noodle'), sgl=ev('ev_revisit_y1_single'), kx=ev('ev_revisit_y1_kexin');
  check('1. 併桌版、單身版都在（可昕版照舊）',!!noo&&!!sgl&&!!kx);
  if(!noo||!sgl){ console.log('FAILED '+fails); process.exit(1); }
  const RD=STORY.revisitDay();
  const at=(flags,group,zone)=>{ fresh(RD,18.2,zone||'cafe',flags||{}); if(group) PHONE.join(G,'noodle_team','麵店團'); };
  at({},true,'noodle'); check('2. 沒交往、在麵店團：人在阿鳳麵店＝麵店群戲（AA_209 第 3 節；不是單身版、不是可昕版）',EVENTS.check(noo)&&!EVENTS.check(sgl)&&!EVENTS.check(kx)); at({},true); check('2. 麵店團在兩點半 Café：不開始（群戲在麵店）',!EVENTS.check(noo));
  at({},false); check('2. 沒交往、不在麵店團：單身版',!EVENTS.check(noo)&&EVENTS.check(sgl));
  at({dating_kexin:true},true); check('2. 交往中：可昕版（另外兩個都不開始）',EVENTS.check(kx)&&!EVENTS.check(noo)&&!EVENTS.check(sgl));
  fresh(RD-1,18.2,'noodle',{}); PHONE.join(G,'noodle_team','麵店團'); check('2. 前一天不開始',!EVENTS.check(noo));
  at({},true,'noodle'); G.hour=17.5; check('2. 18:00 以前不開始',!EVENTS.check(noo));
  /* 群組揪人、目標 */
  fresh(RD,16,'campus',{}); PHONE.join(G,'noodle_team','麵店團'); let goal=null; const sg=GM.setGoal; GM.setGoal=t=>{ goal=t; }; run(16,17.5,0.1); GM.setGoal=sg;
  const zm=G.msgs.filter(m=>m.tag==='zhe_revisit1');
  check('3. 麵店團：17:00 阿哲在群組「學期最後一天。麵店，六點，併桌。」；目標 18:00 阿鳳麵店',zm.length===1&&zm[0].text==='學期最後一天。麵店，六點，併桌。'&&zm[0].th==='g:noodle_team'&&Math.abs(zm[0].h-17)<0.11&&goal==='18:00 阿鳳麵店（麵店團併桌）',JSON.stringify({zm:zm.map(m=>[m.h,m.text]),goal}));
  fresh(RD,16,'campus',{}); goal=null; GM.setGoal=t=>{ goal=t; }; run(16,17,0.1); GM.setGoal=sg; check('3. 不在麵店團：沒有群組訊息，目標提醒傍晚去兩點半',!G.msgs.some(m=>m.tag==='zhe_revisit1')&&goal==='18:00 兩點半 Café（學期最後一天）',goal);
  /* 併桌的對話 */
  const noodle=async(setup,pk)=>{ at({},true,'noodle'); if(setup) setup(); picks=pk||[]; await EVENTS.run(noo); return lines(); };
  let L=await noodle(()=>{ meet('classmate_bohan'); meet('heroine_03'); },['我的']);
  check('4. AA_209 第 3 節群戲：開場旁白、阿哲「欸暑假誰在臺北？…」、小語兩句、柏翰「成績二十九號才出來。」、語彤「誰的乾麵？」；沒有「這一年最意外」',L[0]==='（期末最後一科考完。長桌已經併好了，阿姨多送了一盤小菜。）'&&L[1]==='阿哲：欸暑假誰在臺北？我七月一號就回高雄了。'&&L.some(l=>/：成績二十九號才出來。$/.test(l))&&L.some(l=>/：誰的乾麵？$/.test(l))&&!L.some(l=>/最意外/.test(l)),JSON.stringify(L));
  check('4. 選「我的。」→（她把碗放下，又回廚房了。）；最後一句旁白「後來大家又坐了快一個小時…」',L.includes('（她把碗放下，又回廚房了。）')&&L[L.length-1]==='（後來大家又坐了快一個小時。阿姨收碗的時候，桌上還剩半盤豆干。）',JSON.stringify(L.slice(-3)));
  check('4. 記 REVISIT_Y1 {who:noodle_team, pick:none}、REVISIT_Y1_PICK＝none（8 個回憶選項拿掉）',G.flags.REVISIT_Y1&&G.flags.REVISIT_Y1.who==='noodle_team'&&G.flags.REVISIT_Y1.pick==='none'&&G.flags.REVISIT_Y1_PICK==='none',JSON.stringify(G.flags.REVISIT_Y1));
  check('4. 不認識以安、芯慈、沛珊：她們的句子和旁白都沒有',!L.some(l=>/民總再讀一次|事務所|芯慈|沛珊/.test(l)));
  L=await noodle(()=>{ meet('classmate_bohan'); meet('heroine_03'); meet('heroine_01'); meet('classmate_xinci'); meet('classmate_peishan'); },['暑假應該都在臺北']);
  check('4. 認識以安、芯慈、沛珊：以安「我暑假想把民總再讀一次。」＋小語接、芯慈兩句＋先走、沛珊挑蔥旁白；選「我暑假應該都在臺北。」→ 阿哲「好，那暑假麵店就靠你了。」',L.some(l=>/：我暑假想把民總再讀一次。$/.test(l))&&L.includes('小語：妳考完第一天就講這個喔。')&&L.some(l=>/：我爸問我暑假要不要去事務所幫忙。我還沒回他。$/.test(l))&&L.includes('（沛珊坐在柏翰旁邊，把他碗裡的蔥挑到自己碗裡。）')&&L.some(l=>/：我先走了，明天要早起。成績出來再傳群組。$/.test(l))&&L.includes('阿哲：好，那暑假麵店就靠你了。'),JSON.stringify(L));
  /* 單身：最親近的人 */
  const RC=()=>STORY.revisitClosest(G);
  fresh(RD,18.2,'cafe',{}); meet('classmate_bohan'); R('classmate_bohan',45,30); meet('kai'); R('kai',25);
  check('5. 最親近的人：先看階段（柏翰朋友 > 阿凱有點熟）',RC().id==='classmate_bohan'&&RC().kind==='male',JSON.stringify(RC()));
  R('kai',50,30); check('5. 同一階段看熟悉（阿凱 50 > 柏翰 45）',RC().id==='kai',JSON.stringify(RC()));
  meet('heroine_05'); R('heroine_05',65,50,45); meet('classmate_peishan'); R('classmate_peishan',65,50,45);
  check('5. 學姊、沛珊這時有伴侶，不算（就算比較熟）',RC().id==='kai',JSON.stringify(RC()));
  meet('heroine_02'); R('heroine_02',65,50,45); check('5. 女生沒有聯絡方式＝不算（她是傳訊息）',RC().id==='kai',JSON.stringify(RC()));
  G.contacts.heroine_02=RD-30; check('5. 有聯絡方式的芷若（好朋友）＝最親近、女生',RC().id==='heroine_02'&&RC().kind==='female',JSON.stringify(RC()));
  fresh(RD,18.2,'cafe',{}); meet('kai'); R('kai',15); check('5. 都還不到有點熟＝一個人（筆記本）',RC().kind==='none'&&!RC().id,JSON.stringify(RC()));
  /* 男生的台詞 */
  const single=async(setup,pk)=>{ fresh(RD,18.2,'cafe',{}); if(setup) setup(); picks=pk||[]; await EVENTS.run(sgl); return lines(); };
  L=await single(()=>{ meet('classmate_bohan'); R('classmate_bohan',45,30); },['每天都差不多']);
  check('6. 柏翰：題目 → 選項 →「我最意外的是……」「（推了一下眼鏡）這一題，沒有考古題。」；記 REVISIT_Y1.who＝柏翰',L[0]==='這一年，你最意外的一件事是什麼？'&&L.slice(-2).join('|')==='許柏翰：我最意外的是……|許柏翰：（推了一下眼鏡）這一題，沒有考古題。'&&G.flags.REVISIT_Y1.who==='classmate_bohan'&&G.flags.REVISIT_Y1.pick==='daily',JSON.stringify({L,R:G.flags.REVISIT_Y1}));
  L=await single(()=>{ meet('kai'); R('kai',45,30); });
  check('6. 阿凱還不到好朋友：膠帶那三句',L.slice(-3).map(l=>l.replace(/^[^：]*：/,'')).join('|')==='我最意外的是……那條膠帶。|我寫了『無條件入境』，結果是我一直在出境。|……去你那邊拿零食。',JSON.stringify(L));
  L=await single(()=>{ meet('kai'); R('kai',65,50,45); });
  check('6. 阿凱好朋友：「膠帶是我自己撕的。」「本來以為會貼四年。」',L.slice(-2).map(l=>l.replace(/^[^：]*：/,'')).join('|')==='我最意外的是……膠帶是我自己撕的。|本來以為會貼四年。',JSON.stringify(L));
  L=await single(()=>{ meet('classmate_mingxuan'); R('classmate_mingxuan',45,30); });
  check('6. 明軒三句',L.slice(-3).map(l=>l.replace(/^[^：]*：/,'')).join('|')==='哈哈，我最意外的是……|我第一次走進一家店，沒有先算 CP 值。|……就是這裡。',JSON.stringify(L));
  L=await single(()=>{ meet('npc_fangyt'); R('npc_fangyt',45,30); });
  check('6. 方奕廷兩句',L.slice(-2).map(l=>l.replace(/^[^：]*：/,'')).join('|')==='我最意外的是……你的黃金葛長得比我的好。|……我回去查了原因。是窗戶的方向。',JSON.stringify(L));
  /* 女生：18:00 的訊息、一個人坐窗邊 */
  const msgs=(setup)=>{ fresh(RD,17,'campus',{}); if(setup) setup(); run(17,18.3,0.1); return G.msgs.filter(m=>m.tag==='revisit1_msg').map(m=>m.text); };
  let M=msgs(()=>{ meet('heroine_02'); R('heroine_02',45,30); G.contacts.heroine_02=RD-30; SOCIAL.remember('heroine_02','SHARED_SECRET',''); });
  check('7. 芷若（有 SHARED_SECRET）18:00 的三則',JSON.stringify(M)===JSON.stringify(['期末辛苦了。','我今年最意外的事：我把交換的申請表印出來了。','還沒交。……可是印出來了。']),JSON.stringify(M));
  M=msgs(()=>{ meet('heroine_02'); R('heroine_02',45,30); G.contacts.heroine_02=RD-30; });
  check('7. 芷若（沒有）：「我媽學會用貼圖了」那三則（不提飲料、不提交換）',JSON.stringify(M)===JSON.stringify(['期末辛苦了。','我今年最意外的事：我媽學會用貼圖了。','她傳的第一張，是一隻戴眼鏡的貓。'])&&!/可可|濃縮|交換/.test(M.join('')),JSON.stringify(M));
  const zq=(...tags)=>msgs(()=>{ meet('heroine_04'); R('heroine_04',45,30); G.contacts.heroine_04=RD-30; for(const t of tags) SOCIAL.remember('heroine_04',t,''); });
  check('7. 子晴 PLAYTESTED',JSON.stringify(zq('PLAYTESTED','CONTEST_DAY'))===JSON.stringify(['最意外的事：我把還沒做完的東西給人看了。','而且我沒有死掉。']));
  check('7. 子晴 CONTEST_DAY（沒有 PLAYTESTED）',JSON.stringify(zq('CONTEST_DAY'))===JSON.stringify(['最意外的事：比賽那天我沒去，天沒有塌。','第四罐的錢我不還。']));
  check('7. 子晴兩個都沒有',JSON.stringify(zq())===JSON.stringify(['最意外的事：法律系的人，比我想的好玩。','一點點。']));
  M=msgs(()=>{ meet('classmate_bohan'); R('classmate_bohan',45,30); }); check('7. 最親近的是男生：沒有訊息',M.length===0);
  L=await single(()=>{ meet('heroine_04'); R('heroine_04',45,30); G.contacts.heroine_04=RD-30; });
  check('7. 女生的版本在 Café：你一個人坐在窗邊 → 題目 → 選項（沒有她在場的台詞）',L[0]==='你一個人坐在窗邊。'&&L[1]==='這一年，你最意外的一件事是什麼？'&&L.length===2&&G.flags.REVISIT_Y1.who==='heroine_04',JSON.stringify({L,R:G.flags.REVISIT_Y1}));
  /* AA 的人物（AA 2100018） */
  L=await single(()=>{ meet('zhe'); R('zhe',45,30); });
  check('9. 阿哲（單身、不在麵店團、最親近）兩句',L.slice(-2).map(l=>l.replace(/^[^：]*：/,'')).join('|')==='我最意外的喔……|我以為大學很難交朋友。結果一個學期，我認識了一整間麵店。'&&G.flags.REVISIT_Y1.who==='zhe',JSON.stringify(L));
  const fm=id=>msgs(()=>{ meet(id); R(id,45,30); G.contacts[id]=RD-30; });
  check('9. 以安 18:00（AA_209 第 3 節）：「考完了。民總我暑假想再讀一次。」',JSON.stringify(fm('heroine_01'))===JSON.stringify(['考完了。民總我暑假想再讀一次。']));
  check('9. 語彤「考完了喔。阿姨說今天滷了一大鍋。」',JSON.stringify(fm('heroine_03'))===JSON.stringify(['考完了喔。阿姨說今天滷了一大鍋。']));
  check('9. 小語（這時還單身，算數）「考完了！！！」「暑假要約喔」',JSON.stringify(fm('yu'))===JSON.stringify(['考完了！！！','暑假要約喔']));
  check('9. 芯慈「成績要二十九號才出來，好久。」',JSON.stringify(fm('classmate_xinci'))===JSON.stringify(['成績要二十九號才出來，好久。']));
  L=await single(null);
  check('8. 都不到有點熟：一個人、筆記本 → 題目 → 選項 →「這張桌子，從今天開始是你的位子。」；記 who:alone',JSON.stringify(L)===JSON.stringify(['你一個人坐在窗邊。','你在筆記本上寫了一行。','這一年，你最意外的一件事是什麼？','這張桌子，從今天開始是你的位子。'])&&G.flags.REVISIT_Y1.who==='alone',JSON.stringify({L,R:G.flags.REVISIT_Y1}));
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();
