// AA_517 宿舍大二到大四：312、507、409 的房間日常（DORM-Y24-1028；DORM203-MATES-1028 延伸、USER_WANTS X123）——不需要瀏覽器。
//   稿：企劃線 ced552c17 docs/story_planning/AA_517_宿舍大二到大四_312_507_409房間日常.md（git show 對稿；拿不到＝第 0 項 FAIL；劇情匯入白名單 story_import_allow.json 同一個 sha）
//   0  新檔載得到；index.html：dorm203_3d.js → … → data/dorm_y24_lines.js → dorm_y24_3d.js（兩個新檔相鄰）→ bbpack_events.js，在 story3d.js、postgrad3d.js 以後；story3d.js 四個掛勾；
//      遊戲裡的每一句（走進房間的旁白、房間的話、三件小事的旁白／台詞／選項、群組訊息）都在稿裡、一字不差、說話的人對、順序對；反過來，稿第 1～3 節的每一句遊戲裡都有；
//      三件小事的日子與時間、群組的時間照稿（3-3＝story3d.js 的宿舍退宿日 Y4K.out 前一晚）
//   1  住哪一間（312／507／409；203、搬出宿舍、日本路線退宿到搬進 409、美國路線在美國＝沒有）；作息照舊（S.dormMates），只多 409 最後一晚柏翰在
//   2  走進房間的旁白：從門口走進來才說（睡覺醒來、讀檔、搬進新房間、劇情帶進來、待在房間跳時間不說）；每一間照順序輪流、同一天不重複；
//      「學弟在問阿哲」阿哲在房間才說；寒暑假、23:30 以後沒有；過了 15 分鐘、走出去、中間演了事件＝不說
//   3  房間閒聊：一天一句新的、每句一次、照順序；之後兩句輪流；學期、週次、期末前（大四下 15 週＝第 10～14 週）、沛珊分開（演過、沒有和她交往）、12/19 以後、
//      感冒那晚演過、日本路線大三下不出、美國路線（第 1 列回來以後四週、第 2 列看日期不出、第 3 列照出）；旁白＋台詞那兩格；房間外照原本的閒聊
//   4  三件小事：日子、時間、該在的人（正在走進來的等坐下；3-2 柏翰 23:30 以後在上舖也算在）、日本路線不演、只演一次、選項、旗標；群組訊息的時間、不在群組不傳；
//      409 最後一晚＝退宿日 2029-06-28 的前一晚、那一晚柏翰在、「（去關燈）」看 2-4「最後一晚，燈你關」說過沒有；畢業後篇（PG.stops）停在那一晚 23:00
//   5  存檔：舊存檔（沒有 RY24、只有一部分）照常；存讀檔以後說過的不再說、輪到哪一句照舊；JSON 存得下
// 修改前（開發分支 82c3c998e＝這個任務開工那一版：git archive 出來、把這支測試放進去、AA517_GIT_DIR 指到這個 repo 對稿，真的跑過）：FAILED 133、PASS 19、結束碼 1——
//   第 0 項：新檔、index.html、story3d.js 掛勾、對稿（兩個方向、順序、日子與時間）全部 FAIL；第 1～5 項接著因為沒有 DORMY24 丟例外或 FAIL；
//   舊程式剛好也對的 19 項：拿得到稿、作息照舊（312、507、409 的平常日子）、走進房間不說／閒聊照原本的那些「沒有」的對照、409 最後一晚以外的日子不演之類。
// 修改後：ALL PASS（數字見檔尾 H.done 的輸出）
// 用法：node tests/aa517_dorm_y24_unit.js（對稿要 git 拿得到 ced552c17；在別的資料夾跑舊版：AA517_GIT_DIR=<有這個 commit 的 repo>）
require('./alison.js');   /* AA_380：讀稿時 Alison 的舊叫法照匯入工具同一套換成 Alison（稿 2-1 第 4 列）*/
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify;
const load=(f,n)=>{ let s=fs.readFileSync(path.join(H.ROOT,f),'utf8'); s=s.replace(new RegExp('^const '+n+'\\s*=','m'),'globalThis.'+n+'='); vm.runInThisContext(s,{filename:f}); return true; };
let ok=false, err='';
try{ load('src/data/dorm_room_layout.js','DORM_ROOM'); }catch(e){ err+=String(e); }
try{ load('src/data/dorm203_lines.js','DORM203_LINES'); load('src/dorm203_3d.js','DORM203'); }catch(e){ err+=' '+String(e); }   /* 真的遊戲裡 DORM203 也在（203 群組、203 的閒聊不能搶到 312 以後）*/
try{ ok=load('src/data/dorm_y24_lines.js','DORMY24_LINES')&&load('src/dorm_y24_3d.js','DORMY24'); }catch(e){ err+=' '+String(e); }
const X=()=>typeof DORMY24!=='undefined'&&DORMY24.room?DORMY24:null, LL=()=>typeof DORMY24_LINES!=='undefined'?DORMY24_LINES:null;
let DOC='';
try{ DOC=cp.execSync('git show ced552c17:"docs/story_planning/AA_517_宿舍大二到大四_312_507_409房間日常.md"',{cwd:process.env.AA517_GIT_DIR||H.ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']}); }catch(e){ DOC=''; }
const NAME={kai:'阿凱',zhe:'阿哲',classmate_bohan:'柏翰'}, BH='classmate_bohan';
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. （丟例外）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' | ')); } };
/* 假的生人物、坐下、走路（同 tests/aa502_dorm203_unit.js；E.moveTo 先記下來，測試決定走到了沒有）*/
let walks=[], caps=[];
const mkN=(id,x,z,o)=>{ const n={id,charId:id,name:id,obj:{position:{x,y:0,z},rotation:{y:(o&&o.yaw)||0}},pose:'idle',idlePose:'idle',lv:0,talk:o&&o.talk}; GM.npc[id]=n; E.npcs.push(n); if(o&&o.seat) GM.sitAt(n,o.seat); return n; };
GM.spawnNPC=(id,spec,x,z,o)=>GM.npc[id]||mkN(id,x,z,o);
GM.spawnCharacter=(id,x,z,o)=>GM.npc[id]||mkN(id,x,z,o);
GM.removeNPC=id=>{ const n=GM.npc[id]; if(n){ E.npcs.splice(E.npcs.indexOf(n),1); delete GM.npc[id]; } };
GM.sitAt=(n,st)=>{ n.seat=st; n.obj.position.x=st.x; n.obj.position.z=st.z; n.pose='sit'; };
GM.standUp=n=>{ n.seat=null; n.pose='idle'; };
GM.caption=(w,t)=>{ caps.push([w||'',t]); };
GM.say=async(who,t)=>{ H.said.push({who:who?(who.name||String(who)):null,id:who&&who.charId||null,t:String(t).replace('{name}',H.G&&H.G.name||'祐廷')}); };
E.canStand=()=>true; E.moveTo=(n,x,z,cb)=>{ walks.push({n,x,z,cb}); return true; };
STORY._bindGM(GM);
const D=k=>STORY.dayOfKey(k), K=d=>CALENDAR.dateOf(d).key, wdOf=d=>CALENDAR.dateOf(d).wd%7;
const Y2=()=>({ROOM_Y2:D('2026-09-06')}), Y3=()=>Object.assign(Y2(),{ROOM_Y3:D('2027-09-05')}), Y4=()=>Object.assign(Y3(),{ROOM_Y4:D('2028-09-03')});
const BASE={DORM_FOUR:true,introDone:true,MET_KAI:true,MET_ZHE:true};
const room=(k,h,flags,zone)=>{ const G=H.fresh(k,h,zone||'dorm',Object.assign({},BASE,flags||{})); walks=[]; caps=[]; if(X()) X()._walk=null; STORY._sleeping=false; return G; };
const at=(k,h)=>{ const d=D(k); H.G.day=d; H.G.weekday=wdOf(d); H.G.hour=h; };
const who=()=>STORY.dormWho(H.G).map(w=>w[0]).sort();
const EV=id=>STORY_EVENTS.find(e=>e.id===id);
const evCheck=id=>{ const e=EV(id); return !!e&&EVENTS.check(e); };
const txt=()=>H.said.map(s=>s.t);
const runEv=async(id,picks)=>{ H.said=[]; H.picks=(picks||[]).slice(); await EVENTS.run(EV(id)); return txt(); };
const knowAll=()=>{ for(const id of ['kai','zhe',BH]){ H.rel(id,20,10,10); SOCIAL.markUp(id,9); } };   /* 門檻台詞（relUp／playUp）都說過了：測的是房間閒聊 */
const OI=EVENTS.onInteract;
const SEAT={zhe:'L1',classmate_bohan:'R1'};
const talk=async id=>{ H.said=[]; H.picks=['就這樣']; const n=GM.npc[id]||mkN(id,0,0,{seat:STORY.dormSeat(SEAT[id])}); EVENTS.onInteract=()=>false; try{ await STORY.talkCharacter(id,n); } finally { EVENTS.onInteract=OI; }
  return H.said.filter(x=>x.t!=='你明天有空嗎？').map(x=>(x.who?x.who+'：':'')+x.t); };
