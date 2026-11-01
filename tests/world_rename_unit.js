// WORLD-RENAME-1030（D115，使用者 2026-10-30「Yes, change them」）：遊戲裡玩家看得到的真實校名、館名換成虛構名（docs/WORLD_NAMING.md）。
// 1. src 的字串常數沒有舊名：tools/rename/apply_game.py 查（要換 0 處、法律系館判斷不出來 0 處、產生器的檔 0 處；開發註記 note／source、console.warn、舊存檔比對用的鍵照留）
// 2. index.html 玩家看得到的字（HUD 預設地點、說明頁）
// 3. 遊戲裡舊存檔顯示用的換字（social3d.js 的 SOCIAL.worldName／worldSpoken）和 tools/rename/world_names.py（企劃線換稿、匯入工具讀稿用的那一支）逐句一樣
// 4. 舊存檔：記憶備註、日誌、筆記顯示新名；手機訊息一次換（人物的＝口語、系統＝正式）；N9 的舊備註鍵照舊（存檔裡記的是舊字）
// 5. 讀稿測試的 hook（tests/alison.js）和匯入工具同一套：git show 企劃稿讀進來是新名字
'use strict';
const cp = require('child_process'), fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
let fail = 0;
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fail++; };

/* 1 */
{ const r = cp.spawnSync('python3', [path.join(ROOT, 'tools/rename/apply_game.py')], { encoding: 'utf8' });
  ok(r.status === 0 && /要換 0 處/.test(r.stderr) && /判斷不出來 0 處/.test(r.stderr) && /產生器的檔還有舊名 0 處/.test(r.stderr),
    '1. src 字串常數沒有舊名（apply_game.py）　' + (r.stderr || '').trim() + ' ' + (r.stdout || '').slice(0, 600)); }

/* 2 */
const OLD = /[臺台]灣大學(?!生)|National Taiwan University|\bNTU\b|政治大學|\bNCCU\b|霖澤|萬才館?|傅鐘|椰林大道|小椰林道|醉月湖|洞洞館|自強十舍|國青中心|辜振甫/;
const OLD_CTX = [[/[臺台]大/g, '舞平講櫃陽月擂吧檯戲'], [/政大/g, '財行郵執'], [/活大/g, '生復靈']];
const hasOld = s => OLD.test(s) || OLD_CTX.some(([rx, pre]) => { rx.lastIndex = 0; let m; while ((m = rx.exec(s))) if (pre.indexOf(s.charAt(m.index - 1)) < 0) return true; return false; })
  || /博雅(?!教育|書院|學程|精神|課程)/.test(s) || /小福(?!利)/.test(s);
{ const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').replace(/<!--[\s\S]*?-->/g, '').replace(/<script\b[\s\S]*?<\/script>/g, '').replace(/<style\b[\s\S]*?<\/style>/g, '');
  const text = html.replace(/<[^>]+>/g, '\n');
  const bad = text.split('\n').filter(hasOld);
  ok(!bad.length, '2. index.html 玩家看得到的字沒有舊名　' + bad.slice(0, 3).join(' ／ '));
  ok(/<span id="clockZ">首都帝大校園<\/span>/.test(html) && /你是首都帝大法律系一年級的學生。走進法學院、椰影大道/.test(html), '2b. HUD「首都帝大校園」、說明頁「首都帝大法律系」「椰影大道」'); }

