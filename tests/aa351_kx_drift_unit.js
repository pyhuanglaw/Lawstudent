// AA_351（企劃線 c29c49eb；AA_384 跟著改過的 b6588bf5；任務 AA351-KX-DRIFT-1021；USER_WANTS C23）可昕「個性磨合不了，慢慢分手」——不需要瀏覽器。
//   1  讀稿：程式裡每一句（KXDRIFT.L、八個事件的對話與選項）都逐字在稿裡（「（不說）」是程式加的選項）；稿上第 3 節的每一句程式都有（劃掉的、AA_384 的改稿說明不算台詞）
//      修改前（8352054b）讀 b6588bf5 的稿：FAIL 1 項（「你今天在 118 巷？」已經不在稿裡），其他 89 項 PASS
//   2  D0：約另一位女主角單獨吃飯／散步（邀約、兩個人都在那裡直接開始、校外約會）多「（跟可昕說一聲）」；說了＝祐廷傳那一則（今天／明天／週○）、她照順序回、−1、那一次沒有 D1；Café、總圖不問
//   3  D1：沒說、公館＝那天 21:00 她打來；三個選項 +0／+1／+2；溫州街換第一句；結束晚＝結束後 30 分鐘；沒接＝+1、隔天 12:00 兩則、D2；同一學期第二次不演、下學期又演；K5 不會被她的電話擋掉
//   4  D1b：14 天內同一位單獨出去兩次（先說了也算）＝下一次見面（K5）開頭她問；「妳想太多了。」+1；一學期一次；曖昧中（第 5 階）不演
//   5  D2：之後兩天短回覆（嗯、在忙、嗯）；第三天 21:00 問；「好。」＝週六 18:30 政大山下；第二個選項 +1；隔天 21:00 沒回＝+1、沒有那個週六；寒假中到 2＝開學才問、開學後第一個週六
//   6  D3：大二上到 4 不演、大二下才演；平日 22:00 視訊；沒見過邵鈞換句；第二個選項 +1；予樂 23:00（有她的聯絡方式才有）
//   7  D4：到 6＝當天 21:00 她約週五；不行→「那週六。」→不行→「好。」等 D5；三個選項（歸零修補／不歸零修補／等 D5）；沒到＝「好。」等 D5（+0）
//   8  修補期 35 天：成功＝KX_REPAIRED、下一次 K5 見面「這個月你都有先講。」一次；修補成功以後又到 6＝直接 D5；不歸零、結束還在 6 以上＝D5
//   9  D5 只在學期末：期末考最後一天 21:00 她傳、隔天 19:00 政大宿舍樓下；記 ROM.end drift、KX_ENDED、KX_ENDED_ON；她排好的出遊取消；到家手機自動打開；沒到＝21:00 電話；也沒接＝隔天 12:00 文字版
//   10 分開以後：canStart false（ROM.start 也不行）、學期末沒有她（心意、期末約會）、K5 不再排、尾聲不用前任版（一般分手照舊）
//   11 D6：手機照樣傳得到她、前 60 天她回得很短、不傳；第 61 天她先傳（還沒到實習的年份那一句）＋週六中午公館；不行＝下一個週六、再不行＝不約；吃完照朋友；2028-11-23 以後是實習那一句
//   12 範圍：大一不算；另一段感情＝凍結（凍結的日子不算 21 天）；美國路線大四上不演 D4、21 天不算、D3 照演（當地時間）；大四下不演 D4；寒假不演 D4、21 天不算；日本路線大三下沒說的出遊不演 D1
//   13 數字：和她的出遊準時到 −1 一週一次（K5 的 PGDATE.kxArrive 同一個上限；畢業以後的格子照原本、不設上限）、遲到 +1；主動約她 −1 一週一次；21 天 +1 一段一次、見了面重新算
//   14 舊存檔：沒有 KX_DRIFT、KX_CRACK＝預設、從讀檔那天開始算；掛勾、index.html 的順序
// 修改前（開發分支 e2ae60b6，git archive 匯出的乾淨副本）：沒有 src/kxdrift3d.js——用空的替身照樣跑完：FAILED 36（大部分的節一開始就丟例外，一節算一項）、PASS 10（都是「不該發生」的對照項：
//   2 說了就沒有電話、3 K5 照排、4 不再問／曖昧中不演、5 兩天過了照一般、10 一般分手照前任版、12 大一下沒有／另一段凍結兩項、14 20 天還沒到）。匯出的副本不是 git repo，所以第 1 節「讀得到稿」也是 FAIL。
// 用法：node tests/aa351_kx_drift_unit.js（第 1 節要讀企劃線的 b6588bf5——AA_384 跟著改過的 AA_351：git fetch 過企劃線才讀得到）
// AA_384（AA 回 LAWWW 的十四題）改的部分（D1 拿掉 118 巷、D6 拿掉祐廷的生日、只看玩家自己約的、分開以後當朋友）在 tests/aa384_kx_friend_unit.js。
'use strict';
require('./alison.js');   // 讀企劃稿（git show）照匯入工具同一套換：Alison、虛構校名（WORLD-RENAME-1030，docs/WORLD_NAMING.md）
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H;
const NAMES=/^(NOODLE_CLOSED|R2Y4B|R2Y4B_EVENTS|Y5|PG_DATES|PGDATE|KXOD|KXDRIFT|MSG|MSG_POOL|MSG2_POOL|HV|HOMETOWN_LINES)$/;
const load=f=>{ if(!fs.existsSync(path.join(H.ROOT,f))) return false; let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>NAMES.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); return true; };
global.CG_REGISTRY={};
/* index.html 的順序：msg3d.js、hometown3d.js 在前面；pgdates3d.js、kxod3d.js 之後才是 kxdrift3d.js */
for(const f of ['src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/data/hometown_lines.js','src/hometown3d.js','src/noodle_closed3d.js','src/data/r2y4b_events.js','src/r2y4b3d.js','src/y5s1_3d.js','src/data/pg_dates.js','src/pgdates3d.js','src/kxod3d.js']) load(f);
const loaded=load('src/kxdrift3d.js');
const has=loaded&&typeof KXDRIFT!=='undefined'&&typeof KXDRIFT.rule==='function';
const noop=()=>null; const K=has?KXDRIFT:new Proxy({L:{d0:{},r1:{},r1b:{},r2:{},r3:{},r4:{},r5:{talk:[]},r6:{}},EVS:[]},{get:(t,p)=>p in t?t[p]:noop});   /* 修改前：空的替身（每一項照樣算 FAIL）*/
const T=(d,h)=>d*24+h, D=k=>STORY.dayOfKey(k), key=d=>CALENDAR.dateOf(d).key, wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const setT=(G,d,h)=>{ G.day=d; G.hour=h; G.weekday=wdOf(d); };
/* 一格：這個檔的規則、K5 的規則、過了時間的出遊（沒去）、手機 */
const tick=G=>{ K.rule(G); if(typeof KXOD!=='undefined'&&KXOD.rule) KXOD.rule(G); for(const q of OUT.expire(G)) OUT.onMissed(GM,q); PHONE.tick(G); };
const walk=(G,a,b,step)=>{ for(let t=a;t<=b+1e-9;t+=(step||1)){ const d=Math.floor(t/24+1e-9); setT(G,d,t-d*24); tick(G); } };
const until=(G,pred,maxH,step)=>{ const a=T(G.day,G.hour); for(let t=a;t<=a+(maxH||240);t+=(step||1)){ const d=Math.floor(t/24+1e-9); setT(G,d,t-d*24); tick(G); if(pred(G)) return true; } return false; };
/* 出發：時間設到該出發的時候（不遲到）、照選項演完 */
const go=async(G,q,picks)=>{ if(!q) return []; const dep=T(q.day,q.h)-(q.travelH||0)-0.05; if(T(G.day,G.hour)<dep){ const d=Math.floor(dep/24+1e-9); setT(G,d,dep-d*24); } H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); await OUT.go(GM,q); return H.lines(); };
const msgs=(G,th)=>(G.msgs||[]).filter(m=>m.th===(th||'p:kexin'));
const fresh=(k,h,more)=>{ const G=H.fresh(k,h,'dorm',Object.assign({dating_kexin:true,KX_OUR_DAY:{day:'sat',mode:'mid'},EXCHANGE_ROUTE:'TW'},more||{})); ROM.rec(G); return G; };
const cr=G=>+G.flags.KX_CRACK||0;
const R=G=>G.flags.KX_DRIFT||{};
const nm=id=>SOCIAL.displayName(id);
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
/* 約好一次單獨的出遊（INV.accept＝她答應了），接著問 D0：pick 0＝說一聲、1＝不說 */
const mkInv=async(G,who,pid,day,h,pick)=>{ const iv=INV.accept(G,who,pid,day,h,{by:'player'}); H.opts=[]; H.picks=[pick]; await K.invTell(GM,iv); return iv; };
const meet=async(G,iv)=>{ setT(G,iv.day,iv.h); await INV.meet(GM,iv,null); };
const outs=(G,re)=>OUT.rec(G).filter(q=>re.test(String(q.id||'')));
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const askOf=(G,id)=>(G.msgs||[]).find(m=>m.ask&&(id instanceof RegExp?id.test(m.ask.id):m.ask.id===id))||null;

