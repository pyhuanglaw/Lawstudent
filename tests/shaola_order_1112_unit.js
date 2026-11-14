// 公館燒臘點餐（GG-SHAOLA-FIX-1112；店面標準 §12 第 3、4 點；AA_853 @ f6aa917593，分支 claude/magical-albattani-bk7b4n）——不需要瀏覽器（D131）。
// 2026-11-12 AA 回 LAWWW 的答案（稿的 lawww_1112 燒臘五點；上一版 7f7394acc）：說話人用現有的「阿姨」、順序照現在的、系統字可以＝都不用改；2D 下課吃飯改扣 105（src/classes3d.js）。
//   第 2 點（「叉燒飯剛上桌。阿姨多切了兩片叉燒。」拿掉）那一句在 src/story3d.js noodleScene，這一批沒有動那個檔（另一條線在改），第 2 項的期望照舊、等值班 LAWWW 接。
//   1  資料檔 src/data/yejian_shaola_buy.js 的燒臘那一半逐字對稿（六樣價錢、加滷蛋、阿姨的話、每一樣吃的旁白、看菜單、看櫥窗）；匯入工具 --check；白名單
//   2  點餐掛在「坐下吃飯」：阿姨 greet → 六樣「品名　N 元」＋「先不吃」→ 加滷蛋那一層 → 扣錢 → order_done → 坐下、+30 分鐘 → call → 吃的旁白；吃過的、熟客次數照記
//   3  加滷蛋 +15；例湯單點 20（沒有加滷蛋那一層、不叫）；六樣各有自己的旁白；先不吃＝不扣錢、不坐
//   4  記帳（BB_397 第五節四點）：
//        ① 舊存檔沒有欄位＝沒有欠帳；錢不夠＝阿姨 no_money、錢不動、G.flags.SHAOLA_TAB＝那一餐的價錢、照樣吃
//        ② 下次來＝阿姨「上次的一起算，總共 N。」一次扣掉、欠帳清掉
//        ③ 欠著又不夠＝阿姨 tab_refuse：不點餐、不再欠（還是原本那一筆）、坐下喝湯（+15 分鐘、不算一餐）
//        ④ 欠著的時候：存檔 JSON 來回、讀檔的遷移（game3d.js migrate）、搬出宿舍、去交換、換學期、畢業以後的每日規則都不報錯、欠帳還在，回來照樣一起付
//      錢不會變成負的（亂點 400 次：錢只減不增、每一次扣的都付得起、欠帳只會是 0 或一餐的價錢）
//   5  熟客：第 5 次那一句（那一次不說 greet）、「老樣子」＝上次那一樣、照上次有沒有加滷蛋、不再問；舊存檔的乾麵／餛飩湯照新品項認
//   6  位子：按的那一張有客人＝坐同一桌對面；兩張都有人＝「有人坐了。」、不點餐（真的 game3d.js freeSeat）
//   7  阿哲那一場照演（第二天傍晚）；阿姨不在（EAT.staffAway）＝阿姨的話不說、不記帳
//   8  區域（真的建出來）：五張桌子的「坐下吃飯」每一張從門口走得到、走近點站得住（含 BB 說坐不下的 (−2.1, 4.62)＝第 1 桌的互動座位）；「看菜單」「看櫥窗」走得到、按了出稿的那一句
//   9  客人：2026-10-05 起 28 天，營業的日子 12:30、18:30（桌遊團常客那幾天 17:30～19:00 是他們自己的人，不算）、20:30 排得出客人的日子各 ≥ 80%；14:30、21:30 沒有（時段照舊）
//   10 價目板從資料排；story3d.js、zones3d.js 不再寫死舊價錢；index.html 載入順序；node --check
// 修改前（f3e19b8eca：git archive 到暫存資料夾實際跑）：沒有資料檔、沒有 src/shaola_order3d.js——選單只有寫死的叉燒飯 100、燒鴨飯 110，錢不夠只有「錢不夠」，
//   20:30 排得出客人的日子 27 天裡只有 11 天。這支整份紅（第 0 項就停）。
// 用法：node tests/shaola_order_1112_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process'); const ROOT=path.resolve(__dirname,'..');
const SHA='f6aa917593', PREV_SHA='7f7394acc', DOC='docs/story_planning/AA_853_yejian_shaola_buy.json', DATA='src/data/yejian_shaola_buy.js', MOD='src/shaola_order3d.js';
const J=x=>JSON.stringify(x);
const src=f=>fs.readFileSync(path.join(ROOT,f),'utf8'), has=f=>fs.existsSync(path.join(ROOT,f));
const strip=s=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[^:'"\\])\/\/[^\n]*/g,'$1');

/* ====================================================================================================
   第二個行程（--zone）：照 index.html 的順序把整個遊戲載進來、建出真的燒臘店（同 tests/noodle_seat_ap_unit.js）——第 6、8、9 項和 4④ 的遷移
   ==================================================================================================== */
if(process.argv.includes('--zone')){ (function(){
  let fails=0; const out=console.log, check=(n,ok,info)=>{ out((ok?'PASS ':'FAIL ')+n+(info&&!ok?'　'+info:'')); if(!ok) fails++; };
  global.window=global; global.self=global;
  const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
  const el=()=>({getContext:()=>ctx2d,style:{},classList:{add(){},remove(){},toggle(){},contains:()=>false},addEventListener(){},appendChild(){},setAttribute(){},querySelector:()=>null,querySelectorAll:()=>[],width:1,height:1});
  global.document={ createElementNS:el, createElement:el, getElementById:()=>null, querySelector:()=>null, querySelectorAll:()=>[], addEventListener(){}, body:el(), documentElement:el() };
  global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:'',href:''};
  global.localStorage={getItem:()=>null,setItem(){},removeItem(){}}; global.requestAnimationFrame=()=>0;
  process.on('unhandledRejection',e=>{ out('FAIL unhandledRejection '+(e&&e.stack||e)); fails++; }); global.fetch=()=>Promise.reject(new Error('no fetch'));
  const HTML=src('index.html'), SRCS=[...HTML.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]);
  for(const f of SRCS){ try{ vm.runInThisContext(src(f).replace(/^const (\w+)\s*=/mg,'globalThis.$1='),{filename:f}); }catch(e){} }
  console.warn=()=>{};
  if(typeof SHAOLA==='undefined'||!SHAOLA.on()){ check('8 載得到 SHAOLA、資料',false); out('FAILED '+fails); process.exit(1); }
  const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
  const G={day:20,weekday:3,hour:12,flags:{},social:{},zone:'noodle'}; if(typeof GAME!=='undefined') GAME.G=G;
  E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; const z=Z3.ZONES.noodle.build(E); if(z.id==null) z.id='noodle'; E.zone=z; E.levels=z.levels||null; E.nav=z.nav;
  const g3=src('src/game3d.js'); const cut=(a,b)=>g3.slice(g3.indexOf(a),g3.indexOf(b));
  const SA=new Function('E',cut('function seatApproach(','GM.seatApproach=seatApproach;')+'\nreturn seatApproach;')(E), FS=new Function('E',cut('function freeSeat(st){','GM.freeSeat=freeSeat;')+'\nreturn freeSeat;')(E);
  const DOOR=[0,3.4]; E.player={obj:{position:new THREE.Vector3(DOOR[0],0,DOOR[1]),rotation:{y:0}},lv:0,radius:0.32};
  /* 按鈕的範圍裡有沒有一個站得住、從門口走得到的點 */
  const reach=(x,z0,r)=>{ for(let dx=-r;dx<=r+1e-9;dx+=0.1) for(let dz=-r;dz<=r+1e-9;dz+=0.1){ if(Math.hypot(dx,dz)>r) continue; const px=x+dx, pz=z0+dz; if(!E.canStand(px,pz,0.32,0)) continue; const p=E.pathTo(DOOR[0],DOOR[1],0,px,pz,0); if(p&&p.length){ const e=p[p.length-1]; if(Math.hypot(e[0]-px,e[1]-pz)<0.3) return [px,pz]; } } return null; };
  /* ===== 8 ===== */
  const L=SHAOLA_LAYOUT.shop, seats=E.interactables.filter(q=>q&&q.seat&&q.eat==='noodle');
  check('8 五張桌子各一個「坐下吃飯」（eat:noodle），每一個都有對面那一張（pairSeat）',seats.length===5&&seats.every(q=>q.label==='坐下吃飯'&&q.pairSeat&&Math.abs(q.pairSeat.x-q.seat.x)<0.01&&Math.abs(q.pairSeat.z-q.seat.z)>1),J(seats.map(q=>[q.x,q.z])));
  const t1=seats.find(q=>Math.abs(q.x+2.1)<0.01&&Math.abs(q.z-4.62)<0.01);
  check('8 BB 說坐不下的 (−2.1, 4.62)＝第 1 桌「坐下吃飯」的互動座位（不是不能坐的點）',!!t1&&L.seats.some(s=>s.table===1&&Math.abs(s.z-4.62)<0.01));
  { const bad=[]; for(const q of seats){ if(!reach(q.x,q.z,(q.radius||1)-0.05)) bad.push('按不到 '+q.x+','+q.z); for(const s of [q.seat,q.pairSeat]){ const ap=SA(s); if(!E.canStand(ap[0],ap[1],0.3,0)) bad.push('走近點站不住 '+s.x+','+s.z); else { const p=E.pathTo(DOOR[0],DOOR[1],0,ap[0],ap[1],0), e=p&&p.length?p[p.length-1]:null; if(!e||Math.hypot(e[0]-ap[0],e[1]-ap[1])>0.6) bad.push('走不到 '+s.x+','+s.z); if(Math.hypot(ap[0]-s.x,ap[1]-s.z)>1.0) bad.push('走近點離椅子太遠 '+s.x+','+s.z); } } }
    check('8 每一張「坐下吃飯」從門口走得到按鈕的範圍；兩張椅子（按的那一張、對面那一張）的走近點都站得住、走得到、離椅子 1 m 內',!bad.length,bad.join('｜')); }
  { const looks=E.interactables.filter(q=>q&&q.shaola), D=YEJIAN_SHAOLA_BUY.noodle, bad=[];
    for(const q of looks){ if(!reach(q.x,q.z,(q.radius||1)-0.05)) bad.push(q.label+' 走不到'); const lay=L.interact.find(i=>i.kind===q.shaola); if(!lay||lay.label!==q.label||lay.x!==q.x||lay.z!==q.z) bad.push(q.label+' 不是配置的位置／字');
      for(const o of E.interactables) if(o!==q&&Math.hypot(o.x-q.x,o.z-q.z)<0.5) bad.push(q.label+' 和「'+o.label+'」疊在一起'); }
    check('8 「看菜單」「看櫥窗」：位置、按鈕的字照配置 interact，走得到、不和別的按鈕疊在一起；配置的「點餐」不放（點餐掛在坐下吃飯）',looks.length===2&&J(looks.map(q=>q.label).sort())===J(['看櫥窗','看菜單'])&&!bad.length&&!E.interactables.some(q=>q.label==='點餐'),bad.join('｜')+J(looks.map(q=>q.label)));
    const says=[]; const GMx={G:Object.assign({},G,{zone:'noodle'}),sceneBegin(){},sceneEnd(){},say:async(w,t)=>{ says.push([w,t]); }};
    (async()=>{ for(const q of looks) await SHAOLA.interact(q,GMx); })().then(()=>{ check('8 按了＝稿的 menu_look／window_look（旁白）',says.length===2&&says.every(s=>s[0]===null)&&says.some(s=>s[1]===D.menu_look)&&says.some(s=>s[1]===D.window_look),J(says)); }); }
  /* ===== 6 位子（真的 freeSeat）===== */
  { const q=t1||seats[0], GMx={freeSeat:FS}; const npc=s=>({seat:{x:s.x,z:s.z,lv:0},obj:{position:{x:s.x,z:s.z}}});
    const a=SHAOLA.seatFor(GMx,q)===q.seat; E.npcs.push(npc(q.seat)); const b=SHAOLA.seatFor(GMx,q)===q.pairSeat; E.npcs.push(npc(q.pairSeat)); const c=SHAOLA.seatFor(GMx,q)===null; E.npcs.length=0;
    check('6 位子：沒人＝按的那一張；有客人＝同一桌對面那一張；兩張都有人＝沒有位子（真的 game3d.js freeSeat）',a&&b&&c,J([a,b,c])); }
  /* ===== 9 客人 ===== */
  { const def=CROWD.SHOP_ZONES.noodle, d0=STORY.dayOfKey('2026-10-05'), T=[12.5,18.5,20.5], ok=[0,0,0], n=[0,0,0]; let off=0, rows=[];
    for(let d=d0;d<d0+28;d++){ const g={day:d,weekday:CALENDAR.dateOf(d).wd%7,hour:12,zone:'dorm',flags:{},stage:'law'}, plan=CROWD.shopPlan(def,g), cnt=h=>plan.units.reduce((a,u)=>a+u.filter(s=>s.t0<=h&&s.t1>h).reduce((b,s)=>b+s.who.length,0),0);
      if(!plan.wins.length) continue; const ndl=STORY.noodleDay&&STORY.noodleDay(d); off+=cnt(14.5)+cnt(21.5);
      T.forEach((h,i)=>{ if(i===1&&ndl) return; n[i]++; if(cnt(h)>0) ok[i]++; }); rows.push(CALENDAR.dateOf(d).key+' '+T.map(cnt).join('/')+(ndl?' 桌遊團':'')); }
    const pct=ok.map((v,i)=>n[i]?v/n[i]:0);
    check('9 客人：28 天裡營業的日子，12:30／18:30（桌遊團常客的日子不算）／20:30 排得出客人的日子各 ≥ 80%（修改前 20:30 是 27 天裡 11 天）',pct.every(p=>p>=0.8)&&n[0]>=20&&n[2]>=20,J({ok,n})+' '+rows.join('｜'));
    check('9 時段照舊：14:30、21:30 沒有客人（LAWWW：下午沒有人照設計）；窗口 11～14、17～21',off===0&&J(CROWD.shopWindows(def,{day:d0+1,weekday:2,hour:12,flags:{}}))===J([[11,14],[17,21]]),String(off));
    check('9 別的吃飯的店照舊用共用的那一條（只有公館燒臘有自己的 def.L）',CROWD.SHOPS.filter(s=>s.L).map(s=>s.zone).join()==='noodle'&&CROWD.shopLoad(CROWD.SHOPS.find(s=>s.kind==='meal'&&s.zone!=='noodle'),{day:d0+1,flags:{}},20.5)<0.2&&CROWD.shopLoad(def,{day:d0+1,flags:{}},20.5)>0.8); }
  /* ===== 4④ 讀檔的遷移（真的 game3d.js migrate）===== */
  { const d0=g3.indexOf('function defaults(name){'), d1=g3.indexOf('\n',d0), m0=g3.indexOf('function migrate(s)'), END='s.v=SAVE_VER; return s; }', m1=g3.indexOf(END,m0)+END.length; let M=null, err='';
    try{ M=new Function('SAVE_VER',g3.slice(d0,d1)+'\n'+g3.slice(m0,m1)+'\nreturn {migrate,defaults};')(2); }catch(e){ err=e.message; }
    let a=false, b=false, c=false; try{ const s=M.defaults('祐廷'); s.flags.SHAOLA_TAB=90; s.eat={n:{'阿鳳麵店':2},last:{'阿鳳麵店':'叉燒飯'},slEgg:true}; const s2=M.migrate(JSON.parse(J(s))); a=s2.flags.SHAOLA_TAB===90&&s2.eat.slEgg===true&&SHAOLA.tab(s2)===90;
      const old=M.migrate({v:1,name:'祐廷',day:30,hour:12,money:500,zone:'dorm',flags:{},rel:{}}); b=!('SHAOLA_TAB' in old.flags)&&SHAOLA.tab(old)===0; const nw=M.defaults('祐廷'); c=!('SHAOLA_TAB' in nw.flags)&&SHAOLA.tab(nw)===0; }catch(e){ err=String(e&&e.stack||e).slice(0,300); }
    check('4④ 讀檔的遷移（game3d.js migrate）：欠帳、上次有沒有加蛋原樣留著；舊存檔、新遊戲沒有這個欄位＝沒有欠帳（不補欄位）',a&&b&&c,J([a,b,c])+err); }
  setTimeout(()=>{ out(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0); },50);
})(); return; }

