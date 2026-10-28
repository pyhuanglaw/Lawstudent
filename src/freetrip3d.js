/* ===== 捷運自由出行（DL-06，AA_160 第 4 節；內容 AA_161／src/data/free_trips.js；AA-B 定案）=====
   入口：公館的「捷運公館站入口」（zones3d.js mrt:true）→「要去哪裡？」→ 一個景點 → 2D 畫面（約會系統的底圖）的選單迴圈（照 HOME.loop）→ 回去（回公館／直接回宿舍）。
   第一批只能一個人去、只從公館站出發；和人一起去走 AA_128 的正式約會。
   - 次數（DL-03）：出發扣這個時段 1 次；一趟跨進下一個時段 30 分鐘以上，下一個時段也扣 1 次；下一個時段沒有次數了，選單只剩「回去」（「差不多該回去了」）。
   - 能不能去（4-2）：這個時段還有次數、到了以後至少能待 1 小時而且回到公館不晚於 24:00、在開放時間裡（休館日）、錢夠來回車資、不是期末考的時段、不是颱風假（AA_160 3-4 D）。
   - 景點（4-4）：散步（一趟最多 times 次、池裡照順序）、各互動點一趟一次、拍一張照（沒有 photo 互動點的地方另外有，一趟一張）；夕陽只在（日落 −40 分）～（日落 +10 分）；下雨 outdoor 的灰掉、散步用 rain 那句。
   - 存檔：G.trip＝{spot,depart,arrive,done:[],walk:0,p:[時段]}（途中關掉遊戲也能接著，story3d.js 的 S.tick 呼叫 TRIP.tick）；G.places.free＝{D04:次數}（只記自己去過，不算約會次數）。
   偶遇（DL-07，AA_160 第 5 節）接在散步之後，第二批景點（spots_v2）照同一套。 */
