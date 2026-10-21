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
  const ACT={chat:{fam:2},chatNew:{comf:1},classmate:{fam:1},cafe:{fam:3,trust:1,comf:2},library:{fam:3,trust:2,comf:1},meal:{fam:3,trust:1,comf:3},walk:{fam:4,trust:2,comf:3},help:{fam:1,trust:3},acceptInvite:{trust:1},msg:{fam:1}};   /* msg：手機傳訊息、對方回了（AA_202 第 4 節：同一個人一天最多 +1；一週三次以上不加由 msg3d.js 管）*/
  const CAP={fam:6,trust:4,comf:5};
  S.ACT=ACT; S.CAP=CAP;
  S.activity=function(id,kind){ const A=ACT[kind]; if(!A||!G||!G.social) return null; const day=G.day|0; const D=G.social.daily&&G.social.daily.day===day?G.social.daily:(G.social.daily={day,p:{}});
    const P=D.p[id]||(D.p[id]={acts:{},fam:0,trust:0,comf:0,cap:0}); if(P.acts[kind]) return {};   /* 同一種活動一天一次 */ P.acts[kind]=1; if(S.onActivity){ try{ S.onActivity(G,id,kind); }catch(e){ console.warn('SOCIAL.onActivity',e); } }   /* 學期末的飯：這學期常接觸的分數（termend3d.js，BB_202 1-1）*/
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
  /* 資料頁、朋友列表的「科系・年級」照祐廷的學年（00_現行設定總表第 2-1 節，AA-C c70dc425）：characters.js 的 tagByPY＝[經濟系那一年, 法律大一～大四]；
     沒寫的那一格：經濟系那一年照原值，法律系的年份同一屆跟著升（year＋學年−1），超過四年級只寫科系。{t,alt,ifFlag}：有其中一個旗標才寫 alt（沛珊大三、大四：交往中或放榜後重新聯絡上） */
  S.yearTag=function(id){ const c=CHARACTERS[id]; if(!c) return ''; const crs=c.course?'・'+c.course:'', dep=c.department||'';
    const idx=G&&G.stage==='econ'?0:S.playerYear(); let v=Array.isArray(c.tagByPY)?c.tagByPY[idx]:null;
    if(v&&typeof v==='object'){ const F=(G&&G.flags)||{}; v=(v.ifFlag||[]).some(k=>F[k])?v.alt:v.t; }
    if(typeof v==='string') return v+crs;
    let y=c.year; if(typeof y==='number'&&idx>0){ y+=idx-1; if(y>4) return dep+crs; }
    const ys=y?(typeof y==='number'?['','一','二','三','四'][y]+'年級':y):''; return dep+(ys?'・'+ys:'')+crs; };
  S.displayName=function(id){ const c=CHARACTERS[id]; if(!c) return (typeof PORTRAIT_ONLY!=='undefined'&&Object.prototype.hasOwnProperty.call(PORTRAIT_ONLY,id)&&PORTRAIT_ONLY[id].name)||id;   /* 只有立繪的人物（characters.js 的 PORTRAIT_ONLY）：'yule'→「予樂」，不是 id */ const rv=S.reveal(id); if(c.social_layer==='B'){ if(rv==='UNKNOWN') return (c.year? '法律系'+['','一','二','三','四'][S.yearOf(id)]+'年級的'+(c.gender==='f'?'女生':'男生') : '法律系學生'); if(rv==='RECOGNIZABLE') return c.descriptor; return c.name; } if(c.social_layer==='D'&&!S.metD(id)) return c.gender==='f'?'不認識的女生':'不認識的男生'; return c.name; };   /* 認識前不露名字（AA 10-13 P1-1）：看過三次（noticed → RECOGNIZABLE）也一樣——BB-C 10-20：還沒認識以安，按鈕就寫「和沈以安說話」 */
  /* 女主角（D 層）算認識了沒：FIRST_MET，或舊存檔的 met_ 旗標（met_an、met_sis，FIRST_MET 以前的寫法）。
     BB-C 10-20（6a931b8e，使用者 9/25 存檔）：還沒認識以安，按鈕卻寫「和沈以安說話」——那份存檔的以安是 ACQUAINTANCE（說過話：talkAn 不管認識了沒都記 talkedTo），
     原本只有 UNKNOWN、RECOGNIZABLE 才藏名字。改成只看認識了沒（AA_313 第 4 節第 10 點：她得先自我介紹「……同班的，你不記得？」）*/
  const LEGACY_MET={heroine_01:'met_an',heroine_05:'met_sis'};
  S.metD=function(id){ if(S.has(id,'FIRST_MET')) return true; const F=G&&G.flags; return !!(F&&(F['met_'+id]||(LEGACY_MET[id]&&F[LEGACY_MET[id]]))); };
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
  /* 記憶的備註是地點 id 的（SOCIAL.meet 記的 where：camp、dorm、wancai…）→ 人物面板顯示中文（AA_205 6-14 程式 3）*/
  S.PLACE_LABEL={camp:'宿營',dorm:'宿舍',dorm_hall:'宿舍',wancai:'萬才館',family_group:'家族群組',campus:'校園',classroom:'教室',linze:'霖澤館',library:'總圖',library_hall:'總圖',cafe:'兩點半 Café',cvs:'便利商店',noodle:'麵店',bookstore:'書店',gongguan:'公館',wenzhou:'溫州街',boya:'博雅館',putong:'普通教學館',gongtong:'共同教學館',soclib:'社科院圖書館',lawlib:'法律學院圖書館',gym:'體育館',socsci:'社科院',home:'臺北的家'};
  S.dayLabel=function(day){ if(typeof CALENDAR!=='undefined'&&CALENDAR.dateOf){ const d=CALENDAR.dateOf(day); if(d&&d.m) return d.m+'/'+d.d; } return '第 '+day+' 天'; };   /* 人物面板的記憶：日期（8/22），不是「第 -25 天」*/
  S.noteShown=function(id,m){ if(!m||!m.note) return ''; if(!retiredNotes){ retiredNotes={}; const add=x=>{ if(x&&x.npc&&x.note) (retiredNotes[x.npc]||(retiredNotes[x.npc]=new Set())).add(x.tag+'|'+x.note); };
      if(typeof STORY_EVENTS!=='undefined') for(const e of STORY_EVENTS){ if(!e.retired) continue; for(const x of ((e.consequences&&e.consequences.mem)||[])) add(x); for(const l of (e.dialogue||[])) for(const c of ((l&&l.choice)||[])){ for(const x of (c.mem||[])) add(x); for(const x of ((c.consequences&&c.consequences.mem)||[])) add(x); } } }
    const r=retiredNotes[id]; if(r&&r.has(m.tag+'|'+m.note)) return ''; const rn=NOTE_RENAMED[id]&&NOTE_RENAMED[id][m.tag+'|'+m.note]; if(rn) return rn; if(/^[a-z_0-9]+$/.test(m.note)){ if(S.PLACE_LABEL[m.note]) return S.PLACE_LABEL[m.note]; const zz=typeof Z3!=='undefined'&&Z3.ZONES&&Z3.ZONES[m.note]; if(zz&&zz.name) return zz.name; } return S.filmRename(m.note); };
  /* 真實片名改成虛構的（AA_313 6-2，D77）：舊存檔記憶裡的《東京物語》《晚春》顯示新片名（存檔不改）*/
  S.filmRename=t=>typeof t==='string'?t.replace(/《東京物語》|東京物語/g,'《進城的那一週》').replace(/《晚春》|晚春/g,'《父親的午後》').replace(/《《/g,'《').replace(/》》/g,'》'):t;
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
  /* 交往中的叫法（rel_lines 的 contact.DATING；AA_313 6-5 第 8 點：學姊交往以後聯絡人是「書瑀」，手機上她的訊息也照這個名字）*/
  S.datingName=function(id){ const d=RL()[id], C=d&&d.contact, F=G&&G.flags; if(!C||!C.DATING||!F) return null; const R=F.romance&&F.romance[id]; return (F['dating_'+id]===true||(R&&R.status==='dating'))?C.DATING:null; };
  S.contactName=function(id){ const d=RL()[id], C=d&&d.contact; if(!C) return null; if(C.DATING&&S.datingName(id)) return C.DATING; const s=S.friendLevel(id);
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
  const MEMORY_LABEL={AN_L1_NOTES_PHONE:'跟她說筆記寫在手機上',AN_L1_NOTES_PAPER:'跟她說筆記寫紙本（說好考前互借一頁）',AN_L2_PLANNER:'看過她的手帳（右欄寫理由）',AN_L3_DORM:'知道她也住宿舍（宿舍規則十七頁，她讀完了）',AN_L4_HOME:'知道她家在台中、媽媽每個月一次的晚餐',AN_L5_CONST:'憲法課她坐第三排',AN_L6_RULE_EXAMPLE:'跟她舉過一條沒有理由的規則',AN_L6_RULE_NONE:'跟她說自己都照規則',AN_L7_RUN:'知道她早上六點跑步（那時候沒人找她討論事情）',AN_L8_MIDTERM:'和她聊過期中考的準備',AN_L9_REASON:'聽她說為什麼講話都先準備理由',AN_L10_WINTER:'知道她寒假回台中、媽媽要教她一道菜',AN_L10_PHOTO_PROMISE:'說好寒假互傳照片',
    YT_MOM_HEARD:'聽她說媽媽很愛笑',YT_CLASS_PRAISED:'聽她說社會學課被老師說「很好」',YT_TEN_MINUTES:'聽她說打烊時那十分鐘（椅子倒放在桌上）',ZR_ASKED_MESSY:'問過她經原那學期怎麼了（她說「就是亂」）',ZR_HOMETOWN:'知道她家在台中開影印店（一張一塊）',ZQ_GAME_HEARD:'聽她說在做的遊戲（一隻一直在找插座的貓）',
    SIS_ASKED_SLEEP:'問過學姊睡得夠不夠（保溫瓶裡是三倍濃的咖啡）',SIS_PARENTS_HEARD:'聽學姊說爸媽一直覺得考上司法官很好',SIS_PUBLIC_LAW_FAN:'跟學姊說公法不無聊（她說你是第三個）',PS_FAMILY_SHOP:'知道她家在台中開早餐店',PS_NOTES_SHARED:'和她把筆記拼成一整份',PS_REASSURED:'跟她說「條文課本都有，故事沒有」',
    KX_EARRING_STORY:'聽她說耳環只戴一邊的理由（另一邊留給還沒想到的那一個）',KX_FIVE_MINUTES:'聽她說分開前的那五分鐘',KX_TERM1_DONE:'聽她說不同學校「只是很遠，不是很難」',KAI_QUIET_KEYBOARD:'阿凱換了靜音的鍵盤',KAI_ROOM_RULES:'和阿凱訂了宿舍的規則',   /* 閒聊階梯、阿凱宿舍事件的記憶（2026-10-16 LAWWW-B 照台詞寫的草稿；以安、語彤 AA-B 審過、改了四個；其他等 BB-B）*/
    ZQ_OUTLETS:'她在記總圖哪裡有插座',   /* 子晴 Q-L5（取代 ZQ_GAME_HEARD；BB_166 第 86 行的備註，baa5c577）*/
    BLUFFED:'在她面前裝懂過',ARGUED_GOOD:'在手機上跟她吵過一篇文章',NOTICED_EMPTY_SEAT:'注意到她期中那週不在總圖',ASKED_TELL_ME:'要她不管考得怎樣都要說',WATCHED_GAME_Y2:'大二去看了他的系籃比賽',XINCI_SECOND:'她說了三年的第二名',TOLD_HER_STOP:'叫她今天先不要改了',SKIPPED_INTERVIEW:'她沒有去面試的那個早上',LENT_NOTES_Y2:'大二借他民法筆記',STUDIED_WITH_ZHE:'大二陪他念民法',FIRST_MET:'第一次見面',GREETED:'打過招呼',SHARED_CLASS:'一起上課',SHARED_MEAL:'一起吃飯',STUDIED_TOGETHER:'一起讀書',HELPED:'幫過忙',REFUSED_HELP:'你拒絕過',ARGUED:'吵過',APOLOGIZED:'道過歉',SHARED_SECRET:'說過秘密',SHARED_UMBRELLA:'共撐一把傘',MISSED_DINNER:'放過鴿子',HELPED_WITH_REPORT:'幫她寫報告',STUDIED_ALL_NIGHT:'一起熬夜',ARGUED_ABOUT_CAREER:'為未來吵過',GRAD_SCHOOL_DISCUSSION:'聊過研究所',BAR_EXAM_DISCUSSION:'聊過國考',WALKED_TOGETHER:'一起走過校園',CAFE_AFTERNOON:'咖啡廳的下午',LIBRARY_AFTERNOON:'總圖的下午',KNOWS_ECON_YEAR:'知道你念過經濟系',DECLINED_INVITE:'你拒絕過邀約',CLASS_ANSWER_GOOD:'看過你答得很好',CLASS_ANSWER_BAD:'看過你被電',LENT_NOTES:'借過筆記',INVITED_CLUB:'邀你進社團',TALKED_FAMILY:'聊過家裡的事',RAIN_LIBRARY:'雨天圖書館門口',LATE_NIGHT_TALK:'深夜聊過',PLAYER_ASKED_QUESTION:'你問過她問題',CONFESSION:'告白',DATING:'交往',BREAKUP:'分手',EXAM_RESULT:'考試結果',GRAD_SCHOOL_RESULT:'放榜',IMPORTANT_CONVERSATION:'重要的對話',NOT_FOR_ME:'她說她不想寫',SAW_HIM_STUDY:'看過他偷偷念書',SUNDAY_SUPPER:'大二的週日宵夜',LAB_LETTER:'她說了實驗室的信',MIRROR_PEISHAN:'跟她說你也重考過',HEARD_PROF_XU:'在研究室門外聽到許教授的問題',ASKED_LOW_SCORE:'問他分數不夠的人怎麼辦',XU_TYPHOON:'颱風假那天去了線上的討論',SAID_DEPENDS:'颱風天說「看情況」',REPORT_PARTNER:'一起寫報告',BREAKFAST_YU:'傅鐘旁邊的早餐',OUR_SHOP_FIRST:'「我們的店」的第一次',TOLD_SCORE:'告訴他期中的分數',ASKED_BACK:'反問他考幾分',GIFT_NOTEBOOK_YT:'聖誕交換禮物',VIDEO_STUDY:'視訊一起讀書',ECON_TOGETHER:'一起對經濟題',RENT_RUMOR:'聽說房東的事',NOTICED_HER:'注意到她的小事',HEARD_ABOUT:'聽說過她的事',CONTEST_DAY:'比賽那天',PLAYTESTED:'測試過她的遊戲',KAI_WANTS_CREDIT:'他承認想被寫進子晴的遊戲',WATCHED_GAME:'看過他的比賽',ASKED_ABOUT_ZHE:'她問過你阿哲的事',SAW_HER_TEACH:'看過她在課輔班',FAMILY_DINNER:'家族聚餐',TREATED_FAMILY:'請了全家族飲料',FAMILY_THREE_THINGS:'家族群組的三件事',CLAPPED:'成發那天拍了手',WATCHED_FILM:'一起看了早場電影',WATCHED_FILM_GROUP:'三個人看了早場電影',FANG_HINT:'他說了芷若高中的事',GAVE_HER_NOTE:'給了她一張便條',ASKED_HER_DRINK:'問過她自己都喝什麼',B5_STICKY:'演講完一起寫的便利貼',REMEMBERED_HER:'記得她的那一杯',
    /* 閒聊階梯大一下、大二（AA_139、AA_141、AA_142、BB_133 第 7 節的建議字樣；2026-10-16）*/
    AN2_TOMATO_EGG:'知道她寒假學了番茄炒蛋',AN2_JAPANESE:'知道她早上七點上日文課',AN2_AZALEA:'看過她拍杜鵑花（每年同一個位置）',AN2_LIKE_MOM:'聽她說講話越來越像媽媽',AN2_SUMMER:'知道她暑假七月底回台中',YT2_NEWYEAR:'聽她說過年阿姨擦椅子',YT2_INTERVIEW:'她想訪問阿姨',YT2_OLD_LAMP:'她把亮了二十年的舊燈拿回家',YT2_SEATS:'她說阿哲和小語最近都坐同一邊',YT2_WORRY:'她說阿姨最近話比較少',YT2_FUTURE:'聽她說大二要往哪裡走',YT2_SUMMER:'她說暑假週二、週四照常在店裡',AN3_TUTOR:'知道她開始家教',AN3_KEIGO:'聽她說敬語是禮貌還是距離',AN3_NEEDED:'聽她說分不清哪些是自己想做的',AN3_WINTER:'她寒假要教媽媽做番茄炒蛋',YT3_BOOKS:'聽她說客人留下的三本書',YT3_FAFU:'知道她加入法服初談組',YT3_MOM_WALK:'她週末陪媽媽散步',YT3_INTAKE_LEAD:'學姊說初談組以後交給她',YT3_SEA:'她想帶阿姨去看海',AN4_AZALEA2:'杜鵑花第二張（「樹變大了，還是我變了」）',AN4_EXCHANGE_TALK:'交換說明會她坐第一排（「地方是早就決定的，今天來聽細節」）',AN4_CHOOSING:'選交換志願（「選一個地方，就是放下另外一個」）',AN4_SUMMER:'暑假回台中兩週、其他時間準備申請',YT4_SEA_TRIP:'過年帶阿姨去看海（「明年還要」）',YT4_CHAIRS:'法服記錄本第三本；椅子擺斜的，人比較敢講',YT4_MOM_GARLIC:'媽媽想來店裡幫忙，最後負責剝蒜頭',YT4_INTAKE_LEAD:'學姊畢業，初談組她在顧',YT4_FIELDWORK:'暑假開始訪問老客人，第一個是點乾麵的阿伯',ZR2_WINTER_SHOP:'聽她說寒假顧店（同一份講義印了五次的高中生）',ZR2_BACK_ROW:'聽她說電影院最好的位子（最後一排靠走道）',ZR2_HIDE_BEHIND:'聽她說期中報告的評語（「妳躲在台詞後面」）',ZR2_GLASSES:'聽她說眼鏡度數早就不對了',ZR2_TEN_MINUTES:'知道她打烊後一個人坐十分鐘',ZR2_SUMMER:'知道她暑假回台中顧店',ZQ2_HOTKEY:'聽她說寒假的快捷鍵（爸爸進來就切到課本）',ZQ2_POCKETS:'知道她外套口袋裡的全部家當',ZQ2_SUMMER_TESTER:'答應暑假當她的測試員（不支薪，包飲料）',SIS2_PLAN_V7:'聽學姊說研究計畫改到第七版',SIS2_FIRST_DRAFT:'聽學姊說她大一也被改了十二條',SIS2_SLOWER_YES:'聽學姊說「對」說得慢了一點',PS2_SIX_PLATES:'知道她一次可以端六盤',PS2_TUTOR_HEARD:'聽她說課輔班的事',PS2_NOT_ERASED:'聽她說期中沒擦掉的那個答案',PS2_WHY_LAW:'聽她說「喜歡還是考上了」',KX2_23_CALLS:'寒假視訊了二十三次（她有記）',KX2_FEWER_IFS:'予樂說她這學期笑的時間變長了',KX2_TASSEL:'政大的流蘇在幫她慶祝',KX2_PLAN_SHEET:'她的行程表每次都被打亂',KX2_SUMMER:'暑假她整段回高雄'};   /* 大一上 v1 後段、大一下 v2 新的記憶：人物面板顯示中文（沒有名稱會直接顯示英文代號；v2_batch1_unit 檢查每一個都有）*/
  Object.assign(MEMORY_LABEL,{AN5_PROCEDURE:'她說程序是給看不懂的人的',AN5_BIRTHDAY:'知道她生日是中秋那天',AN5_LETTER:'她用日文寫了三行信給一年後的自己',AN5_FORM_DONE:'她的志願表理由欄寫了兩頁',AN5_PACKING:'她只能帶十本書，手帳要全部帶',AN5_SEAT:'阿姨說長桌的位子是給大家的習慣',YT5_THREE_SECONDS:'她當助教會先等三秒',YT5_INTAKE_JUNIORS:'她教初談組的學弟妹倒水',YT5_FIELD_NOTES:'她暑假訪問了十一個老客人',YT5_LEASE_SHRINE:'新租約放在神明桌旁邊',YT5_SENDOFF:'她第一次為了送人請假',YT6_THURSDAY:'她說以前週四都穿圍裙',YT6_AZALEA_FOR_AN:'她幫以安拍了杜鵑花第三張',YT6_COBBLER:'修鞋店老闆說鞋比較誠實',YT6_REPORT:'老師說她的田野筆記可以寫成報告',YT6_ASK_AUNT:'她暑假想再訪問阿姨一次',AN7_BACK:'她從日本回來，阿姨留了位子',AN7_NEIGHBOR:'日本的鄰居每天說早安',AN7_PROPOSAL:'她的研究計畫第一頁寫了七次',AN7_NO_PLAN:'她排了一個沒有計畫的週日',YT7_AUNT_STORY:'她訪問了阿姨，「這樣算故事嗎」',YT7_CHAIRS_PASSED:'學弟妹自己把椅子擺斜了',YT7_RED_PAPER:'二十三週年的紅紙是她寫的',YT7_NYE_THREE:'跨年她和阿姨、媽媽三個人看煙火',AN8_RETAKE:'她在補修班坐最後一排',AN8_AZALEA4:'四張杜鵑花的照片',AN8_INTRODUCE:'她想好怎麼介紹媽媽',AN8_DIPLOMA:'她的證書要等到一月',YT8_LAST_TERM:'她最後一學期只剩四學分',YT8_MOM_SHOES:'她媽媽為了典禮買新鞋',YT8_GRAD_PHOTO:'她的學士照貼在紅紙旁邊',YT8_CHOSE_THURSDAY:'她說週四是她自己選的'});   /* 閒聊階梯大三上～大四下（AA_149～152 的「給 LAWWW-B」記憶表，企劃線 b79a32a7）*/
  MEMORY_LABEL.TEAHOUSE_TEA='一起去一盞喝茶';   /* DL-12 溫州街的茶屋 */
  MEMORY_LABEL.BEING_HEARD='他說了自己想做的事';   /* 1A-04 感冒的那一週：問「那一句」的那個人（AA_315 第 5 節）*/
  Object.assign(MEMORY_LABEL,{LAW_MEETS_LIFE:'把買賣不破租賃那一頁傳給她',RENT_CONSULTATION:'聽她說陪阿姨去法服諮詢',TICKET_STUB:'她出國前給的電影票根',TOLD_HER_CHANGE:'跟她說過自己從經濟換到法律',POSTCARDS:'回寄過她從英國寄來的明信片',POSTCARDS_GROUP:'在寄給她的大明信片上寫了一句'});   /* 1B-02、1B-03、1B-06、1B-09、1B-10（AA_316、AA_321）：面板上的名稱照 AA_336 B5 定稿 */
  /* 面板名稱：AA_338 第 10 題（AA-C 21c74e3a）定稿 */ Object.assign(MEMORY_LABEL,{WATCHED_GAME_Y2B:'大二下也去看了他的系籃比賽',KX_BDAY2_CAKE:'她大二的生日，系上小教室的蛋糕',ECON_NIGHT:'經濟系之夜坐在前系友席',ZHE_PHOTOS:'跟他說搬進去那天要拍照',HEARD_FROM_ZIQING:'她錄取的事，先聽子晴說了',MX_TOLD:'聽他說，他跟以安說出口了',HEARD_ECON_NIGHT:'經濟系之夜沒去，聽說了那張空椅子',HELP_OFFERED:'說過想幫她', SHE_SAW_HIM:'她看出你最近很累', DROVE_HER:'開車送她去機場', AN_CHOICE_TOLD:'她說要考商法組的時候，你在', ANNIVERSARY_23:'麵店二十三週年那晚在場', REPLIED_US0:'她到美國那天，回了她的訊息', SIS_LAWLIB_NOTE:'十月的法圖，她用便利貼問你小考', SIS_RESULT_TOLD:'放榜那天，你先查到她的名字'});   /* 事件包第 2 輪之一（AA_325，src/y2r2_3d.js）*/
  Object.assign(MEMORY_LABEL,{ENC_D06_BH3:'在美術館遇到他（第三次）',ENC_D04_ZR3:'在西門町的電影院門口遇到她（第三次）',ENC_D12_ZQ3:'在大稻埕碼頭遇到她（第三次）'});   /* DL-08 小支線的第三次（enc_walk.js side 的 mem）；其他 ENC_ 的名稱在 encounters.js 的 labels */
  Object.assign(MEMORY_LABEL,{AN_BDAY_POMELO:'在中秋那天幫她過生日',ZHE_SAID_IT:'他第一次說自己「有事」',SAW_HIM_TRY:'聽他說交換放棄了，畢業以後自己存錢去'});   /* 1C 群戲（AA_324；src/group3d.js）：AN_BDAY_POMELO 照 AA_324 1C-02 第 4 節、ZHE_SAID_IT 照 AA_40 哲 4「影響」、SAW_HIM_TRY 照 AA_336 C13（選「那出國呢？」才記的）*/
  /* 面板名稱：大三前半（AA_326，r2y3a3d.js 原本在執行時才加）、第 3 輪（AA_328，r3_3d.js 原本在執行時才加）。AA_326 寫了的照寫，其他用 AA 的事件名稱或那一場的原句；何俊朗四項（MET_LONG 用他自我介紹那一句，LONG_HAIHAO／LONG_BBQ／LONG_MENU 用 AA_328 3-12 的段名）＝暫定，待 AA 確認 */ Object.assign(MEMORY_LABEL,{AN_ADMIN_COURT:'她自己去行政法院旁聽',ZHE_SCOOTER:'他擦撞以後，你叫他先不要簽',MOUNTAIN_DAY:'山上沒有訊號',FANG_KNOWS_ECON:'「我其實換過一次跑道。」',DAD_PLAYS:'爸爸卡關了',BOHAN_HONEST:'「你知道我為什麼每天念六小時嗎。」',FIELD_NOTES_IDEA:'「……我可以拿去問老師，能不能當專題。」',ZR_FEE_LETTER:'陪她把試譯稿費的事問清楚',KAI_BOT:'教他的機器人說「先吃飯」',FANG_LAWTREE:'說好下次帶他看法學院的樹',ZR_SWAN:'拉花比賽投了她',PINYU_WORRY:'期末考週在社科圖，聽她說精算的事',KAI_STAYED_UP:'他寫的 bug 那晚，陪他醒著',CHIAYI_TREE:'開車去嘉義看那棵兩千歲的紅檜',MET_SIS_FATHER:'見過她爸爸',SIS_DAY_OFF:'她自己放的一天假',ZQ_DOG_TOLD:'聽她唸她爸爸那則「第七關那隻狗」',MET_LONG:'「叫我 Long 就好。」',LONG_HAIHAO:'新開的餐廳',LONG_BBQ:'會所自習室',LONG_MENU:'中餐館'});
  /* 面板名稱：大三後半（AA_326 26～54，r2y3b3d.js 原本在執行時才加）。AN3_AZALEA、YU_CLUB_BEAR、YU_ALONE 是 AA_326 寫的；XUN_PATH、YU4_SAT、ZHIRUO_MET_YU、XINCI_FIRST 用 AA_326 的事件名稱＝暫定，待 AA 確認 */ Object.assign(MEMORY_LABEL,{AN3_AZALEA:'幫她拍了第三張杜鵑',YU_CLUB_BEAR:'學弟的熊',YU_ALONE:'她一個人去看了一場電影',XUN_PATH:'阿勳的那條路',YU4_SAT:'一個人的晚上',ZHIRUO_MET_YU:'倒數第三排',XINCI_FIRST:'第一名'});
  if(typeof LADDER!=='undefined'&&LADDER.labels) for(const k in LADDER.labels) if(!MEMORY_LABEL[k]) MEMORY_LABEL[k]=LADDER.labels[k];   /* 閒聊階梯的記憶名稱：匯入工具從企劃線的階梯文件表格抓（tools/ladder/import_ladder.py）*/
  S.MEMORY_LABEL=MEMORY_LABEL;
  return S;
})();
