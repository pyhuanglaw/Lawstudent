/* ===== 法律系同學第二～四批的流程（AA_499、AA_500、AA_501；企劃線 4545c239e、d043110ae、17d57eff3；任務 NPC-STORY-1028、USER_WANTS X119）=====
   使用者 10-28 對 LAWWW-C：「全部留著，每個都補故事」「他們可以不能攻略 但有支線任務阿 例如請我幫忙什麼 邀請我去社團」。
   共同做法（AA_498 第 2 節：固定的樣子和地點、認識前的外觀描述、認識的那一場、閒聊表＋之後的招呼、秘密的三個選項、順手的事、手機上限、關係上限、舊存檔）在 src/pool3d.js；
   台詞在 src/data/pool_story_b2.js（AA_499）、b3.js（AA_500）、b4.js（AA_501）。這一份接起來（POOL.extend），寫十五位各自的流程：
   ■ 認識的那一場（POOL.MEETV）：照第 3 節的地點、時段；稿上說了年級的（「大二」「大三」「你是大一的？」「民總，你坐我斜前面」）只在祐廷大一（同第一批鄭元碩、邱家齊）；
     還沒有寫認識的地方＝不給說話按鈕（POOL.syncTalk）；女主角的圈子介紹過（src/hcircle3d.js）＝認識（POOL.afterMeet），不再演自己的那一場。
   ■ 流程（POOL.FLOW）：說話時第一個成立的就演（畢業那一場、那條線的場景、秘密、順手的事、邀你），都不成立＝閒聊（每句一次、一天一句，說完＝之後的招呼輪流）。
   ■ 順手的事（SIDEQ，和店員的一起算「同時最多兩則」）：PQ_HYX1／2、PQ_JY、PQ_LQ、PQ_SCE、PQ_JR、PQ_TZL、PQ_LYR、PQ_YSH、PQ_YCX、PQ_YZY、PQ_HPY、PQ_SMR。
     當場做完的（新聞、影印機、蟑螂、問問題、練習跟媽媽說）＝開了就做完；答應以後要去的＝手機「今天」那一格＋出遊（OUT）或時間到的地點。做完：熟悉＋6、信任＋6；婉拒、過期不扣。
   ■ 邀你（不是順手的事）：廣播社錄音、河堤夜騎、哲學咖啡館、半夜的刑法讀書會（兩場）＝有聯絡方式私訊、沒有＝當面；答應＝出遊。
   ■ 手機（STORY.PHONE_RULES）：各人表上的那幾則都是劇情的（不算上限）；晨希偶爾的錄音是閒聊型（二十位加起來一週一則、同一人一個月一則、考試週不送）。沒交換聯絡方式不送。
   ■ 加在別人那裡的：吉他社兩次成發（晏如、晨希）、系籃比賽三場（孟儒）＋大四下那一場、哲 3 阿哲一句、柏翰推甄面試之後宇軒那一場、柏翰一句閒聊（影印機）、
     曾靖雯一句閒聊（器材組）、法服值班的旁白（影印機、延長線）、大四下法律實習每週那一句之後（承恩，三次）、麵店團群組（阿哲轉貼孟儒的照片）、班級群組（立群的錄音、沛珊回）。
   ■ 畢業：大三的四位＝大二下第 16 週、大二的六位＝大三下第 16 週（同第一批邱家齊「大二下第 16 週（他畢業那一週）」）；日本路線那一週在日本＝改私訊。
   AA 9f2e2506e「實作時定的」（POOL-AAFIX-1028）：立群「我也想學。」、書豪「那天我有事。」當場交換聯絡方式（已經有的不說、不換）；承恩 4-1「一起去旁聽」補一場 2D（S.AUDIT_EV）；
     承恩 4-5 說明會那一句不做、改成實習第四句（認識曾靖雯、有她的聯絡方式）；晏如 2-3「我也怕蟑螂」以後晨希第一句（LYR_CX，FLOW[CX] 第一個，一次）。
   測試：node tests/aa499_501_pool_unit.js */
