// 汀州路兩間店可以約人＋泡麵帶回 203 當宵夜（TZ-INVITE-SUPPER-1112；SHOP-STANDARD-BACKFILL-1112；AA_851 @ b039356f5，分支 claude/magical-albattani-bk7b4n）——不需要瀏覽器（D131）。
//   1  資料檔 src/data/tz_invite_supper.js 逐字對稿（兩間店：名字、動詞、七位答應句、入座句＋學姊另一版；宿舍那一場六句、說話的人）；匯入工具 --check；白名單
//   2  邀約地點：越好吃小館、客居雲南在吃飯那一類、有點熟以上、不用先去過；時間照店的營業時間（11:00、20:00 可以，10:00、20:30、22:00 不行）
//   3  答應的那一句：七位照稿（INV.personal）；有點熟才約得到（不太認識＝不到門檻）
//   4  兩個人坐下以後：演那個人的入座句（INV.meet 真的演一次）；學姊有點熟、朋友＝heroine_05，好朋友以上、交往中＝heroine_05_close；客居雲南沒有另一版＝都是同一句；
//      沒有自己句子的人＝照吃飯那一類一般的開場句；別的地點（洋洋）照舊
//   5  泡麵宵夜：物品有五包裝、21:00 以後、人在 203、三個室友都在才演；沒有泡麵、20:59、不在宿舍、室友沒回來、走進來還沒坐下、寒假、大二＝不演
//   6  演出來的六句和說話的人照稿；演完那一袋用掉（兩袋剩一袋、一袋＝那一格拿掉）；同一學期不再演；大一下可以再一次；一包裝的泡麵不算
//   7  舊存檔（沒有 GG3_OWN）不演、不寫存檔；index.html 載入順序；node --check
// 修改前（98e4807803）：沒有資料檔、沒有 src/tz_invite_supper3d.js、INVITE_DATA.places 沒有這兩間——這支整份跑不起來。
// 用法：node tests/tz_invite_supper_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify;
const SHA='f6aa917593'/* 舊期望 b039356f5（2026-11-12（AA_851＠f6aa917593 lawww_1112.h「203 泡麵宵夜演完推進 30 分鐘。」）：稿多 lawww_1112 三點，句子沒動）*/, PREV_SHA='b039356f5', DOC='docs/story_planning/AA_851_tz_invite_supper.json', DATA='src/data/tz_invite_supper.js';
const load=(f,n)=>{ let s=fs.readFileSync(path.join(H.ROOT,f),'utf8'); s=s.replace(new RegExp('^const '+n+'\\s*=','m'),'globalThis.'+n+'='); vm.runInThisContext(s,{filename:f}); return true; };
load('src/data/dorm_room_layout.js','DORM_ROOM'); load('src/data/dorm203_lines.js','DORM203_LINES'); load('src/dorm203_3d.js','DORM203');
load(DATA,'TZ_INVITE_SUPPER'); load('src/tz_invite_supper3d.js','TZIS');
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. （丟例外）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' | ')); } };
/* 假的生人物、坐下、走路（同 tests/aa502_dorm203_unit.js）*/
let walks=[];
const mkN=(id,x,z,o)=>{ const n={id,charId:id,name:id,obj:{position:{x,y:0,z},rotation:{y:(o&&o.yaw)||0}},pose:'idle',idlePose:'idle',lv:0}; GM.npc[id]=n; E.npcs.push(n); if(o&&o.seat) GM.sitAt(n,o.seat); return n; };
GM.spawnNPC=(id,spec,x,z,o)=>GM.npc[id]||mkN(id,x,z,o); GM.spawnCharacter=(id,x,z,o)=>GM.npc[id]||mkN(id,x,z,o);
GM.removeNPC=id=>{ const n=GM.npc[id]; if(n){ E.npcs.splice(E.npcs.indexOf(n),1); delete GM.npc[id]; } };
GM.sitAt=(n,st)=>{ n.seat=st; n.obj.position.x=st.x; n.obj.position.z=st.z; n.pose='sit'; }; GM.standUp=n=>{ n.seat=null; n.pose='idle'; };
GM.say=async(who,t)=>{ H.said.push({who:who?(who.name||String(who)):null,id:who&&who.charId||null,t:String(t).replace('{name}',H.G&&H.G.name||'祐廷')}); };
E.canStand=()=>true; E.moveTo=(n,x,z,cb)=>{ walks.push({n,x,z,cb}); return true; };
STORY._bindGM(GM);
const D=k=>STORY.dayOfKey(k), wdOf=d=>CALENDAR.dateOf(d).wd%7;
const F4={DORM_FOUR:true,introDone:true,MET_KAI:true,MET_ZHE:true};
const OWN=n=>({GG3_OWN:{tz_dongnan:{tz_dn_noodle5:n}}});
const room=(k,h,flags,zone)=>{ const G=H.fresh(k,h,zone||'dorm',Object.assign({},F4,flags||{})); walks=[]; for(const id of ['kai','zhe','classmate_bohan']){ H.rel(id,20,10,10); SOCIAL.markUp(id,9); } return G; };
const EV=id=>STORY_EVENTS.find(e=>e.id===id), evCheck=id=>{ const e=EV(id); return !!e&&EVENTS.check(e); };
const T=TZ_INVITE_SUPPER, P=id=>INV.place(id), PL=id=>T.places.find(p=>p.id===id);
const IDS=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','classmate_peishan','kexin'];
const fresh=(key,h,zone)=>{ const G=H.fresh(key,h,zone); G.invites=[]; G.stats=G.stats||{}; G.visited={}; E.zone={seats:[],spawn:{x:0,z:0,yaw:0},roomAt:()=>null}; E.npcs=[]; E.player.seat=null; E.player.busy=false; INV._now=()=>Date.now()+1e9; return G; };
const meet=async(id,pid,setup)=>{ const G=fresh('2025-10-18',12,pid); if(setup) setup(G); H.said=[];
  const iv=INV.accept(G,id,pid,G.day,12,{by:'player'}); const n={id,charId:id,obj:{position:{x:1,y:0,z:0},rotation:{y:0}},beh:'idle',pose:'idle',lv:0}; GM.npc[id]=n; E.npcs.push(n);
  await INV.meet(GM,iv,n,{sat:true}); return H.said.map(s=>s.t); };

