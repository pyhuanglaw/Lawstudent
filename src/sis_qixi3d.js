/* ===== 學姊第五批：交往中的七夕（三年）（AA_388，企劃線 3a509150；任務 SIS-QIXI-L-1023）：接線 =====
   台詞、事件在 src/data/sis_qixi_events.js（照稿不改字）。這個檔：手機（STORY.PHONE_RULES）、出遊（OUT）、美國路線的當面約、美國的快轉、旗標。
   只有交往中（dating_heroine_05 或交往紀錄 dating）、她自己約；出遊系統，不算正式校外約會（不進 dateLog、不算次數）；回「不行」或沒到都不扣關係；錯過不補（同 AA_386 第 0、3 節）。
   和可昕交往中＝只有可昕的七夕（第 3 節第 4 點）：同時也在和學姊交往的存檔一樣不排學姊的（r2y3a3d.js 的可昕七夕照舊）。
   旗標 SIS_QIXI:{年:'met'|'video'|'declined'|'missed'}（新欄位，舊存檔沒有＝空的；寫的時候才建）。
   - 1-1 2026-08-19（三）19:00 溫州街・定食店：8/17（一）21:00 私訊兩則；回「好。」＝排出遊；回「妳會過七夕喔？」＝她回「不太會。所以今年試試看。」，也照答應排出遊
       （AA_388 1-1 三個回覆只有「那天不行。」寫了「不排出遊」；中間那個她的回話是「今年試試看」，照稿意解讀成答應）；「那天不行。」＝她回「好。」、不排、記 declined。
       她那年照作息不在臺北（characters.js 的 absentDates）＝改用 1-3 的視訊版：8/18（二）21:00「明天你那邊晚上九點，我視訊給你。」→ 8/19 21:00 視訊，拿掉「我這邊是早上。你那邊是七夕。」
       （目前的作息她 2026 年夏天都在臺北，這一版只在 absentDates 有那幾天時才會出現）
   - 1-2 2027-08-08（日）20:00 霖澤館・研究室門口：8/6（五）21:00 私訊四則；回「好，我帶。」「要吃什麼？」（她回「你決定。不要太油。」）＝排出遊；「那天不行。」＝她回「好。那我寫到十點。」、記 declined。
       去年沒一起過（SIS_QIXI[2026] 不是 met）：第一則「週日七夕。」換成「七夕。去年你在幹嘛？」（回覆「不記得了。」／「妳呢？」→「讀書。」），回了以後後面三則照舊送到
       （AA_388 1-2 寫「第一句換成……，後面照舊」：照私訊的第一句解讀——兩句都是「七夕。」開頭；換成場景的第一句的話，後面的選項「刪了一半還算寫完嗎？」會接不上「第二節被我刪了一半」那一句）。
   - 1-3 2028-08-26（六），她在美國（8/2 出發）：
       美國路線＝8/25（五）17:00～24:00，人在美國（USL.usDay）而且在美國的公寓、社區（她宿舍樓下）、C 棟 208（她那一戶；平日 18～21 她照作息在）＝她當面說一句（ev_sis_qixi_us_ask，auto），
         排 8/26 09:00 她宿舍門口 → 週六市集。us_life 沒有「兩個人在一起」的掛勾可以接，做成進那幾區時的一段事件；美國的快轉（USL.nextStop）停在 8/25 17:00，快轉不會跳過。
       其他路線（臺灣、日本——日本路線 8/5 已經回臺灣）＝8/25 21:00 訊息 → 8/26 21:00（臺灣時間）視訊；21:30 前沒接（先不接、過了時間）＝21:30 她傳「你在忙。那我先去圖書館了。」、記 missed。
   - 關係（第 2 節）：當面三場＝熟悉 +3、自在 +6、她的戀愛 +5（台詞檔的最後一行）＋這學期的裂縫計數 -1（這裡的 after；已經是 0 不動，同 SISB4.crackDown）；視訊＝+2／+3／+3、裂縫不動。
   - 私訊要有她的聯絡方式（前一天以前）；那一天晚兩天以上才跑手機規則（很久沒跑）的不補（同 SISB4）。
   測試：node tests/aa388_sis_qixi_unit.js */
