// AA_517 宿舍大二到大四：312、507、409 的房間日常（DORM-Y24-1028；DORM203-MATES-1028 延伸、USER_WANTS X123）——不需要瀏覽器。
//   稿：企劃線 ced552c17 → 4e703821a（AA 加第 5 節「實作時定的」）docs/story_planning/AA_517_宿舍大二到大四_312_507_409房間日常.md（git show 4e703821a 對稿；拿不到＝第 0 項 FAIL；
//      劇情匯入白名單 story_import_allow.json 同一個 sha）
//   0  新檔載得到；index.html：dorm203_3d.js → … → data/dorm_y24_lines.js → dorm_y24_3d.js（兩個新檔相鄰）→ bbpack_events.js，在 story3d.js、postgrad3d.js 以後；story3d.js 四個掛勾；
//      遊戲裡的每一句（走進房間的旁白、房間的話、三件小事的旁白／台詞／選項、群組訊息）都在稿裡、一字不差、說話的人對、順序對；反過來，稿第 1～3 節的每一句遊戲裡都有；
//      三件小事的日子與時間、群組的時間照稿（3-3＝story3d.js 的宿舍退宿日 Y4K.out 前一晚）
//   1  住哪一間（312／507／409；203、搬出宿舍、日本路線退宿到搬進 409、美國路線在美國＝沒有）；作息照舊（S.dormMates），只多 409 最後一晚柏翰在
//   2  走進房間的旁白：從門口走進來才說（睡覺醒來、讀檔、搬進新房間、劇情帶進來、待在房間跳時間不說）；每一間照順序輪流、同一天不重複；
//      「學弟在問阿哲」阿哲在房間才說；寒暑假、23:30 以後沒有；過了 15 分鐘、走出去、中間演了事件＝不說
//   3  房間閒聊：一天一句新的、每句一次、照順序；之後兩句輪流；學期、週次、期末前（大四下 15 週＝第 10～14 週）、沛珊分開（第 6 週起、沒有和她交往；第 5 節第 2 點）、12/19 以後、
//      感冒那晚演過（阿凱有來）、日本路線大三下不出、美國路線（第 1 列大四下第 1～4 週、第 2 列看日期不出、第 3 列照出）；旁白＋台詞那兩格；房間外照原本的閒聊
//   4  三件小事：日子、時間、該在的人（正在走進來的等坐下；3-2 柏翰 23:30 以後在上舖也算在）、日本路線不演、只演一次、選項、旗標；群組訊息的時間、不在群組不傳；
//      409 最後一晚＝退宿日 2029-06-28 的前一晚、那一晚柏翰在、「（去關燈）」看 2-4「最後一晚，燈你關」說過沒有；畢業後篇（PG.stops）停在那一晚 23:00
//   5  存檔：舊存檔（沒有 RY24、只有一部分）照常；存讀檔以後說過的不再說、輪到哪一句照舊；JSON 存得下
//   6  （DORM-Y24-AAFIX-1028，AA_517 第 5 節，企劃線 4e703821a）四件——
//      ①2-3 第 3 列「你感冒那晚」：ev_cold_week_night 演過、而且那一晚阿凱有來（COLD_WEEK_PRESENT 有阿凱；真的跑 STORY.coldWeekNight：有 SUNDAY_SUPPER＝阿凱來，沒有＝不出）
//      ②沛珊分開那兩列（2-1、2-2 第 3 列）不看玩家知不知道：沛珊和柏翰交往過（分開那一週的週一沒有在和她交往，ROMANCE_HISTORY）、大二上第 6 週（10/12）起、現在沒有和她交往
//      ③美國路線 409 第 1 列：大四下開學（2029-02-19）起四週＝大四下第 1～4 週；第 2 列照日期不出、第 3 列照出
//      ④三件小事那一晚祐廷不在房間：3-1 隔天第一次走進 312 一句旁白、3-2 23:50 群組換成兩雙拖鞋、3-3 23:40 群組換成「最後一晚／（哥）你人咧／所以又少一個」；旗標都不記
//      第 0 項的對稿兩個方向也對第 5 節第 4 點（不在房間補的那一句、那幾則群組）
// 修改前（開發分支 82c3c998e＝這個任務開工那一版：git archive 出 src、tests、index.html＋那一版的白名單，把這支測試放進去、AA517_GIT_DIR 指到這個 repo 對稿，真的跑過）：FAILED 13、PASS 8、結束碼 1——
//   第 0 項 6 項 FAIL（新檔與 index.html、story3d.js 掛勾、白名單對台詞檔的來源、對稿兩個方向、日子與時間）；第 1、2、3、5 項各 1 項 FAIL（沒有 DORMY24 丟例外，整節中斷）；
//   第 4 項 3 項 FAIL（3-1「演」兩項：事件不存在；跑事件丟例外，整節中斷）。舊程式剛好也對的 8 項：拿得到稿、第 4 項 3-1 那七項「不演」（事件不存在本來就不演）。
// 修改後：ALL PASS（104 項）
// AA_517 第 5 節（DORM-Y24-AAFIX-1028，白名單 ced552c17 → 4e703821a，2026-10-28）：
//   修改前（開發分支 c55e44202 的 src/dorm_y24_3d.js、src/data/dorm_y24_lines.js＝只拿掉這次 src 的改動；白名單、這支測試用新的；git archive 出 src、tests、index.html、白名單，
//   AA517_GIT_DIR 指這個 repo 對稿，真的跑過）：FAILED 30、PASS 112、結束碼 1——第 0 項 3 項（白名單與台詞檔的 sha、第 5 節第 4 點對稿、群組時間）、
//   第 3 項 4 項（沒演分開的第 6 週、312 柏翰那一串、美國路線兩項）、第 5 項 1 項（舊 RY24 的 miss）、第 6 項 22 項（①兩項、②四項、④十六項）。
//   舊程式剛好也對的：②「交往到分開那一週以後才分＝沒有」「現在交往中＝沒有」（舊的要演過那一件才有）、④「那一晚演了」「柏翰那天不在」「日本路線」「隔天沒走進去」「23:50 人在 507 先不傳」那幾項（舊的本來就什麼都不補）。
//   另外在現在的程式上一次拿掉一條規則各跑一次（測試都抓得到）：感冒那晚不看阿凱→第 6 項 2 項 FAIL；沛珊不看交往紀錄→1 項；不看第 6 週→第 3 項 4 項；
//   3-2 人在 507 不等→1 項；晚三天以上照補→1 項；MOVED_OUT 不照那一天→1 項；群組傳了以後還演→1 項；3-1 旁白不只隔天→2 項；美國路線照舊→2 項；不看 ZHE_CALLS_GE→4 項；不在群組不記 miss→1 項。
// 修改後：ALL PASS（142 項，約 0.7 秒）
// 用法：node tests/aa517_dorm_y24_unit.js（對稿要 git 拿得到 4e703821a；在別的資料夾跑舊版：AA517_GIT_DIR=<有這個 commit 的 repo>）
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
try{ DOC=cp.execSync('git show 4e703821a:"docs/story_planning/AA_517_宿舍大二到大四_312_507_409房間日常.md"',{cwd:process.env.AA517_GIT_DIR||H.ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']}); }catch(e){ DOC=''; }
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
/* 同 sweep，每一步先跑遊戲的手機規則（STORY.phoneRules：STORY.PHONE_RULES，含 DORMY24.phone 第 5 節不在房間那一晚的群組）*/
const sweepR=(k0,h0,k1,h1,step)=>{ step=step||0.25; const a=D(k0)*24+h0, b=D(k1)*24+h1; for(let t=a;t<=b+1e-9;t+=step){ const d=Math.floor(t/24); H.G.day=d; H.G.weekday=wdOf(d); H.G.hour=+(t-d*24).toFixed(4); STORY.phoneRules(GM); PHONE.tick(H.G); } };

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
  await sec(0,()=>{ const A=JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files.filter(e=>/AA_517_/.test(e.path)), L0=LL();
    check('0. 劇情匯入白名單有 AA_517（sha 4e703821a＝AA 加了第 5 節那一版、approved、任務 DORM-Y24-1028）；台詞檔寫的來源同一個 sha',A.length===1&&A[0].sha==='4e703821a'&&A[0].status==='approved'&&A[0].task==='DORM-Y24-1028'&&!!L0&&/^4e703821a AA_517$/.test(L0.source),J(A)); });
  await sec(0,()=>{ check('0. 拿得到稿（git show 4e703821a；有第 5 節「實作時定的」）',DOC.length>2000&&DOC.indexOf('## 1. 走進房間的旁白')>0&&DOC.indexOf('## 3. 三件小事')>0&&DOC.indexOf('## 5. 實作時定的')>0,'長度 '+DOC.length);
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
  /* 第 5 節第 4 點：那一晚不在房間補的那一句（3-1 旁白）、那幾則群組（3-2、3-3）；兩個方向、一字不差。「〔`ZHE_CALLS_GE`〕哥你人咧／〔沒有〕你人咧」＝ge true／false 兩則 */
  await sec(0,()=>{ if(!L||!DOC){ check('0. 第 5 節第 4 點「小事那晚玩家不在房間」：遊戲 ↔ 稿',false,!L?'沒有 DORMY24_LINES':'拿不到稿'); return; }
    const i5=DOC.indexOf('## 5.'), s5=i5<0?'':DOC.slice(i5), M5={}; let k5=null;
    for(const ln of s5.split('\n')){ if(/^\d+\. /.test(ln)) k5=null; const hd=ln.match(/^\s+- \*\*3-([123]) /); if(hd){ k5=['sup312','zhe507','last409'][+hd[1]-1]; M5[k5]=[]; continue; } const q=ln.match(/^\s+> (.+)$/); if(q&&k5) M5[k5].push(q[1].trim()); }
    const gl=items=>{ const o=[]; for(let i=0;i<(items||[]).length;i++){ const a=items[i], b=items[i+1]; if(a.ge===true&&b&&b.ge===false&&b.from===a.from&&b.at===a.at){ o.push(NAME[a.from]+'：〔`ZHE_CALLS_GE`〕'+a.text+'／〔沒有〕'+b.text); i++; } else o.push(NAME[a.from]+'：'+a.text); } return o; };
    const G5={sup312:L.miss&&L.miss.sup312!=null?[L.miss.sup312]:[]}; for(const k in (L.missGroup||{})) G5[k]=gl(L.missGroup[k]);
    const bad=[]; for(const k of new Set([...Object.keys(G5),...Object.keys(M5)])) if(J(G5[k]||[])!==J(M5[k]||[])) bad.push(k+' '+J({遊戲:G5[k],稿:M5[k]}));
    check('0. 第 5 節第 4 點「小事那晚玩家不在房間」：遊戲 ↔ 稿兩個方向一字不差（3-1 隔天走進 312 的旁白；3-2 群組兩則；3-3 群組三則，阿哲那一則照 ZHE_CALLS_GE 兩版）、說話的人對、順序對',
      !bad.length&&J(Object.keys(M5).sort())===J(['last409','sup312','zhe507'])&&Object.keys(L.miss||{}).length===1&&J(Object.keys(L.missGroup||{}).sort())===J(['last409','zhe507']),J(bad.slice(0,3)));
    const at=k=>((L.missGroup||{})[k]||[]).map(m=>m.at);
    check('0. 第 5 節第 4 點的群組時間照稿：3-2「照樣 23:50 傳」、3-3「23:40 群組換成」',DOC.indexOf('照樣 23:50 傳「203（舊生）」群組')>0&&DOC.indexOf('23:40 群組換成')>0&&at('zhe507').length===2&&at('zhe507').every(a=>Math.abs(a-(23+50/60))<1e-9)&&at('last409').length===4&&at('last409').every(a=>Math.abs(a-(23+40/60))<1e-9)); });

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
    room('2026-10-05',22.6,Y2()); knowAll(); const sp=await days('zhe',[['2026-10-05',22.6],['2026-10-11',22.6],['2026-10-12',22.6]]);
    check('3. 沒有演過分開、也沒在群組看到（玩家不知道）：第 5 週（10/5～10/11）還沒有；分開那一週（第 6 週週一 10/12）起「柏翰這禮拜都很早上床。……你有發現嗎？」（第 5 節第 2 點：不看玩家知不知道）',
      J(sp[0])===J([ZN+Z.rows[1].t])&&isAfter(sp[1],Z)&&J(sp[2])===J([ZN+Z.rows[2].t]),J(sp));
    room('2026-09-08',22.6,Y2()); knowAll(); const b=await days(BH,[['2026-09-08',22.6],['2026-09-09',22.6],['2026-09-10',22.6],['2026-10-12',22.6],['2027-02-23',22.6],['2027-04-27',22.6],['2027-04-28',22.6]]);
    check('3. 312 柏翰：鬧鐘、檯燈、（第 1 週還沒分開＝之後）、第 6 週起（分開以後，沒演那一件也算）旁白＋「……沒事。在念書。」、大二下「阿哲最近十一點才回來」、期末前「推甄的事」、之後',
      J(b[0])===J([BN()+B.rows[0].t])&&J(b[1])===J([BN()+B.rows[1].t])&&isAfter(b[2],B)&&J(b[3])===J([B.rows[2].pre,BN()+B.rows[2].t])&&J(b[4])===J([BN()+B.rows[3].t])&&J(b[5])===J([BN()+B.rows[4].t])&&isAfter(b[6],B),J(b));
    room('2026-10-05',22.6,Y2()); knowAll(); const f1=await talk('zhe'); check('3. 第一次在 312 講話已經是第 5 週（10/5）：第 1～4 週那句過了不補（從「這間窗戶」開始）',J(f1)===J([ZN+Z.rows[1].t]),J(f1));
    room('2026-10-04',22.6,Y2()); knowAll(); const f2=await talk('zhe'); check('3. 第 4 週最後一天（10/4）還有「學弟問我浴室……」',J(f2)===J([ZN+Z.rows[0].t]),J(f2));
    room('2027-10-06',22.6,Y3()); knowAll(); const c=await days(BH,[['2027-10-06',22.6],['2027-10-07',22.6],['2027-10-08',22.6]]);
    check('3. 507 柏翰：大三上第 5 週第一次講＝「阿哲每天晚上上來借東西……」（第 1～4 週那句過了）；感冒那晚沒演＝沒有那一句',J(c[0])===J([BN()+C.rows[1].t])&&isAfter(c[1],C)&&isAfter(c[2],C),J(c));
    room('2027-09-07',22.6,Y3()); knowAll(); const c1=await talk(BH); H.G.events.done.ev_cold_week_night=1; H.G.flags.COLD_WEEK_NIGHT=D('2027-10-24'); H.G.flags.COLD_WEEK_PRESENT=['zhe','kai']; const c2=await days(BH,[['2027-09-08',22.6],['2027-10-25',22.6],['2028-02-22',22.6],['2028-04-25',22.6],['2028-04-26',22.6]]);
    check('3. 507：第 1 週「五樓。我第一天數了樓梯……」→「阿哲每天晚上」→ 感冒那晚演過（阿凱有來）「你感冒那晚，是我傳訊息給阿凱的……」→ 大三下「推甄要的書單」→ 期末前「冷氣我調二十五。……這次不用投票。」',
      J(c1)===J([BN()+C.rows[0].t])&&J(c2[0])===J([BN()+C.rows[1].t])&&J(c2[1])===J([BN()+C.rows[2].t])&&J(c2[2])===J([BN()+C.rows[3].t])&&J(c2[3])===J([BN()+C.rows[4].t])&&isAfter(c2[4],C),J([c1,c2]));
    room('2028-02-15',22.6,Object.assign(Y3(),{EXCHANGE_ROUTE:'JP'})); knowAll(); { const x=X(); check('3. 日本路線：大三下那兩句不出（稿：2/20 退宿，不出）',!x.rowOpen(Object.assign({},H.G,{day:D('2028-02-22')}),C.rows[3])&&!x.rowOpen(Object.assign({},H.G,{day:D('2028-04-25')}),C.rows[4])&&x.rowOpen(Object.assign({},H.G,{flags:Object.assign({},H.G.flags,{EXCHANGE_ROUTE:'US'}),day:D('2028-02-22')}),C.rows[3])); }
    room('2028-09-05',22.6,Y4()); knowAll(); const q=await days(BH,[['2028-09-05',22.6],['2028-09-06',22.6],['2028-09-07',22.6],['2028-11-21',22.6],['2029-02-20',22.6],['2029-05-22',22.6],['2029-05-23',22.6]]);
    check('3. 409（臺灣路線）：第 1 週「最後一次搬……」→「我會讀到一點左右……」→ 之後 → 第 12 週旁白＋「……用不到了。給學弟。」→ 大四下「四間房間」→ 期末前「最後一晚，燈你關」',
      J(q[0])===J([BN()+Q.rows[0].t])&&J(q[1])===J([BN()+Q.rows[1].t])&&isAfter(q[2],Q)&&J(q[3])===J([Q.rows[2].pre,BN()+Q.rows[2].t])&&J(q[4])===J([BN()+Q.rows[3].t])&&J(q[5])===J([BN()+Q.rows[4].t])&&isAfter(q[6],Q),J(q));
    { const x=X(), G0=H.G, o=(k,r)=>x.rowOpen(Object.assign({},G0,{day:D(k)}),r);
      check('3. 「期末前」：大二下第 10～15 週（第 16 週期末考、第 9 週都不算）；大四下 15 週＝第 10～14 週（第 15 週是期末考週）',o('2027-04-26',Z.rows[5])&&o('2027-06-06',Z.rows[5])&&!o('2027-06-07',Z.rows[5])&&!o('2027-04-25',Z.rows[5])&&o('2029-04-23',Q.rows[4])&&o('2029-05-27',Q.rows[4])&&!o('2029-05-28',Q.rows[4])&&!o('2029-04-22',Q.rows[4]));
      check('3. 409 第 2 列「第 1～12 週」第 12 週還在、第 13 週沒有；第 3 列「第 12 週以後」第 11 週沒有、第 12 週起有（大四下也算）',o('2028-11-26',Q.rows[1])&&!o('2028-11-27',Q.rows[1])&&!o('2028-11-19',Q.rows[2])&&o('2028-11-20',Q.rows[2])&&o('2029-03-01',Q.rows[2])); }
    room('2028-12-23',22.6,Object.assign(Y4(),{EXCHANGE_ROUTE:'US',ROOM_Y4:D('2028-12-23')})); knowAll(); const u=await days(BH,[['2028-12-23',22.6],['2028-12-24',22.6],['2029-02-18',22.6],['2029-02-19',22.6],['2029-02-20',22.6]]);
    { const x=X(), G0=H.G, o=(k,r,rt)=>x.rowOpen(Object.assign({},G0,{day:D(k)},rt?{flags:Object.assign({},G0.flags,{EXCHANGE_ROUTE:rt})}:{}),r);
      check('3. 美國路線（12/23 返台、搬進 409）：當晚第 3 列旁白＋「……用不到了。給學弟。」（看日期，放榜以後）；之後到 2/18 沒有新的（第 1 列還沒到、第 2 列「放榜以前」不出）；大四下開學 2/19「最後一次搬……」、隔天「大一到現在，四間房間。你都在。」（第 5 節第 3 點）',
        J(u[0])===J([Q.rows[2].pre,BN()+Q.rows[2].t])&&isAfter(u[1],Q)&&isAfter(u[2],Q)&&J(u[3])===J([BN()+Q.rows[0].t])&&J(u[4])===J([BN()+Q.rows[3].t])&&!X().rec(H.G).talk['r409:'+BH].includes('d2'),J(u));
      check('3. 美國路線第 1 列：大四下開學（2029-02-19）起四週＝2/19～3/18 有、3/19（第 5 週）起沒有；返台以後到開學前（12/23～2/18）、返台以前都沒有；第 2 列大四下也沒有',
        o('2029-02-19',Q.rows[0])&&o('2029-03-18',Q.rows[0])&&!o('2029-03-19',Q.rows[0])&&!o('2029-02-18',Q.rows[0])&&!o('2028-12-23',Q.rows[0])&&!o('2029-01-10',Q.rows[0])&&!o('2028-12-22',Q.rows[0])&&!o('2029-02-20',Q.rows[1])
        &&J(Q.rows[0].us)===J({term:'Y4S2',weeks:[1,4]})&&K(STORY.termDayIn('Y4S2',1,1))==='2029-02-19'&&DOC.indexOf('改成從大四下開學（2029-02-19）起算四週')>0);
      check('3. 臺灣、日本路線第 1 列照舊只在大四上第 1～4 週（9/26 有、大四下 2/19 沒有）',o('2028-09-26',Q.rows[0],'TW')&&!o('2029-02-19',Q.rows[0],'TW')&&!o('2028-12-23',Q.rows[0],'TW')&&o('2028-09-26',Q.rows[0],'JP')&&!o('2029-02-19',Q.rows[0],'JP')); }
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
    room('2028-05-30',22,Y3(),'campus'); knowAll(); PHONE.join(H.G,'r203','203（舊生）'); sweepR('2028-05-30',22,'2028-05-31',2,0.1);
    check('4. 那一晚不在房間：沒有演、沒有旗標、原本那兩則（三雙拖鞋）不傳（換成第 5 節第 4 點那兩則，見第 6 項）',!H.G.events.done.ev_r507_zhe&&!H.G.flags.R507_ZHE&&!grp().some(m=>m.text==='（照片：507 的地板，三雙拖鞋）'||m.text==='所以少我一雙'),J(grp().map(m=>m.text)));
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
    { room('2029-06-27',22.5,Y4()); const n=PG.nextStop(H.G), want=D('2029-06-27')*24+23; check('4. PG.nextStop：6/27 22:30 在 409＝下一站就是 23:00（不會直接跳到 6/28 10:00 宿舍期滿）',n!=null&&Math.abs(n-want)<1e-6,J([n,want])); }
    { const pg=async zone=>{ room('2029-06-27',14,Object.assign(Y4(),{Y4_PATH:'bar',PACKED_Y4:D('2029-06-01'),GRAD_DONE:true,EXCHANGE_ROUTE:'TW'}),zone); knowAll(); H.G.flags.GRADUATED=PG.gradDay(); PG.rec(H.G).done.grad=1;
        const on=PG.on(H.G); await PG.advance(GM); return {on,day:K(H.G.day),h:+H.G.hour.toFixed(2),ev:evCheck('ev_r409_last')}; };
      const a=await pg('dorm'), b=await pg('campus');
      check('4. 畢業後篇真的跳（PG.advance，6/27 14:00 站著不動）：在 409＝停在 6/27 23:00、最後一晚演得了；在校園＝不停在那一晚（稿：祐廷在房間才演，不補）',a.on&&a.day==='2029-06-27'&&a.h===23&&a.ev&&b.on&&!(b.day==='2029-06-27'&&b.h===23)&&!b.ev,J([a,b])); } });

  /* ================= 5 存檔 ================= */
  await sec(5,async()=>{ const x=X(), Z=L.room.r312.zhe;
    room('2026-09-08',22.6,Y2()); knowAll(); check('5. 舊存檔：沒有 RY24 也照常（第一次用到才建）',!H.G.flags.RY24&&(await talk('zhe'))[0].endsWith(Z.rows[0].t)&&!!H.G.flags.RY24);
    enterRoom(); H.G=JSON.parse(JSON.stringify(H.G)); SOCIAL.bind(H.G); EVENTS.bind(GM); at('2026-09-09',22.6); const s1=await talk('zhe'); const w1=enterRoom();
    check('5. 存讀檔（JSON）以後：說過的不再說（接第二句）、走進房間照順序接下去',s1.length===1&&s1[0].endsWith(Z.rows[1].t)&&J(w1)===J([L.walkIn.r312[1].t]),J([s1,w1]));
    room('2026-09-09',22.6,Object.assign(Y2(),{RY24:{talk:{'r312:zhe':['z1']}}})); knowAll(); const s2=await talk('zhe');
    check('5. 只有一部分的紀錄（talk 有、其他沒有）：補齊照常',s2.length===1&&s2[0].endsWith(Z.rows[1].t)&&typeof H.G.flags.RY24.tday==='object'&&typeof H.G.flags.RY24.walk==='object',J(s2));
    room('2026-09-09',21,Object.assign(Y2(),{RY24:{walk:{r312:{i:1,day:null,used:'x'}}}})); const w2=enterRoom(); check('5. 壞掉的紀錄（used 不是陣列）：照常',J(w2)===J([L.walkIn.r312[1].t]),J(w2));
    room('2026-11-19',23.1,Y2()); knowAll(); await runEv('ev_r312_supper',['（吃）']); let okJ=true; try{ JSON.stringify(H.G); }catch(e){ okJ=false; } check('5. 演過以後 G 存得成 JSON（RY24 只有數字、字串、陣列）',okJ&&J(H.G.flags.RY24.ev)===J({sup312:D('2026-11-19')}));
    room('2026-11-20',9,Object.assign(Y2(),{RY24:{talk:{},ev:{}}})); knowAll(); const s3=enterRoom(); H.G=JSON.parse(JSON.stringify(H.G)); SOCIAL.bind(H.G); EVENTS.bind(GM); const s4=enterRoom();
    check('5. 第 5 節：舊的 RY24（沒有 miss 那一格）照常——3-1 隔天那一句說了記 miss（那一天）；存讀檔以後同一天不再說',J(s3)===J([L.miss&&L.miss.sup312])&&!!H.G.flags.RY24.miss&&H.G.flags.RY24.miss.sup312===D('2026-11-20')&&J(s4)===J([L.walkIn.r312[0].t]),J([s3,s4])); });

  /* ================= 6 AA_517 第 5 節（DORM-Y24-AAFIX-1028，企劃線 4e703821a）================= */
  const s5=DOC.indexOf('## 5.')>0?DOC.slice(DOC.indexOf('## 5.')):'';
  /* ① 2-3 第 3 列「你感冒那晚」：ev_cold_week_night、那一晚阿凱有來 */
  await sec(6,async()=>{ const x=X(), c3=L.room.r507[BH].rows[2];
    check('6. ① 稿第 5 節第 1 點：就是 ev_cold_week_night、條件再加那一晚阿凱有來（COLD_WEEK_PRESENT 有阿凱）、阿凱沒來的不出',s5.indexOf('就是 `ev_cold_week_night`')>0&&s5.indexOf('`COLD_WEEK_PRESENT` 有阿凱')>0&&s5.indexOf('阿凱沒來的，這一列不出')>0);
    const o=(f,dn)=>{ room('2027-10-25',22.6,Object.assign(Y3(),f)); if(dn) H.G.events.done.ev_cold_week_night=1; return x.rowOpen(H.G,c3); };
    check('6. ① 2-3 第 3 列：演過、阿凱有來＝有；演過、那晚來的是別人（語彤、阿哲）＝沒有；整晚不在（missed）＝沒有；沒演＝沒有',
      o({COLD_WEEK:'night',COLD_WEEK_NIGHT:D('2027-10-24'),COLD_WEEK_PRESENT:['kai']},true)&&o({COLD_WEEK:'night',COLD_WEEK_NIGHT:D('2027-10-24'),COLD_WEEK_PRESENT:['heroine_03','zhe','kai']},true)
      &&!o({COLD_WEEK:'night',COLD_WEEK_NIGHT:D('2027-10-24'),COLD_WEEK_PRESENT:['heroine_03','zhe']},true)&&!o({COLD_WEEK:'night',COLD_WEEK_NIGHT:'missed',COLD_WEEK_PRESENT:[]})&&!o({}));
    /* 真的跑 STORY.coldWeekNight（10/24 21:30，story3d.js）：阿凱有 SUNDAY_SUPPER＝他來（AA_315 3-2 阿凱那一列）；沒有＝阿哲（好朋友）來、阿凱沒來 */
    const night=async kai=>{ room('2027-10-24',21.5,Object.assign(Y3(),{COLD_WEEK:'night',COLD_WEEK_TOLD:'none',COLD_WEEK_CALLS:[]})); knowAll(); if(kai) SOCIAL.remember('kai','SUNDAY_SUPPER',''); else H.CLOSE('zhe');
      H.said=[]; H.picks=[]; const ok=await STORY.coldWeekNight(GM); const heard=H.said.some(q=>q.t==='你室友傳訊息給我說你要死了。我帶泡麵。'), pres=(H.G.flags.COLD_WEEK_PRESENT||[]).slice();
      x.rec(H.G,true).talk['r507:'+BH]=['c1','c2']; at('2027-10-25',22.6); H.G.zone='dorm'; const t=await talk(BH); return {ok,heard,pres,t}; };
    const k1=await night(true), k0=await night(false);
    check('6. ① 真的跑感冒那一晚：阿凱來了（說了「你室友傳訊息給我說你要死了。我帶泡麵。」）＝隔天柏翰「你感冒那晚，是我傳訊息給阿凱的。……」；阿凱沒來（阿哲來）＝沒有那一句',
      !!k1.ok&&k1.heard&&k1.pres.includes('kai')&&J(k1.t)===J([SOCIAL.displayName(BH)+'：'+c3.t])&&!!k0.ok&&!k0.heard&&!k0.pres.includes('kai')&&k0.pres.length>0&&!k0.t.some(q=>q.endsWith(c3.t)),J([k1,k0])); });
  /* ② 沛珊分開那兩列（2-1、2-2 第 3 列）：不看玩家知不知道 */
  await sec(6,async()=>{ const x=X(), Z=L.room.r312.zhe, B=L.room.r312[BH];
    const PSH=(f,k,ev)=>{ room(k||'2026-10-14',22.6,Object.assign(Y2(),f)); if(ev) ev(); const a=x.rowOpen(H.G,Z.rows[2]), b=x.rowOpen(H.G,B.rows[2]); return a&&b?true:(!a&&!b?false:'不一致'); };
    check('6. ② 稿第 5 節第 2 點：不看玩家知不知道；沛珊和柏翰交往過、到了分開那一週（大二上第 6 週）以後、祐廷沒有和沛珊交往，就出',s5.indexOf('不看玩家知不知道')>0&&s5.indexOf('沛珊和柏翰交往過、到了分開那一週（大二上第 6 週）以後、祐廷沒有和沛珊交往，就出')>0);
    check('6. ② 分開那一週＝大二上第 6 週週一 2026-10-12（events.js ev_peishan_split 的 weeks、characters.js 沛珊 partner 的 untilWeek 也是第 6 週）',typeof x.splitDay==='function'&&x.splitDay()!=null&&K(x.splitDay())==='2026-10-12'&&J(EV('ev_peishan_split').weeks)===J([6])&&CHARACTERS.classmate_peishan.partner.untilWeek.week===6);
    check('6. ② 沒和沛珊交往過、什麼都沒看到（玩家不知道）：10/11（第 5 週週日）沒有、10/12 起有、大二下也有（阿哲、柏翰兩列一樣）',PSH({},'2026-10-11')===false&&PSH({},'2026-10-12')===true&&PSH({},'2027-03-01')===true);
    check('6. ② 現在和沛珊交往中＝沒有（演過分開也一樣）',PSH({dating_classmate_peishan:true})===false&&PSH({dating_classmate_peishan:true},null,()=>{ H.G.events.done.ev_peishan_split=1; })===false);
    const HI=(from,to)=>({EX_classmate_peishan:true,ROMANCE_HISTORY:[{id:'classmate_peishan',from,to,how:'apart_talk'}]});
    check('6. ② 和沛珊交往到分開那一週以後才分（大一上第 12 週～大二上第 8 週；第 6 週當中才分；暑假開始、10/20 才分）＝她沒有和柏翰交往過：分開以後也沒有',
      PSH(HI('Y1S1W12','Y2S1W8'),'2026-10-26')===false&&PSH(HI('Y1S1W12','Y2S1W6'),'2026-10-26')===false&&PSH(HI('D'+D('2026-08-01'),'D'+D('2026-10-20')),'2026-10-26')===false);
    check('6. ② 和沛珊交往過、在 4/6 以前（大一下第 3 週）或第 6 週以前（大二上第 3 週）分了＝她後來和柏翰交往過：有；分開以後才和沛珊交往、後來又分了（第 8～12 週）＝有',
      PSH(HI('Y1S1W12','Y1S2W3'))===true&&PSH(HI('Y1S1W12','Y2S1W3'))===true&&PSH(HI('Y2S1W8','Y2S1W12'),'2026-12-01')===true);
    check('6. ② 交往紀錄寫分開那一週在交往，但演過她說分開的那一件、或群組看過 ps_split_group（只在那時候沒和她交往才有）＝有',
      PSH(HI('Y1S1W12','Y2S1W8'),'2026-10-26',()=>{ H.G.events.done.ev_peishan_split=1; })===true
      &&PSH(HI('Y1S1W12','Y2S1W8'),'2026-10-26',()=>{ PHONE.at(H.G,D('2026-10-16'),21,[{th:'g:noodle_team',from:'classmate_peishan',text:'說一件事，說完就好。'}],'ps_split_group'); })===true); });
  /* ④ 三件小事那一晚祐廷不在房間 */
  await sec(6,async()=>{ const x=X(), A=L.walkIn, MS=L.miss&&L.miss.sup312; let t;
    check('6. ④ 稿第 5 節第 4 點：小事那晚玩家不在房間：補一句，旗標不記；3-1 隔天第一次走進 312，一句旁白',s5.indexOf('**小事那晚玩家不在房間**：補一句，旗標不記。')>0&&s5.indexOf('隔天第一次走進 312，一句旁白')>0);
    /* 3-1 */
    room('2026-11-19',22,Y2(),'campus'); knowAll(); sweepR('2026-11-19',22,'2026-11-20',1,0.5); H.G.zone='dorm'; at('2026-11-20',9); const m1=enterRoom(), m2=enterRoom();
    check('6. ④ 3-1 11/19 晚上在外面（23:00～23:30 不在 312）：沒有演、R312_SUPPER 不記；11/20 第一次走進 312＝「（垃圾桶裡有四個滷味的袋子。學弟的桌上，多了一雙沒拆的免洗筷。）」（這一次背景室友那一句讓它）；再走進來＝背景室友照順序的第一句',
      !!MS&&J(m1)===J([MS])&&J(m2)===J([A.r312[0].t])&&!H.G.flags.R312_SUPPER&&!H.G.events.done.ev_r312_supper&&x.rec(H.G).miss.sup312===D('2026-11-20'),J([m1,m2]));
    at('2026-11-21',9); const m3=enterRoom(); check('6. ④ 3-1 只有隔天：11/21 再走進來沒有那一句',J(m3)===J([A.r312[1].t]),J(m3));
    room('2026-11-21',9,Y2()); knowAll(); const m4=enterRoom(); check('6. ④ 3-1 隔天（11/20）沒走進 312、11/21 才走進來：沒有那一句（稿「隔天第一次走進 312」）',J(m4)===J([A.r312[0].t]),J(m4));
    room('2026-11-19',23.75,Y2()); knowAll(); const m5=enterRoom(); at('2026-11-20',9); const m6=enterRoom();
    check('6. ④ 3-1 同一晚 23:45 才回到 312（演出的時間過了）：當晚不說；隔天第一次走進來才說',m5.length===0&&!!MS&&J(m6)===J([MS]),J([m5,m6]));
    room('2026-11-20',7,Y2()); knowAll(); STORY._sleeping=true; x.entered(GM,{}); STORY._sleeping=false; x.tick(GM); const w0=caps.length; const m7=enterRoom();
    check('6. ④ 3-1 前一晚睡著了、11/20 在 312 醒來：醒來不說（同第 1 節，起床不算走進來）；之後第一次走進來才說',w0===0&&!!MS&&J(m7)===J([MS]),J(m7));
    room('2026-11-20',9,Y2()); knowAll(); x.entered(GM,{}); H.G.events.count++; x.tick(GM); const w1=caps.length; const m8=enterRoom();
    check('6. ④ 3-1 隔天第一次走進來先演了別的事件（這一次沒說）：同一天下一次走進來說',w1===0&&!!MS&&J(m8)===J([MS]),J(m8));
    room('2026-11-19',23.1,Y2()); knowAll(); await runEv('ev_r312_supper',['（吃）']); at('2026-11-20',9); const m9=enterRoom();
    check('6. ④ 3-1 那一晚演了：隔天沒有那一句（照常背景室友）',J(m9)===J([A.r312[0].t]),J(m9));
    { const aw=STORY.awayOnDate; STORY.awayOnDate=(id,G)=>id===BH&&G.day===D('2026-11-19')?true:aw(id,G); try{ room('2026-11-20',9,Y2()); knowAll(); const m10=enterRoom();
      check('6. ④ 3-1 柏翰那天不在（他們自己不在＝那一件沒有發生）：隔天沒有那一句',J(m10)===J([A.r312[0].t]),J(m10)); } finally { STORY.awayOnDate=aw; } }
    /* 3-2 */
    room('2028-05-30',22,Y3(),'campus'); knowAll(); PHONE.join(H.G,'r203','203（舊生）'); sweepR('2028-05-30',22,'2028-05-30',23.75,0.25); const g0=grp().length; sweepR('2028-05-30',23.85,'2028-05-31',1,0.25);
    const g2=grp().map(m=>[K(m.day),m.from,m.text,+m.h.toFixed(2),m.tag]);
    check('6. ④ 3-2 5/30 晚上在外面（23:30～24:00 不在 507）：沒有演、R507_ZHE 不記；23:50 群組照樣傳，換成阿哲「（照片：507 的地板，兩雙拖鞋）」、阿凱「所以少兩雙」（23:45 還沒有）；tag rt_ 開頭',
      g0===0&&J(g2.map(m=>[m[0],m[1],m[2]]))===J([['2028-05-30','zhe','（照片：507 的地板，兩雙拖鞋）'],['2028-05-30','kai','所以少兩雙']])&&g2.every(m=>Math.abs(m[3]-23.85)<0.03&&/^rt_r203_y24_/.test(m[4]))&&!H.G.flags.R507_ZHE&&!H.G.events.done.ev_r507_zhe,J(g2));
    H.G.zone='dorm'; at('2028-05-30',23.92); check('6. ④ 3-2 群組傳了以後 23:55 才回到 507：不演了',!evCheck('ev_r507_zhe'));
    room('2028-05-30',23.6,Y3()); knowAll(); PHONE.join(H.G,'r203','203（舊生）'); at('2028-05-30',23.85); STORY.phoneRules(GM); const p0=grp().length+PHONE.rec(H.G).q.length; at('2028-05-30',23.92); t=await runEv('ev_r507_zhe'); sweepR('2028-05-30',23.92,'2028-05-31',0.5,0.05);
    check('6. ④ 3-2 23:50 人在 507、還沒演（例：還在別的劇情裡）：先不傳；23:55 演了＝原本那兩則（三雙拖鞋），沒有兩雙那兩則',p0===0&&H.G.flags.R507_ZHE===true&&J(grp().map(m=>m.text))===J(['（照片：507 的地板，三雙拖鞋）','所以少我一雙']),J(grp().map(m=>m.text)));
    room('2028-05-30',23.6,Y3()); knowAll(); PHONE.join(H.G,'r203','203（舊生）'); sweepR('2028-05-30',23.6,'2028-05-31',0.5,0.1);
    check('6. ④ 3-2 人在 507 但一直沒演到 24:00（演出的時間過了）：算不在，照樣傳兩雙拖鞋那兩則、旗標不記',J(grp().map(m=>m.text))===J(['（照片：507 的地板，兩雙拖鞋）','所以少兩雙'])&&!H.G.flags.R507_ZHE,J(grp().map(m=>[K(m.day),m.h,m.text])));
    room('2028-05-30',22,Y3()); knowAll(); PHONE.join(H.G,'r203','203（舊生）'); at('2028-05-31',7.5); STORY.phoneRules(GM); PHONE.tick(H.G); const g3=grp().map(m=>[K(m.day),+m.h.toFixed(2),m.text]);
    check('6. ④ 3-2 22:00 在 507 就睡了、5/31 07:30 醒來：兩雙拖鞋那兩則補在 5/30 23:50（照原本的時間）',J(g3.map(m=>[m[0],m[2]]))===J([['2028-05-30','（照片：507 的地板，兩雙拖鞋）'],['2028-05-30','所以少兩雙']])&&g3.every(m=>Math.abs(m[1]-23.83)<0.02),J(g3));
    { const aw=STORY.awayOnDate; STORY.awayOnDate=(id,G)=>id===BH&&G.day===D('2028-05-30')?true:aw(id,G); try{ room('2028-05-30',22,Y3(),'campus'); knowAll(); PHONE.join(H.G,'r203','203（舊生）'); sweepR('2028-05-30',23.5,'2028-05-31',1,0.25);
      check('6. ④ 3-2 柏翰那天不在：那一件沒有發生，群組也沒有',grp().length===0&&!((x.rec(H.G)||{miss:{}}).miss||{}).zhe507); } finally { STORY.awayOnDate=aw; } }
    room('2028-05-30',22,Object.assign(Y3(),{EXCHANGE_ROUTE:'JP',X1_JP:D('2028-02-20')}),'campus'); knowAll(); PHONE.join(H.G,'r203','203（舊生）'); sweepR('2028-05-30',23.5,'2028-05-31',1,0.25);
    check('6. ④ 3-2 日本路線：什麼都沒有（照舊不演、也不補）',grp().length===0);
    room('2028-05-30',22,Y3(),'campus'); knowAll(); sweepR('2028-05-30',23.5,'2028-05-31',1,0.25);
    check('6. ④ 3-2 不在 203 群組（沒有 203 四人房的舊存檔）：不傳、旗標不記',grp().length===0&&!!x.rec(H.G)&&x.rec(H.G).g.zhe507==='nogroup'&&x.rec(H.G).miss.zhe507===D('2028-05-30')&&!H.G.flags.R507_ZHE);
    room('2028-06-03',12,Y3(),'campus'); knowAll(); PHONE.join(H.G,'r203','203（舊生）'); STORY.phoneRules(GM); PHONE.tick(H.G); const late4=grp().length; room('2028-06-02',12,Y3(),'campus'); knowAll(); PHONE.join(H.G,'r203','203（舊生）'); STORY.phoneRules(GM); PHONE.tick(H.G);
    check('6. ④ 3-2 晚三天以上不補（舊存檔讀進來已經 6/3＝晚四天）；6/2（晚三天）還補',late4===0&&grp().length===2,J([late4,grp().length]));
    /* 3-3 */
    const last=ge=>{ room('2029-06-27',22,Object.assign(Y4(),ge?{ZHE_CALLS_GE:true}:{}),'campus'); knowAll(); PHONE.join(H.G,'r203','203（舊生）'); sweepR('2029-06-27',22,'2029-06-28',1,0.25); return grp().map(m=>[K(m.day),m.from,m.text,+m.h.toFixed(2)]); };
    const l1=last(true), r1=!!H.G.flags.R409_LAST||!!H.G.events.done.ev_r409_last, l0=last(false);
    check('6. ④ 3-3 6/27 晚上在外面（23:00～23:30 不在 409）：沒有演、R409_LAST 不記；23:40 群組換成阿哲「最後一晚」「哥你人咧」（ZHE_CALLS_GE）、阿凱「所以又少一個」',
      J(l1.map(m=>[m[0],m[1],m[2]]))===J([['2029-06-27','zhe','最後一晚'],['2029-06-27','zhe','哥你人咧'],['2029-06-27','kai','所以又少一個']])&&l1.every(m=>Math.abs(m[3]-23.67)<0.1)&&!r1,J(l1));
    check('6. ④ 3-3 沒有 ZHE_CALLS_GE：「你人咧」',J(l0.map(m=>[m[1],m[2]]))===J([['zhe','最後一晚'],['zhe','你人咧'],['kai','所以又少一個']]),J(l0));
    room('2029-06-28',12,Object.assign(Y4(),{MOVED_OUT:D('2029-06-28')}),'campus'); knowAll(); PHONE.join(H.G,'r203','203（舊生）'); STORY.phoneRules(GM); PHONE.tick(H.G); const l2=grp().map(m=>[K(m.day),+m.h.toFixed(2),m.text]);
    check('6. ④ 3-3 6/28 搬走以後才跑到手機規則：照樣補在 6/27 23:40（那一晚還住 409、柏翰在）',J(l2.map(m=>[m[0],m[2]]))===J([['2029-06-27','最後一晚'],['2029-06-27','你人咧'],['2029-06-27','所以又少一個']])&&l2.length>0&&Math.abs(l2[0][1]-23.67)<0.02,J(l2));
    room('2029-06-27',23.1,Y4()); knowAll(); PHONE.join(H.G,'r203','203（舊生）'); await runEv('ev_r409_last',['再聊一下']); sweepR('2029-06-27',23.1,'2029-06-28',0.5,0.25);
    check('6. ④ 3-3 那一晚演了：原本那三則（所以我又不在、別棟房間的照片），沒有「所以又少一個」',J(grp().map(m=>m.text))===J(['最後一晚','所以我又不在','（照片：別棟的房間，紙箱也封好了）']),J(grp().map(m=>m.text)));
    { room('2029-06-27',14,Object.assign(Y4(),{Y4_PATH:'bar',PACKED_Y4:D('2029-06-01'),GRAD_DONE:true,EXCHANGE_ROUTE:'TW',ZHE_CALLS_GE:true}),'campus'); knowAll(); H.G.flags.GRADUATED=PG.gradDay(); PG.rec(H.G).done.grad=1; PHONE.join(H.G,'r203','203（舊生）');
      PG.on(H.G); let n=0; while(n++<6&&!grp().length) await PG.advance(GM); const l3=grp().map(m=>[K(m.day),+m.h.toFixed(2),m.text]);
      check('6. ④ 3-3 畢業後篇真的跳（PG.advance，6/27 14:00 在校園站著不動）：最後一晚沒演、群組補在 6/27 23:40「最後一晚」「哥你人咧」「所以又少一個」；R409_LAST 不記',
        J(l3.map(m=>[m[0],m[2]]))===J([['2029-06-27','最後一晚'],['2029-06-27','哥你人咧'],['2029-06-27','所以又少一個']])&&l3.every(m=>Math.abs(m[1]-23.67)<0.05)&&!H.G.flags.R409_LAST&&!H.G.events.done.ev_r409_last,J([l3,K(H.G.day),H.G.hour])); }
    check('6. ④ STORY.PHONE_RULES 有這一套（每一輪問 DORMY24.phone）',STORY.PHONE_RULES.some(f=>/DORMY24\.phone/.test(String(f)))); });

  H.done();
})();
