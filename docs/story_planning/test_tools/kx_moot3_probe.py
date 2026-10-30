"""BB-C 10-28：KX-MOOT3-1028（可昕最後一場模擬法庭，AA_514 第 1、2 節）＋HEARD-POOL-1028（同學說起女主角）瀏覽器驗收（LAWWW-C 08:21 P2；開發分支 5e19f3cf1 起，lwdev7＝6cd709cb8，含 AA_514 第 4 節 4b0c93bca）。
Node 版是 tests/aa514_kx_moot3_unit.js。判斷都用玩家操作：開手機看訊息、按回覆鍵、時間到跳出的「出發」、點 2D 對話與選項、手機「朋友」的人物頁、和同學說話。
底：使用者存檔 bbtest/p0an/user_day14.json（法律系 day 14；存檔裡和可昕交往中）；改日期時間地點＝【前置】；旗標、關係＝【捷徑】（輸出裡都標）。
條件事件關掉（bbplay.load）；出遊（OUT）、手機規則、2D 出遊事件不受影響。時間：1–2 fps 時遊戲 1 分鐘約 25～75 秒，等時間的地方都跳到前幾分鐘再站著等。沒有用 ?turbo。
注意（LOADGEN-LOCKS-1028，6cd709cb8 還沒修）：出遊的提示或劇情進行中讀檔，鎖會卡住；這支只在沒有對話、沒有提示的時候讀檔。

MODE（環境變數）：
  go    （A1）2027-04-10（六）22:24 宿舍：等到 22:31 → 手機 p:kexin「贏了。…」的回覆鍵選「下次我去看。」→ 她回「好。你坐最後一排，不要讓我看到。」；
          →【前置】同一份進度跳到 2027-11-28（日）20:57：21:00 以前沒有；等到 21:01：三則「禮拜六下午兩點。政大，模擬法庭。」「你說過要來看。」「最後一排。」、回覆鍵「去。」「那天不行。」
          → 按「去。」→「好。不要遲到。」→ 跳到 12/4（六）12:54 記下快照 → 三個選項各一次（同一個快照讀三次、跳到 13:06）：跳出「出發：可昕的模擬法庭（政大）」→ 出發 →
          2D：旁白五句、她兩句、三選一（「妳講得很好。」「我有坐最後一排。」「要不要去吃東西？」）、她回的、最後兩句 → 回來 16:30 →
          手機「朋友」→ 可昕的人物頁有「她最後一場模擬法庭，你坐最後一排」；第一次那一份再跳到 21:24 等到 21:31：沒有「贏了。」那兩則。
  nogo  （A2）每一種都從使用者存檔重讀到 2027-11-28 20:57、【捷徑】KX_WATCH（＝選過「下次我去看。」）：
          a 回「那天不行。」→「好。」；12/4 21:24 還沒有、21:31「贏了。」「大四不比了。這是最後一場。」（沒有「你說要來的。」、沒有回覆鍵）
          b 不回 → 一樣兩則；c 回「去。」、12/4 13:06 跳出「出發」選「不去了」→ 21:31 三則（第一則「你說要來的。」）；
          d 回「去。」、【前置】跳到 12/4 14:33（過了 14:30 沒出發）→ 不跳「出發」、21:31 三則。
  none  （A3）沒有：1 2027-04-10 選「恭喜！」（沒選過）→ 11/28 21:01 沒有約、12/4 21:31 沒有；
          2 【捷徑】KX_WATCH＋朋友、分開（ROM.end，分開以後的一學期）→ 11/28 21:01 沒有約；3 【捷徑】KX_WATCH、分開很久（不在冷卻）、只到有點熟 → 沒有約。
          每一種記 KX_MOOT3_ASK（'x:原因'）當線索。
  chiayi（A4）2027-01-29（五）19:21 宿舍：手機「動態」19:30 以前沒有「嘉義。」；等到 19:31：有照片「一張圓桌，滿滿的菜，…很老的黃狗」和「嘉義。」；
          按留言 →「予樂家？」「嗯。她媽一直夾。」；（快照重讀）按私訊問 →「好吃嗎？」「雞肉飯。我吃了兩碗。予樂說我很不客氣。」
  heard （B）同學說起女主角：認識以後找他說話，第一句就是那一句；時段外對照沒有。CASES＝逗號分隔（預設全部）：
          yx1（芸萱說沛珊，大一上第 10 週星期一 13:30 校園）、yx1_pre（第 9 週星期五：沒有）、ly（晏如說子晴，大一下第 14 週星期一 14:00 Café）、ly_post（第 14 週星期三：沒有）、
          cx2a（晨希，大二上第 14 週星期一 19:30）、cx2a_pre（第 13 週：沒有）、cx2b（大二下第 2 週星期三；星期一 2027-03-01 是假日）、cx3a（大三上第 1 週星期一）、cx3b（2028-06 第一個星期一或三）；
          晨希那幾句不叫「學姊」（AA_514 第 4 節第 3 點）。【捷徑】每一個都認識說話的人和說到的人。
每個 MODE 都查：沒有 JS 例外。「前置：…」FAIL＝情境沒成立，不是遊戲的錯。
估計時間（沒有實測）：go 35～55 分、nogo 30～45 分、none 20～30 分、chiayi 10～15 分、heard 40～60 分（全部）。不要和別的瀏覽器測試同時跑。
用法：LW_TESTS=<工作樹>/tests MODE=go python3 kx_moot3_probe.py '<URL>/index.html' <輸出資料夾> [存檔.json]；SHA＝記錄用"""
import os, sys, json, asyncio, time, copy, math
sys.path.insert(0, os.environ.get('LW_TESTS', 'tests')); sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import playlib as L
import bbplay as B
from playwright.async_api import async_playwright
SP = '/tmp/claude-0/-home-user-Lawstudent/4f52e6f0-1e48-5c03-872f-171d129a03fd/scratchpad'
MODE = os.environ.get('MODE', 'go')
J = B.J
KX, TH = 'kexin', 'p:kexin'
ASK3 = ['禮拜六下午兩點。政大，模擬法庭。', '你說過要來看。', '最後一排。']
NAR = ['（政大的模擬法庭教室。法官席坐著三個學長姊，旁聽席坐了一半。你坐最後一排。）', '（她穿著法袍走進來，沒有往後看。）', '（輪到她。講到第二個爭點，她抬頭看了旁聽席一眼，停了半秒，才接著講。）',
       '（宣判的時候，她們那一組贏了。她只點了一下頭。）', '（散場以後，她在教室門口等。法袍已經脫了，掛在手上。）']
