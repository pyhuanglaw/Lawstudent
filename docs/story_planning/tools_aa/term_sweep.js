// BB-B 2026-10-24：寒暑假每一天有什麼（AA-B 04:27 建議：照 BB_301／BB_302 的方法，用最新開發分支逐天掃寒暑假）。Node，不需要瀏覽器。
//   期間：HOME.breakOf 算出來的每一個法律系寒暑假（大一寒假～大四暑假；有延畢的大五上寒假也會算進來），加上經濟系那年的暑假（G.stage='econ'，只看手機與出遊）。
//   存檔三種 × 住哪兩種：
//     single＝沒交往、在麵店團（dating_kexin 明寫 false：GAME.defaults 預設交往中的可昕）；an＝和以安交往中；zq＝和子晴交往中（BB 女主角）。
//     home＝這個假期回家住（G.home.stay[假期]='home'、放假模式 lbreak）；dorm＝留臺北、住宿舍。
//   一天一天列：會停下來的時間（HOME.breakNext：表上的日子、成績公布日、出遊出發、當面約、交換出發、事件包登記的 HOME.STOPS）、
//     「一定要演」的事件（HOME.mustEvs，10:00／15:00／20:00 各看一次）、手機（STORY.phoneRules＋PHONE.tick，07:00～23:45 每 15 分鐘）、當天的出遊（OUT.rec）、
//     誰在哪（STORY.presence：七位女主角、阿哲、阿凱、明軒、沛珊；12:00）。
//   沒有停點、沒有一定要演的事件、沒有新訊息、沒有出遊＝「空白日」（給 AA 看要不要補）。
//   經濟系那年的暑假（v2，10-24 06:0x）：那時候已經休學、搬回臺北的家（G.flags.Y0_MOVED_OUT、H.base＝HOME.baseMode），停點用 HOME.breakNext＋HOME.y0FixedNext（快轉真的會停的地方），
//     另外記衝刺班日子卡（ECONFF.cramCard）、玩樂日（ECONFF.PLAY_DAYS）；存檔多一種 kexin（和可昕交往中＝GAME.defaults 的預設），只跑這個暑假。
//   MODE=accept：要回的訊息一律選第一個（多半是「好」那一類）；strict（預設）＝都不回。
//   限制（照實寫進報告）：事件不真的演（只看排了什麼）；「演過才解鎖」的會少算；3D 區域裡的偶遇、閒聊、地點觸發的事件不算（只算 mustEvs 那一類）；
//     檔案照 index.html 的順序盡量載，3D 的檔載不進來就跳過（loadErr 照實列）。
// 用法：LW=<開發分支工作樹> [MODE=strict|accept] [ONLY=single_home,an_dorm,...] node vac_sweep.js [輸出.json]
'use strict';
const fs = require('fs'), vm = require('vm'), path = require('path');
const LW = process.env.LW; if (!LW) { console.error('要 LW=<工作樹>'); process.exit(2); }
const MODE = process.env.MODE || 'strict', ONLY = (process.env.ONLY || '').split(',').filter(Boolean);
const H = require(path.join(LW, 'tests', 'pg_harness.js'));
const { GM } = H, ROOT = H.ROOT;
global.Z3 = { ZONES: {} }; global.CG_REGISTRY = global.CG_REGISTRY || {};
// pg_harness 已經載的檔；其他照 index.html 的順序試著載（3D 的會失敗＝跳過）
const LOADED = new Set(['src/data/calendar.js', 'src/data/places.js', 'src/data/characters.js', 'src/data/rel_lines.js', 'src/data/courses.js', 'src/data/activities.js', 'src/data/events.js', 'src/data/ladder.js', 'src/data/home_lines.js',
  'src/social3d.js', 'src/events3d.js', 'src/data/invites.js', 'src/invites3d.js', 'src/phone3d.js', 'src/outings3d.js', 'src/home3d.js', 'src/romance3d.js', 'src/data/date_locations.js', 'src/data/date_lines.js', 'src/data/confess_lines.js', 'src/date3d.js',
  'src/data/termend_lines.js', 'src/termend3d.js', 'src/data/vac_activities.js', 'src/vac3d.js', 'src/story3d.js', 'src/data/syllabus.js', 'src/data/exam_bank.js', 'src/data/legal_qbank.js', 'src/classes3d.js', 'src/data/postgrad_lines.js', 'src/postgrad3d.js']);
