/* ===== 法律系大一逐週補空白（AA_347 第 7 節，AA-C 2026-10-21 定稿 83f130c0；全部第①級；任務 AA347-Y1-COVER-1021）=====
   台詞在 src/data/y1fill_events.js（Y1FILL_LINES、Y1FILL_EVENTS，照 AA_347 不改字）。這個檔只接線，不改 story3d.js、holff3d.js 的內部：
   - STORY.PHONE_RULES：麵店團群組的五則（1-2 11/20、1-3 11/26、2-1 2/6、3-1 4/24、4-1 8/18）；兩則有「去。／不去。」——去＝OUT.plan（11/21 10:00 田徑場、2/7 18:00 麵店）；
     運動會沒去（回「不去。」、沒回、答應了沒到）＝11/21 11:40 群組的獎狀照片。群組訊息在那一天一開始就排好（PHONE.at），每天的手機小事看得到「今天有劇情訊息」就不加。
   - STORY.DAILY_PHONE：3-2 大一下的手機小事八則（term Y1S2；第 4 週起、一天最多一則、同一則一次、隔 7 天照 story3d.js 的 dailyPhone；阿凱的 App 分兩次，第二次隔 14 天以上）。
   - HOLFF.SUMS：摘要日的旁白（快轉停在那一天 18:30，日期卡下面那一行）：2/5 換成專用句、7/29 新的摘要日（照暑假住哪裡）、8/25。
   - STORY.TICKS：5-1 房間的紙箱（大一的房間 203，8/29 起，床底下；拆／先不拆，記 BOX_WINTER_OPEN）、寒流日兩版（12/8 第一次醒來／12/9 醒來）；
     1-1 人已經在房間裡、時間到了（10/27 22:30、10/30 18:00）＝進房間 2.5 秒以後演（進門的那一刻照 enter 事件）。
   大四主線 11 的最後一箱（story3d.js 的 packY4「床底下最後一個紙箱。上面是媽媽的字：「冬天的衣服」。」）就是這一箱：拆不拆都摺好留在床底下（AA_347 5-1），不用另外記。
   存檔：G.flags 的 KAI_TAPE、Y1_RELAY（'go'／'no'／'went'）、Y1W_NOODLE_LAST（'go'／'no'／'went'）、BOX_WINTER_OPEN（true）、BOX_WINTER_DAY（拆的那一天）、BOX_COLD（'glad'／'night'）；訊息照 PHONE 的 tag。
   測試：node tests/aa347_y1_unit.js */
