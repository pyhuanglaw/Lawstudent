// 宿營改稿（AA 11-03 改稿表）：宿營只認識阿哲（第八小隊）、芯慈、沛珊（第七小隊）；Kevin、明軒、柏翰、Alison 不在宿營。
//   1 8/21 小隊名單＝旁白一句、不列名字  2 8/24 小隊合照：芯慈兩句、沛珊一句，沒有 Kevin、明軒、阿哲「29 號見」
//   3 8/30 家族群組：去過宿營的也沒有「臥底那一隊」「騙了自己家的學弟三天」  4 9/2 茶會、9/4 家族群組、8/29 搬宿舍的新句（原始碼裡沒有舊字串）
//   5 系籃：名片場認識明軒的不再自我介紹、照樣「欸，你也來打球喔？」  6 人物頁「怎麼認識」三行；遊覽車、Alison、明軒宿營那幾行拿掉  7 典禮座位名單
// 修改前全部 FAIL。用法：node tests/camp_era_lines_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:'?start1'};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|CAMP_Y1_EVENTS|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|ACTIVITIES|REL_LINES|SUP497|SUP497_LINES|WHOIS)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/activities.js','src/data/characters.js','src/data/events.js','src/data/camp_y1.js','src/data/rel_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/story3d.js']) load(f);
for(const f of ['src/data/sup497_lines.js','src/sup497_3d.js','src/whois3d.js']) load(f);
global.ADV={active:false,preload(){},begin(){ this.active=true; },end(){ this.active=false; },log(){},speaker(){},setBg(){},hide(){},show(){},slots:{}}; global.CHAR={setExpr(){}};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
let G=null, said=[], picks=[], optsSeen=[];
const P={busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0};
const GM={get G(){ return G; },E:{q:{level:'medium'},player:P,zone:{roomAt:()=>null,seats:[]},npcs:[],extras:[],interactables:[{deskStudy:true,seat:{x:1.8,z:-1.9,yaw:Math.PI}}],levels:null,setWeather(){},endCinematic(){},cam:{distTarget:0}},D:{active:false,busyDepth:0},npc:{},
  advance(h){ G.hour+=h; },sitAt(){},standUp(){},rel(){},sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},energy(){},money(){},setGoal(g){ G.goal=g; },toast(){},updateHUD(){},letterbox(){},fade:()=>Promise.resolve(),titleCard:async()=>{},
  say:async(who,t)=>{ said.push(typeof who==='string'?who+'：'+t:(who&&who.name?who.name+'：'+t:t)); },
  choose:async opts=>{ optsSeen.push(opts.map(o=>o.t).join('/')); const want=picks.shift(); if(want==null) return 0; const k=opts.findIndex(o=>o.t.indexOf(want)>=0); return k<0?0:k; },
  enter:async(z)=>{ G.zone=z; }, spawnNPC(){ return null; }, spawnCharacter(){ return null; }};
const fresh=()=>{ G={day:1,weekday:3,hour:21.2,zone:'dorm',stage:'law',name:'祐廷',money:22000,flags:{},choices:{},events:{done:{},last:{},count:0},rel:{},social:null,msgs:[],goal:''};
  SOCIAL.bind(G); EVENTS.bind(GM); if(INV.bind) INV.bind(G); said=[]; picks=[]; optsSeen=[]; };

const at=(k,h,o)=>{ G.day=day(k); G.weekday=CALENDAR.dateOf(G.day).wd%7; G.hour=h; Object.assign(G.flags,{MAIN_D1:STORY.MAIN_D1_NEW,LAW_START_DAY:day('2025-08-29'),KAI_MOVEIN:true,MET_KAI:true},o||{}); };
const J=JSON.stringify, day=k=>STORY.dayOfKey(k), ev=id=>STORY_EVENTS.find(e=>e.id===id);

