// 總圖 B1 的劇情接線（CLOSED-SPACES-1023 第 2 項；AA_399 第 2 節）——不需要瀏覽器。src/b1story3d.js
//   1  國考讀書會的集合點在 B1 討論室 2；阿哲、柏翰、Alison（認識的才在）19:30～22:00 坐在討論室 2；人在 B1 時 B1 的底圖換成模糊的 3D
//   2  考古題小組（ev_bohan_group_session）換到 B1 討論室 1 演：柏翰站在白板前、芯慈坐著；演完回到原本的地方；在家、騎車照舊 2D
//   3  期末前的夜：期末考前兩週 22:00～02:00 柏翰坐在自習室 study_night；23:30～24:00 祐廷在自習室裡：「十一點四十。你還有二十分鐘可以決定要不要回宿舍。」一學期一次
//   4  大廳 22:00 關門以後：校園的總圖門口可以從側門下 B1；人在 B1，樓梯間出口改走側門回校園；休學（Y0_LEFT）不能刷
//   5  自助借還書機（借、還）、還書口（只能還）
// 修改前（開發分支 791685e10）：沒有 src/b1story3d.js、act_bar_study 在 library_hall——FAIL。用法：node tests/b1story_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM,E}=H, J=JSON.stringify;
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(B1S|LIBRARY_B1_LAYOUT|LOANS|R2Y4B)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/library_b1_layout.js','src/data/r2y4b_events.js','src/r2y4b3d.js','src/loans3d.js']) try{ load(f); }catch(e){ console.log('載入失敗 '+f+'：'+e); }
let ok=true, err=''; try{ load('src/b1story3d.js'); }catch(e){ ok=false; err=String(e); }
const X=()=>typeof B1S!=='undefined'?B1S:null;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
GM.spawnCharacter=(id,x,z,o)=>{ const n={id,obj:{position:{x,y:0,z},rotation:{y:(o&&o.yaw)||0}},seat:o&&o.seat||null,pose:(o&&o.pose)||'idle'}; GM.npc[id]=n; return n; };
GM.removeNPC=id=>{ delete GM.npc[id]; };
const LAY=()=>LIBRARY_B1_LAYOUT, room=id=>LAY().rooms.find(r=>r.id===id), inRoom=(id,x,z)=>{ const r=room(id); return x>r.x0&&x<r.x1&&z>r.z0&&z<r.z1; };
const meet=id=>{ SOCIAL.rel(id).fam=25; SOCIAL.remember(id,'FIRST_MET',''); };
const dayOf=(term,week,wd)=>{ for(let d=STORY.dayOfKey('2025-09-01');d<STORY.dayOfKey('2029-07-01');d++){ const t=CALENDAR.termOf(d); if(t&&t.id===term&&t.week===week&&CALENDAR.dateOf(d).wd===wd) return d; } return null; };
const keyOf=d=>CALENDAR.dateOf(d).key;
const stand=(x,z)=>{ E.player.obj.position.x=x; E.player.obj.position.z=z; };

