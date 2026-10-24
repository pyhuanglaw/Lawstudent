// BB-B 2026-10-23：日本路線那一學期（2028-02-20～08-05）每一天有什麼——LAWWW-B 19:38 排序第 4 項（AA-B 建議：照 us_sweep61 的方法列空白日，交往中、挽回中）。
//   Node，不需要瀏覽器（tests/pg_harness.js＋日本篇的檔案，同 tests/jp_semester_unit.js 的載法）。一天一天列：
//   在哪（2/20～3/24 住臺北的家＝home；3/25 出發起＝jp；8/5 回程）、課（JP.classesOn）、會停下來的事（JP.nextStop(G,t,where)：JP.SCH、KNOWN、STOPS、出遊、特別的課、回程）、
//   摘要日（JP.SCH 的 sum）、手機（STORY.phoneRules＋PHONE.tick，07:00～23:45 每 15 分鐘）、當天的出遊（OUT.rec）、以安在哪（JP.anWhere，有的話）。
//   沒有課、沒有會停的事、沒有摘要、沒有新訊息、沒有出遊＝「空白日」（給 AA 看要不要補）。
//   MODE=accept：要回的訊息一律選第一個（多半是「好」那一類；群組那一則照 GRP），看答應了以後的樣子；strict（預設）＝都不回。
//   GRP＝挽回中週日 20:00 交換生群組那一則：group（在群組回）／dm（私訊她）／none（不回）。記 REPAIR、一週最多 +1。
//   限制（照實寫進報告）：事件不真的演（只看排了什麼）；「演過才解鎖」的會少算。住臺北的家那幾週可以出門走臺灣的 3D 區域，那裡的偶遇、閒聊這份不算。
// 用法：LW=<開發分支工作樹> [MODE=strict|accept] [GRP=group|dm|none] node jp_sweep.js [輸出.json]
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const LW = process.env.LW; if (!LW) { console.error('要 LW=<工作樹>'); process.exit(2); }
const MODE = process.env.MODE || 'strict', GRP = process.env.GRP || 'none';
const H = require(path.join(LW, 'tests', 'pg_harness.js'));
const { GM } = H, ROOT = H.ROOT, AN = 'heroine_01';
const EXPORT = /^(EXCH|Y34B|MSG|MSG_POOL|MSG2_POOL|GROUP|GROUP_EVENTS|R2Y3A|R2Y3A_EVENTS|R2Y3B|R2Y3B_EVENTS|HOLFF|JP|JP_EVENTS|SIS_JP|SIS_JP_EVENTS|JPB|JP_BLANK_LINES|VACFILL|VACFILL_LINES|VACFILL_UI|VACFILL_EVENTS|JPPREP|JPPREP_LINES|JPPREP_EVENTS)$/;
const load = f => { let src = fs.readFileSync(path.join(ROOT, f), 'utf8'); src = src.replace(/^const (\w+)\s*=/mg, (m, n) => EXPORT.test(n) ? 'globalThis.' + n + '=' : m); vm.runInThisContext(src, { filename: f }); };
const loadErr = [];
for (const f of ['src/holff3d.js', 'src/exchange3d.js', 'src/data/msg_pool.js', 'src/data/msg2_pool.js', 'src/msg3d.js', 'src/data/group_events.js', 'src/group3d.js', 'src/y34b3d.js', 'src/data/r2y3a_events.js', 'src/r2y3a3d.js', 'src/data/r2y3b_events.js', 'src/r2y3b3d.js', 'src/data/jp_events.js', 'src/jp3d.js', 'src/data/sis_jp_events.js', 'src/sis_jp3d.js', 'src/data/jp_blank_lines.js', 'src/jp_blank3d.js', 'src/data/vacfill_events.js', 'src/vacfill3d.js', 'src/data/jpprep_events.js', 'src/jpprep3d.js']) {   /* AA_442 日本出發前五週（jpprep，LAWWW-B 10-24 08:00；index.html 的順序：vacfill 在 jpprep 前面）*/   /* AA_435 的空白日補稿（AA-B 10-24 06:27：不載的話還是 34／26）；舊的開發分支沒有這兩個檔＝照舊列進 loadErr */
  if (!fs.existsSync(path.join(ROOT, f))) { loadErr.push(f + '：沒有這個檔'); continue; } try { load(f); } catch (e) { loadErr.push(f + '：' + e.message); } }