(async()=>{
check('0. 載入 src/kxdrift3d.js（KXDRIFT.rule、八個事件 ev_kx_drift_*）',has&&['ev_kx_drift_r1','ev_kx_drift_r1b','ev_kx_drift_r2','ev_kx_drift_r3','ev_kx_drift_r4','ev_kx_drift_r5','ev_kx_drift_r5_call','ev_kx_drift_r6'].every(id=>STORY_EVENTS.some(e=>e.id===id)),String(has));

/* ---------- 1 讀稿 ---------- */
await sec(1,async()=>{ let doc=''; try{ doc=cp.execSync('git show b6588bf5:"docs/story_planning/AA_351_事件包_可昕慢慢分手_定稿.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ doc=''; }   /* AA_351 跟著 AA_384 改過的那一版（企劃線 b6588bf5：D0 那半句刪掉、D1 拿掉 118 巷、D6 拿掉祐廷的生日）*/
  check('1. 讀得到稿（企劃線 b6588bf5 的 AA_351）',doc.length>1000,String(doc.length));
  const s3=doc.slice(doc.indexOf('## 3.'),doc.indexOf('## 4.')).replace(/~~[^~]*~~/g,'').replace(/（[^（）]*AA_384[^（）]*）/g,'');   /* 劃掉的（祐廷的生日）、AA_384 的改稿說明（「D1b 也不算那一次」是引用刪掉的字）不是台詞 */
  const prog=[]; const walkStr=o=>{ if(typeof o==='string') prog.push(o); else if(Array.isArray(o)) o.forEach(walkStr); else if(o&&typeof o==='object') for(const k in o) walkStr(o[k]); }; walkStr(K.L);
  for(const e of (K.EVS||[])){ if(e.id==='ev_kx_drift_r7') continue;   /* 一學期一次的午餐是 AA_384 第 3 項（tests/aa384_kx_friend_unit.js 讀那一份）*/
    for(const l of (e.dialogue||[])){ if(typeof l.text==='string') prog.push(l.text.replace('{flag:KXD_HER}','{她}')); if(Array.isArray(l.choice)) for(const c of l.choice) prog.push(c.text); } }
  const SYS=['（不說）'];   /* 程式加的系統字（D0 不說的那一個選項；回報 AA）*/
  const derived=new Set(); if(K.L.r3&&K.L.r3.first) derived.add(K.L.r3.first.replace(K.L.r3.shao,K.L.r3.noShao));   /* 稿：「邵鈞」換成「我們讀書會一個人」*/
  const bad=[...new Set(prog)].filter(t=>!SYS.includes(t)&&!derived.has(t)&&!doc.includes(t));
  check('1. 程式裡的每一句（KXDRIFT.L＋八個事件的對話、選項）都逐字在稿裡',prog.length>80&&!bad.length,'共 '+prog.length+' 句；不在稿裡：'+JSON.stringify(bad.slice(0,8)));
  const want=new Set();
  for(const ln of s3.split('\n')){ const t=ln.trim(); const m=t.match(/^(?:>\s*)?可昕：(.+)$/); if(m) want.add(m[1].trim()); if(/^（.+）$/.test(t)&&!/^（接上面/.test(t)) want.add(t);
    if(/^\|/.test(t)&&!/^\|\s*(選項|---)/.test(t)){ const c=t.split('|').slice(1,3).join('|'); for(const q of c.matchAll(/「([^」]+)」/g)) want.add(q[1]); for(const q of c.replace(/「[^」]*」/g,'').matchAll(/（[^）]+）/g)) want.add(q[0]); } }
  for(const q of s3.matchAll(/「([^」]+)」/g)) want.add(q[1]);
  for(const w of ['我們的日子','前任']) want.delete(w);   /* 不是台詞：「我們的日子」見面、用「前任」那一版 */
  const all=prog.concat(prog.map(t=>t.replace(/^「|」$/g,'')));
  const miss=[...want].filter(w=>!all.some(t=>t===w||t.includes(w)));
  check('1. 稿上第 3 節的每一句（對話、旁白、表格裡她的回答、選項、手機的字）程式都有',want.size>60&&!miss.length,'共 '+want.size+' 句；程式沒有：'+JSON.stringify(miss.slice(0,10))); });

/* ---------- 2 D0 ---------- */
await sec(2,async()=>{ const G=fresh('2026-10-07',12); H.FRIEND('heroine_01'); INV.addContact(G,'heroine_01'); G.flags.KX_CRACK=1;
  H.picks=['阿鳳麵店','明天 19:00','跟可昕說一聲']; H.opts=[]; const iv=await INV.flow(GM,'heroine_01',null,false); const menu=H.opts[H.opts.length-1]||[];
  const sent=msgs(G).find(m=>m.from==='player'); setT(G,G.day,23.5); PHONE.tick(G); const rep=msgs(G).filter(m=>m.from==='kexin').map(m=>m.text);
  check('2. 和可昕交往中，約以安去阿鳳麵店（吃飯）、她答應：多一個選單「（跟可昕說一聲）」／「（不說）」',!!iv&&iv.state==='accepted'&&eq(menu,['（跟可昕說一聲）','（不說）']),JSON.stringify(menu));
  check('2. 說了：祐廷傳「明天我跟'+nm('heroine_01')+'去阿鳳麵店吃飯。」、她回第一句「好。吃完跟我說好不好吃。」、KX_CRACK 1→0',!!sent&&sent.text==='明天我跟'+nm('heroine_01')+'去阿鳳麵店吃飯。'&&rep[0]==='好。吃完跟我說好不好吃。'&&cr(G)===0,JSON.stringify({t:sent&&sent.text,rep,c:cr(G)}));
  await meet(G,iv); tick(G);
  check('2. 說了的那一次：去了也沒有 D1 的電話',!outs(G,/^kx_drift_r1_/).length,JSON.stringify(outs(G,/^kx_drift/).map(q=>q.id)));
  setT(G,D('2026-10-14'),12); await mkInv(G,'heroine_01','wenzhou',D('2026-10-17'),15,0); setT(G,G.day,23.5); PHONE.tick(G);
  const t2=msgs(G).filter(m=>m.from==='player').pop(), r2=msgs(G).filter(m=>m.from==='kexin').pop();
  check('2. 三天後的週六散步：「週六我跟…去溫州街吃飯。」、她回第二句「好啊。不要吃太晚。」；已經是 0 不再往下（最低 0）',!!t2&&t2.text==='週六我跟'+nm('heroine_01')+'去溫州街吃飯。'&&!!r2&&r2.text==='好啊。不要吃太晚。'&&cr(G)===0,JSON.stringify({t:t2&&t2.text,r:r2&&r2.text,c:cr(G)}));
  H.opts=[]; const iv3=INV.accept(G,'heroine_01','library',D('2026-10-15'),14,{by:'player'}); H.picks=[0]; await K.invTell(GM,iv3); const iv4=INV.accept(G,'heroine_01','cafe',D('2026-10-15'),16,{by:'player'}); await K.invTell(GM,iv4);
  check('2. 總圖、Café（有理由的，不算兩個人單獨出去）：不問、不記',!H.opts.length&&!R(G).outs.some(x=>x.id===iv3.id||x.id===iv4.id),JSON.stringify(H.opts));
  /* 兩個人都在那裡、約「現在」＝直接開始（INV.startTogether）：開始以前先問 */
  setT(G,D('2026-10-16'),12); const iv5=INV.accept(G,'heroine_01','noodle',G.day,12,{by:'player'}); H.said=[]; H.opts=[]; H.picks=[1]; await INV.startTogether(GM,iv5,{obj:{position:{x:0,y:0,z:0}}});
  check('2. 兩個人都在那裡直接開始（INV.startTogether）：見面以前先問（選單是第一個）',eq(H.opts[0],['（跟可昕說一聲）','（不說）'])&&iv5.state==='done',JSON.stringify({o:H.opts[0],st:iv5.state}));
  /* 校外約會（DATE.menu 約成的那一趟）：也問；{地點}＝地點名稱 */
  const loc=DATE.loc('D13'), day6=D('2026-10-19'); H.opts=[]; H.picks=[0]; await K.dateTell(GM,{ok:true,trip:'T0099',who:'heroine_01',locs:['D13'],day:day6});
  const t6=msgs(G).filter(m=>m.from==='player').pop();
  check('2. 和以安的校外約會（淡水）：也問；說了＝「週一我跟…去'+(loc&&loc.name)+'吃飯。」',!!loc&&eq(H.opts[0],['（跟可昕說一聲）','（不說）'])&&!!t6&&t6.text==='週一我跟'+nm('heroine_01')+'去'+loc.name+'吃飯。',JSON.stringify(t6&&t6.text)); });

/* ---------- 3 D1 ---------- */
await sec(3,async()=>{ const run=async(pick,o)=>{ o=o||{}; const G=fresh('2026-10-07',12); H.FRIEND('heroine_01'); INV.addContact(G,'heroine_01'); if(o.crack!=null) G.flags.KX_CRACK=o.crack; tick(G);
    const iv=await mkInv(G,'heroine_01',o.place||'noodle',D('2026-10-08'),o.h||18,1); await meet(G,iv); tick(G); const q=outs(G,/^kx_drift_r1_/)[0];
    let L=[]; if(q&&pick!=null) L=await go(G,q,[pick]); return {G,q,L}; };
  let {G,q,L}=await run(null); const k5=OUT.rec(G).some(x=>x.kxod&&x.state==='planned'&&x.day===D('2026-10-10'));
  check('3. 沒說就和以安去公館（阿鳳麵店 18:00～18:45）：那天 21:00 她打來（接起來／先不接）',!!q&&q.day===D('2026-10-08')&&q.h===21&&q.call&&q.verb==='接起來'&&q.no==='先不接',JSON.stringify(q&&{d:key(q.day),h:q.h}));
  check('3. 她打來的電話不算「她的出遊」：那週六的「我們的日子」照排',k5,JSON.stringify(OUT.rec(G).filter(x=>x.kxod).map(x=>key(x.day)+':'+x.state)));
  ({G,q,L}=await run(0));
  check('3. 接起來：（手機響了。可昕。）→「你今天在公館？」→ 兩句；「我忘了講。對不起。」＝「……好。下次講。」（電話掛得很快。）、+0、沒有 D2',L[0]==='（手機響了。可昕。）'&&/你今天在公館？$/.test(L[1]||'')&&/予樂說看到你，跟一個女生。$/.test(L[2]||'')&&/……好。下次講。$/.test(L[L.length-2]||'')&&L[L.length-1]==='（電話掛得很快。）'&&cr(G)===0&&!R(G).r2,JSON.stringify(L));
  ({G,L}=await run(1)); check('3. 「只是一起吃飯。」：「我又沒說你們怎樣。」…「……算了，我要去洗澡。」、+1、D2 開始',cr(G)===1&&/……算了，我要去洗澡。$/.test(L[L.length-1]||'')&&!!R(G).r2&&R(G).r2.st==='short',JSON.stringify({c:cr(G),r2:R(G).r2,L:L.slice(-3)}));
  ({G,L}=await run(2)); check('3. 「妳想太多了吧。」：「操。」「好，我想太多。晚安。」、+2、D2',cr(G)===2&&/操。$/.test(L[L.length-2]||'')&&/好，我想太多。晚安。$/.test(L[L.length-1]||'')&&!!R(G).r2,JSON.stringify({c:cr(G),L:L.slice(-2)}));
  ({G,L}=await run(0,{place:'wenzhou'})); check('3. 溫州街（散步）：第一句換成「你今天在溫州街？」',/你今天在溫州街？$/.test(L[1]||'')&&!L.some(t=>/在公館？/.test(t)),JSON.stringify(L.slice(0,2)));
  ({G,q}=await run(null,{h:20.5})); check('3. 出遊 21:15 才結束：結束後 30 分鐘（21:45）她打來',!!q&&Math.abs(q.h-21.75)<0.01,JSON.stringify(q&&q.h));
  ({G,q}=await run(null,{crack:0})); setT(G,q.day,q.h); H.picks=['先不接']; await OUT.prompt(GM,q); setT(G,q.day+1,12.2); PHONE.tick(G);
  const mm=msgs(G).filter(m=>m.tag==='kx_drift_r1_missed_'+q.day).map(m=>m.text);
  check('3. 沒接：+1；隔天 12:00 她傳「你昨天在公館。」「打給你也不接。」；接著 D2',q.state==='missed'&&cr(G)===1&&eq(mm,['你昨天在公館。','打給你也不接。'])&&!!R(G).r2,JSON.stringify({st:q.state,c:cr(G),mm}));
  setT(G,D('2026-10-20'),12); const iv2=await mkInv(G,'heroine_01','noodle',D('2026-10-21'),18,1); await meet(G,iv2); tick(G);
  check('3. 同一學期第二次沒說：不演、不加',outs(G,/^kx_drift_r1_/).length===1&&cr(G)===1,JSON.stringify(outs(G,/^kx_drift_r1_/).map(x=>x.id)));
  setT(G,D('2027-03-03'),12); const iv3=await mkInv(G,'heroine_01','noodle',D('2027-03-04'),18,1); await meet(G,iv3); tick(G);
  check('3. 下學期（大二下）第一次：又演',outs(G,/^kx_drift_r1_/).length===2,JSON.stringify(outs(G,/^kx_drift_r1_/).map(x=>key(x.day))));
  const G2=fresh('2026-10-07',12); H.FRIEND('heroine_01'); const iv4=INV.accept(G2,'heroine_01','library',D('2026-10-08'),14,{by:'player'}); await K.invTell(GM,iv4); await meet(G2,iv4); tick(G2);
  check('3. 總圖（有理由的）去了：不演 D1',!outs(G2,/^kx_drift_r1_/).length,''); });

/* ---------- 4 D1b ---------- */
await sec(4,async()=>{ const setup=async o=>{ o=o||{}; const G=fresh('2026-10-05',12); H.FRIEND('heroine_01'); INV.addContact(G,'heroine_01'); if(o.rom) SOCIAL.rel('heroine_01').npcRom=40;
    const a=await mkInv(G,'heroine_01','noodle',D('2026-10-06'),18,0); await meet(G,a); tick(G); const b=await mkInv(G,'heroine_01','wenzhou',D('2026-10-13'),15,0); await meet(G,b); tick(G);
    setT(G,D('2026-10-14'),9); tick(G); const k5=OUT.rec(G).find(q=>q.kxod&&q.state==='planned'); return {G,k5}; };
  let {G,k5}=await setup(); const pend=R(G).r1bPend; const L=await go(G,k5,['妳想太多了']);
  check('4. 14 天內和以安單獨出去兩次（兩次都先說了也算）：等著下一次見面',!!pend&&pend.who==='heroine_01',JSON.stringify(pend));
  check('4. 下一次和可昕見面（K5）開頭她直接問：「你最近常跟'+nm('heroine_01')+'出去耶。」「……我沒有怎樣，我只是問。」→「妳想太多了。」＝「我說了，我只是問。」「……算了。吃飯。」、+1',!!k5&&L.some(t=>t.endsWith('你最近常跟'+nm('heroine_01')+'出去耶。'))&&L.some(t=>t.endsWith('……我沒有怎樣，我只是問。'))&&L.some(t=>t.endsWith('……算了。吃飯。'))&&cr(G)===1,JSON.stringify({L:L.slice(0,7),c:cr(G)}));
  const c=await mkInv(G,'heroine_01','noodle',D('2026-10-26'),18,0); await meet(G,c); const d=await mkInv(G,'heroine_01','noodle',D('2026-10-28'),18,0); await meet(G,d); tick(G);
  check('4. 同一學期再兩次：不再問（一學期最多一次）',!R(G).r1bPend,JSON.stringify(R(G).r1bPend));
  ({G,k5}=await setup({rom:true})); const L2=await go(G,k5,[]);
  check('4. 她和祐廷曖昧中（第 5 階）：不演這段',!!k5&&!L2.some(t=>/你最近常跟/.test(t)),JSON.stringify(L2.slice(0,3))); });

/* ---------- 5 D2 ---------- */
await sec(5,async()=>{ const G=fresh('2026-10-07',20); K.rule(G); G.flags.KX_CRACK=1; K.add(G,1,'test'); const r2=JSON.parse(JSON.stringify(R(G).r2||{}));
  const send=(d,h)=>{ setT(G,d,h); MSG.rec(G).sent={}; return MSG.send(G,'kexin','chat'); };
  const s1=send(D('2026-10-08'),10); send(D('2026-10-09'),10); send(D('2026-10-09'),22); setT(G,D('2026-10-09'),23.9); PHONE.tick(G); const short=msgs(G).filter(m=>m.from==='kexin').map(m=>m.text);
  check('5. 第一次到 2：D2 開始；之後兩天玩家傳的，她只回「嗯」「在忙」「嗯」（照順序）',r2.st==='short'&&!!s1&&!!s1.short&&eq(short.slice(-3),['嗯','在忙','嗯']),JSON.stringify({r2,short}));
  const s4=send(D('2026-10-10'),12); check('5. 兩天過了：照一般的回覆',!!s4&&s4.ok&&!s4.short,JSON.stringify(s4&&{ok:s4.ok,short:s4.short}));
  walk(G,T(D('2026-10-10'),13),T(D('2026-10-10'),21.5),0.5); const ask=askOf(G,/^kx_drift_r2_ask/);
  check('5. 第三天 21:00 她傳「週六還是去山下那家嗎」（「好。」／（不回））',!!ask&&ask.text==='週六還是去山下那家嗎'&&ask.h===21&&ask.day===D('2026-10-10')&&eq(ask.ask.opts.map(o=>o.t),['好。','（不回）']),JSON.stringify(ask&&{t:ask.text,d:key(ask.day),h:ask.h}));
  PHONE.answer(G,ask.ask.id,0); tick(G); const q=OUT.get(G,'kx_drift_r2_1');
  check('5. 「好。」：週六 18:30 木柵大學・山下的小吃街（出遊）',!!q&&wdOf(q.day)===6&&q.h===18.5&&q.place==='木柵大學・山下的小吃街',JSON.stringify(q&&{d:key(q.day),h:q.h,p:q.place}));
  const c0=cr(G); const L=await go(G,q,['都過兩天了耶']);
  check('5. 週六：（她點了兩碗酸辣湯餃……）（回去的路上……）「上次那個，我還有一點氣。」→「都過兩天了耶。」＝「兩天不夠。」（她把手放進自己的口袋。）、+1（準時到 −1 也照算）',L[0]==='（她點了兩碗酸辣湯餃。吃飯的時候，她幾乎沒說話。）'&&L[1]==='（回去的路上，走到第二個路口，她才開口。）'&&/上次那個，我還有一點氣。$/.test(L[2]||'')&&L.some(t=>t.endsWith('兩天不夠。'))&&L[L.length-1]==='（她把手放進自己的口袋。）'&&cr(G)===c0,JSON.stringify({L,c0,c:cr(G),log:R(G).log}));
  const G2=fresh('2026-10-07',20); K.rule(G2); G2.flags.KX_CRACK=1; K.add(G2,1,'test'); walk(G2,T(D('2026-10-08'),0),T(D('2026-10-11'),21.5),0.5);
  check('5. 到隔天 21:00 沒回：+1，那個週六沒有',cr(G2)===3&&!OUT.get(G2,'kx_drift_r2_1')&&R(G2).r2.st==='noreply',JSON.stringify({c:cr(G2),r2:R(G2).r2}));
  const G3=fresh('2027-01-05',20); K.rule(G3); G3.flags.KX_CRACK=1; K.add(G3,1,'test'); walk(G3,T(D('2027-01-06'),12),T(D('2027-02-22'),12),12); setT(G3,D('2027-02-22'),21.1); tick(G3);
  const a3=askOf(G3,/^kx_drift_r2_ask/);
  check('5. 寒假中到了 2：等她回臺北——開學那天 21:00 才問，見面是開學後的第一個週六',!!a3&&a3.day===D('2027-02-22')&&R(G3).r2.sat===D('2027-02-27'),JSON.stringify({a:a3&&key(a3.day),sat:R(G3).r2&&R(G3).r2.sat&&key(R(G3).r2.sat)})); });

/* ---------- 6 D3 ---------- */
await sec(6,async()=>{ const G=fresh('2026-11-02',10); K.rule(G); K.rec(G).th[2]=1; G.flags.KX_CRACK=3; K.add(G,1,'test'); K.rule(G);
  check('6. 大二上第一次到 4：先不演（大二下起）',!!R(G).r3&&R(G).r3.st==='pending'&&!OUT.get(G,'kx_drift_r3'),JSON.stringify(R(G).r3));
  setT(G,D('2027-02-24'),10); K.rule(G); const q=OUT.get(G,'kx_drift_r3');
  check('6. 大二下：那週的平日 22:00 她打視訊（接起來／今天先不要）',!!q&&q.day===D('2027-02-24')&&q.h===22&&q.verb==='接起來'&&q.no==='今天先不要'&&q.place==='視訊',JSON.stringify(q&&{d:key(q.day),h:q.h}));
  G.msgs.push({day:G.day-30,h:20,th:'p:yule',from:'yule',name:'予樂',text:'（舊訊息）'});   /* 予樂私訊過＝有她的聯絡方式 */
  const c0=cr(G); const L=await go(G,q,['好，早點睡']); setT(G,q.day,23.05); PHONE.tick(G); const yl=msgs(G,'p:yule').map(m=>m.text);
  check('6. 沒見過邵鈞：「邵鈞」換成「我們讀書會一個人」；「好，早點睡。」＝（畫面黑掉。）、+1；23:00 予樂「你們最近還好嗎」',(L[0]||'').endsWith('今天讀書會吵到九點。我們讀書會一個人跟予樂為了一題，一個說要先講結論，一個說……')&&L[L.length-1]==='（畫面黑掉。）'&&cr(G)===c0+1&&yl[yl.length-1]==='你們最近還好嗎',JSON.stringify({L,c0,c:cr(G),yl}));
  const G2=fresh('2027-03-01',10); SOCIAL.remember('kexin','ENC_D13_KX',''); K.rule(G2); K.rec(G2).th[2]=1; G2.flags.KX_CRACK=3; K.add(G2,1,'test'); K.rule(G2); const q2=OUT.get(G2,'kx_drift_r3'); const L2=await go(G2,q2,['我在聽']); setT(G2,q2?q2.day:G2.day,23.05); PHONE.tick(G2);
  check('6. 見過邵鈞（ENC_D13_KX）：原句；「我在聽，妳說。」＝（她講完了。後面那一段講得很快。）「……好，晚安。」、+0；沒有予樂的聯絡方式＝沒有那一則',!!q2&&(L2[0]||'').endsWith(K.L.r3.first)&&L2[L2.length-2]==='（她講完了。後面那一段講得很快。）'&&(L2[L2.length-1]||'').endsWith('……好，晚安。')&&cr(G2)===4&&!msgs(G2,'p:yule').length,JSON.stringify({L2,c:cr(G2)})); });

/* ---------- 7 D4 ---------- */
await sec(7,async()=>{ const mk=()=>{ const G=fresh('2026-10-26',10); K.rule(G); K.rec(G).th[2]=1; G.flags.KX_CRACK=5; K.add(G,1,'test'); K.rule(G); setT(G,G.day,21.1); PHONE.tick(G); return G; };   /* 10/26（一）*/
  let G=mk(); const a1=askOf(G,'kx_drift_r4_ask');
  check('7. 第一次到 6：那天 21:00 她傳「週五晚上，山下那家。有事要講。」（「好。」／「那天不行。」）',!!a1&&a1.text==='週五晚上，山下那家。有事要講。'&&a1.day===D('2026-10-26')&&Math.abs(a1.h-21)<0.25&&eq(a1.ask.opts.map(o=>o.t),['好。','那天不行。']),JSON.stringify(a1&&a1.text));
  PHONE.answer(G,'kx_drift_r4_ask',1); tick(G); const a2=askOf(G,'kx_drift_r4_ask2'); PHONE.answer(G,'kx_drift_r4_ask2',1); tick(G); const tail=msgs(G).slice(-1).map(m=>m.text);
  check('7. 「那天不行。」＝「那週六。」（「好。」／「那天不行。」）；再不行＝她「好。」，直接等 D5（沒有 D4 的見面）',!!a2&&a2.text==='那週六。'&&eq(a2.ask.opts.map(o=>o.t),['好。','那天不行。'])&&eq(tail,['好。'])&&R(G).r4Pick==='decline'&&!!R(G).r5&&R(G).r5.st==='pending'&&!OUT.get(G,'kx_drift_r4'),JSON.stringify({tail,p:R(G).r4Pick,r5:R(G).r5}));
  G=mk(); PHONE.answer(G,'kx_drift_r4_ask',1); tick(G); PHONE.answer(G,'kx_drift_r4_ask2',0); tick(G); let q=OUT.get(G,'kx_drift_r4');
  check('7. 「那週六。」→「好。」：那個週六 19:00 木柵大學山下',!!q&&wdOf(q.day)===6&&q.h===19&&q.day===D('2026-10-31'),JSON.stringify(q&&{d:key(q.day),h:q.h}));
  G=mk(); PHONE.answer(G,'kx_drift_r4_ask',0); tick(G); q=OUT.get(G,'kx_drift_r4');
  check('7. 「好。」：那個週五 19:00 木柵大學・山下的小吃街',!!q&&q.day===D('2026-10-30')&&q.h===19&&q.place==='木柵大學・山下的小吃街',JSON.stringify(q&&{d:key(q.day),h:q.h}));
  let L=await go(G,q,['我會改']);
  check('7. 四句 →「我會改。先講、準時、妳生氣我當天就打給妳。」＝「你講的喔。」（她把你碗裡的湯餃夾走一顆。）→ 歸零、修補期 35 天',L.length>=6&&L.slice(0,4).every((t,i)=>t.endsWith(K.L.r4.lines[i]))&&L[L.length-1]==='（她把你碗裡的湯餃夾走一顆。）'&&cr(G)===0&&R(G).repairEnd===q.day+35&&R(G).r4Pick===0,JSON.stringify({L,c:cr(G),re:R(G).repairEnd}));
  G=mk(); PHONE.answer(G,'kx_drift_r4_ask',0); tick(G); q=OUT.get(G,'kx_drift_r4'); L=await go(G,q,['我們都太忙了']);
  check('7. 「我們都太忙了。」＝「對。……那怎麼辦？」（你答不出來。）「……先吃吧。湯餃要冷了。」：修補期、數字不歸零',cr(G)===6&&R(G).repairEnd===q.day+35&&L.some(t=>t.endsWith('對。……那怎麼辦？'))&&L.some(t=>t.endsWith('……先吃吧。湯餃要冷了。')),JSON.stringify({c:cr(G),L:L.slice(-3)}));
  G=mk(); PHONE.answer(G,'kx_drift_r4_ask',0); tick(G); q=OUT.get(G,'kx_drift_r4'); L=await go(G,q,['是妳太容易生氣']);
  check('7. 「是妳太容易生氣。」＝「……好。」（她付完錢就走了。）→ 不修補，等 D5',R(G).repairEnd==null&&!!R(G).r5&&R(G).r5.st==='pending'&&L[L.length-1]==='（她付完錢就走了。）'&&R(G).r4Pick===2,JSON.stringify({r5:R(G).r5}));
  G=mk(); PHONE.answer(G,'kx_drift_r4_ask',0); tick(G); q=OUT.get(G,'kx_drift_r4'); setT(G,q.day,q.h+0.8); tick(G);
  check('7. 沒到：她傳「好。」，等 D5（+0）',q.state==='missed'&&msgs(G).slice(-1)[0].text==='好。'&&!!R(G).r5&&R(G).r5.st==='pending'&&cr(G)===6&&R(G).r4Pick==='noshow',JSON.stringify({st:q.state,c:cr(G),p:R(G).r4Pick})); });

/* ---------- 8 修補期 ---------- */
await sec(8,async()=>{ const mk=async pick=>{ const G=fresh('2026-10-26',10); K.rule(G); K.rec(G).th[2]=1; G.flags.KX_CRACK=5; K.add(G,1,'test'); K.rule(G); setT(G,G.day,21.1); PHONE.tick(G); PHONE.answer(G,'kx_drift_r4_ask',0); tick(G); const q=OUT.get(G,'kx_drift_r4'); await go(G,q,[pick]); return {G,q}; };
  let {G,q}=await mk('我會改'); const end=q.day+35; let said=[];
  for(let d=q.day+1;d<=end+14;d++){ setT(G,d,9); tick(G); for(const k of OUT.rec(G).filter(x=>x.kxod&&x.state==='planned'&&x.day===d)) said=said.concat(await go(G,k,[])); setT(G,d,22); tick(G); }   /* 修補期間每一次「我們的日子」都準時到 */
  check('8. 修補期 35 天、結束那天 <6：不分手（KX_REPAIRED），沒有 D5',G.flags.KX_REPAIRED===true&&R(G).repairDone===end&&!R(G).r5,JSON.stringify({rep:G.flags.KX_REPAIRED,done:R(G).repairDone&&key(R(G).repairDone),end:key(end),c:cr(G)}));
  check('8. 下一次「我們的日子」見面，她說一次「這個月你都有先講。」（只說一次）',said.filter(t=>t.endsWith('這個月你都有先講。')).length===1,JSON.stringify(said.filter(t=>/先講/.test(t))));
  G.flags.KX_CRACK=5; K.add(G,1,'test');
  check('8. 修補成功以後又到 6：直接 D5（不再演 D4）',!!R(G).r5&&R(G).r5.st==='pending'&&R(G).r4.st==='done'&&!PHONE.sent(G,'kx_drift_r4_ask_2'),JSON.stringify({r5:R(G).r5,r4:R(G).r4}));
  ({G,q}=await mk('我們都太忙了')); walk(G,T(q.day+1,0),T(q.day+35,12),12);
  check('8. 「我們都太忙了。」（不歸零）修補期結束那天還在 6 以上：D5',!G.flags.KX_REPAIRED&&!!R(G).r5&&R(G).r5.st==='pending'&&cr(G)>=6,JSON.stringify({c:cr(G),r5:R(G).r5})); });

/* ---------- 9 D5 ---------- */
await sec(9,async()=>{ const mk=()=>{ const G=fresh('2026-11-30',10); K.rule(G); const r=K.rec(G); Object.assign(r.th,{2:1,4:1,6:1}); r.r4={st:'done'}; r.r4Pick=2; r.r5={st:'pending',at:T(G.day,10)}; G.flags.KX_CRACK=6; return G; };
  let G=mk(); const ex=K.examDay(G,'Y2S1'); walk(G,T(G.day,11),T(ex,20),6);
  check('9. 學期中（第 13～16 週）不演：期末考最後一天 21:00 以前沒有她的那一則',ex>=CALENDAR.termDays('Y2S1').to-6&&!PHONE.sent(G,'kx_drift_r5_msg_Y2S1')&&!OUT.get(G,'kx_drift_r5'),key(ex));
  setT(G,ex,21.05); tick(G); const m=msgs(G).find(x=>x.tag==='kx_drift_r5_msg_Y2S1'), q=OUT.get(G,'kx_drift_r5');
  check('9. 期末考最後一天（祐廷的最後一科）21:00：「明天晚上七點，我宿舍樓下。」；隔天 19:00 木柵大學・宿舍樓下（她回高雄以前）',!!m&&m.text==='明天晚上七點，我宿舍樓下。'&&m.day===ex&&Math.abs(m.h-21)<0.25&&!!q&&q.day===ex+1&&q.h===19&&q.place==='木柵大學・宿舍樓下'&&!!CALENDAR.termOf(q.day),JSON.stringify({m:m&&m.text,q:q&&{d:key(q.day),h:q.h}}));
  const hv='hv_kexin_'+(ex+10); OUT.plan(G,{id:hv,ev:'ev_hv_kx',day:ex+10,h:10.5,place:'高雄',title:'去高雄找可昕',hv:{id:'kexin'}});   /* 先排一個她的出遊（寒假去高雄找她）*/
  PHONE.at(G,ex+5,21,[{th:'p:kexin',from:'kexin',text:'測試：她那一段排著的'}],'t_kx_private'); PHONE.at(G,ex+5,21,[{th:'g:econ_friends',from:'kexin',text:'測試：群組裡她的'},{th:'g:econ_friends',from:'econ_pinyu',text:'測試：群組裡別人的'}],'t_kx_group');   /* 排在手機裡還沒送的 */
  const L=await go(G,q,['再試一次']);
  check('9. 四句 →「再試一次？」＝「我們試過了。」「……試了一整個學期。」→「我先上去了。」「到家傳一下。這個我還是想知道。」',L.length>=8&&L.slice(0,4).every((t,i)=>t.endsWith(K.L.r5.talk[i]))&&L.some(t=>t.endsWith('……試了一整個學期。'))&&(L[L.length-2]||'').endsWith('我先上去了。')&&(L[L.length-1]||'').endsWith('到家傳一下。這個我還是想知道。'),JSON.stringify(L));
  const H2=ROM.rec(G).find(h=>h.id==='kexin');
  check('9. 記：ROM.end drift（dating_kexin false、EX_kexin、交往紀錄 how drift）、KX_ENDED＝drift、KX_ENDED_ON＝那一天',G.flags.KX_ENDED==='drift'&&G.flags.KX_ENDED_ON===ex+1&&G.flags.dating_kexin===false&&G.flags.EX_kexin===true&&!!H2&&H2.how==='drift',JSON.stringify({e:G.flags.KX_ENDED,on:G.flags.KX_ENDED_ON,h:H2}));
  check('9. 她已經排好的出遊（寒假去高雄找她）取消',OUT.get(G,hv).state==='skipped',OUT.get(G,hv).state);
  const Q=PHONE.rec(G).q, qp=Q.find(x=>x.tag==='t_kx_private'), qg=Q.find(x=>x.tag==='t_kx_group');
  check('9. 手機裡排著、還沒送的：她那一段（p:kexin）的拿掉；群組裡的（她的和別人的）照送',!qp&&!!qg&&qg.items.length===2,JSON.stringify({private:!!qp,group:qg&&qg.items.length}));
  let opened=null; const pt=GM.phoneThread; GM.phoneThread=async th=>{ opened=th; }; const tk=K.tick(GM); await new Promise(r=>setTimeout(r,5)); GM.phoneThread=pt;
  const home=msgs(G).slice(-2).map(x=>(x.from==='player'?'我：':'')+x.text);
  check('9. 到家以後：手機自動打開她那一段，祐廷傳「到了。」、她回「嗯。」',tk===true&&opened==='p:kexin'&&eq(home,['我：到了。','嗯。']),JSON.stringify({tk,opened,home}));
  G=mk(); walk(G,T(ex,21),T(ex+1,20.6),0.5); const qc=OUT.get(G,'kx_drift_r5_call');
  check('9. 沒到（20:00 還沒來）：21:00 她打來',OUT.get(G,'kx_drift_r5').state==='missed'&&!!qc&&qc.h===21&&qc.call===true&&G.flags.dating_kexin===true,JSON.stringify(qc&&{h:qc.h}));
  const Lc=await go(G,qc,['……好']);
  check('9. 電話：「我在樓下等了一個小時。」「……那我在電話裡講。」＋四句＋「……好。」＝「嗯。」（她點頭，很久沒說話。）→「我要上去了。」「……晚安。」；記分開',(Lc[0]||'').endsWith('我在樓下等了一個小時。')&&(Lc[1]||'').endsWith('……那我在電話裡講。')&&Lc.slice(2,6).every((t,i)=>t.endsWith(K.L.r5.talk[i]))&&Lc.includes('（她點頭，很久沒說話。）')&&(Lc[Lc.length-2]||'').endsWith('我要上去了。')&&(Lc[Lc.length-1]||'').endsWith('……晚安。')&&G.flags.KX_ENDED==='drift',JSON.stringify(Lc));
  G=mk(); walk(G,T(ex,21),T(ex+1,21.6),0.25); walk(G,T(ex+2,11),T(ex+2,12.5),0.5); const tx=msgs(G).filter(x=>x.tag==='kx_drift_r5_text').map(x=>x.text);
  check('9. 電話也沒接：隔天 12:00「昨天的事，我寫在這裡。」＋四句（文字）；記分開（那一天）',eq(tx,['昨天的事，我寫在這裡。'].concat(K.L.r5.talk))&&G.flags.KX_ENDED==='drift'&&G.flags.KX_ENDED_ON===ex+2,JSON.stringify({tx,on:G.flags.KX_ENDED_ON}));
  G=mk(); setT(G,D('2026-12-10'),21); tick(G); check('9. 學期中（第 14 週）就算 D5 成立也不演',!OUT.get(G,'kx_drift_r5'),''); });

/* ---------- 10 分開以後 ---------- */
await sec(10,async()=>{ const G=fresh('2026-12-25',20); K.rule(G); K.end(G,'meet');
  check('10. 不能復合：ROM.canStart(G,"kexin") false、ROM.start 也不行',ROM.canStart(G,'kexin')===false&&ROM.start(G,'kexin')===false&&G.flags.dating_kexin===false,'');
  const w=TERMEND.windowOf('Y2S2'); setT(G,w.from,12); const P=TERMEND.plan(G,w);
  check('10. 學期末：心意邀約沒有可昕、可昕的學期末約會不排（plan.kx false）',!P.heart.includes('kexin')&&P.kx===false&&TERMEND.heartWhy(G,'kexin',w)===false,JSON.stringify({heart:P.heart,kx:P.kx}));
  setT(G,D('2027-03-01'),10); KXOD.rule(G); check('10. 「我們的日子」（K5）不再排',!OUT.rec(G).some(q=>q.kxod&&q.state==='planned'),'');
  check('10. 尾聲：可昕不用前任那一版（PG.exLines kexin＝null）；別人照舊',PG.exLines(G,'kexin',false)===null&&Array.isArray(PG.exLines(G,'heroine_02',false)),'');
  const G2=fresh('2026-12-25',20); ROM.end(G2,'kexin','apart_talk'); check('10. 對照：一般的分手（apart_talk）：尾聲照前任那一版',Array.isArray(PG.exLines(G2,'kexin',false)),''); });

/* ---------- 11 D6 ---------- */
await sec(11,async()=>{ const G=fresh('2026-12-25',20); K.rule(G); K.end(G,'meet'); const E=G.flags.KX_ENDED_ON;
  const send=(d,h)=>{ setT(G,d,h); MSG.rec(G).sent={}; return MSG.send(G,'kexin','chat'); };
  setT(G,E+5,22); const o=MSG.open(G,'kexin'), tp=MSG.topics(G,'kexin').map(q=>q.k); const s1=send(E+5,20); send(E+6,20); send(E+7,20); setT(G,E+7,23.9); PHONE.tick(G);
  const sh=msgs(G).filter(m=>m.from==='kexin').map(m=>m.text);
  check('11. 分開以後手機照樣傳得到她（沒有晚安）；前 60 天她回得很短「嗯」「最近很忙」「嗯」',!!o&&o.ok&&!tp.includes('night')&&!!s1&&!!s1.short&&eq(sh.slice(-3),['嗯','最近很忙','嗯']),JSON.stringify({o,tp,sh}));
  walk(G,T(E+8,12),T(E+60,22),12); const before=msgs(G).filter(m=>m.from==='kexin'&&!/^(嗯|最近很忙)$/.test(m.text)).length;
  walk(G,T(E+61,12),T(E+61,21.5),0.5); const six=msgs(G).filter(m=>m.from==='kexin').slice(-3);
  check('11. 前 60 天她不傳；第 61 天 21:00（沒有生日、放榜）＝她自己的好消息（還沒到實習的年份）＋「週六中午，公館。吃個飯。」（「好。」／「那天不行。」）',before===0&&six.length===3&&six[0].text==='欸。'&&six[1].text==='我們讀書會的考古題終於做完了。……想說跟你講一下。'&&six[2].text==='週六中午，公館。吃個飯。'&&!!six[2].ask&&eq(six[2].ask.opts.map(x=>x.t),['好。','那天不行。'])&&six[0].day===E+61&&six[0].h===21,JSON.stringify(six.map(m=>m.text+'@'+key(m.day)+' '+m.h)));
  PHONE.answer(G,six[2].ask.id,1); tick(G); const sat1=R(G).r6&&R(G).r6.sat; const got=until(G,g=>!!askOf(g,'kx_drift_r6_ask2'),24*12,3); const a2=askOf(G,'kx_drift_r6_ask2');
  check('11. 「那天不行。」：下一個週六再約一次（同一句）',got&&!!a2&&a2.text==='週六中午，公館。吃個飯。'&&R(G).r6.sat===sat1&&wdOf(sat1)===6,JSON.stringify(R(G).r6));
  PHONE.answer(G,'kx_drift_r6_ask2',0); tick(G); const ql=OUT.rec(G).find(q=>/^kx_drift_r6_/.test(q.id));
  check('11. 「好。」：週六 12:30 公館',!!ql&&wdOf(ql.day)===6&&ql.h===12.5&&ql.place==='公館',JSON.stringify(ql&&{d:key(ql.day),h:ql.h}));
  const L=await go(G,ql,[]);
  check('11. 午餐：（你到的時候，她已經坐好了。）「你遲到了。」（她看了一下手機。）「……三分鐘。算了。」「先點餐。這頓我請。」；之後照朋友（不再只回短的）',eq(L.map(t=>t.replace(/^[^（：]+：/,'')),K.L.r6.lines)&&R(G).r6.st==='friend'&&!K.shortNow(G),JSON.stringify(L));
  const G2=fresh('2026-12-25',20); K.rule(G2); K.end(G2,'meet'); const E2=G2.flags.KX_ENDED_ON; walk(G2,T(E2+61,20),T(E2+61,21.5),0.5); const m1=askOf(G2,'kx_drift_r6_ask1'); PHONE.answer(G2,m1.ask.id,1); tick(G2);
  until(G2,g=>!!askOf(g,'kx_drift_r6_ask2'),24*12,3); PHONE.answer(G2,'kx_drift_r6_ask2',1); tick(G2);
  check('11. 再不行就不約、照朋友',R(G2).r6.st==='friend'&&!OUT.rec(G2).some(q=>/^kx_drift_r6_/.test(q.id)),JSON.stringify(R(G2).r6));
  const G3=fresh('2028-12-22',20); K.rule(G3); K.end(G3,'meet'); const E3=G3.flags.KX_ENDED_ON; walk(G3,T(E3+61,20),T(E3+61,21.5),0.5);
  check('11. 她的實習上了以後（2028-11-23 起）：「欸。」「我實習上了。……想說跟你講一下。」',msgs(G3).some(m=>m.text==='我實習上了。……想說跟你講一下。'),JSON.stringify(msgs(G3).slice(-3).map(m=>m.text))); });

/* ---------- 12 範圍 ---------- */
await sec(12,async()=>{
  { const G=fresh('2026-03-04',12); H.FRIEND('heroine_01'); INV.addContact(G,'heroine_01'); const iv=await mkInv(G,'heroine_01','noodle',D('2026-03-05'),18,1); await meet(G,iv); tick(G);
    check('12. 大一下：沒有選單、沒有 D1（大二上起）',!H.opts.length&&!outs(G,/^kx_drift/).length,JSON.stringify(H.opts)); }
  { const G=fresh('2026-10-05',12); K.rule(G); G.flags.dating_heroine_02=true; ROM.rec(G); G.flags.KX_CRACK=1; H.FRIEND('heroine_01'); INV.addContact(G,'heroine_01');
    const iv=await mkInv(G,'heroine_01','noodle',D('2026-10-06'),18,1); await meet(G,iv); walk(G,T(D('2026-10-07'),12),T(D('2026-11-20'),12),12);
    check('12. 中途開始了另一段（芷若）：停住——沒有選單、沒有 D1、21 天不算、數字凍結',!H.opts.length&&!outs(G,/^kx_drift/).length&&cr(G)===1,JSON.stringify({c:cr(G),log:R(G).log}));
    G.flags.dating_heroine_02=false; walk(G,T(D('2026-11-21'),0),T(D('2026-11-30'),0),12);
    check('12. 那一段結束、又只和她一位：從那天接著算（凍結的那幾天不算）',cr(G)===1&&(R(G).gapN|0)<=10,JSON.stringify({c:cr(G),g:R(G).gapN})); }
  { const G=fresh('2028-09-10',12,{EXCHANGE_ROUTE:'US'}); K.rule(G); const r=K.rec(G); r.th[2]=1; r.th[4]=1; G.flags.KX_CRACK=5; K.add(G,1,'test'); walk(G,T(G.day,13),T(D('2028-10-20'),12),12);
    check('12. 美國路線大四上（人在美國）：到 6 也不演 D4（不傳）、21 天不算',!PHONE.sent(G,'kx_drift_r4_ask')&&!!R(G).r4&&R(G).r4.st==='pending'&&cr(G)===6,JSON.stringify({c:cr(G),r4:R(G).r4}));
    r.r3={st:'pending'}; K.rule(G); const q=OUT.get(G,'kx_drift_r3'), lt=q?STORY.tzOffset(G,q.day):null;
    check('12. 交換那一學期 D3 照演：臺灣 22:00＝當地時間（印第安納 −12／−13）',!!q&&Math.abs((((q.h-(22+lt))%24)+24)%24)<0.01&&lt<0,JSON.stringify(q&&{d:key(q.day),h:q.h,tz:lt}));
    setT(G,D('2029-02-20'),10); tick(G); setT(G,D('2029-05-30'),21.5); tick(G);
    check('12. 大四下：D4 不演（數字照記、不分手）',!PHONE.sent(G,'kx_drift_r4_ask')&&G.flags.dating_kexin===true,''); }
  { const G=fresh('2026-12-29',12); K.rule(G); const r=K.rec(G); r.th[2]=1; r.th[4]=1; G.flags.KX_CRACK=5; K.add(G,1,'test'); walk(G,T(G.day,13),T(D('2027-02-21'),12),12);
    check('12. 寒假（她在高雄）：到 6 也不演 D4、21 天不算（整個寒假沒見面）',!PHONE.sent(G,'kx_drift_r4_ask')&&cr(G)===6,JSON.stringify({c:cr(G)}));
    setT(G,D('2027-02-22'),9); tick(G); check('12. 開學那天：D4 那一則照常（當天 21:00）',PHONE.sent(G,'kx_drift_r4_ask'),''); }
  { const G=fresh('2028-02-23',12,{EXCHANGE_ROUTE:'JP'}); H.FRIEND('heroine_02'); INV.addContact(G,'heroine_02'); tick(G); const iv=await mkInv(G,'heroine_02','noodle',D('2028-02-24'),18,1); await meet(G,iv); tick(G);
    check('12. 日本路線大三下（出發以前也算交換那一學期）：沒說的出遊不演 D1',!outs(G,/^kx_drift_r1_/).length,JSON.stringify(R(G).outs)); } });

/* ---------- 13 數字 ---------- */
await sec(13,async()=>{ const G=fresh('2026-10-19',9); K.rule(G); K.rec(G).th[2]=1; G.flags.KX_CRACK=3;
  const meetOut=(id,d,h)=>OUT.plan(G,{id,ev:'ev_kexin_our_day_wk',day:d,h,place:'公館',odPlace:'gongguan',title:'和可昕',travel:'騎車約 10 分鐘',travelH:1/6});
  meetOut('kx_t1',D('2026-10-20'),19); await go(G,OUT.get(G,'kx_t1'),[]); const a=cr(G);
  meetOut('kx_t2',D('2026-10-21'),19); await go(G,OUT.get(G,'kx_t2'),[]); const b=cr(G);
  setT(G,D('2026-10-24'),14); const c0=PGDATE.kxArrive(G,{day:G.day,h:14,kxod:'Y2S1'}); const c=cr(G);
  setT(G,D('2026-10-27'),14); const d0=PGDATE.kxArrive(G,{day:G.day,h:14,kxod:'Y2S1'}); const d=cr(G);
  meetOut('kx_t3',D('2026-10-28'),19); setT(G,D('2026-10-28'),19.6); H.said=[]; H.picks=[]; await OUT.go(GM,OUT.get(G,'kx_t3')); const e=cr(G);
  check('13. 和她約好的出遊準時到 −1，一週最多一次（3→2，同一週第二次不減）；K5（PGDATE.kxArrive）也在同一個上限（那週不減、下一週 −1）；遲到超過 15 分鐘 +1',a===2&&b===2&&c0===0&&c===2&&d0===-1&&d===1&&e===2,JSON.stringify({a,b,c0,c,d0,d,e}));
  const G5=fresh('2029-09-03',9); G5.flags.KX_CRACK=3; setT(G5,D('2029-09-04'),14); const p1=PGDATE.kxArrive(G5,{day:G5.day,h:14}); setT(G5,D('2029-09-06'),14); const p2=PGDATE.kxArrive(G5,{day:G5.day,h:14});
  check('13. 畢業以後（2029-09）的格子照 PGDATE 原本那一套：同一週準時兩次都 −1（一週一次的上限只管大二上～大四下）、也不建 KX_DRIFT',has&&p1===-1&&p2===-1&&cr(G5)===1&&!G5.flags.KX_DRIFT,JSON.stringify({p1,p2,c:cr(G5),rec:!!G5.flags.KX_DRIFT}));
  const G2=fresh('2026-10-19',9); K.rule(G2); K.rec(G2).th[2]=1; G2.flags.KX_CRACK=2;
  await K.dateTell(GM,{ok:true,trip:'T0001',who:'kexin',locs:['D13'],day:D('2026-10-24')}); const i1=cr(G2); await K.dateTell(GM,{ok:true,trip:'T0002',who:'kexin',locs:['D13'],day:D('2026-10-25')}); const i2=cr(G2);
  setT(G2,D('2026-10-26'),9); await K.hvTell(GM,'kexin',D('2026-10-30')); const i3=cr(G2);
  check('13. 祐廷主動約她（約她去校外、去高雄找她）、她答應：−1，一週最多一次',i1===1&&i2===1&&i3===0,JSON.stringify({i1,i2,i3}));
  const G3=fresh('2026-10-05',9,{KX_OUR_DAY:null}); K.rule(G3); K.rec(G3).th[2]=1; walk(G3,T(D('2026-10-05'),9),T(D('2026-10-27'),9),24); const g1=cr(G3);
  walk(G3,T(D('2026-10-28'),9),T(D('2026-11-20'),9),24); const g2=cr(G3);
  OUT.plan(G3,{id:'kx_t4',ev:'ev_kexin_our_day_wk',day:D('2026-11-21'),h:14,place:'公館',odPlace:'gongguan',title:'和可昕',travel:'',travelH:1/6}); await go(G3,OUT.get(G3,'kx_t4'),[]); const g3=cr(G3);
  walk(G3,T(D('2026-11-22'),9),T(D('2026-12-13'),9),24); const g4=cr(G3);
  check('13. 連續 21 天沒見面、也沒視訊：+1；同一段只算一次；見了面（準時 −1）重新算，再 21 天又 +1',g1===1&&g2===1&&g3===0&&g4===1,JSON.stringify({g1,g2,g3,g4,log:R(G3).log}));
  const G4=fresh('2026-10-19',9); K.rule(G4); K.rec(G4).th[2]=1; G4.flags.KX_CRACK=2; G4.trips=[{trip:'T0003',who:'kexin',locs:['D13'],day:D('2026-10-24'),depart:10,back:18,status:'cancelled'}]; setT(G4,D('2026-10-24'),12); tick(G4);
  check('13. 和她的校外約會沒去（今天不去了）：+1',cr(G4)===3,JSON.stringify(R(G4).log)); });

/* ---------- 14 舊存檔、掛勾 ---------- */
await sec(14,async()=>{ const G=H.fresh('2027-10-04',12,'dorm',{dating_kexin:true,EXCHANGE_ROUTE:'TW'}); delete G.flags.KX_CRACK; delete G.flags.KX_DRIFT; ROM.rec(G); tick(G);
  check('14. 舊存檔（大三上才讀進來，沒有 KX_DRIFT、KX_CRACK）：KX_CRACK＝0、KX_DRIFT.from＝讀檔那天',G.flags.KX_CRACK===0&&!!G.flags.KX_DRIFT&&G.flags.KX_DRIFT.from===G.day,JSON.stringify(G.flags.KX_DRIFT&&{from:G.flags.KX_DRIFT.from,day:G.day}));
  walk(G,T(G.day,13),T(G.day+20,12),24);
  check('14. 從讀檔那天開始算（之前的日子不補；20 天還沒到 21）',cr(G)===0,JSON.stringify({c:cr(G),g:R(G).gapN}));
  check('14. 掛勾都在（包住 INV.flow／startTogether、DATE.menu、HV.ask、OUT.onMissed、PGDATE.kxArrive、ROM.canStart、TERMEND.plan、PG.exLines、MSG、KXOD.herWeek；STORY.PHONE_RULES、STORY.TICKS）',!!(INV._kxd&&DATE._kxd&&HV._kxd&&OUT._kxd&&PGDATE._kxd&&ROM._kxd&&TERMEND._kxd&&PG._kxd&&MSG._kxd&&KXOD._kxd)&&STORY.PHONE_RULES.some(f=>/S\.rule\(G\)/.test(String(f)))&&STORY.TICKS.some(f=>/S\.tick\(GM\)/.test(String(f))),'');
  const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8'), at=s=>html.indexOf(s);
  check('14. index.html：kxdrift3d.js 在 kxod3d.js（以及 msg3d、hometown3d、termend3d、postgrad3d、pgdates3d）後面',at('src/kxdrift3d.js')>at('src/kxod3d.js')&&at('src/kxod3d.js')>at('src/pgdates3d.js')&&at('src/kxdrift3d.js')>at('src/postgrad3d.js')&&at('src/kxdrift3d.js')>at('src/msg3d.js')&&at('src/kxod3d.js')>0,''); });

H.done();
})();
