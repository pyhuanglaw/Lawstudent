// 爬宿舍上舖的梯子：兩手抓扶手（sleep_scene.grips）、兩腳踩在踏階上（CLIMB-GRIPS-FEET-1105）——不需要瀏覽器。
// 起因：LAWWW2 DORM-LADDER-HEAD-GRIP-1102 ② 加了靠床那一側的扶手和每一階兩手抓的點；CLIMB-POSE-1102 的 climbIK 手抓在通用的位置（靠床那一側抓在空中），
//   腿照走路片段：最上面兩階腳伸進牆（爬上 28／49 cm、爬下 23／44 cm，tests/dorm_ladder_grips_unit.js 最後一行）。
// 在 Node 裡載入遊戲真正的祐廷（VRM，不算圖）＋ story3d.js 真正的上床（goToBedFull，S.SLEEP_FULL=true）、起床（getUp）流程（GM 是假的：GM.sleep 照毫秒數一格一格 1/30 秒跑 CHAR.animate），
// 版面＝遊戲的 DORM_ROOM（src/data/dorm_room_layout.js）玩家那一組（L2）。人在哪一段、走到幾成（e）由測試自己照 root 的位置投影到路線上（梯子前→第 1～5 階→上床點）算，不讀程式的狀態。
//   ① 抓著的時候手在扶手上：站在每一階那一格（root 在踏點上：兩腳都在那一階）、還有中間幾階之間（第 1～4 階互換）走到一半那一格（先動的那隻手剛抓到下一階的點、另一隻還抓著這一階的），
//      手握的中心（四指 12 個關節的中間）離那根扶手的中心線 ≤ 2.5 cm（手握著扶手，不是抓在空中）、離抓的點 p ≤ 5 cm（一般 ≤ 2.5 cm；抓的點剛好在扶手轉彎的地方——
//      上下床扶手頂上的彎、門那一側扶手頂上的彎——沿扶手移到直的那一段，手指才不會插進轉過去的那一段，最多 4 cm 多，印出來）。地上（片段的手）、null（最上面一階：手在大腿上）不算。
//   ② 手不插進扶手、床尾板、床墊：手的頂點離每一根扶手（rails，圓管半徑 r）中心線、床尾板、床墊（方塊）——①那幾格抓著的手陷進去 ≤ 1.2 cm（蒙皮的手指彎起來，指腹那一面的頂點會往裡縮），
//      其他每一格（換手的途中）≤ 2 cm。
//   ③ 換手的順序：爬上去、爬下來各一隻腳帶頭（每一段前半段動得多的那隻），每一段都同一隻（腳一隻一隻輪流：左、右、左、右……，不會同一隻連動兩次）；
//      中間幾階之間（第 1～4 階互換）先動的手（前半段動得多的那隻，世界座標）＝帶頭那隻腳的對側、後半段換另一隻（手也左、右輪流）。
//   ④ 腳不進牆：爬上去、爬下來（pose climb、climbdown）每一格，兩隻腳（腳掌、腳趾）的頂點都在牆的這一邊（0 cm）；大腿、小腿的頂點最多進牆多少印出來。
//      （跪在上床點的跪姿 kneelBody 沒有改，左腳尖本來就在牆裡 3 cm：只印出來。）
//   ⑤ 腳踩在踏階上：每一格腳、腿的頂點插進踏階（收納櫃）的方塊 ≤ 1.5 cm；站在每一階那一格兩隻腳最低的那一點離踏面 −1.5～+2.5 cm。
//   ⑥ 頭頂：每一格 ≤ head_max（天花板 − 8 cm）；站在每一階那一格離天花板不比舊的做法（C.climbIK=false）少超過 3 cm，最上面一階（要彎腰的那一階）不比舊的少超過 1 cm。
//      （舊的：1.38／1.06／0.74／0.42／0.14 m；新的兩腳都踩在踏階上、膝蓋打直，中間幾階頭頂高 1～3 cm，離天花板還有 0.4 m 以上，印出來）
//   ⑦ 跪上床不變：跪在上床點、權重都到了（climbW 0、kneelW 1）的最後一格，關節的位置和 C.climbIK=false（舊的做法）一樣（≤ 1 mm）；臀部離床墊 ≤ 70 cm、兩膝 ≤ 12 cm。
//   ⑧ C.climbIK=false＝舊的樣子：(a) climb（關掉、沒有 headMax）和走路片段 walk 每一格一模一樣；(b) 舊的量法（最上面兩階走一個循環，dorm_ladder_grips_unit.js）腳伸進牆還是 28／49、23／44 cm。
//   ⑨ 平滑（人物座標；黑幕、瞬移的格子不算）：身體（臀部到頭）每一格相鄰兩格移動量的差 ≤ 5 cm；手腳（腳、小腿、手、前臂）≤ 8 cm、每一格移動 ≤ 12 cm——
//      爬梯子的那幾格（三格裡有 climb／climbdown、沒有跪）手腳真的一階一階換：一隻腳 0.19 秒往上 32 cm、往前 21 cm，一隻手 0.19 秒換到下一階的點（0.3～0.6 m），≤ 28 cm、每一格 ≤ 26 cm（換手、換腳不翻、不跳）。
// 修改前（dba7a4e77 的 character3d.js、story3d.js）：FAILED ?（?）。用法：node tests/climb_grips_feet_unit.js
const path=require('path'), fs=require('fs'), vm=require('vm');
const {ROOT,preload}=require('../tools/dev_scratch/spring_sim/harness.js');
global.location={search:''}; document.addEventListener=()=>{}; document.body=document.body||{appendChild(){}};
global.SOCIAL={displayName:id=>id,stage:()=>'ACQ',noticed(){},reveal:()=>'ACQUAINTANCE',has:()=>true,remember(){},meet(){}};
global.EVENTS={npcOf:()=>null,onEnter(){},tick(){}};
for(const f of ['src/data/characters.js','src/data/places.js','src/data/calendar.js','src/data/courses.js','src/data/dorm_room_layout.js','src/story3d.js']) vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (CHARACTERS|STORY|PLACES|SOCIAL_GRAPH|UNFAMILIAR_POOL|PORTRAITS|CALENDAR|COURSES|CLS|DORM_ROOM)\s*=/mg,'global.$1='),{filename:f});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const cm=v=>(v*100).toFixed(1)+' cm';
const KEY='char.yuting', scene=new THREE.Scene(), V3=(a)=>new THREE.Vector3(a[0],a[1],a[2]);
const U=DORM_ROOM.units.find(u=>u.id===(DORM_ROOM.player_unit||'L2')), SC=U.sleep_scene, ST=SC.steps, NS=ST.length, G=SC.grips, RL=SC.rails;
const wallX=U.side==='L'?-(DORM_ROOM.room.w/2-0.1):(DORM_ROOM.room.w/2-0.1), sgn=U.side==='L'?1:-1;   /* 牆的內面；房間那一側 sgn·(x−wallX)>0 */
const intoWall=v=>-(v.x-wallX)*sgn;
/* 路線：N0＝梯子前（地上）、N1..Nn＝踏點、B＝上床點 */
const N=[new THREE.Vector3(SC.approach[0],0,SC.approach[1])].concat(ST.map(V3)), BE=V3(SC.bed_entry||[SC.lie.feet[0],SC.lie.mattress_top_y,SC.lie.feet[2]]);
/* 踏階（收納櫃）的方塊：沿 ax（往牆的水平方向），第 j 階 [c−d/2, c+d/2]、y < 踏面；第 1 階踏板往房間突出 1.2 cm；寬＝stair_u */
const AX=new THREE.Vector3(N[NS].x-N[1].x,0,N[NS].z-N[1].z).normalize(), DD=Math.abs(N[2].clone().sub(N[1]).dot(AX)), SU=U.stair_u||[ST[0][2]-0.26,ST[0][2]+0.26];
const BOX=ST.map((s,j)=>({a0:V3(s).dot(AX)-DD/2-(j===0?0.012:0),a1:V3(s).dot(AX)+DD/2,top:s[1]}));
const inStep=v=>{ if(v.z<SU[0]+0.002||v.z>SU[1]) return 0; const a=v.dot(AX); let d=0; for(const b of BOX) if(a>b.a0&&a<b.a1&&v.y<b.top){ const p=Math.min(b.top-v.y,a-b.a0,b.a1-a); if(p>d) d=p; } return d; };
const RAILS=['door_rail','door_post','bed_rail','footboard_top','hoop'].filter(k=>Array.isArray(RL[k])).map(k=>({k,P:RL[k].map(V3)})), RR=RL.r||0.016;
const nearP=(P,v)=>{ let bd=Infinity, bq=null; const ab=new THREE.Vector3(), c=new THREE.Vector3(); for(let i=0;i+1<P.length;i++){ ab.subVectors(P[i+1],P[i]); const L2=ab.lengthSq(); const t=L2>1e-12?Math.max(0,Math.min(1,c.subVectors(v,P[i]).dot(ab)/L2)):0; c.copy(P[i]).addScaledVector(ab,t); const d=c.distanceTo(v); if(d<bd){ bd=d; bq=c.clone(); } } return [bd,bq]; };
/* 床尾板（上緣 footboard_top、厚 2.5 cm、到床板頂）、床墊（lie.mattress、床板底到床墊頂）*/
const FB=RL.footboard_top?{x:[Math.min(RL.footboard_top[0][0],RL.footboard_top[1][0]),Math.max(RL.footboard_top[0][0],RL.footboard_top[1][0])],y:[1.70,RL.footboard_top[0][1]+0.015],z:[RL.footboard_top[0][2]-0.0125,RL.footboard_top[0][2]+0.0125]}:null;
const MT=SC.lie&&SC.lie.mattress?{x:SC.lie.mattress.x,y:[1.66,SC.lie.mattress_top_y],z:SC.lie.mattress.z}:null;
const inBox=(b,v)=>b&&v.x>b.x[0]&&v.x<b.x[1]&&v.y>b.y[0]&&v.y<b.y[1]&&v.z>b.z[0]&&v.z<b.z[1]?Math.min(v.x-b.x[0],b.x[1]-v.x,v.y-b.y[0],b.y[1]-v.y,v.z-b.z[0],b.z[1]-v.z):0;
/* root 在路線的哪一段：dir 'up'（N(s−1)→Ns）、'down'（Ns→N(s−1)）；最上面一階↔上床點＝bed */
function phaseOf(p,dir){ let best=null; const seg=(A,B,s,bed)=>{ const ab=B.clone().sub(A), L2=ab.lengthSq(), t=L2>1e-9?Math.max(0,Math.min(1,p.clone().sub(A).dot(ab)/L2)):0, d=A.clone().addScaledVector(ab,t).distanceTo(p); if(!best||d<best.d-1e-6) best={s,t,d,bed}; };
  for(let s=1;s<=NS;s++) seg(N[s-1],N[s],s,false); seg(N[NS],BE,NS+1,true); if(!best||best.d>0.05) return null;
  if(best.bed) return {bed:true}; const up=dir==='up'; return {bed:false,src:up?best.s-1:best.s,dst:up?best.s:best.s-1,e:up?best.t:1-best.t}; }
