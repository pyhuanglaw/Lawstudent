/* ===== 邀約與訊息（D54 ⑥；使用者 2026-10-11 的七點，見 src/data/invites.js）=====
   一般系統，不寫人物台詞：結果用旁白（「阿哲說他在打工，問你 15:00 可不可以」），每個人的個性照 INVITE_DATA.people（AA、BB 的內容已經放進去；AA_355 第 3 節）。
   存檔欄位（舊存檔沒有就從空的開始）：
     G.invites＝[{id, who, place, zone, day, h, state, accepted, by, now}]
       state：offered（對方約你、等你回）／accepted（約好了）／going（現在一起走過去）／done（見到了）／missed（沒赴約）／declined／cancelled／changed（對方改約、等你回）
       accepted:true 給 classes3d.js 的「跳過時間」：約好的時間前 10 分鐘停下來
     G.msgs＝[{day, h, who, text, iv?}]（手機「訊息」，最新的在最後，最多 200 則）
     G.contacts＝{人物 id: 第幾天拿到的}（認識的人才有聯絡方式；開場有阿哲、阿凱，INVITE_DATA.contacts0）
   答不答應（使用者第 4 點；decide）：在不在學校（presence）→ 關係（地點的 minStage）→ 天氣（下雨不散步，改 Café）→ 開沒開 → 和別人約了／和你約了別的 → 那時候的作息（打工、上課、社團…）。
   「改天」一定附一個具體的時間（alt），玩家可以答應。沒赴約不扣分（留一筆小記憶「放過鴿子」）。
   NPC 主動約、臨時改約（AA_115 第 6 節）：offer／change 是給事件用的介面（劇情內容照各事件、各人的 INVITE_DATA；AA_355 第 3 節），玩家在手機上有三種回法。
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
  const hvOk=(G,id)=>typeof HV!=='undefined'&&typeof HOMETOWN_LINES!=='undefined'&&!!HV.offer(G,id);   /* 寒暑假在高雄／台中：可以約「我去高雄找妳？」（AA_276 第 1-1 節）*/
  const kxGF=(G,id)=>id==='kexin'&&(G.stage||'law')==='law'&&!!(G.flags&&G.flags.dating_kexin===true)&&typeof DATE!=='undefined'&&!!DATE.canAsk;   /* 遠距女友可昕：法律系那幾年交往中，手機也能約她（只有「去校外…」約會；2026-10-18 使用者：「我還是不能聯絡女朋友啊，可昕？」）*/
  S.kxGF=kxGF;
  const t7a=(G,id)=>typeof DATE!=='undefined'&&!!DATE.homeOnly&&!!DATE.homeOnly(G,id);   /* AA_350 T7a：以安、芷若人在台中（約得到校外的程度）＝手機的約打開、只有「去校外…」→ 只列 D26（date3d.js 的 DATE.homeOnly）*/
  S.t7a=t7a;
  S.canInvite=function(G,id){ const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[id]; if(kxGF(G,id)) return true; if(!c||(!D().layers.includes(c.social_layer)&&!hvOk(G,id))) return false;   /* 可昕（G 層，平常不用這個清單約）寒暑假在高雄時也可以約去找她 */
    if(typeof STORY!=='undefined'&&STORY.present&&!(STORY.reachable?STORY.reachable(id,G):STORY.present(id,G))&&!hvOk(G,id)&&!t7a(G,id)) return false; return typeof SOCIAL==='undefined'||!SOCIAL.stage||SOCIAL.stage(id)!=='STRANGER'; };
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
    if(!pres.here&&pres.kind==='unreachable') return (typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(id):pr)+'沒有回覆。';   /* 沛珊消失期（BB_205 第 3 節）*/
    if(!pres.here&&pres.kind==='trip') return pres.away+'，不在臺北。';   /* 方奕廷暑假上山（BB_171）*/
    const tc=!pres.here&&pres.kind==='home'&&t7a(G,id);   /* AA_350 T7a：以安、芷若在台中＝約打開（只列 D26）；還沒到約校外的程度照舊寫「回台中了，不在臺北。」*/
    if(!pres.here&&pres.kind==='home'&&!pres.keep&&!hvOk(G,id)&&!tc&&pres.home) return '回'+pres.home+'了，不在臺北。';   /* 明軒回彰化、方奕廷回台中（BB_171）；可昕、沛珊照下面（可以去找她）*/
    if(!pres.here&&pres.kind==='city'&&!hvOk(G,id)) return pres.lost?pres.away:'在'+pres.city+'，不在臺北。';   /* 沛珊大三起在台南（AA_282）：還沒重新聯絡上＝「很久沒聯絡」；可以去台南找她的照下面 */
    if(!pres.here&&/^econ_/.test(id)&&(G.stage||'law')==='law'&&pres.kind!=='home'&&pres.kind!=='trip') return '在台大經濟系';   /* 經濟系的同學在法律系那幾年還在台大經濟系，不是「這學期不在學校」（2026-10-18 使用者）*/
    if(!pres.here&&pres.kind!=='taipei'&&!((pres.kind==='home'||pres.kind==='city')&&hvOk(G,id))&&!tc) return fmtWhy(pres.kind==='after'?W.graduated:((pres.kind==='absent'||pres.kind==='abroad')?W.abroad:W.away),{pr})||'這學期不在學校';   /* abroad：characters.js absentDates 的交換（以安 3/25～8/5 在日本、學姊 8/2～12/23 在美國）＝「{pr}這學期在國外。」（AA_341 J-S16）；city：沛珊大三起在台南（AA_282）*/
    const b=S.booked(G,id); if(b) return fmtWhy(W.booked,{when:'週'+WK[wdOf(G,b.day)]+' '+hh(b.h),place:(S.place(b.place)||{}).name||''});
    if(typeof SOCIAL!=='undefined'&&SOCIAL.stage&&SOCIAL.stage(id)==='STRANGER') return W.stranger||'還不太熟';
    if(!S.hasContact(G,id)) return fmtWhy(stageOk(id,'FAMILIAR')?W.noContactAsk:W.noContact,{pr});
    return ''; };
  const stageOk=(id,min)=>{ if(typeof SOCIAL==='undefined'||!SOCIAL.stage) return true; const L=SOCIAL.STAGES||[]; return L.indexOf(SOCIAL.stage(id))>=L.indexOf(min); };
  /* 關係夠不夠去這個地方：階段到了，或是已經一起做過這件事（那個地方會留下的記憶，例如一起吃過飯 SHARED_MEAL）——
     2026-10-13 批次 3：第一天和阿哲吃過麵（story3d.js 記下 SHARED_MEAL），第三天約他吃飯卻說「還不太熟」*/
  const placeOk=(id,P)=>stageOk(id,P.minStage)||(!!P.memory&&typeof SOCIAL!=='undefined'&&!!SOCIAL.memories&&SOCIAL.memories(id).some(m=>m.tag===P.memory));
  /* 兩個人單獨的邀約（BB_70 0-2、AA_125 第 1 節）：吃飯、散步（soloKinds）。只看女生（「兩個人單獨」說的是男女兩個人，阿哲、阿凱這些照常吃飯）；約交往的對象本人照常。
     擋的只有兩種（AA_128 4-5；AA_140 0-2 X2，2026-10-16 取代「祐廷交往中一律擋」）：①她自己這學期有伴侶（CHARACTERS[id].partner＝{from,until} 學期）；
     ②祐廷有伴侶、而且她知道（ROM.knows：法律系開場可昕交往中，以安、語彤、沛珊知道）。她不知道就照常約（懷疑照 AA_126 9-2 累積）*/
  S.partnerBlock=function(G,id,P){ if(!P||!((D().soloKinds||[]).includes(P.kind)||(D().soloPlaces||[]).includes(P.id))) return false;   /* soloPlaces：一盞（AA_172 3b）*/ const F=G.flags||{}; if(F['dating_'+id]) return false;
    const c=(typeof CHARACTERS!=='undefined'&&CHARACTERS[id])||{}; if(c.gender!=='f') return false;
    if(c.partner&&typeof STORY!=='undefined'&&(STORY.partnerOn?STORY.partnerOn(G,c.partner):(STORY.inTerms&&STORY.inTerms(G,c.partner)))) return true;
    if(typeof ROM!=='undefined'&&ROM.knows) return ROM.knows(G,id).length>0;
    return Object.keys(F).some(k=>k.indexOf('dating_')===0&&F[k]); };   /* 沒有 ROM（舊的測試環境）：照舊 */
  /* 這個地方約不約得到、為什麼（選地點時的說明；可以就空字串）*/
  S.placeWhy=function(G,id,P){ const W=D().why||{}; if(S.partnerBlock(G,id,P)) return (P.kind==='meal'?W.partnerMeal:(P.kind==='walk'?W.partnerWalk:(P.id==='teahouse'?W.partnerTea:null)))||W.partner||'';   /* AA 2026-10-14：照吃飯／散步分開說、告訴玩家可以怎麼約 */
    if(!placeOk(id,P)) return (P.kind==='meal'?W.meal:(P.kind==='walk'?W.walk:W.stranger))||'還不太熟'; return ''; };
  /* 某一天某個時間，這個人照作息在做什麼（STORY.schedEnt，不含邀約本身）*/
  const entAt=(G,id,day,h)=>{ if(typeof STORY==='undefined'||!STORY.schedEnt) return null; const c=CHARACTERS[id]; if(!c) return null; return STORY.schedEnt(c,{day,hour:h,weekday:wdOf(G,day),flags:G.flags||{},noInvite:true}); };
  const busyAt=(G,id,day,h,stay)=>{ for(const t of [h,h+stay/2,h+stay-0.02]){ const e=entAt(G,id,day,t); if(e&&D().busyActs.includes(e.act)) return e; } return null; };
  const isOpen=(zone,h,day)=>typeof PLACES==='undefined'||!PLACES.isOpen||(PLACES.isOpen(zone,h,day)&&PLACES.isOpen(zone,Math.min(h+0.5,23.99),day));
  const live=iv=>iv.state==='accepted'||iv.state==='going'||iv.state==='offered'||iv.state==='changed';
  const clash=(G,who,day,h,stay,skip)=>(G.invites||[]).find(iv=>iv!==skip&&live(iv)&&iv.day===day&&(iv.who===who||who==null)&&Math.abs(iv.h-h)<Math.max(stay,(S.place(iv.place)||{}).stay||1)+0.25);
  /* 這個時間可不可以（不看關係）：開著、沒和別人約、作息沒事、不是半夜 */
  const winOk=(G,P,day,h)=>(!P.days||P.days.includes(wdOf(G,day)))&&(!P.hours||(h>=P.hours[0]-1e-6&&h+P.stay<=P.hours[1]+1e-6));   /* 只有某些星期、某段時間能約的地點（DL-12：半熟週末早上、一盞週三到週日下午）*/
  const myExam=(G,day,h,stay)=>typeof CLS!=='undefined'&&CLS.examAt?CLS.examAt(G,day,h,h+stay):null;   /* 祐廷自己的考試（D14-T3：邀約避開）*/
  const tripAt=(G,day,h,stay)=>typeof DATE!=='undefined'&&DATE.tripAt?DATE.tripAt(G,day,h,stay):null;   /* 已經約好的校外約會那段時間（BUG-DATE-OVERLAP-1021；兩天一夜佔兩天）：和「你那個時間已經約了別人」一樣處理 */
  const free=(G,id,P,day,h)=>h>=8&&h+P.stay<=23.5&&isOpen(P.zone,h,day)&&winOk(G,P,day,h)&&!clash(G,id,day,h,P.stay)&&!clash(G,null,day,h,P.stay)&&!tripAt(G,day,h,P.stay)&&!busyAt(G,id,day,h,P.stay)&&!myExam(G,day,h,P.stay);
  S.freeAt=(G,id,P,day,h)=>free(G,id,P,day,h);
  S.busyAt=(G,id,day,h,stay)=>busyAt(G,id,day,h,stay);   /* 校外約會的預約檢查用（date3d.js 的 DATE.check：她那時候上課、上班）*/   /* 這個時間本身可不可以（個人規則用：柏翰「九點十分」）*/
  /* 改天：從 h0 起找下一個可以的時間（同一天每 30 分鐘，之後三天的固定時間）*/
  S.nextFree=function(G,id,P,day,h0){ for(let h=Math.ceil(h0*2)/2; h<=22; h+=0.5) if(free(G,id,P,day,h)) return {day,h}; for(let k=1;k<=3;k++) for(const h of D().times.concat([10,14])) if(free(G,id,P,day+k,h)) return {day:day+k,h}; return null; };
  /* 答不答應（使用者第 4 點）。回傳 {res:'accept'|'resched'|'decline', why, alt:{day,h,place?}, act} */
  S.decide=function(G,id,pid,day,h){ S.rec(G); let P=S.place(pid); if(!P) return {res:'decline',why:'place'};
    if(typeof STORY!=='undefined'&&STORY.present&&!(STORY.reachable?STORY.reachable(id,{day}):STORY.present(id,{day}))) return {res:'decline',why:'away'};   /* 在臺北、不在台大（BB_163）不擋：照她的作息和個人規則 */
    if(S.partnerBlock(G,id,P)) return {res:'decline',why:'partner'};
    if(!placeOk(id,P)) return {res:'decline',why:'rel'};
    if(P.rainTo&&day===G.day&&G.weather==='rain'){ const Q=S.place(P.rainTo); const ok=Q&&free(G,id,Q,day,h); return {res:'resched',why:'weather',alt:ok?{day,h,place:Q.id}:S.nextFree(G,id,P,day+1,10)}; }
    if(clash(G,null,day,h,P.stay)||tripAt(G,day,h,P.stay)) return {res:'resched',why:'mine',alt:S.nextFree(G,id,P,day,h+0.5)};   /* 你那個時間已經約了別人（校外約會也算，BUG-DATE-OVERLAP-1021）；改天的時間跳過約會那段 */
    const other=clash(G,id,day,h,P.stay); if(other) return {res:'resched',why:'booked',alt:S.nextFree(G,id,P,day,other.h+((S.place(other.place)||{}).stay||1))};
    if(!isOpen(P.zone,h,day)||!winOk(G,P,day,h)||h+P.stay>23.5) return {res:'resched',why:'closed',alt:S.nextFree(G,id,P,day,h+0.5)};
    const b=busyAt(G,id,day,h,P.stay); if(b){ const end=b.to<=24?b.to:b.to-24; return {res:'resched',why:'busy',act:b.act,alt:S.nextFree(G,id,P,day,end>h?end:h+0.5)}; }
    return {res:'accept'}; };
  /* ---------- 個性（INVITE_DATA.people；AA_70 第 2 節＋BB_121、BB_70，2026-10-14 第②級）----------
     decide 的結果先過這裡：照那個人的表換成她／他說的話、套個人規則（以安大一的散步、語彤週二週四在麵店、柏翰念完書、芯慈吃飯提前一天、
     學姊平日在總圖與 W8、明軒家教、芷若和子晴第一次散步要週六……）。沒有資料的人照舊（旁白）。
     回傳 decide 的結果加上 lines（台詞）；res 可能變成 'here'（她已經在那裡：不算邀約、不接改天）*/
  const bandOf=id=>{ const lv=typeof SOCIAL!=='undefined'&&SOCIAL.friendLevel?SOCIAL.friendLevel(id):'ACQUAINTANCE'; return lv==='FRIEND'||lv==='CLOSE_FRIEND'?'R':'A'; };
  /* 下一個週六（不含今天）從 h0 起可以的時間（芷若、語彤第一次約散步：「週六。我本來就在。」）*/
  S.nextSat=function(G,id,P,day,h0){ let d=day+1; while(wdOf(G,d)!==6&&d<day+8) d++; return S.nextFree(G,id,P,d,h0); };
  /* 學姊的研究所筆試（2026-02-02）考完以後（17:00 起）：散步婉拒、溫州街散步那句讀這個（AA_284 1-3；原本綁作廢的 W8）*/
  S.sisPostExam=(day,h)=>{ const d=typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey('2026-02-02'):null; return d==null||day*24+(h||0)>=d*24+17; };
  S.personal=function(G,id,P,day,h,r){ const p=(D().people||{})[id]; if(!p||!P||!r) return r;
    const t=typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(day):null, F=G.flags||{};
    const c={pid:P.id,P,day,h,wd:wdOf(G,day),band:bandOf(id),year:t?(+String(t.id).charAt(1)||1):1,term:t,
      first:!(G.invites||[]).some(iv=>iv.who===id&&iv.place===P.id&&(iv.state==='done'||iv.state==='accepted'||iv.state==='going'||iv.state==='missed')), postExam:S.sisPostExam(day,h),
      w8:typeof STORY!=='undefined'&&STORY.sisW8?STORY.sisW8(G):(typeof EVENTS!=='undefined'&&!!EVENTS.cond&&!!EVENTS.cond({events:['ev_sis_collapse']})),
      dating:typeof ROM!=='undefined'&&ROM.knows?ROM.knows(G,id).length>0:Object.keys(F).some(k=>/^dating_/.test(k)&&!!F[k]),r};   /* 她知道祐廷有伴侶（BB_191 9-4 #6：芷若宵夜「你可以多帶幾個人」；不是祐廷有沒有伴侶）*/
    const out=Object.assign({},r), q=p.rule?p.rule(G,c,S):null;
    if(q){ Object.assign(out,q); if(out.res==='resched'&&!out.alt){ out.res='decline'; } return out; }
    const tb=k=>{ let v=p[k]&&p[k][P.id]; if(typeof v==='function') v=v(G,c); return v==null?null:(Array.isArray(v)?v:(v[c.band]||null)); };   /* 函式＝照時間換句（以安：讀書會開始以前，AA_238 5-7）*/
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
    if(r.why==='away'){ const pr=typeof STORY!=='undefined'&&STORY.presence?STORY.presence(id,G):{}; return pr.kind==='unreachable'?nm+'沒有回覆。':pr.kind==='home'?nm+(pr.keep?'在'+pr.home+'老家念書':'寒暑假回'+pr.home+'了')+'，不在臺北。':pr.kind==='trip'?nm+pr.away+'，不在臺北。':pr.kind==='city'&&pr.city&&!pr.lost?nm+'在'+pr.city+'，不在臺北。':nm+'這學期不在學校。'; }   /* city：沛珊大三起在台南（AA_282 第 1 節：她不來臺北）；還沒重新聯絡上的不寫在哪 */   /* AA_276：回老家的期間約不到臺北的地點 */   /* 沛珊消失期：聯絡不到（BB_205 第 3 節）*/
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
      if(iv.state==='accepted'&&iv.day===G.day&&h>=iv.h-0.25&&h<iv.h+S.WAIT_H) return {zone:P.zone,act:P.sitAct||'wait',invite:iv,days:[G.weekday],from:iv.h-0.25,to:iv.h+S.WAIT_H}; }
    return null; };
  /* 現在可以「見面」：約好的時間、人在那裡（talkCharacter 先問這裡）*/
  S.meetable=function(G,id){ const e=S.entryFor(G,id); return e&&e.invite&&e.invite.state==='accepted'&&G.zone===e.zone?e.invite:null; };
  /* 見面：一起待一段時間（旁白）、時間過去、留一筆小記憶、熟一點點（不推進戀愛：使用者第 7 點）、習慣記憶 */
  S.meet=async function(GM,iv,n){ const G=GM.G, P=S.place(iv.place), nm=nameOf(iv.who); if(!P) return;
    if(iv.te&&typeof TERMEND!=='undefined'&&TERMEND.dinner){ iv.state='done'; GM.sceneBegin({adv:iv.who}); try{ await TERMEND.dinner(GM,{te:{who:iv.who,kind:iv.te.kind,term:iv.te.term,place:iv.place,placeName:P.name}}); await GM.fade(true); GM.advance(P.stay); await GM.fade(false);
        if(typeof SOCIAL!=='undefined'&&SOCIAL.activity) SOCIAL.activity(iv.who,'meal'); S.msg(G,iv.who,'和'+nm+'吃了學期末的飯。',iv); } finally { GM.sceneEnd(); } if(n){ n.beh='idle'; n.path=null; } if(GM.autosave) GM.autosave(); return; }   /* 玩家自己約的期末飯：整場照 TERMEND.dinner（心意的接回家的路上）*/
    iv.state='done'; GM.sceneBegin({adv:iv.who}); try{ const lines=((D().people[iv.who]||{}).scene||{})[P.id], who={name:nm,obj:n&&n.obj,charId:iv.who}, SO=typeof SOCIAL!=='undefined'?SOCIAL:{};
      if(iv.ask) await S.walkAsk(GM,iv,who);   /* 一起走路時抽到的選項句：走到了、見面開始前選（BB_120 1-7c） */
      if(SO.playUp) await SO.playUp(GM,who,iv.who);   /* 升階以後的下一次見面：先說門檻台詞（AA_124 1-6、BB_120 第 1 節） */
      const ml=SO.meetLine?SO.meetLine(iv.who,P.id):null;   /* 見面時的旁白：地點×階段（BB_120 第 1 節；沒有那一格照舊） */
      if(lines&&lines.length){ for(const t of lines) await GM.say(who,t); } else if(ml) await GM.say(/^「/.test(ml)?who:null,ml); else await GM.say(null,'你和'+nm+P.verb.replace(/^去/,'在')+'。');
      { const FA=((D().people[iv.who]||{}).firstAt||{})[P.id]; if(FA&&!(G.invites||[]).some(q=>q!==iv&&q.who===iv.who&&q.place===P.id&&q.state==='done')) await S.playLines(GM,who,FA); }   /* 第一次和她（他）去那個地方：在那裡多說的（BB_158 的 first：點完餐、脫鞋、老闆娘說的三分四十秒）*/
      await GM.fade(true); GM.advance(P.stay); await GM.fade(false); GM.caption('',[P.name,nm,'（'+(P.stay>=1?P.stay+' 小時':Math.round(P.stay*60)+' 分鐘')+'）'].join('・'),2600);
      if(typeof SOCIAL!=='undefined'){ if(SOCIAL.remember) SOCIAL.remember(iv.who,P.memory,P.name); if(SOCIAL.activity){ SOCIAL.activity(iv.who,{cafe:'cafe',library:'library',noodle:'meal',wenzhou:'walk',brunch:'meal',teahouse:'cafe'}[P.id]||'cafe'); if(iv.by==='npc') SOCIAL.activity(iv.who,'acceptInvite'); } else if(SOCIAL.adjust) SOCIAL.adjust(iv.who,{fam:2}); }
      if(typeof SOCIAL!=='undefined'&&SOCIAL.adjust&&typeof DATE!=='undefined'&&DATE.stageNum&&DATE.stageNum(iv.who)>=3&&iv.who!=='kexin'){ const DY=G.daily||(G.daily={}), k='romAlone_'+iv.who; if(DY[k]!==G.day){ DY[k]=G.day; SOCIAL.adjust(iv.who,{npcRom:1,rom:1}); } }   /* 校園單獨約出來（AA_128 1-1）：她的戀愛 +1、祐廷的戀愛 +1，同一個人一天一次；AA_243 第 1 節（BB_199 P0-1 方案 A）：從朋友（第 3 階）開始，不是第 5 階 */   /* AA_124 1-2：照地點（Café、總圖、吃飯、溫州街）；對方約的又赴約，信任 +1 */
      { const AM=(D().people[iv.who]||{}).afterMeet; const L=typeof AM==='function'?AM(G,iv,P.id):null; if(L&&L.length) for(const t of L) await GM.say(/^「/.test(t)?who:null,t); }   /* 見面之後那個人的一句（沛珊 P4b 的便條）*/
      { const by=SO.byeLine?SO.byeLine(iv.who):null; if(by) await SO.playSteps(GM,who,iv.who,by); }   /* 見面結束的一句：照現在的階段（AA_124 1-6、BB_120） */
      if(typeof EVENTS!=='undefined'&&EVENTS.habit){ EVENTS.habit('place:'+P.zone+':with:'+iv.who); if(P.kind==='meal') EVENTS.habit('meal:'+P.zone+':with:'+iv.who); }
      S.msg(G,iv.who,'和'+nm+'在'+P.name+'。',iv);
    } finally { GM.sceneEnd(); }
    if(n){ n.beh='idle'; n.path=null; } if(GM.autosave) GM.autosave(); };
  /* 每次 STORY.tick：過了約好的時間 45 分鐘還沒見到＝沒赴約（不扣分，留一筆「放過鴿子」）；一起走過去超過 2 小時沒到＝作罷；對方約你、過了時間沒回＝作罷 */
  /* 約好要真的同行（AA_137 第 7 節，使用者 2026-10-15）：約定前 30 分鐘提醒；過了 15 分鐘還沒到，她傳「你在哪？」（有聯絡方式的話）；過了 30 分鐘她自己走掉＝沒赴約（原本 45 分鐘）*/
  S.WAIT_H=0.5;
  S.tick=function(GM){ const G=GM.G; if(!G||!Array.isArray(G.invites)) return; const h=G.hour%24, past=iv=>iv.day<G.day||(iv.day===G.day&&h>=iv.h+S.WAIT_H);
    for(const iv of G.invites){ if(iv.state!=='accepted'||iv.day!==G.day) continue; const P=S.place(iv.place)||{};
      if(!iv.rem&&h>=iv.h-0.5&&h<iv.h){ iv.rem=1; if(GM.toast) GM.toast('提醒：'+hh(iv.h)+' 和'+nameOf(iv.who)+'約在'+(P.name||'')+'。',4200); }
      if(!iv.where&&h>=iv.h+0.25&&h<iv.h+S.WAIT_H&&G.zone!==P.zone){ iv.where=1; if(typeof PHONE!=='undefined'&&S.hasContact(G,iv.who)){ PHONE.post(G,{th:'p:'+iv.who,from:iv.who,text:'你在哪？'}); if(GM.phoneBadge) GM.phoneBadge(); if(GM.toast) GM.toast('手機｜'+nameOf(iv.who)+'：你在哪？',3600); } } }
    for(const iv of G.invites){ if(iv.state==='accepted'&&past(iv)&&!(iv.waitSeat&&G.zone===iv.zone)){ iv.state='missed'; S.msg(G,iv.who,'你沒有赴約：'+when(G,iv.day,iv.h)+'，'+((S.place(iv.place)||{}).name||'')+'（'+nameOf(iv.who)+'）。',iv);
        if(typeof SOCIAL!=='undefined'&&SOCIAL.remember) SOCIAL.remember(iv.who,'MISSED_DINNER',(S.place(iv.place)||{}).name||''); }
      else if(iv.state==='going'&&(iv.day<G.day||h>=iv.h+2)){ iv.state='cancelled'; S.msg(G,iv.who,'和'+nameOf(iv.who)+'一起去'+((S.place(iv.place)||{}).name||'')+'的事，後來作罷了。',iv); const n=GM.npc&&GM.npc[iv.who]; if(n){ n.beh='idle'; } }
      else if((iv.state==='offered'||iv.state==='changed')&&past(iv)) iv.state='cancelled'; } };
  /* 一起走過去的路上聊一句（AA_70 第 2 節、BB_70 各人的「一起走路時聊什麼」，照 BB_121：照目的地對應，對不上的放 any；下雨先用 rain）：
     一起走 6 秒以後、跟著的人在旁邊（6 m 內）才說；字幕，不打斷走路；一趟一句，同一個人輪流換（G.flags.walkChatN）。
     要選項的那幾句（{once, l, ch:[{t, r, mem}], after}：芷若猜電影、阿凱「機車擋騎樓可以告嗎」、子晴「你為什麼換」、沛珊「大家都不遵守的法律」）照 BB_120 1-7c：路上不打斷，走到目的地、見面開始前選（S.walkAsk）；
     每句一次（G.flags[once]）。after 可以是好幾個版本（[{if, l}]，取第一個成立的）*/
  const oneW=v=>v==null?[]:(Array.isArray(v)&&v.length&&typeof v[0]==='string'?[v]:[].concat(v));   /* ['一句'] 是一個元素；[['一句'],['另一句']] 是兩個 */
  const walkT={};
  S._later=(f,ms)=>setTimeout(f,ms);
  S.walkPick=function(G,id,pid){ const p=(D().people||{})[id], w=p&&p.walk; if(!w) return null; const F=G.flags||(G.flags={});
    const t=typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(G.day):null;
    const c={year:t?(+String(t.id).charAt(1)||1):1,postExam:S.sisPostExam(G.day,G.hour),w8:typeof STORY!=='undefined'&&STORY.sisW8?STORY.sisW8(G):(typeof EVENTS!=='undefined'&&!!EVENTS.cond&&!!EVENTS.cond({events:['ev_sis_collapse']}))};
    if(G.weather==='rain'&&w.rain) return {lines:w.rain,next(){}};
    const norm=e=>typeof e==='string'?{l:[e]}:(Array.isArray(e)?{l:e}:e);
    const L=oneW(w[pid]).concat(oneW(w.any)).map(norm).filter(e=>e&&e.l&&(!e.if||e.if(G,c))&&!(e.once&&F[e.once])); if(!L.length) return null;
    const N=F.walkChatN||(F.walkChatN={}), n=N[id]|0, e=L[n%L.length]; return {lines:e.l,ask:e.ch?e.once:null,next(){ N[id]=n+1; }}; };
  S.walkEntry=function(id,key){ const w=((D().people||{})[id]||{}).walk||{}; for(const k of Object.keys(w)) for(const e of oneW(w[k])) if(e&&!Array.isArray(e)&&typeof e==='object'&&e.once===key) return e; return null; };
  /* 見面開始前（S.meet 一開始）：路上抽到的選項句——她先說、你選、她回（芷若：三個都會聽到她的答案）*/
  S.walkAsk=async function(GM,iv,who){ const G=GM.G, F=G.flags||(G.flags={}), key=iv.ask; iv.ask=null; const e=key?S.walkEntry(iv.who,key):null; if(!e||F[key]) return false; F[key]=true;
    await S.playLines(GM,who,e.l); const k=await GM.choose(e.ch.map(c=>({t:c.t}))); const c=e.ch[k]||e.ch[0]; if(c.r) await S.playLines(GM,who,c.r);
    if(c.mem&&typeof SOCIAL!=='undefined'&&SOCIAL.remember) SOCIAL.remember(iv.who,c.mem,'');   /* 子晴「說換方向的事」→ TOLD_HER_CHANGE（前置鏈第 5 環）*/
    const af=e.after&&e.after.length&&typeof e.after[0]==='object'&&!Array.isArray(e.after[0])?((e.after.find(v=>!v.if||v.if(G))||{}).l||[]):e.after;   /* 好幾個版本取第一個成立的（沛珊：大一上問讀書會、大一下起問課輔班）*/
    if(af&&af.length) await S.playLines(GM,who,af); return true; };
  S.walkChat=function(GM,dt){ const G=GM.G; if(!G||!Array.isArray(G.invites)) return; for(const iv of G.invites){ if(iv.state!=='going'||iv.chat) continue;
      walkT[iv.id]=(walkT[iv.id]||0)+(dt||0); if(walkT[iv.id]<6) continue;
      const n=GM.npc&&GM.npc[iv.who], P=GM.E&&GM.E.player&&GM.E.player.obj; if(!n||!n.obj||!P) continue;
      if(Math.hypot(n.obj.position.x-P.position.x,n.obj.position.z-P.position.z)>6) continue;
      iv.chat=true; const pk=S.walkPick(G,iv.who,iv.place); if(!pk) continue; pk.next(); if(pk.ask){ iv.ask=pk.ask; continue; } const nm=nameOf(iv.who);
      pk.lines.forEach((t,k)=>{ const show=()=>GM.caption(/^（/.test(t)?'':nm,t,3400); if(k===0) show(); else S._later(show,k*3600); }); } };
  /* 走進一個區域：一起走過去的人到了目的地 → 見面 */
  S.arrive=async function(GM,zoneId){ const G=GM.G; for(const iv of (G.invites||[])){ if(iv.state!=='going'||iv.zone!==zoneId) continue; await GM.sleep(900); const n=GM.npc&&GM.npc[iv.who]; iv.state='accepted';
      if(S.seatFirst(GM,iv,n)) return true;   /* 有座位的地方：她先去找位子坐下，你坐到她旁邊（或跟她說話）才開始（使用者 2026-10-16：一進總圖大廳就念完了，根本還沒坐下）*/
      await S.meet(GM,iv,n); return true; } return false; };
  /* 一起走到有座位的地點（總圖、Café、麵店、茶館、早午餐）：她走去一個旁邊還有空位的位子坐下；約定時間改成現在（不會因為路上花的時間被算成沒赴約）。
     見面：你坐到她旁邊（S.seatMeet，座位選單呼叫）或跟她說話（story3d.js talkCharacter 的 INV.meetable）。找不到位子或走不到就照舊直接見面。 */
  const SEATED={library:'read',cafe:'sit',noodle:'sit',teahouse:'sit',brunch:'sit'};
  S.seatFirst=function(GM,iv,n){ const E=GM.E, G=GM.G; if(!n||!n.obj||!SEATED[iv.place]||!E||!E.zone||!Array.isArray(E.zone.seats)||!E.moveTo) return false;
    const near=(a,b,r)=>Math.hypot(a.x-b.x,a.z-b.z)<r;
    const busy=st=>st.taken||E.npcs.some(m=>m!==n&&(m.seat||m.seatTarget)&&near(m.seat||m.seatTarget,st,0.35))||(E.player&&E.player.seat&&near(E.player.seat,st,0.35));
    const ok=E.zone.seats.filter(st=>!st.label&&!busy(st));   /* label＝長椅之類的單獨座位；要桌邊的位子 */
    const pair=st=>ok.some(q=>q!==st&&(q.lv|0)===(st.lv|0)&&near(q,st,1.3));   /* 旁邊還有空位給你 */
    const P=E.player.obj.position; const cand=ok.filter(pair).sort((a,b)=>Math.hypot(a.x-P.x,a.z-P.z)-Math.hypot(b.x-P.x,b.z-P.z));
    const st=cand[0]; if(!st) return false;
    if(GM.standUp) GM.standUp(n); n.beh='idle'; n.frozen=false; n.path=null; n.seatTarget=st;
    const pose=SEATED[iv.place]; const sit=()=>{ n.seatTarget=null; if(GM.sitAt) GM.sitAt(n,st); n.pose=n.idlePose=pose; n.frozen=true; };
    const ap=(GM.seatApproach&&GM.seatApproach(st))||[st.x,st.z]; if(!E.moveTo(n,ap[0],ap[1],sit,st.lv|0)){ n.seatTarget=null; return false; }
    iv.h=+((G.hour%24)).toFixed(3); iv.waitSeat={x:st.x,z:st.z,lv:st.lv|0};
    if(GM.setGoal) GM.setGoal('坐到'+nameOf(iv.who)+'旁邊'); return true; };
  S.seatMeet=async function(GM,seat){ const G=GM.G; if(!seat) return false; for(const iv of (G.invites||[])){ if(iv.state!=='accepted'||iv.day!==G.day||!iv.waitSeat||(iv.waitSeat.lv|0)!==(seat.lv|0)) continue;
      if(Math.hypot(iv.waitSeat.x-seat.x,iv.waitSeat.z-seat.z)>1.8) continue; const n=GM.npc&&GM.npc[iv.who]; if(!n) continue; iv.waitSeat=null; await S.meet(GM,iv,n); return true; } return false; };
  /* ---------- 對方約你、臨時改約（給事件用；內容由 AA、BB 寫，使用者批准後才放）---------- */
  S.offer=function(G,who,pid,day,h,text){ S.rec(G); const P=S.place(pid); if(!P) return null; G.invSeq=(G.invSeq|0)+1;
    const iv={id:'iv'+G.invSeq,who,place:pid,zone:P.zone,day,h:+h.toFixed(3),state:'offered',accepted:false,by:'npc',label:nameOf(who)+'約你去'+P.name}; G.invites.push(iv);
    S.msg(G,who,text||(nameOf(who)+'約你'+when(G,day,h)+P.verb.replace(/^去/,'去')+'。'),iv); return iv; };
  /* 回覆對方的邀約：yes＝答應（時間衝突時照樣改天）、later＝改天（玩家另外選時間，走一般的 decide）、no＝不了（不扣分） */
  S.answer=function(G,ivId,ans){ const iv=S.byId(G,ivId); if(!iv||iv.state!=='offered') return null; const nm=nameOf(iv.who), P=S.place(iv.place);
    if(ans==='yes'){ if(clash(G,null,iv.day,iv.h,P.stay,iv)||tripAt(G,iv.day,iv.h,P.stay)){ S.msg(G,null,'那個時間你已經約了別人。',iv); return {res:'mine'}; }   /* 校外約會那段時間也一樣（BUG-DATE-OVERLAP-1021）*/ iv.state='accepted'; iv.accepted=true; S.msg(G,iv.who,'答應了：'+when(G,iv.day,iv.h)+'，'+P.name+'（'+nm+'）。',iv); return {res:'accept'}; }
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
  /* 期末時段裡約成的吃飯＝期末的飯（AA_268 第 1 節）：標 iv.te、系統字、其他還沒回的期末邀約自動婉拒 */
  S.teMark=function(GM,iv,id,P,W){ const G=GM.G, te=iv&&typeof TERMEND!=='undefined'&&TERMEND.playerInvite?TERMEND.playerInvite(G,id,P,W):null; if(!te||!te.kind) return false;
    iv.te={term:te.w.id,kind:te.kind}; TERMEND.playerPicked(G,iv); if(GM.toast) GM.toast(te.kind==='gf'?TERMEND_LINES.SYS_GF:TERMEND_LINES.SYS_TE,4200); return true; };
  S.flow=async function(GM,id,n,together){ const G=GM.G; S.rec(G); const nm=nameOf(id), c=CHARACTERS[id]||{}, her=c.gender==='f'?'她':'他';
    const t7=!n&&t7a(G,id);   /* AA_350 T7a：以安、芷若在台中＝和可昕一樣只有「去校外…」（清單只列 D26，DATE.menu）*/
    const PL=kxGF(G,id)?[]:D().places.filter(()=>!t7); let k, P=null;   /* 可昕在政大：不約台大校園裡的地點，只有「去校外…」*/
    /* 當面約（AA_134 第 4 節，AA_140 G49）：第一句是當面的版本；她回答前看一下手機的行事曆、答應時點頭（動作用字幕，不多一個要點的對話框）*/
    const act=(t,ms)=>{ if(n&&GM.caption) GM.caption('','（'+t+'）',ms||1800); };
    if(n){ const T0=S.timeOptions(G,together); await GM.say({name:G.name||'祐廷'},T0.some(q=>q.day===G.day)?'你等一下有空嗎？':'你明天有空嗎？'); }   /* 照可選的時間說（AA-B 2026-10-16 21:53 定稿，AA_134 第 50 行下；不加週末選項）*/
    const dOk=typeof DATE!=='undefined'&&DATE.HEROINES&&DATE.HEROINES.includes(id)&&!together;   /* 校外約會（DATE-S3，AA_128 4-1）：女主角的清單最後多一個「去校外…」；約不到時選了寫原因 */
    const hv=!n&&typeof HV!=='undefined'&&typeof HOMETOWN_LINES!=='undefined'&&HV.offer?HV.offer(G,id):null;   /* 寒暑假她在高雄／台中（AA_276 第 1-1、5 節）：「我去高雄找妳？」 */
    const vd=!n&&typeof HV!=='undefined'&&HV.videoOffer?HV.videoOffer(G,id):null;   /* 沛珊交往中、她在台南：「視訊？」（AA_349 K5；晚上 21:00～22:30、一週最多兩次）*/
    for(;;){ const opts=PL.map(Q=>({t:Q.verb,hint:S.placeWhy(G,id,Q)})); if(dOk){ const ca=DATE.canAsk(G,id); opts.push({t:'去校外…',hint:ca.ok?'約會：選地點、日期、時間':ca.why,dim:!ca.ok}); } const hvIdx=hv?opts.length:-1; if(hv){ const HL=HOMETOWN_LINES[HV.key?HV.key(G,id):id]||HOMETOWN_LINES[id]; opts.push({t:HL.ask,hint:hv.ok?'當天來回　'+HL.travel:hv.why,dim:!hv.ok}); }   /* 沛珊在台南那一組（HV.key，AA_328 3-09）*/
      const vdIdx=vd?opts.length:-1; if(vd){ const VL=(HOMETOWN_LINES[HV.key(G,id)]||{}).video||{}; opts.push({t:VL.ask||'視訊？',hint:vd.ok?vd.hint:vd.why,dim:!vd.ok}); }
      opts.push({t:'算了'});   /* 約不到的地方寫原因（AA_125 第 1 節），選了就說原因、再選一次 */
      k=await GM.choose(opts); if(dOk&&k===PL.length) return DATE.menu(GM,id,n); if(k===hvIdx) return HV.ask(GM,id); if(k===vdIdx) return HV.video(GM,id); if(k>=PL.length) return null; const why=S.placeWhy(G,id,PL[k]); if(!why){ P=PL[k]; break; } await GM.say(null,why);
      { const ps=S.partnerBlock(G,id,PL[k])&&(((D().people||{})[id]||{}).partnerSay||{})[PL[k].id]; if(ps) await S.playLines(GM,n?{name:nm,obj:n.obj,charId:id}:{name:nm+'（手機）',charId:id},ps); } }   /* 有伴侶時她自己的一句（學姊的一盞，AA_172 3b）*/
    const T=S.timeOptions(G,together); if(!T.length){ await GM.say(null,'今天太晚了，改天再約吧。'); return null; } const to=T.map(q=>({t:q.t})); to.push({t:'算了'});
    k=await GM.choose(to); if(k>=T.length) return null; const W=Object.assign({},T[k]);
    const NC=typeof NOODLE_CLOSED!=='undefined'&&NOODLE_CLOSED.inviteAdjust?NOODLE_CLOSED.inviteAdjust(G,id,W):null; if(NC) W.h=NC.h;   /* 麵店過年店休那一週約語彤（AA_333 C）：排到 18:00 以後、答應的那一句換掉 */
    const r=S.personal(G,id,P,W.day,W.h,S.decide(G,id,P.id,W.day,W.h)), who=n?{name:nm,obj:n.obj,charId:id}:{name:nm+'（手機）',charId:id};
    const te=typeof TERMEND!=='undefined'&&TERMEND.playerInvite?TERMEND.playerInvite(G,id,P,W):null;   /* 期末時段裡約吃飯＝期末的飯（BB_203 第 1 節第 13 點、AA_268）*/
    if(te&&te.refuse){ act(her+'看了一下手機的行事曆。'); if(n&&GM.sleep) await GM.sleep(700); await GM.say(who,'「'+te.refuse+'」'); return null; }   /* 關係結束、還不能重新開始（C8、C9）*/
    act(her+'看了一下手機的行事曆。'); if(n&&GM.sleep) await GM.sleep(700);
    if(r.res==='accept'){ act(her+'點點頭。'); if(n&&typeof CHAR!=='undefined'&&CHAR.setExpr) CHAR.setExpr(n.obj,'smile'); const iv=S.accept(G,id,P.id,W.day,W.h,{now:!!W.now,by:'player'}); const tail=W.now?'你們一起'+P.verb+'。':'約好 '+when(G,W.day,W.h)+'，'+P.name+'。';
      if(NC){ await GM.say(who,'「'+NC.line+'」'); await GM.say(null,tail); } else if(r.lines){ await S.playLines(GM,who,r.lines,r); await GM.say(null,tail); } else await GM.say(null,S.reply(G,id,P.id,r)+tail);
      S.teMark(GM,iv,id,P,W);
      if(W.now&&n){ if(GM.standUp) GM.standUp(n); n.beh='follow'; n.frozen=false; n.followOff=1.1; n.path=null; } return iv; }   /* 坐著被約「現在一起過去」：先起身再跟（使用者 2026-10-16 試玩：Café 約吃麵，以安坐姿懸空跟著走）*/
    if(r.lines) await S.playLines(GM,who,r.lines,r); else await GM.say(null,S.reply(G,id,P.id,r));
    if(r.res==='here') return null;   /* 她已經在那裡：玩家直接去（以安的總圖、芷若上班時的 Café、學姊平日的總圖、語彤週二週四的麵店）*/
    if(r.res==='resched'&&r.alt){ const Q=S.place(r.alt.place||P.id); const kk=await GM.choose([{t:'好，就 '+when(G,r.alt.day,r.alt.h)+(Q.id!==P.id?'（'+Q.name+'）':'')},{t:'下次再說'}]);
      if(kk===0){ const iv=S.accept(G,id,Q.id,r.alt.day,r.alt.h,{by:'player'}); await GM.say(null,'約好 '+when(G,r.alt.day,r.alt.h)+'，'+Q.name+'。'); S.teMark(GM,iv,id,Q,r.alt); return iv; } }
    return null; };
  return S;
})();
