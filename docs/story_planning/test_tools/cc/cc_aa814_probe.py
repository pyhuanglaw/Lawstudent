"""CC（帳號 A）11-11：AA_814 三個優先項目劇情斷點（AA-PRIO-GAP-1111）12 項的瀏覽器探針。判定歸 BB；Playwright 手機模擬（844×390 觸控）≠ iPhone。
CC_02 清單 2026-11-12：1✓（YTMET：認識語彤＝G.flags.YT_MET_JOB，ytjob3d.js S.met） 2✓ 3n/a（日期照規格 aa814_spec_1111：7/20 21:00 群組、8/1 20:00 催問，不挑候選） 4✓ 5✓ 6✓ 7✓ 8✓ 9n/a（只判資料和手機畫面文字，不判截圖） 10✓ 11✓ 12✓（記遊戲判的「認識語彤」） 13✓（CC-C 11-12 只改 H23b：加 YTMET 兩種情況的檢查）
規格：docs/story_planning/test_tools/cc/specs/aa814_spec_1111.md（LAWWW 16:39）；稿：企劃線 91c6aaf9f docs/story_planning/AA_814_三個優先項目劇情斷點對帳.md；
LAWWW 的 Node 逐句：tests/aa814_prio_gap_1111_unit.js（事件 id、檔案、條件照它）。
新版：7d9d7942544e37ada7ec9cb7e658332b5fd570cb；修改前（D34 對照，新行為的檢查要 FAIL）：9d45ef8b36d5df00cdbca70661a4ca13e9fce813。

每一段（PARTS，逗號分隔；預設全部）都各自讀檔：【前置／捷徑】用遊戲自己的讀檔（GAME.applySave）放到那一天、那個時間「前幾分鐘」，
旗標、關係直接設（log 都印 [前置／捷徑]）；之後讓遊戲自己演：時間照遊戲走、舊序章系所舊序章離校在家照 ECONFF 自己跳、手機訊息照時間收；
對話點過去、選項照「字」選（不照位置）、手機打開那一段對話按回覆的字。從不呼叫 EVENTS.run。
探針自己記：GAME.say（說話人＋全文）、GAME.choose（選項＋小字 hint）、GAME.toast、GAME.titleCard、GAME.openPhone／phoneThread（誰打開手機），只記不改。
  E11  1-1 1/8 公館吃燒臘（ev_y0_jan8／_h）：舊序章系所、舊序章離校在家、30 分鐘版（ECONFF.short）。【前置】2025-01-08 17:00 在家 → ECONFF 自己跳到 18:30 演。
       選「「妳打算怎麼辦？」」→ 下一句可昕＝「……還不知道。整科就那一份，我只是記錯日子。」、再下一句＝「我十二月去問的那個舊序章考試班…」（修改前：「……還不知道。」）
  E12  1-2 2/14 一起去問補習班（ev_y0_e27b，出遊）：【前置】2025-02-14 13:00 在家、E27 演過（E27B_PLAN）。「晚餐你請。」後面緊接五格（說話人：可昕／祐廷交錯），
       之後 2/15 RH-M0「（二月十五日。她拖著一個行李箱…）」才出現（修改前：停在「晚餐你請。」，隔天直接站在門口）。
  E13  1-3 7/11 考場 → 7/12 19:00 對答案（ev_y0_exam2）：【前置】2025-07-11 06:00 在家、30 分鐘版。考場演完 after1 把人帶到 7/12 19:00，
       要演 exam2（「數學我錯一題。」…，EXAM2_DONE、MATH_100）（修改前：ECONFF.short 擋掉，7/12 晚上什麼都沒演）。
  H21  2-1 沛珊交往中、舊序章考試期回國的私訊：【前置】交往中、C11@Y2（東京，1/30 回國）記成 done、2027-01-30 20:50 宿舍 → 21:00 她的私訊（手機照時間收；
       探針自己打開手機看那一段）＝「歡迎回來！我在台中，桌上的考古題疊得比你的行李還高。」「下次放風的那個下午，你要從第一天開始講。」；
       對照 C12@Y2（8/27 回國，8/6 以後）＝「…開學前才回台南。…」照舊（修改前：舊序章考試期是「開學前才上去」）。H21_CASES 改段。
  H22  2-2 舊序章考試期約她出國（手機「活動」→「安排出國旅遊」T13）：她說「我現在連台中市區都很少去耶。……等我考完，第一個要去的地方給你選。」
       （修改前：「先在國內走走吧，我們還沒一起去過很多地方。」）；被拒、沒有排出一趟（V.t13 沒有多）。日子照 VAC.nextBreak、她那幾天 presence 挑（試 4 個）。
  H23  2-3 撞期（大二暑假 2027）：【前置】C09@Y2 柬埔寨（7/27～8/5）、C12@Y2 京都（8/9～8/27）報名 yes、在桌遊團群組、和方奕廷 FAMILIAR。
       a. 7/10 21:00 方奕廷私訊揪 T02（8/1～8/4）→ 多一則系統字「會撞到：海外志工（暖陽服務隊） 8/1」；回「去。」→ 答應的當下「…（同一段時間只能去一趟）」；T02 照報（不擋）
       b.【捷徑】同一份存檔改到 7/20 20:50 → 21:00 桌遊團揪香港（VA10）多「會撞到：海外語言文化課程（京都） 8/25」；回「我也去。」VA10＝yes（不擋）
       c. 手機「活動」→ 安排出國旅遊：選出發日的選項下面（hint）寫會撞到哪幾天（探針照已報名的日子自己算）；挑一個有撞的、自己去 → 照排（不擋）
       系統字從資料（G.msgs th sys）和畫面（手機「訊息」→「通知」那一段）兩邊看。標題、日期從遊戲資料（VAC.inst、VAC_DATA.VA10）讀。
  U31  3-1 美國、挽回中（沒交往、US1 alone）9/13：【前置】18:42 人在法學院圖書館（us_lawlib）→ 18:45 起演 ev_us2_repair、先帶到 C 棟 208（us_shared）
       （修改前：人不在社區三區就整場錯過）。U31_ZONES 改起點。
  U32  3-2 12/16 離開：U32_CASES＝bloom（挽回中）、sf（交往中）。【前置】12/15 22:30 公寓 → 走到床、按「睡覺」→ 床的選項小字有鬧鐘：
       bloom＝「07:00 社區門口（送大家上機場巴士）」、sf＝「07:00 社區門口（機場巴士）」→ 睡到 06:30 → 07:00 ev_us_leave：
       bloom 多兩句旁白、sf 沒有（修改前：都沒有、鬧鐘字都是「（機場巴士）」）；接下來那一週有接上（ev_us_bloom16／ev_sf1）。
  U33  3-3 挽回中 8/2 抵達：【前置】2028-08-02 18:50 us_outside、US1 alone（讀檔回到抵達那一段：r2y4a3d.js tick 自己演 ev_us1_arrive）→
       演完多「（她走遠了。你拖著行李，照手機上的地圖，走到 Linden Grove。）」、toast「公寓在社區的另一頭。」、之後推得動。
  U34  3-4 交往中、US2 there／missed：10/16 21:00「改過的報告拿了 A。…」要回、手機自己打開。U34_CASES＝there:0,missed:0,there:1,missed:1（第幾個回覆）。
       回「恭喜。」there＝「……嗯。那天的麵，謝謝。」、missed＝「……嗯。我自己改了三次。」；「我就說吧。」＝「你哪有說。你只是一直在煮麵。」
  U35  3-5 芝加哥巴士（沒見過舊序章同學）：U35_CASES＝together,alone。【前置】11/3 20:50 → 21:00 邀約回「去。」→【捷徑】同一份存檔改到 11/11 06:30 →
       出遊「出發：芝加哥的週末」→ 巴士上「（巴士上，坐在前面的是一個戴圓框眼鏡的男生。車子一開，他就回頭。）」「臺灣來的？你手機上的字是繁體。」（修改前：「你們」那兩句）
  U36  3-6 交往中 12/6 21:00「……你想去哪裡，你先想。」要回、手機自己打開：U36_CASES＝0,1（「舊金山？」→「……好。我也想那裡。」；「有海的地方。」→「那就舊金山。……剩下的，你排。」）
共通：畫面上沒有 {name}／undefined／NaN／TODO／PLACEHOLDER；沒有 JS 例外（pageerror）；演完以後：3D 推得動、在家（舊序章離校）＝遊戲還在往下走（沒卡住）。
等待中每 30 秒沒有新動作就記一次狀態（區域、時間、劇情鎖、對話、手機、待回覆、最後一句、console）＋截圖（每段最多 6 張）。
每段最後印「走的路」（自然觸發／讀檔接續／捷徑）。修改前那一版顯示了什麼，FAIL 的那一行會印出來（D34）。
環境變數：PARTS、SHA、TAG、H21_CASES（C11@Y2,C12@Y2）、U31_ZONES（us_lawlib）、U32_CASES（bloom,sf）、U34_CASES、U35_CASES、U36_CASES、MAXS（每段等待上限倍數，預設 1）
用法：LW_TESTS=<wt>/tests SHA=<sha> PARTS=E11,H22,U36 python3 cc_aa814_probe.py <url> <out>（URL 不加 ?turbo）"""
import os, sys, json, asyncio, time, re
LWT = os.environ.get('LW_TESTS') or 'tests'
sys.path.insert(0, LWT)
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import playlib as L
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
SHA = os.environ.get('SHA') or ''
TAG = os.environ.get('TAG') or (SHA[:9] if SHA else 'x')
MAXS = float(os.environ.get('MAXS') or 1)
YTMET = os.environ.get('YTMET') == '1'   # CC-C 11-12（BB-C 03:53 ②）：H23b 兩種都要測——沒認識語彤（預設）＝ask 在欣慈那則、群組沒有語彤的話；認識語彤（YTMET=1，G.flags.YT_MET_JOB＝ytjob3d.js S.met）＝ask 照舊在語彤那則
J = lambda o: json.dumps(o, ensure_ascii=False)
R = L.Run('aa814_' + TAG, OUT)
LOGF = open(os.path.join(OUT, 'aa814_lines_%s.txt' % TAG), 'a', encoding='utf-8')
ALL_PARTS = ['E11', 'E12', 'E13', 'H21', 'H22', 'H23', 'U31', 'U32', 'U33', 'U34', 'U35', 'U36']
PARTS = [p.strip().upper() for p in (os.environ.get('PARTS') or ','.join(ALL_PARTS)).split(',') if p.strip()]
ENVL = lambda k, d: [x.strip() for x in (os.environ.get(k) or d).split(',') if x.strip()]
PNAME = '祐廷'
PREFER = ('先起床', '出發', '直接過去', '起身')
EXIT_WORDS = ('不去了', '算了', '返回', '下次再說', '換一天', '晚一點')
BAD_RX = re.compile(r'\{name\}|\{[A-Za-z_]+\}|undefined|NaN|TODO|PLACEHOLDER|MISSING_')

# ---------------------------------------------------------------- 期望值（台詞照 tests/aa814_prio_gap_1111_unit.js 的 LINES，＝企劃線 91c6aaf9f 原文）
X = {
    'jan8_pre': [('narr', '（一月八日。期末考考完快三個禮拜了。她還沒回高雄，約你在公館吃燒臘。）'), ('kexin', '……葉老師那封信，我又看了一次。'), ('kexin', '還是不能補交。'), ('narr', '（她用筷子把飯撥到一邊，又放下。）')],
    'j8a_opt': '「妳打算怎麼辦？」',
    'j8a': '……還不知道。整科就那一份，我只是記錯日子。',
    'j8c': '我十二月去問的那個舊序章考試班，簡章還在我桌上。',
    'dinner': '晚餐你請。',
    'e27b_new': [('kexin', '……宿舍月底要退。我本來想，回高雄讀。'), ('player', '我媽說，姊姊的房間空著。'), ('kexin', '……你問過了？'), ('player', '上禮拜就問了。'), ('kexin', '那我明天搬。……輸的人，幫忙扛書。')],
    'rhm0': '（二月十五日。她拖著一個行李箱、背著一大袋書，站在你家門口。）',
    'exam2': [('narr', '（晚上，補習班的解答出來了。兩個人坐在餐桌兩邊，一題一題對。）'), ('narr', '（數學對完，你又從第一題重新對了一次。）'), ('narr', '（全對。）'),
              ('kexin', '數學我錯一題。'), ('kexin', '……就一題。'), ('kexin', '其他科明天再對。今天先這樣。')],
    'ps_retake': ['歡迎回來！我在台中，桌上的考古題疊得比你的行李還高。', '下次放風的那個下午，你要從第一天開始講。'],
    'ps_after': ['歡迎回來！我在台中，開學前才回台南。好想聽你講那邊的事，你要從第一天開始講。'],
    'ps_old': '歡迎回來！我在台中，開學前才上去。好想聽你講那邊的事，你要從第一天開始講。',
    'ps_noOff': '我現在連台中市區都很少去耶。……等我考完，第一個要去的地方給你選。',
    'ps_no': '先在國內走走吧，我們還沒一起去過很多地方。',
    'ask_out': '要不要一起出國？',
    'us2r_first': '（你去 C 棟還上個禮拜跟她室友借的鍋子。廚房朝客廳的窗口開著，她站在爐子前面，水還沒滾。你把鍋子放在窗口的吧台上。）',
    'leave_n': '（天還沒亮。社區門口停著機場巴士。）',
    'leave_bloom': ['（交換生一個一個把行李推上車。你的機票是二十一號。）', '（巴士開走了。你還要再待五天。）'],
    'alarm': {'bloom': '07:00 社區門口（送大家上機場巴士）', 'sf': '07:00 社區門口（機場巴士）'},
    'arr_alone': [('narr', '（下了巴士，她拿了自己的行李就往前走。走了幾步，停下來。）'), ('heroine_05', '超市在那邊。……你自己會找吧。'), ('narr', '（她走遠了。你拖著行李，照手機上的地圖，走到 Linden Grove。）')],
    'arr_toast': '公寓在社區的另一頭。',
    'grade_msg': '改過的報告拿了 A。教授說：『這次我讀到妳了。』',
    'grade_opts': ['恭喜。', '我就說吧。'],
    'grade_rep': {('there', 0): '……嗯。那天的麵，謝謝。', ('missed', 0): '……嗯。我自己改了三次。', ('there', 1): '你哪有說。你只是一直在煮麵。', ('missed', 1): '你哪有說。你只是一直在煮麵。'},
    'chi': [('narr', '（巴士上，坐在前面的是一個戴圓框眼鏡的男生。車子一開，他就回頭。）'), ('long', '臺灣來的？你手機上的字是繁體。'), ('long', '香港。舊序章同學。叫我 Long 就好。')],
    'chi_old': ['坐在你們前面的', '我聽你們講話聽出來的'],
    's1206': ['期末週以後，還有五天。', '……你想去哪裡，你先想。'],
    's1206_opts': ['舊金山？', '有海的地方。'],
    's1206_rep': ['……好。我也想那裡。', '那就舊金山。……剩下的，你排。'],
}
LAW_FLAGS = {'KX_DEC3_MIGRATED': True, 'YT_JOB_V': 1, 'NAMECARD_V': 1, 'FAFU_PURE': 1, 'FAFU_STORY_SEEN': 0, 'introDone': True, 'campusIntro': True, 'classDone': True}
ECON_FLAGS = {'ECON_CAMP_OPEN': True, 'E15_BUS': 'nosleep', 'E15_WENT': True, 'ECON_CAMP_DONE': True, 'E01_DONE': True, 'E01_MORNING': True, 'Y0_MOVED_OUT': True, 'dating_kexin': True,
              'KX_DATING_SINCE': '2024-10-17', 'KX_CAR': 'only_me', 'KX_FIRST_MSG': True, 'fundsV2': 1, 'Y0_STICKY': True, 'KX_DEC3_MIGRATED': True}   # tests/flow_v0_home.py 的在家存檔＋E01_MORNING（30 分鐘版 ECONFF.short 要它）
