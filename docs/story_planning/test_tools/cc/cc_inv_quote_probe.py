"""CC-B（帳號 B）11-08：邀約台詞拿掉「」（AA-B 00:21；LAWWW-B bfb95c564）抽看。判定＝BB。
【前置】使用者 11-07 的 day46 存檔（SAVE46），WHO（預設 heroine_01 以安）。三段，每段的對話框都截圖、記名字欄和整句：
  A 手機約：打開手機「朋友」→ 點她的「約」（data-inv，和玩家點的同一個按鈕）→ 吃飯／喝咖啡 → 第一個能選的地點 → 第一個能選的時間 → 她在手機上的回覆
  B 當面約、現在一起過去：STORY.whereIs 找她今天在哪【前置：跳時間、GAME.enter 那一區】→ 走到她旁邊、按「說話」→ 約 → 吃飯／喝咖啡 → 現在一起過去 → 一起走的字幕（GAME.caption 也記）→ 到了開場那一句
判定：有名字的那一句（名字欄非空）文字外面沒有「」；名字欄有名字。旁白（名字欄空）不算。另外記下「」還在的句子（AA 說 invite_replies.js、invite_place_lines.js 還有，記哪一句、誰說的）。
用法：LW_TESTS=<wt>/tests SAVE46=… [WHO=heroine_01] [CATS=吃飯,喝咖啡] python3 cc_inv_quote_probe.py <url> <out>"""
import os, sys, json, asyncio, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = D.J
R = L.Run('inv_quote', OUT); D.setup(R, OUT)
SAVE46 = os.environ['SAVE46']; WHO = os.environ.get('WHO') or 'heroine_01'
CATS = (os.environ.get('CATS') or '吃飯,喝咖啡').split(',')
WRAP = """(()=>{ if(GAME._ccQW) return; window.__says=[]; const f=GAME.say, c=GAME.caption;
  GAME.say=function(who,text){ try{ window.__says.push({k:'say', who:who?(typeof who==='string'?who:(who.name||'')):'', t:String(text), h:+(+GAME.G.hour).toFixed(2), zone:GAME.G.zone}); }catch(e){} return f.apply(this,arguments); };
  if(c) GAME.caption=function(who,text){ try{ window.__says.push({k:'cap', who:who||'', t:String(text), h:+(+GAME.G.hour).toFixed(2), zone:GAME.G.zone}); }catch(e){} return c.apply(this,arguments); };
  GAME._ccQW=true; })()"""
NAMEBOX = "(()=>{ const D=GAME.D, w=D&&D.who; const nb=[...document.querySelectorAll('#dlgName,#dlgWho,.dlgName,#dlg .name')].find(e=>e.offsetParent); return {who:w?(typeof w==='string'?w:(w.name||'')):'', full:(D&&D.full)||'', nameBox:nb?nb.innerText.trim():null, text:((document.getElementById('dlgText')||{}).innerText||'').trim()}; })()"


async def drive(pg, cdp, tag, prefs, max_s=240, idle_end=6, shots=6):
    """點完對話、照 prefs 選選項；每一句有名字的對話框截圖（最多 shots 張）。回傳 lines、choices"""
    out = {'lines': [], 'choices': [], 'picked': [], 'shots': []}; t0 = time.time(); quiet = None
    while time.time() - t0 < max_s:
        s = await L.state(pg)
        if s['choices']:
            quiet = None; bs = await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>({t:b.innerText.trim(), dim:b.classList.contains('dim')||b.disabled||/dim/.test(b.className)}))")
            out['choices'].append([b['t'] for b in bs])
            k = None
            for w in prefs:
                k = next((i for i, b in enumerate(bs) if w in b['t'] and not b['dim']), None)
                if k is not None: break
            if k is None: k = next((i for i, b in enumerate(bs) if not b['dim'] and not any(x in b['t'] for x in ('就這樣', '算了', '不約', '取消', '回上一層'))), 0)
            c = await pg.evaluate("(i=>{ const b=document.querySelectorAll('#choices button')[i]; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })", k)
            await L.touch_tap(cdp, c[0], c[1]); out['picked'].append(bs[k]['t']); await pg.wait_for_timeout(900); continue
        if s['dlg']:
            quiet = None
            for _ in range(40):
                if not await pg.evaluate("!!(GAME.D&&GAME.D.typing)"): break
                await pg.wait_for_timeout(250)
            nb = await pg.evaluate(NAMEBOX)
            line = [nb['who'], nb['full'] or nb['text']]
            if line[1] and (not out['lines'] or out['lines'][-1] != line):
                out['lines'].append(line)
                if nb['who'] and len(out['shots']) < shots:
                    nm = 'q_%s_%d' % (tag.strip('[]').replace(' ', '_'), len(out['shots']) + 1); await R.shot(pg, nm); out['shots'].append([nm, nb])
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
        if quiet is None: quiet = time.time()
        if time.time() - quiet > idle_end: break
        await pg.wait_for_timeout(400)
    R.note('%s 對話 %d 句：%s；選項 %s → %s；截圖 %s' % (tag, len(out['lines']), J(out['lines']), J(out['choices']), J(out['picked']), J(out['shots'])))
    return out


