// 多線交往第一批（AA_422 @5156f143；台詞照 AA_227／AA_228 原句）——不需要瀏覽器。src/multirel3d.js、src/data/multirel_lines.js
//   0  載入、接線（index.html 在 GAME.boot 前、資料檔在前；TERMEND／DATE／ROM／EVENTS／STORY 都包上）
//   1  第一次正式校外約會的問句（0-1）：六位的台詞與記錄（照實＝YT_HONEST、閃避＝YT_DODGED）、一位一次、不知道就不問、交往中不問、這一趟沒有快速約會；學姊三個時期、芷若「她知道。」只在 Y 真的知道
//   2  知情版心意邀約（0-2）：六位兩條路、承諾（exclusive／handle）、讓我想想；acceptsOpen true＝交往＋OPEN_OK（使用者 10-27 回答 C：遊戲裡七位都打開，關著的情形把那一位改回 false 測；學姊第一次一律讓我想想，AA_474 1-2）；第二次沒做到＝BROKE＋之後不發；做到了＝照原本的第二次；芷若三問；可昕沒有心意邀約＝不演
//   3  發現（0-3）：七位的台詞、時機（以安說話／讀書會散會、子晴 22:00、芷若打烊、語彤顧店、可昕當晚、沛珊散會）、變體（未滿 7 天、曾說謊、比她早、坦白、違約、還有誰、國外視訊、李冠宏、說溜嘴）
//   4  子晴芷若兩個人一起（4-4）、《同一頁》（1-4）、子晴 Q8 下一次見面（4-5）、傳開（以安→沛珊）
//   5  沒有和別人交往＝什麼都沒有；沛珊 2026-12-16 以後不會有「她後來才發現」；舊存檔的預設值
//   台詞照 AA_425 審稿更正（@310d6cc67）換過的版本（不同人說同一句、所在地、問句的回答；可昕知情版心意邀約刪）
// 修改前（開發分支 8cfc1b7de）：沒有 src/multirel3d.js——FAIL。用法：node tests/aa422_multirel_unit.js
// AA_503 第 14 節後補第 7 點（PRIV-AUNT-1028，企劃線 5ec2fe771）：語彤《等我下班一下》「今天很忙喔？」那一段的 auntIn 原本 19:00 以後＝阿姨在，改看 3D 的阿姨在不在麵店
//   （MREL.auntIn → HCIRCLE.labelIn）：第 3 段語彤那三項用假的 HCIRCLE 指定在不在（18:00 不在＝「阿姨呢？」、18:30 在＝「好啦，你們年輕人。」、19:30 不在＝照樣「阿姨呢？」）；
//   修改前（只拿掉這一次 src 的改動：src/multirel3d.js 等換回開發分支 1db6e495c，2026-10-28 實際跑）：FAILED 2（18:30 阿姨在、19:30 阿姨不在）、PASS 174；修改後 ALL PASS（176 項）
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(MREL|MULTIREL_LINES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
let ok=true, err=''; try{ load('src/data/multirel_lines.js'); load('src/multirel3d.js'); }catch(e){ ok=false; err=String(e&&e.stack||e); }
const X=()=>typeof MREL!=='undefined'?MREL:null;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); } };
const A1='heroine_01', ZR='heroine_02', YT='heroine_03', ZQ='heroine_04', SIS='heroine_05', PS='classmate_peishan', KX='kexin';
const setT=(key,h)=>{ H.G.day=STORY.dayOfKey(key); H.G.hour=h; H.G.weekday=CALENDAR.dateOf(H.G.day).wd%7; };
const T=()=>H.said.map(s=>s.t);
const seq=arr=>{ const t=T(); let i=0; for(const a of arr){ const k=t.indexOf(a,i); if(k<0) return false; i=k+1; } return true; };   /* 這幾句照順序出現 */
const fresh=(key,h,zone,fl)=>{ H.fresh(key,h,zone||'campus',Object.assign({},fl||{})); if(X()) X()._gm=GM; return H.G; };
const learn=(x,y,src,at)=>ROM.learn(H.G,x,y,src||'test',at);
const dateOpen=async(who)=>DATE.arriveLine(GM,{who,locs:['D07'],day:H.G.day,trip:'T9999'},5,{});
const walk=async(who,term,picks)=>{ H.picks=picks.slice(); return TERMEND.walkHome(GM,who,term); };
const clr=()=>{ H.said=[]; H.opts=[]; };
const pend=x=>{ X().scan(H.G); return X().rec(H.G).pend[x]||null; };
const play=async a=>{ if(a) await X().play(GM,a); return a; };
/* 3D 的阿姨在不在麵店（AA_503 第 14 節後補第 7 點，PRIV-AUNT-1028：auntIn 看 HCIRCLE.labelIn）——這支測試沒有載圈子（src/hcircle3d.js），用假的 HCIRCLE 指定在不在；
   true／false＝在／不在、null＝拿掉（沒有 HCIRCLE＝不在）。真的圈子表（c503_6_2 那幾列）在 tests/company_priv_unit.js 第 10 段 (B) */
const ayi=on=>{ if(on==null) delete globalThis.HCIRCLE; else globalThis.HCIRCLE={labelIn:(G,cid,zone)=>!!on&&cid==='hc_ayi'&&zone==='noodle'}; };

