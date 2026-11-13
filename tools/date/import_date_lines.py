"""校外約會預約系統的句子與交通偏好（DATE-S6；AA_128 4-1、4-3）→ src/data/date_lines.js。
**只匯入 docs/handoff/story_import_allow.json 逐檔列出、status approved 的版本**（不從分支最新讀）。句子一字不改，只從表格拆出來：
  - BB_128 3-7（BB 五位）、AA_127 第 8 節（以安、語彤）：答應、答應（和她交往中）、改時間、同一行程改到第三次、改交通；
  - BB_128 3-6「不分地點的句子」：取消、放鴿子兩欄（BB 五位）；AA_127 1-7、2-7：取消、30 天內第二次取消兩列（以安、語彤）；
  - date_prefs_bb.json＋date_prefs_aa.json 合併（why 欄不進遊戲）；
  - 各地點的台詞 date_system/lines/Dxx.json（白名單逐檔列的才讀；BB_128 2-9 的格式，原樣放進 DATE_LINES.loc；寫成旁白的開發說明改成註記，NOTE_NARR）；BB 五位 3-6 的出發、差不多了、一個都沒做就走、合照還不行。
格子裡「／」分開的是輪流用的幾句；同一句裡有好幾個「」＝連發幾則訊息（例：「好。」「我跟阿姨說那天不顧店。」）。「」以外的說明不進遊戲。
  - 疊在上面的改句：AA_373 6-1「`date_lines.js`」那一列（可昕不跟祐廷比輸贏，使用者 10-18）——「現在」欄的第 n 句換成「AA 定」欄的第 n 句；
    AA_359 5-2 的表（D26～D32 只能在第二天說、或時間不對的幾句，AA 改字）、5-3 的表（離開那一句在第二天白天說：天色、「下次早上來」的七句）和子晴那一句——那個地點、那個人的「現在」換成「改成」（引號裡的字；括號裡的說明不進遊戲）。
    AA_525（說了沒發生（二），白名單上的 commit）1-6、2-4：子晴、沛珊約會裡「下次我請／下次換我」的第一次回覆改成不欠——那個地點、那個人整句相同才換（FIX525）；
    D06、D15 子晴、D05 沛珊的 remember 誰聽得到、選了哪一個要記的旗標是條件式的：src/date3d.js 的 DATE.REMEMBER_IF、DATE.PICK_FLAG。
    5-3 的兩個到達句另一版（沛珊住臺南的 D28、D31＋D32 同一趟可昕到清境）是條件式的：src/date3d.js 的 DATE.ARRIVE_VAR。
    兩種都只換一字不差的 text（e75d1cce 起 6-1 兩欄都是整句，原本「……」開頭只換後面那一段的做法拿掉）；找不到的印出來、不換。每次都從白名單的原檔重算，重跑結果一樣。
    AA_524（說了沒發生（一））A8、A9、Z7 的七句：那個地點、那個人的台詞整句相同才換（每句剛好一處，不然停下來）。
    AA_598（學姊改稿①c，AA598-SIS-1C-1102）第 2 節逐句表的第 1～92 列＋第 8 節九份一句：那個地點學姊的台詞整句等於「原句」才換（已經是新句＝源稿改好了，跳過）。
    AA_694（DATE-ELLIPSIS-1105，使用者 11-05 選「整批改」）：拿掉沒必要的「……」（句首、。！？後、）後；規則在 tools/date/ellipsis694.py）。源稿 Dxx.json 企劃線 1b095a239 已經改好；
    上面疊的改句（AA_373／359／524／525／526／598／594／630）原句、改成都先照同一條規則換過再對（源稿已經拿掉了），寫檔前整份再套一次，
    AA_694 第 3 節 252 句逐列核對（規則算出來和表不一樣、表上的新句不在檔裡、三種還有＝停下來）。白名單沒有 AA_694＝不套。
    AA_758（X327 沛珊重寫第 7 批，白名單上的 commit）：沛珊不分地點的短句 17 列 old→new 疊在 BB_128 3-6、3-7 拆出來的 lines.classmate_peishan 上（每一種句數不變；換完要等於稿的 new）。
    PEISHAN-VOICE-1110（使用者 X327 沛珊重寫；AA_756 第 3 節，源稿 Dxx.json 企劃線 2883197b6 只動 classmate_peishan 的格子）：疊在上面的改句裡**沛珊的列**原句對不到＝跳過、不報錯
    （只對沛珊放寬——後來七個人都重寫了，下面逐人寫；重寫的人以外照舊停下來；跳過的列印出來：PS_SKIP）。2026-11-11 起學姊（heroine_05）也一樣（DLG-FULL-REVIEW-1110，使用者 X324：源稿 82c946ad7 學姊 33 個地點重寫；SIS_SKIP、SIS_DROP＝AA_359 5-2 的 D31／D32、5-3 的 D26／D32；
    AA_598 逐句表裡原句對不到的列跳過、沒重寫的格子照舊換）。AA_765（白名單上的 commit）：學姊不分地點的短句四列 old→new，做法同 AA_758。AA 指明新稿不用再套的四列不套（PS_DROP：AA_525 2-4 P-6 的 D08／D15／D18、AA_359 5-3 的 D31——新稿直接寫好了）。
    2026-11-11 起語彤（heroine_03）也一樣（DLG-FULL-REVIEW-1110，使用者 X324：源稿 0a2136911 語彤 33 個地點重寫；同一版學姊 34 格把遊戲裡疊著的修正寫回源稿）：
    **AA_630 第 2 節（她的約會台詞 D-001 起）整節對她跳過**——AA 把她的源稿先對齊成遊戲當時的字（＝AA_630 的「改成」）再重寫，那一節的原句都找不到；跳過的列逐列印出來（YT_SKIP：已經是改成的字／那一格重寫了）。
    原句還在、而且和改成不一樣＝源稿沒對齊，停下來（不猜）。AA_630 第 10 節第 2 點（D14 夕陽以前收尾，aa630.d14_before_sunset）、AA_127 預約句那幾列（patch_text）照舊。
    AA_694 第 3 節裡她重寫掉的句子（上一版 82c946ad7 她那一格有、新稿沒有）跟著跳過。AA_767（白名單上的 commit）：語彤不分地點的短句六列照 path 換（lines.heroine_03.…；寫檔前最後一步，AA_630 預約句、AA_694 都套完以後）。
    2026-11-11 起可昕（kexin）也一樣（DLG-FULL-REVIEW-1110，使用者 X324：源稿 f9c1a2b80 可昕 33 個地點重寫；和 0a2136911 比只動她的格子）：疊在上面的改句裡她的列（AA_373 6-1 那兩句、AA_359 5-2 的 D28）
    原句對不到＝跳過、印出來（KX_SKIP）；AA_694 第 3 節裡她重寫掉的句子（上一版 0a2136911 她那一格有、新稿沒有）跟著跳過。AA_769（白名單上的 commit）：可昕不分地點的短句七列照 path 換（lines.kexin.…，和 AA_767 同一步）。
    2026-11-11 起芷若（heroine_02）也一樣（DLG-FULL-REVIEW-1110，使用者 X324：源稿 a29a8aba0 芷若 33 個地點重寫；和 f9c1a2b80 比只動她的格子，另外語彤 D15 一句、可昕 D09／D17／D33 三句）：
    疊在上面的改句裡她的列（AA_359 5-3 的 D26、D27、D29，AA_524 Z7 的 D18 兩句、D10 一句）原句對不到＝跳過、逐列印出來（ZR_SKIP：已經是改成的字／那一格新稿重寫了）；
    **原句還在、而且和改成不一樣＝源稿沒對齊：不換、全部收齊以後停下來列出來（ZR_STALE；不猜）**。AA_694 第 3 節裡她重寫掉的句子（上一版 f9c1a2b80 她那一格有、新稿沒有）跟著跳過。
    AA_773（白名單上的 commit，企劃線 e8a33995c）：芷若不分地點的短句九列照 path 換（lines.heroine_02.…，和 AA_767、AA_769 同一步）；另外兩列是 src/date3d.js 手寫的（S.MORNING_OWN、S.T7A_YES 她那一格）。
    她的心願事件 AA_774 在 tools/date/import_wish.py（1j）。
    2026-11-11 起子晴（heroine_04）也一樣（DLG-FULL-REVIEW-1110，使用者 X324：源稿 02078efc0 子晴 33 個地點重寫；和 a29a8aba0 比只動她的格子，另外芷若 D10 小吃攤一句）：
    疊在上面的改句裡她的列（AA_525 1-6 的 D10、D12、D13、D30、D31，AA_526 第 2 節 D15，AA_359 5-3 條列的 D32 那一句）原句對不到＝跳過、逐列印出來
    （ZQ_SKIP：已經是改成的字／那一格新稿重寫成哪一句——拿上一版 ZQ_PREV 找原句在哪一格、看新稿同一格）；**原句還在、而且和改成不一樣＝源稿沒對齊：不換、全部收齊以後停下來列出來（ZQ_STALE；不猜）**。
    AA_694 第 3 節裡她重寫掉的句子（上一版 a29a8aba0 她那一格有、新稿沒有）跟著跳過。
    AA_775（白名單上的 commit，企劃線 02078efc0）：子晴不分地點的短句五列照 path 換（lines.heroine_04.…，和 AA_767、AA_769、AA_773 同一步）；另外四列是 src/date3d.js 手寫的
    （S.MORNING 她那一格、S.REMEMBER_IF 她 D06／D15 沒旗標的備用句兩列、D26 臺中過夜晚上那一句＝S.NIGHT_HOME 加一列）。她的心願事件 AA_776 在 tools/date/import_wish.py（1k）。
    2026-11-11 起以安（heroine_01）也一樣（DLG-FULL-REVIEW-1110，使用者 X324：源稿 bd1ce5be0 以安 33 個地點重寫；和 02078efc0 比只動她的格子，另外子晴再改 31 格）：
    疊在上面的改句裡她的列（AA_359 5-2 的 D26、D28、D31，5-3 的 D32；AA_524 A8 的 D09、A9 的 D14、D16 兩句）原句對不到＝跳過、逐列印出來
    （AN_SKIP：已經是改成的字／那一格新稿重寫成哪一句——拿上一版 AN_PREV 找原句在哪一格、看新稿同一格）；**原句還在、而且和改成不一樣＝源稿沒對齊：不換、全部收齊以後停下來列出來（AN_STALE；不猜）**。
    **AA_594 第 2-14 節她各地點的列（位置欄 loc.Dxx.lines.heroine_01.…／loc.Dxx.dislikeLine.heroine_01.…，288 列）照 path 對**：那一格已經是「改成」＝源稿寫回了、跳過；兩個都不是＝那一格新稿重寫了、跳過（都逐列印出來）；
    還是「原句」＝源稿沒對齊，同上停下來。不分地點的那幾列（lines.heroine_01.…，來源 AA_127）照舊換。AA_694 第 3 節裡她重寫掉的句子（上一版 02078efc0 她那一格有、新稿沒有的，和 AA_594 改成的字）跟著跳過。
    AA_777（白名單上的 commit，企劃線 1f88da7cc）：以安不分地點的短句四列照 path 換（lines.heroine_01.…，和 AA_767、AA_769、AA_773、AA_775 同一步）；另外五列是 src/date3d.js 手寫的
    （S.MORNING、S.MORNING_OWN、S.HOME_NO、S.T7A_YES 她那一格、D26 臺中過夜晚上那一句）。她的心願事件 AA_778 在 tools/date/import_wish.py（1l）。
    AA_780（白名單上的 commit，企劃線 248c8e390；以安匯入以後 AA 的後續改稿）：不分地點的短句九列裡 date_lines.js 的五列照 path 換——以安 flaked 兩則、子晴 flaked[0]（AA_775 那一列）、
    語彤 flaked[0][0]（AA_767）、芷若 flaked[0][1]（AA_773）；和 AA_767～AA_777 同一步、排在最後（old＝那幾層疊完以後的字，對不上就停下來）。另外四列是 src/date3d.js 手寫的
    （S.EXTRA_LINES.heroine_01 的 enough 兩句、leaveEarly、noPair）。同一版源稿 248c8e390 以安另外改 14 格（改稿紀錄 an_Dxx.json 的 _meta.fix_lawww_an_1111），照源稿匯。
    AA_812（白名單上的 commit，企劃線 f1fab0ec6；懸著的「下次我請」七格）：AA 改了改稿紀錄 date_rewrite/ 五份（白名單逐檔列）、源稿 Dxx.json 沒有重新 apply——
    拿紀錄在源稿那一版和白名單這一版逐格比，改了的格照格號換在遊戲那一格；稿的 path_rows 兩列照 path 換。寫檔前最後一步、排在 AA_780 後面（apply812；old 對不上就停下來）。
    同一份稿的 SHE_PAYS_add、SPLIT（她請客、平分）在 tools/date/import_she_pays.py。
    換源稿 SHA 重跑：tools/date/bump_lines_sha.py（白名單 33 筆）→ tests/date_src_sha.js 的 ALLOW_SHA → 這支；這支裡的 *_PREV 是各輪「重寫以前的那一版」，不用跟著換。
用法：python3 tools/date/import_date_lines.py [--check 企劃線ref] [--out 另存的檔（不寫 src/data/date_lines.js）]"""
import json, os, re, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'story'))
import import_guard as G
ALLOW = G.load(ROOT)
SP = 'docs/story_planning/'
FILES = {'bb': SP + 'BB_128_校外單獨約會_心願地點與淡水示範規格.md', 'aa': SP + 'AA_127_以安語彤_心願約會與邀約變化.md',
         'pbb': SP + 'date_system/date_prefs_bb.json', 'paa': SP + 'date_system/date_prefs_aa.json',
         'fix373': SP + 'AA_373_法律系大一下_時間人在哪與作廢設定_修正稿.md',   # 6-1 date_lines.js 那一列（AA373-Y1S2-FIX-1021）
         'fix359': SP + 'AA_359_兩天一夜的約會_住宿那一段.md',   # 5-2 D26～D32 時間不對的九句、5-3 離開句七句＋子晴一句（DATE-OVERNIGHT-1021）
         'fix524': SP + 'AA_524_說了沒發生_以安芷若語彤.md'}   # 說了沒發生（一）：A8、A9、Z7 的七句（HEROINE-LIFE-1028）