SAW = ['我看到你了。最後一排，左邊數來第三個。', '講到第二個爭點的時候。……差點忘詞。']
OPTS = ['「妳講得很好。」', '「我有坐最後一排。」', '「要不要去吃東西？」']
OPT_R = [['我知道。……第二個爭點那裡，不要再提了。'], ['最後一排沒用。你太好認了。'], ['要。我餓死了。', '（政大後門的麵店。她吃得很快，一句話都沒說，吃完才抬頭。）']]
CLOSE = ['大四不比了。這是最後一場。', '……你有來。好。']
MISSED = ['贏了。', '大四不比了。這是最後一場。']; NOSHOW = '你說要來的。'
MEM = '她最後一場模擬法庭，你坐最後一排'
PREP_KX = """(o)=>{ const G=GAME.G, F=G.flags; F.EXCHANGE_ROUTE='TW'; for(const k of ['KX_WATCH','KX_MOOT3_ASK','KX_MOOT3_GO','KX_MOOT3']) delete F[k]; if(o.watch) F.KX_WATCH=true;
  if(!INV.hasContact(G,'kexin')) INV.addContact(G,'kexin');
  if(o.end&&F.dating_kexin===true) ROM.end(G,'kexin','apart_talk');
  if(o.endLong){ const R=F.romance&&F.romance.kexin, H=(R&&R.history)||[]; for(const e of H) if(e.ev==='end') e.day=STORY.dayOfKey(o.endLong); }
  if(o.rel){ const r=SOCIAL.rel('kexin'); r.fam=o.rel[0]; r.trust=o.rel[1]; r.comf=o.rel[2]; }
  return {dating:F.dating_kexin===true, ex:!!F.EX_kexin, friend:FEED.stageOk(G,'kexin','朋友'), level:SOCIAL.friendLevel('kexin'), cool:FEED.kxCool(G), contact:!!INV.hasContact(G,'kexin'), watch:!!F.KX_WATCH, cond:KXMOOT3.cond(G,true)}; }"""
