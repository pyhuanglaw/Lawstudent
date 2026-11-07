/* 南洋戲院的店員與買票（SHOP-STAFF-1107 第 1 件；使用者 11-07 試玩「南洋戲院沒店員也無法買票」，存檔 day42 週二 22:21 在大廳）：
   不需要瀏覽器，在 Node 裡建出遊戲真正的區域 xs_nanyang（大廳）、xs_nanyang_hall（1 廳）、xinsheng（新生南路），用一個假的 GM：
   ① src/nanyang_sys3d.js 載得到（NYS）；index.html 接在 nanyang3d.js、story3d.js 後面、GAME.boot() 前面；大廳、新生南路的 build 包上了
   ② 店員：使用者那個時間（週二 22:21）進大廳＝櫃檯後面有一個店員（NY3.CLERK、clerk、frozen、第 0 層、不說話＝沒有 talk）；再 populate 一次不會變兩個
   ③ 店員：關門的時候（08:00）沒有；1 廳沒有；Alison 打工的那兩天（週五）店員站爆米花機旁邊（S.ALT），不和 Alison 的位子（NY3.CLERK）重疊、在櫃檯後面
   ④ 按鈕「買票」：大廳櫃檯前（配置 popcorn 那一點）、新生南路騎樓下的售票口（NY3.TICKET）各一顆；站得住的地方按得到；1 廳沒有
   ⑤ 買票：選單「買票　150 元」「不用了」；買了＝扣 150 元、G.flags.NY_TICKET＝那一天、兩顆按鈕都藏起來；隔天又出現
   ⑥ 「不用了」＝什麼都沒變；錢不夠＝那一項變灰、按了只出「錢不夠」、不扣錢、沒有票；關門（08:00）按售票口＝開放時間（PLACES.closedText）、不出選單
   ⑦ 買票不出任何台詞（GM.say 沒被叫到：稿裡沒有買票的字，這裡不自己寫）；其他按鈕照舊交給原本的 STORY.interact
   修改前（開發分支 70cd58a2d）：沒有 src/nanyang_sys3d.js＝大廳沒有店員、沒有「買票」（FAILED）。修改後 ALL PASS。
   用法：node tests/nanyang_staff_1107_unit.js */
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{});   // 正式模型在 node 裡載不到（fetch 相對網址）
{ const w0=console.warn; console.warn=(...a)=>{ if(/正式模型載入失敗/.test(String(a[0]))) return; w0(...a); }; }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
const J=JSON.stringify;
const base=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js',
  'src/data/calendar.js','src/data/places.js','src/data/xinsheng_layout.js','src/xinsheng3d.js','src/data/nanyang_layout.js','src/nanyang3d.js','src/data/shop_npc.js'];
/* 遊戲裡 story3d.js 比 nanyang_sys3d.js 先載：這裡用一個最小的 STORY（populate、interact、extraSpec）*/
let baseInteract=0, basePop=0;
global.STORY={TICKS:[],populate:(zoneId,GM)=>{ basePop++; return null; },interact:async()=>{ baseInteract++; return false; },extraSpec:i=>({id:'x'+i,bag:'backpack',i})};
global.CHAR={build:sp=>{ const o=new THREE.Group(); o.userData.spec=sp; return o; },SIT_TOP:0.47};
global.GAME={G:null};
for(const f of base){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
global.CHAR={build:sp=>{ const o=new THREE.Group(); o.userData.spec=sp; return o; },SIT_TOP:0.47};
const SYS='src/nanyang_sys3d.js', have=fs.existsSync(path.join(ROOT,SYS));
check('① src/nanyang_sys3d.js 在',have);
if(have){ let src=fs.readFileSync(path.join(ROOT,SYS),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:SYS}); }
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.nav) E.nav._cm=null;
  E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0,busy:false}; E.addNPC=n=>{ n.lv=n.lv|0; E.npcs.push(n); return n; }; return z; }