ECON_PEOPLE = ['kexin', 'econ_zhengxun', 'econ_weilun', 'econ_tangrui', 'econ_jiahao', 'econ_pinyu']
REL_FRIEND = {'fam': 66, 'trust': 50, 'comf': 45}


def log(s):
    print(s, flush=True); LOGF.write(s + '\n'); LOGF.flush()


# ---------------------------------------------------------------- 頁面上的 JS（只記不改的掛勾；查詢；前置）
HOOK_JS = r"""(()=>{ if(!window.__AAH){ window.__AAH=1; window.__AE=[];
  const G=()=>GAME.G, n=()=>window.__AE.length, now=()=>Date.now(), pos=()=>({d:G().day,h:+(+G().hour).toFixed(3),z:G().zone});
  const push=o=>{ try{ window.__AE.push(Object.assign(o,{i:n(),ms:now()},pos())); }catch(e){} };
  const s0=GAME.say; GAME.say=function(w,t){ push({k:'say',who:(w&&w.name)||(typeof w==='string'?w:''),cid:(w&&w.charId)||'',t:String(t==null?'':t)}); return s0.apply(this,arguments); };
  const c0=GAME.choose; GAME.choose=function(o,op){ const rec={k:'ch',opts:(o||[]).filter(x=>!(x&&x.hidden)).map(x=>typeof x==='string'?x:String((x&&x.t)||'')),hints:(o||[]).filter(x=>!(x&&x.hidden)).map(x=>String((x&&x.hint)||'')),pick:null}; push(rec);
    const p=c0.apply(this,arguments); try{ Promise.resolve(p).then(k=>{ rec.pick=k; }); }catch(e){} return p; };
  if(GAME.toast){ const t0=GAME.toast; GAME.toast=function(t){ push({k:'toast',t:String(t)}); return t0.apply(this,arguments); }; }
  if(GAME.titleCard){ const tc=GAME.titleCard; GAME.titleCard=function(a,b){ push({k:'card',t:String(a)+'｜'+String(b==null?'':b)}); return tc.apply(this,arguments); }; }
  if(GAME.openPhone){ const op=GAME.openPhone; GAME.openPhone=function(tab,th){ push({k:'phone',tab:tab||null,th:th||null,by:'GAME.openPhone'}); return op.apply(this,arguments); }; }
  if(GAME.phoneThread){ const pt=GAME.phoneThread; GAME.phoneThread=function(th,o){ push({k:'phone',tab:'msg',th:th||null,by:'GAME.phoneThread'}); return pt.apply(this,arguments); }; }
  window.__ccCons=[]; for(const k of ['warn','error']){ const o=console[k].bind(console); console[k]=(...a)=>{ try{ window.__ccCons.push(k+': '+a.map(x=>String(x&&x.stack||x)).join(' ').slice(0,240)); if(window.__ccCons.length>200) window.__ccCons.shift(); }catch(e){} return o(...a); }; }
 } return true; })()"""

RESET_JS = r"""(()=>{ window.__AE=[]; window.__ccCons=[]; return Date.now(); })()"""

EV_JS = r"""(i=>(window.__AE||[]).slice(i))"""

NOW_JS = r"""(()=>Date.now())()"""

ST_JS = r"""(()=>{ const G=GAME.G, E=GAME.E, P=E&&E.player, D=GAME.D||{}, $=id=>document.getElementById(id);
  const vis=e=>!!e&&!e.classList.contains('hide')&&getComputedStyle(e).display!=='none';
  const ft=b=>String((b.firstChild&&b.firstChild.nodeType===3?b.firstChild.nodeValue:b.textContent)||'').trim();
  const ch=$('choices'); const B=vis(ch)?[...ch.querySelectorAll('button')].filter(b=>b.offsetParent!==null):[];
  const A=window.__AE||[]; let last=null; for(let i=A.length-1;i>=0;i--) if(A[i].k==='ch'){ last=A[i]; break; }
  const ph=$('phone'), pb=$('phoneBody'), po=vis(ph);
  const asks=po&&pb?[...pb.querySelectorAll('[data-ask]')].filter(b=>b.offsetParent!==null).map(b=>({v:b.dataset.ask,t:ft(b),dis:!!b.disabled})):[];
  const ths=po&&pb?[...pb.querySelectorAll('.chatList [data-th]')].map(b=>({th:b.dataset.th,t:(b.innerText||'').replace(/\s+/g,' ').trim().slice(0,80)})):[];
  const tb=document.querySelector('#phoneTabs button.on'); const it=$('interact'), tx=$('dlgText'), nm=$('dlgName');
  return {dlg:!!D.active, typing:!!D.typing, full:String(D.full||''), shown:(tx&&tx.textContent)||'', name:(nm&&nm.style.display!=='none'&&nm.textContent)||'',
    nb:B.length, btn:B.map(ft), ch:last&&last.pick==null?{i:last.i,opts:last.opts,hints:last.hints}:null,
    phone:po, inTh:po&&!!pb&&!!pb.querySelector('[data-thback]'), asks, ths, tab:tb&&tb.dataset?tb.dataset.ptab:null,
    zone:G.zone, day:G.day, key:CALENDAR.dateOf(G.day).key, hour:+(+G.hour).toFixed(3), busy:!!(P&&P.busy), seat:!!(P&&P.seat),
    home:typeof HOME!=='undefined'&&!!HOME.at&&!!HOME.at(G), ev:(typeof EVENTS!=='undefined'&&EVENTS.running)?String(EVENTS.running.id||EVENTS.running):null,
    depth:D.busyDepth|0, paused:!!(E&&E.paused), interact:vis(it)?(it.textContent||'').trim().slice(0,30):''}; })()"""

WATCH_JS = r"""(q=>{ const G=GAME.G, F=G.flags||{}, Dn=(G.events&&G.events.done)||{}, th=m=>(typeof PHONE!=='undefined'&&PHONE.th)?PHONE.th(m):(m.th||'');
  const o={key:CALENDAR.dateOf(G.day).key, day:G.day, hour:+(+G.hour).toFixed(3), zone:G.zone, done:{}, flags:{}, msgs:[]};
  for(const id of q.ev||[]) o.done[id]=!!Dn[id];
  for(const k of q.fl||[]) o.flags[k]=F[k]===undefined?null:F[k];
  const rx=q.rx?new RegExp(q.rx):null; const A=window.__AE||[]; o.said=(q.said||[]).map(t=>A.some(e=>e.k==='say'&&e.t===t));
  for(const m of (G.msgs||[])){ const t=th(m); if((q.tags||[]).includes(m.tag)||(q.ths||[]).includes(t)||(rx&&rx.test(String(m.text||''))))
    o.msgs.push({tag:m.tag||null, th:t, from:m.from||null, text:String(m.text||''), day:m.day, h:m.h, ask:m.ask?{id:m.ask.id, opts:(m.ask.opts||[]).map(x=>String(x.t))}:null, ans:m.ans==null?null:m.ans}); }
  return o; })"""

IDLE_JS = r"""(()=>{ const E=GAME.E, P=E&&E.player, D=GAME.D||{}, G=GAME.G, f2=v=>v==null?null:+(+v).toFixed(2);
  const top=(()=>{ const e=document.elementFromPoint(innerWidth/2, innerHeight*0.8); return e?(e.id||String(e.className).slice(0,40)||e.tagName):null; })();
  const A=window.__AE||[]; let ls=null; for(let i=A.length-1;i>=0;i--) if(A[i].k==='say'){ ls=A[i]; break; }
  return {key:CALENDAR.dateOf(G.day).key, hour:f2(G.hour), zone:G.zone, me:P?{x:f2(P.obj.position.x), z:f2(P.obj.position.z), busy:!!P.busy, seat:!!P.seat}:null,
    depth:D.busyDepth|0, by:(D.busyWho||[]).slice(-3), dlg:!!D.active, ev:(typeof EVENTS!=='undefined'&&EVENTS.running)?String(EVENTS.running.id||EVENTS.running):null,
    adv:typeof ADV!=='undefined'&&!!ADV.active, paused:!!(E&&E.paused), home:typeof HOME!=='undefined'&&!!HOME.at&&!!HOME.at(G),
    econ:typeof ECONFF!=='undefined'?{short:!!(ECONFF.short&&ECONFF.short(G)), on:!!(ECONFF.on&&ECONFF.on(G)), on2:!!(ECONFF.on2&&ECONFF.on2(G)), busy:!!ECONFF.busy}:null,
    pend:(typeof PHONE!=='undefined'&&PHONE.pending)?PHONE.pending(G).map(m=>(PHONE.th(m)||'')+'｜'+String(m.text||'').slice(0,20)):null,
    outs:(typeof OUT!=='undefined'&&OUT.rec)?OUT.rec(G).filter(q=>q&&q.state==='planned').map(q=>q.id+'@'+CALENDAR.dateOf(q.day).key+' '+q.h):null,
    phone:!!(GAME.phoneIsOpen&&GAME.phoneIsOpen()), top, lastSay:ls?{t:String(ls.t).slice(0,40), who:ls.who, h:ls.h}:null, cons:(window.__ccCons||[]).slice(-5)}; })()"""

DAY_JS = r"""(k=>{ const d=STORY.dayOfKey(k); if(d==null) return null; const x=CALENDAR.dateOf(d); return {d, wd:((x.wd%7)+7)%7, key:x.key}; })"""

MD_JS = r"""(L=>L.map(d=>{ const x=CALENDAR.dateOf(d); return x.m+'/'+x.d; }))"""

# 前置（讀檔以後馬上做；之後 GAME.snapshot 再讀一次，讓整個存檔一次到位）
SETUP_JS = r"""(q=>{ const G=GAME.G, F=G.flags||(G.flags={}), out={notes:[]}; G.contacts=G.contacts||{};
  for(const id of q.meet||[]){ try{ if(SOCIAL.meet) SOCIAL.meet(id,G.zone); if(SOCIAL.has&&!SOCIAL.has(id,'FIRST_MET')&&SOCIAL.remember) SOCIAL.remember(id,'FIRST_MET',''); const r=SOCIAL.rel(id); for(const k in (q.rel||{})) r[k]=Math.max(r[k]||0,q.rel[k]); G.contacts[id]=G.day-150; F['met_'+id]=true; }catch(e){ out.notes.push('meet '+id+'：'+e); } }
  for(const id of q.dating||[]){ F['dating_'+id]=true; try{ if(typeof ROM!=='undefined'&&ROM.get){ const R=ROM.get(G,id), d0=G.day-(q.since||120); R.status='dating'; R.since='D'+d0; R.sinceDay=d0; R.sinceH=20; R.history=(R.history||[]).filter(h=>h&&h.ev!=='start'); R.history.push({ev:'start',at:'D'+d0}); } }catch(e){ out.notes.push('rom '+id+'：'+e); } }
  for(const id in (q.dateLog||{})){ try{ const Lg=DATE.log(G,id); Lg.count=Math.max(Lg.count|0,q.dateLog[id]); }catch(e){ out.notes.push('dateLog：'+e); } }
  if(q.vac&&typeof VAC!=='undefined'){ const V=VAC.rec(G); for(const k in q.vac){ V.reg[k]=q.vac[k]; (V.when||(V.when={}))[k]=G.day-30; (V.nth||(V.nth={}))[k]=1; } }
  for(const g of q.groups||[]){ try{ PHONE.join(G,g[0],g[1]); }catch(e){ out.notes.push('join：'+e); } }
  Object.assign(F, q.flags||{}); for(const k of q.unflags||[]) delete F[k];
  out.stage={}; for(const id of (q.meet||[])){ try{ out.stage[id]=SOCIAL.stage?SOCIAL.stage(id):null; }catch(e){} }
  out.dating=Object.keys(F).filter(k=>k.indexOf('dating_')===0&&F[k]);   /* dating_kexin：遊戲預設（game3d.js defaults／migrate 沒有就補 true，舊序章系所開局的存檔都有），照留、照印 */
  return out; })"""

