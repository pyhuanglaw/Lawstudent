"""CC-B（帳號 B）11-07：A23 燒臘二十三週年瀏覽器抽查（BB-B 23:27；e6f28cbab，src/y34b3d.js 1B-20 的 A23）。判定＝BB。
【前置】使用者 11-07 的 day46 存檔（SAVE46）改到 2028-12-14（四）、補 ROOM_Y2／ROOM_Y3／ROOM_Y4（大二～大四搬宿舍拆箱當作演過，照 pt1107r 第 35 行），交換路線不設美國（EXCHANGE_ROUTE 'TW'）；全部記【前置】。
MODES（逗號分隔，預設 yu,noyu,call），每一種重新讀一次存檔：
  yu    認識學姊＋認識 Alison（yu；存檔沒有就【捷徑】SOCIAL.remember('yu','FIRST_MET')）：18:40 在麵店（noodle）→ 18:45 演 →「（Alison 把手機給大家看。）」
  noyu  認識學姊、不認識 Alison（存檔有就【捷徑】把 yu 的 FIRST_MET 拿掉）→「（有人把手機傳過來給大家看。）」
  call  19:20 在宿舍（認識阿哲）→ 19:30 阿哲打電話，照玩家接（點對話、選第一個）→ 帶到場 → 演
每一種都看：整場沒有語彤（說話的人、句子都沒有「語彤」；立繪 ADV 沒有 heroine_03）、阿哲「……我真的記錯了喔。」、12/14 17:00 以後下雨（G.weather）、JS 例外 0。每一句原文都記。
用法：LW_TESTS=<wt>/tests SAVE46=… [MODES=…] python3 cc_a23_probe.py <url> <out>"""
import os, sys, json, asyncio, time, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = D.J
MODES = [m for m in (os.environ.get('MODES') or 'yu,noyu,call').split(',') if m]
R = L.Run('a23', OUT); D.setup(R, OUT)
SAVE46 = os.environ['SAVE46']
WRAP = "(()=>{ if(GAME._ccSayWrap) return; const f=GAME.say; window.__says=[]; GAME.say=function(who,text,opts){ try{ window.__says.push([who?(typeof who==='string'?who:(who.name||'')):'', String(text), +(+GAME.G.hour).toFixed(3), who&&who.charId?who.charId:(typeof who==='string'?who:null)]); }catch(e){} return f.apply(this,arguments); }; GAME._ccSayWrap=true; })()"


