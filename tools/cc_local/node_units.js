// CC（帳號 A）：N1_node（BB_246）——在目前的資料夾（受測版本的 worktree）跑全部 tests/*_unit.js，PC 和雲端對照用。
// 用法：node tools/cc_local/node_units.js [--out <資料夾>] [--timeout 秒（預設 600）] [--only a,b]
//   cwd＝受測版本根目錄（有 tests/、src/）。一支一支跑（不並行，避免 CPU 互搶影響時間敏感的測試）。
// 輸出：每支一行「PASS／FAIL／TIMEOUT 名稱 秒數 最後一行」，最後 ALL PASS／FAILED n；<out>/node_units.json（每支 exit、秒數、最後 5 行）。
'use strict';
const fs = require('fs'), path = require('path'), cp = require('child_process');
const argv = process.argv.slice(2);
const opt = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const OUT = opt('--out', null), TO = +(opt('--timeout', '600')) * 1000;
const ONLY = (opt('--only', '') || '').split(',').filter(Boolean);
const dir = path.join(process.cwd(), 'tests');
if (!fs.existsSync(dir)) { console.log('FAIL 找不到 tests/（cwd 要是受測版本根目錄）：' + process.cwd()); process.exit(2); }
let files = fs.readdirSync(dir).filter(f => /_unit\.js$/.test(f)).sort();
if (ONLY.length) files = files.filter(f => ONLY.some(o => f.startsWith(o)));
console.log('node ' + process.version + '　cwd ' + process.cwd() + '　' + files.length + ' 支');
const rows = []; let bad = 0;
for (const f of files) {
  const t0 = Date.now();
  const r = cp.spawnSync(process.execPath, [path.join('tests', f)], { cwd: process.cwd(), encoding: 'utf8', timeout: TO, maxBuffer: 64 * 1024 * 1024 });
  const sec = Math.round((Date.now() - t0) / 100) / 10;
  const lines = ((r.stdout || '') + (r.stderr || '')).trim().split(/\r?\n/);
  const last = lines.slice(-5);
  const st = r.error && r.error.code === 'ETIMEDOUT' ? 'TIMEOUT' : (r.status === 0 ? 'PASS' : 'FAIL');
  if (st !== 'PASS') bad++;
  rows.push({ file: f, status: st, exit: r.status, sec, last });
  console.log((st + '    ').slice(0, 8) + f + '　' + sec + 's　' + (last[last.length - 1] || '').slice(0, 120));
}
if (OUT) { fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(path.join(OUT, 'node_units.json'), JSON.stringify({ node: process.version, n: files.length, bad, rows }, null, 1)); }
console.log(bad ? 'FAILED ' + bad + '／' + files.length + '：' + rows.filter(x => x.status !== 'PASS').map(x => x.file).join(', ') : 'ALL PASS（' + files.length + ' 支）');
process.exit(bad ? 1 : 0);