LOAD_JS = r"""(async st=>{ const s=GAME.defaults(st.name||'祐廷'); Object.assign(s,st); document.getElementById('titleScreen').classList.add('hide'); const rot=document.getElementById('rotate'); if(rot) rot.classList.remove('want'); await GAME.applySave(s); return true; })"""

SNAP_JS = r"""(()=>JSON.parse(JSON.stringify(GAME.snapshot())))()"""

PBODY_JS = r"""(()=>((document.getElementById('phoneBody')||{}).innerText||''))()"""

INFO_ECON_JS = r"""(()=>{ const G=GAME.G; return {short:typeof ECONFF!=='undefined'&&!!ECONFF.short&&ECONFF.short(G), on2:typeof ECONFF!=='undefined'&&!!ECONFF.on2&&ECONFF.on2(G), home:typeof HOME!=='undefined'&&!!HOME.at&&HOME.at(G),
  keep2:typeof ECONFF!=='undefined'&&!!ECONFF.KEEP&&ECONFF.KEEP.has('ev_y0_exam2'), stage:G.stage, key:CALENDAR.dateOf(G.day).key, hour:+(+G.hour).toFixed(2)}; })()"""

PS_INFO_JS = r"""(q=>{ const G=GAME.G, id='classmate_peishan', out={}; const pr=d=>{ try{ const p=STORY.presence(id,Object.assign({},G,{day:d})); return p?{here:!!p.here,kind:p.kind||null}:null; }catch(e){ return String(e); } };
  out.pres={}; for(const d of q.days||[]) out.pres[CALENDAR.dateOf(d).key]=pr(d);
  try{ out.datingDays=VAC.datingDays(G,id); }catch(e){ out.datingDays=String(e); }
  try{ out.dateCount=DATE.log(G,id).count|0; }catch(e){ out.dateCount=String(e); }
  try{ const B=VAC.nextBreak(Object.assign({},G)); out.brk=B?{kind:B.kind,from:CALENDAR.dateOf(B.from).key,to:CALENDAR.dateOf(B.to).key}:null; }catch(e){ out.brk=String(e); }
  try{ const M=VAC_DATA.TRIP_MSG; out.off=(M.gf[id]||{}).off||null; out.ra=M.reunionHomeAfter?M.reunionHomeAfter[id]:null; }catch(e){ out.off=String(e); }
  try{ out.name=SOCIAL.displayName(id); }catch(e){}
  return out; })"""

VACI_JS = r"""(keys=>{ const G=GAME.G, V=VAC.rec(G), out={};
  for(const k of keys){ const [id,yk]=k.split('@'); const I=VAC.inst(id,yk); out[k]=I?{title:I.A.title, from:I.from, to:I.to, days:(VAC.daysOf?VAC.daysOf(I):null), reg:V.reg[k]||null}:null; }
  try{ const C=VAC_DATA.VA10; out.VA10={title:'和阿哲他們出國：香港', from:STORY.dayOfKey(C.from), to:STORY.dayOfKey(C.to), reg:G.flags.VA10||null}; }catch(e){ out.VA10=String(e); }
  out.t13=(V.t13||[]).map(r=>({n:r.n,dest:r.dest,from:r.from,to:r.to,with:r.with||null,title:'出國旅遊：'+((((VAC_DATA.TRAVEL||{}).dest||{})[r.dest]||{}).name||r.dest)})); return out; })"""

US_INFO_JS = r"""(()=>{ const G=GAME.G, F=G.flags||{}; return {route:STORY.route?STORY.route(G):null, abroad:STORY.abroad?STORY.abroad(G):null, inUS:typeof EXCH!=='undefined'&&EXCH.inUS?EXCH.inUS(G):null,
  dating5:!!F.dating_heroine_05, US1:F.US1||null, US2:F.US2||null, MET_LONG:!!F.MET_LONG, metLong:!!(SOCIAL.has&&SOCIAL.has('npc_long','MET_LONG')), zone:G.zone, key:CALENDAR.dateOf(G.day).key, hour:+(+G.hour).toFixed(2),
  due:typeof R2Y4A!=='undefined'&&R2Y4A.us2RepairDue?!!R2Y4A.us2RepairDue(G):null}; })()"""

SLEEP_IT_JS = r"""(()=>{ const P=GAME.E.player.obj.position; const L=(GAME.E.interactables||[]).filter(i=>i&&i.sleep&&!i.hidden); L.sort((a,b)=>Math.hypot(a.x-P.x,a.z-P.z)-Math.hypot(b.x-P.x,b.z-P.z)); const i=L[0]; return i?{x:i.x,z:i.z,r:i.radius||0.9,lv:i.lv|0,label:String(i.label||''),d:+Math.hypot(i.x-P.x,i.z-P.z).toFixed(2)}:null; })()"""

ALARMS_JS = r"""(k=>{ try{ const d=STORY.dayOfKey(k); return STORY.wakeAlarms?STORY.wakeAlarms(GAME.G,d).map(a=>({h:a.h,why:a.why})):null; }catch(e){ return String(e); } })"""

ALL_JS = [HOOK_JS, RESET_JS, EV_JS, NOW_JS, ST_JS, WATCH_JS, IDLE_JS, DAY_JS, MD_JS, SETUP_JS, LOAD_JS, SNAP_JS, PBODY_JS, INFO_ECON_JS, PS_INFO_JS, VACI_JS, US_INFO_JS, SLEEP_IT_JS, ALARMS_JS]   # node --check 用


# ---------------------------------------------------------------- 小工具
async def st(pg):
    return await pg.evaluate(ST_JS)


async def day_of(pg, key):
    return await pg.evaluate(DAY_JS, key)


async def evs(pg, i=0):
    return await pg.evaluate(EV_JS, i)


def says_of(E):
    return [e for e in E if e.get('k') == 'say']


def role_of(e):
    if not e.get('who') and not e.get('cid'): return 'narr'
    if not e.get('cid') and e.get('who') == PNAME: return 'player'
    return e.get('cid') or e.get('who')


def spk_ok(e, want):
    if want == 'long': return '舊序章同學' in str(e.get('who') or '') or e.get('cid') in ('npc_long', '舊序章同學')
    return role_of(e) == want


def find_seq(ss, exp, start=0):
    """exp＝[(說話人, 字)] 照順序在 ss 裡找（中間可以夾別的句子）；回傳 (缺的, 說話人錯的, 位置)"""
    miss, bad, at = [], [], []; j = start
    for r, t in exp:
        k = next((i for i in range(j, len(ss)) if ss[i]['t'] == t), None)
        if k is None: miss.append(t); continue
        at.append(k); j = k + 1
        if not spk_ok(ss[k], r): bad.append([t, ss[k].get('who'), ss[k].get('cid')])
    return miss, bad, at


def brief(ss, a, b):
    return [[role_of(x), x['t'][:46], x.get('d'), x.get('h')] for x in ss[max(0, a):max(0, b)]]


class Menu:
    """選單剛出來的點擊可能被吃掉：同一組選項看到 ≥ 650 ms 才點；點了 2.5 秒還在＝再點一次"""
    def __init__(self): self.key = None; self.t0 = 0; self.tapped = 0

    async def ready(self, s):
        k = (s['ch'] or {}).get('i') if s['ch'] else tuple(s['btn'])
        if k != self.key: self.key = k; self.t0 = time.time(); self.tapped = 0; return False
        if self.tapped and time.time() - self.tapped < 2.5: return False
        return time.time() - self.t0 >= 0.65


class Ctx:
    def __init__(self, tag):
        self.tag = tag; self.path = []; self.pick = None; self.phone_want = []; self.phone_ask = None; self.answer_others = True
        self.cur_th = None; self.opened = {}; self.answered = []; self.phone_texts = []; self.shots = 0; self.idle_n = 0; self.menus = []
        self.err0 = 0; self.hands_off_phone = False


async def close_phone(pg, cdp):
    for _ in range(3):
        if not await pg.evaluate("!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())"): return True
        await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(800)
    return not await pg.evaluate("!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())")


async def open_tab(pg, cdp, tab):
    if not await pg.evaluate("!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())"):
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1000)
    await L.tap(pg, cdp, '#phoneTabs button[data-ptab="%s"]' % tab); await pg.wait_for_timeout(1000)


async def open_thread(pg, cdp, th):
    """玩家的路：手機 →「訊息」→ 點那一段對話；回傳 (點到沒有, 那一段的文字)"""
    await open_tab(pg, cdp, 'msg')
    ok = await L.tap(pg, cdp, '#phoneBody .chatList [data-th=%s]' % J(th))
    await pg.wait_for_timeout(1200)
    return ok, await pg.evaluate(PBODY_JS)


async def tap_choice(pg, cdp, k):
    HIT = "(i=>{ const b=[...document.querySelectorAll('#choices button')].filter(x=>x.offsetParent!==null)[i]; if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); const x=r.left+r.width/2, y=r.top+r.height/2; const h=document.elementFromPoint(x,y); return {c:[x,y],hit:!!h&&(h===b||b.contains(h)),top:h?(h.id||String(h.className).slice(0,30)):null}; })"
    q = await pg.evaluate(HIT, k)
    if not q: return False
    if not q['hit']:
        log('    [被蓋住] 選項底下最上層是 %s，先收手機／面板' % q.get('top'))
        await close_phone(pg, cdp); await L.close_panels(pg, cdp); await pg.wait_for_timeout(600)
        q = await pg.evaluate(HIT, k)
        if not q: return False
    await L.touch_tap(cdp, q['c'][0], q['c'][1]); return True


async def tap_dlg(pg, cdp, s):
    if s['typing'] and s['shown'] != s['full']:
        await pg.wait_for_timeout(700)
        s2 = await st(pg)
        if s2['typing'] and s2['shown'] != s2['full']: await pg.wait_for_timeout(1500)
    await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450)


def default_pick(opts):
    for w in PREFER:
        k = next((i for i, o in enumerate(opts) if o.startswith(w)), None)
        if k is not None: return k
    k = next((i for i, o in enumerate(opts) if not any(x in o for x in EXIT_WORDS)), None)
    return 0 if k is None else k


async def idle_diag(pg, P, why):
    P.idle_n += 1
    d = await pg.evaluate(IDLE_JS); s = await st(pg)
    log('    [等待 %d｜%s] %s；畫面 %s' % (P.idle_n, why, J(d), J({k: s.get(k) for k in ('dlg', 'nb', 'btn', 'phone', 'inTh', 'interact')})))
    if P.shots < 6:
        P.shots += 1; await R.shot(pg, '%s_idle%d' % (P.tag, P.idle_n))


async def handle_phone(pg, cdp, P, s):
    """手機開著：在對話裡＝有要回的照字選（P.phone_ask；其他人待回覆的選第一個）；在列表＝想看的那一段先點、待回覆的點進去；都沒有就收起來／跳過"""
    if s['inTh']:
        body = await pg.evaluate(PBODY_JS); P.phone_texts.append([P.cur_th, body])
        asks = [a for a in s['asks'] if not a['dis']]
        if asks:
            k = P.phone_ask(P.cur_th, [a['t'] for a in asks]) if P.phone_ask else None
            why = '照字選'
            if k is None and P.answer_others and P.cur_th not in P.phone_want: k = 0; why = '別人的待回覆：選第一個'
            if k is not None:
                log('    [手機回覆] %s：%s → %s（%s）' % (P.cur_th, '｜'.join(a['t'] for a in asks), asks[k]['t'], why))
                P.answered.append([P.cur_th, asks[k]['t']])
                await L.tap(pg, cdp, '#phoneBody [data-ask=%s]' % J(asks[k]['v'])); await pg.wait_for_timeout(1600)
                P.phone_texts.append([P.cur_th, await pg.evaluate(PBODY_JS)])
                return True
        await close_phone(pg, cdp); P.cur_th = None; return True
    if s['tab'] not in (None, 'msg'):
        await close_phone(pg, cdp); return True
    have = [t['th'] for t in s['ths']]
    for th in P.phone_want:
        if th in have and P.opened.get(th, 0) < 3:
            P.opened[th] = P.opened.get(th, 0) + 1; P.cur_th = th
            log('    [手機] 列表 → 點「%s」' % th)
            await L.tap(pg, cdp, '#phoneBody .chatList [data-th=%s]' % J(th)); await pg.wait_for_timeout(1300); return True
    if P.answer_others:
        for t in s['ths']:
            if '待回覆' in t['t'] and P.opened.get(t['th'], 0) < 2:
                P.opened[t['th']] = P.opened.get(t['th'], 0) + 1; P.cur_th = t['th']
                log('    [手機] 列表 → 待回覆「%s」（%s）' % (t['th'], t['t'][:40]))
                await L.tap(pg, cdp, '#phoneBody .chatList [data-th=%s]' % J(t['th'])); await pg.wait_for_timeout(1300); return True
    log('    [手機] 收起來／跳過（列表：%s）' % J([t['t'][:24] for t in s['ths'][:4]]))
    await close_phone(pg, cdp); P.cur_th = None; return True


