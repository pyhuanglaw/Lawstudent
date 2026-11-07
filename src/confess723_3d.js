/* ===== 告白第一次失敗、再約幾次還能告白（AA_723 confess，src/data/aa723.js；AA723-CONFESS-PS-1107）=====
   使用者 11-07 10:4x 回 AA（Q2）：「應該還是要準備一個第一次失敗然你們還是朋友 然後要有再約幾次還是能告白的選項啦」。
   - 條件照舊（期末回家路上告白、date3d.js canConfess）；條件都到了、玩家告白時看 heart：她 AA_719 key 那幾個決定的分數加起來（AA723.confess.heart；沒演到、過了那天才到的＝0）。
     第一次：heart ≥ 1＝照原本成功；≤ -1＝失敗；0＝看當時信任（DECIDE.trustHi：hi 成功、lo 失敗）。
   - 失敗：演 fail（她的話），階段、好感都不降；記 G.flags.CONF_FAIL[人]＝{day, cnt（那時正式約會的次數）}。下一次見面（約好的見面開場、當面說話）她先說 normal。
   - 再告白：失敗以後再正式約會 2 次（DATE 的計數）而且過了 14 天——第 2 次約會結束時她說 ready，告白的選項出現（「（告訴她）／（今天先不說）」；先不說＝下一次約會結尾再問）；
     第二次一定成功：先接她的 second，再照原本告白那一場（DATE.confess，confessDecide 這一次回 yes）。期末回家路上告白也一樣（已經說過 ready 或條件到了＝second＋答應）。
   - 學姊 preexam／prerank 照原本（時間點，不算第一次失敗）；她先開口的那一條（termend h.she）不看 heart。
   存檔：G.flags.CONF_FAIL＝{人:{day,cnt,normal?,ready?,done?}}；舊存檔沒有＝沒失敗過。測試：node tests/confess723_unit.js */
