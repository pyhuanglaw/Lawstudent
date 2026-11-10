/* 夜市十攤＋背景三攤的看、買（NIGHT-MARKET-1110，使用者 X326；LAWWW 2026-11-10）——不需要瀏覽器（D131）。
   字：src/data/night_market.js（AA_752 @3259b5f78，tools/story/import_night_market.py）；演出：src/night_market3d.js；模型、區域：src/tingzhou3d.js。
   1  index.html 有載入（資料在前、程式在後、都在 tingzhou3d.js 後面）；白名單有那一筆；匯入工具 --check 一致
   2  十攤逐字對稿：店名、look、closed、greet、每一樣的 id／品名／價錢／buy、hours、s10 的夏冬句；背景三攤 sign／look／closed（有企劃線那個 commit 就整份比；另外店名、品名、價錢對下面這張表）
   3  稿的十三攤都對到配置的一攤（kind），店名兩邊一樣；配置的十三攤都有互動點「看＋店名」，站得住、從出生點走得到
   4  營業中：第一次先念 look，再老闆一句 greet（在稿的 greet 裡），選單＝「品名　價錢 元」＋「算了」；買了扣那個價錢、時間過 5 分鐘、buy 的句子照順序（整句（…）＝沒名字，其他＝老闆）；
      同一天第二次不再念 look；選「算了」不扣錢
   5  錢不夠：那一樣變灰，硬選＝「錢不夠」、不扣錢、不演 buy
   6  收攤不能買：每一攤在稿的開攤時間開、開攤前和收攤的那一刻是 closed 一句、不出選單；模型（營業／收攤那兩個節點）和 isOpen、能不能買一致
   7  營業時間照稿（和配置原本不一樣的照稿）：十攤配置的 from／to＝稿的 open；背景三攤照配置
   8  季節（s10）：7 月多 lookSummer、greetSummer，14:00 開；12 月多 lookWinter、greetWinter，17:00 開；4 月、10 月只有一般句
   9  套圈圈只有週五、六、日擺；其他天是 closed、模型是收攤的樣子
   10 公館三攤：鮮奶、紅豆餅買得到；手機殼只有看
   11 背景三攤只有看（不出選單、不扣錢）；颱風（tzStallsClosed）全部是 closed
   12 不改存檔：買完以後存檔多出來的欄位＝沒有（只有錢和時間變）
   修改前（開發分支 b810b809b：沒有 night_market.js、night_market3d.js）：0 就 FAIL。用法：node tests/night_market_unit.js */
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..'), SHA='3259b5f78', SRC='docs/story_planning/AA_752_night_market.json';
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
const need=['src/data/night_market.js','src/night_market3d.js','tools/story/import_night_market.py'].filter(f=>!fs.existsSync(path.join(ROOT,f)));
if(need.length){ check('0. 夜市看、買的檔案在',false,need.join(' ')); console.log('FAILED: '+fails); process.exit(1); }
/* 行事曆、遊戲（GAME）用假的：月份、星期、鐘點、錢由測試定 */
let MONTH=10, WD=5;   /* CALENDAR 的 wd：1＝週一 … 7＝週日 */
global.CALENDAR={dateOf:()=>({m:MONTH,wd:WD})};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/tingzhou_layout.js','src/tingzhou3d.js','src/data/night_market.js','src/night_market3d.js'];
const L0=(()=>{ const s=fs.readFileSync(path.join(ROOT,'src/data/tingzhou_layout.js'),'utf8'); return new Function(s+';return TINGZHOU_LAYOUT;')(); })();   /* 配置原本的時間（比差異用）*/
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
if(typeof ASSETS!=='undefined') ASSETS.loadOne=()=>new Promise(()=>{});
const L=TINGZHOU_LAYOUT, NM=NIGHT_MARKET, html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);

