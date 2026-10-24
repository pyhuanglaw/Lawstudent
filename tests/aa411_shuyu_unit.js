// 交往中叫「書瑀」：祐廷的句子、選項與畫面標題（AA_411，企劃線 38352ab3；SIS-SHUYU-1017 收尾／USER_WANTS C15）——不需要瀏覽器。
//   1  畫面標題自動換（SOCIAL.shuyuT）：交往中「溫學姊」「學姊」→「書瑀」；「直屬學姊」「登山社的學姊」不換；沒交往、分手以後照舊
//   2  出遊按鈕、標題卡（OUT.tt）：「出發：書瑀的生日」；q.title 存的字不改
//   3  逐句（第 1 節）：一一八茶飲「也幫書瑀點一杯」、大三下期末鉤子「那天我去送妳。」、讀書選單「讀書瑀給的那篇文章」；沒交往照舊
//   4  手機系統提醒、事件標題、titleCard 走同一個換法（程式有接）
// 修改前（開發分支 6de9a0705）：沒有 SOCIAL.shuyuT、OUT.tt，三句都只有「學姊」版——FAIL。用法：node tests/aa411_shuyu_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), path=require('path');
const {check,GM}=H, J=JSON.stringify, SIS='heroine_05';
const rd=f=>fs.readFileSync(path.join(H.ROOT,f),'utf8');
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const T=t=>SOCIAL.shuyuT?SOCIAL.shuyuT(t):t;

(async()=>{
await sec(1,()=>{ H.fresh('2027-03-02',13,'campus'); H.FRIEND(SIS);
  check('1. SOCIAL.shuyuT 有',typeof SOCIAL.shuyuT==='function');
  check('1. 沒交往：「跨年：學姊家的巷口」照舊',T('跨年：學姊家的巷口')==='跨年：學姊家的巷口');
  H.date(SIS);
  check('1. 交往中：「跨年：學姊家的巷口」→「跨年：書瑀家的巷口」',T('跨年：學姊家的巷口')==='跨年：書瑀家的巷口',T('跨年：學姊家的巷口'));
  check('1. 「接機（學姊）」→「接機（書瑀）」、「和溫學姊吵一次」→「和書瑀吵一次」',T('接機（學姊）')==='接機（書瑀）'&&T('和溫學姊吵一次')==='和書瑀吵一次',J([T('接機（學姊）'),T('和溫學姊吵一次')]));
  check('1. 例外：「直屬學姊」「登山社的學姊」不換',T('直屬學姊（晚了一年）')==='直屬學姊（晚了一年）'&&T('問登山社的學姊')==='問登山社的學姊');
  H.G.flags.dating_heroine_05=false; const R=H.G.flags.romance&&H.G.flags.romance[SIS]; if(R) R.status='ended';
  check('1. 分手以後：變回學姊',T('學姊的生日')==='學姊的生日',T('學姊的生日')); });

await sec(2,async()=>{ H.fresh('2028-07-20',10,'campus'); H.FRIEND(SIS); H.date(SIS);
  check('2. OUT.tt 有',typeof OUT.tt==='function');
  OUT.plan(H.G,{id:'t411',ev:'ev_pg_sis_bday',day:H.G.day,h:10.25,late:0.5,place:'霖澤館・研究室',title:'學姊的生日：研究室，八點半',travel:'走路 約 10 分鐘',travelH:1/6});
  const q=OUT.get(H.G,'t411'); H.picks=[2]; await OUT.prompt(GM,q);
  check('2. 出遊按鈕：「出發：書瑀的生日：研究室，八點半」',(H.opts[0]||[])[0]==='出發：書瑀的生日：研究室，八點半',J(H.opts[0]));
  check('2. 存起來的 q.title 不改',q.title==='學姊的生日：研究室，八點半');
  const src=rd('src/outings3d.js');
  check('2. 標題卡（兩處）用 S.tt',(src.match(/GM\.titleCard\(S\.tt\(q\.title\),tr\.travel,2400\)/g)||[]).length===2);
  const hs=rd('src/home3d.js');
  check('2. 家裡的選單（三個出發按鈕＋行程列表）也換',(hs.match(/OUT\.tt\?OUT\.tt\(q\.title\):q\.title/g)||[]).length>=5); });

await sec(3,()=>{ H.fresh('2029-06-10',12,'campus'); H.FRIEND(SIS);
  const ok=TERMEND_LINES.HOOK.Y3S2.heroine_05.ok, rs=x=>typeof x==='function'?x(H.G):x;
  check('3. 大三下期末鉤子：沒交往「「那天我去送學姊。」」',rs(ok)==='「那天我去送學姊。」',rs(ok));
  H.date(SIS); check('3. 交往中：「「那天我去送妳。」」',rs(ok)==='「那天我去送妳。」',rs(ok));
  const ff=rd('src/foodfav3d.js');
  check('3. 一一八茶飲：交往中「也幫書瑀點一杯」（datingName）、平常「也幫學姊點一杯」',/'也幫'\+\(\(id==='heroine_05'&&typeof SOCIAL!=='undefined'&&SOCIAL\.datingName&&SOCIAL\.datingName\(id\)\)\|\|C\.short\)\+'點一'\+C\.unit/.test(ff)&&/heroine_05:\{shop:'tea',right:'無糖綠茶',opt:\['去冰','正常冰'\],short:'學姊'/.test(ff));
  const g=rd('src/game3d.js');
  check('3. 讀書選單：兩處都用 gradOpt（交往中「讀書瑀給的那篇文章」）；旁白不改',(g.match(/\{t:gradOpt\(\)/g)||[]).length===2&&/const gradOpt=\(\)=>'讀'\+\(\(typeof SOCIAL!=='undefined'&&SOCIAL\.datingName&&SOCIAL\.datingName\('heroine_05'\)\)\|\|'學姊'\)\+'給的那篇文章'/.test(g)&&!/\{t:'讀學姊給的那篇文章'/.test(g)); });

await sec(4,()=>{ const g=rd('src/game3d.js'), ev=rd('src/events3d.js');
  check('4. 手機系統提醒：sysT（PHONE.th＝sys 才換），列表、對話、最後一則都用它',/const sysT=m=>typeof PHONE!=='undefined'&&PHONE\.th\(m\)==='sys'/.test(g)&&!/escH\(m\.text\)/.test(g)&&/String\(sysT\(m\)\|\|''\)/.test(g));
  check('4. 事件標題、titleCard 走 SOCIAL.shuyuT',/GM\.caption\('',SOCIAL\.shuyuT\?SOCIAL\.shuyuT\(ev\.title\):ev\.title,1500\)/.test(ev)&&/GM\.titleCard\(SOCIAL\.shuyuT\?SOCIAL\.shuyuT\(l\.titleCard\):l\.titleCard,l\.sub\)/.test(ev)); });

H.done();
})();
