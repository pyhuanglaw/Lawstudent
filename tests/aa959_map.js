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
function rows(file, who) {
  const b = file ? path.basename(file) : null, w = (who && who !== '(共用)') ? who : null;
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
const is959 = (a, b, file) => typeof a === 'string' && a !== b && map(a, file) === b;
/* 深層複本：每一個字串葉子照 map／unmap 換。路徑上最近的一個鍵是表上的說話的人（heroine_01、kexin…）＝只用那個人的列
   （同一個檔裡別人剛好說了一樣的字不動；例：語彤 D01「走了好多路。」＝另一位女主角那一列的新字） */
const WHO = new Set(T.rows.map(r => r.speaker));
function deep(x, f, who) {
  if (typeof x === 'string') return f(x, who);
  if (Array.isArray(x)) return x.map(v => deep(v, f, who));
  if (x && typeof x === 'object') { const o = {}; for (const k of Object.keys(x)) o[k] = deep(x[k], f, WHO.has(k) ? k : who); return o; }
  return x;
}
const mapDeep = (x, file) => deep(x, (s, w) => map(s, file, w));
const unmapDeep = (x, file) => deep(x, (s, w) => unmap(s, file, w));
module.exports = { map, unmap, mapText, is959, rows, mapDeep, unmapDeep, SHA: (T._meta && T._meta.count) + ' 列', table: T };
