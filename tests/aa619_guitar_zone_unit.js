/* AA_619 同弦樂器的按鈕（src/guitar3d.js 包住 TX3.zone.build；任務 AA619-GUITAR-1104）：不需要瀏覽器，在 Node 裡建出遊戲真正的區域 xs_tongxian（src/tongxian3d.js，LAWWW2-C），
   用引擎真正的找路與移動碰撞（E.simWalk：人物半徑 0.32 m，dt 1/30 與 0.1，走路與跑步；同 tests/tongxian_unit.js）走：
   ① src/guitar3d.js 載得到、TX3.zone.build 已經包上
   ② 建出來的區域：配置 interact 的吉他牆兩點（wall_n、wall_s）＝「看看」、櫃台（buy）＝「買東西」、烏克麗麗（ukes）＝「看看」（AA_693 A2，企劃線 c4b14a901）
      （it.guitar look／shop／ukes、半徑 0.9）；子晴 CG 的站位（try）沒有按鈕；區域原本的三個座位（試琴椅「試彈」×2、木凳「坐下」）、出口「下樓（回新生南路）」不變
   ③ 店門（進門點）走得到四個按鈕（按鈕範圍裡、站得住的一點）
   ④ 區域的座位（照座面抬高的那一份）對得到配置的 id：try_w、try_e＝試彈（GUITAR.onSeat）、counter_stool 不是
   ⑤ 再進一次店（重建區域）按鈕還是四個（不重複加）；別的區域（新生南路）沒有這些按鈕
   修改前（開發分支 ed7600ec5）：還沒有 src/tongxian3d.js、src/guitar3d.js＝載入就停（FAILED 1）；合併同弦區域（1a67c9947）以後、還沒有按鈕＝FAILED 4。修改後 ALL PASS。
   AA_693 這一輪（分支 guitar2-1105）：程式還沒改（開發分支 0f417a384，烏克麗麗沒有按鈕）＝FAILED 4（② 按鈕、② 一共幾個、③、⑤）；修改後 7 項 ALL PASS。
   ⑥ 宿舍房間的「彈吉他」按鈕（11-05 BB-C：從「看看房間裡的東西」裡面搬到房間這一層，GUITAR.dormButton）：真的 dorm 區域裡站得住、從房門走得到；
      站在按鈕上，房間原本的按鈕（坐在書桌前、睡覺、看看房間裡的東西、走出房間）和故事加的（收拾背包回家、床底下的紙箱）都不在範圍內＝出來的是「彈吉他」；站在書桌前照舊是「坐在書桌前」；沒有琴＝藏著（修改前：沒有 GUITAR.dormButton＝FAIL）
   這是模擬（證明路走得通），不是真實玩家流程（瀏覽器測試照 D131 排到使用者的電腦）。用法：node tests/aa619_guitar_zone_unit.js */
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{});   // 正式模型在 node 裡載不到（fetch 相對網址），不影響導航
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js',
  'src/data/calendar.js','src/data/places.js','src/data/xinsheng_layout.js','src/xinsheng3d.js','src/data/tongxian_layout.js','src/tongxian3d.js','src/data/dorm_room_layout.js','src/guitar3d.js'];
