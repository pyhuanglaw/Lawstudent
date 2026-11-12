// SHOP-LIFE-AUDIT-1112（USER_WANTS X356；使用者 2026-11-12：「泰米沒有店員」「你要每一家店都看他有沒有店員、有沒有安排客人在裡面、有沒有讓我巧遇同學的機會、有沒有打工」
// 「118 巷就是要很容易遇到同學，現在店裡甚至都沒有人」）——不需要瀏覽器（D131）。盤點表：docs/handoff/SHOP_LIFE_AUDIT_1112.md。
// 做法：在 Node 照 index.html 的順序把**整個遊戲的程式全部載入**（433 支；和玩家拿到的同一份、同一個順序），建出每一間店真正的區域（Z3.ZONES[id].build），
//   再叫遊戲換區域時真的會叫的 STORY.populate（店員、路人客人 CROWD.enter、有名字的人的作息 populateSchedule 都在裡面）。只換掉三樣瀏覽器才有的東西：
//   畫面（document／canvas 的空殼）、E.addNPC／E.removeNPC（原本要 WebGL 場景；這裡只記在 E.npcs）、game3d.js 裡的 E／G（多一個測試用的設定入口，不改遊戲的檔）。
//   1  載入：433 支都載得進來、沒有例外；src/shoplife3d.js 排在所有會放店員的模組後面（包在他們的 STORY.populate 外面）；這支檔沒有任何台詞
//   2  每一間店（清單是從遊戲資料算出來的，不是寫死的：新加的店會自動被檢查）：開著的時候有店員（n.clerk）站在店裡；不放店員的店要寫在例外表、寫原因
//   3  泰米村食週三 17:00～17:40（使用者截圖那一刻）：開著、店員站在配置的 clerk、有客人的位子；營業時間 11:00–21:00
//   4  路人客人：吃飯／喝東西的店在自己的尖峰平均至少 1 位；其他的店在一週的白天至少看得到客人；一間店同時最多 10 位（原本的上限）
//   5  這次新加客人的店：站著的站得住、前面 0.75 m 是家具或牆、不站在按鈕和出口上；坐著的坐在區域真正的座位；洗樂三張椅子至少留一張
//   6  吃飯時間遇得到同學（SHOPLIFE）：118 巷九間每一間都排得到人；118 巷比其他店多；平日午餐、晚餐幾乎每天巷子裡都有同學；一間店一餐最多兩位；
//      原本的作息優先（排進去的時候他原本沒事；AA_705／AA_632 寫好的列不受影響）；考試週、颱風假、經濟系那一年不排；同一天算兩次結果一樣；不動存檔
//   7  真的走進去看得到：名單上的人，那個時間走進那間店＝他坐在店裡的座位上（有名字的人物，不是路人）；汀州路的新店也遇得到
//   8  盤點表每一間店都有一列（盤點以後新加的店印 WARN 提醒，不擋）
// 修改前（開發分支 371fd882b2）：沒有 SHOPLIFE＝第 1 節就 FAIL、後面不跑。改之前用同一套做法量到的（盤點表第 1 節）：花序、客居雲南、越好吃小館、山嵐、大步、好拍、新生運動廣場開著沒有店員；
//   泰米村食等 11 間沒有任何路人客人；118 巷的水上便當、迪倫窯烤披薩一整個學期作息表排不到任何一位同學。
// 用法：node tests/shop_life_audit_1112_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
process.on('unhandledRejection',()=>{}); global.window=global; global.self=global; const warns=[]; console.warn=(...a)=>{ warns.push(a.map(String).join(' ').slice(0,200)); };
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'||k==='createImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
const el=()=>({getContext:()=>ctx2d,style:{},dataset:{},classList:{add(){},remove(){},toggle(){},contains:()=>false},children:[],childNodes:[],width:1,height:1,appendChild(){},removeChild(){},addEventListener(){},removeEventListener(){},setAttribute(){},getAttribute:()=>null,querySelector:()=>null,querySelectorAll:()=>[],remove(){},getBoundingClientRect:()=>({left:0,top:0,width:1,height:1}),focus(){},blur(){},insertBefore(){}});
global.document={ createElementNS:()=>el(), createElement:()=>el(), getElementById:()=>null, querySelector:()=>null, querySelectorAll:()=>[], addEventListener(){}, removeEventListener(){}, body:el(), documentElement:el(), head:el() };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.removeEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:'',href:'',hash:''};
global.localStorage={getItem:()=>null,setItem(){},removeItem(){}}; global.fetch=()=>Promise.reject(new Error('no fetch in node')); global.requestAnimationFrame=()=>0; global.matchMedia=()=>({matches:false,addEventListener(){}});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const J=JSON.stringify;