/* 1 */
{ const iD=html.indexOf('src/data/night_market.js'), iC=html.indexOf('src/night_market3d.js'), iT=html.indexOf('src/tingzhou3d.js');
  check('1. index.html 載入 night_market.js（資料）、night_market3d.js（程式），都在 tingzhou3d.js 後面',iD>0&&iC>iD&&iD>iT);
  const allow=JSON.parse(fs.readFileSync(path.join(ROOT,'docs/handoff/story_import_allow.json'),'utf8')), e=allow.files.filter(x=>x.path===SRC);
  check('1. 白名單有 AA_752 那一筆（approved、'+SHA+'）；資料檔寫的來源一樣',e.length===1&&e[0].status==='approved'&&e[0].sha===SHA&&!!e[0].approvedBy&&NM.src===SRC+'@'+SHA,JSON.stringify(e.map(x=>[x.sha,x.status])));
  let out='', ok=false, skip=false; try{ cp.execFileSync('git',['-C',ROOT,'cat-file','-e',SHA+':'+SRC],{stdio:'ignore'}); }catch(err){ skip=true; }
  if(!skip){ try{ out=cp.execFileSync('python3',[path.join(ROOT,'tools/story/import_night_market.py'),'--check'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}); ok=/^OK/.test(out); }catch(err){ out=String(err.stderr||err.message).slice(0,200); } }
  check('1. 匯入工具 --check：資料檔和企劃稿一致'+(skip?'（這個複本沒有企劃線的 '+SHA+'，略過；逐字對稿看第 2 項的表）':''),skip||ok,out.trim().slice(0,120)); }

/* 2 逐字對稿 */
const TABLE={   /* 稿的店名、品名、價錢（AA_752 @3259b5f78；企劃線的 commit 拿不到的時候也比得到）*/
  s01:['沈三盃黑糖鮮奶',[['黑糖珍珠鮮奶',65],['黑糖鮮奶',55],['黑糖珍珠奶茶',55],['黑糖鮮奶茶',50],['黑糖珍珠鮮奶（熱）',65]]],
  s02:['皇家高端胡椒餅',[['胡椒餅',60]]],
  s03:['二十元紅豆餅',[['紅豆餅',20],['奶油餅',20],['花生餅',20]]],
  s04:['一個地球',[['經典地瓜球',50],['雙色地瓜球',55],['起司地瓜球',60]]],
  s05:['當蔥蔥油餅',[['原味蔥油餅',45],['加蛋蔥油餅',55],['起司蔥油餅',65],['雙蛋蔥油餅',65]]],
  s06:['紹興炸豆腐',[['炸豆腐',70],['炸豆腐加泡菜',80]]],
  s07:['玉皇大帝',[['炭烤玉米・經典原味',70],['炭烤玉米・蒜香厚醬',70],['炭烤玉米・沙茶霸味',70],['炭烤玉米・椒麻嗆辣',70],['炭烤玉米・起司香濃',70],['炭烤玉米・檸檬椒鹽',70]]],
  s08:['陳家古早味雞蛋糕',[['雞蛋糕・原味',30],['雞蛋糕・奶香',35],['雞蛋糕・紅豆',40],['雞蛋糕・花生',40],['雞蛋糕・起司',45]]],
  s09:['節節高甘蔗汁',[['甘蔗汁・中杯',50],['甘蔗汁・大杯',65]]],
  s10:['公館阿婆甜湯',[['粉圓冰',50],['燒仙草',55]]]};
