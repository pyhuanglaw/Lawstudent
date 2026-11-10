// 約看電影真的進 1 廳看、片單、海報（MOVIE-REAL-1110；USER_WANTS X274）——不需要瀏覽器（D131）。
// 使用者 11-10 01:1x：「約看電影 根本沒進場 還在買票區的椅子上就看完了? 而且應該要有什麼電影的資訊吧 至少你可以規定大幾的幾月到幾月是什麼電影? 再跟我要電影海報 請AA寫是什麼電影 BB跟我要電影海報」
// 片單 AA_730（48c0428ab，src/data/nanyang_movies.js）；播放、選片 src/movies3d.js；見面 src/invites3d.js S.meet。檢查：
//   0. 片單和白名單上的 AA_730 一致（import_nanyang_movies.py --check）、36 段 72 部；index.html 載入片單和 movies3d.js（在 invites3d、nanyang3d、aa614 之後）
//   1. 哪個月上映哪兩部：2025-10＝第十三號月台／三份證詞；2026-04＝斷橋以後／沉默的書記官；2024-09 以前＝第一段、2030-08 以後＝最後一段
//   2. 挑片（AA_730 pick）：以安第 1 場 want court/mystery（兩部都有、兩部都 fits 她＝第一部）；語彤 2026-05 沒寫 sceneFilm＝fits 她的那部（老茶行）；
//      朋友＝第一部；子晴第 1 場 want action、2025-11 兩部都沒有 action＝對不上（ok false，片照 fits）
//   3. 約的時候就定：INV.accept 存 iv.film；約的標籤和訊息寫「看《片名》」；她自己傳的那一句（offer 有 text）不改
//   4. 見面（INV.startTogether → S.meet）：大廳不坐長椅；會合以後換到 1 廳、你坐走道那一張、她坐你左手邊那一張（同一排、差 0.58 m）；
//      燈暗那一句在 1 廳、場燈關的時候說、寫片名（dimTitle）；散場以後回大廳說道別；最後場燈打開；票這一場用掉（NY_WATCHED）
//   5. 對不上的那一場（子晴第 1 場、2025-11）：這次演一般句、次數 +1、下次還是第 1 場；輪換對不上跳到下一則
//   6. 沒有 1 廳（Z3 沒有 xs_nanyang_hall）＝照舊在大廳演、燈暗那一句一樣寫片名、不卡住
//   7. 舊存檔的約（沒有 iv.film）：開演時才挑；存檔 JSON 來回不壞
//   8. 大廳「看今日放映」：nowBoard（兩部片名）＋兩部各一句；一個人在 1 廳坐下看＝solo 三句（片名照那一段）
//   9. 海報：10 張在 assets/posters、LICENSES.md 有記；MOVIES.posterUrl 只給有圖的
// 修改前（06e779533）FAIL。用法：node tests/movie_real_1110_unit.js
const H=require('./pg_harness.js');
const {check,GM,E}=H; const J=JSON.stringify;
const fs=require('fs'), path=require('path'), vm=require('vm'), cp=require('child_process');
const loadErr=[];
const loadG=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)){ loadErr.push(f+'：沒有這個檔'); return false; } try{ vm.runInThisContext(fs.readFileSync(p,'utf8').replace(/^const ([A-Z_][A-Z0-9_]*)\s*=/mg,'globalThis.$1='),{filename:f}); return true; }catch(e){ loadErr.push(f+'：'+String(e&&e.message||e).slice(0,200)); return false; } };
/* 假的 1 廳／大廳（NY3、Z3）：記場燈 */
let LIGHTS=true; const lobbyZ={group:null,seats:[]}, hallZ={group:null,seats:[]};
global.NY3={houseLights(on){ LIGHTS=!!on; return true; }, lobby:{build(){ return lobbyZ; }}, hall:{build(){ return hallZ; }}};
global.Z3={ZONES:{xs_nanyang:NY3.lobby,xs_nanyang_hall:NY3.hall}};
for(const f of ['src/data/study_scenes.js','src/data/activity_scenes.js','src/studyn3d.js','src/data/nanyang_layout.js','src/nanyang_sys3d.js','src/data/nanyang_movies.js','src/movies3d.js']) loadG(f);
const MV=()=>typeof MOVIES!=='undefined'?MOVIES:null;
const NM=()=>typeof NANYANG_MOVIES!=='undefined'?NANYANG_MOVIES:null;
/* 換區域：清掉 NPC（和遊戲一樣）、記下去哪裡 */
const trace=[]; let sits=[], spawned=[];
GM.enter=async(z,sp,o)=>{ H.entered.push(z); H.G.zone=z; GM.npc={}; E.npcs=[]; E.player.seat=null; E.zone=z==='xs_nanyang_hall'?{seats:(NANYANG_LAYOUT.hall.seats||[]).map(s=>({kind:'cinema',row:s.row,x:s.x,z:s.z,y:s.y,yaw:s.yaw,lv:0})),roomAt:()=>null}:{seats:[],roomAt:()=>null}; };
GM.spawnCharacter=(id,x,z,o)=>{ const n={id,charId:id,obj:{position:{x,y:0,z},rotation:{y:(o&&o.yaw)||0}},beh:'idle',pose:'idle',lv:0}; GM.npc[id]=n; E.npcs.push(n); spawned.push([id,H.G.zone]); return n; };
GM.sitAt=(ent,seat)=>{ ent.seat=seat; ent.pose='sit'; sits.push({who:ent===E.player?'me':ent.id,zone:H.G.zone,seat}); };
GM.standUp=ent=>{ ent.seat=null; ent.pose='idle'; };
E.placeAt=(ent,x,z)=>{ ent.obj.position.x=x; ent.obj.position.z=z; };
GM.say=async(who,t)=>{ const s=String(t).replace('{name}',H.G&&H.G.name||'祐廷'); H.said.push({who:who?(who.name||String(who)):null,t:s}); trace.push({t:s,zone:H.G.zone,lights:LIGHTS}); };
GM.money=d=>{ H.G.money+=d; };
const fresh=(key,h,zone)=>{ const G=H.fresh(key,h,zone||'xs_nanyang'); G.invites=[]; G.msgs=G.msgs||[]; G.money=5000; G.visited={xs_nanyang:1,xs_nanyang_hall:1}; E.zone={seats:[],spawn:{x:0,z:5.2,yaw:Math.PI},roomAt:()=>null}; E.npcs=[]; E.player.seat=null; E.player.busy=false; INV._now=()=>Date.now()+1e9;
  trace.length=0; sits=[]; spawned=[]; LIGHTS=true; return G; };
