/* 大口漢堡的按鈕與台詞（src/dakou_sys3d.js 包住 DK3.zone.build；AA_697 企劃線 54bf612c3、AA_621 企劃線 52e3d83a8，XS-SHOPS-REST-1105）：不需要瀏覽器，在 Node 裡建出遊戲真正的區域 xs_dakou，
   用一個假的 GM 按每一顆按鈕：
   ① src/dakou_sys3d.js 載得到（DKS）、DK3.zone.build 已經包上；index.html 接在 dakou3d.js、story3d.js、eat3d.js 後面、GAME.boot() 前面；白名單 AA_697@54bf612c3、AA_621@52e3d83a8 approved
   ② 按鈕：一樓 點餐、自助點餐、取餐、回收餐盤（第 0 層）；二樓 插座（手機、筆電充電）、看書架（第 1 層）；位置、名字照配置；樓梯、店員、study 不另外放；79 個座位、出口照舊；再進一次不重複
   ③ 點餐（櫃檯）：店員一句 → 菜單 → 旁白 → 店員一句；自助點餐：旁白 → 同一份菜單 → 旁白；扣錢、時間 +9 分鐘、EAT 登記吃過的（店名 新生南路・大口漢堡）——沒按取餐也算吃到
   ④ 取餐：這一趟點過＝有點那一句（取了就清掉，再按＝沒點那一句）；沒點、下一趟＝沒點那一句；錢不夠＝不扣錢、不登記、不算點過；「不用了」＝什麼都沒變
   ⑤ 菜單：七樣（價錢照 AA_621）；05:00～10:30 多一項豬肉滿福堡 59（04:59、10:30 沒有）
   ⑥ 回收餐盤、插座、看書架：那一句旁白，G 一點都沒變（時間、錢、數值、旗標）
   ⑦ 坐下讀書（AA_621 第 2 節）：讀完四句輪流；跨過 05:00＝天亮那一句；考試週 22:00 以後第一次走上二樓＝兩句（只一次）；平常 00:00～05:00 一個人走上二樓＝深夜那一句；別的區域不出
   ⑧ 程式裡每一句都在 AA_697／AA_621 原稿裡一字不差（git show；沒有企劃線就略過）
   修改前（開發分支 f112c8a77）：沒有 src/dakou_sys3d.js＝載入就停（FAILED 1）。修改後 ALL PASS。
   用法：node tests/dakou_act_unit.js */
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{});   // 正式模型在 node 裡載不到（fetch 相對網址）
{ const w0=console.warn; console.warn=(...a)=>{ if(/正式模型載入失敗/.test(String(a[0]))) return; w0(...a); }; }   // 那一行的警告不印（和測試無關）
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
const J=JSON.stringify;
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js',
  'src/data/calendar.js','src/data/places.js','src/data/xinsheng_layout.js','src/xinsheng3d.js','src/data/dakou_layout.js','src/dakou3d.js','src/eat3d.js','src/dakou_sys3d.js'];
const miss=files.filter(f=>!fs.existsSync(path.join(ROOT,f)));
if(miss.length){ check('① 檔案都在',false,miss.join('、')); console.log('FAILED '+fails); process.exit(1); }
/* 遊戲裡 story3d.js 比 dakou_sys3d.js 先載：這裡用一個最小的 STORY（interact、TICKS、onStudy、studyNarr）*/
let baseCalls=0; global.STORY={interact:async()=>{ baseCalls++; return false; },TICKS:[],onStudy:null,studyNarr:null};
global.GAME={G:null};
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
const L=DAKOU_LAYOUT.shop, E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null;
  E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
