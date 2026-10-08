/* ===== 04 核心引擎：狀態、存檔、學習模型、回合結算、學期流程 ===== */
let G = null;
const SAVE_KEY='fatiao_autosave_v3', SLOT_KEY='fatiao_slot_v3_';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const rnd=(a,b)=>a+Math.random()*(b-a);
const pick=arr=>arr[Math.floor(Math.random()*arr.length)];
const chance=p=>Math.random()<p;
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmtT=s=>String(s).replace(/\{name\}/g, G&&G.player?G.player.name:'你');
const money=n=>Math.round(n).toLocaleString('zh-TW');

const SEM_BLOCKS = [
  {id:'w1', label:'第1週', kind:'plan', tag:'開學週', weeks:1},
  {id:'w2', label:'第2–3週', kind:'plan', weeks:2},
  {id:'w4', label:'第4–5週', kind:'plan', weeks:2, after:'firstquiz'},
  {id:'w6', label:'第6–7週', kind:'plan', weeks:2},
  {id:'w8', label:'第8週', kind:'plan', tag:'期中考前', weeks:1, examWeek:true},
  {id:'mid', label:'期中考週', kind:'exam', which:'mid'},
  {id:'w10', label:'第10–11週', kind:'plan', weeks:2},
  {id:'w12', label:'第12–13週', kind:'plan', weeks:2},
  {id:'w14', label:'第14–15週', kind:'plan', weeks:2},
  {id:'w16', label:'第16–17週', kind:'plan', tag:'期末考前', weeks:2, examWeek:true},
  {id:'fin', label:'期末考週', kind:'exam', which:'fin'},
  {id:'grades', label:'放榜', kind:'grades'},
  {id:'break', label:'假期', kind:'break'},
];
const BACKGROUNDS = {
  family:{ id:'family', name:'家裡支持多，期待也多', desc:'生活費充裕。家人常常問「以後要當律師還是法官」。', money:60000, allowance:8000 },
  work:{ id:'work', name:'需要打工，但比較懂職場', desc:'高中就在打工，看人臉色很快。生活費要自己顧。', money:15000, allowance:2500 },
  academic:{ id:'academic', name:'讀書底子好，人際比較慢熟', desc:'高中成績很好，習慣自己讀。開學第一週還不知道系上的人叫什麼。', money:35000, allowance:5000 },
};
const HAIR_STYLES=['短髮','中長髮','長髮','捲髮'];
const SKINS=['#F5DCC4','#F0D0B4','#E9C4A2','#D9B48E','#B98964'];
const HAIRS=['#1F1710','#3A2A1A','#6B4423','#8B5E3C','#B0793E','#4B2E1E','#2B2B3A'];
const TOPS=['#2F5D50','#4A6C8C','#7A2E3B','#C9A24F','#7B6A5A','#3E5A48','#8B5E3C','#5A5A7A'];