APPROVED = G.approved_files(ALLOW, SP)
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ellipsis694 as E694
A694 = G.approved_files(ALLOW, SP + 'AA_694_')
N = E694.strip if A694 else (lambda s: s)   # AA_694：疊上去的改句先照同一條規則換（源稿已經拿掉了）


def deepN(x):
    if isinstance(x, str): return N(x)
    if isinstance(x, list): return [deepN(v) for v in x]
    if isinstance(x, dict): return {k: deepN(v) for k, v in x.items()}
    return x


for p in FILES.values():
    ok, why = G.allowed(p, APPROVED.get(p, ''), ALLOW)
    if not ok:
        sys.exit('拒絕匯入：' + why)
if '--check' in sys.argv:
    ref = sys.argv[sys.argv.index('--check') + 1]
    for p in FILES.values():
        same = subprocess.run(['git', '-C', ROOT, 'diff', '--quiet', APPROVED[p], ref, '--', p]).returncode == 0
        print(('一樣：' if same else f'分支上的版本和白名單（{APPROVED[p]}）不同、不會匯入：') + p)
    sys.exit(0)
show = lambda p: G.read_fix(subprocess.check_output(['git', '-C', ROOT, 'show', f'{APPROVED[p]}:{p}'], text=True))  # AA_380：讀稿先把「小語」換成 Alison（import_guard.alison）
if A694:   # AA_694：讀稿時照字換的那幾份（import_guard.ndl542 的 *_fix.json，照順序）原句帶「……」的，Dxx.json 源稿已經拿掉了——原句對不到就用同一條規則換過的那一組（只給 Dxx.json）
    G.ndl542('');   # 載入 G._NDL
    def show(p, sha=None):   # sha：只給「語彤重寫掉了哪些句子」讀上一版用（YT_PREV；不匯入）
        s = G.alison(subprocess.check_output(['git', '-C', ROOT, 'show', f'{sha or APPROVED[p]}:{p}'], text=True, stderr=subprocess.DEVNULL if sha else None))   # alison 換過再換一次不會變
        if not re.search(r'/date_system/lines/D\d\d\.json$', p):
            return G.read_fix(s)
        s = G.aa655(G.world(s))   # ＝G.read_fix 的前三步（alison 上面做了），第四步 ndl542 在下面照順序做
        for x, y in G._NDL:
            if x in s: s = s.replace(x, y)
            elif N(x) != x and N(x) and N(x) in s: s = s.replace(N(x), N(y))
        return json.dumps(deepN(json.loads(s)), ensure_ascii=False)   # 照字換進來的新句（帶「……」的）也照同一條規則
PS = 'classmate_peishan'
SIS = 'heroine_05'   # 學姊（DLG-FULL-REVIEW-1110，使用者 X324：校外約會台詞重寫，源稿 Dxx.json 企劃線 82c946ad7——同一批檔沛珊多改三格、學姊 33 個地點重寫）：和沛珊同一個做法
PRE756 = ('1b095a239', '9aa8ec40c', 'a5b936a69')   # 沛珊重寫（AA_756）以前的 Dxx.json 版本：白名單退回這幾版＝照舊套、照舊報錯
PRE_SIS = PRE756 + ('2883197b6',)   # 學姊重寫以前的版本（2883197b6＝只有沛珊重寫的那一版）
PS_DROP = {('AA_525 2-4 P-6', 'D08'), ('AA_525 2-4 P-6', 'D15'), ('AA_525 2-4 P-6', 'D18'), ('AA_359 5-3', 'D31')}   # AA 指明不再套（改稿紀錄 date_rewrite/peishan_D15／D18／D31.json 的 _meta、AA_756 第 3 節）
SIS_DROP = {('AA_359 5-2', 'D31'), ('AA_359 5-2', 'D32'), ('AA_359 5-3', 'D26'), ('AA_359 5-3', 'D32')}   # AA 指明不再套（date_rewrite/sis_D26／D31／D32.json 的 _meta.for_LAWWW：新稿直接寫好了）
YT = 'heroine_03'   # 語彤（DLG-FULL-REVIEW-1110，使用者 X324：校外約會台詞重寫，源稿 Dxx.json 企劃線 0a2136911）：和沛珊、學姊同一個做法，另外 AA_630 第 2 節整節跳過
YT_PREV = '82c946ad7'   # 語彤重寫以前的那一版（只拿來認「她重寫掉了哪些句子」：AA_694 第 3 節逐列核對用；不匯入）
PRE_YT = PRE_SIS + (YT_PREV,)
YT_SKIP = []; YT_GONE = set()   # 語彤的（同下）
KX = 'kexin'   # 可昕（DLG-FULL-REVIEW-1110，使用者 X324：校外約會台詞重寫，源稿 Dxx.json 企劃線 f9c1a2b80）：和沛珊、學姊、語彤同一個做法
KX_PREV = '0a2136911'   # 可昕重寫以前的那一版（只拿來認「她重寫掉了哪些句子」；不匯入）
PRE_KX = PRE_YT + (KX_PREV,)
KX_SKIP = []; KX_GONE = set()
ZR = 'heroine_02'   # 芷若（DLG-FULL-REVIEW-1110，使用者 X324：校外約會台詞重寫，源稿 Dxx.json 企劃線 a29a8aba0）：和沛珊、學姊、語彤、可昕同一個做法；另外「原句還在」＝源稿沒對齊，停下來（ZR_STALE）
ZR_PREV = 'f9c1a2b80'   # 芷若重寫以前的那一版（只拿來認「她重寫掉了哪些句子」；不匯入。AA 再給新 SHA 時這個不用換）
PRE_ZR = PRE_KX + (ZR_PREV,)
ZR_SKIP = []; ZR_GONE = set()
ZR_STALE = []   # 芷若的列原句還在源稿裡（和改成不一樣）：(哪一層, 地點, 原句, 改成)——不換，最後一起列出來停下
ZQ = 'heroine_04'   # 子晴（DLG-FULL-REVIEW-1110，使用者 X324：校外約會台詞重寫，源稿 Dxx.json 企劃線 02078efc0）：和芷若同一個做法（原句還在＝ZQ_STALE 停下來）
ZQ_PREV = 'a29a8aba0'   # 子晴重寫以前的那一版（＝芷若重寫的那一版；只拿來認「她重寫掉了哪些句子」「原句原本在哪一格」；不匯入。AA 再給新 SHA 時這個不用換）
PRE_ZQ = PRE_ZR + (ZQ_PREV,)
ZQ_SKIP = []; ZQ_GONE = set(); ZQ_STALE = []
ZQ_OLD = {}   # 地點 → 上一版（ZQ_PREV）她那一欄的台詞（讀得到才有）
AN = 'heroine_01'   # 以安（DLG-FULL-REVIEW-1110，使用者 X324：校外約會台詞重寫，源稿 Dxx.json 企劃線 bd1ce5be0）：和芷若、子晴同一個做法（原句還在＝AN_STALE 停下來）；另外 AA_594 第 2-14 節她各地點的列照 path 對（見下面 AA_594 那一段）
AN_PREV = '02078efc0'   # 以安重寫以前的那一版（＝子晴重寫的那一版；只拿來認「她重寫掉了哪些句子」「原句原本在哪一格」；不匯入。AA 再給新 SHA 時這個不用換）
PRE_AN = PRE_ZQ + (AN_PREV,)
AN_SKIP = []; AN_GONE = set(); AN_STALE = []
AN_OLD = {}   # 地點 → 上一版（AN_PREV）她那一欄的台詞（讀得到才有）
PS_SKIP = []   # 沛珊跳過的列：(哪一層, 地點, 原句, 為什麼)
PS_GONE = set()   # 沛珊跳過的列的原句、改成：AA_694 第 3 節逐列核對時，這些句子不在檔裡＝源稿重寫了，不算漏換
SIS_SKIP = []; SIS_GONE = set()   # 學姊的（同上）


def ps756(loc, who=PS):
    """這個地點的源稿是不是那個人（沛珊／學姊）重寫以後的版本"""
    sha = str(APPROVED.get(SP + 'date_system/lines/' + loc + '.json') or '')
    return bool(sha) and not any(sha.startswith(x) or x.startswith(sha) for x in (PRE_AN if who == AN else PRE_ZQ if who == ZQ else PRE_ZR if who == ZR else PRE_KX if who == KX else PRE_YT if who == YT else PRE_SIS if who == SIS else PRE756))


def ps_skip(layer, loc, who, old, drop=False, new=None):
    """沛珊、學姊的列：AA 指明不再套（drop）或原句對不到 → 記下來、回 True（呼叫的地方跳過）；別人、或源稿還是重寫以前的版本＝False（照舊）"""
    if who not in (PS, SIS, YT, KX, ZR, ZQ, AN) or not ps756(loc, who):
        return False
    if drop and (layer, loc) not in (SIS_DROP if who == SIS else set() if who in (YT, KX, ZR, ZQ, AN) else PS_DROP):
        return False
    why = 'AA 指明新稿不用再套' if drop else '原句對不到（源稿重寫了）'
    if who == ZR and new and any(o['text'] == new for o in texts(((LOC.get(loc) or {}).get('lines') or {}).get(ZR))):
        why = '已經是改成的字（源稿寫回了）'
    if who in (ZQ, AN):   # 子晴、以安：原句在上一版的哪一格 → 新稿同一格現在是什麼（一格一格說清楚；上一版讀不到＝只說對不到）
        now = zq_cell(loc, old, who)
        if now and new and all(x == new for x in now): why = '已經是改成的字（源稿寫回了）'
        elif now: why = '那一格新稿重寫成「' + '」「'.join(now) + '」'
    (AN_SKIP if who == AN else ZQ_SKIP if who == ZQ else ZR_SKIP if who == ZR else KX_SKIP if who == KX else YT_SKIP if who == YT else SIS_SKIP if who == SIS else PS_SKIP).append((layer, loc, old, why))
    (AN_GONE if who == AN else ZQ_GONE if who == ZQ else ZR_GONE if who == ZR else KX_GONE if who == KX else YT_GONE if who == YT else SIS_GONE if who == SIS else PS_GONE).update(x for x in (old, new) if x)
    return True


def zr_stale(layer, loc, who, old, new):
    """芷若、子晴、以安的列、源稿是她重寫以後的版本、原句還在而且和改成不一樣 → 記下來、回 True（呼叫的地方不換）；最後 ZR_STALE／ZQ_STALE／AN_STALE 有東西＝停下來全部列出來"""
    if who not in (ZR, ZQ, AN) or not ps756(loc, who) or old == new:
        return False
    if not any(o['text'] == old for o in texts(((LOC.get(loc) or {}).get('lines') or {}).get(who))):
        return False
    (AN_STALE if who == AN else ZQ_STALE if who == ZQ else ZR_STALE).append((layer, loc, old, new))
    return True


def zq_cell(loc, old, who=None):
    """子晴（who＝AN 時是以安）：原句在上一版（ZQ_PREV／AN_PREV）她那個地點的哪幾格 → 新稿同一格現在的字（上一版讀不到、或上一版也沒有這一句＝[]）"""
    who = who or ZQ
    def flat(x, p, o):
        if isinstance(x, list): [flat(v, f'{p}/{i}', o) for i, v in enumerate(x)]
        elif isinstance(x, dict): [flat(v, f'{p}/{k}', o) for k, v in x.items()]
        else: o[p] = x
        return o
    a = flat((AN_OLD if who == AN else ZQ_OLD).get(loc) or {}, '', {}); b = flat(((LOC.get(loc) or {}).get('lines') or {}).get(who) or {}, '', {})
    return [b[p] for p, v in a.items() if v == old and p.endswith('/text') and isinstance(b.get(p), str)]


NAME = {'芷若': 'heroine_02', '子晴': 'heroine_04', '學姊': 'heroine_05', '沛珊': 'classmate_peishan', '可昕': 'kexin', '以安': 'heroine_01', '語彤': 'heroine_03'}


def section(md, head):
    """從 head 那一行到下一個同級以上的標題"""
    i = md.index(head); lv = len(head) - len(head.lstrip('#'))
    m = re.search(r'\n#{1,%d} ' % lv, md[i + len(head):])
    return md[i:i + len(head) + (m.start() if m else len(md))]


def rows(sec):
    out = []
    for ln in sec.splitlines():
        if not ln.startswith('|') or set(ln.replace('|', '').strip()) <= set('-: '):
            continue
        out.append([c.strip() for c in ln.strip().strip('|').split('|')])
    return out


def alts(cell):
    """「／」分開的幾句（只在「」外面的／分）；每一句＝裡面所有「」的內容（一個以上＝連發）"""
    parts, depth, cur = [], 0, ''
    for ch in cell:
        if ch == '「': depth += 1
        elif ch == '」': depth -= 1
        if ch == '／' and depth == 0:
            parts.append(cur); cur = ''
        else:
            cur += ch
    parts.append(cur)
    res = []
    for p in parts:
        q = re.findall(r'「((?:[^「」]|「[^「」]*」)*)」', p)
        if q:
            res.append(q if len(q) > 1 else q[0])
    return res


L = {}
KEYS = ['accept', 'acceptDating', 'move', 'move3', 'transport']
for src, head in [('bb', '### 3-7. '), ('aa', '## 8. 預約系統的句子')]:
    md = show(FILES[src]); sec = section(md, next(l for l in md.splitlines() if l.startswith(head)))
    for r in rows(sec)[1:]:
        who = NAME.get(r[0])
        if not who:
            continue
        for k, c in zip(KEYS, r[1:6]):
            L.setdefault(who, {})[k] = alts(c)
# BB 五位：3-6 不分地點的句子，取消（第 4 欄）、放鴿子（第 5 欄）
md = show(FILES['bb']); sec = section(md, next(l for l in md.splitlines() if l.startswith('### 3-6. ')))
for r in rows(sec):
    who = NAME.get(r[0])
    if who and len(r) >= 7:
        L.setdefault(who, {})['cancel'] = alts(r[3]); L[who]['flaked'] = alts(r[4])
        for k, c in (('depart', r[1]), ('enough', r[2]), ('leaveEarly', r[5]), ('noPair', r[6])):   # 出發訊息、差不多了、一個都沒做就走、合照還不行（BB 五位；以安、語彤還沒有＝不說）
            a = alts(c)
            if a: L[who][k] = a