(async()=>{
await sec(1,()=>{ let raw=null; try{ raw=cp.execFileSync('git',['show',SHA+':'+DOC],{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']}); }catch(e){}
  if(!raw) console.log('SKIP 1 讀不到稿 '+SHA+'（淺層複本：git fetch origin claude/magical-albattani-bk7b4n）');
  else { const R=JSON.parse(raw), bad=[];
    for(const r of R.invite_places){ const p=PL(r.id); if(!p){ bad.push('少 '+r.id); continue; } for(const k of ['zone','name','verb','kind','minStage']) if(p[k]!==r[k]) bad.push(r.id+'.'+k);
      for(const f of ['accept','at_table']){ const ks=Object.keys(r[f]).sort(); if(J(Object.keys(p[f]).sort())!==J(ks)||ks.some(k=>p[f][k]!==r[f][k])) bad.push(r.id+'.'+f); } }   /* 每個人那一句一字照稿（鍵的順序不比）*/
    if(J(T.supper.scene)!==J(R.dorm_supper.scene)) bad.push('dorm_supper.scene');
    check('1 兩間店（名字、動詞、答應 7＋7 句、入座 8＋7 句）、宿舍那一場六句逐字對稿',!bad.length&&T.places.length===2&&T.supper.scene.length===6,bad.join('、'));
    check('1 稿的條件寫的是 tz_dn_noodle5（資料檔 supper.item）',R.dorm_supper.when.includes(T.supper.item)&&T.supper.shop==='tz_dongnan');
    const ck=cp.spawnSync('python3',['tools/story/import_tz_invite_supper.py','--check'],{cwd:H.ROOT,encoding:'utf8'});
    if(ck.error) console.log('SKIP 1 沒有 python3（匯入工具 --check）'); else check('1 匯入工具 --check：資料檔＝稿匯出來的（走 import_guard 白名單）',ck.status===0,(ck.stdout+ck.stderr).trim().slice(0,200)); }
  const AL=JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files.filter(e=>e.path===DOC);
  check('1 白名單：一筆 approved、sha '+SHA,AL.length===1&&AL[0].status==='approved'&&AL[0].sha===SHA&&!!AL[0].approvedBy&&T.src===DOC+'@'+SHA,J(AL));
  load('src/data/tz_grocery_lines.js','TZ_GROCERY_LINES'); const g=TZ_GROCERY_LINES.tz_dongnan.grocery.goods.find(q=>q.id===T.supper.item);
  check('1 那一樣東西是東南大聯的「泡麵（五包裝）」',!!g&&g.n==='泡麵（五包裝）',J(g)); });

await sec(2,()=>{ const G=fresh('2025-10-15',10,'campus'), d=G.day;
  for(const z of ['tz_yuehaochi','tz_keju']){ const p=P(z), r=PL(z);
    check('2 '+r.name+'：在邀約地點、吃飯那一類、有點熟以上、名字和動詞照稿',!!p&&p.zone===z&&p.name===r.name&&p.verb===r.verb&&p.kind==='meal'&&p.minStage==='FAMILIAR'&&J(INV.catsOf(p))===J(['meal']),J(p));
    check('2 '+r.name+'：不用先自己去過（和洋洋、泰米一樣）',!p.show);
    check('2 '+r.name+'：時間照店的營業時間 11:00～21:00（11:00、20:00 可以；10:00、20:30、22:00 不行）',INV.slotOpen(G,p,d,11)&&INV.slotOpen(G,p,d,20)&&!INV.slotOpen(G,p,d,10)&&!INV.slotOpen(G,p,d,20.5)&&!INV.slotOpen(G,p,d,22),J([10,11,20,20.5,22].map(h=>INV.slotOpen(G,p,d,h)))); }
  check('2 原本的地點照舊（洋洋、泰米以外的 places 沒有被動到）',!!P('yangyang')&&P('yangyang').verb==='去洋洋鹹酥雞吃宵夜'&&INVITE_DATA.places.filter(p=>p.id==='tz_yuehaochi').length===1); });

await sec(3,()=>{ const G=fresh('2025-10-15',10,'campus'); const bad=[];
  for(const z of ['tz_yuehaochi','tz_keju']) for(const id of IDS){ H.FRIEND(id); const r=INV.personal(G,id,P(z),G.day+1,12,{res:'accept'}); if(!r||J(r.lines)!==J([PL(z).accept[id]])) bad.push(z+'/'+id+'：'+J(r&&r.lines)); }
  check('3 七位在兩間店的答應句照稿（14 句）',!bad.length,bad.join('；'));
  const L=SOCIAL.STAGES; check('3 門檻是有點熟（FAMILIAR）',L.indexOf(P('tz_keju').minStage)===L.indexOf('FAMILIAR')); });

await sec(4,async()=>{
  for(const [id,z] of [['heroine_01','tz_yuehaochi'],['classmate_peishan','tz_yuehaochi'],['kexin','tz_keju'],['heroine_04','tz_keju']]){ const said=await meet(id,z,()=>H.FRIEND(id));
    check('4 和 '+id+' 在'+PL(z).name+'坐下：演她的入座句',said.includes(PL(z).at_table[id])&&!INVITE_DATA.seatOpen.meal.some(L=>said.includes(L[0])),J(said)); }
  const Y=PL('tz_yuehaochi').at_table, K=PL('tz_keju').at_table;
  { const G=fresh('2025-10-18',12,'tz_yuehaochi'); H.FAMILIAR('heroine_05'); check('4 學姊有點熟＝heroine_05 那一句',TZIS.tableLine(G,'heroine_05','tz_yuehaochi')===Y.heroine_05);
    H.FRIEND('heroine_05'); check('4 學姊朋友＝還是 heroine_05',TZIS.tableLine(G,'heroine_05','tz_yuehaochi')===Y.heroine_05);
    H.CLOSE('heroine_05'); check('4 學姊好朋友（很熟）＝heroine_05_close',TZIS.tableLine(G,'heroine_05','tz_yuehaochi')===Y.heroine_05_close&&Y.heroine_05_close!==Y.heroine_05,TZIS.tableLine(G,'heroine_05','tz_yuehaochi'));
    check('4 客居雲南沒有另一版＝很熟也是同一句',TZIS.tableLine(G,'heroine_05','tz_keju')===K.heroine_05);
    H.CLOSE('heroine_01'); check('4 別人很熟不會拿到學姊那一版',TZIS.tableLine(G,'heroine_01','tz_yuehaochi')===Y.heroine_01); }
  { const G=fresh('2025-10-18',12,'tz_yuehaochi'); H.FAMILIAR('heroine_05'); G.flags.dating_heroine_05=true; check('4 學姊交往中＝heroine_05_close',TZIS.tableLine(G,'heroine_05','tz_yuehaochi')===Y.heroine_05_close); }
  { const said=await meet('heroine_05','tz_yuehaochi',()=>H.CLOSE('heroine_05')); check('4 真的演：學姊很熟，坐下說的是 close 那一句',said.includes(Y.heroine_05_close)&&!said.includes(Y.heroine_05),J(said)); }
  { const G=fresh('2025-10-18',12,'tz_yuehaochi'); check('4 沒有自己句子的人＝沒有入座句（交給吃飯那一類一般的開場句）',TZIS.tableLine(G,'classmate_xinci','tz_yuehaochi')===null&&INVITE_DATA.seatOpen.byPlace.tz_yuehaochi==='meal'&&INVITE_DATA.seatOpen.byPlace.tz_keju==='meal');
    check('4 別的地點不接（洋洋照舊）',TZIS.tableLine(G,'heroine_01','yangyang')===null&&INVITE_DATA.seatOpen.byPlace.yangyang==='yangyang'); } });

const E1='ev_tzis_supper_Y1S1', E2='ev_tzis_supper_Y1S2';
await sec(5,()=>{
  check('5 兩個事件（大一上、大一下各一個、各演一次）',!!EV(E1)&&!!EV(E2)&&EV(E1).once===true&&EV(E1).trigger==='auto'&&EV(E1).location==='dorm'&&J(EV(E1).participants)===J(['zhe','classmate_bohan','kai']));
  room('2025-10-14',23.1,OWN(1)); check('5 大一上 10/14（週二）23:06、物品有五包裝、三個人都在：演',evCheck(E1)&&!evCheck(E2),J(STORY.dormWho(H.G).map(w=>w[0])));
  H.G.hour=20.98; check('5 20:59 不演',!evCheck(E1)); H.G.hour=21.02; check('5 21:01 柏翰還沒回來（22:30 回來）：不演',!evCheck(E1)); H.G.hour=23.1;
  H.G.zone='campus'; check('5 人不在宿舍：不演',!evCheck(E1)); H.G.zone='dorm';
  STORY.dormSpawn(GM,'classmate_bohan','R1',true,'door'); check('5 柏翰正在走進來：等他坐下',!evCheck(E1)); { const w=walks.find(q=>q.n===GM.npc.classmate_bohan); if(w) w.cb(); } check('5 坐下了：演',evCheck(E1));
  { const aw=STORY.awayOnDate; STORY.awayOnDate=(id,G)=>id==='zhe'?true:aw(id,G); try{ check('5 阿哲那天不在：不演',!evCheck(E1)); } finally { STORY.awayOnDate=aw; } }
  room('2025-10-14',23.1); check('5 沒有泡麵：不演',!evCheck(E1));
  room('2025-10-14',23.1,{GG3_OWN:{tz_dongnan:{tz_dn_noodle:3}}}); check('5 只有一包裝的泡麵：不演（稿寫的是五包裝）',!evCheck(E1));
  room('2026-01-28',23.1,OWN(1)); check('5 寒假：不演',!evCheck(E1)&&!evCheck(E2));
  room('2026-03-10',23.1,OWN(1)); check('5 大一下 3/10：演的是大一下那一個',!evCheck(E1)&&evCheck(E2));
  room('2026-10-13',23.1,Object.assign({ROOM_Y2:true},OWN(1))); check('5 大二（搬出 203）：不演',!evCheck(E1)&&!evCheck(E2));
  room('2025-10-14',23.1,Object.assign({},OWN(1),{DORM_FOUR:false})); check('5 不是 203 四人房的存檔：不演',!evCheck(E1)); });

await sec(6,async()=>{
  room('2025-10-14',23.1,OWN(2)); H.said=[]; const h0=H.G.hour; await EVENTS.run(EV(E1));
  /* 2026-11-12（AA_851＠f6aa917593 lawww_1112.h「203 泡麵宵夜演完推進 30 分鐘。」）。修改前：演完時間不動 */
  check('6 演完時間往後 30 分鐘（23:06 → 23:36；資料 supper.minutes＝30，從稿的 lawww_1112.h 讀）',T.supper.minutes===30&&Math.abs(H.G.hour-(h0+0.5))<1e-9,J([h0,H.G.hour,T.supper.minutes]));
  const NAME={zhe:'阿哲',classmate_bohan:'柏翰',kai:'阿凱'};
  check('6 演出來六句，一字照稿',J(H.said.map(s=>s.t))===J(T.supper.scene.map(l=>l.text)),J(H.said.map(s=>s.t)));
  check('6 說話的人照稿（旁白、阿哲、柏翰、阿凱、旁白、阿哲）',J(H.said.map(s=>s.who))===J(T.supper.scene.map(l=>l.who?NAME[l.who]:null)),J(H.said.map(s=>s.who)));
  check('6 兩袋剩一袋',H.G.flags.GG3_OWN.tz_dongnan.tz_dn_noodle5===1,J(H.G.flags.GG3_OWN));
  check('6 同一學期不再演（還有一袋也一樣）',!evCheck(E1)&&!!H.G.events.done[E1]);
  H.G.day=D('2026-03-10'); H.G.weekday=wdOf(H.G.day); H.G.hour=23.1;   /* 另一個晚上（上面那一場演完時間往後了，這裡照原本的 23:06 再看）*/ check('6 大一下可以再一次',evCheck(E2));
  H.said=[]; await EVENTS.run(EV(E2)); check('6 最後一袋用掉＝物品那一格拿掉',!('tz_dn_noodle5' in H.G.flags.GG3_OWN.tz_dongnan)&&H.said.length===6,J(H.G.flags.GG3_OWN));
  check('6 沒有泡麵了、也演過了：不演',!evCheck(E2)); });

await sec(7,()=>{
  const G=room('2025-10-14',23.1); delete G.flags.GG3_OWN; const s0=J(G.flags); check('7 舊存檔（沒有 GG3_OWN）：不演、不寫存檔',!evCheck(E1)&&TZIS.packs(G)===0&&J(G.flags)===s0);
  G.flags.GG3_OWN='壞掉'; check('7 資料壞掉：不演、不出錯',TZIS.packs(G)===0&&!evCheck(E1));
  const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8'); const at=f=>html.indexOf('"'+f+'?');
  check('7 index.html：資料檔 → tz_invite_supper3d.js，排在 invites3d、dorm203_3d、gg3shops3d 後面',at(DATA)>0&&at('src/tz_invite_supper3d.js')>at(DATA)&&at(DATA)>at('src/invites3d.js')&&at(DATA)>at('src/dorm203_3d.js')&&at(DATA)>at('src/gg3shops3d.js'));
  const bad=[]; for(const f of ['src/tz_invite_supper3d.js',DATA]){ const r=cp.spawnSync(process.execPath,['--check',path.join(H.ROOT,f)],{encoding:'utf8'}); if(r.status!==0) bad.push(f+' '+r.stderr.slice(0,160)); }
  check('7 node --check',!bad.length,bad.join('；')); });
H.done();
})();
