/* ===== 寒暑假的空白日（AA_440，企劃線 718c06a30，修訂 edae49ca6；回 BB_303；第①級、D109；D99 第二優先「寒暑假系統」）=====
   台詞在 src/data/vacfill_events.js（VACFILL_LINES、VACFILL_EVENTS，照 AA_440 不改字）。這個檔只接線，不改 home3d.js／vac3d.js／econff3d.js 的檔案，掛在它們的掛勾或外面包一層：
   - STORY.PHONE_RULES：群組、私訊、手機提醒（PHONE.at，那一天一開始就排好；晚兩天以上才讀到的不補，同 twfill3d.js）；回覆記旗標 VF_*，出遊照旗標排（OUT.plan）。
   - HOME.STOPS：第 1～4 節法律系那幾年的每一件都是快轉會停的地方（AA_440 第 6 節）：訊息的時間、在家的小場景、3-4 摘要（18:30）。經濟系那年暑假是 ECONFF 的事件接事件：
     在家的事件（trigger home）、收到訊息、該出發的出遊本來就會停，不另外登記。
   - HOME.CARD_LINES：3-4 2/19 快轉停在 18:30 的日期卡下面那一行（住家裡／留宿舍兩版）。
   - 第 5 節摘要池：睡覺醒來（家裡的床＝HOME.sleep、宿舍的床＝story3d.js 的睡覺）都會跑 CLS.morning——外面包一層：醒來以後，這一天是放假、而且沒有任何一件事
     （快轉的停點 HOME.breakNext、今天演過的事件、一定要演的事件 HOME.mustEvs、出遊、當面約、今天的訊息）＝放一句（一個假期內照順序、用完從頭）。快轉（HOME.ffMenu）停下來的那一天不放（快轉自己有旁白）。
     放假第一天、人在國外（交換、假期出國的活動）、日本那一學期、日本路線住家裡那幾週（jp3d.js 自己的快轉）不放。2/19 醒來＝放 3-4 那一句（取代摘要池；放過了 18:30 不再停）。
   - 1-5 7/27 去學校走一走（10:00 在家醒來選「（去學校走一走）」）：15:00 一鍵到校門口（OUT goto），到了一句、走到霖澤館前面一句、走進穿堂就結束。經濟系休學在家的時候人在外面空下來 3 秒會自動回家（ECONFF.tick2）——
     這一段走路的期間外面包一層先不回家；走進穿堂（或過了那一天）以後照原本的。
   - 4 大四寒假 1/20 以安「我去。」：1/21～1/27 每天 9:00～17:00 她在總圖三樓（作息多一筆，照總圖的座位系統；不另外寫台詞）。
   存檔：G.vacfill＝{pool:{'Y1W:home':用了幾句}, wake:最後一次醒來放過的那一天, sum:{y3_0219:那一天}}；旗標 VF_*（回覆）。舊存檔沒有＝空的。
   測試：node tests/aa440_vacfill_unit.js */
