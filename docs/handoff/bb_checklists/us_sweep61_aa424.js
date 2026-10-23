// BB-B 2026-10-23：LAWWW-B 清單 BB_SIS_B6_1023.md 第 61 項「美國交換從頭走到尾」的第一步——每一天有什麼可以做（Node，不需要瀏覽器）。
//   瀏覽器在沙盒每秒 0.1～0.4 格，140 天照真實流程走不完；先用遊戲自己的函式（tests/pg_harness.js＋美國篇的檔案，同 tests/aa412_us_unit.js 的載法）
//   一天一天列出：課（USL.items）、會停下來的事（USL.nextStop：AA_340 的固定事件、出遊、交往中週末的 208）、摘要日（USL.SUM）、
//   手機（STORY.phoneRules＋PHONE.tick，07:00～23:45 每 15 分鐘）、學姊在哪（USL.sisAt 12:00、20:00）、何俊朗在不在會所（USL.longHere 20:00）。
//   沒有課、沒有會停的事、沒有摘要、沒有新訊息＝「空白日」（給 AA 看要不要補）。
//   限制（照實寫進報告）：事件不真的演（只看排了什麼）；所以「演過才解鎖」的訊息會少算。這不是玩家實測，只是找空白的日子；瀏覽器另外抽幾段走。
// 用法：LW=<開發分支工作樹> node us_sweep61.js [輸出.json]   （三種存檔：交往中、挽回中＋見過何俊朗、挽回中沒見過何俊朗）
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const LW = process.env.LW; if (!LW) { console.error('要 LW=<工作樹>'); process.exit(2); }
const H = require(path.join(LW, 'tests', 'pg_harness.js'));
const { GM, E } = H, ROOT = H.ROOT, S5 = 'heroine_05';
global.Z3 = { ZONES: {} }; global.CG_REGISTRY = global.CG_REGISTRY || {};
const EXPORT = /^(EXCH|US3|US_\w+|AIRPORT_T2_LAYOUT|Y34B|R2Y3B|R2Y3B_EVENTS|R2Y4A|R2Y4A_EVENTS|USL|US_LIFE_EVENTS|US208|ROM|PORTRAIT_ONLY)$/;
const load = f => { let src = fs.readFileSync(path.join(ROOT, f), 'utf8'); src = src.replace(/^const (\w+)\s*=/mg, (m, n) => EXPORT.test(n) ? 'globalThis.' + n + '=' : m); vm.runInThisContext(src, { filename: f }); };
const loadErr = [];
for (const f of ['src/exchange3d.js', 'src/data/us_layouts.js', 'src/us3d.js', 'src/y34b3d.js', 'src/data/r2y3b_events.js', 'src/r2y3b3d.js', 'src/data/r2y4a_events.js', 'src/r2y4a3d.js', 'src/data/us_life_events.js', 'src/us_life3d.js', 'src/us208_3d.js', 'src/data/us_blank_lines.js', 'src/us_blank3d.js']) {
  if (!fs.existsSync(path.join(ROOT, f))) { loadErr.push(f + '：沒有這個檔'); continue; } try { load(f); } catch (e) { loadErr.push(f + '：' + e.message); } }
