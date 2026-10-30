// 路人分科系（AA_495，AA-C 2026-10-28 定稿；CROWD-DEPTS-1028、USER_WANTS X120）——不需要瀏覽器。
// 使用者 10-28 00:5x：「路人也是 一堆 上課坐在後排的 路上遇到的 有必要嗎 都沒有別的系的學生 當台大只有法律系嗎」。
// 在 Node 建出遊戲真正的校園、公館、總圖大廳、社科圖、普通教學館、博雅教學館、體育館（1F、3F），照 GAME.enter 進區域（CROWD.enter）檢查：
//   0. 對稿：src/data/crowd_depts.js 的每一句都在 AA_495（AA 分支 5d7bd4040，用 git show 讀）裡、一字不差；稿上的每一句也都有（第 1 節 20 個系、
//      第 2 節 18 組、第 3 節 11 組、第 4 節 5 組、體育館加三句）；index.html 在 crowd3d.js 前面載入 crowd_depts.js
//   1. 抽系照地點（「在哪裡」那一欄：椰／圖（圖資只在總圖）／體／館）；寒暑假只出寫了「寒暑假」那一欄的系；同一群人先把各系輪一遍；同一天同一群人一樣
//   2. 時段欄：考試 → 開學 → 寒暑假 → 晚上 → 平常；那個系沒寫的欄用平常；旁白先出、再出那一句；旁白寫「他」「她」的只給男生／女生
//   3. 輪法（AA_489 第 4 節）：同一次進來同一欄不重複、用完了其他人不說；下一次進來從下一句開始
//   4. 校園：走路的人（story3d.js 的 GM.spawnExtra）名字＝X系的學生、點了聽一句（先停下來面向你、說完往同一個點繼續走）；兩個人一起走的對話
//      （同時只有一組、點了整段、說話的人對、一天聽一次）；路人在按鈕上最後才算（旁邊有出口、有名字的同學時不擋「進入○○」「和小安說話」）
//   5. 公館：館的系、館的對話（晚上、考試週的晚上）
//   6. 圖書館：總圖大廳相鄰兩個空位一起坐（第 5 組）；閉館前 30 分鐘工讀的人（圖資）站在座位旁邊（第 15 組）；社科圖沒有圖資；劇情寫死的位子不坐
//   7. 教學館門口：通識（ge_film_y1s1）上課前各系混著、第 3 節（第 1 週、平常、第 6～7 週三個人、下課後、第 13 週以後）；
//      法律系必修（大一經濟學原理，普通 101）都是法律系、第 4 節（第 1 週、平常、考試前一週、下課後）；選修、演講照舊
//   8. 體育館：16 句一起輪（AA_495 那三句說的人是外文系、化學系、醫學系的學生）；大廳散步的人、長椅上的人＝電機、醫學；1F 場邊的長椅兩個人的對話；寒暑假沒有系
//   9. 經濟系那一年（Y0）：校園的路人一樣有系、有句子；通識門口一樣；經濟系的必修門口照舊
// 修改前（開發分支 095cf15ae，在那個版本的 src、index.html 上真的跑過）：26 項 FAIL——第 0 項（沒有 crowd_depts.js、對稿全部對不到、體育館 13 句）8 項、第 1～9 項都 FAIL
//   （路人沒有系、點不了、沒有對話、教學館門口沒有名字和對話）；修改前也 PASS 的 5 項是前提（讀得到稿、測試用的日子、walkRoutes）和照舊的部分（選修門口、寒假的體育館）。
// 用法：node tests/crowd_depts_unit.js（第 0 項用 git show 讀 AA 的稿；讀不到先 git fetch origin claude/magical-albattani-bk7b4n）
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
console.warn=()=>{}; process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
let seed=4242; Math.random=()=>{ seed=(seed*16807)%2147483647; return (seed-1)/2147483646; };
const GL=/^[A-Z][A-Z0-9_]+$/;
const FILES=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js','src/data/socsci_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/lawlib_layout.js','src/lawlib3d.js','src/data/gongtong_layout.js','src/data/boya_layout.js','src/data/putong_layout.js','src/teach3d.js',
  'src/data/library_layout.js','src/library3d.js','src/data/soclib_layout.js','src/soclib3d.js','src/data/gym_layout.js','src/gym3d.js',
  'src/data/characters.js','src/data/calendar.js','src/data/places.js','src/data/activities.js','src/data/courses.js','src/data/syllabus.js','src/classes3d.js','src/data/crowd_depts.js','src/crowd3d.js'];