const CORE=['hips','spine','chest','neck','head'], LIMB=['leftFoot','rightFoot','leftLowerLeg','rightLowerLeg','leftHand','rightHand','leftLowerArm','rightLowerArm'], JNT=CORE.concat(LIMB), FING=['Index','Middle','Ring','Little'].flatMap(f=>['Proximal','Intermediate','Distal'].map(j=>f+j));
(async()=>{
  await preload([KEY]);
  const H=ASSETS.manifest[KEY].height||1.75;
  /* 跑一次上床＋起床；回傳每一格的紀錄 */
  async function runSeq(climbOn){ CHAR.climbIK=climbOn; const h=CHAR.build({model:KEY,height:H}); scene.add(h); const vrm=h.userData.vrm, R=n=>vrm.humanoid.getRawBoneNode(n), V=new THREE.Vector3();
    /* 要量的頂點（照最大權重的骨頭分）：腳、腿、左手、右手 */
    const parts=[]; h.traverse(o=>{ if(!o.isSkinnedMesh||!o.visible||!o.skeleton) return; const g=o.geometry, si=g.attributes.skinIndex, sw=g.attributes.skinWeight, bs=o.skeleton.bones, L={foot:[],leg:[],hand0:[],hand1:[],footL:[],footR:[]};
      for(let v=0;v<g.attributes.position.count;v++){ let bw=0,bn=''; for(let c=0;c<4;c++){ const w=sw.getComponent(v,c); if(w>bw){ bw=w; bn=(bs[si.getComponent(v,c)]||{}).name||''; } }
        if(/Foot|Toe/.test(bn)){ L.foot.push(v); (/_R_/.test(bn)?L.footR:L.footL).push(v); } else if(/UpperLeg|LowerLeg/.test(bn)) L.leg.push(v); else if(/_L_(Hand|Thumb|Index|Middle|Ring|Little)/.test(bn)) L.hand0.push(v); else if(/_R_(Hand|Thumb|Index|Middle|Ring|Little)/.test(bn)) L.hand1.push(v); }
      parts.push([o,L]); });
    const verts=k=>{ const out=[]; for(const [o,L] of parts) for(const v of L[k]){ o.getVertexPosition(v,V); o.localToWorld(V); out.push(V.clone()); } return out; };
    const P={obj:h,pose:'idle',idlePose:'idle',busy:false,lv:0}; let frames=[], black=false, jumped=false, dir='up';
    const step=n=>{ for(let i=0;i<n;i++){ CHAR.animate(h,1/30,{pose:P.pose,speed:0}); scene.updateMatrixWorld(true); const u=h.userData, W=nm=>R(nm).getWorldPosition(new THREE.Vector3());
        const f={pose:P.pose,black,jump:jumped,p:h.position.clone(),ry:h.rotation.y,ph:phaseOf(h.position,dir),J:{},Jl:{},fing:[0,1].map(i=>FING.map(n=>W((i?'right':'left')+n))),top:CHAR.headTop?CHAR.headTop(h):null,lad:!!u.ladder,climbW:u.climbW||0,kneelW:u.kneelW||0};
        for(const j of JNT){ f.J[j]=W(j); f.Jl[j]=h.worldToLocal(f.J[j].clone()); } f.mat=f.J; f.knee=[W('leftLowerLeg').y,W('rightLowerLeg').y];
        if(!black&&(P.pose==='climb'||P.pose==='climbdown'||P.pose==='kneel')){ f.foot=verts('foot'); f.footS=[verts('footL'),verts('footR')]; f.leg=verts('leg'); f.hand=[verts('hand0'),verts('hand1')]; }
        frames.push(f); jumped=false; } };
    const E={zone:{id:'dorm'},player:P,npcs:[],toneK:1,hour:22,cam:{mode:'follow'},q:{level:'high'},applyTime(){},endCinematic(){ this.cam.mode='follow'; },placeAt(ent,x,z){ ent.obj.position.set(x,0,z); },prePose(){}};
    const GM={G:{day:6,hour:22,flags:{},zone:'dorm'},E,turbo:false,depth:0,
      sleep:async ms=>{ step(Math.max(1,Math.round(ms/1000*30))); }, fade:async on=>{ if(on){ step(14); black=true; } else { black=false; step(15); } },
      walkTo:async(ent,x,z)=>{ ent.obj.position.set(x,0,z); jumped=true; P.pose='idle'; step(20); return true; },
      cine(){ E.cam.mode='cinematic'; },sceneBegin(){ this.depth++; P.busy=true; },sceneEnd(){ this.depth=Math.max(0,this.depth-1); if(!this.depth){ P.busy=false; E.endCinematic(); } },standUp(ent){ ent.pose='idle'; ent.seat=null; }};
    STORY.SLEEP_FULL=true; h.position.set(0,0,2); h.rotation.y=0; P.pose='idle'; step(10); frames=[];
    await STORY._bedFx.goToBed(GM,SC); const up=frames; frames=[]; dir='down'; STORY.lieDown(GM,SC); jumped=true; step(10); frames=[];
    await STORY._bedFx.getUp(GM,SC); const dn=frames; STORY.SLEEP_FULL=false; scene.remove(h); CHAR.release(h); CHAR.climbIK=true; return {up,dn}; }
  const NEW=await runSeq(true);
  const OLD=await runSeq(false);
  const seqs=[['爬上去','up',NEW.up],['爬下來','down',NEW.dn]], act=f=>!f.black&&(f.pose==='climb'||f.pose==='climbdown');
  const gripOf=(dir,node,i)=>{ if(node===0) return null; const r=(dir==='up'?G.up:G.down)[node-1]; return r&&r[i]&&Array.isArray(r[i].p)?r[i]:null; };
  /* 站在第幾階（root 在踏點上：兩腳都在那一階）；沒有＝null */
  const nodeOf=f=>f.ph&&!f.ph.bed&&(f.ph.e>=0.999||f.ph.e<=0.001)?(f.ph.e>=0.999?f.ph.dst:f.ph.src):null;
  /* 每一段：帶頭的腳（前半段動得多的那一隻）、先動的手（前半段動得多的那一隻，世界座標）*/
  const segs=[], segBy={}; for(const [nm,dir,F] of seqs){ const by={}; F.forEach((f,ix)=>{ if(!act(f)||!f.ph||f.ph.bed) return; const key=f.ph.src+'>'+f.ph.dst; (by[key]||(by[key]={nm,dir,src:f.ph.src,dst:f.ph.dst,fr:[]})).fr.push(ix); });
    for(const k in by){ const s=by[k]; const mv=(a,b,j)=>{ let d=0; for(const ix of s.fr){ const x=F[ix], pv=F[ix-1]; if(pv&&x.ph.e>a&&x.ph.e<=b) d+=x.J[j].distanceTo(pv.J[j]); } return d; };
      s.lead=mv(0,0.5,'leftFoot')>=mv(0,0.5,'rightFoot')?0:1; s.leadOk=mv(0,0.5,s.lead?'rightFoot':'leftFoot')>mv(0,0.5,s.lead?'leftFoot':'rightFoot')&&mv(0.5,1,s.lead?'leftFoot':'rightFoot')>mv(0.5,1,s.lead?'rightFoot':'leftFoot');
      s.first=mv(0,0.5,'leftHand')>=mv(0,0.5,'rightHand')?0:1; s.secondOk=mv(0.5,1,s.first?'leftHand':'rightHand')>mv(0.5,1,s.first?'rightHand':'leftHand'); s.inner=s.src>0&&s.dst>0&&s.src<NS&&s.dst<NS&&[0,1].some(i=>{ const a=gripOf(dir,s.src,i), b=gripOf(dir,s.dst,i); return !(a&&b&&a.p.every((x,c)=>Math.abs(x-b.p[c])<1e-6)); });   /* 兩階抓的點一樣（爬上去第 3→4 階）＝手不用換，不算 */ s.F=F; segs.push(s); segBy[dir+k]=s; } }
  /* ①②：抓著的那幾格（站在每一階；中間幾階之間走到一半）、每一隻手抓哪一個點 */
  const gc=f=>f.fing.map(fs=>fs.reduce((a,b)=>a.add(b),new THREE.Vector3()).multiplyScalar(1/fs.length)), holds=[], holdKey=new Set();
  for(const [nm,dir,F] of seqs) F.forEach((f,ix)=>{ if(!act(f)) return; const nd=nodeOf(f); let want=null, tag='';
    if(nd!=null&&nd>0){ want=[0,1].map(i=>gripOf(dir,nd,i)); tag='站在第 '+nd+' 階'; }
    else if(f.ph&&!f.ph.bed&&Math.abs(f.ph.e-0.5)<0.005){ const sg=segBy[dir+f.ph.src+'>'+f.ph.dst]; if(sg&&sg.inner){ want=[0,1].map(i=>gripOf(dir,i===1-sg.lead?f.ph.dst:f.ph.src,i)); tag=f.ph.src+'→'+f.ph.dst+' 一半'; } }
    if(!want) return; const C=gc(f); want.forEach((g,i)=>{ if(!g) return; holdKey.add(dir+ix+'/'+i); holds.push({nm,dir,ix,i,g,C:C[i],tag}); }); });
  let w1={ax:0,d3:0,axW:'',d3W:''}; const pt={};
  for(const H of holds){ const rail=RAILS.find(r=>r.k===H.g.on), [dax]=nearP(rail.P,H.C), d3=H.C.distanceTo(V3(H.g.p)), tag=H.nm+' '+H.tag+(H.i?' 右手 ':' 左手 ')+H.g.on;
    if(dax>w1.ax){ w1.ax=dax; w1.axW=tag; } if(d3>w1.d3){ w1.d3=d3; w1.d3W=tag; } const key=(H.dir==='up'?'上':'下')+H.g.p.map(x=>x.toFixed(2)).join(',')+(H.i?'右':'左'); pt[key]=Math.max(pt[key]||0,d3); }
  check('① 抓著的時候手在扶手上：站在每一階、中間幾階之間走到一半，手握的中心離扶手中心線 ≤ 2.5 cm、離抓的點 ≤ 5 cm',holds.length>=30&&w1.ax<=0.025&&w1.d3<=0.05,
    `${holds.length} 次；離中心線最遠 ${cm(w1.ax)}（${w1.axW}）、離抓的點最遠 ${cm(w1.d3)}（${w1.d3W}）；超過 2.5 cm 的點（扶手轉彎的地方）：${Object.entries(pt).filter(([k,v])=>v>0.025).map(([k,v])=>k.replace(/^(.)(.*)(.)$/,'$1 $3手 ($2)')+' '+cm(v)).join('、')||'沒有'}`);
  /* ② */
  let w2h={d:0,w:''}, w2m={d:0,w:''};
  for(const [nm,dir,F] of seqs) F.forEach((f,ix)=>{ if(!act(f)||!f.hand) return; for(let i=0;i<2;i++){ let worst=0, what=''; for(const v of f.hand[i]){ for(const r of RAILS){ const d=RR-nearP(r.P,v)[0]; if(d>worst){ worst=d; what=r.k; } } const b=Math.max(inBox(FB,v),inBox(MT,v)); if(b>worst){ worst=b; what='床尾板／床墊'; } }
      const tag=nm+' 第 '+ix+' 格'+(i?' 右手 ':' 左手 ')+what; if(holdKey.has(dir+ix+'/'+i)){ if(worst>w2h.d) w2h={d:worst,w:tag}; } else if(worst>w2m.d) w2m={d:worst,w:tag}; } });
  check('② 手不插進扶手、床尾板、床墊：抓著 ≤ 1.2 cm、換手的途中 ≤ 2 cm',w2h.d<=0.012&&w2m.d<=0.02,`抓著最深 ${cm(w2h.d)}（${w2h.w||'—'}）、途中最深 ${cm(w2m.d)}（${w2m.w||'—'}）`);
  /* ③ */
  const bad3=[]; for(const [nm,dir] of [['爬上去','up'],['爬下來','down']]){ const S=segs.filter(s=>s.dir===dir).sort((a,b)=>dir==='up'?a.dst-b.dst:b.dst-a.dst);
    S.forEach((s,k)=>{ const tg=nm+' '+s.src+'→'+s.dst; if(k>0&&S[k-1].lead!==s.lead) bad3.push(tg+' 帶頭的腳換了（同一隻腳會連動兩次）'); if(!s.leadOk) bad3.push(tg+' 兩隻腳沒有一前一後'); if(s.inner&&s.first!==1-s.lead) bad3.push(tg+' 先動的手不是帶頭那隻腳的對側'); if(s.inner&&!s.secondOk) bad3.push(tg+' 後半段不是另一隻手'); }); }
  check('③ 換手的順序：每一段同一隻腳帶頭（腳一隻一隻輪流）、中間幾階先動的手＝帶頭那隻腳的對側、後半段換另一隻手',segs.length>=10&&!bad3.length,bad3.join('、')||segs.map(s=>(s.dir==='up'?'上':'下')+s.dst+(s.lead?'右腳':'左腳')+(s.inner?'/'+(s.first?'右手':'左手'):'')).join(' '));
  /* ④ */
  const w4={}; let w4k=0, w4l=-1, w4lW=''; for(const [nm,dir,F] of seqs) F.forEach((f,ix)=>{ if(!f.foot) return; const ft=Math.max(...f.foot.map(intoWall)), lg=Math.max(...f.leg.map(intoWall));
      if(act(f)){ const key=nm+(f.ph&&!f.ph.bed?' 第 '+(dir==='up'?f.ph.dst:f.ph.src)+' 階':' 上床點'); w4[key]=Math.max(w4[key]==null?-1:w4[key],ft); if(lg>w4l){ w4l=lg; w4lW=nm+' 第 '+ix+' 格'+(f.ph&&f.ph.bed?'（上床點）':''); } } else if(f.pose==='kneel') w4k=Math.max(w4k,ft); });
  const w4max=Math.max(...Object.values(w4));
  check('④ 腳不進牆（爬上去、爬下來每一格：兩隻腳的頂點都在牆的這一邊）',Object.keys(w4).length>=10&&w4max<=0,'腳離牆最近 '+cm(-w4max)+'；每一階：'+Object.entries(w4).map(([k,v])=>k+(v>0?' 進牆 '+cm(v):' 離牆 '+cm(-v))).join('、')+'；（大腿、小腿最深 '+(w4l>0?'進牆 '+cm(w4l)+'（'+w4lW+'）':'沒有進牆')+'；跪姿，沒改：腳進牆 '+cm(w4k)+'）');
  /* ⑤ */
  let w5={d:0,w:''}, w5s={lo:1,hi:-1,w:''}, n5=0; for(const [nm,dir,F] of seqs) F.forEach((f,ix)=>{ if(!act(f)||!f.foot) return; for(const v of f.foot.concat(f.leg)){ const d=inStep(v); if(d>w5.d) w5={d,w:nm+' 第 '+ix+' 格'}; }
      const nd=nodeOf(f); if(nd!=null&&nd>0){ n5++; const top=ST[nd-1][1]; for(const side of [0,1]){ const fv=f.footS[side]; const lo=Math.min(...fv.map(v=>v.y))-top; if(lo<w5s.lo) w5s.lo=lo; if(lo>w5s.hi){ w5s.hi=lo; w5s.w=nm+' 第 '+nd+' 階'+(side?'右腳':'左腳'); } } } });
  check('⑤ 腳踩在踏階上：腳、腿插進踏階 ≤ 1.5 cm；站在每一階的時候兩腳最低點離踏面 −1.5～+2.5 cm',n5>=10&&w5.d<=0.015&&w5s.lo>=-0.015&&w5s.hi<=0.025,`插進踏階最深 ${cm(w5.d)}（${w5.w||'—'}）；站在每一階 ${n5} 格、腳底離踏面 ${cm(w5s.lo)}～${cm(w5s.hi)}（最高 ${w5s.w}）`);
  /* ⑥ */
  const hmax=+SC.head_max, ceil=+SC.ceil_y; const clrOf=R=>{ const c={}; let top=-1; for(const [dir,F] of [['up',R.up],['down',R.dn]]) F.forEach(f=>{ if(f.black||f.top==null||!(f.pose==='climb'||f.pose==='climbdown'||f.pose==='kneel')) return; top=Math.max(top,f.top);
      if(act(f)){ const nd=nodeOf(f); if(nd!=null&&nd>0){ const k=(dir==='up'?'上':'下')+nd; c[k]=Math.min(c[k]==null?9:c[k],ceil-f.top); } } }); return {c,top}; };
  const CN=clrOf(NEW), CO=clrOf(OLD), bad6=[]; for(const k in CN.c){ const o=CO.c[k], lim=+k.slice(1)===NS?0.01:0.03; if(o==null||CN.c[k]<o-lim) bad6.push(k+' '+CN.c[k].toFixed(3)+'（舊 '+(o==null?'—':o.toFixed(3))+'）'); }
  check(`⑥ 頭頂：每一格 ≤ head_max ${hmax}；站在每一階離天花板不比舊的少超過 3 cm（最上面一階 1 cm）`,CN.top<=hmax&&!bad6.length&&Object.keys(CN.c).length>=10,`最高 ${CN.top.toFixed(3)} m（舊 ${CO.top.toFixed(3)}）；離天花板（m，新／舊）：${Object.keys(CN.c).map(k=>k+' '+CN.c[k].toFixed(3)+'／'+(CO.c[k]!=null?CO.c[k].toFixed(3):'—')).join('、')}${bad6.length?'；變少太多：'+bad6.join('、'):''}`);
  /* ⑦ */
  const lastK=F=>{ for(let i=F.length-1;i>=0;i--){ const f=F[i]; if(!f.black&&f.pose==='kneel'&&f.climbW===0&&f.kneelW>=0.999) return f; } return null; };
  const kn=lastK(NEW.up), ko=lastK(OLD.up), mat=SC.lie.mattress_top_y; let dk=Infinity; if(kn&&ko){ dk=0; for(const j of JNT) dk=Math.max(dk,kn.J[j].distanceTo(ko.J[j])); }
  check('⑦ 跪上床不變：跪好的最後一格關節和舊的做法一樣（≤ 1 mm）、臀部離床墊 ≤ 70 cm、兩膝 ≤ 12 cm',!!kn&&dk<=0.001&&kn.J.hips.y-mat<=0.70&&kn.knee.every(y=>y-mat<=0.12&&y-mat>=0),kn?`差 ${(dk*1000).toFixed(2)} mm；臀部 ${cm(kn.J.hips.y-mat)}、膝 ${kn.knee.map(y=>cm(y-mat)).join('／')}`:'沒有跪好的格子');
  /* ⑧ */
  { CHAR.climbIK=false; const A=CHAR.build({model:KEY,height:H}), B=CHAR.build({model:KEY,height:H}); scene.add(A); scene.add(B); let dmax=0;
    for(const o of [A,B]){ o.position.set(ST[2][0],ST[2][1],ST[2][2]); o.rotation.y=-Math.PI/2; } scene.updateMatrixWorld(true);
    for(let i=0;i<40;i++){ CHAR.animate(A,1/30,{pose:'climb',speed:0}); CHAR.animate(B,1/30,{pose:'walk',speed:0}); scene.updateMatrixWorld(true);
      for(const j of JNT.concat(['leftUpperArm','rightUpperArm','leftLowerArm','rightLowerArm','head'])){ const a=A.userData.vrm.humanoid.getRawBoneNode(j).getWorldPosition(new THREE.Vector3()), b=B.userData.vrm.humanoid.getRawBoneNode(j).getWorldPosition(new THREE.Vector3()); dmax=Math.max(dmax,a.distanceTo(b)); } }
    scene.remove(A); scene.remove(B); CHAR.release(A); CHAR.release(B);
    /* 舊的量法：最上面三階、走一個循環（60 格），身體伸進牆最深（dorm_ladder_grips_unit.js 最後一行）*/
    const h=CHAR.build({model:KEY,height:H}); scene.add(h); const V=new THREE.Vector3(), up=Math.atan2(ST[NS-1][0]-ST[0][0],ST[NS-1][2]-ST[0][2]), deep=[];
    for(const [ry,ps] of [[up,'climb'],[up+Math.PI,'climbdown']]) for(let k=NS-2;k<NS;k++){ const s=ST[k]; let d=0;
      h.position.set(s[0],s[1],s[2]); h.rotation.y=ry; scene.updateMatrixWorld(true); for(let i=0;i<8;i++){ CHAR.animate(h,1/30,{pose:'idle',speed:0}); scene.updateMatrixWorld(true); }
      for(let i=0;i<60;i++){ CHAR.animate(h,1/30,{pose:ps,speed:0}); scene.updateMatrixWorld(true); if(i<15||i%4) continue;
        h.traverse(o=>{ if(!o.isSkinnedMesh||!o.visible) return; const pa=o.geometry.attributes.position; for(let v=0;v<pa.count;v+=3){ o.getVertexPosition(v,V); o.localToWorld(V); const e=0.0-Math.abs(V.x-wallX)*(Math.sign(V.x-wallX)===Math.sign(s[0]-wallX)?1:-1); if(e>d) d=e; } }); }
      deep.push(d); }
    scene.remove(h); CHAR.release(h); CHAR.climbIK=true;
    const OLDW=[0.284,0.494,0.231,0.441];
    check('⑧ C.climbIK=false＝舊的樣子：climb 和走路片段每一格一樣、舊的量法腳伸進牆還是 28／49、23／44 cm',dmax<1e-6&&deep.every((d,i)=>Math.abs(d-OLDW[i])<0.003),`climb↔walk 差 ${dmax.toExponential(1)} m；伸進牆 爬上第 4、5 階 ${cm(deep[0])}、${cm(deep[1])}，爬下 ${cm(deep[2])}、${cm(deep[3])}`); }
  /* ⑨ */
  const ladT=(...fs)=>fs.some(f=>f&&f.lad&&(f.pose==='climb'||f.pose==='climbdown'))&&!fs.some(f=>f&&f.pose==='kneel');   /* 爬梯子、手腳一階一階換的那幾格 */
  const w9={b:{d:0,w:''},l:{d:0,w:''},v:{d:0,w:''},L:{d:0,w:''},V:{d:0,w:''}}, up9=(k,d,w)=>{ if(d>w9[k].d) w9[k]={d,w}; };
  for(const [nm,dir,F] of seqs) for(let i=1;i<F.length;i++){ const a=F[i-1], b=F[i], c=F[i+1]; const ok=f=>f&&!f.black&&!f.jump&&f.pose!=='lie'; if(!ok(a)||!ok(b)) continue;
      for(const j of JNT){ const core=CORE.includes(j), d=b.Jl[j].distanceTo(a.Jl[j]); if(!core) up9(ladT(a,b)?'V':'v',d,nm+' 第 '+i+' 格 '+j+'（'+a.pose+'→'+b.pose+'）');
        if(ok(c)){ const d2=c.Jl[j].clone().sub(b.Jl[j]).sub(b.Jl[j].clone().sub(a.Jl[j])).length(), tg=nm+' 第 '+i+' 格 '+j+'（'+a.pose+'→'+b.pose+'→'+c.pose+'）'; if(core) up9('b',d2,tg); else up9(ladT(a,b,c)?'L':'l',d2,tg); } } }
  check('⑨ 平滑：身體相鄰兩格移動量的差 ≤ 5 cm；手腳 ≤ 8 cm、每格 ≤ 12 cm（爬梯子換階的那幾格 ≤ 28 cm、每格 ≤ 26 cm）',w9.b.d<=0.05&&w9.l.d<=0.08&&w9.v.d<=0.12&&w9.L.d<=0.28&&w9.V.d<=0.26,
    `身體 ${cm(w9.b.d)}（${w9.b.w}）；手腳 ${cm(w9.l.d)}、每格 ${cm(w9.v.d)}（${w9.l.w||'—'}）；爬梯子換階 ${cm(w9.L.d)}（${w9.L.w}）、每格 ${cm(w9.V.d)}（${w9.V.w}）`);
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(2); });