'use strict';
const CF723=(function(){
  const S={};
  const D=()=>(typeof AA723!=='undefined'&&AA723.confess)||null;
  const F=G=>G.flags||(G.flags={});
  S.has=id=>!!(D()&&D().lines&&D().lines[id]);
  S.lines=(id,k)=>((D()&&D().lines[id])||{})[k]||[];
  S.rec=G=>{ const f=F(G); if(!f.CONF_FAIL||typeof f.CONF_FAIL!=='object') f.CONF_FAIL={}; return f.CONF_FAIL; };
  S.get=(G,id)=>{ const c=G&&G.flags&&G.flags.CONF_FAIL; return c&&c[id]||null; };
  const keyOf=did=>((typeof DECIDE_RULES!=='undefined'&&DECIDE_RULES.keys)||[]).find(k=>k.id===did)||null;
  const datesOf=(G,id)=>typeof DATE!=='undefined'&&DATE.log?(DATE.log(G,id).count|0):0;
  /* heart：每一個決定拍找最具體的那一格（值@說法+信任 → 值@說法 → 值+信任 → 值）；沒演到（沒有紀錄、late）＝0 */
  S.heart=function(G,id){ const H=((D()&&D().heart)||{})[id]||{}, R=(G.flags&&G.flags.DECIDE&&G.flags.DECIDE[id])||{}; let sum=0;
    for(const did in H){ const K=keyOf(did); if(!K) continue; const r=R[K.key]; if(r==null||(typeof r==='object'&&r.late)) continue;
      const v=typeof r==='object'?r.v:r, st=typeof r==='object'?r.stance:null, rule=typeof r==='object'&&r.rule!=null?(K.rules||[])[r.rule]:null;
      const hi=typeof r==='object'&&r.hi!=null?!!r.hi:(rule&&rule.trust==='hi'?true:(rule&&rule.trust==='lo'?false:null));
      const cands=Object.entries(H[did]).map(([k,s])=>{ const m=/^([a-z_]+)(?:@([a-z]+))?(?:\+(hi|lo))?$/.exec(k); return m?{v:m[1],st:m[2]||null,tr:m[3]||null,s}:null; }).filter(Boolean)
        .filter(c=>c.v===v&&(!c.st||c.st===st)&&(!c.tr||(hi!=null&&(c.tr==='hi')===hi))).sort((a,b)=>(!!b.st+!!b.tr)-(!!a.st+!!a.tr));
      if(cands.length) sum+=cands[0].s|0; }
    return sum; };
  /* 第一次告白：'yes'／'fail' */
  S.first=function(G,id){ const h=S.heart(G,id); if(h>=1) return 'yes'; if(h<=-1) return 'fail'; const hi=typeof DECIDE!=='undefined'&&DECIDE.trustHi?DECIDE.trustHi(G,id):true; return hi?'yes':'fail'; };
  S.retryOk=function(G,id){ const c=S.get(G,id); return !!c&&!c.done&&(G.day-(c.day|0))>=14&&(datesOf(G,id)-(c.cnt|0))>=2; };
  /* 期末回家路上（termend3d.js _walkHome）玩家告白：null＝照原本；'yes'＝第一次成功；'fail'＝演了 fail；'pending'＝失敗過、條件還沒到（演了「還沒」）；'second'＝演了 second（接著照原本答應）*/
  S.termDecide=async function(GM,who,run){ const G=GM.G; if(!S.has(who)) return null; const c=S.get(G,who);
    if(c&&!c.done){ if(!(c.ready||S.retryOk(G,who))){ await run(GM,who,S.lines(who,'pending')); return 'pending'; }   /* 失敗以後、還沒約滿 2 次或沒過 14 天就又告白（期末回家路上）：pending（AA-B 11-07 13:42 21e9f6c50；不算數、不重新起算、不答應；不用 notYet——那是告白條件還沒到的那句）*/
      await run(GM,who,S.lines(who,'second')); c.done=G.day; return 'second'; }
    if(c&&c.done) return null;
    if(S.first(G,who)==='yes') return 'yes';
    await run(GM,who,S.lines(who,'fail')); S.fail(G,who); return 'fail'; };
  S.fail=function(G,id){ const R=S.rec(G); if(!R[id]) R[id]={day:G.day,cnt:datesOf(G,id)}; return R[id]; };
  /* 失敗以後下一次見面（隔天起）：她先說 normal（一次）*/
  S.normalDue=(G,id)=>{ const c=S.get(G,id); return !!c&&!c.normal&&!c.done&&G.day>(c.day|0); };
  const say=async(GM,who,id,L)=>{ for(const t of L){ const nar=/^（/.test(t); await GM.say(nar?null:who,t); } };
  S.normalSay=async function(GM,who,id){ const G=GM&&GM.G; if(!G||!S.normalDue(G,id)) return false; await say(GM,who,id,S.lines(id,'normal')); S.get(G,id).normal=G.day; return true; };
  /* 正式約會的結尾（DATE.confessOffer 之前）：失敗以後第 2 次約會、過了 14 天＝她說 ready（一次），告白的選項出現 */
  S.retryOffer=async function(GM,t){ const G=GM.G, id=t&&t.who; if(!id||!S.has(id)) return null; const c=S.get(G,id); if(!c||c.done) return null;
    if(!c.ready){ if(!S.retryOk(G,id)) return null; const me={name:typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(id):id,charId:id}; await say(GM,me,id,S.lines(id,'ready')); c.ready=G.day; }
    const k=await GM.choose([{t:'（告訴她）'},{t:'（今天先不說）'}]); if(k!==0) return false;
    const me={name:typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(id):id,charId:id}; await say(GM,me,id,S.lines(id,'second')); c.done=G.day; c.second=1;
    const cc=typeof DATE!=='undefined'&&DATE.canConfess?DATE.canConfess(G,id):{ok:true}; return DATE.confess(GM,id,Object.assign({},cc,{ok:true,decline:null}),t); };
  S.install=function(){
    if(typeof DATE!=='undefined'&&DATE.confessOffer&&!DATE.confessOffer._cf723){ const O0=DATE.confessOffer; const O1=async function(GM,t){ const r=await S.retryOffer(GM,t); if(r!==null) return r; return O0.apply(this,arguments); }; O1._cf723=true; DATE.confessOffer=O1; }
    if(typeof DATE!=='undefined'&&DATE.confessDecide&&!DATE.confessDecide._cf723){ const C0=DATE.confessDecide; const C1=function(G,id){ const c=S.get(G,id); if(c&&c.second&&c.done===G.day) return 'yes'; return C0.apply(this,arguments); }; C1._cf723=true; DATE.confessDecide=C1; }   /* 第二次告白一定成功（AA_723）*/
    if(typeof INV!=='undefined'&&INV.meetOpen&&!INV.meetOpen._cf723){ const M0=INV.meetOpen; const M1=async function(GM,iv,who,o){ const r=await M0.apply(this,arguments); try{ await S.normalSay(GM,who,iv&&iv.who); }catch(e){ console.warn('CF723.normalSay',e); } return r; }; M1._cf723=true; Object.keys(M0).forEach(k=>{ if(k!=='_cf723') M1[k]=M0[k]; }); INV.meetOpen=M1; }
    if(typeof STORY!=='undefined'&&Array.isArray(STORY.PRE_TALK)&&!STORY.PRE_TALK.includes(S.normalSay)) STORY.PRE_TALK.push(S.normalSay); };
  S.install();
  return S;
})();
