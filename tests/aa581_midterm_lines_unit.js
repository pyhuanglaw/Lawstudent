// AA_581 取消期中考：殘留台詞逐句改稿（企劃線 454218182，AA 2026-11-02 第 11 節定稿；D118、使用者 11-02 05:0x「沒有期中考」；任務 D118-MIDTERM-STORY-1102）——不需要瀏覽器。
//   (a) AA 改的每一列（第 1～73 列、連2～連8、第 7 節 B／C）：檔案裡有「改成」、沒有「原句」；第 3、70～73 列是人工改的（程式拼字、順延的版本、沛珊 12/23）另外查。
//   (b) src/ 裡所有字串常值（註解不算）：還提到期中考（期中考、期中前、期中放榜、期中成績、考完期中…）的，只能是允許清單上的——
//       AA_581 標「保」的列、AA 改成以後講別人的期中考的兩列、舊存檔備註的比對鍵、D118 第一輪（AA_578 第 3 節）已判斷保留的（經濟系那一年、外系外校、別人的期中、內部說明…）。
//       新寫的法律課期中考台詞會在這裡失敗。
// 用法：node tests/aa581_midterm_lines_unit.js
// 修改前（開發分支 5506d6259）：FAILED（(a) 幾乎每一列、(b) 66 句裡改掉的那些）；修改後 ALL PASS。
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..');
let fails = 0, n = 0;
const check = (name, ok, info) => { n++; console.log((ok ? 'PASS ' : 'FAIL ') + name + (ok || !info ? '' : '　' + info)); if (!ok) fails++; };
const R = f => { try { return fs.readFileSync(path.join(ROOT, f), 'utf8'); } catch (e) { return ''; } };
const cnt = (s, x) => s.split(x).length - 1;

