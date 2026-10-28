// 待在宿舍房間：時間到了室友自己進門、23:30 上床、早上出門（DORM203-MATES-1028；使用者 2026-10-28 01:3x「203 四人宿舍，認識阿凱、阿哲、柏翰 但我室友根本只有阿凱 第一天之後」）——不需要瀏覽器。
//   原因：阿哲 22:00～23:30、柏翰 22:30～23:30 才在房間（AA_208 2-4），程式只在「走進房間那一刻」判斷（S.populate），人在房間裡等時間到了也沒有人進門。
//   0  程式：S.populate 的宿舍房間照 S.dormWho／S.dormSpawn；refreshSchedule（每 3 秒）在宿舍房間叫 S.dormLive
//   1  S.dormWho（大一 203、DORM_FOUR、上課的學期）：21:00 阿凱；22:10 阿凱＋阿哲；22:40 再加柏翰；23:40 只剩阿凱；07:30 阿凱；09:00 沒有人
//   2  在房間等：22:00 阿哲從門口走進來（站在門口、往自己的書桌走）、走到了坐下；22:30 柏翰一樣；阿凱不動
//   3  跳時間（坐在書桌前讀書）：21:00 → 23:00 回來，阿哲、柏翰已經坐在書桌前（不演走路）
//   4  23:30：阿哲、柏翰起身走到自己的梯子、走到了拿掉（爬上舖）；阿凱還在；23:00 → 23:50 跳過去＝直接拿掉
//   5  早上 8:00 阿凱起身走向門口、走到了拿掉；7:25 → 9:00 跳過去＝直接拿掉（AA_502 改了作息以後，原本的 07:00 改 07:25：07:00 柏翰在書桌前）
//   6  走路卡住：進門走了 6 分鐘（遊戲時間）還沒到＝直接坐好；出門走了 6 分鐘還沒到＝直接拿掉
//   7  阿凱臨時不在（S.awayOnDate）：20:00 走出門；經濟系那一年（412）阿勳 18:00 走進來
//   8  不是這一套生的（8/29 搬進來那晚的場景自己生的、劇情生的）不管
// 修改前（開發分支 562a5ead9）：沒有 S.dormWho／S.dormLive——第 0 項 FAIL，接著丟例外、結束碼 1。用法：node tests/dorm_mates_live_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM,E}=H, J=JSON.stringify;
vm.runInThisContext(fs.readFileSync(path.join(H.ROOT,'src/data/dorm_room_layout.js'),'utf8').replace(/^const DORM_ROOM\s*=/m,'globalThis.DORM_ROOM='),{filename:'src/data/dorm_room_layout.js'});
const src=fs.readFileSync(path.join(H.ROOT,'src/story3d.js'),'utf8');
check('0. 有 S.dormWho、S.dormSpawn、S.dormLive',typeof STORY.dormWho==='function'&&typeof STORY.dormSpawn==='function'&&typeof STORY.dormLive==='function');
{ const pop=src.slice(src.indexOf('S.populate=function'),src.indexOf('S.populate=function')+60000), rs=src.slice(src.indexOf('function refreshSchedule(GM)'),src.indexOf('function refreshSchedule(GM)')+3000);
  check('0. S.populate 的宿舍房間照 S.dormWho／S.dormSpawn（沒有另外一套時間）；refreshSchedule 在宿舍房間叫 S.dormLive',/if\(zoneId==='dorm'\)\{ for\(const \[id,u\] of S\.dormWho\(G\)\) S\.dormSpawn\(GM,id,u,false\);/.test(pop)&&!/S\.dormMates\(G\)\) if\(hr>=from/.test(pop)&&/zoneId==='dorm'\)\{ try\{ S\.dormLive\(GM\)/.test(rs)); }

/* 假的生人物、坐下、走路（E.moveTo 先記下來，測試決定走到了沒有）*/
let walks=[];
const mkN=(id,x,z,o)=>{ const n={id,charId:id,name:id,obj:{position:{x,y:0,z},rotation:{y:(o&&o.yaw)||0}},pose:'idle',idlePose:'idle',lv:0}; GM.npc[id]=n; E.npcs.push(n); if(o&&o.seat) GM.sitAt(n,o.seat); return n; };
GM.spawnNPC=(id,spec,x,z,o)=>GM.npc[id]||mkN(id,x,z,o);
GM.spawnCharacter=(id,x,z,o)=>GM.npc[id]||mkN(id,x,z,o);
GM.removeNPC=id=>{ const n=GM.npc[id]; if(n){ E.npcs.splice(E.npcs.indexOf(n),1); delete GM.npc[id]; } };
GM.sitAt=(n,st)=>{ n.seat=st; n.obj.position.x=st.x; n.obj.position.z=st.z; n.pose='sit'; };
GM.standUp=n=>{ n.seat=null; n.pose='idle'; };
E.canStand=()=>true; E.moveTo=(n,x,z,cb)=>{ walks.push({n,x,z,cb}); return true; };
const U=id=>DORM_ROOM.units.find(q=>q.id===id);
const day='2025-10-08';   /* 大一上第 4 週（三）*/
const room=(h,flags)=>{ const G=H.fresh(day,h,'dorm',Object.assign({DORM_FOUR:true},flags||{})); walks=[]; return G; };
const who=()=>STORY.dormWho(H.G).map(w=>w[0]);
const live=h=>{ if(h!=null) H.G.hour=h; return STORY.dormLive(GM); };
const ids=()=>Object.keys(GM.npc).sort();
const arrive=n=>{ const w=walks.find(q=>q.n===n); if(w){ walks.splice(walks.indexOf(w),1); w.cb(); } return !!w; };
const seated=(id,u)=>{ const n=GM.npc[id], s=STORY.dormSeat(u); return !!n&&n.pose==='sit'&&!!n.seat&&Math.abs(n.seat.x-s.x)<1e-6&&Math.abs(n.seat.z-s.z)<1e-6; };

/* ---- 1 S.dormWho ---- */
{ room(21); const a=who(); H.G.hour=22.17; const b=who(); H.G.hour=22.67; const c=who(); H.G.hour=23.67; const d=who(); H.G.hour=24+7.5; const e=who(); H.G.hour=24+9; const f=who();
  check('1. 21:00 阿凱；22:10 阿凱＋阿哲；22:40 再加柏翰；23:40 只剩阿凱；07:30 阿凱；09:00 沒有人',J([a,b,c,d,e,f])===J([['kai'],['kai','zhe'],['kai','zhe','classmate_bohan'],['kai'],['kai'],[]]),J([a,b,c,d,e,f])); }
{ const G=room(22.7); G.flags.DORM_FOUR=false; check('1. 沒有 DORM_FOUR（舊存檔、兩人房的時候）：只有阿凱',J(who())===J(['kai']),J(who())); }

/* ---- 2 在房間等 ---- */
{ room(21.9); live(); const kai=GM.npc.kai;
  check('2. 21:54 進房間（populate 一樣）：阿凱已經坐在書桌前，沒有走路',!!kai&&seated('kai','R2')&&walks.length===0&&J(ids())===J(['kai']),J(ids()));
  live(21.98); check('2. 21:59：阿哲還沒回來',J(ids())===J(['kai']));
  live(22.01); const z=GM.npc.zhe, w=walks.find(q=>q.n===z);
  check('2. 22:00：阿哲從門口走進來（站在門口、往自己的書桌 L1 走）',!!z&&!z.seat&&z.obj.position.z>=2.3&&Math.abs(z.obj.position.x)<0.1&&!!w&&Math.abs(w.x-U('L1').seat_approach[0])<1e-6&&Math.abs(w.z-U('L1').seat_approach[1])<1e-6&&z.dorm==='L1',J({pos:z&&z.obj.position,to:w&&[w.x,w.z]}));
  arrive(z); check('2. 走到了：坐在自己的書桌前',seated('zhe','L1'));
  live(22.3); check('2. 22:18：柏翰還沒回來；阿哲不會再生一個',J(ids())===J(['kai','zhe'])&&walks.length===0);
  live(22.51); const b=GM.npc.classmate_bohan; check('2. 22:30：柏翰走進來（往 R1）',!!b&&!b.seat&&walks.some(q=>q.n===b&&Math.abs(q.x-U('R1').seat_approach[0])<1e-6));
  arrive(b); check('2. 柏翰坐好；阿凱沒動',seated('classmate_bohan','R1')&&seated('kai','R2')&&GM.npc.kai===kai); }

/* ---- 3 跳時間 ---- */
{ room(21); live(); live(23); check('3. 21:00 → 23:00（坐在書桌前讀書）：阿哲、柏翰已經坐在書桌前，不演走路',seated('zhe','L1')&&seated('classmate_bohan','R1')&&walks.length===0,J(ids())); }

/* ---- 4 23:30 上床 ---- */
{ room(23.2); live(); check('4. 23:12 進房間：三個人都在書桌前',seated('kai','R2')&&seated('zhe','L1')&&seated('classmate_bohan','R1'));
  live(23.52); const z=GM.npc.zhe, b=GM.npc.classmate_bohan, wz=walks.find(q=>q.n===z), wb=walks.find(q=>q.n===b);
  check('4. 23:31：阿哲、柏翰起身、走到自己的梯子（上舖的位置）',!!z&&!z.seat&&!!wz&&Math.abs(wz.x-U('L1').sleep[0])<1e-6&&Math.abs(wz.z-U('L1').sleep[1])<1e-6&&!!wb&&Math.abs(wb.x-U('R1').sleep[0])<1e-6,J({wz:wz&&[wz.x,wz.z],wb:wb&&[wb.x,wb.z]}));
  live(23.55); check('4. 還在走：不會又被叫一次',walks.length===2);
  arrive(z); arrive(b); check('4. 走到了：拿掉（爬上舖）；阿凱還在書桌前',J(ids())===J(['kai'])&&seated('kai','R2'),J(ids()));
  live(23.6); check('4. 之後不會再進來',J(ids())===J(['kai'])); }
{ room(23); live(); live(23.84); check('4. 23:00 → 23:50（跳過去）：阿哲、柏翰直接拿掉、不演走路',J(ids())===J(['kai'])&&walks.length===0,J(ids())); }

/* ---- 5 早上 ----
   AA_502 第 1 節（2026-10-28）改了 203 的作息：平日柏翰 06:40～07:20 在書桌前、阿凱週二週四 07:00～08:00（STORY.r203Plan），07:00 柏翰在、阿凱剛起床——
   原本「07:00 進房間只有阿凱」改成 07:25（週四）進房間；測的東西不變：阿凱早上在書桌前、08:00 起身出門、跳過去直接拿掉。新作息自己的測試在 tests/aa502_dorm203_unit.js */
{ room(24+7+25/60); live(); check('5. 07:25（週四）進房間：阿凱在書桌前，阿哲還在上舖、柏翰 07:20 已經出門（AA_502）',J(ids())===J(['kai'])&&seated('kai','R2'),J(ids()));
  live(24+8.02); const k=GM.npc.kai, w=walks.find(q=>q.n===k);
  check('5. 08:01：阿凱起身走向門口',!!k&&!k.seat&&!!w&&w.z>2.5,J(w&&[w.x,w.z]));
  arrive(k); check('5. 走到門口：拿掉（出門了）',J(ids())===J([])); }
{ room(24+7+25/60); live(); live(24+9); check('5. 07:25 → 09:00（跳過去）：阿凱直接拿掉',J(ids())===J([])&&walks.length===0); }

/* ---- 6 走路卡住 ---- */
{ room(21.95); live(); live(22.01); const z=GM.npc.zhe; live(22.05); check('6. 進門走了 2 分鐘還沒到：照樣走',!!z&&!z.seat);
  live(22.13); check('6. 走了 7 分鐘還沒到：直接坐好',seated('zhe','L1')); }
{ room(23.4); live(); live(23.52); live(23.6); check('6. 上床走了 5 分鐘：還在',!!GM.npc.zhe); live(23.65); check('6. 走了 8 分鐘還沒到：直接拿掉',!GM.npc.zhe&&!GM.npc.classmate_bohan&&!!GM.npc.kai,J(ids())); }

/* ---- 7 臨時不在、經濟系 ---- */
{ room(19); live(); const aw=STORY.awayOnDate; STORY.awayOnDate=(id,G)=>id==='kai'?true:aw(id,G);
  try{ live(20); const k=GM.npc.kai, w=walks.find(q=>q.n===k); check('7. 阿凱臨時不在（約會、回家）：20:00 起身走出門',!!k&&!k.seat&&!!w&&w.z>2.5); arrive(k); check('7. 走到門口：拿掉；不會再進來',(live(20.2),!GM.npc.kai)); }
  finally{ STORY.awayOnDate=aw; } }
{ const G=room(17.9,{E01_DONE:true}); G.stage='econ'; G.flags.DORM_FOUR=false; live(); check('7. 經濟系那一年 17:54：阿勳還沒回來',J(ids())===J([]));
  live(18.01); const x=GM.npc.econ_zhengxun; check('7. 18:00：阿勳從門口走進來（R2）',!!x&&!x.seat&&walks.some(q=>q.n===x&&Math.abs(q.x-U('R2').seat_approach[0])<1e-6)&&x.dorm==='R2'); arrive(x); check('7. 坐好',seated('econ_zhengxun','R2')); }

/* ---- 8 不是這一套生的 ---- */
{ room(21); GM.spawnCharacter('zhe',0,0,{seat:STORY.dormSeat('L1')}); live(); check('8. 劇情自己生的阿哲（沒有 n.dorm，21:00 不在時段裡）：不會被叫出門',!!GM.npc.zhe&&seated('zhe','L1')&&walks.length===0);
  live(23.6); check('8. 23:36 也不管（照劇情原本的樣子）',!!GM.npc.zhe); }
H.done();
