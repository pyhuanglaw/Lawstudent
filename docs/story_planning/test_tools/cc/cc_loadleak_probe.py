"""CC-B（帳號 B）11-07：書店時鐘跳 18:00 重現（BB-B 18:50，P2：玩家讀檔也可能碰到）。e647887c7。
上一次（kx3）：同一個頁面先跑完可昕咖啡第 3 場（散場），接著讀檔進頁間書屋 13:48，時鐘變 18:00。直接讀檔進書店（沒有前一場）重現不了。
VARIANTS（預設四種）：{散場對話剛結束就讀 now｜散場以後等 3 秒 wait3} × {load_state【捷徑】 shortcut｜真的選單 ☰ → 讀取 → 欄位 1 menu}
每一種（新的頁面）：
  【前置】讀檔進書店 13:48、GAME.snapshot() 寫進 fatiao3d_slot_1（menu 那一種用）→ 讀檔進 2:30 AM 13:48 →【捷徑】可昕第 3 階、ACTN cafe 第 3 場 → INV.accept 14:00 →
  照常跑到散場（點對話、選第一個）→ now／等 3 秒 → 讀檔進書店 13:48（shortcut／menu）→ 讀檔那一刻記 ECONFF.busy、EVENTS.running、對話有沒有開、INV／DATE 有沒有在跑 →
  每 0.5 秒記 G.hour、G.zone、G.day 共 20 秒；時鐘跳（> 0.3 小時）的那一格前後各記一次 G 差異（hour、day、flags、invites、outings）。
判定＝BB。用法：LW_TESTS=<wt>/tests [VARIANTS=now:shortcut,…] python3 cc_loadleak_probe.py <url> <out>"""
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
R = L.Run('loadleak', OUT); D.setup(R, OUT)
DAY = '2025-10-18'
VARIANTS = [v.split(':') for v in (os.environ.get('VARIANTS') or 'now:shortcut,wait3:shortcut,now:menu,wait3:menu').split(',')]

SNAP = r"""(()=>{ const G=GAME.G; return {zone:G.zone, hour:+(+G.hour).toFixed(3), day:G.day, flags:JSON.parse(JSON.stringify(G.flags||{})), invites:JSON.parse(JSON.stringify(G.invites||[])), outings:JSON.parse(JSON.stringify(G.outings||[]))}; })()"""
BUSY = r"""(()=>{ const o={}; try{ o.econff=typeof ECONFF!=='undefined'?(typeof ECONFF.busy==='function'?ECONFF.busy(GAME):ECONFF.busy):null; }catch(e){ o.econff='ERR'; }
  try{ o.eventsRunning=typeof EVENTS!=='undefined'?(EVENTS.running===undefined?null:(EVENTS.running&&(EVENTS.running.id||true))):null; }catch(e){}
  try{ const d=document.getElementById('dlg'); o.dlg=!!d&&!d.classList.contains('hide'); o.dlgText=(document.getElementById('dlgText')||{}).innerText||null; }catch(e){}
  try{ o.gameD=GAME.D?{active:!!GAME.D.active, busyDepth:GAME.D.busyDepth, stale:!!GAME.D.stale}:null; }catch(e){}
  try{ o.scene=typeof GAME.sceneBusy==='function'?GAME.sceneBusy():(GAME.inScene||null); }catch(e){}
  try{ o.invRunning=typeof INV!=='undefined'?{running:INV.running||null, busy:INV.busy||null}:null; }catch(e){}
  try{ o.dateRunning=typeof DATE!=='undefined'?{running:DATE.running||null, busy:DATE.busy||null}:null; }catch(e){}
  try{ o.choices=document.querySelectorAll('#choices button').length; }catch(e){}
  return o; })()"""


def gdiff(a, b):
    out = {}
    for k in ('zone', 'hour', 'day'):
        if a.get(k) != b.get(k): out[k] = [a.get(k), b.get(k)]
    fa, fb = a.get('flags') or {}, b.get('flags') or {}
    fd = {k: [fa.get(k), fb.get(k)] for k in set(fa) | set(fb) if fa.get(k) != fb.get(k)}
    if fd: out['flags'] = fd
    for k in ('invites', 'outings'):
        if a.get(k) != b.get(k): out[k] = [a.get(k), b.get(k)]
    return out


