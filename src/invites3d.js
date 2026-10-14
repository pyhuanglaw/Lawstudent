/* ===== 邀約與訊息（D54 ⑥；使用者 2026-10-11 的七點，見 src/data/invites.js）=====
   一般系統，不寫人物台詞：結果用旁白（「阿哲說他在打工，問你 15:00 可不可以」），每個人的個性等 AA、BB 的內容批准後放進 INVITE_DATA.people。
   存檔欄位（舊存檔沒有就從空的開始）：
     G.invites＝[{id, who, place, zone, day, h, state, accepted, by, now}]
       state：offered（對方約你、等你回）／accepted（約好了）／going（現在一起走過去）／done（見到了）／missed（沒赴約）／declined／cancelled／changed（對方改約、等你回）
       accepted:true 給 classes3d.js 的「跳過時間」：約好的時間前 10 分鐘停下來
     G.msgs＝[{day, h, who, text, iv?}]（手機「訊息」，最新的在最後，最多 200 則）
     G.contacts＝{人物 id: 第幾天拿到的}（認識的人才有聯絡方式；開場有阿哲、阿凱，INVITE_DATA.contacts0）
   答不答應（使用者第 4 點；decide）：在不在學校（presence）→ 關係（地點的 minStage）→ 天氣（下雨不散步，改 Café）→ 開沒開 → 和別人約了／和你約了別的 → 那時候的作息（打工、上課、社團…）。
   「改天」一定附一個具體的時間（alt），玩家可以答應。沒赴約不扣分（留一筆小記憶「放過鴿子」）。
   NPC 主動約、臨時改約（AA_115 第 6 節）：offer／change 是給事件用的介面（劇情內容等 AA、BB），玩家在手機上有三種回法。
   測試：node tests/invites_unit.js */