# 以安、語彤：1-7、2-7 的取消、30 天內第二次取消
md = show(FILES['aa'])
for head, who in [('### 1-7. ', 'heroine_01'), ('### 2-7. ', 'heroine_03')]:
    sec = section(md, next(l for l in md.splitlines() if l.startswith(head)))
    for r in rows(sec):
        if r[0].startswith('取消'): L.setdefault(who, {})['cancel'] = alts(r[1])
        elif r[0].startswith('30 天內第二次取消'): L.setdefault(who, {})['flaked'] = alts(r[1])
prefs = {}
for k in ('pbb', 'paa'):
    for who, m in json.loads(show(FILES[k])).items():
        if who.startswith('_'):
            continue
        prefs[who] = {loc: {'transport': v['transport']} for loc, v in m.items()}
def texts(x):
    """地點台詞裡每一個 {text} 的物件（who／narr 都算；選項的 t 不算）"""
    if isinstance(x, dict):
        if isinstance(x.get('text'), str):
            yield x
        for v in x.values():
            yield from texts(v)
    elif isinstance(x, list):
        for v in x:
            yield from texts(v)


# 各地點的台詞（lines/Dxx.json；白名單逐檔列的才讀）：互動點名稱、她喜不喜歡、不太喜歡時的一句、抵達／互動點／收尾的句子
LOC = {}
import aa630   # AA_630 第 2 節（語彤 D01～D32，D13 不做）：照 JSON 路徑換在源稿上；AA_127 的預約句在寫檔前 patch_text
R630 = aa630.load(ROOT, ALLOW, G); LOG630 = []
if R630 and A694:   # AA_694：AA_630 第 2 節（Dxx.json 的列）原句、改成照同一條規則換；物件、陣列（JSON 字）逐句換
    for r in R630['rows']:
        if '/date_system/lines/' not in r['file']: continue
        for k in ('orig', 'new'):
            v = r[k]
            if v[:1] in '{[':
                try: r[k] = json.dumps(deepN(json.loads(v)), ensure_ascii=False, separators=(',', ':')); continue
                except Exception: pass
            r[k] = N(v)
for p in sorted(APPROVED):
    m = re.match(r'docs/story_planning/date_system/lines/(D\d\d)\.json$', p)
    if not m:
        continue
    ok, why = G.allowed(p, APPROVED[p], ALLOW)
    if not ok:
        sys.exit('拒絕匯入：' + why)
    d = json.loads(show(p))
    if R630 and ps756(m.group(1), YT):   # X324 語彤重寫：AA_630 第 2 節這個地點的列整個跳過（源稿已經對齊成遊戲當時的字再重寫）；逐列記下來是哪一種
        n630 = 0
        for r in R630['rows']:
            if r['file'] != p or r['at'].isdigit(): continue
            if not r['at'].startswith('lines.' + YT + '.'):
                sys.exit(f'AA_630 {r["no"]}：{p} {r["at"]} 不是語彤的格子，不能跟著跳過')
            cur, has = aa630._get(d, aa630._toks(r['at'])); nv = aa630._newval(r)
            if has and cur == nv: why = '已經是改成的字（源稿對齊過了）'
            elif has and aa630._same(cur, r['orig']): sys.exit(f'AA_630 {r["no"]}：{p} {r["at"]} 還是原句 {r["orig"]!r}（語彤重寫的源稿應該已經對齊成改成的字；要問 AA）')
            else: why = '那一格新稿重寫了' if has else '那一格新稿沒有了'
            YT_SKIP.append(('AA_630 ' + r['no'], m.group(1), r['orig'] if isinstance(r['orig'], str) else json.dumps(r['orig'], ensure_ascii=False), why)); n630 += 1
            if why != '已經是改成的字（源稿對齊過了）': YT_GONE.update(x for x in (r['orig'], r['new']) if isinstance(x, str) and x)
        LOG630.append(f'{p}：0 列（語彤重寫，第 2 節 {n630} 列跳過）')
        try:   # 她重寫掉了哪些句子：上一版（YT_PREV）她那一格的字，新稿那一格不一樣了的（AA_694 第 3 節逐列核對時不算漏換；讀不到上一版＝不放寬，照舊停下來）
            if not A694: raise subprocess.CalledProcessError(1, 'show')
            d0 = json.loads(show(p, YT_PREV)); aa630.apply_json(R630, p, d0)
            now3 = {o['text'] for o in texts((d.get('lines') or {}).get(YT))} | set(((d.get('dislikeLine') or {}).get(YT) or {}).values())
            YT_GONE.update(t for t in ({o['text'] for o in texts((d0.get('lines') or {}).get(YT))} | set(((d0.get('dislikeLine') or {}).get(YT) or {}).values())) if t not in now3)
        except subprocess.CalledProcessError:
            pass
    else:
        aa630.apply_json(R630, p, d, LOG630)
    if ps756(m.group(1), KX):   # X324 可昕重寫：她重寫掉了哪些句子＝上一版（KX_PREV）她那一格有、新稿沒有的（AA_694 第 3 節逐列核對、AA_373 6-1 那兩句用；讀不到上一版＝不放寬，照舊停下來）
        try:
            if not A694: raise subprocess.CalledProcessError(1, 'show')
            d0 = json.loads(show(p, KX_PREV))
            nowk = {o['text'] for o in texts((d.get('lines') or {}).get(KX))} | set(((d.get('dislikeLine') or {}).get(KX) or {}).values())
            KX_GONE.update(t for t in ({o['text'] for o in texts((d0.get('lines') or {}).get(KX))} | set(((d0.get('dislikeLine') or {}).get(KX) or {}).values())) if t not in nowk)
        except subprocess.CalledProcessError:
            pass
    if ps756(m.group(1), ZR):   # X324 芷若重寫：同上（ZR_PREV）
        try:
            if not A694: raise subprocess.CalledProcessError(1, 'show')
            d0 = json.loads(show(p, ZR_PREV))
            nowz = {o['text'] for o in texts((d.get('lines') or {}).get(ZR))} | set(((d.get('dislikeLine') or {}).get(ZR) or {}).values())
            ZR_GONE.update(t for t in ({o['text'] for o in texts((d0.get('lines') or {}).get(ZR))} | set(((d0.get('dislikeLine') or {}).get(ZR) or {}).values())) if t not in nowz)
        except subprocess.CalledProcessError:
            pass
    if ps756(m.group(1), ZQ):   # X324 子晴重寫：同上（ZQ_PREV）；另外留著上一版她那一欄（zq_cell：原句原本在哪一格）
        try:
            if not A694: raise subprocess.CalledProcessError(1, 'show')
            d0 = json.loads(show(p, ZQ_PREV)); ZQ_OLD[m.group(1)] = (d0.get('lines') or {}).get(ZQ) or {}
            nowq = {o['text'] for o in texts((d.get('lines') or {}).get(ZQ))} | set(((d.get('dislikeLine') or {}).get(ZQ) or {}).values())
            ZQ_GONE.update(t for t in ({o['text'] for o in texts((d0.get('lines') or {}).get(ZQ))} | set(((d0.get('dislikeLine') or {}).get(ZQ) or {}).values())) if t not in nowq)
        except subprocess.CalledProcessError:
            pass
    if ps756(m.group(1), AN):   # X324 以安重寫：同上（AN_PREV）；留著上一版她那一欄（zq_cell：原句原本在哪一格）
        try:
            if not A694: raise subprocess.CalledProcessError(1, 'show')
            d0 = json.loads(show(p, AN_PREV)); AN_OLD[m.group(1)] = (d0.get('lines') or {}).get(AN) or {}
            nowa = {o['text'] for o in texts((d.get('lines') or {}).get(AN))} | set(((d.get('dislikeLine') or {}).get(AN) or {}).values())
            AN_GONE.update(t for t in ({o['text'] for o in texts((d0.get('lines') or {}).get(AN))} | set(((d0.get('dislikeLine') or {}).get(AN) or {}).values())) if t not in nowa)
        except subprocess.CalledProcessError:
            pass
    LOC[m.group(1)] = {k: d[k] for k in ('points', 'likes', 'dislikeLine', 'lines') if k in d}
    FILES['loc_' + m.group(1)] = p
# AA_373 6-1「date_lines.js」那一列：疊在地點台詞上的改句（現在 → AA 定，一句對一句）
md = show(FILES['fix373']); head = next((l for l in md.splitlines() if l.startswith('### 6-1. ')), None)
if not head:
    sys.exit('拆不出來：' + FILES['fix373'] + '@' + APPROVED[FILES['fix373']] + ' 沒有 6-1 節')
FIX = []
for r in rows(section(md, head)):
    if len(r) >= 3 and 'date_lines.js' in r[0]:
        old, new = re.findall(r'「([^「」]*)」', r[1]), re.findall(r'「([^「」]*)」', r[2])
        if len(old) != len(new) or not old:
            sys.exit('拆不出來（6-1 date_lines.js 那一列「現在」和「AA 定」句數不同）：' + json.dumps([old, new], ensure_ascii=False))
        FIX += list(zip(old, new))
if not FIX:
    sys.exit('拆不出來：AA_373 6-1 沒有 date_lines.js 那一列')
FIX = [(N(o), N(n)) for o, n in FIX]


FIXED = []
for old, new in FIX:
    hit = [o for o in texts(LOC) if o['text'] == old]
    for o in hit:
        o['text'] = new
    FIXED.append((old, new, len(hit)))
    if not hit and (old in KX_GONE or new in KX_GONE):   # X324 可昕重寫：AA_373 6-1 這一列是她的句子（上一版她那一格是原句），新稿那一格重寫了、或直接寫了改成的字＝跳過
        KX_SKIP.append(('AA_373 6-1', '', old, '已經是改成的字（新稿直接寫了）' if any(o['text'] == new for o in texts(LOC)) else '原句對不到（源稿重寫了）')); KX_GONE.update((old, new))
    elif not hit and (old in ZR_GONE or new in ZR_GONE):   # X324 芷若重寫：同上
        ZR_SKIP.append(('AA_373 6-1', '', old, '已經是改成的字（新稿直接寫了）' if any(o['text'] == new for o in texts(LOC)) else '原句對不到（源稿重寫了）')); ZR_GONE.update((old, new))
    elif not hit and (old in ZQ_GONE or new in ZQ_GONE):   # X324 子晴重寫：同上
        ZQ_SKIP.append(('AA_373 6-1', '', old, '已經是改成的字（新稿直接寫了）' if any(o['text'] == new for o in texts(LOC)) else '原句對不到（源稿重寫了）')); ZQ_GONE.update((old, new))
    elif not hit:
        print('AA_373 6-1：找不到「' + old + '」，沒換')
# AA_359 5-2：D26～D32 時間不對的句子；5-3（fb5156ab）：離開那一句在第二天白天說，有天色、「下次早上來」的七句（| 地點 | 誰、哪一句 | 現在 | 改成 |）——只在那個地點、那個人的台詞裡換。
# 格子裡括號外的說明（例：（下一句「這是我高中最喜歡的一件事。」不改））不算：先拿掉引號外面的全形括號那一段，再取引號裡的字
md = show(FILES['fix359'])
def outside_paren(cell):
    out, depth, q = [], 0, 0
    for ch in cell:
        if ch == '「': q += 1
        elif ch == '」': q = max(0, q - 1)
        if q == 0 and ch == '（': depth += 1; continue
        if q == 0 and ch == '）' and depth: depth -= 1; continue
        if depth == 0: out.append(ch)
    return ''.join(out)
FIXED359 = []
def fix_table(tag, want):
    head = next((l for l in md.splitlines() if l.startswith('### ' + tag + '. ')), None)
    if not head:
        sys.exit('拆不出來：' + FILES['fix359'] + '@' + APPROVED[FILES['fix359']] + ' 沒有 ' + tag + ' 節')
    n0 = len(FIXED359)
    for r in rows(section(md, head)):
        if len(r) < 4 or not re.match(r'D\d\d$', r[0]):
            continue
        who = next((v for k, v in NAME.items() if r[1].startswith(k)), None)
        old, new = re.findall(r'「([^「」]*)」', outside_paren(r[2])), re.findall(r'「([^「」]*)」', outside_paren(r[3]))
        if not who or len(old) != 1 or len(new) != 1:
            sys.exit('拆不出來（' + tag + ' 那一列）：' + json.dumps(r, ensure_ascii=False))
        old, new = [N(old[0])], [N(new[0])]
        if ps_skip('AA_359 ' + tag, r[0], who, old[0], drop=True, new=new[0]):   # PEISHAN-VOICE-1110：D31 沛珊 closing（交往中）新稿直接寫好了
            FIXED359.append((tag + ' ' + r[0], who, old[0], new[0], 0)); continue
        if zr_stale('AA_359 ' + tag, r[0], who, old[0], new[0]):   # X324 芷若重寫：原句還在＝源稿沒對齊，不換（最後一起停）
            FIXED359.append((tag + ' ' + r[0], who, old[0], new[0], 0)); continue
        hit = [o for o in texts(((LOC.get(r[0]) or {}).get('lines') or {}).get(who)) if o['text'] == old[0]]
        for o in hit:
            o['text'] = new[0]
        FIXED359.append((tag + ' ' + r[0], who, old[0], new[0], len(hit)))
        if not hit and ps_skip('AA_359 ' + tag, r[0], who, old[0], new=new[0]):
            pass
        elif not hit:
            print('AA_359 ' + tag + '：' + r[0] + ' ' + who + ' 找不到「' + old[0] + '」，沒換')
    if len(FIXED359) - n0 != want:
        sys.exit('拆不出來：AA_359 ' + tag + ' 應該是 ' + str(want) + ' 句，拆出 ' + str(len(FIXED359) - n0) + ' 句')
    return section(md, head)
fix_table('5-2', 9)
sec53 = fix_table('5-3', 7)
# 5-3 條列裡「不分版本都改」的那一句（子晴 D32 一般的到達句）
m = re.search(r'子晴一般：「([^「」]*)」→ 不分版本都改「([^「」]*)」', sec53)
if not m:
    sys.exit('拆不出來：AA_359 5-3 子晴那一句')
o53, n53 = N(m.group(1)), N(m.group(2))
stale53 = zr_stale('AA_359 5-3', 'D32', ZQ, o53, n53)   # X324 子晴重寫：原句還在＝不換、最後一起停
hit = [] if stale53 else [o for o in texts(((LOC.get('D32') or {}).get('lines') or {}).get('heroine_04')) if o['text'] == o53]
for o in hit:
    o['text'] = n53