'use strict';
const SISQX=(function(){
  const S={}, ID='heroine_05', L=typeof SISQX_LINES!=='undefined'?SISQX_LINES:{};
  const D=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const T=(d,h)=>d*24+h, now=G=>G.day*24+(+G.hour||0);
  const law=G=>!!G&&!!G.flags&&(G.stage||'law')==='law';
  const romR=(G,id)=>((G&&G.flags&&G.flags.romance)||{})[id]||null;   /* 只讀（不替沒有紀錄的人建一筆）*/
  const dating=(G,id)=>{ id=id||ID; const F=(G&&G.flags)||{}, R=romR(G,id); return F['dating_'+id]===true||!!(R&&R.status==='dating'); };
  const on=(G,day)=>Object.assign({},G,{day});
  const hereOn=(G,day)=>typeof STORY==='undefined'||!STORY.reachable||STORY.reachable(ID,on(G,day));   /* 她那天在臺北（absentDates）*/
  const abroadOn=(G,day)=>typeof STORY!=='undefined'&&!!STORY.abroad&&STORY.abroad(on(G,day));   /* 祐廷那天交換人在國外 */
  const route=G=>typeof STORY!=='undefined'&&STORY.route?STORY.route(G):null;
  const tz=(G,day)=>typeof STORY!=='undefined'&&STORY.tzOffset?(STORY.tzOffset(G,day)||0):0;
  const contact=(G,day)=>{ if(typeof INV==='undefined'||!INV.hasContact||!INV.hasContact(G,ID)) return false; const c=G.contacts&&G.contacts[ID]; return c==null||c<(day==null?G.day:day); };   /* 前一天以前就有聯絡方式（同 SISB4）*/
  const sent=(G,tag)=>typeof PHONE!=='undefined'&&PHONE.sent(G,tag);
  const got=(G,tag)=>!!tag&&Array.isArray(G.msgs)&&G.msgs.some(m=>m.tag===tag);   /* 已經送到（不只是排進佇列）*/
  const dm=t=>({th:'p:'+ID,from:ID,text:t});
  const outGet=(G,id)=>typeof OUT!=='undefined'&&OUT.get?OUT.get(G,id):null;
  const plan=(G,o)=>{ if(typeof OUT==='undefined'||!OUT.plan||OUT.get(G,o.id)) return null; return OUT.plan(G,Object.assign({alarm:true},o)); };   /* alarm：跳過時間、睡覺都停在出發前（同 SISB4）*/
  const nm=()=>typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(ID):'書瑀';
  S.yearOf=G=>!G||typeof CALENDAR==='undefined'||!CALENDAR.dateOf?null:CALENDAR.dateOf(G.day).y;

  /* ---------------- 旗標 SIS_QIXI ---------------- */
  S.get=(G,y)=>{ const R=G&&G.flags&&G.flags.SIS_QIXI; return R&&typeof R==='object'&&R[y]!=null?R[y]:null; };
  S.set=(G,y,v)=>{ const F=G.flags; F.SIS_QIXI=Object.assign({},(F.SIS_QIXI&&typeof F.SIS_QIXI==='object')?F.SIS_QIXI:{},{[y]:v}); };
  S.setOnce=(G,y,v)=>{ if(S.get(G,y)==null) S.set(G,y,v); };

  /* ---------------- 三年（第 1 節的表）---------------- */
  S.Y={
    2026:{day:'2026-08-19',ask:'2026-08-17',h:21,vask:'2026-08-18',
      out:{id:'sisqx_2026',h:19,late:0.25,place:'溫州街・巷子裡定食',title:'七夕（溫州街・定食店）',travel:'走路 約 10 分鐘',travelH:1/6}},   /* 七夕當天晚上照常營業（places.js wz_teishoku 週三 17:30–20:30）*/
    2027:{day:'2027-08-08',ask:'2027-08-06',h:21,
      out:{id:'sisqx_2027',h:20,late:0.25,place:'法律系館A・研究室門口',title:'七夕（法律系館A・研究室門口）',travel:'走路 約 10 分鐘',travelH:1/6}},
    2028:{day:'2028-08-26',ask:'2028-08-25',vask:'2028-08-25',
      out:{id:'sisqx_2028',h:9,late:0.25,place:'她宿舍門口',title:'七夕（週六市集）',travel:'走路 約 5 分鐘',travelH:1/12}} };
  /* 那一年是哪一版：meet 當面（2026、2027 她在臺北）／video 視訊（2026 她不在臺北、2028 其他路線）／us 美國路線當面（2028）／null 沒有 */
  S.mode=function(G,y){ const c=S.Y[y], d=c?D(c.day):null; if(d==null||!G) return null;
    if(+y===2028) return route(G)==='US'?'us':'video';
    if(hereOn(G,d)) return 'meet';
    return +y===2026?'video':null; };
  S.ok=G=>law(G)&&!!G.flags.met_sis&&dating(G)&&!dating(G,'kexin');   /* 和可昕交往中＝只有可昕的七夕 */
  S.usDay=(G,d)=>route(G)==='US'&&(typeof USL!=='undefined'&&USL.usDay?USL.usDay(G,d):abroadOn(G,d));   /* 人在美國（抵達以後、回來以前）*/

  /* ---------------- 當面（1-1、1-2）：她私訊約 → 出遊 ---------------- */
  const opts=(ts,re)=>ts.map((t,i)=>Object.assign({t},re&&re[i]?{say:[{from:ID,text:re[i]}]}:{}));
  S.askMsgs=function(G,y,until){ const tag='sisqx_'+y+'_ask';
    if(+y===2026){ const M=L.y26Ask.map(dm); M[M.length-1].ask={id:tag,until,opts:opts(L.y26Opts,L.y26Re)}; return M; }
    const M=L.y27Ask.map(dm); M[M.length-1].ask={id:tag,until,opts:opts(L.y27Opts,L.y27Re)};
    if(S.get(G,2026)==='met') return M;
    const rest=M.slice(1), first=dm(L.y27Last);   /* 去年沒一起過：第一則換掉，回了以後後面三則（最後一則帶三個回覆）照舊送到 */
    first.ask={id:'sisqx_2027_last',until,opts:L.y27LastOpts.map((t,i)=>({t,say:(L.y27LastRe[i]?[{from:ID,text:L.y27LastRe[i]}]:[]).concat(rest)}))};
    return [first]; };
  S.meetRule=function(G,y){ const c=S.Y[y], d=D(c.ask), od=D(c.day); if(d==null||od==null||G.day<d||G.day>od+2) return; const tag='sisqx_'+y+'_ask', end=T(od,c.out.h);
    if(!sent(G,tag)&&S.get(G,y)==null&&G.day<=d+1&&now(G)<end&&S.mode(G,y)==='meet'&&S.ok(G)&&!abroadOn(G,od)&&contact(G,d)) PHONE.at(G,d,c.h,S.askMsgs(G,y,end),tag);   /* 那一天一開始就排好（約的時間才送到；快轉會停在要回的訊息）*/
    if(!sent(G,tag)||S.get(G,y)!=null) return;
    const m=PHONE.byAsk(G,tag), yes=!!m&&m.ans!=null&&m.ans<2;
    if(m&&m.ans===2){ S.set(G,y,'declined'); return; }   /* 「那天不行。」：她回一句（回覆的 say），不排出遊 */
    if(yes&&now(G)<T(od,c.out.h+c.out.late)) plan(G,Object.assign({ev:'ev_sis_qixi',day:od},c.out));
    if((!yes&&now(G)>=end)||G.day>od+1) S.set(G,y,'missed'); };   /* 沒回（過了約的時間）、說好了一直沒結果：missed（沒到的由 outingMissed 記）*/

  /* ---------------- 視訊（1-3 其他路線；2026 她不在臺北）：前一天 21:00 一則 → 當天 21:00（臺灣）視訊；21:30 前沒接＝她傳一則 ---------------- */
  S.videoRule=function(G,y){ const c=S.Y[y], vd=c&&c.vask?D(c.vask):null, od=c?D(c.day):null; if(vd==null||od==null||G.day<vd||G.day>od+2) return;
    const tag='sisqx_'+y+'_vask', id='sisqx_'+y+'v', h=21+tz(G,od);
    if(!sent(G,tag)&&S.get(G,y)==null&&G.day<=vd+1&&now(G)<T(od,h)&&S.mode(G,y)==='video'&&S.ok(G)&&!abroadOn(G,od)&&contact(G,vd)) PHONE.at(G,vd,21,[dm(L.vAsk)],tag);
    if(!got(G,tag)&&!(sent(G,tag)&&now(G)>=T(vd,21))) return;   /* 那一則送到了（或時間到了、這一輪 PHONE.tick 就送）才排：不在她傳以前先跳「排進行程」*/
    if(S.get(G,y)==null&&now(G)<T(od,h+0.5)) plan(G,{id,ev:'ev_sis_qixi',day:od,h,late:0.5,place:'視訊',verb:'接起來',no:'今天先不要',title:nm()+'的視訊：七夕',travel:'',travelH:0,back:'視訊結束。'});
    const q=outGet(G,id);
    if(q&&S.get(G,y)!=='video'&&(q.state==='missed'||now(G)>=T(od,h+0.5))&&G.day<=od+1&&!sent(G,tag+'_miss')){ S.setOnce(G,y,'missed'); PHONE.at(G,od,h+0.5,[dm(L.vMissed)],tag+'_miss'); }   /* 21:30 那一則（先不接的也是 21:30 才傳）*/
    if(S.get(G,y)==null&&G.day>od+1) S.set(G,y,'missed'); };

  /* ---------------- 美國路線（1-3）：8/25 晚上當面一句 → 8/26 09:00 市集 ---------------- */
  S.usAskDue=function(G){ const c=S.Y[2028], d=D(c.ask), od=D(c.day); if(!G||d==null||G.day!==d||S.get(G,2028)!=null||outGet(G,c.out.id)) return false;
    return S.mode(G,2028)==='us'&&S.ok(G)&&S.usDay(G,d)&&S.usDay(G,od); };
  S.usAsked=G=>{ const c=S.Y[2028], od=D(c.day); if(od!=null) plan(G,Object.assign({ev:'ev_sis_qixi',day:od},c.out)); };
  /* 美國的快轉停在 8/25 17:00（還沒約、會約的）*/
  S.usStop=function(G,t0){ const d=D(S.Y[2028].ask); if(d==null) return null; const x=T(d,17); if(!(x>t0+1e-6)||S.get(G,2028)!=null||outGet(G,S.Y[2028].out.id)) return null;
    if(G.events&&G.events.done&&G.events.done.ev_sis_qixi_us_ask) return null; return S.mode(G,2028)==='us'&&S.ok(G)&&S.usDay(G,d)?x:null; };

  /* ---------------- 演完、沒到 ---------------- */
  /* 這學期的裂縫計數 -1（已經是 0 就不動；同 SISB4.crackDown、pgdates3d.js 可昕的）*/
  S.crackDown=function(G){ const k=(typeof ROM!=='undefined'&&ROM.CRACK&&ROM.CRACK[ID])||'SIS_CRACK'; if(!G||!G.flags||!((+G.flags[k]||0)>0)) return 0;
    if(typeof ROM!=='undefined'&&ROM.crack) ROM.crack(G,ID,-1); else G.flags[k]=(+G.flags[k]||0)-1; return -1; };
  S.after=function(G){ const y=S.yearOf(G); if(!S.Y[y]) return; if(S.mode(G,y)==='video'){ S.set(G,y,'video'); return; } S.set(G,y,'met'); S.crackDown(G); };
  S.missed=function(G,q){ const m=/^sisqx_(\d{4})/.exec((q&&q.id)||''), y=m?+m[1]:S.yearOf(G); if(S.Y[y]) S.setOnce(G,y,'missed'); };   /* 視訊沒接的那一則照 videoRule 的時間傳 */

  S.phone=function(G){ if(!G||!G.flags||!law(G)||typeof PHONE==='undefined') return;
    for(const f of [G_=>S.meetRule(G_,2026),G_=>S.videoRule(G_,2026),G_=>S.meetRule(G_,2027),G_=>S.videoRule(G_,2028)]){ try{ f(G); }catch(e){ console.warn('SISQX phone',e); } } };

  if(typeof STORY!=='undefined'&&Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.phone(G));
  if(typeof USL!=='undefined'&&typeof USL.nextStop==='function'&&!USL.nextStop._sisqx){ const n0=USL.nextStop;   /* us_life3d.js 的 S.jump、ffOpts 都問 S.nextStop：包一層 */
    USL.nextStop=function(G,t0){ const b=n0.apply(this,arguments); let x=null; try{ x=S.usStop(G,t0); }catch(e){ console.warn('SISQX nextStop',e); } return x!=null&&(b==null||x<b)?x:b; }; USL.nextStop._sisqx=true; }
  return S;
})();