'use strict';
const INV=(function(){
  const S={};
  const D=()=>typeof INVITE_DATA!=='undefined'?INVITE_DATA:{places:[],contacts0:[],busyActs:[],layers:[],times:[],people:{}};
  const hh=h=>{ const m=Math.round(((h%24)+24)%24*60); return String(Math.floor(m/60)%24).padStart(2,'0')+':'+String(m%60).padStart(2,'0'); };
  S.hhmm=hh;
  S.place=pid=>D().places.find(p=>p.id===pid)||null;
  S.rec=function(G){ if(!Array.isArray(G.invites)) G.invites=[]; if(!Array.isArray(G.msgs)) G.msgs=[]; if(!G.contacts||typeof G.contacts!=='object') G.contacts={}; return G; };
  const nameOf=id=>(typeof SOCIAL!=='undefined'&&SOCIAL.displayName)?SOCIAL.displayName(id):((typeof CHARACTERS!=='undefined'&&CHARACTERS[id]&&CHARACTERS[id].name)||id);
  const wdOf=(G,day)=>((G.weekday+(day-G.day))%7+7)%7;
  const when=(G,day,h)=>(day===G.day?'今天':(day===G.day+1?'明天':(()=>{ const d=typeof CALENDAR!=='undefined'?CALENDAR.dateOf(day):null; return d?d.m+'/'+d.d:'第 '+day+' 天'; })()))+' '+hh(h);
  S.when=when;
  /* 訊息 */
  S.msg=function(G,who,text,iv){ S.rec(G); G.msgs.push({day:G.day,h:+(G.hour%24).toFixed(2),who:who||null,text,iv:iv?iv.id:null}); if(G.msgs.length>200) G.msgs.splice(0,G.msgs.length-200); };
  /* 補在過去某個時間的訊息（翹課的轉述：睡過一整天，前一天那堂課的群組訊息照下課的時間排進去；classes3d.js 的 skipNotes）*/
  S.msgAt=function(G,who,text,day,h){ S.rec(G); const m={day,h:+(h%24).toFixed(2),who:who||null,text,iv:null}; let i=G.msgs.length; while(i>0&&(G.msgs[i-1].day>day||(G.msgs[i-1].day===day&&G.msgs[i-1].h>m.h))) i--;
    G.msgs.splice(i,0,m); if(G.msgs.length>200) G.msgs.splice(0,G.msgs.length-200); };
  /* 聯絡方式 */
  S.hasContact=(G,id)=>D().contacts0.includes(id)||!!(G.contacts&&G.contacts[id]!=null);
  S.addContact=function(G,id){ S.rec(G); if(S.hasContact(G,id)) return false; G.contacts[id]=G.day; S.msg(G,id,'加了'+nameOf(id)+'的聯絡方式。'); return true; };
  /* 可以約的人：認識、對的分類、這學期在學校 */
  S.canInvite=function(G,id){ const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[id]; if(!c||!D().layers.includes(c.social_layer)) return false;
    if(typeof STORY!=='undefined'&&STORY.present&&!STORY.present(id,G)) return false; return typeof SOCIAL==='undefined'||!SOCIAL.stage||SOCIAL.stage(id)!=='STRANGER'; };
  /* 手機「朋友」裡約不了的人寫原因（2026-10-14 使用者：「為什麼手機只能約阿哲小凱」——原本約不了的人沒有「約」按鈕，也沒有說為什麼）。
     文字照 AA_125 第 1 節的表（INVITE_DATA.why）。順序：不在學校（交換＝國外、until 過了＝畢業）→ 已經約好了（約好的那一筆）→ 只打過招呼（STRANGER）
     → 沒有聯絡方式（有點熟以後：可以當面問，talkCharacter 的「交換聯絡方式」）；可以約就回傳空字串。地點各自的門檻（吃飯、散步、兩個人單獨）在 placeWhy */
  const fmtWhy=(t,o)=>String(t||'').replace(/\{(\w+)\}/g,(m,k)=>o[k]!=null?o[k]:m);
  const WK=['日','一','二','三','四','五','六'];
  /* 和這個人約好、還沒到（或正在一起走過去）的那一筆 */
  S.booked=(G,id)=>(G.invites||[]).filter(iv=>iv.who===id&&(iv.state==='accepted'||iv.state==='going')&&(iv.day>G.day||(iv.day===G.day&&iv.h+((S.place(iv.place)||{}).stay||1)>G.hour%24))).sort((a,b)=>a.day-b.day||a.h-b.h)[0]||null;
  S.whyNot=function(G,id){ const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[id]; if(!c) return '不能約'; const pr=c.gender==='f'?'她':'他', W=D().why||{};
    if(!D().layers.includes(c.social_layer)) return '';   /* 教授、店員這些本來就不在約的名單：不寫原因、也不顯示按鈕 */
    const pres=(typeof STORY!=='undefined'&&STORY.presence)?STORY.presence(id,G):{here:true};
    if(!pres.here) return fmtWhy(pres.kind==='after'?W.graduated:(pres.kind==='absent'?W.abroad:W.away),{pr})||'這學期不在學校';
    const b=S.booked(G,id); if(b) return fmtWhy(W.booked,{when:'週'+WK[wdOf(G,b.day)]+' '+hh(b.h),place:(S.place(b.place)||{}).name||''});
    if(typeof SOCIAL!=='undefined'&&SOCIAL.stage&&SOCIAL.stage(id)==='STRANGER') return W.stranger||'還不太熟';
    if(!S.hasContact(G,id)) return fmtWhy(stageOk(id,'FAMILIAR')?W.noContactAsk:W.noContact,{pr});
    return ''; };
  const stageOk=(id,min)=>{ if(typeof SOCIAL==='undefined'||!SOCIAL.stage) return true; const L=SOCIAL.STAGES||[]; return L.indexOf(SOCIAL.stage(id))>=L.indexOf(min); };
  /* 關係夠不夠去這個地方：階段到了，或是已經一起做過這件事（那個地方會留下的記憶，例如一起吃過飯 SHARED_MEAL）——
     2026-10-13 批次 3：第一天和阿哲吃過麵（story3d.js 記下 SHARED_MEAL），第三天約他吃飯卻說「還不太熟」*/
  const placeOk=(id,P)=>stageOk(id,P.minStage)||(!!P.memory&&typeof SOCIAL!=='undefined'&&!!SOCIAL.memories&&SOCIAL.memories(id).some(m=>m.tag===P.memory));
  /* 兩個人單獨的邀約（BB_70 0-2、AA_125 第 1 節）：吃飯、散步（soloKinds），祐廷交往中、或對方這學期有伴侶（CHARACTERS[id].partner＝{from,until} 學期），就不約——
     約交往的對象本人照常。只看女生（祐廷是男生；「兩個人單獨」說的是男女兩個人，阿哲、阿凱這些照常吃飯：AA 確認中）*/
  S.partnerBlock=function(G,id,P){ if(!P||!(D().soloKinds||[]).includes(P.kind)) return false; const F=G.flags||{}; if(F['dating_'+id]) return false;
    const c=(typeof CHARACTERS!=='undefined'&&CHARACTERS[id])||{}; if(c.gender!=='f') return false;
    if(Object.keys(F).some(k=>k.indexOf('dating_')===0&&F[k])) return true;
    return !!(c.partner&&typeof STORY!=='undefined'&&(STORY.partnerOn?STORY.partnerOn(G,c.partner):(STORY.inTerms&&STORY.inTerms(G,c.partner)))); };
  /* 這個地方約不約得到、為什麼（選地點時的說明；可以就空字串）*/
  S.placeWhy=function(G,id,P){ const W=D().why||{}; if(S.partnerBlock(G,id,P)) return (P.kind==='meal'?W.partnerMeal:(P.kind==='walk'?W.partnerWalk:null))||W.partner||'';   /* AA 2026-10-14：照吃飯／散步分開說、告訴玩家可以怎麼約 */
    if(!placeOk(id,P)) return (P.kind==='meal'?W.meal:(P.kind==='walk'?W.walk:W.stranger))||'還不太熟'; return ''; };
  /* 某一天某個時間，這個人照作息在做什麼（STORY.schedEnt，不含邀約本身）*/
  const entAt=(G,id,day,h)=>{ if(typeof STORY==='undefined'||!STORY.schedEnt) return null; const c=CHARACTERS[id]; if(!c) return null; return STORY.schedEnt(c,{day,hour:h,weekday:wdOf(G,day),flags:G.flags||{},noInvite:true}); };
  const busyAt=(G,id,day,h,stay)=>{ for(const t of [h,h+stay/2,h+stay-0.02]){ const e=entAt(G,id,day,t); if(e&&D().busyActs.includes(e.act)) return e; } return null; };
  const isOpen=(zone,h,day)=>typeof PLACES==='undefined'||!PLACES.isOpen||(PLACES.isOpen(zone,h,day)&&PLACES.isOpen(zone,Math.min(h+0.5,23.99),day));
  const live=iv=>iv.state==='accepted'||iv.state==='going'||iv.state==='offered'||iv.state==='changed';
  const clash=(G,who,day,h,stay,skip)=>(G.invites||[]).find(iv=>iv!==skip&&live(iv)&&iv.day===day&&(iv.who===who||who==null)&&Math.abs(iv.h-h)<Math.max(stay,(S.place(iv.place)||{}).stay||1)+0.25);
  /* 這個時間可不可以（不看關係）：開著、沒和別人約、作息沒事、不是半夜 */
  const free=(G,id,P,day,h)=>h>=8&&h+P.stay<=23.5&&isOpen(P.zone,h,day)&&!clash(G,id,day,h,P.stay)&&!clash(G,null,day,h,P.stay)&&!busyAt(G,id,day,h,P.stay);
  S.freeAt=(G,id,P,day,h)=>free(G,id,P,day,h);   /* 這個時間本身可不可以（個人規則用：柏翰「九點十分」）*/
  /* 改天：從 h0 起找下一個可以的時間（同一天每 30 分鐘，之後三天的固定時間）*/
  S.nextFree=function(G,id,P,day,h0){ for(let h=Math.ceil(h0*2)/2; h<=22; h+=0.5) if(free(G,id,P,day,h)) return {day,h}; for(let k=1;k<=3;k++) for(const h of D().times.concat([10,14])) if(free(G,id,P,day+k,h)) return {day:day+k,h}; return null; };
  /* 答不答應（使用者第 4 點）。回傳 {res:'accept'|'resched'|'decline', why, alt:{day,h,place?}, act} */
  S.decide=function(G,id,pid,day,h){ S.rec(G); let P=S.place(pid); if(!P) return {res:'decline',why:'place'};
    if(typeof STORY!=='undefined'&&STORY.present&&!STORY.present(id,{day})) return {res:'decline',why:'away'};
    if(S.partnerBlock(G,id,P)) return {res:'decline',why:'partner'};
    if(!placeOk(id,P)) return {res:'decline',why:'rel'};
    if(P.rainTo&&day===G.day&&G.weather==='rain'){ const Q=S.place(P.rainTo); const ok=Q&&free(G,id,Q,day,h); return {res:'resched',why:'weather',alt:ok?{day,h,place:Q.id}:S.nextFree(G,id,P,day+1,10)}; }
    if(clash(G,null,day,h,P.stay)) return {res:'resched',why:'mine',alt:S.nextFree(G,id,P,day,h+0.5)};   /* 你那個時間已經約了別人 */
    const other=clash(G,id,day,h,P.stay); if(other) return {res:'resched',why:'booked',alt:S.nextFree(G,id,P,day,other.h+((S.place(other.place)||{}).stay||1))};
    if(!isOpen(P.zone,h,day)||h+P.stay>23.5) return {res:'resched',why:'closed',alt:S.nextFree(G,id,P,day,h+0.5)};
    const b=busyAt(G,id,day,h,P.stay); if(b){ const end=b.to<=24?b.to:b.to-24; return {res:'resched',why:'busy',act:b.act,alt:S.nextFree(G,id,P,day,end>h?end:h+0.5)}; }
    return {res:'accept'}; };
  /* ---------- 個性（INVITE_DATA.people；AA_70 第 2 節＋BB_121、BB_70，2026-10-14 第②級）----------
     decide 的結果先過這裡：照那個人的表換成她／他說的話、套個人規則（以安大一的散步、語彤週二週四在麵店、柏翰念完書、芯慈吃飯提前一天、
     學姊平日在總圖與 W8、明軒家教、芷若和子晴第一次散步要週六……）。沒有資料的人照舊（旁白）。
     回傳 decide 的結果加上 lines（台詞）；res 可能變成 'here'（她已經在那裡：不算邀約、不接改天）*/
  const bandOf=id=>{ const lv=typeof SOCIAL!=='undefined'&&SOCIAL.friendLevel?SOCIAL.friendLevel(id):'ACQUAINTANCE'; return lv==='FRIEND'||lv==='CLOSE_FRIEND'?'R':'A'; };
  /* 下一個週六（不含今天）從 h0 起可以的時間（芷若、語彤第一次約散步：「週六。我本來就在。」）*/
  S.nextSat=function(G,id,P,day,h0){ let d=day+1; while(wdOf(G,d)!==6&&d<day+8) d++; return S.nextFree(G,id,P,d,h0); };
  S.personal=function(G,id,P,day,h,r){ const p=(D().people||{})[id]; if(!p||!P||!r) return r;
    const t=typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(day):null, F=G.flags||{};
    const c={pid:P.id,P,day,h,wd:wdOf(G,day),band:bandOf(id),year:t?(+String(t.id).charAt(1)||1):1,term:t,
      first:!(G.invites||[]).some(iv=>iv.who===id&&iv.place===P.id&&(iv.state==='done'||iv.state==='accepted'||iv.state==='going'||iv.state==='missed')),
      w8:typeof EVENTS!=='undefined'&&!!EVENTS.cond&&!!EVENTS.cond({events:['ev_sis_collapse']}),
      dating:Object.keys(F).some(k=>/^dating_/.test(k)&&!!F[k]),r};
    const out=Object.assign({},r), q=p.rule?p.rule(G,c,S):null;
    if(q){ Object.assign(out,q); if(out.res==='resched'&&!out.alt){ out.res='decline'; } return out; }
    const tb=k=>{ const v=p[k]&&p[k][P.id]; return v==null?null:(Array.isArray(v)?v:(v[c.band]||null)); };
    const H=tb('here'); if(H&&(r.res==='accept'||r.res==='resched')){ const e=entAt(G,id,day,h);   /* 照作息，她那時候本來就在那裡（芷若上班的 Café、以安在總圖）*/
      if(e&&(e.zone===P.zone||(P.zone==='library_hall'&&e.zone==='library'))){ out.res='here'; out.lines=H.slice(); delete out.alt; return out; } }
    if(r.res==='accept'){ const L=(c.first&&p.first&&p.first[P.id])||tb('acc'); if(L) out.lines=L.slice(); }
    else if(r.res==='resched'&&(r.why==='busy'||r.why==='booked')){ const L=tb('plan'); if(L) out.lines=L.slice(); }
    return out; };
  /* 台詞裡的時間：{zh}＝改天的時間（「九點十分」；不是今天的加「明天」或日期）、{明天？}＝改天是明天才說 */
  const ZH=['零','一','二','三','四','五','六','七','八','九','十'];
  const zhN=n=>n<=10?ZH[n]:(n<20?'十'+ZH[n-10]:ZH[Math.floor(n/10)]+'十'+(n%10?ZH[n%10]:''));
  const zhT=h=>{ const m=Math.round(((h%24)+24)%24*60), H=Math.floor(m/60)%24, M=m%60; return zhN(H%12||12)+'點'+(M===0?'':(M===30?'半':zhN(M)+'分')); };
  S.zhTime=zhT;
  const subLine=(G,t,r)=>{ const a=r&&r.alt; return String(t).replace('{zh}',a?(a.day===G.day?'':(a.day===G.day+1?'明天':when(G,a.day,a.h).split(' ')[0]))+zhT(a.h):'').replace('{明天？}',a&&a.day===G.day+1?'明天？':''); };
  /* 播台詞：「…」＝她／他說、（…）＝旁白、{me}＝祐廷說；手機上約的時候，她／他的話寫「某某（手機）」*/
  S.playLines=async function(GM,who,lines,r){ const G=GM.G; for(const st of lines||[]){ if(st&&typeof st==='object'&&st.me){ await GM.say({name:G.name},subLine(G,st.me,r)); continue; }
      const t=subLine(G,st,r); if(/^（/.test(t)) await GM.say(null,t); else await GM.say(who,t); } };
  /* 結果的旁白（沒有個性資料的人：不編台詞）*/
  const ACTN={class:'在上課',barista:'在打工',help:'在幫忙',club:'在社團',ta:'在當助教'};
  S.reply=function(G,id,pid,r){ const nm=nameOf(id), P=S.place(pid)||{}; const per=(D().people[id]||{}).reply; if(per&&per[r.why||r.res]) return per[r.why||r.res];
    const alt=r.alt?when(G,r.alt.day,r.alt.h)+(r.alt.place&&r.alt.place!==pid?'改去'+S.place(r.alt.place).name:''):'';
    if(r.res==='accept') return nm+'答應了。';
    if(r.why==='weather') return '下雨了，'+nm+'問要不要'+(alt?alt:'改天')+'。';
    if(r.why==='mine') return '你那個時間已經約了別人。'+(alt?'改成 '+alt+'？':'');
    if(r.why==='booked') return nm+'那個時間已經跟人約了。'+(alt?'問你 '+alt+' 可不可以。':'');
    if(r.why==='closed') return P.name+'那個時間沒開。'+(alt?nm+'問 '+alt+' 可不可以。':'');
    if(r.why==='busy') return nm+'那時候'+(ACTN[r.act]||'有事')+'。'+(alt?'問你 '+alt+' 可不可以。':'');
    if(r.why==='rel'||r.why==='partner') return S.placeWhy(G,id,P)||(nm+'客氣地說下次吧。');
    if(r.why==='away') return nm+'這學期不在學校。';
    return nm+'說改天。'; };
  /* 約好 */
  S.accept=function(G,id,pid,day,h,o){ o=o||{}; S.rec(G); const P=S.place(pid); G.invSeq=(G.invSeq|0)+1;
    const iv={id:'iv'+G.invSeq,who:id,place:pid,zone:P.zone,day,h:+h.toFixed(3),state:o.now?'going':'accepted',accepted:true,by:o.by||'player',now:!!o.now,label:'和'+nameOf(id)+'約在'+P.name};
    G.invites.push(iv); if(G.invites.length>60){ const keep=G.invites.filter(q=>live(q)); const old=G.invites.filter(q=>!live(q)).slice(-30); G.invites=old.concat(keep); }
    S.msg(G,id,o.now?'和'+nameOf(id)+'一起'+P.verb+'。':'約好了：'+when(G,day,h)+'，'+P.name+'（'+nameOf(id)+'）。',iv); return iv; };
  S.byId=(G,ivId)=>(G.invites||[]).find(q=>q.id===ivId)||null;
  /* 作息的覆寫（story3d.js 的 schedEnt 先問這裡）：約好的那段時間人在那個地方；正在一起走過去的人跟著玩家 */
  S.entryFor=function(G,id){ if(!G||!Array.isArray(G.invites)||G.noInvite) return null; const h=G.hour%24;
    for(const iv of G.invites){ if(iv.who!==id) continue; const P=S.place(iv.place); if(!P) continue;
      if(iv.state==='going') return {zone:G.zone,act:'follow',invite:iv,days:[G.weekday],from:0,to:24};
      if(iv.state==='accepted'&&iv.day===G.day&&h>=iv.h-0.25&&h<iv.h+0.75) return {zone:P.zone,act:P.sitAct||'wait',invite:iv,days:[G.weekday],from:iv.h-0.25,to:iv.h+0.75}; }
    return null; };
  /* 現在可以「見面」：約好的時間、人在那裡（talkCharacter 先問這裡）*/
  S.meetable=function(G,id){ const e=S.entryFor(G,id); return e&&e.invite&&e.invite.state==='accepted'&&G.zone===e.zone?e.invite:null; };
  /* 見面：一起待一段時間（旁白）、時間過去、留一筆小記憶、熟一點點（不推進戀愛：使用者第 7 點）、習慣記憶 */
  S.meet=async function(GM,iv,n){ const G=GM.G, P=S.place(iv.place), nm=nameOf(iv.who); if(!P) return;
    iv.state='done'; GM.sceneBegin({adv:iv.who}); try{ const lines=((D().people[iv.who]||{}).scene||{})[P.id], who={name:nm,obj:n&&n.obj,charId:iv.who}, SO=typeof SOCIAL!=='undefined'?SOCIAL:{};
      if(iv.ask) await S.walkAsk(GM,iv,who);   /* 一起走路時抽到的選項句：走到了、見面開始前選（BB_120 1-7c） */
      if(SO.playUp) await SO.playUp(GM,who,iv.who);   /* 升階以後的下一次見面：先說門檻台詞（AA_124 1-6、BB_120 第 1 節） */
      const ml=SO.meetLine?SO.meetLine(iv.who,P.id):null;   /* 見面時的旁白：地點×階段（BB_120 第 1 節；沒有那一格照舊） */
      if(lines&&lines.length){ for(const t of lines) await GM.say(who,t); } else if(ml) await GM.say(/^「/.test(ml)?who:null,ml); else await GM.say(null,'你和'+nm+P.verb.replace(/^去/,'在')+'。');
      await GM.fade(true); GM.advance(P.stay); await GM.fade(false); GM.caption('',[P.name,nm,'（'+(P.stay>=1?P.stay+' 小時':Math.round(P.stay*60)+' 分鐘')+'）'].join('・'),2600);
      if(typeof SOCIAL!=='undefined'){ if(SOCIAL.remember) SOCIAL.remember(iv.who,P.memory,P.name); if(SOCIAL.activity){ SOCIAL.activity(iv.who,{cafe:'cafe',library:'library',noodle:'meal',wenzhou:'walk'}[P.id]||'cafe'); if(iv.by==='npc') SOCIAL.activity(iv.who,'acceptInvite'); } else if(SOCIAL.adjust) SOCIAL.adjust(iv.who,{fam:2}); }   /* AA_124 1-2：照地點（Café、總圖、吃飯、溫州街）；對方約的又赴約，信任 +1 */
      { const by=SO.byeLine?SO.byeLine(iv.who):null; if(by) await SO.playSteps(GM,who,iv.who,by); }   /* 見面結束的一句：照現在的階段（AA_124 1-6、BB_120） */
      if(typeof EVENTS!=='undefined'&&EVENTS.habit){ EVENTS.habit('place:'+P.zone+':with:'+iv.who); if(P.kind==='meal') EVENTS.habit('meal:'+P.zone+':with:'+iv.who); }
      S.msg(G,iv.who,'和'+nm+'在'+P.name+'。',iv);
    } finally { GM.sceneEnd(); }
    if(n){ n.beh='idle'; n.path=null; } if(GM.autosave) GM.autosave(); };
  /* 每次 STORY.tick：過了約好的時間 45 分鐘還沒見到＝沒赴約（不扣分，留一筆「放過鴿子」）；一起走過去超過 2 小時沒到＝作罷；對方約你、過了時間沒回＝作罷 */
  S.tick=function(GM){ const G=GM.G; if(!G||!Array.isArray(G.invites)) return; const h=G.hour%24, past=iv=>iv.day<G.day||(iv.day===G.day&&h>=iv.h+0.75);
    for(const iv of G.invites){ if(iv.state==='accepted'&&past(iv)){ iv.state='missed'; S.msg(G,iv.who,'你沒有赴約：'+when(G,iv.day,iv.h)+'，'+((S.place(iv.place)||{}).name||'')+'（'+nameOf(iv.who)+'）。',iv);
        if(typeof SOCIAL!=='undefined'&&SOCIAL.remember) SOCIAL.remember(iv.who,'MISSED_DINNER',(S.place(iv.place)||{}).name||''); }
      else if(iv.state==='going'&&(iv.day<G.day||h>=iv.h+2)){ iv.state='cancelled'; S.msg(G,iv.who,'和'+nameOf(iv.who)+'一起去'+((S.place(iv.place)||{}).name||'')+'的事，後來作罷了。',iv); const n=GM.npc&&GM.npc[iv.who]; if(n){ n.beh='idle'; } }
      else if((iv.state==='offered'||iv.state==='changed')&&past(iv)) iv.state='cancelled'; } };
  /* 一起走過去的路上聊一句（AA_70 第 2 節、BB_70 各人的「一起走路時聊什麼」，照 BB_121：照目的地對應，對不上的放 any；下雨先用 rain）：
     一起走 6 秒以後、跟著的人在旁邊（6 m 內）才說；字幕，不打斷走路；一趟一句，同一個人輪流換（G.flags.walkChatN）。
     要選項的那幾句（{once, l, ch:[{t, r}], after}：芷若猜電影、阿凱「機車擋騎樓可以告嗎」）照 BB_120 1-7c：路上不打斷，走到目的地、見面開始前選（S.walkAsk）；
     每句一次（G.flags[once]）。子晴「你為什麼換」、沛珊「大家都不遵守的法律」等 BB 給玩家選項的原文 */
  const oneW=v=>v==null?[]:(Array.isArray(v)&&v.length&&typeof v[0]==='string'?[v]:[].concat(v));   /* ['一句'] 是一個元素；[['一句'],['另一句']] 是兩個 */
  const walkT={};
  S._later=(f,ms)=>setTimeout(f,ms);
  S.walkPick=function(G,id,pid){ const p=(D().people||{})[id], w=p&&p.walk; if(!w) return null; const F=G.flags||(G.flags={});
    const t=typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(G.day):null;
    const c={year:t?(+String(t.id).charAt(1)||1):1,w8:typeof EVENTS!=='undefined'&&!!EVENTS.cond&&!!EVENTS.cond({events:['ev_sis_collapse']})};
    if(G.weather==='rain'&&w.rain) return {lines:w.rain,next(){}};
    const norm=e=>typeof e==='string'?{l:[e]}:(Array.isArray(e)?{l:e}:e);
    const L=oneW(w[pid]).concat(oneW(w.any)).map(norm).filter(e=>e&&e.l&&(!e.if||e.if(G,c))&&!(e.once&&F[e.once])); if(!L.length) return null;
    const N=F.walkChatN||(F.walkChatN={}), n=N[id]|0, e=L[n%L.length]; return {lines:e.l,ask:e.ch?e.once:null,next(){ N[id]=n+1; }}; };
  S.walkEntry=function(id,key){ const w=((D().people||{})[id]||{}).walk||{}; for(const k of Object.keys(w)) for(const e of oneW(w[k])) if(e&&!Array.isArray(e)&&typeof e==='object'&&e.once===key) return e; return null; };
  /* 見面開始前（S.meet 一開始）：路上抽到的選項句——她先說、你選、她回（芷若：三個都會聽到她的答案）*/
  S.walkAsk=async function(GM,iv,who){ const G=GM.G, F=G.flags||(G.flags={}), key=iv.ask; iv.ask=null; const e=key?S.walkEntry(iv.who,key):null; if(!e||F[key]) return false; F[key]=true;
    await S.playLines(GM,who,e.l); const k=await GM.choose(e.ch.map(c=>({t:c.t}))); const c=e.ch[k]||e.ch[0]; if(c.r) await S.playLines(GM,who,c.r); if(e.after) await S.playLines(GM,who,e.after); return true; };
  S.walkChat=function(GM,dt){ const G=GM.G; if(!G||!Array.isArray(G.invites)) return; for(const iv of G.invites){ if(iv.state!=='going'||iv.chat) continue;
      walkT[iv.id]=(walkT[iv.id]||0)+(dt||0); if(walkT[iv.id]<6) continue;
      const n=GM.npc&&GM.npc[iv.who], P=GM.E&&GM.E.player&&GM.E.player.obj; if(!n||!n.obj||!P) continue;
      if(Math.hypot(n.obj.position.x-P.position.x,n.obj.position.z-P.position.z)>6) continue;
      iv.chat=true; const pk=S.walkPick(G,iv.who,iv.place); if(!pk) continue; pk.next(); if(pk.ask){ iv.ask=pk.ask; continue; } const nm=nameOf(iv.who);
      pk.lines.forEach((t,k)=>{ const show=()=>GM.caption(/^（/.test(t)?'':nm,t,3400); if(k===0) show(); else S._later(show,k*3600); }); } };
  /* 走進一個區域：一起走過去的人到了目的地 → 見面 */
  S.arrive=async function(GM,zoneId){ const G=GM.G; for(const iv of (G.invites||[])){ if(iv.state!=='going'||iv.zone!==zoneId) continue; await GM.sleep(900); const n=GM.npc&&GM.npc[iv.who]; iv.state='accepted'; await S.meet(GM,iv,n); return true; } return false; };
  /* ---------- 對方約你、臨時改約（給事件用；內容由 AA、BB 寫，使用者批准後才放）---------- */
  S.offer=function(G,who,pid,day,h,text){ S.rec(G); const P=S.place(pid); if(!P) return null; G.invSeq=(G.invSeq|0)+1;
    const iv={id:'iv'+G.invSeq,who,place:pid,zone:P.zone,day,h:+h.toFixed(3),state:'offered',accepted:false,by:'npc',label:nameOf(who)+'約你去'+P.name}; G.invites.push(iv);
    S.msg(G,who,text||(nameOf(who)+'約你'+when(G,day,h)+P.verb.replace(/^去/,'去')+'。'),iv); return iv; };
  /* 回覆對方的邀約：yes＝答應（時間衝突時照樣改天）、later＝改天（玩家另外選時間，走一般的 decide）、no＝不了（不扣分） */
  S.answer=function(G,ivId,ans){ const iv=S.byId(G,ivId); if(!iv||iv.state!=='offered') return null; const nm=nameOf(iv.who), P=S.place(iv.place);
    if(ans==='yes'){ if(clash(G,null,iv.day,iv.h,P.stay,iv)){ S.msg(G,null,'那個時間你已經約了別人。',iv); return {res:'mine'}; } iv.state='accepted'; iv.accepted=true; S.msg(G,iv.who,'答應了：'+when(G,iv.day,iv.h)+'，'+P.name+'（'+nm+'）。',iv); return {res:'accept'}; }
    iv.state='declined'; S.msg(G,iv.who,ans==='later'?'你跟'+nm+'說改天。':'你跟'+nm+'說這次不了。',iv); return {res:ans}; };
  /* 臨時改約：to＝{day,h} 新的時間；null＝這次取消 */
  S.change=function(G,ivId,to,text){ const iv=S.byId(G,ivId); if(!iv||(iv.state!=='accepted'&&iv.state!=='going')) return null; const P=S.place(iv.place);
    iv.prev={day:iv.day,h:iv.h}; iv.state='changed'; iv.accepted=false; iv.to=to||null;
    S.msg(G,iv.who,text||(nameOf(iv.who)+(to?'問能不能改到 '+when(G,to.day,to.h)+'。':'說這次去不了了。')),iv); return iv; };
  /* 回覆改約的三種回法（AA_115）：ok＝好（照新時間；沒有新時間就是取消）、next＝那就下次、alone＝沒關係，我自己去（原本的時間玩家照樣可以去，對方不會在）*/
  S.answerChange=function(G,ivId,ans){ const iv=S.byId(G,ivId); if(!iv||iv.state!=='changed') return null; const nm=nameOf(iv.who), P=S.place(iv.place);
    if(ans==='ok'&&iv.to){ iv.day=iv.to.day; iv.h=iv.to.h; iv.state='accepted'; iv.accepted=true; S.msg(G,iv.who,'改好了：'+when(G,iv.day,iv.h)+'，'+P.name+'（'+nm+'）。',iv); return {res:'moved'}; }
    iv.state='cancelled'; S.msg(G,iv.who,ans==='alone'?'你說沒關係，自己去'+P.name+'。':'你跟'+nm+'說那就下次。',iv); return {res:ans}; };
  /* ---------- 手機（game3d.js 呼叫）---------- */
  S.todayLines=function(G){ return (G.invites||[]).filter(iv=>(iv.state==='accepted'||iv.state==='going')&&iv.day===G.day).sort((a,b)=>a.h-b.h).map(iv=>(iv.state==='going'?'現在':hh(iv.h))+'　'+iv.label); };
  S.upcoming=function(G){ return (G.invites||[]).filter(iv=>iv.state==='accepted'&&(iv.day>G.day||(iv.day===G.day&&iv.h+0.75>G.hour%24))).sort((a,b)=>a.day-b.day||a.h-b.h); };
  /* 約的時間的選項：在一起的時候「現在一起過去」；今天還沒過的固定時間；明天 */
  S.timeOptions=function(G,together){ const out=[]; const h=G.hour%24; if(together&&h<21.5) out.push({t:'現在一起過去',now:true,day:G.day,h});
    for(const t of D().times) if(t>h+0.4) out.push({t:'今天 '+hh(t),day:G.day,h:t}); for(const t of [12+10/60,19]) out.push({t:'明天 '+hh(t),day:G.day+1,h:t}); return out; };
  /* ---------- 約人的流程（當面：story3d.js 的 talkCharacter；手機：game3d.js 的「朋友」）：去哪裡 → 什麼時候 → 對方的回答 → 改天就問要不要那個時間 ---------- */
  S.flow=async function(GM,id,n,together){ const G=GM.G; S.rec(G); const nm=nameOf(id), c=CHARACTERS[id]||{}, her=c.gender==='f'?'她':'他';
    const PL=D().places; let k, P=null;
    for(;;){ const opts=PL.map(Q=>({t:Q.verb,hint:S.placeWhy(G,id,Q)})); opts.push({t:'算了'});   /* 約不到的地方寫原因（AA_125 第 1 節），選了就說原因、再選一次 */
      k=await GM.choose(opts); if(k>=PL.length) return null; const why=S.placeWhy(G,id,PL[k]); if(!why){ P=PL[k]; break; } await GM.say(null,why); }
    const T=S.timeOptions(G,together); if(!T.length){ await GM.say(null,'今天太晚了，改天再約吧。'); return null; } const to=T.map(q=>({t:q.t})); to.push({t:'算了'});
    k=await GM.choose(to); if(k>=T.length) return null; const W=T[k];
    const r=S.personal(G,id,P,W.day,W.h,S.decide(G,id,P.id,W.day,W.h)), who=n?{name:nm,obj:n.obj,charId:id}:{name:nm+'（手機）',charId:id};
    if(r.res==='accept'){ const iv=S.accept(G,id,P.id,W.day,W.h,{now:!!W.now,by:'player'}); const tail=W.now?'你們一起'+P.verb+'。':'約好 '+when(G,W.day,W.h)+'，'+P.name+'。';
      if(r.lines){ await S.playLines(GM,who,r.lines,r); await GM.say(null,tail); } else await GM.say(null,S.reply(G,id,P.id,r)+tail);
      if(W.now&&n){ n.beh='follow'; n.frozen=false; n.followOff=1.1; n.path=null; } return iv; }
    if(r.lines) await S.playLines(GM,who,r.lines,r); else await GM.say(null,S.reply(G,id,P.id,r));
    if(r.res==='here') return null;   /* 她已經在那裡：玩家直接去（以安的總圖、芷若上班時的 Café、學姊平日的總圖、語彤週二週四的麵店）*/
    if(r.res==='resched'&&r.alt){ const Q=S.place(r.alt.place||P.id); const kk=await GM.choose([{t:'好，就 '+when(G,r.alt.day,r.alt.h)+(Q.id!==P.id?'（'+Q.name+'）':'')},{t:'下次再說'}]);
      if(kk===0){ const iv=S.accept(G,id,Q.id,r.alt.day,r.alt.h,{by:'player'}); await GM.say(null,'約好 '+when(G,r.alt.day,r.alt.h)+'，'+Q.name+'。'); return iv; } }
    return null; };
  return S;
})();
