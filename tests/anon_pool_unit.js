// 路人底模的分批載入池（character3d.js 的 CHAR.anonPool；assets3d.js 的 ASSETS.unloadVRM）——不需要瀏覽器。
// 使用者 2026-10-17 P0（經 LAWWW2-C、AA-C 轉達）：「長得很像的路人真的太多了」「路人數量要再加倍」「男生女生各 20 種」。
// 1. 預設打開：LAWWW2 的路人底模都在 manifest（anon、lazy、ambient、有性別）；開場的預載清單（不是 lazy 的）裡沒有它們。網址加 ?npcold 回到舊的四個樣本。
// 2. 還沒下載完：路人先建成隱藏的備用人物（degradedHidden，不露出方塊人）、不算載入失敗；池子在背景下載，到了 needsUpgrade／upgrade 換成分到的底模。
// 3. 同一個區域：每個路人分到「目前分得最少」的底模（8 女分到 4 個底模＝每個 2 次）；有名字的人物照舊用可換色的模型＋自己的顏色，無名路人不會分到舊樣本。
// 4. 輪替：池子比全部小時，換區域（refresh）往後移一格——女、男各換 1 個新的、其他留著（PERF-NPC-POOL-1022：原本全部換新，換區域以後最大的卡）；走幾個區域全部輪過一次；
//    上一輪有、這一輪沒挑到、也沒有人在用的放掉（ASSETS.has 變 false），還有人在用的留著。
// 5. ASSETS.unloadVRM：樣板借出或有複製品時不放；都還回去才放；放掉以後可以重新下載。
// 修改前（?npcnew 才載入、全部一起預載、沒有輪替）：第 1 段「預設打開」、第 4、5 段失敗。用法：node tests/anon_pool_unit.js
// 第 4 段的「每次只換 1 女 1 男」：修改前（開發分支 5c2a173f，一次 8 個全部換新）FAIL。
const {execFileSync}=require('child_process');
const fs=require('fs'), path=require('path');
const OLD=['char.npc_m1','char.npc_m2','char.npc_f1','char.npc_f2'];
const NAMED=[['npc_fangyt','m'],['npc_huangxh','f'],['npc_ta_chen','m'],['classmate_u01','m'],['classmate_u02','f'],['prof_zhou','m']];
if(process.argv[2]==='child'){
  if(process.argv[3]==='npcold') global.location={search:'?npcold'};
  const {ROOT,preload}=require('../tools/dev_scratch/spring_sim/harness.js');
  const M=ASSETS.manifest, ANON=Object.keys(M).filter(k=>M[k].anon), out={};
  out.anon=ANON.map(k=>({k,lazy:!!M[k].lazy,ambient:!!M[k].ambient,sex:M[k].sex}));
  out.bootList=Object.keys(M).filter(k=>!M[k].lazy).filter(k=>ANON.includes(k));
  const sexOf=k=>M[k]&&M[k].sex;
  /* 和 STORY.extraSpec 同一個樣子（備用的程序化人物要用到頭髮、衣服、鞋子）*/
  const X=(id,sex,top)=>({id,name:'',height:sex==='f'?1.6:1.72,build:'slim',sex,skin:'#efd0b3',hair:{color:'#2a1d16',style:sex==='f'?'softMid':'shortClean'},face:{iris:'#3a2a22',brow:'soft',lash:sex==='f'},outfit:{top:{type:'tee',color:top||'#123456',inner:'#ffffff'},bottom:{type:'jeans',color:'#4a5a78'},shoes:{type:'sneaker',color:'#f4f1ea',sole:'#ffffff'}},posture:{sway:0.02}});
  const settle=()=>Promise.all(Object.keys(M).filter(k=>ANON.includes(k)&&ASSETS.status[k]&&!ASSETS.cache[k]).map(k=>ASSETS.status[k].catch(()=>{})));
  (async()=>{
    await preload(OLD);
    if(process.argv[3]==='npcold'){ out.old=[]; for(let i=0;i<8;i++) out.old.push(CHAR.resolveModel({id:'x'+i,sex:i%2?'m':'f'}).model); console.log(JSON.stringify(out)); process.exit(0); }
    window.ASSET_DATA=window.ASSET_DATA||{}; for(const k of ANON) window.ASSET_DATA[M[k].url]=fs.readFileSync(path.join(ROOT,M[k].url)).toString('base64');   /* 有資料但還沒載入（refresh 才下載）*/
    out.loadedBefore=ANON.filter(k=>ASSETS.has(k));
    // 2. 還沒下載完
    const f0=CHAR.failures.length; const h=CHAR.build(X('x0','f'));
    out.early={driver:h.userData.driver,hidden:!!h.userData.degradedHidden,newFailures:CHAR.failures.slice(f0),loading:CHAR.anonPool.cur.filter(k=>ASSETS.status[k]).length,cur:CHAR.anonPool.cur.slice()};
    await settle();
    out.early.needs=CHAR.needsUpgrade(h); const nh=CHAR.upgrade(h); out.early.after=nh?{driver:nh.userData.driver,key:nh.userData.key,hidden:!!nh.userData.degradedHidden}:null; if(nh) CHAR.release(nh);
    // 3. 同一個區域的分配
    CHAR.anonPool.refresh('campus'); await settle(); const picks=[]; for(let i=0;i<16;i++){ const sx=i%2?'m':'f'; picks.push(CHAR.resolveModel(X('x'+i,sx)).model); }
    out.picks=picks; out.pickSexOk=picks.every((k,i)=>sexOf(k)===(i%2?'m':'f')); out.uses=Object.assign({},CHAR.anonPool.uses);
    out.again=CHAR.resolveModel(X('x3','m')).model===picks[3];   /* 同一個人在同一個區域裡不會換底模（upgrade 重算也一樣）*/
    out.named=NAMED.map(([id,sx])=>{ const r=CHAR.resolveModel({id,sex:sx,hair:{color:'#2a1d16'},outfit:{top:{color:'#e0b95b'},bottom:{color:'#4a5a78'}}}); return {id,model:r.model,top:r.tint&&r.tint.top}; });
    // 4. 輪替與放掉
    CHAR.anonPool.size={f:2,m:2}; const A=CHAR.anonPool.refresh('gongguan').slice(); await settle(); out.A=A; out.Aloaded=A.every(k=>ASSETS.has(k));
    const hold=CHAR.build({model:A[0],height:1.6});   /* A[0] 有人在用（例：還沒釋放的騎士）*/
    const B=CHAR.anonPool.refresh('wenzhou').slice(); await settle(); out.B=B;
    out.disjoint=A.every(k=>!B.includes(k)); out.union=[...new Set(A.concat(B))].length; out.nAnon=ANON.length;
    out.unloadedA=A.slice(1).filter(k=>!ASSETS.has(k)); out.heldKept=ASSETS.has(A[0]); out.Bloaded=B.every(k=>ASSETS.has(k));
    out.notPicked=ANON.filter(k=>!B.includes(k)&&k!==A[0]&&ASSETS.has(k));   /* 這一輪沒挑到、沒人在用的都放掉了（不只上一輪的）*/
    out.low=CHAR.anonPool.refresh('wenzhou','low').length; CHAR.anonPool.size={f:2,m:2}; CHAR.anonPool.refresh('campus'); await settle();   /* 畫質低：3＋3（這裡只有 4＋4 個底模，挑 6 個）；再回到 2＋2 */
    // 5. unloadVRM
    out.unloadWhileHeld=ASSETS.unloadVRM(A[0]); CHAR.release(hold); out.unloadAfterRelease=ASSETS.unloadVRM(A[0]); out.goneAfter=!ASSETS.has(A[0]);
    const k2=B[0]; await ASSETS.loadOne(k2); const c1=CHAR.build({model:k2,height:1.6}), c2=CHAR.build({model:k2,height:1.6}); out.twoVrm=[c1,c2].map(x=>x.userData.key);   /* 上面換過池子，k2 可能已經放掉：先載回來 */
    out.unloadWithClone=ASSETS.unloadVRM(k2); CHAR.release(c2); out.unloadTplOnly=ASSETS.unloadVRM(k2); CHAR.release(c1);
    const T=new Set(); ASSETS.cache[k2].tpl.vrm.scene.traverse(o=>{ for(const m of [].concat(o.material||[])){ if(m&&m.uniforms) for(const q in m.uniforms){ const v=m.uniforms[q]&&m.uniforms[q].value; if(v&&v.isTexture) T.add(v); } } }); let disp=0; for(const t of T) t.addEventListener('dispose',()=>disp++);
    out.unloadFree=ASSETS.unloadVRM(k2); out.texFreed=[disp,T.size];   /* MToon 的貼圖在 uniforms（batch 16：沒放掉，換區域貼圖一直長）*/
    await ASSETS.loadOne(k2); out.reload=ASSETS.has(k2)&&CHAR.build({model:k2,height:1.6}).userData.driver;
    out.unloadedCount=ASSETS.unloaded|0;
    // 4b. 每次換區域只換 1 女 1 男（PERF-NPC-POOL-1022）：只看挑了哪幾個，不真的下載
    { const lo=ASSETS.loadOne, un=ASSETS.unloadVRM; ASSETS.loadOne=()=>Promise.resolve(); ASSETS.unloadVRM=()=>false; CHAR.anonPool.size={f:4,m:4};
      let prev=CHAR.anonPool.refresh('campus').slice(); const seen=new Set(prev), news=[];
      for(let i=0;i<24;i++){ const cur=CHAR.anonPool.refresh('z'+i).slice(); news.push(cur.filter(k=>!prev.includes(k)).map(sexOf).sort().join('')); cur.forEach(k=>seen.add(k)); prev=cur; }
      out.rot={news,seen:seen.size,n:ANON.length}; ASSETS.loadOne=lo; ASSETS.unloadVRM=un; }
    console.log(JSON.stringify(out)); process.exit(0);
  })().catch(e=>{ console.log(JSON.stringify({error:String(e&&e.stack||e)})); process.exit(1); });
} else {
  let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
  const run=mode=>{ try{ const s=execFileSync(process.execPath,[__filename,'child',mode],{encoding:'utf8',maxBuffer:1<<24}); return JSON.parse(s.trim().split('\n').pop()); }catch(e){ return {error:String(e.stdout||e.message).slice(-800)}; } };
  const d=run('default'), o=run('npcold');
  if(d.error) console.log(d.error);
  const fN=(d.anon||[]).filter(a=>a.sex==='f').length, mN=(d.anon||[]).filter(a=>a.sex==='m').length;
  check('1. 預設打開：路人底模在 manifest（女 '+fN+'、男 '+mN+'），都是 anon＋lazy＋ambient、有性別',!d.error&&fN>=4&&mN>=4&&d.anon.every(a=>a.lazy&&a.ambient&&(a.sex==='f'||a.sex==='m')),JSON.stringify(d.anon));
  check('1. 開場的預載清單裡沒有路人底模（lazy）',!d.error&&d.bootList.length===0&&d.loadedBefore.length===0,JSON.stringify([d.bootList,d.loadedBefore]));
  check('1. ?npcold：manifest 裡沒有路人底模，無名路人用舊的四個樣本',!o.error&&o.anon.length===0&&o.old.every(k=>OLD.includes(k)),JSON.stringify(o.error||o.old));
  const e=d.early||{};
  check('2. 還沒下載完：先建成隱藏的備用人物，不算載入失敗，池子在背景下載',e.driver==='proc'&&e.hidden&&!(e.newFailures||[]).length&&e.loading>0,JSON.stringify(e));
  check('2. 下載完：needsUpgrade → 換成分到的女生底模，看得到',e.needs===true&&e.after&&e.after.driver==='vrm'&&(d.anon||[]).some(a=>a.k===e.after.key&&a.sex==='f')&&!e.after.hidden,JSON.stringify(e.after));
  const u=d.uses||{}, uv=Object.values(u);
  check('3. 同一個區域：16 個路人（8 女 8 男）平均分到池子裡的底模（每個 2 次）、性別對',d.pickSexOk&&uv.length===8&&uv.every(n=>n===2),JSON.stringify(u));
  check('3. 同一個人在同一個區域裡不會換底模',d.again===true);
  check('3. 無名路人不會分到舊樣本（npc_f1／f2／m1／m2）',(d.picks||[]).length===16&&d.picks.every(k=>!OLD.includes(k)),JSON.stringify(d.picks));
  check('3. 有名字的人物用可換色的舊模型＋自己的顏色',(d.named||[]).every(q=>OLD.includes(q.model)&&q.top==='#e0b95b'),JSON.stringify(d.named));
  { const A=d.A||[], B=d.B||[], nw=B.filter(k=>!A.includes(k));
    check('4. 池子比全部小（2＋2）：換區域往後移一格——女、男各換 1 個新的，另一個留著（A 的第 2、4 個還在 B 裡）',d.Aloaded&&d.Bloaded&&A.length===4&&B.length===4&&B.includes(A[1])&&B.includes(A[3])&&nw.length===2&&nw.map(k=>(d.anon.find(a=>a.k===k)||{}).sex).sort().join('')==='fm'&&d.union===6,JSON.stringify([A,B]));
    check('4. 上一輪有、這一輪沒挑到、沒人在用的放掉（A 的第 3 個）；還有人在用的留著（A 的第 1 個）；這一輪沒挑到的都不在記憶體',JSON.stringify(d.unloadedA)===JSON.stringify([A[2]])&&d.heldKept===true&&(d.notPicked||[]).length===0,JSON.stringify([d.unloadedA,d.heldKept,d.notPicked])); }
  { const r=d.rot||{};
    check('4. 池子 4＋4、換 24 次區域：每一次都只換 1 女 1 男（原本 8 個全部換新），24 次以內全部 '+(r.n||'?')+' 個底模都輪過',(r.news||[]).length===24&&r.news.every(x=>x==='fm')&&r.seen===r.n,JSON.stringify({news:(r.news||[]).slice(0,6),seen:r.seen,n:r.n})); }
  check('4. 畫質低：池子 3 女＋3 男',d.low===6,String(d.low));
  check('5. unloadVRM：樣板借出時不放、還回去才放',d.unloadWhileHeld===false&&d.unloadAfterRelease===true&&d.goneAfter===true);
  check('5. unloadVRM：有複製品時不放（樣板＋複製品都還才放）',(d.twoVrm||[]).length===2&&d.twoVrm.every(k=>k===(d.B||[])[0])&&d.unloadWithClone===false&&d.unloadTplOnly===false&&d.unloadFree===true,JSON.stringify([d.twoVrm,d.unloadWithClone,d.unloadTplOnly,d.unloadFree]));
  check('5. 放掉的時候貼圖全部釋放（MToon 的 uniforms 裡的貼圖也算；修正前 0 張）',!!d.texFreed&&d.texFreed[1]>10&&d.texFreed[0]===d.texFreed[1],JSON.stringify(d.texFreed));
  check('5. 放掉以後可以重新下載、建得出來',d.reload==='vrm',String(d.reload));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
}