async def drive(pg, cdp, P, until, max_s, wq, label):
    """像玩家一樣過：點對話、選項照字選、手機照 handle_phone；until(w, s) 成立就停。每 30 秒沒有新動作記一次狀態＋截圖"""
    t0 = time.time(); last_act = time.time(); menu = Menu(); same = [None, 0]; n_ev = None; max_s = max_s * MAXS
    w = None; s = None
    while time.time() - t0 < max_s:
        s = await st(pg); w = await pg.evaluate(WATCH_JS, wq)
        if until(w, s): return w, s, True
        ne = await pg.evaluate("(window.__AE||[]).length")
        if ne != n_ev: n_ev = ne; last_act = time.time()
        if s['phone'] and not P.hands_off_phone:
            await handle_phone(pg, cdp, P, s); last_act = time.time(); continue
        if s['nb']:
            if not await menu.ready(s): await pg.wait_for_timeout(150); continue
            opts = s['btn']; hints = []
            if s['ch'] and len(s['ch'].get('opts') or []) == len(opts): hints = s['ch'].get('hints') or []
            k = P.pick(opts, hints) if P.pick else None
            if k is None: k = default_pick(opts)
            P.menus.append({'opts': opts, 'hints': hints, 'pick': opts[k], 'key': s['key'], 'h': s['hour'], 'internal': s['ch'] is None})
            log('    [選項%s] %s → %s' % ('（遊戲內部選單）' if s['ch'] is None else '', '｜'.join(opts), opts[k]))
            sig = (tuple(opts), s['zone'], round(s['hour'], 2))
            same = [sig, same[1] + 1] if same[0] == sig else [sig, 1]
            if same[1] > 6:
                await R.shot(pg, '%s_stuckopt' % P.tag); R.check('[%s] 選項「%s」按得下去' % (P.tag, opts[k]), False, J(s)); return w, s, False
            await tap_choice(pg, cdp, k); menu.tapped = time.time(); last_act = time.time(); await pg.wait_for_timeout(900); continue
        if s['dlg']:
            await tap_dlg(pg, cdp, s); last_act = time.time(); continue
        if time.time() - last_act > 30:
            last_act = time.time(); await idle_diag(pg, P, label)
        await pg.wait_for_timeout(400)
    log('    [逾時] %s：%.0f 秒' % (label, max_s))
    await idle_diag(pg, P, label + '（逾時）')
    return w, s, False


async def load(pg, st0, setup=None, why=''):
    """讀檔（遊戲自己的 GAME.applySave）→ 前置 → GAME.snapshot 再讀一次（整份一次到位）"""
    await pg.evaluate(LOAD_JS, st0); await pg.wait_for_timeout(1500)
    out = None
    if setup:
        out = await pg.evaluate(SETUP_JS, setup)
        snap = await pg.evaluate(SNAP_JS)
        await pg.evaluate(LOAD_JS, snap)
    await pg.wait_for_timeout(3500)
    await pg.evaluate(HOOK_JS)
    return out


async def jump(pg, P, key, hour, why):
    """【捷徑】同一份存檔（GAME.snapshot）只改日期時間再讀"""
    d = await day_of(pg, key)
    snap = await pg.evaluate(SNAP_JS)
    snap['day'] = d['d']; snap['weekday'] = d['wd']; snap['hour'] = hour
    R.setup('[%s]【捷徑】%s：存檔照抄（GAME.snapshot），只把日期時間改成 %s %.2f 再讀檔' % (P.tag, why, key, hour))
    P.path.append('捷徑：存檔改時間到 %s %.2f' % (key, hour))
    await pg.evaluate(LOAD_JS, snap); await pg.wait_for_timeout(3500); await pg.evaluate(HOOK_JS)


async def begin(pg, P):
    await pg.evaluate(HOOK_JS); await pg.evaluate(RESET_JS)
    P.err0 = len(ERRS)


async def pushable(pg, cdp):
    for dx, dy in ((0, -60), (60, 0), (-60, 0), (0, 60)):
        moved, _, _ = await L.push_until(pg, cdp, dx, dy, 0.3, max_pushes=2)
        if moved >= 0.3: return round(moved, 2)
    return 0.0


async def finish(pg, cdp, P, home_ok=False):
    """共通：畫面字、JS 例外、之後能不能動（在家＝遊戲還在往下走）"""
    E = await evs(pg)
    texts = [e.get('t', '') for e in E if e.get('k') in ('say', 'toast', 'card')] + [o for e in E if e.get('k') == 'ch' for o in (e.get('opts') or []) + (e.get('hints') or [])] + [t for _, t in P.phone_texts]
    bad = sorted(set(m.group(0) for t in texts for m in BAD_RX.finditer(str(t))))
    R.check('[%s] 畫面上沒有 {name}／undefined／NaN／TODO／PLACEHOLDER（台詞 %d、選項、toast、手機 %d 段）' % (P.tag, len(says_of(E)), len(P.phone_texts)), not bad, J([t[:60] for t in texts if BAD_RX.search(str(t))][:5]))
    er = ERRS[P.err0:]
    R.check('[%s] 沒有 JS 例外（pageerror）' % P.tag, not er, J(er[:3]))
    cons = await pg.evaluate("(window.__ccCons||[]).filter(x=>x.indexOf('error')===0).slice(-5)")
    if cons: R.note('[%s] console.error（只記）：%s' % (P.tag, J(cons)))
    # 演完以後
    await close_phone(pg, cdp); await pg.wait_for_timeout(1500)
    s = await st(pg)
    if s['home'] or home_ok:
        k0 = (s['key'], s['hour']); t0 = time.time(); moved = None
        while time.time() - t0 < 60 * MAXS:
            s2 = await st(pg)
            if (s2['key'], s2['hour']) != k0 or s2['dlg'] or s2['nb'] or s2['phone']: moved = J({k: s2.get(k) for k in ('key', 'hour', 'dlg', 'nb', 'phone', 'zone')}); break
            await pg.wait_for_timeout(500)
        R.check('[%s] 演完以後沒有卡住（舊序章離校在家：60 秒內時間有往下走、或有下一段對話／選單／手機）' % P.tag, moved is not None, J(await pg.evaluate(IDLE_JS)))
    elif s['dlg'] or s['nb'] or s['busy'] or s['depth']:
        R.note('[%s] 演完以後下一段劇情接著開始（%s）：不推搖桿，記狀態' % (P.tag, J({k: s.get(k) for k in ('dlg', 'nb', 'busy', 'depth', 'ev', 'zone', 'key', 'hour')})))
    else:
        mv = await pushable(pg, cdp)
        R.check('[%s] 演完以後推得動（搖桿 ≥0.3 m；%s %s）' % (P.tag, s['zone'], s['key']), mv >= 0.3, J({'moved': mv, 'state': {k: s.get(k) for k in ('zone', 'busy', 'seat', 'interact')}}))
    R.note('[%s] 走的路：%s' % (P.tag, '；'.join(P.path) or '（沒有記）'))
    if P.menus: log('  [%s] 選過的選單：%s' % (P.tag, J([[m['opts'], m['pick']] for m in P.menus][-10:])))
    log('  [%s] 台詞（%d 句）：' % (P.tag, len(says_of(E))))
    for x in says_of(E): log('    [說] %s %s｜%s｜%s' % (x.get('d'), x.get('h'), role_of(x), x['t']))


# ---------------------------------------------------------------- 存檔（基底）
async def econ_st(pg, key, hour, done=(), flags=None, econff=None):
    d = await day_of(pg, key); d1017 = await day_of(pg, '2024-10-17')
    fl = dict(ECON_FLAGS); fl['E26_DAY'] = d1017['d']; fl['allowanceMonth'] = int(key[5:7]); fl.update(flags or {})
    if econff: fl['ECONFF'] = econff
    dn = ['ev_y0_e30', 'ev_y0_a3', 'ev_y0_e26', 'ev_y0_e02'] + list(done)
    return {'stage': 'econ', 'zone': 'campus', 'day': d['d'], 'weekday': d['wd'], 'hour': hour, 'money': 12000, 'pos': {'x': -117, 'z': 0.5, 'yaw': 1.57},
            'home': {'at': True, 'base': True, 'day': d['d']}, 'contacts': {k: d['d'] - 100 for k in ECON_PEOPLE},
            'flags': fl, 'events': {'done': {e: 1 for e in dn}, 'last': {e: d['d'] - 3 for e in dn}, 'count': len(dn)}}


async def law_st(pg, key, hour, zone='dorm', flags=None, done=()):
    d = await day_of(pg, key)
    fl = dict(LAW_FLAGS); fl.update(flags or {})
    return {'stage': 'law', 'zone': zone, 'day': d['d'], 'weekday': d['wd'], 'hour': hour, 'money': 30000, 'weather': 'clear', 'flags': fl,
            'events': {'done': {e: 1 for e in done}, 'last': {e: d['d'] - 3 for e in done}, 'count': len(done)}}


async def us_flags(pg, together, extra=None):
    a = await day_of(pg, '2028-08-02'); p = await day_of(pg, '2028-06-08')
    f = {'EXCHANGE_ROUTE': 'US', 'EXCH_RULE': 1, 'US_DEPARTED': True, 'US_ARRIVED': True, 'US_ARRIVED_DAY': a['d'], 'US1': 'together' if together else 'alone', 'Y4_PATH': 'bar', 'Y4_PATH_DAY': p['d']}   # cc_uslong_probe.py 的 USF
    f.update(extra or {})
    return f


async def us_load(pg, P, key, hour, zone, together, extra=None, done=(), why=''):
    st0 = await law_st(pg, key, hour, zone, await us_flags(pg, together, extra), done=list(done))
    setup = {'meet': ['heroine_05'], 'rel': REL_FRIEND, 'dating': ['heroine_05'] if together else [], 'since': 300}
    out = await load(pg, st0, setup)
    info = await pg.evaluate(US_INFO_JS)
    R.setup('[%s]【前置／捷徑】讀檔（GAME.applySave）到 %s %.2f %s；美國路線旗標（EXCHANGE_ROUTE US、US_ARRIVED…）；%s；%s；前置結果 %s；狀態 %s' % (
        P.tag, key, hour, zone, '和學姊交往中（dating_heroine_05、ROM dating）' if together else '和學姊沒在交往（挽回中，US1 alone）', why, J(out), J(info)))
    return info


# ---------------------------------------------------------------- 舊序章系所
async def part_e11(pg, cdp):
    P = Ctx('E11'); await begin(pg, P)
    st0 = await econ_st(pg, '2025-01-08', 17.0, done=['ev_y0_e12', 'ev_y0_cram_h', 'ev_y0_cram'])
    await load(pg, st0)
    info = await pg.evaluate(INFO_ECON_JS)
    R.setup('[E11]【前置／捷徑】讀檔到 2025-01-08（三）17:00 在家（舊序章系所舊序章離校在家、和可昕交往中、E01_MORNING＝30 分鐘版）；狀態 %s' % J(info))
    R.check('[E11] 前置：30 分鐘版（ECONFF.short）、舊序章離校在家（ECONFF.on2、HOME.at）', info['short'] and info['on2'] and info['home'], J(info))
    P.path.append('自然觸發：讀檔在家，ECONFF 在家那一輪自己跳到 18:30 演（沒有呼叫 EVENTS.run）')
    P.pick = lambda o, h: next((i for i, x in enumerate(o) if '妳打算怎麼辦' in x), None)
    wq = {'ev': ['ev_y0_jan8', 'ev_y0_jan8_h'], 'fl': ['Y0_JAN8']}
    w, s, ok = await drive(pg, cdp, P, lambda w, s: (w['flags']['Y0_JAN8'] or w['done']['ev_y0_jan8_h'] or w['done']['ev_y0_jan8']) and not s['dlg'] and not s['nb'], 600, wq, '1/8 公館吃燒臘')
    E = await evs(pg); ss = says_of(E)
    which = [k for k in ('ev_y0_jan8_h', 'ev_y0_jan8') if w and w['done'].get(k)]
    R.check('[E11] 1/8 18:30 公館吃燒臘演了（%s）' % (which or '沒有'), bool(which), J(w))
    if not which: await finish(pg, cdp, P, home_ok=True); return
    miss, bad, at = find_seq(ss, X['jan8_pre'])
    R.check('[E11] 開頭四句照順序、說話人對', not miss and not bad, J({'miss': miss, 'bad': bad}))
    chm = [e for e in E if e.get('k') == 'ch' and any('妳打算怎麼辦' in o for o in e.get('opts') or [])]
    R.check('[E11] 選項有「「妳打算怎麼辦？」」「（等她說下去）」', bool(chm) and X['j8a_opt'] in chm[0]['opts'], J([e.get('opts') for e in E if e.get('k') == 'ch']))
    picked = bool(chm) and chm[0].get('pick') is not None and chm[0]['opts'][chm[0]['pick']] == X['j8a_opt']
    R.check('[E11] 選了「「妳打算怎麼辦？」」（j8a）', picked, J(chm[:1]))
    if chm:
        after = [x for x in ss if x['i'] > chm[0]['i']]
        nxt = after[0] if after else None
        R.check('[E11] j8a 的下一句＝可昕「%s」' % X['j8a'], bool(nxt) and nxt['t'] == X['j8a'] and spk_ok(nxt, 'kexin'),
                '畫面上是：' + J(brief(after, 0, 3)))
        nx2 = after[1] if len(after) > 1 else None
        R.check('[E11] 再下一句（j8c）＝祐廷「%s」' % X['j8c'], bool(nx2) and nx2['t'] == X['j8c'] and spk_ok(nx2, 'player'), J(brief(after, 0, 3)))
    R.check('[E11] Y0_JAN8 記了', bool(w['flags'].get('Y0_JAN8')), J(w['flags']))
    await finish(pg, cdp, P, home_ok=True)


