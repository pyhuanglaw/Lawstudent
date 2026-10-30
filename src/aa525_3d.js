/* ===== AA_525 說了沒發生（二）：子晴、沛珊、可昕（企劃線 claude/cool-heisenberg-o8kuqx 6081f725f，AA-C 2026-10-28；任務 HEROINE-LIFE-1028、USER_WANTS X122）=====
   原則照 AA_356：之後已經有的場合補一兩句；沒有場合的改原句；玩家選項先補旗標。台詞一字不差。
   這個檔只放「沒有現成的檔可以放」的三件（其他都改在各自的檔，註解寫 AA_525 x-x）：
   - 閒聊階梯選了哪一個（STORY.ladReply 包一層，同 sis_b14_3d.js、sis_b16_3d.js；src/data/ladder.js 只經 tools/ladder/import_ladder.py 重產，不手改）：
       子晴 Q2-L4「我會注意到。」→ ZQ_SAW_THIRD（2026-06-27 zq_play 多兩句，termend_lines.js C15）；
       可昕 K4-L5「下次換我挑。」→ KX_CAKE_YOU（2028-04-23 21:00 私訊多一句，r2y3b3d.js）；可昕 K2-L6「明年我們一起看。」→ KX_TASSEL_PROMISE（2027-04-24 生日到政大的版本開頭一句，y2r2_3d.js）。
   - 2-3 沛珊「她們有做卡片給你。我先收著。」（wzlines3d.js wz_p4_cards）：之後第一次和她說話（STORY.PRE_TALK），旁邊有她的人＝等她一個人（PRIVTALK 清單 ps_cards，保底 7 天、開頭一句旁白）。
       給過記 PS_CARDS_GIVEN（稿沒有寫旗標名：「之後第一次」要記下來才不會每次都給）。
   - 3-6 可昕 K-7「第一天下班，我打給妳。」（y2r2_3d.js KX_SUMMER 'call'）：2027-07-05（她實習第一天）還交往中＝18:00 手機一則系統字「今天是可昕實習第一天。」，
       18:00～23:00 之間可以打給她＝電話（出遊「打給她」，同 sis_b16_3d.js 12/25 那一通的做法；「先不打」或過了 23:00＝沒有後續）。
       人在國外（寒暑假的出國活動）：時間照時差換成當地時間（STORY.tzOffset，同 y34b3d.js tzH）。
   測試：node tests/aa525_promises_unit.js */
