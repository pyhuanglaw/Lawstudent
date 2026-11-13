'use strict';
/* AA_959 台詞覆寫表（DLG-FULL-REVIEW-1110：七位女主角「今天」開頭砍半＋「……」開頭減量）——給測試用的對照工具。
   表：docs/handoff/AA_959_overlay.json（企劃線原樣複製）；不換的列：docs/handoff/AA_959_skip.json。遊戲檔怎麼換的在 tools/story/aa959.py（匯入工具寫檔前最後一步）。
   各支「和稿一字不差」「和重匯以前比」的測試：稿上、舊版的字先用 map 照表換成新字再比（或現在的字用unmap 換回舊字再比）；只對「整個字串就是 old」
   （prefix：開頭是 old；all：裡面有 old）的字串換，和遊戲檔的換法一樣。AA 出新版表＝換 json，這支不用改。
   map(s, file, who)：s 照表換完的字（file＝遊戲檔名，例 'date_lines.js'；不給＝所有檔的列；who＝只用 speaker 是這個人的列）
   mapText(s, file, who)：好幾句接起來的字照表換
   mapDeep／unmapDeep(x, file)：物件裡每一個字串照換（路徑上的人物鍵＝只用那個人的列）
   unmap(s, file)：反過來（新字 → 舊字）
   is959(a, b, file)：a 照表換完剛好是 b（而且 a≠b）
   rows(file)：那個檔要換的列（SKIP 不算） */
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const T = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/handoff/AA_959_overlay.json'), 'utf8'));
const SK = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/handoff/AA_959_skip.json'), 'utf8')).rows;
const skip = (f, o) => SK.some(x => x.file === f && x.old === o);
const nw = r => (r.prefix && r.new.endsWith('……') && !r.old.endsWith('……')) ? r.new.slice(0, -2) : r.new;   // 稿上「……（後面照舊）」的記號
const code = r => /['"]/.test(r.old);
/* 跟著換的送訊息程式（tools/story/aa959.py LINKED）：msg_replies.js 傳來的訊息那幾列 */
const LINKED = { 'msg_replies.js': ['aa555_3d.js', 'r2y3b3d.js', 'r3_3d.js', 'y2b3d.js', 'y2r2_3d.js', 'aa554_3d.js', 'y1fill_events.js'] };
function rows(file, who) {
  let b = file ? path.basename(file) : null; const w = (who && who !== '(共用)') ? who : null;
  for (const [src, fs_] of Object.entries(LINKED)) if (b && fs_.includes(b)) b = src;
  return T.rows.filter(r => !code(r) && (!w || r.speaker === w) && r.files.some(f => (!b || f === b) && !skip(f, r.old))).sort((a, c) => c.old.length - a.old.length);
}
function map(s, file, who) {
  if (typeof s !== 'string') return s;
  for (const r of rows(file, who)) {
    const n = nw(r);
    if (r.all) { if (s.includes(r.old)) s = s.split(r.old).join(n); }
    else if (r.prefix) { if (s.startsWith(r.old)) s = n + s.slice(r.old.length); }
    else if (s === r.old) return n;
  }
  return s;
}
function unmap(s, file, who) {
  if (typeof s !== 'string') return s;
  for (const r of rows(file, who)) {
    const n = nw(r);
    if (r.all) { if (s.includes(n) && !s.includes(r.old)) s = s.split(n).join(r.old); }
    else if (r.prefix) { if (s.startsWith(n) && !s.startsWith(r.old)) s = r.old + s.slice(n.length); }
    else if (s === n) return r.old;
  }
  return s;
}
/* mapText(s, file, who)：s 是好幾句接起來的字——每一列的 old 在 s 裡（前一個字不是中文字）就換成 new（長的先換；同 overlay_expect.fwdText） */
const CJK = /[\u3400-\u9fff…]/;
function mapText(s, file, who) {
  if (typeof s !== 'string') return s;
  for (const r of rows(file, who)) {
    const n = nw(r); let out = '', i = 0, k;
    while ((k = s.indexOf(r.old, i)) >= 0) { out += s.slice(i, k); out += (k > 0 && CJK.test(s[k - 1]) && !r.all) ? r.old : n; i = k + r.old.length; }
    s = out + s.slice(i);
  }
  return s;
}
/* unmapText(s, file, who)：mapText 反過來（s 裡有某一列的新字、沒有舊字＝換回舊字；給「遊戲的字在稿上找得到」那種比法用） */
function unmapText(s, file, who) {
  if (typeof s !== 'string') return s;
  for (const r of rows(file, who).slice().sort((a, c) => nw(c).length - nw(a).length)) { const n = nw(r); if (n && s.includes(n) && !s.includes(r.old)) s = s.split(n).join(r.old); }
  return s;
}
/* unmapCode(src, file)：程式原始碼（函式）裡用引號寫的整句新字換回舊字（'新' → '舊'、"新" → "舊"） */
function unmapCode(src, file) {
  if (typeof src !== 'string') return src;
  src = unmapRaw(src, file);   /* 1243649c23 起：帶引號的列（AA_961／973／974）整段換回舊字 */
  for (const r of rows(file)) { const n = nw(r); for (const q of ["'", '"']) src = r.prefix ? src.split(q + n).join(q + r.old) : src.split(q + n + q).join(q + r.old + q); }
  return src;
}
const is959 = (a, b, file) => typeof a === 'string' && a !== b && map(a, file) === b;
/* 深層複本：每一個字串葉子照 map／unmap 換。路徑上最近的一個鍵是表上的說話的人（heroine_01、kexin…）＝只用那個人的列
   （同一個檔裡別人剛好說了一樣的字不動；例：語彤 D01「走了好多路。」＝另一位女主角那一列的新字） */
const WHO = new Set(T.rows.map(r => r.speaker));
const whoOf = (x, who) => (x && typeof x === 'object' && !Array.isArray(x) && (WHO.has(x.who) ? x.who : WHO.has(x.speaker) ? x.speaker : null)) || who;   // {who:'kexin', text:…} 這種寫法
function deep(x, f, who) {
  if (typeof x === 'string') return f(x, who);
  if (Array.isArray(x)) return x.map(v => deep(v, f, who));
  if (x && typeof x === 'object') { const w = whoOf(x, who), o = {}; for (const k of Object.keys(x)) o[k] = deep(x[k], f, WHO.has(k) ? k : w); return o; }
  return x;
}
/* 原地換（給「還原再比」那種會改傳進來的物件的 helper 用，例 tests/date_src_sha.js unSp944、unWish921） */
function deepIn(x, f, who) {
  if (Array.isArray(x)) { for (let i = 0; i < x.length; i++) { if (typeof x[i] === 'string') x[i] = f(x[i], who); else deepIn(x[i], f, who); } }
  else if (x && typeof x === 'object') { const w = whoOf(x, who); for (const k of Object.keys(x)) { const ww = WHO.has(k) ? k : w; if (typeof x[k] === 'string') x[k] = f(x[k], ww); else deepIn(x[k], f, ww); } }
  return x;
}
/* 帶引號的列（AA_972「"who": "heroine_04", "text": "……"」、AA_973 帶前一句才唯一的那幾列；1243649c23 起）：old／new 是遊戲檔（date_lines.js、ladder.js，
   Python json.dumps 寫的，", "、": " 分隔）裡的一段原文，map／unmap 一句一句換不到。mapDeep／unmapDeep 給的是整份（或一段）物件時：
   先照遊戲檔的寫法排成字，照表整段換（map：old → new；unmap：new → old，那一段剛好在才換），再讀回物件，然後照舊一句一句換。
   和 tools/story/aa959.py 套表的換法一樣（帶引號的列＝照整段字換）；只有 JSON 寫成的檔（DATA_CODE）做這一層。 */
const DATA_CODE = new Set(['date_lines.js', 'ladder.js']);
const codeRows = file => { const b = file ? path.basename(file) : null; return b && DATA_CODE.has(b) ? T.rows.filter(r => code(r) && r.files.includes(b) && !skip(b, r.old)).sort((a, c) => c.old.length - a.old.length) : []; };
const pyj = x => Array.isArray(x) ? '[' + x.map(pyj).join(', ') + ']' : (x && typeof x === 'object') ? '{' + Object.keys(x).map(k => JSON.stringify(k) + ': ' + pyj(x[k])).join(', ') + '}' : JSON.stringify(x);
function codeLayer(x, file, back) {
  const rs = codeRows(file); if (!rs.length || !x || typeof x !== 'object') return x;
  let s = pyj(x); const s0 = s;
  for (const r of rs) { const [a, b] = back ? [r.new, r.old] : [r.old, r.new]; if (s.includes(a)) s = s.split(a).join(b); }
  return s === s0 ? x : JSON.parse(s);
}
/* unmapRaw(src, file)：遊戲檔原文裡帶引號的列（AA_961 events.js、AA_973 ladder.js、AA_974 bbpack_events.js 那種 say(AN,'……')）整段新字換回舊字；mapRaw 反過來 */
const rawRows = file => { const b = file ? path.basename(file) : null; return b ? T.rows.filter(r => code(r) && r.files.includes(b) && !skip(b, r.old)).sort((a, c) => c.old.length - a.old.length) : []; };
const unmapRaw = (src, file) => { if (typeof src !== 'string') return src; for (const r of rawRows(file)) if (src.includes(r.new)) src = src.split(r.new).join(r.old); return src; };
const mapRaw = (src, file) => { if (typeof src !== 'string') return src; for (const r of rawRows(file)) if (src.includes(r.old)) src = src.split(r.old).join(r.new); return src; };
const unmapIn = (x, file) => deepIn(x, (s, w) => unmap(s, file, w));
const mapDeep = (x, file, who) => deep(codeLayer(x, file, false), (s, w) => map(s, file, w), who);
const unmapDeep = (x, file, who) => deep(codeLayer(x, file, true), (s, w) => unmap(s, file, w), who);
module.exports = { unmapRaw, mapRaw, map, unmap, mapText, unmapText, unmapIn, unmapCode, is959, rows, mapDeep, unmapDeep, SHA: (T._meta && T._meta.count) + ' 列', table: T };
