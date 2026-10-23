/* ===== 總圖借書（AA_399 3-2＋AA_407 第一批書單，企劃線 e81aa74c；任務 LIB-LOAN-1023）=====
   只借劇情給的書（不做查詢、不做隨機書單）；借期四週；一次最多兩本；到期前三天 09:00 手機通知；逾期以後第一次到服務台館員一句；不扣分、不罰款、不停借。台詞照稿一字不改。
   - 「知道」那本書（F.LOAN_KNOW_<id>）以後，總圖大廳的服務台（library_hall「服務台」）多一個「借《書名》」：
     L1 周教授：大一上民法總則第 4 週的課堂（CLS.IN_CLASS，下課以前）；
     L2 以安：公法讀書會第一次散會（afterActivity public_law_group，和 ev_public_law_group 同一天）；
     L3 學姊：AA_394 10/14 法圖「找判決」（ev_sis_db_taught）最後多一句（載入時接在那一場後面，不改 sis_b8_events.js）；5F 還沒做，先放一般書架；
     L4 芷若：閒聊 Z3-L2（記憶 ZR3_SUBTITLE）演過的那天 21:00 私訊兩則（有她的聯絡方式）。
     R1 方奕廷的植物圖鑑：只能在 5F 館內看，等 5F 做好再接（這一版沒有）。
   - 借期內：房間書桌多一本（STORY.ROOM_EXTRA，「看」各一句旁白）。
   - 還書（服務台）：L1 館員一句；L2 下一次讀書會以安一句；L3 下一次在 Café 找學姊說話先一句＋兩個選項（SISY23.preTalk 鏈）；L4 還書那天 21:00 芷若私訊一句（她在英國 2027-09-02～2028-02-18 不傳）。各一次。
   - 存檔：G.loans＝[{book,day,late?}]（新欄位，舊存檔沒有＝空陣列＝沒借過，不會跳逾期）；F.LOAN_RET＝{id:還書那天}。
   - 這一版沒做：總圖門口還書箱、B1 自助借還機（B1 還沒做）；AA_407「讀書旁白多一句（你翻了一下借來的那本）」。
   測試：node tests/aa407_loans_unit.js */