FIXED359.append(('5-3 D32', 'heroine_04', o53, n53, len(hit)))
if not hit and not stale53 and not ps_skip('AA_359 5-3', 'D32', ZQ, o53, new=n53):   # 對不到＝跳過、印出來（ZQ_SKIP）
    print('AA_359 5-3：D32 heroine_04 找不到「' + o53 + '」，沒換')
# AA_524（企劃線 8fd10848d）說了沒發生（一）：後面沒有見面場合的「下次」改原句——那個地點、那個人的台詞裡整句相同才換（每句要剛好一處；已經是新句＝企劃線的地點檔自己改好了，跳過）。
#   A8 以安 D09 收尾、A9 以安 D14 夕陽／D16 燈塔（選項回覆、remember）、Z7 芷若 D18 明信片兩句（「我寫好再給你看。」只換這一段，前面的「……好。」照留）、D10 小吃攤。
#   每一句先確認稿裡有「改成」那一句。D04、D10 remember 多的那一句（Z7、Y9）看第一次選了哪一個，在 src/aa524_3d.js（不進這個檔）
md = show(FILES['fix524'])
FIXED524 = []
for item, loc, who, old, new, quote in [
        ('A8', 'D09', 'heroine_01', '夜景很好看。……另一個原因，下次再說。', '夜景很好看。……另一個原因，我不說。', '「夜景很好看。……另一個原因，我不說。」'),
        ('A9', 'D14', 'heroine_01', '……好。我帶你去。高美濕地那邊。', '……台中的夕陽在海邊。很遠，要開車。', '「……台中的夕陽在海邊。很遠，要開車。」'),
        ('A9', 'D16', 'heroine_01', '……好。我寫進手帳了。', '……最南邊。好遠。', '「……最南邊。好遠。」'),
        ('A9', 'D16', 'heroine_01', '上次說要去最南邊。……還在手帳上。', '你上次說要去最南邊。……我查過了，坐車要六個小時。', '「你上次說要去最南邊。……我查過了，坐車要六個小時。」'),
        ('Z7', 'D18', 'heroine_02', '……你又不在台中。好，寄給你。', '……你又不在台中。……好啦，這張直接給你。', '「……你又不在台中。……好啦，這張直接給你。」'),
        ('Z7', 'D18', 'heroine_02', '……好。我寫好再給你看。', '……好。我自己寫。你不准看。', '「我寫好再給你看。」→「我自己寫。你不准看。」'),
        ('Z7', 'D10', 'heroine_02', '……你會做什麼？好，我期待一下。', '……你會做什麼？……算了，你先學。', '「……你會做什麼？……算了，你先學。」')]:
    if quote not in md:
        sys.exit('AA_524@' + APPROVED[FILES['fix524']] + ' 裡找不到 ' + item + ' 的「改成」：' + quote)
    old, new = N(old), N(new)
    objs = list(texts(((LOC.get(loc) or {}).get('lines') or {}).get(who)))
    hit = [o for o in objs if o['text'] == old]
    if zr_stale('AA_524 ' + item, loc, who, old, new) or (not hit and ps_skip('AA_524 ' + item, loc, who, old, new=new)):   # X324 芷若重寫：Z7 的三列——原句還在＝不換、最後一起停；對不到＝跳過
        FIXED524.append((item + ' ' + loc, who, old, new, 0)); continue
    if len(hit) != 1 and not (not hit and sum(1 for o in objs if o['text'] == new) == 1):
        sys.exit('AA_524 ' + item + '：' + loc + ' ' + who + ' 的台詞裡「' + old + '」有 ' + str(len(hit)) + ' 句（應該是 1 句；或已經是新句）')
    for o in hit:
        o['text'] = new
    FIXED524.append((item + ' ' + loc, who, old, new, len(hit)))
# AA_525（HEROINE-LIFE-1028；AA-C 10-28 6081f725f 定稿）1-6 子晴 D10、D12、D13、D30、D31，2-4 沛珊 D08、D15、D18：第一次的回覆改成不欠（「下次我請」「下次換我」）。
# 只在那個地點、那個人的台詞裡換一字不差的 text；每一句先確認稿裡有「改成」那一句。白名單沒有 AA_525＝不換
A525 = G.approved_files(ALLOW, SP + 'AA_525_')
FIXED525 = []
if A525:
    P525, S525 = next(iter(A525.items()))
    ok, why = G.allowed(P525, S525, ALLOW)
    if not ok:
        sys.exit('拒絕匯入：' + why)
    md525 = G.read_fix(subprocess.check_output(['git', '-C', ROOT, 'show', f'{S525}:{P525}'], text=True))
    FIX525 = [('1-6', 'D10', 'heroine_04', '……謝謝。宵夜我請。', '……謝謝。', 'D10「……謝謝。宵夜我請。」→「……謝謝。」'),
              ('1-6', 'D12', 'heroine_04', '謝謝，下次換我。', '謝謝。', 'D12「謝謝，下次換我。」→「謝謝。」'),
              ('1-6', 'D13', 'heroine_04', '好，下次我請。', '好啦。謝謝。', 'D13「好，下次我請。」→「好啦。謝謝。」'),
              ('1-6', 'D30', 'heroine_04', '好。下次換我。', '好。謝謝。', 'D30「好。下次換我。」→「好。謝謝。」'),
              ('1-6', 'D31', 'heroine_04', '好！下次我請。', '好！謝謝！', 'D31「好！下次我請。」→「好！謝謝！」'),
              ('2-4 P-6', 'D15', 'classmate_peishan', '……下次我請你吃早餐。我家的。', '……我家的早餐比這個好吃！', 'D15「……下次我請你吃早餐。我家的。」→「……我家的早餐比這個好吃！」'),
              ('2-4 P-6', 'D08', 'classmate_peishan', '……謝謝。下次換你。', '謝謝！', 'D08、D18「下次換我」→「謝謝！」'),   # 稿寫「下次換我」；D08 遊園列車那一句其實是「……謝謝。下次換你。」（「我讓妳。」的回覆），同一列一起換
              ('2-4 P-6', 'D18', 'classmate_peishan', '……謝謝。下次換我。', '謝謝！', 'D08、D18「下次換我」→「謝謝！」')]
    for item, loc, who, old, new, quote in FIX525:
        if quote not in md525:
            sys.exit(f'AA_525@{S525} 裡找不到 {item} 的「改成」：{quote}')
        old, new = N(old), N(new)
        if ps_skip('AA_525 ' + item, loc, who, old, drop=True, new=new):   # PEISHAN-VOICE-1110：沛珊 P-6 三列新稿直接寫好了，不再套
            FIXED525.append((item + ' ' + loc, who, old, new, 0)); continue
        if zr_stale('AA_525 ' + item, loc, who, old, new):   # X324 子晴重寫：原句還在＝源稿沒對齊，不換（最後一起停）
            FIXED525.append((item + ' ' + loc, who, old, new, 0)); continue
        if who == ZQ and ps_skip('AA_525 ' + item, loc, who, old, new=new):   # X324 子晴重寫：1-6 五列原句都不在了＝跳過（那一格是寫回了、還是重寫成別的，ps_skip 逐列記）；「謝謝。」這種短句不拿來認「已經是新句」
            FIXED525.append((item + ' ' + loc, who, old, new, 0)); continue
        hit = [o for o in texts(((LOC.get(loc) or {}).get('lines') or {}).get(who)) if o['text'] in (old, new)]
        if not hit and ps_skip('AA_525 ' + item, loc, who, old, new=new):
            FIXED525.append((item + ' ' + loc, who, old, new, 0)); continue
        if not hit:
            sys.exit(f'AA_525 {item}：{loc} {who} 找不到「{old}」（也不是「{new}」）')
        for o in hit:
            o['text'] = new
        FIXED525.append((item + ' ' + loc, who, old, new, len(hit)))
    FILES['fix525'] = P525
# AA_526（HEROINE-LIFE-1028；AA-B 10-30 4ada43291 定稿，回 AA_525 的問題）第 2 節 D15：子晴「全部我請。」的回覆拿掉「下次滷味我請」——同上，那個地點、那個人整句相同才換
A526 = G.approved_files(ALLOW, SP + 'AA_526_')
if A526:
    P526, S526 = next(iter(A526.items()))
    ok, why = G.allowed(P526, S526, ALLOW)
    if not ok:
        sys.exit('拒絕匯入：' + why)
    md526 = G.read_fix(subprocess.check_output(['git', '-C', ROOT, 'show', f'{S526}:{P526}'], text=True))
    for item, loc, who, old, new, quote in [('第 2 節 D15', 'D15', 'heroine_04', '……好。我記下來。下次滷味我請。', '……好。我記下來。', '> 子晴：……好。我記下來。\n')]:
        if quote not in md526:
            sys.exit(f'AA_526@{S526} 裡找不到 {item} 的「改成」：{quote}')
        old, new = N(old), N(new)
        if zr_stale('AA_526 ' + item, loc, who, old, new) or (who == ZQ and ps_skip('AA_526 ' + item, loc, who, old, new=new)):   # X324 子晴重寫：原句還在＝不換、最後一起停；不在了＝跳過（ZQ_SKIP）
            FIXED525.append(('AA_526 ' + item, who, old, new, 0)); continue
        hit = [o for o in texts(((LOC.get(loc) or {}).get('lines') or {}).get(who)) if o['text'] in (old, new)]
        if not hit:
            sys.exit(f'AA_526 {item}：{loc} {who} 找不到「{old}」（也不是「{new}」）')
        for o in hit:
            o['text'] = new
        FIXED525.append(('AA_526 ' + item, who, old, new, len(hit)))
    FILES['fix526'] = P526
# AA_537b（XINCI-ROMANCE-1030；AA-B 10-30 508568ae5，使用者 X139 芯慈可以交往）芯慈第二份：第 1 節一般台詞（十一個 key）、第 2 節 128 點喜不喜歡（l／n／d）、
# 2-1 不喜歡那一點的一句、第 3 節八個常去地點的到達／收尾（arrive.first 的「／」＝連著說的兩句；其他欄的「／」＝輪流，現在都只有一句；tier 都是 any）。白名單沒有 AA_537b＝不加
A537 = G.approved_files(ALLOW, SP + 'AA_537b_')
XC = 'classmate_xinci'
if A537:
    P537, S537 = next(iter(A537.items()))
    ok, why = G.allowed(P537, S537, ALLOW)
    if not ok:
        sys.exit('拒絕匯入：' + why)
    md537 = G.read_fix(subprocess.check_output(['git', '-C', ROOT, 'show', f'{S537}:{P537}'], text=True))
    KEY537 = ['accept', 'acceptDating', 'cancel', 'flaked', 'move', 'move3', 'transport', 'depart', 'enough', 'leaveEarly', 'noPair']
    for r in rows(section(md537, '## 1. 約會的一般台詞'))[1:]:
        if r[0] in KEY537:
            a = alts(r[1])
            if not a:
                sys.exit('AA_537b 第 1 節拆不出來：' + r[0])
            L.setdefault(XC, {})[r[0]] = a
    miss = [k for k in KEY537 if not (L.get(XC) or {}).get(k)]
    if miss:
        sys.exit('AA_537b 第 1 節少了：' + ' '.join(miss))
    LK = {'l': 'like', 'n': 'normal', 'd': 'dislike'}
    nlk = 0
    for r in rows(section(md537, '## 2. 校外各點喜不喜歡')):
        for i in (0, 2):
            if i + 1 >= len(r) or not re.fullmatch(r'D\d\d', r[i]):
                continue
            loc = r[i]; pts = (LOC.get(loc) or {}).get('points') or {}
            for it in r[i + 1].split('／'):
                m = re.fullmatch(r'(\w+) ([lnd])', it.strip())
                if not m or f'{loc}.{m.group(1)}' not in pts:
                    sys.exit(f'AA_537b 第 2 節 {loc}「{it}」對不到地點的互動點：' + ' '.join(pts))
                LOC[loc].setdefault('likes', {}).setdefault(XC, {})[f'{loc}.{m.group(1)}'] = LK[m.group(2)]; nlk += 1
    if nlk != 128:
        sys.exit(f'AA_537b 第 2 節應該是 128 個點，拆出 {nlk} 個')
    ndl = 0
    for r in rows(section(md537, '### 2-1')):
        m = re.fullmatch(r'(D\d\d)\.(\w+)', r[0])
        if not m:
            continue
        loc, pid = m.group(1), r[0]
        if LOC[loc]['likes'][XC].get(pid) != 'dislike':
            sys.exit(f'AA_537b 2-1 {pid} 在第 2 節不是 d')
        LOC[loc].setdefault('dislikeLine', {}).setdefault(XC, {})[pid] = r[1]; ndl += 1
    nd = sum(1 for loc in LOC for v in LOC[loc].get('likes', {}).get(XC, {}).values() if v == 'dislike')
    if ndl != nd:
        sys.exit(f'AA_537b 2-1 的句子 {ndl} 句、第 2 節 d 有 {nd} 個')
    COL = ['arrive.first', 'arrive.normal', 'arrive.dating', 'closing.first', 'closing.normal']
    seq = lambda c: [{'who': XC, 'text': t} for t in alts(c)]
    n3 = 0
    for r in rows(section(md537, '## 3. 她常去的八個地點'))[1:]:
        m = re.match(r'(D\d\d) ', r[0])
        if not m:
            continue
        loc = m.group(1)
        if loc not in LOC or len(r) != 6:
            sys.exit('AA_537b 第 3 節這一列拆不出來：' + ' | '.join(r))
        X = {'arrive': {'first': {'tier': 'any', 'lines': seq(r[1])}, 'normal': [{'tier': 'any', 'lines': [{'who': XC, 'text': t}]} for t in alts(r[2])],
                        'dating': [{'tier': 'any', 'lines': [{'who': XC, 'text': t}]} for t in alts(r[3])]},
             'closing': {'first': {'tier': 'any', 'lines': seq(r[4])}, 'normal': [{'tier': 'any', 'lines': [{'who': XC, 'text': t}]} for t in alts(r[5])]}}
        if not all(X['arrive']['first']['lines']) or not X['arrive']['normal'] or not X['arrive']['dating'] or not X['closing']['first']['lines'] or not X['closing']['normal']:
            sys.exit('AA_537b 第 3 節 ' + loc + ' 有空格')
        LOC[loc].setdefault('lines', {})[XC] = X; n3 += 1
    if n3 != 8:
        sys.exit(f'AA_537b 第 3 節應該是八個地點，拆出 {n3} 個')
    FILES['xc537b'] = P537
    print(f'AA_537b：一般台詞 {len(L[XC])} 個 key、喜好 {nlk} 點、不喜歡的句子 {ndl} 句、常去地點 {n3} 個')
