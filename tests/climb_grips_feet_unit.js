// 爬宿舍上舖的梯子：兩手抓扶手（sleep_scene.grips）、兩腳踩在踏階上（CLIMB-GRIPS-FEET-1105）——不需要瀏覽器。
// 起因：LAWWW2 DORM-LADDER-HEAD-GRIP-1102 ② 加了靠床那一側的扶手和每一階兩手抓的點；CLIMB-POSE-1102 的 climbIK 手抓在通用的位置（靠床那一側抓在空中），
//   腿照走路片段：最上面兩階腳伸進牆（爬上 28／49 cm、爬下 23／44 cm，tests/dorm_ladder_grips_unit.js 最後一行）。
// 在 Node 裡載入遊戲真正的祐廷（VRM，不算圖）＋ story3d.js 真正的上床（goToBedFull，S.SLEEP_FULL=true）、起床（getUp）流程（GM 是假的：GM.sleep 照毫秒數一格一格 1/30 秒跑 CHAR.animate），
// 版面＝遊戲的 DORM_ROOM（src/data/dorm_room_layout.js）玩家那一組（L2）。人在哪一段、走到幾成（e）由測試自己照 root 的位置投影到路線上（梯子前→第 1～5 階→上床點）算，不讀程式的狀態。
//   ① 抓著的時候手在扶手上：每一段開始（e≈0）、一半（e＝0.5：先動的那隻手已經換到下一階的點）、結束（e≈1）那一格，
//      手握的中心（四指 12 個關節的中間）離那根扶手的中心線 ≤ 2.5 cm（手握著扶手，不是抓在空中）、沿著扶手離抓的點 ≤ 5 cm
//      （一般 ≤ 4 cm；抓的點剛好在扶手轉彎的地方——上下床扶手頂上的彎、門那一側扶手的兩個彎——沿扶手移到直的那一段，手指才不會插進轉過去的那一段，最多 4.8 cm，印出來）。
//      爬上去的第一段（地上→第 1 階）一半那一格不算（人還在梯子前，第 1 階的點還搆不到，兩手晚一點抓）；null（最上面一階）不算。
//   ② 手不插進扶手、床尾板、床：手的頂點離每一根扶手（rails，圓管半徑 r）中心線、床尾板、床墊（方塊）——抓著的那幾格（①的格子）陷進去 ≤ 0.6 cm（蒙皮的手掌肉墊貼著扶手）、
//      其他每一格（換手的途中）≤ 1.6 cm。
//   ③ 換手的順序：每一段帶頭的腳（前半段動得多的那隻）左右輪流；先動的手（前半段動得多的那隻，人物座標）＝帶頭那隻腳的對側（地上那一段的手從片段的手開始，不算）。
//   ④ 腳不進牆：爬上去、爬下來（pose climb、climbdown）每一格，腳（腳掌、腳趾）的頂點都在牆的這一邊（0 cm）；大腿、小腿也一樣。
//      （跪在上床點的跪姿 kneelBody 沒有改，左腳尖本來就在牆裡 2.9 cm：只印出來。）
//   ⑤ 腳踩在踏階上：每一格腳、腿的頂點插進踏階（收納櫃）的方塊 ≤ 1.5 cm；每一段開始、結束那一格（兩腳都站在那一階）兩隻腳最低的那一點離踏面 −1.5～+2.5 cm。
//   ⑥ 頭頂：每一格 ≤ head_max（天花板 − 8 cm）；站在每一階那一格離天花板不比舊的少超過 1 cm（舊的：1.38／1.06／0.74／0.42／0.14 m）。
//   ⑦ 跪上床不變：跪在上床點、權重都到了（climbW 0、kneelW 1）的最後一格，關節的位置和 C.climbIK=false（舊的做法）一樣（≤ 1 mm）；臀部離床墊 ≤ 70 cm、兩膝 ≤ 12 cm。
//   ⑧ C.climbIK=false＝舊的樣子：(a) climb（關掉、沒有 headMax）和走路片段 walk 每一格一模一樣；(b) 舊的量法（最上面三階走一個循環，dorm_ladder_grips_unit.js）腳伸進牆還是 28／49、23／44 cm。
//   ⑨ 平滑：手、腳、臀部每一格移動 ≤ 12 cm、相鄰兩格移動量的差 ≤ 8 cm（黑幕、瞬移的格子不算）。
// 修改前（dba7a4e77 的 character3d.js、story3d.js）：FAILED 7（①②③④⑤⑦⑨），⑥⑧ 本來就過。用法：node tests/climb_grips_feet_unit.js
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
const JNT=['hips','leftFoot','rightFoot','leftHand','rightHand','leftLowerLeg','rightLowerLeg'], FING=['Index','Middle','Ring','Little'].flatMap(f=>['Proximal','Intermediate','Distal'].map(j=>f+j));
(async()=>{
  await preload([KEY]);
  const H=ASSETS.manifest[KEY].height||1.75;
  /* 跑一次上床＋起床；回傳每一格的紀錄 */
  async function runSeq(climbOn){ CHAR.climbIK=climbOn; const h=CHAR.build({model:KEY,height:H}); scene.add(h); const vrm=h.userData.vrm, R=n=>vrm.humanoid.getRawBoneNode(n), V=new THREE.Vector3();
    /* 要量的頂點（照最大權重的骨頭分）：腳、腿、左手、右手 */
    const parts=[]; h.traverse(o=>{ if(!o.isSkinnedMesh||!o.visible||!o.skeleton) return; const g=o.geometry, si=g.attributes.skinIndex, sw=g.attributes.skinWeight, bs=o.skeleton.bones, L={foot:[],leg:[],hand0:[],hand1:[]};
      for(let v=0;v<g.attributes.position.count;v++){ let bw=0,bn=''; for(let c=0;c<4;c++){ const w=sw.getComponent(v,c); if(w>bw){ bw=w; bn=(bs[si.getComponent(v,c)]||{}).name||''; } }
        if(/Foot|Toe/.test(bn)) L.foot.push(v); else if(/UpperLeg|LowerLeg/.test(bn)) L.leg.push(v); else if(/_L_(Hand|Thumb|Index|Middle|Ring|Little)/.test(bn)) L.hand0.push(v); else if(/_R_(Hand|Thumb|Index|Middle|Ring|Little)/.test(bn)) L.hand1.push(v); }
      parts.push([o,L]); });
    const verts=k=>{ const out=[]; for(const [o,L] of parts) for(const v of L[k]){ o.getVertexPosition(v,V); o.localToWorld(V); out.push(V.clone()); } return out; };
    const P={obj:h,pose:'idle',idlePose:'idle',busy:false,lv:0}; let frames=[], black=false, jumped=false, dir='up';
    const step=n=>{ for(let i=0;i<n;i++){ CHAR.animate(h,1/30,{pose:P.pose,speed:0}); scene.updateMatrixWorld(true); const u=h.userData, W=nm=>R(nm).getWorldPosition(new THREE.Vector3());
        const f={pose:P.pose,black,jump:jumped,p:h.position.clone(),ry:h.rotation.y,ph:phaseOf(h.position,dir),J:{},Jl:{},fing:[0,1].map(i=>FING.map(n=>W((i?'right':'left')+n))),top:CHAR.headTop?CHAR.headTop(h):null,climbW:u.climbW||0,kneelW:u.kneelW||0};
        for(const j of JNT){ f.J[j]=W(j); f.Jl[j]=h.worldToLocal(f.J[j].clone()); } f.mat=f.J; f.knee=[W('leftLowerLeg').y,W('rightLowerLeg').y];
        if(!black&&(P.pose==='climb'||P.pose==='climbdown'||P.pose==='kneel')){ f.foot=verts('foot'); f.leg=verts('leg'); f.hand=[verts('hand0'),verts('hand1')]; }
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
  /* 每一段：帶頭的腳、先動的手（前半段動得多的那一隻）*/
  const segs=[]; for(const [nm,dir,F] of seqs){ const by={}; F.forEach((f,ix)=>{ if(!act(f)||!f.ph||f.ph.bed) return; const key=f.ph.src+'>'+f.ph.dst; (by[key]||(by[key]={nm,dir,src:f.ph.src,dst:f.ph.dst,fr:[]})).fr.push(ix); });
    for(const k in by){ const s=by[k], fr=s.fr.map(i=>F[i]); const mv=(a,b,j,loc)=>{ let d=0; for(const x of fr) if(x.ph.e>a&&x.ph.e<=b){ const pv=F[F.indexOf(x)-1]; if(pv) d+=(loc?x.Jl[j].distanceTo(pv.Jl[j]):x.J[j].distanceTo(pv.J[j])); } return d; };
      s.lead=mv(0,0.5,'leftFoot')>=mv(0,0.5,'rightFoot')?0:1; s.first=mv(0,0.5,'leftHand',true)>=mv(0,0.5,'rightHand',true)?0:1; s.F=F; segs.push(s); } }
  /* ① */
  const gc=f=>f.fing.map(fs=>fs.reduce((a,b)=>a.add(b),new THREE.Vector3()).multiplyScalar(1/fs.length));
  let w1={ax:0,al:0,axW:'',alW:''}, holdIx=new Set(), gripRows={};
  for(const s of segs){ const F=s.F; for(const ix of s.fr){ const f=F[ix], e=f.ph.e; let want=null;
      if(e<=0.021) want=[gripOf(s.dir,s.src,0),gripOf(s.dir,s.src,1)];
      else if(e>=0.979) want=[gripOf(s.dir,s.dst,0),gripOf(s.dir,s.dst,1)];
      else if(Math.abs(e-0.5)<0.03&&!(s.dir==='up'&&s.src===0)){ const fi=1-s.lead; want=[0,1].map(i=>i===fi?gripOf(s.dir,s.dst,i):gripOf(s.dir,s.src,i)); }
      if(!want) continue; const C=gc(f);
      want.forEach((g,i)=>{ if(!g) return; holdIx.add(s.dir+ix+'/'+i); const rail=RAILS.find(r=>r.k===g.on); const [dax,q]=nearP(rail.P,C[i]), dal=q.distanceTo(V3(g.p)); const tag=s.nm+' '+s.src+'→'+s.dst+' e'+e.toFixed(2)+(i?' 右手 ':' 左手 ')+g.on;
        if(dax>w1.ax){ w1.ax=dax; w1.axW=tag; } if(dal>w1.al){ w1.al=dal; w1.alW=tag; } const key=s.dir+' '+(e<0.5&&e<=0.021?s.src:(e>=0.979?s.dst:(i===1-s.lead?s.dst:s.src)))+(i?'右':'左'); gripRows[key]=Math.max(gripRows[key]||0,dal); }); } }
  check('① 抓著的時候手在扶手上：手握的中心離扶手中心線 ≤ 2.5 cm、沿扶手離抓的點 ≤ 5 cm（每一段開始、一半、結束）',holdIx.size>=60&&w1.ax<=0.025&&w1.al<=0.05,
    `${holdIx.size} 次；離中心線最遠 ${cm(w1.ax)}（${w1.axW}）、沿扶手最遠 ${cm(w1.al)}（${w1.alW}）；超過 4 cm 的點：${Object.entries(gripRows).filter(([k,v])=>v>0.04).map(([k,v])=>k+' '+cm(v)).join('、')||'沒有'}`);
  /* ② */
  let w2h={d:0,w:''}, w2m={d:0,w:''};
  for(const [nm,dir,F] of seqs) F.forEach((f,ix)=>{ if(!act(f)||!f.hand) return; for(let i=0;i<2;i++){ let worst=0, what=''; for(const v of f.hand[i]){ for(const r of RAILS){ const d=RR-nearP(r.P,v)[0]; if(d>worst){ worst=d; what=r.k; } } const b=Math.max(inBox(FB,v),inBox(MT,v)); if(b>worst){ worst=b; what='床尾板／床墊'; } }
      const tag=nm+' 第 '+ix+' 格'+(i?' 右手 ':' 左手 ')+what; if(holdIx.has(dir+ix+'/'+i)){ if(worst>w2h.d) w2h={d:worst,w:tag}; } else if(worst>w2m.d) w2m={d:worst,w:tag}; } });
  check('② 手不插進扶手、床尾板、床墊：抓著 ≤ 0.6 cm、換手的途中 ≤ 1.6 cm',w2h.d<=0.006&&w2m.d<=0.016,`抓著最深 ${cm(w2h.d)}（${w2h.w||'—'}）、途中最深 ${cm(w2m.d)}（${w2m.w||'—'}）`);
  /* ③ */
  const bad3=[]; for(const [nm,dir] of [['爬上去','up'],['爬下來','down']]){ const S=segs.filter(s=>s.dir===dir).sort((a,b)=>dir==='up'?a.dst-b.dst:b.dst-a.dst);
    S.forEach((s,k)=>{ if(k>0&&S[k-1].lead===s.lead) bad3.push(nm+' '+s.src+'→'+s.dst+' 帶頭的腳和上一段一樣'); if(s.src!==0&&s.dst!==0&&s.first!==1-s.lead) bad3.push(nm+' '+s.src+'→'+s.dst+' 先動的手不是帶頭那隻腳的對側'); }); }
  check('③ 換手的順序：帶頭的腳左右輪流、先動的手＝帶頭那隻腳的對側',segs.length>=10&&!bad3.length,bad3.join('、')||segs.map(s=>(s.dir==='up'?'上':'下')+s.dst+(s.lead?'右腳':'左腳')+'/'+(s.first?'右手':'左手')).join(' '));
  /* ④ */
  const w4={}; let w4k=0, w4l=0; for(const [nm,dir,F] of seqs) F.forEach(f=>{ if(!f.foot) return; const ft=Math.max(...f.foot.map(intoWall)), lg=Math.max(...f.leg.map(intoWall));
      if(act(f)){ const key=nm+(f.ph&&!f.ph.bed?' 第 '+(dir==='up'?f.ph.dst:f.ph.src)+' 階':' 上床點'); w4[key]=Math.max(w4[key]||-1,ft); w4l=Math.max(w4l,lg); } else if(f.pose==='kneel') w4k=Math.max(w4k,ft); });
  const w4max=Math.max(...Object.values(w4));
  check('④ 腳不進牆（爬上去、爬下來每一格：腳、腿的頂點都在牆的這一邊）',w4max<=0&&w4l<=0,'腳離牆最近 '+cm(-w4max)+'、腿最近 '+cm(-w4l)+'；每一階：'+Object.entries(w4).map(([k,v])=>k+(v>0?' 進牆 '+cm(v):' 離牆 '+cm(-v))).join('、')+'；（跪姿，沒改：腳進牆 '+cm(w4k)+'）');
  /* ⑤ */
  let w5={d:0,w:''}, w5s={lo:1,hi:-1,w:''}; for(const [nm,dir,F] of seqs) F.forEach((f,ix)=>{ if(!act(f)||!f.foot) return; for(const v of f.foot.concat(f.leg)){ const d=inStep(v); if(d>w5.d) w5={d,w:nm+' 第 '+ix+' 格'}; }
      if(f.ph&&!f.ph.bed&&(f.ph.e<=0.021||f.ph.e>=0.979)){ const node=f.ph.e<=0.021?f.ph.src:f.ph.dst, top=node?ST[node-1][1]:0; for(const side of [0,1]){ const fv=f.foot.filter(v=>(v.clone().sub(f.p).dot(new THREE.Vector3(Math.cos(f.ry),0,-Math.sin(f.ry)))>0)===(side===0)); const lo=Math.min(...fv.map(v=>v.y))-top; if(lo<w5s.lo) w5s.lo=lo; if(lo>w5s.hi){ w5s.hi=lo; w5s.w=nm+' 第 '+node+' 階'; } } } });
  check('⑤ 腳踩在踏階上：腳、腿插進踏階 ≤ 1.5 cm；站在那一階的時候兩腳最低點離踏面 −1.5～+2.5 cm',w5.d<=0.015&&w5s.lo>=-0.015&&w5s.hi<=0.025,`插進踏階最深 ${cm(w5.d)}（${w5.w||'—'}）；腳底離踏面 ${cm(w5s.lo)}～${cm(w5s.hi)}（最高 ${w5s.w}）`);
  /* ⑥ */
  const OLDC=[1.384,1.064,0.744,0.424,0.137], hmax=+SC.head_max, ceil=+SC.ceil_y; let topMax=-1, clr={}, bad6=[];
  for(const [nm,dir,F] of seqs) F.forEach(f=>{ if(f.black||f.top==null||!(f.pose==='climb'||f.pose==='climbdown'||f.pose==='kneel')) return; topMax=Math.max(topMax,f.top);
      if(act(f)&&f.ph&&!f.ph.bed&&(dir==='up'?f.ph.e>=0.979&&f.ph.dst>0:f.ph.e<=0.021&&f.ph.src>0)){ const n=dir==='up'?f.ph.dst:f.ph.src, k=(dir==='up'?'上':'下')+n; clr[k]=Math.min(clr[k]==null?9:clr[k],ceil-f.top); } });
  for(const k in clr){ const n=+k.slice(1); if(clr[k]<OLDC[n-1]-0.01) bad6.push(k+' '+clr[k].toFixed(3)); }
  check(`⑥ 頭頂：每一格 ≤ head_max ${hmax}；站在每一階離天花板不比舊的少超過 1 cm`,topMax<=hmax&&!bad6.length&&Object.keys(clr).length>=8,`最高 ${topMax.toFixed(3)} m；離天花板（m）：${Object.entries(clr).map(([k,v])=>k+' '+v.toFixed(3)).join('、')}${bad6.length?'；變少：'+bad6.join('、'):''}`);
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
  let v9={d:0,w:''}, a9={d:0,w:''}; for(const [nm,dir,F] of seqs) for(let i=1;i<F.length;i++){ const a=F[i-1], b=F[i], c=F[i+1]; const ok=f=>f&&!f.black&&!f.jump&&f.pose!=='lie'; if(!ok(a)||!ok(b)) continue;
      for(const j of JNT){ const d=b.Jl[j].distanceTo(a.Jl[j]); if(d>v9.d) v9={d,w:nm+' 第 '+i+' 格 '+j+'（'+a.pose+'→'+b.pose+'）'}; if(ok(c)){ const d2=c.Jl[j].clone().sub(b.Jl[j]).sub(b.Jl[j].clone().sub(a.Jl[j])).length(); if(d2>a9.d) a9={d:d2,w:nm+' 第 '+i+' 格 '+j+'（'+a.pose+'→'+b.pose+'→'+c.pose+'）'}; } } }
  check('⑨ 平滑：手、腳、臀部每一格移動 ≤ 12 cm、相鄰兩格移動量的差 ≤ 8 cm（人物座標）',v9.d<=0.12&&a9.d<=0.08,`每一格最大 ${cm(v9.d)}（${v9.w}）；差最大 ${cm(a9.d)}（${a9.w}）`);
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(2); });
