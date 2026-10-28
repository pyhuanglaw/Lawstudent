/* ===== 節日總規格（AA_416，企劃線 4f4da5ad；AA-B 2026-10-23 定稿，D109；D14-T11／USER_WANTS D38）：接線 =====
   台詞在 src/data/fest_events.js（FEST_DATA，照稿不改字）。這個檔：
   - 節日（1-1）：2/14、3/14、七夕（農曆，FEST_DATA.QIXI）、她的生日（msg2_pool.js 的日子）、12/24；子晴另外有跨年（12/31）。
   - 誰約得到（1-3）：三個情人節＝第 6 階（DATE.stageNum）或交往中；生日、聖誕、子晴的跨年＝第 5 階以上。學姊筆試（2026-02-02 17:00）以前不約；
     可昕只有交往中（分開以後不約，AA_351）；和可昕交往中，七夕只有可昕的（sis_qixi3d.js 的規則，1-3 的例子）。
   - 專屬場次優先（第 0 節）：表上 dedicated 的那一年、那一位（交往中）不演通用版；以安、語彤的 2/14 是 AA_414（src/an_yt_hol3d.js）。
   - 她在哪裡（1-5）：臺北＝約好的地點；老家（以安、芷若、沛珊台中，可昕高雄，沛珊 2027-08 以後台南）＝開車去（date3d.js 的地點表開車單程＋先回家取車 30 分，
     油錢＋過路費出發的時候付；一整天，佔兩場）或視訊（那一格有寫的）；國外、祐廷在國外＝視訊（第 2 節的時差：臺灣 21:00，那邊是半夜就改成那邊 21:00）。
     沛珊消失期（2026-12-17～2027-08-06）只有表上的電話（交往中）。
   - 一天最多兩場（1-2）：中午場 11:30～14:30、晚上場 18:00～21:30；一場一位、兩場不同的人；和別的約（邀約、出遊、校外約會）時間不能重疊（路程算進去）；
     開車去外縣市＝那一天只有一位。G.fest.bk 記這裡排的；別的系統排的出遊、邀約、校外約會照時間算。
   - 怎麼開始（1-4）：
     玩家約＝邀約選單多一項（S.flowOpt／S.ask；invites3d.js 要接一行，見檔尾）：選中午場或晚上場、選地點（Café、總圖、麵店、溫州街、半熟、一盞；
       可昕在政大＝公館）；那一格寫了地方的（芷若聖誕 Café、語彤生日麵店、沛珊白色情人節醉月湖、學姊七夕陽明山）只有那個地方。她照 AA_415 的「節日」句回答（INV.replyPick）。
       校外約會（date3d.js 的外出地點）約在她的節日：到了先演節日那一段（OUT.BEFORE）。
     她約（只有交往中、不是生日）＝前一天 21:00 還沒約她：她的私訊（第 3～9 節「她約」；以安、沛珊第一句照節日換）→「好。」排出遊、「那天不行。」她回一句。
       她不在臺北、那一格有視訊的（以安 2027 七夕、芷若 2029 情人節、沛珊 2027 情人節、可昕的七夕）＝那天她打來（臺灣 21:00）。
   - 那一場（1-6）：到了（或接起來）先演她的節日那一段，生日、聖誕接著是禮物（1-8：四樣＋「（沒有準備）」；錢照表扣、錢不夠的不能選；送過的不再列）。
   - 好感（1-7，不受每天上限）、記憶 HOL_<節日>_<年>（人物頁「<年> 的情人節，和她一起過」這類，social3d.js）。
   - 子晴的跨年：交往中＝頂樓的團體跨年演完接著演（OUT.AFTER；CG）；第 6 階＝約她跨年那一句，那晚頂樓有去才算一起過。
   - 芷若 2029 白色情人節（她在英國）：3/14 中午以後明信片（STORY.TICKS）、21:00 私訊；語彤第 6 階的白色情人節：12:00 她先傳兩則。
   存檔：G.fest＝{bk:[{d,who,k,y,slot,mode,ref}], done:{'人物:節日:年':'meet'|'video'}, gifts:{人物:[禮物 id]}, miss:{}}（新欄位，舊存檔沒有＝空的）。
   測試：node tests/aa416_fest_unit.js */