async def part_e12(pg, cdp):
    P = Ctx('E12'); await begin(pg, P)
    d13 = await day_of(pg, '2025-02-13')
    done = ['ev_y0_e12', 'ev_y0_cram_h', 'ev_y0_jan8_h', 'ev_y0_e21', 'ev_y0_kh3', 'ev_y0_e27', 'ev_y0_e23']
    st0 = await econ_st(pg, '2025-02-14', 13.0, done=done, flags={'Y0_JAN8': True, 'E21_CALLED': True, 'KH_TRIP': True, 'KH_TRIP_DONE': True, 'E27B_PLAN': True, 'RETAKE_TOGETHER': True, 'KX_THINK_LEAVE': True},
                        econff={'done': {'h21': 1, 'h3': 1}, 'lines': []})
    st0['events']['last']['ev_y0_e27'] = d13['d']
    await load(pg, st0)
    info = await pg.evaluate(INFO_ECON_JS)
    R.setup('[E12]【前置／捷徑】讀檔到 2025-02-14（五）13:00 在家；2/13 E27（行政大樓）演過、E27B_PLAN、RETAKE_TOGETHER、高雄三天兩夜記去過；30 分鐘版；狀態 %s' % J(info))
    R.check('[E12] 前置：30 分鐘版、舊序章離校在家', info['short'] and info['on2'] and info['home'], J(info))
    P.path.append('自然觸發：story3d.js 排出遊 y0_e27b（2/14 15:00），在家那一輪自己出發；2/15 RH-M0 照 ECONFF.STEPS2（rhLong）')
    P.pick = lambda o, h: next((i for i, x in enumerate(o) if '那我也在家讀' in x), None)
    wq = {'ev': ['ev_y0_e27b'], 'fl': ['CRAM_ASKED_TOGETHER'], 'said': [X['rhm0']]}
    w, s, ok = await drive(pg, cdp, P, lambda w, s: w['done']['ev_y0_e27b'] and not s['dlg'] and not s['nb'], 700, wq, '2/14 一起去問補習班')
    R.check('[E12] 2/14 ev_y0_e27b 演了（出遊自己出發）', bool(w and w['done']['ev_y0_e27b']), J(w))
    # 接著等 2/15 RH-M0
    w2, s2, ok2 = await drive(pg, cdp, P, lambda w, s: (w['said'][0] and not s['dlg'] and not s['nb']) or (w['key'] > '2025-02-15') or (w['key'] == '2025-02-15' and w['hour'] >= 19), 600, wq, '等 2/15 RH-M0')
    E = await evs(pg); ss = says_of(E)
    k = next((i for i, x in enumerate(ss) if x['t'] == X['dinner']), None)
    R.check('[E12] 「晚餐你請。」出現', k is not None, J([x['t'][:20] for x in ss[-12:]]))
    if k is not None:
        nxt = ss[k + 1:k + 6]
        got = [[role_of(x), x['t']] for x in nxt]
        okseq = len(nxt) == 5 and all(x['t'] == t and spk_ok(x, r) for x, (r, t) in zip(nxt, X['e27b_new']))
        R.check('[E12] 「晚餐你請。」後面緊接五格（宿舍月底要退／我媽說…／你問過了？／上禮拜就問了。／那我明天搬…），說話人可昕、祐廷交錯', okseq, '畫面上是：' + J(got))
    R.check('[E12] CRAM_ASKED_TOGETHER 記了', bool(w2 and w2['flags'].get('CRAM_ASKED_TOGETHER')), J(w2 and w2['flags']))
    km = next((i for i, x in enumerate(ss) if x['t'] == X['rhm0']), None)
    R.check('[E12] 2/15 RH-M0「（二月十五日。她拖著一個行李箱…）」在那五格之後才出現', km is not None and (k is None or km > k) and ss[km].get('d') == (await day_of(pg, '2025-02-15'))['d'], J(ss[km] if km is not None else [x['t'][:20] for x in ss[-6:]]))
    await finish(pg, cdp, P, home_ok=True)


async def part_e13(pg, cdp):
    P = Ctx('E13'); await begin(pg, P)
    done = ['ev_y0_e12', 'ev_y0_cram_h', 'ev_y0_jan8_h', 'ev_y0_e21', 'ev_y0_kh3', 'ev_y0_e27', 'ev_y0_e27b', 'ev_y0_e23', 'ev_y0_e35h', 'ev_y0_e18b']
    st0 = await econ_st(pg, '2025-07-11', 6.0, done=done, flags={'Y0_JAN8': True, 'E21_CALLED': True, 'KH_TRIP': True, 'KH_TRIP_DONE': True, 'E27B_PLAN': True, 'RETAKE_TOGETHER': True,
                                                               'KX_THINK_LEAVE': True, 'CRAM_ASKED_TOGETHER': True, 'E35_PLAN': True},
                        econff={'done': {'h21': 1, 'h3': 1, 'h29': 'cut', 'h34': 'cut'}, 'lines': []})
    await load(pg, st0)
    info = await pg.evaluate(INFO_ECON_JS)
    R.setup('[E13]【前置／捷徑】讀檔到 2025-07-11（五）06:00 在家（交往中、30 分鐘版、衝刺班過了、EXAM1_DONE 還沒記）；狀態 %s' % J(info))
    R.check('[E13] 前置：30 分鐘版（ECONFF.short）、舊序章離校在家', info['short'] and info['on2'] and info['home'], J(info))
    R.note('[E13] 對照（只記）：ECONFF.KEEP 有沒有 ev_y0_exam2＝%s' % info.get('keep2'))
    P.path.append('自然觸發：在家那一輪 07:30 演 ev_y0_exam1h，after1 照 STORY.travelOvernight 帶到 7/12 19:00，之後在家那一輪演（或不演）ev_y0_exam2')
    d12 = (await day_of(pg, '2025-07-12'))['d']
    wq = {'ev': ['ev_y0_exam1h', 'ev_y0_exam1', 'ev_y0_exam2'], 'fl': ['EXAM1_DONE', 'EXAM2_DONE', 'MATH_100']}
    w, s, ok = await drive(pg, cdp, P, lambda w, s: (w['flags']['EXAM2_DONE'] and not s['dlg']) or w['key'] > '2025-07-12' or (w['key'] == '2025-07-12' and w['hour'] >= 21.5), 900, wq, '7/11 考場 → 7/12 對答案')
    E = await evs(pg); ss = says_of(E)
    R.check('[E13] 7/11 考場演了（ev_y0_exam1h／exam1，EXAM1_DONE）', bool(w and (w['done']['ev_y0_exam1h'] or w['done']['ev_y0_exam1']) and w['flags']['EXAM1_DONE']), J(w))
    at712 = [x for x in E if x.get('d') == d12 and (x.get('h') or 0) >= 18.9]
    R.note('[E13] 7/12 19:00 以後畫面上的事（前 8 筆）：%s' % J([[x.get('k'), str(x.get('t') or x.get('opts') or x.get('th'))[:40], x.get('h')] for x in at712[:8]]))
    R.check('[E13] 時間到了 7/12 19:00（after1 帶過去）', bool(w) and (w['key'] > '2025-07-12' or (w['key'] == '2025-07-12' and w['hour'] >= 19)), J(w and {k: w[k] for k in ('key', 'hour', 'zone')}))
    miss, bad, pos = find_seq(ss, X['exam2'])
    R.check('[E13] 7/12 晚上演 ev_y0_exam2 對答案（六格照順序、說話人對；「數學我錯一題。」）', not miss and not bad, '缺：%s；說話人錯：%s；7/12 19:00 以後畫面上：%s' % (J(miss), J(bad), J([x['t'][:30] for x in ss if x.get('d') == d12][:6])))
    if pos: R.check('[E13] 對答案在 7/12（不是隔天補）', ss[pos[0]].get('d') == d12, J(ss[pos[0]]))
    R.check('[E13] EXAM2_DONE、MATH_100 記了、ev_y0_exam2 記演過', bool(w and w['flags']['EXAM2_DONE'] and w['flags']['MATH_100'] and w['done']['ev_y0_exam2']), J(w and [w['flags'], w['done']]))
    await finish(pg, cdp, P, home_ok=True)


# ---------------------------------------------------------------- 寒暑假（沛珊）
PS = 'classmate_peishan'


async def ps_load(pg, P, key, hour, vac=None, flags=None, meet=(), groups=(), why=''):
    st0 = await law_st(pg, key, hour, 'dorm', flags)
    setup = {'meet': [PS] + list(meet), 'rel': REL_FRIEND, 'dating': [PS], 'since': 200, 'dateLog': {PS: 3}, 'vac': vac or {}, 'groups': [list(g) for g in groups], 'flags': flags or {}}
    out = await load(pg, st0, setup)
    d = (await day_of(pg, key))['d']
    info = await pg.evaluate(PS_INFO_JS, {'days': [d, d + 1, d + 3, d + 5]})
    R.setup('[%s]【前置／捷徑】讀檔（GAME.applySave）到 %s %.2f 宿舍；和沛珊交往中（dating_classmate_peishan、ROM 200 天前開始、正式約會 3 次）；%s；前置結果 %s；她：%s' % (P.tag, key, hour, why, J(out), J(info)))
    return info


async def part_h21(pg, cdp):
    for case in ENVL('H21_CASES', 'C11@Y2,C12@Y2'):
        P = Ctx('H21_' + case.replace('@', '')); await begin(pg, P)
        try:
            id_, yk = case.split('@')
            rd = await pg.evaluate("(k=>{ const [id,yk]=k.split('@'); const I=VAC.inst(id,yk); return I?{to:I.to,key:CALENDAR.dateOf(I.to).key,title:I.A.title,kind:I.A.place.kind}:null; })", case)
            if not R.check('[%s] 前置：%s 這一趟在遊戲資料裡（VAC.inst）' % (P.tag, case), bool(rd), J(rd)): continue
            info = await ps_load(pg, P, rd['key'], 20.83, vac={case: 'done'}, why='%s（%s，%s 回國）記成 done' % (case, rd['title'], rd['key']))
            P.path.append('自然觸發：回國那天 21:00 手機規則（vac3d.js 重逢）照時間收；探針自己打開手機看')
            tag = 'vac_re_%s_%s' % (case, PS)
            w0 = await pg.evaluate(WATCH_JS, {'tags': [tag]})
            R.check('[%s] 21:00 以前還沒收到（讀檔時 %s %.2f）' % (P.tag, w0['key'], w0['hour']), not w0['msgs'], J(w0['msgs']))
            P.answer_others = True
            w, s, ok = await drive(pg, cdp, P, lambda w, s: bool(w['msgs']) and not s['dlg'] and not s['nb'], 420, {'tags': [tag], 'ths': ['p:' + PS]}, '等 21:00 她的私訊')
            mine = [m for m in (w or {}).get('msgs', []) if m['tag'] == tag]
            exp = X['ps_retake'] if rd['key'] < '2027-08-06' else X['ps_after']
            R.note('[%s] 收到（資料）：%s' % (P.tag, J(mine)))
            R.check('[%s] %s 21:00 收到她的私訊（tag %s）' % (P.tag, rd['key'], tag), bool(mine) and all(abs((m.get('h') or 0) - 21) < 0.01 for m in mine), J(mine))
            R.check('[%s] 私訊逐字＝%s' % (P.tag, J(exp)), [m['text'] for m in mine] == exp, '畫面資料是：' + J([m['text'] for m in mine]))
            if rd['key'] < '2027-08-06':
                R.check('[%s] 舊序章考試期不是「開學前才上去」那段' % P.tag, all(m['text'] != X['ps_old'] for m in mine), J([m['text'] for m in mine]))
            ok2, body = await open_thread(pg, cdp, 'p:' + PS)
            P.phone_texts.append(['p:' + PS, body])
            idx = [body.find(t) for t in exp]
            R.check('[%s] 手機「訊息」→ 沛珊那一段：看得到這幾句、照順序' % P.tag, ok2 and all(i >= 0 for i in idx) and idx == sorted(idx), J({'tapped': ok2, 'idx': idx, 'body': body[-300:]}))
            await close_phone(pg, cdp)
            await finish(pg, cdp, P)
        except Exception as e:
            R.check('[%s] 沒有中斷' % P.tag, False, repr(e)[:300])


