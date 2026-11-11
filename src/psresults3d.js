/* 沛珊放榜那天：交往中的版本（任務 PS-RESULTS-1018；BB_119 1b-3（企劃線 a54ec2b4）、9-2 的到場；AA_276 6-2（e55fda50）；AA_282 第 1 節／AA_349 K8（f5e9acae）；台詞一字不改）
   - 給誰：2027-08-06 那天和她交往中的玩家（消失期開始時交往中＝整段都聯絡著，PS_KEPT；PEISHAN_WAIT 永遠到不了，AA_360 第 5 節）。
   - 10:00 她先傳「你現在在哪？」；兩分鐘後「我現在去搭客運。」「到總圖外面的台階。我中午到。」（祐廷的回覆「在家。」／「在家。怎麼了？」，AA_416 第 11 節第 4 點；選哪個、不回都一樣，她接著傳）→ 12:00 出遊「總圖外面的台階」（從家裡出發約 30 分鐘，比她早到）。
   - 12:00 以前到：她從公館那邊跑過來（BCG-22 就是這一拍）；12:15 還沒到：她傳「我到了。台階這邊，樹蔭下面。」，等到 13:00；12:00 以後才到、或 13:00 帶到場（R4，她的答案要當面說）：
     旁白「（八月的午後。她坐在台階上，看到你，才站起來。）」，其他一樣。
   - 台詞：「上了。我要去當老師了。」（CG cg_results_day_peishan）→ PS_KEPT「那半年，每天晚上十一點，我都傳一則給你。……現在可以白天講了。」（STORY.PS_KEEP_BACK）→「……你幫我想想，第一堂課要講什麼。」→ 祐廷的三個回答照 BB_97 4-4（「講框外面的人。」只給有 NOT_FOR_ME 的玩家）。
   - 演完：PS_RECONNECT（資料頁大三、大四「教育系」、畢業那天的卡片讀這個）、PS_RESULTS＝met／brought。
   - 2D 背景：總圖白天的外景還沒有圖，用椰林大道（ntu_avenue，台階在大道的盡頭）；暑假從家裡出發，不換 3D。
   - 沒交往的玩家：這一版不做（AA_282 第 2 節「她不先找人」；8/7 傳過訊息的那通電話在 y2b3d.js）。交往中（和別人）的「我考上了。」、班群「沛珊考上了！」等 AA 定（這一版沒有）。 */