const miss=files.filter(f=>!fs.existsSync(path.join(ROOT,f)));
if(miss.length){ check('① 檔案都在',false,miss.join('、')); console.log('FAILED '+fails); process.exit(1); }
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
const L=TONGXIAN_LAYOUT.shop, E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
const walk=(a,b)=>{ for(const [dt,speed] of [[1/30,undefined],[0.1,undefined],[1/30,4.1],[0.1,4.1]]){ const r=E.simWalk(a[0],a[1],b[0],b[1],{lv0:0,lv1:0,dt,speed}); if(!r.ok) return Object.assign({dt:+dt.toFixed(3),speed:speed||'walk'},r); } return {ok:true}; };
const J=JSON.stringify;
const sec=(n,f)=>{ try{ f(); }catch(e){ check(n+' 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,2).join(' / ')); } };
// ①
check('① src/guitar3d.js 載得到（GUITAR）、TX3.zone.build 已經包上、Z3.ZONES.xs_tongxian 就是 TX3.zone',typeof GUITAR!=='undefined'&&TX3.zone._guitar===true&&Z3.ZONES.xs_tongxian===TX3.zone);
// ②～⑤
sec('②～⑤',()=>{
const z=loadZone('xs_tongxian'), nav=z.nav, IN=[z.spawn.x,z.spawn.z];
const btn=E.interactables.filter(q=>q.guitar), seats=E.interactables.filter(q=>q.seat), ex=E.interactables.filter(q=>q.exit);
const pt=id=>L.interact.find(q=>q.id===id);
check('② 按鈕：吉他牆 wall_n、wall_s＝「看看」、櫃台 buy＝「買東西」、烏克麗麗 ukes＝「看看」（AA_693 A2）（位置照配置、半徑 0.9）',J(btn.map(q=>[q.tongxian,q.guitar,q.label,q.x,q.z,q.radius]))===J([['wall_n','look','看看',pt('wall_n').x,pt('wall_n').z,0.9],['wall_s','look','看看',pt('wall_s').x,pt('wall_s').z,0.9],['buy','shop','買東西',pt('buy').x,pt('buy').z,0.9],['ukes','ukes','看看',pt('ukes').x,pt('ukes').z,0.9]]),J(btn));
check('② 子晴 CG 的站位（try）沒有按鈕（試彈＝坐上試琴椅）',!E.interactables.some(q=>!q.seat&&!q.exit&&Math.hypot(q.x-pt('try').x,q.z-pt('try').z)<0.05));
check('② 區域原本的座位（試琴椅「試彈」×2、木凳「坐下」）、出口「下樓（回新生南路）」不變',seats.length===3&&seats.filter(q=>q.label==='試彈').length===2&&seats.filter(q=>q.label==='坐下').length===1&&ex.length===1&&ex[0].label==='下樓（回新生南路）'&&E.interactables.length===8,J(E.interactables.map(q=>q.label)));
// ③
const near=(p,R)=>{ const out=nav.clear(p.x,p.z,0.3)?[[p.x,p.z]]:[]; for(const d of [0.3,0.5,0.7,0.85]){ if(d>R) continue; for(let a=0;a<16;a++){ const x=p.x+Math.cos(a*Math.PI/8)*d, zz=p.z+Math.sin(a*Math.PI/8)*d; if(nav.clear(x,zz,0.3)) out.push([x,zz]); } } return out; };
const bad=[]; for(const q of btn){ const c=near(q,q.radius); if(!c.length){ bad.push(q.tongxian+' 附近站不住'); continue; } if(!c.some(a=>walk(IN,a).ok)) bad.push(q.tongxian+' 走不到（候選 '+c.length+'）'); }
check('③ 店門（進門點）走得到四個按鈕（按鈕範圍 0.9 m 裡、站得住的一點）',btn.length===4&&!bad.length,bad.join('｜'));
// ④
const ids=z.seats.map(s=>[s.tongxian,GUITAR.seatId(s),!!s.lift]);
check('④ 區域的座位（照座面抬高）對得到配置的 id：try_w、try_e 是試琴椅（GUITAR.TRY_SEATS）、counter_stool 不是',ids.length===3&&ids.every(([a,b])=>a===b)&&J(GUITAR.TRY_SEATS)===J(['try_w','try_e'])&&!GUITAR.TRY_SEATS.includes('counter_stool'),J(ids));
// ⑤
const z2=loadZone('xs_tongxian'); const n2=E.interactables.filter(q=>q.guitar).length; const xz=loadZone('xinsheng'), n3=E.interactables.filter(q=>q.guitar).length;
check('⑤ 再進一次店：按鈕還是四個（不重複加）；新生南路沒有這些按鈕',n2===4&&n3===0,J([n2,n3]));
});
// ⑥ 宿舍房間的「彈吉他」
sec('⑥',()=>{
const z=loadZone('dorm'), U=DORM_ROOM.units.find(u=>u.id===(DORM_ROOM.player_unit||'L2'));
const G={zone:'dorm',stage:'law',flags:{OWN_GUITAR:'entry'}}, GMx={E,G};
const b=typeof GUITAR.dormButton==='function'?GUITAR.dormButton(GMx):null;
if(!b){ check('⑥ 有 GUITAR.dormButton、宿舍房間多一個「彈吉他」按鈕',false,'沒有 GUITAR.dormButton'); return; }
const extra=[{label:'收拾背包回家',x:z.spots.home[0],z:z.spots.home[1],radius:0.6,prio:0.3},{label:'床底下的紙箱',x:U.seat_approach[0],z:Math.round((U.desk_u[1]+U.stair_u[0])/2*1000)/1000,radius:0.45}];   /* story3d.js populate、y1fill3d.js boxSpot 加的 */
const others=E.interactables.filter(q=>q!==b).concat(extra), inR=(q,x,zz)=>Math.hypot(q.x-x,q.z-zz)<(q.radius||1.8);
check('⑥ 按鈕「彈吉他」（S.L.dormLabel）、有琴才出現',b.label==='彈吉他'&&b.hidden===false&&(G.flags.OWN_GUITAR=null,b.hidden===true)&&(G.flags.OWN_GUITAR='entry',true),J([b.label,b.x,b.z,b.radius]));
const ex=E.interactables.find(q=>q.exit), r=walk([z.spawn.x,z.spawn.z],[b.x,b.z]);
check('⑥ 按鈕的位置站得住、從房門口（出生點）走得到',E.canStand(b.x,b.z,0.3,0)&&r.ok,J(r));
check('⑥ 站在「彈吉他」上：房間原本的按鈕、背包、紙箱都不在範圍內',!others.some(q=>inR(q,b.x,b.z)),others.filter(q=>inR(q,b.x,b.z)).map(q=>q.label).join('、'));
const desk=E.interactables.find(q=>q.deskStudy), ap=desk.seat.ap||[desk.x,desk.z];
check('⑥ 站在書桌前（坐下前走到的點）照舊是「坐在書桌前」，不是「彈吉他」',!inR(b,ap[0],ap[1])&&inR(desk,ap[0],ap[1]),J(ap));
const n=GUITAR.dormButton(GMx)&&E.interactables.filter(q=>q.guitar==='dorm').length; check('⑥ 再叫一次不重複加',n===1,J(n));
});
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
