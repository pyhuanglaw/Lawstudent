/* ===== 10 介面 ===== */
const UI={};
let resolveTimer=null, resolveIdx=0, modalOpen=null, planPick=null, toastTimer=null;
function $(id){ return document.getElementById(id); }
function toast(t){ let el=document.querySelector('.toast'); if(!el){ el=document.createElement('div'); el.className='toast'; document.body.appendChild(el); } el.textContent=t; clearTimeout(toastTimer); toastTimer=setTimeout(()=>{ el.remove(); },2200); }
function render(){ const app=$('app'); if(!G||G.screen==='title'){ app.innerHTML=renderTitle(); return; } app.innerHTML=renderTop()+renderMain()+(modalOpen?renderModal():''); }
function renderTitle(){
  const auto=loadAutoInfo(); const slots=[1,2,3].map(n=>slotInfo(n));
  return '<div class="title-wrap"><h1>法條之外</h1><div class="sub2">台灣法律人生</div><p class="sub" style="max-width:52ch;margin:10px auto 0">從法律系大一開始，一路活到職涯中後期。讀書方法、考試策略、朋友、交換、國考、事務所、法院、地檢署、公司會議室，還有下班後的沙發。</p></div>'+
  '<div class="menu">'+(auto?'<button class="btn" onclick="UI.continueAuto()">繼續上次的人生：'+esc(auto)+'</button>':'')+'<button class="btn'+(auto?' sec':'')+'" onclick="UI.startNew()">完整人生：從大一開始</button><button class="btn sec" onclick="UI.showChapters()">章節體驗：直接進入某一段人生</button><button class="btn sec" onclick="UI.openModal(\'save\')">讀取存檔／匯入</button></div>'+
  '<div id="chapters" class="panel hidden" style="max-width:720px;margin:14px auto"><h3>章節體驗</h3><p class="sub">以合理的預設背景直接開始。人物關係與能力會用預設值。</p><div class="chapters">'+
  [['exch','交換學生','大三上，從出發前的準備開始。'],['lawyer','新進律師','職前訓練結束，在小型事務所的第一週。'],['judge','新進法官','司法官學院結業，分發為候補法官。'],['pros','新進檢察官','分發到地檢署，第一次值勤。'],['legal','公司法務','進入本土企業當法務專員。'],['bar','國考備考','畢業後全職準備律師與司法官考試。']].map(x=>'<button onclick="UI.chapter(\''+x[0]+'\')"><b>'+x[1]+'</b><span>'+x[2]+'</span></button>').join('')+'</div></div>'+
  '<div class="panel" style="max-width:720px;margin:14px auto"><h3>本版的簡化設定</h3><ul class="sub" style="margin:4px 0 0;padding-left:18px"><li>學校、老師與課程安排都是虛構的；考試制度依公開說明整理，分數線每年不同，遊戲用近似值。</li><li>律師職前訓練、司法官學院受訓、候補與試署等流程都被壓縮成幾個決定。</li><li>存檔用瀏覽器儲存；換裝置請用「匯出」把 JSON 複製過去。</li></ul></div>';
}
function loadAutoInfo(){ const g=loadAuto(); if(!g) return null; const old=G; G=g; const t=g.player.name+'・'+timeLabel(); G=old; return t; }
UI.continueAuto=()=>{ const g=loadAuto(); if(g){ G=g; render(); } };
UI.showChapters=()=>{ $('chapters').classList.toggle('hidden'); };
UI.startNew=()=>{ G=null; createState={name:'',look:{skin:1,hair:0,hairStyle:0,top:0},bg:'academic'}; $('app').innerHTML=renderCreate(); };
let createState={name:'',look:{skin:1,hair:0,hairStyle:0,top:0},bg:'academic'};
function renderCreate(){
  const cs=createState; const look=cs.look;
  const sw=(arr,key)=>arr.map((c,i)=>'<span class="sw'+(look[key]===i?' on':'')+'" style="background:'+c+'" onclick="UI.setLook(\''+key+'\','+i+')"></span>').join('');
  return '<div class="panel"><h2>建立角色</h2><p class="sub">外觀不影響能力。背景只影響起始資源與事件，不決定人生上限。</p>'+
  '<div class="cols"><div><label for="pname"><b>名字</b></label><br><input type="text" id="pname" value="'+esc(cs.name)+'" placeholder="例如：林小法" maxlength="8" oninput="createState.name=this.value">'+
  '<h3>外觀</h3><div class="kv"><b>膚色</b><div class="swatches">'+sw(SKINS,'skin')+'</div><b>髮色</b><div class="swatches">'+sw(HAIRS,'hair')+'</div><b>髮型</b><div class="row">'+HAIR_STYLES.map((n,i)=>'<button class="actbtn'+(look.hairStyle===i?' on':'')+'" onclick="UI.setLook(\'hairStyle\','+i+')">'+n+'</button>').join('')+'</div><b>上衣</b><div class="swatches">'+sw(TOPS,'top')+'</div></div></div>'+
  '<div style="text-align:center"><svg viewBox="-40 -80 80 110" width="160" height="220">'+person(0,20,1.3,'stand',look,'bob')+'</svg></div></div>'+
  '<h3>背景</h3><div class="choice-grid">'+Object.values(BACKGROUNDS).map(b=>'<button class="choice'+(cs.bg===b.id?' on':'')+'" onclick="UI.setBg(\''+b.id+'\')"><b>'+b.name+'</b><span>'+b.desc+'</span><span>起始存款 '+money(b.money)+'，每兩週零用 '+money(b.allowance)+'</span></button>').join('')+'</div>'+
  '<div class="actions"><button class="btn" onclick="UI.createDone()">開始大一</button><button class="btn sec" onclick="G=null;render()">返回</button></div></div>';
}
UI.setLook=(k,i)=>{ createState.look[k]=i; $('app').innerHTML=renderCreate(); };
UI.setBg=(b)=>{ createState.bg=b; $('app').innerHTML=renderCreate(); };
UI.createDone=()=>{ const name=(createState.name||'').trim()||'小法'; newGame({name, look:createState.look, bg:createState.bg, mode:'full'}); G.screen='enroll'; render(); };
UI.chapter=(k)=>{ newGame({name:'小法', look:{skin:1,hair:1,hairStyle:1,top:0}, bg:'academic', mode:'chapter'}); G.player.name='小法'; presetChapter(k); render(); };
function presetChapter(k){
  // 合理預設：大一到大二的課程與人際
  const preset=(y)=>{ for(let yy=1;yy<=y;yy++) for(let ss=1;ss<=2;ss++){ coursesFor(yy,ss).filter(c=>c.type==='req').forEach(c=>{ G.courses[c.id]={u:55,s:50,m:45,r:35,i:45,a:40,part:20,cram:0,mid:75,fin:76,grade:76,touched:8}; }); G.semesters.push({y:yy,s:ss,avg:77,rows:[]}); } };
  ['an','zhe','sis','kai'].forEach(id=>{ G.npcs[id].met=true; G.npcs[id].rel=40; }); G.npcs.yu.met=true; G.npcs.yu.rel=30; setFlag('study_with_an'); setFlag('midnight_notes'); setFlag('borrow_sis');
  G.player.skills={structure:40,speed:38,research:35,express:38,judgment:35,lang:{en:60,ja:10,de:0}}; G.housing='dorm';
  if(k==='exch'){ preset(2); G.time.year=3; G.time.sem=1; G.player.money=380000; G.exch={interested:true,app:90,applied:true,decided:'yes',dest:'eu',going:true,done:false,resultShown:true,scholar:0,adapt:0,homesick:0,friends:0,creditPlan:0,memories:[]}; setFlag('exch_go'); exchBegin(); return; }
  if(k==='bar'){ preset(4); G.time.year=5; G.player.money=150000; G.postYears=0; barBegin('full','both','labor'); return; }
  preset(4); G.time.year=5; G.player.money=120000; G.postYears=k==='lawyer'?1:k==='legal'?0:2; G.careerYears=G.postYears;
  if(k==='lawyer'){ setFlag('bar_pass'); G.firmPick='small'; careerBegin('lawyer',{firm:'small'}); }
  if(k==='judge'){ setFlag('bar_pass'); setFlag('judicial_pass'); careerBegin('judge'); }
  if(k==='pros'){ setFlag('bar_pass'); setFlag('judicial_pass'); careerBegin('pros'); }
  if(k==='legal'){ careerBegin('legal',{company:'local'}); }
}
// ---------- 上方列 ----------
function renderTop(){
  const p=G.player; const pill=(cls,name,v,max)=>'<span class="pill '+cls+'">'+name+'<span class="bar"><i style="width:'+Math.round(clamp(v/max*100,0,100))+'%"></i></span></span>';
  return '<div class="topbar"><div class="who">'+avatarSVG('you',28)+'<div><div class="name">'+esc(p.name)+' <span class="sub">'+playerAge()+' 歲</span></div><div class="when">'+esc(timeLabel())+'</div></div></div><div class="pills"><span class="pill">💰 '+money(p.money)+'</span>'+pill('energy','精力',p.energy,100)+pill('stress','壓力',p.stress,100)+'</div><div class="tools"><button onclick="UI.openModal(\'skills\')">能力</button><button onclick="UI.openModal(\'people\')">人物</button><button onclick="UI.openModal(\'memory\')">記憶</button><button onclick="UI.openModal(\'save\')">存檔</button><button onclick="UI.openModal(\'help\')">說明</button><button onclick="UI.toTitle()">主選單</button></div></div>';
}
UI.toTitle=()=>{ save(); G.screen==='title'; G=null; render(); };
function stage(sceneId,pose,cap,opts){ return '<div class="stage"><div class="scene">'+sceneSVG(sceneId,pose,opts||{})+'</div>'+(cap?'<div class="cap">'+cap+'</div>':'')+'</div>'; }
function baseScene(){ if(G.phase==='exch') return 'abroadHome'; if(G.phase==='bar') return 'library'; if(G.phase==='career') return careerScene(); return G.housing==='dorm'?'dorm':'campus'; }
// ---------- 主畫面路由 ----------
function renderMain(){
  const s=G.screen; const f={enroll:renderEnroll, plan:renderPlan, resolve:renderResolve, event:renderEvent, report:renderReport, examIntro:renderExamIntro, exam:renderExam, examResult:renderExamResult, quiz:renderQuiz, grades:renderGrades, 'break':renderBreak, gradChoice:renderGradChoice, exchDecide:renderExchDecide, exchResult:renderExchResult, exchPrep:renderExchPrep, exchDepart:renderExchDepart, exchReturn:renderExchReturn, barExam1:renderBarExam1, barResult:renderBarResult, barOral:renderBarOral, training:renderTraining, careerSetup:renderCareerSetup, careerReview:renderCareerReview, careerOffers:renderCareerOffers, setupFirm:renderSetupFirm, ending:renderEnding};
  return (f[s]||(()=>'<div class="panel">畫面 '+esc(s)+' 尚未實作。<button class="btn small" onclick="G.screen=\'plan\';render()">回到行程</button></div>'))();
}
// ---------- 選課 ----------
function renderEnroll(){
  const y=G.time.year, sm=G.time.sem; const all=coursesFor(y,sm); const req=all.filter(c=>c.type==='req'); const el=all.filter(c=>c.type!=='req');
  if(!G.enrolled.length) G.enrolled=req.map(c=>c.id).concat(G.enrollElec||[]);
  const elec=G.enrolled.filter(id=>COURSES[id].type!=='req');
  const row=c=>{ const T=TEACHERS[c.teacher]; const on=G.enrolled.includes(c.id); return '<button class="choice'+(on?' on':'')+'" '+(c.type==='req'?'disabled':'onclick="UI.toggleElec(\''+c.id+'\')"')+'><b>'+c.name+' <span class="tag">'+c.credits+' 學分</span>'+(c.type==='req'?'<span class="tag g">必修</span>':'<span class="tag">'+(c.type==='gen'?'通識':'選修')+'</span>')+'</b><span>'+T.name+'・'+T.styleName+'</span><span>'+T.hint+'</span></button>'; };
  const retake=G.retake.length?'<div class="note warn">要重修／補修：'+G.retake.map(id=>id==='makeup'?'交換學分補修':COURSES[id]?COURSES[id].name:id).join('、')+'（每段時間少一格自由時間）</div>':'';
  const housing= (y===1&&sm===1)?'<h3>住哪裡？</h3><div class="choice-grid"><button class="choice'+(G.housing==='dorm'?' on':'')+'" onclick="UI.setHousing(\'dorm\')"><b>住宿舍</b><span>室友是資工系的。每兩週多花 1,500 元，但半夜想去圖書館走五分鐘就到。</span></button><button class="choice'+(G.housing==='commute'?' on':'')+'" onclick="UI.setHousing(\'commute\')"><b>通勤</b><span>住家裡，省錢，早八要搭六點五十的車。車上會遇到人。</span></button></div>':'';
  const intro= (y===1&&sm===1)?'<div class="note">歡迎來到'+SCHOOL+'。這學期你會上四門必修，選一到兩門選修。每段時間有幾格自由時間可以安排，期中期末是要親自作答的考試。先選課吧。</div>':'';
  const slots=freeSlots();
  return stage('campus','walk','<b>'+yearName(y)+(sm===1?'上':'下')+'・選課</b><span>學期開始前</span>')+'<div class="panel"><h2>選課</h2>'+intro+housing+retake+'<h3>必修</h3><div class="choice-grid">'+req.map(row).join('')+'</div><h3>選修（最多兩門）</h3><div class="choice-grid">'+el.map(row).join('')+'</div>'+
  '<div class="note">目前 '+G.enrolled.length+' 門課，每段時間自由時間 <b>'+slots+'</b> 格。'+(elec.length>=2?'兩門選修：課比較多，自由時間少一格。':'')+'</div><div class="actions"><button class="btn" onclick="UI.enrollDone()" '+((y===1&&sm===1&&!G.housing)?'disabled':'')+'>開學</button></div></div>';
}
UI.toggleElec=(id)=>{ const i=G.enrolled.indexOf(id); if(i>=0) G.enrolled.splice(i,1); else { if(G.enrolled.filter(x=>COURSES[x].type!=='req').length>=2){ toast('最多兩門選修'); return; } G.enrolled.push(id); } render(); };
UI.setHousing=(h)=>{ G.housing=h; render(); };
UI.enrollDone=()=>{ diary('選課：'+G.enrolled.map(courseName).join('、')); beginSemester(); render(); };
// ---------- 行程 ----------
function ctxActs(){ return G.ctx==='exch'?exchActs():G.ctx==='bar'?barActs():G.ctx==='career'?careerActs():uniActs(); }
function ctxAct(id){ return G.ctx==='exch'?EXCH_ACTS[id]:G.ctx==='bar'?BAR_ACTS[id]:G.ctx==='career'?careerAct(id):ACTS[id]; }
function ctxSlots(){ return G.ctx==='exch'?exchFreeSlots():G.ctx==='bar'?barFreeSlots():G.ctx==='career'?careerFreeSlots():freeSlots(); }
function ctxPreview(){ return G.ctx==='exch'?exchPreview():G.ctx==='bar'?barPreview():G.ctx==='career'?careerPreview():planPreview(); }
function slotLabel(i){ if(G.ctx==='career') return ['週一','週二','週三','週四','週五','週末'][i]||'加班'; if(G.ctx==='bar') return '第 '+(i+1)+' 段'; return '第 '+(i+1)+' 格'; }
function renderPlan(){
  const n=ctxSlots(); const acts=ctxActs(); const cats={}; acts.forEach(a=>{ (cats[a.cat]=cats[a.cat]||[]).push(a); });
  const b=G.phase==='uni'?curBlock():null; const tag=b&&b.tag?'（'+b.tag+'）':'';
  let head='';
  if(G.ctx==='uni'){ const days=['一','二','三','四','五']; head='<h3>課表</h3><div class="timetable">'+days.map(d=>'<div><b>週'+d+'</b>'+G.enrolled.flatMap(cid=>COURSES[cid].slots.filter(s=>s.startsWith(d)).map(s=>s.slice(2)+' '+COURSES[cid].name.slice(0,6))).join('<br>')+'</div>').join('')+'</div>'; }
  if(G.ctx==='career'){ head='<h3>手上的案子</h3><div class="docket">'+G.career.docket.filter(m=>!m.done).map(m=>'<div class="matter"><div class="hd"><b>'+esc(m.title)+'</b><span class="'+(m.dl<=2?'dl':'dl ok')+'">'+(m.dl<=0?'已逾期':'期限 '+m.dl+' 週')+(m.hearingIn!=null?'・庭期 '+m.hearingIn+' 週後':'')+'</span></div><div class="sub">'+esc(m.who)+'・'+m.type+'・複雜度 '+'●'.repeat(m.cx)+(m.fee?'・報酬 '+money(m.fee):'')+(m.risk?'・風險 '+m.risk:'')+'</div><div class="sub">目前：'+m.stages[m.stage]+'（'+m.stages.map((s,i)=>i<m.stage?'✓':i===m.stage?'▶':'·').join(' ')+'）</div><div class="prog"><i style="width:'+Math.round(m.prog)+'%"></i></div></div>').join('')+'</div>'; }
  const tutorial= !G.tutorialSeen?'<div class="note"><b>怎麼玩：</b>左邊選活動（要讀哪一科就點科目），會填進右邊的格子；點格子可以移除。下面的預覽會告訴你大概會發生什麼。安排好按「開始這段時間」。休息不是偷懶，連續硬讀效率會下降。</div>':'';
  const slots=Array.from({length:n},(_,i)=>{ const s=G.sched[i]; if(!s) return '<button class="slot" onclick="UI.slotClick('+i+')"><span class="n">'+slotLabel(i)+'</span><span class="c">（空）</span></button>'; const a=ctxAct(s.act); const cn= s.course?(G.ctx==='career'?(matterById(s.course)||{title:''}).title:G.ctx==='bar'?SUBJ[s.course].short:courseName(s.course)):''; return '<button class="slot filled" onclick="UI.slotClick('+i+')"><span class="n">'+slotLabel(i)+'</span><span class="t">'+esc(a?a.name:s.act)+'</span>'+(cn?'<span class="c">'+esc(cn)+'</span>':'')+'</button>'; }).join('');
  const actBtns=Object.keys(cats).map(c=>'<div class="actgroup"><h4>'+c+'</h4><div class="actbtns">'+cats[c].map(a=>'<button class="actbtn'+(planPick===a.id?' on':'')+'" onclick="UI.pickAct(\''+a.id+'\')" title="'+esc(a.desc||'')+'">'+esc(a.name)+'</button>').join('')+'</div>'+(planPick&&cats[c].some(a=>a.id===planPick)?renderCoursePick():'')+'</div>').join('');
  const pv=ctxPreview();
  return stage(baseScene(),'stand','<b>'+esc(timeLabel())+tag+'</b><span>'+(G.ctx==='uni'?'安排這段時間的自由時間':G.ctx==='exch'?'安排這段時間':G.ctx==='bar'?'安排這個月':'安排這一週')+'</span>')+
  '<div class="panel">'+tutorial+head+'<div class="plan"><div><h3>活動</h3><div class="acts">'+actBtns+'</div></div><div><h3>行程（'+G.sched.length+'/'+n+'）</h3><div class="slots">'+slots+'</div><h3>預覽</h3><div class="preview">'+(pv.length?'<ul>'+pv.map(l=>'<li>'+l+'</li>').join('')+'</ul>':'<span class="sub">還沒安排任何活動。</span>')+'</div><div class="actions"><button class="btn" onclick="UI.startBlock()" '+(G.sched.length?'':'disabled')+'>開始這段時間</button><button class="btn sec small" onclick="G.sched=[];render()">清空</button></div></div></div></div>';
}
function renderCoursePick(){
  const a=ctxAct(planPick); if(!a) return '';
  if(G.ctx==='uni'){ if(a.id==='lang') return '<div class="coursepick">'+[['en','英文'],['ja','日文']].map(x=>'<button onclick="UI.pickCourse(\''+x[0]+'\')">'+x[1]+'</button>').join('')+'</div>'; if(!a.course) return ''; const cs=G.enrolled.filter(c=>COURSES[c].exam||['borrow','read','notes','review','preview','research','speak','cases','timed'].includes(a.id)); return '<div class="coursepick">'+cs.filter(c=>!COURSES[c].lang||a.id==='preview'||a.id==='read').map(c=>{ const st=courseStatus(G.courses[c]); return '<button onclick="UI.pickCourse(\''+c+'\')">'+esc(COURSES[c].name)+' <span class="status s'+st.s+'">'+st.t+'</span></button>'; }).join('')+'</div>'; }
  if(G.ctx==='bar'){ if(!a.subj) return ''; return '<div class="coursepick">'+SUBJ_IDS.map(k=>{ const st=barStatus(G.bar.subj[k]); return '<button onclick="UI.pickCourse(\''+k+'\')">'+SUBJ[k].name+' <span class="status s'+st.s+'">'+st.t+'</span></button>'; }).join('')+'</div>'; }
  if(G.ctx==='career'){ if(!a.matter) return ''; return '<div class="coursepick">'+G.career.docket.filter(m=>!m.done).map(m=>'<button onclick="UI.pickCourse(\''+m.id+'\')">'+esc(m.title)+'（'+m.stages[m.stage]+'・'+Math.round(m.prog)+'%）</button>').join('')+'</div>'; }
  return '';
}
UI.pickAct=(id)=>{ const a=ctxAct(id); if(!a) return; const needPick= (G.ctx==='uni'&&(a.course||a.id==='lang'))||(G.ctx==='bar'&&a.subj)||(G.ctx==='career'&&a.matter); if(needPick){ planPick=(planPick===id?null:id); render(); return; } addSlot(id,null); };
UI.pickCourse=(c)=>{ addSlot(planPick,c); };
function addSlot(act,course){ const n=ctxSlots(); if(G.sched.length>=n){ toast('格子滿了'); return; } G.sched.push({act,course}); render(); }
UI.slotClick=(i)=>{ if(G.sched[i]){ G.sched.splice(i,1); render(); } };
UI.startBlock=()=>{ G.tutorialSeen=true; planPick=null; if(G.ctx==='exch') exchResolve(); else if(G.ctx==='bar') barResolve(); else if(G.ctx==='career') careerResolve(); else resolveBlock(); G.screen='resolve'; resolveIdx=0; render(); startResolveAnim(); };
// ---------- 結算動畫 ----------
function startResolveAnim(){ clearInterval(resolveTimer); resolveTimer=setInterval(()=>{ resolveIdx++; if(resolveIdx>=G.log.length){ clearInterval(resolveTimer); resolveIdx=G.log.length; } render(); },650); }
function renderResolve(){
  const shown=G.log.slice(0,Math.max(1,resolveIdx)); const last=shown[shown.length-1]||{scene:baseScene(),pose:'stand'}; const done=resolveIdx>=G.log.length;
  return stage(last.scene||baseScene(),last.pose||'stand','<b>'+esc(timeLabel())+'</b><span>'+(done?'這段時間結束了':'進行中…')+'</span>')+'<div class="panel"><div class="log">'+shown.map(l=>'<div class="line '+(l.kind||'')+'">'+l.t+'</div>').join('')+'</div><div class="actions">'+(done?'<button class="btn" onclick="UI.afterResolve()">繼續</button>':'<button class="btn sec" onclick="UI.skipResolve()">跳過動畫</button>')+'</div></div>';
}
UI.skipResolve=()=>{ clearInterval(resolveTimer); resolveIdx=G.log.length; render(); };
UI.afterResolve=()=>{ if(G.pendingEvent){ G.screen='event'; G.eventResult=null; } else { G.screen='report'; } save(); render(); };
// ---------- 事件 ----------
function curEvent(){ if(G.pendingEvent==='__dyn') return buildDyn(G.dynEvent); return eventById(G.pendingEvent); }
function bubble(l){ const who=l.who; if(who==='n') return '<div class="bubble n"><div class="msg">'+l.t+'</div></div>'; if(who==='you') return '<div class="bubble you"><div class="av">'+avatarSVG('you',34)+'</div><div class="msg"><b>'+esc(G.player.name)+'</b>'+l.t+'</div></div>'; const name=NPCS[who]?NPCS[who].name:TEACHERS[who]?TEACHERS[who].name:who; const av=NPCS[who]?avatarSVG(who,34):'<svg viewBox="-20 -66 40 90" width="34" height="41">'+person(0,20,1,'stand',{skinC:'#F0D0B4',hairC:'#3A2A1A',hairStyle:1,topC:(TEACHERS[who]||{}).color||'#4A6C8C'},'')+'</svg>'; return '<div class="bubble"><div class="av">'+av+'</div><div class="msg"><b>'+esc(name)+'</b>'+l.t+'</div></div>'; }
function renderEvent(){
  const e=curEvent(); if(!e){ G.pendingEvent=null; G.screen='report'; return renderReport(); }
  const lines=eventLines(e); const withNpc=lines.find(l=>NPCS[l.who]&&!NPCS[l.who].cat)?lines.find(l=>NPCS[l.who]&&!NPCS[l.who].cat).who:null;
  const opts=e.options.filter(o=>!o.when||o.when());
  return stage(e.scene||baseScene(),'stand','<b>'+esc(e.title)+'</b><span>'+esc(timeLabel())+'</span>',{with:withNpc})+'<div class="panel"><div class="dialog">'+lines.map(bubble).join('')+(G.eventResult?G.eventResult.map(bubble).join(''):'')+'</div>'+
  (G.eventResult?'<div class="actions"><button class="btn" onclick="UI.afterEvent()">繼續</button></div>':'<div class="opts">'+opts.map((o,i)=>'<button class="opt" onclick="UI.choose('+i+')">'+fmtT(o.label)+(o.hint?'<small>'+esc(o.hint)+'</small>':'')+'</button>').join('')+'</div>')+'</div>';
}
UI.choose=(i)=>{ const e=curEvent(); const opts=e.options.filter(o=>!o.when||o.when()); const o=opts[i]; if(!o) return; if(G.pendingEvent==='__dyn'){ let r=o.do?o.do():null; if(typeof r==='string') r=[{who:'n',t:r}]; G.eventResult=(r||[]).map(l=>({who:l.who,t:fmtT(l.t)})); diary('【'+e.title+'】'+o.label); save(); } else chooseOption(e,o); render(); };
UI.afterEvent=()=>{ G.pendingEvent=null; G.eventResult=null; G._evCourse=null; if(G.pendingNext){ G.pendingEvent=G.pendingNext; G.pendingNext=null; G.screen='event'; save(); render(); return; } const b=G.phase==='uni'?curBlock():null;
  if(G.phase==='uni'&&b&&b.kind==='grades'){ nextBlock(); render(); return; }
  if(G.phase==='uni') afterEventFlow(); else { G.screen='report'; save(); }
  render(); };
