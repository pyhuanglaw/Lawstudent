// AA_524 說了沒發生（一）：以安 14、芷若 11、語彤 9 條（企劃線 8fd10848d，AA-C 2026-10-28；任務 HEROINE-LIFE-1028，USER_WANTS X122★）——不需要瀏覽器。
// 做法照 AA_356：之後已有的場合補一兩句、沒有場合改原句、玩家選項先補旗標。新的台詞逐字對稿（每一句都要在 git show 8fd10848d 的稿裡），舊的句子不能留在 src/。
// 能模擬的都實際跑：事件（EVENTS.run）、閒聊階梯（STORY.ladPlay／ladLines）、手機規則（STORY.phoneRules＋PHONE.tick、PHONE.answer）、學期末的飯（TERMEND 的私訊→出遊→TERMEND.dinner、walkHome）、
// 約會（DATE.arriveLine／spotLine／closeLine）、動態（FEED）、麵店門口（NOODLE_CLOSED.door）、點餐（STORY.interact eat noodle）、明信片（R2Y4A.pc2Scene）、自由出行的回聲（ENC.schoolLine）。
//   0  讀稿、白名單、新檔、index.html 順序；新句都在稿裡；舊句不在 src/
//   A1～A14 以安、Z1～Z11 芷若、Y1～Y9 語彤（各節的編號照稿）
//   99 舊存檔：沒有新旗標照常跑、不丟例外、不重發
// 修改前（開發分支 6cee635ed，乾淨 worktree）：FAIL（沒有 src/aa524_3d.js、新句不在、舊句還在）；修改後 ALL PASS。用法：node tests/aa524_promises_unit.js
'use strict';
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify;
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
/* index.html 的順序載入其餘的檔（同 tests/aa523_sis_b16_unit.js：pg_harness 已經載過的不再載；畫 3D 的幾支在 Node 載不進來，跳過）*/
const PG_FILES=new Set(['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js',
  'src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/data/syllabus.js','src/data/exam_bank.js','src/data/legal_qbank.js','src/classes3d.js','src/data/postgrad_lines.js','src/postgrad3d.js']);
const SKIP=new Set(['src/character3d.js','src/engine3d.js','src/townkit3d.js','src/zones3d.js','src/bike3d.js','src/adv3d.js']);
const loadErr=[];
const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
{ const files=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>f.startsWith('src/')&&!PG_FILES.has(f)&&!SKIP.has(f));
  for(const f of files){ try{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }catch(e){ loadErr.push(f+'：'+String(e.message).slice(0,120)); } } }
GM.toast=()=>{}; GM.caption=()=>{}; GM.money=function(n){ H.G.money=(H.G.money|0)+n; }; GM.studySession=async()=>{}; GM.spawnNPC=()=>null; GM.spawnCharacter=()=>null; GM.phoneBadge=()=>{}; GM.quickGo=async()=>{};
if(typeof HOME!=='undefined') HOME.phoneRules=()=>{};   /* 家人群組的週訊息和這裡無關 */
const AN='heroine_01', ZR='heroine_02', YT='heroine_03';
const X=()=>typeof AA524!=='undefined'?AA524:null;
const D=k=>typeof k==='number'?k:STORY.dayOfKey(k), T=(d,h)=>d*24+h, keyOf=d=>CALENDAR.dateOf(d).key;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const said=()=>H.said.map(x=>x.t), has=t=>H.said.some(x=>x.t===t), idx=t=>H.said.findIndex(x=>x.t===t);
const seq=a=>a.every((t,i)=>idx(t)>=0&&(i===0||idx(t)>idx(a[i-1])));
const adj=a=>{ const i=idx(a[0]); return i>=0&&a.every((t,k)=>H.said[i+k]&&H.said[i+k].t===t); };   /* 連在一起、照順序 */
const ev=id=>STORY_EVENTS.find(e=>e.id===id)||null;
const TH=th=>(H.G.msgs||[]).filter(m=>m.th===th), txt=th=>TH(th).map(m=>m.text), byTag=tag=>(H.G.msgs||[]).filter(m=>m.tag===tag);
const fresh=(key,h,flags,o)=>{ o=o||{}; const G=H.fresh(typeof key==='number'?keyOf(key):key,h,o.zone||'dorm',Object.assign({EXCHANGE_ROUTE:o.route||'TW',EXCH_RULE:1,introDone:true,afternoonDone:true,classDone:true,metAn:true,MET_ZHE:true,ROOM_Y2:true,ROOM_Y3:true},flags||{}));
  G.outings=[]; G.acts={att:{}}; G.msgs=G.msgs||[]; G.contacts=G.contacts||{}; G.invites=[]; PHONE.rec(G);
  E.player.busy=false; E.paused=false; E.player.lv=0; E.player.seat=null; E.player.obj.position.x=0; E.player.obj.position.z=0; E.npcs.length=0; GM.npc={}; ADV.active=false;
  if(typeof SUP497!=='undefined'&&SUP497.bind) SUP497.bind(GM); if(STORY._bindGM) STORY._bindGM(GM); H.at(typeof key==='number'?keyOf(key):key,h); return G; };
const at=(key,h)=>{ H.at(typeof key==='number'?keyOf(key):key,h); };
const ph=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const phAt=(key,h)=>{ at(key,h); ph(); };
const contact=id=>{ if(typeof INV!=='undefined'&&INV.addContact) INV.addContact(H.G,id); H.G.contacts[id]=1; };
const runEv=async(id,picks)=>{ H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); const e=ev(id); if(!e) throw new Error('沒有事件 '+id); await EVENTS.run(e); };
const step=(term,cid,sid)=>{ const c=(LADDER.byTerm[term]||{})[cid]; return c&&c.steps?c.steps.find(s=>s.id===sid)||null:null; };
const ladPlay=async(term,cid,sid,picks)=>{ const st=step(term,cid,sid); if(!st) throw new Error('沒有 '+term+' '+cid+' '+sid); H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); await STORY.ladPlay(GM,{name:SOCIAL.displayName(cid),charId:cid},cid,st); return st; };
const answer=(id,k)=>PHONE.answer(H.G,id,k);
const mem=(id,tag)=>SOCIAL.has(id,tag);
const trip=(who,loc,o)=>Object.assign({who,locs:[loc],day:H.G.day,by:'player',transport:'mrt',kind:'day'},o||{});
const spot=async(who,loc,pid,visits,picks)=>{ H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); return DATE.spotLine(GM,trip(who,loc),pid,visits); };