const missing=[];
for(const f of FILES){ const p=path.join(ROOT,f); if(!fs.existsSync(p)){ missing.push(f); continue; } let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>GL.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const J=JSON.stringify, uniq=a=>new Set(a).size===a.length;
global.CHAR={build:spec=>{ const g=new THREE.Group(); g.userData.spec=spec; g.userData.buildSpec=spec; return g; },release(){}};
const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
global.STORY={extraSpec:i=>({id:'x'+i,sex:i%2===0?'f':'m'}),profSpec:c=>({id:c.id,name:c.name,sex:c.gender==='f'?'f':'m'}),CROWD_X:2,lawStart:()=>dayOf('2025-08-31'),mainD1:()=>dayOf('2025-09-04')};   /* 新局（開局 B：8/31 開始，第 1 週有課）*/
const D=typeof CROWD_DEPTS!=='undefined'?CROWD_DEPTS:null, C=typeof CROWD!=='undefined'?CROWD:null;
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
E.addNPC=n=>{ n.path=null; n.speed=0; n.pose=n.pose||'idle'; n.radius=0.32; n.timer=0; n.lv=n.lv|0; if(n.seat&&n.seat.y!=null) n.obj.position.y=n.seat.y; E.npcs.push(n); return n; }; E.removeNPC=n=>{ E.npcs=E.npcs.filter(m=>m!==n); };
global.GAME={G:null};
let said=[], VIS=0;
const mkG=(day,h,zone,o)=>Object.assign({day,hour:h,zone:zone||'campus',flags:{},weekday:CALENDAR.dateOf(day).wd%7,stage:'law',weather:'clear'},o||{});
const mkGM=G=>({G,E,enterN:++VIS,D:{active:false},hourRate:1/150,sceneBegin(){},sceneEnd(){},face(){},say:async(who,t)=>{ said.push({who:who?who.name:null,obj:who&&who.obj||null,t}); },
  sitAt:(n,st)=>{ n.seat=st; n.pose='sit'; n.frozen=true; n.path=null; n.obj.position.set(st.x,st.y||0,st.z); n.obj.rotation.y=st.yaw||0; }});
function build(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; else if(z.nav) z.nav._cm=null;
  E.player={obj:{position:new THREE.Vector3(z.spawn.x,0,z.spawn.z),rotation:{y:0}},radius:0.32,lv:(z.spawn&&z.spawn.lv)|0,seat:null}; E.camera=null; return z; }
/* 遊戲的 GM.spawnExtra（game3d.js）：走路的路人＝beh route、照路線走、沒有名字 */
const spawnExtra=(spec,route)=>{ const o=CHAR.build(spec); const n=E.addNPC({obj:o,name:'',beh:'route',waypoints:route,ri:0,walkSpeed:1.3,pauseAt:false,idlePose:'idle',isExtra:true}); const wp=route[0]; E.placeAt(n,wp[0],wp[1],wp[2]); return n; };
const STSRC=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'); const WR=(()=>{ const m=STSRC.match(/const walkRoutes=(\{campus:[\s\S]*?\]\]\]\});/); try{ return m?eval('('+m[1]+')'):null; }catch(e){ return null; } })();
/* 進區域：建好區域、生 story3d.js 那樣的走路的人（n 個，照 walkRoutes 輪），再 CROWD.enter（story3d.js 的 populate 最後呼叫）*/
function enter(id,G,walkers){ GAME.G=G; build(id); G.zone=id; let xi=0; if(walkers&&WR&&WR[id]){ const rs=WR[id]; for(let i=0;i<walkers;i++) spawnExtra(STORY.extraSpec(xi++),rs[i%rs.length]); }
  const GM=mkGM(G); if(C) C.enter(GM,id); return GM; }
const termDay=(id,week,wd)=>{ for(let d=-420;d<1700;d++){ const t=CALENDAR.termOf(d); if(t&&t.id===id&&t.week===week&&CALENDAR.dateOf(d).wd===wd&&!CALENDAR.holiday(d)) return d; } return null; };
const deptOf=n=>{ const m=String(n.name||'').match(/^(.+)系的學生$/); return m?m[1]:null; };
const byId=id=>D&&D.DEPTS.find(d=>d.id===id);
const linesOf=(d,col)=>{ const x=byId(d); return x?(x.L[col]||x.L['平常']||[]):[]; };
const tap=async n=>{ said=[]; if(n&&typeof n.talk==='function') await n.talk(n); return said.map(s=>({who:s.who,t:s.t})); };
const conv=(sec,n)=>D&&D[sec].find(c=>c.n===n);
const stepsOf=(c,names)=>c.d.split('／').map(s=>{ const m=s.match(/^([ABC])：(.*)$/); return {who:names['ABC'.indexOf(m[1])],t:m[2]}; });
const blk=async(name,fn)=>{ try{ await fn(); }catch(e){ check(name+'：執行到一半出錯（'+String(e&&e.message||e).slice(0,120)+'）',false); } };   /* 一段出錯＝那一段 FAIL，其他段照樣跑（修改前的程式沒有 CROWD.dept…）*/
const pairOf=()=>{ const ppl=E.npcs.filter(n=>n.deptTalk&&n.talk); const ids=[...new Set(ppl.map(n=>n.deptTalk))]; return {ppl,ids}; };
(async()=>{
// ---------- 0. 對稿 ----------
let MD=null; try{ MD=cp.execFileSync('git',['show','5d7bd4040:docs/story_planning/AA_495_路人分科系_各系的人說的話_走過聽到的對話_通識課前後.md'],{cwd:ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']}); }catch(e){}
check('0. 讀得到 AA_495 的稿（git show 5d7bd4040；沒有的話先 git fetch origin claude/magical-albattani-bk7b4n）',!!MD);
check('0. src/data/crowd_depts.js 載得到（CROWD_DEPTS）、index.html 在 crowd3d.js 前面載入',!!D&&!missing.length&&/<script src="src\/data\/crowd_depts\.js\?v=[^"]+"><\/script>\n<script src="src\/crowd3d\.js/.test(fs.readFileSync(path.join(ROOT,'index.html'),'utf8')),missing.join(','));
if(MD){ const md=MD.split('\n'), sec=t=>{ const i=md.findIndex(l=>l.startsWith(t)); let j=i+1; while(j<md.length&&!/^## /.test(md[j])) j++; return md.slice(i+1,j); }, rows=t=>sec(t).filter(l=>/^\| \d+ \|/.test(l)).map(l=>l.split('|').slice(1,-1).map(c=>c.trim()));
  /* 第 1 節：自己從稿上讀（和程式的資料分開讀），再一個一個比 */
  const ds=[]; let cur=null, col=null, gym=[];
  for(const l of sec('## 1.')){ let m=l.match(/^### (.+?)（(.+)）$/); if(m){ if(/^體育館加三句/.test(m[1])){ cur='gym'; continue; } cur={id:m[1],at:m[2].replace(/，只在總圖$/,'').split('、'),mainLib:/只在總圖/.test(m[2]),L:{},look:null}; ds.push(cur); col=null; continue; }
    if(cur==='gym'){ m=l.match(/^\| (\S+ \S+) \| (.+?) \| (.+?) \|$/); if(m&&!/^區域/.test(m[1])&&!/^---/.test(m[1])) gym.push([m[1],m[2].replace(/（.*）$/,''),m[3]]); continue; } if(!cur) continue;
    if((m=l.match(/^- 外觀：(.+)$/))){ cur.look=m[1]; continue; } if((m=l.match(/^- \*\*(.+?)\*\*：(.+)$/))){ (cur.L[m[1]]=cur.L[m[1]]||[]).push(m[2]); col=null; continue; } if((m=l.match(/^- \*\*(.+?)\*\*$/))){ col=m[1]; cur.L[col]=[]; continue; } if((m=l.match(/^  - (.+)$/))&&col) cur.L[col].push(m[1]); }
  const dd=D?D.DEPTS:[], bad1=[]; for(const x of ds){ const y=dd.find(q=>q.id===x.id); if(!y){ bad1.push('缺 '+x.id); continue; } if(J(y.at)!==J(x.at)||!!y.mainLib!==x.mainLib||(y.look||null)!==x.look) bad1.push(x.id+' 在哪裡／外觀'); if(J(y.L)!==J(x.L)) bad1.push(x.id+' 句子'); }
  check('0. 第 1 節：20 個系、在哪裡、每一欄的句子都和稿一樣（順序、字都一樣）',ds.length===20&&dd.length===20&&!bad1.length,J(bad1).slice(0,300));
  const all1=dd.flatMap(d=>Object.values(d.L).flat()); check('0. 第 1 節的每一句都原樣出現在稿上（連括號、「」）',all1.length>=50&&all1.every(t=>MD.includes(t)),String(all1.length));
  const rt=all1.filter(t=>{ const st=C&&C.deptSteps?C.deptSteps(t,'x'):[]; const sp=st[st.length-1]; return !(st.length&&(st.length===1?'「'+sp.t+'」'===t:st[0].t+'「'+sp.t+'」'===t)); });
  check('0. 播的時候：旁白（開頭的括號）＋「」裡面那一句，接回去＝稿上那一句（一字不差，只拿掉外面的「」）',all1.length>=50&&!!C&&typeof C.deptSteps==='function'&&!rt.length,J(rt).slice(0,200));
  const G3=C&&C.GYM_HEAR, gl=gym.map(([a,w,t])=>{ const k=/籃球場/.test(a)?'basketball':(/場邊/.test(a)?'rest':(/羽球場/.test(a)?'badminton':null)); const H=G3&&G3[k], i=H?H.L.indexOf(t):-1; return i>=0&&H.W&&H.W[i]===w; });
  check('0. 體育館加三句：三句都在 CROWD.GYM_HEAR 那一區（羽球場、籃球場、場邊），說的人照稿（外文系、化學系、醫學系的學生）；全部 16 句',gym.length===3&&gl.every(Boolean)&&!!G3&&Object.values(G3).reduce((a,h)=>a+h.L.length,0)===16,J(gym));
  const r2=rows('## 2.'), t2=D?D.TALKS:[], b2=r2.filter(r=>{ const y=t2.find(q=>q.n===+r[0]); return !y||y.at!==r[1]||y.when!==r[2]||J(y.who)!==J(r[3].replace(/（[^）]*）$/,'').split('、').map(s=>s.replace(/（.*）$/,'')))||y.d!==r[4]; }).map(r=>r[0]);
  check('0. 第 2 節：18 組（在哪裡、什麼時候、誰、對話）和稿一樣',r2.length===18&&t2.length===18&&!b2.length,J(b2));
  const r3=rows('## 3.'), t3=D?D.GE:[], b3=r3.filter(r=>{ const y=t3.find(q=>q.n===+r[0]), [ph,w]=r[1].split('、'), cs=r[2].replace(/`/g,'').replace(/（.*）$/,''); return !y||y.ph!==(ph==='上課前'?'pre':'post')||y.when!==w||y.course!==cs||J(y.who)!==J(r[3].replace(/（[^）]*）$/,'').split('、'))||y.d!==r[4]; }).map(r=>r[0]);
  check('0. 第 3 節：11 組（上課前／下課後、週次、課、誰、對話）和稿一樣',r3.length===11&&t3.length===11&&!b3.length,J(b3));
  const r4=rows('## 4.'), t4=D?D.LAW:[], b4=r4.filter(r=>{ const y=t4.find(q=>q.n===+r[0]), [ph,w]=r[1].split('、'); return !y||y.ph!==(ph==='上課前'?'pre':'post')||y.when!==w||y.d!==r[2]; }).map(r=>r[0]);
  check('0. 第 4 節：5 組和稿一樣',r4.length===5&&t4.length===5&&!b4.length,J(b4)); }
// ---------- 1. 抽系照地點 ----------
const W5=termDay('Y1S1',5,2), W1=termDay('Y1S1',1,2), W8=termDay('Y1S1',8,2), W16=termDay('Y1S1',16,2), BRK=dayOf('2026-01-20'), Y0W4=termDay('Y0S1',4,2);   /* 經濟系那一年第 3 週的週二是中秋：用第 4 週 */
check('1. 測試用的日子都找得到（大一上第 1、5、8、16 週的週二、寒假、經濟系那一年第 4 週的週二）',[W1,W5,W8,W16,Y0W4].every(d=>d!=null)&&CALENDAR.termOf(Y0W4).id==='Y0S1'&&!CALENDAR.termOf(BRK),J([W1,W5,W8,W16,BRK,Y0W4]));
await blk('1. 抽系照地點',async()=>{
{ const ids=(day,z)=>C.deptPool(mkG(day,14,z),z).map(d=>d.id), want=pl=>D.DEPTS.filter(d=>d.at.includes(pl)).map(d=>d.id);
  check('1. 椰（校園）、館（公館）、體（體育館三層）、圖（社科圖）：照「在哪裡」那一欄',J(ids(W5,'campus'))===J(want('椰'))&&J(ids(W5,'gongguan'))===J(want('館'))&&['gym','gym_b1','gym_arena'].every(z=>J(ids(W5,z))===J(['電機','醫學']))&&J(ids(W5,'soclib'))===J(want('圖').filter(i=>i!=='圖資')),J([ids(W5,'campus'),ids(W5,'gongguan'),ids(W5,'gym'),ids(W5,'soclib')]));
  check('1. 圖資只在總圖（總圖大廳、3F 閱覽區有；社科圖沒有）；不在表上的地方（溫州街、霖澤館、法圖）沒有系',ids(W5,'library_hall').includes('圖資')&&ids(W5,'library').includes('圖資')&&!ids(W5,'soclib').includes('圖資')&&!ids(W5,'wenzhou').length&&!ids(W5,'linze').length&&!ids(W5,'lawlib').length);
  check('1. 寒暑假：只出寫了「寒暑假」那一欄的系（椰＝經濟、農藝；館、圖＝經濟；體育館沒有）',J(ids(BRK,'campus'))===J(['經濟','農藝'])&&J(ids(BRK,'gongguan'))===J(['經濟'])&&J(ids(BRK,'library_hall'))===J(['經濟'])&&!ids(BRK,'gym').length,J([ids(BRK,'campus'),ids(BRK,'gongguan')]));
  const G=mkG(W5,14,'campus'), n=C.deptPool(G,'campus').length, a=[...Array(n)].map((_,k)=>C.deptPick(G,'campus','walk',k).id), b=[...Array(n)].map((_,k)=>C.deptPick(G,'campus','walk',k).id);
  const days=[1,2,3].map(k=>J([...Array(n)].map((_,i)=>C.deptPick(mkG(W5+k,14),'campus','walk',i).id)));
  check('1. 同一群人：前 '+n+' 個人各是不同的系（先輪一遍）、第 '+(n+1)+' 個人從頭；同一天算兩次一樣；別天換順序',uniq(a)&&a.length===n&&C.deptPick(G,'campus','walk',n).id===a[0]&&J(a)===J(b)&&days.some(x=>x!==J(a)),a.slice(0,6).join('、')); }
});
// ---------- 2. 時段欄、旁白、性別 ----------
await blk('2. 時段欄、旁白、性別',async()=>{
{ const col=(d,h)=>C.deptCol(mkG(d,h));
  check('2. 時段：開學第 1 週 14:00／20:00＝開學、第 5 週 14:00＝平常、20:00 和凌晨 3:00＝晚上、期中第 8 週＝考試（晚上也是）、期末第 16 週＝考試、寒假 14:00／20:00＝寒暑假',
    col(W1,14)==='開學'&&col(W1,20)==='開學'&&col(W5,14)==='平常'&&col(W5,20)==='晚上'&&col(W5,27)==='晚上'&&col(W8,14)==='考試'&&col(W8,20)==='考試'&&col(W16,10)==='考試'&&col(BRK,14)==='寒暑假'&&col(BRK,20)==='寒暑假',
    J([col(W1,14),col(W1,20),col(W5,14),col(W5,20),col(W5,27),col(W8,14),col(W8,20),col(W16,10),col(BRK,14),col(BRK,20)]));
  const GM=mkGM(mkG(W5,20)), d=byId('醫學'), l=C.deptLine(GM,d,'m');
  check('2. 那個系沒寫的欄用平常（醫學系沒有「晚上」：晚上說平常那一句）',linesOf('醫學','平常').includes(l),l);
  const st=C.deptSteps(byId('電機').L['平常'][1],'電機系的學生');
  check('2. 旁白先出、再出那一句（說話的人＝電機系的學生，句子不含外面的「」）',J(st)===J([{who:null,t:'（他邊走邊講電話）'},{who:'電機系的學生',t:'板子放在你桌上了。……那顆電容是新的，這次不要再燒掉。'}]),J(st));
  const got={m:new Set(),f:new Set()}; for(let v=0;v<6;v++){ const g=mkGM(mkG(W5,14)); g.G.flags={deptHear:{'電機:平常':v%2}}; for(const sx of ['m','f']){ const x=C.deptLine(g,byId('電機'),sx); if(x) got[sx].add(x); } }
  const sw=['社工','心理'].every(id=>{ const L=linesOf(id,'平常'), she=L.find(t=>/^（她/.test(t)); const g=mkGM(mkG(W5,14)); g.G.flags={deptHear:{[id+':平常']:L.indexOf(she)}}; return C.deptLine(g,byId(id),'m')!==she&&C.deptLine(g,byId(id),'f')===she; });
  check('2. 旁白寫「他」的只給男生（電機的講電話那句女生不會拿到）、寫「她」的只給女生（社工、心理）',got.m.has(linesOf('電機','平常')[1])&&!got.f.has(linesOf('電機','平常')[1])&&got.f.size===1&&sw,J([[...got.m],[...got.f]])); }
});
// ---------- 3. 輪法 ----------
await blk('3. 輪法',async()=>{
{ const G=mkG(W5,14), L=linesOf('電機','平常'), K=linesOf('電機','考試'), visit=()=>{ const g=mkGM(G); return [C.deptLine(g,byId('電機'),'m'),C.deptLine(g,byId('電機'),'m'),C.deptLine(g,byId('電機'),'m')]; };
  const v1=visit(), v2=visit(), v3=visit();
  check('3. 同一次進來不重複、句子用完了其他人不說（電機平常兩句：第三個人沒有）',v1[0]&&v1[1]&&v1[0]!==v1[1]&&v1[2]===null&&L.includes(v1[0])&&L.includes(v1[1]),J(v1));
  check('3. 下一次進來從下一句開始（第二次第一個人說第二句、第三次輪回第一句；G.flags.deptHear）',v2[0]===v1[1]&&v3[0]===v1[0]&&!!G.flags.deptHear&&G.flags.deptHear['電機:平常']!=null,J([v1[0],v2[0],v3[0]]));
  const g=mkGM(mkG(W8,14)); check('3. 考試週：電機考試那一欄只有一句＝一個人說，下一個電機系的不說',C.deptLine(g,byId('電機'),'m')===K[0]&&C.deptLine(g,byId('電機'),'f')===null); }
});
// ---------- 4. 校園 ----------
check('4. story3d.js 的 walkRoutes 讀得到（校園、公館）',!!WR&&!!WR.campus&&!!WR.gongguan);
await blk('4. 校園',async()=>{
{ const G=mkG(W5,14,'campus'), GM=enter('campus',G,16), pool=C.deptPool(G,'campus').map(d=>d.id), all=E.npcs.filter(n=>n.isExtra&&!n.crowd);
  const named=all.filter(n=>deptOf(n)), {ppl,ids}=pairOf();
  check('4. 校園 16 個走路的人：每個人都有系（名字＝X系的學生，系在「椰」那一欄）',all.length===16&&named.length===16&&named.every(n=>pool.includes(deptOf(n))&&n.dept===deptOf(n)),all.length+' 人：'+named.slice(0,6).map(n=>n.name).join('、'));
  const sg=all.filter(n=>!n.deptTalk), sd=sg.map(deptOf);
  check('4. 一個人一句的人：前面的人各是不同的系（不會一整群都是同一個系）',uniq(sd.slice(0,Math.min(sd.length,pool.length))),sd.join('、'));
  const withL=sg.filter(n=>n.talk), okL=withL.every(n=>linesOf(deptOf(n),'平常').includes(n.deptLine)&&n.talkLabel==='聽一句'&&(!C.deptSex(n.deptLine)||C.deptSex(n.deptLine)===C.npcSex(n)));
  check('4. 點得到的人（聽一句）說的是自己的系平常那一欄的句子、性別對；句子用完的系，多的人不說',withL.length>=8&&okL&&sg.filter(n=>!n.talk).every(n=>!n.deptLine),withL.length+' 人有句子');
  const w=withL.find(n=>C.deptSteps(n.deptLine,'').length===2)||withL[0], ri0=w.ri, tgt=w.waypoints[(ri0+1)%w.waypoints.length]; w.ri=(ri0+1)%w.waypoints.length; E.moveTo(w,tgt[0],tgt[1],null,tgt[2]);   /* 讓他走在路上：正往下一個點走 */
  const goingTo=w.waypoints[w.ri]; let during=null; const say0=GM.say; GM.say=async(who,t)=>{ if(!during) during={path:w.path,timer:w.timer,speed:w.speed,face:w.faceYaw}; await say0(who,t); };
  const heard=await tap(w); GM.say=say0; const exp=C.deptSteps(w.deptLine,w.name).map(s=>({who:s.who,t:s.t}));
  check('4. 點了：旁白先出、再出那一句，說話的人＝他的系（'+w.name+'）',J(heard)===J(exp)&&heard[heard.length-1].who===w.name,J(heard));
  check('4. 走路的人點了先停下來（沒有路線、不走）、面向你；說完再繼續走（往原本要去的那一點）',!!during&&!during.path&&during.timer>1e6&&during.face!=null&&w.timer<1&&w.beh==='route'&&w.waypoints[(w.ri+1)%w.waypoints.length]===goingTo,J({during:during&&{p:!!during.path,t:during.timer},after:{t:w.timer,ri:w.ri}}));
  /* 兩個人一起走的對話 */
  const c=ppl.length?conv('TALKS',+ids[0].slice(1)):null;
  check('4. 兩個人的對話：同時只有一組、在「椰」、平常（第 1、3、10、18 組之一；沒下雨＝1、3、10）',ids.length===1&&!!c&&c.at==='椰'&&[1,3,10].includes(c.n)&&ppl.length===c.who.length,J(ids));
  if(c){ const [a,b]=ppl[0].beh==='buddy'?[ppl[1],ppl[0]]:[ppl[0],ppl[1]];
    check('4. 兩個人一起走：第二個人跟著第一個（buddy）、在他旁邊站得住的地方；名字照那一組的系',b.beh==='buddy'&&b.buddy===a&&a.beh==='route'&&Math.hypot(a.obj.position.x-b.obj.position.x,a.obj.position.z-b.obj.position.z)<1.3&&E.canStand(b.obj.position.x,b.obj.position.z,0.3,0)&&a.name===c.who[0]+'系的學生'&&b.name===c.who[1]+'系的學生');
    let objs=[]; const s1=GM.say; GM.say=async(who,t)=>{ objs.push(who&&who.obj); await s1(who,t); }; const h=await tap(b); GM.say=s1;
    check('4. 點其中一個人：整段照順序出、A 是第一個人說、B 是第二個人說',J(h)===J(stepsOf(c,c.who.map(x=>x+'系的學生')))&&objs.every((o,i)=>o===(c.d.split('／')[i][0]==='A'?a.obj:b.obj)),J(h));
    check('4. 聽完：兩個人都不能再點、今天記下來（G.flags.deptTalkDay）',!a.talk&&!b.talk&&G.flags.deptTalkDay&&G.flags.deptTalkDay['t'+c.n]===G.day);
    const GM2=enter('campus',G,16), p2=pairOf(); check('4. 同一天再進來：不會再放同一段（換別的一段）',p2.ids.length===1&&p2.ids[0]!=='t'+c.n,J(p2.ids));
    const G3=mkG(W5,14,'campus',{weather:'rain'}); const L3=C.deptTalksAt(G3,'椰','campus').map(x=>x.n); check('4. 下雨的平常：第 18 組（物理、化學擠在一把傘下）也會出',L3.includes(18)&&!C.deptTalksAt(G,'椰','campus').some(x=>x.n===18),J(L3)); }
  /* 不擋出口 */
  const exit=E.interactables.find(it=>it.exit&&!it.hidden), one=E.npcs.find(n=>n.talk&&n.yieldIt&&n.beh==='route');
  if(exit&&one){ E.player.lv=0; E.player.obj.position.set(exit.x,0,exit.z); one.obj.position.set(exit.x+0.3,0,exit.z); const near=E.nearestInteractable();
    let far=null; for(let k=0;k<400&&!far;k++){ const x=-110+k*0.5, z=-7; E.player.obj.position.set(x,0,z); if(E.interactables.some(it=>!it.hidden&&Math.hypot(it.x-x,it.z-z)<(it.radius||1.8)+0.1)) continue; one.obj.position.set(x+0.5,0,z); const r=E.nearestInteractable(); if(r&&r.npc===one) far=r; }
    check('4. 走路的人走到出口旁邊：按鈕還是「'+exit.label+'」（不擋）；旁邊沒有互動點時才是「聽一句」',!!near&&near===exit&&!!far&&far.label==='聽一句',J([near&&near.label,far&&far.label]));
    let nm=null; if(far){ const P=E.player.obj.position, an=E.addNPC({obj:CHAR.build({id:'an',sex:'f'}),name:'沈以安',talk:()=>{},talkLabel:'和小安說話',lv:0}); an.obj.position.set(P.x-1.6,0,P.z); one.obj.position.set(P.x+0.4,0,P.z); nm=E.nearestInteractable(); E.removeNPC(an); }
    check('4. 走路的人比有名字的同學近：按鈕還是「和小安說話」（路人最後才算）',!!nm&&nm.label==='和小安說話',nm&&nm.label); }
  else check('4. 校園有出口、有點得到的走路的人',false); }
});
// ---------- 5. 公館 ----------
await blk('5. 公館',async()=>{
{ const G=mkG(W5,14,'gongguan'); enter('gongguan',G,12); const pool=C.deptPool(G,'gongguan').map(d=>d.id), all=E.npcs.filter(n=>n.isExtra&&!n.crowd&&n.beh!=='idle'), {ids}=pairOf();
  check('5. 公館的走路的人：都是「館」的系（資工、外文、經濟、社工、獸醫、戲劇、會計）；兩個人的對話是館的平常那幾組（9、12）',all.length===12&&all.every(n=>pool.includes(deptOf(n)))&&ids.length===1&&['t9','t12'].includes(ids[0]),J([all.map(deptOf).join('、'),ids]));
  const at=(d,h)=>C.deptTalksAt(mkG(d,h),'館','gongguan').map(x=>x.n);
  check('5. 公館晚上＝第 8 組；考試週的晚上＝第 16 組（宵夜滷味）；考試週白天（沒寫）用平常那幾組；寒假沒有',J(at(W5,20))===J([8])&&J(at(W8,20))===J([16])&&J(at(W8,14))===J([9,12])&&J(at(BRK,14))==='[]',J([at(W5,20),at(W8,20),at(W8,14),at(BRK,14)])); }
});
// ---------- 6. 圖書館 ----------
await blk('6. 圖書館',async()=>{
{ const G=mkG(W5,14,'library_hall'), GM=enter('library_hall',G,0), {ppl,ids}=pairOf(), c=ids.length?conv('TALKS',+ids[0].slice(1)):null;
  const sat=ppl.every(n=>n.seat&&(n.pose==='read'||n.pose==='sit')), dx=ppl.length===2?Math.hypot(ppl[0].seat.x-ppl[1].seat.x,ppl[0].seat.z-ppl[1].seat.z):0;
  check('6. 總圖大廳平日下午：兩個人一起坐在相鄰的空位（同一排、隔 0.8～1.75 m），第 5 組（歷史、歷史，小聲）',!!c&&c.n===5&&ppl.length===2&&sat&&dx>0.8&&dx<1.75&&ppl.every(n=>n.name==='歷史系的學生'),J({ids,dx:+dx.toFixed(2)}));
  if(c){ const h=await tap(ppl[0]); check('6. 點了：整段（「（小聲）」照稿放在那一句前面）',J(h)===J(stepsOf(c,['歷史系的學生','歷史系的學生']))&&h[0].t==='（小聲）這本日文的，你看得懂嗎？',J(h)); }
  const G2=mkG(W5,21+40/60,'library_hall'), GM2=enter('library_hall',G2,0), p2=pairOf(), c2=p2.ids.length?conv('TALKS',+p2.ids[0].slice(1)):null;
  const A=p2.ppl.find(n=>n.name==='圖資系的學生'), B=p2.ppl.find(n=>n.name==='經濟系的學生');
  check('6. 總圖閉館前 30 分鐘（21:40）：第 15 組——圖資系的學生（工讀）站在座位旁邊、面向坐著的經濟系的學生',!!c2&&c2.n===15&&!!A&&!!B&&!A.seat&&!!B.seat&&Math.hypot(A.obj.position.x-B.seat.x,A.obj.position.z-B.seat.z)<1.2&&Math.cos(A.obj.rotation.y-Math.atan2(B.seat.x-A.obj.position.x,B.seat.z-A.obj.position.z))>0.95&&E.canStand(A.obj.position.x,A.obj.position.z,0.3,A.lv|0),J(p2.ids));
  if(c2){ const h=await tap(B); check('6. 點了：「同學，要閉館了。」那一段，A＝圖資系的學生、B＝經濟系的學生',J(h)===J(stepsOf(c2,['圖資系的學生','經濟系的學生'])),J(h)); }
  const L=C.deptTalksAt(mkG(W5,21+40/60),'圖','soclib').map(x=>x.n), G4=mkG(W5,14,'soclib'); enter('soclib',G4,0); const p4=pairOf();
  check('6. 社科圖：沒有第 15 組（圖資只在總圖），閉館前用平常那一組；平日下午也有兩個人一起坐的對話',!L.includes(15)&&J(L)===J([5])&&p4.ids.length===1&&p4.ppl.every(n=>n.seat),J([L,p4.ids]));
  /* 劇情寫死的位子：總圖大廳 seats[0]、[1]（小安「總圖的下午」）、社科圖 seats[16]（r3_3d.js SK12）——一個月裡每天都不會被坐走 */
  const hit=[]; for(const [z,keep] of [['library_hall',[0,1]],['soclib',[16]]]){ build(z); const seats=E.zone.seats; for(let d=W5;d<W5+30;d++){ const GM=mkGM(mkG(d,14,z)); for(const st of [false,true]){ const r=C.deptSeatPair(GM,z,st)||[]; for(const s of r) if(s&&keep.some(i=>seats[i]===s)) hit.push(z+'@'+d); } } }
  check('6. 劇情寫死的位子（總圖大廳 0、1 號＝小安「總圖的下午」；社科圖 16 號）不會被兩個人的對話坐走',!hit.length,J(hit.slice(0,4))); }
});
// ---------- 7. 教學館門口 ----------
const findCls=(term,id,week)=>{ for(let d=-420;d<1700;d++){ const t=CALENDAR.termOf(d); if(!t||t.id!==term||t.week!==week) continue; const G=mkG(d,12,'campus',term[1]==='0'?{stage:'econ'}:{}); const it=CLS.dayItems(G).find(q=>q.c.id===id); if(it) return {day:d,it}; } return null; };
const door=async(term,id,week,ph,o)=>{ const f=findCls(term,id,week); if(!f) return null; const zone=f.it.room.zone, G=mkG(f.day,ph==='pre'?f.it.t0-0.3:f.it.t1+0.05,zone,Object.assign(term[1]==='0'?{stage:'econ'}:{},o||{}));
  enter(zone,G,0); const spot=zone+'_'+f.it.room.room, grp=E.npcs.filter(n=>n.crowd===spot), {ppl,ids}=pairOf(); return {f,G,grp,ppl,ids,spot}; };
await blk('7. 教學館門口',async()=>{
{ const r=await door('Y1S1','ge_film_y1s1',3,'pre'), names=r?r.grp.map(n=>n.name):[];
  check('7. 通識（電影與敘事，普通 101）上課前第 3 週：門口的人都有系、各系混著（不是都同一系、沒有圖資）',!!r&&r.grp.length>=3&&names.every(x=>/系的學生$/.test(x))&&new Set(names).size>=2&&!names.includes('圖資系的學生'),J(names));
  const c=r&&r.ids.length?conv('GE',+r.ids[0].slice(1)):null, last=r?r.grp.slice(-2):[];
  check('7. 第 3 節的對話（平常：第 3 組電影、第 4 組通識）；是最後走進去的兩個人、其他人不能點',!!c&&[3,4].includes(c.n)&&r.ppl.length===2&&last.every(n=>r.ppl.includes(n))&&r.grp.filter(n=>!r.ppl.includes(n)).every(n=>!n.talk),J(r&&r.ids));
  if(c){ const h=await tap(r.ppl[0]); check('7. 點了：整段，名字照那一組的系',J(h)===J(stepsOf(c,c.who.map(x=>x+'系的學生'))),J(h)); }
  const w1=await door('Y1S1','ge_film_y1s1',1,'pre'), w6=await door('Y1S1','ge_film_y1s1',6,'pre'), w14=await door('Y1S1','ge_film_y1s1',14,'post'), p3=await door('Y1S1','ge_film_y1s1',3,'post');
  check('7. 第 1 週＝第 1、2 組；第 6 週＝第 6 組（三個人：電機、獸醫、法律）；下課後平常＝第 8、10 組；第 14 週下課後＝第 9 組',!!w1&&['g1','g2'].includes(w1.ids[0])&&!!w6&&J(w6.ids)==='["g6"]'&&w6.ppl.length===3&&J(w6.ppl.map(n=>n.name))===J(['電機系的學生','獸醫系的學生','法律系的學生'])&&!!p3&&['g8','g10'].includes(p3.ids[0])&&!!w14&&J(w14.ids)==='["g9"]',
    J([w1&&w1.ids,w6&&w6.ids,p3&&p3.ids,w14&&w14.ids]));
  const L=await door('Y1S1','econ_principles_1',3,'pre'), Ln=L?L.grp.map(n=>n.name):[];
  check('7. 法律系必修（大一經濟學原理，普通 101）上課前：門口的人全部是「法律系的學生」、第 4 節平常那一組（第 2 組）',!!L&&L.grp.length>=2&&Ln.every(x=>x==='法律系的學生')&&J(L.ids)==='["l2"]',J([Ln,L&&L.ids]));
  if(L&&L.ppl.length){ const h=await tap(L.ppl[1]); check('7. 點了：「你判決看了嗎？」那一段，兩個人都是法律系的學生',J(h)===J(stepsOf(conv('LAW',2),['法律系的學生','法律系的學生'])),J(h)); }
  const L1=await door('Y1S1','econ_principles_1',1,'pre'), L7=await door('Y1S1','econ_principles_1',7,'pre'), Lp=await door('Y1S1','econ_principles_1',3,'post');
  check('7. 法律系必修：第 1 週＝第 1 組、考試前一週（第 7 週）＝第 4 組（法典）、下課後＝第 3、5 組',!!L1&&J(L1.ids)==='["l1"]'&&!!L7&&J(L7.ids)==='["l4"]'&&!!Lp&&['l3','l5'].includes(Lp.ids[0]),J([L1&&L1.ids,L7&&L7.ids,Lp&&Lp.ids]));
  const jp=await door('Y2S1','japanese_1',3,'pre'); check('7. 選修（日文，共同 102）門口照舊：沒有系、不能點',!!jp&&jp.grp.length>=2&&jp.grp.every(n=>!n.name&&!n.talk),jp?jp.grp.length+' 人':'找不到日文課'); }
});
// ---------- 8. 體育館 ----------
await blk('8. 體育館',async()=>{
{ const TUE=termDay('Y1S1',4,2), SAT=termDay('Y1S1',4,6), H=C.GYM_HEAR, role=r=>E.npcs.filter(n=>n.crowd&&/^gym_/.test(n.crowd)&&n.crowdRole===r);
  let gotW=null; const seenB=[], GB=mkG(TUE,12.6,'gym'); for(let v=0;v<3;v++){ enter('gym',GB);   /* 同一局（同一個 G）進來三次 */ const b=role('badminton').filter(n=>n.hear); seenB.push(b.map(n=>n.hear.t)); const w=b.find(n=>n.hear.t===H.badminton.L[2]); if(w) gotW=w; }
  check('8. 1F 羽球場：三句一起輪（每次進來第一句換下一句）；說「剛剛那顆，我們系的規則是界內。」的人＝外文系的學生（名字、說話的人）',new Set(seenB.map(s=>s[0])).size===Math.min(3,seenB.length)&&!!gotW&&gotW.name==='外文系的學生'&&gotW.hear.who==='外文系的學生'&&(await tap(gotW))[0].who==='外文系的學生',J(seenB));
  let chem=null, med=null; const GA=mkG(SAT,15.5,'gym_arena'); for(let v=0;v<3;v++){ enter('gym_arena',GA); for(const n of role('basketball').concat(role('rest'))){ if(n.hear&&n.hear.who==='化學系的學生') chem=n; if(n.hear&&n.hear.who==='醫學系的學生') med=n; } }
  check('8. 3F：籃球場「明天系盃。我們只求不要輸太多。」＝化學系的學生、場邊「我們系每次比賽都來好多人，加油的比打球的多。」＝醫學系的學生',!!chem&&chem.hear.t===H.basketball.L[2]&&!!med&&med.hear.t===H.rest.L[1]);
  enter('gym',mkG(TUE,12.6,'gym')); const lob=role('walker').concat(role('bench')), sp=E.npcs.filter(n=>n.deptTalk);
  check('8. 1F 大廳散步的人、長椅上的人：「體」的系（電機、醫學），有句子的說自己的系那一句',lob.length>=2&&lob.every(n=>['電機系的學生','醫學系的學生'].includes(n.name))&&lob.filter(n=>n.talk).every(n=>linesOf(n.dept,'平常').includes(n.deptLine)),J(lob.map(n=>n.name+(n.talk?'＋':''))));
  const c=sp.length?conv('TALKS',+sp[0].deptTalk.slice(1)):null;
  check('8. 1F 場邊的長椅：兩個人一起坐、第 7 組或第 14 組（體、平常），名字照那一組',!!c&&[7,14].includes(c.n)&&sp.length===2&&sp.every(n=>n.seat&&n.seat.x>18&&n.pose==='sit')&&J(sp.map(n=>n.name))===J(c.who.map(x=>x+'系的學生')),J(sp.map(n=>n.name)));
  if(c){ const h=await tap(sp[0]); check('8. 點了：整段',J(h)===J(stepsOf(c,c.who.map(x=>x+'系的學生'))),J(h)); }
  enter('gym',mkG(BRK,14,'gym')); const lb=role('walker').concat(role('bench'));
  check('8. 寒假：體育館大廳的人沒有系（寒暑假只出寫了寒暑假的系，「體」沒有）、場邊沒有對話',lb.every(n=>!n.name&&!n.talk)&&!E.npcs.some(n=>n.deptTalk),String(lb.length)); }
});
// ---------- 9. 經濟系那一年 ----------
await blk('9. 經濟系那一年',async()=>{
{ const G=mkG(Y0W4,14,'campus',{stage:'econ'}); enter('campus',G,10); const all=E.npcs.filter(n=>n.isExtra&&!n.crowd), pool=C.deptPool(G,'campus').map(d=>d.id);
  check('9. 經濟系那一年（大一上第 4 週）：校園的走路的人一樣有系（有經濟系的人可以出現）、有句子',all.length===10&&all.every(n=>pool.includes(deptOf(n)))&&pool.includes('經濟')&&all.filter(n=>n.talk).length>=6,all.map(deptOf).join('、'));
  const g=await door('Y0S1','chinese_y0',4,'pre'), e=await door('Y0S1','econ_principles_y0',4,'pre');
  check('9. 經濟系那一年：通識（大一國文，博雅 101）門口照第 3 節（各系混著、有對話）；經濟系必修（經濟學原理）門口照舊（沒有系、不能點）',!!g&&g.ids.length===1&&/^g/.test(g.ids[0])&&g.grp.every(n=>/系的學生$/.test(n.name))&&!!e&&e.grp.length>=2&&e.grp.every(n=>!n.name&&!n.talk),J([g&&g.ids,e&&e.grp.length])); }
});
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });
