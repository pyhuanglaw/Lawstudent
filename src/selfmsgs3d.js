/* 女主角主動傳、講她自己生活的訊息（HEROINE-LIFE-1028；AA_1029～AA_1032，資料 src/data/self_msgs.js，匯入 tools/story/import_self_msgs.py）。
   起因（BB-B 實玩 HL2／HL3，BB_468）：學姊大一上傳的 17 則全是回答學弟；大一上 10/8～11/3 連續 25 天沒有一位女主角傳訊息。
   - 家族群組（g:family_law）的：在群組裡的玩家都收得到，不看關係階段；帳號名稱照現有（Kevin、溫學姊）。
   - 私訊的：那個階段（FAMILIAR／FRIEND）以上、前一天以前就有她的聯絡方式；前任不送（V6EX.noContact）。沒交往也收得到。
   - 日子：稿上有日期的照日期；只有學期、週次、星期的用 STORY.termDay。那一天一開始就排好、到時間才出現（PHONE.at）；晚兩天以上才輪到的不補。
   - 第 2 則（學姊的橘子）有兩個回覆選項：到隔天 12:00 都回得了，沒回不扣分；回了她回一兩句（一字照稿）。
   - 句子一字不改；每則只發一次（tag＝self_<id>）。 */
const SELFMSG=(function(){
  const S={};
  const D=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const TD=(t,w,wd)=>typeof STORY!=='undefined'&&STORY.termDay?STORY.termDay(t,w,wd):null;
  const T=(d,h)=>d*24+h;
  const law=G=>!!G&&(G.stage||'law')==='law';
  const inGrp=(G,g)=>typeof PHONE!=='undefined'&&!!PHONE.inGroup&&PHONE.inGroup(G,g);
  const knows=(id,G)=>typeof STORY!=='undefined'&&!!STORY.knows&&STORY.knows(id,G);
  const stageAt=(id,lv)=>typeof SOCIAL!=='undefined'&&!!SOCIAL.STAGES&&SOCIAL.STAGES.indexOf(SOCIAL.stage(id))>=SOCIAL.STAGES.indexOf(lv);
  const contact=(G,id,day)=>{ if(typeof INV==='undefined'||!INV.hasContact||!INV.hasContact(G,id)) return false; const c=G.contacts&&G.contacts[id]; return c==null||c<day; };
  const ex=(G,id)=>typeof V6EX!=='undefined'&&!!V6EX.noContact&&V6EX.noContact(G,id);
  const NAMES={kevin:'Kevin',heroine_05:'溫學姊'};   /* 家族群組的帳號名稱（同 y1fill3d.js kevin_parrot）*/
  S.LIST=typeof SELF_MSGS!=='undefined'?SELF_MSGS.msgs:[];
  S.tag=m=>'self_'+m.id;
  S.dayOf=m=>m.day?D(m.day):TD(m.term,m.week,m.wd);
  S.ok=function(G,m,d){ if(m.need==='group') return inGrp(G,'family_law'); return knows(m.who,G)&&stageAt(m.who,m.need)&&contact(G,m.who,d)&&!ex(G,m.who); };
  S.items=function(m,d){ const grp=m.need==='group';
    const M=m.ms.map(([from,text],k)=>Object.assign({th:m.th,from,text},grp&&NAMES[from]?{name:NAMES[from]}:{},k?{dt:k/60}:{}));
    if(m.ask){ M[M.length-1].ask={id:S.tag(m),until:T(d+m.ask.untilDay,m.ask.untilH),opts:m.ask.opts.map(o=>({t:o.t,say:o.r.map(([from,text])=>Object.assign({from,text},NAMES[from]?{name:NAMES[from]}:{}))}))}; }
    return M; };
  S.phone=function(G){ if(!G||!G.flags||!law(G)||typeof PHONE==='undefined') return;
    for(const m of S.LIST){ const tag=S.tag(m); if(PHONE.sent(G,tag)) continue; const d=S.dayOf(m); if(d==null||G.day<d||G.day>d+1||!S.ok(G,m,d)) continue;
      S.items(m,d).forEach((it,j)=>{ const x=Object.assign({},it), dt=x.dt||0; delete x.dt; PHONE.at(G,d,m.h+dt,[x],j?tag+'_'+j:tag); }); } };
  if(typeof STORY!=='undefined'&&Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>{ try{ S.phone(G); }catch(e){ console.warn('SELFMSG phone',e); } });
  return S;
})();