// ---------- 1 載入整個遊戲 ----------
const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'); const FILES=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]); const loadErr=[];
for(const f of FILES){ if(/three-vrm|lz-string/.test(f)) continue; let src;
  try{ src=fs.readFileSync(path.join(ROOT,f),'utf8'); }catch(e){ loadErr.push(f+'（沒有這個檔）'); continue; }
  src=src.replace(/^(const|let) (\w+)\s*=/mg,(m,k,n)=>'globalThis.'+n+'=');
  if(f==='src/game3d.js') src=src.replace('const GM={E:null,','const GM={_test:(e,g)=>{ E=e; G=g; GM.E=e; GM.G=g; },E:null,');   /* 測試用：設定 game3d.js 裡的 E、G（平常是 GM.boot 設的，要 WebGL）*/
  try{ vm.runInThisContext(src,{filename:f}); }catch(e){ loadErr.push(f+'：'+String(e&&e.message||e).slice(0,160)); } }
check('1 index.html 的程式全部載得進來（'+FILES.length+' 支）',!loadErr.length&&typeof GAME!=='undefined'&&typeof GAME._test==='function'&&typeof STORY!=='undefined'&&typeof CROWD!=='undefined',loadErr.slice(0,5).join(' | '));
{ const at=f=>FILES.indexOf(f), me=at('src/shoplife3d.js'), before=['src/crowd3d.js','src/shopenc3d.js','src/gg3shops3d.js','src/shopnpc3d.js','src/flower_notes_sys3d.js','src/xsshop_sys3d.js','src/limao3d.js','src/tz_shops3d.js'].filter(f=>at(f)>=0);
  /* 會放店員的模組都要在它前面（它包在他們的 STORY.populate 外面：別人放了店員就不再放）。它後面只有校園的電梯那一支、BB 補的事件包那幾支（index.html 的順序別的測試有規定：campus_l123_3d.js 要緊接 bbpack_events.js、bbpack3d.js 要緊接 GAME.boot()）*/
  const after=FILES.slice(me+1).filter(f=>!/^src\/(campus_l123_3d|data\/bbpack_events|bbpack3d|data\/sup497_lines|sup497_3d|aa524_3d|onetap3d)\.js$/.test(f));
  check('1 SHOPLIFE 載入了：排在所有會放店員的模組後面（index.html；後面只剩 BB 的事件包、一鍵那幾支）',typeof SHOPLIFE!=='undefined'&&me>=0&&before.every(f=>at(f)<me)&&!after.length,after.join(' ')||('第 '+(me+1)+'／'+FILES.length+' 支')); }
