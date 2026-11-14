// 約會錢不夠＝她付、錢不會變負的（BB 11-11 18:56 AA_812 BROKE；AA 18:58 給台詞與決定）——不需要瀏覽器（D131）。
//   1. DATE.pay：錢夠＝照扣、不說話；錢不夠＝不扣、旁白「（你的錢不夠。她先付了。）」＋她一句（七位照 AA 原文）；同一趟第二次不夠＝只有旁白；錢永遠 ≥ 0
//   2. 七位的台詞照 AA 18:58 原文（S.BROKE.lines）
//   3. date3d.js 約會裡的扣錢（門票、互動點、請她那一份、住宿、固定段落）都走 S.pay（原始碼裡 GM.money 只剩 S.pay 那一處）；回程車資（outings3d.js）也走 DATE.pay
//   4. 選了「我請」的那個互動點不套平分（AA 18:58：「我請」＝他付兩個人的）：half 要 t.treated!==p.id
//   5. 沛珊 D31.egg「你要不要再一顆？我請你。」不算她請客（AA 18:58 照 AA_812）：SHE_PAYS_DATA.pays 沒有這一格
// 修改前（3df6cfdf6）：1、3、4、5 FAIL。用法：node tests/date_broke_1111_unit.js
const H=require('./pg_harness.js');
const {check,GM}=H; const J=JSON.stringify;
const fs=require('fs'), path=require('path');
const rd=f=>fs.readFileSync(path.join(H.ROOT,f),'utf8');
const AA={heroine_01:'我來。你下次記得，我會記。',heroine_02:'（她把錢放上去）……這次我。',heroine_03:'我付啦。你不要這樣看我。',heroine_04:'錢包見底了喔？我來，算你欠我一次。',
  heroine_05:'我付。不用算。',kexin:'沒錢了齁。我來。下次你請早餐。',classmate_peishan:'你錢包在減肥喔？我來啦。'};
const N='（你的錢不夠。她先付了。）';
(async()=>{
  const ok=typeof DATE!=='undefined'&&typeof DATE.pay==='function';
  check('1. 有 DATE.pay',ok);
  if(ok){ const G=H.fresh('2026-03-14',14,'campus',{}); G.money=55; GM.money=d=>{ GM.G.money+=d; };   /* pg_harness 的 GM.money 不動錢：照 game3d.js 的 money(d) 真的加減 */ const t={who:'heroine_04'}; const said=()=>H.said.map(s=>[s.who||null,s.t]);
    H.said=[]; const a=await DATE.pay(GM,t,30,'茶葉蛋'); check('1. 錢夠（55 付 30）＝照扣、不說話',a===30&&G.money===25&&!H.said.length,J([a,G.money,said()]));
    H.said=[]; const b=await DATE.pay(GM,t,60,'一份'); check('1. 錢不夠（25 付 60）＝不扣、旁白＋子晴那一句',b===0&&G.money===25&&J(H.said.map(s=>s.t))===J([N,AA.heroine_04]),J([b,G.money,said()]));
    H.said=[]; const c=await DATE.pay(GM,t,40,'回程'); check('1. 同一趟第二次不夠＝只有旁白、不扣',c===0&&G.money===25&&J(H.said.map(s=>s.t))===J([N]),J([c,G.money,said()]));
    H.said=[]; const d=await DATE.pay(GM,{who:'zhe'},999,'x'); check('1. 不是七位（沒有那一句）＝只有旁白；錢沒有變負的',d===0&&G.money>=0&&J(H.said.map(s=>s.t))===J([N]),J(said()));
    check('2. 七位的台詞照 AA 11-11 18:58 原文',!!DATE.BROKE&&J(DATE.BROKE.lines)===J(require('./aa959_map.js').mapDeep(AA,'date3d.js')/* RC2-PORT-DEV-1114：AA_959 第 552 列（可昕那一句的標點），AA 原文照表換完再比 */)&&DATE.BROKE.narr===N,J(DATE.BROKE&&DATE.BROKE.lines)); }
  const src=rd('src/date3d.js'), ms=src.match(/GM\.money\(/g)||[];
  check('3. date3d.js 約會裡的扣錢都走 S.pay（GM.money 只剩 S.pay 裡那一處）',ms.length===1&&/S\.pay=async function[^\n]*\n[^\n]*GM\.money\(-c,label\)/.test(src),ms.length);
  check('3. 回程車資走 DATE.pay（outings3d.js）',/DATE\.pay\(GM,tr2,tr2\.fare,'交通'\)/.test(rd('src/outings3d.js')));
  check('4. 選了「我請」的那個互動點不套平分（兩處 half 都要 t.treated!==p.id；請她那一份記 t.treated）',(src.match(/half=S\.takeSplit\(t,p\.id\)&&t\.treated!==p\.id/g)||[]).length===2&&/if\(p\) t\.treated=pid;/.test(src));
  const SP=typeof SHE_PAYS_DATA!=='undefined'?SHE_PAYS_DATA:null;
  check('5. 沛珊 D31.egg 不算她請客（AA 照 AA_812）',!!SP&&!(((SP.pays||{}).classmate_peishan||{})['D31.egg']),J(SP&&((SP.pays||{}).classmate_peishan)));
  H.done();
})().catch(e=>{ console.log('FAIL 例外：'+(e&&e.stack||e)); process.exit(1); });