'use strict';
const AA525=(function(){
  const S={};
  if(typeof STORY==='undefined'||typeof STORY_EVENTS==='undefined') return S;
  const DK=k=>STORY.dayOfKey?STORY.dayOfKey(k):null, T=(d,h)=>d*24+h, NOW=G=>T(G.day,G.hour);
  const law=G=>!!G&&(G.stage||'law')==='law';
  const dating=(G,id)=>{ const F=(G&&G.flags)||{}, Rm=F.romance||{}; return F['dating_'+id]===true||!!(Rm[id]&&Rm[id].status==='dating'); };
  const sent=(G,t)=>typeof PHONE!=='undefined'&&!!PHONE.sent&&PHONE.sent(G,t);
  const tzH=(G,d,h)=>h+(STORY.tzOffset?(STORY.tzOffset(G,d)||0):0);
  const privOk=(G,x,GM,k,sub)=>typeof PRIVTALK==='undefined'||!PRIVTALK.ok||PRIVTALK.ok(G,x,k,GM,sub);
  const privLead=async(GM,k,x,sub)=>{ if(typeof PRIVTALK!=='undefined'&&PRIVTALK.lead) await PRIVTALK.lead(GM,k,x,sub); };

  /* ---------------- 閒聊階梯選了哪一個 ---------------- */
  S.LAD=[{who:'heroine_04',step:'Q2-L4',t:'「我會注意到。」',f:'ZQ_SAW_THIRD'},
    {who:'kexin',step:'K4-L5',t:'「下次換我挑。」',f:'KX_CAKE_YOU'},
    {who:'kexin',step:'K2-L6',t:'「明年我們一起看。」',f:'KX_TASSEL_PROMISE'}];
  S.onLad=function(G,st,ch,id){ if(!G||!G.flags||!st||!ch) return false; const x=S.LAD.find(r=>r.who===id&&r.step===st.id&&r.t===ch.t); if(!x) return false; if(G.flags[x.f]==null) G.flags[x.f]=G.day; return true; };
  if(typeof STORY.ladReply==='function'&&!STORY._aa525Lad){ const r0=STORY.ladReply;
    STORY.ladReply=function(st,ch,G,id){ try{ S.onLad(G,st,ch,id); }catch(e){ console.warn('AA525 lad',e); } return r0.apply(this,arguments); }; STORY._aa525Lad=true; }

  /* ---------------- 2-3 沛珊：課輔班的卡片 ---------------- */
  const PS='classmate_peishan';
  S.cardsDue=G=>law(G)&&!!G.flags&&G.flags.PS_CARDS_GIVEN==null&&sent(G,'wz_p4_cards');
  S.cards=async function(GM,who){ const G=GM.G; G.flags.PS_CARDS_GIVEN=G.day;
    await GM.say(null,'（她從包包拿出三張卡片。）'); await GM.say(who,'課輔班的！她們畫的你。……長得不太像。'); return true; };
  if(Array.isArray(STORY.PRE_TALK)&&!STORY._aa525Pre){ STORY.PRE_TALK.push(async(GM,who,id)=>{ const G=GM&&GM.G; if(id!==PS||!S.cardsDue(G)||!privOk(G,PS,GM,'ps_cards')) return; await privLead(GM,'ps_cards',PS); await S.cards(GM,who); }); STORY._aa525Pre=true; }

  /* ---------------- 3-6 可昕：實習第一天的電話 ---------------- */
  S.KX_CALL={day:'2027-07-05',h:18,until:23};
  S.KX_CALL_OUT={id:'aa525_kx_intern_call',ev:'ev_aa525_kx_intern_call',place:'電話',title:'打給可昕',verb:'打給她',no:'先不打',call:true,travel:'',travelH:0,back:'電話結束。',alarm:false};
  S.kxCallOk=G=>law(G)&&!!G.flags&&G.flags.KX_SUMMER==='call'&&dating(G,'kexin');
  S.phone=function(G){ if(!G||!G.flags||typeof PHONE==='undefined') return; const d=DK(S.KX_CALL.day); if(d==null||G.day!==d||!S.kxCallOk(G)) return;
    const h0=tzH(G,d,S.KX_CALL.h), h1=tzH(G,d,S.KX_CALL.until); if(h0<0||h1>24||G.hour<h0) return;
    if(!sent(G,'aa525_kx_intern_rem')) PHONE.at(G,d,h0,[{th:'sys',text:'今天是可昕實習第一天。'}],'aa525_kx_intern_rem');
    if(typeof OUT!=='undefined'&&OUT.plan&&OUT.get&&!OUT.get(G,S.KX_CALL_OUT.id)&&NOW(G)<T(d,h1)) OUT.plan(G,Object.assign({},S.KX_CALL_OUT,{day:d,h:Math.max(h0,+G.hour||0),late:Math.max(0,h1-Math.max(h0,+G.hour||0))})); };
  if(Array.isArray(STORY.PHONE_RULES)&&!STORY._aa525Phone){ STORY.PHONE_RULES.push(G=>{ try{ S.phone(G); }catch(e){ console.warn('AA525 phone',e); } }); STORY._aa525Phone=true; }
  if(!STORY_EVENTS.some(e=>e&&e.id==='ev_aa525_kx_intern_call'))
    STORY_EVENTS.push({ id:'ev_aa525_kx_intern_call', title:'實習第一天', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.25, kxAway:true,   /* 通話多久稿沒寫：算 15 分鐘（同 sis_b16 白天的電話）*/
      dialogue:[ {scene:'電話'},
        {speaker:'kexin',expression:'surprised',text:'……喂。你真的打了。'},
        {speaker:'kexin',expression:'tired',text:'影印了一整天。'},
        {speaker:'kexin',expression:'teasing',text:'影印機我取了名字。叫債務人。'} ] });   /* 「債務人」照 BB_107（大二暑假實習第一天被叫去影印八百頁）*/
  return S;
})();
if(typeof window!=='undefined') window.AA525=AA525;
