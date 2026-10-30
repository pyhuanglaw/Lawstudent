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
      const name=heroine&&(S.datingName(id)||CHARACTERS[id].nickname)||S.displayName(id), sum=FEEL_ORDER.reduce((a,q)=>a+(P[q]||0),0);   /* 交往中的學姊：「和書瑀熟了一點。」（CALLED_SHUYU）*/
      const st0=S.feelStage[id], st1=S.stage(id); if(st0!==undefined&&STAGE_LINE[st1]&&(STAGE_RANK[st1]||0)>(STAGE_RANK[st0]||0)){ out.push({text:STAGE_LINE[st1](name),sum:1000+sum}); continue; }   /* 換階段優先 */
      let k=null; for(const q of FEEL_ORDER) if((P[q]||0)>0&&(!k||P[q]>P[k])) k=q; if(k) out.push({text:FEEL_TEXT[k](name),sum});
      else if(S.capNotes.includes(id)){ out.push({text:'今天和'+name+'已經聊很多了。',sum:0}); const D=G.social&&G.social.daily; if(D&&D.p[id]) D.p[id].cap=1; } }   /* 真的顯示了才算（一天一次）*/
    S.feel={}; S.feelStage={}; S.capNotes=[]; out.sort((a,b)=>b.sum-a.sum); return out.slice(0,max||2).map(o=>o.text); };
  /* 日常活動加多少（AA_124 第 1-2、1-3 節，AA 決定）：同一個人、同一種活動一天只算一次；同一個人一天最多熟悉 +6、信任 +4、自在 +5；事件照事件自己的數值，不走這裡、不受上限；
     日常不加戀愛。kind：chat 聊天（今天第一次）、chatNew 聽到新的一句、classmate 上課坐旁邊、cafe、library、meal、walk、help、acceptInvite（答應對方約的而且赴約）*/
  const ACT={chat:{fam:2},chatNew:{comf:1},classmate:{fam:1},cafe:{fam:3,trust:1,comf:2},library:{fam:3,trust:2,comf:1},meal:{fam:3,trust:1,comf:3},walk:{fam:4,trust:2,comf:3},help:{fam:1,trust:3},acceptInvite:{trust:1},msg:{fam:1},sport:{fam:4,trust:2,comf:3}};   /* sport：一起運動（羽球、晨跑；AA_126 6-6「其他人照 AA_124 一般的一起運動」——AA_124 1-2 的表沒有這一列，先照最接近的「溫州街散步」，同一種活動一天一次的上限分開算）*/   /* msg：手機傳訊息、對方回了（AA_202 第 4 節：同一個人一天最多 +1；一週三次以上不加由 msg3d.js 管）*/
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
  /* 交換延畢（日本、美國路線，AA_357 1-1、1-4）：大五上開學（CALENDAR 的 Y5S1，2029-09-03）起算大五；放假照上一個學期算，所以證書（2030-01-21）以後也是 5（沒有比大五更後面的學期）*/
  const delayedP=()=>!!(G&&(G.stage||'law')==='law'&&typeof STORY!=='undefined'&&STORY.routeAbroadRoute&&STORY.routeAbroadRoute(G));
  S.playerYear=function(){ if(delayedP()&&typeof CALENDAR!=='undefined'&&CALENDAR.termDays){ const r=CALENDAR.termDays('Y5S1'); if(r&&G.day>=r.from) return 5; }
    const t=typeof STORY!=='undefined'&&STORY.termAt?STORY.termAt(G.day):(typeof CALENDAR!=='undefined'&&CALENDAR.termOf(G.day)?CALENDAR.termOf(G.day).id:null); const m=/^Y([1-4])/.exec(t||''); return m?+m[1]:1; };
  S.yearOf=function(id){ const c=CHARACTERS[id]; if(!c||!c.year) return 0; if(!/^pool_/.test(id)) return c.year; return Math.min(4,c.year+S.playerYear()-1); };
  /* 資料頁、朋友列表的「科系・年級」照祐廷的學年（00_現行設定總表第 2-1 節，AA-C c70dc425）：characters.js 的 tagByPY＝[經濟系那一年, 法律大一～大四]；
     沒寫的那一格：經濟系那一年照原值，法律系的年份同一屆跟著升（year＋學年−1），超過四年級只寫科系。{t,alt,ifFlag}：有其中一個旗標才寫 alt（沛珊大三、大四：交往中或放榜後重新聯絡上） */
  /* 畢業以後（AA_357 第 2-1 節，AA-C 2026-10-21）：祐廷畢業（GRADUATED）以後、2029-09 起，資料頁寫每個人「現在在做什麼」。[從哪一天起, 字]，取最後一個已經到的；
     AA_363 T4：畢業以後資料頁一律不回到學年的規則——表上沒有新的一列（或那一列是 null）就沿用最後一列（所有畢業的人；明軒 2030-08-01 以後照樣「德國」）。
     2029-06-02～08-31 表還沒開始＝照原本的年級寫法（照現在）。沒有寫的人（沛珊「照現在（台南）」、教授、不熟的同學）照原本的規則。
     學姊「研究單位」、方奕廷「嘉義」是 AA_267 附錄 C18 的建議，AA 採用 */
  S.PG_TAG={ heroine_01:[['2029-09-01','首都帝大法研所・碩一'],['2030-08-11','紐約']], heroine_02:[['2029-09-01','兩點半 Café']], heroine_03:[['2029-09-01','社會系・延畢（修法律必修）'],['2030-07-01','準備國考']],
    heroine_04:[['2029-09-01','獨立遊戲工作室']], heroine_05:[['2029-09-01','研究單位']], kexin:[['2029-09-01','木柵大學法律系畢業'],['2029-12-14','律師（職前訓練）']],
    zhe:[['2029-09-01','準備國考']], classmate_bohan:[['2029-09-01','首都帝大法研所・碩一']], kai:[['2029-09-01','資工系畢業・上班']], classmate_mingxuan:[['2029-09-01','德國']],
    yu:[['2029-09-01','準備司法官']], classmate_xinci:[['2029-09-01','事務所']], npc_fangyt:[['2029-09-01','嘉義']],
    npc_ta_chen:[['2029-09-01','法研所博士班']], npc_huangxh:[['2029-09-01','臨床心理所']] };   /* AA_519 2-1：陳助教畢業以後（2028-09 起博士班）；4-1：筱涵 2029-09 起臨床心理所 */
  const dkS=k=>{ if(typeof CALENDAR==='undefined'||!CALENDAR.tOf) return null; const p=String(k).split('-').map(Number); return Math.round((Date.UTC(p[0],p[1]-1,p[2])-CALENDAR.tOf(1))/86400000)+1; };
  S.pgTag=function(id){ const F=(G&&G.flags)||{}; if(!G||(G.stage||'law')!=='law'||!F.GRADUATED) return null; const L=S.PG_TAG[id]; if(!L) return null; let v;
    for(const [k,t] of L){ const d=dkS(k); if(d!=null&&G.day>=d&&t!=null) v=t; } return v==null?null:v; };   /* null 的那一列不蓋掉前一列（AA_363 T4：沿用最後一列，不退回學年的規則）*/
  S.yearTag=function(id){ const c=CHARACTERS[id]; if(!c) return ''; const crs=c.course?'・'+c.course:'', dep=c.department||'';
    { const pt=S.pgTag(id); if(pt) return pt; }
    const idx=G&&G.stage==='econ'?0:S.playerYear(); let v=Array.isArray(c.tagByPY)?c.tagByPY[idx]:null;
    if(v&&typeof v==='object'){ const F=(G&&G.flags)||{}, d0=v.from?dkS(v.from):null; v=((v.ifFlag||[]).some(k=>F[k])||(d0!=null&&G&&G.day>=d0))?v.alt:v.t; }   /* from：那一天（含）以後寫 alt（AA_368 M3：可昕經濟系那一年 2025-02-14 起「休學中」）*/
    if(typeof v==='string') return v+crs;
    let y=c.year; if(typeof y==='number'&&idx>0){ y+=idx-1; if(y>4) return dep+crs; }
    const ys=y?(typeof y==='number'?['','一','二','三','四'][y]+'年級':y):''; return dep+(ys?'・'+ys:'')+crs; };
  S.displayName=function(id){ const c=CHARACTERS[id]; if(!c) return (typeof PORTRAIT_ONLY!=='undefined'&&Object.prototype.hasOwnProperty.call(PORTRAIT_ONLY,id)&&PORTRAIT_ONLY[id].name)||id;   /* 只有立繪的人物（characters.js 的 PORTRAIT_ONLY）：'yule'→「予樂」，不是 id */ const rv=S.reveal(id); if(c.social_layer==='B'){ if(rv==='UNKNOWN'||rv==='RECOGNIZABLE'){ const d=typeof POOL!=='undefined'&&POOL.descNow?POOL.descNow(id,G):null; if(d) return d; if(c.descriptor) return c.descriptor; return c.year? '法律系'+['','一','二','三','四'][S.yearOf(id)]+'年級的'+(c.gender==='f'?'女生':'男生') : '法律系學生'; } return c.name; }   /* 不熟的同學（法律系同學二十位）認識之前：外觀描述——在哪裡出現就用那裡的那一句（AA_498 2-2，src/pool3d.js 的 POOL.descNow）；原本沒看過三次是「法律系一年級的女生」*/ if(c.social_layer==='D'&&!S.metD(id)) return c.gender==='f'?'不認識的女生':'不認識的男生'; return S.datingName(id)||c.name; };   /* 交往中的叫法（學姊：交往那天起叫「書瑀」，CALLED_SHUYU；對話框、按鈕、人物頁都照這個）*/   /* 認識前不露名字（AA 10-13 P1-1）：看過三次（noticed → RECOGNIZABLE）也一樣——BB-C 10-20：還沒認識以安，按鈕就寫「和沈以安說話」 */
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
  S.PLACE_LABEL={camp:'宿營',dorm:'宿舍',dorm_hall:'宿舍',wancai:'法律系館B',family_group:'家族群組',campus:'校園',classroom:'教室',linze:'法律系館A',library:'總圖',library_hall:'總圖',cafe:'兩點半 Café',cvs:'便利商店',noodle:'麵店',bookstore:'書店',gongguan:'公館',wenzhou:'溫州街',boya:'博思教學館',putong:'普通教學館',gongtong:'共同教學館',soclib:'社科院圖書館',lawlib:'法律學院圖書館',gym:'體育館',socsci:'社科院',home:'臺北的家'};
  S.dayLabel=function(day){ if(typeof CALENDAR!=='undefined'&&CALENDAR.dateOf){ const d=CALENDAR.dateOf(day); if(d&&d.m) return d.m+'/'+d.d; } return '第 '+day+' 天'; };   /* 人物面板的記憶：日期（8/22），不是「第 -25 天」*/
  /* AA380 改名 Alison（使用者 10-21 23:2x「改成Alison」）：舊存檔裡已經存下的字還是舊名（\u5c0f\u8a9e）——顯示的時候照匯入工具同一套規則換（Alison 和中文字之間半形空格、挨標點不空；tools/story/import_guard.py 的 alison），存檔不改（同 filmRename）*/
  const ALISON_OLD=/\u5c0f\u8a9e/g, ALISON_CJK=/[\u3400-\u4dbf\u4e00-\u9fff\u3040-\u30ff\uf900-\ufaff]/;
  S.alison=t=>typeof t==='string'&&t.indexOf('\u5c0f\u8a9e')>=0?t.replace(ALISON_OLD,(m,i)=>{ const pre=i>0?t[i-1]:'', nx=t[i+2]||''; return (pre&&ALISON_CJK.test(pre)?' ':'')+'Alison'+(nx&&ALISON_CJK.test(nx)?' ':''); }):t;
  /* 讀檔時（game3d.js 的 migrate）：舊存檔裡存下的舊名換成 Alison——手機訊息（含回覆選項、回覆後的句子）、手機佇列、群組名、出遊的標題地點、約的標籤、記憶備註、目標；只換這些欄位的字，id yu、旗標、記號都不動。換過的沒有舊名，再讀幾次都一樣（同 PHONE.rec 片名改名那一段）*/
  S.alisonSave=function(s){ if(!s||typeof s!=='object') return 0; let n=0; const fx=(o,k)=>{ if(!o||typeof o!=='object') return; const v=o[k]; if(typeof v==='string'&&v.indexOf('\u5c0f\u8a9e')>=0){ o[k]=S.alison(v); n++; } };
    const msg=m=>{ if(!m||typeof m!=='object') return; fx(m,'text'); if(m.ask&&Array.isArray(m.ask.opts)) for(const o of m.ask.opts){ fx(o,'t'); if(o&&Array.isArray(o.say)) for(const y of o.say) fx(y,'text'); } };
    if(Array.isArray(s.msgs)) s.msgs.forEach(msg);
    const P=s.phone; if(P&&typeof P==='object'){ if(Array.isArray(P.q)) P.q.forEach(msg); if(P.groups&&typeof P.groups==='object') for(const k in P.groups) fx(P.groups[k],'name'); }
    if(Array.isArray(s.outings)) for(const q of s.outings) for(const k of ['title','place','back','verb','no']) fx(q,k);
    if(Array.isArray(s.invites)) for(const iv of s.invites) fx(iv,'label');
    const mem=s.social&&s.social.mem; if(mem&&typeof mem==='object') for(const id in mem) if(Array.isArray(mem[id])) for(const m of mem[id]) fx(m,'note');
    fx(s,'goal'); return n; };
  S.noteShown=function(id,m){ if(!m||!m.note) return ''; m={tag:m.tag,note:S.alison(m.note)}; if(!retiredNotes){ retiredNotes={}; const add=x=>{ if(x&&x.npc&&x.note) (retiredNotes[x.npc]||(retiredNotes[x.npc]=new Set())).add(x.tag+'|'+x.note); };
      if(typeof STORY_EVENTS!=='undefined') for(const e of STORY_EVENTS){ if(!e.retired) continue; for(const x of ((e.consequences&&e.consequences.mem)||[])) add(x); for(const l of (e.dialogue||[])) for(const c of ((l&&l.choice)||[])){ for(const x of (c.mem||[])) add(x); for(const x of ((c.consequences&&c.consequences.mem)||[])) add(x); } } }
    const r=retiredNotes[id]; if(r&&r.has(m.tag+'|'+m.note)) return ''; const nk=m.tag+'|'+m.note, rn=NOTE_RENAMED[id]&&NOTE_RENAMED[id][nk]; if(rn) return rn; const r9=NOTE_RENAMED_N9[id]; if(r9&&Object.prototype.hasOwnProperty.call(r9,nk)) return r9[nk];   /* 空字串也算（in，不是真值），AA_350 N9 */ if(/^[a-z_0-9]+$/.test(m.note)){ if(S.PLACE_LABEL[m.note]) return S.PLACE_LABEL[m.note]; const zz=typeof Z3!=='undefined'&&Z3.ZONES&&Z3.ZONES[m.note]; if(zz&&zz.name) return zz.name; } return S.worldName(S.filmRename(m.note)); };
  /* 虛構校名（WORLD-RENAME-1030，D115；docs/WORLD_NAMING.md）：舊存檔裡已經寫下的字（記憶的備註、日誌、筆記、手機訊息）顯示新名字（存檔裡的比對照舊，用原字）。
     規則和 tools/rename/world_names.py 一樣（tests/world_rename_unit.js 逐條對）：worldName＝正式（旁白、地點、筆記：法律系館A）、worldSpoken＝口語（人物的訊息：A館）。
     不用 (?<!…)：舊的 iPhone Safari 不認得，整個檔會載不起來；前一個字自己看。 */
  const WN_PRE=(set,to)=>(m,off,str)=>set.indexOf(str.charAt(off-1))>=0?m:to;
  const WN_COMMON=[[/政大自強十舍/g,'木柵大學翠嶺十舍'],[/自強十舍/g,'翠嶺十舍'],[/國立臺灣大學|國立台灣大學|[臺台]灣大學(?!生)/g,'首都帝國大學'],[/National Taiwan University/g,'Capital Imperial University'],[/\bNTU\b/g,'CIU'],
    [/國立政治大學|政治大學/g,'木柵大學'],[/\bNCCU\b/g,'MZU'],[/政大/g,WN_PRE('財行郵執','木柵大學')],[/[臺台]大/g,WN_PRE('舞平講櫃陽月擂吧檯戲','首都帝大')],
    [/博雅教學館/g,'博思教學館'],[/博雅館/g,'博思教學館'],[/博雅(?!教育|書院|學程|精神|課程)/g,'博思'],[/小椰林道/g,'椰影小徑'],[/椰林大道/g,'椰影大道'],[/椰林(?=那邊|那條|上|旁邊|走|騎|的路)/g,WN_PRE('小','椰影大道')],
    [/傅鐘/g,'晨思鐘'],[/醉月湖/g,'映月湖'],[/洞洞館/g,'圓窗館'],[/小小福/g,'小小松'],[/小福(?!利)/g,'小松'],[/活大/g,WN_PRE('生復靈','學活')],[/國青中心/g,'國際學苑'],[/辜振甫先生紀念圖書館|辜振甫紀念圖書館|辜振甫圖書館/g,'社科院圖書館']];
  const WN_SPOKEN=[[/霖澤館?(、|和|與|跟)萬才館?/g,'A館$1B館'],[/萬才館?(、|和|與|跟)霖澤館?/g,'B館$1A館'],[/霖澤館館/g,'A館'],[/萬才館館/g,'B館'],[/霖澤館?/g,'A館'],[/萬才館?/g,'B館']];
  const WN_WRITTEN=[[/霖澤館?(、|和|與|跟)萬才館?/g,'法律系館A$1B'],[/萬才館?(、|和|與|跟)霖澤館?/g,'法律系館B$1A'],[/霖澤館館(內|裡)/g,'法律系館A裡面'],[/萬才館館(內|裡)/g,'法律系館B裡面'],
    [/霖澤館館/g,'法律系館A'],[/萬才館館/g,'法律系館B'],[/霖澤館?/g,'法律系館A'],[/萬才館?/g,'法律系館B']];
  const WN_OLD=/[臺台]灣大學|[臺台]大|NTU|National Taiwan|政治大學|政大|NCCU|霖澤|萬才|博雅|傅鐘|椰林|醉月湖|洞洞館|小福|活大|自強十舍|國青中心|辜振甫/;
  const wnApply=(t,law)=>{ if(typeof t!=='string'||!WN_OLD.test(t)) return t; for(const [rx,to] of law) t=t.replace(rx,to); for(const [rx,to] of WN_COMMON) t=t.replace(rx,to); return t; };
  S.worldName=t=>{ const r=wnApply(t,WN_WRITTEN); return typeof r==='string'?r.replace(/(法律系館[AB])(?=[0-9０-９]|研討室|教室)/g,'$1 '):r; };
  S.worldSpoken=t=>wnApply(t,WN_SPOKEN);
  /* 真實片名改成虛構的（AA_313 6-2，D77）：舊存檔記憶裡的《東京物語》《晚春》顯示新片名（存檔不改）*/
  S.filmRename=t=>typeof t==='string'?t.replace(/《東京物語》|東京物語/g,'《進城的那一週》').replace(/《晚春》|晚春/g,'《父親的午後》').replace(/《《/g,'《').replace(/》》/g,'》'):t;
  /* 改過的備註（舊存檔裡記的是舊說法；人物面板顯示新的，存檔不改）：沛珊「她在考慮轉系」→「她在想別的路」（AA 2026-10-14：她之後是休學重考，不是轉系；BB_95 2-8）*/
  /* AA_350 N9（AA-C 02bf44d2，10-21）：人物面板備註露出開發代號（W8：、M2：、K-D5…）、和正式名稱重複的改了；舊存檔裡已經記下的舊備註照這張表顯示新的（新的是空字串＝不顯示備註，只顯示名稱）。表由 02bf44d2 的 diff 產生（同一筆 npc＋tag 的舊→新），43 筆 */
  const NOTE_RENAMED_N9={"heroine_02":{"ASKED_HER_DRINK|她下班前，你問她自己都喝什麼":"她下班前","ZHIRUO_MET_YU|告訴她戲院旁邊的女生是 Alison":"","SHE_SAW_HIM|你最近很累，對吧":""},"yu":{"BREAKFAST_YU|傅鐘旁邊的早餐":"","YU_ALONE|她一個人去看了一場電影":""},"heroine_01":{"REPORT_PARTNER|民總報告一起寫":"民總","AN3_AZALEA|幫她拍了第三張杜鵑":"","PLG_LAST_RULE|白板上只剩「說理由。」":"","AN_GRAD_PASS|研究所放榜那晚在麵店":"","AN_COLUMBIA|她說哥大上了、要去":""},"classmate_bohan":{"ASKED_BACK|期中放榜，反問他考幾分":"期中放榜","ASKED_LOW_SCORE|問他分數不夠的人怎麼辦（翰 4 的伏筆）":""},"kexin":{"VIDEO_STUDY|第一次視訊一起讀書":"第一次"},"zhe":{"LENT_NOTES_Y2|大二上借他民法筆記":"","WATCHED_GAME_Y2|大二的系籃比賽：你拍手":"你拍手","WATCHED_GAME_Y2|大二的系籃比賽：你記分":"你記分","WATCHED_GAME_Y2|大二的系籃比賽：你送水":"你送水","WATCHED_GAME_Y2B|大二下的系籃：你拍手":"你拍手","WATCHED_GAME_Y2B|大二下的系籃：你記分":"你記分","WATCHED_GAME_Y2B|大二下的系籃：你送水":"你送水"},"classmate_xinci":{"XINCI_SECOND|凌晨的便利商店，她說了三年的第二名":"凌晨的便利商店","ECON_TOGETHER|在總圖一起對經濟題":"在總圖","XINCI_FIRST|她第一次考第一":""},"heroine_04":{"LAB_LETTER|叫她接爸爸的電話（Q8 的伏筆）":"叫她接爸爸的電話","PLAYTESTED|測試她做的遊戲":""},"prof_xu":{"XU_TYPHOON|颱風假那天去了線上的自願討論":""},"npc_fangyt":{"FANG_HINT|他說了芷若高中的事":""},"kai":{"KAI_WANTS_CREDIT|他想被寫進她的遊戲":"","KAI_ROOM_RULES|K-D5":""},"heroine_05":{"SHARED_SECRET|W8：她說「不知道」的感覺還不錯":"她說「不知道」的感覺還不錯","IMPORTANT_CONVERSATION|W8：「我只是累了。這句話我以前不讓自己說。」":"「我只是累了。這句話我以前不讓自己說。」","TOLD_HER_STOP|W8：叫她今天不要改了":"","HELPED|W8：保溫瓶裝了熱水":"保溫瓶裝了熱水","ASKED_TELL_ME|M2：不管考得怎樣都要跟我說":"","ARGUED_GOOD|W3b〈":"〈","ARGUED_GOOD|M6 第 ":"週日的爭論題，第 ","DROVE_HER|送她去機場":""},"heroine_03":{"LAW_MEETS_LIFE|債各第 6 週，買賣不破租賃那一頁":"債各第 6 週","RENT_CONSULTATION|聽她說陪阿姨去法服":"","APOLOGIZED|語彤事件 11：洗了兩個小時的碗":"洗了兩個小時的碗"}};
  const NOTE_RENAMED={classmate_peishan:{'IMPORTANT_CONVERSATION|她在考慮轉系':'她在想別的路'},heroine_03:{'IMPORTANT_CONVERSATION|阿姨說她帶媽媽去醫院':'阿姨扭到手腕，那週她顧店到打烊'}};   /* 語彤 4 原因改輕（交接包 v2 第 1 節）*/
  /* ---- 好感看得見（AA_124 1-6、BB_120 第 1 節；台詞在 src/data/rel_lines.js）----
     升到有點熟／朋友／好朋友以後的下一次見面先說門檻台詞（每句一次、跳階只說最高的）、約好的見面結束的一句、手機聯絡人的名字、見面時的旁白。
     階段只看朋友這條線（熟悉、信任、自在；交往中、曖昧的人也照這三項），再照人物的 cap 壓低（學姊 W8 以前算有點熟）。存檔：G.social.relUp＝{人物: 說過的最高一階} */
  const RL=()=>typeof REL_LINES!=='undefined'?REL_LINES:{};
  const FL=['STRANGER','ACQUAINTANCE','FAMILIAR','FRIEND','CLOSE_FRIEND'];
  S.friendLevel=function(id){ const r=S.rel(id); let s=(r.fam>=60&&r.trust>=45&&r.comf>=40)?'CLOSE_FRIEND':((r.fam>=40&&r.trust>=25)?'FRIEND':(r.fam>=20?'FAMILIAR':(r.fam>=5?'ACQUAINTANCE':'STRANGER')));
    const d=RL()[id], cap=d&&d.cap?d.cap(G):null; if(cap&&FL.indexOf(cap)<FL.indexOf(s)) s=cap; return s; };
  /* 好幾個版本（[{if,l}／{if,t}…]）取第一個成立的；不是版本清單就原樣 */
  const pickV=(v,ctx)=>{ if(Array.isArray(v)&&v.length&&v[0]&&typeof v[0]==='object'&&!('n' in v[0])&&(('l' in v[0])||('t' in v[0]))){ for(const x of v) if(!x.if||x.if(G,ctx)) return x; return null; } return v; };   /* ctx：升階台詞在哪裡見面（invites3d.js 的 S.meet 傳 {place}；AA_383 第 6 節）*/
  S.upLine=function(id,ctx){ const d=RL()[id]; if(!d||!d.up||!G.social) return null; const lv=FL.indexOf(S.friendLevel(id)), done=((G.social.relUp||{})[id])|0;
    for(let k=lv;k>=2&&k>done;k--){ const e=pickV(d.up[FL[k]],ctx); if(!e) continue; if(e.wait&&!e.wait(G)) continue; return {stage:FL[k],k,l:e.l||[],ch:e.ch||null,set:e.set||null}; } return null; };   /* set：演完要記的旗標（阿凱撕掉膠帶＝KAI_TAPE_GONE）*/
  S.markUp=function(id,k){ const U=G.social.relUp||(G.social.relUp={}); if((U[id]|0)<k){ U[id]=k; (G.social.relUpDay||(G.social.relUpDay={}))[id]=G.day; } };   /* relUpDay：那天說的（方奕廷「我下週上山」之後的那一週要知道是哪一天）*/
  S.byeLine=function(id){ const d=RL()[id]; if(!d||!d.bye) return null; const s=S.friendLevel(id), B=d.bye;
    const v=pickV((s==='CLOSE_FRIEND'&&B.CLOSE_FRIEND)||((s==='CLOSE_FRIEND'||s==='FRIEND')&&B.FRIEND)||B.base); return v?(v.l||v):null; };
  S.meetLine=function(id,pid){ const d=RL()[id], T=d&&d.meet&&d.meet[pid]; if(!T) return null; const s=S.friendLevel(id);
    const v=pickV(T[(s==='FRIEND'||s==='CLOSE_FRIEND')?'R':(s==='FAMILIAR'?'F':'A')]); return v?(typeof v==='string'?v:(v.t||null)):null; };
  /* 交往中的叫法（rel_lines 的 contact.DATING；AA_313 6-5 第 8 點：學姊交往以後聯絡人是「書瑀」，手機上她的訊息也照這個名字）*/
  /* 學姊：使用者 10-17 甲「交往那天起叫書瑀」，開始交往以後所有交往中的事件、選項、訊息都叫「書瑀」（AA_243 第 5 節第 6 題、AA_262 第 5 節第 3 件、AA_327）——
     CALLED_SHUYU 在開始交往那天記（romance3d.js ROM.start），這裡讀它：交往中而且記過＝「書瑀」。分手以後怎麼叫照 BB 定（還沒定：先照原本的名字）*/
  S.CALLED={heroine_05:'CALLED_SHUYU'};
  /* 3D 人物頭上、「和○○說話」、閒聊說話人的名字：交往中照交往的叫法（學姊＝書瑀，AA_386 第 13 行、使用者 10-17「交往那天起叫『書瑀』」；BUG-SIS-DATING-NAME-1023）*/
  S.npcName=function(id){ return S.datingName(id)||S.displayName(id); };
  /* 畫面上的標題（出遊按鈕、標題卡、事件標題、手機系統提醒）：和學姊交往中（CALLED_SHUYU）顯示的時候「溫學姊」「學姊」換成「書瑀」（AA_411 第 2 節）；
     存起來的字不改，分手以後自動變回學姊。例外：「直屬學姊」、指別人的「○○的學姊」（登山社的學姊）不換 */
  S.shuyuT=function(t){ if(t==null) return t; const nm=S.datingName('heroine_05'); if(!nm) return t; return String(t).replace(/溫學姊/g,nm).replace(/(直屬|的)?學姊/g,(m,p)=>p?m:nm); };
  S.datingName=function(id){ const d=RL()[id], C=d&&d.contact, F=G&&G.flags; if(!C||!C.DATING||!F) return null; const R=F.romance&&F.romance[id]; return (F['dating_'+id]===true||(R&&R.status==='dating'))&&(!S.CALLED[id]||!!F[S.CALLED[id]])?C.DATING:null; };
  S.contactName=function(id){ const d=RL()[id], C=d&&d.contact; if(!C) return null; if(C.DATING&&S.datingName(id)) return C.DATING; const s=S.friendLevel(id);
    return (s==='CLOSE_FRIEND'&&(C.CLOSE_FRIEND||C.FRIEND))||((s==='FRIEND'||s==='CLOSE_FRIEND')&&C.FRIEND)||(typeof C.base==='function'?C.base(G):C.base)||null; };   /* base 可以是函式（照日期換：學姊 9/4 21:00 以後才加「（直屬）」，AA_372 第 12 項）*/
  /* 手機上已經知道名字（rel_lines 的 contact.knownFlag 那個旗標成立；學姊 9/3 接受交友邀請＝SIS_CONTACTED，AA_372 第 6 節第 10 題）：私訊串、聯絡人寫名字，不寫「不認識的女生」 */
  S.contactKnown=function(id){ const d=RL()[id], C=d&&d.contact, F=G&&G.flags; return !!(C&&C.knownFlag&&F&&F[C.knownFlag]); };
  /* 任一方有伴侶（祐廷和別人交往中，或對方這學期有伴侶 CHARACTERS[id].partner）：{solo:true} 的旁白拿掉（BB_120 1-0） */
  S.partnered=function(id){ const F=G.flags||{}; if(Object.keys(F).some(k=>k.indexOf('dating_')===0&&k!=='dating_'+id&&F[k])) return true;
    const c=(typeof CHARACTERS!=='undefined')&&CHARACTERS[id]; return !!(c&&c.partner&&typeof STORY!=='undefined'&&(STORY.partnerOn?STORY.partnerOn(G,c.partner):(STORY.inTerms&&STORY.inTerms(G,c.partner)))); };   /* partnerOn：BUG-INTERMS-PARTNER-1021 */
  /* 播一串台詞：（開頭＝旁白、其他＝那個人說（who）；{n,solo}；{name}＝玩家的名字 */
  S.playSteps=async function(GM,who,id,steps){ if(who&&who.charId===id&&S.npcName) who.name=S.npcName(id);   /* 同一次對話裡剛開始交往（事件裡）：接著的閒聊說話人也換交往的叫法（BUG-SIS-DATING-NAME-1023，BB 10-23 15:46）*/ for(const st of steps||[]){ const o=typeof st==='string'?{t:st}:(st||{}); if(o.solo&&S.partnered(id)) continue;
      const t=String(o.t||o.n||o.s||'').replace('{name}',G.name||'祐廷'); if(!t) continue; if(o.n||/^（/.test(t)) await GM.say(null,t); else await GM.say(who,t); } };
  /* 門檻台詞＋小選擇（不加數值）；說了回傳 true（先記下來，演到一半出錯也不會每次都說） */
  S.playUp=async function(GM,who,id,ctx){ const U=S.upLine(id,ctx); if(!U) return false; S.markUp(id,U.k); await S.playSteps(GM,who,id,U.l); if(U.set&&G.flags) Object.assign(G.flags,U.set);
    if(U.ch&&U.ch.length){ const k=await GM.choose(U.ch.map(c=>({t:c.t}))); const c=U.ch[k]; if(c) await S.playSteps(GM,who,id,c.r); } return true; };
  S.describe=function(id){ const c=CHARACTERS[id]; if(!c) return ''; const st=S.stage(id); const label={STRANGER:'還不認識',ACQUAINTANCE:'認識',FAMILIAR:'有點熟',FRIEND:'朋友',CLOSE_FRIEND:'好朋友',POSSIBLE_ROMANTIC_INTEREST:'……有點在意',ROMANTIC_TENSION:'說不清楚的關係',RELATIONSHIP:'在一起'}[st]; const mems=S.memories(id).slice(-4).map(m=>{ if(!MEMORY_LABEL[m.tag]) return null; const nt=S.noteShown(id,m); return MEMORY_LABEL[m.tag]+(nt?'（'+nt+'）':''); }).filter(Boolean); return label+(mems.length?' · '+mems.join('、'):''); };
  const MEMORY_LABEL={AN_L1_NOTES_PHONE:'跟她說筆記寫在手機上',AN_L1_NOTES_PAPER:'跟她說筆記寫紙本（說好考前互借一頁）',AN_L2_PLANNER:'看過她的手帳（右欄寫理由）',AN_L3_DORM:'知道她也住宿舍（宿舍規則十七頁，她讀完了）',AN_L4_HOME:'知道她家在台中、媽媽每個月一次的晚餐',AN_L5_CONST:'憲法課她坐第三排',AN_L6_RULE_EXAMPLE:'跟她舉過一條沒有理由的規則',AN_L6_RULE_NONE:'跟她說自己都照規則',AN_L7_RUN:'知道她早上六點跑步（那時候沒人找她討論事情）',AN_L8_MIDTERM:'和她聊過期中考的準備',AN_L9_REASON:'聽她說為什麼講話都先準備理由',AN_L10_WINTER:'知道她寒假回台中、媽媽要教她一道菜',AN_L10_PHOTO_PROMISE:'說好寒假互傳照片',
    YT_MOM_HEARD:'聽她說媽媽很愛笑',YT_CLASS_PRAISED:'聽她說社會學課被老師說「很好」',YT_TEN_MINUTES:'聽她說打烊時那十分鐘（椅子倒放在桌上）',ZR_ASKED_MESSY:'問過她經原那學期怎麼了（她說「就是亂」）',ZR_HOMETOWN:'知道她家在台中開影印店（一張一塊）',ZQ_GAME_HEARD:'聽她說在做的遊戲（一隻一直在找插座的貓）',CONTEST_HEARD:'聽她說那場比賽她沒去，在公館喝咖啡',   /* AA_363 R5：子晴 Q4 錯過的玩家第 9～11 週那一句（story3d.js S.contestHeard）*/
    SIS_ASKED_SLEEP:'問過學姊睡得夠不夠（保溫瓶裡是三倍濃的咖啡）',SIS_PARENTS_HEARD:'聽學姊說爸媽一直覺得考上司法官很好',SIS_PUBLIC_LAW_FAN:'跟學姊說公法不無聊（她說你是第三個）',PS_FAMILY_SHOP:'知道她家在台中開早餐店',PS_NOTES_SHARED:'和她把筆記拼成一整份',PS_REASSURED:'跟她說「條文課本都有，故事沒有」',
    KX_EARRING_STORY:'聽她說耳環只戴一邊的理由（另一邊留給還沒想到的那一個）',KX_FIVE_MINUTES:'聽她說分開前的那五分鐘',KX_TERM1_DONE:'聽她說不同學校「只是很遠，不是很難」',KAI_QUIET_KEYBOARD:'阿凱換了靜音的鍵盤',KAI_ROOM_RULES:'和阿凱訂了宿舍的規則',   /* 閒聊階梯、阿凱宿舍事件的記憶（2026-10-16 LAWWW-B 照台詞寫的草稿；以安、語彤 AA-B 審過、改了四個；其他等 BB-B）*/
    ZQ_OUTLETS:'她在記總圖哪裡有插座',   /* 子晴 Q-L5（取代 ZQ_GAME_HEARD；BB_166 第 86 行的備註，baa5c577）*/
    BLUFFED:'在她面前裝懂過',ARGUED_GOOD:'在手機上跟她吵過一篇文章',NOTICED_EMPTY_SEAT:'注意到她期中那週不在總圖',ASKED_TELL_ME:'要她不管考得怎樣都要說',WATCHED_GAME_Y2:'大二去看了他的系籃比賽',XINCI_SECOND:'她說了三年的第二名',TOLD_HER_STOP:'叫她今天先不要改了',SKIPPED_INTERVIEW:'她沒有去面試的那個早上',LENT_NOTES_Y2:'大二借他民法筆記',STUDIED_WITH_ZHE:'大二陪他念民法',FIRST_MET:'第一次見面',GREETED:'打過招呼',SHARED_CLASS:'一起上課',SHARED_MEAL:'一起吃飯',STUDIED_TOGETHER:'一起讀書',HELPED:'幫過忙',REFUSED_HELP:'你拒絕過',ARGUED:'吵過',APOLOGIZED:'道過歉',SHARED_SECRET:'說過秘密',SHARED_UMBRELLA:'共撐一把傘',MISSED_DINNER:'放過鴿子',HELPED_WITH_REPORT:'幫她寫報告',STUDIED_ALL_NIGHT:'一起熬夜',ARGUED_ABOUT_CAREER:'為未來吵過',GRAD_SCHOOL_DISCUSSION:'聊過研究所',BAR_EXAM_DISCUSSION:'聊過國考',WALKED_TOGETHER:'一起走過校園',CAFE_AFTERNOON:'咖啡廳的下午',LIBRARY_AFTERNOON:'總圖的下午',KNOWS_ECON_YEAR:'知道你念過經濟系',DECLINED_INVITE:'你拒絕過邀約',CLASS_ANSWER_GOOD:'看過你答得很好',CLASS_ANSWER_BAD:'看過你被電',LENT_NOTES:'借過筆記',INVITED_CLUB:'邀你進社團',TALKED_FAMILY:'聊過家裡的事',RAIN_LIBRARY:'雨天圖書館門口',LATE_NIGHT_TALK:'深夜聊過',PLAYER_ASKED_QUESTION:'你問過她問題',CONFESSION:'告白',DATING:'交往',BREAKUP:'分手',EXAM_RESULT:'考試結果',GRAD_SCHOOL_RESULT:'放榜',IMPORTANT_CONVERSATION:'重要的對話',NOT_FOR_ME:'她說她不想寫',SAW_HIM_STUDY:'看過他偷偷念書',SUNDAY_SUPPER:'大二的週日宵夜',LAB_LETTER:'她說了實驗室的信',MIRROR_PEISHAN:'跟她說你也重考過',HEARD_PROF_XU:'在研究室門外聽到許教授的問題',ASKED_LOW_SCORE:'問他分數不夠的人怎麼辦',XU_TYPHOON:'颱風假那天去了線上的討論',SAID_DEPENDS:'颱風天說「看情況」',REPORT_PARTNER:'一起寫報告',BREAKFAST_YU:'晨思鐘旁邊的早餐',OUR_SHOP_FIRST:'「我們的店」的第一次',TOLD_SCORE:'告訴他期中的分數',ASKED_BACK:'反問他考幾分',GIFT_NOTEBOOK_YT:'聖誕交換禮物',VIDEO_STUDY:'視訊一起讀書',ECON_TOGETHER:'一起對經濟題',RENT_RUMOR:'聽說房東的事',NOTICED_HER:'注意到她的小事',HEARD_ABOUT:'聽說過她的事',CONTEST_DAY:'比賽那天',PLAYTESTED:'測試過她的遊戲',KAI_WANTS_CREDIT:'他承認想被寫進子晴的遊戲',WATCHED_GAME:'看過他的比賽',ASKED_ABOUT_ZHE:'她問過你阿哲的事',SAW_HER_TEACH:'看過她在課輔班',FAMILY_DINNER:'家族聚餐',TREATED_FAMILY:'請了全家族飲料',FAMILY_THREE_THINGS:'家聚那晚她在群組說的話',CLAPPED:'成發那天拍了手',WATCHED_FILM:'一起看了早場電影',WATCHED_FILM_GROUP:'三個人看了早場電影',FANG_HINT:'他說了芷若高中的事',GAVE_HER_NOTE:'給了她一張便條',ASKED_HER_DRINK:'問過她自己都喝什麼',B5_STICKY:'演講完一起寫的便利貼',REMEMBERED_HER:'記得她的那一杯',
    /* 閒聊階梯大一下、大二（AA_139、AA_141、AA_142、BB_133 第 7 節的建議字樣；2026-10-16）*/
    AN2_TOMATO_EGG:'知道她寒假學了番茄炒蛋',AN2_JAPANESE:'知道她早上七點上日文課',AN2_AZALEA:'看過她拍杜鵑花（每年同一個位置）',AN2_LIKE_MOM:'聽她說講話越來越像媽媽',AN2_SUMMER:'知道她暑假七月底回台中',YT2_NEWYEAR:'聽她說過年阿姨擦椅子',YT2_INTERVIEW:'她想訪問阿姨',YT2_OLD_LAMP:'她把亮了二十年的舊燈拿回家',YT2_SEATS:'她說阿哲和 Alison 最近都坐同一邊',YT2_WORRY:'她說阿姨最近話比較少',YT2_FUTURE:'聽她說大二要往哪裡走',YT2_SUMMER:'她說暑假週二、週四照常在店裡',AN3_TUTOR:'知道她開始家教',AN3_KEIGO:'聽她說敬語是禮貌還是距離',AN3_NEEDED:'聽她說分不清哪些是自己想做的',AN3_WINTER:'她寒假要教媽媽做番茄炒蛋',YT3_BOOKS:'聽她說客人留下的三本書',YT3_FAFU:'知道她加入法服初談組',YT3_MOM_WALK:'她週末陪媽媽散步',YT3_INTAKE_LEAD:'學姊說初談組以後交給她',YT3_SEA:'她想帶阿姨去看海',AN4_AZALEA2:'杜鵑花第二張（「樹變大了，還是我變了」）',AN4_EXCHANGE_TALK:'交換說明會她坐第一排（「地方是早就決定的，今天來聽細節」）',AN4_CHOOSING:'選交換志願（「選一個地方，就是放下另外一個」）',AN4_SUMMER:'暑假回台中兩週、其他時間準備申請',YT4_SEA_TRIP:'過年帶阿姨去看海（「明年還要」）',YT4_CHAIRS:'法服記錄本第三本；椅子擺斜的，人比較敢講',YT4_MOM_GARLIC:'媽媽想來店裡幫忙，最後負責剝蒜頭',YT4_INTAKE_LEAD:'學姊畢業，初談組她在顧',YT4_FIELDWORK:'暑假開始訪問老客人，第一個是點乾麵的阿伯',ZR2_WINTER_SHOP:'聽她說寒假顧店（同一份講義印了五次的高中生）',ZR2_BACK_ROW:'聽她說電影院最好的位子（最後一排靠走道）',ZR2_HIDE_BEHIND:'聽她說期中報告的評語（「妳躲在台詞後面」）',ZR2_GLASSES:'聽她說眼鏡度數早就不對了',ZR2_TEN_MINUTES:'知道她打烊後一個人坐十分鐘',ZR2_SUMMER:'知道她暑假回台中顧店',ZQ2_HOTKEY:'聽她說寒假的快捷鍵（爸爸進來就切到課本）',ZQ2_POCKETS:'知道她外套口袋裡的全部家當',ZQ2_SUMMER_TESTER:'答應暑假當她的測試員（不支薪，包飲料）',SIS2_PLAN_V7:'聽學姊說研究計畫改到第七版',SIS2_FIRST_DRAFT:'聽學姊說她大一也被改了十二條',SIS2_SLOWER_YES:'聽學姊說「對」說得慢了一點',PS2_SIX_PLATES:'知道她一次可以端六盤',PS2_TUTOR_HEARD:'聽她說課輔班的事',PS2_NOT_ERASED:'聽她說期中沒擦掉的那個答案',PS2_WHY_LAW:'聽她說「喜歡還是考上了」',KX2_23_CALLS:'寒假視訊了二十三次（她有記）',KX2_FEWER_IFS:'予樂說她這學期笑的時間變長了',KX2_TASSEL:'木柵大學的流蘇在幫她慶祝',KX2_PLAN_SHEET:'她的行程表每次都被打亂',KX2_SUMMER:'暑假她整段回高雄'};   /* 大一上 v1 後段、大一下 v2 新的記憶：人物面板顯示中文（沒有名稱會直接顯示英文代號；v2_batch1_unit 檢查每一個都有）*/
  Object.assign(MEMORY_LABEL,{AN5_PROCEDURE:'她說程序是給看不懂的人的',AN5_BIRTHDAY:'知道她生日是九月十五號',AN5_LETTER:'她用日文寫了三行信給一年後的自己',AN5_FORM_DONE:'她的志願表理由欄寫了兩頁',AN5_PACKING:'她只能帶十本書，手帳要全部帶',AN5_SEAT:'阿姨說長桌的位子是給大家的習慣',YT5_THREE_SECONDS:'她當助教會先等三秒',YT5_INTAKE_JUNIORS:'她教初談組的學弟妹倒水',YT5_FIELD_NOTES:'她暑假訪問了十一個老客人',YT5_LEASE_SHRINE:'新租約放在神明桌旁邊',YT5_SENDOFF:'她第一次為了送人請假',YT6_THURSDAY:'她說以前週四都穿圍裙',YT6_AZALEA_FOR_AN:'她幫以安拍了杜鵑花第三張',YT6_COBBLER:'修鞋店老闆說鞋比較誠實',YT6_REPORT:'老師說她的田野筆記可以寫成報告',YT6_ASK_AUNT:'她暑假想再訪問阿姨一次',AN7_BACK:'她從日本回來，阿姨留了位子',AN7_NEIGHBOR:'日本的鄰居每天說早安',AN7_PROPOSAL:'她的研究計畫第一頁寫了七次',AN7_NO_PLAN:'她排了一個沒有計畫的週日',YT7_AUNT_STORY:'她訪問了阿姨，「這樣算故事嗎」',YT7_CHAIRS_PASSED:'學弟妹自己把椅子擺斜了',YT7_RED_PAPER:'二十三週年的紅紙是她寫的',YT7_NYE_THREE:'跨年她和阿姨、媽媽三個人看煙火',AN8_AZALEA4:'四張杜鵑花的照片',AN8_INTRODUCE:'她想好怎麼介紹媽媽',YT8_LAST_TERM:'她最後一學期只剩四學分',YT8_MOM_SHOES:'她媽媽為了典禮買新鞋',YT8_GRAD_PHOTO:'她的學士照貼在紅紙旁邊',YT8_CHOSE_THURSDAY:'她說週四是她自己選的'});   /* 閒聊階梯大三上～大四下（AA_149～152 的「給 LAWWW-B」記憶表，企劃線 b79a32a7）*/
  Object.assign(MEMORY_LABEL,{KNOW_FAV_YT:'老闆娘說了她在滇香的點法',KNOW_FAV_ZQ:'看到她冬天的那一杯',KNOW_FAV_KX:'她說了她只喝哪一種',REMEMBERED_HER_FOOD:'記得她點什麼'});   /* 她們各自喜歡吃的（AA_410，src/foodfav3d.js；名稱 AA 第 4 節確認，38b3c9dd）*/
  MEMORY_LABEL.TEAHOUSE_TEA='一起去一盞喝茶';   /* DL-12 溫州街的茶屋 */
  MEMORY_LABEL.BEING_HEARD='他說了自己想做的事';   /* 1A-04 感冒的那一週：問「那一句」的那個人（AA_315 第 5 節）*/
  Object.assign(MEMORY_LABEL,{LAW_MEETS_LIFE:'把買賣不破租賃那一頁傳給她',RENT_CONSULTATION:'聽她說陪阿姨去法服諮詢',TICKET_STUB:'她出國前給的電影票根',TOLD_HER_CHANGE:'跟她說過自己從經濟換到法律',POSTCARDS:'回寄過她從英國寄來的明信片',POSTCARDS_GROUP:'在寄給她的大明信片上寫了一句'});   /* 1B-02、1B-03、1B-06、1B-09、1B-10（AA_316、AA_321）：面板上的名稱照 AA_336 B5 定稿 */
  /* 面板名稱：AA_338 第 10 題（AA-C 21c74e3a）定稿 */ Object.assign(MEMORY_LABEL,{WATCHED_GAME_Y2B:'大二下也去看了他的系籃比賽',KX_BDAY2_CAKE:'她大二的生日，系上小教室的蛋糕',ECON_NIGHT:'經濟系之夜坐在前系友席',ZHE_PHOTOS:'跟他說搬進去那天要拍照',HEARD_FROM_ZIQING:'她錄取的事，先聽子晴說了',MX_TOLD:'聽他說，他跟以安說出口了',HEARD_ECON_NIGHT:'經濟系之夜沒去，聽說了那張空椅子',HELP_OFFERED:'說過想幫她', SHE_SAW_HIM:'她看出你最近很累', DROVE_HER:'開車送她去機場', AN_CHOICE_TOLD:'她說要考商法組的時候，你在', ANNIVERSARY_23:'麵店二十三週年那晚在場', REPLIED_US0:'她到美國那天，回了她的訊息', SIS_LAWLIB_NOTE:'十月的法圖，她用便利貼問你小考', SIS_RESULT_TOLD:'放榜那天，你先查到她的名字'});   /* 事件包第 2 輪之一（AA_325，src/y2r2_3d.js）*/
  Object.assign(MEMORY_LABEL,{ENC_D06_BH3:'在美術館遇到他（第三次）',ENC_D04_ZR3:'在西門町的電影院門口遇到她（第三次）',ENC_D12_ZQ3:'在大稻埕碼頭遇到她（第三次）'});   /* DL-08 小支線的第三次（enc_walk.js side 的 mem）；其他 ENC_ 的名稱在 encounters.js 的 labels */
  Object.assign(MEMORY_LABEL,{AN_BDAY_POMELO:'在中秋那天幫她過生日',ZHE_SAID_IT:'他第一次說自己「有事」',SAW_HIM_TRY:'聽他說交換放棄了，畢業以後自己存錢去'});   /* 1C 群戲（AA_324；src/group3d.js）：AN_BDAY_POMELO 照 AA_324 1C-02 第 4 節、ZHE_SAID_IT 照 AA_40 哲 4「影響」、SAW_HIM_TRY 照 AA_336 C13（選「那出國呢？」才記的）*/
  /* 面板名稱：大三前半（AA_326，r2y3a3d.js 原本在執行時才加）、第 3 輪（AA_328，r3_3d.js 原本在執行時才加）。AA_326 寫了的照寫；MOUNTAIN_DAY、FANG_KNOWS_ECON、DAD_PLAYS、BOHAN_HONEST、FIELD_NOTES_IDEA、何俊朗四項（MET_LONG、LONG_HAIHAO、LONG_BBQ、LONG_MENU）照 AA_343 第 5 節定稿 */ Object.assign(MEMORY_LABEL,{AN_ADMIN_COURT:'她自己去行政法院旁聽',ZHE_SCOOTER:'他擦撞以後，你叫他先不要簽',MOUNTAIN_DAY:'跟他去爬山，看了那棵一千歲的紅檜',FANG_KNOWS_ECON:'跟他說，自己換過一次跑道',DAD_PLAYS:'她爸爸在玩她做的遊戲，卡在第三關',BOHAN_HONEST:'他說了為什麼每天念六小時',FIELD_NOTES_IDEA:'跟她說，田野的訪問可以整理成她自己的東西',ZR_FEE_LETTER:'陪她把試譯稿費的事問清楚',KAI_BOT:'教他的機器人說「先吃飯」',FANG_LAWTREE:'說好下次帶他看法學院的樹',ZR_SWAN:'拉花比賽投了她',PINYU_WORRY:'期末考週在社科圖，聽她說精算的事',KAI_STAYED_UP:'他寫的 bug 那晚，陪他醒著',CHIAYI_TREE:'開車去嘉義看那棵兩千歲的紅檜',MET_SIS_FATHER:'見過她爸爸',SIS_DAY_OFF:'她自己放的一天假',ZQ_DOG_TOLD:'聽她唸她爸爸那則「第七關那隻狗」',MET_LONG:'在美國認識了香港來的 Long',LONG_HAIHAO:'被他問：台灣人的「還好」到底是好還是不好',LONG_BBQ:'「誰都」和「誰也」，最後兩個人一起去了聚餐',LONG_MENU:'中餐館的西蘭花：同一盤菜，兩個名字'});
  /* 面板名稱：學姊大二到大三（AA_379 第 2-8 節，企劃線 30ab5142；src/sis_y2y3_3d.js）*/ Object.assign(MEMORY_LABEL,{SIS_TOPIC:'知道她論文想寫什麼、為什麼',SIS_INTERVIEW:'陪她去訪談法扶律師',SIS_US_TOLD:'她第一個當面告訴你要去美國'});
  /* 面板名稱：學姊第四批（AA_386 第 5 節，企劃線 e848154a；src/sis_b4_3d.js）*/ Object.assign(MEMORY_LABEL,{SIS_ADV_GRAD:'她說準備研究所準備得太早',SIS_ADV_EXCH:'她問：晚半年會怎樣',SIS_ADV_PICK:'她看了你的志願表',SIS_ADV_Y4:'她說：你的大四，你自己排',SIS_XMAS_Y2:'聖誕夜，Café 門口的熱水',SIS_XMAS_Y3:'研究室的小聖誕樹',SIS_VDAY_Y2:'情人節，植物園的荷花池',SIS_VDAY_Y3:'寒假那一天的假，公車坐到終點站',SIS_VDAY_Y4:'情人節的電話，她在陽台',SIS_REBUILD:'她說：等她說好的那天'});
  /* 面板名稱：大三後半（AA_326 26～54，r2y3b3d.js 原本在執行時才加）。AN3_AZALEA、YU_CLUB_BEAR、YU_ALONE 是 AA_326 寫的；XUN_PATH、YU4_SAT、ZHIRUO_MET_YU、XINCI_FIRST 照 AA_343 第 5 節定稿 */ Object.assign(MEMORY_LABEL,{AN3_AZALEA:'幫她拍了第三張杜鵑',YU_CLUB_BEAR:'學弟的熊',YU_ALONE:'她一個人去看了一場電影',XUN_PATH:'去聽了他在經濟系的報告',YU4_SAT:'在晨思鐘旁邊陪她吃完早餐，兩個人都沒講話',ZHIRUO_MET_YU:'跟她說，戲院倒數第三排那個女生是 Alison',XINCI_FIRST:'以安不在的那學期，她第一次考第一'});
  /* 面板名稱：大四前半（AA_327 01～29）。AA_345 第 4 節定稿（F11）*/ Object.assign(MEMORY_LABEL,{CHICAGO_TRIP:'芝加哥的週末，她把行程表摺起來收進口袋',PLG_LAST_RULE:'讀書會交棒那天，白板上只剩一條：「說理由。」',PICKED_HER_UP:'她從美國回來那晚，去機場接她'});
  /* AA_344 第 3 節：③ KX7_LAST_TERM 換新名稱（ladder.js 匯入的舊名稱「她怕畢業以後忘記假設」：這裡優先）；④ 以安不延畢以後沒人用的 AN8_RETAKE、AN8_DIPLOMA 已刪 */ MEMORY_LABEL.KX7_LAST_TERM='她怕畢業以後約吃飯要排半個月';
  /* 面板名稱：208 的週末（AA_412 第 3-8 節，AA-B 10-23；src/us208_3d.js）*/ Object.assign(MEMORY_LABEL,{US208_MEMO:'書瑀幫你看 Legal Writing 的作業',US208_LUROU:'書瑀煮了有一點焦的滷肉',US208_CLIPPING:'書瑀的爸爸寄了一張剪報到美國',US208_REHEARSAL:'聽書瑀練習英文報告',US208_EXTRA_HOUR:'冬令時間那天，計畫本空了一格',US208_PLANT:'書瑀在救客廳那盆植物',US208_LASTWEEK:'期末那個週末，坐在 208 的沙發上讀書'});
  /* 面板名稱：美國篇的空白日（AA_424，AA-B 10-23；src/us_blank3d.js）——名稱 AA_424 第 7-2 節定稿（a4ee6c74a）*/ Object.assign(MEMORY_LABEL,{US_FALLBREAK_LAKE:'秋假的湖邊，長椅只有你們兩個',US_FALLBREAK_STUDY:'秋假的自習室，她空出一格',US_ASIAN_MARKET:'陪書瑀去竹葉，她買了一包八角',US_LAKE_DOG:'書瑀說她小時候很怕狗',US_SYLLABUS:'書瑀替你把第一週的閱讀排進格子',US_LAUNDRY:'她來借洗衣機，在你的沙發上看書'});
  Object.assign(MEMORY_LABEL,{AN_GRAD_PASS:'她研究所放榜那晚，在麵店',AN_COLUMBIA:'她說哥大上了，八月要去紐約'});   /* AA_327 2-Y4-34、2-Y4-50（src/data/r2y4b_events.js）：面板名稱 AA_345 第 4 節定稿（G7）*/
  Object.assign(MEMORY_LABEL,{PS7_SPECIAL_ED:'沛珊說她晚兩年',PS7_DECIDE:'沛珊選了國小'});   /* 沛珊大四上的階梯記憶（AA_262 第 6 點、BB_209：階梯台詞照 AA_282 改了，名稱跟著改；企劃的階梯表 BB_142 還是舊名稱，匯入的 LADDER.labels 會帶舊的——這裡優先）*/
  Object.assign(MEMORY_LABEL,{AN_JP_LIGHT:'她房間的燈，是你換的',AN_JP_FIREWORK:'在河堤看了她在日本的第一場煙火'});   /* 面板名稱：日本篇的空白日（AA_435 第 7 節；src/jp_blank3d.js 也會登記，一字相同）*/
  MEMORY_LABEL.ZR_WITH_ZQ='她和子晴在交往'; MEMORY_LABEL.ZQ_WITH_ZR='她和芷若在交往';   /* 芷若×子晴：祐廷知道她們在一起以後的人物頁（AA_232 4-7「他之後在人物頁看到兩人的關係」；src/zrzq3d.js 的 coupleMem）*/
  Object.assign(MEMORY_LABEL,{ZQ_ZR_FILM_DAY:'她說室友跟系上的人去看了電影',ZZ_TOLD_YT:'她自己告訴你，她們在一起了'});   /* 名稱 AA_385 第 10 節（企劃線 946b1b72）定；AA_385 第 3 項（大一下子晴 Q2-L3 的 4-1 第 5 句）、第 4 項（其中一人自己告訴祐廷）的記憶：AA 沒寫人物頁的名稱，照台詞寫的暫定名稱（同 BB_130 ZQ_ZR_SETUP_* 的寫法），待 AA 定 */
  MEMORY_LABEL.ZR_LAST_SCREENING='出國前的最後一場，二輪戲院';   /* 芷若：出國前的最後一場（AA_387 第 4 節，企劃線 608b9adc；src/zr_last3d.js）*/
  Object.assign(MEMORY_LABEL,{SIS5_NOT_BUSY:'學姊說碩士生不閒',SAW_HER_OFF:'她出發那天，你在機場等她',SIS_OLD_NOTES:'她把大二債各的筆記給你',SIS_XMAS_PENCIL:'她送了你一支刻了名字的鉛筆',W3_TAUGHT:'她要你把那一段講給她聽',ZQ_TESTBUILD:'她給了你遊戲的測試版'});   /* AA_398 第 50 列（使用者 10-23：學姊不數件數）：原本 ladder 匯入的「學姊的第三件事「還在想」」，這裡有就不從階梯文件拿 */
  MEMORY_LABEL.ZR_SAW_OFF='她出發那天，你去了機場';   /* 芷若 2027-09-02 送機（AA_390 第 3 節，企劃線 5f4b9c7b；src/zr_sendoff3d.js）*/
  MEMORY_LABEL.ZHOU_Y4='大四去了周教授的研究室';   /* 周教授大四下專題的研究室（AA_522 1-3、第 5 節，企劃線 fcc93126e；名稱就是稿上那一句，記的時候不另外寫備註）*/
  Object.assign(MEMORY_LABEL,{SIS_SAW_BRUNCH:'她在早午餐店看到你在打工',ENC_PARK_ZQ:'夜裡在公園的鞦韆遇到她',TEA_CEREMONY:'一起去過茶席'});   /* 面板名稱：溫州街（AA_420 第 8、10 節，BB_148 8b；茶席 AA_167；src/data/wz_events.js、src/wzlines3d.js）*/
  Object.assign(MEMORY_LABEL,{SIS_BORROWED_CARD:'暑假她用你的學生證借書',SIS_HOTPOT_Y2:'寒假一起幫 Kevin 吃了一份',SIS_FAM_STUDY:'去了家族讀書會的第一次',SIS_LAWLIB_KEVIN:'法圖午休，看她把 Kevin 叫醒',SIS_FAM_STUDY_LAST:'家族讀書會的最後一次',SIS_STUDY_ROOM:'說要幫忙訂討論室',SIS_BLANK_JAN:'她給你看過空白的一月'});   /* 面板名稱：學姊第十二批（AA_470 第 3 節括號裡的字，企劃線 5f54b6545；src/data/sis_b12_events.js）*/
  MEMORY_LABEL.SIS_ABSTRACT='她給你看過論文摘要'; MEMORY_LABEL.SIS_DEFENSE_DATE='她告訴你口試的日子';   /* SIS_DEFENSE_DATE：AA_455 3-1 節②（企劃線 0c5afca90）*/   /* 學姊第十一批 11-1（AA_455 第 1 節，企劃線 2de70709f；src/data/sis_b11_events.js）。11-2 的 SIS_DEFENSE_DATE 稿沒寫面板名稱，沒加 */
  /* 面板名稱：以安、語彤交往中的節日・第一批（AA_414，企劃線 b1fc4bf30；src/an_yt_hol3d.js）*/ Object.assign(MEMORY_LABEL,{AN_VDAY_TC:'情人節去台中找她',AN_VDAY_OMAMORI:'她從東京帶回來一個學業御守',AN_VDAY_PEN:'送她一支鋼筆',AN_VDAY_CHOCO:'送她一盒巧克力',AN_VDAY_CALL:'初二那天，她躲到陽台打給你',YT_VDAY_RIVER:'店休那天，阿姨叫你們去別的地方',YT_VDAY_SHOP:'阿姨在門口貼了情人節的紅紙',YT_VDAY_FIELD:'她帶你去看她做田野的地方',YT_VDAY_NIANGAO:'阿姨叫她拿年糕給你',YT_MOON:'中秋在麵店門口剝柚子'});
  /* 面板名稱：節日（AA_416 1-7，企劃線 ed80edb71；src/fest3d.js）：HOL_<節日>_<年>＝「<年> 的情人節，和她一起過」，照節日換字 */ for(const [k,t] of [['VDAY','情人節'],['WHITE','白色情人節'],['QIXI','七夕'],['BDAY','生日'],['XMAS','聖誕節'],['NYE','跨年']]) for(let y=2025;y<=2029;y++) MEMORY_LABEL['HOL_'+k+'_'+y]=y+' 的'+t+'，和她一起過';
  if(typeof LADDER!=='undefined'&&LADDER.labels) for(const k in LADDER.labels) if(!MEMORY_LABEL[k]) MEMORY_LABEL[k]=LADDER.labels[k];   /* 閒聊階梯的記憶名稱：匯入工具從企劃線的階梯文件表格抓（tools/ladder/import_ladder.py）*/
  MEMORY_LABEL.HXH_SUBJECT='當過她的受試者';   /* 面板名稱：黃筱涵 4-2 當受試者（AA_519，企劃線 d75cd0228；src/sup519_3d.js）*/
  S.MEMORY_LABEL=MEMORY_LABEL;
  return S;
})();
