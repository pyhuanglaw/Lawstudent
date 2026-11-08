// 約會兩個人一起坐下：不坐有別人的那一桌、afar 先坐窗邊長桌、開場句對得上坐的位子（DATE-SEAT-AFAR-1105）——不需要瀏覽器（D131）。
// 起因：使用者 2026-11-05 08:3x：「我跟學姊到了AFAR之後 居然坐在四人桌對面有人 桌上沒有燈 對話是學姊說這個燈很可愛?」
//   存檔 tests/fixtures/user_save_day36_afar_1105.json（day 36、當場約學姊 iv26 16:52 afar、存檔時 18:00 人在 (1.73, 1.86)＝四人桌 1、2 中間）。
//   查到的：①S.pairSeats 只找「離你最近、旁邊有空位」的兩個位子，沒看同一桌有沒有別人——進門站 (2.575, 2.0)，最近的是四人桌 1 西側 (2.05, 1.15)、(2.05, 0.65)，
//     那一天 16:52 的客人（CROWD.shopPlan，照日期當種子）有一位坐在同一桌東側 (3.15, 1.15)＝對面有人；
//     ②S.seatOpenLines 從 seatOpen.afar 兩則隨機抽，不管坐哪裡——小燈那一則（「（你們在窗邊長桌坐下。她把桌上的小燈打開……）」「……這個燈好可愛。」）只有窗邊長桌（table 6）有燈。
// 檢查：
//   1 重現那一天 16:52 的客人：兩個人坐的那一桌沒有別人（四人桌整桌；長桌 1.8 m 內）——修改前 FAIL（四人桌 1，對面有人）
//   2 窗邊長桌有兩個相鄰的空位、旁邊沒人：先坐窗邊長桌（prefTable 6）——修改前 FAIL
//   3 整段（INV.startTogether → S.meet）：說了小燈那一則＝你們真的坐在窗邊長桌——修改前 FAIL（坐四人桌 1、說小燈那一則）
//   4 窗邊長桌沒有兩個旁邊沒人的相鄰空位：坐別的空桌、不說小燈那一則（說杯墊那一則）——修改前 FAIL
//   5 每一桌都有人：照原本的做法還是一起坐下（不會變成站著演）
//   6 她已經坐在一張沒別人的桌子（不是窗邊長桌）、窗邊長桌滿了：坐她旁邊、不叫她換位子
//   7 路人不來坐玩家那一桌（CROWD.playerTable）：四人桌整桌、長桌 1.8 m 內；隔壁桌 0.6 m 不算——修改前 FAIL（沒有這個函式）
//   8 開場句資料：小燈那一則寫了 onlyAt.table 6、字一個都沒改（AA_652 定稿，D137）；杯墊那一則沒有 onlyAt
// 用法：node tests/date_seat_afar_1105_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const H=require('./pg_harness.js'); const {check,GM,E}=H; const ROOT=H.ROOT;
const ld=f=>{ let s=fs.readFileSync(path.join(ROOT,f),'utf8'); s=s.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); };
ld('src/data/afar_layout.js'); ld('src/crowd3d.js');
const J=JSON.stringify, L=AFAR_LAYOUT;
const SV=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/user_save_day36_afar_1105.json'),'utf8'));
const IV=(SV.invites||[]).find(q=>q.id==='iv26');
const LAMP=['（你們在窗邊長桌坐下。她把桌上的小燈打開，又關掉，又打開。）','……這個燈好可愛。'], COAST=['（她把兩杯咖啡的杯墊對齊，一杯推給你。）'];
GM.sitAt=(ent,seat)=>{ ent.seat=seat; ent.pose='sit'; ent.idlePose='sit'; ent.frozen=true; if(ent.obj){ ent.obj.position.x=seat.x; ent.obj.position.z=seat.z; } };
GM.standUp=ent=>{ ent.seat=null; ent.pose='idle'; ent.idlePose='idle'; ent.frozen=false; };
/* 區域的座位照 zones3d.js ggRoom 建（{x,z,yaw,table,kind:'shop'}；label 在互動點上，不在座位上）*/
const zoneSeats=()=>L.seats.map(s=>Object.assign({x:s.x,z:s.z,yaw:s.yaw,table:s.table,kind:'shop'},s.seatH===0.45?{npcOnly:true}:{}));   /* 卡座兩張只給路人（ggRoom 的 noSit）*/
const seatAt=(x,z)=>E.zone.seats.find(q=>Math.abs(q.x-x)<0.01&&Math.abs(q.z-z)<0.01);
/* 同一桌（測試自己的定義，不用程式的）：四人以內的桌子整桌；長桌 1.8 m 內 */
const N=t=>L.seats.filter(q=>q.table===t).length;
const sameTable=(a,b)=>a.table===b.table&&(N(a.table)<=4||Math.hypot(a.x-b.x,a.z-b.z)<1.8);
let G=null, xid=0;
const setup=(hour,strangers)=>{ G=H.fresh('2025-09-12',hour,'afar'); G.day=SV.day; G.hour=hour; G.invites=[];
  E.zone={seats:zoneSeats(),spawn:{x:L.spawn.x,z:L.spawn.z},roomAt:()=>null}; E.npcs=[]; GM.npc={}; E.player.seat=null; E.player.lv=0;
  E.player.obj.position.x=L.exit.at.x; E.player.obj.position.z=+(L.d/2-2).toFixed(2);   /* 進門站的地方（zones3d.js SHOP_IN：門 x、往裡 2 m）*/
  for(const [x,z] of strangers){ const st=seatAt(x,z); const m={id:'x'+(xid++),obj:{position:{x,z},rotation:{y:0}},seat:st,pose:'sit',beh:'idle',crowd:'shop_afar_0'}; E.npcs.push(m); }
  return G; };
