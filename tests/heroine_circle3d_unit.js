// 女主角的圈子在 3D（HEROINE-CIRCLE3D-1028；AA_503 @ d13ab3ab7 第 2 節、第 11 節第 2、3 點＋AA_503～508 各位那一節的「x-1 圈子」表；
// 使用者 2026-10-28 01:2x「可攻略女主角 感覺都沒有自己的生活」，USER_WANTS X122★）——不需要瀏覽器。src/data/heroine_circle.js（資料）、src/hcircle3d.js（HCIRCLE）。
//   0  載得到、index.html 順序；對稿雙向：六份稿（git show）的圈子表每一列都在遊戲資料裡（同一個位置、「走近時聽到」一字不差；照現有那幾格標 ref），
//      遊戲資料的每一列都在稿裡、每一句都在稿裡；說明裡的三句（以安 Café 的旁白、阿凱「所以妳回絕了」、陳助教「送出去了？」）也在；說話的人都對得到人物
//   1  作息：補的那幾筆放在她 daily_schedule 最前面（帶 with、hc）；每一列在它的學期週次日期裡找得到成立的時候（她照作息在那一區）；
//      那時候人物同伴照 schedEnt 也在那一區（不在那一區的＝跟著她的那一筆，hc＝那一列）；「一定同框」每一天都成立、其他的約 70%（同一天一樣）；
//      表外的時間照舊（全部人物、一段日子逐時比對：沒有成立的列、補的作息沒有作用的時候，schedEnt 和沒有這個模組時一樣）
//   2  真的生出來（story3d.js refreshSchedule → populateSchedule，同 tests/aa498_pool_unit.js）：她和人物同伴都生在那一區；HCIRCLE.arrange 以後站在一起
//      （走路＝buddy、坐著＝旁邊的空位、站著＝旁邊）；標籤同伴（小婷、阿姨、學姊的同學…）生出來、固定底模、Café／麵店原本的店員藏起來，那一列結束拿掉、店員回來；
//      一個人的列不和別人配對（pairUp 跳過）；必修課上課前以安坐到曾靖雯旁邊；大道上的以安（舊的劇情人物）走到萬才館門口站好
//   3  走近聽到：5 m 內、同伴在旁邊才出字幕，照稿的順序和說話的人；一列一天一次、隔天再一次；once 的列整個存檔一次；必修課那幾列只在上課以前
//   4  找她說話：沒聽到的先在對話框演、再照常說話；第一次在同伴旁邊＝介紹——二十位同學只換名牌（AA_528 1-3，2026-10-30：不記 FIRST_MET、熟悉不加），
//      他們自己的第一場照演（原本在這裡就認識、之後不演）；其他人只記下介紹過
//   5  旁邊有人：同伴在旁邊＝不出「約她去…」、priv（告白）選項，交換聯絡方式照常；同伴不在＝照常
//   6  其他：標籤同伴的底模都在 ASSETS、性別對、不和二十位同學撞、彼此不重複；story3d.js、multirel3d.js 的掛勾
// 修改前（開發分支 ff9f54209 的乾淨 checkout（git worktree --detach）放進這支測試實際跑，2026-10-28）：FAILED 13、PASS 2
//   （PASS＝六份稿讀得到、稿上的表一共 90 列；FAIL＝0 載入與 index.html、稿→遊戲、ref、遊戲→稿 4 項，1～5 各 1 項「沒有 HCIRCLE」，
//    6 標籤同伴、story3d.js 掛勾、multirel3d.js priv、白名單 note 4 項）。修改後 ALL PASS（50 項）。
// 第二輪（CIRCLE3D-Y4-1028）：大四 AA_509、AA_510 @ 28f981438（白名單上的那一版）加進對稿（八份、102 列）；
//   7  大四：以安坐到語彤背後那一桌（comp behind）、只有旁白的同框列要同伴在旁邊、總圖門口的媽媽（spot：走到門口 5 m 內、第 10 週起週四 18:00 前後、一天一次）、
//      語彤的法律課、子晴 6/28 起週五公館和阿凱一起走（畢業以後篇照樣成立）、學姊 12/23 以後（寒假）、5/29 以後週五和陳助教；story3d.js 的 offerInvite 問 STORY.privNow
//   修改前（開發分支 c701f8b5e：git archive 那一版的 src、tests、index.html、白名單，放進這支測試實際跑，2026-10-28）：FAILED 7、PASS 46
//   （FAIL＝稿→遊戲、ref、story3d.js 問 privNow、白名單 note、7 的兩列找不到成立的時候與例外）。修改後 ALL PASS（58 項）。
// 第三輪（PRIV-AAFIX-1028：AA_509 最後一節「實作時定的：大四的圈子」，企劃線 6bc3cd784）：
//   8  對稿（git show 6bc3cd784）；第 2 點學姊和陳助教 1/12 起、12/29 和 1/5 不排（那兩晚不在 3D）；第 3 點總圖門口照現在；第 4 點子晴騎樓延到 6/27、6/28 起換阿凱那一列；
//      第 5 點語彤暑假在麵店：進門坐長桌最裡面靠廚房、客人（站著的玩家、走進來的客人）＝站到長桌那一頭門口那一側、客人坐下＝坐回去、那一列結束走開
//   7 的學姊那一項改成 12/29、1/5 不成立；6 的 story3d.js 掛勾改成 offerInvite 問 S.privOk、COMPANY 回傳 id（S.companyOf）
//   修改前（開發分支 68944901f：git archive 那一版的 src、index.html、白名單，放進這支測試實際跑，對稿 PRIV_GIT_DIR＝這個 repo，2026-10-28）：FAILED 5、PASS 58
//   （FAIL＝6 的 story3d.js 掛勾、7 的學姊 12/29、8 的第 2、4、5 點；PASS＝8 的對稿、第 3 點照現在，其他原本的）。修改後 ALL PASS（63 項）。
// 第四輪（PRIV-AUNT-1028 第二輪：AA_503 第 14 節後補第 8、9 點，企劃線 f6069e42d——白名單上 AA_503 那一版）：
//   0  對稿多讀第 14 節後補第 9 點的表（| 學期 | 走近時聽到 |，五列：sec '14-後補9'）＝一共 107 列，雙向照舊
//   9  大二下以後每學期阿姨那一列（c503_14_1～5）：句子逐字、做法同 c503_6_2；每一學期週二 18:30（大二下、大三上週四也是）擲到＝成立、沒擲到＝不成立（她照樣顧店）、大三下起週四不成立；
//      大三上第 15 週週四（12/16 以後）不成立；寒暑假、畢業那年夏天、大五上下、大四下 4/24（阿姨第一次出國，dates 跳過 4/19～4/25）沒有；
//      廚房那位就是阿姨（3D）：語彤顧店、阿姨沒擲到＝店員也不在（auntOut）；擲到＝阿姨換掉店員；語彤不在、走開、約來吃的客人、17:00、20:36＝店員在；待在店裡時間跨過、語彤進出跟著變；店員先藏、阿姨後到＝交給阿姨
//   修改前（只拿掉這一次 src 的改動：git archive 這一版的 src、tests、index.html、白名單，把 src/hcircle3d.js、src/data/heroine_circle.js、src/eat3d.js、src/story3d.js、src/multirel3d.js、
//   src/data/multirel_lines.js、src/privtalk3d.js 換回開發分支 0c10b1b43，對稿 PRIV_GIT_DIR＝這個 repo，2026-10-28 實際跑）：FAILED 5、PASS 61
//   （FAIL＝0 稿→遊戲、ref〔後補第 9 點五列沒有〕、9 對稿、9 每一學期、9 例外〔沒有 c503_14_1〕；PASS＝原本的 61 項）。修改後 ALL PASS（69 項）
// AA_519（NPC-STORY2-1028，白名單上的那一版 d75cd0228）改的期待值：
//   0  3-4 新來的工讀生 2027-06-04 起叫小禾：稿→遊戲對 AA_508 2-1 第 1、2 列時把稿上的說話人「新來的工讀生」換「小禾」再比（另外檢查只換這兩列）；
//      2-3 6/16 週五公館和學姊那一列（c519_2_3）：遊戲→稿、句子在稿裡改成對 AA_519 那一節的引文（docOf），另外檢查四句一字不差
//   9  第 8 節第 1 點「語彤顧店的時段，阿姨一定在廚房」：沒擲到＝廚房那位（阿姨）照常在、不是 auntOut；原本「廚房沒有人」那兩項沒有刪，改成阿姨真的不在
//      （HCIRCLE.auntAway＝過年店休、出國那一週；這支測試沒有載那兩個模組，用 awayAs 強制）照原本的期待
// 用法：node tests/heroine_circle3d_unit.js
// 2026-10-28 AA_518 第 4-13 改的（企劃線 973dd1b74，SIS-B15-1028）：c504_5_1 從 3/23 起、c505_5_1 從第 4 週起、c506_5_1 到 5/3；5/4 起換新的一列 c506_5_1b（doc AA_518）——那一列不對 AA_503～510 的稿（tests/aa518_sis_b15_unit.js 對）。
'use strict';
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify;
/* 這次照的版本（任務指定、src/data/heroine_circle.js 的 SRC）；對稿用劇情匯入白名單上「現在」的版本——白名單換到 AA 更正以後的 commit 時，
   圈子表有改就會在這裡失敗（要照新版改資料），沒改就照樣過（2026-10-28 實測：開發分支 946fb1787 的白名單 AA_506 691a26400、AA_507 3120ac77a、
   AA_508 28f981438（＝4c3dc1491 那一版），三份的圈子表和 31a4c4002 一字不差，改的是動態、她自己的事、第 0 節；把這支測試放進那一版的試合併實際跑過 ALL PASS）。 */
const DOCS0={AA_503:['docs/story_planning/AA_503_女主角自己的生活_大一上_動態頁_圈子_她的事.md','d13ab3ab7'],AA_504:['docs/story_planning/AA_504_女主角自己的生活_大一下與暑假.md','62849944b'],
  AA_505:['docs/story_planning/AA_505_女主角自己的生活_大二上與寒假.md','795fbecfd'],AA_506:['docs/story_planning/AA_506_女主角自己的生活_大二下與暑假.md','31a4c4002'],
  AA_507:['docs/story_planning/AA_507_女主角自己的生活_大三上與寒假.md','31a4c4002'],AA_508:['docs/story_planning/AA_508_女主角自己的生活_大三下與暑假.md','31a4c4002'],
  AA_509:['docs/story_planning/AA_509_女主角自己的生活_大四上與寒假.md','28f981438'],AA_510:['docs/story_planning/AA_510_女主角自己的生活_大四下與畢業那年夏天.md','28f981438']};
