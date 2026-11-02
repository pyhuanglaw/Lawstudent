// BUG-FAFU-DOUBLE-1102（CC 讀碼、BB 10:49／10:53 核准，D50 第①級：只改觸發條件、台詞不動）——不需要瀏覽器。
//   1. wzlines3d.js lineAt：FAFU_SHIFT_N++ 在「LAWCLUB_SAT_LAST!==G.day」那個 if 裡面（同一天先坐了圓桌，不再多算一次）
//   2. 大二第一次值班是溫州街線那一場（N 已經是 1、那天沒坐圓桌）：隔週第一次坐圓桌照樣演阿伯那一句、記 FAFU_FIRST_SHIFT_Y2（原本看 N===1＝永遠錯過）
//   3. 舊存檔：N≥2、沒有 FAFU_FIRST_SHIFT_Y2、還在大二＝下一次坐圓桌補演；大三以後不補
//   4. 已經有 FAFU_FIRST_SHIFT_Y2：不再演
// 修改前（690ac5f4d）：1、2、3 FAIL。用法：node tests/fafu_double_unit.js
const H=require('./pg_harness.js'); const {check,GM}=H, J=JSON.stringify; const fs=require('fs'), path=require('path');
const W=fs.readFileSync(path.join(H.ROOT,'src/wzlines3d.js'),'utf8');
const LINE='（隔壁桌，一個阿伯講了十分鐘，一直在講他兒子。大家都在翻六法。）';
(async()=>{
  check('1. lineAt：FAFU_SHIFT_N++ 在 LAST!==G.day 的 if 裡面',/if\(F\.LAWCLUB_SAT_LAST!==G\.day\)\{ F\.LAWCLUB_SAT_LAST=G\.day; F\.LAWCLUB_SAT_VISITS=\(F\.LAWCLUB_SAT_VISITS\|0\)\+1; if\(S\.fafuMember\(G\)\) F\.FAFU_SHIFT_N=\(F\.FAFU_SHIFT_N\|0\)\+1; \}/.test(W));
  const MEM={lawclub:true,CLUB_lawclub_study:true};
  const shift=async(term,w,flags)=>{ H.fresh(CALENDAR.dateOf(STORY.termDay(term,w,6)).key,9.5,'wancai',Object.assign({},MEM,flags||{})); H.G.stage='law'; H.picks=[0,0,0,0,0,0]; H.said=[]; const ok=STORY.fafuShiftable(H.G); if(ok) await STORY.fafuShift(GM); return ok; };
  let ok=await shift('Y2S1',7,{FAFU_SHIFT_N:1});
  check('2. 大二第一次值班是溫州街線（N＝1、那天沒坐圓桌）：隔週第一次坐圓桌照樣演阿伯那一句、記 FAFU_FIRST_SHIFT_Y2',ok&&H.has(LINE)&&H.G.flags.FAFU_FIRST_SHIFT_Y2===H.G.day&&H.G.flags.FAFU_SHIFT_N===2,J({ok,n:H.G.flags.FAFU_SHIFT_N,f:H.G.flags.FAFU_FIRST_SHIFT_Y2}));
  ok=await shift('Y2S2',3,{FAFU_SHIFT_N:5});
  check('3. 舊存檔 N＝5、沒有 FAFU_FIRST_SHIFT_Y2、還在大二：下一次坐圓桌補演',ok&&H.has(LINE)&&!!H.G.flags.FAFU_FIRST_SHIFT_Y2,J({ok}));
  ok=await shift('Y3S1',5,{FAFU_SHIFT_N:5});
  check('3. 大三以後的舊存檔：不補',!H.has(LINE)&&!H.G.flags.FAFU_FIRST_SHIFT_Y2,J({ok}));
  ok=await shift('Y2S1',11,{FAFU_SHIFT_N:2,FAFU_FIRST_SHIFT_Y2:123});
  check('4. 已經有 FAFU_FIRST_SHIFT_Y2：不再演',ok&&!H.has(LINE)&&H.G.flags.FAFU_FIRST_SHIFT_Y2===123,J({ok}));
  ok=await shift('Y2S1',3,{});
  check('4. 大二第一次值班（N＝0）照舊演',ok&&H.has(LINE)&&H.G.flags.FAFU_SHIFT_N===1,J({ok,n:H.G.flags.FAFU_SHIFT_N}));
  H.done();
})();
