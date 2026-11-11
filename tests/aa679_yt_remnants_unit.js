// AA679-YT-REMNANTS-1104：AA_679（企劃線 ee055afbe，AA-C 定稿 D109）——語彤的舊設定（麵店、阿姨）全遊戲殘留的九處。不需要瀏覽器。
//   1  events.js ev_midterm_supper_y1s2：「端麵的是語彤」兩句旁白拿掉
//   2  y34b3d.js T1：私訊「明天傍晚 茶屋門口」、整組地點改一盞茶屋門口
//   3  雙主修上了的請客：從燒臘店的點餐搬到一盞茶屋點東西的那一次
//   4  feed_y1s2.js 選項「我去吃。」→「我去喝。」
//   5  RENT_CONSULTATION：面板名稱是秀琴姨（舊存檔的舊備註不顯示）
//   6  IMPORTANT_CONVERSATION：新存檔不會再記「阿姨說她帶媽媽去醫院」，舊存檔照留
//   7  noodle_table.js 大二第 6 則（語彤在櫃台後面寫作業）拿掉
//   8  privtalk3d.js PLACE_EXCEPT：一盞茶屋＋蘇姨
//   9  sup519_3d.js 2029-04-19～25 阿姨出國那一週語彤在總圖那一條拿掉
//   +  語彤的作息沒有 noodle／help；slowread3d.js 那一句只是註解
// 修改前（AA675 的 fc87997d0）：1～4、7～9 FAIL（5、6 原本就是這樣，不用改）。用法：node tests/aa679_yt_remnants_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H, J=JSON.stringify, YT='heroine_03';
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
const PG_FILES=new Set(['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js',
  'src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/data/syllabus.js','src/data/exam_bank.js','src/data/legal_qbank.js','src/classes3d.js','src/data/postgrad_lines.js','src/postgrad3d.js']);