# AA_598（學姊改稿①c：約會地點台詞，任務 AA598-SIS-1C-1102；AA 定稿＝第 8 節 AA 審查決定，企劃線 c389462be）：第 2 節逐句表「#」是數字的 92 列（第 1～92 列）——
# 那個地點（`Dxx`）學姊（heroine_05）的台詞（lines 底下的 text，或 dislikeLine 的那一句）整句等於「原句」才換成「改成」（每句要剛好一處）；
# 已經是「改成」＝企劃線源稿（Dxx.py → Dxx.json、BB_128 → D13.json）自己改好了，跳過；兩個都不是＝停下來（源稿改過了要重看）。白名單沒有 AA_598＝不換。
# 第 8 節的決定蓋過表上沒跟著改的兩列：第 4 點 北投圖書館第一次「合成一個括號」（第 16 列；「……」照表上那一列的說明拿掉）、第 9 點 九份「家裡的茶都是我泡的。」（第 85 列）；
# 第 6 點 九份階梯（表上保753，不在 92 列裡）改成「老街是慢慢蓋出來的。」。
A598 = G.approved_files(ALLOW, SP + 'AA_598_')
FIXED598 = []
if A598:
    P598, S598 = next(iter(A598.items()))
    ok, why = G.allowed(P598, S598, ALLOW)
    if not ok:
        sys.exit('拒絕匯入：' + why)
    md598 = G.read_fix(subprocess.check_output(['git', '-C', ROOT, 'show', f'{S598}:{P598}'], text=True))
    tag598 = f'AA_598@{S598}'
    s8 = section(md598, '## 8. AA 審查決定')
    OVER598 = {16: ('（木造的圖書館。她小聲說）我想在這裡寫論文。', '「（木造的圖書館。她小聲說）……」'),
               85: ('家裡的茶都是我泡的。', '換「家裡的茶都是我泡的。」')}
    R598 = []
    for ln in md598.split('\n'):
        m = re.match(r'^\|\s*(\d+)\s*\|\s*`(D\d\d)`[^|]*\|\s*學姊\s*\|([^|]*)\|([^|]*)\|', ln)
        if m:
            n, loc, old, new = int(m.group(1)), m.group(2), m.group(3).strip(), m.group(4).strip()
            if n in OVER598:
                new, quote = OVER598[n]
                if quote not in s8:
                    sys.exit(f'{tag598} 第 8 節找不到第 {n} 列的決定：{quote}')
            R598.append((str(n), loc, old, new))
    if sorted(int(r[0]) for r in R598) != list(range(1, 93)):
        sys.exit(f'{tag598}：表上數字列應該是第 1～92 列，拆出 {sorted(int(r[0]) for r in R598)}')
    if '改成「老街是慢慢蓋出來的。」' not in s8:
        sys.exit(f'{tag598} 第 8 節找不到九份的決定')
    R598.append(('第 8 節第 6 點（保753）', 'D18', '老街是慢慢蓋出來的。……每一家砌自己門口那一段。', '老街是慢慢蓋出來的。'))
    for item, loc, old, new in R598:
        old, new = N(old), N(new)
        L5 = (LOC.get(loc) or {}).get('lines', {}).get('heroine_05')
        objs = [o for o in texts(L5) if o.get('who') in ('heroine_05', 'narr')]
        dl = (LOC.get(loc) or {}).get('dislikeLine', {}).get('heroine_05') or {}
        n_old = sum(1 for o in objs if o['text'] == old) + sum(1 for v in dl.values() if v == old)
        n_new = sum(1 for o in objs if o['text'] == new) + sum(1 for v in dl.values() if v == new)
        if n_old == 0 and n_new >= 1:
            FIXED598.append((item + ' ' + loc, old, new, 0)); continue
        if n_old == 0 and ps_skip(f'AA_598 第 {item} 列', loc, SIS, old, new=new):   # X324 學姊重寫：那一格新稿整句換了，AA_598 的原句對不到＝跳過（沒重寫的格子照舊換）
            FIXED598.append((item + ' ' + loc, old, new, -1)); continue
        if n_old != 1:
            sys.exit(f'{tag598} 第 {item} 列：{loc} 學姊的台詞裡「{old}」有 {n_old} 句（應該是 1 句；或已經是新句）')
        for o in objs:
            if o['text'] == old: o['text'] = new
        for k, v in dl.items():
            if v == old: dl[k] = new
        FIXED598.append((item + ' ' + loc, old, new, 1))
    FILES['fix598'] = P598
    print(f'{tag598}：學姊約會地點台詞 換 {sum(1 for *_, c in FIXED598 if c > 0)} 句、已經是新句 {sum(1 for *_, c in FIXED598 if c == 0)} 句、源稿重寫了跳過 {sum(1 for *_, c in FIXED598 if c < 0)} 句（共 {len(FIXED598)} 列）')
# 地點檔裡寫成旁白、其實是給開發看的條件或伏筆說明：改成 who:'note'（遊戲不顯示）。整句相同才改，其他旁白不動（DATE-C3：淡水示範的反應，
# 遊戲裡原本會演出「（第 6 階以上）」——D13 以安、學姊的合照那一句前面；「（第 3 節她的心願的伏筆）」——D13 可昕欄杆第一次的選項②）
NOTE_NARR = {'第 6 階以上', '第 3 節她的心願的伏筆'}
noted = [o for o in texts(LOC) if o.get('who') == 'narr' and o['text'] in NOTE_NARR]
for o in noted:
    o['who'] = 'note'
print('旁白改成註記（不顯示）：', len(noted), '行')
bad = [(w, k) for w in NAME.values() for k in KEYS + ['cancel', 'flaked'] if not (L.get(w) or {}).get(k)]
if bad:
    sys.exit('拆不出來（表格格式變了？）：' + json.dumps(bad, ensure_ascii=False))
# AA_758（PEISHAN-VOICE-1110，使用者 X327 沛珊重寫第 7 批；白名單上的 commit）：沛珊不分地點的短句（答應、改時間、交通、取消、放鴿子、出發、玩夠了、提早走、合照；十一種 17 句）。
# 源頭 BB_128 3-6、3-7 的表沒改（企劃線），照稿的 rows 疊：DATE_LINES.lines.classmate_peishan[key][i] 現在的字（照 AA_694 拿掉「……」以後）要剛好是 old，換成 new；
# 已經是 new＝源稿自己改好了，跳過；兩個都不是＝停下來。每一種的句數不變；換完整組要等於稿的 new（兩邊互相對）。換掉的舊句記進 PS_GONE（AA_694 第 3 節逐列核對時不算漏換）。白名單沒有 AA_758＝不疊
A758 = G.approved_files(ALLOW, SP + 'AA_758_')
FIXED758 = 0
if A758:
    P758, S758 = next(iter(A758.items()))
    ok, why = G.allowed(P758, S758, ALLOW)
    if not ok:
        sys.exit('拒絕匯入：' + why)
    d758 = json.loads(G.read_fix(subprocess.check_output(['git', '-C', ROOT, 'show', f'{S758}:{P758}'], text=True)))
    if len(d758.get('rows') or []) != 17:
        sys.exit(f'AA_758@{S758} 的 rows 應該是 17 列，讀到 {len(d758.get("rows") or [])} 列')
    LP = L.get(PS) or {}
    for r in d758['rows']:
        k, i = r['key'], r['i']
        if k not in LP or not isinstance(LP[k], list) or i >= len(LP[k]) or not isinstance(LP[k][i], str):
            sys.exit(f'AA_758 {k}[{i}]：沛珊沒有這一格（或不是一句）')
        cur = LP[k][i]
        if cur == r['new']: continue
        if N(cur) != N(r['old']):
            sys.exit(f'AA_758 {k}[{i}]：現在是「{N(cur)}」，不是原句「{r["old"]}」')
        if N(r['new']) != r['new']:
            sys.exit(f'AA_758 {k}[{i}]：新句照 AA_694 的規則會被改掉「……」（{r["new"]}），先問 AA')
        LP[k][i] = r['new']; PS_GONE.update((cur, N(cur))); FIXED758 += 1
    if {k: LP.get(k) for k in d758['new']} != d758['new'] or any(len(LP[k]) != len(v) for k, v in d758['new'].items()):
        sys.exit('AA_758：17 列換完以後和稿的 new 不一樣（稿的兩份對不起來，或 BB_128 沛珊那幾格變了）')
    FILES['fix758'] = P758
    print(f'AA_758@{S758}：沛珊不分地點的短句 17 列，換了 {FIXED758} 列')
# AA_765（DLG-FULL-REVIEW-1110，使用者 X324；白名單上的 commit）：學姊不分地點的短句 11 種 15 句只改四句（move 第二句、transport、enough 第二句、depart 第三句）——做法同 AA_758：
# DATE_LINES.lines.heroine_05[key][i] 現在的字（照 AA_694 拿掉「……」以後）要剛好是 old，換成 new；已經是 new＝跳過；兩個都不是＝停下來。句數不變。白名單沒有 AA_765＝不疊
A765 = G.approved_files(ALLOW, SP + 'AA_765_')
FIXED765 = 0
if A765:
    P765, S765 = next(iter(A765.items()))
    ok, why = G.allowed(P765, S765, ALLOW)
    if not ok:
        sys.exit('拒絕匯入：' + why)
    d765 = json.loads(G.read_fix(subprocess.check_output(['git', '-C', ROOT, 'show', f'{S765}:{P765}'], text=True)))
    if len(d765.get('rows') or []) != 4:
        sys.exit(f'AA_765@{S765} 的 rows 應該是 4 列，讀到 {len(d765.get("rows") or [])} 列')
    LS = L.get(SIS) or {}
    for r in d765['rows']:
        k, i = r['key'], r['i']
        if k not in LS or not isinstance(LS[k], list) or i >= len(LS[k]) or not isinstance(LS[k][i], str):
            sys.exit(f'AA_765 {k}[{i}]：學姊沒有這一格（或不是一句）')
        cur = LS[k][i]
        if cur == r['new']: continue
        if N(cur) != N(r['old']):
            sys.exit(f'AA_765 {k}[{i}]：現在是「{N(cur)}」，不是原句「{r["old"]}」')
        if N(r['new']) != r['new']:
            sys.exit(f'AA_765 {k}[{i}]：新句照 AA_694 的規則會被改掉「……」（{r["new"]}），先問 AA')
        LS[k][i] = r['new']; SIS_GONE.update((cur, N(cur))); FIXED765 += 1
    FILES['fix765'] = P765
    print(f'AA_765@{S765}：學姊不分地點的短句 4 列，換了 {FIXED765} 列')
# AA_594（以安改稿④b，白名單 AA594-AN-4B-1102；第 9、10 節「本批全部可以交 LAWWW 整合」）第 2-14 節：以安的約會台詞改 314 列（含全域那幾格，源頭 AA_127 第 8 節）。
# 源稿 lines/Dxx.json、AA_127 沒改（企劃線），照表疊：位置欄的 `路徑`（DATE_LINES 底下的 lines.… 或 loc.…）那一格現在的字要剛好是「原句」（旁白的括號照原樣），換成「改成」；
# 對不上（路徑找不到、字不一樣）＝停下來，不猜。改成＝原句的列（BB_240 補回原句）跳過。白名單沒有 AA_594＝不疊
A594 = G.approved_files(ALLOW, SP + 'AA_594_')
FIXED594 = 0
AN594 = {'new': 0, 'other': 0}   # X324 以安重寫：第 2-14 節她各地點的列——源稿寫回了幾列、那一格重寫了幾列（都跳過，逐列在 AN_SKIP）
if A594:
    P594, S594 = next(iter(A594.items()))
    ok, why = G.allowed(P594, S594, ALLOW)
    if not ok:
        sys.exit('拒絕匯入：' + why)
    md594 = G.read_fix(subprocess.check_output(['git', '-C', ROOT, 'show', f'{S594}:{P594}'], text=True))
    ROOT594 = {'lines': L, 'loc': LOC}
    nrow = 0
    for ln in md594.split('\n'):
        m = re.match(r'^\|\s*([0-9]+)\s*\|(.*)\|\s*$', ln)
        if not m: continue
        c = [x.strip() for x in m.group(2).split('|')]
        if len(c) < 5 or not c[0].startswith('date_lines.js'): continue
        nrow += 1
        if c[2] == c[3]: continue
        pm = re.search(r'`([^`]+)`', c[0])
        if not pm:
            sys.exit(f'AA_594 第 {m.group(1)} 列：位置欄沒有路徑')
        toks = re.findall(r"\['[^']*'\]|\[\d+\]|[^.\[\]]+", pm.group(1))
        cur, par, key = ROOT594, None, None
        i = 0
        while i < len(toks):
            t = toks[i]; k = t[2:-2] if t.startswith("['") else int(t[1:-1]) if t.startswith('[') else t
            if isinstance(cur, dict) and k not in cur and i + 1 < len(toks) and not toks[i + 1].startswith('[') and f'{k}.{toks[i + 1]}' in cur:
                k = f'{k}.{toks[i + 1]}'; i += 1   # hotspots 的 key 本身有點（D01.expo）
            try:
                par, key, cur = cur, k, cur[k]
            except (KeyError, IndexError, TypeError):
                sys.exit(f'AA_594 第 {m.group(1)} 列：路徑 {pm.group(1)} 找不到（在 {t}）')
            i += 1
        old, new = N(c[2]), N(c[3])
        m594 = re.match(r'loc\.(D\d\d)\.(?:lines|dislikeLine)\.' + AN + r'\.', pm.group(1))
        an594 = m594.group(1) if m594 and ps756(m594.group(1), AN) else None   # X324 以安重寫：這一列是她某個地點的格子、源稿是她重寫以後的版本
        if an594:
            v = N(cur) if isinstance(cur, str) else N(cur['text']) if isinstance(cur, dict) and isinstance(cur.get('text'), str) else None
            if v is None:
                sys.exit(f'AA_594 第 {m.group(1)} 列：{pm.group(1)} 不是一句台詞')
            same = lambda a, b: a == b or '（' + a + '）' == b   # 旁白的列表上帶括號、檔裡不帶
            if same(v, new):   # 源稿把遊戲原本疊著的字寫回了（含那一格沒再動的）
                AN_SKIP.append((f'AA_594 第 {m.group(1)} 列', an594, old, '已經是改成的字（源稿寫回了）')); AN594['new'] += 1; continue
            if same(v, old):   # 原句還在＝源稿沒對齊：不換，最後一起停
                AN_STALE.append((f'AA_594 第 {m.group(1)} 列', an594, old, new)); continue
            AN_SKIP.append((f'AA_594 第 {m.group(1)} 列', an594, old, '那一格新稿重寫成「' + v + '」')); AN_GONE.update(x for x in (old, new, old[1:-1] if old.startswith('（') and old.endswith('）') else '', new[1:-1] if new.startswith('（') and new.endswith('）') else '') if x); AN594['other'] += 1; continue
        if isinstance(cur, str):
            cur = N(cur)   # AA_694：AA_127 的預約句（md 源稿）沒拿掉，照同一條規則再對
            if cur == new: continue   # AA_661 第 61 列：源稿已經是新字＝跳過（同 tools/story/aa630.py）；兩個都不是照舊停下來
            if cur != old:
                sys.exit(f'AA_594 第 {m.group(1)} 列：{pm.group(1)} 現在是「{cur}」，不是原句「{old}」')
            par[key] = new
        elif isinstance(cur, dict) and isinstance(cur.get('text'), str):
            v = N(cur['text'])
            if v == new or (new.startswith('（') and new.endswith('）') and '（' + v + '）' == new): continue   # AA_661 第 61 列：已經是新字＝跳過
            if v == old: cur['text'] = new
            elif '（' + v + '）' == old and new.startswith('（') and new.endswith('）'): cur['text'] = new[1:-1]
            else: sys.exit(f'AA_594 第 {m.group(1)} 列：{pm.group(1)} 現在是「{v}」，不是原句「{old}」')
        else:
            sys.exit(f'AA_594 第 {m.group(1)} 列：{pm.group(1)} 不是一句台詞')
        FIXED594 += 1
    if nrow != 314:
        sys.exit(f'AA_594 第 2-14 節應該有 314 列，讀到 {nrow} 列')
    FILES['fix594'] = P594
    print(f'AA_594 第 2-14 節：314 列，換了 {FIXED594} 列（其他是 BB_240 補回原句' + (f'；以安重寫：她各地點的列源稿寫回了 {AN594["new"]} 列、那一格重寫了 {AN594["other"]} 列，都跳過' if AN594['new'] + AN594['other'] else '') + '）')
