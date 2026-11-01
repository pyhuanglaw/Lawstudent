// 多線交往第二批（AA_423 @26357a44；審稿更正 AA_425 @310d6cc67；台詞照 AA_227／AA_228 原句）——不需要瀏覽器。src/multirel3d.js、src/data/multirel_lines.js
//   1 以安：傳「可以跟妳談一下嗎？」→「這禮拜不要。」→ 下一個讀書會的週四研討室（第一段；「我不知道」下次再一次）→ 總圖外面（第二段）→ 結果 A／B／C／D、D 之後那句旁白；大四上 11/30 以後在總圖外面的長椅；日本那學期不在這裡
//   2 書瑀：發現後第 3 天晚上她自己的場景（法四／碩班報告／法律扶助；法服版拿掉）＋她傳的四句 → 隔天公館的小店 → 兩次見面以後結果；第二次冷靜；美國的視訊版（AA_425 第 3 節）
//   3 可昕：《本來想傳給你》（政大的貓、照片、回不回）→ 隔天公館（後半，吸管）→《我們以前不是這樣的》（經歷過的事，沒有 K10 比數）→ 隔天晚上她打來（5-5）→ 結果；第二次冷靜
//   4 子晴、芷若一個人：子晴 7 天後「宵夜」「你請」→ 鹽酥雞攤；芷若 Café 等她下班；英國＝每週的視訊；結果 A～D；第二次冷靜（子晴傳照片的英國版）
//   5 語彤：第一段（麵店）、打擾（BB_194 13-4）、第二段（總圖三樓外面的走廊）＋她開口要求、結果
//   6 沛珊：《我們講清楚好不好》A／B／C、談界線（雙向協議）、每學期第一週那一句、結果；消失期＝電話
//   7 子晴芷若一起分手以後（AA_227 6-6）：拒絕 L3、心意邀約不發、招呼、閒聊各一句、可以重新開始那天的話、重新交往的那一位告訴另一位
//   8 AA_423 6-3（8/6 21:00 沛珊打來）作廢：不演
// 修改前（開發分支 8cfc1b7de）：沒有 src/multirel3d.js——FAIL。用法：node tests/aa423_multirel_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
global.ZRUK={W_FROM:'2028-09-01',playW:async()=>'orig'};   /* 每週的視訊（src/zr_uk3d.js）的樣子：multirel3d.js 包它的 playW */
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(MREL|MULTIREL_LINES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
let ok=true, err=''; try{ load('src/data/multirel_lines.js'); load('src/multirel3d.js'); }catch(e){ ok=false; err=String(e&&e.stack||e); }
const X=()=>typeof MREL!=='undefined'?MREL:null;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); } };
const A1='heroine_01', ZR='heroine_02', YT='heroine_03', ZQ='heroine_04', SIS='heroine_05', PS='classmate_peishan', KX='kexin';
const setT=(key,h)=>{ H.G.day=STORY.dayOfKey(key); H.G.hour=h; H.G.weekday=CALENDAR.dateOf(H.G.day).wd%7; };
const T=()=>H.said.map(s=>s.t);
const seq=arr=>{ const t=T(); let i=0; for(const a of arr){ const k=t.indexOf(a,i); if(k<0) return false; i=k+1; } return true; };
const clr=()=>{ H.said=[]; H.opts=[]; };
const fresh=(key,h,zone,fl)=>{ H.fresh(key,h,zone||'campus',Object.assign({},fl||{})); if(X()) X()._gm=GM; return H.G; };
const learn=(x,y,src,at)=>ROM.learn(H.G,x,y,src||'test',at);
const play=async a=>{ if(a) await X().play(GM,a); return a; };
const due=()=>X().dueAuto(H.G);
const st=x=>X().st(H.G,x);
const setRom=(id,v)=>{ SOCIAL.rel(id).npcRom=v; };
const six=id=>{ const r=SOCIAL.rel(id); Object.assign(r,{fam:70,trust:55,comf:50,npcRom:85,rom:40}); };
const runOut=async id=>{ const q=OUT.get(H.G,id); if(!q) return null; X().OUTEV.beforeOuting(H.G,GM,q); await EVENTS.run(X().OUTEV); return q; };
const disc=async(x,y,key,since,how)=>{ /* x 從 since 開始交往、key 那天知道 y、演發現 */ fresh(since,12,'campus',y===KX?{dating_kexin:true,KX_MET_NOODLE_TEAM:true}:{}); H.CLOSE(x); ROM.start(H.G,x);
  if(y!==KX){ H.G.flags['dating_'+y]=true; ROM.get(H.G,y).sinceDay=H.G.day; } setT(key,12); learn(x,y); H.G.hour=13; await X().meet(GM,x,how||'talk'); clr(); };
const msgs=th=>(H.G.msgs||[]).filter(m=>!th||m.th===th).map(m=>m.text);