/* ====================================================================================================
   主行程：真的 story3d.js noodleScene（tests/pg_harness.js）＋真的 eat3d.js
   ==================================================================================================== */
if(!has(DATA)||!has(MOD)){ console.log('FAIL 0 沒有 '+DATA+'／'+MOD+'（修改前：燒臘店的選單寫死在 story3d.js，只有叉燒飯 100、燒鴨飯 110）'); console.log('FAILED 1'); process.exit(1); }
const H=require('./pg_harness.js'); const GM=H.GM, check=(n,ok,info)=>H.check(n,ok,ok?'':info);
process.on('unhandledRejection',e=>{ console.log('FAIL unhandledRejection '+(e&&e.stack||e)); H.fails++; });
for(const f of ['src/data/eat_lines.js','src/eat3d.js']) vm.runInThisContext(src(f),{filename:f});
if(typeof SHAOLA==='undefined'||typeof YEJIAN_SHAOLA_BUY==='undefined'){ console.log('FAIL 0 pg_harness 沒有載入燒臘的資料和點餐'); console.log('FAILED 1'); process.exit(1); }
const D=YEJIAN_SHAOLA_BUY.noodle, T=D.staff, AUNT=EAT_LINES.staff['阿鳳麵店'].who, FIRST=EAT_LINES.first['阿鳳麵店'], KEY='阿鳳麵店';
const P=n=>D.menu.find(m=>m.n===n).p, EGG=D.addon[0], OPT=(n,p)=>n+'　'+p+' 元';
let paid=[], toasts=[], sat=[], stood=0;
GM.money=d=>{ paid.push(d); H.G.money+=d; }; GM.toast=t=>{ toasts.push(t); }; GM.sitAt=(p,s)=>{ sat.push(s); }; GM.standUp=()=>{ stood++; }; GM.npc={};
const IT=()=>({eat:'noodle',label:'坐下吃飯',seat:{x:-2.1,z:1.02,yaw:Math.PI},pairSeat:{x:-2.1,z:-0.22,yaw:0}});
let h0=0, n0=0;
const press=async(picks,it)=>{ H.picks=(picks||[]).slice(); H.said=[]; H.opts=[]; paid=[]; toasts=[]; sat=[]; stood=0; h0=H.G.hour; n0=((H.G.eat||{}).n||{})[KEY]|0; await STORY.interact(it||IT(),GM);
  return {said:H.said.map(s=>[s.who,s.t]),opts:H.opts.map(o=>[...o]),money:H.G.money,dh:+(H.G.hour-h0).toFixed(3),tab:H.G.flags.SHAOLA_TAB,paid:paid.slice(),toasts:toasts.slice(),sat:sat.slice(),n:(((H.G.eat||{}).n||{})[KEY]|0)-n0}; };