# AA_767（DLG-FULL-REVIEW-1110，使用者 X324 語彤約會台詞重寫；白名單上的 commit）：語彤不分地點的短句——稿的 rows 13 列裡 file 是 src/data/date_lines.js 的六列
# （move 第一句、transport 兩句、cancel、flaked 兩句；accept、acceptDating、move 第二句、move3 不改；另外七列是 src/date3d.js 手寫的那幾格，直接改在那個檔）。
# **照 path 換**（lines.heroine_03.key[i] 或 [i][j]；「嗯。」整個檔有兩百多處，不能整檔取代）：那一格現在的字要剛好是 old（已經是 new＝跳過），換成 new；兩個都不是＝停下來。
# 她這幾格的來源是 AA_127 第 8 節、2-7＋AA_630 預約句（patch_text，寫檔前才套）＋AA_694——所以這一層放在寫檔前最後一步（下面 apply767）。白名單沒有 AA_767＝不疊
A767 = G.approved_files(ALLOW, SP + 'AA_767_')
R767 = []
if A767:
    P767, S767 = next(iter(A767.items()))
    ok, why = G.allowed(P767, S767, ALLOW)
    if not ok:
        sys.exit('拒絕匯入：' + why)
    d767 = json.loads(G.read_fix(subprocess.check_output(['git', '-C', ROOT, 'show', f'{S767}:{P767}'], text=True)))
    if len(d767.get('rows') or []) != 13:
        sys.exit(f'AA_767@{S767} 的 rows 應該是 13 列，讀到 {len(d767.get("rows") or [])} 列')
    R767 = [r for r in d767['rows'] if r.get('file') == 'src/data/date_lines.js']
    if len(R767) != 6 or any(not r['path'].startswith('lines.' + YT + '.') for r in R767) or sum(1 for r in d767['rows'] if r.get('file') == 'src/date3d.js') != 7:
        sys.exit(f'AA_767@{S767}：date_lines.js 應該是六列（都在 lines.heroine_03 底下）、date3d.js 七列')
    FILES['fix767'] = P767


# AA_769（DLG-FULL-REVIEW-1110，使用者 X324 可昕約會台詞重寫；白名單上的 commit）：可昕不分地點的短句——稿的 rows 8 列裡 file 是 src/data/date_lines.js 的七列
# （move3、transport、flaked 兩句、depart 第三句、enough 第二句、leaveEarly；accept、acceptDating、move、cancel、depart 前兩句、enough 第一句、noPair 不改；另外一列是 src/date3d.js 的 S.MORNING.kexin，直接改在那個檔）。
# 做法同 AA_767：照 path 換（「第二次了。」整個檔好幾處），寫檔前最後一步（apply767 的第二個參數）。白名單沒有 AA_769＝不疊
A769 = G.approved_files(ALLOW, SP + 'AA_769_')
R769 = []
if A769:
    P769, S769 = next(iter(A769.items()))
    ok, why = G.allowed(P769, S769, ALLOW)
    if not ok:
        sys.exit('拒絕匯入：' + why)
    d769 = json.loads(G.read_fix(subprocess.check_output(['git', '-C', ROOT, 'show', f'{S769}:{P769}'], text=True)))
    if len(d769.get('rows') or []) != 8:
        sys.exit(f'AA_769@{S769} 的 rows 應該是 8 列，讀到 {len(d769.get("rows") or [])} 列')
    R769 = [r for r in d769['rows'] if r.get('file') == 'src/data/date_lines.js']
    if len(R769) != 7 or any(not r['path'].startswith('lines.' + KX + '.') for r in R769) or [r['path'] for r in d769['rows'] if r.get('file') == 'src/date3d.js'] != ['S.MORNING.kexin']:
        sys.exit(f'AA_769@{S769}：date_lines.js 應該是七列（都在 lines.kexin 底下）、date3d.js 一列（S.MORNING.kexin）')
    FILES['fix769'] = P769


# AA_773（DLG-FULL-REVIEW-1110，使用者 X324 芷若約會台詞重寫；白名單上的 commit）：芷若不分地點的短句——稿的 rows 11 列裡 file 是 src/data/date_lines.js 的九列
# （acceptDating、move 第二句、transport、flaked 第二句、depart 前兩句、enough 兩句、leaveEarly；accept 兩句、move 第一句、move3、cancel 兩句、flaked 第一句、depart 第三句、noPair 不改；
# 另外兩列是 src/date3d.js 的 S.MORNING_OWN.heroine_02、S.T7A_YES.heroine_02，直接改在那個檔）。做法同 AA_767、AA_769：照 path 換，寫檔前最後一步。白名單沒有 AA_773＝不疊
A773 = G.approved_files(ALLOW, SP + 'AA_773_')
R773 = []
if A773:
    P773, S773 = next(iter(A773.items()))
    ok, why = G.allowed(P773, S773, ALLOW)
    if not ok:
        sys.exit('拒絕匯入：' + why)
    d773 = json.loads(G.read_fix(subprocess.check_output(['git', '-C', ROOT, 'show', f'{S773}:{P773}'], text=True)))
    if len(d773.get('rows') or []) != 11:
        sys.exit(f'AA_773@{S773} 的 rows 應該是 11 列，讀到 {len(d773.get("rows") or [])} 列')
    R773 = [r for r in d773['rows'] if r.get('file') == 'src/data/date_lines.js']
    if len(R773) != 9 or any(not r['path'].startswith('lines.' + ZR + '.') for r in R773) or [r['path'] for r in d773['rows'] if r.get('file') == 'src/date3d.js'] != ['S.MORNING_OWN.heroine_02', 'S.T7A_YES.heroine_02']:
        sys.exit(f'AA_773@{S773}：date_lines.js 應該是九列（都在 lines.heroine_02 底下）、date3d.js 兩列（S.MORNING_OWN.heroine_02、S.T7A_YES.heroine_02）')
    FILES['fix773'] = P773


# AA_775（DLG-FULL-REVIEW-1110，使用者 X324 子晴約會台詞重寫；白名單上的 commit）：子晴不分地點的短句——稿的 rows 9 列裡 file 是 src/data/date_lines.js 的五列
# （transport、cancel 兩句、flaked 第一句、enough 第一句；accept 兩句、acceptDating、move 兩句、move3、depart 三句、enough 第二句、leaveEarly、noPair 不改；
# 另外四列是 src/date3d.js 手寫的：S.MORNING.heroine_04、S.REMEMBER_IF 她 D06.cafe／D15.store 沒旗標的備用句、D26 臺中過夜晚上那一句旁白，直接改在那個檔）。
# 做法同 AA_767、AA_769、AA_773：照 path 換，寫檔前最後一步。白名單沒有 AA_775＝不疊
A775 = G.approved_files(ALLOW, SP + 'AA_775_')
R775 = []
if A775:
    P775, S775 = next(iter(A775.items()))
    ok, why = G.allowed(P775, S775, ALLOW)
    if not ok:
        sys.exit('拒絕匯入：' + why)
    d775 = json.loads(G.read_fix(subprocess.check_output(['git', '-C', ROOT, 'show', f'{S775}:{P775}'], text=True)))
    if len(d775.get('rows') or []) != 9:
        sys.exit(f'AA_775@{S775} 的 rows 應該是 9 列，讀到 {len(d775.get("rows") or [])} 列')
    R775 = [r for r in d775['rows'] if r.get('file') == 'src/data/date_lines.js']
    E775 = [r['path'] for r in d775['rows'] if r.get('file') == 'src/date3d.js']
    if len(R775) != 5 or any(not r['path'].startswith('lines.' + ZQ + '.') for r in R775) or len(E775) != 4 or E775[0] != 'S.MORNING.heroine_04' or not all(x.startswith('S.REMEMBER_IF（') for x in E775[1:3]) or not E775[3].startswith('D26 '):
        sys.exit(f'AA_775@{S775}：date_lines.js 應該是五列（都在 lines.heroine_04 底下）、date3d.js 四列（S.MORNING.heroine_04、S.REMEMBER_IF 兩列、D26 過夜那一句）')
    FILES['fix775'] = P775


# AA_777（DLG-FULL-REVIEW-1110，使用者 X324 以安約會台詞重寫；白名單上的 commit）：以安不分地點的短句——稿的 rows 9 列裡 file 是 src/data/date_lines.js 的四列
# （move 第二句、transport、flaked 的兩則；accept 兩句、acceptDating、move 第一句、move3、cancel 兩句不改；她沒有 depart、enough、leaveEarly、noPair 的專屬句；
# 另外五列是 src/date3d.js 手寫的：S.MORNING、S.MORNING_OWN、S.HOME_NO、S.T7A_YES 她那一格、D26 臺中過夜晚上那一句旁白，直接改在那個檔）。
# 做法同 AA_767、AA_769、AA_773、AA_775：照 path 換，寫檔前最後一步（她這幾格的來源是 AA_127 第 8 節、1-7＋AA_594＋AA_694，old 是疊完以後的字）。白名單沒有 AA_777＝不疊
A777 = G.approved_files(ALLOW, SP + 'AA_777_')
R777 = []
if A777:
    P777, S777 = next(iter(A777.items()))
    ok, why = G.allowed(P777, S777, ALLOW)
    if not ok:
        sys.exit('拒絕匯入：' + why)
    d777 = json.loads(G.read_fix(subprocess.check_output(['git', '-C', ROOT, 'show', f'{S777}:{P777}'], text=True)))
    if len(d777.get('rows') or []) != 9:
        sys.exit(f'AA_777@{S777} 的 rows 應該是 9 列，讀到 {len(d777.get("rows") or [])} 列')
    R777 = [r for r in d777['rows'] if r.get('file') == 'src/data/date_lines.js']
    E777 = [r['path'] for r in d777['rows'] if r.get('file') == 'src/date3d.js']
    if len(R777) != 4 or any(not r['path'].startswith('lines.' + AN + '.') for r in R777) or E777[:4] != ['S.MORNING.heroine_01', 'S.MORNING_OWN.heroine_01', 'S.HOME_NO.heroine_01', 'S.T7A_YES.heroine_01'] or len(E777) != 5 or not E777[4].startswith('D26 '):
        sys.exit(f'AA_777@{S777}：date_lines.js 應該是四列（都在 lines.heroine_01 底下）、date3d.js 五列（S.MORNING、S.MORNING_OWN、S.HOME_NO、S.T7A_YES 的 heroine_01、D26 過夜那一句）')
    FILES['fix777'] = P777


# AA_780（DLG-FULL-REVIEW-1110，使用者 X324；以安約會台詞匯入以後 AA 的後續改稿，白名單上的 commit）：不分地點的短句——稿的 rows 9 列裡 file 是 src/data/date_lines.js 的五列
# （四個人的 flaked「30 天內第二次當天取消」那一句改成當下的反應：以安 flaked[0][0]、[0][1]；子晴 flaked[0]＝原本 AA_775 那一列；語彤 flaked[0][0]＝AA_767，[0][1] 不動；芷若 flaked[0][1]＝AA_773；
# 另外四列是 src/date3d.js 手寫的 S.EXTRA_LINES.heroine_01：enough 兩句、leaveEarly、noPair，直接改在那個檔；depart 三句不動）。
# 做法同 AA_767～AA_777：照 path 換，寫檔前最後一步、排在那幾層後面（old 是那幾層疊完以後的字；對不上＝停下來）。白名單沒有 AA_780＝不疊
A780 = G.approved_files(ALLOW, SP + 'AA_780_')
R780 = []
if A780:
    P780, S780 = next(iter(A780.items()))
    ok, why = G.allowed(P780, S780, ALLOW)
    if not ok:
        sys.exit('拒絕匯入：' + why)
    d780 = json.loads(G.read_fix(subprocess.check_output(['git', '-C', ROOT, 'show', f'{S780}:{P780}'], text=True)))
    if len(d780.get('rows') or []) != 9:
        sys.exit(f'AA_780@{S780} 的 rows 應該是 9 列，讀到 {len(d780.get("rows") or [])} 列')
    R780 = [r for r in d780['rows'] if r.get('file') == 'src/data/date_lines.js']
    E780 = [r['path'] for r in d780['rows'] if r.get('file') == 'src/date3d.js']
    if [r['path'] for r in R780] != [f'lines.{AN}.flaked[0][0]', f'lines.{AN}.flaked[0][1]', f'lines.{ZQ}.flaked[0]', f'lines.{YT}.flaked[0][0]', f'lines.{ZR}.flaked[0][1]'] \
            or E780 != [f'S.EXTRA_LINES.{AN}.enough[0]', f'S.EXTRA_LINES.{AN}.enough[1]', f'S.EXTRA_LINES.{AN}.leaveEarly[0]', f'S.EXTRA_LINES.{AN}.noPair[0]']:
        sys.exit(f'AA_780@{S780}：date_lines.js 應該是五列（以安 flaked 兩則、子晴 flaked[0]、語彤 flaked[0][0]、芷若 flaked[0][1]）、date3d.js 四列（S.EXTRA_LINES.heroine_01 的 enough 兩句、leaveEarly、noPair）')
    FILES['fix780'] = P780