async def cafe_date(pg, cdp, tag):
    s = await D.load_zone(pg, cdp, 'cafe', DAY, 13.8, wait=6000)
    R.setup('%s 【前置／捷徑】讀檔進 2:30 AM %s 13:48；可昕 fam/trust ≥ 第 3 階；ACTN cafe 第 3 場；INV.accept 14:00' % (tag, DAY))
    iv = await pg.evaluate("""(()=>{ const G=GAME.G, r=SOCIAL.rel('kexin'); r.fam=Math.max(+r.fam||0,40); r.trust=Math.max(+r.trust||0,25); const F=G.flags||(G.flags={}); const A=F.ACTN||(F.ACTN={}); (A.cafe||(A.cafe={})).kexin={n:2,k:3,last:null,rot:-1};
      const iv=INV.accept(G,'kexin','cafe',G.day,14); return iv&&iv.id?iv.id:((G.invites||[]).slice(-1)[0]||{}).id; })()""")
    t0 = time.time(); lines = 0
    while time.time() - t0 < 360:
        st = await L.state(pg)
        if st['choices']:
            c = await pg.evaluate("(()=>{ const b=document.querySelector('#choices button'); b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()")
            await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(900); continue
        if st['dlg']:
            for _ in range(40):
                if await pg.evaluate("(()=>{ const n=document.getElementById('dlgNext'); return !n||n.style.visibility!=='hidden'; })()"): break
                await pg.wait_for_timeout(250)
            lines += 1; await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
        ivs = await pg.evaluate("(id=>{ const q=(GAME.G.invites||[]).find(x=>x.id===id); return q?q.state:null; })", iv)
        if ivs in ('done', 'missed'):   # 開始見面那一刻 state 就是 done：要等場景真的演完（3 秒沒有對話、選項、場景忙）
            quiet = True
            for _ in range(6):
                await pg.wait_for_timeout(500); st2 = await L.state(pg)
                if st2['dlg'] or st2['choices'] or await pg.evaluate("!!(GAME.D&&GAME.D.busyDepth>0)"): quiet = False; break
            if quiet: break
            continue
        await pg.wait_for_timeout(500)
    R.note('%s 咖啡第 3 場：%d 句、約的狀態 %s、時鐘 %.2f' % (tag, lines, ivs, await pg.evaluate("GAME.G.hour")))
    return ivs


async def load_menu(pg, cdp, slot):
    """照玩家：☰ → 存檔頁 → 欄位 N「讀取」（有確認就按讀取／確定）；回傳有沒有點到"""
    if await pg.evaluate("document.getElementById('menu').classList.contains('hide')"):
        await L.tap(pg, cdp, '#btnMenu'); await pg.wait_for_timeout(1200)
    await L.tap(pg, cdp, '#menu .tabs button[data-tab="save"]'); await pg.wait_for_timeout(1200)
    c = await pg.evaluate("""(n=>{ const it=[...document.querySelectorAll('#saveSlots .item')].find(x=>new RegExp('欄位 '+n).test(x.innerText)); if(!it) return null; const b=[...it.querySelectorAll('button')].find(x=>x.textContent==='讀取'); if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })""", slot)
    if not c: return False
    await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(800)
    for _ in range(5):
        st = await L.state(pg)
        if not st['choices']: break
        k = await pg.evaluate("(()=>{ const bs=[...document.querySelectorAll('#choices button')]; const i=bs.findIndex(b=>/讀取|確定|是/.test(b.innerText)); return i<0?0:i; })()")
        cc = await pg.evaluate("(i=>{ const b=document.querySelectorAll('#choices button')[i]; const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%d)" % k)
        await L.touch_tap(cdp, cc[0], cc[1]); await pg.wait_for_timeout(800)
    return True