(async()=>{
check('0. 兩個檔都載得到；每週的視訊 ZRUK.playW 包上',ok&&!!X()&&!!ZRUK._mrel,err);
if(!X()){ H.done(); return; }
/* 結果「接受同時交往」那一格照 ROM.PARAMS.acceptsOpen（AA_423 第 0 節；使用者 10-27 回答 C：遊戲裡七位都打開，AA_474）：這個檔測「接受」那幾句；關著的情形在 tests/mrel_ps_turn_unit.js */
for(const k in ROM.PARAMS.acceptsOpen) ROM.PARAMS.acceptsOpen[k]=true;

/* ---------------- 1. 以安 ---------------- */
await sec(1,async()=>{
  await disc(A1,KX,'2026-10-20','2026-10-01'); setRom(A1,70);
  check('1. 發現以後：冷靜中、隔天 20:00 問要不要傳',st(A1).phase==='cool'&&st(A1).askAt===(H.G.day+1)*24+20);
  setT('2026-10-21',19.9); check('1. 20:00 以前不問',!due()); H.G.hour=20.1; let d=due(); check('1. 20:00 以後：傳不傳（UI）',!!d&&d.k==='ask');
  H.picks=[1]; await play(d); check('1. 「（先不傳）」＝三天後晚上再問一次',J(H.opts[0].map(String))===J(['「可以跟妳談一下嗎？」','（先不傳）'])&&st(A1).askAt===(H.G.day+3)*24+20&&!st(A1).asked);
  setT('2026-10-21',21.1); d=due(); check('1. 《同一頁》那天晚上先演（之後才問）',!!d&&d.k==='self'); await play(d);
  setT('2026-10-24',20.2); H.picks=[0]; await play(due()); PHONE.tick(H.G); H.G.hour=20.3; PHONE.tick(H.G);
  check('1. 傳了：「可以跟妳談一下嗎？」→ 她「這禮拜不要。」',J(msgs('p:'+A1))===J(['可以跟妳談一下嗎？','這禮拜不要。']),J(msgs('p:'+A1)));
  check('1. 下一個讀書會的週四（至少隔 3 天）：11/12（10/29、11/5 沒有讀書會）',st(A1).talkAt===STORY.dayOfKey('2026-11-12'));
  setT('2026-11-12',21.6); d=due(); check('1. 11/12 21:30 散會：第一段，研討室',!!d&&d.k==='talk1'&&d.bg==='wancai_seminar',J(d));
  clr(); H.picks=['……我不知道']; await play(d);
  check('1. 第一段（原文）「以安，我想跟妳談一下。」……「可是我為什麼生氣，你知道嗎？」→「……我不知道。」→「那你回去想。」「想到了再來。」',
    seq(['以安，我想跟妳談一下。','你想講什麼？','我不想跟妳分手。','我有說要分手嗎？','沒有。','那你到底在急什麼？','（你沒有回答。）','你現在是不是只怕我不理你？','……是。','可是我為什麼生氣，你知道嗎？','那你回去想。','想到了再來。'])&&!st(A1).willing,J(T()));
  setT('2026-11-19',21.6); d=due(); check('1. 「我不知道」＝下次三個選項再一次（下一個週四）',!!d&&d.k==='talk1');
  clr(); H.picks=['因為我沒有講']; await play(d);
  check('1. 「因為我沒有講。」→「對。」「你要跟誰在一起，我管不了。可是我在跟你交往，我應該知道。」「……你現在不用回答。我只是要你知道我在氣什麼。」＝她願意談',seq(['對。','你要跟誰在一起，我管不了。可是我在跟你交往，我應該知道。','……你現在不用回答。我只是要你知道我在氣什麼。'])&&!!st(A1).willing);
  setT('2026-11-26',21.6); d=due(); check('1. 之後一次談完：總圖外面（第二段）',!!d&&d.k==='talk2'&&d.bg==='library_gate_night');
  clr(); H.picks=['我很高興妳來']; await play(d);
  check('1. 第二段（原文）「那我先回去了。」……「我真的覺得自己很煩。」→「我很高興妳來。」→「我沒有要讓你高興。」（她把背帶拉好。）「我走了。」（走了兩步）「禮拜四你要來。」',
    seq(['那我先回去了。','嗯。','（你轉身。）','欸。','怎麼了？','……沒事。','真的？','我今天本來不想見你的。','我知道。','結果我還是來了。','（她低頭整理背包的背帶。）','我真的覺得自己很煩。','我沒有要讓你高興。','（她把背帶拉好。）','我走了。','（走了兩步）','禮拜四你要來。']));
  setT('2026-12-03',21.6); clr(); await play(due());
  check('1. 結果 B（還在交往、要時間）：「這學期我想把書念好。你不要每天約我。」',J(T())===J(['這學期我想把書念好。你不要每天約我。'])&&st(A1).result==='B');
  setT('2026-12-10',21.6); check('1. B 只說一次（之後每個週四再看，沒變＝不演）',!due());
  six(A1); setT('2026-12-17',21.6); clr(); await play(due());
  check('1. 結果 C（還想和可昕在一起＋她的戀愛 ≥ 80＋第 6 階＋沒說謊；AA_425）：「我決定了。」（她把手帳翻到空白的一頁，推到你面前。）「以後有什麼事，寫在這裡。我會看。」「……再有一次，我就不問了。」＝OPEN_OK、tell_first',
    seq(['我決定了。','（她把手帳翻到空白的一頁，推到你面前。）','以後有什麼事，寫在這裡。我會看。','……再有一次，我就不問了。'])&&H.G.flags.OPEN_OK[A1].kexin===true&&H.G.flags.YT_PROMISED[A1]==='tell_first');
  await disc(A1,KX,'2026-10-20','2026-10-01'); setRom(A1,70); const s=st(A1); s.asked=1; s.willing=1; s.next='result'; s.talkAt=STORY.dayOfKey('2026-12-03'); s.done={self:1}; ROM.end(H.G,KX,'test'); setT('2026-12-03',21.6); clr(); await play(due());
  check('1. 結果 A（可昕真的分了）：「你跟她講了？」「講了。」「好。」「……我不會一下就好。你知道吧。」「我知道。」「那禮拜六還是出去。我訂位了。」',seq(['你跟她講了？','講了。','好。','……我不會一下就好。你知道吧。','我知道。','那禮拜六還是出去。我訂位了。'])&&st(A1).phase==='done');
  await disc(A1,KX,'2026-10-20','2026-10-01'); setRom(A1,50); Object.assign(st(A1),{asked:1,willing:1,next:'result',talkAt:STORY.dayOfKey('2026-12-03'),done:{self:1}}); setT('2026-12-03',21.6); clr(); await play(due());
  check('1. 結果 D（她的戀愛 < 60；AA_425）：「我不想這樣下去。」「……分手吧。」「讀書會照常。」＝分手（她說的）',seq(['我不想這樣下去。','……分手吧。','讀書會照常。'])&&!H.G.flags.dating_heroine_01&&ROM.get(H.G,A1).by==='her');
  setT('2026-12-10',20.2); H.G.zone='wancai'; clr(); await play(due());
  check('1. D 之後兩週內的讀書會：一次旁白「（她還是坐在讀書會那張桌子靠窗的位置。你進來的時候，她抬頭看了一下，又低頭。）」',J(T())===J(['（她還是坐在讀書會那張桌子靠窗的位置。你進來的時候，她抬頭看了一下，又低頭。）'])&&!due());
  await disc(A1,KX,'2026-10-20','2026-10-01'); H.G.flags.YT_CONFESSED={heroine_01:{kexin:H.G.day}}; Object.assign(st(A1),{asked:1,next:'talk1',talkAt:STORY.dayOfKey('2026-11-12'),done:{self:1}}); setT('2026-11-12',21.6); H.picks=['因為我跟別人在一起']; await play(due());
  check('1. 祐廷先坦白過＝第一段她多一句「至少是你自己講的。」；「因為我跟別人在一起。」→「那也是。」「可是如果你一開始就講，我可以自己決定要不要。」「你連讓我決定都沒有。」',seq(['那也是。','可是如果你一開始就講，我可以自己決定要不要。','你連讓我決定都沒有。','至少是你自己講的。']));
  check('1. 大四上 11/30 交棒以後：平日晚上總圖外面的長椅',X().anTalkDay(H.G,STORY.dayOfKey('2028-12-01'))===STORY.dayOfKey('2028-12-01')&&X().anBench(STORY.dayOfKey('2028-12-01'))&&!X().anBench(STORY.dayOfKey('2028-11-29')));
  await disc(A1,KX,'2028-04-10','2028-01-02'); setT('2028-04-12',21.6); Object.assign(st(A1),{asked:1,next:'talk1',talkAt:H.G.day});
  check('1. 她在日本那學期：不在這裡（AA_254 第 10 節）',!due());
  await disc(A1,KX,'2026-10-20','2026-10-01'); const sa=st(A1).selfAt; H.G.day=Math.floor(sa/24); H.G.hour=21.1; st(A1).n=2; clr(); await play(due());
  check('1. 第二次冷靜《同一頁》（AA_227 8-3；AA_425 2-7）',seq(['（總圖三樓，同一個靠窗的位子。這次是民法。）','（手機亮了。她看了一眼，沒有翻過去，直接把它收進包包。）','（她把今天要念的頁數寫在便利貼上，比上次多寫了五頁。）','（她把那張便利貼撕下來，重寫了一張。字比上一張小。）','（她念到閉館。便利貼上的五頁，劃掉了四頁。）'])&&!H.has('……不會再一樣了。'),J(T()));
});

/* ---------------- 2. 書瑀 ---------------- */
await sec(2,async()=>{
  await disc(SIS,KX,'2026-04-20','2026-04-01');
  setT('2026-04-23',20.9); check('2. 發現後第 3 天 21:00 以前沒有',!due()); H.G.hour=21.1; let d=due(); check('2. 第 3 天 21:00：她自己的場景',!!d&&d.k==='self'); await play(d);
  check('2. 放榜以後、碩一以前＝法四那一版（AA_425）＋她傳的四句',seq(['（系上的教授回她信，說她的期末報告寫得很好，可以投學生論文獎。）','（她拿起手機，打開和你的對話。）','（最後一則是三天前，她傳的「我到家了」。）','（她把手機放下。過了一下，又拿起來。）','你明天有空嗎？','有。怎麼了？','想跟你吃個飯。','好。'])&&J(msgs('p:'+SIS))===J(['你明天有空嗎？','有。怎麼了？','想跟你吃個飯。','好。']),J(T()));
  const q=OUT.get(H.G,'mrel_heroine_05_dinner_'+(H.G.day+1)); check('2. 隔天 19:00 公館的小店（出遊）',!!q&&q.h===19&&q.place==='公館的小店'&&q.ev==='ev_mrel_outing');
  setT('2026-04-24',19); clr(); H.picks=['也想跟妳']; await runOut(q.id);
  check('2. 後半（原文）「我那天回去有想過。」……「好。那我們繼續講。」→「我還是想跟她在一起，也想跟妳。」→ 原文＋「我要想一段時間。……會很久。」',
    seq(['我那天回去有想過。','嗯。','我還是很生氣。','我知道。','可是我也還是想跟你吃飯。','（她低頭喝了一口水。）','這樣很矛盾嗎？','不會。','好。那我們繼續講。','所以你現在還是想跟她在一起？','對。','那你也想跟我繼續？','對。','……你知道我現在很難回答嗎？','我要想一段時間。……會很久。'])&&st(SIS).intent==='both',J(T()));
  setRom(SIS,80); check('2. 之後兩次正常的見面（照常閒聊）',!X().meetAction(H.G,SIS,'talk')&&!X().meetAction(H.G,SIS,'talk'));
  const a=X().meetAction(H.G,SIS,'talk'); clr(); await a.run(GM);
  check('2. 結果 B 接受（她的戀愛 ≥ 75、沒說謊）：「我想過了。」「我還是喜歡你。這個我不想騙自己。」「……你去見她那天，出門前傳一句給我就好。」（第三句 AA_474 第 5 節改）＝OPEN_OK',seq(['我想過了。','我還是喜歡你。這個我不想騙自己。','……你去見她那天，出門前傳一句給我就好。'])&&!H.has('她的事，你要自己跟我講。我不想用猜的。')&&H.G.flags.OPEN_OK[SIS].kexin===true);
  await disc(SIS,KX,'2026-04-20','2026-04-01'); Object.assign(st(SIS),{phase:'talked',intent:'both',meets:2}); setRom(SIS,60); clr(); await X().meetAction(H.G,SIS,'talk').run(GM);
  check('2. 結果 B 不接受：「我想過了。」「我沒辦法。我會一直在想你現在在哪裡。」「我們先不要在一起了。」→ 分手',seq(['我想過了。','我沒辦法。我會一直在想你現在在哪裡。','我們先不要在一起了。'])&&!H.G.flags.dating_heroine_05);
  await disc(SIS,KX,'2026-04-20','2026-04-01'); Object.assign(st(SIS),{phase:'talked',intent:'unsure',meets:2}); clr(); await X().meetAction(H.G,SIS,'talk').run(GM);
  check('2. 結果 C：「我這陣子想先顧自己的報告。有事你還是可以找我。」（拉開距離）',J(T())===J(['我這陣子想先顧自己的報告。有事你還是可以找我。'])&&st(SIS).phase==='distant');
  await disc(SIS,KX,'2026-04-20','2026-04-01'); Object.assign(st(SIS),{phase:'talked',intent:'exclusive',meets:0}); ROM.end(H.G,KX,'t'); clr(); await X().meetAction(H.G,SIS,'talk').run(GM);
  check('2. 結果 A（AA_425）：「你跟她講了。」「嗯。」「好。我還有點氣。……今天去吃飯。」',J(T())===J(['你跟她講了。','嗯。','好。我還有點氣。……今天去吃飯。']));
  await disc(SIS,KX,'2026-04-20','2026-04-01'); Object.assign(st(SIS),{phase:'talked',intent:'both',meets:0}); H.G.flags.YT_LIED={heroine_05:{kexin:true}}; clr(); await X().meetAction(H.G,SIS,'talk').run(GM);
  check('2. 結果 D（又說謊；AA_425）：「這樣下去，我會一直生氣。」「……我們就到這裡。」',J(T())===J(['這樣下去，我會一直生氣。','……我們就到這裡。'])&&!H.G.flags.dating_heroine_05);
  await disc(SIS,KX,'2026-10-20','2026-04-01'); setT('2026-10-23',21.1); clr(); await play(due());
  check('2. 碩一上＝碩班報告那一版',H.has('（法學院圖書館，她的位子。指導老師剛回信，說她報告的第二段可以投研討會。）'));
  await disc(SIS,KX,'2027-03-10','2026-04-01'); setT('2027-03-13',21.1); clr(); await play(due());
  check('2. 碩一下＝法律扶助那一版；沒有法服版',H.has('（扶助基金會的律師回她，說她整理的那份表格以後可以給大家用。）')&&!T().some(t=>/法服/.test(t)));
  await disc(SIS,KX,'2027-03-10','2026-04-01'); st(SIS).n=2; setT('2027-03-13',21.1); clr(); await play(due());
  check('2. 第二次冷靜（AA_227 8-3）',seq(['（她打開和你的對話。上一次的「你明天有空嗎？」還在最上面。）','（她沒有打字，把手機放回桌上，把那件事告訴了旁邊的同學。）','（晚上回家，她又打開對話，打了：「今天有件事，本來想跟你講。」）','（停了很久，才按出去。）']));
  setT('2027-03-14',19); clr(); H.picks=[2]; await runOut('mrel_heroine_05_dinner_'+H.G.day);
  check('2. 第二次：吃到一半第一句「這次我比上次更生氣。」；「我還不知道。」→「那我們先這樣吃飯就好。」「你想好了再講。」',seq(['這次我比上次更生氣。','嗯。','我還是很生氣。','那我們先這樣吃飯就好。','你想好了再講。'])&&!H.has('我那天回去有想過。'));
  fresh('2028-05-01',12,'campus',{dating_kexin:true}); H.CLOSE(SIS); ROM.start(H.G,SIS); setT('2028-09-10',12); learn(SIS,KX); H.G.hour=21.2; await play(due()); setT('2028-09-13',21.1); clr(); await play(due());
  check('2. 她在美國、祐廷在台灣（AA_425 第 3 節）：書瑀（訊息）「明天你那邊晚上，可以視訊嗎？」祐廷（訊息）「可以。怎麼了？」書瑀（訊息）「想跟你講一下話。」',seq(['明天你那邊晚上，可以視訊嗎？','可以。怎麼了？','想跟你講一下話。'])&&!H.has('想跟你吃個飯。'));
  const qv=OUT.get(H.G,'mrel_heroine_05_dinner_'+(H.G.day+1)); check('2. 隔天的視訊（接起來）',!!qv&&qv.place==='視訊'&&qv.verb==='接起來'&&qv.call===true);
  setT('2028-09-14',21); clr(); H.picks=[2]; await runOut(qv.id);
  check('2. 視訊：「我那天回去有想過。」……「可是我也還是想跟你講話。」……「好。那我們繼續講。」',seq(['我那天回去有想過。','嗯。','我還是很生氣。','我知道。','可是我也還是想跟你講話。','（她低頭喝了一口水。）','這樣很矛盾嗎？','不會。','好。那我們繼續講。']));
});

/* ---------------- 3. 可昕 ---------------- */
await sec(3,async()=>{
  const kd=async(key,fl)=>{ fresh('2026-09-10',12,'dorm',Object.assign({dating_kexin:true,KX_MET_NOODLE_TEAM:true},fl||{})); H.CLOSE(PS); ROM.start(H.G,PS); setT(key,19); learn(KX,PS,'slip:zhe@x'); H.G.hour=21.6; H.picks=['是我的錯']; await play(due()); clr(); };
  await kd('2026-10-05');
  setT('2026-10-07',16.9); check('3. 發現後第 2 天 17:00 以前沒有',!due()); H.G.hour=17.1; await play(due());
  check('3. 《本來想傳給你》前半（AA_227 5-3）＋她傳「（照片）」「……你不要回。」',seq(['（木柵大學，下課。系館前面有一隻貓躺在機車坐墊上，睡得四腳朝天。）','（她拍了一張，打開和你的對話。打了「你看」。）','（她停住，把字刪掉。）','（走到山下的時候，她又打開對話，把照片傳出去。）']));
  PHONE.tick(H.G); check('3. 手機：「（照片）」「……你不要回。」（可以回）',J(msgs('p:'+KX).slice(-2))===J(['（照片）','……你不要回。']));
  PHONE.answer(H.G,'mrel_kx_photo_'+STORY.dayOfKey('2026-10-05'),0); X().phone(H.G,GM); H.G.hour=17.4; X().phone(H.G,GM); PHONE.tick(H.G);
  check('3. 回了：10 分鐘後「明天晚上，公館。你出來。」、隔天 19:00 公館',msgs('p:'+KX).includes('明天晚上，公館。你出來。')&&!!OUT.get(H.G,'mrel_kexin_back_'+STORY.dayOfKey('2026-10-08')));
  setT('2026-10-08',19); clr(); await runOut('mrel_kexin_back_'+H.G.day);
  check('3. 後半（原文）「我真的很討厭你。」……「我真的快被你氣死。」（交往不到一年＝不哭：她把吸管咬扁了。）',seq(['我真的很討厭你。','我知道。','你不知道。','（她安靜了一會兒。）','我本來想說不要再見你了。','……','可是我今天看到一個東西，又想傳給你。','我真的快被你氣死。','（她把吸管咬扁了。）']),J(T()));
  H.G.events.done.ev_y0_e37=1; clr(); H.picks=['我不想失去妳']; let a=X().meetAction(H.G,KX,'out'); await a.run(GM);
  check('3. 下一次見面《我們以前不是這樣的》＋經歷過的事（經濟系版演過導遊）＋「我不想失去妳。」→「那你早幹嘛去了。」（她瞪你，眼睛紅了）「……我也不想。」',
    seq(['我那天真的氣到不想再看到你。','嗯。','可是我回去想一想，又覺得很不甘心。','什麼不甘心？','我們好不容易才走到現在欸。','你第一次來木柵大學，我說我是導遊，結果我們兩個一起迷路。','你知道嗎？','我知道。','你不要一直說你知道。','你如果真的知道，怎麼會這樣？','那你早幹嘛去了。','（她瞪你，眼睛紅了）','……我也不想。']),J(T()));
  await kd('2026-10-05'); Object.assign(st(KX),{done:{self:1,back:1}}); DATE.rec(H.G);
  { const t={trip:DATE.newTripId(H.G),who:KX,locs:['D07'],day:H.G.day,depart:13,back:18,transport:'mrt',status:'going',departed:true}; H.G.trips.push(t); H.G.hour=14; const r=await DATE.scene(GM,{dateTrip:t.trip});
    check('3. 和可昕的正式約會開頭演《我們以前不是這樣的》，講完照常約會（不取消）',H.said[0].t==='我那天真的氣到不想再看到你。'&&r.counted===true&&t.status==='done'); }
  clr();
  const mem=G0=>{ const c={}, l=X().kxMemory(G0,c); return l&&X().subst(l,G0,c); };
  H.G.events.done={}; H.G.flags.E35_PLAN='sea'; check('3. 經歷過的事：E35 海邊（AA_425：只讀 E35_PLAN）＝「考完那個禮拜六你來高雄，我們去海邊。我真的帶了西瓜，結果沒人帶刀。」',mem(H.G)==='考完那個禮拜六你來高雄，我們去海邊。我真的帶了西瓜，結果沒人帶刀。');
  H.G.flags.E35_PLAN=null; H.G.flags.K7_GIFT='ticket'; H.G.flags.KX_ANNIV={1:'wheel'}; check('3. 只玩過法律系、K7 週年送了票根＝「週年那天你送的摩天輪票根的影本，我還放在桌上。」',mem(H.G)==='週年那天你送的摩天輪票根的影本，我還放在桌上。');
  H.G.flags.K7_GIFT=null; check('3. 都沒有＝只說「我們好不容易才走到現在欸。」；沒有 K10 兩校互考「你還欠我」那一列（AA_423 3-1）',mem(H.G)===null&&!JSON.stringify(MULTIREL_LINES.REPAIR.kexin).includes('還欠我'));
  H.G.events.done.ev_y0_e10=1; check('3. 經濟系版都沒有＝「我們一起休學、一起在你家那張桌子念書念了半年。」',mem(H.G)==='我們一起休學、一起在你家那張桌子念書念了半年。');
  setRom(KX,82); setT('2026-10-09',22.1); let d=due(); check('3. 隔天晚上她的戀愛 ≥ 80、沒說謊：她打來（5-5）',!!d&&d.k==='hug');
  clr(); H.picks=['因為我也喜歡上別人']; await play(d);
  check('3. 「你在哪？」「宿舍。」「我在你們宿舍樓下。下來。」→ 5-4 的選項 →（她突然抱住你。）「你不要以為我這樣就不生氣了。」……「你真的很煩。」＝KX_HUGGED',
    seq(['你在哪？','宿舍。','我在你們宿舍樓下。下來。','……至少你這次講了實話。','我還是很氣。','（她突然抱住你。）','你不要以為我這樣就不生氣了。','我知道。','可是我現在又不想讓你走。','……','你真的很煩。'])&&H.G.flags.KX_HUGGED===H.G.day,J(T()));
  clr(); await X().meetAction(H.G,KX,'out').run(GM);
  check('3. 還想和沛珊在一起＋抱過：結果 B 第一次「你是要我跟別人分你喔？」「你瘋了嗎？」（不給答案）',J(T())===J(['你是要我跟別人分你喔？','你瘋了嗎？']));
  check('3. 同一天不再提',!X().meetAction(H.G,KX,'out'));
  setRom(KX,90); setT('2026-10-12',12); clr(); await X().meetAction(H.G,KX,'out').run(GM);
  check('3. 之後再一次見面：接受（她的戀愛 ≥ 85、沒說謊）「我想了很久。我很不爽。」「可是我也不想因為不爽就把你丟掉。」「……我的條件是：她的事你要自己講，我問你的時候你不准騙我。」＝OPEN_OK',
    seq(['我想了很久。我很不爽。','可是我也不想因為不爽就把你丟掉。','……我的條件是：她的事你要自己講，我問你的時候你不准騙我。'])&&H.G.flags.OPEN_OK[KX][PS]===true);
  await kd('2026-10-05'); Object.assign(st(KX),{done:{self:1,back:1,n4:H.G.day-3,hug:H.G.day-2},b1:H.G.day-1}); setRom(KX,60); clr(); await X().meetAction(H.G,KX,'out').run(GM);
  check('3. 不接受、她的戀愛 < 70：「我做不到。我試著想過了，做不到。」→ 分手',J(T())===J(['我做不到。我試著想過了，做不到。'])&&!H.G.flags.dating_kexin);
  await kd('2026-10-05'); Object.assign(st(KX),{done:{self:1,back:1,n4:H.G.day-3}}); ROM.end(H.G,PS,'t'); clr(); await X().meetAction(H.G,KX,'out').run(GM);
  check('3. 結果 A（真的分了）：「你真的跟她分了？」「分了。」「……好。」「我不會每次約會都翻舊帳。可是你要是再一次，我就真的走了。」',J(T())===J(['你真的跟她分了？','分了。','……好。','我不會每次約會都翻舊帳。可是你要是再一次，我就真的走了。']));
  await kd('2026-10-05'); Object.assign(st(KX),{done:{self:1,back:1,n4:H.G.day-3}}); clr(); await X().meetAction(H.G,KX,'out').run(GM);
  check('3. 沒有抱過（5-5 沒發生）：結果 C「我們先這樣。我還沒想好。」',J(T())===J(['我們先這樣。我還沒想好。'])&&st(KX).phase==='distant');
  await kd('2026-10-05',{MOVED_OUT:true}); Object.assign(st(KX),{done:{self:1,back:1,n4:H.G.day}}); st(KX).hugAt=(H.G.day+1)*24+22; setRom(KX,85); setT('2026-10-06',22.1); clr(); H.picks=[0]; await play(due());
  check('3. 不住宿舍（AA_425）：「你在哪？」「在家。」「我在你家巷口。」',seq(['你在哪？','在家。','我在你家巷口。'])&&!H.has('宿舍。'));
  fresh('2026-09-10',12,'dorm',{dating_kexin:true,KX_MET_NOODLE_TEAM:true}); H.CLOSE(PS); ROM.start(H.G,PS); setT('2026-10-05',19); learn(KX,PS,'slip:zhe@x'); H.G.hour=21.6; H.picks=['誤會']; await play(due());
  setT('2026-10-07',17.1); await play(due()); PHONE.tick(H.G); setT('2026-10-08',12.1); X().phone(H.G,GM); PHONE.tick(H.G);
  check('3. 照片沒回：隔天 12:00「明天晚上，公館。你出來。」、再隔天 19:00 公館',msgs('p:'+KX).includes('明天晚上，公館。你出來。')&&!!OUT.get(H.G,'mrel_kexin_back_'+STORY.dayOfKey('2026-10-09')));
  setT('2026-10-09',19); clr(); await runOut('mrel_kexin_back_'+H.G.day);
  check('3. 說過「那是誤會」：3 天後見面先 5-2b「你上次跟我說是誤會。」「我去確認了。」「你還要講什麼？」……「我真的不知道你在想什麼。」再後半',seq(['你上次跟我說是誤會。','我去確認了。','你還要講什麼？','我真的不知道你在想什麼。','我真的很討厭你。']),J(T()));
  await kd('2026-10-05'); st(KX).n=2; st(KX).selfAt=(H.G.day+2)*24+17; setT('2026-10-07',17.1); clr(); await play(due());
  check('3. 第二次冷靜前半（AA_227 8-3）：「（木柵大學的貓又在機車坐墊上睡覺。）」……；她傳「你看」',seq(['（木柵大學的貓又在機車坐墊上睡覺。）','（她拍了，打開對話，打了「你看」。）','（這次她沒有刪。她把手機蓋在桌上，等了一整節課，才翻過來看你回了沒。）'])&&(PHONE.tick(H.G),msgs('p:'+KX).slice(-1)[0]==='你看'));
  PHONE.answer(H.G,'mrel_kx_photo_'+STORY.dayOfKey('2026-10-05'),0); X().phone(H.G,GM); H.G.hour=17.4; X().phone(H.G,GM); setT('2026-10-08',19); clr(); await runOut('mrel_kexin_back_'+H.G.day);
  check('3. 第二次後半（AA_425 2-7）：（她坐下以後，一直沒有看你。）接「我真的很討厭你。」；沒有「這次是真的。」',seq(['（她坐下以後，一直沒有看你。）','我真的很討厭你。'])&&!H.has('這次是真的。')&&!H.has('我上次說討厭你。'));
});

/* ---------------- 4. 子晴、芷若一個人 ---------------- */
await sec(4,async()=>{
  fresh('2026-10-01',12,'dorm',{dating_kexin:true}); H.CLOSE(ZQ); ROM.start(H.G,ZQ); setT('2026-10-20',20); learn(ZQ,KX); H.G.hour=22.1; await play(due()); clr();
  setT('2026-10-27',21.4); check('4. 子晴：7 天以前沒有',!due()); H.G.hour=21.6; await play(due()); PHONE.tick(H.G);
  check('4. 冷靜期過了：她傳「宵夜」「你請」、那天 22:00 公館的鹽酥雞攤',J(msgs('p:'+ZQ).slice(-2))===J(['宵夜','你請'])&&!!OUT.get(H.G,'mrel_heroine_04_talk_'+H.G.day)&&OUT.get(H.G,'mrel_heroine_04_talk_'+H.G.day).place==='公館的鹽酥雞攤');
  setT('2026-10-27',22); clr(); H.picks=['還是想跟她']; await runOut('mrel_heroine_04_talk_'+H.G.day);
  check('4. 子晴挽回（AA_425 開場）「你先點。」（她把菜單推給你，自己沒看。）「那天的事，我想過了。」→「我還是想跟她在一起。」→「……你很誠實欸。」「我要想。這次會想很久。」',
    seq(['你先點。','（她把菜單推給你，自己沒看。）','那天的事，我想過了。','……你很誠實欸。','我要想。這次會想很久。'])&&st(ZQ).intent==='both');
  setT('2026-11-01',15); check('4. 7 天內見面＝照常',!X().meetAction(H.G,ZQ,'talk'));
  setT('2026-11-04',15); setRom(ZQ,85); clr(); await X().meetAction(H.G,ZQ,'talk').run(GM);
  check('4. 子晴 B 接受（AA_425）：「好啦。我不走。」「……我討厭最後一個知道。」＝OPEN_OK',J(T())===J(['好啦。我不走。','……我討厭最後一個知道。'])&&H.G.flags.OPEN_OK[ZQ].kexin===true);
  const zr=async(fl)=>{ fresh('2026-10-01',12,'cafe',Object.assign({dating_kexin:true},fl||{})); H.CLOSE(ZQ); ROM.start(H.G,ZQ); setT('2026-10-20',20); learn(ZQ,KX); H.G.hour=22.1; await play(due()); clr(); };
  await zr(); Object.assign(st(ZQ),{phase:'talked',intent:'both',talkDay:H.G.day-8}); setRom(ZQ,40); await X().meetAction(H.G,ZQ,'talk').run(GM);
  check('4. 子晴 B 不接受：「不行啦。」「……我們先不要了。」→ 分手',J(T())===J(['不行啦。','……我們先不要了。'])&&!H.G.flags.dating_heroine_04);
  await zr(); Object.assign(st(ZQ),{phase:'talked',intent:'exclusive',talkDay:H.G.day}); ROM.end(H.G,KX,'t'); await X().meetAction(H.G,ZQ,'talk').run(GM);
  check('4. 子晴 A（AA_425）：「你真的講了？」祐廷「講了。」「……好啦。下禮拜你請。」',J(T())===J(['你真的講了？','講了。','……好啦。下禮拜你請。']));
  await zr(); Object.assign(st(ZQ),{phase:'talked',intent:'both',talkDay:H.G.day}); H.G.flags.YT_LIED={heroine_04:{kexin:true}}; await X().meetAction(H.G,ZQ,'talk').run(GM);
  check('4. 子晴 D：「分手啦。」（她把外套的帽子拉起來。）「……我先回去。」',J(T())===J(['分手啦。','（她把外套的帽子拉起來。）','……我先回去。']));
  await zr(); H.picks=['我不知道']; st(ZQ).msgAt=0; setT('2026-10-27',21.6); await play(due()); setT('2026-10-27',22); clr(); await runOut('mrel_heroine_04_talk_'+H.G.day);
  check('4. 子晴「我不知道。」→「那你想好再約我。」＝C（先這樣）',H.has('那你想好再約我。')&&st(ZQ).phase==='distant');
  check('4. 子晴 C 的那一句（AA_425）在資料裡：「先不要約。訊息照傳。」',J(MULTIREL_LINES.REPAIR.heroine_04.result.C)===J(['先不要約。訊息照傳。']));
  fresh('2026-10-01',12,'dorm',{dating_kexin:true}); H.CLOSE(ZQ); ROM.start(H.G,ZQ); setT('2026-10-20',20); learn(ZQ,KX); H.G.hour=22.1; await play(due()); st(ZQ).n=2; st(ZQ).selfAt=(H.G.day+3)*24+21; setT('2026-10-23',21.1); clr(); await play(due());
  check('4. 子晴第二次冷靜（AA_227 8-3）：吉他社辦……「……靠北，我又在想他。」（她把吉他收起來，傳給芷若：「欸，週三宵夜。妳不准說不。」）',seq(['（吉他社練完。她坐在社辦地上調弦，調了三次都不對。）','……靠北，我又在想他。','（她把吉他收起來，傳給芷若：「欸，週三宵夜。妳不准說不。」）']));
  fresh('2027-09-01',12,'dorm',{dating_kexin:true}); H.CLOSE(ZQ); ROM.start(H.G,ZQ); setT('2027-10-05',20); learn(ZQ,KX); H.G.hour=22.1; await play(due()); st(ZQ).n=2; st(ZQ).selfAt=(H.G.day+3)*24+21; setT('2027-10-08',21.1); clr(); await play(due());
  check('4. 芷若在英國（AA_425）：傳給芷若「（社辦的地板）」「欸。」',H.has('（她把吉他收起來，傳給芷若：「（社辦的地板）」「欸。」）'));
  /* 芷若 */
  fresh('2026-10-01',12,'cafe',{dating_kexin:true}); H.CLOSE(ZR); ROM.start(H.G,ZR); setT('2026-10-05',12); learn(ZR,KX); setT('2026-10-05',21.9); await play(due()); clr();
  check('4. 芷若：同一天不再演',!X().FLOW.heroine_02.meet(H.G,st(ZR),'cafe'));
  setT('2026-10-06',19.5); H.picks=['點完就走']; let r=await X().FLOW.heroine_02.meet(H.G,st(ZR),'cafe').run(GM);
  check('4. 冷靜期去 Café：「今天也是熱拿鐵？」（她沒有笑。）→「（點完就走）」＝照常點餐（left）、一天一次',seq(['今天也是熱拿鐵？','（她沒有笑。）'])&&r==='left'&&J(H.opts[0])===J(['等她下班','（點完就走）'])&&!X().FLOW.heroine_02.meet(H.G,st(ZR),'cafe'));
  setT('2026-10-07',19.5); clr(); H.picks=['等她下班','只跟妳']; r=await X().FLOW.heroine_02.meet(H.G,st(ZR),'cafe').run(GM);
  check('4. 「等她下班」＝留到打烊（AA_425 開場）：（打烊了，她沒有趕你。她把最後一張椅子倒扣好，在你對面坐下。）「……你要講什麼？」→「我想只跟妳在一起。」→「那你去跟她講。」',
    seq(['（打烊了，她沒有趕你。她把最後一張椅子倒扣好，在你對面坐下。）','……你要講什麼？','那你去跟她講。'])&&H.G.hour>=21.9&&H.G.flags.YT_PROMISED[ZR]==='exclusive'&&!H.has('講完，再來點一杯。'));
  ROM.end(H.G,KX,'t'); setT('2026-10-08',19.5); clr(); await X().FLOW.heroine_02.meet(H.G,st(ZR),'cafe').run(GM);
  check('4. 芷若 A（AA_425）：「你講了？」祐廷「講了。」（她把你常坐的那張椅子擦了一下。）',J(T())===J(['你講了？','講了。','（她把你常坐的那張椅子擦了一下。）']));
  fresh('2026-10-01',12,'cafe',{dating_kexin:true}); H.CLOSE(ZR); ROM.start(H.G,ZR); setT('2026-10-05',12); learn(ZR,KX); setT('2026-10-05',21.9); await play(due()); Object.assign(st(ZR),{phase:'talked',intent:'both',talkDay:H.G.day}); setRom(ZR,85);
  setT('2026-10-13',19.5); clr(); await X().FLOW.heroine_02.meet(H.G,st(ZR),'cafe').run(GM);
  check('4. 芷若 B 接受：（她做了一杯，推到你面前，沒有說話。）',J(T())===J(['（她做了一杯，推到你面前，沒有說話。）'])&&H.G.flags.OPEN_OK[ZR].kexin===true);
  check('4. 芷若 B 不接受／C／D（AA_425）在資料裡',J(MULTIREL_LINES.REPAIR.heroine_02.result.Bno)===J(['……沒辦法。',{n:'（她把你的杯子收走，洗了很久。）'}])&&J(MULTIREL_LINES.REPAIR.heroine_02.result.D)===J(['分開吧。',{n:'（她轉身去磨豆子。）'}]));
  /* 芷若在英國：每週的視訊 */
  fresh('2028-08-01',12,'campus',{dating_kexin:true}); H.CLOSE(ZR); ROM.start(H.G,ZR); setT('2028-09-10',12); learn(ZR,KX); H.G.hour=21.2;
  check('4. 芷若在英國、交往中（每週的視訊那幾個月）：不另外演視訊，等每週那一通',!due());
  clr(); let rr=await ZRUK.playW(H.G,GM,null);
  check('4. 每週的視訊那一通＝英國版的發現（不是那週的話題）',rr!=='orig'&&seq(['可昕的事，我知道了。','（她把手機立在書上，人往後退了一點，臉有一半在畫面外面。）','……多久了？','我今天先不要講了。……我先掛了。'])&&!!X().rec(H.G).disc[ZR].kexin);
  setT('2028-09-17',22); clr(); H.picks=['還是想跟她']; rr=await ZRUK.playW(H.G,GM,null);
  check('4. 下一週的視訊＝挽回（AA_425）：（視訊接通。她沒有先說話。）「……你要講什麼？」→「我還是想跟她在一起。」→「……嗯。」（她把手機立在書上。）「我要想。」',seq(['（視訊接通。她沒有先說話。）','……你要講什麼？','……嗯。','（她把手機立在書上。）','我要想。'])&&st(ZR).intent==='both');
  setT('2028-09-24',22); setRom(ZR,85); clr(); await ZRUK.playW(H.G,GM,null);
  check('4. 再下一週（7 天以後）＝結果，視訊的動作：（她把鏡頭轉向自己書桌上的明信片。）',J(T())===J(['（她把鏡頭轉向自己書桌上的明信片。）'])&&!T().some(t=>/杯|吧檯|椅子/.test(t)));
  setT('2028-10-01',22); rr=await ZRUK.playW(H.G,GM,null); check('4. 之後照常那週的話題',rr==='orig');
  fresh('2026-10-01',12,'cafe',{dating_kexin:true}); H.CLOSE(ZR); ROM.start(H.G,ZR); setT('2026-10-05',12); learn(ZR,KX); setT('2026-10-05',21.9); await play(due()); st(ZR).n=2; st(ZR).selfAt=(H.G.day+3)*24+22.5; setT('2026-10-08',22.6); clr(); await play(due());
  check('4. 芷若第二次冷靜（AA_227 8-3）',seq(['（Café 打烊。她把最後一張椅子倒扣在桌上。）','（她拿出這學期的票根，數了一下。有三張是兩個人的。）','（她把三張抽出來，夾進另一本書。沒有丟。）']));
});

/* ---------------- 5. 語彤 ---------------- */
await sec(5,async()=>{
  const yd=async()=>{ fresh('2026-10-01',12,'campus',{dating_kexin:true}); H.CLOSE(YT); ROM.start(H.G,YT); setT('2026-10-19',12); learn(YT,KX); setT('2026-10-20',18); H.G.zone='noodle'; await play(due()); clr(); };
  await yd(); check('5. 發現那天不再演第一段',!due());
  setT('2026-10-22',18); let d=due(); check('5. 之後第一次在她顧店的時候來麵店：第一段',!!d&&d.k==='talk1');
  H.picks=['我可以每天來']; await play(d);
  check('5. 第一段（原文）「有什麼要幫忙的嗎？」……「可是我也要想一下啊。」→「我可以每天來。」→「不要。」「你每天來，我就每天都要想你。」＝打擾',
    seq(['有什麼要幫忙的嗎？','沒有。','真的？','嗯。今天有人幫。','喔。','（你坐下。）','你不用一直來。','我想見妳。','我知道。','……','可是我也要想一下啊。','不要。','你每天來，我就每天都要想你。'])&&st(YT).disturb===true);
  setT('2026-10-25',15); H.G.zone='campus'; check('5. 14 天內又主動找她一次＝拉開距離（C）',!X().meetAction(H.G,YT,'talk')&&st(YT).distant===true);
  setT('2026-10-27',15); clr(); await X().meetAction(H.G,YT,'talk').run(GM);
  check('5. 兩次＝分手 D：「我想把時間留給自己。」「還有阿姨、我媽、我的報告。」「……你還是可以來吃麵。」',J(T())===J(['我想把時間留給自己。','還有阿姨、我媽、我的報告。','……你還是可以來吃麵。'])&&!H.G.flags.dating_heroine_03);
  await yd(); setT('2026-10-22',18); H.picks=['好。我等妳']; await play(due());
  check('5. 「好。我等妳。」→「嗯。」（她把一碗麵放在你面前。）「這碗我請。……吃完就回去。」',seq(['嗯。','（她把一碗麵放在你面前。）','這碗我請。……吃完就回去。']));
  setT('2026-10-29',12); X().tick(GM); const q=OUT.get(H.G,'mrel_heroine_03_talk2_'+H.G.day); check('5. 7 天沒有打擾：她找他，那天 21:00 總圖三樓外面的走廊',!!q&&q.h===21&&q.place==='總圖三樓外面的走廊');
  setT('2026-10-29',21); clr(); H.picks=['還想跟她']; await runOut(q.id);
  check('5. 第二段（原文）……→「我還想跟她在一起。我不想騙妳。」→「……謝謝你講。」「那我要想我可不可以。」（AA_425 刪最後一句）→ 她開口要求「我想講一件事。」「你來店裡，都在幫忙收碗。」「……我想要你來的時候，是來找我。」「收碗阿姨會。」',
    seq(['我本來想說，就不要在一起了。','嗯。','可是我還是會想找你。','我也是。','……我知道你喜歡我。','嗯。','可是有時候我真的不知道，你到底想怎麼辦。','……謝謝你講。','那我要想我可不可以。','我想講一件事。','你來店裡，都在幫忙收碗。','……我想要你來的時候，是來找我。','收碗阿姨會。'])&&!H.has('這次我會跟你說我要什麼。'),J(T()));
  setRom(YT,80); setT('2026-11-02',18); H.G.zone='noodle'; clr(); await X().meetAction(H.G,YT,'talk').run(GM);
  check('5. 結果 B（AA_425）：「我想過了。我想繼續。」（她把你的碗收走，又端了一碗新的回來。）＝OPEN_OK',J(T())===J(['我想過了。我想繼續。','（她把你的碗收走，又端了一碗新的回來。）'])&&H.G.flags.OPEN_OK[YT].kexin===true);
  await yd(); Object.assign(st(YT),{phase:'talked',intent:'exclusive',talkDay:H.G.day,asked:H.G.day}); ROM.end(H.G,KX,'t'); clr(); await X().meetAction(H.G,YT,'talk').run(GM);
  check('5. 結果 A：「你跟她分開了。」「嗯。」「……好。」「那下次你來，不用幫忙。」',J(T())===J(['你跟她分開了。','嗯。','……好。','那下次你來，不用幫忙。']));
  await yd(); setT('2026-10-22',18); H.picks=['好。我等妳']; await play(due()); setT('2026-10-29',21); X().tick(GM); clr(); H.picks=['我不知道']; await runOut('mrel_heroine_03_talk2_'+H.G.day);
  check('5. 第二段「我不知道。」→「那我先不等了。」（她沒有說分手。）「……我先不要一直想，你在想什麼。」＝C、沒有她開口要求',seq(['那我先不等了。','（她沒有說分手。）','……我先不要一直想，你在想什麼。'])&&!H.has('我想講一件事。')&&st(YT).phase==='distant');
});

/* ---------------- 6. 沛珊 ---------------- */
await sec(6,async()=>{
  const pd=async()=>{ fresh('2026-09-20',12,'campus',{dating_kexin:true}); H.CLOSE(PS); ROM.start(H.G,PS); setT('2026-10-20',12); learn(PS,KX); H.G.hour=13; await X().meet(GM,PS,'talk'); clr(); };
  await pd(); check('6. 發現後 3 天內見面＝照常',!X().meetAction(H.G,PS,'talk'));
  setT('2026-10-23',15); H.picks=['可以。我們可以慢慢談']; await X().meetAction(H.G,PS,'talk').run(GM);
  check('6. 《我們講清楚好不好》（原文）「所以你現在還想跟她在一起？」……「如果我也跟別人在一起，你可以嗎？」→ A「可以。我們可以慢慢談。」→「好啊。」「可是我還是會吃醋喔。」……「嗯。至少不要偷偷來。」',
    seq(['所以你現在還想跟她在一起？','對。','也想跟我繼續？','對。','好。','（她想了一會兒。）','那換我問你。','嗯？','如果我也跟別人在一起，你可以嗎？','好啊。','可是我還是會吃醋喔。','我可能也會。','那怎麼辦？','再講啊。','嗯。至少不要偷偷來。']));
  setT('2026-10-28',15); check('6. 談界線要隔 7 天',!X().meetAction(H.G,PS,'talk'));
  setT('2026-10-31',15); clr(); H.picks=['有人不舒服']; await X().meetAction(H.G,PS,'talk').run(GM);
  check('6. 第二次談界線（AA 補）「我想了幾件事。」……→「好。那我們先這樣。過一陣子再對一次。」＝PS_MUTUAL、OPEN_OK（B）',seq(['我想了幾件事。','誰跟誰在一起，要先講。不是之後才講。','我不想聽細節。可是我問的時候你要回答。','你呢？你有什麼想要的？','好。那我們先這樣。過一陣子再對一次。'])&&H.G.flags.PS_MUTUAL===H.G.day&&H.G.flags.OPEN_OK[PS].kexin===true);
  setT('2027-02-22',15); clr(); H.picks=['我想再談一次']; for(const f of STORY.PRE_TALK) await f(GM,{name:'沛珊',charId:PS},PS);
  check('6. 每學期第一週她提一次（AA_425 補選項）：「這學期還可以嗎？我們講好的那些。」→「我想再談一次。」→「好啊。這週找一天。」',seq(['這學期還可以嗎？我們講好的那些。','好啊。這週找一天。'])&&J(H.opts[0])===J(['「可以。」','「我想再談一次。」']));
  clr(); for(const f of STORY.PRE_TALK) await f(GM,{name:'沛珊',charId:PS},PS); check('6. 同一學期只一次',!H.has('這學期還可以嗎？我們講好的那些。'));
  await pd(); setT('2026-10-23',15); H.picks=['我不太能接受','對。不公平','只跟她在一起']; await X().meetAction(H.G,PS,'talk').run(GM);
  check('6. B「我不太能接受。」→「喔。」「可是我還是想跟妳在一起。」……「那這樣對我不太公平吧？」→「對。不公平。」→「……那你要怎麼辦？」',seq(['喔。','可是我還是想跟妳在一起。','……可是你自己也跟別人在一起啊。','我知道。','那這樣對我不太公平吧？','……那你要怎麼辦？']));
  setT('2026-10-26',15); clr(); H.picks=['「是。」']; await X().meetAction(H.G,PS,'talk').run(GM);
  check('6. 只跟她在一起＝結果 A：「我想了很久。我想只跟你。」「……你也是嗎？」→「是。」＝承諾 exclusive',seq(['我想了很久。我想只跟你。','……你也是嗎？'])&&H.G.flags.YT_PROMISED[PS]==='exclusive');
  await pd(); setT('2026-10-23',15); H.picks=['我不太能接受','對。不公平','還是想兩邊']; await X().meetAction(H.G,PS,'talk').run(GM);
  check('6. 還想兩邊＝「那我們可能想要的不一樣。」',H.has('那我們可能想要的不一樣。'));
  setT('2026-10-26',15); clr(); await X().meetAction(H.G,PS,'talk').run(GM);
  check('6. → D：「我們想要的好像不一樣。」「你不是壞人。我也不是。」「……就是不一樣。」',J(T())===J(['我們想要的好像不一樣。','你不是壞人。我也不是。','……就是不一樣。'])&&!H.G.flags.dating_classmate_peishan);
  await pd(); setT('2026-10-23',15); H.picks=['「我不知道。」']; await X().meetAction(H.G,PS,'talk').run(GM); setT('2026-10-26',15); clr(); const ac=X().meetAction(H.G,PS,'talk'); await ac.run(GM);
  check('6. C「我不知道。」→「嗯。」「其實我也不知道。」「那我們不要現在決定好了。」；之後一次「上次那件事我還在想喔。」（不中斷閒聊）',J(T())===J(['上次那件事我還在想喔。'])&&ac.abort===false);
  await pd(); setT('2026-12-25',21.2); H.G.flags.PS_KEPT=true;
  const p=STORY.presence(PS,H.G); const dd=due();
  check('6. 消失期（她在台中、交往中聯絡得到）：挽回演成電話（AA_425 第 1 節）',p.keep===true&&!!dd&&dd.bg==='phone_street_night',J(p)+J(dd));
  clr(); H.picks=['「我不知道。」']; await play(dd); check('6. 電話裡照樣是《我們講清楚好不好》',seq(['所以你現在還想跟她在一起？','如果我也跟別人在一起，你可以嗎？','其實我也不知道。']));
});

/* ---------------- 7. 子晴芷若一起分手以後 ---------------- */
await sec(7,async()=>{
  fresh('2026-10-01',12,'campus',{}); H.CLOSE(ZQ); H.CLOSE(ZR); ROM.start(H.G,ZQ); setT('2026-10-10',12); ROM.start(H.G,ZR); setT('2026-10-23',16.1); await play(due()); setT('2026-10-24',19.6); H.picks=[2]; await play(due()); clr();
  check('7. 攤牌以後：兩段都結束、ZQ_ZR_ENDED_DAY',H.G.flags.ZQ_ZR_ENDED_DAY===H.G.day&&!H.G.flags.dating_heroine_04&&!H.G.flags.dating_heroine_02);
  await DATE.menu(GM,ZQ,null); await DATE.menu(GM,ZR,null);
  check('7. 約她們正式校外約會（L3）＝婉拒：子晴「不要。」、芷若「……不了。」（不給理由）',J(T())===J(['不要。','……不了。']));
  check('7. 心意邀約不發',TERMEND.heartWhy(H.G,ZQ,{id:'Y2S1'})===false&&TERMEND.heartWhy(H.G,ZR,{id:'Y2S1'})===false);
  clr(); STORY._bindGM(GM); const n={name:'子晴',obj:null}; setT('2026-10-26',15); await STORY.talkCharacter(ZQ,n);
  check('7. 第一次在校園遇到子晴：「嗨。」（走過去）＝這次不聊',J(T())===J(['嗨。','（走過去）']));
  setT('2026-10-27',15); clr(); for(const f of STORY.PRE_TALK) await f(GM,{name:'子晴',charId:ZQ},ZQ);
  check('7. 之後閒聊各一句：子晴「芷若現在週三都等我。以前是我等她。」',H.has('芷若現在週三都等我。以前是我等她。'));
  clr(); for(const f of STORY.PRE_TALK) await f(GM,{name:'芷若',charId:ZR},ZR);
  check('7. 芷若「子晴說她要寫一個關於兩個朋友的遊戲。……我說不准用我的名字。」',H.has('子晴說她要寫一個關於兩個朋友的遊戲。……我說不准用我的名字。'));
  clr(); await STORY.talkCharacter(ZR,{name:'芷若',obj:null,staff:'cafe'}).catch(()=>{});
  check('7. 芷若在 Café 吧檯：「你要點什麼？」（照店員的口氣）',H.has('你要點什麼？'));
  check('7. 分手那一學期的下一個學期整個過完以前不能重新開始',!X().zzCanRestart(H.G,ZQ)&&(setT('2027-03-01',12),!X().zzCanRestart(H.G,ZQ)));
  setT('2027-09-15',15); H.FRIEND(ZQ); H.FRIEND(ZR);
  check('7. 大二上分手 → 大二下過完、大三上起：可以（子晴，FRIEND 以上）',X().zzCanRestart(H.G,ZQ)&&!X().zzRefusing(H.G,ZQ));
  clr(); for(const f of STORY.PRE_TALK) await f(GM,{name:'子晴',charId:ZQ},ZQ);
  check('7. 可以重新開始那天她先說：「我跟芷若講過了。她說隨便我。」「……可是我們先從吃宵夜開始。不是約會，是吃宵夜。」',seq(['我跟芷若講過了。她說隨便我。','……可是我們先從吃宵夜開始。不是約會，是吃宵夜。']));
  ROM.start(H.G,ZQ); check('7. 子晴先重新交往＝RESTART_WITH',H.G.flags.RESTART_WITH===ZQ);
  H.G.hour=15.5; clr(); await play(due());
  check('7. 她自己告訴芷若（祐廷不在場）：「欸，我跟妳講一件事。」「我最近又跟祐廷去吃了幾次宵夜。」……「有一點。……可是是妳的話，就好。」',seq(['欸，我跟妳講一件事。','我最近又跟祐廷去吃了幾次宵夜。','……我知道啊。妳上禮拜傳給我的照片，背景就是那家鹽酥雞。','妳自己決定就好。','妳真的不介意？','有一點。……可是是妳的話，就好。']));
  setRom(ZR,50); X().tick(GM); check('7. 另一位（芷若）：戀愛停在第 4 階以下、不接受 L3、沒有心意邀約',SOCIAL.rel(ZR).npcRom===29&&TERMEND.heartWhy(H.G,ZR,{id:'Y3S1'})===false&&(clr(),await DATE.menu(GM,ZR,null),H.has('……不了。')));
});

/* ---------------- 8. 作廢的 ---------------- */
await sec(8,async()=>{
  fresh('2026-12-01',12,'campus',{dating_kexin:true,PS_KEPT:true}); H.CLOSE(PS); ROM.start(H.G,PS); setT('2027-08-06',21.2);
  check('8. AA_423 6-3（8/6 21:00 沛珊打來）作廢：沒有這一通（放榜那天照 psresults3d.js）',!due()&&!JSON.stringify(MULTIREL_LINES).includes('這一年你傳的，我都有看。'));
  check('8. 沒和別人交往的「我考上了。」／班群「沛珊考上了！」不做（AA_282 第 2 節）',!JSON.stringify(MULTIREL_LINES).includes('考上了'));
});

H.done();
})();