FLAGS = "(()=>{ const F=GAME.G.flags; return {KX_WATCH:F.KX_WATCH, ASK:F.KX_MOOT3_ASK, GO:F.KX_MOOT3_GO, M3:F.KX_MOOT3, WIN:F.KX_WIN_DM}; })()"


def order(text, items):
    pos = [text.find(x) for x in items]
    return all(p >= 0 for p in pos) and pos == sorted(pos), pos


async def thread(pg, cdp):
    t = await B.phone_thread(pg, cdp, TH); await B.phone_close(pg, cdp); return t


async def ask_at_2100(pg, cdp, run, tag):
    """11/28 20:57 → 等到 21:01；回傳 (20:57 時的對話, 21:01 的對話)"""
    t0 = await thread(pg, cdp)
    ok = await B.wait_hour(pg, cdp, 21.02, max_s=480)
    t1 = await B.phone_thread(pg, cdp, TH)
    run.note('%s：11/28 21:01 %s 對話尾巴 %s；回覆鍵 %s；旗標 %s' % (tag, '等到了' if ok else '沒等到', J(t1['text'][-260:]), J(t1['asks']), J(await pg.evaluate(FLAGS))))
    return t0, t1, ok


async def missed_at_2130(pg, cdp, run, tag, snap=None):
    """跳到 12/4 21:24 → 等到 21:31；回傳 (21:24 的, 21:31 的, 等到沒)"""
    await B.jump(pg, cdp, run, '2027-12-04', 21.4, zone='dorm', pos=None, snap=snap, note=tag)
    t0 = await thread(pg, cdp)
    ok = await B.wait_hour(pg, cdp, 21.52, max_s=480)
    t1 = await B.phone_thread(pg, cdp, TH); await run.shot(pg, 'missed_' + tag); await B.phone_close(pg, cdp)
    return t0, t1, ok


async def depart(pg, cdp, run, tag, pick='出發', max_s=420):
    """等時間到跳出的出遊提示（出發／晚一點／不去了），選開頭是 pick 的那一個；回傳看到的選項（None＝沒跳）"""
    t0 = time.time()
    while time.time() - t0 < max_s:
        s = await B.ts(pg)
        if s['ch'] and any(o['t'].startswith('出發') for o in s['ch']):
            opts = [o['t'] for o in s['ch']]; await run.shot(pg, 'depart_' + tag)
            k = next((i for i, o in enumerate(opts) if o.startswith(pick)), len(opts) - 1)
            run.note('%s：出遊提示 %s → 選「%s」' % (tag, J(opts), opts[k]))
            await B.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1200); return opts
        if s['phone']: await L.phone_away(pg, cdp)
        await pg.wait_for_timeout(1500)
    return None


async def watch_on_410(pg, cdp, run, save, pick):
    st, d = await B.base(pg, save, '2027-04-10', 22.4, 'dorm', flags={'EXCHANGE_ROUTE': 'TW'})
    await B.load(pg, cdp, st)
    run.setup('[前置] 使用者存檔 day 14 → 2027-04-10（六）22:24 宿舍；EXCHANGE_ROUTE＝TW')
    pr = await B.prep(pg, cdp, run, PREP_KX, {}, label='清掉 KX_* 旗標、確定有她的聯絡方式（存檔裡和可昕交往中）')
    run.check('前置：可昕是朋友以上（交往中）、有聯絡方式', pr['friend'] and pr['contact'], J(pr))
    ok = await B.wait_hour(pg, cdp, 22.52, max_s=480)
    t = await B.phone_thread(pg, cdp, TH)
    has3 = [a['t'] for a in t['asks']]
    run.check('4/10 22:31「贏了。」那幾則、回覆鍵三個（恭喜！／上次那個大三的呢？／下次我去看。）', ok and '贏了。' in t['text'] and has3[-3:] == ['恭喜！', '上次那個大三的呢？', '下次我去看。'], J({'等到': ok, 'asks': has3, 'text': t['text'][-200:]}))
    await B.phone_close(pg, cdp)
    after = await B.phone_answer(pg, cdp, TH, pick)
    await run.shot(pg, 'kx_win_' + ('watch' if pick == '下次我去看。' else 'other')); await B.phone_close(pg, cdp)
    return after


