/* ===== 芷若出發那天（2027-09-02，大三上英國交換；AA_390 定稿，企劃線 5f4b9c7b；任務 ZR-SENDOFF-L-1023、AA389-ZR-SENDOFF-1023）=====
   大二下期末聚餐她說「九月二號出發。」、玩家回「出發那天我去送妳。」（termend_lines.js Y2S2，記 HOOK_ZR_SENDOFF）的下文。台詞照 AA_390 一字不改（D100、D109）。
   - 誰會演（第 1 節，S.cond）：有 HOOK_ZR_SENDOFF、9/2 祐廷人在臺灣（寒暑假行事曆的外地活動 VAC、校外約會的兩天一夜 DATE.tripOn 都算不在）、有她的聯絡方式。
   - 手機（STORY.PHONE_RULES，S.phone）：第 2 節 9/1（三）21:00 她私訊兩則、三個回覆（回到 9/2 08:30）；「會到。」「妳東西收好了嗎？」＝排出遊，「沒辦法去」＝declined。
     第 4 節：回了會到、09:30 還沒到機場（出遊 late 1 小時；「不去了」也算）＝missed、09:40「我要進去了。」；沒辦法去＝09:40「我出發了。」；都不扣關係。
     沒回她（AA_390 沒寫，LAWWW-B 暫定）：照答應了沒來（missed、「我要進去了。」），已告訴 AA。
   - 出遊（OUT）：9/2 08:30 桃園機場第二航廈・出境大廳，機場捷運約 1 小時（travelH:1）；不算正式約會；alarm（睡覺、跳過時間停在出發前）。
   - 事件 ev_zr_sendoff_2027（第 3 節）：交往中（和芷若）用 3-1 那兩處；和別人交往中＝一般版（3-2）。
     第 5 節：6/3 最後一個班沒到的（沒有 ev_zhiruo_last_shift、ZR_LAST_SHIFT 沒有值）＝地址那段之後她拿出票根、記 TICKET_STUB，ZR_LAST_SHIFT 記 'airport'
       ——y2b3d.js 1B-06 的 9/2 10:00 三則就不傳（!F.ZR_LAST_SHIFT），9/24 明信片「櫃台那張票根」那兩句也不加（只認 'missed'）。
   - 結果：ZR_SENDOFF_2027 met／declined／missed；met＝熟悉 +3、自在 +2、記憶 ZR_SAW_OFF。
   - 期末聚餐的「出發那天我去送妳」（termend_lines.js HOOK_ZR_SENDOFF）這一場做好以後拿掉 noOpt（AA_390 第 6 節第 3 點）。
   芷若媽媽：背景人物，沒有 3D 模型、沒有立繪，說話框寫「芷若媽媽」。
   測試：node tests/aa390_zr_sendoff_unit.js */
