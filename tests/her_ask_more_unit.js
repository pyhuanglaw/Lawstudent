// 女主角主動約你：常約她也等得到她約（HER-ASK-MORE-1110，使用者 2026-11-10 X293「我到現在還沒遇到可攻略對象約我」；存檔 tests/fixtures/user_save_day54_1110.json）——不需要瀏覽器（D131）。
// src/heroine_asks3d.js S.candidates：你約她、去了以後幾天內她不約（原本 5 天，交往中 3 天 → 3 天、2 天）。兩次日常邀約之間照舊 14 天（AA_539 四週內不重複的句子不夠，等 AA）。
//   1 使用者的 day 54 存檔：以安（好朋友，第 54 天才一起去過）第 57 天就會約（原本要等到第 59 天）；第 56 天以前不約
//   2 其他還在「有點熟」的照舊不約（那幾則要 AA 寫，資料的 th 不動）
//   3 她約過一次日常以後：照舊 14 天內不再約日常（AA_539）
//   4 曖昧（第 5 階）以上：剛見過面也會約（不看幾天前見過）
// 修改前 1 FAIL。用法：node tests/her_ask_more_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check}=H, J=JSON.stringify;
for(const [f,n] of [['src/data/heroine_asks.js','HASK_DATA'],['src/heroine_asks3d.js','HASK']]){ const s=fs.readFileSync(path.join(H.ROOT,f),'utf8').replace(new RegExp('^const '+n+'\\s*=','m'),'globalThis.'+n+'='); vm.runInThisContext(s,{filename:f}); }   /* [前置] 和 tests/heroine_asks_unit.js 同一個載法 */
const sv=JSON.parse(fs.readFileSync(path.join(H.ROOT,'tests/fixtures/user_save_day54_1110.json'),'utf8')), S0=sv.data||sv.save||sv;
const load=()=>{ const G=H.fresh('2025-10-23',12,'dorm'); for(const k of Object.keys(S0)) G[k]=JSON.parse(JSON.stringify(S0[k])); SOCIAL.bind(G); INV.rec(G); return G; };   /* [前置] 讀使用者的存檔（不經瀏覽器）*/
const ids=(G,d)=>[...new Set(HASK.candidates(G,d).map(x=>x.id))];
(async()=>{
  { const G=load(); const d0=G.day, by={}; for(let d=d0;d<d0+8;d++) by[d]=ids(G,d);
    const first=Object.keys(by).map(Number).find(d=>by[d].includes('heroine_01'));
    check('1. day 54 存檔：以安第 57 天就會約（54 一起去過＋3 天），56 天以前不約',d0===54&&first===57,J({d0,first,by}));
    const others=Object.values(by).flat().filter(id=>id!=='heroine_01');
    check('2. 其他還在「有點熟」的照舊不約（資料的 th 不動，等 AA）',!others.length,J(others)); }
  { const G=load(); const R=HASK.rec(G); const st=R.st.heroine_01||(R.st.heroine_01={}); st.d=60; st.last=60;
    const L=[]; for(let d=61;d<74;d++) if(HASK.candidates(G,d).some(x=>x.id==='heroine_01'&&x.k==='d')) L.push(d);
    check('3. 她第 60 天約過一次日常：14 天內不再約日常（照舊，AA_539 四週內不重複）',!L.length,J(L)); }
  { const G=load(); Object.assign(SOCIAL.rel('heroine_01'),{fam:70,trust:50,comf:45,npcRom:35,rom:10}); const sn=HASK.stage(G,'heroine_01');
    check('4. 曖昧（第 5 階）以上：昨天才一起去過，今天她照樣會約（使用者 11-10「曖昧到一個程度她就會主動約你 不用五天沒見」）',sn>=5&&ids(G,55).includes('heroine_01'),J({sn,d55:ids(G,55)})); }
  H.done();
})().catch(e=>{ console.error(e); console.log('FAILED (exception)'); process.exit(1); });