# AA_812（DLG-FULL-REVIEW-1110 小項，使用者 X324；白名單上的 commit，企劃線 f1fab0ec6）：懸著的「下次我請」——七格，寫檔前最後一步、排在 AA_780 後面（old＝那幾層疊完以後的字）：
# ① 改稿紀錄 date_rewrite/<人>_<地點>.json（白名單逐檔列的才讀；這一次五份：沛珊 D15、D21，學姊 D06，子晴 D06，可昕 D15）：AA 改了紀錄、源稿 date_system/lines/Dxx.json 沒有重新 apply
#    （白名單 33 筆還是 248c8e390，f1fab0ec6 的 Dxx.json 和它一樣）——拿同一份紀錄在源稿那一版（白名單 33 筆的 sha）和白名單這一版逐格比，不一樣的格＝這一次改的，
#    照格號（date_rewrite.py list 的順序＝下面 slot_refs）換在遊戲那一格：現在是舊字＝換；已經是新字＝跳過（源稿之後 apply 了、33 筆換版）；都不是＝停下來。格數對不上也停。
# ② 稿的 path_rows 兩列（原句沒進改稿紀錄、是 null 格：子晴 D06.cafe 第一次選項的回覆、語彤 D10.boat remember）：照 path 換（path 可以寫 ['D06.cafe']；指到一句 {who,text}＝換 text），做法同 AA_767。
# 稿的 SHE_PAYS_add、SPLIT 在 tools/date/import_she_pays.py（她請客、平分）；「不列」那一節（closing／arrive 說的請客）不做。白名單沒有 AA_812＝不疊（改稿紀錄也不讀）
# 2026-11-12 X324 第三次重匯（SHA 見 tests/date_src_sha.js 的 ALLOW_SHA 那一列）：path_rows 第一列（子晴 D06.cafe 第一次選項的回話「好。下次我請你吃滷味。」→「好。下次我請。」）被 AA 後來的決定取代——
# AA_846 那一格改成「下次我請你吃滷味。」（AA_846 _meta.late_fix「11-12 10:4x：D06.cafe 改回「下次我請你吃滷味。」（AA_812 再訪有兌現）」，源稿已經是這一句），AA_812 的 path_rows 還沒跟著改。
# 只認這一列、而且遊戲那一格剛好是下面寫的字才跳過（別的字照舊停下來）；AA 把 AA_812 path_rows 改掉以後這一筆就用不到、可以拿掉。
# 2026-11-12 X324 第四次重匯（SHA 見 tests/date_src_sha.js 的 ALLOW_SHA 那一列）：AA 把 AA_812 path_rows 的那一列刪掉了（_meta.aa_c_1112；源稿那一格直接是「下次我請。」），上面那一筆例外拿掉——
# 現在是空的（格式：path → (path_rows 的 old, 遊戲那一格現在的字, 哪一份稿)），機制留著給下一次用。
SUPER812 = {}
SKIP812 = []
A812 = G.approved_files(ALLOW, SP + 'AA_812_')
R812, REC812 = [], []
if A812:
    P812, S812 = next(iter(A812.items()))
    ok, why = G.allowed(P812, S812, ALLOW)
    if not ok:
        sys.exit('拒絕匯入：' + why)
    d812 = json.loads(G.read_fix(subprocess.check_output(['git', '-C', ROOT, 'show', f'{S812}:{P812}'], text=True)))
    R812 = d812.get('path_rows') or []
    if len(R812) != 1 or any(r.get('file') != 'src/data/date_lines.js' or not all(isinstance(r.get(k), str) and r.get(k) for k in ('path', 'old', 'new')) for r in R812):
        sys.exit(f'AA_812@{S812} 的 path_rows 應該是一列（語彤 D10.boat remember；子晴 D06.cafe 那一列 AA 第四次重匯那一版刪掉了；file 都是 src/data/date_lines.js、path／old／new 都有字），讀到 {len(R812)} 列')
    FILES['fix812'] = P812
    # 改稿紀錄的「舊的那一版」：AA_812 比的是約會台詞源稿 248c8e390 那一版（D01～D33 那時候的白名單）。2026-11-11 19:1x 源稿換 52c3ee258（AA 只加選項 fx、拿掉 fx 和 248c8e390 逐檔相同），
    # 那一版的企劃線已經包含 AA_812 改過的紀錄＝拿它當舊版會比出 0 格（工具停下來）——舊版固定用 248c8e390，不跟著源稿換
    BASE812 = '248c8e390'
    SRC812 = sorted({APPROVED[p] for p in APPROVED if re.match(SP + r'date_system/lines/D\d\d\.json$', p)})
    if len(SRC812) != 1:
        sys.exit(f'AA_812：白名單 date_system/lines/D01～D33 應該是同一個 sha，讀到 {SRC812}')
    for p, s in sorted(G.approved_files(ALLOW, SP + 'date_rewrite/').items()):
        ok, why = G.allowed(p, s, ALLOW)
        if not ok:
            sys.exit('拒絕匯入：' + why)
        new_r = json.loads(G.read_fix(subprocess.check_output(['git', '-C', ROOT, 'show', f'{s}:{p}'], text=True)))
        try:
            old_r = json.loads(G.read_fix(subprocess.check_output(['git', '-C', ROOT, 'show', f'{BASE812}:{p}'], text=True, stderr=subprocess.DEVNULL)))
        except subprocess.CalledProcessError:
            sys.exit(f'AA_812：改稿紀錄 {p} 在源稿那一版 {BASE812} 沒有（不知道舊字是什麼，不猜）')
        who = new_r.get('who')
        if not who or old_r.get('who') != who:
            sys.exit(f'AA_812：改稿紀錄 {p} 的 who 兩版不一樣或沒寫（{old_r.get("who")}／{who}）')
        for loc in sorted(k for k in new_r if re.fullmatch(r'D\d\d', k)):
            a, b = old_r.get(loc), new_r[loc]
            if not isinstance(a, list) or not isinstance(b, list) or len(a) != len(b):
                sys.exit(f'AA_812：改稿紀錄 {p} 的 {loc} 兩版格數不一樣（{len(a) if isinstance(a, list) else a}／{len(b)}）')
            for i, (x, y) in enumerate(zip(a, b)):
                if x == y:
                    continue
                if not isinstance(x, str) or not isinstance(y, str):
                    sys.exit(f'AA_812：改稿紀錄 {p} {loc} 第 {i + 1} 格兩版不是都有字（{x!r} → {y!r}），不知道遊戲那一格原本是什麼，不猜')
                REC812.append({'rec': p, 'who': who, 'loc': loc, 'n': i + 1, 'cells': len(b), 'old': x, 'new': y})
        FILES['rec812:' + p] = p
    if len(REC812) != 5:
        sys.exit(f'AA_812：改稿紀錄這一次應該改五格（沛珊 D15、D21，學姊 D06，子晴 D06，可昕 D15 各一格），讀到 {len(REC812)} 格：' + json.dumps([(r['rec'], r['n']) for r in REC812], ensure_ascii=False))


def slot_refs(d, who):
    """date_rewrite.py list 的格（同 tools/date/import_she_pays.py 的 slots()，但回傳 (容器, key) 才換得到）：到達、收尾各 first／normal／dating，
    互動點 first／normal／remember／dating 再來是其他，最後是不喜歡那一句"""
    out, L, K4 = [], d['lines'][who], ('first', 'normal', 'remember', 'dating')

    def block(b):
        if isinstance(b, list):
            for x in b:
                block(x)
        elif isinstance(b, dict) and 'lines' in b:
            for x in b['lines']:
                out.append((x, 'text'))
            for c in b.get('choice') or []:
                out.append((c, 't'))
                for r in c.get('reply') or []:
                    out.append((r, 'text'))
    for part in ('arrive', 'closing'):
        for kind in ('first', 'normal', 'dating'):
            if L.get(part) and kind in L[part]:
                block(L[part][kind])
    for hs, X in (L.get('hotspots') or {}).items():
        for kind in K4:
            if kind in X:
                block(X[kind])
        for k in X:
            if k not in K4:
                block(X[k])
    dl = (d.get('dislikeLine') or {}).get(who) or {}
    for hs in dl:
        out.append((dl, hs))
    return out


def apply812(body):
    """寫檔前最後一步（AA_780 後面）：AA_812 改稿紀錄五格（照格號）＋path_rows 兩列（照 path）。回傳新的 JSON 字、換了幾格"""
    o = json.loads(body); n = 0
    for r in REC812:
        tag = f'AA_812（改稿紀錄 {r["rec"]} {r["loc"]} 第 {r["n"]} 格）'
        D = (o.get('loc') or {}).get(r['loc']) or {}
        if r['who'] not in (D.get('lines') or {}):
            sys.exit(f'{tag}：date_lines.js 的 {r["loc"]} 沒有 {r["who"]}')
        S = slot_refs(D, r['who'])
        if len(S) != r['cells']:
            sys.exit(f'{tag}：遊戲 {len(S)} 格、改稿紀錄 {r["cells"]} 格，格子對不上')
        c, k = S[r['n'] - 1]
        if c[k] == r['new']: continue
        if c[k] != r['old'] and c[k] != N(r['old']):
            sys.exit(f'{tag}：遊戲那一格現在是「{c[k]}」，不是舊字「{r["old"]}」')
        if N(r['new']) != r['new']:
            sys.exit(f'{tag}：新句照 AA_694 的規則會被改掉「……」（{r["new"]}），先問 AA')
        c[k] = r['new']; n += 1
    for r in R812:
        toks = re.findall(r"\['([^']*)'\]|\[(\d+)\]|([^.\[\]]+)", r['path'])
        if ''.join(f"['{q}']" if q else (f'[{i}]' if i else ('.' + k)) for q, i, k in toks).lstrip('.') != r['path']:
            sys.exit(f'AA_812：路徑 {r["path"]} 拆不出來')
        cur, par, key = o, None, None
        for q, i, k in toks:
            kk = q if q else (int(i) if i else k)
            try:
                par, key, cur = cur, kk, cur[kk]
            except (KeyError, IndexError, TypeError):
                sys.exit(f'AA_812：路徑 {r["path"]} 找不到（在 {kk}）')
        if isinstance(cur, dict) and isinstance(cur.get('text'), str):
            par, key, cur = cur, 'text', cur['text']
        if not isinstance(cur, str):
            sys.exit(f'AA_812：{r["path"]} 不是一句台詞')
        if cur == r['new']: continue
        sp = SUPER812.get(r['path'])
        if sp and r['old'] == sp[0] and cur == sp[1]:   # 這一格 AA 後來在源稿改了字（見 SUPER812）：不換
            SKIP812.append((r['path'], r['old'], r['new'], cur, sp[2])); continue
        if cur != r['old'] and cur != N(r['old']):
            sys.exit(f'AA_812：{r["path"]} 現在是「{cur}」，不是原句「{r["old"]}」')
        if N(r['new']) != r['new']:
            sys.exit(f'AA_812：{r["path"]} 的新句照 AA_694 的規則會被改掉「……」（{r["new"]}），先問 AA')
        par[key] = r['new']; n += 1
    return json.dumps(o, ensure_ascii=False), n


def apply767(body, rows=None, tag='AA_767'):
    """寫檔前最後一步：AA_767 六列（或 rows＝AA_769 七列）照 path 換在整份 JSON 上（回傳新的 JSON 字、換了幾列）"""
    o = json.loads(body); n = 0
    for r in (R767 if rows is None else rows):
        toks = re.findall(r'\[\d+\]|[^.\[\]]+', r['path'])
        cur, par, key = o, None, None
        for t in toks:
            k = int(t[1:-1]) if t.startswith('[') else t
            try:
                par, key, cur = cur, k, cur[k]
            except (KeyError, IndexError, TypeError):
                sys.exit(f'{tag}：路徑 {r["path"]} 找不到（在 {t}）')
        if not isinstance(cur, str):
            sys.exit(f'{tag}：{r["path"]} 不是一句台詞')
        if cur == r['new']: continue
        if cur != r['old'] and cur != N(r['old']):
            sys.exit(f'{tag}：{r["path"]} 現在是「{cur}」，不是原句「{r["old"]}」')
        if N(r['new']) != r['new']:
            sys.exit(f'{tag}：{r["path"]} 的新句照 AA_694 的規則會被改掉「……」（{r["new"]}），先問 AA')
        par[key] = r['new']; n += 1
    return json.dumps(o, ensure_ascii=False), n


if AN_STALE:   # X324 以安重寫：同下（芷若那一條）
    sys.exit(f'以安重寫（DLG-FULL-REVIEW-1110）：疊在上面的改句有 {len(AN_STALE)} 列原句還在源稿裡、和改成不一樣（源稿沒對齊，沒寫檔）：\n' + '\n'.join(f'  {l} {loc}「{o}」→「{n}」' for l, loc, o, n in AN_STALE))
if ZQ_STALE:   # X324 子晴重寫：同下（芷若那一條）
    sys.exit(f'子晴重寫（DLG-FULL-REVIEW-1110）：疊在上面的改句有 {len(ZQ_STALE)} 列原句還在源稿裡、和改成不一樣（源稿沒對齊，沒寫檔）：\n' + '\n'.join(f'  {l} {loc}「{o}」→「{n}」' for l, loc, o, n in ZQ_STALE))
