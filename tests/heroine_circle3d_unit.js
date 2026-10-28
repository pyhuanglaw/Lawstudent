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
//   4  找她說話：沒聽到的先在對話框演、再照常說話；第一次在同伴旁邊＝介紹——二十位同學在這裡認識（FIRST_MET、名字換掉、熟悉＋3），
//      之後找他說話不再演他自己的認識那一場；其他人只記下介紹過
//   5  旁邊有人：同伴在旁邊＝不出「約她去…」、priv（告白）選項，交換聯絡方式照常；同伴不在＝照常
//   6  其他：標籤同伴的底模都在 ASSETS、性別對、不和二十位同學撞、彼此不重複；story3d.js、multirel3d.js 的掛勾
// 修改前（開發分支 ff9f54209 的乾淨 checkout（git worktree --detach）放進這支測試實際跑，2026-10-28）：FAILED 13、PASS 2
//   （PASS＝六份稿讀得到、稿上的表一共 90 列；FAIL＝0 載入與 index.html、稿→遊戲、ref、遊戲→稿 4 項，1～5 各 1 項「沒有 HCIRCLE」，
//    6 標籤同伴、story3d.js 掛勾、multirel3d.js priv、白名單 note 4 項）。修改後 ALL PASS（50 項）。
// 用法：node tests/heroine_circle3d_unit.js
'use strict';
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify;
const DOCS={AA_503:['docs/story_planning/AA_503_女主角自己的生活_大一上_動態頁_圈子_她的事.md','d13ab3ab7'],AA_504:['docs/story_planning/AA_504_女主角自己的生活_大一下與暑假.md','62849944b'],
  AA_505:['docs/story_planning/AA_505_女主角自己的生活_大二上與寒假.md','795fbecfd'],AA_506:['docs/story_planning/AA_506_女主角自己的生活_大二下與暑假.md','31a4c4002'],
  AA_507:['docs/story_planning/AA_507_女主角自己的生活_大三上與寒假.md','31a4c4002'],AA_508:['docs/story_planning/AA_508_女主角自己的生活_大三下與暑假.md','31a4c4002']};
