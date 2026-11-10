"""CC（帳號 A）11-10：ROM-PRIVATE-DATE-1110（BB 11-10 08:1x 排）瀏覽器探針。
開發分支 claude/modest-rubin-2lyp7g：
  新版＝6c7e3918f（選項、送東西、約會的「她的戀愛」不再要朋友以上；人物頁戀愛條；選完說出祐廷那一句）——它前面一個 d7e722c90 是同一件事的前半（單獨約會加戀愛＋信任，invites3d.js）。
  舊版＝13e84dc27（d7e722c90 的上一個 commit，兩個 commit 都還沒進來）。存檔 day51b（tests/fixtures/user_save_day51b_1110.json）是 443fb4a0b 才加的，舊版樹裡沒有：
  依序找 SAVE 環境變數 → LW_TESTS/fixtures → 從 LW_TESTS 那棵樹的 git 物件 `git show 443fb4a0b:tests/fixtures/...`（runner fetch 整條開發分支，物件在）。
用使用者存檔 day51b 測學姊（heroine_05，存檔裡熟悉 67、信任 21、她的戀愛 0＝有點熟、朋友以下）四件：
  a. 單獨約會加戀愛和信任，一天一次（INV：她的戀愛 +1、祐廷的戀愛 +1、信任 +1；同一天第二次見面不再加）
  b. 朋友以下，對話選項（故事線第 1 拍「現在有了。學姊旁邊。」rel {comf:1, npcRom:1}）和送東西（她最喜歡的「無糖綠茶（去冰）」fav rel {trust:2, comf:2, npcRom:1}）也加她的戀愛
  c. 人物頁看得到戀愛條（手機「朋友」→ 學姊 → 戀愛條的寬度＞0）
  d. 劇情選項選完，先說出祐廷選的那一句（對話框名字「祐廷」、字「現在有了。學姊旁邊。」，在她回「學弟，你很敢講。」之前）
流程（真實玩家操作；不用 ?turbo、不瞬移）：
  S1 約會：[前置／捷徑] 讀 day51b（遊戲自己的 GAME.applySave）、日期 +1 天 09:00、清掉舊邀約、清掉學姊的故事線進度（BEATS.heroine_05，從第 1 拍開始）
     → 手機「朋友」→ 學姊「約」→ 念書 → 法律學院圖書館（她回「我已經在那裡」＝不算邀約，換社科圖、總圖、慢讀）→ 今天的時間 →【捷徑】時間撥到約好的前 10 分鐘 → 手機「今天」按「前往」→ 走到她旁邊、對話照實點；
     故事線的選項選「現在有了。學姊旁邊。」→ 演完。看 a、b（選項）、c（演完的人物頁）、d。
     同一天再約一次（喝咖啡 → 2:30 AM）→ 演完：約會那一份（{npcRom:1,rom:1,trust:1}）沒有再加一次（a 的「一天一次」；舊版本來就不加，這一項舊版也 PASS）。
  S2 送東西：[前置／捷徑] 讀 day51b、日期 +1 天、時間撥到學姊在校內某一區的時候（只讀 STORY.whereIs 找）、放到那一區；【捷徑】身上帶一杯「無糖綠茶（去冰）」（＝在便利商店買好帶著，G.carry）
     → 走到她旁邊「和溫書瑀說話」→「送她無糖綠茶（去冰）」→ 對話點完。看 b（送東西）。
  S3 戀愛條單獨看：【捷徑】把她的戀愛改成 15（SOCIAL.rel 直接設，友情不動、還是朋友以下）→ 手機人物頁的戀愛條約 50%（舊版朋友以下一律 0）。
記錄（只記不改）：SOCIAL.adjust 的每一次呼叫（誰、加了什麼）、GAME.say 的每一句（bbplay.say_hook）。
判定：PASS／FAIL／INFO，最後 ALL PASS 或 FAILED n。舊版應該 FAIL 的：A1、B1、B2、C1、C2、D1（A2「一天一次」、前置檢查兩版都 PASS）。
用法：LW_TESTS=<樹>/tests python3 cc_rom_private_probe.py <url> <out>（PC：URL 不加 ?turbo）"""
import os, sys, json, asyncio, time, copy, subprocess
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests'))
import playlib as L
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); import bbplay as P   # bbplay 在上一層（BB 的 test_tools）
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
WHO = 'heroine_05'
FIX = 'tests/fixtures/user_save_day51b_1110.json'
FIX_SHA = '443fb4a0bde0c7e0d760cd6f6f516bfa90cd5cd8'
PICK = '現在有了。學姊旁邊。'
REPLY = '學弟，你很敢講。'
GIFT_ITEM = '無糖綠茶（去冰）'
GO_EARLY = 0.17
J = lambda o: json.dumps(o, ensure_ascii=False)
FAILS = []


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)
    return ok


