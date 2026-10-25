// AA_468 事件台詞第二輪（企劃線 cd2dc7646，AA-B 2026-10-25 15:5x；第①、②級）＋第 4 節（企劃線 8a7f797ec，回 LAWWW-B）——不需要瀏覽器。台詞逐字對稿（git show 讀稿、解析表格），實際跑事件看演出來的字。
//   0 讀稿：第 1 節大四的表（七列）、第 2 節 2-1 可昕九句＋收尾、2-2 語彤八句＋收尾；R2Y4B_BAR_NARR 照稿一字不差
//   1 芷若在英國的跨年 ev_zr_nye_video_y4：照表換字（旁白、兩個選項的回覆、結尾、結尾旁白、沒接 08:30 那一則）；開頭、選項照舊；大三 ev_zr_nye_video_y3 照舊；兩年演出來的除了選項沒有一句一樣
//   2 律師讀書小組（src/r2y4b3d.js 的 groupLine／narrLine、src/data/r2y4b_events.js 的 ev_bar_group_night／_video）：2/26～8/3 每一場實際跑事件——
//     2-a 只有可昕（視訊；週六政大）：第一輪 k1～k4 各一次照舊；之後平日 1～7、週六 8～9 每句一次照順序，用完只留收尾（平日「（讀到十一點。）」、週六「（讀到傍晚。）」）
//     2-b 只有語彤（麵店；週六總圖）：第一次那三句照舊、y1～y4 各一次；之後平日 1～6、週六 7～8 每句一次，用完收尾（「（讀到十點半，鐵門拉下來。）」「（讀到閉館。）」）
//     2-c 分開讀：一晚可昕（一、三視訊）、一晚語彤（五、六），各自照順序
//     2-d 第 4 節 ③ 舊存檔：不用「減 4」，旁白另開計數（BAR_GROUP_KN／KNS、YN／YNS），舊存檔沒有＝從第 1 句看起；第一輪是不是演完照 KI、YI 有沒有到 4
//     2-e 第 4 節 ② 三個人一起讀（kind three，都在麵店）：第一輪 k、y 輪流八次照舊；之後另一組六句照順序各一次（第 4 句只在平日、第 5 句只在週六），用完收尾（「（讀到十點半，鐵門拉下來。）」「（讀到傍晚。）」）；舊存檔也從第 1 句
// 修改前（開發分支 661423a71）：0（R2Y4B_BAR_NARR）、1、2-a～2-e FAIL（第 4 節以前的 896071162：0（three）、2-a 計數、2-d、2-e FAIL）。用法：node tests/aa468_evdup2_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(NOODLE_CLOSED|R2Y4B|R2Y4B_EVENTS|R2Y4B_BAR_NARR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
const {check,GM,E}=H, J=JSON.stringify;
GM.caption=()=>{}; GM.toast=()=>{}; GM.memo=()=>{}; GM.money=()=>{};
global.CG_REGISTRY={};
load('src/noodle_closed3d.js'); load('src/data/r2y4b_events.js'); load('src/r2y4b3d.js');
const SHA='8a7f797ec', P468='docs/story_planning/AA_468_事件台詞第二輪_芷若英國跨年兩年_律師讀書小組九十晚.md';
const DOC=(()=>{ try{ return cp.execSync('git -c core.quotepath=false show '+SHA+':"'+P468+'"',{cwd:process.env.SPEC_GIT_DIR||H.ROOT,encoding:'utf8',maxBuffer:1<<26,stdio:['ignore','pipe','ignore']}); }catch(e){ return ''; } })();
const part=(a,b)=>{ const i=DOC.indexOf(a); if(i<0) return ''; const j=b?DOC.indexOf(b,i+a.length):-1; return DOC.slice(i,j<0?DOC.length:j); };
const rows=s=>s.split('\n').filter(l=>/^\|/.test(l.trim())&&!/^\|[-| :]+\|\s*$/.test(l.trim())).map(l=>l.trim().replace(/^\||\|$/g,'').split('|').map(c=>c.trim()));
/* 第 1 節：大四的表 */
const T1={}; for(const r of rows(part('## 1.','## 2.'))) if(r[0]!=='哪一句') T1[r[0]]=r[1];
const Y3_OLD=['（她把手機轉向窗外。很遠的地方有煙火，聲音比畫面慢了一點。）','新年快樂。……你那邊八個小時以前就說過了吧。','冷。可是外面好多人，沒那麼冷。','我要去睡了。你去吃早餐。','（畫面停在她揮手的那一格，才斷掉。）','沒關係。你那邊早上了，可能還在睡。新年快樂。'];   /* 稿第 1 節列的「後面全部一字不差」（大三照舊）*/
/* 第 2 節：2-1、2-2 */
const narrTab=s=>{ const R=rows(s), wd=[], sat=[]; let end=null; for(const r of R){ if(/^\d+$/.test(r[0])){ (r[1]==='週六'?sat:wd).push(r[2]); } else if(r[0]==='收尾'){ const [a,b]=r[2].split('／'); end={wd:a,sat:b}; } } return {wd,sat,end}; };
const K=narrTab(part('### 2-1','### 2-2')), Y=narrTab(part('### 2-2','- **三個人一起讀**'));
/* 第 4 節 ② 三個人：[旁白, when（null 都可以、'wd' 平日、'sat' 週六）]、收尾 */
const T3=(()=>{ const R=rows(part('## 4.','- **③')), L=[], W=[]; let end=null; for(const r of R){ if(/^\d+$/.test(r[0])){ L.push(r[2]); W.push(r[1]==='平日'?'wd':(r[1]==='週六'?'sat':null)); } else if(r[0]==='收尾'){ const [a,b]=r[2].split('／'); end={wd:a,sat:b}; } } return {list:L,when:W,end}; })();
const ev=id=>STORY_EVENTS.find(e=>e.id===id), S=typeof R2Y4B!=='undefined'?R2Y4B:null, D=k=>STORY.dayOfKey(k), keyOf=d=>CALENDAR.dateOf(d).key, wdOf=d=>CALENDAR.dateOf(d).wd%7;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const fresh=(key,h,zone,flags)=>{ const G=H.fresh(key,h,zone,Object.assign({EXCHANGE_ROUTE:'TW',EXCH_RULE:1},flags||{})); G.acts={att:{}}; G.outings=[]; H.at(key,h); G.zone=zone||'dorm'; GM.npc={}; return G; };
const run=async(id,picks)=>{ H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); await EVENTS.run(ev(id)); return H.said.map(s=>s.t); };
const OLD_K=['刑總那題，你先講結論，再講理由。講完我再問。','這題你上禮拜錯過。……我記得。再一次。','你講得太快了。慢一點，講給一個不懂法律的人聽。……就是我那個室友。','好，換你出題。出一題你自己也不確定的。'];
const OLD_Y=['押租金那個，你講給我聽。不要講條號。','……這個詞我在社會系也學過，可是意思不一樣。你講你們的。','你剛剛那一段，跟上禮拜講的不一樣。哪一個對？','我出一題我自己不會的。你答完，我抄下來。'];
const YT_FIRST=['（十點，麵店拉下一半的鐵門。語彤把兩碗麵推到長桌另一頭，她自己那一份不在桌上。）','我今年不考。……可是我可以考你。','買賣不破租賃那一條。你講給我聽，講到我聽得懂。'];
/* 讀書小組：kind＝kexin／yutong／split／three；2/26～8/3 每一場（S.session）照時間跑事件，回傳 [{k,sat,mode,L}] */
const bar=async(kind,flags)=>{ const G=fresh('2029-02-22',23,'dorm',Object.assign({Y4_PATH:'bar',BAR_GROUP_KIND:kind,BAR_STUDY_GROUP:kind==='kexin'?['kexin']:(kind==='yutong'?['yutong']:['kexin','yutong']),BAR_GROUP_START:kind==='split'?'kexin':kind},flags||{}));
  if(kind!=='yutong') H.date('kexin'); if(kind!=='kexin') H.FRIEND('heroine_03'); if(kind==='three') ROM.learn(G,'heroine_03','kexin','test'); G.events.done.ev_bar_group_start=1; return G; };