# ---------------- A1 ----------------
async def mode_go(pg, cdp, run, save):
    after = await watch_on_410(pg, cdp, run, save, '下次我去看。')
    run.check('A1 4/10 選「下次我去看。」→ 她回「好。你坐最後一排，不要讓我看到。」', bool(after) and '好。你坐最後一排，不要讓我看到。' in after, J((after or '(沒有那個鍵)')[-200:]))
    await B.jump(pg, cdp, run, '2027-11-28', 20.95, zone='dorm', pos=None)
    t0, t1, ok = await ask_at_2100(pg, cdp, run, 'A1')
    good, pos = order(t1['text'], ASK3)
    run.check('A1 11/28（日）20:57 還沒有；21:01 三則照順序、回覆鍵「去。」「那天不行。」', ok and not any(x in t0['text'] for x in ASK3) and good and [a['t'] for a in t1['asks']][-2:] == ['去。', '那天不行。'], J({'pos': pos, 'asks': t1['asks']}))
    await run.shot(pg, 'A1_ask'); await B.phone_close(pg, cdp)
    after = await B.phone_answer(pg, cdp, TH, '去。')
    run.check('A1 回「去。」→「好。不要遲到。」', bool(after) and '好。不要遲到。' in after, J((after or '(沒有那個鍵)')[-160:]))
    await B.phone_close(pg, cdp)
    await B.jump(pg, cdp, run, '2027-12-04', 12.9, zone='dorm', pos=None, note='記下快照')
    today = await B.phone_tab(pg, cdp, 'today'); await B.phone_close(pg, cdp)
    run.check('A1 12/4 手機「今天」列出可昕的模擬法庭（政大）', '模擬法庭' in today, J(today[:300]))
    S1 = await B.snapshot(pg)
    for k in range(3):
        await B.jump(pg, cdp, run, '2027-12-04', 13.1, zone='dorm', pos=None, snap=S1, note='12/4 快照（第 %d 次讀）' % (k + 1))
        opts = await depart(pg, cdp, run, 'A1-%d' % (k + 1))
        run.check('A1-%d 13:06 跳出「出發：可昕的模擬法庭（政大）」（還有「晚一點」「不去了」）' % (k + 1), bool(opts) and any('可昕的模擬法庭' in o for o in opts) and len(opts) == 3, J(opts))
        if not opts: continue
        r = await B.dialog(pg, cdp, run, picks=[OPTS[k]], max_s=420, start_s=40, idle_s=6, tag='A1-%d 模擬法庭' % (k + 1), shots=(k == 0))
        got = [l[1] for l in r['lines']]
        want = NAR + SAW + OPT_R[k] + CLOSE
        pos = [got.index(t) if t in got else -1 for t in want]
        run.check('A1-%d 選 %s：旁白五句、她兩句、三選一、%s、最後兩句（照稿、照順序）' % (k + 1, OPTS[k], '「要。我餓死了。」＋麵店的旁白' if k == 2 else '她回的那一句'),
                  all(p >= 0 for p in pos) and pos == sorted(pos) and any(o[:3] == OPTS for o in r['opts']), J({'pos': pos, 'opts': r['opts'], 'got': got[:16]}))
        others = [t for j, R in enumerate(OPT_R) if j != k for t in R]
        run.check('A1-%d 沒有別的選項的回答' % (k + 1), not any(t in got for t in others), J([t for t in others if t in got]))
        c = await B.clock(pg)
        run.check('A1-%d 回來是 12/4 16:30' % (k + 1), c['key'] == '2027-12-04' and abs(c['h'] - 16.5) < 0.1, J(c))
        pgt = await B.person_page(pg, cdp, KX)
        await run.shot(pg, 'A1_%d_person' % (k + 1)); await B.phone_close(pg, cdp)
        run.check('A1-%d 手機「朋友」→ 可昕的人物頁有「%s」' % (k + 1, MEM), bool(pgt) and MEM in pgt, J((pgt or '(朋友清單裡沒有她)')[:400]))
        if k == 0:
            t0, t1, ok2 = await missed_at_2130(pg, cdp, run, 'A1 來了以後')
            run.check('A1 有來的：12/4 21:31 沒有「贏了。」「大四不比了。…」那兩則', ok2 and not ('贏了。' in t1['text'][-200:] and MISSED[1] in t1['text']), J(t1['text'][-200:]))