const sec=(n,f)=>{ try{ return f(); }catch(e){ check(n+' 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,2).join(' / ')); } };
const asec=async(n,f)=>{ try{ return await f(); }catch(e){ check(n+' 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,2).join(' / ')); } };

/* AA_697／AA_621 的句子（一字照抄）*/
const T={ask:'您好，內用還是外帶？',done:'（店員把號碼單遞給你。）',call:'好了會叫號。',kiosk:'（螢幕上的漢堡一張比一張大。你按了兩次「返回」，才找到飲料在哪裡。）',kioskDone:'（機器吐出一張號碼單。）',
  pick:'（櫃檯叫了你的號碼。托盤上的薯條還在冒煙。）',pickNone:'（取餐區的螢幕上，號碼一個一個往下跳。）',tray:'（你把紙杯和包裝紙丟進回收台，托盤疊到最上面。）',
  outlet:'（你把手機插上。旁邊那個人的筆電也插在同一排，螢幕上是一份還沒寫完的報告。）',books:'（書架上是幾本舊雜誌和一套沒排齊的漫畫。第三集不見了。）'};
const T621={first:['（二樓。每一桌都有人，桌上是課本、筆電、喝到一半的可樂。沒有人在講話，只有冰塊的聲音。）','（有一個人趴在桌上睡著了，手上還拿著螢光筆。）'],
  narr:['（你點了一杯熱咖啡。四點的時候它已經冷了。）','（對面那桌的人整理好東西走了。下一個人五分鐘後就坐下來。）','（窗外新生南路的車越來越少。只剩公車和計程車。）','（天亮的時候，一樓開始賣早餐。煎蛋的味道飄上來。）'],
  dawn:'（樓下換了早餐的菜單。有人買了滿福堡，邊走邊吃去考試。）',alone:'（二樓只有你和一個在打電腦的人。店員在拖地。）'};
const MENU=[['雙層牛肉堡套餐',159],['勁辣雞腿堡套餐',149],['雞塊 6 塊',69],['薯條（大）',59],['可樂',35],['熱咖啡',45],['蘋果派',35]], BF=['豬肉滿福堡',59];

// ①
{ const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'), ix=f=>html.indexOf('<script src="'+f), boot=html.indexOf('GAME.boot()');
  const AL=JSON.parse(fs.readFileSync(path.join(ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files, a697=AL.find(f=>/AA_697_/.test(f.path)), a621=AL.find(f=>/AA_621_/.test(f.path)&&f.sha==='52e3d83a8');
  check('① DKS 載得到、DK3.zone.build 已經包上（Z3.ZONES.xs_dakou 就是 DK3.zone）',typeof DKS!=='undefined'&&DK3.zone._dks===true&&Z3.ZONES.xs_dakou===DK3.zone);
  check('① index.html：dakou_sys3d.js 在 dakou3d.js、story3d.js、eat3d.js 後面、GAME.boot() 前面',ix('src/dakou3d.js')>0&&ix('src/dakou_sys3d.js')>Math.max(ix('src/dakou3d.js'),ix('src/story3d.js'),ix('src/eat3d.js'))&&ix('src/dakou_sys3d.js')<boot);
  check('① 白名單：AA_697@54bf612c3、AA_621@52e3d83a8 approved（kind text）',!!a697&&a697.sha==='54bf612c3'&&a697.status==='approved'&&a697.kind==='text'&&!!a621&&a621.status==='approved',J([a697&&a697.sha,a621&&a621.sha]));
  check('① STORY.TICKS 有 DKS.tick；STORY.studyNarr、onStudy 包上了',STORY.TICKS.includes(DKS.tick)&&typeof STORY.studyNarr==='function'&&typeof STORY.onStudy==='function'); }

const BTN=()=>E.interactables.filter(q=>q.dakou);
const WANT=[['order',0,'點餐'],['kiosk',0,'自助點餐'],['pickup',0,'取餐'],['tray',0,'回收餐盤'],['outlet',1,'插座（手機、筆電充電）'],['books',1,'看書架']];
const byKind=k=>E.interactables.find(q=>q.dakou===k);
let z=null;
// ②
sec('②',()=>{ z=loadZone('xs_dakou'); const b=BTN(), seats=E.interactables.filter(q=>q.seat), ex=E.interactables.filter(q=>q.exit);
  const lay=k=>{ for(const [lv,f] of [[0,L.floor1],[1,L.floor2]]){ const q=f.interact.find(o=>o.kind===k); if(q) return [lv,q]; } return null; };
  const got=b.map(q=>[q.dakou,q.lv,q.label]);
  check('② 六顆按鈕：一樓點餐、自助點餐、取餐、回收餐盤；二樓插座、看書架（名字、樓層照配置）',J(got)===J(WANT),J(got));
  check('② 位置照配置的 interact',b.every(q=>{ const r=lay(q.dakou); return r&&r[0]===q.lv&&r[1].x===q.x&&r[1].z===q.z&&r[1].label===q.label; }));
  check('② 樓梯、店員、study（長桌中間）不另外放按鈕；新按鈕不帶 seat／exit',!b.some(q=>/^stairs_|clerk|study/.test(q.dakou))&&b.every(q=>!q.seat&&!q.exit));
  const st=seats.filter(q=>q.lv===1);
  check('② 79 個座位照舊（二樓 62 個都是「坐下讀書」、it.study）、出口「離開大口漢堡」',seats.length===79&&st.length===62&&st.every(q=>q.study&&/^坐下讀書/.test(q.label))&&ex.length===1&&ex[0].label==='離開大口漢堡'&&E.interactables.length===79+1+6,String(E.interactables.length));
  loadZone('xs_dakou'); const n2=BTN().length; loadZone('xinsheng'); const n3=BTN().length;
  check('② 再進一次店：按鈕還是 6 個（不重複加）；新生南路沒有這些按鈕',n2===6&&n3===0,J([n2,n3])); });

// 假的 GM
let ENTER=1;
const examDay=(()=>{ for(let d=0;d<800;d++){ const t=CALENDAR.termOf(d); if(t&&t.exam==='final') return d; } return null; })();
const normDay=(()=>{ for(let d=0;d<800;d++){ const t=CALENDAR.termOf(d); if(t&&!t.exam&&t.week===3) return d; } return null; })();
function mkGM(hour,day,o){ o=o||{}; const G={hour,day:day==null?normDay:day,zone:o.zone||'xs_dakou',stats:{study:5,charm:3},legal:{k:{a:1}},notes:[],flags:{x:1},money:o.money==null?500:o.money,rel:{an:2},invites:o.invites||[]}; GAME.G=G;
  const log={said:[],adv:[],scene:0,choose:[],toast:[]}; const pick=o.pick==null?0:o.pick;
  const GM={G,E,enterN:o.enterN==null?ENTER:o.enterN,
    say:async(sp,t)=>{ log.said.push([sp&&sp.name||null,t]); }, sceneBegin(){ log.scene++; }, sceneEnd(){ log.scene--; },
    choose:async opts=>{ log.choose.push(opts.map(x=>x.t)); return typeof pick==='function'?pick(opts):pick; },
    money(d){ G.money+=d; }, advance(h){ log.adv.push(h); G.hour+=h; }, autosave(){}, toast(t){ log.toast.push(t); } };
  return {G,GM,log}; }
const press=async(k,m)=>STORY.interact(byKind(k),m.GM);

(async()=>{
await asec('③',async()=>{ z=loadZone('xs_dakou'); ENTER++;
  const m=mkGM(14,null); const r=await press('order',m), ate=(m.G.eat&&m.G.eat.ate)||[];
  check('③ 點餐（櫃檯）：店員「您好，內用還是外帶？」→ 菜單 → （店員把號碼單遞給你。）→ 店員「好了會叫號。」',r===true&&J(m.log.said)===J([['店員',T.ask],[null,T.done],['店員',T.call]])&&m.log.choose.length===1&&m.log.scene===0,J(m.log.said));
  check('③ 扣 159、時間 +9 分鐘、EAT：吃過的「新生南路・大口漢堡　雙層牛肉堡套餐」、次數 1（沒按取餐也算）',m.G.money===341&&J(m.log.adv)===J([0.15])&&ate.length===1&&ate[0].shop==='新生南路・大口漢堡'&&ate[0].item==='雙層牛肉堡套餐'&&m.G.eat.n['大口漢堡']===1&&EAT.shopOf('大口漢堡')==='新生南路・大口漢堡',J([m.G.money,ate]));
  ENTER++; const k=mkGM(14,null,{pick:4}); await press('kiosk',k);
  check('③ 自助點餐：（螢幕上的漢堡…）→ 同一份菜單 → （機器吐出一張號碼單。）；店員不說話',J(k.log.said)===J([[null,T.kiosk],[null,T.kioskDone]])&&J(k.log.choose[0])===J(m.log.choose[0])&&k.G.money===465&&k.G.eat.ate[0].item==='可樂',J(k.log.said)); });

await asec('④',async()=>{ z=loadZone('xs_dakou'); ENTER++;
  const a=mkGM(14,null); await press('pickup',a);
  check('④ 沒點就按取餐：（取餐區的螢幕上，號碼一個一個往下跳。）',J(a.log.said)===J([[null,T.pickNone]]));
  const b=mkGM(14,null); await press('order',b); const c=mkGM(14,null); await press('pickup',c); const d=mkGM(14,null); await press('pickup',d);
  check('④ 點了再取餐：（櫃檯叫了你的號碼。托盤上的薯條還在冒煙。）；取完再按＝沒點那一句',J(c.log.said)===J([[null,T.pick]])&&J(d.log.said)===J([[null,T.pickNone]]),J([c.log.said,d.log.said]));
  const e=mkGM(14,null); await press('kiosk',e); ENTER++; const f=mkGM(14,null); await press('pickup',f);
  check('④ 點了沒取、出去再進來（下一趟）＝沒點那一句',J(f.log.said)===J([[null,T.pickNone]]));
  ENTER++; const g=mkGM(14,null,{money:100}); await press('order',g); const g2=mkGM(14,null); await press('pickup',g2);
  check('④ 錢不夠（100 元點 159）：不扣錢、不登記、不過時間、「錢不夠」；取餐＝沒點',g.G.money===100&&!(g.G.eat&&g.G.eat.ate&&g.G.eat.ate.length)&&!g.log.adv.length&&J(g.log.toast)===J(['錢不夠'])&&J(g.log.said)===J([['店員',T.ask]])&&g2.log.said[0][1]===T.pickNone,J(g.log));
  ENTER++; const h=mkGM(14,null,{pick:o=>o.length-1}); await press('order',h); const h2=mkGM(14,null); await press('pickup',h2);
  check('④ 選「不用了」：什麼都沒變、取餐＝沒點',h.G.money===500&&!h.log.adv.length&&h.log.choose[0][h.log.choose[0].length-1]==='不用了'&&!(h.G.eat&&h.G.eat.ate&&h.G.eat.ate.length)&&h2.log.said[0][1]===T.pickNone); });

await asec('⑤',async()=>{ z=loadZone('xs_dakou'); const opts=async h=>{ ENTER++; const m=mkGM(h,null,{pick:o=>o.length-1}); await press('order',m); return m.log.choose[0]; };
  const fmt=M=>M.map(x=>x[0]+'　'+x[1]+' 元').concat(['不用了']);
  const o12=await opts(12), o5=await opts(5), o10=await opts(10.25), o459=await opts(4+59/60), o1030=await opts(10.5), o29=await opts(29.5);
  check('⑤ 12:00：七樣（價錢照 AA_621）＋不用了',J(o12)===J(fmt(MENU)),J(o12));
  check('⑤ 05:00、10:15、隔天清晨 05:30（G.hour 29.5）多一項豬肉滿福堡 59',J(o5)===J(fmt(MENU.concat([BF])))&&J(o10)===J(o5)&&J(o29)===J(o5),J(o5));
  check('⑤ 04:59、10:30 沒有早餐',J(o459)===J(o12)&&J(o1030)===J(o12));
  ENTER++; const m=mkGM(6,null,{pick:7}); await press('order',m);
  check('⑤ 早上點滿福堡：扣 59、吃過的記「豬肉滿福堡」',m.G.money===441&&m.G.eat.ate[0].item==='豬肉滿福堡'); });

await asec('⑥',async()=>{ z=loadZone('xs_dakou'); ENTER++; const bad=[];
  for(const [k,t] of [['tray',T.tray],['outlet',T.outlet],['books',T.books]]){ const m=mkGM(14,null), before=J(m.G), b0=baseCalls, r=await press(k,m);
    if(!(r===true&&J(m.log.said)===J([[null,t]])&&J(m.G)===before&&!m.log.adv.length&&!m.log.choose.length&&m.log.scene===0&&baseCalls===b0)) bad.push(k+' '+J(m.log)); }
  check('⑥ 回收餐盤、插座、看書架：說那一句旁白；G 完全沒變（時間、錢、數值、旗標）',!bad.length,bad.join('｜'));
  const m=mkGM(14,null), b0=baseCalls; await STORY.interact({label:'別的',x:0,z:0},m.GM); check('⑥ 別的按鈕照舊交給原本的 STORY.interact',baseCalls===b0+1); });

await asec('⑦',async()=>{ z=loadZone('xs_dakou');
  const study=(G,GM,hrs)=>{ G.hour+=hrs; STORY.onStudy(GM,hrs); return STORY.studyNarr(GM); };
  const m=mkGM(14,null), got=[]; for(let i=0;i<5;i++) got.push(study(m.G,m.GM,1));
  check('⑦ 二樓讀完：四句輪流（第五次回到第一句）',J(got)===J(T621.narr.concat([T621.narr[0]])),J(got));
  const d=mkGM(3,null); const dn=study(d.G,d.GM,3); const d2=mkGM(25,null); const dn2=study(d2.G,d2.GM,2);
  const n=mkGM(5,null); const nn=study(n.G,n.GM,2);
  check('⑦ 03:00 讀到 06:00、隔天 01:00（G.hour 25）讀到 03:00＝前者天亮那一句、後者四句輪流；05:00 開始讀不算跨過',dn===T621.dawn&&T621.narr.includes(dn2)&&T621.narr.includes(nn),J([dn,dn2,nn]));
  const o=mkGM(14,null,{zone:'cafe'}); check('⑦ 別的區域讀完：不出大口漢堡的句子',study(o.G,o.GM,1)==null);
  const up=(P,lv,y)=>{ E.player.lv=lv; E.player.obj.position.set(P[0],y,P[1]); };
  const runTick=async GM=>{ const r=DKS.tick(GM); await new Promise(res=>setTimeout(res,10)); return r; };
  ENTER++; const e=mkGM(23,examDay); up([0,0],0,0); const t0=await runTick(e.GM); up([5.25,-2.3],1,3.6); const t1=await runTick(e.GM); const t2=await runTick(e.GM);
  check('⑦ 考試週 23:00：一樓不出；走上二樓＝兩句（第一次進去）；同一趟不再出',examDay!=null&&t0===false&&t1===true&&t2===false&&J(e.log.said)===J(T621.first.map(t=>[null,t]))&&e.G.flags.DAKOU_EXAM_FIRST===examDay,J(e.log.said));
  ENTER++; const e2=mkGM(23,examDay); e2.G.flags.DAKOU_EXAM_FIRST=examDay; await runTick(e2.GM);
  ENTER++; const e3=mkGM(15,examDay); await runTick(e3.GM);
  check('⑦ 考試週：已經第一次過＝不再出；15:00＝不出',!e2.log.said.length&&!e3.log.said.length);
  ENTER++; const a=mkGM(26,null); await runTick(a.GM); ENTER++; const a2=mkGM(23,null); await runTick(a2.GM);
  ENTER++; const a3=mkGM(2,null,{invites:[{place:'dakou',zone:'xs_dakou',day:normDay,state:'going',who:'zhe'}]}); await runTick(a3.GM);
  check('⑦ 平常 02:00 一個人走上二樓＝深夜那一句；23:00、有約的＝不出',J(a.log.said)===J([[null,T621.alone]])&&!a2.log.said.length&&!a3.log.said.length,J([a.log.said,a2.log.said,a3.log.said]));
  up([0,0],0,0); });

sec('⑧',()=>{ const gs=(sha,f)=>{ try{ return cp.execSync('git show '+sha+':"docs/story_planning/'+f+'"',{cwd:ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']}); }catch(e){ return null; } };
  const md697=gs('54bf612c3','AA_697_大口漢堡互動點的字.md'), md621=gs('52e3d83a8','AA_621_大口漢堡_24小時速食.md');
  if(md697==null||md621==null){ console.log('略過 ⑧：這個 clone 沒有企劃線的 54bf612c3／52e3d83a8（git fetch origin claude/magical-albattani-bk7b4n）'); return; }
  const S=DKS.L, p697=[S.counterAsk,S.counterDone,S.counterCall,S.kiosk,S.kioskDone,S.pickup,S.pickupNone,S.tray,S.outlet,S.books], p621=S.examFirst.concat(S.narr,[S.dawn,S.lateAlone]);
  const m1=p697.filter(t=>!md697.includes(t)), m2=p621.filter(t=>!md621.includes(t));
  check('⑧ 一樓、二樓的 10 句都在 AA_697 原稿裡一字不差（和這個測試寫的一樣）',!m1.length&&J(p697)===J([T.ask,T.done,T.call,T.kiosk,T.kioskDone,T.pick,T.pickNone,T.tray,T.outlet,T.books]),m1.join('｜'));
  check('⑧ 讀書、第一次進去、天亮、深夜的 8 句都在 AA_621 原稿裡一字不差',!m2.length&&J(p621)===J(T621.first.concat(T621.narr,[T621.dawn,T621.alone])),m2.join('｜'));
  const mm=S.menu.concat([S.breakfast]).filter(([n,p])=>!(md621.includes(n+' '+p)||md621.includes(n+p)));
  check('⑧ 菜單八樣的名字、價錢照 AA_621 第 1 節；早餐時段 05:00～10:30',!mm.length&&md621.includes('早餐（05:00～10:30）豬肉滿福堡 59')&&J(S.BF)===J([5,10.5])&&J(S.menu)===J(MENU),J(mm));
  const bl=L.floor1.interact.concat(L.floor2.interact).filter(q=>DKS.KINDS[q.kind]).map(q=>q.label).filter(t=>!md697.includes(t.replace(/（.*）$/,'')));
  check('⑧ 按鈕名字（配置的 label）都是 AA_697 表上的按鈕',!bl.length,bl.join('、')); });

console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();
