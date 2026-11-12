// 公館三間＋汀州路三間店的店內互動與台詞（GG-SHOPS3-STORY-1110／GG-SHOPS3-SYS-1110；AA_742、AA_813，企劃線 75f5de658）——不需要瀏覽器（D131）。
//   1  資料檔 src/data/gg3_shops_lines.js 每一句都原封不動在 AA_742 或 AA_813 那一版裡；匯入工具 --check 一致；AA_813 不接的句子不在；換說話的人（鮮果老闆、印得好店員）
//   2  營業時間（places.js；AA_742 開頭的表）、颱風天六間都關
//   3  關門時按店門：門口那一句（打烊以後／公休／洗樂颱風）＋開放時間；開門以前只寫開放時間；開著＝不擋
//   4  進門：一天第一次一句（六間）、同一天再進來不說、今天約在這裡不說
//   5  打烊：那一刻＝那間店自己的那一句（說話的人照稿）、走到店門外；泰米 14:00 不請人出去（午休 11-12 取消）；讀檔回到打烊以後＝不說、寫開放時間；洗樂只有颱風假請你出去
//   6  安泰藥局：藥師照情況挑一句（一天一次）、看貨架買東西（暖暖包 11～2 月）、錢不夠、量血壓
//   7  汀州鮮果：情境（20:00 以後香蕉 30、期末考週、17～20 點老闆「切好的在冰箱。」）、要什麼、切好 +5 分鐘、5 結尾算整數、錢不夠、水果禮盒
//   8  榮恩典文具社：情境（第 1～2 週、考前一週、十二月）、三類選單、試寫筆／筆記本那一句只在買那樣、錢不夠（不賒帳）、卡片包裝（好＝+10 分鐘）、特價推車
//   9  洗樂洗衣坊：只洗／洗＋烘、在這裡等（坐塑膠椅、等的時候一句、時間過）、先去別的地方（走出去，回來好了一句）、一天一次、換零錢、洗衣精／柔軟精
//   10 印得好：選單（裝訂只在期末考週和前一週、履歷／備審大四起）、點完一句（十分鐘那句只在十分鐘的）、裝訂、備審兩句、錢不夠
//   11 泰米村食：點餐（主餐＋湯＋飲料、打拋午間 95、辣度、正常多一句）、點完一句照點的、吃 30 分鐘、吃的旁白照點的、吃過的登記、錢不夠（不是中午才說那一句）、坐下兩人桌／四人桌
//   12 看：配置每一個互動點的 kind 都接上（AA_813 對照表＋第 2 節），按了就是那一句
//   13 約去泰米村食：吃飯那一類、午餐 11:30～13:30、晚餐 17:30～20:00、週一不排；七位答應句＋一般那句；坐下以後的開場句
//   14 日日定食改成泰米村食（AA_742 第 ③ 節三處）＋舊存檔行程地點遷移
//   15 index.html 載入、node --check
//   16 （子程序 A：建出遊戲真正的六個區域，tz_shops3d.js＋GG3）：區域的 build 包上了、座位補成 zone.seats、每一個點都標記接好、店員站的位置（開店才有人、洗樂沒有）
// 修改前（開發分支 8846c3c34）：沒有 GG3、沒有資料檔、六間沒有營業時間、互動點只有「（店名）」——全部 FAIL。
// 用法：node tests/gg_shops3_story_1111_unit.js
if(process.argv[2]==='A') partA(); else partB();

function partA(){
const fs=require('fs'), vm=require('vm'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
process.on('unhandledRejection',()=>{}); global.window=global; global.self=global; console.warn=()=>{};
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/calendar.js','src/data/places.js','src/data/tingzhou_layout.js','src/tingzhou3d.js','src/data/tz_shops_layout.js','src/tz_shops3d.js','src/data/gg3_shops_lines.js','src/gg3shops3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|TZ3|TZS3|TINGZHOU_LAYOUT|TZ_SHOPS_LAYOUT|LINZE_LAYOUT|CLASSROOM_LAYOUT|PROPS|CHAR|CALENDAR|PLACES|GG3_LINES|GG3)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
if(typeof ASSETS!=='undefined') ASSETS.loadOne=()=>new Promise(()=>{});
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
const loadZone=id=>{ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.nav=z.nav; return z; };
check('16 GG3 包上六個區域的 build',GG3.ZONES.every(k=>Z3.ZONES[k]&&Z3.ZONES[k]._gg3));
for(const k of GG3.ZONES){ const L=TZ_SHOPS_LAYOUT[GG3.LAYID[k]], z=loadZone(k), IT=E.interactables, bad=[];
  if(!Array.isArray(z.seats)||z.seats.length!==(L.seats||[]).length||!z.seats.every(s=>IT.some(i=>i.seat===s))) bad.push('zone.seats '+(z.seats&&z.seats.length)+'／'+(L.seats||[]).length);
  for(const p of L.points||[]){ const it=IT.find(i=>i.tzPoint===p.id); if(!it||it.gg3!==k) bad.push(p.id+' 沒標記'); }
  check(`16 ${L.name}（${k}）：區域建得起來、座位補成 zone.seats（${(L.seats||[]).length}）、${(L.points||[]).length} 個點都接上`,!bad.length,bad.join('；'));
  /* 店員：開店時放一個人（假的 CHAR、STORY），關門不放；洗樂沒有店員 */
  const C0=global.CHAR, S0=global.STORY, A0=E.addNPC, got=[]; global.CHAR={build:()=>new THREE.Group()}; global.STORY={extraSpec:i=>({i})}; E.addNPC=o=>{ got.push(o); return o; };
  try{ const GMo={E,G:{day:DK(k==='tz_taimi'?'2025-10-07':'2025-10-06'),hour:12,flags:{}}}; const n1=GG3.placeClerk(k,GMo); GMo.G.hour=23.5; const n2=k==='tz_xile'?null:GG3.placeClerk(k,GMo);
    check(`16 ${L.name}：店員站在配置的位置（開店才有，關門沒有）`,k==='tz_xile'?(!n1&&!z.shopClerk):(!!n1&&!n2&&got.length===1&&Math.abs(n1.obj.position.x-L.clerk.x)<1e-6&&Math.abs(n1.obj.position.z-L.clerk.z)<1e-6&&n1.frozen&&n1.clerk),J(got.map(o=>[o.obj.position.x,o.obj.position.z]))); }
  finally { global.CHAR=C0; global.STORY=S0; E.addNPC=A0; } }
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
function DK(key){ for(let d=-400;d<1500;d++) if(CALENDAR.dateOf(d).key===key) return d; return null; }
function J(x){ return JSON.stringify(x); }
}

