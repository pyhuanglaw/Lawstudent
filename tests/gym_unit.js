// 新體育館第一階段（LAWWW2-B 4d19c88d：gym_layout.js v2＋gym_interior.glb）接進遊戲——不需要瀏覽器。
// 檢查：校園體育館門口走得進來（DOORS.gym.enter）；出生點站得住、出口走得到、一進來不會先看到「離開」；大廳和球場之間只能從三個開口過（中間走閘門）；
//       看台、服務台、樓梯口擋住；座位、互動點（服務台、開館時間、樓梯口、體育課集合、公告欄、樓層指引）都走得到、按鈕真的出現；回校園的落點站得住。用法：node tests/gym_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/data/lawlib_layout.js','src/lawlib3d.js','src/data/socsci_layout.js','src/data/soclib_layout.js','src/soclib3d.js',
  'src/data/wz_park_layout.js','src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/classes3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|WC3|LB3|LL3|SL3|LINZE_LAYOUT|CLASSROOM_LAYOUT|WANCAI_LAYOUT|LIBRARY_LAYOUT|LAWLIB_LAYOUT|SOCLIB_LAYOUT|SOCSCI_LAYOUT|WZ_PARK_LAYOUT|CALENDAR|PLACES|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|COURSES|CLS|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch'));
for(const f of ['src/data/gym_layout.js','src/gym3d.js']) vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (GYM_LAYOUT|GY3)\s*=/mg,'global.$1='),{filename:f});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; if(E.fitSeatRadius) E.fitSeatRadius(); return z; }
check('1. 有 gym 區域；校園的體育館門口走得進來（DOORS.gym.enter＝gym）；manifest 有正式模型',!!Z3.ZONES.gym&&CLS.DOORS.gym.enter==='gym'&&!!ASSETS.manifest['bldg.gym_interior']&&fs.existsSync(path.join(ROOT,'assets/models/env/second_ai/gym_interior.glb')));
const z=loadZone('gym'), Ly=GYM_LAYOUT; const sp=[z.spawn.x,z.spawn.z]; const walk=(a,b)=>E.simWalk(a[0],a[1],b[0],b[1],{lv0:0,lv1:0,dt:0.1,speed:4.1});
const ex=E.interactables.find(i=>i.exit&&i.exit.to==='campus');
check('2. 出生點站得住；出口「離開體育館」走得到；一進來不在出口的範圍裡',E.canStand(sp[0],sp[1],0.32,0)&&!!ex&&Math.hypot(ex.x-sp[0],ex.z-sp[1])>ex.radius,ex&&JSON.stringify([ex.x,ex.z,ex.radius]));
check('3. 大廳和球場之間：牆走不過（x −15、−5、5、15）；三個開口站得住（x −10、10；中間閘門的通道 x −0.8、0.4）',![-15,-5,5,15].some(x=>E.canStand(x,11,0.1,0))&&[[-10,11],[10,11]].every(p=>E.canStand(p[0],p[1],0.32,0))&&[-0.8,0.4].every(x=>E.canStand(x,12.6,0.25,0)));
{ const a=walk(sp,[0,-4]), b=walk(sp,[-10,-12]), c=walk([0,-4],[-13.4,17.2]); check('3. 從大廳走得到球場中圈、西北的羽球場；從球場走回大廳的販賣機前面',a.ok&&b.ok&&c.ok,[a,b,c].map(r=>r.reason||'ok').join(',')); }
check('4. 看台、服務台、往 3F／B1 的樓梯口擋住；羽球網柱擋住、網子本身不擋（上課時同學會穿過場地）',!E.canStand(0,-17.6,0.1,0)&&!E.canStand(11,15.6,0.1,0)&&!E.canStand(-18,15.3,0.1,0)&&!E.canStand(18,15.1,0.1,0)&&!E.canStand(-3.1,-11.2,0.02,0)&&E.canStand(0,-11.2,0.32,0));
const shows=i=>{ const R=i.radius-0.05; for(let dx=-R;dx<=R+1e-9;dx+=0.2) for(let dz=-R;dz<=R+1e-9;dz+=0.2){ if(dx*dx+dz*dz>R*R) continue; const x=i.x+dx, zz=i.z+dz; if(!E.canStand(x,zz,0.32,0)) continue;
  let best=null, bd=1e9; for(const q of E.interactables){ const d=Math.hypot(q.x-x,q.z-zz); if(d<=q.radius&&d<bd){ bd=d; best=q; } } if(best===i&&walk(sp,[x,zz]).ok) return true; } return false; };