async def part_h22(pg, cdp):
    P = Ctx('H22'); await begin(pg, P)
    chosen = None; tried = []
    for key in ['2027-01-25', '2027-01-27', '2027-07-12', '2027-07-19']:
        info = await ps_load(pg, P, key, 14.0, why='候選日 %s' % key)
        brk = info.get('brk'); pres = info.get('pres') or {}
        okp = all(isinstance(v, dict) and (v.get('here') or v.get('kind') == 'home') for k, v in pres.items() if k != key)
        if isinstance(brk, dict) and okp and info.get('datingDays', 0) >= 28 and (info.get('dateCount') or 0) >= 2: chosen = (key, info); break
        tried.append([key, '假期 %s；她 %s；交往 %s 天；約會 %s 次' % (J(brk), J(pres), info.get('datingDays'), info.get('dateCount'))])
    if tried: R.note('[H22] 跳過的候選日：%s' % J(tried))
    if not R.check('[H22] 前置：找到在假期裡、她那幾天在臺灣（here 或回老家）、交往滿 28 天、約會 ≥2 次的日子', bool(chosen), J(tried)):
        return
    key, info = chosen
    R.note('[H22] 用 %s；沛珊不能出去的那段（TRIP_MSG.gf.off）＝%s' % (key, J(info.get('off'))))
    await pg.evaluate(RESET_JS)
    P.path.append('自然觸發：手機「活動」→「安排出國旅遊」（VAC.plan13）一路選到「和%s」' % (info.get('name') or '沛珊'))
    t13_0 = (await pg.evaluate(VACI_JS, []))['t13']
    await open_tab(pg, cdp, 'events')
    okb = await L.tap(pg, cdp, '#phoneBody [data-vac13]')
    R.check('[H22] 手機「活動」有「安排出國旅遊」、按得到', okb, (await pg.evaluate(PBODY_JS))[:300])
    if not okb: await close_phone(pg, cdp); await finish(pg, cdp, P); return
    step = {}

    def pick(o, h):
        if any('出發（' in x for x in o): return 0
        if any(x.endswith(' 天') for x in o): return next((i for i, x in enumerate(o) if x.endswith(' 天')), 0)
        if '自己去' in o:
            k = next((i for i, x in enumerate(o) if '沛珊' in x), None)
            step['who'] = o[k] if k is not None else None
            if k is None:   # 不能退回選「自己去」（會真的排一趟）：沒有她就選「不去了」
                log('    [選項] 和誰：沒有「沛珊」（%s）→ 不去了' % J(o)); return o.index('不去了') if '不去了' in o else None
            return k
        return next((i for i, x in enumerate(o) if x != '不去了'), 0)
    P.pick = pick; P.answer_others = False
    w, s, ok = await drive(pg, cdp, P, lambda w, s: 'who' in step and not s['dlg'] and not s['nb'] and not s['busy'] and not s['depth'], 240, {}, '安排出國旅遊（和沛珊）')
    R.check('[H22] 和誰的選單有「和沛珊」', bool(step.get('who')), J(step))
    E = await evs(pg); ss = says_of(E)
    k = next((i for i, x in enumerate(ss) if x['t'] == X['ask_out']), None)
    R.check('[H22] 祐廷問「要不要一起出國？」', k is not None and spk_ok(ss[k], 'player'), J([x['t'][:24] for x in ss]))
    her = [x for x in ss[(k + 1 if k is not None else 0):] if x.get('cid') == PS]
    R.check('[H22] 她的回答＝「%s」（舊序章考試期 noOff）' % X['ps_noOff'], bool(her) and her[0]['t'] == X['ps_noOff'] and len(her) == 1, '畫面上她說：' + J([x['t'] for x in her]))
    R.check('[H22] 不是一般句「%s」' % X['ps_no'], all(x['t'] != X['ps_no'] for x in her), J([x['t'] for x in her]))
    t13 = (await pg.evaluate(VACI_JS, []))['t13']
    R.check('[H22] 被拒＝沒有排出一趟（V.t13 筆數沒變 %d→%d）' % (len(t13_0), len(t13)), len(t13) == len(t13_0), J(t13))
    await close_phone(pg, cdp)
    await finish(pg, cdp, P)


def md(key):
    return '%d/%d' % (int(key[5:7]), int(key[8:10]))


async def sys_clash(pg, rx='^會撞到：'):
    w = await pg.evaluate(WATCH_JS, {'rx': rx})
    return [m for m in w['msgs'] if m['th'] == 'sys']


async def part_h23(pg, cdp):
    P = Ctx('H23'); await begin(pg, P)
    vac = {'C09@Y2': 'yes', 'C12@Y2': 'yes'}
    info = await ps_load(pg, P, '2027-07-10', 20.83, vac=vac, flags={'VAC_C09': True, 'VAC_C09_INT': True, 'VAC_C12': True},
                         meet=['npc_fangyt', 'zhe', 'yu', 'classmate_bohan'], groups=[['noodle_team', '桌遊團']],
                         why='C09@Y2 柬埔寨、C12@Y2 京都報名 yes（VAC_C09_INT：面試到了＝不會「沒上」）；在桌遊團群組；方奕廷、阿哲、Alison、柏翰 FAMILIAR 以上')
    VI = await pg.evaluate(VACI_JS, ['C09@Y2', 'C12@Y2', 'T02@Y2'])
    R.note('[H23] 遊戲資料：%s' % J(VI))
    if not R.check('[H23] 前置：C09、C12 是 yes、T02 在資料裡', (VI.get('C09@Y2') or {}).get('reg') == 'yes' and (VI.get('C12@Y2') or {}).get('reg') == 'yes' and bool(VI.get('T02@Y2')), J(VI)): return
    C09, C12, T02, VA10 = VI['C09@Y2'], VI['C12@Y2'], VI['T02@Y2'], VI['VA10']
    mds = await pg.evaluate(MD_JS, [max(T02['from'], C09['from']), max(VA10['from'], C12['from'])])
    exp_a = '會撞到：%s %s' % (C09['title'], mds[0])
    exp_b = '會撞到：%s %s' % (C12['title'], mds[1])
    # a. T02 私訊（7/10 21:00）
    P.path.append('a 自然觸發：7/10 21:00 方奕廷私訊（vac3d.js dm），手機自己打開、點進去回「去。」')
    P.phone_want = ['p:npc_fangyt']; P.phone_ask = lambda th, o: (next((i for i, x in enumerate(o) if x == '去。'), None) if th == 'p:npc_fangyt' else None)
    tg = 'vac_ask_T02@Y2'
    w, s, ok = await drive(pg, cdp, P, lambda w, s: any(x[0] == 'p:npc_fangyt' for x in P.answered) and not s['phone'], 420, {'tags': [tg]}, 'a. 7/10 21:00 T02 私訊')
    dm = [m for m in (w or {}).get('msgs', []) if m['tag'] == tg]
    R.check('[H23a] 7/10 21:00 收到方奕廷揪 T02（有回覆選項）', bool(dm) and any(m.get('ask') for m in dm), J(dm))
    cl = await sys_clash(pg)
    R.note('[H23a] 系統字（會撞到）：%s' % J(cl))
    R.check('[H23a] 私訊後面多一行系統字「%s」' % exp_a, any(m['text'] == exp_a for m in cl), '資料裡的系統字：' + J([m['text'] for m in cl]))
    R.check('[H23a] 回了「去。」', any(x == ['p:npc_fangyt', '去。'] for x in P.answered), J(P.answered))
    await pg.wait_for_timeout(2500)
    cl = await sys_clash(pg); v2 = await pg.evaluate(VACI_JS, ['T02@Y2'])
    R.check('[H23a] 答應的當下又撞到：「%s（同一段時間只能去一趟）」' % exp_a, any(m['text'] == exp_a + '（同一段時間只能去一趟）' for m in cl), J([m['text'] for m in cl]))
    R.check('[H23a] 不擋：T02 照報（reg yes）', (v2.get('T02@Y2') or {}).get('reg') == 'yes', J(v2))
    ok2, body = await open_thread(pg, cdp, 'sys'); P.phone_texts.append(['sys', body])
    R.check('[H23a] 畫面：手機「訊息」→「通知」那一段看得到「%s」' % exp_a, ok2 and exp_a in body, J({'tapped': ok2, 'body': body[-300:]}))
    await close_phone(pg, cdp)
    # b. VA10：BB 18:10 定案——規格只要求「送出前」多一行「會撞到：…」；VA10 沒有「答應的當下」那句（只有活動卡 VAC_PICK 有），不檢查。
    #    改查：群組邀約（g:noodle_team，7/20 21:00）和阿哲催問（p:zhe，8/1 20:00，vac_activities.js VA10.nudge）兩則送出時都有那一行。
    #    群組先不回，等阿哲催；從 a 之前的狀態重新讀（a 答應的 T02 是 8/1～8/4，跳到 8/1 會碰上出發）。
    fl_b = {'VAC_C09': True, 'VAC_C09_INT': True, 'VAC_C12': True}
    if YTMET: fl_b['YT_MET_JOB'] = True
    await ps_load(pg, P, '2027-07-20', 20.83, vac=vac, flags=fl_b,
                  meet=['npc_fangyt', 'zhe', 'yu', 'classmate_bohan'], groups=[['noodle_team', '桌遊團']],
                  why='b 重新讀：C09、C12 yes、T02 沒報（a 答應的 T02 8/1～8/4 會和阿哲 8/1 催問撞，不帶）；%s' % ('【前置】認識語彤（G.flags.YT_MET_JOB）' if YTMET else '沒認識語彤（沒有 YT_MET_JOB）'))
    DIAG_VA = "(()=>{ const G=GAME.G, Q=(G.phone&&G.phone.q)||[]; return {key:(CALENDAR.dateOf(G.day)||{}).key, h:+(+G.hour).toFixed(2), msgs:(G.msgs||[]).filter(m=>m&&m.tag==='va10_ask').map(m=>({from:m.from||null, t:String(m.text||'').slice(0,16), ask:!!m.ask})), q:Q.filter(x=>x&&x.tag==='va10_ask').map(x=>({day:x.day,h:x.h,n:(x.items||[]).length,asks:(x.items||[]).filter(i=>i&&i.ask).map(i=>i.ask.id)})), pending:(typeof PHONE!=='undefined'&&PHONE.pending?PHONE.pending(G).map(m=>m.ask&&m.ask.id):[])}; })()"
    R.note('[H23b] BB 20:50 診斷：讀檔完（7/20 21:00 以前）G.msgs／G.phone.q 的 va10_ask、PHONE.pending：%s' % J(await pg.evaluate(DIAG_VA)))
    P.path.append('b1 自然觸發：7/20 21:00 桌遊團群組揪香港（VA10）——先不回')
    P.phone_want = ['g:noodle_team']; P.cur_th = None; P.opened = {}; P.answered = []
    P.phone_ask = lambda th, o: None
    w, s, ok = await drive(pg, cdp, P, lambda w, s: any(m['tag'] == 'va10_ask' for m in (w or {}).get('msgs', [])) and not s['phone'], 420, {'tags': ['va10_ask', 'va10_nudge'], 'fl': ['VA10']}, 'b1. 7/20 21:00 VA10 群組（不回）')
    R.note('[H23b] BB 20:50 診斷：21:00 送出以後 G.msgs／G.phone.q 的 va10_ask、PHONE.pending：%s' % J(await pg.evaluate(DIAG_VA)))
    va = [m for m in (w or {}).get('msgs', []) if m['tag'] == 'va10_ask']
    if not any(m.get('ask') for m in va):   # N1_AA814（b77a）這一格 FAIL：vac3d.js 把 ask 掛在群組最後一則（M[M.length-1]），探針記到的卻是 null——印出整串和 G.msgs 原始那一則對照
        raw = await pg.evaluate("(()=>(GAME.G.msgs||[]).filter(m=>m&&m.tag==='va10_ask').map(m=>JSON.stringify(m).slice(0,400)))()")
        R.note('[H23b] va10_ask 全部 %d 則（探針記錄）：%s；G.msgs 原始：%s' % (len(va), J(va), J(raw)))
    R.check('[H23b] 7/20 21:00 桌遊團群組揪香港（有回覆選項）', bool(va) and any(m.get('ask') for m in va), J(va[-2:]))
    ytmet_now = await pg.evaluate("(()=>{ try{ return typeof YTJOB!=='undefined'&&YTJOB.met?!!YTJOB.met(GAME.G):!!(GAME.G.flags||{}).YT_MET_JOB; }catch(e){ return 'ERR '+e; } })()")
    askf = [m.get('from') for m in va if m.get('ask')]; ytm = [m for m in va if m.get('from') == 'heroine_03']
    R.note('[H23b] 認識語彤：設 %s、遊戲判 %s；帶回覆選項的那則是誰說的 %s；語彤在這串的話 %d 則' % (YTMET, ytmet_now, J(askf), len(ytm)))
    if YTMET:
        R.check('[H23b] 認識語彤：回覆選項照舊在語彤那則', 'heroine_03' in askf, J(va[-3:]))
    else:
        R.check('[H23b] 沒認識語彤：回覆選項在別人那則（不是語彤）', bool(askf) and 'heroine_03' not in askf, J(askf))
        R.check('[H23b] 沒認識語彤：群組裡沒有語彤的話（她不該出現）', not ytm, J(ytm))
    cl1 = await sys_clash(pg); n1 = sum(1 for m in cl1 if m['text'] == exp_b)
    R.check('[H23b] 群組邀約送出時多一行系統字「%s」' % exp_b, n1 >= 1, J([m['text'] for m in cl1]))
    ok2, body = await open_thread(pg, cdp, 'sys'); P.phone_texts.append(['sys', body])
    R.check('[H23b] 畫面：「通知」那一段看得到「%s」' % exp_b, ok2 and exp_b in body, body[-200:])
    await close_phone(pg, cdp)
    await jump(pg, P, '2027-08-01', 19.83, '群組沒回，跳到阿哲催問那一天的前 10 分鐘（VA10.nudge 8/1 20:00）')
    P.path.append('b2 自然觸發：8/1 20:00 阿哲私訊催「香港 你到底要不要」——回「我也去。」')
    P.phone_want = ['p:zhe']; P.cur_th = None; P.opened = {}
    P.phone_ask = lambda th, o: (next((i for i, x in enumerate(o) if x == '我也去。'), None) if th == 'p:zhe' else None)
    w, s, ok = await drive(pg, cdp, P, lambda w, s: any(x[0] == 'p:zhe' for x in P.answered) and not s['phone'], 420, {'tags': ['va10_ask', 'va10_nudge'], 'fl': ['VA10']}, 'b2. 8/1 20:00 阿哲催問')
    vn = [m for m in (w or {}).get('msgs', []) if m['tag'] == 'va10_nudge']
    R.check('[H23b] 8/1 20:00 阿哲私訊催問（有回覆選項）', bool(vn) and any(m.get('ask') for m in vn), J(vn[-2:]))
    cl2 = await sys_clash(pg); n2 = sum(1 for m in cl2 if m['text'] == exp_b)
    R.check('[H23b] 阿哲催問送出時也多一行系統字「%s」（共 %d 行，群組那時 %d 行）' % (exp_b, n2, n1), n2 >= n1 + 1, J([m['text'] for m in cl2]))
    R.note('[H23b] 答應的當下那句：VA10 照設計沒有（BB 18:10：只有活動卡 VAC_PICK 有），不檢查')
    R.check('[H23b] 不擋：回「我也去。」以後 VA10＝yes', bool(w) and w['flags'].get('VA10') == 'yes', J(w and w['flags']))
    # c. T13 選出發日
    P.path.append('c 自然觸發：手機「活動」→「安排出國旅遊」：看出發日選項下面的小字，挑一個有撞的、自己去')
    VI = await pg.evaluate(VACI_JS, ['C09@Y2', 'C12@Y2', 'T02@Y2'])
    regs = [(v['title'], v['from'], v['to']) for k, v in VI.items() if k in ('C09@Y2', 'C12@Y2', 'T02@Y2') and v and v.get('reg') in ('yes', 'done')]
    if (VI.get('VA10') or {}).get('reg') == 'yes': regs.append((VA10['title'], VA10['from'], VA10['to']))
    regs += [(r['title'], r['from'], r['to']) for r in VI['t13']]
    R.note('[H23c] 已答應的（探針自己算撞期用）：%s' % J(regs))
    t13_0 = len(VI['t13'])
    await open_tab(pg, cdp, 'events')
    if not R.check('[H23c] 手機「活動」有「安排出國旅遊」', await L.tap(pg, cdp, '#phoneBody [data-vac13]'), ''):
        await close_phone(pg, cdp); await finish(pg, cdp, P); return
    starts = {}

    def pick(o, h):
        if any('出發（' in x for x in o):
            starts['opts'] = o; starts['hints'] = h
            k = next((i for i, x in enumerate(h or []) if x), None)
            return 0 if k is None else k
        if any(x.endswith(' 天') for x in o): return next((i for i, x in enumerate(o) if x.endswith(' 天')), 0)
        if '自己去' in o: return o.index('自己去')
        return next((i for i, x in enumerate(o) if x != '不去了'), 0)
    P.pick = pick; P.answer_others = False; P.phone_want = []
    w, s, ok = await drive(pg, cdp, P, lambda w, s: 'opts' in starts and not s['nb'] and not s['dlg'] and not s['busy'] and not s['depth'], 240, {}, 'c. T13 出發日')
    E = await evs(pg); chs = [e for e in E if e.get('k') == 'ch' and any('出發（' in o for o in e.get('opts') or [])]
    if not R.check('[H23c] 出發日的選單出來了', bool(chs), J([e.get('opts') for e in E if e.get('k') == 'ch'])):
        await close_phone(pg, cdp); await finish(pg, cdp, P); return
    ch = chs[0]; rows = []; allok = True
    keys = []
    for o in ch['opts']:
        m = re.match(r'(\d+)/(\d+) 出發（(\d+)/(\d+) 回來）', o)
        keys.append(('2027-%02d-%02d' % (int(m.group(1)), int(m.group(2))), '2027-%02d-%02d' % (int(m.group(3)), int(m.group(4)))) if m else None)
    dd = {}
    for kk in keys:
        if kk:
            for x in kk: dd[x] = (await day_of(pg, x))['d']
    for i, o in enumerate(ch['opts']):
        if not keys[i]: continue
        a, b = dd[keys[i][0]], dd[keys[i][1]]
        ov = [(t, max(f, a)) for t, f, e in regs if f <= b and e >= a]
        exp = []
        if ov:
            mm = await pg.evaluate(MD_JS, [x[1] for x in ov]); exp = ['%s %s' % (t, q) for (t, _), q in zip(ov, mm)]
        hint = (ch.get('hints') or [''] * len(ch['opts']))[i]
        if not exp: good = hint == ''
        else:
            parts = hint[len('會撞到：'):].split('、') if hint.startswith('會撞到：') else []
            good = hint.startswith('會撞到：') and ((set(parts) == set(exp)) if len(exp) <= 3 else (len(parts) == 3 and set(parts) <= set(exp)))
        allok = allok and good
        rows.append({'opt': o, 'hint': hint, 'exp': exp, 'ok': good})
    R.note('[H23c] 出發日選項：%s' % J(rows))
    R.check('[H23c] 出發日選項下面的小字＝會撞到哪幾天（有撞才寫，照已答應的 C09、C12、T02、VA10 算）', allok and any(r['exp'] for r in rows), J(rows))
    VI2 = await pg.evaluate(VACI_JS, [])
    pk = ch.get('pick')
    R.check('[H23c] 不擋：挑了有撞的那天（%s）、自己去，照排（V.t13 %d→%d）' % (ch['opts'][pk] if pk is not None else None, t13_0, len(VI2['t13'])),
            pk is not None and bool((ch.get('hints') or [''])[pk]) and len(VI2['t13']) == t13_0 + 1, J(VI2['t13']))
    await close_phone(pg, cdp)
    await finish(pg, cdp, P)


