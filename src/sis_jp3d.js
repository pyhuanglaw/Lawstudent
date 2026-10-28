/* ===== 學姊第七批：日本路線（AA_393；任務 SIS-B7-L-1023；D111 交換學生期間也要充實學姊）：接線 =====
   日本路線的祐廷 3/25 出發、8/5 回來；學姊 8/2 去美國——3/24 到 12/23 九個月沒見面，這一批補 3/22～8/1（8/6 以後照 r2y4b3d.js 每週一格、AA_392 第 1 節）。
   台詞、事件在 src/data/sis_jp_events.js（照稿不改字）。這個檔：
   - 誰有（S.ok）：日本路線、學姊朋友以上、不是前任、有她的聯絡方式（交往中一定有）。
   - 第 1 節：3/22（三）21:00 她私訊一句提示；3/23（四）19:30～21:30 在兩點半 Café 找她說話＝說話前接演（S.preTalk，包住 SISY23.preTalk，同 sis_b4_3d.js）；
     沒去＝3/24 09:00 她傳便條的照片（SIS_JP_NOTE 'photo'）。
   - 第 2 節：4/3～7/24 臺灣週一 20:00（日本 21:00）兩週一則，照順序各一次；那一天 20:00 前後已經排了出遊＝順延到週二同一時間（SIS_JP_MSG＝傳到第幾則）。
   - 第 3 節：7/31（一）21:00 她約；8/1（二）21:00 臺灣（日本 22:00）視訊（ev_sis_jp_eve，接電話的做法）；回「可能在外面」＝8/1 21:00 文字版；沒接＝21:20「明天早上的飛機。十二月見。」。
     沒回她的：照樣打（她說好了九點）。
   - 第 4 節：回覆池「祐廷在日本」（msg3d.js 的情況版，msg_pool.js 照 tools/msg/build_pool.py 產生）。
   - 第 5 節：交往中四組視訊，臺灣週日 21:00（日本 22:00）4/9、5/7、6/18、7/16，照順序各一次；沒接「你在忙。下次。」（SIS_JP_V＝演到第幾組）。
   時間：手機、出遊都用遊戲的時鐘（人在日本＝臺灣時間 +1，STORY.tzOffset）。
   測試：node tests/aa393_sis_jp_unit.js */