def info(name, s=''):
    print('INFO ' + name + (('  ' + s) if s else ''), flush=True)


class Run:   # playlib.go_to／bbplay 要的介面
    def __init__(self): self.n = 0
    def note(self, s): print('  ' + s, flush=True)
    def check(self, n, ok, s=''): return check(n, ok, s)
    def setup(self, s): print('  [前置／捷徑] ' + s, flush=True)
    async def shot(self, pg, label):
        self.n += 1; p = os.path.join(OUT, '%02d_%s.png' % (self.n, label))
        try: await pg.screenshot(path=p)
        except Exception as e: print('  screenshot failed', e)
        return p


def load_fixture():
    env = os.environ.get('SAVE')
    if env and os.path.exists(env): return json.load(open(env, encoding='utf-8')), env
    lt = os.environ.get('LW_TESTS')
    if lt:
        p = os.path.join(lt, 'fixtures', os.path.basename(FIX))
        if os.path.exists(p): return json.load(open(p, encoding='utf-8')), p
        r = subprocess.run(['git', '-C', lt, 'show', FIX_SHA + ':' + FIX], capture_output=True)
        if r.returncode == 0: return json.loads(r.stdout.decode('utf-8')), 'git show %s:%s（%s 的物件）' % (FIX_SHA[:9], FIX, lt)
    here = os.path.dirname(os.path.abspath(__file__))
    r = subprocess.run(['git', '-C', here, 'show', FIX_SHA + ':' + FIX], capture_output=True)
    if r.returncode == 0: return json.loads(r.stdout.decode('utf-8')), 'git show %s:%s（探針所在的 repo）' % (FIX_SHA[:9], FIX)
    return None, None


ADJ_HOOK = """(()=>{ if(window.__ADJH) return window.__ADJ.length; window.__ADJH=1; window.__ADJ=[]; const a0=SOCIAL.adjust;
  SOCIAL.adjust=function(id,d){ try{ window.__ADJ.push({id, d:JSON.parse(JSON.stringify(d||{})), day:GAME.G.day, h:+(+GAME.G.hour).toFixed(3)}); }catch(e){} return a0.apply(this,arguments); };
  return 0; })()"""
REL_JS = """(id=>{ const r=SOCIAL.rel(id)||{}; const n=v=>+v||0; return {fam:n(r.fam),trust:n(r.trust),comf:n(r.comf),rom:n(r.rom),npcRom:n(r.npcRom),
  stage:(typeof DATE!=='undefined'&&DATE.stageNum)?DATE.stageNum(id):null, romOk:(typeof SOCIAL.romOk==='function')?SOCIAL.romOk(id):'（沒有 SOCIAL.romOk）',
  day:GAME.G.day, h:+(+GAME.G.hour).toFixed(2)}; })"""
BAR_JS = """(()=>{ const pb=document.getElementById('phoneBody'); if(!pb) return null; const out={};
  for(const el of pb.querySelectorAll('.relbar')){ const tr=el.children[1], fill=tr&&tr.firstElementChild; out[el.dataset.bar]={w:fill?fill.style.width:null, hint:(el.children[2]&&el.children[2].textContent)||''}; }
  return out; })()"""