# ---------------------------------------------------------------- 美國交換
S5 = 'heroine_05'


async def part_u31(pg, cdp):
    for zone in ENVL('U31_ZONES', 'us_lawlib'):
        P = Ctx('U31_' + zone); await begin(pg, P)
        try:
            info = await us_load(pg, P, '2028-09-13', 18.7, zone, False, why='9/13 18:42 人在 %s（不在社區三區）' % zone)
            R.check('[%s] 前置：美國路線、在美國、沒交往、還沒有 US2' % P.tag, info['route'] == 'US' and info['abroad'] and info['inUS'] and not info['dating5'] and not info['US2'], J(info))
            P.path.append('自然觸發：r2y4a3d.js tick（每 0.5 秒）的 us2RepairDue；起點 %s' % zone)
            P.pick = lambda o, h: next((i for i, x in enumerate(o) if x in ('「報告怎麼了？」', '「我陪妳吃完再走。」')), None)
            w, s, ok = await drive(pg, cdp, P, lambda w, s: (w['flags']['US2'] and not s['dlg'] and not s['nb']) or w['hour'] >= 19.1, 420, {'ev': ['ev_us2_repair'], 'fl': ['US2', 'US2_STAYED']}, '9/13 18:45 挽回版 US2')
            E = await evs(pg); ss = says_of(E)
            k = next((i for i, x in enumerate(ss) if x['t'] == X['us2r_first']), None)
            R.check('[%s] 9/13 18:45～ 演 ev_us2_repair（人在 %s 也演）' % (P.tag, zone), bool(w and w['done']['ev_us2_repair']) and k is not None, '到 %s 都沒演；畫面上：%s' % (w and w['hour'], J([x['t'][:30] for x in ss[:5]])))
            if k is not None:
                R.check('[%s] 先帶到 C 棟 208（第一句的時候人在 us_shared）' % P.tag, ss[k].get('z') == 'us_shared', J(ss[k]))
            R.check('[%s] US2＝repair' % P.tag, bool(w) and w['flags'].get('US2') == 'repair', J(w and w['flags']))
            await finish(pg, cdp, P)
        except Exception as e:
            R.check('[%s] 沒有中斷' % P.tag, False, repr(e)[:300])


async def part_u32(pg, cdp):
    for case in ENVL('U32_CASES', 'bloom,sf'):
        P = Ctx('U32_' + case); await begin(pg, P)
        try:
            together = case == 'sf'
            info = await us_load(pg, P, '2028-12-15', 22.5, 'us_apartment', together, why='12/15 22:30 公寓（%s；沒見過舊序章同學）' % ('舊金山版' if together else '布魯明頓版'))
            al = await pg.evaluate(ALARMS_JS, '2028-12-16'); R.note('[%s] 對照（只記）：STORY.wakeAlarms(12/16)＝%s' % (P.tag, J(al)))
            R.check('[%s] 前置：美國路線、%s、沒見過舊序章同學' % (P.tag, '交往中' if together else '沒交往'), info['route'] == 'US' and info['dating5'] == together and not info['MET_LONG'] and not info['metLong'], J(info))
            bed = await pg.evaluate(SLEEP_IT_JS)
            R.note('[%s] 床（互動「%s」）%s' % (P.tag, bed and bed['label'], J(bed)))
            if not R.check('[%s] 公寓裡有床（互動 sleep）' % P.tag, bool(bed), ''): continue
            t0 = time.time()
            while time.time() - t0 < 120 * MAXS:   # 6 秒一段（乙 13），途中有劇情／選單／手機就回主迴圈
                s = await st(pg)
                if s['dlg'] or s['nb'] or s['phone']: await drive(pg, cdp, P, lambda w, s: not s['dlg'] and not s['nb'] and not s['phone'], 60, {}, '走去床途中的插曲'); continue
                if s['interact'].startswith(bed['label']): break
                if await L.go_to(pg, cdp, R, bed['x'], bed['z'], 0.5, '[%s] 走到床' % P.tag, max_s=6, lv=bed['lv']): await pg.wait_for_timeout(800)
            s = await st(pg)
            if not R.check('[%s] 走到床，互動鍵是「%s」' % (P.tag, bed['label']), s['interact'].startswith(bed['label']), J({k: s.get(k) for k in ('interact', 'zone')})): continue
            P.path.append('床：走過去按「%s」（玩家的路）' % bed['label'])
            await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
            bedm = {}

            def pick(o, h):
                if any(x.startswith('睡到明天') or x.startswith('睡覺') for x in o) and 'opts' not in bedm:
                    bedm['opts'] = o; bedm['hints'] = h
                    return next((i for i, x in enumerate(h or []) if '鬧鐘' in x), next((i for i, x in enumerate(o) if x.startswith('睡到明天')), 0))
                return None
            P.pick = pick
            P.path.append('之後照遊戲：睡到鬧鐘、07:00 R2Y4A.leave 自己帶到社區門口演 ev_us_leave')
            wq = {'ev': ['ev_us_leave', 'ev_us_bloom16', 'ev_sf1'], 'fl': ['US_TRIP_MODE', 'US_LEFT']}
            w, s, ok = await drive(pg, cdp, P, lambda w, s: w['done']['ev_us_leave'] and not s['dlg'], 900, wq, '睡到 12/16、07:00 離開')
            hints = bedm.get('hints') or []
            R.note('[%s] 床的選項：%s' % (P.tag, J(list(zip(bedm.get('opts') or [], hints)))))
            exp, other = X['alarm'][case], X['alarm']['sf' if case == 'bloom' else 'bloom']
            R.check('[%s] 床的選項小字有鬧鐘「%s」' % (P.tag, exp), any(exp in x for x in hints), '小字是：' + J(hints))
            R.check('[%s] 沒有另一版的鬧鐘字「%s」' % (P.tag, other), not any(other in x for x in hints), J(hints))
            E = await evs(pg); ss = says_of(E)
            R.check('[%s] 12/16 07:00 演 ev_us_leave（US_TRIP_MODE＝%s）' % (P.tag, w and w['flags'].get('US_TRIP_MODE')), bool(w and w['done']['ev_us_leave']), J(w))
            k = next((i for i, x in enumerate(ss) if x['t'] == X['leave_n']), None)
            R.check('[%s] 「%s」' % (P.tag, X['leave_n']), k is not None, J([x['t'][:30] for x in ss[-6:]]))
            if k is not None:
                nxt = [x['t'] for x in ss[k + 1:k + 3]]
                if case == 'bloom':
                    R.check('[%s] 布魯明頓版：後面緊接兩句「%s」「%s」' % (P.tag, X['leave_bloom'][0], X['leave_bloom'][1]), nxt == X['leave_bloom'] and all(spk_ok(x, 'narr') for x in ss[k + 1:k + 3]), '畫面上是：' + J(nxt))
                else:
                    R.check('[%s] 舊金山版：沒有那兩句' % P.tag, not any(t in X['leave_bloom'] for t in [x['t'] for x in ss]), J(nxt))
            nx = 'ev_sf1' if together else 'ev_us_bloom16'
            w2, s2, ok2 = await drive(pg, cdp, P, lambda w, s: w['done'][nx] and not s['dlg'], 180, wq, '接下來那一週（%s）' % nx)
            R.check('[%s] 接下來那一週有接上（%s 演了）' % (P.tag, nx), bool(w2 and w2['done'][nx]), J(w2))
            await finish(pg, cdp, P)
        except Exception as e:
            R.check('[%s] 沒有中斷' % P.tag, False, repr(e)[:300])