# ---------------- A2 ----------------
async def at_ask(pg, cdp, run, save, tag):
    st, d = await B.base(pg, save, '2027-11-28', 20.95, 'dorm', flags={'EXCHANGE_ROUTE': 'TW'})
    await B.load(pg, cdp, st)
    pr = await B.prep(pg, cdp, run, PREP_KX, {'watch': True}, label='%s：11/28 20:57 宿舍、KX_WATCH（＝選過「下次我去看。」）' % tag)
    t0, t1, ok = await ask_at_2100(pg, cdp, run, tag)
    run.check('%s 前置：21:01 收到約（三則、回覆鍵）' % tag, ok and order(t1['text'], ASK3)[0] and len(t1['asks']) >= 2, J({'pr': pr, 'asks': t1['asks']}))
    await B.phone_close(pg, cdp)


async def mode_nogo(pg, cdp, run, save):
    # a 那天不行
    await at_ask(pg, cdp, run, save, 'A2a')
    after = await B.phone_answer(pg, cdp, TH, '那天不行。'); await B.phone_close(pg, cdp)
    run.check('A2a 回「那天不行。」→ 她回「好。」', bool(after) and after.rstrip().endswith('好。'), J((after or '')[-120:]))
    t0, t1, ok = await missed_at_2130(pg, cdp, run, 'A2a')
    good, pos = order(t1['text'], MISSED)
    run.check('A2a 12/4 21:24 還沒有；21:31 兩則「贏了。」「大四不比了。這是最後一場。」、沒有「你說要來的。」、沒有回覆鍵', ok and not (MISSED[1] in t0['text']) and good and NOSHOW not in t1['text'] and not t1['asks'], J({'pos': pos, 'asks': t1['asks'], 'flags': await pg.evaluate(FLAGS)}))
    # b 不回
    await at_ask(pg, cdp, run, save, 'A2b')
    t0, t1, ok = await missed_at_2130(pg, cdp, run, 'A2b')
    good, pos = order(t1['text'], MISSED)
    run.check('A2b 不回：12/4 21:31 一樣兩則、沒有「你說要來的。」', ok and good and NOSHOW not in t1['text'], J({'pos': pos, 'flags': await pg.evaluate(FLAGS)}))
    # c 去。→ 不去了
    await at_ask(pg, cdp, run, save, 'A2c')
    await B.phone_answer(pg, cdp, TH, '去。'); await B.phone_close(pg, cdp)
    await B.jump(pg, cdp, run, '2027-12-04', 13.1, zone='dorm', pos=None)
    opts = await depart(pg, cdp, run, 'A2c', pick='不去了')
    run.check('A2c 12/4 13:06 跳出「出發」→ 選「不去了」', bool(opts) and any(o.startswith('不去了') for o in opts), J(opts))
    await B.dialog(pg, cdp, run, max_s=60, start_s=3)
    t0, t1, ok = await missed_at_2130(pg, cdp, run, 'A2c')
    good, pos = order(t1['text'], [NOSHOW] + MISSED)
    run.check('A2c 回了「去。」卻選「不去了」：21:31 三則（「你說要來的。」在前面）', ok and good, J({'pos': pos, 'flags': await pg.evaluate(FLAGS)}))
    # d 去。→ 過了 14:30
    await at_ask(pg, cdp, run, save, 'A2d')
    await B.phone_answer(pg, cdp, TH, '去。'); await B.phone_close(pg, cdp)
    await B.jump(pg, cdp, run, '2027-12-04', 14.55, zone='dorm', pos=None, note='過了 14:30 還沒出發')
    opts = await depart(pg, cdp, run, 'A2d', max_s=40)
    run.check('A2d 14:33：不再跳「出發」', not opts, J(opts))
    await B.dialog(pg, cdp, run, max_s=60, start_s=3)
    t0, t1, ok = await missed_at_2130(pg, cdp, run, 'A2d')
    good, pos = order(t1['text'], [NOSHOW] + MISSED)
    run.check('A2d 回了「去。」、過了 14:30 沒出發：21:31 三則（「你說要來的。」在前面）', ok and good, J({'pos': pos, 'flags': await pg.evaluate(FLAGS)}))


