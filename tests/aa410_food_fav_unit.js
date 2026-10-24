// 她們各自喜歡吃的東西（AA_410，企劃線 86016b84、第 4 節 38b3c9dd；任務 FOOD-FAV-1023；使用者 10-23 選擇題選 C）——不需要瀏覽器。
//   0  新檔載得到、index.html 接在 loans3d.js 後面；每一句台詞、旁白、筆記本那一行都在稿裡（一字不差、說話的人對）；稿第 2 節每一句都有接；不加體力（DL-02）；接線
//   1  以安（蛋包飯研究所，週五的常客）：知道以前／以後都有「也幫以安點一份」→ 品項 → 小選項（畫面一樣）；她說「只吃得下半份」＝知道＋筆記本；
//      只點品項、點錯、選對（熟悉 +2、她的戀愛 +1、REMEMBERED_HER、筆記本、吃完那一句不說、之後不再問）；交往中多一行旁白
//   2  沛珊（蛋包飯研究所，週三，到 2026-12-16）：沒有小選項；她的那一句＝知道；選對、點錯；2026-12-16 以後沒有
//   3  語彤（滇香，大二上起週一）：一起吃過一次以後、別天自己來＝老闆娘兩句（KNOW_FAV_YT、筆記本，一次）；同一天、沒一起吃過＝沒有；選對、只點、點錯；大一沒有
//   4  學姊（一一八茶飲）：選對（演過 AA_284 2-3 第 5 段＝換「又是她說的。」）、只點、點錯；H1 店員那兩句＝知道（筆記本）
//   5  子晴（兩點半 Café，她在店裡）：12～2 月看到她的杯子（一次，KNOW_FAV_ZQ、筆記本），其他月份沒有；選對、只點（熱的）、點錯（拿鐵；熱可可稿裡沒有＝不說話）；
//      沒見過、不在店裡＝沒有；芷若在班的點餐事件最後也有
//   6  可昕：學期末約會出發前一小時內，巷口茶飲「帶一杯給可昕」→ 紅茶／青茶／珍珠奶茶／冬瓜檸檬 → 無糖／半糖；約會開頭、她的第一句之前反應；
//      第一次帶有糖的青茶＝知道（KNOW_FAV_KX、筆記本）；選對；珍奶；太早、沒交往、同一趟帶過＝沒有；別的學期的約會不演
//   7  芷若照舊：「也幫芷若點一杯」選項、選對那句、REMEMBERED_HER 不變；Z3 問過她以後筆記本記第 1 節那一行
//   8  舊存檔沒有 G.fav 不壞；記憶名稱（KNOW_FAV_*、REMEMBERED_HER）
// 修改前（開發分支 c42228351）：沒有 src/foodfav3d.js、src/data/food_fav_lines.js，118 巷、Café、巷口茶飲、學期末約會都沒有接——FAILED 16（含八節都丟例外中斷；只有「前提」和「沒有這個選項」那幾項本來就成立）。用法：node tests/aa410_food_fav_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify;
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(EAT|EAT_LINES|WZS|L118|LANE118_SHOPS|LANE118_LAYOUT|FAV|FOOD_FAV_LINES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/eat_lines.js','src/eat3d.js','src/data/lane118_layout.js','src/data/lane118_shops.js','src/lane118.js','src/wzshops3d.js']) load(f);
let ok=true, err=''; try{ load('src/data/food_fav_lines.js'); load('src/foodfav3d.js'); }catch(e){ ok=false; err=String(e); }
const X=()=>typeof FAV!=='undefined'?FAV:null, FL=()=>typeof FOOD_FAV_LINES!=='undefined'?FOOD_FAV_LINES:null;
const D=k=>STORY.dayOfKey(k), keyOf=d=>CALENDAR.dateOf(d).key, td=(t,w,wd)=>STORY.termDay(t,w,wd);
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const has=t=>H.said.some(x=>x.t===t), idx=t=>H.said.findIndex(x=>x.t===t);
const said=()=>H.said.map(x=>(x.who?x.who+'：':'')+x.t);
let notes=[];
GM.addNote=(id,t,b)=>{ if(notes.some(n=>n.id===id)) return false; notes.push({id,t,b}); return true; }; GM.hasNote=id=>notes.some(n=>n.id===id);
GM.money=d=>{ H.G.money+=d; };
let T0=null;   /* 每一次點餐從同一個時間開始（點完時間會往前走 40 分鐘，常客的時段就過了）*/
const fresh=(d,h,zone,flags)=>{ const G=H.fresh(keyOf(d),h,zone,Object.assign({EXCHANGE_ROUTE:'TW'},flags||{})); G.outings=[]; G.notes=[]; notes=[]; T0={day:d,hour:h,weekday:G.weekday}; return G; };
const back=()=>{ if(T0) Object.assign(H.G,T0); };
const here=id=>{ const n={name:SOCIAL.displayName(id),charId:id,obj:{position:{x:0,y:0,z:0}}}; GM.npc[id]=n; E.npcs.push(n); return n; };
const met=id=>{ SOCIAL.remember(id,'FIRST_MET',''); };
const rel=id=>{ const r=SOCIAL.rel(id); return {fam:r.fam|0,npcRom:r.npcRom|0}; };
const order=async(shop,picks)=>{ back(); H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); return L118.order(GM,shop); };
const noteOf=id=>(notes.find(n=>n.id==='fav_'+id)||{}).t||null;
const L=id=>FL()[id];
const T=a=>(a||[]).map(x=>x[1]);
const seq=a=>a.every((t,i)=>idx(t)>=0&&(i===0||idx(t)>idx(a[i-1])));

