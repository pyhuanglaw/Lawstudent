// CLUB-LATER-TERMS-1112：辯論社、登山社、系籃大一下～大二下的社課（AA_852，企劃線 b039356f5）——不需要瀏覽器。這是 Node 模擬，不是玩家在瀏覽器裡的流程（D131）。
//   字 src/data/club_later_terms.js（tools/story/import_club_later_terms.py）；term 在 src/data/activities.js（手寫檔，照稿的 rule）；演出 src/classes3d.js 的 clubNarr／clubRainNarr；index.html 載入。
//   0 檔案、白名單、匯入工具 --check、index.html 的順序
//   1 逐字對稿（企劃線的 commit 讀得到才比；讀不到＝比抄在這裡的幾句）：三社 × 三學期，句數 6／6／5
//   2 activities.js：三社的 term＝大一上～大二下；週次、星期、時間、地點和大一上一樣（每學期第 5～7、10～15 週都有、大三起沒有）；大一上的 narr 一個字沒動
//   3 旁白：大一下～大二下每學期用自己那一組、照順序、每句最多一次、用完＝''；大一上照舊用活動的 narr；吉他社、法服不受影響（照舊）；換學期從那一學期的第 1 句開始
//   4 系籃下雨場：大一下、大二下＝那一學期「（下雨」的那一句（不佔晴天的順序；晴天照順序輪的時候跳過它）；大二上沒有下雨的句子＝照順序輪（不拿大一上那一句）；大一上照舊（走廊那一句）
//   5 真的參加一場（classes3d.js attendActivity，真的 story3d.js）：大一下辯論社社課 → 那一學期第 1 句 → 社課結束了；還不是社員＝第一次去就入社（AA_485 3-4 現有規則，大一下不問入社單）
//   6 src/classes3d.js、activities.js 沒有手打 AA_852 的句子
// 修改前（開發分支 8408360181：沒有 club_later_terms.js、三社 term 只有 Y1S1）：0 就 FAIL。用法：node tests/club_later_terms_1112_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..'), J=JSON.stringify, SHA='b039356f5', SRC='docs/story_planning/AA_852_club_later_terms.json';
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+String(info).slice(0,600):'')); if(!ok) fails++; };
const done=()=>{ console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0); };
const need=['src/data/club_later_terms.js','tools/story/import_club_later_terms.py'].filter(f=>!fs.existsSync(path.join(ROOT,f)));
if(need.length){ check('0. 檔案在',false,need.join(' ')); done(); }
global.window=global; global.self=global; global.P3={CAST:{}}; global.THREE={Vector3:function(){}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''}; console.warn=()=>{};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|COURSES|CLS|ACTIVITIES|CLUB_FAIR|CLUBFAIR|CLUB_LATER_TERMS)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/characters.js','src/data/calendar.js','src/data/places.js','src/data/courses.js','src/data/activities.js','src/data/club_later_terms.js','src/data/events.js','src/social3d.js','src/events3d.js','src/story3d.js','src/classes3d.js','src/data/club_fair.js','src/clubfair3d.js']) load(f);
const D=CLUB_LATER_TERMS, CLUBS=['club_debate','club_hiking','dept_basketball'], TERMS=['Y1S2','Y2S1','Y2S2'], A=id=>ACTIVITIES.list.find(a=>a.id===id);
/* 那一學期第 w 週、星期 wd 的那一天 */
const dOf=(T,w,wd)=>{ for(let d=1;d<2200;d++){ const t=CALENDAR.termOf(d); if(t&&t.id===T&&t.week===w&&CALENDAR.dateOf(d).wd%7===wd%7) return d; } return null; };
const mkG=(day,hour,o)=>Object.assign({day,hour:hour==null?19.1:hour,weekday:CALENDAR.dateOf(day).wd%7,stage:'law',zone:'campus',weather:'clear',flags:{},events:{done:{},last:{}},energy:80,goal:'',goalDest:null},o||{});
/* 稿的幾句抄在這裡（企劃線拿不到也比得到）*/
const COPY={club_debate:{Y1S2:[0,'（今天的題目：宿舍該不該有門禁。你第一次沒有看稿講完三分鐘。）'],Y2S1:[5,'（學期最後一次社課，大家把這學期辯過的題目寫在黑板上，寫了一整面。）'],Y2S2:[4,'（最後一次社課。計時的鈴修好了，按下去的聲音比你記得的大。）']},
  club_hiking:{Y1S2:[0,'（今天複習打結。這次你一次就綁對，旁邊的人請你再綁一次給他看。）'],Y2S1:[2,'（今天看颱風路徑。社長說，取消一次出隊，比撤退一次容易。）'],Y2S2:[4,'（最後一次行前會。社長說：報名前，先問問自己的腳。你聽過這一句。）']},
  dept_basketball:{Y1S2:[3,'（下雨，在體育館走廊練傳球。球滾到樓梯口，沒有人想去撿。）'],Y2S1:[3,'（系際盃打完了。大家去吃飯，飯桌上沒有人講比數，只講誰跌倒。）'],Y2S2:[3,'（下雨，走廊。球聲還是很大聲，你已經不覺得吵了。）']}};