const start=(money,flags,eat)=>{ H.fresh('2026-10-14',12.5,'noodle',flags); H.G.money=money; if(eat) H.G.eat=eat; GM.npc={}; delete GM.freeSeat; };
const lines=r=>r.said.map(s=>s[1]), by=(r,t)=>(r.said.find(s=>s[1]===t)||[])[0];

(async()=>{
/* ===== 1 資料 ===== */
{ let raw=null; try{ raw=cp.execFileSync('git',['show',SHA+':'+DOC],{cwd:ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']}); }catch(e){}
  if(!raw) console.log('SKIP 1 讀不到稿 '+SHA+'（淺層複本：git fetch origin claude/magical-albattani-bk7b4n）');
  else { const R=JSON.parse(raw).noodle, bad=[];
    if(D.name!==R.name) bad.push('name'); if(J(D.menu.map(m=>[m.n,m.p]))!==J(R.menu)) bad.push('menu'); if(J(D.addon.map(m=>[m.n,m.p]))!==J(R.addon)) bad.push('addon');
    for(const k of ['greet','order_done','call','no_money','tab_pay','tab_refuse']) if(T[k]!==R.staff[k]) bad.push('staff.'+k);
    for(const k of Object.keys(T)) if(!(k in R.staff)) bad.push('多了 staff.'+k); if(T.who!==R.staff.who) bad.push('who');
    if(J(D.eat)!==J(R.eat)) bad.push('eat'); if(D.menu_look!==R.menu_look) bad.push('menu_look'); if(D.window_look!==R.window_look) bad.push('window_look');
    check('1 菜單六樣和價錢、加滷蛋、阿姨六句、六樣吃的旁白、看菜單、看櫥窗逐字對稿',!bad.length&&D.menu.length===6&&D.addon.length===1,bad.join('、'));
    check('1 例湯＝稿 notes「例湯單點 20；配飯一起點的第一碗不用錢」那一樣',D.soup==='例湯'&&R.notes.some(n=>n.startsWith('例湯單點 20；配飯一起點的第一碗不用錢'))&&P('例湯')===20);
    const ck=cp.spawnSync('python3',['tools/story/import_yejian_shaola.py','--check'],{cwd:ROOT,encoding:'utf8'});
    if(ck.error) console.log('SKIP 1 沒有 python3（匯入工具 --check）'); else check('1 匯入工具 --check：資料檔＝稿匯出來的（走 import_guard 白名單）',ck.status===0,(ck.stdout+ck.stderr).trim().slice(0,200)); }
  const A=JSON.parse(src('docs/handoff/story_import_allow.json')).files.filter(e=>e.path===DOC);
  check('1 白名單：AA_853 一筆 approved、sha＝'+SHA+'、有 approvedBy、上一版 '+PREV_SHA+' 在 history；資料檔的來源寫同一版',A.length===1&&A[0].status==='approved'&&A[0].sha===SHA&&!!A[0].approvedBy&&(A[0].history||[]).some(h=>h.sha===PREV_SHA)&&YEJIAN_SHAOLA_BUY.src===DOC+'@'+SHA,J(A));   /* 2026-11-12（AA_853@f6aa917593，稿的 lawww_1112）：舊期望 sha＝7f7394acc */
  /* 2026-11-12（AA_853@f6aa917593，稿的 lawww_1112）燒臘第 4 點「2D 下課吃飯『一盤叉燒飯加一顆滷蛋』改扣 105」＝叉燒飯 90＋加滷蛋 15。修改前：src/classes3d.js 的 MEALS 寫 100 */
  { const cs=fs.readFileSync(path.join(ROOT,'src/classes3d.js'),'utf8'), m=/\{t:'公館燒臘',price:(\d+),line:'公館燒臘，一盤叉燒飯加一顆滷蛋。'/.exec(cs);
    check('1 2D 下課吃飯（src/classes3d.js MEALS）公館燒臘那一餐扣 105＝稿的叉燒飯＋加滷蛋',!!m&&+m[1]===105&&P('叉燒飯')+EGG.p===105,m&&m[1]); }
  check('1 價錢照稿：叉燒飯 90、油雞飯 90、燒鴨飯 100、雙拼飯 110、三寶飯 130、例湯 20、加滷蛋 15',J(D.menu.map(m=>m.p))==='[90,90,100,110,130,20]'&&EGG.p===15&&EGG.n==='加滷蛋'); }

/* ===== 2 點一份 ===== */
{ start(500); const r=await press(['叉燒飯','不用了']);
  check('2 選單：六樣「品名　N 元」照稿的順序＋「先不吃」；第二層「加滷蛋　15 元」「不用了」',J(r.opts[0])===J(D.menu.map(m=>OPT(m.n,m.p)).concat(['先不吃']))&&J(r.opts[1])===J([OPT(EGG.n,EGG.p),'不用了'])&&r.opts.length===2,J(r.opts));
  check('2 叉燒飯：扣 90、時間 +30 分鐘、坐按的那一張、吃完起身',r.money===410&&J(r.paid)==='[-90]'&&r.dh===0.5&&r.sat.length===1&&r.sat[0].z===1.02&&stood===1,J([r.money,r.paid,r.dh,r.sat]));
  /* 2026-11-12（AA_853@f6aa917593 lawww_1112 燒臘第 2 點）：舊的那一句拿掉。舊期望：FIRST 和稿的旁白中間還有「叉燒飯剛上桌。阿姨多切了兩片叉燒。」 */
  check('2 句子的順序：阿姨 greet → order_done → call →（第一次來的旁白）→ 稿的吃的旁白（舊的「多切了兩片叉燒」那一句拿掉了）；說話的人＝現有的「阿姨」',
    J(lines(r))===J([T.greet,T.order_done,T.call,FIRST,D.eat['叉燒飯']])&&!lines(r).some(t=>/多切了兩片叉燒/.test(t))&&[T.greet,T.order_done,T.call].every(t=>by(r,t)===AUNT)&&by(r,D.eat['叉燒飯'])===null&&AUNT==='阿姨',J(r.said));
  check('2 吃過的、熟客次數照記（店名鍵照舊「阿鳳麵店」、吃過的寫「公館燒臘」）；沒有欠帳',r.n===1&&H.G.eat.last[KEY]==='叉燒飯'&&H.G.eat.ate.some(a=>a.shop==='公館燒臘'&&a.item==='叉燒飯')&&r.tab===undefined,J(H.G.eat)); }
/* ===== 3 加蛋、例湯、每一樣、先不吃 ===== */
{ start(500); let r=await press(['三寶飯','加滷蛋']);
  check('3 三寶飯加滷蛋：扣 130＋15＝145；記下這次有加（老樣子用）',r.money===355&&J(r.paid)==='[-145]'&&H.G.eat.slEgg===true&&lines(r).includes(D.eat['三寶飯']),J([r.money,r.paid,H.G.eat.slEgg]));
  r=await press(['例湯']);
  check('3 例湯單點 20：沒有加滷蛋那一層；阿姨 order_done（湯自己舀）、不叫；例湯那一句旁白',r.money===335&&J(r.paid)==='[-20]'&&r.opts.length===1&&J(lines(r))===J([T.greet,T.order_done,D.eat['例湯']])&&r.dh===0.5,J([r.opts.length,r.said,r.paid]));
  const bad=[]; for(const m of D.menu){ start(500,null,{n:{[KEY]:1},last:{},l5:{},first:{[KEY]:1},tog:{},ate:[]}); const q=await press([m.n,'不用了']); const L=lines(q);
    if(L[L.length-1]!==D.eat[m.n]||q.money!==500-m.p||(m.n!=='叉燒飯'&&L.some(t=>/剛上桌/.test(t)))||L.includes('燒鴨的皮還是脆的。')) bad.push(m.n+J(L)); }
  check('3 六樣各說自己的旁白、各扣自己的價錢；燒鴨飯不再重複舊的「燒鴨的皮還是脆的。」',!bad.length,bad.join('｜'));
  start(500); r=await press(['先不吃']);
  check('3 先不吃：不扣錢、不坐、時間不動、不算一次',r.money===500&&!r.paid.length&&!r.sat.length&&r.dh===0&&r.n===0&&J(lines(r))===J([T.greet]),J(r));
  start(100); r=await press(['叉燒飯']);
  check('3 身上 100：叉燒飯付得起、加蛋付不起＝那一項灰的；硬選＝「錢不夠」、只扣 90',r.opts.length===2&&r.money===10&&J(r.paid)==='[-90]'&&H.G.eat.slEgg===false&&(await (async()=>{ start(100); const q=await press(['叉燒飯','加滷蛋']); return q.money===10&&q.toasts.includes('錢不夠'); })())); }
/* ===== 4 記帳 ===== */
{ start(50); check('4① 舊存檔沒有欄位＝沒有欠帳（讀的時候不寫存檔）',SHAOLA.tab(H.G)===0&&!('SHAOLA_TAB' in H.G.flags)&&SHAOLA.tab({})===0&&SHAOLA.tab({flags:{SHAOLA_TAB:'x'}})===0&&SHAOLA.tab({flags:{SHAOLA_TAB:-5}})===0&&SHAOLA.tab({flags:{SHAOLA_TAB:NaN}})===0);
  let r=await press(['叉燒飯']);
  check('4① 錢不夠（身上 50、沒有欠帳）：阿姨「（阿姨看了你一眼。）先吃，下次一起算。」、錢不動、欠 90、不問加蛋、照樣坐下吃（算一餐）',
    r.money===50&&!r.paid.length&&r.tab===90&&r.opts.length===1&&by(r,T.no_money)===AUNT&&!lines(r).includes(T.order_done)&&lines(r).includes(T.call)&&lines(r).includes(D.eat['叉燒飯'])&&r.sat.length===1&&r.n===1&&r.dh===0.5,J(r));
  /* ③ 欠著又不夠 */
  H.G.money=100; r=await press(['燒鴨飯']);
  check('4③ 欠著 90、身上 100 點燒鴨飯 100：阿姨 tab_refuse、不點餐、不再欠（還是 90）、錢不動',r.money===100&&!r.paid.length&&r.tab===90&&by(r,T.tab_refuse)===AUNT&&!lines(r).includes(T.no_money)&&!lines(r).includes(T.order_done)&&!lines(r).includes(T.call),J(r));
  check('4③ 可以坐下喝湯：坐下、例湯那一句旁白、+15 分鐘；不算一餐（熟客次數、吃過的、上次點的都不動）',r.sat.length===1&&J(lines(r))===J([T.greet,T.tab_refuse,D.eat['例湯']])&&r.dh===0.25&&r.n===0&&H.G.eat.last[KEY]==='叉燒飯'&&!H.G.eat.ate.some(a=>a.item==='例湯')&&stood===1,J([r.said,r.dh,r.n,H.G.eat]));
  H.G.money=0; r=await press(['例湯']);
  check('4③ 身上 0 元連例湯也不夠：一樣 tab_refuse、欠帳還是 90、錢還是 0',r.money===0&&r.tab===90&&!r.paid.length&&lines(r).includes(T.tab_refuse),J(r));
  /* ④ 欠著的時候 */
  { const before=J(H.G), back=JSON.parse(before); check('4④ 存檔 JSON 來回不變；欠帳是一個數字',J(back)===before&&back.flags.SHAOLA_TAB===90&&typeof back.flags.SHAOLA_TAB==='number');
    const errs=[]; const keep=H.G; const eat0=J(keep.eat);
    for(const [k,h,z,fl] of [['2026-11-20',9,'dorm',{}],['2027-01-18',10,'dorm',{}],['2027-02-22',8,'campus',{}],['2027-07-05',14,'dorm',{}],['2027-09-13',8,'campus',{MOVED_OUT:400}],['2028-09-11',8,'campus',{MOVED_OUT:400,y3Route:'us',abroad:'us'}],
        ['2029-02-19',8,'campus',{MOVED_OUT:400,y3Route:'jp',abroad:'jp'}],['2029-09-10',8,'campus',{MOVED_OUT:400}],['2030-06-10',10,'campus',{MOVED_OUT:400}],['2030-08-05',10,'dorm',{MOVED_OUT:400}],['2031-03-03',10,'dorm',{MOVED_OUT:400}]]){
      try{ H.fresh(k,h,z,Object.assign({SHAOLA_TAB:90},fl)); H.G.eat=JSON.parse(eat0); H.G.money=3; H.tick(); if(typeof TERMEND!=='undefined'&&TERMEND.rules){ try{ TERMEND.rules(GM); }catch(e){ errs.push(k+' TERMEND '+e.message); } }
        if(H.G.flags.SHAOLA_TAB!==90||SHAOLA.tab(H.G)!==90||H.G.money<0) errs.push(k+' 欠帳變了 '+H.G.flags.SHAOLA_TAB); JSON.parse(J(H.G)); }catch(e){ errs.push(k+' '+String(e&&e.message||e).slice(0,120)); } }
    check('4④ 欠著的時候換學期、寒暑假、搬出宿舍、去美國／日本交換、畢業以後：每日規則照跑不報錯、欠帳還是 90、存檔轉得成 JSON（11 個日子）',!errs.length,errs.join('｜'));
    const pre=['dating_','EX_','BACK_FROM_','JUDGE_PASS_','BAR_SIT_'];
    check('4④ 欄位名不會被「照旗標名字的開頭掃一遍」的舊程式誤認（dating_、EX_、BACK_FROM_、JUDGE_PASS_、BAR_SIT_）',!pre.some(p=>SHAOLA.TAB.indexOf(p)===0)); }
  /* ② 回來一起付（畢業以後回到店裡）*/
  H.fresh('2030-08-06',12.5,'noodle',{SHAOLA_TAB:90,MOVED_OUT:400}); H.G.money=500; H.G.eat={n:{[KEY]:3},last:{[KEY]:'叉燒飯'},l5:{},first:{[KEY]:1},tog:{},ate:[]}; r=await press(['油雞飯','加滷蛋']);
  check('4② 下次來（身上 500）點油雞飯加滷蛋：阿姨「上次的一起算，總共 195。」、一次扣 195、欠帳清掉；之後照常',r.money===305&&J(r.paid)==='[-195]'&&!('SHAOLA_TAB' in H.G.flags)&&by(r,T.tab_pay.replace('{n}','195'))===AUNT&&lines(r).indexOf(T.tab_pay.replace('{n}','195'))<lines(r).indexOf(T.order_done)&&lines(r).includes(D.eat['油雞飯'])&&r.n===1,J(r));
  r=await press(['例湯']); check('4② 付清以後不再提上次（只扣 20）',r.money===285&&!lines(r).some(t=>/上次/.test(t)),J(r.said));
  start(110,{SHAOLA_TAB:90}); r=await press(['例湯']); check('4② 欠 90、身上 110 點例湯 20：剛好付得起＝「總共 110」、錢 0、不會是負的',r.money===0&&J(r.paid)==='[-110]'&&lines(r).includes(T.tab_pay.replace('{n}','110'))&&!('SHAOLA_TAB' in H.G.flags),J(r));
  start(190,{SHAOLA_TAB:90}); r=await press(['叉燒飯','加滷蛋']); check('4② 欠 90、身上 190 點叉燒飯：付得起飯（180）、加蛋付不起（195）＝只扣 180',r.money===10&&J(r.paid)==='[-180]'&&r.toasts.includes('錢不夠')&&lines(r).includes(T.tab_pay.replace('{n}','180')),J(r));
  /* 亂點 */
  { let seed=20261112; const rnd=()=>{ seed=(seed*1103515245+12345)&0x7fffffff; return seed/0x7fffffff; }; const prices=D.menu.map(m=>m.p); const bad=[]; start(0); H.G.eat={n:{[KEY]:6},last:{},l5:{[KEY]:1},first:{[KEY]:1},tog:{},ate:[]};
    for(let k=0;k<400&&!bad.length;k++){ if(rnd()<0.35) H.G.money=Math.floor(rnd()*260); const m0=H.G.money, t0=SHAOLA.tab(H.G); const r2=await press([Math.floor(rnd()*8),Math.floor(rnd()*2)]); const t1=SHAOLA.tab(H.G), sum=r2.paid.reduce((a,b)=>a+b,0);
      if(r2.money<0) bad.push('錢變負的'); if(r2.money!==m0+sum) bad.push('錢和扣的對不上'); if(sum>0) bad.push('錢變多'); if(-sum>m0) bad.push('扣的比身上多');
      if(t1!==0&&!prices.includes(t1)) bad.push('欠帳不是一餐的價錢 '+t1); if(t0>0&&t1!==0&&t1!==t0) bad.push('欠著又多欠 '+t0+'→'+t1); if(t0>0&&t1===0&&-sum<t0) bad.push('欠帳沒付就清掉'); if(t0===0&&t1>0&&sum!==0) bad.push('記帳還扣錢');
      if(bad.length) bad.push('第 '+k+' 次 '+J({m0,t0,t1,paid:r2.paid,opts:r2.opts.length})); }
    check('4 亂點 400 次（錢 0～259 亂變）：錢不會是負的、只減不增、扣的都付得起；欠帳只會是 0 或一餐的價錢；欠著不會再多欠；沒付不會清掉',!bad.length,bad.join('、')); } }
/* ===== 5 熟客 ===== */
{ start(500,null,{n:{[KEY]:4},last:{[KEY]:'叉燒飯'},l5:{},first:{[KEY]:1},tog:{},ate:[],slEgg:true}); const S5=EAT_LINES.staff[KEY]; let r=await press(['老樣子']);
  check('5 第 5 次：阿姨「你坐，我知道你要什麼。」那一次不說 greet；選單多「老樣子」；選了＝「好啦。不用講。」、叉燒飯加滷蛋 105、不再問加蛋',
    !lines(r).includes(T.greet)&&lines(r)[0]===S5.line5&&lines(r).includes(S5.same)&&r.opts.length===1&&r.opts[0].includes('老樣子')&&r.money===395&&J(r.paid)==='[-105]'&&lines(r).includes(D.eat['叉燒飯']),J(r));
  r=await press(['老樣子']); check('5 第 6 次起照常說 greet（第 5 次那一句只說一次）',lines(r)[0]===T.greet&&!lines(r).includes(S5.line5)&&r.money===290,J(r.said));
  start(500,null,{n:{[KEY]:5},last:{[KEY]:'燒鴨飯'},l5:{[KEY]:3},first:{[KEY]:1},tog:{},ate:[]}); r=await press(['老樣子']);
  check('5 上次沒加蛋的老樣子：只扣 100、不問加蛋',r.money===400&&r.opts.length===1,J([r.money,r.opts.length]));
  start(500,null,{n:{[KEY]:5},last:{[KEY]:'乾麵'},l5:{[KEY]:3},first:{[KEY]:1},tog:{},ate:[]}); r=await press(['老樣子']);
  check('5 舊存檔（麵店那時候）的老樣子：乾麵＝叉燒飯（AA_612 第 1 節）',H.G.eat.last[KEY]==='叉燒飯'&&r.money===410,J([H.G.eat.last,r.money])); }
/* ===== 6 位子（流程；真的 freeSeat 在第二個行程）===== */
{ start(500); const it=IT(); GM.freeSeat=s=>s===it.seat?null:s; let r=await press(['叉燒飯','不用了'],it);
  check('6 按的那一張有客人：照樣點餐、坐同一桌對面那一張',r.sat.length===1&&r.sat[0]===it.pairSeat&&r.money===410,J(r.sat));
  start(500); GM.freeSeat=()=>null; r=await press(['叉燒飯','不用了'],it);
  check('6 兩張都有人：「有人坐了。」、不出選單、不扣錢',J(r.toasts)===J(['有人坐了。'])&&!r.opts.length&&!r.said.length&&r.money===500,J(r)); delete GM.freeSeat; }
/* ===== 7 阿哲那一場、阿姨不在 ===== */
{ H.fresh('2026-10-14',18.6,'noodle',{introDone:true,classDone:true,afternoonDone:true,zheInvite:true,plan:'cafe'}); H.G.money=500; SOCIAL.remember('heroine_01','FIRST_MET','');
  GM.npc.zhe={name:'阿哲',charId:'zhe',obj:{position:{x:-2.1,y:0,z:-0.22}},seat:{x:-2.1,z:-0.22}}; let r=await press(['叉燒飯','不用了']);
  check('7 阿哲坐在同一桌：點完照演他那一場（「來了。我點了滷蛋，你要不要？」），不演一個人吃的旁白',lines(r).includes('來了。我點了滷蛋，你要不要？')&&H.G.flags.zheNoodleDone===true&&!lines(r).includes(D.eat['叉燒飯'])&&r.money===410,J(lines(r)));
  GM.npc={}; start(50,{SHAOLA_TAB:90}); const sa=EAT.staffAway; EAT.staffAway=()=>true;
  try{ r=await press(['叉燒飯']); check('7 阿姨不在（EAT.staffAway）：阿姨的話一句都不說、不記帳不收帳；錢不夠＝「錢不夠」、不坐',!r.said.length&&r.toasts.includes('錢不夠')&&r.tab===90&&r.money===50&&!r.sat.length,J(r));
    H.G.money=500; r=await press(['叉燒飯','不用了']); check('7 阿姨不在、付得起：只付這一餐 90（上次的等阿姨在再算）、旁白換「還冒著熱氣」那一句',r.money===410&&r.tab===90&&!r.said.some(s=>s[0]===AUNT)&&lines(r).includes('叉燒飯剛上桌，還冒著熱氣。'),J(r)); }
  finally{ EAT.staffAway=sa; } }
/* ===== 10 接線 ===== */
{ const S=strip(src('src/story3d.js')), Z=strip(src('src/zones3d.js')), M=strip(src(MOD)), h=src('index.html'), pos=f=>h.indexOf('src="'+f);
  check('10 story3d.js、zones3d.js 不再寫死舊價錢（叉燒飯 100、燒鴨飯 110）；價目板＝SHAOLA.boardText()（和選單同一份資料）',!/叉燒飯　100|燒鴨飯　110|叉燒飯 100|燒鴨飯 110/.test(S+Z)&&/SHAOLA\.boardText\(\)/.test(Z)&&SHAOLA.boardText()===D.menu.concat(D.addon).map(m=>m.n+' '+m.p).join(' ・ '),SHAOLA.boardText());
  check('10 這支程式不寫台詞：除了系統字（先不吃、不用了、錢不夠、有人坐了。、元）和舊品項對照，沒有別的中文字串',(()=>{ const lit=[...M.matchAll(/'((?:[^'\\]|\\.)*)'/g)].map(m=>m[1]).filter(s=>/[一-鿿]/.test(s)); const ok=['阿鳳麵店','　',' 元','先不吃','不用了','錢不夠','有人坐了。','乾麵','叉燒飯','餛飩湯','燒鴨飯',' ・ ']; return lit.every(s=>ok.includes(s)); })(),J([...M.matchAll(/'((?:[^'\\]|\\.)*)'/g)].map(m=>m[1]).filter(s=>/[一-鿿]/.test(s))));
  check('10 index.html：資料檔在點餐程式前面，兩支都在 story3d.js、eat3d.js 後面、GAME.boot() 前面',pos(DATA)>0&&pos(MOD)>pos(DATA)&&pos(DATA)>pos('src/story3d.js')&&pos(DATA)>pos('src/eat3d.js')&&pos(MOD)<h.indexOf('GAME.boot()'));
  const bad=[]; for(const f of [DATA,MOD,'src/story3d.js','src/zones3d.js','src/crowd3d.js','src/eat3d.js']){ const r=cp.spawnSync(process.execPath,['--check',path.join(ROOT,f)],{encoding:'utf8'}); if(r.status!==0) bad.push(f); }
  check('10 node --check',!bad.length,bad.join('、')); }
/* ===== 第二個行程：真的區域、客人、遷移 ===== */
{ const r=cp.spawnSync(process.execPath,[__filename,'--zone'],{cwd:ROOT,encoding:'utf8',maxBuffer:1<<24}); const outp=(r.stdout||'').trim(); if(outp) console.log(outp.split('\n').filter(l=>/^(PASS|FAIL|SKIP|INFO)/.test(l)).join('\n'));
  const nf=(outp.match(/^FAIL/mg)||[]).length; if(r.status!==0||nf){ H.fails+=Math.max(1,nf); if(!nf) console.log('FAIL 第二個行程（--zone）沒有跑完：'+String(r.stderr||'').slice(0,400)); } }
H.done();
})();
