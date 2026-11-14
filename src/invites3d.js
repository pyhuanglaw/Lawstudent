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
  const LS=()=>D().libStudy||{};   /* 約念書的台詞（AA_649；src/data/invites.js 的 INVITE_DATA.libStudy）*/
  const pick=a=>Array.isArray(a)&&a.length?a[Math.floor(Math.random()*a.length)]:null;
  let lastMeetEnd=null; S._now=()=>Date.now();   /* 上一次見面演完的時間（真實時間）：剛演完不自己打開手機（S.phoneBack）*/
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['invites3d:lastMeetEnd']=()=>{ lastMeetEnd=null; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀了別的檔＝不算剛演完 */
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
  const kxOld=G=>{ const F=G&&G.flags; if(!F||F.KX_MET===undefined) return true; return F.dating_kexin===true||!!F.EX_kexin||!!F.KX_MET||F.KX_ENDED!=null||F.KX_ENDED_ON!=null; };   /* 可昕（CANON-1112）：新設定的局（存檔有 KX_MET 這個欄位）不再是開場就有——認識了（KX_MET）、交往中或交往過才有；舊存檔（沒有這個欄位）照舊一直有 */
  S.hasContact=(G,id)=>(id==='kexin'?kxOld(G):D().contacts0.includes(id))||!!(G.contacts&&G.contacts[id]!=null);   /* contacts0 還列著 kexin：新設定的局不照它 */
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
    if(kxGF(G,id)) return '';   /* CANON-NO-ECON-1112 第四批：可昕改成和其他女主角同一層（AA_895 第 4 節）以後，交往中照舊一定約得到（原本 G 層在上一行就回空字串）*/
    const pres=(typeof STORY!=='undefined'&&STORY.presence)?STORY.presence(id,G):{here:true};
    if(!pres.here&&pres.kind==='unreachable') return (typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(id):pr)+'沒有回覆。';   /* 沛珊消失期（BB_205 第 3 節）*/
    const tc=!pres.here&&(pres.kind==='home'||pres.kind==='trip')&&t7a(G,id);   /* AA_350 T7a：以安、芷若、沛珊在台中＝約打開（只列 D26）；還沒到約校外的程度照舊寫「回台中了，不在臺北。」。AA_372 第 7 節：週末回台中（trip）也一樣 */
    if(!pres.here&&pres.kind==='trip'&&!tc) return pres.away+'，不在臺北。';   /* 方奕廷暑假上山（BB_171）*/
    if(!pres.here&&pres.kind==='home'&&!pres.keep&&!hvOk(G,id)&&!tc&&pres.home) return '回'+pres.home+'了，不在臺北。';   /* 明軒回彰化、方奕廷回台中（BB_171）；可昕、沛珊照下面（可以去找她）*/
    if(!pres.here&&pres.kind==='city'&&!hvOk(G,id)) return pres.lost?pres.away:'在'+pres.city+'，不在臺北。';   /* 沛珊大三起在台南（AA_282）：還沒重新聯絡上＝「很久沒聯絡」；可以去台南找她的照下面 */
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
    if(typeof SOCIAL!=='undefined'&&SOCIAL.STAGES&&SOCIAL.stage&&(SOCIAL.STAGES.indexOf(SOCIAL.stage(id))>=SOCIAL.STAGES.indexOf('CLOSE_FRIEND')||(SOCIAL.friendLevel&&SOCIAL.friendLevel(id)==='CLOSE_FRIEND'))) return false;   /* 好朋友以上：祐廷有女朋友也可以單獨吃飯、散步、喝茶（PARTNER-CLOSE-OK-1110，使用者 11-10 選擇題「好朋友以上就可以」：「已經這麼熟 中午下課卻不能約她吃飯」；修改 AA 10-14 的 ②）——①她自己有伴侶照舊擋 */
    if(typeof ROM!=='undefined'&&ROM.knows) return ROM.knows(G,id).length>0;
    return Object.keys(F).some(k=>k.indexOf('dating_')===0&&F[k]); };   /* 沒有 ROM（舊的測試環境）：照舊 */
  /* 這個地方約不約得到、為什麼（選地點時的說明；可以就空字串）*/
  S.placeWhy=function(G,id,P){ const W=D().why||{}; if(P&&P.noWho&&P.noWho[id]) return P.noWho[id];   /* 她不會去這家（AA_721：可昕平日在外校，好家自助餐只開平日）：灰掉，說明是她那句 */ if(S.partnerBlock(G,id,P)) return (P.kind==='meal'?W.partnerMeal:(P.kind==='walk'?W.partnerWalk:(P.id==='teahouse'?W.partnerTea:null)))||W.partner||'';   /* AA 2026-10-14：照吃飯／散步分開說、告訴玩家可以怎麼約 */
    if(!placeOk(id,P,G)) return (P.kind==='meal'?W.meal:(P.kind==='walk'?W.walk:(P.kind==='sport'?(P.minStage==='FRIEND'?W.run:W.sport):W.stranger)))||'還不太熟';
    if(S.ticketShort(G,P)) return '錢不夠買電影票（'+NYS.PRICE+' 元）';   /* 看電影照自己去一樣買自己的票（INVITE-PLACES-1107，LAWWW-B 定）：錢不夠＝那一格灰掉 */ return ''; };
  /* 電影票（南洋戲院；NYS＝src/nanyang_sys3d.js，票價照 AA_615 150 元）：今天已經買過就不再買；在南洋的約都算（一般的南洋、芷若的週六早場 slot_zr_morning_movie）*/
  const nyPaid=G=>NYS.paidTicket?NYS.paidTicket(G):NYS.hasTicket(G);   /* 員工票不算（AA_828 第 3 節：約會照買票；SHOP-JOBS-1112）*/
  S.ticketShort=(G,P)=>!!P&&P.zone==='xs_nanyang'&&typeof NYS!=='undefined'&&!!G&&!nyPaid(G)&&(G.money|0)<NYS.PRICE;
  S.buyTicket=function(GM,G,P){ if(!P||P.zone!=='xs_nanyang'||typeof NYS==='undefined'||!G||nyPaid(G)||(G.money|0)<NYS.PRICE) return 0; if(GM&&GM.money) GM.money(-NYS.PRICE,'電影票'); else G.money=(G.money|0)-NYS.PRICE; G.flags=G.flags||{}; G.flags.NY_TICKET=G.day|0; if(G.flags.NY_TICKET_STAFF===(G.day|0)) G.flags.NY_TICKET_STAFF=null;   /* 買了票＝今天這張是買的 */ return NYS.PRICE; };
  /* 某一天某個時間，這個人照作息在做什麼（STORY.schedEnt，不含邀約本身）*/
  const entAt=(G,id,day,h)=>{ if(typeof STORY==='undefined'||!STORY.schedEnt) return null; const c=CHARACTERS[id]; if(!c) return null; return STORY.schedEnt(c,{day,hour:h,weekday:wdOf(G,day),flags:G.flags||{},noInvite:true}); };
  const busyAt=(G,id,day,h,stay)=>{ for(const t of [h,h+stay/2,h+stay-0.02]){ const e=entAt(G,id,day,t); if(e&&D().busyActs.includes(e.act)) return e; } return null; };
  const isOpen=(zone,h,day)=>typeof PLACES==='undefined'||!PLACES.isOpen||(PLACES.isOpen(zone,h,day)&&PLACES.isOpen(zone,Math.min(h+0.5,23.99),day));
  const live=iv=>iv.state==='accepted'||iv.state==='going'||iv.state==='offered'||iv.state==='changed';
  const clash=(G,who,day,h,stay,skip)=>(G.invites||[]).find(iv=>iv!==skip&&live(iv)&&iv.day===day&&(iv.who===who||who==null)&&Math.abs(iv.h-h)<Math.max(stay,(S.place(iv.place)||{}).stay||1)+0.25);
  /* 這個時間可不可以（不看關係）：開著、沒和別人約、作息沒事、不是半夜 */
  const hoursOf=(G,P,day)=>{ if(Array.isArray(P.windows)&&P.windows.length) return P.windows[0];   /* windows：一天兩段的店（118 巷，INVITE-PLACES-1107 第二批）；winOk 看每一段 */ if(P.hoursFrom&&typeof PLACES!=='undefined'&&PLACES.windowsOf){ const ws=PLACES.windowsOf(P.hoursFrom,day); if(ws!==undefined) return ws&&ws[0]?ws[0]:[99,0]; }   /* hoursFrom：照 places.js 那一區的開放時間（法圖：學期中平日 08:10～21:45、週末 09:10～17:00，寒暑假另外；AA_535b 2-1）*/
    return P.hoursBy?([0,6].includes(wdOf(G,day))?P.hoursBy.we:P.hoursBy.wk):P.hours; };   /* hoursBy：平日、週末不同（羽球平日 12:00～21:00、週末 9:00～17:00，AA_126 6-6）*/
  const winOk=(G,P,day,h)=>{ if(Array.isArray(P.windows)&&P.windows.length) return (!P.days||P.days.includes(wdOf(G,day)))&&(!P.avail||P.avail(G,day))&&P.windows.some(w=>h>=w[0]-1e-6&&h+P.stay<=w[1]+1e-6); if(P.hoursFrom&&typeof PLACES!=='undefined'&&PLACES.windowsOf){ const ws=PLACES.windowsOf(P.hoursFrom,day); if(ws!==undefined&&ws&&ws.length>1) return (!P.days||P.days.includes(wdOf(G,day)))&&(!P.avail||P.avail(G,day))&&ws.some(w=>h>=w[0]-1e-6&&h+P.stay<=w[1]+1e-6); }   /* 一天兩段（林家乾麵 11–14、17–21；INVITE-PLACES-1107）：哪一段都可以 */ const hr=hoursOf(G,P,day); return (!P.days||P.days.includes(wdOf(G,day)))&&(!P.avail||P.avail(G,day))&&(!hr||(h>=hr[0]-1e-6&&h+P.stay<=hr[1]+1e-6)); };   /* 只有某些星期、某段時間能約的地點（DL-12：半熟週末早上、一盞週三到週日下午）*/
  const myExam=(G,day,h,stay)=>typeof CLS!=='undefined'&&CLS.examAt?CLS.examAt(G,day,h,h+stay):null;   /* 祐廷自己的考試（D14-T3：邀約避開）*/
  const tripAt=(G,day,h,stay)=>typeof DATE!=='undefined'&&DATE.tripAt?DATE.tripAt(G,day,h,stay):null;   /* 已經約好的校外約會那段時間（BUG-DATE-OVERLAP-1021；兩天一夜佔兩天）：和「你那個時間已經約了別人」一樣處理 */
  /* whoLast：這個人在這個地點只排到幾點開始（洋洋鹹酥雞：可昕 21:00，AA_724 第 8 節「十點以前，我還要回外校」）；超過＝和「那個時間沒開」一樣改天 */
  const lastOk=(P,id,h)=>!(P&&P.whoLast&&P.whoLast[id]!=null&&h>P.whoLast[id]+1e-6);
  /* whoDays：這個人在這個地點只排這幾天（星期，0＝日、6＝六；轉角唱片：可昕只排週末，AA-B 11-07 15:36「平日下午她在外校上課；平日那一格不出現就好，不用另外寫婉拒」）*/
  const dayOk=(G,P,id,day)=>!(P&&P.whoDays&&Array.isArray(P.whoDays[id])&&!P.whoDays[id].includes(wdOf(G,day)));
  S.dayOk=(G,P,id,day)=>dayOk(G,P,id,day);
  S.lastOk=lastOk;
  const free=(G,id,P,day,h)=>h>=(P.hours&&P.hours[0]<8?P.hours[0]:8)&&h+P.stay<=23.5&&lastOk(P,id,h)&&dayOk(G,P,id,day)&&isOpen(P.zone,h,day)&&winOk(G,P,day,h)&&!clash(G,id,day,h,P.stay)&&!clash(G,null,day,h,P.stay)&&!tripAt(G,day,h,P.stay)&&!busyAt(G,id,day,h,P.stay)&&!myExam(G,day,h,P.stay);
  S.freeAt=(G,id,P,day,h)=>free(G,id,P,day,h);
  S.busyAt=(G,id,day,h,stay)=>busyAt(G,id,day,h,stay);   /* 校外約會的預約檢查用（date3d.js 的 DATE.check：她那時候上課、上班）*/   /* 這個時間本身可不可以（個人規則用：柏翰「九點十分」）*/
  /* 改天：從 h0 起找下一個可以的時間（同一天每 30 分鐘，之後三天的固定時間）*/
  S.nextFree=function(G,id,P,day,h0){ for(let h=Math.ceil(h0*2)/2; h<=22; h+=0.5) if(free(G,id,P,day,h)) return {day,h}; for(let k=1;k<=3;k++) for(const h of (P.times||D().times.concat([10,14]))) if(free(G,id,P,day+k,h)) return {day:day+k,h}; return null; };   /* P.times：只有這幾個時間（晨跑 06:30）*/
  /* 答不答應（使用者第 4 點）。回傳 {res:'accept'|'resched'|'decline', why, alt:{day,h,place?}, act} */
  /* AA_610／AA_624（使用者 11-03）：語彤從來不在燒臘店＝約她的地點清單裡沒有公館燒臘（選單不列、節日不排、直接約也不成立）*/
  S.NEVER_AT={heroine_03:['noodle']};
  S.neverAt=(id,P)=>!!P&&!!S.NEVER_AT[id]&&S.NEVER_AT[id].includes(P.id||P);
  S.decide=function(G,id,pid,day,h){ S.rec(G); let P=S.place(pid); if(!P) return {res:'decline',why:'place'}; if(S.neverAt(id,P)) return {res:'decline',why:'place'};
    if(typeof STORY!=='undefined'&&STORY.present&&!(STORY.reachable?STORY.reachable(id,{day}):STORY.present(id,{day}))) return {res:'decline',why:'away',day};   /* 在臺北、不在台大（BB_163）不擋：照她的作息和個人規則 */
    if(typeof MREL!=='undefined'&&MREL.zzRefusing&&MREL.zzRefusing(G,id)&&(D().mrelL2||{})[id]) return {res:'decline',why:'mrel'};   /* 子晴、芷若一起分手以後拒絕 L2（AA_227 6-6；台詞在 S.personal）*/
    if(S.partnerBlock(G,id,P)) return {res:'decline',why:'partner'};
    if(P.show&&!P.show(G,id)) return {res:'decline',why:'place'};   /* 還沒開放的地點（茶席：WZ-T3 以後）*/
    if(!placeOk(id,P,G)) return {res:'decline',why:'rel'};
    if(P.noRain&&day===G.day&&G.weather==='rain') return {res:'decline',why:'rain'};   /* 晨跑：下雨不能約（AA_126 6-6）。天氣只有「現在」（G.weather，換日時才決定），沒有預報：約明天的照樣可以約，那天早上下雨就取消（S.tick）*/
    if(P.rainTo&&day===G.day&&G.weather==='rain'){ const Q=S.place(P.rainTo); const ok=Q&&free(G,id,Q,day,h); return {res:'resched',why:'weather',alt:ok?{day,h,place:Q.id}:S.nextFree(G,id,P,day+1,10)}; }
    if(clash(G,null,day,h,P.stay)||tripAt(G,day,h,P.stay)) return {res:'resched',why:'mine',alt:S.nextFree(G,id,P,day,h+0.5)};   /* 你那個時間已經約了別人（校外約會也算，BUG-DATE-OVERLAP-1021）；改天的時間跳過約會那段 */
    const other=clash(G,id,day,h,P.stay); if(other) return {res:'resched',why:'booked',alt:S.nextFree(G,id,P,day,other.h+((S.place(other.place)||{}).stay||1))};
    if(!isOpen(P.zone,h,day)||!winOk(G,P,day,h)||h+P.stay>23.5||!lastOk(P,id,h)||!dayOk(G,P,id,day)) return {res:'resched',why:'closed',day,alt:S.nextFree(G,id,P,day,h+0.5)};
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
  /* 比台詞不看外面那一對「」（AA-B 2026-11-08 00:21：src/data/invites.js 有名字說話的台詞拿掉「」；01:09 第二批 src/data/invite_replies.js（AA_415 產生，build_replies.py 的 strip_quotes）也拿掉了，
     「現有」的列和 invites.js 本來就一樣）：表上的列對 invites.js 的句子（S.replyRow）、避重複（m.t、txtOk、「好。」輪流）都用 S.lineKey——舊存檔 m.t 記的（有「」）讀的時候照同一把尺（keyJ），還是要留著 */
  S.unq=t=>{ if(typeof t!=='string'||t.length<2||t[0]!=='「'||t[t.length-1]!=='」') return t; let d=0; for(let i=0;i<t.length;i++){ const ch=t[i]; if(ch==='「') d++; else if(ch==='」'){ d--; if(d===0&&i!==t.length-1) return t; } } return d===0?t.slice(1,-1):t; };   /* 「A」「B」這種好幾段的不動 */
  S.lineKey=L=>JSON.stringify((Array.isArray(L)?L:[]).map(x=>typeof x==='string'?S.unq(x):(x&&typeof x==='object'&&typeof x.me==='string'?Object.assign({},x,{me:S.unq(x.me)}):x)));
  const keyJ=j=>{ if(typeof j!=='string') return j; try{ const L=JSON.parse(j); return Array.isArray(L)?S.lineKey(L):j; }catch(e){ return j; } };
  S.REPLY_OK_JSON=S.lineKey(['好。']);
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
  const teaOn=(G,id,day)=>[13,14,15,16].some(t=>{ const e=entAt(G,id,day,t); return !!e&&e.zone==='wz_teahouse'; });
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
    /* AA_627 P-27～P-29（AA_624：語彤的班＝週六、日 13～17 在一盞茶屋，作息 zone wz_teahouse）：兩個條件名是 invite_replies.js 的 key（AA_415 產生），不改名，意思改成「那天她在茶屋有班」*/
    '週二週四、續約以前':(G,id,c)=>teaOn(G,id,c.day),
    '麵店的班':(G,id,c)=>teaOn(G,id,c.day),
    '週二週四、續約以前（＝茶屋的班）':(G,id,c)=>teaOn(G,id,c.day), '麵店的班（＝茶屋的班）':(G,id,c)=>teaOn(G,id,c.day),   /* AA_415 c71772fbc（11-07）條件欄加了註記「（＝茶屋的班）」：同一個條件 */
    '週六上午':(G,id,c)=>c.wd===6&&c.h<12,
    '昨天才約過':(G,id)=>(G.invites||[]).some(iv=>iv.who===id&&iv.day===G.day-1&&['done','accepted','going','missed'].includes(iv.state)),
    '早上':(G,id,c)=>c.h<12,
    '筆試以後':(G,id,c)=>!!c.postExam,
    '口試前、出國前一週':(G,id,c)=>['2029-05-29','2028-08-02'].some(k=>{ const d=DK(k); return d!=null&&c.day>=d-7&&c.day<d; }),   /* 學姊：口試 2029-05-29（y34b3d.js M9）、出國 2028-08-02（characters.js absentDates 美國）的前一週 */
    '松鼠節（3 月）':(G,id,c)=>typeof CALENDAR!=='undefined'&&CALENDAR.dateOf(c.day).m===3,
    '上一次約會祐廷遲到':G=>{ const R=G.flags&&G.flags.KX_DRIFT; return !!R&&R.seen!=null&&Array.isArray(R.log)&&R.log.some(e=>e&&e.why==='late'&&e.d===R.seen); } };   /* 可昕：kxdrift3d.js 記的最後一次見面那天遲到超過 15 分鐘 */
  const RPL=['cafe','library','noodle','wenzhou','brunch','teahouse'];
  S.replyTier=row=>{ const T=row.tags||[]; if(T.includes('節日')) return 1; if(T.includes('第一次')) return 2; if(T.some(t=>RPL.includes(t)||t==='來過'||t==='外出'||t==='開車')) return 3; return T.length||row.cond?4:5; };
  S.replyPick=function(G,id,c,tb){ const R=RP(), all=R&&R[id]; if(!all||!all.length) return null; const r=c.r||{};
    const kind=r.res==='accept'?'acc':(r.res==='resched'&&(r.why==='busy'||r.why==='booked')?'resched':(r.res==='decline'&&r.why==='rel'?'decline':null)); if(!kind) return null;
    const n=S.replyStage(G,id), sec='law', ON=S.REPLY_ON||{};
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
    /* CANON-NO-ECON-1112 第四批（AA_891 第 2 節）：kx1～kx19（認識到告白前，階段 1～6）搬進 law 以後，分開以後照舊只用「（分開以後）」那幾列答應（原本那些列在 y0、分開以後本來就用不到）；改天的列（階段 1～7）照用 */
    const ok=row=>row.k===kind&&!row.off&&(!row.sec||row.sec===sec)&&(!row.apart||apart)&&!(apart&&row.sec&&!row.apart&&row.st[1]<7)&&(row.tags||[]).every(tagOk)&&(!row.cond||(!!COND[row.cond]&&!!COND[row.cond](G,id,c)))&&whenOk(row.when)
      &&(kind!=='resched'||!row.at||(alts[row.id]=altFor(row))!=null);
    const inSt=(row,k)=>k>=row.st[0]&&k<=row.st[1];
    const P0=all.filter(row=>inSt(row,n)&&ok(row)); if(!P0.length) return {governs:true};   /* 這一階沒有合的句子：答應照原本的 acc／first（或旁白），改天、婉拒用旁白 */
    const P1=kind==='acc'&&n>=2?all.filter(row=>!inSt(row,n)&&inSt(row,n-1)&&ok(row)):[];   /* 只用來避免重複（這一階只剩上一句的時候）*/
    const st=(S.replyRec(G)[id])||{}, h=Array.isArray(st.h)?st.h:[], u=(st.u&&typeof st.u==='object')?st.u:{};
    /* 台詞避重複（BB 09:09，CC #13：以安好幾列都是「好。」，原本只看列 id，最多連續 6 次「好。」）：上一次說的那一句不再說；「好。」可以連兩次、第三次換別的 */
    const tt=Array.isArray(st.t)?st.t.map(keyJ):[], OKJ=S.REPLY_OK_JSON, txtOk=row=>{ const j=S.lineKey(row.lines); return !(tt[0]===j&&!(j===OKJ&&tt[1]!==OKJ)); };
    const best=(pool,avoid)=>{ for(let t=1;t<=5;t++){ const L=pool.filter(row=>S.replyTier(row)===t&&!avoid.includes(row.id)&&txtOk(row)); if(L.length) return L.slice().sort((a,b)=>(u[a.id]!=null?u[a.id]:-1)-(u[b.id]!=null?u[b.id]:-1))[0]; } return null; };
    const row=best(P0,h.slice(0,2))||best(P0,h.slice(0,1))||best(P1,h.slice(0,2))||best(P1,h.slice(0,1))||best(P0,[])||(()=>{ const L=P0.filter(r=>!h.slice(0,1).includes(r.id)); return L[0]||P0[0]; })(); if(!row) return {governs:true};   /* 字全部撞到（這一階只有「好。」）：照舊看列 id */
    const L=row.ex==='plan'?(tb&&tb('plan')):null;   /* 現有（plan）：照原本的函式（以安：讀書會開始以前「一起寫憲法作業」）*/
    return {row,lines:(L||row.lines).slice(),alt:row.at?alts[row.id]:undefined}; };
  /* 表上台詞一樣的那一列（沒有＝null）*/
  S.replyRow=function(id,lines){ const R=RP(); if(!R||!R[id]||!lines) return null; const k0=S.lineKey(lines); return R[id].find(row=>S.lineKey(row.lines)===k0)||null; };   /* 不看外面的「」（S.lineKey）*/
  /* 記下說了哪一句：表上的句子記 id；rule、here、原本 acc 的句子對得到表上同一句的也記那個 id（不會下一次又挑到同一句）*/
  S.replyMark=function(G,id,rid,lines){ const R=RP(); if(!R||!R[id]||!lines||!lines.length) return; const M=S.replyRec(G), m=M[id]||(M[id]={h:[],u:{},n:0});
    if(!Array.isArray(m.h)) m.h=[]; if(!m.u||typeof m.u!=='object') m.u={};
    if(!rid){ const hit=S.replyRow(id,lines); rid=hit?hit.id:'~'+String(typeof lines[0]==='string'?lines[0]:(lines[0].me||'')).slice(0,24); }
    m.n=(m.n|0)+1; m.h.unshift(rid); m.h.length=Math.min(m.h.length,2); m.u[rid]=m.n; if(!Array.isArray(m.t)) m.t=[]; m.t.unshift(S.lineKey(lines)); m.t.length=Math.min(m.t.length,2); };   /* m.t：最近兩次說的台詞（避重複看字，不只看列 id：好幾列都是「好。」，BB 09:09）*/
  S.personal=function(G,id,P,day,h,r){ const p=(D().people||{})[id]; if(!p||!P||!r) return r;
    { const bl=p.beforeLearn&&p.beforeLearn[P.id]; if(bl&&r.res!=='decline'&&typeof STORY!=='undefined'&&STORY.dayOfKey){ const u=STORY.dayOfKey(bl.until); if(u!=null&&day<u) return Object.assign({},r,{res:'decline',why:'learn',lines:bl.decline.slice(),alt:null}); } }   /* 還沒學會（學姊 2026-06-15 才學游泳，AA_504／AA_715）：約游泳池＝婉拒 */
    if(r.why==='mrel'){ const M=(D().mrelL2||{})[id]; if(M&&M.length){ const F=G.flags||(G.flags={}), N=F.MREL_L2_N||(F.MREL_L2_N={}), k=N[id]|0; N[id]=k+1; return Object.assign({},r,{lines:M[k%M.length].slice()}); } return r; }   /* 不說理由、兩句輪流（AA_227 6-6）*/
    const t=typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(day):null, F=G.flags||{};
    const c={pid:P.id,P,day,h,wd:wdOf(G,day),band:bandOf(id),year:t?(+String(t.id).charAt(1)||1):1,term:t,
      first:!(G.invites||[]).some(iv=>iv.who===id&&iv.place===P.id&&(iv.state==='done'||iv.state==='accepted'||iv.state==='going'||iv.state==='missed')), postExam:S.sisPostExam(day,h),
      w8:typeof STORY!=='undefined'&&STORY.sisW8?STORY.sisW8(G):(typeof EVENTS!=='undefined'&&!!EVENTS.cond&&!!EVENTS.cond({events:['ev_sis_collapse']})),
      dating:typeof ROM!=='undefined'&&ROM.knows?ROM.knows(G,id).length>0:Object.keys(F).some(k=>/^dating_/.test(k)&&!!F[k]),face:!!r.face,r};   /* face：當面約（INV.flow 有 n）；手機約＝false（BB_172 10-1 第 17 點：阿凱、明軒的手機版照訊息體）*/   /* 她知道祐廷有伴侶（BB_191 9-4 #6：芷若宵夜「你可以多帶幾個人」；不是祐廷有沒有伴侶）*/
    const done=(o,rid)=>{ if(o.lines&&S.replyHas(id)) S.replyMark(G,id,rid||null,o.lines); return o; };   /* AA_415：七位女主角記下說了哪一句（不連續兩次同一句；rule、here 的句子也記）*/
    const out=Object.assign({},r), q=p.rule?p.rule(G,c,S):null;
    /* rule 固定回「好。」（以安的散步，invites.js）也放進輪流（BB 09:09）：最近兩次都是「好。」＝這一次不用 rule，交給表上的答應句挑別句 */
    const okTwice=(()=>{ const m=S.replyRec(G)[id], t=m&&Array.isArray(m.t)?m.t.map(keyJ):[]; return t[0]===S.REPLY_OK_JSON&&t[1]===S.REPLY_OK_JSON; })();
    if(q&&!(okTwice&&(!q.res||q.res==='accept')&&S.lineKey(q.lines)===S.REPLY_OK_JSON)){ Object.assign(out,q); if(out.res==='resched'&&!out.alt){ out.res='decline'; } return done(out); }   /* rule 給了句子＝照 rule（AA_415 0-3 最後一點）*/
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
       那一句在表上（「現有」）就照表的條件，不從這裡繞回來（學姊第 3 階第一次約半熟不說「這次我點鬆餅」——表上要「來過」；可昕舊序章那一年不說「我從外校過來」）*/
    else if(r.res==='resched'&&(r.why==='busy'||r.why==='booked')&&!(pk&&pk.governs)){ const L=tb('plan'); if(L) out.lines=L.slice(); }   /* 有表的人改天只照表（表上的「現有（plan）」帶著條件，例：芷若「我在上班。……」只在上班的時候）*/
    return done(out); };
  /* 台詞裡的時間：{zh}＝改天的時間（「九點十分」；不是今天的加「明天」或日期）、{明天？}＝改天是明天才說 */
  const ZH=['零','一','二','三','四','五','六','七','八','九','十'];
  const zhN=n=>n<=10?ZH[n]:(n<20?'十'+ZH[n-10]:ZH[Math.floor(n/10)]+'十'+(n%10?ZH[n%10]:''));
  const zhT=h=>{ const m=Math.round(((h%24)+24)%24*60), H=Math.floor(m/60)%24, M=m%60; return zhN(H%12||12)+'點'+(M===0?'':(M===30?'半':zhN(M)+'分')); };
  S.zhTime=zhT;
  const subLine=(G,t,r)=>{ const a=r&&r.alt; return String(t).replace('{zh}',a?(a.day===G.day?'':(a.day===G.day+1?'明天':when(G,a.day,a.h).split(' ')[0]))+zhT(a.h):'').replace('{明天？}',a&&a.day===G.day+1?'明天？':''); };
  /* 播台詞：不是（ 開頭的＝她／他說（invites.js 的已經不加「」，AA-B 11-08 00:21；第二批 01:09：invite_replies.js、invite_place_lines.js、sport_invite_lines.js、rel_lines.js 也拿掉；別的檔還有「」的照樣是她說）、（…）＝旁白、{me}＝祐廷說；手機上約的時候，她／他的話寫「某某（手機）」。
     invites.js 拿掉「」以後沒有一句變成（ 開頭（除了下面兩種），所以 S.narrLine 不用改；tests/invites_quote_unit.js 會擋 */
  /* 旁白＝整句是一對（…）（同 pool3d.js S.narrWhole）；（ 開頭、）後面還有字的是她說的話：「（小聲）……」「（走出法圖）館員人好好。……」
     （TEXT-QUOTE-UNIFY-1108 第六批，AA-B 11-08 11:50：「（走出法圖）」後面的說的話拿掉「」，原本看「（小聲）」「（走出…）「」這兩種開頭；
     INVITE_DATA、INVITE_REPLIES 每一句、改時間的回覆、ACC0 的分法和原本一樣，只有這一句跟著改——tests/invites_quote_b6_unit.js）*/
  S.narrLine=t=>{ if(typeof t!=='string'||t[0]!=='（') return false; let d=0; for(let i=0;i<t.length;i++){ const ch=t[i]; if(ch==='（') d++; else if(ch==='）'){ d--; if(d===0) return i===t.length-1; } } return false; };
  S.playLines=async function(GM,who,lines,r,lq){ const G=GM.G; for(const st of lines||[]){ if(st&&typeof st==='object'&&st.me){ await GM.say({name:G.name},subLine(G,st.me,r)); continue; }
      const t=subLine(G,st,r); if(lq) lq.chk(t); if(S.narrLine(t)) await GM.say(null,t); else await GM.say(who,t); } };   /* lq：LIBQ.scope()（走出館外那一句起不加小聲）；「（走出法圖）館員人好好。……」是她說的話（AA_595 1-D10）*/
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
    if(r.why==='away'){ const pr=typeof STORY!=='undefined'&&STORY.presence?STORY.presence(id,r.day!=null&&r.day!==G.day?Object.assign({},G,{day:r.day}):G):{};   /* BUG-INV-FUN-AWAY-1107（BB-B）：照約的那一天在哪（原本用今天，明天回台中寫成「這學期不在學校」）*/ return pr.kind==='unreachable'?nm+'沒有回覆。':pr.kind==='home'?nm+(pr.keep?'在'+pr.home+'老家念書':'寒暑假回'+pr.home+'了')+'，不在臺北。':pr.kind==='trip'?nm+pr.away+'，不在臺北。':pr.kind==='city'&&pr.city&&!pr.lost?nm+'在'+pr.city+'，不在臺北。':nm+'這學期不在學校。'; }   /* city：沛珊大三起在台南（AA_282 第 1 節：她不來臺北）；還沒重新聯絡上的不寫在哪 */   /* AA_276：回老家的期間約不到臺北的地點 */   /* 沛珊消失期：聯絡不到（BB_205 第 3 節）*/
    return nm+'說改天。'; };
  /* 約好 */
  S.accept=function(G,id,pid,day,h,o){ o=o||{}; S.rec(G); const P=S.place(pid); G.invSeq=(G.invSeq|0)+1;
    const iv={id:'iv'+G.invSeq,who:id,place:pid,zone:P.zone,day,h:+h.toFixed(3),state:o.now?'going':'accepted',accepted:true,by:o.by||'player',now:!!o.now,label:'和'+nameOf(id)+'約在'+(typeof PLACES!=='undefined'&&PLACES.at?PLACES.at(P.name):P.name)};
    if(o.cat==='study'&&S.catsOf(P).length>1) iv.cat='study';   /* 在「念書」那一類選的（2:30 AM、木曜日這些也能坐坐的地方）；只能念書的地方、其他類不記（存檔欄位不多）*/
    G.invites.push(iv); if(G.invites.length>60){ const keep=G.invites.filter(q=>live(q)); const old=G.invites.filter(q=>!live(q)).slice(-30); G.invites=old.concat(keep); }
    S.msg(G,id,o.now?'和'+nameOf(id)+'一起'+P.verb+'。':'約好了：'+when(G,day,h)+'，'+P.name+'（'+nameOf(id)+'）。',iv); return iv; };
  S.byId=(G,ivId)=>(G.invites||[]).find(q=>q.id===ivId)||null;
  /* AA_675 1-1（AA_661 第 7 列，企劃線 920791094，AA-C 定 D109）：她寒暑假的平日在老家那個城市（presence 的 vacTown：語彤在淡水），答應臺北的邀約時，答應那一句後面多一句（vacTown.acc，輪流）。
     現在、約的那一天都在那個城市才說（週末她在臺北、C16 那兩週在臺北＝不說）；輪到第幾句記在 G.flags.TOWN_ACC_N（{人物: 次數}；舊存檔沒有＝從第一句）*/
  S.townLine=function(G,id,W){ const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[id], V=c&&c.presence&&c.presence.vacTown; if(!V||!Array.isArray(V.acc)||!V.acc.length||typeof STORY==='undefined'||!STORY.presence) return null;
    const p0=STORY.presence(id,G), p1=W&&W.day!=null?STORY.presence(id,Object.assign({},G,{day:W.day,hour:W.h})):p0; if(!p0||p0.town!==V.town||!p1||p1.town!==V.town) return null;
    const F=G.flags||(G.flags={}), N=F.TOWN_ACC_N&&typeof F.TOWN_ACC_N==='object'?F.TOWN_ACC_N:(F.TOWN_ACC_N={}), k=N[id]|0; N[id]=k+1; return V.acc[k%V.acc.length]; };
  /* 作息的覆寫（story3d.js 的 schedEnt 先問這裡）：約好的那段時間人在那個地方；正在一起走過去的人跟著玩家 */
  S.entryFor=function(G,id){ if(!G||!Array.isArray(G.invites)||G.noInvite) return null; const h=G.hour%24;
    for(const iv of G.invites){ if(iv.who!==id) continue; const P=S.place(iv.place); if(!P) continue;
      if(iv.state==='going'){ if(iv.zone!==G.zone&&(S.privateZone(G.zone)||(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G)))) continue; return {zone:G.zone,act:'follow',invite:iv,days:[G.weekday],from:0,to:24}; }   /* 一起走的路上走進宿舍、回家＝作罷（S.arrive、tick 的 dropGoing）：作息不再把她生在你旁邊（BUG-WALK-DORM-FOLLOW-1022，BB 10-22 06:1x：手機快速前往宿舍，她被帶進男生宿舍的房間）*/
      if(iv.state==='accepted'&&iv.lead&&iv.day===G.day){ if(iv.lead.z===G.zone) return {zone:G.zone,act:'follow',invite:iv,days:[G.weekday],from:0,to:24}; continue; }   /* 約念書她帶路的途中（INV-SIT-TOGETHER-1104）：讀檔回來她生在你旁邊，INV.leadTick 接著帶路 */
      if(iv.state==='accepted'&&iv.day===G.day&&h>=iv.h-0.25&&h<iv.h+S.WAIT_H) return P.meetAt?{zone:iv.zone||P.zone,act:'linger',at:P.meetAt,invite:iv,days:[G.weekday],from:iv.h-0.25,to:iv.h+S.WAIT_H}:{zone:iv.zone||P.zone,act:P.sitAct||'wait',invite:iv,days:[G.weekday],from:iv.h-0.25,to:iv.h+S.WAIT_H}; }   /* iv.zone：總圖二樓坐滿改去三樓閱覽區（iv.zone='library'）*/   /* meetAt：在那一區的哪裡等（晨跑：椰林大道傅鐘前；校園的入口離得太遠）*/
    return null; };
  /* 現在可以「見面」：約好的時間、人在那裡（talkCharacter 先問這裡）*/
  S.meetable=function(G,id){ const e=S.entryFor(G,id); return e&&e.invite&&e.invite.state==='accepted'&&!e.invite.lead&&G.zone===e.zone?e.invite:null; };   /* 帶路途中（iv.lead）：坐到她旁邊、走到她旁邊才開演（S.leadTick），按說話不另外開 */
  /* INV-MEET-YIELD-1113（BB-C 11-13 P3，LAWWW 決定讓位）：約好、時間到了、她就在這一區＝互動鍵優先給她（game3d.js updateInteract 設成 E.prefNpc，engine3d.js 對她多算 1.5 m）——總圖約可昕，走到她旁邊不會被別人的初見事件「和常在圖書館的男生說話」搶走 */
  S.meetPref=function(G){ if(!G||!Array.isArray(G.invites)) return null; for(const iv of G.invites){ if(iv&&iv.who&&iv.state==='accepted'&&iv.day===G.day&&S.meetable(G,iv.who)) return iv.who; } return null; };
  /* 見面：一起待一段時間（旁白）、時間過去、留一筆小記憶、熟一點點（不推進戀愛：使用者第 7 點）、習慣記憶 */
  /* ---------- 一起運動的約會（AA_126 6-6、AA_417 第 3 節，AA-B 2026-10-23 定稿；USER_WANTS D40）：羽球 gym_badminton（新體育館 1F）、晨跑 run_avenue（椰林大道）----------
     見面：子晴、可昕照各自的 sport（第一次＝firstAt；一起的時候三句輪流；結束一句），其他人照 INVITE_DATA.sport 的共用旁白。
     數值：大家照 AA_124 一般的「一起運動」（SOCIAL.ACT.sport）；子晴、可昕另外自在 +3、她的戀愛 +3（AA_126 6-3，一天一次；交往中也一樣）。
     羽球＝和一個人打羽球一樣算體能（src/gym3d.js：+1，每週最多 2 次，和自己去打的共用次數）。存檔：G.flags.sportChatN＝{人物:地點: 第幾次}（輪流）*/
  S.sportLines=function(G,id,pid){ const p=(D().people||{})[id]||{}, sh=(D().sport||{})[pid]||{};
    const own=p.sport&&p.sport[pid]&&!(id==='kexin'&&(G.stage||'law')!=='law')?p.sport[pid]:null;   /* 可昕的版本只在法律系那幾年用（stage law）；舊階段不用（D158） */
    if(!own) return {during:(sh.during||[]).slice(),end:(sh.end||[]).slice(),next(){},own:false};
    const F=G.flags||(G.flags={}), N=F.sportChatN||(F.sportChatN={}), k=id+':'+pid, n=N[k]|0, L=own.during||[];
    return {during:L.length?L[n%L.length].slice():[],end:(own.end||[]).slice(),next(){ N[k]=n+1; },own:true}; };
  S.SPORT_BONUS=['heroine_04','kexin'];
  S.sportAfter=function(G,id,P){ const DY=G.daily||(G.daily={});
    if(S.SPORT_BONUS.includes(id)&&typeof SOCIAL!=='undefined'&&SOCIAL.adjust){ const k='sportRom_'+id; if(DY[k]!==G.day){ DY[k]=G.day; SOCIAL.adjust(id,{comf:3,npcRom:3}); } }
    if(P.id==='gym_badminton'){ const r=DY.gym=DY.gym||{}; if(!Array.isArray(r.seen)) r.seen=[]; const wd=typeof CALENDAR!=='undefined'?CALENDAR.dateOf(G.day).wd:((G.weekday|0)||7), wk=G.day-(wd-1);
      if(r.wk!==wk){ r.wk=wk; r.wkN=0; r.seen=[]; } if((r.wkN|0)<2){ r.wkN=(r.wkN|0)+1; r.fit=Math.min(100,(r.fit|0)+1); } r.fitDay=G.day; r.sportDay=G.day; }   /* 和 gym3d.js 的打羽球同一套 */
    else if(P.id==='run_avenue'){ const r=DY.gym=DY.gym||{}; r.sportDay=G.day; }
    else if(P.id==='gym_fitness'||P.id==='gym_pool'){ const r=DY.gym=DY.gym||{}; const wd=typeof CALENDAR!=='undefined'?CALENDAR.dateOf(G.day).wd:((G.weekday|0)||7), wk=G.day-(wd-1); if(r.fitWk!==wk){ r.fitWk=wk; r.fitN=0; }
      if((r.fitN|0)<3){ r.fitN=(r.fitN|0)+1; if(typeof FIT!=='undefined'&&FIT.add) FIT.add(G,2); else r.fit=Math.min(100,(r.fit|0)+2); } r.fitDay=G.day; r.sportDay=G.day; } };   /* 一起練（AA_715）：和自己去健身同一套（+2、每週最多 3 次、升階提示 FIT.upCheck）*/
  if(typeof SOCIAL!=='undefined'&&SOCIAL.MEMORY_LABEL){ SOCIAL.MEMORY_LABEL.SPORT_BADMINTON=SOCIAL.MEMORY_LABEL.SPORT_BADMINTON||'一起打羽球'; SOCIAL.MEMORY_LABEL.SPORT_RUN=SOCIAL.MEMORY_LABEL.SPORT_RUN||'一起晨跑'; SOCIAL.MEMORY_LABEL.SPORT_GYM=SOCIAL.MEMORY_LABEL.SPORT_GYM||'一起去健身中心'; SOCIAL.MEMORY_LABEL.SPORT_POOL=SOCIAL.MEMORY_LABEL.SPORT_POOL||'一起去游泳'; SOCIAL.MEMORY_LABEL.SLOWREAD_TOGETHER=SOCIAL.MEMORY_LABEL.SLOWREAD_TOGETHER||'一起在木曜日念書'; }   /* 慢讀（AA_535 4-1）*/   /* 人物頁的記憶名稱 */
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
    } finally { GM.sceneEnd(); lastMeetEnd=S._now(); }
    S.release(GM,n,iv); if(GM.autosave) GM.autosave(); return true; };
  /* 見面的開場（從 S.meet 拆出來；約念書在總圖門口先演、再帶路：INV-SIT-TOGETHER-1104）。o.fa：連「第一次和她去那個地方」那一句一起（可昕第一次到總圖「（她站在大廳，抬頭看了一圈。）」）*/
  S.meetOpen=async function(GM,iv,who,o){ o=o||{}; const G=GM.G, P=S.place(iv.place)||{}, SO=typeof SOCIAL!=='undefined'?SOCIAL:{}; iv.opened=1;
      if(iv.ask) await S.walkAsk(GM,iv,who);   /* 一起走路時抽到的選項句：走到了、見面開始前選（BB_120 1-7c） */
      { const vf=typeof HASK!=='undefined'&&HASK.meetFirst?HASK.meetFirst(G,iv):null; if(vf) await GM.say(who,vf); }   /* AA_549 3-6：她寒暑假約的（假期版）：見面時她的第一句；之後照一般的場景 */
      if(iv.fest&&typeof FEST!=='undefined'&&FEST.meet) await FEST.meet(GM,iv,who);   /* 約在她節日的見面（AA_416）：先演節日那一段，再照那個地方原本的內容 */
      if(SO.playUp) await SO.playUp(GM,who,iv.who,{place:P.id,outing:true,cap:S.fxCap(G,iv)});   /* 升階以後的下一次見面：先說門檻台詞（AA_124 1-6、BB_120 第 1 節）；傳見面的地點（學姊在一盞這類不讀書的地方升到朋友換一版，AA_383 第 6 節） */
    if(o.fa){ const FA=S.firstAt(G,iv); if(FA){ iv.faDone=1; await S.playLines(GM,who,FA); } } };
  /* 一起念書（STUDY-DATE-PROGRESS-1107）：在「念書」那一類選的、或這個地方只能念書（總圖、法圖、慢讀、社科圖）；有自己一場戲的（ev、期末飯）不算 */
  /* 這一次是哪一種活動（AA_708）：電影＝南洋、書店＝看電影逛書店那一類的其他、吃飯、咖啡；運動、散步、念書不算 */
  S.actKind=function(iv,P){ if(!P) return null; const c=S.catsOf(P); if(P.id==='xs_nanyang') return 'movie'; if(c.includes('fun')) return 'bookstore'; if(c.includes('sport')||c.includes('walk')||P.kind==='walk') return null; if(P.kind==='meal'||c.includes('meal')) return 'eat'; if(c.includes('sit')) return 'cafe'; return null; };
  S.isStudy=(iv,P)=>!!(P&&iv&&!iv.ev&&!iv.te&&(iv.cat==='study'||(S.catsOf(P).includes('study')&&!S.catsOf(P).some(c=>c==='sit'||c==='meal'))));
  S.firstAt=function(G,iv){ if(iv.faDone) return null; let FA=((D().people[iv.who]||{}).firstAt||{})[iv.place]; if(typeof FA==='function') FA=FA(G); return FA&&!(G.invites||[]).some(q=>q!==iv&&q.who===iv.who&&q.place===iv.place&&q.state==='done')?FA:null; };
  /* 約好的見面也算一件主要的事（ACTION-BUDGET-1107，使用者 11-07：「約好見面也要算行動次數 不然幾乎無限」「可行動次數沒了要直接跳下一個階段」；取代 DEC-SLOTS-1018「約好的見面不算」）：
     見面那段時間（開始的時段＋跨進 30 分鐘以上的下一個時段）填滿，和上課、出遊一樣（CLS.slotFillSpan）；約好的照樣能去（時段用過了也能赴約），演完上午、下午用完就跳到下一個時段：這裡只排（CLS.queueJump），等空下來（對話、劇情都結束）story3d.js 的 tick 讀 CLS._jump 再跳——
     不在這裡直接 CLS.afterSlot：演完那一刻玩家還在 busy，afterSlot 會把排好的跳轉丟掉（BB-B 11-07 判 PARTIAL：演完 17:2x 時間照常走）*/
  S.slotJump=async GM=>{ if(typeof CLS!=='undefined'&&CLS.afterSlot){ try{ await CLS.afterSlot(GM); }catch(e){ console.warn('INV.slotJump',e); } } };   /* 演完、場景結束以後馬上試一次；還在 busy（外面還有一層場景）＝CLS 留著跳轉，story3d.js tick 空下來再跳 */
  /* ROM-PRIVATE-DATE-1110 照活動分輕重（使用者 11-13 選擇題「照活動分輕重」）：比較像約會的＝晚餐（吃飯、約 17:00 以後）、散步、看電影逛書店那一類（cats fun）＋2；日常的（念書、喝咖啡、吃午餐）＋1。信任照舊 +1、一天一次（docs/ROMANCE_ACTIVITY_TABLE.md）*/
  S.romAloneAmt=(P,iv)=>{ if(!P) return 1; const cats=S.catsOf?S.catsOf(P):[]; if(P.kind==='walk'||cats.includes('fun')||(P.kind==='meal'&&iv&&+iv.h>=17)) return 2; return 1; };
  S.romAloneOk=id=>typeof DATE!=='undefined'&&Array.isArray(DATE.HEROINES)&&DATE.HEROINES.includes(id)&&id!=='kexin';   /* 單獨約出來加戀愛的對象（ROM-PRIVATE-DATE-1110）：可以攻略的對象；朋友（男生、Alison…）不加 */
  S.spendSlot=function(G,h0){ if(typeof CLS==='undefined'||!CLS.slotFillSpan||h0==null) return; CLS.slotFillSpan(G,h0,Math.max(G.hour,h0+0.5)); if(CLS.queueJump) CLS.queueJump(G); };
  /* 見面的兩個掛勾（AA624-YT-BACKGROUND-1103，語彤約一起念書 src/aa625_3d.js）：fn(GM,iv,who,P)，async。
     ON_SEATED＝開場、坐下的句子演完以後、時間過去以前（坐下讀書以後的那一句）；ON_STAYED＝時間過去、地點字幕以後、收東西和道別以前（讀完那裡的一句、補算讀書）。
     期末飯（iv.te）、有自己一場的（iv.ev）不叫 */
  S.ON_SEATED=[]; S.ON_STAYED=[];
  const hooks=async(L,GM,iv,who,P,nm)=>{ for(const f of L){ try{ await f(GM,iv,who,P); }catch(e){ console.warn('INV.'+nm,e); } } };
  S.meet=async function(GM,iv,n,o){ o=o||{}; const G=GM.G, P=S.place(iv.place), nm=nameOf(iv.who); if(!P) return; const h0=G.hour;
    if(iv.ev&&await S.meetEv(GM,iv,n)){ S.spendSlot(G,h0); return; }
    if(iv.te&&typeof TERMEND!=='undefined'&&TERMEND.dinner){ iv.state='done'; GM.sceneBegin({adv:iv.who}); try{ await TERMEND.dinner(GM,{te:{who:iv.who,kind:iv.te.kind,term:iv.te.term,place:iv.place,placeName:P.name}}); await GM.fade(true); GM.advance(P.stay); await GM.fade(false);
        if(typeof SOCIAL!=='undefined'&&SOCIAL.activity) SOCIAL.activity(iv.who,'meal'); S.msg(G,iv.who,'和'+nm+'吃了學期末的飯。',iv); } finally { GM.sceneEnd(); lastMeetEnd=S._now(); } S.release(GM,n,iv); S.spendSlot(G,h0); if(GM.autosave) GM.autosave(); return; }   /* 玩家自己約的期末飯：整場照 TERMEND.dinner（心意的接回家的路上）*/
    iv.state='done'; iv.mid=1; S.buyTicket(GM,G,P); GM.sceneBegin({adv:iv.who}); const LQ=typeof LIBQ!=='undefined'&&LIBQ.scope?LIBQ.scope():null;   /* 圖書館：走出館外那一句起到道別都不加（小聲）（AA_595 1-D10、Q16）*/ try{ const lines=((D().people[iv.who]||{}).scene||{})[P.id], who={name:nm,obj:n&&n.obj,charId:iv.who}, SO=typeof SOCIAL!=='undefined'?SOCIAL:{};
      if(!iv.opened) await S.meetOpen(GM,iv,who);   /* 開場（路上的選項句、假期版第一句、節日、升階的門檻台詞）；約念書在門口就演過了（S.leadStart，iv.opened）*/
      let HALL=false; if(typeof MOVIES!=='undefined'&&MOVIES.ensure){ MOVIES.ensure(G,iv); if(MOVIES.sayPick) await MOVIES.sayPick(GM,iv,who); }   /* 約看電影：看哪一部（AA_730；舊存檔的約沒有 iv.film＝現在挑）；她換片那一句還沒說（電話約的）＝現在說（AA_745 skip）*/
      if(typeof MOVIES!=='undefined'&&MOVIES.useHall&&MOVIES.useHall(GM,G,iv,P)){ const r=await MOVIES.enterHall(GM,iv,n); if(r){ HALL=true; n=r.n; who.obj=n&&n.obj; o.sat=true; } }   /* 大廳會合以後一起進 1 廳、坐在一起（MOVIE-REAL-1110，使用者 11-10「約看電影 根本沒進場 還在買票區的椅子上就看完了?」）；進不去照舊在大廳演 */
      const SNx=typeof STUDYN!=='undefined'&&S.isStudy(iv,P)?STUDYN.pick(G,iv.who):null, SN=SNx&&!SNx.generic?SNx:null;   /* 一起念書第 N 次（AA_707）：null＝照一般句 */
      const LB=!!o.lib, lib1=LB&&!SN?S.libFirst(G,iv.who):null;
      const SCN=!!P.scene&&!!SN&&iv.cat==='study';   /* 有自己見面那一段的地點（木曜日 MOKS.meetScene）在「念書」那一類約的：先演那一段，再照一起念書第 N 場（原本第 N 場被跳過、次數照加、讀書不算；AA624-YT-BACKGROUND-1103）*/
      const AKd=!SNx&&!P.sport&&!P.scene&&!P.ownMeal&&!(lines&&lines.length)&&typeof STUDYN!=='undefined'&&STUDYN.act?S.actKind(iv,P):null, AXx=AKd?STUDYN.act(AKd).pick(G,iv.who):null; let AX=AXx&&!AXx.generic?AXx:null;
      if(AKd==='movie'&&AX&&typeof MOVIES!=='undefined'&&MOVIES.fitScene) AX=MOVIES.fitScene(G,iv,AX);
      const CIN=P.id==='xs_nanyang'&&typeof MOVIES!=='undefined'&&!!MOVIES.splitMid;   /* 南洋戲院看電影：放映中只演那一幕和不說話的小動作，她的故事線／她最近的事挪到散場、聊完片子以後（MOVIE-ARC-AFTER-1110）*/
      const MV=AKd==='movie'&&typeof MOVIES!=='undefined'&&MOVIES.midLines?MOVIES.midLines(G,iv,AX):null; let SPL=null, actDefer=false;   /* actDefer：第 N 場的中途沒演到（下面），done 不推進到下一場 */   /* 看到一半的那一幕（AA_745，MOVIE-TALK-1110）*/   /* 這一場和約好的片對不上＝這次一般句、下次再演；輪換對不上＝演別則（AA_730 pick 第 3 條）*/   /* 一起吃飯、咖啡、電影、書店第 N 次（AA_708）：null＝照一般句（AA_649 第 4 節）*/
      const AQ=typeof LIBQ!=='undefined'&&LIBQ.studyAt&&GM.E&&GM.E.player&&GM.E.player.obj?LIBQ.studyAt(G.zone,GM.E.player.lv|0,GM.E.player.obj.position.x,GM.E.player.obj.position.z):false;
      const ARC=typeof ARCS!=='undefined'&&!P.scene&&!P.ownMeal&&!P.sport&&!(lines&&lines.length)?ARCS.pick(G,iv.who,{kind:ARCS.kindOf(iv,P,S.isStudy(iv,P)),quiet:AQ}):null;   /* 她自己的故事線（AA_712、BB_305）：這一次的「中途那件事」換成下一拍；null＝照活動自己的 */
      const RT=!ARC&&typeof ARCS!=='undefined'&&ARCS.rotPick&&!P.scene&&!P.ownMeal&&!P.sport&&!(lines&&lines.length)&&!(SN&&SN.k)&&!(AX&&AX.k)?ARCS.rotPick(G,iv.who,{alt:!!((SN&&SN.rot!=null)||(AX&&AX.rot!=null))}):null;   /* 故事線這次不演、活動的第 N 場也演完了：中途說她最近的事（AA_717；期末、颱風、過年前、她的生活到哪）；null＝照活動自己的輪換句 */   /* 約念書兩個人坐下以後（INV-SIT-TOGETHER-1104、AA_649）：坐下的旁白＋她一句 */
      if(LB){ await GM.say(null,LS().seated); if(SN) await STUDYN.play(GM,who,SN.seat); else await GM.say(who,lib1&&lib1.sit||pick(LS().sit)); }
      else if(o.sat&&!AX) await S.seatOpenLines(GM,iv,who,P);   /* 其他約會兩個人一起坐下：開場句（AA_649 第 4 節；有第 N 場＝照第 N 場的坐下）*/
      const mp=SO.meetPick?SO.meetPick(iv.who,P.id):null, ml=mp?mp.t:null;   /* 見面時的旁白：地點×階段（BB_120 第 1 節；沒有那一格照舊）。mp.say＝那個人說的（阿凱燒臘店「好，我餓了。」；rel_lines.js 拿掉「」以後用 {t,say:true} 標，原本看開頭的「）*/
      const sp=P.sport?S.sportLines(G,iv.who,P.id):null;   /* 一起運動（AA_417 第 3 節）：第一次（子晴、可昕）→ 一起的時候（輪流一句）→ 打完、跑完 → 結束 */
      const FAof=()=>S.firstAt(G,iv);   /* iv.faDone：門口已經說過（S.meetOpen o.fa）*/
      if(sp){ const FA=FAof(); if(FA) await S.playLines(GM,who,FA,undefined,LQ); if(P.id==='gym_badminton') await S.badClip(GM,iv,who); if(sp.during.length) await S.playLines(GM,who,sp.during); sp.next(); }   /* 羽球：答應、第一次那一句 → 短片 → 一起的時候（AA_485 第 2 節）*/
      else if(SN&&(LB||(!(lines&&lines.length)&&(!P.scene||SCN)&&!P.ownMeal))){ if(!LB){ if(SCN) await P.scene(GM,iv,who); await STUDYN.play(GM,who,SN.seat); } const FA=FAof(); if(FA) await S.playLines(GM,who,FA,undefined,LQ); }   /* 一起念書第 N 場：見面旁白（地點×階段，每次都一樣）不播；咖啡館等其他地方：坐下的句子 → 第一次的那一句 */
      else if(AX){ await STUDYN.play(GM,who,AX.seat); const FA=FAof(); if(FA) await S.playLines(GM,who,FA,undefined,LQ); }   /* 一起活動第 N 場：坐下／進店的句子（見面旁白每次一樣，不播）→ 第一次的那一句 */
      else { if(lines&&lines.length){ for(const t of lines) await GM.say(who,t); } else if(P.scene) await P.scene(GM,iv,who); /* 地點自己的見面（茶席：AA_167，src/wzlines3d.js）*/ else if(ml){ if(LQ) LQ.chk(ml); await GM.say(mp.say?who:null,ml); } else await GM.say(null,'你和'+nm+P.verb.replace(/^去/,'在')+'。');
        { const FA=FAof(); if(FA) await S.playLines(GM,who,FA,undefined,LQ); } }   /* 第一次和她（他）去那個地方：在那裡多說的（BB_158 的 first：點完餐、脫鞋、老闆娘說的三分四十秒）*/
      { const DQ=typeof DECIDE!=='undefined'&&DECIDE.due?DECIDE.due(G,iv.who):null; if(DQ) await DECIDE.playDue(GM,who,iv.who,DQ); }   /* 她幾天後才跟你說的決定（AA_719 delay，「我想了想，還是……」）：見面坐下以後先說 */
      if(CIN) await hooks(S.ON_SEATED,GM,iv,who,P,'ON_SEATED');   /* 看電影：坐下以後要說的（她上次那部片之後想跟你說的，AA_745 with.later）在燈暗以前說，不在放映中 */
      if(!SN&&!LB&&((D().seatOpen||{}).byPlace||{})[P.id]==='movie'){ if(HALL) MOVIES.lights(false); await GM.say(null,(typeof MOVIES!=='undefined'&&MOVIES.dimLine&&MOVIES.dimLine(G,iv))||S.MOVIE_DIM); }   /* 1 廳：場燈關掉；燈暗那一句寫片名（AA_730 dimTitle）*/   /* 看電影：坐下的開場句以後燈暗、電影開始，再接中途那件事、散場句（AA-B 10:02 經 BB，CINEMA-CG-1107）；電影畫面 movie_01～10 等使用者給圖再接在這一句後面 */
      if(!CIN) await hooks(S.ON_SEATED,GM,iv,who,P,'ON_SEATED');
      const SNo=SN&&!LB&&!(lines&&lines.length)&&(!P.scene||SCN)&&!P.ownMeal;
      if(LB) await S.libStay(GM,iv,who,P,SN,ARC,RT); else if(SNo){ await GM.fade(true); GM.advance(P.stay/2); await GM.fade(false); if(ARC) await ARCS.run(GM,who,iv.who,ARC); else if(RT) await ARCS.rotRun(GM,who,iv.who,RT); else { await STUDYN.mid(GM,who,iv.who,SN,S.fxCap(G,iv)); if(SN.rot!=null&&typeof ARCS!=='undefined'&&ARCS.rotDone) ARCS.rotDone(G,iv.who,null); } await GM.fade(true); GM.advance(P.stay/2); await GM.fade(false); if(G.stats) G.stats.study=(G.stats.study|0)+Math.max(1,Math.round(P.stay)); if(typeof STORY!=='undefined'&&STORY.onStudy){ try{ STORY.onStudy(GM,P.stay); }catch(e){ console.warn('STORY.onStudy',e); } } }   /* 其他地方一起念書：時間一半、中途那件事、另一半；讀書照算（和總圖一樣）*/
      else if(CIN&&!P.ownMeal&&(ARC||AX||RT||MV)){ await GM.fade(true); GM.advance(P.stay/2); await GM.fade(false);   /* 看電影（MOVIE-ARC-AFTER-1110，AA、BB 11-10 21:37）：看到一半＝那部片的那一幕（每次都演）→ AA_708 第 N 場自己的小動作（只留旁白）；沒有選項、她不講自己的事 */
        if(MV) await MOVIES.playMid(GM,who,MV);
        if(AX){ SPL=MOVIES.splitMid(AX,!!MV&&AX.k==null); if(MV&&MV.withMid) SPL.dark=[];   /* 這一次演了 with.mid（這部片和她看的那一幕）＝AA_708 第 N 場自己的小動作這一次不演（AA 11-10 裁定：二選一，with.mid 優先）；說出口的句子、選項照舊挪到散場以後 */
          if(SPL.dark.length) await STUDYN.play(GM,who,SPL.dark); if(!ARC&&!RT&&AX.rot!=null&&typeof ARCS!=='undefined'&&ARCS.rotDone) ARCS.rotDone(G,iv.who,null);
          if(SPL.opts&&!(MV&&MV.withMid)&&SPL.opts.every(q=>q&&/^（/.test(String(q.t||'')))){ await STUDYN.mid(GM,who,iv.who,Object.assign({},AX,{mid:[],opts:SPL.opts}),S.fxCap(G,iv)); SPL.opts=null; }   /* 選項全是（…）開頭＝放映中的小動作、小聲說（AA_708@d30416e6b 電影場）：在暗的廳裡、小動作後面就選；說出口的句子照舊散場以後（BB 11-11 CC 讀碼：原本選項一律挪到走出 1 廳，「把手翻過來」變成散場才問）*/
          if(MV&&MV.withMid&&AX.k) actDefer=true; }   /* with.mid 取代了第 N 場的小動作＝那一場（含選項）這次沒演，不算次數、下次再演 */
        await GM.fade(true); GM.advance(P.stay/2); await GM.fade(false); }
      else if(!P.ownMeal&&(ARC||AX||RT)){ await GM.fade(true); GM.advance(P.stay/2); await GM.fade(false); if(MV) await MOVIES.playMid(GM,who,MV); if(ARC) await ARCS.run(GM,who,iv.who,ARC); else if(RT) await ARCS.rotRun(GM,who,iv.who,RT); else { await STUDYN.mid(GM,who,iv.who,MV?Object.assign({},AX,{mid:[]}):AX,S.fxCap(G,iv)); if(AX.rot!=null&&typeof ARCS!=='undefined'&&ARCS.rotDone) ARCS.rotDone(G,iv.who,null); } await GM.fade(true); GM.advance(P.stay/2); await GM.fade(false); }   /* 吃飯、咖啡、電影、書店：時間一半 → 故事線那一拍 → 另一半 */   /* MV：電影那一幕（AA_745 scene／with.mid；AA_708 第 N 場有自己的 mid＝null）——取代輪換那一則的 mid、接在故事線那一拍前面 */
      else if(!P.ownMeal&&MV){ await GM.fade(true); GM.advance(P.stay/2); await GM.fade(false); await MOVIES.playMid(GM,who,MV); await GM.fade(true); GM.advance(P.stay/2); await GM.fade(false); }   /* 看電影、這一次沒有第 N 場：看到一半演那部片的那一幕（AA_745 scene）*/
      else if(!P.ownMeal){ await GM.fade(true); GM.advance(P.stay); await GM.fade(false); } GM.caption('',[P.name,nm,'（'+(P.stay>=1?P.stay+' 小時':Math.round(P.stay*60)+' 分鐘')+'）'].join('・'),2600);   /* ownMeal：地點的 scene 自己點餐、走時間（Pasta 118 照 L118.order，AA_480 第 5 節）*/
      if(HALL) MOVIES.lights(true);   /* 散場：場燈打開 */
      await hooks(S.ON_STAYED,GM,iv,who,P,'ON_STAYED');
      if(typeof SOCIAL!=='undefined'){ if(SOCIAL.remember) SOCIAL.remember(iv.who,P.memory,P.name); if(SOCIAL.activity){ SOCIAL.activity(iv.who,P.sport?'sport':({cafe:'cafe',library:'library',noodle:'meal',wenzhou:'walk',brunch:'meal',teahouse:'cafe',slowread:'library'}[P.id]||(P.kind==='meal'?'meal':'cafe'))); if(iv.by==='npc') SOCIAL.activity(iv.who,'acceptInvite'); } else if(SOCIAL.adjust) SOCIAL.adjust(iv.who,{fam:2}); }
      if(typeof SOCIAL!=='undefined'&&SOCIAL.adjust&&S.romAloneOk(iv.who)){ const DY=G.daily||(G.daily={}), k='romAlone_'+iv.who; if(DY[k]!==G.day){ DY[k]=G.day; const rr=S.romAloneAmt(P,iv); SOCIAL.adjust(iv.who,{npcRom:rr,rom:rr,trust:1}); } }   /* ROM-PRIVATE-DATE-1110（使用者 11-10：「基本上私下約就有點曖昧吧」「不應該單一約會還沒有增加戀愛」「大一上…應該也要可以培養戀愛」）：可以攻略的對象（DATE.HEROINES；可昕照舊另算）認識以上就加——原本 AA_243 第 1 節從朋友（第 3 階）起，認識、有點熟約幾次都是 0；另外信任 +1（原本約會幾乎不加信任，卡在變朋友前面）。選項對話加的另算（DATE-CHOICES-1110）*/   /* 校園單獨約出來（AA_128 1-1）：她的戀愛 +1、祐廷的戀愛 +1，同一個人一天一次；AA_243 第 1 節（BB_199 P0-1 方案 A）：從朋友（第 3 階）開始，不是第 5 階 */   /* AA_124 1-2：照地點（Café、總圖、吃飯、溫州街）；對方約的又赴約，信任 +1 */
      if(sp) S.sportAfter(G,iv.who,P);   /* 子晴、可昕：自在 +3、她的戀愛 +3（AA_126 6-3）；羽球＝打羽球的體能 */
      { const SO2=D().seatOpen, mk=SO2&&(SO2.byPlace||{})[P.id]; if(mk==='movie'&&!AX&&Array.isArray(SO2.movieEnd)&&SO2.movieEnd.length) await S.playLines(GM,who,pick(SO2.movieEnd)); }   /* 看電影：散場那一句（AA_649 第 4 節 movieEnd；INVITE-PLACES-1107）*/
      if(HALL){ n=await MOVIES.leaveHall(GM,iv,n); who.obj=n&&n.obj; }   /* 走出 1 廳回大廳，接著道別（MOVIE-REAL-1110）*/
      if(CIN&&SPL&&(SPL.after.length||SPL.opts)&&!actDefer) await STUDYN.mid(GM,who,iv.who,Object.assign({},AX,{mid:SPL.after,opts:SPL.opts}),S.fxCap(G,iv));   /* actDefer＝這一場下次再演，說出口的句子、選項也留到那時 */   /* AA_708 那一場 mid 裡說出口的句子、選項：走出 1 廳以後才說 */
      if(P.id==='xs_nanyang'&&typeof MOVIES!=='undefined'&&MOVIES.after) await MOVIES.after(GM,iv,who);   /* 散場以後聊這部片（三個選項、效果）、和她看多出來的那一段（AA_745，MOVIE-TALK-1110）；第二次看同一部＝一句旁白 */
      if(CIN){ if(ARC) await ARCS.run(GM,who,iv.who,ARC); else if(RT) await ARCS.rotRun(GM,who,iv.who,RT); }   /* 聊完片子以後、道別以前：她的故事線那一拍，或她最近的事——一次看電影最多一個（MOVIE-ARC-AFTER-1110）*/
      if(typeof WISH!=='undefined'&&WISH.meetMention) await WISH.meetMention(GM,iv,who);   /* 心願：聊天提到（DATE-C4、C5；src/wish3d.js）——見面那一段演完、道別以前，條件到了說一次 */
      { const AM=(D().people[iv.who]||{}).afterMeet; const L=typeof AM==='function'?AM(G,iv,P.id):null; if(L&&L.length) for(const t of L) await GM.say(S.narrLine(t)?null:who,t); }   /* 見面之後那個人的一句（沛珊 P4b 的便條）。旁白／說的話照 S.narrLine 分（和 S.playLines 同一把尺；原本看開頭的「，有名字的台詞不加「」以後認不出來，AA-B 11-08）*/
      if(LB) await S.libEnd(GM,iv,n,who,lib1,SN);
      else if(SNo){ await STUDYN.play(GM,who,SN.pack); await STUDYN.play(GM,who,SN.bye); }   /* 收書、道別（AA_707）*/   /* 約念書：收書 → 兩個人起身、一起走到門口 → 道別（AA_649 第 1 節 6、7）*/
      else if(AX&&(AX.pack||AX.bye)){ if(AX.pack) await STUDYN.play(GM,who,AX.pack); if(AX.bye) await STUDYN.play(GM,who,AX.bye); else { const by=SO.byeLine?SO.byeLine(iv.who):null; if(by) await SO.playSteps(GM,who,iv.who,by); } }   /* 一起活動第 N 場：收東西、道別（AA_708）*/
      else if(sp){ if(sp.end.length) await S.playLines(GM,who,sp.end); }   /* 一起運動：「結束」是最後一句（AA_417 第 3 節），不接階段的道別句 */
      else { const by=SO.byeLine?SO.byeLine(iv.who):null; if(by) await SO.playSteps(GM,who,iv.who,by); }   /* 見面結束的一句：照現在的階段（AA_124 1-6、BB_120） */
      if(typeof EVENTS!=='undefined'&&EVENTS.habit){ EVENTS.habit('place:'+P.zone+':with:'+iv.who); if(P.kind==='meal') EVENTS.habit('meal:'+P.zone+':with:'+iv.who); }
      if(SNx&&typeof STUDYN!=='undefined') STUDYN.done(G,iv.who,SN,{defer:!!(ARC&&SN&&SN.k)});   /* 故事線那一拍取代了第 N 場的中途（SNo、libStay 都是 ARC 優先）＝第 N 場下次再演 */
      if(AXx&&AKd) STUDYN.act(AKd).done(G,iv.who,AX,{defer:actDefer||!!(ARC&&!CIN&&AX&&AX.k)});   /* 吃飯、咖啡、書店：故事線那一拍取代了第 N 場的中途＝下次再演（電影的故事線挪到散場以後、不取代，看 actDefer）*/   /* 這種活動的次數 +1（一天一次）、下一場、旗標 */   /* 次數 +1（一天一次）、下一場、旗標、第 6 場＝正式約會一次 */
      S.msg(G,iv.who,'和'+nm+'在'+P.name+'。',iv); delete iv.mid;   /* 演完才拿掉：途中出錯＝S.unwind 看到 iv.mid 改成作罷（CC 11-04 讀程式：原本一開始就記 done，出錯停在 done）*/
    } finally { if(LQ) LQ.end(); GM.sceneEnd(); lastMeetEnd=S._now(); }
    S.release(GM,n,iv); if(iv.state==='done') S.spendSlot(G,h0); if(GM.autosave) GM.autosave(); await S.slotJump(GM); };
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
    if(S.leadTick(GM)) return true;   /* 約念書她帶路（INV-SIT-TOGETHER-1104）：走近她坐的位子＝開演；玩家走掉、過太久＝作罷 */
    if(S.arriveDue(GM)){ S.arrive(GM,G.zone).catch(e=>console.warn('INV.arrive',e)); return true; }   /* 讀途中存的檔回來、人已經在約好的地方（BUG-AN-NOODLE-STUCK-1027 ②）：照走到了開始，不等兩小時記成作罷 */
    for(const iv of G.invites){ if(iv.state!=='accepted'||iv.day!==G.day) continue; const P=S.place(iv.place)||{};
      if(P.noRain&&G.weather==='rain'&&h<iv.h+S.WAIT_H){ iv.state='cancelled'; const t=fmtWhy((D().why||{}).rainOff||'下雨了，和{who}的晨跑取消。',{who:nameOf(iv.who)}); S.msg(G,iv.who,t,iv); if(GM.toast) GM.toast(t,4200); continue; }   /* 晨跑那天早上下雨＝取消（AA_126 6-6「下雨不能約」；沒有天氣預報，約的時候只看得到現在的天氣）*/
      if(!iv.early&&!iv.lead&&G.zone===(iv.zone||P.zone)&&h>=iv.h-2&&h<iv.h-0.25){ iv.early=1; if(GM.caption) GM.caption('','（約好的是 '+hh(iv.h)+'。還早。你在門口的長椅坐了一下。）',4200); else if(GM.toast) GM.toast('（約好的是 '+hh(iv.h)+'。還早。你在門口的長椅坐了一下。）',4200); }   /* AA_651 第 3 節第 1 點：旁白 */   /* 提早 15 分鐘以上到：她還沒來（S.entryFor 從前 15 分鐘起），系統提示一次（INV-SIT-TOGETHER-1104 第 6 項；系統字，待 AA 確認）*/
      /* MOVIE-REMIND-LATE-1110（BB 11-10 18:15 P3）：人已經在約好的地方（含同一處的裡面，例：南洋戲院大廳→1 廳）、或對話正在演＝不跳提醒（看電影那次在大廳會合以後才跳出來、蓋在 1 廳開場那一頁上）*/
      if(!iv.rem&&h>=iv.h-0.5&&h<iv.h){ iv.rem=1; const Zm=iv.zone||P.zone, here=!!Zm&&(G.zone===Zm||String(G.zone||'').indexOf(Zm+'_')===0); if(!here&&!(typeof ADV!=='undefined'&&ADV.active)&&GM.toast) GM.toast('提醒：'+hh(iv.h)+' 和'+nameOf(iv.who)+'約在'+(typeof PLACES!=='undefined'&&PLACES.at?PLACES.at(P.name||''):(P.name||''))+'。',4200); }
      if(!iv.where&&!iv.lead&&h>=iv.h+0.25&&h<iv.h+S.WAIT_H&&G.zone!==(iv.zone||P.zone)){ iv.where=1; if(typeof PHONE!=='undefined'&&S.hasContact(G,iv.who)){ PHONE.post(G,{th:'p:'+iv.who,from:iv.who,text:'你在哪？'}); if(GM.phoneBadge) GM.phoneBadge(); if(GM.toast) GM.toast('手機｜'+nameOf(iv.who)+'：你在哪？',3600); } } }
    for(const iv of G.invites){ if(iv.state==='accepted'&&past(iv)&&iv.lead&&G.zone!==iv.lead.z){ S.leadDrop(GM,iv); } }   /* BB_255 11-13（以安約念書 study_abandon leave）：她帶路途中玩家走出那一區、外面的事件插進來把時間拖過等待時間＝照「走出那一區」作罷（cancelled＋「後來作罷了」），不算爽約 */
    for(const iv of G.invites){ if(iv.state==='accepted'&&past(iv)&&!(iv.waitSeat&&G.zone===iv.zone)&&!(iv.lead&&G.zone===iv.lead.z)){ iv.state='missed'; S.msg(G,iv.who,'你沒有赴約：'+when(G,iv.day,iv.h)+'，'+((S.place(iv.place)||{}).name||'')+'（'+nameOf(iv.who)+'）。',iv);
        if(typeof SOCIAL!=='undefined'&&SOCIAL.remember) SOCIAL.remember(iv.who,'MISSED_DINNER',(S.place(iv.place)||{}).name||''); }
      else if(iv.state==='going'&&(iv.day<G.day||h>=iv.h+2)){ iv.state='cancelled'; S.msg(G,iv.who,'和'+nameOf(iv.who)+'一起去'+((S.place(iv.place)||{}).name||'')+'的事，後來作罷了。',iv); const n=S.npcOf(GM,iv.who); if(n){ n.beh='idle'; } }
      else if((iv.state==='offered'||iv.state==='changed')&&past(iv)) iv.state='cancelled'; }
    for(const iv of G.invites){ if(iv.state==='going'&&typeof HOME!=='undefined'&&HOME.at&&HOME.at(G)) S.dropGoing(GM,iv); }   /* 一起走的時候回家＝作罷（使用者 10-21 23:1x：回宿舍學姊還跟著）*/
    S.goingGoal(GM); S.autoStart(GM); S.goPrompt(GM).catch(e=>console.warn('INV.goPrompt',e)); };
  /* 一起過去的途中：上方目標列寫「和○○一起去○○」（INV-NOW-GOAL-1110，使用者 11-10 X286「約好現在一起過去的地方 要顯示在行程 以免忘記到底約哪」）。
     「現在一起過去」（state going）、她帶路（accepted＋lead）都算；到了、作罷、回家就換回原本的目標（同 carlot3d.js 的 CARLOT_GOAL）。
     G.flags.INV_GOAL＝[這一筆的 id, 目標字, 原本的目標, 原本的目的地]；途中別的劇情改了目標就不再蓋過去，結束時目標不是這一句也不還原 */
  S.goingText=function(G,iv){ const P=S.place(iv.place)||{}, Z=typeof Z3!=='undefined'&&Z3.ZONES?Z3.ZONES[iv.zone]:null, nm=iv.alt&&Z&&Z.name?Z.name:(typeof PLACES!=='undefined'&&PLACES.at?PLACES.at(P.name||''):(P.name||''));
    return '和'+nameOf(iv.who)+'一起去'+(nm||'約好的地方'); };
  S.goingGoal=function(GM){ const G=GM&&GM.G; if(!G||!GM.setGoal) return; const F=G.flags||(G.flags={}), cur=F.INV_GOAL;
    const iv=(G.invites||[]).find(x=>x.day===G.day&&(x.state==='going'||(x.state==='accepted'&&x.lead)));
    if(iv){ const txt=S.goingText(G,iv); if(cur&&cur[0]===iv.id){ if(cur[1]!==txt&&G.goal===cur[1]){ cur[1]=txt; GM.setGoal(txt,{zone:iv.zone,name:txt}); } return; }   /* 換了地方（二樓坐滿改去三樓）＝跟著改；別人改過目標＝不蓋 */
      const prev=cur&&G.goal===cur[1]?[cur[2],cur[3]]:[G.goal==null?null:G.goal,G.goalDest==null?null:G.goalDest];
      F.INV_GOAL=[iv.id,txt,prev[0],prev[1]]; GM.setGoal(txt,{zone:iv.zone,name:txt}); return; }
    if(!cur) return; delete F.INV_GOAL; if(G.goal!==cur[1]) return;
    if(cur[2]!=null&&cur[2]!==cur[1]) GM.setGoal(cur[2],cur[3]==null?undefined:cur[3]); else if(typeof CLS!=='undefined'&&CLS.setGoal) CLS.setGoal(GM); else GM.setGoal('—'); };
  /* 約會快到的提醒可以直接過去（UX-INV-GO-1023，使用者 10-23 08:2x「現在有提醒有約會快到 應該要新增可以直接到約會地點的功能」）：
     約好的時間前 30 分鐘到約好的時間後 15 分鐘、人不在那一區、空下來＝問一次「直接過去」（照手機的快速前往：花路程時間、落點照 PLACES.quickList 那一區的；沒去過也可以）；
     手機「今天約好的」每一筆也有「前往」（S.goNow）。該出發的出遊（OUT）先問，這裡不搶。系統字，不是台詞 */
  let goBusy=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['invites3d:goBusy']=()=>{ goBusy=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
  S.goTarget=function(G,iv){ const P=S.place(iv.place)||{}, QL=typeof PLACES!=='undefined'&&PLACES.quickList?PLACES.quickList():[], Q=QL.find(p=>p&&p[0]===P.zone&&P.meetAt&&P.name&&String(p[1]).includes(P.name))||QL.find(p=>p&&p[0]===P.zone); return {zone:P.zone,name:P.name||'',spawn:Q&&Q[2]?Q[2]:null}; };   /* 晨跑：落在「椰林大道・傅鐘」（不是校園的第一個落點霖澤館前）*/
  S.hereNote=function(G,iv){ if(!iv||iv.state!=='accepted'||iv.day!==G.day) return null; const h=G.hour%24, P=S.place(iv.place)||{}; if(!P.zone||G.zone!==P.zone||h>=iv.h+S.WAIT_H) return null; return '你已經在這裡了。收起手機，等她就好。'; };   /* 手機「今天約好的」：人已經在約好的地方（看手機時間不走）*/
  S.canGo=function(G,iv){ if(!iv||iv.state!=='accepted'||iv.day!==G.day) return false; const h=G.hour%24, P=S.place(iv.place)||{}; return !!P.zone&&G.zone!==P.zone&&h<iv.h+S.WAIT_H; };
  /* 問過「直接過去」的記號不跟著存檔（BUG-INV-GOASK-PERSIST-1110，BB-B 11-10 CC PC SOCX_edae_study_h1_iv：提醒跳出來的那一刻自動存檔，讀回來就不再提醒、站著等到錯過）：
     設成不能列舉的屬性（JSON 存檔不會帶）；舊存檔裡帶著的（可以列舉的 goAsked）當作沒問過 */
  const markAsked=iv=>{ try{ Object.defineProperty(iv,'goAsked',{value:1,writable:true,configurable:true,enumerable:false}); }catch(e){ iv.goAsked=1; } };
  S.asked=iv=>{ const d=iv?Object.getOwnPropertyDescriptor(iv,'goAsked'):null; return !!(d&&d.value&&!d.enumerable); };
  S.goDue=function(G){ if(!G||!Array.isArray(G.invites)) return null; const h=G.hour%24; return G.invites.find(iv=>S.canGo(G,iv)&&!S.asked(iv)&&h>=iv.h-0.5&&h<iv.h+0.25)||null; };
  /* 一鍵前往＝時間跳到約好的時間、人帶到那裡（INV-GO-JUMP-1110，使用者 11-10 X290「一鍵前往約會地點 時間也要到那時候 有時候會出現還沒開 或時間還沒到 一鍵前往就是要跳到那個時間 那個地點」）：
     到的時間＝她到的時間（約好的前 15 分鐘，S.entryFor）；那裡還沒開門＝到的時間改成開門那一刻（每 5 分鐘一格，到等她的時間結束為止）；出發＝到的時間減路程。
     isOpen(h)：那一區 h 點開不開（game3d.js 的 openAt）。回傳當天的小時 {arrive,leave}；等她的時間裡都沒開＝null（手機照舊寫「現在沒有開」）。
     取代 UX-QUICKGO-BEFORE-OPEN-1107 的「還沒開門不給前往」（BB-B 11-07 選項 2）：使用者要的是按了就到 */
  S.goTimes=function(G,iv,mins,isOpen){ if(!iv) return null; const a0=iv.h-0.25, end=iv.h+S.WAIT_H; let arrive=null;
    for(let k=Math.ceil(a0*12-1e-6); k/12<end-1e-6; k++){ let ok=true; try{ ok=!isOpen||!!isOpen(k/12); }catch(e){ ok=true; } if(ok){ arrive=k/12; break; } }
    if(arrive==null) return null; return {arrive,leave:arrive-(mins||0)/60}; };
  S.goNow=async function(GM,iv){ const G=GM.G, t=S.goTarget(G,iv); if(!S.canGo(G,iv)||!GM.quickGo) return false;
    markAsked(iv);   /* 等出發的這段時間不再跳「直接過去」（同一筆已經在前往了）*/
    const pos=GM.E&&GM.E.player&&GM.E.player.obj?GM.E.player.obj.position:null, mins=GM.placeMins?GM.placeMins([t.zone,t.name,t.spawn]):(typeof CLS!=='undefined'&&CLS.travelMinutes?CLS.travelMinutes(G,G.zone,t.zone,pos,t.spawn):15);
    const T=S.goTimes(G,iv,mins,GM.openAt?h=>GM.openAt(t.zone,h):null);
    if(T&&T.leave>(G.hour%24)+0.05&&typeof CLS!=='undefined'&&CLS.skipTo){ const ok=await CLS.skipTo(GM,T.leave,{why:'等到該出發去赴約'}); if(!ok||(G.hour%24)<T.leave-0.02||!S.canGo(G,iv)) return false; }   /* 中途停下來（課、劇情、約取消）＝停在那裡，之後再按一次 */
    await GM.quickGo([t.zone,t.name,t.spawn],{force:true,arriveOpen:true}); return G.zone===t.zone; };
  S.goPrompt=async function(GM){ const G=GM&&GM.G; if(goBusy||!G||!GM.choose) return false; const iv=S.goDue(G); if(!iv) return false;
    if((GM.E&&GM.E.player&&GM.E.player.busy)||(typeof OUT!=='undefined'&&OUT.due&&OUT.due(G))) return false;   /* 該出發的出遊先問（同一輪 OUT.tick 接著跑，不能兩個選單一起開）*/
    markAsked(iv); goBusy=true; const t=S.goTarget(G,iv); let k=1;
    try{ GM.sceneBegin(); try{ k=await GM.choose([{t:'直接過去：和'+nameOf(iv.who)+'約在'+(typeof PLACES!=='undefined'&&PLACES.at?PLACES.at(t.name):t.name)+'（'+hh(iv.h)+'）',hint:'照快速前往的路程時間'},{t:'自己走過去'}],{menu:true}); } finally { GM.sceneEnd(); }
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
    for(const iv of G.invites){ if(iv.state!=='accepted'||iv.lead||iv.day!==G.day||h<iv.h-0.25||h>=iv.h+S.WAIT_H||G.zone!==iv.zone) continue;   /* iv.lead：她正在帶路（S.leadTick 管）*/
      const n=S.npcOf(GM,iv.who); if(!n||!n.obj) continue;
      const d0=GM.sceneDepth?GM.sceneDepth():null; autoBusy=true; if(GM.sceneBegin) GM.sceneBegin();   /* 當下就鎖住（見上面）：同一格的 EVENTS.tick、這時候按的「和她說話」都進不來 */
      Promise.resolve().then(()=>S.startTogether(GM,iv,n)).catch(e=>{ console.error('INV.autoStart 途中出錯：兩個人起身、她解凍、收掉這一段（INV-SIT-TOGETHER-1104 第 4 項）',e); S.unwind(GM,iv,n,d0==null?null:d0+1); }).finally(()=>{ autoBusy=false; if(GM.G===G){ if(GM.sceneEnd) GM.sceneEnd(); if(GM.autosave) GM.autosave(); } }); return true; }
    return false; };
  /* 開始：有座位的地點（總圖、Café、麵店、茶館、早午餐）先一起坐下——她坐著就坐她旁邊，沒坐就找兩個相鄰的空位；找不到就照舊直接開始 */
  /* o（約念書帶路，INV-SIT-TOGETHER-1104）：lv＝只找那一層；away＝離區域入口（zone.spawn）至少幾公尺（不同層不算）；lead＝兩個位子都要符合、不坐玩家坐著的位子、她坐著的位子不符合就另外找 */
  /* 同一桌（DATE-SEAT-AFAR-1105）：兩個位子都有桌號＝同一張桌子（四個位子以內的桌子整桌都算；窗邊長桌這種長的只算 1.8 m 內）；沒有桌號＝1.8 m 內。不同層不算 */
  S.tableMates=function(E,a,b){ if(!a||!b||(a.lv|0)!==(b.lv|0)) return false; const d=Math.hypot(a.x-b.x,a.z-b.z);
    if(a.table!=null&&b.table!=null){ if(String(a.table)!==String(b.table)) return false; const N=((E&&E.zone&&E.zone.seats)||[]).filter(q=>q.table!=null&&String(q.table)===String(a.table)).length; return N<=4||d<1.8; }
    return d<1.8; };
  S.pairSeats=function(GM,n,place,o){ o=o||{}; const E=GM.E; if(!seatPose(place)||!n||!E||!E.zone||!Array.isArray(E.zone.seats)) return null;
    const sp=E.zone.spawn, want=st=>(o.lv==null||(st.lv|0)===o.lv)&&(!o.away||!sp||(st.lv|0)!==(sp.lv|0)||Math.hypot(st.x-sp.x,st.z-sp.z)>=o.away);
    const near=(a,b,r)=>Math.hypot(a.x-b.x,a.z-b.z)<r;
    const together=(a,b)=>{ if(typeof a.yaw!=='number'||typeof b.yaw!=='number') return false; const fx=Math.sin(a.yaw), fz=Math.cos(a.yaw), dx=b.x-a.x, dz=b.z-a.z, c=Math.cos(a.yaw-b.yaw), along=dx*fx+dz*fz, side=dx*fz-dz*fx;
      return (c>0.95&&Math.abs(along)<0.3)||(c<-0.95&&Math.abs(side)<0.3&&along>0); };   /* 並排（朝同一邊、前後不錯開）或面對面（她看得到你）*/
    const busy=st=>st.taken||E.npcs.some(m=>m!==n&&(m.seat||m.seatTarget)&&near(m.seat||m.seatTarget,st,0.35));
    const ok=E.zone.seats.filter(st=>!st.label&&!busy(st)&&(!o.lead||want(st))), mate=(st,f)=>{ for(const r of [1.3,1.7,2.2]){ const m=ok.filter(q=>q!==st&&!q.npcOnly&&(q.lv|0)===(st.lv|0)&&near(q,st,r)&&(r<2||together(st,q))&&(!f||f(q))).sort((a,b)=>Math.hypot(a.x-st.x,a.z-st.z)-Math.hypot(b.x-st.x,b.z-st.z))[0]; if(m) return m; } return null; };   /* 先找旁邊（1.3 m 內），沒有再找對面（麵店一張桌子兩個位子面對面、相距 1.6 m；BB 10-22 01:3x：麵店裡阿哲坐著、你站在門口演完）；
       再沒有才找 2.2 m 內「並排朝同一邊」或「隔著桌子面對面」的位子（一盞的緣側兩個坐墊相距 1.8 m，BB 10-22 02:23 量的；不坐到隔壁桌）。
       你坐的那一個（mate）不用 npcOnly（玩家走不到、只給路人的位子，zones3d.js ggRoom 的 noSit：afar 卡座）：起身會站在走不出來的地方（DATE-SEAT-AFAR-1105）*/
    /* 同一桌沒有別人（DATE-SEAT-AFAR-1105，使用者 11-05 08:3x：「我跟學姊到了AFAR之後 居然坐在四人桌對面有人」）：別人坐著（或正走過去要坐）的位子、替身（taken）和這兩個位子同一桌（S.tableMates）就不選；
       整間店都沒有空桌才照原本的做法（旁邊有空位就好）。地點寫了 prefTable（afar：窗邊長桌 6）＝那一張有兩個相鄰的空位、旁邊沒人就先坐那裡 */
    const others=E.npcs.filter(m=>m!==n).map(m=>m.seat||m.seatTarget).filter(Boolean).concat(E.zone.seats.filter(q=>q.taken));
    const alone=(a,b)=>!others.some(q=>S.tableMates(E,q,a)||S.tableMates(E,q,b));
    const PS=o.lead&&E.player.seat, P=E.player.obj.position, dP=st=>Math.hypot(st.x-P.x,st.z-P.z);
    const pool=ok.filter(st=>!(PS&&near(PS,st,0.35)&&(PS.lv|0)===(st.lv|0))).sort((a,b)=>dP(a)-dP(b));
    const herOk=n.seat&&(!o.lead||want(n.seat));
    const pt=(S.place(place)||{}).prefTable, isPref=st=>pt!=null&&st.table!=null&&[].concat(pt).some(t=>String(t)===String(st.table));
    const oneT=(a,b)=>a.table==null||b.table==null||String(a.table)===String(b.table);   /* 同一張桌子（靠牆的單人小桌相距 1.8 m 也配得到：有同一桌的先選同一桌）*/
    const firstAlone=list=>{ for(const same of [true,false]) for(const st of list){ const m=mate(st,q=>alone(st,q)&&(!isPref(st)||isPref(q))&&(!same||oneT(st,q))); if(m) return {her:st,me:m}; } return null; };
    if(pt!=null&&!(herOk&&isPref(n.seat))){ const r=firstAlone(pool.filter(isPref)); if(r) return r; }   /* 指定的那一張（她已經坐在那一張＝照下面坐她旁邊）*/
    if(herOk){ const m=mate(n.seat,q=>alone(n.seat,q)); if(m) return {her:n.seat,me:m}; }   /* 她坐著、那一桌沒別人：坐她旁邊 */
    { const r=firstAlone(pool); if(r) return r; }   /* 離你最近的空桌 */
    /* 沒有空桌：照原本的（她坐著就坐她旁邊；沒坐就離你最近、旁邊有空位的）*/
    if(herOk){ const m=mate(n.seat); if(m) return {her:n.seat,me:m}; if(!o.lead) return null; }
    const cand=pool.filter(st=>!!mate(st));
    return cand[0]?{her:cand[0],me:mate(cand[0])}:null; };
  S.startTogether=async function(GM,iv,n){ const G=GM.G, E=GM.E, P=E&&E.player; iv.waitSeat=null; if(GM.setGoal&&/旁邊$/.test(G.goal||'')) GM.setGoal('—');
    if(!iv.noLead&&!iv.lead&&await S.leadStart(GM,iv,n)) return;   /* 約念書（地點有 sitAt.lead）：她帶路走到桌子、兩個人坐下才開演（INV-SIT-TOGETHER-1104）*/
    const pr=typeof MOVIES!=='undefined'&&MOVIES.useHall&&MOVIES.useHall(GM,G,iv,S.place(iv.place))?null:S.pairSeats(GM,n,iv.place); let sat=false;   /* 約看電影（MOVIE-REAL-1110）：大廳不先坐長椅，會合以後一起進 1 廳坐（S.meet、src/movies3d.js）*/
    if(pr&&GM.sitAt&&P){ if(GM.fade) await GM.fade(true);
      if(n.seat!==pr.her){ if(GM.standUp&&n.seat) GM.standUp(n); n.seatTarget=null; n.path=null; GM.sitAt(n,pr.her); }
      n.pose=n.idlePose=seatPose(iv.place); n.frozen=true; n.beh='idle';
      if(P.seat&&GM.standUp) GM.standUp(P); GM.sitAt(P,pr.me); sat=true; if(GM.fade) await GM.fade(false); }
    await S.meet(GM,iv,n,sat?{sat:true}:undefined);
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
    const said=F.walkSaid||{};   /* {one:'鍵'}＝只說一次的句子（AA_118 第 0 節「同一句只出現一次」；AA_555 第 4 節）：說過記在 G.flags.walkSaid[鍵]＝那一天；同一個鍵的幾個版本（有沒有某個記憶）算同一句。舊存檔沒有＝都還沒說過 */
    const L=oneW(w[pid]).concat(oneW(w.any)).map(norm).filter(e=>e&&e.l&&(!e.if||e.if(G,c))&&!(e.once&&F[e.once])&&!(e.one&&said[e.one])); if(!L.length) return null;
    const N=F.walkChatN||(F.walkChatN={}), n=N[id]|0, e=L[n%L.length]; return {lines:e.l,ask:e.ch?e.once:null,next(){ N[id]=n+1; if(e.one) (F.walkSaid||(F.walkSaid={}))[e.one]=G.day; }}; };
  S.walkEntry=function(id,key){ const w=((D().people||{})[id]||{}).walk||{}; for(const k of Object.keys(w)) for(const e of oneW(w[k])) if(e&&!Array.isArray(e)&&typeof e==='object'&&e.once===key) return e; return null; };
  /* 見面開始前（S.meet 一開始）：路上抽到的選項句——她先說、你選、她回（芷若：三個都會聽到她的答案）*/
  /* 約好的這一次（路上的選項、升級句的小選擇、一起活動的中途選項）她的戀愛合計最多 +2（FX-LOVE-CAP-1110）；看電影＝和那部片的 talk／with 算同一次（MOVIES.capOf）*/
  S.fxCap=(G,iv)=>(typeof MOVIES!=='undefined'&&MOVIES.capOf&&iv&&iv.place===MOVIES.ZL&&iv.film&&MOVIES.capOf(G,iv.who,iv.film))||{cap:'meet:'+(iv&&iv.id!=null?iv.id:G.day)};
  S.walkAsk=async function(GM,iv,who){ const G=GM.G, F=G.flags||(G.flags={}), key=iv.ask; iv.ask=null; const e=key?S.walkEntry(iv.who,key):null; if(!e||F[key]) return false; F[key]=true;
    await S.playLines(GM,who,e.l); const k=await GM.choose(e.ch.map(c=>({t:c.t}))); const c=e.ch[k]||e.ch[0]; if(c.r||c.re!=null) await S.playLines(GM,who,c.r||[].concat(c.re));
    if(c.fx&&typeof SOCIAL!=='undefined'&&SOCIAL.applyFx) SOCIAL.applyFx(G,iv.who,c.fx,S.fxCap(G,iv));   /* 邀約見面路上的選項 {t, r|re, fx}（DLG-FX-MECH-1110；fx＝{fr, love}，沒有＝照舊不加）*/
    if(c.mem&&typeof SOCIAL!=='undefined'&&SOCIAL.remember) SOCIAL.remember(iv.who,c.mem,'');   /* 子晴「說換方向的事」→ TOLD_HER_CHANGE（前置鏈第 5 環）*/
    const af=e.after&&e.after.length&&typeof e.after[0]==='object'&&!Array.isArray(e.after[0])?((e.after.find(v=>!v.if||v.if(G))||{}).l||[]):e.after;   /* 好幾個版本取第一個成立的（沛珊：大一上問讀書會、大一下起問課輔班）*/
    if(af&&af.length) await S.playLines(GM,who,af); return true; };
  S.walkChat=function(GM,dt){ const G=GM.G; if(!G||!Array.isArray(G.invites)) return; for(const iv of G.invites){ if(iv.state!=='going'||iv.chat) continue;
      walkT[iv.id]=(walkT[iv.id]||0)+(dt||0); if(walkT[iv.id]<6) continue;
      const n=S.npcOf(GM,iv.who), P=GM.E&&GM.E.player&&GM.E.player.obj; if(!n||!n.obj||!P) continue;
      if(Math.hypot(n.obj.position.x-P.position.x,n.obj.position.z-P.position.z)>6) continue;
      iv.chat=true; const pk=S.walkPick(G,iv.who,iv.place); if(!pk) continue; pk.next(); if(pk.ask){ iv.ask=pk.ask; continue; } const nm=nameOf(iv.who);
      pk.lines.forEach((t,k)=>{ const show=()=>GM.caption(S.narrLine(t)?'':nm,t,3400); if(k===0) show(); else S._later(show,k*3600); }); } };
  /* 走進一個區域：一起走過去的人到了目的地 → 見面 */
  S.arrive=async function(GM,zoneId){ const G=GM.G; for(const iv of (G.invites||[])){ if(iv.state==='going'&&iv.zone!==zoneId&&S.privateZone(zoneId)) S.dropGoing(GM,iv); }   /* 走回宿舍＝作罷（使用者 10-21 23:1x）*/
    const iv=(G.invites||[]).find(v=>v.state==='going'&&v.zone===zoneId); if(!iv) return false; if(arrivingIv.has(iv)) return true;
    const d0=GM.sceneDepth?GM.sceneDepth():null; arrivingIv.add(iv); if(GM.sceneBegin) GM.sceneBegin();   /* 走進門那一刻就鎖住（BUG-AN-NOODLE-STUCK-1027，見 S.autoStart 上面）：這 0.9 秒裡按不到「和她說話」、別的事件不會插進來、換區域的自動存檔不會存成 going */
    try{ await GM.sleep(900);
      while(GM.G===G&&GM.D&&((GM.D.busyDepth|0)>1||GM.D.active)) await GM.sleep(200);   /* 鎖住以前已經開始的那一段（淡入的時候先按了「和她說話」）先演完再見面，兩段不一起演 */
      if(GM.G===G&&iv.state==='going'){ const n=S.npcOf(GM,iv.who); iv.state='accepted'; iv.h=+((G.hour%24)).toFixed(3);   /* 約定時間改成到的時候（路上花的時間不算遲到）*/
        try{ await S.startTogether(GM,iv,n); } catch(e){ console.error('INV.arrive 途中出錯：兩個人起身、她解凍、收掉這一段',e); S.unwind(GM,iv,n,d0==null?null:d0+1); } } }   /* 兩個人都到了＝直接開始，有座位的地方一起坐下（使用者 10-21 23:2x；原本她先去找位子、你坐到她旁邊或跟她說話才開始：S.seatFirst 留給舊的流程）*/
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
  S.seatMeet=async function(GM,seat){ const G=GM.G; if(!seat) return false;
    for(const iv of (G.invites||[])){ const L=iv.lead; if(!S.leadOn(G,iv)||L.ph!=='wait'||!L.her||autoBusy||(seat.lv|0)!==(L.her.lv|0)||Math.hypot(seat.x-L.her.x,seat.z-L.her.z)>2.3) continue;   /* 約念書：她坐著等，你坐到她旁邊＝開演 */
      const n=S.npcOf(GM,iv.who); if(!n||!n.seat) continue; autoBusy=true; const d0=GM.sceneDepth?GM.sceneDepth():null;
      try{ await S.leadScene(GM,iv,n); } catch(e){ console.error('INV.seatMeet 約念書途中出錯',e); S.unwind(GM,iv,n,d0); } finally { autoBusy=false; } return true; }
    for(const iv of (G.invites||[])){ if(iv.state!=='accepted'||iv.day!==G.day||!iv.waitSeat||(iv.waitSeat.lv|0)!==(seat.lv|0)) continue;
      if(Math.hypot(iv.waitSeat.x-seat.x,iv.waitSeat.z-seat.z)>1.8) continue; const n=S.npcOf(GM,iv.who); if(!n) continue; iv.waitSeat=null; await S.meet(GM,iv,n); return true; } return false; };
  /* ===== 約念書：走到桌子、兩個人坐下才開演（INV-SIT-TOGETHER-1104，USER_WANTS X207；台詞 AA_649）=====
     使用者 2026-11-04：「不可以一直走到圖書館門口然後約會就結束了，至少要走到桌子旁邊一起坐下來。」原本 S.startTogether 只在抵達的那一區找相鄰空位（pairSeats），總圖一進大廳就開演＝在門口演完。
     地點寫 sitAt（src/data/invites.js；現在只有總圖 library：{lead, lv:1, away:3, alt:'library'}）：
       1. 兩個人都到了（S.arrive、S.autoStart、當場約 S.flow → S.startTogether）→ S.leadStart：門口先演開場（S.meetOpen，含可昕第一次到總圖那一句），她說「（小聲）二樓靠窗那排比較安靜。」，
          找二樓（lv 1）相鄰的兩個空位（S.pairSeats o.lead，離入口 ≥3 m），她自己走過去坐下（GM.walkTo：卡住 4 秒會放到目的地，不會永遠走不到）——iv.lead={ph:'go', z, her, me}
       2. 走到了：位子被別人坐走＝換下一組（S.leadRepick）；坐下＝ph 'wait'，目標「坐到她旁邊」
       3. 玩家走到她的位子 2 m 內（同一層）或坐到她旁邊（座位選單 S.seatMeet）＝開演（S.leadScene）：淡出、你坐她旁邊的位子、淡入 → S.meet（o.lib）：
          坐下的旁白＋她一句 → 原本的見面內容 → 時間快轉一半、中途一則、再快轉一半（S.libStay，照地點的 stay，閉館前十分鐘收）→ 收書 → 兩個人起身走到入口 → 道別（S.libEnd）→ 她回自己的作息（S.release）
       4. 二樓整層沒有兩個相鄰的空位：她先走上二樓（ph 'look'），你走到她旁邊 4 m 內＝「（二樓的長桌都坐滿了。）」「（小聲）去三樓好了。」（S.leadFull）→ 變成一起走（going，iv.zone='library'、iv.alt）：
          你從二樓東側樓梯間上三樓、她跟著；到了三樓閱覽區照 1～3（不限樓層）。三樓也沒位子＝照舊的開演（iv.noLead）
     不跟上：走出那一區、她帶路超過 2 小時還沒坐下、閉館＝作罷（不扣分、訊息一則，S.leadDrop）；帶路中不算沒赴約。
     存檔：iv.lead＝{ph:'go'|'look'|'wait'|'full', z:區域, her:{x,z,lv,yaw}, me:{x,z,lv,yaw}, look:{x,z,lv}}、iv.opened、iv.faDone、iv.alt、iv.noLead、iv.early（舊存檔沒有＝照舊）；
       G.flags.libStudy1＝{人物 id: 第一次約念書那天}（第一次用 AA_649 第 3 節她自己那兩句）。讀檔回來在帶路途中：她生在你旁邊（S.entryFor act follow），S.leadTick 接著帶路（n._ivLead 不存檔）。
     鎖：開演那一刻 sceneBegin（同 S.autoStart，autoBusy；讀檔 LOADLOCKS 'invites3d:autoBusy' 放開）。測試：node tests/inv_sit_together_unit.js */
  const seatKey=st=>st?{x:+(+st.x).toFixed(3),z:+(+st.z).toFixed(3),lv:st.lv|0,yaw:+(+(st.yaw||0)).toFixed(4)}:null;
  S.seatObj=function(E,k){ if(!k||!E||!E.zone||!Array.isArray(E.zone.seats)) return null; return E.zone.seats.find(s=>(s.lv|0)===(k.lv|0)&&Math.abs(s.x-k.x)<0.05&&Math.abs(s.z-k.z)<0.05)||null; };
  S.leadOn=(G,iv)=>!!(G&&iv&&iv.lead&&iv.state==='accepted'&&iv.day===G.day);
  S.leading=G=>!!(G&&Array.isArray(G.invites)&&G.invites.some(iv=>S.leadOn(G,iv)));
  /* 這一區要不要帶路：地點的區域（照 sitAt.lv 找那一層）、或二樓坐滿改去的備用區域（iv.alt）；自己有一場的（iv.ev、期末飯 iv.te）照舊 */
  S.sitRule=function(G,iv){ const P=S.place(iv.place)||{}, SA=P.sitAt; if(!SA||!SA.lead||iv.ev||iv.te) return null; if(G.zone===P.zone) return {lv:SA.lv,away:SA.away}; if(SA.alt&&G.zone===SA.alt&&iv.alt) return {away:SA.away}; return null; };
  S.leadSeats=(GM,n,iv,rule)=>rule?S.pairSeats(GM,n,iv.place,{lv:rule.lv,away:rule.away,lead:true}):null;
  S.seatBusy=function(GM,st,n,forMe){ const E=GM.E, P=E.player, near=(q)=>q&&(q.lv|0)===(st.lv|0)&&Math.hypot(q.x-st.x,q.z-st.z)<0.35; if(st.taken) return true; if(!forMe&&P&&near(P.seat)) return true; return (E.npcs||[]).some(m=>m!==n&&near(m.seat||m.seatTarget)); };
  const whoOf=(GM,iv,n)=>({name:nameOf(iv.who),obj:n&&n.obj,charId:iv.who});
  S.leadStart=async function(GM,iv,n){ const G=GM.G, E=GM.E, rule=S.sitRule(G,iv); if(!rule||!n||!n.obj||!E||!E.zone||!Array.isArray(E.zone.seats)||!E.player) return false;
    if(rule.lv!=null&&!E.zone.seats.some(s=>(s.lv|0)===rule.lv&&!s.label)) return false;   /* 這一區沒有那一層的桌子（舊配置、測試的假區域）：照舊 */
    const P=S.place(iv.place)||{}, SA=P.sitAt||{}, who=whoOf(GM,iv,n), pr=S.leadSeats(GM,n,iv,rule), pp=E.player.obj.position;
    iv.h=+((G.hour%24)).toFixed(3);   /* 帶路的時間不算遲到 */
    const inLobby=G.zone===P.zone&&rule.lv!=null&&(E.player.lv|0)!==rule.lv&&!(pr&&n.seat===pr.her);
    if(!iv.opened) await S.meetOpen(GM,iv,who,{fa:true});   /* 門口會合：照現在的開場（AA_649 第 1 節 1）*/
    if(inLobby) await S.playLines(GM,who,LS().lead);   /* 大廳：她帶路（AA_649 第 1 節 2）*/
    if(pr){ iv.lead={ph:'go',z:G.zone,her:seatKey(pr.her),me:seatKey(pr.me)};
      if(n.seat===pr.her){ iv.lead.ph='wait'; n._ivLead=iv.id; n.frozen=true; const h2=pr.her; if((E.player.lv|0)===(h2.lv|0)&&Math.hypot(pp.x-h2.x,pp.z-h2.z)<2.5){ await S.leadScene(GM,iv,n); return true; } if(GM.setGoal) GM.setGoal('坐到'+nameOf(iv.who)+'旁邊'); return true; }   /* 她本來就坐在桌邊（在二樓當面約「現在」）：你就在旁邊＝直接坐下開演 */
      S.leadWalk(GM,iv,n); if(GM.setGoal) GM.setGoal('跟'+nameOf(iv.who)+'走到座位'); return true; }
    if(SA.alt&&G.zone===P.zone){ const look=S.lookSpot(GM,rule); iv.lead={ph:look?'look':'full',z:G.zone,look}; if(look){ S.leadWalk(GM,iv,n); if(GM.setGoal) GM.setGoal('跟'+nameOf(iv.who)+'走到座位'); } else await S.leadFull(GM,iv,n); return true; }   /* 二樓整層坐滿 */
    iv.noLead=1; return false; };   /* 三樓也沒有兩個相鄰的空位：照舊（站著演，不卡住）*/
  /* 二樓坐滿時她先走去看的位置：那一層離你最近的座位的走近點 */
  S.lookSpot=function(GM,rule){ const E=GM.E, pp=E.player.obj.position; const L=E.zone.seats.filter(s=>(rule.lv==null||(s.lv|0)===rule.lv)&&!s.label).sort((a,b)=>Math.hypot(a.x-pp.x,a.z-pp.z)-Math.hypot(b.x-pp.x,b.z-pp.z)); const st=L[0]; if(!st) return null; const ap=(GM.seatApproach&&GM.seatApproach(st))||[st.x,st.z]; return {x:+(+ap[0]).toFixed(3),z:+(+ap[1]).toFixed(3),lv:st.lv|0}; };
  S.leadWalk=function(GM,iv,n){ const G=GM.G, E=GM.E, L=iv.lead; if(!L||!n||!n.obj||!E) return false; if(L.ph==='wait') L.ph='go';
    let tx, tz, lv; if(L.ph==='go'){ const st=S.seatObj(E,L.her); if(!st) return S.leadRepick(GM,iv,n); const ap=(GM.seatApproach&&GM.seatApproach(st))||[st.x,st.z]; tx=ap[0]; tz=ap[1]; lv=st.lv|0; }
    else if(L.ph==='look'&&L.look){ tx=L.look.x; tz=L.look.z; lv=L.look.lv|0; } else return false;
    if(n.seat&&GM.standUp) GM.standUp(n); n._ivLead=iv.id; n.beh='idle'; n.frozen=false; n.path=null; n.seatTarget=L.ph==='go'?S.seatObj(E,L.her):null;
    const gen=GM.loadGen, done=()=>{ if(GM.G!==G||GM.loadGen!==gen||iv.lead!==L||n._ivLead!==iv.id) return; if(L.z&&G.zone!==L.z){ if(iv.state==='accepted') S.leadDrop(GM,iv); return; } S.leadReached(GM,iv,n); };   /* BB_379 STUDY_fix_c_r3 leave（11-14）：玩家走出總圖、換區域的時候她那一段路剛好走完（NPC 拆掉＝walkTo 放到目的地）→ 原本接著 leadReached 在新區域找不到椅子 → leadRepick 把 iv.lead 清掉 → 下一格記成沒赴約。換了區域＝照走出那一區作罷 */
    if(GM.walkTo) Promise.resolve(GM.walkTo(n,tx,tz,{lv})).then(done,e=>console.warn('INV.leadWalk',e));   /* GM.walkTo：走不到或卡住 4 秒（遊戲時間）＝放到目的地，一定會到 */
    else if(!(E.moveTo&&E.moveTo(n,tx,tz,done,lv))){ if(E.placeAt) E.placeAt(n,tx,tz,lv); done(); }
    return true; };
  S.leadReached=function(GM,iv,n){ const G=GM.G, E=GM.E, L=iv.lead; if(!L) return;
    if(L.ph==='go'){ const st=S.seatObj(E,L.her), me=S.seatObj(E,L.me); n.seatTarget=null;
      if(!st||!me||S.seatBusy(GM,st,n)||S.seatBusy(GM,me,n,true)){ S.leadRepick(GM,iv,n); return; }   /* 走到了才發現被坐走：換下一組 */
      if(GM.sitAt) GM.sitAt(n,st); n.pose=n.idlePose=seatPose(iv.place)||'read'; n.frozen=true; n.beh='idle'; L.ph='wait'; if(GM.setGoal) GM.setGoal('坐到'+nameOf(iv.who)+'旁邊'); return; }
    if(L.ph==='look'){ const pr=S.leadSeats(GM,n,iv,S.sitRule(G,iv)); if(pr){ L.ph='go'; L.her=seatKey(pr.her); L.me=seatKey(pr.me); L.look=null; S.leadWalk(GM,iv,n); return; } L.ph='full'; n.pose=n.idlePose='idle'; } };
  S.leadRepick=function(GM,iv,n){ const G=GM.G, L=iv.lead, P=S.place(iv.place)||{}, SA=P.sitAt||{}; if(L&&L.z&&G.zone!==L.z){ if(iv.state==='accepted') S.leadDrop(GM,iv); return false; }   /* 同上：不在帶路的那一區＝作罷，不清成 noLead（清掉＝下一格記成沒赴約）*/ const pr=S.leadSeats(GM,n,iv,S.sitRule(G,iv));
    if(pr){ L.ph='go'; L.her=seatKey(pr.her); L.me=seatKey(pr.me); return S.leadWalk(GM,iv,n); }
    if(SA.alt&&G.zone===P.zone){ L.ph='full'; L.her=L.me=null; n.seatTarget=null; return true; }   /* 這一層都沒有了：去三樓 */
    iv.lead=null; iv.noLead=1; n._ivLead=null; n.seatTarget=null; return false; };   /* 三樓也沒有：照舊開演（S.autoStart 接手）*/
  S.openNow=G=>typeof PLACES==='undefined'||!PLACES.isOpen||PLACES.isOpen(G.zone,G.hour%24,G.day);
  S.leadDrop=function(GM,iv){ const G=GM.G; iv.lead=null; iv.state='cancelled'; const t='和'+nameOf(iv.who)+'一起去'+((S.place(iv.place)||{}).name||'')+'的事，後來作罷了。'; S.msg(G,iv.who,t,iv); if(GM.toast) GM.toast(t,4200); if(GM.phoneBadge) GM.phoneBadge();   /* 看得到（CC 11-04 疑點 2：原本只寫 G.msgs）*/
    const n=S.npcOf(GM,iv.who); if(n&&n._ivLead===iv.id){ n._ivLead=null; n.seatTarget=null; S.release(GM,n,iv); } if(GM.setGoal&&/旁邊$|座位$/.test(G.goal||'')) GM.setGoal('—'); };
  S.leadTick=function(GM){ const G=GM&&GM.G, E=GM&&GM.E; if(!G||!Array.isArray(G.invites)||!E||!E.player) return false; const h=G.hour%24;
    for(const iv of G.invites){ if(!iv.lead||iv.state!=='accepted') continue; const L=iv.lead;
      if(iv.day!==G.day||G.zone!==L.z||h>=iv.h+2||!S.openNow(G)){ S.leadDrop(GM,iv); continue; }   /* 走出那一區、兩小時還沒坐下、閉館＝作罷（不扣分）*/
      if(autoBusy||!S.sceneFree(GM)) continue; const n=S.npcOf(GM,iv.who); if(!n||!n.obj) continue;
      const her=L.her&&S.seatObj(E,L.her), sat=!!(her&&n.seat&&Math.abs(n.seat.x-her.x)<0.05&&Math.abs(n.seat.z-her.z)<0.05);
      if(n._ivLead!==iv.id&&!sat&&L.ph!=='full'){ S.leadWalk(GM,iv,n); continue; }   /* 讀檔回來（她跟在你旁邊生出來）：接著帶路 */
      const pp=E.player.obj.position, plv=E.player.lv|0;
      if(L.ph==='wait'&&!sat&&n._ivLead===iv.id){ const o=n.obj.position, nearHer=plv===(n.lv|0)&&Math.hypot(pp.x-o.x,pp.z-o.z)<2.0, nearSeat=!!her&&plv===(her.lv|0)&&Math.hypot(pp.x-her.x,pp.z-her.z)<2.0;   /* 她在等你、可是不在那個位子上（被作息拉起來、座位差一點；BB-B 11-07 AA_717 探針、第 538 天）：原本兩邊都不動、兩小時後作罷 */
        if(nearHer||nearSeat){ S.leadGo(GM,iv,n,'scene'); return true; }   /* 你走到她本人或那個位子旁邊＝照樣開演（leadScene 讓她坐回去）*/
        if(!n.path&&(L.rw|0)<2){ L.rw=(L.rw|0)+1; S.leadWalk(GM,iv,n); continue; } }   /* 你離得遠、她沒在走：走回那個位子（最多兩次，不會一直來回）*/
      if(L.ph==='wait'&&sat){ const PS=E.player.seat; if((plv===(her.lv|0)&&Math.hypot(pp.x-her.x,pp.z-her.z)<2.0)||(PS&&(PS.lv|0)===(her.lv|0)&&Math.hypot(PS.x-her.x,PS.z-her.z)<2.3)){ S.leadGo(GM,iv,n,'scene'); return true; } }   /* 走到她旁邊、或坐到她旁邊＝開演 */
      if(L.ph==='full'){ const o=n.obj.position; if(plv===(n.lv|0)&&Math.hypot(pp.x-o.x,pp.z-o.z)<4){ S.leadGo(GM,iv,n,'full'); return true; } } }
    return false; };
  S.leadGo=function(GM,iv,n,kind){ const G=GM.G, d0=GM.sceneDepth?GM.sceneDepth():null; autoBusy=true; if(GM.sceneBegin) GM.sceneBegin();
    return Promise.resolve().then(()=>kind==='full'?S.leadFull(GM,iv,n):S.leadScene(GM,iv,n)).catch(e=>{ console.error('INV.lead 途中出錯：兩個人起身、她解凍、收掉這一段（INV-SIT-TOGETHER-1104）',e); S.unwind(GM,iv,n,d0==null?null:d0+1); })
      .finally(()=>{ autoBusy=false; if(GM.G===G){ if(GM.sceneEnd) GM.sceneEnd(); if(GM.autosave) GM.autosave(); } }); };
  /* 二樓坐滿：她說那兩句，改成一起走去三樓閱覽區（你帶、她跟著；到了 S.arrive → 照帶路找位子）*/
  S.leadFull=async function(GM,iv,n){ const G=GM.G, SA=(S.place(iv.place)||{}).sitAt||{}; await S.playLines(GM,whoOf(GM,iv,n),LS().full);
    iv.lead=null; iv.state='going'; iv.zone=SA.alt; iv.alt=1; iv.chat=true; iv.h=+((G.hour%24)).toFixed(3);
    if(n){ n._ivLead=null; n.seatTarget=null; n.path=null; n.frozen=false; n.beh='follow'; n.followOff=1.1; }
    if(GM.setGoal) GM.setGoal('去三樓閱覽區（二樓東側的樓梯間）'); };
  /* 開演：她坐好、你坐她旁邊（已經坐在旁邊就不動），接著見面（o.lib）*/
  S.leadScene=async function(GM,iv,n){ const G=GM.G, E=GM.E, P=E.player, L=iv.lead; if(!L) return false; const her=S.seatObj(E,L.her), me=S.seatObj(E,L.me);
    if(GM.fade) await GM.fade(true);
    try{ if(her&&n.seat!==her){ if(n.seat&&GM.standUp) GM.standUp(n); n.path=null; n.seatTarget=null; if(GM.sitAt) GM.sitAt(n,her); }
      n.pose=n.idlePose=seatPose(iv.place)||'read'; n.frozen=true; n.beh='idle';
      const mine=!!(P.seat&&her&&P.seat!==her&&(P.seat.lv|0)===(her.lv|0)&&Math.hypot(P.seat.x-her.x,P.seat.z-her.z)<2.3);
      if(!mine&&me&&GM.sitAt){ if(P.seat&&GM.standUp) GM.standUp(P); GM.sitAt(P,me); } }
    finally { if(GM.fade) await GM.fade(false); }
    if(GM.setGoal&&/旁邊$|座位$/.test(G.goal||'')) GM.setGoal('—');
    L.ph='sit'; try{ await S.meet(GM,iv,n,{lib:true}); } finally { iv.lead=null; if(n) n._ivLead=null; }
    return true; };
  /* 第一次和她約念書：AA_649 第 3 節她自己那兩句（沒有列的人、第二次以後＝第 2 節隨機）*/
  S.libFirst=function(G,id){ const T=(LS().first||{})[id]; const F=G.flags||(G.flags={}), M=F.libStudy1||(F.libStudy1={}); if(!T||M[id]!=null) return null; M[id]=G.day; return T; };
  /* 一起讀的時間：照地點的 stay（閉館前十分鐘收），過到一半出一則（AA_649 第 1 節 5）；讀書照算（G.stats.study、STORY.onStudy，和自己坐下讀書一樣算小時）*/
  S.libStay=async function(GM,iv,who,P,SN,ARC,RT){ const G=GM.G, h0=G.hour%24, HR=typeof PLACES!=='undefined'&&PLACES.hours?PLACES.hours[G.zone]:null, cl=HR&&typeof HR.close==='number'?HR.close:null;
    let st=P.stay||1; if(cl!=null&&h0+st>cl-1/6) st=Math.max(0.25,cl-1/6-h0); iv.closing=cl!=null&&h0+st>=cl-1/6-1e-6;
    await GM.fade(true); GM.advance(st/2); await GM.fade(false);
    if(ARC) await ARCS.run(GM,who,iv.who,ARC); else if(RT) await ARCS.rotRun(GM,who,iv.who,RT); else if(SN){ await STUDYN.mid(GM,who,iv.who,SN,S.fxCap(G,iv)); if(SN.rot!=null&&typeof ARCS!=='undefined'&&ARCS.rotDone) ARCS.rotDone(G,iv.who,null); } else { const m=pick(LS().mid); if(m) await S.playLines(GM,who,m); }   /* 故事線那一拍（AA_712）＞第 N 場的中途那件事（AA_707）＞她最近的事（AA_717）＞活動的輪換句＞一般句 */
    await GM.fade(true); GM.advance(st/2); await GM.fade(false);
    if(G.stats) G.stats.study=(G.stats.study|0)+Math.max(1,Math.round(st));
    if(typeof STORY!=='undefined'&&STORY.onStudy){ try{ STORY.onStudy(GM,st); }catch(e){ console.warn('STORY.onStudy',e); } } };
  /* 收書 → 起身、一起走到入口 → 道別（大廳一樓照平常說話；三樓閱覽區在樓梯間門口，照小聲講）*/
  S.libEnd=async function(GM,iv,n,who,first,SN){ const L=LS(); if(iv.closing||!SN||!SN.pack) await S.playLines(GM,who,iv.closing?L.close:L.pack); if(SN&&SN.pack) await STUDYN.play(GM,who,SN.pack); delete iv.closing;   /* 閉館廣播照舊先播；第 N 場的收書句接在後面 */
    await S.leadOut(GM,iv,n); if(SN&&SN.bye) await STUDYN.play(GM,who,SN.bye); else await GM.say(who,first&&first.bye||pick(L.bye)); };
  /* 走到入口的兩個點（LEADOUT-WALL-1111，BB v9.10.25「這版沒做完」第 5 項：木曜日的出生點在一樓窄樓梯上，左右各 0.55 m 兩個點都在牆裡，走不到、靠 walkTo 的 4 秒保險放過去）：
     照舊是出生點左右各 0.55 m（你在左、她在右）——兩個點都站得住、從兩個人起身的地方（from：[{x,z,lv}…]）找得到路，就照舊（大多數的區域不變）；
     不行才在出生點附近找：左右 0.55／0.45／0.35／0 m × 沿出生點的方向前後（先往入口那一邊）每 0.2 m 到 2 m，近的先；兩個點相距至少 0.7 m（並排，或窄的地方前後站）。
     都找不到＝null（照舊那兩個點，walkTo 的保險還在）。tests/leadout_spots_1111_unit.js */
  S.leadOutSpots=function(E,from){ const sp=E&&E.zone&&E.zone.spawn; if(!sp||!E.canStand) return null; const lv=sp.lv|0, y=sp.yaw||0, px=Math.cos(y), pz=-Math.sin(y), fx=Math.sin(y), fz=Math.cos(y), R=0.32;
    const at=(s,f)=>({s,f,x:sp.x+px*s+fx*f,z:sp.z+pz*s+fz*f});   /* 不四捨五入：照舊的兩個點要和原本一模一樣 */
    const reach=p=>(from||[]).every(q=>{ if(!q||!E.pathTo) return true; const r=E.pathTo(q.x,q.z,q.lv|0,p.x,p.z,lv); return !!(r&&r.length); });
    const ok=p=>E.canStand(p.x,p.z,R,lv)&&reach(p);
    const a=at(-0.55,0), b=at(0.55,0); if(ok(a)&&ok(b)) return [a,b];
    const F=[0]; for(let k=1;k<=10;k++) F.push(-k*0.2,k*0.2); const SS=[-0.55,0.55,-0.45,0.45,-0.35,0.35,0], C=[];
    for(const f of F) for(const s of SS){ const p=at(s,f); if(!E.canStand(p.x,p.z,R,lv)) continue; const q=C.find(c=>Math.hypot(c.x-p.x,c.z-p.z)>=0.7); if(!reach(p)) continue;
      if(q) return q.s<p.s||(q.s===p.s&&q.f>=p.f)?[q,p]:[p,q]; C.push(p); }
    return null; };
  S.leadOut=async function(GM,iv,n){ const E=GM.E, P=E.player, sp=E.zone&&E.zone.spawn; if(P.seat&&GM.standUp) GM.standUp(P); if(n){ if(n.seat&&GM.standUp) GM.standUp(n); n.frozen=false; n.beh='idle'; n.seatTarget=null; n.path=null; }
    if(!sp||!GM.walkTo) return; const adv=typeof ADV!=='undefined'&&ADV.active; if(adv&&ADV.end) ADV.end(); if(E.endCinematic) E.endCinematic();
    const lv=sp.lv|0, y=sp.yaw||0, dx=Math.cos(y)*0.55, dz=-Math.sin(y)*0.55, pos=e=>e&&e.obj?{x:e.obj.position.x,z:e.obj.position.z,lv:e.lv|0}:null;
    const pr=S.leadOutSpots(E,[pos(P),n&&n.obj?pos(n):null]), A=pr?pr[0]:{x:sp.x-dx,z:sp.z-dz}, B=pr?pr[1]:{x:sp.x+dx,z:sp.z+dz};
    try{ await Promise.all([GM.walkTo(P,A.x,A.z,{lv}),n&&n.obj?GM.walkTo(n,B.x,B.z,{lv}):null]); }
    finally { if(adv&&ADV.begin) ADV.begin({background:'blur',right:iv.who}); }
    if(GM.face&&n&&n.obj){ GM.face(n,P.obj.position.x,P.obj.position.z); GM.face(P,n.obj.position.x,n.obj.position.z); } };
  /* 其他約會兩個人一起坐下的開場句（AA_649 第 4 節）：店自己有見面內容的（scene、ownMeal）不加 */
  /* 開場句要對得上坐的位子（DATE-SEAT-AFAR-1105：坐在中間的四人桌，學姊說「……這個燈好可愛。」——燈在窗邊長桌）：那一則寫了 onlyAt（invites.js：Object.assign([台詞],{onlyAt:{table:6}})）＝只在你坐的位子符合時抽（onlyAt.table＝桌號，一個或幾個）；
     其他的照舊每次隨機一則。都不符合就不說 */
  S.seatAtOk=function(at,seat){ if(!at) return true; if(!seat) return false; if(at.table!=null&&!(seat.table!=null&&[].concat(at.table).some(t=>String(t)===String(seat.table)))) return false; return true; };
  S.MOVIE_DIM='（燈暗下來，電影開始了。）';   /* AA-B 11-07 10:02（BB_132 第 116 組）*/
  S.seatOpenLines=async function(GM,iv,who,P){ const SO=D().seatOpen; if(!SO||!P||P.scene||P.ownMeal) return false; const k=(SO.byPlace||{})[P.id]; const ps=GM&&GM.E&&GM.E.player&&GM.E.player.seat;
    const L=k&&Array.isArray(SO[k])&&pick(SO[k].filter(e=>S.seatAtOk(e&&Object.prototype.hasOwnProperty.call(e,'onlyAt')?e.onlyAt:null,ps))); if(!L) return false; await S.playLines(GM,who,L); return true; };
  /* 見面演完：她解凍、起身，回到自己的作息（CC 11-04 讀程式抓到：S.meet 演完她一直 frozen）。作息本來就在這裡坐著的（她本來在這裡讀書、吃飯）照舊坐著 */
  S.release=function(GM,n,iv){ if(!n) return; n.path=null; n.beh='idle'; n._ivLead=null; n.seatTarget=null; let keep=false;
    try{ const G=GM.G, w=typeof STORY!=='undefined'&&STORY.whereIs&&iv?STORY.whereIs(GM,iv.who):null; keep=!!(n.seat&&w&&w.zone===G.zone&&['read','eat','sit','class'].includes(w.act)&&!(G.invites||[]).some(q=>q.who===iv.who&&(q.state==='accepted'||q.state==='going')&&q.day===G.day)); }catch(e){ keep=false; }
    if(keep) return; if(n.seat&&GM.standUp) GM.standUp(n); n.frozen=false; if(n.pose==='sit'||n.pose==='read'||n.pose==='eat') n.pose='idle'; n.idlePose='idle'; };
  /* 開演途中出錯（S.autoStart、S.arrive、S.leadGo、S.seatMeet）：兩個人站起來、她解凍、這一次開的段落收掉（回到開始前＋外層那一段），不吞錯誤（console.error）；這一筆約不再自己重來 */
  S.unwind=function(GM,iv,n,depth){ const E=GM.E, P=E&&E.player; try{ if(P&&P.seat&&GM.standUp) GM.standUp(P); }catch(e){ console.warn('INV.unwind',e); }
    if(n){ try{ if(n.seat&&GM.standUp) GM.standUp(n); }catch(e){ console.warn('INV.unwind',e); } n.frozen=false; n.beh='idle'; n.path=null; n.seatTarget=null; n._ivLead=null; n.pose=n.idlePose='idle'; }
    if(iv){ iv.lead=null; if(iv.state==='accepted'||iv.state==='going'||(iv.state==='done'&&iv.mid)){ iv.state='cancelled'; iv.err=1; } delete iv.mid; }   /* 見面演到一半出錯（iv.mid）也算作罷 */
    if(depth!=null&&GM.sceneDepth&&GM.sceneEnd){ let k=0; while(GM.sceneDepth()>depth&&k++<64) GM.sceneEnd(); }
    if(GM.fade) Promise.resolve().then(()=>GM.fade(false)).catch(()=>{}); };
  /* 手機的回呼要不要再打開手機（game3d.js：手機約人、改天之後）：剛演完見面（30 秒內）、她正在帶路、一起走過去的途中＝不打開（手機打開遊戲會停，玩家以為卡住）*/
  S.phoneBack=function(G){ if(lastMeetEnd!=null&&S._now()-lastMeetEnd<30000) return false; if(!G||!Array.isArray(G.invites)) return true; const h=G.hour%24;
    return !G.invites.some(iv=>iv.day===G.day&&(iv.state==='going'||S.leadOn(G,iv)||(iv.state==='accepted'&&h>=iv.h-0.5&&h<iv.h+1))); };   /* 約好的見面前 30 分鐘到開始後 1 小時：手機不自己打開（BB-B 11-07 AA_717 第 2 次見面：約完收起手機、走到她旁邊，手機又自己打開＝遊戲暫停、時間停在 12:01、那一場一直不開始，玩家會以為卡住）。訊息照樣留著，見面完再看 */
  /* ---------- 對方約你、臨時改約（給事件用；內容由 AA、BB 寫，使用者批准後才放）---------- */
  S.offer=function(G,who,pid,day,h,text,at){ S.rec(G); const P=S.place(pid); if(!P) return null; if(S.cool(G,who)) return null; if(typeof V6EX!=='undefined'&&V6EX.noContact&&V6EX.noContact(G,who)) return null;   /* AA_600 S3：以安、學姊是前任＝她那一方不約 */   /* 分開以後一個學期，她那一方的邀約不發（AA_434 4-3）*/ G.invSeq=(G.invSeq|0)+1;
    const iv={id:'iv'+G.invSeq,who,place:pid,zone:P.zone,day,h:+h.toFixed(3),state:'offered',accepted:false,by:'npc',label:nameOf(who)+'約你去'+P.name}; G.invites.push(iv);
    const t=text||(nameOf(who)+'約你'+when(G,day,h)+P.verb.replace(/^去/,'去')+'。'); if(at){ S.msgAt(G,who,t,at.day,at.h); const M=G.msgs.find(m=>m.day===at.day&&m.h===+(at.h%24).toFixed(2)&&m.who===who&&m.text===t&&!m.iv); if(M) M.iv=iv.id; } else S.msg(G,who,t,iv); return iv; };   /* at＝{day,h}：訊息放在那個時間（她主動約你：前一天晚上傳的，睡過、跳過照原本的時間，src/heroine_asks3d.js）*/
  /* 回覆對方的邀約以後（S.answer）：fn(G,iv,ans,res)；回傳 {noFlow:true}＝改天不打開「自己選時間」（她主動約你的那幾則：她 3 天後會再約，HEROINE-ASKS-1028）*/
  S.ON_ANSWER=[];
  /* 你那個時間有沒有約（約了別人、校外約會、自己的考試）；這個人那個時間照作息在哪（給 src/heroine_asks3d.js：她本來就在那裡的邀約）*/
  S.mineAt=(G,day,h,stay)=>!!(clash(G,null,day,h,stay)||tripAt(G,day,h,stay)||myExam(G,day,h,stay));
  S.entAt=(G,id,day,h)=>entAt(G,id,day,h);
  /* 回覆對方的邀約：yes＝答應（時間衝突時照樣改天）、later＝改天（玩家另外選時間，走一般的 decide）、no＝不了（不扣分） */
  S.answer=function(G,ivId,ans){ const iv=S.byId(G,ivId); if(!iv||iv.state!=='offered') return null; const nm=nameOf(iv.who), P=S.place(iv.place);
    const hook=r=>{ for(const f of S.ON_ANSWER){ let x=null; try{ x=f(G,iv,ans,r); }catch(e){ console.warn('INV.ON_ANSWER',e); } if(x&&x.noFlow) r.noFlow=true; if(x&&x.flowPlace&&!r.flowPlace) r.flowPlace=x.flowPlace; } if(r.noFlow) delete r.flowPlace; return r; };   /* flowPlace：改天以後自己選日子，地點固定（HER-ASK-LATER-DAY-1110）*/
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
  S.timeOptions=function(G,together,P,id){ const out=[]; const h=G.hour%24; if(P&&P.whoDays&&id!=null&&Array.isArray(P.whoDays[id])) return S.timeOptions(G,together,Object.assign({},P,{whoDays:null}),null).filter(q=>dayOk(G,P,id,q.day));   /* whoDays：那幾天以外的時間不列（不是灰掉）*/
    if(P&&P.when) return (P.when(G,together)||[]).map(q=>Object.assign({t:q.now?'現在一起過去':when(G,q.day,q.h)},q));   /* 只有某些日子的地點（溫州街的茶席：每月第三個週日下午，src/wzlines3d.js）：日子、時間由那個地點給 */
    if(P&&(P.times||P.timesBy)){ const hr=P.hours||[0,24]; if(together&&h>=hr[0]-1e-6&&h+P.stay<=hr[1]+1e-6) out.push({t:'現在一起過去',now:true,day:G.day,h});   /* 只有固定時間的地點（晨跑 06:30～07:30，AA_126 6-6）：今天還沒過的、明天的那幾個時間 */
      for(const t of S.timesOf(G,P,G.day)) if(t>h+0.4) out.push({t:'今天 '+hh(t),day:G.day,h:t}); for(const t of S.timesOf(G,P,G.day+1)) out.push({t:'明天 '+hh(t),day:G.day+1,h:t});
      return S.slotDim(G,out).map(q=>q.dim||S.slotOpen(G,P,q.day,q.h)?q:Object.assign(q,{dim:true,hint:S.offWhy(G,P,q.day)||P.name+'那個時間沒開'})); }   /* 那一天公休、那個時段沒開（118 巷各店週幾休、午晚兩段）：灰掉、寫原因——和「其他日子…」（S.pickDay）一樣（BB-B 11-07 CC PC：巷口家常菜週一今天的時段都能選、選了她才說公休）*/
    if(together&&h<21.5) out.push({t:'現在一起過去',now:true,day:G.day,h});
    for(const t of D().times) if(t>h+0.4) out.push({t:'今天 '+hh(t),day:G.day,h:t}); for(const t of [12+10/60,19]) out.push({t:'明天 '+hh(t),day:G.day+1,h:t}); return S.slotDim(G,out); };
  /* 今天已經排滿的時段（ACTION-BUDGET-1107）：選項灰掉、寫「這個下午已經排滿了」；明天以後照常 */
  S.slotDim=function(G,out){ if(typeof CLS==='undefined'||!CLS.slotsOn||!CLS.slotsOn(G)||!CLS.slotLeft) return out; for(const q of out){ if(q.day!==G.day) continue; const p=CLS.periodAt(q.h%24); if(CLS.slotLeft(G,p)<=0){ q.dim=true; q.hint='這個'+CLS.SLOT_NAME[p]+'已經排滿了'; } } return out; };
  /* ---------- 約人的流程（當面：story3d.js 的 talkCharacter；手機：game3d.js 的「朋友」）：去哪裡 → 什麼時候 → 對方的回答 → 改天就問要不要那個時間 ---------- */
  /* 期末時段裡約成的吃飯＝期末的飯（AA_268 第 1 節）：標 iv.te、系統字、其他還沒回的期末邀約自動婉拒 */
  S.teMark=function(GM,iv,id,P,W){ const G=GM.G, te=iv&&typeof TERMEND!=='undefined'&&TERMEND.playerInvite?TERMEND.playerInvite(G,id,P,W):null; if(!te||!te.kind) return false;
    iv.te={term:te.w.id,kind:te.kind}; TERMEND.playerPicked(G,iv); if(GM.toast) GM.toast(te.kind==='gf'?TERMEND_LINES.SYS_GF:TERMEND_LINES.SYS_TE,4200); return true; };
  /* ---------- 「約她去…」的清單分層（INVITE-MENU-1030，使用者 10-30 04:2x「學姊也不能約她 其他活動 請幫我檢查統一每個可攻略角色約她的選項要更多 如果太多就分階層」）----------
     第一層照分類，一層最多約 8 列；一類只有一個＝直接列那一項（不多一層）；一類一個都沒有＝不列；整類都約不了＝灰掉、小字寫第一個原因（選了說原因、再選一次）。
     分類名稱照 AA_535 第 2 節（INVITE-OPTS-1030，AA-B 定稿）：念書／吃飯／喝咖啡、喝茶／散步／運動／出去玩（校外，不寫「約會」）／這個時候才有（節日、茶席、去她的城市、視訊這類有時間的）。
     地點的分類：P.cats（可以放兩類：慢讀咖啡＝念書＋喝咖啡、喝茶；一盞的茶席＝喝咖啡、喝茶＋這個時候才有），沒有就照 zone（總圖＝念書）、kind（meal 吃飯、walk 散步、sport 運動、其他＝喝咖啡、喝茶）。系統字，不是台詞 */
  S.CATS=[{id:'study',t:'念書'},{id:'meal',t:'吃飯'},{id:'sit',t:'喝咖啡、喝茶'},{id:'fun',t:'看電影、逛書店'},{id:'walk',t:'散步'},{id:'sport',t:'運動'}];   /* fun：南洋戲院、頁間、山嵐（INVITE-PLACES-1107）*/
  S.CAT_OF={teahouse_ceremony:['sit','when']};
  S.catsOf=P=>{ const L=P.cats||S.CAT_OF[P.id]||[P.cat||(/^library/.test(String(P.zone||''))?'study':({meal:'meal',walk:'walk',sport:'sport'}[P.kind]||'sit'))]; const ok=L.filter(c=>c==='when'||S.CATS.some(x=>x.id===c)); return ok.length?ok:['sit']; };
  S.catOf=P=>S.catsOf(P)[0];
  S.OUT_LABEL='出去玩…'; S.WHEN_LABEL='這個時候才有';
  /* 「這個時候才有」那一類，別的模組加的項目（INV.WHEN_X.push(fn)）：fn(G,id,n)→null 或 {t,hint,dim,why,run(GM,id,n)}；灰掉的選了說 why、留在同一層；選了＝run（例：AA_811 學姊合歡山北峰，src/aa811_3d.js）*/
  S.WHEN_X=[];
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
     或 INVITE_DATA.people.kexin.acc；羽球、晨跑照舊（AA_417 3-2）。沒交往照舊（她在外校：不用這個清單約）。kxPlaceLine：'own'＝那個地點自己的句子、'general'＝只有一般句、null＝沒有（不列）*/
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
  S.pickDay=async function(GM,id,P){ const G=GM.G; for(;;){ const days=S.moreDays(G).filter(d=>dayOk(G,P,id,d));   /* whoDays 以外的日子不列 */ const di=await GM.choose(days.map(d=>({t:S.dayLabel(G,d)})).concat([{t:'返回'}])); if(!(di>=0&&di<days.length)) return null; const day=days[di];
      const rows=(P.times||P.timesBy?S.timesOf(G,P,day):S.MORE_TIMES).map(h=>({h,ok:S.slotOpen(G,P,day,h)})), no=S.offWhy(G,P,day)||P.name+'那個時間沒開';
      for(;;){ const ti=await GM.choose(rows.map(r=>({t:hh(r.h),hint:r.ok?'':no,dim:!r.ok})).concat([{t:'換一天'}])); if(!(ti>=0&&ti<rows.length)) break; const r=rows[ti];
        if(!r.ok){ await GM.say(null,no+'。'); continue; } return {t:when(G,day,r.h),day,h:r.h}; } } };
  S.offWhy=(G,P,day)=>P&&Array.isArray(P.off)&&P.off.includes(wdOf(G,day))?P.name+'週'+WK[wdOf(G,day)]+'休':'';   /* 公休日（慢讀咖啡週二休，AA_535 4-1）*/
  S.flow=async function(GM,id,n,together,fo){ fo=fo||{}; const G=GM.G; S.rec(G);   /* fo.place：地點已經定了（她主動約、你回改天：HER-ASK-LATER-DAY-1110），直接選日子和時間 */ const nm=nameOf(id), c=CHARACTERS[id]||{}, her=c.gender==='f'?'她':'他';
    const t7=!n&&t7a(G,id);   /* AA_350 T7a：以安、芷若在台中＝和可昕一樣只有「去校外…」（清單只列 D26，DATE.menu）*/
    const far=!n&&typeof STORY!=='undefined'&&!!STORY.reachable&&!STORY.reachable(id,G);   /* INVITE-MENU-1030 E：手機約、她今天不在臺北（沛珊大三起在台南、寒暑假在老家）＝校內的地點不列（比照 T7a；原本照列、每一個都回「不在臺北」）*/
    const PL=(t7||far?[]:D().places).filter(Q=>!Q.show||Q.show(G,id)).filter(Q=>!S.neverAt(id,Q)); let k, P=null;   /* show：還沒開放的地點不列（茶席，src/wzlines3d.js）*/   /* KX-GF-PLACES-1113（AA-C 11-13 選 a）：可昕交往中不再用 kxPlaceOk 過濾（那是她在外校時「只列有答應句的地點」的限制；CANON 以後同系），照一般規則列 */   /* 可昕交往中：答應句接得上的校內地點都可以約（她從外校下來；羽球場用祐廷台大的帳號預約，AA_417 3-2）*/
    /* 當面約（AA_134 第 4 節，AA_140 G49）：第一句是當面的版本；她回答前看一下手機的行事曆、答應時點頭（動作用字幕，不多一個要點的對話框）*/
    const act=(t,ms)=>{ if(n&&GM.caption) GM.caption('','（'+t+'）',ms||1800); };
    if(n){ const T0=S.timeOptions(G,together); await GM.say({name:G.name||'祐廷'},T0.some(q=>q.day===G.day)?'你等一下有空嗎？':'你明天有空嗎？'); }   /* 照可選的時間說（AA-B 2026-10-16 21:53 定稿，AA_134 第 50 行下；不加週末選項）*/
    const dOk=typeof DATE!=='undefined'&&DATE.HEROINES&&DATE.HEROINES.includes(id);   /* 校外約會（DATE-S3，AA_128 4-1）：女主角的清單多一個「去校外…」；當面也可以（INVITE-MENU-1030 B：原本當面一律沒有）；約不到時灰掉、選了寫原因 */
    const hv=!n&&typeof HV!=='undefined'&&typeof HOMETOWN_LINES!=='undefined'&&HV.offer?HV.offer(G,id):null;   /* 寒暑假她在高雄／台中（AA_276 第 1-1、5 節）：「我去高雄找妳？」 */
    const vd=!n&&typeof HV!=='undefined'&&HV.videoOffer?HV.videoOffer(G,id):null;   /* 沛珊交往中、她在台南：「視訊？」（AA_349 K5；晚上 21:00～22:30、一週最多兩次）*/
    const fsO=typeof FEST!=='undefined'&&FEST.flowOpt?FEST.flowOpt(G,id,n,together):null;   /* 約她過節（AA_416，fest3d.js）：她的節日前後多一個「約她過節：…」；約不到的灰掉、選了說原因 */
    const leafOf=(Q,cat)=>{ const w=S.placeWhy(G,id,Q); return {t:cat==='study'&&Q.verbStudy?Q.verbStudy:Q.verb,short:Q.name,hint:w||(Q.id==='xs_nanyang'&&typeof MOVIES!=='undefined'&&MOVIES.board?MOVIES.board(G):''),dim:!!w,P:Q,cat}; };   /* 南洋戲院：說明寫今日放映（AA_730 nowBoard，MOVIE-REAL-1110）*/   /* verbStudy：在「念書」那一類的選項字（AA_702，INV-STUDY-CAFES-1105）*/   /* 約不到的地方寫原因（AA_125 第 1 節），選了就說原因、再選一次 */
    const nodes=S.CATS.map(C=>({t:C.t,items:PL.filter(Q=>S.catsOf(Q).includes(C.id)).map(Q=>leafOf(Q,C.id))}));
    if(dOk){ const ca=DATE.canAsk(G,id,n?{face:true}:null); nodes.push({t:S.OUT_LABEL,hint:ca.ok?'選地點、日期、時間':ca.why,dim:!ca.ok,go:'date'}); }   /* 出去玩（AA_535 第 2 節：不寫「約會」）；當面不用聯絡方式 */
    const sp=[]; if(hv){ const HL=HOMETOWN_LINES[HV.key?HV.key(G,id):id]||HOMETOWN_LINES[id]; sp.push({t:HL.ask,hint:hv.ok?'當天來回　'+HL.travel:hv.why,dim:!hv.ok,go:'hv'}); }   /* 沛珊在台南那一組（HV.key，AA_328 3-09）*/
    if(vd){ const VL=(HOMETOWN_LINES[HV.key(G,id)]||{}).video||{}; sp.push({t:VL.ask||'視訊？',hint:vd.ok?vd.hint:vd.why,dim:!vd.ok,go:'vd'}); }
    if(fsO) sp.push(Object.assign({},fsO,{go:'fest'}));
    for(const Q of PL) if(S.catsOf(Q).includes('when')) sp.push(leafOf(Q));   /* 有日期的地點（一盞的茶席：每月第三個週日）*/
    for(const f of S.WHEN_X){ let it=null; try{ it=f(G,id,n); }catch(e){ console.warn('INV.WHEN_X',e); } if(it&&it.t&&typeof it.run==='function') sp.push(Object.assign({},it,{go:'wx'})); }   /* 別的模組加的（S.WHEN_X）*/
    nodes.push({t:S.WHEN_LABEL,items:sp});   /* 這個時候才有（AA_535 第 2 節）：過節、茶席、去她的城市、視訊；有才出現，只有一個就直接列 */
    const fixP=fo.place?S.place(fo.place):null;
    const x=fixP?{P:fixP}:await S.menuTree(GM,nodes,async x=>{ if(x.P){ const why=S.placeWhy(G,id,x.P); if(!why) return x; await GM.say(null,why);
        { const ps=S.partnerBlock(G,id,x.P)&&(((D().people||{})[id]||{}).partnerSay||{})[x.P.id]; if(ps) await S.playLines(GM,n?{name:nm,obj:n.obj,charId:id}:{name:nm+'（手機）',charId:id},ps); }   /* 有伴侶時她自己的一句（學姊的一盞，AA_172 3b）*/
        return S.STAY_MENU; }
      if(x.go==='fest'&&x.dim){ await GM.say(null,x.hint+'。'); return S.STAY_MENU; }
      if(x.go==='wx'&&x.dim){ await GM.say(null,String(x.why||x.hint||'').replace(/([^。！？」）])$/,'$1。')); return S.STAY_MENU; } return x; });
    if(!x) return null; if(x.go==='wx') return x.run(GM,id,n); if(x.go==='date') return DATE.menu(GM,id,n); if(x.go==='hv') return HV.ask(GM,id); if(x.go==='vd') return HV.video(GM,id); if(x.go==='fest') return FEST.ask(GM,id,n);
    P=x.P; let W=null; const pickCat=x.cat||null;   /* 選的是哪一類（念書：一起念書第 N 次，STUDY-DATE-PROGRESS-1107）*/
    { const ln=P.lateNote?P.lateNote(G):null; if(ln) await GM.say(null,ln); }   /* 今天已經約不到的時段（Daybreak 14:00 以後：AA_652 第 3 節的旁白）：選時間前先說，時間照常列明天的 */
    for(;;){ const T=S.timeOptions(G,together,P,id); if(!T.length&&!(P&&P.whoDays&&P.whoDays[id])){ await GM.say(null,'今天太晚了，改天再約吧。'); return null; } const more=!P.when, to=T.map(q=>({t:q.t,hint:q.hint,dim:q.dim})); if(more) to.push({t:'其他日子…',hint:'之後 7 天內選一天'}); to.push({t:'算了'});
      k=await GM.choose(to); if(more&&k===T.length){ const w=await S.pickDay(GM,id,P); if(!w) continue; W=Object.assign({},w); break; } if(!(k>=0&&k<T.length)) return null; if(T[k].dim){ await GM.say(null,T[k].hint+'。'); continue; } W=Object.assign({},T[k]); break; }
    if(id==='heroine_05'&&typeof V6EX!=='undefined'&&V6EX.sisExInvite&&V6EX.noContact(G,id)){ const xr=V6EX.sisExInvite(G), w0=n?{name:nm,obj:n.obj,charId:id}:{name:nm+'（手機）',charId:id};   /* AA_600 S9（企劃線 031414cad）：前任的學姊被約——第 1、2 次已讀不回；第 3 次回「最近忙。」；不答應（校外約會、挽回路線照各自的條件）*/
      if(xr==='read') await GM.say(null,n?V6EX.SIS_EX_NOD:V6EX.SIS_EX_READ); else await GM.say(w0,V6EX.SIS_EX_BUSY); return null; }   /* 有名字說的不再在外面加「」（AA-B 11-08） */
    const r=S.personal(G,id,P,W.day,W.h,Object.assign(S.decide(G,id,P.id,W.day,W.h),n?{face:true}:{})), who=n?{name:nm,obj:n.obj,charId:id}:{name:nm+'（手機）',charId:id};
    const te=typeof TERMEND!=='undefined'&&TERMEND.playerInvite?TERMEND.playerInvite(G,id,P,W):null;   /* 期末時段裡約吃飯＝期末的飯（BB_203 第 1 節第 13 點、AA_268）*/
    if(te&&te.refuse){ act(her+'看了一下手機的行事曆。'); if(n&&GM.sleep) await GM.sleep(700); await GM.say(who,te.refuse); return null; }   /* 關係結束、還不能重新開始（C8、C9）；有名字說的不在外面加「」（AA-B 11-08）*/
    act(her+'看了一下手機的行事曆。'); if(n&&GM.sleep) await GM.sleep(700);
    const same=!!n&&(P.zone===G.zone||(P.zone==='library_hall'&&G.zone==='library'));   /* 當面、人已經在那個地方（總圖：大廳和 3F 閱覽室都算）*/
    if(W.now&&same&&r.res==='here'){ r.res='accept'; delete r.lines; }   /* 兩個人都在那裡、約「現在」＝直接開始，不念手機那句（學姊平日的總圖「好啊，我在總圖三樓。到了跟我說。」；BB 10-22 03:01；使用者 10-21 23:2x「只要兩個都在場 就不用一起走或說話才能開始」）*/
    if(r.res==='accept'){ act(her+'點點頭。'); if(n&&typeof CHAR!=='undefined'&&CHAR.setExpr) CHAR.setExpr(n.obj,'smile'); const here=!!W.now&&same;   /* 兩個人已經在那個地方（例：在總圖讀完、當場再約一次讀書；使用者 10-21 23:1x）：不用一起走過去 */
      const iv=S.accept(G,id,P.id,W.day,W.h,{now:!!W.now&&!here,by:'player',cat:pickCat}); const tail=here?'':(W.now?'你們一起'+P.verb+'。':'約好 '+when(G,W.day,W.h)+'，'+P.name+'。');
      const tw=S.townLine(G,id,W);   /* AA_675 1-1：語彤寒暑假平日在淡水，答應臺北的邀約，答應那一句後面多一句 */
      if(iv&&iv.filmSay&&typeof MOVIES!=='undefined'&&MOVIES.sayPick){ if(iv.filmForced){ /* 她指定看這部：她那幾句就是答應（一般的答應句不說，例：子晴「我只看動作片喔。」對不上） */ } else if(r.lines) await S.playLines(GM,who,r.lines,r); else await GM.say(null,S.reply(G,id,P.id,r)); await MOVIES.sayPick(GM,iv,who); if(tw) await GM.say(who,tw); if(tail) await GM.say(null,tail); }   /* 約她看她不看的片（子晴不看黑白片）／她一定挑的片：答應以後她說換片的那一句，約好的是換過的片（AA_745 skip，AA 11-10 20:11）*/
      else if(r.lines){ await S.playLines(GM,who,r.lines,r); if(tw) await GM.say(who,tw); if(tail) await GM.say(null,tail); } else if(tw){ await GM.say(null,S.reply(G,id,P.id,r)); await GM.say(who,tw); if(tail) await GM.say(null,tail); } else await GM.say(null,S.reply(G,id,P.id,r)+tail);
      S.teMark(GM,iv,id,P,W);
      if(here){ await S.startTogether(GM,iv,n); return iv; }   /* 直接開始（S.accept 已經是 accepted、時間＝現在）*/
      if(W.now&&n){ if(GM.standUp) GM.standUp(n); n.beh='follow'; n.frozen=false; n.followOff=1.1; n.path=null; } return iv; }   /* 坐著被約「現在一起過去」：先起身再跟（使用者 2026-10-16 試玩：Café 約吃麵，以安坐姿懸空跟著走）*/
    if(r.lines) await S.playLines(GM,who,r.lines,r); else await GM.say(null,S.reply(G,id,P.id,r));
    if(r.study&&typeof SISG!=='undefined'&&SISG.studyOffer) return SISG.studyOffer(GM,W,who,n);   /* 學姊第 14 週～筆試婉拒以後「那一起念書。」（AA_535 1-3）*/
    if(r.res==='here') return null;   /* 她已經在那裡：玩家直接去（以安的總圖、芷若上班時的 Café、學姊平日的總圖、語彤週二週四的麵店）*/
    /* 改時間（BUG-INV-CONFLICT-SKIP-REPLY-1107，BB-B 11-07：撞到你自己已經約好的事 →「你那個時間已經約了別人。改成 ○○？」→ 按「好」就直接約好，她沒有回、連照設計要婉拒的也約成了）：
       why 'mine' 的新時間是系統提的、不是她答應的——換成新的時間再問她一次（decide＋personal，和第一次一樣），她的回答照播；她提的新時間（busy、booked、closed…）照舊直接約好。最多再問三次 */
    let R=r;
    for(let tries=0;tries<3&&R&&R.res==='resched'&&R.alt;tries++){ const Q=S.place(R.alt.place||P.id), A=R.alt; const kk=await GM.choose([{t:'好，就 '+when(G,A.day,A.h)+(Q.id!==P.id?'（'+Q.name+'）':'')},{t:'下次再說'}]); if(kk!==0) return null;
      const cat=Q.id===P.id?pickCat:null;
      if(R.why==='mine'){ const R2=S.personal(G,id,Q,A.day,A.h,Object.assign(S.decide(G,id,Q.id,A.day,A.h),n?{face:true}:{}));
        if(R2.res!=='accept'){ if(R2.lines) await S.playLines(GM,who,R2.lines,R2); else await GM.say(null,S.reply(G,id,Q.id,R2)); R=R2; continue; }
        const iv=S.accept(G,id,Q.id,A.day,A.h,{by:'player',cat}); if(R2.lines) await S.playLines(GM,who,R2.lines,R2); else await GM.say(null,S.reply(G,id,Q.id,R2)); await GM.say(null,'約好 '+when(G,A.day,A.h)+'，'+Q.name+'。'); S.teMark(GM,iv,id,Q,A); return iv; }
      const iv=S.accept(G,id,Q.id,A.day,A.h,{by:'player',cat}); await GM.say(null,'約好 '+when(G,A.day,A.h)+'，'+Q.name+'。'); S.teMark(GM,iv,id,Q,A); return iv; }
    return null; };
  return S;
})();