(async()=>{
  /* ===== 0 ===== */
  { const allow=JSON.parse(fs.readFileSync(path.join(ROOT,'docs/handoff/story_import_allow.json'),'utf8')), e=allow.files.filter(x=>x.path===SRC);
    check('0. 白名單有 AA_852 那一筆（approved、'+SHA+'）；資料檔寫的來源一樣',e.length===1&&e[0].status==='approved'&&e[0].sha===SHA&&!!e[0].approvedBy&&e[0].task==='CLUB-LATER-TERMS-1112'&&D.src===SRC+'@'+SHA,J(e.map(x=>[x.sha,x.status])));
    let out='', ok=false, skip=false; try{ cp.execFileSync('git',['-C',ROOT,'cat-file','-e',SHA+':'+SRC],{stdio:'ignore'}); }catch(err){ skip=true; }
    if(!skip){ try{ out=cp.execFileSync('python3',[path.join(ROOT,'tools/story/import_club_later_terms.py'),'--check'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}); ok=/^OK/.test(out); }catch(err){ out=String(err.stderr||err.message).slice(0,300); } }
    check('0. 匯入工具 --check：資料檔和企劃稿一致'+(skip?'（這個複本沒有企劃線的 '+SHA+'，略過；看第 1 項）':''),skip||ok,out.trim().slice(0,120));
    const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'), iA=html.indexOf('src/data/activities.js'), iD=html.indexOf('src/data/club_later_terms.js'), iC=html.indexOf('src/classes3d.js'), ver=s=>(new RegExp(s.replace(/[.\/]/g,'\\$&')+'\\?v=([0-9.]+)').exec(html)||[])[1];
    check('0. index.html 載入 club_later_terms.js（在 activities.js 後面、classes3d.js 前面；版本號和 classes3d.js 一樣）',iA>0&&iD>iA&&iC>iD&&!!ver('src/data/club_later_terms.js')&&ver('src/data/club_later_terms.js')===ver('src/classes3d.js'));
    check('0. 載入：CLS.clubNarr／termNarr／clubRainNarr',['clubNarr','termNarr','clubRainNarr'].every(k=>typeof CLS[k]==='function')); }
  if(fails) return done();

  /* ===== 1 逐字對稿 ===== */
  { let doc=null; try{ doc=JSON.parse(cp.execFileSync('git',['-C',ROOT,'show',SHA+':'+SRC],{encoding:'utf8',stdio:['ignore','pipe','ignore']})); }catch(e){}
    check('1. 三社 × 三學期（Y1S2、Y2S1、Y2S2），句數各 6／6／5（共 51 句）；每句整句在（）裡、同一社不重複',J(D.terms)===J(TERMS)&&J(Object.keys(D.clubs))===J(CLUBS)&&CLUBS.every(c=>J(Object.keys(D.clubs[c]))===J(TERMS)&&J(TERMS.map(t=>D.clubs[c][t].length))===J([6,6,5])
      &&[].concat(...TERMS.map(t=>D.clubs[c][t])).every((s,i,L)=>/^（.+）$/.test(s)&&L.indexOf(s)===i)),J(CLUBS.map(c=>TERMS.map(t=>(D.clubs[c][t]||[]).length))));
    if(doc) check('1. 每一句和 AA_852（企劃線 '+SHA+'）一字不差、順序一樣',CLUBS.every(c=>TERMS.every(t=>J(D.clubs[c][t])===J(doc[c][t]))));
    else console.log('SKIP 1. 讀不到企劃線 '+SHA+'（沒有 fetch）：不逐句比稿，比抄在測試裡的 9 句');
    const bad=[]; for(const c of CLUBS) for(const t of TERMS){ const [i,s]=COPY[c][t]; if(D.clubs[c][t][i]!==s) bad.push(c+'.'+t+'['+i+']'); }
    check('1. 抄在測試裡的 9 句（每社每學期一句）位置和字都對',!bad.length,bad.join(' '));
    const old=[].concat(...CLUBS.map(c=>A(c).narr)), neu=[].concat(...CLUBS.map(c=>[].concat(...TERMS.map(t=>D.clubs[c][t]))));
    check('1. 不重複大一上那幾句（稿的 rule）',!neu.some(s=>old.includes(s)));
    check('1. 下雨場的那一句（開頭「（下雨」）：只有系籃大一下第 4 句、大二下第 4 句；大二上沒有',J(D.rain)===J({dept_basketball:{Y1S2:3,Y2S2:3}})&&neu.filter(s=>/^（下雨/.test(s)).length===2); }

  /* ===== 2 activities.js ===== */
  { const T4=['Y1S1','Y1S2','Y2S1','Y2S2'], W=[5,6,7,10,11,12,13,14,15];
    check('2. 三社的 term＝大一上～大二下（舊：只有 Y1S1）；吉他社照舊也是這四個；週次、星期、時間、地點的欄位沒動',CLUBS.every(c=>J(A(c).term)===J(T4)&&J(A(c).weeks)===J(W)&&!A(c).termWeeks)&&J(A('club_guitar').term)===J(T4)
      &&A('club_debate').weekday===2&&A('club_debate').t0===19&&A('club_debate').t1===21&&A('club_debate').roomName==='博思 201'&&A('club_hiking').weekday===4&&A('club_hiking').t0===19.5&&A('club_hiking').roomName==='普通 201'
      &&A('dept_basketball').weekday===5&&A('dept_basketball').t0===17.5&&A('dept_basketball').t1===19&&A('dept_basketball').rain.narr===3);
    const bad=[]; for(const c of CLUBS){ const a=A(c); for(const T of T4) for(let w=1;w<=16;w++){ const d=dOf(T,w,a.weekday); if(d==null) continue; const hol=!!(CALENDAR.holiday&&CALENDAR.holiday(d)); const on=ACTIVITIES.on(a,d,{flags:{}}); if(W.includes(w)?(!on&&!hol):on) bad.push(c+' '+T+' w'+w+' '+on); } }
    check('2. 四個學期每一個第 5～7、10～15 週的那一天都有社課（國定假日除外）、其他週沒有',!bad.length,bad.slice(0,6).join('｜'));
    const off=[]; for(const c of CLUBS){ const a=A(c); for(const T of ['Y3S1','Y3S2','Y4S1','Y4S2']) for(const w of W){ const d=dOf(T,w,a.weekday); if(d!=null&&ACTIVITIES.on(a,d,{flags:{}})) off.push(c+' '+T+' w'+w); } }
    check('2. 大三起這三個社團不再排社課（稿的 rule）',!off.length&&dOf('Y3S1',5,2)!=null,off.slice(0,4).join('｜'));
    check('2. 大一上的 narr 一個字沒動（辯論 6、登山 5、系籃 5；系籃第 4 句是走廊那一句）',A('club_debate').narr.length===6&&A('club_hiking').narr.length===5&&A('dept_basketball').narr.length===5&&A('club_debate').narr[0]==='（正反方練習、計時。今天的題目：大學該不該點名。）'&&A('club_hiking').narr[4]==='（下一次出隊的名單貼出來了。社長說：報名前，先問問自己的腳。）'&&A('dept_basketball').narr[3]==='（今天在體育館走廊練運球。球聲在走廊裡很大聲。）'); }

  /* ===== 3 旁白照學期 ===== */
  { const bad=[];
    for(const c of ['club_debate','club_hiking']) for(const T of TERMS){ const a=A(c), L=D.clubs[c][T], G=mkG(dOf(T,5,a.weekday)), got=[]; for(let i=0;i<L.length+2;i++) got.push(CLS.clubNarr(G,a));
      if(J(got)!==J(L.concat(['','']))||G.acts.narr[c+'@'+T]!==L.length) bad.push(c+' '+T+' '+J(got).slice(0,120)); }
    check('3. 辯論社、登山社：大一下～大二下每學期用自己那一組、照順序、每句最多一次、用完＝空（只顯示「社課結束了。」）',!bad.length,bad.join('｜'));
    const bad1=[]; for(const c of CLUBS){ const a=A(c), G=mkG(dOf('Y1S1',5,a.weekday)), got=[]; for(let i=0;i<a.narr.length+1;i++) got.push(CLS.clubNarr(G,a)); if(J(got)!==J(a.narr.concat(['']))||CLS.termNarr(G,a)!==null) bad1.push(c); }
    check('3. 大一上照舊：用活動自己的 narr（系籃晴天照順序含第 4 句，和原本一樣）',!bad1.length,bad1.join(' '));
    { const g=A('club_guitar'), G=mkG(dOf('Y1S2',5,1)); const a1=CLS.clubNarr(G,g), a2=CLS.clubNarr(G,g); check('3. 吉他社大一下照舊用它自己的 narr（AA_852 沒有吉他社）',a1===g.narr[0]&&a2===g.narr[1]&&CLS.termNarr(G,g)===null,J([a1,a2])); }
    { const a=A('club_debate'), G=mkG(dOf('Y1S1',15,2)); G.acts={att:{},narr:{'club_debate@Y1S1':6}}; const x=CLS.clubNarr(G,a); G.day=dOf('Y1S2',5,2); const y=CLS.clubNarr(G,a); G.day=dOf('Y2S1',5,2); const z=CLS.clubNarr(G,a); G.day=dOf('Y1S2',6,2)||G.day; G.day=dOf('Y2S1',6,2); const z2=CLS.clubNarr(G,a);
      check('3. 換學期：大一上用完＝空 → 大一下第 1 句 → 大二上第 1 句、第 2 句（各學期各自數；舊存檔沒有那一格＝從第 1 句）',x===''&&y===D.clubs.club_debate.Y1S2[0]&&z===D.clubs.club_debate.Y2S1[0]&&z2===D.clubs.club_debate.Y2S1[1],J([x,y,z,z2])); }
    { const a=A('club_debate'), G=mkG(dOf('Y3S1',5,2)); check('3. 大三（這三社沒有社課；萬一被叫到）：沒有那一學期的組＝照舊走活動的 narr，不丟例外',CLS.termNarr(G,a)===null&&typeof CLS.clubNarr(G,a)==='string'); } }

  /* ===== 4 系籃下雨場 ===== */
  { const a=A('dept_basketball'), R=D.clubs.dept_basketball;
    for(const T of ['Y1S2','Y2S2']){ const G=mkG(dOf(T,5,5),17.75), L=R[T], sunny=L.filter((s,i)=>i!==3), got=[]; const r0=CLS.clubRainNarr(G,a), n0=((G.acts||{}).narr||{})[a.id+'@'+T]|0; for(let i=0;i<sunny.length+1;i++) got.push(CLS.clubNarr(G,a)); const r1=CLS.clubRainNarr(G,a);
      check('4. 系籃 '+T+'：下雨場＝那一學期「（下雨」的那一句（不佔照順序輪的那一格、每個下雨天都是它）；晴天照順序輪、跳過那一句、用完＝空',r0===L[3]&&/^（下雨/.test(r0)&&n0===0&&r1===L[3]&&J(got)===J(sunny.concat(['']))&&!got.includes(L[3]),J([r0,got])); }
    { const T='Y2S1', G=mkG(dOf(T,5,5),17.75), got=[]; const r=CLS.clubRainNarr(G,a); for(let i=0;i<7;i++) got.push(CLS.clubNarr(G,a));
      check('4. 系籃大二上：那一學期沒有下雨的句子＝下雨場不固定演哪一句（null → 照順序輪）、不拿大一上走廊那一句；六句照順序',r===null&&J(got)===J(R[T].concat([''])),J([r,got])); }
    { const G=mkG(dOf('Y1S1',5,5),17.75); check('4. 系籃大一上照舊：下雨場＝活動 narr 第 4 句（走廊那一句）',CLS.clubRainNarr(G,a)===a.narr[3]&&CLS.clubRainNarr(G,A('club_debate'))===null); } }

  /* ===== 5 真的參加一場 ===== */
  { let G; const log=[], caps=[], chose=[]; let answers=[];
    const GM={get G(){ return G; },E:{zone:null,interactables:[],npcs:[],player:{busy:false,obj:{position:{x:0,z:0}}}},D:{active:false},S:{},npc:{},
      sceneBegin(){},sceneEnd(){},say:async(n,t)=>{ log.push(t); },toast(){},caption:(a,t)=>{ caps.push(t); },autosave(){},setGoal(){},
      choose:async o=>{ chose.push(o.map(q=>q.t)); return answers.length?answers.shift():0; },fade:async()=>{},sleep:async()=>{},advance(h){ G.hour+=h; },energy(){},money(){}};
    const go=async(T,w,c,o)=>{ const a=A(c); G=mkG(dOf(T,w,a.weekday),a.t0+0.1,Object.assign({zone:a.zone,flags:{introDone:true,afternoonDone:true,classDone:true}},o||{})); G.choices={}; G.events={done:{},last:{},count:0}; G.social=null; G.rel={}; SOCIAL.bind(G); EVENTS.bind(GM); log.length=0; caps.length=0; chose.length=0; answers=[0];
      let err=null; try{ await CLS.attendActivity(GM,a); }catch(e){ err=e; } return {a,err}; };
    if(typeof CLS.attendActivity!=='function'){ check('5. CLS.attendActivity 在',false); }
    else{ const r=await go('Y1S2',5,'club_debate'); const L=D.clubs.club_debate.Y1S2;
      check('5. 大一下第 5 週週二在博思 201 參加辯論社社課：旁白＝那一學期第 1 句（不是大一上的）、時間到 21:00、「社課結束了。」；沒有入社單（那是大一上第 5、6 週的事）',!r.err&&log.includes(L[0])&&!log.some(t=>A('club_debate').narr.includes(t))&&Math.abs(G.hour-21)<0.01&&caps[caps.length-1]==='社課結束了。'&&!log.includes(ACTIVITIES.LATE_JOIN.ask)&&!ACTIVITIES.lateJoinDue(G,r.a),J([String(r.err||''),log,caps]));
      check('5. 還不是社員的人大一下第一次去＝入社（現有規則 AA_485 3-4：第 7 週以後一去就入社；CLUB_club_debate）、記到場',G.flags.CLUB_club_debate===true&&!!(G.acts&&G.acts.att&&Object.keys(G.acts.att).some(k=>k.indexOf('club_debate@')===0)),J([G.flags,G.acts&&G.acts.att]));
      const acts=G.acts, fl=G.flags; const r2=await go('Y1S2',6,'club_debate',{}); G.acts=acts; Object.assign(G.flags,fl); log.length=0; await CLS.attendActivity(GM,r2.a);
      check('5. 下一週再去：第 2 句',log.includes(L[1])&&!log.includes(L[0]),J(log)); } }

  /* ===== 6 沒有手打 ===== */
  { const strip=s=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/.*$/mg,''), cls=strip(fs.readFileSync(path.join(ROOT,'src/classes3d.js'),'utf8')), act=strip(fs.readFileSync(path.join(ROOT,'src/data/activities.js'),'utf8'));
    const all=[].concat(...CLUBS.map(c=>[].concat(...TERMS.map(t=>D.clubs[c][t]))));
    check('6. classes3d.js、activities.js（註解以外）沒有 AA_852 的句子（字只在匯入的資料檔）',!all.some(s=>cls.includes(s)||act.includes(s))); }
  done();
})().catch(e=>{ console.error(e); console.log('FAILED (exception)'); process.exit(1); });