const sec=(n,f)=>{ try{ return f(); }catch(e){ check(n+' 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,2).join(' / ')); } };
const asec=async(n,f)=>{ try{ return await f(); }catch(e){ check(n+' 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,2).join(' / ')); } };
/* 假的 GM：選單照 picks 回答、記下 say／toast／choose */
const H={said:[],toasts:[],opts:[],picks:[]};
function mkGM(G){ const GM={G,E,enterN:1,
  say:async(who,t)=>{ H.said.push([who&&who.name||null,t]); },
  choose:async o=>{ H.opts.push(o.map(x=>({t:x.t,dim:!!x.dim}))); return H.picks.length?H.picks.shift():o.length-1; },
  toast:t=>{ H.toasts.push(t); }, money:d=>{ G.money+=d; if(d<0) H.toasts.push('💸 '+(-d)+' 元'); },
  sceneBegin(){}, sceneEnd(){}, autosave(){} }; GAME.G=G; return GM; }
const wd=d=>CALENDAR.dateOf(d).wd%7;
const findDay=(w,from)=>{ for(let d=from;d<from+14;d++) if(wd(d)===w) return d; return null; };
const DAY_TUE=42, DAY_FRI=findDay(5,DAY_TUE);   /* 使用者的存檔：day42 週二 22:21 */
const newG=(day,hour,zone,money)=>({day,hour,weekday:wd(day),zone,money:money==null?2000:money,flags:{},stage:'law'});
const clerks=()=>E.npcs.filter(n=>n&&n.nyClerk);
const lv0=()=>E.interactables.filter(q=>q&&q.nyTicket);
const visible=it=>!!it&&!it.hidden;

// ①
{ const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'), ix=f=>html.indexOf('<script src="'+f), boot=html.indexOf('GAME.boot()');
  check('① index.html：nanyang_sys3d.js 在 nanyang3d.js、story3d.js 後面、GAME.boot() 前面',ix(SYS)>0&&ix(SYS)>Math.max(ix('src/nanyang3d.js'),ix('src/story3d.js'))&&ix(SYS)<boot,J([ix('src/nanyang3d.js'),ix('src/story3d.js'),ix(SYS),boot]));
  check('① NYS 載得到；大廳（NY3.lobby）、新生南路的 build 包上了；STORY.populate、STORY.interact 包上了',typeof NYS!=='undefined'&&NY3.lobby._nysLobby===true&&!!Z3.ZONES.xinsheng._nysStreet&&STORY._nys===true); }
check('① 使用者的存檔那一天 day42 是週二、DAY_FRI 是週五',wd(DAY_TUE)===2&&DAY_FRI!=null&&wd(DAY_FRI)===5,J([wd(DAY_TUE),DAY_FRI]));

// ②③ 店員
sec('②',()=>{ loadZone('xs_nanyang'); const G=newG(DAY_TUE,22.35,'xs_nanyang'), GM=mkGM(G); STORY.populate('xs_nanyang',GM);
  const c=clerks(), C=NY3.CLERK, n=c[0];
  check('② 週二 22:21 進大廳：櫃檯後面有一個店員（NY3.CLERK）',c.length===1&&!!C&&!!n&&Math.hypot(n.obj.position.x-C.x,n.obj.position.z-C.z)<0.01&&Math.abs(n.obj.rotation.y-C.yaw)<1e-6,
    J(c.map(q=>[+q.obj.position.x.toFixed(2),+q.obj.position.z.toFixed(2)])));
  check('② 店員：clerk、frozen、isExtra、第 0 層、不說話（沒有 talk）、路人底模不背包',!!n&&n.clerk===true&&n.frozen===true&&n.isExtra===true&&(n.lv|0)===0&&!n.talk&&n.obj.userData.spec&&n.obj.userData.spec.bag===null);
  check('② 原本的 STORY.populate 照樣有叫到',basePop>=1);
  STORY.populate('xs_nanyang',GM); check('② 再 populate 一次：還是一個店員',clerks().length===1,String(clerks().length));
  /* 店員站在櫃檯後面：櫃檯的導航阻擋裡面（玩家走不到她的位置）、離櫃檯前客人站的地方（popcorn）1.4 m 以上 */
  const pop=NANYANG_LAYOUT.lobby.interact.find(q=>q.kind==='popcorn');
  check('② 店員在櫃檯後面：她站的地方玩家站不到（櫃檯的阻擋）、和櫃檯前（買票的地方）隔著櫃檯',!E.canStand(C.x,C.z,0.3,0)&&E.canStand(pop.x,pop.z,0.3,0)&&Math.hypot(pop.x-C.x,pop.z-C.z)>1.2); });
sec('③',()=>{
  loadZone('xs_nanyang'); STORY.populate('xs_nanyang',mkGM(newG(DAY_TUE,8,'xs_nanyang')));
  check('③ 關門的時候（08:00）：沒有店員',clerks().length===0,String(clerks().length));
  loadZone('xs_nanyang_hall'); STORY.populate('xs_nanyang_hall',mkGM(newG(DAY_TUE,20,'xs_nanyang_hall')));
  check('③ 1 廳：沒有店員',clerks().length===0);
  loadZone('xs_nanyang'); STORY.populate('xs_nanyang',mkGM(newG(DAY_FRI,19,'xs_nanyang'))); const c=clerks(), C=NY3.CLERK, n=c[0];
  const row=SHOP_NPC.rows.find(r=>r.zone==='xs_nanyang'&&r.hearBy==='alison');
  check('③ Alison 那一列：週五、週六、站 NY3.CLERK',!!row&&J(row.days)===J([5,6])&&Math.hypot(row.at[0]-C.x,row.at[1]-C.z)<0.01,J(row&&[row.days,row.at]));
  check('③ 週五 19:00（Alison 打工的那兩天）：店員站爆米花機旁邊（NYS.ALT），離 Alison 的位子 0.8 m 以上、也在櫃檯後面',c.length===1&&!!n&&Math.hypot(n.obj.position.x-NYS.ALT.x,n.obj.position.z-NYS.ALT.z)<0.01&&
    Math.hypot(n.obj.position.x-C.x,n.obj.position.z-C.z)>=0.8&&!E.canStand(NYS.ALT.x,NYS.ALT.z,0.3,0),J(n&&[n.obj.position.x,n.obj.position.z])); });

// ④ 按鈕
let lobbyBtn=null, streetBtn=null;
sec('④',()=>{ GAME.G=newG(DAY_TUE,22.35,'xs_nanyang');
  loadZone('xs_nanyang'); const b=lv0(), pop=NANYANG_LAYOUT.lobby.interact.find(q=>q.kind==='popcorn'); lobbyBtn=b[0];
  check('④ 大廳：一顆「買票」，在櫃檯前（配置 popcorn 那一點）',b.length===1&&lobbyBtn.label==='買票'&&lobbyBtn.nyTicket==='lobby'&&Math.hypot(lobbyBtn.x-pop.x,lobbyBtn.z-pop.z)<0.01,J(b.map(q=>[q.label,q.x,q.z])));
  { const st=E.canStand(lobbyBtn.x,lobbyBtn.z,0.32,0); E.player.obj.position.set(lobbyBtn.x,0,lobbyBtn.z); const it=E.nearestInteractable();
    check('④ 大廳：櫃檯前那一點站得住，站在那裡按鈕就是「買票」',st&&it===lobbyBtn,it&&it.label); }
  loadZone('xinsheng'); const s=lv0(), T=NY3.TICKET; streetBtn=s[0];
  check('④ 新生南路：一顆「買票」，在騎樓下的售票口（NY3.TICKET）',s.length===1&&streetBtn.label==='買票'&&streetBtn.nyTicket==='street'&&!!T&&Math.hypot(streetBtn.x-T.x,streetBtn.z-T.z)<0.01,J(s.map(q=>[q.label,q.x,q.z])));
  { E.player.obj.position.set(T.x,0,T.z); const it=E.nearestInteractable();
    check('④ 新生南路：售票口那一點站得住，站在那裡按鈕就是「買票」（不是戲院的店門）',E.canStand(T.x,T.z,0.32,0)&&it===streetBtn,it&&it.label); }
  { const door=E.interactables.find(q=>q.exit&&q.exit.to==='xs_nanyang'); check('④ 新生南路：戲院的店門照舊在',!!door); }
  loadZone('xs_nanyang_hall'); check('④ 1 廳：沒有「買票」',lv0().length===0); });

// ⑤⑥⑦ 買票
const press=async(GM,it)=>{ const r=await STORY.interact(it,GM); return r; };
(async()=>{
await asec('⑤',async()=>{ loadZone('xs_nanyang'); const G=newG(DAY_TUE,22.35,'xs_nanyang',500), GM=mkGM(G); const it=lv0()[0]; H.said=[]; H.toasts=[]; H.opts=[]; H.picks=[0];
  check('⑤ 買之前：按鈕看得到、沒有票',visible(it)&&!NYS.hasTicket(G));
  const r=await press(GM,it);
  check('⑤ 選單：「買票　150 元」「不用了」（錢夠＝沒變灰）',J(H.opts[0])===J([{t:'買票　150 元',dim:false},{t:'不用了',dim:false}]),J(H.opts[0]));
  check('⑤ 買了：扣 150 元、提示「💸 150 元」、G.flags.NY_TICKET＝今天',r===true&&G.money===350&&H.toasts.includes('💸 150 元')&&G.flags.NY_TICKET===DAY_TUE,J([G.money,H.toasts,G.flags.NY_TICKET]));
  check('⑤ 買了以後：大廳的「買票」藏起來',it.hidden===true);
  loadZone('xinsheng'); const s=lv0()[0]; check('⑤ 買了以後：新生南路售票口的「買票」也藏起來',!!s&&s.hidden===true);
  G.day=DAY_TUE+1; check('⑤ 隔天：又看得到（今天沒有票）',s.hidden===false&&!NYS.hasTicket(G));
  check('⑦ 買票沒有出任何台詞（GM.say 沒被叫到）',H.said.length===0,J(H.said)); });
await asec('⑥',async()=>{ loadZone('xs_nanyang');
  { const G=newG(DAY_TUE,22.35,'xs_nanyang',500), GM=mkGM(G), it=lv0()[0]; H.opts=[]; H.toasts=[]; H.picks=[1]; const g0=J(G); await press(GM,it);
    check('⑥ 「不用了」：錢、旗標都沒變、沒有提示',J(G)===g0&&H.toasts.length===0,J(H.toasts)); }
  { const G=newG(DAY_TUE,22.35,'xs_nanyang',100), GM=mkGM(G), it=lv0()[0]; H.opts=[]; H.toasts=[]; H.picks=[0]; await press(GM,it);
    check('⑥ 錢不夠（100 元）：「買票　150 元」變灰；按了只出「錢不夠」、不扣錢、沒有票',H.opts[0]&&H.opts[0][0].dim===true&&J(H.toasts)===J(['錢不夠'])&&G.money===100&&!NYS.hasTicket(G),J([H.opts[0],H.toasts,G.money])); }
  { loadZone('xinsheng'); const G=newG(DAY_TUE,8,'xinsheng',500), GM=mkGM(G), it=lv0()[0]; H.opts=[]; H.toasts=[]; await press(GM,it);
    check('⑥ 關門（08:00）按售票口：開放時間（PLACES.closedText）、不出選單、不扣錢',H.opts.length===0&&H.toasts.length===1&&H.toasts[0]===PLACES.closedText('xs_nanyang',8,DAY_TUE)&&G.money===500,J(H.toasts)); } });
await asec('⑦',async()=>{ loadZone('xs_nanyang'); const G=newG(DAY_TUE,22.35,'xs_nanyang'), GM=mkGM(G); const n0=baseInteract; const ex=E.interactables.find(q=>q.exit&&q.exit.to==='xinsheng');
  const r=await STORY.interact({label:'看海報',look:'x'},GM); check('⑦ 其他按鈕照舊交給原本的 STORY.interact',baseInteract===n0+1&&r===false&&!!ex); });
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();
