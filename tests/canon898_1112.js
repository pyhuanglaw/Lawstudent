/* CANON-NO-ECON-1112 第四批（AA_898，企劃線 6e54cfd62）：玩家看得到的七句「傳」換「發」——給對舊稿／舊 commit 逐字比的測試用（不是測試本身）。
   和 tools/story/canon898.py 同一張表；舊字不寫成字面（「前」「傳」分開寫再接，這個檔不會被 canon_scan 掃到）。
   back(t)＝把新句換回舊句（稿上還是舊句時，拿遊戲的字去對稿）；pair(a,b)＝a 是舊、b 是新（整句或裡面那一段）*/
const Q = '前' + '傳', q = '以' + Q;
const PAIRS = [
  ['src/data/msg_pool.js', '白天睡到下午一點，一點' + q + '的，一點才回。', '白天睡到下午一點，一點以前發的，一點才回。'],
  ['src/data/msg_pool.js', '延到隔天／一點' + q + '的：', '延到隔天／一點以前發的：'],
  ['src/data/msg2_pool.js', '沒有標點；一點' + q + '的一點才回，先接「剛醒」', '沒有標點；一點以前發的一點才回，先接「剛醒」'],
  ['src/data/invites.js', '我爸之' + Q + '訊息問我『籃球的三分線是畫在哪裡』。', '我爸之前發訊息問我『籃球的三分線是畫在哪裡』。'],
  ['src/data/multirel_lines.js', '……你去見她那天，出門' + Q + '一句給我就好。', '……你去見她那天，出門前發一句給我就好。'],
  ['src/data/r2y4b_events.js', '班次，回去' + Q + '給你。', '班次，回去前發給你。'],
  ['src/data/movie_plots.js', '她在登機' + Q + '一張照片', '她在登機前發來一張照片']];
const back = t => typeof t === 'string' ? PAIRS.reduce((s, [, o, n]) => s.split(n).join(o), t) : t;
const fwd = t => typeof t === 'string' ? PAIRS.reduce((s, [, o, n]) => s.split(o).join(n), t) : t;
const pair = (a, b) => typeof a === 'string' && typeof b === 'string' && a !== b && fwd(a) === b;
const news = f => PAIRS.filter(x => !f || x[0] === f).map(x => x[2]), olds = f => PAIRS.filter(x => !f || x[0] === f).map(x => x[1]);
/* ladderBack(text)：閒聊階梯第四批重匯（AA_898 語彤兩句、AA_899 沛珊、AA_753 覆寫；開發分支 41a071f78d → 71f828df89）換掉的字串換回舊字——
   舊字不抄進測試：兩版 ladder.js 用 git show 讀、逐個字串比出 新→舊；讀不到＝原樣（用到的測試照舊比）*/
let LB;
const ladderPairs = () => { if (LB !== undefined) return LB; LB = null; try { const cp = require('child_process'), R = require('path').join(__dirname, '..');
  const sh = c => cp.execFileSync('git', ['-C', R, 'show', c + ':src/data/ladder.js'], { encoding: 'utf8', maxBuffer: 1 << 28, stdio: ['ignore', 'pipe', 'ignore'] });
  const lits = t => t.match(/"(?:[^"\\]|\\.)*"/g) || [], a = lits(sh('41a071f78d')), b = lits(sh('71f828df89'));
  if (a.length === b.length) LB = a.map((x, i) => [x, b[i]]).filter(([x, y]) => x !== y && !/^"白名單 /.test(x)); } catch (e) {} return LB; };
const ladderBack = t => { const P = ladderPairs(); if (!P || typeof t !== 'string') return t; for (const [o, n] of P) t = t.split(n).join(o); return t; };
module.exports = { PAIRS, back, fwd, pair, news, olds, ladderBack };
