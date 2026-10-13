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
  const stageOk=(id,min)=>{ if(typeof SOCIAL==='undefined'||!SOCIAL.stage) return true; const L=SOCIAL.STAGES||[]; return L.indexOf(SOCIAL.stage(id))>=L.indexOf(min); };
  /* 關係夠不夠去這個地方：階段到了，或是已經一起做過這件事（那個地方會留下的記憶，例如一起吃過飯 SHARED_MEAL）——
     2026-10-13 批次 3：第一天和阿哲吃過麵（story3d.js 記下 SHARED_MEAL），第三天約他吃飯卻說「還不太熟」*/
  const placeOk=(id,P)=>stageOk(id,P.minStage)||(!!P.memory&&typeof SOCIAL!=='undefined'&&!!SOCIAL.memories&&SOCIAL.memories(id).some(m=>m.tag===P.memory));
  /* 某一天某個時間，這個人照作息在做什麼（STORY.schedEnt，不含邀約本身）*/
  const entAt=(G,id,day,h)=>{ if(typeof STORY==='undefined'||!STORY.schedEnt) return null; const c=CHARACTERS[id]; if(!c) return null; return STORY.schedEnt(c,{day,hour:h,weekday:wdOf(G,day),flags:G.flags||{},noInvite:true}); };
  const busyAt=(G,id,day,h,stay)=>{ for(const t of [h,h+stay/2,h+stay-0.02]){ const e=entAt(G,id,day,t); if(e&&D().busyActs.includes(e.act)) return e; } return null; };
  const isOpen=(zone,h,day)=>typeof PLACES==='undefined'||!PLACES.isOpen||(PLACES.isOpen(zone,h,day)&&PLACES.isOpen(zone,Math.min(h+0.5,23.99),day));
  const live=iv=>iv.state==='accepted'||iv.state==='going'||iv.state==='offered'||iv.state==='changed';
  const clash=(G,who,day,h,stay,skip)=>(G.invites||[]).find(iv=>iv!==skip&&live(iv)&&iv.day===day&&(iv.who===who||who==null)&&Math.abs(iv.h-h)<Math.max(stay,(S.place(iv.place)||{}).stay||1)+0.25);
  /* 這個時間可不可以（不看關係）：開著、沒和別人約、作息沒事、不是半夜 */
  const free=(G,id,P,day,h)=>h>=8&&h+P.stay<=23.5&&isOpen(P.zone,h,day)&&!clash(G,id,day,h,P.stay)&&!clash(G,null,day,h,P.stay)&&!busyAt(G,id,day,h,P.stay);
  /* 改天：從 h0 起找下一個可以的時間（同一天每 30 分鐘，之後三天的固定時間）*/
  S.nextFree=function(G,id,P,day,h0){ for(let h=Math.ceil(h0*2)/2; h<=22; h+=0.5) if(free(G,id,P,day,h)) return {day,h}; for(let k=1;k<=3;k++) for(const h of D().times.concat([10,14])) if(free(G,id,P,day+k,h)) return {day:day+k,h}; return null; };
  /* 答不答應（使用者第 4 點）。回傳 {res:'accept'|'resched'|'decline', why, alt:{day,h,place?}, act} */
  S.decide=function(G,id,pid,day,h){ S.rec(G); let P=S.place(pid); if(!P) return {res:'decline',why:'place'};
    if(typeof STORY!=='undefined'&&STORY.present&&!STORY.present(id,{day})) return {res:'decline',why:'away'};
    if(!placeOk(id,P)) return {res:'decline',why:'rel'};
    if(P.rainTo&&day===G.day&&G.weather==='rain'){ const Q=S.place(P.rainTo); const ok=Q&&free(G,id,Q,day,h); return {res:'resched',why:'weather',alt:ok?{day,h,place:Q.id}:S.nextFree(G,id,P,day+1,10)}; }
    if(clash(G,null,day,h,P.stay)) return {res:'resched',why:'mine',alt:S.nextFree(G,id,P,day,h+0.5)};   /* 你那個時間已經約了別人 */
    const other=clash(G,id,day,h,P.stay); if(other) return {res:'resched',why:'booked',alt:S.nextFree(G,id,P,day,other.h+((S.place(other.place)||{}).stay||1))};
    if(!isOpen(P.zone,h,day)||h+P.stay>23.5) return {res:'resched',why:'closed',alt:S.nextFree(G,id,P,day,h+0.5)};
    const b=busyAt(G,id,day,h,P.stay); if(b){ const end=b.to<=24?b.to:b.to-24; return {res:'resched',why:'busy',act:b.act,alt:S.nextFree(G,id,P,day,end>h?end:h+0.5)}; }
    return {res:'accept'}; };
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
    if(r.why==='rel') return nm+'客氣地說下次吧。';
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
    iv.state='done'; GM.sceneBegin({adv:iv.who}); try{ const lines=((D().people[iv.who]||{}).scene||{})[P.id];
      if(lines&&lines.length){ for(const t of lines) await GM.say({name:nm,obj:n&&n.obj,charId:iv.who},t); } else await GM.say(null,'你和'+nm+P.verb.replace(/^去/,'在')+'。');
      await GM.fade(true); GM.advance(P.stay); await GM.fade(false); GM.caption('',[P.name,nm,'（'+(P.stay>=1?P.stay+' 小時':Math.round(P.stay*60)+' 分鐘')+'）'].join('・'),2600);
      if(typeof SOCIAL!=='undefined'){ if(SOCIAL.remember) SOCIAL.remember(iv.who,P.memory,P.name); if(SOCIAL.adjust) SOCIAL.adjust(iv.who,{fam:2}); }
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
    const PL=D().places, opts=PL.map(P=>({t:P.verb,hint:placeOk(id,P)?'':'（還不太熟）'})); opts.push({t:'算了'});
    let k=await GM.choose(opts); if(k>=PL.length) return null; const P=PL[k];
    const T=S.timeOptions(G,together); if(!T.length){ await GM.say(null,'今天太晚了，改天再約吧。'); return null; } const to=T.map(q=>({t:q.t})); to.push({t:'算了'});
    k=await GM.choose(to); if(k>=T.length) return null; const W=T[k];
    const r=S.decide(G,id,P.id,W.day,W.h);
    if(r.res==='accept'){ const iv=S.accept(G,id,P.id,W.day,W.h,{now:!!W.now,by:'player'}); await GM.say(null,S.reply(G,id,P.id,r)+(W.now?'你們一起'+P.verb+'。':'約好 '+when(G,W.day,W.h)+'，'+P.name+'。'));
      if(W.now&&n){ n.beh='follow'; n.frozen=false; n.followOff=1.1; n.path=null; } return iv; }
    await GM.say(null,S.reply(G,id,P.id,r));
    if(r.res==='resched'&&r.alt){ const Q=S.place(r.alt.place||P.id); const kk=await GM.choose([{t:'好，就 '+when(G,r.alt.day,r.alt.h)+(Q.id!==P.id?'（'+Q.name+'）':'')},{t:'下次再說'}]);
      if(kk===0){ const iv=S.accept(G,id,Q.id,r.alt.day,r.alt.h,{by:'player'}); await GM.say(null,'約好 '+when(G,r.alt.day,r.alt.h)+'，'+Q.name+'。'); return iv; } }
    return null; };
  return S;
})();