'use strict';
const ZRSENDOFF=(function(){
  const S={}, ZR='heroine_02';
  const D=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const T=(d,h)=>d*24+h, now=G=>G.day*24+(+G.hour||0);
  const law=G=>!!G&&!!G.flags&&(G.stage||'law')==='law';
  const sent=(G,tag)=>typeof PHONE!=='undefined'&&PHONE.sent(G,tag);
  const done=(G,id)=>!!(G.events&&G.events.done&&G.events.done[id]);
  const mem=(id,tag)=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(id,tag);
  const contact=G=>typeof INV==='undefined'||!INV.hasContact||INV.hasContact(G,ZR);
  const dm=t=>({th:'p:'+ZR,from:ZR,text:t});
  const romR=G=>((G&&G.flags&&G.flags.romance)||{})[ZR]||null;
  const dating=G=>{ const F=(G&&G.flags)||{}, R=romR(G); return F['dating_'+ZR]===true||!!(R&&R.status==='dating'); };
  S.DAYS={ask:'2027-09-01',day:'2027-09-02'};
  S.ASK='zr_sendoff_ask_2027'; S.OUT_ID='zr_sendoff_2027'; S.EV='ev_zr_sendoff_2027'; S.H=8.5; S.LATE=1; S.MISS_H=9+40/60;   /* 08:30；09:30 還沒到＝沒來；09:40 那一則 */
  S.TAGS={miss:'zr_sendoff_miss_2027'};
  S.LINES={ ask:['明天八點半，第二航廈。','你說要來的。'],
    opts:[{t:'會到。',r:'嗯。',go:true},{t:'妳東西收好了嗎？',r:'收了三次。每次都多一件。',go:true},{t:'明天臨時有事，沒辦法去。',r:'好。',go:false}],
    missed:'我要進去了。', declined:'我出發了。' };

  /* 9/2 祐廷不在臺灣（第 1 節：寒暑假行事曆、旅行）*/
  S.away=function(G,d){ if(typeof STORY!=='undefined'&&STORY.abroad&&STORY.abroad(Object.assign({},G,{day:d}))) return true;
    if(typeof DATE!=='undefined'&&DATE.tripOn&&DATE.tripOn(G,d)) return true;
    if(typeof VAC!=='undefined'&&VAC.all&&VAC.state&&VAC.daysOf) return VAC.all().some(I=>(I.A.trip||I.A.place.kind!=='taipei')&&['yes','done'].includes(VAC.state(G,I.key))&&VAC.daysOf(I).includes(d));
    return false; };
  S.cond=function(G,why){ const out=r=>why?{ok:r===true,why:r===true?'':r}:r===true; if(!law(G)) return out('不是法律系'); const F=G.flags;
    if(F.HOOK_ZR_SENDOFF==null) return out('期末聚餐沒有答應送機');
    if(F.ZR_SENDOFF_2027!=null||sent(G,S.ASK)) return out('只演一次');
    const d=D(S.DAYS.day); if(d==null||S.away(G,d)) return out('9/2 祐廷不在臺灣');
    if(!contact(G)) return out('沒有她的聯絡方式');
    return out(true); };

  /* ---------- 手機（第 2、4 節）---------- */
  S.phone=function(G){ if(!law(G)||typeof PHONE==='undefined') return; const F=G.flags, d1=D(S.DAYS.ask), d2=D(S.DAYS.day); if(d1==null||d2==null) return; const t=now(G);
    if(t<T(d1,21)||G.day>d2+1) return;
    if(t<T(d2,S.H)&&!sent(G,S.ASK)&&S.cond(G)){ const M=S.LINES.ask.map(dm);
      M[M.length-1].ask={id:S.ASK,until:T(d2,S.H),opts:S.LINES.opts.map(o=>({t:o.t,say:[{from:ZR,text:o.r}],set:o.go?{ZR_SENDOFF_GO:true}:{ZR_SENDOFF_2027:'declined'}}))};
      PHONE.at(G,d1,G.day===d1?Math.max(21,G.hour):G.hour,M,S.ASK); }
    if(!sent(G,S.ASK)) return;
    if(F.ZR_SENDOFF_GO===true&&F.ZR_SENDOFF_2027==null&&typeof OUT!=='undefined'){ const q=OUT.get(G,S.OUT_ID);
      if(!q&&t<T(d2,S.H+S.LATE)) OUT.plan(G,{id:S.OUT_ID,ev:S.EV,day:d2,h:S.H,late:S.LATE,place:'桃園機場第二航廈・出境大廳',title:'芷若出發：桃園機場第二航廈',travel:'機場捷運約 1 小時',travelH:1,hours:1.5,alarm:true,back:'回到台北。'});
      else if(q?(q.state==='missed'||(q.state==='planned'&&!q.arrived&&t>T(q.day,q.h+S.LATE))):t>T(d2,S.H+S.LATE)) F.ZR_SENDOFF_2027='missed'; }
    if(F.ZR_SENDOFF_2027==null&&F.ZR_SENDOFF_GO!==true&&t>=T(d2,S.H+S.LATE)) F.ZR_SENDOFF_2027='missed';   /* 沒回她（暫定，見檔頭）*/
    const k=F.ZR_SENDOFF_2027; if((k==='missed'||k==='declined')&&t>=T(d2,S.MISS_H)&&!sent(G,S.TAGS.miss)) PHONE.at(G,d2,S.MISS_H,[dm(k==='missed'?S.LINES.missed:S.LINES.declined)],S.TAGS.miss); };
  S.missed=function(G){ if(G&&G.flags&&G.flags.ZR_SENDOFF_2027==null) G.flags.ZR_SENDOFF_2027='missed'; };

  /* ---------- 事件（第 3 節；3-1 交往中、第 5 節 6/3 沒到的票根）---------- */
  const N=t=>({speaker:null,text:t}), Z=t=>({speaker:ZR,text:t}), M=t=>({speaker:'芷若媽媽',text:t});
  const GF={custom:G=>dating(G)}, SHIFT_MISSED={custom:G=>!done(G,'ev_zhiruo_last_shift')&&!G.flags.ZR_LAST_SHIFT}, STUB={custom:G=>mem(ZR,'TICKET_STUB')&&G.flags.ZR_LAST_SHIFT!=='airport'};   /* 〔有 TICKET_STUB〕＝6/3 那天就拿到的；剛在機場拿到的（第 5 節）用「妳那邊冷嗎？」——不然那一句沒有人看得到（已告訴 AA）*/
  S.EVENT={ id:S.EV, title:'她出發那天', participants:[ZR], location:'any', trigger:'outing', once:true, background:'dark', hours:1.5,
    outingMissed:(G)=>S.missed(G),
    dialogue:[ {scene:'桃園機場・出境大廳',bg:'airport_departure'},
      N('（八點半。她推著一個很大的行李箱，旁邊站著一個比她矮一點的阿姨。）'),
      Z('我媽。'),
      M('你好。她說有同學要來，我還不信。'),
      Z('……媽。'),
      N('（她從外套口袋拿出一張摺好的紙。）'),
      Z('那邊的地址。'),
      Object.assign(Z('電影看完，寫的那一句寄這裡。'),{unless:GF}),
      Object.assign(Z('二月回來。……第一張明信片寄給你。'),{if:GF}),
      Object.assign(N('（她又拿出一張電影票根。）'),{if:SHIFT_MISSED}),
      Object.assign(Z('這個本來放在櫃台。你沒來拿。'),{if:SHIFT_MISSED,consequences:{flags:{ZR_LAST_SHIFT:'airport'},mem:[{npc:ZR,tag:'TICKET_STUB',note:'她出發那天，在機場給的電影票根'}]}}),
      {choice:[{text:'「到了傳訊息給我。」',goto:'a'},{text:'「電影我還沒看。」',if:STUB,goto:'b'},{text:'「妳那邊冷嗎？」',unless:STUB,goto:'c'}]},
      {label:'a'},Z('那邊我只寄明信片。……傳訊息的話，我會一直看手機。'),{goto:'go'},
      {label:'b'},Z('九月才開始。慢慢看。'),{goto:'go'},
      {label:'c'},Z('查過了，比臺北冷十度。我帶了兩件外套。……我媽又塞了一件。'),
      {label:'go'},N('（廣播叫了她那班飛機。她把行李箱推給櫃台以後，只剩一個背包。）'),
      Z('好。'),
      Object.assign(N('（她在門口停了一下，抓了一下你的手，才進去。）'),{if:GF}),   /* 3-1「出境前多一行旁白」：和下一句都是「進去了」，交往中只留這一句（已問 AA）*/
      Object.assign(N('（她走到出境的門口，回頭揮了一下手，進去了。）'),{unless:GF}),
      M('我搭十點的客運回台中。你呢？'),
      {choice:[{text:'「我回學校。」',goto:'s'},{text:'「我送您到客運站。」',goto:'t'}]},
      {label:'s'},M('好。路上小心。'),{goto:'end'},
      {label:'t'},N('（你們走到客運站。她上車以前，跟你點了一下頭。）'),
      {label:'end'} ],
    after:G=>{ const F=G.flags; F.ZR_SENDOFF_2027='met';
      if(typeof SOCIAL!=='undefined'){ if(SOCIAL.adjust) SOCIAL.adjust(ZR,{fam:3,comf:2}); if(SOCIAL.remember) SOCIAL.remember(ZR,'ZR_SAW_OFF','她出發那天，你去了機場'); } } };

  /* ---------- 掛上去 ---------- */
  if(typeof STORY_EVENTS!=='undefined'&&!STORY_EVENTS.some(e=>e&&e.id===S.EV)) STORY_EVENTS.push(S.EVENT);
  if(typeof STORY!=='undefined'&&!STORY._zrSendoff){ if(Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.phone(G)); STORY._zrSendoff=true; }
  return S;
})();
