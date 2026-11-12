// 約念書走到桌子坐下（INV-SIT-TOGETHER-1104，USER_WANTS X207；台詞 AA_649，企劃線 37daf8027）——不需要瀏覽器（D131）。
// 使用者 2026-11-04 01:3x：「如果你們真的約一起念書的話，不可以一直走到圖書館門口然後約會就結束了，至少要走到桌子旁邊一起坐下來。」
// 起因：src/invites3d.js 的 S.startTogether 用 S.pairSeats 只在抵達的那一區找相鄰空位；總圖 arrive 一進大廳就開演（一樓門口演完）。
// 檢查（BB 的驗收 ①～⑦）：
//   1. 總圖的座位（照 src/library3d.js、src/library_hall_v2.js、src/zones3d.js 產生座位的同一套算法）：帶路找到的是二樓（lv 1）長桌相鄰的兩個位子、離入口 ≥3 m
//   2. 一起走到總圖：門口先演開場、她說「（小聲）二樓靠窗那排比較安靜。」、自己走去坐下（她先坐）；還沒開演、不算沒赴約
//   3. 玩家離她很遠：不開演；走到她旁邊（同一層 2 m 內）＝開演：開演那一刻兩個人都坐著、同一張桌子；坐下旁白＋她第一次的那一句、中途一則、收書、起身走到入口、道別（她第一次的那一句）
//   4. 第二次約：用一般句（AA_649 第 2 節）；閉館前：收書是閉館廣播
//   5. 走到了才發現位子被坐走：換下一組
//   6. 二樓整層坐滿：她走上二樓、你走近＝「（二樓的長桌都坐滿了。）」「（小聲）去三樓好了。」→ 一起走到三樓閱覽區（library）→ 那裡照樣帶路、坐下、開演
//   7. 途中存檔讀檔：iv.lead 存在約定上；讀回來她生在你旁邊（作息 follow），接著帶路走到座位
//   8. 不跟上：走出總圖＝作罷（不扣分、不算沒赴約）
//   9. 見面演完她解凍、起身（第 2 項）；開演途中出錯：兩個人站起來、她解凍、段落收回開始前（第 4 項）；剛演完、帶路中不自己打開手機（第 3 項）；提早到的提示（第 6 項）
//  10. 其他約會兩個人一起坐下：開場句（AA_649 第 4 節，Café＝咖啡）
//  11. 台詞逐字對照企劃線 37daf8027 的 AA_649；（小聲）寫在引號裡的不再加一次（libquiet3d.js needsPrefix）
// 修改前：2、3、5、6、7、8、9（解凍、出錯收乾淨、手機）、10、11（小聲重複）FAIL。用法：node tests/inv_sit_together_unit.js
const H=require('./pg_harness.js');
const {check,GM,E}=H;
CLS.afterSlot=async()=>false;   /* 這支測約念書本身的時間（stay 1.5 小時…）；見面用完時段跳到下一個時段（ACTION-BUDGET-1107）另外在 tests/action_budget_1107_unit.js 測 */
const fs=require('fs'), path=require('path'), vm=require('vm');
vm.runInThisContext(fs.readFileSync(path.join(H.ROOT,'src/libquiet3d.js'),'utf8').replace(/^const LIBQ\s*=/m,'globalThis.LIBQ='),{filename:'src/libquiet3d.js'});
vm.runInThisContext(fs.readFileSync(path.join(H.ROOT,'src/data/library_layout.js'),'utf8').replace(/^const (LIBRARY_\w+)\s*=/mg,'globalThis.$1='),{filename:'src/data/library_layout.js'});
const W=ms=>new Promise(r=>setTimeout(r,ms));
const LS=INVITE_DATA.libStudy||{lead:['?'],full:['?'],seated:'?',mid:[['?']],close:['?'],pack:['?'],sit:['?'],bye:['?'],first:{heroine_05:{},heroine_03:{}}};   /* 修改前沒有：讓測試跑完、逐項 FAIL */
for(const k of ['sitRule','leadSeats','seatObj','phoneBack']) if(typeof INV[k]!=='function') INV[k]=()=>null;
if(!INVITE_DATA.seatOpen) INVITE_DATA.seatOpen={meal:[],coffee:[['?']],movie:[],movieEnd:[],bookstore:[]};
/* ---- 總圖大廳的座位：照 library3d.js buildFurniture（studyTable，二樓）＋library_hall_v2.js furniture2（groupTable、pcDesk，一樓）產生座位的算法 ---- */
function hallSeats(){ const L=LIBRARY_LAYOUT, out=[];
  for(const f of L.furniture){ const lv=f.lv|0;
    if(f.type==='studyTable'){ const n=f.seats||4; for(let i=0;i<n;i++){ const sx=f.x-f.w/2+f.w*(i+0.5)/n; for(const s of [-1,1]) out.push({x:sx,z:f.z+s*0.8,yaw:s>0?Math.PI:0,lv:1}); } }
    else if(f.type==='groupTable'&&L.version===2){ for(const s of [-1,1]) for(const dx of [-f.w/4,f.w/4]) out.push({x:f.x+dx,z:f.z+s*(f.d/2+0.42),yaw:s>0?Math.PI:0,lv}); }
    else if(f.type==='pcDesk'&&L.version===2){ for(let i=0;i<(f.seats||4);i++) out.push({x:f.x-f.w/2+(i+0.5)*f.w/(f.seats||4),z:f.z+f.d/2+0.42,yaw:Math.PI,lv}); } }
  return out; }
