// 頁間書屋買東西（GG-YEJIAN-SHOP-1112；店面標準 §12 第 3、4 點；AA_853 @ 7f7394acc，分支 claude/magical-albattani-bk7b4n）——不需要瀏覽器（D131）。
// 照 index.html 的順序把整個遊戲載進 Node、建出真的頁間書屋（導航格、互動點），用假的 GM 跑真的 GGS.interact（src/ggshops_sys3d.js）＋ src/yejian_buy3d.js。
//   1  資料檔 src/data/yejian_shaola_buy.js 的頁間那一半逐字對稿（店員五句、五個點的看／品名／價錢／種類／買了的旁白、錢不夠）；匯入工具 --check；白名單
//   2  互動點：配置現有的「看看書牆」「看新書」「點咖啡」＋新加的「看雜誌」「看明信片」——站得住、從門口走得到、最近的按鈕是自己、不佔路人站的點；買教科書的點照舊
//   3  書牆：那天第一次店員 greet → 看一句（稿的 look 和原本三句一起輪）→ 選單三樣＋「不用了」→ 買了＝扣錢、+9 分鐘、那一樣的旁白、進「物品」、不再拿書去坐；
//        不用了＝照舊拿一本去位子上翻；「一本也沒拿」那一句＝不出選單、不拿書
//   4  新書推薦、明信片＝禮物：進「包包裡的禮物」（一般禮物：八位收到都是一般的那一格）；不進「買禮物…」那一張清單；包包滿了拿不了、不扣錢
//   5  雜誌：看 → 過期雜誌 50 → 進「物品」；沒買不拿去坐；明信片：面向窗
//   6  錢不夠：書牆＝稿的那一句旁白；其他點＝「錢不夠」；都不扣錢、不給東西；錢不會變負的
//   7  招呼：同一天第二次不說、隔天又說；買過三次（咖啡吧點的也算）＝greet_regular；店裡沒有店員（打烊）＝不說、只看不賣
//   8  咖啡吧：菜單＝稿的三樣（美式 90、拿鐵 120、當日蛋糕 110）；點了＝店員 order →（那天第一次 AA_653 那一句）→ 磨豆機那一句；飲料坐下喝、蛋糕坐下；「買一份帶走送人…」的清單跟著這份菜單
//   9  還沒開門（10:00 以前）按店門＝稿的 not_open；打烊以後照舊 AA_831 那一句；開著＝照常進去。打烊請出去那一句＝稿的 closed_line
//   10 存檔：只多 YJ_GREET、YJ_BUY_N；買的東西在 GG3_OWN、GIFTH.bag；JSON 來回不變；舊存檔沒有這些欄位照常（「物品」是空的、第一次照樣招呼）
//   11 index.html 載入順序；這支程式不寫台詞；node --check
// 修改前（f3e19b8eca：git archive 到暫存資料夾實際跑）：沒有資料檔、沒有 src/yejian_buy3d.js——書牆、新書只有看，沒有雜誌、明信片的點，買不到書（只有教科書）。這支整份紅（第 0 項就停）。
// 沒載入新稿的樣子（只載 ggshops_sys3d.js＝照舊只有看）：tests/yejian_actions_1110_unit.js、tests/aa653_shops_unit.js 照舊在查。
// 用法：node tests/yejian_buy_1112_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process'); const ROOT=path.resolve(__dirname,'..');
const SHA='7f7394acc', DOC='docs/story_planning/AA_853_yejian_shaola_buy.json', DATA='src/data/yejian_shaola_buy.js', MOD='src/yejian_buy3d.js';
const J=x=>JSON.stringify(x), src=f=>fs.readFileSync(path.join(ROOT,f),'utf8'), has=f=>fs.existsSync(path.join(ROOT,f)), r2=v=>+(+v).toFixed(2);
let fails=0; const out=console.log, check=(n,ok,info)=>{ out((ok?'PASS ':'FAIL ')+n+(info&&!ok?'　'+String(info).slice(0,900):'')); if(!ok) fails++; };
if(!has(DATA)||!has(MOD)){ out('FAIL 0 沒有 '+DATA+'／'+MOD+'（修改前：頁間書屋的書牆、新書只有看，買不到書）'); out('FAILED 1'); process.exit(1); }
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
const el=()=>({getContext:()=>ctx2d,style:{},classList:{add(){},remove(){},toggle(){},contains:()=>false},addEventListener(){},appendChild(){},setAttribute(){},querySelector:()=>null,querySelectorAll:()=>[],width:1,height:1});
global.document={ createElementNS:el, createElement:el, getElementById:()=>null, querySelector:()=>null, querySelectorAll:()=>[], addEventListener(){}, body:el(), documentElement:el() };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:'',href:''};
global.localStorage={getItem:()=>null,setItem(){},removeItem(){}}; global.requestAnimationFrame=()=>0;
process.on('unhandledRejection',e=>{ out('FAIL unhandledRejection '+(e&&e.stack||e)); fails++; }); global.fetch=()=>Promise.reject(new Error('no fetch'));
const HTML=src('index.html'), SRCS=[...HTML.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]); const warn0=console.warn; console.warn=()=>{};
for(const f of SRCS){ try{ vm.runInThisContext(src(f).replace(/^const (\w+)\s*=/mg,'globalThis.$1='),{filename:f}); }catch(e){} }
if(typeof YJBUY==='undefined'||!YJBUY.on()||typeof GGS==='undefined'){ out('FAIL 0 載不到 YJBUY／資料／GGS'); out('FAILED 1'); process.exit(1); }
const D=YEJIAN_SHAOLA_BUY.bookstore, T=D.staff, L=YEJIAN_LAYOUT, PT=k=>D.points.find(p=>p.kind===k), OPT=(n,p)=>n+'　'+p+' 元', CLERK=T.who;
const DK=k=>STORY.dayOfKey(k), WED=DK('2026-10-14');
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
let G=null; const GMo={};
E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; const z=Z3.ZONES.bookstore.build(E); if(z.id==null) z.id='bookstore'; E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.nav) E.nav._cm=null;
E.player={obj:{position:new THREE.Vector3(L.spawn.x,0,L.spawn.z),rotation:{y:0},userData:{}},radius:0.32,lv:0,seat:null,pose:'idle',idlePose:'idle'};
CHAR.setReadItem=()=>{}; CHAR.sitTaskFit=(o,kind)=>kind==='drink'?{kind}:null; CHAR.setSitTask=(o,f)=>{ o.userData.task=f||null; return !!f; }; if(typeof SEATACT!=='undefined') SEATACT.probe=()=>({h:0.75,edge:0.3,depth:0.3,y:0.75});
/* ---- 假的 GM ---- */
let said=[], menus=[], picks=[], toasts=[], walks=[], faces=[], sits=[], saves=0;
const GM={get G(){ return G; },E,enterN:1,
  say:async(w,t)=>{ said.push([w&&w.name||null,t]); }, choose:async o=>{ menus.push(o.map(q=>q.t+(q.dim?'（灰）':''))); const p=picks.length?picks.shift():o.length-1; return typeof p==='string'?o.findIndex(q=>q.t.startsWith(p)):p; },
  money:d=>{ G.money+=d; }, toast:t=>{ toasts.push(t); }, sceneBegin(){}, sceneEnd(){}, advance(h){ G.hour+=h; }, autosave(){ saves++; }, sleep:async()=>{}, caption(){},
  walkTo:async(P,x,z0)=>{ walks.push([r2(x),r2(z0),E.canStand(x,z0,0.32,0)]); P.obj.position.set(x,0,z0); return true; },
  face(P,x,z0){ faces.push([r2(x),r2(z0)]); }, freeSeat:st=>st, standUp(P){ P.seat=null; },
  seatMenu:async it=>{ const act=GGS.yjOnSeat(GM,it.seat); sits.push({seat:it.seat,act}); },
  enter:async()=>{} };