const enterRoom=()=>{ caps=[]; X().entered(GM,{}); X().tick(GM); return caps.map(c=>c[1]); };   /* 從門口走進房間（S.onEnter → entered）、玩家空下來（S.WAIT_MS 測試設 0）*/
const grp=()=>(H.G.msgs||[]).filter(m=>m.th==='g:r203');
const sweep=(k0,h0,k1,h1,step)=>{ step=step||0.25; const a=D(k0)*24+h0, b=D(k1)*24+h1; for(let t=a;t<=b+1e-9;t+=step){ const d=Math.floor(t/24); H.G.day=d; H.G.weekday=wdOf(d); H.G.hour=+(t-d*24).toFixed(4); PHONE.tick(H.G); } };

(async()=>{
  const L=LL();
  if(X()) X().WAIT_MS=0;
  /* ================= 0 載入、index.html、掛勾、對稿 ================= */
  await sec(0,()=>{ const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8'), sc=f=>html.indexOf('<script src="'+f), a=sc('src/dorm203_3d.js'), b=sc('src/data/dorm_y24_lines.js'), c=sc('src/dorm_y24_3d.js'), d=sc('src/data/bbpack_events.js'), s=sc('src/story3d.js'), p=sc('src/postgrad3d.js');
    check('0. 新檔載得到（DORMY24_LINES、DORMY24）；index.html：dorm203_3d.js → data/dorm_y24_lines.js → dorm_y24_3d.js（兩個新檔相鄰）→ bbpack_events.js，在 story3d.js、postgrad3d.js 以後（PG.stops）',
      ok&&!!X()&&!!L&&a>0&&b>a&&c>b&&d>c&&s>0&&s<b&&p>0&&p<b&&html.slice(b,c).split('<script').length===2&&/dorm_y24_lines\.js\?v=[0-9.]+"/.test(html)&&/dorm_y24_3d\.js\?v=[0-9.]+"/.test(html),err); });
  await sec(0,()=>{ const st=fs.readFileSync(path.join(H.ROOT,'src/story3d.js'),'utf8');
    check('0. story3d.js 的掛勾：S.onEnter 一開始（第一個 await 以前）叫 DORMY24.entered；talkCharacter 在 DORM203.roomTalk 同一行後面問 DORMY24.roomTalk（閒聊階梯之前）；S.dormMates 問 DORMY24.lastNight；S.Y4K',
      /S\.onEnter=async function\(zoneId,GM,opts\)\{ opts=opts\|\|\{\}; const G=GM\.G, F=G\.flags, E=GM\.E; if\(zoneId==='dorm'&&typeof DORMY24!=='undefined'&&DORMY24\.entered\)/.test(st)
      &&/DORM203\.roomTalk\(GM,who,id\)\)\{\}[^\n]*DORMY24\.roomTalk\(GM,who,id\)\)\{\}[^\n]*\n\s*else if\(await S\.ladderTalk/.test(st)
      &&/S\.dormMates=function[^\n]*\n[^\n]*if\(F\.ROOM_Y3\|\|F\.ROOM_Y4\) return \/\^Y\[34\]\/\.test\(t\)\|\|\(typeof DORMY24!=='undefined'&&DORMY24\.lastNight&&DORMY24\.lastNight\(G\)\)\?/.test(st)
      &&/S\.Y4K=Y4K;/.test(st)); });
  await sec(0,()=>{ check('0. 拿得到稿（git show ced552c17）',DOC.length>2000&&DOC.indexOf('## 1. 走進房間的旁白')>0&&DOC.indexOf('## 3. 三件小事')>0,'長度 '+DOC.length);
    if(!L||!DOC){ for(const n of ['0. 遊戲 → 稿','0. 稿 → 遊戲']) check(n,false,!L?'沒有 DORMY24_LINES':'拿不到稿'); return; }
    const bad=[], miss=[], sl=(a,b)=>{ const i=DOC.indexOf(a), j=b?DOC.indexOf(b,i+1):DOC.length; return i<0?'':DOC.slice(i,j<0?DOC.length:j); };
    /* 第 1 節：每一間的句子照順序；「——阿哲在房間才說。」＝zhe */
    const s1=sl('## 1.','## 2.'), W1={}; let cur=null;
    for(const ln of s1.split('\n')){ const r=ln.match(/\*\*(312|507|409)/); if(r){ cur='r'+r[1]; W1[cur]=[]; continue; } const m=ln.match(/^\s+- (（.+?）)(——阿哲在房間才說。)?$/); if(m&&cur) W1[cur].push({t:m[1],zhe:!!m[2]}); }
    for(const rm of ['r312','r507','r409']){ const g=(L.walkIn[rm]||[]).map(x=>({t:x.t,zhe:!!x.zhe})); if(J(g)!==J(W1[rm]||[])) (J(g)>J(W1[rm]||[])?bad:miss).push('走進房間 '+rm+' '+J({遊戲:g.map(x=>x.t),稿:(W1[rm]||[]).map(x=>x.t)})); }
    /* 第 2 節：每一張表（不含「之後」）＝遊戲那一串 rows 照順序；「之後」＝after 兩句。格子：「台詞」、（旁白）「台詞」 */
    const TB=[['### 2-1','### 2-2','r312','zhe'],['### 2-2','### 2-3','r312',BH],['### 2-3','### 2-4','r507',BH],['### 2-4','## 3.','r409',BH]];
    for(const [a,b,rm,id] of TB){ const s=sl(a,b), cells=[], after=[];
      for(const ln of s.split('\n')){ const m=ln.match(/^\| ([^|]+) \| (.+) \|$/); if(!m||m[1].trim()==='解鎖'||/^-+$/.test(m[1].trim())) continue; const c=m[2].trim(); if(m[1].trim()==='之後') after.push(...c.split('／').map(x=>x.trim())); else cells.push(c); }
      const T=(L.room[rm]||{})[id]; if(!T){ bad.push('房間 '+rm+' '+id+' 沒有'); continue; }
      const g=T.rows.map(r=>(r.pre||'')+'「'+r.t+'」'), ga=(T.after||[]).map(x=>x.speaker===null?x.text:'「'+x.text+'」');
      for(let i=0;i<Math.max(g.length,cells.length);i++) if(g[i]!==cells[i]){ if(g[i]!=null&&!cells.includes(g[i])) bad.push('房間 '+rm+' '+id+' '+g[i]); else if(cells[i]!=null&&!g.includes(cells[i])) miss.push('房間 '+rm+' '+id+' '+cells[i]); else bad.push('房間 '+rm+' '+id+' 順序 '+i); }
      if(J(ga)!==J(after)) bad.push('之後 '+rm+' '+id+' '+J({遊戲:ga,稿:after})); }
    /* 第 3 節：三件小事。上層的「> 」＝照順序的旁白與台詞（選項之前）；選項；選項後面的「> 」；群組的「> 」；（去關燈）那一句旁白 */
    const S3=[['### 3-1','### 3-2','sup312'],['### 3-2','### 3-3','zhe507'],['### 3-3','---','last409']];
    for(const [a,b,k] of S3){ const s=sl(a,b), ev=L.ev[k]||[], gr=(L.group&&L.group[k])||[];
      const lineOf=l=>l.speaker===null?l.text:NAME[l.speaker]+'：'+l.text;
      const top=[], quotes=[], opts=[]; let mode='main';
      for(const ln of s.split('\n')){ if(/^- 選項/.test(ln)) mode='opt'; else if(/^- .*群組/.test(ln)) mode='group'; else if(/^- 記 /.test(ln)) mode='end';
        const q=ln.match(/^(\s*)> (.+)$/); if(q){ quotes.push({t:q[2].trim(),mode,top:!q[1].length}); if(!q[1].length&&mode==='main') top.push(q[2].trim()); }
        const o=ln.match(/^\s+- (「[^」]*」|（[^）]*）)(.*)→$/); if(o&&mode==='opt') opts.push({t:o[1],note:o[2]}); }
      const gTop=[]; for(const l of ev){ if(l.choice) break; if(l.text!==undefined) gTop.push(lineOf(l)); }
      if(J(gTop)!==J(top)) bad.push(k+' 開頭順序 '+J({遊戲:gTop,稿:top}));
      const gLines=ev.filter(l=>l.text!==undefined&&!l.lightNod).map(lineOf), gCh=[].concat(...ev.filter(l=>l.choice).map(l=>l.choice.map(c=>c.text)));
      for(const t of gLines) if(!quotes.some(q=>q.mode!=='group'&&q.t===t)) bad.push(k+' '+t);
      for(const c of gCh) if(!opts.some(o=>o.t===c)) bad.push(k+' 選項 '+c);
      for(const m of gr) if(!quotes.some(q=>q.mode==='group'&&q.t===NAME[m.from]+'：'+m.text)) bad.push(k+' 群組 '+m.text);
      for(const q of quotes){ if(q.mode==='group'){ if(!gr.some(m=>NAME[m.from]+'：'+m.text===q.t)) miss.push(k+' 群組 '+q.t); } else if(!gLines.includes(q.t)) miss.push(k+' '+q.t); }
      for(const o of opts){ if(!gCh.includes(o.t)) miss.push(k+' 選項 '+o.t); const nod=o.note.match(/旁白多一句：「(（[^）]*）)」/); if(nod&&!ev.some(l=>l.lightNod&&l.text===nod[1]&&l.speaker===null)) miss.push(k+' 選項後的旁白 '+nod[1]); }
      for(const l of ev) if(l.lightNod&&!opts.some(o=>o.note.indexOf('「'+l.text+'」')>=0)) bad.push(k+' 旁白 '+l.text);
      if(!quotes.some(q=>q.mode==='group')!==!gr.length) bad.push(k+' 群組有沒有'); }
    check('0. 遊戲 → 稿：每一句（走進房間、房間的話與「之後」、三件小事的旁白／台詞／選項、群組）都在稿裡、一字不差、說話的人對、順序對（旁白照稿的（）、對話框寫說話的人時拿掉外層「」）',!bad.length,J(bad.slice(0,5)));
    check('0. 稿 → 遊戲：稿第 1～3 節的每一句、每個選項、（去關燈）多的那一句旁白遊戲裡都有',!miss.length,J(miss.slice(0,5))); });
  await sec(0,()=>{ const x=X(); if(!x||!DOC){ check('0. 三件小事的日子、時間、群組的時間照稿',false,'沒有 DORMY24 或稿'); return; }
    const e1=x.ev('sup312'), e2=x.ev('zhe507'), e3=x.ev('last409'), dk=e=>e.days(H.G).map(d=>d==null?null:K(d));
    room('2026-11-19',20,Y2());
    const out=STORY.Y4K&&STORY.Y4K.out;
    check('0. 3-1 大二上第 11 週週四 11/19 23:00～23:30；3-2 大三下第 15 週週二 5/30 23:30～24:00；3-3 退宿日（story3d.js Y4K.out＝2029-06-28）前一晚 23:00～23:30（稿的標題）',
      J(dk(e1))===J(['2026-11-19'])&&J(e1.t)===J([23,23.5])&&J(dk(e2))===J(['2028-05-30'])&&J(e2.t)===J([23.5,24])&&out==='2029-06-28'&&J(dk(e3))===J(['2029-06-27'])&&J(e3.t)===J([23,23.5])
      &&DOC.indexOf('### 3-1. 312：四份滷味（大二上第 11 週週四 11/19 23:00～23:30）')>0&&DOC.indexOf('### 3-2. 507：阿哲上來借筆記（大三下第 15 週週二 5/30 23:30～24:00；日本路線不演）')>0&&DOC.indexOf('搬離 409 前一晚 23:00～23:30')>0,
      J({e1:dk(e1),e2:dk(e2),e3:dk(e3),out}));
    const T=CALENDAR.termOf(D('2026-11-19')), T2=CALENDAR.termOf(D('2028-05-30'));
    check('0. 日曆對得上：2026-11-19＝大二上第 11 週週四、2028-05-30＝大三下第 15 週週二',T&&T.id==='Y2S1'&&T.week===11&&CALENDAR.dateOf(D('2026-11-19')).wd===4&&T2&&T2.id==='Y3S2'&&T2.week===15&&CALENDAR.dateOf(D('2028-05-30')).wd===2,J([T,T2]));
    const gt=k=>(L.group[k]||[]).map(m=>m.at);
    check('0. 群組的時間照稿：3-2 之後 23:50、3-3 23:40',DOC.indexOf('之後 23:50「203（舊生）」群組')>0&&DOC.indexOf('23:40「203（舊生）」群組')>0&&gt('zhe507').every(a=>Math.abs(a-(23+50/60))<1e-9)&&gt('last409').every(a=>Math.abs(a-(23+40/60))<1e-9)&&gt('zhe507').length===2&&gt('last409').length===3); });

  /* ================= 1 住哪一間、作息 ================= */
  await sec(1,()=>{ const x=X(), R=(k,f)=>{ room(k,22,f); return x.room(H.G); };
    check('1. 312（ROOM_Y2）、507（ROOM_Y3）、409（ROOM_Y4）；大一 203＝沒有',R('2026-10-07',Y2())==='r312'&&R('2027-10-06',Y3())==='r507'&&R('2028-10-04',Y4())==='r409'&&R('2025-10-08',{})===null);
    check('1. 搬出宿舍（MOVED_OUT，1A-15）、經濟系＝沒有',R('2029-06-29',Object.assign(Y4(),{MOVED_OUT:D('2029-06-28')}))===null&&(()=>{ room('2026-10-07',22,Y2()); H.G.stage='econ'; return x.room(H.G)===null; })());
    check('1. 日本路線 2/20 退宿以後（還沒搬進 409）＝沒有；搬進 409 以後＝409；美國路線 7/25 退宿到 12/23 返台＝沒有、返台以後 409',
      R('2028-03-01',Object.assign(Y3(),{EXCHANGE_ROUTE:'JP',X1_JP:D('2028-02-20')}))===null&&R('2028-02-15',Object.assign(Y3(),{EXCHANGE_ROUTE:'JP'}))==='r507'&&R('2028-09-20',Object.assign(Y4(),{EXCHANGE_ROUTE:'JP',X1_JP:D('2028-02-20')}))==='r409'
      &&R('2028-05-30',Object.assign(Y3(),{EXCHANGE_ROUTE:'US'}))==='r507'&&R('2028-08-10',Object.assign(Y3(),{EXCHANGE_ROUTE:'US'}))===null&&R('2028-12-24',Object.assign(Y4(),{EXCHANGE_ROUTE:'US',ROOM_Y4:D('2028-12-23')}))==='r409');
    const w=(k,h,f)=>{ room(k,h,f); return J(who()); };
    check('1. 作息照舊（S.dormMates）：312 平日 22:15 阿哲、22:45 阿哲＋柏翰、23:40 都在上舖；507、409 柏翰 22:45；寒暑假沒有人',
      w('2026-10-07',22.25,Y2())===J(['zhe'])&&w('2026-10-07',22.75,Y2())===J([BH,'zhe'])&&w('2026-10-07',23.67,Y2())===J([])&&w('2027-10-06',22.75,Y3())===J([BH])&&w('2029-03-07',22.75,Y4())===J([BH])&&w('2027-07-15',22.75,Y2())===J([])&&w('2028-07-15',22.75,Y3())===J([]));
    check('1. 409 最後一晚（2029-06-27，已經放暑假）22:45 柏翰在、22:15 還沒回來、23:40 上床了；前一晚、6/28 沒有（S.dormMates 只多這一晚）',
      w('2029-06-27',22.75,Y4())===J([BH])&&w('2029-06-27',22.25,Y4())===J([])&&w('2029-06-27',23.67,Y4())===J([])&&w('2029-06-26',22.75,Y4())===J([])&&w('2029-06-28',22.75,Y4())===J([])&&w('2029-06-27',22.75,Object.assign(Y4(),{MOVED_OUT:D('2029-06-27')}))===J([]));
    check('1. 大一 203 的作息不受影響（DORM_FOUR、2025-10-08 22:45 三個人）',w('2025-10-08',22.75,{})===J([BH,'kai','zhe'])); });

  /* ================= 2 走進房間的旁白 ================= */
  await sec(2,async()=>{ const x=X(), A=L.walkIn;
    room('2026-09-08',21,Y2()); const a1=enterRoom(), a2=enterRoom();
    check('2. 312 大二上第 1 週 21:00 從門口走進房間：學弟的第一句；再走進來一次：第二句（照順序輪流）',J(a1)===J([A.r312[0].t])&&J(a2)===J([A.r312[1].t]),J([a1,a2]));
    const a3=enterRoom(); check('2. 21:00 阿哲還沒回來：「學弟在問阿哲」那一句不說；今天另外兩句都說過了＝不說（同一天不重複）',a3.length===0,J(a3));
    H.G.hour=22.25; const a4=enterRoom(); check('2. 22:15 阿哲在房間：「（學弟在問阿哲浴室哪一間水比較熱。）」',J(a4)===J([A.r312[2].t]),J(a4));
    H.G.hour=22.5; const a5=enterRoom(); check('2. 同一天三句都說過了：再走進來不說',a5.length===0,J(a5));
    at('2026-09-09',15); const b1=enterRoom(); at('2026-09-09',15.5); const b2=enterRoom(); at('2026-09-09',16); const b3=enterRoom();
    check('2. 隔天照順序接下去（第一句、第二句）；阿哲不在的時候輪到第三句＝換下一句，今天說過的不再說',J(b1)===J([A.r312[0].t])&&J(b2)===J([A.r312[1].t])&&b3.length===0,J([b1,b2,b3]));
    at('2026-09-10',22.25); const b4=enterRoom(); check('2. 輪到第三句、阿哲在：第三句',J(b4)===J([A.r312[2].t]),J(b4));
    room('2027-10-06',20,Y3()); const c1=enterRoom(), c2=enterRoom(), c3=enterRoom(); at('2027-10-07',20); const c4=enterRoom();
    check('2. 507：大二的學弟、別系的同學兩個人輪流；同一天第三次不說；隔天輪回第一個',J(c1)===J([A.r507[0].t])&&J(c2)===J([A.r507[1].t])&&c3.length===0&&J(c4)===J([A.r507[0].t]),J([c1,c2,c3,c4]));
    room('2028-10-04',20,Y4()); const d1=enterRoom(), d2=enterRoom();
    check('2. 409：大一的學弟、大二的學弟兩個人輪流',J(d1)===J([A.r409[0].t])&&J(d2)===J([A.r409[1].t]),J([d1,d2]));
    room('2026-10-07',21,Y2()); STORY._sleeping=true; const e1=x.entered(GM,{}); STORY._sleeping=false; x.tick(GM);
    check('2. 睡覺醒來（sleepNow 換房間那一次，STORY._sleeping）：不說',!e1&&caps.length===0);
    room('2026-10-07',21,Y2()); const e2=x.entered(GM,{fromLoad:true}); x.tick(GM); check('2. 讀檔：不說',!e2&&caps.length===0);
    room('2026-10-07',21,Object.assign(Y2(),{ROOM_Y3_MOVING:true})); const e3=x.entered(GM,{}); x.tick(GM); check('2. 搬進新房間那一場（ROOM_Y*_MOVING）：不說',!e3&&caps.length===0);
    room('2026-10-07',21,Y2()); E.player.busy=true; const e4=x.entered(GM,{}); E.player.busy=false; x.tick(GM); check('2. 劇情帶進房間（演出中，player.busy）：不說',!e4&&caps.length===0);
    room('2026-10-07',21,Y2()); x.tick(GM); H.G.hour=23; x.tick(GM); check('2. 待在房間裡跳時間（沒有走進來）：不說',caps.length===0);
    room('2026-10-07',21,Y2()); x.entered(GM,{}); H.G.hour=21.3; x.tick(GM); check('2. 走進來以後過了 15 分鐘（遊戲時間）才空下來：不說了',caps.length===0&&x._walk===null);
    room('2026-10-07',21,Y2()); x.entered(GM,{}); H.G.events.count++; x.tick(GM); check('2. 走進來以後先演了一件事件：不說了',caps.length===0);
    room('2026-10-07',21,Y2()); x.entered(GM,{}); H.G.zone='dorm_hall'; x.tick(GM); check('2. 走出房間：不說了',caps.length===0);
    room('2026-10-07',21,Y2()); x.entered(GM,{}); E.player.busy=true; x.tick(GM); const e5=caps.length; E.player.busy=false; x.tick(GM); check('2. 走進來的時候在對話：等空下來才說（還在 15 分鐘內）',e5===0&&caps.length===1,J(caps));
    room('2026-10-07',21,Y2()); x.WAIT_MS=60000; x.entered(GM,{}); x.tick(GM); const e6=caps.length; x.WAIT_MS=0; x.tick(GM); check('2. 走進來、淡入以後等一下（S.WAIT_MS）才說',e6===0&&caps.length===1);
    const n0=s=>{ room(s[0],s[1],s[2]); return enterRoom().length; };
    check('2. 寒假（2027-01-20，還住 312）、暑假（2027-07-15）：背景室友回家了，不說',n0(['2027-01-20',20,Y2()])===0&&n0(['2027-07-15',20,Y2()])===0);
    check('2. 23:40（他們在上舖）、06:30 不說；07:30 說',n0(['2026-10-07',23.67,Y2()])===0&&n0(['2026-10-07',6.5,Y2()])===0&&n0(['2026-10-07',7.5,Y2()])===1);
    check('2. 大一 203（AA_502 照舊，這一套不說）；409 最後一晚（暑假）不說（學弟們先走了）',n0(['2025-10-08',21,{}])===0&&n0(['2029-06-27',22,Y4()])===0);
    room('2026-10-07',21,Y2()); { const OE=EVENTS.onEnter, OA=INV.arrive; EVENTS.onEnter=()=>false; INV.arrive=async()=>false; try{ const p=STORY.onEnter('dorm',GM,{}); const m=!!x._walk; await p; const p2=STORY.onEnter('dorm',GM,{fromLoad:true}); const m2=!!x._walk; await p2; const p3=STORY.onEnter('dorm_hall',GM,{}); const m3=!!x._walk; await p3;
      check('2. 接線：STORY.onEnter(dorm) 記下「走進來」；讀檔（fromLoad）、別的區域不記',m&&!m2&&!m3,J([m,m2,m3])); } finally { EVENTS.onEnter=OE; INV.arrive=OA; } }
    check('2. STORY.TICKS 有這一套（每一輪問 DORMY24.tick）',STORY.TICKS.some(f=>/DORMY24\.tick/.test(String(f)))); });

  /* ================= 3 房間閒聊 ================= */
  await sec(3,async()=>{ const R=L.room, Z=R.r312.zhe, B=R.r312[BH], C=R.r507[BH], Q=R.r409[BH], ZN='阿哲：', BN=()=>SOCIAL.displayName(BH)+'：';
    const isAfter=(x,T)=>x.length===1&&(x[0]===T.after[0].text||x[0].endsWith('：'+T.after[1].text));
    const said=(rm,id)=>((X().rec(H.G)||{talk:{}}).talk[rm+':'+id]||[]);
    const days=async(id,list)=>{ const o=[]; for(const k of list){ at(k[0],k[1]); o.push(await talk(id)); } return o; };
    room('2026-09-08',22.6,Y2()); knowAll(); const a1=await talk('zhe'), a2=await talk('zhe');
    check('3. 312 大二上第 1 週跟阿哲講話：第一句「學弟問我浴室……我現在是學長了欸。」；同一天再講＝「之後」那兩句',J(a1)===J([ZN+Z.rows[0].t])&&isAfter(a2,Z),J([a1,a2]));
    const a3=await talk('zhe'); check('3. 「之後」兩句輪流（旁白、「欸，宵夜？……好啦，明天。」）',isAfter(a3,Z)&&a3[0]!==a2[0],J([a2,a3]));
    const [a4,a5]=await days('zhe',[['2026-09-09',22.6],['2026-09-10',22.6]]);
    check('3. 一天一句新的：「這間窗戶看得到樹……」；沒有沛珊分開、還沒 12/19＝隔天沒有新的（之後那兩句）',J(a4)===J([ZN+Z.rows[1].t])&&isAfter(a5,Z),J([a4,a5]));
    H.G.events.done.ev_peishan_split=1; at('2026-10-14',22.6); const a6=await talk('zhe');
    check('3. ev_peishan_split 演過、沒有和沛珊交往：「柏翰這禮拜都很早上床。……你有發現嗎？」',J(a6)===J([ZN+Z.rows[2].t]),J(a6));
    const [a7,a8]=await days('zhe',[['2026-12-18',23.2],['2026-12-19',23.2]]); check('3. 12/18 沒有、12/19 起「我最近比較晚回來。……送 Alison 去捷運站。」（AA_380 改名）',isAfter(a7,Z)&&J(a8)===J([ZN+Z.rows[3].t]),J([a7,a8]));
    const [a9,a10,a11]=await days('zhe',[['2027-02-23',22.6],['2027-02-24',22.6],['2027-04-27',22.6]]);
    check('3. 大二下：「學弟期中考前問我民總怎麼讀。我說問柏翰。」；「期末前」那句第 1 週還沒有、第 10 週（4/27）說',J(a9)===J([ZN+Z.rows[4].t])&&isAfter(a10,Z)&&J(a11)===J([ZN+Z.rows[5].t]),J([a9,a10,a11]));
    check('3. 每句一次、照順序（z1～z6 各一次）',J(said('r312','zhe'))===J(['z1','z2','z3','z4','z5','z6']),J(said('r312','zhe')));
    room('2026-10-14',22.6,Object.assign(Y2(),{dating_classmate_peishan:true})); knowAll(); H.G.events.done.ev_peishan_split=1; await days('zhe',[['2026-10-14',22.6],['2026-10-15',22.6],['2026-10-16',22.6]]);
    check('3. 和沛珊交往中的玩家：沒有「柏翰這禮拜都很早上床」',!said('r312','zhe').includes('z3')&&said('r312','zhe').includes('z2'),J(said('r312','zhe')));
    room('2026-10-14',22.6,Y2()); knowAll(); H.G.events.done.ev_peishan_bohan_split=1; await days('zhe',[['2026-10-14',22.6],['2026-10-15',22.6]]);
    check('3. 舊存檔演的是合併前的 ev_peishan_bohan_split（msg3d.js 同）：也算分開',said('r312','zhe').includes('z3'),J(said('r312','zhe')));
    room('2026-10-14',22.6,Y2()); knowAll(); await days('zhe',[['2026-10-14',22.6],['2026-10-15',22.6]]);
    check('3. 沒有演過分開（只在群組看到、或沒有）：沒有那一句（稿「ev_peishan_split 演過」）',!said('r312','zhe').includes('z3'),J(said('r312','zhe')));
    room('2026-09-08',22.6,Y2()); knowAll(); H.G.events.done.ev_peishan_split=1; const b=await days(BH,[['2026-09-08',22.6],['2026-09-09',22.6],['2026-09-10',22.6],['2027-02-23',22.6],['2027-04-27',22.6],['2027-04-28',22.6]]);
    check('3. 312 柏翰：鬧鐘、檯燈、（分開以後）旁白＋「……沒事。在念書。」、大二下「阿哲最近十一點才回來」、期末前「推甄的事」、之後',
      J(b[0])===J([BN()+B.rows[0].t])&&J(b[1])===J([BN()+B.rows[1].t])&&J(b[2])===J([B.rows[2].pre,BN()+B.rows[2].t])&&J(b[3])===J([BN()+B.rows[3].t])&&J(b[4])===J([BN()+B.rows[4].t])&&isAfter(b[5],B),J(b));
    room('2026-10-05',22.6,Y2()); knowAll(); const f1=await talk('zhe'); check('3. 第一次在 312 講話已經是第 5 週（10/5）：第 1～4 週那句過了不補（從「這間窗戶」開始）',J(f1)===J([ZN+Z.rows[1].t]),J(f1));
    room('2026-10-04',22.6,Y2()); knowAll(); const f2=await talk('zhe'); check('3. 第 4 週最後一天（10/4）還有「學弟問我浴室……」',J(f2)===J([ZN+Z.rows[0].t]),J(f2));
    room('2027-10-06',22.6,Y3()); knowAll(); const c=await days(BH,[['2027-10-06',22.6],['2027-10-07',22.6],['2027-10-08',22.6]]);
    check('3. 507 柏翰：大三上第 5 週第一次講＝「阿哲每天晚上上來借東西……」（第 1～4 週那句過了）；感冒那晚沒演＝沒有那一句',J(c[0])===J([BN()+C.rows[1].t])&&isAfter(c[1],C)&&isAfter(c[2],C),J(c));
    room('2027-09-07',22.6,Y3()); knowAll(); const c1=await talk(BH); H.G.events.done.ev_cold_week_night=1; H.G.flags.COLD_WEEK_NIGHT=D('2027-10-24'); const c2=await days(BH,[['2027-09-08',22.6],['2027-10-25',22.6],['2028-02-22',22.6],['2028-04-25',22.6],['2028-04-26',22.6]]);
    check('3. 507：第 1 週「五樓。我第一天數了樓梯……」→「阿哲每天晚上」→ 感冒那晚演過「你感冒那晚，是我傳訊息給阿凱的……」→ 大三下「推甄要的書單」→ 期末前「冷氣我調二十五。……這次不用投票。」',
      J(c1)===J([BN()+C.rows[0].t])&&J(c2[0])===J([BN()+C.rows[1].t])&&J(c2[1])===J([BN()+C.rows[2].t])&&J(c2[2])===J([BN()+C.rows[3].t])&&J(c2[3])===J([BN()+C.rows[4].t])&&isAfter(c2[4],C),J([c1,c2]));
    room('2028-02-15',22.6,Object.assign(Y3(),{EXCHANGE_ROUTE:'JP'})); knowAll(); { const x=X(); check('3. 日本路線：大三下那兩句不出（稿：2/20 退宿，不出）',!x.rowOpen(Object.assign({},H.G,{day:D('2028-02-22')}),C.rows[3])&&!x.rowOpen(Object.assign({},H.G,{day:D('2028-04-25')}),C.rows[4])&&x.rowOpen(Object.assign({},H.G,{flags:Object.assign({},H.G.flags,{EXCHANGE_ROUTE:'US'}),day:D('2028-02-22')}),C.rows[3])); }
    room('2028-09-05',22.6,Y4()); knowAll(); const q=await days(BH,[['2028-09-05',22.6],['2028-09-06',22.6],['2028-09-07',22.6],['2028-11-21',22.6],['2029-02-20',22.6],['2029-05-22',22.6],['2029-05-23',22.6]]);
    check('3. 409（臺灣路線）：第 1 週「最後一次搬……」→「我會讀到一點左右……」→ 之後 → 第 12 週旁白＋「……用不到了。給學弟。」→ 大四下「四間房間」→ 期末前「最後一晚，燈你關」',
      J(q[0])===J([BN()+Q.rows[0].t])&&J(q[1])===J([BN()+Q.rows[1].t])&&isAfter(q[2],Q)&&J(q[3])===J([Q.rows[2].pre,BN()+Q.rows[2].t])&&J(q[4])===J([BN()+Q.rows[3].t])&&J(q[5])===J([BN()+Q.rows[4].t])&&isAfter(q[6],Q),J(q));
    { const x=X(), G0=H.G, o=(k,r)=>x.rowOpen(Object.assign({},G0,{day:D(k)}),r);
      check('3. 「期末前」：大二下第 10～15 週（第 16 週期末考、第 9 週都不算）；大四下 15 週＝第 10～14 週（第 15 週是期末考週）',o('2027-04-26',Z.rows[5])&&o('2027-06-06',Z.rows[5])&&!o('2027-06-07',Z.rows[5])&&!o('2027-04-25',Z.rows[5])&&o('2029-04-23',Q.rows[4])&&o('2029-05-27',Q.rows[4])&&!o('2029-05-28',Q.rows[4])&&!o('2029-04-22',Q.rows[4]));
      check('3. 409 第 2 列「第 1～12 週」第 12 週還在、第 13 週沒有；第 3 列「第 12 週以後」第 11 週沒有、第 12 週起有（大四下也算）',o('2028-11-26',Q.rows[1])&&!o('2028-11-27',Q.rows[1])&&!o('2028-11-19',Q.rows[2])&&o('2028-11-20',Q.rows[2])&&o('2029-03-01',Q.rows[2])); }
    room('2028-12-23',22.6,Object.assign(Y4(),{EXCHANGE_ROUTE:'US',ROOM_Y4:D('2028-12-23')})); knowAll(); const u=await days(BH,[['2028-12-23',22.6],['2028-12-24',22.6]]);
    { const x=X(), G0=H.G, o=(k,r)=>x.rowOpen(Object.assign({},G0,{day:D(k)}),r);
      check('3. 美國路線：12/23 返台當晚「最後一次搬……」（第 1 列照回來以後的日子算）、隔天第 3 列（看日期，放榜以後）；第 2 列「放榜以前」不出',J(u[0])===J([BN()+Q.rows[0].t])&&J(u[1])===J([Q.rows[2].pre,BN()+Q.rows[2].t])&&!X().rec(H.G).talk['r409:'+BH].includes('d2'),J(u));
      check('3. 美國路線第 1 列：返台起四週（12/23～1/19）、之後沒有；返台以前（在美國）沒有；臺灣路線第 1 列只在大四上第 1～4 週',o('2029-01-19',Q.rows[0])&&!o('2029-01-20',Q.rows[0])&&!o('2028-12-22',Q.rows[0])&&!o('2029-02-20',Q.rows[1])
        &&!X().rowOpen(Object.assign({},G0,{day:D('2028-12-23'),flags:Object.assign({},G0.flags,{EXCHANGE_ROUTE:'TW'})}),Q.rows[0])&&X().rowOpen(Object.assign({},G0,{day:D('2028-09-26'),flags:Object.assign({},G0.flags,{EXCHANGE_ROUTE:'TW'})}),Q.rows[0])); }
    room('2026-09-08',22.6,Y2(),'campus'); knowAll(); const o1=await talk('zhe'); check('3. 房間外（校園）照原本的閒聊（不是房間的話）',o1.length>0&&!o1.some(t=>Z.rows.some(r=>t.endsWith(r.t)))&&!isAfter(o1,Z),J(o1));
    room('2026-09-06',22.6,Y2()); knowAll(); const o2=await talk('zhe'); check('3. 9/6 剛搬進 312（還沒開學）：這一間還沒有能說的＝照原本的閒聊',o2.length>0&&!o2.some(t=>Z.rows.some(r=>t.endsWith(r.t)))&&!isAfter(o2,Z),J(o2));
    room('2027-10-06',22.6,Y3()); knowAll(); const o3=await talk('zhe'); check('3. 507 跟阿哲講話（他不是這一間的室友）：照原本的閒聊',o3.length>0&&!o3.some(t=>Z.rows.some(r=>t.endsWith(r.t)))&&!isAfter(o3,Z),J(o3));
    room('2025-10-08',22.6,{}); knowAll(); const o4=await talk('zhe'); check('3. 大一 203：AA_502 照舊（203 的第一句；這一套不搶）',o4.length===1&&o4[0]==='阿哲：'+DORM203_LINES.room.zhe.rows[1].t&&!X().rec(H.G),J(o4)); });

  /* ================= 4 三件小事 ================= */
  await sec(4,async()=>{ const x=X(); let t;
    room('2026-11-19',22.9,Y2()); knowAll(); check('4. 3-1 四份滷味：11/19 22:54 還不演',!evCheck('ev_r312_supper'));
    H.G.hour=23.1; check('4. 23:06 阿哲、柏翰照作息都在、祐廷在 312：演',evCheck('ev_r312_supper'));
    H.G.zone='campus'; check('4. 祐廷不在房間：不演',!evCheck('ev_r312_supper')); H.G.zone='dorm';
    STORY.dormSpawn(GM,'zhe','L1',true,'door'); check('4. 阿哲正在走進來：等他坐下才演',!evCheck('ev_r312_supper')); { const w=walks.find(q=>q.n===GM.npc.zhe); if(w){ walks.splice(walks.indexOf(w),1); w.cb(); } } check('4. 坐下了：演',evCheck('ev_r312_supper'));
    at('2026-11-12',23.1); check('4. 第 10 週週四 11/12（「哲 2」那天）不演',!evCheck('ev_r312_supper'));
    at('2026-11-19',23.6); check('4. 23:36（上床了、過了時間）不演',!evCheck('ev_r312_supper'));
    { const aw=STORY.awayOnDate; STORY.awayOnDate=(id,G)=>id===BH?true:aw(id,G); try{ at('2026-11-19',23.1); check('4. 柏翰那天不在：不演',!evCheck('ev_r312_supper')); } finally { STORY.awayOnDate=aw; } }
    room('2026-11-19',23.1,Y3()); knowAll(); check('4. 已經搬到 507（不是 312）：不演',!evCheck('ev_r312_supper'));
    room('2026-11-19',23.1,Y2()); knowAll(); t=await runEv('ev_r312_supper',['豆干']);
    check('4. 3-1 選「（把自己那份的豆干分給學弟）」：學弟又說了一次謝謝；R312_SUPPER',H.G.flags.R312_SUPPER===true&&t.includes('（學弟又說了一次謝謝。這次比較小聲。）')&&!t.includes('那就不要跟他講。')&&t[0]==='（阿哲提著一袋滷味進門。他把袋子打開，分成四份。）'&&H.said[1].id==='zhe'&&H.said[3].id===BH,J(t));
    check('4. 演過一次就不再演；記下演的那一天',!evCheck('ev_r312_supper')&&x.rec(H.G).ev.sup312===D('2026-11-19')&&!!H.G.events.done.ev_r312_supper);
    room('2026-11-19',23.1,Y2()); knowAll(); t=await runEv('ev_r312_supper',['阿凱知道']); check('4. 選「阿凱知道會說不算。」：阿哲「（笑出來）那就不要跟他講。」',t.includes('（笑出來）那就不要跟他講。')&&H.G.flags.R312_SUPPER===true);
    room('2026-11-19',23.1,Y2()); knowAll(); t=await runEv('ev_r312_supper',['（吃）']); check('4. 選（吃）：「（四個人坐在地上吃。學弟坐得最直。）」',t.includes('（四個人坐在地上吃。學弟坐得最直。）')&&H.G.flags.R312_SUPPER===true);
    /* 3-2 */
    room('2028-05-30',23.6,Y3()); knowAll(); check('4. 3-2 阿哲上來借筆記：大三下第 15 週週二 5/30 23:36（柏翰今晚回來了、現在在上舖）：演',evCheck('ev_r507_zhe'),J(who()));
    H.G.hour=23.2; check('4. 23:12（還沒到 23:30）不演',!evCheck('ev_r507_zhe'));
    at('2028-05-23',23.6); check('4. 第 14 週週二不演',!evCheck('ev_r507_zhe'));
    at('2028-05-30',24.1); check('4. 過了午夜（24:06）不演',!evCheck('ev_r507_zhe'));
    { const aw=STORY.awayOnDate; STORY.awayOnDate=(id,G)=>id===BH?true:aw(id,G); try{ at('2028-05-30',23.6); check('4. 柏翰那天不在：不演',!evCheck('ev_r507_zhe')); } finally { STORY.awayOnDate=aw; } }
    room('2028-05-30',23.6,Object.assign(Y3(),{EXCHANGE_ROUTE:'JP'})); knowAll(); { const e=x.ev('zhe507'), G2=H.G; check('4. 日本路線：不演（2/20 退宿＝沒有房間；就算還在 507 也不演）',!evCheck('ev_r507_zhe')&&!x.evDue(G2,GM,e)&&!(()=>{ const sv=STORY.movedOut; STORY.movedOut=()=>false; try{ return x.evDue(G2,GM,e); } finally { STORY.movedOut=sv; } })()); }
    room('2028-05-30',23.6,Object.assign(Y3(),{EXCHANGE_ROUTE:'US'})); knowAll(); check('4. 美國路線（大三下還在 507）：演',evCheck('ev_r507_zhe'));
    room('2028-05-30',23.6,Y3()); knowAll(); PHONE.join(H.G,'r203','203（舊生）'); t=await runEv('ev_r507_zhe');
    check('4. 3-2：阿哲敲門、借債總、「欸，這樣好像 203。」柏翰「少一個。」；R507_ZHE',H.G.flags.R507_ZHE===true&&t[0]==='（有人敲門。是阿哲，手上拿著一本空白的筆記本。）'&&t.includes('少一個。')&&H.said.find(s=>s.t==='少一個。').id===BH&&t[t.length-1]==='阿凱在別棟啦。……我傳一張給他。',J(t));
    sweep('2028-05-30',23.6,'2028-05-30',23.75,0.05); const g0=grp().length; sweep('2028-05-30',23.8,'2028-05-30',24,0.05); const g1=grp().filter(m=>K(m.day)==='2028-05-30').map(m=>[m.from,m.text,+m.h.toFixed(2)]);
    check('4. 3-2 之後 23:50「203（舊生）」群組：阿哲「（照片：507 的地板，三雙拖鞋）」、阿凱「所以少我一雙」（23:45 還沒有）；tag rt_ 開頭、不用回',g0===0&&J(g1.map(m=>[m[0],m[1]]))===J([['zhe','（照片：507 的地板，三雙拖鞋）'],['kai','所以少我一雙']])&&g1.every(m=>Math.abs(m[2]-23.83)<0.03)&&grp().every(m=>/^rt_r203_y24_/.test(m.tag||'')&&!m.ask),J(g1));
    room('2028-05-30',23.6,Y3()); knowAll(); await runEv('ev_r507_zhe'); sweep('2028-05-30',23.6,'2028-05-31',1,0.1);
    check('4. 不在 203 群組（沒有 203 四人房的舊存檔）：不傳',grp().length===0&&x.rec(H.G).g.zhe507==='nogroup');
    room('2028-05-30',22,Y3(),'campus'); knowAll(); PHONE.join(H.G,'r203','203（舊生）'); sweep('2028-05-30',22,'2028-05-31',2,0.1);
    check('4. 那一晚不在房間：沒有演、沒有群組、沒有旗標（稿沒寫補的做法）',!H.G.events.done.ev_r507_zhe&&grp().length===0&&!H.G.flags.R507_ZHE);
    /* 3-3 */
    room('2029-06-27',22.9,Y4()); knowAll(); check('4. 3-3 最後一晚：2029-06-27（退宿日 6/28 的前一晚）22:54 還不演',!evCheck('ev_r409_last'));
    H.G.hour=23.1; check('4. 23:06 柏翰在（這一晚的例外）、祐廷在 409：演',evCheck('ev_r409_last'),J(who()));
    at('2029-06-26',23.1); check('4. 前一晚（6/26）不演',!evCheck('ev_r409_last')); at('2029-06-03',23.1); check('4. 大四下最後一天 6/3（還沒退宿）不演',!evCheck('ev_r409_last'));
    room('2029-06-27',23.1,Object.assign(Y4(),{MOVED_OUT:D('2029-06-27')})); knowAll(); check('4. 已經搬走（MOVED_OUT）：不演',!evCheck('ev_r409_last'));
    room('2029-06-27',23.1,Y4()); knowAll(); PHONE.join(H.G,'r203','203（舊生）'); t=await runEv('ev_r409_last',['去關燈']);
    check('4. 3-3 選「（去關燈）」（2-4 那一句沒說過）：沒有「（柏翰點了一下頭。）」、「（燈關了。……三個人都沒說話。）」；R409_LAST',H.G.flags.R409_LAST===true&&!t.includes('（柏翰點了一下頭。）')&&t.includes('（燈關了。窗外的路燈照進來一點。三個人都沒說話。）')&&t[0]==='（紙箱都封好了。學弟們先走了，房間只剩兩張床有東西。）'&&H.said.find(s=>s.t==='……二十三點了。').id===BH,J(t));
    sweep('2029-06-27',23.1,'2029-06-27',23.6,0.05); const h0=grp().length; sweep('2029-06-27',23.65,'2029-06-27',23.8,0.05); const g3=grp().filter(m=>K(m.day)==='2029-06-27').map(m=>[m.from,m.text,+m.h.toFixed(2)]);
    check('4. 3-3 23:40「203（舊生）」群組：阿哲「最後一晚」、阿凱「所以我又不在」「（照片：別棟的房間，紙箱也封好了）」（23:36 還沒有）',h0===0&&J(g3.map(m=>[m[0],m[1]]))===J([['zhe','最後一晚'],['kai','所以我又不在'],['kai','（照片：別棟的房間，紙箱也封好了）']])&&g3.every(m=>Math.abs(m[2]-23.67)<0.03),J(g3));
    room('2029-05-22',22.6,Y4()); knowAll(); const r5=X().rec(H.G,true); r5.talk['r409:'+BH]=['d1','d2','d3','d4']; await talk(BH); at('2029-06-27',23.1); t=await runEv('ev_r409_last',['去關燈']); const iN=t.indexOf('（柏翰點了一下頭。）'), iL=t.indexOf('（燈關了。窗外的路燈照進來一點。三個人都沒說話。）');
    check('4. 2-4「最後一晚，燈你關。……之前都是我。」說過的：選「（去關燈）」多一句「（柏翰點了一下頭。）」（在燈關了之前）',X().said(H.G,'r409',BH,'d5')&&iN>0&&iL===iN+1,J(t.slice(-3)));
    room('2029-06-27',23.1,Y4()); knowAll(); t=await runEv('ev_r409_last',['再聊一下']); check('4. 選「再聊一下。」：柏翰「好。……十分鐘。」、「（聊了半個小時。最後是柏翰去關的燈。）」',t.includes('好。……十分鐘。')&&t[t.length-1]==='（聊了半個小時。最後是柏翰去關的燈。）'&&H.G.flags.R409_LAST===true);
    { room('2029-06-20',22,Y4()); const s=x.pgStop(H.G), want=D('2029-06-27')*24+23; H.G.zone='campus'; const s2=x.pgStop(H.G); H.G.zone='dorm'; x.rec(H.G,true).ev.last409=D('2029-06-27'); const s3=x.pgStop(H.G);
      check('4. 畢業後篇的「跳到下一件事」：人在 409、最後一晚還沒演＝停在 6/27 23:00；不在房間、演過了＝不停；登記在 PG.stops',s===want&&s2===null&&s3===null&&PG.stops.some(f=>{ room('2029-06-20',22,Y4()); return f(H.G)===want; }),J([s,s2,s3,want])); }
    { room('2029-06-27',22.5,Y4()); const n=PG.nextStop(H.G), want=D('2029-06-27')*24+23; check('4. PG.nextStop：6/27 22:30 在 409＝下一站就是 23:00（不會直接跳到 6/28 10:00 宿舍期滿）',n!=null&&Math.abs(n-want)<1e-6,J([n,want])); } });

  /* ================= 5 存檔 ================= */
  await sec(5,async()=>{ const x=X(), Z=L.room.r312.zhe;
    room('2026-09-08',22.6,Y2()); knowAll(); check('5. 舊存檔：沒有 RY24 也照常（第一次用到才建）',!H.G.flags.RY24&&(await talk('zhe'))[0].endsWith(Z.rows[0].t)&&!!H.G.flags.RY24);
    enterRoom(); H.G=JSON.parse(JSON.stringify(H.G)); SOCIAL.bind(H.G); EVENTS.bind(GM); at('2026-09-09',22.6); const s1=await talk('zhe'); const w1=enterRoom();
    check('5. 存讀檔（JSON）以後：說過的不再說（接第二句）、走進房間照順序接下去',s1.length===1&&s1[0].endsWith(Z.rows[1].t)&&J(w1)===J([L.walkIn.r312[1].t]),J([s1,w1]));
    room('2026-09-09',22.6,Object.assign(Y2(),{RY24:{talk:{'r312:zhe':['z1']}}})); knowAll(); const s2=await talk('zhe');
    check('5. 只有一部分的紀錄（talk 有、其他沒有）：補齊照常',s2.length===1&&s2[0].endsWith(Z.rows[1].t)&&typeof H.G.flags.RY24.tday==='object'&&typeof H.G.flags.RY24.walk==='object',J(s2));
    room('2026-09-09',21,Object.assign(Y2(),{RY24:{walk:{r312:{i:1,day:null,used:'x'}}}})); const w2=enterRoom(); check('5. 壞掉的紀錄（used 不是陣列）：照常',J(w2)===J([L.walkIn.r312[1].t]),J(w2));
    room('2026-11-19',23.1,Y2()); knowAll(); await runEv('ev_r312_supper',['（吃）']); let okJ=true; try{ JSON.stringify(H.G); }catch(e){ okJ=false; } check('5. 演過以後 G 存得成 JSON（RY24 只有數字、字串、陣列）',okJ&&J(H.G.flags.RY24.ev)===J({sup312:D('2026-11-19')})); });

  H.done();
})();