const D = k => STORY.dayOfKey(k), T = (d, h) => d * 24 + h;
const wdOf = d => { const w = CALENDAR.dateOf(d).wd; return w === 7 ? 0 : w; };
const WD = ['日', '一', '二', '三', '四', '五', '六'];
const fmtH = h => { const hh = Math.floor(h + 1e-6), mm = Math.round((h - hh) * 60); return String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0'); };
const PROFILES = {
  dating: { label: '交往中（和以安，AN_SENDOFF together）', dating: true },
  repair: { label: '挽回中（交往過、出發前分開）', dating: false },
};
let ansLog = [];
function answer(G, row) {
  for (const m of PHONE.pending(G)) { const id = m.ask && m.ask.id; if (!id) continue;
    let k = null;
    if (/^jp_grp_/.test(id)) k = GRP === 'group' ? 0 : GRP === 'dm' ? 1 : null;
    else if (MODE === 'accept') k = 0;
    if (k == null) continue;
    const o = (m.ask.opts || [])[k]; if (PHONE.answer(G, id, k) != null) { const s = row.key.slice(5) + ' ' + fmtH(G.hour) + ' ' + id + '→' + (o ? o.t : k); ansLog.push(s); (row.ans || (row.ans = [])).push(s); } }
  STORY.phoneRules(GM); }
function sweep(pk) {
  ansLog = [];
  const P = PROFILES[pk], d0 = D('2028-02-20'), dep = D('2028-03-25'), ret = D('2028-08-05');
  const G = H.fresh('2028-02-20', 9, 'home', { EXCHANGE_ROUTE: 'JP', EXCH_RULE: 1, X1_JP: d0, Y4_PATH: null });
  G.acts = { att: {} }; G.outings = []; G.visited = {}; G.contacts = G.contacts || {}; G.msgs = G.msgs || [];
  if (typeof HOME !== 'undefined' && HOME.rec) HOME.rec(G).at = true;
  H.FAMILIAR(AN); H.date(AN); if (!P.dating) ROM.end(G, AN, 'test');
  for (const [g, n] of [['noodle_team', '麵店團'], ['family_law', '法律系直屬家族'], ['law_class', '法律系（全班）'], ['public_law', '公法讀書會']]) { try { PHONE.join(G, g, n); } catch (e) {} }
  for (const id of ['zhe', 'kai', 'heroine_02', 'heroine_03', 'heroine_04', 'heroine_05', 'classmate_peishan']) { try { H.FRIEND(id); SOCIAL.remember(id, 'FIRST_MET', ''); } catch (e) {} }
  const days = [], errs = [];
  for (let d = d0; d <= ret; d++) {
    const x = CALENDAR.dateOf(d), row = { key: x.key, wd: WD[wdOf(d)], where: null, cls: [], stops: [], sum: [], msgs: [], outs: [], an: {}, hol: null };
    // 出發：3/25 早上（Y34B 演完 JP.arrive）；這裡直接照遊戲的旗標換：3/25 起在 jp_hub
    if (d === dep) { G.flags.JP_DEPARTED = dep; G.flags.AN_JP_DEPARTED = dep; G.zone = 'jp_hub'; if (HOME.rec) HOME.rec(G).at = false; try { PHONE.join(G, 'jp_exchange', '交換生群組'); } catch (e) {} }
    G.day = d; G.weekday = wdOf(d);
    const where = d < dep ? 'home' : 'jp'; row.where = where;
    try { row.hol = JP.holiday(d) ? '假日' : null; } catch (e) {}
    try { row.cls = JP.classesOn(G, d).map(it => fmtH(it.t0) + ' ' + it.c.name); } catch (e) { errs.push(x.key + ' classesOn：' + e.message); }
    try { let t = T(d, 0) - 1e-3; for (let k = 0; k < 12; k++) { const s = JP.nextStop(G, t, where); if (s == null || s >= T(d + 1, 0)) break; row.stops.push(fmtH(s - d * 24)); t = s; } } catch (e) { errs.push(x.key + ' nextStop：' + e.message); }
    const m0 = G.msgs.length, o0 = new Set((OUT.rec ? OUT.rec(G) : []).map(q => q.id));
    for (let h = 7; h < 24; h += 0.25) { G.hour = h; try { STORY.phoneRules(GM); PHONE.tick(G); answer(G, row); } catch (e) { if (errs.length < 40) errs.push(x.key + ' ' + fmtH(h) + ' 手機：' + e.message); } }
    G.hour = 23.5;
    try { row.sum = JP.SCH.filter(s => s.w === where && D(s.d) === d && (!s.if || s.if(G)) && s.sum).map(s => fmtH(s.h) + ' ' + String(typeof s.sum === 'function' ? s.sum(G) : s.sum).slice(0, 40)); } catch (e) { errs.push(x.key + ' sum：' + e.message); }
    try { row.evs = JP.SCH.filter(s => s.w === where && D(s.d) === d && (!s.if || s.if(G)) && s.ev).map(s => fmtH(s.h) + ' ' + (typeof s.ev === 'function' ? s.ev(G) : s.ev)); } catch (e) { row.evs = []; }
    row.msgs = G.msgs.slice(m0).map(m => (m.ask ? '【要回：' + ((m.ask.opts || []).map(o => o.t).join('／')).slice(0, 40) + '】' : '') + (m.th || '') + '｜' + (m.from || '') + '：' + String(m.text || '').slice(0, 30));
    row.outs = (OUT.rec ? OUT.rec(G) : []).filter(q => q.day === d).map(q => fmtH(q.h) + ' ' + (q.title || q.id) + '（' + q.state + '）');
    if (where === 'jp' && JP.anWhere) for (const h of [10, 15, 20]) { G.hour = h; try { const a = JP.anWhere(G); row.an[h] = a == null ? null : String(typeof a === 'object' ? (a.where || a.place || JSON.stringify(a)) : a).slice(0, 24); } catch (e) { row.an[h] = 'ERR'; } }
    row.repair = (G.flags.REPAIR || {})[AN] | 0;
    if (d === dep) row.auto = '出發（機場、登機，Y34B.departJP）';
    if (d === ret) row.auto = '回程（入境大廳 → 臺北的家 → 當晚 1A-08）';
    row.blank = !row.auto && !row.cls.length && !row.stops.length && !row.sum.length && !row.msgs.length && !row.outs.length && !(row.evs && row.evs.length);
    days.push(row);
  }
  const log = (G.flags.REPAIR_LOG || []).map(q => ({ why: q.why, key: CALENDAR.dateOf(q.day).key }));
  return { label: P.label, days, errs, repairLog: log, ans: ansLog.slice() };
}
const out = { lw: LW, mode: MODE, grp: GRP, loadErr, profiles: {} };
for (const pk of Object.keys(PROFILES)) out.profiles[pk] = sweep(pk);
const dst = process.argv[2] || '/dev/stdout';
fs.writeFileSync(dst, JSON.stringify(out, null, 1));
for (const [pk, r] of Object.entries(out.profiles)) {
  const bl = r.days.filter(x => x.blank), blH = bl.filter(x => x.where === 'home'), blJ = bl.filter(x => x.where === 'jp');
  console.log('== ' + r.label + '：' + r.days.length + ' 天，空白 ' + bl.length + ' 天（住臺北的家 ' + blH.length + '、日本 ' + blJ.length + '）；錯誤 ' + r.errs.length);
  console.log('   日本的空白：' + blJ.map(x => x.key.slice(5) + '（' + x.wd + (x.hol ? '・' + x.hol : '') + '）').join('、'));
  console.log('   臺北的家的空白：' + blH.map(x => x.key.slice(5) + '（' + x.wd + '）').join('、'));
  if (r.errs.length) console.log('   錯誤（前 5）：' + r.errs.slice(0, 5).join('｜'));
  if (!PROFILES[pk].dating) console.log('   REPAIR：' + r.repairLog.map(q => q.key.slice(5) + ' ' + q.why).join('、'));
}
if (loadErr.length) console.log('載入錯誤：' + loadErr.join('；'));