const reset=()=>{ said=[]; menus=[]; picks=[]; toasts=[]; walks=[]; faces=[]; sits=[]; };
const start=(money,o)=>{ o=o||{}; G={zone:'bookstore',day:o.day==null?WED:o.day,hour:o.hour==null?15:o.hour,money,flags:Object.assign({},o.flags||{}),name:'祐廷',stage:'law',invites:[]}; G.weekday=CALENDAR.dateOf(G.day).wd%7; if(typeof GAME!=='undefined') GAME.G=G; E.player.obj.position.set(L.spawn.x,0,L.spawn.z); E.player.seat=null; reset(); return G; };
const itOf=k=>E.interactables.find(q=>q.ggs===k);
const lineSeq=[]; const r0=GGS.rand; let rq=[]; GGS.rand=()=>rq.length?rq.shift():0;
/* 按到出現指定的那一句「看」為止（看的字是輪的：同一句不連續出）*/
const press=async(k,p,want)=>{ for(let n=0;n<12;n++){ const m0=G.money, f0=J(G.flags), h0=G.hour; reset(); E.player.obj.position.set(L.spawn.x,0,L.spawn.z); E.player.seat=null; picks=(p||[]).slice(); rq=[n/4+0.01]; await GGS.interact(itOf(k),GM); const look=said.map(s=>s[1]).find(t=>GGS.LOOK.bookstore[k]&&GGS.LOOK.bookstore[k].day.includes(t));
    if(!want||look===want) return {said:said.slice(),menus:menus.slice(),toasts:toasts.slice(),sits:sits.slice(),walks:walks.slice(),faces:faces.slice(),look,dm:G.money-m0,dh:r2(G.hour-h0)};
    G.money=m0; G.flags=JSON.parse(f0); G.hour=h0; } return null; };