async def adj_log(pg, n0=0):
    return [x for x in (await pg.evaluate("window.__ADJ||[]"))[n0:] if x['id'] == WHO]


async def hooks(pg):
    await P.init(pg); await P.say_hook(pg); await pg.evaluate(ADJ_HOOK)


async def rel(pg):
    return await pg.evaluate(REL_JS, WHO)


async def opts(pg):
    return await pg.evaluate("[...document.querySelectorAll('#choices:not(.hide) button')].map(b=>({t:(b.textContent||'').trim(),dim:!!(b.disabled||b.classList.contains('dim'))}))")


async def choose(pg, cdp, word, exact_start=False):
    c = await pg.evaluate("((w,s)=>{ const b=[...document.querySelectorAll('#choices button')].find(x=>s?x.textContent.trim().startsWith(w):x.textContent.includes(w)); if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,b.textContent.trim()]; })(%s,%s)" % (J(word), 'true' if exact_start else 'false'))
    if not c: return None
    await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1500); return c


async def settle(pg, cdp, secs=40):
    for _ in range(secs * 2):
        q = await P.ts(pg)
        if q['phone']: await L.phone_away(pg, cdp); await P.phone_close(pg, cdp); continue
        if not q['busy'] and not q['dlg'] and not q['ch'] and q['depth'] == 0: return True
        if q['ch']:
            k, _ = P.pick_of(q['ch'], ()); await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(900); continue
        if q['dlg']: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(500)
    return False


async def person_bar(pg, cdp, tag):
    t = await P.person_page(pg, cdp, WHO)
    b = await pg.evaluate(BAR_JS) if t is not None else None
    await P.phone_close(pg, cdp)
    info('[%s] 人物頁的進度條' % tag, J(b))
    w = ((b or {}).get('戀愛') or {}).get('w')
    try: return (float(w.rstrip('%')) if w else None), b
    except ValueError: return None, b


async def invite_one(pg, cdp, cat, word, tag):
    """手機「朋友」→ 學姊「約」→ 類別 → 地方 → 今天第一個能選的時間。回傳 (邀約清單, 她回的句子, 問題)"""
    await P.phone_tab(pg, cdp, 'friends')
    if await pg.evaluate("!!document.querySelector('#phoneBody [data-personback]')"):
        await L.tap(pg, cdp, '#phoneBody [data-personback]'); await pg.wait_for_timeout(700)
    sel = '#phoneBody [data-inv="%s"]' % WHO
    if not await pg.evaluate("s=>{ const e=document.querySelector(s); if(!e) return false; e.scrollIntoView({block:'center'}); return true; }", sel):
        return None, None, '手機「朋友」沒有學姊的「約」：' + (await pg.evaluate("(document.getElementById('phoneBody')||{}).innerText||''"))[:200]
    await L.tap(pg, cdp, sel); await pg.wait_for_timeout(1500)
    if not await choose(pg, cdp, cat):
        o = await opts(pg); await settle(pg, cdp, 10); return None, None, '類別沒有「%s」：%s' % (cat, J(o))
    if not await choose(pg, cdp, word):
        o = await opts(pg); await settle(pg, cdp, 10); return None, None, '地方沒有「%s」：%s' % (word, J(o))
    o = await opts(pg)
    t = next((x for x in o if x['t'].startswith('今天') and not x['dim']), None)
    if not t:
        await settle(pg, cdp, 10); return None, None, '今天沒有能選的時間：%s' % J(o)
    n0 = len(await pg.evaluate("window.__SAY||[]"))
    await choose(pg, cdp, t['t'], True)
    await settle(pg, cdp, 30)
    rep = await P.said(pg, n0)
    iv = await pg.evaluate("(w=>(GAME.G.invites||[]).filter(v=>v.who===w&&v.day===GAME.G.day&&v.state!=='done').map(v=>({id:v.id,h:v.h,place:v.place,state:v.state})))(%s)" % J(WHO))
    info('[%s] 約 %s %s %s → 她回 %s；邀約 %s' % (tag, cat, word, t['t'], J(rep), J(iv)))
    return iv, rep, None if iv else '沒有排進邀約（她回「她已經在那裡」＝不算邀約，或婉拒）'