# ---------------- A3 ----------------
async def no_ask(pg, cdp, run, tag, check_missed=True):
    t0, t1, ok = await ask_at_2100(pg, cdp, run, tag)
    run.check('%s：11/28 21:01 沒有約（%s）' % (tag, J((await pg.evaluate(FLAGS))['ASK'])), ok and not any(x in t1['text'] for x in ASK3) and not any(a['t'] == '去。' for a in t1['asks']), J(t1['text'][-200:]))
    await B.phone_close(pg, cdp)
    if check_missed:
        a, b, ok2 = await missed_at_2130(pg, cdp, run, tag)
        run.check('%s：12/4 21:31 也沒有「大四不比了。…」' % tag, ok2 and MISSED[1] not in b['text'], J(b['text'][-200:]))


async def mode_none(pg, cdp, run, save):
    after = await watch_on_410(pg, cdp, run, save, '恭喜！')
    run.check('A3-1 前置：4/10 選「恭喜！」→「嗯。……我等一下再開心。現在先睡。」', bool(after) and '嗯。……我等一下再開心。現在先睡。' in after, J((after or '')[-160:]))
    await B.jump(pg, cdp, run, '2027-11-28', 20.95, zone='dorm', pos=None)
    await no_ask(pg, cdp, run, 'A3-1 沒選過「下次我去看。」')
    st, d = await B.base(pg, save, '2027-11-28', 20.95, 'dorm', flags={'EXCHANGE_ROUTE': 'TW'})
    await B.load(pg, cdp, st)
    pr = await B.prep(pg, cdp, run, PREP_KX, {'watch': True, 'end': True, 'rel': [45, 30, 10]}, label='A3-2：KX_WATCH、朋友、今天分開（ROM.end）＝分開以後的一學期')
    run.check('A3-2 前置：kxCool true、朋友', pr['cool'] and pr['level'] in ('FRIEND', 'CLOSE_FRIEND'), J(pr))
    await no_ask(pg, cdp, run, 'A3-2 分開以後的一學期', check_missed=False)
    st, d = await B.base(pg, save, '2027-11-28', 20.95, 'dorm', flags={'EXCHANGE_ROUTE': 'TW'})
    await B.load(pg, cdp, st)
    pr = await B.prep(pg, cdp, run, PREP_KX, {'watch': True, 'end': True, 'endLong': '2026-12-01', 'rel': [25, 0, 0]}, label='A3-3：KX_WATCH、分開在 2026-12-01（不在冷卻）、只到有點熟')
    run.check('A3-3 前置：不在冷卻、不是朋友也沒有交往', not pr['cool'] and not pr['friend'] and not pr['dating'], J(pr))
    await no_ask(pg, cdp, run, 'A3-3 朋友以下', check_missed=False)


# ---------------- A4 ----------------
P4B = dict(pic='一張圓桌，滿滿的菜，桌腳旁邊趴著一隻很老的黃狗', say='嘉義。', cm=['予樂家？', '嗯。她媽一直夾。'], dm=['好吃嗎？', '雞肉飯。我吃了兩碗。予樂說我很不客氣。'])