const HOURS={s01:[17,24],s02:[17,23],s03:[15,22],s04:[17,24],s05:[16,23],s06:[17.5,24],s07:[18,24],s08:[15,21.5],s09:[16,23],s10:[17,23]};   /* 稿的 hours（s10 夏天 14～23）*/
{ const bad=[]; for(const k in TABLE){ const st=NM.stalls[k]; if(!st){ bad.push(k+' 沒有'); continue; } if(st.name!==TABLE[k][0]) bad.push(k+' 店名'); if(!eq(st.items.map(i=>[i.name,i.price]),TABLE[k][1])) bad.push(k+' 品項或價錢'); if(!eq([st.open.from,st.open.to],HOURS[k])) bad.push(k+' 時間 '+JSON.stringify(st.open)); }
  check('2. 十攤的店名、品名、價錢、營業時間和稿的表一樣（33 樣）',!bad.length&&Object.keys(NM.stalls).length===10&&Object.values(NM.stalls).reduce((n,s)=>n+s.items.length,0)===33&&eq(NM.stalls.s10.openSummer,{from:14,to:23}),bad.join(' | '));
  check('2. 背景三攤的招牌字照稿：套圈圈、手機殼・配件、襪子；季節的月份：夏 5～9、冬 11～2',eq(Object.keys(NM.background).map(k=>NM.background[k].sign),['套圈圈','手機殼・配件','襪子'])&&eq(NM.season,{summer:[5,6,7,8,9],winter:[11,12,1,2]}),JSON.stringify(NM.season));
  let raw=null; try{ raw=JSON.parse(cp.execFileSync('git',['-C',ROOT,'show',SHA+':'+SRC],{encoding:'utf8',maxBuffer:1<<26,stdio:['ignore','pipe','ignore']})); }catch(e){}
  if(!raw) check('2. 整份逐字比企劃稿（這個複本沒有企劃線的 '+SHA+'，略過）',true);
  else { const diff=[]; for(const k in raw.stalls){ const a=raw.stalls[k], b=NM.stalls[k]||{}; for(const f of Object.keys(a)) if(!eq(a[f],b[f])) diff.push(k+'.'+f); for(const f of Object.keys(b)) if(!(f in a)&&f!=='open'&&f!=='openSummer') diff.push(k+'.'+f+'（稿上沒有）'); }
    for(const k in raw.background) if(!eq(raw.background[k],NM.background[k])) diff.push(k);
    if(raw.hoursNote!==NM.hoursNote||raw.seasonNote!==NM.seasonNote) diff.push('note');
    check('2. 整份逐字比企劃稿（'+SHA+'）：十攤每一個欄位、背景三攤、兩則說明一個字都不差',!diff.length&&Object.keys(raw.stalls).length===10&&Object.keys(raw.background).length===3,diff.join(' ')); } }

/* 3 對到配置 */
const ALL=L.stalls.list.concat(L.stalls.gongguan||[]);
{ const noKey=ALL.filter(q=>!NM3.KIND[q.kind]).map(q=>q.kind), used=ALL.map(q=>NM3.KIND[q.kind]).sort(), want=Object.keys(NM.stalls).concat(Object.keys(NM.background)).sort();
  const nameBad=ALL.filter(q=>{ const st=NM3.stallOf(q.kind), bg=NM3.bgOf(q.kind), nm=L.stalls.kinds[q.kind].name; return st?st.name!==nm:!(bg&&bg.sign.indexOf(nm)===0); }).map(q=>q.kind);
  check('3. 稿的十三攤一對一對到配置的十三攤（kind）；十攤的店名兩邊一字不差、背景三攤的招牌字開頭和配置一樣',!noKey.length&&eq(used,want)&&!nameBad.length,noKey.concat(nameBad).join(' ')); }
const mk=()=>{ const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; return E; };
const E=mk(); const z=Z3.ZONES.tingzhou.build(E); const nav=z.nav; const itsTZ=E.interactables.slice();
const cellOf=(n,x,zz)=>[Math.floor((x-n.ox)/n.cell),Math.floor((zz-n.oz)/n.cell)];
const freeAt=(n,x,zz)=>{ const [c,r]=cellOf(n,x,zz); return c>=0&&r>=0&&c<n.cols&&r<n.rows&&!n.b[n.idx(c,r)]; };
function reach(n,a,b){ const [sx,sz]=cellOf(n,...a), [tx,tz]=cellOf(n,...b); const seen=new Uint8Array(n.cols*n.rows), q=[[sx,sz]]; if(!freeAt(n,...a)) return false; seen[n.idx(sx,sz)]=1;
  while(q.length){ const [x,y]=q.shift(); if(Math.abs(x-tx)<=1&&Math.abs(y-tz)<=1) return true; for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nx=x+dx, ny=y+dy; if(nx<0||ny<0||nx>=n.cols||ny>=n.rows) continue; const i=n.idx(nx,ny); if(seen[i]||n.b[i]) continue; seen[i]=1; q.push([nx,ny]); } } return false; }
