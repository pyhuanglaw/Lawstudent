// 女主角自己的故事線（STUDY-DATE-PROGRESS-1107，USER_WANTS X263；台詞 AA_712 026a2dd34；規則 BB_305 第 9 節）——不需要瀏覽器（D131）。
// 使用者 11-07 05:1x 對 BB-B：「我要真的玩起來有戀愛遊戲的感覺不要很像在跟機器人說話」「他有他的故事……這些都是要聊天的」
// 檢查（BB_305 第 9 節 Node 能測的）：
//   0 匯入一致（import_arcs.py --check）；七位各 8 拍、每拍至少 2 個選項（tell 不是每拍都有，AA_736）
//   1 同一天先念書、再吃飯：只有第一次演故事線
//   3 階段不夠：不演、不跳拍；升階以後下一次演同一拍
//   4 選了講自己的事（tell）：記 YT_TOLD；別的人那一拍同一件事＝toldAlt
//   7 quietOk:false 那一拍：在圖書館讀書區不演，在咖啡廳演
//   8 中途被打斷（例外）：這一拍不算演過，下次重演
//   + after（語彤第 4 拍要找過公園的貓）、alt（以安第 4 拍 AN_MSG_MOM_OK）、until 過了 skip（記 missed、接下一拍）
//   + 遊戲流程：總圖約念書（INV.meet o.lib）中途換成故事線、念書第 N 場的坐下／收書照演、念書次數照算；吃飯（公館燒臘）時間一半演故事線
//   + 舊存檔（沒有 BEATS）：從第 1 拍開始
// 修改前全部 FAIL（沒有 ARCS）。用法：node tests/heroine_arcs_unit.js
const H=require('./pg_harness.js');
const {check,GM,E}=H; const J=JSON.stringify;
const fs=require('fs'), path=require('path'), vm=require('vm'), cp=require('child_process');
const loadG=(f,names)=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let s=fs.readFileSync(p,'utf8'); for(const n of names) s=s.replace(new RegExp('^const '+n+'\\s*=','m'),'globalThis.'+n+'='); vm.runInThisContext(s,{filename:f}); return true; };
loadG('src/data/study_scenes.js',['STUDY_SCENES']); loadG('src/studyn3d.js',['STUDYN']);
const ok1=loadG('src/data/heroine_arcs.js',['HEROINE_ARCS']), ok2=loadG('src/arcs3d.js',['ARCS']);
const stageOf={}; const DS=DATE.stageNum; DATE.stageNum=id=>stageOf[id]!=null?stageOf[id]:DS(id);
const fresh=(key,h,zone)=>{ const G=H.fresh(key,h,zone); G.invites=[]; G.stats=G.stats||{}; E.zone={seats:[],spawn:{x:0,z:0,yaw:0},roomAt:()=>null}; E.npcs=[]; E.player.seat=null; E.player.busy=false; E.player.lv=0; INV._now=()=>Date.now()+1e9; return G; };
const npc=id=>{ const n={id,charId:id,obj:{position:{x:1,y:0,z:0},rotation:{y:0}},beh:'idle',pose:'idle',lv:0}; GM.npc[id]=n; E.npcs.push(n); return n; };
const said=()=>H.said.map(s=>s.t);
const B=(id,n)=>HEROINE_ARCS.people[id].beats[n-1];
(async()=>{
  { let out='', ok=false; try{ out=cp.execFileSync('python3',[path.join(H.ROOT,'tools/story/import_arcs.py'),'--check'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}); ok=/^OK/.test(out); }catch(e){ out=String(e.stderr||e.message); }
    check('0. src/data/heroine_arcs.js 和 AA_712@026a2dd34 一致（import_arcs.py --check）',ok1&&ok2&&ok,out.trim().slice(0,200));
    const P=ok1?HEROINE_ARCS.people:{}; const ids=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','classmate_peishan','kexin'];
    check('0. 七位各 8 拍、每拍有 lines／ask、至少 2 個選項（講自己的事 tell 不是每拍都有：AA_736 256bcdc42 經濟系、重考少提，拿掉一部分）',ids.every(id=>P[id]&&P[id].beats.length===(id==='kexin'?6:8)/* 可昕第 4、5 拍（CANON-NO-ECON-1112 第三批：這一項拿掉）*/&&(id!=='kexin'||J(P[id].beats.map(b=>b.n))===J([1,2,3,6,7,8]))&&P[id].beats.every(b=>b.lines.length&&b.ask.length&&b.opts.length>=2)),J(ids.map(id=>P[id]&&P[id].beats.filter(b=>!b.opts.some(o=>o.tell)).map(b=>b.n)))); }
  if(!ok2){ H.done(); return; }
  const AN='heroine_01', who={name:'沈以安',charId:AN};
  /* 1 一天一拍 */
  { const G=fresh('2025-10-15',14,'cafe'); stageOf[AN]=1; const a=ARCS.pick(G,AN,{kind:'study'}); check('1. 第一次見面：第 1 拍',a&&a.n===1,J(a&&a.n));
    H.picks=[0]; await ARCS.run(GM,who,AN,a); const b=ARCS.pick(G,AN,{kind:'eat'}); check('1. 同一天再約吃飯：不演故事線（null）',b===null&&ARCS.rec(G,AN).k===2,J({b,r:ARCS.rec(G,AN)}));
    G.day+=1; const c=ARCS.pick(G,AN,{kind:'eat'}); check('1. 隔天：第 2 拍',c&&c.n===2,J(c&&c.n)); }
  /* 3 階段不夠 */
  { const G=fresh('2025-10-15',14,'cafe'); ARCS.rec(G,AN).k=3; stageOf[AN]=B(AN,3).need-1; const a=ARCS.pick(G,AN,{kind:'cafe'});
    check('3. 第 3 拍要階段 ≥'+B(AN,3).need+'、現在不夠：不演、不跳拍',a===null&&ARCS.rec(G,AN).k===3,J({a,k:ARCS.rec(G,AN).k}));
    stageOf[AN]=B(AN,3).need; const b=ARCS.pick(G,AN,{kind:'cafe'}); check('3. 升階以後：演第 3 拍（沒有跳過）',b&&b.n===3); }
  /* 4 講自己的事、toldAlt */
  { const G=fresh('2025-10-15',14,'cafe'); const TB=HEROINE_ARCS.people[AN].beats.findIndex(b=>b.opts.some(o=>o.tell))+1; ARCS.rec(G,AN).k=TB; stageOf[AN]=Math.max(1,B(AN,TB).need||1); H.said=[]; const a=ARCS.pick(G,AN,{kind:'cafe'}); const k=a.opts.findIndex(o=>o.tell); H.picks=[k];   /* 第一個有 tell 的那一拍（AA_736 以後以安第 1～3 拍沒有 tell）*/
    const r0=Object.assign({},SOCIAL.rel(AN)); await ARCS.run(GM,who,AN,a); const o=a.opts[k], r1=SOCIAL.rel(AN);
    check('4. 選了講自己的事（'+o.tell+'）：記 YT_TOLD、記答案 mem、她的回話照播、好感照稿',ARCS.told(G,o.tell,AN)&&ARCS.rec(G,AN).ans[o.ansId]&&(!o.reply.length||said().includes(o.reply[0]))&&Object.keys(o.rel).filter(x=>x!=='npcRom').every(x=>((r1[x]||0)-(r0[x]||0))===o.rel[x]),J({told:G.flags.YT_TOLD,ans:ARCS.rec(G,AN).ans,said:said()}));
    check('4. 她的話依序：lines → ask → 回話',said().indexOf(a.lines[0])<said().indexOf(a.ask[0])&&(!o.reply.length||said().indexOf(a.ask[0])<said().indexOf(o.reply[0])),J(said()));
    /* toldAlt：找一個有 toldAlt 的選項，那件事先講過 */
    let hit=null; for(const [id,v] of Object.entries(HEROINE_ARCS.people)) for(const b of v.beats) for(const q of b.opts) if(q.toldAlt&&!hit) hit={id,b,q};
    if(hit){ const G2=fresh('2025-10-15',14,'cafe'); const T=G2.flags.YT_TOLD={}; T[hit.q.tell]={[hit.id]:G2.day-3}; const r=ARCS.resolve(G2,hit.id,hit.b), q2=r.opts[hit.b.opts.indexOf(hit.q)];
      check('4. 同一件事她已經聽你講過：選項換成 toldAlt（'+hit.id+' 第 '+hit.b.n+' 拍）',q2.t===(hit.q.toldAlt.t||hit.q.toldAlt)&&q2.told===true,J(q2));
      const G3=fresh('2025-10-15',14,'cafe'); const r3=ARCS.resolve(G3,hit.id,hit.b); check('4. 沒講過：照原本的選項',r3.opts[hit.b.opts.indexOf(hit.q)].t===hit.q.t); }
    else check('4. （稿裡沒有 toldAlt，略過）',true); }
  /* 7 quietOk */
  { let hit=null; for(const [id,v] of Object.entries(HEROINE_ARCS.people)) for(const b of v.beats) if(b.quietOk===false&&!hit) hit={id,b};
    const G=fresh('2026-12-01',14,'library_hall'); const r=ARCS.rec(G,hit.id); r.k=hit.b.n; stageOf[hit.id]=6; for(const k of Object.keys(G.flags)) if(/^YT_|^KNOWS/.test(k)) delete G.flags[k];
    G.flags.KNOWS_SIS_ALISON=true; G.flags.YT_CATS=true; G.flags.YT_MOM_BACK=1; G.flags.AN_STUDY_SHOP=1; G.day=Math.max(G.day,(ARCS.dayOf(hit.b.from)||0));
    const a=ARCS.pick(G,hit.id,{kind:'study',quiet:true}), b=ARCS.pick(G,hit.id,{kind:'cafe',quiet:false});
    check('7. quietOk:false（'+hit.id+' 第 '+hit.b.n+' 拍）：在圖書館讀書區不演；在咖啡廳演',a===null&&b&&b.n===hit.b.n,J({a:a&&a.n,b:b&&b.n})); }
  /* 8 被打斷 */
  { const G=fresh('2025-10-15',14,'cafe'); stageOf[AN]=1; const a=ARCS.pick(G,AN,{kind:'cafe'}); const c0=GM.choose; GM.choose=async()=>{ throw new Error('被打斷'); }; let err=null;
    try{ await ARCS.run(GM,who,AN,a); }catch(e){ err=e; } GM.choose=c0;
    check('8. 中途被打斷（例外）：這一拍不算演過（k 還是 1、今天沒有記）、下次重演',!!err&&ARCS.rec(G,AN).k===1&&ARCS.rec(G,AN).last==null&&ARCS.pick(G,AN,{kind:'cafe'}).n===1); }
  /* after、alt、until */
  { const YT='heroine_03'; const G=fresh('2026-03-02',14,'cafe'); stageOf[YT]=5; ARCS.rec(G,YT).k=4; const a=ARCS.pick(G,YT,{kind:'cafe'});
    G.flags.YT_CATS=true; const b=ARCS.pick(G,YT,{kind:'cafe'});
    check('+ after：語彤第 4 拍要找過公園的貓（YT_CATS）；沒有＝等，有＝演',B(YT,4).after==='ytCats'&&a===null&&b&&b.n===4,J({a,b:b&&b.n}));
    const G2=fresh('2025-12-01',14,'cafe'); stageOf[AN]=6; ARCS.rec(G2,AN).k=4; const p1=ARCS.pick(G2,AN,{kind:'cafe'}); G2.flags.AN_MSG_MOM_OK=G2.day; const p2=ARCS.pick(G2,AN,{kind:'cafe'});
    check('+ alt：以安第 4 拍，傳過「她說好的時候，都不太像好」（AN_MSG_MOM_OK）以後換 alt 那一版',p1&&p2&&p1.lines[0]===B(AN,4).lines[0]&&p2.lines[0]===B(AN,4).alt.lines[0],J([p1&&p1.lines[0],p2&&p2.lines[0]]));
    let hit=null; for(const [id,v] of Object.entries(HEROINE_ARCS.people)) for(const b2 of v.beats) if(b2.until&&b2.late==='skip'&&!hit) hit={id,b:b2};
    const G3=fresh('2028-01-10',14,'cafe'); ARCS.rec(G3,hit.id).k=hit.b.n; stageOf[hit.id]=6; const u=ARCS.dayOf(hit.b.until); G3.day=u+1; const r=ARCS.pick(G3,hit.id,{kind:'cafe'});
    check('+ until 過了、late skip（'+hit.id+' 第 '+hit.b.n+' 拍）：記 missed、接著看下一拍（不擋）',ARCS.rec(G3,hit.id).missed.includes(hit.b.n)&&ARCS.rec(G3,hit.id).k>hit.b.n,J({r:r&&r.n,rec:ARCS.rec(G3,hit.id)})); }
  /* 遊戲流程 */
  { const G=fresh('2025-09-16',14,'library_hall'); stageOf[AN]=2; H.FRIEND(AN); H.said=[]; H.picks=[0];
    const iv=INV.accept(G,AN,'library',G.day,14,{by:'player'}); const n=npc(AN); iv.opened=1; await INV.meet(GM,iv,n,{lib:true}); const got=said(), a=B(AN,1), S1=STUDY_SCENES.people[AN].scenes['1'];
    check('+ 總圖約念書：中途換成故事線第 1 拍（她說的事、問你、回話），念書第 1 場的坐下、收書、道別照演',got.includes(a.lines[0])&&got.includes(a.ask[0])&&got.includes(S1.seat[0])&&got.includes(S1.bye[0])&&!S1.mid.some(t=>got.includes(t)),J(got));
    check('+ 演完：故事線到第 2 拍、念書次數 1（照算）',ARCS.rec(G,AN).k===2&&STUDYN.count(G,AN)===1); }
  { const G=fresh('2025-09-17',18,'noodle'), id='heroine_02', w={name:'林芷若',charId:id}; stageOf[id]=2; H.FRIEND(id); H.said=[]; H.picks=[0];
    const iv=INV.accept(G,id,'noodle',G.day,18,{by:'player'}); const n=npc(id); const h0=G.hour; await INV.meet(GM,iv,n,{}); const got=said(), a=B(id,1);
    check('+ 吃飯（公館燒臘）：演故事線第 1 拍、時間照地點的 stay 走完',got.includes(a.lines[0])&&got.includes(a.ask[0])&&Math.abs(G.hour-h0-INV.place('noodle').stay)<0.01&&ARCS.rec(G,id).k===2,J({got,dh:G.hour-h0})); }
  { const G=fresh('2025-09-16',14,'cafe'); delete G.flags.BEATS; let err=null, r=null; try{ r=ARCS.pick(G,'kexin',{kind:'cafe'}); }catch(e){ err=e; }
    check('+ 舊存檔沒有 BEATS：從第 1 拍開始、不丟例外',!err&&r&&r.n===1,String(err)); }
  H.done();
})().catch(e=>{ console.error(e); console.log('FAILED (exception)'); process.exit(1); });