const show=(sha,f)=>{ try{ return cp.execSync('git show '+sha+':"'+f+'"',{cwd:H.ROOT,encoding:'utf8',maxBuffer:1<<24}); }catch(e){ return ''; } };
const DOC={}; for(const k in DOCS) DOC[k]=show(DOCS[k][1],DOCS[k][0]);
/* 稿上的圈子表：{doc,sec:'4-1',k,heard,when,who,where}；說明（- 開頭）另外收 */
const TABLE=[], NOTES={};
for(const k in DOC){ let sec=null, on=false, n=0; for(const l of DOC[k].split('\n')){ let m;
    if((m=/^### (\d+)-1\. 圈子/.exec(l))){ on=true; sec=m[1]+'-1'; n=0; continue; } if(/^(### |## |---)/.test(l)){ on=false; continue; } if(!on) continue;
    if(/^\|/.test(l)&&!/^\|---/.test(l)&&!/^\| 什麼時候/.test(l)){ const c=l.trim().replace(/^\||\|$/g,'').split('|').map(s=>s.trim()); n++; TABLE.push({doc:k,sec,k:n,when:c[0],who:c[1],where:c[2],heard:c[3]}); }
    else if(/^\s*-/.test(l)) (NOTES[k+' '+sec]||(NOTES[k+' '+sec]=[])).push(l.trim()); } }
const REF=new Set(['照現有','照現有讀書會','照 2-1','照 `AA_506` 4-1']);
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
const live=r=>!!((r.with&&r.with.length)||r.alone);
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
  check('0. 六份稿都讀得到（git show 對的 commit）',Object.values(DOC).every(d=>d.length>3000),J(Object.keys(DOC).map(k=>[k,DOC[k].length])));
  check('0. 稿上的圈子表一共 90 列',TABLE.length===90,TABLE.length+' 列');
  const D=HD(), byPos={}; for(const r of D.ROWS) byPos[r.doc+' '+r.sec+' '+r.k]=r;
  const miss=[], badRef=[]; for(const t of TABLE){ const r=byPos[t.doc+' '+t.sec+' '+t.k]; if(!r||r.heard!==t.heard) miss.push(t.doc+' '+t.sec+' 第'+t.k+'列：'+t.heard.slice(0,20)+(r?' ≠ '+String(r.heard).slice(0,20):'（沒有）'));
    else if(REF.has(t.heard)!==!!r.ref) badRef.push(r.id); }
  check('0. 稿→遊戲：每一列都在遊戲資料裡（同一節、同一列，「走近時聽到」一字不差）',!miss.length,J(miss.slice(0,5)));
  check('0. 照現有、照 2-1、照 AA_506 4-1 那幾格＝ref（沒有新句子），其他的不是 ref',!badRef.length&&TABLE.every(t=>byPos[t.doc+' '+t.sec+' '+t.k]),J(badRef));
  /* 遊戲→稿：每一列的格子在那一份稿的那個位置（不是表上的列：n1、b＝說明裡的句子；derived＝「暑假照舊」）*/
  const tpos=new Set(TABLE.map(t=>t.doc+' '+t.sec+' '+t.k)), extra=[];
  for(const r of D.ROWS){ if(r.derived) continue; if(typeof r.k==='number'){ if(!tpos.has(r.doc+' '+r.sec+' '+r.k)) extra.push(r.id); continue; }
    const notes=(NOTES[r.doc+' '+r.sec]||[]).join('\n'); if(!r.heard||notes.indexOf('「'+r.heard+'」')<0) extra.push(r.id+'（說明裡沒有）'); }
  check('0. 遊戲→稿：每一列都對得到稿的那一格（表下面說明的三句也在說明裡：以安 Café 旁白、阿凱「所以妳回絕了」、陳助教「送出去了？」）',!extra.length&&['c503_4_n1','c505_4_3b','c507_5_1b'].every(id=>D.ROWS.some(r=>r.id===id)),J(extra));
  if(!HAS()) return;
  const lines=[]; for(const r of rows()) for(const l of r.lines) lines.push([r,l]);
  const docOf=r=>DOC[(r.heardFrom?R(r.heardFrom):r).doc];   /* heardFrom（照 AA_506 4-1、暑假照舊）：句子在那一列的稿裡 */
  const badLine=lines.filter(([r,l])=>docOf(r).indexOf(l.t)<0), badWho=lines.filter(([r,l])=>l.label&&!l.id);
  check('0. 遊戲裡的每一句都在它那一份稿裡（'+lines.length+' 句）',lines.length>=200&&!badLine.length,J(badLine.slice(0,4).map(([r,l])=>r.id+':'+l.t)));
  check('0. 每一句說話的人都對得到人物或標籤同伴（NAMES）',!badWho.length&&lines.every(([r,l])=>!l.id||!!CHARACTERS[l.id]||isLabel(l.id)),J(badWho.slice(0,4).map(([r,l])=>r.id+':'+l.label)));
  const nw=rows().filter(r=>live(r)&&r.with).filter(r=>r.with.some(c=>!CHARACTERS[c]&&!isLabel(c)));
  check('0. 每一列的「和誰」都是人物或標籤同伴',!nw.length,J(nw.map(r=>r.id)));
  const ownLine=rows().filter(r=>live(r)&&r.lines.length&&!r.alone).filter(r=>!r.lines.some(l=>l.id===r.who));
  check('0. 有同伴的列，她自己都有說話（同伴說的句子說話的人是 with 裡的人）',!ownLine.length&&rows().filter(r=>live(r)&&!r.alone&&r.lines.length).every(r=>r.lines.every(l=>!l.id||l.id===r.who||r.with.includes(l.id))),J(ownLine.map(r=>r.id))); });

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
  check('1. 不在那一區的同伴：回傳跟著她的那一筆（hc＝那一列、with＝她）——靖雯、阿凱、晨希、晏如',!!a&&a.zone==='campus'&&a.act==='linger'&&a.hc==='c506_3_1'&&a.with==='heroine_03'&&!!b&&b.zone==='campus'&&b.hc==='c503_7_2'&&!!c&&c.zone==='wancai'&&c.hc==='c503_7_1'&&!!d&&d.zone==='wancai',J({a,b,c,d}));
  { const r=R('c506_3_1'), f=findOn(r); fresh(f.d,f.h,'campus'); const on0=HCIRCLE.on(r,H.G); H.G.invites=[{id:'iv1',who:'heroine_03',place:'wenzhou',state:'going',zone:'wenzhou',day:f.d,h:f.h}]; const on1=HCIRCLE.on(r,H.G), zj=ent('pool_7');
    check('1. 她和玩家一起走過去（邀約 going，INV.entryFor）的時候：那一列不成立、靖雯不跟過去',on0===true&&on1===false&&!(zj&&zj.hc),J({on0,on1,zj:zj&&zj.zone})); }
  const e1=chk('c503_6_1','npc_huangxh'), e2=chk('c504_6_1','classmate_bohan');
  check('1. 本來就在那一區的同伴照他自己的（筱涵在校園、柏翰在總圖：沒有 hc）',!!e1&&e1.zone==='campus'&&!e1.hc&&!!e2&&e2.zone==='library'&&!e2.hc,J({e1,e2}));
  /* 一定同框＝每一天；其他＝約 70%、同一天一樣 */
  const always=[], ratio=[];
  for(const r of rows()){ if(!live(r)||r.alone||r.once||r.cls) continue; let elig=0, on=0; const f0=findOn(r,FLAGS[r.id]); if(!f0) continue;   /* 每一天用同一個時間（找得到成立的那個時間）*/
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
  const days=[].concat([9,10,11].flatMap(w=>[1,2,3,4,5,6,0].map(wd=>TD('Y1S1',w,wd))),[2,3].flatMap(w=>[1,2,3,4,5,6,0].map(wd=>TD('Y2S2',w,wd))),[0,1,2,3,4,5,6].map(i=>DK('2026-07-06')+i));
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
    const r=R('c504_6_1'); const f=findOn(r); fresh(f.d,f.h,'library'); stage('library',seats); STORY._bindGM(GM); HCIRCLE.bind(GM);
    const ps=GM.spawnCharacter('classmate_peishan',0,0,{seat:E.zone.seats[0],pose:'read'}); const bh=GM.spawnCharacter('classmate_bohan',8,5,{seat:E.zone.seats[3],pose:'read'}); HCIRCLE.arrange(GM,false);
    check('2. 大一下 4/6 以後的總圖：柏翰坐到沛珊旁邊的空位',!!bh.seat&&Math.hypot(bh.seat.x-0,bh.seat.z-0)<1&&bh.seat!==E.zone.seats[3],J(bh.seat)); }
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
  check('4. 第一次在同伴旁邊找她說話：兩位同學在這裡認識（FIRST_MET）、名字從外觀描述換成名字、熟悉＋3',!before5&&SOCIAL.has('pool_5','FIRST_MET')&&SOCIAL.has('pool_11','FIRST_MET')&&nm0!=='葉晨希'&&SOCIAL.npcName('pool_11')==='葉晨希'&&cx.name==='葉晨希'&&(SOCIAL.rel('pool_11').fam|0)>=fam0+3,J({nm0,nm1:cx.name,fam0,fam1:SOCIAL.rel('pool_11').fam}));
  /* 之後找晨希說話：不是第一次（不演自己的認識那一場：沒有「我是葉晨希。」）*/
  H.said=[]; await STORY.talkCharacter('pool_11',cx); const L2=said();
  check('4. 認識以後找同學說話：不再演他自己的認識那一場（沒有自我介紹）',!L2.some(s=>/我是葉晨希/.test(s)),J(L2.slice(0,3)));
  /* 第一批的曾靖雯（BATCH1）：在語彤旁邊認識＝POOL.afterMeet（他那條線的「認識」那一段）、之後不演 meetBell／meetClass */
  { const r2=R('c506_3_1'); const f2=findOn(r2); fresh(f2.d,f2.h,'campus'); stage('campus'); STORY._bindGM(GM); HCIRCLE.bind(GM); POOL.bind(GM); H.FRIEND('heroine_03'); SOCIAL.meet('heroine_03','campus');
    const yt=GM.spawnCharacter('heroine_03',36.6,-97.4,{yaw:Math.PI/2}); yt.frozen=true; const zj=GM.spawnCharacter('pool_7',36.6,-98.35,{}); E.player.obj.position={x:37.5,y:0,z:-96.8}; HCIRCLE.arrange(GM,false);
    H.said=[]; await yt.talk(yt); const seg=(POOL.rec(H.G).seg.pool_7||{}).meet;
    check('4. 曾靖雯（第一批）在語彤旁邊認識：FIRST_MET、他那條線「認識」那一段記下（POOL.afterMeet）',SOCIAL.has('pool_7','FIRST_MET')&&seg===H.G.day,J({seg}));
    set(f2.d,6.8,'campus'); H.said=[]; await STORY.talkCharacter('pool_7',zj); check('4. 之後在傅鐘找她：不演 meetBell（「我叫曾靖雯。」）',!said().some(s=>/我叫曾靖雯/.test(s)),J(said().slice(0,3))); }
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
  check('6. story3d.js：schedEnt 問 SCHED_WITH（pri 之後）、populateSchedule 在 pairUp 之前跑 PRE_PAIR、pairUp 跳過 noPair、offerInvite 問 COMPANY',/ent\.pri&&hit\(ent\)\) return actEnt\(ent\);[^\n]*\n\s*if\(S\.SCHED_WITH/.test(st)&&/S\.PRE_PAIR\)\{[^\n]*\n\s*pairUp\(zoneId,GM\); \}/.test(st)&&/!n\.paired&&!n\.noPair&&/.test(st)&&/const crowd=S\.COMPANY\.some/.test(st)&&/!\(crowd&&o\.priv\)/.test(st));
  check('6. multirel3d.js：告白的兩個一次性選項標 priv',(mr.match(/priv:true,run:/g)||[]).length===2);
  const AL=JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files||[];
  const badA=Object.keys(DOCS).filter(k=>{ const e=AL.find(q=>q.path===DOCS[k][0]); return !e||String(e.sha)!==DOCS[k][1]||e.status!=='approved'||!e.approvedBy||!/HEROINE-CIRCLE3D-1028/.test(e.note||''); });
  check('6. 劇情匯入白名單：AA_503～508 是對稿的那一版（sha 相同）、approved、有 approvedBy，note 寫了 3D 圈子',!badA.length,J(badA)); });

H.done();
})();
