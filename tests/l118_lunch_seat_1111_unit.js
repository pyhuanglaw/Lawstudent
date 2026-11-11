// 118 巷午餐邀約：玩家和同行的人要坐在一起（BB 2026-11-11 雲端自檢：柏翰、芯慈和玩家隔 3～4 m 兩桌——中間的桌子被路人客人坐掉）。不需要瀏覽器。
//  1 九間店都沒人：2～4 人都坐同一張桌子或相鄰的桌子（任兩人最遠 ≤ 2.6 m）
//  2 路人把店坐到只剩零散的位子（每張桌子留一個空位）：路人讓位（CROWD.shopYield），玩家和同行的人還是坐在一起
//  3 有名字的人坐著的位子不會被搶；路人沒擋到的時候不趕人
//  4 crowd3d.js 有 S.shopYield（只在進門那一刻、整組離開）
// 修改前（開發分支 7c57ef63f）：第 2 項 FAIL（照零散的空位坐，隔好幾張桌子）、第 4 項 FAIL。
// 用法：node tests/l118_lunch_seat_1111_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails++; };
const J=x=>JSON.stringify(x);
const LAY=(new Function(fs.readFileSync(path.join(ROOT,'src/data/l118_shop_layouts.js'),'utf8').replace(/^(const|var|let) L118_SHOP_LAYOUTS\s*=/m,'return ')))();
const SRC=fs.readFileSync(path.join(ROOT,'src/l118_lunch3d.js'),'utf8');
const a=SRC.indexOf('  S.TOGETHER_GAIN='), b=SRC.indexOf('\n  S.', SRC.indexOf('  S.seatParty=function')+10);
check('0. l118_lunch3d.js 有 S.TOGETHER_GAIN 和 S.seatParty',a>0&&b>a);
if(!(a>0&&b>a)){ console.log('FAILED'); process.exit(1); }
const mk=()=>{ const S={}; const ctx={S,L118_SHOP_LAYOUTS:LAY,CROWD:null,console,Math,Object,Array}; vm.runInNewContext(SRC.slice(a,b),ctx); return {S,ctx}; };
const world=shop=>{ const seats=LAY[shop].seats.map(q=>({x:q.x,z:q.z,yaw:q.yaw,lift:q.lift,table:q.table})), E={player:{seat:null},zone:{seats},npcs:[]};
  const GM={E,G:{day:50,zone:'l118_'+shop},npc:{},sitAt(e,st){ e.seat=st; },spawnCharacter(id,x,z,o){ const c={charId:id,seat:o.seat}; E.npcs.push(c); GM.npc[id]=c; return c; }};
  let yielded=0; const CROWD={shopMakeRoom(){ return 0; },shopYield(GM,sts){ const on=n=>n.seat&&sts.includes(n.seat); const ids=new Set(E.npcs.filter(n=>typeof n.crowd==='string'&&on(n)).map(n=>n.crowd)); E.npcs=E.npcs.filter(n=>!ids.has(n.crowd)); yielded+=ids.size; return ids.size; }};
  return {seats,E,GM,CROWD,get yielded(){ return yielded; }}; };
const tkey=st=>st.table.join(','), spread=L=>{ let m=0; for(const p of L) for(const q of L) m=Math.max(m,Math.hypot(p.x-q.x,p.z-q.z)); return Math.round(m*100)/100; };
const PARTY=['classmate_bohan','classmate_xinci','heroine_01'];
const run=(shop,n,prep)=>{ const W=world(shop), {S,ctx}=mk(); ctx.CROWD=W.CROWD; if(prep) prep(W); const P={shop,party:PARTY.slice(0,n-1),hEnd:13};
  const k=S.seatParty(W.GM,P), who=[W.E.player.seat].concat(P.party.map(id=>W.GM.npc[id]&&W.GM.npc[id].seat)).filter(Boolean);
  return {k,who,sp:spread(who),tabs:new Set(who.map(tkey)).size,W}; };