(async()=>{
let doc=''; try{ doc=cp.execSync('git show 38b3c9dd:"docs/story_planning/AA_410_女主角各自喜歡吃的東西.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ doc=''; }   /* 38b3c9dd＝86016b84＋第 4 節補充（缺字、記憶名稱）*/
/* ---- 0 ---- */
await sec(0,()=>{ const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
  check('0. 新檔載得到；index.html：loans3d.js → data/food_fav_lines.js → foodfav3d.js → GAME.boot()',ok&&!!X()&&!!FL()&&/loans3d\.js\?v=[^"]+"><\/script>\n<script src="src\/data\/food_fav_lines\.js\?v=[^"]+"><\/script>\n<script src="src\/foodfav3d\.js\?v=[^"]+"><\/script>\n(?:<script src="[^"]+"><\/script>\n)*<script>GAME\.boot\(\);/.test(html),err);
  const S4=(doc.split('## 4.')[1]||''), secOf=n=>S4.split('\n- **').filter(x=>x.startsWith(n==='書瑀'?'學姊':n)).join('\n');   /* 第 4 節 4-1：「- **子晴點錯**」那一條底下的字 */
  const WHO={heroine_01:'以安',heroine_03:'語彤',heroine_04:'子晴',heroine_05:'書瑀',classmate_peishan:'沛珊',kexin:'可昕','老闆娘':'老闆娘'};
  const bad=[], all=[]; for(const id of ['heroine_01','heroine_03','heroine_04','heroine_05','classmate_peishan','kexin']){ const o=L(id); for(const k in o){ const v=o[k]; const arrs=k==='wrong'?Object.values(v):[v]; for(const a of arrs){ if(!a) continue; for(const [w,t] of a){ all.push(t); const want=w==null?t:WHO[w]+'：'+t; if(doc.indexOf(want)<0&&!(w!=null&&secOf(WHO[w]).indexOf('「'+t+'」')>=0)) bad.push(want); } } } }   /* 第 4 節的缺字寫成「……」，列在那個人的條目下（secOf）*/
  check('0. 每一句台詞、旁白都在 AA_410 稿裡（一字不差，說話的人對：以安／語彤／子晴／書瑀／沛珊／可昕／老闆娘／旁白）',!!doc&&all.length>=30&&!bad.length,all.length+' '+J(bad));
  const nb=Object.values(FL().note).filter(t=>doc.indexOf('| '+t+' |')<0);
  check('0. 筆記本那一行七個人都照第 1 節總表最後一欄',!!doc&&Object.keys(FL().note).length===7&&!nb.length,J(nb));
  /* 稿第 2 節每一句（> 某某：……、旁白、交往中那一行）都有接 */
  const s2=doc.slice(doc.indexOf('## 2.'),doc.indexOf('## 3.')), want=[]; for(const m of s2.matchAll(/^\s*>\s*([^：\n]+)：(.+)$/mg)) want.push(m[2].trim()); for(const m of s2.matchAll(/旁白「(（[^」]+）)」/g)) want.push(m[1]);
  const joined=all.join('\n'), miss=want.filter(t=>joined.indexOf(t)<0&&!(t==='……嗯，謝謝。（她跟老闆娘要了一小碟辣椒。）'&&all.includes('……嗯，謝謝。')&&all.includes('（她跟老闆娘要了一小碟辣椒。）')));
  check('0. 稿第 2 節的每一句都在資料裡（語彤「只點」那一行拆成她一句＋括號的旁白）',want.length>=30&&!miss.length,want.length+' '+J(miss));
  const src=fs.readFileSync(path.join(H.ROOT,'src/foodfav3d.js'),'utf8').replace(/\/\*[\s\S]*?\*\//g,'');
  check('0. 不加體力、不做短效加成（DL-02）：foodfav3d.js 沒有 energy',!/energy/.test(src));
  const R=f=>fs.readFileSync(path.join(H.ROOT,f),'utf8');
  check('0. 接線：118 巷 order（FAV.l118、FAV.heard、H1 之後 FAV.sync）、Café counter（FAV.cafe）、芷若點餐事件 after_treat（{call}）、巷口茶飲（FAV.wzTea）、可昕學期末約會（FAV.kexinDate）、events3d.js 的 call、學姊第 5 段（SISG_SEG5）',
    /FAV\.l118\(GM,shopId,comp\)/.test(R('src/lane118.js'))&&/FAV\.heard\(GM,id,shopId\)/.test(R('src/lane118.js'))&&/playH1\(GM,clerk\); if\(typeof FAV!=='undefined'&&FAV\.sync\)/.test(R('src/lane118.js'))
    &&/shop==='兩點半 Café'&&typeof FAV!=='undefined'&&FAV\.cafe\) await FAV\.cafe\(GM\)/.test(R('src/story3d.js'))&&/\{label:'after_treat'\},\{call:\(G,GM\)=>typeof FAV!=='undefined'&&FAV\.cafe\?FAV\.cafe\(GM\):null\}/.test(R('src/data/events.js'))
    &&/k==='tea'&&typeof FAV!=='undefined'&&FAV\.wzTea/.test(R('src/wzshops3d.js'))&&/FAV\.kexinDate\(GM,te/.test(R('src/termend3d.js'))&&/typeof l\.call==='function'/.test(R('src/events3d.js'))&&/q\.k===5\)\{ G\.flags\.SISG_SEG5=G\.day/.test(R('src/sis_grad3d.js'))); });

/* ---- 1 以安 ---- */
await sec(1,async()=>{ const AN='heroine_01', fri=td('Y1S1',5,5); const setup=f=>{ fresh(fri,12.5,'l118_omu',f); met(AN); here(AN); };
  setup(); check('1. 前提：週五 12:30 以安是蛋包飯研究所的常客、一起進來',L118.companions(GM,'omu').includes(AN));
  /* 知道以前：照樣可以點（靠猜）；她吃完的那一句＝知道 */
  let m0=H.G.money; await order('omu',['咖哩蛋包飯','（就這樣）']);
  check('1. 知道以前：點完自己的，多一個「也幫以安點一份」「（就這樣）」',J(H.opts[1])===J(['也幫以安點一份','（就這樣）'])&&H.G.money===m0-120,J(H.opts));
  check('1. 她吃完那一句「這間的咖哩，我只吃得下半份。」＝知道；筆記本記「以安：咖哩蛋包飯。她只吃得下半份，多要一個盤子。」',has('這間的咖哩，我只吃得下半份。')&&X().know(H.G,AN)&&noteOf(AN)==='以安：咖哩蛋包飯。她只吃得下半份，多要一個盤子。',J(notes));
  /* 知道以後：一樣的選項；小選項的畫面兩個品項都一樣 */
  const r0=rel(AN); m0=H.G.money; await order('omu',['番茄醬蛋包飯','也幫以安點一份','咖哩蛋包飯','不用']);
  check('1. 知道以後：「也幫以安點一份」→ 品項（咖哩蛋包飯 120／番茄醬蛋包飯 110）→「多要一個盤子」「不用」',J(H.opts.slice(1,4))===J([['也幫以安點一份','（就這樣）'],['咖哩蛋包飯　120 元','番茄醬蛋包飯　110 元'],['多要一個盤子','不用']]),J(H.opts));
  check('1. 只點咖哩蛋包飯、沒要盤子：「（看了一下盤子）……我吃不完。你要幫我吃。」；不加分、沒有 REMEMBERED_HER_FOOD；錢照兩份扣',has('（看了一下盤子）……我吃不完。你要幫我吃。')&&J(rel(AN))===J(r0)&&!SOCIAL.has(AN,'REMEMBERED_HER_FOOD')&&H.G.money===m0-110-120,J({s:said(),m:[m0,H.G.money]}));
  await order('omu',['咖哩蛋包飯','也幫以安點一份','番茄醬蛋包飯','多要一個盤子']);
  check('1. 點錯（番茄醬的）：小選項照樣出現；「番茄醬的。……好，我吃吃看。」；不扣分、下次還能點',J(H.opts[3])===J(['多要一個盤子','不用'])&&has('番茄醬的。……好，我吃吃看。')&&J(rel(AN))===J(r0)&&!X().right(H.G,AN),J(said()));
  await order('omu',['咖哩蛋包飯','也幫以安點一份','咖哩蛋包飯','多要一個盤子']); const r1=rel(AN);
  check('1. 選對：「……你記得。」「那這一半給你。不准說吃不下。」；熟悉 +2、她的戀愛 +1、REMEMBERED_HER_FOOD（吃的，AA_410 第 4 節）',seq(T(L(AN).right))&&r1.fam===r0.fam+2&&r1.npcRom===r0.npcRom+1&&SOCIAL.has(AN,'REMEMBERED_HER_FOOD')&&!SOCIAL.has(AN,'REMEMBERED_HER'),J({s:said(),r0,r1}));
  check('1. 選對的那一次：吃完那一句（只吃得下半份）不說；沒交往＝沒有交往中那一行旁白',!has('這間的咖哩，我只吃得下半份。')&&!has(L(AN).rightDating[0][1]),J(said()));
  await order('omu',['咖哩蛋包飯']); check('1. 選對以後不再問',!H.opts.some(o=>o.includes('也幫以安點一份'))&&has('這間的咖哩，我只吃得下半份。'),J(H.opts));
  { const mem=SOCIAL.memories(AN).filter(m=>m.tag==='REMEMBERED_HER_FOOD'), ra=rel(AN), again=X().gotRight(GM,AN,'咖哩蛋包飯',0);
    check('1. 每人一次：再算一次選對不加分、REMEMBERED_HER_FOOD 只一筆；G.fav.right 另外記一份（記憶超過 80 筆被擠掉也不會再問）',mem.length===1&&!again&&J(rel(AN))===J(ra)&&SOCIAL.memories(AN).filter(m=>m.tag==='REMEMBERED_HER_FOOD').length===1&&X().rec(H.G).right[AN]!=null); }
  setup({dating_heroine_01:true}); await order('omu',['咖哩蛋包飯','也幫以安點一份','咖哩蛋包飯','多要一個盤子']);
  check('1. 交往中：選對以後多一行旁白「（她把一半撥到空盤子上，推過來的時候，順手把湯匙也放好。）」',seq(T(L(AN).right).concat(T(L(AN).rightDating))),J(said()));
  setup(); H.G.day=td('Y1S1',5,4); H.G.weekday=4; check('1. 週四她不在蛋包飯研究所＝沒有這個選項',!L118.companions(GM,'omu').includes(AN)); });

/* ---- 2 沛珊 ---- */
await sec(2,async()=>{ const PS='classmate_peishan', wed=td('Y1S1',5,3); const setup=()=>{ fresh(wed,12.5,'l118_omu'); met(PS); here(PS); };
  setup(); await order('omu',['咖哩蛋包飯','也幫沛珊點一份','咖哩蛋包飯']);
  check('2. 沛珊（週三）：「也幫沛珊點一份」→ 品項，沒有小選項',J(H.opts.slice(1))===J([['也幫沛珊點一份','（就這樣）'],['咖哩蛋包飯　120 元','番茄醬蛋包飯　110 元']]),J(H.opts));
  check('2. 點錯（咖哩的）：「咖哩的？……好，今天換一次。」「（吃了兩口）……下次還是番茄醬。」；她吃完的那一句「我每次都點一樣的。……你們不要笑。」＝知道＋筆記本',seq(T(L(PS).wrong['咖哩蛋包飯']))&&has('我每次都點一樣的。……你們不要笑。')&&X().know(H.G,PS)&&noteOf(PS)==='沛珊：番茄醬蛋包飯。她每次都點一樣的。',J({s:said(),notes}));
  const r0=rel(PS); await order('omu',['咖哩蛋包飯','也幫沛珊點一份','番茄醬蛋包飯']); const r1=rel(PS);
  check('2. 選對：「你幫我點好了？」「……番茄醬的。嗯。不要笑。」；熟悉 +2、她的戀愛 +1、REMEMBERED_HER_FOOD；吃完那一句不說',seq(T(L(PS).right))&&r1.fam===r0.fam+2&&r1.npcRom===r0.npcRom+1&&SOCIAL.has(PS,'REMEMBERED_HER_FOOD')&&!has('我每次都點一樣的。……你們不要笑。'),J({s:said(),r0,r1}));
  const late=td('Y2S2',3,3); fresh(late,12.5,'l118_omu'); met(PS); here(PS); await order('omu',['咖哩蛋包飯']);
  check('2. 2026-12-16 以後（'+keyOf(late)+'）她不在蛋包飯研究所＝沒有「也幫沛珊點一份」',late>D('2026-12-16')&&!L118.companions(GM,'omu').includes(PS)&&!H.opts.some(o=>o.includes('也幫沛珊')),J(H.opts)); });

/* ---- 3 語彤 ---- */
await sec(3,async()=>{ const YT='heroine_03', mon=td('Y2S1',3,1), tue=td('Y2S1',3,2);
  fresh(tue,12.5,'l118_dian'); met(YT); await order('dian',['酸辣河粉']); check('3. 沒和她在滇香一起吃過：自己來沒有老闆娘那兩句',!has(L(YT).know[0][1])&&!X().know(H.G,YT),J(said()));
  fresh(mon,12.5,'l118_dian'); met(YT); here(YT); check('3. 前提：大二上週一 12:30 語彤是滇香的常客',L118.companions(GM,'dian').includes(YT));
  await order('dian',['椒麻雞飯','也幫語彤點一份','酸辣河粉','不加']);
  check('3. 「也幫語彤點一份」→ 椒麻雞飯／酸辣河粉／打拋豬飯 →「多加辣」「不加」；只點酸辣河粉：「……嗯，謝謝。」「（她跟老闆娘要了一小碟辣椒。）」',J(H.opts.slice(1,4))===J([['也幫語彤點一份','（就這樣）'],['椒麻雞飯　110 元','酸辣河粉　100 元','打拋豬飯　105 元'],['多加辣','不加']])&&seq(T(L(YT).itemOnly)),J({o:H.opts,s:said()}));
  delete GM.npc[YT]; E.npcs=[]; T0.hour=13.5; await order('dian',['椒麻雞飯']); check('3. 同一天再自己來：沒有老闆娘那兩句',!has(L(YT).know[0][1]));
  Object.assign(T0,{day:tue,weekday:2,hour:12.5}); await order('dian',['椒麻雞飯']);
  check('3. 一起吃過以後、別天自己來：老闆娘「那個社會系的妹妹，每次都叫我多放辣。」「看不出來吧。」→ KNOW_FAV_YT、筆記本「語彤：滇香的酸辣河粉，多加辣。看不出來。」',seq(T(L(YT).know))&&H.said.find(x=>x.t===L(YT).know[0][1]).who==='老闆娘'&&SOCIAL.has(YT,'KNOW_FAV_YT')&&noteOf(YT)==='語彤：滇香的酸辣河粉，多加辣。看不出來。',J({s:said(),notes}));
  Object.assign(T0,{day:tue+1,weekday:3}); await order('dian',['椒麻雞飯']); check('3. 只說一次',!has(L(YT).know[0][1]));
  fresh(mon+7,12.5,'l118_dian'); met(YT); here(YT); await order('dian',['椒麻雞飯','也幫語彤點一份','打拋豬飯','多加辣']);
  check('3. 點錯：「謝謝。……我吃這個也可以。」',has('謝謝。……我吃這個也可以。'),J(said()));
  const r0=rel(YT); await order('dian',['椒麻雞飯','也幫語彤點一份','酸辣河粉','多加辣']); const r1=rel(YT);
  check('3. 選對：「……嗯。」「我們家的不敢做這麼辣。阿姨說客人會跑掉。」；熟悉 +2、她的戀愛 +1、REMEMBERED_HER_FOOD；吃完那一句不說',seq(T(L(YT).right))&&r1.fam===r0.fam+2&&r1.npcRom===r0.npcRom+1&&SOCIAL.has(YT,'REMEMBERED_HER_FOOD')&&!has('下午我回社會系館。……這間比我們家的辣。'),J({s:said(),r0,r1}));
  fresh(td('Y1S1',5,1),12.5,'l118_dian'); met(YT); here(YT); check('3. 大一週一：她不是滇香的常客＝沒有',!L118.companions(GM,'dian').includes(YT)); });

/* ---- 4 學姊 ---- */
await sec(4,async()=>{ const SIS='heroine_05', tu=td('Y1S1',5,2); const setup=f=>{ fresh(tu,12.55,'lane118',f); met(SIS); here(SIS); };
  setup(); check('4. 前提：大一上平日 12:33 學姊在一一八茶飲',L118.companions(GM,'tea').includes(SIS));
  await order('tea',['檸檬綠','也幫學姊點一杯','無糖綠茶','正常冰']);
  check('4. 「也幫學姊點一杯」→ 紅茶拿鐵／檸檬綠／無糖綠茶 →「去冰」「正常冰」；只點：「謝謝。……冰塊我等一下倒掉。」',J(H.opts.slice(1,4))===J([['也幫學姊點一杯','（就這樣）'],['紅茶拿鐵　50 元','檸檬綠　45 元','無糖綠茶　30 元'],['去冰','正常冰']])&&has('謝謝。……冰塊我等一下倒掉。'),J({o:H.opts,s:said()}));
  await order('tea',['檸檬綠','也幫學姊點一杯','紅茶拿鐵','去冰']); check('4. 點錯：「謝謝。我喝。」',has('謝謝。我喝。'),J(said()));
  const r0=rel(SIS); await order('tea',['檸檬綠','也幫學姊點一杯','無糖綠茶','去冰']); const r1=rel(SIS);
  check('4. 選對：「……誰跟你說的。」「她記性比我好。……謝謝。」；熟悉 +2、她的戀愛 +1、REMEMBERED_HER',seq(T(L(SIS).right))&&r1.fam===r0.fam+2&&r1.npcRom===r0.npcRom+1&&SOCIAL.has(SIS,'REMEMBERED_HER'),J({s:said(),r0,r1}));
  setup({SISG_SEG5:tu-3,SIS_TEA_ORDER:tu-3}); await order('tea',['檸檬綠','也幫學姊點一杯','無糖綠茶','去冰']);
  check('4. 演過 AA_284 2-3 第 5 段：選對換「又是她說的。」「……好。下次換我。」',seq(T(L(SIS).rightAgain))&&!has('……誰跟你說的。'),J(said()));
  setup(); await order('tea',['檸檬綠','也幫學姊點一杯','無糖綠茶','去冰']);
  check('4. 沒聽過 H1（沒有 SIS_TEA_ORDER）就猜對：「……你怎麼知道。」「我沒跟你說過吧。」「（她喝了一口，沒有再問。）」（AA_410 第 4 節）；照樣加分',seq(T(L(SIS).rightGuess))&&!has('……誰跟你說的。')&&SOCIAL.has(SIS,'REMEMBERED_HER'),J(said()));
  /* H1：她 12:40 走了，12:41 點飲料＝店員那兩句＝知道 */
  fresh(tu,12+41/60,'lane118'); met(SIS); H.G.flags.met_sis=true; await order('tea',['檸檬綠']);
  check('4. AA_311 H1 店員「她每天這個時間來。無糖綠茶，去冰。從來沒換過。」＝知道（SIS_TEA_ORDER）；筆記本「學姊：無糖綠茶，去冰。從來沒換過。」',has('她每天這個時間來。無糖綠茶，去冰。從來沒換過。')&&!!H.G.flags.SIS_TEA_ORDER&&X().know(H.G,SIS)&&noteOf(SIS)==='學姊：無糖綠茶，去冰。從來沒換過。',J({s:said(),notes})); });

/* ---- 5 子晴 ---- */
await sec(5,async()=>{ const ZQ='heroine_04', oct=D('2025-10-15'), dec=D('2025-12-03');
  const cafe=async(picks)=>{ H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); return STORY.interact({counter:'cafe'},GM); };
  const setup=(d,f)=>{ fresh(d,20.5,'cafe',f); met(ZQ); met('heroine_02'); here(ZQ); };
  setup(oct); await cafe(['拿鐵','也幫子晴點一杯','美式','熱的']);
  check('5. 她在 Café：點完自己的「也幫子晴點一杯」→ 拿鐵／美式／熱可可／紅茶（照芷若那一杯 120）／手沖 150（AA_410 第 4 節）→「冰的」「熱的」',J(H.opts.slice(1,4))===J([['也幫子晴點一杯','（就這樣）'],['拿鐵　120 元','美式　120 元','熱可可　120 元','紅茶　120 元','手沖　150 元'],['冰的','熱的']]),J(H.opts));
  check('5. 十月：沒有看杯子那一句、還不知道；只點美式、熱的：「熱的？……好啦。我等它涼。」',!has(L(ZQ).know[0][1])&&!X().know(H.G,ZQ)&&has('熱的？……好啦。我等它涼。'),J(said()));
  await cafe(['拿鐵','也幫子晴點一杯','拿鐵','冰的']); check('5. 點錯（拿鐵）：「拿鐵？……好啦，我也喝。」',has('拿鐵？……好啦，我也喝。'),J(said()));
  const r0=rel(ZQ), m0=H.G.money; await cafe(['拿鐵','也幫子晴點一杯','熱可可','冰的']);
  check('5. 點錯熱可可：「熱可可是芷若在喝的。……好啦，我也喝。」（AA_410 第 4 節）；不扣分；錢照扣',seq(T(L(ZQ).wrong['熱可可']))&&J(rel(ZQ))===J(r0)&&H.G.money===m0-120-120,J({s:said(),m:[m0,H.G.money]}));
  await cafe(['拿鐵','也幫子晴點一杯','紅茶','冰的']); check('5. 點錯紅茶：「紅茶。……可以。」',seq(T(L(ZQ).wrong['紅茶'])),J(said()));
  { const m1=H.G.money; await cafe(['拿鐵','也幫子晴點一杯','手沖','冰的']); check('5. 點錯手沖：「手沖？你很捨得欸。……謝謝。」；錢照 150 扣',seq(T(L(ZQ).wrong['手沖']))&&H.G.money===m1-120-150,J({s:said(),m:[m1,H.G.money]})); }
  setup(dec); await cafe(['拿鐵','（就這樣）']);
  check('5. 12 月：她在店裡＝「（外面很冷。她的美式裡還是一大堆冰塊。）」（一次）→ KNOW_FAV_ZQ、筆記本「子晴：美式，冰的。十二月也是。」',has('（外面很冷。她的美式裡還是一大堆冰塊。）')&&SOCIAL.has(ZQ,'KNOW_FAV_ZQ')&&noteOf(ZQ)==='子晴：美式，冰的。十二月也是。'&&J(H.opts[1])===J(['也幫子晴點一杯','（就這樣）']),J({s:said(),notes}));
  await cafe(['拿鐵','（就這樣）']); check('5. 看杯子只一次',!has('（外面很冷。她的美式裡還是一大堆冰塊。）'));
  const r1=rel(ZQ); await cafe(['拿鐵','也幫子晴點一杯','美式','冰的']); const r2=rel(ZQ);
  check('5. 選對：「你知道喔。」「……十二月也是冰的。不要問。」；熟悉 +2、她的戀愛 +1、REMEMBERED_HER；之後不再問',seq(T(L(ZQ).right))&&r2.fam===r1.fam+2&&r2.npcRom===r1.npcRom+1&&SOCIAL.has(ZQ,'REMEMBERED_HER')&&(await cafe(['拿鐵']),!H.opts.some(o=>o.includes('也幫子晴點一杯'))),J({s:said(),r1,r2}));
  setup(D('2026-02-10')); check('5. 2 月也看得到（12～2 月）',X().winter(H.G)&&!X().winter(Object.assign({},H.G,{day:D('2026-03-02')}))&&!X().winter(Object.assign({},H.G,{day:D('2025-11-28')})));
  fresh(dec,20.5,'cafe'); met('heroine_02'); here(ZQ); await cafe(['拿鐵']); check('5. 還沒見過子晴：沒有',!has('（外面很冷。她的美式裡還是一大堆冰塊。）')&&!H.opts.some(o=>o.includes('也幫子晴')),J(H.opts));
  fresh(dec,20.5,'cafe'); met(ZQ); met('heroine_02'); await cafe(['拿鐵']); check('5. 她不在店裡：沒有',!H.opts.some(o=>o.includes('也幫子晴'))&&!has('（外面很冷。她的美式裡還是一大堆冰塊。）'));
  /* 芷若在班的點餐事件最後 */
  const bar=STORY_EVENTS.find(e=>e.id==='ev_cafe_barista_zhiruo'); setup(oct,{CAFE_VISITS:6,zhiruoFirstOrder:'拿鐵'}); GM.npc.heroine_02={charId:'heroine_02',name:'林芷若',staff:'cafe',obj:{position:{x:0,y:0,z:0}}};
  H.said=[]; H.opts=[]; H.picks=['也幫子晴點一杯','紅茶','熱的']; await EVENTS.run(bar);
  check('5. 芷若在班（她的點餐事件）：最後也有「也幫子晴點一杯」，之後芷若「杯子放著就好，慢慢來。」',J(H.opts[0])===J(['也幫子晴點一杯','（就這樣）'])&&idx('杯子放著就好，慢慢來。')>=0,J({o:H.opts,s:said()})); });

/* ---- 6 可昕 ---- */
await sec(6,async()=>{ const KX='kexin', d=td('Y2S1',17,4);
  const plan=()=>OUT.plan(H.G,{id:'te_kx_Y2S1',ev:'ev_termend_dinner',day:d,h:18,late:0.25,place:'政大正門',title:'和可昕的學期末約會（政大正門）',travel:'開車約 40 分鐘',travelH:2/3,te:{term:'Y2S1',who:KX,kind:'kexin'}});
  const setup=(h,f)=>{ fresh(d,h,'wenzhou',Object.assign({dating_kexin:true},f||{})); plan(); };
  const tea=async(picks)=>{ H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); return WZS.order364(GM,'tea'); };
  const date=async(term)=>{ H.said=[]; H.opts=[]; H.picks=[]; return TERMEND.kexinDinner(GM,{term:term||'Y2S1',who:KX,kind:'kexin'}); };
  setup(16.2); await tea(['紅茶']); check('6. 出發（17:20）前一小時以前（16:12）：巷口茶飲沒有「帶一杯給可昕」',!H.opts.some(o=>o.includes('帶一杯給可昕')),J(H.opts));
  setup(16.5); let m0=H.G.money; await tea(['紅茶','帶一杯給可昕','青茶','半糖']);
  check('6. 出發前一小時內（16:30）：點完自己的「帶一杯給可昕」→ 紅茶／青茶／珍珠奶茶／冬瓜檸檬 →「無糖」「半糖」；錢照扣',J(H.opts.slice(1,4))===J([['帶一杯給可昕','（就這樣）'],['紅茶　30 元','青茶　30 元','珍珠奶茶　55 元','冬瓜檸檬　45 元'],['無糖','半糖']])&&H.G.money===m0-60,J(H.opts));
  check('6. 當場她不在：沒有反應（約會開頭才演）',!H.said.some(x=>x.who===SOCIAL.displayName(KX)));
  H.G.hour=16.6; await tea(['紅茶']); check('6. 同一趟已經帶了一杯：不再問',!H.opts.some(o=>o.includes('帶一杯給可昕')));
  const r0=rel(KX); await date();
  const PL=TERMEND_LINES.KX_PLACE.nccu, first=TERMEND_LINES.KX.Y2S1.table[0];
  check('6. 第一次帶有糖的青茶：約會開頭（「'+PL.open+'」之後、她的第一句之前）「……有糖。」「我只喝無糖的。你下次記得。」→ KNOW_FAV_KX、筆記本「可昕：青茶，無糖。她只喝無糖的。」；不加分',seq([PL.open].concat(T(L(KX).know),[first]))&&SOCIAL.has(KX,'KNOW_FAV_KX')&&noteOf(KX)==='可昕：青茶，無糖。她只喝無糖的。'&&J(rel(KX))===J(r0),J({s:said(),notes}));
  await date(); check('6. 那一杯演過了：下一次約會開頭沒有',!has('……有糖。'));
  setup(16.5); await tea(['紅茶','帶一杯給可昕','珍珠奶茶','無糖']); await date();
  check('6. 珍奶：「珍奶。……你是故意的吧。」「（她還是插了吸管。）」（不扣分）',seq(T(L(KX).wrong['珍珠奶茶']))&&!X().right(H.G,KX),J(said()));
  setup(16.5); SOCIAL.remember(KX,'KNOW_FAV_KX',''); await tea(['紅茶','帶一杯給可昕','冬瓜檸檬','半糖']); await date();
  check('6. 冬瓜檸檬：「冬瓜檸檬？這個甜死了。」「（她還是喝了半杯。）」（AA_410 第 4 節；開頭旁白之後、她的第一句之前）',H.said[0].t===PL.open&&seq(T(L(KX).wrong['冬瓜檸檬']))&&H.said[3].t===first,J(said()));
  setup(16.5); SOCIAL.remember(KX,'KNOW_FAV_KX',''); await tea(['紅茶','帶一杯給可昕','紅茶','無糖']); await date();
  check('6. 紅茶：「紅茶。……也可以。」',seq(T(L(KX).wrong['紅茶'])),J(said()));
  setup(16.5); SOCIAL.remember(KX,'KNOW_FAV_KX',''); await tea(['紅茶','帶一杯給可昕','青茶','半糖']); await date();
  check('6. 已經知道以後又帶半糖：「半糖？……你上次明明知道。」（不扣分、不加分）',seq(T(L(KX).itemOnly))&&!X().right(H.G,KX),J(said()));
  setup(16.5); const r1=rel(KX); await tea(['紅茶','帶一杯給可昕','青茶','無糖']);
  const kept=X().rec(H.G).kx; await date('Y2S2'); check('6. 別的學期的約會：那一杯不演',!has('無糖。……你記得。')); X().rec(H.G).kx=kept;
  await date(); const r2=rel(KX);
  check('6. 選對（青茶＋無糖）：「無糖。……你記得。」「我以為你只記得考試的東西。」；熟悉 +2、她的戀愛 +1、REMEMBERED_HER；筆記本',seq(T(L(KX).right))&&r2.fam===r1.fam+2&&r2.npcRom===r1.npcRom+1&&SOCIAL.has(KX,'REMEMBERED_HER')&&noteOf(KX)==='可昕：青茶，無糖。她只喝無糖的。',J({s:said(),r1,r2}));
  setup(16.5); SOCIAL.remember(KX,'REMEMBERED_HER',''); await tea(['紅茶']); check('6. 選對以後不再問',!H.opts.some(o=>o.includes('帶一杯給可昕')));
  fresh(d,16.5,'wenzhou'); plan(); await tea(['紅茶']); check('6. 沒有在交往：沒有',!H.opts.some(o=>o.includes('帶一杯給可昕')));
  fresh(d,16.5,'wenzhou',{dating_kexin:true}); await tea(['紅茶']); check('6. 沒有排學期末約會：沒有',!H.opts.some(o=>o.includes('帶一杯給可昕'))); });

/* ---- 7 芷若照舊 ---- */
await sec(7,async()=>{ const ZR='heroine_02', bar=STORY_EVENTS.find(e=>e.id==='ev_cafe_barista_zhiruo'), d=D('2026-03-18');
  fresh(d,15,'cafe',{CAFE_VISITS:6,zhiruoFirstOrder:'拿鐵'}); met(ZR); GM.npc[ZR]={charId:ZR,name:'林芷若',staff:'cafe',obj:{position:{x:0,y:0,z:0}}};
  H.said=[]; H.opts=[]; await EVENTS.run(bar); check('7. 還沒問過她：沒有「也幫芷若點一杯」、筆記本沒有她那一行',!H.opts.some(o=>o.includes('也幫芷若點一杯'))&&(X().sync(GM),!noteOf(ZR)),J(H.opts));
  SOCIAL.remember(ZR,'ASKED_HER_DRINK','她下班前'); X().sync(GM);
  check('7. Z3 問過她以後：筆記本記「芷若：熱可可，加一份濃縮。」',noteOf(ZR)==='芷若：熱可可，加一份濃縮。',J(notes));
  const dl=(a,b)=>J({fam:b.fam-a.fam,npcRom:b.npcRom-a.npcRom});
  let r0=rel(ZR); H.said=[]; H.opts=[]; H.picks=['（就這樣）']; await EVENTS.run(bar); const plain=dl(r0,rel(ZR));
  r0=rel(ZR); H.said=[]; H.opts=[]; H.picks=['也幫芷若點一杯','熱可可','加一份濃縮']; await EVENTS.run(bar); const r1=rel(ZR);
  check('7. 照舊：「也幫芷若點一杯」→ 拿鐵／美式／熱可可／紅茶 →「加一份濃縮」「不加」；選對「……你記得。」＋REMEMBERED_HER；關係照原本的程式（和沒幫她點那一次一樣，不另外加）',J(H.opts.slice(0,3))===J([['也幫芷若點一杯','（就這樣）'],['拿鐵','美式','熱可可','紅茶'],['加一份濃縮','不加']])&&has('……你記得。')&&SOCIAL.has(ZR,'REMEMBERED_HER')&&dl(r0,r1)===plain,J({o:H.opts,plain,treat:dl(r0,r1)})); });

/* ---- 8 舊存檔、記憶名稱 ---- */
await sec(8,()=>{ fresh(td('Y1S2',3,2),12,'lane118',{SIS_TEA_ORDER:true}); delete H.G.fav;
  const n=X().sync(GM); check('8. 舊存檔沒有 G.fav：不壞；已經有 SIS_TEA_ORDER＝補筆記本那一行（STORY.TICKS）',n===1&&!!H.G.fav&&noteOf('heroine_05')==='學姊：無糖綠茶，去冰。從來沒換過。'&&STORY.TICKS.some(f=>/S\.sync\(GM\)/.test(String(f))),J({n,notes}));
  check('8. 記憶名稱：KNOW_FAV_YT／ZQ／KX、REMEMBERED_HER、REMEMBERED_HER_FOOD「記得她點什麼」都有中文',SOCIAL.MEMORY_LABEL.REMEMBERED_HER_FOOD==='記得她點什麼'&&['KNOW_FAV_YT','KNOW_FAV_ZQ','KNOW_FAV_KX','REMEMBERED_HER','REMEMBERED_HER_FOOD'].every(t=>!!SOCIAL.MEMORY_LABEL[t]),J(['KNOW_FAV_YT','KNOW_FAV_ZQ','KNOW_FAV_KX'].map(t=>SOCIAL.MEMORY_LABEL[t]))); });
H.done();
})();