const want=['服務台','看開館時間','往 3F 的樓梯（今天不開放）','下樓到 B1（健身中心・游泳池）','體育課集合','看公告欄','看樓層指引','打羽球','販賣機','直飲台'];
const its=want.map(l=>E.interactables.find(i=>i.label===l)); const bad=want.filter((l,k)=>!its[k]||!shows(its[k]));
check('5. 互動點都有、走得到、按鈕真的出現（不被別的蓋過）：'+want.join('、'),!bad.length,bad.join('、'));
check('5. 看的互動點都有說明字（設施的說明，不是劇情）；打羽球、販賣機、直飲台是 AA_174 的選單；往 B1 的樓梯可以下樓（第三階段）',its.filter(i=>i&&i.look).length===5&&!!(its[3]&&its[3].exit&&its[3].exit.to==='gym_b1')&&['打羽球','販賣機','直飲台'].every(l=>E.interactables.some(i=>i.label===l&&i.gym&&i.onInteract)));
const seats=E.interactables.filter(i=>i.seat); const badS=seats.filter(i=>!shows(i)).map(i=>i.label+'('+i.x+','+i.z+')');
check('6. 座位 '+seats.length+' 個（大廳長椅、看台、場邊長椅）都走得到、按鈕出現；看台的位子坐在第一排木板上（z −16.37，從地面坐；QA-W1 座位檢查：原本在看台前面的空中、高 0.9 m）',seats.length===Ly.seats.length&&!badS.length&&seats.filter(i=>i.label==='坐在看台').every(i=>i.seat.y==null&&Math.abs(i.seat.z+16.37)<0.02),badS.join('、'));
{ const zc=loadZone('campus'); check('7. 回校園的落點 (74,58.0) 站得住、走得到體育館門口',E.canStand(74,58.0,0.32,0)&&E.simWalk(74,58.0,74,59.0,{lv0:0,lv1:0,dt:0.1,speed:4.1}).ok); }
// ---------- B1：大廳、健身中心、游泳池（第三階段）----------
{ const zb=loadZone('gym_b1'), B=GYM_LAYOUT.b1; const spb=[zb.spawn.x,zb.spawn.z]; const exb=E.interactables.find(i=>i.exit&&i.exit.to==='gym'); const fit=E.interactables.find(i=>i.label==='去健身房'), desk=E.interactables.find(i=>i.label==='服務櫃台');
  check('13. B1：出生點站得住；「上樓回大廳」一進來不在範圍裡；有「去健身房」「服務櫃台」',E.canStand(spb[0],spb[1],0.32,0)&&!!exb&&Math.hypot(exb.x-spb[0],exb.z-spb[1])>exb.radius&&!!fit&&!!desk);
  const shows=i=>{ const R=i.radius-0.05; for(let dx=-R;dx<=R+1e-9;dx+=0.15) for(let dz=-R;dz<=R+1e-9;dz+=0.15){ if(dx*dx+dz*dz>R*R) continue; const x=i.x+dx, zz=i.z+dz; if(!E.canStand(x,zz,0.32,0)) continue; let best=null, bd=1e9; for(const q of E.interactables){ const d=Math.hypot(q.x-x,q.z-zz); if(d<=q.radius&&d<bd){ bd=d; best=q; } } if(best===i&&(Math.hypot(x-spb[0],zz-spb[1])<0.05||walk(spb,[x,zz]).ok)) return true; } return false; };
  check('13. 「去健身房」「服務櫃台」「上樓回大廳」、池邊長椅都走得到、按鈕出現',shows(fit)&&shows(desk)&&shows(exb)&&E.interactables.filter(i=>i.seat).every(shows));
  check('14. 健身中心的玻璃牆只能從門（x 3.2～5.0）進去；游泳池只能從門（x −5～−3.2）進去；池子、器材、樓梯擋住',!E.canStand(0,3.0,0.1,0)&&E.canStand(4.1,3.0,0.3,0)&&walk(spb,[0,8]).ok&&!E.canStand(-8,-0.2,0.1,0)&&walk(spb,[-4.1,-2.0]).ok&&!E.canStand(0,-12,0.1,0)&&!E.canStand(1.2,12.4,0.1,0)&&!E.canStand(18,11,0.1,0));
  check('14. 平放的墊子不擋',E.canStand(-19.6,5.0,0.3,0)); }