(async()=>{
await sec(0,()=>{ const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
  check('0. 兩個檔都載得到',ok&&!!X()&&typeof MULTIREL_LINES!=='undefined',err);
  const a=html.indexOf('src/data/multirel_lines.js'), b=html.indexOf('src/multirel3d.js'), c=html.indexOf('GAME.boot()');
  check('0. index.html：資料檔 → multirel3d.js → GAME.boot（接在 script 清單後面：story3d.js、termend3d.js、date3d.js、zr_uk3d.js 之後）',a>0&&b>a&&c>b&&['src/story3d.js','src/termend3d.js','src/date3d.js','src/zr_uk3d.js','src/romance3d.js'].every(f=>html.indexOf(f)>0&&html.indexOf(f)<a));
  if(!X()) return;
  check('0. 包上 TERMEND.walkHome／heartWhy、DATE.arriveLine／quickPick／scene／complete／menu、ROM.rec／start、EVENTS.run、STORY.talkCharacter',!!TERMEND._mrel&&!!DATE._mrel&&!!ROM._mrel&&!!EVENTS._mrel&&!!STORY._mrelTalk&&!!STORY._mrelHome);
  check('0. STORY.TICKS、PHONE_RULES、PRE_TALK、TALK_OPTS、OUT.BEFORE 都接上；出遊事件 ev_mrel_outing',STORY.TICKS.includes(X().tick)&&STORY.PHONE_RULES.includes(X().phone)&&STORY.PRE_TALK.length>0&&STORY.TALK_OPTS.length>0&&OUT.BEFORE.length>0&&STORY_EVENTS.some(e=>e.id==='ev_mrel_outing'&&e.trigger==='outing')); });
if(!X()){ H.done(); return; }

/* ---------------- 1. 第一次正式校外約會的問句 ---------------- */
await sec(1,async()=>{
  fresh('2026-10-20',15,'campus',{dating_kexin:true}); H.CLOSE(A1);
  check('1. 以安不知道祐廷有女朋友＝不問',!X().askDue(H.G,A1));
  learn(A1,KX); check('1. 以安知道可昕＝這一趟要問、沒有快速約會（quickPick＝null）',X().askDue(H.G,A1)&&DATE.quickPick(H.G,A1,[{id:'a'},{id:'b'}],1e9)===null);
  H.picks=['……對']; await dateOpen(A1);
  check('1. 以安（AA_422 1-1，原文）：到達那一句之後「等一下。」「怎麼了？」「你不是跟可昕在一起？」「對。」「那你現在是在追我？」',seq(['等一下。','怎麼了？','你不是跟可昕在一起？','對。','那你現在是在追我？']),J(T()));
  check('1. 以安「……對。」→（她把手機收進包包。）「……好。我要想一下。」「走吧。」（AA_425）＝YT_HONEST、AN_ASKED_GF',seq(['（她把手機收進包包。）','……好。我要想一下。','走吧。'])&&H.G.flags.YT_HONEST[A1]===true&&H.G.flags.AN_ASKED_GF===H.G.day&&!(H.G.flags.YT_DODGED||{})[A1],J(H.G.flags.YT_HONEST));
  check('1. 以安的三個選項',J(H.opts[0])===J(['「……對。」','「我也不知道。」','「沒有啦，就出來走走。」']),J(H.opts));
  check('1. 一位一次：問過就不再問',!X().askDue(H.G,A1));
  fresh('2026-10-20',15,'campus',{dating_kexin:true}); H.CLOSE(A1); learn(A1,KX); H.picks=['沒有啦']; await X().dateOpen(GM,{who:A1});
  check('1. 以安「沒有啦，就出來走走。」→「好。」（她走在前面，一直沒有回頭。）＝YT_DODGED；前面劇本的「對。」照實＝YT_HONEST（BB_194 §24）',seq(['好。','（她走在前面，一直沒有回頭。）'])&&H.G.flags.YT_DODGED[A1]===true&&(H.G.flags.YT_HONEST||{})[A1]===true);
  fresh('2026-10-20',15,'campus',{dating_kexin:true}); H.CLOSE(A1); learn(A1,KX); H.picks=['我也不知道']; await X().dateOpen(GM,{who:A1});
  check('1. 以安「我也不知道。」→「那你想清楚再跟我講。我不喜歡猜。」（選項不記；劇本的「對。」＝YT_HONEST）',H.has('那你想清楚再跟我講。我不喜歡猜。')&&(H.G.flags.YT_HONEST||{})[A1]===true&&!(H.G.flags.YT_DODGED||{})[A1]);
  fresh('2026-10-20',15,'campus',{dating_kexin:true}); H.CLOSE(A1); learn(A1,SIS); H.G.flags.dating_heroine_05=true;
  check('1. 以安叫學姊「書瑀學姊」（AA_422 0-4）',X().ctx(H.G,A1,SIS).her==='書瑀學姊'&&X().nameFor(H.G,A1,ZQ)==='資工那個高子晴'&&X().nameFor(H.G,A1,ZR)==='Café 那個店員');
  fresh('2026-10-20',15,'campus',{dating_kexin:true,dating_heroine_01:true}); H.CLOSE(A1); learn(A1,SIS);
  check('1. 已經在和她交往＝不問',!X().askDue(H.G,A1));

  /* 學姊 2-1 */
  fresh('2026-01-10',15,'campus',{dating_kexin:true}); H.CLOSE(SIS); learn(SIS,KX); H.picks=['我好像喜歡學姊','不知道']; await X().dateOpen(GM,{who:SIS});
  check('1. 學姊：開頭三句原文「你最近是不是有什麼話想跟我講？」「有一點。」「那你講啊。」',seq(['你最近是不是有什麼話想跟我講？','有一點。','那你講啊。']),J(T()));
  check('1. 學姊筆試前「我好像喜歡學姊。」→「……我知道。」「我也不是沒感覺。」「可是我二月要考試，在那之前我不想開始任何事。」（沒有「你可以等…」）',seq(['……我知道。','我也不是沒感覺。','可是我二月要考試，在那之前我不想開始任何事。'])&&!T().some(t=>/你可以等/.test(t)));
  check('1. 學姊多一句「你女朋友知道你今天約我嗎？」→「不知道。」→「嗯。」「那你自己想好。我不替你想。」＝YT_HONEST、SIS_ASKED_GF',seq(['你女朋友知道你今天約我嗎？','嗯。','那你自己想好。我不替你想。'])&&H.G.flags.YT_HONEST[SIS]===true&&H.G.flags.SIS_ASKED_GF!=null);
  fresh('2026-03-01',15,'campus',{dating_kexin:true}); H.CLOSE(SIS); learn(SIS,KX); H.picks=['我好像喜歡學姊','這跟她沒關係']; await X().dateOpen(GM,{who:SIS});
  check('1. 學姊筆試後到放榜：「……我知道。」「等放榜。我現在什麼都想不了。」；「這跟她沒關係。」→「好。」（她沒有再問。到路口才說：「回到家傳訊息給我。」）＝YT_DODGED',seq(['……我知道。','等放榜。我現在什麼都想不了。','好。','（她沒有再問。到路口才說：「回到家傳訊息給我。」）'])&&H.G.flags.YT_DODGED[SIS]===true);
  fresh('2026-05-01',15,'campus',{dating_kexin:true}); H.CLOSE(SIS); learn(SIS,KX); H.picks=['我好像喜歡學姊','我還沒跟她講']; await X().dateOpen(GM,{who:SIS});
  check('1. 學姊放榜後：「……嗯。」「那你下次認真講一次。」；「我還沒跟她講。」→「嗯。」（她把保溫瓶的蓋子轉緊。）',seq(['……嗯。','那你下次認真講一次。','嗯。','（她把保溫瓶的蓋子轉緊。）']));
  fresh('2026-05-01',15,'campus',{dating_kexin:true}); H.CLOSE(SIS); learn(SIS,KX); H.picks=['下次再講']; await X().dateOpen(GM,{who:SIS});
  check('1. 學姊「……下次再講。」→「好。」「你想講的時候再講。」',seq(['好。','你想講的時候再講。']));

  /* 子晴 4-1、芷若 5-1、語彤 6-1、沛珊 7-1 */
  fresh('2026-10-20',15,'campus',{dating_kexin:true}); H.CLOSE(ZQ); learn(ZQ,KX); H.picks=['對。']; await X().dateOpen(GM,{who:ZQ});
  check('1. 子晴（原文）「欸，你不是有女朋友？」「有啊。」「那你現在是在追我喔？」→「對。」「……你很敢欸。」（她笑了一下，又不笑了。）「今天先玩。其他的我再想。」＝YT_HONEST、ZQ_ASKED_GF',seq(['欸，你不是有女朋友？','有啊。','那你現在是在追我喔？','……你很敢欸。','（她笑了一下，又不笑了。）','今天先玩。其他的我再想。'])&&H.G.flags.YT_HONEST[ZQ]&&H.G.flags.ZQ_ASKED_GF!=null);
  fresh('2026-10-20',15,'campus',{dating_kexin:true}); H.CLOSE(ZQ); learn(ZQ,KX); H.picks=['沒有啦']; await X().dateOpen(GM,{who:ZQ});
  check('1. 子晴「沒有啦。」→「最好是。」（她笑了一下，沒有再問。）＝YT_DODGED',seq(['最好是。','（她笑了一下，沒有再問。）'])&&H.G.flags.YT_DODGED[ZQ]);
  fresh('2026-10-20',15,'campus',{dating_kexin:true}); H.CLOSE(ZR); learn(ZR,KX); H.picks=['她不知道']; await X().dateOpen(GM,{who:ZR});
  check('1. 芷若（原文）「等一下，你不是有女朋友嗎？」「嗯。」「那你現在這樣……她知道嗎？」；可昕不知道芷若＝沒有「她知道。」',seq(['等一下，你不是有女朋友嗎？','嗯。','那你現在這樣……她知道嗎？'])&&J(H.opts[0])===J(['「她不知道。」','「我還沒想好怎麼講。」','「我們就出來走走而已。」']),J(H.opts));
  check('1. 芷若「她不知道。」→（她低頭把包包的帶子拉好。）「……那我不想這樣。」「今天照原本的走。……結束我自己回家。」（AA_425）＝YT_HONEST、ZR_ASKED_GF',seq(['（她低頭把包包的帶子拉好。）','……那我不想這樣。','今天照原本的走。……結束我自己回家。'])&&H.G.flags.YT_HONEST[ZR]&&H.G.flags.ZR_ASKED_GF!=null);
  fresh('2026-10-20',15,'campus',{dating_kexin:true}); H.CLOSE(ZR); learn(ZR,KX); learn(KX,ZR); H.picks=['她知道','她不太高興']; await X().dateOpen(GM,{who:ZR});
  check('1. 芷若：可昕真的知道芷若＝「她知道。」→「……她不介意？」→「她說沒關係。」／「她不太高興。」→「……嗯。我想一下。」（AA_425 2-1；沒有「她不知道。」）',J(H.opts[0])===J(['「我還沒想好怎麼講。」','「她知道。」','「我們就出來走走而已。」'])&&J(H.opts[1])===J(['「她說沒關係。」','「她不太高興。」'])&&seq(['……她不介意？','……嗯。我想一下。']),J(H.opts));
  fresh('2026-10-20',15,'campus',{dating_kexin:true}); H.CLOSE(ZR); learn(ZR,KX); H.picks=['還沒想好']; await X().dateOpen(GM,{who:ZR});
  check('1. 芷若「我還沒想好怎麼講。」→「那你想好再跟我說。」「……好。走吧。」（AA_425）',seq(['那你想好再跟我說。','……好。走吧。']));
  fresh('2026-10-20',15,'campus',{dating_kexin:true}); H.CLOSE(ZR); learn(ZR,KX); H.picks=['走走而已']; await X().dateOpen(GM,{who:ZR});
  check('1. 芷若「我們就出來走走而已。」→「……嗯。」（她把手上的東西折了一下，又攤平。）＝YT_DODGED',seq(['……嗯。','（她把手上的東西折了一下，又攤平。）'])&&H.G.flags.YT_DODGED[ZR]);
  fresh('2026-10-20',15,'campus',{dating_kexin:true}); H.CLOSE(YT); learn(YT,KX); H.picks=['是她']; await DATE.arriveLine(GM,{who:YT,locs:['D06'],day:H.G.day,trip:'T9999'},5,{});
  check('1. 語彤（AA_425 2-1 整場換）：（你的手機在桌上亮了一下。螢幕上是可昕的名字。）「……是她嗎？」→「是她。」→「嗯。」（不在吃東西的地點：她低頭看自己的手，沒有再問。）＝YT_HONEST、YT_ASKED_GF',
    seq(['（你的手機在桌上亮了一下。螢幕上是可昕的名字。）','……是她嗎？','嗯。','（她低頭看自己的手，沒有再問。）'])&&H.G.flags.YT_HONEST[YT]&&H.G.flags.YT_ASKED_GF!=null&&J(H.opts[0])===J(['「是她。」','「沒事。」']),J(T()));
  fresh('2026-10-20',15,'campus',{dating_kexin:true}); H.CLOSE(YT); learn(YT,KX); H.picks=['是她']; await DATE.arriveLine(GM,{who:YT,locs:['D18'],day:H.G.day,trip:'T9999'},5,{});
  check('1. 語彤在吃東西的地點（九份老街）：（她低頭吃東西，沒有再問。）',H.has('（她低頭吃東西，沒有再問。）'));
  fresh('2026-10-20',15,'campus',{dating_kexin:true}); H.CLOSE(YT); learn(YT,KX); H.picks=['沒事']; await X().dateOpen(GM,{who:YT});
  check('1. 語彤「沒事。」→「好。」（她把你的手機翻過去，螢幕朝下。）＝YT_DODGED',seq(['好。','（她把你的手機翻過去，螢幕朝下。）'])&&H.G.flags.YT_DODGED[YT]);
  fresh('2026-11-05',15,'campus',{dating_kexin:true}); H.CLOSE(PS); learn(PS,KX); H.picks=['我有女朋友','還不知道']; await X().dateOpen(GM,{who:PS});
  check('1. 沛珊（AA_228 3-2 原文）「欸，我問你喔。」……「不過喜歡跟真的在一起，應該還是不一樣啦。」→「我有女朋友。可是我喜歡妳。」→「……好喔。那她知道你在追我嗎？」→「還不知道。」→「嗯。……我要想一下。真的。」（AA_425）＝YT_HONEST、PS_ASKED_GF',
    seq(['欸，我問你喔。','嗯？','你覺得有女朋友的人，還會喜歡別人嗎？','會吧。','我也覺得會。','（她看了你一眼。）','不過喜歡跟真的在一起，應該還是不一樣啦。','……好喔。那她知道你在追我嗎？','嗯。……我要想一下。真的。'])&&H.G.flags.YT_HONEST[PS]&&H.G.flags.PS_ASKED_GF!=null&&!H.has('……你講好直接喔。'),J(T()));
  fresh('2026-11-05',15,'campus',{dating_kexin:true}); H.CLOSE(PS); learn(PS,KX); learn(KX,PS); H.picks=['我有女朋友','知道']; await X().dateOpen(GM,{who:PS});
  check('1. 沛珊：可昕真的知道沛珊＝「知道。」→「……好喔。我要想一下。」',H.has('……好喔。我要想一下。')&&J(H.opts[1])===J(['「知道。」']));
  check('1. 六位第一次約會的問句沒有兩個人一樣（AA_425 第 4 節）',(()=>{ const A=MULTIREL_LINES.ASK, f=x=>A[x].filter(q=>typeof q==='string')[0]; const L0=[A1,SIS,ZQ,ZR,YT,PS].map(x=>JSON.stringify(A[x].filter(q=>typeof q==='string'))); return new Set(L0).size===6; })());
  fresh('2026-11-05',15,'campus',{dating_kexin:true}); H.CLOSE(PS); learn(PS,KX); H.picks=['「嗯。」']; await X().dateOpen(GM,{who:PS});
  check('1. 沛珊「嗯。」→「嗯。」（她笑了一下，問你晚餐想吃什麼。）＝YT_DODGED',H.has('（她笑了一下，問你晚餐想吃什麼。）')&&H.G.flags.YT_DODGED[PS]);
  fresh('2026-05-01',15,'campus',{dating_kexin:true}); H.CLOSE(PS); learn(PS,KX);
  check('1. 沛珊還在和柏翰交往的學期（大一下）＝不問',!X().askDue(H.G,PS));
  fresh('2026-10-20',15,'campus',{}); H.CLOSE(A1); H.CLOSE(ZQ);
  check('1. 祐廷沒有和別人交往＝六位都不問',[A1,SIS,ZQ,ZR,YT,PS].every(x=>!X().askDue(H.G,x)));
});

/* ---------------- 2. 知情版心意邀約 ---------------- */
await sec(2,async()=>{
  fresh('2027-01-10',21,'campus',{dating_kexin:true}); H.CLOSE(A1); learn(A1,KX);
  let r=await walk(A1,'Y2S1',['我喜歡妳。','我會跟她講清楚','跟她分手']);
  check('2. 以安「說出來」那條：她說完「你先講完。」「你們現在還在一起？」（AA_425 2-2）',seq(['你先講完。','你們現在還在一起？']),J(T()));
  check('2. 以安「我會跟她講清楚。」→「講清楚是什麼意思？」→「跟她分手。」→「好。那你分完，再來找我。」＝YT_PROMISED exclusive、這學期讓我想想',seq(['講清楚是什麼意思？','好。那你分完，再來找我。'])&&H.G.flags.YT_PROMISED[A1]==='exclusive'&&H.G.termend.think[A1]==='Y2S1'&&r==='think'&&!H.G.flags.dating_heroine_01);
  fresh('2027-01-10',21,'campus',{dating_kexin:true}); H.CLOSE(A1); learn(A1,KX);
  await walk(A1,'Y2S1',['先不說','我會跟她講清楚','跟她說我也喜歡妳']);
  check('2. 以安「先不說」那條：她的「她說」演完接「你們現在還在一起？」，沒有「你先講完。」；「跟她說我也喜歡妳。」→「那你先跟她說。」（AA_425）＝handle:kexin',
    H.has('你不說的話，我寫了。')&&seq(['你們現在還在一起？','那你先跟她說。'])&&!H.has('你先講完。')&&!T().some(t=>/再來問我/.test(t))&&H.G.flags.YT_PROMISED[A1]==='handle:kexin');
  check('2. 先不說那條沒有「好。／讓我想想。」那兩個選項',!H.opts.some(o=>J(o)===J(['「好。」','「讓我想想。」'])));
  ROM.PARAMS.acceptsOpen[A1]=false; fresh('2027-01-10',21,'campus',{dating_kexin:true}); H.CLOSE(A1); learn(A1,KX); await walk(A1,'Y2S1',['我喜歡妳。','我還是跟她在一起']); ROM.PARAMS.acceptsOpen[A1]=true;
  check('2. 以安「我還是跟她在一起。」→「……所以你要我跟她一起。」「你知道你在說什麼嗎？」→ 開關關著（AA_474 第 0 節：使用者之後可以把某一位改回 false）：「我現在不要。」「我不想當那個不知道自己在幹嘛的人。」（沒有「不是因為我不喜歡你」）',
    seq(['……所以你要我跟她一起。','你知道你在說什麼嗎？','我現在不要。','我不想當那個不知道自己在幹嘛的人。'])&&!T().some(t=>/不是因為我不喜歡你/.test(t))&&!H.G.flags.dating_heroine_01);
  fresh('2027-01-10',21,'campus',{dating_kexin:true}); H.CLOSE(A1); learn(A1,KX); r=await walk(A1,'Y2S1',['我喜歡妳。','我還是跟她在一起']);
  check('2. acceptsOpen true（使用者 10-27 回答 C：遊戲裡七位都打開）：「我不知道我為什麼會答應。」「……可是我想答應。」＝交往、OPEN_OK.heroine_01.kexin',seq(['我不知道我為什麼會答應。','……可是我想答應。'])&&r==='yes'&&H.G.flags.dating_heroine_01===true&&H.G.flags.OPEN_OK[A1].kexin===true);
  fresh('2027-01-10',21,'campus',{dating_kexin:true}); H.CLOSE(A1); learn(A1,KX); await walk(A1,'Y2S1',['我喜歡妳。','我不知道']);
  check('2. 以安「說出來」那條「我不知道。」→「那你不要現在講。」「你想清楚再來。」',seq(['那你不要現在講。','你想清楚再來。'])&&H.G.termend.think[A1]==='Y2S1');
  fresh('2027-01-10',21,'campus',{dating_kexin:true}); H.CLOSE(A1); learn(A1,KX); await walk(A1,'Y2S1',['先不說','我不知道']);
  check('2. 以安「先不說」那條「我不知道。」→「那你想清楚再回答我。」（AA_425：她已經先說了）',H.has('那你想清楚再回答我。')&&!H.has('那你不要現在講。'));
  /* 第二次：沒做到／做到了 */
  fresh('2027-01-10',21,'campus',{dating_kexin:true}); H.CLOSE(A1); learn(A1,KX); await walk(A1,'Y2S1',['我喜歡妳。','我會跟她講清楚','跟她分手']);
  setT('2027-06-20',21); clr(); r=await walk(A1,'Y2S2',['我喜歡妳。']);
  check('2. 下學期：說會分卻沒分＝「你上次說，會處理。」「……那我們先不要約了。」、YT_BROKE_PROMISE、不再問',seq(['你上次說，會處理。','……那我們先不要約了。'])&&r==='broken'&&H.G.flags.YT_BROKE_PROMISE[A1]==='exclusive'&&!H.opts.length,J(H.opts));
  check('2. 之後可昕那一段還在＝她不發心意邀約（heartWhy false）；分了以後才又照常',TERMEND.heartWhy(H.G,A1,{id:'Y3S1'})===false&&(()=>{ ROM.end(H.G,KX,'test'); return !X().blocked(H.G,A1); })());
  fresh('2027-01-10',21,'campus',{dating_kexin:true}); H.CLOSE(A1); learn(A1,KX); await walk(A1,'Y2S1',['先不說','我會跟她講清楚','跟她說我也喜歡妳']);
  learn(KX,A1,'yt_told'); setT('2027-06-20',21); clr(); r=await walk(A1,'Y2S2',['我喜歡妳。']);
  check('2. 下學期：說會跟她說、她也知道了＝照原本的第二次（「……嗯。這次換你先說了。」「好。我們在一起。」），交往＋OPEN_OK',seq(['……嗯。這次換你先說了。','好。我們在一起。'])&&H.G.flags.dating_heroine_01===true&&H.G.flags.OPEN_OK[A1].kexin===true,J(T()));

  fresh('2027-01-10',21,'campus',{dating_kexin:true}); H.CLOSE(SIS); learn(SIS,KX); await walk(SIS,'Y2S1',['先不說','還不知道']);
  check('2. 學姊「可昕知道嗎？」→「還不知道。」→「那你要讓我當那個她不知道的人？」「……我不要。」「你跟她講了，再來問我。」（沒有「不是你不好」）',seq(['可昕知道嗎？','那你要讓我當那個她不知道的人？','……我不要。','你跟她講了，再來問我。'])&&!T().some(t=>/不是你不好/.test(t)));
  check('2. 學姊：可昕不知道學姊＝沒有「她知道。」',J(H.opts[1])===J(['「還不知道。」','「我會跟她說。」']),J(H.opts));
  fresh('2027-01-10',21,'campus',{dating_kexin:true}); H.CLOSE(SIS); learn(SIS,KX); await walk(SIS,'Y2S1',['我喜歡妳。','我會跟她說','說我們分手']);
  check('2. 學姊「我會跟她說。」→「說什麼？」→「說我們分手。」→「那等你說完。」＝exclusive',seq(['說什麼？','那等你說完。'])&&H.G.flags.YT_PROMISED[SIS]==='exclusive');
  setT('2027-06-20',21); clr(); await walk(SIS,'Y2S2',['我喜歡妳。']);
  check('2. 學姊第二次沒做到：「你上次說會跟她說。」「……你沒有。」「那我們先這樣。」',seq(['你上次說會跟她說。','……你沒有。','那我們先這樣。']));
  fresh('2027-01-10',21,'campus',{dating_kexin:true}); H.CLOSE(SIS); learn(SIS,KX); learn(KX,SIS); await walk(SIS,'Y2S1',['我喜歡妳。','她知道','她說可以']);
  check('2. 學姊「她知道。」（可昕真的知道）→「……她怎麼說？」→「她說可以。」→「……好。我想一下。」＝第一次一律讓我想想（AA_474 1-2：開關打開也不接「我們試試看」）',seq(['……她怎麼說？','……好。我想一下。'])&&!H.has('我們試試看。')&&!H.has('我還沒準備好。')&&!H.G.flags.dating_heroine_05&&H.G.termend.think[SIS]==='Y2S1'&&J(H.opts[2])===J(['「她說可以。」','「她不太高興。」']),J(H.opts));
  fresh('2027-01-10',21,'campus',{dating_kexin:true}); H.CLOSE(SIS); learn(SIS,KX); learn(KX,SIS); await walk(SIS,'Y2S1',['我喜歡妳。','她知道','她不太高興']);
  check('2. 學姊「她不太高興。」→「嗯。那我更要想一下。」＝這學期讓我想想（acceptsOpen true 也不答應）',H.has('嗯。那我更要想一下。')&&!H.G.flags.dating_heroine_05&&H.G.termend.think[SIS]==='Y2S1');
  ROM.PARAMS.acceptsOpen[ZQ]=false; fresh('2027-01-10',21,'campus',{dating_kexin:true}); H.CLOSE(ZQ); learn(ZQ,KX); await walk(ZQ,'Y2S1',['我喜歡妳。','對。']); ROM.PARAMS.acceptsOpen[ZQ]=true;
  check('2. 子晴「說出來」：「所以你是認真的喔？」「可昕呢？」「你現在是想同時跟我們兩個在一起？」→「對。」→（開關關著）「……我做不到啦。」「你先跟她講清楚。講完再說。」（沒有「靠北」）',seq(['所以你是認真的喔？','可昕呢？','你現在是想同時跟我們兩個在一起？','……我做不到啦。','你先跟她講清楚。講完再說。'])&&!T().some(t=>/靠北/.test(t)));
  fresh('2027-01-10',21,'campus',{dating_kexin:true}); H.CLOSE(ZQ); learn(ZQ,KX); await walk(ZQ,'Y2S1',['先不說','對。']);
  check('2. 子晴「先不說」：沒有「所以你是認真的喔？」；接受＝「……我居然在考慮。」「好。可是你不准瞞我任何事。」',!H.has('所以你是認真的喔？')&&seq(['可昕呢？','……我居然在考慮。','好。可是你不准瞞我任何事。'])&&H.G.flags.dating_heroine_04===true);
  fresh('2027-01-10',21,'campus',{dating_kexin:true}); H.CLOSE(ZQ); learn(ZQ,KX); await walk(ZQ,'Y2S1',['我喜歡妳。','我會跟她分']);
  check('2. 子晴「我會跟她分。」→「那你去分。」（AA_425）',H.has('那你去分。')&&H.G.flags.YT_PROMISED[ZQ]==='exclusive');
  setT('2027-06-20',21); clr(); await walk(ZQ,'Y2S2',['我喜歡妳。']);
  check('2. 子晴第二次沒分：「她還不知道吧。」「……那我不要了。」（AA_425 2-3）',seq(['她還不知道吧。','……那我不要了。']));
  fresh('2027-01-10',21,'campus',{dating_kexin:true}); H.CLOSE(ZQ); learn(ZQ,KX); await walk(ZQ,'Y2S1',['先不說','我不知道']);
  check('2. 子晴「先不說」那條「我不知道。」→「那你想好再回我。」（AA_425）',H.has('那你想好再回我。')&&!H.has('那你想好再說。我不要你邊想邊講。'));
  fresh('2027-01-10',21,'campus',{dating_kexin:true}); H.CLOSE(YT); learn(YT,KX); await walk(YT,'Y2S1',['我喜歡妳。','她那邊我還沒講']);
  check('2. 語彤「說出來」（原文）：「……可是你有女朋友吧。」「嗯。」「那你現在跟我說這個，是想怎麼辦？」→（她停下來，看著你。）「那你先去做。」（AA_425）＝handle',
    seq(['……可是你有女朋友吧。','嗯。','那你現在跟我說這個，是想怎麼辦？','（她停下來，看著你。）','那你先去做。'])&&H.G.flags.YT_PROMISED[YT]==='handle:kexin');
  setT('2027-06-20',21); clr(); await walk(YT,'Y2S2',['我喜歡妳。']);
  check('2. 語彤第二次（說會講卻沒講）：「……她還不知道，對不對。」（你沒有回答。她點了一下頭，先走了。）（AA_425 2-3）',seq(['……她還不知道，對不對。','（你沒有回答。她點了一下頭，先走了。）']));
  fresh('2027-01-10',21,'campus',{dating_kexin:true}); H.CLOSE(YT); learn(YT,KX); await walk(YT,'Y2S1',['我喜歡妳。','我會跟她分開']); setT('2027-06-20',21); clr(); await walk(YT,'Y2S2',['我喜歡妳。']);
  check('2. 語彤第二次（說會分卻沒分）：「……你們還在一起。」（你沒有回答。她點了一下頭，先走了。）',seq(['……你們還在一起。','（你沒有回答。她點了一下頭，先走了。）']));
  fresh('2027-01-10',21,'campus',{dating_kexin:true}); H.CLOSE(YT); learn(YT,KX); await walk(YT,'Y2S1',['先不說','我會跟她分開']);
  check('2. 語彤「先不說」：「……可是你有女朋友。」「我講了。你要怎麼辦？」；「我會跟她分開。」→「你不用為了我。」「……你要是真的想分，那是你們的事。不要跟我說是為了我。」',seq(['……可是你有女朋友。','我講了。你要怎麼辦？','你不用為了我。','……你要是真的想分，那是你們的事。不要跟我說是為了我。']));
  ROM.PARAMS.acceptsOpen[PS]=false; fresh('2027-01-10',21,'campus',{dating_kexin:true}); H.CLOSE(PS); learn(PS,KX); await walk(PS,'Y2S1',['先不說','都在一起']); ROM.PARAMS.acceptsOpen[PS]=true;
  check('2. 沛珊「欸，那可昕呢？」→「我想跟妳們都在一起。」→「……喔。」「我想一下。我會很認真想。」→（開關關著）「我沒辦法耶。我會一直想她。」',seq(['欸，那可昕呢？','……喔。','我想一下。我會很認真想。','我沒辦法耶。我會一直想她。']));
  fresh('2027-01-10',21,'campus',{dating_kexin:true}); H.CLOSE(PS); learn(PS,KX); r=await walk(PS,'Y2S1',['先不說','都在一起']);
  check('2. 沛珊開關打開（使用者 10-27 回答 C）：接受＝「好。可是她那邊也要知道喔。兩邊都不要偷偷的。」（AA_474 第 5 節改）＝交往、OPEN_OK',seq(['我想一下。我會很認真想。','好。可是她那邊也要知道喔。兩邊都不要偷偷的。'])&&!H.has('好。可是你要跟我講。什麼都要講。')&&r==='yes'&&H.G.flags.dating_classmate_peishan===true&&H.G.flags.OPEN_OK[PS].kexin===true);
  fresh('2027-01-10',21,'campus',{dating_kexin:true}); H.CLOSE(PS); learn(PS,KX); await walk(PS,'Y2S1',['我喜歡妳。','我會跟她分開']);
  setT('2027-06-20',21); clr(); await walk(PS,'Y2S2',['我喜歡妳。']);
  check('2. 沛珊第二次（說會分卻沒分）：「你們還在一起喔？」「……沒關係啦。我們先不要這樣。」（AA_425 2-3）',seq(['你們還在一起喔？','……沒關係啦。我們先不要這樣。']));
  fresh('2027-01-10',21,'campus',{dating_kexin:true}); H.CLOSE(PS); learn(PS,KX); await walk(PS,'Y2S1',['我喜歡妳。','還沒跟她講']); setT('2027-06-20',21); clr(); await walk(PS,'Y2S2',['我喜歡妳。']);
  check('2. 沛珊第二次（說會講卻沒講）：「……她知道我嗎？」「還不知道。」「嗯。……那我們先不要這樣。」',seq(['……她知道我嗎？','還不知道。','嗯。……那我們先不要這樣。']));
  check('2. 「承諾沒做到」七個人說法都不同（AA_425 第 4 節；可昕沒有心意邀約）',(()=>{ const B=MULTIREL_LINES.BROKE, all=[]; for(const x in B){ const v=B[x]; for(const L0 of (Array.isArray(v)?[v]:Object.values(v))) all.push(JSON.stringify(L0)); } return new Set(all).size===all.length&&Object.keys(B).length===6; })());
  /* 芷若三問（遊戲裡開關已經打開）*/
  fresh('2027-01-10',21,'campus',{dating_kexin:true,ZR_ASKED_GF:1}); H.CLOSE(ZR); learn(ZR,KX); await walk(ZR,'Y2S1',['先不說','兩個都在一起']);
  check('2. 芷若第一問「那你打算怎麼辦？」→「我想跟妳們兩個都在一起。」→（她停下腳步。）「……我要想很久。」（AA_425；讓我想想）',seq(['那你打算怎麼辦？','（她停下腳步。）','……我要想很久。'])&&H.G.termend.think[ZR]==='Y2S1'&&!!X().rec(H.G).zr.q1);
  setT('2027-03-01',14); clr(); H.picks=['不知道']; await X().dateOpen(GM,{who:ZR});
  check('2. 芷若第二問（之後第一次正式約會的開頭）「她知道你跟我出去嗎？」→ 照實「不知道。」→「嗯。」（她低頭看了一下手機，又放回口袋。）',seq(['她知道你跟我出去嗎？','嗯。','（她低頭看了一下手機，又放回口袋。）'])&&X().rec(H.G).zr.q2.ok===true&&J(H.opts[0])===J(['「不知道。」','「知道。」']),J(H.opts));
  setT('2027-06-20',21); clr(); let r3=await walk(ZR,'Y2S2',['先不說','是。']);
  check('2. 芷若第三問（下學期）「你是真的想跟我在一起嗎？」→「是。」三次都照實＋acceptsOpen＝「……好。」（她把手伸過來，握了一下你的手，又放開。）交往',seq(['你是真的想跟我在一起嗎？','……好。','（她把手伸過來，握了一下你的手，又放開。）'])&&r3==='yes'&&H.G.flags.dating_heroine_02===true&&H.G.flags.OPEN_OK[ZR].kexin===true);
  fresh('2027-01-10',21,'campus',{dating_kexin:true,ZR_ASKED_GF:1}); H.CLOSE(ZR); learn(ZR,KX); await walk(ZR,'Y2S1',['先不說','我不知道']);
  setT('2027-03-01',14); clr(); H.picks=[1]; await X().dateOpen(GM,{who:ZR});
  check('2. 芷若第二問說謊「知道。」＝YT_LIED.heroine_02.kexin',!!(H.G.flags.YT_LIED[ZR]&&H.G.flags.YT_LIED[ZR].kexin));
  setT('2027-06-20',21); clr(); r3=await walk(ZR,'Y2S2',['先不說','是。']);
  check('2. 芷若第三問：有一次不是照實＝「……我沒辦法。」「我們先這樣就好。」，之後那一段還在的學期不發',seq(['……我沒辦法。','我們先這樣就好。'])&&!H.G.flags.dating_heroine_02&&X().blocked(H.G,ZR));
  fresh('2027-01-10',21,'campus',{dating_kexin:true}); H.CLOSE(ZR); learn(ZR,KX); await walk(ZR,'Y2S1',['先不說','我會跟她講']);
  check('2. 芷若「我會跟她講。」→「……好。」（她低頭看了一下手機，又放回口袋。）（AA_425）＝handle',seq(['……好。','（她低頭看了一下手機，又放回口袋。）'])&&H.G.flags.YT_PROMISED[ZR]==='handle:kexin');
  setT('2027-06-20',21); clr(); await walk(ZR,'Y2S2',['先不說']);
  check('2. 芷若下一次心意邀約她還不知道：「……你還沒講。」（她轉身走了，走得很快。）、之後不發（AA_425 2-3 補）',seq(['……你還沒講。','（她轉身走了，走得很快。）'])&&X().blocked(H.G,ZR)&&!H.has('你是真的想跟我在一起嗎？'));
  fresh('2027-01-10',21,'campus',{dating_kexin:true}); H.CLOSE(ZR); learn(ZR,KX); await walk(ZR,'Y2S1',['先不說','我不知道']);
  check('2. 芷若「我不知道。」→（她點了一下頭，繼續走。）',H.has('（她點了一下頭，繼續走。）'));
  /* 不知情＝原本的回家路上；可昕沒有心意邀約 */
  fresh('2027-01-10',21,'campus',{dating_kexin:true}); H.CLOSE(A1); await walk(A1,'Y2S1',['先不說','好']);
  check('2. 她不知道祐廷有別人＝原本的回家路上（「好。」「讓我想想。」兩個選項）',H.opts.some(o=>J(o)===J(['「好。」','「讓我想想。」']))&&!H.has('可昕呢？'));
  check('2. 可昕：知情版心意邀約整節刪（AA_425 第 0 節）＝沒有這一段',!MULTIREL_LINES.KNOW.kexin&&!X().knowWalkDue(H.G,KX,'Y2S1'));
});

/* ---------------- 3. 發現 ---------------- */
await sec(3,async()=>{
  /* 以安 */
  fresh('2026-10-01',12,'campus',{dating_kexin:true}); H.CLOSE(A1); ROM.start(H.G,A1); setT('2026-10-20',12); learn(A1,KX);
  check('3. 以安在交往期間知道可昕＝待演（pend）',J(pend(A1))===J({y:KX,day:H.G.day,h:12,src:'test'}),J(pend(A1)));
  check('3. 當下不演（要到下一次見面）；和她說話＝演',!X().meetAction(H.G,A1,'talk')===false);
  H.G.hour=12.5; await X().meet(GM,A1,'talk');
  check('3. 以安《你為什麼不講》（原文）',seq(['你跟可昕交往多久了？','一年多。','喔。','（她看著你。）','所以你跟我在一起的時候，也跟她在一起？','對。','你是不是覺得我不會知道？','沒有。','那你為什麼不講？','我不知道怎麼跟妳說。','好。','（她開始收東西。）','以安……','我現在不想跟你講話。']),J(T()));
  check('3. 演過：DISCOVERED（MREL.disc）、AN_HURT、冷靜中（st.n＝1）、不再待演',!!X().rec(H.G).disc[A1][KX]&&H.G.flags.AN_HURT===H.G.day&&X().st(H.G,A1).n===1&&!pend(A1));
  fresh('2026-10-01',12,'campus',{}); H.CLOSE(A1); ROM.start(H.G,A1); setT('2026-10-20',12); H.G.flags.dating_heroine_03=true; ROM.get(H.G,YT).sinceDay=H.G.day-3; learn(A1,YT); H.G.flags.YT_LIED={heroine_01:{heroine_03:true}};
  H.G.hour=13; await X().meet(GM,A1,'date');
  check('3. 以安變體：未滿 7 天＝「所以這禮拜，你一邊跟我出去，一邊跟她在一起？」；曾說謊＝「你是不是覺得我不會知道？」後面「我之前問過你。」',seq(['你跟語彤交往多久了？','這禮拜才開始。','所以這禮拜，你一邊跟我出去，一邊跟她在一起？','你是不是覺得我不會知道？','我之前問過你。','沒有。']),J(T()));
  fresh('2026-10-01',12,'campus',{dating_kexin:true}); learn(A1,KX,'k3'); H.CLOSE(A1); setT('2026-10-05',12); ROM.start(H.G,A1); H.G.flags.OPEN_OK={}; H.G.flags.YT_LIED={heroine_01:{kexin:true}};
  H.G.flags.knowsRel.heroine_01.kexin.day=H.G.day; H.G.hour=13; await X().meet(GM,A1,'talk');
  check('3. 以安變體：早就知道可昕、他說過「分了」（YT_LIED）＝「你跟可昕，還在一起？」「……嗯。」',seq(['你跟可昕，還在一起？','……嗯。','喔。']),J(T()));
  /* 坦白版 */
  fresh('2026-10-01',12,'campus',{dating_kexin:true}); H.CLOSE(A1); ROM.start(H.G,A1); setT('2026-10-20',15);
  const opts=[].concat(...STORY.TALK_OPTS.map(f=>{ try{ return f(H.G,A1,GM)||[]; }catch(e){ return []; } })); const o=opts.find(q=>q.t==='「我有件事要跟妳講。」');
  check('3. 和以安說話：多一個選項「我有件事要跟妳講。」（她還不知道可昕）',!!o);
  if(o) await o.run(GM);
  check('3. 坦白版：「我跟可昕也在一起。一年多了。」（她把筆放下。）「……你為什麼現在才講？」……「我現在不想跟你講話。」；YT_CONFESSED、knowsRel yt_told',seq(['我跟可昕也在一起。一年多了。','（她把筆放下。）','……你為什麼現在才講？','我不知道怎麼跟妳說。','我現在不想跟你講話。'])&&H.G.flags.YT_CONFESSED[A1].kexin===H.G.day&&H.G.flags.knowsRel[A1].kexin.source==='yt_told'&&ROM.ytKnows(H.G,A1,KX),J(T()));
  check('3. 坦白過＝不演發現',(X().scan(H.G),!X().rec(H.G).pend[A1]));
  /* 還有誰、違約 */
  H.said=[]; H.G.flags.dating_heroine_04=true; ROM.get(H.G,ZQ).sinceDay=H.G.day; setT('2026-10-25',12); learn(A1,ZQ); H.G.hour=13; await X().meet(GM,A1,'talk');
  check('3. 以安還有誰（8-2）：第一段是祐廷講的＝「可昕的事，你跟我講過。」「資工那個高子晴的事，你沒有。」「還有誰？」→ 照實「……好。」（她沒有收東西，看著你。）「我要想一下，我還要不要再問一次。」',seq(['可昕的事，你跟我講過。','資工那個高子晴的事，你沒有。','還有誰？','……好。','（她沒有收東西，看著你。）','我要想一下，我還要不要再問一次。'])&&X().st(H.G,A1).n===2,J(T()));
  fresh('2026-10-01',12,'campus',{dating_kexin:true}); H.CLOSE(A1); ROM.start(H.G,A1); setT('2026-10-10',12); learn(A1,KX); H.G.hour=13; await X().meet(GM,A1,'talk');
  H.G.flags.dating_heroine_04=true; ROM.get(H.G,ZQ).sinceDay=H.G.day; setT('2026-10-25',12); learn(A1,ZQ); H.said=[]; H.G.hour=13; await X().meet(GM,A1,'talk');
  check('3. 以安還有誰：第一段是她自己發現的＝「可昕的事，是我自己發現的。」（AA_425 2-5）',seq(['可昕的事，是我自己發現的。','資工那個高子晴的事，你沒有。','還有誰？']),J(T()));
  fresh('2026-10-01',12,'campus',{dating_kexin:true}); H.CLOSE(A1); ROM.start(H.G,A1); H.G.flags.OPEN_OK={heroine_01:{kexin:true}}; H.G.flags.YT_PROMISED={heroine_01:'tell_first'}; X().rec(H.G).prom[A1]={ys:[KX],day:H.G.day};
  setT('2026-10-20',12); H.G.flags.dating_heroine_03=true; ROM.get(H.G,YT).sinceDay=H.G.day-5; learn(A1,YT); H.G.hour=13; await X().meet(GM,A1,'talk');
  check('3. 以安第二次（說處理好了卻沒有）：「你跟我說你處理好了。」「……我那時候相信你。」（她沒有收東西。她坐著，看著桌上攤開的書。）「你走。」、YT_BROKE_PROMISE',seq(['你跟我說你處理好了。','……我那時候相信你。','（她沒有收東西。她坐著，看著桌上攤開的書。）','你走。'])&&H.G.flags.YT_BROKE_PROMISE[A1]==='tell_first',J(T()));
  /* 日本那學期：留在臺灣的路線＝視訊；日本路線（兩個人都在日本）＝當面（AA_425 第 1 節）*/
  fresh('2028-01-01',12,'campus',{dating_kexin:true,EXCHANGE_ROUTE:'JP'}); H.CLOSE(A1); ROM.start(H.G,A1); setT('2028-04-10',12); learn(A1,KX); H.G.hour=21.1;
  check('3. 日本路線（兩個人都在日本）：不是視訊、照當面（和她說話）',!X().remote(H.G,A1)&&!X().dueAuto(H.G)&&!!X().meetAction(H.G,A1,'talk'));
  fresh('2028-01-01',12,'campus',{dating_kexin:true,EXCHANGE_ROUTE:'TW'}); H.CLOSE(A1); ROM.start(H.G,A1); setT('2028-04-10',12); learn(A1,KX);
  H.G.hour=20.9; check('3. 21:00 以前不演',!X().dueAuto(H.G)); H.G.hour=21.1; let d=X().dueAuto(H.G);
  check('3. 21:00 以後：演出來的視訊（底圖 video）',!!d&&d.k==='disc_remote'&&d.bg==='video',J(d));
  await play(d); check('3. 以安視訊：「我現在不想跟你講話。」之後（視訊斷了。）',seq(['我現在不想跟你講話。','（視訊斷了。）']));
  /* 讀書會散會 */
  fresh('2026-10-01',12,'campus',{dating_kexin:true}); H.CLOSE(A1); ROM.start(H.G,A1); setT('2026-10-20',12); learn(A1,KX);
  setT('2026-10-22',21.6); H.G.zone='wancai'; d=X().dueAuto(H.G);
  check('3. 以安：公馬讀書會那個週四散會（21:30 人在萬才館）＝演、底圖研討室',!!d&&d.k==='disc'&&d.x===A1&&d.bg==='wancai_seminar',J(d));
  H.G.zone='campus'; check('3. 那天人不在萬才館＝不演',!X().dueAuto(H.G));

  /* 學姊 */
  fresh('2026-04-01',12,'campus',{dating_kexin:true}); H.CLOSE(SIS); ROM.start(H.G,SIS); setT('2026-04-20',12); learn(SIS,KX); H.G.hour=13; await X().meet(GM,SIS,'talk');
  check('3. 學姊《你怎麼沒跟我講》（原文）；可昕比她早＝「所以你跟我在一起之前，就已經跟她在一起了？」',seq(['你跟可昕在一起喔？','嗯。','什麼時候的事？','一年多。','……我怎麼都不知道？','我不知道怎麼跟妳講。','那你現在講啊。','（你沒有立刻回答。）','所以你跟我在一起之前，就已經跟她在一起了？','對。','（她安靜了一會兒。）','我現在有點生氣。','對不起。','嗯。','我想先回去了。']),J(T()));
  fresh('2026-04-01',12,'campus',{}); H.CLOSE(SIS); ROM.start(H.G,SIS); setT('2026-04-20',12); H.G.flags.dating_heroine_03=true; ROM.get(H.G,YT).sinceDay=H.G.day-10; learn(SIS,YT); H.G.flags.YT_LIED={heroine_05:{heroine_03:true}}; H.G.hour=13; await X().meet(GM,SIS,'talk');
  check('3. 學姊變體：Y 比她晚＝「你跟我在一起的時候，也跟她在一起？」；曾說謊＝「我現在有點生氣」前面「我問過你的。」',seq(['你跟我在一起的時候，也跟她在一起？','我問過你的。','我現在有點生氣。']),J(T()));
  fresh('2028-05-01',12,'campus',{dating_kexin:true}); H.CLOSE(SIS); ROM.start(H.G,SIS); setT('2028-09-10',12); learn(SIS,KX); H.G.hour=21.2; d=X().dueAuto(H.G);
  check('3. 學姊在美國、祐廷在台灣：視訊',!!d&&d.bg==='video');
  await play(d); check('3. 學姊視訊：最後一句「我想先掛了。」（視訊斷了。）',seq(['我現在有點生氣。','我想先掛了。','（視訊斷了。）'])&&!H.has('我想先回去了。'));
  fresh('2026-04-01',12,'campus',{}); H.CLOSE(SIS); ROM.start(H.G,SIS); setT('2026-04-15',12); H.G.flags.dating_heroine_01=true; ROM.get(H.G,A1).sinceDay=H.G.day-3;
  for(const k of ['2026-04-16','2026-04-17']){ setT(k,10); const t={trip:DATE.newTripId(H.G),who:A1,locs:['D04'],day:H.G.day,depart:10,back:16,transport:'mrt',departed:true,status:'done',spots:['x']}; H.G.trips.push(t); DATE.complete(H.G,t); }
  check('3. 李冠宏：和學姊交往以後第二次在雙北和以安正式約會＝隔天她知道（seen_by:li_guanhong）',(X().relAt(H.G,SIS,A1)||{}).source==='seen_by:li_guanhong');
  setT('2026-04-20',14); await X().meet(GM,SIS,'talk');
  check('3. 李冠宏（認識的人）：「冠宏說他禮拜六看到你跟以安。」接 4-4 原句「你跟以安在一起喔？」',seq(['冠宏說他禮拜六看到你跟以安。','你跟以安在一起喔？','嗯。','什麼時候的事？']),J(T()));
  fresh('2026-04-01',12,'campus',{}); H.CLOSE(SIS); ROM.start(H.G,SIS); H.G.flags.dating_heroine_04=true; ROM.get(H.G,ZQ).sinceDay=H.G.day;
  for(const k of ['2026-04-10','2026-04-11']){ setT(k,10); const t={trip:DATE.newTripId(H.G),who:ZQ,locs:['D03'],day:H.G.day,depart:10,back:16,transport:'mrt',departed:true,status:'done',spots:['x']}; H.G.trips.push(t); DATE.complete(H.G,t); }
  setT('2026-04-13',14); H.picks=['子晴']; await X().meet(GM,SIS,'talk');
  check('3. 李冠宏（她不認識的人）：「冠宏說他禮拜六在{地點}看到你。」「跟一個女生。」「……你跟那個女生在一起喔？」「嗯。」「她是誰？」→「子晴。」→「……子晴。」接「什麼時候的事？」',
    seq(['跟一個女生。','……你跟那個女生在一起喔？','嗯。','她是誰？','……子晴。','什麼時候的事？'])&&/^冠宏說他禮拜六在.+看到你。$/.test(T()[0]),J(T()));
  fresh('2026-04-01',12,'campus',{dating_kexin:true}); H.CLOSE(SIS); ROM.start(H.G,SIS); H.G.flags.YT_PROMISED={heroine_05:'exclusive'}; X().rec(H.G).prom[SIS]={ys:[KX],day:H.G.day}; setT('2026-04-20',12); learn(SIS,KX); H.G.hour=13; await X().meet(GM,SIS,'talk');
  check('3. 學姊說會講卻沒講：「你上次說會跟她說。」「你沒有。」「我現在很生氣。這次不是有點。」「我先走。明天再講。」',seq(['你上次說會跟她說。','你沒有。','我現在很生氣。這次不是有點。','我先走。明天再講。']));
  fresh('2026-04-01',12,'campus',{dating_kexin:true}); H.CLOSE(SIS); ROM.start(H.G,SIS); H.G.flags.OPEN_OK={heroine_05:{kexin:true}}; H.G.flags.dating_heroine_03=true; ROM.get(H.G,YT).sinceDay=H.G.day; setT('2026-04-20',12); learn(SIS,YT); H.G.hour=13; await X().meet(GM,SIS,'talk');
  check('3. 學姊還有誰：「我以為你上次都講完了。」「語彤……也是？」「……還有沒有別人。我現在問你，你就一次講完。」',seq(['我以為你上次都講完了。','語彤……也是？','……還有沒有別人。我現在問你，你就一次講完。']));

  /* 可昕（說溜嘴、當晚、變體、說謊）*/
  fresh('2026-09-10',12,'campus',{dating_kexin:true}); H.CLOSE(PS); ROM.start(H.G,PS); learn('yu',PS,'present');
  setT('2026-09-24',10); { const t={trip:DATE.newTripId(H.G),who:PS,locs:['D04'],day:H.G.day,depart:10,back:16,transport:'mrt',departed:true,status:'done',spots:['x']}; H.G.trips.push(t); DATE.complete(H.G,t); }
  setT('2026-09-26',19); await X().afterEvent(GM,{id:'ev_kexin_two_circles',participants:[KX]});
  check('3. 說溜嘴（Alison 版，祐廷和沛珊實際去過 D 地點）：「欸可昕，沛珊說祐廷上禮拜帶她去西門町電影院，妳們有一起去嗎？」「……什麼？」（Alison 看了你一眼，又看可昕。）「……我是不是講錯話了。」',
    seq(['欸可昕，沛珊說祐廷上禮拜帶她去西門町電影院，妳們有一起去嗎？','……什麼？','（Alison 看了你一眼，又看可昕。）','……我是不是講錯話了。'])&&(X().relAt(H.G,KX,PS)||{}).source==='slip:yu@ev_kexin_two_circles',J(T()));
  H.said=[]; H.G.hour=21.6; H.G.zone='dorm'; d=X().dueAuto(H.G); check('3. 可昕當晚 21:30 以後：演',!!d&&d.x===KX);
  H.picks=['沒有，那是誤會']; await play(d);
  check('3. 可昕當晚（電話）「你現在在哪？」「宿舍。」「我現在過去。」→「Alison 今天說的，是真的嗎？」「……嗯。」接「什麼時候？」',seq(['你現在在哪？','宿舍。','我現在過去。','Alison 今天說的，是真的嗎？','……嗯。','什麼時候？','操。']),J(T()));
  check('3. 可昕最近一次（前幾天還一起吃飯）＝「你前幾天還跟我去吃飯欸？」只在有的時候',!H.has('你前幾天還跟我去吃飯欸？'));
  check('3. 「沒有，那是誤會。」→「誤會？」「好。」（她沒有再問，走了。）＝YT_LIED.kexin.classmate_peishan、3 天後 5-2b',seq(['誤會？','好。','（她沒有再問，走了。）'])&&H.G.flags.YT_LIED[KX][PS]===true&&X().st(H.G,KX).exposeAt===H.G.day+3);
  check('3. 可昕的五個選項；「是我的錯。我沒有跟妳講。」那一格照 AA_422 3-2',J(H.opts[0])===J(['「是我的錯。我沒有跟妳講。」','「我跟她是……後來才開始的。」','「我還是很喜歡妳。」','（不說話）','「沒有，那是誤會。」']));
  fresh('2026-09-10',12,'campus',{dating_kexin:true}); H.CLOSE(PS); ROM.start(H.G,PS); learn('zhe',PS,'present'); setT('2026-09-26',19); await X().afterEvent(GM,{id:'ev_kexin_two_circles',participants:[KX]});
  check('3. 說溜嘴（阿哲版，沒有地點也可以）：「祐廷最近很忙吧，又要顧妳又要顧沛珊。」（桌上安靜了一下。阿哲看到可昕的臉。）「……欸，我以為妳知道。」',seq(['祐廷最近很忙吧，又要顧妳又要顧沛珊。','（桌上安靜了一下。阿哲看到可昕的臉。）','……欸，我以為妳知道。']));
  H.said=[]; H.G.hour=22; H.G.zone='dorm'; H.picks=['是我的錯']; await play(X().dueAuto(H.G));
  check('3. 可昕「阿哲今天說的，是真的嗎？」；「是我的錯。我沒有跟妳講。」→「你沒有跟我講的何止這個。」（她深呼吸。）「……我最氣的是我自己。我一點都沒發現。」',seq(['阿哲今天說的，是真的嗎？','你沒有跟我講的何止這個。','（她深呼吸。）','……我最氣的是我自己。我一點都沒發現。']));
  fresh('2026-09-10',12,'campus',{dating_kexin:true}); H.CLOSE(PS); ROM.start(H.G,PS); learn('zhe',PS,'present'); H.G.flags.KX_BBQ_COME=false;
  await X().afterEvent(GM,{id:'ev_mid_autumn_bbq',participants:[]}); check('3. 可昕不在場的群聚＝不會說溜嘴',!H.said.length);
  fresh('2026-03-10',12,'campus',{dating_kexin:true,KX_MET_NOODLE_TEAM:true}); ROM.get(H.G,KX).sinceDay=STORY.dayOfKey('2025-03-01'); H.G.events.done.ev_kexin_anniversary_y1=1; H.CLOSE(YT); ROM.start(H.G,YT); setT('2026-03-20',12); learn(KX,YT,'present');
  { DATE.rec(H.G); const t={trip:'T0001',who:KX,locs:['D01'],day:H.G.day-2,depart:10,back:16,transport:'mrt',status:'done',counted:true,spots:['x']}; H.G.trips.push(t); DATE.log(H.G,KX).last={trip:'T0001',day:H.G.day-2}; }
  H.G.hour=22; H.G.zone='dorm'; H.picks=['不說話']; await play(X().dueAuto(H.G));
  check('3. 可昕一般版：「你跟語彤在一起了？」；前幾天一起出去＝「你前幾天還跟我去吃飯欸？」；交往一年以上＋週年演過＝（她的聲音在抖。）',seq(['你跟語彤在一起了？','你前幾天還跟我去吃飯欸？','你跟我在一起的時候，在想什麼？','你講話啊！','（她的聲音在抖。）']),J(T()));
  check('3. （不說話）→「好。你不講。」（她拿起包包）「那我走。」',seq(['好。你不講。','（她拿起包包）','那我走。']));

  fresh('2026-12-01',12,'campus',{dating_kexin:true,KX_MET_NOODLE_TEAM:true}); H.CLOSE(YT); ROM.start(H.G,YT); setT('2027-01-20',12); learn(KX,YT,'present'); H.G.hour=21.6; d=X().dueAuto(H.G);
  check('3. 可昕寒假在高雄：當晚演出來的視訊（不是「我現在過去」）',!!d&&d.bg==='video'); await play(d);
  check('3. 視訊版沒有電話那三句、最後（視訊斷了。）',!H.has('我現在過去。')&&H.has('你跟語彤在一起了？')&&T()[T().length-1]==='（視訊斷了。）',J(T()));
  /* 子晴一個人 */
  fresh('2026-10-01',12,'dorm',{dating_kexin:true}); H.CLOSE(ZQ); ROM.start(H.G,ZQ); setT('2026-10-20',20); learn(ZQ,KX);
  H.G.hour=21.9; check('3. 子晴：那天晚上 22:00 以前不演',!X().dueAuto(H.G)); H.G.hour=22.05; d=X().dueAuto(H.G); check('3. 22:00 以後演',!!d&&d.x===ZQ);
  H.picks=['我本來想跟妳講']; await play(d);
  check('3. 子晴（手機）「你在哪？」「宿舍。」「下來一下。」→ 男宿樓下……（AA_425 2-4 整段換）「可昕。真的喔？」……「……好喔。」→「我本來想跟妳講。」→「本來。」（她笑了一下，很短。）「我先回去了。」「這幾天不要傳訊息給我。」',
    seq(['你在哪？','宿舍。','下來一下。','男宿樓下。她站在路燈下面，手插在外套口袋裡。','可昕。真的喔？','……嗯。','多久？','一年多。','她看著旁邊停的機車，看了很久。','……好喔。','本來。','（她笑了一下，很短。）','我先回去了。','這幾天不要傳訊息給我。'])&&J(H.opts[0])===J(['「對不起。」','「我本來想跟妳講。」','（不說話）']),J(T()));
  fresh('2026-07-01',12,'dorm',{dating_kexin:true,MOVED_OUT:true}); H.G.stage='law'; H.CLOSE(ZQ); ROM.start(H.G,ZQ); setT('2026-07-05',12); H.G.flags.dating_heroine_03=true; ROM.get(H.G,YT).sinceDay=H.G.day-2; learn(ZQ,YT); H.G.flags.YT_LIED={heroine_04:{heroine_03:true}};
  { DATE.rec(H.G); const t={trip:'T0001',who:ZQ,locs:['D01'],day:H.G.day,depart:10,back:16,transport:'mrt',status:'done',counted:true,spots:['x']}; H.G.trips.push(t); DATE.log(H.G,ZQ).last={trip:'T0001',day:H.G.day}; }
  H.G.hour=22.1; H.picks=['（不說話）']; await play(X().dueAuto(H.G));
  check('3. 子晴不在宿舍：「我在家。」「你家那站出口。十分鐘。」、沒有男宿樓下；曾說謊＝第一句後面「……你上次說沒有。」；未滿 7 天＝「這禮拜？」＋這禮拜一起出去「……你這禮拜還跟我出去。」；（不說話）→「好。」',
    seq(['我在家。','你家那站出口。十分鐘。','語彤。真的喔？','……你上次說沒有。','……嗯。','這禮拜？','這禮拜才開始。','……你這禮拜還跟我出去。','……好喔。','好。','我先回去了。'])&&!H.has('男宿樓下。她站在路燈下面，手插在外套口袋裡。')&&!H.has('多久？'),J(T()));
  fresh('2026-10-01',12,'dorm',{dating_kexin:true}); H.CLOSE(ZQ); ROM.start(H.G,ZQ); H.G.flags.YT_PROMISED={heroine_04:'exclusive'}; X().rec(H.G).prom[ZQ]={ys:[KX],day:H.G.day}; setT('2026-10-20',22.2); learn(ZQ,KX); await play(X().dueAuto(H.G));
  check('3. 子晴說會分卻沒分：「所以你根本沒分。」「……我不想再聽你說會怎樣了。」（AA_425 2-3）',seq(['所以你根本沒分。','……我不想再聽你說會怎樣了。']));
  /* 芷若一個人 */
  fresh('2026-10-01',12,'cafe',{dating_kexin:true}); H.CLOSE(ZR); ROM.start(H.G,ZR); setT('2026-10-20',12); learn(ZR,KX); setT('2026-10-20',21.5);
  check('3. 芷若：她的班還沒要結束＝不演',!X().dueAuto(H.G)); H.G.hour=21.8; d=X().dueAuto(H.G); check('3. 人在 Café、她的班要結束（打烊）＝演',!!d&&d.x===ZR);
  H.picks=['對不起']; await play(d);
  check('3. 芷若（AA_425 2-4 整段換）（Café 打烊。……）「可昕的事，我知道了。」（她擦吧檯。……）「……多久了？」……→「對不起。」→（她沒有回答。）「我今天先不要講了。」「門我來鎖。你先走。」',
    seq(['（Café 打烊。她把椅子一張一張倒扣在桌上，沒有看你。）','可昕的事，我知道了。','（她擦吧檯。同一個地方，擦了很久。）','……多久了？','一年多。','（她把抹布折好，放在水槽旁邊。）','（她沒有回答。）','我今天先不要講了。','門我來鎖。你先走。'])&&J(H.opts[0])===J(['「對不起。」','「我不知道怎麼跟妳講。」','（不說話）']),J(T()));
  H.G.zone='campus'; fresh('2027-09-01',12,'campus',{dating_kexin:true}); H.CLOSE(ZR); ROM.start(H.G,ZR); setT('2027-10-05',12); learn(ZR,KX); H.G.hour=21.2; d=X().dueAuto(H.G);
  check('3. 芷若在英國：視訊',!!d&&d.bg==='video'); await play(d);
  check('3. 芷若在英國（AA_425 2-4 英國版）：「可昕的事，我知道了。」（她把手機立在書上，人往後退了一點，臉有一半在畫面外面。）「……多久了？」「一年多。」「我今天先不要講了。……我先掛了。」、沒有 Café 的動作',
    seq(['可昕的事，我知道了。','（她把手機立在書上，人往後退了一點，臉有一半在畫面外面。）','……多久了？','一年多。','我今天先不要講了。……我先掛了。'])&&!H.has('門我來鎖。你先走。')&&!T().some(t=>/Café|吧檯|抹布/.test(t)),J(T()));
  fresh('2026-10-01',12,'cafe',{dating_kexin:true}); H.CLOSE(ZR); ROM.start(H.G,ZR); H.G.flags.OPEN_OK={heroine_02:{kexin:true}}; H.G.flags.dating_heroine_03=true; ROM.get(H.G,YT).sinceDay=H.G.day; setT('2026-10-05',12); learn(ZR,YT); H.G.flags.YT_LIED={heroine_02:{heroine_03:true}}; setT('2026-10-05',21.9);
  await play(X().dueAuto(H.G));
  check('3. 芷若還有誰：「……還有她？」（她看了一下自己的手）「我不想再一個一個知道了。」',seq(['……還有她？','（她看了一下自己的手）','我不想再一個一個知道了。']));
  fresh('2026-10-01',12,'cafe',{}); H.CLOSE(ZR); ROM.start(H.G,ZR); setT('2026-10-05',12); H.G.flags.dating_heroine_03=true; ROM.get(H.G,YT).sinceDay=H.G.day-2; learn(ZR,YT); H.G.flags.YT_LIED={heroine_02:{heroine_03:true}}; setT('2026-10-05',21.9); H.picks=[0]; await play(X().dueAuto(H.G));
  check('3. 芷若變體：曾說謊＝「……多久了？」前面「你那時候說不是這樣。」；未滿 7 天＝之後「……這禮拜？」',seq(['（她擦吧檯。同一個地方，擦了很久。）','你那時候說不是這樣。','……多久了？','這禮拜才開始。','……這禮拜？','（她把抹布折好，放在水槽旁邊。）']),J(T()));
  fresh('2026-10-01',12,'cafe',{dating_kexin:true}); H.CLOSE(ZR); ROM.start(H.G,ZR); H.G.flags.YT_PROMISED={heroine_02:'exclusive'}; X().rec(H.G).prom[ZR]={ys:[KX],day:H.G.day}; setT('2026-10-05',12); learn(ZR,KX); setT('2026-10-05',21.9); await play(X().dueAuto(H.G));
  check('3. 芷若說會講卻沒講：（她沒有說話。她把你的杯子收走，洗乾淨，倒扣在架子上。）「打烊了。」（AA_425 2-3）',seq(['（她沒有說話。她把你的杯子收走，洗乾淨，倒扣在架子上。）','打烊了。']));
  /* 語彤 */
  fresh('2026-10-01',12,'campus',{dating_kexin:true}); H.CLOSE(YT); ROM.start(H.G,YT); setT('2026-10-19',12); learn(YT,KX);
  setT('2026-10-20',18); H.G.zone='noodle'; d=X().dueAuto(H.G); check('3. 語彤：她顧店的晚上來麵店＝演（照她的作息，不綁星期幾）',!!d&&d.x===YT);
  ayi(false); try{ await play(d); } finally { ayi(null); }
  check('3. 語彤《等我下班一下》（原文；3D 的阿姨不在麵店＝阿姨去買東西，AA_503 第 14 節後補第 7 點）',seq(['今天很忙喔？','還好。','阿姨呢？','去買東西。','（她把桌子擦乾淨。）','你等一下有事嗎？','沒有啊。','那等我收完。','怎麼了？','有事問你。','（打烊。鐵門拉下一半，只剩一盞燈。）','我聽說你跟可昕也在一起。','……嗯。','多久了？','一年多。','喔。','（她把抹布擰乾。）','所以你一直都沒跟我講。','對不起。','嗯。','（她停了一會兒。）','我今天有點不想跟你講話。','好。','你先回去吧。']),J(T()));
  const ytZq=h=>{ fresh('2026-10-01',12,'campus',{}); H.CLOSE(YT); ROM.start(H.G,YT); setT('2026-10-20',12); H.G.flags.dating_heroine_04=true; ROM.get(H.G,ZQ).sinceDay=H.G.day-2; learn(YT,ZQ); setT('2026-10-22',h); H.G.zone='noodle'; return X().dueAuto(H.G); };
  d=ytZq(18.5); ayi(true); try{ await play(d); } finally { ayi(null); }
  check('3. 語彤：3D 的阿姨在麵店（圈子表 c503_6_2 那幾列；18:30，19:00 以前也一樣）：沒有「阿姨呢？」，「阿姨，我等一下自己收。」「好啦，你們年輕人。」（阿姨先上樓）；未滿 7 天＝「你這禮拜才開始的？」「……那你為什麼還來找我吃麵？」',
    !!d&&d.x===YT&&seq(['有事問你。','阿姨，我等一下自己收。','好啦，你們年輕人。','（阿姨先上樓）','（打烊。鐵門拉下一半，只剩一盞燈。）','你這禮拜才開始的？','……那你為什麼還來找我吃麵？'])&&!H.has('阿姨呢？')&&!H.has('去買東西。')&&H.said.some(s=>s.who==='阿姨'),J(H.lines()));
  d=ytZq(19.5); ayi(false); try{ await play(d); } finally { ayi(null); }
  check('3. 語彤：19:30 來、3D 的阿姨不在麵店＝照樣「阿姨呢？」「去買東西。」，沒有「阿姨，我等一下自己收。」（不再看幾點）',
    !!d&&d.x===YT&&seq(['今天很忙喔？','還好。','阿姨呢？','去買東西。','有事問你。','（打烊。鐵門拉下一半，只剩一盞燈。）'])&&!H.has('阿姨，我等一下自己收。')&&!H.said.some(s=>s.who==='阿姨'),J(H.lines()));
  fresh('2027-12-10',12,'campus',{dating_kexin:true}); H.CLOSE(YT); ROM.start(H.G,YT); setT('2027-12-20',12); learn(YT,KX); setT('2027-12-23',18); H.G.zone='noodle';
  check('3. 語彤大三上 12/16 續約以後：週四不顧店＝週四來麵店不演、照作息其他晚上',(()=>{ const thu=!X().dueAuto(H.G); setT('2027-12-21',18); return thu&&!!X().dueAuto(H.G); })());
  fresh('2026-10-01',12,'campus',{dating_kexin:true}); H.CLOSE(YT); ROM.start(H.G,YT); H.G.flags.YT_PROMISED={heroine_03:'handle:kexin'}; X().rec(H.G).prom[YT]={ys:[KX],day:H.G.day}; setT('2026-10-19',12); learn(YT,KX); setT('2026-10-20',18); H.G.zone='noodle'; await play(X().dueAuto(H.G));
  check('3. 語彤說會講卻沒講：「你說你會講。」她把抹布放下。「……我等了。」「你回去吧。」',seq(['你說你會講。','她把抹布放下。','……我等了。','你回去吧。']));
  /* 沛珊 */
  fresh('2026-09-20',12,'campus',{dating_kexin:true}); H.CLOSE(PS); H.CLOSE(A1); ROM.start(H.G,PS); learn(A1,KX,'k3');
  setT('2026-10-22',22); X().spreadTick(H.G); ROM.spreadTick(H.G);
  check('3. 傳開：以安知道可昕＋讀書會散會（10/22 週四 21:30）＝沛珊知道（told_by:heroine_01）',(X().relAt(H.G,PS,KX)||{}).source==='told_by:heroine_01');
  setT('2026-10-29',21.6); H.G.zone='wancai'; check('3. 沛珊：下一個讀書會不在（10/29 沒有讀書會）＝不演',!X().dueAuto(H.G));
  setT('2026-11-12',21.6); d=X().dueAuto(H.G); check('3. 沛珊：之後的讀書會散會、回女舍的路上＝演',!!d&&d.x===PS&&d.bg==='girls_dorm_gate',J(d));
  await play(d);
  check('3. 沛珊（AA_228 3-5 原文）',seq(['所以你們真的在一起？','嗯。','多久了？','一年多。','……那麼久。','……那你怎麼沒跟我講？','我不知道妳能不能接受。','你又沒問。','對不起。','我不是說你不能喜歡別人。','可是你至少可以跟我講吧。']),J(T()));
  fresh('2026-09-20',12,'campus',{}); H.CLOSE(PS); ROM.start(H.G,PS); H.G.flags.PS_CONFESSED=true; setT('2026-10-20',12); H.G.flags.dating_heroine_03=true; ROM.get(H.G,YT).sinceDay=H.G.day-20; learn(PS,YT); H.G.flags.YT_LIED={classmate_peishan:{heroine_03:true}}; H.G.hour=13; await X().meet(GM,PS,'talk');
  check('3. 沛珊變體：曾說謊＝「我問過你。你說沒有。」「……你騙我。」（她沒有笑。）（AA_425 2-7）；她坦白過＝最後「我那時候都跟你講了欸。」',seq(['我問過你。你說沒有。','……你騙我。','（她沒有笑。）','對不起。','可是你至少可以跟我講吧。','我那時候都跟你講了欸。'])&&!H.has('你又沒問。'),J(T()));
  fresh('2026-12-01',12,'campus',{dating_kexin:true}); H.CLOSE(PS); ROM.start(H.G,PS); setT('2026-12-20',12); learn(PS,KX,'present');
  check('3. 沛珊 2026-12-16 以後學到的＝沒有「她後來才發現」（AA_425 第 1 節）',!pend(PS));
  fresh('2026-04-10',12,'campus',{dating_kexin:true}); H.CLOSE(PS); ROM.start(H.G,PS); setT('2026-05-10',12); learn(PS,KX,'present');
  check('3. 沛珊大一下交往中（AA_409）學到的＝會有',!!pend(PS));
  fresh('2026-09-20',12,'campus',{dating_kexin:true}); H.CLOSE(PS); ROM.start(H.G,PS); setT('2026-10-20',15);
  const po=[].concat(...STORY.TALK_OPTS.map(f=>{ try{ return f(H.G,PS,GM)||[]; }catch(e){ return []; } })).find(q=>q.t==='「那我也跟妳講一件事。」');
  check('3. 和沛珊說話：「那我也跟妳講一件事。」（祐廷先坦白）',!!po); if(po) await po.run(GM);
  check('3. 沛珊坦白版（AA_228 3-3 已經交往的那一版）：「幹嘛，那麼嚴肅。」「我跟另一個女生也在一起。」「……喔。」「多久了？」→ 3-5',seq(['幹嘛，那麼嚴肅。','我跟另一個女生也在一起。','……喔。','多久了？','一年多。'])&&H.G.flags.YT_CONFESSED[PS].kexin===H.G.day,J(T()));
  /* 正式約會（DATE.scene）遇到：發現＝這一趟不去了；之後照常約會 */
  fresh('2026-10-01',12,'campus',{dating_kexin:true}); H.CLOSE(A1); ROM.start(H.G,A1); setT('2026-10-20',12); learn(A1,KX); DATE.rec(H.G);
  { const t={trip:DATE.newTripId(H.G),who:A1,locs:['D07'],day:H.G.day,depart:13,back:18,transport:'mrt',status:'going',departed:true}; H.G.trips.push(t); H.G.hour=14; const r=await DATE.scene(GM,{dateTrip:t.trip});
    check('3. 和以安的正式約會開頭演發現 → 這一趟不算、取消',r.counted===false&&t.status==='cancelled'&&H.said[0].t==='你跟可昕交往多久了？');
    const t2={trip:DATE.newTripId(H.G),who:A1,locs:['D07'],day:H.G.day,depart:13,back:18,transport:'mrt',status:'going',departed:true}; H.G.trips.push(t2); const r2=await DATE.scene(GM,{dateTrip:t2.trip});
    check('3. 下一趟照常（演過就不再演）',r2.counted===true&&t2.status==='done'); }
  /* 不演的 */
  fresh('2026-10-01',12,'campus',{}); H.CLOSE(A1); ROM.start(H.G,A1); setT('2026-10-20',12); H.G.flags.dating_heroine_05=true; learn(A1,SIS,'lawlib_meet');
  check('3. 以安 × 學姊的法圖相遇（lawlib_meet）走 1A-02 攤牌，不在這裡',!pend(A1));
  fresh('2026-10-01',12,'campus',{dating_kexin:true}); H.CLOSE(A1); learn(A1,KX,'k3'); setT('2026-10-20',12); ROM.start(H.G,A1);
  check('3. 交往以前就知道（knowsRel 在她開始以前）＝不演發現',!pend(A1));
});

/* ---------------- 4. 子晴芷若兩人、《同一頁》、子晴 Q8、傳開 ---------------- */
await sec(4,async()=>{
  fresh('2026-10-01',12,'campus',{}); H.CLOSE(ZQ); H.CLOSE(ZR); ROM.start(H.G,ZQ); setT('2026-10-10',12); ROM.start(H.G,ZR);
  { const t={trip:DATE.newTripId(H.G),who:ZQ,locs:['D03'],day:STORY.dayOfKey('2026-10-24'),depart:10,back:16,transport:'car',status:'booked'}; H.G.trips.push(t); }
  setT('2026-10-23',15.5); check('4. 週五 16:00 以前不演',!X().zzDue(H.G)); H.G.hour=16.1;
  let d=X().dueAuto(H.G); check('4. 兩人都和祐廷交往中、互相不知道：第一個兩人都在學校的週五 16:00＝《星期五下午》',!!d&&d.k==='zz_friday');
  await play(d);
  check('4. 《星期五下午》（原文；開車的約會）',seq(['欸，我星期六要跟男朋友出去。','去哪？','還沒決定。祐廷說他開車來接我。','……哪個祐廷？','就法律系那個啊。妳也認識。','等一下。','幹嘛？','妳跟他在一起了？','對啊。','……我也是。','蛤？','我跟祐廷也在一起。','靠北，他劈腿喔？']),J(T()));
  check('4. 子晴先（差 9 天）：「妳什麼時候跟他在一起的？」「一個禮拜前。」……「三個禮拜。」「所以他跟我在一起以後，又跑去追妳？」',seq(['妳什麼時候跟他在一起的？','一個禮拜前。','……我們比較早。','多久？','三個禮拜。','所以他跟我在一起以後，又跑去追妳？']),J(T()));
  check('4. 友情段落（原文）',seq(['好喔。','（她收起手機。）','妳先不要管我。妳自己咧？','我還沒想好。','那就先不要想。','走啦，我餓了。'])&&ROM.knowsOf(H.G,ZQ,ZR)&&ROM.knowsOf(H.G,ZR,ZQ));
  H.said=[]; setT('2026-10-24',19.6); H.G.zone='dorm'; d=X().dueAuto(H.G); check('4. 那個週六 19:30：《你出來一下》',!!d&&d.k==='zz_callout');
  H.picks=['對不起。我應該先講']; await play(d);
  check('4. 《你出來一下》手機「你現在在哪？」「宿舍。」「下來一下。」→（男宿樓下。路燈。她們兩個站在一起。）……「但你真的蠻欠揍的。」→「對不起。我應該先講。」→「應該喔。」「……你那時候在想什麼？」（AA_425 第 3 節）',
    seq(['你現在在哪？','宿舍。','下來一下。','（男宿樓下。路燈。她們兩個站在一起。）','……妳們怎麼會在一起？','我們本來就在一起啊。','我們是朋友。','幹，你這個表情。','我們本來真的有想說，要不要給你蓋布袋。','但你真的蠻欠揍的。','應該喔。','……你那時候在想什麼？']),J(T()));
  check('4. 最後（使用者定稿）「我們今天是來跟你講一件事。」「我們兩個都決定分手。」……「芷若，走了。」；兩段同時結束、by her、ZQ_ZR_ENDED_DAY',
    seq(['我們今天是來跟你講一件事。','我們兩個都決定分手。','……','你是不是以為我們會吵架？','沒有。','最好是。','（子晴看了一眼芷若。）','我們認識多久了，你知道嗎？','（祐廷沒有回答。）','算了，反正也不是來跟你講這個的。','（子晴勾住芷若的手臂。）','芷若，走了。'])&&!H.G.flags.dating_heroine_04&&!H.G.flags.dating_heroine_02&&H.G.flags.ZQ_ZR_ENDED_DAY===H.G.day&&ROM.get(H.G,ZQ).by==='her');
  check('4. 分手以後：她們的戀愛歸零、正式約會次數歸零',SOCIAL.rel(ZQ).npcRom===0&&DATE.log(H.G,ZR).count===0);
  fresh('2026-10-01',12,'campus',{}); H.CLOSE(ZQ); H.CLOSE(ZR); ROM.start(H.G,ZR); ROM.start(H.G,ZQ); learn(ZR,ZQ,'early'); setT('2026-10-23',16.1); await play(X().dueAuto(H.G));
  check('4. 相差 7 天以內：「我是10月1號。」「……我是10月1號。」「差不多同時喔？他是排行程喔？」；沒有開車的約會＝「祐廷說要帶我去…」',seq(['我是10月1號。','……我是10月1號。','差不多同時喔？他是排行程喔？'])&&T().some(t=>/^祐廷說要帶我去/.test(t)||t==='祐廷說要帶我去。'),J(T()));
  H.said=[]; setT('2026-10-24',19.6); await play(X().dueAuto(H.G));
  check('4. 有一個人早就知道＝拆成各自講：子晴「我跟芷若講好了。我不要了。」',H.has('我跟芷若講好了。我不要了。')&&!H.has('我們兩個都決定分手。')&&!H.G.flags.dating_heroine_04&&H.G.flags.dating_heroine_02===true);
  H.said=[]; setT('2026-10-25',21.6); d=X().dueAuto(H.G); check('4. 隔天（週日）Café 打烊後芷若',!!d&&d.k==='zz_split_zr'); await play(d);
  check('4. 芷若「我跟子晴說好了。……我們分開吧。」→ 兩段都結束',H.has('我跟子晴說好了。……我們分開吧。')&&!H.G.flags.dating_heroine_02);
  fresh('2026-10-01',12,'campus',{}); H.CLOSE(ZQ); H.CLOSE(ZR); ROM.start(H.G,ZQ); setT('2026-10-02',12); ROM.start(H.G,ZR); H.G.flags.OPEN_OK={heroine_02:{heroine_04:true}}; setT('2026-10-23',16.1);
  check('4. 有人「曾同意」＝不演《星期五下午》',!X().zzDue(H.G));
  fresh('2027-09-01',12,'campus',{}); H.CLOSE(ZQ); H.CLOSE(ZR); ROM.start(H.G,ZQ); ROM.start(H.G,ZR); setT('2027-10-08',16.1);
  check('4. 芷若在英國的學期＝不觸發',!X().zzDue(H.G));

  /* 《同一頁》 */
  fresh('2026-10-01',12,'campus',{dating_kexin:true}); H.CLOSE(A1); ROM.start(H.G,A1); setT('2026-10-20',12); learn(A1,KX); H.G.hour=13; await X().meet(GM,A1,'talk');
  const st=X().st(H.G,A1); check('4. 《同一頁》排在之後第一個她在總圖的那天晚上 21:00',st.selfAt!=null&&st.selfAt%24===21&&Math.floor(st.selfAt/24)>H.G.day);
  H.said=[]; H.G.day=Math.floor(st.selfAt/24); H.G.hour=21.1; H.G.weekday=CALENDAR.dateOf(H.G.day).wd%7; const d1=X().dueAuto(H.G); check('4. 時間到了演（畫面跟著她）',!!d1&&d1.k==='self');
  await play(d1);
  check('4. 《同一頁》（AA_227 3-5）',seq(['（總圖三樓，靠窗的位子。行政法，第七章。）','（手機亮了一下。是你。）','（她把手機翻過去，繼續念。）','（過了一陣子，她的筆記還停在第七章第二節。）','（她從那一段開頭再看一遍。）','（還是一樣。）','（她把手機拿起來，又放下。）','……煩死了。','（她把課本往前推，起身去裝水。）','（回來以後，她在便利貼上寫：「第七章看完。第八章明天。」貼在課本封面。）','（那天晚上她念到閉館。第八章也看了一半。）']),J(T()));

  /* 子晴 Q8 */
  fresh('2027-06-04',22,'dorm',{ZQ_DAD_HEARD:true}); H.FRIEND(ZQ); PHONE.post(H.G,{th:'p:'+ZQ,from:ZQ,text:'……我跟芷若去河堤走了一圈 沒事',ask:{id:'y2_zq_dad_msg',opts:[{t:'沒事就好。',say:[]},{t:'要不要出來走走？',say:[]}]}}); PHONE.answer(H.G,'y2_zq_dad_msg',0);
  check('4. 子晴 Q8：當天還不算',!X().zqDadDue(H.G)); setT('2027-06-07',15);
  check('4. 說「改天講」的玩家，下一次見面',X().zqDadDue(H.G));
  for(const f of STORY.PRE_TALK) await f(GM,{name:'子晴',charId:ZQ},ZQ);
  check('4. 她第一句「我爸那天說，做遊戲是在浪費時間。」「……我那天沒有吵贏。」「好，不講了。走。」（AA_425 2-7；不加選項），只一次',seq(['我爸那天說，做遊戲是在浪費時間。','……我那天沒有吵贏。','好，不講了。走。'])&&!H.opts.length&&!X().zqDadDue(H.G));
  fresh('2027-06-04',22,'dorm',{ZQ_DAD_HEARD:true}); PHONE.post(H.G,{th:'p:'+ZQ,from:ZQ,text:'x',ask:{id:'y2_zq_dad_msg',opts:[{t:'a',say:[]},{t:'b',say:[]}]}}); PHONE.answer(H.G,'y2_zq_dad_msg',1); setT('2027-06-07',15);
  check('4. 選了「要不要出來走走？」＝沒有這一句',!X().zqDadDue(H.G));
});

/* ---------------- 5. 沒有和別人交往、舊存檔 ---------------- */
await sec(5,async()=>{
  fresh('2026-10-20',15,'campus',{}); for(const x of [A1,SIS,ZQ,ZR,YT,PS]) H.CLOSE(x); ROM.start(H.G,A1); learn(A1,'zhe');
  X().scan(H.G); check('5. 只和以安交往（沒有別人）：沒有待演的發現、沒有自動演的',!Object.keys(X().rec(H.G).pend).length&&!X().dueAuto(H.G));
  check('5. 沒有別人＝心意邀約是原本的版本',!X().knowWalkDue(H.G,ZQ,'Y2S1'));
  const G0={v:3,day:400,hour:12,flags:{dating_kexin:true},events:{done:{}},name:'祐廷',social:null,rel:{}}; ROM.rec(G0);
  check('5. 舊存檔：ROM.rec 讀檔時補 YT_CONFESSED／YT_PROMISED／YT_BROKE_PROMISE／YT_LIED／OPEN_OK／YT_HONEST／YT_DODGED＝{}',['YT_CONFESSED','YT_PROMISED','YT_BROKE_PROMISE','YT_LIED','OPEN_OK','YT_HONEST','YT_DODGED'].every(k=>J(G0.flags[k])==='{}'));
  const G1={v:3,day:400,hour:12,flags:{dating_kexin:true,YT_HONEST:{heroine_01:true},OPEN_OK:{heroine_01:{kexin:true}}},events:{done:{}},name:'祐廷',social:null,rel:{}}; ROM.rec(G1); X().rec(G1);
  check('5. 已經有的紀錄不改；MREL 第一次讀就建空的',G1.flags.YT_HONEST.heroine_01===true&&G1.flags.OPEN_OK.heroine_01.kexin===true&&J(Object.keys(G1.flags.MREL).sort())===J(['block','cpend','disc','gh','like','liked','once','pend','prom','rb','scan','st','v','zr','zz'].sort()));
  fresh('2026-10-20',15,'campus',{dating_kexin:true}); H.G.stage='econ'; H.CLOSE(A1); learn(A1,KX);
  check('5. 經濟系那一年：都不演',!X().askDue(H.G,A1)&&(X().scan(H.G),!Object.keys(X().rec(H.G).pend).length));
});

H.done();
})();