const E2=mk(), g=Z3.ZONES.gongguan.build(E2), itsGG=E2.interactables.slice();
{ const sp=[L.fromGongguan.x,L.fromGongguan.z], sp2=[L.toGongguan.spawn.x,L.toGongguan.spawn.z], bad=[];
  for(const [zone,its,list,n,s] of [[z,itsTZ,z.tzStalls,nav,sp],[g,itsGG,g.ggStalls,g.nav,sp2]]) for(const q of list){ const it=its.find(i=>i.nmStall===q.id), st=NM3.stallOf(q.kind), bg=NM3.bgOf(q.kind);
    if(!it){ bad.push(q.id+' 沒有互動點'); continue; } if(it.label!=='看'+(st?st.name:bg.sign)) bad.push(q.id+' 標籤 '+it.label); if(typeof it.onInteract!=='function') bad.push(q.id+' 不能按');
    if(!freeAt(n,it.x,it.z)) bad.push(q.id+' 站不住'); else if(!reach(n,s,[it.x,it.z])) bad.push(q.id+' 走不到'); const d=Math.hypot(it.x-q.x,it.z-q.z); if(d>2.4||d<0.6) bad.push(q.id+' 離攤 '+d.toFixed(2));
    const ax=Math.sin(q.yaw)*(it.x-q.x)+Math.cos(q.yaw)*(it.z-q.z); if(ax<0.5) bad.push(q.id+' 不在客人那一面'); }
  const near=[]; for(const a of itsTZ.filter(i=>i.nmStall)) for(const b of itsTZ) if(a!==b&&Math.hypot(a.x-b.x,a.z-b.z)<1.0) near.push(a.nmStall+'×'+(b.label||''));
  check('3. 十三攤各一個互動點「看＋店名」（汀州路 10、公館 3）：在客人那一面、站得住、從出生點走得到；不和別的互動點疊在一起',!bad.length&&itsTZ.filter(i=>i.nmStall).length===10&&itsGG.filter(i=>i.nmStall).length===3&&!near.length,bad.concat(near).join(' | ')); }

/* 假的遊戲：記下說了什麼、出了什麼選單 */
function game(money,hour,pick){ const G={day:40,weekday:5,hour,money,flags:{}}, log=[], menus=[], toasts=[]; let depth=0, saves=0;
  const GM={G,E:null,say:async(w,t)=>{ log.push([w?w.name:null,t]); },choose:async o=>{ menus.push(o); return typeof pick==='function'?pick(o):pick; },money:d=>{ G.money+=d; },advance:h=>{ G.hour+=h; },toast:t=>{ toasts.push(t); },
    sceneBegin(){ depth++; },sceneEnd(){ depth--; },autosave(){ saves++; }};
  return {GM,G,log,menus,toasts,depth:()=>depth,saves:()=>saves}; }
const fresh=()=>{ NM3._seen={}; NM3._prev={}; };
const fake=list=>{ for(const q of list){ q.open={visible:false}; q.closed={visible:false}; } };   /* 模型的兩個節點（測試裡沒有載入 GLB）*/
fake(z.tzStalls); fake(g.ggStalls);
const stallIn=(zone,kind)=>(zone.tzStalls||[]).concat(zone.ggStalls||[]).find(q=>q.kind===kind);
const zoneOf=kind=>stallIn(z,kind)?z:g;
const isNarr=t=>/^（[^）]*）$/.test(t)||(t[0]==='（'&&t[t.length-1]==='）'&&NM3.isNarr(t));