GM.spawnCharacter = (id, x, z, o) => { const n = { id, charId: id, obj: { position: { x, y: 0, z }, rotation: { y: 0 } } }; GM.npc[id] = n; return n; }; GM.removeNPC = id => { delete GM.npc[id]; };
GM.studySession = async () => {};
const D = k => STORY.dayOfKey(k), T = (d, h) => d * 24 + h;
const wdOf = d => { const w = CALENDAR.dateOf(d).wd; return w === 7 ? 0 : w; };
const WD = ['日', '一', '二', '三', '四', '五', '六'];
const US = f => Object.assign({ EXCHANGE_ROUTE: 'US', EXCH_RULE: 1, US_DEPARTED: true, US_ARRIVED: true, US_ARRIVED_DAY: D('2028-08-02'), US1: 'together', Y4_PATH: 'bar', Y4_PATH_DAY: D('2028-06-08') }, f || {});
const fmtH = h => { const hh = Math.floor(h + 1e-6), mm = Math.round((h - hh) * 60); return String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0'); };
const MODE = process.env.MODE || 'strict';   // strict＝BB 原本的判準（只多載兩個檔、日期卡照 if 過濾）；accept＝另外答應 AA_424 的邀約（「好。」）、算 US_BLANK.scenesOn（到那裡才演的）
const PROFILES = {
  dating_canyon: { label: '交往中＋去了大峽谷（US_CANYON；10/7～10/14 整趟是出遊）', flags: US({ US2: 'dating', US_CANYON: true }), dating: true, long: true, canyon: true },
  dating: { label: '交往中（US1 一起去、CALLED_SHUYU）', flags: US({ US2: 'dating' }), dating: true, long: true },
  repair_long: { label: '挽回中＋見過何俊朗（MET_LONG）', flags: US({ US2: 'repair', MET_LONG: true }), dating: false, long: true },
  repair: { label: '挽回中、沒見過何俊朗', flags: US({ US2: 'repair' }), dating: false, long: false },
};
function sweep(pk) {
  const P = PROFILES[pk], d0 = D('2028-08-02'), d1 = D('2028-12-23');
  const G = H.fresh('2028-08-02', 7, 'us_apartment', P.flags); G.contacts = G.contacts || {}; G.msgs = G.msgs || []; G.visited = G.visited || {}; G.vac = G.vac || { reg: {} };
  ROM.rec(G); SOCIAL.rel(S5).fam = 70; SOCIAL.rel(S5).trust = 60; SOCIAL.remember(S5, 'FIRST_MET', '');
  if (P.dating) { G.flags.dating_heroine_05 = true; G.flags.CALLED_SHUYU = true; const r = ROM.get(G, S5); r.status = 'dating'; }
  if (P.long) G.flags.MET_LONG = true;
  // 大四的存檔一般都在這幾個群組（大一起加的）；阿哲那幾位認識、朋友（9/20 美國版的「遠方」要麵店團＋朋友）
  for (const [g, n] of [['noodle_team', '麵店團'], ['family_law', '法律系直屬家族'], ['law_class', '法律系（全班）'], ['public_law', '公法讀書會']]) { try { PHONE.join(G, g, n); } catch (e) {} }
  for (const id of ['zhe', 'kai', 'heroine_01', 'heroine_03', 'heroine_02', 'heroine_04', 'classmate_peishan']) { try { const r = SOCIAL.rel(id); r.fam = 45; r.trust = 30; r.comf = 10; SOCIAL.remember(id, 'FIRST_MET', ''); } catch (e) {} }
  const days = [], errs = [];
  for (let d = d0; d < d1; d++) {
    const x = CALENDAR.dateOf(d), row = { key: x.key, wd: WD[wdOf(d)], cls: [], stops: [], sum: [], msgs: [], outs: [], sis: {}, long: null, hol: null, finals: false };
    G.day = d; G.weekday = wdOf(d);
    try { row.hol = USL.holiday(d); row.finals = !!USL.finals(d); } catch (e) { errs.push(x.key + ' holiday：' + e.message); }
    try { row.cls = USL.items(G, d).map(it => fmtH(it.c.t0) + ' ' + it.c.name); } catch (e) { errs.push(x.key + ' items：' + e.message); }
    try { let t = T(d, 0) - 1e-3; for (let k = 0; k < 12; k++) { const s = USL.nextStop(G, t); if (s == null || s >= T(d + 1, 0)) break; row.stops.push(fmtH(s - d * 24)); t = s; } } catch (e) { errs.push(x.key + ' nextStop：' + e.message); }
    const m0 = G.msgs.length, o0 = new Set((OUT.rec ? OUT.rec(G) : []).map(q => q.id));
    for (let h = 7; h < 24; h += 0.25) { G.hour = h; try { STORY.phoneRules(GM); PHONE.tick(G); if (MODE === 'accept') { for (const m of PHONE.pending(G)) if (/^usb_sat_/.test(m.ask.id)) PHONE.answer(G, m.ask.id, 0); STORY.phoneRules(GM); } } catch (e) { if (errs.length < 40) errs.push(x.key + ' ' + fmtH(h) + ' 手機：' + e.message); } }
    G.hour = 23.5; try { row.sum = USL.SUM.filter(s => D(s.d) === d && (!s.if || s.if(G))).map(s => (s.h != null ? fmtH(s.h) + ' ' : '') + String(USL.sumLine(G, s)).slice(0, 40)); } catch (e) { errs.push(x.key + ' sum：' + e.message); }
    row.scenes = MODE === 'accept' && typeof US_BLANK !== 'undefined' && US_BLANK.scenesOn ? US_BLANK.scenesOn(G, d) : [];
    row.msgs = G.msgs.slice(m0).map(m => (m.ask ? '【要回：' + ((m.ask.opts || []).map(o => o.t).join('／')).slice(0, 40) + '】' : '') + (m.th || '') + '｜' + (m.from || '') + '：' + String(m.text || '').slice(0, 30));
    row.outs = (OUT.rec ? OUT.rec(G) : []).filter(q => !o0.has(q.id) || q.day === d).filter(q => q.day === d).map(q => fmtH(q.h) + ' ' + (q.title || q.id) + '（' + q.state + '）');
    for (const h of [10, 15, 20]) { G.hour = h; try { const a = USL.sisAt(G); row.sis[h] = a ? (a.away || a.zone || JSON.stringify(a)).toString().slice(0, 30) : null; } catch (e) { row.sis[h] = 'ERR'; } }
    G.hour = 20; try { row.long = !!USL.longHere(G); } catch (e) { row.long = 'ERR'; }
    // 12/16 07:00 以後是 R2Y4A.leave 自己演完的一週（交往中：舊金山 ev_sf1～3＋照片；挽回中：布魯明頓摘要日＋12/21 社區巴士），12/21 23:55 起飛、12/22 在飛機上（換日線）
    if (d >= D('2028-12-16') && d <= D('2028-12-21')) row.auto = P.dating ? '舊金山（R2Y4A.leave 自動演）' : '布魯明頓（R2Y4A.leave 自動演）';
    if (d === D('2028-12-22')) row.auto = '飛機上（12/21 23:55 起飛，12/23 05:40 桃園）';
    if (P.canyon && d >= D('2028-10-07') && d <= D('2028-10-14')) row.auto = row.auto || '大峽谷（ev_us_canyon 一整趟，10/14 18:00 回到社區）';
    row.blank = !row.auto && !row.cls.length && !row.stops.length && !row.sum.length && !row.msgs.length && !row.outs.length && !(row.scenes && row.scenes.length);
    days.push(row);
  }
  return { label: P.label, days, errs };
}
const out = { lw: LW, mode: MODE, loadErr, profiles: {} };
for (const pk of Object.keys(PROFILES)) out.profiles[pk] = sweep(pk);
const dst = process.argv[2] || '/dev/stdout';
fs.writeFileSync(dst, JSON.stringify(out, null, 1));
for (const [pk, r] of Object.entries(out.profiles)) {
  const bl = r.days.filter(x => x.blank);
  console.log('== ' + r.label + '：' + r.days.length + ' 天，空白 ' + bl.length + ' 天；錯誤 ' + r.errs.length);
  console.log('   空白：' + bl.map(x => x.key.slice(5) + '（' + x.wd + (x.hol ? '・' + x.hol : '') + '）').join('、'));
  if (r.errs.length) console.log('   錯誤（前 5）：' + r.errs.slice(0, 5).join('｜'));
}
if (loadErr.length) console.log('載入錯誤：' + loadErr.join('；'));