'use strict';
const VACFILL=(function(){
  const S={};
  const X=typeof VACFILL_LINES!=='undefined'?VACFILL_LINES:null, U=typeof VACFILL_UI!=='undefined'?VACFILL_UI:{};
  if(!X) return S;
  const DK=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const T=(d,h)=>d*24+h, NOW=G=>T(G.day,G.hour);
  const law=G=>!!G&&(G.stage||'law')==='law', econ=G=>!!G&&G.stage==='econ';
  const Fl=G=>G.flags||(G.flags={});
  const wdOf=d=>typeof CALENDAR!=='undefined'?CALENDAR.dateOf(d).wd%7:((d%7)+7)%7;
  const inGrp=(G,g)=>typeof PHONE!=='undefined'&&!!PHONE.inGroup&&PHONE.inGroup(G,g);
  const met=id=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(id,'FIRST_MET');
  const atLeast=(id,st)=>{ if(typeof SOCIAL==='undefined'||!SOCIAL.STAGES||!met(id)) return false; const A=SOCIAL.STAGES; return A.indexOf(SOCIAL.stage(id))>=A.indexOf(st); };
  const dat=(G,id)=>Fl(G)['dating_'+id]===true;
  const south=G=>['sea','shop'].includes(Fl(G).E35_PLAN);   /* 7/10 約好 7/19 南下高雄（7/19～7/23 在高雄，econff3d.js 的字卡）*/
  const done=(G,id)=>!!(G.events&&G.events.done&&G.events.done[id]);
  const sent=(G,tag)=>typeof PHONE!=='undefined'&&PHONE.sent(G,tag);
  const arrived=(G,tag)=>(G.msgs||[]).some(m=>m&&m.tag===tag)||!!(G.phone&&(G.phone.cut||[]).includes(tag));   /* 已經送到手機（排著還沒送到的不算）*/
  const onDay=(G,d)=>d==null||d===G.day?G:Object.assign({},G,{day:d});
  const pres=(G,id,d)=>typeof STORY!=='undefined'&&STORY.presence?STORY.presence(id,onDay(G,d)):{here:true};
  const inTaipei=(G,id,d)=>{ const p=pres(G,id,d)||{}; return p.here!==false||p.kind==='taipei'||p.where==='taipei'; };   /* 子晴大四寒假在工作室＝here:false、在臺北（BB_303 第 3 節）*/
  const abroadOn=(G,d)=>(typeof STORY!=='undefined'&&!!STORY.abroad&&!!STORY.abroad(onDay(G,d)))||(typeof VAC!=='undefined'&&!!VAC.abroadOn&&!!VAC.abroadOn(G,d));
  const brk=G=>law(G)&&typeof HOME!=='undefined'&&HOME.lawBreak?HOME.lawBreak(G):null;
  const livesHome=G=>typeof HOME!=='undefined'&&((HOME.at&&HOME.at(G))||(HOME.breakMode&&HOME.breakMode(G)));
  S.rec=G=>{ if(!G.vacfill||typeof G.vacfill!=='object') G.vacfill={}; const R=G.vacfill; if(!R.pool||typeof R.pool!=='object') R.pool={}; if(!R.sum||typeof R.sum!=='object') R.sum={}; return R; };

  /* ===================== 手機 ===================== */
  const AN='heroine_01', YT='heroine_03', ZQ='heroine_04', SIS='heroine_05', KX='kexin';
  const NG='g:noodle_team', EG='g:econ_friends', HG='g:home';
  /* 手機上顯示的名字：家人不在 CHARACTERS（phone3d.js FAM_NM）；經濟系那一群照稿的叫法（同 story3d.js 的經濟系群組）*/
  const NAME={mom:'媽媽',dad:'爸爸',sister:'姊姊',econ_pinyu:'品妤',econ_tangrui:'唐睿',econ_zhengxun:'阿勳',econ_weilun:'韋綸'};
  const item=(th,from,text)=>{ if(from==null) return {th,who:null,text}; const o={th,from,text}; if(NAME[from]) o.name=NAME[from]; return o; };   /* from null＝對話串裡的一行旁白（同 r2y4a3d.js 姊姊那一行）*/
  const one=(who,arr)=>arr.map(t=>[who,t]);
  const contactOf=(G,id)=>{ if(typeof CHARACTERS==='undefined'||!CHARACTERS[id]||typeof INV==='undefined'||!INV.rec) return; INV.rec(G); if(G.contacts&&G.contacts[id]==null) G.contacts[id]=G.day; };
  const R7=d=>[d+1,18];   /* 沒寫期限的回覆：開到隔天 18:00（AA_340 R7，同 holff3d.js）*/
  /* 每一則：tag、day（或 dayFn）、h、th、ms（[[誰,字]] 或 fn(G,d)）、if(G,d)、ask(G,d)→{until:[日,時], opts:[{t,set,say:[[誰,字]],post}]}、stage（econ＝經濟系那年暑假）、
     stop（法律系那幾年的快轉停在這裡）、after(G)（排進去以後）、at（時間到了才判斷 if：住家裡／留宿舍那種要看當下）*/
  S.MSGS=[
    /* ---------- 第 1 節 經濟系那年暑假（2025）---------- */
    {tag:'vf_y0_0716',stage:'econ',day:'2025-07-16',h:21,th:EG,ms:X.y0_0716.ms,if:G=>inGrp(G,'econ_friends'),   /* 有加入「走啦」才收到（AA_157）*/
      ask:(d,G)=>({until:R7(d),opts:[south(G)?{t:X.y0_0716.away,set:{VF_Y0_0719:'away'},say:X.y0_0716.awaySay}:{t:X.y0_0716.yes,set:{VF_Y0_0719:'go'},say:X.y0_0716.yesSay},
        {t:X.y0_0716.no,set:{VF_Y0_0719:'no'},say:X.y0_0716.noSay}]})},   /* 7/19 南下高雄的（E35_PLAN sea／shop）：第一個選項換成「這週末不在臺北。」，不排 */
    {tag:'vf_y0_0722_sis',stage:'econ',day:'2025-07-22',h:21.5,th:'p:sister',ms:one('sister',X.y0_0722.sis),if:G=>!dat(G,KX),   /* 沒和可昕交往：姊姊（已經回台南）*/
      ask:d=>({until:R7(d),opts:[{t:X.y0_0722.sisOpt,say:[['sister',X.y0_0722.sisSay]]}]})},
    {tag:'vf_y0_0804',stage:'econ',day:'2025-08-04',h:21,th:EG,ms:X.y0_0804.ms,if:G=>inGrp(G,'econ_friends')},   /* 1-6 等放榜（不用回）*/
    {tag:'vf_y0_0813',stage:'econ',day:'2025-08-13',h:20.5,th:HG,ms:X.y0_0813.ms,join:true,if:G=>!!Fl(G).E36_RESULT},   /* 1-9 放榜（ev_y0_e36r／e36rh）演完以後；不用回 */
    {tag:'vf_y0_0817',stage:'econ',day:'2025-08-17',h:21,th:EG,ms:X.y0_0818.ms,if:G=>inGrp(G,'econ_friends'),   /* 1-10 餞行（7/19 一起吃過的照樣發）*/
      ask:()=>({until:[DK('2025-08-18'),18],opts:[{t:X.y0_0818.yes,set:{VF_Y0_0818:'go'}},{t:X.y0_0818.no,set:{VF_Y0_0818:'no'},say:X.y0_0818.noSay}]})},

    /* ---------- 第 2 節 大二暑假（2027）---------- */
    {tag:'vf_y2_0618',day:'2027-06-18',h:21,th:NG,ms:X.y2_0618.ms,stop:true,if:G=>inGrp(G,'noodle_team'),
      ask:d=>({until:R7(d),opts:X.y2_0618.opts.map((t,i)=>({t,say:i===2?X.y2_0618.lib:X.y2_0618.other}))})},
    {tag:'vf_y2_0623',day:'2027-06-23',h:15,th:'p:'+YT,ms:one(YT,X.y2_0623.ms),stop:true,if:(G,d)=>inTaipei(G,YT,d)&&atLeast(YT,'FAMILIAR'),contact:YT,
      ask:d=>({until:[d,17.5],opts:[{t:X.y2_0623.yes,set:{VF_Y2_0623:'go'}},{t:X.y2_0623.no,say:[[YT,X.y2_0623.noSay]]}]})},
    {tag:'vf_y2_0724',brk:'Y2S',dayFn:G=>S.anTcSat(G),h:21.5,th:'p:'+AN,ms:one(AN,X.y2_0724.ms),stop:true,if:(G,d)=>dat(G,AN)&&(pres(G,AN,d)||{}).kind==='home',contact:AN,   /* 交往中、她在台中家的第一個週六（出遊的那幾天不傳）*/
      ask:d=>({until:R7(d),opts:[{t:X.y2_0724.study,say:[[AN,X.y2_0724.studySay[0]],[null,X.y2_0724.studySay[1]],[AN,X.y2_0724.studySay[2]]]},
        {t:X.y2_0724.miss,set:{VF_Y2_0724:'miss'},say:one(AN,X.y2_0724.missSay)}]})},
    {tag:'vf_y2_0728',day:'2027-07-28',h:16,th:'p:'+SIS,ms:one(SIS,X.y2_0728.ms),stop:true,if:(G,d)=>inTaipei(G,SIS,d)&&atLeast(SIS,'FAMILIAR'),contact:SIS,
      ask:(d,G)=>({until:[d+1,12],opts:[{t:X.y2_0728.go,set:{VF_Y2_0729:'go'}},{t:X.y2_0728.thanks,say:[[SIS,X.y2_0728.thanksSay]]}].concat(dat(G,SIS)?[{t:X.y2_0728.find,set:{VF_Y2_0729:'find'}}]:[])})},   /* 和學姊交往中：多一個「我去找妳。」*/
    {tag:'vf_y2_0731',day:'2027-07-31',h:20,th:'p:'+ZQ,stop:true,if:(G,d)=>inTaipei(G,ZQ,d)&&atLeast(ZQ,'FAMILIAR'),contact:ZQ,
      ms:G=>one(ZQ,S.playtested(G)?[X.y2_0731.pt].concat(X.y2_0731.ms.slice(1)):X.y2_0731.ms),   /* 試玩過（PLAYTESTED）：第一則換成「新的那個 第二關做好了」*/
      ask:d=>({until:[d+1,13],opts:[{t:X.y2_0731.yes,set:{VF_Y2_0731:'go'},say:one(ZQ,X.y2_0731.yesSay)},{t:X.y2_0731.no,say:one(ZQ,X.y2_0731.noSay)}]})},
    {tag:'vf_y2_0804',day:'2027-08-04',h:21,th:NG,ms:X.y2_0804.ms,stop:true,if:G=>inGrp(G,'noodle_team'),   /* 參加香港那一團（VA10，AA_256）才回；沒參加的只看得到 */
      ask:(d,G)=>Fl(G).VA10==='yes'?{until:R7(d),opts:[{t:X.y2_0804.bought,say:X.y2_0804.boughtSay},{t:X.y2_0804.notyet,say:X.y2_0804.notyetSay}]}:null},

    /* ---------- 第 3 節 大三寒假（2028）---------- */
    {tag:'vf_y3_0204',day:'2028-02-04',h:17,th:'p:'+YT,ms:one(YT,X.y3_0204.ms),stop:true,if:(G,d)=>inTaipei(G,YT,d)&&atLeast(YT,'FAMILIAR'),contact:YT,
      ask:d=>({until:[d,18],opts:[{t:X.y3_0204.yes,set:{VF_Y3_0204:'go'}},{t:X.y3_0204.no,say:[[YT,X.y3_0204.noSay]]}]})},
    {tag:'vf_y3_0208',day:'2028-02-08',h:21,th:NG,stop:true,if:G=>inGrp(G,'noodle_team'),
      ms:(G,d)=>X.y3_0209.ms.filter(([w])=>w!=='zhe'||inTaipei(G,'zhe',d+1)),   /* 2/9 阿哲不在臺北（多半在高雄）：他的句子拿掉 */
      ask:d=>({until:[d+1,18],opts:[{t:X.y3_0209.yes,set:{VF_Y3_LANTERN:'go'}},{t:X.y3_0209.no,set:{VF_Y3_LANTERN:'no'}}]})},
    {tag:'vf_y3_0209_yt',day:'2028-02-09',h:21,th:NG,ms:[[YT,X.y3_0209.ytShop]],if:G=>inGrp(G,'noodle_team')&&met(YT)&&['go','went'].includes(Fl(G).VF_Y3_LANTERN)},   /* 去看燈的、認識語彤：她那天顧店 */
    {tag:'vf_y3_0209_miss',day:'2028-02-09',h:21.5,th:NG,ms:[['yu',U.photoLantern],['yu',X.y3_0209.missed]],if:G=>inGrp(G,'noodle_team')&&Fl(G).VF_Y3_LANTERN==='no'},
    {tag:'vf_y3_0212',day:'2028-02-12',h:14,th:'p:'+SIS,ms:one(SIS,X.y3_0212.ms),stop:true,if:(G,d)=>inTaipei(G,SIS,d)&&atLeast(SIS,'FAMILIAR')&&!dat(G,SIS),contact:SIS,   /* 和學姊交往中：不發（那週照情人節）*/
      ask:d=>({until:[d+2,8],opts:[{t:X.y3_0212.go,set:{VF_Y3_0214:'go'}}]})},

    /* ---------- 第 4 節 ---------- */
    /* 大一寒假 1/23 15:00 留宿舍：媽媽傳訊息（住家裡的是當面，VACFILL_EVENTS ev_vf_y1w_0123）*/
    {tag:'vf_y1w_0123',day:'2026-01-23',h:15,th:'p:mom',ms:[['mom',X.y1w_0123.mom]],at:true,
      if:(G,d)=>NOW(G)>=T(d,15)&&!livesHome(G)&&Fl(G).VF_Y1W_DIHUA_MODE!=='home'&&!done(G,'ev_vf_y1w_0123'),
      ask:d=>({until:[d+1,8],opts:[{t:X.y1w_0123.go,set:{VF_Y1W_DIHUA:'go'}}]}),after:G=>{ Fl(G).VF_Y1W_DIHUA_MODE='dm'; }},
    {tag:'vf_y1w_0127',day:'2026-01-27',h:21,th:HG,ms:X.y1w_0127.ms,stop:true,join:true,ask:d=>({until:R7(d),opts:[{t:X.y1w_0127.ok}]})},
    {tag:'vf_y1s_0624',day:'2026-06-24',h:21,th:'p:kai',ms:one('kai',X.y1s_0624.ms),stop:true,if:()=>met('kai'),
      ask:d=>({until:[d,23],opts:[{t:X.y1s_0624.yes,say:[['kai',X.y1s_0624.yesSay],[null,X.y1s_0624.narr]]}]})},   /* 不演，旁白一句（對話串裡）*/
    {tag:'vf_y1s_0803',day:'2026-08-03',h:21,th:'p:'+YT,ms:one(YT,X.y1s_0803.ms),stop:true,if:(G,d)=>inTaipei(G,YT,d)&&atLeast(YT,'FAMILIAR'),contact:YT,
      ask:d=>({until:[d+1,16],opts:[{t:X.y1s_0803.yes,set:{VF_Y1S_0803:'go'}}]})},
    {tag:'vf_y1s_0805',day:'2026-08-05',h:21.5,th:'p:'+AN,ms:one(AN,X.y1s_0805.ms),stop:true,if:(G,d)=>dat(G,AN)&&(pres(G,AN,d)||{}).kind==='home',contact:AN},   /* 交往中、她在台中（不用回）*/
    {tag:'vf_y2w_0114',day:'2027-01-14',h:21,th:NG,ms:X.y2w_0114.ms,stop:true,if:G=>inGrp(G,'noodle_team'),
      ask:d=>({until:[d+1,18],opts:[{t:X.y2w_0114.yes,set:{VF_Y2W_0114:'go'}}]})},
    {tag:'vf_y2w_0122',day:'2027-01-22',h:21,th:'p:sister',ms:one('sister',X.y2w_0122.ms),stop:true,ask:d=>({until:R7(d),opts:[{t:X.y2w_0122.no,say:[['sister',X.y2w_0122.noSay]]}]})},
    {tag:'vf_y2s_0708',day:'2027-07-08',h:21,th:HG,ms:[['dad',U.photoTyphoon]].concat(X.y2s_0708.ms),stop:true,join:true},   /* 不用回 */
    {tag:'vf_y3w_0106',day:'2028-01-06',h:21,th:'p:'+ZQ,ms:one(ZQ,X.y3w_0106.ms),stop:true,if:(G,d)=>met(ZQ)&&inTaipei(G,ZQ,d),contact:ZQ,
      ask:d=>({until:[d+2,13],opts:[{t:X.y3w_0106.yes,set:{VF_Y3W_0106:'go'}}]})},
    {tag:'vf_y3w_0115',day:'2028-01-15',h:21,th:'p:'+SIS,ms:one(SIS,X.y3w_0115.ms),stop:true,if:()=>atLeast(SIS,'FAMILIAR'),contact:SIS,
      ask:d=>({until:R7(d),opts:[{t:X.y3w_0115.yes,say:[[SIS,X.y3w_0115.yesSay]]}]})},
    {tag:'vf_y4w_0111',day:'2029-01-11',h:21,th:NG,ms:X.y4w_0111.ms,stop:true,if:G=>inGrp(G,'noodle_team')},
    {tag:'vf_y4w_0120',day:'2029-01-20',h:21,th:'p:'+AN,ms:one(AN,X.y4w_0120.ms),stop:true,if:(G,d)=>dat(G,AN)&&inTaipei(G,AN,d),contact:AN,
      ask:()=>({until:[DK('2029-01-27'),12],opts:[{t:X.y4w_0120.yes,set:{VF_Y4_AN_LIB:'go'}}]})},
    {tag:'vf_y4w_0127',day:'2029-01-27',h:21,th:HG,ms:X.y4w_0127.ms,stop:true,join:true} ];
  S.dayOf=(m,G)=>{ if(!m.dayFn) return DK(m.day); const B=brk(G); return B&&B.key===m.brk?m.dayFn(G):null; };   /* 照行程算日子的（2-2）：只在那個假期裡算 */
  /* 這一則現在成立嗎（stage、國外、條件）。d＝那一則的日子（人物在不在臺北照那一天算）*/
  S.gate=function(G,m,d){ if(m.stage==='econ'?!econ(G):!law(G)) return false; if(d==null) return false; if(!m.stage&&abroadOn(G,d)) return false;
    try{ return !m.if||!!m.if(G,d); }catch(e){ return false; } };
  S.send=function(G,m){ const d=S.dayOf(m,G); if(d==null||G.day<d||G.day>d+1||sent(G,m.tag)) return false; if(m.at&&NOW(G)<T(d,m.h)) return false; if(!S.gate(G,m,d)) return false;
    if(m.join&&typeof PHONE!=='undefined') PHONE.join(G,'home','家人'); if(m.contact) contactOf(G,m.contact);
    const ms=typeof m.ms==='function'?m.ms(G,d):m.ms; if(!ms||!ms.length) return false; const M=ms.map(([w,t])=>item(m.th,w,t));
    const a=m.ask?m.ask(d,G):null;
    if(a){ M[M.length-1].ask={id:m.tag,until:a.until?T(a.until[0],a.until[1]):null,opts:a.opts.map(o=>{ const q={t:o.t}; if(o.set) q.set=Object.assign({},o.set); if(o.post===false) q.post=false; q.say=(o.say||[]).map(([w,t])=>{ const x=item(m.th,w,t); delete x.th; return x; }); return q; })}; }
    PHONE.at(G,d,m.h,M,m.tag); if(m.after) m.after(G); return true; };
  /* 2-2 以安在台中家的第一個週六（她出遊的那幾天不算；BB_303 第 3 節：大二暑假 7/24～8/7 在台中、8/9～8/27 在京都）*/
  let satC=null;
  S.anTcSat=function(G){ const a=DK('2027-06-14'), b=DK('2027-09-05'); if(a==null||b==null) return null; const ck=G.day+':'+(dat(G,AN)?1:0); if(satC&&satC.G===G&&satC.k===ck) return satC.d;   /* 手機規則每 0.5 秒跑一次：同一天算一次就好 */
    let r=null; for(let d=a;d<=b;d++){ if(wdOf(d)!==6) continue; const p=pres(G,AN,d)||{}; if(p.kind==='home'){ r=d; break; } } satC={G,k:ck,d:r}; return r; };
  S.playtested=G=>(typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(ZQ,'PLAYTESTED'))||!!Fl(G).PLAYTESTED;

  /* ===================== 出遊（回覆了「去」的那幾件）===================== */
  const plan=(G,q)=>{ if(typeof OUT==='undefined'||!OUT.plan||OUT.get(G,q.id)) return false; return OUT.plan(G,q); };
  const NOODLE={zone:'noodle',x:0,z:3.4,yaw:Math.PI};   /* 「照麵店一般的吃飯」：一鍵到麵店（同 story3d.js 的 y3_cold_noodle）*/
  S.OUTS=[
    {flag:'VF_Y0_0719',v:['go'],stage:'econ',q:{id:'vf_y0_0719',ev:'ev_vf_y0_0719',day:'2025-07-19',h:19,late:0.5,place:'公館',title:'和經濟系那一群吃飯',travel:'捷運＋公車 約 30 分鐘',travelH:0.5}},
    {flag:'VF_Y0_0727',v:['go'],stage:'econ',q:{id:'vf_y0_0727',goto:{zone:'campus',x:-112,z:0,yaw:-Math.PI/2},day:'2025-07-27',h:15,late:0.75,place:'臺大校門口',title:'去學校走一走',travel:'捷運＋公車 約 30 分鐘',travelH:0.5}},
    {flag:'VF_Y0_0818',v:['go'],stage:'econ',q:{id:'vf_y0_0818',ev:'ev_vf_y0_0818',day:'2025-08-18',h:19,late:0.5,place:'公館',title:'和經濟系那一群吃飯',travel:'捷運＋公車 約 30 分鐘',travelH:0.5}},
    {flag:'VF_Y2_0623',v:['go'],q:{id:'vf_y2_0623',goto:NOODLE,day:'2027-06-23',h:18,late:0.75,place:'公館',title:'阿鳳麵店',travel:'走過去約 15 分鐘',travelH:0.25}},
    {flag:'VF_Y2_0729',v:['go','find'],q:{id:'vf_y2_0729',ev:'ev_vf_y2_0729',day:'2027-07-29',h:14,late:0.5,place:'法圖',title:'法圖',travel:'走過去約 10 分鐘',travelH:1/6}},
    {flag:'VF_Y2_0731',v:['go'],q:{id:'vf_y2_0801',ev:'ev_vf_y2_0801',day:'2027-08-01',h:15,late:0.5,place:'兩點半 Café',title:'兩點半 Café',travel:'走過去約 15 分鐘',travelH:0.25}},
    {flag:'VF_Y3_0204',v:['go'],q:{id:'vf_y3_0204',ev:'ev_vf_y3_0204',day:'2028-02-04',h:18.5,late:0.5,place:'公館',title:'阿鳳麵店',travel:'走過去約 15 分鐘',travelH:0.25}},
    {flag:'VF_Y3_LANTERN',v:['go'],q:{id:'vf_y3_0209',ev:'ev_vf_y3_0209',day:'2028-02-09',h:19,late:0.5,place:'元宵的燈會',title:'元宵的燈會',travel:'捷運 約 30 分鐘',travelH:0.5}},
    {flag:'VF_Y3_0214',v:['go'],q:{id:'vf_y3_0214',ev:'ev_vf_y3_0214',day:'2028-02-14',h:10,late:0.5,place:'法圖',title:'法圖',travel:'走過去約 10 分鐘',travelH:1/6}},
    {flag:'VF_Y1W_DIHUA',v:['go'],q:{id:'vf_y1w_0124',ev:'ev_vf_y1w_0124',day:'2026-01-24',h:10,late:0.5,place:'迪化街',title:'迪化街',travel:'捷運 約 40 分鐘',travelH:2/3}},
    {flag:'VF_Y1S_0803',v:['go'],q:{id:'vf_y1s_0804',goto:NOODLE,day:'2026-08-04',h:18,late:0.75,place:'公館',title:'阿鳳麵店',travel:'走過去約 15 分鐘',travelH:0.25}},
    {flag:'VF_Y2W_0114',v:['go'],q:{id:'vf_y2w_0116',ev:'ev_vf_y2w_0116',day:'2027-01-16',h:18,late:0.5,place:'公館',title:'阿鳳麵店',travel:'走過去約 15 分鐘',travelH:0.25}},
    {flag:'VF_Y3W_0106',v:['go'],q:{id:'vf_y3w_0108',ev:'ev_vf_y3w_0108',day:'2028-01-08',h:15,late:0.5,place:'參創',title:'參創',travel:'捷運 約 30 分鐘',travelH:0.5}} ];
  S.plans=function(G){ const F=Fl(G); for(const o of S.OUTS){ if(!o.v.includes(F[o.flag])) continue; if(o.stage==='econ'?!econ(G):!law(G)) continue; const d=DK(o.q.day); if(d==null||NOW(G)>=T(d,o.q.h+(o.q.late!=null?o.q.late:0.75))) continue;
      const q=Object.assign({},o.q,{day:d}); if(q.goto) q.goto=Object.assign({},q.goto); plan(G,q); } };
  /* 回覆以後的下一則：2-2「在想妳。」＝十點半那一張照片（對話串裡的旁白）*/
  S.follow=function(G){ const F=Fl(G);
    if(F.VF_Y2_0724==='miss'&&law(G)&&!sent(G,'vf_y2_0724_photo')){ const d=S.dayOf(S.MSGS.find(m=>m.tag==='vf_y2_0724'),G); if(d!=null&&G.day>=d&&G.day<=d+1) PHONE.at(G,d,Math.max(22.5,NOW(G)-T(d,0)),[item('p:'+AN,null,X.y2_0724.photo)],'vf_y2_0724_photo'); } };   /* 十點半以後才回的：回的那一刻 */
  S.phone=function(G){ if(!G||!G.flags||typeof PHONE==='undefined') return; if(!law(G)&&!econ(G)) return;
    for(const m of S.MSGS){ try{ S.send(G,m); }catch(e){ console.warn('VACFILL '+m.tag,e); } }
    try{ S.follow(G); S.plans(G); }catch(e){ console.warn('VACFILL plans',e); } };

  /* ===================== 快轉的停點（法律系那幾年；AA_440 第 6 節：第 1～4 節每一件都會停）===================== */
  S.Y3_0219='2028-02-19'; S.SUM_H=18.5;
  S.sumDue=G=>{ const B=brk(G); if(!B||B.key!=='Y3W') return null; const d=DK(S.Y3_0219); if(d==null||d<B.from||d>B.to||S.rec(G).sum.y3_0219!=null||abroadOn(G,d)) return null; return d; };
  S.stops=function(G,now){ const B=brk(G); if(!B) return null; const out=[], push=t=>{ if(t>now+1e-6) out.push(t); };
    for(const m of S.MSGS){ if(!m.stop||m.stage) continue; const d=S.dayOf(m,G); if(d==null||d<B.from||d>B.to||arrived(G,m.tag)) continue; if(sent(G,m.tag)||S.gate(G,m,d)) push(T(d,m.h)); }   /* 排好了、還沒送到的照樣停（快轉途中那一天一開始就排進去了）*/
    { const d=DK('2026-01-23'); if(d!=null&&d>=B.from&&d<=B.to&&!done(G,'ev_vf_y1w_0123')&&!arrived(G,'vf_y1w_0123')&&!abroadOn(G,d)) push(T(d,15)); }   /* 住家裡＝媽媽當面說、留宿舍＝私訊：都是 15:00 */
    { const d=DK('2026-08-28'); if(d!=null&&d>=B.from&&d<=B.to&&!done(G,'ev_vf_y1s_0828')&&livesHome(G)&&!abroadOn(G,d)) push(T(d,18)); }   /* 姊姊回家住兩天：住家裡的停在那天傍晚 */
    { const d=S.sumDue(G); if(d!=null) push(T(d,S.SUM_H)); }   /* 3-4 摘要 */
    return out; };
  /* 3-4 快轉停在 2/19 18:30：日期卡下面那一行（快轉的人在家＝住家裡那一句、宿舍的床＝留宿舍那一句）*/
  S.cardLine=function(G,t,o){ const d=S.sumDue(G); if(d==null||Math.abs(t-T(d,S.SUM_H))>1e-6) return null; return (o&&o.dorm)||!(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G))?X.y3_0219.dorm:X.y3_0219.home; };

  /* ===================== 第 5 節 摘要池：醒來的那一天沒有任何一件 ===================== */
  /* AA_533 5-2（企劃線 cf0066ed2）：不分假期，同一池（住家裡／留宿舍 × 寒假／暑假）接著上一次往下輪，輪完才從頭（原本 key 帶假期、每個假期從第 1 句重來）。
     計數 R.pool['*:'+place+':'+kind]；舊存檔沒有＝從舊的各假期計數（'Y1W:home' 一類，同一季的）加起來接下去 */
  S.poolNext=function(G,key,place,kind){ const P=((X.POOL||{})[place]||{})[kind]||[]; if(!P.length) return null; const R=S.rec(G), k='*:'+place+':'+kind;
    if(R.pool[k]==null){ let n0=0; const suf=kind==='winter'?'W':'S'; for(const q in R.pool){ const m=/^Y\d([WS]):(.+)$/.exec(q); if(m&&m[1]===suf&&m[2]===place) n0+=R.pool[q]|0; } R.pool[k]=n0; }
    const n=R.pool[k]|0; R.pool[k]=n+1; return P[n%P.length]; };
  S.poolSay=async function(GM,key,place,kind){ const l=S.poolNext(GM.G,key,place,kind); if(l) await GM.say(null,l); return l; };
  /* 這一天有沒有事：快轉的停點（表上的日子、成績、出遊、當面約、事件包的停點、這個檔的停點）、今天演過的事件、一定要演的事件、今天的出遊、當面約、今天的訊息（已經收到的、排好的）*/
  S.dayBusy=function(GM,day){ const G=GM.G, a=T(day,0), b=T(day+1,0);
    try{ if(typeof STORY!=='undefined'&&STORY.phoneRules) STORY.phoneRules(GM); }catch(e){ console.warn('VACFILL phoneRules',e); }   /* 今天的訊息先排進來 */
    if(typeof HOME!=='undefined'&&HOME.breakNext){ const nx=HOME.breakNext(G,a-1e-3); if(nx!=null&&nx<b) return 'stop'; }
    const L=(G.events&&G.events.last)||{}; for(const k in L) if(L[k]===day) return 'event';
    if(typeof HOME!=='undefined'&&HOME.mustEvs&&HOME.mustEvs(G).length) return 'must';
    if(typeof OUT!=='undefined'&&OUT.rec&&OUT.rec(G).some(q=>q&&q.day===day&&(q.state==='planned'||q.state==='done'))) return 'out';
    if(Array.isArray(G.invites)&&G.invites.some(iv=>iv&&iv.day===day&&(iv.state==='accepted'||iv.state==='offered'))) return 'inv';
    if(typeof PHONE!=='undefined'){ const P=PHONE.rec(G); if(P.q.some(q=>{ const t=T(q.day,q.h); return t>=a&&t<b; })) return 'msg';
      if((G.msgs||[]).some(m=>m&&m.from!=='player'&&T(m.day,m.h)>=a&&T(m.day,m.h)<b)) return 'msg'; }
    return null; };
  let ffDepth=0;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['vacfill3d:ffDepth']=()=>{ ffDepth=0; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
  S.wakePool=async function(GM){ const G=GM&&GM.G; if(!G||!G.flags||ffDepth>0) return null; const B=brk(G); if(!B) return null;
    const home=!!(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G)); if(!home&&G.zone!=='dorm') return null;   /* 家裡的床、宿舍的床（美國的公寓、公館的套房不算）*/
    if(abroadOn(G,G.day)||(typeof JP!=='undefined'&&((JP.inJapan&&JP.inJapan(G))||(JP.homeOn&&JP.homeOn(G))))) return null;   /* 日本路線住臺北的家那幾週是 jp3d.js 自己的快轉、摘要（同 holff3d.js 的 noJP）*/
    const R=S.rec(G); if(R.wake===G.day) return null; R.wake=G.day; const place=home?'home':'dorm';
    let line=null; const sd=S.sumDue(G); if(sd!=null&&sd===G.day){ line=X.y3_0219[place]; R.sum.y3_0219=G.day; }   /* 3-4 2/19 摘要 */
    else { if(G.day===B.from||S.dayBusy(GM,G.day)) return null; line=S.poolNext(G,B.key,place,B.kind); }
    if(!line) return null;
    if(GM.sceneBegin) GM.sceneBegin(); try{ await GM.say(null,line); } finally { if(GM.sceneEnd) GM.sceneEnd(); }
    return line; };

  /* ===================== 1-5 7/27 去學校走一走：走路的期間不自動回家 ===================== */
  S.walkOn=function(G){ if(!G||G.stage!=='econ') return false; const d=DK('2025-07-27'); if(d==null||G.day!==d) return false; const v=Fl(G).VF_Y0_0727;
    if(v==='walk'||v==='front') return true; if(v==='go'){ const q=typeof OUT!=='undefined'&&OUT.get?OUT.get(G,'vf_y0_0727'):null; return !!q&&q.state==='done'&&G.zone==='campus'; } return false; };
  S.PORTAL={x0:27,x1:41,z0:-121,z1:-103.5};   /* 霖澤館穿堂（CK.lawhall：中心 (34,-112)、深 18、穿堂寬 14；正面 z −103）*/
  S.walkTick=function(GM){ const G=GM&&GM.G; if(!G||G.stage!=='econ'||!G.flags) return false; const v=G.flags.VF_Y0_0727; if(v!=='walk'&&v!=='front') return false;
    if(G.day!==DK('2025-07-27')){ G.flags.VF_Y0_0727='done'; return false; }
    if(v==='front'){ if(G.zone==='linze'){ G.flags.VF_Y0_0727='done'; return false; } const p=G.zone==='campus'&&GM.E&&GM.E.player&&GM.E.player.obj&&GM.E.player.obj.position, P=S.PORTAL;
      if(p&&p.x>=P.x0&&p.x<=P.x1&&p.z>=P.z0&&p.z<=P.z1) G.flags.VF_Y0_0727='done'; }   /* 走進穿堂就結束（之後照校園一般的） */
    return false; };

  /* ===================== 4 大四寒假 1/20 以安「我去。」：之後一週每天在總圖三樓 ===================== */
  S.AN_LIB={days:[0,1,2,3,4,5,6],from:9,to:17,zone:'library',act:'read',dates:[['2029-01-21','2029-01-27']],if:{custom:G=>!!(G&&G.flags&&G.flags.VF_Y4_AN_LIB==='go')},note:'AA_440 第 4 節（大四寒假 1/20）：回了「我去。」的那一週她每天在總圖三樓（總圖寒假開到五點），照總圖的座位系統坐她對面'};
  S.schedule=function(){ const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[AN]; if(!c||!Array.isArray(c.daily_schedule)||c.daily_schedule.includes(S.AN_LIB)) return false;
    const L=c.daily_schedule; let i=L.findIndex(e=>e&&!e.dates&&!e.terms); if(i<0) i=L.length; L.splice(i,0,S.AN_LIB); return true; };   /* 放在一般作息前面（標了日期的特別作息照舊在最前面）*/

  /* ===================== 掛勾 ===================== */
  S.install=function(){
    if(typeof CLS!=='undefined'&&CLS.morning&&!CLS.morning._vacfill){ const m0=CLS.morning;
      CLS.morning=Object.assign(async function(GM){ const r=await m0.apply(this,arguments); try{ await S.wakePool(GM); }catch(e){ console.warn('VACFILL wakePool',e); } return r; },{_vacfill:true}); }
    if(typeof HOME!=='undefined'&&HOME.ffMenu&&!HOME.ffMenu._vacfill){ const f0=HOME.ffMenu;
      HOME.ffMenu=Object.assign(async function(){ ffDepth++; try{ return await f0.apply(this,arguments); } finally { ffDepth--; } },{_vacfill:true}); }
    if(typeof ECONFF!=='undefined'&&ECONFF.tick2&&!ECONFF.tick2._vacfill){ const t0=ECONFF.tick2;
      ECONFF.tick2=Object.assign(function(GM){ if(GM&&S.walkOn(GM.G)) return; return t0.apply(this,arguments); },{_vacfill:true}); }
    return true; };
  S.install(); S.schedule();
  S.tick=function(GM){ S.install(); return S.walkTick(GM); };
  if(typeof STORY!=='undefined'){
    if(Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.phone(G));
    if(Array.isArray(STORY.TICKS)) STORY.TICKS.push((GM,dt)=>S.tick(GM,dt)); }
  if(typeof HOME!=='undefined'){
    if(Array.isArray(HOME.STOPS)) HOME.STOPS.push((G,now)=>S.stops(G,now));
    if(Array.isArray(HOME.CARD_LINES)) HOME.CARD_LINES.push((G,t,o)=>S.cardLine(G,t,o)); }
  return S;
})();