function newCourseState(){ return {u:5,s:3,m:3,r:3,i:2,a:2,part:0,cram:0,mid:null,fin:null,grade:null,touched:0}; }
function newGame(opts){
  const bg=BACKGROUNDS[opts.bg||'academic'];
  G={ v:3, mode:opts.mode||'full', phase:'uni', screen:'enroll', ctx:'uni',
    player:{ name:opts.name||'小法', look:opts.look||{skin:1,hair:0,hairStyle:0,top:0}, bg:bg.id,
      money:bg.money, energy:80, stress:20,
      skills:{ structure:10, speed:10, research:8, express: bg.id==='family'?17:bg.id==='work'?16:9, judgment: bg.id==='work'?16:8, lang:{en: bg.id==='academic'?35:bg.id==='family'?40:25, ja:0, de:0} },
      rep:0 },
    time:{ year:1, sem:1, block:0, absWeek:0 },
    housing:null, enrolled:[], courses:{}, semesters:[], retake:[],
    npcs:{}, flags:{}, diary:[], stats:{study:0,rest:0,work:0,group:0,social:0,sport:0,intern:0,blocks:0},
    streak:0, sched:[], log:[], pendingEvent:null, usedEvents:{}, queue:[],
    exch:{interested:false, app:0, applied:false, dest:null, going:false, done:false},
    bar:null, career:null, careerYears:0, semAvg:null, lastExam:null, previewed:{}, groupBonus:false,
    barGoal:null, seed:Math.floor(Math.random()*1e9),
  };
  for(const id in NPCS){ G.npcs[id]={rel: id==='mom'?60:0, stage:'', news:'', met: id==='mom'||id==='cat', ...(id==='cat'?{met:false}:{})}; }
  if(bg.id==='academic'){ G.acadBonus=true; }
  if(bg.id==='work'){ G.workExp=true; }
  MAIN_NPCS.forEach(npcLifeUpdate);
  return G;
}
// ---------- 時間 ----------
function curBlock(){ return SEM_BLOCKS[G.time.block]; }
function curBlockId(){ const b=curBlock(); return b?b.id:''; }
function yearName(y){ return ['大一','大二','大三','大四','大五','大六'][y-1]||('第'+y+'年'); }
function timeLabel(){
  if(G.screen==='gradChoice') return '畢業';
  if(G.phase==='uni'){ const b=curBlock(); return yearName(G.time.year)+(G.time.sem===1?'上':'下')+'・'+(b?b.label:''); }
  if(G.phase==='exch') return exchTimeLabel();
  if(G.phase==='bar') return barTimeLabel();
  if(G.phase==='career') return careerTimeLabel();
  return '';
}
function playerAge(){ return 18+ (G.time.year-1) + (G.phase==='career'||G.phase==='bar'? (G.postYears||0):0); }
// ---------- 通用效果 ----------
function addRel(id,n){ const x=G.npcs[id]; if(!x) return; x.rel=clamp((x.rel||0)+n,-20,100); }
function setFlag(k,note){ if(!G.flags[k]){ G.flags[k]={t:timeLabel(), note:note||''}; } }
function courseFx(cid,fx){ const c=G.courses[cid]; if(!c) return; for(const k in fx){ if(k==='research'){G.player.skills.research+=fx[k];continue;} c[k]=clamp((c[k]||0)+fx[k],0,100); } c.touched=(c.touched||0)+1; }
function diary(text){ G.diary.push({t:timeLabel(), text:fmtT(text)}); if(G.diary.length>80) G.diary.shift(); }
function relLabel(v){ return v>=60?'很熟':v>=35?'朋友':v>=15?'認識':v>=0?'點頭之交':'有點疏遠'; }
// ---------- 存檔 ----------
function save(){ try{ localStorage.setItem(SAVE_KEY, JSON.stringify(G)); }catch(e){} }
function loadAuto(){ try{ const s=localStorage.getItem(SAVE_KEY); if(s){ const g=JSON.parse(s); if(g&&g.v===3) return g; } }catch(e){} return null; }
function saveSlot(n){ try{ localStorage.setItem(SLOT_KEY+n, JSON.stringify({t:Date.now(), label: (G.player.name+'・'+timeLabel()), g:G})); return true; }catch(e){ return false; } }
function slotInfo(n){ try{ const s=localStorage.getItem(SLOT_KEY+n); if(!s) return null; const o=JSON.parse(s); return {label:o.label, t:o.t}; }catch(e){ return null; } }
function loadSlot(n){ try{ const s=localStorage.getItem(SLOT_KEY+n); if(!s) return false; const o=JSON.parse(s); if(o.g&&o.g.v===3){ G=o.g; return true; } }catch(e){} return false; }
function exportJSON(){ return JSON.stringify(G); }
function importJSON(str){ try{ const g=JSON.parse(str); if(g&&g.v===3&&g.player){ G=g; return true; } }catch(e){} return false; }
function storageOK(){ try{ localStorage.setItem('__t','1'); localStorage.removeItem('__t'); return true; }catch(e){ return false; } }
// ---------- 學習模型 ----------
function courseStatus(c){
  if(!c) return {s:0,t:'尚未接觸'};
  const avg=(c.u+c.s+c.m+c.r+c.i+c.a)/6;
  if(c.u>=70&&c.i>=60&&c.a>=55&&c.r>=55) return {s:5,t:'已相當熟練'};
  if(c.i>=45&&c.a>=35&&c.r>=35) return {s:4,t:'能獨立作答'};
  if(c.i>=30||(c.u>=45&&c.r>=30)) return {s:3,t:'能辨識'};
  if(c.m>=25&&c.r<20) return {s:2,t:'熟悉但提取不出來'};
  if(c.u>=20) return {s:2,t:'尚未穩固'};
  if(avg>=6) return {s:1,t:'剛開始'};
  return {s:1,t:'尚未接觸'};
}
function studyEff(){
  let e=1; const p=G.player;
  if(p.energy<30) e*=0.65; else if(p.energy<50) e*=0.85;
  if(p.stress>75) e*=0.85;
  e*=Math.max(0.55, 1-0.07*(G.streak||0));
  const heavy=G._blockStudy||0; if(heavy>=6) e*=0.9; if(heavy>=8) e*=0.8;
  return e;
}
function gain(cid, fx, eff){ // 考試週：部分進入 cram
  const c=G.courses[cid]; if(!c) return; const b=curBlock(); const exam=b&&b.examWeek;
  for(const k of ['u','s','m','r','i','a']){ if(!(k in fx)) continue; let v=fx[k]*eff; if(exam&&v>0){ c.cram=clamp(c.cram+v*0.5,0,40); v*=0.8; } c[k]=clamp(c[k]+v,0,100); }
  if('part' in fx) c.part=clamp(c.part+fx.part,0,100);
  if(c.r>c.m+15) c.r=c.m+15;
  c.touched=(c.touched||0)+1;
}
function courseName(cid){ if(cid==='en') return '英文'; if(cid==='ja') return '日文'; const c=COURSES[cid]; return c?c.name:cid; }
// ---------- 選課與學期 ----------
function freeSlots(){ let n=7; if((G.enrolled||[]).length>=6) n=6; if(G.retake.length) n-=1; if(G.housing==='commute') n-=0; return Math.max(4,n); }
function beginSemester(){
  G.time.block=0; G.previewed={}; G.streak=0; G.semExams={}; G.reportBonus=0; G.examPenalty=0; G.lastExam=null; G.midDone=false;
  MAIN_NPCS.forEach(npcLifeUpdate);
  G.enrolled.forEach(cid=>{ if(!G.courses[cid]){ G.courses[cid]=newCourseState(); if(G.acadBonus){ G.courses[cid].u+=8; G.courses[cid].s+=5; } } });
  G.screen='plan'; G.sched=[]; save();
}
function passiveWeek(weeks){ // 每週被動效果
  const p=G.player;
  for(let w=0;w<weeks;w++){
    p.energy=clamp(p.energy+8,0,100); p.stress=clamp(p.stress-2,0,100);
    // 遺忘
    for(const cid in G.courses){ const c=G.courses[cid]; const enrolled=G.enrolled.includes(cid);
      c.r=clamp(c.r-(enrolled?1.0:0.4),0,100); if(c.r<25) c.m=clamp(c.m-0.3,0,100); c.cram=c.cram*0.7; }
    for(const id of MAIN_NPCS){ const n=G.npcs[id]; if(n.met&&id!=='mom'&&id!=='cat') n.rel=Math.max(-20,n.rel-0.35); }
    G.time.absWeek++;
  }
}
// ---------- 排程 ----------
function planSet(idx, actId, course){ G.sched[idx]={act:actId, course:course||null}; }
function planClear(idx){ G.sched.splice(idx,1); }
function actAvailable(a){
  const y=G.time.year;
  if(a.need==='partner'&&!G.flags.yu_partner) return false;
  if(a.need==='year2'&&y<2) return false;
  if(a.need==='year3'&&y<3) return false;
  if(a.need==='year4'&&y<4) return false;
  if(a.need==='applyWindow'&&!(y===2&&G.time.sem===2&&!G.exch.applied)) return false;
  if(a.need==='rel'&&!(G.sisNotes==='have'||(G.npcs.an.rel>=20)||(G.npcs.sis.rel>=20))) return false;
  if(a.id==='club'&&!G.npcs.zhe.met&&y===1&&G.time.sem===1) return false;
  return true;
}
function uniActs(){ return ACT_ORDER.map(id=>ACTS[id]).filter(actAvailable); }
function planPreview(){
  const lines=[]; let en=0,st=0,mo=0; const touched={}; let study=0, rest=0;
  for(const s of G.sched){ const a=ACTS[s.act]; if(!a) continue; en+=a.energy||0; st+=a.stress||0; mo+=a.money||0; if(a.cat==='學習'&&a.id!=='speak') study++; if(a.id==='rest'||a.id==='game'||a.id==='sport') rest++;
    if(s.course&&COURSES[s.course]){ touched[s.course]=touched[s.course]||[]; touched[s.course].push(a.id); } }
  for(const cid in touched){ const acts=touched[cid]; const up=[]; if(acts.some(x=>['read','preview'].includes(x))) up.push('理解'); if(acts.some(x=>['read','notes','borrow'].includes(x))) up.push('體系'); if(acts.some(x=>['notes','borrow','review'].includes(x))) up.push('記憶'); if(acts.some(x=>['review','timed'].includes(x))) up.push('提取'); if(acts.some(x=>['cases'].includes(x))) up.push('爭點・涵攝'); if(acts.some(x=>['timed'].includes(x))) up.push('結構・速度'); if(acts.includes('speak')) up.push('課堂參與');
    const c=G.courses[cid]; let warn=''; if(acts.includes('cases')&&c&&c.u<25) warn='（理解還不夠，練案例可能看不出爭點）'; if(acts.includes('notes')&&c&&c.u<20) warn='（還沒讀懂就整理，效果有限）'; if(acts.includes('timed')&&c&&c.i<20) warn='（還抓不到爭點，限時練題會很挫折）';
    lines.push('<b>'+esc(courseName(cid))+'</b>：'+up.join('、')+'<span class="arrow">↑</span> '+warn); }
  const untouched=G.enrolled.filter(c=>COURSES[c].exam&&!touched[c]); if(untouched.length&&G.sched.length>=3) lines.push('<span class="sub">沒碰到：'+untouched.map(courseName).join('、')+'（提取度會慢慢下降）</span>');
  const p=G.player; const b=curBlock(); const enFinal=p.energy+en+7*(b?b.weeks||2:2);
  const meta=[]; meta.push('精力 '+(en>=0?'+':'')+en+(enFinal<30?' <span class="arrow d">（會很低）</span>':'')); meta.push('壓力 '+(st>=0?'+':'')+st); if(mo) meta.push('金錢 '+(mo>0?'+':'')+money(mo));
  lines.push(meta.join('　'));
  if(study>=5&&rest===0) lines.push('<span class="arrow d">整段時間沒有安排任何休息：連續高強度讀書會出現邊際效益遞減。</span>');
  if(G.streak>=1&&rest===0&&study>=4) lines.push('<span class="arrow d">已連續 '+G.streak+' 段高強度：效率約 '+Math.round(Math.max(0.55,1-0.07*G.streak)*100)+'%。</span>');
  if(p.energy<35) lines.push('<span class="arrow d">目前精力偏低，讀書效率打折。</span>');
  if(b&&b.examWeek) lines.push('<span class="sub">考試週：這段時間的學習有一部分是短期記憶，考完會慢慢忘掉。</span>');
  return lines;
}
// ---------- 結算 ----------
function pushLog(o){ G.log.push(o); }
function resolveBlock(){
  const b=curBlock(); const weeks=b.weeks||2; G.log=[]; G._blockStudy=0; const p=G.player;
  const study=G.sched.filter(s=>ACTS[s.act]&&ACTS[s.act].cat==='學習'&&s.act!=='speak').length;
  const rest=G.sched.filter(s=>['rest','game','sport'].includes(s.act)).length;
  pushLog({kind:'n', scene: G.housing==='dorm'?'dorm':'campus', pose:'stand', t: timeLabel()+(b.tag?'（'+b.tag+'）':'')});
  // 上課
  const classLines=[]; for(const cid of G.enrolled){ const co=COURSES[cid]; const c=G.courses[cid]; const T=TEACHERS[co.teacher]; const pre=G.previewed[cid]?1.6:1;
    if(co.lang){ const k=co.lang; G.player.skills.lang[k]=clamp(G.player.skills.lang[k]+2.2*weeks,0,100); c.u=clamp(c.u+3*weeks,0,100); continue; }
    gain(cid,{u:2.6*weeks*pre, s:(T.style==='sys'?2:1)*weeks, i:(T.style==='case'?1.6:0.6)*weeks, a:(T.style==='case'?1:0.4)*weeks, m:1*weeks, r:0.6*weeks, part:(T.style==='disc'?1:0)*weeks},1);
  }
  G.player.skills.structure=clamp(G.player.skills.structure+0.15*weeks,0,100); G.player.skills.speed=clamp(G.player.skills.speed+0.15*weeks,0,100);
  G.previewed={};
  pushLog({kind:'n', scene:'classroom', pose:'sit', t:'上課：'+G.enrolled.map(courseName).join('、')+'。'+pick(FLAVOR.campus).t});
  // 活動
  let lostSlot=false;
  G.sched.forEach((s,idx)=>{ if(lostSlot){ lostSlot=false; pushLog({kind:'loss',scene:'library',pose:'read',t:'（上一個活動花掉的時間，把這一格也吃掉了：'+ACTS[s.act].name+'沒做成。）'}); return; }
    const r=applyAct(s); if(r&&r.lost) lostSlot=true; });
  // 被動
  passiveWeek(weeks);
  if(b.examWeek) p.stress=clamp(p.stress+8,0,100);
  const inc=BACKGROUNDS[p.bg].allowance*(weeks/2); const exp=(3000+(G.housing==='dorm'?1500:900))*(weeks/2);
  p.money+=inc-exp; pushLog({kind:'n',scene:'store',pose:'stand',t:'這段時間：生活費 −'+money(exp)+(inc?'，家裡／零用 +'+money(inc):'')+'。餘額 '+money(p.money)+' 元。'});
  if(p.money<0){ p.money=0; }
  // 連續高強度
  if(study>=5&&rest===0) G.streak=(G.streak||0)+1; else if(rest>0||study<=3) G.streak=0;
  if(G.streak>=3) setFlag('overwork');
  G.stats.study+=study; G.stats.rest+=rest; G.stats.blocks++;
  if(rest>=2) G.stats.restBlocks=(G.stats.restBlocks||0)+1;
  // 事件（大一上每段兩件，其餘一件）
  G.pendingEvent=pickEvent(UNI_EVENTS);
  G.pendingNext= (G.time.year===1&&G.time.sem===1&&G.pendingEvent)?pickEvent(UNI_EVENTS,G.pendingEvent):null;
  save();
}
function applyAct(s){
  const a=ACTS[s.act]; if(!a) return; const p=G.player; const cid=s.course; const c=cid?G.courses[cid]:null; const eff=studyEff(); const isStudy=a.cat==='學習'&&a.id!=='speak';
  const fl=FLAVOR[a.id]; let flavor=null; if(fl){ for(const f of fl){ if(chance(f.p*0.9)){ flavor=f; break; } } }
  const base={kind:'line', scene:a.scene, pose:a.pose, t:''}; let note='';
  const cn=cid?courseName(cid):'';
  switch(a.id){
    case 'preview': gain(cid,{u:3},eff); G.previewed[cid]=true; note=cn+'預習：上課會吸收得更多。'; break;
    case 'read': { if(COURSES[cid].lang){ const k=COURSES[cid].lang; p.skills.lang[k]=clamp(p.skills.lang[k]+2.5*eff,0,100); gain(cid,{u:4},eff); note='讀'+cn+'的教材：語言能力上升。'; break; } const fx={u:9*(1-c.u/130), s:4, m:5, r:3}; if(flavor&&flavor.fx){ fx.u+=flavor.fx.u||0; if(flavor.fx.research){ p.skills.research+=flavor.fx.research; setFlag('footnote'); } } gain(cid,fx,eff); note='讀'+cn+'：理解與體系上升'+(c.u>75?'（這科的課本已經讀得很熟，邊際效益不高）':'')+'。'; break; }
    case 'notes': { const ok=c.u>=20; gain(cid,{s:ok?8:4, m:ok?6:3, r:3},eff); p.skills.structure=clamp(p.skills.structure+0.6*eff,0,100); if(flavor&&flavor.fx) gain(cid,flavor.fx,1); note='整理'+cn+'筆記：'+(ok?'結構與記憶上升。':'你整理了，但其實不太懂在整理什麼。先讀課本比較好。'); break; }
    case 'cases': { const ok=c.u>=25; if(ok){ gain(cid,{i:8,a:6,r:3},eff); note='練'+cn+'案例：爭點辨識與涵攝上升。'; } else { gain(cid,{i:3,r:1},eff); note='練'+cn+'案例：看不太出爭點在哪裡。理解還不夠，效果有限。'; } break; }
    case 'timed': { const ok=c.i>=20; if(ok){ gain(cid,{r:4,a:3,i:2},eff); p.skills.structure=clamp(p.skills.structure+1.8*eff,0,100); p.skills.speed=clamp(p.skills.speed+1.8*eff,0,100); note='限時練'+cn+'：答案結構與速度上升。'; } else { p.skills.speed=clamp(p.skills.speed+0.8*eff,0,100); gain(cid,{r:2},eff); note='限時練'+cn+'：寫得很快，但寫的都不是重點。先練案例找爭點。'; } break; }
    case 'review': { gain(cid,{r:10,m:3,u:1},eff); note='複習'+cn+'：提取度上升'+(c.m<15?'（能複習的東西還不多）':'')+'。'; break; }
    case 'research': { p.skills.research=clamp(p.skills.research+2.5*eff,0,100); gain(cid,{u:3,i:1},eff); if(flavor&&flavor.fx&&flavor.fx.research) p.skills.research+=flavor.fx.research; note='查'+cn+'的判決與文章：研究能力上升。'; if(chance(0.35)){ note+='比預期多花了很多時間。'; base.lost=true; } break; }
    case 'speak': { const ok=c.u>=25; gain(cid,{part:ok?15:6},1); p.skills.express=clamp(p.skills.express+(ok?1.5:0.7),0,100); p.stress+=3; note=cn+'課堂發言：'+(ok?'老師點頭，同學回頭。':'講到一半發現自己還沒讀到那裡。'); break; }
    case 'borrow': { const ok=c.u>=30; gain(cid,{s:ok?6:2, m:ok?6:2},eff); note='借'+cn+'筆記：'+(ok?'結構清楚，省了不少時間。':'很好的筆記，但你看不懂它在寫什麼。還是得自己讀。'); break; }
    case 'group': { const half=flavor&&flavor.half; const mult=(G.groupBonus?1.4:1)*(half?0.5:1); G.enrolled.filter(x=>COURSES[x].exam).forEach(x=>gain(x,{i:2.5*mult, r:2.5*mult},eff)); addRel('an',1.5); addRel('zhe',1.5); if(G.zheStudy) addRel('zhe',1.5); G.stats.group++; note='讀書會：'+(half?'效率一般，但關係更好了。':'交換了幾個爭點的看法。'); break; }
    case 'lang': { const k=s.course||'en'; p.skills.lang[k]=clamp((p.skills.lang[k]||0)+3.2*eff,0,100); note='自學'+(k==='ja'?'日文':'英文')+'：語言能力上升。'; break; }
    case 'apply': { G.exch.app=clamp(G.exch.app+14,0,100); note='準備交換申請：讀書計畫寫了一段，志願序改了三次。（進度 '+Math.round(G.exch.app)+'%）'; break; }
    case 'barprep': { for(const k of SUBJ_IDS){ const cs=subjCourses(k); cs.forEach(x=>gain(x,{r:3,i:1.5,u:1},eff)); } p.skills.structure=clamp(p.skills.structure+0.8*eff,0,100); note='國考總複習：把四年的東西重新串起來。'; break; }
    case 'intern': { const m=G.internBoost?1.5:1; p.skills.judgment=clamp(p.skills.judgment+1.5*m,0,100); p.skills.research=clamp(p.skills.research+1,0,100); p.skills.express=clamp(p.skills.express+0.5,0,100); p.money+=a.money; G.stats.intern++; setFlag('intern_firm'); note='事務所實習：影印、查資料、看律師怎麼改狀。實務判斷上升。'; break; }
    case 'courtIntern': { p.skills.judgment=clamp(p.skills.judgment+2,0,100); G.enrolled.filter(x=>['civpro','crimpro'].includes(COURSES[x].subj)).forEach(x=>gain(x,{i:2,a:1},1)); setFlag('court_visit'); note='法院旁聽：程序變成一件具體的事。'; break; }
    case 'rest': G.stats.rest++; note='什麼都不做。精力恢復了。'; break;
    case 'sport': G.stats.sport++; note='運動。'; break;
    case 'game': note='放空。'; break;
    case 'home': addRel('mom',3); note='回家。'; if(flavor&&flavor.flag) setFlag(flavor.flag); break;
    case 'eat': { const who=G.npcs.an.met&&G.npcs.zhe.met?pick(['an','zhe']):G.npcs.an.met?'an':G.npcs.zhe.met?'zhe':null; if(who) addRel(who,4); if(G.npcs.kai.met&&chance(.3)) addRel('kai',3); G.stats.social++; note='和朋友吃飯。'; break; }
    case 'supper': { if(G.npcs.an.met) addRel('an',2); if(G.npcs.zhe.met) addRel('zhe',3); G.stats.social++; note='宵夜。'; break; }
    case 'club': { addRel('zhe',2); if(G.npcs.yu.met) addRel('yu',4); G.stats.social++; if(G.stats.social>=12&&!G.flags.club_leader&&G.time.year>=2) setFlag('club_leader'); note='社團。'; break; }
    case 'date': { addRel('yu',6); note='約會。'; break; }
    case 'work': { let m=a.money*(G.workBoost?1.2:1)*(G.workExp?1.1:1); p.money+=m; G.stats.work++; note='打工：+'+money(m)+' 元。'; if(flavor&&flavor.fx&&flavor.fx.energy) p.energy+=flavor.fx.energy; break; }
    case 'tutor': { p.money+=a.money; G.stats.work++; p.skills.express+=0.5; note='家教：+'+money(a.money)+' 元。教別人的時候，自己也弄清楚了一些東西。'; break; }
  }
  if(isStudy) G._blockStudy=(G._blockStudy||0)+1;
  p.energy=clamp(p.energy+(a.energy||0)*(a.id==='work'&&G.workExp?0.85:1),0,100); p.stress=clamp(p.stress+(a.stress||0),0,100);
  if(a.money&&a.id!=='work'&&a.id!=='tutor'&&a.id!=='intern') p.money+=a.money;
  if(flavor&&flavor.rel) for(const k in flavor.rel) addRel(k,flavor.rel[k]);
  if(flavor&&flavor.flag&&a.id!=='home') setFlag(flavor.flag);
  base.t=note; base.kind=isStudy?'gain':'line'; pushLog(base);
  if(flavor) pushLog({kind:'vig', scene:a.scene, pose:a.pose, t:flavor.t});
  if(p.energy<=8&&isStudy){ pushLog({kind:'loss',scene:'library',pose:'sleep',t:'你在圖書館趴著睡著了，醒來已經閉館。'}); p.energy+=10; return {lost:true}; }
  return base;
}
function subjCourses(subj){ return Object.keys(G.courses).filter(cid=>COURSES[cid]&&COURSES[cid].subj===subj); }
// ---------- 事件 ----------
function pickEvent(pool,exclude){
  if(G.queue.length){ const id=G.queue.shift(); const e=pool.find(x=>x.id===id); if(e) return e.id; }
  const cands=pool.filter(e=>{ if(e.id===exclude) return false; if(e.once&&G.usedEvents[e.id]) return false; if(G.usedEvents[e.id]&&(G.usedEvents[e.id]>=2)) return false; try{ return e.when(); }catch(err){ return false; } });
  if(!cands.length) return null;
  const tot=cands.reduce((a,e)=>a+(e.weight||10),0); let r=Math.random()*tot; for(const e of cands){ r-=(e.weight||10); if(r<=0){ return e.id; } } return cands[cands.length-1].id;
}
function eventById(id){ return UNI_EVENTS.find(e=>e.id===id)||(typeof EXCH_EVENTS!=='undefined'?EXCH_EVENTS.find(e=>e.id===id):null)||(typeof BAR_EVENTS!=='undefined'?BAR_EVENTS.find(e=>e.id===id):null)||(typeof CAREER_EVENTS!=='undefined'?CAREER_EVENTS.find(e=>e.id===id):null); }
function eventLines(e){ const ls=e.linesFn?e.linesFn():e.lines; return ls.map(l=>({who:l.who,t:fmtT(l.t)})); }
function chooseOption(e,opt){ G.usedEvents[e.id]=(G.usedEvents[e.id]||0)+1; let r=opt.do?opt.do():null; if(typeof r==='string') r=[{who:'n',t:r}]; G.eventResult=(r||[]).map(l=>({who:l.who,t:fmtT(l.t)})); diary('【'+e.title+'】'+opt.label.replace(/[「」]/g,'')); save(); }
// ---------- 週報 ----------
function blockReport(){
  const lines=[]; const goals=[]; const p=G.player; const b=curBlock();
  for(const cid of G.enrolled){ const co=COURSES[cid]; if(!co.exam) continue; const c=G.courses[cid]; const st=courseStatus(c);
    let tip=''; if(c.m>=25&&c.r<20) tip='看過但提取不出來，安排「複習與回想」或「限時練題」。'; else if(c.u<25) tip='理解還沒建立，先「讀教科書」。'; else if(c.i<25&&c.u>=35) tip='讀得懂，但還抓不到爭點，可以「練習案例」。'; else if(c.i>=35&&(p.skills.structure<25||p.skills.speed<25)) tip='知道爭點，但寫起來沒有結構或寫不完，「限時練題」會有幫助。'; else if(c.r<c.m-20) tip='熟悉度不錯，但提取度落後，「複習與回想」最有效。';
    lines.push('<b>'+esc(co.name)+'</b> <span class="status s'+st.s+'">'+st.t+'</span> '+(tip?'<span class="sub">'+tip+'</span>':'')); }
  if(G.streak>=2) lines.push('<span class="arrow d">你已經連續 '+G.streak+' 段高強度讀書，繼續硬讀的邊際效益正在下降。休息不是偷懶。</span>');
  if(p.energy<30) lines.push('<span class="arrow d">精力很低。下一段安排一格「什麼都不做」，效率會回來。</span>');
  if(p.stress>=75) lines.push('<span class="arrow d">壓力很高。運動、和朋友吃飯、回家，都有用。</span>');
  if(p.money<5000) lines.push('<span class="arrow d">錢快沒了。</span>');
  const idx=G.time.block; const nextExam=SEM_BLOCKS.slice(idx+1).find(x=>x.kind==='exam'); if(nextExam){ const dist=SEM_BLOCKS.indexOf(nextExam)-idx; goals.push((nextExam.which==='mid'?'期中考':'期末考')+'還有 '+dist+' 段時間：'+examCoursesNow().map(courseName).join('、')); }
  if(b&&b.id==='w2'&&G.time.year===1&&G.time.sem===1) goals.push('第 4–5 週會有民總小考和法緒的分組報告。');
  if(G.time.year===2&&G.time.sem===2&&!G.exch.applied&&G.exch.decided!=='no') goals.push('交換申請進度 '+Math.round(G.exch.app)+'%（期中前要送出）');
  return {lines,goals};
}
// ---------- 學期結算 ----------
function computeGrades(){
  const res=[]; let sum=0,n=0; const p=G.player;
  const old=G.retake.slice(); G.retake=[]; for(const rid of old){ if(rid==='makeup'){ res.push({cid:'makeup',name:'交換學分補修',g:70,comment:'補修完成。'}); sum+=70; n++; continue; } const c=G.courses[rid]; if(!c||!COURSES[rid]) continue; const g=Math.round(clamp(58+c.u*0.25+c.i*0.1+rnd(-3,6),50,82)); c.grade=g; res.push({cid:rid,name:'重修：'+COURSES[rid].name,g,comment:g>=60?'重修過了。':'又沒過。'}); sum+=g; n++; if(g<60) G.retake.push(rid); }
  for(const cid of G.enrolled){ const co=COURSES[cid]; const c=G.courses[cid]; let g, comment='';
    if(co.exam){ const daily=clamp(60+c.part*0.3+(c.touched>6?10:c.touched*1.5),40,100); g=0.35*(c.mid==null?60:c.mid)+0.45*(c.fin==null?60:c.fin)+0.2*daily; comment=(c.fin||0)>=(c.mid||0)+8?'期末比期中進步很多。':(c.mid||0)>=(c.fin||0)+8?'期中不錯，期末掉下來了。':'表現穩定。'; }
    else if(co.lang){ g=clamp(62+p.skills.lang[co.lang]*0.35+rnd(-3,5),40,100); comment='語言課，靠累積。'; }
    else if(co.light){ g=clamp(76+rnd(-5,12)+c.u*0.1,50,100); comment='輕鬆的課。'; }
    else { g=clamp(58+c.u*0.25+c.s*0.12+p.skills.research*0.35+(G.reportBonus||0)+c.part*0.15+rnd(-3,4),35,100); comment=(G.reportBonus||0)>=10?'報告有自己找資料，老師看得出來。':'報告按照分工完成。'; }
    if(cid==='intro'&&G.assignScore!=null){ g=g*0.6+G.assignScore*0.4; }
    g=Math.round(clamp(g,0,100)); c.grade=g; res.push({cid,name:co.name,g,comment}); sum+=g; n++;
    if(g<60){ setFlag('failed_course'); if(!G.retake.includes(cid)) G.retake.push(cid); } else { const ri=G.retake.indexOf(cid); if(ri>=0) G.retake.splice(ri,1); }
    if(g>=88&&co.exam) setFlag('fin_great',co.name);
  }
  const avg=n?sum/n:0; G.semAvg=Math.round(avg*10)/10; G.gradeRows=res;
  G.semesters.push({y:G.time.year,s:G.time.sem,avg:G.semAvg,rows:res.map(r=>({name:r.name,g:r.g}))});
  if(G.acadBonus&&avg>=85){ p.money+=12000; G.scholar=true; } else G.scholar=false;
  diary('學期平均 '+G.semAvg+'：'+res.map(r=>r.name+' '+r.g).join('、'));
  save();
}
function gpaAll(){ if(!G.semesters.length) return 0; return Math.round(G.semesters.reduce((a,s)=>a+s.avg,0)/G.semesters.length*10)/10; }
function endSemester(){
  // 假期效果已在 break 畫面套用；推進學期
  if(G.time.sem===1){ G.time.sem=2; } else { G.time.sem=1; G.time.year++; G.postYears=0; }
  G.enrolled=[]; G.groupBonus=G.groupBonus||false;
  if(G.time.year>4){ G.phase='uni'; G.screen='gradChoice'; save(); return; }
  if(G.time.year===3&&G.time.sem===1&&G.exch.going&&!G.exch.done){ exchBegin(); return; }
  G.screen='enroll'; save();
}
// 進入區塊
function routeBlock(){
  const b=curBlock(); if(!b){ endSemester(); return; }
  if(b.kind==='plan'){
    if(G.time.year===2&&G.time.sem===2&&b.id==='w2'&&!G.exch.decided){ G.screen='exchDecide'; save(); return; }
    G.sched=[]; G.screen='plan';
  } else if(b.kind==='exam'){ if(G.time.year===2&&G.time.sem===2&&b.which==='mid'&&G.exch.decided==='yes'&&!G.exch.applied){ exchSubmit(); } startExamWeek(b.which); }
  else if(b.kind==='grades'){ computeGrades(); if(G.time.year===2&&G.time.sem===2&&G.exch.applied&&!G.exch.resultShown){ exchResolveApplication(); G.screen='exchResult'; save(); return; } G.pendingEvent=pickEvent(UNI_EVENTS.filter(e=>e.id==='y1_grades_react')); G.screen='grades'; }
  else if(b.kind==='break'){ G.screen='break'; G.breakPicked=[]; }
  save();
}
function nextBlock(){ G.time.block++; routeBlock(); }
function afterEventFlow(){
  // 事件結束後：大一上 w4 有小考／作業；否則週報
  const b=curBlock();
  if(b&&b.after==='firstquiz'&&G.time.year===1&&G.time.sem===1&&!G.quizDone){ G.screen='quiz'; G.quiz={i:0,score:0,answers:[]}; save(); return; }
  G.screen='report'; save();
}
