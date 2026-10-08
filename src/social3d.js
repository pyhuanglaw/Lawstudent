/* ===== SOCIAL：關係（多維度）、階段、NPC 記憶、揭露階段、教授紀錄、社會圖、研究所志向 =====
   存檔位置：G.social = {rel:{id:{fam,trust,aff,resp,comf,rom,npcRom,seen,talked}}, mem:{id:[{tag,day,note}]}, reveal:{id:stage}, prof:{id:{perf,part,office,research,rep}}, grad:{interest,field,prep}}
   玩家看到的是「這個人記得什麼」，不是數字（數字只在底層）。 */
'use strict';
const SOCIAL = (function(){
  const S={}; let G=null;
  const DIMS=['fam','trust','aff','resp','comf','rom'];
  S.STAGES=['STRANGER','ACQUAINTANCE','FAMILIAR','FRIEND','CLOSE_FRIEND','POSSIBLE_ROMANTIC_INTEREST','ROMANTIC_TENSION','RELATIONSHIP'];
  S.bind=function(g){ G=g; if(!G.social) G.social={rel:{},mem:{},reveal:{},prof:{},grad:{interest:'NONE',field:null,prep:0}}; // 舊版 G.rel（單一數字）→ familiarity
    if(G.rel){ for(const id in G.rel){ const map={an:'heroine_01',sis:'heroine_05'}; const cid=map[id]||id; const r=S.rel(cid); if(!r._migrated){ r.fam=Math.max(r.fam,G.rel[id]); r.trust=Math.max(r.trust,Math.round(G.rel[id]*0.6)); r._migrated=true; } } } return G.social; };
  S.rel=function(id){ const R=G.social.rel; if(!R[id]) R[id]={fam:0,trust:0,aff:0,resp:0,comf:0,rom:0,npcRom:0,seen:0,talked:0}; return R[id]; };
  // 調整維度：delta 物件 {fam:+3,trust:+2,...}；不顯示數字給玩家
  S.adjust=function(id,delta,why){ const r=S.rel(id); for(const k in delta){ if(k in r||DIMS.includes(k)||k==='npcRom'){ r[k]=Math.max(0,Math.min(100,(r[k]||0)+delta[k])); } } if(why) S.remember(id,'ADJUST',why); return r; };
  S.stage=function(id){ const r=S.rel(id); const flags=G.flags||{}; if(flags['dating_'+id]) return 'RELATIONSHIP'; if(r.rom>=55&&r.npcRom>=45&&r.fam>=55) return 'ROMANTIC_TENSION'; if((r.rom>=30||r.npcRom>=30)&&r.fam>=45&&r.trust>=30) return 'POSSIBLE_ROMANTIC_INTEREST'; if(r.fam>=60&&r.trust>=45&&r.comf>=40) return 'CLOSE_FRIEND'; if(r.fam>=40&&r.trust>=25) return 'FRIEND'; if(r.fam>=20) return 'FAMILIAR'; if(r.fam>=5) return 'ACQUAINTANCE'; return 'STRANGER'; };
  // ---- NPC 記憶 ----
  S.remember=function(id,tag,note){ const M=G.social.mem; if(!M[id]) M[id]=[]; if(tag!=='ADJUST'&&M[id].some(m=>m.tag===tag&&m.day===G.day)) return; M[id].push({tag,day:G.day,note:note||''}); if(M[id].length>80) M[id].splice(0,M[id].length-80); };
  S.has=function(id,tag){ const M=G.social.mem[id]; return !!(M&&M.some(m=>m.tag===tag)); };
  S.lastDay=function(id,tag){ const M=G.social.mem[id]; if(!M) return -1; let d=-1; for(const m of M) if(m.tag===tag) d=Math.max(d,m.day); return d; };
  S.memories=function(id){ return (G.social.mem[id]||[]).filter(m=>m.tag!=='ADJUST'); };
  // ---- 揭露階段（不熟的人）：UNKNOWN → RECOGNIZABLE → ACQUAINTANCE → FRIEND ----
  S.reveal=function(id){ return G.social.reveal[id]||'UNKNOWN'; };
  S.noticed=function(id){ const r=S.rel(id); r.seen++; if(S.reveal(id)==='UNKNOWN'&&r.seen>=3) G.social.reveal[id]='RECOGNIZABLE'; };
  S.talkedTo=function(id){ const r=S.rel(id); r.talked++; if(['UNKNOWN','RECOGNIZABLE'].includes(S.reveal(id))) G.social.reveal[id]='ACQUAINTANCE'; if(r.fam<5) r.fam=5; const st=S.stage(id); if(st==='FRIEND'||st==='CLOSE_FRIEND') G.social.reveal[id]='FRIEND'; };
  // 顯示名稱：依揭露階段
  S.displayName=function(id){ const c=CHARACTERS[id]; if(!c) return id; const rv=S.reveal(id); if(c.social_layer==='B'){ if(rv==='UNKNOWN') return (c.year? '法律系'+['','一','二','三','四'][c.year]+'年級的'+(c.gender==='f'?'女生':'男生') : '法律系學生'); if(rv==='RECOGNIZABLE') return c.descriptor; return c.name; } if(c.social_layer==='D'&&rv==='UNKNOWN'&&!S.has(id,'FIRST_MET')) return c.gender==='f'?'不認識的女生':'不認識的男生'; return c.name; };
  S.meet=function(id,where){ if(!S.has(id,'FIRST_MET')){ S.remember(id,'FIRST_MET',where||''); G.social.reveal[id]=G.social.reveal[id]==='UNKNOWN'?'ACQUAINTANCE':G.social.reveal[id]; if(G.flags) G.flags['met_'+id]=true; } S.talkedTo(id); };
  // ---- 教授 ----
  S.prof=function(id){ const P=G.social.prof; if(!P[id]) P[id]={perf:0,part:0,office:0,research:0,rep:0,notes:[]}; return P[id]; };
  S.profEvent=function(id,kind,delta,note){ const p=S.prof(id); p[kind]=Math.max(0,Math.min(100,(p[kind]||0)+delta)); if(note){ p.notes.push({day:G.day,note}); if(p.notes.length>30) p.notes.shift(); } S.remember(id,kind.toUpperCase(),note); };
  S.profKnowsYou=function(id){ const p=S.prof(id); return p.part+p.perf+p.office*2+p.research>=20; };
  // ---- 社會圖 ----
  S.linksOf=function(id){ return SOCIAL_GRAPH.filter(e=>e.a===id||e.b===id).map(e=>({other:e.a===id?e.b:e.a,type:e.type})); };
  S.link=function(a,b){ const e=SOCIAL_GRAPH.find(e=>(e.a===a&&e.b===b)||(e.a===b&&e.b===a)); return e?e.type:null; };
  // ---- 研究所志向：NONE→CURIOUS→CONSIDERING→PREPARING→APPLYING→ADMITTED ----
  S.GRAD=['NONE','CURIOUS','CONSIDERING','PREPARING','APPLYING','ADMITTED'];
  S.gradBump=function(reason,field){ const g=G.social.grad; const i=S.GRAD.indexOf(g.interest); g.log=g.log||[]; g.log.push({day:G.day,reason}); if(field&&!g.field) g.field=field; if(i<2&&g.log.length>=(i+1)*2){ g.interest=S.GRAD[i+1]; return true; } return false; };
  S.gradSet=function(stage,field){ const g=G.social.grad; g.interest=stage; if(field) g.field=field; };
  // ---- 玩家可讀的摘要（人物面板用；不顯示數字）----
  S.describe=function(id){ const c=CHARACTERS[id]; if(!c) return ''; const st=S.stage(id); const label={STRANGER:'還不認識',ACQUAINTANCE:'認識',FAMILIAR:'有點熟',FRIEND:'朋友',CLOSE_FRIEND:'好朋友',POSSIBLE_ROMANTIC_INTEREST:'……有點在意',ROMANTIC_TENSION:'說不清楚的關係',RELATIONSHIP:'在一起'}[st]; const mems=S.memories(id).slice(-4).map(m=>MEMORY_LABEL[m.tag]?MEMORY_LABEL[m.tag]+(m.note?'（'+m.note+'）':''):null).filter(Boolean); return label+(mems.length?' · '+mems.join('、'):''); };
  const MEMORY_LABEL={FIRST_MET:'第一次見面',SHARED_CLASS:'一起上課',SHARED_MEAL:'一起吃飯',STUDIED_TOGETHER:'一起讀書',HELPED:'幫過忙',REFUSED_HELP:'你拒絕過',ARGUED:'吵過',APOLOGIZED:'道過歉',SHARED_SECRET:'說過秘密',SHARED_UMBRELLA:'共撐一把傘',MISSED_DINNER:'放過鴿子',HELPED_WITH_REPORT:'幫她寫報告',STUDIED_ALL_NIGHT:'一起熬夜',ARGUED_ABOUT_CAREER:'為未來吵過',GRAD_SCHOOL_DISCUSSION:'聊過研究所',BAR_EXAM_DISCUSSION:'聊過國考',WALKED_TOGETHER:'一起走過校園',CAFE_AFTERNOON:'咖啡廳的下午',LIBRARY_AFTERNOON:'總圖的下午',DECLINED_INVITE:'你拒絕過邀約',CLASS_ANSWER_GOOD:'看過你答得很好',CLASS_ANSWER_BAD:'看過你被電',LENT_NOTES:'借過筆記',INVITED_CLUB:'邀你進社團',TALKED_FAMILY:'聊過家裡的事',RAIN_LIBRARY:'雨天圖書館門口',LATE_NIGHT_TALK:'深夜聊過',PLAYER_ASKED_QUESTION:'你問過她問題',CONFESSION:'告白',DATING:'交往',BREAKUP:'分手',EXAM_RESULT:'考試結果',GRAD_SCHOOL_RESULT:'放榜',IMPORTANT_CONVERSATION:'重要的對話'};
  S.MEMORY_LABEL=MEMORY_LABEL;
  return S;
})();
