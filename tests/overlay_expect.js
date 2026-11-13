// X324 D 區覆蓋層（tools/story/overlay_rows.py：白名單 overlay:true 的稿，AA_783、AA_784、AA_785…）在別支測試裡用：舊期望（遊戲原本的字）→ 稿上的新字。
// 稿讀 git show（白名單上的 commit）；讀不到（淺層複本）＝have false、rows 空、fwd 原樣回傳（用的地方照舊比）。
//   rows(file)：那個遊戲檔的列 [{who, at, old, new, src}]（file＝'invites'／'invite_replies'／'msg_pool'／'msg2_pool'）
//   fwd(file, who, t)：t 是那個人在那個檔被換掉的舊字＝回傳新字；不是＝原樣（同一個人同一句舊字對到兩個不同的新字＝丟例外，要用 at 分）
//   at(file, at)：照 at 找那一列
'use strict';
const cp = require('child_process'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const ALLOW = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/handoff/story_import_allow.json'), 'utf8')).files.filter(e => e.overlay && e.status === 'approved');
const docs = ALLOW.map(e => { let d = null; try { d = JSON.parse(cp.execFileSync('git', ['show', e.sha + ':' + e.path], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1 << 26 })); } catch (x) { } return { path: e.path, sha: e.sha, src: e.path + '@' + e.sha, doc: d }; });
const rows = file => [].concat(...docs.filter(d => d.doc).map(d => [].concat(...d.doc.files.filter(f => f.file === file).map(f => f.rows.map(r => Object.assign({ who: f.who, src: d.src }, r))))));
const fwd = (file, who, t) => { const R = rows(file).filter(r => r.who === who && r.old === t), N = new Set(R.map(r => r.new)); if (N.size > 1) throw new Error(file + ' ' + who + '「' + t + '」對到 ' + N.size + ' 個新字，要用 at 分'); return R.length ? R[0].new : t; };
const at = (file, a) => rows(file).find(r => r.at === a) || null;
/* fwdDeep(file, who, x)：x 裡每一個字串都照 fwd 換（陣列、物件照原樣的結構；寫在期望值外面：J(P.heroine_02.acc.cafe)===J(OE.fwdDeep('invites','heroine_02',{A:[…]}))）*/
const fwdDeep = (file, who, x) => typeof x === 'string' ? fwd(file, who, x) : Array.isArray(x) ? x.map(v => fwdDeep(file, who, v)) : (x && typeof x === 'object' ? Object.fromEntries(Object.entries(x).map(([k, v]) => [k, fwdDeep(file, who, v)])) : x);
/* fwdText(file, who, s)：s 是好幾句接起來的字（例：txt(lines)），那個人每一列的舊字（整句）在 s 裡面就換成新字（長的先換）；who＝null＝不分人 */
const fwdText = (file, who, s) => { if (typeof s !== 'string') return s; for (const r of rows(file).filter(r => who == null || r.who === who).sort((a, b) => b.old.length - a.old.length)) s = s.split(r.old).join(r.new); return s; };
/* inDoc(file, who, t, has)：對稿用——t 在稿上（has(t)），或 t 是覆蓋層換上去的新字、而它的舊字在稿上（has(old)）；who＝null＝不分人 */
const inDoc = (file, who, t, has) => has(t) || rows(file).some(r => (who == null || r.who === who) && r.new === t && has(r.old));
/* AA_959（DLG-FULL-REVIEW-1110，tests/aa959_map.js）：覆蓋層之後，匯入工具（invites.js 手寫檔直接換）最後一步再照 AA_959 表換一次（「今天」開頭砍半、「……」開頭減量）——
   fwd／fwdDeep／fwdText 換完覆蓋層再照 AA_959 換（只換那個人的列：表上 speaker＝who；who 是 (共用)／null＝不分人）；inDoc 也認 AA_959 換上去的新字。 */
const M959 = require('./aa959_map.js');
const fwd0 = fwd, fwdText0 = fwdText, inDoc0 = inDoc;
const f959 = file => file + '.js';
const fwd959 = (file, who, t) => M959.map(fwd0(file, who, t), f959(file), who);
const fwdDeep959 = (file, who, x) => typeof x === 'string' ? fwd959(file, who, x) : Array.isArray(x) ? x.map(v => fwdDeep959(file, who, v)) : (x && typeof x === 'object' ? Object.fromEntries(Object.entries(x).map(([k, v]) => [k, fwdDeep959(file, who, v)])) : x);
const fwdText959 = (file, who, s) => M959.mapText(fwdText0(file, who, s), f959(file), who);
const inDoc959 = (file, who, t, has) => inDoc0(file, who, t, has) || inDoc0(file, who, M959.unmap(t, f959(file), who), has);
module.exports = { docs, rows, fwd: fwd959, fwdDeep: fwdDeep959, fwdText: fwdText959, inDoc: inDoc959, at, fwd0, fwdText0, have: docs.length > 0 && docs.every(d => !!d.doc) };
