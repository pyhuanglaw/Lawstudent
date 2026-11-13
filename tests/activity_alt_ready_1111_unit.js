// 一起活動（AA_708@d30416e6b，X324 A 區）：98 場每場兩個選項；芷若、語彤、可昕電影第 3 場的 alt「交往中，或她的告白條件已到」（BB_342 定）。不需要瀏覽器。
//  1 98 場（七人 × 吃飯 4、咖啡 4、電影 3、書店 3）每場剛好兩個選項、都有字和回話；效果沒有負的；有 alt.opts 的也是兩個
//  2 alt 條件只有三種：sisGrad、notCafe、datingOrReady；datingOrReady 剛好三場（芷若、語彤、可昕的電影第 3 場），STUDYN.ALT 都有
//  3 datingOrReady：沒交往、告白條件沒到＝演原本的 mid；交往中＝alt 的 mid；沒交往但 DATE.canConfess ok＝alt 的 mid；看的是「那個人」不是別人
//  4 匯入工具認得這個條件（import_activity_scenes.py ALT_COND）
// 修改前（開發分支 f70d5da4d）：資料是 256bcdc42（14 場有選項）、沒有 datingOrReady → 1～4 FAIL。
// 用法：node tests/activity_alt_ready_1111_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails++; };
const J=JSON.stringify, read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const loadG=(f,names)=>{ let s=read(f); for(const n of names) s=s.replace(new RegExp('^const '+n+'\\s*=','m'),'globalThis.'+n+'='); vm.runInThisContext(s,{filename:f}); };
loadG('src/data/study_scenes.js',['STUDY_SCENES']); loadG('src/data/activity_scenes.js',['ACTIVITY_SCENES']); loadG('src/studyn3d.js',['STUDYN']);
const K=ACTIVITY_SCENES.kinds, NEED={eat:4,cafe:4,movie:3,bookstore:3};
{ let n=0; const bad=[], neg=[]; for(const kind of Object.keys(NEED)){ const P=K[kind].people; if(Object.keys(P).length!==7) bad.push(kind+' 人數 '+Object.keys(P).length);
    for(const id of Object.keys(P)){ const ks=Object.keys(P[id].scenes); if(ks.length!==NEED[kind]) bad.push(kind+'/'+id+' 場數 '+ks.length);
      for(const k of ks){ n++; const sc=P[id].scenes[k]; for(const [o,tag] of [[sc.opts,''],[sc.alt&&sc.alt.opts,'(alt)']]){ if(tag&&!o) continue; if(!Array.isArray(o)||o.length!==2||o.some(q=>!q||!String(q.t||'').trim()||!STUDYN.replyOf(q).length)) bad.push(kind+'/'+id+'/'+k+tag); for(const q of o||[]) for(const v of Object.values(q.fx||{}).concat(Object.values(q.rel||{}))) if(v<0) neg.push(kind+'/'+id+'/'+k); } } } }
  check('1. '+n+' 場每場剛好兩個選項、都有字和回話；效果沒有負的',n===98&&!bad.length&&!neg.length,J([bad.slice(0,6),neg.slice(0,6)])); }