'use strict';
const SISJP=(function(){
  const S={}, ID='heroine_05', L=typeof SISJP_LINES!=='undefined'?SISJP_LINES:{};
  const D=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const T=(d,h)=>d*24+h, now=G=>G.day*24+(+G.hour||0);
  const law=G=>!!G&&!!G.flags&&(G.stage||'law')==='law';
  const route=G=>typeof STORY!=='undefined'&&STORY.route?STORY.route(G):null;
  const tz=(G,d)=>typeof STORY!=='undefined'&&STORY.tzOffset?(STORY.tzOffset(G,d)||0):0;
  const twH=(G,d,h)=>h+tz(G,d);   /* 臺灣時間 → 遊戲時鐘（人在日本 +1）*/
  S.dating=G=>{ const F=(G&&G.flags)||{}, R=F.romance||{}; return F['dating_'+ID]===true||!!(R[ID]&&R[ID].status==='dating'); };
  const isEx=G=>!S.dating(G)&&!!(G.flags&&(G.flags['EX_'+ID]||(typeof ROM!=='undefined'&&ROM.isEx&&ROM.isEx(G,ID))));
  const fri=()=>typeof SOCIAL!=='undefined'&&!!SOCIAL.STAGES&&!!SOCIAL.stage&&SOCIAL.STAGES.indexOf(SOCIAL.stage(ID))>=SOCIAL.STAGES.indexOf('FRIEND');
  const contact=G=>S.dating(G)||typeof INV==='undefined'||!INV.hasContact||INV.hasContact(G,ID);
  const sent=(G,tag)=>typeof PHONE!=='undefined'&&PHONE.sent(G,tag);
  const dm=t=>({th:'p:'+ID,from:ID,text:t});
  const plan=(G,o)=>{ if(typeof OUT==='undefined'||!OUT.plan||OUT.get(G,o.id)) return null; return OUT.plan(G,Object.assign({alarm:true},o)); };
  S.ok=G=>law(G)&&route(G)==='JP'&&!!(G.flags&&G.flags.met_sis)&&!isEx(G)&&(S.dating(G)||fri())&&contact(G);
  S.DAYS={hint:'2028-03-22',note:'2028-03-23',photo:'2028-03-24',eveAsk:'2028-07-31',eve:'2028-08-01'};
  S.V=['2028-04-09','2028-05-07','2028-06-18','2028-07-16'];

  /* ---------------- 第 1 節 ---------------- */
  S.preTalkDue=G=>{ const d=D(S.DAYS.note); return !!G&&d!=null&&G.day===d&&G.zone==='cafe'&&G.hour>=19.5&&G.hour<21.5&&G.flags.SIS_JP_NOTE==null&&S.ok(G); };
  S.preTalk=async function(GM){ const G=GM&&GM.G; if(!S.preTalkDue(G)||typeof EVENTS==='undefined'||!EVENTS.runLines||typeof STORY_EVENTS==='undefined') return false;
    const ev=STORY_EVENTS.find(e=>e.id==='ev_sis_jp_note'); if(!ev) return false;
    const R=G.events||(G.events={done:{},last:{},count:0}); R.done=R.done||{}; R.last=R.last||{}; R.done[ev.id]=(R.done[ev.id]|0)+1; R.last[ev.id]=G.day;   /* 先記（同 SISB4.preTalk）*/
    await EVENTS.runLines(ev.dialogue,ev); return true; };
  S.note=function(G){ const F=G.flags, h=D(S.DAYS.hint), p=D(S.DAYS.photo);
    if(h!=null&&G.day>=h&&G.day<=h+1&&now(G)<T(h+1,19.5)&&!sent(G,'sisjp_hint')&&F.SIS_JP_NOTE==null&&S.ok(G)) PHONE.at(G,h,21,[dm(L.hint)],'sisjp_hint');
    if(p!=null&&F.SIS_JP_NOTE==null&&now(G)>=T(p,9)&&G.day<=p+1&&S.ok(G)){ F.SIS_JP_NOTE='photo'; PHONE.at(G,p,9,L.notePhoto.map(dm),'sisjp_note_photo'); } };
  /* ---------------- 第 2 節 ---------------- */
  const busy=(G,d,h)=>typeof OUT!=='undefined'&&OUT.rec(G).some(q=>q.day===d&&q.state!=='missed'&&Math.abs(q.h-h)<1.5&&!/^sisjp_/.test(q.id));   /* 那一天 20:00 前後已經有出遊 */
  S.msgs=function(G){ const F=G.flags; if(!S.ok(G)) return; const M=L.msgs||[];
    for(let i=0;i<M.length;i++){ const tag=M[i].tag||('sisjp_m_'+i); if(sent(G,tag)) continue;   /* tag：中間插進來的那一則（AA_470 4-5 的 7/10）另外取，原本的照舊 */ const d0=D(M[i].day); if(d0==null||G.day<d0||G.day>d0+2) continue;
      const d=busy(G,d0,twH(G,d0,20))?d0+1:d0, h=twH(G,d,20); if(now(G)>T(d,h)+48) continue;
      if(PHONE.at(G,d,h,M[i].L.map(dm),tag)) F.SIS_JP_MSG=Math.max(F.SIS_JP_MSG|0,i+1); } };
  /* ---------------- 第 3 節 ---------------- */
  S.eve=function(G){ const F=G.flags, a=D(S.DAYS.eveAsk), d=D(S.DAYS.eve); if(a==null||d==null||F.SIS_JP_EVE!=null||!S.ok(G)) return;
    if(G.day>=a&&G.day<=a+1&&now(G)<T(d,twH(G,d,21))&&!sent(G,'sisjp_eve_ask')){ const M=[dm(L.eveAsk)]; M[0].ask={id:'sisjp_eve_ask',until:T(d,twH(G,d,21)),opts:[{t:L.eveYes,set:{SIS_JP_EVE_GO:true}},{t:L.eveNoT,set:{SIS_JP_EVE_GO:false},say:[{from:ID,text:L.eveNo}]}]};
      PHONE.at(G,a,twH(G,a,21),M,'sisjp_eve_ask'); }
    if(!sent(G,'sisjp_eve_ask')) return;
    if(F.SIS_JP_EVE_GO===false){ if(now(G)>=T(d,twH(G,d,21))&&G.day<=d+1&&!sent(G,'sisjp_eve_text')){ F.SIS_JP_EVE='text'; PHONE.at(G,d,twH(G,d,21),L.eveText.map(dm),'sisjp_eve_text'); } return; }
    if(G.day===d&&now(G)<T(d,twH(G,d,21)+1/3)) plan(G,{id:'sisjp_eve',ev:'ev_sis_jp_eve',day:d,h:twH(G,d,21),late:1/3,place:'視訊',verb:'接起來',no:'先不接',title:(S.dating(G)?'書瑀':'學姊')+'打視訊來',call:true,travel:'',travelH:0,back:'視訊結束。'}); };
  S.eveMissed=function(G,q){ const F=G.flags; if(F.SIS_JP_EVE==null) F.SIS_JP_EVE='missed'; const d=q?q.day:D(S.DAYS.eve); PHONE.at(G,d,twH(G,d,21+20/60),[dm(L.eveMissed)],'sisjp_eve_missed'); };
  /* ---------------- 第 5 節 ---------------- */
  S.vSet=G=>{ const q=typeof OUT!=='undefined'?OUT.rec(G).filter(x=>/^sisjp_v_/.test(x.id)&&x.sa).sort((a,b)=>b.day-a.day).find(x=>x.day<=G.day):null; return q?q.sa.set:0; };
  S.videos=function(G){ const F=G.flags; if(!S.dating(G)||!S.ok(G)) return;
    for(let i=(F.SIS_JP_V|0);i<S.V.length;i++){ const d=D(S.V[i]); if(d==null) continue; const h=twH(G,d,21); if(now(G)>=T(d,h)+1) { F.SIS_JP_V=i+1; continue; }   /* 過了（讀檔、跳過）＝不補 */
      if(G.day>=d-6){ if(plan(G,{id:'sisjp_v_'+i,ev:'ev_sis_jp_video',day:d,h,late:1,place:'視訊',verb:'接起來',no:'先不接',title:'和書瑀視訊（你那邊十點）',call:true,travel:'',travelH:0,back:'視訊結束。',sa:{set:i}})) F.SIS_JP_V=i+1; }
      break; } };
  S.vMissed=function(G,q){ PHONE.at(G,q.day,q.h+0.25,[dm(L.vMissed)],'sisjp_v_miss_'+((q.sa&&q.sa.set)|0)); };

  S.phone=function(G){ if(!G||!G.flags||!law(G)||typeof PHONE==='undefined') return; for(const f of [S.note,S.msgs,S.eve,S.videos]){ try{ f(G); }catch(e){ console.warn('SISJP phone',e); } } };
  if(typeof STORY!=='undefined'&&Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.phone(G));
  /* 說話前接演的掛勾：同 sis_b4_3d.js，再包一層——前面那幾段沒演，才問這裡 */
  if(typeof SISY23!=='undefined'&&typeof SISY23.preTalk==='function'&&!SISY23.preTalk._sisjp){ const p0=SISY23.preTalk;
    SISY23.preTalk=async function(GM){ const r=await p0.apply(this,arguments); return r||await S.preTalk(GM); }; SISY23.preTalk._sisjp=true; SISY23.preTalk._sisb4=p0._sisb4; }
  return S;
})();
