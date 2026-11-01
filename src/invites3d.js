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
  /* 超過 200 則刪最舊的：刪掉的 tag 記進手機的 cut（同 phone3d.js put），PHONE.sent 才記得傳過（BUG-PHONE-CAP-1025，BB-B 10-25 R38_CAP_GUITAR：skipNotes 補的群組訊息把 guitar_grp1 擠掉，又再排一次）*/
  const trim=G=>{ if(G.msgs.length<=200) return; const gone=G.msgs.splice(0,G.msgs.length-200), P=G.phone||(G.phone={}), C=P.cut||(P.cut=[]); for(const x of gone) if(x&&x.tag&&!C.includes(x.tag)) C.push(x.tag); };
  /* 訊息 */
  S.msg=function(G,who,text,iv){ S.rec(G); G.msgs.push({day:G.day,h:+(G.hour%24).toFixed(2),who:who||null,text,iv:iv?iv.id:null}); trim(G); };
  /* 補在過去某個時間的訊息（翹課的轉述：睡過一整天，前一天那堂課的群組訊息照下課的時間排進去；classes3d.js 的 skipNotes）*/
  S.msgAt=function(G,who,text,day,h){ S.rec(G); const m={day,h:+(h%24).toFixed(2),who:who||null,text,iv:null}; let i=G.msgs.length; while(i>0&&(G.msgs[i-1].day>day||(G.msgs[i-1].day===day&&G.msgs[i-1].h>m.h))) i--;
    G.msgs.splice(i,0,m); trim(G); };
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
  S.whyNot=function(G,id,o){ const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[id]; if(!c) return '不能約'; const pr=c.gender==='f'?'她':'他', W=D().why||{};   /* o.face：當面約（不用聯絡方式，AA_124 1-7；INVITE-MENU-1030 當面也能約校外：DATE.canAsk 傳進來）*/
    if(!D().layers.includes(c.social_layer)) return '';   /* 教授、店員這些本來就不在約的名單：不寫原因、也不顯示按鈕 */
    const pres=(typeof STORY!=='undefined'&&STORY.presence)?STORY.presence(id,G):{here:true};
    if(!pres.here&&pres.kind==='unreachable') return (typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(id):pr)+'沒有回覆。';   /* 沛珊消失期（BB_205 第 3 節）*/
    const tc=!pres.here&&(pres.kind==='home'||pres.kind==='trip')&&t7a(G,id);   /* AA_350 T7a：以安、芷若、沛珊在台中＝約打開（只列 D26）；還沒到約校外的程度照舊寫「回台中了，不在臺北。」。AA_372 第 7 節：週末回台中（trip）也一樣 */
    if(!pres.here&&pres.kind==='trip'&&!tc) return pres.away+'，不在臺北。';   /* 方奕廷暑假上山（BB_171）*/
    if(!pres.here&&pres.kind==='home'&&!pres.keep&&!hvOk(G,id)&&!tc&&pres.home) return '回'+pres.home+'了，不在臺北。';   /* 明軒回彰化、方奕廷回台中（BB_171）；可昕、沛珊照下面（可以去找她）*/
    if(!pres.here&&pres.kind==='city'&&!hvOk(G,id)) return pres.lost?pres.away:'在'+pres.city+'，不在臺北。';   /* 沛珊大三起在台南（AA_282）：還沒重新聯絡上＝「很久沒聯絡」；可以去台南找她的照下面 */
    if(!pres.here&&/^econ_/.test(id)&&(G.stage||'law')==='law'&&pres.kind!=='home'&&pres.kind!=='trip') return '在首都帝大經濟系';   /* 經濟系的同學在法律系那幾年還在台大經濟系，不是「這學期不在學校」（2026-10-18 使用者）*/
    if(!pres.here&&pres.kind!=='taipei'&&!((pres.kind==='home'||pres.kind==='city')&&hvOk(G,id))&&!tc) return fmtWhy(pres.kind==='after'?W.graduated:((pres.kind==='absent'||pres.kind==='abroad')?W.abroad:W.away),{pr})||'這學期不在學校';   /* abroad：characters.js absentDates 的交換（以安 3/25～8/5 在日本、學姊 8/2～12/23 在美國）＝「{pr}這學期在國外。」（AA_341 J-S16）；city：沛珊大三起在台南（AA_282）*/
    const b=S.booked(G,id); if(b) return fmtWhy(W.booked,{when:'週'+WK[wdOf(G,b.day)]+' '+hh(b.h),place:(S.place(b.place)||{}).name||''});
    if(typeof SOCIAL!=='undefined'&&SOCIAL.stage&&SOCIAL.stage(id)==='STRANGER') return W.stranger||'還不太熟';
    if(!(o&&o.face)&&!S.hasContact(G,id)) return fmtWhy(stageOk(id,'FAMILIAR')?W.noContactAsk:W.noContact,{pr});
    return ''; };
  const stageOk=(id,min)=>{ if(typeof SOCIAL==='undefined'||!SOCIAL.stage) return true; const L=SOCIAL.STAGES||[]; return L.indexOf(SOCIAL.stage(id))>=L.indexOf(min); };
  /* 關係夠不夠去這個地方：階段到了，或是已經一起做過這件事（那個地方會留下的記憶，例如一起吃過飯 SHARED_MEAL）——
     2026-10-13 批次 3：第一天和阿哲吃過麵（story3d.js 記下 SHARED_MEAL），第三天約他吃飯卻說「還不太熟」*/
  /* 個人的最低階段（掛勾 fn(G,id,P)→階段或 null）：溫州街 WZ-T4 SIS_TEAHOUSE＝學姊的一盞、茶席降成「有點熟」（BB_148 8b；src/wzlines3d.js 登記）*/
  S.MIN_STAGE=[];
  const minOf=(G,id,P)=>{ let m=P.minStage; if(G) for(const f of S.MIN_STAGE){ let r=null; try{ r=f(G,id,P); }catch(e){ r=null; } if(r) m=r; } return m; };
  /* 分開以後一個學期（AA_434 第 4 節第 3 點；V6EX.cool，src/v6ex3d.js 算期間：分開那天起到下一個學期第 1 週）：
     她那一方的邀約不發（S.offer）；你約她「照朋友階段的回覆和答應機率」——地點的門檻、運動的 A／R、AA_415 回覆的階段都只看友情（第 1～4 階，SOCIAL.friendLevel），不看戀愛。
     可昕不在 V6EX.COOL_IDS（照 AA_351）。fest3d.js 的節日、termend3d.js 的心意邀約也讀 S.cool。掛勾 S.STAGE_CAP：fn(G,id)→這個人最多算到哪一階（SOCIAL.STAGES）或 null */
  S.cool=(G,id)=>typeof V6EX!=='undefined'&&!!V6EX&&typeof V6EX.cool==='function'&&!!G&&!!G.flags&&!!V6EX.cool(G,id);
  S.STAGE_CAP=[(G,id)=>S.cool(G,id)&&typeof SOCIAL!=='undefined'&&SOCIAL.friendLevel?SOCIAL.friendLevel(id):null];
  S.stageOf=function(G,id){ if(typeof SOCIAL==='undefined'||!SOCIAL.stage) return null; const L=SOCIAL.STAGES||[]; let s=SOCIAL.stage(id); if(G) for(const f of S.STAGE_CAP){ let c=null; try{ c=f(G,id); }catch(e){ c=null; } if(c&&L.indexOf(c)>=0&&L.indexOf(c)<L.indexOf(s)) s=c; } return s; };
  /* DATE.stageNum 的六階：分開以後這段期間＝友情那一段（不太認識 1、有點熟 2、朋友 3、好朋友 4；AA_126 4-1），不會到第 5、6 階 */
  S.capStage=function(G,id,n){ if(!S.cool(G,id)||typeof SOCIAL==='undefined'||!SOCIAL.friendLevel) return n; const f={CLOSE_FRIEND:4,FRIEND:3,FAMILIAR:2}[SOCIAL.friendLevel(id)]||1; return Math.min(n,f); };
  const stageOkG=(G,id,min)=>{ if(typeof SOCIAL==='undefined'||!SOCIAL.stage) return true; const L=SOCIAL.STAGES||[]; return L.indexOf(S.stageOf(G,id))>=L.indexOf(min); };
  const placeOk=(id,P,G)=>stageOkG(G,id,minOf(G,id,P))||(!!P.memory&&typeof SOCIAL!=='undefined'&&!!SOCIAL.memories&&SOCIAL.memories(id).some(m=>m.tag===P.memory));
  /* 兩個人單獨的邀約（BB_70 0-2、AA_125 第 1 節）：吃飯、散步（soloKinds）。只看女生（「兩個人單獨」說的是男女兩個人，阿哲、阿凱這些照常吃飯）；約交往的對象本人照常。
     擋的只有兩種（AA_128 4-5；AA_140 0-2 X2，2026-10-16 取代「祐廷交往中一律擋」）：①她自己這學期有伴侶（CHARACTERS[id].partner＝{from,until} 學期）；
     ②祐廷有伴侶、而且她知道（ROM.knows：法律系開場可昕交往中，以安、語彤、沛珊知道）。她不知道就照常約（懷疑照 AA_126 9-2 累積）*/
  S.partnerBlock=function(G,id,P){ if(!P||!((D().soloKinds||[]).includes(P.kind)||(D().soloPlaces||[]).includes(P.id))) return false;   /* soloPlaces：一盞（AA_172 3b）*/ const F=G.flags||{}; if(F['dating_'+id]) return false;
    const c=(typeof CHARACTERS!=='undefined'&&CHARACTERS[id])||{}; if(c.gender!=='f') return false;
    if(c.partner&&!c.partner.soloOk&&typeof STORY!=='undefined'&&(STORY.partnerOn?STORY.partnerOn(G,c.partner):(STORY.inTerms&&STORY.inTerms(G,c.partner)))) return true;   /* soloOk：她的交往對象不擋這幾種（芷若×子晴，AA_385 第 6 節：只擋校外約會、告白，src/zrzq3d.js）*/
    if(typeof ROM!=='undefined'&&ROM.knows) return ROM.knows(G,id).length>0;
    return Object.keys(F).some(k=>k.indexOf('dating_')===0&&F[k]); };   /* 沒有 ROM（舊的測試環境）：照舊 */
  /* 這個地方約不約得到、為什麼（選地點時的說明；可以就空字串）*/
  S.placeWhy=function(G,id,P){ const W=D().why||{}; if(S.partnerBlock(G,id,P)) return (P.kind==='meal'?W.partnerMeal:(P.kind==='walk'?W.partnerWalk:(P.id==='teahouse'?W.partnerTea:null)))||W.partner||'';   /* AA 2026-10-14：照吃飯／散步分開說、告訴玩家可以怎麼約 */
    if(!placeOk(id,P,G)) return (P.kind==='meal'?W.meal:(P.kind==='walk'?W.walk:(P.kind==='sport'?(P.minStage==='FRIEND'?W.run:W.sport):W.stranger)))||'還不太熟'; return ''; };
  /* 某一天某個時間，這個人照作息在做什麼（STORY.schedEnt，不含邀約本身）*/
  const entAt=(G,id,day,h)=>{ if(typeof STORY==='undefined'||!STORY.schedEnt) return null; const c=CHARACTERS[id]; if(!c) return null; return STORY.schedEnt(c,{day,hour:h,weekday:wdOf(G,day),flags:G.flags||{},noInvite:true}); };
  const busyAt=(G,id,day,h,stay)=>{ for(const t of [h,h+stay/2,h+stay-0.02]){ const e=entAt(G,id,day,t); if(e&&D().busyActs.includes(e.act)) return e; } return null; };
  const isOpen=(zone,h,day)=>typeof PLACES==='undefined'||!PLACES.isOpen||(PLACES.isOpen(zone,h,day)&&PLACES.isOpen(zone,Math.min(h+0.5,23.99),day));
  const live=iv=>iv.state==='accepted'||iv.state==='going'||iv.state==='offered'||iv.state==='changed';
  const clash=(G,who,day,h,stay,skip)=>(G.invites||[]).find(iv=>iv!==skip&&live(iv)&&iv.day===day&&(iv.who===who||who==null)&&Math.abs(iv.h-h)<Math.max(stay,(S.place(iv.place)||{}).stay||1)+0.25);
  /* 這個時間可不可以（不看關係）：開著、沒和別人約、作息沒事、不是半夜 */
  const hoursOf=(G,P,day)=>{ if(P.hoursFrom&&typeof PLACES!=='undefined'&&PLACES.windowsOf){ const ws=PLACES.windowsOf(P.hoursFrom,day); if(ws!==undefined) return ws&&ws[0]?ws[0]:[99,0]; }   /* hoursFrom：照 places.js 那一區的開放時間（法圖：學期中平日 08:10～21:45、週末 09:10～17:00，寒暑假另外；AA_535b 2-1）*/
    return P.hoursBy?([0,6].includes(wdOf(G,day))?P.hoursBy.we:P.hoursBy.wk):P.hours; };   /* hoursBy：平日、週末不同（羽球平日 12:00～21:00、週末 9:00～17:00，AA_126 6-6）*/
  const winOk=(G,P,day,h)=>{ const hr=hoursOf(G,P,day); return (!P.days||P.days.includes(wdOf(G,day)))&&(!P.avail||P.avail(G,day))&&(!hr||(h>=hr[0]-1e-6&&h+P.stay<=hr[1]+1e-6)); };   /* 只有某些星期、某段時間能約的地點（DL-12：半熟週末早上、一盞週三到週日下午）*/
  const myExam=(G,day,h,stay)=>typeof CLS!=='undefined'&&CLS.examAt?CLS.examAt(G,day,h,h+stay):null;   /* 祐廷自己的考試（D14-T3：邀約避開）*/
  const tripAt=(G,day,h,stay)=>typeof DATE!=='undefined'&&DATE.tripAt?DATE.tripAt(G,day,h,stay):null;   /* 已經約好的校外約會那段時間（BUG-DATE-OVERLAP-1021；兩天一夜佔兩天）：和「你那個時間已經約了別人」一樣處理 */
  const free=(G,id,P,day,h)=>h>=(P.hours&&P.hours[0]<8?P.hours[0]:8)&&h+P.stay<=23.5&&isOpen(P.zone,h,day)&&winOk(G,P,day,h)&&!clash(G,id,day,h,P.stay)&&!clash(G,null,day,h,P.stay)&&!tripAt(G,day,h,P.stay)&&!busyAt(G,id,day,h,P.stay)&&!myExam(G,day,h,P.stay);
  S.freeAt=(G,id,P,day,h)=>free(G,id,P,day,h);
  S.busyAt=(G,id,day,h,stay)=>busyAt(G,id,day,h,stay);   /* 校外約會的預約檢查用（date3d.js 的 DATE.check：她那時候上課、上班）*/   /* 這個時間本身可不可以（個人規則用：柏翰「九點十分」）*/
  /* 改天：從 h0 起找下一個可以的時間（同一天每 30 分鐘，之後三天的固定時間）*/
  S.nextFree=function(G,id,P,day,h0){ for(let h=Math.ceil(h0*2)/2; h<=22; h+=0.5) if(free(G,id,P,day,h)) return {day,h}; for(let k=1;k<=3;k++) for(const h of (P.times||D().times.concat([10,14]))) if(free(G,id,P,day+k,h)) return {day:day+k,h}; return null; };   /* P.times：只有這幾個時間（晨跑 06:30）*/
  /* 答不答應（使用者第 4 點）。回傳 {res:'accept'|'resched'|'decline', why, alt:{day,h,place?}, act} */
  S.decide=function(G,id,pid,day,h){ S.rec(G); let P=S.place(pid); if(!P) return {res:'decline',why:'place'};
    if(typeof STORY!=='undefined'&&STORY.present&&!(STORY.reachable?STORY.reachable(id,{day}):STORY.present(id,{day}))) return {res:'decline',why:'away'};   /* 在臺北、不在台大（BB_163）不擋：照她的作息和個人規則 */
    if(typeof MREL!=='undefined'&&MREL.zzRefusing&&MREL.zzRefusing(G,id)&&(D().mrelL2||{})[id]) return {res:'decline',why:'mrel'};   /* 子晴、芷若一起分手以後拒絕 L2（AA_227 6-6；台詞在 S.personal）*/
    if(S.partnerBlock(G,id,P)) return {res:'decline',why:'partner'};
    if(P.show&&!P.show(G,id)) return {res:'decline',why:'place'};   /* 還沒開放的地點（茶席：WZ-T3 以後）*/
    if(!placeOk(id,P,G)) return {res:'decline',why:'rel'};
    if(P.noRain&&day===G.day&&G.weather==='rain') return {res:'decline',why:'rain'};   /* 晨跑：下雨不能約（AA_126 6-6）。天氣只有「現在」（G.weather，換日時才決定），沒有預報：約明天的照樣可以約，那天早上下雨就取消（S.tick）*/
    if(P.rainTo&&day===G.day&&G.weather==='rain'){ const Q=S.place(P.rainTo); const ok=Q&&free(G,id,Q,day,h); return {res:'resched',why:'weather',alt:ok?{day,h,place:Q.id}:S.nextFree(G,id,P,day+1,10)}; }
    if(clash(G,null,day,h,P.stay)||tripAt(G,day,h,P.stay)) return {res:'resched',why:'mine',alt:S.nextFree(G,id,P,day,h+0.5)};   /* 你那個時間已經約了別人（校外約會也算，BUG-DATE-OVERLAP-1021）；改天的時間跳過約會那段 */
    const other=clash(G,id,day,h,P.stay); if(other) return {res:'resched',why:'booked',alt:S.nextFree(G,id,P,day,other.h+((S.place(other.place)||{}).stay||1))};
    if(!isOpen(P.zone,h,day)||!winOk(G,P,day,h)||h+P.stay>23.5) return {res:'resched',why:'closed',day,alt:S.nextFree(G,id,P,day,h+0.5)};
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
  /* ---------- 邀約回覆照階段變（D14-T9／USER_WANTS D37；AA_415 七位定稿，資料 src/data/invite_replies.js＝tools/invite/build_replies.py 產生）----------
     以安、芷若、語彤、子晴、學姊、沛珊、可昕：答應（accept）、改天（resched：她那時候有事 busy、和別人約了 booked）、婉拒（decline：階段還不到 rel）時照表選一句。
     階段＝DATE.stageNum 的六階（AA_126 4-1；D14-T9 的 next「照 DATE.stageNum 分六階＋交往中」），交往中＝7；可昕分開以後最多第 4 階（AA_351）。
     選句（AA_415 0-3）：節日 → 第一次 → 地點（含來過、外出、開車）→ 時間、心情、條件（晚上、考試週、條件）→ 一般。同一層好幾句輪流（最久沒說的先）；
       同一個人不連續兩次同一句：先找最近兩句以外的（從最高的一層往下找；這樣同一個地點連約三次三句都不一樣，AA_415 第 8 節第 2 點），找不到再只避開上一句；
       這一階的句子都只剩上一句＝往下借一階（第 4 階借第 3 階…，交往中借第 6 階）；還是沒有才重複。
     「現有」的列照原本的 acc／first／plan 句子與分檔；here、rule、partnerSay 照原本的程式（rule 給了句子就照 rule，AA_415 0-3 最後一點）。
     節日、外出、開車：AA_415 第 8 節「等 D38 節日系統、date3d.js 外出的邀約接上才會用到；沒接上以前不出現」→ S.REPLY_ON 先關（接上的人改成 true）。
     存檔：G.invReply＝{人物: {h:[最近一句, 上一句], u:{句子 id: 第幾次說}, n}}（舊存檔沒有＝從空的開始）。測試：node tests/aa415_invite_replies_unit.js */
  const RP=()=>typeof INVITE_REPLIES!=='undefined'&&INVITE_REPLIES&&INVITE_REPLIES.people?INVITE_REPLIES.people:null;
  S.REPLY_ON={'節日':false,'外出':false,'開車':false};
  S.replyHas=id=>{ const R=RP(); return !!(R&&Array.isArray(R[id])&&R[id].length); };
  S.replyRec=G=>{ if(!G.invReply||typeof G.invReply!=='object') G.invReply={}; return G.invReply; };
  S.replyStage=function(G,id){ const F=G.flags||{}; if(F['dating_'+id]===true) return 7;
    let n=typeof DATE!=='undefined'&&DATE.stageNum?DATE.stageNum(id):(typeof SOCIAL!=='undefined'&&SOCIAL.stage?Math.max(0,Math.min(6,SOCIAL.STAGES.indexOf(SOCIAL.stage(id)))):1);
    if(F['EX_'+id]&&id==='kexin') n=Math.min(n,4);   /* 分開以後只能當朋友（AA_351；AA_415 7-2 表下：沒有第 5、6 階）*/
    return S.capStage(G,id,n); };   /* 其他六位分開以後一個學期：照朋友階段（AA_434 4-3，S.cool）*/
  /* 節日：2/14、3/14、七夕、她的生日（msg2_pool.js 的 birthday）、12/24～25（AA_415 0-2）。七夕照農曆（2026～2028 和 r2y3a3d.js 的 QIXI 一樣）*/
  const QIXI=['2024-08-10','2025-08-29','2026-08-19','2027-08-08','2028-08-26','2029-08-16','2030-08-05'];
  S.replyFestival=function(G,id,day){ if(typeof CALENDAR==='undefined'||!CALENDAR.dateOf) return false; const d=CALENDAR.dateOf(day), md=String(d.m).padStart(2,'0')+'-'+String(d.d).padStart(2,'0');
    if(['02-14','03-14','12-24','12-25'].includes(md)||QIXI.includes(d.key)) return true;
    const B=typeof MSG2_POOL!=='undefined'&&MSG2_POOL.people&&MSG2_POOL.people[id]?MSG2_POOL.people[id].birthday:null; return !!B&&B===md; };
  const DK=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const actOn=(G,id,day,act,hs)=>hs.some(t=>{ const e=entAt(G,id,day,t); return !!e&&e.act===act; });
  const ytThuFree=(G,day)=>{ const d=DK('2027-12-16'); return !!(G.flags&&G.flags.YT_EV13)||(d!=null&&day>=d); };   /* 語彤事件 13「空出來的週四」（STORY.ytThuFree，照約的那一天）*/
  /* 「條件：」照字面接（AA_415 0-2）。c＝S.personal 的 ctx（pid、P、day、h、wd、year、term、postExam、r＝decide 的結果）。
     接不上的（以安「家教的時間」、外出的「看電影」「第二次外出」）在 build_replies.py 的 OFF_COND 標 off；here、rule、partnerSay 的列照原本的程式 */
  S.REPLY_COND={
    '剛下班':(G,id,c)=>actOn(G,id,c.day,'barista',[c.h-0.25,c.h-0.5,c.h-0.75,c.h-1])&&!actOn(G,id,c.day,'barista',[c.h]),   /* 芷若：一小時內才下班（作息 barista）*/
    '週末':(G,id,c)=>c.wd===6||c.wd===0,
    '上班':(G,id,c)=>!!c.r&&c.r.why==='busy'&&c.r.act==='barista',   /* 芷若的改天：那時候在 Café 上班 */
    '下雨':G=>G.weather==='rain',
    '週四、續約以後（AA_126 4-2 事件 13）':(G,id,c)=>c.wd===4&&ytThuFree(G,c.day),
    '週二週四、續約以前':(G,id,c)=>(c.wd===2||c.wd===4)&&!ytThuFree(G,c.day),
    '麵店的班':(G,id,c)=>actOn(G,id,c.day,'help',[17.5,18,19,20]),   /* 語彤那天晚上在阿鳳麵店（作息 help）*/
    '週六上午':(G,id,c)=>c.wd===6&&c.h<12,
    '昨天才約過':(G,id)=>(G.invites||[]).some(iv=>iv.who===id&&iv.day===G.day-1&&['done','accepted','going','missed'].includes(iv.state)),
    '早上':(G,id,c)=>c.h<12,
    '筆試以後':(G,id,c)=>!!c.postExam,
    '口試前、出國前一週':(G,id,c)=>['2029-05-29','2028-08-02'].some(k=>{ const d=DK(k); return d!=null&&c.day>=d-7&&c.day<d; }),   /* 學姊：口試 2029-05-29（y34b3d.js M9）、出國 2028-08-02（characters.js absentDates 美國）的前一週 */
    '杜鵑花節（3 月）':(G,id,c)=>typeof CALENDAR!=='undefined'&&CALENDAR.dateOf(c.day).m===3,
    '上一次約會祐廷遲到':G=>{ const R=G.flags&&G.flags.KX_DRIFT; return !!R&&R.seen!=null&&Array.isArray(R.log)&&R.log.some(e=>e&&e.why==='late'&&e.d===R.seen); } };   /* 可昕：kxdrift3d.js 記的最後一次見面那天遲到超過 15 分鐘 */
  const RPL=['cafe','library','noodle','wenzhou','brunch','teahouse'];
  S.replyTier=row=>{ const T=row.tags||[]; if(T.includes('節日')) return 1; if(T.includes('第一次')) return 2; if(T.some(t=>RPL.includes(t)||t==='來過'||t==='外出'||t==='開車')) return 3; return T.length||row.cond?4:5; };
  S.replyPick=function(G,id,c,tb){ const R=RP(), all=R&&R[id]; if(!all||!all.length) return null; const r=c.r||{};
    const kind=r.res==='accept'?'acc':(r.res==='resched'&&(r.why==='busy'||r.why==='booked')?'resched':(r.res==='decline'&&r.why==='rel'?'decline':null)); if(!kind) return null;
    const n=S.replyStage(G,id), sec=(G.stage||'law')==='econ'?'y0':'law', ON=S.REPLY_ON||{};
    const been=(G.invites||[]).some(iv=>iv.who===id&&iv.place===c.pid&&iv.state==='done');   /* 來過＝和她一起去過（見到了）*/
    const tagOk=t=>RPL.includes(t)?t===c.pid:t==='第一次'?!!c.first:t==='來過'?been:t==='晚上'?c.h>=19:t==='考試週'?!!(c.term&&c.term.exam):t==='大一'?c.year<=1:t==='大二起'?c.year>=2:
      t==='節日'?!!ON['節日']&&S.replyFestival(G,id,c.day):(t==='外出'||t==='開車')?!!ON[t]&&!!(c.outing&&(t==='外出'||c.drive)):false;
    const whenOk=W=>!W||(!(W.today&&c.day!==G.day)&&!(W.before!=null&&!(c.h<W.before))&&!(W.from!=null&&c.h<W.from-1e-6)&&!(W.endBy!=null&&c.h+(c.P.stay||1)>W.endBy+1e-6)
      &&!(W.wd&&!W.wd.includes(c.wd))&&!(W.notPlace&&c.pid===W.notPlace)&&!(W.zrShift&&!actOn(G,id,c.day,'barista',[18,19,20,21])));
    const fa=(d,h)=>S.freeAt(G,id,c.P,d,h)?{day:d,h}:null;
    /* 改天的時間（這一句說了「明天」「五點以後」…）：算不到＝不用這一句；沒寫的照 decide 的 alt */
    const altFor=row=>{ const A=row.at; if(!A) return undefined; if(A.today&&c.day!==G.day) return null; if(A.before!=null&&!(c.h<A.before)) return null; let a=null;
      if(A.day==='same'){ if(c.h>=A.from) return null; a=A.exact?fa(c.day,A.from):S.nextFree(G,id,c.P,c.day,A.from); if(a&&a.day!==c.day) a=null; }
      else if(A.day==='tomorrow'){ const d=G.day+1; a=fa(d,c.h)||S.nextFree(G,id,c.P,d,10); if(a&&a.day!==d) a=null; }
      else if(A.day==='nextweek'){ const d=c.day+((8-c.wd)%7||7); a=S.nextFree(G,id,c.P,d,10); }
      else if(A.wd!=null){ let d=c.day+1; while(wdOf(G,d)!==A.wd&&d<c.day+8) d++; a=fa(d,c.h)||S.nextFree(G,id,c.P,d,10); if(a&&a.day!==d) a=null; }
      return a; };
    const COND=S.REPLY_COND||{}, alts={};
    const apart=!!(G.flags&&G.flags['EX_'+id])&&!(G.flags&&G.flags['dating_'+id]===true);   /* 可昕「（分開以後）」的列 */
    const ok=row=>row.k===kind&&!row.off&&(!row.sec||row.sec===sec)&&(!row.apart||apart)&&(row.tags||[]).every(tagOk)&&(!row.cond||(!!COND[row.cond]&&!!COND[row.cond](G,id,c)))&&whenOk(row.when)
      &&(kind!=='resched'||!row.at||(alts[row.id]=altFor(row))!=null);
    const inSt=(row,k)=>k>=row.st[0]&&k<=row.st[1];
    const P0=all.filter(row=>inSt(row,n)&&ok(row)); if(!P0.length) return {governs:true};   /* 這一階沒有合的句子：答應照原本的 acc／first（或旁白），改天、婉拒用旁白 */
    const P1=kind==='acc'&&n>=2?all.filter(row=>!inSt(row,n)&&inSt(row,n-1)&&ok(row)):[];   /* 只用來避免重複（這一階只剩上一句的時候）*/
    const st=(S.replyRec(G)[id])||{}, h=Array.isArray(st.h)?st.h:[], u=(st.u&&typeof st.u==='object')?st.u:{};
    const best=(pool,avoid)=>{ for(let t=1;t<=5;t++){ const L=pool.filter(row=>S.replyTier(row)===t&&!avoid.includes(row.id)); if(L.length) return L.slice().sort((a,b)=>(u[a.id]!=null?u[a.id]:-1)-(u[b.id]!=null?u[b.id]:-1))[0]; } return null; };
    const row=best(P0,h.slice(0,2))||best(P0,h.slice(0,1))||best(P1,h.slice(0,2))||best(P1,h.slice(0,1))||best(P0,[]); if(!row) return {governs:true};
    const L=row.ex==='plan'?(tb&&tb('plan')):null;   /* 現有（plan）：照原本的函式（以安：讀書會開始以前「一起寫憲法作業」）*/
    return {row,lines:(L||row.lines).slice(),alt:row.at?alts[row.id]:undefined}; };
  /* 表上台詞一樣的那一列（沒有＝null）*/
  S.replyRow=function(id,lines){ const R=RP(); if(!R||!R[id]||!lines) return null; const k0=JSON.stringify(lines); return R[id].find(row=>JSON.stringify(row.lines)===k0)||null; };
  /* 記下說了哪一句：表上的句子記 id；rule、here、原本 acc 的句子對得到表上同一句的也記那個 id（不會下一次又挑到同一句）*/
  S.replyMark=function(G,id,rid,lines){ const R=RP(); if(!R||!R[id]||!lines||!lines.length) return; const M=S.replyRec(G), m=M[id]||(M[id]={h:[],u:{},n:0});
    if(!Array.isArray(m.h)) m.h=[]; if(!m.u||typeof m.u!=='object') m.u={};
    if(!rid){ const hit=S.replyRow(id,lines); rid=hit?hit.id:'~'+String(typeof lines[0]==='string'?lines[0]:(lines[0].me||'')).slice(0,24); }
    m.n=(m.n|0)+1; m.h.unshift(rid); m.h.length=Math.min(m.h.length,2); m.u[rid]=m.n; };
  S.personal=function(G,id,P,day,h,r){ const p=(D().people||{})[id]; if(!p||!P||!r) return r;
    if(r.why==='mrel'){ const M=(D().mrelL2||{})[id]; if(M&&M.length){ const F=G.flags||(G.flags={}), N=F.MREL_L2_N||(F.MREL_L2_N={}), k=N[id]|0; N[id]=k+1; return Object.assign({},r,{lines:M[k%M.length].slice()}); } return r; }   /* 不說理由、兩句輪流（AA_227 6-6）*/
    const t=typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(day):null, F=G.flags||{};
    const c={pid:P.id,P,day,h,wd:wdOf(G,day),band:bandOf(id),year:t?(+String(t.id).charAt(1)||1):1,term:t,
      first:!(G.invites||[]).some(iv=>iv.who===id&&iv.place===P.id&&(iv.state==='done'||iv.state==='accepted'||iv.state==='going'||iv.state==='missed')), postExam:S.sisPostExam(day,h),
      w8:typeof STORY!=='undefined'&&STORY.sisW8?STORY.sisW8(G):(typeof EVENTS!=='undefined'&&!!EVENTS.cond&&!!EVENTS.cond({events:['ev_sis_collapse']})),
      dating:typeof ROM!=='undefined'&&ROM.knows?ROM.knows(G,id).length>0:Object.keys(F).some(k=>/^dating_/.test(k)&&!!F[k]),face:!!r.face,r};   /* face：當面約（INV.flow 有 n）；手機約＝false（BB_172 10-1 第 17 點：阿凱、明軒的手機版照訊息體）*/   /* 她知道祐廷有伴侶（BB_191 9-4 #6：芷若宵夜「你可以多帶幾個人」；不是祐廷有沒有伴侶）*/
    const done=(o,rid)=>{ if(o.lines&&S.replyHas(id)) S.replyMark(G,id,rid||null,o.lines); return o; };   /* AA_415：七位女主角記下說了哪一句（不連續兩次同一句；rule、here 的句子也記）*/
    const out=Object.assign({},r), q=p.rule?p.rule(G,c,S):null;
    if(q){ Object.assign(out,q); if(out.res==='resched'&&!out.alt){ out.res='decline'; } return done(out); }   /* rule 給了句子＝照 rule（AA_415 0-3 最後一點）*/
    const fp=v=>v&&!Array.isArray(v)&&(v.face||v.phone)?(c.face?v.face||v.phone:v.phone||v.face):v;   /* {phone, face}：手機／當面兩版 */
    const tb=k=>{ let v=p[k]&&p[k][P.id]; if(typeof v==='function') v=v(G,c); v=fp(v); return v==null?null:(Array.isArray(v)?v:(fp(v[c.band])||null)); };   /* 函式＝照時間換句（以安：讀書會開始以前，AA_238 5-7）*/
    const H=tb('here'); if(H&&(r.res==='accept'||r.res==='resched')){ const e=entAt(G,id,day,h);   /* 照作息，她那時候本來就在那裡（芷若上班的 Café、以安在總圖）*/
      if(e&&(e.zone===P.zone||(P.zone==='library_hall'&&e.zone==='library'))){ out.res='here'; out.lines=H.slice(); delete out.alt; return done(out); } }
    if(P.sport&&r.res==='accept'){ let v=p.acc&&p.acc[P.id]; if(typeof v==='function') v=v(G,c);   /* A＝有點熟、R＝朋友以上（交往中、曖昧也算朋友以上：照 SOCIAL.stage，和地點的門檻同一把尺）*/
      const sb=typeof SOCIAL!=='undefined'&&SOCIAL.stage&&SOCIAL.STAGES?(SOCIAL.STAGES.indexOf(S.stageOf(G,id))>=SOCIAL.STAGES.indexOf('FRIEND')?'R':'A'):c.band, L=v==null?null:(Array.isArray(v)?v:(v[sb]||null)); if(L){ out.lines=L.slice(); return done(out); } if((D().sportPlain||[]).includes(id)){ out.lines=['（他答應了。）']; return done(out); } }   /* 一起運動（AA_417 第 3 節）：答應照 §3 的 acc（優先於 AA_415 的一般句；第一次去也用這一句，子晴、可昕第一次的那句在見面時說＝firstAt）；男生朋友沒有這一句＝旁白「（他答應了。）」*/
    if(!RPL.includes(P.id)&&!P.sport){ const own=r.res==='accept'?((c.first&&tb('first'))||tb('acc')):(r.res==='resched'&&(r.why==='busy'||r.why==='booked')?tb('plan'):null); if(own){ out.lines=own.slice(); return done(out); } }   /* AA_415 表沒有的地點（慢讀咖啡，AA_535 4-2）：照那個地點自己的 first／acc／plan，不借表上不限地點的一般句 */
    const pk=S.replyPick(G,id,c,tb);   /* AA_415（D14-T9）：照階段、地點、時間、來過沒選一句；沒有表的人＝null */
    if(pk&&pk.row){ out.lines=pk.lines; if(pk.alt!==undefined) out.alt=pk.alt; return done(out,pk.row.id); }
    if(r.res==='accept'){ const L=(c.first&&tb('first'))||tb('acc'); if(L&&!(pk&&pk.governs&&S.replyRow(id,L))) out.lines=L.slice(); }   /* 表上這一階沒有句子＝照原本的 acc、first；
       那一句在表上（「現有」）就照表的條件，不從這裡繞回來（學姊第 3 階第一次約半熟不說「這次我點鬆餅」——表上要「來過」；可昕經濟系那一年不說「我從政大過來」）*/
    else if(r.res==='resched'&&(r.why==='busy'||r.why==='booked')&&!(pk&&pk.governs)){ const L=tb('plan'); if(L) out.lines=L.slice(); }   /* 有表的人改天只照表（表上的「現有（plan）」帶著條件，例：芷若「我在上班。……」只在上班的時候）*/
    return done(out); };
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
    if(r.why==='rain') return (D().why||{}).rain||'下雨了，不能晨跑。';   /* 晨跑：下雨不能約（AA_126 6-6）*/
    if(r.why==='mine') return '你那個時間已經約了別人。'+(alt?'改成 '+alt+'？':'');
    if(r.why==='booked') return nm+'那個時間已經跟人約了。'+(alt?'問你 '+alt+' 可不可以。':'');
    if(r.why==='closed') return (S.offWhy(G,P,r.day!=null?r.day:G.day)||P.name+'那個時間沒開')+'。'+(alt?nm+'問 '+alt+' 可不可以。':'');   /* 公休日寫「慢讀咖啡週二休。」（AA_535 4-1）*/
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
      if(iv.state==='going'){ if(iv.zone!==G.zone&&(S.privateZone(G.zone)||(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G)))) continue; return {zone:G.zone,act:'follow',invite:iv,days:[G.weekday],from:0,to:24}; }   /* 一起走的路上走進宿舍、回臺北的家＝作罷（S.arrive、tick 的 dropGoing）：作息不再把她生在你旁邊（BUG-WALK-DORM-FOLLOW-1022，BB 10-22 06:1x：手機快速前往宿舍，她被帶進男生宿舍的房間）*/
      if(iv.state==='accepted'&&iv.day===G.day&&h>=iv.h-0.25&&h<iv.h+S.WAIT_H) return P.meetAt?{zone:P.zone,act:'linger',at:P.meetAt,invite:iv,days:[G.weekday],from:iv.h-0.25,to:iv.h+S.WAIT_H}:{zone:P.zone,act:P.sitAct||'wait',invite:iv,days:[G.weekday],from:iv.h-0.25,to:iv.h+S.WAIT_H}; }   /* meetAt：在那一區的哪裡等（晨跑：椰林大道傅鐘前；校園的入口離得太遠）*/
    return null; };
  /* 現在可以「見面」：約好的時間、人在那裡（talkCharacter 先問這裡）*/
  S.meetable=function(G,id){ const e=S.entryFor(G,id); return e&&e.invite&&e.invite.state==='accepted'&&G.zone===e.zone?e.invite:null; };
  /* 見面：一起待一段時間（旁白）、時間過去、留一筆小記憶、熟一點點（不推進戀愛：使用者第 7 點）、習慣記憶 */
  /* ---------- 一起運動的約會（AA_126 6-6、AA_417 第 3 節，AA-B 2026-10-23 定稿；USER_WANTS D40）：羽球 gym_badminton（新體育館 1F）、晨跑 run_avenue（椰林大道）----------
     見面：子晴、可昕照各自的 sport（第一次＝firstAt；一起的時候三句輪流；結束一句），其他人照 INVITE_DATA.sport 的共用旁白。
     數值：大家照 AA_124 一般的「一起運動」（SOCIAL.ACT.sport）；子晴、可昕另外自在 +3、她的戀愛 +3（AA_126 6-3，一天一次；交往中也一樣）。
     羽球＝和一個人打羽球一樣算體能（src/gym3d.js：+1，每週最多 2 次，和自己去打的共用次數）。存檔：G.flags.sportChatN＝{人物:地點: 第幾次}（輪流）*/
  S.sportLines=function(G,id,pid){ const p=(D().people||{})[id]||{}, sh=(D().sport||{})[pid]||{};
    const own=p.sport&&p.sport[pid]&&!(id==='kexin'&&(G.stage||'law')!=='law')?p.sport[pid]:null;   /* 可昕的版本是政大那幾年（「從山上下來」）*/
    if(!own) return {during:(sh.during||[]).slice(),end:(sh.end||[]).slice(),next(){},own:false};
    const F=G.flags||(G.flags={}), N=F.sportChatN||(F.sportChatN={}), k=id+':'+pid, n=N[k]|0, L=own.during||[];
    return {during:L.length?L[n%L.length].slice():[],end:(own.end||[]).slice(),next(){ N[k]=n+1; },own:true}; };
  S.SPORT_BONUS=['heroine_04','kexin'];
  S.sportAfter=function(G,id,P){ const DY=G.daily||(G.daily={});
    if(S.SPORT_BONUS.includes(id)&&typeof SOCIAL!=='undefined'&&SOCIAL.adjust){ const k='sportRom_'+id; if(DY[k]!==G.day){ DY[k]=G.day; SOCIAL.adjust(id,{comf:3,npcRom:3}); } }
    if(P.id==='gym_badminton'){ const r=DY.gym=DY.gym||{}; if(!Array.isArray(r.seen)) r.seen=[]; const wd=typeof CALENDAR!=='undefined'?CALENDAR.dateOf(G.day).wd:((G.weekday|0)||7), wk=G.day-(wd-1);
      if(r.wk!==wk){ r.wk=wk; r.wkN=0; r.seen=[]; } if((r.wkN|0)<2){ r.wkN=(r.wkN|0)+1; r.fit=Math.min(100,(r.fit|0)+1); } r.fitDay=G.day; r.sportDay=G.day; }   /* 和 gym3d.js 的打羽球同一套 */
    else if(P.id==='run_avenue'){ const r=DY.gym=DY.gym||{}; r.sportDay=G.day; } };
  if(typeof SOCIAL!=='undefined'&&SOCIAL.MEMORY_LABEL){ SOCIAL.MEMORY_LABEL.SPORT_BADMINTON=SOCIAL.MEMORY_LABEL.SPORT_BADMINTON||'一起打羽球'; SOCIAL.MEMORY_LABEL.SPORT_RUN=SOCIAL.MEMORY_LABEL.SPORT_RUN||'一起晨跑'; SOCIAL.MEMORY_LABEL.SLOWREAD_TOGETHER=SOCIAL.MEMORY_LABEL.SLOWREAD_TOGETHER||'一起在慢讀咖啡念書'; }   /* 慢讀（AA_535 4-1）*/   /* 人物頁的記憶名稱 */
  /* 羽球小短片（BADMINTON-CLIP-1027，使用者 X106「跟陳羽彤打羽球也只是對話帶過? 不能做個小短片?」；演出 AA_485 第 2 節；src/badminton_clip3d.js）：
     和這個人第一次一起打（之前沒有一筆 done 的羽球邀約）＝完整版三個鏡頭，之後只演鏡頭 2；可以跳過。最後一個鏡頭那一句（BADCLIP.LINES：以安、語彤、學姊、沛珊）只在完整版演完、沒跳過時說。
     人在新體育館（G.zone==='gym'）才演；短片要看到 3D，演的時候先收 ADV、演完照原本的樣子開回來。*/
  S.badClip=async function(GM,iv,who){ const E=GM.E; if(typeof BADCLIP==='undefined'||!BADCLIP.play||!E||!E.player||!GM.G||GM.G.zone!=='gym') return false;   /* 看 G.zone（區域物件 E.zone 沒有 id：原本寫 E.zone.id，短片永遠不演——10-27 錄影抓到）*/
    const G=GM.G, full=!(G.invites||[]).some(q=>q!==iv&&q.who===iv.who&&q.place==='gym_badminton'&&q.state==='done');
    const adv=typeof ADV!=='undefined'&&ADV.active; if(adv) ADV.end();
    let ok=false; try{ ok=await BADCLIP.play(GM,{who:iv.who,full}); } finally { if(adv) ADV.begin({background:'blur',right:iv.who}); }
    const L=full&&ok&&BADCLIP.LINES?BADCLIP.LINES[iv.who]:null; if(L) await GM.say(who,L); return ok; };
  /* 約好的這一次有自己的一場（iv.ev＝STORY_EVENTS 的 id；AA_497：芯慈慈 3 的白天版、大四的讀書會、明軒的德文口說，src/sup497_3d.js）：
     見面那一段演這一場（取代地點的一般旁白、第一次的那一句、道別句）；之後照舊時間往後、地點記憶、熟一點點、對方約的又赴約信任 +1。找不到那一場＝照一般的見面 */
  S.meetEv=async function(GM,iv,n){ const G=GM.G, P=S.place(iv.place), nm=nameOf(iv.who), ev=iv.ev&&typeof STORY_EVENTS!=='undefined'?STORY_EVENTS.find(e=>e.id===iv.ev):null;
    if(!P||!ev||typeof EVENTS==='undefined'||!EVENTS.runLines) return false;
    iv.state='done'; GM.sceneBegin({adv:iv.who}); try{ if(iv.preNarr) await GM.say(null,iv.preNarr);   /* iv.preNarr：那一場前面先一句旁白（AA_539 7/20：見面在總圖大廳那一層，先「（你走上三樓。她坐在靠窗的位子。）」）*/ await EVENTS.runLines(ev.dialogue||[],ev);
      if(G.events){ G.events.done=G.events.done||{}; G.events.last=G.events.last||{}; G.events.done[ev.id]=(G.events.done[ev.id]||0)+1; G.events.last[ev.id]=G.day; }
      if(typeof ev.after==='function'){ try{ ev.after(G,GM,iv); }catch(e){ console.warn('INV.meetEv after',e); } }
      await GM.fade(true); GM.advance(P.stay); await GM.fade(false); GM.caption('',[P.name,nm,'（'+(P.stay>=1?P.stay+' 小時':Math.round(P.stay*60)+' 分鐘')+'）'].join('・'),2600);
      if(typeof SOCIAL!=='undefined'){ if(SOCIAL.remember) SOCIAL.remember(iv.who,P.memory,P.name); if(SOCIAL.activity){ SOCIAL.activity(iv.who,{cafe:'cafe',library:'library',lib_b1:'library',noodle:'meal'}[P.id]||'cafe'); if(iv.by==='npc') SOCIAL.activity(iv.who,'acceptInvite'); } else if(SOCIAL.adjust) SOCIAL.adjust(iv.who,{fam:2}); }
      S.msg(G,iv.who,'和'+nm+'在'+P.name+'。',iv);
    } finally { GM.sceneEnd(); }
    if(n){ n.beh='idle'; n.path=null; } if(GM.autosave) GM.autosave(); return true; };
  S.meet=async function(GM,iv,n){ const G=GM.G, P=S.place(iv.place), nm=nameOf(iv.who); if(!P) return;
    if(iv.ev&&await S.meetEv(GM,iv,n)) return;
    if(iv.te&&typeof TERMEND!=='undefined'&&TERMEND.dinner){ iv.state='done'; GM.sceneBegin({adv:iv.who}); try{ await TERMEND.dinner(GM,{te:{who:iv.who,kind:iv.te.kind,term:iv.te.term,place:iv.place,placeName:P.name}}); await GM.fade(true); GM.advance(P.stay); await GM.fade(false);
        if(typeof SOCIAL!=='undefined'&&SOCIAL.activity) SOCIAL.activity(iv.who,'meal'); S.msg(G,iv.who,'和'+nm+'吃了學期末的飯。',iv); } finally { GM.sceneEnd(); } if(n){ n.beh='idle'; n.path=null; } if(GM.autosave) GM.autosave(); return; }   /* 玩家自己約的期末飯：整場照 TERMEND.dinner（心意的接回家的路上）*/
    iv.state='done'; GM.sceneBegin({adv:iv.who}); try{ const lines=((D().people[iv.who]||{}).scene||{})[P.id], who={name:nm,obj:n&&n.obj,charId:iv.who}, SO=typeof SOCIAL!=='undefined'?SOCIAL:{};
      if(iv.ask) await S.walkAsk(GM,iv,who);   /* 一起走路時抽到的選項句：走到了、見面開始前選（BB_120 1-7c） */
      if(iv.fest&&typeof FEST!=='undefined'&&FEST.meet) await FEST.meet(GM,iv,who);   /* 約在她節日的見面（AA_416）：先演節日那一段，再照那個地方原本的內容 */
      if(SO.playUp) await SO.playUp(GM,who,iv.who,{place:P.id,outing:true});   /* 升階以後的下一次見面：先說門檻台詞（AA_124 1-6、BB_120 第 1 節）；傳見面的地點（學姊在一盞這類不讀書的地方升到朋友換一版，AA_383 第 6 節） */
      const ml=SO.meetLine?SO.meetLine(iv.who,P.id):null;   /* 見面時的旁白：地點×階段（BB_120 第 1 節；沒有那一格照舊） */
      const sp=P.sport?S.sportLines(G,iv.who,P.id):null;   /* 一起運動（AA_417 第 3 節）：第一次（子晴、可昕）→ 一起的時候（輪流一句）→ 打完、跑完 → 結束 */
      const FAof=()=>{ let FA=((D().people[iv.who]||{}).firstAt||{})[P.id]; if(typeof FA==='function') FA=FA(G); return FA&&!(G.invites||[]).some(q=>q!==iv&&q.who===iv.who&&q.place===P.id&&q.state==='done')?FA:null; };
      if(sp){ const FA=FAof(); if(FA) await S.playLines(GM,who,FA); if(P.id==='gym_badminton') await S.badClip(GM,iv,who); if(sp.during.length) await S.playLines(GM,who,sp.during); sp.next(); }   /* 羽球：答應、第一次那一句 → 短片 → 一起的時候（AA_485 第 2 節）*/
      else { if(lines&&lines.length){ for(const t of lines) await GM.say(who,t); } else if(P.scene) await P.scene(GM,iv,who); /* 地點自己的見面（茶席：AA_167，src/wzlines3d.js）*/ else if(ml) await GM.say(/^「/.test(ml)?who:null,ml); else await GM.say(null,'你和'+nm+P.verb.replace(/^去/,'在')+'。');
        { const FA=FAof(); if(FA) await S.playLines(GM,who,FA); } }   /* 第一次和她（他）去那個地方：在那裡多說的（BB_158 的 first：點完餐、脫鞋、老闆娘說的三分四十秒）*/
      if(!P.ownMeal){ await GM.fade(true); GM.advance(P.stay); await GM.fade(false); } GM.caption('',[P.name,nm,'（'+(P.stay>=1?P.stay+' 小時':Math.round(P.stay*60)+' 分鐘')+'）'].join('・'),2600);   /* ownMeal：地點的 scene 自己點餐、走時間（Pasta 118 照 L118.order，AA_480 第 5 節）*/
      if(typeof SOCIAL!=='undefined'){ if(SOCIAL.remember) SOCIAL.remember(iv.who,P.memory,P.name); if(SOCIAL.activity){ SOCIAL.activity(iv.who,P.sport?'sport':({cafe:'cafe',library:'library',noodle:'meal',wenzhou:'walk',brunch:'meal',teahouse:'cafe',slowread:'library'}[P.id]||(P.kind==='meal'?'meal':'cafe'))); if(iv.by==='npc') SOCIAL.activity(iv.who,'acceptInvite'); } else if(SOCIAL.adjust) SOCIAL.adjust(iv.who,{fam:2}); }
      if(typeof SOCIAL!=='undefined'&&SOCIAL.adjust&&typeof DATE!=='undefined'&&DATE.stageNum&&DATE.stageNum(iv.who)>=3&&iv.who!=='kexin'){ const DY=G.daily||(G.daily={}), k='romAlone_'+iv.who; if(DY[k]!==G.day){ DY[k]=G.day; SOCIAL.adjust(iv.who,{npcRom:1,rom:1}); } }   /* 校園單獨約出來（AA_128 1-1）：她的戀愛 +1、祐廷的戀愛 +1，同一個人一天一次；AA_243 第 1 節（BB_199 P0-1 方案 A）：從朋友（第 3 階）開始，不是第 5 階 */   /* AA_124 1-2：照地點（Café、總圖、吃飯、溫州街）；對方約的又赴約，信任 +1 */
      if(sp) S.sportAfter(G,iv.who,P);   /* 子晴、可昕：自在 +3、她的戀愛 +3（AA_126 6-3）；羽球＝打羽球的體能 */
      if(typeof WISH!=='undefined'&&WISH.meetMention) await WISH.meetMention(GM,iv,who);   /* 心願：聊天提到（DATE-C4、C5；src/wish3d.js）——見面那一段演完、道別以前，條件到了說一次 */
      { const AM=(D().people[iv.who]||{}).afterMeet; const L=typeof AM==='function'?AM(G,iv,P.id):null; if(L&&L.length) for(const t of L) await GM.say(/^「/.test(t)?who:null,t); }   /* 見面之後那個人的一句（沛珊 P4b 的便條）*/
      if(sp){ if(sp.end.length) await S.playLines(GM,who,sp.end); }   /* 一起運動：「結束」是最後一句（AA_417 第 3 節），不接階段的道別句 */
      else { const by=SO.byeLine?SO.byeLine(iv.who):null; if(by) await SO.playSteps(GM,who,iv.who,by); }   /* 見面結束的一句：照現在的階段（AA_124 1-6、BB_120） */
      if(typeof EVENTS!=='undefined'&&EVENTS.habit){ EVENTS.habit('place:'+P.zone+':with:'+iv.who); if(P.kind==='meal') EVENTS.habit('meal:'+P.zone+':with:'+iv.who); }
      S.msg(G,iv.who,'和'+nm+'在'+P.name+'。',iv);
    } finally { GM.sceneEnd(); }
    if(n){ n.beh='idle'; n.path=null; } if(GM.autosave) GM.autosave(); };
  /* 每次 STORY.tick：過了約好的時間 45 分鐘還沒見到＝沒赴約（不扣分，留一筆「放過鴿子」）；一起走過去超過 2 小時沒到＝作罷；對方約你、過了時間沒回＝作罷 */
  /* 約好要真的同行（AA_137 第 7 節，使用者 2026-10-15）：約定前 30 分鐘提醒；過了 15 分鐘還沒到，她傳「你在哪？」（有聯絡方式的話）；過了 30 分鐘她自己走掉＝沒赴約（原本 45 分鐘）*/
  S.WAIT_H=0.5;
  /* 以安主動約（AA_227 3-1「她主動約」，台詞照 AA_425 第 0 節改過的版本）：週二 21:00 她私訊、約這週四讀書會（20:00～21:30）散了以後去阿鳳（21:30）。
     條件、時間、地點是 LAWWW 排的（企劃只有台詞）：法律系、這週四有公法讀書會、玩家去過讀書會、她在臺北、第 3 階以上、那個時間玩家沒有別的約；一學期一次；回覆照 S.answer（好／改天／不了）*/
  S.AN_ASK={text:'禮拜四讀書會完要不要去吃飯？我想吃巷子那家。',place:'noodle',h:21.5};
  S.anAsk=function(G){ if(!G||(G.stage||'law')!=='law'||wdOf(G,G.day)!==2||(G.hour%24)<21||typeof ACTIVITIES==='undefined'||!ACTIVITIES.on) return false;
    const t=typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(G.day):null; if(!t) return false; const F=G.flags||(G.flags={}), A=F.AN_ASK_TERM||(F.AN_ASK_TERM={}); if(A[t.id]!=null) return false;
    const thu=G.day+2, a=ACTIVITIES.list.find(x=>x.id==='public_law_group'); if(!a||!ACTIVITIES.on(a,thu,G)||!(ACTIVITIES.attendedAny&&ACTIVITIES.attendedAny(G,'public_law_group'))) return false;
    const id='heroine_01', Q=S.AN_ASK, P=S.place(Q.place); if(!P) return false;
    if(typeof STORY!=='undefined'&&STORY.present&&!(STORY.reachable?STORY.reachable(id,{day:thu}):STORY.present(id,{day:thu}))) return false;
    if(!(typeof DATE!=='undefined'&&DATE.stageNum&&DATE.stageNum(id)>=3)) return false;
    S.rec(G); if(clash(G,null,thu,Q.h,P.stay)||tripAt(G,thu,Q.h,P.stay)||(G.invites||[]).some(iv=>iv.who===id&&live(iv))) return false;
    A[t.id]=G.day; return !!S.offer(G,id,Q.place,thu,Q.h,Q.text); };
  S.tick=function(GM){ const G=GM.G; if(G) S.anAsk(G); if(!G||!Array.isArray(G.invites)) return; const h=G.hour%24, past=iv=>iv.day<G.day||(iv.day===G.day&&h>=iv.h+S.WAIT_H);
    if(S.arriveDue(GM)){ S.arrive(GM,G.zone).catch(e=>console.warn('INV.arrive',e)); return true; }   /* 讀途中存的檔回來、人已經在約好的地方（BUG-AN-NOODLE-STUCK-1027 ②）：照走到了開始，不等兩小時記成作罷 */
    for(const iv of G.invites){ if(iv.state!=='accepted'||iv.day!==G.day) continue; const P=S.place(iv.place)||{};
      if(P.noRain&&G.weather==='rain'&&h<iv.h+S.WAIT_H){ iv.state='cancelled'; const t=fmtWhy((D().why||{}).rainOff||'下雨了，和{who}的晨跑取消。',{who:nameOf(iv.who)}); S.msg(G,iv.who,t,iv); if(GM.toast) GM.toast(t,4200); continue; }   /* 晨跑那天早上下雨＝取消（AA_126 6-6「下雨不能約」；沒有天氣預報，約的時候只看得到現在的天氣）*/
      if(!iv.rem&&h>=iv.h-0.5&&h<iv.h){ iv.rem=1; if(GM.toast) GM.toast('提醒：'+hh(iv.h)+' 和'+nameOf(iv.who)+'約在'+(P.name||'')+'。',4200); }
      if(!iv.where&&h>=iv.h+0.25&&h<iv.h+S.WAIT_H&&G.zone!==P.zone){ iv.where=1; if(typeof PHONE!=='undefined'&&S.hasContact(G,iv.who)){ PHONE.post(G,{th:'p:'+iv.who,from:iv.who,text:'你在哪？'}); if(GM.phoneBadge) GM.phoneBadge(); if(GM.toast) GM.toast('手機｜'+nameOf(iv.who)+'：你在哪？',3600); } } }
    for(const iv of G.invites){ if(iv.state==='accepted'&&past(iv)&&!(iv.waitSeat&&G.zone===iv.zone)){ iv.state='missed'; S.msg(G,iv.who,'你沒有赴約：'+when(G,iv.day,iv.h)+'，'+((S.place(iv.place)||{}).name||'')+'（'+nameOf(iv.who)+'）。',iv);
        if(typeof SOCIAL!=='undefined'&&SOCIAL.remember) SOCIAL.remember(iv.who,'MISSED_DINNER',(S.place(iv.place)||{}).name||''); }
      else if(iv.state==='going'&&(iv.day<G.day||h>=iv.h+2)){ iv.state='cancelled'; S.msg(G,iv.who,'和'+nameOf(iv.who)+'一起去'+((S.place(iv.place)||{}).name||'')+'的事，後來作罷了。',iv); const n=S.npcOf(GM,iv.who); if(n){ n.beh='idle'; } }
      else if((iv.state==='offered'||iv.state==='changed')&&past(iv)) iv.state='cancelled'; }
    for(const iv of G.invites){ if(iv.state==='going'&&typeof HOME!=='undefined'&&HOME.at&&HOME.at(G)) S.dropGoing(GM,iv); }   /* 一起走的時候回臺北的家＝作罷（使用者 10-21 23:1x：回宿舍學姊還跟著）*/
    S.autoStart(GM); S.goPrompt(GM).catch(e=>console.warn('INV.goPrompt',e)); };
  /* 約會快到的提醒可以直接過去（UX-INV-GO-1023，使用者 10-23 08:2x「現在有提醒有約會快到 應該要新增可以直接到約會地點的功能」）：
     約好的時間前 30 分鐘到約好的時間後 15 分鐘、人不在那一區、空下來＝問一次「直接過去」（照手機的快速前往：花路程時間、落點照 PLACES.quickList 那一區的；沒去過也可以）；
     手機「今天約好的」每一筆也有「前往」（S.goNow）。該出發的出遊（OUT）先問，這裡不搶。系統字，不是台詞 */
  let goBusy=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['invites3d:goBusy']=()=>{ goBusy=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
  S.goTarget=function(G,iv){ const P=S.place(iv.place)||{}, QL=typeof PLACES!=='undefined'&&PLACES.quickList?PLACES.quickList():[], Q=QL.find(p=>p&&p[0]===P.zone&&P.meetAt&&P.name&&String(p[1]).includes(P.name))||QL.find(p=>p&&p[0]===P.zone); return {zone:P.zone,name:P.name||'',spawn:Q&&Q[2]?Q[2]:null}; };   /* 晨跑：落在「椰林大道・傅鐘」（不是校園的第一個落點霖澤館前）*/
  S.canGo=function(G,iv){ if(!iv||iv.state!=='accepted'||iv.day!==G.day) return false; const h=G.hour%24, P=S.place(iv.place)||{}; return !!P.zone&&G.zone!==P.zone&&h<iv.h+S.WAIT_H; };
  S.goDue=function(G){ if(!G||!Array.isArray(G.invites)) return null; const h=G.hour%24; return G.invites.find(iv=>S.canGo(G,iv)&&!iv.goAsked&&h>=iv.h-0.5&&h<iv.h+0.25)||null; };
  S.goNow=async function(GM,iv){ const G=GM.G, t=S.goTarget(G,iv); if(!S.canGo(G,iv)||!GM.quickGo) return false; await GM.quickGo([t.zone,t.name,t.spawn],{force:true}); return G.zone===t.zone; };
  S.goPrompt=async function(GM){ const G=GM&&GM.G; if(goBusy||!G||!GM.choose) return false; const iv=S.goDue(G); if(!iv) return false;
    if((GM.E&&GM.E.player&&GM.E.player.busy)||(typeof OUT!=='undefined'&&OUT.due&&OUT.due(G))) return false;   /* 該出發的出遊先問（同一輪 OUT.tick 接著跑，不能兩個選單一起開）*/
    iv.goAsked=1; goBusy=true; const t=S.goTarget(G,iv); let k=1;
    try{ GM.sceneBegin(); try{ k=await GM.choose([{t:'直接過去：和'+nameOf(iv.who)+'約在'+t.name+'（'+hh(iv.h)+'）',hint:'照快速前往的路程時間'},{t:'自己走過去'}],{menu:true}); } finally { GM.sceneEnd(); }
      if(k===0) await S.goNow(GM,iv); return k===0; } finally { goBusy=false; } };
  /* 約好的事：時間到了、兩個人都在約定的地方＝直接開始，不用一起走過去、不用先找她說話（使用者 10-21 23:2x：「有約好任何事情 改成只要兩個都在場 就不用一起走或說話才能開始」）。
     她從約好的時間前 15 分鐘就在那裡（S.entryFor）；你進那個區域、她也生出來了＝開始。有座位的地方兩個人一起坐下（淡出淡入），接著照 S.meet。STORY.tick 只在玩家空下來的時候跑 */
  let autoBusy=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['invites3d:autoBusy']=()=>{ autoBusy=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
  /* 開演當下就鎖住（BUG-AN-NOODLE-STUCK-1027，使用者 10-27 20:3x「跟沈以安吃完飯卡住在她說話的畫面」）：S.arrive 走進門以後先等 0.9 秒、S.autoStart 用 Promise.then 延後，
     原本都沒有先 sceneBegin——這段空檔玩家按「和她說話」、同一格的 EVENTS.tick（自動事件）都會另外開一段；GM.say 只留一個等點擊的 resolve（game3d.js），
     先開始的那一段被蓋掉、永遠等不到＝停在她說話的畫面（ADV 還開著，staleCheck 不放開讀檔）。例：day 14 走進麵店馬上和以安說話；10-23 day 9 麵店的 _stuck（X.run 阿哲長桌＋以安的見面）。
     改成決定開演的那一刻就 sceneBegin（玩家 busy、互動鍵收起來、STORY.tick 和 EVENTS.tick 都跳過），演完 sceneEnd 再自動存檔（見面裡的 autosave 在鎖裡面會略過）。
     換區域的自動存檔（game3d.js enter 在 STORY.onEnter 之後）也因此不會存成「人在麵店、還在一起走過去」——那份讀回來她一直跟著（②，S.arriveDue）*/
  const arrivingIv=new WeakSet();   /* 正在演「走到了」的那一筆（不存進存檔）*/
  S.sceneFree=GM=>{ const E=GM&&GM.E, Dg=GM&&GM.D; return !(E&&E.player&&E.player.busy)&&!(Dg&&(Dg.active||(Dg.busyDepth|0)>0))&&!(typeof EVENTS!=='undefined'&&EVENTS.running)&&!(typeof OUT!=='undefined'&&OUT.due&&GM.G&&OUT.due(GM.G)); };   /* 該出發的出遊先問（同 S.goPrompt；OUT.tick 在同一輪接著跑）*/
  /* 一起走過去、人已經在約好的地方，可是沒有走 S.arrive（讀檔：途中存的檔、走進門那一刻的自動存檔；使用者 10-27 20:4x「紀錄是我沒有去吃麵 所以重新讀取她才跟著我」）：玩家空下來就照走到了開始 */
  S.arriveDue=function(GM){ const G=GM&&GM.G; if(autoBusy||!G||!Array.isArray(G.invites)||!S.sceneFree(GM)) return null; if(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G)) return null;
    return G.invites.find(iv=>iv.state==='going'&&iv.zone===G.zone&&iv.day===G.day&&!arrivingIv.has(iv)&&!S.privateZone(G.zone))||null; };
  S.npcOf=(GM,id)=>(GM.npc&&GM.npc[id])||(typeof EVENTS!=='undefined'&&EVENTS.npcOf?EVENTS.npcOf(id):null);   /* 學姊在總圖閱覽室、Café 是舊的 sis 生成（別名，EVENTS.npcOf）；一起走到、作罷、坐到她旁邊也都用這個找她（BB 10-22 05:4x：一起走到 Café 自己開始但沒坐下——S.arrive 只找 GM.npc.heroine_05）*/
  S.autoStart=function(GM){ const G=GM.G; if(autoBusy||!G||!Array.isArray(G.invites)||!S.sceneFree(GM)) return false; const h=G.hour%24;
    for(const iv of G.invites){ if(iv.state!=='accepted'||iv.day!==G.day||h<iv.h-0.25||h>=iv.h+S.WAIT_H||G.zone!==iv.zone) continue;
      const n=S.npcOf(GM,iv.who); if(!n||!n.obj) continue;
      autoBusy=true; if(GM.sceneBegin) GM.sceneBegin();   /* 當下就鎖住（見上面）：同一格的 EVENTS.tick、這時候按的「和她說話」都進不來 */
      Promise.resolve().then(()=>S.startTogether(GM,iv,n)).catch(e=>console.warn('INV.autoStart',e)).finally(()=>{ autoBusy=false; if(GM.G===G){ if(GM.sceneEnd) GM.sceneEnd(); if(GM.autosave) GM.autosave(); } }); return true; }
    return false; };
  /* 開始：有座位的地點（總圖、Café、麵店、茶館、早午餐）先一起坐下——她坐著就坐她旁邊，沒坐就找兩個相鄰的空位；找不到就照舊直接開始 */
  S.pairSeats=function(GM,n,place){ const E=GM.E; if(!seatPose(place)||!n||!E||!E.zone||!Array.isArray(E.zone.seats)) return null;
    const near=(a,b,r)=>Math.hypot(a.x-b.x,a.z-b.z)<r;
    const together=(a,b)=>{ if(typeof a.yaw!=='number'||typeof b.yaw!=='number') return false; const fx=Math.sin(a.yaw), fz=Math.cos(a.yaw), dx=b.x-a.x, dz=b.z-a.z, c=Math.cos(a.yaw-b.yaw), along=dx*fx+dz*fz, side=dx*fz-dz*fx;
      return (c>0.95&&Math.abs(along)<0.3)||(c<-0.95&&Math.abs(side)<0.3&&along>0); };   /* 並排（朝同一邊、前後不錯開）或面對面（她看得到你）*/
    const busy=st=>st.taken||E.npcs.some(m=>m!==n&&(m.seat||m.seatTarget)&&near(m.seat||m.seatTarget,st,0.35));
    const ok=E.zone.seats.filter(st=>!st.label&&!busy(st)), mate=st=>{ for(const r of [1.3,1.7,2.2]){ const m=ok.filter(q=>q!==st&&(q.lv|0)===(st.lv|0)&&near(q,st,r)&&(r<2||together(st,q))).sort((a,b)=>Math.hypot(a.x-st.x,a.z-st.z)-Math.hypot(b.x-st.x,b.z-st.z))[0]; if(m) return m; } return null; };   /* 先找旁邊（1.3 m 內），沒有再找對面（麵店一張桌子兩個位子面對面、相距 1.6 m；BB 10-22 01:3x：麵店裡阿哲坐著、你站在門口演完）；
       再沒有才找 2.2 m 內「並排朝同一邊」或「隔著桌子面對面」的位子（一盞的緣側兩個坐墊相距 1.8 m，BB 10-22 02:23 量的；不坐到隔壁桌）*/
    if(n.seat){ const m=mate(n.seat); return m?{her:n.seat,me:m}:null; }
    const P=E.player.obj.position; const cand=ok.filter(st=>!!mate(st)).sort((a,b)=>Math.hypot(a.x-P.x,a.z-P.z)-Math.hypot(b.x-P.x,b.z-P.z));
    return cand[0]?{her:cand[0],me:mate(cand[0])}:null; };
  S.startTogether=async function(GM,iv,n){ const G=GM.G, E=GM.E, P=E&&E.player; iv.waitSeat=null; if(GM.setGoal&&/旁邊$/.test(G.goal||'')) GM.setGoal('—');
    const pr=S.pairSeats(GM,n,iv.place); let sat=false;
    if(pr&&GM.sitAt&&P){ if(GM.fade) await GM.fade(true);
      if(n.seat!==pr.her){ if(GM.standUp&&n.seat) GM.standUp(n); n.seatTarget=null; n.path=null; GM.sitAt(n,pr.her); }
      n.pose=n.idlePose=seatPose(iv.place); n.frozen=true; n.beh='idle';
      if(P.seat&&GM.standUp) GM.standUp(P); GM.sitAt(P,pr.me); sat=true; if(GM.fade) await GM.fade(false); }
    await S.meet(GM,iv,n);
    if(sat&&P&&P.seat&&GM.standUp) GM.standUp(P); };
  /* 一起走過去的路上作罷（走回宿舍、回家）：她不再跟著 */
  S.dropGoing=function(GM,iv){ const G=GM.G; if(!iv||iv.state!=='going') return false; iv.state='cancelled'; S.msg(G,iv.who,'和'+nameOf(iv.who)+'一起去'+((S.place(iv.place)||{}).name||'')+'的事，後來作罷了。',iv);
    const n=S.npcOf(GM,iv.who); if(n){ n.beh='idle'; n.path=null; } return true; };
  S.privateZone=z=>z==='dorm'||z==='fdorm'||/^dorm_/.test(String(z||''));   /* 宿舍（男舍走廊、房間、女舍）：一起要去的地方不會在這裡 */
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
      const n=S.npcOf(GM,iv.who), P=GM.E&&GM.E.player&&GM.E.player.obj; if(!n||!n.obj||!P) continue;
      if(Math.hypot(n.obj.position.x-P.position.x,n.obj.position.z-P.position.z)>6) continue;
      iv.chat=true; const pk=S.walkPick(G,iv.who,iv.place); if(!pk) continue; pk.next(); if(pk.ask){ iv.ask=pk.ask; continue; } const nm=nameOf(iv.who);
      pk.lines.forEach((t,k)=>{ const show=()=>GM.caption(/^（/.test(t)?'':nm,t,3400); if(k===0) show(); else S._later(show,k*3600); }); } };
  /* 走進一個區域：一起走過去的人到了目的地 → 見面 */
  S.arrive=async function(GM,zoneId){ const G=GM.G; for(const iv of (G.invites||[])){ if(iv.state==='going'&&iv.zone!==zoneId&&S.privateZone(zoneId)) S.dropGoing(GM,iv); }   /* 走回宿舍＝作罷（使用者 10-21 23:1x）*/
    const iv=(G.invites||[]).find(v=>v.state==='going'&&v.zone===zoneId); if(!iv) return false; if(arrivingIv.has(iv)) return true;
    arrivingIv.add(iv); if(GM.sceneBegin) GM.sceneBegin();   /* 走進門那一刻就鎖住（BUG-AN-NOODLE-STUCK-1027，見 S.autoStart 上面）：這 0.9 秒裡按不到「和她說話」、別的事件不會插進來、換區域的自動存檔不會存成 going */
    try{ await GM.sleep(900);
      while(GM.G===G&&GM.D&&((GM.D.busyDepth|0)>1||GM.D.active)) await GM.sleep(200);   /* 鎖住以前已經開始的那一段（淡入的時候先按了「和她說話」）先演完再見面，兩段不一起演 */
      if(GM.G===G&&iv.state==='going'){ const n=S.npcOf(GM,iv.who); iv.state='accepted'; iv.h=+((G.hour%24)).toFixed(3);   /* 約定時間改成到的時候（路上花的時間不算遲到）*/
        await S.startTogether(GM,iv,n); } }   /* 兩個人都到了＝直接開始，有座位的地方一起坐下（使用者 10-21 23:2x；原本她先去找位子、你坐到她旁邊或跟她說話才開始：S.seatFirst 留給舊的流程）*/
    finally{ arrivingIv.delete(iv); if(GM.G===G){ if(GM.sceneEnd) GM.sceneEnd(); if(GM.autosave) GM.autosave(); } }   /* 中途讀了別的檔（applySave 已經把層數歸零）：不動新的那一局 */
    return true; };
  /* 一起走到有座位的地點（總圖、Café、麵店、茶館、早午餐）：她走去一個旁邊還有空位的位子坐下；約定時間改成現在（不會因為路上花的時間被算成沒赴約）。
     見面：你坐到她旁邊（S.seatMeet，座位選單呼叫）或跟她說話（story3d.js talkCharacter 的 INV.meetable）。找不到位子或走不到就照舊直接見面。 */
  const SEATED={library:'read',cafe:'sit',noodle:'sit',teahouse:'sit',brunch:'sit'};
  const seatPose=pid=>SEATED[pid]||(S.place(pid)||{}).seatPose||null;   /* 別的檔加的地點自己帶（Pasta 118：lane118.js 的 L118.INVITE，AA_480 第 5 節）*/
  S.seatFirst=function(GM,iv,n){ const E=GM.E, G=GM.G; if(!n||!n.obj||!seatPose(iv.place)||!E||!E.zone||!Array.isArray(E.zone.seats)||!E.moveTo) return false;
    const near=(a,b,r)=>Math.hypot(a.x-b.x,a.z-b.z)<r;
    const busy=st=>st.taken||E.npcs.some(m=>m!==n&&(m.seat||m.seatTarget)&&near(m.seat||m.seatTarget,st,0.35))||(E.player&&E.player.seat&&near(E.player.seat,st,0.35));
    const ok=E.zone.seats.filter(st=>!st.label&&!busy(st));   /* label＝長椅之類的單獨座位；要桌邊的位子 */
    const pair=st=>ok.some(q=>q!==st&&(q.lv|0)===(st.lv|0)&&near(q,st,1.3));   /* 旁邊還有空位給你 */
    const P=E.player.obj.position; const cand=ok.filter(pair).sort((a,b)=>Math.hypot(a.x-P.x,a.z-P.z)-Math.hypot(b.x-P.x,b.z-P.z));
    const st=cand[0]; if(!st) return false;
    if(GM.standUp) GM.standUp(n); n.beh='idle'; n.frozen=false; n.path=null; n.seatTarget=st;
    const pose=seatPose(iv.place); const sit=()=>{ n.seatTarget=null; if(GM.sitAt) GM.sitAt(n,st); n.pose=n.idlePose=pose; n.frozen=true; };
    const ap=(GM.seatApproach&&GM.seatApproach(st))||[st.x,st.z]; if(!E.moveTo(n,ap[0],ap[1],sit,st.lv|0)){ n.seatTarget=null; return false; }
    iv.h=+((G.hour%24)).toFixed(3); iv.waitSeat={x:st.x,z:st.z,lv:st.lv|0};
    if(GM.setGoal) GM.setGoal('坐到'+nameOf(iv.who)+'旁邊'); return true; };
  S.seatMeet=async function(GM,seat){ const G=GM.G; if(!seat) return false; for(const iv of (G.invites||[])){ if(iv.state!=='accepted'||iv.day!==G.day||!iv.waitSeat||(iv.waitSeat.lv|0)!==(seat.lv|0)) continue;
      if(Math.hypot(iv.waitSeat.x-seat.x,iv.waitSeat.z-seat.z)>1.8) continue; const n=S.npcOf(GM,iv.who); if(!n) continue; iv.waitSeat=null; await S.meet(GM,iv,n); return true; } return false; };
  /* ---------- 對方約你、臨時改約（給事件用；內容由 AA、BB 寫，使用者批准後才放）---------- */
  S.offer=function(G,who,pid,day,h,text,at){ S.rec(G); const P=S.place(pid); if(!P) return null; if(S.cool(G,who)) return null;   /* 分開以後一個學期，她那一方的邀約不發（AA_434 4-3）*/ G.invSeq=(G.invSeq|0)+1;
    const iv={id:'iv'+G.invSeq,who,place:pid,zone:P.zone,day,h:+h.toFixed(3),state:'offered',accepted:false,by:'npc',label:nameOf(who)+'約你去'+P.name}; G.invites.push(iv);
    const t=text||(nameOf(who)+'約你'+when(G,day,h)+P.verb.replace(/^去/,'去')+'。'); if(at){ S.msgAt(G,who,t,at.day,at.h); const M=G.msgs.find(m=>m.day===at.day&&m.h===+(at.h%24).toFixed(2)&&m.who===who&&m.text===t&&!m.iv); if(M) M.iv=iv.id; } else S.msg(G,who,t,iv); return iv; };   /* at＝{day,h}：訊息放在那個時間（她主動約你：前一天晚上傳的，睡過、跳過照原本的時間，src/heroine_asks3d.js）*/
  /* 回覆對方的邀約以後（S.answer）：fn(G,iv,ans,res)；回傳 {noFlow:true}＝改天不打開「自己選時間」（她主動約你的那幾則：她 3 天後會再約，HEROINE-ASKS-1028）*/
  S.ON_ANSWER=[];
  /* 你那個時間有沒有約（約了別人、校外約會、自己的考試）；這個人那個時間照作息在哪（給 src/heroine_asks3d.js：她本來就在那裡的邀約）*/
  S.mineAt=(G,day,h,stay)=>!!(clash(G,null,day,h,stay)||tripAt(G,day,h,stay)||myExam(G,day,h,stay));
  S.entAt=(G,id,day,h)=>entAt(G,id,day,h);
  /* 回覆對方的邀約：yes＝答應（時間衝突時照樣改天）、later＝改天（玩家另外選時間，走一般的 decide）、no＝不了（不扣分） */
  S.answer=function(G,ivId,ans){ const iv=S.byId(G,ivId); if(!iv||iv.state!=='offered') return null; const nm=nameOf(iv.who), P=S.place(iv.place);
    const hook=r=>{ for(const f of S.ON_ANSWER){ let x=null; try{ x=f(G,iv,ans,r); }catch(e){ console.warn('INV.ON_ANSWER',e); } if(x&&x.noFlow) r.noFlow=true; } return r; };
    if(ans==='yes'){ if(clash(G,null,iv.day,iv.h,P.stay,iv)||tripAt(G,iv.day,iv.h,P.stay)){ S.msg(G,null,'那個時間你已經約了別人。',iv); return hook({res:'mine'}); }   /* 校外約會那段時間也一樣（BUG-DATE-OVERLAP-1021）*/ iv.state='accepted'; iv.accepted=true; S.msg(G,iv.who,'答應了：'+when(G,iv.day,iv.h)+'，'+P.name+'（'+nm+'）。',iv); return hook({res:'accept'}); }
    iv.state='declined'; S.msg(G,iv.who,ans==='later'?'你跟'+nm+'說改天。':'你跟'+nm+'說這次不了。',iv); return hook({res:ans}); };
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
  S.timesOf=(G,P,day)=>P.timesBy?([0,6].includes(wdOf(G,day))?P.timesBy.we:P.timesBy.wk):(P.times||D().times);   /* timesBy：平日、週末不同的時間（慢讀咖啡：平日 12:10、15:30，週末多 10:00、14:00；AA_535 4-1）*/
  S.timeOptions=function(G,together,P){ const out=[]; const h=G.hour%24;
    if(P&&P.when) return (P.when(G,together)||[]).map(q=>Object.assign({t:q.now?'現在一起過去':when(G,q.day,q.h)},q));   /* 只有某些日子的地點（溫州街的茶席：每月第三個週日下午，src/wzlines3d.js）：日子、時間由那個地點給 */
    if(P&&(P.times||P.timesBy)){ const hr=P.hours||[0,24]; if(together&&h>=hr[0]-1e-6&&h+P.stay<=hr[1]+1e-6) out.push({t:'現在一起過去',now:true,day:G.day,h});   /* 只有固定時間的地點（晨跑 06:30～07:30，AA_126 6-6）：今天還沒過的、明天的那幾個時間 */
      for(const t of S.timesOf(G,P,G.day)) if(t>h+0.4) out.push({t:'今天 '+hh(t),day:G.day,h:t}); for(const t of S.timesOf(G,P,G.day+1)) out.push({t:'明天 '+hh(t),day:G.day+1,h:t}); return out; }
    if(together&&h<21.5) out.push({t:'現在一起過去',now:true,day:G.day,h});
    for(const t of D().times) if(t>h+0.4) out.push({t:'今天 '+hh(t),day:G.day,h:t}); for(const t of [12+10/60,19]) out.push({t:'明天 '+hh(t),day:G.day+1,h:t}); return out; };
  /* ---------- 約人的流程（當面：story3d.js 的 talkCharacter；手機：game3d.js 的「朋友」）：去哪裡 → 什麼時候 → 對方的回答 → 改天就問要不要那個時間 ---------- */
  /* 期末時段裡約成的吃飯＝期末的飯（AA_268 第 1 節）：標 iv.te、系統字、其他還沒回的期末邀約自動婉拒 */
  S.teMark=function(GM,iv,id,P,W){ const G=GM.G, te=iv&&typeof TERMEND!=='undefined'&&TERMEND.playerInvite?TERMEND.playerInvite(G,id,P,W):null; if(!te||!te.kind) return false;
    iv.te={term:te.w.id,kind:te.kind}; TERMEND.playerPicked(G,iv); if(GM.toast) GM.toast(te.kind==='gf'?TERMEND_LINES.SYS_GF:TERMEND_LINES.SYS_TE,4200); return true; };
  /* ---------- 「約她去…」的清單分層（INVITE-MENU-1030，使用者 10-30 04:2x「學姊也不能約她 其他活動 請幫我檢查統一每個可攻略角色約她的選項要更多 如果太多就分階層」）----------
     第一層照分類，一層最多約 8 列；一類只有一個＝直接列那一項（不多一層）；一類一個都沒有＝不列；整類都約不了＝灰掉、小字寫第一個原因（選了說原因、再選一次）。
     分類名稱照 AA_535 第 2 節（INVITE-OPTS-1030，AA-B 定稿）：念書／吃飯／喝咖啡、喝茶／散步／運動／出去玩（校外，不寫「約會」）／這個時候才有（節日、茶席、去她的城市、視訊這類有時間的）。
     地點的分類：P.cats（可以放兩類：慢讀咖啡＝念書＋喝咖啡、喝茶；一盞的茶席＝喝咖啡、喝茶＋這個時候才有），沒有就照 zone（總圖＝念書）、kind（meal 吃飯、walk 散步、sport 運動、其他＝喝咖啡、喝茶）。系統字，不是台詞 */
  S.CATS=[{id:'study',t:'念書'},{id:'meal',t:'吃飯'},{id:'sit',t:'喝咖啡、喝茶'},{id:'walk',t:'散步'},{id:'sport',t:'運動'}];
  S.CAT_OF={teahouse_ceremony:['sit','when']};
  S.catsOf=P=>{ const L=P.cats||S.CAT_OF[P.id]||[P.cat||(/^library/.test(String(P.zone||''))?'study':({meal:'meal',walk:'walk',sport:'sport'}[P.kind]||'sit'))]; const ok=L.filter(c=>c==='when'||S.CATS.some(x=>x.id===c)); return ok.length?ok:['sit']; };
  S.catOf=P=>S.catsOf(P)[0];
  S.OUT_LABEL='出去玩…'; S.WHEN_LABEL='這個時候才有';
  S.STAY_MENU={stay:true};   /* menuTree 的 pick 回傳它＝說完原因、留在同一層再選 */
  const BACK={back:true};
  /* 分層選單（INV.flow、DATE.menu 共用）：nodes＝[{t, hint, dim, why, items:[…]}（一類）| 一項]。回傳選到的那一項（null＝算了）；
     pick(x)：選到一項時先問（回傳 S.STAY_MENU＝留在同一層；其他＝結束，回傳值就是結果）。一類寫「名稱…」、小字列裡面約得到的名稱；下一層最後一列「返回」*/
  S.menuTree=async function(GM,nodes,pick,o){ o=o||{};
    const norm=L=>{ const out=[]; for(const x of L||[]){ if(!x) continue; if(!x.items){ out.push(x); continue; } const it=norm(x.items); if(!it.length) continue; if(it.length===1){ out.push(it[0]); continue; }
        const live=it.filter(q=>!q.dim); out.push(Object.assign({},x,{items:it,dim:!live.length,hint:live.length?(x.hint!=null?x.hint:live.map(q=>q.short||q.t).join('、')):(it[0].hint||it[0].why||''),why:live.length?null:(it[0].why||it[0].hint||'')})); }
      return out; };
    const leaves=x=>x.items?[].concat(...x.items.map(leaves)):[x.t];
    const level=async(L,sub)=>{ for(;;){ const opts=L.map(x=>x.items?{t:x.t+'…',hint:x.hint||'',dim:!!x.dim,sub:leaves(x)}:{t:x.t,hint:x.hint||'',dim:!!x.dim}); opts.push({t:sub?'返回':(o.cancel||'算了')});   /* sub：這一類裡面每一項的名稱（畫面不用；測試照名稱找到那一類）*/
        const k=await GM.choose(opts); if(!(k>=0&&k<L.length)) return sub?BACK:null; const x=L[k];
        if(x.items){ if(x.dim){ await GM.say(null,String(x.why||x.hint||'').replace(/([^。！？」）])$/,'$1。')); continue; } const r=await level(x.items,true); if(r===BACK) continue; return r; }
        const r=pick?await pick(x):x; if(r===S.STAY_MENU) continue; return r; } };
    return level(norm(nodes),false); };
  /* 可昕交往中（法律系那幾年，kxGF）約校內（INVITE-MENU-1030 D；原本只有羽球、晨跑）：答應句接得上的地點才列——AA_415 表（法律系、交往中那一階：那個地點的，或不限地點、沒有條件的一般句 kx20）
     或 INVITE_DATA.people.kexin.acc；羽球、晨跑照舊（AA_417 3-2）。沒交往照舊（她在政大：不用這個清單約）。kxPlaceLine：'own'＝那個地點自己的句子、'general'＝只有一般句、null＝沒有（不列）*/
  S.kxPlaceLine=function(G,P){ if(!P) return null; const R=RP(), rows=(R&&R.kexin)||[], ok=r=>r.k==='acc'&&!r.off&&!r.apart&&(!r.sec||r.sec==='law')&&Array.isArray(r.st)&&r.st[0]<=7&&r.st[1]>=7&&!r.cond&&!r.when;
    let v=(((D().people||{}).kexin||{}).acc||{})[P.id]; if(typeof v==='function') v=v(G,{}); if(v!=null||rows.some(r=>ok(r)&&(r.tags||[]).includes(P.id))) return 'own';
    return rows.some(r=>ok(r)&&!(r.tags||[]).length)?'general':null; };
  S.kxPlaceOk=(G,P)=>!!P&&(!!P.sport||!!S.kxPlaceLine(G,P));
  /* 今天、明天以外的日子（INVITE-MENU-1030 F：學姊平日白天在總圖，今天、明天的時間都撞「她就在總圖」）：時間清單最後「其他日子…」＝之後 2～7 天選一天、再選時間（照校外約會 DATE.pickWhen）。
     那個地方那個時間沒開的灰掉（小字寫原因）；她那時候有沒有空照 decide（改天、婉拒照原本的回法）。地點自己給日子的（茶席 P.when）沒有這一項 */
  S.MORE_TIMES=[10,12+10/60,15.5,17.5,19,21];
  S.dayLabel=(G,day)=>{ const d=typeof CALENDAR!=='undefined'&&CALENDAR.dateOf?CALENDAR.dateOf(day):null; return (d&&d.m?d.m+'/'+d.d:'第 '+day+' 天')+'（週'+WK[wdOf(G,day)]+'）'; };
  S.moreDays=G=>{ const out=[]; for(let k=2;k<=7;k++) out.push(G.day+k); return out; };
  S.slotOpen=(G,P,day,h)=>h>=(P.hours&&P.hours[0]<8?P.hours[0]:8)-1e-6&&h+P.stay<=23.5&&isOpen(P.zone,h,day)&&winOk(G,P,day,h);
  S.pickDay=async function(GM,id,P){ const G=GM.G; for(;;){ const days=S.moreDays(G); const di=await GM.choose(days.map(d=>({t:S.dayLabel(G,d)})).concat([{t:'返回'}])); if(!(di>=0&&di<days.length)) return null; const day=days[di];
      const rows=(P.times||P.timesBy?S.timesOf(G,P,day):S.MORE_TIMES).map(h=>({h,ok:S.slotOpen(G,P,day,h)})), no=S.offWhy(G,P,day)||P.name+'那個時間沒開';
      for(;;){ const ti=await GM.choose(rows.map(r=>({t:hh(r.h),hint:r.ok?'':no,dim:!r.ok})).concat([{t:'換一天'}])); if(!(ti>=0&&ti<rows.length)) break; const r=rows[ti];
        if(!r.ok){ await GM.say(null,no+'。'); continue; } return {t:when(G,day,r.h),day,h:r.h}; } } };
  S.offWhy=(G,P,day)=>P&&Array.isArray(P.off)&&P.off.includes(wdOf(G,day))?P.name+'週'+WK[wdOf(G,day)]+'休':'';   /* 公休日（慢讀咖啡週二休，AA_535 4-1）*/
  S.flow=async function(GM,id,n,together){ const G=GM.G; S.rec(G); const nm=nameOf(id), c=CHARACTERS[id]||{}, her=c.gender==='f'?'她':'他';
    const t7=!n&&t7a(G,id);   /* AA_350 T7a：以安、芷若在台中＝和可昕一樣只有「去校外…」（清單只列 D26，DATE.menu）*/
    const far=!n&&typeof STORY!=='undefined'&&!!STORY.reachable&&!STORY.reachable(id,G);   /* INVITE-MENU-1030 E：手機約、她今天不在臺北（沛珊大三起在台南、寒暑假在老家）＝校內的地點不列（比照 T7a；原本照列、每一個都回「不在臺北」）*/
    const PL=(t7||far?[]:D().places.filter(Q=>!kxGF(G,id)||S.kxPlaceOk(G,Q))).filter(Q=>!Q.show||Q.show(G,id)); let k, P=null;   /* show：還沒開放的地點不列（茶席，src/wzlines3d.js）*/   /* 可昕交往中：答應句接得上的校內地點都可以約（她從政大下來；羽球場用祐廷台大的帳號預約，AA_417 3-2）*/
    /* 當面約（AA_134 第 4 節，AA_140 G49）：第一句是當面的版本；她回答前看一下手機的行事曆、答應時點頭（動作用字幕，不多一個要點的對話框）*/
    const act=(t,ms)=>{ if(n&&GM.caption) GM.caption('','（'+t+'）',ms||1800); };
    if(n){ const T0=S.timeOptions(G,together); await GM.say({name:G.name||'祐廷'},T0.some(q=>q.day===G.day)?'你等一下有空嗎？':'你明天有空嗎？'); }   /* 照可選的時間說（AA-B 2026-10-16 21:53 定稿，AA_134 第 50 行下；不加週末選項）*/
    const dOk=typeof DATE!=='undefined'&&DATE.HEROINES&&DATE.HEROINES.includes(id);   /* 校外約會（DATE-S3，AA_128 4-1）：女主角的清單多一個「去校外…」；當面也可以（INVITE-MENU-1030 B：原本當面一律沒有）；約不到時灰掉、選了寫原因 */
    const hv=!n&&typeof HV!=='undefined'&&typeof HOMETOWN_LINES!=='undefined'&&HV.offer?HV.offer(G,id):null;   /* 寒暑假她在高雄／台中（AA_276 第 1-1、5 節）：「我去高雄找妳？」 */
    const vd=!n&&typeof HV!=='undefined'&&HV.videoOffer?HV.videoOffer(G,id):null;   /* 沛珊交往中、她在台南：「視訊？」（AA_349 K5；晚上 21:00～22:30、一週最多兩次）*/
    const fsO=typeof FEST!=='undefined'&&FEST.flowOpt?FEST.flowOpt(G,id,n,together):null;   /* 約她過節（AA_416，fest3d.js）：她的節日前後多一個「約她過節：…」；約不到的灰掉、選了說原因 */
    const leafOf=Q=>{ const w=S.placeWhy(G,id,Q); return {t:Q.verb,short:Q.name,hint:w,dim:!!w,P:Q}; };   /* 約不到的地方寫原因（AA_125 第 1 節），選了就說原因、再選一次 */
    const nodes=S.CATS.map(C=>({t:C.t,items:PL.filter(Q=>S.catsOf(Q).includes(C.id)).map(leafOf)}));
    if(dOk){ const ca=DATE.canAsk(G,id,n?{face:true}:null); nodes.push({t:S.OUT_LABEL,hint:ca.ok?'選地點、日期、時間':ca.why,dim:!ca.ok,go:'date'}); }   /* 出去玩（AA_535 第 2 節：不寫「約會」）；當面不用聯絡方式 */
    const sp=[]; if(hv){ const HL=HOMETOWN_LINES[HV.key?HV.key(G,id):id]||HOMETOWN_LINES[id]; sp.push({t:HL.ask,hint:hv.ok?'當天來回　'+HL.travel:hv.why,dim:!hv.ok,go:'hv'}); }   /* 沛珊在台南那一組（HV.key，AA_328 3-09）*/
    if(vd){ const VL=(HOMETOWN_LINES[HV.key(G,id)]||{}).video||{}; sp.push({t:VL.ask||'視訊？',hint:vd.ok?vd.hint:vd.why,dim:!vd.ok,go:'vd'}); }
    if(fsO) sp.push(Object.assign({},fsO,{go:'fest'}));
    for(const Q of PL) if(S.catsOf(Q).includes('when')) sp.push(leafOf(Q));   /* 有日期的地點（一盞的茶席：每月第三個週日）*/
    nodes.push({t:S.WHEN_LABEL,items:sp});   /* 這個時候才有（AA_535 第 2 節）：過節、茶席、去她的城市、視訊；有才出現，只有一個就直接列 */
    const x=await S.menuTree(GM,nodes,async x=>{ if(x.P){ const why=S.placeWhy(G,id,x.P); if(!why) return x; await GM.say(null,why);
        { const ps=S.partnerBlock(G,id,x.P)&&(((D().people||{})[id]||{}).partnerSay||{})[x.P.id]; if(ps) await S.playLines(GM,n?{name:nm,obj:n.obj,charId:id}:{name:nm+'（手機）',charId:id},ps); }   /* 有伴侶時她自己的一句（學姊的一盞，AA_172 3b）*/
        return S.STAY_MENU; }
      if(x.go==='fest'&&x.dim){ await GM.say(null,x.hint+'。'); return S.STAY_MENU; } return x; });
    if(!x) return null; if(x.go==='date') return DATE.menu(GM,id,n); if(x.go==='hv') return HV.ask(GM,id); if(x.go==='vd') return HV.video(GM,id); if(x.go==='fest') return FEST.ask(GM,id,n);
    P=x.P; let W=null;
    for(;;){ const T=S.timeOptions(G,together,P); if(!T.length){ await GM.say(null,'今天太晚了，改天再約吧。'); return null; } const more=!P.when, to=T.map(q=>({t:q.t})); if(more) to.push({t:'其他日子…',hint:'之後 7 天內選一天'}); to.push({t:'算了'});
      k=await GM.choose(to); if(more&&k===T.length){ const w=await S.pickDay(GM,id,P); if(!w) continue; W=Object.assign({},w); break; } if(!(k>=0&&k<T.length)) return null; W=Object.assign({},T[k]); break; }
    const NC=typeof NOODLE_CLOSED!=='undefined'&&NOODLE_CLOSED.inviteAdjust?NOODLE_CLOSED.inviteAdjust(G,id,W):null; if(NC) W.h=NC.h;   /* 麵店過年店休那一週約語彤（AA_333 C）：排到 18:00 以後、答應的那一句換掉 */
    const r=S.personal(G,id,P,W.day,W.h,Object.assign(S.decide(G,id,P.id,W.day,W.h),n?{face:true}:{})), who=n?{name:nm,obj:n.obj,charId:id}:{name:nm+'（手機）',charId:id};
    const te=typeof TERMEND!=='undefined'&&TERMEND.playerInvite?TERMEND.playerInvite(G,id,P,W):null;   /* 期末時段裡約吃飯＝期末的飯（BB_203 第 1 節第 13 點、AA_268）*/
    if(te&&te.refuse){ act(her+'看了一下手機的行事曆。'); if(n&&GM.sleep) await GM.sleep(700); await GM.say(who,'「'+te.refuse+'」'); return null; }   /* 關係結束、還不能重新開始（C8、C9）*/
    act(her+'看了一下手機的行事曆。'); if(n&&GM.sleep) await GM.sleep(700);
    const same=!!n&&(P.zone===G.zone||(P.zone==='library_hall'&&G.zone==='library'));   /* 當面、人已經在那個地方（總圖：大廳和 3F 閱覽室都算）*/
    if(W.now&&same&&r.res==='here'){ r.res='accept'; delete r.lines; }   /* 兩個人都在那裡、約「現在」＝直接開始，不念手機那句（學姊平日的總圖「我就在總圖。三樓。不要講話，傳訊息。」；BB 10-22 03:01；使用者 10-21 23:2x「只要兩個都在場 就不用一起走或說話才能開始」）*/
    if(r.res==='accept'){ act(her+'點點頭。'); if(n&&typeof CHAR!=='undefined'&&CHAR.setExpr) CHAR.setExpr(n.obj,'smile'); const here=!!W.now&&same;   /* 兩個人已經在那個地方（例：在總圖讀完、當場再約一次讀書；使用者 10-21 23:1x）：不用一起走過去 */
      const iv=S.accept(G,id,P.id,W.day,W.h,{now:!!W.now&&!here,by:'player'}); const tail=here?'':(W.now?'你們一起'+P.verb+'。':'約好 '+when(G,W.day,W.h)+'，'+P.name+'。');
      if(NC){ await GM.say(who,'「'+NC.line+'」'); if(tail) await GM.say(null,tail); } else if(r.lines){ await S.playLines(GM,who,r.lines,r); if(tail) await GM.say(null,tail); } else await GM.say(null,S.reply(G,id,P.id,r)+tail);
      S.teMark(GM,iv,id,P,W);
      if(here){ await S.startTogether(GM,iv,n); return iv; }   /* 直接開始（S.accept 已經是 accepted、時間＝現在）*/
      if(W.now&&n){ if(GM.standUp) GM.standUp(n); n.beh='follow'; n.frozen=false; n.followOff=1.1; n.path=null; } return iv; }   /* 坐著被約「現在一起過去」：先起身再跟（使用者 2026-10-16 試玩：Café 約吃麵，以安坐姿懸空跟著走）*/
    if(r.lines) await S.playLines(GM,who,r.lines,r); else await GM.say(null,S.reply(G,id,P.id,r));
    if(r.study&&typeof SISG!=='undefined'&&SISG.studyOffer) return SISG.studyOffer(GM,W,who,n);   /* 學姊第 14 週～筆試婉拒以後「那一起念書。」（AA_535 1-3）*/
    if(r.res==='here') return null;   /* 她已經在那裡：玩家直接去（以安的總圖、芷若上班時的 Café、學姊平日的總圖、語彤週二週四的麵店）*/
    if(r.res==='resched'&&r.alt){ const Q=S.place(r.alt.place||P.id); const kk=await GM.choose([{t:'好，就 '+when(G,r.alt.day,r.alt.h)+(Q.id!==P.id?'（'+Q.name+'）':'')},{t:'下次再說'}]);
      if(kk===0){ const iv=S.accept(G,id,Q.id,r.alt.day,r.alt.h,{by:'player'}); await GM.say(null,'約好 '+when(G,r.alt.day,r.alt.h)+'，'+Q.name+'。'); S.teMark(GM,iv,id,Q,r.alt); return iv; } }
    return null; };
  return S;
})();