const npc=id=>{ const n={id,charId:id,obj:{position:{x:0.5,y:0,z:4.6},rotation:{y:0}},beh:'idle',pose:'idle',lv:0}; GM.npc[id]=n; E.npcs.push(n); return n; };
const title=id=>{ const f=MV()&&MV().film(id); return f?f.title:null; };
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外',false,String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); } };

(async()=>{
  await sec(0,async()=>{ let out='', ok=false; try{ out=cp.execFileSync('python3',[path.join(H.ROOT,'tools/movie/import_nanyang_movies.py'),'--check'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}); ok=/^OK/.test(out); }catch(e){ out=String(e.stderr||e.message); }
    check('0. 片單和白名單上的 AA_730 一致、36 段 72 部、MOVIES 載得到',ok&&!!NM()&&NM().periods.length===36&&NM().periods.every(p=>p.bill.length===2)&&!!MV(),(out.trim().slice(0,200))+' '+J(loadErr));
    const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8'), i=f=>html.indexOf('src="'+f);
    check('0. index.html 載入 nanyang_movies.js、movies3d.js（在 invites3d、nanyang3d、aa614_3d、story3d 之後）',i('src/data/nanyang_movies.js')>0&&i('src/movies3d.js')>i('src/data/nanyang_movies.js')&&i('src/movies3d.js')>i('src/invites3d.js')&&i('src/movies3d.js')>i('src/nanyang3d.js')&&i('src/movies3d.js')>i('src/aa614_3d.js')&&i('src/movies3d.js')>i('src/story3d.js')); });
  if(!MV()||!NM()){ check('（MOVIES 沒有載入：後面全部 FAIL）',false,J(loadErr)); H.done(); return; }
  await sec(1,async()=>{ const G=fresh('2025-10-18',19);
    const ids=(k)=>{ const p=MOVIES.billAt(G,H.D(k)); return p?p.bill.map(b=>b.id):null; };
    check('1. 2025-10＝m2509a／m2509b（第十三號月台、三份證詞）；2026-04＝m2603a／m2603b',J(ids('2025-10-18'))===J(['m2509a','m2509b'])&&title('m2509a')==='第十三號月台'&&title('m2509b')==='三份證詞'&&J(ids('2026-04-20'))===J(['m2603a','m2603b']),J([ids('2025-10-18'),ids('2026-04-20')]));
    const P=NM().periods, first=MOVIES.billAt(G,H.D('2024-09-01')-30), last=MOVIES.billAt(G,H.D('2024-09-01')+366*7);
    check('1. 2024-09 以前＝第一段、2030-08 以後＝最後一段',first===P[0]&&last===P[35],J([first&&first.from,last&&last.from])); });
  await sec(2,async()=>{ const G=fresh('2025-10-18',19); H.FRIEND('heroine_01'); H.FRIEND('heroine_04');
    const a=MOVIES.choose(G,'heroine_01'), b=MOVIES.choose(G,'classmate_bohan');
    G.day=H.D('2026-05-10'); H.FRIEND('heroine_03'); const c=MOVIES.choose(G,'heroine_03');
    G.day=H.D('2025-11-15'); const d=MOVIES.choose(G,'heroine_04');
    check('2. 以安第 1 場（want court/mystery，兩部都合、都 fits 她）＝第一部 m2509a；朋友＝第一部',a&&a.id==='m2509a'&&a.key==='1'&&a.ok&&b&&b.id==='m2509a',J([a,b]));
    check('2. 語彤 2026-05（第 1 場沒寫 sceneFilm）＝fits 她的老茶行 m2605b',c&&c.id==='m2605b'&&title('m2605b')==='老茶行',J(c));
    check('2. 子晴第 1 場 want action、2025-11 兩部都沒有 action＝對不上（ok false），片照 fits／第一部',d&&d.ok===false&&d.id==='m2511a',J(d)); });
  await sec(3,async()=>{ const G=fresh('2025-10-18',17); H.FRIEND('heroine_01'); G.msgs=[];
    const iv=INV.accept(G,'heroine_01','xs_nanyang',G.day,19.5,{by:'player'}); const m=(G.msgs||[]).filter(q=>q.iv===iv.id).map(q=>q.text);
    check('3. 約好就定片（iv.film）；標籤、訊息寫「看《第十三號月台》」',iv.film==='m2509a'&&/看《第十三號月台》/.test(iv.label)&&m.some(t=>/看《第十三號月台》/.test(t)),J([iv.film,iv.label,m]));
    const iv2=INV.offer(G,'heroine_01','xs_nanyang',G.day+1,19.5,'明天晚上要不要去南洋？'); const m2=(G.msgs||[]).filter(q=>q.iv===iv2.id).map(q=>q.text);
    check('3. 她自己傳的那一句不改（標籤照樣寫片名）',iv2&&iv2.film&&m2.includes('明天晚上要不要去南洋？')&&/看《/.test(iv2.label),J([iv2&&iv2.film,m2,iv2&&iv2.label])); });
  await sec(4,async()=>{ const G=fresh('2025-10-18',19.4); const id='heroine_01'; H.FRIEND(id);
    const iv=INV.accept(G,id,'xs_nanyang',G.day,19.5,{by:'player'}); const n=npc(id);
    E.zone.seats=(NANYANG_LAYOUT.lobby.seats||[]).map(s=>({kind:'shop',nanyang:'bench',x:s.x,z:s.z,yaw:s.yaw,lv:0}));   /* 大廳的長椅 */
    H.said=[]; await INV.startTogether(GM,iv,n);
    const benches=sits.filter(s=>s.zone==='xs_nanyang'), hs=sits.filter(s=>s.zone==='xs_nanyang_hall'), me=hs.find(s=>s.who==='me'), her=hs.find(s=>s.who===id);
    check('4. 大廳不坐長椅；換到 1 廳又回大廳',benches.length===0&&J(H.entered)===J(['xs_nanyang_hall','xs_nanyang'])&&G.zone==='xs_nanyang',J({benches,entered:H.entered}));
    check('4. 1 廳：你坐走道那一張、她坐你左手邊（同一排、差 0.58 m）',!!me&&!!her&&me.seat.kind==='cinema'&&Math.abs(me.seat.z-her.seat.z)<1e-6&&Math.abs((me.seat.x-her.seat.x)-0.58)<1e-6&&Math.abs(me.seat.y-her.seat.y)<1e-6,J({me:me&&me.seat,her:her&&her.seat}));
    const dimT='（燈暗下來，《第十三號月台》開始了。）', di=trace.findIndex(x=>x.t===dimT);
    check('4. 燈暗那一句寫片名、在 1 廳、場燈關的時候說',di>=0&&trace[di].zone==='xs_nanyang_hall'&&trace[di].lights===false,J(trace.map(x=>[x.zone==='xs_nanyang_hall'?'H':'L',x.lights?1:0,x.t.slice(0,18)])));
    const AX=ACTIVITY_SCENES.kinds.movie.people[id].scenes['1'], seat0=trace.findIndex(x=>x.t===AX.seat[0]), bye0=trace.findIndex(x=>x.t===STUDYN.text(G,AX.bye[0]));
    check('4. 第 1 場：坐下的句子在 1 廳（燈暗以前）、道別在大廳（散場出來）；最後場燈打開',seat0>=0&&seat0<di&&trace[seat0].zone==='xs_nanyang_hall'&&bye0>di&&trace[bye0].zone==='xs_nanyang'&&LIGHTS===true,J([seat0,di,bye0]));
    check('4. 票這一場用掉（NY_WATCHED＝今天）、這一筆演完',G.flags.NY_WATCHED===G.day&&iv.state==='done'&&G.flags.NY_TICKET===G.day,J([G.flags.NY_WATCHED,iv.state])); });
  await sec(5,async()=>{ const G=fresh('2025-11-15',19.4), id='heroine_04'; H.FRIEND(id);
    const iv=INV.accept(G,id,'xs_nanyang',G.day,19.5,{by:'player'}); const n=npc(id); H.said=[];
    const sc1=ACTIVITY_SCENES.kinds.movie.people[id].scenes['1'];
    await INV.startTogether(GM,iv,n); const r=STUDYN.act('movie').of(G,id);
    check('5. 子晴第 1 場（want action）、片是 2025-11 的（沒有動作片）：這次演一般句、次數 +1、下次還是第 1 場',iv.film==='m2511a'&&!H.said.some(s=>s.t===sc1.seat[0])&&r.n===1&&r.k===1,J({film:iv.film,r,L:H.said.map(s=>s.t).slice(0,6)}));
    const L=ACTIVITY_SCENES.kinds.movie.people[id].rot, AXr=Object.assign({rot:1,kind:'movie'},L[1]); G.flags.ZQ_MOVIE_CAT=G.day;
    const got=MOVIES.fitScene(G,{who:id,film:'m2511a'},AXr), keep=MOVIES.fitScene(G,{who:id,film:'m2411b'},AXr);   /* m2411b 夜班店員有 cat */
    check('5. 輪換第 1 則（want cat）片沒有貓＝跳到下一則（rot 2）；有貓照演',got&&got.rot===2&&keep===AXr,J([got&&got.rot,keep&&keep.rot])); });
  await sec(6,async()=>{ const G=fresh('2025-10-18',19.4), id='heroine_02'; H.FRIEND(id); const keep=Z3.ZONES.xs_nanyang_hall; delete Z3.ZONES.xs_nanyang_hall;
    try{ const iv=INV.accept(G,id,'xs_nanyang',G.day,19.5,{by:'player'}); const n=npc(id); H.said=[]; await INV.startTogether(GM,iv,n);
      const t='（燈暗下來，《'+title(iv.film)+'》開始了。）';
      check('6. 沒有 1 廳：照舊在大廳演完、燈暗那一句寫片名',H.entered.length===0&&iv.state==='done'&&H.said.some(s=>s.t===t)&&G.zone==='xs_nanyang',J({e:H.entered,st:iv.state,film:iv.film})); }
    finally { Z3.ZONES.xs_nanyang_hall=keep; } });
  await sec(7,async()=>{ const G=fresh('2026-04-18',19.4), id='heroine_05'; H.FRIEND(id); G.invSeq=(G.invSeq|0)+1;
    const iv={id:'iv'+G.invSeq,who:id,place:'xs_nanyang',zone:'xs_nanyang',day:G.day,h:19.5,state:'accepted',accepted:true,by:'player',label:'和學姊約在南洋戲院'}; G.invites.push(iv);
    const G2=JSON.parse(JSON.stringify(G)); const ok=G2.invites[0].film===undefined;
    const n=npc(id); await INV.startTogether(GM,iv,n);
    check('7. 舊存檔的約（沒有 iv.film）：開演時才挑（2026-04 那一段）、照樣進 1 廳演完；存檔 JSON 來回不壞',ok&&['m2603a','m2603b'].includes(iv.film)&&iv.state==='done'&&H.entered[0]==='xs_nanyang_hall'&&JSON.parse(JSON.stringify(G)).invites[0].film===iv.film,J({film:iv.film,st:iv.state,e:H.entered})); });
  await sec(8,async()=>{ const G=fresh('2025-10-18',15); E.interactables=[]; NY3.lobby.build(E);
    const it=E.interactables.find(q=>q&&q.movieBoard); H.said=[]; const r=it?await STORY.interact(it,GM):false; const L=H.said.map(s=>s.t);
    const board=NM().nowBoard.replace('{big}','第十三號月台').replace('{small}','三份證詞'), f1=MOVIES.film('m2509a');
    check('8. 大廳「看今日放映」：nowBoard（兩部片名）＋兩部各一句',!!it&&it.label==='看今日放映'&&r===true&&L[0]===board&&L.length===3&&L[1].indexOf('《第十三號月台》')>=0&&L[1].indexOf(f1.line)>=0,J({it:!!it,L}));
    const SL=MOVIES.soloLines(G), want=NM().solo.map(t=>t.replace('{big}','第十三號月台').replace('{small}','三份證詞'));
    let solo=null; loadErr.length=0; for(const f of ['src/data/shop_npc.js','src/data/heroine_circle.js','src/whois3d.js','src/aa614_3d.js']) loadG(f);
    if(typeof AA614!=='undefined'&&!loadErr.length){ fresh('2025-10-18',15,'xs_nanyang_hall'); H.G.stage='law'; H.G.flags.NY_TICKET=H.G.day; H.said=[]; await STORY.onSeat(GM,{kind:'cinema',row:3}); solo=H.said.map(s=>s.t); }
    check('8. 一個人在 1 廳坐下看＝solo 三句（片名照那一段）',J(SL)===J(want)&&(solo==null||J(solo.slice(0,3))===J(want)),J({SL,solo,err:loadErr})); });
  await sec(9,async()=>{ const miss=MOVIES.POSTERS.filter(id=>!fs.existsSync(path.join(H.ROOT,'assets/posters/'+id+'.webp'))||!MOVIES.film(id)), lic=fs.readFileSync(path.join(H.ROOT,'LICENSES.md'),'utf8');
    check('9. 海報 10 張在 assets/posters、都是片單上的片、LICENSES.md 有記；沒有圖的不給網址',MOVIES.POSTERS.length===10&&!miss.length&&/assets\/posters\//.test(lic)&&MOVIES.posterUrl('m2509a')==='assets/posters/m2509a.webp'&&MOVIES.posterUrl('m2409a')===null,J(miss)); });
  H.done();
})().catch(e=>{ console.error(e); console.log('FAILED (exception)'); process.exit(1); });