const SKIP=new Set(['src/character3d.js','src/engine3d.js','src/townkit3d.js','src/zones3d.js','src/bike3d.js','src/adv3d.js']);
const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
const ORDER=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>f.startsWith('src/'));
for(const f of ORDER.filter(f=>!PG_FILES.has(f)&&!SKIP.has(f))){ try{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }catch(e){} }
GM.toast=()=>{}; GM.caption=()=>{}; GM.studySession=async()=>{}; GM.spawnNPC=()=>null; GM.spawnCharacter=()=>null; GM.phoneBadge=()=>{}; GM.quickGo=async()=>{}; GM.money=d=>{ H.G.money=(H.G.money|0)+d; };
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const DK=k=>STORY.dayOfKey(k);
const at=(k,h,zone)=>{ const d=typeof k==='number'?k:DK(k); H.G.day=d; H.G.hour=h; H.G.weekday=CALENDAR.dateOf(d).wd%7; if(zone) H.G.zone=zone; };
const src=f=>fs.readFileSync(path.join(H.ROOT,f),'utf8');
const strip=s=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[^:'"\\])\/\/[^\n]*/g,'$1');
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const AA679=(()=>{ try{ return cp.execFileSync('git',['-C',H.ROOT,'show','ee055afbe:docs/story_planning/AA_679_語彤舊設定_全遊戲殘留.md'],{encoding:'utf8'}); }catch(e){ return ''; } })();

(async()=>{
await sec(0,()=>{ check('0. 載得到：Y34B、WZS、FEED、PRIVTALK、SUP519、NOODLE_TABLE；AA_679 讀得到',typeof Y34B!=='undefined'&&typeof WZS!=='undefined'&&typeof FEED!=='undefined'&&typeof PRIVTALK!=='undefined'&&typeof SUP519!=='undefined'&&typeof NOODLE_TABLE!=='undefined'&&!!AA679); });

/* 1 */
await sec(1,()=>{ const L=ev('ev_midterm_supper_y1s2').dialogue;
  check('1. 考完的晚餐（公館燒臘長桌）：「（阿姨的手好了，今天端麵的還是語彤。）」「（今天端麵的是一個沒見過的女生。）」兩句拿掉',!L.some(l=>l&&/端麵/.test(String(l.text||''))),J(L.filter(l=>l&&/端麵/.test(String(l.text||''))).map(l=>l.text)));
  check('1. 其他句子照舊（Alison「今天不講考試。誰講誰請。」）',L.some(l=>l&&l.text==='今天不講考試。誰講誰請。')&&J(L[0])===J({scene:'公館燒臘・長桌',bg:'noodle_table'})); });

/* 2 */
await sec(2,()=>{
  H.fresh('2028-02-23',21.2,'dorm'); H.FRIEND(YT); Y34B.ytPhone(H.G); PHONE.tick(H.G);
  const M=(H.G.msgs||[]).filter(m=>m.th==='p:'+YT).map(m=>m.text);
  check('2. 2/23 21:00 她的私訊：「明天傍晚 茶屋門口」「我有事想問你」',J(M)===J(['明天傍晚 茶屋門口','我有事想問你']),J(M));
  const due=(zone,x,z)=>{ H.fresh('2028-02-24',17,zone); H.FRIEND(YT); H.E.player.obj.position.x=x; H.E.player.obj.position.z=z; return Y34B.t1FirstDue(H.G,H.E); };
  const D0=Y34B.t1Door();
  const r={tea:due('wenzhou',D0.x,D0.z),teaNear:due('wenzhou',D0.x+3,D0.z+2),inside:due('wz_teahouse',0,0),teaFar:due('wenzhou',D0.x+20,D0.z),oldDoor:due('gongguan',-63,21),noodle:due('noodle',0,0)};
  check('2. T1 的地點＝一盞茶屋門口（溫州街「進去一盞」那一點 6 m 內、人在一盞裡面）；公館的麵店門口、燒臘店裡都不是',r.tea&&r.teaNear&&r.inside&&!r.teaFar&&!r.oldDoor&&!r.noodle&&D0.x===-20.5&&D0.z===4.6,J(r));
  H.E.player.obj.position.x=0; H.E.player.obj.position.z=0;
  check('2. 那一組的台詞沒有「麵店」（第一次、每週、田野的發現）',['ev_yt_thursday_first','ev_yt_thursday'].every(id=>!J(ev(id).dialogue).includes('麵店')));
  check('2. 字照 AA_679（「明天傍晚 茶屋門口」）',AA679.includes('明天傍晚 茶屋門口'));
});

/* 3、4 */
await sec(3,async()=>{
  check('3. 燒臘店的點餐不再接請客（story3d.js noodleScene 沒有 FEED.ytTreatDue）',!/ytTreatDue/.test(strip(src('src/story3d.js'))));
  H.fresh('2026-07-04',14,'wz_teahouse'); H.FRIEND(YT); H.G.flags.FEED={dm:{yt_pass:'sent'},done:{},items:[]}; H.G.money=1000;
  check('3. 7/3 那則傳了以後：FEED.ytTreatDue 成立',FEED.ytTreatDue(H.G)===true);
  H.said=[]; H.picks=[0]; await WZS.interact(GM,{wzShop:'teahouse',kind:'tea'});
  const L=H.said.map(s=>(s.who?s.who+'：':'')+s.t);
  check('3. 第一次在一盞點東西：蘇姨「語彤上了！今天你的茶我請。」、這一杯不用錢、只請一次',L.includes('蘇姨：語彤上了！今天你的茶我請。')&&H.G.money===1000&&!!H.G.flags.FEED.ytTreat&&FEED.ytTreatDue(H.G)===false,J([L,H.G.money]));
  const m0=H.G.money; H.said=[]; H.picks=[0]; await WZS.interact(GM,{wzShop:'teahouse',kind:'tea'});
  check('3. 下一次照常付錢',H.G.money<m0&&!H.said.some(s=>/今天你的茶我請/.test(s.t)),J([m0,H.G.money]));
  const F=FEED_SETS_Y1S2();
  check('4. 7/3 那則的選項②：「我去喝。」→「好。週末都在。」（原本「我去吃。」）',!!F&&J(F.opts.map(o=>o.t))===J(['恭喜！','我去喝。','（不回）'])&&J(F.opts[1].r)===J(['好。週末都在。'])&&AA679.includes('「我去喝。」'),J(F&&F.opts.map(o=>o.t)));
});
function FEED_SETS_Y1S2(){ const S=typeof FEED_Y1S2!=='undefined'?FEED_Y1S2:null; const it=S&&Array.isArray(S.dms)?S.dms.find(x=>x&&x.id==='yt_pass'):null; return it&&it.ask?it.ask:null; }

/* 5、6 */
await sec(5,()=>{
  check('5. RENT_CONSULTATION 的面板名稱是秀琴姨（「聽她說陪秀琴姨去法服諮詢」）；舊存檔記的舊備註「聽她說陪阿姨去法服」不顯示（原本就是這樣，不用改）',/秀琴姨/.test(SOCIAL.MEMORY_LABEL.RENT_CONSULTATION)&&SOCIAL.noteShown(YT,{tag:'RENT_CONSULTATION',note:'聽她說陪阿姨去法服'})==='',J([SOCIAL.MEMORY_LABEL.RENT_CONSULTATION]));
  const S=strip(ORDER.concat([...PG_FILES]).filter(f=>fs.existsSync(path.join(H.ROOT,f))&&f!=='src/social3d.js').map(src).join('\n'));
  check('6. 新存檔不會再記到語彤的「阿姨說她帶媽媽去醫院」（只剩 social3d.js 舊存檔對照表的那一筆，照留）；新的 IMPORTANT_CONVERSATION 是「陪秀琴姨來法服那天」',!S.includes('阿姨說她帶媽媽去醫院')&&/IMPORTANT_CONVERSATION','陪秀琴姨來法服那天'/.test(src('src/y2b3d.js'))&&SOCIAL.noteShown(YT,{tag:'IMPORTANT_CONVERSATION',note:'阿姨說她帶媽媽去醫院'})==='阿姨扭到手腕，那週她顧店到打烊');
});

/* 7 */
await sec(7,()=>{ const all=Object.values(NOODLE_TABLE).flat();
  check('7. 長桌閒聊「語彤在櫃台後面寫作業，社會系的書攤了一桌。阿姨叫她，她頭也沒抬就站起來。」拿掉（大二剩 3 則：AA_684 第 11 項又刪了第 1、4、5 則、補一則桌遊夜版）',!all.some(e=>J(e.dialogue||[]).includes('語彤在櫃台後面寫作業'))&&NOODLE_TABLE.Y2.length===3,J(NOODLE_TABLE.Y2.length)); });

/* 8 */
await sec(8,()=>{
  H.fresh('2026-03-07',14,'wz_teahouse'); const a=PRIVTALK.placeExcept(H.G,YT); H.G.zone='noodle'; const b=PRIVTALK.placeExcept(H.G,YT); H.G.zone='wz_teahouse'; const c=PRIVTALK.placeExcept(H.G,'heroine_01');
  check('8. 私密的例外：語彤在一盞茶屋、旁邊只有蘇姨（wz_su）＝不算旁邊有人；燒臘店沒有例外、別人沒有',J(a)===J(['wz_su'])&&b===null&&c===null,J([a,b,c]));
  check('8. 合起來（清單那一筆的 except＋這個地方的）：一盞的蘇姨也算進去',J(PRIVTALK.exceptAt(H.G,{except:['hc_x']},YT))===J(['hc_x','wz_su']));
});

/* 9 */
await sec(9,()=>{
  check('9. 2029-04-19～25（燒臘店出國）語彤那一週在總圖的那一條拿掉（SUP519.SCHED_YT 是空的、作息裡沒有 aa519 那幾筆）',Array.isArray(SUP519.SCHED_YT)&&SUP519.SCHED_YT.length===0&&!CHARACTERS[YT].daily_schedule.some(e=>e&&e.aa519));
  H.fresh('2029-04-24',18,'dorm'); H.FRIEND(YT); const e=STORY.schedEnt(CHARACTERS[YT],H.G);
  check('9. 2029-04-24（二）18:00 不是「顧店的時段換總圖」那一筆',!(e&&e.aa519),J(e&&e.note));
});

/* + */
await sec(10,()=>{ const L=CHARACTERS[YT].daily_schedule;
  check('+. 語彤的作息沒有 noodle（燒臘店）、help（麵店的班）',!L.some(e=>e&&(e.zone==='noodle'||e.act==='help')));
  const S=src('src/slowread3d.js'), line=S.split('\n').find(l=>/id:'heroine_03'/.test(l))||'';
  check('+. slowread3d.js 語彤那一筆：「麵店的班（help）」只在 note 的註解字裡，沒有判斷（作息照 terms 接在最後）',/note:'AA_535 3-1：寫社會系的報告；那兩個小時是麵店的班（help）照麵店'/.test(line)&&!/act:'help'|zone:'noodle'/.test(strip(S)));
});

H.done();
})();