const her=()=>{ const n={id:'heroine_05',obj:{position:{x:2.2,z:2.2},rotation:{y:0}},beh:'idle',pose:'idle'}; GM.npc.heroine_05=n; E.npcs.push(n); return n; };
const strangersAt=()=>E.npcs.filter(m=>m.id!=='heroine_05').map(m=>m.seat);
const othersAtTable=pr=>strangersAt().filter(q=>sameTable(q,pr.her)||sameTable(q,pr.me));
const sd=s=>s?s.table+'@'+s.x+','+s.z:null;

/* 那一天那個時間店裡的客人（CROWD.shopPlan：照店＋日期當種子；s.n 個人坐那一組的前 n 個位子）*/
const crowdAt=h=>{ const def=CROWD.SHOP_ZONES.afar, pl=CROWD.shopPlan(def,{day:SV.day,hour:h,zone:'afar',flags:{},invites:[],stage:SV.stage}), out=[];
  pl.units.forEach((sl,ui)=>{ for(const s of sl) if(s.t0<=h&&s.t1>h) for(const q of def.units[ui].seats.slice(0,s.n[0])) out.push([q.x,q.z]); }); return out; };

(async()=>{
  check('0 存檔：day 36、和溫書瑀當場約 afar（iv26）、存檔時人在四人桌 1、2 中間',SV.day===36&&SV.zone==='afar'&&!!IV&&IV.who==='heroine_05'&&IV.now===true&&Math.abs(SV.pos.x-1.73)<0.01,J(IV&&[IV.who,IV.h,IV.now]));
  const H0=IV?IV.h:16.86, C0=crowdAt(H0);
  check('0 那一天 '+H0.toFixed(2)+' 的客人有一位坐在四人桌 1（3.15, 1.15）',C0.some(([x,z])=>x===3.15&&z===1.15),J(C0));

  /* 1、2 */
  { setup(H0,C0); const n=her(); const pr=INV.pairSeats(GM,n,'afar'); const bad=pr?othersAtTable(pr):['沒有配到'];
    check('1 那一天的客人：兩個人坐的那一桌沒有別人',!!pr&&!bad.length,J({her:sd(pr&&pr.her),me:sd(pr&&pr.me),同桌的人:bad.map(sd)}));
    check('2 窗邊長桌有兩個相鄰的空位、旁邊沒人：兩個人都坐窗邊長桌（table 6）',!!pr&&pr.her.table===6&&pr.me.table===6&&Math.hypot(pr.her.x-pr.me.x,pr.her.z-pr.me.z)<1.3,J({her:sd(pr&&pr.her),me:sd(pr&&pr.me)})); }

  /* 3 整段 */
  { setup(H0,C0); H.FRIEND('heroine_05'); const n=her(); const iv=INV.accept(G,'heroine_05','afar',G.day,G.hour,{by:'player'}); iv.state='accepted';
    const R0=Math.random; Math.random=()=>0; let seat=null; const sit0=GM.sitAt; GM.sitAt=(e,s)=>{ if(e===E.player) seat=s; sit0(e,s); };
    try{ await INV.startTogether(GM,iv,n); } finally { Math.random=R0; GM.sitAt=sit0; }
    const said=H.said.map(s=>s.t), lamp=LAMP.every(t=>said.includes(t));
    check('3 整段：兩個人一起坐下、那一桌沒有別人',!!seat&&!othersAtTable({her:n.seat||seat,me:seat}).length,J({me:sd(seat)}));
    check('3 整段：說了小燈那一則＝真的坐在窗邊長桌（table 6）',!lamp||(seat&&seat.table===6),J({me:sd(seat),lamp,said:said.slice(0,6)})); }

  /* 4 窗邊長桌沒有可以坐的 */
  { const C=C0.concat([[-0.9,3.1],[0.7,3.1]]); setup(H0,C); const n=her(); const pr=INV.pairSeats(GM,n,'afar');
    check('4 窗邊長桌（-2.5、-0.9、0.7 有人）沒有旁邊沒人的相鄰空位：坐別的空桌、同一張桌子、那一桌沒有別人、你不坐只給路人的卡座',!!pr&&pr.her.table!==6&&pr.me.table!==6&&pr.her.table===pr.me.table&&!pr.me.npcOnly&&!othersAtTable(pr).length,J({her:sd(pr&&pr.her),me:sd(pr&&pr.me)}));
    H.FRIEND('heroine_05'); const iv=INV.accept(G,'heroine_05','afar',G.day,G.hour,{by:'player'}); iv.state='accepted';
    const R0=Math.random; Math.random=()=>0; H.said=[]; try{ await INV.startTogether(GM,iv,n); } finally { Math.random=R0; }
    const said=H.said.map(s=>s.t);
    check('4 整段：不說小燈那一則，說杯墊那一則',!LAMP.some(t=>said.includes(t))&&COAST.every(t=>said.includes(t)),J(said.slice(0,6))); }

  /* 5 每一桌都有人 */
  { const C=[];   /* 每一張桌子都坐一個人（窗邊長桌每隔一個）*/
    for(const t of [...new Set(L.seats.map(s=>s.table))]){ const ss=L.seats.filter(s=>s.table===t); ss.forEach((s,i)=>{ if(t===6?i%2===0:i===0) C.push([s.x,s.z]); }); }
    setup(H0,C); const n=her(); const pr=INV.pairSeats(GM,n,'afar');
    check('5 每一桌都有人：照原本的做法還是一起坐下（兩個空位、相鄰）',!!pr&&pr.her!==pr.me&&!strangersAt().includes(pr.her)&&!strangersAt().includes(pr.me),J({her:sd(pr&&pr.her),me:sd(pr&&pr.me)})); }

  /* 6 她已經坐著 */
  { const C=L.seats.filter(s=>s.table===6).map(s=>[s.x,s.z]).filter((_,i)=>i%2===0); setup(H0,C); const n=her(); n.seat=seatAt(-0.25,0.65); n.pose='sit';
    const pr=INV.pairSeats(GM,n,'afar');
    check('6 她坐在沒別人的四人桌 3、窗邊長桌每隔一位有人：坐她旁邊（不叫她換位子）',!!pr&&pr.her===n.seat&&pr.me.table===3,J({her:sd(pr&&pr.her),me:sd(pr&&pr.me)})); }

  /* 7 路人不來坐玩家那一桌 */
  { setup(H0,[]); E.player.seat=seatAt(2.05,1.15); const f=CROWD.playerTable;
    check('7 CROWD.playerTable：玩家坐四人桌 1 → 同桌對面 (3.15, 0.65) 不來；隔壁四人桌 2 (1.45, 1.15)（0.6 m）照來',typeof f==='function'&&f(E,seatAt(3.15,0.65))&&f(E,seatAt(2.05,0.65))&&!f(E,seatAt(1.45,1.15)));
    E.player.seat=seatAt(-0.9,3.1);
    check('7 CROWD.playerTable：玩家坐窗邊長桌 → 旁邊 0.8 m 不來、2.4 m 照來',typeof f==='function'&&f(E,seatAt(-0.1,3.1))&&!f(E,seatAt(1.4,3.1)));
    E.player.seat=null; check('7 玩家沒坐著：都照來',typeof f==='function'&&!f(E,seatAt(3.15,0.65))); }
  /* 7b BUG-AFAR-DATE-OCCUPIED-1107（BB-B 11-07）：約會她先坐好、你還沒坐下的那一段，新來的客人也不坐她那一桌（她坐的位子、帶路選好的兩個位子）*/
  { setup(H0,[]); const f=CROWD.playerTable; E.player.seat=null; const G0g=global.GAME; global.GAME={G:H.G};
    const her={id:'heroine_05',_ivLead:'iv9',seat:seatAt(2.05,1.15),obj:{position:{x:2.05,y:0,z:1.15}}}; E.npcs.push(her);
    const a=f(E,seatAt(3.15,0.65)), b=f(E,seatAt(1.45,1.15)); E.npcs.splice(E.npcs.indexOf(her),1);
    H.G.invites=[{id:'iv9',who:'heroine_05',state:'accepted',day:H.G.day,lead:{ph:'go',her:seatAt(2.05,1.15),me:seatAt(2.05,0.65)}}]; const c=f(E,seatAt(3.15,0.65));
    H.G.invites=[]; const d=f(E,seatAt(3.15,0.65)); global.GAME=G0g;
    check('7b 約會她先坐好（_ivLead）：同桌 (3.15, 0.65) 不來、隔壁桌照來；帶路選好的位子（iv.lead）也算；沒有約會＝照來',a&&!b&&c&&!d,J({a,b,c,d})); }

  /* 8 資料 */
  { const A=INVITE_DATA.seatOpen.afar||[];
    check('8 seatOpen.afar：小燈那一則 onlyAt.table 6、字沒改；杯墊那一則沒有 onlyAt；JSON 照舊兩則',A.length===2&&J(A[0])===J(LAMP)&&!!A[0].onlyAt&&A[0].onlyAt.table===6&&J(A[1])===J(COAST)&&!Object.prototype.hasOwnProperty.call(A[1],'onlyAt'),J(A.map(e=>[e,e.onlyAt||null])));
    E.player.seat=null; H.said=[]; const R0=Math.random; Math.random=()=>0; await INV.seatOpenLines(GM,{who:'heroine_05'},{name:'溫書瑀'},INV.place('afar')); Math.random=R0;
    check('8 沒有坐的位子（沒有一起坐下）：只抽沒有 onlyAt 的那一則（杯墊）',J(H.said.map(s=>s.t))===J(COAST),J(H.said.map(s=>s.t)));
    E.player.seat={x:0,z:0,yaw:0}; H.said=[]; Math.random=()=>0; await INV.seatOpenLines(GM,{who:'heroine_05'},{name:'溫書瑀'},INV.place('cafe')||{id:'cafe'}); Math.random=R0; E.player.seat=null;
    check('8 別的地點（兩點半 Café，座位沒有桌號）照舊抽得到開場句（第一則）',J(H.said.map(s=>s.t))===J(INVITE_DATA.seatOpen.coffee[0]),J(H.said.map(s=>s.t)));
    check('8 afar 地點寫了 prefTable 6',INV.place('afar')&&INV.place('afar').prefTable===6); }
  H.done();
})();
