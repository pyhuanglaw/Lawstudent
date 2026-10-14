/* ===== SOCIAL：關係（多維度）、階段、NPC 記憶、揭露階段、教授紀錄、社會圖、研究所志向 =====
   存檔位置：G.social = {rel:{id:{fam,trust,aff,resp,comf,rom,npcRom,seen,talked}}, mem:{id:[{tag,day,note}]}, reveal:{id:stage}, prof:{id:{perf,part,office,research,rep}}, grad:{interest,field,prep}}
   玩家看到的是「這個人記得什麼」，不是數字（數字只在底層）。 */
'use strict';
const SOCIAL = (function(){
  const S={}; let G=null;
  const DIMS=['fam','trust','aff','resp','comf','rom'];
  S.STAGES=['STRANGER','ACQUAINTANCE','FAMILIAR','FRIEND','CLOSE_FRIEND','POSSIBLE_ROMANTIC_INTEREST','ROMANTIC_TENSION','RELATIONSHIP'];
  S.bind=function(g){ G=g; if(!G.social) G.social={rel:{},mem:{},reveal:{},prof:{},grad:{interest:'NONE',field:null,prep:0}}; // 舊版 G.rel（單一數字）→ familiarity
    if(G.rel){ for(const id in G.rel){ const map={an:'heroine_01',sis:'heroine_05'}; const cid=map[id]||id; const r=S.rel(cid); if(!r._migrated){ r.fam=Math.max(r.fam,G.rel[id]); r.trust=Math.max(r.trust,Math.round(G.rel[id]*0.6)); r._migrated=true; } }
      /* 2026-10-13 之前的存檔：第一、二天劇情加在 G.rel 的關係沒有進來（game3d.js 的 rel 現在兩邊一起加）——補一次（只補一次：之後關係變淡不會又被拉回來）*/
      if(!G.social._relSync){ for(const id in G.rel){ const map={an:'heroine_01',sis:'heroine_05'}; const r=S.rel(map[id]||id); r.fam=Math.max(r.fam,G.rel[id]); r.trust=Math.max(r.trust,Math.round(G.rel[id]*0.6)); } G.social._relSync=1; } } return G.social; };
  S.rel=function(id){ const R=G.social.rel; if(!R[id]) R[id]={fam:0,trust:0,aff:0,resp:0,comf:0,rom:0,npcRom:0,seen:0,talked:0}; return R[id]; };
  // 調整維度：delta 物件 {fam:+3,trust:+2,...}；不顯示數字給玩家
  S.adjust=function(id,delta,why){ const r=S.rel(id); for(const k in delta){ if(k in r||DIMS.includes(k)||k==='npcRom'){ const v0=r[k]||0; r[k]=Math.max(0,Math.min(100,v0+delta[k])); if(S.feelOn&&r[k]>v0&&FEEL_TEXT[k]){ if(!(id in S.feelStage)) S.feelStage[id]=S.stage(id,{before:{k,v0}}); const P=S.feel[id]||(S.feel[id]={}); P[k]=(P[k]||0)+(r[k]-v0); } } } if(why) S.remember(id,'ADJUST',why); return r; };
  /* 關係有前進時的畫面提示（2026-10-14 使用者試玩 v9.6：「約了朋友…是不是沒有增加好感？在咖啡廳遇到溫學姊跟他講話好像也沒有增進什麼感情」——數值有加，但畫面上什麼都沒有）。
     只在劇情／對話進行中（GAME 的 sceneBegin～sceneEnd，feelOn）記下增加的部分，對話結束時（takeFeel）每人一句，一次最多兩人；
     戀愛（rom）不顯示（她們不是攻略對象，CLAUDE.md 第 9 條）；還不知道名字的人不顯示。加多少由企劃訂（AA），這裡只負責讓玩家看得到。*/
  /* 文字、規則照 AA_124 第 1-4 節：一行、挑加最多的那一項（同樣多：信任＞自在＞熟悉）；換階段（有點熟、朋友、好朋友）優先；不顯示數字；
     那一天第一次因為上限什麼都沒加（S.activity）時「今天和○○已經聊很多了。」 */
  const FEEL_TEXT={fam:n=>'和'+n+'熟了一點。',trust:n=>n+'好像更信任你了一點。',comf:n=>'和'+n+'在一起，比之前自在。'};
  const FEEL_ORDER=['trust','comf','fam'];
  const STAGE_RANK={STRANGER:0,ACQUAINTANCE:1,FAMILIAR:2,FRIEND:3,CLOSE_FRIEND:4}, STAGE_LINE={FAMILIAR:n=>'你和'+n+'有點熟了。',FRIEND:n=>'你和'+n+'變成朋友了。',CLOSE_FRIEND:n=>'你和'+n+'變成好朋友了。'};
  S.feel={}; S.feelOn=false; S.feelStage={}; S.capNotes=[];
  S.takeFeel=function(max){ const out=[]; const ids=new Set([...Object.keys(S.feel),...S.capNotes]);
    for(const id of ids){ const P=S.feel[id]||{}; if(!CHARACTERS[id]) continue;
      const heroine=/^heroine_0[1-5]$/.test(id), known=S.has(id,'FIRST_MET')||(!heroine&&S.reveal(id)!=='UNKNOWN'); if(!known) continue;   /* 還沒認識的人（女主角要正式見過）不顯示 */
      const name=heroine&&CHARACTERS[id].nickname||S.displayName(id), sum=FEEL_ORDER.reduce((a,q)=>a+(P[q]||0),0);
      const st0=S.feelStage[id], st1=S.stage(id); if(st0!==undefined&&STAGE_LINE[st1]&&(STAGE_RANK[st1]||0)>(STAGE_RANK[st0]||0)){ out.push({text:STAGE_LINE[st1](name),sum:1000+sum}); continue; }   /* 換階段優先 */
      let k=null; for(const q of FEEL_ORDER) if((P[q]||0)>0&&(!k||P[q]>P[k])) k=q; if(k) out.push({text:FEEL_TEXT[k](name),sum});
      else if(S.capNotes.includes(id)){ out.push({text:'今天和'+name+'已經聊很多了。',sum:0}); const D=G.social&&G.social.daily; if(D&&D.p[id]) D.p[id].cap=1; } }   /* 真的顯示了才算（一天一次）*/
    S.feel={}; S.feelStage={}; S.capNotes=[]; out.sort((a,b)=>b.sum-a.sum); return out.slice(0,max||2).map(o=>o.text); };
  /* 日常活動加多少（AA_124 第 1-2、1-3 節，AA 決定）：同一個人、同一種活動一天只算一次；同一個人一天最多熟悉 +6、信任 +4、自在 +5；事件照事件自己的數值，不走這裡、不受上限；
     日常不加戀愛。kind：chat 聊天（今天第一次）、chatNew 聽到新的一句、classmate 上課坐旁邊、cafe、library、meal、walk、help、acceptInvite（答應對方約的而且赴約）*/
  const ACT={chat:{fam:2},chatNew:{comf:1},classmate:{fam:1},cafe:{fam:3,trust:1,comf:2},library:{fam:3,trust:2,comf:1},meal:{fam:3,trust:1,comf:3},walk:{fam:4,trust:2,comf:3},help:{fam:1,trust:3},acceptInvite:{trust:1}};
  const CAP={fam:6,trust:4,comf:5};
  S.ACT=ACT; S.CAP=CAP;
  S.activity=function(id,kind){ const A=ACT[kind]; if(!A||!G||!G.social) return null; const day=G.day|0; const D=G.social.daily&&G.social.daily.day===day?G.social.daily:(G.social.daily={day,p:{}});
    const P=D.p[id]||(D.p[id]={acts:{},fam:0,trust:0,comf:0,cap:0}); if(P.acts[kind]) return {};   /* 同一種活動一天一次 */ P.acts[kind]=1;
    const add={}; let capped=false; for(const k in A){ const v=Math.max(0,Math.min(A[k],CAP[k]-(P[k]||0))); if(v<A[k]) capped=true; if(v>0){ add[k]=v; P[k]+=v; } }
    if(Object.keys(add).length) S.adjust(id,add); else if(capped&&!P.cap&&S.feelOn&&!S.capNotes.includes(id)) S.capNotes.push(id);   /* 這一次因為上限什麼都沒加（玩家會以為壞掉）：那一天第一次才提示 */ return add; };
  S.stage=function(id,o){ let r=S.rel(id); if(o&&o.before){ r=Object.assign({},r); r[o.before.k]=o.before.v0; } const flags=G.flags||{}; if(flags['dating_'+id]) return 'RELATIONSHIP'; if(r.rom>=55&&r.npcRom>=45&&r.fam>=55) return 'ROMANTIC_TENSION'; if((r.rom>=30||r.npcRom>=30)&&r.fam>=45&&r.trust>=30) return 'POSSIBLE_ROMANTIC_INTEREST'; if(r.fam>=60&&r.trust>=45&&r.comf>=40) return 'CLOSE_FRIEND'; if(r.fam>=40&&r.trust>=25) return 'FRIEND'; if(r.fam>=20) return 'FAMILIAR'; if(r.fam>=5) return 'ACQUAINTANCE'; return 'STRANGER'; };
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
  /* 不熟同學（pool_*）顯示的年級跟著遊戲走（AA_120 7-3）：資料上的 year 是玩家大一時的年級，玩家每升一年他們也升一年（大四封頂）；放假期間照上一個學期算 */
  S.playerYear=function(){ const t=typeof STORY!=='undefined'&&STORY.termAt?STORY.termAt(G.day):(typeof CALENDAR!=='undefined'&&CALENDAR.termOf(G.day)?CALENDAR.termOf(G.day).id:null); const m=/^Y([1-4])/.exec(t||''); return m?+m[1]:1; };
  S.yearOf=function(id){ const c=CHARACTERS[id]; if(!c||!c.year) return 0; if(!/^pool_/.test(id)) return c.year; return Math.min(4,c.year+S.playerYear()-1); };
  S.displayName=function(id){ const c=CHARACTERS[id]; if(!c) return id; const rv=S.reveal(id); if(c.social_layer==='B'){ if(rv==='UNKNOWN') return (c.year? '法律系'+['','一','二','三','四'][S.yearOf(id)]+'年級的'+(c.gender==='f'?'女生':'男生') : '法律系學生'); if(rv==='RECOGNIZABLE') return c.descriptor; return c.name; } if(c.social_layer==='D'&&rv==='UNKNOWN'&&!S.has(id,'FIRST_MET')) return c.gender==='f'?'不認識的女生':'不認識的男生'; return c.name; };
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
  /* 停用的事件（events.js 的 retired，例：書記官那一段 ev_an_mother）留下的記憶：人物面板只寫標籤（「聊過家裡的事」），不寫舊備註；存檔不改（AA 2026-10-14）*/
  let retiredNotes=null;
  S.noteShown=function(id,m){ if(!m||!m.note) return ''; if(!retiredNotes){ retiredNotes={}; const add=x=>{ if(x&&x.npc&&x.note) (retiredNotes[x.npc]||(retiredNotes[x.npc]=new Set())).add(x.tag+'|'+x.note); };
      if(typeof STORY_EVENTS!=='undefined') for(const e of STORY_EVENTS){ if(!e.retired) continue; for(const x of ((e.consequences&&e.consequences.mem)||[])) add(x); for(const l of (e.dialogue||[])) for(const c of ((l&&l.choice)||[])){ for(const x of (c.mem||[])) add(x); for(const x of ((c.consequences&&c.consequences.mem)||[])) add(x); } } }
    const r=retiredNotes[id]; if(r&&r.has(m.tag+'|'+m.note)) return ''; const rn=NOTE_RENAMED[id]&&NOTE_RENAMED[id][m.tag+'|'+m.note]; return rn||m.note; };
  /* 改過的備註（舊存檔裡記的是舊說法；人物面板顯示新的，存檔不改）：沛珊「她在考慮轉系」→「她在想別的路」（AA 2026-10-14：她之後是休學重考，不是轉系；BB_95 2-8）*/
  const NOTE_RENAMED={classmate_peishan:{'IMPORTANT_CONVERSATION|她在考慮轉系':'她在想別的路'},heroine_03:{'IMPORTANT_CONVERSATION|阿姨說她帶媽媽去醫院':'阿姨扭到手腕，那週她顧店到打烊'}};   /* 語彤 4 原因改輕（交接包 v2 第 1 節）*/
  /* ---- 好感看得見（AA_124 1-6、BB_120 第 1 節；台詞在 src/data/rel_lines.js）----
     升到有點熟／朋友／好朋友以後的下一次見面先說門檻台詞（每句一次、跳階只說最高的）、約好的見面結束的一句、手機聯絡人的名字、見面時的旁白。
     階段只看朋友這條線（熟悉、信任、自在；交往中、曖昧的人也照這三項），再照人物的 cap 壓低（學姊 W8 以前算有點熟）。存檔：G.social.relUp＝{人物: 說過的最高一階} */
  const RL=()=>typeof REL_LINES!=='undefined'?REL_LINES:{};
  const FL=['STRANGER','ACQUAINTANCE','FAMILIAR','FRIEND','CLOSE_FRIEND'];
  S.friendLevel=function(id){ const r=S.rel(id); let s=(r.fam>=60&&r.trust>=45&&r.comf>=40)?'CLOSE_FRIEND':((r.fam>=40&&r.trust>=25)?'FRIEND':(r.fam>=20?'FAMILIAR':(r.fam>=5?'ACQUAINTANCE':'STRANGER')));
    const d=RL()[id], cap=d&&d.cap?d.cap(G):null; if(cap&&FL.indexOf(cap)<FL.indexOf(s)) s=cap; return s; };
  /* 好幾個版本（[{if,l}／{if,t}…]）取第一個成立的；不是版本清單就原樣 */
  const pickV=v=>{ if(Array.isArray(v)&&v.length&&v[0]&&typeof v[0]==='object'&&!('n' in v[0])&&(('l' in v[0])||('t' in v[0]))){ for(const x of v) if(!x.if||x.if(G)) return x; return null; } return v; };
  S.upLine=function(id){ const d=RL()[id]; if(!d||!d.up||!G.social) return null; const lv=FL.indexOf(S.friendLevel(id)), done=((G.social.relUp||{})[id])|0;
    for(let k=lv;k>=2&&k>done;k--){ const e=pickV(d.up[FL[k]]); if(!e) continue; if(e.wait&&!e.wait(G)) continue; return {stage:FL[k],k,l:e.l||[],ch:e.ch||null}; } return null; };
  S.markUp=function(id,k){ const U=G.social.relUp||(G.social.relUp={}); if((U[id]|0)<k){ U[id]=k; (G.social.relUpDay||(G.social.relUpDay={}))[id]=G.day; } };   /* relUpDay：那天說的（方奕廷「我下週上山」之後的那一週要知道是哪一天）*/
  S.byeLine=function(id){ const d=RL()[id]; if(!d||!d.bye) return null; const s=S.friendLevel(id), B=d.bye;
    const v=pickV((s==='CLOSE_FRIEND'&&B.CLOSE_FRIEND)||((s==='CLOSE_FRIEND'||s==='FRIEND')&&B.FRIEND)||B.base); return v?(v.l||v):null; };
  S.meetLine=function(id,pid){ const d=RL()[id], T=d&&d.meet&&d.meet[pid]; if(!T) return null; const s=S.friendLevel(id);
    const v=pickV(T[(s==='FRIEND'||s==='CLOSE_FRIEND')?'R':(s==='FAMILIAR'?'F':'A')]); return v?(typeof v==='string'?v:(v.t||null)):null; };
  S.contactName=function(id){ const d=RL()[id], C=d&&d.contact; if(!C) return null; const s=S.friendLevel(id);
    return (s==='CLOSE_FRIEND'&&(C.CLOSE_FRIEND||C.FRIEND))||((s==='FRIEND'||s==='CLOSE_FRIEND')&&C.FRIEND)||C.base||null; };
  /* 任一方有伴侶（祐廷和別人交往中，或對方這學期有伴侶 CHARACTERS[id].partner）：{solo:true} 的旁白拿掉（BB_120 1-0） */
  S.partnered=function(id){ const F=G.flags||{}; if(Object.keys(F).some(k=>k.indexOf('dating_')===0&&k!=='dating_'+id&&F[k])) return true;
    const c=(typeof CHARACTERS!=='undefined')&&CHARACTERS[id]; return !!(c&&c.partner&&typeof STORY!=='undefined'&&STORY.inTerms&&STORY.inTerms(G,c.partner)); };
  /* 播一串台詞：（開頭＝旁白、其他＝那個人說（who）；{n,solo}；{name}＝玩家的名字 */
  S.playSteps=async function(GM,who,id,steps){ for(const st of steps||[]){ const o=typeof st==='string'?{t:st}:(st||{}); if(o.solo&&S.partnered(id)) continue;
      const t=String(o.t||o.n||o.s||'').replace('{name}',G.name||'祐廷'); if(!t) continue; if(o.n||/^（/.test(t)) await GM.say(null,t); else await GM.say(who,t); } };
  /* 門檻台詞＋小選擇（不加數值）；說了回傳 true（先記下來，演到一半出錯也不會每次都說） */
  S.playUp=async function(GM,who,id){ const U=S.upLine(id); if(!U) return false; S.markUp(id,U.k); await S.playSteps(GM,who,id,U.l);
    if(U.ch&&U.ch.length){ const k=await GM.choose(U.ch.map(c=>({t:c.t}))); const c=U.ch[k]; if(c) await S.playSteps(GM,who,id,c.r); } return true; };
  S.describe=function(id){ const c=CHARACTERS[id]; if(!c) return ''; const st=S.stage(id); const label={STRANGER:'還不認識',ACQUAINTANCE:'認識',FAMILIAR:'有點熟',FRIEND:'朋友',CLOSE_FRIEND:'好朋友',POSSIBLE_ROMANTIC_INTEREST:'……有點在意',ROMANTIC_TENSION:'說不清楚的關係',RELATIONSHIP:'在一起'}[st]; const mems=S.memories(id).slice(-4).map(m=>{ if(!MEMORY_LABEL[m.tag]) return null; const nt=S.noteShown(id,m); return MEMORY_LABEL[m.tag]+(nt?'（'+nt+'）':''); }).filter(Boolean); return label+(mems.length?' · '+mems.join('、'):''); };
  const MEMORY_LABEL={BLUFFED:'在她面前裝懂過',FIRST_MET:'第一次見面',GREETED:'打過招呼',SHARED_CLASS:'一起上課',SHARED_MEAL:'一起吃飯',STUDIED_TOGETHER:'一起讀書',HELPED:'幫過忙',REFUSED_HELP:'你拒絕過',ARGUED:'吵過',APOLOGIZED:'道過歉',SHARED_SECRET:'說過秘密',SHARED_UMBRELLA:'共撐一把傘',MISSED_DINNER:'放過鴿子',HELPED_WITH_REPORT:'幫她寫報告',STUDIED_ALL_NIGHT:'一起熬夜',ARGUED_ABOUT_CAREER:'為未來吵過',GRAD_SCHOOL_DISCUSSION:'聊過研究所',BAR_EXAM_DISCUSSION:'聊過國考',WALKED_TOGETHER:'一起走過校園',CAFE_AFTERNOON:'咖啡廳的下午',LIBRARY_AFTERNOON:'總圖的下午',KNOWS_ECON_YEAR:'知道你念過一年經濟系',DECLINED_INVITE:'你拒絕過邀約',CLASS_ANSWER_GOOD:'看過你答得很好',CLASS_ANSWER_BAD:'看過你被電',LENT_NOTES:'借過筆記',INVITED_CLUB:'邀你進社團',TALKED_FAMILY:'聊過家裡的事',RAIN_LIBRARY:'雨天圖書館門口',LATE_NIGHT_TALK:'深夜聊過',PLAYER_ASKED_QUESTION:'你問過她問題',CONFESSION:'告白',DATING:'交往',BREAKUP:'分手',EXAM_RESULT:'考試結果',GRAD_SCHOOL_RESULT:'放榜',IMPORTANT_CONVERSATION:'重要的對話',NOT_FOR_ME:'她說她不想寫',SAW_HIM_STUDY:'看過他偷偷念書',SAID_DEPENDS:'颱風天說「看情況」',REPORT_PARTNER:'一起寫報告',BREAKFAST_YU:'傅鐘旁邊的早餐',OUR_SHOP_FIRST:'「我們的店」的第一次',TOLD_SCORE:'告訴他期中的分數',ASKED_BACK:'反問他考幾分',GIFT_NOTEBOOK_YT:'聖誕交換禮物',VIDEO_STUDY:'視訊一起讀書',ECON_TOGETHER:'一起對經濟題',RENT_RUMOR:'聽說房東的事',NOTICED_HER:'注意到她的小事',HEARD_ABOUT:'聽說過她的事',CONTEST_DAY:'比賽那天',PLAYTESTED:'測試過她的遊戲',KAI_WANTS_CREDIT:'他想被寫進她的遊戲'};   /* 大一上 v1 後段、大一下 v2 新的記憶：人物面板顯示中文（沒有名稱會直接顯示英文代號；v2_batch1_unit 檢查每一個都有）*/
  S.MEMORY_LABEL=MEMORY_LABEL;
  return S;
})();