const SKIP = /(people3d|assets3d|character3d|props3d|world3d|engine3d|townkit3d|campuskit3d|zones3d|building3d|wancai3d|library3d|library_b1_3d|library_upper3d|dorm3d|lawlib3d|soclib3d|gym3d|teach3d|audio3d|adv3d|game3d|guide3d|placemap3d|crowd3d|bike3d|us3d|us_traffic3d|jp_dorm3d|rooms_glb3d|l118_shops3d|linze_upper3d|lane118\.js|_layouts?\.js|portrait_manifest)/;
const loadErr = [], loadedExtra = [];
const load = f => { let src = fs.readFileSync(path.join(ROOT, f), 'utf8'); src = src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg, 'globalThis.$1='); vm.runInThisContext(src, { filename: f }); };
{ const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'); const L = [...html.matchAll(/src="(src\/[^"?]+)/g)].map(m => m[1]);
  for (const f of L) { if (LOADED.has(f) || SKIP.test(f)) continue; if (!fs.existsSync(path.join(ROOT, f))) continue; try { load(f); loadedExtra.push(f); } catch (e) { loadErr.push(f + '：' + String(e.message).slice(0, 80)); } } }
GM.spawnCharacter = (id, x, z) => { const n = { id, charId: id, obj: { position: { x, y: 0, z }, rotation: { y: 0 } } }; GM.npc[id] = n; return n; }; GM.removeNPC = id => { delete GM.npc[id]; };
GM.studySession = async () => {};
const D = k => STORY.dayOfKey(k), T = (d, h) => d * 24 + h;
const wdOf = d => { const w = CALENDAR.dateOf(d).wd; return w === 7 ? 0 : w; };
const WD = ['日', '一', '二', '三', '四', '五', '六'];
const fmtH = h => { const hh = Math.floor(h + 1e-6), mm = Math.round((h - hh) * 60); return String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0'); };
const WHO = ['heroine_01', 'heroine_02', 'heroine_03', 'heroine_04', 'heroine_05', 'classmate_peishan', 'kexin', 'zhe', 'kai', 'classmate_mingxuan'];
const NM = { heroine_01: '以安', heroine_02: '芷若', heroine_03: '語彤', heroine_04: '子晴', heroine_05: '學姊', classmate_peishan: '沛珊', kexin: '可昕', zhe: '阿哲', kai: '阿凱', classmate_mingxuan: '明軒' };
const PROFILES = {
  single: { label: '沒交往（可昕也沒有）', dating: null },
  kexin: { label: '和可昕交往中（預設）', dating: null, kx: true },
  an: { label: '和以安交往中', dating: 'heroine_01' },
  ps: { label: '和沛珊交往中', dating: 'classmate_peishan' },
  zq: { label: '和子晴交往中', dating: 'heroine_04' },
  sis: { label: '和學姊交往中', dating: 'heroine_05' },
  zr: { label: '和芷若交往中', dating: 'heroine_02' },
  yt: { label: '和語彤交往中', dating: 'heroine_03' },
  sisf: { label: '學姊朋友版（認識、朋友，沒交往）', dating: null },
  sisn: { label: '沒認識學姊', dating: null, unmet: true },
};
// 法律系的每一個假期（HOME.breakOf）＋經濟系那年的暑假（CALENDAR 沒有學期的日子，2025-06-01～開學前一天）
function breaks() {
  return [{ key: process.env.TERM||'Y1S1', from: D(process.env.FROM||'2025-09-01'), to: D(process.env.TO||'2025-12-21'), kind: 'term' }];
}
function answer(G, row) {
  if (MODE !== 'accept') return;
  for (const m of PHONE.pending(G)) { const id = m.ask && m.ask.id; if (!id) continue; const o = (m.ask.opts || [])[0];
    try { if (PHONE.answer(G, id, 0) != null) (row.ans || (row.ans = [])).push(fmtH(G.hour) + ' ' + id + '→' + (o ? o.t : 0)); } catch (e) {} }
  STORY.phoneRules(GM);
}
function sweep(pk, live, B) {
  const P = PROFILES[pk]; const key0 = CALENDAR.dateOf(B.from).key;
  const flags = { EXCHANGE_ROUTE: (process.env.ROUTE||'TW'), EXCH_RULE: 1, dating_kexin: !!P.kx, met_sis: !P.unmet, SIS_W1: !P.unmet };
  if (B.econ) flags.Y0_MOVED_OUT = true;   /* 經濟系暑假＝休學後住臺北的家（HOME.baseMode）*/
  const G = H.fresh(key0, 9, live === 'home' ? 'home' : 'dorm', flags); if (B.econ) G.stage = 'econ';
  G.contacts = G.contacts || {}; G.msgs = G.msgs || []; G.visited = G.visited || {}; G.outings = G.outings || [];
  if (typeof ROM !== 'undefined' && ROM.rec) ROM.rec(G);
  for (const [g, n] of [['noodle_team', '麵店團'], ['family_law', '法律系直屬家族'], ['law_class', '法律系（全班）'], ['public_law', '公法讀書會'], ['home', '家人']]) { try { PHONE.join(G, g, n); } catch (e) {} }
  if (B.econ) { try { PHONE.join(G, 'econ_friends', '走啦'); } catch (e) {} }   /* 經濟系暑假：經濟系朋友的群組（AA_272 第 13 節的「走啦」；LAWWW-B 10-24 07:09：不加的話 8/3、8/4 算不到）*/
  for (const id of WHO) { if (P.unmet && id === 'heroine_05') continue; try { const r = SOCIAL.rel(id); r.fam = 45; r.trust = 30; r.comf = 15; SOCIAL.remember(id, 'FIRST_MET', ''); G.contacts[id] = B.from - 60; } catch (e) {} }
  if (P.dating) { try { const r = SOCIAL.rel(P.dating); Object.assign(r, { fam: 70, trust: 60, comf: 50, npcRom: 60, rom: 40 }); ROM.start(G, P.dating); } catch (e) { G.flags['dating_' + P.dating] = true; } }
  
  if (B.econ && typeof HOME !== 'undefined' && HOME.rec) { const Hm = HOME.rec(G); Hm.base = true; Hm.at = true; }
  const baseOK = B.econ ? !!(HOME.baseMode && HOME.baseMode(G)) : null;
  const days = [], errs = [];
  for (let d = B.from; d <= B.to; d++) {
    const x = CALENDAR.dateOf(d), row = { key: x.key, wd: WD[wdOf(d)], stops: [], evs: [], msgs: [], outs: [], away: {}, hol: null };
    G.day = d; G.weekday = wdOf(d); G.hour = 0;
    if (G.msgs.length > 120) { const P = PHONE.rec(G), gone = G.msgs.splice(0, G.msgs.length - 60); P.cut = (P.cut || []).concat(gone.filter(q => q.tag).map(q => q.tag)); }   /* 200 則上限：先剪掉舊的、tag 記進 cut（模擬修好的樣子），不然 m0 之後看不到新訊息 */
    try { row.hol = CALENDAR.holiday && CALENDAR.holiday(d) ? String(CALENDAR.holiday(d)).slice(0, 12) : null; } catch (e) {}
    try { let t = T(d, 0) - 1e-3; for (let k = 0; k < 12; k++) { let s = HOME.breakNext(G, t); if (B.econ && HOME.y0FixedNext) { const f = HOME.y0FixedNext(G, t); if (f != null && (s == null || f < s)) s = f; } if (s == null || s >= T(d + 1, 0)) break; row.stops.push(fmtH(s - d * 24)); t = s; } } catch (e) { errs.push(x.key + ' breakNext：' + e.message); }
    if (B.econ && typeof ECONFF !== 'undefined') { G.hour = 9; try { const c = ECONFF.cramCard && ECONFF.cramCard(G); if (c) row.cram = String(typeof c === 'object' ? (c.t || c.text || c.title || JSON.stringify(c)) : c).slice(0, 40); } catch (e) {} if ((ECONFF.PLAY_DAYS || []).includes(x.key)) row.play = true; }
    const m0 = G.msgs.length;
    for (let h = 7; h < 24; h += 0.25) { G.hour = h; try { STORY.phoneRules(GM); PHONE.tick(G); answer(G, row); } catch (e) { if (errs.length < 40) errs.push(x.key + ' ' + fmtH(h) + ' 手機：' + String(e.message).slice(0, 80)); }
      if (h === 10 || h === 15 || h === 20) { try { for (const id of HOME.mustEvs(G)) if (!row.evs.includes(id)) row.evs.push(id); } catch (e) { if (errs.length < 40) errs.push(x.key + ' mustEvs：' + e.message); } } }
    row.msgs = G.msgs.slice(m0).map(m => (m.ask ? '【要回】' : '') + (m.th || '') + '｜' + (NM[m.from] || m.from || m.name || '') + '：' + String(m.text || '').slice(0, 140));
    row.mfrom = G.msgs.slice(m0).map(m => m.from || '');
    row.outs = (OUT.rec ? OUT.rec(G) : []).filter(q => q.day === d).map(q => fmtH(q.h) + ' ' + (q.title || q.id) + '（' + q.state + '）');
    G.hour = 12; for (const id of WHO) { try { const p = STORY.presence(id, G); if (p && p.here === false) row.away[NM[id]] = String(p.where || p.place || p.kind || p.why || '不在').slice(0, 14); } catch (e) {} }
    row.blank = !row.stops.length && !row.evs.length && !row.msgs.length && !row.outs.length && !row.cram && !row.play;
    days.push(row);
  }
  return { label: P.label + '・' + (B.econ ? '休學住臺北的家' : live === 'home' ? '回家住' : '留臺北'), days, errs, baseOK };
}
const out = { lw: LW, mode: MODE, loadedExtra: loadedExtra.length, loadErr, breaks: [], runs: {} };
const BS = breaks(); out.breaks = BS.map(b => ({ key: b.key, from: CALENDAR.dateOf(b.from).key, to: CALENDAR.dateOf(b.to).key, days: b.to - b.from + 1 }));
for (const pk of Object.keys(PROFILES)) for (const live of ['dorm']) { const id = pk + '_' + live; if (ONLY.length && !ONLY.includes(id)) continue;
  if (PROFILES[pk].econOnly && live !== 'home') continue;
  out.runs[id] = BS.filter(B => !PROFILES[pk].econOnly || B.econ).map(B => Object.assign({ key: B.key }, sweep(pk, live, B))); }
const dst = process.argv[2] || '/dev/stdout';
fs.writeFileSync(dst, JSON.stringify(out, null, 1));
console.log('假期：' + out.breaks.map(b => b.key + ' ' + b.from + '～' + b.to + '（' + b.days + ' 天）').join('｜'));
console.log('多載的檔 ' + loadedExtra.length + ' 個；載不進來的 ' + loadErr.length + ' 個');
for (const [id, R] of Object.entries(out.runs)) {
  console.log('== ' + id + '（' + R[0].label + '）');
  for (const r of R) { const bl = r.days.filter(x => x.blank); console.log('   ' + r.key + '：' + r.days.length + ' 天，空白 ' + bl.length + ' 天' + (r.baseOK != null ? '（baseMode ' + r.baseOK + '）' : '') + '；錯誤 ' + r.errs.length + (r.errs.length ? '（' + r.errs[0] + '）' : '')); }
}