async def meet_once(pg, cdp, run, cat, words, tag, pick=None):
    """手機約一次（words 照順序試，她回「我已經在那裡」＝不算邀約、換下一個）、去、演完。回傳 (台詞, 選過的選單, 邀約 id)；約不成回傳 (None, None, None)"""
    iv = None; why = []
    for word in words:
        iv, rep, bad = await invite_one(pg, cdp, cat, word, tag)
        if iv: break
        why.append('%s：%s' % (word, bad))
    if not iv:
        check('[%s] 約成了（%s 試過 %s）' % (tag, cat, J(words)), False, J(why)); return None, None, None
    v = iv[-1]; info('[%s] 約好' % tag, J(v))
    run.setup('[%s] 時間撥到約好的 %.2f 前 10 分鐘（G.hour）' % (tag, v['h']))
    await pg.evaluate("(h=>{ if(GAME.G.hour<h) GAME.G.hour=h; })(%f)" % (v['h'] - GO_EARLY)); await pg.wait_for_timeout(1200)
    await P.phone_tab(pg, cdp, 'today')
    gsel = '#phoneBody [data-invgo="%s"]' % v['id']
    if await pg.evaluate("s=>{ const e=document.querySelector(s); if(!e) return false; e.scrollIntoView({block:'center'}); return true; }", gsel):
        await L.tap(pg, cdp, gsel)
    else:
        info('[%s] 手機「今天」沒有「前往」（可能已經在那一區）：收起手機、直接走去找她' % tag)
        await P.phone_close(pg, cdp)
    picked = []; reopen = 0; t0 = time.time(); seen = []
    while time.time() - t0 < 900:
        q = await P.ts(pg)
        if q['phone']:   # 手機開著會蓋住選單（「直接過去／自己走過去」在手機後面，按了沒反應）：先收起來
            reopen += 1; await L.phone_away(pg, cdp); await P.phone_close(pg, cdp)
            if reopen > 12: break
            continue
        if q['txt'] and (not seen or seen[-1] != [q['name'], q['txt']]): seen.append([q['name'], q['txt']])
        st = await pg.evaluate("(id=>{ const v=(GAME.G.invites||[]).find(x=>String(x.id)===String(id)); return v?{st:v.state, ph:v.lead&&v.lead.ph}:null; })(%s)" % J(v['id']))
        if st and st['st'] in ('done', 'met', 'over') and not q['dlg'] and not q['busy'] and not q['ch'] and q['depth'] == 0: break
        if q['ch']:
            ts = [x['t'] for x in q['ch']]
            k = next((i for i, x in enumerate(ts) if pick and x.startswith(pick)), None)
            if k is None: k, _ = P.pick_of(q['ch'], ())
            picked.append({'opts': ts, 'pick': ts[k]}); print('   [%s] 選單 %s → %s' % (tag, J(ts), ts[k]), flush=True)
            if pick and ts[k].startswith(pick): await run.shot(pg, '%s_pick' % tag)
            await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1200); continue
        if q['dlg']:
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); continue
        if st and (st['ph'] == 'wait' or (st['st'] == 'accepted' and not st['ph'])) and not q['busy']:
            g = await P.who(pg, WHO)
            if g and not g['hidden'] and g['dMe'] > 1.8:
                await L.go_to(pg, cdp, run, g['x'], g['z'], 1.6, '[%s] 走到她旁邊' % tag, max_s=120, lv=g['lv'])
                await pg.wait_for_timeout(800); continue
            if g and g['dMe'] <= 1.8 and ('溫書瑀' in q['lab'] or '學姊' in q['lab']):
                await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1200); continue
        await pg.wait_for_timeout(500)
    st = await pg.evaluate("(id=>{ const v=(GAME.G.invites||[]).find(x=>String(x.id)===String(id)); return v?v.state:null; })(%s)" % J(v['id']))
    info('[%s] 見面結束：邀約 %s；選單 %d 次' % (tag, st, len(picked)), J(seen[-12:]))
    await run.shot(pg, '%s_done' % tag)
    return seen, picked, v['id']