async def mode_chiayi(pg, cdp, run, save):
    st, d = await B.base(pg, save, '2027-01-29', 19.35, 'dorm', flags={'EXCHANGE_ROUTE': 'TW'})
    await B.load(pg, cdp, st)
    run.setup('[前置] 使用者存檔 day 14 → 2027-01-29（五）19:21 宿舍（存檔裡和可昕交往中）')
    f0 = await B.phone_tab(pg, cdp, 'feed'); await B.phone_close(pg, cdp)
    ok = await B.wait_hour(pg, cdp, 19.52, max_s=480)
    S = await B.snapshot(pg)
    f1 = await B.phone_tab(pg, cdp, 'feed'); await run.shot(pg, 'A4_feed')
    run.check('A4 1/29 19:21 動態還沒有；19:31 有可昕的照片（%s）和「嘉義。」' % P4B['pic'], ok and P4B['pic'] not in f0 and P4B['pic'] in f1 and '嘉義。' in f1, J({'等到': ok, 'f1': f1[:400]}))
    for kind in ('cm', 'dm'):
        if kind == 'dm': await B.jump(pg, cdp, run, '2027-01-29', 19.55, snap=S, note='同一個快照（還沒回應）'); await B.phone_tab(pg, cdp, 'feed')
        sel = '#phoneBody [data-fd="kx4bc|%s"]' % kind
        okb = await L.tap(pg, cdp, sel); await pg.wait_for_timeout(1500)
        fd = await pg.evaluate("(document.getElementById('phoneBody')||{}).innerText||''")   # 動態頁（留言可能顯示在動態下面）
        t = await B.phone_thread(pg, cdp, TH)
        g1, pos = order(t['text'], P4B[kind]); g2, pos2 = order(fd, P4B[kind])
        run.check('A4 按%s → %s（她的對話或動態頁）' % ('留言' if kind == 'cm' else '私訊問', '／'.join(P4B[kind])), okb and (g1 or g2), J({'按到': okb, 'thread': pos, 'feed': pos2, 'text': t['text'][-200:]}))
        await run.shot(pg, 'A4_' + kind); await B.phone_close(pg, cdp)


# ---------------- B 同學說起女主角 ----------------
CASES = {
    'yx1': dict(who='pool_15', about='classmate_peishan', when=['Y1S1', 10, 1], h=13.5, zone='campus', t='沛珊交了一份她沒修的課的報告。老師在最後問她為什麼不修。我覺得那是今年最好的問題。', say=True),
    'yx1_pre': dict(who='pool_15', about='classmate_peishan', when=['Y1S1', 9, 5], h=13.5, zone='campus', t='沛珊交了一份她沒修的課的報告。老師在最後問她為什麼不修。我覺得那是今年最好的問題。', say=False),
    'ly': dict(who='pool_5', about='heroine_04', when=['Y1S2', 14, 1], h=14.0, zone='cafe', t='子晴叫晨希站她旁邊。晨希緊張到一直喝水。', say=True),
    'ly_post': dict(who='pool_5', about='heroine_04', when=['Y1S2', 14, 3], h=14.0, zone='cafe', t='子晴叫晨希站她旁邊。晨希緊張到一直喝水。', say=False),
    'cx2a': dict(who='pool_11', about='heroine_04', when=['Y2S1', 14, 1], h=19.5, zone='campus', t='我按不出 C，子晴來教。她教了十分鐘，學妹就會了。我學了一學期。', say=True),
    'cx2a_pre': dict(who='pool_11', about='heroine_04', when=['Y2S1', 13, 1], h=19.5, zone='campus', t='我按不出 C，子晴來教。她教了十分鐘，學妹就會了。我學了一學期。', say=False),
    'cx2b': dict(who='pool_11', about='heroine_04', when=['Y2S2', 2, 3], h=19.5, zone='campus', t='子晴當器材長以後，社辦的導線都貼了名字。我借走的那條，標籤寫『晨希 還來』。', say=True),
    'cx3a': dict(who='pool_11', about='heroine_04', when=['Y3S1', 1, 1], h=19.5, zone='campus', t='子晴回來看社課，第一件事是去數導線。', say=True),
    'cx3b': dict(who='pool_11', about='heroine_04', when={'from': '2028-06-01', 'wd': [1, 3]}, h=19.5, zone='campus', t='子晴畢業前，把社辦每一條導線都檢查了一次。我的那條，標籤還在。', say=True),
}
PREP_HEARD = """([who,about])=>{ const G=GAME.G; G.flags.EXCHANGE_ROUTE='TW'; for(const id of [who,about]) if(!SOCIAL.has(id,'FIRST_MET')) SOCIAL.meet(id,G.zone); const r=SOCIAL.rel(who); r.fam=Math.max(r.fam||0,25); r.trust=Math.max(r.trust||0,3);
  return {who:SOCIAL.stage(who), about:STORY.knows?!!STORY.knows(about,G):SOCIAL.has(about,'FIRST_MET'), due:HEARD.talkDue?((HEARD.talkDue(G,who)||{}).id||null):null}; }"""


