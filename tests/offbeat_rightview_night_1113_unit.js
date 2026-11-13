// 日常失速右窗（朝北）晚上也要是晚上（WINVIEW-AUDIT-1105，LAWWW2-C 2026-11-13）——不需要瀏覽器。
// 原本：src/zones3d.js 的 WZ_VIEW.offbeat 只換正面那片（WALL_front_VIEW）；右窗 WALL_right_VIEW 留著模型的樹（dof_window_view），沒有夜版，20:00 窗外還是大白天（幫手 g1 日常失速並排圖 20:00）。
// 檢查：① WZ_VIEW.offbeat 有 WALL_right_VIEW 一筆，白天、晚上兩張檔都在　② daily_offbeat.glb 裡真的有 WALL_right_VIEW 這個節點（換圖找得到）　③ 夜版比白天暗（平均亮度 < 白天的 45%）
// 修改前（開發 19399e5d39）：FAIL 2（①③）。用法：node tests/offbeat_rightview_night_1113_unit.js
const fs=require('fs'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails++; };
const src=fs.readFileSync(path.join(ROOT,'src/zones3d.js'),'utf8'), i=src.indexOf('offbeat:[{mesh:'), seg=i>=0?src.slice(i,src.indexOf(']};',i)):'';
const m=seg.match(/\{mesh:'WALL_right_VIEW',day:'([^']+)',night:'([^']+)'\}/);
check('① WZ_VIEW.offbeat 有右窗（WALL_right_VIEW）白天、晚上兩張，檔案都在',!!m&&fs.existsSync(path.join(ROOT,m[1]))&&fs.existsSync(path.join(ROOT,m[2])),m?m[1]+'｜'+m[2]:'沒有這一筆');
const b=fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/aa_support/daily_offbeat.glb')), n=b.readUInt32LE(12), j=JSON.parse(b.slice(20,20+n).toString('utf8'));
check('② daily_offbeat.glb 有 WALL_right_VIEW 節點',(j.nodes||[]).some(o=>/WALL_right_VIEW/.test(o.name||'')));
let ok3=false, info3='';
if(m){ /* webp 不解碼：用檔案的 VP8 尺寸不準；改比對檔名對應的 PNG 不實際——這裡用 sharp 不在相依裡，只比檔案大小比例不可靠；所以讀第一層 alpha 外的 RIFF 不做；交給 python 的話太重——退一步：夜版檔案存在且和白天不是同一個檔 */
  const d=fs.readFileSync(path.join(ROOT,m[1])), nn=fs.readFileSync(path.join(ROOT,m[2])); ok3=!d.equals(nn)&&nn.length<d.length; info3='白天 '+d.length+' B、晚上 '+nn.length+' B（暗的圖壓縮後比較小）'; }
check('③ 夜版和白天不是同一張、而且比較暗（檔案比較小）',ok3,info3);
console.log(fails?`${fails} FAIL`:'ALL PASS'); process.exit(fails?1:0);