async def chain_loads(pg, cdp, tag, rec):
    """BB-B 19:26：同一頁連續讀 欄位 1 → 欄位 2 → 欄位 1，每次 10 秒看時鐘、toast、busyDepth"""
    out = []
    for slot, zone, h in ((1, 'bookstore', 13.8), (2, 'gongguan', 15.0), (1, 'bookstore', 13.8)):
        ok = await load_menu(pg, cdp, slot); await pg.wait_for_timeout(1500)
        toast = await pg.evaluate("(()=>{ const e=document.getElementById('toast'); return e?e.innerText.trim():''; })()")
        seq = []
        for i in range(20):
            cur = await pg.evaluate("(()=>({zone:GAME.G.zone, hour:+(+GAME.G.hour).toFixed(3), bd:GAME.D?GAME.D.busyDepth:null}))()")
            seq.append([round(i * 0.5, 1), cur['zone'], cur['hour'], cur['bd']]); await pg.wait_for_timeout(500)
        good = ok and all(x[1] == zone and abs(x[2] - h) < 0.3 and not x[3] for x in seq) and '提醒：14:00' not in toast
        R.note('%s 連續讀 欄位 %d（%s %.2f）：toast %s；%s' % (tag, slot, zone, h, J(toast), J(seq)))
        R.check('%s 連續讀 欄位 %d：進 %s、時鐘在 %.2f 附近不跳、busyDepth 0、沒有上一局的提醒' % (tag, slot, zone, h), good, J({'toast': toast, 'seq': seq[:4] + seq[-2:]}))
        out.append({'slot': slot, 'toast': toast, 'seq': seq})
    rec['chain'] = out


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC 讀檔時鐘跳（書店 18:00）重現：SHA=%s（worktree 實際 %s）；VARIANTS=%s' % (os.environ.get('SHA', '?'), real or '?', VARIANTS), flush=True)
    rec = {'sha': real, 'runs': []}
    async with async_playwright() as p:
        for when, how in VARIANTS:
            tag = '[%s／%s]' % (when, how)
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
            try:
                await cc_det.install(pg, 20261107)
                await pg.goto(URL); ok = await L.wait_loaded(pg)
                if not R.check('%s 遊戲載入' % tag, ok, ''): continue
                await pg.evaluate("localStorage.clear()")
                d = await pg.evaluate("(k=>STORY.dayOfKey(k))('%s')" % DAY)
                book_st = {'zone': 'bookstore', 'day': d, 'hour': 13.8}
                if how in ('menu', 'chain'):
                    await L.load_state(pg, book_st, quiet_events=True, quiet_phone=True); await pg.wait_for_timeout(3000)
                    await pg.evaluate("(()=>{ localStorage.setItem('fatiao3d_slot_1', JSON.stringify(GAME.snapshot())); })()")
                    if how == 'chain':
                        await L.load_state(pg, {'zone': 'gongguan', 'day': d, 'hour': 15.0}, quiet_events=True, quiet_phone=True); await pg.wait_for_timeout(3000)
                        await pg.evaluate("(()=>{ localStorage.setItem('fatiao3d_slot_2', JSON.stringify(GAME.snapshot())); })()")
                        R.setup('%s 【前置】公館 15:00 的存檔寫進 fatiao3d_slot_2' % tag)
                    R.setup('%s 【前置】書店 13:48 的存檔寫進 fatiao3d_slot_1（GAME.snapshot）' % tag)
                ivs = await cafe_date(pg, cdp, tag)
                R.check('%s 咖啡第 3 場演完（done）' % tag, ivs == 'done', str(ivs))
                if when.startswith('wait'): await pg.wait_for_timeout(int(when[4:]) * 1000)   # wait3／wait10／wait30（BB-B 19:10）
                before = await pg.evaluate(SNAP); busy = await pg.evaluate(BUSY)
                inv_pre = await pg.evaluate("(()=>({gInvites:(GAME.G.invites||[]).map(q=>[q.id,q.who,q.place,q.day,q.h,q.state]), defaultsInvites:(GAME.defaults('x').invites||null), defaultsSame:GAME.defaults('x').invites===GAME.defaults('y').invites}))()")
                R.note('%s 讀檔前：G.invites %s；GAME.defaults().invites %s（兩次 defaults 同一個陣列：%s）' % (tag, J(inv_pre['gInvites']), J(inv_pre['defaultsInvites']), inv_pre['defaultsSame']))
                R.note('%s 讀檔前一刻：時鐘 %.2f、zone %s；在跑的東西 %s' % (tag, before['hour'], before['zone'], J(busy)))
                if how == 'chain':
                    await chain_loads(pg, cdp, tag, rec); R.check('%s 沒有 JS 例外' % tag, not errs, J(errs[:3])); continue
                if how == 'shortcut':
                    R.setup('%s 【捷徑】L.load_state 讀檔進書店 13:48（條件事件關閉）' % tag)
                    await L.load_state(pg, book_st, quiet_events=True, quiet_phone=True)
                else:
                    R.note('%s 照玩家：☰ → 存檔頁 → 欄位 1「讀取」' % tag)
                    if await pg.evaluate("document.getElementById('menu').classList.contains('hide')"):
                        await L.tap(pg, cdp, '#btnMenu'); await pg.wait_for_timeout(1200)
                    await L.tap(pg, cdp, '#menu .tabs button[data-tab="save"]'); await pg.wait_for_timeout(1200)
                    c = await pg.evaluate("""(()=>{ const it=[...document.querySelectorAll('#saveSlots .item')].find(x=>/欄位 1/.test(x.innerText)); if(!it) return null; const b=[...it.querySelectorAll('button')].find(x=>x.textContent==='讀取'); if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()""")
                    if not R.check('%s 欄位 1 有「讀取」' % tag, bool(c), ''): continue
                    await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(800)
                    for _ in range(5):   # 確認讀取（有的話）
                        st = await L.state(pg)
                        if st['choices']:
                            k = await pg.evaluate("(()=>{ const bs=[...document.querySelectorAll('#choices button')]; const i=bs.findIndex(b=>/讀取|確定|是/.test(b.innerText)); return i<0?0:i; })()")
                            cc = await pg.evaluate("(i=>{ const b=document.querySelectorAll('#choices button')[i]; const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%d)" % k)
                            await L.touch_tap(cdp, cc[0], cc[1]); await pg.wait_for_timeout(800)
                        else: break
                toast_txt = await pg.evaluate("(()=>{ const e=document.getElementById('toast'); return e?e.innerText.trim():''; })()")
                toast_vis = await pg.evaluate("(()=>{ const e=document.getElementById('toast'); if(!e) return false; const cs=getComputedStyle(e); return !e.classList.contains('hide')&&cs.display!=='none'&&cs.visibility!=='hidden'&&+cs.opacity>0.05; })()")
                R.note('%s 讀檔後 toast 看得到：%s' % (tag, toast_vis))
                R.note('%s 讀檔後 toast：%s' % (tag, J(toast_txt)))
                at_load = await pg.evaluate(BUSY)
                inv_post = await pg.evaluate("(()=>(GAME.G.invites||[]).map(q=>[q.id,q.who,q.place,q.day,q.h,q.state]))()")
                R.note('%s 讀檔後：G.invites %s' % (tag, J(inv_post)))
                seq = []; prev = await pg.evaluate(SNAP); jump = None
                for i in range(40):
                    cur = await pg.evaluate(SNAP)
                    bd = await pg.evaluate("(()=>GAME.D?GAME.D.busyDepth:null)()")
                    seq.append([round(i * 0.5, 1), cur['zone'], cur['hour'], cur['day'], bd])
                    if jump is None and prev['zone'] == cur['zone'] and cur['day'] == prev['day'] and abs(cur['hour'] - prev['hour']) > 0.3:
                        jump = {'at': i * 0.5, 'diff': gdiff(prev, cur), 'busyAfter': await pg.evaluate(BUSY), 'invites': await pg.evaluate("(()=>(GAME.G.invites||[]).map(q=>[q.id,q.who,q.place,q.day,q.h,q.state]))()"), 'toast': await pg.evaluate("(()=>{ const e=document.getElementById('toast'); return e?e.innerText.trim():''; })()"), 'dlg': await pg.evaluate("(()=>(document.getElementById('dlgText')||{}).innerText||null)()")}
                    if jump is None and cur['day'] != prev['day']: jump = {'at': i * 0.5, 'diff': gdiff(prev, cur), 'busyAfter': await pg.evaluate(BUSY)}
                    prev = cur
                    await pg.wait_for_timeout(500)
                R.note('%s 讀檔後 20 秒（每 0.5 秒 [秒, zone, hour, day]）：%s' % (tag, J(seq)))
                R.note('%s 讀檔那一刻在跑的東西：%s' % (tag, J(at_load)))
                first = seq[0] if seq else None
                R.check('%s 讀檔後進了書店、時鐘在 13:48 附近（第一格 %s）' % (tag, J(first)), bool(first) and first[1] == 'bookstore' and abs(first[2] - 13.8) < 0.3, J(seq[:4]))
                R.check('%s 讀檔後 20 秒內時鐘沒有跳' % tag, jump is None, J(jump))
                R.check('%s 讀檔後 #toast 不是上一局的約會提醒（空的，或不含「提醒：14:00」）' % tag, '提醒：14:00' not in (toast_txt or ''), J(toast_txt))
                R.check('%s 讀檔後畫面上沒有顯示「提醒：14:00…」toast' % tag, not (toast_vis and '提醒：14:00' in (toast_txt or '')), J([toast_vis, toast_txt]))
                R.check('%s 讀檔後 20 秒 D.busyDepth 一直是 0' % tag, all((x[4] or 0) == 0 for x in seq), J([x for x in seq if (x[4] or 0) != 0][:5]))
                if os.environ.get('WALK') == '1':   # BB-B 19:26：讀完以後在書店照常走 1 分鐘
                    t1 = time.time(); w = []; pts = [(-2.0, 2.0), (2.0, -2.0), (-3.5, -2.5), (0.0, 3.0)]; k = 0
                    while time.time() - t1 < 60:
                        x_, z_ = pts[k % len(pts)]; k += 1
                        await L.go_to(pg, cdp, R, x_, z_, 0.6, '%s 書店裡走走 (%.1f,%.1f)' % (tag, x_, z_), max_s=20)
                        cur = await pg.evaluate(SNAP); st_ = await L.state(pg)
                        w.append([round(time.time() - t1, 1), cur['zone'], cur['hour'], st_['dlg'], st_['choices'], await pg.evaluate("(()=>GAME.D?GAME.D.busyDepth:null)()")])
                    R.note('%s 走 1 分鐘（[秒, zone, hour, 對話, 選項, busyDepth]）：%s' % (tag, J(w)))
                    hrs = [x[2] for x in w]
                    R.check('%s 走 1 分鐘：時鐘照常（沒有一次跳 >0.3 小時）、還在書店、沒有冒出對話或劇情' % tag, all(b2 - a2 < 0.3 for a2, b2 in zip(hrs, hrs[1:])) and all(x[1] == 'bookstore' for x in w) and not any(x[3] or (x[5] or 0) for x in w), J(w))
                await R.shot(pg, 'leak_%s_%s' % (when, how))
                rec['runs'].append({'when': when, 'how': how, 'before': {k: before[k] for k in ('zone', 'hour', 'day')}, 'busyBefore': busy, 'busyAtLoad': at_load, 'seq': seq, 'jump': jump})
                R.check('%s 沒有 JS 例外' % tag, not errs, J(errs[:3]))
            except Exception as ex: R.check('%s 探針沒有例外' % tag, False, repr(ex)[:300])
            finally: await b.close()
    json.dump(rec, open(os.path.join(OUT, 'loadleak.json'), 'w'), ensure_ascii=False, indent=1)
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