'use strict';
const POOL_MORE=(function(){
  const S={};
  if(typeof POOL==='undefined') return S;
  const P=POOL;
  const B2=typeof POOL_STORY_B2!=='undefined'?POOL_STORY_B2:null, B3=typeof POOL_STORY_B3!=='undefined'?POOL_STORY_B3:null, B4=typeof POOL_STORY_B4!=='undefined'?POOL_STORY_B4:null;
  const L=P.LINES, PI=Math.PI;
  const H='pool_10', J='pool_13', LQ='pool_16', SC='pool_19', M='pool_20';
  const TZ='pool_2', LY='pool_5', SH='pool_8', CX='pool_11', ZY='pool_14', NW='pool_17';
  const PY='pool_9', MR='pool_12', YX='pool_15', YS='pool_18', ZJW='pool_7';
  const BH='classmate_bohan', PS='classmate_peishan', YC='classmate_youchen', MX='classmate_mingxuan', XC='classmate_xinci';
  const {law,DK,dateOf,md,hr,termDay,ti,tid,inTerm,week,has,contact,fam}=P;
  const WD=[1,2,3,4,5];
  S.SRC=[B2&&B2.SRC,B3&&B3.SRC,B4&&B4.SRC].filter(Boolean);

  /* ---------- 小工具 ---------- */
  const knows=(G,id)=>/^pool_/.test(id)?P.met(G,id):(typeof STORY!=='undefined'&&STORY.knows?!!STORY.knows(id,G):P.met(G,id));
  const abroad=(G,d)=>typeof STORY!=='undefined'&&STORY.abroad?!!STORY.abroad(d==null?G:Object.assign({},G,{day:d})):false;
  const small=(G,id)=>P.small(G,id);
  const doneToday=(G,id)=>{ small(G,id).day=G.day; };
  const R_=G=>P.rec(G);
  const nextWd=(G,wd,incl)=>{ let d=incl?G.day:G.day+1; while(dateOf(d).wd!==wd) d++; return d; };   /* wd：1 週一…6 週六、7 週日 */
  const T=(d,h)=>d*24+h, now=G=>T(G.day,G.hour||0);
  const sent=(G,tag)=>typeof PHONE!=='undefined'&&PHONE.sent(G,tag);
  const q2=t=>/^[「（]/.test(t)?t:'「'+t+'」';   /* 手機的回覆選項（沒有引號）當面說＝加「」*/
  const sayAll=async(GM,who,arr)=>{ for(const t of [].concat(arr)) await GM.say(who,t); };
  const gradWk=(G,term)=>inTerm(G,term)&&week(G)===16;   /* 畢業那一週（同第一批邱家齊：大二下第 16 週）*/
  const termEnd=t=>{ const r=typeof CALENDAR!=='undefined'&&CALENDAR.termDays?CALENDAR.termDays(t):null; return r?r.to:null; };
  const ent=(G,id)=>P.ent(G,id);
  const here=id=>P.here(id);
  const evDone=(G,id)=>!!(G.events&&G.events.done&&G.events.done[id]);
  const q=(G,qid)=>P.qState(G,qid);
  /* 當場做完的順手的事：開了就做完（手機「今天」那一格不留；做完的提示、熟悉＋6 信任＋6 照 POOL.finishQ）*/
  const quick=(GM,qid,o)=>{ const G=GM.G; if(typeof SIDEQ==='undefined') return null; const r=SIDEQ.rec(G)[qid]={state:'open',step:'now',day:G.day,term:SIDEQ.termKey(G)}; P.finishQ(GM,qid,r,o); return r; };
  /* 臺灣時間的那一天、那個時間（國外照時差）排一則（那一天的前一天到後一天之間才排；過了不補）；th 'sys'＝通知 */
  const atTW=(G,d,h,items,tag)=>{ if(d==null||typeof PHONE==='undefined'||sent(G,tag)) return false; const tz=typeof STORY!=='undefined'&&STORY.tzOffset?(+STORY.tzOffset(G,d)||0):0;
    const t=d*24+h+tz, dd=Math.floor(t/24); if(G.day<dd-1||G.day>dd+1) return false; return PHONE.at(G,dd,t-dd*24,items,tag); };
  S.riding=G=>{ const B=G&&G.bike; if(!B||B.zone!==G.zone) return false; if(B.riding) return true; const GM=P.bind(), p=GM&&GM.E&&GM.E.player&&GM.E.player.obj&&GM.E.player.obj.position; return !!p&&Math.hypot((+B.x||0)-p.x,(+B.z||0)-p.z)<8; };   /* 游振宇 5-1：祐廷騎車來的（車在旁邊 8 m 內；和人說話會自動下車）*/
  S.psTaipei=G=>{ if(typeof STORY==='undefined'||!STORY.presence) return true; const p=STORY.presence(PS,G); return !!(p&&(p.here||p.kind==='taipei')); };
  S.psHere=G=>knows(G,PS)&&S.psTaipei(G);   /* 認識沛珊、沛珊在臺北（AA_499 3-4、AA_501 3-3）*/
  S.zrUK=G=>{ if(typeof STORY==='undefined'||!STORY.presence) return false; const p=STORY.presence('heroine_02',G); return !!(p&&p.here===false&&/英國/.test(String(p.away||''))); };
  P.riding=S.riding; P.psHere=S.psHere;

  /* ---------- 接資料（AA_498 第 3 節以外各人那條線要的時段）---------- */
  const WHERE={
    [LY]:[ {days:[1,3],from:18.75,to:19,zone:'wancai',act:'linger',at:[3.0,-5.4,0,0],activity:'club_guitar',terms:['Y1S2'],weeks:[3,4,5,6,7,8,9,10],pri:true,if:{custom:G=>fam(LY)&&!q(G,'PQ_LYR')},desc:'抱著一疊講義的女生',label:'萬才館一樓走廊'},   /* 2-3：吉他社社課那天 18:45（社辦在多功能教室那一側）*/
      {days:WD,from:18,to:21,zone:'wancai',act:'linger',at:[3.0,-5.4,0,0],terms:['Y3S2'],weeks:[16],pri:true,desc:'抱著一疊講義的女生',label:'萬才館一樓，最後一次來社辦'} ],   /* 2-5 畢業那一週 */
    [SH]:[ {days:WD,from:12,to:13,zone:'campus',act:'linger',at:[-36.4,-71.0,0,0],terms:['Y3S2'],weeks:[16],pri:true,desc:'走路很快的男生',label:'博雅門口'} ],   /* 3-5 畢業那一週，博雅門口（DOORS.boya (−38,−72.8) 東南）*/
    [CX]:[ {days:[1,3],from:21,to:22,zone:'campus',act:'linger',at:[97.5,-95,PI,0],pri:true,if:{custom:G=>q(G,'PQ_YCX')==='open'},desc:'背吉他袋的女生',label:'萬才館旁邊，練和弦'},   /* 4-3 打拍子：週一、三 21:00 以後 */
      {days:WD,from:19,to:21,zone:'campus',act:'linger',at:[97.5,-95,PI,0],terms:['Y3S2'],weeks:[16],pri:true,desc:'背吉他袋的女生',label:'萬才館旁邊'} ],   /* 4-4 她畢業那一週 */
    [ZY]:[ {days:WD,from:14,to:18,zone:'library_hall',act:'read',terms:['Y2S1'],weeks:[15],pri:true,noHoliday:true,desc:'騎腳踏車超快的男生',label:'總圖，念書'},   /* 5-4 大二上期末前一週（在總圖）*/
      {days:WD,from:8,to:18,zone:'campus',act:'linger',at:[-117,3.6,-PI/2,0],terms:['Y3S2'],weeks:[16],pri:true,desc:'騎腳踏車超快的男生',label:'校門口，牽著車'} ],   /* 5-5 畢業那一週，校門口 */
    [YS]:[ {days:WD,from:13,to:15,zone:'library',act:'read',seatAt:[-2.4,1.5],terms:['Y2S2'],weeks:[16],pri:true,desc:'愛睡覺的男生',label:'總圖三樓'} ],   /* 4-5 畢業那一週：那張桌子（桌上的紙條在 (−2.4,0.6)）*/
    [M]:[ {days:[6],from:12,to:12.5,zone:'wancai',act:'linger',at:[1.9,1.6,-PI/2,0],terms:['Y1S2'],weeks:[12,13,14,15],pri:true,if:{custom:G=>typeof STORY!=='undefined'&&!!STORY.fafuDuty&&STORY.fafuDuty(G)},desc:'法服攤位那個人',label:'萬才館一樓，值班結束'} ],   /* 5-3：值班的週六 12:00（值班結束）*/
    [H]:[ {days:[4],from:8.5,to:10,zone:'linze',act:'linger',at:[4.6,2.6,PI/2,0],dates:[['2028-10-26','2028-10-26']],pri:true,desc:'常跟助教說話的男生',label:'霖澤館一樓，等推甄面試'} ] };   /* 1-6 推甄面試那天 */
  for(const B of [B2,B3,B4]) if(B) P.extend(B,null);
  for(const id in WHERE){ if(P.owns(id)) P.WHERE_MORE[id]=(P.WHERE_MORE[id]||[]).concat(WHERE[id]); }
  P.apply();
  /* 柏翰：推甄面試那天早上也在霖澤館一樓（AA_499 1-6「柏翰和宇軒坐在同一張長椅上」）*/
  if(typeof CHARACTERS!=='undefined'&&CHARACTERS[BH]&&Array.isArray(CHARACTERS[BH].daily_schedule)&&!CHARACTERS[BH].daily_schedule.some(e=>e&&e.poolPush))
    CHARACTERS[BH].daily_schedule.unshift({days:[4],from:8.5,to:10,zone:'linze',act:'linger',at:[4.6,1.6,PI/2,0],dates:[['2028-10-26','2028-10-26']],pri:true,poolPush:true,label:'霖澤館一樓，等推甄面試'});
  /* 社會圖（AA_499 第 6 節第 2 點）*/
  if(B2&&B2.GRAPH&&typeof SOCIAL_GRAPH!=='undefined'){ const G2=B2.GRAPH;
    for(const c of G2.change){ const e=SOCIAL_GRAPH.find(x=>(x.a===c.a&&x.b===c.b)||(x.a===c.b&&x.b===c.a)); if(e) e.type=c.type; else SOCIAL_GRAPH.push(Object.assign({},c)); }
    for(const c of G2.add){ if(!SOCIAL_GRAPH.some(x=>(x.a===c.a&&x.b===c.b)||(x.a===c.b&&x.b===c.a))) SOCIAL_GRAPH.push(Object.assign({},c)); } }
  /* 林采潔那一套：廖芸萱兩個認識的版本共用選項以後那幾句 */
  if(L[YX]&&L[YX].meetQ){ L[YX].meetPS=L[YX].meetPS.concat(L[YX].meetQ); L[YX].meetAlone=L[YX].meetAlone.concat(L[YX].meetQ); }
  /* 2D 背景（稿：沒有背景圖＝深色底；MISSING_EXTERNAL_ART，BB 跟使用者要）*/
  if(typeof OUT!=='undefined'&&OUT.BG){ const B={radio_room:'廣播社・錄音間',putong_empty:'普通教學館・空教室',welfare_room:'社福中心・教室',boya_201:'博雅 201',phil_cafe:'文學院・教室',law_courtyard:'法學院・前庭'};
    for(const k in B) if(!OUT.BG[k]) OUT.BG[k]={label:B[k],image:null}; }

  /* ---------- 認識的那一場（2-3）：這一區、這個時間的版本 ---------- */
  const y1=G=>P.py(G)===1;
  Object.assign(P.MEETV,{
    [H]:(G,e)=>G.zone==='library'&&e.act==='read'&&y1(G)?'meet':null,   /* 陳助教：「你也是大一的？」*/
    [J]:(G,e)=>G.zone==='campus'&&!e.terms&&!e.dates?'meet':null,   /* 椰林大道（找人訪問）*/
    [LQ]:(G,e)=>G.zone==='gongguan'?'meet':null,   /* 公館，週五晚上 */
    [SC]:(G,e)=>G.zone==='soclib'&&y1(G)?'meet':null,   /* 「民總，你坐我斜前面」*/
    [M]:(G,e)=>G.zone==='campus'&&e.activity==='club_expo_y1s1'?'meet':null,   /* 社團博覽會（法服的攤位）*/
    [TZ]:(G,e)=>G.zone==='library_hall'&&!e.terms&&y1(G)?'meet':null,
    [LY]:(G,e)=>!y1(G)?null:(G.zone==='cafe'?'meetCafe':((G.zone==='wancai'&&typeof ACTIVITIES!=='undefined'&&ACTIVITIES.attendedAny&&ACTIVITIES.attendedAny(G,'club_guitar'))?'meetClub':null)),   /* 吉他社版：祐廷去過吉他社社課 */
    [SH]:(G,e)=>G.zone==='campus'&&!e.terms&&y1(G)?'meet':null,
    [CX]:(G,e)=>G.zone==='campus'&&!e.terms&&y1(G)?'meet':null,
    [ZY]:(G,e)=>G.zone==='campus'&&!e.terms&&y1(G)?'meet':null,
    [NW]:(G,e)=>G.zone==='library_b1'&&y1(G)?'meet':null,
    [PY]:(G,e)=>G.zone==='library'&&y1(G)?'meet':null,
    [MR]:(G,e)=>G.zone==='campus'&&y1(G)?'meet':null,
    [YX]:(G,e)=>G.zone!=='campus'||!y1(G)?null:(S.psIntroOK(G)?'meetPS':'meetAlone'),
    [YS]:(G,e)=>G.zone==='library'&&!e.terms&&y1(G)?'meet':null });
  /* 廖芸萱沛珊介紹的版本：認識沛珊、沛珊那天在旁聽（週二、四下午）、就在她旁邊 */
  S.psIntroOK=G=>{ if(!knows(G,PS)||![2,4].includes(G.weekday)) return false; const h=hr(G); if(h<13||h>=16) return false; const GM=P.bind(), a=GM&&GM.npc&&GM.npc[PS], b=GM&&GM.npc&&GM.npc[YX];
    if(!a||!b||!a.obj||!b.obj) return false; return Math.hypot(a.obj.position.x-b.obj.position.x,a.obj.position.z-b.obj.position.z)<3.5; };
  /* 認識以後各人要記的 */
  Object.assign(P.AFTER_MEET,{
    [J]:G=>{ if(G.flags&&G.flags.JY_ANS) R_(G).jyMeet=G.day; },   /* 一週以後：節目上了 */
    [NW]:G=>{ if(G.flags&&G.flags.NW_BORROW&&!R_(G).nw){ if(typeof INV!=='undefined') INV.addContact(G,NW); R_(G).nw={day:G.day,due:nextWd(G,5),back:null}; } } });   /* 借了筆記（借過筆記就有聯絡方式，6-3）：週五以前還 */

  /* ---------- 閒聊的條件 ---------- */
  const T3=G=>/^Y3/.test(tid(G)||''), T2=G=>/^Y2/.test(tid(G)||'');
  Object.assign(P.WHEN,{
    Y4S1:G=>tid(G)==='Y4S1', Y4S2:G=>tid(G)==='Y4S2', Y3S2:G=>tid(G)==='Y3S2', Y2:T2,
    hyxSelf:G=>tid(G)==='Y2S1'&&week(G)>=10&&q(G,'PQ_HYX1')==='declined',
    hyxOffice:G=>tid(G)==='Y2S1'&&(!!G.flags.HYX_OFFICE||P.WHEN.hyxSelf(G)),
    Y1S2metCJ:G=>tid(G)==='Y1S2'&&P.met(G,'pool_1'), Y2S1metYC:G=>tid(G)==='Y2S1'&&knows(G,YC), Y3jyNews:G=>T3(G)&&!!G.flags.JY_NEWS,
    Y2S1jyLq:G=>tid(G)==='Y2S1'&&!!G.flags.JY_LQ, Y2S2lqTeach:G=>tid(G)==='Y2S2'&&q(G,'PQ_LQ')==='done',
    metYT:G=>P.met(G,'heroine_03'), Y3metYT:G=>T3(G)&&P.met(G,'heroine_03'),
    Y2S1metBH:G=>tid(G)==='Y2S1'&&knows(G,BH), Y2S1metZJW:G=>tid(G)==='Y2S1'&&P.met(G,ZJW),
    tzlAdmit:G=>tid(G)==='Y2S1'&&G.day>=DK('2026-11-01'),
    lyrCafeMet:G=>R_(G).mv[LY]!=='meetClub', metZQ:G=>P.met(G,'heroine_04'),
    metYu:G=>knows(G,'yu'), Y1S2argued:G=>tid(G)==='Y1S2'&&evDone(G,'ev_an_yu_argument'),
    Y2S2yuQuit:G=>tid(G)==='Y2S2'&&G.day>=S.yuQuitDay()&&knows(G,'yu'),
    metMX:G=>knows(G,MX), Y1S1mid:G=>tid(G)==='Y1S1'&&week(G)>=7&&week(G)<=9, metXC:G=>knows(G,XC), Y2S1nwSold:G=>tid(G)==='Y2S1'&&!!G.flags.NW_SOLD,
    metJY:G=>P.met(G,J), Y1S2hpyTold:G=>tid(G)==='Y1S2'&&!!(R_(G).hpy&&R_(G).hpy.told!=null), hpyAdmit:G=>tid(G)==='Y2S2'&&G.day>=DK('2027-03-12'),
    metZhe:G=>P.met(G,'zhe'), metPS:G=>knows(G,PS), Y2S2lyxNone:G=>tid(G)==='Y2S2'&&has(YX,'SHARED_SECRET')&&!(G.flags.LYX_GO||G.flags.LYX_LAW||G.flags.LYX_BOTH),
    metCJ:G=>P.met(G,'pool_1'), metYC:G=>knows(G,YC), zjwHand:G=>!!G.flags.JR_TO_ZJW });
  /* 曾靖雯多一句（AA_499 5-4「讓靖雯接吧。」）：接在第一批她的閒聊表後面 */
  if(L[ZJW]&&B2&&!L[ZJW].talk.some(e=>e.when==='zjwHand')) L[ZJW].talk.push({t:L[M].zjwHand,when:'zjwHand'});
  S.yuQuitDay=()=>termDay('Y2S2',3,3);   /* Alison 退辯論社那天（AA_497 3-4：大二下第 3 週，她說「禮拜三晚上突然空下來」）*/

  /* ---------- 順手的事（SIDEQ 登記）---------- */
  Object.assign(P.QUEST,{ PQ_HYX1:{who:H,title:'何宇軒：陪他去研究室'}, PQ_HYX2:{who:H,title:'何宇軒：一百份判決'}, PQ_JY:{who:J,title:'徐靜儀：新聞裡的一句話'},
    PQ_LQ:{who:LQ,title:'詹立群：試教'}, PQ_SCE:{who:SC,title:'蘇承恩：週六的課輔'}, PQ_JR:{who:M,title:'馬佳蓉：影印機'}, PQ_TZL:{who:TZ,title:'蔡宗霖：二手書'},
    PQ_LYR:{who:LY,title:'劉晏如：社辦的蟑螂'}, PQ_YSH:{who:SH,title:'楊書豪：第一次上台'}, PQ_YCX:{who:CX,title:'葉晨希：打拍子'}, PQ_YZY:{who:ZY,title:'游振宇：問我問題'},
    PQ_HPY:{who:PY,title:'洪珮瑜：當一次她媽媽'}, PQ_SMR:{who:MR,title:'施孟儒：早上六點的球場'} });
  Object.assign(P.HINT,{ PQ_HYX1:{office:r=>md(r.outDay)+'（三）15:00 陪宇軒去敲周老師研究室的門（霖澤館）'}, PQ_HYX2:{cases:r=>md(r.outDay)+'（四）19:00～21:00 到總圖 B1 討論室幫宇軒讀判決'},
    PQ_LQ:{teach:r=>md(r.outDay)+'（四）19:00 到普通教學館的空教室，當立群的國中生'}, PQ_SCE:{tutor:r=>md(r.outDay)+'（六）10:00 陪承恩去社福中心的課輔'},
    PQ_TZL:{books:r=>md(r.outDay)+'（六）14:00 幫宗霖把書搬去舊路書房寄賣'}, PQ_YSH:{debate:r=>md(r.outDay)+'（六）14:00 博雅 201，坐第一排看書豪上台'},
    PQ_YCX:{beat:r=>'週一或週三 21:00 以後到萬才館旁邊，幫晨希打拍子（'+(r.n|0)+'／3）'}, PQ_SMR:{court:r=>md(r.day0)+'（五）06:00～06:30 到醉月湖東側的籃球場幫系籃佔場'} });
  P.register();

  /* ---------- 出遊、場景的事件 ---------- */
  const finishOut=qid=>(G,GM)=>{ const r=P.qRec(G,qid); if(!r||r.state!=='open') return null; P.finishQ(GM&&GM.G===G?GM:{G},qid,r,{away:true}); return r; };
  const EV=[];
  const outEv=(id,title,who,lines,o)=>{ const e=Object.assign({id,title,participants:who?[who]:[],location:'any',trigger:'outing',background:'dark',hours:2,dialogue:lines||[]},o||{}); EV.push(e); return e; };
  S.OFFICE_EV=outEv('ev_pool_hyx_office','陪宇軒去研究室',H,L[H]&&L[H].office,{hours:1,after:(G,GM)=>{ if(finishOut('PQ_HYX1')(G,GM)){ P.addDeed(G,H,L[H].deedOffice); P.seg(G,H,'office'); } },outingMissed:P.lapseQ('PQ_HYX1')});
  S.CASES_EV=outEv('ev_pool_hyx_cases','一百份判決',H,L[H]&&L[H].cases,{after:(G,GM)=>{ if(finishOut('PQ_HYX2')(G,GM)){ P.addDeed(G,H,L[H].deedCases); P.seg(G,H,'cases'); } },outingMissed:P.lapseQ('PQ_HYX2')});
  S.PUSH_EV={id:'ev_pool_hyx_push',title:'推甄面試的長椅',participants:[H],location:'any',trigger:'manual',background:'blur',dialogue:L[H]?L[H].push:[],
    prereq:{custom:G=>S.pushDue(G)},after:G=>{ P.mark(G,'hyxPush'); P.seg(G,H,'push'); }};   /* 1-6：柏翰面試那一場之後（next_event）、或那一天第一次看到他們 */
  EV.push(S.PUSH_EV);
  S.RADIO_EV=outEv('ev_pool_jy_radio','廣播社錄音',J,L[J]&&L[J].radio,{hours:1,after:G=>{ P.addDeed(G,J,L[J].deedRadio); P.seg(G,J,'radio'); R_(G).jyEp=G.day; }});
  S.TEACH_EV=outEv('ev_pool_lq_teach','試教',LQ,L[LQ]&&L[LQ].teach,{hours:1,after:(G,GM)=>{ if(finishOut('PQ_LQ')(G,GM)){ P.addDeed(G,LQ,L[LQ].deedTeach); P.seg(G,LQ,'teach'); } },outingMissed:P.lapseQ('PQ_LQ')});
  S.TUTOR_EV=outEv('ev_pool_sce_tutor','週六的課輔',SC,(L[SC]?L[SC].tutor:[]).concat([{call:async(G,GM)=>{ if(has(SC,'SHARED_SECRET')) return; await P.run(GM,SC,L[SC].tutorOut.concat(L[SC].secretQ)); P.secretMark(G,SC); }}]),
    {after:(G,GM)=>{ if(finishOut('PQ_SCE')(G,GM)){ P.addDeed(G,SC,L[SC].deedTutor); P.seg(G,SC,'tutor'); } },outingMissed:P.lapseQ('PQ_SCE')});   /* 結束以後，走出中心＝秘密（已經說過的不重問）*/
  S.BOOKS_EV=outEv('ev_pool_tzl_books','二手書',TZ,L[TZ]&&L[TZ].books,{hours:1.5,after:(G,GM)=>{ if(finishOut('PQ_TZL')(G,GM)){ P.addDeed(G,TZ,L[TZ].deedBooks); P.seg(G,TZ,'books'); } },outingMissed:P.lapseQ('PQ_TZL')});
  S.DEBATE_EV=outEv('ev_pool_ysh_debate','第一次上台',SH,L[SH]&&L[SH].debate,{after:(G,GM)=>{ if(finishOut('PQ_YSH')(G,GM)){ if(typeof INV!=='undefined') INV.addContact(G,SH); P.addDeed(G,SH,L[SH].deedDebate); P.seg(G,SH,'debate'); } },outingMissed:P.lapseQ('PQ_YSH')});
  S.RIVER_EV=outEv('ev_pool_yzy_river','河堤夜騎',ZY,L[ZY]&&L[ZY].river,{hours:2.5,after:G=>{ P.addDeed(G,ZY,L[ZY].deedRide); P.seg(G,ZY,'ride'); }});
  S.CAFE_EV=outEv('ev_pool_lyx_cafe','哲學咖啡館',YX,L[YX]&&L[YX].cafe,{after:G=>{ if(typeof INV!=='undefined') INV.addContact(G,YX); P.addDeed(G,YX,L[YX].deedCafe); P.seg(G,YX,'cafe'); }});
  S.NIGHT_EV=outEv('ev_pool_ysc_night','半夜的刑法讀書會',YS,L[YS]&&L[YS].night,{hours:2,after:G=>{ if(typeof INV!=='undefined') INV.addContact(G,YS); if(!has(YS,'SHARED_SECRET')) P.secretMark(G,YS); P.addDeed(G,YS,L[YS].deedNight); P.seg(G,YS,'night'); }});   /* 秘密在這裡說 */
  S.LISTEN_EV=outEv('ev_pool_ysc_listen','換你聽他講',YS,L[YS]&&L[YS].listen,{hours:1,after:G=>{ P.seg(G,YS,'listen'); }});
  /* 4-4 守誠的讀書會在 23:00、講到凌晨：回來的地點字幕照舊 */
  /* 2-3 孟儒：早上六點的球場（那個週五 06:00～06:30 到醉月湖東側籃球場＝做完；3D 球場，畫面模糊）*/
  S.COURT_EV={id:'ev_pool_smr_court',title:'早上六點的球場',participants:[],location:'campus',trigger:'manual',background:'blur',dialogue:L[MR]?L[MR].court:[],
    after:(G,GM)=>{ const r=P.qRec(G,'PQ_SMR'); if(!r||r.state!=='open') return; if(typeof INV!=='undefined') INV.addContact(G,MR); P.addDeed(G,MR,L[MR].deedCourt); P.finishQ(GM&&GM.G===G?GM:{G},'PQ_SMR',r); P.seg(G,MR,'court');
      const h0=hr(G); if(h0<7&&GM&&GM.advance) GM.advance(7-h0); }};   /* 「七點，阿哲到了」：時間到 07:00 */
  EV.push(S.COURT_EV);
  S.courtSpot={x:-4,z:-113,r:10};   /* 系籃球場（醉月湖東側；zones3d.js）*/
  S.courtDue=GM=>{ const G=GM&&GM.G, r=G&&P.qRec(G,'PQ_SMR'); if(!r||r.state!=='open'||G.zone!=='campus'||G.day!==r.day0) return false; const h=hr(G); if(h<6||h>=6.5) return false;
    const p=GM.E&&GM.E.player&&GM.E.player.obj&&GM.E.player.obj.position; return !!p&&Math.hypot(p.x-S.courtSpot.x,p.z-S.courtSpot.z)<=S.courtSpot.r; };
  /* 6-4 乃文（日本路線）：回國以後第一次到 B1，櫃台 */
  S.COUNTER_EV={id:'ev_pool_nw_counter',title:'B1 的櫃台',participants:[],location:'library_b1',trigger:'enter',background:'blur',once:true,dialogue:[{speaker:null,text:L[NW]?L[NW].counter:''}],
    prereq:{custom:G=>!!R_(G).nwLeft&&!abroad(G)&&law(G)},after:G=>{ G.flags.NW_BOOK=true; }};
  EV.push(S.COUNTER_EV);
  /* 4-1「我也想旁聽別的系。」（SCE_AUDIT）：一起去旁聽（AA_499 實作時定的第 2 節，AA 9f2e2506e）——大一上第 6 週起、上課的學期（不是假日）的週二 14:00～16:00，
     走到社科院門口（SL3.DOOR＝校園社科院正面的門）他在等；一次，記 SCE_AUDIT_WENT、人物頁一筆；演完到 16:00（下課）*/
  S.auditDue=G=>{ const t=P.termOf(G); return law(G)&&!!G.flags.SCE_AUDIT&&!G.flags.SCE_AUDIT_WENT&&P.met(G,SC)&&!!t&&!(t.id==='Y1S1'&&t.week<6)&&G.weekday===2&&hr(G)>=14&&hr(G)<16&&!(typeof CALENDAR!=='undefined'&&CALENDAR.holiday&&CALENDAR.holiday(G.day)); };
  S.AUDIT_EV={id:'ev_pool_sce_audit',title:'一起去旁聽',participants:[SC],location:'campus',trigger:'auto',once:true,background:'blur',
    near:typeof SL3!=='undefined'&&SL3.DOOR?{x:SL3.DOOR.x,z:SL3.DOOR.z,r:3}:{x:0,z:0,r:0},
    prereq:{custom:G=>S.auditDue(G)},
    dialogue:((L[SC]&&L[SC].audit)||[]).concat([{advance:G=>Math.max(0,16-hr(G))}],(L[SC]&&L[SC].auditOut)||[],[{set:{SCE_AUDIT_WENT:true}},{call:G=>{ if(L[SC]&&L[SC].deedAudit) P.addDeed(G,SC,L[SC].deedAudit); }}])};
  EV.push(S.AUDIT_EV);
  if(typeof STORY_EVENTS!=='undefined') for(const e of EV) if(!STORY_EVENTS.some(x=>x.id===e.id)) STORY_EVENTS.push(e);
  P.AUTO.push(GM=>S.courtDue(GM)?S.COURT_EV:null);
  P.AUTO.push(GM=>S.pushNear(GM)?S.PUSH_EV:null);
  /* 1-6 推甄（2028-10-26）：祐廷在臺灣、和宇軒有點熟；推甄的玩家＝柏翰面試那一場之後（ev_push_interview 的 next_event）；其他＝霖澤館一樓看到他們兩個 */
  S.pushDue=G=>{ const d=DK('2028-10-26'); return law(G)&&d!=null&&G.day===d&&!P.did(G,'hyxPush')&&!abroad(G)&&fam(H)&&P.met(G,H); };
  S.pushNear=GM=>{ const G=GM&&GM.G; if(!G||G.zone!=='linze'||!S.pushDue(G)||!here(H)||!here(BH)) return false; const n=GM.npc[H], p=GM.E&&GM.E.player&&GM.E.player.obj&&GM.E.player.obj.position;
    return !!(n&&n.obj&&p)&&Math.hypot(n.obj.position.x-p.x,n.obj.position.z-p.z)<4; };
  if(typeof STORY_EVENTS!=='undefined'){ const iv=STORY_EVENTS.find(e=>e.id==='ev_push_interview'); if(iv&&!iv.next_event) iv.next_event='ev_pool_hyx_push'; }

  /* ---------- 一般的「其實……」（AA_499 2-3「無罪就是沒做吧。」以後、5-2 沒到交接的）：照 story3d.js 原本那一句（facts[1]，AA_120 定稿）、不加選項 ---------- */
  S.genericLine=id=>{ const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[id]; return c&&c.facts&&c.facts[1]?'「其實……'+String(c.facts[1]).replace(/^其實/,'')+'。沒跟很多人講過。」':null; };
  S.genericSecret=async function(GM,who,id){ const G=GM.G, t=S.genericLine(id); if(!t) return false; await GM.say(who,t); P.secretMark(G,id); doneToday(G,id); return true; };

  /* ---------- 各人的流程 ---------- */
  const FLOW=P.FLOW;
  const sc=async(GM,id,lines)=>{ await P.run(GM,id,lines); doneToday(GM.G,id); };
  const secretWithLine=async(GM,who,id)=>{ const G=GM.G, e=(L[id].talk||[]).find(x=>x.when==='secret'), r=small(G,id); await P.run(GM,id,L[id].secret);
    if(e){ (r.once||(r.once={}))[e.t]=true; r.used.push(e.t); r.last=e.t; await GM.say(who,e.t); }   /* 接原句（閒聊表「說過秘密以後」那一句）*/
    await P.run(GM,id,L[id].secretQ); P.secretMark(G,id); doneToday(G,id); };
  const gradScene=(id,term,key,zone,extra)=>async(GM,who)=>{ const G=GM.G; if(!gradWk(G,term)||G.zone!==zone||P.did(G,key)||abroad(G)||!ent(G,id)) return false;
    await sc(GM,id,L[id].grad); P.mark(G,key); P.seg(G,id,'grad'); if(extra) extra(G); return true; };
  /* 「你哪個週X比較閒」：下一個那一天（今天不算）*/
  const planOut=(G,o)=>P.plan(G,Object.assign({late:0.5,travel:'走過去約 10 分鐘',travelH:0.25},o));

  /* ===== 何宇軒（AA_499 第 1 節）===== */
  S.acceptHyx1=GM=>{ const G=GM.G; if(typeof INV!=='undefined') INV.addContact(G,H); const d=nextWd(G,3); P.openQ(GM,'PQ_HYX1','office',{outDay:d,by:d});
    planOut(G,{id:'pool_hyx_office_'+d,ev:'ev_pool_hyx_office',day:d,h:15,place:'霖澤館',title:'何宇軒：周教授的研究室（霖澤館 15:00）'}); };
  S.acceptHyx2=GM=>{ const G=GM.G; let d=G.day; while(dateOf(d).wd!==4||(d===G.day&&hr(G)>=18.5)) d++; P.openQ(GM,'PQ_HYX2','cases',{outDay:d,by:d});
    planOut(G,{id:'pool_hyx_cases_'+d,ev:'ev_pool_hyx_cases',day:d,h:19,place:'總圖 B1',title:'何宇軒：一百份判決（總圖 B1 討論室 19:00）'}); };   /* 那個週四 19:00～21:00 */
  FLOW[H]=[
    async(GM,who)=>{ const G=GM.G; if(G.zone!=='linze'||!S.pushDue(G)||!here(BH)) return false; await P.run(GM,H,L[H].push); S.PUSH_EV.after(G); doneToday(G,H); return true; },   /* 1-6：那一天第一次看到他們（先找宇軒說話）*/
    async(GM,who)=>{ const G=GM.G; if(has(H,'SHARED_SECRET')||!fam(H)||G.zone!=='library'||small(G,H).day===G.day) return false; if(!(ti(G)>1||(tid(G)==='Y1S2'&&week(G)>=6))) return false;   /* 秘密：大一下第 6 週起，總圖 */
      await P.secretScene(GM,H,L[H].secret); return true; },
    async(GM,who)=>{ const G=GM.G; if(q(G,'PQ_HYX1')||!inTerm(G,'Y2S1')||week(G)<3||week(G)>8||!fam(H)||G.zone!=='library'||!P.canOpen(G)) return false;   /* 1-3：大二上第 3～8 週，總圖 */
      await P.offer(GM,who,H,'PQ_HYX1',{ask:'ask',opts:'askOpts',no:'askNo',accept:S.acceptHyx1}); return true; } ];

  /* ===== 徐靜儀（AA_499 第 2 節）===== */
  S.newsTalk=async function(GM,who){ const G=GM.G; await P.run(GM,J,L[J].news); const v=G.flags.JY_NEWS;
    if(v==='right'||v==='checked'){ P.secretMark(G,J); if(typeof INV!=='undefined') INV.addContact(G,J); } else R_(G).jyNews=G.day;   /* 「無罪就是沒做吧。」：一週以後（下一次說話）她更正；秘密之後照一般的「其實……」*/
    quick(GM,'PQ_JY'); P.seg(G,J,'news'); doneToday(G,J); return true; };
  S.planRadio=G=>{ const d=termDay('Y2S1',10,4); if(d==null) return false; return planOut(G,{id:'pool_jy_radio',ev:'ev_pool_jy_radio',day:d,h:20,place:'廣播社的錄音間',title:'徐靜儀：廣播社錄音（地下室的錄音間 20:00）'}); };   /* 週四晚上 */
  FLOW[J]=[
    async(GM,who)=>{ const G=GM.G, R=R_(G); if(!G.flags.JY_ANS||R.jyMeet==null||G.day<R.jyMeet+7||P.did(G,'jyAired')||sent(G,'pool_jy_aired')||G.zone!=='campus') return false;   /* 一週以後：沒有聯絡方式＝下一次在椰林大道當面 */
      await GM.say(who,G.flags.JY_ANS==='no'?L[J].airedNo:L[J].aired); P.mark(G,'jyAired'); doneToday(G,J); return true; },
    async(GM,who)=>{ const G=GM.G, R=R_(G); if(G.flags.JY_NEWS!=='wrong'||R.jyNews==null||G.day<R.jyNews+7||P.did(G,'jyNewsLater')) return false;   /* 2-3「無罪就是沒做吧。」：一週以後（下一次說話）*/
      await GM.say(who,L[J].newsLater); P.mark(G,'jyNewsLater'); doneToday(G,J); return true; },
    async(GM,who)=>{ const G=GM.G; if(has(J,'SHARED_SECRET')||G.flags.JY_NEWS!=='wrong'||!P.did(G,'jyNewsLater')||!fam(J)||small(G,J).day===G.day) return false;   /* 秘密之後照一般的「其實……」出 */
      return S.genericSecret(GM,who,J); },
    async(GM,who)=>{ const G=GM.G; if(q(G,'PQ_JY')||!inTerm(G,'Y1S2')||week(G)<3||week(G)>10||!fam(J)||G.zone!=='campus'||!P.canOpen(G)) return false;   /* 2-3：大一下第 3～10 週，椰林大道 */
      return S.newsTalk(GM,who); },
    async(GM,who)=>{ const G=GM.G; if(!inTerm(G,'Y2S1')||week(G)!==10||contact(G,J)||P.did(G,'jyInvite')||G.zone!=='campus') return false;   /* 2-5：沒有聯絡方式＝椰林大道當面 */
      P.mark(G,'jyInvite'); await GM.say(who,L[J].invite); const k=await GM.choose(L[J].inviteOpts.map(t=>({t:q2(t)})));
      if(k===0) S.planRadio(G); else await GM.say(who,L[J].inviteNo); doneToday(G,J); return true; } ];

  /* ===== 詹立群（AA_499 第 3 節）===== */
  S.acceptLq=GM=>{ const G=GM.G; if(typeof INV!=='undefined') INV.addContact(G,LQ); const d=nextWd(G,4); P.openQ(GM,'PQ_LQ','teach',{outDay:d,by:d});
    planOut(G,{id:'pool_lq_teach_'+d,ev:'ev_pool_lq_teach',day:d,h:19,place:'普通教學館',title:'詹立群：試教（普通教學館的空教室 19:00）'}); };
  FLOW[LQ]=[
    async(GM,who)=>{ const G=GM.G; if(has(LQ,'SHARED_SECRET')||!fam(LQ)||small(G,LQ).day===G.day) return false; if(!(ti(G)>0||(tid(G)==='Y1S1'&&week(G)>=10))) return false;   /* 秘密：大一上第 10 週起 */
      await secretWithLine(GM,who,LQ); if(G.flags.LQ_SONG) R_(G).lqSong=G.day; return true; },
    async(GM,who)=>{ const G=GM.G; if(q(G,'PQ_LQ')||!inTerm(G,'Y1S2')||week(G)<11||week(G)>13||!fam(LQ)||!P.canOpen(G)) return false;   /* 3-3：大一下第 11～13 週 */
      await P.offer(GM,who,LQ,'PQ_LQ',{ask:'ask',opts:'askOpts',no:'askNo',accept:S.acceptLq}); return true; } ];

  /* ===== 蘇承恩（AA_499 第 4 節）===== */
  S.acceptSce=GM=>{ const G=GM.G; if(typeof INV!=='undefined') INV.addContact(G,SC); const d=nextWd(G,6); P.openQ(GM,'PQ_SCE','tutor',{outDay:d,by:d});
    planOut(G,{id:'pool_sce_tutor_'+d,ev:'ev_pool_sce_tutor',day:d,h:10,place:'社福中心',title:'蘇承恩：週六的課輔（社福中心 10:00）',travel:'公車 約 20 分鐘',travelH:1/3}); };
  S.nextMonthWeek1=G=>{ const q0=dateOf(G.day); let d=G.day+1; while(dateOf(d).m===q0.m) d++; while(dateOf(d).wd!==1) d++; return d; };   /* 下個月第一週（第一個週一）*/
  FLOW[SC]=[
    async(GM,who)=>{ const G=GM.G; if(has(SC,'SHARED_SECRET')||!fam(SC)||G.zone!=='soclib'||q(G,'PQ_SCE')==='open'||small(G,SC).day===G.day) return false; if(!(ti(G)>1||(tid(G)==='Y1S2'&&week(G)>=8))) return false;   /* 秘密：大一下第 8 週起（做過 4-3 的，秘密在 4-3 裡說）*/
      await P.run(GM,SC,L[SC].secret.concat(L[SC].secretQ)); P.secretMark(G,SC); doneToday(G,SC); return true; },
    async(GM,who)=>{ const G=GM.G, st=q(G,'PQ_SCE'), R=R_(G); if(!fam(SC)||G.zone!=='soclib'||!P.canOpen(G)) return false;
      const first=!st&&inTerm(G,'Y1S2')&&week(G)>=3&&week(G)<=12, again=st==='declined'&&R.sceRe!=null&&!R.sceAgain&&G.day>=R.sceRe&&G.day<R.sceRe+7;   /* 4-3：大一下第 3～12 週；「我週六有事。」＝下個月第一週再問一次（只再問一次）*/
      if(!first&&!again) return false; if(again) R.sceAgain=G.day;
      await P.offer(GM,who,SC,'PQ_SCE',{ask:'ask',opts:'askOpts',no:'askNo',accept:S.acceptSce,declined:()=>{ if(!again) R.sceRe=S.nextMonthWeek1(G); }}); return true; } ];

  /* ===== 馬佳蓉（AA_499 第 5 節）===== */
  S.fafuMember=G=>typeof STORY!=='undefined'&&!!STORY.fafuMember&&STORY.fafuMember(G);
  FLOW[M]=[
    async(GM,who)=>{ const G=GM.G; if(!inTerm(G,'Y2S2')||week(G)!==15||dateOf(G.day).wd!==6||G.zone!=='wancai'||P.did(G,'jrHand')||!S.fafuMember(G)) return false;   /* 5-4 交接：大二下第 15 週，祐廷是法服的（那一週的值班週六）*/
      P.mark(G,'jrHand'); await P.run(GM,M,L[M].hand); if(!has(M,'SHARED_SECRET')) P.secretMark(G,M); P.seg(G,M,'hand'); doneToday(G,M); return true; },
    async(GM,who)=>{ const G=GM.G; if(has(M,'SHARED_SECRET')||!fam(M)||!inTerm(G,'Y2S2')||week(G)<8||S.fafuMember(G)||small(G,M).day===G.day) return false;   /* 沒到交接的：大二下第 8 週起，一般的「其實……」（不加選項）*/
      return S.genericSecret(GM,who,M); },
    async(GM,who)=>{ const G=GM.G; if(q(G,'PQ_JR')||!inTerm(G,'Y1S2')||week(G)<12||week(G)>15||!fam(M)||G.zone!=='wancai'||hr(G)<11.5||!(typeof STORY!=='undefined'&&STORY.fafuDuty&&STORY.fafuDuty(G))||!P.canOpen(G)) return false;   /* 5-3：值班的週六 12:00（值班結束）*/
      await P.offer(GM,who,M,'PQ_JR',{ask:'ask',opts:'askOpts',no:'askNo',accept:async GM2=>{ const G2=GM2.G; if(typeof INV!=='undefined') INV.addContact(G2,M); await P.run(GM2,M,L[M].copier); P.addDeed(G2,M,L[M].deedCopier); quick(GM2,'PQ_JR'); P.seg(G2,M,'copier'); R_(G2).jrCopier=G2.day; },
        declined:()=>{ R_(G).jrNo=G.day; }}); return true; } ];

  /* ===== 蔡宗霖（AA_500 第 1 節）===== */
  S.acceptTzl=GM=>{ const G=GM.G; if(typeof INV!=='undefined') INV.addContact(G,TZ); const d=nextWd(G,6); P.openQ(GM,'PQ_TZL','books',{outDay:d,by:d});
    planOut(G,{id:'pool_tzl_books_'+d,ev:'ev_pool_tzl_books',day:d,h:14,place:'舊路書房',title:'蔡宗霖：二手書（舊路書房 14:00）',travel:'走過去約 15 分鐘'}); };
  FLOW[TZ]=[
    gradScene(TZ,'Y3S2','tzlGrad','library_hall'),
    async(GM,who)=>{ const G=GM.G; if(has(TZ,'SHARED_SECRET')||!fam(TZ)||small(G,TZ).day===G.day) return false; if(!(ti(G)>1||(tid(G)==='Y1S2'&&week(G)>=4))) return false;   /* 秘密：大一下第 4 週起 */
      await P.secretScene(GM,TZ,L[TZ].secret); return true; },
    async(GM,who)=>{ const G=GM.G; if(q(G,'PQ_TZL')||!inTerm(G,'Y2S1')||week(G)<12||week(G)>15||G.day<DK('2026-11-01')||!fam(TZ)||G.zone!=='library_hall'||!P.canOpen(G)) return false;   /* 1-3：錄取交換以後、他出發前，總圖 */
      await P.offer(GM,who,TZ,'PQ_TZL',{ask:'ask',opts:'askOpts',no:'askNo',accept:S.acceptTzl}); return true; } ];

  /* ===== 劉晏如（AA_500 第 2 節）===== */
  FLOW[LY]=[
    gradScene(LY,'Y3S2','lyrGrad','wancai'),
    async(GM,who)=>{ const G=GM.G; if(q(G,'PQ_LYR')||!inTerm(G,'Y1S2')||week(G)<3||week(G)>10||!fam(LY)||G.zone!=='wancai'||hr(G)>=19.25||!P.canOpen(G)) return false;   /* 2-3：吉他社社課那天 18:45，萬才館（秘密在這裡說）*/
      await P.offer(GM,who,LY,'PQ_LYR',{ask:'ask',opts:'askOpts',no:'afraid',afterAsk:GM2=>P.secretMark(GM2.G,LY),
        accept:async GM2=>{ const G2=GM2.G; await P.run(GM2,LY,L[LY].roach); if(typeof INV!=='undefined') INV.addContact(G2,LY); P.addDeed(G2,LY,L[LY].deedRoach); quick(GM2,'PQ_LYR'); P.seg(G2,LY,'roach'); },
        declined:()=>{ if(P.met(G,CX)) G.flags.LYR_CX=true; }}); return true; } ];   /* 「我也怕蟑螂。」：認識葉晨希的另外記一筆 */

  /* ===== 楊書豪（AA_500 第 3 節）===== */
  S.acceptYsh=GM=>{ const G=GM.G; const d=nextWd(G,6); P.openQ(GM,'PQ_YSH','debate',{outDay:d,by:d});
    planOut(G,{id:'pool_ysh_debate_'+d,ev:'ev_pool_ysh_debate',day:d,h:14,place:'博雅 201',title:'楊書豪：社內賽（博雅 201 14:00）'}); };
  FLOW[SH]=[
    gradScene(SH,'Y3S2','yshGrad','campus'),
    async(GM,who)=>{ const G=GM.G; if(q(G,'PQ_YSH')||!inTerm(G,'Y1S2')||week(G)<8||week(G)>12||!fam(SH)||G.zone!=='campus'||!P.canOpen(G)) return false;   /* 3-3：大一下第 8～12 週，椰林大道（秘密在這裡說）*/
      await P.offer(GM,who,SH,'PQ_YSH',{ask:'ask',opts:'askOpts',no:'askNo',accept:S.acceptYsh,afterAsk:GM2=>P.secretMark(GM2.G,SH),declined:()=>{ R_(G).yshSat=nextWd(G,6); }}); return true; } ];   /* 「那天我有事。」：週六晚上私訊 */

  /* ===== 葉晨希（AA_500 第 4 節）===== */
  S.acceptYcx=GM=>{ const G=GM.G, to=termEnd('Y1S2'); P.openQ(GM,'PQ_YCX','beat',{n:0,by:to!=null&&to>G.day?to:G.day+60}); };
  const offerYcx=(GM,who)=>P.offer(GM,who,CX,'PQ_YCX',{ask:'ask',opts:'askOpts',no:'askNo',accept:S.acceptYcx});
  FLOW[CX]=[
    async(GM,who)=>{ const G=GM.G, R=R_(G); if(!G.flags.LYR_CX||R.cxRoach!=null||!L[CX]||!L[CX].roachHi) return false;   /* AA 9f2e2506e：晏如選「我也怕蟑螂。」、那時已經認識晨希＝下一次說話第一句換成這兩句，一次；之後照平常（這一次算今天那一句閒聊）*/
      R.cxRoach=G.day; small(G,CX).day=G.day; await P.run(GM,CX,L[CX].roachHi); return true; },
    gradScene(CX,'Y3S2','ycxGrad','campus'),
    async(GM,who)=>{ const G=GM.G, r=P.qRec(G,'PQ_YCX'), R=R_(G); if(!r||r.state!=='open'||G.zone!=='campus'||![1,3].includes(G.weekday)||hr(G)<21||R.ycxLast===G.day||r.day===G.day) return false;   /* 4-3：之後三個社課的晚上（週一或週三 21:00 以後）*/
      const n=r.n|0; await P.run(GM,CX,L[CX].beats[n]); R.ycxLast=G.day; r.n=n+1;
      if(n===0&&typeof INV!=='undefined') INV.addContact(G,CX);   /* 第一次就交換聯絡方式 */
      if(r.n>=3){ G.flags.YCX_BEAT=true; P.addDeed(G,CX,L[CX].deedBeat); P.finishQ(GM,'PQ_YCX',r); P.seg(G,CX,'beat'); R.ycxBeat=G.day; }
      doneToday(G,CX); return true; },
    async(GM,who)=>{ const G=GM.G; if(has(CX,'SHARED_SECRET')||!fam(CX)||G.zone!=='campus'||small(G,CX).day===G.day) return false; if(!(ti(G)>0||(tid(G)==='Y1S1'&&week(G)>=10))) return false;   /* 秘密：大一上第 10 週起，萬才館旁邊 */
      await P.secretScene(GM,CX,L[CX].secret); if(G.flags.YCX_OFFER&&!q(G,'PQ_YCX')&&P.canOpen(G)) await offerYcx(GM,who); return true; },   /* 「我幫妳打拍子。」→ 接 4-3 */
    async(GM,who)=>{ const G=GM.G; if(q(G,'PQ_YCX')||!inTerm(G,'Y1S2')||week(G)<2||week(G)>12||!has(CX,'SHARED_SECRET')||G.zone!=='campus'||!P.canOpen(G)) return false;   /* 4-3：大一下第 2～12 週，說過秘密 */
      await offerYcx(GM,who); return true; } ];

  /* ===== 游振宇（AA_500 第 5 節）===== */
  S.planRide=(G,d)=>planOut(G,{id:'pool_yzy_ride_'+d,ev:'ev_pool_yzy_river',day:d,h:19,place:'河濱',title:'游振宇：腳踏車社騎河堤（校門 19:00 集合）',travel:'騎車',travelH:0.25});
  S.rideDue=G=>{ const R=R_(G); if(R.yzyRide!=null&&R.yzyRe==null) return false; if(R.yzyRe!=null) return !R.yzyRe2&&G.day>=R.yzyRe&&G.day<R.yzyRe+7;   /* 「這次不行。」：下個月再邀一次（只再邀一次）*/
    return inTerm(G,'Y1S1')&&week(G)>=8&&week(G)<=15; };
  FLOW[ZY]=[
    gradScene(ZY,'Y3S2','yzyGrad','campus'),
    async(GM,who)=>{ const G=GM.G; if(q(G,'PQ_YZY')||!inTerm(G,'Y2S1')||week(G)!==15||!P.canOpen(G)) return false; if(!(G.flags.YZY_ASKME||(fam(ZY)&&G.zone==='library_hall'))) return false;   /* 5-4：大二上期末前一週（選了「我問你，你答」，或有點熟以上在總圖）*/
      await P.offer(GM,who,ZY,'PQ_YZY',{ask:'ask',opts:'askOpts',no:'askNo',accept:async GM2=>{ const G2=GM2.G; await P.run(GM2,ZY,L[ZY].quiz); if(typeof INV!=='undefined') INV.addContact(G2,ZY); quick(GM2,'PQ_YZY'); P.seg(G2,ZY,'quiz'); R_(G2).yzyQuiz=G2.day; }}); return true; },   /* 稿沒寫哪裡交換聯絡方式；「考完那天晚上私訊」要有＝問完問題那一場交換（回報請 AA 確認）*/
    async(GM,who)=>{ const G=GM.G; if(has(ZY,'SHARED_SECRET')||!fam(ZY)||small(G,ZY).day===G.day) return false; if(!(ti(G)>1||(tid(G)==='Y1S2'&&week(G)>=6))) return false;   /* 秘密：大一下第 6 週起 */
      await P.secretScene(GM,ZY,L[ZY].secret); return true; },
    async(GM,who)=>{ const G=GM.G, R=R_(G); if(contact(G,ZY)||G.zone!=='campus'||!S.rideDue(G)||R.yzyFace===G.day) return false;   /* 5-3：沒有聯絡方式＝在校園當面（這週六晚上）*/
      if(R.yzyRe!=null) R.yzyRe2=G.day; else R.yzyRide=G.day; R.yzyFace=G.day; await sayAll(GM,who,L[ZY].ride); const k=await GM.choose(L[ZY].rideOpts.map(t=>({t:q2(t)})));
      if(k===0) S.planRide(G,nextWd(G,6)); else { await GM.say(who,L[ZY].rideNo); if(R.yzyRe==null) R.yzyRe=G.day+28; }
      doneToday(G,ZY); return true; } ];

  /* ===== 蕭乃文（AA_500 第 6 節）===== */
  FLOW[NW]=[
    async(GM,who)=>{ const G=GM.G; if(!gradWk(G,'Y3S2')||G.zone!=='library_b1'||P.did(G,'nwGrad')||abroad(G)) return false;   /* 6-4 畢業：B1，登記簿 */
      await sc(GM,NW,L[NW].grad); P.mark(G,'nwGrad'); G.flags.NW_BOOK=true; P.seg(G,NW,'grad'); return true; },
    async(GM,who)=>{ const G=GM.G, n=R_(G).nw; if(!n||n.back!=null||G.zone!=='library_b1') return false;   /* 借了筆記：B1 還給她（週五以前＝打勾；晚了＝多一句）*/
      n.back=G.day; await GM.say(who,G.day<=n.due?L[NW].back:L[NW].backLate); P.seg(G,NW,'notes'); doneToday(G,NW); return true; },
    async(GM,who)=>{ const G=GM.G; if(has(NW,'SHARED_SECRET')||!fam(NW)||G.zone!=='library_b1'||small(G,NW).day===G.day) return false; if(!(ti(G)>1||(tid(G)==='Y1S2'&&week(G)>=8))) return false;   /* 秘密：大一下第 8 週起，B1 */
      await secretWithLine(GM,who,NW); return true; } ];

  /* ===== 洪珮瑜（AA_501 第 1 節）===== */
  FLOW[PY]=[
    gradScene(PY,'Y2S2','hpyGrad','library'),
    async(GM,who)=>{ const G=GM.G, h0=R_(G).hpy; if(!h0||!h0.no||h0.told!=null||G.day<h0.sun||sent(G,'pool_hpy_told')||G.zone!=='library') return false;   /* 「我演不好啦。」沒有聯絡方式：下一次在總圖當面 */
      h0.told=G.day; await GM.say(who,L[PY].toldNo); doneToday(G,PY); return true; },
    async(GM,who)=>{ const G=GM.G; if(q(G,'PQ_HPY')||!inTerm(G,'Y1S2')||week(G)<3||week(G)>8||!fam(PY)||G.zone!=='library'||!P.canOpen(G)) return false;   /* 1-3：大一下第 3～8 週，總圖三樓（秘密在這裡說）*/
      await P.offer(GM,who,PY,'PQ_HPY',{ask:'ask',opts:'askOpts',no:'askNo',afterAsk:GM2=>P.secretMark(GM2.G,PY),
        accept:async GM2=>{ const G2=GM2.G; await P.run(GM2,PY,L[PY].mom); if(typeof INV!=='undefined') INV.addContact(G2,PY); P.addDeed(G2,PY,L[PY].deedMom); quick(GM2,'PQ_HPY'); P.seg(G2,PY,'mom');
          R_(G2).hpy={sun:nextWd(G2,7,dateOf(G2.day).wd!==7),told:null}; },   /* 這個週末（週日 22:00 私訊）*/
        declined:()=>{ R_(G).hpy={sun:nextWd(G,7,dateOf(G.day).wd!==7),no:true,told:null}; }}); return true; } ];

  /* ===== 施孟儒（AA_501 第 2 節）===== */
  S.acceptSmr=GM=>{ const G=GM.G; const d=nextWd(G,5); P.openQ(GM,'PQ_SMR','court',{day0:d,by:d}); };   /* 這週五（今天是週五＝下週五）早上六點 */
  const offerSmr=(GM,who)=>P.offer(GM,who,MR,'PQ_SMR',{ask:'ask',opts:'askOpts',no:'askNo',accept:S.acceptSmr});
  FLOW[MR]=[
    async(GM,who)=>{ const G=GM.G; if(!gradWk(G,'Y2S2')||dateOf(G.day).wd!==5||G.zone!=='campus'||P.did(G,'smrGrad')||!fam(MR)||!ent(G,MR)) return false;   /* 2-5 畢業那一週的週五，球場（有點熟以上）*/
      await sc(GM,MR,L[MR].grad); P.mark(G,'smrGrad'); P.seg(G,MR,'grad'); return true; },
    async(GM,who)=>{ const G=GM.G; if(has(MR,'SHARED_SECRET')||!fam(MR)||G.zone!=='campus'||small(G,MR).day===G.day) return false; if(!(ti(G)>1||(tid(G)==='Y1S2'&&week(G)>=4))) return false;   /* 秘密：大一下第 4 週起，球場 */
      await P.secretScene(GM,MR,L[MR].secret); if(G.flags.SMR_OFFER&&!q(G,'PQ_SMR')&&inTerm(G,'Y1S2')&&week(G)<=12&&P.canOpen(G)) await offerSmr(GM,who); return true; },   /* 「我幫你佔一次。」→ 接 2-3 */
    async(GM,who)=>{ const G=GM.G; if(q(G,'PQ_SMR')||!inTerm(G,'Y1S2')||week(G)<4||week(G)>12||!fam(MR)||G.zone!=='campus'||!P.canOpen(G)) return false;   /* 2-3：大一下第 4～12 週，球場 */
      await offerSmr(GM,who); return true; } ];

  /* ===== 廖芸萱（AA_501 第 3 節）===== */
  S.planCafe=G=>{ const d=nextWd(G,4,dateOf(G.day).wd===4&&hr(G)<18.5); return planOut(G,{id:'pool_lyx_cafe_'+d,ev:'ev_pool_lyx_cafe',day:d,h:19,place:'文學院',title:'廖芸萱：哲學咖啡館（文學院的教室 19:00）'}); };   /* 週四晚上 */
  FLOW[YX]=[
    async(GM,who)=>{ const G=GM.G; if(!gradWk(G,'Y2S2')||G.zone!=='campus'||P.did(G,'lyxGrad')||!ent(G,YX)) return false;   /* 3-4 畢業：文學院長椅 */
      await sc(GM,YX,L[YX].grad); P.mark(G,'lyxGrad'); if(G.flags.LYX_GO) G.flags.LYX_FORM=true; P.seg(G,YX,'grad'); return true; },
    async(GM,who)=>{ const G=GM.G; if(has(YX,'SHARED_SECRET')||!fam(YX)||G.zone!=='campus'||small(G,YX).day===G.day) return false; if(!(ti(G)>1||(tid(G)==='Y1S2'&&week(G)>=10))) return false;   /* 秘密：大一下第 10 週起，文學院 */
      await P.secretScene(GM,YX,L[YX].secret); return true; },
    async(GM,who)=>{ const G=GM.G; if(!inTerm(G,'Y1S2')||week(G)<12||week(G)>15||!fam(YX)||contact(G,YX)||P.did(G,'lyxInvite')||G.zone!=='campus') return false;   /* 3-3：沒有聯絡方式的，文學院當面 */
      P.mark(G,'lyxInvite'); await sayAll(GM,who,L[YX].invite); const k=await GM.choose(L[YX].inviteOpts.map(t=>({t:q2(t)})));
      if(k===0) S.planCafe(G); else await GM.say(who,L[YX].inviteNo); doneToday(G,YX); return true; } ];

  /* ===== 嚴守誠（AA_501 第 4 節）===== */
  S.planNight=(G,id,ev,title)=>planOut(G,{id,ev,day:G.day,h:23,late:0.75,place:'總圖 B1',title});
  FLOW[YS]=[
    async(GM,who)=>{ const G=GM.G; if(!inTerm(G,'Y1S1')||week(G)<14||contact(G,YS)||P.did(G,'yscInvite')||G.zone!=='library') return false;   /* 4-3：沒有聯絡方式的，總圖當面（今天晚上）*/
      P.mark(G,'yscInvite'); await sayAll(GM,who,L[YS].invite); const k=await GM.choose(L[YS].inviteOpts.map(t=>({t:q2(t)})));
      if(k===0) S.planNight(G,'pool_ysc_night','ev_pool_ysc_night','嚴守誠：半夜的刑法讀書會（總圖 B1 23:00）'); else await GM.say(who,L[YS].inviteNo); doneToday(G,YS); return true; } ];

  /* ---------- 手機（各人的表；劇情的不算上限）---------- */
  const dm=(id,t)=>P.dm(id,t);
  const story=(G,id,d,h,texts,tag,o)=>P.story(G,id,d,h,texts,tag,o);
  const segSent=(G,id,key,tag)=>P.segSent(G,id,key,tag);
  const askOf=(id,opts,o)=>Object.assign({id,opts:opts.map(x=>Array.isArray(x)?{t:x[0],say:[{from:x[2]||null,text:x[1]}]}:x)},o||{});
  const gradJP=(G,id,texts,tag)=>{ const d=termDay('Y3S2',16,6); if(d!=null&&abroad(G,d)) story(G,id,d,20,texts,tag); };   /* 大二的六位畢業：日本路線（祐廷在日本）改私訊（那一週的週六 20:00）*/
  S.phone=function(G){ if(!law(G)||typeof PHONE==='undefined'||typeof CALENDAR==='undefined') return; const F=G.flags||{}, R=R_(G);
    /* 何宇軒 */
    { const d=termDay('Y3S1',3,1); if(d!=null&&!q(G,'PQ_HYX2')&&contact(G,H)&&P.canOpen(G)) story(G,H,d,21,L[H].y3,'pool_hyx_y3',{ask:askOf('pool_hyx_y3',[{t:L[H].y3Opts[0]},{t:L[H].y3Opts[1],say:[{from:H,text:L[H].y3No}]}],{until:termDay('Y3S1',6,4)*24+18})}); }   /* 回到大三上第 6 週週四傍晚（1-5：第 3～6 週）*/   /* 1-4 大三上第 3 週 */
    { const extra=F.HYX_WHAT?L[H].passWhat:(F.HYX_EARLY?L[H].passEarly:(F.HYX_WAIT?L[H].passWait:null)); story(G,H,DK('2028-11-23'),16,[L[H].pass].concat(extra?[extra]:[]),'pool_hyx_pass'); segSent(G,H,'pass','pool_hyx_pass'); }   /* 1-6 放榜（柏翰放榜同一天）*/
    /* 徐靜儀 */
    if(F.JY_ANS&&R.jyMeet!=null&&!P.did(G,'jyAired')) story(G,J,R.jyMeet+7,21,F.JY_ANS==='no'?L[J].airedNo:L[J].aired,'pool_jy_aired');   /* 2-1 一週以後 */
    { const d=termDay('Y2S1',10,1); if(d!=null&&!P.did(G,'jyInvite')&&story(G,J,d,21,L[J].invite,'pool_jy_invite',{ask:askOf('pool_jy_invite',[{t:L[J].inviteOpts[0]},{t:L[J].inviteOpts[1],say:[{from:J,text:L[J].inviteNo}]}],{until:termDay('Y2S1',10,4)*24+19.5})})) P.mark(G,'jyInvite'); }   /* 2-5 大二上第 10 週 */
    if(R.jyEp!=null) story(G,J,R.jyEp+7,21,L[J].episode,'pool_jy_episode');   /* 之後一週，她傳那一集 */
    if(knows(G,YC)){ story(G,J,DK('2026-11-20'),21,L[J].yc,'pool_jy_yc'); segSent(G,J,'yc','pool_jy_yc'); }   /* 2-6 宥辰地下室那場（11/14）之後一週的週五 */
    story(G,J,DK('2028-07-12'),21,L[J].court,'pool_jy_court'); segSent(G,J,'court','pool_jy_court');   /* 大三暑假 2028-07 */
    if(fam(J)&&contact(G,J)){ atTW(G,DK('2030-10-01'),8,[{th:'sys',who:null,text:L[J].news2030}],'pool_jy_news2030');   /* 2-7 新聞（通知）、隔一天她私訊 */
      if(sent(G,'pool_jy_news2030')){ story(G,J,DK('2030-10-02'),21,(F.JY_NEWS==='right'||F.JY_NEWS==='checked')?L[J].title:L[J].titleNo,'pool_jy_title'); segSent(G,J,'title','pool_jy_title'); } }
    /* 詹立群 */
    if(R.lqSong!=null) story(G,LQ,R.lqSong+7,21,L[LQ].song,'pool_lq_song');   /* LQ_SONG：之後一週 */
    { const v=q(G,'PQ_LQ')==='done'?(F.LQ_STU==='good'?L[LQ].resGood:(F.LQ_STU==='ask'?L[LQ].resAsk:(F.LQ_STU==='sleep'?L[LQ].resSleep:null))):null;   /* 甄選結果（大一下第 15 週）*/
      story(G,LQ,termDay('Y1S2',15,3),21,[L[LQ].result].concat(v?[v]:[]),'pool_lq_result'); segSent(G,LQ,'result','pool_lq_result'); }
    { const d=termDay('Y3S1',8,3); if(d!=null&&PHONE.inGroup(G,'law_class')&&!sent(G,'pool_lq_grp')){ const items=[{th:'g:law_class',from:YC,text:L[LQ].grp}]; if(S.psHere(G)) items.push({th:'g:law_class',from:PS,text:L[LQ].grpPs}); atTW(G,d,22,items,'pool_lq_grp'); } }   /* 大三上第 8 週，班級群組 */
    { story(G,LQ,DK('2029-09-03'),18,[L[LQ].y2029].concat(F.LQ_STU==='sleep'?[L[LQ].y2029Sleep]:[]),'pool_lq_2029'); segSent(G,LQ,'y2029','pool_lq_2029'); }   /* 2029-09 教育實習 */
    /* 蘇承恩 */
    story(G,SC,termDay('Y2S2',2,1),21,L[SC].double,'pool_sce_double'); segSent(G,SC,'double','pool_sce_double');   /* 大二下第 2 週 */
    { const k=F.SCE_KID; let it=null, ask=null;   /* 4-6 結局（2029-09）*/
      if(k==='help') it=L[SC].endHelp; else if(k==='yes') it=L[SC].endYes; else if(k==='learn'){ it=L[SC].endLearn; ask=askOf('pool_sce_end',L[SC].endLearnOpts.map(o=>[o[0],o[1],SC])); }
      else if(F.SCE_LAW&&q(G,'PQ_SCE')!=='done') it=L[SC].endLaw; else it=L[SC].endOther;
      story(G,SC,DK('2029-09-10'),21,it,'pool_sce_end',ask?{ask}:undefined); segSent(G,SC,'end','pool_sce_end'); }
    /* 馬佳蓉 */
    { const d=termDay('Y2S2',15,6); if(d!=null&&!S.fafuMember(G)){ story(G,M,d,20,L[M].handMsg,'pool_jr_hand'); segSent(G,M,'hand','pool_jr_hand'); } }   /* 不是法服的：大二下第 15 週 */
    { story(G,M,termDay('Y3S2',16,6),20,L[M].grad,'pool_jr_grad'); segSent(G,M,'grad','pool_jr_grad'); }   /* 她畢業那一週 */
    if(fam(M)){ story(G,M,DK('2030-06-02'),20,L[M].y2030.concat(F.JR_HANDOVER?[L[M].y2030Cord]:[]),'pool_jr_2030'); }   /* 2030 年（祐廷畢業以後一年）*/
    /* 蔡宗霖 */
    story(G,TZ,DK('2027-03-20'),21,L[TZ].jp1.concat(F.TZL_WHY?[L[TZ].jp1Why]:[]),'pool_tzl_jp1'); segSent(G,TZ,'jp1','pool_tzl_jp1');   /* 大二下他在日本：3 月 */
    story(G,TZ,DK('2027-06-12'),21,L[TZ].jp2,'pool_tzl_jp2');   /* 6 月 */
    { const rt=typeof STORY!=='undefined'&&STORY.routeAbroadRoute?STORY.routeAbroadRoute(G):null; if(rt==='JP'&&knows(G,'heroine_01')&&fam(TZ)) story(G,TZ,DK('2028-02-15'),21,L[TZ].an,'pool_tzl_an'); }   /* 2028-02 第 3 週（以安走日本路線）*/
    gradJP(G,TZ,L[TZ].gradJP,'pool_tzl_gradjp');
    /* 劉晏如 */
    if(F.LYR_ROACH&&q(G,'PQ_LYR')==='done') story(G,LY,termDay('Y2S1',4,1),18+50/60,L[LY].again,'pool_lyr_again');   /* 大二上某一天 18:50（一次）*/
    gradJP(G,LY,L[LY].gradJP,'pool_lyr_gradjp');
    /* 楊書豪 */
    if(R.yshSat!=null) story(G,SH,R.yshSat,21,L[SH].alone,'pool_ysh_alone');   /* 「那天我有事。」：週六晚上（有聯絡方式才送）*/
    story(G,SH,termDay('Y2S1',2,1),21,L[SH].chair,'pool_ysh_chair'); segSent(G,SH,'chair','pool_ysh_chair');   /* 大二上：社長（稿沒寫哪一天：第 2 週）*/
    if(knows(G,'yu')) story(G,SH,S.yuQuitDay(),21.5,L[SH].yuQuit,'pool_ysh_yuquit');   /* Alison 退社那天 */
    gradJP(G,SH,L[SH].gradJP,'pool_ysh_gradjp');
    /* 葉晨希：偶爾一段錄音（閒聊型：一個月最多一次；YCX_BEAT 以後、她畢業以前；週一、三練習的晚上 22:00）*/
    if(F.YCX_BEAT&&R.ycxBeat!=null&&[1,3].includes(G.weekday)&&hr(G)>=21&&hr(G)<22){ const gd=termEnd('Y3S2'); if(gd==null||G.day<=gd){ const k=(G.day*7+3)%5; if(k<2) P.chat(G,CX,L[CX].rec,'pool_ycx_rec_'+G.day,22); } }
    gradJP(G,CX,L[CX].gradJP,'pool_ycx_gradjp');
    if(P.met(G,'heroine_04')&&L[CX].recY4a){ story(G,CX,DK('2028-11-15'),22,[L[CX].recY4a],'pool_ycx_y4a'); story(G,CX,DK('2029-05-13'),22,[L[CX].recY4b],'pool_ycx_y4b'); }   /* AA_514 第 4 節第 4 點（AA 9bca0f407）：晨希大四那兩句改成她的錄音私訊（畢業以後、3D 沒有她）；有她的聯絡方式（story 會查）、認識子晴；不用回 */
    /* 游振宇 */
    if(contact(G,ZY)&&S.rideDue(G)&&R.yzyFace!==G.day&&dateOf(G.day).wd===4){   /* 5-3：週四 21:00 私訊（有聯絡方式）*/
      const tag='pool_yzy_ride_'+(R.yzyRe!=null?'re':'1'); if(!sent(G,tag)&&story(G,ZY,G.day,21,L[ZY].ride,tag,{ask:askOf(tag,[{t:L[ZY].rideOpts[0]},{t:L[ZY].rideOpts[1],say:[{from:ZY,text:L[ZY].rideNo}]}],{until:(G.day+2)*24+18.5})})){ if(R.yzyRe!=null) R.yzyRe2=G.day; else R.yzyRide=G.day; } }
    if(R.yzyQuiz!=null) story(G,ZY,R.yzyQuiz+1,21,L[ZY].quizMsg,'pool_yzy_quiz');   /* 考完那天晚上 */
    gradJP(G,ZY,L[ZY].gradJP,'pool_yzy_gradjp');
    /* 蕭乃文 */
    { const n=R.nw; if(n&&n.back==null) story(G,NW,n.due+1,9,L[NW].late,'pool_nw_late'); }   /* 過了週五還沒還：週六 09:00 */
    { if(!R.nwSold&&inTerm(G,'Y2S1')&&week(G)>=5&&week(G)<=9&&dateOf(G.day).wd===2&&fam(NW)&&contact(G,NW)){   /* 6-3 大二上第 5～9 週，週二 23:10 */
        const O=L[NW].soldOpts.filter(o=>!o.kai||knows(G,'kai')).map(o=>({t:o.t,set:{NW_SOLD:o.set},say:o.say.map(x=>typeof x==='string'?{from:NW,text:x}:{who:null,text:x.n})}));
        if(story(G,NW,G.day,23+10/60,L[NW].sold,'pool_nw_sold',{ask:askOf('pool_nw_sold',O)})) R.nwSold=G.day; } }
    if(R.nwSold!=null){ if(F.NW_SOLD==='fafu') story(G,NW,R.nwSold+1,21,L[NW].fafu,'pool_nw_fafu'); story(G,NW,R.nwSold+7,21,L[NW].week,'pool_nw_week'); segSent(G,NW,'sold','pool_nw_week'); }   /* 隔天週三晚上（明天去法服問）；一週以後（所有選項都有）*/
    { const d=termDay('Y3S2',16,6); if(d!=null&&abroad(G,d)&&!P.did(G,'nwGrad')&&story(G,NW,d,20,L[NW].gradJP,'pool_nw_gradjp')) R.nwLeft=G.day; }   /* 日本路線：登記簿放在 B1 的櫃台 */
    /* 洪珮瑜 */
    { const h0=R.hpy; if(h0&&h0.told==null){ const v=h0.no?[L[PY].toldNo]:[L[PY].told].concat(G.flags.HPY_MOM==='yes'?[L[PY].toldYes]:(G.flags.HPY_MOM==='worry'?[L[PY].toldWorry]:(G.flags.HPY_MOM==='money'?[L[PY].toldMoney]:[])));
        if(story(G,PY,h0.sun,22,v,'pool_hpy_told')) h0.told=h0.sun; } }   /* 週日 22:00 */
    story(G,PY,DK('2027-03-12'),21,L[PY].admit,'pool_hpy_admit');   /* 大二下 2027-03 錄取 */
    if(fam(PY)){ const zr=P.met(G,'heroine_02')&&typeof SOCIAL!=='undefined'&&['FRIEND','CLOSE_FRIEND','POSSIBLE_ROMANTIC_INTEREST','ROMANTIC_TENSION','RELATIONSHIP'].includes(SOCIAL.stage('heroine_02'))&&S.zrUK(Object.assign({},G,{day:DK('2027-12-09')}));
      const opts=(zr?L[PY].ukOpts:L[PY].ukOpts.slice(1)).map(o=>[o[0],o[1],PY]);
      story(G,PY,DK('2027-12-09'),25,[L[PY].uk].concat(zr?L[PY].ukZr:[]),'pool_hpy_uk',{ask:askOf('pool_hpy_uk',opts)}); segSent(G,PY,'uk','pool_hpy_uk'); }   /* 2027-12（英國下午五點＝臺灣凌晨一點，照時差）*/
    /* 施孟儒 */
    { const r=P.qRec(G,'PQ_SMR'); if(r&&r.state==='done'&&r.day0!=null&&G.day>=r.day0) story(G,MR,r.day0,12,L[MR].courtMsg,'pool_smr_msg'); }   /* 考完那天中午（分三則）*/
    { const d=DK('2027-12-11'); if(d!=null&&PHONE.inGroup(G,'noodle_team')&&knows(G,'zhe')&&P.met(G,MR)) atTW(G,d,21,L[MR].grp.map(t=>({th:'g:noodle_team',from:'zhe',text:t})),'pool_smr_grp'); }   /* 2027-12 麵店團，阿哲轉貼 */
    /* 廖芸萱 */
    { if(inTerm(G,'Y1S2')&&week(G)>=12&&week(G)<=15&&dateOf(G.day).wd===3&&fam(YX)&&contact(G,YX)&&!P.did(G,'lyxInvite'))   /* 3-3 週三 21:00 私訊 */
        if(story(G,YX,G.day,21,L[YX].invite,'pool_lyx_invite',{ask:askOf('pool_lyx_invite',[{t:L[YX].inviteOpts[0]},{t:L[YX].inviteOpts[1],say:[{from:YX,text:L[YX].inviteNo}]}],{until:(G.day+1)*24+18.5})})) P.mark(G,'lyxInvite'); }
    story(G,YX,DK('2028-04-12'),21,L[YX].y2028,'pool_lyx_2028'); segSent(G,YX,'y2028','pool_lyx_2028');
    /* 嚴守誠 */
    { if(inTerm(G,'Y1S1')&&week(G)>=14&&dateOf(G.day).wd===1&&P.met(G,YS)&&contact(G,YS)&&!P.did(G,'yscInvite'))   /* 4-3 週一 23:00 私訊 */
        if(story(G,YS,G.day,23,L[YS].invite,'pool_ysc_invite',{ask:askOf('pool_ysc_invite',[{t:L[YS].inviteOpts[0]},{t:L[YS].inviteOpts[1],say:[{from:YS,text:L[YS].inviteNo}]}],{until:G.day*24+23.75})})) P.mark(G,'yscInvite'); }
    { const d0=termDay('Y1S2',16,1); if(d0!=null&&F.YSC_RETURN) story(G,YS,d0-1,23,L[YS].ret,'pool_ysc_ret',{ask:askOf('pool_ysc_ret',[{t:L[YS].retOpts[0]},{t:L[YS].retOpts[1],say:[{from:YS,text:L[YS].retNo}]}],{until:(d0-1)*24+23.75})}); }   /* 4-4 大一下期末前一晚 */
    { story(G,YS,DK('2027-12-17'),20,L[YS].exam.concat(F.YSC_LISTENED?[L[YS].examListened]:[]),'pool_ysc_exam'); segSent(G,YS,'exam','pool_ysc_exam'); } };
  /* 手機的回覆 */
  Object.assign(P.ANSWER,{
    pool_hyx_y3:(G,m,o,k)=>{ const gm={G,toast:typeof GAME!=='undefined'&&GAME&&GAME.toast?GAME.toast:null}; if(k===0) S.acceptHyx2(gm); else P.declineQ(G,'PQ_HYX2'); },
    pool_jy_invite:(G,m,o,k)=>{ if(k===0) S.planRadio(G); },
    pool_yzy_ride_1:(G,m,o,k)=>{ const R=R_(G); if(k===0) S.planRide(G,nextWd(G,6)); else if(R.yzyRe==null) R.yzyRe=G.day+28; },
    pool_yzy_ride_re:(G,m,o,k)=>{ if(k===0) S.planRide(G,nextWd(G,6)); },
    pool_lyx_invite:(G,m,o,k)=>{ if(k===0) S.planCafe(G); },
    pool_ysc_invite:(G,m,o,k)=>{ if(k===0) S.planNight(G,'pool_ysc_night','ev_pool_ysc_night','嚴守誠：半夜的刑法讀書會（總圖 B1 23:00）'); },
    pool_ysc_ret:(G,m,o,k)=>{ if(k===0) S.planNight(G,'pool_ysc_listen','ev_pool_ysc_listen','嚴守誠：換你聽他講（總圖 B1 23:00）'); },
    pool_nw_sold:(G,m,o,k)=>{ P.seg(G,NW,'soldAns'); } });

  /* ---------- 互動點、房間物品 ---------- */
  P.POP.push((zoneId,GM,add,g)=>{ if(zoneId==='library') add({x:-2.4,z:0.6,radius:1.2,prio:0.4,lv:0,label:'看桌上的紙條',poolAct:'yscNote',get hidden(){ const G=g(); return !(G&&gradWk(G,'Y2S2')); }}); });   /* 4-5 守誠畢業那一週，總圖三樓那張桌子 */
  P.ACTS.yscNote=async(GM)=>{ await GM.say(null,L[YS].note); P.mark(GM.G,'yscNote'); };
  S.room=function(G,Lst){ const F=G.flags||{}, R=R_(G);
    if(R.nw&&R.nw.back==null) Lst.push(['乃文學姊的民總筆記',L[NW].noteLook]);   /* 借了還沒還 */
    if(F.NW_BOOK) Lst.push(['乃文學姊的借閱登記簿',L[NW].bookLook]);
    if(F.JR_HANDOVER) Lst.push(['法服的延長線',L[M].cordLook]);
    if(F.SMR_BOARD&&P.did(G,'smrGrad')) Lst.push(['系籃的記分板',L[MR].boardLook]);
    if(F.LYX_FORM) Lst.push(['芸萱學姊的轉系申請表',L[YX].formLook]); };

  /* ---------- 加在別人那裡的 ---------- */
  /* 柏翰（AA_499 5-3「我等一下有事。」）：之後多一句閒聊（大一下）*/
  P.TALK_OTHER.push(async(GM,who,id)=>{ const G=GM.G, R=R_(G); if(id!==BH||R.jrNo==null||R.bhCopier!=null||tid(G)!=='Y1S2') return false;
    R.bhCopier=G.day; await GM.say(who,L[M].bhCopier,{expr:'smile'}); if(typeof SOCIAL!=='undefined'&&SOCIAL.activity) SOCIAL.activity(BH,'chat'); return true; });
  /* 法服值班的旁白（AA_499 5-3、5-4）：值班開始以前偶爾一句（三次一句）*/
  if(typeof STORY!=='undefined'&&!STORY._poolFafu){ const w0=STORY.fafuWatch, s0=STORY.fafuShift;
    const extra=async(GM,shift)=>{ const G=GM.G, F=G.flags||{}, R=R_(G); let t=null;
      if(shift&&F.JR_HANDOVER){ R.cordN=(R.cordN|0)+1; if(R.cordN%3===1) t=L[M].cordDuty; }
      if(!t&&R.jrCopier!=null&&G.day>R.jrCopier){ R.copierN=(R.copierN|0)+1; if(R.copierN%3===1) t=L[M].copierDuty; }
      if(!t||!GM.say) return; GM.sceneBegin(); try{ await GM.say(null,t); } finally { GM.sceneEnd(); } };
    S.fafuExtra=extra;   /* 測試用 */
    if(typeof w0==='function') STORY.fafuWatch=async function(GM){ try{ if(GM&&GM.G&&STORY.fafuWatchable(GM.G)&&GM.G.hour<12&&law(GM.G)) await extra(GM,false); }catch(e){ console.warn('POOL_MORE fafu',e); } return w0.apply(this,arguments); };
    if(typeof s0==='function') STORY.fafuShift=async function(GM){ try{ if(GM&&GM.G&&STORY.fafuShiftable(GM.G)&&law(GM.G)) await extra(GM,true); }catch(e){ console.warn('POOL_MORE fafu',e); } return s0.apply(this,arguments); };
    STORY._poolFafu=true; }
  /* 大四下法律實習（AA_441；AA_499 4-5）：每週那一句之後，三次輪流多一句承恩（一學期三次：第 3、7、11 次出席起，那一天有旁白的第一次；認識承恩）*/
  S.PRACTICE_AT=[2,6,10,13];   /* 出席以前已經去過幾次；第四句（AA 9f2e2506e）＝認識曾靖雯、有她的聯絡方式才有（沒有就停在第三句，之後有了再出）*/
  S.practiceLine=function(G,it,line){ if(!it||!it.c||it.c.id!=='legal_practice'||!line||!P.met(G,SC)||!L[SC]) return null;
    const C=typeof CLS!=='undefined'&&typeof CLS.rec==='function'?CLS.rec(G):null, n=C&&C.attend?(C.attend.legal_practice|0):0, R=R_(G), k=R.sceP|0;
    if(k>=S.PRACTICE_AT.length||n<S.PRACTICE_AT[k]) return null; if(k===3&&!(P.met(G,ZJW)&&contact(G,ZJW))) return null; R.sceP=k+1; return L[SC].practice[k]; };
  if(typeof CLS!=='undefined'&&Array.isArray(CLS.OFFSITE_AFTER)&&!CLS._poolSce){ CLS.OFFSITE_AFTER.push((G,it,line)=>S.practiceLine(G,it,line)); CLS._poolSce=true; }
  /* 事件裡加的句子（成發、系籃、哲 3）*/
  const evById=id=>typeof STORY_EVENTS!=='undefined'?STORY_EVENTS.find(e=>e.id===id)||null:null;
  const metIf=id=>({custom:G=>typeof POOL!=='undefined'&&POOL.met(G,id)});
  S.patch=function(){ let n=0;
    /* 吉他社成發（大一下）：晏如在台下發餅乾（「全場笑」之後）；晨希在最後（「先走」的不在）*/
    { const e=evById('ev_ziqing_show'); if(e&&!e._pool){ const D=e.dialogue, i=D.findIndex(l=>l&&l.text==='（全場笑。）');
        if(i>=0) D.splice(i+1,0,{if:metIf(LY),speaker:null,text:L[LY].show1});
        const W=G=>POOL.met(G,CX)&&(G.flags||{}).ZQ_SHOW!=='half';
        D.push({if:{custom:G=>W(G)&&!!G.flags.YCX_BEAT},speaker:null,text:L[CX].show1Beat[0]},{if:{custom:G=>W(G)&&!!G.flags.YCX_BEAT},speaker:null,text:L[CX].show1Beat[1]},
          {if:{custom:G=>W(G)&&!G.flags.YCX_BEAT},speaker:null,text:L[CX].show1No}); e._pool=true; n++; } }
    /* 第二次成發（大二下）：晨希、晏如（最後）*/
    { const e=evById('ev_ziqing_show2'); if(e&&!e._pool){ const D=e.dialogue;
        D.push({if:{custom:G=>POOL.met(G,CX)&&!!G.flags.YCX_BEAT},speaker:null,text:L[CX].show2Beat},{if:{custom:G=>POOL.met(G,CX)&&!G.flags.YCX_BEAT},speaker:null,text:L[CX].show2No},
          {if:metIf(LY),speaker:null,text:L[LY].show2}); e._pool=true; n++; } }
    /* 系籃比賽三場（大一下、大二上、大二下）：選了以後孟儒多一句（同一個選項第二次選＝比讚）*/
    for(const id of ['ev_zhe_game_y1','ev_zhe_game_y2','ev_zhe_game_y2s2']){ const e=evById(id); if(!e||e._pool) continue; const D=e.dialogue, ci=D.findIndex(l=>l&&Array.isArray(l.choice));
      if(ci<0) continue; ['clap','score','water'].forEach((k,j)=>{ const c=D[ci].choice[j]; if(c) c.set=Object.assign({},c.set||{},{SMR_PICK:k}); });
      const ei=D.findIndex(l=>l&&l.label==='end'); if(ei<0) continue; D.splice(ei+1,0,{call:async(G,GM)=>S.gameLine(G,GM)}); e._pool=true; n++; }
    /* 大四下那一場：他已經畢業（旁白）；記分板（SMR_BOARD）＝「記分」的旁白換掉 */
    { const e=evById('ev_last_game_y4'); if(e&&!e._pool){ const D=e.dialogue, i=D.findIndex(l=>l&&l.speaker===null&&typeof l.text==='string'&&/^（新體育館/.test(l.text)); if(i>=0) D.splice(i+1,0,{speaker:null,text:L[MR].gameY4});
        const si=D.findIndex(l=>l&&l.label==='s'); if(si>=0&&D[si+1]&&D[si+1].text){ D[si+1]=Object.assign({},D[si+1],{unless:{flags:['SMR_BOARD']}}); D.splice(si+1,0,{if:{flags:['SMR_BOARD']},speaker:null,text:L[MR].boardGame}); }
        e._pool=true; n++; } }
    /* 哲 3（2027-09-10 當上隊長）：「交給阿哲吧。」＝阿哲多一句（選項前）*/
    { const e=evById('ev_zhe_captain'); if(e&&!e._pool){ const D=e.dialogue, ci=D.findIndex(l=>l&&Array.isArray(l.choice)); if(ci>=0){ D.splice(ci,0,{if:{flagIs:{SMR_TO:'zhe'}},speaker:'zhe',text:L[MR].zheCaptain}); e._pool=true; n++; } } }
    return n; };
  S.gameLine=async function(G,GM){ const k=(G.flags||{}).SMR_PICK; if(!k||!L[MR].game[k]) return; delete G.flags.SMR_PICK; const R=R_(G), used=Array.isArray(R.smrGame)?R.smrGame:(R.smrGame=[]);
    const who={name:typeof SOCIAL!=='undefined'?SOCIAL.displayName(MR):'施孟儒',charId:MR}, t=used.includes(k)?L[MR].gameAgain:L[MR].game[k]; used.push(k);
    if(/^（/.test(t)) await GM.say(null,t); else await GM.say(who,t); };
  S.patch();

  /* ---------- 接線 ---------- */
  if(typeof STORY!=='undefined'){ if(Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.phone(G)); if(Array.isArray(STORY.ROOM_EXTRA)) STORY.ROOM_EXTRA.push((G,Lst)=>S.room(G,Lst)); }
  return S;
})();
if(typeof window!=='undefined') window.POOL_MORE=POOL_MORE;
