"""CC-C 11-14：店內功能補拍（BB-C 02:13，§12 第 4 點）。只記、截圖；判定歸 BB。Windows＋GPU ≠ iPhone。
MODE=korea（KOREA_ORDER_1400）：清州刀削麵 l118_korea（11:00～20:00、週日休；DAY 預設 2025-10-22 週三）14:00
  【前置／捷徑】D.load_zone 讀檔進店 → 照玩家走到「點餐（清州刀削麵）」互動點 → 按 → 1 秒、3 秒各截一張（記點餐畫面／選單、對話、toast、GAME.say）
  → 選單照字選第一樣能點的（不選「不用了／算了」）、有「點好了」就按 → 記錢；再走回去點第二碗 → 記錢（扣了沒）。
  L118_KDT 14:00 走到 0.31 m 卻 ui null、said 0（19:00 同一點 PASS）——這支要看的是 14:00 點下去到底出了什麼。
MODE=xile（XILE_FUNC）：洗樂洗衣坊 tz_xile（24 小時）2025-10-22 14:00；程式 gg3shops3d.js S.wash／washBack／change
  ① 洗衣機 → 選單（只洗 60／洗＋烘 100）選「只洗」→ 第二個選單選「先去別的地方」→ 扣 60、走出店門（GG3_WASH 記 ready）
  ②【捷徑】在店外把時間往後撥 45 分鐘（≥ 40 分鐘）→ 照玩家從店外的門走回去 → 收衣服那一句（washBack）
  ③ 同一天再按洗衣機 → toast「今天洗過了。」
  ④ 兌幣機・洗衣精 → 選「洗衣精」→ 扣 10、旁白；⑤ 折衣桌、⑥ 看使用說明 各按一次、記字
  每一步截圖、記錢、對話、選單、toast。
CC_02 清單 2026-11-14：1✓（日期 10/22 週三 14:00：刀削麵有開、洗樂 24 小時；FAIL_SETUP 先用 L118.isOpen／區域確認） 2✓（互動點照 E.interactables 的字找，不寫死座標） 3n/a（每間只有一個那種互動點） 4✓（按之前確認互動鍵是那一個） 5✓（L.go_to 照玩家走） 6✓（1 秒／3 秒照 BB；對話點完等 3 秒沒動才算結束） 7✓（lint） 8✓（只記、BB 判） 9✓（每一步截圖） 10✓（別的對話照字點完並記） 11✓（SHA 40 碼、ENV 沒有「|」「;」） 12✓（FAIL_SETUP 檢查：真的在店裡、找得到互動點、刀削麵當下有開） 13✓（走不到記最後位置）
用法：LW_TESTS=<wt>/tests SHA=<sha> MODE=korea|xile [DAY=2025-10-22] [HOUR=14] python3 cc_shop_func_probe.py <url> <out>"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import playlib as L
import bbplay as P
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
SHA = os.environ.get('SHA') or ''
MODE = os.environ.get('MODE') or 'korea'
DAY = os.environ.get('DAY') or '2025-10-22'
HOUR = float(os.environ.get('HOUR') or 14)
R = L.Run('shopfunc_' + MODE, OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
NO = ('不用了', '算了', '先不吃', '不用', '不要')
SETTLED = "(async()=>{ for(let i=0;i<120;i++){ const A=ASSETS; const n=Object.keys(A.status).filter(k=>!A.cache[k]&&!A.errors.some(e=>e.startsWith(k+':'))).length; if(!n) return i; await new Promise(r=>setTimeout(r,250)); } return -1; })()"
STATE = r"""(()=>{ const G=GAME.G, E=GAME.E, p=E.player.obj.position; const ts=document.getElementById('toast'); const it=document.getElementById('interact');
  const ui=[]; for(const el of document.querySelectorAll('body *')){ if(!el.id&&!(el.className&&String(el.className).match(/panel|sheet|menu|shop|order|modal|pop/i))) continue; const cs=getComputedStyle(el); if(cs.display==='none'||cs.visibility==='hidden'||(el.offsetParent===null&&cs.position!=='fixed')) continue; const t=(el.innerText||'').trim(); if(!t) continue; const r=el.getBoundingClientRect(); if(r.width<60||r.height<30) continue; ui.push([el.id||String(el.className).slice(0,30), t.replace(/\s+/g,' ').slice(0,100)]); if(ui.length>=6) break; }
  return {key:CALENDAR.dateOf(G.day).key, h:+(+G.hour).toFixed(3), zone:G.zone, money:G.money|0, pos:[+p.x.toFixed(2),+p.z.toFixed(2)], interact:it&&it.offsetParent?(it.textContent||'').trim().slice(0,30):'',
    toast:ts&&ts.offsetParent?(ts.textContent||'').trim().slice(0,60):'', ui, wash:(G.flags||{}).GG3_WASH||null, washDay:(G.flags||{}).GG3_WASH_DAY, open:(typeof L118!=='undefined'&&L118.isOpen&&G.zone.indexOf('l118_')===0)?L118.isOpen(G.zone.slice(5),G):null}; })()"""
TOASTLOG = r"""(()=>{ if(window.__tl) return 'again'; window.__tl=[]; const el=document.getElementById('toast'); if(el) new MutationObserver(()=>{ const t=(el.textContent||'').trim(); if(t&&window.__tl[window.__tl.length-1]!==t) window.__tl.push(t.slice(0,60)); }).observe(el,{childList:true,subtree:true,characterData:true,attributes:true}); return 'ok'; })()"""
FIND = r"""(re=>{ const P=GAME.E.player.obj.position, rx=new RegExp(re); const L=(GAME.E.interactables||[]).filter(i=>!i.hidden&&rx.test(String(typeof i.label==='function'?i.label():i.label||''))).map(i=>({x:i.x,z:i.z,lv:i.lv|0,label:String(typeof i.label==='function'?i.label():i.label||''),kind:i.kind||null,to:i.exit&&i.exit.to||null,d:Math.hypot(i.x-P.x,i.z-P.z)})); L.sort((a,b)=>a.d-b.d); return L[0]||null; })"""
N = [0]


async def snap(pg, tag, label):
    N[0] += 1; fn = '%s_%02d_%s.png' % (MODE, N[0], label); await pg.screenshot(path=os.path.join(OUT, fn))
    s = await pg.evaluate(STATE); t = await P.ts(pg)
    R.note('%s [%s] %s：%s %.2f %s 錢 %s；互動鍵「%s」；對話「%s」；選單 %s；toast「%s」；畫面上的框 %s' % (tag, fn, label, s['key'], s['h'], s['zone'], s['money'], s['interact'], (t.get('txt') or '')[:50], J([x['t'] for x in t.get('ch') or []]), s['toast'], J(s['ui'])))
    return s, t


async def use(pg, cdp, tag, rx):
    """照玩家走到字對得上 rx 的互動點，互動鍵是它就按；回傳那個互動點"""
    it = await pg.evaluate(FIND, rx)
    if not R.check('FAIL_SETUP 檢查：%s 找得到互動點 /%s/' % (tag, rx), bool(it), ''): return None
    await L.go_to(pg, cdp, R, it['x'], it['z'], 0.55, it['label'], max_s=90, lv=it['lv']); await D.settle(pg)
    s = await pg.evaluate(STATE)
    R.note('%s 走到「%s」(%.2f, %.2f)：人在 %s、互動鍵「%s」' % (tag, it['label'], it['x'], it['z'], s['pos'], s['interact']))
    if not s['interact'].startswith(it['label'][:4]):
        R.note('%s 互動鍵不是它（%s），再靠近一點' % (tag, s['interact'])); await L.go_to(pg, cdp, R, it['x'], it['z'], 0.3, it['label'], max_s=30, lv=it['lv'])
    await L.tap(pg, cdp, '#interact')
    return it


async def run_dialog(pg, cdp, tag, prefer=(), avoid=NO, max_s=90):
    """把這一段演完：選單照 prefer 字頭優先、否則第一個不 dim、不在 avoid 的；對話照點；3 秒沒動＝結束。回傳選過的、看過的字"""
    n0 = await P.say_hook(pg); t0 = time.time(); seen = []; picks = []; idle = None
    while time.time() - t0 < max_s:
        t = await P.ts(pg)
        if t['txt'] and (not seen or seen[-1] != t['txt']): seen.append(t['txt'])
        if t['ch']:
            idle = None; o = t['ch']
            i = next((k for p in prefer for k, x in enumerate(o) if x['t'].startswith(p) and not x['dim']), None)
            if i is None: i = next((k for k, x in enumerate(o) if not x['dim'] and not any(x['t'].startswith(a) for a in avoid)), len(o) - 1)
            await snap(pg, tag, 'choice'); picks.append([[x['t'] for x in o], o[i]['t']])
            await P.tap_choice(pg, cdp, i); await pg.wait_for_timeout(900); continue
        if t['dlg']: idle = None; await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
        if t['busy'] or t.get('depth', 0) > 0: idle = None; await pg.wait_for_timeout(500); continue
        idle = idle or time.time()
        if time.time() - idle > 3: break
        await pg.wait_for_timeout(400)
    said = await P.said(pg, n0)
    R.note('%s 這一段：選單 %s；看到的字 %s；GAME.say %s' % (tag, J(picks), J(seen[:12]), J(said[:12])))
    return {'picks': picks, 'seen': seen, 'said': said}


async def korea(pg, cdp):
    tag = '[刀削麵 %s %.0f:00]' % (DAY, HOUR)
    s = await D.load_zone(pg, cdp, 'l118_korea', DAY, HOUR, wait=8000); await pg.evaluate(SETTLED); await pg.evaluate(TOASTLOG)
    R.setup('%s 【前置／捷徑】讀檔進清州刀削麵 l118_korea（出生點）' % tag)
    st = await pg.evaluate(STATE)
    if not R.check('FAIL_SETUP 檢查：%s 在店裡、有開（L118.isOpen）、不是週日' % tag, s['zone'] == 'l118_korea' and st['open'] is not False, J(st)): return {}
    out = {}
    for k in (1, 2):
        m0 = (await pg.evaluate(STATE))['money']
        it = await use(pg, cdp, '%s 第 %d 碗' % (tag, k), '^點餐')
        if not it: return out
        await pg.wait_for_timeout(1000); a1, t1 = await snap(pg, tag, 'order%d_1s' % k)
        await pg.wait_for_timeout(2000); a3, t3 = await snap(pg, tag, 'order%d_3s' % k)
        d = await run_dialog(pg, cdp, '%s 第 %d 碗' % (tag, k), prefer=('點好了',))
        m1 = (await pg.evaluate(STATE))['money']; tl = await pg.evaluate("(window.__tl||[]).slice(-6)")
        await snap(pg, tag, 'order%d_end' % k)
        R.check('%s 第 %d 碗：按「點餐」以後 3 秒內有點餐畫面／選單或一句話' % (tag, k), bool(t1['ch'] or t1['txt'] or t3['ch'] or t3['txt'] or a1['ui'] or a3['ui'] or d['said']), J({'1s': [t1['ch'], t1['txt'], a1['ui']], '3s': [t3['ch'], t3['txt'], a3['ui']]}))
        R.check('%s 第 %d 碗：扣了錢（%s → %s）' % (tag, k, m0, m1), m1 < m0, J({'picks': d['picks'], 'toast': tl}))
        out['bowl%d' % k] = {'money': [m0, m1], 'at1s': t1, 'at3s': t3, 'dialog': d, 'toasts': tl}
    return out


async def xile(pg, cdp):
    tag = '[洗樂 %s %.0f:00]' % (DAY, HOUR); out = {}
    s = await D.load_zone(pg, cdp, 'tz_xile', DAY, HOUR, wait=8000); await pg.evaluate(SETTLED); await pg.evaluate(TOASTLOG)
    R.setup('%s 【前置／捷徑】讀檔進洗樂洗衣坊 tz_xile（出生點）' % tag)
    if not R.check('FAIL_SETUP 檢查：%s 在店裡' % tag, s['zone'] == 'tz_xile', J(s)): return out
    # ① 洗衣機：只洗 → 先去別的地方
    m0 = (await pg.evaluate(STATE))['money']
    await use(pg, cdp, tag + ' ①', '^洗衣機'); await pg.wait_for_timeout(1000); await snap(pg, tag, 'wash_menu')
    d1 = await run_dialog(pg, cdp, tag + ' ①', prefer=('只洗', '先去別的地方'), avoid=('算了', '在這裡等'))
    await pg.wait_for_timeout(3000); s1 = await pg.evaluate(STATE); await snap(pg, tag, 'wash_after')
    R.check('%s ① 洗衣機選單有「只洗」「洗＋烘」' % tag, any('只洗' in x for o, _ in d1['picks'] for x in o) and any('洗＋烘' in x for o, _ in d1['picks'] for x in o), J(d1['picks']))
    R.check('%s ① 扣 60 元（%s → %s）、走出店門（%s）、GG3_WASH 記了 ready' % (tag, m0, s1['money'], s1['zone']), m0 - s1['money'] == 60 and s1['zone'] != 'tz_xile' and bool(s1['wash']), J(s1))
    out['wash'] = {'dialog': d1, 'after': s1}
    # ② 撥 45 分鐘 → 走回店裡 → washBack
    await pg.evaluate("(()=>{ GAME.G.hour=+GAME.G.hour+0.75; })()"); await pg.wait_for_timeout(1500)
    R.setup('%s 【捷徑】在店外（%s）把時間往後撥 45 分鐘（洗 40 分鐘）' % (tag, s1['zone']))
    door = await pg.evaluate(FIND, '洗樂')
    R.note('%s ② 店外往洗樂的門：%s' % (tag, J(door)))
    if door:
        await use(pg, cdp, tag + ' ②', '洗樂'); await pg.wait_for_timeout(2500)
        d2 = await run_dialog(pg, cdp, tag + ' ② 回來', max_s=40); s2 = await pg.evaluate(STATE); await snap(pg, tag, 'wash_back')
        R.check('%s ② 回到店裡（%s）、有收衣服那一句（washBack；GG3_WASH.done）' % (tag, s2['zone']), s2['zone'] == 'tz_xile' and bool((s2['wash'] or {}).get('done')) and bool(d2['said'] or d2['seen']), J({'s': s2, 'd': d2}))
        out['back'] = {'dialog': d2, 'state': s2}
    else: R.check('%s ② 店外找得到洗樂的門' % tag, False, '')
    # ③ 同一天第二次洗
    await use(pg, cdp, tag + ' ③', '^洗衣機'); await pg.wait_for_timeout(800); a3, _ = await snap(pg, tag, 'wash_again')
    d3 = await run_dialog(pg, cdp, tag + ' ③', max_s=15); tl = await pg.evaluate("(window.__tl||[]).slice(-6)")
    R.check('%s ③ 同一天再洗：出「今天洗過了。」' % tag, any('今天洗過' in x for x in tl + [a3['toast']]), J({'toast': tl, 'd': d3}))
    out['again'] = {'toasts': tl, 'dialog': d3}
    # ④ 兌幣機・洗衣精 → 洗衣精
    m4 = (await pg.evaluate(STATE))['money']
    await use(pg, cdp, tag + ' ④', '兌幣|洗衣精'); await pg.wait_for_timeout(1000); await snap(pg, tag, 'change_menu')
    d4 = await run_dialog(pg, cdp, tag + ' ④', prefer=('洗衣精',)); s4 = await pg.evaluate(STATE); await snap(pg, tag, 'change_after')
    R.check('%s ④ 洗衣精扣 10 元（%s → %s）、有旁白或 toast' % (tag, m4, s4['money']), m4 - s4['money'] == 10 and bool(d4['said'] or d4['seen'] or s4['toast']), J(d4))
    out['soap'] = {'dialog': d4, 'money': [m4, s4['money']]}
    # ⑤ 折衣桌、⑥ 看使用說明
    for k, rx in (('fold', '折衣'), ('guide', '使用說明')):
        await use(pg, cdp, '%s %s' % (tag, k), rx); await pg.wait_for_timeout(1000); await snap(pg, tag, k)
        dk = await run_dialog(pg, cdp, '%s %s' % (tag, k), max_s=30)
        R.check('%s %s 按了有字' % (tag, rx), bool(dk['said'] or dk['seen']), J(dk)); out[k] = dk
    return out


async def main():
    print('CC 店內功能（%s）：SHA %s；%s %.2f；Windows＋GPU ≠ iPhone' % (MODE, SHA or '?', DAY, HOUR), flush=True)
    res = {'sha': SHA, 'mode': MODE}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg, 600), ''): await b.close(); sys.exit(1)
        try: res['out'] = await (korea(pg, cdp) if MODE == 'korea' else xile(pg, cdp))
        except Exception as e:
            R.check('沒有中斷', False, repr(e)[:300]); await pg.screenshot(path=os.path.join(OUT, 'crash.png'))
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    open(os.path.join(OUT, 'shop_func.json'), 'w', encoding='utf-8').write(J(res))
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