const SHOPS=Object.keys(LAY).filter(id=>(LAY[id].seats||[]).length>=4&&LAY[id].seats.every(q=>Array.isArray(q.table)));
// 1 沒人的時候＝這間店能坐得多近的基準（118牛排都是兩人桌、水上便當是吧檯：四個人本來就要併桌）
const BASE={};
{ const bad=[]; for(const shop of SHOPS) for(const n of [2,3,4]){ const cap=Math.max(...Object.values(LAY[shop].seats.reduce((m,q)=>(m[tkey(q)]=(m[tkey(q)]||0)+1,m),{}))); const r=run(shop,n); BASE[shop+n]=r; if(r.who.length!==n||r.sp>3.3||(cap>=n&&(r.tabs!==1||r.sp>2.6))||r.W.yielded) bad.push([shop,n,r.who.length,r.sp,r.tabs]); }
  check('1. '+SHOPS.length+' 間店都沒人：桌子夠大就坐同一張桌子（任兩人最遠 ≤ 2.6 m），不夠大併相鄰的桌子（≤ 3.3 m）；沒有人被趕走',SHOPS.length>=7&&!bad.length,J(bad)); }
// 2 每張桌子留一個空位，其他位子坐路人（一張桌子一組）
{ const bad=[], rows=[]; for(const shop of SHOPS) for(const n of [2,3,4]){ const r=run(shop,n,W=>{ const by={}; for(const st of W.seats) (by[tkey(st)]=by[tkey(st)]||[]).push(st); let g=0; for(const k of Object.keys(by)){ g++; by[k].slice(1).forEach(st=>W.E.npcs.push({crowd:'shop_l118_'+shop+'_'+g,seat:st})); } });
    const strangersAt=r.who.filter(st=>r.W.E.npcs.some(m=>m.crowd&&m.seat===st)).length, B=BASE[shop+n]; rows.push(shop+n+':'+r.sp+'/'+r.tabs+'桌/讓'+r.W.yielded);
    if(r.who.length!==n||r.tabs>B.tabs||r.sp>B.sp+0.6||strangersAt||new Set(r.who).size!==n) bad.push([shop,n,r.who.length,r.sp,r.tabs,'基準',B.sp,B.tabs,r.W.yielded,strangersAt]); }
  check('2. 路人把每張桌子坐到只剩一個空位：路人讓位，2～4 人坐得和沒人的時候一樣近（桌數不多於、最遠距離不超過沒人時 +0.6 m）、沒有人和路人坐同一個位子',!bad.length,J(bad)+'　'+rows.join(' ')); }
// 3 有名字的人不會被搶位；沒擋到不趕人
{ const shop='cafe2', big=Object.entries(LAY[shop].seats.reduce((m,q)=>((m[tkey(q)]=m[tkey(q)]||[]).push(q),m),{})).filter(([k,a])=>a.length>=4).map(([k])=>k);
  const r=run(shop,3,W=>{ for(const st of W.seats) if(big.includes(tkey(st))) W.E.npcs.push({charId:'zhe',seat:st}); });
  const hit=r.who.filter(st=>big.includes(tkey(st))).length;
  check('3. 大學食堂兩張四人桌都坐了有名字的人：三個人不坐到那兩桌、有名字的人都還在（'+r.W.E.npcs.filter(n=>n.charId==='zhe').length+' 位）',r.who.length===3&&hit===0&&r.W.E.npcs.filter(n=>n.charId==='zhe').length===8&&r.W.yielded===0,J([r.who.length,hit,r.sp]));
  const r2=run(shop,3,W=>{ const t=tkey(W.seats[0]); W.seats.filter(st=>tkey(st)===t).forEach(st=>W.E.npcs.push({crowd:'shop_l118_cafe2_1',seat:st})); });
  check('3. 只有一張兩人桌坐了路人、四人桌空著：不趕人，三個人坐四人桌',r2.W.yielded===0&&r2.tabs===1&&r2.who.length===3,J([r2.W.yielded,r2.tabs,r2.sp])); }
// 4
{ const C=fs.readFileSync(path.join(ROOT,'src/crowd3d.js'),'utf8'), m=/S\.shopYield=function\(GM,seats\)\{[^\n]*\n[^\n]*\n[^\n]*\n[^\n]*/.exec(C);
  check('4. crowd3d.js S.shopYield：只在進門那一刻（entering）、整組離開（L.yielded）',!!m&&/!entering/.test(m[0])&&/L\.yielded=true/.test(m[0])&&/E\.removeNPC\(n\)/.test(m[0])); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