'use strict';
const TRIP=(function(){
  const S={};
  const D=()=>typeof FREE_TRIPS!=='undefined'?FREE_TRIPS:{rules:{},spots:[]};
  const hm=h=>{ h=((h%24)+24)%24; const m=Math.round(h*60); return String(Math.floor(m/60)%24).padStart(2,'0')+':'+String(m%60).padStart(2,'0'); };
  S.spot=id=>D().spots.find(s=>s.id===id)||null;
  S.list=()=>D().spots.slice();
  S.rec=G=>{ if(!G.places||typeof G.places!=='object') G.places={}; const P=G.places; if(!P.free||typeof P.free!=='object') P.free={}; if(!P.soloSaid||typeof P.soloSaid!=='object') P.soloSaid={}; if(!Array.isArray(P.photos)) P.photos=[]; return P; };
  S.at=G=>!!(G&&G.trip&&G.trip.spot);
  S.sunset=G=>{ const T=(D().rules||{}).sunsetTable||{}; const m=typeof CALENDAR!=='undefined'?CALENDAR.dateOf(G.day).m:6; return +T[String(m)]||18; };
  const rainy=G=>G.weather==='rain';
  /* 第二批（spots_v2）的規則（rules 是 AA 寫的施工說明，照寫成程式）：
     D09 貓空：週一纜車維修停駛（closedWd 的說明改「纜車今天停駛」）、大雨強風（rain、typhoon）整趟不能去「下雨，纜車停了」；
     D24 礁溪、D25 外澳：考試週不能去（太遠，AA_126 1-1 的精神）。其他（下雨戶外的點灰掉、散步用 rain 那句、最晚離開時間＝open[1]）照第一批的做法 */
  const SPOT_RULE={D09:{closedWhy:'纜車今天停駛',rainWhy:'下雨，纜車停了'},D24:{noExamWeek:true},D25:{noExamWeek:true}};
  /* 交通：第一批 transit.line／to；第二批 transit.legs（[{mode,text,minutes}]）*/
  const legLine=s=>s.transit.line||(s.transit.legs||[]).map(l=>l.text).join('→');
  const legTo=s=>s.transit.to||s.name;
  const C=()=>typeof CLS!=='undefined'?CLS:null;
  /* 期末考：今天還沒考的期末考，開始時間落在這一趟可能的時間裡 */
  const examIn=(G,h0,h1)=>{ const c=C(); if(!c||!c.dayItems) return null; return c.dayItems(G).find(it=>it.exam==='final'&&!c.rec(G).done[it.key]&&it.t1>h0&&it.t0<h1)||null; };
  /* 能不能去（4-2）：{ok, why}；why 是灰掉時寫的字 */
  S.check=function(G,s){ const h=G.hour, m=s.transit.minutes/60, arr=h+m, wd=(typeof CALENDAR!=='undefined'?CALENDAR.dateOf(G.day).wd:G.weekday)%7, c=C();
    if(typeof CALENDAR!=='undefined'&&CALENDAR.typhoon&&CALENDAR.typhoon(G.day)) return {ok:false,why:'颱風假，捷運停駛'};
    if(c&&c.slotsOn&&c.slotsOn(G)&&c.slotLeft(G,c.periodAt(h),'trip')<=0) return {ok:false,why:'這個'+c.SLOT_NAME[c.periodAt(h)]+'已經排滿了'};
    const R=SPOT_RULE[s.id]||{};
    if((s.closedWd||[]).includes(wd)) return {ok:false,why:R.closedWhy||'今天休館'};
    if(R.rainWhy&&(G.weather==='rain'||G.weather==='typhoon')) return {ok:false,why:R.rainWhy};
    if(R.noExamWeek&&c&&c.examWeek&&c.examWeek(G)) return {ok:false,why:'考試週，太遠了'};
    if(s.noExamWeek&&c&&c.examWeek&&c.examWeek(G)) return {ok:false,why:'考試週'};   /* 第三批的外縣市（spots_v3 rulesV3.noExamWeek）*/
    if(arr<s.open[0]-1e-6&&arr+1<=s.open[1]){ /* 到得太早：在外面等到開門也行，看等多久 */ if(s.open[0]-arr>1) return {ok:false,why:'現在去還沒開（'+hm(s.open[0])+' 開）'}; }
    if(Math.max(arr,s.open[0])+1>s.open[1]+1e-6) return {ok:false,why:arr>=s.open[1]?'現在去，到了就關了':'現在去，待不到一小時就關了'};
    if(Math.max(arr,s.open[0])+1+m>24+1e-6) return {ok:false,why:'太晚了，回不來'};
    if((G.money|0)<s.transit.fareRound+(s.admission|0)) return {ok:false,why:'錢不夠'};   /* 門票也要算（rulesV3.admission）*/
    const ex=examIn(G,h,Math.min(24,Math.max(arr,s.open[0])+1+m)); if(ex) return {ok:false,why:'期末考（'+hm(ex.t0)+' '+ex.c.name+'）'};
    return {ok:true,why:''}; };
  const how=s=>(s.transit.legs?(s.transit.legs.map(l=>l.text).join('＋')+' '):(s.transit.mode==='mrt'?'捷運 ':''))+s.transit.minutes+' 分鐘・來回 '+s.transit.fareRound+' 元'+(s.admission?'・門票 '+s.admission+' 元':'')+'・'+hm(s.open[0])+'–'+hm(s.open[1])+((s.closedWd||[]).length?'（週'+'日一二三四五六'[s.closedWd[0]]+'休）':'');
  /* R1：這一趟會錯過的事（沒上的課、約好的見面）——最多三件 */
  S.wouldMiss=function(G,h1){ const out=[], h0=G.hour, c=C(); if(c&&c.dayItems) for(const it of c.dayItems(G)){ const st=c.status(G,it); if((st==='open'||st==='upcoming')&&!c.storyClass(G,it)&&!(c.planSkip&&c.planSkip(G,it))&&it.t0<h1&&it.t1-0.5>h0) out.push(hm(it.t0)+' '+it.c.name); }
    for(const iv of (G.invites||[])) if(iv.day===G.day&&(iv.accepted||iv.state==='accepted')&&!iv.done&&iv.h>h0&&iv.h<h1) out.push(hm(iv.h)+' '+(iv.label||'約好的見面'));
    if(typeof OUT!=='undefined'&&OUT.rec) for(const q of OUT.rec(G)) if(q.state==='planned'&&q.day===G.day&&q.h>h0&&q.h<h1) out.push(hm(q.h)+' '+(q.title||'出遊'));
    return out.slice(0,3); };
  /* 入口：捷運公館站（4-1）*/
  S.menu=async function(GM){ const G=GM.G; const L=S.list(); if(!L.length){ GM.sceneBegin(); try{ await GM.say(null,'捷運公館站。'); } finally { GM.sceneEnd(); } return false; }
    /* 外縣市（要轉火車、高鐵、客運）分開列（2026-10-18 使用者：「為什麼公館捷運可以去花蓮七星潭、高雄、台南、嘉義、台中？捷運可以去嗎」）：
       原本全部混在「捷運公館站。要去哪裡？」下面，看起來像搭捷運就到。台北的排前面；外縣市的排後面、名字後面寫「（外縣市・要轉車）」，交通照資料（先搭捷運，再轉火車／高鐵／客運）*/
    const far=s=>!!(s.transit.legs&&s.transit.legs.some(l=>l.mode==='rail'||l.mode==='hsr'||l.mode==='coach'));
    const pick=L.filter(s=>!far(s)).concat(L.filter(far)), ask=pick.some(far)?'捷運公館站。台北的地方搭捷運就到；外縣市的要先搭捷運，再轉火車、高鐵或客運。要去哪裡？':'捷運公館站。要去哪裡？';
    let i=-1, opts=null; GM.sceneBegin(); try{ await GM.say(null,ask); opts=pick.map(s=>{ const k=S.check(G,s); return {t:s.name+(far(s)?'（外縣市・要轉車）':''),hint:k.ok?how(s):k.why+'　（'+how(s)+'）',dim:!k.ok,s}; }).concat([{t:'不去了'}]); i=await GM.choose(opts); } finally { GM.sceneEnd(); }
    const o=opts[i]; if(!o||!o.s) return false; if(o.dim){ GM.toast(o.hint.replace(/　（.*$/,''),3200); return false; } return S.go(GM,o.s); };
  /* 去程（4-3）*/
  S.go=async function(GM,s){ const G=GM.G, k=S.check(G,s); if(!k.ok){ GM.toast(k.why,3000); return false; } const m=s.transit.minutes/60, stay=Math.max(G.hour+m,s.open[0])+1;
    const miss=S.wouldMiss(G,stay+m); if(miss.length){ let j=1; GM.sceneBegin(); try{ await GM.say(null,'這一趟會錯過：'+miss.join('、')+'。'); j=await GM.choose([{t:'照樣出發'},{t:'先不要'}]); } finally { GM.sceneEnd(); } if(j!==0) return false; }
    const c=C(), p=c&&c.periodAt?c.periodAt(G.hour):null; if(c&&c.slotsOn&&c.slotsOn(G)&&p) c.slotUse(G,[p]);
    G.trip={spot:s.id,depart:G.hour,arrive:null,done:[],walk:0,photo:false,p:p?[p]:[],from:G.zone};
    GM.sceneBegin(); try{ await GM.fade(true); if(GM.titleCard) await GM.titleCard(legLine(s),'公館 → '+legTo(s)+'　'+s.transit.minutes+' 分鐘',2200); GM.advance(m); GM.money(-Math.ceil(s.transit.fareRound/2)); if(G.hour<s.open[0]) GM.advance(s.open[0]-G.hour);
      if(s.bases&&s.move){ G.trip.base=s.move.fromBase; if(G.hour>=16-1e-6){ if(GM.titleCard) await GM.titleCard(s.move.label,s.move.minutes+' 分鐘',1600); GM.advance(s.move.minutes/60); G.trip.base=s.move.toBase; G.trip.moved=true; } }   /* 兩張底圖（D28）：抵達在 a；16:00 以後才到，直接到 b（交通多一段，時間照 move 加）*/
      if(s.admission){ GM.money(-s.admission); }   /* 門票：抵達時扣一次（rulesV3.admission，AA_148 第 1 節）*/
      G.trip.arrive=G.hour; } finally { GM.sceneEnd(); }
    if(GM.autosave) GM.autosave(); await S.loop(GM); return true; };
  /* 散步、互動點的台詞：lines[第幾次來]，超過用最後一句；散步的池照順序輪、同一趟不重複 */
  const visitIdx=(G,s)=>Math.max(0,(S.rec(G).free[s.id]|0)-1);
  const lineOf=(p,G,s)=>{ const L=p.lines||[]; if(!L.length) return null; return L[Math.min(visitIdx(G,s),L.length-1)]; };
  /* 跨進下一個時段 30 分鐘以上（4-5、2-4）：下一個時段也扣；沒有次數了＝只剩回去 */
  const crossCheck=G=>{ const c=C(), T=G.trip; if(!c||!c.slotsOn||!c.slotsOn(G)||!T) return true; const last=T.p.length?T.p[T.p.length-1]:c.periodAt(T.depart); const ns=last==='am'?12:(last==='pm'?18:null); if(ns==null) return true;
    if(G.hour-ns>=0.5-1e-6){ const np=c.periodAt(ns); if(T.p.includes(np)) return true; if(c.slotLeft(G,np,'trip')>0){ c.slotUse(G,[np]); T.p.push(np); return true; } return false; } return true; };
  const wdOf=G=>(typeof CALENDAR!=='undefined'?CALENDAR.dateOf(G.day).wd:G.weekday)%7;
  const mon1=G=>{ if(typeof CALENDAR==='undefined') return false; const x=CALENDAR.dateOf(G.day); return x.wd%7===1&&x.d<=7; };   /* 每月第一個週一 */
  const pointState=(G,s,p)=>{ const T=G.trip, h=G.hour; if(T.done.includes(p.id)) return '做過了';
    if((p.closedWd||[]).includes(wdOf(G))||(p.closedMon1&&mon1(G))) return '今天休館';   /* 這一項自己的休館日（rulesV3.pointHours）*/
    if(p.days&&!p.days.includes(wdOf(G))) return p.days.length===2&&p.days.includes(6)&&p.days.includes(0)?'只有週末':'今天沒有';   /* D01 市集只有週六、週日 */
    if(p.until!=null&&h+(p.minutes||0)/60>p.until+1e-6) return '關門了';   /* 這一項自己的關門時間（D26 美術館、D28 文學館 17:00）*/
    if(p.outdoor&&rainy(G)) return '下雨';
    if(p.afterSunset){ const ss=S.sunset(G); if(h<ss+10/60-1e-6) return '天還沒黑'; if(h>ss+1+1e-6) return '已經全黑了'; }   /* D30 看第一顆星：日落後 10～60 分 */
    if(p.sunset){ const ss=S.sunset(G); if(h<ss-40/60) return '還沒到夕陽的時間'; if(h>ss+10/60) return '太陽已經下山了'; }
    if((G.money|0)<(p.cost|0)) return '錢不夠'; if(h+(p.minutes||0)/60>s.open[1]+1e-6) return '快關門了，來不及'; return ''; };
  /* 景點的選單迴圈（4-4）*/
  let busy=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['freetrip3d:busy']=()=>{ busy=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
  S.loop=async function(GM){ const G=GM.G, T=G.trip; if(!T||busy) return; const s=S.spot(T.spot); if(!s){ G.trip=null; return; } busy=true; const P=S.rec(G);
    GM.sceneBegin();
    const setBg=()=>{ if(typeof ADV!=='undefined'&&ADV.begin) ADV.begin({background:typeof OUT!=='undefined'&&OUT.bg?OUT.bg(S.bgOf(G,s)):'dark'}); };
    try{ setBg(); await GM.fade(false);
      if(!T.said){ T.said=true; const n=P.free[s.id]|0; P.free[s.id]=n+1; const a=s.arrive||[]; if(a.length) await GM.say(null,a[Math.min(n,a.length-1)]);
        if(typeof ENC!=='undefined'&&ENC.revisit){ try{ await ENC.revisit(GM,s); }catch(e){ console.warn('ENC',e); } }   /* 重訪（DL-08）*/
        if(typeof ENC!=='undefined'&&ENC.atArrive){ try{ await ENC.atArrive(GM,s); }catch(e){ console.warn('ENC',e); } } }   /* 偶遇（DL-07）：到達的那一刻 */   /* 第一次來、第二次、第三次以後（arriveIndex）*/
      for(let guard=0;guard<40;guard++){ const ok=crossCheck(G), closed=G.hour>=s.open[1]-1e-6; const O=[];
        if(!ok||closed){ await GM.say(null,closed?'這裡要關了。':'差不多該回去了。'); O.push({t:'回去',k:'back'}); }
        else { const w=s.walk, onBase=x=>!x||!x.base||!T.base||x.base===T.base; if(w&&onBase(w)&&(T.walk|0)<(w.times||1)) O.push({t:w.label,hint:w.minutes+' 分鐘',k:'walk'});
          const fx=s.fixed; if(fx&&!T.fixedDone){ const fs=(G.money|0)<(fx.cost|0)?'錢不夠':(G.hour+(fx.minutes||0)/60>s.open[1]+1e-6?'快關門了，來不及':''); O.push({t:fx.label,hint:fs||(fx.minutes+' 分鐘'+(fx.cost?'・'+fx.cost+' 元':'')),dim:!!fs,k:'fixed'}); }   /* 固定段落（D05 看電影，rulesV3.fixed）*/
          const mv=s.move; if(mv&&T.base===mv.fromBase&&!T.moved) O.push({t:mv.label,hint:mv.minutes+' 分鐘',k:'move'});   /* 換底圖（D28 公車去安平，只能一次）*/
          for(const p of s.points){ if(!onBase(p)) continue; const st=pointState(G,s,p); O.push({t:p.label,hint:st?st:((p.minutes?p.minutes+' 分鐘':'')+(p.cost?'・'+p.cost+' 元':'')),dim:!!st,k:'pt',p}); }
          if(!s.points.some(p=>p.photo)&&!T.photo) O.push({t:'拍一張照',hint:'存進相簿（一趟一張）',k:'photo'});
          O.push({t:'回去',k:'back'}); }
        const o=O[await GM.choose(O)]||O[O.length-1];
        if(o.k==='back'){ await S.back(GM,s); return; }
        if(o.dim){ if(GM.toast) GM.toast(o.hint,2600); continue; }
        const cmp=typeof ENC!=='undefined'&&ENC.companionBefore&&G.trip&&G.trip.with;   /* 一起走一段（DL-08）*/
        if(cmp&&(o.k==='walk'||o.k==='pt')) await ENC.companionBefore(GM,s,o.k==='walk'?'walk':o.p.id);
        if(o.k==='walk'){ const w=s.walk; const pool=(rainy(G)&&w.rain)?[].concat(w.rain):(w.lines||[]); const t=pool.length?pool[((P.free[s.id]|0)-1+(T.walk|0))%pool.length]:null; T.walk=(T.walk|0)+1; GM.advance((w.minutes||30)/60); if(t) await GM.say(null,t); if(G.trip&&G.trip.with&&typeof ENC!=='undefined') await ENC.companionAfter(GM,s,'walk');
          if(typeof ENC!=='undefined'&&ENC.afterWalk){ try{ await ENC.afterWalk(GM,s); }catch(e){ console.warn('ENC',e); } } }   /* 偶遇（DL-07）*/
        else if(o.k==='pt'){ const p=o.p; T.done.push(p.id); if(p.cost) GM.money(-p.cost); GM.advance((p.minutes||0)/60); const t=lineOf(p,G,s); if(t) await GM.say(null,t); if(G.trip&&G.trip.with&&typeof ENC!=='undefined') await ENC.companionAfter(GM,s,p.id); if(p.photo){ T.photo=true; P.photos.push({spot:s.id,day:G.day,h:+G.hour.toFixed(2)}); if(GM.toast) GM.toast('照片存進相簿',2200); } }
        else if(o.k==='fixed'){ const fx=s.fixed; T.fixedDone=true; if(fx.cost) GM.money(-fx.cost); GM.advance((fx.minutes||0)/60); const L=fx.lines||[]; if(L.length) await GM.say(null,L[Math.min(visitIdx(G,s),L.length-1)]); }
        else if(o.k==='move'){ const mv=s.move; GM.advance((mv.minutes||0)/60); const L=mv.lines||[]; if(L.length) await GM.say(null,L[Math.min(visitIdx(G,s),L.length-1)]); T.base=mv.toBase; T.moved=true; setBg(); }
        else if(o.k==='photo'){ T.photo=true; P.photos.push({spot:s.id,day:G.day,h:+G.hour.toFixed(2)}); if(GM.toast) GM.toast('照片存進相簿',2200); }
        if(GM.autosave) GM.autosave(); } }
    finally { busy=false; GM.sceneEnd(); } };
  /* 回程（4-6）：回公館（捷運站口）／直接回宿舍（多 10 分鐘的步行）*/
  S.back=async function(GM,s){ const G=GM.G; let j=0; if(typeof ENC!=='undefined'&&ENC.leave) await ENC.leave(GM,s);   /* 還一起走著：她先說離開的一句 */ j=await GM.choose([{t:'回公館',hint:'捷運站口'},{t:'直接回宿舍',hint:'多走 10 分鐘'}]); if(s.leave) await GM.say(null,s.leave);
    await GM.fade(true); if(GM.titleCard) await GM.titleCard(legLine(s),legTo(s)+' → 公館　'+s.transit.minutes+' 分鐘',2000); GM.advance(s.transit.minutes/60+(j===1?10/60:0)); GM.money(-Math.floor(s.transit.fareRound/2)); G.trip=null;
    if(typeof ADV!=='undefined'&&ADV.end) ADV.end(); if(j===1) await GM.enter('dorm',{x:0,z:2.4,yaw:Math.PI}); else await GM.enter('gongguan',{x:-35.6,z:13.2,yaw:0}); if(GM.autosave) GM.autosave(); };
  /* 讀檔時人在景點：回到景點的選單（story3d.js 的 S.tick）*/
  S.tick=function(GM){ const G=GM.G; if(!S.at(G)||busy) return; S.loop(GM).catch(e=>{ console.warn('TRIP.loop',e); busy=false; }); };
  /* 這一刻的底圖：兩張底圖的照現在在哪一張（bases）；下雨換雨後版（bgRain，D02）*/
  S.bgOf=function(G,s){ const T=G.trip; if(s.bases&&T&&T.base&&s.bases[T.base]) return s.bases[T.base]; if(s.bgRain&&rainy(G)) return s.bgRain; return s.bg; };
  S.hm=hm;
  return S;
})();