def base_save(S, day, hour, zone, pos):
    s = copy.deepcopy(S); s.pop('_stuck', None); s.pop('_busy', None)
    s.update(day=day['d'], weekday=day['wd'], hour=hour, zone=zone, pos=pos)
    s['invites'] = []
    f = s.setdefault('flags', {}); B = dict(f.get('BEATS') or {}); B.pop(WHO, None); f['BEATS'] = B
    dl = s.get('daily') if isinstance(s.get('daily'), dict) else {}
    dl.pop('romAlone_' + WHO, None); s['daily'] = dl
    s['carry'] = []
    return s


async def next_day(pg, d0):
    return await pg.evaluate("d=>{ const c=CALENDAR.dateOf(d); return {d, key:c.key, wd:c.wd===7?0:c.wd}; }", d0 + 1)


async def s1_date(pg, cdp, run, S, errs):
    print('== S1 約會（a、b 選項、c、d）', flush=True)
    d = await next_day(pg, S['day'])
    s = base_save(S, d, 9.0, S.get('zone') or 'campus', S.get('pos'))
    await P.load(pg, cdp, s, quiet=False); await hooks(pg); await settle(pg, cdp, 30)
    run.setup('讀使用者存檔 day51b（GAME.applySave）；日期改成 day %s %s 09:00、清掉舊邀約、清掉 BEATS.%s（故事線從第 1 拍）、清掉 daily.romAlone_%s' % (d['d'], d['key'], WHO, WHO))
    r0 = await rel(pg); info('S1 讀檔後學姊的關係', J(r0))
    check('S1 前置：學姊在朋友以下（DATE.stageNum＜3），她的戀愛 0', r0['stage'] is not None and r0['stage'] < 3 and r0['npcRom'] == 0, J(r0))
    s0 = len(await pg.evaluate("window.__SAY||[]")); a0 = len(await pg.evaluate("window.__ADJ||[]"))
    seen, picked, _ = await meet_once(pg, cdp, run, '念書', ['法律學院圖書館', '社科圖', '總圖', '慢讀'], 'S1第一次', pick=PICK)
    said = await P.said(pg, s0); adj = await adj_log(pg, a0); r1 = await rel(pg)
    info('S1 GAME.say（見面那一段）', J(said[-24:])); info('S1 SOCIAL.adjust(%s)' % WHO, J(adj)); info('S1 見面後的關係', J(r1))
    got_pick = any(any(x.startswith(PICK) for x in p['opts']) for p in (picked or []))
    check('S1 前置：見面時演到學姊故事線第 1 拍、選單有「%s」' % PICK, got_pick, J([p['opts'] for p in (picked or [])]))
    # d：選完先說祐廷的那一句
    ri = next((i for i, x in enumerate(said) if x[1].startswith(REPLY)), None)
    prev = said[ri - 1] if ri else None
    check('D1 選完先說出祐廷選的那一句（對話框「祐廷：%s」緊接在她回「%s」之前）' % (PICK, REPLY), bool(prev) and prev[1] == PICK and prev[0] == (S.get('name') or '祐廷'), J({'前一句': prev, '她的回覆在第幾句': ri}))
    # b：選項加她的戀愛
    opt_adj = [x for x in adj if x['d'].get('comf') == 1 and 'rom' not in x['d'] and 'trust' not in x['d'] and len(x['d']) <= 2]
    check('B1 朋友以下選「%s」（選項 rel {comf:1, npcRom:1}）：SOCIAL.adjust 收到的有 npcRom:1（舊版在 stage<3 時刪掉）' % PICK, any(x['d'].get('npcRom') == 1 for x in opt_adj), J(opt_adj))
    # a：單獨約會加戀愛和信任
    date_adj = [x for x in adj if x['d'] == {'npcRom': 1, 'rom': 1, 'trust': 1}]
    check('A1 單獨約會（認識／有點熟也算）：SOCIAL.adjust(%s,{npcRom:1,rom:1,trust:1}) 一次；祐廷的戀愛 +1、信任至少 +1' % WHO,
          len(date_adj) == 1 and r1['rom'] - r0['rom'] >= 1 and r1['trust'] - r0['trust'] >= 1, J({'約會那一份': date_adj, 'rom': [r0['rom'], r1['rom']], 'trust': [r0['trust'], r1['trust']]}))
    info('S1 她的戀愛 %s → %s（選項 +1、約會 +1＝新版應該 +2）' % (r0['npcRom'], r1['npcRom']))
    # c：人物頁戀愛條
    w, _ = await person_bar(pg, cdp, 'S1見面後')
    check('C1 見面後手機人物頁看得到戀愛條（寬度＞0%%；她的戀愛 %s）' % r1['npcRom'], w is not None and w > 0, J({'w': w, 'npcRom': r1['npcRom']}))
    # a：一天一次
    a1 = len(await pg.evaluate("window.__ADJ||[]"))
    seen2, picked2, _ = await meet_once(pg, cdp, run, '喝咖啡', ['2:30 AM', '木曜日', 'Café'], 'S1第二次')
    adj2 = await adj_log(pg, a1); r2 = await rel(pg)
    info('S1 第二次 SOCIAL.adjust(%s)' % WHO, J(adj2)); info('S1 第二次見面後的關係', J(r2))
    if seen2 is None:
        check('A2 同一天第二次單獨見面：約得成、演完（才能看一天一次）', False, '第二次約不成＝沒測到')
    else:
        again = [x for x in adj2 if x['d'] == {'npcRom': 1, 'rom': 1, 'trust': 1}]
        check('A2 同一天第二次單獨見面：約會那一份（{npcRom:1,rom:1,trust:1}）沒有再加、祐廷的戀愛不變（一天一次；舊版本來就不加＝兩版都 PASS）', not again and r2['rom'] == r1['rom'], J({'again': again, 'rom': [r1['rom'], r2['rom']]}))
    check('S1 沒有 JS 例外', not errs, J(errs[:3]))