const season=async(G,from,to)=>{ const out=[]; for(let d=D(from||'2029-02-26');d<=D(to||'2029-08-03');d++){ const s=S.session(G,d); if(!s) continue; H.at(keyOf(d),s.t0+0.5);
    let L=null; if(s.mode==='video'||s.mode==='nccu') L=await run('ev_bar_group_video'); else { G.zone=s.mode==='noodle'?'noodle':'library_hall'; if(EVENTS.check(ev('ev_bar_group_night'))) L=await run('ev_bar_group_night'); }
    if(L) out.push({k:keyOf(d),sat:wdOf(d)===6,who:s.who,mode:s.mode,L,W:H.said.map(x=>x.who)}); }
  return out; };
/* 照稿的規則算這一個人每一場應該是哪一句（第一輪 4 句；之後平日、週六各自照順序；用完收尾）*/
const model=(R,first4,T,firstExtra)=>{ let c=0, w=0, s=0; const exp=[]; for(const r of R){ if(firstExtra&&exp.length===0){ exp.push(J(firstExtra)); continue; }
    if(c<4){ exp.push(J([first4[c]])); c++; continue; } if(r.sat){ exp.push(J([s<T.sat.length?T.sat[s]:T.end.sat])); s++; } else { exp.push(J([w<T.wd.length?T.wd[w]:T.end.wd])); w++; } c++; } return exp; };

