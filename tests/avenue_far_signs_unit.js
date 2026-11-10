// AVENUE-FAR-SIGNS-1110（使用者 11-10 對 LAWWW-B：「椰林大道遠景怎麼都是文理補習班」，X285；LAWWW2 帳號 A）
// 校門外的遠景（campus_gongguan_bd.glb）和公館區域的遠景（gongguan_far.glb）的大看板、直立燈箱，貼圖都由
// tools/blender/env_second/gg_textures.py 的 BILLBOARDS、LIGHTBOX 畫。這支測試讀那份清單（不用瀏覽器，D131）：
//   1. 大看板、燈箱沒有「補習」
//   2. 大看板裡語言補習／留學這一類最多一家
//   3. 每一張看板的店名都不一樣（不重複出現同一家）
//   4. gg_backdrop.py 挑大看板經過 _bb()：相鄰的樓不掛同一張
//   5. _bb() 照固定順序輪流（8 張平均出現，不靠亂數）
// 修改前（開發分支）：第 1、2、4、5 項 FAIL（「明日文理補習班」「公職補習」、燈箱「補習」；直接 randrange(8)）。用法：node tests/avenue_far_signs_unit.js
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const TX = fs.readFileSync(path.join(ROOT, 'tools/blender/env_second/gg_textures.py'), 'utf8');
const BD = fs.readFileSync(path.join(ROOT, 'tools/blender/env_second/gg_backdrop.py'), 'utf8');
let fails = 0; const check = (name, ok, info) => { console.log((ok ? 'PASS ' : 'FAIL ') + name + (info ? '　' + info : '')); if (!ok) fails++; };
function list(name) {
  const i = TX.indexOf('\n' + name + ' = ['); if (i < 0) return null;
  let d = 0, j = TX.indexOf('[', i);
  for (let k = j; k < TX.length; k++) { if (TX[k] === '[') d++; else if (TX[k] === ']') { d--; if (d === 0) return TX.slice(j, k + 1); } }
  return null;
}
const tuples = s => [...s.matchAll(/\(([^()]*)\)/g)].map(m => [...m[1].matchAll(/'([^']*)'/g)].map(x => x[1]));
const bb = tuples(list('BILLBOARDS') || ''), lb = tuples(list('LIGHTBOX') || '');
check('0. 讀得到 BILLBOARDS（8 張）、LIGHTBOX', bb.length === 8 && lb.length > 0, `BILLBOARDS ${bb.length}、LIGHTBOX ${lb.length}`);
const cram = [...bb.map(t => t.slice(0, 3).join('')), ...lb.map(t => t[0])].filter(s => /補習/.test(s));
check('1. 大看板、燈箱沒有「補習」', cram.length === 0, cram.length ? '還有：' + cram.join('、') : '');
const edu = bb.filter(t => /美語|英語|文理|補習|留學|家教|升學/.test(t.slice(0, 3).join('')));
check('2. 大看板裡語言補習／留學這一類最多兩張（美語一家＋留學代辦）', edu.length <= 2, edu.map(t => t[0]).join('、'));
const names = bb.map(t => t[0]);
check('3. 大看板的店名都不一樣', new Set(names).size === names.length, names.join('、'));
const calls = [...BD.matchAll(/'bb%d' % ([^)]*\))\)?/g)].map(m => m[1]);
check('4. 挑大看板都經過 _bb()（相鄰的樓不掛同一張）', calls.length >= 2 && calls.every(c => /^_bb\(/.test(c)) && /def _bb\(k\)/.test(BD), calls.join(' ／ '));
const om = BD.match(/_BB_ORDER = \(([^)]*)\)/), ord = om ? om[1].split(',').map(x => +x) : [];
check('5. 輪流的順序 8 張各一次、相鄰不同（不靠亂數，避免同一張一直出現）', ord.length === 8 && new Set(ord).size === 8 && ord.every((v, i) => v !== ord[(i + 1) % 8]) && /_BB_ORDER\[n % 8\]/.test(BD), ord.join(','));
console.log(fails ? `FAILED ${fails}` : 'ALL PASS'); process.exit(fails ? 1 : 0);