(async()=>{
await sec(0,()=>{ const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
  check('0. src/b1story3d.js 載得到、index.html 接在 fit3d.js 後面',ok&&!!X()&&/fit3d\.js\?v=[^"]+"><\/script>\n<script src="src\/b1story3d\.js/.test(html),err);
  const A=ACTIVITIES.list.find(a=>a.id==='act_bar_study');
  check('0. 國考讀書會的集合點：library_b1、討論室 2 裡面',!!A&&A.zone==='library_b1'&&inRoom('disc2',A.spot.x,A.spot.z)&&/討論室 2/.test(A.desc),A&&J([A.zone,A.spot]));
  check('0. OUT.STAGE、STORY.TICKS 接上',OUT.STAGE.includes(X().outingStage)&&STORY.TICKS.includes(X().tick)&&!!STORY._b1Interact&&!!STORY._b1Populate); });
if(!X()){ H.done(); return; }
const W=STORY.termWeeks('Y1S1'), dSoon=dayOf('Y1S1',W-1,3), dFinal=dayOf('Y1S1',W,3), dMid=dayOf('Y1S1',5,3), dSoon2=dayOf('Y1S2',STORY.termWeeks('Y1S2')-2,2);

await sec(1,()=>{ check('1. 期末考前兩週：第 W-2、W-1 週是；第 W 週（考試週）、第 5 週不是',X().examSoon(dayOf('Y1S1',W-2,1))&&X().examSoon(dSoon)&&!X().examSoon(dFinal)&&!X().examSoon(dMid),W);
  check('1. CALENDAR.examSoon 有了（LB1 背景的同學加倍讀這個）',typeof CALENDAR.examSoon==='function'&&CALENDAR.examSoon(dSoon)); });

await sec(2,()=>{ H.fresh(keyOf(dSoon),22,'library_b1'); meet('classmate_bohan');
  check('2. 期末考前兩週 22:00、認識柏翰：期末前的夜',X().nightOn(H.G));
  H.G.hour=25; check('2. 同一天 25:00（凌晨一點）照樣',X().nightOn(H.G));
  H.G.hour=26; check('2. 26:00（兩點）結束',!X().nightOn(H.G));
  H.G.day=dSoon+1; H.G.hour=1; check('2. 換日以後的 01:00（前一晚算）照樣',X().nightOn(H.G));
  H.G.day=dSoon; H.G.hour=21.5; check('2. 21:30 還沒',!X().nightOn(H.G));
  H.fresh(keyOf(dSoon),22,'library_b1'); check('2. 不認識柏翰：沒有',!X().nightOn(H.G));
  H.fresh(keyOf(dMid),22,'library_b1'); meet('classmate_bohan'); check('2. 平常的週：沒有',!X().nightOn(H.G)); });

await sec(3,async()=>{ H.fresh(keyOf(dSoon),22.2,'library_b1'); meet('classmate_bohan');
  X().placeNight(GM,true); const n=GM.npc.classmate_bohan, s=LAY().spots.study_night;
  check('3. 進 B1：柏翰已經坐在自習室 study_night（讀書）',!!n&&n.b1Night&&!!n.seat&&Math.abs(n.seat.x-s.x)<0.01&&Math.abs(n.seat.z-s.z)<0.01&&n.pose==='read'&&inRoom('study24',n.seat.x,n.seat.z));
  stand(0.6,-4); H.G.hour=23.2; check('3. 23:12 還不說',!X().lineDue(GM));
  H.G.hour=23.6; stand(-10,0); check('3. 23:36 人在門廳（不在自習室）：不說',!X().lineDue(GM));
  stand(0.6,-4); check('3. 23:36 人在自習室：要說',X().lineDue(GM));
  X().tick(GM); await new Promise(r=>setTimeout(r,10));
  check('3. 「十一點四十。你還有二十分鐘可以決定要不要回宿舍。」（柏翰）',H.said.some(x=>x.t==='十一點四十。你還有二十分鐘可以決定要不要回宿舍。'&&/柏翰/.test(x.who)),J(H.lines()));
  check('3. 同一學期不再說',!X().lineDue(GM)&&(H.G.day=dSoon+1,H.G.hour=23.6,!X().lineDue(GM)));
  H.G.day=dSoon2; H.G.hour=23.6; check('3. 下一學期的期末前：再一次',X().lineDue(GM),keyOf(dSoon2));
  H.G.day=dMid; H.G.hour=23.6; X().tick(GM); check('3. 不是期末前的夜：tick 讓他離開',!GM.npc.classmate_bohan);
  H.fresh(keyOf(dSoon),22.2,'library_b1'); meet('classmate_bohan'); GM.npc.classmate_bohan={id:'classmate_bohan',seat:null}; check('3. 作息已經讓他在這裡：不另外放人、不說那一句（不是 b1Night）',!X().placeNight(GM,true)&&(H.G.hour=23.6,stand(0.6,-4),!X().lineDue(GM))); });

await sec(4,()=>{ H.fresh('2029-03-01',19.6,'library_b1',{Y4_PATH:'bar'}); meet('zhe'); meet('classmate_bohan');
  const k=X().placeBar(GM); const ids=Object.keys(GM.npc).sort();
  check('4. 國考讀書會那天 19:36：阿哲、柏翰坐在討論室 2；不認識的 Alison 不在',k===2&&J(ids)===J(['classmate_bohan','zhe'])&&ids.every(id=>inRoom('disc2',GM.npc[id].seat.x,GM.npc[id].seat.z)),J(ids));
  H.fresh('2029-03-01',19,'library_b1',{Y4_PATH:'bar'}); meet('zhe'); check('4. 19:00 還沒',X().placeBar(GM)===0);
  H.fresh('2029-03-02',20,'library_b1',{Y4_PATH:'bar'}); meet('zhe'); check('4. 不是那幾個週四：沒有',X().placeBar(GM)===0);
  H.fresh('2029-03-01',20,'library_b1',{Y4_PATH:'grad'}); meet('zhe'); check('4. 沒有要考國考（Y4_PATH grad）：沒有',X().placeBar(GM)===0);
  const g0=global.GAME; global.GAME={get G(){ return H.G; }};   /* OUT.bg 看 GAME.G 的區域 */
  H.fresh('2029-03-01',20,'library_b1',{Y4_PATH:'bar'}); check('4. 人在 B1：ntu_lib_b1、library_b1 的底圖＝模糊的 3D',OUT.bg('ntu_lib_b1')==='blur'&&OUT.bg('library_b1')==='blur');
  H.G.zone='library_hall'; check('4. 不在 B1：照舊是圖',OUT.bg('ntu_lib_b1')!=='blur'&&!!OUT.bg('ntu_lib_b1').image); global.GAME=g0; });

await sec(5,async()=>{ global.Z3={ZONES:{library_b1:{},dorm:{},campus:{}}}; H.fresh('2027-09-11',15.8,'dorm'); stand(1,2);
  const ev=STORY_EVENTS.find(e=>e.id==='ev_bohan_group_session'); const stg=await X().outingStage(GM,{id:'bohan_group_x'},ev);
  const bh=GM.npc.classmate_bohan, xc=GM.npc.classmate_xinci, hd=LAY().spots.disc1_head;
  check('5. 考古題小組：換到 library_b1 演',!!stg&&H.entered.includes('library_b1')&&H.G.zone==='library_b1');
  check('5. 柏翰站在討論室 1 的白板前、芯慈坐在討論室 1',!!bh&&Math.abs(bh.obj.position.x-hd.x)<0.01&&Math.abs(bh.obj.position.z-hd.z)<0.01&&!bh.seat&&!!xc&&!!xc.seat&&inRoom('disc1',xc.seat.x,xc.seat.z));
  check('5. 演的時候 library_b1 的底圖＝模糊的 3D',OUT.bg('library_b1')==='blur');
  await stg.restore(); check('5. 演完回到原本的地方（宿舍）',H.G.zone==='dorm'&&!X().staged&&OUT.bg('library_b1')!=='blur');
  H.fresh('2027-09-11',15.8,'dorm'); E.player.riding=true; check('5. 騎著車：照舊 2D',!(await X().outingStage(GM,{},ev))); E.player.riding=false;
  check('5. 別的出遊不換',!(await X().outingStage(GM,{},{id:'ev_tutor_lesson'}))); });

await sec(6,async()=>{ H.fresh('2027-10-05',22.5,'campus'); H.picks=[0];
  await STORY.interact({exit:{to:'library_hall'},b1Door:true,label:'進入總圖'},GM);
  check('6. 22:30 總圖門口：「從側門下 B1」→ 到 B1 的樓梯間門口',H.entered.includes('library_b1')&&H.opts.some(o=>o.includes('從側門下 B1')),J(H.opts));
  H.fresh('2027-10-05',22.5,'campus'); H.picks=[1]; await STORY.interact({exit:{to:'library_hall'},b1Door:true},GM); check('6. 「先不要」：不進去',!H.entered.length);
  H.fresh('2024-12-05',23,'campus',{Y0_LEFT:true}); H.G.stage='econ'; await STORY.interact({exit:{to:'library_hall'},b1Door:true},GM); check('6. 休學的那一年：刷不進去',!H.entered.length&&H.opts.some(o=>o.some(t=>/沒有學生證/.test(t))));
  H.fresh('2027-10-05',23,'library_b1'); await STORY.interact({exit:{to:'library_hall'},b1Stairs:true},GM); check('6. 人在 B1、大廳關了：樓梯間出口走側門回校園',H.entered[0]==='campus');
  H.fresh('2027-10-05',15,'library_b1'); const r=await STORY.interact({exit:{to:'library_hall'},b1Stairs:true},GM); check('6. 白天：照舊上 1F 大廳（交給原本的出口）',!H.entered.length&&!r); });

await sec(7,async()=>{ H.fresh('2027-10-05',15,'library_b1'); LOANS.know(H.G,'L1'); H.picks=[0];
  await STORY.interact({id:'selfcheck',b1Machine:'all',label:'自助借還書機'},GM);
  check('7. 自助借還書機：借得到知道的那本',LOANS.rec(H.G).length===1&&LOANS.rec(H.G)[0].book==='L1',J(H.opts));
  H.opts=[]; H.picks=[0]; await STORY.interact({id:'return_slot',b1Machine:'ret',label:'還書口'},GM);
  check('7. 還書口：只有「還」，還了',LOANS.rec(H.G).length===0&&H.opts[0].every(t=>!/^借/.test(t))&&LOANS.returned(H.G,'L1')===H.G.day);
  H.opts=[]; const r=await STORY.interact({id:'return_slot',b1Machine:'ret',label:'還書口'},GM); check('7. 沒有要還的書：還書口交給原本的「看」',!r&&!H.opts.length); });

H.done();
})();