/* 3 */
const soc = fs.readFileSync(path.join(ROOT, 'src/social3d.js'), 'utf8');
const a = soc.indexOf('const WN_PRE='), b = soc.indexOf('S.worldSpoken=');
ok(a > 0 && b > a, '3a. social3d.js 有 worldName／worldSpoken');
const S = {};
vm.runInNewContext(soc.slice(a, soc.indexOf('\n', b)), { S });
const CORPUS = [
  '我在霖澤館等你。', '（霖澤館的穿堂，風從另一頭灌進來。）', '霖澤館 201 教室', '霖澤館201', '萬才館研討室 A', '萬才館研討室', '萬才館二樓（推甄面試）', '回萬才館大廳',
  '霖澤館和萬才館', '萬才館、霖澤館', '霖澤館館內很安靜', '萬才館館長', '霖澤館館', '走出霖澤館', '霖澤館・研究室',
  '你考上台大法律，她考上政大法律。', '國立臺灣大學', '臺灣大學生的日常', '台灣大學', '在台大經濟系', '回到台大。', '臺大學生',
  '舞台大', '平台大型', '講台大聲', '櫃台大姊', '陽台大', '月台大廳', '吧台大杯', '戲台大', '財政大臣', '行政大樓', '郵政大樓',
  '生活大小事', '復活大節', '學活', '週五中午，我們在活大。', '小福的滷肉飯', '小福利社', '小小福',
  '博雅 101', '博雅教學館', '博雅館', '在博雅吵了一小時', '博雅教育', '博雅書院', '博雅學程',
  '傅鐘二十一響。', '椰林大道・傅鐘', '小椰林道', '椰林那邊', '小椰林那邊', '醉月湖邊', '洞洞館', '政大自強十舍', '自強十舍',
  '國青中心', '辜振甫先生紀念圖書館', 'NTU', 'National Taiwan University', 'NCCU', '政大山下的小吃街', '我從政大過來，坐了四十分鐘。', '我們的日子：開車去政大',
  '（萬才館一樓。）「B館？」', '早上的台大好安靜。山上的鳥比較吵。', '沒有舊名的句子。'];
const py = cp.spawnSync('python3', ['-c', 'import sys,json; sys.path.insert(0,sys.argv[1]); import world_names as W; L=json.load(sys.stdin); print(json.dumps([[W.written(s),W.spoken(s)] for s in L],ensure_ascii=False))', path.join(ROOT, 'tools/rename')],
  { input: JSON.stringify(CORPUS), encoding: 'utf8' });