// ---------- 週報 ----------
function ctxReport(){ return G.ctx==='exch'?exchReport():G.ctx==='bar'?barReport():G.ctx==='career'?careerReport():blockReport(); }
function renderReport(){
  const r=ctxReport();
  return stage(baseScene(),'sit','<b>'+esc(timeLabel())+'・小結</b><span></span>')+'<div class="panel"><h2>這段時間</h2><div class="log">'+r.lines.map(l=>'<div class="line">'+l+'</div>').join('')+'</div>'+(r.goals.length?'<h3>接下來</h3><ul class="sub">'+r.goals.map(g=>'<li>'+g+'</li>').join('')+'</ul>':'')+'<div class="actions"><button class="btn" onclick="UI.nextBlock()">下一段</button></div></div>';
}
UI.nextBlock=()=>{ if(G.ctx==='exch') exchNext(); else if(G.ctx==='bar') barNext(); else if(G.ctx==='career') careerNext(); else nextBlock(); render(); };
// ---------- 考試 ----------
function statusRow(label,st){ return '<div><span>'+label+'</span><span class="b"><i style="width:'+Math.round(st.v)+'%"></i></span><span class="status s'+st.s+'">'+st.t+'</span></div>'; }
function renderExamIntro(){
  const list=G.examQueue.map(cid=>{ const co=COURSES[cid]; const T=TEACHERS[co.teacher]; const st=courseStatus(G.courses[cid]); return '<div class="matter"><div class="hd"><b>'+co.name+'</b><span class="status s'+st.s+'">'+st.t+'</span></div><div class="sub">'+T.name+'・'+T.styleName+'。'+(G.courses[cid].knowStyle?'你去問過老師，知道他在意什麼。':T.hint)+'</div></div>'; }).join('');
  return stage('classroom','sit','<b>'+(G.examWhich==='mid'?'期中考週':'期末考週')+'</b><span>'+esc(timeLabel())+'</span>')+'<div class="panel"><h2>'+(G.examWhich==='mid'?'期中考':'期末考')+'</h2><p class="sub">考試不是按一下就出分數。每一科有三題，你要決定時間怎麼分、先寫哪個爭點、答案怎麼組織。平時準備、當場策略、能力與一點運氣，一起決定成績。</p><div class="docket">'+list+'</div><div class="actions"><button class="btn" onclick="examBegin();render()">開始第一科</button></div></div>';
}
function renderExam(){
  const e=G.exam; const isBar=!!e.bar; const co=isBar?null:COURSES[e.cid]; const T=isBar?null:TEACHERS[co.teacher]; const left=e.T-e.used+(e.step===2?e.bonusQ3:0);
  const prep=isBar?null:prepScore(e.cid);
  let head='<div class="examhead"><div><b>科目</b>'+(isBar?'律師／司法官二試・'+e.subjName+'（申論）':co.name)+'</div><div><b>老師風格</b>'+(isBar?'閱卷委員：兩位平行閱卷':T.styleName)+'</div><div><b>題數／配分</b>三題・35／30／35</div><div><b>時間</b><span class="clock">'+left+'</span> 分鐘</div></div>';
  if(e.step===0&&!isBar){ const d=prep.d; const lab=(v)=>v>=60?{s:4,t:'穩',v}:v>=40?{s:3,t:'還可以',v}:v>=25?{s:2,t:'不穩',v}:{s:1,t:'很弱',v}; head+='<div class="skillrows" style="margin:6px 0 10px">'+['u','s','m','r','i','a'].map(k=>statusRow(DIM_NAME[k],lab(d[k]))).join('')+'</div>'; }
  let body='';
  if(e.step===0) body='<div class="case"><b>第一題（35 分）</b><br>題幹佔了半頁。你數了一下，至少有三個爭點可以寫。目前剩 '+left+' 分鐘，後面還有兩題。</div>';
  else if(e.step===1) body='<div class="case"><b>第二題（30 分）：'+esc(e.case.title)+'</b><br>'+esc(e.case.text)+'<br><span class="sub">剩 '+left+' 分鐘。這題問的問題很多，你要先處理哪一個？</span></div>';
  else body='<div class="case"><b>第三題（35 分）</b><br>問的是一個你有印象的概念，'+(left>=35?'時間還夠。':left>=20?'時間有點緊。':'時間快沒了。')+'剩 '+left+' 分鐘。答案怎麼組織？</div>';
  const opts=examOptions(e.step).map((o,i)=>'<button class="opt" onclick="UI.examPick(\''+o.k+'\','+(o.idx==null?-1:o.idx)+')">'+esc(o.label)+(o.hint?'<small>'+esc(o.hint)+'</small>':'')+'</button>').join('');
  const prev=e.q.map((q,i)=>'<div class="line vig">第'+['一','二','三'][i]+'題：'+esc(q.txt)+'</div>').join('');
  return stage('classroom','type','<b>'+(isBar?'二試考場':co.name)+'</b><span>'+(isBar?'第二天・上午':'考試中')+'</span>',{boardText:'考試中，請安靜'})+'<div class="panel">'+head+(prev?'<div class="log" style="margin-bottom:8px">'+prev+'</div>':'')+body+'<div class="opts">'+opts+'</div></div>';
}
UI.examPick=(k,idx)=>{ examAnswer(k,idx); render(); };
function renderExamResult(){
  const e=G.exam; const r=e.result; const isBar=!!e.bar;
  let rows=''; if(!isBar){ const d=r.d; rows='<div class="breakdown">'+['u','s','m','r','i','a'].map(k=>'<div><span>'+DIM_NAME[k]+'</span><span class="b"><i style="width:'+Math.round(d[k])+'%"></i></span><span class="sub">'+Math.round(d[k])+'</span></div>').join('')+'</div>'; }
  else { rows='<div class="tablewrap"><table><tr><th>科目</th><th>得分</th></tr>'+r.rows.map(x=>'<tr><td>'+x.name+'</td><td class="num">'+x.score+' / '+x.max+'</td></tr>').join('')+'<tr><td><b>合計</b></td><td class="num"><b>'+r.score+' / 1000</b></td></tr><tr><td>四大核心領域（須達 400）</td><td class="num">'+r.core+' / 800</td></tr></table></div>'; }
  const strat=e.q.map((q,i)=>'<div class="line vig">第'+['一','二','三'][i]+'題：'+esc(q.txt)+'</div>').join('');
  return stage('campus','stand','<b>'+(isBar?'二試結束':COURSES[e.cid].name+'・考完')+'</b><span>走出教室</span>')+'<div class="panel"><div class="row"><div class="score">'+r.score+'</div><div><div class="sub">'+(isBar?'總分（律師二試 1000 分制；司法官二試不含選試，共 900）':'分數')+'</div></div></div><div class="note">'+esc(r.text)+'</div><div class="log">'+strat+'</div><h3>'+(isBar?'各科':'準備狀態')+'</h3>'+rows+'<div class="actions"><button class="btn" onclick="UI.examNext()">'+(isBar?'回到備考':(G.examQueue.length>1?'下一科':'考完了'))+'</button></div></div>';
}
UI.examNext=()=>{ if(G.exam.bar){ G.sched=[]; G.screen='plan'; save(); } else examNext(); render(); };
// ---------- 小考與分組報告 ----------
function renderQuiz(){
  const q=G.quiz;
  if(q.stage==='assign'){ return stage('classroom','sit','<b>法學緒論・分組報告</b><span>第 4–5 週</span>')+'<div class="panel"><h2>分組報告</h2><p>吳老師的分組報告：你和小安、阿哲一組，題目是「法律與道德的關係」。要怎麼做？</p><div class="opts"><button class="opt" onclick="assignChoose(\'lead\');render()">自己扛架構，小安查資料，阿哲做簡報<small>報告會很完整，但你會很累</small></button><button class="opt" onclick="assignChoose(\'split\');render()">三個人平均分工<small>穩穩交出去</small></button><button class="opt" onclick="assignChoose(\'sis\');render()">把初稿拿給學長姐看<small>需要一點關係</small></button></div></div>'; }
  if(q.stage==='done'){ return stage('campus','walk','<b>第一次作業與小考</b><span>結束</span>')+'<div class="panel"><h2>結果</h2><div class="note">民總小考：'+q.score+' / 3。'+(q.score>=3?'全對。你發現定義題其實是體系題。':q.score===2?'錯一題。錯的那題你記得看過，但當下想不起來。':'一團亂。你回去把第一章重看了一次。')+'</div><div class="note">法緒報告：'+q.assignScore+' 分。'+esc(q.assignTxt)+'</div><div class="actions"><button class="btn" onclick="G.screen=\'report\';save();render()">繼續</button></div></div>'; }
  const cq=QUIZ_CIV1[q.i]; const last=q.answers[q.answers.length-1];
  return stage('classroom','type','<b>民法總則・小考</b><span>第 '+(q.i+1)+' / '+QUIZ_CIV1.length+' 題</span>',{boardText:'小考：十分鐘'})+'<div class="panel"><h2>民總小考</h2>'+(last?'<div class="note '+(last.ok?'ok':'bad')+'">'+(last.ok?'對了。':'不對。')+esc(last.why)+'</div>':'')+'<div class="case">'+esc(cq.q)+'</div><div class="opts">'+cq.opts.map((o,i)=>'<button class="opt" onclick="quizAnswer('+i+');render()">'+esc(o)+'</button>').join('')+'</div></div>';
}
// ---------- 放榜 ----------
function renderGrades(){
  const rows=G.gradeRows||[]; const fail=rows.filter(r=>r.g<60);
  return stage('campus','stand','<b>放榜</b><span>'+esc(timeLabel())+'</span>')+'<div class="panel"><h2>學期成績</h2><div class="tablewrap"><table><tr><th>課程</th><th>分數</th><th></th></tr>'+rows.map(r=>'<tr><td>'+esc(r.name)+'</td><td class="num"'+(r.g<60?' style="color:var(--bad)"':'')+'>'+r.g+'</td><td class="sub">'+esc(r.comment)+'</td></tr>').join('')+'<tr><td><b>平均</b></td><td class="num"><b>'+G.semAvg+'</b></td><td class="sub">歷年平均 '+gpaAll()+(G.scholar?'・獎學金 +12,000':'')+'</td></tr></table></div>'+(fail.length?'<div class="note bad">被當：'+fail.map(r=>r.name).join('、')+'。要重修，下學期少一格自由時間。一次低分不會毀掉人生，但會佔掉時間。</div>':'')+'<div class="actions"><button class="btn" onclick="UI.afterGrades()">繼續</button></div></div>';
}
UI.afterGrades=()=>{ if(G.pendingEvent){ G.screen='event'; G.eventResult=null; } else nextBlock(); save(); render(); };
// ---------- 假期 ----------
const BREAK_OPTS=[
  {id:'restHome', name:'回家好好休息', desc:'睡飽，吃家裡的飯，被親戚問問題', fx:g=>{ g.player.energy=100; g.player.stress=clamp(g.player.stress-25,0,100); addRel('mom',6); }, txt:'你睡了很久。媽媽每天問要吃什麼。二舅又拿出了那份土地資料。'},
  {id:'work', name:'打工存錢', desc:'全職一個月', fx:g=>{ g.player.money+=26000; g.player.energy-=10; g.stats.work+=4; }, txt:'一個月的全職打工。錢進來了，腳很痠。'},
  {id:'preview', name:'先預習下學期', desc:'把下學期的課本翻過一遍', fx:g=>{ const next=coursesFor(g.time.sem===1?g.time.year:g.time.year+1, g.time.sem===1?2:1).filter(c=>c.type==='req'); next.forEach(c=>{ if(!g.courses[c.id]) g.courses[c.id]=newCourseState(); g.courses[c.id].u+=10; g.courses[c.id].s+=5; }); g.player.energy-=8; }, txt:'課本翻了一遍。開學第一堂課，你發現老師講的東西你有印象。'},
  {id:'travel', name:'和朋友旅行', desc:'三天兩夜，花錢，很開心', fx:g=>{ g.player.money-=8000; g.player.stress=clamp(g.player.stress-20,0,100); addRel('an',5); addRel('zhe',5); if(g.npcs.yu.met) addRel('yu',5); }, txt:'三天兩夜。有人在火車上睡著，有人在海邊講了很多平常不會講的話。'},
  {id:'lang', name:'準備語言檢定', desc:'為交換或未來鋪路', fx:g=>{ g.player.skills.lang.en=clamp(g.player.skills.lang.en+8,0,100); g.player.energy-=6; }, txt:'一個月的英文。單字書翻到後半本，聽力終於聽得出連音。'},
  {id:'intern', name:'短期實習', desc:'法扶或事務所打雜（大二以上）', when:g=>g.time.year>=2||(g.time.year===1&&g.time.sem===2), fx:g=>{ g.player.skills.judgment+=5; g.player.skills.research+=3; g.player.money+=8000; setFlag('intern_firm'); }, txt:'一個月的實習。影印、查資料、把卷排時間軸。你第一次看到一份真正的起訴狀。'},
  {id:'tutor', name:'家教', desc:'教高中生，時薪不錯', when:g=>g.time.year>=2||g.time.sem===2, fx:g=>{ g.player.money+=16000; g.player.skills.express+=3; }, txt:'教高中生公民。你發現教別人的時候，自己反而弄懂了一些東西。'},
  {id:'club', name:'社團營隊', desc:'辦活動、認識人', fx:g=>{ addRel('zhe',6); if(g.npcs.yu.met) addRel('yu',8); g.player.energy-=6; g.stats.social+=3; if(g.time.year>=2) setFlag('club_leader'); }, txt:'營隊五天。你負責場地和保險，第一次覺得法律系學的東西在生活裡有用。'},
];
function renderBreak(){
  const isWinter=G.time.sem===1; const picked=G.breakPicked||[]; const opts=BREAK_OPTS.filter(o=>!o.when||o.when(G));
  if(G.breakDone){ return stage('home','sit','<b>'+(isWinter?'寒假':'暑假')+'</b><span>快結束了</span>')+'<div class="panel"><h2>'+(isWinter?'寒假':'暑假')+'</h2>'+G.breakTxt.map(t=>'<div class="line vig">'+esc(t)+'</div>').join('')+'<div class="note">假期本來想好好休息，最後又開始想'+(isWinter?'下學期':'實習、交換和下一學期')+'。</div><div class="actions"><button class="btn" onclick="UI.breakNext()">'+(G.time.year===4&&G.time.sem===2?'畢業':'下學期')+'</button></div></div>'; }
  return stage('home','sit','<b>'+(isWinter?'寒假':'暑假')+'</b><span>'+esc(timeLabel())+'</span>')+'<div class="panel"><h2>'+(isWinter?'寒假':'暑假')+'</h2><p class="sub">選兩件事。</p><div class="choice-grid">'+opts.map(o=>'<button class="choice'+(picked.includes(o.id)?' on':'')+'" onclick="UI.pickBreak(\''+o.id+'\')"><b>'+o.name+'</b><span>'+o.desc+'</span></button>').join('')+'</div><div class="actions"><button class="btn" onclick="UI.breakGo()" '+(picked.length?'':'disabled')+'>開始假期</button></div></div>';
}
UI.pickBreak=(id)=>{ const p=G.breakPicked; const i=p.indexOf(id); if(i>=0) p.splice(i,1); else { if(p.length>=2){ toast('最多兩件'); return; } p.push(id); } render(); };
UI.breakGo=()=>{ G.breakTxt=[]; for(const id of G.breakPicked){ const o=BREAK_OPTS.find(x=>x.id===id); o.fx(G); G.breakTxt.push(o.txt); } G.breakDone=true; G.player.energy=clamp(G.player.energy+20,0,100); G.player.stress=clamp(G.player.stress-10,0,100); diary('假期：'+G.breakPicked.map(id=>BREAK_OPTS.find(x=>x.id===id).name).join('、')); save(); render(); };
UI.breakNext=()=>{ G.breakDone=false; G.breakPicked=[]; if(G.time.year===2&&G.time.sem===2&&G.exch.going&&!G.exch.done){ G.time.year=3; G.time.sem=1; exchBegin(); render(); return; } endSemester(); render(); };
// ---------- 畢業選擇 ----------
function renderGradChoice(){
  const p=G.player;
  return stage('campus','stand','<b>畢業</b><span>學士服還沒還</span>')+'<div class="panel"><h2>畢業之後</h2><p class="sub">歷年平均 '+gpaAll()+'，存款 '+money(p.money)+'。'+(G.gradDone?'研究所也念完了。':'')+'沒有唯一正確的選擇；每一條路都會繼續。</p><div class="opts">'+
  '<button class="opt" onclick="UI.gradPick(\'full\',\'both\')">全職備考：律師與司法官一起報<small>一試同一份試卷；二試合併舉行；司法官另有三試口試</small></button>'+
  '<button class="opt" onclick="UI.gradPick(\'full\',\'lawyer\')">全職備考：只考律師<small>目標明確，壓力較小</small></button>'+
  '<button class="opt" onclick="UI.gradPick(\'part\',\'both\')">工作兼備考：白天在事務所當助理<small>有收入，每月自由時間少三格</small></button>'+
  '<button class="opt" onclick="G.setupRole=\'legal\';G.screen=\'careerSetup\';save();render()">直接進公司當法務<small>不需要執照。以後仍可再考</small></button>'+
  (!G.gradDone?'<button class="opt" onclick="gradSchool();render()">念研究所<small>兩年。研究能力與基礎會上升，錢會下降</small></button>':'')+
  '</div>'+(G.enrolled.length?'':'')+'</div>';
}
UI.gradPick=(mode,target)=>{ G.screen='barElective'; G.gradPick={mode,target}; render(); UI._renderElective(); };
UI._renderElective=()=>{ $('app').innerHTML=renderTop()+stage('library','read','<b>報名</b><span>選試科目</span>')+'<div class="panel"><h2>律師考試選試科目</h2><p class="sub">律師二試須任選一科選試科目（100 分）；司法官二試沒有選試。你大學修過的相關課程會有幫助。</p><div class="opts">'+Object.entries(ELECTIVES).map(([k,e])=>'<button class="opt" onclick="barBegin(\''+G.gradPick.mode+'\',\''+G.gradPick.target+'\',\''+k+'\');render()">'+e.name+(e.course&&G.courses[e.course]?'<small>你修過'+COURSES[e.course].name+'</small>':'<small>沒修過相關課程，靠自己準備</small>')+'</button>').join('')+'</div></div>'; };
// ---------- 交換 ----------
function renderExchDecide(){
  const s=exchScore(); const p=G.player;
  const dests=Object.values(EXCH_DEST).map(d=>{ const el=exchEligible(d); const on=(G.exchPrefs||[]).includes(d.id); return '<button class="choice'+(on?' on':'')+'" onclick="UI.exchPref(\''+d.id+'\')"><b>'+d.country+'・'+d.name+(on?' <span class="tag g">第 '+((G.exchPrefs||[]).indexOf(d.id)+1)+' 志願</span>':'')+'</b><span>'+d.city+'。'+d.vibe+'</span><span>課堂：'+d.style+'</span><span>成績門檻 '+d.gpaReq+'（你 '+s.gpa+'）'+(el.gpa?' ✓':' ✗')+'；語言：'+(d.lang==='ja'?'日文 '+d.langReq+'（你 '+Math.round(s.ja)+'）':'英文 '+d.langReq+'（你 '+Math.round(s.en)+'）')+(d.altLang?' 或英文 '+d.altReq:'')+(el.lang?' ✓':' ✗')+'；名額 '+d.quota+'</span><span>費用約 '+money(d.cost)+'，每兩週生活費約 '+money(d.living)+'</span></button>'; }).join('');
  return stage('campus','stand','<b>交換申請</b><span>大二下・第 2 週</span>')+'<div class="panel"><h2>要不要申請交換？</h2><p class="sub">申請要看校內成績、語言、讀書計畫與志願排序。決定申請後，這學期可以安排「準備交換申請」來提高進度，期中前送出。錄取後大三上會在海外。不去交換的大三也有實習、旁聽與本地的生活。</p><div class="choice-grid">'+dests+'</div><div class="actions"><button class="btn" onclick="UI.exchApply()" '+((G.exchPrefs||[]).length?'':'disabled')+'>申請（依志願序）</button><button class="btn sec" onclick="exchDecideSkip();render()">不申請</button></div></div>';
}
UI.exchPref=(id)=>{ G.exchPrefs=G.exchPrefs||[]; const i=G.exchPrefs.indexOf(id); if(i>=0) G.exchPrefs.splice(i,1); else G.exchPrefs.push(id); render(); };
UI.exchApply=()=>{ exchDecideApply(G.exchPrefs.slice()); render(); };
function renderExchResult(){
  const x=G.exch; const got=x.result?EXCH_DEST[x.result]:null; const p=G.player;
  if(!got) return stage('campus','stand','<b>交換結果</b><span>放榜</span>')+'<div class="panel"><h2>沒有排到</h2>'+x.notes.map(n=>'<div class="line vig">'+esc(n)+'</div>').join('')+'<div class="note">大三還有實習、法院旁聽、社團與本地的人際。這不是比較差的人生。</div><div class="actions"><button class="btn" onclick="exchDecline();render()">繼續</button></div></div>';
  const need=Math.round(got.cost*0.45); const have=p.money+(x.scholar||0);
  return stage('campus','stand','<b>交換結果</b><span>放榜</span>')+'<div class="panel"><h2>錄取：'+got.country+'・'+got.name+'</h2>'+x.notes.map(n=>'<div class="line vig">'+esc(n)+'</div>').join('')+'<div class="kv"><b>學費／機票／保證金</b><span>約 '+money(need)+'</span><b>存款</b><span>'+money(p.money)+'</span><b>獎學金</b><span>'+(x.scholar?money(x.scholar):'無（歷年平均 80 以上有機會）')+'</span><b>學分抵免</b><span>約 '+Math.round(got.credits*100)+'%，可能影響畢業進度</span></div><div class="note">錢怎麼安排？</div><div class="opts">'+
  (have>=need?'<button class="opt" onclick="exchAccept(\'self\');render()">用存款與獎學金<small>去</small></button>':'')+
  '<button class="opt" onclick="exchAccept(\'family\');render()">請家裡支援<small>可以去，但要多打幾通電話</small></button><button class="opt" onclick="exchAccept(\'loan\');render()">申請就學貸款<small>之後每個月會多一筆支出</small></button><button class="opt" onclick="exchDecline();render()">放棄<small>留在台灣過大三</small></button></div></div>';
}
function renderExchPrep(){
  const step=EXCH_PREP[G.exch.prepIdx]; const opts=step.opts.filter(o=>!o.when||o.when(G)); const d=EXCH_DEST[G.exch.dest];
  return stage('dorm','type','<b>出發前</b><span>'+d.country+'・'+d.name+'</span>')+'<div class="panel"><h2>出發前：'+step.q+'</h2><p class="sub">還有 '+(EXCH_PREP.length-G.exch.prepIdx)+' 件事要決定。</p><div class="opts">'+opts.map((o,i)=>'<button class="opt" onclick="exchPrepChoose('+i+');render()">'+esc(o.t)+'</button>').join('')+'</div></div>';
}
function renderExchDepart(){ const d=EXCH_DEST[G.exch.dest]; return stage('abroadTravel','walk','<b>出發</b><span>'+d.country+'</span>')+'<div class="panel"><h2>出發</h2><div class="line vig">機場。媽媽在安檢口外面站了很久。你回頭看了兩次。</div><div class="line vig">飛機上你看了兩部電影，睡了三小時，醒來的時候窗外是另一個國家的早上。</div><div class="line vig">你不知道接下來會怎樣。這是好事。</div><div class="actions"><button class="btn" onclick="exchStart();render()">抵達</button></div></div>'; }
function renderExchReturn(){ const x=G.exch; const d=EXCH_DEST[x.dest]; return stage('campus','walk','<b>回來了</b><span>'+d.country+'的一個學期</span>')+'<div class="panel"><h2>返台</h2><div class="kv"><b>交換學期成績</b><span>'+x.finalGrade+'</span><b>學分抵免</b><span>約 '+Math.round(x.creditRatio*100)+'%'+(x.creditRatio<0.7?'（下學期要補修，少一格自由時間）':'')+'</span><b>'+(d.lang==='ja'?'日文':'英文')+'</b><span>'+Math.round(x.langAtReturn)+'（之後不用會慢慢掉）</span><b>去過的地方</b><span>'+(x.memories.join('、')||'沒有特別去哪裡')+'</span><b>朋友</b><span>'+(x.friends>=30?'有幾個會偶爾聯絡的人':'認識了一些人')+'</span></div><div class="line vig">回到宿舍，一切都跟離開的時候一樣，只有你不一樣。便利商店的咖啡變便宜了，或者是你變了。</div><div class="line vig">'+(x.interest?'你在那裡對「'+x.interest+'」產生了興趣。這件事之後會回來找你。':'你發現自己講話的時候偶爾會卡在一個中文想不起來的字。')+'</div><div class="actions"><button class="btn" onclick="exchReturnDone();render()">大三下</button></div></div>'; }
// ---------- 國考畫面 ----------
function renderBarExam1(){ const b=G.bar; const e=b.exam1; return stage('classroom','type','<b>一試</b><span>8 月・四卷選擇題</span>')+'<div class="panel"><h2>一試結果</h2><div class="tablewrap"><table><tr><th>試卷</th><th>得分</th></tr>'+e.paper.map(x=>'<tr><td>'+esc(x.name)+'</td><td class="num">'+x.score+'</td></tr>').join('')+'<tr><td><b>合計</b></td><td class="num"><b>'+e.total+' / 600</b></td></tr></table></div><div class="note '+(b.passed1?'ok':'bad')+'">'+(b.passed1?'通過。分數線約 '+e.cut+'（前 33%）。二試在 10 月。':'未達分數線（約 '+e.cut+'，前 33%）。今年到此為止。')+'</div><div class="actions"><button class="btn" onclick="barExam1Next();render()">繼續</button></div></div>'; }
function renderBarOral(){ const b=G.bar; const q=ORAL_QS[b.oralStep]; return stage('court','stand','<b>三試・口試</b><span>隔年一月・台北</span>')+'<div class="panel"><h2>集體口試</h2><p class="sub">評量儀態、溝通能力、人格特質、才識與應變。100 分，未滿 60 分不予錄取；筆試與口試合併計算擇優錄取（遊戲簡化）。</p><div class="case">'+esc(q.q)+'</div><div class="opts">'+q.opts.map((o,i)=>'<button class="opt" onclick="barOralChoose('+i+');render()">'+esc(o.t)+'</button>').join('')+'</div></div>'; }
function renderBarResult(){
  const b=G.bar; const p=G.player; const pass=b.lawyerPass||b.judgePass;
  const opts=[]; if(b.judgePass) opts.push('<button class="opt" onclick="barAfterResult(\'trainJudge\');render()">進入司法官學院受訓<small>兩年後分發為法官或檢察官</small></button>'); if(b.lawyerPass) opts.push('<button class="opt" onclick="barAfterResult(\'trainLawyer\');render()">律師職前訓練<small>基礎訓練加事務所實習，之後成為新進律師</small></button>');
  if(b.lawyerPass&&!b.judgePass&&b.target!=='lawyer') opts.push('<button class="opt" onclick="barAfterResult(\'retryFull\');render()">先不執業，明年再拚一次司法官<small>律師資格保留</small></button>');
  if(!pass){ opts.push('<button class="opt" onclick="barAfterResult(\'retryFull\');render()">再戰一年（全職）<small>存款 '+money(p.money)+'</small></button>','<button class="opt" onclick="barAfterResult(\'retryPart\');render()">再戰一年（工作兼備考）<small>白天當助理，有收入</small></button>','<button class="opt" onclick="barAfterResult(\'legal\');render()">轉公司法務<small>不需要執照，以後仍可再考</small></button>'); if(!G.gradDone) opts.push('<button class="opt" onclick="barAfterResult(\'grad\');render()">念研究所<small>換一種方式和法律相處</small></button>'); if(b.attempts>=2) opts.push('<button class="opt" onclick="barAfterResult(\'leave\');render()">離開考試，重新選擇方向<small>學過的東西不會消失</small></button>'); }
  return stage(pass?'street':'dorm',pass?'stand':'sit','<b>放榜</b><span>'+(b.judgePass?'二月':'十二月')+'</span>',{night:!pass})+'<div class="panel"><h2>'+(b.judgePass?'司法官考試錄取':b.lawyerPass?'律師考試及格':'落榜')+'</h2>'+(b.exam2?'<div class="kv"><b>一試</b><span>'+b.exam1.total+' / 600</span><b>二試（律師）</b><span>'+b.exam2.total+' / 1000，核心 '+b.exam2.core+' / 800</span>'+(b.target!=='lawyer'?'<b>二試（司法官）</b><span>'+b.exam2.judgeTotal+' / 900</span>':'')+(b.oral!=null?'<b>三試口試</b><span>'+b.oral+' / 100</span>':'')+'</div>':'')+(b.why?'<div class="note '+(pass?'':'bad')+'">'+esc(b.why)+'</div>':'')+
  (pass?'<div class="line vig">'+(b.judgePass?'小安傳來訊息：「我也上了。」你們約在大學附近那家火鍋。':'你在圖書館四樓看到自己的准考證號碼。旁邊的人在哭，你不確定是哪一種哭。')+'</div>':'<div class="line vig">落榜。你在圖書館坐了一個下午，什麼都沒讀。晚上阿哲傳訊息：「吃飯。」</div><div class="line vig">已經累積的能力、人際與存款都還在。接下來怎麼走？</div>')+'<div class="opts">'+opts.join('')+'</div></div>';
}
function renderTraining(){ const t=G.training; const step=TRAINING[t.kind][t.step]; const opts=step.opts.filter(o=>!o.when||o.when()); return stage(t.kind==='lawyer'?'firm':'court','stand','<b>'+(t.kind==='lawyer'?'律師職前訓練':'司法官學院')+'</b><span>時間跳轉</span>')+'<div class="panel"><h2>'+(t.kind==='lawyer'?'職前訓練與實習':'受訓')+'</h2><div class="case">'+esc(step.q)+'</div><div class="opts">'+opts.map((o,i)=>'<button class="opt" onclick="trainingChoose('+i+');render()">'+esc(o.t)+(o.hint?'<small>'+esc(o.hint)+'</small>':'')+'</button>').join('')+'</div></div>'; }
// ---------- 職涯畫面 ----------
function renderCareerSetup(){
  const r=G.setupRole;
  if(r==='legal'){ return stage('meeting','stand','<b>找工作</b><span>公司法務</span>')+'<div class="panel"><h2>去哪一種公司？</h2><div class="opts">'+Object.entries(COMPANIES).map(([k,c])=>{ const ok=!(c.needEn&&G.player.skills.lang.en<c.needEn); const kai=k==='startup'&&!G.npcs.kai.met; return '<button class="opt" '+(ok&&!kai?'onclick="careerBegin(\'legal\',{company:\''+k+'\'});render()"':'disabled')+'>'+c.name+' <span class="tag">'+c.type+'</span><small>'+c.desc+'。起薪約 '+money(c.salary)+(c.needEn?'。英文需達 '+c.needEn:'')+(kai?'。（你不認識阿凱）':'')+'</small></button>'; }).join('')+'</div></div>'; }
  if(r==='lawyer'){ const f=FIRMS[G.firmPick||'small']; return stage('firm','stand','<b>新進律師</b><span>'+f.name+'</span>')+'<div class="panel"><h2>正式成為律師</h2><p>職前訓練結束，'+f.name+'留下了你。名片印好了，上面有「律師」兩個字。星期一早上，你現在要做什麼？</p><div class="actions"><button class="btn" onclick="careerBegin(\'lawyer\',{firm:\''+(G.firmPick||'small')+'\'});render()">第一週</button></div></div>'; }
  const isJ=r==='judge'; return stage(isJ?'chambers':'prosec','stand','<b>分發</b><span>'+(isJ?'地方法院':'地方檢察署')+'</span>')+'<div class="panel"><h2>'+(isJ?'候補法官':'候補檢察官')+'</h2><p>分發到'+(isJ?'一間地方法院。書記官小方把第一批卷放在你桌上，說：「法官，下週三有庭。」':'一間地方檢察署。偵查佐阿豪第一天就來敲門：「檢座，這件要不要聲押？」')+'</p><p class="sub">候補與試署期間、職稱與程序，遊戲做了簡化。</p><div class="actions"><button class="btn" onclick="careerBegin(\''+r+'\');render()">第一週</button></div></div>';
}
function renderCareerReview(){ const r=G.review; const c=G.career; const m=c.metrics; const names={analysis:'法律分析',prep:'準備品質',comm:'溝通',time:'時間管理',ethics:'專業倫理',trust:'客戶信任',rep:'聲譽',firmRel:'事務所關係',procedure:'程序保障',evidence:'證據判斷',reasoning:'說理',growth:'專業成長',coord:'與警協作',business:'商業成果',riskCtl:'風險控制',trustSales:'業務信任',trustFin:'財務信任',trustHR:'人資信任',trustBoss:'主管信任',team:'團隊',clients:'客戶',harmony:'合夥關係',profit:'獲利'};
  const meters='<div class="meters">'+Object.keys(m).filter(k=>names[k]).map(k=>'<div>'+names[k]+'<b>'+Math.round(m[k])+'</b></div>').join('')+(c.stage==='own'?'<div>案源<b>'+Math.round(c.own.pipeline||0)+'</b></div><div>品牌<b>'+Math.round(c.own.brand||0)+'</b></div><div>應收<b>'+money(c.own.receivable||0)+'</b></div><div>月租<b>'+money(c.own.rent||0)+'</b></div>':'')+'</div>';
  return stage(careerScene(),'sit','<b>季末</b><span>'+esc(timeLabel())+'</span>')+'<div class="panel"><h2>這一季</h2>'+r.lines.map(l=>'<div class="line vig">'+l+'</div>').join('')+meters+(r.options.length?'<h3>選擇</h3><div class="opts">'+r.options.map(o=>'<button class="opt" onclick="careerChoose(\''+o.k+'\');render()">'+esc(o.t)+(o.hint?'<small>'+esc(o.hint)+'</small>':'')+'</button>').join('')+'</div>':'')+'<div class="actions"><button class="btn sec" onclick="G.screen=\'careerOffers\';save();render()">維持現狀，繼續</button></div></div>';
}
function renderCareerOffers(){ const c=G.career; const o=c.offersReview||[]; if(!o.length) return stage(careerScene(),'stand','<b>新的一季</b><span></span>')+'<div class="panel"><h2>新的一季</h2><p class="sub">沒有待決定的新案。</p><div class="actions"><button class="btn" onclick="offersDone();render()">開始</button></div></div>';
  return stage(careerScene(),'stand','<b>接案評估</b><span></span>')+'<div class="panel"><h2>要不要接？</h2><p class="sub">評估時間、報酬、案情與委任關係。手上目前 '+c.docket.filter(m=>!m.done).length+' 件。</p><div class="docket">'+o.map((m,i)=>'<div class="matter"><div class="hd"><b>'+esc(m.title)+'</b><span class="sub">'+esc(m.who)+'</span></div><div class="sub">'+m.type+'・預估 '+m.dl+' 週・複雜度 '+'●'.repeat(m.cx)+(m.fee?'・報酬 '+money(m.fee):'')+'・當事人期待 '+(m.expect>=70?'很高（覺得一定贏）':m.expect>=50?'一般':'務實')+'</div><div class="actions"><button class="btn small" onclick="acceptOffer('+i+');render()">接</button><button class="btn small sec" onclick="declineOffer('+i+');render()">不接</button></div></div>').join('')+'</div><div class="actions"><button class="btn" onclick="offersDone();render()">'+(o.length?'剩下的都不接，開始這一季':'開始這一季')+'</button></div></div>';
}
function renderSetupFirm(){ const step=FIRM_SETUP[G.firmSetup.step]; const opts=step.opts.filter(o=>!o.when||o.when()); return stage('myfirm','stand','<b>開業</b><span>'+step.q+'</span>')+'<div class="panel"><h2>自己的事務所：'+step.q+'</h2><p class="sub">開辦費約 180,000，之後每月有租金與人力成本；收入來自案源與收款。</p><div class="opts">'+opts.map((o,i)=>'<button class="opt" onclick="firmSetupChoose('+i+');render()">'+esc(o.t)+'</button>').join('')+'</div></div>'; }
function renderEnding(){ const e=ENDINGS[G.endingKey]||ENDINGS.stable; const recap=endingRecap(); const sug=endingSuggest(); const c=G.career;
  return stage(c?careerScene():'campus','stand','<b>'+esc(e.title)+'</b><span>'+playerAge()+' 歲</span>')+'<div class="panel ending"><h1>'+esc(e.title)+'</h1><p>'+esc(e.text)+'</p><div class="recap"><h3>你做過的事</h3>'+recap.map(r=>'<div class="memo">'+esc(r.text)+'<small>'+esc(r.t)+'</small></div>').join('')+'</div>'+(G.diary.length?'<h3>最後幾則日記</h3>'+G.diary.slice(-5).map(d=>'<div class="line vig">'+esc(d.t)+'：'+esc(d.text)+'</div>').join(''):'')+'<h3>下一輪可以試試</h3><ul>'+sug.map(s=>'<li>'+esc(s)+'</li>').join('')+'</ul><div class="actions"><button class="btn" onclick="UI.newLife()">重新開始</button><button class="btn sec" onclick="UI.keepPlaying()">其實我還想繼續玩</button></div></div>'; }