function partB(){
const H=require('./pg_harness.js'); const {check,GM,E}=H;
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=H.ROOT, rd=p=>fs.readFileSync(path.join(ROOT,p),'utf8'), J=JSON.stringify;
console.warn=()=>{};
const SHA='90fb5fa77',   /* 2026-11-12 SHOP-LIFE-AA826-1112：泰米午休作廢（AA e24b6cec7；AA_826 lawww_answers 第 7 點）；舊 8f6650289（11-11 AA 回七格：打烊照 AA_700 統一、廚房、柔軟精）、75f5de658 */ P742='docs/story_planning/AA_742_公館六間店_設定與台詞.md', P813='docs/story_planning/AA_813_公館六間店_對照LAWWW2的決定.md';
const loadErr=[];
for(const f of ['src/data/tz_shops_layout.js','src/data/eat_lines.js','src/eat3d.js','src/data/gg3_shops_lines.js','src/gg3shops3d.js']){
  if(!fs.existsSync(path.join(ROOT,f))){ loadErr.push(f+'（沒有這個檔）'); continue; }
  try{ let s=rd(f); s=s.replace(/^const (\w+)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); }catch(e){ loadErr.push(f+'：'+String(e).slice(0,200)); } }
check('0 載得到（配置、EAT、資料檔、GG3）',!loadErr.length&&typeof GG3!=='undefined'&&typeof GG3_LINES!=='undefined',loadErr.join(' | '));
if(typeof GG3==='undefined'||typeof GG3_LINES==='undefined'){ H.done(); }
const L=GG3_LINES;
GM.money=d=>{ H.G.money=(H.G.money|0)+d; };
const toasts=[]; GM.toast=t=>toasts.push(t); GM.enterN=1;
GM.sitAt=(P,s)=>{ P.seat=s; }; GM.standUp=P=>{ P.seat=null; };
const fresh=(key,h,zone,fl)=>{ const G=H.fresh(key,h,zone,fl); G.money=5000; toasts.length=0; E.interactables=[]; E.player.seat=null; GG3.rand=()=>0; return G; };
const said=()=>H.said.map(s=>[s.who,s.t]), txt=()=>H.said.map(s=>s.t);
const near=(a,b)=>Math.abs(a-b)<1e-6;
const DK=k=>PG.DK(k);
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+' 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); } };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
/* 店裡的座位互動點（tz_shops3d.js 建的那樣：tzSeat、seat.table＝'<店>_t<桌號>'）*/
const seatsOf=k=>{ const Ly=TZ_SHOPS_LAYOUT[GG3.LAYID[k]]; return (Ly.seats||[]).map(q=>({x:q.x,z:q.z,radius:0.7,label:q.label||'坐下',tzSeat:q.id,seat:{x:q.x,z:q.z,yaw:q.yaw,table:Ly.id+'_t'+q.table}})); };

(async()=>{
// ---- 1 逐句對稿 ----
await sec(1,()=>{ let d742=null, d813=null; try{ d742=cp.execFileSync('git',['show',SHA+':'+P742],{cwd:ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']}); d813=cp.execFileSync('git',['show',SHA+':'+P813],{cwd:ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']}); }catch(e){}
  if(!d742||!d813){ console.log('SKIP 1 讀不到企劃線 '+SHA+'（淺層複本：git fetch origin claude/story-planning）'); return; }
  const MARK=new Set(['finals','y4','five']);   /* 程式用的記號（資料檔的條件），不是台詞 */
  const all=[]; const walk=(x,k)=>{ if(typeof x==='string'){ if(!MARK.has(x)) all.push([k,x]); } else if(Array.isArray(x)) x.forEach(v=>walk(v,k)); else if(x&&typeof x==='object') for(const kk of Object.keys(x)) walk(x[kk],kk); };
  for(const z of GG3.ZONES) walk(L[z],z);
  const bad=all.filter(([k,t])=>d742.indexOf(t)<0&&d813.indexOf(t)<0);
  check('1 資料檔每一句都原封不動在 AA_742 或 AA_813（'+all.length+' 個字串：台詞、旁白、商品名、選項）',!bad.length&&all.length>=200,J(bad.slice(0,6)));
  const lines=[]; for(const z of GG3.ZONES){ const T=L[z]; for(const l of (T.door||[])) lines.push(l[1]); }
  check('1 六間的進門句都在（安泰 3、鮮果 2（收音機那句不接）、榮恩典 3、泰米 3、洗樂 3、印得好 3）',J(GG3.ZONES.map(z=>L[z].door.length))===J([3,2,3,3,3,3]),J(GG3.ZONES.map(z=>L[z].door.length)));
  const flat=J(L);
  const OUT=['（收音機在放老歌。老闆一邊秤橘子一邊跟著哼。）','（老式的吊秤','（一台舊收音機','（布告欄上：家教','（布告欄上有人貼了一張紙','（老闆娘推著一車洗衣精進來補貨','（架子上四個小罐子：魚露','凡事謝恩','那個喔？我爸寫的','（那張卡片的邊角有點黃了。）','（一個年輕的女生在幫忙包裝禮物','（騎樓的鐵架上放著特價','（店門口的架子上擺著名片和海報的樣本','（窗口裡師傅背對著你','（櫥窗裡擺著一個木頭畫架','（老闆的算盤很舊'];
  const hit=OUT.filter(t=>flat.indexOf(t)>=0); check('1 AA_813 不接的句子都不在（要改模型的、騎樓 sale／rack、女兒週末、被第 2 節取代的出餐窗口、櫥窗；算盤沒有互動點）',!hit.length,J(hit));
  check('1 汀州鮮果 17～20 點那一句改老闆說（AA_813：字不動）＝老闆「切好的在冰箱。」',J(L.gg_xianguo.sit.dusk.line)===J(['老闆','切好的在冰箱。'])&&d742.indexOf('「切好的在冰箱。」')>=0);
  check('1 印得好備審「老闆」那一句改店員說（AA_813）＝店員「上禮拜有人把校名打錯，重印了三次。」',J(L.tz_yindehao.shen[1])===J(['店員','上禮拜有人把校名打錯，重印了三次。']));
  check('1 AA_813 第 2 節八句接在對的點（畫架、看筆、看筆記本、挑水果、切好的水果盒、烘衣機、自助影印、廚房）',[['gg_rongendian','gg_rong_easel'],['gg_rongendian','gg_rong_pens'],['gg_rongendian','gg_rong_notes'],['gg_xianguo','gg_fruit_pick'],['gg_xianguo','gg_fruit_box'],['tz_xile','tz_xile_dry'],['tz_yindehao','tz_yin_copy'],['tz_taimi','tz_taimi_kitchen']].every(([z,k])=>L[z].look[k]&&d813.indexOf(L[z].look[k][0])>=0));
  let ck=null; try{ ck=cp.spawnSync('python3',['tools/shops/import_gg3_shops.py','--check'],{cwd:ROOT,encoding:'utf8'}); }catch(e){}
  if(!ck||ck.error) console.log('SKIP 1 沒有 python3（匯入工具 --check）'); else check('1 匯入工具 --check：資料檔＝稿匯出來的（走 import_guard 白名單）',ck.status===0,(ck.stdout+ck.stderr).trim().slice(0,200));
  const allow=JSON.parse(rd('docs/handoff/story_import_allow.json')).files; check('1 劇情匯入白名單有 AA_742、AA_813（'+SHA+'、approved）',[P742,P813].every(p=>allow.some(e=>e.path===p&&e.sha===SHA&&e.status==='approved'&&e.approvedBy))); });

// ---- 2 營業時間 ----
await sec(2,()=>{ const o=(k,key,h)=>PLACES.isOpen(k,h,DK(key));
  check('2 安泰 週一～六 09:00～22:00、週日 10:00～18:00',!o('gg_antai','2025-10-06',8.98)&&o('gg_antai','2025-10-06',9)&&o('gg_antai','2025-10-06',21.98)&&!o('gg_antai','2025-10-06',22)&&!o('gg_antai','2025-10-05',9.5)&&o('gg_antai','2025-10-05',10)&&o('gg_antai','2025-10-05',17.98)&&!o('gg_antai','2025-10-05',18));
  check('2 汀州鮮果 每天 10:00～22:00',[0,1,2,3,4,5,6].every(i=>!PLACES.isOpen('gg_xianguo',9.98,DK('2025-10-05')+i)&&PLACES.isOpen('gg_xianguo',10,DK('2025-10-05')+i)&&!PLACES.isOpen('gg_xianguo',22,DK('2025-10-05')+i)));
  check('2 榮恩典 週一～六 09:30～21:30、週日公休',!o('gg_rongendian','2025-10-06',9.4)&&o('gg_rongendian','2025-10-06',9.5)&&o('gg_rongendian','2025-10-06',21.4)&&!o('gg_rongendian','2025-10-06',21.5)&&!o('gg_rongendian','2025-10-05',12));
  /* 2026-11-12（SHOP-LIFE-AUDIT-1112）改期望——舊期望：泰米 11:00～14:00、17:00～21:00（中午休息）。使用者 11-12 改成一段 11:00～21:00（places.js）；AA：AA_742 午休那一句作廢。
     下面第 3、4、5 節的午休情境一起改：15:00 開著（不擋門、照樣說進門句）、14:00 不請出去。SHOP-LIFE-AA826-1112：AA 的稿（90fb5fa77）拿掉午休了，重匯以後資料檔沒有 rest／closeNoon，程式裡那兩段也拿掉。*/
  check('2 泰米 11:00～21:00（一段，沒有中午休息）、週一公休',!o('tz_taimi','2025-10-07',10.98)&&o('tz_taimi','2025-10-07',11)&&o('tz_taimi','2025-10-07',13.98)&&o('tz_taimi','2025-10-07',14)&&o('tz_taimi','2025-10-07',16.98)&&o('tz_taimi','2025-10-07',17)&&o('tz_taimi','2025-10-07',20.98)&&!o('tz_taimi','2025-10-07',21)&&!o('tz_taimi','2025-10-06',12));
  check('2 洗樂 24 小時（03:00、23:59 都開）',o('tz_xile','2025-10-06',3)&&o('tz_xile','2025-10-05',23.98)&&PLACES.hours.tz_xile.text==='24 小時');
  check('2 印得好 週一～五 09:00～22:00、週六 10:00～18:00、週日公休',o('tz_yindehao','2025-10-06',9)&&!o('tz_yindehao','2025-10-06',22)&&!o('tz_yindehao','2025-10-04',9.5)&&o('tz_yindehao','2025-10-04',10)&&!o('tz_yindehao','2025-10-04',18)&&!o('tz_yindehao','2025-10-05',12));
  check('2 印得好 期末考週和前一週延到 24:00（期中考週不延；週六也延、週日照樣公休）',o('tz_yindehao','2025-12-10',23.5)&&o('tz_yindehao','2025-12-15',23.5)&&o('tz_yindehao','2025-12-13',23.5)&&!o('tz_yindehao','2025-12-14',12)&&!o('tz_yindehao','2025-10-22',23)&&!o('tz_yindehao','2025-12-03',23));
  check('2 颱風天六間都關（typhoonShops）、名字（關門說明用）',GG3.ZONES.every(z=>PLACES.typhoonShops.includes(z)&&!!PLACES.names[z]&&!!PLACES.hours[z])); });

// ---- 3 關門時按門 ----
await sec(3,async()=>{ const door=async(key,h,k)=>{ fresh(key,h,k.startsWith('gg_')?'gongguan':'tingzhou'); const r=await STORY.interact({exit:{to:k},label:'進'+k},GM); return {r,said:said(),t:toasts.slice()}; };
  for(const [k,key,h,line] of [['gg_antai','2025-10-06',23,L.gg_antai.sign],['gg_xianguo','2025-10-06',22.5,L.gg_xianguo.sign],['gg_rongendian','2025-10-06',22,L.gg_rongendian.sign],['gg_rongendian','2025-10-05',12,L.gg_rongendian.off],
      ['tz_taimi','2025-10-07',21.5,L.tz_taimi.sign],['tz_taimi','2025-10-06',12,L.tz_taimi.off],['tz_yindehao','2025-10-06',23,L.tz_yindehao.sign],['tz_yindehao','2025-10-05',12,L.tz_yindehao.off]]){
    const x=await door(key,h,k); check(`3 ${k} ${key} ${h}:00 按門：門口那一句（旁白）、不進去、寫開放時間`,x.r===true&&J(x.said)===J([[null,line]])&&!H.entered.length&&x.t.length===1,J([x.said,x.t])); }
  { const x=await door('2025-10-06',7,'gg_antai'); check('3 安泰 07:00（開門以前）：不說話、只寫開放時間',x.r===true&&!x.said.length&&x.t.length===1&&/安泰藥局/.test(x.t[0])&&/09:00/.test(x.t[0]),J(x.t)); }
  { const x=await door('2025-10-07',12,'tz_taimi'); check('3 開著（泰米 12:00）：不擋（不說門口句）',x.r!==true||!x.said.length,J(x)); }
  { const x=await door('2025-10-07',15,'tz_taimi'); check('3 泰米 15:00（原本的午休時間，現在開著）：不擋、不說話',(x.r!==true||!x.said.length),J(x)); }
  { const TC=PLACES.typhoonClosed; PLACES.typhoonClosed=z=>PLACES.typhoonShops.includes(z);
    try{ const x=await door('2025-10-06',12,'tz_xile'); check('3 洗樂颱風假：玻璃門那一句、不進去',x.r===true&&J(x.said)===J([[null,L.tz_xile.typhoon]])&&!H.entered.length,J(x.said));
      const y=await door('2025-10-06',12,'gg_antai'); check('3 安泰颱風假（稿上沒有颱風那一句）：只寫「颱風假」的開放時間',y.r===true&&!y.said.length&&/颱風假/.test(y.t[0]||''),J(y)); } finally { PLACES.typhoonClosed=TC; } } });

// ---- 4 進門 ----
await sec(4,async()=>{ const hrs={gg_antai:12,gg_xianguo:12,gg_rongendian:12,tz_taimi:12,tz_xile:3,tz_yindehao:12};
  for(const k of GG3.ZONES){ const G=fresh('2025-10-07',hrs[k],k); GM.enterN=(GM.enterN|0)+1; const due=GG3.doorDue(GM); GG3.rand=()=>0.99; const r=await GG3.enterLine(GM); const last=L[k].door[L[k].door.length-1];
    check(`4 ${k} 一天第一次進來：一句進門句（${last[0]||'旁白'}）`,due&&r==='door'&&J(said())===J([[last[0],last[1]]]),J(said()));
    GM.enterN++; check(`4 ${k} 同一天再進來：不說`,!GG3.doorDue(GM));
    G.day++; GM.enterN++; check(`4 ${k} 隔天再進來：又說`,!GG3.isOpen(k,G)||GG3.doorDue(GM)); }
  { const G=fresh('2025-10-07',12,'tz_taimi'); GM.enterN++; G.invites=[{who:'heroine_01',place:'tz_taimi',day:G.day,h:12,state:'going'}]; const r=await GG3.enterLine(GM); check('4 今天約在泰米（一起走過來）：不說',r==='together'&&!H.said.length); }
  { fresh('2025-10-07',21.5,'tz_taimi'); GM.enterN++; check('4 關著的時候不說進門句（打烊那一段優先；21:30）',!GG3.doorDue(GM)); }
  { fresh('2025-10-07',15,'tz_taimi'); GM.enterN++; check('4 泰米 15:00（現在開著）：照樣有進門句',!!GG3.doorDue(GM)); } });

// ---- 5 打烊 ----
await sec(5,async()=>{ for(const [k,key,c,to] of [['gg_antai','2025-10-06',22.1,'gongguan'],['gg_xianguo','2025-10-06',22.1,'gongguan'],['gg_rongendian','2025-10-06',21.6,'gongguan'],['tz_taimi','2025-10-07',21.1,'tingzhou'],['tz_yindehao','2025-10-06',22.1,'tingzhou'],['tz_yindehao','2025-12-10',24.05,'tingzhou']]){
    fresh(key,c,k); GM.enterN++; E.player.seat={x:0,z:0}; const r=await GG3.closeOut(GM);
    const want=L[k].close;
    check(`5 ${k} 打烊那一刻（${c}）：${L[k].who}「${want}」一句（AA_742／AA_700；不另外出旁白）、站起來、走到${to}`,r==='close'&&J(said())===J([[L[k].who,want]])&&H.entered[0]===to&&!E.player.seat,J([r,said(),H.entered])); }
  check('5 打烊統一 AA_700「我們今天要打烊了。」（五間；洗樂 24 小時沒有）；泰米的午休句、休息的木牌不在資料檔裡了（AA_742 @ 90fb5fa77 取消；程式也不再讀 closeNoon／rest）',['gg_antai','gg_xianguo','gg_rongendian','tz_taimi','tz_yindehao'].every(k=>L[k].close==='我們今天要打烊了。')&&!('closeNoon' in L.tz_taimi)&&!('rest' in L.tz_taimi)&&!/午休|休息中/.test(JSON.stringify(L))&&!/closeNoon|T\.rest/.test(rd('src/gg3shops3d.js')),J(['gg_antai','gg_xianguo','gg_rongendian','tz_taimi','tz_yindehao'].map(k=>L[k].close)));
  { const G=fresh('2025-10-07',14.1,'tz_taimi'); GM.enterN++; check('5 泰米 14:06（原本午休那一刻）：店開著，不請你出去（2026-11-12 改期望；舊期望＝老闆娘說午休那一句、走到汀州路）',GG3.isOpen('tz_taimi',G)); }
  { fresh('2025-10-07',23.5,'tz_taimi'); GM.enterN++; const r=await GG3.closeOut(GM); check('5 讀檔回到打烊以後（新的一趟、過了那一刻）：不說、走出去、寫開放時間',r==='out'&&!H.said.length&&H.entered[0]==='tingzhou'&&toasts.length===1,J([r,said(),toasts])); }
  { const G=fresh('2025-10-07',20,'tz_taimi'); GM.enterN++; GG3.tick(GM); await sleep(5); G.hour=22.5; const r=await GG3.closeOut(GM); check('5 開著的時候進來、待到過了打烊很久（場景忙）：照樣說那一句',r==='close'&&H.has(L.tz_taimi.close),J(said())); }
  { const G=fresh('2025-10-06',3,'tz_xile'); GM.enterN++; check('5 洗樂 24 小時：半夜不請你出去',GG3.isOpen('tz_xile',G));
    const TC=PLACES.typhoonClosed; PLACES.typhoonClosed=z=>PLACES.typhoonShops.includes(z); try{ const r=await GG3.closeOut(GM); check('5 洗樂颱風假在店裡：不說話、走出去、寫颱風假',r==='out'&&!H.said.length&&H.entered[0]==='tingzhou'&&/颱風假/.test(toasts[0]||''),J([r,toasts])); } finally { PLACES.typhoonClosed=TC; } }
  { fresh('2025-10-06',22.1,'gg_antai'); GM.enterN++; const ok=GG3.tick(GM); await sleep(5); check('5 STORY.TICKS 每 0.5 秒：關門了＝請你出來（打烊那一句）',ok===true&&H.has(L.gg_antai.close)&&H.entered[0]==='gongguan'&&STORY.TICKS.includes(GG3.tick),J(said())); } });

// ---- 6 安泰藥局 ----
await sec(6,async()=>{ const A=L.gg_antai, it=kind=>({tzPoint:kind,kind,label:kind});
  { fresh('2025-10-01',12,'gg_antai'); GG3.rand=()=>0; const r=await STORY.interact(it('gg_antai_counter'),GM); check('6 藥師櫃台（平常、第一次來）：藥師平常那兩句之一',r===true&&H.said.length===1&&H.said[0].who==='藥師'&&A.talk.normal.includes(H.said[0].t),J(said()));
    GG3.rand=()=>0.99; H.said=[]; await STORY.interact(it('gg_antai_counter'),GM); check('6 同一天再按：同一句（一天挑一次）',H.said.length===1&&H.said[0].t===A.talk.normal[0],J(said())); }
  for(const [key,h,want,n] of [['2025-10-01',21.5,A.talk.night,'晚上 21:00 以後'],['2025-10-22',12,A.talk.exam,'期中考週'],['2025-12-17',12,A.talk.exam.concat(A.talk.cold),'期末考週（十二月）'],['2025-11-05',12,A.talk.cold,'十一月（感冒季）']]){
    fresh(key,h,'gg_antai'); GG3.rand=()=>0.99; await GG3.antaiTalk(GM); check(`6 ${n}：藥師那一句`,H.said.length===1&&want.includes(H.said[0].t),J(said())); }
  { const G=fresh('2025-10-01',12,'gg_antai'); G.flags.GG3_SEEN={gg_antai:G.day-3}; GG3.rand=()=>0.99; await GG3.antaiTalk(GM); check('6 第二次以後來（以前哪一天來過）：可以是「又是你。上次的貼布有用嗎？」',H.said[0].t===A.talk.again[0],J(said())); }
  { const G=fresh('2025-10-01',12,'gg_antai'); H.picks=['口罩','買']; const h0=G.hour, r=await GG3.antaiShelf(GM);
    check('6 看貨架：選口罩 → 看的那一句 → 買：扣 120、時間 +9 分鐘、寫「買了」',r===A.goods[0].n&&H.said[0].t===A.goods[0].look&&G.money===4880&&near(G.hour-h0,GG3.HRS.buy)&&toasts.some(t=>t.indexOf('買了')===0),J([G.money,said(),toasts]));
    check('6 十月沒有暖暖包（只有十一月到二月才擺出來）',!H.opts[0].some(t=>/暖暖包/.test(t))&&H.opts[0].length===8,J(H.opts[0])); }
  { fresh('2025-12-03',12,'gg_antai'); H.picks=['暖暖包','不用了']; const r=await GG3.antaiShelf(GM); check('6 十二月有暖暖包；看了選「不用了」＝不扣錢',r==='look'&&H.G.money===5000&&H.has('（只有十一月到二月才擺出來。）'),J(said())); }
  { const G=fresh('2025-10-01',12,'gg_antai'); G.money=100; H.picks=['人工淚液','買']; const r=await GG3.antaiShelf(GM); check('6 錢不夠：寫「錢不夠」、不扣錢（稿上沒有藥師的錢不夠那一句）',r==='short'&&G.money===100&&toasts.includes('錢不夠'),J(toasts)); }
  { fresh('2025-10-01',12,'gg_antai'); E.interactables=seatsOf('gg_antai'); let sat=null; const s0=GM.sitAt; GM.sitAt=(P,s)=>{ sat=s; P.seat=s; }; const r=await GG3.antaiBp(GM); GM.sitAt=s0;
    check('6 量血壓：說明那一句 → 坐上血壓計前的椅子 → 量完那一句（118／76）→ 站起來',r==='bp'&&J(txt())===J([A.bp.look,A.bp.done])&&!!sat&&!E.player.seat,J(said())); } });

// ---- 7 汀州鮮果 ----
await sec(7,async()=>{ const X=L.gg_xianguo;
  { const G=fresh('2025-10-01',12,'gg_xianguo'); H.picks=['芭樂','切好']; const h0=G.hour, r=await GG3.fruitBuy(GM);
    check('7 秤重結帳：老闆「要什麼？」→ 選單（九項：禮盒、水果盒大小分開）→ 芭樂：看的一句 → 切好：扣 30、時間 +9＋5 分鐘、買完一句',r==='芭樂（一顆）'&&H.said[0].who==='老闆'&&H.said[0].t===X.ask&&H.opts[0].length===10&&H.said[1].t===X.goods[1].look&&G.money===4970&&near(G.hour-h0,GG3.HRS.buy+5/60)&&H.said.length===3,J([G.money,G.hour-h0,said(),H.opts[0]])); }
  { const G=fresh('2025-10-01',12,'gg_xianguo'); H.picks=['蘋果']; await GG3.fruitBuy(GM); check('7 蘋果 35（5 結尾）：老闆「學生喔？算你整數。」、少算 5 元（付 30）',G.money===4970&&H.has('學生喔？算你整數。'),J([G.money,said()])); }
  { const G=fresh('2025-10-01',12,'gg_xianguo'); H.picks=['香蕉']; GG3.rand=()=>0.99; await GG3.fruitBuy(GM); check('7 香蕉 50（不是 5 結尾）：不說「算你整數」，隨機另外兩句',G.money===4950&&!H.has('學生喔？算你整數。'),J(said())); }
  { const G=fresh('2025-10-01',20.5,'gg_xianguo'); H.picks=['香蕉']; await GG3.fruitBuy(GM); check('7 20:00 以後那天第一次：老闆「快收了，香蕉便宜賣，一把三十。」、香蕉 30',H.said[0].t===X.sit.late.line[1]&&G.money===4970&&H.opts[0].some(t=>/^香蕉/.test(t)),J([G.money,said()]));
    H.said=[]; H.picks=['香蕉']; await GG3.fruitBuy(GM); check('7 同一天再去：情境不再說',!H.has(X.sit.late.line[1]),J(said())); }
  { fresh('2025-10-01',18,'gg_xianguo'); H.picks=['不用了']; await GG3.fruitBuy(GM); check('7 17:00～20:00：老闆「切好的在冰箱。」（AA_813 換老闆說）',J(said()[0])===J(['老闆','切好的在冰箱。']),J(said())); }
  { fresh('2025-12-17',12,'gg_xianguo'); H.picks=['不用了']; await GG3.fruitBuy(GM); check('7 期末考週：老闆「讀書喔？買個芭樂……」',H.has(X.sit.final.line[1]),J(said())); }
  { const G=fresh('2025-10-01',12,'gg_xianguo'); G.money=20; H.picks=['葡萄']; const r=await GG3.fruitBuy(GM); check('7 錢不夠：老闆「沒關係啦，少買一樣就好。」、不扣錢',r==='short'&&G.money===20&&H.said[H.said.length-1].t===X.short,J(said())); }
  { const G=fresh('2025-10-01',12,'gg_xianguo'); H.picks=['水果禮盒']; await GG3.fruitBuy(GM); check('7 水果禮盒：老闆「要去看人喔？……」＋（他把最上面的蘋果換了一顆。）、扣 500',G.money===4500&&H.has(X.sit.gift.line[1])&&H.has(X.sit.gift.narr[1]),J(said())); }
  { const G=fresh('2025-10-01',12,'gg_xianguo'); H.picks=['切好的水果盒（大）']; await GG3.fruitBuy(GM); check('7 切好的水果盒（大）100',G.money===4900,J(G.money)); } });

// ---- 8 榮恩典文具社 ----
await sec(8,async()=>{ const X=L.gg_rongendian;
  { const G=fresh('2025-10-01',12,'gg_rongendian'); H.picks=['筆記本']; GG3.rand=()=>0.99; const r=await GG3.rongBuy(GM);
    check('8 結帳：三類（上課、畫材、送禮）→ 筆記本 35：扣錢、「筆記本買這個牌子對」可以出現',r==='筆記本（B5，一本）'&&J(H.opts[0])===J(['上課…','畫材…','送禮…','不用了'])&&G.money===4965&&H.has(X.after[2][1]),J([said(),H.opts[0]])); }
  { fresh('2025-10-01',12,'gg_rongendian'); H.picks=['水彩']; GG3.rand=()=>0.99; await GG3.rongBuy(GM); check('8 買水彩：不說試寫筆、筆記本那兩句（只剩袋子那一句）',J(said())===J([X.after[0]]),J(said())); }
  { fresh('2025-10-01',12,'gg_rongendian'); H.picks=['原子筆']; GG3.rand=()=>0.99; await GG3.rongBuy(GM); check('8 買原子筆：試寫的那一句可以出現',H.has(X.after[1][1]),J(said())); }
  { const G=fresh('2025-10-01',12,'gg_rongendian'); G.money=100; H.picks=['桌上型畫架']; const r=await GG3.rongBuy(GM); const last=H.opts[H.opts.length-1];
    check('8 錢不夠：老闆「沒關係，筆先拿去，下次再算。」→ 只有「不用了，我下次再買」、不扣錢（不賒帳）',r==='short'&&G.money===100&&H.has(X.short.line)&&J(last)===J([X.short.opt]),J([said(),last])); }
  { const G=fresh('2025-10-01',12,'gg_rongendian'); H.picks=['卡片','好']; const h0=G.hour; await GG3.rongBuy(GM);
    check('8 買卡片：老闆「送人的喔？要不要我幫你包？不用錢。」→ 好＝那一句旁白、時間 +10 分鐘（再加買東西的 9 分鐘）',H.has(X.sit.wrap.line[1])&&H.has(X.sit.wrap.narr)&&near(G.hour-h0,GG3.HRS.buy+10/60)&&G.money===4960,J([G.hour-h0,said()]));
    H.said=[]; H.picks=['卡片']; await GG3.rongBuy(GM); check('8 同一天再買卡片：不再問（一天一次）',!H.has(X.sit.wrap.line[1])); }
  for(const [key,s,n] of [['2025-09-03','early','學期第 1～2 週'],['2025-10-15','preExam','期中考前一週'],['2025-12-10','preExam','期末考前一週'],['2025-12-03','dec','十二月']]){
    fresh(key,12,'gg_rongendian'); H.picks=['不用了']; await GG3.rongBuy(GM); check(`8 ${n}：那一句（一天一次）`,H.said.length===1&&H.said[0].t===X.sit[s].line[1],J(said())); }
  { fresh('2025-10-01',12,'gg_rongendian'); H.picks=['不用了']; await GG3.rongBuy(GM); check('8 平常的日子：不說情境',!H.said.length,J(said())); }
  { const G=fresh('2025-10-01',12,'gg_rongendian'); H.picks=[X.cart.n]; await GG3.rongCart(GM); check('8 特價推車：特價筆記本三本 60',G.money===4940&&H.said.length===1,J([G.money,said()]));
    G.money=10; H.said=[]; toasts.length=0; H.picks=[X.cart.n]; const r=await GG3.rongCart(GM); check('8 推車錢不夠：寫「錢不夠」（老闆那句講的是筆）、不扣錢',r==='short'&&G.money===10&&toasts.includes('錢不夠')&&!H.said.length); } });

// ---- 9 洗樂洗衣坊 ----
await sec(9,async()=>{ const X=L.tz_xile;
  { const G=fresh('2025-10-01',15,'tz_xile'); E.interactables=seatsOf('tz_xile'); let sat=null; const s0=GM.sitAt; GM.sitAt=(P,s)=>{ sat=s; P.seat=s; }; H.picks=['只洗','在這裡等']; const h0=G.hour; const r=await GG3.wash(GM); GM.sitAt=s0;
    check('9 洗衣機：三個選項照稿 → 只洗：在這裡等＝扣 60、坐「坐著等」的塑膠椅、等的時候一句、時間 +40 分鐘、站起來',r==='stay'&&J(H.opts[0])===J(X.wash.menu.map(m=>m.t).concat([X.wash.no]))&&J(H.opts[1])===J([X.wash.stay,X.wash.go])&&G.money===4940&&near(G.hour-h0,40/60)&&H.said.length===1&&X.wait.includes(H.said[0].t)&&!!sat&&/^c\d/.test(String(sat.table).replace(/^xile_t1$/,'c1'))&&!E.player.seat,J([G.money,G.hour-h0,said(),sat]));
    H.said=[]; toasts.length=0; const r2=await GG3.wash(GM); check('9 一天最多洗一次：同一天再按＝寫「今天洗過了。」、不扣錢',r2==='done'&&G.money===4940&&toasts.includes(GG3.SYS.washed)); }
  { const G=fresh('2025-10-01',15,'tz_xile'); H.picks=['洗＋烘','先去別的地方']; const r=await GG3.wash(GM);
    check('9 洗＋烘：先去別的地方＝扣 100、走出店門（汀州路）、記好的時間（80 分鐘後）',r==='go'&&G.money===4900&&H.entered[0]==='tingzhou'&&Math.abs(G.flags.GG3_WASH.ready-(G.day*24+15+80/60))<1e-3,J([G.money,H.entered,G.flags.GG3_WASH]));
    G.zone='tz_xile'; G.hour=15.5; check('9 還沒好就回來：不說',!GG3.washBackDue(G));
    G.hour=17; H.said=[]; GM.enterN++; G.flags.GG3_DOOR={tz_xile:G.day}; const ok=GG3.tick(GM); await sleep(5);
    check('9 好了以後回到店裡（tick）：回來的時候一句、只說一次',ok===true&&H.said.length===1&&X.back.includes(H.said[0].t)&&!GG3.washBackDue(G),J(said())); }
  { const G=fresh('2025-10-01',15,'tz_xile'); G.flags.GG3_WASH={day:G.day-2,ready:(G.day-2)*24+16,done:false}; check('9 過了一天才回來：不說（「還是溫的」對不上）',!GG3.washBackDue(G)); }
  { fresh('2025-10-02',15,'tz_xile'); let depth=0, at=null; const sb=GM.sceneBegin, se=GM.sceneEnd, en=GM.enter; GM.sceneBegin=()=>{ depth++; }; GM.sceneEnd=()=>{ depth--; }; GM.enter=async z=>{ at=depth; H.entered.push(z); H.G.zone=z; };
    H.picks=['只洗','先去別的地方']; try{ await STORY.interact({tzPoint:'wash',kind:'tz_xile_wash',label:'洗衣機'},GM); } finally { GM.sceneBegin=sb; GM.sceneEnd=se; GM.enter=en; }
    check('9 從洗衣機按「先去別的地方」：場景結束以後才走出去（換區域不在對話裡）',H.entered[0]==='tingzhou'&&at===0&&depth===0,J([H.entered,at,depth])); }
  { const G=fresh('2025-10-01',15,'tz_xile'); H.picks=['零錢兌換機']; await GG3.change(GM); check('9 兌幣機：換零錢那一句、錢不變',G.money===5000&&H.has(X.change.narr));
    H.said=[]; H.picks=['洗衣精']; await GG3.change(GM); check('9 洗衣精 10 元：那一句旁白',G.money===4990&&H.has(X.soap.narr));
    H.said=[]; H.picks=['柔軟精']; await GG3.change(GM); check('9 柔軟精 10 元：柔軟精那一句旁白（AA_742 8f6650289：「（你買了一包柔軟精，丟進洗衣機的小格子裡。）」）',G.money===4980&&J(said())===J([[null,'（你買了一包柔軟精，丟進洗衣機的小格子裡。）']]),J(said())); } });

// ---- 10 印得好 ----
await sec(10,async()=>{ const X=L.tz_yindehao;
  { const G=fresh('2025-10-01',12,'tz_yindehao'); H.picks=['印講義']; GG3.rand=()=>0; const h0=G.hour; const r=await GG3.yinCounter(GM);
    check('10 櫃台（平常、大一）：只有印講義、影印報告；印講義＝扣 30、店員「好，十分鐘。」、時間 +10 分鐘',r==='印講義'&&J(H.opts[0])===J(['印講義','影印報告','不用了'])&&G.money===4970&&J(said())===J([X.after[0]])&&near(G.hour-h0,10/60),J([H.opts[0],said(),G.hour-h0])); }
  { const G=fresh('2025-12-10',12,'tz_yindehao'); H.picks=['裝訂期末報告']; const h0=G.hour; await GG3.yinCounter(GM);
    check('10 期末考前一週：多「裝訂期末報告」；80 元、那兩句、時間 +30 分鐘',H.opts[0].includes('裝訂期末報告')&&G.money===4920&&J(said())===J(X.bind)&&near(G.hour-h0,0.5),J(said())); }
  { const G=fresh('2028-10-11',12,'tz_yindehao'); H.picks=['印履歷','研究所備審']; await GG3.yinCounter(GM);
    check('10 大四：多「印履歷／備審資料」；備審 200、那兩句（備審喔？＋店員「上禮拜有人把校名打錯……」）',H.opts[0].some(t=>/^印履歷／備審資料/.test(t))&&G.money===4800&&J(said())===J(X.shen),J([H.opts,said()])); }
  { const G=fresh('2028-10-11',12,'tz_yindehao'); H.picks=['印履歷','履歷輸出']; GG3.rand=()=>0; await GG3.yinCounter(GM); check('10 履歷 30（20 分鐘）：點完那一句不是「好，十分鐘。」',G.money===4970&&!H.has('好，十分鐘。')&&H.said.length===1,J(said())); }
  { const G=fresh('2025-10-01',12,'tz_yindehao'); G.money=5; H.picks=['印講義']; const r=await GG3.yinCounter(GM); check('10 錢不夠：店員「……那先印黑白的？」、不扣錢',r==='short'&&G.money===5&&J(said())===J([['店員',X.short]]),J(said())); } });

// ---- 11 泰米村食 ----
await sec(11,async()=>{ const X=L.tz_taimi;
  { const G=fresh('2025-10-07',12,'tz_taimi'); E.interactables=seatsOf('tz_taimi'); H.picks=['打拋豬肉飯','正常','泰式酸辣湯','泰式奶茶','點好了']; GG3.rand=()=>0; const h0=G.hour; const r=await GG3.taimiOrder(GM);
    const o=H.opts[0]; check('11 點餐：老闆娘「要吃什麼？」→ 七道（打拋午間 95）、說明當提示',H.said[0].who==='老闆娘'&&H.said[0].t===X.ask&&o.length===8&&o[0]==='打拋豬肉飯　95 元',J(o));
    check('11 打拋：辣度？→「正常」多一句；湯、奶茶不問辣度；點好了＝扣 95＋80＋50、點完一句（奶茶那句可以）、吃 30 分鐘、坐下那一句、吃的旁白照點的',r==='打拋豬肉飯、泰式酸辣湯、泰式奶茶'&&G.money===5000-225&&H.has(X.spicy.ask)&&H.has(X.spicy.more.line)&&H.said.filter(s=>s.t===X.spicy.ask).length===1&&H.has(X.after[0][1])&&near(G.hour-h0,0.5)&&[X.eat[0],X.eat[3]].includes(H.said[H.said.length-1].t)&&H.said.some(s=>s.t===X.seat.two||s.t===X.seat.four),J([G.money,said()]));
    check('11 吃過的登記（EAT：汀州路・泰米村食）',!!(G.eat&&G.eat.ate&&G.eat.ate.some(a=>a.shop==='汀州路・泰米村食'&&/打拋豬肉飯/.test(a.item))),J(G.eat)); }
  { const G=fresh('2025-10-07',18,'tz_taimi'); H.picks=['泰式椒麻雞飯','點好了']; GG3.rand=()=>0; await GG3.taimiOrder(GM);
    check('11 椒麻雞（不辣）：不問辣度；晚上打拋 110；點完不說奶茶、加蛋那兩句；沒有對得上的吃的旁白＝不說',G.money===4870&&!H.has(X.spicy.ask)&&H.opts[0][0]==='打拋豬肉飯　110 元'&&!H.has(X.after[0][1])&&!H.has(X.after[1][1])&&!X.eat.some(t=>H.has(t)),J(said())); }
  { const G=fresh('2025-10-07',18,'tz_taimi'); G.money=60; H.picks=['打拋豬肉飯','不要辣','點好了']; const r=await GG3.taimiOrder(GM); check('11 晚上錢不夠：老闆娘「……打拋豬中午比較便宜喔，九十五。」、不扣錢',r==='short'&&G.money===60&&H.said[H.said.length-1].t===X.short.line,J(said())); }
  { const G=fresh('2025-10-07',12,'tz_taimi'); G.money=60; H.picks=['打拋豬肉飯','不要辣','點好了']; const r=await GG3.taimiOrder(GM); check('11 中午錢不夠：不說那一句（只有不是中午才說）、寫「錢不夠」',r==='short'&&!H.has(X.short.line)&&toasts.includes('錢不夠'),J(said())); }
  { fresh('2025-10-07',12,'tz_taimi'); H.picks=['不用了']; const r=await GG3.taimiOrder(GM); check('11「不用了」：不扣錢',r===null&&H.G.money===5000); }
  { const G=fresh('2025-10-07',12,'tz_taimi'); H.said=[]; await STORY.onSeat(GM,{x:-2.22,z:3.6,yaw:0,table:'taimi_t1'}); const a=said(); H.said=[]; await STORY.onSeat(GM,{x:2.1,z:3,yaw:0,table:'taimi_t6'}); const b=said(); G.zone='tz_xile'; H.said=[]; await STORY.onSeat(GM,{x:0,z:0,table:'xile_t1'});
    check('11 坐下（STORY.onSeat）：兩人桌（1～5）／四人桌（6～8）那一句；洗樂的塑膠椅不說',J(a)===J([[null,X.seat.two]])&&J(b)===J([[null,X.seat.four]])&&!H.said.length,J([a,b,said()])); } });

// ---- 12 看：配置的每一個點都接上 ----
await sec(12,async()=>{ const miss=[], bad=[];
  for(const z of GG3.ZONES){ const Ly=TZ_SHOPS_LAYOUT[GG3.LAYID[z]]; for(const p of Ly.points||[]){ if(!GG3.handles(z,p.kind)){ miss.push(z+':'+p.kind); continue; } if(GG3.ACT[p.kind]) continue;
      fresh('2025-10-07',12,z); const r=await STORY.interact({tzPoint:p.id,kind:p.kind,label:p.label,look:'（暫時）'},GM); if(!(r===true&&H.said.length===1&&L[z].look[p.kind].includes(H.said[0].t))) bad.push(z+':'+p.kind+' '+J(said())); } }
  check('12 配置的互動點全部接上（AA_813 對照：櫃台、貨架、量血壓、秤重結帳、結帳、推車、洗衣機、兌幣機、列印櫃台、點餐＋各個「看」）',!miss.length,J(miss));
  check('12 每一個「看」按下去＝那一句旁白（不是暫時的「（店名）」）',!bad.length,J(bad));
  const n=GG3.ZONES.reduce((a,z)=>a+(TZ_SHOPS_LAYOUT[GG3.LAYID[z]].points||[]).length,0); check('12 六間共 '+n+' 個點（安泰 4、鮮果 4、榮恩典 6、泰米 4、洗樂 5、印得好 5）',n===28,String(n)); });

// ---- 13 約去泰米村食 ----
await sec(13,async()=>{ const G=fresh('2025-10-07',10,'campus'), P=INV.place('tz_taimi'), T=L.tz_taimi.invite;
  check('13 地點 tz_taimi：吃飯那一類、有點熟以上、坐著吃',!!P&&P.zone==='tz_taimi'&&P.kind==='meal'&&P.minStage==='FAMILIAR'&&J(INV.catsOf(P))===J(['meal'])&&P.sitAct==='eat',J(P));
  if(P){ const d=G.day, ok=(dd,h)=>INV.slotOpen(G,P,dd,h);
    check('13 午餐 11:30～13:30、晚餐 17:30～20:00（開始到結束都在裡面；坐 45 分鐘）',ok(d,11.5)&&ok(d,12.75)&&!ok(d,13)&&!ok(d,11)&&ok(d,17.5)&&ok(d,19.25)&&!ok(d,19.5)&&!ok(d,15),J([11.5,12.75,13,11,17.5,19.25,19.5,15].map(h=>ok(d,h))));
    check('13 週一（公休）不排',!ok(DK('2025-10-13'),12)&&!ok(DK('2025-10-13'),18));
    const bad=Object.keys(T.acc).filter(id=>{ const o=INV.personal(G,id,P,d+1,12,{res:'accept'}); return !(o&&J(o.lines)===J([T.acc[id]])); });
    check('13 七位答應的那一句（以安、芷若、語彤、子晴、學姊、沛珊、可昕）',Object.keys(T.acc).length===7&&!bad.length,J(bad));
    const o=INV.personal(G,'zhe',P,d+1,12,{res:'accept'}); check('13 沒列的人（阿哲）＝一般那句「泰式？好啊。我想吃打拋豬。」',o&&J(o.lines)===J([T.acc0]),J(o&&o.lines));
    const SO=INVITE_DATA.seatOpen; check('13 坐下以後的開場句兩則（泰米村食自己的）',SO.byPlace.tz_taimi==='tz_taimi'&&J(SO.tz_taimi)===J(T.seatOpen.map(t=>[t])));
    H.said=[]; const R0=Math.random; Math.random=()=>0; await INV.seatOpenLines(GM,{who:'heroine_01'},{name:'沈以安'},P); Math.random=R0; check('13 兩個人坐下：開場句一則（旁白）',J(said())===J([[null,T.seatOpen[0]]]),J(said())); } });

// ---- 14 日日定食改成泰米村食 ----
await sec(14,()=>{ const sg=rd('src/sis_grad3d.js'), st=rd('src/story3d.js');
  const NEW=[[sg,"{scene:'汀州路・泰米村食'"],[sg,"K('學姊上榜聚餐！這週五七點，汀州路的泰米村食。這次我們請學姊')"],[sg,"place:'汀州路・泰米村食',title:'學姊上榜聚餐（汀州路・泰米村食）',travel:'走過去約 20 分鐘'"],
    [st,"'學姊上榜聚餐！下週五七點，汀州路的泰米村食。全家族。'"],[st,"'汀州路的泰米村食',title:'學姊上榜聚餐',travel:curry?'約 20 分鐘':'走過去約 15 分鐘'"],[st,"['泰米村食（汀州路）','午間打拋豬肉飯（只有午餐）','95','剛好卡在一百以內。晚上一百一，不算。']"]];
  check('14 三處照 AA_742 第 ③ 節的表換字（學姊上榜聚餐場景、Kevin 群組訊息與行程、家族聚餐訊息與行程、明軒「公館一百元以內」）',NEW.every(([s,t])=>s.indexOf(t)>=0),J(NEW.filter(([s,t])=>s.indexOf(t)<0).map(x=>x[1])));
  const code=s=>s.replace(/\/\*[\s\S]*?\*\//g,'');
  check('14 舊字不在程式裡（註解以外）：公館・日日定食、公館的日日定食、日日定食那一列',!/日日定食/.test(code(sg))&&!/日日定食/.test(code(st)));
  check('14 明軒的清單（STORY.MX_FM1）第三名是泰米村食、標題「公館一百元以內」照舊',J(STORY.MX_FM1.rows[2])===J(['泰米村食（汀州路）','午間打拋豬肉飯（只有午餐）','95','剛好卡在一百以內。晚上一百一，不算。'])&&STORY.MX_FM1.title==='公館一百元以內（明軒版）');
  let d742=null; try{ d742=cp.execFileSync('git',['show',SHA+':'+P742],{cwd:ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']}); }catch(e){}
  if(d742){ const W=['汀州路・泰米村食','學姊上榜聚餐！這週五七點，汀州路的泰米村食。這次我們請學姊','走過去約 20 分鐘','學姊上榜聚餐！下週五七點，汀州路的泰米村食。全家族。','汀州路的泰米村食','走過去約 15 分鐘',"['泰米村食（汀州路）','午間打拋豬肉飯（只有午餐）','95','剛好卡在一百以內。晚上一百一，不算。']"];
    check('14 換上去的字逐字在 AA_742 第 ③ 節',W.every(t=>d742.indexOf(t)>=0),J(W.filter(t=>d742.indexOf(t)<0))); } else console.log('SKIP 14 讀不到 AA_742');
  const s={outings:[{id:'sisg_rank_dinner',place:'公館・日日定食',title:'學姊上榜聚餐（公館・日日定食）'},{id:'sis_m3_dinner',place:'公館的日日定食',title:'學姊上榜聚餐'},{id:'x',place:'溫州街・小路',title:'定食'}]};
  const n=GG3.migrate(s); check('14 舊存檔：已經排好的行程地點、標題換成泰米村食（其他「定食」不動）；再讀一次不變',n===3&&s.outings[0].place==='汀州路・泰米村食'&&s.outings[0].title==='學姊上榜聚餐（汀州路・泰米村食）'&&s.outings[1].place==='汀州路的泰米村食'&&s.outings[2].title==='定食'&&GG3.migrate(s)===0,J(s));
  check('14 讀檔（game3d.js migrate）叫 GG3.migrate',/typeof GG3!=='undefined'&&GG3\.migrate\)\{ try\{ GG3\.migrate\(s\)/.test(rd('src/game3d.js'))); });

// ---- 15 載入 ----
await sec(15,()=>{ const html=rd('index.html'), at=f=>html.indexOf('src="'+f+'?v=');
  check('15 index.html 載入資料檔、GG3（在配置、tz_shops3d、places、invites、story3d、eat3d 後面；資料檔在 GG3 前面；版本號照現有寫法）',at('src/data/gg3_shops_lines.js')>0&&at('src/gg3shops3d.js')>at('src/data/gg3_shops_lines.js')&&['src/tz_shops3d.js','src/data/places.js','src/data/invites.js','src/invites3d.js','src/story3d.js','src/eat3d.js','src/game3d.js'].every(f=>at(f)>0&&at(f)<at('src/gg3shops3d.js'))&&/src="src\/gg3shops3d\.js\?v=\d+\.\d+\.\d+"/.test(html));
  const bad=[]; for(const f of ['src/gg3shops3d.js','src/data/gg3_shops_lines.js','src/data/places.js','src/sis_grad3d.js','src/story3d.js','src/game3d.js']){ const r=cp.spawnSync(process.execPath,['--check',path.join(ROOT,f)],{encoding:'utf8'}); if(r.status!==0) bad.push(f+' '+r.stderr.slice(0,160)); }
  check('15 node --check',!bad.length,J(bad)); });

// ---- 16 子程序 A：遊戲真正的區域 ----
await sec(16,()=>{ const r=cp.spawnSync(process.execPath,[__filename,'A'],{cwd:ROOT,encoding:'utf8',maxBuffer:1<<26});
  const out=String(r.stdout||'').split('\n').filter(l=>/^(PASS|FAIL) /.test(l)); for(const l of out) console.log('  A '+l);
  check('16 子程序 A（建出六個區域）全部通過（'+out.length+' 項）',r.status===0&&out.length>=13&&!out.some(l=>/^FAIL /.test(l)),String(r.stderr||'').split('\n').slice(0,4).join(' / ')); });
H.done(); })();
}
