// 故事線那一拍不演的時候：中途說她最近的事（AA_717 578ba675e；BB_305 第 5、6 節；STUDY-DATE-PROGRESS-1107、USER_WANTS X263）——不需要瀏覽器（D131）。
// 使用者 11-07 03:2x：「每次念書都講一樣的話……我希望每一次念書或者一起活動都要有不同 進展的感覺」
// 檢查：
//   0 匯入一致（import_arc_rot.py --check）；七位都有輪換句、都有 life
//   1 when：期末週說期末那句、颱風當天和隔天說颱風、過年前兩週說過年、開學第一週、某月；條件不合不說
//   2 最近 3 次見面用過的不挑；同一層都用過＝往下一層；全部用過＝挑最久以前用過的
//   3 beat／if：故事線走到那一拍以後、你那一拍選了那個才說
//   4 life／lifeMax：只看日期（沒約她也往前）；過了那一階不說
//   5 from／until（學姊學游泳那三週）、alt（學姊：知道 Alison）
//   6 遊戲流程：吃飯第 7 次以後（AA_708 的第 N 場演完）、故事線今天演過 → 中途說輪換句、時間一半一半；沒條件那一層和活動自己的輪換句輪流
//   7 舊存檔（沒有 BEATS）不丟例外
// 修改前全部 FAIL（沒有 ARCS.rotPick）。用法：node tests/arc_rot_unit.js
const H=require('./pg_harness.js');
const {check,GM,E}=H; const J=JSON.stringify;
const fs=require('fs'), path=require('path'), vm=require('vm'), cp=require('child_process');
const loadG=(f,names)=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let s=fs.readFileSync(p,'utf8'); for(const n of names) s=s.replace(new RegExp('^const '+n+'\\s*=','m'),'globalThis.'+n+'='); vm.runInThisContext(s,{filename:f}); return true; };
loadG('src/data/study_scenes.js',['STUDY_SCENES']); loadG('src/data/activity_scenes.js',['ACTIVITY_SCENES']); loadG('src/studyn3d.js',['STUDYN']);
loadG('src/data/heroine_arcs.js',['HEROINE_ARCS']); const ok1=loadG('src/data/arc_rot.js',['ARC_ROT']), ok2=loadG('src/arcs3d.js',['ARCS']);
const stageOf={}; const DS=DATE.stageNum; DATE.stageNum=id=>stageOf[id]!=null?stageOf[id]:DS(id);
const fresh=(key,h,zone)=>{ const G=H.fresh(key,h,zone); G.invites=[]; G.stats=G.stats||{}; E.zone={seats:[],spawn:{x:0,z:0,yaw:0},roomAt:()=>null}; E.npcs=[]; E.player.seat=null; E.player.busy=false; E.player.lv=0; INV._now=()=>Date.now()+1e9; return G; };
const npc=id=>{ const n={id,charId:id,obj:{position:{x:1,y:0,z:0},rotation:{y:0}},beh:'idle',pose:'idle',lv:0}; GM.npc[id]=n; E.npcs.push(n); return n; };
const said=()=>H.said.map(s=>s.t);
const AN='heroine_01', SIS='heroine_05';
const RL=id=>ARC_ROT.rot[id];
const idx=(id,f)=>RL(id).findIndex(f);
(async()=>{
  { let out='', ok=false; try{ out=cp.execFileSync('python3',[path.join(H.ROOT,'tools/story/import_arc_rot.py'),'--check'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}); ok=/^OK/.test(out); }catch(e){ out=String(e.stderr||e.message); }
    check('0. src/data/arc_rot.js 和 AA_717@578ba675e 一致（import_arc_rot.py --check）',ok1&&ok2&&ok,out.trim().slice(0,200));
    const ids=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','classmate_peishan','kexin'];
    check('0. 七位都有輪換句（各 15 則以上）和 life',ok1&&ids.every(id=>(ARC_ROT.rot[id]||[]).length>=15&&(ARC_ROT.life[id]||[]).length>=7),J(ok1&&ids.map(id=>[(ARC_ROT.rot[id]||[]).length,(ARC_ROT.life[id]||[]).length]))); }
  if(!ok2||!ARCS.rotPick){ check('ARCS.rotPick 存在',false); H.done(); return; }
  /* 1 when */
  { const iF=idx(AN,x=>x.when==='final'), iT=idx(AN,x=>x.when==='typhoon'), iC=idx(AN,x=>x.when==='cny2w'), iW=idx(AN,x=>x.when==='week1'), iM=idx(AN,x=>x.when==='month:5');
    const at=k=>{ const G=fresh(k,14,'cafe'); return [G,ARCS.rotPick(G,AN,{})]; };
    { const T=CALENDAR.TERMS.find(t=>t.id==='Y1S1'); const d0=STORY.dayOfKey(T.start)+15*7+2; const G=fresh('2025-09-16',14,'cafe'); G.day=d0; const r=ARCS.rotPick(G,AN,{});
      check('1. 期末週（第 16 週）：說期末那句（when 最優先）',r&&r.tier===2&&RL(AN)[r.rot].when==='final',J(r)); }
    { const [G,r]=at('2025-10-13'); const [G2,r2]=at('2025-10-14'); const [G3,r3]=at('2025-10-16');
      check('1. 颱風假當天、隔天：說颱風那句；過兩天不說',r&&r.rot===iT&&r2&&r2.rot===iT&&!(r3&&r3.rot===iT),J([r&&r.rot,r2&&r2.rot,r3&&r3.rot,iT])); }
    { const [G,r]=at('2026-02-07'); const [G2,r2]=at('2026-01-20');
      check('1. 過年前兩週（2026 除夕前 10 天）說過年那句；一個月前不說',r&&r.rot===iC&&!(r2&&r2.rot===iC),J([r&&r.rot,r2&&r2.rot,iC])); }
    { const T=CALENDAR.TERMS.find(t=>t.id==='Y1S2'); const [G,r]=at(T.start); check('1. 開學第一週（大一下第 1 天）：說課表那句',r&&r.rot===iW,J([r,iW,T.start])); }
    { const [G,r]=at('2026-05-20'); check('1. 五月（不是考試週）：說下雨那句',r&&r.rot===iM,J([r,iM])); }
    { const [G,r]=at('2025-10-21'); check('1. 平常的日子：when 的都不說',r&&!RL(AN)[r.rot].when,J(r)); } }
  /* 2 最近 3 次用過的不挑 */
  { const G=fresh('2025-10-21',14,'cafe'); const seen=[]; for(let i=0;i<6;i++){ const r=ARCS.rotPick(G,AN,{}); seen.push(r&&r.rot); ARCS.rotDone(G,AN,r); }
    const nOk=RL(AN).filter(x=>ARCS.rotTier(G,AN,x)>=0).length, win=Math.min(3,nOk-1); const rep=seen.some((v,i)=>seen.slice(Math.max(0,i-win),i).includes(v));
    check('2. 連續 6 次見面：沒有和前 '+win+' 次重複的（能說的 '+nOk+' 則；最多看前 3 次）；先說條件具體的（life），再說沒條件的',!rep&&ARCS.rec(G,AN).rot.length===3&&RL(AN)[seen[0]].life!=null,J({seen,rot:ARCS.rec(G,AN).rot}));
    G.day=STORY.dayOfKey('2026-05-20'); const s2=[]; for(let i=0;i<6;i++){ const r=ARCS.rotPick(G,AN,{}); s2.push(r&&r.rot); ARCS.rotDone(G,AN,r); }
    const n2=RL(AN).filter(x=>ARCS.rotTier(G,AN,x)>=0).length, w2=Math.min(3,n2-1);
    check('2. 五月（能說的 '+n2+' 則）連續 6 次：先說下雨那句、沒有和前 '+w2+' 次重複',s2[0]===idx(AN,x=>x.when==='month:5')&&!s2.some((v,i)=>s2.slice(Math.max(0,i-w2),i).includes(v)),J(s2)); }
  /* 3 beat／if */
  { const G=fresh('2025-10-21',14,'cafe'); const i=idx(AN,x=>x.if==='ans:PL_WANT'); const r=ARCS.rec(G,AN);
    const can=()=>ARCS.rotTier(G,AN,RL(AN)[i]);
    const a=can(); r.k=3; const b=can(); r.ans.PL_WANT={opt:0,day:G.day}; r.k=2; const c=can(); r.k=3; const d=can();
    check('3. 「想去就是理由」：故事線第 2 拍演過、而且你那一拍選了 PL_WANT 才說',a<0&&b<0&&c<0&&d===1,J([a,b,c,d])); }
  /* 4 life */
  { const G=fresh('2025-10-21',14,'cafe'); const i1=idx(AN,x=>x.life===1), i5=idx(AN,x=>x.life===5);
    const s1=ARCS.lifeStage(G,AN); const t1=ARCS.rotTier(G,AN,RL(AN)[i1]), t5=ARCS.rotTier(G,AN,RL(AN)[i5]);
    G.day=STORY.dayOfKey('2026-10-20'); const s2=ARCS.lifeStage(G,AN); const u1=ARCS.rotTier(G,AN,RL(AN)[i1]), u5=ARCS.rotTier(G,AN,RL(AN)[i5]);
    check('4. 以安：大一上（第 1 階）說「跟我媽吃飯」、不說家教；大二上（第 5 階，沒約她也一樣）說家教、不說第 1 階那句',s1===1&&t1===1&&t5<0&&s2===5&&u1<0&&u5===1,J({s1,t1,t5,s2,u1,u5,state:ARCS.lifeState(G,AN)})); }
  /* 5 from／until、alt */
  { const iS=idx(SIS,x=>x.from==='2026-06-15'), iA=idx(SIS,x=>x.alt);
    const G=fresh('2026-06-20',14,'cafe'); const a=ARCS.rotTier(G,SIS,RL(SIS)[iS]); G.day=STORY.dayOfKey('2026-07-10'); const b=ARCS.rotTier(G,SIS,RL(SIS)[iS]);
    check('5. 學姊學游泳那三週（6/15～7/5）才說；7/10 不說',a===1&&b<0,J([a,b]));
    const G2=fresh('2025-10-21',14,'cafe'); const tierA=ARCS.rotTier(G2,SIS,RL(SIS)[iA]); const A=RL(SIS)[iA];
    G2.flags.BEATS=G2.flags.BEATS||{}; const r=ARCS.rec(G2,SIS); r.rot=RL(SIS).map((_,i)=>i).filter(i=>i!==iA).slice(-3);
    const pickOf=()=>{ for(let n=0;n<40;n++){ const p=ARCS.rotPick(G2,SIS,{}); if(p&&p.rot===iA) return p; ARCS.rotDone(G2,SIS,p); } return null; };
    const p1=pickOf(); G2.flags.KNOWS_SIS_ALISON=G2.day; r.rot=[]; const p2=pickOf();
    check('5. 學姊那一則：不知道 Alison 說原本的；知道以後說 alt（「Alison 昨天問我…」）',tierA>=0&&p1&&p1.lines[0]===A.lines[0]&&p2&&p2.lines[0]===A.alt.lines[0],J({tierA,p1:p1&&p1.lines[0],p2:p2&&p2.lines[0]})); }
  /* 6 遊戲流程 */
  { const id='heroine_02', w={name:'林芷若',charId:id}; const G=fresh('2025-10-21',18,'noodle'); stageOf[id]=3; H.FRIEND(id);
    const AXk=STUDYN.act('eat'); const N=AXk.size(id); const ar=AXk.of(G,id); ar.k=N+1; ar.n=N; const br=ARCS.rec(G,id); br.last=G.day;   /* 吃飯第 N 場都演完了；故事線今天演過 */
    H.said=[]; H.picks=[0]; const iv=INV.accept(G,id,'noodle',G.day,18,{by:'player'}); const n=npc(id); const h0=G.hour; await INV.meet(GM,iv,n,{}); const got=said();
    const used=ARCS.rec(G,id).rot||[]; const u=used[used.length-1]; const L=u!=null?RL(id)[u].lines:[];
    check('6. 吃飯第 '+(N+1)+' 次、故事線今天演過：中途說她最近的事（AA_717）、時間照 stay 走完',u!=null&&L.every(t=>got.includes(t))&&Math.abs(G.hour-h0-INV.place('noodle').stay)<0.01,J({u,got,dh:G.hour-h0}));
    const hasAct=!!(ACTIVITY_SCENES.people&&ACTIVITY_SCENES.people[id]&&ACTIVITY_SCENES.people[id].eat&&(ACTIVITY_SCENES.people[id].eat.rot||[]).length);
    const G2=fresh('2025-10-22',18,'noodle'); const r2=ARCS.rec(G2,id); r2.last=G2.day; r2.rot=RL(id).map((_,i)=>i).filter(i=>ARCS.rotTier(G2,id,RL(id)[i])>0); r2.rotSrc='arc';
    const p=ARCS.rotPick(G2,id,{alt:true}); const q=ARCS.rotPick(G2,id,{alt:false});
    check('6. 沒條件那一層：上次用了這一份、活動自己也有輪換句＝這次輪活動的（null）；沒有活動的輪換句＝照樣說這一份',p===null&&q&&q.tier===0,J({p,q,hasAct})); }
  /* 7 舊存檔 */
  { const G=fresh('2025-10-21',14,'cafe'); delete G.flags.BEATS; let err=null, r=null; try{ r=ARCS.rotPick(G,'kexin',{}); }catch(e){ err=e; }
    check('7. 舊存檔沒有 BEATS：不丟例外、有句子',!err&&r&&r.lines&&r.lines.length,String(err)); }
  H.done();
})().catch(e=>{ console.error(e); console.log('FAILED (exception)'); process.exit(1); });
