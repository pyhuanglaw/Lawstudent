// 多線交往第 4 輪（不需要瀏覽器）：src/multirel3d.js、src/data/multirel_lines.js、src/y34b3d.js（BCG-31 那一拍）
//   1 AA_429 第 1 節：學姊、子晴、芷若、語彤、可昕的坦白版（系統選項 → 下一次見面；曾說謊、未滿 7 天、國外視訊）＋挽回第一段她多的那一句
//   2 AA_429 第 2 節：可昕 E（冷靜期結束後第 28 天 21:30 她打來 → D；第 30 天她的照片）
//   3 AA_429 第 3 節：沛珊 E（D 以後 90 天、單身、第 5 階、不在消失期；去台南那次或電話；一學期一次）
//   4 AA_429 第 4 節：子晴第二次冷靜、2028-06 畢業以後（她租的套房，不傳給芷若）
//   5 AA_429 第 5 節：說溜嘴一個存檔只一次；二十三週年美國路線不演
//   6 AA_185 4-1（AA185-V6）：以安、語彤好好分開／不回答以後重新開始；心意邀約在那一場以前不發；重新交往清掉 EX
//   7 AA_185 4-2（AA185-V6）：戀愛 CG 照她知道的事情放
//   8 BCG-31：1B-18 送機兩個人的版本那一拍叫夏天版的 id（冬天版不放，AA_323）
// 修改前（開發分支 492ee8cec）：沒有 MULTIREL_LINES.CONF／KX_E／PS_E／REBUILD、MREL.confDue、MREL.cgBlocked——FAIL。用法：node tests/mrel_aa429_aa185_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
global.ZRUK={W_FROM:'2028-09-01',playW:async()=>'orig'};
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(MREL|MULTIREL_LINES|HV|HOMETOWN_LINES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
{ const adv=fs.readFileSync(path.join(H.ROOT,'src/adv3d.js'),'utf8'), m=/^const CG_REGISTRY=(\{.*\});/m.exec(adv); if(m) global.CG_REGISTRY=vm.runInThisContext('('+m[1]+')'); }   /* 戀愛 CG 看 CG_REGISTRY 的檔案路徑 */
let ok=true, err=''; try{ load('src/data/hometown_lines.js'); load('src/hometown3d.js'); load('src/data/multirel_lines.js'); load('src/multirel3d.js'); }catch(e){ ok=false; err=String(e&&e.stack||e); }
const X=()=>typeof MREL!=='undefined'?MREL:null, Lm=()=>MULTIREL_LINES;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); } };
const A1='heroine_01', ZR='heroine_02', YT='heroine_03', ZQ='heroine_04', SIS='heroine_05', PS='classmate_peishan', KX='kexin';
const setD=(d,h)=>{ H.G.day=d; H.G.hour=h; H.G.weekday=CALENDAR.dateOf(d).wd%7; };
const setT=(key,h)=>setD(STORY.dayOfKey(key),h);
const T=()=>H.said.map(s=>s.t);
const seq=arr=>{ const t=T(); let i=0; for(const a of arr){ const k=t.indexOf(a,i); if(k<0) return false; i=k+1; } return true; };
const clr=()=>{ H.said=[]; H.opts=[]; };
const fresh=(key,h,zone,fl)=>{ H.fresh(key,h,zone||'campus',Object.assign({},fl||{})); if(X()) X()._gm=GM; return H.G; };
const play=async a=>{ if(a) await X().play(GM,a); return a; };
const due=()=>X().dueAuto(H.G);
const opts=id=>STORY.TALK_OPTS.flatMap(f=>f(H.G,id)||[]);
const date2=(x,y,since)=>{ H.CLOSE(x); ROM.start(H.G,x); if(y===KX) H.G.flags.dating_kexin=true; else { H.CLOSE(y); ROM.start(H.G,y); } if(since!=null) ROM.get(H.G,y).sinceDay=since; };
const decide=async(x)=>{ const o=opts(x).find(q=>/^（下次見面，自己跟她講/.test(q.t)); if(o) await o.run(GM); return o; };