/* ---------- (a) 逐列：[列, 檔案, 原句, 改成]（原句、改成照 src 裡的寫法；同一句在兩個檔的列兩個都列）---------- */
const ROWS = [
  ['1', 'src/aa555_3d.js', '期中前十四天。進度落後半天。', '期末前十四天。進度落後半天。'],
  ['2', 'src/aa555_3d.js', '期中前七天。……今天念得很慢，可是記得住。', '期末前七天。……今天念得很慢，可是記得住。'],
  ['3', 'src/aa555_3d.js', "('期中前'+CN(n)+'天。')", "('期末前'+CN(n)+'天。')"],
  ['4', 'src/data/events.js', '民總期中，第三題你怎麼寫？', '民總那份案例作業，第三題你怎麼寫？'],
  ['連2', 'src/data/events.js', "tag:'ASKED_BACK',note:'期中放榜'", "tag:'ASKED_BACK',note:'案例作業發回來'"],
  ['連3', 'src/data/events.js', "note:'期中放榜，跟他講第三題你怎麼寫'", "note:'案例作業發回來，跟他講第三題你怎麼寫'"],
  ['連4', 'src/social3d.js', '"ASKED_BACK|期中放榜，反問他考幾分":"期中放榜"', '"ASKED_BACK|期中放榜，反問他考幾分":"案例作業發回來"'],
  ['連5', 'src/whois3d.js', '大一上期中考完，他問過你第三題怎麼寫。', '大一上期中週的案例作業，他問過你第三題怎麼寫。'],
  ['連6', 'src/classes3d.js', "ev_bohan_score:'同學問期中考的題目'", "ev_bohan_score:'同學問作業的題目'"],
  ['5', 'src/story3d.js', '憲法期中有人知道第三題到底在問什麼嗎', '憲法作業發回來了 有人知道第三題到底在問什麼嗎'],
  ['6', 'src/story3d.js', '問沈以安啊 她考超高', '問沈以安啊 老師拿她的當範例'],
  ['連7', 'src/story3d.js', '那天早上憲法發回期中考', '那天早上憲法發回期中週的案例作業'],
  ['7', 'src/data/y1fill_events.js', '期中考完的人 舉手', '報告寫完的人 舉手'],
  ['8', 'src/data/y1fill_events.js', "['classmate_bohan','我還有一科。']", "['classmate_bohan','我還有一份。']"],
  ['9', 'src/data/y1fill_events.js', '……我去念書了。', '……我去寫了。'],
  ['10', 'src/data/twfill_events.js', '（大三下的期中考。你在考卷背面算了一下：再三個學期就畢業了。）', '（大三下的期中週。你在筆記本最後一頁算了一下：再三個學期就畢業了。）'],
  ['11', 'src/data/twfill_events.js', '大四的期中考 為什麼還是期中考', '大四的期中週 為什麼還是要交報告'],
  ['12', 'src/data/twfill_events.js', '最後一次期中考', '最後一次期中週'],
  ['13', 'src/data/twfill_events.js', "['yu','考完了'],['zhe','最後一次']", "['yu','過一半了'],['zhe','最後一次']"],
  ['14', 'src/y2r2_3d.js', '（期中考完，第一次在麵店遇到大家。春假去了哪裡，到現在還有人在講。）', '（期中週過了，第一次在麵店遇到大家。春假去了哪裡，到現在還有人在講。）'],
  ['15', 'src/y2r2_3d.js', "N('yu','期中考完了')", "N('yu','這週的報告交完了')"],
  ['16', 'src/data/r2y3b_events.js', '期中考版的春假。只有兩個小時。', '趕報告版的春假。只有兩個小時。'],
  ['17', 'src/data/r2y3b_events.js', '「期中考完再來一次？」', '「期中週過完再來一次？」'],
  ['18', 'src/data/r2y3b_events.js', '期中考完是第十週。我記一下。', '期中週過完是第十週。我記一下。'],
  ['19', 'src/data/y3fill_events.js', '（期中考完的那一週，沒有課。你把刑訴旁聽作業的筆記整理成兩頁。）', '（期中週。你把刑訴旁聽作業的筆記整理成兩頁。）'],
  ['20', 'src/practice3d.js', '（期中考那一週，實習照樣要去。', '（期中週，課照上，實習也照樣要去。午休的時候，你在會議室角落讀筆記。助理經過，把冷氣調小了一點。）'],
  ['21', 'src/data/sis_b8_events.js', '期中考完再告訴我一次。', '下下週再告訴我一次。'],
  ['22', 'src/data/sis_b15_events.js', '期中考完了。……再說一次，都還好嗎？', '下下週了。……再說一次，都還好嗎？'],
  ['23', 'src/data/feed_y1s2.js', '期中考的考卷，背面朝上', '案例作業的題目紙，背面朝上'],
  ['24/25', 'src/data/feed_y1s2.js', "say:'考完。',cm:['考得怎樣？'", "say:'交了。',cm:['寫得怎樣？','還沒改。'],dm:['背面朝上？','不想看。']"],
  ['26', 'src/data/home_lines.js', '期中考考得怎麼樣？', '這學期報告多不多？'],
  ['27', 'src/data/home_lines.js', '"t": "還在等成績。"', '"t": "還好。"'],
  ['28', 'src/data/home_lines.js', '"t": "有一科不太好。"', '"t": "有一份不太順。"'],
  ['29', 'src/data/home_lines.js', '"dad": "不太好就下次好。"', '"dad": "不順的先放著，先吃飯。"'],
  ['30', 'src/data/events.js', '你們法律系的期中考，也要背那麼多嗎？', '你們法律系考試，也要背那麼多嗎？'],
  ['31', 'src/data/events.js', '經濟系的期中，會不會跟法律系的撞在同一週？', '經濟系的期末，會不會跟法律系的撞在同一週？'],
  ['32', 'src/data/events.js', '期中考前一週我會出現。這是我和學分的約定。', '期末考前一週我會出現。這是我和學分的約定。'],
  ['33', 'src/data/sup497_lines.js', '期中考前一週我會出現。這是我和學分的約定。', '期末考前一週我會出現。這是我和學分的約定。'],
  ['34', 'src/story3d.js', '不用啦，期中前再看就好。要的時候跟我說。', '不用啦，期末前再看就好。要的時候跟我說。'],
  ['35', 'src/story3d.js', '期中考應該全部改成開書考', '考試應該全部改成開書考'],
  ['36', 'src/data/needed_msgs.js', '期中成績出來，不要跟我說以安考幾分。……我想先自己對完。', '作業發回來了，不要跟我說以安拿幾分。……我想先自己對完。'],
  ['37', 'src/data/noodle_table.js', '期中考範圍我整理成一張表了。', '期末考範圍我整理成一張表了。'],
  ['38', 'src/data/invites.js', '財管的期中跟債總同一天。早上算利息，下午寫遲延利息。……至少主題有連起來。', '財管的期中考完，下午接債總。早上算利息，下午聽遲延利息。……至少主題有連起來。'],
  ['39', 'src/data/eat_lines.js', '你今天的課，老師有講到期中考的範圍嗎？我那時候在恍神。', '你今天的課，老師有講到期末考的範圍嗎？我那時候在恍神。'],
  ['40', 'src/data/date_lines.js', '……還好。期中考從這裡看也很小。', '……還好。期末考從這裡看也很小。'],
  ['41', 'src/data/date_lines.js', '……不能。我剛剛在想期中考。', '……不能。我剛剛在想期末考。'],
  ['42', 'src/data/date_lines.js', '這部跟你的期中考撞到了。……換下一場。', '這部跟你的期末考撞到了。……換下一場。'],
  ['43', 'src/linze_upper3d.js', '白板上寫著期中考的範圍，旁邊畫了一張表，三格打勾，兩格還空著。', '白板上寫著期末考的範圍，旁邊畫了一張表，三格打勾，兩格還空著。'],
  ['44', 'src/data/ladder.js', '期中準備得怎樣？', '期中週了，你讀得怎樣？'],
  ['45', 'src/data/ladder.js', '期中考完了，你考得怎樣？', '最近讀得怎樣？'],
  ['46', 'src/data/ladder.js', '你期中哪一週最多？期中考那週我有三科。', '你報告哪一週最多？期中週我有三份要交。'],
  ['連8', 'src/data/ladder.js', '她期中十月最後那週有三科', '"AN_L9_MIDTERM_WEEK": "她期中週有三份報告要交"'],
  ['47', 'src/data/ladder.js', '期中都考完了。', '期中週的作業都交了。'],
  ['48', 'src/data/ladder.js', '刑總第二題我寫完才發現，題目問的不是那個。', '刑總第二題我交出去才發現，題目問的不是那個。'],
  ['49', 'src/data/ladder.js', '「我也考得不太好。」', '「我也寫得不太好。」'],
  ['50', 'src/data/ladder.js', '考卷發回來你先對。不懂的問我。', '發回來你先對。不懂的問我。'],
  ['51', 'src/data/ladder.js', '期中的刑總，最後一題我寫了一個不確定的答案。', '期中週刑總那份當堂寫的作業，最後一題我寫了一個不確定的答案。'],
  ['52', 'src/story3d.js', '……我下週也期中，二十六號考第一科。', '……我下週期中，二十六號考第一科。'],
  ['53', 'src/r3_3d.js', '民訴期中，你們那邊考哪一題？', '民訴期中考完了。最後一題沒寫完。'],
  ['54～58', 'src/r3_3d.js', "{t:'最後一題沒寫完。',say:[{from:'kexin',text:'我也是。",
    "opts:[{t:'考哪一題？',say:[{from:'kexin',text:'你們老師上禮拜講的那個。……我們老師一定是約好的。'}]},{t:'不要想了。',say:[{from:'kexin',text:'好。不想。'},{from:'kexin',text:'……還是會想。'}]}]"],
  ['59', 'src/data/r2y3b_events.js', '你那邊期中考了嗎？', '你那邊報告交了嗎？'],
  ['60', 'src/data/r2y3b_events.js', "O:['考了。','下禮拜。']", "O:['交了。','下禮拜。']"],
  ['61', 'src/data/ladder.js', '期中。我們系也考試。……我現在知道出題的人在想什麼了。', '期中。我們系要考試。……我現在知道出題的人在想什麼了。'],
  ['62', 'src/data/events.js', '我聽說你們要寫到手斷掉。', '我聽說你們期末要寫到手斷掉。'],
  ['66/67', 'src/data/syllabus.js', '（群組）柏翰：期中考範圍更新了。', '（群組）柏翰：期末考範圍表更新了。'],
  ['68', 'src/story3d.js', '刑訴的筆記我幫你印了。後天才考，不要慌。', '刑訴的筆記我幫你印了。上禮拜的都在裡面，不要慌。'],
  ['69', 'src/story3d.js', '好。考完再跟我講一次。', '好。病好了再跟我講一次。'],
  ['70', 'src/data/events.js', null, "text:'明天晚上滷味，來不來？'"],
  ['71', 'src/data/events.js', null, "text:'明天晚上麵店，七點，來不來？'"],
  ['72', 'src/story3d.js', null, "s2.day!==s2.exam?'考完了 今天麵店，七點，長桌':'刑總考完了 今天麵店，七點，長桌'"],
  ['7B', 'src/data/events.js', '（阿姨的手腕綁著護腕。', '（阿姨的手好了，今天端麵的還是語彤。）'],
  ['7B', 'src/data/events.js', null, "text:'（今天端麵的是一個沒見過的女生。）'"],
  ['7C', 'src/data/noodle_table.js', "if:{weeks:[6,7,14,15]}", "{who:['zhe'],if:{weeks:[14,15]}"],
];
for (const [row, f, oldS, newS] of ROWS) {
  const s = R(f);
  check('(a) 第 ' + row + ' 列 ' + f + '：有「' + newS.slice(0, 40) + '」' + (oldS ? '、沒有「' + oldS.slice(0, 30) + '」' : ''), !!s && s.includes(newS) && (!oldS || !s.includes(oldS)), JSON.stringify({有新: s.includes(newS), 舊還在: oldS ? cnt(s, oldS) : 0}));
}
/* 第 63～65 列：民總、刑分、債總二第 7 週的黑板（經濟系那一年的會計學 acct_y0 同字，照舊）*/
{ const s = R('src/data/syllabus.js'), j = s.indexOf('{'), J = s ? JSON.parse(s.slice(j, s.lastIndexOf('}') + 1)) : null, bd = c => J && J.courses[c] && J.courses[c][6] ? J.courses[c][6].board[2] : null;
  check('(a) 第 63～65 列：民總、刑分、債總二第 7 週黑板「下週、下下週：前七週整理＋案例作業」；經濟系那一年的會計學照舊「下週、下下週：期中考」',
    ['civ_general', 'crim_spec', 'oblig_gen2'].every(c => bd(c) === '下週、下下週：前七週整理＋案例作業') && bd('acct_y0') === '下週、下下週：期中考', JSON.stringify(['civ_general', 'crim_spec', 'oblig_gen2', 'acct_y0'].map(bd))); }
