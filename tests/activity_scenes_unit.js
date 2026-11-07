// 一起活動第 1～N 次：吃飯、咖啡、電影、書店（STUDY-DATE-PROGRESS-1107，USER_WANTS X263；台詞 AA_708 8af1417f2）——不需要瀏覽器（D131）。
// 使用者 11-07：「我希望每一次念書或者一起活動都要有不同 進展的感覺」
// 檢查：0 匯入一致；1 吃飯（公館燒臘）第 1 場：坐下、中途、道別都是 AA_708 的、一般的開場句不播、次數 1；同一天第二次＝一般句；隔天第 2 場
//       2 演完全部場次才輪換；3 咖啡（2:30 AM 在喝咖啡那一類）照咖啡那一套；芷若咖啡第 2 場不在 2:30 AM＝alt；4 看電影（南洋）：第 N 場的散場取代 AA_649 movieEnd
//       5 故事線（AA_712）優先：中途換成那一拍，坐下、道別照活動第 N 場；6 念書照舊用念書那一套（STUDYN），不算吃飯咖啡；7 舊存檔（沒有 ACTN）從第 1 場
// 修改前全部 FAIL（沒有 ACTIVITY_SCENES）。用法：node tests/activity_scenes_unit.js
const H=require('./pg_harness.js');
const {check,GM,E}=H; const J=JSON.stringify;
const fs=require('fs'), path=require('path'), vm=require('vm'), cp=require('child_process');
const loadG=(f,names)=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let s=fs.readFileSync(p,'utf8'); for(const n of names) s=s.replace(new RegExp('^const '+n+'\\s*=','m'),'globalThis.'+n+'='); vm.runInThisContext(s,{filename:f}); return true; };
loadG('src/data/study_scenes.js',['STUDY_SCENES']); loadG('src/data/heroine_arcs.js',['HEROINE_ARCS']); loadG('src/arcs3d.js',['ARCS']); const ok1=loadG('src/data/activity_scenes.js',['ACTIVITY_SCENES']); loadG('src/studyn3d.js',['STUDYN']);
CLS.afterSlot=async()=>false;   /* 這支測見面的內容；時段跳轉另外測 */
const stageOf={}; const DS=DATE.stageNum; DATE.stageNum=id=>stageOf[id]!=null?stageOf[id]:DS(id);
const fresh=(key,h,zone)=>{ const G=H.fresh(key,h,zone); G.invites=[]; G.stats=G.stats||{}; E.zone={seats:[],spawn:{x:0,z:0,yaw:0},roomAt:()=>null}; E.npcs=[]; E.player.seat=null; E.player.busy=false; INV._now=()=>Date.now()+1e9; return G; };
const npc=id=>{ const n={id,charId:id,obj:{position:{x:1,y:0,z:0},rotation:{y:0}},beh:'idle',pose:'idle',lv:0}; GM.npc[id]=n; E.npcs.push(n); return n; };
const said=()=>H.said.map(s=>s.t);
const AS=(kind,id,k)=>ACTIVITY_SCENES.kinds[kind].people[id].scenes[String(k)];
const meet=async(G,id,pid,h,o)=>{ H.FRIEND(id); H.said=[]; H.picks=[0,0,0]; const iv=INV.accept(G,id,pid,G.day,h,Object.assign({by:'player'},o||{})); await INV.meet(GM,iv,npc(id),{}); return iv; };
(async()=>{
  { let out='', ok=false; try{ out=cp.execFileSync('python3',[path.join(H.ROOT,'tools/story/import_activity_scenes.py'),'--check'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}); ok=/^OK/.test(out); }catch(e){ out=String(e.stderr||e.message); }
    check('0. src/data/activity_scenes.js 和 AA_708@8af1417f2 一致（import_activity_scenes.py --check）；四種活動 × 七位',ok1&&ok&&['eat','cafe','movie','bookstore'].every(k=>Object.keys(ACTIVITY_SCENES.kinds[k].people).length===7),out.trim().slice(0,160)); }
  if(!ok1||!STUDYN.act){ H.done(); return; }
  const HA=typeof ARCS!=='undefined'; if(HA) ARCS.pick=()=>null;   /* 1～4 先不讓故事線插進來（5 另外測）*/
  const AN='heroine_01';
  /* 1 吃飯 */
  { const G=fresh('2025-10-15',18,'noodle'); stageOf[AN]=2; await meet(G,AN,'noodle',18); const S1=AS('eat',AN,1), got=said();
    check('1. 吃飯（公館燒臘）第 1 場：坐下、中途、道別都是 AA_708 的',got.includes(S1.seat[0])&&got.indexOf(S1.mid[0])>got.indexOf(S1.seat[0])&&got.includes(S1.bye[0]),J(got));
    check('1. 一般的開場句（AA_649 第 4 節 seatOpen.meal）不播',!INVITE_DATA.seatOpen.meal.some(L=>L.some(t=>got.includes(t))),J(got));
    check('1. 吃飯次數 1、下一場第 2 場；念書次數不動',STUDYN.act('eat').count(G,AN)===1&&STUDYN.act('eat').of(G,AN).k===2&&STUDYN.count(G,AN)===0);
    await meet(G,AN,'noodle',19.5); check('1. 同一天再吃一次：不演第 2 場（一般句）、次數不加',!said().includes(AS('eat',AN,2).seat[0])&&STUDYN.act('eat').count(G,AN)===1,J(said()));
    G.day+=1; G.hour=18; await meet(G,AN,'noodle',18); check('1. 隔天：第 2 場',said().includes(AS('eat',AN,2).seat[0]),J(said())); }
  /* 2 輪換 */
  { const G=fresh('2025-10-15',18,'noodle'); stageOf[AN]=6; const K=STUDYN.act('eat'), N=K.size(AN); K.of(G,AN).k=N+1; const r=K.pick(G,AN);
    check('2. 第 '+N+' 場都演過以後：輪換（rot）',r&&r.rot!=null&&!r.k,J(r)); }
  /* 3 咖啡、alt */
  { const G=fresh('2025-10-15',15,'cafe'); stageOf[AN]=2; await meet(G,AN,'cafe',15); check('3. 2:30 AM（喝咖啡）：咖啡第 1 場',said().includes(AS('cafe',AN,1).seat[0]),J(said()));
    const ZR='heroine_02', A=AS('cafe',ZR,2).alt; const G2=fresh('2025-10-15',15,'afar'); STUDYN.act('cafe').of(G2,ZR).k=2; stageOf[ZR]=4; const a=STUDYN.act('cafe').pick(G2,ZR);
    const G3=fresh('2025-10-15',15,'cafe'); STUDYN.act('cafe').of(G3,ZR).k=2; const b=STUDYN.act('cafe').pick(G3,ZR);
    check('3. 芷若咖啡第 2 場：不在 2:30 AM（afar）＝alt；在 2:30 AM＝原本的',A&&A.cond==='notCafe'&&a&&b&&(A.seat?a.seat[0]===A.seat[0]:a.mid[0]===A.mid[0])&&b.seat[0]===AS('cafe',ZR,2).seat[0],J([a&&a.seat[0],b&&b.seat[0]])); }
  /* 4 電影 */
  { const G=fresh('2025-10-18',14,'xs_nanyang'); stageOf[AN]=3; await meet(G,AN,'xs_nanyang',14); const M1=AS('movie',AN,1), got=said();
    check('4. 看電影第 1 場：坐下、中途、散場是 AA_708 的；AA_649 的 movieEnd 不播',got.includes(M1.seat[0])&&got.includes(M1.mid[0])&&got.includes(M1.bye[0])&&!INVITE_DATA.seatOpen.movieEnd.some(L=>L.some(t=>got.includes(t))),J(got)); }
  /* 5 故事線優先 */
  if(HA){ const pick0=ARCS.pick; delete ARCS.pick; loadG('src/arcs3d.js',['ARCS']); const G=fresh('2025-10-15',18,'noodle'); stageOf[AN]=2; await meet(G,AN,'noodle',18); const S1=AS('eat',AN,1), B1=HEROINE_ARCS.people[AN].beats[0], got=said();
    check('5. 故事線第 1 拍優先：中途換成那一拍（她說的事、問你），坐下、道別照吃飯第 1 場；吃飯次數照算',got.includes(B1.lines[0])&&got.includes(S1.seat[0])&&got.includes(S1.bye[0])&&!S1.mid.some(t=>got.includes(t))&&STUDYN.act('eat').count(G,AN)===1,J(got)); ARCS.pick=()=>null; }
  else check('5. （沒有載入 ARCS，略過）',true);
  /* 6 念書 */
  { const G=fresh('2025-10-15',15,'cafe'); stageOf[AN]=2; await meet(G,AN,'cafe',15,{cat:'study'});
    check('6. 2:30 AM 在念書那一類：照念書那一套（STUDYN），不算咖啡',STUDYN.count(G,AN)===1&&STUDYN.act('cafe').count(G,AN)===0&&said().includes(STUDY_SCENES.people[AN].scenes['1'].seat[0]),J(said())); }
  /* 7 舊存檔 */
  { const G=fresh('2025-10-15',15,'cafe'); delete G.flags.ACTN; let err=null, r=null; try{ r=STUDYN.act('bookstore').pick(G,'kexin'); }catch(e){ err=e; } check('7. 舊存檔沒有 ACTN：從第 1 場、不丟例外',!err&&(r&&(r.k===1||r.generic)),String(err)+J(r)); }
  H.done();
})().catch(e=>{ console.error(e); console.log('FAILED (exception)'); process.exit(1); });
