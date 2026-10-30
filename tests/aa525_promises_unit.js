// AA_525 說了沒發生（二）：子晴、沛珊、可昕（企劃線 6081f725f，AA-C 2026-10-28；任務 HEROINE-LIFE-1028、USER_WANTS X122）——不需要瀏覽器。
// 原則照 AA_356：之後已經有的場合補一兩句、沒有場合改原句、玩家選項先補旗標；新增的場合照稿（K-7 一通電話、兩處約會開頭的旁白）。
// 每一條至少一個檢查，盡量實際跑（事件、手機規則、約會互動點、期末飯、去她的縣市、閒聊階梯的回覆）；新加的句子逐句對稿（都要在 AA_525 裡）。
//   0  讀稿、白名單、src/aa525_3d.js 載得到、index.html 順序、舊句全部不在 src 裡
//   1  子晴 1-1～1-6　2  沛珊 2-1～2-4　3  可昕 3-1～3-11（含 AA_356 漏的一筆）
// AA_526（企劃線 4ada43291，AA-B 10-30 回 AA_525 的問題）第 2 節：D15「全部我請。」回覆、3-11 KX.Y3S1 第二句撤回、1-1 只給聽過「明年還有第三張」的（ZQ_STICKER3）、3-9 條件改演過那通電話、2-1 照現在。
// 用法：node tests/aa525_promises_unit.js（在沒有 .git 的目錄跑：設環境變數 AA525_DOCREPO＝有企劃線 commit 的 repo）
'use strict';
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify;
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
/* index.html 的順序載入其餘的檔（同 tests/aa523_sis_b16_unit.js）*/
const PG_FILES=new Set(['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js',
  'src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/data/syllabus.js','src/data/exam_bank.js','src/data/legal_qbank.js','src/classes3d.js','src/data/postgrad_lines.js','src/postgrad3d.js']);
const SKIP=new Set(['src/character3d.js','src/engine3d.js','src/townkit3d.js','src/zones3d.js','src/bike3d.js','src/adv3d.js']);
const loadErr=[];
const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
{ const files=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>f.startsWith('src/')&&!PG_FILES.has(f)&&!SKIP.has(f));
  for(const f of files){ try{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }catch(e){ loadErr.push(f+'：'+String(e.message).slice(0,120)); } } }
GM.toast=()=>{}; GM.caption=()=>{}; GM.studySession=async()=>{}; GM.spawnNPC=()=>null; GM.spawnCharacter=()=>null; GM.phoneBadge=()=>{}; GM.quickGo=async()=>{};
if(typeof HOME!=='undefined') HOME.phoneRules=()=>{};
const D=k=>typeof k==='number'?k:STORY.dayOfKey(k), keyOf=d=>CALENDAR.dateOf(d).key;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const said=()=>H.said.map(x=>x.t), has=t=>H.said.some(x=>x.t===t), idx=t=>H.said.findIndex(x=>x.t===t);
const seq=(a,src)=>{ const S=src||said(), ix=t=>S.indexOf(t); return a.every((t,i)=>ix(t)>=0&&(i===0||ix(t)>ix(a[i-1]))); };   /* src：那一次跑出來的句子（不給＝現在的 H.said）*/
const ev=id=>STORY_EVENTS.find(e=>e.id===id)||null;
const runEv=async(id,picks)=>{ H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); const e=ev(id); if(!e) throw new Error('沒有事件 '+id); await EVENTS.run(e); };
const fresh=(key,h,flags,zone)=>{ const G=H.fresh(typeof key==='number'?keyOf(key):key,h,zone||'dorm',Object.assign({introDone:true,afternoonDone:true,classDone:true},flags||{}));
  G.outings=[]; G.acts={att:{}}; G.msgs=G.msgs||[]; G.contacts=G.contacts||{}; G.invites=[]; PHONE.rec(G);
  E.player.busy=false; E.paused=false; E.player.lv=0; E.player.seat=null; E.npcs.length=0; GM.npc={}; ADV.active=false; if(STORY._bindGM) STORY._bindGM(GM);
  H.at(typeof key==='number'?keyOf(key):key,h); return G; };
const at=(key,h)=>H.at(typeof key==='number'?keyOf(key):key,h);
const msgTexts=th=>(H.G.msgs||[]).filter(m=>!th||m.th===th).map(m=>m.text);
const tick=()=>PHONE.tick(H.G);
const lad=(term,id,sid)=>{ const C=term==='Y1S1'?LADDER.characters:LADDER.byTerm[term]; return ((C&&C[id]&&C[id].steps)||[]).find(s=>s.id===sid)||null; };
const SRC=f=>fs.readFileSync(path.join(H.ROOT,f),'utf8');
const listSrc=()=>{ const out=[]; const walk=d=>{ for(const n of fs.readdirSync(path.join(H.ROOT,d))){ const p=d+'/'+n; if(fs.statSync(path.join(H.ROOT,p)).isDirectory()) walk(p); else if(/\.js$/.test(n)) out.push(p); } }; walk('src'); return out; };
const stripComments=s=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/mg,'');

/* ---------- 讀稿 ---------- */
const SHA='6081f725f', DOCF='docs/story_planning/AA_525_說了沒發生_子晴沛珊可昕.md';
let DOC=''; try{ DOC=cp.execSync('git -c core.quotepath=false show '+SHA+':"'+DOCF+'"',{cwd:process.env.AA525_DOCREPO||H.ROOT,encoding:'utf8',maxBuffer:1<<24,stdio:['ignore','pipe','ignore']}); }catch(e){ DOC=''; }
const inDoc=t=>!!DOC&&DOC.includes(t);
const SHA6='4ada43291', DOCF6='docs/story_planning/AA_526_回LAWWW_AA524_525重做九題.md';
let DOC6=''; try{ DOC6=cp.execSync('git -c core.quotepath=false show '+SHA6+':"'+DOCF6+'"',{cwd:process.env.AA525_DOCREPO||H.ROOT,encoding:'utf8',maxBuffer:1<<24,stdio:['ignore','pipe','ignore']}); }catch(e){ DOC6=''; }
const NEW6=['……好。我記下來。','寒假你來高雄。……我們都沒去過的地方，我來排。'];   /* AA_526 第 2 節：D15 改成的那一句、3-11 撤回照原句的那一句 */
/* 這一份加進遊戲的每一句（旁白、台詞、選項、私訊、系統字）：都要一字不差在稿裡 */
const NEW=[
  '（她從口袋拿出一張插座貓貼紙，貼在你手機殼上。和前兩張排在一起。）','第三張。說好的。','📷（一張插座貓貼紙，貼在她的筆電上）','第三張 先貼我這',
  '（她把筆電轉過來。畫面上一隻像素的貓，在插座前面打了一個呵欠。）','第二關。你上次玩到這裡。','……第三個插座。你說你會看到。','（你看到了。貓在第三個插座前面停了一下，打了一個呵欠。）',
  '（她把一杯飲料推到你面前。）','包飲料。說好的。','（你掉下去兩次，第三次過了。）','過了。……第三關我還沒做。',
  '（資工系館的電腦教室。螢幕上，一隻貓站在一座橋上。）','第三關。橋是新的。','（你在橋的一半掉下去。）','……第三關太難了。我回去改。',
  '（她把筆電轉過來。這次不是那隻貓。）','新的東西。還沒有名字。','（你玩了二十分鐘。她一句話都沒說，在旁邊記筆記。）','……好。我知道哪裡要改了。',
  '……真的？那第二關做好，你再幫我玩。','你測過的那一關，我改完了。','第二關做好了。你先玩，我還沒給別人看。','……成發那天來。我只彈一次。',
  '（她把筆電轉過來，推到你面前。）','說好的。玩。','那座橋，我回去要畫一次。','……謝謝。','謝謝。','好啦。謝謝。','好。謝謝。','好！謝謝！','上次也來這裡。',
  '上次你說的那件事。','……我想好了。好！','上次你說的那件事，我還在想。……我沒有忘喔。',
  '（她帶你走了一條窄窄的巷子，兩邊都是透天厝。）','國中三年，每天走這條！','……那時候覺得好遠。現在走起來好近。',
  '（她從包包拿出三張卡片。）','課輔班的！她們畫的你。……長得不太像。',
  '明年……好！！','妳舉手了嗎？','……還沒！不要一直問！','不行。這是家傳的！','今天那一題，你講得很好。……我想多聽你講。',
  '今天買的書，第一本是繪本。……給課輔班的。','回程的車上，我要把今天的事寫下來！','看起來好好吃！！我考完要吃很多！',
  '（她把一盒蛋餅放到你面前。）','說好的！','……我家的早餐比這個好吃！','謝謝！',
  '（吃完飯，她從包包拿出一個小盒子，推過來。）','聖誕的。說好考完換。','（你也把準備好的那一份拿出來。）','還有，去年說的。今年的第二頁，你排。','河濱，看燈。','……抄我的。好。','山上，看夜景。','好。你開車。','（那一晚的第二頁，是你排的。）',
  '（信箱裡有一張臺灣寄來的卡片。第一頁寫著：第四年。）','摩天輪。說好的。','（吃完飯，你們去搭了摩天輪。轉到最高的時候，她靠著窗，沒有說話。）',
  '第三個願望。去年說今年說。','我們兩個都考過。','（這一次，第一張卡片是你寫的。你把它推過去。）','（翻開，讀完）……你的字。','第四年。……明年這一天，我們都畢業了。','明年的卡片，又換你寫。',
  '下次你來，我們吃山下那家。','今天是可昕實習第一天。','……喂。你真的打了。','影印了一整天。','影印機我取了名字。叫債務人。',
  '……蛋糕你挑。只有這個你挑。','（木柵大學門口的流蘇開了。白白的一整片。）',
  '開學我就上去了。台北見。','……好。下次找一個我們都沒去過的地方。','……真的喔？那我帶你去夜市。','……牠脖子很短。就這樣。','……不用補。睡飽一點。',
  '……當面。','恭喜。','好。收到了。','第一碗。說好我請。','（她先去付了錢。）',
  '圖書館前面那兩隻，一隻叫原告，一隻叫被告。','不要。我自己寫。','好。','這題我要偷走。','嗯。……講不清楚。','歐洲要排很久。……我先存錢。','……欠的那一碗。好，扣掉。'];   /* 3-11「寒假你來高雄。……去哪裡你決定。」AA_526 撤回 */