const own=(id)=>(((G.flags.GG3_OWN||{}).bookstore||{})[id])|0;
const bag=()=>((G.flags.GIFTH||{}).bag||[]).map(b=>b.id);

(async()=>{
/* ===== 1 資料 ===== */
{ let raw=null; try{ raw=cp.execFileSync('git',['show',SHA+':'+DOC],{cwd:ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']}); }catch(e){}
  if(!raw) out('SKIP 1 讀不到稿 '+SHA+'（淺層複本：git fetch origin claude/magical-albattani-bk7b4n）');
  else { const R=JSON.parse(raw).bookstore, bad=[], KIND={'書牆':'shelf_browse','新書推薦':'new_books','雜誌':'magazines','明信片':'postcards','咖啡吧':'cafe_order'};
    if(D.name!==R.name) bad.push('name'); if(D.no_money!==R.no_money) bad.push('no_money');
    for(const k of ['greet','greet_regular','closed_line','not_open']) if(T[k]!==R.staff[k]) bad.push('staff.'+k); if(R.staff.who.indexOf(T.who)!==0||T.who!=='店員') bad.push('who');
    if(J(D.points.map(p=>p.label))!==J(Object.keys(R.points))) bad.push('points 的順序');
    for(const [lab,rp] of Object.entries(R.points)){ const p=D.points.find(q=>q.label===lab); if(!p||p.kind!==KIND[lab]){ bad.push(lab+' kind'); continue; }
      if((p.look||null)!==(rp.look||null)) bad.push(lab+' look'); if((p.order||null)!==(rp.order||null)) bad.push(lab+' order');
      if(J(p.goods.map(g=>[g.n,g.p,g.kind].concat(g.line?[g.line]:[])))!==J(rp.buy)) bad.push(lab+' buy'); }
    check('1 店員四句、五個點的看／order／品名／價錢／種類／旁白、錢不夠逐字對稿（九樣）',!bad.length&&D.points.reduce((a,p)=>a+p.goods.length,0)===9,bad.join('、'));
    check('1 熟客的次數＝稿 notes「greet_regular：在這裡買過三次以上」',D.regular===3&&R.notes.some(n=>n.startsWith('greet_regular：在這裡買過三次以上')));
    const ck=cp.spawnSync('python3',['tools/story/import_yejian_shaola.py','--check'],{cwd:ROOT,encoding:'utf8'});
    if(ck.error) out('SKIP 1 沒有 python3（匯入工具 --check）'); else check('1 匯入工具 --check：資料檔＝稿匯出來的（走 import_guard 白名單）',ck.status===0,(ck.stdout+ck.stderr).trim().slice(0,200)); }
  const A=JSON.parse(src('docs/handoff/story_import_allow.json')).files.filter(e=>e.path===DOC);
  check('1 白名單：AA_853 一筆 approved、sha＝'+SHA,A.length===1&&A[0].status==='approved'&&A[0].sha===SHA&&!!A[0].approvedBy);
  const ids=[].concat(...D.points.map(p=>p.goods.filter(g=>g.kind!=='eat').map(g=>g.id)));
  check('1 進存檔的東西（own、gift）各有固定的 id、不重複、不和節日禮物的 id 撞；咖啡吧的三樣是 eat',new Set(ids).size===6&&ids.every(i=>/^yj_/.test(i))&&PT('cafe_order').goods.every(g=>g.kind==='eat')&&J(D.points.map(p=>p.goods.map(g=>g.kind).join(',')))===J(['own,own,own','gift','own','gift','eat,eat,eat']),J(ids)); }

/* ===== 2 互動點 ===== */
{ start(5000); const DOOR=[L.spawn.x,L.spawn.z], bad=[], pts=['shelf_browse','new_books','magazines','postcards','cafe_order'].map(itOf);
  check('2 五個點都在：看看書牆、看新書（配置的字）、看雜誌、看明信片（「看」＋稿的點名）、點咖啡；買教科書的「看看法律書與文具」照舊',pts.every(Boolean)&&J(pts.map(q=>q.label))===J(['看看書牆','看新書','看雜誌','看明信片','點咖啡'])&&E.interactables.some(q=>q.shop==='book'&&q.label==='看看法律書與文具'),J(pts.map(q=>q&&q.label)));
  const reach=(x,z0,r)=>{ for(let dx=-r;dx<=r+1e-9;dx+=0.1) for(let dz=-r;dz<=r+1e-9;dz+=0.1){ if(Math.hypot(dx,dz)>r) continue; const px=x+dx, pz=z0+dz; if(!E.canStand(px,pz,0.32,0)) continue; const p=E.pathTo(DOOR[0],DOOR[1],0,px,pz,0); if(p&&p.length){ const e=p[p.length-1]; if(Math.hypot(e[0]-px,e[1]-pz)<0.3) return [px,pz]; } } return null; };
  const stands=((CROWD.SHOP_ZONES.bookstore||{}).units||[]).filter(u=>u.stand).map(u=>u.stand);
  for(const q of pts.filter(Boolean)){ if(!reach(q.x,q.z,(q.radius||1)-0.05)) bad.push(q.label+' 走不到'); for(const o of E.interactables) if(o!==q&&Math.hypot(o.x-q.x,o.z-q.z)<0.5) bad.push(q.label+' 和「'+o.label+'」疊在一起');
    for(const s of stands) if(Math.hypot(s[0]-q.x,s[1]-q.z)<0.45) bad.push(q.label+' 佔了路人站的點 '+s[0]+','+s[1]); }
  for(const k of ['magazines','postcards']){ const q=itOf(k); if(!q) continue; if(!E.canStand(q.x,q.z,0.32,0)) bad.push(q.label+' 那一點站不住'); const p=E.pathTo(DOOR[0],DOOR[1],0,q.x,q.z,0), e=p&&p.length?p[p.length-1]:null; if(!e||Math.hypot(e[0]-q.x,e[1]-q.z)>0.3) bad.push(q.label+' 走不到那一點');
    E.player.obj.position.set(q.x,0,q.z); if(E.nearestInteractable()!==q) bad.push(q.label+' 站在那一點最近的按鈕不是它'); }
  E.player.obj.position.set(L.spawn.x,0,L.spawn.z);
  check('2 每個點從門口走得到按鈕的範圍、不和別的按鈕疊在一起、不佔路人站的點；新加的兩個點本身站得住、走得到、站在那裡最近的按鈕是它',!bad.length,bad.join('｜'));
  const mg=itOf('magazines'), pc=itOf('postcards'), rack=L.items.find(i=>i.kind==='display_rack'&&i.x<0), wc=L.items.find(i=>i.kind==='window_counter');
  check('2 位置照配置的家具：雜誌在第一座斜面書架（雜誌）北邊 1 m 內；明信片在窗邊長吧台東段前面 1 m 內、最後一張高腳椅東邊',!!mg&&!!pc&&mg.z<rack.z&&Math.abs(mg.x-rack.x)<=rack.w/2&&rack.z-mg.z<1&&pc.z<wc.z&&wc.z-pc.z<1&&pc.x>3.2+0.9&&pc.x<wc.x+wc.w/2,J([mg&&[mg.x,mg.z],pc&&[pc.x,pc.z]])); }

/* ===== 3 書牆 ===== */
{ const P=PT('shelf_browse'), OLD=GGS.LOOK.bookstore.shelf_browse.day.filter(t=>t!==P.look), NO=OLD.find(t=>/一本也沒拿/.test(t)), OK=OLD.find(t=>!/一本也沒拿/.test(t));
  check('3 看的字：稿的 look 和原本三句（AA_653）一起輪，共四句',GGS.LOOK.bookstore.shelf_browse.day.length===4&&OLD.length===3&&GGS.LOOK.bookstore.shelf_browse.day.includes(P.look)&&!!NO&&!!OK);
  start(5000); let r=await press('shelf_browse',['二手小說'],P.look);
  check('3 那天第一次：店員 greet → 稿的 look → 選單「二手小說　120 元」「二手法律書（舊版）　150 元」「二手詩集　100 元」「不用了」',!!r&&J(r.said.slice(0,2))===J([[CLERK,T.greet],[null,P.look]])&&J(r.menus)===J([P.goods.map(g=>OPT(g.n,g.p)).concat(['不用了'])])&&P.goods.length===3,J(r&&[r.said,r.menus]));
  check('3 買二手小說：扣 120、時間 +9 分鐘、那一樣的旁白、進「物品」；不再拿書去坐',!!r&&r.dm===-120&&r.dh===0.15&&J(r.said[2])===J([null,P.goods[0].line])&&r.said.length===3&&own('yj_novel')===1&&!r.sits.length&&G.flags.YJ_BUY_N===1,J(r&&[r.dm,r.dh,r.said,r.sits,G.flags]));
  check('3 走過去、面向書牆（照舊）：走到的點站得住、面向書牆那一面',!!r&&r.walks.length===1&&r.walks[0][2]===true&&r.faces.length===1&&r.faces[0][1]<-4,J(r&&[r.walks,r.faces]));
  r=await press('shelf_browse',['二手小說'],OK); const o2=own('yj_novel'); r=await press('shelf_browse',['二手法律書'],OK);
  check('3 原本的那幾句後面也出選單；同一樣再買＝兩份；二手法律書 150 也進「物品」',o2===2&&own('yj_lawbook')===1&&!!r&&r.dm===-150&&J(r.said)===J([[null,OK],[null,P.goods[1].line]]),J([o2,G.flags.GG3_OWN,r&&r.said]));
  { const O=GG3.own(G), b=O.find(x=>x.zone==='bookstore'); check('3 「物品」分頁列得到：頁間書屋　二手小說 ×2、二手法律書（舊版）×1',!!b&&b.shop===D.name&&J(b.items.map(i=>[i.n,i.count]))===J([['二手小說',2],['二手法律書（舊版）',1]])&&/二手小說/.test(GG3.ownHTML(G)),J(O)); }
  r=await press('shelf_browse',['不用了'],P.look);
  check('3 不用了：不扣錢、照舊拿一本去位子上翻（閱讀桌或沙發、捧著書）',!!r&&r.dm===0&&r.sits.length===1&&r.sits[0].act==='read'&&[1,2,4].includes((L.seats.find(s=>Math.hypot(s.x-r.sits[0].seat.x,s.z-r.sits[0].seat.z)<0.05)||{}).table),J(r&&[r.dm,r.sits]));
  r=await press('shelf_browse',['二手小說'],NO);
  check('3 「最後一本也沒拿」那一句：不出選單、不拿書、不扣錢',!!r&&!r.menus.length&&!r.sits.length&&r.dm===0&&J(r.said)===J([[null,NO]]),J(r&&[r.menus,r.sits,r.said])); }

/* ===== 4 禮物：新書推薦、明信片 ===== */
{ const P=PT('new_books'), g=P.goods[0], C=PT('postcards'), c=C.goods[0]; start(5000); const list0=J(GIFT_HOLIDAY.shops.bookstore.items);
  let r=await press('new_books',[g.n],P.look);
  check('4 新書推薦：greet → 看 → 「店員推薦的新書　320 元」→ 扣 320、小卡那一句、放進包包裡的禮物（不在「物品」那一格）',!!r&&r.dm===-320&&J(r.said)===J([[CLERK,T.greet],[null,P.look],[null,g.line]])&&J(bag())===J(['yj_newbook'])&&own('yj_newbook')===0&&G.flags.GIFTH.bag[0].shop==='bookstore',J(r&&[r.dm,r.said,G.flags]));
  r=await press('postcards',[c.n],C.look);
  check('4 明信片 30：看 → 買 → 那一句旁白、放進包包；面向窗（南）；沒買不拿去坐',!!r&&r.dm===-30&&J(r.said)===J([[null,C.look],[null,c.line]])&&J(bag())===J(['yj_newbook','yj_postcard'])&&r.faces.length===1&&r.faces[0][1]>4&&!r.sits.length,J(r&&[r.dm,r.said,r.faces,bag()]));
  check('4 一般禮物（不是節日禮物）：八位收到都是一般的那一格（ok）；包包那一格列得到品名、店名；節日那天送得出去',GIFTH.PEOPLE.every(p=>GIFTH.cat(p,'yj_newbook')==='ok'&&GIFTH.cat(p,'yj_postcard')==='ok')&&/店員推薦的新書/.test(GIFTH.bagHTML(G))&&/明信片/.test(GIFTH.bagHTML(G))&&GIFTH.givable(G,'heroine_01').some(x=>x.id==='yj_newbook')&&GIFTH.shopName('bookstore')===D.name);
  check('4 「買禮物…」那一張清單（AA_732 的四樣）沒有多',J(GIFT_HOLIDAY.shops.bookstore.items)===list0&&GIFT_HOLIDAY.shops.bookstore.items.length===4&&!GIFT_HOLIDAY.shops.bookstore.items.some(i=>/^yj_/.test(i)));
  const B=G.flags.GIFTH.bag; while(GIFTH.bag(G).length<GIFTH.MAX) B.push({id:'yj_postcard',day:G.day,shop:'bookstore'}); r=await press('postcards',[c.n],C.look);
  check('4 包包滿了（10 樣）：拿不了、「包包已經放了 10 樣了」、不扣錢',!!r&&r.dm===0&&J(r.toasts)===J(['包包已經放了 10 樣了'])&&GIFTH.bag(G).length===10,J(r&&[r.dm,r.toasts])); }

/* ===== 5 雜誌 ===== */
{ const P=PT('magazines'), g=P.goods[0]; start(5000,{flags:{YJ_GREET:WED}}); let r=await press('magazines',[g.n],P.look);
  check('5 雜誌：看 → 「過期雜誌　50 元」→ 扣 50、那一句旁白、進「物品」；面向雜誌那一座書架',!!r&&r.dm===-50&&J(r.said)===J([[null,P.look],[null,g.line]])&&own('yj_magazine')===1&&r.faces.length===1&&Math.abs(r.faces[0][0]+0.6)<0.01&&r.walks.every(w=>w[2]),J(r&&[r.dm,r.said,r.faces,r.walks]));
  r=await press('magazines',['不用了'],P.look); check('5 不用了：不扣錢、不拿去坐',!!r&&r.dm===0&&!r.sits.length&&J(r.said)===J([[null,P.look]]),J(r&&[r.said,r.sits])); }

/* ===== 6 錢不夠 ===== */
{ start(10,{flags:{YJ_GREET:WED}}); const P=PT('shelf_browse'); let r=await press('shelf_browse',['二手小說'],P.look);
  check('6 書牆錢不夠（身上 10）：品項是灰的、選了＝稿的那一句旁白；不扣錢、沒有東西、不算買過',!!r&&r.dm===0&&r.menus[0][0]===OPT('二手小說',120)+'（灰）'&&J(r.said)===J([[null,P.look],[null,D.no_money]])&&own('yj_novel')===0&&!G.flags.YJ_BUY_N&&!r.sits.length,J(r&&[r.menus,r.said,G.flags]));
  const bad=[]; for(const k of ['new_books','magazines','postcards']){ const q=PT(k); r=await press(k,[q.goods[0].n],q.look); if(!r||r.dm!==0||J(r.toasts)!==J(['錢不夠'])||r.said.some(s=>s[1]===D.no_money)||G.money<0) bad.push(k+J(r&&[r.dm,r.toasts])); }
  check('6 新書、雜誌、明信片錢不夠：提示「錢不夠」（書牆那一句寫的是書牆的空位，不拿來用）；不扣錢',!bad.length&&!bag().length&&!G.flags.GG3_OWN,bad.join('｜'));
  start(0,{flags:{YJ_GREET:WED}}); for(const k of ['shelf_browse','new_books','magazines','postcards','cafe_order']) for(let i=0;i<4;i++){ reset(); picks=[i]; rq=[0.3]; await GGS.interact(itOf(k),GM); }
  check('6 身上 0 元每個點每一樣都按一輪：錢還是 0、什麼都沒拿到',G.money===0&&!G.flags.GG3_OWN&&!bag().length&&!G.flags.YJ_BUY_N,J([G.money,G.flags])); }

/* ===== 7 招呼 ===== */
{ start(5000); const P=PT('magazines'); let r=await press('magazines',['不用了'],P.look); const a=r.said[0], d1=G.flags.YJ_GREET; r=await press('postcards',['不用了']); const b=r.said.some(s=>s[0]===CLERK);
  G.day+=1; G.weekday=(G.weekday+1)%7; r=await press('magazines',['不用了'],P.look); const c=J(r.said[0])===J([CLERK,T.greet]);
  check('7 招呼一天一次：第一次按＝店員 greet、同一天換一個點不再說、隔天又說',J(a)===J([CLERK,T.greet])&&d1===WED&&!b&&c,J([a,b,c]));
  start(5000); await press('magazines',['過期雜誌']); await press('postcards',['明信片']); const n2=G.flags.YJ_BUY_N; reset(); picks=['拿鐵']; await GGS.interact(itOf('cafe_order'),GM); const n3=G.flags.YJ_BUY_N; G.day+=1; G.weekday=(G.weekday+1)%7; r=await press('shelf_browse',['不用了']);
  check('7 買過三次（咖啡吧點的也算）以後的那一天：招呼換成 greet_regular',n2===2&&n3===3&&J(r.said[0])===J([CLERK,T.greet_regular]),J([n2,n3,r.said[0]]));
  start(5000,{hour:22.5}); r=await press('magazines',['過期雜誌'],P.look);
  check('7 店裡沒有店員（打烊以後 22:30、沒有約沒有班）：不招呼、只有看、不出選單',!!r&&J(r.said)===J([[null,P.look]])&&!r.menus.length&&r.dm===0&&!SH831.staffed('bookstore',G),J(r&&[r.said,r.menus])); }

/* ===== 8 咖啡吧 ===== */
{ const C=PT('cafe_order'), M=GGS.MENU['bookstore.cafe_order']; start(5000);
  check('8 菜單＝稿的三樣：美式 90、拿鐵 120、當日蛋糕 110（原本 AA_653 的拿鐵 110、紅茶 80、今日蛋糕 100 換掉了）',J(M.items)===J([['美式',90],['拿鐵',120],['當日蛋糕',110]])&&J(M.items)===J(C.goods.map(g=>[g.n,g.p])));
  reset(); picks=['拿鐵']; rq=[0.1]; await GGS.interact(itOf('cafe_order'),GM);
  check('8 點拿鐵：選單三樣「品名　N 元」；扣 120；店員 order →（那天第一次）AA_653 那一句 → 磨豆機那一句；走到位子坐下喝',menus[0].slice(0,3).join()===C.goods.map(g=>OPT(g.n,g.p)).join()&&G.money===4880&&J(said.slice(0,2))===J([[CLERK,C.order],[CLERK,M.first[1]]])&&said.length===3&&said[2][0]===null&&sits.length===1&&sits[0].act==='drink',J([menus,said,sits,G.money]));
  reset(); picks=['當日蛋糕']; await GGS.interact(itOf('cafe_order'),GM);
  check('8 當日蛋糕 110：同一天第二次只有 order 和磨豆機那一句；坐下（不是喝的）',G.money===4770&&J(said.map(s=>s[0]))===J([CLERK,null])&&said[0][1]===C.order&&sits.length===1&&sits[0].act==='sit',J([said,sits,G.money]));
  const sh=GIFT.SHOPS&&GIFT.SHOPS['bookstore.cafe_order'], rows=sh?sh.rows(G):[];
  check('8 「買一份帶走送人…」的清單跟著這份菜單（飲料＝美式、拿鐵；沒有紅茶了）',!!sh&&J(rows)===J(M.items)&&J(rows.map(r=>r[0]).filter(n=>GIFT.isDrinkName(n)))===J(['美式','拿鐵']),J(rows));
  check('8 咖啡吧不招呼（招呼是看書的那四個點）、不進「物品」',!G.flags.YJ_GREET&&!G.flags.GG3_OWN&&G.flags.YJ_BUY_N===2,J(G.flags)); }

/* ===== 9 門口、打烊 ===== */
{ const g=(h)=>({G:{zone:'gongguan',day:WED,hour:h,flags:{},invites:[],weekday:3},sceneBegin(){},sceneEnd(){},say:async(w,t)=>{ said.push([w&&w.name||null,t]); },toast:t=>{ toasts.push(t); }});
  reset(); const a=await SH831.door(g(9),'bookstore'), s9=said.slice(); reset(); const b=await SH831.door(g(22),'bookstore'), s22=said.slice(); reset(); const c=await SH831.door(g(15),'bookstore'), s15=said.slice();
  check('9 還沒開門（09:00）按店門＝稿的 not_open、不進去；打烊以後（22:00）照舊 AA_831 那一句；開著（15:00）照常進去',a===true&&J(s9)===J([[null,T.not_open]])&&b===true&&J(s22)===J([[null,SHOP_HOURS_AA831.shops.bookstore.door]])&&c===false&&!s15.length,J([a,s9,b,s22,c]));
  reset(); await SH831.door(g(9),'noodle'); check('9 別的店不受影響（公館燒臘 09:00＝照舊 AA_831 那一句）',J(said)===J([[null,SHOP_HOURS_AA831.shops.noodle.door]]),J(said));
  check('9 打烊請出去那一句＝稿的 closed_line（src/xs_close3d.js，照舊）',XSCLOSE.LINE===T.closed_line&&!!XSCLOSE.ZONES.bookstore); }

/* ===== 10 存檔 ===== */
{ start(5000); await press('shelf_browse',['二手詩集']); await press('new_books',['店員推薦的新書']); const keys=Object.keys(G.flags).sort();
  check('10 存檔只多 G.flags 的 YJ_GREET、YJ_BUY_N；買的東西在現有的 GG3_OWN、GIFTH',J(keys)===J(['GG3_OWN','GIFTH','YJ_BUY_N','YJ_GREET'])&&J(G.flags.GG3_OWN)===J({bookstore:{yj_poetry:1}})&&G.flags.YJ_BUY_N===2,J(G.flags));
  const s=J(G), back=JSON.parse(s); check('10 存檔 JSON 來回不變；讀回來「物品」、包包照樣列得到',J(back)===s&&GG3.own(back).some(x=>x.zone==='bookstore')&&GIFTH.bag(back).length===1);
  const old={zone:'bookstore',day:WED,hour:15,money:100,flags:{},weekday:3,invites:[]}; const o0=J(old);
  check('10 舊存檔沒有這些欄位：「物品」是空的、算不是熟客、讀的時候不寫存檔',GG3.own(old).length===0&&YJBUY.regular(old)===false&&YJBUY.staffed(old)===true&&J(old)===o0); }

/* ===== 11 接線 ===== */
{ const strip=s=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[^:'"\\])\/\/[^\n]*/g,'$1'), M=strip(src(MOD)), pos=f=>HTML.indexOf('src="'+f);
  const lit=[...M.matchAll(/'((?:[^'\\]|\\.)*)'/g)].map(m=>m[1]).filter(s=>/[一-鿿]/.test(s));
  check('11 這支程式不寫台詞：除了系統字（不用了、錢不夠、看、元、包包已經放了…樣了）沒有別的中文字串',lit.every(s=>['　',' 元','不用了','錢不夠','看','包包已經放了 ',' 樣了'].includes(s)),J(lit));
  check('11 index.html：資料檔在前、這一支在 ggshops_sys3d.js、gg3shops3d.js、gifthol3d.js、shop_hours831_3d.js、gift3d.js 後面、GAME.boot() 前面',pos(DATA)>0&&pos(MOD)>pos(DATA)&&['src/ggshops_sys3d.js','src/gg3shops3d.js','src/gifthol3d.js','src/shop_hours831_3d.js','src/gift3d.js'].every(f=>pos(f)>0&&pos(f)<pos(MOD))&&pos(MOD)<HTML.indexOf('GAME.boot()'));
  const bad=[]; for(const f of [DATA,MOD,'src/ggshops_sys3d.js','src/shop_hours831_3d.js','src/zones3d.js']){ const r=cp.spawnSync(process.execPath,['--check',path.join(ROOT,f)],{encoding:'utf8'}); if(r.status!==0) bad.push(f); }
  check('11 node --check',!bad.length,bad.join('、')); }
GGS.rand=r0; console.warn=warn0;
out(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();
