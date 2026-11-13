// X324 D 區邀約的覆蓋層（DLG-FULL-REVIEW-1110；LAWWW 2026-11-11 定）：白名單 overlay:true 的稿——AA_783（invite_replies＋invites 13 列）、AA_784（invites：七個女主角、配角七人、(共用) libStudy）——不需要瀏覽器（D131）。
//   工具：tools/story/overlay_rows.py（讀稿、驗格式）、tools/invite/apply_overlay.py（手寫的 invites.js：改原始碼那一個字串，at 當驗證）、tools/invite/build_replies.py 最後一步（產生的 invite_replies.js：照 <列 id>.lines[i] 換）
//   1. 白名單：overlay 的稿一檔一筆、approved、讀得到；apply_overlay.py --check 結束碼 0（每一列已經是新字）
//   2. invites.js：每一列 at 那一格＝new；INVITE_DATA 任何地方（含函式原始碼）沒有 old、原始碼也沒有 old 那個字串（舊句一個不剩）；at 不是玩家選項的字
//   3. invites.js 和 BASE（覆蓋層以前，開發分支 6a302f2fd）逐格比：路徑一樣；變的格子都是稿上的列（old→new；同一個字串掛在好幾個路徑的跟著變），而且每一列都變了；
//      選項的字（ch[i].t）、函式（條件、規則）一格都沒變；稿上沒有的人零差異
//   4. invite_replies.js：每一列 at（列 id.lines[i]）＝new、那一列有 ov（稿的來源）；和 BASE 比只有那幾格不一樣（其他欄位：k、st、tags、cond、say…零差異）；同一個人沒有舊句（別人同一句照留的印出來）
//   5. 兩邊同句：invites.js 換掉的句子，同一個人的 invite_replies.js 也沒有舊句；「現有」的列（ex acc／first）都對得到 invites.js（S.replyRow），對得到的列和 BASE 一樣多
//   6. libStudy（一起念書，(共用)）：和一起念書的場景 study_scenes.js（AA_707）同句的，study_scenes.js 那邊已經是新字、沒有舊字
//   7. 演出來：學姊溫州街、子晴第一次散步、芷若改天（plan）照新字
// 用法：node tests/invite_overlay_1111_unit.js
'use strict';
const H = require('./pg_harness.js');
const { check } = H; const J = JSON.stringify;
const cp = require('child_process'), fs = require('fs'), path = require('path'), os = require('os'), vm = require('vm');
const OE = require('./overlay_expect.js');
const BASE = '6a302f2fd';   /* 覆蓋層以前（開發分支：AA_782 她請客那一個 commit）*/
const sec = async (n, f) => { try { await f(); } catch (e) { check(n + '. 丟出例外', false, String(e && e.stack || e).split('\n').slice(0, 4).join(' / ')); } };
const show = (ref, p) => { try { return cp.execFileSync('git', ['show', ref + ':' + p], { cwd: H.ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1 << 28 }); } catch (e) { return null; } };
const read = f => fs.readFileSync(path.join(H.ROOT, f), 'utf8');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'invov-'));
const leaves = text => { const p = path.join(tmp, 'x' + Math.random().toString(36).slice(2) + '.js'); fs.writeFileSync(p, text); return JSON.parse(cp.execFileSync('node', [path.join(H.ROOT, 'tools/invite/js_leaves.js'), p, 'INVITE_DATA'], { encoding: 'utf8', maxBuffer: 1 << 28 })); };
const lits = s => { const b = s.replace(/\\/g, '\\\\'); return ["'" + b.replace(/'/g, "\\'") + "'", '"' + b.replace(/"/g, '\\"') + '"']; };
const IR = t => { const o = {}; let who = null; for (const ln of t.split('\n')) { let m = /^ "(\w+)":\[$/.exec(ln); if (m) { who = m[1]; continue; } m = /^  (\{.*\})(,?)$/.exec(ln); if (m) { const r = JSON.parse(m[1]); o[r.id] = { who, r }; } } return o; };
const txt = x => typeof x === 'string' ? x : (x && x.me);
/* （CANON-NO-ECON-1112 第四批：照 AA_894 換字）invites.js 以 AA_886～901 為準（同 tools/invite/apply_overlay.py 的 CANON1112_GONE／SUPERSEDED）：
   整個拿掉的那一格（子晴 ZQ_CHANGE_ASK、芯慈 w118_xc_10）底下的列略過、同一個陣列後面的序號往前移；可昕映月湖 first 那一列被 AA_894 換過、略過。BASE 那一份也照同樣拿掉那一格再比 */
const CG = [['people.heroine_04.walk.any', 1], ['people.classmate_xinci.walk.any', 7], ['walk118.classmate_xinci', 9]], CSUP = ['people.kexin.first.lake[0]', 'people.kexin.sport.gym_badminton.during[2][0]'/* AA_940 */];
const cgPath = at => { for (const [pre, k] of CG) { const m = new RegExp('^' + pre.replace(/[.[\]]/g, '\\$&') + '\\[(\\d+)\\](.*)$').exec(at); if (!m) continue; const i = +m[1]; return i === k ? null : i > k ? pre + '[' + (i - 1) + ']' + m[2] : at; } return at; };
const cgLeaves = L => { const o = {}; for (const p in L) { const q = cgPath(p); if (q !== null) o[q] = L[p]; } return o; };
const RI = OE.rows('invites').filter(x => !CSUP.includes(x.at)).map(x => Object.assign({}, x, { at: cgPath(x.at) })).filter(x => x.at !== null), RR = OE.rows('invite_replies');

(async () => {
  const L1 = leaves(read('src/data/invites.js')), b0 = show(BASE, 'src/data/invites.js'), L0 = b0 ? cgLeaves(leaves(b0)) : null;
  /* AA_940（11-13）：可昕法圖改約慢讀那條 rule 拿掉、補 acc.lawlib：BASE 拿掉 rule、現在拿掉 acc.lawlib 再比 */
  if (L0) for (const p of Object.keys(L0)) if (/^people\.kexin\.rule$/.test(p)) delete L0[p];
  for (const p of Object.keys(L1)) if (/^people\.kexin\.acc\.lawlib/.test(p)) delete L1[p];   /* （CANON-NO-ECON-1112 第四批：照 AA_894 換字）拿掉的那兩格先拿掉 */
  const ir1 = IR(read('src/data/invite_replies.js')), irb = show(BASE, 'src/data/invite_replies.js'), ir0 = irb ? IR(irb) : null;
  if (!L0 || !ir0) console.log('（讀不到 BASE ' + BASE + '：第 3、4 項的逐格比略過）');

  await sec(1, async () => {
    const A = JSON.parse(read('docs/handoff/story_import_allow.json')).files.filter(e => e.overlay);
    const P = A.map(e => e.path);
    check('1. 白名單 overlay 的稿：AA_783、AA_784 各一筆（一檔一筆）、approved、有 approvedBy、task DLG-FULL-REVIEW-1110；稿讀得到', ['AA_783_invite_replies', 'AA_784_invites'].every(k => P.filter(p => p === 'docs/story_planning/' + k + '.json').length === 1) && new Set(P).size === P.length && A.every(e => e.status === 'approved' && !!e.approvedBy && e.task === 'DLG-FULL-REVIEW-1110') && OE.have, J(A.map(e => [e.path, e.sha])));
    const r = cp.spawnSync('python3', [path.join(H.ROOT, 'tools/invite/apply_overlay.py'), '--check'], { encoding: 'utf8', timeout: 300000 });
    check('1. tools/invite/apply_overlay.py --check：invites.js 每一列都已經是新字（結束碼 0）', r.status === 0, (r.stdout || r.stderr || '').slice(-300));
    const n783 = RI.filter(x => /AA_783/.test(x.src)).length, n784 = RI.filter(x => /AA_784/.test(x.src)).length;
    /* 2026-11-11（X324 G 區，AA_783_invite_replies.json@60c08798a）：invite_replies 多一列 zr28.say（芷若「店長」→「老闆」，AA_794 搬過來的；zr28.lines[0] 同一列換新字）。舊期望：invite_replies 63 列 */
    check('1. 列數：AA_783 invite_replies ' + RR.length + ' 列（64：lines 63＋zr28.say 1）、invites ' + n783 + ' 列（13）；AA_784 invites ' + n784 + ' 列（117：七個女主角 74、配角七人 34、(共用) libStudy 9）', RR.length === 64 && RR.filter(x => /\.say$/.test(x.at)).length === 1 && n783 === 13 && n784 === 111/* （CANON-NO-ECON-1112 第四批：照 AA_894 換字）AA_784@da666ecda9 移出兩列（115）、拿掉的那一格底下兩列和映月湖 first 一列略過（112）；AA_940 羽球 during 那一列略過（111）；舊期望 117 */, J([RR.length, n783, n784]));
    console.log('　稿：' + OE.docs.map(d => d.src).join('、'));
  });

  await sec(2, async () => {
    const src = read('src/data/invites.js'), bad = [];
    for (const x of RI) {
      if (L1[x.at] !== x.new) bad.push(x.at + ' 現在是「' + L1[x.at] + '」');
      if (/\.(ch|choice|opts)\[\d+\]\.t$/.test(x.at)) bad.push(x.at + ' 是選項的字');
      const left = Object.keys(L1).filter(p => L1[p] === x.old || (L1[p].startsWith('ƒ') && lits(x.old).some(l => L1[p].includes(l))));
      if (left.length) bad.push('「' + x.old + '」還在 ' + left.slice(0, 3).join('、'));
      if (lits(x.old).some(l => src.includes(l))) bad.push('「' + x.old + '」原始碼還有');
      if (x.who !== '(共用)' && x.at.indexOf('people.' + x.who + '.') !== 0) bad.push(x.at + ' 不在 people.' + x.who);
    }
    check('2. invites.js：' + RI.length + ' 列，每一列 at 那一格＝新字；INVITE_DATA（含函式原始碼）和原始碼都沒有舊句；沒有一列是選項的字', bad.length === 0, J(bad.slice(0, 5)));
  });

  await sec(3, async () => {
    if (!L0) return;
    const A891 = require('./canon891_1112.js');   /* （CANON-NO-ECON-1112 第四批：照 AA_891／AA_894 換字）可昕 brunch A 那一格換成 kx25 同一句，不算覆蓋層 */
    const changed = Object.keys(L0).filter(p => L0[p] !== L1[p] && !(/^people\.kexin\.acc\.brunch\.A/.test(p) && L1[p] === A891.BRUNCH)), map = new Map(RI.map(x => [x.old, x.new])), bad = [];
    for (const p of changed) { const a = L0[p], b = L1[p]; if (a.startsWith('ƒ')) { if (!require('./kx_rewrite_1112.js').pair(a, b) && !require('./canon1112_ok.js').pair(a, b)/* （CANON-NO-ECON-1112 第四批：照 AA_894 換字）函式裡的那一句 */) bad.push(p + ' 函式變了'); }   /* 2026-11-12（X324 可昕續改，AA_827_kx_triple_short_2.json@07d50af2f7：手寫檔七句 old→new，清單在 tests/kx_rewrite_1112.js、逐列對稿在 tests/kx_triple2_1112_unit.js）：people.kexin.acc.gym_badminton、firstAt.library 兩個函式裡各換一句字（條件沒變：把那一句換回去＝BASE 的原始碼）。舊期望：函式原始碼一律不變 */ else if (map.get(a) !== b && !require('./canon898_1112.js').pair(a, b) && !require('./canon1112_ok.js').ok(b)/* （CANON-NO-ECON-1112 第四批：照 AA_894 換字）*//* （CANON-NO-ECON-1112 第四批：照 AA_898 換字）*/) bad.push(p + '：「' + a + '」→「' + b + '」不是稿上的列'); }
    check('3. 和 BASE ' + BASE + ' 比：路徑一樣（' + Object.keys(L1).length + ' 格）', J(Object.keys(L0).sort()) === J(Object.keys(L1).sort()));
    check('3. 變的 ' + changed.length + ' 格都是稿上的列（舊字→新字；同一個字串掛在好幾個路徑的跟著變）；函式（條件、規則）沒變', bad.length === 0, J(bad.slice(0, 4)));
    const miss = RI.filter(x => L0[x.at] !== x.old);
    check('3. 稿上每一列在 BASE 那一格都是 old（稿對的是遊戲當時的字）', miss.length === 0, J(miss.slice(0, 3).map(x => [x.at, L0[x.at]])));
    const ch = Object.keys(L0).filter(p => /\.(ch|choice)\[\d+\]\.t$/.test(p));
    check('3. 玩家選項的字（' + ch.length + ' 格 ch[i].t）一格都沒變', ch.length >= 9/* （CANON-NO-ECON-1112 第四批：照 AA_894 換字）子晴 ZQ_CHANGE_ASK 那一格的選項拿掉；舊期望 >=10 */ && ch.every(p => L0[p] === L1[p]));
    const ppl = new Set(RI.map(x => x.who)), other = changed.filter(p => { const m = /^people\.([^.]+)\./.exec(p); return m ? !ppl.has(m[1]) : !ppl.has('(共用)'); });
    check('3. 稿上沒有的人零差異', other.length === 0, J(other.slice(0, 3)));
    console.log('　invites.js：' + RI.length + ' 列 → INVITE_DATA ' + changed.length + ' 格（同一個字串掛在好幾個路徑）');
  });

  await sec(4, async () => {
    const bad = [];
    /* 2026-11-11（X324 G 區，AA_783@60c08798a）：覆蓋層也可以換 say（<列 id>.say，build_replies.py 支援；zr28.say）——say 那一格＝新字。舊期望：只有 <列 id>.lines[i] */
    const A891 = require('./canon891_1112.js');   /* （CANON-NO-ECON-1112 第四批：照 AA_891 換字）可昕那幾列後來照 AA_891 再換（canon891，在覆蓋層之後）：照 AA_891 的字算 */
    for (const x of RR) { const m = /^(\w+)\.(?:lines\[(\d+)\]|(say))$/.exec(x.at), e = m && ir1[m[1]]; if (!e) { bad.push(x.at + ' 沒有這一列'); continue; } if (A891.is(m[1]) && x.who === 'kexin') { if (!A891.ok(e.r)) bad.push(x.at + ' 沒照 AA_891'); continue; } if (e.who !== x.who) bad.push(x.at + ' 是 ' + e.who + ' 的'); const cur = m[3] ? e.r.say : txt(e.r.lines[+m[2]]); if (cur !== x.new) bad.push(x.at + ' 現在是「' + cur + '」'); if (!(e.r.ov || []).includes(x.src)) bad.push(x.at + ' 沒有 ov'); }
    check('4. invite_replies.js：' + RR.length + ' 列，每一列 at 那一格＝新字、那一列有 ov（稿的來源）', bad.length === 0, J(bad.slice(0, 4)));
    const left = [], kept = [];
    for (const x of RR) for (const id in ir1) { const e = ir1[id]; if (!e.r.lines.some(t => txt(t) === x.old)) continue; (e.who === x.who ? left : kept).push(e.who + ' ' + id + '「' + x.old + '」'); }
    check('4. 同一個人沒有舊句', left.length === 0, J(left.slice(0, 4)));
    console.log('　同一句別人還在說（不在稿上，照留）：' + ([...new Set(kept)].join('、') || '沒有'));
    if (!ir0) return;
    delete ir0.kx36; delete ir0.kx38;   /* 可昕 kx36、kx38（CANON-NO-ECON-1112 第三批：這一項拿掉）：BASE 那兩列不比 */
    const at = new Set(RR.map(x => x.at)), d = [];
    for (const id of new Set(Object.keys(ir0).concat(Object.keys(ir1)))) {
      const a0 = ir0[id], b = ir1[id], a = a0 && a0.who === 'kexin' ? Object.assign({}, a0, { r: A891.apply(a0.r) }) : a0; if (!a || !b) { d.push(id + ' 只有一邊有'); continue; }   /* （CANON-NO-ECON-1112 第四批：照 AA_891 換字）BASE 那一列先照 AA_891 換過再比 */
      const A0 = Object.assign({}, a.r), B0 = Object.assign({}, b.r); delete B0.ov; const la = A0.lines, lb = B0.lines; delete A0.lines; delete B0.lines;
      const sv = RR.find(x => x.at === id + '.say'); if (sv) { if (A0.say !== sv.old || B0.say !== sv.new) d.push(id + '.say 不是稿上的 old→new'); delete A0.say; delete B0.say; }   /* 2026-11-11（X324 G 區，AA_783@60c08798a zr28.say）：稿上換 say 的列，say 照 old→new 算，其他欄位照舊零差異。舊期望：say 一律不變 */
      if (J(A0) !== J(B0) || a.who !== b.who) d.push(id + ' 其他欄位變了');
      if (la.length !== lb.length) d.push(id + ' 句數變了'); else la.forEach((t, k) => { if (J(t) !== J(lb[k]) && !at.has(id + '.lines[' + k + ']')) d.push(id + '.lines[' + k + '] 不是稿上的格子'); });
      if (a.r.ov) d.push(id + ' BASE 就有 ov');
    }
    check('4. 和 BASE ' + BASE + ' 比：列一樣（' + Object.keys(ir1).length + '）、變的只有稿上那幾格 lines，k、st、tags、cond、say（表上原文）…零差異', d.length === 0, J(d.slice(0, 4)));
  });

  await sec(5, async () => {
    const left = [];
    for (const x of RI) if (x.who !== '(共用)') for (const id in ir1) { const e = ir1[id]; if (e.who === x.who && e.r.lines.some(t => txt(t) === x.old)) left.push(x.who + ' ' + id + '「' + x.old + '」'); }
    check('5. 兩邊同句：invites.js 換掉的 ' + RI.length + ' 句，同一個人的 invite_replies.js 沒有舊句（AA_783 兩個檔各一列的都換到了）', left.length === 0, J(left.slice(0, 4)));
    const P = INVITE_DATA.people, exMiss = [], exN = [0, 0];
    for (const id in ir1) { const { who, r } = ir1[id]; if (r.ex !== 'acc' && r.ex !== 'first') continue; exN[1]++; const pid = r.tags.find(t => INV.place(t)); const v = r.ex === 'first' ? ((P[who] || {}).first || {})[pid] : ((P[who] || {}).acc || {})[pid], want = Array.isArray(v) ? v : (v && v[r.band]);
      if (Array.isArray(want) && INV.lineKey(want) === INV.lineKey(r.lines)) exN[0]++; else exMiss.push(id); }
    check('5. 「現有」的列（ex acc／first，' + exN[1] + ' 列）每一列都對得到 invites.js 那一格（S.replyRow 靠這個認列）', exMiss.length === 0 && exN[1] > 30, exMiss.join('、'));
    const pair = RI.filter(x => /AA_783/.test(x.src)).map(x => { const r = RR.find(y => y.who === x.who && y.old === x.old); return [x.at, !!r && r.new === x.new]; });
    check('5. AA_783 invites 的 13 列，每一列在 invite_replies 都有同一個人、同一句舊字的列，而且新字一樣', pair.length === 13 && pair.every(p => p[1]), J(pair.filter(p => !p[1])));
  });

  await sec(6, async () => {
    const lib = RI.filter(x => x.who === '(共用)' && /^libStudy\./.test(x.at)); if (!lib.length) { console.log('（還沒有 libStudy 的列：第 6 項略過）'); return; }
    const ss = read('src/data/study_scenes.js'), both = lib.filter(x => ss.includes(x.new));
    check('6. libStudy ' + lib.length + ' 列：study_scenes.js（一起念書的場景，AA_707）沒有任何一句舊字', lib.every(x => !ss.includes(x.old)), J(lib.filter(x => ss.includes(x.old)).map(x => x.old)));
    check('6. 和一起念書同句的（' + both.length + ' 句）兩邊一樣是新字：' + both.map(x => '「' + x.new + '」').join(''), both.length >= 3/* （CANON-NO-ECON-1112 第四批：照 AA_894 換字）可昕 bye 那一列移出覆寫層；舊期望 >=4 */, J(both.map(x => x.at)));
  });

  await sec(7, async () => {
    const S = typeof INV !== 'undefined' && INV.S ? INV.S : INV;
    const sisW = OE.fwd('invites', 'heroine_05', '散步。好。……溫州街我只有路過，沒有真的走過。');
    check('7. 學姊溫州街的答應句是新字（「' + sisW + '」）', J(INVITE_DATA.people.heroine_05.acc.wenzhou) === J([sisW]) && sisW === '散步。好。溫州街我只有路過，沒有真的走過。', J(INVITE_DATA.people.heroine_05.acc.wenzhou));
    check('7. 子晴第一次散步第三句、芷若改天（plan.library）是新字', INVITE_DATA.people.heroine_04.first.wenzhou[2] === '好啦。但要有目的地。' && J(INVITE_DATA.people.heroine_02.plan.library) === J(['我在上班。十點下班，總圖也十點關。你自己加油。']), J([INVITE_DATA.people.heroine_04.first.wenzhou, INVITE_DATA.people.heroine_02.plan.library]));
  });
  fs.rmSync(tmp, { recursive: true, force: true });
  H.done();
})();