/* 改掉的舊句（src 裡不能再出現；註解裡的不算）*/
const OLD=['你測過的那一關，我改完了。……下學期再給你玩。','……真的？那你下禮拜再來，幫我玩第二關。','那下次社課來。我彈給你聽。只彈一次。','那座橋，我回去要畫一次。……畫好再給你看。',
  '……謝謝。宵夜我請。','謝謝，下次換我。','好！下次我請。',   /* D30「好。下次換我。」food_fav_lines.js 另有一句（不是這一份的），在 1-6 對約會那一句 */
  '明年……好！！我寫在行事曆上。','下次我問妳有沒有舉手。','好。你問。……我會老實說。','不行。這是家傳的。……好，教你一半。',
  '下週那一題，你報。……我想聽你講。','今天買的書，第一本我先讀給你聽。……下次。','回程的車上，我要把今天的事寫下來。寫好給你看。','看起來好好吃。考完你帶我去。',
  '……下次我請你吃早餐。我家的。','……謝謝。下次換我。','……謝謝。下次換你。','下次你來，我們吃山上那家。','開學我就上去了。……到時候換你來接我。','……好。下次換你。去一個你也沒去過的地方。',
  '……真的喔？那我帶你去吃我家巷口的豆花。','下次見面再跟你說。','好。明天。不准再睡著。','好啦。下次你來木柵大學，我帶你去圖書館前面找。','好啊。下次你來木柵大學，我帶你去圖書館前面找。','要。等我寫完第一頁再給你看。',
  '好，那下週換你請。','這題我要偷走。下次出給你。','嗯。……下次講給你聽。','歐洲要排很久……下次，我先做一份行程表給你看。','……好。我記下來。下次滷味我請。',   /* 最後一句：AA_526 第 2 節 D15 */
  '寒假你來高雄。……去哪裡你決定。'];   /* AA_526 撤回的改字：不能在遊戲裡 */
const ZQ='heroine_04', PS='classmate_peishan', KX='kexin';

