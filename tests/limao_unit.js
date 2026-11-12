/* 禮貌生財上師的免費算命、聊天（LIMAO-SHOP-1110，使用者 X332；LAWWW 2026-11-11）——不需要瀏覽器（D131）。這是模擬，不是真實玩家流程。
   字：src/data/limao.js（AA_750 @93f731790，tools/story/import_limao.py）；演出：src/limao3d.js；場景：src/tingzhou3d.js、src/tz_shops3d.js（LAWWW2，沒有改）。
   1  index.html 有載入（資料在前、程式在後，都在 tingzhou3d.js、tz_shops3d.js 後面）；白名單有那一筆；匯入工具 --check 一致
   2  逐字對稿：有企劃線那個 commit 就整份一句一句比（說話的人、字、orig）；使用者原句（o:true）每一句都在規格書裡（一字不差）；選單＝稿的四類＋離開
   3  when：稿的每一個條件都對得到現有的判斷（S.unmapped 空的）；對照表沒有多的
   4  街上：算命桌的互動點在配置的位置、站得住；19:00 以前、23:30 以後、颱風、上師不在、經濟系那一年＝藏起來，硬按＝什麼都不說
   5  第一次＝first 整段（名字：祐廷／上師／旁白沒名字）、記 LM_MET、時間過 15 分鐘；不扣錢、不動關係
   6  第二次＝選單（四類＋離開）；選離開＝不說話、時間不動
   7  四類抽組：每一類把條件成立的組都講過一輪以前不重複、之後不連續重複；有條件的組條件不成立不出、成立才出
   8  serious：剛分手（三十天內）＝選哪一類都先演 lv4 一次，之後不再出；落榜 lf5 一樣；記在 LM_SER
   9  教授偶遇：大一上不演、認識的那一天不演；大一下隔天走到桌前＝prof 整段（吳教授的名字照人物資料）、記 LM_PROF、只演一次
   10 身分揭曉：大三不開；大四＝入口 A 的事件（法律系館、一次、字照稿、演完記 LM_HINT）、入口 B（店裡書房的門：兩句旁白、記 LM_HINT）；
      看過入口以前選單五項、以後最上面多稿的那一句；選了＝從第二句演完、記 LM_KNOWN＋LM_STUDY；之後選單回到五項、ch6 可以出
   11 書房：沒有 LM_STUDY＝鎖著（TZS3.studyOpen false、門只有「看」）；有＝區域一建好就開著，四個點（書櫃、書桌、合照、學生來信）各念稿的那一句旁白、都站得住走得到
   12 存檔：整個流程下來存檔只多 G.flags 的 LM_MET／LM_PROF／LM_KNOWN／LM_STUDY／LM_HINT／LM_SER；沒有 flags 的舊存檔不出錯；錢、關係沒有動
   修改前（開發分支 11161c101：沒有 limao.js、limao3d.js）：0 就 FAIL。用法：node tests/limao_unit.js */
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..'), SHA='0ec5f3751a'/* 2026-11-12：補前半命理館三個互動點 front_room（舊 93f731790）*/   /* 2026-11-11 改期望：AA 回七題後補 closed 兩句、入口 A 標題、信改木盒（原 227db1c9e）*/, SRC='docs/story_planning/AA_750_limao.json', SPEC='docs/handoff/user_specs/LIMAO_SHENGCAI_1110.md';
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',e=>{ console.log('FAIL 沒接住的錯誤 '+(e&&e.stack||e)); process.exitCode=1; });
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const need=['src/data/limao.js','src/limao3d.js','tools/story/import_limao.py'].filter(f=>!fs.existsSync(path.join(ROOT,f)));
if(need.length){ check('0. 禮貌生財上師的檔案在',false,need.join(' ')); console.log('FAILED: '+fails); process.exit(1); }
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);

/* ---- 假的行事曆、人物、關係、成績、國考（條件由測試定）---- */
const TERM_IDS=['Y0S1','Y0S2','Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'];
const W={term:'Y1S1',week:5,inTerm:true,typhoon:false,failed:{},partners:[],stage:{},pgFail:{}};
global.CALENDAR={TERMS:TERM_IDS.map(id=>({id,weeks:16})),typhoon:()=>W.typhoon,
  termOf:d=>{ if(!W.inTerm) return null; const wk=W.week+Math.floor((d-GAME.G.day)/7); return wk>=1&&wk<=16?{id:W.term,week:wk,exam:wk>=16?'final':(wk>=8&&wk<=9?'mid':null)}:null; }};
global.STORY={termAt:()=>W.term};
global.STORY_EVENTS=[];
global.CHARACTERS={prof_wu:{id:'prof_wu',name:'吳教授',gender:'m'},heroine_01:{id:'heroine_01',name:'以安',gender:'f'},kai:{id:'kai',name:'阿凱',gender:'m'}};
global.SOCIAL={STAGES:['STRANGER','ACQUAINTANCE','FAMILIAR','FRIEND','CLOSE_FRIEND','POSSIBLE_ROMANTIC_INTEREST','ROMANTIC_TENSION','RELATIONSHIP'],stage:id=>W.stage[id]||'STRANGER',displayName:id=>CHARACTERS[id].name};
global.ROM={partners:()=>W.partners.slice()};
global.CLS={failedIn:(G,t)=>W.failed[t]||[]};
global.PG={failed:(G,y)=>!!W.pgFail[y],done:(G,id)=>!!W.pgFail[+id.slice(3)]};