if(typeof SHOPLIFE==='undefined'||typeof GAME==='undefined'||!GAME._test){ console.log('FAILED '+fails); process.exit(1); }
{ const code=fs.readFileSync(path.join(ROOT,'src/shoplife3d.js'),'utf8').replace(/\/\*[\s\S]*?\*\//g,'');   /* 拿掉註解以後 */
  const zh=(code.match(/'[^'\n]*[一-鿿][^'\n]*'/g)||[]).filter(s=>!/^'(洗衣店是自助的|只有上師一個人|SHOP-LIFE-AUDIT-1112)/.test(s));   /* 例外原因、作息的 note 不是玩家看得到的字 */
  check('1 src/shoplife3d.js 沒有任何台詞（不呼叫 say／caption／toast／choose，沒有玩家看得到的中文字串）',!/\.(say|caption|toast|choose|titleCard|runLines)\(/.test(code)&&!zh.length,zh.slice(0,3).join(' ')); }

const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; ASSETS.loadOne=()=>new Promise(()=>{});   /* 正式模型不載入（店員、座位、導航不靠模型）*/
E.addNPC=n=>{ n.path=null; n.speed=n.speed||0; n.pose=n.pose||'idle'; n.radius=0.32; n.lv=n.lv|0; E.npcs.push(n); return n; }; E.removeNPC=n=>{ E.npcs=E.npcs.filter(m=>m!==n); }; E.addExtra=x=>{ (E.extras=E.extras||[]).push(x); return x; };
const GM=GAME, G=GM.defaults(); E.player={obj:new THREE.Group(),radius:0.32,lv:0,seat:null}; E.npcs=[]; GM._test(E,G); GM.bindSystems();
const DKm={}; const DK=key=>{ if(DKm[key]==null){ for(let d=-400;d<2500;d++) if(CALENDAR.dateOf(d).key===key){ DKm[key]=d; break; } } return DKm[key]; };
function enter(id,day,hour){ G.day=day; G.hour=hour; G.weekday=CALENDAR.dateOf(day).wd%7; G.zone=id; E.hour=hour;
  E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.extras=[]; E.exits=[]; E.spawnHint=null; GM.npc={}; GM.extras=[];
  const z=Z3.ZONES[id].build(E); z.def=Z3.ZONES[id]; if(z.id==null) z.id=id; E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(z.nav) z.nav._cm=null; if(E.levels) for(const n of E.levels) n._cm=null; E.indoor=!!Z3.ZONES[id].indoor;
  E.player.obj.position.set(z.spawn.x,0,z.spawn.z); E.player.seat=null; E.player.lv=(z.spawn.lv|0);
  STORY.populate(id,GM); return z; }
const clerks=()=>E.npcs.filter(n=>n.clerk), anon=()=>E.npcs.filter(n=>(typeof n.crowd==='string'&&/^shop_/.test(n.crowd))||n.cafeCust), named=()=>E.npcs.filter(n=>n.charId);

// ---------- 店的清單（從遊戲資料算）----------
const TW=z=>!/^us_|^jp_|^airport/.test(z);
const SHOPS=[]; { const add=z=>{ if(z&&Z3.ZONES[z]&&Z3.ZONES[z].indoor&&!SHOPS.includes(z)) SHOPS.push(z); };
  for(const z of ['cafe','cvs','noodle','bookstore','bikeshop']) add(z);                                   /* 最早的五間（places.js 沒有標 shop 的）*/
  for(const z of Object.keys(PLACES.hours)) if(PLACES.hours[z].shop) add(z);                               /* places.js 標了 shop 的 */
  for(const z of Object.keys(CROWD.SHOP_ZONES)) add(z);                                                    /* 有路人客人的 */
  for(const k of Object.keys(TZ_SHOPS_LAYOUT)) add(TZ_SHOPS_LAYOUT[k].zone);                               /* 汀州路／公館的室內 */
  for(const s of LANE118_SHOPS.shops) add('l118_'+s.id);                                                   /* 118 巷有室內的 */
  for(const z of ['flower_notes','wz_offbeat','xs_dakou','tz_xile','us_market']) add(z); }
const NOT_SHOP={xs_nanyang_hall:'南洋戲院的影廳（不是店面；大廳 xs_nanyang 有算）'};
const LIST=SHOPS.filter(z=>!NOT_SHOP[z]);
/* 2026-11-12 盤點過的 47 間（盤點表有一列）。之後新加的店（清單裡有、這裡沒有）：店員照樣要有（第 2 節會擋）；路人客人、盤點表那一列先印 WARN 提醒（不擋：加店的人把它加進 crowd3d.js 的 S.shopDefs 和盤點表，再加進這裡）*/
const AUDITED=['cafe','cvs','noodle','bookstore','bikeshop','afar','daybreak','yangyang','corner_records','aoki','flower_notes','gg_antai','gg_xianguo','gg_rongendian','tz_taimi','tz_yuehaochi','tz_keju','tz_yindehao','tz_xile','tz_limao','tz_dongnan','tz_liantong',
  'wz_brunch','wz_print','wz_teahouse','wz_lin','wz_teishoku','wz_offbeat','wz_mokuyobi','xs_tongxian','xs_nanyang','xs_shanlan','xs_dakou','xs_dabu','xs_haopai','xs_xsports','l118_dian','l118_self','l118_tea','l118_home','l118_cafe2','l118_pasta','l118_korea','l118_omu','l118_noodle2','us_market','us_asian_market'];
const NEWCOMER=LIST.filter(z=>!AUDITED.includes(z));
if(NEWCOMER.length) console.log('WARN 盤點以後新加的店（盤點表還沒有；路人客人請加進 crowd3d.js S.shopDefs）：'+NEWCOMER.join(' '));
/* 不放店員的店（要寫原因）*/
const NO_CLERK=Object.assign({},SHOPLIFE.NO_CLERK);
/* 不排路人客人的店（要寫原因）*/
const NO_CUST={tz_limao:'上師的命理館：不是一般的店，客人就是玩家',us_asian_market:'美國交換的店：路人客人那一套只做了臺灣（美國的另外做，不在這次範圍）',us_market:'同上'};
const isOpen=(z,day,h)=>{ const m=/^l118_(.+)$/.exec(z); if(m) return L118.isOpen(m[1],{day,hour:h,weekday:CALENDAR.dateOf(day).wd%7,flags:{}});
  if(z==='noodle'&&typeof NOODLE_CLOSED!=='undefined'&&NOODLE_CLOSED.closed&&NOODLE_CLOSED.closed({day,hour:h,flags:{}})) return false; return PLACES.isOpen(z,h,day); };
const WED=DK('2025-10-08'), SAT=DK('2025-10-11'), TUE=DK('2025-10-07');
check('2 店的清單（臺灣 '+LIST.filter(TW).length+' 間＋美國 '+LIST.filter(z=>!TW(z)).length+' 間）：盤點過的 '+AUDITED.length+' 間都還在',AUDITED.every(z=>LIST.includes(z)),AUDITED.filter(z=>!LIST.includes(z)).join(' ')||LIST.join(' '));

// ---------- 2 每一間店開著的時候有店員 ----------
const HOURS=[9.5,12.5,15.5,17.5,18.5,20.5,22.5];
{ const bad=[], exc=[], info=[]; let nSample=0;
  for(const z of LIST){ let nOpen=0, nClerk=0; const miss=[];
    for(const d of [WED,SAT,TUE]) for(const h of HOURS){ if(!isOpen(z,d,h)) continue; if(nOpen>=4&&d!==WED) continue; nOpen++; nSample++; enter(z,d,h); if(clerks().length) nClerk++; else miss.push(CALENDAR.dateOf(d).key.slice(5)+' '+h); }
    if(NO_CLERK[z]){ exc.push(z+'（'+NO_CLERK[z]+'）'); if(nClerk) bad.push(z+' 寫了不放店員卻有店員'); continue; }
    if(!nOpen) bad.push(z+' 找不到開著的時刻'); else if(nClerk<nOpen) bad.push(z+' 開著沒有店員：'+miss.slice(0,3).join('、')); else info.push(z); }
  check('2 每一間店開著的時候有店員站在店裡（'+info.length+' 間；'+nSample+' 個時刻）',!bad.length,bad.join('；'));
  check('2 不放店員的只有例外表上的（寫了原因）',exc.length===Object.keys(NO_CLERK).length&&Object.keys(NO_CLERK).every(z=>LIST.includes(z)),exc.join('；')); }
/* 這次補的店員：站在配置的位置、不在客人走得到的地方擋路（frozen、不背包）*/
{ const bad=[]; for(const z of LIST){ if(NO_CLERK[z]||!isOpen(z,WED,18.5)) continue; enter(z,WED,18.5); const c=E.npcs.find(n=>n.shopLifeClerk); if(!c) continue; const sp=SHOPLIFE.clerkSpot(z,E);
    if(!sp||Math.abs(c.obj.position.x-sp.x)>1e-6||Math.abs(c.obj.position.z-sp.z)>1e-6||!c.frozen||(c.lv|0)!==(sp.lv|0)) bad.push(z+' 位置不對');
    if(E.interactables.some(i=>!i.hidden&&!i.seat&&Math.hypot(i.x-sp.x,i.z-sp.z)<0.4)) bad.push(z+' 店員站在按鈕上');
    if(Math.hypot(E.zone.spawn.x-sp.x,E.zone.spawn.z-sp.z)<1.2) bad.push(z+' 店員站在門口');
    if(clerks().length!==1) bad.push(z+' 店員 '+clerks().length+' 位'); }
  check('2 SHOPLIFE 補的店員：站在配置的位置、不在按鈕和門口上、一間一位',!bad.length,bad.join('；')); }
{ enter('daybreak',WED,18.5); const closed=!clerks().some(n=>n.shopLifeClerk); enter('flower_notes',WED,23); const c2=!isOpen('flower_notes',WED,23)&&!clerks().length;
  check('2 關門以後 SHOPLIFE 不放店員（花序 23:00）',closed&&c2); }

// ---------- 3 泰米村食週三 17:00～17:40 ----------
{ const L=TZ_SHOPS_LAYOUT.taimi, bad=[]; for(const h of [17.02,17.3,17.65]){ const z=enter('tz_taimi',WED,h); const c=clerks()[0];
    if(!isOpen('tz_taimi',WED,h)) bad.push(h+' 沒開'); if(!c||Math.abs(c.obj.position.x-L.clerk.x)>1e-6||Math.abs(c.obj.position.z-L.clerk.z)>1e-6) bad.push(h+' 沒有店員'); if(!Array.isArray(z.seats)||z.seats.length!==L.seats.length) bad.push(h+' 沒有座位'); }
  check('3 泰米村食 週三 17:00～17:40：開著、店員站在櫃台後面（配置的 clerk）、22 個座位',!bad.length,bad.join('；'));
  check('3 泰米村食、林家乾麵營業時間 11:00–21:00（一段；15:30 開著、週一公休）',isOpen('tz_taimi',WED,15.5)&&isOpen('wz_lin',WED,15.5)&&!isOpen('tz_taimi',DK('2025-10-06'),12)&&/11:00–21:00/.test(PLACES.hours.tz_taimi.text)&&/11:00–21:00/.test(PLACES.hours.wz_lin.text),PLACES.hours.tz_taimi.text); }

// ---------- 4 路人客人 ----------
const DAYS=[]; for(let d=DK('2025-09-22');DAYS.length<8;d++) if(CALENDAR.kind(d)==='term'&&!CALENDAR.weekend(d)&&!CALENDAR.holiday(d)&&!CALENDAR.termOf(d).exam) DAYS.push(d);
const EAT_KIND={meal:18.5,brunch:10.5,cafe:12.5,tea:15,bistro:19,study:19.5,drink:12.5};
const peakOf=z=>{ if(z==='cafe') return 20.5; const d=CROWD.SHOP_ZONES[z]; if(!d) return null; if(z==='yangyang') return 21; if(z==='l118_cafe2') return 12.5; return EAT_KIND[d.kind]||null; };
{ const bad=[], info=[], over=[]; let mx=0;
  for(const z of LIST){ if(NO_CUST[z]) continue; if(!AUDITED.includes(z)&&!CROWD.SHOP_ZONES[z]) continue;   /* 新加的店還沒排客人：上面印了 WARN */ const pk=peakOf(z);
    if(pk!=null){ let n=0, sum=0; for(const d of DAYS){ if(!isOpen(z,d,pk)) continue; enter(z,d,pk); const a=anon().length; n++; sum+=a; mx=Math.max(mx,a); if(a>CROWD.SHOP_CAP) over.push(z+' '+a); }
      const avg=n?sum/n:0; info.push(z+' '+avg.toFixed(1)); if(!n||avg<(z==='l118_tea'?0.8:1)) bad.push(z+'（'+pk+' 點，開 '+n+' 天，平均 '+avg.toFixed(2)+' 位）'); }
    else { let seen=0, n=0; for(const d of DAYS.slice(0,5)) for(const h of [12.5,15.5,18.5]){ if(!isOpen(z,d,h)) continue; enter(z,d,h); const a=anon().length; n++; if(a) seen++; mx=Math.max(mx,a); if(a>CROWD.SHOP_CAP) over.push(z+' '+a); }
      info.push(z+' '+seen+'/'+n); if(!n||seen<Math.max(2,Math.floor(n*0.3))) bad.push(z+'（'+n+' 個時刻只有 '+seen+' 個有客人）'); } }
  check('4 吃飯、喝東西、念書的店在自己的尖峰平均至少 1 位路人客人；其他的店一週白天至少三成的時刻有客人',!bad.length,bad.length?bad.join('；'):info.join('、'));
  check('4 一間店同時最多 '+CROWD.SHOP_CAP+' 位路人客人（原本的上限，沒有放寬）',!over.length&&mx<=CROWD.SHOP_CAP,over.join('；')||('最多 '+mx+' 位'));
  check('4 不排路人客人的只有例外表上的（寫了原因）',Object.keys(NO_CUST).every(z=>!CROWD.SHOP_ZONES[z]),Object.keys(NO_CUST).map(z=>z+'（'+NO_CUST[z]+'）').join('；')); }

// ---------- 5 這次新加客人的店：站的、坐的位置 ----------
const NEW_CUST=LIST.filter(z=>CROWD.SHOP_ZONES[z]&&(TZ_SHOPS_LAYOUT[Object.keys(TZ_SHOPS_LAYOUT).find(k=>TZ_SHOPS_LAYOUT[k].zone===z)]||z==='flower_notes'||z==='bikeshop'));
{ const bad=[]; let nStand=0, nSit=0;
  for(const z of NEW_CUST){ const def=CROWD.SHOP_ZONES[z]; const zz=enter(z,WED,14);
    for(const u of def.units){ if(u.stand){ const [x,zc,yaw]=u.stand; nStand++; if(!E.canStand(x,zc,0.3,0)) bad.push(z+' 站不住 '+x+','+zc);
        if(E.canStand(x+Math.sin(yaw)*0.75,zc+Math.cos(yaw)*0.75,0.05,0)) bad.push(z+' 前面沒有東西 '+x+','+zc);
        if(E.interactables.some(i=>!i.seat&&!i.hidden&&Math.hypot(i.x-x,i.z-zc)<(i.exit?1.4:0.9))) bad.push(z+' 站在按鈕／出口旁 '+x+','+zc);
        let p=null; try{ p=E.pathTo(zz.spawn.x,zz.spawn.z,0,x,zc,0); }catch(e){} if(!p||!p.length) bad.push(z+' 走不到 '+x+','+zc); }
      else for(const s of u.seats){ nSit++; if(!(zz.seats||[]).some(q=>Math.hypot(q.x-s.x,q.z-s.z)<0.12)) bad.push(z+' 座位不在區域的座位裡 '+s.x+','+s.z); } } }
  check('5 新加客人的 '+NEW_CUST.length+' 間：站的點站得住、走得到、前面 0.75 m 是家具或牆、離按鈕 0.9 m 以上；坐的是區域真正的座位',!bad.length&&nStand>=15&&nSit>=50,bad.slice(0,6).join('；')||('站 '+nStand+' 點、坐 '+nSit+' 張；'+NEW_CUST.join(' ')));
  let worst=9; for(const d of DAYS) for(const h of [10,14,19,23]){ const z=enter('tz_xile',d,h); const free=(z.seats||[]).filter(s=>!E.npcs.some(n=>n.seat===s)).length; worst=Math.min(worst,free); }
  check('5 洗樂洗衣坊三張「坐著等」的椅子：路人最多兩位，至少留一張給玩家',worst>=1,'最少空 '+worst+' 張'); }

// ---------- 6 吃飯時間遇得到同學 ----------
const TERM_DAYS=[]; for(let d=DK('2025-09-17');d<DK('2025-09-17')+126;d++) if(CALENDAR.termOf(d)&&CALENDAR.termOf(d).id==='Y1S1') TERM_DAYS.push(d);
const LANE=SHOPLIFE.laneShops().map(s=>'l118_'+s);
{ const G0=()=>Object.assign({},G,{flags:Object.assign({},G.flags),zone:'dorm'}); const per={}, laneDay={lunch:0,dinner:0}, okDay={lunch:0,dinner:0}; let nLane=0, nOther=0, over2=[], clash=[], wk=0, wkLane=0;
  for(const d of TERM_DAYS){ const g=G0(); g.day=d; g.weekday=CALENDAR.dateOf(d).wd%7; const ok=SHOPLIFE.dayOk(g,d), wd=!CALENDAR.weekend(d)&&!CALENDAR.holiday(d);
    for(const slot of ['lunch','dinner']){ const who=SHOPLIFE.who(Object.assign(g,{hour:slot==='lunch'?12.5:18.5}),slot); if(!ok&&who.length) clash.push('不該排的日子排了 '+CALENDAR.dateOf(d).key);
      if(ok&&wd){ okDay[slot]++; if(who.some(p=>LANE.includes(p.zone))) laneDay[slot]++; }
      const cnt={}; for(const p of who){ cnt[p.zone]=(cnt[p.zone]|0)+1; per[p.zone]=(per[p.zone]|0)+1; if(LANE.includes(p.zone)) nLane++; else nOther++;
        /* 排進去的那個時刻：STORY.schedEnt 回的就是這一筆，而且他原本的作息是空的或只是走走 */
        const c=CHARACTERS[p.id], gg=Object.assign({},g,{hour:(p.t0+p.t1)/2}), e=STORY.schedEnt(c,gg), b=SHOPLIFE.base(c,gg);
        if(!e||!e.shopMeal||e.zone!==p.zone) clash.push(p.id+' '+CALENDAR.dateOf(d).key+' 作息不是這一筆'); if(b&&!SHOPNPC.soft(c,b)) clash.push(p.id+' '+CALENDAR.dateOf(d).key+' 蓋掉原本的作息 '+(b.zone||b.away)); }
      for(const z in cnt) if(cnt[z]>SHOPLIFE.CFG.perShop) over2.push(z+' '+cnt[z]); } }
  const none=LANE.filter(z=>(per[z]|0)<5);
  check('6 118 巷九間餐廳一個學期每一間都排得到同學（各至少 5 人次）',LANE.length===9&&!none.length,none.length?'排不到：'+none.join(' '):LANE.map(z=>z.slice(5)+' '+per[z]).join('、'));
  check('6 118 巷比其他店多（使用者：118 巷就是要很容易遇到同學）',nLane>=nOther*2.5,'118 巷 '+nLane+' 人次、其他店 '+nOther+' 人次');
  check('6 平日午餐、晚餐：九成以上的日子 118 巷的店裡至少有一位同學',laneDay.lunch>=okDay.lunch*0.9&&laneDay.dinner>=okDay.dinner*0.9&&okDay.lunch>=40,'午餐 '+laneDay.lunch+'/'+okDay.lunch+' 天、晚餐 '+laneDay.dinner+'/'+okDay.dinner+' 天');
  const others=['tz_taimi','tz_yuehaochi','tz_keju'].filter(z=>Z3.ZONES[z]&&CROWD.SHOP_ZONES[z]);
  check('6 汀州路的新店（泰米村食、越好吃小館、客居雲南）也排得到同學',others.length===3&&others.every(z=>(per[z]|0)>=3),others.map(z=>z+' '+(per[z]|0)).join('、'));
  check('6 一間店一餐最多 '+SHOPLIFE.CFG.perShop+' 位；原本的作息優先（排進去的時刻他原本沒事）',!over2.length&&!clash.length,over2.concat(clash).slice(0,5).join('；'));
  /* 不排的日子 */
  const ex=TERM_DAYS.find(d=>CALENDAR.termOf(d).exam), g1=G0(); g1.day=ex; g1.weekday=CALENDAR.dateOf(ex).wd%7; g1.hour=12.5;
  const gE=G0(); gE.day=WED; gE.weekday=3; gE.hour=12.5; gE.stage='econ';
  let w1=null; for(let d=DK('2025-09-17')-21;d<DK('2025-09-17')+7&&w1==null;d++){ const T=CALENDAR.termOf(d); if(T&&T.id==='Y1S1'&&T.week===1) w1=d; } const gW=G0(); gW.day=w1; gW.weekday=CALENDAR.dateOf(w1).wd%7; gW.hour=12.5;
  check('6 考試週、經濟系那一年、大一上第 1 週：不排',ex!=null&&w1!=null&&!SHOPLIFE.who(g1,'lunch').length&&!SHOPLIFE.who(gE,'lunch').length&&!SHOPLIFE.who(gW,'lunch').length&&SHOPLIFE.people().every(id=>!SHOPLIFE.sched(CHARACTERS[id],g1)&&!SHOPLIFE.sched(CHARACTERS[id],gE)));
  /* 那一天跟玩家有約、阿哲約的午餐、當面約的午餐成行：不排 */
  { const d=TERM_DAYS.find(dd=>!CALENDAR.weekend(dd)&&SHOPLIFE.dayOk(G0(),dd)&&SHOPLIFE.who(Object.assign(G0(),{day:dd,weekday:CALENDAR.dateOf(dd).wd%7,hour:12.5}),'lunch').length>0);
    const g=G0(); g.day=d; g.weekday=CALENDAR.dateOf(d).wd%7; g.hour=12.5; const p=SHOPLIFE.who(g,'lunch')[0], c=CHARACTERS[p.id]; g.hour=(p.t0+p.t1)/2;
    const a0=!!SHOPLIFE.sched(c,g); const g2=Object.assign({},g,{invites:[{who:p.id,day:d,state:'accepted',place:'cafe',h:19}]}); const a1=!SHOPLIFE.sched(c,g2);
    const g3=Object.assign({},g,{flags:Object.assign({},g.flags,{L118_LUNCH:{day:d,shop:'korea',with:[p.id]}})}); const a2=!SHOPLIFE.sched(c,g3);
    const g4=Object.assign({},g,{l118:{inv:{done:d}}}); const a3=!SHOPLIFE.sched(c,g4);
    check('6 那一天跟玩家有約／阿哲約的午餐有他／當面約的 118 巷午餐成行：那一餐不排',a0&&a1&&a2&&a3,J([p.id,a0,a1,a2,a3])); }
  /* 同一天算兩次一樣、不動存檔 */
  { const g=G0(); g.day=WED; g.weekday=3; g.hour=12.5; const s0=J(g); const A=J(SHOPLIFE.who(g,'lunch')); SHOPLIFE._reset(); const B=J(SHOPLIFE.who(g,'lunch')); for(const id of SHOPLIFE.people()) SHOPLIFE.sched(CHARACTERS[id],g);
    check('6 同一天算兩次結果一樣（存讀檔、進出不會換人）；不寫任何存檔欄位',A===B&&J(g)===s0,A.slice(0,160)); }
  /* 熟客的時段照舊站在店門口（不被排到別間店）*/
  { const bad=[]; for(const d of TERM_DAYS.slice(14,49)){ const g=G0(); g.day=d; g.weekday=CALENDAR.dateOf(d).wd%7; g.hour=12.4; for(const r of L118.regularsAt(g)){ const c=CHARACTERS[r.id], e=c&&STORY.schedEnt(c,g); if(e&&e.shopMeal) bad.push(r.id+' '+CALENDAR.dateOf(d).key); } }
    check('6 118 巷熟客的時段（平日 12:10～13:00）：照舊站在他那間店門口，不排到別間',!bad.length,bad.slice(0,4).join('；')); }
  /* AA 寫好的列（新店面遇得到人 AA_705）優先：有沒有 SHOPLIFE，每一列成不成立都一樣（他們算「原本的作息」時看不到這裡加的那一筆）*/
  { let n=0, on=0; const diff=[]; const slots=SHOPLIFE.CFG.slots;
    for(const d of TERM_DAYS){ const wd=CALENDAR.dateOf(d).wd%7; for(const row of SHOP_NPC.rows){ if(!row.days||!row.days.includes(wd)||row.hearBy==='alison') continue; const g=G0(); g.day=d; g.weekday=wd; g.hour=Math.min(23.9,(row.from+Math.min(row.to,24))/2); g.flags.YT_MET_JOB=true;
        const a=SHOPNPC.on(g,row); SHOPLIFE.CFG.slots=[]; const b=SHOPNPC.on(g,row); SHOPLIFE.CFG.slots=slots; n++; if(a) on++; if(a!==b) diff.push(row.id+' '+CALENDAR.dateOf(d).key); } }
    const X=STORY.SCHED_X, mineLast=X[X.length-1]===SHOPLIFE.sched, wrapped=X.slice(0,-1).every(f=>typeof f._shopLifeWrap==='function'), len0=X.length; if(X.length>1&&!X.includes(X[0]._shopLifeWrap)) diff.push('includes 認不得包起來的函式'); const extra=()=>null; X.push(extra); const okPush=X[X.length-1]===SHOPLIFE.sched&&X.includes(extra)&&X.length===len0+1; X.splice(X.indexOf(extra),1);
    check('6 AA_705 的每一列（'+n+' 次、成立 '+on+' 次）有沒有 SHOPLIFE 結果都一樣；SHOPLIFE 永遠排在作息的最後一個',!diff.length&&on>20&&mineLast&&wrapped&&okPush,diff.slice(0,4).join('；')||J([mineLast,wrapped,okPush])); }
  /* 平均（給盤點表）*/
  console.log('INFO 6 一個學期（大一上，'+TERM_DAYS.length+' 天）：午餐、晚餐合計 '+(nLane+nOther)+' 人次的同學在店裡吃飯（118 巷 '+nLane+'、其他店 '+nOther+'）'); }

// ---------- 7 真的走進去看得到 ----------
{ const seen=[], bad=[]; let tries=0; const want=new Set(LANE.concat(['tz_taimi']));
  for(const d of TERM_DAYS.filter(d=>d>=DK('2025-09-29'))){ if(!want.size||tries>40) break;   /* 開學頭幾天是主線（9/17 起），從第三週開始看 */ const g=Object.assign({},G,{day:d,weekday:CALENDAR.dateOf(d).wd%7}); if(!SHOPLIFE.dayOk(g,d)) continue;
    for(const slot of ['lunch','dinner']){ for(const p of SHOPLIFE.who(Object.assign(g,{hour:slot==='lunch'?12.5:18.5}),slot)){ if(!want.has(p.zone)) continue; want.delete(p.zone); tries++;
        const h=+((p.t0+p.t1)/2).toFixed(3); G.flags.YT_MET_JOB=true; const z=enter(p.zone,d,h); const n=named().find(q=>q.charId===p.id);
        if(!n) bad.push(p.id+'@'+p.zone+' '+CALENDAR.dateOf(d).key+' '+h+' 不在店裡');
        else if(!n.seat||!(z.seats||[]).includes(n.seat)) bad.push(p.id+'@'+p.zone+' 沒有坐在店裡的座位');
        else seen.push(p.id.replace('classmate_','')+'@'+p.zone.replace('l118_','')+' '+CALENDAR.dateOf(d).key.slice(5)); } } }
  check('7 名單上的人，那個時間走進那間店＝他坐在店裡的座位上（118 巷九間＋泰米村食各驗一次）',!bad.length&&!want.size&&seen.length>=10,bad.join('；')||seen.join('、')); }

// ---------- 8 盤點表 ----------
{ let doc=''; try{ doc=fs.readFileSync(path.join(ROOT,'docs/handoff/SHOP_LIFE_AUDIT_1112.md'),'utf8'); }catch(e){}
  const miss=AUDITED.filter(z=>!new RegExp('\\|\\s*`'+z+'`\\s*\\|').test(doc));
  check('8 盤點表 docs/handoff/SHOP_LIFE_AUDIT_1112.md 盤點過的 '+AUDITED.length+' 間每一間都有一列',!!doc&&!miss.length,miss.join(' ')); }

console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