(async()=>{
/* ================= 0 ================= */
await sec(0,()=>{
  check('0. 讀得到稿（AA_525 '+SHA+'：第 1～5 節；子晴 1-1～1-6、沛珊 2-1～2-4、可昕 3-1～3-11、新旗標）',DOC.length>8000&&/### 1-6/.test(DOC)&&/### 2-4/.test(DOC)&&/### 3-11/.test(DOC)&&/## 4\. 新旗標/.test(DOC),String(DOC.length));
  const A=JSON.parse(SRC('docs/handoff/story_import_allow.json')).files.filter(e=>/AA_525_/.test(e.path));
  check('0. 劇情匯入白名單有 AA_525（sha '+SHA+'、approved、AA-C 定稿、HEROINE-LIFE-1028）；這支測試對同一版的稿',A.length===1&&A[0].sha===SHA&&A[0].status==='approved'&&A[0].task==='HEROINE-LIFE-1028'&&/AA-C 定稿/.test(A[0].approvedBy||''),J(A.map(e=>({sha:e.sha,status:e.status}))));
  check('0. 全部的檔載入沒有錯誤；src/aa525_3d.js 載得到（AA525.LAD、cards、phone）',!loadErr.length&&typeof AA525!=='undefined'&&Array.isArray(AA525.LAD)&&typeof AA525.cards==='function'&&typeof AA525.phone==='function',J(loadErr));
  const a=s=>html.indexOf(s);
  check('0. index.html：aa525_3d.js 在 story3d.js、date3d.js、termend3d.js、privtalk3d.js 以後、bbpack_events.js 以前',a('src/aa525_3d.js')>Math.max(a('src/story3d.js'),a('src/date3d.js'),a('src/termend3d.js'),a('src/privtalk3d.js'))&&a('src/aa525_3d.js')<a('src/data/bbpack_events.js'));
  const A6=JSON.parse(SRC('docs/handoff/story_import_allow.json')).files.filter(e=>/AA_526_/.test(e.path));
  check('0. AA_526：讀得到稿（'+SHA6+' 第 2 節 D15、大三上期末飯、1-1、3-9、2-1），白名單有一筆（approved、AA-B 定稿、HEROINE-LIFE-1028）',DOC6.length>2000&&/### D15/.test(DOC6)&&/ZQ_STICKER3/.test(DOC6)&&/### 3-9/.test(DOC6)&&A6.length===1&&A6[0].sha===SHA6&&A6[0].status==='approved'&&A6[0].task==='HEROINE-LIFE-1028',J(A6.map(e=>e.sha)));
  const miss6=NEW6.filter(t=>!DOC6.includes(t));
  check('0. AA_526 這兩句一字不差在 AA_526 裡（「……好。我記下來。」「寒假你來高雄。……我們都沒去過的地方，我來排。」）',!miss6.length,J(miss6));
  const miss=NEW.filter(t=>!inDoc(t));
  check('0. 新加的 '+NEW.length+' 句每一句都一字不差在稿裡',!miss.length,J(miss));
  const files=listSrc(), hit=[]; for(const f of files){ const s=stripComments(SRC(f)); for(const t of OLD) if(s.includes(t)) hit.push(f+'：'+t); }
  check('0. 改掉的 '+OLD.length+' 句舊句：src 裡（不算註解）都不在了',!hit.length,J(hit));
});

/* ================= 1 子晴 ================= */
await sec('1-1',async()=>{
  const q12=async(flags,dat)=>{ fresh('2028-05-20',14,Object.assign({ZQ_Q12:'nine'},flags)); H.FRIEND(ZQ); if(dat) H.date(ZQ); await runEv('ev_ziqing_q12'); return said(); };
  const L1=await q12({ZQ_SHOW2:'came',ZQ_STICKER3:true},true), i0=L1.indexOf('謝謝：爸爸'), i1=L1.indexOf('（她從口袋拿出一張插座貓貼紙，貼在你手機殼上。和前兩張排在一起。）');
  check('1-1. Q12 發表會（交往中、聽過「第二張。明年還有第三張。」ZQ_STICKER3）：製作名單「謝謝：爸爸」之後「（她從口袋拿出一張插座貓貼紙…）」「第三張。說好的。」',i0>=0&&i1===i0+1&&L1[i1+1]==='第三張。說好的。',J(L1.slice(Math.max(0,i0-1),i0+4)));
  const L2=await q12({ZQ_SHOW2:'came',ZQ_STICKER3:true},false), L3=await q12({ZQ_SHOW2:'absent'},true), L4=await q12({ZQ_SHOW2:'came',ZQ_STICKER3:false},true);
  check('1-1. 沒交往、成發沒來（ZQ_SHOW2 absent）＝沒有第三張',!L2.includes('第三張。說好的。')&&!L3.includes('第三張。說好的。'));
  check('1-1. AA_526：成發有來、但沒聽過那一句（「去年的份。」那一支、went 但當時沒交往：ZQ_STICKER3 false）＝不補',!L4.includes('第三張。說好的。'),J(L4.slice(-4)));
  /* 大二下成發（ev_ziqing_show2）：went 那一支＋交往中＝記 ZQ_STICKER3 true；「去年的份。」那一支、went 沒交往＝false */
  const sh2=async(zqShow,dat)=>{ fresh('2027-06-05',19,zqShow?{ZQ_SHOW:zqShow}:{},'wancai'); H.FRIEND(ZQ); if(dat) H.date(ZQ); await runEv('ev_ziqing_show2'); return {s:said(),v:H.G.flags.ZQ_STICKER3}; };
  const W1=await sh2('came',true), W2=await sh2(null,true), W3=await sh2('came',false);
  check('1-1. AA_526：大二下成發 went＋交往中（「第二張。明年還有第三張。」）記 ZQ_STICKER3 true；「去年的份。」那一支、went 沒交往記 false',W1.s.includes('第二張。明年還有第三張。')&&W1.v===true&&W2.s.includes('去年的份。')&&W2.v===false&&!W3.s.includes('第二張。明年還有第三張。')&&W3.v===false,J([W1.v,W2.v,W3.v]));
  /* 舊存檔（沒有 ZQ_STICKER3）：演過 ev_ziqing_show2、去過大一的 Q5、現在交往中＝算聽過 */
  const old=async(f,doneShow2,dat)=>{ const L=await (async()=>{ fresh('2028-05-20',14,Object.assign({ZQ_Q12:'nine',ZQ_SHOW2:'came'},f)); H.FRIEND(ZQ); if(dat) H.date(ZQ); if(doneShow2) H.G.events.done.ev_ziqing_show2=true; await runEv('ev_ziqing_q12'); return said(); })(); return L.includes('第三張。說好的。'); };
  const O1=await old({ZQ_SHOW:'came'},true,true), O2=await old({},true,true), O3=await old({ZQ_SHOW:'clap'},false,true), O4=await old({ZQ_SHOW:'half'},true,false);
  check('1-1. AA_526 舊存檔：演過大二下成發、大一 Q5 去過（ZQ_SHOW came／clap／half）、現在交往中＝有；Q5 沒去、沒演過、沒交往＝沒有',O1&&!O2&&!O3&&!O4,J([O1,O2,O3,O4]));
  const miss=(flags,dat)=>{ fresh('2028-05-20',21,Object.assign({ZQ_Q12_SEEN:'missed',EXCHANGE_ROUTE:'TW'},flags)); H.FRIEND(ZQ); if(dat) H.date(ZQ); at('2028-05-20',21); Y34B.zqPhone(H.G); tick(); return msgTexts('p:'+ZQ); };
  const M1=miss({ZQ_SHOW2:'came',ZQ_STICKER3:true},true), M2=miss({ZQ_SHOW2:'came',ZQ_STICKER3:true},false), M3=miss({ZQ_SHOW2:'came',ZQ_STICKER3:false},true);
  check('1-1. 沒到發表會：21:00 製作名單照片後面多兩則「📷（一張插座貓貼紙，貼在她的筆電上）」「第三張 先貼我這」（交往中、ZQ_SHOW2 came）',J(M1)===J(['（照片：製作名單）','📷（一張插座貓貼紙，貼在她的筆電上）','第三張 先貼我這']),J(M1));
  check('1-1. 沒交往、沒聽過那一句（ZQ_STICKER3 false）：照舊只有製作名單那一則',J(M2)===J(['（照片：製作名單）'])&&J(M3)===J(['（照片：製作名單）']),J([M2,M3]));
});
await sec('1-2',async()=>{
  const c15=async(id,flags,mem)=>{ fresh('2026-06-27',14,flags); H.FRIEND(ZQ); for(const m of mem||[]) SOCIAL.remember(ZQ,m,''); H.said=[]; await TERMEND.dayOuting(GM,{ted:{day:'c15',id}}); return said(); };
  const P0=await c15('zq_play',{}), P1=await c15('zq_play',{ZQ_SAW_THIRD:100},['ZQ2_SUMMER_TESTER']);
  check('1-2. zq_play（2026-06-27）第二關：旁白、「第二關。你上次玩到這裡。」、會合「（你掉下去兩次，第三次過了。）」「過了。……第三關我還沒做。」',J(P0)===J(['（她把筆電轉過來。畫面上一隻像素的貓，在插座前面打了一個呵欠。）','第二關。你上次玩到這裡。','（你掉下去兩次，第三次過了。）','過了。……第三關我還沒做。']),J(P0));
  check('1-2. ZQ_SAW_THIRD 多兩句、ZQ2_SUMMER_TESTER 多一句旁白一句台詞（照稿的順序，在會合之前）',J(P1)===J(['（她把筆電轉過來。畫面上一隻像素的貓，在插座前面打了一個呵欠。）','第二關。你上次玩到這裡。','……第三個插座。你說你會看到。','（你看到了。貓在第三個插座前面停了一下，打了一個呵欠。）','（她把一杯飲料推到你面前。）','包飲料。說好的。','（你掉下去兩次，第三次過了。）','過了。……第三關我還沒做。']),J(P1));
  const DM=await c15('zq_demo',{}), P2=await c15('zq_play2',{});
  check('1-2. zq_demo（2027-01-09 資工系館）第三關：「……第三關太難了。我回去改。」只在這一場',J(DM)===J(['（資工系館的電腦教室。螢幕上，一隻貓站在一座橋上。）','第三關。橋是新的。','（你在橋的一半掉下去。）','……第三關太難了。我回去改。'])&&!P0.includes('……第三關太難了。我回去改。'),J(DM));
  check('1-2. zq_play2（2027-07-10）她的新東西（三場不再共用同一組）',J(P2)===J(['（她把筆電轉過來。這次不是那隻貓。）','新的東西。還沒有名字。','（你玩了二十分鐘。她一句話都沒說，在旁邊記筆記。）','……好。我知道哪裡要改了。']),J(P2));
  /* ladder Q2-L4 選「我會注意到。」記 ZQ_SAW_THIRD */
  const st=lad('Y1S2',ZQ,'Q2-L4'); fresh('2026-05-20',15,{}); const G=H.G;
  const r1=STORY.ladReply(st,st.choices[1],G,ZQ); const no=G.flags.ZQ_SAW_THIRD; const r0=STORY.ladReply(st,st.choices[0],G,ZQ);
  check('1-2. 閒聊階梯 Q2-L4 選「我會注意到。」＝記 ZQ_SAW_THIRD（回覆照舊）；選另一個不記',st&&st.choices[0].t==='「我會注意到。」'&&no==null&&G.flags.ZQ_SAW_THIRD===G.day&&r0===st.choices[0].reply&&r1===st.choices[1].reply,J({no,v:G.flags.ZQ_SAW_THIRD}));
  const q6=ev('ev_ziqing_secret_game'), q6t=(q6&&q6.dialogue||[]).map(x=>x.text);
  check('1-2. Q6 沒交往：「……真的？那第二關做好，你再幫我玩。」',q6t.includes('……真的？那第二關做好，你再幫我玩。'));
  fresh('2026-12-20',20,{}); H.G.events.done.ev_ziqing_secret_game=true;
  check('1-2. 期末飯（GF 子晴，看過 Q6）：「你測過的那一關，我改完了。」（拿掉「下學期再給你玩」）；後面的鉤子「要不要玩？」照舊接 zq_play',TERMEND_LINES.GF[ZQ].table(H.G)==='你測過的那一關，我改完了。'&&TERMEND_LINES.HOOK.Y1S2[ZQ].act.c15==='zq_play'&&TERMEND_LINES.HOOK.Y1S2[ZQ].say==='要不要玩？');
  const pick=G=>{ const v=REL_LINES[ZQ].up.FRIEND; for(const x of v) if(!x.if||x.if(G)) return x.l[0]; return null; };
  fresh('2026-05-01',15,{}); H.G.events.done.ev_ziqing_secret_game=true; const b=pick(H.G); at('2026-06-27',15); const a=pick(H.G); fresh('2026-05-01',15,{}); const n=pick(H.G);
  check('1-2. 約她去 Café 的通用句：看過 Q6、2026-06-27 以前＝「第二關做好了。你先玩，我還沒給別人看。」；6/27 以後照舊「新版本做好了…」；沒看過 Q6 照舊',b==='「第二關做好了。你先玩，我還沒給別人看。」'&&a==='「新版本做好了。你先玩，我還沒給別人看。」'&&n==='（她把耳機的一邊遞給你）',J([b,a,n]));
});
await sec('1-3',()=>{ const st=lad('Y1S2',ZQ,'Q2-L5');
  check('1-3. 閒聊階梯 Q2-L5「我想聽妳彈。」→「……成發那天來。我只彈一次。」（tools/ladder/import_ladder.py 疊的，來源寫 AA_525）',!!st&&st.choices[0].t==='「我想聽妳彈。」'&&st.choices[0].reply==='……成發那天來。我只彈一次。'&&LADDER.source.includes('AA_525@'+SHA),st&&J(st.choices[0])); });
await sec('1-4',async()=>{
  const I=VAC.inst('C05','Y1'), run=async(withMsg,q6)=>{ fresh('2026-08-29',22,{dating_heroine_04:true}); H.FRIEND(ZQ); if(q6) H.G.events.done.ev_ziqing_secret_game=true;
    if(withMsg) H.G.msgs.push({th:'p:'+ZQ,from:ZQ,text:'試玩一下 回來給你玩',tag:'vac_tm_'+I.key+'_heroine_04_p'+(D('2026-08-26')),day:D('2026-08-26'),h:0.67});
    H.said=[]; await VAC.outing(GM,{id:'vac_'+I.key+'_re_'+ZQ,day:H.G.day,h:22,vac:{key:I.key,k:'re',who:ZQ}}); return said(); };
  const A=await run(true,true), B=await run(false,true), C=await run(true,false);
  check('1-4. 回國的重逢宵夜（看過 Q6、這一趟收過「試玩一下 回來給你玩」）：最後多「（她把筆電轉過來，推到你面前。）」「說好的。玩。」',!!I&&A.slice(-2).join('|')==='（她把筆電轉過來，推到你面前。）|說好的。玩。'&&A.includes('……走，吃東西。'),J(A));
  check('1-4. 沒收過那一則、沒看過 Q6＝照舊',!B.includes('說好的。玩。')&&!C.includes('說好的。玩。')&&B.includes('……走，吃東西。'),J([B.slice(-2),C.slice(-2)])); });
await sec('1-5',()=>{ const E5=(DATE_WISH.events[ZQ].closing.ending||[]).find(e=>e.note==='交往中（Q12 以前）'), t=E5&&E5.lines.map(x=>x.text);
  check('1-5. 心願約會（子晴）交往中 Q12 以前的結尾：「那座橋，我回去要畫一次。」（tools/date/import_wish.py 疊的，來源寫 AA_525）',J(t)===J(['那座橋，我回去要畫一次。'])&&DATE_WISH.source.includes('AA_525'),J(t)); });
await sec('1-6',async()=>{
  const L=(loc,who)=>(DATE_LINES.loc[loc]||{}).lines[who].hotspots, rep=(loc,pid,who,i)=>L(loc,who)[pid].first.choice[i].reply[0].text;
  check('1-6. 子晴約會第一次的回覆改成不欠：D10「……謝謝。」、D12「謝謝。」、D13「好啦。謝謝。」、D30「好。謝謝。」、D31「好！謝謝！」',
    rep('D10','D10.snack',ZQ,0)==='……謝謝。'&&rep('D12','D12.pier',ZQ,0)==='謝謝。'&&rep('D13','D13.drink',ZQ,2)==='好啦。謝謝。'&&rep('D30','D30.stall',ZQ,0)==='好。謝謝。'&&rep('D31','D31.egg',ZQ,0)==='好！謝謝！',J([rep('D10','D10.snack',ZQ,0),rep('D12','D12.pier',ZQ,0),rep('D13','D13.drink',ZQ,2),rep('D30','D30.stall',ZQ,0),rep('D31','D31.egg',ZQ,0)]));
  /* 第一次選了哪一個 → 第二次的 remember */
  const two=async(who,loc,pid,pick)=>{ fresh('2027-03-06',14,{}); H.FRIEND(who); const t={who,locs:[loc],day:H.G.day,trip:'T9'}; H.said=[]; H.picks=[pick]; await DATE.spotLine(GM,t,pid,0); const f1=JSON.parse(JSON.stringify(H.G.flags));
    const m=DATE.mem(H.G,who,loc); m.last=[pid]; H.said=[]; H.picks=[]; await DATE.spotLine(GM,t,pid,1); const s2=said(); return {f1,s2,F:H.G.flags}; };
  const a=await two(ZQ,'D06','D06.cafe','我請妳'), b=await two(ZQ,'D06','D06.cafe','什麼邏輯');
  check('1-6. D06 第一次選「我請妳。」（「好。下次我請你吃滷味。」）記 ZQ_D06_TREAT；第二次 remember「上次說要請你吃滷味，十點以後半價那間。」',a.f1.ZQ_D06_TREAT!=null&&J(a.s2)===J(['上次說要請你吃滷味，十點以後半價那間。']),J(a.s2));
  check('1-6. D06 第一次選另一個：不記，第二次換通用的「上次也來這裡。」',b.f1.ZQ_D06_TREAT==null&&J(b.s2)===J(['上次也來這裡。']),J(b.s2));
  const c=await two(ZQ,'D15','D15.store','布丁不行'), d=await two(ZQ,'D15','D15.store','全部我請');
  check('1-6. D15 第一次選「布丁不行。」（「……欸，好啦。布丁下次。」）記 ZQ_D15_NEXT；第二次 remember「上次的布丁，今天我要。」「……上次說下次的。」',c.f1.ZQ_D15_NEXT!=null&&J(c.s2)===J(['上次的布丁，今天我要。','……上次說下次的。']),J(c.s2));
  check('1-6. D15 第一次選「全部我請。」：不記，第二次「上次也來這裡。」',d.f1.ZQ_D15_NEXT==null&&J(d.s2)===J(['上次也來這裡。']),J(d.s2));
  check('1-6. AA_526 第 2 節：D15「全部我請。」的回覆＝「……好。我記下來。」（拿掉「下次滷味我請」；tools/date/import_date_lines.py 疊的，來源寫 AA_526）',rep('D15','D15.store',ZQ,0)==='……好。我記下來。'&&L('D15',ZQ)['D15.store'].first.choice[0].t==='「全部我請。」'&&DATE_LINES.source.includes('AA_526_回LAWWW_AA524_525重做九題.md@'+SHA6),rep('D15','D15.store',ZQ,0));
});

/* ================= 2 沛珊 ================= */
await sec('2-1',async()=>{
  const setup=(rom,ny,count)=>{ fresh('2027-11-20',17,{}); const r=SOCIAL.rel(PS); r.fam=65; r.trust=50; r.comf=45; r.npcRom=rom; r.rom=40; SOCIAL.remember(PS,'FIRST_MET','');
    if(ny) H.G.flags.PS_NOT_YET={n:1,day:H.G.day-10}; const Lg=DATE.log(H.G,PS); Lg.count=count; Lg.wish=true; Lg.notYetN=ny?1:0; if(ny) Lg.notYet={day:H.G.day-10,count:count-1,n:1}; return Lg; };
  const go=async()=>{ H.said=[]; H.opts=[]; await DATE.confessOffer(GM,{who:PS,locs:['D05']}); return said(); };
  setup(70,true,6); const A=await go(); const datingA=!!H.G.flags.dating_classmate_peishan||(H.G.flags.romance&&H.G.flags.romance[PS]&&H.G.flags.romance[PS].status==='dating'); const told=H.G.flags.PS_NOT_YET_TOLD;
  check('2-1. 「還沒」以後下一次正式校外約會的結尾，告白選項以前她先開口；戀愛到答應線＝「上次你說的那件事。」「……我想好了。好！」→ 交往、不出告白選項',J(A)===J(['上次你說的那件事。','……我想好了。好！'])&&datingA&&!H.opts.length&&told&&told.res==='yes',J({A,opts:H.opts,told}));
  const Lg=setup(56,true,6); const B=await go(); const t2=H.G.flags.PS_NOT_YET_TOLD;
  check('2-1. 還不到答應線＝「上次你說的那件事，我還在想。……我沒有忘喔。」，這一次不出選項，「還沒」的兩週從今天重算（記 PS_NOT_YET_TOLD）',J(B)===J(['上次你說的那件事，我還在想。……我沒有忘喔。'])&&!H.opts.length&&t2&&t2.res==='still'&&Lg.notYet.day===H.G.day&&Lg.notYet.count===6&&!H.G.flags.dating_classmate_peishan,J({B,t2,ny:Lg.notYet}));
  const C=await go();
  check('2-1. 同一次「還沒」只說一次（再約一次＝照現有，沒有她先開口的那一句）',!C.includes('上次你說的那件事，我還在想。……我沒有忘喔。')&&!C.includes('上次你說的那件事。'),J(C));
  setup(70,false,6); const D0=await go(); setup(70,true,5); H.G.flags.PS_NOT_YET.day=H.G.day; DATE.log(H.G,PS).notYet.count=5; const D1=await go();
  check('2-1. 沒有 PS_NOT_YET、或還是「還沒」那一次約會＝不說',!D0.some(t=>/上次你說的那件事/.test(t))&&!D1.some(t=>/上次你說的那件事/.test(t)),J([D0,D1]));
});
await sec('2-2',async()=>{
  fresh('2026-07-15',8,{dating_classmate_peishan:true}); H.FRIEND(PS); H.date(PS); INV.addContact&&INV.addContact(H.G,PS);
  const trip=async()=>{ H.said=[]; H.opts=[]; H.picks=[0,0,0,0]; await HV.play(GM,{id:'hv_ps_'+H.G.day,hv:{id:PS}}); return said(); };
  const T1=await trip(), f1=H.G.flags.PS_SCHOOLROAD;
  check('2-2. 去台中第一次（交往中、考上台南以前）送行「下次來，我帶你去我國中走路上學那條路。」＝記 PS_SCHOOLROAD',T1.includes('下次來，我帶你去我國中走路上學那條路。')&&f1!=null&&f1!=='walked',J({f1,tail:T1.slice(-2)}));
  at('2026-07-29',8); const T2=await trip();
  check('2-2. 第二次：先走那一條（旁白、「國中三年，每天走這條！」「……那時候覺得好遠。現在走起來好近。」），記 PS_SCHOOLROAD walked',seq(['（她帶你走了一條窄窄的巷子，兩邊都是透天厝。）','國中三年，每天走這條！','……那時候覺得好遠。現在走起來好近。'])&&H.G.flags.PS_SCHOOLROAD==='walked'&&!T2.includes('我小時候在這裡學騎腳踏車。我爸在後面扶，扶到一半就偷偷放手。'),J(T2.slice(0,8)));
  at('2026-08-12',8); const T3=await trip(); at('2026-08-19',8); const T4=await trip();
  check('2-2. 走過以後不再走；三選一的輪流照舊（第三次＝公園、第四次＝書店：那條路不佔順位）',!T3.includes('國中三年，每天走這條！')&&T3.includes('我小時候在這裡學騎腳踏車。我爸在後面扶，扶到一半就偷偷放手。')&&T4.includes('這間比舊路書房大很多。可是我比較喜歡舊路書房。'),J([T3.slice(2,4),T4.slice(2,4)]));
  fresh('2026-07-15',8,{dating_classmate_peishan:true}); H.FRIEND(PS); H.date(PS); H.G.flags.HV_N={classmate_peishan:1}; const T5=await trip();
  check('2-2. 沒有聽過那一句（沒有 PS_SCHOOLROAD）＝照舊三選一',!T5.includes('國中三年，每天走這條！'),J(T5.slice(2,4)));
});
await sec('2-3',async()=>{
  const prep=sentCard=>{ fresh('2026-06-30',13,{},'campus'); H.FRIEND(PS); if(sentCard){ PHONE.at(H.G,D('2026-06-25'),18.5,[{th:'p:'+PS,from:PS,text:'她們有做卡片給你。我先收著。'}],'wz_p4_cards'); tick(); } };
  const talk=async()=>{ H.said=[]; for(const f of STORY.PRE_TALK){ try{ await f(GM,{name:'沛珊',charId:PS},PS); }catch(e){} } return said(); };
  prep(true); const A=await talk(), g=H.G.flags.PS_CARDS_GIVEN; const okA=seq(['（她從包包拿出三張卡片。）','課輔班的！她們畫的你。……長得不太像。'],A); const B=await talk();
  check('2-3. 收過「她們有做卡片給你。我先收著。」以後第一次和她說話（STORY.PRE_TALK）：「（她從包包拿出三張卡片。）」「課輔班的！她們畫的你。……長得不太像。」，記 PS_CARDS_GIVEN',okA&&g!=null,J({A,g}));
  check('2-3. 只給一次；PRIVTALK 清單有 ps_cards（edit：旁邊有人等她一個人，保底 7 天）',!B.includes('課輔班的！她們畫的你。……長得不太像。')&&!!PRIVTALK.byKey.ps_cards&&PRIVTALK.byKey.ps_cards.gate==='edit'&&PRIVTALK.byKey.ps_cards._wired===true,J(B));
  prep(false); const C=await talk();
  check('2-3. 沒收過那一則＝不給',!C.includes('課輔班的！她們畫的你。……長得不太像。'));
});
await sec('2-4',async()=>{
  const ph=(FEED_Y1S1.dms||[]).find(x=>x&&x.id==='ps_phil'), o=ph&&ph.ask.opts.find(x=>x.k==='next');
  check('2-4 P-4. 哲學概論的動態「明年修。」→「明年……好！！」',!!o&&J(o.r)===J(['明年……好！！']),J({ph:!!ph,ask:ph&&ph.ask}));
  const p5=lad('Y2S1',PS,'P3-L3'), p6=lad('Y3S1',PS,'P5-L2');
  check('2-4 P-5. 閒聊階梯 P3-L3 選項②「妳舉手了嗎？」→「……還沒！不要一直問！」',!!p5&&p5.choices[1].t==='「妳舉手了嗎？」'&&p5.choices[1].reply==='……還沒！不要一直問！',p5&&J(p5.choices[1]));
  check('2-4 P-6. 閒聊階梯 P5-L2「教我。」→「不行。這是家傳的！」',!!p6&&p6.choices[1].reply==='不行。這是家傳的！',p6&&J(p6.choices[1]));
  fresh('2026-03-12',21,{dating_classmate_peishan:true},'wancai'); H.FRIEND(PS); await runEv('ev_peishan_bohan_w4');
  check('2-4 P-6. 交往中，讀書會後：「今天那一題，你講得很好。……我想多聽你講。」',has('今天那一題，你講得很好。……我想多聽你講。'),J(said()));
  const W=s=>(ENC_WALK.walks||ENC_WALK.walk||[]).find?(ENC_WALK.walks||ENC_WALK.walk||[]).find(x=>x.who===PS&&x.spot===s):null;
  const all=JSON.stringify(ENC_WALK);
  check('2-4 P-6. 偶遇道別（交往中）D12「今天買的書，第一本是繪本。……給課輔班的。」、D20「回程的車上，我要把今天的事寫下來！」',all.includes('"dating":"今天買的書，第一本是繪本。……給課輔班的。"')&&all.includes('"dating":"回程的車上，我要把今天的事寫下來！"'));
  check('2-4 P-6. 重考期回覆池 share_food「看起來好好吃！！我考完要吃很多！」',J(HOMETOWN_LINES[PS].keep.replies.share_food)===J(['看起來好好吃！！我考完要吃很多！']));
  const L=(loc)=>DATE_LINES.loc[loc].lines[PS].hotspots;
  check('2-4 P-6. 約會：D15「……我家的早餐比這個好吃！」、D08、D18「謝謝！」',L('D15')['D15.store'].first.choice[0].reply[0].text==='……我家的早餐比這個好吃！'&&L('D08')['D08.train'].first.choice[0].reply[0].text==='謝謝！'&&L('D18')['D18.snack'].first.choice[1].reply[0].text==='謝謝！');
  const two=async pick=>{ fresh('2027-03-06',14,{}); H.FRIEND(PS); const t={who:PS,locs:['D05'],day:H.G.day,trip:'T9'}; H.said=[]; H.picks=[pick]; await DATE.spotLine(GM,t,'D05.cafe',0); const f=H.G.flags.PS_D05_EGG;
    DATE.mem(H.G,PS,'D05').last=['D05.cafe']; H.said=[]; await DATE.spotLine(GM,t,'D05.cafe',1); const s2=said(); H.said=[]; await DATE.spotLine(GM,t,'D05.cafe',1); return {f,s2,s3:said(),F:H.G.flags.PS_D05_EGG}; };
  const a=await two('我請妳'), b=await two('小杯');
  check('2-4 P-6. D05 第一次選「我請妳。」（「……那下次我請你吃蛋餅。說好了。」照留）記 PS_D05_EGG；remember 多「（她把一盒蛋餅放到你面前。）」「說好的！」（只拿一次）',a.f!=null&&J(a.s2)===J(['上次我們坐那個位子。今天被坐走了。','（她把一盒蛋餅放到你面前。）','說好的！'])&&a.F==='paid'&&J(a.s3)===J(['上次我們坐那個位子。今天被坐走了。'])&&L('D05')['D05.cafe'].first.choice[0].reply[0].text==='……那下次我請你吃蛋餅。說好了。',J(a));
  check('2-4 P-6. D05 選另一個：不記，remember 照舊',b.f==null&&J(b.s2)===J(['上次我們坐那個位子。今天被坐走了。']),J(b));
});

/* ================= 3 可昕 ================= */
const dinner=async(term,key,h,flags,picks)=>{ fresh(key,h,Object.assign({dating_kexin:true},flags)); H.FRIEND(KX); H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); await TERMEND.kexinDinner(GM,{term,kind:'kexin'}); return said(); };
await sec('3-1',async()=>{
  const A=await dinner('Y3S1','2028-01-18',18,{KX_XMAS:{2:'went',3:'video'}},['題目哪裡奇怪','河濱']);
  check('3-1. 大三上期末飯（2027 聖誕視訊 KX_XMAS[3] video、2026 收過卡片 KX_XMAS[2] went）：飯桌後面交換禮物、「還有，去年說的。今年的第二頁，你排。」、二選一、會合；記 KX_PAGE2_MINE',
    seq(['寒假你來高雄。……我們都沒去過的地方，我來排。','（吃完飯，她從包包拿出一個小盒子，推過來。）','聖誕的。說好考完換。','（你也把準備好的那一份拿出來。）','還有，去年說的。今年的第二頁，你排。','……抄我的。好。','（那一晚的第二頁，是你排的。）'])&&J(H.opts[H.opts.length-1])===J(['「河濱，看燈。」','「山上，看夜景。」'])&&H.G.flags.KX_PAGE2_MINE==='river',J(A.slice(2)));
  const B=await dinner('Y3S1','2028-01-18',18,{KX_XMAS:{3:'missed'}},[0,'山上']);
  check('3-1. 只有 2027 聖誕（沒視訊 missed）＝交換禮物，沒有第二頁',B.includes('聖誕的。說好考完換。')&&!B.includes('還有，去年說的。今年的第二頁，你排。')&&H.G.flags.KX_PAGE2_MINE==null,J(B.slice(2)));
  const C=await dinner('Y3S1','2028-01-18',18,{KX_XMAS:{2:'went'}},[0]);
  check('3-1. 2027 聖誕沒記（期末飯在聖誕以前、或沒交往）＝都沒有',!C.includes('聖誕的。說好考完換。')&&!C.includes('還有，去年說的。今年的第二頁，你排。'),J(C.slice(2)));
});
await sec('3-2',async()=>{
  const s=USL.SUM.find(x=>x.d==='2028-10-25'); fresh('2028-10-25',19,{EXCHANGE_ROUTE:'US',dating_kexin:true,KX_ANNIV:{4:'video'}});
  const ok1=USL.sumOk(H.G,s), due1=USL.sumDue(H.G,(D('2028-10-25'))*24+17,(D('2028-10-25'))*24+19).some(x=>x.d==='2028-10-25');
  H.G.flags.KX_ANNIV={4:'missed'}; const ok2=USL.sumOk(H.G,s); H.G.flags.KX_ANNIV={4:'video'}; H.G.flags.dating_kexin=false; const ok3=USL.sumOk(H.G,s);
  check('3-2. 美國生活的日期旁白 2028-10-25 18:00「（信箱裡有一張臺灣寄來的卡片。第一頁寫著：第四年。）」：交往中、KX_ANNIV[4] video 才有',!!s&&s.h===18&&USL.sumLine(H.G,s)==='（信箱裡有一張臺灣寄來的卡片。第一頁寫著：第四年。）'&&ok1&&due1&&!ok2&&!ok3,J({ok1,due1,ok2,ok3}));
  const A=await dinner('Y4S1','2029-01-17',18,{EXCHANGE_ROUTE:'US',KX_ANNIV:{4:'video'}},[0]);
  check('3-2. 大四上期末飯（美國路線、KX_ANNIV[4] video）：飯桌最後「摩天輪。說好的。」＋旁白，在收尾旁白之前',seq(['摩天輪。說好的。','（吃完飯，你們去搭了摩天輪。轉到最高的時候，她靠著窗，沒有說話。）','（她送你到停車場，站著等你倒車出去。）']),J(A.slice(-4)));
  const B=await dinner('Y4S1','2029-01-17',18,{EXCHANGE_ROUTE:'TW',KX_ANNIV:{4:'video'}},[0]), C=await dinner('Y4S1','2029-01-17',18,{EXCHANGE_ROUTE:'US',KX_ANNIV:{4:'missed'}},[0]);
  check('3-2. 臺灣路線、沒接視訊＝沒有摩天輪',!B.includes('摩天輪。說好的。')&&!C.includes('摩天輪。說好的。'));
});
await sec('3-3',async()=>{
  fresh('2028-04-24',18,{dating_kexin:true}); H.FRIEND(KX); await runEv('ev_kexin_birthday_y3');
  check('3-3. 大三生日「三……三十分鐘到了。第三個明年說。」＝記 KX_WISH3',has('三……三十分鐘到了。第三個明年說。')&&H.G.flags.KX_WISH3===true);
  const p=w=>{ fresh('2029-04-23',21,Object.assign({dating_kexin:true,EXCHANGE_ROUTE:'TW'},w?{KX_WISH3:true}:{})); H.FRIEND(KX); STORY.phoneRules(GM); tick(); const m=(H.G.msgs||[]).filter(x=>x.tag==='y4_kx_bday'); return {t:m.map(x=>x.text),ask:m.filter(x=>x.ask).map(x=>x.text)}; };
  const A=p(true), B=p(false);
  check('3-3. 2029-04-23 21:00「明天我生日。今年不要慶祝…」後面多「第三個願望。去年說今年說。」「我們兩個都考過。」（KX_WISH3；回覆掛在最後一則）',J(A.t)===J(['明天我生日。今年不要慶祝，我們都在準備考試。','第三個願望。去年說今年說。','我們兩個都考過。'])&&J(A.ask)===J(['我們兩個都考過。']),J(A));
  check('3-3. 沒有 KX_WISH3＝照舊一則',J(B.t)===J(['明天我生日。今年不要慶祝，我們都在準備考試。'])&&J(B.ask)===J(['明天我生日。今年不要慶祝，我們都在準備考試。']),J(B));
});
await sec('3-4',async()=>{
  const anniv=async(n,flags,picks)=>{ fresh(STORY.KX_ANNIV_DAYS[n],18.5,Object.assign({dating_kexin:true},flags)); H.FRIEND(KX); const e=ev('ev_kexin_anniversary_yn'); e.beforeOuting(H.G,GM,{year:n,ap:'shop'}); H.said=[]; H.picks=(picks||[]).slice(); await EVENTS.run(e); return said(); };
  const A=await anniv(3,{},[0]), f=H.G.flags.KX_CARD_MINE;
  check('3-4. 第三年「明年換我寫。」→「好。要手寫喔。」＝記 KX_CARD_MINE',A.includes('好。要手寫喔。')&&f===true,J(A.slice(-3)));
  const B=await anniv(4,{KX_CARD_MINE:true},[0]), C=await anniv(4,{},[0]);
  check('3-4. 第四年（KX_CARD_MINE）：「（這一次，第一張卡片是你寫的。你把它推過去。）」「（翻開，讀完）……你的字。」「第四年。……明年這一天，我們都畢業了。」，後面接現有的三個選項',seq(['（這一次，第一張卡片是你寫的。你把它推過去。）','（翻開，讀完）……你的字。','第四年。……明年這一天，我們都畢業了。','好。寫進表格。'],B)&&!B.includes('（把卡片翻到第一頁）第四年。……明年這一天，我們都畢業了。'),J(B.slice(-6)));
  check('3-4. 第四年沒有 KX_CARD_MINE＝照舊「（把卡片翻到第一頁）第四年。……」',C.includes('（把卡片翻到第一頁）第四年。……明年這一天，我們都畢業了。')&&!C.includes('（翻開，讀完）……你的字。'));
  const D5=await anniv(5,{KX_CARD_MINE:true},[0]), E5=await anniv(5,{},[0]);
  check('3-4. 第五年：KX_CARD_MINE＝「（把卡片翻到第一頁）第五年。……明年的卡片，又換你寫。」；沒有照舊',D5.includes('（把卡片翻到第一頁）第五年。……明年的卡片，又換你寫。')&&E5.includes('（把卡片翻到第一頁）第五年。……明年的卡片，換你寫。'),J([D5.slice(-4),E5.slice(-4)]));
  const v=ev('ev_kexin_anniversary_video');
  check('3-4. 美國路線第四年（視訊）不改',J(v.dialogue.filter(x=>x.text).map(x=>x.text))===J(['週年快樂。你那邊是早上吧。','卡片我寄了，下禮拜才會到。','……你回來我們再去一次摩天輪。']));
});
await sec('3-5',()=>{ const t=JSON.stringify(STORY_EVENTS.map(e=>e.dialogue||[]));
  check('3-5. 「下次你來，我們吃山下那家。」（原「山上那家」）',t.includes('下次你來，我們吃山下那家。')&&!t.includes('下次你來，我們吃山上那家。')); });
await sec('3-6',async()=>{
  const day=async(flags,dat,h)=>{ fresh('2027-07-05',h,flags); H.FRIEND(KX); if(dat) H.date(KX); STORY.phoneRules(GM); tick(); return {m:(H.G.msgs||[]).filter(x=>x.tag==='aa525_kx_intern_rem').map(x=>x.text),q:OUT.get(H.G,'aa525_kx_intern_call')}; };
  const A=await day({KX_SUMMER:'call'},true,18), B=await day({KX_SUMMER:'call'},true,17.5), C=await day({KX_SUMMER:'kind'},true,18), Dd=await day({KX_SUMMER:'call'},false,18);
  check('3-6. 2027-07-05（KX_SUMMER call、交往中）18:00 系統字「今天是可昕實習第一天。」＋18:00～23:00「打給她」（電話）',J(A.m)===J(['今天是可昕實習第一天。'])&&!!A.q&&A.q.call===true&&A.q.verb==='打給她'&&A.q.h===18&&A.q.h+A.q.late===23&&A.q.ev==='ev_aa525_kx_intern_call',J(A));
  check('3-6. 18:00 以前沒有；沒選「第一天下班，我打給妳。」、沒交往＝沒有',!B.m.length&&!B.q&&!C.m.length&&!C.q&&!Dd.m.length&&!Dd.q,J([B,C,Dd].map(x=>[x.m.length,!!x.q])));
  fresh('2027-07-05',19,{KX_SUMMER:'call',dating_kexin:true}); H.FRIEND(KX); await runEv('ev_aa525_kx_intern_call');
  check('3-6. 打了＝電話「……喂。你真的打了。」「影印了一整天。」「影印機我取了名字。叫債務人。」',J(said())===J(['……喂。你真的打了。','影印了一整天。','影印機我取了名字。叫債務人。']),J(said()));
  fresh('2027-07-05',18,{KX_SUMMER:'call',dating_kexin:true}); H.FRIEND(KX); STORY.phoneRules(GM); at('2027-07-05',23.1); const ex=OUT.expire(H.G).map(q=>q.id);
  check('3-6. 23:00 以前沒打＝過期（沒有後續）',ex.includes('aa525_kx_intern_call')&&!ev('ev_aa525_kx_intern_call').outingMissed,J(ex));
});
await sec('3-7',async()=>{
  fresh('2027-05-01',15,{}); const G=H.G, s1=lad('Y2S2',KX,'K4-L5'), s2=lad('Y1S2',KX,'K2-L6');
  STORY.ladReply(s1,s1.choices[0],G,KX); STORY.ladReply(s2,s2.choices[0],G,KX); const none=[G.flags.KX_CAKE_YOU,G.flags.KX_TASSEL_PROMISE];
  STORY.ladReply(s1,s1.choices[1],G,KX); STORY.ladReply(s2,s2.choices[1],G,KX);
  check('3-7. 閒聊階梯 K4-L5 選「下次換我挑。」記 KX_CAKE_YOU；K2-L6 選「明年我們一起看。」記 KX_TASSEL_PROMISE（另一個選項不記）',s1.choices[1].t==='「下次換我挑。」'&&s2.choices[1].t==='「明年我們一起看。」'&&none.every(x=>x==null)&&G.flags.KX_CAKE_YOU!=null&&G.flags.KX_TASSEL_PROMISE!=null,J(none));
  const bd=c=>{ fresh('2028-04-23',21,Object.assign({dating_kexin:true,EXCHANGE_ROUTE:'TW',KX_BDAY:{1:'met',2:'class'}},c?{KX_CAKE_YOU:1}:{})); H.FRIEND(KX); STORY.phoneRules(GM); tick(); return (H.G.msgs||[]).filter(x=>x.tag==='y3_kx_bday_ask').map(x=>x.text); };
  const A=bd(true), B=bd(false);
  check('3-7. 2028-04-23 21:00「明天我生日。今年你不用想了，我想好了。」後面多「……蛋糕你挑。只有這個你挑。」（KX_CAKE_YOU）；沒有照舊',A[0]==='明天我生日。今年你不用想了，我想好了。'&&A[1]==='……蛋糕你挑。只有這個你挑。'&&A.length===4&&B.length===3&&!B.includes('……蛋糕你挑。只有這個你挑。'),J([A,B]));
  const y2=async(v,t)=>{ fresh('2027-04-24',19,Object.assign({dating_kexin:true},t?{KX_TASSEL_PROMISE:1}:{})); H.FRIEND(KX); const e=ev('ev_kexin_birthday_y2'); e.beforeOuting(H.G,GM,{bdV:v}); H.said=[]; await EVENTS.run(e); return said(); };
  const C=await y2('shop',true), Dd=await y2('gg',true), E2=await y2('class',false);
  check('3-7. 大二生日到木柵大學的版本（KX_TASSEL_PROMISE）開頭「（木柵大學門口的流蘇開了。白白的一整片。）」；公館的版本、沒說好的＝沒有',C[0]==='（木柵大學門口的流蘇開了。白白的一整片。）'&&!Dd.includes('（木柵大學門口的流蘇開了。白白的一整片。）')&&!E2.includes('（木柵大學門口的流蘇開了。白白的一整片。）'),J([C[0],Dd[0],E2[0]]));
});
await sec('3-8',async()=>{
  check('3-8 K-10. 寒暑假送上車（交往中）「開學我就上去了。台北見。」',HOMETOWN_LINES[KX].send.dating[0]==='開學我就上去了。台北見。');
  const t=JSON.stringify(ev('ev_kexin_trip_summer_y2')||STORY_EVENTS.find(e=>JSON.stringify(e.dialogue||[]).includes('下次找一個我們都沒去過的地方')));
  check('3-8 K-12. 「……好。下次找一個我們都沒去過的地方。」',JSON.stringify(STORY_EVENTS.map(e=>e.dialogue||[])).includes('……好。下次找一個我們都沒去過的地方。'));
  const k13=lad('Y1S2',KX,'K2-L8');
  check('3-8 K-13. 閒聊階梯 K2-L8「我去找妳。」→「……真的喔？那我帶你去夜市。」',!!k13&&k13.choices[0].reply==='……真的喔？那我帶你去夜市。');
  const s=stripComments(SRC('src/story3d.js'));
  check('3-8 K-14. 經濟系 E12 的兩個回覆：「……牠脖子很短。就這樣。」「……不用補。睡飽一點。」',s.includes("say:[K('……牠脖子很短。就這樣。')]")&&s.includes("say:[K('……不用補。睡飽一點。')]"));
});
await sec('3-9',async()=>{
  const kh=async(noshow,call)=>{ fresh('2027-08-07',10,Object.assign({dating_kexin:true},noshow?{Y2R2_K14_NOSHOW:true}:{})); H.FRIEND(KX); if(call) H.G.events.done.ev_kexin_summer_plan_call=true; await runEv('ev_kexin_trip_summer_y2',['恭喜']); return {s:said(),o:H.opts.slice()}; };
  const A=await kh(true,true), B=await kh(false,true), C=await kh(true,false), Dd=await kh(false,false);
  check('3-9. 高雄的兩天開頭（6/2 沒去、晚上的電話說了「那你下次要當面恭喜我。」）：「……當面。」→ 選項只有「恭喜。」→「好。收到了。」，在「這週我影印了一千兩百頁…」之前',seq(['……當面。','好。收到了。','這週我影印了一千兩百頁。今天不要有紙。'],A.s)&&J(A.o[0])===J(['「恭喜。」']),J({s:A.s.slice(0,6),o:A.o[0]}));
  check('3-9. AA_526 第 2 節：沒答應 6/2（沒有 Y2R2_K14_NOSHOW）但接到那通電話的也補，台詞一樣',seq(['……當面。','好。收到了。','這週我影印了一千兩百頁。今天不要有紙。'],B.s)&&J(B.o[0])===J(['「恭喜。」']),J(B.s.slice(3,6)));
  check('3-9. 沒演過那通電話（不管有沒有 NOSHOW）＝沒有',!C.s.includes('……當面。')&&!Dd.s.includes('……當面。'));
});
await sec('3-10',async()=>{
  const mk=sentMsg=>dinner('Y4S1','2029-01-17',18,{EXCHANGE_ROUTE:'US'},[0]).then(x=>x);
  fresh('2029-01-17',18,{dating_kexin:true,EXCHANGE_ROUTE:'US'}); H.FRIEND(KX); PHONE.at(H.G,D('2028-12-14'),7.5,[{th:'p:kexin',from:'kexin',text:'你說了四年的麵。……今天少你一碗。'},{th:'p:kexin',from:'kexin',text:'23 號回來，第一碗我請。'}],'y4_a23_us_kx'); tick();
  H.said=[]; H.opts=[]; H.picks=[0]; await TERMEND.kexinDinner(GM,{term:'Y4S1',kind:'kexin'}); const A=said();
  check('3-10. 大四上期末飯（美國路線、交往中、收過「23 號回來，第一碗我請。」）：飯桌一開始「第一碗。說好我請。」「（她先去付了錢。）」',A[0]==='（山下那家店，她點了兩人份，沒有問你。）'&&seq(['第一碗。說好我請。','（她先去付了錢。）','大四了。……我們期末考完，就剩一個學期。']),J(A.slice(0,5)));
  const B=await dinner('Y4S1','2029-01-17',18,{EXCHANGE_ROUTE:'US'},[0]);
  check('3-10. 沒收過那兩則＝沒有',!B.includes('第一碗。說好我請。'));
});
await sec('3-11',async()=>{
  const k16=lad('Y2S1',KX,'K3-L5'), k17=lad('Y3S2',KX,'K6-L6');
  check('3-11. 閒聊階梯 K3-L5「下次介紹給我。」→「圖書館前面那兩隻，一隻叫原告，一隻叫被告。」；K6-L6「要我幫妳看嗎？」→「不要。我自己寫。」',!!k16&&k16.choices[1].reply==='圖書館前面那兩隻，一隻叫原告，一隻叫被告。'&&!!k17&&k17.choices[1].reply==='不要。我自己寫。');
  const s=stripComments(SRC('src/story3d.js')), y=stripComments(SRC('src/y2r2_3d.js'));
  check('3-11. story3d.js「好，那下週換你請。」→「好。」、「這題我要偷走。下次出給你。」→「這題我要偷走。」；y2r2_3d.js「嗯。……下次講給你聽。」→「嗯。……講不清楚。」',
    s.includes("{t:'這週不行，下週換我請。',set:{KX_YULE:'no'},say:[K('好。')]}")&&s.includes("say:[K('這題我要偷走。')]")&&y.includes("{t:'妳很喜歡這門課。',say:[{from:'kexin',text:'嗯。……講不清楚。'}]}"));
  check('3-11. 出國的計畫「歐洲要排很久。……我先存錢。」',VAC_DATA&&JSON.stringify(VAC_DATA).includes('"later":"歐洲要排很久。……我先存錢。"'));
  check('3-11. AA_526 撤回：大三上期末飯第二句照原句「寒假你來高雄。……我們都沒去過的地方，我來排。」；「寒假要去哪裡？」→「不告訴你。來了就知道。」不改',J(TERMEND_LINES.KX.Y3S1.table)===J(['期末報告我寫房東能不能進房客的房間。老師說題目很奇怪，可是給過了。','寒假你來高雄。……我們都沒去過的地方，我來排。'])&&J(TERMEND_LINES.KX_ASK.Y3S1[1].r)===J(['不告訴你。來了就知道。']));
  const e18=async r2=>{ fresh('2025-04-24',19,{},'gongguan'); if(r2) H.G.events.done.ev_y0_r2=true; H.G.stage='econ'; await runEv('ev_y0_e18b',['請她吃一碗豆花']); return said(); };
  const A=await e18(true), B=await e18(false);
  check('3-11. AA_356 漏的一筆：演過豆花賭注（「所以你欠我一碗。」）、4/24 生日選「請她吃一碗豆花」＝多「……欠的那一碗。好，扣掉。」',seq(['難怪你剛剛一直不見。','……欠的那一碗。好，扣掉。'],A)&&!B.includes('……欠的那一碗。好，扣掉。')&&B.includes('難怪你剛剛一直不見。'),J([A.slice(-3),B.slice(-2)]));
});
await sec(4,async()=>{
  const nf=['ZQ_SAW_THIRD','ZQ_D06_TREAT','ZQ_D15_NEXT','PS_NOT_YET_TOLD','PS_SCHOOLROAD','PS_D05_EGG','KX_PAGE2_MINE','KX_WISH3','KX_CARD_MINE','KX_CAKE_YOU','KX_TASSEL_PROMISE'];
  const all=listSrc().map(f=>SRC(f)).join('\n'), miss=nf.filter(f=>!all.includes(f)||!inDoc('`'+f+'`'));
  check('4. 第 4 節的新旗標（'+nf.length+' 個）都在稿裡、程式都有記',!miss.length,J(miss));
  check('4. AA_526 的新旗標 ZQ_STICKER3 在 AA_526 稿裡、程式有記（y2r2_3d.js）、有讀（y34b3d.js）',DOC6.includes('`ZQ_STICKER3`')&&SRC('src/y2r2_3d.js').includes('ZQ_STICKER3:true')&&SRC('src/y34b3d.js').includes('ZQ_STICKER3'));
  /* 舊存檔：旗標都沒有＝照舊（上面每一條的「沒有」那一半）；這裡再跑一次 Q12、zq_play、第四年，舊存檔不丟例外 */
  fresh('2028-05-20',14,{ZQ_Q12:'nine'}); H.FRIEND(ZQ); delete H.G.flags.ZQ_SHOW2; let ok=true; try{ await runEv('ev_ziqing_q12'); }catch(e){ ok=false; }
  check('4. 舊存檔（沒有這一版的旗標）跑得過、沒有新句子',ok&&!has('第三張。說好的。'));
});
H.done();
})();