const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/tingzhou_layout.js','src/tingzhou3d.js','src/data/tz_shops_layout.js','src/tz_shops3d.js','src/data/limao.js','src/limao3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|TZ3|TZS3|TINGZHOU_LAYOUT|TZ_SHOPS_LAYOUT|LINZE_LAYOUT|CLASSROOM_LAYOUT|PROPS|CHAR|LIMAO|LM)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
if(typeof ASSETS!=='undefined') ASSETS.loadOne=()=>new Promise(()=>{});
const D=LIMAO, L=TINGZHOU_LAYOUT.limao, RL=TZ_SHOPS_LAYOUT.limao, html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.nav._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
const stand=(x,z,lv,r)=>E.canStand(x,z,r==null?0.32:r,lv|0);
function standNear(it){ const R=Math.min(it.radius||1,1.2); if(stand(it.x,it.z,0)) return [it.x,it.z,0]; for(let r=0.15;r<=R-0.1;r+=0.15) for(let a=0;a<16;a++){ const x=it.x+Math.cos(a/16*Math.PI*2)*r, z=it.z+Math.sin(a/16*Math.PI*2)*r; if(stand(x,z,0)) return [x,z,0]; } return null; }
const walk=(a,b)=>E.simWalk(a[0],a[1],b[0],b[1],{lv0:0,lv1:0,dt:1/30,speed:1.8});

/* ---- 假的遊戲 ---- */
let LOG=[], MENUS=[], CAPS=[], DEPTH=0, MONEY=0, PICK=()=>null;
const newG=o=>Object.assign({stage:'law',name:'祐廷',day:100,hour:20,money:5000,weather:'clear',flags:{},rel:{an:6},social:{rel:{heroine_01:{fam:50},kai:{fam:90}}}},o||{});
const GM={G:newG(),npc:{},E,say:async(who,t,opts)=>{ LOG.push([who?who.name:null,t,who&&who.charId||null,!!(opts&&opts.me)]); },choose:async opts=>{ MENUS.push(opts.map(o=>o.t)); return PICK(opts.map(o=>o.t)); },
  sceneBegin(){ DEPTH++; }, sceneEnd(){ DEPTH--; }, advance(h){ GM.G.hour+=h; }, autosave(){}, caption(w,t){ CAPS.push(t); }, money(n){ MONEY+=n; GM.G.money+=n; }, toast(){} };
global.GAME=GM;
const reset=()=>{ LOG=[]; MENUS=[]; CAPS=[]; };
const byT=t=>ts=>ts.indexOf(t);
const sameLines=(log,lines,from)=>eq(log.map(x=>x[1]),lines.slice(from|0).map(l=>l.t));
const NAME={yt:'祐廷',ms:'上師',wu:'吳教授',narr:null};
const sameWho=(log,lines,from)=>eq(log.map(x=>x[0]),lines.slice(from|0).map(l=>NAME[l.w]));