/* 3F 閱覽區（zones3d.js 的 library：三排兩列長桌、每張兩側各三個位子；沒有 lv）*/
function readingSeats(){ const out=[]; for(let r=0;r<3;r++) for(let c=0;c<2;c++){ const x=-4+c*8, zz=-3+r*3.6; for(let i=0;i<3;i++) for(const s of [-1,1]) out.push({x:x-1.6+i*1.6,z:zz+s*0.9,yaw:s>0?Math.PI:0}); } return out; }
const SPAWN=Object.assign({},LIBRARY_LAYOUT.entrance.spawn), SPAWN3={x:0,z:7,yaw:Math.PI,lv:0};
/* ---- 假的 GM：座位、走路（直接走到；可以暫停）、場景深度 ---- */
let depth=0, walks=[], holdWalk=false, held=[], toasts=[], fadeThrow=0, fadeN=0, goals=[];
GM.sceneBegin=()=>{ depth++; }; GM.sceneEnd=()=>{ depth=Math.max(0,depth-1); }; GM.sceneDepth=()=>depth;
GM.sitAt=(ent,seat)=>{ ent._sat=seat; ent.seat=seat; ent.pose='sit'; ent.idlePose='sit'; ent.frozen=true; ent.lv=seat.lv|0; ent.obj.position.x=seat.x; ent.obj.position.z=seat.z; };
GM.standUp=ent=>{ const s=ent.seat; ent.seat=null; ent.pose='idle'; ent.idlePose='idle'; ent.frozen=false; if(s){ ent.obj.position.x=s.x+0.75; } };
GM.seatApproach=st=>[st.x,st.z+(st.yaw?-0.6:0.6)];
GM.fade=v=>{ fadeN++; if(fadeThrow&&fadeN===fadeThrow) return Promise.reject(new Error('測試：淡出淡入途中出錯')); return Promise.resolve(); };
GM.toast=t=>toasts.push(t); GM.caption=(w,t)=>toasts.push(t); GM.setGoal=t=>{ goals.push(t); H.G.goal=t; };
const place=(ent,x,z,lv)=>{ ent.obj.position.x=x; ent.obj.position.z=z; if(lv!=null) ent.lv=lv|0; };
GM.walkTo=(ent,x,z,o)=>{ walks.push({who:ent===E.player?'P':(ent.charId||ent.id),x,z,lv:o&&o.lv}); if(ent.seat&&ent.frozen) GM.standUp(ent); const go=()=>place(ent,x,z,o&&o.lv); if(holdWalk) return new Promise(r=>held.push(()=>{ go(); r(true); })); go(); return Promise.resolve(true); };
const setup=(key,h,zone,seats,spawn)=>{ const G=H.fresh(key,h,zone); G.invites=[]; G.stats=G.stats||{}; E.zone={seats:seats.map(s=>Object.assign({},s)),spawn:Object.assign({},spawn),roomAt:()=>null}; E.npcs=[]; E.player.seat=null; E.player.busy=false; E.player.lv=spawn.lv|0; place(E.player,spawn.x,spawn.z-0.5);
  GM.npc={}; depth=0; walks=[]; holdWalk=false; held=[]; toasts=[]; fadeThrow=0; fadeN=0; goals=[]; INV._now=()=>Date.now()+1e9; return G; };