const ALLOW=(()=>{ try{ return JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files||[]; }catch(e){ return []; } })();
const allowOf=k=>ALLOW.find(q=>q.path===DOCS0[k][0]);
const DOCS={}; for(const k in DOCS0){ const e=allowOf(k); DOCS[k]=[DOCS0[k][0],(e&&e.status==='approved'&&e.sha)?String(e.sha):DOCS0[k][1]]; }
const show=(sha,f)=>{ try{ return cp.execSync('git show '+sha+':"'+f+'"',{cwd:process.env.PRIV_GIT_DIR||H.ROOT,encoding:'utf8',maxBuffer:1<<24}); }catch(e){ return ''; } };   /* PRIV_GIT_DIR：在別的資料夾跑舊版時，對稿用這個 repo */
const DOC={}; for(const k in DOCS) DOC[k]=show(DOCS[k][1],DOCS[k][0]);
/* AA_519（NPC-STORY2-1028，白名單上的那一版；配角第二批）：3-4 新來的工讀生 2027-06-04 起叫小禾（AA_508 2-1 那兩列說話人改「小禾」）、2-3 6/16 週五公館和學姊那一列（c519_2_3）*/
const SPEC519='docs/story_planning/AA_519_配角第二批_麵店阿姨_陳助教_Café_黃筱涵_阿凱.md', E519=ALLOW.find(q=>q.path===SPEC519);
const SHA519=(E519&&E519.status==='approved'&&E519.sha)?String(E519.sha):'d75cd0228', DOC519=show(SHA519,SPEC519);
const REN519=DOC519.includes('圈子 `heroine_circle.js:196、197` 那兩列的說話人改「小禾」。')?new Set(['AA_508 2-1 1','AA_508 2-1 2']):new Set();
const heardOf=t=>REN519.has(t.doc+' '+t.sec+' '+t.k)?t.heard.split('新來的工讀生：').join('小禾：'):t.heard;   /* 稿上那一格照 AA_519 3-4 換說話人以後＝遊戲裡的「走近時聽到」*/
/* AA_519 那一節的引文（> 說話人：句子），用「／」接起來＝那一列的「走近時聽到」*/
const quote519=sec=>{ const L=DOC519.split('\n'), i=L.findIndex(l=>l.startsWith('### '+sec+'　')); if(i<0) return ''; const out=[]; for(let j=i+1;j<L.length;j++){ const l=L[j]; if(/^(### |## |---)/.test(l)) break; const m=/^\s*> (.+)$/.exec(l); if(m) out.push(m[1].trim()); else if(out.length) break; } return out.join('／'); };
/* 稿上的圈子表：{doc,sec:'4-1',k,heard,when,who,where}；說明（- 開頭）另外收 */
const TABLE=[], NOTES={};
for(const k in DOC){ let sec=null, on=false, n=0; for(const l of DOC[k].split('\n')){ let m;
    if((m=/^### (\d+)-1\. 圈子/.exec(l))){ on=true; sec=m[1]+'-1'; n=0; continue; } if(/^(### |## |---)/.test(l)){ on=false; continue; } if(!on) continue;
    if(/^\|/.test(l)&&!/^\|---/.test(l)&&!/^\| 什麼時候/.test(l)){ const c=l.trim().replace(/^\||\|$/g,'').split('|').map(s=>s.trim()); n++; TABLE.push({doc:k,sec,k:n,when:c[0],who:c[1],where:c[2],heard:c[3]}); }
    else if(/^\s*-/.test(l)) (NOTES[k+' '+sec]||(NOTES[k+' '+sec]=[])).push(l.trim()); } }
/* AA_503 第 14 節後補第 9 點（企劃線 f6069e42d；PRIV-AUNT-1028 第二輪）：大二下以後阿姨那幾列的「走近時聽到」（| 學期 | 走近時聽到 |，一學期一組）＝sec '14-後補9'、k＝第幾列；term＝那一學期 */
const B9TERM={'大二下':'Y2S2','大三上':'Y3S1','大三下':'Y3S2','大四上':'Y4S1','大四下':'Y4S2'};
{ let on=false, n=0; for(const l of (DOC.AA_503||'').split('\n')){ if(/^9\. \*\*第 8 點的範圍和走近聽到的句子\*\*/.test(l)){ on=true; continue; } if(!on) continue; if(/^(### |## |---|\d+\. )/.test(l)){ on=false; continue; }
    if(/^\|/.test(l)&&!/^\|---/.test(l)&&!/^\| 學期/.test(l)){ const c=l.trim().replace(/^\||\|$/g,'').split('|').map(s=>s.trim()); n++; TABLE.push({doc:'AA_503',sec:'14-後補9',k:n,when:c[0],who:'阿姨',where:'麵店',heard:c[1],term:B9TERM[c[0]]||null}); } } }
const REF=new Set(['照現有','照現有讀書會','照 2-1','照 `AA_506` 4-1','照 1-1 第二列','照 1-1']);
const loadG=(f,names)=>{ let s=fs.readFileSync(path.join(H.ROOT,f),'utf8'); for(const n of names) s=s.replace(new RegExp('^const '+n+'\\s*=','m'),'globalThis.'+n+'='); vm.runInThisContext(s,{filename:f}); };
const errs=[];
const SCHED0={};
for(const [f,n] of [['src/sideq3d.js',['SIDEQ']],['src/data/pool_story.js',['POOL_STORY']],['src/pool3d.js',['POOL']],['src/data/heroine_circle.js',['HCIRCLE_DATA']],['src/hcircle3d.js',['HCIRCLE']]]){
  if(f==='src/data/heroine_circle.js') for(const id in CHARACTERS) SCHED0[id]=(CHARACTERS[id].daily_schedule||[]).slice();   /* 修改前的作息（表外照舊用）：二十位同學接好、圈子模組載入以前抄一份 */
  try{ if(fs.existsSync(path.join(H.ROOT,f))) loadG(f,n); else errs.push('沒有 '+f); }catch(e){ errs.push(f+'：'+(e&&e.message||e)); } }
const HAS=()=>typeof HCIRCLE!=='undefined'&&!!HCIRCLE.ROWS;
const HD=()=>typeof HCIRCLE_DATA!=='undefined'?HCIRCLE_DATA:{ROWS:[],PEOPLE:{},NAMES:{},SCHED:[]};
const sec=async(name,fn)=>{ try{ await fn(); }catch(e){ check(name+'（例外）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' | ').slice(0,300)); } };
const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
const wdOf=d=>CALENDAR.dateOf(d).wd%7;
const TD=(t,w,wd)=>STORY.termDay(t,w,wd===0?7:wd);
const DK=k=>STORY.dayOfKey(k);
const set=(d,h,zone)=>{ H.G.day=d; H.G.hour=h; H.G.weekday=wdOf(d); if(zone) H.G.zone=zone; };
const fresh=(d,h,zone,flags)=>{ const G=H.fresh(CALENDAR.dateOf(d).key,h,zone||'campus',Object.assign({EXCHANGE_ROUTE:'TW',afternoonDone:true},flags||{})); G.weekday=wdOf(d); G.hour=h; if(!G.contacts) G.contacts={}; if(!Array.isArray(G.outings)) G.outings=[]; G.invites=[]; return G; };
const ent=id=>STORY.schedEnt(CHARACTERS[id],H.G);
const rows=()=>HCIRCLE.ROWS, R=id=>HCIRCLE.row(id);
const live=r=>!!((r.with&&r.with.length)||r.alone||r.spot);   /* spot：只有旁白、在地點聽到（AA_509 3-1 總圖門口的媽媽）*/
const isLabel=id=>!!HD().PEOPLE[id];
const ROLLS=[];   /* 測試要那一列成立：找擲到的那一天 */
/* 這一列可能的日子（學期上課期間∩日期∩星期）*/
function daysOf(r){ const out=[]; const terms=r.terms||[]; let lo=null, hi=null;
  const rng=t=>CALENDAR.termDays(t); if(terms.length){ for(const t of terms){ const q=rng(t); if(!q) continue; for(let d=q.from;d<=q.to;d++) out.push(d); } }
  else if(r.dates){ for(const [a,b] of r.dates){ for(let d=DK(a);d<=DK(b);d++) out.push(d); } }
  return out.filter(d=>(!r.days||r.days.includes(wdOf(d)))&&(!r.dates||STORY.inDates({day:d},r.dates))); }
/* 這一列成立的時間（開頭、中間、快結束；cls：她那一堂必修課上課前 5 分鐘）*/
function hoursOf(r,d){ if(!r.cls) return [r.from+Math.min(0.05,(r.to-r.from)/3),(r.from+r.to)/2,r.to-Math.min(0.1,(r.to-r.from)/3)]; fresh(d,8,'campus'); const it=(CLS.dayItems(H.G)||[]).find(it=>it.c.kind==='required'&&(!r.pm||it.t0>=12)); return it?[it.t0-1/12]:[]; }
const hourOf=(r,d)=>hoursOf(r,d)[0];
/* 找一個成立的日子（flags：那一列要的條件）*/
function findOn(r,flags,opt){ opt=opt||{}; for(const d of daysOf(r)) for(const h of hoursOf(r,d)){ fresh(d,h,r.zone||'campus',flags); if(opt.prep) opt.prep(); if(HCIRCLE.on(r,H.G)) return {d,h}; } return null; }
const FLAGS={c503_4_1:{},c504_1_4:{}}, PREP={c503_4_1:()=>SOCIAL.meet('pool_7','classroom'),c504_1_4:()=>SOCIAL.meet('pool_7','classroom')};

/* 假的 3D：座位、站得住都可以、走過去＝馬上到 */
const said=()=>H.said.map(s=>(s.who?s.who+'：':'')+s.t);
function stage(zone,seats){ E.zone={id:zone,seats:(seats||[]).map(s=>Object.assign({},s)),spawn:{x:0,z:0}}; E.npcs=[]; GM.npc={}; E.indoor=false;
  E.canStand=()=>true; E.placeAt=(n,x,z,lv)=>{ n.obj.position.x=x; n.obj.position.z=z; n.lv=lv|0; }; E.moveTo=(n,x,z,cb,lv)=>{ n.obj.position.x=x; n.obj.position.z=z; if(lv!=null) n.lv=lv|0; if(cb) cb(); return true; };
  E.player.obj.position={x:500,y:0,z:500}; E.player.lv=0; E.player.seat=null;
  GM.spawnCharacter=(id,x,z,o)=>{ if(GM.npc[id]) return GM.npc[id]; o=o||{}; const n={id,charId:id,name:SOCIAL.npcName(id),obj:{position:{x,y:0,z},rotation:{y:o.yaw||0}},lv:o.lv|0,beh:o.beh||'idle',waypoints:o.waypoints,pose:o.pose||'idle',idlePose:o.pose||'idle',talk:nn=>STORY.talkCharacter(id,nn)}; if(o.seat){ n.seat=o.seat; n.obj.position.x=o.seat.x; n.obj.position.z=o.seat.z; n.frozen=true; } GM.npc[id]=n; E.npcs.push(n); return n; };
  GM.spawnNPC=(id,spec,x,z,o)=>{ o=o||{}; const n={id,charId:id,spec,name:spec&&spec.name,obj:{position:{x,y:0,z},rotation:{y:o.yaw||0},userData:{}},lv:o.lv|0,beh:'idle',pose:'idle',idlePose:'idle',talk:o.talk}; GM.npc[id]=n; E.npcs.push(n); return n; };
  GM.removeNPC=id=>{ const n=GM.npc[id]; if(n){ E.npcs=E.npcs.filter(m=>m!==n); delete GM.npc[id]; } };
  GM.sitAt=(n,st)=>{ n.seat=st; n.obj.position.x=st.x; n.obj.position.z=st.z; n.pose=n.idlePose='sit'; n.frozen=true; };
  GM.standUp=n=>{ n.seat=null; n.frozen=false; n.pose=n.idlePose='idle'; };
  GM.seatApproach=st=>[st.x,st.z+0.6]; }
const clerk=(x,z)=>{ const c={clerk:true,isExtra:true,name:'',obj:{position:{x,y:0,z},rotation:{y:0},visible:true},lv:0}; E.npcs.push(c); return c; };
const caps=[]; GM.caption=(who,t)=>{ caps.push((who?who+'：':'')+t); };
const dist=(a,b)=>Math.hypot(a.obj.position.x-b.obj.position.x,a.obj.position.z-b.obj.position.z);

(async()=>{
/* ---------- 0 載入、對稿 ---------- */
await sec('0',async()=>{ const sc=f=>html.indexOf('<script src="'+f), iS=sc('src/story3d.js'), iP=sc('src/pool3d.js'), iM=sc('src/multirel3d.js'), iHe=sc('src/heard3d.js'), iD=sc('src/data/heroine_circle.js'), iC=sc('src/hcircle3d.js'), iB=sc('src/data/bbpack_events.js');
  check('0. 載得到；index.html：heroine_circle.js → hcircle3d.js 在 story3d.js、multirel3d.js、pool3d.js、heard3d.js 以後，bbpack_events.js 前面',!errs.length&&HAS()&&iD>iHe&&iC>iD&&iC>iS&&iC>iP&&iC>iM&&iB>iC&&iS>0,J(errs));
  check('0. 八份稿都讀得到（git show 劇情匯入白名單上的那一版；AA_503～510）',Object.keys(DOC).length===8&&Object.values(DOC).every(d=>d.length>3000),J(Object.keys(DOC).map(k=>[k,DOCS[k][1],DOC[k].length])));
  check('0. 稿上的圈子表一共 107 列（AA_509 七列、AA_510 五列、AA_503 第 14 節後補第 9 點五列）',TABLE.length===107&&TABLE.filter(t=>t.doc==='AA_509').length===7&&TABLE.filter(t=>t.doc==='AA_510').length===5&&TABLE.filter(t=>t.sec==='14-後補9').length===5,TABLE.length+' 列');
  const D=HD(), byPos={}; for(const r of D.ROWS) byPos[r.doc+' '+r.sec+' '+r.k]=r;
  const miss=[], badRef=[]; for(const t of TABLE){ const r=byPos[t.doc+' '+t.sec+' '+t.k]; if(!r||r.heard!==heardOf(t)) miss.push(t.doc+' '+t.sec+' 第'+t.k+'列：'+t.heard.slice(0,20)+(r?' ≠ '+String(r.heard).slice(0,20):'（沒有）'));
    else if(REF.has(t.heard)!==!!r.ref) badRef.push(r.id); }
  check('0. 稿→遊戲：每一列都在遊戲資料裡（同一節、同一列，「走近時聽到」一字不差；AA_508 2-1 第 1、2 列照 AA_519 3-4 說話人「新來的工讀生」換「小禾」）',!miss.length,J(miss.slice(0,5)));
  { const t2=TABLE.filter(t=>REN519.has(t.doc+' '+t.sec+' '+t.k)), r2=t2.map(t=>byPos[t.doc+' '+t.sec+' '+t.k]);
    check('0. AA_519 3-4（白名單 '+SHA519+'）：AA_508 2-1 第 1、2 列稿上是「新來的工讀生」、遊戲裡說話人全部換成「小禾」（沒有留「新來的工讀生」）；AA_508 其他列、其他稿沒有換',
      REN519.size===2&&t2.length===2&&t2.every(t=>t.heard.includes('新來的工讀生：'))&&r2.every(r=>!!r&&r.heard.includes('小禾：')&&!r.heard.includes('新來的工讀生'))
      &&D.ROWS.filter(r=>/小禾：/.test(r.heard||'')).map(r=>r.id).sort().join()==='c508_2_1,c508_2_2',J({n:REN519.size,t2:t2.map(t=>t.heard.slice(0,12)),r2:r2.map(r=>r&&r.heard.slice(0,12))})); }
  { const r=D.ROWS.find(x=>x.id==='c519_2_3'), q=quote519('2-3');
    check('0. AA_519 2-3（白名單 '+SHA519+'）稿→遊戲：6/16（五）週五公館和學姊那一列（c519_2_3）「走近時聽到」＝稿上那四句（陳助教、學姊）一字不差；只有 2028-06-16、週五 18:30～20:30、一定同框',
      !!r&&q.split('／').length===4&&r.heard===q&&r.who==='heroine_05'&&J(r.with)===J(['npc_ta_chen'])&&r.always===true&&J(r.days)===J([5])&&r.from===18.5&&r.to===20.5&&J(r.dates)===J([['2028-06-16','2028-06-16']])&&r.zone==='gongguan',J({q,heard:r&&r.heard})); }
  check('0. 照現有、照 2-1、照 AA_506 4-1 那幾格＝ref（沒有新句子），其他的不是 ref',!badRef.length&&TABLE.every(t=>byPos[t.doc+' '+t.sec+' '+t.k]),J(badRef));
  /* 遊戲→稿：每一列的格子在那一份稿的那個位置（不是表上的列：n1、b＝說明裡的句子；derived＝「暑假照舊」）*/
  const tpos=new Set(TABLE.map(t=>t.doc+' '+t.sec+' '+t.k)), extra=[];
  for(const r of D.ROWS){ if(r.derived||r.doc==='AA_518') continue; if(r.doc==='AA_519'){ if(!r.heard||r.heard!==quote519(r.sec)) extra.push(r.id+'（AA_519 '+r.sec+' 對不上）'); continue; }   /* AA_518 4-13 新加的那一列（c506_5_1b）對 AA_518 的稿（tests/aa518_sis_b15_unit.js）；AA_519 的列＝那一節的引文 */
    if(typeof r.k==='number'){ if(!tpos.has(r.doc+' '+r.sec+' '+r.k)) extra.push(r.id); continue; }
    const notes=(NOTES[r.doc+' '+r.sec]||[]).join('\n'); if(!r.heard||notes.indexOf('「'+r.heard+'」')<0) extra.push(r.id+'（說明裡沒有）'); }
  check('0. 遊戲→稿：每一列都對得到稿的那一格（表下面說明的三句也在說明裡：以安 Café 旁白、阿凱「所以妳回絕了」、陳助教「送出去了？」）',!extra.length&&['c503_4_n1','c505_4_3b','c507_5_1b'].every(id=>D.ROWS.some(r=>r.id===id)),J(extra));
  if(!HAS()) return;
  const lines=[]; for(const r of rows()) if(r.doc!=='AA_518') for(const l of r.lines) lines.push([r,l]);   /* AA_518 4-13 那一列另外對 AA_518 的稿 */
  const docOf=r=>{ const k=(r.heardFrom?R(r.heardFrom):r).doc; return k==='AA_519'?DOC519:DOC[k]; };   /* heardFrom（照 AA_506 4-1、暑假照舊）：句子在那一列的稿裡；AA_519 的列在 AA_519 */
  const badLine=lines.filter(([r,l])=>docOf(r).indexOf(l.t)<0), badWho=lines.filter(([r,l])=>l.label&&!l.id);
  check('0. 遊戲裡的每一句都在它那一份稿裡（'+lines.length+' 句）',lines.length>=200&&!badLine.length,J(badLine.slice(0,4).map(([r,l])=>r.id+':'+l.t)));
  check('0. 每一句說話的人都對得到人物或標籤同伴（NAMES）',!badWho.length&&lines.every(([r,l])=>!l.id||!!CHARACTERS[l.id]||isLabel(l.id)),J(badWho.slice(0,4).map(([r,l])=>r.id+':'+l.label)));
  const nw=rows().filter(r=>live(r)&&r.with).filter(r=>r.with.some(c=>!CHARACTERS[c]&&!isLabel(c)));
  check('0. 每一列的「和誰」都是人物或標籤同伴',!nw.length,J(nw.map(r=>r.id)));
  const ownLine=rows().filter(r=>live(r)&&r.lines.length&&!r.alone&&!r.spot).filter(r=>!r.lines.some(l=>l.id===r.who)&&!r.lines.every(l=>!l.id));   /* 只有旁白的同框列（AA_509、AA_510 以安和語彤）不算 */
  check('0. 有同伴的列，她自己都有說話（同伴說的句子說話的人是 with 裡的人；只有旁白的同框列除外）',!ownLine.length&&rows().filter(r=>live(r)&&!r.alone&&!r.spot&&r.lines.length).every(r=>r.lines.every(l=>!l.id||l.id===r.who||r.with.includes(l.id))),J(ownLine.map(r=>r.id))); });

/* ---------- 1 作息 ---------- */
await sec('1',async()=>{ if(!HAS()){ check('1. HCIRCLE',false,'沒有 HCIRCLE'); return; }
  const D=HD(); const badS=[];
  for(const s of D.SCHED){ const L=CHARACTERS[s.who].daily_schedule; const i=L.findIndex(e=>e.hc===s.hc&&e.from===s.e.from&&e.zone===s.e.zone&&J(e.days)===J(s.e.days)); const r=R(s.hc);
    if(i<0||i>=D.SCHED.filter(q=>q.who===s.who).length||(r&&r.with&&J(L[i].with)!==J(r.with))) badS.push(s.hc+':'+s.who+':'+i); }
  check('1. 補的作息（'+D.SCHED.length+' 筆）放在她 daily_schedule 最前面，帶 hc、with（那一列的同伴）',!badS.length&&D.SCHED.length>=18,J(badS));
  /* 每一列找得到成立的時候；人物同伴在那一區 */
  const noOn=[], compOff=[], mirrorBad=[]; let nOn=0;
  for(const r of rows()){ if(!live(r)) continue; const f=findOn(r,FLAGS[r.id],{prep:PREP[r.id]}); if(!f){ noOn.push(r.id); continue; } nOn++;
    const he=HCIRCLE.heroEnt(r,H.G); for(const c of (r.with||[])){ if(isLabel(c)) continue; const e=ent(c); if(!e||e.zone!==he.zone) compOff.push(r.id+':'+c+'@'+(e&&e.zone)); else if(e.hc&&e.hc!==r.id&&!rows().some(q=>q.id===e.hc&&q.with&&q.with.includes(c))) mirrorBad.push(r.id+':'+c); } }
  check('1. 每一列（同框、一個人）在它的學期週次日期裡都找得到成立的時候（她照作息在那一區）：'+nOn+' 列',!noOn.length&&nOn>=70,J(noOn));
  check('1. 那時候人物同伴照 schedEnt 也在那一區（本來就在的照他自己的、不在的跟著她）',!compOff.length&&!mirrorBad.length,J({compOff,mirrorBad}));
  /* 跟著她的那一筆：靖雯在霖澤館門口（大二下債各下課）、阿凱在校園（大一上週五）、晏如／晨希在萬才館（吉他社）*/
  const chk=(rid,c,flags)=>{ const r=R(rid), f=findOn(r,flags); if(!f) return null; const e=ent(c); return e?{zone:e.zone,act:e.act,hc:e.hc,with:e.with}:null; };
  const a=chk('c506_3_1','pool_7'), b=chk('c503_7_2','kai'), c=chk('c503_7_1','pool_11'), d=chk('c503_7_1','pool_5');
  check('1. 不在那一區的同伴：回傳跟著她的那一筆（hc＝那一列、with＝她）——靖雯、阿凱、晏如；晨希吉他社有課的時間本來就在吉他社（AA_528 1-3：她自己的作息，沒有 hc）',!!a&&a.zone==='campus'&&a.act==='linger'&&a.hc==='c506_3_1'&&a.with==='heroine_03'&&!!b&&b.zone==='campus'&&b.hc==='c503_7_2'&&!!c&&c.zone==='wancai'&&c.act==='club'&&!c.hc&&!!d&&d.zone==='wancai'&&d.hc==='c503_7_1',J({a,b,c,d}));
  { const r=R('c506_3_1'), f=findOn(r); fresh(f.d,f.h,'campus'); const on0=HCIRCLE.on(r,H.G); H.G.invites=[{id:'iv1',who:'heroine_03',place:'wenzhou',state:'going',zone:'wenzhou',day:f.d,h:f.h}]; const on1=HCIRCLE.on(r,H.G), zj=ent('pool_7');
    check('1. 她和玩家一起走過去（邀約 going，INV.entryFor）的時候：那一列不成立、靖雯不跟過去',on0===true&&on1===false&&!(zj&&zj.hc),J({on0,on1,zj:zj&&zj.zone})); }
  const e1=chk('c503_6_1','npc_huangxh'), e2=chk('c504_6_1','classmate_bohan');
  check('1. 本來就在那一區的同伴照他自己的（筱涵在校園：沒有 hc）；沛珊「總圖二樓」改總圖大廳二樓（AA_527 2-5）＝柏翰（自己的作息在三樓閱覽區）跟著她到 library_hall',!!e1&&e1.zone==='campus'&&!e1.hc&&!!e2&&e2.zone==='library_hall'&&e2.hc==='c504_6_1'&&e2.with==='classmate_peishan',J({e1,e2}));
  /* 一定同框＝每一天；其他＝約 70%、同一天一樣 */
  const always=[], ratio=[];
  for(const r of rows()){ if(!live(r)||r.alone||r.spot||r.once||r.cls) continue; let elig=0, on=0; const f0=findOn(r,FLAGS[r.id]); if(!f0) continue;   /* 每一天用同一個時間（找得到成立的那個時間）*/
    for(const d of daysOf(r).slice(0,60)){ fresh(d,f0.h,r.zone||'campus',FLAGS[r.id]); if(!HCIRCLE.heroEnt(r,H.G)||!HCIRCLE.timeOk(r,H.G)) continue; elig++; if(HCIRCLE.on(r,H.G)) on++; }
    if(r.always){ if(elig&&on!==elig) always.push(r.id+':'+on+'/'+elig); } else if(elig>=10) ratio.push([r.id,on/elig]); }
  check('1. 「一定同框」的列：她在那裡的每一天都成立',!always.length,J(always));
  const tot=ratio.reduce((s,x)=>s+x[1],0)/Math.max(1,ratio.length), bad=ratio.filter(x=>x[1]<0.3||x[1]>0.98);
  check('1. 沒寫「一定同框」的列：約 70%（'+ratio.length+' 列平均 '+tot.toFixed(2)+'）',ratio.length>=10&&tot>0.6&&tot<0.8&&!bad.length,J(bad));
  { const r=R('c503_6_2'); const ds=daysOf(r).slice(0,30), a1=ds.map(d=>{ fresh(d,18,'noodle'); return HCIRCLE.on(r,H.G); }), a2=ds.map(d=>{ fresh(d,19.5,'noodle'); return HCIRCLE.on(r,H.G); });
    check('1. 同一天同一列擲一次（同一天不同時間、出去再進來都一樣）',J(a1)===J(a2)&&a1.includes(true)&&a1.includes(false),J(a1)); }
  /* 表外照舊：一段日子（大一上第 9～11 週、大二下第 2～3 週、大一暑假 7 月第一週）逐時、全部人物：沒有成立的列、補的作息沒有作用時＝和沒有模組一樣 */
  const SW=STORY.SCHED_WITH, NOW={}; for(const id in CHARACTERS) NOW[id]=CHARACTERS[id].daily_schedule;
  const base=id=>{ STORY.SCHED_WITH=null; CHARACTERS[id].daily_schedule=SCHED0[id]; try{ return STORY.schedEnt(CHARACTERS[id],H.G); } finally { STORY.SCHED_WITH=SW; CHARACTERS[id].daily_schedule=NOW[id]; } };
  const days=[].concat([9,10,11].flatMap(w=>[1,2,3,4,5,6,0].map(wd=>TD('Y1S1',w,wd))),[2,3].flatMap(w=>[1,2,3,4,5,6,0].map(wd=>TD('Y2S2',w,wd))),[0,1,2,3,4,5,6].map(i=>DK('2026-07-06')+i),
    [1,2,3,4,5,6,0].map(wd=>TD('Y4S1',10,wd)),[1,2,3,4,5,6,0].map(wd=>TD('Y4S2',2,wd)));   /* 大四（CIRCLE3D-Y4-1028）：大四上第 10 週、大四下第 2 週 */
  let n=0, same=0; const diff=[];
  for(const d of days) for(let h=7;h<24;h+=0.5){ fresh(d,h,'campus'); const on=new Set(HCIRCLE.rowsIn(H.G,null).map(r=>r.id));
    for(const id in CHARACTERS){ const a=ent(id); if(a&&(a.hc&&(on.has(a.hc)||CHARACTERS[id].daily_schedule.includes(a)))) continue; const b=base(id); n++; if(a===b||(J(a)===J(b))) same++; else if(diff.length<6) diff.push(id+'@'+CALENDAR.dateOf(d).key+' '+h+'：'+J(a&&{z:a.zone,act:a.act})+' vs '+J(b&&{z:b.zone,act:b.act})); } }
  check('1. 表外的時間照舊：'+n+' 次比對（全部人物、'+days.length+' 天逐時），沒有成立的列、補的作息沒作用時 schedEnt 和沒有這個模組一樣',n>30000&&same===n,same+'/'+n+' '+J(diff)); });

/* ---------- 2 生出來、站在一起 ---------- */
await sec('2',async()=>{ if(!HAS()){ check('2. HCIRCLE',false,'沒有 HCIRCLE'); return; }
  const pop=(r,zone,seats,flags)=>{ const f=findOn(r,flags); if(!f) return null; fresh(f.d,f.h,zone,flags); stage(zone,seats); STORY._bindGM(GM); POOL.bind(GM); HCIRCLE.bind(GM); STORY.refreshSchedule(GM); return f; };
  /* (a) 語彤×曾靖雯：霖澤館門口（大二下債各下課）——兩個人都生在校園、站在一起 */
  { const r=R('c506_3_1'); const f=pop(r,'campus'); const yt=GM.npc.heroine_03, zj=GM.npc.pool_7; HCIRCLE.arrange(GM,false);
    check('2. 大二下週一 12:12 霖澤館門口：語彤、曾靖雯都生出來，arrange 以後站在一起（1.5 m 內）、靖雯面向她',!!f&&!!yt&&!!zj&&dist(yt,zj)<1.5&&zj.frozen===true,J({f,yt:yt&&yt.obj.position,zj:zj&&zj.obj.position})); }
  /* (b) 以安×Alison：大道上一起走（buddy）*/
  { const r=R('c503_4_2'); const f=pop(r,'campus'); let an=GM.npc.heroine_01||GM.npc.an; const yu=GM.npc.yu; HCIRCLE.arrange(GM,false);
    check('2. 週一 18:00 以安和 Alison 一起走（Alison＝buddy、跟著以安、paired）',!!f&&!!an&&!!yu&&yu.beh==='buddy'&&yu.buddy===an&&yu.paired===an&&dist(an,yu)<1.5,J({f,beh:yu&&yu.beh})); }
  /* (c) 沛珊×柏翰：總圖坐在旁邊的空位 */
  { const seats=[{x:0,z:0,yaw:0},{x:0.9,z:0,yaw:0},{x:1.8,z:0,yaw:0},{x:8,z:5,yaw:0},{x:-8,z:5,yaw:0}];
    const r=R('c504_6_1'); const f=findOn(r); fresh(f.d,f.h,'library_hall'); stage('library_hall',seats); STORY._bindGM(GM); HCIRCLE.bind(GM);
    const ps=GM.spawnCharacter('classmate_peishan',0,0,{seat:E.zone.seats[0],pose:'read'}); const bh=GM.spawnCharacter('classmate_bohan',8,5,{seat:E.zone.seats[3],pose:'read'}); HCIRCLE.arrange(GM,false);
    check('2. 大一下 4/6 以後的總圖（大廳二樓自習區，AA_527 2-5）：柏翰坐到沛珊旁邊的空位',!!bh.seat&&Math.hypot(bh.seat.x-0,bh.seat.z-0)<1&&bh.seat!==E.zone.seats[3],J(bh.seat)); }
  /* (d) Café：芷若上班、小婷站店員的位置，原本的店員藏起來；那一列結束小婷走、店員回來 */
  { const r=R('c503_5_1'); const f=findOn(r); fresh(f.d,19.5,'cafe'); stage('cafe'); STORY._bindGM(GM); HCIRCLE.bind(GM); const ck=clerk(-0.6,-5.25);
    const zr=GM.spawnCharacter('heroine_02',-2.5,-5.15,{yaw:0}); zr.frozen=true; zr.staff='cafe'; HCIRCLE.arrange(GM,false); const xt=GM.npc.hc_xt;
    const ok1=!!xt&&Math.abs(xt.obj.position.x+0.6)<0.01&&Math.abs(xt.obj.position.z+5.25)<0.01&&xt.name==='小婷'&&ck.hidden===true&&ck.obj.visible===false&&xt.spec&&xt.spec.model==='char.npc_nf6'&&xt.staff==='cafe'&&!xt.talk&&xt.charId==null;
    set(f.d,22.2,'cafe'); HCIRCLE.arrange(GM,true); const ok2=!GM.npc.hc_xt&&ck.hidden===false&&ck.obj.visible===true;
    check('2. 週五 19:30 Café：小婷（固定底模 nf6、標籤名字、店員、不能說話）站吧檯店員的位置，原本的店員藏起來；22:00 以後小婷拿掉、店員回來',ok1&&ok2,J({ok1,ok2,xt:xt&&xt.obj.position})); }
  /* (e) 麵店：阿姨站語彤旁邊、廚房的店員藏起來 */
  { const r=R('c503_6_2'); const f=findOn(r); fresh(f.d,18,'noodle'); stage('noodle'); STORY._bindGM(GM); HCIRCLE.bind(GM); const ck=clerk(-2.0,-2.75);
    const yt=GM.spawnCharacter('heroine_03',2.6,-3.6,{yaw:-Math.PI/2}); yt.frozen=true; HCIRCLE.arrange(GM,false); const ay=GM.npc.hc_ayi;
    check('2. 週二 18:00 麵店：阿姨（標籤「阿姨」）站在語彤旁邊、面向她，廚房的店員藏起來',!!ay&&ay.name==='阿姨'&&dist(ay,yt)<1.5&&ck.hidden===true,J(ay&&ay.obj.position)); }
  /* (f) 學姊的兩個同學：總圖坐她旁邊 */
  { const seats=[{x:0,z:0,yaw:0},{x:0.9,z:0,yaw:0},{x:-0.9,z:0,yaw:0},{x:8,z:5,yaw:0}];
    const r=R('c503_8_2'); const f=findOn(r); fresh(f.d,14,'library'); stage('library',seats); STORY._bindGM(GM); HCIRCLE.bind(GM);
    const sis=GM.spawnCharacter('heroine_05',0,0,{seat:E.zone.seats[0],pose:'read'}); HCIRCLE.arrange(GM,false); const a=GM.npc.hc_sf1, b=GM.npc.hc_sf2;
    check('2. 大一上第 14 週起平日下午總圖：學姊的兩個同學（兩個不同的底模）坐在她旁邊',!!a&&!!b&&!!a.seat&&!!b.seat&&a.seat!==b.seat&&a.spec.model!==b.spec.model&&Math.hypot(a.seat.x,a.seat.z)<1&&Math.hypot(b.seat.x,b.seat.z)<1,J({a:a&&a.seat,b:b&&b.seat})); }
  /* (g) 一個人：以安大一下第 13 週（吵架以後）不和 Alison 配對（pairUp 跳過）*/
  { const r=R('c504_1_2'); const f=findOn(r); fresh(f.d,18.1,'campus'); stage('campus'); STORY._bindGM(GM); HCIRCLE.bind(GM);
    const an=GM.spawnCharacter('heroine_01',-20,6,{beh:'wander',waypoints:[[-20,6],[-60,6]]}), yu=GM.spawnCharacter('yu',-21,6,{beh:'wander',waypoints:[[-21,6],[-60,6]]});
    an.paired=yu; yu.paired=an; yu.beh='buddy'; yu.buddy=an; HCIRCLE.arrange(GM,false); const rr=Math.random; let paired=false; Math.random=()=>0.9; try{ STORY.pairUp('campus',GM); paired=!!an.paired; } finally { Math.random=rr; }
    check('2. 「一個人」的列：以安 noPair、原本的配對拆開、pairUp 不再配（Alison 回去照路線走）',an.noPair===true&&!paired&&yu.beh==='wander'&&!yu.buddy,J({noPair:an.noPair,paired,yu:yu.beh}));
    set(f.d,19,'campus'); HCIRCLE.arrange(GM,true); check('2. 那一段過了：noPair 拿掉',!an.noPair,J(an.noPair)); }
  /* (h) 必修課上課前：以安坐到曾靖雯旁邊（第一排）*/
  { const r=R('c505_1_3'); const f=findOn(r); const seats=[]; for(let row=0;row<3;row++) for(let col=0;col<8;col++) seats.push({x:col*0.8,z:row*1.0,yaw:0,row,col});
    fresh(f.d,f.h,'classroom'); stage('classroom',seats); STORY._bindGM(GM); HCIRCLE.bind(GM);
    const zj=GM.spawnCharacter('pool_7',0,0,{seat:E.zone.seats[4],pose:'sit'}), an=GM.spawnCharacter('heroine_01',0,0,{seat:E.zone.seats[20],pose:'sit'}); HCIRCLE.arrange(GM,false);
    check('2. 大二上必修課上課前：以安坐到曾靖雯旁邊（第一排、隔壁）',!!an.seat&&an.seat.row===0&&Math.abs(an.seat.col-4)===1,J(an.seat)); }
  /* (i) 大道上的以安（舊的劇情人物 an）：週四 19:40 走到萬才館門口站好，沛珊站在旁邊；20:00 以後走開（去讀書會）*/
  { const r=R('c503_4_3'); const f=findOn(r); fresh(f.d,f.h,'campus'); stage('campus'); STORY._bindGM(GM); HCIRCLE.bind(GM); POOL.bind(GM);
    const an=GM.spawnNPC('an',{name:'小安'},-20,6,{talk:()=>{}}); an.charId='heroine_01'; an.beh='wander'; an.waypoints=[[-20,6],[-60,6]];
    const ps=GM.spawnCharacter('classmate_peishan',30,-7,{beh:'wander',waypoints:[[30,-7]]}); HCIRCLE.arrange(GM,false);
    const ok1=Math.abs(an.obj.position.x-93.8)<0.01&&Math.abs(an.obj.position.z+97.6)<0.01&&an.frozen===true&&dist(an,ps)<1.5;
    let away=false; const wa=STORY.walkAway; STORY.walkAway=(g,n)=>{ if(n===an) away=true; n.leaving=true; return true; }; try{ set(f.d,20.05,'campus'); HCIRCLE.arrange(GM,true); } finally { STORY.walkAway=wa; }
    check('2. 週四 19:40 萬才館門口：大道上的以安走到那裡站好、沛珊站她旁邊；20:00 以後以安走開（作息換到萬才館讀書會）',ok1&&away,J({ok1,away,an:an.obj.position})); }
  /* (j) 走路的同伴那一段結束：回去照路線走（子晴週二 17:00 走了，Alison 留在校園到 17:30）*/
  { const r=R('c503_7_3'); const f=findOn(r); fresh(f.d,16,'campus'); stage('campus'); STORY._bindGM(GM); HCIRCLE.bind(GM);
    const zq=GM.spawnCharacter('heroine_04',0,7,{beh:'wander',waypoints:[[0,7],[20,7]]}), yu=GM.spawnCharacter('yu',5,7,{beh:'wander',waypoints:[[5,7]]}); HCIRCLE.arrange(GM,false); const b1=yu.beh==='buddy';
    set(f.d,17.1,'campus'); HCIRCLE.arrange(GM,true);
    check('2. 週二子晴和 Alison 一起走；17:00 那一段結束，Alison 不再跟著（回去照路線走）',b1&&yu.beh==='wander'&&!yu.buddy&&!!(yu.waypoints&&yu.waypoints.length),J({b1,beh:yu.beh})); } });

/* ---------- 3 走近聽到 ---------- */
await sec('3',async()=>{ if(!HAS()){ check('3. HCIRCLE',false,'沒有 HCIRCLE'); return; }
  HCIRCLE.later=(fn)=>fn(); HCIRCLE._resetTick();
  const setup=(rid,zone,h)=>{ const r=R(rid); const f=findOn(r,FLAGS[rid],{prep:PREP[rid]}); fresh(f.d,h!=null?h:f.h,zone,FLAGS[rid]); if(PREP[rid]) PREP[rid](); stage(zone); STORY._bindGM(GM); HCIRCLE.bind(GM); POOL.bind(GM); caps.length=0; return {r,f}; };
  { const {r,f}=setup('c506_3_1','campus'); const yt=GM.spawnCharacter('heroine_03',36.6,-97.4,{yaw:Math.PI/2}); yt.frozen=true; const zj=GM.spawnCharacter('pool_7',36.6,-98.35,{yaw:0}); zj.frozen=true;
    E.player.obj.position={x:50,y:0,z:-97.4}; HCIRCLE.tick(GM,0.5); const far=caps.length;
    E.player.obj.position={x:39.5,y:0,z:-97.4}; HCIRCLE.tick(GM,0.5); const got=caps.slice();
    const want=r.lines.map(l=>(HCIRCLE.who(GM,l)?HCIRCLE.who(GM,l)+'：':'')+l.t);
    caps.length=0; HCIRCLE.tick(GM,0.5); const again=caps.length;
    check('3. 走到 5 m 內才聽到；字幕照稿的順序、說話的人（靖雯還沒認識＝外觀描述）；同一天不再一次',far===0&&J(got)===J(want)&&again===0&&H.G.flags.HCIRCLE.heard.c506_3_1===f.d&&got.length===4&&/坐第一排正中間的女生：妳往前坐了。/.test(got[0]),J({far,got,again}));
    const nd=daysOf(r).filter(d=>d>f.d).find(d=>{ set(d,f.h,'campus'); return HCIRCLE.on(r,H.G); }); set(nd,f.h,'campus'); caps.length=0; HCIRCLE.tick(GM,0.5);
    check('3. 隔週同一列成立的那一天再聽一次',caps.length===4,J(caps)); }
  { const {r}=setup('c506_3_1','campus'); const yt=GM.spawnCharacter('heroine_03',36.6,-97.4,{yaw:Math.PI/2}); const zj=GM.spawnCharacter('pool_7',30,-97,{yaw:0});
    E.player.obj.position={x:38,y:0,z:-97.4}; const d0=HCIRCLE.hearDue(GM); zj.obj.position={x:36.6,y:0,z:-98.35}; const d1=HCIRCLE.hearDue(GM);   /* 不經過 arrange（arrange 會讓他走過來）*/
    check('3. 同伴不在她旁邊（3.2 m 外）＝聽不到；走到她旁邊＝聽得到',d0===null&&!!d1&&d1.r.id==='c506_3_1',J({d0:!!d0,d1:d1&&d1.r.id})); }
  { const {r,f}=setup('c503_5_3','l118_omu'); const zr=GM.spawnCharacter('heroine_02',1,1,{seat:{x:1,z:1,yaw:0},pose:'eat'}); E.player.obj.position={x:3,y:0,z:1}; HCIRCLE.tick(GM,0.5);
    check('3. 一個人的列：旁白一句（沒有說話人）',J(caps)===J(['（她一邊吃一邊看一本很舊的劇本，筆夾在耳朵上。）']),J(caps)); }
  { const {r,f}=setup('c505_4_3b','campus'); const zq=GM.spawnCharacter('heroine_04',0,7,{beh:'wander',waypoints:[[0,7]]}), kai=GM.spawnCharacter('kai',0.9,7,{}); HCIRCLE.arrange(GM,false);
    E.player.obj.position={x:2,y:0,z:7}; HCIRCLE.tick(GM,0.5); const n1=caps.length;
    const nd=daysOf(r).filter(d=>d>f.d)[0]; let on2=null; if(nd!=null){ set(nd,f.h,'campus'); on2=HCIRCLE.on(r,H.G); }
    check('3. once 的列（阿凱「所以妳回絕了」）：聽一次，之後那一列不再成立',n1===3&&on2===false&&!!H.G.flags.HCIRCLE.once.c505_4_3b,J({n1,on2,caps})); }
  { const {r,f}=setup('c505_1_3','classroom'); const seats=[]; for(let row=0;row<2;row++) for(let col=0;col<8;col++) seats.push({x:col*0.8,z:row,yaw:0,row,col}); E.zone.seats=seats;
    const zj=GM.spawnCharacter('pool_7',0,0,{seat:seats[4],pose:'sit'}), an=GM.spawnCharacter('heroine_01',0,0,{seat:seats[3],pose:'sit'}); E.player.obj.position={x:3,y:0,z:1};
    const e=HCIRCLE.heroEnt(r,H.G), t0=e.from+0.25; set(f.d,t0+0.05,'classroom'); HCIRCLE.tick(GM,0.5); const after=caps.length; set(f.d,t0-0.08,'classroom'); HCIRCLE.tick(GM,0.5);
    check('3. 必修課上課前（大二上）：上課以後沒有字幕、上課前 10 分鐘內有',after===0&&caps.length===3,J({after,caps})); } });

/* ---------- 4 找她說話：介紹 ---------- */
await sec('4',async()=>{ if(!HAS()){ check('4. HCIRCLE',false,'沒有 HCIRCLE'); return; }
  HCIRCLE.later=(fn)=>fn();
  /* 吉他社：晏如（pool_5，第二批還沒有認識的那一場）、晨希（pool_11）還沒認識；找子晴說話＝先演那幾句，然後兩位都認識 */
  const r=R('c503_7_1'); const f=findOn(r); fresh(f.d,19.5,'wancai'); stage('wancai'); STORY._bindGM(GM); HCIRCLE.bind(GM); POOL.bind(GM); H.FRIEND('heroine_04'); SOCIAL.meet('heroine_04','wancai');
  const zq=GM.spawnCharacter('heroine_04',-3,3.6,{}); zq.frozen=true; const yr=GM.spawnCharacter('pool_5',-2.1,3.6,{}), cx=GM.spawnCharacter('pool_11',-3.9,3.6,{}); HCIRCLE.arrange(GM,false);
  const before5=SOCIAL.has('pool_5','FIRST_MET'), nm0=SOCIAL.npcName('pool_11'), fam0=SOCIAL.rel('pool_11').fam|0;
  H.said=[]; H.picks=[]; E.player.obj.position={x:-3,y:0,z:5}; await zq.talk(zq); const L=said();
  const want=r.lines.map(l=>(HCIRCLE.who(GM,{id:l.id,label:l.label})||'')+'：'+l.t);
  check('4. 沒聽到就找她說話：先在對話框演那幾句（照稿），再照常說話',L.length>3&&J(L.slice(0,3).map(s=>s.replace(/^[^：]*：/,'')))===J(r.lines.map(l=>l.t)),J(L.slice(0,5)));
  /* AA_528 1-3（企劃線 7ad5fee84）：同框只顯示名字（名牌），不記 FIRST_MET、不算認識；他們自己的第一場照演（原本這裡就認識、熟悉＋3）*/
  check('4. 第一次在同伴旁邊找她說話：兩位同學只換名牌（名字從外觀描述換成名字），不記 FIRST_MET、熟悉不加；記下看過名牌（G.flags.HCIRCLE.intro）',!before5&&!SOCIAL.has('pool_5','FIRST_MET')&&!SOCIAL.has('pool_11','FIRST_MET')&&nm0!=='葉晨希'&&SOCIAL.npcName('pool_11')==='葉晨希'&&cx.name==='葉晨希'&&(SOCIAL.rel('pool_11').fam|0)===fam0&&H.G.flags.HCIRCLE.intro.pool_11===H.G.day,J({nm0,nm1:cx.name,fam0,fam1:SOCIAL.rel('pool_11').fam}));
  /* 之後：吉他社那裡沒有晨希的認識版本＝沒有說話按鈕；她自己的第一場（萬才館旁邊）照演 */
  check('4. 看過名牌以後：還沒認識也寫名字（HCIRCLE.named → POOL.descNow）；她自己的第一場照演（第二批以後的認識版本在 tests/aa499_501_pool_unit.js 第 17 節、tests/aa527_528_unit.js）',HCIRCLE.named(H.G,'pool_11')&&POOL.descNow('pool_11',H.G)==='葉晨希'&&!SOCIAL.has('pool_11','FIRST_MET'));
  /* 第一批的曾靖雯（BATCH1）：在語彤旁邊認識＝POOL.afterMeet（他那條線的「認識」那一段）、之後不演 meetBell／meetClass */
  { const r2=R('c506_3_1'); const f2=findOn(r2); fresh(f2.d,f2.h,'campus'); stage('campus'); STORY._bindGM(GM); HCIRCLE.bind(GM); POOL.bind(GM); H.FRIEND('heroine_03'); SOCIAL.meet('heroine_03','campus');
    const yt=GM.spawnCharacter('heroine_03',36.6,-97.4,{yaw:Math.PI/2}); yt.frozen=true; const zj=GM.spawnCharacter('pool_7',36.6,-98.35,{}); E.player.obj.position={x:37.5,y:0,z:-96.8}; HCIRCLE.arrange(GM,false);
    H.said=[]; await yt.talk(yt); const seg=(POOL.rec(H.G).seg.pool_7||{}).meet;
    check('4. 曾靖雯（第一批）在語彤旁邊：只換名牌，不記 FIRST_MET、他那條線沒有「認識」那一段（AA_528 1-3）',!SOCIAL.has('pool_7','FIRST_MET')&&!seg&&SOCIAL.npcName('pool_7')==='曾靖雯',J({seg}));
    set(f2.d,6.8,'campus'); H.said=[]; await STORY.talkCharacter('pool_7',zj); check('4. 之後在傅鐘找她：她自己的第一場（meetBell「我叫曾靖雯。」）照演、之後算認識',said().some(s=>/我叫曾靖雯/.test(s))&&SOCIAL.has('pool_7','FIRST_MET'),J(said().slice(0,3))); }
  /* 不是同學的同伴：只記下介紹過（筱涵）*/
  { const r3=R('c503_6_1'); const f3=findOn(r3); fresh(f3.d,12.4,'campus'); stage('campus'); STORY._bindGM(GM); HCIRCLE.bind(GM); H.FRIEND('heroine_03'); SOCIAL.meet('heroine_03','campus');
    const yt=GM.spawnCharacter('heroine_03',0,7,{beh:'wander',waypoints:[[0,7]]}), xh=GM.spawnCharacter('npc_huangxh',1,7,{beh:'wander',waypoints:[[1,7]]}); HCIRCLE.arrange(GM,false); E.player.obj.position={x:1,y:0,z:8};
    const met0=SOCIAL.has('npc_huangxh','FIRST_MET'); H.said=[]; await yt.talk(yt);
    check('4. 筱涵（不是二十位同學）：只記下介紹過（G.flags.HCIRCLE.intro），不加認識',H.G.flags.HCIRCLE.intro.npc_huangxh===H.G.day&&SOCIAL.has('npc_huangxh','FIRST_MET')===met0,J(H.G.flags.HCIRCLE.intro)); } });

/* ---------- 5 旁邊有人 ---------- */
await sec('5',async()=>{ if(!HAS()){ check('5. HCIRCLE',false,'沒有 HCIRCLE'); return; }
  const r=R('c503_6_1'); const f=findOn(r); fresh(f.d,12.4,'campus'); stage('campus'); STORY._bindGM(GM); HCIRCLE.bind(GM); H.FRIEND('heroine_03'); SOCIAL.meet('heroine_03','campus');
  const yt=GM.spawnCharacter('heroine_03',0,7,{beh:'wander',waypoints:[[0,7]]}), xh=GM.spawnCharacter('npc_huangxh',1,7,{beh:'wander',waypoints:[[1,7]]}); HCIRCLE.arrange(GM,false);
  const priv={t:'（私密的選項）',priv:true,run:async()=>{}}, pub={t:'（一般的選項）',run:async()=>{}}; const f0=(G,id)=>id==='heroine_03'?[priv,pub]:[]; STORY.TALK_OPTS.push(f0);
  const opts=async()=>{ H.opts=[]; H.picks=['就這樣']; await STORY.offerInvite(GM,'heroine_03',yt); return (H.opts[0]||[]); };
  try{ const o1=await opts(); xh.obj.position.x=20; const o2=await opts();
    check('5. 筱涵在旁邊：不出「約她去…」、priv 的選項；一般的一次性選項照常',!o1.some(t=>/^約她去/.test(t))&&!o1.includes('（私密的選項）')&&o1.includes('（一般的選項）'),J(o1));
    check('5. 筱涵走遠（3.2 m 外）：照常出「約她去…」、priv 的選項',o2.some(t=>/^約她去/.test(t))&&o2.includes('（私密的選項）'),J(o2));
    check('5. HCIRCLE.company：同伴在旁邊才算',HCIRCLE.company(H.G,'heroine_03',yt,GM)===false&&(xh.obj.position.x=1,HCIRCLE.company(H.G,'heroine_03',yt,GM))===true); }
  finally { STORY.TALK_OPTS.splice(STORY.TALK_OPTS.indexOf(f0),1); } });

/* ---------- 6 其他 ---------- */
await sec('6',async()=>{ const D=HD(), P=D.PEOPLE, A=fs.readFileSync(path.join(H.ROOT,'src/assets3d.js'),'utf8'); const pool=new Set(Object.values((typeof POOL_STORY!=='undefined'?POOL_STORY.PEOPLE:{})).map(p=>p.model));
  const bad=[]; const seen=new Set(); for(const id in P){ const p=P[id], m=new RegExp("'"+p.model.replace('.','\\.')+"':\\s*\\{[^\\n]*sex:'"+p.sex+"'").test(A); if(!m) bad.push(id+':'+p.model+' 不在 ASSETS 或性別不對'); if(pool.has(p.model)) bad.push(id+':和同學撞'); if(seen.has(p.model)) bad.push(id+':重複'); seen.add(p.model); }
  check('6. 標籤同伴（'+Object.keys(P).length+' 位）：底模在 ASSETS、性別對、不和二十位同學撞、彼此不重複',Object.keys(P).length>=17&&!bad.length,J(bad));
  const st=fs.readFileSync(path.join(H.ROOT,'src/story3d.js'),'utf8'), mr=fs.readFileSync(path.join(H.ROOT,'src/multirel3d.js'),'utf8');
  check('6. story3d.js：schedEnt 問 SCHED_WITH（pri 之後）、populateSchedule 在 pairUp 之前跑 PRE_PAIR、pairUp 跳過 noPair、offerInvite 每個選項問 S.privOk（PRIVTALK.ok；沒有 PRIVTALK＝STORY.privNow＝COMPANY，COMPANY-PRIV-1028）；COMPANY 可以回傳旁邊那幾個人的 id（S.companyOf，PRIV-AAFIX-1028）',/ent\.pri&&hit\(ent\)\) return actEnt\(ent\);[^\n]*\n\s*if\(S\.SCHED_WITH/.test(st)&&/S\.PRE_PAIR\)\{[^\n]*\n\s*pairUp\(zoneId,GM\); \}/.test(st)&&/!n\.paired&&!n\.noPair&&/.test(st)
    &&/S\.privOk\(G,id,'invite',GM,n\)/.test(st)&&/!\(pk\(o\)&&!S\.privOk\(G,id,pk\(o\),GM,n\)\)/.test(st)&&/S\.privOk=\(G,id,key,GM,n\)=>[^\n]*PRIVTALK\.ok\(G,id,key,GM\):S\.privNow\(G,id,n,GM\)/.test(st)
    &&/S\.companyOf=function\(G,id,n,GM\)\{[^\n]*S\.COMPANY/.test(st)&&/S\.crowdNow=function\(G,id,n,GM,except\)\{[^\n]*S\.companyOf/.test(st));
  check('6. multirel3d.js：告白的兩個一次性選項標 priv',(mr.match(/priv:true,run:/g)||[]).length===2);
  const AL=JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files||[];
  const badA=Object.keys(DOCS).filter(k=>{ const e=AL.find(q=>q.path===DOCS[k][0]); return !e||String(e.sha)!==DOCS[k][1]||e.status!=='approved'||!e.approvedBy||!/HEROINE-CIRCLE3D-1028/.test(e.note||'')||((k==='AA_509'||k==='AA_510')&&(!/CIRCLE3D-Y4-1028/.test(e.note||'')||String(e.sha)!=='28f981438')); });
  check('6. 劇情匯入白名單：AA_503～510 approved、有 approvedBy、對稿用的就是那一版（sha 相同），note 寫了 3D 圈子（AA_509、AA_510 是 28f981438、寫了 CIRCLE3D-Y4-1028）',!badA.length,J(badA)+' '+J(Object.keys(DOCS).map(k=>k+'@'+DOCS[k][1]))); });

/* ---------- 7 大四（CIRCLE3D-Y4-1028：AA_509、AA_510）---------- */
await sec('7',async()=>{ if(!HAS()){ check('7. HCIRCLE',false,'沒有 HCIRCLE'); return; }
  const Rw=id=>R(id)||{}; HCIRCLE.later=(fn)=>fn(); HCIRCLE._resetTick();
  /* 總圖三樓（閱覽區）照 zones3d.js 的座位：六張長桌（3 排×2 列，桌子 z＝-3、0.6、4.2），一張桌子兩邊各三個位子，面對面 */
  const libSeats=()=>{ const s=[]; for(let r=0;r<3;r++) for(let c=0;c<2;c++){ const x=-4+c*8, zz=-3+r*3.6; for(let i=0;i<3;i++) for(const sd of [-1,1]) s.push({x:x-1.6+i*1.6,z:zz+sd*0.9,yaw:sd>0?Math.PI:0}); } return s; };
  /* (a) 以安坐到語彤背後那一桌（11/30 以後；大四下也一樣）*/
  for(const rid of ['c509_1_2','c510_1_1']){ const r=Rw(rid), f=findOn(r); if(!f){ check('7. '+rid+' 找得到成立的時候',false); continue; }
    fresh(f.d,f.h,'library'); stage('library',libSeats()); STORY._bindGM(GM); HCIRCLE.bind(GM);
    const S0=E.zone.seats, yt0=S0.find(s=>Math.abs(s.x+5.6)<0.01&&Math.abs(s.z-0.6-0.9)<0.01);   /* 西邊中間那張桌子靠南的位子（面向北）*/
    const yt=GM.spawnCharacter('heroine_03',0,0,{seat:yt0,pose:'read'}), an=GM.spawnCharacter('heroine_01',4,-3.9,{seat:S0.find(s=>Math.abs(s.x-2.4)<0.01&&Math.abs(s.z+3.9)<0.01),pose:'read'}); HCIRCLE.arrange(GM,false);
    const ok=!!an.seat&&HCIRCLE.behindOf(an.seat,yt0)&&Math.hypot(an.seat.x-yt0.x,an.seat.z-yt0.z)<3.6&&!!yt.seat&&yt.seat===yt0;
    check('7. '+(rid==='c509_1_2'?'大四上 11/30 以後':'大四下第 1～15 週')+'週四 20:00 總圖三樓：以安坐到語彤背後那一桌（語彤不動）',ok,J({d:CALENDAR.dateOf(f.d).key,an:an.seat,yt:yt0})); }
  /* (b) 只有旁白的同框列：語彤不在旁邊＝聽不到；在旁邊＝旁白一句 */
  { const r=Rw('c510_1_1'), f=findOn(r); fresh(f.d,f.h,'library'); stage('library'); STORY._bindGM(GM); HCIRCLE.bind(GM); caps.length=0;
    const an=GM.spawnCharacter('heroine_01',0,0,{seat:{x:0,z:0,yaw:0},pose:'read'}), yt=GM.spawnCharacter('heroine_03',8,8,{seat:{x:8,z:8,yaw:0},pose:'read'});
    E.player.obj.position={x:1.5,y:0,z:1.5}; const d0=HCIRCLE.hearDue(GM); yt.obj.position={x:0,y:0,z:1.8}; yt.seat={x:0,z:1.8,yaw:Math.PI}; const d1=HCIRCLE.hearDue(GM); HCIRCLE.tick(GM,0.5);
    check('7. 只有旁白的同框列（大四下以安和語彤）：語彤不在旁邊聽不到；在旁邊＝旁白一句（沒有說話的人）',d0===null&&!!d1&&d1.r.id==='c510_1_1'&&J(caps)===J(['（語彤抬頭看你一眼，指了指以安，比了一個「噓」。以安沒有抬頭。）']),J({d0:!!d0,d1:d1&&d1.r.id,caps})); }
  /* (c) 總圖門口的媽媽（spot）：大四上第 10 週起週四 17:50～18:10，語彤照作息在總圖三樓；玩家在總圖大廳門廳或校園的總圖門口 5 m 內 */
  { const r=Rw('c509_3_2'); const d10=TD('Y4S1',10,4), d9=TD('Y4S1',9,4);
    const run=(d,h,zone,pos)=>{ fresh(d,h,zone); stage(zone); STORY._bindGM(GM); HCIRCLE.bind(GM); caps.length=0; E.player.obj.position=pos; E.player.lv=0; HCIRCLE._resetTick(); HCIRCLE.tick(GM,0.5); return caps.slice(); };
    const a=run(d10,18,'library_hall',{x:0,y:0,z:6.6}), again=(()=>{ caps.length=0; HCIRCLE.tick(GM,0.5); return caps.length; })();
    const b=run(d10,18,'library_hall',{x:0,y:0,z:-6}), c=run(d9,18,'library_hall',{x:0,y:0,z:6.6}), e=run(d10,18.5,'library_hall',{x:0,y:0,z:6.6}), g=run(d10,18,'campus',{x:86.4,y:0,z:2});
    const want=['（總圖門口站著一個中年女人，往裡面看了一會兒，就走了。）'];
    check('7. 總圖門口的媽媽（spot）：第 10 週週四 18:00 走進總圖大廳門廳＝旁白一句、同一天不再一次；大廳裡面、第 9 週、18:30、校園的總圖門口照樣（一天一次，每一處都可以先聽到）',
      J(a)===J(want)&&again===0&&!b.length&&!c.length&&!e.length&&J(g)===J(want)&&!!r.spot&&HCIRCLE.on(r,(fresh(d10,18,'library_hall'),H.G))===true,J({a,again,b,c,e,g})); }
  /* (d) 語彤的法律課（一個人）、以安週四麵店（一個人）、子晴公館騎樓（一個人＋補的作息）*/
  { const L=[]; for(const rid of ['c509_1_1','c509_3_3','c509_4_1','c510_3_2']){ const r=Rw(rid), f=findOn(r); L.push([rid,!!f&&r.alone===true&&HCIRCLE.heroEnt(r,(fresh(f.d,f.h,r.zone),H.G)).zone===r.zone]); }
    const zq=(()=>{ const r=Rw('c509_4_1'), f=findOn(r); fresh(f.d,22.5,'gongguan'); const e=ent('heroine_04'); return e&&e.act==='linger'&&e.hc==='c509_4_1'&&J(e.at)===J([16,20.6,Math.PI,0]); })();
    check('7. 一個人的列：以安週四麵店（第 2～13 週）、語彤的法律課（週一上午、週四下午）、子晴公館騎樓（插座旁邊，補的作息）、語彤暑假週四麵店都找得到成立的時候',L.every(x=>x[1])&&zq,J({L,zq})); }
  /* (e) 子晴 6/28 起週五公館和阿凱（畢業以後篇照樣成立）：兩個人都生在公館、一起走 */
  { const r=Rw('c510_4_1'), d=DK('2029-07-06'); fresh(d,22.5,'gongguan',{GRADUATED:true}); const on=HCIRCLE.on(r,H.G); stage('gongguan'); STORY._bindGM(GM); POOL.bind(GM); HCIRCLE.bind(GM); STORY.refreshSchedule(GM);
    const zq=GM.npc.heroine_04, kai=GM.npc.kai; HCIRCLE.arrange(GM,false);
    check('7. 子晴 6/28 起週五 22:00 公館和阿凱（2029-07-06，畢業以後篇）：一定同框、兩個人都生在公館、阿凱跟著她一起走',on===true&&!!zq&&!!kai&&kai.beh==='buddy'&&kai.buddy===zq&&dist(zq,kai)<1.5,J({on,zq:!!zq,kai:kai&&kai.beh})); }
  /* (f) 學姊和陳助教：12/23 以後（寒假）、5/29 以後的週五，一定同框；之前不成立 */
  { const q=(rid,k)=>{ const r=Rw(rid); fresh(DK(k),19,'gongguan'); return HCIRCLE.on(r,H.G); };
    const a=q('c509_5_1','2028-12-29'), a2=q('c509_5_1','2029-01-05'), b=q('c509_5_1','2029-01-12'), c=q('c509_5_1','2028-12-22'), d=q('c510_5_1','2029-06-01'), e=q('c510_5_1','2029-05-25'), g=q('c510_5_1','2029-08-03');
    check('7. 學姊週五和陳助教：1/12 起成立（12/22 還在美國、12/29、1/5 不排，AA_509 實作時定的第 2 點）；5/29 以後 6/1、8/3 成立（5/25 不成立）',!a&&!a2&&b&&!c&&d&&!e&&g,J({a,a2,b,c,d,e,g})); }
  /* (g) 照 1-1 的兩列：只是指向那一列（沒有自己的同框，句子同那一列）*/
  { const a=Rw('c509_3_1'), b=Rw('c510_3_1');
    check('7. 「照 1-1 第二列」「照 1-1」：ref、句子＝以安那一列、不另外排（不在 BY_WHO）',a.ref&&b.ref&&a.heardFrom==='c509_1_2'&&b.heardFrom==='c510_1_1'&&J(a.lines)===J(Rw('c509_1_2').lines)&&J(b.lines)===J(Rw('c510_1_1').lines)&&!(HCIRCLE.BY_WHO.heroine_03||[]).some(r=>r===a||r===b)); } });

/* ---------- 8 第三輪（PRIV-AAFIX-1028：AA_509 最後一節「實作時定的：大四的圈子」，企劃線 6bc3cd784）---------- */
await sec('8',async()=>{ if(!HAS()){ check('8. HCIRCLE',false); return; }
  const Rw=id=>R(id)||{}; const SPEC509='docs/story_planning/AA_509_女主角自己的生活_大四上與寒假.md', D509=show('6bc3cd784',SPEC509);
  check('8. 對稿：AA_509 6bc3cd784 最後一節的六項（學姊 2029-01-12、12/29 和 1/5 不排；總圖門口 17:50～18:10 第 10～16 週；子晴騎樓到 6/27、6/28 起阿凱；語彤坐長桌最裡面靠廚房、客人進來站在長桌那一頭門口那一側）',
    /## 實作時定的：大四的圈子/.test(D509)&&D509.includes('從 **2029-01-12** 開始')&&D509.includes('12/29 接著 12/28 家聚，1/5 時差還沒好，都不排')&&D509.includes('17:50～18:10、第 10～16 週，不綁 Y7-L5')
    &&D509.includes('到 **6/27** 為止')&&D509.includes('6/28 起換 `AA_510` 那一列（週五，阿凱）')&&D509.includes('坐在長桌最裡面、靠廚房的那個位子')&&D509.includes('站在長桌那一頭、門口那一側'),'長度 '+D509.length);
  /* 第 2 點：學姊和陳助教 1/12 起；12/29、1/5 那兩晚她不在 3D（她原本的週五公館）*/
  { const ent5=k=>{ fresh(DK(k),19,'gongguan'); const e=ent('heroine_05'); return e?{zone:e.zone,act:e.act,away:e.away||null}:null; };
    const a=ent5('2028-12-29'), b=ent5('2029-01-05'), c=ent5('2029-01-12'), d=ent5('2029-01-19');
    check('8. 第 2 點：學姊 12/29、1/5 的週五晚上不排（不在 3D、「在家」）；1/12 起週五公館和陳助教（同框）',!!a&&a.zone==null&&a.away==='在家'&&!!b&&b.zone==null&&!!c&&c.zone==='gongguan'&&!!d&&d.zone==='gongguan'
      &&(fresh(DK('2029-01-12'),19,'gongguan'),HCIRCLE.on(Rw('c509_5_1'),H.G))===true&&(fresh(DK('2029-01-05'),19,'gongguan'),HCIRCLE.on(Rw('c509_5_1'),H.G))===false,J({a,b,c,d})); }
  /* 第 3 點：總圖門口照現在 */
  { const r=Rw('c509_3_2'); check('8. 第 3 點：語彤媽媽在總圖門口照現在（17:50～18:10、第 10～16 週、不綁 Y7-L5 的條件；總圖大廳門廳、校園的總圖門口兩個站位）',r.from===17+50/60&&r.to===18+10/60&&J(r.weeks)===J([10,11,12,13,14,15,16])&&!r.cond&&(r.spot||[]).length===2&&r.spot.every(s=>s[0]==='library_hall'||s[0]==='campus')); }
  /* 第 4 點：子晴騎樓延到大四下 6/27，6/28 起換阿凱那一列 */
  { const on=(k,h)=>{ fresh(DK(k),h||22.5,'gongguan'); return HCIRCLE.on(Rw('c509_4_1'),H.G); };
    const a=on('2028-10-11'), b=on('2029-01-24'), c=on('2029-03-14'), d=on('2029-06-27'), e=on('2029-06-28'), f=on('2029-06-29');
    const e1=(fresh(DK('2029-06-27'),22.5,'gongguan'),ent('heroine_04')), e2=(fresh(DK('2029-06-28'),22.5,'gongguan'),ent('heroine_04'));
    const k=(fresh(DK('2029-06-29'),22.5,'gongguan'),HCIRCLE.on(Rw('c510_4_1'),H.G)), k0=(fresh(DK('2029-06-22'),22.5,'gongguan'),HCIRCLE.on(Rw('c510_4_1'),H.G));
    check('8. 第 4 點：子晴騎樓（一個人）大四上、寒假、大四下都成立，到 6/27 為止（6/27 的作息＝騎樓插座旁邊）；6/28 起不成立、作息照原本；6/29（週五）起和阿凱那一列（6/22 還沒）',
      a&&b&&c&&d&&!e&&!f&&!!e1&&e1.hc==='c509_4_1'&&e1.act==='linger'&&!!e2&&e2.hc!=='c509_4_1'&&e2.zone==='gongguan'&&k===true&&k0===false,J({a,b,c,d,e,f,e1:e1&&e1.hc,e2:e2&&[e2.hc,e2.act],k,k0})); }
  /* 第 5 點：語彤暑假在麵店——坐長桌最裡面、靠廚房；客人進來站在長桌那一頭、門口那一側 */
  { const r=Rw('c510_3_2'), d=DK('2029-06-07'); const ndl=[]; for(let i=0;i<3;i++){ const x=-3+i*3; for(const s of [-1,1]) ndl.push({x,z:0.5+s*0.8,yaw:s>0?Math.PI:0}); }   /* zones3d.js 麵店：三張桌子 x＝−3／0／3、z＝0.5，椅子 z＝−0.3／1.3 */
    fresh(d,18,'noodle'); const on=HCIRCLE.on(r,H.G); stage('noodle',ndl); E.zone.spawn={x:0,z:3.5}; STORY._bindGM(GM); HCIRCLE.bind(GM);
    const yt=GM.spawnCharacter('heroine_03',2.6,-3.6,{yaw:-Math.PI/2}); yt.frozen=true; E.player.obj.position={x:0,y:0,z:3.4};
    HCIRCLE.arrange(GM,false); const s0=yt.seat&&{x:yt.seat.x,z:yt.seat.z}, p0=yt.pose;   /* 進區域那一刻：坐著 */
    HCIRCLE.arrange(GM,true); const s1=!!yt.seat, at1={x:yt.obj.position.x,z:yt.obj.position.z}, y1=yt.obj.rotation.y;   /* 玩家站著（剛進門）＝客人：站起來 */
    E.player.seat=E.zone.seats[0]; HCIRCLE.arrange(GM,true); const s2=yt.seat&&{x:yt.seat.x,z:yt.seat.z};   /* 玩家坐下了：坐回去 */
    const cu=GM.spawnNPC('npc_cust',{name:''},0,3.4,{}); cu.isExtra=true; HCIRCLE.arrange(GM,true); const s3=!!yt.seat;   /* 別的客人走進來（還沒坐下）：又站起來 */
    cu.seat=E.zone.seats[1]; HCIRCLE.arrange(GM,true); const s4=!!yt.seat;
    let away=false; const wa=STORY.walkAway; STORY.walkAway=(g,n)=>{ if(n===yt) away=true; n.leaving=true; return true; }; try{ set(d,20.6,'noodle'); HCIRCLE.arrange(GM,true); } finally{ STORY.walkAway=wa; }
    check('8. 第 5 點：語彤暑假週四在麵店（c510_3_2）：進門那一刻坐在長桌最裡面、靠廚房的位子（x=3、z=−0.3）讀書；客人（剛進門還站著的玩家、走進來的客人）＝站在長桌那一頭、門口那一側（x 4.15、z 1.1，面向門口）；客人都坐下＝坐回去；20:30 那一列結束照作息走開',
      on&&!!s0&&s0.x===3&&Math.abs(s0.z+0.3)<1e-9&&p0==='read'&&!s1&&Math.abs(at1.x-4.15)<0.01&&Math.abs(at1.z-1.1)<0.01&&Math.abs(y1-Math.atan2(0-4.15,3.5-1.1))<0.01&&!!s2&&s2.x===3&&Math.abs(s2.z+0.3)<1e-9&&!s3&&s4&&away,
      J({on,s0,p0,s1,at1,y1,s2,s3,s4,away})); } });

/* ---------- 9 第四輪（PRIV-AUNT-1028 第二輪：AA_503 第 14 節後補第 8、9 點，企劃線 f6069e42d）：大二下以後每學期阿姨那一列、廚房那位就是阿姨 ---------- */
await sec('9',async()=>{ if(!HAS()){ check('9. HCIRCLE',false); return; }
  const IDS=['c503_14_1','c503_14_2','c503_14_3','c503_14_4','c503_14_5'], rows9=IDS.map(id=>R(id)), B9=TABLE.filter(t=>t.sec==='14-後補9'), base=R('c503_6_2');
  /* (a) 對稿＋做法同 c503_6_2 */
  const badA=[]; B9.forEach((t,i)=>{ const r=rows9[i]; if(!r||r.heard!==t.heard||!t.term||J(r.terms)!==J([t.term])) badA.push((r&&r.id)+':'+t.when); });
  const same=r=>!!r&&J(r.with)===J(base.with)&&J(r.days)===J(base.days)&&r.from===base.from&&r.to===base.to&&r.zone===base.zone&&r.act===base.act&&J(r.comp)===J(base.comp)&&!r.always&&!r.once&&r.doc==='AA_503';
  check('9. 對稿（AA_503 '+DOCS.AA_503[1]+' 第 14 節後補第 9 點的表）：c503_14_1～5＝大二下、大三上、大三下、大四上、大四下各一列，「走近時聽到」逐字＝那一學期那一格；做法同 c503_6_2（阿姨、週二四 17:30～20:30、麵店顧店、阿姨站店員的位置、沒寫一定同框）',
    B9.length===5&&!badA.length&&rows9.every(same)&&J(B9.map(t=>t.term))===J(['Y2S2','Y3S1','Y3S2','Y4S1','Y4S2']),J({n:B9.length,badA,terms:B9.map(t=>t.term)}));
  /* (b) 每一學期 18:30：她照作息在麵店顧店的週二（週四）＝擲到那一天成立（labelIn）、沒擲到那一天不成立；週四照作息不在店裡的學期週四都不成立 */
  const yt=()=>{ const e=ent('heroine_03'); return !!e&&e.zone==='noodle'&&e.act==='help'; };
  const per={}; for(const r of rows9){ if(!r) continue; const T=r.terms[0], q=CALENDAR.termDays(T), o=per[T]={tueOn:0,tueOff:0,thuOn:0,thuOff:0,thuYt:0,bad:0};
    for(let d=q.from;d<=q.to;d++){ const wd=wdOf(d); if(wd!==2&&wd!==4) continue; fresh(d,18.5,'noodle'); const m=yt(), on=HCIRCLE.on(r,H.G), li=HCIRCLE.labelIn(H.G,'hc_ayi','noodle');
      if(on!==li||(on&&!m)) o.bad++; const k=wd===2?'tue':'thu'; if(m){ if(k==='thu') o.thuYt++; o[k+(on?'On':'Off')]++; } } }
  const P=per, ok=['Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'].every(T=>P[T]&&!P[T].bad&&P[T].tueOn>0&&P[T].tueOff>0)&&P.Y2S2.thuOn>0&&P.Y3S1.thuOn>0&&['Y3S2','Y4S1','Y4S2'].every(T=>P[T].thuYt===0&&P[T].thuOn===0);
  check('9. 每一學期週二 18:30（大二下、大三上週四也是）：她照作息在麵店顧店、那一天擲到＝阿姨那一列成立（HCIRCLE.labelIn＝在），沒擲到＝不在（語彤照樣顧店）；大三下起週四她不在店裡（田野、總圖）＝週四都不成立',ok,J(per));
  { const r=R('c503_14_2'), t15=TD('Y3S1',15,4), t14=TD('Y3S1',14,4); fresh(t15,18.5,'noodle'); const a=yt(), b=HCIRCLE.on(r,H.G); fresh(t14,18.5,'noodle'); const c=yt();
    check('9. 大三上：週四到事件 13（12/16）以前在店裡；第 15 週週四（12/16 以後）她在總圖＝不成立',c===true&&a===false&&b===false,J({t14:c,t15:a,on15:b})); }
  /* (c) 2029-09 畢業以後篇以前：寒暑假、大五上、大四下 4/24（阿姨第一次出國、店休那一週）都沒有阿姨（她照作息週二照樣顧店）*/
  const out=[]; const at=(k,lab)=>{ fresh(DK(k),18.5,'noodle'); out.push([lab+' '+k,yt(),HCIRCLE.labelIn(H.G,'hc_ayi','noodle')]); };
  at('2027-07-06','大二暑假'); at('2028-01-25','大三寒假'); at('2028-07-04','大三暑假'); at('2029-04-24','大四下 4/24 店休'); at('2029-06-05','畢業那年夏天'); at('2029-09-04','大五上'); at('2029-10-16','大五上'); at('2030-03-05','大五下');
  check('9. 寒暑假（大二暑假、大三寒暑假）、畢業那年夏天、大五上下沒有阿姨那一列（同 c503_6_2 只在上課期間；到 2029-09 畢業以後篇以前）；大四下 4/24（AA_510 阿姨第一次出國、店休一週）不成立',
    out.every(x=>x[2]===false)&&out.filter(x=>/2029-04-24|2027-07-06|2029-09-04/.test(x[0])).every(x=>x[1]===true),J(out));
  { const r=R('c503_14_5'), tk=k=>{ fresh(DK(k),18.5,'noodle'); return HCIRCLE.timeOk(r,H.G); }, a=tk('2029-04-17'), b=tk('2029-04-24'), c=tk('2029-05-01');
    check('9. 大四下那一列跳過 4/19～4/25（dates：阿姨在日本）：4/24 的時間條件不成立，前一週 4/17、後一週 5/1 成立',a===true&&b===false&&c===true,J({a,b,c})); }
  /* (d) 廚房那位就是阿姨（3D）：麵店原本那位無名的店員 */
  const ndlDay=(r,want)=>{ for(let w=2;w<=15;w++) for(const wd of [2,4]){ const x=TD(r.terms[0],w,wd); fresh(x,18,'noodle'); if(yt()&&HCIRCLE.on(r,H.G)===want) return x; } return null; };
  const r1=R('c503_6_2'), dOff=ndlDay(r1,false), dOn=ndlDay(r1,true);
  const shop=(d,h,withYt)=>{ fresh(d,h,'noodle'); stage('noodle'); E.player.obj.position={x:0,y:0,z:3.4}; STORY._bindGM(GM); HCIRCLE.bind(GM); const ck=clerk(-2.0,-2.75); let y=null; if(withYt){ y=GM.spawnCharacter('heroine_03',2.6,-3.6,{yaw:-Math.PI/2}); y.frozen=true; } HCIRCLE.arrange(GM,false); return {ck,y}; };
  const vis=ck=>ck.hidden!==true&&ck.obj.visible!==false, ayN=()=>{ const a=GM.npc.hc_ayi; return !!a&&!a.leaving&&!a.hidden; };
  const K=[];
  /* AA_519 第 8 節第 1 點（d75cd0228）：語彤顧店的時段阿姨一定在廚房——沒擲到也一樣（廚房那位就是阿姨，照常在）；阿姨真的不在（HCIRCLE.auntAway：過年店休、出國那一週；
     這支測試沒有載 r2y4b3d.js、noodle_closed3d.js，用 awayAs 強制）才照原本的「廚房沒有人」 */
  const awayAs=(v,fn)=>{ const a0=HCIRCLE.auntAway; HCIRCLE.auntAway=()=>v; try{ return fn(); } finally { HCIRCLE.auntAway=a0; } };
  { const s=shop(dOff,18,true); K.push(['沒擲到 18:00 語彤顧店（AA_519 第 8 節第 1 點）＝廚房那位（阿姨）照常在、沒有標籤的阿姨；不是 auntOut、kitchen＝clerk',vis(s.ck)&&!ayN()&&HCIRCLE.auntOut(GM)===false&&HCIRCLE.kitchen(GM,new Set())==='clerk']); }
  awayAs(true,()=>{ const s=shop(dOff,18,true); K.push(['阿姨真的不在（強制）18:00 語彤顧店＝店員不在、阿姨不在（廚房沒有人）；auntOut',!vis(s.ck)&&!ayN()&&HCIRCLE.auntOut(GM)===true&&HCIRCLE.kitchen(GM,new Set())==='away']); });
  { const s=shop(dOn,18,true); K.push(['擲到 18:00＝阿姨在、店員藏起來（只有一個）；不是 auntOut',!vis(s.ck)&&ayN()&&HCIRCLE.auntOut(GM)===false]); }
  { const s=shop(dOff,18,false); K.push(['語彤不在麵店（她的人不在這一區）＝店員照常在',vis(s.ck)&&!ayN()&&HCIRCLE.auntOut(GM)===false]); }
  { const s=shop(dOff,17.2,false); const a=vis(s.ck); set(dOff,17.6,'noodle'); const y=GM.spawnCharacter('heroine_03',0,3.4,{}); HCIRCLE.arrange(GM,true); const b=vis(s.ck); set(dOff,20.6,'noodle'); y.leaving=true; HCIRCLE.arrange(GM,true); const c=vis(s.ck);
    K.push(['沒擲到那一天待在店裡（AA_519 第 8 節第 1 點）：17:12 店員在 → 17:36 語彤進來＝店員（阿姨）還在 → 20:36 語彤走開＝店員在',a&&b&&c,J({a,b,c})]); }
  awayAs(true,()=>{ const s=shop(dOff,17.2,false); const a=vis(s.ck); set(dOff,17.6,'noodle'); const y=GM.spawnCharacter('heroine_03',0,3.4,{}); HCIRCLE.arrange(GM,true); const b=vis(s.ck); set(dOff,20.6,'noodle'); y.leaving=true; HCIRCLE.arrange(GM,true); const c=vis(s.ck);
    K.push(['阿姨真的不在（強制）待在店裡：17:12 店員在 → 17:36 語彤進來＝店員不見 → 20:36 語彤走開＝店員回來',a&&!b&&c,J({a,b,c})]); });
  { const s=shop(dOn,17.2,false); const a=vis(s.ck)&&!GM.npc.hc_ayi; set(dOn,17.6,'noodle'); const y=GM.spawnCharacter('heroine_03',0,3.4,{}); HCIRCLE.arrange(GM,true); const b=!vis(s.ck)&&ayN(); set(dOn,20.6,'noodle'); y.leaving=true; HCIRCLE.arrange(GM,true); const c=vis(s.ck)&&!ayN();
    K.push(['擲到那一天待在店裡：17:12 店員在（沒有阿姨）→ 17:36 語彤進來＝阿姨來、店員藏起來 → 20:36＝阿姨走、店員回來',a&&b&&c,J({a,b,c})]); }
  { const s=shop(dOff,20.6,true); K.push(['20:36 語彤還沒走開（她的作息已經不是顧店）＝店員在',vis(s.ck)]); }
  { fresh(dOff,18,'noodle'); H.G.invites=[{id:'iv1',who:'heroine_03',place:'noodle',state:'going',zone:'noodle',day:dOff,h:18}]; const e=ent('heroine_03'), inv=!!(e&&e.invite);
    stage('noodle'); E.player.obj.position={x:0,y:0,z:3.4}; STORY._bindGM(GM); HCIRCLE.bind(GM); const ck=clerk(-2.0,-2.75); const y=GM.spawnCharacter('heroine_03',2.6,-3.6,{}); HCIRCLE.arrange(GM,false);
    K.push(['跟你約來吃（邀約 going）的語彤是客人＝店員照常在',inv&&vis(ck)&&HCIRCLE.auntOut(GM)===false,J({inv})]); H.G.invites=[]; }
  { const s=shop(dOn,18,true); s.ck.hidden=true; s.ck.obj.visible=false; s.ck._hcKit=true; delete GM.npc.hc_ayi; E.npcs=E.npcs.filter(n=>!n.hcLabel); HCIRCLE.arrange(GM,true); const a=!vis(s.ck)&&ayN()&&GM.npc.hc_ayi._hcHid===s.ck&&!s.ck._hcKit;
    set(dOn,20.6,'noodle'); s.y.leaving=true; HCIRCLE.arrange(GM,true); K.push(['店員先因為廚房沒人藏起來、阿姨後來才到＝交給阿姨（她走的時候店員回來）',a&&vis(s.ck),J({a})]); }
  check('9. 廚房那位就是阿姨（第 8 點；AA_519 第 8 節第 1 點起語彤顧店的時段阿姨一定在廚房）：沒擲到＝廚房那位（阿姨）照常在；阿姨真的不在（強制）＝麵店原本的店員也不出現；擲到＝阿姨換掉店員（不會兩個都在）；語彤不在（沒顧店、走了、約來吃的客人）＝店員照常在；待在店裡時間跨過、語彤進出都跟著變',
    dOff!=null&&dOn!=null&&K.every(x=>x[1]),J(K.filter(x=>!x[1]))); });

H.done();
})();