UI.newLife=()=>{ try{ localStorage.removeItem(SAVE_KEY); }catch(e){} G=null; render(); };
UI.keepPlaying=()=>{ if(G.career){ G.sched=[]; G.screen='plan'; } else { G.screen='plan'; } save(); render(); };
// ---------- 面板 ----------
UI.openModal=(k)=>{ modalOpen=k; if(!G){ $('app').innerHTML=renderTitle()+renderModal(); } else render(); };
UI.closeModal=()=>{ modalOpen=null; if(!G) $('app').innerHTML=renderTitle(); else render(); };
function renderModal(){
  let body='';
  if(modalOpen==='skills'&&G){ const p=G.player.skills; const bar=(n,v)=>'<div><span>'+n+'</span><span class="b"><i style="width:'+Math.round(v)+'%"></i></span><span class="sub">'+Math.round(v)+'</span></div>';
    body='<h3>一般能力</h3><div class="skillrows">'+bar('答案結構',p.structure)+bar('寫作速度',p.speed)+bar('資料檢索',p.research)+bar('表達與協商',p.express)+bar('實務判斷',p.judgment)+bar('英文',p.lang.en)+bar('日文',p.lang.ja)+'</div>';
    if(G.bar){ body+='<h3>國考科目</h3><div class="skillrows">'+SUBJ_IDS.map(k=>{ const d=G.bar.subj[k]; const st=barStatus(d); return '<div><span>'+SUBJ[k].name+'</span><span class="b"><i style="width:'+Math.round((d.u+d.s+d.m+d.r+d.i+d.a)/6)+'%"></i></span><span class="status s'+st.s+'">'+st.t+'</span></div>'; }).join('')+'</div>'; }
    const cs=Object.keys(G.courses); if(cs.length){ body+='<h3>課程熟練度</h3><p class="sub">理解／體系／記憶／提取／爭點／涵攝，系統在背景計算，這裡只顯示狀態。</p><div class="skillrows">'+cs.map(cid=>{ const c=G.courses[cid]; const st=courseStatus(c); return '<div><span>'+esc(courseName(cid))+'</span><span class="b"><i style="width:'+Math.round((c.u+c.s+c.m+c.r+c.i+c.a)/6)+'%"></i></span><span class="status s'+st.s+'">'+st.t+'</span></div>'; }).join('')+'</div>'; }
    body+='<h3>統計</h3><p class="sub">學習 '+G.stats.study+' 格・休息 '+G.stats.rest+' 格・打工 '+G.stats.work+' 格・社交 '+G.stats.social+' 次・歷年平均 '+gpaAll()+'</p>';
  }
  if(modalOpen==='people'&&G){ const ids=Object.keys(NPCS).filter(id=>G.npcs[id]&&G.npcs[id].met); body='<div class="people">'+ids.map(id=>{ const n=NPCS[id]; const s=G.npcs[id]; return '<div class="person"><div class="av">'+avatarSVG(id,36)+'</div><div><b>'+n.name+' <span class="sub">'+n.role+'</span></b><div class="rel"><i style="width:'+Math.round(clamp(s.rel,0,100))+'%"></i></div><div class="sub">'+relLabel(s.rel)+(s.stage?'・'+esc(s.stage):'')+'</div><div class="sub">'+esc(n.bio)+'</div>'+(s.news?'<div class="sub">'+esc(s.news)+'</div>':'')+'</div></div>'; }).join('')+'</div><p class="sub" style="margin-top:8px">人物有自己的人生，即使你沒有互動也會繼續。關係會慢慢淡，也可以修復。</p>'; }
  if(modalOpen==='memory'&&G){ const ks=Object.keys(G.flags).filter(k=>FLAG_TEXT[k]); body=(ks.length?ks.map(k=>'<div class="memo">'+FLAG_TEXT[k]+(G.flags[k].note?'（'+esc(G.flags[k].note)+'）':'')+'<small>'+esc(G.flags[k].t)+'</small></div>').join(''):'<p class="sub">還沒有值得記住的事。</p>')+'<h3>日記</h3>'+G.diary.slice(-12).reverse().map(d=>'<div class="line vig">'+esc(d.t)+'：'+esc(d.text)+'</div>').join(''); }
  if(modalOpen==='save'){ const ok=storageOK(); const slots=[1,2,3].map(n=>{ const i=slotInfo(n); return '<div class="s"><span>存檔 '+n+'：'+(i?esc(i.label)+' <span class="sub">'+new Date(i.t).toLocaleString('zh-TW')+'</span>':'（空）')+'</span><span class="row">'+(G?'<button class="btn small" onclick="UI.saveTo('+n+')">存到這裡</button>':'')+(i?'<button class="btn small sec" onclick="UI.loadFrom('+n+')">讀取</button>':'')+'</span></div>'; }).join('');
    body=(ok?'<p class="sub">每一段時間結束會自動存檔在這個瀏覽器。</p>':'<div class="note warn">這個環境無法使用瀏覽器儲存，請用下面的匯出／匯入保存進度。</div>')+'<div class="saves">'+slots+'</div><h3>匯出／匯入</h3><p class="sub">匯出：複製下面的 JSON 存起來。匯入：把 JSON 貼進來按「匯入」。</p><textarea id="ioarea" placeholder="貼上存檔 JSON">'+(G?esc(exportJSON()):'')+'</textarea><div class="actions">'+(G?'<button class="btn small" onclick="UI.copyExport()">複製匯出</button>':'')+'<button class="btn small sec" onclick="UI.doImport()">匯入</button></div>'; }
  if(modalOpen==='help'){ body='<h3>怎麼玩</h3><ul class="sub"><li>每段時間有幾格自由時間。學習活動各自提升不同能力：讀教科書建立理解與體系；整理筆記建立結構與記憶；練習案例訓練爭點與涵攝；限時練題改善結構與速度；複習與回想把「看過」變成「提取得出來」。</li><li>連續高強度讀書會出現邊際效益遞減；精力低時效率打折。休息會讓效率回來。</li><li>期中期末要親自作答：時間分配、選爭點、答案結構。考後有回饋。</li><li>人物有自己的人生。關係會淡，也能修復。有些選擇多年後會被記得。</li><li>考上不是結局。律師、法官、檢察官、法務都有各自的工作流與進階階段。</li><li>不存在最佳玩法。成績、人際、實習、交換、打工、休息，各有機會成本。</li></ul><h3>本版簡化</h3><p class="sub">學校、老師、課程與人物均為虛構；國考制度依公開說明整理，分數線用近似值；訓練、候補試署、分發等流程壓縮成少數決定；法條不逐字呈現。</p>'; }
  return '<div class="modal" onclick="if(event.target===this)UI.closeModal()"><div class="box"><h2>'+({skills:'能力與熟練度',people:'人物',memory:'人生記憶',save:'存檔',help:'說明'}[modalOpen]||'')+'<button class="btn small sec" onclick="UI.closeModal()">關閉</button></h2>'+body+'</div></div>';
}
UI.saveTo=(n)=>{ if(saveSlot(n)) toast('已存檔'); else toast('無法存檔（瀏覽器儲存不可用）'); render(); };
UI.loadFrom=(n)=>{ if(loadSlot(n)){ modalOpen=null; toast('已讀取'); render(); } else toast('讀取失敗'); };
UI.copyExport=()=>{ const t=$('ioarea').value; navigator.clipboard.writeText(t).then(()=>toast('已複製')).catch(()=>{ $('ioarea').select(); toast('請手動複製'); }); };
UI.doImport=()=>{ const t=$('ioarea').value; if(importJSON(t)){ modalOpen=null; toast('匯入成功'); render(); } else toast('匯入失敗：格式不對'); };
// ---------- 啟動 ----------
function boot(data){ if(data&&data.G&&data.G.v===3){ G=data.G; } render(); }
try{ if(window.claude&&window.claude.hot&&window.claude.hot.snapshot){ window.claude.hot.snapshot(()=>({G})); } }catch(e){}
if(window.claude&&window.claude.hot&&window.claude.hot.ready){ window.claude.hot.ready(boot); } else { boot(window.claude&&window.claude.hot?window.claude.hot.data:null); }