(async()=>{
  /* 4 營業中：十攤每一樣都買一次 */
  { const bad=[]; let n=0; MONTH=10; WD=5;
    for(const kind of Object.keys(NM3.KIND)){ const st=NM3.stallOf(kind); if(!st) continue; const zone=zoneOf(kind), q=stallIn(zone,kind), who=kind==='jelly'?'阿婆':'老闆';
      for(let i=0;i<st.items.length;i++){ fresh(); const it=st.items[i], X=game(500,19.5,i), r=await NM3.interact(X.GM,zone,q); n++;
        const look=X.log.slice(0,st.look.length), gr=X.log[st.look.length], buy=X.log.slice(st.look.length+1);
        if(r!==it.id) bad.push(it.id+' 回傳 '+r);
        if(!eq(look,st.look.map(t=>[null,t]))) bad.push(it.id+' look');
        if(!gr||gr[0]!==who||!st.greet.includes(gr[1])) bad.push(it.id+' greet '+JSON.stringify(gr));
        if(X.menus.length!==1||!eq(X.menus[0].map(o=>o.t),st.items.map(x=>x.name+'　'+x.price+' 元').concat(['算了']))||X.menus[0].some(o=>o.dim)) bad.push(it.id+' 選單');
        if(X.G.money!==500-it.price) bad.push(it.id+' 錢 '+X.G.money);
        if(Math.abs(X.G.hour-19.5-5/60)>1e-9) bad.push(it.id+' 時間');
        if(!eq(buy,it.buy.map(t=>[isNarr(t)?null:who,t]))) bad.push(it.id+' buy '+JSON.stringify(buy));
        if(X.depth()!==0) bad.push(it.id+' 段落沒收'); } }
    check('4. 十攤 33 樣各買一次（10 月週五 19:30）：look → 老闆一句 greet → 選單「品名　價錢 元」＋「算了」→ 扣那個價錢、時間過 5 分鐘、buy 逐字照順序（（…）沒名字、其他老闆說；甜湯是阿婆）',!bad.length&&n===33,bad.slice(0,6).join(' | '));
    fresh(); const q=stallIn(z,'pepper'), st=NM3.stallOf('pepper'), A=game(500,19.5,0); await NM3.interact(A.GM,z,q); const B=game(500,19.6,1), r2=await NM3.interact(B.GM,z,q);
    check('4. 同一天第二次不再念 look（直接老闆一句＋選單）；選「算了」不扣錢、不演 buy',A.log.length===st.look.length+1+st.items[0].buy.length&&B.log.length===1&&B.log[0][0]==='老闆'&&st.greet.includes(B.log[0][1])&&B.log[0][1]!==A.log[st.look.length][1]&&r2==='no'&&B.G.money===500&&B.G.hour===19.6,JSON.stringify(B.log));
    const C=game(500,19.5,1); C.G.day=41; fresh(); NM3._seen[q.id]=40; await NM3.interact(C.GM,z,q);
    check('4. 隔天再來：又先念 look',C.log.length===st.look.length+1&&eq(C.log.slice(0,st.look.length),st.look.map(t=>[null,t]))); }

  /* 5 錢不夠 */
  { fresh(); const q=stallIn(z,'scallion'), st=NM3.stallOf('scallion'), X=game(50,19.5,2), r=await NM3.interact(X.GM,z,q), n0=st.look.length+1;
    check('5. 錢不夠（50 元在蔥油餅攤）：45 元的沒有變灰、55／65 元的變灰；硬選 65 元的＝「錢不夠」、不扣錢、不演 buy、時間不動',r==='poor'&&eq(X.menus[0].map(o=>!!o.dim),[false,true,true,true,false])&&X.G.money===50&&X.log.length===n0&&eq(X.toasts,['錢不夠'])&&X.G.hour===19.5&&X.depth()===0,JSON.stringify([r,X.menus[0].map(o=>!!o.dim),X.G.money,X.toasts])); }

  /* 6、7 收攤、時間 */
  { const bad=[], diff=[]; MONTH=10; WD=5;
    for(const kind of Object.keys(NM3.KIND)){ const key=NM3.KIND[kind], st=NM3.stallOf(kind), bg=NM3.bgOf(kind), zone=zoneOf(kind), q=stallIn(zone,kind), K=L.stalls.kinds[kind], K0=L0.stalls.kinds[kind];
      if(st){ if(K.from!==st.open.from||K.to!==st.open.to) bad.push(kind+' 配置的時間沒有照稿 '+K.from+'～'+K.to); if(K0.from!==st.open.from||K0.to!==st.open.to) diff.push(kind+' 配置 '+K0.from+'～'+K0.to+' → 稿 '+st.open.from+'～'+st.open.to); }
      else if(K.from!==K0.from||K.to!==K0.to) bad.push(kind+' 背景攤的時間被改了');
      const a=K.from, b=K.to; for(const [h,want] of [[a,true],[a-0.05,false],[(a+b)/2,true],[b-0.05,true],[b%24,false],[4,false],[11,false]]){ fresh(); const X=game(500,((h%24)+24)%24,st?st.items.length:0), r=await NM3.interact(X.GM,zone,q);
        const open=X.menus.length===1||!!(bg&&r==='look');
        if(open!==want) bad.push(kind+' '+h.toFixed(2)+' 應該'+(want?'開':'收'));
        if(q.isOpen!==want||q.open.visible!==want||q.closed.visible===want) bad.push(kind+' '+h.toFixed(2)+' 模型和 isOpen 不一致');
        if(!want&&(!eq(X.log,[[null,(st||bg).closed]])||X.menus.length||X.G.money!==500)) bad.push(kind+' '+h.toFixed(2)+' 收攤要只有 closed 一句 '+JSON.stringify(X.log).slice(0,60));
        if(want&&bg&&!eq(X.log,[[null,bg.look]])) bad.push(kind+' 背景攤 look'); } }
    check('6. 十三攤：開攤那一刻開、開攤前 3 分鐘和收攤那一刻是 closed 一句（不出選單、不扣錢）、清晨和中午都是收攤；模型的營業／收攤節點、isOpen、能不能買三個一致',!bad.length,bad.slice(0,6).join(' | '));
    console.log('     營業時間和配置原本不一樣的（照稿）：'+(diff.join('；')||'沒有'));
    check('7. 營業時間照稿（AA 的 hoursNote）：十攤配置的 from／to 現在＝稿的 open；背景三攤照配置原本的',!bad.some(b=>/照稿|被改/.test(b))&&diff.length===9,diff.length+' 攤不一樣'); }

  /* 8 季節 */
  { const q=stallIn(z,'jelly'), st=NM.stalls.s10, run=async(m,h)=>{ MONTH=m; WD=5; fresh(); const X=game(500,h,2); NM3.rand=()=>0.999; const r=await NM3.interact(X.GM,z,q); NM3.rand=()=>Math.random(); return {X,r}; };
    const J=await run(7,15), Dc=await run(12,19), A4=await run(4,19), O15=await run(10,15), D15=await run(12,15), J13=await run(7,13.9);
    const pools=[7,12,4,10,3,5,9,11,2].map(m=>NM3.greetPool('s10',m).length).join();
    check('8. 甜湯 7 月：look 多 lookSummer、greet 多 greetSummer（排在一般句後面）、下午 3 點開著（夏天 14:00 開、13:54 還沒）',eq(J.X.log.slice(0,3),st.look.concat([st.lookSummer]).map(t=>[null,t]))&&eq(J.X.log[3],['阿婆',st.greetSummer[0]])&&J.r==='no'&&J13.r==='closed'&&eq(NM3.greetPool('s10',7),st.greet.concat(st.greetSummer)),JSON.stringify(J.X.log.slice(2,4)));
    check('8. 甜湯 12 月：look 多 lookWinter、greet 多 greetWinter；下午 3 點還沒開（17:00 才開）',eq(Dc.X.log.slice(0,3),st.look.concat([st.lookWinter]).map(t=>[null,t]))&&eq(Dc.X.log[3],['阿婆',st.greetWinter[0]])&&D15.r==='closed'&&eq(D15.X.log,[[null,st.closed]]),JSON.stringify(Dc.X.log.slice(2,4)));
    check('8. 甜湯 4 月、10 月：只有一般的 look、greet；10 月下午 3 點還沒開；每個月 greet 有幾句：夏 5～9 月 4、冬 11～2 月 4、3／4／10 月 3',eq(A4.X.log.slice(0,2),st.look.map(t=>[null,t]))&&A4.X.log[2][0]==='阿婆'&&st.greet.includes(A4.X.log[2][1])&&A4.X.log.length===3&&O15.r==='closed'&&pools==='4,4,3,3,3,4,4,4,4',pools);
    MONTH=7; fresh(); const P=game(500,19,0), q2=stallIn(z,'pepper'); await NM3.interact(P.GM,z,q2);
    check('8. 別的攤不分季節（7 月的胡椒餅：look、greet 照一般）',eq(P.log.slice(0,3),NM.stalls.s02.look.map(t=>[null,t]))&&NM.stalls.s02.greet.includes(P.log[3][1])); MONTH=10; }

  /* 9 套圈圈的星期 */
  { const q=stallIn(z,'ring'), bg=NM.background.b12, res=[]; MONTH=10;
    for(const wd of [1,2,3,4,5,6,7]){ WD=wd; fresh(); const X=game(500,19,0), r=await NM3.interact(X.GM,z,q); res.push(r+(q.isOpen?'+':'-')+(q.closed.visible?'c':'o')+(X.log[0][1]===(r==='look'?bg.look:bg.closed)?'':'!')); }
    global.GAME={G:{day:40,weekday:3,hour:19}};   /* 區域照時間切換的時候（引擎呼叫）讀得到遊戲的日期 */ WD=3; z.applyTimeOutdoor(19,null); const others=z.tzStalls.filter(s=>s.kind!=='ring'&&s.isOpen).length, off=JSON.stringify(z.tzStallOff);
    check('9. 套圈圈：週一到週四是 closed（模型收攤）、週五六日晚上 7 點是 look（模型營業）；其他九攤週三照常開',eq(res,['closed-c','closed-c','closed-c','closed-c','look+o','look+o','look+o'])&&others===9&&off==='{"st_ring":true}',res.join(' ')+' / '+others+' / '+off);
    WD=6; z.applyTimeOutdoor(19,null); check('9. 區域自己照時間切換的時候也會對星期（不用按互動點）：週六 19:00 套圈圈開著、tzStallOff 清掉',q.isOpen&&eq(z.tzStallOff,{})); WD=5; delete global.GAME; }

  /* 10 公館三攤 */
  { MONTH=10; WD=5; fresh(); const m=stallIn(g,'milk'), w=stallIn(g,'wheelcake'), p=stallIn(g,'phonecase');
    const A=game(100,19,0), ra=await NM3.interact(A.GM,g,m), B=game(100,19,2), rb=await NM3.interact(B.GM,g,w), C=game(100,19,0), rc=await NM3.interact(C.GM,g,p);
    check('10. 公館三攤（19:00）：鮮奶買黑糖珍珠鮮奶扣 65、紅豆餅買花生餅扣 20；手機殼只有 look 一句、不出選單',ra==='nm01_pearl_milk'&&A.G.money===35&&rb==='nm03_peanut'&&B.G.money===80&&rc==='look'&&eq(C.log,[[null,NM.background.b13.look]])&&!C.menus.length&&g.ggStalls.every(q=>q.isOpen),[ra,A.G.money,rb,B.G.money,rc].join(' ')); }

  /* 11 背景攤、颱風 */
  { MONTH=10; WD=5; const bad=[]; for(const kind of ['ring','phonecase','socks']){ fresh(); const zone=zoneOf(kind), q=stallIn(zone,kind), X=game(500,19,0), r=await NM3.interact(X.GM,zone,q); if(r!=='look'||X.menus.length||X.G.money!==500||X.log.length!==1||X.G.hour!==19) bad.push(kind); }
    z.tzStallsClosed=true; g.tzStallsClosed=true; const ty=[]; for(const kind of Object.keys(NM3.KIND)){ fresh(); const zone=zoneOf(kind), q=stallIn(zone,kind), X=game(500,19,0), r=await NM3.interact(X.GM,zone,q); if(r!=='closed'||X.menus.length||q.isOpen) ty.push(kind); }
    z.tzStallsClosed=false; g.tzStallsClosed=false;
    check('11. 背景三攤只有看（一句 look、不出選單、不扣錢、時間不動）；颱風（tzStallsClosed）十三攤都是 closed',!bad.length&&!ty.length,bad.concat(ty).join(' ')); }

  /* 12 存檔 */
  { MONTH=10; WD=5; fresh(); const X=game(500,19,0), k0=JSON.stringify(Object.keys(X.G).sort()), f0=JSON.stringify(X.G.flags); await NM3.interact(X.GM,z,stallIn(z,'corn')); await NM3.interact(X.GM,z,stallIn(z,'socks'));
    check('12. 不改存檔：買完、看完以後存檔沒有多欄位、flags 沒有多東西（只有錢和時間變）；買了會存檔一次',JSON.stringify(Object.keys(X.G).sort())===k0&&JSON.stringify(X.G.flags)===f0&&X.G.money===430&&X.saves()===1); }

  console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