const PSR=(function(){
  const S={}, ID='classmate_peishan', KEY='2027-08-06', OID='ps_results';
  const DK=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const T=(d,h)=>d*24+h, now=G=>T(G.day,G.hour);
  const law=G=>!!G&&G.stage!=='econ';
  const dating=G=>!!(G&&G.flags&&G.flags['dating_'+ID]);
  const P=t=>({th:'p:'+ID,from:ID,text:t});
  S.LINES={ where:'你現在在哪？', bus:'我現在去搭客運。', steps:'到總圖外面的台階。我中午到。', wait:'我到了。台階這邊，樹蔭下面。', sit:'（八月的午後。她坐在台階上，看到你，才站起來。）' };
  S.on=G=>{ const d=DK(KEY); return d!=null&&law(G)&&dating(G); };
  S.q=G=>typeof OUT!=='undefined'&&OUT.get?OUT.get(G,OID):null;
  /* 手機：10:00、10:02；排出遊；12:15 還沒到 */
  S.phone=function(G){ if(!S.on(G)||typeof PHONE==='undefined') return; const d=DK(KEY), F=G.flags; if(G.day<d||G.day>d||F.PS_RESULTS) return;
    if(now(G)>=T(d,10)&&!PHONE.sent(G,'ps_results_where')) PHONE.at(G,d,10,[Object.assign(P(S.LINES.where),{ask:{id:'ps_results_where',until:T(d,12),opts:[{t:'在家。'},{t:'在家。怎麼了？'}]}})],'ps_results_where');   /* AA_416 第 11 節第 4 點：兩個選項；選哪個、不回，兩分鐘後她都接那兩句 */
    if(now(G)>=T(d,10+2/60)&&!PHONE.sent(G,'ps_results_bus')){ PHONE.at(G,d,10+2/60,[P(S.LINES.bus),P(S.LINES.steps)],'ps_results_bus');
      if(typeof OUT!=='undefined'&&!S.q(G)) OUT.plan(G,{id:OID,ev:'ev_peishan_results',day:d,h:12,late:1,early:0.5,must:true,place:'總圖外面的台階',title:'總圖外面的台階 12:00',travel:'走過去 約 15 分鐘',travelH:0.25,homeTravel:'捷運＋走路 約 30 分鐘',back:'回家。'}); }
    const q=S.q(G); if(q&&q.state!=='done'&&now(G)>=T(d,12.25)&&now(G)<T(d,13)&&!PHONE.sent(G,'ps_results_wait')) PHONE.at(G,d,12.25,[P(S.LINES.wait)],'ps_results_wait'); };
  /* 13:00 還沒到：帶到場 */
  S.bringDue=G=>{ if(!S.on(G)) return false; const d=DK(KEY), q=S.q(G); return G.day===d&&!G.flags.PS_RESULTS&&!!q&&q.state!=='done'&&!q.arrived&&now(G)>=T(d,13); };
  S.evOf=()=>(typeof STORY_EVENTS!=='undefined'?STORY_EVENTS:[]).find(e=>e.id==='ev_peishan_results')||null;
  S.bring=async function(GM,o){ const G=GM.G, q=S.q(G), ev=S.evOf(); if(!ev||!S.bringDue(G)) return false; if(q) q.state='done'; G.flags.PS_RESULTS_LATE=true; G.flags.PS_RESULTS_BROUGHT=true;
    GM.sceneBegin(); try{ if(o&&o.fromHome&&typeof HOME!=='undefined'&&HOME.rec){ const H=HOME.rec(G); H.at=false; H.wakeAsk=null; }
      if(typeof ADV!=='undefined'&&ADV.active&&ADV.end) ADV.end(); await GM.fade(true); if(GM.titleCard) await GM.titleCard('總圖外面的台階','',2000);
      if(typeof ADV!=='undefined'&&ADV.begin) ADV.begin({background:'dark'}); await GM.fade(false);
      await EVENTS.run(ev);
      await GM.fade(true); GM.advance(ev.hours||1); if(typeof ADV!=='undefined'&&ADV.active&&ADV.end) ADV.end();
      if(o&&o.fromHome&&typeof HOME!=='undefined'&&HOME.rec){ const H=HOME.rec(G); H.at=true; H.day=G.day; if(typeof ADV!=='undefined'&&ADV.begin) ADV.begin({background:HOME.bgNow?HOME.bgNow():'dark'}); }   /* 從家裡被帶過去：演完回家 */
      await GM.fade(false); }
    finally{ GM.sceneEnd(); }
    if(GM.autosave) GM.autosave(); return true; };
  let busy=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['psresults3d:busy']=()=>{ busy=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
  S.tick=function(GM){ const G=GM&&GM.G; if(busy||!G||!S.bringDue(G)) return false; if(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G)) return false;   /* 在家：家裡的選單接（y4HomeDue）*/
    busy=true; S.bring(GM).catch(e=>console.warn('PSR.bring',e)).finally(()=>{ busy=false; }); return true; };

  const hasNF=()=>typeof SOCIAL!=='undefined'&&SOCIAL.has&&SOCIAL.has(ID,'NOT_FOR_ME');
  const EV={ id:'ev_peishan_results', title:'放榜那天', participants:[ID], location:'any', trigger:'outing', once:true, background:'dark', hours:1,
    dialogue:[ {scene:'總圖外面的台階',bg:'ntu_avenue'},
      {if:{custom:G=>!!G.flags.PS_RESULTS_LATE||(G.hour%24)>12.05},speaker:null,text:S.LINES.sit},   /* 12:00 以後才到、帶到場：她坐在台階上（不跑、不喘）*/
      {cg:'cg_results_day_peishan'},
      {speaker:ID,text:'上了。我要去當老師了。'},
      {if:{custom:G=>!!G.flags.PS_KEPT},speaker:ID,text:typeof STORY!=='undefined'&&STORY.PS_KEEP_BACK?STORY.PS_KEEP_BACK:'那半年，每天晚上十一點，我都傳一則給你。……現在可以白天講了。'},
      {speaker:ID,text:'……你幫我想想，第一堂課要講什麼。'},
      {choice:[{text:'「先講妳為什麼想當老師。」',goto:'a'},{text:'「講框外面的人。」',if:{custom:()=>hasNF()},goto:'b'},{text:'「先睡覺。明天再想。」',goto:'c'}]},
      {label:'a'},{speaker:ID,text:'……好。那我第一堂就講這個。講不好的話，第二堂再講一次。'},{goto:'end'},
      {label:'b'},{speaker:ID,text:'……你還記得。好。那第一堂課，我先畫三個框。'},{goto:'end'},
      {label:'c'},{speaker:ID,text:'好。……睡不著。我要先去跟早餐店的牆說。'},
      {label:'end'} ],
    after:G=>{ const F=G.flags; F.PS_RESULTS=F.PS_RESULTS_BROUGHT?'brought':'met'; F.PS_RECONNECT=true; delete F.PS_RESULTS_LATE; } };
  S.EV=EV;
  if(typeof STORY_EVENTS!=='undefined'&&!STORY_EVENTS.some(e=>e.id===EV.id)) STORY_EVENTS.push(EV);
  if(typeof STORY!=='undefined'){
    if(Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(S.phone);
    if(Array.isArray(STORY.TICKS)) STORY.TICKS.push(S.tick);
    if(Array.isArray(STORY.WAKE_AT)) STORY.WAKE_AT.push(G=>{ const d=DK(KEY); return S.on(G)&&G.day===d&&!G.flags.PS_RESULTS&&G.hour<10?10:null; });   /* 睡著也會在 10:00 收到她的訊息 */
    if(!STORY._psrHome){ const hd0=STORY.y4HomeDue, hf0=STORY.y4FromHome;
      STORY.y4HomeDue=function(G){ const r=hd0?hd0.apply(this,arguments):null; return r||(S.bringDue(G)?'psr_bring':null); };
      STORY.y4FromHome=function(GM,k){ if(k==='psr_bring') return S.bring(GM,{fromHome:true}); return hf0?hf0.apply(this,arguments):null; };
      STORY._psrHome=true; } }
  if(typeof HOME!=='undefined'&&Array.isArray(HOME.STOPS)) HOME.STOPS.push(G=>{ const d=DK(KEY); if(!S.on(G)||G.flags.PS_RESULTS||d==null) return null; return [T(d,10),T(d,12.25),T(d,13)]; });   /* 放假在家的快轉停在她的訊息、12:15、帶到場 */
  return S;
})();
if(typeof window!=='undefined') window.PSR=PSR;