def judge(tag, says):
    named = [x for x in says if x['who'] and x['k'] == 'say']
    quoted = [x for x in named if x['t'].startswith('「') or x['t'].endswith('」')]
    R.note('%s 有名字的句子 %d：%s' % (tag, len(named), J([[x['who'], x['t']] for x in named])))
    R.note('%s 字幕：%s' % (tag, J([[x['who'], x['t']] for x in says if x['k'] == 'cap'])))
    R.check('%s 有名字的句子至少一句' % tag, bool(named), J(says[:6]))
    R.check('%s 有名字的句子外面沒有「」' % tag, not quoted, J([[x['who'], x['t']] for x in quoted]))
    capq = [x for x in says if x['k'] == 'cap' and x['who'] and (x['t'].startswith('「') or x['t'].endswith('」'))]
    if capq: R.note('%s 有名字的字幕還有「」：%s' % (tag, J([[x['who'], x['t']] for x in capq])))
    anyq = [x for x in says if '「' in x['t']]
    if anyq: R.note('%s 句子裡還有「（含旁白、引用）：%s' % (tag, J([[x['k'], x['who'], x['t']] for x in anyq])))


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC 邀約「」抽看：SHA=%s（worktree 實際 %s）；WHO=%s；Playwright 手機模擬 ≠ iPhone' % (os.environ.get('SHA', '?'), real or '?', WHO), flush=True)
    rec = {'sha': real, 'who': WHO}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, 20261108)
        await pg.goto(URL); ok = await L.wait_loaded(pg)
        if R.check('遊戲載入', ok, ''):
            await pg.evaluate("localStorage.clear()")
            sv = json.load(open(SAVE46, encoding='utf-8'))
            # A 手機約：存檔原本的日子；時間挑早上 9:00（今天還有時段可選）
            sv['hour'] = 9.0; sv['pos'] = None
            R.setup('[A 手機約] 【前置】day46 存檔（day %s），時間改 9:00、%s' % (sv.get('day'), sv.get('zone')))
            await L.load_state(pg, sv, quiet_phone=True); await pg.wait_for_timeout(6000); await L.close_panels(pg, cdp)
            await pg.evaluate(WRAP)
            try:
                st = await pg.evaluate("(id=>({contact:INV.hasContact?INV.hasContact(GAME.G,id):null, can:INV.canInvite?INV.canInvite(GAME.G,id):null, why:INV.whyNot?INV.whyNot(GAME.G,id):null, knows:STORY.knows(id,GAME.G)}))", WHO)
                R.note('[A 手機約] %s：%s' % (WHO, J(st)))
                await pg.evaluate("window.__says=[]")
                await pg.evaluate("GAME.openPhone('friends')"); await pg.wait_for_timeout(1500)
                has_btn = await pg.evaluate("(id=>{ const b=document.querySelector('[data-inv=\"'+id+'\"]'); if(!b) return false; b.scrollIntoView({block:'center'}); return true; })", WHO)
                await R.shot(pg, 'A_phone_friends')
                if R.check('[A 手機約] 手機「朋友」頁有她的「約」按鈕（data-inv）', has_btn, ''):
                    await L.tap(pg, cdp, '[data-inv="%s"]' % WHO); await pg.wait_for_timeout(1200)
                    a = await drive(pg, cdp, '[A 手機約]', CATS + ['今天', '明天'], max_s=200)
                    says = await pg.evaluate("window.__says||[]"); rec['A'] = {'drive': a, 'says': says}
                    judge('[A 手機約]', says)
                    ivs = await pg.evaluate("(GAME.G.invites||[]).slice(-2)"); R.note('[A 手機約] 約好的：%s' % J(ivs))
                    rec['A']['iv'] = ivs
            except Exception as ex: R.check('[A 手機約] 探針沒有例外', False, repr(ex)[:300])
            # B 當面約、現在一起過去
            try:
                await pg.evaluate("GAME.closePhone&&GAME.closePhone()")
                found = None
                for h in (10.0, 12.5, 15.0, 17.0, 19.0):
                    await pg.evaluate("(h=>{ GAME.G.hour=h; })", h)
                    w = await pg.evaluate("(id=>{ try{ const w=STORY.whereIs(GAME,id); return w?JSON.parse(JSON.stringify(w)):null; }catch(e){ return {err:String(e)}; } })", WHO)
                    R.note('[B 當面] %.1f STORY.whereIs：%s' % (h, J(w)))
                    if w and w.get('zone') and not w.get('err'): found = (h, w); break
                if R.check('[B 當面] 找得到她今天在哪', bool(found), ''):
                    h, w = found
                    R.setup('[B 當面] 【前置】時間 %.1f、GAME.enter(%s)' % (h, w['zone']))
                    await pg.evaluate("(z=>GAME.enter(z))", w['zone']); await D.wait_zone(pg, cdp, w['zone'], max_s=40); await pg.wait_for_timeout(5000)
                    n = await pg.evaluate("(id=>{ const n=GAME.npc&&GAME.npc[id]; return n&&n.obj?{x:+n.obj.position.x.toFixed(2), z:+n.obj.position.z.toFixed(2), lv:n.lv|0, seat:!!n.seat}:null; })", WHO)
                    R.note('[B 當面] 她在場：%s' % J(n))
                    if R.check('[B 當面] 她在 %s' % w['zone'], bool(n), ''):
                        lab = None
                        for dx, dz in ((0.0, 1.0), (0.9, 0.6), (-0.9, 0.6), (1.0, 0.0), (-1.0, 0.0), (0.0, -1.0)):
                            await L.go_to(pg, cdp, R, n['x'] + dx, n['z'] + dz, 0.3, '[B 當面] 走到她旁邊 (%+.1f,%+.1f)' % (dx, dz), max_s=120, lv=n['lv'])
                            await pg.wait_for_timeout(900)
                            lab = await pg.evaluate("(()=>{ const e=document.getElementById('interact'); return e&&!e.classList.contains('hide')?e.innerText.trim():null; })()")
                            if lab and '說話' in lab: break
                        R.note('[B 當面] 互動按鈕：%s' % lab)
                        if R.check('[B 當面] 互動按鈕是「說話」', bool(lab and '說話' in lab), J(lab)):
                            await pg.evaluate("window.__says=[]")
                            await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1200)
                            bdr = await drive(pg, cdp, '[B 當面]', ['約', '一起'] + CATS + ['現在一起過去'], max_s=420, idle_end=12, shots=8)
                            says = await pg.evaluate("window.__says||[]"); rec['B'] = {'drive': bdr, 'says': says, 'end': await pg.evaluate("({zone:GAME.G.zone, h:+(+GAME.G.hour).toFixed(2), inv:(GAME.G.invites||[]).slice(-1)})")}
                            R.note('[B 當面] 結束：%s' % J(rec['B']['end']))
                            judge('[B 當面]', says)
                            R.check('[B 當面] 有一起走的字幕（GAME.caption）或走過去的句子', any(x['k'] == 'cap' for x in says), '')
                            await R.shot(pg, 'B_end')
            except Exception as ex: R.check('[B 當面] 探針沒有例外', False, repr(ex)[:300])
            R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    json.dump(rec, open(os.path.join(OUT, 'inv_quote.json'), 'w'), ensure_ascii=False, indent=1, default=str)
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