'use strict';
const FEST=(function(){
  const S={}, X=typeof FEST_DATA!=='undefined'?FEST_DATA:{PEOPLE:{},NAMES:{},QIXI:{},BDAY:{},MIN:{},REL:{},CITY:{}};
  const HER=Object.keys(X.PEOPLE);
  const D=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const T=(d,h)=>d*24+h, now=G=>G.day*24+(+G.hour||0);
  const law=G=>!!G&&!!G.flags&&(G.stage||'law')==='law';
  const romR=(G,id)=>((G&&G.flags&&G.flags.romance)||{})[id]||null;
  const dating=(G,id)=>{ const F=(G&&G.flags)||{}, R=romR(G,id); return F['dating_'+id]===true||!!(R&&R.status==='dating'); };
  const stageNum=id=>typeof DATE!=='undefined'&&DATE.stageNum?DATE.stageNum(id):0;
  const pres=(G,id,day)=>typeof STORY!=='undefined'&&STORY.presence?STORY.presence(id,day==null?G:Object.assign({},G,{day})):{here:true};
  const abroadMe=(G,day)=>typeof STORY!=='undefined'&&!!STORY.abroad&&STORY.abroad(day==null?G:Object.assign({},G,{day}));
  const route=G=>typeof STORY!=='undefined'&&STORY.route?STORY.route(G):null;
  const contact=(G,id,day)=>{ if(typeof INV==='undefined'||!INV.hasContact||!INV.hasContact(G,id)) return false; const c=G.contacts&&G.contacts[id]; return c==null||c<day; };
  const sent=(G,tag)=>typeof PHONE!=='undefined'&&PHONE.sent(G,tag);
  const dm=id=>t=>({th:'p:'+id,from:id,text:t});
  const nm=id=>typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(id):id;
  const ymd=day=>typeof CALENDAR!=='undefined'&&CALENDAR.dateOf?CALENDAR.dateOf(day):null;
  const yrOf=day=>{ const d=ymd(day); return d?d.y:null; };
  const hm=h=>typeof INV!=='undefined'&&INV.hhmm?INV.hhmm(h):String(h);
  const WD='日一二三四五六';
  const dLabel=day=>{ const d=ymd(day); return d?d.m+'/'+d.d+'（'+WD[d.wd%7]+'）':''; };
  const evOf=id=>typeof STORY_EVENTS!=='undefined'?STORY_EVENTS.find(e=>e.id===id)||null:null;
  const runLines=async(lines,id)=>{ if(typeof EVENTS!=='undefined'&&EVENTS.runLines) await EVENTS.runLines(lines,{id:'fest_'+id,participants:[id]}); };
  const LOVE=['vday','white','qixi'];
  const TAG={vday:'VDAY',white:'WHITE',qixi:'QIXI',bday:'BDAY',xmas:'XMAS',nye:'NYE'};
  S.name=k=>X.NAMES[k]||'節日';
  S.rec=G=>{ const R=G.fest&&typeof G.fest==='object'?G.fest:(G.fest={}); if(!Array.isArray(R.bk)) R.bk=[]; for(const k of ['done','gifts','miss']) if(!R[k]||typeof R[k]!=='object') R[k]={}; return R; };
  S.dating=dating;

  /* ---------------- 1-1 日子 ---------------- */
  S.YEARS={vday:[2026,2027,2028,2029],white:[2026,2027,2028,2029],qixi:[2026,2027,2028,2029],bday:[2026,2027,2028,2029],xmas:[2025,2026,2027,2028],nye:[2025,2026,2027,2028]};
  S.cell=(id,k)=>((X.PEOPLE[id]||{}).fest||{})[k]||null;
  S.dayOf=function(id,k,y){ const md={vday:'02-14',white:'03-14',xmas:'12-24',nye:'12-31'}[k];
    if(md) return D(y+'-'+md); if(k==='qixi') return X.QIXI[y]?D(X.QIXI[y]):null; if(k==='bday') return X.BDAY[id]?D(y+'-'+X.BDAY[id]):null; return null; };
  S.years=(id,k)=>{ const c=S.cell(id,k); return (c&&c.years)||S.YEARS[k]||[]; };
  /* 那一天是她的哪幾個節日（有寫通用版的）*/
  S.festsOn=function(id,day){ const y=yrOf(day), out=[]; if(y==null) return out; const P=X.PEOPLE[id]; if(!P) return out;
    for(const k of Object.keys(P.fest||{})){ if(!S.years(id,k).includes(y)) continue; const d=S.dayOf(id,k,y); if(d===day) out.push({id,k,y,d}); } return out; };

  /* ---------------- 1-3 誰約得到、第 0 節專屬場次 ---------------- */
  S.level=(G,id)=>dating(G,id)?7:(typeof INV!=='undefined'&&INV.capStage?INV.capStage(G,id,stageNum(id)):stageNum(id));   /* 分開以後一個學期（AA_434 4-3，INV.cool）：照朋友階段——她不約（herAsks 只給交往中，語彤第 6 階的中午那兩則、芷若 2029 的明信片也不發），你約她照第 1～4 階（節日要第 5／6 階：婉拒）*/
  /* 關係階段以外的限制（約不到＝邀約清單不列「約她過節」，BB 10-23：學姊 2025 聖誕列出來、選了才婉拒）：''＝沒有限制。
     關係階段還不到（第 6 階／第 5 階）照 1-3 的表：清單照列、選了她回 AA_415 的「節日」婉拒句（S.ask）*/
  S.barred=function(G,id,k,y){ if(!law(G)) return 'law'; const P=X.PEOPLE[id]; if(!P) return 'who'; const F=G.flags||{};
    if(P.datingOnly&&(!dating(G,id)||F['EX_'+id])) return 'datingOnly';   /* 可昕：只有交往中 */
    if(id==='heroine_05'){ const e=D('2026-02-02'), d=S.dayOf(id,k,y); if(e!=null&&d!=null&&d<e) return 'preexam'; }   /* 學姊筆試以前不約節日 */
    if(k==='qixi'&&id!=='kexin'&&dating(G,'kexin')) return 'kexinQixi';   /* 和可昕交往中，七夕只有可昕的 */
    return ''; };
  S.eligible=function(G,id,k,y){ if(S.barred(G,id,k,y)) return false; return S.level(G,id)>=(X.MIN[k]||6); };
  S.dedicated=function(G,id,k,y){ const c=S.cell(id,k); if(!c||c.aa414) return true; const dd=c.dedicated||{};
    if(id==='kexin'&&k==='qixi'&&typeof R2Y3A!=='undefined'&&Array.isArray(R2Y3A.QIXI)&&R2Y3A.QIXI.some(x=>String(x.key).slice(0,4)===String(y)&&(!x.ok||x.ok(G)))) return true;   /* 可昕交往中的七夕視訊 2026、2028（還有 2027 沒去高雄的）在 r2y3a3d.js S.qixiPhone：這裡不再自動打一通（BB-B 10-23：8/19 兩通 21:00 視訊）*/
    if(dd.all&&dd.all.includes(y)) return true; if(dd.dt&&dd.dt.includes(y)&&dating(G,id)) return true; return false; };
  S.ver=function(G,id,k){ if(dating(G,id)) return 'dt'; const c=S.cell(id,k)||{}; return c.s5&&stageNum(id)===5?'s5':'s6'; };
  S.cellLines=function(c,ver){ if(!c) return null; if(ver==='dt') return c.dt||c.s6||null; if(ver==='s5') return c.s5||c.s6||null; return c.s6||null; };
  S.vidOk=function(G,id,c,y){ const v=c&&c.vid; if(!v) return false; if(v.years&&!v.years.includes(y)) return false; if(v.route&&route(G)!==v.route) return false; if(v.dtOnly&&!dating(G,id)) return false; return true; };

  /* ---------------- 1-5 她在哪裡 ---------------- */
  S.inBlackout=(id,day)=>{ const B=(X.PEOPLE[id]||{}).blackout; if(!B) return false; const a=D(B[0]), b=D(B[1]); return a!=null&&b!=null&&day>=a&&day<b; };
  /* {mode:'taipei'|'home'|'abroad'|'phone', city, fixed}；null＝那天聯絡不到、不演 */
  S.where=function(G,id,k,y,day){ const c=S.cell(id,k)||{};
    if(abroadMe(G,day)) return c.abroadDedicated?null:{mode:'abroad'};   /* 祐廷在國外：視訊 */
    if(S.inBlackout(id,day)) return dating(G,id)?{mode:'phone'}:null;   /* 沛珊消失期：只有電話（交往中）*/
    if(c.taipei&&c.taipei.includes(y)) return {mode:'taipei'};   /* 可昕 2025 聖誕：她從政大下來 */
    if(c.fixed&&c.fixed[y]) return {mode:'taipei',fixed:c.fixed[y]};   /* 沛珊 2026 白色情人節：醉月湖邊 */
    if(c.homeYears&&c.homeYears[y]) return {mode:'home',city:c.homeYears[y]};   /* 稿寫了她那天在老家（以安 2027 七夕在台中、可昕 2029 七夕在高雄）*/
    const p=pres(G,id,day)||{here:true}; if(p.lost) return null;
    if(p.here||p.kind==='taipei') return {mode:'taipei'};
    if(p.kind==='home'||p.kind==='trip'||p.kind==='city'){ const city=p.city||p.home||(/台中|台南|高雄/.exec(String(p.away||''))||[])[0]||((X.PEOPLE[id]||{}).home||{}).city; return city&&X.CITY[city]?{mode:'home',city}:null; }   /* 週末回台中（trip）沒寫城市＝照 away 的字、她的老家 */
    if(p.kind==='abroad'||p.kind==='absent') return c.abroadDedicated?null:{mode:'abroad',her:true};
    return null; };
  /* 那一場這一天演得到（不看關係）：有通用版、這一年、那一種見法有台詞 */
  S.applies=function(G,id,k,y,day){ const c=S.cell(id,k); if(!c||S.dedicated(G,id,k,y)||!S.years(id,k).includes(y)) return null; const W=S.where(G,id,k,y,day); if(!W) return null;
    const ver=S.ver(G,id,k), inPerson=!!S.cellLines(c,ver), vid=S.vidOk(G,id,c,y);
    if(W.mode==='taipei'&&inPerson) return W; if(W.mode==='home'&&(inPerson||vid)) return W; if((W.mode==='abroad'||W.mode==='phone')&&vid) return W; return null; };

  /* ---------------- 第 2 節 時差 ---------------- */
  const lastSun=(y,m)=>{ for(let d=31;d>=22;d--){ const day=D(y+'-'+String(m).padStart(2,'0')+'-'+String(d).padStart(2,'0')); const x=day!=null?ymd(day):null; if(x&&x.m===m&&x.wd%7===0) return day; } return null; };
  /* 她那邊比臺灣（小時）：英國 3 月最後一個週日起到 10 月最後一個週日 −7、其他 −8；美國 11 月第一個週日以前 −12、以後 −13；日本 +1 */
  S.herOff=function(G,id,day){ const p=pres(G,id,day)||{}; if(p.here||!(p.kind==='abroad'||p.kind==='absent')) return 0; const a=String(p.away||''), y=yrOf(day);
    if(/英國|倫敦/.test(a)){ const s=lastSun(y,3), e=lastSun(y,10); return s!=null&&e!=null&&day>=s&&day<e?-7:-8; }
    if(/美國/.test(a)){ let fs=null; for(let d=1;d<=7&&fs==null;d++){ const x=D(y+'-11-0'+d); if(x!=null&&ymd(x).wd%7===0) fs=x; } return fs!=null&&day>=fs?-13:-12; }
    if(/日本/.test(a)) return 1; return 0; };
  /* 視訊的時間（玩家手機上的時間）：臺灣 21:00；她那邊是半夜（23:00～07:00）就改成她那邊的 21:00；祐廷在國外照 STORY.tzOffset */
  S.videoH=function(G,id,day){ const off=S.herOff(G,id,day); let tw=21; const loc=tw+off; if(loc>=23||loc<7) tw=21-off;
    const me=typeof STORY!=='undefined'&&STORY.tzOffset?STORY.tzOffset(G,day):0; return tw+me; };

  /* ---------------- 1-2 一天最多兩場 ---------------- */
  S.SLOT={noon:[11.5,14.5],eve:[18,21.5]}; S.TIME={noon:12,eve:18.5};
  S.slotOf=h=>{ for(const k in S.SLOT){ const [a,b]=S.SLOT[k]; if(h>=a-1e-6&&h<b) return k; } return null; };
  S.bookedWith=(G,id,day)=>S.rec(G).bk.find(b=>b.d===day&&b.who===id)||null;
  /* 那一天已經佔掉的時間（小時；別的系統排的也算）：[{a,b,who,ref}] */
  const liveIv=iv=>iv.state==='accepted'||iv.state==='going'||iv.state==='done';
  S.windows=function(G,day){ const W=[];
    for(const iv of (G.invites||[])){ if(iv.day!==day||!liveIv(iv)) continue; const P=typeof INV!=='undefined'&&INV.place?INV.place(iv.place):null; W.push({a:iv.h-0.25,b:iv.h+((P&&P.stay)||1)+0.25,who:iv.who,ref:iv.id}); }
    for(const q of (G.outings||[])){ if(q.day!==day||q.state==='missed'||q.dateTrip) continue; const ev=evOf(q.ev), fx=q.fest||{};
      const hrs=fx.after!=null?fx.after:((ev&&ev.hours)||2); W.push({a:fx.day?0:q.h-(q.travelH||0),b:fx.day?24:q.h+hrs,who:(ev&&ev.participants&&ev.participants[0])||null,ref:q.id}); }
    for(const t of (G.trips||[])){ if(!(t.status==='booked'||t.status==='going'||t.status==='done')||typeof DATE==='undefined'||!DATE.spanOf) continue; const [x,y]=DATE.spanOf(t); if(x<(day+1)*24&&y>day*24) W.push({a:x-day*24,b:y-day*24,who:t.who,ref:t.trip}); }
    return W; };
  /* 這一場可不可以排：{ok, why} */
  S.slotOk=function(G,day,slot,who,win){ const R=S.rec(G), B=R.bk.filter(b=>b.d===day);
    if(B.some(b=>b.who===who)) return {ok:false,why:'那天已經和'+nm(who)+'約好了'};   /* 兩場要是不同的人 */
    if(B.some(b=>b.slot==='day')) return {ok:false,why:'那天已經排了開車去外縣市'};
    if(slot==='day'&&B.length) return {ok:false,why:'那天已經約了'+B.map(b=>nm(b.who)).join('、')};
    const same=B.find(b=>b.slot===slot); if(same) return {ok:false,why:(slot==='noon'?'中午場':'晚上場')+'已經約了'+nm(same.who)};
    const hit=S.windows(G,day).find(w=>w.a<win[1]&&win[0]<w.b); if(hit) return {ok:false,why:'那段時間已經有別的約了'};
    return {ok:true}; };
  S.book=function(G,o){ const R=S.rec(G); R.bk.push({d:o.d,who:o.who,k:o.k,y:o.y,slot:o.slot,mode:o.mode,ref:o.ref||null}); if(R.bk.length>80) R.bk.splice(0,R.bk.length-80); };

  /* ---------------- 開車（date3d.js 的算法）---------------- */
  const hmText=m=>{ const h=Math.floor(m/60), r=m%60; return (h?h+' 小時':'')+(h&&r?' ':'')+(r?r+' 分鐘':''); };
  /* 出發地（DATE-C7、AA_128 4-1、11-1）：寒暑假住臺北的家（車就在家裡）＝不加回家取車、還車的 30 分（DATE.fromHomeOn）；學期中從宿舍出發照舊去回各多 30 分 */
  S.drive=function(loc,city,G,day){ const tr=typeof DATE!=='undefined'&&DATE.travel?DATE.travel(loc,'car'):null; const min=tr&&tr.mode==='car'?tr.minutes:(loc==='D15'?40:150), fare=tr&&tr.mode==='car'?tr.fare:(loc==='D15'?150:900);
    const home=!!G&&day!=null&&typeof DATE!=='undefined'&&!!DATE.fromHomeOn&&DATE.fromHomeOn(G,day), pick=home?0:0.5;
    return {travelH:min/60+pick,travel:(home?'':'回家取車約 30 分鐘，再')+'開車到'+city+'約 '+hmText(min),fare,backH:min/60+pick,home}; };

  /* ---------------- 出遊（OUT）---------------- */
  const outId=(f,mode)=>'fest_'+f.id+'_'+f.k+'_'+f.y+(mode?'_'+mode:'');
  const plan=(G,o)=>typeof OUT!=='undefined'&&OUT.plan&&!OUT.get(G,o.id)?OUT.plan(G,Object.assign({alarm:true,ev:'ev_fest_'+o.fest.id},o)):false;
  /* 臺北的那一場（她約的地方、可昕的公館、沛珊的醉月湖）*/
  S.plan2D=function(G,f,o){ const h=o.h, slot=S.slotOf(h)||'eve', end=S.SLOT[slot]?S.SLOT[slot][1]:h+2, after=Math.max(1,Math.min(2,end-h));
    const q={id:outId(f),day:f.d,h,late:0.25,place:o.place,title:S.name(f.k)+'（'+o.place+'）',travel:o.travel||'走路約 15 分鐘',travelH:o.travelH!=null?o.travelH:0.25,
      fest:{id:f.id,k:f.k,y:f.y,mode:'meet',scene:o.place,bg:o.bg||'dark',after,slot}};
    if(plan(G,q)){ S.book(G,{d:f.d,who:f.id,k:f.k,y:f.y,slot,mode:'meet',ref:q.id}); return q; } return null; };
  /* 開車去她的城市（一整天）或陽明山（晚上場）*/
  S.planDrive=function(G,f,o){ const c=S.cell(f.id,f.k)||{}, P=X.PEOPLE[f.id]||{}, city=o.city, loc=o.loc||X.CITY[city], dr=S.drive(loc,city,G,f.d), day=!o.eve;
    const bg=o.bg||((P.fixedBg||{})[f.k]||{})[city]||(c.tripBg)||((P.homeBy||{})[city])||(P.home&&P.home.city===city?P.home.bg:null)||'dark';
    const h=o.h!=null?o.h:(c.tripH!=null?c.tripH:(day?12:19)), stay=day?(h>=18?2:3):2;
    const q={id:outId(f),day:f.d,h,late:0.5,place:city,title:S.name(f.k)+(day?'（開車去'+city+'找'+nm(f.id)+'）':'（開車上'+city+'）'),travel:dr.travel,travelH:dr.travelH,back:day?'回到臺北。':undefined,
      fest:{id:f.id,k:f.k,y:f.y,mode:'meet',scene:city,bg,after:stay+dr.backH,fare:dr.fare,day,slot:day?'day':'eve'}};
    if(plan(G,q)){ S.book(G,{d:f.d,who:f.id,k:f.k,y:f.y,slot:day?'day':'eve',mode:'meet',ref:q.id}); return q; } return null; };
  /* 視訊、電話（不算外出、不扣錢）：her＝她打來 */
  S.planVideo=function(G,f,her){ const c=S.cell(f.id,f.k)||{}, v=c.vid||{}, h=S.videoH(G,f.id,f.d), call=!!v.call, nmH=nm(f.id);
    const q={id:outId(f,'video'),day:f.d,h,late:0.25,place:call?'電話':'視訊',verb:her?'接起來':(call?'打給她':'打視訊給她'),no:her?'先不接':'不打了',
      title:her?nmH+(call?'打電話來':'打視訊來'):(call?'打電話給':'和')+nmH+(call?'':'視訊')+'（'+S.name(f.k)+'）',call:true,travel:'',travelH:0,back:call?'電話掛了。':'視訊結束。',
      fest:{id:f.id,k:f.k,y:f.y,mode:'video',scene:call?'電話':'視訊',bg:call?undefined:'video',after:0.5,slot:'eve',her:!!her}};
    if(plan(G,q)){ S.book(G,{d:f.d,who:f.id,k:f.k,y:f.y,slot:'eve',mode:'video',ref:q.id}); return q; } return null; };
  S._q=null;
  S.before=function(G,GM,q){ S._q=q; const fx=q&&q.fest; if(fx&&fx.fare&&!q.paid){ q.paid=true; if(GM&&GM.money) GM.money(-fx.fare,'交通'); } };   /* 油錢：出發的時候付（讀檔重演不再扣）*/
  S.playOut=async function(GM){ const q=S._q, fx=q&&q.fest; if(!fx) return false; return S.play(GM,{id:fx.id,k:fx.k,y:fx.y,mode:fx.mode,scene:fx.scene,bg:fx.bg}); };
  S.missed=function(G,q){ const fx=q&&q.fest; if(!fx) return; S.rec(G).miss[fx.id+':'+fx.k+':'+fx.y]='missed'; };

  /* ---------------- 1-6 那一場：她的節日那一段 → 禮物 ---------------- */
  S.play=async function(GM,c){ const G=GM.G, R=S.rec(G), key=c.id+':'+c.k+':'+c.y; if(R.done[key]) return false; const cell=S.cell(c.id,c.k); if(!cell) return false;
    const dt=dating(G,c.id), video=c.mode==='video', L=video?(cell.vid&&cell.vid.lines):S.cellLines(cell,S.ver(G,c.id,c.k)); if(!L) return false;
    R.done[key]=video?'video':'meet';   /* 先記：演到一半出錯也不會每次重來 */
    const head=c.scene!==undefined?[c.bg!==undefined?{scene:c.scene,bg:c.bg}:{scene:c.scene}]:[];
    await runLines(head.concat(L),c.id);
    S.reward(G,c.id,c.k,c.y,video?'video':(dt?'dt':'s6'));
    if((c.k==='bday'||c.k==='xmas')&&!video) await S.gift(GM,c.id,c.k,c.y);
    return true; };
  S.reward=function(G,id,k,y,how){ const Rl=X.REL||{}, rel=how==='video'?Rl.video:(LOVE.includes(k)?(how==='dt'?Rl.loveDt:Rl.loveS6):Rl.day);
    const tag='HOL_'+TAG[k]+'_'+y; if(typeof SOCIAL!=='undefined'){ if(rel&&SOCIAL.adjust) SOCIAL.adjust(id,rel); if(SOCIAL.remember) SOCIAL.remember(id,tag,''); }
    if(how==='dt'&&LOVE.includes(k)) S.crackDown(G,id); };
  /* 情人節（交往中）：這學期的裂縫計數 -1（AA_126；已經是 0 就不動）*/
  S.crackDown=function(G,id){ const k=(typeof ROM!=='undefined'&&ROM.CRACK&&ROM.CRACK[id])||null; if(!k||!G||!G.flags||!((+G.flags[k]||0)>0)) return 0;
    if(ROM.crack) ROM.crack(G,id,-1); else G.flags[k]=(+G.flags[k]||0)-1; return -1; };
  /* 1-8 禮物（生日、聖誕）*/
  S.giftList=function(G,id){ const P=X.PEOPLE[id]||{}, given=S.rec(G).gifts[id]||[]; return (P.gifts||[]).filter(g=>!given.includes(g.id)&&(!g.cond||g.cond(G))); };
  S.gift=async function(GM,id,k,y){ const G=GM.G, P=X.PEOPLE[id]||{}; if(!P.gifts) return null;
    if(id==='heroine_05'&&k==='xmas'&&y===2025&&typeof FAMXMAS!=='undefined'&&FAMXMAS.gave&&FAMXMAS.gave(G)) return null;   /* AA_406：家族的那一份算那一年的聖誕禮物 */
    for(let guard=0;guard<10;guard++){ const L=S.giftList(G,id), opts=L.map(g=>({t:g.name,hint:g.price?g.price+' 元':'',dim:(G.money|0)<g.price})).concat([{t:'（沒有準備）'}]);
      const i=await GM.choose(opts); if(i>=L.length||i<0){ await runLines((P.noneBy&&P.noneBy[k])||P.none||[],id); return 'none'; }   /* 不扣分 */
      const g=L[i]; if((G.money|0)<g.price){ await GM.say(null,'錢不夠。'); continue; }
      if(g.price&&GM.money) GM.money(-g.price,'禮物'); const R=S.rec(G); (R.gifts[id]||(R.gifts[id]=[])).push(g.id);
      await runLines(g.lines,id); if(typeof SOCIAL!=='undefined'&&SOCIAL.adjust) SOCIAL.adjust(id,g.ok?X.REL.giftOk:X.REL.giftNo); return g.id; }
    return null; };

  /* ---------------- 1-4 ①玩家約：邀約選單的一項 ---------------- */
  /* 今天、明天是她的節日、有通用版的（{id,k,y,d,W}）*/
  S.askable=function(G,id){ if(!law(G)||!X.PEOPLE[id]) return []; const out=[];
    for(const day of [G.day,G.day+1]) for(const f of S.festsOn(id,day)){ if(f.k==='nye'&&dating(G,id)) continue; if(S.barred(G,id,f.k,f.y)) continue; const W=S.applies(G,id,f.k,f.y,f.d); if(!W) continue;
      if(day===G.day&&(G.hour%24)>=21.5&&f.k!=='nye') continue; out.push(Object.assign({W},f)); }
    return out; };
  S.flowOpt=function(G,id,n,together){ const L=S.askable(G,id);   /* 當面（together，story3d.js 的 offerInvite）、手機都有（1-4 ①「用現有的邀約（當面或手機）」）*/ if(!L.length) return null; const f=L[0];
    const b=S.bookedWith(G,id,f.d); return {t:'約她過節：'+L.map(x=>S.name(x.k)).join('、'),hint:b?'已經約好了':dLabel(f.d)+(f.k==='nye'?'　頂樓':'　中午場或晚上場'),dim:!!b}; };
  /* 她的回答：AA_415 的「節日」句（INV.replyPick；這裡打開 REPLY_ON 的節日）*/
  S.reply=async function(GM,id,who,f,kind,o){ const G=GM.G; let pk=null;
    if(typeof INV!=='undefined'&&INV.replyPick){ const ON=INV.REPLY_ON||(INV.REPLY_ON={}), was=ON['節日']; ON['節日']=true;
      try{ const t=typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(f.d):null, P=(o&&o.P)||{id:'fest',stay:1}, x=ymd(f.d);
        pk=INV.replyPick(G,id,{pid:P.id,P,day:f.d,h:(o&&o.h)||12,wd:x?x.wd%7:0,band:'R',year:t?(+String(t.id).charAt(1)||1):1,term:t,first:false,postExam:true,w8:false,dating:false,r:kind==='accept'?{res:'accept'}:{res:'decline',why:'rel'}},null); }
      catch(e){ console.warn('FEST reply',e); pk=null; } finally { ON['節日']=was; } }
    if(pk&&pk.row&&pk.lines){ if(INV.playLines) await INV.playLines(GM,who,pk.lines,{}); if(INV.replyMark) INV.replyMark(G,id,pk.row.id,pk.lines); return pk.lines; }
    await GM.say(null,kind==='accept'?nm(id)+'答應了。':nm(id)+'客氣地說下次吧。'); return null; };
  /* 選項：中午場／晚上場 → 地點；老家＝開車去／視訊；國外＝視訊 */
  S.PLACES=['cafe','library','noodle','wenzhou','brunch','teahouse'];   /* 1-4：四個地點、半熟、一盞 */
  S.venues=function(G,f,slot){ const id=f.id, c=S.cell(id,f.k)||{}, P=X.PEOPLE[id]||{}, h=S.TIME[slot], out=[];
    if(c.drive) return [{kind:'drive',t:'開車上陽明山',loc:c.drive,city:'陽明山',h:19}];   /* 學姊的七夕（她的心願地點 D15）*/
    if(f.W.fixed) return [{kind:'2d',t:f.W.fixed.place,place:f.W.fixed.place,bg:f.W.fixed.bg,h:f.W.fixed.h}];   /* 沛珊 2026 白色情人節：醉月湖邊 */
    if(id==='kexin') return [{kind:'2d',t:(P.ask||{}).place||'公館',place:(P.ask||{}).place||'公館',bg:(P.ask||{}).bg,h}];   /* 可昕在政大：約在公館 */
    const ver=S.ver(G,id,f.k), vb=c.venueBy&&c.venueBy[ver], want=c.venue||(vb&&typeof vb==='object'?vb[f.y]:vb)||null;
    for(const Q of ((typeof INVITE_DATA!=='undefined'&&INVITE_DATA.places)||[])){ if(!S.PLACES.includes(Q.id)||(want&&Q.id!==want)) continue;
      if(typeof INV!=='undefined'&&INV.placeWhy&&INV.placeWhy(G,id,Q)) continue;
      if(want){ if(typeof PLACES!=='undefined'&&PLACES.isOpen&&!PLACES.isOpen(Q.zone,h,f.d)) continue; }   /* 稿寫了地方的（芷若聖誕夜有班、語彤 2028 顧店）：她那時候在那裡上班也算 */
      else if(typeof INV!=='undefined'&&INV.freeAt&&!INV.freeAt(G,id,Q,f.d,h)) continue;
      out.push({kind:'inv',t:Q.name,P:Q,h}); }
    return out; };
  S.ask=async function(GM,id,n){ const G=GM.G; S.rec(G); const nmH=nm(id), who=n?{name:nmH,obj:n.obj,charId:id}:{name:nmH+'（手機）',charId:id};
    const L=S.askable(G,id); if(!L.length) return null; let f=L[0];
    if(L.length>1){ const i=await GM.choose(L.map(x=>({t:dLabel(x.d)+'　'+S.name(x.k)})).concat([{t:'算了'}])); if(i>=L.length) return null; f=L[i]; }
    if(!S.eligible(G,id,f.k,f.y)){ await S.reply(GM,id,who,f,'decline'); return null; }   /* 還不到：AA_415 的節日婉拒句 */
    if(S.bookedWith(G,id,f.d)){ await GM.say(null,'那天已經和'+nmH+'約好了。'); return null; }
    if(f.k==='nye'){ await runLines(S.cell(id,'nye').s6,id); G.flags['ZQ_NYE_'+f.y]='s6'; return 'nye'; }   /* 子晴第 6 階：那晚在頂樓 */
    const c=S.cell(id,f.k)||{}, W=f.W, opts=[];
    if(W.mode==='taipei'){ for(const slot of ((c.noonOnly||[]).includes(f.y)?['noon']:['noon','eve'])){ const [a,b]=S.SLOT[slot], ok=S.slotOk(G,f.d,slot,id,[a,b]), V=ok.ok?S.venues(G,f,slot):[];
        opts.push({t:(slot==='noon'?'中午場':'晚上場')+'（'+hm(a)+'～'+hm(b)+'）',hint:ok.ok?(V.length?'':'那個時段約不到地方'):ok.why,dim:!ok.ok||!V.length,slot,V}); } }
    if(W.mode==='home'&&S.cellLines(c,S.ver(G,id,f.k))){ const dr=S.drive(X.CITY[W.city],W.city,G,f.d), ok=S.slotOk(G,f.d,'day',id,[0,24]); opts.push({t:'開車去'+W.city+'找她（一整天）',hint:ok.ok?dr.travel+'　油錢 '+dr.fare+' 元':ok.why,dim:!ok.ok||(G.money|0)<dr.fare,kind:'trip',city:W.city}); }
    if(W.mode!=='taipei'&&S.vidOk(G,id,c,f.y)){ const h=S.videoH(G,id,f.d), ok=S.slotOk(G,f.d,'eve',id,[h-0.25,h+0.5]); opts.push({t:(c.vid.call?'打電話給她（':'視訊（')+hm(h)+'）',hint:ok.ok?'':ok.why,dim:!ok.ok,kind:'video'}); }
    if(!opts.length) return null; opts.push({t:'算了'});
    let o=null; for(let g=0;g<10&&!o;g++){ const i=await GM.choose(opts.map(x=>({t:x.t,hint:x.hint,dim:x.dim}))); if(i>=opts.length-1) return null; const x=opts[i]; if(x.dim){ await GM.say(null,(x.hint||'這樣約不了')+'。'); continue; } o=x; }
    if(!o) return null;
    let v=null; if(o.slot){ const V=o.V; if(V.length===1&&V[0].kind!=='inv') v=V[0]; else { const i=await GM.choose(V.map(x=>({t:x.t})).concat([{t:'算了'}])); if(i>=V.length) return null; v=V[i]; } }
    await S.reply(GM,id,who,f,'accept',v||{h:o.kind==='video'?21:12});
    if(o.kind==='trip'){ const q=S.planDrive(G,f,{city:o.city}); if(q) await GM.say(null,'約好 '+dLabel(f.d)+'，開車去'+o.city+'。'); return q; }
    if(o.kind==='video'){ const q=S.planVideo(G,f,false); if(q) await GM.say(null,'約好 '+dLabel(f.d)+' '+hm(q.h)+'，'+q.place+'。'); return q; }
    if(v.kind==='drive'){ const q=S.planDrive(G,f,{city:v.city,loc:v.loc,eve:true,h:v.h,bg:'d15_base_night'}); if(q) await GM.say(null,'約好 '+dLabel(f.d)+' '+hm(q.h)+'，開車上陽明山。'); return q; }
    if(v.kind==='2d'){ const q=S.plan2D(G,f,{h:v.h,place:v.place,bg:v.bg}); if(q) await GM.say(null,'約好 '+dLabel(f.d)+' '+hm(q.h)+'，'+v.place+'。'); return q; }
    const iv=INV.accept(G,id,v.P.id,f.d,v.h,{by:'player'}); iv.fest={k:f.k,y:f.y,slot:o.slot}; S.book(G,{d:f.d,who:id,k:f.k,y:f.y,slot:o.slot,mode:'meet',ref:iv.id});
    await GM.say(null,'約好 '+dLabel(f.d)+' '+hm(v.h)+'，'+v.P.name+'。'); return iv; };
  /* 見面（INV.meet 接一行：iv.fest 的見面先演節日那一段）*/
  S.meet=async function(GM,iv,who){ if(!iv||!iv.fest) return false; return S.play(GM,{id:iv.who,k:iv.fest.k,y:iv.fest.y,mode:'meet'}); };

  /* ---------------- 1-4 ②她約（只有交往中、不是生日）---------------- */
  S.HER_K=['vday','white','qixi','xmas'];
  S.herLines=function(id,k,home,city){ const A=(X.PEOPLE[id]||{}).ask||{}, hb=home&&A.homeBy?A.homeBy[k]:null, HB=Array.isArray(hb)?hb:(hb&&hb[city]); if(Array.isArray(HB)) return HB.slice();   /* AA_457 第 3 節：沛珊回家的時候照節日、照城市換（homeBy[節日][城市]；d809cdd21：情人節、七夕台中，三月十四、聖誕台南）；沒寫的照原本 */
    if(A.by&&Array.isArray(A.by[k])&&!(home&&A.homeLines)) return A.by[k].slice();   /* AA_445 1-2：芷若、語彤、子晴、學姊、可昕照節日換整組（by.vday／white／qixi／bday／xmas）；以安 AA_460 4-2 起也有（沒有生日那一列；沛珊在臺北那張當作沒有：AA_460 第 9 節）*/
    const L=(home&&A.homeLines)||A.lines||[]; return L.map((t,i)=>i===0&&k!=='vday'?String(t).replace('情人節',S.name(k)):t); };   /* 沒有 by 的：第一句照節日換（沛珊在臺北、以安的生日）*/
  S.herAsks=function(G){ const F=G.flags;
    for(const id of HER){ if(!dating(G,id)) continue; const A=(X.PEOPLE[id]||{}).ask; if(!A) continue;
      for(const k of S.HER_K) for(const y of S.years(id,k)){ const d=S.dayOf(id,k,y); if(d==null||G.day<d-1||G.day>d) continue; const a=d-1, f={id,k,y,d};
        const tag='fest_ask_'+id+'_'+k+'_'+y, fk='FEST_ASK_'+id+'_'+k+'_'+y;
        if(!sent(G,tag)&&F[fk]==null&&now(G)>=T(a,21)&&now(G)<T(d,A.h)&&S.eligible(G,id,k,y)){ const W=S.applies(G,id,k,y,d);
          const home=!!W&&W.mode==='home'&&!!A.homeLines&&!!S.cellLines(S.cell(id,k),'dt'), here=!!W&&W.mode==='taipei'&&!W.fixed;
          const busy=S.bookedWith(G,id,d)||(G.invites||[]).some(iv=>iv.who===id&&iv.day===d&&liveIv(iv));   /* 玩家已經約她了 */
          const win=home?[0,24]:[A.h-0.25,A.h+2], ok=(home||here)&&!busy&&contact(G,id,a)&&S.slotOk(G,d,home?'day':(S.slotOf(A.h)||'eve'),id,win).ok;
          if(ok){ const M=S.herLines(id,k,home,W&&W.city).map(dm(id)); M[M.length-1].ask={id:tag,until:T(d,A.h),opts:[{t:'好。',set:{[fk]:home?'home':'yes'}},{t:'那天不行。',set:{[fk]:'no'},say:(A.no||[]).map(t=>({from:id,text:t}))}]};
            PHONE.at(G,a,21,M,tag); } }
        if((F[fk]==='yes'||F[fk]==='home')&&now(G)<T(d,A.h+0.25)&&!(typeof OUT!=='undefined'&&OUT.get(G,outId(f)))){ const c=S.cell(id,k)||{}, W=S.where(G,id,k,y,d)||{};
          if(F[fk]==='home') S.planDrive(G,f,{city:W.city||((X.PEOPLE[id].home||{}).city)});
          else if(c.drive) S.planDrive(G,f,{city:'陽明山',loc:c.drive,eve:true,h:A.h,bg:'d15_base_night'});
          else S.plan2D(G,f,{h:A.h,place:A.place,bg:A.bg}); } } } };
  /* 她不在臺北、那一格有視訊（電話）：那天她打來（臺灣 21:00）*/
  S.autoCalls=function(G){ for(const id of HER){ if(!dating(G,id)) continue;
      for(const k of S.HER_K) for(const y of S.years(id,k)){ const d=S.dayOf(id,k,y); if(d==null||G.day!==d) continue; const f={id,k,y,d}, c=S.cell(id,k);
        if(!S.eligible(G,id,k,y)||S.dedicated(G,id,k,y)||!S.vidOk(G,id,c,y)||S.bookedWith(G,id,d)||!contact(G,id,d)) continue;
        const W=S.where(G,id,k,y,d); if(!W||W.mode==='taipei') continue; const h=S.videoH(G,id,d); if(now(G)>=T(d,h+0.25)) continue;
        S.planVideo(G,f,true); } } };
  /* 語彤第 6 階的白色情人節：中午 12:00 她先傳兩則 */
  S.ytNoon=function(G){ const id='heroine_03', c=S.cell(id,'white'); if(!c||!c.noonDm||dating(G,id)) return;
    for(const y of S.years(id,'white')){ const d=S.dayOf(id,'white',y), tag='fest_yt_white_noon_'+y; if(d==null||G.day<d||G.day>d+1||now(G)<T(d,12)||sent(G,tag)) continue;
      if(!S.eligible(G,id,'white',y)||!contact(G,id,d)){ continue; } const W=S.where(G,id,'white',y,d); if(!W||W.mode!=='taipei') continue;
      PHONE.at(G,d,12,c.noonDm.map(dm(id)),tag); } };
  /* 芷若 2029 白色情人節（英國）：當晚 21:00 她傳；明信片在 S.cardTick */
  S.zrCardDue=function(G){ const id='heroine_02', c=S.cell(id,'white'); if(!c||!c.card) return null; const y=2029, d=S.dayOf(id,'white',y); if(d==null||G.day<d) return null;
    if(!S.eligible(G,id,'white',y)) return null; const W=S.where(G,id,'white',y,d); if(!W||W.mode!=='abroad') return null; return {d,y}; };
  S.zrDm=function(G){ const z=S.zrCardDue(G); if(!z||G.day>z.d+1||now(G)<T(z.d,21)||!contact(G,'heroine_02',z.d)) return; PHONE.at(G,z.d,21,((X.PEOPLE.heroine_02.card||{}).dm||[]).map(dm('heroine_02')),'fest_zr_card_dm_2029'); };
  let cardBusy=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['fest3d:cardBusy']=()=>{ cardBusy=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
  S.cardTick=function(GM){ const G=GM&&GM.G; if(cardBusy||!G||!G.flags) return false; const z=S.zrCardDue(G); if(!z||G.day!==z.d||(G.hour%24)<12) return false; const R=S.rec(G), key='heroine_02:white:2029'; if(R.done[key]) return false;
    cardBusy=true; (async()=>{ R.done[key]='card'; GM.sceneBegin(); try{ if(typeof ADV!=='undefined'&&ADV.begin) ADV.begin({background:'blur',right:{charId:'heroine_02',expression:'neutral'}});
        const K=X.PEOPLE.heroine_02.card; await runLines([{speaker:null,text:K.narr}].concat(K.lines),'heroine_02'); S.reward(G,'heroine_02','white',2029,'video'); }
      finally { if(typeof ADV!=='undefined'&&ADV.active&&ADV.end) ADV.end(); GM.sceneEnd(); cardBusy=false; } })().catch(e=>{ console.warn('FEST card',e); cardBusy=false; }); return true; };
  S.phone=function(G){ if(!G||!G.flags||!law(G)||typeof PHONE==='undefined') return; S.rec(G); for(const f of [S.herAsks,S.autoCalls,S.ytNoon,S.zrDm]){ try{ f(G); }catch(e){ console.warn('FEST phone',e); } } };

  /* ---------------- 校外約會（date3d.js）約在她的節日：到了先演節日那一段 ---------------- */
  S.dateBefore=async function(GM,q){ const G=GM.G; if(!q||!q.dateTrip||typeof DATE==='undefined'||!DATE.trip) return false; const t=DATE.trip(G,q.dateTrip); if(!t) return false;
    for(const f of S.festsOn(t.who,t.day)){ if(!S.eligible(G,t.who,f.k,f.y)||!S.applies(G,t.who,f.k,f.y,f.d)||S.rec(G).done[t.who+':'+f.k+':'+f.y]) continue;
      if(!S.bookedWith(G,t.who,f.d)) S.book(G,{d:f.d,who:t.who,k:f.k,y:f.y,slot:'day',mode:'meet',ref:t.trip}); return S.play(GM,{id:t.who,k:f.k,y:f.y,mode:'meet'}); }
    return false; };
  /* ---------------- 子晴的跨年：頂樓的團體跨年演完 ---------------- */
  S.NYE_EV=['ev_nye_roof','ev_nye_dinner','ev_y2_newyear','ev_y3_newyear','ev_y4_newyear'];
  S.nyeAfter=async function(GM,q){ const G=GM.G, id='heroine_04'; if(!q||!S.NYE_EV.includes(q.ev)) return false; const y=yrOf(q.day); if(!S.years(id,'nye').includes(y)) return false;
    const key=id+':nye:'+y, R=S.rec(G); if(R.done[key]||!S.eligible(G,id,'nye',y)) return false;
    if(dating(G,id)){ const own=typeof ADV!=='undefined'&&!ADV.active&&!!ADV.begin; if(own) ADV.begin({background:typeof OUT!=='undefined'&&OUT.bg?OUT.bg('dorm_roof'):'dark',right:{charId:id,expression:'neutral'}});   /* 頂樓那一場演完 ADV 已經收了：接著演要再開（底圖宿舍頂樓）*/
      try{ return await S.play(GM,{id,k:'nye',y,mode:'meet'}); } finally { if(own&&ADV.active&&ADV.end) ADV.end(); } }
    if(G.flags['ZQ_NYE_'+y]==='s6'){ R.done[key]='meet'; S.reward(G,id,'nye',y,'s6'); return true; }   /* 第 6 階：約了她、那晚頂樓有去 */
    return false; };

  if(typeof STORY!=='undefined'){ if(Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.phone(G)); if(Array.isArray(STORY.TICKS)) STORY.TICKS.push(GM=>S.cardTick(GM)); }
  if(typeof OUT!=='undefined'){ if(Array.isArray(OUT.BEFORE)) OUT.BEFORE.push((GM,q)=>q&&q.dateTrip?S.dateBefore(GM,q):null); if(Array.isArray(OUT.AFTER)) OUT.AFTER.push((GM,q)=>S.nyeAfter(GM,q)); }
  /* invites3d.js 接的三處（已經接上，LAWWW-B 10-23 19:2x；tests/aa416_fest_unit.js 第 13 節對真正的 invites3d.js 跑 INV.flow／INV.meet）：
     ① S.flow 的選項迴圈，「opts.push({t:'算了'});」那一行前面加一行：
          const fsIdx=opts.length, fsO=typeof FEST!=='undefined'&&FEST.flowOpt?FEST.flowOpt(G,id,n,together):null; if(fsO) opts.push(fsO);
     ② 同一個迴圈，「if(k===vdIdx) return HV.video(GM,id);」和「if(k>=PL.length) return null;」中間加：
          if(fsO&&k===fsIdx){ if(fsO.dim){ await GM.say(null,fsO.hint+'。'); continue; } return FEST.ask(GM,id,n); }
     ③ S.meet，「if(iv.ask) await S.walkAsk(GM,iv,who);」那一行後面加一行：
          if(iv.fest&&typeof FEST!=='undefined'&&FEST.meet) await FEST.meet(GM,iv,who);
     （節日句：AA_415 的 S.REPLY_ON['節日'] 照舊關著；這裡的 S.reply 只在約節日那一下打開。要讓一般邀約在節日那天也說節日句，再把它改成 true。）*/
  return S;
})();