const npc=(id,x,z,o)=>{ const n=Object.assign({id,charId:id,obj:{position:{x,y:0,z},rotation:{y:0}},beh:'follow',pose:'idle',lv:0},o||{}); GM.npc[id]=n; E.npcs.push(n); return n; };
const lines=()=>H.said.map(s=>s.t);
const sameTable=(a,b)=>(a.lv|0)===(b.lv|0)&&Math.hypot(a.x-b.x,a.z-b.z)<1.7;
const dEnt=s=>Math.hypot(s.x-SPAWN.x,s.z-SPAWN.z);
(async()=>{
  /* ---- 1 總圖的座位 ---- */
  { const G=setup('2025-09-12',15,'library_hall',hallSeats(),SPAWN); H.FRIEND('heroine_05'); const iv=INV.accept(G,'heroine_05','library',G.day,15,{by:'player'}); const n=npc('heroine_05',SPAWN.x+1,SPAWN.z,{beh:'idle'});
    const pr=INV.leadSeats(GM,n,iv,INV.sitRule(G,iv));
    check('1. 總圖有二樓的長桌（studyTable，lv 1）、一樓也有座位（第二版的多元共享區）',E.zone.seats.some(s=>s.lv===1)&&E.zone.seats.some(s=>s.lv===0),JSON.stringify({lv1:E.zone.seats.filter(s=>s.lv===1).length,lv0:E.zone.seats.filter(s=>s.lv===0).length}));
    check('1. 帶路找到的兩個位子：都在二樓（lv 1）長桌、相鄰（同一張桌子）、離入口 ≥3 m',!!pr&&pr.her.lv===1&&pr.me.lv===1&&sameTable(pr.her,pr.me)&&pr.her!==pr.me&&dEnt(pr.her)>=3&&dEnt(pr.me)>=3,JSON.stringify(pr));
    check('1. 地點表：總圖 sitAt＝{lead, lv:1, away:3, alt:library}',JSON.stringify(INV.place('library').sitAt)===JSON.stringify({lead:true,lv:1,away:3,alt:'library'})); }
  /* ---- 2、3 一起走到總圖：帶路、她先坐、走近才開演 ---- */
  { const G=setup('2025-09-12',15,'campus',hallSeats(),SPAWN); H.FRIEND('heroine_05'); const iv=INV.accept(G,'heroine_05','library',G.day,15,{now:true,by:'player'}); const n=npc('heroine_05',SPAWN.x+1,SPAWN.z);
    G.zone='library_hall'; await INV.arrive(GM,'library_hall'); await W(5);
    const L=iv.lead, her=L&&INV.seatObj(E,L.her), me=L&&INV.seatObj(E,L.me);
    check('2. 一起走到總圖大廳：還沒開演（accepted），她帶路（iv.lead），先演她的帶路句（逐字）',iv.state==='accepted'&&!!L&&lines().includes(LS.lead[0]),JSON.stringify({st:iv.state,L,said:lines()}));
    check('2. 她自己走到二樓長桌的位子坐下（她先坐），目標「坐到她旁邊」；你還站在大廳',!!her&&n.seat===her&&her.lv===1&&L.ph==='wait'&&n.frozen&&!E.player.seat&&/旁邊$/.test(G.goal||''),JSON.stringify({ph:L&&L.ph,seat:n.seat,goal:G.goal}));
    check('2. 她走的路線終點在那個位子旁邊、目標是二樓（多樓層 lv）',walks.some(w=>w.who==='heroine_05'&&w.lv===1&&Math.hypot(w.x-her.x,w.z-her.z)<1),JSON.stringify(walks));
    G.hour=15.4; INV.tick(GM); await W(5);
    check('2. 帶路中過了約定時間：不算沒赴約、不會自己開演（你還在一樓）',iv.state==='accepted'&&!!iv.lead,iv.state);
    /* 存檔讀檔（第 7 項）：這一刻存下來 */
    const saved=JSON.parse(JSON.stringify(G.invites));
    const said0=H.said.length, h0=G.hour, st0=G.stats.study|0; let atStart=null;
    const say0=GM.say; GM.say=async(who,t)=>{ if(t===LS.seated) atStart={her:n.seat,me:E.player.seat,depth}; return say0(who,t); };
    place(E.player,her.x+0.4,her.z+0.9,1); INV.tick(GM); await W(20); GM.say=say0;
    const got=lines().slice(said0), F=LS.first.heroine_05;
    check('3. 走到她旁邊（二樓、2 m 內）＝開演；開演那一刻兩個人都坐著、同一張桌子、離入口 ≥3 m',!!atStart&&!!atStart.her&&!!atStart.me&&sameTable(atStart.her,atStart.me)&&atStart.her!==atStart.me&&dEnt(atStart.me)>=3,JSON.stringify(atStart));
    check('3. 台詞順序：坐下旁白 → 學姊第一次的那一句 → 中途一則 → 收書 → 道別（學姊第一次的那一句）',(()=>{ const a=got.indexOf(LS.seated), b=got.indexOf(F.sit), m=got.findIndex(t=>LS.mid.some(x=>x.includes(t))), p=got.indexOf(LS.pack[0]), y=got.indexOf(F.bye); return a>=0&&b===a+1&&m>b&&p>m&&y>p&&got[got.length-1]===F.bye; })(),JSON.stringify(got));
    check('3. 時間照地點的 stay（1.5 小時）往前、讀書照算（G.stats.study）、state done',Math.abs(G.hour-h0-1.5)<1e-6&&(G.stats.study|0)>st0&&iv.state==='done'&&!iv.lead,JSON.stringify({dh:G.hour-h0,study:G.stats.study,st:iv.state}));
    const pw=walks.filter(w=>w.who==='P').pop(), nw=walks.filter(w=>w.who==='heroine_05').pop();
    check('3. 結束：兩個人起身、一起走到入口（大廳一樓）再道別；她解凍、回自己的作息；你可以動',!E.player.seat&&!n.seat&&!n.frozen&&n.beh!=='follow'&&pw&&nw&&pw.lv===0&&nw.lv===0&&Math.hypot(pw.x-SPAWN.x,pw.z-SPAWN.z)<1&&Math.hypot(nw.x-SPAWN.x,nw.z-SPAWN.z)<1&&depth===0,JSON.stringify({pw,nw,frozen:n.frozen,depth}));
    check('3. 第一次的那兩句記下來（G.flags.libStudy1）',G.flags.libStudy1&&G.flags.libStudy1.heroine_05===G.day);
    /* 7 讀檔：回到帶路途中（她坐著等之前、走路途中）*/
    G.invites=JSON.parse(JSON.stringify(saved)); const iv2=G.invites.find(q=>q.id===iv.id); iv2.lead.ph='go'; G.hour=15.4; E.npcs=[]; GM.npc={}; place(E.player,SPAWN.x,SPAWN.z-0.5,0); E.player.seat=null;
    const e=INV.entryFor(G,'heroine_05');
    check('7. 讀檔回來（帶路途中存的）：作息是跟著你（follow，在這一區）——她生在你旁邊',!!e&&e.act==='follow'&&e.zone==='library_hall'&&e.invite===iv2,JSON.stringify(e&&{act:e.act,zone:e.zone}));
    const n2=npc('heroine_05',SPAWN.x+1,SPAWN.z); walks=[]; holdWalk=true; INV.tick(GM); await W(5);
    check('7. 讀檔回來：她接著帶路（朝存檔裡那個位子走）',walks.some(w=>w.who==='heroine_05'&&Math.hypot(w.x-iv2.lead.her.x,w.z-iv2.lead.her.z)<1)&&n2._ivLead===iv2.id,JSON.stringify(walks));
    held.splice(0).forEach(f=>f()); holdWalk=false; await W(5);
    check('7. 走到了坐下等你（ph wait）',iv2.lead&&iv2.lead.ph==='wait'&&!!n2.seat,JSON.stringify(iv2.lead));
    /* 8 不跟上：走出總圖 */
    G.zone='campus'; INV.tick(GM); await W(5);
    check('8. 帶路途中走出總圖＝作罷（cancelled、訊息一則；不算沒赴約）',iv2.state==='cancelled'&&!iv2.lead&&/作罷/.test(G.msgs[G.msgs.length-1].text),JSON.stringify({st:iv2.state,m:G.msgs[G.msgs.length-1]})); }
  /* ---- 4 第二次約：一般句；閉館前：閉館廣播 ---- */
  { const G=setup('2025-09-12',21,'library_hall',hallSeats(),SPAWN); H.FRIEND('heroine_05'); G.flags.libStudy1={heroine_05:1}; const iv=INV.accept(G,'heroine_05','library',G.day,21,{by:'player'}); const n=npc('heroine_05',SPAWN.x+1,SPAWN.z,{beh:'idle'});
    INV.tick(GM); await W(10); const L=iv.lead, her=L&&INV.seatObj(E,L.her);
    check('4. 約好的時間兩個人都在大廳（S.autoStart）：一樣先帶路',!!L&&L.ph==='wait'&&iv.state==='accepted',JSON.stringify(L));
    const said0=H.said.length; place(E.player,her.x,her.z+0.8,1); INV.tick(GM); await W(20); const got=lines().slice(said0);
    check('4. 第二次：坐下用一般句、道別用一般句（AA_649 第 2 節）',got.some(t=>LS.sit.includes(t))&&LS.bye.includes(got[got.length-1])&&!got.includes(LS.first.heroine_05.sit),JSON.stringify(got));
    check('4. 21:00 讀到閉館前十分鐘（不超過 22:00）、收書是閉館廣播',got.includes(LS.close[0])&&!got.includes(LS.pack[0])&&G.hour<=22-1/6+1e-6&&G.hour>21.5,JSON.stringify({h:G.hour})); }
  /* ---- 5 走到了才發現位子被坐走 ---- */
  { const G=setup('2025-09-12',15,'library_hall',hallSeats(),SPAWN); H.FRIEND('heroine_02'); const iv=INV.accept(G,'heroine_02','library',G.day,15,{by:'player'}); const n=npc('heroine_02',SPAWN.x+1,SPAWN.z,{beh:'idle'});
    holdWalk=true; INV.tick(GM); await W(10); const first=JSON.stringify(iv.lead.her);
    const other=npc('pool_x',0,0,{beh:'idle'}); other.seat=INV.seatObj(E,iv.lead.her);   /* 她還在路上，別人先坐走 */
    held.splice(0).forEach(f=>f()); await W(5); holdWalk=false; held.splice(0).forEach(f=>f()); await W(5);
    check('5. 位子被坐走：換下一組（還是二樓、相鄰）、她坐到新的位子',iv.lead&&JSON.stringify(iv.lead.her)!==first&&iv.lead.her.lv===1&&n.seat&&n.seat!==other.seat&&sameTable(iv.lead.her,iv.lead.me),JSON.stringify({first,now:iv.lead})); }
  /* ---- 6 二樓坐滿 → 三樓閱覽區 ---- */
  { const seats=hallSeats().map(s=>s.lv===1?Object.assign(s,{taken:true}):s); const G=setup('2025-09-12',15,'campus',seats,SPAWN); H.FRIEND('heroine_03');
    const iv=INV.accept(G,'heroine_03','library',G.day,15,{now:true,by:'player'}); const n=npc('heroine_03',SPAWN.x+1,SPAWN.z);
    G.zone='library_hall'; await INV.arrive(GM,'library_hall'); await W(5);
    check('6. 二樓都坐滿：她先走上二樓看（不在一樓找位子坐），還沒說滿了',iv.lead&&iv.lead.ph==='full'&&!n.seat&&(n.lv|0)===1&&!lines().includes(LS.full[0]),JSON.stringify({L:iv.lead,lv:n.lv}));
    place(E.player,n.obj.position.x+1,n.obj.position.z,1); const said0=H.said.length; INV.tick(GM); await W(10); const got=lines().slice(said0);
    check('6. 你走上二樓到她旁邊：「（二樓的長桌都坐滿了。）」「（小聲）去三樓好了。三樓沒有人講話。」（逐字）',JSON.stringify(got)===JSON.stringify(LS.full),JSON.stringify(got));
    { const who=H.said.slice(said0).map(x=>x.who); check('6. 「（二樓的長桌都坐滿了。）」是旁白、「（小聲）去三樓好了。…」是她說的（「（小聲）」外面不再有「」以後照樣認得是台詞，AA-B 11-08 00:05）',who.length===2&&who[0]==null&&who[1]!=null,JSON.stringify(who)); }
    check('6. 接著一起走去三樓閱覽區（going、iv.zone library）、她跟著你',iv.state==='going'&&iv.zone==='library'&&n.beh==='follow'&&/三樓/.test(G.goal||''),JSON.stringify({st:iv.state,z:iv.zone,beh:n.beh}));
    G.zone='library'; E.zone={seats:readingSeats(),spawn:SPAWN3,roomAt:()=>null}; E.player.lv=0; place(E.player,SPAWN3.x,SPAWN3.z-0.4,0); n.lv=0; place(n,SPAWN3.x+0.8,SPAWN3.z,0);
    const s1=H.said.length; await INV.arrive(GM,'library'); await W(5); const L=iv.lead, her=L&&INV.seatObj(E,L.her), me=L&&INV.seatObj(E,L.me);
    check('6. 到了三樓閱覽區：她帶路坐到相鄰兩個位子之一（離樓梯間門口 ≥3 m），不再說二樓那一句',!!her&&!!me&&n.seat===her&&L.ph==='wait'&&Math.hypot(her.x-SPAWN3.x,her.z-SPAWN3.z)>=3&&Math.hypot(me.x-SPAWN3.x,me.z-SPAWN3.z)>=3&&sameTable(her,me)&&!lines().slice(s1).includes(LS.lead[0]),JSON.stringify(L));
    const s2=H.said.length; place(E.player,her.x+0.5,her.z+0.9,0); INV.tick(GM); await W(20); const got2=lines().slice(s2);
    check('6. 三樓：走近開演、語彤第一次的兩句、演完 done',iv.state==='done'&&got2.includes(LS.first.heroine_03.sit)&&got2[got2.length-1]===LS.first.heroine_03.bye,JSON.stringify(got2)); }
  /* ---- 9 第 2 項：見面演完她解凍；第 3 項：手機；第 6 項：早到 ---- */
  { const G=setup('2025-09-13',15,'cafe',[{x:0,z:0,yaw:0,lv:0},{x:0.8,z:0,yaw:0,lv:0}],{x:0,z:4,lv:0}); H.FRIEND('heroine_02'); let t=1e6; INV._now=()=>t;
    const iv=INV.accept(G,'heroine_02','cafe',G.day,15,{by:'player'}); const n=npc('heroine_02',2,2,{beh:'idle'});
    INV.tick(GM); await W(20);
    check('9. Café 見面演完：她解凍（frozen false）、起身（不一直坐在那裡）、場景深度回到 0',iv.state==='done'&&!!n._sat&&!n.frozen&&!n.seat&&depth===0,JSON.stringify({st:iv.state,frozen:n.frozen,seat:!!n.seat,depth}));
    check('10. 兩個人一起坐下（Café）：開場句是 AA_649 第 4 節咖啡的其中一則',INVITE_DATA.seatOpen.coffee.some(L=>L.every(x=>lines().includes(x))),JSON.stringify(lines()));
    check('9. 剛演完見面（30 秒內）：手機不自己再打開（INV.phoneBack false）；31 秒後可以',INV.phoneBack(G)===false&&(t+=31000,INV.phoneBack(G)===true));
    const src=fs.readFileSync(path.join(H.ROOT,'src/game3d.js'),'utf8');
    check('9. game3d.js：手機約人、改天之後打開手機前問 INV.phoneBack；改天那一條 promise 有 catch（console.warn）',(src.match(/INV\.phoneBack\(G\)\) openPhone\('msg'\)/g)||[]).length>=2&&/INV\.flow\(GM,v\.who,null,false(,r\.flowPlace\?\{place:r\.flowPlace\}:undefined)?\)\.catch\(e=>console\.warn/.test(src)); }   /* 2026-11-10 HER-ASK-LATER-DAY-1110：改天可以帶地點（flowPlace）*/
  { const G=setup('2025-09-12',15,'library_hall',hallSeats(),SPAWN); H.FRIEND('heroine_05'); const iv=INV.accept(G,'heroine_05','library',G.day,15,{by:'player'}); npc('heroine_05',SPAWN.x+1,SPAWN.z,{beh:'idle'}); holdWalk=true; INV.tick(GM); await W(5);
    check('9. 她正在帶路：手機不自己再打開',iv.lead&&INV.phoneBack(G)===false); }
  { const G=setup('2025-09-12',14.3,'library_hall',hallSeats(),SPAWN); H.FRIEND('heroine_05'); const iv=INV.accept(G,'heroine_05','library',G.day,15,{by:'player'});
    INV.tick(GM); INV.tick(GM); G.hour=14.5; INV.tick(GM);
    check('9. 提早 15 分鐘以上到（14:18 到、約 15:00）：旁白一次「（約好的是 15:00。還早。你在門口的長椅坐了一下。）」（AA_651 第 3 節）',toasts.filter(t=>t==='（約好的是 15:00。還早。你在門口的長椅坐了一下。）').length===1&&iv.state==='accepted',JSON.stringify(toasts)); }
  /* ---- 9 第 4 項：開演途中出錯（坐下以後淡入失敗）：兩個人站起來、她解凍、深度回去 ---- */
  { const G=setup('2025-09-13',15,'cafe',[{x:0,z:0,yaw:0,lv:0},{x:0.8,z:0,yaw:0,lv:0}],{x:0,z:4,lv:0}); H.FRIEND('heroine_02'); const iv=INV.accept(G,'heroine_02','cafe',G.day,15,{by:'player'}); const n=npc('heroine_02',2,2,{beh:'idle'});
    fadeThrow=2; const ce=console.error; let errs=0; console.error=()=>{ errs++; };
    try{ INV.tick(GM); await W(20); } finally { console.error=ce; }
    check('9. 開演途中出錯：兩個人都站起來、她解凍、這一筆不再自己重來（cancelled）、場景深度回到 0、錯誤有記（console.error）',!E.player.seat&&!n.seat&&!n.frozen&&iv.state==='cancelled'&&depth===0&&errs>=1,JSON.stringify({pSeat:!!E.player.seat,nSeat:!!n.seat,frozen:n.frozen,st:iv.state,depth,errs}));
    fadeThrow=0; }
  /* ---- 11 台詞逐字對照 AA_649（企劃線 37daf8027）；（小聲）不重複 ---- */
  { const all=[].concat(LS.lead,LS.full,[LS.seated],...LS.mid,LS.close,LS.pack,LS.sit,LS.bye,...Object.values(LS.first).map(f=>[f.sit,f.bye]),...['meal','coffee','movie','movieEnd','bookstore'].map(k=>[].concat(...INVITE_DATA.seatOpen[k])));
    let doc=null; try{ doc=require('child_process').execFileSync('git',['show','37daf8027:docs/story_planning/AA_649_約念書走到桌子坐下＋約會到座位的開場句.md'],{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']}); }catch(e){ doc=null; }
    /* 2026-11-11（X324 D 區，AA_784_invites.json (共用) libStudy 9 列）：一起念書的坐下、道別、中途照覆蓋層拿掉刪節號（沛珊、可昕的道別換句，和 study_scenes.js 一致）——對稿時「新字的舊字在稿上」也算（tests/overlay_expect.js 的 inDoc／fwd）；舊期望：字本身在稿上 */
    const OE=require('./overlay_expect.js'), inD=t=>OE.inDoc('invites','(共用)',t,t=>!!doc&&doc.includes(t))||require('./canon1112_ok.js').ok(t)/* （CANON-NO-ECON-1112 第四批：照 AA_894 換字）可昕總圖 sit、bye 改比 AA_894 */, FW=t=>OE.fwd('invites','(共用)',t);
    if(doc){ const miss=all.filter(t=>!inD(t)); check('11. 每一句都逐字出現在 AA_649（37daf8027）',!miss.length,JSON.stringify(miss));
      const want=['以安','芷若','語彤','子晴','學姊','沛珊','可昕'].length; check('11. 第 3 節七個人都有（坐下、道別）',Object.keys(LS.first).length===want&&Object.values(LS.first).every(f=>doc.includes('| '+f.sit+' | '+f.bye+' |')||(inD(f.sit)&&inD(f.bye))));
      check('11. AA_649 第 2 節的一般句都在（坐下兩句、道別兩句）',['（小聲）我讀到六點。你呢？','（小聲）手機先收起來。','今天讀得比我想的多。……下次再約。','好累。……可是很好。'].map(FW).every(t=>LS.sit.concat(LS.bye).includes(t))); }
    else console.log('SKIP 11. 這個 checkout 沒有企劃線 37daf8027（git fetch origin claude/story-planning 以後再跑）');
    check('11. 稿上寫在引號裡的（小聲）不再加一次；沒寫的照舊加（外面有「」的拿掉再加：「好。」→（小聲）好。，AA-B 11-08 00:21）；整句旁白不加',LIBQ.needsPrefix('「（小聲）二樓靠窗那排比較安靜。」')===false&&LIBQ.quiet('「好。」')==='（小聲）好。'&&LIBQ.needsPrefix(LS.seated)===false); }
  /* ---- 12 CC 11-04 讀 909c729a6 的疑點 1～3 ---- */
  { const G=setup('2025-09-13',15,'cafe',[{x:0,z:0,yaw:0,lv:0},{x:0.8,z:0,yaw:0,lv:0}],{x:0,z:4,lv:0}); H.FRIEND('heroine_02'); const iv=INV.accept(G,'heroine_02','cafe',G.day,15,{by:'player'}); npc('heroine_02',2,2,{beh:'idle'});
    const W0=globalThis.WISH; globalThis.WISH={meetMention:async()=>{ throw new Error('test'); }}; const ce=console.error; let errs=0; console.error=()=>{ errs++; };
    try{ INV.tick(GM); await W(20); } finally { console.error=ce; if(W0===undefined) delete globalThis.WISH; else globalThis.WISH=W0; }
    check('12. 見面內容演到一半出錯（WISH.meetMention 丟例外）：這一筆改成作罷（cancelled、err），不停在 done；iv.mid 收掉；深度回到 0',iv.state==='cancelled'&&iv.err===1&&!iv.mid&&depth===0&&errs>=1,JSON.stringify({st:iv.state,mid:iv.mid,depth,errs})); }
  { const G=setup('2025-09-13',15,'cafe',[{x:0,z:0,yaw:0,lv:0},{x:0.8,z:0,yaw:0,lv:0}],{x:0,z:4,lv:0}); H.FRIEND('heroine_02'); const iv=INV.accept(G,'heroine_02','cafe',G.day,15,{by:'player'}); npc('heroine_02',2,2,{beh:'idle'});
    INV.tick(GM); await W(20); check('12. 演完的見面沒有留下 iv.mid（存檔不多欄位）',iv.state==='done'&&!('mid' in iv)); }
  { const G=setup('2025-09-12',15,'library_hall',hallSeats(),SPAWN); H.FRIEND('heroine_05'); const iv=INV.accept(G,'heroine_05','library',G.day,15,{by:'player'}); npc('heroine_05',SPAWN.x+1,SPAWN.z,{beh:'idle'}); holdWalk=true; INV.tick(GM); await W(5);
    const t0=toasts.length; let badge=0; const pb=GM.phoneBadge; GM.phoneBadge=()=>{ badge++; }; G.zone='campus'; try{ INV.tick(GM); } finally { GM.phoneBadge=pb; }
    check('12. 帶路途中走出那一區＝作罷：除了訊息，畫面有提示（toast）、手機有紅點（phoneBadge）',iv.state==='cancelled'&&toasts.slice(t0).some(t=>/後來作罷了/.test(t))&&badge>=1,JSON.stringify({st:iv.state,t:toasts.slice(t0),badge})); holdWalk=false; held=[]; }
  { const src=fs.readFileSync(path.join(H.ROOT,'src/story3d.js'),'utf8'); const m=src.match(/S\.phoneAuto=function[\s\S]*?GM\.openPhone\('msg'\)/);
    check('12. STORY.phoneAuto 打開手機前問 INV.phoneBack（帶路中、一起走過去、剛演完 30 秒內不自己打開）',!!m&&/INV\.phoneBack\(G\)/.test(m[0])); }
  /* ---- 13 BB-B 11-07（AA_717 探針第 2 次見面、第 538 天）：她坐著等你（ph wait、_ivLead 還是這一筆），可是不在那個位子上（被拉起來、座位差一點）——
         原本：不會再帶路（_ivLead 是這一筆）、也不開演（要坐在那個位子），兩小時後作罷。改：你離得遠＝她走回那個位子；你走到她本人旁邊＝照樣開演（leadScene 讓她坐回去）---- */
  { const G=setup('2025-09-12',15,'campus',hallSeats(),SPAWN); H.FRIEND('heroine_05'); const iv=INV.accept(G,'heroine_05','library',G.day,15,{now:true,by:'player'}); const n=npc('heroine_05',SPAWN.x+1,SPAWN.z);
    G.zone='library_hall'; await INV.arrive(GM,'library_hall'); await W(5);
    const L=iv.lead, her=L&&INV.seatObj(E,L.her);
    GM.standUp(n); n.beh='idle'; n.path=null; const w0=walks.length; G.hour=15.2; INV.tick(GM); await W(5);
    const back=walks.slice(w0).some(w=>w.who==='heroine_05'&&!!her&&Math.hypot(w.x-her.x,w.z-her.z)<1);
    check('13. 她不在那個位子上、你離得遠：她走回那個位子坐下（不會兩邊都不動）',!!L&&back&&L.ph==='wait'&&n.seat===her&&iv.state==='accepted',JSON.stringify({back,ph:L&&L.ph,seat:n.seat,st:iv.state}));
    GM.standUp(n); n.path=null; const said0=H.said.length; place(E.player,n.obj.position.x+0.4,n.obj.position.z+0.6,1); G.hour=15.3; INV.tick(GM); await W(20);
    check('13. 她不在那個位子上、你走到她本人旁邊：照樣開演（她坐回那個位子、演完 done）',iv.state==='done'&&lines().slice(said0).includes(LS.seated),JSON.stringify({st:iv.state,said:lines().slice(said0,said0+3)})); }
  /* ---- 14 BB-B 11-07 10:42（AA_717 探針第 2 次見面）：約完收起手機、走去找她，手機又自己打開＝暫停、時間停住、那一場不開始——約好的時間前 30 分鐘到開始後 1 小時手機不自己打開 ---- */
  { const G=setup('2025-09-13',11,'campus',[{x:0,z:0,yaw:0,lv:0}],{x:0,z:4,lv:0}); H.FRIEND('heroine_01'); const iv=INV.accept(G,'heroine_01','library',G.day,12,{by:'player'}); INV._now=()=>Date.now()+5e9;   /* 離上一項的見面很久了（不是「剛演完 30 秒內」）*/
    const at=h=>{ G.hour=h; return INV.phoneBack(G); }; const r=[at(11.4),at(11.6),at(12.01),at(12.9),at(13.1)];
    check('14. 約好 12:00：11:24 可以自己打開；11:36～12:54 不自己打開；13:06 以後可以',JSON.stringify(r)===JSON.stringify([true,false,false,false,true]),JSON.stringify(r));
    iv.state='cancelled'; check('14. 約取消了：照常可以打開',at(12.01)===true); }
  H.done();
})().catch(e=>{ console.error(e); process.exit(1); });
