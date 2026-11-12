/* CANON-NO-ECON-1112 第四批（AA_891 第 2 節，企劃線 c51906860 定稿 BB_426）：可昕邀約回覆換字、kx1～kx19 搬進 law——給比對舊版的測試用（不是測試本身）。
   新字從 tools/invite/build_replies.py 的 CANON891_NEW 讀（同一份，不另外抄）；invites.js 可昕 brunch A 那一格照 AA_894 換成和 kx25 同一句。
   用法：const A891=require('./canon891_1112.js'); A891.is(id)＝這一列是 AA_891 動過的；A891.ok(row)＝這一列照稿（lines、say、sec）；A891.apply(舊列)＝換過以後；A891.BRUNCH＝invites.js 那一格的新字 */
const fs = require('fs'), path = require('path');
const src = fs.readFileSync(path.join(__dirname, '..', 'tools/invite/build_replies.py'), 'utf8');
const blk = (src.match(/^CANON891_NEW = \{([\s\S]*?)\}$/m) || [, ''])[1];
const NEW = {}; for (const m of blk.matchAll(/'(kx\d+b?)': '([^']*)'/g)) NEW[m[1]] = m[2];
const SAY_ONLY = { kx25b: '「好啊，我先查一下菜單。」' };
const MOVE = new Set(Array.from({ length: 19 }, (_, i) => 'kx' + (i + 1)));
const is = id => id in NEW || id in SAY_ONLY || MOVE.has(id);
const ok = r => { if (!r || !is(r.id)) return false; if (r.sec !== 'law') return false;
  if (r.id in NEW) return r.lines.length === 1 && r.lines[0] === NEW[r.id] && r.say === '「' + NEW[r.id] + '」';
  if (r.id in SAY_ONLY) return r.say === SAY_ONLY[r.id];
  return true; };
/* apply(row)：舊版那一列照 AA_891 換過以後應該長的樣子（比對舊版的測試，先把舊版那一列換過再比）；kexin 以外的列原樣 */
const apply = r => { if (!r || !is(r.id)) return r; const o = JSON.parse(JSON.stringify(r)); if (MOVE.has(o.id)) o.sec = 'law';
  if (o.id in NEW) { o.lines = [NEW[o.id]]; o.say = '「' + NEW[o.id] + '」'; } if (o.id in SAY_ONLY) o.say = SAY_ONLY[o.id]; return o; };
module.exports = { NEW, SAY_ONLY, MOVE, is, ok, apply, BRUNCH: NEW.kx25, n: Object.keys(NEW).length };