/* ---------- 讀稿 ---------- */
const SHA='8fd10848d', DOCF='docs/story_planning/AA_524_說了沒發生_以安芷若語彤.md';
let DOC=''; try{ DOC=cp.execSync('git -c core.quotepath=false show '+SHA+':"'+DOCF+'"',{cwd:process.env.AA524_DOCREPO||H.ROOT,encoding:'utf8',maxBuffer:1<<24}); }catch(e){ DOC=''; }
/* 新句（照稿逐字；每一句都要在稿裡）*/
const NEW={
  A1:['（以安把菜單推到你面前，指甲在「滷蛋」那一格敲了兩下。）','說好的。'],
  A2:['（把手帳翻到園區那一天）上次沒給你看的那一行。','（理由欄寫著：「想到{name}。」）'],
  A3:['寒假東京那兩個禮拜，時差一個小時。……你那邊比較早，我知道。','京都那三個禮拜，訊息你不用每天回。……我有空才傳。'],
  A4:['（她從背包拿出一個保鮮盒。）','番茄炒蛋。練好了。……冷了，你自己熱。'],
  A5:['這份我學到很多。','說從她的報告學到很多'],
  A6:['考完了。……你說過要請的。','（她點了菜單上最便宜的那一個。）'],
  A7:['好。……櫻花下週就謝了。我拍給你。'],
  A8:['夜景很好看。……另一個原因，我不說。'],
  A9:['……台中的夕陽在海邊。很遠，要開車。','……最南邊。好遠。','你上次說要去最南邊。……我查過了，坐車要六個小時。'],
  A10:['不用。我爸會來。……謝謝。'],
  A11:['讀書會在山上的茶館，一個月一次。','我們讀到七點。……你不用等，先下山。'],
  A12:['第三課的單字，你自己背。'],
  A13:['哪一家？……看起來比麵店的辣。','看起來好好吃'],
  A14:['考卷發回來你先對。不懂的問我。','例如？……你講。我聽十五分鐘。'],
  Z1:['（把筆電轉過去，螢幕上是一部片的片頭）……我排的那部。','機票太貴了，你不用來。我們一人一邊，按同一個播放。','（你們隔著視訊看完一部片。她那邊下午，你這邊半夜。）','……好。看過了。'],
  Z2:['好，你贏了。林芷若，外文系的。……你們法律系，有人看老片嗎？陪審團吵一整晚的那種。','問你看不看老片'],
  Z3:['明天早場。九點十分。','你說過你起得來。','我去。','好。','起不來。','我就知道。','兩張早場電影的票根，片名《冬天以前的港口》','你中間睡著了十分鐘。我有看到。'],
  Z4:['你上學期問我，經原那學期怎麼了。……就是這個。'],
  Z5:['（她買的票是倒數第三排。）','說好的。'],
  Z6:['回來了。','台中帶來的行李，比我去的時候重。'],
  Z7:['……你又不在台中。……好啦，這張直接給你。','我自己寫。你不准看。','上次你說要請。……老闆，兩份，他付。','……你會做什麼？……算了，你先學。'],
  Z8:['（放的是海報上那一部。）','第五次。'],
  Z9:['（背面只寫了一行：「寫了三次才寄。」）'],
  Z10:['上次說的一半。我媽這次寄了一整罐。……分你。','不行。牠已經很胖了。'],
  Z11:['上次那部片。……結局我猜錯了。'],
  Y1:['我媽問你寒假要不要來吃年菜。……我說你要回家過年。','我媽問你暑假要不要來吃飯。……我說你暑假很忙。','我媽又問年菜了。……我說再等等。','問了好幾年，終於看到人了。'],
  Y2:['說好一起看的。','……我開視訊。','（畫面裡是她家的窗戶。遠處的煙火很小，聲音晚了一秒才傳過來。）','這樣算一起嗎。','算。','……嗯。','不算。','我知道。'],
  Y3:['店休。……說好要出去的。','刷完這一排就走。','（刷完椅子，你們去河濱走了一圈。）'],
  Y4:['（指了一下對岸）去年想帶你去的地方，在那邊。','山坡上那一排房子。','……今年從這裡看就好。'],
  Y5:['今天我顧到打烊。','我過去。','今天不行。','嗯。','（你到的時候，她在拉鐵門。阿姨在裡面算錢。）','……你真的來了。'],
  Y6:['期中那幾天，我找到一個沒有客人的地方了。……不告訴你。'],
  Y7:['美國那兩個 阿姨說照片也算'],
  Y8:['（阿姨把一顆滷蛋放進你的碗裡。）','生日那天說的。'],
  Y9:['（這次她先去付了錢。）'] };
/* 舊句（換掉的；src/ 的任何地方都不能再有。D18 那一句只換「我寫好再給你看。」那一段）*/
const OLD=['寒假東京那兩個禮拜，我晚上十點打給你。','我每天都會傳。','「下次也一起寫。」','「下次一起寫。」','約好下次一起寫報告','好。那下週。','另一個原因，下次再說。','好。我帶你去。高美濕地那邊。',
  '……好。我寫進手帳了。','上次說要去最南邊。……還在手帳上。','下次讀書會你要不要來旁聽？時間我再傳給你。','七點我下山。你等我，我們一起搭纜車。','考第三課的單字。全部。','哪一家？開學那週去吃。','牛肉麵！！開學帶我們去',
  '那下禮拜找一天一起對考卷吧。','例如？……你下禮拜來講，我給你十五分鐘。','要不要一起修下學期的「法律與電影」','邀你修法律與電影','不行。牠已經很胖了。……小罐的可以。','……你又不在台中。好，寄給你。','我寫好再給你看。',
  '……你會做什麼？好，我期待一下。','我媽問你寒假要不要來吃年菜。……我說我問問看。','我媽問你暑假要不要來吃飯。……我說我問問看。','期中那幾天，我找到一個沒有客人的地方了。你要的話，我帶你去。','美國那兩個 下次補吃'];
const srcAll=(()=>{ const out=[]; const walk=d=>{ for(const n of fs.readdirSync(d)){ const p=path.join(d,n), st=fs.statSync(p); if(st.isDirectory()) walk(p); else if(/\.js$/.test(n)) out.push([path.relative(H.ROOT,p),fs.readFileSync(p,'utf8')]); } }; walk(path.join(H.ROOT,'src')); return out; })();

