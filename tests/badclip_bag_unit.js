// 打羽球不背包（BADCLIP-BAG-1027；使用者 2026-10-27 22:4x 問 BB-C「打羽球男主角還背著背包什麼意思」，BB-C 讀程式轉 LAWWW-C）——不需要瀏覽器。
//   羽球小短片（src/badminton_clip3d.js）開演時，祐廷和對手身上帶著的東西（後背包、托特包、吉他、資料夾、圍裙、安全帽…）先拿下來（CHAR.carryOff，src/character3d.js），
//   演完照原本的開關還原；按「跳過」、短片中途出錯也還原；眼鏡、耳環、髮圈不動。
//   1  CHAR.carryOff：拿下來（propOn＝false、看不到）、還原（原本沒設過的拿掉設定、照原本看不看得到；原本設過的照原本的值）；中途換過模型（還原時傳新的人物）照新的那一個還原
//   2  短片演到一半：祐廷的後背包、語彤的後背包看不到（propOn false，character3d.js 每一格照這個藏）；以安的托特包、學姊的資料夾也看不到；學姊的髮圈、芷若的眼鏡照舊
//   3  演完：全部照原本（芷若在咖啡廳上班的圍裙 propOn true 照舊 true）；按「跳過」、中途出錯也一樣
// 修改前（開發分支 b0602348f）：0 FAIL（沒有 CHAR.carryOff），接著第 1 節丟例外、結束碼 1。用法：node tests/badclip_bag_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.location={search:''}; global.navigator={userAgent:'node'};
for(const f of ['lib/three.bundle.js','src/data/gym_layout.js']){ let s=fs.readFileSync(path.join(ROOT,f),'utf8'); s=s.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); }
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails++; };
const J=JSON.stringify;
/* CHAR：從 src/character3d.js 抽出 setProp、CARRY、carryOff 原樣執行（整個 character3d.js 要 VRM 函式庫）*/
const CS=fs.readFileSync(path.join(ROOT,'src/character3d.js'),'utf8');
const grab=re=>{ const m=CS.match(re); return m?m[0]:''; };
const code=[grab(/\n  C\.setProp=function[^\n]*\n/),grab(/\n  C\.CARRY=[^\n]*\n/),grab(/\n  C\.carryOff=function[\s\S]*?\} \}; \};\n/)].join('');
global.CHAR={}; try{ vm.runInThisContext('(function(C){'+code+'})(CHAR);'); }catch(e){ console.log('抽 character3d.js 失敗',e.message); }
check('0. 抽得到 CHAR.setProp、CHAR.carryOff',typeof CHAR.setProp==='function'&&typeof CHAR.carryOff==='function');
/* 假的人物：root.userData.props＝配件（名字照 character3d.js MODEL_PROPS）；vrm.humanoid 有右手（球拍掛得上去）*/
const person=(names,propOn)=>{ const root=new THREE.Group(), hand=new THREE.Object3D(); hand.position.set(0.3,1.0,0); root.add(hand);
  const props={}; for(const n of names){ const o=new THREE.Object3D(); o.name=n; props[n]=o; root.add(o); }
  if(propOn) for(const k in propOn){ props[k].visible=!!propOn[k]; }
  root.userData={props,propOn:propOn?Object.assign({},propOn):undefined,vrm:{humanoid:{getRawBoneNode:b=>b==='rightHand'?hand:null}}}; if(!root.userData.propOn) delete root.userData.propOn; return root; };
const vis=h=>{ const o={}; for(const k in h.userData.props) o[k]=h.userData.props[k].visible; return o; };
const pon=h=>Object.assign({},h.userData.propOn||{});

/* ---- 1 CHAR.carryOff ---- */
{ const h=person(['backpack','glasses']); const r=CHAR.carryOff(h); const mid=[vis(h),pon(h)]; r(); const end=[vis(h),pon(h)];
  check('1. 拿下來：後背包 propOn false、看不到；眼鏡不動',J(mid)===J([{backpack:false,glasses:true},{backpack:false}]),J(mid));
  check('1. 還原：原本沒設過＝拿掉設定（character3d.js 每一格照坐著與否決定）、看得到',J(end)===J([{backpack:true,glasses:true},{}]),J(end));
  const a=person(['apron','glasses'],{apron:true}); const ra=CHAR.carryOff(a); const am=[vis(a),pon(a)]; ra(); const ae=[vis(a),pon(a)];
  check('1. 芷若上班的圍裙（propOn true）：演的時候拿下來、演完照舊 true',J(am)===J([{apron:false,glasses:true},{apron:false}])&&J(ae)===J([{apron:true,glasses:true},{apron:true}]),J({am,ae}));
  const b=person(['guitar'],{guitar:false}); const rb=CHAR.carryOff(b); rb(); check('1. 原本就藏起來的（propOn false）：還原後照舊 false',J([vis(b),pon(b)])===J([{guitar:false},{guitar:false}]));
  const old=person(['backpack']); const ro=CHAR.carryOff(old); const nu=person(['backpack']); nu.userData.propOn={backpack:false}; nu.userData.props.backpack.visible=false; ro(nu);   /* C.upgrade 換模型時帶過去的 propOn */
  check('1. 中途換過模型：還原時傳新的人物，照新的那一個還原（不會一直藏著）',J([vis(nu),pon(nu)])===J([{backpack:true},{}]),J([vis(nu),pon(nu)]));
  check('1. 沒有配件的人物不出錯',(()=>{ try{ const r=CHAR.carryOff(new THREE.Group()); r(); CHAR.carryOff(null)(); return true; }catch(e){ return false; } })()); }