WHERE_JS = """(([hs,ok])=>{ const G=GAME.G, h0=G.hour, out=[]; try{ for(const h of hs){ G.hour=h; const w=STORY.whereIs&&STORY.whereIs(GAME,%s); out.push({h, zone:w&&w.zone||null, away:w&&w.away||null, act:w&&w.act||null}); } } finally { G.hour=h0; }
  return {all:out, pick:out.find(x=>x.zone&&!x.away&&ok.includes(x.zone))||null}; })"""


async def s2_gift(pg, cdp, run, S, errs):
    print('== S2 送東西（b）', flush=True)
    d = await next_day(pg, S['day'])
    s = base_save(S, d, 9.0, S.get('zone') or 'campus', S.get('pos'))
    await P.load(pg, cdp, s, quiet=False); await hooks(pg); await settle(pg, cdp, 30)
    hs = [9.5 + 0.5 * i for i in range(22)]
    ok = ['library', 'library_hall', 'lawlib', 'campus', 'cafe', 'wancai', 'linze', 'soclib', 'wenzhou', 'gongguan']
    w = await pg.evaluate(WHERE_JS % J(WHO), [hs, ok])
    info('S2 學姊那天在哪（只讀 STORY.whereIs）', J(w['all']))
    if not check('S2 前置：學姊那天有在校內／附近某一區的時段', bool(w['pick']), J(w['pick'])): return
    pk = w['pick']
    s = base_save(S, d, pk['h'], pk['zone'], None)
    s['carry'] = [{'n': GIFT_ITEM, 'cat': 'drink', 'day': d['d'], 'shop': '便利商店'}]
    await P.load(pg, cdp, s, quiet=False); await hooks(pg); await settle(pg, cdp, 30)
    run.setup('讀 day51b；day %s %s %.2f 放到 %s（學姊那時候在這一區：%s）；身上帶一杯「%s」（G.carry＝在便利商店買好帶著）' % (d['d'], d['key'], pk['h'], pk['zone'], pk['act'], GIFT_ITEM))
    await P.wait_present(pg, WHO, 90)
    r0 = await rel(pg); info('S2 送之前學姊的關係', J(r0))
    check('S2 前置：學姊在朋友以下（DATE.stageNum＜3）', r0['stage'] is not None and r0['stage'] < 3, J(r0))
    a0 = len(await pg.evaluate("window.__ADJ||[]"))
    r = await P.talk_full(pg, cdp, run, WHO, 'S2送她', picks=('送她' + GIFT_ITEM,))
    adj = await adj_log(pg, a0); r1 = await rel(pg)
    gave = bool(r) and any(p.startswith('送她' + GIFT_ITEM) for p in r.get('picked', []))
    info('S2 SOCIAL.adjust(%s)' % WHO, J(adj)); info('S2 送之後的關係', J(r1))
    if not check('S2 前置：走到學姊旁邊說話、選到「送她%s」' % GIFT_ITEM, gave, J((r or {}).get('opts'))): return
    fav = [x for x in adj if x['d'].get('trust') == 2 and x['d'].get('comf') == 2]
    check('B2 朋友以下送她最喜歡的「%s」（fav rel {trust:2, comf:2, npcRom:1}）：SOCIAL.adjust 收到的有 npcRom:1、她的戀愛 +1（舊版刪掉）' % GIFT_ITEM,
          any(x['d'].get('npcRom') == 1 for x in fav) and r1['npcRom'] - r0['npcRom'] >= 1, J({'fav': fav, 'npcRom': [r0['npcRom'], r1['npcRom']]}))
    await run.shot(pg, 's2_gift_done')
    # S3：戀愛條單獨看
    print('== S3 戀愛條（c，單獨看）', flush=True)
    rr = await pg.evaluate("(id=>{ const r=SOCIAL.rel(id); r.npcRom=15; return {npcRom:r.npcRom, stage:DATE.stageNum(id)}; })(%s)" % J(WHO))
    run.setup('把學姊的戀愛直接設成 15（SOCIAL.rel；友情不動）：%s' % J(rr))
    w2, _ = await person_bar(pg, cdp, 'S3')
    check('C2 朋友以下（第 %s 階）、她的戀愛 15：人物頁戀愛條約 50%%（≥ 40%%；舊版朋友以下一律 0）' % rr['stage'], rr['stage'] < 3 and w2 is not None and w2 >= 40, J({'w': w2}))
    check('S2／S3 沒有 JS 例外', not errs, J(errs[:3]))


async def main():
    os.makedirs(OUT, exist_ok=True); run = Run()
    S, src = load_fixture()
    if not check('找到 day51b 存檔', S is not None, src or '（SAVE、LW_TESTS/fixtures、git show %s 都沒有）' % FIX_SHA[:9]):
        print('FAILED %d' % len(FAILS), flush=True); return 1
    S = S.get('G', S); info('day51b 來源', '%s；day %s %s %.2f' % (src, S.get('day'), S.get('zone'), S.get('hour') or 0))
    async with async_playwright() as p:
        for name, fn in (('S1', s1_date), ('S2', s2_gift)):
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
            try:
                await pg.goto(URL)
                if not check('[%s] 遊戲載入' % name, await L.wait_loaded(pg)): continue
                await fn(pg, cdp, run, S, errs)
            except Exception as e:
                check('[%s] 探針本身沒有例外' % name, False, repr(e)[:300])
                try: await pg.screenshot(path=os.path.join(OUT, 'EXC_%s.png' % name))
                except Exception: pass
            finally:
                await b.close()
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS[:12])), flush=True)
    return 1 if FAILS else 0


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