(async()=>{
check('0. 檔案載得到、這一輪的東西都在',ok&&!!X()&&!!(Lm()&&Lm().CONF&&Lm().KX_E&&Lm().PS_E&&Lm().REBUILD)&&!!X().confDue&&!!X().cgBlocked,err);
if(!X()||!X().confDue){ H.done(); return; }

/* ---------------- 1. 坦白版五位 ---------------- */
await sec(1,async()=>{
  /* 學姊 */
  fresh('2027-04-07',15,'campus'); date2(SIS,KX,H.G.day-60);
  const o=await decide(SIS);
  check('1. 學姊：和她說話的選單多一個系統選項「（下次見面，自己跟她講可昕的事）」',!!o&&o.t==='（下次見面，自己跟她講可昕的事）'&&X().rec(H.G).cpend[SIS].y===KX,o&&o.t);
  check('1. 當天不演（下一次見面）',!due()||due().k!=='conf');
  setD(H.G.day+1,21.6); let a=due(); check('1. 隔天 21:30 以後：法圖外面的長椅',a&&a.k==='conf'&&a.x===SIS&&a.cap==='法圖外面的長椅');
  clr(); await play(a);
  check('1. 學姊原文：「我有件事要跟妳講。」「我跟可昕也在一起。兩個月了。」（她把保溫瓶的蓋子轉緊，放在旁邊。）「……你講完了？」「嗯。」「我現在有點生氣。」「你講得很清楚。我也要想清楚再回你。」「明天再講。」',
    J(T())===J(['我有件事要跟妳講。','我跟可昕也在一起。兩個月了。','（她把保溫瓶的蓋子轉緊，放在旁邊。）','……你講完了？','嗯。','我現在有點生氣。','你講得很清楚。我也要想清楚再回你。','明天再講。']),J(T()));
  check('1. 坦白：她知道（yt_told）、YT_CONFESSED、進冷靜期（confessed）',ROM.knowsOf(H.G,SIS,KX)&&!!H.G.flags.YT_CONFESSED[SIS][KX]&&X().st(H.G,SIS).confessed===true&&!X().rec(H.G).cpend[SIS]);
  fresh('2027-04-07',15); date2(SIS,KX,H.G.day-3); H.G.flags.YT_LIED={[SIS]:{kexin:true}}; await decide(SIS); setD(H.G.day+1,21.6); clr(); await play(due());
  check('1. 學姊：未滿 7 天「這禮拜開始的。」；曾說謊＝第一句前「我問過你的。」',seq(['我跟可昕也在一起。這禮拜開始的。','我問過你的。','……你講完了？']));
  fresh('2028-09-05',15); date2(SIS,KX,STORY.dayOfKey('2028-05-01')); X().confLater(H.G,SIS,KX); setD(H.G.day+1,21.5);
  a=due(); check('1. 學姊在美國、祐廷在台灣＝視訊',a&&a.k==='conf_remote'&&a.bg==='video');
  clr(); await play(a); check('1. 視訊：最後一句「我先掛了。明天再講。」＋（視訊斷了。）',seq(['我現在有點生氣。','我先掛了。明天再講。','（視訊斷了。）'])&&!H.has('明天再講。'));
  /* AA_436 第 3 節第 3 點：祐廷在國外，子晴、語彤、可昕（學姊也一樣）坦白演成視訊；她那邊晚上 21:00～23:00（日本＋1、印第安納 −12／−13）*/
  const JPF={EXCHANGE_ROUTE:'JP',EXCH_RULE:1,JP_DEPARTED:STORY.dayOfKey('2028-03-25'),X1_JP:STORY.dayOfKey('2028-02-20')};
  fresh('2028-05-10',21.5,'campus',JPF); date2(ZQ,KX,H.G.day-40); check('1. 祐廷在日本（STORY.abroad）',X().heAbroad(H.G));
  check('1. 日本 21:30＝台灣 20:30，還不到她那邊的晚上',!X().confAskDue(H.G));
  setD(H.G.day,22.2); a=due(); check('1. 日本 22:00 起（台灣 21:00）：問一次「（打視訊給她，自己跟她講可昕的事）」',a&&a.k==='conf_ask'&&a.x===ZQ);
  clr(); H.picks=[0]; await play(a);
  check('1. 子晴視訊版：（視訊。她那邊是晚上，背後的螢幕還開著。）…「……嗯。是應該。」「……我先掛了。」（視訊斷了。）',J(H.opts[0])===J(['（打視訊給她，自己跟她講可昕的事）','（先不說）'])
    &&seq(['我有件事要跟妳講。','我跟可昕也在一起。一個多月了。','（視訊。她那邊是晚上，背後的螢幕還開著。）','……喔。','你幹嘛跟我講。','……嗯。是應該。','……我先掛了。','（視訊斷了。）'])&&!H.has('（鞦韆停了。）')&&!H.has('我回去了。不要送我。')&&X().st(H.G,ZQ).confessRemote===true,J(T()));
  fresh('2028-05-10',22.2,'campus',JPF); date2(YT,KX,H.G.day-40); a=due(); clr(); H.picks=[1]; await play(a);
  check('1. （先不說）＝這一趟不再問（語彤；可昕那一對另外問）',a&&a.k==='conf_ask'&&a.x===YT&&!X().rec(H.G).cpend[YT]&&(X().confAskDue(H.G)||{}).x!==YT);
  fresh('2028-05-10',22.2,'campus',JPF); date2(YT,KX,H.G.day-40); clr(); H.picks=[0]; await play(due());
  check('1. 語彤視訊版：「等妳下班，可以視訊嗎？」（視訊。她在麵店後面，聽得到阿姨在洗碗。）…「明天要早起備料。……我先掛了。」',J(T())===J(['等妳下班，可以視訊嗎？','（視訊。她在麵店後面，聽得到阿姨在洗碗。）','我跟可昕也在一起。一個多月了。','……嗯。','你自己講的。','好。我知道了。','明天要早起備料。……我先掛了。','（視訊斷了。）']),J(T()));
  fresh('2028-05-10',22.2,'campus',Object.assign({dating_kexin:true},JPF)); H.CLOSE(A1); ROM.start(H.G,A1); clr(); H.picks=[0]; await play(due());
  check('1. 可昕視訊版：（她把鏡頭轉開。畫面裡只剩天花板，很久。）…「……我現在不想看到你。我掛了。」',seq(['……你再講一次。','我跟以安也在一起。','操。','（她把鏡頭轉開。畫面裡只剩天花板，很久。）','你還知道要自己講。','……我現在不想看到你。我掛了。'])&&!H.has('（她轉過去，背對你站了很久。）'),J(T()));
  fresh('2028-10-10',8.4,'campus',{EXCHANGE_ROUTE:'US',EXCH_RULE:1}); date2(ZQ,KX,H.G.day-40); check('1. 印第安納（台灣 −12）早上 08:24＝台灣 20:24，還不到',!X().confAskDue(H.G));
  setD(H.G.day,9.1); check('1. 09:00 起（台灣 21:00）',(due()||{}).k==='conf_ask');
  fresh('2027-04-07',15); date2(ZQ,KX); X().confLater(H.G,ZQ,KX); const ab=X().heAbroad; X().heAbroad=()=>true; const tz=STORY.tzOffset; STORY.tzOffset=()=>1; setD(H.G.day+1,22.3); a=due(); X().heAbroad=ab; STORY.tzOffset=tz;
  check('1. 出國前在說話的選單決定、還沒演就出國了＝也演成視訊',a&&a.k==='conf_remote'&&a.bg==='video');

  /* 子晴 */
  fresh('2027-04-07',15); date2(ZQ,KX,H.G.day-40); await decide(ZQ); setD(H.G.day+1,22.2); a=due();
  check('1. 子晴：隔天 22:00 以後溫州街小公園的鞦韆',a&&a.k==='conf'&&a.bg==='wenzhou'&&a.cap==='溫州街小公園的鞦韆');
  clr(); await play(a);
  check('1. 子晴原文：（鞦韆停了。）「……喔。」「你幹嘛跟我講。」「我覺得妳應該知道。」「……嗯。是應該。」「我回去了。不要送我。」',seq(['我有件事要跟妳講。','我跟可昕也在一起。一個多月了。','（鞦韆停了。）','……喔。','你幹嘛跟我講。','我覺得妳應該知道。','……嗯。是應該。','我回去了。不要送我。']),J(T()));
  fresh('2028-07-10',15); date2(ZQ,KX,H.G.day-40); H.G.flags.YT_LIED={[ZQ]:{kexin:true}}; X().confLater(H.G,ZQ,KX); setD(H.G.day+1,22.2); a=due();
  clr(); await play(a); check('1. 子晴畢業以後：公館的宵夜攤、（她把筷子放下。）；曾說謊「我問過你欸。」',a.cap==='公館的宵夜攤'&&seq(['（她把筷子放下。）','我問過你欸。','……喔。'])&&!H.has('（鞦韆停了。）'));
  fresh('2027-04-07',15); date2(ZQ,ZR); check('1. 子晴、芷若兩個都在交往＝沒有這個選項（《星期五下午》那一場）',!X().confLaterFor(H.G,ZQ)&&!X().confLaterFor(H.G,ZR));

  /* 芷若 */
  fresh('2027-04-07',15); date2(ZR,KX,H.G.day-40); await decide(ZR);
  const ce=X().zrShiftEnd; X().zrShiftEnd=()=>22; H.G.zone='cafe'; setD(H.G.day+1,21.9); a=due();
  check('1. 芷若：她上班的晚上留到打烊',a&&a.k==='conf'&&a.x===ZR&&a.blur);
  clr(); await play(a); X().zrShiftEnd=ce;
  check('1. 芷若原文：（Café 打烊。她在擦吧檯。）兩句（她手上的抹布停住了。）「……嗯。」（她把抹布折好，放在吧檯角落。）「你先坐一下。我把剩下的收完。」（她收完，在你對面坐下來。很久沒有說話。）「我今天腦袋很亂。……你先回去好不好。」',
    J(T())===J(['（Café 打烊。她在擦吧檯。）','我有件事要跟妳講。','我跟可昕也在一起。一個多月了。','（她手上的抹布停住了。）','……嗯。','（她把抹布折好，放在吧檯角落。）','你先坐一下。我把剩下的收完。','（她收完，在你對面坐下來。很久沒有說話。）','我今天腦袋很亂。……你先回去好不好。']),J(T()));
  fresh('2028-10-01',15); date2(ZR,KX,H.G.day-40); X().confLater(H.G,ZR,KX); H.G.flags.YT_LIED={[ZR]:{kexin:true}};
  clr(); const r=await ZRUK.playW(H.G,GM);
  check('1. 芷若在英國＝每週的視訊裡（AA_436 第 3 節第 1 點整段）：（視訊。她那邊是下午，背後是宿舍的窗。）兩句（她低頭，很久沒有說話。）「……我問過你。」「我今天腦袋很亂。……我先掛了。」；Café 三行旁白沒有',
    r!=='orig'&&J(T())===J(['（視訊。她那邊是下午，背後是宿舍的窗。）','我有件事要跟妳講。','我跟可昕也在一起。一個多月了。','（她低頭，很久沒有說話。）','……我問過你。','我今天腦袋很亂。……我先掛了。']),J(T()));
  fresh('2028-10-01',15); date2(ZR,KX,H.G.day-40); clr(); H.picks=[0]; const r2=await ZRUK.playW(H.G,GM);
  check('1. 芷若在英國、還沒決定：每週的視訊開頭問一次 →（打視訊給她…）＝坦白（「……嗯。」）',r2!=='orig'&&J(H.opts[0])===J(['（打視訊給她，自己跟她講可昕的事）','（先不說）'])&&seq(['（視訊。她那邊是下午，背後是宿舍的窗。）','……嗯。','我今天腦袋很亂。……我先掛了。']));
  fresh('2028-10-01',15); date2(ZR,KX,H.G.day-40); clr(); H.picks=[1]; const r3=await ZRUK.playW(H.G,GM);
  check('1. （先不說）＝照常演那一週的話題',r3==='orig'&&!H.G.flags.YT_CONFESSED[ZR]);

  /* 語彤 */
  fresh('2027-04-06',15); date2(YT,KX,H.G.day-40); await decide(YT);
  const ys=X().ytShift; X().ytShift=()=>true; H.G.zone='noodle'; setD(H.G.day+2,19); a=due();
  check('1. 語彤：她顧店的晚上人在麵店',a&&a.k==='conf'&&a.x===YT);
  clr(); await play(a); X().ytShift=ys;
  check('1. 語彤原文：「等妳下班，可以講一下嗎？」（打烊。她把最後一張椅子推回桌子下面。）「我跟可昕也在一起。……」「……嗯。」「你自己講的。」「好。我知道了。」「明天要早起備料。你先回去。」；時間到 21:00',
    J(T())===J(['等妳下班，可以講一下嗎？','（打烊。她把最後一張椅子推回桌子下面。）','我跟可昕也在一起。一個多月了。','……嗯。','你自己講的。','好。我知道了。','明天要早起備料。你先回去。'])&&H.G.hour>=21&&!H.has('我有件事要跟妳講。'),J(T()));

  /* 可昕 */
  fresh('2027-04-07',12,'campus',{dating_kexin:true}); H.CLOSE(KX); H.CLOSE(A1); ROM.start(H.G,A1); await decide(KX);
  OUT.plan(H.G,{id:'kx_od_x',ev:'ev_kexin_our_day_wk',day:H.G.day+2,h:14,place:'木柵大學',title:'我們的日子'});
  setD(H.G.day+2,13.6); a=due(); check('1. 可昕：下一次她來（我們的日子，出遊前 30 分鐘起）',a&&a.k==='conf'&&a.x===KX);
  clr(); await play(a);
  check('1. 可昕原文：「……你再講一次。」「我跟以安也在一起。」「操。」（她轉過去，背對你站了很久。）「你還知道要自己講。」「……我現在不想看到你。你不要跟過來。」；那一趟取消',
    seq(['我有件事要跟妳講。','……你再講一次。','我跟以安也在一起。','操。','（她轉過去，背對你站了很久。）','你還知道要自己講。','……我現在不想看到你。你不要跟過來。'])&&OUT.get(H.G,'kx_od_x').state==='skipped',J(T()));
  fresh('2027-04-07',12,'campus',{dating_kexin:true}); H.CLOSE(A1); ROM.start(H.G,A1); X().confLater(H.G,KX,A1); H.G.flags.YT_LIED={kexin:{[A1]:true}};
  const m=X().meetAction(H.G,KX,'date'); clr(); await m.run(GM);
  check('1. 可昕：正式約會那天講也可以（disc＝這一趟不去）；曾說謊「我上次問你，你說沒有。」',m.disc===true&&seq(['我上次問你，你說沒有。','我跟以安也在一起。'])&&!H.has('……你再講一次。'));
  fresh('2029-07-01',15,'campus',{dating_kexin:true}); H.CLOSE(A1); ROM.start(H.G,A1); X().confLater(H.G,KX,A1); setD(H.G.day+1,21.6);
  a=due(); check('1. 2029-06-28 退宿以後：隔天 21:30 家巷口',a&&a.k==='conf'&&(a.cap==='家巷口'||a.cap==='宿舍樓下'));

  /* 挽回第一段多的那一句 */
  const ctxC=(x,y)=>{ const c=X().ctx(H.G,x,y); return c; };
  fresh('2027-04-07',15); date2(SIS,KX); H.G.flags.YT_CONFESSED={[SIS]:{kexin:1}}; clr(); H.picks=[2]; await X().run(GM,SIS,Lm().REPAIR.heroine_05.dinner,ctxC(SIS,KX));
  check('1. 學姊挽回後半多一句「那天你講的時候，一直看著我。……所以我今天來了。」',T()[0]==='那天你講的時候，一直看著我。……所以我今天來了。');
  fresh('2027-04-07',15); date2(ZQ,KX); H.G.flags.YT_CONFESSED={[ZQ]:{kexin:1}}; clr(); H.picks=[2]; await X().run(GM,ZQ,Lm().REPAIR.heroine_04.talk,ctxC(ZQ,KX));
  check('1. 子晴挽回第一段多一句「我有在想。……那天回去，我一直沒睡。」',seq(['你先點。','我有在想。……那天回去，我一直沒睡。','那天的事，我想過了。']));
  fresh('2027-04-07',15); date2(ZR,KX); H.G.flags.YT_CONFESSED={[ZR]:{kexin:1}}; X().startStrain(H.G,ZR,KX,{confessed:true,confessRemote:false}); clr(); H.picks=[2]; await X().run(GM,ZR,Lm().REPAIR.heroine_02.talk,ctxC(ZR,KX));
  check('1. 芷若挽回第一段多一句「那天你一直坐在那裡，等我收完。」',seq(['那天你一直坐在那裡，等我收完。','……你要講什麼？']));
  X().st(H.G,ZR).confessRemote=true; clr(); H.picks=[2]; await X().run(GM,ZR,Lm().REPAIR.heroine_02.talk,ctxC(ZR,KX));
  check('1. 芷若：坦白是在英國的視訊＝換成「那天你沒有掛，等我先掛。」（AA_436）',!H.has('那天你一直坐在那裡，等我收完。')&&seq(['那天你沒有掛，等我先掛。','……你要講什麼？']));
  clr(); H.picks=[2]; await X().run(GM,ZR,Lm().REPAIR.heroine_02.talkUk,ctxC(ZR,KX)); check('1. 英國的挽回（每週的視訊）也是那一句',seq(['（視訊接通。她沒有先說話。）','那天你沒有掛，等我先掛。','……你要講什麼？']));
  fresh('2027-04-07',15); date2(YT,KX); H.G.flags.YT_CONFESSED={[YT]:{kexin:1}}; clr(); H.picks=[0]; await X().run(GM,YT,Lm().REPAIR.heroine_03.talk1,ctxC(YT,KX));
  check('1. 語彤挽回第一段多一句「阿姨後來問我，你那天怎麼那麼晚才走。」',seq(['（你坐下。）','阿姨後來問我，你那天怎麼那麼晚才走。','你不用一直來。']));
  fresh('2027-04-07',15,'campus',{dating_kexin:true}); H.CLOSE(A1); ROM.start(H.G,A1); H.G.flags.YT_CONFESSED={kexin:{[A1]:1}}; clr(); await X().run(GM,KX,Lm().REPAIR.kexin.back,ctxC(KX,A1));
  check('1. 可昕《本來想傳給你》後半第一句前多兩句「我氣到現在。」「……可是是你自己講的。這個我有算進去。」',seq(['我氣到現在。','……可是是你自己講的。這個我有算進去。','我真的很討厭你。']));
  fresh('2027-04-07',15,'campus',{dating_kexin:true}); H.CLOSE(A1); ROM.start(H.G,A1); clr(); await X().run(GM,KX,Lm().REPAIR.kexin.back,ctxC(KX,A1));
  check('1. 沒坦白過＝沒有那兩句',!H.has('我氣到現在。')&&H.has('我真的很討厭你。'));
});

/* ---------------- 2. 可昕 E ---------------- */
await sec(2,async()=>{
  fresh('2027-04-07',15,'campus',{dating_kexin:true}); H.CLOSE(A1); ROM.start(H.G,A1); ROM.get(H.G,A1).sinceDay=H.G.day-60;
  const st=X().startStrain(H.G,KX,A1,{ver:'base'}); st.done={self:H.G.day}; st.selfAt=0;
  setD(H.G.day+27,21.6); check('2. 第 27 天還沒',!X().kxEDue(H.G,st));
  setD(H.G.day+1,21.6); const a=X().FLOW.kexin.tick(H.G,st);
  check('2. 冷靜期結束（她傳照片那天）後第 28 天 21:30，沒有挽回的任何一步＝她打來',a&&a.k==='kx_e'&&a.cap==='電話');
  clr(); H.picks=[1]; await play(Object.assign({x:KX},a));
  check('2. 「你都沒有打來。」「……我等了一個月。」→「我不知道要怎麼講。」→「一個月了，你還不知道。」「那我們就這樣吧。」「我掛了。」＝照 D 分開',
    J(T())===J(['你都沒有打來。','……我等了一個月。','一個月了，你還不知道。','那我們就這樣吧。','我掛了。'])&&!H.G.flags.dating_kexin&&st.result==='E');
  const d0=H.G.day; setD(d0+30,21.2); PHONE.tick(H.G);
  check('2. 電話後第 30 天：（可昕發了一張照片：木柵大學後山的步道，傍晚。沒有寫字。）',(H.G.msgs||[]).some(m=>m.th==='p:kexin'&&m.text==='（可昕發了一張照片：木柵大學後山的步道，傍晚。沒有寫字。）'));
  fresh('2027-04-07',15,'campus',{dating_kexin:true}); H.CLOSE(A1); ROM.start(H.G,A1); const s2=X().startStrain(H.G,KX,A1,{ver:'base'}); s2.done={self:H.G.day}; H.G.flags.MREL_KX_REPLY='yes'; setD(H.G.day+28,21.6);
  check('2. 回了她的照片（做了一步）＝不打',!X().kxEDue(H.G,s2));
  fresh('2027-04-07',15,'campus',{dating_kexin:true}); H.CLOSE(A1); ROM.start(H.G,A1); const s3=X().startStrain(H.G,KX,A1,{ver:'base'}); s3.done={self:H.G.day}; H.picks=[2]; setD(H.G.day+28,21.6); clr(); await X().kxE(GM,s3);
  check('2. （不說話）→（電話那頭安靜了很久。）',H.has('（電話那頭安靜了很久。）'));
});

/* ---------------- 3. 沛珊 E ---------------- */
await sec(3,async()=>{
  const q={id:'hv_t',hv:{id:PS,key:'classmate_peishan@台南',keep:false},ev:'ev_hv_ps_tn'};
  const setup=wk=>{ fresh('2027-08-20',12,'campus',{PS_RECONNECT:true}); setD(STORY.termDay('Y3S1',wk,3),10); H.CLOSE(PS); Object.assign(SOCIAL.rel(PS),{npcRom:40,fam:50,trust:30});
    const st=X().startStrain(H.G,PS,KX,{ver:'base'}); st.result='D'; st.phase='ended'; st.endedDay=STORY.dayOfKey('2027-09-01')-100; H.G.events=H.G.events||{}; return st; };
  let st=setup(5); check('3. D 以後 90 天、單身、第 5 階、不在消失期（消失期以前分的：她回來以後）＝要演',X().psEDue(H.G));
  clr(); H.picks=[0,0]; const r=await X().hvMeet(GM,PS,q,'first');
  check('3. 去台南那一次：「我們上次講到哪裡？」→「講到我們想要的不一樣。」→「嗯。」「……我後來想了很多。我想要的，可能沒有那麼不一樣。」「我不想假裝之前沒發生過。」「可是我想再試一次。你呢？」→「我也想。」→「……好。」（她走得比剛剛慢一點。）＝重新交往',
    r==='restart'&&J(T())===J(['我們上次講到哪裡？','嗯。','……我後來想了很多。我想要的，可能沒有那麼不一樣。','我不想假裝之前沒發生過。','可是我想再試一次。你呢？','……好。','（她走得比剛剛慢一點。）'])&&H.G.flags.dating_classmate_peishan===true,J(T()));
  st=setup(5); clr(); H.picks=[2]; await X().hvMeet(GM,PS,q,'first');
  check('3. 「先不要講那個。」→「好啊。」「那今天就只吃飯。」＝這次結束；這學期不再',seq(['好啊。','那今天就只吃飯。'])&&!H.has('我不想假裝之前沒發生過。')&&!X().psEDue(H.G));
  setD(STORY.termDay('Y3S2',3,3),10); check('3. 下一學期還會有',X().psEDue(H.G));
  st=setup(5); clr(); H.picks=[1,1]; await X().hvMeet(GM,PS,q,'first');
  check('3. 「我不記得了。」→「騙人。」（她笑了一下。）「……那我們從頭講。」…「我還沒想好。」→「好。那我們先當朋友，像之前那樣。」',seq(['騙人。','（她笑了一下。）','……那我們從頭講。','我不想假裝之前沒發生過。','好。那我們先當朋友，像之前那樣。'])&&!H.G.flags.dating_classmate_peishan);
  st=setup(5); H.CLOSE(A1); ROM.start(H.G,A1); check('3. 祐廷有交往對象＝不演',!X().psEDue(H.G));
  st=setup(5); st.endedDay=H.G.day-80; check('3. 不到 90 天＝不演',!X().psEDue(H.G));
  st=setup(5); SOCIAL.rel(PS).npcRom=10; check('3. 她不到第 5 階＝不演',!X().psEDue(H.G));
  st=setup(13); setD(H.G.day,23.4); const a=due(); check('3. 那學期沒去（第 13 週）：她 23:00 以後打來',a&&a.k==='ps_e_phone'&&a.cap==='電話');
  st=setup(5); setT('2027-03-01',12); check('3. 消失期裡＝不演',!X().psEDue(H.G));
});

/* ---------------- 4. 子晴第二次冷靜、畢業以後 ---------------- */
await sec(4,async()=>{
  fresh('2028-07-10',12); date2(ZQ,KX); const st=X().startStrain(H.G,ZQ,KX,{ver:'base'}); st.n=2; st.selfAt=0; st.phase='cool';
  const a=X().FLOW.heroine_04.tick(H.G,st); check('4. 2028-06 畢業以後：她租的套房',a&&a.k==='self'&&a.cap==='她租的套房');
  clr(); const n0=(H.G.msgs||[]).length; await play(Object.assign({x:ZQ},a));
  check('4. （她租的套房。下班回來已經十一點多。她坐在床邊調自己的吉他，調了三次都不對。）「……靠北，我又在想他。」（她把吉他靠回牆邊，……買了一杯熱的。）；不傳給芷若',
    J(T())===J(['（她租的套房。下班回來已經十一點多。她坐在床邊調自己的吉他，調了三次都不對。）','……靠北，我又在想他。','（她把吉他靠回牆邊，打開筆電，把明天要交的那一關又跑了一次。跑到一半，她下樓去便利商店買了一杯熱的。）'])&&(H.G.msgs||[]).length===n0&&!T().some(t=>/芷若/.test(t)));
});

/* ---------------- 5. 說溜嘴 ---------------- */
await sec(5,async()=>{
  fresh('2027-03-25',19,'noodle',{dating_kexin:true,KX_MET_NOODLE_TEAM:true}); H.CLOSE(A1); ROM.start(H.G,A1); ROM.learn(H.G,'zhe',A1,'test'); H.CLOSE(YT); ROM.start(H.G,YT); ROM.learn(H.G,'zhe',YT,'test');
  await X().afterEvent(GM,{id:'ev_kexin_two_circles',participants:[]});
  check('5. K12 演了一次',!!X().rec(H.G).once.slip);
  check('5. 之後的群聚（二十三週年）不再演（一個存檔只一次）',!X().slipFor(H.G,{id:'ev_noodle_23rd',participants:['heroine_03']}));
  fresh('2028-12-14',19,'noodle',{dating_kexin:true,KX_MET_NOODLE_TEAM:true,ANNIV23:'remote'}); H.CLOSE(A1); ROM.start(H.G,A1); ROM.learn(H.G,'zhe',A1,'test');
  check('5. 二十三週年：美國路線（ANNIV23 remote）不演',!X().slipFor(H.G,{id:'ev_noodle_23rd',participants:['heroine_03']}));
});

/* ---------------- 6. AA_185 4-1 ---------------- */
await sec(6,async()=>{
  const plgFrom=d=>{ for(let x=d;x<d+200;x++) if(X().plgOn(H.G,x)) return x; return null; };
  /* 以安好好分開 */
  fresh('2026-09-20',12); H.CLOSE(A1); ROM.start(H.G,A1); ROM.end(H.G,A1,'apart_talk'); const bd=H.G.day;
  check('6. 以安好好分開以後：心意邀約先不發（祐廷先開口那一場以前）',X().rebuildBlock(H.G,A1)&&TERMEND.heartWhy(H.G,A1,{})===false);
  let d=plgFrom(bd+60); setD(d,21.7); H.G.zone='wancai'; check('6. 不到一學期（16 週）＝不演',!X().anRbDue(H.G));
  d=plgFrom(bd+113); setD(d,21.7); H.G.zone='wancai'; SOCIAL.rel(A1).npcRom=10; check('6. 第 5 階以下＝不演',!X().anRbDue(H.G));
  Object.assign(SOCIAL.rel(A1),{npcRom:35,fam:50,trust:30});
  let a=due(); check('6. 一學期以後的讀書會散會（21:30 人在萬才館）＝祐廷先開口的選項',a&&a.k==='an_rb_open');
  clr(); H.picks=[0]; await play(a);
  check('6. 「我想再寫一次理由欄。」／（先不說）→「……給我一週。」',J(H.opts[0])===J(['「我想再寫一次理由欄。」','（先不說）'])&&J(T())===J(['……給我一週。']));
  d=plgFrom(H.G.day+7); setD(d,21.7); a=due(); clr(); await play(a);
  check('6. 一週後的讀書會：（她遞來一頁空白的理由欄。）「你先寫。」→ 回到第 6 階、心意邀約照一般條件',a.k==='an_rb_form'&&J(T())===J(['（她遞來一頁空白的理由欄。）','你先寫。'])&&DATE.stageNum(A1)===6&&!X().rebuildBlock(H.G,A1));
  /* 以安不回答：多一步 */
  fresh('2026-09-20',12); H.CLOSE(A1); ROM.start(H.G,A1); ROM.end(H.G,A1,'apart_drift'); Object.assign(SOCIAL.rel(A1),{npcRom:35,fam:50,trust:30});
  d=plgFrom(H.G.day+113); setD(d,21.7); H.G.zone='wancai'; clr(); H.picks=[0,1,0]; await play(due());
  check('6. 不回答以後：「上次你沒有回答。這次，要先回答那一題。」→「對不起。」→「……道歉收到。然後呢？」（AA_436）再選→「那時候我不知道怎麼說。」→「……現在知道了？」「知道一點。」「一點就可以。」→「……給我一週。」',
    J(T())===J(['上次你沒有回答。這次，要先回答那一題。','……道歉收到。然後呢？','……現在知道了？','知道一點。','一點就可以。','……給我一週。']),J(T()));
  fresh('2026-09-20',12); H.CLOSE(A1); ROM.start(H.G,A1); ROM.end(H.G,A1,'mrel');
  check('6. 被發現以後分開的（mrel）不走這裡、不擋心意邀約',!X().rb(H.G,A1)&&!X().rebuildBlock(H.G,A1));
  fresh('2026-09-20',12); H.CLOSE(A1); ROM.start(H.G,A1); ROM.end(H.G,A1,'apart_talk'); H.G.flags.CLEANUP_DONE=true; ROM.start(H.G,A1);
  check('6. 重新交往：EX_heroine_01 清掉',!H.G.flags.EX_heroine_01&&H.G.flags.dating_heroine_01===true);
  /* 語彤好好分開：連續三個週四 18:30 在總圖三樓 */
  fresh('2026-09-20',12); H.CLOSE(YT); ROM.start(H.G,YT); ROM.end(H.G,YT,'apart_talk'); const yb=H.G.day;
  let th=yb+28; while(CALENDAR.dateOf(th).wd%7!==4) th++;
  check('6. 語彤：心意邀約先不發',TERMEND.heartWhy(H.G,YT,{})===false);
  H.G.zone='library'; setD(th,18.6); check('6. 第一個週四',!X().ytRbDue(H.G)); setD(th+7,18.6); check('6. 第二個週四',!X().ytRbDue(H.G));
  setD(th+14,18.6); a=due(); check('6. 第三個連續的週四 18:30 在總圖三樓',a&&a.k==='yt_rb_seat');
  clr(); await play(a); check('6. （她把斜對面的位子留出來。）「……坐著也是坐著。」→ 第 6 階',J(T())===J(['（她把斜對面的位子留出來。）','……坐著也是坐著。'])&&DATE.stageNum(YT)===6&&!X().rebuildBlock(H.G,YT));
  fresh('2026-09-20',12); H.CLOSE(YT); ROM.start(H.G,YT); ROM.end(H.G,YT,'apart_talk'); H.G.zone='library';
  setD(th,18.6); X().ytRbDue(H.G); setD(th+14,18.6); X().ytRbDue(H.G); setD(th+21,18.6);
  check('6. 不連續（中間一週沒去）＝重算',!X().ytRbDue(H.G));
  setD(th-7,18.6); check('6. 不到 4 週＝不算',(()=>{ fresh('2026-09-20',12); H.CLOSE(YT); ROM.start(H.G,YT); ROM.end(H.G,YT,'apart_talk'); H.G.zone='library'; setD(H.G.day+7+((4-CALENDAR.dateOf(H.G.day+7).wd%7+7)%7),18.6); return !X().ytRbDue(H.G); })());
  /* 語彤不回答 */
  fresh('2026-09-20',12); H.CLOSE(YT); ROM.start(H.G,YT); ROM.end(H.G,YT,'drift'); H.G.zone='library'; setD(th,18.6);
  check('6. 語彤不回答以後：她不留位子（週四先不算）',!X().ytRbDue(H.G)&&!(X().rb(H.G,YT).thu||[]).length);
  H.G.zone='noodle'; setD(th,21.3); a=due(); check('6. 週四打烊後人在麵店＝「我想把那個問題回答完。」',a&&a.k==='yt_rb_answer');
  clr(); H.picks=[0]; await play(a); check('6. →「……嗯。這次，不要讓我等。」，之後照三個週四',J(H.opts[0])===J(['「我想把那個問題回答完。」','（先不說）'])&&J(T())===J(['……嗯。這次，不要讓我等。'])&&X().rb(H.G,YT).step==='thu');
});

/* ---------------- 7. 戀愛 CG ---------------- */
await sec(7,async()=>{
  fresh('2027-04-07',15,'campus',{dating_kexin:true}); H.CLOSE(A1); ROM.start(H.G,A1); H.cgs=[];
  ADV.cg('cg_reason_column_heroine01'); check('7. 以安不知道祐廷還有可昕＝照常放',J(H.cgs)===J(['cg_reason_column_heroine01']));
  ROM.learn(H.G,A1,KX,'test'); H.cgs=[]; const r=ADV.cg('cg_reason_column_heroine01');
  check('7. 她知道、沒有同意（OPEN_OK）＝不放（ADV.cg 回 false）',r===false&&!H.cgs.length);
  H.G.flags.OPEN_OK={[A1]:{kexin:true}}; H.cgs=[]; ADV.cg('cg_reason_column_heroine01'); check('7. 她知道、也同意＝照常放',H.cgs.length===1);
  H.cgs=[]; ADV.cg('cg_nye_rooftop'); check('7. 不是女主角的 CG（阿哲的頂樓）不管',H.cgs.length===1);
  fresh('2027-04-07',15); H.CLOSE(A1); ROM.start(H.G,A1); ROM.end(H.G,A1,'mrel'); H.G.flags.CLEANUP_DONE=true; ROM.start(H.G,A1); H.cgs=[];
  ADV.cg('cg_reason_column_heroine01'); check('7. 被發現、分開以後重新交往的這一段＝不放',!H.cgs.length);
  fresh('2027-04-07',15); H.CLOSE(A1); SOCIAL.rel(A1); ROM.learn(H.G,A1,KX,'test'); H.G.flags.dating_kexin=true; H.cgs=[]; ADV.cg('cg_reason_column_heroine01');
  check('7. 沒有在和她交往（朋友的場景）不管',H.cgs.length===1);
});

/* ---------------- 8. BCG-31 ---------------- */
await sec(8,async()=>{
  const src=fs.readFileSync(path.join(H.ROOT,'src/y34b3d.js'),'utf8');
  const i=src.indexOf("{speaker:'heroine_05',text:'回程路上喝。冰的。'},");
  check('8. 1B-18「回程路上喝。冰的。」後面接 BCG-31（兩個人的版本）',i>0&&/^\s*\{if:C\(fam2\),cg:S\.BCG31\}/.test(src.slice(i+"{speaker:'heroine_05',text:'回程路上喝。冰的。'},".length,i+200)));
  check('8. 叫夏天版的 id；冬天版（cg_airport_send_heroine05）不在 y34b3d.js',/S\.BCG31='cg_airport_send_summer_heroine05'/.test(src)&&!/cg:\s*'cg_airport_send_heroine05'/.test(src));
  const adv=fs.readFileSync(path.join(H.ROOT,'src/adv3d.js'),'utf8');
  check('8. 夏天版還沒登記＝不放（ADV.cg 找不到就回 false）',!/cg_airport_send_summer_heroine05/.test(adv));
});

H.done();
})();