const alts={}; for(const kind of Object.keys(NEED)) for(const id of Object.keys(K[kind].people)) for(const k of Object.keys(K[kind].people[id].scenes)){ const a=K[kind].people[id].scenes[k].alt; if(a) (alts[a.cond]=alts[a.cond]||[]).push(kind+'/'+id+'/'+k); }
check('2. alt 條件三種、STUDYN.ALT 都有；datingOrReady＝芷若、語彤、可昕的電影第 3 場',J(Object.keys(alts).sort())===J(['datingOrReady','notCafe','sisGrad'])&&Object.keys(alts).every(c=>typeof STUDYN.ALT[c]==='function')&&J(alts.datingOrReady.sort())===J(['movie/heroine_02/3','movie/heroine_03/3','movie/kexin/3']),J(alts));
{ const sc=K.movie.people.heroine_02.scenes['3'], G0={flags:{},hour:20}, GD={flags:{dating_heroine_02:1},hour:20}, GO={flags:{dating_heroine_03:1},hour:20};
  const mid=(G,who)=>J(STUDYN.resolve(G,sc,{k:3,kind:'movie',who}).mid);
  global.DATE={canConfess:(G,id)=>({ok:false})}; const a=mid(G0,'heroine_02'), b=mid(GD,'heroine_02'), c=mid(GO,'heroine_02');
  global.DATE={canConfess:(G,id)=>({ok:id==='heroine_02'})}; const d=mid(G0,'heroine_02'); global.DATE={canConfess:()=>{ throw new Error('x'); }}; const e=mid(G0,'heroine_02'); delete global.DATE;
  check('3. datingOrReady：都沒到＝原本的 mid；和她交往中＝alt；和別人交往中＝原本；她的告白條件到了＝alt；DATE 出錯＝原本（不壞）',a===J(sc.mid)&&b===J(sc.alt.mid)&&c===J(sc.mid)&&d===J(sc.alt.mid)&&e===J(sc.mid)&&J(sc.mid)!==J(sc.alt.mid),J([a===J(sc.mid),b===J(sc.alt.mid),c===J(sc.mid),d===J(sc.alt.mid),e===J(sc.mid)]));
  check('3. resolve 的結果不帶 who、alt',!('alt' in STUDYN.resolve(G0,sc,{k:3,kind:'movie',who:'heroine_02'}))&&/delete out\.who/.test(read('src/studyn3d.js'))); }
check('4. 匯入工具認得「交往中，或她的告白條件已到」→ datingOrReady',/'交往中，或她的告白條件已到': 'datingOrReady'/.test(read('tools/story/import_activity_scenes.py'))&&/@(d30416e6b|6dbfe10d7e|8d3bec48be)/.test(ACTIVITY_SCENES.src||'')/* 2026-11-13 AA_944 第 2 節（沛珊「今天」開頭 5 句）白名單換 8d3bec48be *//* 2026-11-12 CANON-NO-ECON-1112 第五批：AA_708 換 6dbfe10d7e */);
// 5（2026-11-11 X324 B 區，AA_707@1b8e247ec）一起念書 42 場（七人 × 6）每場兩個選項、沒有負的；以安第 6 場 alt anShopPage（看過手帳「想去的店」那一頁＝記憶 AN_SHOP_PAGE）有自己的兩個選項
{ const P=STUDY_SCENES.people; let n=0; const bad=[]; for(const id of Object.keys(P)) for(const k of Object.keys(P[id].scenes)){ n++; const sc=P[id].scenes[k]; for(const [o,tag] of [[sc.opts,''],[sc.alt&&sc.alt.opts,'(alt)']]){ if(tag&&!o) continue; if(!Array.isArray(o)||o.length!==2||o.some(q=>!String(q.t||'').trim()||!STUDYN.replyOf(q).length||Object.values(q.fx||{}).concat(Object.values(q.rel||{})).some(v=>v<0))) bad.push(id+'/'+k+tag); } }
  check('5. 一起念書 '+n+' 場每場兩個選項、沒有負的（@1b8e247ec）',n===42&&Object.keys(P).length===7&&!bad.length&&/@1b8e247ec/.test(STUDY_SCENES.src||''),J(bad));
  const sc=P.heroine_01.scenes['6'], G={flags:{},hour:15}; let seen=false; global.SOCIAL={has:(id,m)=>seen&&id==='heroine_01'&&m==='AN_SHOP_PAGE'};
  const a=STUDYN.resolve(G,sc,{k:6,kind:'study',who:'heroine_01'}); seen=true; const b=STUDYN.resolve(G,sc,{k:6,kind:'study',who:'heroine_01'}); delete global.SOCIAL; const c=STUDYN.resolve(G,sc,{k:6,kind:'study',who:'heroine_01'});
  check('5. 以安第 6 場：沒看過那一頁＝她手壓著下半頁＋原本的兩個選項；看過（AN_SHOP_PAGE）＝alt 的 mid＋alt 自己的兩個選項；沒有 SOCIAL 不壞',sc.alt&&sc.alt.cond==='anShopPage'&&J(a.mid)===J(sc.mid)&&J(a.opts)===J(sc.opts)&&J(b.mid)===J(sc.alt.mid)&&J(b.opts)===J(sc.alt.opts)&&J(sc.opts)!==J(sc.alt.opts)&&J(c.mid)===J(sc.mid)&&a.unlock==='an_shop1'&&b.unlock==='an_shop1'); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