/* 第 3 列、連1：柏翰倒數算到第一科期末考（S.bhCountDay）；AT 的日子函式拿得到 G */
{ const s = R('src/aa555_3d.js');
  check('(a) 連1：柏翰倒數那天＝大一上第一科期末考往前 21 天（CLS.examList），沒有期末考用第 13 週週一；S.atRule 把 G 傳給日子函式',
    s.includes("['y1s1_bh_count',BH,G=>S.bhCountDay(G),22,") && /S\.bhCountDay=G=>\{[^\n]*CLS\.examList\(G,'Y1S1'\)[^\n]*L\[0\]\.day-21[^\n]*TD\('Y1S1',13,1\)/.test(s) && s.includes('const d=dayFn(G);') && !s.includes("()=>TD('Y1S1',5,1)")); }
/* 第 70～72 列：宵夜順延到隔天（S.supperLate）才換句；平常照舊 */
{ const ev = R('src/data/events.js'), st = R('src/story3d.js');
  check('(a) 第 70、71 列：平常那句照舊（「晚上滷味，來不來？」「晚上麵店，七點，來不來？」），順延時（STORY.supperLate）換「明天晚上…」',
    cnt(ev, "text:'晚上滷味，來不來？'") === 1 && cnt(ev, "text:'晚上麵店，七點，來不來？'") === 1 && cnt(ev, "STORY.supperLate(G,'Y1S1','civ_general')") === 2 && cnt(ev, "STORY.supperLate(G,'Y1S2','crim_gen2')") === 2);
  check('(a) 第 70～72 列：STORY.supperDay／supperLate（day!==exam＝順延）；群組「考完了 滷味」照舊（保30）',
    /S\.supperLate=\(G,term,cid\)=>\{ const x=S\.supperDay\(G,term,cid\); return !!x&&x\.day!==x\.exam; \}/.test(st) && st.includes("text:'考完了 滷味'")); }
/* 第 73 列：沛珊① 大三上提前到 12/23（四）21:00、她的話換、已經約好去台南就不發 */
{ global.window = global; let CT = null;
  try { vm.runInThisContext(R('src/data/cracktalk_lines.js').replace(/^const CRACKTALK_LINES\s*=/m, 'globalThis.CRACKTALK_LINES='), { filename: 'cracktalk_lines.js' }); CT = globalThis.CRACKTALK_LINES; } catch (e) { CT = null; }
  const P = CT && CT.SRC2 && CT.SRC2.ps1 ? CT.SRC2.ps1 : (CT && CT.X2 && CT.X2.ps1) || null, find = o => { if (!o || typeof o !== 'object') return null; if (o.ps1 && o.ps1.byTerm) return o.ps1; for (const k in o) { const r = find(o[k]); if (r) return r; } return null; };
  const ps1 = P || find(CT), y = ps1 && ps1.byTerm && ps1.byTerm.Y3S1;
  check('(a) 第 73 列：沛珊① 大三上那一版「明天平安夜。……這週末要視訊嗎？還是你還在考試？」→「好啊！考試加油。……聖誕快樂。」；其他學期照舊',
    !!y && y.ask === '明天平安夜。……這週末要視訊嗎？還是你還在考試？' && JSON.stringify(y.w8) === JSON.stringify(['好啊！考試加油。……聖誕快樂。']) && ps1.ask === '這週末要視訊嗎？還是你要考試？' && ps1.me === '這週考試，下週好不好？', JSON.stringify(y));
  const c = R('src/cracktalk3d.js');
  check('(a) 第 73 列：大三上週四（psWd 4）21:00 發、其他學期週五；那一週已經約好去台南找她（S.psTnBooked：fest3d 聖誕、termend3d te_gf_、ev_hv_ps_tn）就不發',
    c.includes("const psWd=t&&t.id==='Y3S1'?4:5;") && c.includes("wdOf(d)===psWd&&h>=21&&t.week===S.psExamWeek(G,t.id)&&!(t.id==='Y3S1'&&S.psTnBooked(G,d))") && /S\.psTnBooked=\(G,d\)=>[^\n]*q\.fest\.id===PS&&q\.fest\.mode==='meet'&&q\.place==='台南'[^\n]*te_gf_[^\n]*ev_hv_ps_tn/.test(c)); }
/* 記憶 id、標籤 id 不改（存檔相容）*/
{ const lad = R('src/data/ladder.js'), ev = R('src/data/events.js');
  check('(a) 記憶 id 不改：AN_L8_MIDTERM、AN_L9_MIDTERM_WEEK 還在 ladder.js；TOLD_SCORE、ASKED_BACK、SUPPER_MID1、SUPPER_MID2 還在 events.js',
    ['AN_L8_MIDTERM', 'AN_L9_MIDTERM_WEEK'].every(x => lad.includes('"' + x + '"')) && ['TOLD_SCORE', 'ASKED_BACK', 'SUPPER_MID1', 'SUPPER_MID2'].every(x => ev.includes(x))); }

/* ---------- (b) src/ 字串常值裡還提到期中考的，只能是允許清單上的 ---------- */
function strings(src) {   // 字串常值（註解、正規表示式不算）
  const out = []; let i = 0, prev = '';
  while (i < src.length) {
    const c = src[i], d = src[i + 1];
    if (c === '/' && d === '/') { i = src.indexOf('\n', i); if (i < 0) break; continue; }
    if (c === '/' && d === '*') { i = src.indexOf('*/', i + 2); if (i < 0) break; i += 2; continue; }
    if (c === '"' || c === "'" || c === '`') { let j = i + 1, s = ''; while (j < src.length && src[j] !== c) { if (src[j] === '\\') { s += src[j] + src[j + 1]; j += 2; continue; } s += src[j]; j++; } out.push(s); i = j + 1; prev = 'x'; continue; }
    if (c === '/' && /[(,=:\[!&|?{};+\n]/.test(prev || '\n')) { let j = i + 1, cls = false; while (j < src.length) { const e = src[j]; if (e === '\\') { j += 2; continue; } if (e === '[') cls = true; else if (e === ']') cls = false; else if (e === '/' && !cls) break; else if (e === '\n') break; j++; } i = j + 1; prev = 'x'; continue; }
    if (!/\s/.test(c)) prev = c; i++;
  }
  return out;
}
const walk = (dir, L) => { for (const f of fs.readdirSync(dir)) { const p = path.join(dir, f); if (fs.statSync(p).isDirectory()) walk(p, L); else if (/\.js$/.test(f)) L.push(p); } return L; };
const MID = /期中考|期中前|期中放榜|期中成績|期中.{0,2}考完|考完.{0,2}期中/;
/* [檔案, 字串開頭（前 30 字）] */
const ALLOW = [
  /* AA_581 保留（AA 標「保」的列）*/
  ['src/data/events.js', '期中考的範圍，你好像不用看。'],   /* 保12（經濟學原理，非法律課）*/
  ['src/data/syllabus.js', '期中考是一篇作文。題目很簡單，寫好很難。'],   /* 保25 */
  ['src/data/syllabus.js', '期中考：一篇作文，題目當天公布。'],   /* 保28 */
  ['src/data/syllabus.js', '期中考：閱讀測驗和一篇短文。'],   /* 保26 */
  ['src/data/syllabus.js', '（期中前最後一堂）'],   /* 保21 */
  ['src/data/syllabus.js', '（期中前）'],   /* 保23 */
  ['src/story3d.js', '期中前，兩校互考。'],   /* 保18（可昕的期中）*/
  ['src/y2r2_3d.js', '第一次：期中前那個週五，晚上六點半，山下那一攤。不能來就視訊'],   /* 保20 */
  /* AA_581 改成以後，講的是別人的期中考（芯慈雙主修的經濟系課、可昕在政大）*/
  ['src/data/invites.js', '「財管的期中考完，下午接債總。早上算利息，下午聽遲延利息。…'],   /* 第 38 列 */
  ['src/r3_3d.js', '民訴期中考完了。最後一題沒寫完。'],   /* 第 53 列 */
  /* 舊存檔備註的比對鍵（social3d.js NOTE_RENAMED_N9：存檔裡的舊字，畫面上顯示右邊的新字）*/
  ['src/social3d.js', 'ASKED_BACK|期中放榜'],
  ['src/social3d.js', 'ASKED_BACK|期中放榜，反問他考幾分'],
  ['src/social3d.js', 'TOLD_SCORE|期中放榜，跟他講第三題你怎麼寫'],
  /* D118 第一輪（AA_578 第 3 節，docs/handoff/D118_MIDTERM_UNSURE.md 開頭）已判斷保留、不在 AA_581 清單裡的：經濟系那一年、外系外校與別人的期中、家教學生、美國、停用事件、時間詞、資料檔裡的內部說明 */
  ['src/classes3d.js', '期中考'],
  ['src/classes3d.js', '期中考週開始了。這兩週的課都是考試。'],
  ['src/data/characters.js', 'AA_497 2-2：期中考前，和以安在總圖一樓的影印機前（演過就不'],
  ['src/data/characters.js', 'AA_497 2-2：期中考前，和芯慈在總圖一樓的影印機前（演過就不'],
  ['src/data/characters.js', 'AA_497 4-2 (b)：期中考週的下午在總圖三樓（明軒的熱咖啡；演過'],
  ['src/data/characters.js', '自由出行第三批的偶遇（AA_271 第 1 節）：期中前總圖搶不到位子'],
  ['src/data/characters.js', '自由出行第二批的偶遇（AA_162 第 8 節 aca122d2：讀書會期中'],
  ['src/data/crowd_depts.js', 'A：你期中考完了嗎？／B：考完一科，還有三科。／A：那你現在要去'],
  ['src/data/crowd_depts.js', 'A：通識也有期中考？／B：有，選擇題。／A：選擇題我可以。'],
  ['src/data/date_lines.js', '上次的好運，我拿去考期中考了。……有用。'],
  ['src/data/date_lines.js', '這條路我走過。期中考前一個人走的。'],
  ['src/data/dorm_layout.js', '102 寢室。門上貼著一張紙：「期中考週，請小聲，謝謝。」'],
  ['src/data/events.js', 'AA_376 #2（企劃線 69aa3b0c，AA 定）：v7 舊課堂，課表系統已'],
  ['src/data/events.js', '「家教那個學生期中考進步了。他媽媽塞給我一袋柳丁。」'],
  ['src/data/events.js', '下下禮拜就期中考了。你經原讀到哪了？'],
  ['src/data/events.js', '今天？快期中考了耶。'],
  ['src/data/events.js', '大一期中考那週，你有沒有發現我不在圖書館？'],
  ['src/data/events.js', '就是因為快期中考了。我還是不想念書。'],
  ['src/data/events.js', '我媽今天打來，問我期中考幾分。還沒考。'],
  ['src/data/events.js', '期中考完，阿勳在門上貼了一張紙：「第四題，答案是零。」'],
  ['src/data/events.js', '期中考後'],
  ['src/data/events.js', '期中考那一週'],
  ['src/data/events.js', '（公館。下禮拜就是期中考。）'],
  ['src/data/feed_y2s1.js', '期中考前的早場。'],
  ['src/data/ladder.js', '**不說大一期中那週她顧店到很晚、在櫃台念書**——那是大二事件 1'],
  ['src/data/ladder.js', '2026-10-16 BB-B（AA_200 第 2 節第 5 項）：不綁期中考（期'],
  ['src/data/ladder.js', '下下禮拜就期中考了。你經原讀到哪了？'],
  ['src/data/ladder.js', '我們系的讀書會說，期中考完要來書店開會。'],
  ['src/data/ladder.js', '我是第二次修啦。第一次期中考完我就沒去了。'],
  ['src/data/ladder.js', '期中前後；「走錯路」是她之後一層一層長出方向的伏筆（BB_104 5'],
  ['src/data/ladder.js', '期中考完，我把整學期的筆記重新抄了一次。'],
  ['src/data/ladder.js', '期中考完，我要去打保齡球。一個人。'],
  ['src/data/ladder.js', '期中考我寫錯一題，助教在旁邊畫了一隻貓。'],
  ['src/data/ladder.js', '期中考我有讀書計畫。'],
  ['src/data/ladder.js', '期中考考教育心理學。題目問：學生為什麼會放棄？'],
  ['src/data/ladder.js', '期中考週。我只考一科，其他都是報告。'],
  ['src/data/ladder.js', '期中考週。補習班我沒請假，算過還撐得住。'],
  ['src/data/ladder.js', '期中考週，三樓都沒位子了。'],
  ['src/data/ladder.js', '期中考，兩個人都還沒開始讀'],
  ['src/data/ladder.js', '沛珊的期中考題：學生為什麼會放棄'],
  ['src/data/ladder.js', '第 18 週 E19（誤會）以前；寒假的每晚訊息（E24）接在後面（2'],
  ['src/data/ladder.js', '經原我是第二次修啦。第一次期中考完我就沒去了。'],
  ['src/data/linze_upper_layouts.js', '期中考範圍和討論的題目；遊戲裡顯示的字等 AA 寫'],
  ['src/data/needed_msgs.js', '期中考你在總圖哪一層？我想找一個不會遇到麵店客人的地方。'],
  ['src/data/pool_story_b3.js', '好。那你要是期中前改變主意，B1 找我。'],
  ['src/data/postgrad_lines.js', '我在帶大學部刑訴的討論課。期中考完，我第一件事是問他們錯哪裡。'],
  ['src/data/sup497_lines.js', '「家教那個學生期中考進步了。他媽媽塞給我一袋柳丁。」'],
  ['src/data/syllabus.js', '下下週：期中考'],
  ['src/data/syllabus.js', '下週、下下週：期中考'],   /* 經濟系那一年的會計學（acct_y0）；法律課三處看 (a) 第 63～65 列 */
  ['src/data/syllabus.js', '期中考：一份完整的財報。'],
  ['src/data/syllabus.js', '期中考：計算題八題，應用題兩題。'],
  ['src/data/syllabus.js', '期中考：計算題八題，證明題兩題。'],
  ['src/data/syllabus.js', '無限接近，但不一定到達——這是我的期中考分數。'],
  ['src/data/syllabus.js', '錢收到了，不代表你賺到了。服務做完，才算。期中考就是你們的結帳。'],
  ['src/data/vac_activities.js', '（期中前，Priya 找了兩個美國同學一起讀。休息的時候，其中一個問你'],
  ['src/data/y1fill_events.js', '期中考週。這裡是國界。'],
  ['src/data/y1fill_events.js', '（沒有回頭）期中考完了。國界放寬。'],
  ['src/econff3d.js', '下下禮拜就期中考了。你經原讀到哪了？'],
  ['src/econff3d.js', '（期中考的範圍公布了。阿勳把考試日期寫在一張紙上，貼在桌前。）'],
  ['src/library3d.js', '公告：開放時間 8:00–22:00，期中考週延長到 24:00。一樓西'],
  ['src/postgrad3d.js', '（高二那個學生期中考進步了。他媽媽多塞了一袋橘子給你。）'],
  ['src/r2y3b3d.js', 'AA_326 2-Y3-42：慈 6，期中放榜後的第一個週四，麵店長桌'],
  ['src/r2y4b3d.js', '我在總圖。期中考，店剛好也沒開。'],
  ['src/social3d.js', '和她聊過期中考的準備'],   /* AN_L8_MIDTERM 的記憶標籤：AA_581 沒列（連8 只改了 AN_L9_MIDTERM_WEEK），回報給 LAWWW／AA */
  ['src/story3d.js', '今晚七點，公館！期中考前最後一次放風。'],
  ['src/story3d.js', '明天去總圖念書吧。期中考快到了。'],
  ['src/story3d.js', '期中考週停社課，下下週見'],
  ['src/story3d.js', '民總期中考，我的答案被老師拿去當範例。匿名的，可是我認得自己的字。'],
  ['src/story3d.js', '玩了一整晚。明天去總圖念書吧。期中考快到了。'],
];
const okKey = new Set(ALLOW.map(([f, p]) => f + '\t' + p.slice(0, 30)));
const bad = [];
for (const file of walk(path.join(ROOT, 'src'), [])) {
  const rel = path.relative(ROOT, file).split(path.sep).join('/');
  for (const s of strings(fs.readFileSync(file, 'utf8'))) if (MID.test(s) && !okKey.has(rel + '\t' + s.slice(0, 30))) bad.push(rel + '：' + s.slice(0, 60));
}
check('(b) src/ 字串常值裡提到期中考的，都在允許清單上（AA_581 保留、別人的期中、D118 第一輪保留）', !bad.length, JSON.stringify([...new Set(bad)].slice(0, 30)) + '（共 ' + bad.length + '）');
console.log(fails ? 'FAILED ' + fails + '／' + n : 'ALL PASS（' + n + ' 項）'); process.exit(fails ? 1 : 0);
