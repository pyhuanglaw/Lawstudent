// 一起活動／一起念書第 N 場被取代時「不算次數、下次再演」＋電影場的動作選項在暗的廳裡選（BB 11-11 CC 讀碼兩件，LAWWW 判、BB 同意）。不需要瀏覽器。
//  1 K.done(…,{defer:true})：總次數照加，第 N 場不推進，旗標（set）、解鎖（unlock）、念書第 6 場算約會都不做；沒有 defer 照舊推進
//  2 遊戲流程：總圖約念書，中途換成故事線那一拍 → 念書第 1 場不推進（隔天 pick 還是第 1 場）、總次數 1
//  3 遊戲流程：公館吃飯，中途換成故事線那一拍 → 吃飯第 1 場不推進、總次數 1；故事線演完那一拍的隔天再約（沒有故事線）→ 第 1 場演了才推進到第 2 場
//  4 電影（原始碼）：選項全是（…）開頭＝在暗的廳裡、小動作後面就選；with.mid 取代第 N 場＝actDefer、散場不補演、done 不推進
// 修改前（開發分支 cf6e2c1a6）：1～4 FAIL（done 不認 defer、第 N 場被跳過）。用法：node tests/act_defer_1111_unit.js
const H=require('./pg_harness.js');
const {check,GM,E}=H; const J=JSON.stringify;
const fs=require('fs'), path=require('path'), vm=require('vm'), cp=require('child_process');
const loadG=(f,names)=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let s=fs.readFileSync(p,'utf8'); for(const n of names) s=s.replace(new RegExp('^const '+n+'\\s*=','m'),'globalThis.'+n+'='); vm.runInThisContext(s,{filename:f}); return true; };
loadG("src/data/study_scenes.js",["STUDY_SCENES"]); loadG("src/data/activity_scenes.js",["ACTIVITY_SCENES"]); loadG("src/studyn3d.js",["STUDYN"]);
const ok1=loadG('src/data/heroine_arcs.js',['HEROINE_ARCS']), ok2=loadG('src/arcs3d.js',['ARCS']);
const stageOf={}; const DS=DATE.stageNum; DATE.stageNum=id=>stageOf[id]!=null?stageOf[id]:DS(id);
const fresh=(key,h,zone)=>{ const G=H.fresh(key,h,zone); G.invites=[]; G.stats=G.stats||{}; E.zone={seats:[],spawn:{x:0,z:0,yaw:0},roomAt:()=>null}; E.npcs=[]; E.player.seat=null; E.player.busy=false; E.player.lv=0; INV._now=()=>Date.now()+1e9; return G; };
const npc=id=>{ const n={id,charId:id,obj:{position:{x:1,y:0,z:0},rotation:{y:0}},beh:'idle',pose:'idle',lv:0}; GM.npc[id]=n; E.npcs.push(n); return n; };
const said=()=>H.said.map(s=>s.t);
const B=(id,n)=>HEROINE_ARCS.people[id].beats[n-1];
(async()=>{
  if(!ok2){ check('0. 有 ARCS',false); H.done(); return; }
  const AN='heroine_01';
  // 1
  { const G=fresh('2025-10-15',14,'cafe'); const K=STUDYN.act('study'), id=AN, S6=STUDY_SCENES.people[id].scenes['6'];
    K.of(G,id).k=6; const r=K.done(G,id,Object.assign({k:6},S6),{defer:true}); const U=(G.flags.STUDY_UNLOCK||{}), L=DATE.log(G,id);
    check('1. defer：總次數 +1、第 6 場不推進、沒有記旗標／解鎖／約會次數',r&&r.n===1&&r.k===6&&!(S6.set&&G.flags[S6.set]!=null)&&!(S6.unlock&&U[S6.unlock]!=null)&&L.study6==null,J({n:r&&r.n,k:r&&r.k,U,s6:L.study6}));
    G.day+=1; const r2=K.done(G,id,Object.assign({k:6},S6)); check('1. 沒有 defer：照舊推進到第 7、記旗標、解鎖、約會次數 +1',r2.k===7&&(!S6.unlock||(G.flags.STUDY_UNLOCK||{})[S6.unlock]!=null)&&DATE.log(G,id).study6!=null,J({k:r2.k})); }
  // 2
  { const G=fresh('2025-09-16',14,'library_hall'); stageOf[AN]=2; H.FRIEND(AN); H.said=[]; H.picks=[0];
    const iv=INV.accept(G,AN,'library',G.day,14,{by:'player'}); const n=npc(AN); iv.opened=1; await INV.meet(GM,iv,n,{lib:true}); const got=said(), a=B(AN,1), S1=STUDY_SCENES.people[AN].scenes['1'];
    const r=STUDYN.of(G,AN); G.day+=1; const nx=STUDYN.pick(G,AN);
    check('2. 總圖約念書、中途換成故事線第 1 拍：念書總次數 1、第 1 場不推進（隔天 pick 還是第 1 場）',got.includes(a.ask[0])&&!S1.mid.some(t=>got.includes(t))&&r.n===1&&r.k===1&&nx&&nx.k===1,J({n:r.n,k:r.k,nx:nx&&nx.k})); }
  // 3
  { const id='heroine_02', G=fresh('2025-09-17',18,'noodle'); stageOf[id]=2; H.FRIEND(id); H.said=[]; H.picks=[0,0,0];
    const iv=INV.accept(G,id,'noodle',G.day,18,{by:'player'}); const n=npc(id); await INV.meet(GM,iv,n,{}); const got=said(), a=B(id,1), K=STUDYN.act('eat'), r=K.of(G,id), E1=ACTIVITY_SCENES.kinds.eat.people[id].scenes['1'];
    check('3. 公館吃飯、中途換成故事線第 1 拍：吃飯總次數 1、第 1 場不推進、第 1 場的中途沒演',got.includes(a.ask[0])&&r.n===1&&r.k===1&&!E1.mid.some(t=>got.includes(t)),J({n:r.n,k:r.k}));
    G.day+=1; const R=ARCS.rec(G,id); const saveK=R.k; R.k=99; H.said=[]; H.picks=[0,0,0]; const iv2=INV.accept(G,id,'noodle',G.day,18,{by:'player'}); const n2=npc(id); await INV.meet(GM,iv2,n2,{}); const got2=said(); R.k=saveK;
    check('3. 隔天再約（沒有故事線那一拍）：演第 1 場的中途和選項、之後推進到第 2 場',E1.mid.some(t=>got2.includes(t))&&K.of(G,id).k===2&&K.of(G,id).n===2,J({k:K.of(G,id).k,n:K.of(G,id).n,got2:got2.slice(0,6)})); }
  // 4
  { const src=fs.readFileSync(path.join(H.ROOT,'src/invites3d.js'),'utf8');
    check('4. 電影：選項全是（…）開頭＝暗的廳裡選（STUDYN.mid 接在 SPL.dark 後面、SPL.opts 清掉）；with.mid 取代＝actDefer；散場不補演；done 帶 defer',
      /SPL\.opts&&!\(MV&&MV\.withMid\)&&SPL\.opts\.every\(q=>q&&\/\^（\/\.test/.test(src)&&/SPL\.opts=null;/.test(src)&&/if\(MV&&MV\.withMid&&AX\.k\) actDefer=true;/.test(src)&&/\(SPL\.after\.length\|\|SPL\.opts\)&&!actDefer\)/.test(src)&&/STUDYN\.act\(AKd\)\.done\(G,iv\.who,AX,\{defer:actDefer\|\|/.test(src)&&/STUDYN\.done\(G,iv\.who,SN,\{defer:!!\(ARC&&SN&&SN\.k\)\}\)/.test(src));
    const MV=ACTIVITY_SCENES.kinds.movie.people, bad=[]; for(const id in MV) for(const k in MV[id].scenes){ const o=MV[id].scenes[k].opts||[]; if(!o.length||!o.every(q=>/^（/.test(q.t))) bad.push(id+'/'+k); }
    check('4. 電影 21 場的選項都是（…）開頭（AA_708@d30416e6b）＝都會在廳裡選',!bad.length,J(bad)); }
  H.done();
})();
