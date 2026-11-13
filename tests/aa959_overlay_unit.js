'use strict';
/* AA_959 台詞覆寫表（DLG-FULL-REVIEW-1110：七位女主角＋配角「今天」開頭砍半、「……」開頭減量；LAWWW 11-13 選 (a)：源稿不動，匯入工具寫檔前最後一步照表換）
   表 docs/handoff/AA_959_overlay.json（企劃線原樣複製，來源 SHA 記在 tools/story/aa959.py SRC_SHA）；不換的列 docs/handoff/AA_959_skip.json（說話的人對不上）。
   1. 表讀得到、列數＝_meta.count；不換的列每一列都在表上
   2. tools/story/aa959.py --check：每一列在它標的檔（和跟著換的送訊息程式）沒有舊字、找得到新字
   3. 每一支接了 AA_959 的匯入工具都在寫檔前呼叫 aa959.layer（重匯＝遊戲檔一字不差由各自的重匯測試驗）
   4. tests/aa959_map.js：map／unmap 和表一致（每一列 map(old)＝new、unmap(new)＝old） */
const fs = require('fs'), path = require('path'), cp = require('child_process');
const ROOT = path.join(__dirname, '..');
let fail = 0; const check = (n, ok, info) => { console.log((ok ? 'ok  ' : 'FAIL ') + n + (ok ? '' : '　' + (info || ''))); if (!ok) fail++; };
const T = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/handoff/AA_959_overlay.json'), 'utf8'));
const SK = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/handoff/AA_959_skip.json'), 'utf8')).rows;
check('1. 表 ' + T.rows.length + ' 列＝_meta.count', T.rows.length === T._meta.count && T.rows.length >= 372, T.rows.length + '／' + T._meta.count);
check('1. 不換的 ' + SK.length + ' 列每一列都在表上（檔名、old 一字不差）、都寫了原因', SK.every(x => x.why && T.rows.some(r => r.old === x.old && r.files.includes(x.file))), JSON.stringify(SK.filter(x => !T.rows.some(r => r.old === x.old && r.files.includes(x.file)))));
const r = cp.spawnSync('python3', ['tools/story/aa959.py', '--check'], { cwd: ROOT, encoding: 'utf8' });
check('2. aa959.py --check：每一列都換好了（舊字不在、新字在）', r.status === 0, (r.stdout + r.stderr).split('\n').slice(0, 8).join(' / '));
const TOOLS = { 'tools/ladder/import_ladder.py': 'ladder.js', 'tools/date/import_date_lines.py': 'date_lines.js', 'tools/story/import_activity_scenes.py': 'activity_scenes.js',
  'tools/story/import_msg_replies.py': 'msg_replies.js', 'tools/date/import_wish.py': 'date_wish.js', 'tools/invite/build_replies.py': 'invite_replies.js',
  'tools/story/import_termend_opts.py': 'termend_opts.js', 'tools/movie/import_movie_plots.py': 'movie_plots.js', 'tools/story/import_arcs.py': 'heroine_arcs.js',
  'tools/msg/to_js.py': 'msg_pool.js', 'tools/msg/to_js2.py': 'msg2_pool.js',
  /* 1243649c23（505 列）多的檔 */ 'tools/gift/import_gift_holiday.py': 'gift_holiday.js', 'tools/story/import_place_acc.py': 'invite_place_lines.js', 'tools/story/import_flirt.py': 'flirt_lines.js',
  'tools/story/import_gifts.py': 'gift_lines.js', 'tools/story/import_tz_invite_supper.py': 'tz_invite_supper.js' };
const miss = Object.entries(TOOLS).filter(([p, f]) => !fs.readFileSync(path.join(ROOT, p), 'utf8').includes("_AA959.layer(") || !fs.readFileSync(path.join(ROOT, p), 'utf8').includes("'" + f + "'"));
check('3. ' + Object.keys(TOOLS).length + ' 支匯入工具寫檔前呼叫 aa959.layer（檔名對）', miss.length === 0, JSON.stringify(miss));
const M = require('./aa959_map.js');
const bad = [];
for (const x of T.rows) {
  if (/['"]/.test(x.old)) continue;   // 帶前後程式碼的列（events.js）：只在 2 驗
  for (const f of x.files) {
    if (SK.some(s => s.file === f && s.old === x.old)) continue;
    const n = (x.prefix && x.new.endsWith('……') && !x.old.endsWith('……')) ? x.new.slice(0, -2) : x.new;
    if (M.map(x.old, f) !== n) bad.push(['map', f, x.old, M.map(x.old, f)]);
    if (!x.prefix && M.unmap(n, f) !== x.old) bad.push(['unmap', f, n, M.unmap(n, f)]);
  }
}
check('4. aa959_map.js：每一列 map(old)＝new、unmap(new)＝old', bad.length === 0, JSON.stringify(bad.slice(0, 5)));
console.log(fail ? 'FAILED ' + fail : 'ALL PASS'); process.exit(fail ? 1 : 0);