const exp = JSON.parse(py.stdout || '[]');
const diff = [];
CORPUS.forEach((s, i) => { const e = exp[i] || []; if (S.worldName(s) !== e[0]) diff.push(`written「${s}」→ 遊戲「${S.worldName(s)}」／py「${e[0]}」`); if (S.worldSpoken(s) !== e[1]) diff.push(`spoken「${s}」→ 遊戲「${S.worldSpoken(s)}」／py「${e[1]}」`); });
ok(exp.length === CORPUS.length && !diff.length, `3b. ${CORPUS.length} 句：遊戲的換字和 world_names.py 一樣　` + diff.slice(0, 4).join('；'));
ok(S.worldName('霖澤館 201 教室') === '法律系館A 201 教室' && S.worldSpoken('霖澤館201') === 'A館201' && S.worldName('舞台大') === '舞台大' && S.worldName('臺灣大學生') === '臺灣大學生', '3c. 例：法律系館A 201 教室／A館201；舞台大、臺灣大學生不換');
ok(!/\(\?<[!=]/.test(soc.slice(a, b)), '3d. 不用 (?<!…)（舊的 iPhone Safari 不認得，整個檔會載不起來）');

/* 4 */
ok(/return S\.worldName\(S\.filmRename\(m\.note\)\)/.test(soc), '4a. 人物面板的記憶備註（noteShown）顯示新名');
ok(/"BREAKFAST_YU\|傅鐘旁邊的早餐":""/.test(soc), '4b. N9 舊備註的鍵照舊（舊存檔記的是「傅鐘旁邊的早餐」，比對用原字）');
const story = fs.readFileSync(path.join(ROOT, 'src/story3d.js'), 'utf8'), game = fs.readFileSync(path.join(ROOT, 'src/game3d.js'), 'utf8'), phone = fs.readFileSync(path.join(ROOT, 'src/phone3d.js'), 'utf8');
ok(/S\.memoText=\(G,m\)=>\{[^\n]*SOCIAL\.worldName\(t\)/.test(story), '4c. 日誌（memoText）顯示新名');
ok(/WN\(n\.title\)/.test(game) && /WN\(n\.body\)/.test(game), '4d. 筆記（G.notes）顯示新名');
{ // 手機：照 phone3d.js 的那一段跑一次舊存檔
  const i = phone.indexOf('if(!P.worldRen)'), j = phone.indexOf('\n', phone.indexOf('const fix=m=>', i));
  ok(i > 0 && j > i, '4e. phone3d.js 有舊存檔手機訊息的一次換名（P.worldRen）');
  const G = { msgs: [{ th: 'p:heroine_01', who: 'heroine_01', text: '我在霖澤館等你。' }, { th: 'sys', text: '法律系：大二模擬法庭抽籤，霖澤館 201。' }, { th: 'g:lawclub', from: 'npc_lawclub_pres', text: '萬才館一樓。' }] };
  const P = { groups: { a: { name: '台大法律系' } }, q: [{ who: 'kexin', text: '我從政大過來。' }] };
  vm.runInNewContext(phone.slice(i, j), { P, G, SOCIAL: { worldName: S.worldName, worldSpoken: S.worldSpoken } });
  ok(P.worldRen === 1 && G.msgs[0].text === '我在A館等你。' && G.msgs[1].text === '法律系：大二模擬法庭抽籤，法律系館A 201。' && G.msgs[2].text === 'B館一樓。' && P.q[0].text === '我從木柵大學過來。' && P.groups.a.name === '首都帝大法律系',
    '4f. 舊存檔手機：人物「A館」、系統「法律系館A 201」、群組名、還沒送的　' + JSON.stringify([G.msgs.map(m => m.text), P.q[0].text, P.groups.a.name])); }

{ // 出遊：照 outings3d.js 的 S.rec 跑一次舊存檔（BB-B 10-30：G.outings 的 title／place／back 沒換）
  const out = fs.readFileSync(path.join(ROOT, 'src/outings3d.js'), 'utf8'), m = out.match(/\n  S\.rec=G=>\{[\s\S]*?return G\.outings; \};/);
  ok(!!m, '4g. outings3d.js 的 S.rec 有舊存檔出遊的一次換名（OUT_WORLDREN）');
  if (m) { const ctx = { SOCIAL: { worldName: S.worldName }, S: {} }; vm.runInNewContext(m[0].replace(/^\n  S\.rec=/, 'S.rec='), ctx);
    const G = { flags: {}, outings: [{ title: '去政大找可昕', place: '政大', back: '回到台大。', state: 'planned' }, { title: '家事調查官的演講（霖澤館 201）', place: '霖澤館 201' }] };
    ctx.S.rec(G); const a = JSON.stringify(G.outings.map(q => [q.title, q.place, q.back || ''])); G.outings[0].title = '去政大找可昕'; ctx.S.rec(G);
    ok(G.flags.OUT_WORLDREN === 1 && a === JSON.stringify([['去木柵大學找可昕', '木柵大學', '回到首都帝大。'], ['家事調查官的演講（法律系館A 201）', '法律系館A 201', '']]) && G.outings[0].title === '去政大找可昕',
      '4h. 舊存檔出遊：標題、地點、回程字幕換正式名，只換一次　' + a); } }

/* 5 */
{ require('./alison.js');
  const base = cp.execSync('git -C ' + JSON.stringify(ROOT) + ' log -1 --format=%H 8ad5272df^', { encoding: 'utf8' }).trim();   // 企劃線開始換名以前
  const doc = cp.execSync('git -C ' + JSON.stringify(ROOT) + ' show ' + base + ':docs/story_planning/AA_330_法律系的課搬教室_X78.md', { encoding: 'utf8' });
  ok(!/霖澤館/.test(doc.split('\n').filter(l => !/使用者|查證|官方/.test(l)).join('\n')) && /法律系館A|A館/.test(doc), '5. 讀稿 hook：換名以前的企劃稿 git show 讀進來是新名字（AA_330）'); }

console.log(fail ? `FAILED ${fail}` : 'ALL PASS');
process.exit(fail ? 1 : 0);
