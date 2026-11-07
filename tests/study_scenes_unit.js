// 一起念書第 N 次（STUDY-DATE-PROGRESS-1107，USER_WANTS X263；台詞 AA_707 05d8a816e；規則 AA_706 第 1 節）——不需要瀏覽器（D131）。
// 使用者 11-07：「總部的每次念書都講一樣的話吧……就算一起念書五次還是覺得很不熟啊 我希望每一次念書或者一起活動都要有不同 進展的感覺 會觸發劇情 然後看第幾次可以告白?」
// 使用者 11-07 03:4x（對 AA-B，UA-AA-1107-04）：「第6次算一次約會」。
// 檢查：
//   0. src/data/study_scenes.js 和 AA_707@05d8a816e 一致（tools/story/import_study_scenes.py --check）；七位都有第 1～6 場
//   1. 第 1～6 場依序演、一天只算一次（同一天第二次＝一般句、不算）
//   2. 階段不夠（第 3 場要 ≥3）：演一般句、次數照算、下一場不跳過；階段到了接著演第 3 場
//   3. 選項：照選的加減好感、播她的回話
//   4. 第 6 場：正式約會 +1（DATE.log count）、記 study6；記旗標（set）、解鎖（STUDY_UNLOCK）
//   5. 第 7 次以後：輪換、不連續重複；寫 if 的要旗標記過
//   6. alt：語彤第 5 場（媽媽發現以後）換中途和選項回話；學姊 2026-08 以後換坐下那一句
//   7. 遊戲流程：總圖約念書（INV.meet o.lib）演第 1 場（坐下、中途、收書、道別），不再是一般句；2:30 AM 在「念書」那一類約（iv.cat study）也演；在「喝咖啡」那一類約＝照舊
//   8. 舊存檔（沒有 G.flags.STUDYN）：從第 1 場開始，不丟例外
// 修改前：0、1～8 全部 FAIL（沒有 STUDYN）。用法：node tests/study_scenes_unit.js
const H=require('./pg_harness.js');
const {check,GM,E}=H;
const fs=require('fs'), path=require('path'), vm=require('vm'), cp=require('child_process');
const loadG=(f,names)=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let s=fs.readFileSync(p,'utf8'); for(const n of names) s=s.replace(new RegExp('^const '+n+'\\s*=','m'),'globalThis.'+n+'='); vm.runInThisContext(s,{filename:f}); return true; };
const ok1=loadG('src/data/study_scenes.js',['STUDY_SCENES']), ok2=loadG('src/studyn3d.js',['STUDYN']);
const W=ms=>new Promise(r=>setTimeout(r,ms));
const SC=ok1?STUDY_SCENES.people:{};
const said=()=>H.said.map(s=>s.t);
const T=(id,k)=>SC[id]&&SC[id].scenes[String(k)];
const fresh=(key,h,zone)=>{ const G=H.fresh(key,h,zone); G.invites=[]; G.stats=G.stats||{}; E.zone={seats:[],spawn:{x:0,z:0,yaw:0},roomAt:()=>null}; E.npcs=[]; E.player.seat=null; INV._now=()=>Date.now()+1e9; return G; };
const stageOf={}; const DS=DATE.stageNum; DATE.stageNum=id=>stageOf[id]!=null?stageOf[id]:DS(id);
const next=G=>{ G.day+=1; };
(async()=>{
  /* ---- 0 匯入一致 ---- */
  { let out='', ok=false; try{ out=cp.execFileSync('python3',[path.join(H.ROOT,'tools/story/import_study_scenes.py'),'--check'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}); ok=/^OK/.test(out); }catch(e){ out=String(e.stderr||e.message); }
    check('0. src/data/study_scenes.js 和 AA_707@05d8a816e 一致（import_study_scenes.py --check）',ok1&&ok2&&ok,out.trim().slice(0,200));
    const ids=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','classmate_peishan','kexin'];
    check('0. 七位都有第 1～6 場＋輪換 6 則',ids.every(id=>SC[id]&&[1,2,3,4,5,6].every(k=>T(id,k)&&T(id,k).seat.length&&T(id,k).mid.length)&&SC[id].rot.length===6),JSON.stringify(Object.keys(SC))); }
  if(!ok2){ H.done(); return; }
  /* ---- 1、2、3 依序、一天一次、階段不夠、選項 ---- */
  { const G=fresh('2025-09-15',14,'cafe'), id='heroine_01'; stageOf[id]=2;
    const a=STUDYN.pick(G,id); check('1. 第一次：第 1 場（坐下那一句是 AA_707 的）',a&&a.k===1&&a.seat[0]===T(id,1).seat[0],JSON.stringify(a&&a.seat));
    STUDYN.done(G,id,a); const b=STUDYN.pick(G,id); check('1. 同一天再約一次：一般句（null）、次數不加',b===null&&STUDYN.count(G,id)===1,JSON.stringify(b));
    next(G); const c=STUDYN.pick(G,id); check('1. 隔天：第 2 場',c&&c.k===2&&c.mid[0]===T(id,2).mid[0]);
    H.said=[]; H.opts=[]; H.picks=['想真的弄懂']; const r0=Object.assign({},SOCIAL.rel(id)); const who={name:'沈以安',charId:id};
    await STUDYN.mid(GM,who,id,c); const r1=SOCIAL.rel(id), o=T(id,2).opts[1];
    check('3. 第 2 場的選項：兩個選項照 AA_707、選「想真的弄懂」照稿加好感（trust +2、comf +1、npcRom +1）、播她的回話',JSON.stringify(H.opts[0]&&[...H.opts[0]])===JSON.stringify(T(id,2).opts.map(q=>q.t))&&(r1.trust-(r0.trust||0))===o.rel.trust&&(r1.comf-(r0.comf||0))===o.rel.comf&&((r1.npcRom||0)-(r0.npcRom||0))===o.rel.npcRom&&said().includes(o.reply[0]),JSON.stringify({opts:H.opts[0],said:said()}));
    STUDYN.done(G,id,c); next(G); const d=STUDYN.pick(G,id);
    check('2. 第 3 場要階段 ≥3、現在 2：一般句（generic）',d&&d.generic===true,JSON.stringify(d));
    STUDYN.done(G,id,null); check('2. 一般句那次也算次數（3）、下一場還是第 3 場',STUDYN.count(G,id)===3&&STUDYN.of(G,id).k===3,JSON.stringify(STUDYN.of(G,id)));
    next(G); stageOf[id]=3; const e=STUDYN.pick(G,id); check('2. 階段到了：接著演第 3 場（不跳過）',e&&e.k===3,JSON.stringify(e&&e.k));
    STUDYN.done(G,id,e); check('4. 第 3 場記旗標 AN_STUDY_ASKED＝那一天',G.flags.AN_STUDY_ASKED===G.day);
    /* 4 第 6 場 */
    stageOf[id]=5; for(const k of [4,5]){ next(G); const s=STUDYN.pick(G,id); STUDYN.done(G,id,s); }
    const L0=DATE.log(G,id).count|0; next(G); const f=STUDYN.pick(G,id); STUDYN.done(G,id,f); const L=DATE.log(G,id);
    check('4. 第 6 場：正式約會 +1（使用者「第6次算一次約會」）、記 study6、旗標 AN_STUDY_SHOP、解鎖 an_shop1',f&&f.k===6&&(L.count|0)===L0+1&&L.study6===G.day&&G.flags.AN_STUDY_SHOP===G.day&&G.flags.STUDY_UNLOCK&&G.flags.STUDY_UNLOCK.an_shop1===G.day,JSON.stringify({k:f&&f.k,L,U:G.flags.STUDY_UNLOCK}));
    /* 5 輪換 */
    const seen=[]; for(let i=0;i<8;i++){ next(G); const s=STUDYN.pick(G,id); seen.push(s&&s.rot); STUDYN.done(G,id,s); }
    check('4. 第 7 次以後不再加正式約會',(DATE.log(G,id).count|0)===L0+1);
    check('5. 第 7 次以後：輪換池、不連續重複、六則都輪得到（旗標都記過）',seen.every(x=>x!=null)&&seen.every((x,i)=>i===0||x!==seen[i-1])&&new Set(seen).size===6,JSON.stringify(seen));
    const G2=fresh('2025-09-15',14,'cafe'); STUDYN.of(G2,id).k=7; const rs=[]; for(let i=0;i<6;i++){ const s=STUDYN.pick(G2,id); rs.push(s.rot); STUDYN.done(G2,id,s); next(G2); }
    const needF=SC[id].rot.map((x,i)=>x.if?i:null).filter(x=>x!=null);
    check('5. 沒記過旗標：寫 if 的那幾則不出現',rs.every(i=>!needF.includes(i)),JSON.stringify({rs,needF})); }
  /* ---- 6 alt ---- */
  { const G=fresh('2026-03-02',14,'cafe'), id='heroine_03'; stageOf[id]=5; STUDYN.of(G,id).k=5;
    const a=STUDYN.pick(G,id); check('6. 語彤第 5 場（媽媽還不知道）：原本的中途',a&&a.mid.join()===T(id,5).mid.join());
    G.flags.YT_MOM_BACK=G.day-3; const b=STUDYN.pick(G,id), A=T(id,5).alt;
    check('6. 媽媽知道以後（YT_MOM_BACK）：中途換 alt、選「我不會說。」的回話換成「她已經知道了。……可是謝謝你這樣說。」',b&&b.mid.join()===A.mid.join()&&b.opts.find(o=>o.t==='我不會說。').reply[0]==='她已經知道了。……可是謝謝你這樣說。',JSON.stringify(b&&b.opts));
    const G3=fresh('2025-10-01',14,'library_hall'), s1=STUDYN.pick(G3,'heroine_05'); const G4=fresh('2026-09-10',14,'library_hall'), s2=STUDYN.pick(G4,'heroine_05');
    check('6. 學姊：2025 年＝計時寫考古題；2026-09＝寫研究所的報告（alt）',s1&&s1.seat[0]===T('heroine_05',1).seat[0]&&s2&&s2.seat[0]===T('heroine_05',1).alt.seat[0],JSON.stringify([s1&&s1.seat[0],s2&&s2.seat[0]]));
    const G5=fresh('2025-10-01',14,'cafe'); STUDYN.of(G5,'heroine_05').k=3; stageOf.heroine_05=3; const s3=STUDYN.pick(G5,'heroine_05'), txt=s3.seat.concat(s3.mid,s3.pack||[],s3.bye||[]).join('');
    check('6. 學姊第 3 場起叫名字：{name} 換成玩家名字',!/\{name\}/.test(STUDYN.text(G5,txt))&&(!/\{name\}/.test(txt)||STUDYN.text(G5,txt).includes('祐廷')),txt.slice(0,80)); }
  /* ---- 7 遊戲流程 ---- */
  { const G=fresh('2025-09-16',14,'library_hall'), id='heroine_01'; stageOf[id]=2; H.FRIEND(id); H.said=[];
    const iv=INV.accept(G,id,'library',G.day,14,{by:'player'}); const n={id,charId:id,obj:{position:{x:1,y:0,z:0},rotation:{y:0}},beh:'idle',pose:'idle',lv:1}; GM.npc[id]=n; E.npcs.push(n);
    iv.opened=1; await INV.meet(GM,iv,n,{lib:true}); const got=said(), S1=T(id,1);
    const ia=got.indexOf(S1.seat[0]), ib=got.indexOf(S1.mid[0]), ic=got.indexOf(S1.pack[0]), id2=got.indexOf(S1.bye[0]);
    check('7. 總圖約念書第一次：坐下 → 中途 → 收書 → 道別都是第 1 場的句子（依序）',ia>=0&&ib>ia&&ic>ib&&id2>ic&&got[got.length-1]===S1.bye[0],JSON.stringify(got));
    check('7. 不再播一般句的中途（AA_649 第 2 節隨機那幾則）',!(INVITE_DATA.libStudy.mid||[]).some(m=>m.some(t=>got.includes(t))),JSON.stringify(got));
    check('7. 演完：次數 1、下一場第 2 場；讀書時數照算',STUDYN.count(G,id)===1&&STUDYN.of(G,id).k===2&&(G.stats.study|0)>=1,JSON.stringify({r:STUDYN.of(G,id),st:G.stats.study})); }
  { const G=fresh('2025-09-16',14,'cafe'), id='heroine_02'; stageOf[id]=2; H.FRIEND(id); H.said=[];
    const iv=INV.accept(G,id,'cafe',G.day,14,{by:'player',cat:'study'}); const n={id,charId:id,obj:{position:{x:1,y:0,z:0},rotation:{y:0}},beh:'idle',pose:'idle',lv:0}; GM.npc[id]=n; E.npcs.push(n);
    await INV.meet(GM,iv,n,{}); const got=said(), S1=T(id,1);
    check('7. 2:30 AM 在「念書」那一類約（iv.cat study）：演第 1 場（坐下、中途、收書、道別）',iv.cat==='study'&&got.includes(S1.seat[0])&&got.indexOf(S1.mid[0])>got.indexOf(S1.seat[0])&&got.includes(S1.bye[0]),JSON.stringify(got));
    check('7. 演完次數 1',STUDYN.count(G,id)===1); }
  { const G=fresh('2025-09-16',14,'cafe'), id='heroine_02'; stageOf[id]=2; H.FRIEND(id); H.said=[];
    const iv=INV.accept(G,id,'cafe',G.day,14,{by:'player'}); const n={id,charId:id,obj:{position:{x:1,y:0,z:0},rotation:{y:0}},beh:'idle',pose:'idle',lv:0}; GM.npc[id]=n; E.npcs.push(n);
    await INV.meet(GM,iv,n,{}); const got=said(), S1=T(id,1);
    check('7. 2:30 AM 在「喝咖啡」那一類約：照舊（不演念書的戲、不算次數）',!got.includes(S1.seat[0])&&STUDYN.count(G,id)===0,JSON.stringify(got)); }
  /* ---- 8 舊存檔 ---- */
  { const G=fresh('2025-09-16',14,'cafe'); delete G.flags.STUDYN; let err=null, s=null; try{ s=STUDYN.pick(G,'kexin'); }catch(e){ err=e; }
    check('8. 舊存檔沒有 STUDYN：從第 1 場開始、不丟例外',!err&&s&&s.k===1,String(err)); }
  H.done();
})().catch(e=>{ console.error(e); console.log('FAILED (exception)'); process.exit(1); });