/* ---- 2、3 短片演一次 ---- */
let fakeNow=0, rafHook=null; global.performance={now:()=>fakeNow}; global.requestAnimationFrame=f=>setImmediate(()=>{ fakeNow+=250; if(rafHook) rafHook(); f(fakeNow); });
global.setTimeout=global.setTimeout;
let skipBtn=null; global.document={body:{appendChild(){}},createElement:()=>{ const b={style:{},listeners:{},addEventListener(t,f){ this.listeners[t]=f; },remove(){},parentNode:null}; skipBtn=b; return b; },getElementById:()=>null};
{ let s=fs.readFileSync(path.join(ROOT,'src/badminton_clip3d.js'),'utf8'); s=s.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(s,{filename:'src/badminton_clip3d.js'}); }
const mkE=()=>{ const scene=new THREE.Scene(); const cam=new THREE.PerspectiveCamera(); return {scene,camera:cam,cam:{look:new THREE.Vector3(),cine:null},cinematic(p,l){ this.cam.cine={pos:p.clone(),look:l.clone()}; },endCinematic(){ this.cam.cine=null; }}; };
const ent=h=>({obj:h,pose:'idle',frozen:false,path:null});
const play=async(pid,names,opts,o)=>{ o=o||{}; const E=mkE(), me=person(['backpack']), her=person(names,o.propOn); E.scene.add(me); E.scene.add(her); E.player=ent(me); const P2=ent(her);
  const GM={E,npc:{[pid]:P2},sceneBegin(){},sceneEnd(){}}; const before=[[vis(me),pon(me)],[vis(her),pon(her)]]; let mid=null, n=0;
  rafHook=()=>{ n++; if(n===6&&!mid) mid=[[vis(me),pon(me)],[vis(her),pon(her)]]; if(o.skipAt&&n===o.skipAt&&skipBtn&&skipBtn.listeners.click) skipBtn.listeners.click(); };
  if(o.throwAt){ let c=0; const c0=E.cinematic; E.cinematic=function(p,l){ if(++c===o.throwAt) throw new Error('測試：中途出錯'); return c0.call(this,p,l); }; }   /* 第 N 次切鏡頭丟例外（短片的 try 裡面）*/
  let ret; try{ ret=await BADCLIP.play(GM,Object.assign({who:pid},opts||{})); }catch(e){ ret='threw'; }
  rafHook=null; return {before,mid,after:[[vis(me),pon(me)],[vis(her),pon(her)]],ret,n}; };
(async()=>{
  const r3=await play('heroine_03',['backpack'],{full:true});
  check('2. 語彤：演到一半祐廷、語彤的後背包都拿下來（propOn false）',!!r3.mid&&J(r3.mid)===J([[{backpack:false},{backpack:false}],[{backpack:false},{backpack:false}]]),J(r3.mid));
  check('3. 語彤：演完兩個人照原本（後背包回來、propOn 沒有留下設定）',J(r3.after)===J(r3.before)&&r3.ret===true,J({after:r3.after,ret:r3.ret}));
  const r1=await play('heroine_01',['tote'],{full:true}), r5=await play('heroine_05',['folder','hairtie'],{full:true}), r2=await play('heroine_02',['glasses','earrings','apron'],{full:true},{propOn:{apron:true}});
  check('2. 以安的托特包、學姊的資料夾拿下來；學姊的髮圈、芷若的眼鏡耳環不動；芷若上班的圍裙拿下來',!!r1.mid&&r1.mid[1][0].tote===false&&!!r5.mid&&r5.mid[1][0].folder===false&&r5.mid[1][0].hairtie===true&&!!r2.mid&&r2.mid[1][0].glasses===true&&r2.mid[1][0].earrings===true&&r2.mid[1][0].apron===false,J({r1:r1.mid,r5:r5.mid,r2:r2.mid}));
  check('3. 以安、學姊、芷若：演完照原本（圍裙 propOn true 照舊）',J(r1.after)===J(r1.before)&&J(r5.after)===J(r5.before)&&J(r2.after)===J(r2.before)&&r2.after[1][1].apron===true,J({r2:r2.after}));
  const rs=await play('heroine_03',['backpack'],{full:true},{skipAt:8});
  check('3. 按「跳過」：還原（回傳 false＝跳過）',rs.ret===false&&J(rs.after)===J(rs.before),J({ret:rs.ret,after:rs.after}));
  const rt=await play('classmate_bohan',['glasses','backpack'],{full:true},{throwAt:2});
  check('3. 中途出錯：還原（柏翰的後背包、祐廷的後背包回來）',J(rt.after)===J(rt.before),J({ret:rt.ret,after:rt.after}));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