(async()=>{
  check('0. 讀稿（企劃線 AA_468 @'+SHA+'）：第 1 節七列、2-1 可昕七＋二＋收尾、2-2 語彤六＋二＋收尾、第 4 節三個人六句＋收尾',DOC.indexOf('# AA_468')>=0&&Object.keys(T1).length===7&&K.wd.length===7&&K.sat.length===2&&!!K.end&&Y.wd.length===6&&Y.sat.length===2&&!!Y.end&&T3.list.length===6&&J(T3.when)===J([null,null,null,'wd','sat',null])&&!!T3.end,J({T1,K,Y,T3}));
  check('0. 檔案載得到（R2Y4B、事件）',!!S&&!!ev('ev_bar_group_night')&&!!ev('ev_zr_nye_video_y4'));
  if(!DOC||!S){ H.done(); return; }
  await sec(0,()=>{
    const N=typeof R2Y4B_BAR_NARR!=='undefined'?R2Y4B_BAR_NARR:null;
    check('0. R2Y4B_BAR_NARR＝2-1、2-2 的表（平日、週六、收尾），一字不差、照順序',!!N&&J(N.kexin.wd)===J(K.wd)&&J(N.kexin.sat)===J(K.sat)&&N.kexin.wdEnd===K.end.wd&&N.kexin.satEnd===K.end.sat&&J(N.yutong.wd)===J(Y.wd)&&J(N.yutong.sat)===J(Y.sat)&&N.yutong.wdEnd===Y.end.wd&&N.yutong.satEnd===Y.end.sat,J(N));
    check('0. R2Y4B_BAR_NARR.three＝第 4 節的表（六句、平日／週六、收尾），一字不差',!!N&&!!N.three&&J(N.three.list)===J(T3.list)&&J(N.three.when)===J(T3.when)&&N.three.wdEnd===T3.end.wd&&N.three.satEnd===T3.end.sat,J(N&&N.three));
    const TX=['ev_bar_group_night','ev_bar_group_video'].flatMap(id=>ev(id).dialogue.filter(l=>l.text).map(l=>l.text));
    check('0. 旁白都是沒有人說話的（speaker null）、照舊沒有條號',[...K.wd,...K.sat,...Y.wd,...Y.sat,...T3.list].every(t=>['ev_bar_group_night','ev_bar_group_video'].some(id=>ev(id).dialogue.some(l=>l.text===t&&l.speaker===null)))&&!TX.some(t=>/第\s*[0-9一二三四五六七八九十百]+\s*條/.test(t)));
  });

  /* ======================= 1 芷若在英國的跨年 ======================= */
  await sec(1,async()=>{
    const d=D('2029-01-01'); fresh('2029-01-01',8,'dorm',{}); const a=await run('ev_zr_nye_video_y4',[0]); const optsA=H.opts[0];
    fresh('2029-01-01',8,'dorm',{}); const b=await run('ev_zr_nye_video_y4',[1]);
    check('1. 大四 回「新年快樂。」：開頭照舊「臺灣的年你跨完了。換我。」、旁白、回覆、結尾、結尾旁白照表',J(a)===J([T1['開頭（照舊）'],T1['旁白'],T1['回「新年快樂。」'],T1['結尾'],T1['結尾旁白']]),J(a));
    check('1. 大四 回「妳那邊冷嗎？」：「冷。今年我有買手套了。」',J(b)===J([T1['開頭（照舊）'],T1['旁白'],T1['回「妳那邊冷嗎？」'],T1['結尾'],T1['結尾旁白']]),J(b));
    check('1. 大四 選項照舊；ZR_NYE_VIDEO_Y4',J(optsA)===J(['「新年快樂。」','「妳那邊冷嗎？」'])&&H.G.flags.ZR_NYE_VIDEO_Y4===true);
    const G=fresh('2029-01-01',8,'dorm',{}); ev('ev_zr_nye_video_y4').outingMissed(G,GM,{day:d}); H.at('2029-01-01',9); PHONE.tick(G); const miss=(G.msgs||[]).filter(m=>m.tag==='zr_nye_miss_y4');
    check('1. 大四 沒接（outingMissed）：08:30 芷若「睡吧。新年快樂。……醒了再說。」',miss.length===1&&miss[0].text===T1['沒接（08:30）']&&Math.abs(miss[0].h-8.5)<1e-6&&miss[0].th==='p:heroine_02',J(miss.map(m=>m.text)));
    fresh('2028-01-01',8,'dorm',{}); const c=await run('ev_zr_nye_video_y3',[0]); fresh('2028-01-01',8,'dorm',{}); const c2=await run('ev_zr_nye_video_y3',[1]);
    const G3=fresh('2028-01-01',8,'dorm',{}); ev('ev_zr_nye_video_y3').outingMissed(G3,GM,{day:D('2028-01-01')}); H.at('2028-01-01',9); PHONE.tick(G3);
    check('1. 大三 ev_zr_nye_video_y3 照舊（旁白、兩個回覆、結尾、結尾旁白、沒接那一則）',c.includes(Y3_OLD[0])&&c.includes(Y3_OLD[1])&&c2.includes(Y3_OLD[2])&&c.includes(Y3_OLD[3])&&c.includes(Y3_OLD[4])&&(G3.msgs||[]).some(m=>m.tag==='zr_nye_miss_y3'&&m.text===Y3_OLD[5]),J([c,c2]));
    const y4=new Set([...a,...b,T1['沒接（08:30）']]), y3=[...c,...c2,Y3_OLD[5]];
    check('1. 大三、大四演出來的字（含沒接那一則）除了開頭的不同，沒有一句一樣',y3.every(t=>!y4.has(t)),J(y3.filter(t=>y4.has(t))));
  });

  /* ======================= 2-a 只有可昕 ======================= */
  await sec('2-a',async()=>{
    const G=await bar('kexin'); const R=await season(G);
    const exp=model(R,OLD_K,K);
    check('2-a 只有可昕：2/26～8/3 一共 '+R.length+' 場（每週一、三、五視訊，週六政大），每場一句',R.length>=80&&R.every(r=>r.L.length===1)&&R.every(r=>r.mode===(r.sat?'nccu':'video')),J(R.length));
    check('2-a 第一輪 k1～k4 各一次照舊（可昕說的）；之後平日 1～7、週六 8～9 每句一次照順序；用完只留收尾',J(R.map(r=>J(r.L)))===J(exp),J(R.slice(0,16).map(r=>r.k+(r.sat?'六':'')+r.L[0])));
    const flat=R.map(r=>r.L[0]);
    check('2-a 九句旁白各出現一次；k1～k4 各一次；其他都是收尾那兩句',[...K.wd,...K.sat].every(t=>flat.filter(x=>x===t).length===1)&&OLD_K.every(t=>flat.filter(x=>x===t).length===1)&&flat.filter(t=>![...K.wd,...K.sat,...OLD_K].includes(t)).every(t=>t===K.end.wd||t===K.end.sat));
    check('2-a 週六那兩句只在週六；收尾平日「（讀到十一點。）」、週六「（讀到傍晚。）」',R.filter(r=>K.sat.includes(r.L[0])||r.L[0]===K.end.sat).every(r=>r.sat)&&R.filter(r=>K.wd.includes(r.L[0])||r.L[0]===K.end.wd).every(r=>!r.sat)&&flat.includes(K.end.wd)&&flat.includes(K.end.sat));
    check('2-a 旁白沒有人說話（speaker null）；k1～k4 是可昕說的',R.filter(r=>!OLD_K.includes(r.L[0])).length>70&&R.filter(r=>!OLD_K.includes(r.L[0])).every(r=>r.W[0]===null)&&R.filter(r=>OLD_K.includes(r.L[0])).every(r=>r.W[0]!==null&&/可昕/.test(r.W[0])),J(R.slice(0,6).map(r=>r.W[0])));
    check('2-a 計數：BAR_GROUP_KI＝場數；旁白另開計數 BAR_GROUP_KN＝第一輪以後的平日場數、BAR_GROUP_KNS＝第一輪以後的週六場數（沒有 KS 了）',G.flags.BAR_GROUP_KI===R.length&&G.flags.BAR_GROUP_KN===R.slice(4).filter(r=>!r.sat).length&&G.flags.BAR_GROUP_KNS===R.slice(4).filter(r=>r.sat).length&&G.flags.BAR_GROUP_KS===undefined,J([G.flags.BAR_GROUP_KI,G.flags.BAR_GROUP_KN,G.flags.BAR_GROUP_KNS,R.length]));
  });

  /* ======================= 2-b 只有語彤 ======================= */
  await sec('2-b',async()=>{
    const G=await bar('yutong'); const R=await season(G);
    const exp=model(R,OLD_Y,Y,YT_FIRST);
    check('2-b 只有語彤：'+R.length+' 場（一、三、五麵店，週六總圖）',R.length>=80&&R.every(r=>r.mode===(r.sat?'library':'noodle')),J(R.length));
    check('2-b 第一次那三句照舊、y1～y4 各一次；之後平日 1～6、週六 7～8 每句一次照順序；用完只留收尾',J(R.map(r=>J(r.L)))===J(exp),J(R.slice(0,14).map(r=>r.k+(r.sat?'六':'')+r.L.join('/'))));
    const flat=R.slice(1).map(r=>r.L[0]);
    check('2-b 八句旁白各一次；收尾平日「（讀到十點半，鐵門拉下來。）」、週六「（讀到閉館。）」只在對的日子',[...Y.wd,...Y.sat].every(t=>flat.filter(x=>x===t).length===1)&&R.filter(r=>r.L[0]===Y.end.sat||Y.sat.includes(r.L[0])).every(r=>r.sat)&&R.filter(r=>r.L[0]===Y.end.wd||Y.wd.includes(r.L[0])).every(r=>!r.sat)&&flat.includes(Y.end.wd)&&flat.includes(Y.end.sat));
  });

  /* ======================= 2-c 分開讀 ======================= */
  await sec('2-c',async()=>{
    const G=await bar('split'); const R=await season(G), RK=R.filter(r=>r.who==='kexin'), RY=R.filter(r=>r.who==='yutong');
    check('2-c 分開讀：週一、三可昕（視訊）、週五、六語彤（麵店、總圖）',RK.length>20&&RY.length>20&&RK.every(r=>r.mode==='video')&&RY.every(r=>r.mode==='noodle'||r.mode==='library'));
    check('2-c 可昕那幾晚照 2-1 的順序（第一輪 k1～k4，之後平日 1～7、用完收尾）',J(RK.map(r=>J(r.L)))===J(model(RK,OLD_K,K)),J(RK.slice(0,12).map(r=>r.L[0])));
    check('2-c 語彤那幾晚照 2-2 的順序（第一次那三句，y1～y4，之後平日、週六各自照順序）',J(RY.map(r=>J(r.L)))===J(model(RY,OLD_Y,Y,YT_FIRST)),J(RY.slice(0,12).map(r=>(r.sat?'六':'')+r.L[0])));
  });

  /* ======================= 2-d 舊存檔（第 4 節 ③）======================= */
  await sec('2-d',async()=>{
    let G=await bar('kexin',{BAR_GROUP_KI:10,BAR_GROUP_N:10}); let R=await season(G,'2029-05-07','2029-05-12');
    check('2-d 舊存檔（可昕 KI=10，四句聽過好幾輪、沒有旁白的計數）：平日從第 1 句看起、下一晚第 2 句；週六也從第 1 句',R.length===4&&R[0].L[0]===K.wd[0]&&R[1].L[0]===K.wd[1]&&R[2].L[0]===K.wd[2]&&R[3].sat&&R[3].L[0]===K.sat[0],J(R.map(r=>r.k+r.L[0])));
    G=await bar('kexin',{BAR_GROUP_KI:3}); R=await season(G,'2029-05-07','2029-05-09');
    check('2-d 舊存檔（KI=3）：第一輪還沒完（KI 沒到 4），先 k4，再平日第 1 句',R.length===2&&R[0].L[0]===OLD_K[3]&&R[1].L[0]===K.wd[0],J(R.map(r=>r.L[0])));
    G=await bar('yutong',{BAR_GROUP_YI:6,BAR_GROUP_YT_FIRST:D('2029-02-26')}); R=await season(G,'2029-05-07','2029-05-12');
    check('2-d 舊存檔（語彤 YI=6）：平日從第 1 句看起、下一晚第 2 句；週六從第 1 句（總圖的長桌）',R.length===4&&R[0].L[0]===Y.wd[0]&&R[1].L[0]===Y.wd[1]&&R[2].L[0]===Y.wd[2]&&R[3].sat&&R[3].L[0]===Y.sat[0],J(R.map(r=>r.k+r.L[0])));
    G=await bar('three',{BAR_GROUP_KI:9,BAR_GROUP_YI:9,BAR_GROUP_N:18}); R=await season(G,'2029-05-07','2029-05-12');
    check('2-d 舊存檔（三個人 KI=YI=9）：三個人的旁白從第 1 句看起',R.length===4&&J(R.map(r=>r.L[0]))===J([T3.list[0],T3.list[1],T3.list[2],T3.list[4]]),J(R.map(r=>r.k+(r.sat?'六':'')+r.L[0])));
  });

  /* ======================= 2-e 三個人（第 4 節 ②）======================= */
  await sec('2-e',async()=>{
    const G=await bar('three'); const R=await season(G), flat=R.map(r=>r.L[0]);
    check('2-e 三個人在麵店（kind three）：'+R.length+' 場都在麵店、每場一句',R.length>=80&&R.every(r=>r.mode==='noodle'&&r.who==='three'&&r.L.length===1),J(R.length));
    check('2-e 第一輪照舊：k、y 輪流八次（可昕 k1、語彤 y1、k2、y2…）',J(flat.slice(0,8))===J([OLD_K[0],OLD_Y[0],OLD_K[1],OLD_Y[1],OLD_K[2],OLD_Y[2],OLD_K[3],OLD_Y[3]]),J(flat.slice(0,8)));
    const used=[], exp=R.slice(8).map(r=>{ for(let i=0;i<6;i++){ if(used.includes(i)) continue; const w=T3.when[i]; if((w==='sat'&&!r.sat)||(w==='wd'&&r.sat)) continue; used.push(i); return T3.list[i]; } return r.sat?T3.end.sat:T3.end.wd; });
    check('2-e 之後第 4 節的六句照順序各一次（第 4 句只在平日、第 5 句只在週六，輪到不能用的先留著），用完留收尾',J(flat.slice(8))===J(exp),J(R.slice(8,18).map(r=>r.k+(r.sat?'六':'')+r.L[0])));
    check('2-e 六句都出現一次；「（十點，阿姨把燈關掉一半。…）」在平日、「（週六的長桌。…）」在週六；收尾平日「（讀到十點半，鐵門拉下來。）」、週六「（讀到傍晚。）」',T3.list.every(t=>flat.filter(x=>x===t).length===1)&&R.filter(r=>r.L[0]===T3.list[3]).every(r=>!r.sat)&&R.filter(r=>r.L[0]===T3.list[4]).every(r=>r.sat)&&R.filter(r=>r.L[0]===T3.end.wd).every(r=>!r.sat)&&R.filter(r=>r.L[0]===T3.end.sat).every(r=>r.sat)&&flat.includes(T3.end.wd)&&flat.includes(T3.end.sat));
    check('2-e 三個人的時候不出現可昕視訊、語彤總圖那兩套旁白',!flat.some(t=>[...K.wd,...K.sat,...Y.wd,...Y.sat].includes(t)));
    check('2-e 旁白沒有人說話；用過的記在 BAR_GROUP_3U',R.slice(8).every(r=>r.W[0]===null)&&J((G.flags.BAR_GROUP_3U||[]).slice().sort())===J([0,1,2,3,4,5]),J(G.flags.BAR_GROUP_3U));
  });
  H.done();
})();