'use strict';
const LOANS=(function(){
  const S={}, AN='heroine_01', ZR='heroine_02', SIS='heroine_05';
  const DK=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const law=G=>!!G&&!!G.flags&&(G.stage||'law')==='law';
  const now=G=>G.day*24+(+G.hour||0);
  const evOf=id=>typeof STORY_EVENTS!=='undefined'?STORY_EVENTS.find(e=>e.id===id)||null:null;
  const sent=(G,tag)=>typeof PHONE!=='undefined'&&PHONE.sent(G,tag);
  const lines=async(L)=>{ if(typeof EVENTS!=='undefined'&&EVENTS.runLines) await EVENTS.runLines(L,{id:'loans'}); };
  S.BOOKS={
    L1:{title:'民法案例演習：總則篇',look:'（第二章的案例，旁邊有前一個人用鉛筆畫的箭頭。）'},
    L2:{title:'憲法解釋的故事',look:'（第六章的書頁被折過一個角。不是你折的。）'},
    L3:{title:'判決怎麼讀',ed:'（舊版）',look:'（第三章比其他章都舊，紙比較黃。）'},
    L4:{title:'一行十四個字',look:'（第八章講的是一部老電影的最後一句台詞，譯者改了十一次。）'}};
  S.DAYS=28; S.MAX=2;
  S.name=id=>'《'+S.BOOKS[id].title+'》'+(S.BOOKS[id].ed||'');
  S.rec=function(G){ if(!Array.isArray(G.loans)) G.loans=[]; return G.loans; };
  const F_=G=>G.flags||(G.flags={});
  S.known=(G,id)=>!!(G&&G.flags&&G.flags['LOAN_KNOW_'+id]);
  S.know=(G,id)=>{ const F=F_(G); if(!F['LOAN_KNOW_'+id]) F['LOAN_KNOW_'+id]=G.day; };
  S.due=l=>l.day+S.DAYS;   /* 最後一天（第 28 天）；過了這天＝逾期 */
  S.out=(G,id)=>S.rec(G).find(l=>l.book===id)||null;
  S.borrow=function(G,id){ const L=S.rec(G); if(!S.BOOKS[id]||!S.known(G,id)||S.out(G,id)||L.length>=S.MAX) return false; L.push({book:id,day:G.day}); return true; };
  S.giveBack=function(G,id){ const L=S.rec(G), i=L.findIndex(l=>l.book===id); if(i<0) return null; const l=L.splice(i,1)[0]; const F=F_(G), R=F.LOAN_RET||(F.LOAN_RET={}); R[id]=G.day; return l; };
  S.returned=(G,id)=>{ const R=G&&G.flags&&G.flags.LOAN_RET; return R&&R[id]!=null?R[id]:null; };
  /* L1：周教授，大一上民法總則第 4 週（課堂那一句後面、下課以前） */
  S.L1_LINE='這週的案例不用買書。總圖有一本《民法案例演習：總則篇》，看第二章就好。';
  S.inClass=async function(GM,it,prof,ct){ const G=GM&&GM.G; if(!law(G)||!it||!it.c||it.c.id!=='civ_general'||it.exam||S.known(G,'L1')||typeof CALENDAR==='undefined') return false;
    const t=CALENDAR.termOf(G.day); if(!t||t.id!=='Y1S1'||t.week!==4) return false;
    await GM.say(prof||null,(prof?'':((ct&&ct.prof)||(typeof CLS!=='undefined'&&CLS.profName?CLS.profName(it.c):'周教授'))+'：')+S.L1_LINE); S.know(G,'L1'); return true; };
  /* L2：公法讀書會第一次散會前（以安）；還書以後下一次讀書會一句 */
  S.EVENTS=[
    {id:'ev_loan_l2_know',title:'公法讀書會',participants:[AN],location:'wancai',trigger:'activity',afterActivity:'public_law_group',term:['Y1S1','Y1S2'],once:true,background:'blur',
      prereq:{custom:G=>{ const L=(G.events&&G.events.last)||{}; return L.ev_public_law_group===G.day&&!S.known(G,'L2'); }},
      dialogue:[{speaker:AN,text:'總圖有一本《憲法解釋的故事》。我高中就讀過。很好讀。'},{set:{LOAN_KNOW_L2:true}}]},
    {id:'ev_loan_l2_back',title:'公法讀書會',participants:[AN],location:'wancai',trigger:'activity',afterActivity:'public_law_group',term:['Y1S1','Y1S2'],once:true,background:'blur',
      prereq:{custom:G=>{ const r=S.returned(G,'L2'); return r!=null&&G.day>r; }},
      dialogue:[{speaker:AN,text:'讀完了？……第六章那個案子，我想下次講。'}]}];
  /* L3：學姊「找判決」那一場最後多一句（AA_407 L3）——載入時接在 ev_sis_db_taught 後面 */
  S.L3_LINE='總圖有一本《判決怎麼讀》。借舊版，新版把第三章刪了。';
  S.patchL3=function(){ const ev=evOf('ev_sis_db_taught'); if(!ev||!Array.isArray(ev.dialogue)||ev._loanL3) return false; ev.dialogue.push({speaker:SIS,text:S.L3_LINE},{set:{LOAN_KNOW_L3:true}}); ev._loanL3=true; return true; };
  /* L3 還書以後：下一次在 Café 找她說話先一句（一次） */
  S.preTalk=async function(GM){ const G=GM&&GM.G; if(!law(G)||G.zone!=='cafe') return false; const r=S.returned(G,'L3'); if(r==null||G.day<=r||G.flags.LOAN_L3_ASKED) return false;
    G.flags.LOAN_L3_ASKED=G.day;
    await lines([{speaker:SIS,text:'第三章讀了嗎。'},{choice:[{text:'「讀了。」',goto:'a'},{text:'「還沒。」',goto:'b'}]},{label:'a'},{speaker:SIS,text:'嗯。那章是我大一讀的。'},{goto:'c'},{label:'b'},{speaker:SIS,text:'那你借太早了。'},{label:'c'}]); return true; };
  /* 芷若在英國（AA_390 9/2 出發；回來＝ZR_UK_BACK 2028-02-19） */
  S.zrAway=G=>{ const a=DK('2027-09-02'), b=DK('2028-02-19'); return a!=null&&b!=null&&G.day>=a&&G.day<b; };
  const zrDm=t=>({th:'p:'+ZR,from:ZR,text:t});
  const memDay=(id,tag)=>{ if(typeof SOCIAL==='undefined'||!SOCIAL.memories) return null; const M=SOCIAL.memories(id)||[]; const m=M.find(x=>x.tag===tag); return m?m.day:null; };
  S.phone=function(G){ if(!law(G)||typeof PHONE==='undefined') return; const F=G.flags;
    /* L4：Z3-L2 演過的那天 21:00 */
    if(!S.known(G,'L4')){ const d=memDay(ZR,'ZR3_SUBTITLE'); const hasC=typeof INV!=='undefined'&&INV.hasContact?INV.hasContact(G,ZR):!!(G.contacts&&G.contacts[ZR]!=null);
      if(d!=null&&hasC&&G.day>=d&&G.day<=d+1&&now(G)>=d*24+21&&!sent(G,'loan_l4_know')) PHONE.at(G,d,21,[zrDm('總圖有一本講字幕的書。《一行十四個字》。'),zrDm('……我大一借了三次。')],'loan_l4_know');
      if(sent(G,'loan_l4_know')) S.know(G,'L4'); }
    /* L4 還書那天 21:00（她在英國不傳） */
    { const r=S.returned(G,'L4'); if(r!=null&&G.day>=r&&G.day<=r+1&&now(G)>=r*24+21&&!sent(G,'loan_l4_back')&&!S.zrAway(Object.assign({},G,{day:r}))) PHONE.at(G,r,21,[zrDm('你真的借了。……第八章是我最喜歡的。')],'loan_l4_back'); }
    /* 到期前三天 09:00 */
    for(const l of S.rec(G)){ const d3=S.due(l)-3, tag='loan_due_'+l.book+'_'+l.day; if(G.day>=d3&&G.day<=d3+1&&now(G)>=d3*24+9&&!sent(G,tag)) PHONE.at(G,d3,9,[{th:'sys',text:'總圖：'+S.name(l.book)+'三天後到期。'}],tag); } };
  /* 總圖大廳的服務台：知道的書可以借、借了的可以還；什麼都沒有＝照舊只是「看」 */
  S.deskOptions=function(G){ const O=[]; for(const l of S.rec(G)) O.push({t:'還'+S.name(l.book),act:'ret',id:l.book});
    for(const id of Object.keys(S.BOOKS)) if(S.known(G,id)&&!S.out(G,id)) O.push({t:'借'+S.name(id),act:'borrow',id,dim:S.rec(G).length>=S.MAX});
    return O; };
  S.desk=async function(GM){ const G=GM.G; const O=S.deskOptions(G); if(!O.length) return false;
    GM.sceneBegin(); try{
      const late=S.rec(G).filter(l=>G.day>S.due(l)&&!l.late); if(late.length){ for(const l of late) l.late=G.day; await lines([{speaker:'館員',text:'這本逾期了喔。還了就好。'}]); }   /* 逾期以後第一次到服務台（不罰款、不停借；兩本一起逾期也只說一次）*/
      const k=await GM.choose(O.concat([{t:'（離開）'}])); const o=O[k]; if(!o) return true;
      if(o.act==='borrow'){ if(!S.borrow(G,o.id)){ if(GM.toast) GM.toast('一次最多借兩本。',2600); return true; } const d=CALENDAR.dateOf(S.due(S.out(G,o.id))); if(GM.toast) GM.toast('借了'+S.name(o.id)+'：'+d.m+'/'+d.d+' 以前還',2800); }
      else if(o.act==='ret'){ S.giveBack(G,o.id); if(o.id==='L1') await lines([{speaker:'館員',text:'這本這學期很多人借。下一個已經在等了。'}]); if(GM.toast) GM.toast('還了'+S.name(o.id),2400); }
      if(GM.autosave) GM.autosave();
    } finally { GM.sceneEnd(); }
    return true; };
  S.interact=async function(it,GM){ const G=GM&&GM.G; if(!law(G)||!it||G.zone!=='library_hall'||it.label!=='服務台') return false; return S.desk(GM); };
  /* 房間書桌：借期內多一本 */
  S.room=function(G,L){ for(const l of S.rec(G)){ const b=S.BOOKS[l.book]; if(b) L.push(['借來的'+S.name(l.book),b.look]); } };
  /* 掛勾 */
  if(typeof STORY_EVENTS!=='undefined') for(const e of S.EVENTS) if(!STORY_EVENTS.some(x=>x.id===e.id)) STORY_EVENTS.push(e);
  S.patchL3();
  if(typeof CLS!=='undefined'&&Array.isArray(CLS.IN_CLASS)){ const f=(GM,it,prof,ct)=>S.inClass(GM,it,prof,ct); f.due=(G,it)=>law(G)&&!!it&&!!it.c&&it.c.id==='civ_general'&&!it.exam&&it.term==='Y1S1'&&it.week===4&&!S.known(G,'L1'); CLS.IN_CLASS.push(f); }   /* due：學期中的快轉（src/semff3d.js）停在這一堂前面，不自動上 */
  if(typeof STORY!=='undefined'){
    if(Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.phone(G));
    if(Array.isArray(STORY.ROOM_EXTRA)) STORY.ROOM_EXTRA.push((G,L)=>S.room(G,L));
    if(STORY.interact&&!STORY._loansInteract){ const o0=STORY.interact; STORY.interact=async function(it,GM){ if(await S.interact(it,GM)) return true; return o0.apply(this,arguments); }; STORY._loansInteract=true; } }
  if(typeof SISY23!=='undefined'&&typeof SISY23.preTalk==='function'&&!SISY23.preTalk._loans){ const p0=SISY23.preTalk;
    SISY23.preTalk=async function(GM){ const r=await p0.apply(this,arguments); return r||await S.preTalk(GM); }; Object.assign(SISY23.preTalk,{_loans:true,_sisb4:p0._sisb4,_sisjp:p0._sisjp,_sisb8:p0._sisb8,_sisb9:p0._sisb9,_sisb10:p0._sisb10}); }
  return S;
})();