'use strict';
const Y1FILL=(function(){
  const S={};
  const L=typeof Y1FILL_LINES!=='undefined'?Y1FILL_LINES:{dp:{}};
  const D=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const T=(d,h)=>d*24+h, now=G=>G.day*24+G.hour;
  const law=G=>!!G&&(G.stage||'law')==='law';
  const inGrp=(G,g)=>typeof PHONE!=='undefined'&&!!PHONE.inGroup&&PHONE.inGroup(G,g);
  const knows=(id,G)=>typeof STORY!=='undefined'&&!!STORY.knows&&STORY.knows(id,G);
  const stageAt=(id,lv)=>typeof SOCIAL!=='undefined'&&!!SOCIAL.STAGES&&SOCIAL.STAGES.indexOf(SOCIAL.stage(id))>=SOCIAL.STAGES.indexOf(lv);
  const met=(G,id,lv)=>knows(id,G)&&stageAt(id,lv||'FAMILIAR');   /* 先看認識（不替沒有紀錄的人建一筆空的關係），才問階段 */
  const contact=(G,id,day)=>{ if(typeof INV==='undefined'||!INV.hasContact||!INV.hasContact(G,id)) return false; const c=G.contacts&&G.contacts[id]; return c==null||c<(day==null?G.day:day); };   /* 前一天以前就有聯絡方式（同 story3d.js 的 gotBefore；預設的聯絡人沒有日子）*/
  const home=G=>typeof HOME!=='undefined'&&!!HOME.at&&HOME.at(G);
  const roommate=G=>typeof STORY==='undefined'||!STORY.kaiRoommate||STORY.kaiRoommate(G);   /* 大一同房（大二上開學、搬進 312 以前）*/
  const wdOf=d=>typeof CALENDAR!=='undefined'&&CALENDAR.dateOf?CALENDAR.dateOf(d).wd:null;
  const NG='g:noodle_team';
  const grpMsg=([from,text])=>({th:NG,from,text});

  /* ===================== 麵店團群組（1-2、1-3、2-1、3-1、4-1）=====================
     那一天一開始（G.day 到了）就排好；到時間才出現（PHONE.tick），睡過去的照原本的時間補。只給那時候在麵店團群組的玩家（不在群組＝沒有）；晚兩天以上才讀到的不補 */
  const GO=k=>[{t:'去。',set:{[k]:'go'}},{t:'不去。',set:{[k]:'no'}}];   /* 選項的字照 AA_347（「去。」「不去。」）；回「不去。」沒有回覆 */
  S.GROUPS=[
    {tag:'y1_relay_ask',day:'2025-11-20',h:21,ms:L.relayAsk,ask:{until:['2025-11-21',10],opts:GO('Y1_RELAY')}},   /* 1-2：到 11/21 10:00 都回得了 */
    {tag:'y1_final_scope',day:'2025-11-26',h:22+10/60,ms:L.finalScope},   /* 1-3 */
    {tag:'y1w_noodle_last_ask',day:'2026-02-06',h:21,ms:L.noodleLastAsk,ask:{until:['2026-02-07',18],opts:GO('Y1W_NOODLE_LAST')}},   /* 2-1：語彤在群組（同 noodle_closed3d.js 店休那一則）*/
    {tag:'y1s2_mid_done',day:'2026-04-24',h:21.5,ms:L.midDone},   /* 3-1 */
    {tag:'y1s_still_taipei',day:'2026-08-18',h:21,ms:L.stillTaipei} ];   /* 4-1 */
  S.groups=function(G){ for(const g of S.GROUPS){ if(!g.ms||PHONE.sent(G,g.tag)) continue; const d=D(g.day); if(d==null||G.day<d||G.day>d+1||!inGrp(G,'noodle_team')) continue;
      const M=g.ms.map(grpMsg); if(g.ask){ const u=D(g.ask.until[0]); M[M.length-1].ask={id:g.tag,until:u!=null?T(u,g.ask.until[1]):null,opts:g.ask.opts.map(o=>Object.assign({},o,{set:Object.assign({},o.set)}))}; }
      PHONE.at(G,d,g.h,M,g.tag); } };
  /* 1-2 回「去。」＝11/21（五，運動會停課）10:00 田徑場的出遊；沒去（「不去。」、沒回、答應了沒到）＝11:40 群組的獎狀照片（收到 11/20 那一則的玩家）*/
  S.RELAY_DAY='2025-11-21'; S.RELAY_PHOTO_H=11+40/60;
  S.relay=function(G){ const F=G.flags, d=D(S.RELAY_DAY); if(d==null||G.day<d-1||G.day>d+1) return;
    if(F.Y1_RELAY==='go'&&typeof OUT!=='undefined'&&OUT.plan&&!OUT.get(G,'y1_relay')&&now(G)<T(d,10.75)) OUT.plan(G,{id:'y1_relay',ev:'ev_y1_relay',day:d,h:10,place:'田徑場',title:'運動會',travel:'走過去約 10 分鐘',travelH:1/6});
    if(F.Y1_RELAY!=='went'&&now(G)>=T(d,S.RELAY_PHOTO_H)&&PHONE.sent(G,'y1_relay_ask')&&!PHONE.sent(G,'y1_relay_photo')&&inGrp(G,'noodle_team')) PHONE.at(G,d,S.RELAY_PHOTO_H,L.relayPhoto.map(grpMsg),'y1_relay_photo');
    if(F.Y1_RELAY!=='went'&&now(G)>=T(d,12+10/60)&&PHONE.sent(G,'y1_relay_photo')&&!PHONE.sent(G,'y1_relay_miss')&&L.relayMiss&&contact(G,'zhe',d)) PHONE.at(G,d,12+10/60,L.relayMiss.map(t=>({th:'p:zhe',from:'zhe',text:t})),'y1_relay_miss'); };   /* AA_350 O4：沒去的，12:10 阿哲私訊（不扣好感）*/
  /* 2-1 回「去。」＝2/7（六）18:00 麵店的出遊（住家裡的照出遊系統從家裡出發）；「不去。」或沒回：沒有後續 */
  S.NOODLE_LAST_DAY='2026-02-07';
  S.noodleLast=function(G){ const F=G.flags, d=D(S.NOODLE_LAST_DAY); if(d==null||F.Y1W_NOODLE_LAST!=='go'||typeof OUT==='undefined'||!OUT.plan||OUT.get(G,'y1w_noodle_last')||now(G)>=T(d,18.75)) return;
    OUT.plan(G,{id:'y1w_noodle_last',ev:'ev_y1w_noodle_last',day:d,h:18,place:'公館',title:'阿鳳麵店',travel:'走過去約 10 分鐘',travelH:1/6}); };
  S.phone=function(G){ if(!G||!G.flags||!law(G)||typeof PHONE==='undefined') return; for(const f of [S.groups,S.relay,S.noodleLast]){ try{ f(G); }catch(e){ console.warn('Y1FILL phone',e); } } };

  /* ===================== 3-2 大一下的手機小事（八則，term Y1S2）=====================
     story3d.js 的 dailyPhone 照舊管：第 4 週起、一天最多一則、輪流、同一則隔 7 天、當天有劇情訊息就不加、時間已經過了的那天不挑。條件不到就跳過 */
  const Y1S2=t=>!!t&&t.id==='Y1S2';
  const seqP=(id,A)=>A.map((t,k)=>({th:'p:'+id,from:id,text:t,dt:k/60}));
  const seqG=(th,A,names)=>A.map(([w,t],k)=>Object.assign({th,from:w,text:t,dt:k/60},names&&names[w]?{name:names[w]}:{}));
  /* 去過週四的麵店（麵店日的紀錄 ndlDays，或習慣記憶 place:noodle:* 的日子）*/
  S.thuNoodle=function(G){ const F=G.flags||{}; if((F.ndlDays||[]).some(d=>wdOf(d)===4)) return true; const H=G.habits||{};
    for(const k in H){ if(!/^place:noodle:/.test(k)||!H[k]) continue; if((H[k].days||[]).some(d=>wdOf(d)===4)) return true; } return false; };
  S.DP=[
    {id:'y1s2_kevin_parrot',term:Y1S2,h:()=>21+18/60,ok:G=>law(G)&&inGrp(G,'family_law'),items:()=>seqG('g:family_law',L.dp.kevin_parrot,{kevin:'Kevin',heroine_05:'溫學姊'})},   /* 家族群組的帳號名稱照 kevin_video */
    {id:'y1s2_yu_curry',term:Y1S2,h:()=>12.5,ok:G=>law(G)&&inGrp(G,'noodle_team'),items:()=>seqG(NG,L.dp.yu_curry)},
    {id:'y1s2_zhe_three',term:Y1S2,h:()=>22+40/60,ok:G=>law(G)&&inGrp(G,'noodle_team'),items:()=>seqG(NG,L.dp.zhe_three)},
    {id:'y1s2_bohan_closed',term:Y1S2,h:()=>22+10/60/* AA_373 #19：總圖十點關（原本 23:10）*/,ok:G=>law(G)&&inGrp(G,'noodle_team'),items:()=>seqG(NG,L.dp.bohan_closed)},
    {id:'y1s2_an_ac',term:Y1S2,h:()=>15+20/60,ok:(G,day)=>law(G)&&met(G,'heroine_01','FAMILIAR')&&contact(G,'heroine_01',day),items:()=>seqP('heroine_01',L.dp.an_ac)},
    {id:'y1s2_yt_board',term:Y1S2,h:()=>17+40/60,ok:G=>law(G)&&met(G,'heroine_03','FAMILIAR')&&S.thuNoodle(G)&&contact(G,'heroine_03'),items:()=>seqP('heroine_03',L.dp.yt_board)},   /* AA_350 O6：要有她的聯絡方式 */
    {id:'y1s2_xinci_drama',term:Y1S2,h:()=>23.5,ok:(G,day)=>law(G)&&contact(G,'classmate_xinci',day),items:()=>seqP('classmate_xinci',L.dp.xinci_drama)},
    {id:'y1s2_kai_app',term:Y1S2,max:()=>2,gap:14,h:()=>22+5/60,ok:G=>law(G)&&roommate(G),items:(G,n)=>seqP('kai',n?L.dp.kaiApp2:L.dp.kaiApp1)} ];   /* 第二次＝兩週後同一則的後半 */
  if(typeof STORY!=='undefined'&&Array.isArray(STORY.DAILY_PHONE)&&!STORY._y1filldp){ for(const d of S.DP) if(!STORY.DAILY_PHONE.some(x=>x.id===d.id)) STORY.DAILY_PHONE.push(d); STORY._y1filldp=true; }

  /* ===================== 2-1、4-1 摘要日的旁白（HOLFF.SUMS：快轉停在那一天 18:30，日期卡下面那一行）=====================
     7/29 照暑假住哪裡（大一下最後一天宿舍系統問的 SUMMER_PICK＝G.home.stay.Y1S；沒回＝續住）*/
  S.summerHome=G=>{ const F=(G&&G.flags)||{}; if(F.SUMMER_PICK==='Y1S:home') return true; return !!(G&&G.home&&G.home.stay&&G.home.stay.Y1S==='home'); };
  S.SUMS=[{date:'2026-02-05',line:L.sum0205},{date:'2026-07-29',line:G=>L.sum0729?(S.summerHome(G)?L.sum0729.home:L.sum0729.dorm):null},{date:'2026-08-25',line:L.sum0825}];
  if(typeof HOLFF!=='undefined'&&Array.isArray(HOLFF.SUMS)&&!HOLFF._y1fill){ for(const s of S.SUMS) if(!HOLFF.SUMS.some(x=>x.date===s.date)) HOLFF.SUMS.push(s); HOLFF._y1fill=true; }

  /* ===================== 5-1 「冬天的衣服」紙箱（AA_12 主線 1）=====================
     大一的房間（203，阿凱同房）8/29 起，床底下（玩家那組床的書桌和梯子中間）。點它：旁白 → 「拆。」＝掛外套、紙箱摺好塞回床底下（BOX_WINTER_OPEN）；「先不拆。」＝沒有後續、下次還可以點。
     3D 模型還沒有（LAWWW2）：先只有互動點 */
  S.BOX_FROM='2025-08-29';
  S.boxDue=G=>{ const F=(G&&G.flags)||{}, d=D(S.BOX_FROM); return law(G)&&!F.BOX_WINTER_OPEN&&d!=null&&G.day>=d&&G.zone==='dorm'&&!home(G)&&roommate(G); };
  S.boxSpot=function(){ const R=typeof DORM_ROOM!=='undefined'?DORM_ROOM:null, U=R&&R.units?R.units.find(u=>u.id===(R.player_unit||'L2')):null;
    if(U&&U.seat_approach&&U.desk_u&&U.stair_u) return [U.seat_approach[0],Math.round((U.desk_u[1]+U.stair_u[0])/2*1000)/1000]; return [-1.55,0.628]; };
  S.boxPlace=function(GM){ const G=GM.G, E=GM.E; if(!E||!Array.isArray(E.interactables)) return; const i=E.interactables.findIndex(it=>it&&it.y1WinterBox);
    if(!S.boxDue(G)){ if(i>=0) E.interactables.splice(i,1); return; } if(i>=0) return;
    const p=S.boxSpot(); E.interactables.push({x:p[0],z:p[1],radius:0.45,lv:0,label:L.box.label,y1WinterBox:true,onInteract:()=>{ S.boxScene(GM).catch(e=>console.warn('Y1FILL 紙箱',e)); }}); };
  S.boxScene=async function(GM){ const G=GM.G, F=G.flags; if(!S.boxDue(G)) return false; let k=1; GM.sceneBegin();
    try{ await GM.say(null,L.box.look); k=await GM.choose(L.box.opts.map(t=>({t})));
      if(k===0){ F.BOX_WINTER_OPEN=true; F.BOX_WINTER_DAY=G.day; await GM.say(null,G.day===S.coldDay()&&L.boxColdOpen?L.boxColdOpen:L.box.open); } }   /* AA_350 O5：寒流那天（12/8）當天才拆＝換那一句；BOX_WINTER_DAY＝那天，所以 12/8 的 glad、12/9 的 night 都不演 */
    finally{ GM.sceneEnd(); }
    if(k===0){ S.boxPlace(GM); if(GM.autosave) GM.autosave(); } return true; };
  /* 寒流日（STORY.firstColdDay，大一上第 15 週週一 12/8）：有拆＝12/8 第一次醒來（在宿舍房間、中午以前）；沒拆＝12/8 晚上在宿舍睡、12/9 醒來，之後算拆了。
     平日晚上不能回家（HOME.canGo 只有週五晚上到週日），12/9 早上人在房間＝前一晚在宿舍睡；在家的不演 */
  S.coldDay=()=>typeof STORY!=='undefined'&&STORY.firstColdDay?STORY.firstColdDay():D('2025-12-08');
  S.coldDue=function(G){ const F=(G&&G.flags)||{}; if(!law(G)||F.BOX_COLD||G.zone!=='dorm'||home(G)||!roommate(G)||G.hour>=12) return null; const c=S.coldDay(); if(c==null) return null;
    if(G.day===c&&F.BOX_WINTER_OPEN&&!(F.BOX_WINTER_DAY!=null&&F.BOX_WINTER_DAY>=c)) return 'glad';   /* 那天早上以前就拆了 */
    if(G.day===c+1&&!F.BOX_WINTER_OPEN) return 'night';
    return null; };
  S.coldRun=async function(GM,v){ const G=GM.G, F=G.flags; F.BOX_COLD=v; if(v==='night'){ F.BOX_WINTER_OPEN=true; F.BOX_WINTER_DAY=S.coldDay(); }
    const ev=typeof STORY_EVENTS!=='undefined'?STORY_EVENTS.find(e=>e.id===(v==='glad'?'ev_y1_cold_box_glad':'ev_y1_cold_box_night')):null;
    if(ev&&typeof EVENTS!=='undefined') await EVENTS.run(ev); if(GM.E) S.boxPlace(GM); return true; };

  /* ===================== 1-1 人已經在房間裡、時間到了 =====================
     阿凱的國界是進房間（enter）的事件；10/27 22:30 以前就回房間、一直待著的玩家，時間一到也算「22:30 起第一次在房間」（10/30 18:00 那一則同理）。
     進房間 2.5 秒以後才看（進門那一刻的 enter 事件先演，同 story3d.js 的 fyPotsTick）*/
  S.tapeDue=function(G){ if(!law(G)||G.zone!=='dorm'||home(G)||typeof EVENTS==='undefined'||!EVENTS.check||typeof STORY_EVENTS==='undefined') return null;
    for(const id of ['ev_kai_tape','ev_kai_tape2']){ const ev=STORY_EVENTS.find(e=>e.id===id); if(!ev||(G.events&&G.events.done&&G.events.done[id])) continue; let ok=false; try{ ok=EVENTS.check(ev); }catch(e){ ok=false; } if(ok) return ev; }
    return null; };
  let tapeT=0, busy=false, dormT=0;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['y1fill3d:busy']=()=>{ busy=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
  /* ev_kai_tape2 等膠帶的模型載好才演（BB 10-21 21:4x：讀檔後第一次進 203，進門那一刻 dorm_y1_items.glb 還沒載到——鏡頭拿不到膠帶、地上照「還沒演」顯示「國界」，旁白卻說「法律系免簽」）：
     進門那一刻的 enter 不演，交給下面 S.tick 的「進房間 2.5 秒」；模型一直載不到（沒有這個檔、載入失敗）待滿 12 秒就照原本的鏡頭演 */
  S.tapeReady=function(){ const E=typeof GAME!=='undefined'&&GAME?GAME.E:null, sc=E&&E.scene; if(sc&&sc.getObjectByName&&sc.getObjectByName('Y1_KAI_TAPE_TEXT')) return true; if(typeof ASSETS==='undefined'||!ASSETS.manifest||!ASSETS.manifest['bldg.dorm_y1_items']) return true; return dormT>12; };
  /* ev_kai_tape2 開場的鏡頭（UX-KAI-TAPE-CAM-1021；BB_218、LAWWW2 6437fcf6：一般鏡頭看不清楚地上的「法律系免簽」）：走道那一條中間那段先換成寫字的版本
     （演完以後 zones3d.js 的 setY1Items 照 done 也是這一版，狀態不會跳回去），鏡頭從房間那一側往下看——字頭朝牆（+x，dorm_y1_items.py 的 n），站在 −x 那側讀起來是正的。模型還沒載到＝null（照原本的鏡頭）*/
  S.tapeShot=function(GM){ const sc=GM&&GM.E&&GM.E.scene; if(!sc||typeof THREE==='undefined'||!THREE.Box3) return null; const t=sc.getObjectByName('Y1_KAI_TAPE_TEXT'), m=sc.getObjectByName('Y1_KAI_TAPE_MID'); if(!t) return null;
    t.visible=true; if(m) m.visible=false; t.updateWorldMatrix(true,true); const c=new THREE.Box3().setFromObject(t).getCenter(new THREE.Vector3()), q=new THREE.Quaternion(); if(t.parent) t.parent.getWorldQuaternion(q);
    const cam=GM.E.camera, half=Math.tan(((cam&&cam.fov)||46)*Math.PI/360), asp=(cam&&cam.aspect)||1.6, dist=Math.max(0.8,0.37/(half*asp));   /* 五個字 64 cm 要整段在畫面裡（左右各留一點）：橫向 0.8 m；手機直向畫面窄，退到 1.9 m 左右 */
    return {pos:c.clone().add(new THREE.Vector3(-0.546,0.837,0).multiplyScalar(dist).applyQuaternion(q)),look:c}; };
  S.tick=function(GM,dt){ const G=GM&&GM.G; if(!G||!G.flags||!law(G)) return false;
    dormT=G.zone==='dorm'?dormT+Math.min(dt||0,1):0;
    try{ S.boxPlace(GM); }catch(e){ console.warn('Y1FILL 紙箱',e); }
    if(GM.E&&GM.E.zone&&GM.E.zone.setY1Items) GM.E.zone.setY1Items(G);   /* 紙箱、膠帶的模型（zones3d.js 的 loadY1Items，dorm_y1_items.glb）*/
    const free=!busy&&typeof EVENTS!=='undefined'&&!EVENTS.running&&!(GM.D&&GM.D.active)&&!(GM.E&&GM.E.player&&GM.E.player.busy);
    if(!free){ tapeT=0; return false; }
    const v=S.coldDue(G); if(v){ busy=true; S.coldRun(GM,v).catch(e=>console.warn('Y1FILL 寒流',e)).finally(()=>{ busy=false; }); return true; }
    const ev=S.tapeDue(G); if(!ev){ tapeT=0; return false; }
    tapeT+=Math.min(dt||0,1); if(tapeT<2.5) return false; tapeT=0; void EVENTS.run(ev); return true; };   /* 一次最多算 1 秒：低幀率（一次 tick 好幾秒）也至少等三次，進門的招呼（「喔，回來了。」）、enter 事件先 */
  S.reset=()=>{ tapeT=0; busy=false; };   /* 測試用 */

  /* ===================== 掛勾 ===================== */
  if(typeof STORY!=='undefined'){
    if(Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.phone(G));
    if(Array.isArray(STORY.TICKS)) STORY.TICKS.push((GM,dt)=>S.tick(GM,dt)); }
  return S;
})();