(async()=>{
/* 1 */
{ const iD=html.indexOf('src/data/limao.js'), iC=html.indexOf('src/limao3d.js'), iT=html.indexOf('src/tingzhou3d.js'), iS=html.indexOf('src/tz_shops3d.js');
  check('1. index.html 載入 limao.js（資料）、limao3d.js（程式），都在 tingzhou3d.js、tz_shops3d.js 後面',iD>0&&iC>iD&&iD>iT&&iD>iS);
  const allow=JSON.parse(fs.readFileSync(path.join(ROOT,'docs/handoff/story_import_allow.json'),'utf8')), e=allow.files.filter(x=>x.path===SRC);
  check('1. 白名單有 AA_750 那一筆（approved、'+SHA+'）；資料檔寫的來源一樣',e.length===1&&e[0].status==='approved'&&e[0].sha===SHA&&!!e[0].approvedBy&&D.src===SRC+'@'+SHA,JSON.stringify(e.map(x=>[x.sha,x.status])));
  let out='', ok=false, skip=false; try{ cp.execFileSync('git',['-C',ROOT,'cat-file','-e',SHA+':'+SRC],{stdio:'ignore'}); }catch(err){ skip=true; }
  if(!skip){ try{ out=cp.execFileSync('python3',[path.join(ROOT,'tools/story/import_limao.py'),'--check'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}); ok=/^OK/.test(out); }catch(err){ out=String(err.stderr||err.message).slice(0,200); } }
  check('1. 匯入工具 --check：資料檔和企劃稿一致'+(skip?'（這個複本沒有企劃線的 '+SHA+'，略過）':''),skip||ok,out.trim().slice(0,120)); }

/* 2 */
const allLines=()=>{ const out=[]; const add=(k,a)=>a.forEach((l,i)=>out.push([k+'['+i+']',l])); add('first',D.first.lines); for(const k in D.pool) for(const g of D.pool[k]) add(g.id,g.lines); add('prof',D.prof.lines); add('entryA',D.reveal.entryA.lines); add('entryB',D.reveal.entryB.lines); add('talk',D.reveal.talk.lines); return out; };
{ const A=allLines(), bad=A.filter(([k,l])=>!['yt','ms','wu','narr'].includes(l.w)||typeof l.t!=='string'||!l.t||Object.keys(l).some(q=>!['w','t','o'].includes(q))).map(x=>x[0]);
  const n=Object.keys(D.pool).reduce((s,k)=>s+D.pool[k].length,0);
  check('2. 資料的樣子：每一句＝{w,t,(o)}；四類 5＋5＋5＋6＝21 組；選單＝聊聊天／問學業與考試／問感情／問人生方向／離開',!bad.length&&n===21&&eq(Object.keys(D.pool).map(k=>D.pool[k].length),[5,5,5,6])&&eq(D.menu.map(m=>m.t),['聊聊天','問學業與考試','問感情','問人生方向','離開'])&&eq(D.menu.map(m=>m.pool||null),['chat','study','love','life',null]),bad.join(' '));
  const spec=fs.readFileSync(path.join(ROOT,SPEC),'utf8'), O=A.filter(x=>x[1].o), miss=O.filter(([k,l])=>spec.indexOf('「'+l.t+'」')<0).map(x=>x[0]+' '+x[1].t);
  check('2. 使用者原句（o:true，'+O.length+' 句）每一句都在規格書裡、一字不差',O.length===28&&!miss.length,miss.join(' | '));
  let raw=null; try{ raw=JSON.parse(cp.execFileSync('git',['-C',ROOT,'show',SHA+':'+SRC],{encoding:'utf8',maxBuffer:1<<26,stdio:['ignore','pipe','ignore']})); }catch(e){}
  if(!raw) check('2. 整份逐字比企劃稿（這個複本沒有企劃線的 '+SHA+'，略過）',true);
  else { const diff=[]; const cmp=(k,a,b)=>{ if(a.length!==b.length){ diff.push(k+' 句數'); return; } a.forEach((r,i)=>{ const w=Object.keys(r).find(q=>q!=='orig'), l=b[i]; if(l.w!==w||l.t!==r[w]||!!l.o!==!!r.orig) diff.push(k+'['+i+']'); }); };
    cmp('first',raw.first.lines,D.first.lines); cmp('prof',raw.prof.lines,D.prof.lines); cmp('entryA',raw.reveal.entryA.lines,D.reveal.entryA.lines); cmp('entryB',raw.reveal.entryB.lines,D.reveal.entryB.lines); cmp('talk',raw.reveal.talk.lines,D.reveal.talk.lines);
    let groups=0; for(const k of ['study','love','life','chat']){ if(raw.pool[k].length!==D.pool[k].length) diff.push(k+' 組數'); raw.pool[k].forEach((g,i)=>{ const h=D.pool[k][i]||{lines:[]}; groups++; if(g.id!==h.id||(g.when||null)!==(h.when||null)||!!g.serious!==!!h.serious) diff.push(g.id+' 欄位'); cmp(g.id,g.lines,h.lines); }); }
    if(!eq(raw.menu,D.menu.map(m=>m.t))) diff.push('menu'); if(!eq(raw.study_room.look,D.study_room.look)) diff.push('study_room'); if(!eq(raw.reveal.talk.set,D.reveal.talk.set)||raw.first.set!==D.first.set||raw.prof.set!==D.prof.set) diff.push('set');
    for(const k of ['first','prof','reveal','study_room']) if(raw[k].when!==D[k].when) diff.push(k+'.when');
    check('2. 整份逐字比企劃稿（'+SHA+'）：每一句說話的人、字、orig，每一組的 id／when／serious，選單、旗標、書房四句都一樣',!diff.length&&groups===21,diff.join(' ')); } }

/* 3 */
{ const un=LM.unmapped(), used=new Set(); for(const k in D.pool) for(const g of D.pool[k]) if(g.when) used.add(g.when); const extra=Object.keys(LM.WHEN).filter(k=>!used.has(k));
  check('3. 稿的 when 每一個都對得到現有的判斷（'+used.size+' 種；對不到的 0 個）；對照表沒有稿上沒有的',!un.length&&!extra.length&&used.size===11,un.concat(extra).join(' | ')); }

/* 4 街上 */
const zT=loadZone('tingzhou'); const itT=E.interactables.find(i=>i.lmTable);
{ const A=L.table.at, p=itT&&standNear(itT), sp=[zT.spawn.x,zT.spawn.z,0];
  check('4. 算命桌的互動點在配置 limao.table.at、站得住、從出生點走得到；按鈕不是台詞（'+LM.LABEL+'）',!!itT&&itT.x===A.x&&itT.z===A.z&&itT.radius===A.r&&!!p&&walk(sp,p).ok&&itT.label===LM.LABEL&&typeof itT.onInteract==='function');
  /* 2026-11-11 改期望（AA 93f731790 補了 closed 兩句）：收攤、上師不在的時候互動點不再藏起來，按鈕變「看算命桌」、按了念稿的旁白；能聊（按鈕「算命桌」）的時間不變；經濟系那一年照舊整個藏 */
  const vis=(h,o)=>{ GM.G=newG(Object.assign({hour:h},o||{})); return itT.hidden?null:itT.label; };
  const a=[vis(18.9),vis(19),vis(23.4),vis(23.5),vis(2)]; W.typhoon=true; const ty=vis(20); W.typhoon=false; zT.tzLimaoAway=true; const aw=vis(20); zT.tzLimaoAway=false; const ec=vis(20,{stage:'econ'});
  const T=LM.LABEL, K=LM.LABEL_LOOK;
  check('4. 營業（配置 19:00～23:30）按鈕是「'+T+'」：18:54 不是、19:00 是、23:24 是、23:30 不是、凌晨不是；颱風、上師不在＝「'+K+'」；經濟系那一年沒有這個點',eq(a,[K,T,T,K,K])&&ty===K&&aw===K&&ec===null&&T!==K,JSON.stringify(a)+ty+aw+ec);
  GM.G=newG({hour:18}); reset(); const h0=GM.G.hour, r=await LM.table(GM,zT);
  check('4. 收攤的時候按：只有稿 closed 收攤那一句旁白（沒有名字）、不出選單、時間不動、不記旗標；模型是收攤的樣子（zone.tzLimao.open false）',r==='closed'&&eq(LOG,[[null,D.closed.shut,null,false]])&&!MENUS.length&&GM.G.hour===h0&&!Object.keys(GM.G.flags).length&&zT.tzLimao.open===false&&DEPTH===0,JSON.stringify(LOG));
  { GM.G=newG({hour:20}); reset(); zT.tzLimaoAway=true; const h1=GM.G.hour, r2=await LM.table(GM,zT); const okAway=r2==='closed'&&eq(LOG,[[null,D.closed.away,null,false]])&&!MENUS.length&&GM.G.hour===h1&&!Object.keys(GM.G.flags).length&&zT.tzLimao.open===true; zT.tzLimaoAway=false;
    W.typhoon=true; GM.G=newG({hour:20}); reset(); const r3=await LM.table(GM,zT); const okTy=r3==='closed'&&eq(LOG,[[null,D.closed.shut,null,false]]); W.typhoon=false;
    GM.G=newG({hour:20,stage:'econ'}); reset(); const r4=await LM.table(GM,zT); const okEc=r4==='closed'&&!LOG.length;
    let raw=null; try{ raw=JSON.parse(cp.execFileSync('git',['-C',ROOT,'show',SHA+':'+SRC],{encoding:'utf8',maxBuffer:1<<26,stdio:['ignore','pipe','ignore']})); }catch(e){}   /* 這份 checkout 沒有企劃線那個 commit（GHA 淺層複本）＝不比稿，只驗演出 */
    check('4. 店開著、上師不在（tzLimaoAway）按＝稿 closed「店開著、他不在」那一句；颱風＝收攤那一句；經濟系那一年什麼都不說；兩句和稿一字不差',okAway&&okTy&&okEc&&(!raw||(D.closed.shut===raw.closed['收攤']&&D.closed.away===raw.closed['店開著、他不在']))&&DEPTH===0,[r2,r3,r4].join()+JSON.stringify(LOG)); }
  GM.G=newG({hour:20}); zT.applyTimeOutdoor(20,null); check('4. 20:00 區域切到營業（zone.tzLimao.open true、門是「進禮貌生財」）',zT.tzLimao.open===true&&/^進/.test(zT.tzLimao.door.label),zT.tzLimao.door.label);
  W.typhoon=true; zT.applyTimeOutdoor(20,null); const off=zT.tzLimao.open; W.typhoon=false; zT.applyTimeOutdoor(20,null); check('4. 颱風假那天不開（zone.tzLimaoOff → 模型收攤）',off===false&&zT.tzLimao.open===true); }

/* 5 第一次 */
const G0=newG({hour:20,day:100}); GM.G=G0; W.term='Y1S1'; W.week=5;
{ reset(); const before=JSON.stringify([G0.money,G0.rel,G0.social]), r=await LM.table(GM,zT);
  check('5. 第一次＝first 整段 '+D.first.lines.length+' 句、照順序、一字不差；名字＝祐廷／上師／旁白沒名字；不出選單',r==='first'&&sameLines(LOG,D.first.lines)&&sameWho(LOG,D.first.lines)&&!MENUS.length&&LOG[1][3]===true&&LOG[2][3]===false,r+' '+LOG.length);
  check('5. 記 LM_MET（第 100 天）；時間過 15 分鐘；錢、關係沒動；段落收乾淨',G0.flags.LM_MET===100&&Math.abs(G0.hour-20.25)<1e-9&&JSON.stringify([G0.money,G0.rel,G0.social])===before&&MONEY===0&&DEPTH===0&&eq(Object.keys(G0.flags),['LM_MET'])); }

/* 6 選單 */
{ reset(); PICK=byT('離開'); const h0=G0.hour, r=await LM.table(GM,zT);
  check('6. 第二次＝選單（聊聊天／問學業與考試／問感情／問人生方向／離開），沒有付費的項目；選離開＝不說話、時間不動',r==='leave'&&eq(MENUS,[['聊聊天','問學業與考試','問感情','問人生方向','離開']])&&!LOG.length&&G0.hour===h0&&DEPTH===0,JSON.stringify(MENUS)); }

/* 7 抽組 */
{ const cats=[['chat','聊聊天'],['study','問學業與考試'],['love','問感情'],['life','問人生方向']], bad=[]; let rnd=7; LM.rand=()=>{ rnd=(rnd*16807)%2147483647; return rnd/2147483647; };
  for(const [k,t] of cats){ const el=D.pool[k].filter(g=>!g.serious&&LM.ok(G0,g)).map(g=>g.id), got=[]; PICK=byT(t);
    for(let i=0;i<el.length*4;i++){ G0.hour=20; reset(); const r=await LM.table(GM,zT); got.push(r); const g=D.pool[k].find(q=>q.id===r); if(!g||!sameLines(LOG,g.lines)||!sameWho(LOG,g.lines)||Math.abs(G0.hour-20.25)>1e-9) bad.push(k+' 第 '+i+' 次 '+r); }
    for(let c=0;c<4;c++){ const part=got.slice(c*el.length,(c+1)*el.length); if(new Set(part).size!==el.length||part.some(id=>!el.includes(id))) bad.push(k+' 第 '+(c+1)+' 輪 '+part.join(',')); }
    for(let i=1;i<got.length;i++) if(got[i]===got[i-1]&&el.length>1) bad.push(k+' 連續 '+got[i]); }
  check('7. 四類各抽四輪：每一輪把條件成立的組各講一次才重來、不連續重複；每一組的句子、名字照稿；每次 15 分鐘',!bad.length,bad.slice(0,6).join(' | '));
  const ids=k=>D.pool[k].filter(g=>!g.serious&&LM.ok(GM.G,g)).map(g=>g.id).join(',');
  const base=[ids('study'),ids('love'),ids('life'),ids('chat')];
  check('7. 大一上、沒下雨、沒交往、沒有朋友以上的女生：只有沒條件的組＋「沒有交往對象」',eq(base,['st1,st2,st5','lv1,lv5','lf1,lf4','ch1,ch2,ch3,ch5']),base.join(' / '));
  W.week=15; const a=ids('study'); W.week=16; const a2=ids('study'); W.week=5; W.term='Y1S2'; W.failed.Y1S1=[{id:'x'}]; const b=ids('study'); W.inTerm=false; W.term='Y1S1'; const b2=ids('study'); W.inTerm=true; W.failed={}; W.term='Y1S1';
  check('7. 期末考前一週（第 15 週）多 st3、期末考週不算；上學期被當（大一下看大一上；寒假看剛過完的大一上）多 st4',a==='st1,st2,st3,st5'&&a2==='st1,st2,st5'&&b==='st1,st2,st4,st5'&&b2==='st1,st2,st4,st5',[a,a2,b,b2].join(' / '));
  W.stage.heroine_01='FRIEND'; const c=ids('love'); W.stage={kai:'CLOSE_FRIEND'}; const c0=ids('love'); W.stage={heroine_01:'FRIEND'}; W.partners=['kexin']; const c2=ids('love'); W.partners=[]; W.stage={};
  check('7. 感情：有朋友以上的女生＝多 lv2（男生朋友不算）；交往中＝lv3、沒有 lv1／lv2',c==='lv1,lv2,lv5'&&c0==='lv1,lv5'&&c2==='lv3,lv5',[c,c0,c2].join(' / '));
  W.term='Y3S1'; const d=ids('life'); W.term='Y4S1'; const d2=ids('life'); W.term='Y1S1'; GM.G.weather='rain'; const e=ids('chat'); GM.G.weather='clear'; GM.G.flags.LM_KNOWN=true; const e2=ids('chat'); delete GM.G.flags.LM_KNOWN;
  check('7. 人生方向：大三多 lf2、大四多 lf2＋lf3；聊天：下雨多 ch4、知道身分以後多 ch6',d==='lf1,lf2,lf4'&&d2==='lf1,lf2,lf3,lf4'&&e==='ch1,ch2,ch3,ch4,ch5'&&e2==='ch1,ch2,ch3,ch5,ch6',[d,d2,e,e2].join(' / ')); }

/* 8 serious */
{ const lv4=D.pool.love.find(g=>g.id==='lv4'), lf5=D.pool.life.find(g=>g.id==='lf5');
  G0.flags.romance={kexin:{status:'ex',history:[{ev:'start',day:1},{ev:'end',day:60}]}}; G0.day=100; const far=LM.seriousDue(G0); G0.day=85; const near=LM.seriousDue(G0);
  check('8. 分手第 40 天不算、第 25 天算（三十天內）',far===null&&near===lv4);
  G0.hour=20; reset(); PICK=byT('聊聊天'); const r=await LM.table(GM,zT), ok1=r==='lv4'&&sameLines(LOG,lv4.lines)&&sameWho(LOG,lv4.lines);
  G0.hour=20; reset(); PICK=byT('問感情'); const got=[]; for(let i=0;i<12;i++){ G0.hour=20; got.push(await LM.table(GM,zT)); }
  check('8. 剛分手：選「聊聊天」也先演 lv4（三句、他不開玩笑）；演過一次（LM_SER.lv4）以後怎麼選都不再出',ok1&&G0.flags.LM_SER.lv4===85&&!got.includes('lv4')&&LM.seriousDue(G0)===null,r+' '+got.join(','));
  W.pgFail[2029]=true; G0.flags.BAR_SIT_2029=true; G0.flags.PG={}; const due=LM.seriousDue(G0); G0.hour=20; reset(); PICK=byT('問學業與考試'); const r2=await LM.table(GM,zT); G0.hour=20; reset(); const r3=await LM.table(GM,zT);
  check('8. 落榜（國考一試放榜沒過）：選哪一類都先演 lf5 一次，下一次回到一般的組',due===lf5&&r2==='lf5'&&/^st/.test(r3)&&G0.flags.LM_SER.lf5===85,r2+' '+r3);
  const g2=newG(); g2.flags.GRAD_EXAM_RESULT='fail'; const g3=newG(); g3.flags.JUDGE_PASS_2030=false; const g4=newG(); g4.flags.GRAD_EXAM_RESULT='pass';
  check('8. 研究所筆試沒上、司法官二試沒上也算落榜；考上的不算',LM.flunked(g2)&&LM.flunked(g3)&&!LM.flunked(g4)&&!LM.flunked(newG()));
  W.pgFail={}; delete G0.flags.BAR_SIT_2029; delete G0.flags.PG; delete G0.flags.romance; G0.day=100; }

/* 9 教授偶遇 */
{ W.term='Y1S1'; const a=LM.profDue(G0); W.term='Y1S2'; const b=LM.profDue(G0); G0.day=101; const c=LM.profDue(G0);
  check('9. 大一上不演；大一下、認識的那一天不演；隔天以後才演',!a&&!b&&c);
  /* 2026-11-11（BB 定）：撞見吳教授和「認真那一組」（剛分手、剛落榜）同時成立＝認真那一組先演，撞見留到下一次去 */
  { const sv=GM.G, g=newG({day:101,hour:20}); g.flags.LM_MET=50; g.flags.romance={kexin:{status:'ex',history:[{ev:'start',day:1},{ev:'end',day:90}]}}; GM.G=g;
    const both=!!LM.profDue(g)&&!!LM.seriousDue(g); reset(); PICK=byT('聊聊天'); const r1=await LM.table(GM,zT), noProf=!g.flags.LM_PROF, menu1=MENUS.length; g.hour=20; reset(); const r2=await LM.table(GM,zT); GM.G=sv;
    check('9. 剛分手、又該撞見吳教授：這一次先出選單、演 lv4（不記 LM_PROF）；下一次去才演撞見',both&&r1==='lv4'&&noProf&&menu1===1&&r2==='prof'&&g.flags.LM_PROF===true,[both,r1,noProf,r2].join()); }
  G0.hour=21; reset(); const r=await LM.table(GM,zT), wu=LOG.filter(x=>x[2]==='prof_wu');
  check('9. 走到桌前＝prof 整段 '+D.prof.lines.length+' 句照稿；吳教授的名字照人物資料（prof_wu）；不出選單；記 LM_PROF、15 分鐘',r==='prof'&&sameLines(LOG,D.prof.lines)&&sameWho(LOG,D.prof.lines)&&wu.length===4&&wu.every(x=>x[0]==='吳教授')&&!MENUS.length&&G0.flags.LM_PROF===true&&Math.abs(G0.hour-21.25)<1e-9,r);
  G0.hour=21; reset(); PICK=byT('離開'); const r2=await LM.table(GM,zT); check('9. 只演一次：下一次是選單',r2==='leave'&&MENUS.length===1&&!LOG.length,r2);
  const g=newG({stage:'econ'}); g.flags.LM_MET=1; check('9. 經濟系那一年不演',!LM.profDue(g)); }

/* 10 身分揭曉 */
const TALK=D.reveal.talk.lines;
{ W.term='Y3S2'; const a=LM.hintDue(G0); W.term='Y4S1'; const b=LM.hintDue(G0);
  check('10. 大三不開、大四開（有 LM_PROF、沒有 LM_KNOWN）；沒有 LM_PROF 的大四不開',!a&&b&&!LM.hintDue(newG()));
  const ev=STORY_EVENTS.find(e=>e.id===LM.EV_A), A=D.reveal.entryA.lines;
  check('10. 入口 A 事件的標題照稿（AA 93f731790：「'+D.reveal.entryA.title+'」）',!!ev&&!!D.reveal.entryA.title&&ev.title===D.reveal.entryA.title,ev&&ev.title);
  const dl=ev?ev.dialogue.filter(x=>x.text!==undefined):[], call=ev?ev.dialogue.find(x=>typeof x.call==='function'):null;
  check('10. 入口 A：事件 '+LM.EV_A+'（進法律系館 wancai、一次、臨時生出吳教授）；三句照稿（祐廷＝player、吳教授＝prof_wu）；條件＝還沒看過入口',!!ev&&ev.trigger==='enter'&&ev.location==='wancai'&&ev.once===true&&ev.spawn.npc==='prof_wu'&&eq(ev.participants,['prof_wu'])&&eq(dl.map(x=>[x.speaker,x.text]),A.map(l=>[l.w==='yt'?'player':'prof_wu',l.t]))&&ev.prereq.custom(G0)===true&&STORY_EVENTS.filter(e=>e.id===LM.EV_A).length===1&&LM.register()&&STORY_EVENTS.filter(e=>e.id===LM.EV_A).length===1);
  G0.hour=20; reset(); PICK=byT('離開'); await LM.table(GM,zT); const m0=MENUS[0].slice();
  const gA=JSON.parse(JSON.stringify(G0)); call.call(gA); check('10. 入口 A 演完記 LM_HINT；演過以後事件的條件不成立',gA.flags.LM_HINT==='A'&&ev.prereq.custom(gA)===false);
  /* 入口 B：店裡 */
  const zR=loadZone(RL.zone), door=E.interactables.find(i=>i.tzPoint==='study_door');
  G0.hour=18; reset(); const rc=await door.onInteract(); const capClosed=CAPS.slice();
  G0.hour=20; reset(); const rb=await door.onInteract(), B=D.reveal.entryB.lines;
  check('10. 入口 B：店開著的時候按「書房的門」＝兩句旁白照稿（沒有名字）、記 LM_HINT、門還是鎖著；店沒開的時候只有「看」',rc==='look'&&capClosed.length===1&&rb==='entryB'&&sameLines(LOG,B)&&LOG.every(x=>x[0]===null)&&G0.flags.LM_HINT==='B'&&zR.studyOpen===false&&DEPTH===0,rc+' '+rb);
  reset(); const rb2=await door.onInteract(); check('10. 入口 B 只演一次：再按＝場景原本的「看」',rb2==='look'&&!LOG.length&&CAPS.length===1&&ev.prereq.custom(G0)===false,rb2);
  loadZone('tingzhou'); G0.hour=20; reset(); PICK=byT('離開'); await LM.table(GM,zT); const m1=MENUS[0].slice();
  check('10. 看過入口以前選單五項；以後最上面多一項＝稿 talk 的第一句（使用者原句）',m0.length===5&&m1.length===6&&m1[0]===TALK[0].t&&TALK[0].o===true&&eq(m1.slice(1),m0),JSON.stringify(m1));
  G0.hour=20; reset(); PICK=byT(TALK[0].t); const r=await LM.table(GM,zT);
  check('10. 選那一項＝從第二句演完（'+(TALK.length-1)+' 句照稿）；記 LM_KNOWN、LM_STUDY；15 分鐘',r==='talk'&&sameLines(LOG,TALK,1)&&sameWho(LOG,TALK,1)&&G0.flags.LM_KNOWN===true&&G0.flags.LM_STUDY===true&&eq(D.reveal.talk.set,['LM_KNOWN','LM_STUDY'])&&Math.abs(G0.hour-20.25)<1e-9,r);
  G0.hour=20; reset(); PICK=byT('離開'); await LM.table(GM,zT);
  check('10. 之後選單回到五項；ch6 可以出了',MENUS[0].length===5&&LM.ok(G0,D.pool.chat.find(g=>g.id==='ch6'))); }

/* 11 書房 */
{ const g=GM.G; GM.G=newG({hour:20}); const lock=TZS3.studyOpen(RL), zL=loadZone(RL.zone), noPts=!E.interactables.some(i=>LM.LOOK_AT[i.tzPoint]);
  check('11. 沒有 LM_STUDY：TZS3.studyOpen false、區域建好書房鎖著、書房裡的點一個都沒有；別間店不受影響',lock===false&&zL.studyOpen===false&&noPts&&TZS3.studyOpen(TZ_SHOPS_LAYOUT.taimi)===false);
  GM.G=g; const open=TZS3.studyOpen(RL), z=loadZone(RL.zone), SP=[RL.spawn.x,RL.spawn.z,0], bad=[]; let n=0;
  for(const id of Object.keys(LM.LOOK_AT)){ const it=E.interactables.find(i=>i.tzPoint===id), want=D.study_room.look.find(q=>q.at===LM.LOOK_AT[id]); if(!it||!want){ bad.push(id+' 沒有'); continue; }
    const p=standNear(it); if(!p||!walk(SP,p).ok) bad.push(id+' 走不到'); reset(); const r=await it.onInteract(); if(!eq(LOG.map(x=>[x[0],x[1]]),[[null,want.narr]])) bad.push(id+' 句子'); n++; }
  check('11. 有 LM_STUDY：區域一建好書房就開著；書櫃、書桌、合照、學生來信四個點各念稿的那一句旁白（沒有名字），都站得住、從門口走得到',open===true&&z.studyOpen===true&&n===4&&!bad.length&&D.study_room.look.length===4&&DEPTH===0,bad.join(' '));
  const door=E.interactables.find(i=>i.tzPoint==='study_door'); reset(); const rd=await door.onInteract(); check('11. 書房開了以後按門＝場景的「看」（不重演入口 B）',rd==='look'&&!LOG.length&&CAPS.length===1);
  const cnt=()=>E.interactables.filter(i=>i.tzPoint===LM.LETTERS.id).length; const c1=cnt(); z.setStudy(false); const c0=cnt(); z.setStudy(true); const c2=cnt();
  check('11. 「學生來信」這個點跟著書房開關（鎖起來拿掉、再開只有一個）',c1===1&&c0===0&&c2===1,[c1,c0,c2].join(',')); }

/* 12 存檔 */
{ const F=G0.flags, ks=Object.keys(F).sort();
  check('12. 整個流程下來 G.flags 只多 LM_MET／LM_PROF／LM_KNOWN／LM_STUDY／LM_HINT／LM_SER；G 其他欄位沒有多的；錢、關係沒有動；存檔轉 JSON 再讀回來一樣',eq(ks,['LM_HINT','LM_KNOWN','LM_MET','LM_PROF','LM_SER','LM_STUDY'])&&eq(Object.keys(G0).sort(),Object.keys(newG()).sort())&&G0.money===5000&&eq(G0.rel,{an:6})&&eq(G0.social,newG().social)&&MONEY===0&&eq(JSON.parse(JSON.stringify(G0)).flags,F),ks.join(' '));
  const old={stage:'law',name:'祐廷',day:300,hour:20,money:10,weather:'clear'}; GM.G=old; W.term='Y2S1'; loadZone('tingzhou'); reset(); let err=null, r=null; try{ r=await LM.table(GM,E.zone); }catch(e){ err=e; }
  check('12. 沒有 flags 的舊存檔：照樣是第一次見面、不出錯',!err&&r==='first'&&old.flags.LM_MET===300&&sameLines(LOG,D.first.lines),String(err||r));
  const src=fs.readFileSync(path.join(ROOT,'src/limao3d.js'),'utf8');
  check('12. 程式裡沒有扣錢、加好感的呼叫（GM.money、SOCIAL.adjust、SOCIAL.activity、G.rel）',!/GM\.money\(|SOCIAL\.(adjust|activity)|\.rel\[/.test(src)); }

// 13 上師的 3D 人物（2026-11-11：模型 char.limao_shangshi 第 3 版；坐在算命桌後面，店開著、他在才看得到）
{ const realAdd=E.addNPC, realChar=global.CHAR, realNpcs=E.npcs, built=[]; E.npcs=[];
  global.CHAR={build:spec=>{ const o=new THREE.Group(); o.userData={buildSpec:spec,wantModel:spec.model||null,degradedHidden:true}; const c=new THREE.Group(); c.visible=false; o.add(c); built.push(spec); return o; }};
  E.addNPC=n=>{ E.npcs.push(n); return n; };
  const zT2=loadZone('tingzhou'); E.zone=zT2; const ST=L.table.seatMaster, K=LM.MODEL_KEY;
  check('13. 模型有登記（'+K+'，lazy、不進路人池）',!!(ASSETS.manifest[K]&&ASSETS.manifest[K].lazy&&!ASSETS.manifest[K].anon),JSON.stringify(ASSETS.manifest[K]&&{lazy:ASSETS.manifest[K].lazy,anon:ASSETS.manifest[K].anon}));
  GM.G=newG({hour:20}); const n=LM.placeMaster(GM);
  check('13. 20:00 進汀州路：上師坐在配置的 seatMaster（坐姿、不走動、不是有名字的同學）、看得到；要的是他自己的模型',!!n&&n===LM.masterNpc&&n.obj.position.x===ST.x&&n.obj.position.z===ST.z&&n.obj.rotation.y===(ST.yaw||0)&&n.pose==='sit'&&n.frozen===true&&n.isExtra===true&&n.obj.visible===true&&built[built.length-1].model===K&&built[built.length-1].id===LM.NPC_ID,n&&JSON.stringify([n.obj.position.x,n.obj.position.z,n.pose,n.obj.visible]));
  const w1=LM.who(GM,'ms');
  check('13. 他在的時候說話的人帶他的 obj、名字照稿（上師）',!!w1&&w1.obj===n.obj&&w1.name===LM.MASTER.name);
  GM.G.hour=18; zT2.applyTimeOutdoor(18,null); const hid=n.obj.visible, hidFlag=n.hidden; n.obj.visible=true;   /* 引擎下一格會照視野把 visible 設回 true：要靠 n.hidden 擋 */ const w2=LM.who(GM,'ms'); GM.G.hour=20; zT2.applyTimeOutdoor(20,null); const back=n.obj.visible, backFlag=n.hidden;
  zT2.tzLimaoAway=true; zT2.applyTimeOutdoor(20,null); const away=n.obj.visible; zT2.tzLimaoAway=false; W.typhoon=true; zT2.applyTimeOutdoor(20,null); const ty=n.obj.visible; W.typhoon=false; zT2.applyTimeOutdoor(20,null);
  check('13. 收攤（18:00）藏起來、說話的人不帶 obj；20:00 再出現；上師不在、颱風＝藏起來',hid===false&&!w2.obj&&back===true&&away===false&&ty===false&&n.obj.visible===true,[hid,back,away,ty].join());
  /* 2026-11-11（CC 自檢：收攤時段他還畫得出來、每 10 幀有 8～9 幀在）：藏起來要設 n.hidden（engine3d.js 每一格照它算顯示），只設 obj.visible 會被蓋回來 */
  check('13. 藏起來＝n.hidden true（引擎把 visible 蓋回 true 以後，說話的人照樣不帶 obj）；出現＝n.hidden false；引擎的顯示判斷有看 n.hidden',hidFlag===true&&backFlag===false&&n.hidden===false&&/const vis=!n\.hidden&&/.test(fs.readFileSync(path.join(ROOT,'src/engine3d.js'),'utf8')),[hidFlag,backFlag].join());
  GM.G=newG({hour:18}); E.npcs=[]; const n18=LM.placeMaster(GM);
  check('13. 收攤時進汀州路：人物先放好、藏著（19:00 一到就出現）',!!n18&&n18.obj.visible===false);
  GM.G=newG({hour:20,stage:'econ'}); E.npcs=[]; const ne=LM.placeMaster(GM);
  check('13. 經濟系那一年不放人',ne===null&&LM.masterNpc===null);
  /* 換區：舊的人物不再當說話的人 */
  GM.G=newG({hour:20}); E.npcs=[]; const n2=LM.placeMaster(GM); E.npcs=[]; const w3=LM.who(GM,'ms');
  check('13. 換了區域（他不在 E.npcs 裡）：說話的人不帶舊的 obj',!!n2&&!w3.obj&&w3.name===LM.MASTER.name);
  /* 下載失敗：露出備用的樣子 */
  E.npcs=[]; const n3=LM.placeMaster(GM); const before=n3.obj.children[0].visible; LM.masterReveal(); const after=n3.obj.children[0].visible;
  check('13. 模型下載失敗（masterReveal）：備用的人露出來、不再等那個模型',before===false&&after===true&&n3.obj.userData.wantModel===null&&n3.obj.userData.degradedHidden===false);
  /* populate 的掛法 */
  const S0=global.STORY, calls=[]; global.STORY=Object.assign({},S0,{populate:(z,g)=>{ calls.push(z); return 'r'; }}); const hooked=LM.hookPopulate(); E.npcs=[]; const r1=STORY.populate('tingzhou',GM); const got=LM.masterNpc; const r2=STORY.populate('gongguan',GM); const gone=LM.masterNpc; const again=LM.hookPopulate();
  check('13. STORY.populate 掛一次：進汀州路放人、進別的區域清掉；原本的 populate 照樣跑、回傳值不變',hooked===true&&again===false&&r1==='r'&&r2==='r'&&!!got&&gone===null&&calls.join()==='tingzhou,gongguan');
  global.STORY=S0; E.addNPC=realAdd; global.CHAR=realChar; E.npcs=realNpcs; LM.masterNpc=null;
  /* 2026-11-11（BB P2）：站在算命桌前不動，過了 19:00／23:30 互動鍵的字要跟著換——label 是即時算的（getter），game3d.js updateInteract 字變了就重畫（原本只在換互動點時設字）*/
  { GM.G=newG({hour:18.9}); const a=itT.label; GM.G.hour=19.05; const b=itT.label; GM.G.hour=23.6; const c=itT.label; const g3=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8');
    check('13. 同一個互動點的字跟著鐘點換（18:54「'+LM.LABEL_LOOK+'」→ 19:03「'+LM.LABEL+'」→ 23:36「'+LM.LABEL_LOOK+'」）；互動鍵字變了就重畫',a===LM.LABEL_LOOK&&b===LM.LABEL&&c===LM.LABEL_LOOK&&/if\(it!==nearIt\|\|lb!==nearLb\)\{ \$\('interactLabel'\)\.textContent=lb; nearLb=lb; \}/.test(g3),[a,b,c].join()); }
  check('13. 讀檔的鎖有登記（limao3d:masterLoading）',typeof (globalThis.LOADLOCKS||{})['limao3d:masterLoading']==='function'); }

{ /* 2026-11-12 front_room：三個點平常念 narr、有 LM_KNOWN 念 known；配置的點 books／cabinet／scroll 都接得到 */
  const FR=LIMAO.front_room&&LIMAO.front_room.look||[]; const ok3=FR.length===3&&['書櫃','玻璃櫃','掛畫'].every(a=>FR.some(q=>q.at===a&&q.narr&&q.known&&q.narr!==q.known));
  const A=Object.values(LM.FRONT_AT);
  check('F. 前半命理館三個互動點（書櫃、玻璃櫃、掛畫）：稿各有平常、知道以後兩句；沒有 LM_KNOWN 念平常那句、有了念知道以後那句',ok3&&A.length===3&&A.every(a=>LM.frontNarr({flags:{}},a)===FR.find(q=>q.at===a).narr&&LM.frontNarr({flags:{LM_KNOWN:1}},a)===FR.find(q=>q.at===a).known));
  const lay=require('fs').readFileSync(require('path').join(ROOT,'src/data/tz_shops_layout.js'),'utf8');
  check('F. 配置有這三個點（books、cabinet、scroll）',Object.keys(LM.FRONT_AT).every(id=>new RegExp('"id": "'+id+'"').test(lay))); }
console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 測試本身出錯 '+(e&&e.stack||e)); process.exit(1); });