// ---------- AA_174：一個人打羽球、販賣機、直飲台 ----------
(async()=>{ const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
  const mk=(d,h,o)=>Object.assign({day:dayOf(d),hour:h,weekday:CALENDAR.dateOf(dayOf(d)).wd%7,flags:{introDone:true,classDone:true,afternoonDone:true},daily:{},money:1000,courses:{}},o||{});
  const gm=(G,ans)=>{ const q=(ans||[]).slice(); const L={says:[],menus:[],toasts:[],adv:0,spent:0}; return {G,L,sceneBegin(){},sceneEnd(){},advance(h){ L.adv+=h; G.hour+=h; },toast(t){ L.toasts.push(t); },money(d){ G.money+=d; L.spent-=d; },say:async(w,t)=>{ L.says.push(t); },choose:async o=>{ L.menus.push(o.map(x=>x.t+(x.dim?'〔灰〕':''))); const a=q.shift(); return a==null?o.length-1:a; }}; };
  { const a=mk('2025-10-15',10), b=mk('2025-10-15',21.5), c=mk('2025-10-18',8.5), d=mk('2025-10-18',17.2); const ga=gm(a), gb=gm(b), gc=gm(c), gd=gm(d); await GY3.badminton(ga); await GY3.badminton(gb); await GY3.badminton(gc); await GY3.badminton(gd);
    check('8. 打羽球：平日 12:00 前「早上的場地是體育課在用」、21:00 後「場地要收了」；週末 09:00 前、17:00 後一樣；不扣時間、沒有選單',ga.L.says[0]==='早上的場地是體育課在用。中午以後再來。'&&gb.L.says[0]==='場地要收了。網子已經放下來一半。'&&gc.L.says[0]===ga.L.says[0]&&gd.L.says[0]===gb.L.says[0]&&[ga,gb,gc,gd].every(g=>g.L.adv===0&&!g.L.menus.length));
    const e=mk('2025-10-15',14,{flags:{GYM_SECONDHALL:true}}); const ge=gm(e); await GY3.badminton(ge); check('8. 第二會場打開的日子：「今天這裡有活動，不開放打球。」',ge.L.says[0]==='今天這裡有活動，不開放打球。'&&!ge.L.menus.length); }
  { const G=mk('2025-10-15',13); const g1=gm(G,[0]); await GY3.badminton(g1); const r=GY3.rec(G);
    check('9. 第一次併場：白板那句＋一句併場的旁白、60 分鐘、體能 +1',g1.L.menus[0][0].startsWith('去場邊等人併場')&&g1.L.says[0]==='場邊有一塊白板，你把名字寫在最下面，排在三個人後面。'&&GY3.JOIN.includes(g1.L.says[1])&&Math.abs(g1.L.adv-1)<1e-9&&r.fit===1&&r.wkN===1,JSON.stringify([g1.L.says,r]));
    G.hour=13; const g2=gm(G,[0]); await GY3.badminton(g2); G.hour=13; G.day+=1; const g3=gm(G,[0]); await GY3.badminton(g3);
    check('9. 第二次以後沒有白板那句；同一週三句不重複；每週第 3 次起不加體能（fit 停在 2）',!g2.L.says.some(t=>/白板/.test(t))&&new Set([g1.L.says[1],g2.L.says[0],g3.L.says[0]]).size===3&&r.fit===2&&r.wkN===2,JSON.stringify(r));
    G.day+=7; G.hour=13; const g4=gm(G,[0]); await GY3.badminton(g4); check('9. 下一週重新算：體能又 +1',r.fit===3&&r.wkN===1);
    G.hour=13; const fit0=r.fit; const g5=gm(G,[1]); await GY3.badminton(g5); check('9. 練發球：20 分鐘、不加體能、三句輪流之一',Math.abs(g5.L.adv-1/3)<1e-9&&r.fit===fit0&&GY3.SERVE.includes(g5.L.says[0]));
    r.fit=60; r.strongN=0; let strong=0; for(let k=0;k<3;k++){ G.hour=13; G.day+=1; const g=gm(G,[0]); await GY3.badminton(g); if(g.L.says.includes('以前追不到的球，你現在追得到了。')) strong++; } check('9. 體能到「結實」（50）以上：三次裡一次多「以前追不到的球……」',strong===1&&GY3.fitStage(60)==='結實'&&GY3.fitStage(10)==='普通'); }
  { const G=mk('2025-10-15',15); const g=gm(G,[0]); await GY3.vending(g); const G2=mk('2025-10-15',15); GY3.rec(G2).sportDay=G2.day; const g2=gm(G2,[0]); await GY3.vending(g2); const g3=gm(G2,[3]); await GY3.vending(g3);
    check('10. 販賣機：四樣（25／20／25／30）；運動飲料平常「你一口氣喝了半瓶。」、當天有運動「運動完的那一罐……」；罐裝咖啡 30',g.L.menus[0].slice(0,4).join('|')==='運動飲料　25 元|礦泉水　20 元|無糖綠茶　25 元|罐裝咖啡　30 元'&&g.L.spent===25&&g.L.says[0]==='你一口氣喝了半瓶。'&&g2.L.says[0]==='運動完的那一罐，總是喝得特別快。'&&g3.L.spent===30&&g3.L.says[0]==='下午還有課。你把拉環拉開。'); }
  { const G=mk('2025-10-15',15); const a=gm(G), b=gm(G); await GY3.fountain(a); await GY3.fountain(b); const G2=mk('2025-10-16',15); GY3.rec(G2).sportDay=G2.day; const c=gm(G2); await GY3.fountain(c);
    check('11. 直飲台：平常「你按下按鈕，彎腰喝了幾口。」、當天有運動「你喝了很久……」；一天第二次不說話；0 分鐘',a.L.says[0]==='你按下按鈕，彎腰喝了幾口。'&&!b.L.says.length&&c.L.says[0]==='你喝了很久。後面排隊的人在等你。'&&a.L.adv+c.L.adv===0); }
  { const G=mk('2025-10-15',13); delete G.daily; const g=gm(G,[1]); await GY3.badminton(g); check('12. 舊存檔沒有 G.daily.gym：預設 0，照常可以打',!!G.daily.gym&&(G.daily.gym.fit|0)===0); }
  /* ---------- 去健身房（AA_126 6-1、6-4；BB_124 7-3、7-4）---------- */
  { const W=d=>{ for(let k=0;k<7;k++){ const x=mk(d,10); x.day+=k; if(CALENDAR.dateOf(x.day).wd===3) return x.day; } };
    const G=mk('2025-10-15',10); const g=gm(G,[1]); await GY3.workout(g); const r=GY3.rec(G);
    check('15. 第一次去：櫃台辦會員證（BB_124 7-4 原文）、選月票扣 200、「用到這個月底喔」、提醒室內鞋、照樣進去；重訓 1 小時、體能 +2、普通的第一句',g.L.says[0]==='B1 的櫃台。阿姨推過來一張同意書。'&&g.L.says.includes('好，兩百。用到這個月底喔。')&&g.L.says.includes('毛巾要帶喔。還有——（看了一眼你的鞋）下次記得穿室內鞋喔。')&&g.L.spent===200&&Math.abs(g.L.adv-1)<1e-9&&r.fit===2&&r.card&&r.pass==='2025-10'&&g.L.says[g.L.says.length-1]===GY3.FIT_LINES['普通'][0],JSON.stringify(g.L.says.slice(-2)));
    G.hour=10; G.day+=1; const g2=gm(G); await GY3.workout(g2); check('15. 同一個月有月票：不扣錢、不問；三句輪流（換第二句）',g2.L.spent===0&&!g2.L.menus.length&&g2.L.says[0]===GY3.FIT_LINES['普通'][1]);
    G.hour=10; G.day+=1; const g3=gm(G); await GY3.workout(g3); G.hour=10; G.day+=1; const g4=gm(G); await GY3.workout(g4);
    check('15. 同一週第 4 次起不加體能（每週最多算 3 次）',r.fit===6&&r.fitN===3,JSON.stringify([r.fit,r.fitN]));
    const Gn=mk('2025-11-12',10); Gn.daily=G.daily; const g5=gm(Gn,[0]); await GY3.workout(g5); check('15. 下個月第一次去：「這個月要買月票嗎？」→ 選單次扣 50',g5.L.says[0]==='這個月要買月票嗎？'&&g5.L.spent===50&&r.single==='2025-11');
    Gn.hour=10; Gn.day+=1; const g6=gm(Gn); await GY3.workout(g6); check('15. 那個月選了單次：之後直接扣 50、不再問',g6.L.spent===50&&!g6.L.menus.length);
    const late=mk('2025-10-15',21.6); late.daily={gym:{card:1,pass:'2025-10'}}; const gl=gm(late); await GY3.workout(gl); const sun=mk('2025-10-19',17.6); sun.daily={gym:{card:1,pass:'2025-10'}}; const gs=gm(sun); await GY3.workout(gs);
    check('16. 平日 21:30、週日 17:30 以後：「健身房在清場了。明天吧。」不扣時間',gl.L.says[0]==='健身房在清場了。明天吧。'&&gs.L.says[0]==='健身房在清場了。明天吧。'&&gl.L.adv+gs.L.adv===0);
    const fm=mk('2025-10-27',10); fm.daily={gym:{card:1,pass:'2025-10'}}; const gf=gm(fm); await GY3.workout(gf); check('16. 每月第四個星期一（2025-10-27）：「今天第四個星期一，健身房休館。」',GY3.fourthMonday(fm)&&gf.L.says[0]==='今天第四個星期一，健身房休館。'&&gf.L.adv===0&&!GY3.fourthMonday(mk('2025-10-20',10)));
    const sp=mk('2025-10-15',10); sp.daily={gym:{card:1,pass:'2025-10',fit:60}}; const gsp=gm(sp); await GY3.workout(gsp); check('16. 體能 50 以上：結實的旁白',GY3.FIT_LINES['結實'].includes(gsp.L.says[0])); }
  // 17. 燈的光暈（LAWWW2-C 09324bda，清查 A1）：兩個 GLB 都有 GLOW_* 空節點（userData.glow），gym3d.js 接成一個網格（Z3.glowBatch＝溫州街那一套、離鏡頭 3 m 淡出）；B1 健身房的線型燈不放光暈
  { const glows=f=>{ const b=fs.readFileSync(path.join(ROOT,f)), n=b.readUInt32LE(12), j=JSON.parse(b.slice(20,20+n).toString('utf8')); return j.nodes.filter(x=>x.extras&&x.extras.glow).map(x=>x.name||''); };
    const g1=glows('assets/models/env/second_ai/gym_interior.glb'), g2=glows('assets/models/env/second_ai/gym_b1.glb'), src=fs.readFileSync(path.join(ROOT,'src/gym3d.js'),'utf8'), zs=fs.readFileSync(path.join(ROOT,'src/zones3d.js'),'utf8');
    check('17. 體育館光暈：1F '+g1.length+' 個、B1 '+g2.length+' 個 GLOW_ 節點；B1 沒有健身房的光暈；兩個 GLB 載入後都接 glowBatch（3 m 淡出）；Z3 匯出 glowBatch',g1.length>=40&&g2.length>=30&&!g2.some(n=>/fitness|gym_line|linear/i.test(n))&&/glowBatch\(E,z,g0,root,'gym_glows'\)/.test(src)&&/glowBatch\(E,z,g0,root,'gym_b1_glows'\)/.test(src)&&/Z3\.glowBatch\(E,g0,root,gl,name,3\.0\)/.test(src)&&/glowBatch:wzGlowBatch/.test(zs)&&/uNearFade/.test(zs),JSON.stringify([g1.length,g2.length])); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });
