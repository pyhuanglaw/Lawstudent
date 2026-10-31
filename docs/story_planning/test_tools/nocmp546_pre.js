// BB-B 10-31：NO-COMPARE-1030 剩下的部分（AA_546 第 0、3、4、7 節）瀏覽器探針 nocmp546_probe.py 的前置，先在 Node 對遊戲資料算過——不開瀏覽器。
// 每一個情境：那一天那一刻（探針讀檔用的日期、時間、關係、旗標）動態／私訊／群組／203 阿凱／閒聊階梯／宿營破冰會不會出、畫面上會出現哪幾句（印出原文）。
// 另外：AA_546 列的舊句子（排名、贏他、輸給、比我……）在 src 裡還有沒有（只掃字串，不分註解）。
// 用法：node docs/story_planning/test_tools/nocmp546_pre.js <開發分支工作樹> [使用者存檔.json]（不改工作樹的檔案）
//   給了使用者存檔＝第 3、4、7 節照探針的讀檔做（同一份存檔深拷貝、改日子時間地點、ROOM_Y2～4、KX_DEC3_MIGRATED、關係照探針的 SETUP 數值、聯絡方式）；沒給＝空的新存檔（pg_harness 的 H.fresh）。宿營破冰兩種都是新遊戲。
const WT = process.argv[2]; if (!WT) { console.log('用法：node nocmp546_pre.js <工作樹>'); process.exit(2); }
process.chdir(WT);
require(WT + '/tests/alison.js'); const H = require(WT + '/tests/pg_harness.js');
const fs = require('fs'), vm = require('vm'), path = require('path');
const { GM, E } = H, J = x => JSON.stringify(x);
const loadG = (f, names) => { let s = fs.readFileSync(path.join(H.ROOT, f), 'utf8'); for (const n of names) s = s.replace(new RegExp('^const ' + n + '\\s*=', 'm'), 'globalThis.' + n + '='); vm.runInThisContext(s, { filename: f }); };
const errs = [];
for (const [f, n] of [['src/data/camp_y1.js', ['CAMP_Y1_EVENTS']], ['src/data/msg_pool.js', ['MSG_POOL']], ['src/data/msg2_pool.js', ['MSG2_POOL']], ['src/msg3d.js', ['MSG']],
  ['src/family_xmas3d.js', ['FAMXMAS']], ['src/data/noodle_table.js', ['NOODLE_TABLE']], ['src/data/dorm_room_layout.js', ['DORM_ROOM']], ['src/data/dorm203_lines.js', ['DORM203_LINES']], ['src/dorm203_3d.js', ['DORM203']],
  ['src/data/heard_lines.js', ['HEARD_LINES']], ['src/heard3d.js', ['HEARD']],
  ['src/data/feed_y1s1.js', ['FEED_Y1S1']], ['src/data/feed_y1s2.js', ['FEED_Y1S2']], ['src/data/feed_y2s1.js', ['FEED_Y2S1']], ['src/data/feed_y2s2.js', ['FEED_Y2S2']], ['src/data/feed_y3s1.js', ['FEED_Y3S1']],
  ['src/data/feed_y3s2.js', ['FEED_Y3S2']], ['src/data/feed_y4s1.js', ['FEED_Y4S1']], ['src/data/feed_y4s2.js', ['FEED_Y4S2']], ['src/data/feed_pg.js', ['FEED_PG']], ['src/feed3d.js', ['FEED']], ['src/whois3d.js', ['WHOIS']]]) {
  try { if (fs.existsSync(path.join(H.ROOT, f))) loadG(f, n); else errs.push('沒有 ' + f); } catch (e) { errs.push(f + '：' + (e && e.message || e)); } }
if (errs.length) console.log('載入：', J(errs));
const DK = k => STORY.dayOfKey(k), K = d => CALENDAR.dateOf(d).key, wdOf = d => { const w = CALENDAR.dateOf(d).wd; return w === 7 ? 0 : w; };
const TD = (term, w, wd) => { const R = CALENDAR.termDays(term); return R.from + (w - 1) * 7 + (wd - 1); };   /* wd 1＝週一 … 7＝週日 */
const at = (d, h) => { H.G.day = d; H.G.hour = h; H.G.weekday = wdOf(d); };
const fresh = (d, h, flags, zone) => { const G = H.fresh(K(d), h, zone || 'dorm', flags); G.contacts = G.contacts || {}; if (!Array.isArray(G.outings)) G.outings = []; return G; };
const SAVE = process.argv[3] ? JSON.parse(fs.readFileSync(process.argv[3], 'utf8')) : null;
const ROOMS = [['ROOM_Y2', '2026-09-06'], ['ROOM_Y3', '2027-09-05'], ['ROOM_Y4', '2028-09-03']];
/* 同探針的 launch：使用者存檔深拷貝 → ROOM_Y2～4（日子到了的）、KX_DEC3_MIGRATED、flags → 改日子時間地點（pos 拿掉）；交往照存檔（存檔裡和可昕交往中，不動）*/
const fromSave = (d, h, flags, zone) => { const s = JSON.parse(JSON.stringify(SAVE)), G = s.G || s, F = G.flags; for (const [k, kk] of ROOMS) { const dd = DK(kk); if (dd <= d) F[k] = dd; }
  F.KX_DEC3_MIGRATED = true; Object.assign(F, flags || {}); Object.assign(G, { day: d, hour: h, zone: zone || 'dorm', pos: null, weekday: wdOf(d), money: Math.max(G.money || 0, 30000) }); delete G._stuck;
  H.G = G; SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); H.said = []; H.opts = []; H.picks = []; GM.npc = {}; E.interactables = []; E.npcs = []; if (STORY._fy) STORY._fy.reset();
  G.contacts = G.contacts || {}; if (!Array.isArray(G.outings)) G.outings = []; return G; };
const mk = SAVE ? fromSave : fresh;
/* 關係：同探針 SETUP 的數值（ACQ 8／FAMILIAR 25／FRIEND 45,30,10／CLOSE 65,50,45）、FIRST_MET、聯絡方式沒有就記 2025-09-24 */
const LV = { ACQ: [8, 0, 0], FAM: [25, 0, 0], FRIEND: [45, 30, 10], CLOSE: [65, 50, 45] };
const who = (id, lv) => { const R = SOCIAL.rel(id), v = LV[lv]; R.fam = v[0]; R.trust = v[1]; R.comf = v[2]; SOCIAL.remember(id, 'FIRST_MET', ''); if (H.G.contacts[id] == null) H.G.contacts[id] = DK('2025-09-24'); };
const walk = (d, h, step) => { const st = step || 0.05, end = d * 24 + h; for (let t = H.G.day * 24 + H.G.hour; t < end - 1e-9; t += st) { const dd = Math.floor(t / 24); at(dd, +(t - dd * 24).toFixed(4)); FEED.tick(H.G); HEARD.phone && HEARD.phone(H.G); PHONE.tick(H.G); } at(d, h); FEED.tick(H.G); HEARD.phone && HEARD.phone(H.G); PHONE.tick(H.G); };
const th = t => (H.G.msgs || []).filter(m => PHONE.th(m) === t).map(m => (m.from === 'player' ? '你：' : '') + m.text + (m.ask ? '　［回覆鍵 ' + m.ask.opts.map(o => o.t).join('／') + '］' : ''));
const item = id => FEED.rec(H.G).items.find(i => i.id === id) || null;
const hm = h => { const x = ((h % 24) + 24) % 24, H0 = Math.floor(x + 1e-6), M = Math.round((x - H0) * 60); return String(H0).padStart(2, '0') + ':' + String(M).padStart(2, '0'); };
const out = {}; let bad = 0;
const rep = (k, ok, info) => { out[k] = { ok, ...info }; console.log((ok ? 'OK   ' : 'NG   ') + k + '　' + J(info)); if (!ok) bad++; };
const SRC = (() => { const L = []; const walkDir = d => { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walkDir(p); else if (/\.js$/.test(f)) L.push(p); } }; walkDir(path.join(H.ROOT, 'src')); return L.map(p => [path.relative(H.ROOT, p), fs.readFileSync(p, 'utf8')]); })();
const noCmt = t => t.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' ')).replace(/^\s*\/\/.*$/mg, '');   /* 註解換成空白（行號不變）；字串裡的 // 不動 */
const grepSrc = (s, cmt) => SRC.filter(([f, t]) => (cmt ? t : noCmt(t)).includes(s)).map(([f, t]) => { const u = cmt ? t : noCmt(t), i = u.indexOf(s); return f + ':' + (u.slice(0, i).split('\n').length); });

(async () => {
  /* ---------------- 第 0 節：宿營破冰 ---------------- */
  {
    const ev = STORY_EVENTS.find(e => e.id === 'ev_camp_d1_ice'), bus = STORY_EVENTS.find(e => e.id === 'ev_camp_d1_bus');
    for (const pick of ['臺北人。', '臺北。我家就在這附近。']) {
      fresh(DK('2025-08-22'), 10.5, {}, 'dorm'); H.picks = [pick]; H.said = []; H.opts = [];
      await EVENTS.run(ev);
      const L = H.said.map(s => (s.who ? s.who + '：' : '') + s.t);
      rep('CAMP_ICE 選「' + pick + '」', H.opts.some(o => o.join('|') === '「臺北。我家就在這附近。」|「臺北人。」'), { opts: H.opts.map(o => o.slice()), lines: L.slice(18, 30) });
    }
    fresh(DK('2025-08-22'), 8.5, {}, 'dorm'); H.picks = ['坐阿哲旁邊', '洋芋片']; H.said = []; H.opts = []; await EVENTS.run(bus);
    rep('CAMP_BUS 坐阿哲旁邊（照舊：「我阿哲。張哲維。高雄上來的。」）', H.said.some(s => s.t === '我阿哲。張哲維。高雄上來的。'), { lines: H.said.map(s => s.t).slice(0, 8) });
    const OLD0 = ['順便講你今天早餐吃什麼', '早餐……車上那包洋芋片算嗎', '早餐是我家樓下的燒餅', '早餐是我媽做的蛋餅', '沒吃，五點的客運', '早餐一個饅頭', '早餐兩個飯糰', '「便利商店的飯糰。」', '「一杯豆漿，在車上喝完了。」', '「我媽塞給我的三明治。」'];
    const inCamp = s => grepSrc(s).filter(x => x.startsWith('src/data/camp_y1.js'));   /* 「便利商店的飯糰。」別的事件也有（bbpack_events.js 吃早餐那一題），只看宿營那一份 */
    rep('CAMP 舊的早餐句不在 src/data/camp_y1.js（註解不算）', OLD0.every(s => !inCamp(s).length), { hits: OLD0.map(s => [s, inCamp(s)]).filter(x => x[1].length) });
  }

  /* ---------------- 第 7 節：明軒的個性（手機「朋友」→ 資料） ---------------- */
  {
    const c = CHARACTERS.classmate_mingxuan;
    mk(DK('2025-09-15'), 12, {}, 'campus'); if (!SAVE) H.rel('classmate_mingxuan', 8, 0, 0);
    const desc = typeof WHOIS !== 'undefined' && WHOIS.desc ? WHOIS.desc(H.G, 'classmate_mingxuan', c.personality) : c.personality;
    rep((SAVE ? '［使用者存檔］' : '') + 'MX7 personality（social_layer ' + c.social_layer + '：人物頁那一行＝personality；WHOIS.desc 不換）', desc === '看起來很輕鬆，其實自己偷偷念；社團活動比上課重要；跟阿哲一起打球',
      { known: SOCIAL.has('classmate_mingxuan', 'FIRST_MET') || !!H.G.flags.met_classmate_mingxuan, personality: c.personality, desc, whois: WHOIS.lines(H.G, 'classmate_mingxuan'), oldInSrc: grepSrc('看起來完全沒念書，考試卻很高分'), oldInComment: grepSrc('看起來完全沒念書，考試卻很高分', true) });
  }

  /* ---------------- 第 3 節：子晴、阿凱 ---------------- */
  const SAT11 = TD('Y1S1', 11, 6);
  {  // zq3 動態（認識）＋ zq_practice 私訊（朋友）
    for (const kind of ['cm', 'dm']) {
      mk(SAT11, 17.93, {}); who('heroine_04', 'FRIEND'); walk(SAT11, 18.02);
      const it = item('zq3'); const r = it ? FEED.respond(H.G, 'zq3', kind) : null;
      rep('ZQ3_' + kind.toUpperCase() + '（' + K(SAT11) + ' 17:56 讀檔 → 18:01；子晴 FRIEND＋聯絡方式）', !!it && !!r, { post: it && { at: K(it.day) + ' ' + hm(it.h) }, pic: FEED_Y1S1.posts.find(p => p.id === 'zq3').pic, say: '第三', thread: th('p:heroine_04') });
    }
    for (const pick of ['他沒講。', '妳第三也很強。']) {
      mk(SAT11, 23.43, {}); who('heroine_04', 'FRIEND'); walk(SAT11, 23.52);
      const m = (H.G.msgs || []).find(x => x.ask && x.ask.id === 'aa503_zq_practice'); let after = null;
      if (m) { const k = m.ask.opts.findIndex(o => o.t === pick); PHONE.answer(H.G, m.ask.id, k); after = th('p:heroine_04'); }
      rep('ZQ_PRAC 選「' + pick + '」（' + K(SAT11) + ' 23:26 → 23:31）', !!m, { thread: after || th('p:heroine_04') });
    }
  }
  {  // 203 阿凱（heard_lines.js:109）：DORM_FOUR、認識子晴、第 11 週週六 18:00 以後。探針走 talkKai：先 STORY.kaiDormTalk（K-D1 一起打電動＝週日～四 21～24 點會先演，所以挑 20:20）、再 DORM203.kaiTalk（HEARD 包住）
    const day = TD('Y1S1', 12, 2), F4 = SAVE ? { DORM_FOUR: true } : { DORM_FOUR: true, introDone: true, MET_KAI: true, MET_ZHE: true, afternoonDone: true, kaiAsked: true };
    mk(day, 20.25, F4); if (!SAVE) who('kai', 'FRIEND'); who('heroine_04', 'ACQ'); H.said = [];
    const kd = await STORY.kaiDormTalk(GM, { name: '阿凱' }); const kdSaid = H.said.map(s => s.t); H.said = [];
    const r = kd ? null : await DORM203.kaiTalk(GM, { name: '阿凱' });
    rep('KAI203（' + K(day) + ' 20:15 宿舍；【捷徑】DORM_FOUR；認識子晴、ZQ_PRACTICE 沒有）', !kd && r === true && H.said.some(s => s.t === '系上那個練習賽，子晴第三。她跑來問我那題怎麼寫，問了一個小時。'),
      { kaiDormTalk: kd, kdSaid, era: DORM203.era(H.G), r203On: STORY.r203On(H.G), stageKai: SOCIAL.stage('kai'), said: H.said.map(s => s.t), whereKai: (() => { try { const w = STORY.whereIs(GM, 'kai'); return w && { zone: w.zone, act: w.act }; } catch (e) { return 'ERR ' + e.message; } })() });
  }
  {  // 子晴 Q2-L3（大一下，FAMILIAR；CONTEST_DAY 那一版＝AA_546 的新句；沒有 CONTEST_DAY＝第 10～16 週那一版）
    const days = []; for (let w = 10; w <= 13; w++) for (let wd = 1; wd <= 7; wd++) days.push(TD('Y1S2', w, wd));
    const where = [];
    for (const d of days) for (const h of [14.5, 15.5, 16.5, 19.5, 20.5]) { mk(d, h, {}, 'campus'); who('heroine_04', 'FAM'); let w = null; try { w = STORY.whereIs(GM, 'heroine_04'); } catch (e) { w = { zone: 'ERR ' + e.message }; } if (w && w.zone) where.push([K(d), 'wd' + wdOf(d), h, w.zone, w.act || null, w.with || null]); }
    const pickW = where.filter(x => /library|cafe|campus|wancai/.test(x[3]));
    console.log('     子晴大一下第 10～13 週下午、晚上在哪（STORY.whereIs）：', J(where.slice(0, 40)));
    for (const cd of [true, false]) {
      const d = TD('Y1S2', 12, 2); mk(d, 14.6, {}, 'campus'); who('heroine_04', 'FAM'); if (cd) SOCIAL.remember('heroine_04', 'CONTEST_DAY', '');
      const so = H.G.social; so.ladder = so.ladder || {}; so.ladder['heroine_04@Y1S2'] = 2; so.ladderDay = so.ladderDay || {}; delete so.ladderDay.heroine_04;
      const st = STORY.ladNext(H.G, 'heroine_04'); H.said = []; H.opts = []; H.picks = ['妳還好嗎？'];
      if (st) await STORY.ladPlay(GM, { name: '子晴' }, 'heroine_04', st);
      rep('ZQL3' + (cd ? '' : '_W') + '（' + K(d) + ' 14:36 校園；FAMILIAR；ladder heroine_04@Y1S2＝2' + (cd ? '；記憶 CONTEST_DAY' : '；沒有 CONTEST_DAY') + '）', !!st && st.id === 'Q2-L3', { step: st && st.id, where: (() => { try { const w = STORY.whereIs(GM, 'heroine_04'); return w && [w.zone, w.act]; } catch (e) { return 'ERR'; } })(), said: H.said.map(s => s.t), opts: H.opts.map(o => o.slice()) });
    }
  }

  /* ---------------- 第 4 節：可昕 ---------------- */
  const KXF = { EXCHANGE_ROUTE: 'TW', EXCH_RULE: 1 };
  {  // kx5（大一上第 12 週週四 23:50，朋友）留言「妳呢？」
    const d = TD('Y1S1', 12, 4); mk(d, 23.77, KXF); who('kexin', 'FRIEND'); walk(d, 23.85);
    const it = item('kx5'), r = it ? FEED.respond(H.G, 'kx5', 'cm') : null;
    rep('KX5（' + K(d) + ' 23:46 → 23:51；可昕 FRIEND）留言「妳呢？」', !!r, { post: it && K(it.day) + ' ' + hm(it.h), thread: th('p:kexin').slice(-3) });
  }
  {  // kx_moot 私訊（大二上第 11 週週六 22:30）＋ 23:50 予樂 h505_yule
    const d = TD('Y2S1', 11, 6);
    for (const pick of ['妳一定可以。', '他講得很好嗎？']) {
      mk(d, 22.43, KXF); who('kexin', 'FRIEND'); walk(d, 22.52);
      const m = (H.G.msgs || []).find(x => x.ask && x.ask.id === 'aa503_kx_moot'); const before = th('p:kexin').slice(-3);
      if (m) PHONE.answer(H.G, m.ask.id, m.ask.opts.findIndex(o => o.t === pick));
      rep('KXMOOT 選「' + pick + '」（' + K(d) + ' 22:26 → 22:31）', !!m, { before, after: th('p:kexin').slice(-3) });
    }
    mk(d, 23.77, KXF); who('kexin', 'FRIEND'); H.G.contacts.yule = DK('2025-09-24'); walk(d, 23.85);
    rep('YULE135（' + K(d) + ' 23:46 → 23:51；【前置】有予樂的聯絡方式）', th('p:yule').some(t => t === '她好認真'), { cond: HEARD.COND.yule(H.G), thread: th('p:yule') });
  }
  {  // 品妤 h505_pinyu（大二上第 12 週週二 21:20，走啦群組＋可昕聯絡方式）
    const d = TD('Y2S1', 12, 2); mk(d, 21.27, KXF); who('kexin', 'FRIEND'); PHONE.join(H.G, 'econ_friends', '走啦'); walk(d, 21.35);
    rep('PINYU137（' + K(d) + ' 21:16 → 21:21；走啦群組）', th('g:econ_friends').some(t => t.includes('可昕說她模擬法庭沒過')), { cond: HEARD.COND.econGroup(H.G), thread: th('g:econ_friends') });
  }
  {  // 2027-04-10 kx_win 22:30＋予樂 h506_yule 23:00；4/11 13:00 kx2d 動態
    const d = DK('2027-04-10');
    mk(d, 22.43, KXF); who('kexin', 'FRIEND'); H.G.contacts.yule = DK('2025-09-24'); walk(d, 22.52);
    const m = (H.G.msgs || []).find(x => x.ask && x.ask.id === 'aa503_kx_win');
    rep('KXWIN（2027-04-10 22:26 → 22:31）', !!m, { thread: th('p:kexin').slice(-4) });
    if (m) PHONE.answer(H.G, m.ask.id, 0);
    walk(d, 22.93); walk(d, 23.02);
    rep('YULE141（同一晚 22:56 → 23:01）', th('p:yule').some(t => t.includes('把上次輸的那份書狀拿出來看')), { thread: th('p:yule') });
    const d2 = d + 1; walk(d2, 12.93); walk(d2, 13.02);
    let it = item('kx2d');
    rep('KX2D（4/11 13:00 動態；接著同一份）', !!it, { item: it, done: FEED.rec(H.G).done.kx2d || null });
    for (const kind of ['cm', 'dm']) {
      mk(d2, 12.93, KXF); who('kexin', 'FRIEND'); walk(d2, 13.02); it = item('kx2d'); const r = it ? FEED.respond(H.G, 'kx2d', kind) : null;
      rep('KX2D_' + kind.toUpperCase() + '（2027-04-11 12:56 讀檔 → 13:01）', !!r, { thread: th('p:kexin').slice(-3), done: FEED.rec(H.G).done.kx2d || null });
    }
  }
  {  // kx2e（大三上第 4 週週六 22:00，認識）留言「學姊了。」
    const d = TD('Y3S1', 4, 6); mk(d, 21.93, KXF); who('kexin', 'FRIEND'); walk(d, 22.02);
    const it = item('kx2e'), r = it ? FEED.respond(H.G, 'kx2e', 'cm') : null;
    rep('KX2E（' + K(d) + ' 21:56 → 22:01）留言「學姊了。」', !!r, { post: it && K(it.day) + ' ' + hm(it.h), done: FEED.rec(H.G).done.kx2e || null, thread: th('p:kexin').slice(-2) });
  }
  {  // feed_pg kx3i（2030-10-13 22:00）：只看動態本身會不會出（畢業以後篇的跳時間不在 Node 模擬）
    const d = DK('2030-10-13'); mk(d, 21.88, Object.assign({}, KXF, { GRADUATED: DK('2029-06-02') })); who('kexin', 'FRIEND'); walk(d, 22.05);
    const it = item('kx3i'), r = it ? FEED.respond(H.G, 'kx3i', 'dm') : null;
    rep('KXPG（2030-10-13 21:53 → 22:03；Node 不跑畢業以後篇的跳時間）私訊問「緊張嗎？」', !!r, { done: FEED.rec(H.G).done.kx3i || null, thread: th('p:kexin').slice(-2) });
  }

  /* ---------------- 舊句子還在不在 src（AA_546 第 3、4 節列的，加上一般的比較字） ---------------- */
  {
    const OLD = ['她一直說下次要贏我', '只有一點點不真心', '我媽說考第一名才買', '我沒考第一名', '我下次要贏他', '贏大一的我有點不好意思', '算啦。贏了就是贏了。', '我好怕她', '輸給一個大三的', '那代表她很生氣', '沒有輸給大三那一晚', '我很不服氣', '我比她早開始三天', '不要說比我多', '我才讀到第二章', '看起來完全沒念書，考試卻很高分'];
    const hits = OLD.map(s => [s, grepSrc(s)]).filter(x => x[1].length), cm = OLD.map(s => [s, grepSrc(s, true)]).filter(x => x[1].length);
    rep('OLD AA_546 第 0／3／4／7 節列的舊句不在 src（註解不算；註解裡的另列）', !hits.length, { hits, inComments: cm });
    const GRAY = ['真心的。大部分是。', '好到我很生氣。', '……不算。'];
    console.log('     灰色（AA_546 沒列、同一段裡的句子）：', J(GRAY.map(s => [s, grepSrc(s)])));
  }
  console.log((SAVE ? '［使用者存檔 ' + process.argv[3] + '］' : '［空的新存檔］') + (bad ? ' NG ' + bad : ' ALL OK'));
  fs.writeFileSync(process.env.OUT_JSON || '/dev/null', J(out));
})().catch(e => { console.log('例外', e && e.stack); process.exit(1); });