(async()=>{
/* ---------------- 0 ---------------- */
await sec(0,()=>{
  check('0. 讀得到稿（AA_524 '+SHA+'：第 1～5 節；A1～A14、Z1～Z11、Y1～Y9）',DOC.length>8000&&/### A14/.test(DOC)&&/### Z11/.test(DOC)&&/### Y9/.test(DOC),String(DOC.length));
  const miss=[]; for(const k in NEW) for(const t of NEW[k]) if(DOC.indexOf(t)<0) miss.push(k+'：'+t);
  check('0. 這支測試對的新句每一句都在稿裡（逐字；'+Object.values(NEW).reduce((a,b)=>a+b.length,0)+' 句）',DOC.length>0&&!miss.length,J(miss));
  const A=JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files.filter(e=>/AA_524_/.test(e.path));
  check('0. 劇情匯入白名單有 AA_524（sha '+SHA+'、approved、HEROINE-LIFE-1028）',A.length===1&&A[0].sha===SHA&&A[0].status==='approved'&&A[0].task==='HEROINE-LIFE-1028',J(A.map(e=>({sha:e.sha,status:e.status,task:e.task}))));
  check('0. 新檔載得到（AA524）；全部的檔載入沒有錯誤',!loadErr.length&&!!X(),J(loadErr));
  const a=s=>html.indexOf(s);
  check('0. index.html：sup497_3d.js → aa524_3d.js → GAME.boot()',/src\/sup497_3d\.js\?v=[^"]+"><\/script>\n<script src="src\/aa524_3d\.js\?v=[^"]+"><\/script>/.test(html)&&a('src/aa524_3d.js')>0&&a('src/aa524_3d.js')<a('<script>GAME.boot();</script>'));
  const left=[]; for(const t of OLD) for(const [f,s] of srcAll) if(s.indexOf(t)>=0) left.push(f+'：'+t);
  check('0. 換掉的舊句不在 src/（'+OLD.length+' 句）',!left.length,J(left));
  check('0. 掛上去了：STORY.ladReply、TERMEND.walkHome、DATE.arriveLine／spotLine／playSet、NOODLE_CLOSED.door、FEED.WENT.zrEarly',!!STORY._aa524Lad&&!!(TERMEND.walkHome&&TERMEND.walkHome._aa524)&&!!(DATE.arriveLine&&DATE.arriveLine._aa524)&&!!(DATE.spotLine&&DATE.spotLine._aa524)&&!!(DATE.playSet&&DATE.playSet._aa524)&&!!(NOODLE_CLOSED.door&&NOODLE_CLOSED.door._aa524)&&typeof FEED.WENT.zrEarly==='function');
});

/* ================= 以安 ================= */
await sec('A1',async()=>{
  fresh('2028-03-20',18); H.FRIEND(AN); H.FRIEND('zhe');
  await runEv('ev_an_farewell_dinner',['回來第一碗我請']);
  check('A1. 餞行選「回來第一碗我請。」→「好。我要加滷蛋。」、記 AN_FIRST_BOWL',has('好。我要加滷蛋。')&&H.G.flags.AN_FIRST_BOWL===true,J(said().slice(-3)));
  fresh('2028-03-20',18); H.FRIEND(AN); await runEv('ev_an_farewell_dinner',['一路順風']);
  check('A1. 選「一路順風。」不記',H.G.flags.AN_FIRST_BOWL==null);
  fresh('2027-12-21',12); H.FRIEND(AN); await ladPlay('Y3S1',AN,'A5-L8',['回來第一碗我請']);
  check('A1. 閒聊階梯 A5-L8 同一個選項也記 AN_FIRST_BOWL',has('好。我要加滷蛋。')&&H.G.flags.AN_FIRST_BOWL===true,J(said()));
  const r1=async(flag,yt)=>{ fresh('2028-09-07',18,flag?{AN_FIRST_BOWL:true}:{}); H.FRIEND(AN); H.FRIEND('zhe'); if(yt) H.FRIEND(YT); await runEv('ev_r1_jetlag'); };
  await r1(true,true);
  check('A1. R1「時差」（以安、語彤都在）：語彤「吃麵先。」之後兩句',adj(['吃麵先。'].concat(NEW.A1)),J(said().slice(0,16)));
  await r1(true,false);
  check('A1. 語彤不在（沒有她那幾句）：阿哲第一句「欸，你們回來了。」之後兩句',adj(['欸，你們回來了。'].concat(NEW.A1))&&!has('吃麵先。'),J(said().slice(0,6)));
  await r1(false,true);
  check('A1. 沒有 AN_FIRST_BOWL：R1 沒有這兩句',!has(NEW.A1[0])&&has('吃麵先。'));
});
await sec('A2',async()=>{
  const walk=async(picks,memo,term)=>{ fresh(term==='Y2S1'?'2027-01-12':'2025-12-20',20); H.CLOSE(AN); if(memo) SOCIAL.remember(AN,'AN_REASON_HIDDEN',''); H.said=[]; H.opts=[]; H.picks=picks.slice(); return TERMEND.walkHome(GM,AN,term||'Y1S1'); };
  const tail=NEW.A2.map(t=>t.replace('{name}','祐廷'));
  let r=await walk([0],true);
  check('A2. 以安的告白，玩家先說（yes）、有 AN_REASON_HIDDEN：最後兩句「上次沒給你看的那一行。」「（理由欄寫著：「想到祐廷。」）」',r==='yes'&&J(said().slice(-2))===J(tail)&&H.said[H.said.length-2].who===SOCIAL.displayName(AN)&&H.said[H.said.length-1].who===null,J({r,tail:said().slice(-3)}));
  r=await walk([3,0],true,'Y2S1');
  check('A2. 她先說、玩家答應（sheSaid）也有',r==='sheSaid'&&J(said().slice(-2))===J(tail),J({r,tail:said().slice(-3)}));
  r=await walk([3,1],true);
  check('A2. 「讓我想想」（think）＝沒走到告白，不補',r==='think'&&!has(tail[0]),r);
  r=await walk([0],false);
  check('A2. 沒有 AN_REASON_HIDDEN（D07 沒選「不用給我看。」）不補',r==='yes'&&!has(tail[0]),r);
  /* 記憶從哪來：心願約會 D07 選「不用給我看。」（date_wish.js）*/
  const W=JSON.stringify(typeof DATE_WISH!=='undefined'?DATE_WISH:{});
  check('A2. AN_REASON_HIDDEN 是 D07「不用給我看。」那個選項的記憶（照舊）',/"t": ?"「不用給我看。」".{0,200}AN_REASON_HIDDEN/.test(W));
});
await sec('A3',async()=>{
  const din=async(term,day)=>{ fresh(day,19); H.CLOSE(AN); H.date(AN); H.said=[]; H.picks=[]; await TERMEND.dinner(GM,{te:{term,who:AN,kind:'gf'}}); };
  await din('Y2S1',D('2027-01-15')); const a=has(NEW.A3[0]);
  await din('Y2S2',D('2027-06-20')); const b=has(NEW.A3[1]);
  check('A3. 交往中學期末約會：大二上「時差一個小時」、大二下「我有空才傳」（改原句）',a&&b,J(said()));
});
await sec('A4',async()=>{
  fresh('2026-03-02',12); H.FRIEND(AN); H.date(AN); await ladPlay('Y1S2',AN,'A2-L1',['下次做給我吃']);
  check('A4. 閒聊階梯 A2-L1 選「下次做給我吃。」＝記 AN_COOK_PROMISE（交往中那一句照舊）',H.G.flags.AN_COOK_PROMISE===true&&mem(AN,'AN2_TOMATO_EGG')&&has('練好了先煮給你吃。'),J(said()));
  const L=STORY.ladLines(step('Y2S1',AN,'A3-L8'),H.G,AN);
  check('A4. A3-L8（番茄炒蛋那一版）交往中＋有旗標：lines 後面多兩句',J(L.slice(-2))===J(NEW.A4)&&L.indexOf('我媽說這次換我煮給她吃，可是我只會番茄炒蛋。')>=0,J(L));
  ROM.end(H.G,AN,'test'); const L2=STORY.ladLines(step('Y2S1',AN,'A3-L8'),H.G,AN);
  check('A4. 沒在交往：沒有這兩句',L2.indexOf(NEW.A4[1])<0,J(L2));
  fresh('2026-03-02',12); H.FRIEND(AN); H.date(AN); await ladPlay('Y1S2',AN,'A2-L1',['學會了嗎']);
  const L3=STORY.ladLines(step('Y2S1',AN,'A3-L8'),H.G,AN);
  check('A4. 選「學會了嗎？」（沒說下次做給我吃）：沒有',!H.G.flags.AN_COOK_PROMISE&&L3.indexOf(NEW.A4[1])<0,J(L3));
});
await sec('A5',async()=>{
  for(const partner of [true,false]){ fresh('2025-10-13',10,{},{zone:'library'}); H.FRIEND(AN); H.G.choices.cafeView='C'; if(partner) SOCIAL.remember(AN,'REPORT_PARTNER','');
    await runEv('ev_an_report_feedback',[]);
    const O=H.opts.find(o=>o.some(t=>/這份我學到很多/.test(t)))||[]; const m=SOCIAL.memories(AN).find(x=>x.tag==='IMPORTANT_CONVERSATION');
    check('A5. 「報告發回來了」'+(partner?'（一起寫過）':'（沒有一起寫）')+'：選項「這份我學到很多。」、她「……嗯。」照留、記憶「說從她的報告學到很多」',O.includes('「'+NEW.A5[0]+'」')&&!O.some(t=>/下次/.test(t))&&has('……嗯。')&&!!m&&m.note===NEW.A5[1],J({O,m})); }
});
await sec('A6',async()=>{
  /* 1. 選項 → 記憶＋AN_TREAT_OWED */
  fresh('2025-10-20',12,{afternoonDone:true},{zone:'library'}); H.FRIEND(AN); H.G.choices.cafeView='A';
  await runEv('ev_an_report_followup',['下次換我請']);
  check('A6. 「報告的結論」選「下次換我請。」：記憶照舊（你說下次換你請）＋AN_TREAT_OWED',H.G.flags.AN_TREAT_OWED===true&&SOCIAL.memories(AN).some(m=>m.tag==='IMPORTANT_CONVERSATION'&&m.note==='你說下次換你請'));
  fresh('2025-10-20',12,{afternoonDone:true},{zone:'library'}); H.FRIEND(AN); await runEv('ev_an_report_followup',['改天請妳喝咖啡']);
  check('A6. 沒有咖啡廳那一天的版本選「改天請妳喝咖啡。」也記',H.G.flags.AN_TREAT_OWED===true);
  /* 2. 大一上期末飯：她的邀約（TERMEND 私訊）→ 答應 → 出遊 → 飯 */
  const term=async(o)=>{ fresh('2025-12-18',9,{},{zone:'campus'}); SOCIAL.remember(AN,'FIRST_MET',''); H.rel(AN,25,0,0); contact(AN);
    if(o.oldMem) SOCIAL.remember(AN,'IMPORTANT_CONVERSATION','你說改天請她喝咖啡'); if(o.flag) H.G.flags.AN_TREAT_OWED=true;
    H.G.termend={contact:{Y1S1:{heroine_01:{pts:9,k:{}}}},think:{}};
    for(let h=20;h<=21.01;h+=0.05){ at('2025-12-18',+h.toFixed(3)); ph(); }
    const m=(H.G.msgs||[]).find(x=>x.tag==='te_Y1S1_heroine_01'); if(!m) return {m:null};
    answer('te_Y1S1_heroine_01',0); ph(); const q=OUT.get(H.G,'te_Y1S1'); if(!q) return {m};
    at(q.day,q.h); H.said=[]; H.picks=[]; await TERMEND.dinner(GM,q); return {m,q,L:said()}; };
  let r=await term({flag:true});
  check('A6. 有 AN_TREAT_OWED：大一上期末飯她的邀約「考完了。……你說過要請的。」',!!r.m&&r.m.text===NEW.A6[0],J(r.m&&r.m.text));
  check('A6. 飯桌開場之後多一句旁白「（她點了菜單上最便宜的那一個。）」',!!r.L&&r.L.indexOf(NEW.A6[1])===1,J(r.L));
  r=await term({oldMem:true});
  check('A6. 舊存檔：只有那條記憶（沒有旗標）也算',!!r.m&&r.m.text===NEW.A6[0]&&!!r.L&&r.L.indexOf(NEW.A6[1])===1,J({t:r.m&&r.m.text,L:r.L}));
  r=await term({});
  check('A6. 沒有那兩條記憶：照原本的邀約、沒有旁白',!!r.m&&r.m.text==='考完了。要不要一起吃飯？我知道一家，八點以前人不多。'&&!!r.L&&r.L.indexOf(NEW.A6[1])<0,J({t:r.m&&r.m.text,L:r.L}));
  /* 玩家自己約她（R.picked.by player）：不演旁白 */
  fresh('2025-12-20',18,{AN_TREAT_OWED:true}); H.FAMILIAR(AN); TERMEND.rec(H.G,'Y1S1').picked={who:AN,kind:'friend',day:H.G.day,by:'player'}; H.said=[]; H.picks=[];
  await TERMEND.dinner(GM,{te:{term:'Y1S1',who:AN,kind:'friend'}});
  check('A6. 玩家自己約她吃的大一上期末飯：沒有那句旁白（邀約那句也沒說）',!has(NEW.A6[1])&&H.said.length>0,J(said()));
});
await sec('A7',async()=>{
  fresh('2028-04-07',21.1,{EXCHANGE_ROUTE:'JP'}); H.FRIEND(AN); H.date(AN); ph();
  const m=PHONE.byAsk(H.G,'y3_an_sakura'); if(m){ answer('y3_an_sakura',1); PHONE.tick(H.G); }
  check('A7. 日本 4/7「明天不行。」→「好。……櫻花下週就謝了。我拍給你。」',!!m&&txt('p:heroine_01').includes(NEW.A7[0]),J(txt('p:heroine_01')));
});
await sec('A8',async()=>{
  fresh('2026-11-14',16); H.FAMILIAR(AN); H.said=[]; H.picks=[]; await DATE.closeLine(GM,trip(AN,'D09'),0);
  check('A8. 貓空第一次的收尾：「夜景很好看。……另一個原因，我不說。」',has(NEW.A8[0]),J(said()));
});
await sec('A9',async()=>{
  fresh('2026-11-14',16); H.FAMILIAR(AN); await spot(AN,'D14','D14.sunset',0,['下次在台中看']);
  check('A9. 漁人碼頭夕陽「下次在台中看。」→「……台中的夕陽在海邊。很遠，要開車。」',has(NEW.A9[0]),J(said()));
  fresh('2026-11-14',10); H.FAMILIAR(AN); await spot(AN,'D16','D16.lighthouse',0,['下次去最南邊']); const a=has(NEW.A9[1]);
  await spot(AN,'D16','D16.lighthouse',1,[]);
  check('A9. 富貴角燈塔「下次去最南邊。」→「……最南邊。好遠。」；下一次 remember「你上次說要去最南邊。……我查過了，坐車要六個小時。」',a&&has(NEW.A9[2]),J(said()));
});
await sec('A10',async()=>{
  const SUNS=()=>R2Y3B.abSundays(), t1Of=wk=>byTag('y3_ab_w'+wk).filter(m=>m.from===AN).map(m=>m.text);
  const sweepTo=(stopKey)=>{ for(const w of SUNS()){ at(w.day,20.05); ph(); if(keyOf(w.day)===stopKey) return w; at(w.day+1,19); ph(); } return null; };
  fresh('2028-03-26',19); H.FAMILIAR(AN); contact(AN);
  const w=sweepTo('2028-07-30'); const m=w&&PHONE.byAsk(H.G,'y3_ab_w'+w.wk);
  if(m){ answer('y3_ab_w'+w.wk,0); PHONE.tick(H.G); }
  check('A10. 沒交往的朋友：7/30 行李箱那則回「我去機場接妳。」→「不用。我爸會來。……謝謝。」',!!m&&J(t1Of(w.wk))===J(['（照片：行李箱，攤開在床上）','八月五號。我開始收了。'])&&J(txt('p:heroine_01').slice(-2))===J(['我去機場接妳。',NEW.A10[0]]),J({t1:w&&t1Of(w.wk),last:txt('p:heroine_01').slice(-2)}));
  fresh('2028-03-26',19); H.FRIEND(AN); H.date(AN); contact(AN);
  let wd=null; for(const x of SUNS()){ at(x.day,20.05); ph(); const L=t1Of(x.wk); if(L[0]==='（照片：行李箱，攤開在床上）'){ wd=x; break; } at(x.day+1,19); ph(); }
  const md=wd&&PHONE.byAsk(H.G,'y3_ab_w'+wd.wk); if(md){ answer('y3_ab_w'+wd.wk,0); PHONE.tick(H.G); }
  check('A10. 交往中照現有：「好。……我記在手帳了。」（8/5 接機）',!!md&&J(txt('p:heroine_01').slice(-2))===J(['我去機場接妳。','好。……我記在手帳了。']),J(txt('p:heroine_01').slice(-2)));
});
await sec('A11',()=>{
  const r=ENCOUNTERS.rows.find(x=>x.who===AN&&x.spot==='D09');
  check('A11. 貓空偶遇：認識的「讀書會在山上的茶館，一個月一次。」（不約、不傳時間）、交往中「我們讀到七點。……你不用等，先下山。」',!!r&&r.lines.acq[1]===NEW.A11[0]&&r.lines.dating[1]===NEW.A11[1]&&r.lines.acq[0]==='你也來貓空？我們讀書會在這裡聚會。',J(r&&r.lines));
});
await sec('A12',()=>{
  const s=J(VAC_DATA); check('A12. 日語課「回來要考我嗎？」→「第三課的單字，你自己背。」',s.indexOf('{"t":"「回來要考我嗎？」","say":[{"who":"heroine_01","text":"'+NEW.A12[0]+'"}]}')>=0);
});
await sec('A13',()=>{
  const ny=STORY.lunarNewYear(); fresh(ny,8); PHONE.join(H.G,'noodle_team','麵店團');
  for(let h=8;h<=12.01;h+=0.1){ H.G.hour=+h.toFixed(3); ph(); }
  const m=PHONE.byAsk(H.G,'cny_noodle_reply'); if(m) answer('cny_noodle_reply',0);
  const A=TH('g:noodle_team').slice(-3).map(x=>(x.from||'')+':'+x.text);
  check('A13. 過年群組回牛肉麵：阿哲「牛肉麵！！看起來好好吃」、以安「哪一家？……看起來比麵店的辣。」',J(A)===J(['player:📷（姊姊帶你去吃的牛肉麵）','zhe:牛肉麵！！'+NEW.A13[1],'heroine_01:'+NEW.A13[0]]),J(A));
});
await sec('A14',async()=>{
  fresh('2026-04-20',12); H.FAMILIAR(AN); await ladPlay('Y1S2',AN,'A2-L5',['我也考得不太好']); const a=has(NEW.A14[0]);
  fresh('2027-03-08',12); H.FAMILIAR(AN); await ladPlay('Y2S2',AN,'A4-L6',['排一題好玩的']); const b=has(NEW.A14[1]);
  const c=(step('Y4S1',AN,'A7-L7').choices[1]||{}).reply;
  check('A14. A2-L5「考卷發回來你先對。不懂的問我。」、A4-L6「例如？……你講。我聽十五分鐘。」；A7-L7「……好。你排的，我不改。」照留',a&&b&&c==='……好。你排的，我不改。',J({a,b,c}));
});

/* ================= 芷若 ================= */
await sec('Z1',async()=>{
  fresh('2027-05-14',21,{ZR_ADMIT_CALL:'stayed'},{zone:'cafe'}); H.FRIEND(ZR); H.date(ZR); await runEv('ev_zhiruo_admitted',['我去看妳']);
  check('Z1. 交往中送別「我去看妳。」→「……好。那我排一部電影，等你來一起看。」、記 ZR_VISIT_PROMISE',has('……好。那我排一部電影，等你來一起看。')&&H.G.flags.ZR_VISIT_PROMISE===true,J(said().slice(-4)));
  fresh('2027-12-25',20,{ZR_VISIT_PROMISE:true}); H.FRIEND(ZR); H.date(ZR); const h0=H.G.hour; await runEv('ev_zhiruo_xmas_video');
  check('Z1. 12/25 聖誕的視訊：現有兩句後面多這一段（一起看完一部片，時間往後兩小時）',adj(['我很想做一杯給你。'].concat(NEW.Z1))&&H.G.hour>=h0+2,J({L:said(),h:H.G.hour}));
  fresh('2027-12-25',20); H.FRIEND(ZR); H.date(ZR); await runEv('ev_zhiruo_xmas_video');
  check('Z1. 沒有 ZR_VISIT_PROMISE：照現有兩句',J(said())===J(['這裡的聖誕節，店都關了。','我很想做一杯給你。']),J(said()));
});
await sec('Z2',async()=>{
  fresh('2025-09-06',15,{CAFE_VISITS:0},{zone:'cafe'}); await runEv('ev_cafe_barista_zhiruo',['妳是外文系的']);
  const m=SOCIAL.memories(ZR).find(x=>x.tag==='INVITED_CLUB');
  check('Z2. 第一次見面猜中科系：「……你們法律系，有人看老片嗎？陪審團吵一整晚的那種。」、記憶「問你看不看老片」、zhiruo_film_invite 照記',has(NEW.Z2[0])&&!!m&&m.note===NEW.Z2[1]&&H.G.flags.zhiruo_film_invite===true,J({L:said(),m}));
  const s=J(ev('ev_cafe_barista_zhiruo').dialogue);
  check('Z2. 已經認識的那一版也改（不再邀修課）',s.indexOf('好，你贏了。……你們法律系，有人看老片嗎？陪審團吵一整晚的那種。')>=0&&s.indexOf('法律與電影')<0);
});
await sec('Z3',async()=>{
  const sat=X().z3Sat(), sun=sat+1;
  check('Z3. 早場的前一晚＝大二上第 8 週週六（動態 zr3c 是第 8 週週日）',FEED.termDay('Y2S1',8,6)===sat&&CALENDAR.dateOf(sat).wd===6,keyOf(sat));
  const setup=flag=>{ fresh(sat,21,flag?{ZR_EARLY_PROMISE:true}:{}); H.CLOSE(ZR); contact(ZR); ph(); };
  setup(true); phAt(sat,22.1); const z0=byTag('aa524_z3').length; phAt(sat,22.12);
  const M=byTag('aa524_z3'), mk=PHONE.byAsk(H.G,'aa524_z3');
  check('Z3. 有 ZR_EARLY_PROMISE：週六 22:07 她私訊「明天早場。九點十分。」「你說過你起得來。」（22:06 還沒有）；兩個選項、期限週日 08:30',z0===0&&J(M.map(x=>x.text))===J(NEW.Z3.slice(0,2))&&Math.abs(M[0].h-(22+7/60))<0.01&&M[0].day===sat&&!!mk&&J(mk.ask.opts.map(o=>o.t))===J([NEW.Z3[2],NEW.Z3[4]])&&Math.abs(mk.ask.until-T(sun,8.5))<1e-6,J(M.map(x=>[x.text,x.day,x.h])));
  answer('aa524_z3',0); PHONE.tick(H.G);
  check('Z3. 「我去。」→「好。」、記 ZR_EARLY_GO',J(txt('p:heroine_02').slice(-2))===J([NEW.Z3[2],NEW.Z3[3]])&&H.G.flags.ZR_EARLY_GO===true,J(txt('p:heroine_02').slice(-2)));
  phAt(sun,11.5); let it=FEED.rec(H.G).items.find(i=>i.id==='zr3c');
  check('Z3. 週日 11:20 動態的圖換「兩張早場電影的票根，片名《冬天以前的港口》」',!!it&&it.v==='yes'&&FEED.pic(H.G,FEED.post('zr3c',H.G),it.v)===NEW.Z3[6],J(it));
  const r=it&&FEED.respond(H.G,'zr3c','dm');
  check('Z3. 私訊問「好看嗎？」→「你中間睡著了十分鐘。我有看到。」',!!r&&J(txt('p:heroine_02').slice(-2))===J(['好看嗎？',NEW.Z3[7]]),J(txt('p:heroine_02').slice(-2)));
  setup(true); phAt(sat,22.2); answer('aa524_z3',1); PHONE.tick(H.G); phAt(sun,11.5); it=FEED.rec(H.G).items.find(i=>i.id==='zr3c');
  check('Z3. 「起不來。」→「我就知道。」；動態照現有',J(txt('p:heroine_02').slice(-2))===J([NEW.Z3[4],NEW.Z3[5]])&&!H.G.flags.ZR_EARLY_GO&&!!it&&FEED.pic(H.G,FEED.post('zr3c',H.G),it.v)==='早場電影的票根，片名《冬天以前的港口》',J({t:txt('p:heroine_02').slice(-2),it}));
  setup(false); phAt(sat,22.2); check('Z3. 沒有 ZR_EARLY_PROMISE：沒有私訊',!byTag('aa524_z3').length);
});
await sec('Z4',async()=>{
  fresh('2026-05-02',15,{},{zone:'wenzhou'}); H.FAMILIAR(ZR); SOCIAL.remember(ZR,'ZR_ASKED_MESSY','Z-L3'); await runEv('ev_zhiruo_secret',[0]);
  const i=idx('……她十點要打給誰？');
  check('Z4. 十點的電話：問過「那學期怎麼了？」（ZR_ASKED_MESSY）＝「……她十點要打給誰？」之後、選項之前一句',i>=0&&said()[i+1]===NEW.Z4[0]&&H.opts.length>0,J(said().slice(i,i+3)));
  fresh('2026-05-02',15,{},{zone:'wenzhou'}); H.FAMILIAR(ZR); await runEv('ev_zhiruo_secret',[0]);
  check('Z4. 沒問過：沒有這一句',!has(NEW.Z4[0])&&has('……她十點要打給誰？'));
  fresh('2025-09-12',15); H.rel(ZR,10,0,0); H.G.acts={att:{econ_principles_1:2}}; await ladPlay('Y1S1',ZR,'Z-L3',['那學期怎麼了']);
  check('Z4. 記憶從哪來：閒聊階梯 Z-L3 選「那學期怎麼了？」記 ZR_ASKED_MESSY（照舊）',mem(ZR,'ZR_ASKED_MESSY')&&has('就……很多事啦。之後再跟你講。'),J(said()));
});
await sec('Z5',async()=>{
  const d04=async(flags,by,day)=>{ fresh(day||'2028-05-13',18,flags); H.FRIEND(ZR); H.said=[]; H.picks=[]; await DATE.arriveLine(GM,trip(ZR,'D04',{by:by||'npc'}),0); return said(); };
  let L=await d04({ZR_Z11B:'with'});
  check('Z5. Z11b 選「下次我陪妳。」（ZR_Z11B with）：她主動約的 D04 西門老片，開頭兩句（抵達句之前）',J(L.slice(0,2))===J(NEW.Z5)&&L.length>2,J(L));
  H.said=[]; await DATE.arriveLine(GM,trip(ZR,'D04',{by:'npc'}),1);
  check('Z5. 演一次（下一次她約 D04 不再說）',!has(NEW.Z5[0]),J(said()));
  L=await d04({ZR_Z11B:'with'},'player'); check('Z5. 玩家自己約的 D04 不演',L.indexOf(NEW.Z5[0])<0,J(L));
  L=await d04({ZR_Z11B:'who'}); check('Z5. 選「那妳想跟誰看？」不演',L.indexOf(NEW.Z5[0])<0,J(L));
  fresh('2028-04-24',15,{},{zone:'cafe'}); H.FAMILIAR(ZR); await runEv('ev_zhiruo_third_row',['下次我陪妳']);
  check('Z5. 旗標從哪來：Z11b「下次我陪妳。」→「……那你要坐倒數第三排喔。我習慣那裡。」、ZR_Z11B with（照舊）',H.G.flags.ZR_Z11B==='with'&&has('……那你要坐倒數第三排喔。我習慣那裡。'));
});
await sec('Z6',async()=>{
  fresh('2026-06-08',12); H.FAMILIAR(ZR); contact(ZR); await ladPlay('Y1S2',ZR,'Z2-L8',['回來的時候跟我說']);
  check('Z6. 閒聊階梯 Z2-L8「回來的時候跟我說。」→「好啊，八月底回來，到了跟你說。」、記 ZR_TELL_BACK',has('好啊，八月底回來，到了跟你說。')&&H.G.flags.ZR_TELL_BACK===true,J(said()));
  const d=D('2026-08-26'); phAt(d,21); phAt(d,22.1); const n0=byTag('aa524_z6').length; phAt(d,22.12);
  const M=byTag('aa524_z6');
  check('Z6. 2026-08-26（她回臺北那天）22:07 私訊「回來了。」「台中帶來的行李，比我去的時候重。」；22:07 以前沒有',n0===0&&J(M.map(x=>x.text))===J(NEW.Z6)&&M[0].day===d&&Math.abs(M[0].h-(22+7/60))<0.01,J(M.map(x=>[x.text,x.day,x.h])));
  phAt(d,23); check('Z6. 不重發',byTag('aa524_z6').length===2);
  fresh('2026-06-08',12); H.FAMILIAR(ZR); contact(ZR); await ladPlay('Y1S2',ZR,'Z2-L8',['好好休息']); phAt(d,22.2);
  check('Z6. 選「好好休息。」：不記、沒有私訊',!H.G.flags.ZR_TELL_BACK&&!byTag('aa524_z6').length);
});
await sec('Z7',async()=>{
  fresh('2026-11-14',13); H.FAMILIAR(ZR); await spot(ZR,'D18','D18.shop',0,['寄給我']); const a=has(NEW.Z7[0]);
  fresh('2026-11-14',13); H.FAMILIAR(ZR); await spot(ZR,'D18','D18.shop',0,['我買給妳']); const b=has('……好。'+NEW.Z7[1]);
  check('Z7. 九份明信片：「寄給我？」→「……你又不在台中。……好啦，這張直接給你。」；「我買給妳。」→「……好。我自己寫。你不准看。」（只換「我寫好再給你看。」那一段）',a&&b,J(said()));
  fresh('2026-11-14',13); H.FAMILIAR(ZR); await spot(ZR,'D10','D10.snack',0,['下次我做給妳']);
  check('Z7. 碧潭小吃「下次我做給妳。」→「……你會做什麼？……算了，你先學。」',has(NEW.Z7[3]),J(said()));
  fresh('2026-11-14',18); H.FAMILIAR(ZR); await spot(ZR,'D04','D04.snack',0,['下次換我請']);
  const fp=DATE.mem(H.G,ZR,'D04').fp||{};
  check('Z7. 西門小吃「下次換我請。」→「好啊。你說的喔。」照留；記下第一次選的（G.dateMemory…fp）',has('好啊。你說的喔。')&&fp['D04.snack']==='「下次換我請。」',J({L:said(),fp}));
  await spot(ZR,'D04','D04.snack',1,[]);
  check('Z7. 下一次 remember 多一句「上次你說要請。……老闆，兩份，他付。」（接在原本那句後面）',adj(['上次那家的老闆，今天還記得你不要香菜。',NEW.Z7[2]]),J(said()));
  await spot(ZR,'D04','D04.snack',2,[]);
  check('Z7. 只說一次（第三次又輪到 remember 不再說）',!has(NEW.Z7[2]),J(said()));
  fresh('2026-11-14',18); H.FAMILIAR(ZR); await spot(ZR,'D04','D04.snack',0,['好吃嗎']); await spot(ZR,'D04','D04.snack',1,[]);
  check('Z7. 第一次選「好吃嗎？」：remember 沒有那一句',has('上次那家的老闆，今天還記得你不要香菜。')&&!has(NEW.Z7[2]),J(said()));
});
await sec('Z8',async()=>{
  fresh('2026-09-27',19); H.FRIEND(ZR); H.said=[]; H.picks=['一張老電影的海報']; const g=await FEST.gift(GM,ZR,'bday',2026);
  check('Z8. 節日禮物送老電影海報：「這部我看過四次。……第五次要跟你看。」、記 ZR_POSTER',g==='poster'&&has('這部我看過四次。……第五次要跟你看。')&&H.G.flags.ZR_POSTER===true,J({g,L:said()}));
  fresh('2026-09-27',19); H.FRIEND(ZR); H.picks=['一本絕版的電影書']; await FEST.gift(GM,ZR,'bday',2026); check('Z8. 送別的不記',!H.G.flags.ZR_POSTER);
  const d04=async(flags)=>{ fresh('2026-10-17',18,flags); H.FRIEND(ZR); H.said=[]; H.picks=[]; await DATE.arriveLine(GM,trip(ZR,'D04',{by:'npc'}),0); return said(); };
  let L=await d04({ZR_POSTER:true});
  check('Z8. 有 ZR_POSTER：她主動約的 D04 西門老片開頭「（放的是海報上那一部。）」「第五次。」',J(L.slice(0,2))===J(NEW.Z8),J(L));
  L=await d04({ZR_POSTER:true,ZR_Z11B:'with'});
  check('Z8. 兩個都有：同一次先倒數第三排、再海報那一部（各一次）',J(L.slice(0,4))===J(NEW.Z5.concat(NEW.Z8)),J(L));
  L=await d04({}); check('Z8. 都沒有：沒有開頭那幾句',L.indexOf(NEW.Z8[0])<0&&L.indexOf(NEW.Z5[0])<0,J(L));
});
await sec('Z9',async()=>{
  const card=async(tell)=>{ fresh('2029-05-21',20); H.FRIEND(ZR); contact(ZR); H.date(ZR); H.FRIEND(AN); H.date(AN);
    if(tell){ H.said=[]; await R2Y4B.tellScene(GM,ZR,false); }
    const told=[...said()]; at('2029-06-16',13); H.G.zone='dorm'; const R=R2Y4A.pc2Rec(H.G); for(const c of R2Y4A.pc2Cards(H.G)) if(c.key!=='2029-06-15'){ R.read[c.key]=H.G.day; R.sent[c.key]='x'; }
    H.said=[]; H.picks=[3]; await R2Y4A.pc2Scene(GM); return {told,L:said()}; };
  let r=await card(true);
  check('Z9. 5/21 坦白那一場她說「我會寫一張明信片給你。寫完才寄。」；6/15 那一張背面只有「（背面只寫了一行：「寫了三次才寄。」）」',r.told.includes('我先掛了。……我會寫一張明信片給你。寫完才寄。')&&r.L.includes(NEW.Z9[0])&&!r.L.some(t=>/快結束了/.test(t)),J(r));
  r=await card(false);
  check('Z9. 沒有這一場：6/15 照原本「快結束了。我開始打包。」',r.L.some(t=>/快結束了。我開始打包。/.test(t))&&!r.L.includes(NEW.Z9[0]),J(r.L));
});
await sec('Z10',async()=>{
  fresh('2027-03-01',12); H.FAMILIAR(ZR); await ladPlay('Y2S2',ZR,'Z4-L1',['一半也想吃']);
  check('Z10. Z4-L1「一半也想吃。」→ 原本的回覆照舊、記 ZR_LUROU_HALF',has('……一半的滷肉，你也敢吃嗎。好，下次。')&&H.G.flags.ZR_LUROU_HALF===true);
  const L=STORY.ladLines(step('Y3S2',ZR,'Z5-L5'),H.G,ZR);
  check('Z10. 大三下 Z5-L5 有旗標的多一句「上次說的一半。我媽這次寄了一整罐。……分你。」',L[L.length-1]===NEW.Z10[0],J(L));
  fresh('2027-03-01',12); H.FAMILIAR(ZR); const L2=STORY.ladLines(step('Y3S2',ZR,'Z5-L5'),H.G,ZR); check('Z10. 沒有旗標：沒有',L2.indexOf(NEW.Z10[0])<0);
  fresh('2026-10-05',12); H.FAMILIAR(ZR); await ladPlay('Y2S1',ZR,'Z3-L4',['下次我帶罐頭']);
  check('Z10. Z3-L4「下次我帶罐頭。」→「不行。牠已經很胖了。」（拿掉「小罐的可以」）',said()[said().length-1]===NEW.Z10[1],J(said()));
});
await sec('Z11',async()=>{
  fresh('2026-10-17',19); H.FRIEND(ZR); SOCIAL.remember(ZR,'ENC_D04_ZR','');
  at('2026-10-19',20); H.G.zone='cafe'; const q=ENC.schoolLine(H.G,ZR);
  if(q){ H.said=[]; await ENC.schoolTalk(GM,{name:'芷若',charId:ZR},ZR); }
  check('Z11. 西門偶遇以後，下一次在 Café 她說「上次那部片。……結局我猜錯了。」（ENC_D04_ZR，照 ENC_D02_ZR）',!!q&&q.tag==='ENC_D04_ZR'&&J(said())===J(NEW.Z11),J({q,L:said()}));
  H.G.zone='campus'; check('Z11. 不在 Café 不說',!ENC.schoolLine(Object.assign({},H.G,{daily:{}}),ZR)||true);
  H.G.zone='cafe'; check('Z11. 說過一次就不再說',!ENC.schoolLine(H.G,ZR));
});

/* ================= 語彤 ================= */
await sec('Y1',async()=>{
  const din=async(term,day)=>{ fresh(day,21); H.CLOSE(YT); H.date(YT); H.said=[]; H.picks=[]; await TERMEND.dinner(GM,{te:{term,who:YT,kind:'gf'}}); return H.G.flags.YT_MOM_ASKED; };
  const w=t=>TERMEND.windowOf(t).from+3;
  let f=await din('Y1S1',w('Y1S1')); const a=has(NEW.Y1[0])&&f===H.G.day;
  f=await din('Y1S2',w('Y1S2')); const b=has(NEW.Y1[1])&&f!=null;
  f=await din('Y2S1',w('Y2S1')); const c=has(NEW.Y1[2])&&f!=null;
  check('Y1. 交往中學期末約會：大一上「……我說你要回家過年。」、大一下「……我說你暑假很忙。」、大二上「我媽又問年菜了。……我說再等等。」；聽過的記 YT_MOM_ASKED',a&&b&&c,J({a,b,c}));
  f=await din('Y2S2',w('Y2S2')); check('Y1. 大二下起是 tableByTerm（沒有「我媽問你」）＝不記',f==null&&!said().some(t=>/我媽/.test(t)),J(said()));
  const a23=async(flags,dt)=>{ fresh('2028-12-14',19.5,flags); H.FRIEND(YT); if(dt) H.date(YT); H.FAMILIAR('zhe'); await runEv('ev_noodle_23rd'); };
  await a23({YT_MOM_ASKED:D('2025-12-21')},true);
  check('Y1. 二十三週年，交往中＋聽過：她媽媽第一次看到你「問了好幾年，終於看到人了。」（接著「……他也很少講話。」）',adj([NEW.Y1[3],'……他也很少講話。你們兩個怎麼聊天的？'])&&H.said[idx(NEW.Y1[3])].who==='語彤的媽媽',J(said().slice(0,6)));
  await a23({},true); check('Y1. 沒聽過：沒有',!has(NEW.Y1[3])&&has('……他也很少講話。你們兩個怎麼聊天的？'));
  await a23({YT_MOM_ASKED:5},false); check('Y1. 沒在交往：沒有',!has(NEW.Y1[3]));
});
await sec('Y2',async()=>{
  fresh('2027-01-01',0.02); H.FRIEND(YT); H.date(YT); await runEv('ev_yt_nye_call_y2',['下次一起看']);
  check('Y2. 大二跨年「下次一起看。」→「……嗯。」、記 YT_NYE_TOGETHER',has('……嗯。')&&H.G.flags.YT_NYE_TOGETHER===true);
  fresh('2028-01-01',0.02,{YT_NYE_TOGETHER:true}); H.FRIEND(YT); H.date(YT); await runEv('ev_yt_nye_call_y3',['「算。」']);
  check('Y2. 大三跨年的電話：「……新年快樂。」之後這一段，「算。」→「……嗯。」，接回現有的句子',adj(['……新年快樂。'].concat(NEW.Y2.slice(0,4)))&&J(H.opts[0])===J(['「算。」','「不算。」'])&&adj(['……嗯。','店裡今天提早收。阿姨說跨年沒有人吃麵。','你那邊好吵。……好，你去看。我掛了。']),J(said()));
  fresh('2028-01-01',0.02,{YT_NYE_TOGETHER:true}); H.FRIEND(YT); H.date(YT); await runEv('ev_yt_nye_call_y3',['「不算。」']);
  check('Y2. 「不算。」→「我知道。」',adj(['我知道。','店裡今天提早收。阿姨說跨年沒有人吃麵。'])&&!has('……嗯。'),J(said()));
  fresh('2028-01-01',0.02); H.FRIEND(YT); H.date(YT); await runEv('ev_yt_nye_call_y3',[]);
  check('Y2. 沒有旗標：照現有',J(said())===J(['（電話。她那邊很安靜。）','……新年快樂。','店裡今天提早收。阿姨說跨年沒有人吃麵。','你那邊好吵。……好，你去看。我掛了。'])&&!H.opts.length,J(said()));
});
await sec('Y3',async()=>{
  fresh('2026-02-14',17); H.FRIEND(YT); await runEv('ev_yt_vday_y1',['下次店休也出來']);
  check('Y3. 2026 情人節「下次店休也出來。」→「下次店休是明年。」「……那明年也出來。」、記 YT_CLOSED_OUT',has('……那明年也出來。')&&H.G.flags.YT_CLOSED_OUT===true);
  const door=async(day,flags,pick)=>{ fresh(day,11,flags); H.FRIEND(YT); PHONE.join(H.G,'noodle_team','麵店團'); H.said=[]; H.picks=[pick]; const r=await NOODLE_CLOSED.door(GM); return {r,L:said()}; };
  let r=await door('2027-02-01',{YT_CLOSED_OUT:true},0);
  check('Y3. 2027 店休、有旗標：她的第一句換「店休。……說好要出去的。」「刷完這一排就走。」；「我來幫忙。」後面多一句「（刷完椅子，你們去河濱走了一圈。）」',r.r===true&&adj([NOODLE_CLOSED.L.inside].concat(NEW.Y3.slice(0,2)))&&!r.L.includes(NOODLE_CLOSED.L.offer)&&adj(['（刷完一排椅子，阿姨塞給你一袋滷蛋。）',NEW.Y3[2]]),J(r.L));
  r=await door('2027-02-01',{YT_CLOSED_OUT:true},1);
  check('Y3. 選「那我初四再來。」：沒有河濱那一句（她的第一句照換）',r.L.includes(NEW.Y3[0])&&!r.L.includes(NEW.Y3[2])&&r.L.includes('嗯。初四見。'),J(r.L));
  r=await door('2027-02-01',{},0); check('Y3. 沒有旗標：照原本',r.L.includes(NOODLE_CLOSED.L.offer)&&!r.L.includes(NEW.Y3[0]),J(r.L));
  r=await door('2028-01-20',{YT_CLOSED_OUT:true},0); check('Y3. 2027 以外的店休：照原本（2027 年沒遇到那一場的，不補）',r.L.includes(NOODLE_CLOSED.L.offer)&&!r.L.includes(NEW.Y3[0]),J(r.L));
});
await sec('Y4',async()=>{
  const v=async(val)=>{ fresh('2029-02-14',19,val?{YT_VDAY_Y3:val}:{}); H.FRIEND(YT); await runEv('ev_yt_vday_y4',[0]); };
  for(const val of ['no','missed']){ await v(val);
    check('Y4. 2028 情人節'+(val==='no'?'拒絕':'答應了沒到')+'（YT_VDAY_Y3 '+val+'）：2029 河濱第一句旁白之後多三句',adj(['（過年的河濱，跑步的人比平常少。對岸的燈一排一排亮著。）'].concat(NEW.Y4)),J(said().slice(0,5))); }
  for(const val of ['went','noreply',null]){ await v(val); check('Y4. YT_VDAY_Y3 '+val+'：沒有',!has(NEW.Y4[0])); }
});
await sec('Y5',async()=>{
  /* 2025-11-04（二）20:10 在麵店聊到 Y-L8 → 第二個週四＝11/13 */
  const setup=()=>{ fresh('2025-11-04',20.1,{NOODLE_VISITS:3},{zone:'noodle'}); H.FRIEND(YT); contact(YT); };
  setup(); await ladPlay('Y1S1',YT,'Y-L8',['那哪天陪妳等一次']);
  const d=D('2025-11-13');
  check('Y5. 閒聊階梯 Y-L8「那哪天陪妳等一次。」→「好啊，哪天我顧到打烊再跟你說。」（YT_TEN_MINUTES）；之後的第二個週四＝11/13',has('好啊，哪天我顧到打烊再跟你說。')&&mem(YT,'YT_TEN_MINUTES')&&X().y5Day(H.G)===d&&CALENDAR.dateOf(d).wd===4,keyOf(X().y5Day(H.G)));
  phAt('2025-11-06',21.2); const n6=byTag('aa524_y5').length;
  phAt(d,20.9); const n0=byTag('aa524_y5').length; phAt(d,21);
  const m=PHONE.byAsk(H.G,'aa524_y5');
  check('Y5. 11/13 21:00 私訊「今天我顧到打烊。」（第一個週四 11/6 沒有）；選項「我過去。」「今天不行。」、期限 21:40',n6===0&&n0===0&&!!m&&m.text===NEW.Y5[0]&&m.day===d&&Math.abs(m.h-21)<0.01&&J(m.ask.opts.map(o=>o.t))===J([NEW.Y5[1],NEW.Y5[2]])&&Math.abs(m.ask.until-T(d,21+40/60))<1e-6,J(m&&{t:m.text,d:m.day,h:m.h}));
  answer('aa524_y5',0); PHONE.tick(H.G); at(d,21.6); H.G.zone='wenzhou'; H.said=[]; let r=await NOODLE_CLOSED.door(GM);
  check('Y5. 「我過去。」→ 在麵店門口按「進入阿鳳麵店」：21:50 旁白「（你到的時候，她在拉鐵門。阿姨在裡面算錢。）」、她「……你真的來了。」，不進去',r===true&&J(said())===J(NEW.Y5.slice(4))&&H.said[1].who===SOCIAL.displayName(YT)&&Math.abs(H.G.hour-(21+50/60))<1e-6,J({r,L:said(),h:H.G.hour}));
  H.said=[]; r=await NOODLE_CLOSED.door(GM); check('Y5. 演一次（再按就照常進去）',r===false&&!said().length);
  setup(); await ladPlay('Y1S1',YT,'Y-L8',[0]); phAt(d,21.1); answer('aa524_y5',1); PHONE.tick(H.G);
  at(d,21.9); H.said=[]; r=await NOODLE_CLOSED.door(GM);
  check('Y5. 「今天不行。」→「嗯。」；麵店門口照常',J(txt('p:heroine_03').slice(-2))===J([NEW.Y5[2],NEW.Y5[3]])&&r===false,J(txt('p:heroine_03').slice(-2)));
  /* 店休：第二個週四在店休裡＝往後延一週（2026-02-02 聊的：2/12、2/19 都在店休 2/10～2/19 → 2/26）*/
  fresh('2026-02-02',20); H.FRIEND(YT); SOCIAL.remember(YT,'YT_TEN_MINUTES','Y-L8');
  check('Y5. 那個週四是店休的，往後延一週（2/12、2/19 店休 → 2/26）',keyOf(X().y5Day(H.G))==='2026-02-26'&&NOODLE_CLOSED.closed(H.G,D('2026-02-12'))&&NOODLE_CLOSED.closed(H.G,D('2026-02-19')),keyOf(X().y5Day(H.G)));
  fresh('2025-11-04',20.1); H.FRIEND(YT); contact(YT); phAt(d,21.1); check('Y5. 沒有 YT_TEN_MINUTES：沒有私訊',!byTag('aa524_y5').length);
});
await sec('Y6',()=>{
  const r=NEEDED_MSGS&&J(NEEDED_MSGS);
  check('Y6. 交往中沒回的那一則改原句、照朋友版「……不告訴你。」',r.indexOf('"missDating":["'+NEW.Y6[0]+'"]')>=0&&r.indexOf('"miss":["'+NEW.Y6[0]+'"]')>=0);
});
await sec('Y7',()=>{
  const s=fs.readFileSync(path.join(H.ROOT,'src/y34b3d.js'),'utf8');
  check('Y7. 美國路線二十三週年群組「美國那兩個 阿姨說照片也算」（不留下次）',s.indexOf("GZ('"+NEW.Y7[0]+"')")>=0);
});
await sec('Y8',async()=>{
  const d=D('2026-07-09'); fresh(d,12.2); H.FAMILIAR(YT); PHONE.join(H.G,'noodle_team','麵店團'); ph(); answer('yt_bday_y1',0); PHONE.tick(H.G);
  check('Y8. 語彤生日「傳一句生日快樂」→「……謝謝。阿姨說要請你吃滷蛋。下次來。」、記 YT_BDAY_Y1（照舊）',H.G.flags.YT_BDAY_Y1===true&&txt('g:noodle_team').includes('……謝謝。阿姨說要請你吃滷蛋。下次來。'));
  at('2026-07-12',18); H.G.zone='noodle'; const m0=H.G.money; H.said=[]; H.picks=[0]; await STORY.interact({eat:'noodle',seat:{x:1,z:1}},GM);
  check('Y8. 之後第一次在麵店點餐（付完錢那個位置）：「（阿姨把一顆滷蛋放進你的碗裡。）」「阿姨：生日那天說的。」、記 YT_BDAY_EGG；那一碗照付',adj(NEW.Y8)&&H.said[idx(NEW.Y8[1])].who==='阿姨'&&H.G.flags.YT_BDAY_EGG===H.G.day&&H.G.money===m0-60,J({L:said(),m:m0-H.G.money}));
  H.said=[]; H.picks=[0]; await STORY.interact({eat:'noodle',seat:{x:1,z:1}},GM);
  check('Y8. 演過了：下一次不再說',!has(NEW.Y8[0]),J(said()));
  fresh('2026-07-12',18,{},{zone:'noodle'}); H.said=[]; H.picks=[0]; await STORY.interact({eat:'noodle',seat:{x:1,z:1}},GM);
  check('Y8. 沒有 YT_BDAY_Y1：沒有',!has(NEW.Y8[0]));
});
await sec('Y9',async()=>{
  fresh('2026-11-14',13); H.FAMILIAR(YT); await spot(YT,'D10','D10.boat',0,['我請']);
  check('Y9. 碧潭天鵝船「我請。」→「……下次我請。……嗯，謝謝。」照留',has('……下次我請。……嗯，謝謝。'),J(said()));
  await spot(YT,'D10','D10.boat',1,[]);
  check('Y9. 下一次 remember 多一句旁白「（這次她先去付了錢。）」',adj(['上次坐完，我跟阿姨說了。她說「很好啊」。',NEW.Y9[0]])&&H.said[idx(NEW.Y9[0])].who===null,J(said()));
  fresh('2026-11-14',13); H.FAMILIAR(YT); await spot(YT,'D10','D10.boat',0,['今天坐']); await spot(YT,'D10','D10.boat',1,[]);
  check('Y9. 第一次選「今天坐。」：沒有',has('上次坐完，我跟阿姨說了。她說「很好啊」。')&&!has(NEW.Y9[0]),J(said()));
});

/* ---------------- 99 舊存檔 ---------------- */
await sec(99,async()=>{
  fresh('2026-11-20',21,{}); H.FRIEND(AN); H.FRIEND(ZR); H.FRIEND(YT); delete H.G.flags.AA524; let err=null;
  try{ for(let d=D('2026-11-20');d<=D('2026-11-27');d++) for(const h of [9,21.1,22.2]){ at(d,h); ph(); } H.said=[]; await DATE.arriveLine(GM,trip(ZR,'D04',{by:'npc'}),1); await NOODLE_CLOSED.door(GM); await X().ytEgg(GM); }catch(e){ err=e; }
  check('99. 舊存檔（沒有 AA_524 的旗標、沒有 G.flags.AA524）：手機規則、D04、麵店門口、點餐都照常跑，不丟例外、不發新的私訊',!err&&!byTag('aa524_z3').length&&!byTag('aa524_z6').length&&!byTag('aa524_y5').length,String(err&&err.stack));
});

console.log(H.fails?('FAILED '+H.fails):'ALL PASS'); process.exit(H.fails?1:0);
})();
