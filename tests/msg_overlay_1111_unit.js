// X324 D 區玩家主動傳訊息的回覆（msg_pool、msg2_pool）覆蓋層 AA_785（DLG-FULL-REVIEW-1110；LAWWW 2026-11-11 定）——不需要瀏覽器（D131）。
//   工具：tools/story/overlay_rows.py（讀稿、驗格式）、tools/msg/msg_overlay.py（tools/msg/to_js.py、to_js2.py 寫檔最後一步：AA_630、PS755／PS763 以後，只換 at 那一格）
//   1. 白名單 AA_785 一筆、overlay、approved；重產（build_pool／build_msg2 → to_js／to_js2，寫到暫存資料夾）和 src/data 的兩個檔一字不差
//   2. 每一列：at（people.<id>.replies[i] 底下：msgs[j]、ask.q、ask.opts[k].r[m]）那一格＝new；那一則的 topic、tier＝稿寫的；那一則有 ov（稿的來源）
//   3. 和 BASE（覆蓋層以前，開發分支 8fce0eacf）逐則比：則數一樣；變的只有稿上那幾格（別的格子、別的則、別的人一格都沒變，「嗯。」這種短句只換 at 那一格）
//   4. 沛珊「我家的早餐」那一則（PS755 那一層先換過）照換過以後的字對到、換成新字；語彤「還好嗎」回問（ask.q）和回話（ask.opts[0].r[0]）照稿
//   5. 遊戲載的那一份（照檔案執行 MSG_POOL／MSG2_POOL）：以安 msg_pool 一句、學姊 msg2_pool 一句是新字
// 用法：node tests/msg_overlay_1111_unit.js
'use strict';
const H = require('./pg_harness.js');
const { check } = H; const J = JSON.stringify;
const cp = require('child_process'), fs = require('fs'), path = require('path'), os = require('os');
const OE = require('./overlay_expect.js');
const BASE = '8fce0eacf';   /* 覆蓋層以前（開發分支：AA_784 那一個 commit）*/
const sec = async (n, f) => { try { await f(); } catch (e) { check(n + '. 丟出例外', false, String(e && e.stack || e).split('\n').slice(0, 4).join(' / ')); } };
const show = (ref, p) => { try { return cp.execFileSync('git', ['show', ref + ':' + p], { cwd: H.ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1 << 28 }); } catch (e) { return null; } };
const read = f => fs.readFileSync(path.join(H.ROOT, f), 'utf8');
/* 一則一行的檔 → {id: [那一則, …]} */
const parse = t => { const o = {}; let pid = null; for (const ln of t.split('\n')) { let m = /^  "(\w+)":(\{"name"|Object\.assign\()/.exec(ln); if (m) { pid = m[1]; o[pid] = []; continue; } m = /^   (\{.*\})(,?)$/.exec(ln); if (m && pid) o[pid].push(JSON.parse(m[1])); } return o; };
const getp = (o, ks) => ks.reduce((x, k) => x == null ? x : x[k], o);
const toks = at => { const out = []; at.replace(/\.?([A-Za-z_$][\w$]*)|\[(\d+)\]/g, (m, a, b) => { out.push(a != null ? a : +b); return ''; }); return out; };
const FILES = { msg_pool: 'src/data/msg_pool.js', msg2_pool: 'src/data/msg2_pool.js' };

(async () => {
  const R = { msg_pool: OE.rows('msg_pool'), msg2_pool: OE.rows('msg2_pool') }, NOW = {}, WAS = {};
  for (const k in FILES) { NOW[k] = parse(read(FILES[k])); const b = show(BASE, FILES[k]); WAS[k] = b ? parse(b) : null; }

  await sec(1, async () => {
    const A = JSON.parse(read('docs/handoff/story_import_allow.json')).files.filter(e => e.path === 'docs/story_planning/AA_785_msg_pools.json');
    check('1. 白名單 AA_785_msg_pools.json 一筆、overlay、approved、有 approvedBy、task DLG-FULL-REVIEW-1110；稿讀得到', A.length === 1 && A[0].overlay === true && A[0].status === 'approved' && !!A[0].approvedBy && A[0].task === 'DLG-FULL-REVIEW-1110' && OE.have, J(A.map(e => [e.sha, e.status])));
    /* 2026-11-11（X324 G 區，AA_785_msg_pools.json@60c08798a）：多四列——沛珊出國版 msg_pool replies[22]（「你回來，換我帶你去吃早餐。我家的。」）、芷若「店長」→「老闆」三列（msg_pool replies[9]、[17]，msg2_pool replies[8]；AA_794 搬過來的）。舊期望：31 列、msg_pool 6 列 */
    check('1. 列數：msg_pool ' + R.msg_pool.length + ' 列、msg2_pool ' + R.msg2_pool.length + ' 列（AA_785：29 列＋語彤還好嗎回問兩列＋60c08798a 沛珊出國版一列、芷若老闆三列＝35）', R.msg_pool.length + R.msg2_pool.length === 35 && R.msg_pool.length === 9 && R.msg2_pool.length === 26, J([R.msg_pool.length, R.msg2_pool.length]));
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'msgov-')), env = Object.assign({}, process.env, { MSG_POOL_OUT: tmp, MSG_JS_OUT: tmp });
    const run = f => cp.spawnSync('python3', f === 'to_js.py' || f === 'to_js2.py' ? [path.join(H.ROOT, 'tools/msg', f)] : ['-I', path.join(H.ROOT, 'tools/msg', f)], { encoding: 'utf8', env, cwd: H.ROOT, timeout: 300000 });
    const rs = ['build_pool.py', 'to_js.py', 'build_msg2.py', 'to_js2.py'].map(run);
    const same = k => fs.existsSync(path.join(tmp, k + '.js')) && fs.readFileSync(path.join(tmp, k + '.js'), 'utf8') === read(FILES[k]);
    check('1. 重產（build_pool → to_js、build_msg2 → to_js2，寫到暫存資料夾）：結束碼都是 0，和 src/data/msg_pool.js、msg2_pool.js 一字不差', rs.every(r => r.status === 0) && same('msg_pool') && same('msg2_pool'), rs.map(r => (r.stderr || '').slice(-120)).join(' / '));
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  await sec(2, async () => {
    const bad = [];
    for (const k in R) for (const x of R[k]) { const t = toks(x.at), e = (NOW[k][t[1]] || [])[t[3]]; if (t[0] !== 'people' || t[1] !== x.who || t[2] !== 'replies' || !e) { bad.push(k + ' ' + x.at + ' 找不到'); continue; }
      if (getp(e, t.slice(4)) !== x.new) bad.push(k + ' ' + x.at + ' 現在是「' + getp(e, t.slice(4)) + '」');
      if (('topic' in x && e.topic !== x.topic) || ('tier' in x && e.tier !== x.tier)) bad.push(k + ' ' + x.at + ' topic／tier ' + e.topic + '／' + e.tier);
      if (!(e.ov || []).includes(x.src)) bad.push(k + ' ' + x.at + ' 沒有 ov'); }
    check('2. 每一列 at 那一格＝新字、那一則的 topic、tier 和稿一樣、那一則有 ov（稿的來源）', bad.length === 0, J(bad.slice(0, 5)));
  });

  await sec(3, async () => {
    if (!WAS.msg_pool || !WAS.msg2_pool) { console.log('（讀不到 BASE ' + BASE + '：第 3 項略過）'); return; }
    const d = [];
    for (const k in R) { const at = new Set(R[k].map(x => x.at)), A = WAS[k], B = NOW[k];
      if (J(Object.keys(A)) !== J(Object.keys(B))) d.push(k + ' 人不一樣');
      for (const id in A) { if ((A[id] || []).length !== (B[id] || []).length) { d.push(k + ' ' + id + ' 則數不一樣'); continue; }
        A[id].forEach((a, i) => { const b = Object.assign({}, B[id][i]); delete b.ov; if (b.c892 || b.c901) return;   /* （CANON-NO-ECON-1112 第四批：照 AA_901 換字）c901 那一則也不比 */   /* （CANON-NO-ECON-1112 第四批：照 AA_892 第 3 節換字、改層的那幾則不比；tests/msg_chat_unit.js F 項比 AA_892）*/ const walk = (x, y, p) => { if (J(x) === J(y)) return; if (x && y && typeof x === 'object' && typeof y === 'object' && Array.isArray(x) === Array.isArray(y) && !(Array.isArray(x) && x.length !== y.length)) { for (const kk of new Set(Object.keys(x).concat(Object.keys(y)))) walk(x[kk], y[kk], p + (Array.isArray(x) ? '[' + kk + ']' : '.' + kk)); } else if (!at.has(p)) d.push(k + ' ' + p + '：' + J(x) + ' → ' + J(y)); };
          walk(a, b, 'people.' + id + '.replies[' + i + ']'); if (a.ov) d.push(k + ' ' + id + '[' + i + '] BASE 就有 ov'); }); } }
    check('3. 和 BASE ' + BASE + ' 逐則比：人、則數一樣；變的只有稿上那 ' + (R.msg_pool.length + R.msg2_pool.length) + ' 格（其他格子、別的則、別的人零差異；短句只換 at 那一格）', d.length === 0, J(d.slice(0, 4)));
    const nOther = R.msg2_pool.filter(x => x.old === '嗯。').length, all = [].concat(...Object.values(NOW.msg2_pool).map(L => L.flatMap(e => (e.msgs || []).concat(...((e.ask && e.ask.opts) || []).map(o => o.r || []))))).filter(t => t === '嗯。').length;
    console.log('　msg2_pool 還有 ' + all + ' 格「嗯。」（稿上只換 ' + nOther + ' 格：語彤還好嗎回問的回話）');
  });

  await sec(4, async () => {
    const ps = R.msg_pool.find(x => x.who === 'classmate_peishan'), e = ps && NOW.msg_pool.classmate_peishan[toks(ps.at)[3]], e0 = ps && WAS.msg_pool && WAS.msg_pool.classmate_peishan[toks(ps.at)[3]];
    check('4. 沛珊「下次換我帶你去吃早餐。我家的。」（舊設定）那一則：BASE 那一格就是稿的 old（PS755 那一層換過以後的字）、現在是新字', !!ps && ps.old === '下次換我帶你去吃早餐。我家的。' && (!e0 || J(e0.msgs) === J([ps.old])) && J(e.msgs) === J([ps.new]), J([ps && ps.at, e0 && e0.msgs, e && e.msgs]));
    const yt = NOW.msg2_pool.heroine_03[10];
    check('4. 語彤還好嗎（臺灣）回問：「你可以來我家樓下坐一下嗎。」、選項①的回話「嗯。不用真的來，你這樣說就好。」（選項的字、別的回話不動）', yt.ask.q === '你可以來我家樓下坐一下嗎。' && J(yt.ask.opts[0].r) === J(['嗯。不用真的來，你這樣說就好。']) && (!WAS.msg2_pool || J(yt.ask.opts.map(o => o.t)) === J(WAS.msg2_pool.heroine_03[10].ask.opts.map(o => o.t))), J(yt.ask));
    const left = ['msg_pool', 'msg2_pool'].flatMap(k => Object.values(NOW[k]).flatMap(L => L.flatMap(e => e.msgs || []))).filter(t => /我家的。$/.test(t) && /早餐/.test(t));
    console.log('　沛珊「我家的早餐」還在的（不在 AA_785，照留，列給 LAWWW）：' + (left.join('、') || '沒有'));
  });

  await sec(5, async () => {
    const an = R.msg_pool.find(x => x.who === 'heroine_01'), sis = R.msg2_pool.find(x => x.who === 'heroine_05' && /msgs\[0\]$/.test(x.at));
    const ev = (f, n) => new Function(read(f).replace(/^'use strict';/m, '') + ';return ' + n + ';')(), MP = ev(FILES.msg_pool, 'MSG_POOL'), MP2 = ev(FILES.msg2_pool, 'MSG2_POOL');
    check('5. 遊戲載的 MSG_POOL／MSG2_POOL（照檔案執行，Object.assign 那一層也算）：以安、學姊那一則是新字', !!an && !!sis && getp(MP.people.heroine_01.replies, toks(an.at).slice(3)) === an.new && getp(MP2.people.heroine_05.replies, toks(sis.at).slice(3)) === sis.new, J([an && an.at, sis && sis.at]));
  });
  H.done();
})();