async def part_u33(pg, cdp):
    P = Ctx('U33'); await begin(pg, P)
    info = await us_load(pg, P, '2028-08-02', 18.83, 'us_outside', False, why='抵達那天 18:50 在社區外（US1 alone、ev_us1_arrive 還沒演）')
    R.check('[U33] 前置：美國路線、抵達當天、沒交往', info['route'] == 'US' and info['US1'] == 'alone' and not info['dating5'], J(info))
    P.path.append('讀檔接續（r2y4a3d.js tick：「讀檔回到抵達那一段」自己演 ev_us1_arrive）；從台灣飛過來那段用【前置】讀檔取代')
    w, s, ok = await drive(pg, cdp, P, lambda w, s: w['done']['ev_us1_arrive'] and w['flags']['US1_FREE'] and not s['dlg'] and not s['nb'], 300, {'ev': ['ev_us1_arrive'], 'fl': ['US1_FREE']}, '8/2 抵達（挽回中）')
    E = await evs(pg); ss = says_of(E)
    R.check('[U33] ev_us1_arrive 演了', bool(w and w['done']['ev_us1_arrive']), J(w))
    miss, bad, at = find_seq(ss, X['arr_alone'])
    R.check('[U33] 巴士站三句照順序（最後一句「%s」）' % X['arr_alone'][2][1], not miss and not bad, '缺：%s；說話人錯：%s；畫面上：%s' % (J(miss), J(bad), J([x['t'][:30] for x in ss])))
    if len(at) == 3: R.check('[U33] 「超市在那邊。…」後面緊接那一句', at[2] == at[1] + 1, J(brief(ss, at[1], at[1] + 3)))
    tt = [e.get('t') for e in E if e.get('k') == 'toast']
    R.check('[U33] toast「%s」' % X['arr_toast'], X['arr_toast'] in tt, J(tt))
    await finish(pg, cdp, P)


async def wait_auto_phone(pg, P, t_arr, secs):
    """訊息到了以後，手機自己打開（GAME.openPhone／phoneThread 被遊戲叫，或畫面上手機開著；探針這段時間不碰手機）"""
    t0 = time.time()
    while time.time() - t0 < secs * MAXS:
        E = await evs(pg)
        by = [e for e in E if e.get('k') == 'phone' and e.get('ms', 0) >= t_arr - 3000]
        if by: return by[0]
        if (await st(pg))['phone']: return {'by': '畫面上手機開著'}
        await pg.wait_for_timeout(500)
    return None


async def ask_flow(pg, cdp, P, tag, th, opt_text):
    """要回的私訊：等訊息到、看手機會不會自己打開；開了＝列表點她那一段、照字回；沒開（修改前）＝探針自己打開、記看到什麼"""
    P.phone_want = []; P.answer_others = True   # 等訊息的時候：別的待回覆照常處理（手機開著遊戲暫停，時間不走）；訊息一到就停手、不碰手機
    w, s, ok = await drive(pg, cdp, P, lambda w, s: any(m['tag'] == tag for m in w['msgs']), 420, {'tags': [tag]}, '等 %s' % tag)
    P.hands_off_phone = True
    mine = [m for m in (w or {}).get('msgs', []) if m['tag'] == tag]
    t_arr = await pg.evaluate(NOW_JS)
    R.note('[%s] 收到（資料）：%s' % (P.tag, J(mine)))
    if not R.check('[%s] 訊息到了（tag %s）' % (P.tag, tag), bool(mine), J(w)): return mine, None, ''
    R.check('[%s] 最後一則是要回的（ask 有兩個選項）' % P.tag, any(m.get('ask') and len(m['ask']['opts']) == 2 for m in mine), J([m.get('ask') for m in mine]))
    op = await wait_auto_phone(pg, P, t_arr, 25)
    R.check('[%s] 手機自己打開（D103：不用玩家去看）' % P.tag, bool(op), ('打開的紀錄：%s' % J(op)) if op else ('25 秒內沒開：%s' % J(await pg.evaluate(IDLE_JS))))
    P.hands_off_phone = False
    if op:
        s0 = await st(pg); row = next((t for t in s0['ths'] if t['th'] == th), None)
        R.check('[%s] 自己打開的列表上，她那一列標「待回覆」' % P.tag, bool(row) and '待回覆' in row['t'], J(s0['ths'][:5]))
        P.path.append('手機自己打開（%s）→ 點她那一段 → 照字回「%s」' % (op.get('by'), opt_text))
        P.phone_want = [th]; P.answer_others = True
        P.phone_ask = lambda t, o: (next((i for i, x in enumerate(o) if x == opt_text), None) if t == th else None)
        await drive(pg, cdp, P, lambda w, s: any(x[0] == th for x in P.answered) and not s['phone'], 120, {'tags': [tag]}, '回覆')
    else:
        P.path.append('手機沒自己打開：探針自己打開那一段看')
        ok2, body = await open_thread(pg, cdp, th); P.phone_texts.append([th, body]); s = await st(pg)
        R.note('[%s] 探針自己打開 %s：選項 %s；內容 %s' % (P.tag, th, J(s['asks']), body[-300:]))
        a = next((x for x in s['asks'] if x['t'] == opt_text), None)
        if a:
            await L.tap(pg, cdp, '#phoneBody [data-ask=%s]' % J(a['v'])); await pg.wait_for_timeout(1600); P.answered.append([th, opt_text])
        await close_phone(pg, cdp)
    body = next((b for t, b in reversed(P.phone_texts) if t == th), '')
    return mine, op, body


async def part_u34(pg, cdp):
    for case in ENVL('U34_CASES', 'there:0,missed:0,there:1,missed:1'):
        us2, k = case.split(':'); k = int(k)
        P = Ctx('U34_%s%d' % (us2, k)); await begin(pg, P)
        try:
            info = await us_load(pg, P, '2028-10-16', 20.83, 'us_apartment', True, extra={'US2': us2}, why='US2＝%s；10/16 20:50 公寓' % us2)
            R.check('[%s] 前置：交往中、US2＝%s' % (P.tag, us2), info['dating5'] and info['US2'] == us2, J(info))
            opt = X['grade_opts'][k]
            mine, op, body = await ask_flow(pg, cdp, P, 'us2_grade', 'p:' + S5, opt)
            if mine: R.check('[%s] 訊息逐字「%s」' % (P.tag, X['grade_msg']), mine[0]['text'] == X['grade_msg'], J(mine))
            if mine and mine[-1].get('ask'): R.check('[%s] 兩個選項逐字＝%s' % (P.tag, J(X['grade_opts'])), mine[-1]['ask']['opts'] == X['grade_opts'], J(mine[-1]['ask']))
            exp = X['grade_rep'][(us2, k)]
            await pg.wait_for_timeout(2000)
            w = await pg.evaluate(WATCH_JS, {'ths': ['p:' + S5]})
            rep = [m['text'] for m in w['msgs'] if m['from'] == S5 and m['text'] != X['grade_msg']]
            R.check('[%s] 回「%s」→ 她回「%s」' % (P.tag, opt, exp), any(x == ['p:' + S5, opt] for x in P.answered) and exp in rep, '回了 %s；她那一段：%s' % (J(P.answered), J(rep[-3:])))
            R.check('[%s] 畫面：她那一段看得到回覆' % P.tag, exp in body, body[-200:])
            await finish(pg, cdp, P)
        except Exception as e:
            R.check('[%s] 沒有中斷' % P.tag, False, repr(e)[:300])


async def part_u35(pg, cdp):
    for case in ENVL('U35_CASES', 'together,alone'):
        P = Ctx('U35_' + case); await begin(pg, P)
        try:
            together = case == 'together'
            info = await us_load(pg, P, '2028-11-03', 20.83, 'us_apartment', together, why='11/3 20:50 公寓；沒見過舊序章同學（MET_LONG 沒有）')
            R.check('[%s] 前置：沒見過舊序章同學' % P.tag, not info['MET_LONG'] and not info['metLong'], J(info))
            th = 'p:' + S5 if together else 'g:us_exchange'
            P.path.append('自然觸發：11/3 21:00 芝加哥邀約（%s）手機照時間收、回「去。」' % th)
            P.phone_want = [th]; P.phone_ask = lambda t, o: (next((i for i, x in enumerate(o) if x == '去。'), None) if t == th else None)
            w, s, ok = await drive(pg, cdp, P, lambda w, s: w['flags']['US_CHI'] == 'go' and not s['phone'], 420, {'tags': ['us_chi_ask'], 'fl': ['US_CHI']}, '11/3 芝加哥邀約')
            if not R.check('[%s] 回了「去。」（US_CHI＝go）' % P.tag, bool(w) and w['flags'].get('US_CHI') == 'go', J({'w': w, 'answered': P.answered})): continue
            await jump(pg, P, '2028-11-11', 6.5, '邀約回完，跳到出發那天早上（11/11 06:30）')
            P.path.append('出遊照 OUT：06:45 起問「出發：芝加哥的週末」→ 出發')
            P.phone_want = []
            w, s, ok = await drive(pg, cdp, P, lambda w, s: w['done']['ev_us_chicago'] and not s['dlg'] and not s['nb'], 600, {'ev': ['ev_us_chicago', 'ev_us_chicago2'], 'fl': ['MET_LONG', 'LONG_CHI']}, '11/11 芝加哥')
            E = await evs(pg); ss = says_of(E)
            R.check('[%s] ev_us_chicago 演了（出遊出發）' % P.tag, bool(w and w['done']['ev_us_chicago']), J(w))
            miss, bad, at = find_seq(ss, X['chi'])
            R.check('[%s] 巴士上三句照順序（旁白、舊序章同學、舊序章同學）' % P.tag, not miss and not bad, '缺：%s；說話人錯：%s；畫面上：%s' % (J(miss), J(bad), J([[role_of(x), x['t'][:30]] for x in ss[:6]])))
            old = [x['t'] for x in ss if any(o in x['t'] for o in X['chi_old'])]
            R.check('[%s] 沒有舊句（「坐在你們前面的」「我聽你們講話聽出來的」）' % P.tag, not old, J(old))
            R.check('[%s] 演完記 MET_LONG、LONG_CHI' % P.tag, bool(w and w['flags'].get('MET_LONG') and w['flags'].get('LONG_CHI')), J(w and w['flags']))
            await finish(pg, cdp, P)
        except Exception as e:
            R.check('[%s] 沒有中斷' % P.tag, False, repr(e)[:300])


async def part_u36(pg, cdp):
    for case in ENVL('U36_CASES', '0,1'):
        k = int(case)
        P = Ctx('U36_%d' % k); await begin(pg, P)
        try:
            info = await us_load(pg, P, '2028-12-06', 20.83, 'us_apartment', True, why='12/6 20:50 公寓')
            R.check('[%s] 前置：交往中、在美國' % P.tag, info['dating5'] and info['inUS'], J(info))
            opt = X['s1206_opts'][k]
            mine, op, body = await ask_flow(pg, cdp, P, 'usl_sis_1206', 'p:' + S5, opt)
            R.check('[%s] 兩則逐字＝%s' % (P.tag, J(X['s1206'])), [m['text'] for m in mine] == X['s1206'], J([m['text'] for m in mine]))
            if mine and mine[-1].get('ask'): R.check('[%s] 兩個選項逐字＝%s' % (P.tag, J(X['s1206_opts'])), mine[-1]['ask']['opts'] == X['s1206_opts'], J(mine[-1]['ask']))
            exp = X['s1206_rep'][k]
            await pg.wait_for_timeout(2000)
            w = await pg.evaluate(WATCH_JS, {'ths': ['p:' + S5]})
            rep = [m['text'] for m in w['msgs'] if m['from'] == S5 and m['text'] not in X['s1206']]
            R.check('[%s] 回「%s」→ 她回「%s」' % (P.tag, opt, exp), any(x == ['p:' + S5, opt] for x in P.answered) and exp in rep, '回了 %s；她那一段：%s' % (J(P.answered), J(rep[-3:])))
            R.check('[%s] 畫面：她那一段看得到回覆' % P.tag, exp in body, body[-200:])
            await finish(pg, cdp, P)
        except Exception as e:
            R.check('[%s] 沒有中斷' % P.tag, False, repr(e)[:300])


PART_FN = {'E11': part_e11, 'E12': part_e12, 'E13': part_e13, 'H21': part_h21, 'H22': part_h22, 'H23': part_h23,
           'U31': part_u31, 'U32': part_u32, 'U33': part_u33, 'U34': part_u34, 'U35': part_u35, 'U36': part_u36}
ERRS = []


async def main():
    real = os.popen('git -C "%s" rev-parse HEAD 2>/dev/null' % os.path.abspath(os.path.join(LWT, '..'))).read().strip()
    log('CC AA_814 斷點 12 項：worktree %s；SHA（env）%s；PARTS %s；Playwright（844×390 觸控）≠ iPhone' % (real or '?', SHA or '?', ','.join(PARTS)))
    if SHA and real and real != SHA: R.note('注意：worktree HEAD %s ≠ 環境變數 SHA %s' % (real, SHA))
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        global ERRS
        ERRS = errs
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); sys.exit(R.finish())
        await pg.evaluate(HOOK_JS)
        for part in PARTS:
            fn = PART_FN.get(part)
            if not fn: R.check('PARTS 有「%s」' % part, False, J(ALL_PARTS)); continue
            log('==== %s ====' % part); t0 = time.time()
            try:
                await fn(pg, cdp)
            except Exception as e:
                await R.shot(pg, '%s_exc' % part)
                R.check('[%s] 沒有中斷' % part, False, repr(e)[:400])
            log('==== %s 結束（%.0f 秒）====' % (part, time.time() - t0))
        await b.close()
    sys.exit(R.finish())

asyncio.run(main())
