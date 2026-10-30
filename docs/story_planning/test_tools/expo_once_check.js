// BB-B 10-24 11:5x：once 活動「開始以後才坐下＝選單沒有聽演講」的 Node 重現（EXPO_Y2）。用法：LW=<工作樹> node expo_once_check.js
// 載入方式照 vac_sweep.js（pg_harness＋index.html 順序）
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
const onceList = ACTIVITIES.list.filter(a => a.once).map(a => a.id + '｜' + a.title + '｜' + a.zone + '/' + a.room + '｜' + (a.kind || ''));
console.log('once 活動', onceList.length, JSON.stringify(onceList, null, 0));
const G = H.fresh('2027-03-18', 12.43, 'dorm', { EXCHANGE_ROUTE: 'TW', EXCH_RULE: 1 });
G.zone = 'boya';
const a = ACTIVITIES.list.find(x => x.id === 'EXPO_Y2');
console.log('12:26 坐下以前 atSeat =', (ACTIVITIES.atSeat(G, 'boya', '101') || {}).id || null, '｜onceDone', ACTIVITIES.onceDone(G, a), '｜canJoin', ACTIVITIES.canJoin(G, a));
ACTIVITIES.track(G, 'boya', '101', true);   // 遊戲 seatMenu：sitAt → actTrack() → 才組選單
console.log('track 後紀錄', JSON.stringify((G.acts || {}).att || {}));
console.log('12:26 坐下以後 atSeat =', (ACTIVITIES.atSeat(G, 'boya', '101') || {}).id || null, '｜stateOf', ACTIVITIES.stateOf(G, 'EXPO_Y2'), '｜onceDone', ACTIVITIES.onceDone(G, a), '｜canJoin', ACTIVITIES.canJoin(G, a));
const G2 = H.fresh('2027-03-18', 12.2, 'dorm', { EXCHANGE_ROUTE: 'TW', EXCH_RULE: 1 }); G2.zone = 'boya';
ACTIVITIES.track(G2, 'boya', '101', true);
console.log('12:12（開始前）坐下以後 atSeat =', (ACTIVITIES.atSeat(G2, 'boya', '101') || {}).id || null, JSON.stringify((G2.acts || {}).att || {}));