if ZR_STALE:   # X324 芷若重寫：原句還在源稿裡的列——源稿沒對齊成遊戲現在的字，不猜（要問 AA：是漏了寫回、還是那一格不重寫要照舊疊）
    sys.exit(f'芷若重寫（DLG-FULL-REVIEW-1110）：疊在上面的改句有 {len(ZR_STALE)} 列原句還在源稿裡、和改成不一樣（源稿沒對齊，沒寫檔）：\n' + '\n'.join(f'  {l} {loc}「{o}」→「{n}」' for l, loc, o, n in ZR_STALE))
# CANON-NO-ECON-1112 第四批（AA_899 表最後一列，企劃線 22f572ef08 定稿、BB_433 採用）：可昕取消約會的第二句「好。我去找（室友的名字）吃宵夜。」→「好。我去找我室友吃宵夜。」
# （室友沒有名字，照總表 ★ 節）。源稿那一格還是舊字＝寫檔前照換；已經是新字＝不動；兩個都不是＝停下來（不猜）
_K899 = (L.get('kexin') or {}).get('cancel')
if isinstance(_K899, list) and len(_K899) > 1 and _K899[1] != '好。我去找我室友吃宵夜。':
    if not (_K899[1].startswith('好。我去找') and _K899[1].endswith('吃宵夜。') and len(_K899[1]) == len('好。我去找') + 2 + len('吃宵夜。')):
        sys.exit(f'AA_899：可昕 cancel[1] 現在是 {_K899[1]!r}，不是稿上的舊句（不猜）')
    _K899[1] = '好。我去找我室友吃宵夜。'
out = {'source': '白名單 ' + '＋'.join(f'{os.path.basename(p)}@{APPROVED[p]}' for p in FILES.values()), 'lines': L, 'prefs': prefs, 'loc': LOC}
dst = os.path.join(ROOT, 'src', 'data', 'date_lines.js')
if '--out' in sys.argv:   # 另存比對用（tests/peishan_dates_1111_unit.js：重匯的結果要和現在的檔一樣）
    dst = sys.argv[sys.argv.index('--out') + 1]
with open(dst, 'w', encoding='utf8') as fo:
    fo.write('/* 校外約會預約系統的句子與交通偏好（DATE-S6；AA_128 4-1、4-3；BB_128 3-6、3-7、AA_127 1-7、2-7、第 8 節、date_prefs_*.json）。'
             '產生器：tools/date/import_date_lines.py（不要手改）。來源：' + out['source'] + (f'＋AA_694@{next(iter(A694.values()))}' if A694 else '') + ' */\n')
    if R630: out['source'] += f'＋AA_630@{R630["sha"]}'; aa630.d14_before_sunset(R630, LOC)
    body = aa630.patch_text(R630, 'src/data/date_lines.js', json.dumps(out, ensure_ascii=False), LOG630)
    if A694:   # AA_694：整份再套一次（AA_127、BB_128 的預約句、AA_537b 芯慈、D14 收尾這些不在 Dxx.json 的），第 3 節的表逐列核對
        P694, S694 = next(iter(A694.items()))
        ok, why = G.allowed(P694, S694, ALLOW)
        if not ok:
            sys.exit('拒絕匯入：' + why)
        md694 = G.read_fix(subprocess.check_output(['git', '-C', ROOT, 'show', f'{S694}:{P694}'], text=True))
        o694 = json.loads(body); src694 = o694['source']
        o694 = deepN(o694); o694['source'] = src694 + f'＋{os.path.basename(P694)}@{S694}'
        allS = []
        def walk694(x):
            if isinstance(x, str): allS.append(x)
            elif isinstance(x, list): [walk694(v) for v in x]
            elif isinstance(x, dict): [walk694(v) for k, v in x.items() if k != 'source']
        walk694(o694); have = set(allS)
        # 源稿後來改寫的列（不是漏換）：AA_694 的舊句、新句都不在，而且改寫後的句子在，才算過
        GONE694 = {'9': ('好。那天我先不排別的。', 'AA_593 第 65 列：BB_128 3-6 學姊取消那句「這一格我空著」改成「那天我先不排別的」，照 AA_694 拿掉「……」；企劃線 9aa8ec40c，AA-B 11-08 06:11')}
        T694 = [[c.strip() for c in ln.strip().strip('|').split('|')] for ln in section(md694, '## 3. ').split('\n') if re.match(r'^\|\s*\d+\s*\|', ln)]
        if len(T694) != 252:
            sys.exit(f'AA_694@{S694} 第 3 節應該是 252 列，讀到 {len(T694)} 列')
        for r in T694:
            if E694.strip(r[1]) != r[2]:
                sys.exit(f'AA_694 第 3 節第 {r[0]} 列：規則算出來是「{E694.strip(r[1])}」，表上是「{r[2]}」')
            if r[2] not in have:
                if r[0] in GONE694 and r[1] not in have and E694.strip(r[1]) not in have and GONE694[r[0]][0] in have:
                    print(f'AA_694 第 3 節第 {r[0]} 列：「{r[2]}」後來改寫成「{GONE694[r[0]][0]}」（{GONE694[r[0]][1]}）'); continue
                if r[2] in PS_GONE and r[1] not in have:   # PEISHAN-VOICE-1110：沛珊的句子，源稿重寫了（只認上面記下來的沛珊的列，別人照舊停下來）
                    PS_SKIP.append(('AA_694 第 3 節第 ' + r[0] + ' 列', '', r[2], '沛珊的句子，新稿重寫了')); continue
                if r[2] in SIS_GONE and r[1] not in have:   # X324：學姊的句子，源稿重寫了（同上，只認上面記下來的學姊的列）
                    SIS_SKIP.append(('AA_694 第 3 節第 ' + r[0] + ' 列', '', r[2], '學姊的句子，新稿重寫了')); continue
                if r[2] in YT_GONE and r[1] not in have:   # X324：語彤的句子，源稿重寫了（只認她上一版有、新稿那一格換掉的句子）
                    YT_SKIP.append(('AA_694 第 3 節第 ' + r[0] + ' 列', '', r[2], '語彤的句子，新稿重寫了')); continue
                if r[2] in KX_GONE and r[1] not in have:   # X324：可昕的句子，源稿重寫了（同上）
                    KX_SKIP.append(('AA_694 第 3 節第 ' + r[0] + ' 列', '', r[2], '可昕的句子，新稿重寫了')); continue
                if r[2] in ZR_GONE and r[1] not in have:   # X324：芷若的句子，源稿重寫了（同上）
                    ZR_SKIP.append(('AA_694 第 3 節第 ' + r[0] + ' 列', '', r[2], '芷若的句子，新稿重寫了')); continue
                if r[2] in ZQ_GONE and r[1] not in have:   # X324：子晴的句子，源稿重寫了（同上）
                    ZQ_SKIP.append(('AA_694 第 3 節第 ' + r[0] + ' 列', '', r[2], '子晴的句子，新稿重寫了')); continue
                if r[2] in AN_GONE and r[1] not in have:   # X324：以安的句子，源稿重寫了（同上；含 AA_594 改成的字——AA_694 的表是照當時遊戲裡的字列的）
                    AN_SKIP.append(('AA_694 第 3 節第 ' + r[0] + ' 列', '', r[2], '以安的句子，新稿重寫了')); continue
                sys.exit(f'AA_694 第 3 節第 {r[0]} 列：「{r[2]}」不在 date_lines.js 裡')
        c694 = E694.counts(allS)
        if any(c694.values()):
            sys.exit('AA_694：還有沒拿掉的「……」' + json.dumps(c694, ensure_ascii=False))
        body = json.dumps(o694, ensure_ascii=False); FILES['fix694'] = P694
        print(f'AA_694@{S694}：第 3 節 252 列都對到；句首／。！？後／）後的「……」＝{c694}')
    if R767:
        body, n767 = apply767(body)
        print(f'AA_767@{S767}：語彤不分地點的短句 6 列（照 path），換了 {n767} 列')
    if R769:
        body, n769 = apply767(body, R769, 'AA_769')
        print(f'AA_769@{S769}：可昕不分地點的短句 7 列（照 path），換了 {n769} 列')
    if R773:
        body, n773 = apply767(body, R773, 'AA_773')
        print(f'AA_773@{S773}：芷若不分地點的短句 9 列（照 path），換了 {n773} 列')
    if R775:
        body, n775 = apply767(body, R775, 'AA_775')
        print(f'AA_775@{S775}：子晴不分地點的短句 5 列（照 path），換了 {n775} 列')
    if R777:
        body, n777 = apply767(body, R777, 'AA_777')
        print(f'AA_777@{S777}：以安不分地點的短句 4 列（照 path），換了 {n777} 列')
    if R780:
        body, n780 = apply767(body, R780, 'AA_780')
        print(f'AA_780@{S780}：以安、子晴、語彤、芷若「第二次當天取消」那一句 5 列（照 path），換了 {n780} 列')
    if A812:
        body, n812 = apply812(body)
        print(f'AA_812@{S812}：懸著的「下次我請」——改稿紀錄 {len(REC812)} 格（照格號：' + '、'.join(f'{os.path.basename(r["rec"])} 第 {r["n"]} 格' for r in REC812) + f'）＋path_rows {len(R812)} 列（照 path），換了 {n812} 格'
              + ''.join(f'；path_rows 跳過 1 列：{p}「{o}」→「{n}」（那一格源稿後來改成「{c}」，{w}）' for p, o, n, c, w in SKIP812))
    # CANON-NO-ECON-1112 第五批（AA_921 §3-1＋§4 放鴿子那一組，企劃線 96c3a668eb，AA-C 11-12 定稿、BB_448 採用）：可昕不排行程表、不記帳、不數次數——不分地點的短句七格照 path 換，
    # 取代 AA_769 那幾列的 new（move3、flaked、leaveEarly）和 BB_128 3-6 的預約句（accept、acceptDating）。排在 AA_812 後面、寫檔前最後一步（old＝那幾層疊完以後的字；對不上＝停下來）。
    # move3、leaveEarly 的新句照 AA_694 拿掉「？」後面的「……」（稿：「又改？……再改，我就自己去。」「來了就走？……好吧。」）。date3d.js 的 S.MORNING.kexin（同一張表最後一列）直接改在那個檔。
    R921 = [
        {'path': 'lines.kexin.accept[0]', 'old': '好。我記到行程表上了。', 'new': '好。那天空給你。'},
        {'path': 'lines.kexin.accept[1]', 'old': '好啊。幾點，我排一下。', 'new': '好啊。幾點？'},
        {'path': 'lines.kexin.acceptDating[0]', 'old': '好。那天我什麼都不排。', 'new': '好。那天不給別人。'},
        {'path': 'lines.kexin.move3[0]', 'old': '第三次了。再改，我就自己去。', 'new': E694.strip('又改？……再改，我就自己去。')},
        {'path': 'lines.kexin.flaked[0][0]', 'old': '我等了四十分鐘。', 'new': '我等了很久。'},
        {'path': 'lines.kexin.flaked[0][1]', 'old': '你欠我一個解釋，還有一頓飯。', 'new': '你要給我一個解釋。'},
        {'path': 'lines.kexin.leaveEarly[0]', 'old': '來了就走？好吧。你欠我一次。', 'new': E694.strip('來了就走？……好吧。')},
    ]
    body, n921 = apply767(body, R921, 'AA_921')
    print(f'AA_921@96c3a668eb：可昕不分地點的短句 {len(R921)} 列（照 path），換了 {n921} 列')
    fo.write("'use strict';\nconst DATE_LINES=" + body + ';\n')
print('AA_630：' + '；'.join(LOG630))
print('wrote', dst, {w: {k: len(v) for k, v in m.items()} for w, m in L.items()}, '偏好', {w: len(m) for w, m in prefs.items()}, '地點', sorted(LOC))
print('AA_373 6-1 改句：' + '；'.join(f'「{o}」→「{n}」{c} 處' for o, n, c in FIXED))
print('AA_359 5-2、5-3 改句：' + '；'.join(f'{l} {w}「{o}」→「{n}」{c} 處' for l, w, o, n, c in FIXED359))
print('AA_524 改句：' + '；'.join(f'{l} {w}「{o}」→「{n}」{c} 處' for l, w, o, n, c in FIXED524))
print('AA_525 1-6、2-4 改句：' + '；'.join(f'{l} {w}「{o}」→「{n}」{c} 處' for l, w, o, n, c in FIXED525))
print(f'沛珊重寫（PEISHAN-VOICE-1110）跳過的改句 {len(PS_SKIP)} 列：' + '；'.join(f'{l} {loc}「{o}」（{why}）' for l, loc, o, why in PS_SKIP))
print(f'學姊重寫（DLG-FULL-REVIEW-1110）跳過的改句 {len(SIS_SKIP)} 列：' + '；'.join(f'{l} {loc}「{o}」（{why}）' for l, loc, o, why in SIS_SKIP))
print(f'語彤重寫（DLG-FULL-REVIEW-1110）跳過的改句 {len(YT_SKIP)} 列（其中 AA_630 第 2 節 {sum(1 for x in YT_SKIP if x[0].startswith("AA_630 "))} 列）：' + '；'.join(f'{l} {loc}「{o}」（{why}）' for l, loc, o, why in YT_SKIP))
print(f'可昕重寫（DLG-FULL-REVIEW-1110）跳過的改句 {len(KX_SKIP)} 列：' + '；'.join(f'{l} {loc}「{o}」（{why}）' for l, loc, o, why in KX_SKIP))
print(f'芷若重寫（DLG-FULL-REVIEW-1110）跳過的改句 {len(ZR_SKIP)} 列：' + '；'.join(f'{l} {loc}「{o}」（{why}）' for l, loc, o, why in ZR_SKIP))
print(f'子晴重寫（DLG-FULL-REVIEW-1110）跳過的改句 {len(ZQ_SKIP)} 列：' + '；'.join(f'{l} {loc}「{o}」（{why}）' for l, loc, o, why in ZQ_SKIP))
print(f'以安重寫（DLG-FULL-REVIEW-1110）跳過的改句 {len(AN_SKIP)} 列（其中 AA_594 第 2-14 節 {sum(1 for x in AN_SKIP if x[0].startswith("AA_594 "))} 列）：' + '；'.join(f'{l} {loc}「{o}」（{why}）' for l, loc, o, why in AN_SKIP))