async def mode_heard(pg, cdp, run, save):
    names = [c for c in (os.environ.get('CASES') or ','.join(CASES)).split(',') if c]
    for nm in names:
        c = CASES.get(nm)
        if not c: run.check('CASES 裡的 %s 不認得' % nm, False); continue
        st, d = await B.base(pg, save, c['when'], c['h'], c['zone'], flags={'EXCHANGE_ROUTE': 'TW'})
        await B.load(pg, cdp, st)
        run.setup('[前置] %s：使用者存檔 → %s（%s 第 %s 週，星期%s）%.2f %s' % (nm, d['key'], d['term'], d['week'], d['wd'], c['h'], c['zone']))
        pr = await B.prep(pg, cdp, run, PREP_HEARD, [c['who'], c['about']], label='%s：認識 %s、%s' % (nm, c['who'], c['about']))
        w = await B.wait_present(pg, c['who'], max_s=60)
        run.check('%s 前置：%s 在這一區（作息）、說到的人認識' % (nm, c['who']), bool(w and not w['hidden']) and pr['about'], J({'who': w, 'pr': pr}))
        if not w: continue
        await B.place_near(pg, run, w['x'], w['z'], 6, what=c['who'])
        r = await B.talk_to(pg, cdp, run, c['who'], 'B %s' % nm, picks=())
        lines = r['lines'] if r else []
        if c['say']:
            run.check('B %s 找他說話：第一句「%s」' % (nm, c['t']), bool(lines) and lines[0][1] == c['t'], J(lines[:3]))
        else:
            run.check('B %s（時段外）：沒有「%s」' % (nm, c['t'][:12]), bool(r) and not any(l[1] == c['t'] for l in lines), J(lines[:3]))
        if c['who'] == 'pool_11': run.check('B %s 晨希那句不叫「學姊」' % nm, '學姊' not in c['t'] and not any('子晴學姊' in l[1] for l in lines[:1]), J(lines[:1]))
        await run.shot(pg, 'B_' + nm)


async def main():
    URL, OUT = sys.argv[1], sys.argv[2]
    SAVEF = sys.argv[3] if len(sys.argv) > 3 else SP + '/bbtest/p0an/user_day14.json'
    save = json.load(open(SAVEF, encoding='utf-8'))
    run = L.Run('kx_moot3_' + MODE, OUT); os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg)); await pg.evaluate("localStorage.clear()")
        run.note('helpers %s' % await B.init(pg))
        fn = {'go': mode_go, 'nogo': mode_nogo, 'none': mode_none, 'chiayi': mode_chiayi, 'heard': mode_heard}.get(MODE)
        if fn: await fn(pg, cdp, run, save)
        else: run.check('MODE 要是 go／nogo／none／chiayi／heard', False, MODE)
        run.check('沒有 JS 例外', not errs, J(errs[:3]))
        print('SHA', os.environ.get('SHA', '?'), 'MODE', MODE)
        await b.close()
    sys.exit(run.finish())


if __name__ == '__main__':
    asyncio.run(main())