(async()=>{
  // ---------- 1、2 宿營的手機群組 ----------
  fresh(); const d0=day('2025-08-22'); G.day=d0-10; G.hour=8; STORY.campGroups(G,d0); if(!PHONE.inGroup(G,'camp_squad_y1')) PHONE.join(G,'camp_squad_y1','第七小隊');
  G.day=d0+8; G.hour=23; PHONE.tick(G);
  const NEW=PHONE.thread(G,'g:law_new'), SQ=PHONE.thread(G,'g:camp_squad_y1'), r821=NEW.find(m=>m.day===d0-1);
  check('1. 8/21 21:00 小隊名單＝旁白「（小隊名單貼出來了。第七小隊七個人，你認得的只有自己的名字。）」（沒有 from）',!!r821&&r821.text==='（小隊名單貼出來了。第七小隊七個人，你認得的只有自己的名字。）'&&!r821.from,JSON.stringify(r821));
  check('1. 新生群組不列名字（沒有張哲維、吳芯慈、郭沛珊、江明軒、許柏翰、凱文、玩家名字）',!NEW.some(m=>/張哲維|吳芯慈|郭沛珊|江明軒|許柏翰|凱文|祐廷/.test(m.text)),NEW.map(m=>m.text).join(' | '));
  const ph=SQ.filter(m=>m.day===d0+2).map(m=>(m.from||'')+':'+m.text);
  check('2. 8/24 21:00 小隊合照：芯慈「📷（小隊合照）」「宿營辛苦了。」、沛珊「我只有半張臉在裡面」',J(ph)===J(['classmate_xinci:📷（小隊合照）','classmate_xinci:宿營辛苦了。','classmate_peishan:我只有半張臉在裡面']),J(ph));
  check('2. 小隊群組沒有 Kevin、明軒、凱文、「29 號見」、睡在車上的照片',!SQ.some(m=>m.from==='kevin'||m.from==='classmate_mingxuan'||/Kevin|凱文|29 號見|睡在車上|叫學長/.test(m.text)),SQ.map(m=>m.text).join(' | '));
  // ---------- 3 家族群組 ----------
  fresh(); G.flags.CAMP_Y1=true; STORY.familyW0(G,{now:true}); const FM=PHONE.thread(G,'g:family_law').map(m=>m.text);
  check('3. 去過宿營（CAMP_Y1）的家族群組：沒有「臥底那一隊」「騙了自己家的學弟三天」；「有進來的舉個手，考古題茶會那天給你們。」',!FM.some(t=>/臥底|騙了自己家/.test(t))&&FM.includes('有進來的舉個手，考古題茶會那天給你們。'),J(FM));
  // ---------- 4 原始碼：茶會、9/4 家族群組、8/29 搬宿舍 ----------
  const S3=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'), code=S3.replace(/\/\*[\s\S]*?\*\//g,'');
  check('4. 9/2 茶會 Kevin（去過宿營）：「我 Kevin，大二，系學會的。有事找我。」；沒有「這次是真的學長了」',code.includes("KV('我 Kevin，大二，系學會的。有事找我。')")&&!/這次是真的學長/.test(code));
  check('4. 9/4 家族群組 Kevin：「家族群組開好了。學弟。」；沒有「這次不用臥底了」',code.includes("KV('家族群組開好了。學弟。')")&&!/不用臥底/.test(code));
  check('4. 8/29 搬宿舍：柏翰「（從書裡抬頭）你也住這間？」→「許柏翰。新竹。」；阿哲「欸？撕名牌那個！你也住這間喔？」；沒有「只差一個明軒」「明軒住別棟」「喔，是你。」「你也這間喔！」',
    /GM\.say\(bo,'（從書裡抬頭）你也住這間？'\);[^\n]*GM\.say\(bo,'許柏翰。新竹。'\)/.test(code)&&code.includes("GM.say(zhe,'欸？撕名牌那個！你也住這間喔？')")&&!/只差一個明軒|明軒住別棟|喔，是你。'|你也這間喔！/.test(code));
  // ---------- 5 系籃 ----------
  for(const [nm,setup,wantIntro] of [['名片場認識（FRIEND_CARD_classmate_mingxuan）、去過宿營',()=>{ G.flags.FRIEND_CARD_classmate_mingxuan=true; G.flags.CAMP_Y1=true; },false],['名片場認識、沒去宿營',()=>{ G.flags.FRIEND_CARD_classmate_mingxuan=true; },false],['都沒見過（防呆）',()=>{},true]]){
    fresh(); setup(); said=[]; await EVENTS.run(ev('ev_mingxuan_ball')); const intro=said.includes('明軒：江明軒。阿哲的隊友。他說你們同班。');
    check('5. 系籃 '+nm+'：'+(wantIntro?'自我介紹照舊':'不再自我介紹、照樣「欸，你也來打球喔？」'),intro===wantIntro&&(wantIntro||said.includes('明軒：欸，你也來打球喔？')),said.slice(0,3).join(' / ')); }
  // ---------- 6 人物頁 ----------
  fresh(); G.day=day('2025-09-10'); for(const id of ['zhe','classmate_xinci','classmate_peishan']) SOCIAL.meet(id,'camp'); G.flags.CAMP_BUS='win';
  const L=id=>WHOIS.lines(G,id);
  check('6. 阿哲：「宿營撕名牌，撕掉你名牌的那個。」',L('zhe').includes('宿營撕名牌，撕掉你名牌的那個。')&&!L('zhe').some(t=>/遊覽車|宿營同一小隊/.test(t)),J(L('zhe')));
  check('6. 芯慈：「宿營自由時間找你打牌。」',L('classmate_xinci').includes('宿營自由時間找你打牌。')&&!L('classmate_xinci').includes('宿營同一小隊。'),J(L('classmate_xinci')));
  check('6. 沛珊：「宿營第二天晚上才到，坐你旁邊。」',L('classmate_peishan').includes('宿營第二天晚上才到，坐你旁邊。'),J(L('classmate_peishan')));
  G.flags.CAMP_BUS='mx'; G.flags.CAMP_SEEN=['yu']; G.flags.met_yu=true; SOCIAL.meet('classmate_mingxuan','camp');
  check('6. 遊覽車、Alison 宿營、明軒宿營那幾行拿掉（舊旗標也不顯示）',!L('classmate_mingxuan').some(t=>/遊覽車|宿營同一小隊/.test(t))&&!L('yu').some(t=>/宿營|帶隊呼/.test(t)),J([L('classmate_mingxuan'),L('yu')]));
  // ---------- 7 典禮座位 ----------
  const GC=fs.readFileSync(path.join(ROOT,'src/gymcer3d.js'),'utf8'), fr=(GC.match(/S\.FRIENDS=(\[[^;]*\]);/)||[])[1];
  check('7. 開學典禮坐旁邊的（宿營認識的）：阿哲、芯慈、沛珊；沒有 yu（Alison）、以安',!!fr&&/'zhe'/.test(fr)&&/'classmate_xinci'/.test(fr)&&/'classmate_peishan'/.test(fr)&&!/'yu'|heroine_01/.test(fr),fr);
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