async def run_scene(pg, cdp, tag, max_s=420, idle_end=10):
    t0 = time.time(); quiet = None; picks = []; adv = set()
    while time.time() - t0 < max_s:
        try:
            for c in await pg.evaluate("(()=>{ try{ return (typeof ADV!=='undefined'&&ADV.active&&ADV.shown)?Object.keys(ADV.shown):[]; }catch(e){ return []; } })()"): adv.add(c)
        except Exception: pass
        s = await L.state(pg)
        if s['choices']:
            quiet = None; bs = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.innerText.trim())"); picks.append(bs)
            c = await pg.evaluate("(()=>{ const b=document.querySelector('#choices button'); b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
            await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(900); continue
        if s['dlg']:
            quiet = None
            for _ in range(40):
                if not await pg.evaluate("!!(GAME.D&&GAME.D.typing)"): break
                await pg.wait_for_timeout(250)
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
        if quiet is None: quiet = time.time()
        if time.time() - quiet > idle_end: break
        await pg.wait_for_timeout(500)
    return picks, sorted(adv)


async def setup(pg, cdp, tag, mode):
    sv = json.load(open(SAVE46, encoding='utf-8'))
    d = await pg.evaluate("STORY.dayOfKey('2028-12-14')")
    sv['weekday'] = ((sv.get('weekday', 0) + (d - sv['day'])) % 7 + 7) % 7; sv['day'] = d
    sv['hour'] = 19 + 20 / 60 if mode == 'call' else 18 + 40 / 60
    sv['zone'] = 'dorm' if mode == 'call' else 'noodle'; sv['pos'] = None
    F = sv.setdefault('flags', {}); F.update({'ROOM_Y2': d - 900, 'ROOM_Y3': d - 500, 'ROOM_Y4': d - 120, 'EXCHANGE_ROUTE': 'TW'})
    sv.setdefault('home', {})['at'] = False
    R.setup('%s 【前置】day46 存檔改到 2028-12-14（day %s、weekday %s）%.2f %s；ROOM_Y2／Y3／Y4＝拆箱演過；EXCHANGE_ROUTE TW（不是美國）' % (tag, d, sv['weekday'], sv['hour'], sv['zone']))
    await L.load_state(pg, sv, quiet_phone=True); await pg.wait_for_timeout(5000); await L.close_panels(pg, cdp)
    await pg.evaluate(WRAP); await pg.evaluate("window.__says=[]")
    met = await pg.evaluate("(()=>{ const m=id=>!!(SOCIAL.has&&SOCIAL.has(id,'FIRST_MET')); return {sis:m('heroine_05'), yu:m('yu'), zhe:m('zhe'), yt:m('heroine_03')}; })()")
    R.note('%s 存檔裡認識：%s' % (tag, J(met)))
    if mode == 'yu' and not met['yu']:
        R.setup('%s 【捷徑】SOCIAL.remember(yu, FIRST_MET)（補認識 Alison）' % tag); await pg.evaluate("SOCIAL.remember('yu','FIRST_MET','CC 前置')")
    if mode == 'noyu' and met['yu']:
        R.setup('%s 【捷徑】拿掉 yu 的 FIRST_MET（不認識 Alison）' % tag); await pg.evaluate("(()=>{ const m=GAME.G.social.mem.yu; if(Array.isArray(m)) GAME.G.social.mem.yu=m.filter(x=>(x.tag||x[0]||x)!=='FIRST_MET'); })()")
    met2 = await pg.evaluate("(()=>{ const m=id=>!!(SOCIAL.has&&SOCIAL.has(id,'FIRST_MET')); return {sis:m('heroine_05'), yu:m('yu'), zhe:m('zhe')}; })()")
    R.note('%s 前置後認識：%s；zone %s；天氣 %s' % (tag, J(met2), await pg.evaluate("GAME.G.zone"), J(await pg.evaluate("GAME.G.weather"))))
    return met2


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC A23 燒臘二十三週年：SHA=%s（worktree 實際 %s）；MODES=%s；Playwright 手機模擬 ≠ iPhone' % (os.environ.get('SHA', '?'), real or '?', MODES), flush=True)
    rec = {'sha': real}
    async with async_playwright() as p:
        for mode in MODES:
            tag = '[%s]' % mode
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
            try:
                await cc_det.install(pg, 20261107)
                await pg.goto(URL); ok = await L.wait_loaded(pg)
                if not R.check('%s 遊戲載入' % tag, ok, ''): continue
                await pg.evaluate("localStorage.clear()")
                met = await setup(pg, cdp, tag, mode)
                t0 = time.time()   # 等開演（ANNIV23 有值）：18:45（noodle）或 19:30 電話
                while time.time() - t0 < 400:
                    if await pg.evaluate("(GAME.G.flags||{}).ANNIV23!=null||!!(GAME.D&&GAME.D.active)"): break
                    await pg.wait_for_timeout(1500)
                picks, adv = await run_scene(pg, cdp, tag)
                says = await pg.evaluate("window.__says||[]")
                wx = await pg.evaluate("({w:GAME.G.weather, h:GAME.G.hour, zone:GAME.G.zone, anniv:(GAME.G.flags||{}).ANNIV23})")
                await R.shot(pg, 'a23_' + mode)
                R.note('%s 全部的話（[說的人, 句子, 時, charId]）%d 句：%s' % (tag, len(says), J(says)))
                R.note('%s 選項 %s；ADV 上出現過的人 %s；結束時 %s' % (tag, J(picks), J(adv), J(wx)))
                txt = [x[1] for x in says]
                R.check('%s 演了二十三週年（ANNIV23 有值）' % tag, wx['anniv'] is not None, J(wx))
                R.check('%s 整場沒有語彤（說的人、句子、ADV 立繪）' % tag, not any('語彤' in (x[0] or '') or '語彤' in x[1] or x[3] == 'heroine_03' for x in says) and 'heroine_03' not in adv, J([x for x in says if '語彤' in (x[0] or '') + x[1]]))
                R.check('%s 阿哲「……我真的記錯了喔。」' % tag, '……我真的記錯了喔。' in txt, '')
                if met['sis'] and met['yu']: R.check('%s 認識學姊＋Alison：「（Alison 把手機給大家看。）」' % tag, '（Alison 把手機給大家看。）' in txt and '（有人把手機傳過來給大家看。）' not in txt, '')
                elif met['sis']: R.check('%s 認識學姊、不認識 Alison：「（有人把手機傳過來給大家看。）」' % tag, '（有人把手機傳過來給大家看。）' in txt and '（Alison 把手機給大家看。）' not in txt, '')
                else: R.note('%s 存檔不認識學姊：照片那兩句都不該有' % tag)
                if mode == 'call': R.check('%s 19:30 阿哲打來（說的人有「電話」）' % tag, any('電話' in (x[0] or '') for x in says), J(says[:4]))
                R.check('%s 12/14 晚上下雨（G.weather）' % tag, 'rain' in str(wx['w']).lower() or '雨' in str(wx['w']), J(wx['w']))
                R.check('%s 沒有 JS 例外' % tag, not errs, J(errs[:3]))
                rec[mode] = {'met': met, 'says': says, 'picks': picks, 'adv': adv, 'end': wx}
            except Exception as ex: R.check('%s 探針沒有例外' % tag, False, repr(ex)[:300])
            finally: await b.close()
    json.dump(rec, open(os.path.join(OUT, 'a23.json'), 'w'), ensure_ascii=False, indent=1, default=str)
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
