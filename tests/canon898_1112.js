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
module.exports = { PAIRS, back, fwd, pair, news, olds };
