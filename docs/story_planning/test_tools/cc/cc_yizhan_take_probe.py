"""CC-C 11-12：一盞茶屋外帶冷泡茶（YIZHAN-TAKEOUT-1112，src/gift3d.js「溫州街・一盞」takeout；BB-C 12:38 第 4 項，結果給 BB 判）。Playwright（PC GPU）≠ iPhone。
要看的：櫃台選單最下面「買一份帶走送人…」→ 冷泡茶兩樣 → 買得到、錢有扣、帶在身上（G.carry）；語彤當班時買＝旁白換那一句；當場送她＝收禮那一句（GIFT.lastPick.kind＝shift）。
做法：先在遊戲裡掃語彤的作息（SHIFTT.onShift：人在一盞、作息是打工那一格）找「當班」和「不當班」各一個時段（大一上平日 10～21 點）→
  每一種：【前置／捷徑】讀檔進 wz_teahouse 那個時段（條件事件關掉；認識語彤）→ 照玩家走到櫃台按 → 選「買一份帶走送人…」→ 選第一樣冷泡茶 → 一句一句記、錢前後、G.carry →
  當班那一種再走到語彤旁邊說話 → 選「送她…冷泡茶」→ 記她的句子、GIFT.lastPick。
11-12 r2：r1 掃到 9/15 週一（一盞公休）→ 讀檔停在門口；改掃整學期、跳過週一週二、12:30～19:00；停在門口照玩家按「進去一盞」（BB-C 13:30）。
CC_02 清單 2026-11-12：1✓（時段照遊戲自己的作息掃） 2✓（櫃台照互動點、語彤照 GAME.npc 從遊戲讀） 3✓（兩種各自讀檔） 4✓（選項照字） 5✓（go_to 走過去） 6✓（一句一句點） 7✓ 8n/a（不判，給 BB） 9n/a（不藏人：要看語彤） 10✓（條件事件關掉） 11✓ 12✓（兩種同樣欄位） 13✓（讀檔、認識語彤是捷徑）
用法：LW_TESTS=<wt>/tests SHA=<sha> [TERM=Y1S1] python3 cc_yizhan_take_probe.py <url> <out>"""
import os, sys, json, asyncio
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SHA = (os.environ.get('SHA') or '')[:10]; TERM = os.environ.get('TERM_ID') or 'Y1S1'
R = L.Run('yizhan_take', OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
ZONE = 'wz_teahouse'; YT = 'heroine_03'
SCAN = r"""(a=>{ const G=GAME.G, keep={day:G.day,hour:G.hour,zone:G.zone,weekday:G.weekday}; const R=CALENDAR.termDays(a.term); let on=null, off=null;
  try{ for(let d=R.from+7; d<(R.to||R.from+120)&&(!on||!off); d++){ const wd=CALENDAR.dateOf(d).wd%7; if(wd===1||wd===2) continue;   /* 一盞週一、週二公休（places.js），只掃開門的日子 */
      for(let h=12.5; h<19.5; h+=0.5){ G.day=d; G.weekday=wd; G.zone=a.zone; G.hour=h; const s=SHIFTT.onShift(G,a.who); if(s&&!on) on={key:CALENDAR.dateOf(d).key,h}; if(!s&&!off&&h>=14&&h<=17) off={key:CALENDAR.dateOf(d).key,h}; if(on&&off) break; } } }
  finally{ Object.assign(G,keep); } return {on, off}; })"""
MEET = r"""(w=>{ const G=GAME.G; G.flags=G.flags||{}; G.flags['met_'+w]=true; if(!G.contacts) G.contacts={}; if(G.contacts[w]==null) G.contacts[w]=2; try{ SOCIAL.meet(w,G.zone); if(SOCIAL.talkedTo) SOCIAL.talkedTo(w); }catch(e){} return {shift:SHIFTT.onShift(G,w), npc:!!(GAME.npc&&GAME.npc[w])}; })"""
ST = r"""(()=>{ const d=document.getElementById('dlg'); return {dlg:!!(d&&d.offsetParent), t:(document.getElementById('dlgText')||{}).textContent||'', who:(document.getElementById('dlgName')||{}).textContent||'',
  choices:[...document.querySelectorAll('#choices button')].filter(b=>b.offsetParent).map(b=>b.textContent.trim()), busy:!!(GAME.E.player&&GAME.E.player.busy), interact:(document.getElementById('interact')||{}).textContent||'', money:GAME.G.money|0}; })()"""


async def talk(pg, cdp, tag, prefix, prefs):
    lines, menus = [], []
    for j in range(80):
        st = await pg.evaluate(ST)
        if st['choices']:
            i = next((n for p_ in prefs for n, t in enumerate(st['choices']) if p_ in t), None)
            if i is None: i = next((n for n, t in enumerate(st['choices']) if any(w in t for w in ('算了', '再見', '離開', '沒事'))), None)
            if i is None: R.note('選單沒有想要的、也沒有退出的選項：%s → 選第一個' % J(st['choices'])); i = 0
            menus.append(st['choices']); lines.append('▶ ' + st['choices'][i]); await pg.screenshot(path=os.path.join(OUT, '%s_menu_%02d.png' % (prefix, len(menus))))
            await pg.evaluate("(i=>{ const b=[...document.querySelectorAll('#choices button')].filter(x=>x.offsetParent); (b[i]||b[0]).click(); })(%d)" % i); await pg.wait_for_timeout(900); continue
        if st['dlg']:
            ln = st['who'] + '｜' + st['t']
            if not lines or lines[-1] != ln: lines.append(ln); await pg.screenshot(path=os.path.join(OUT, '%s_%02d.png' % (prefix, len(lines))))
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
        if not st['busy'] and j > 3: break
        await pg.wait_for_timeout(500)
    R.note('%s 選單 %s' % (tag, J(menus))); R.note('%s 整段 %s' % (tag, J(lines)))
    return lines, menus


async def one(pg, cdp, case, slot, res):
    tag = '[%s %s %.1f]' % (case, slot['key'], slot['h'])
    await pg.goto(URL); await L.wait_loaded(pg)
    s = await D.load_zone(pg, cdp, ZONE, slot['key'], slot['h'], wait=7000)
    m = await pg.evaluate(MEET, YT)
    R.setup('%s 【前置／捷徑】讀檔進一盞 %s %.1f（條件事件關掉）、認識語彤：當班=%s、語彤在場景=%s' % (tag, slot['key'], slot['h'], m['shift'], m['npc']))
    if s['zone'] != ZONE and '一盞' in (s.get('interact') or ''):   # 讀檔停在溫州街門口：照玩家按「進去一盞」
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
        for _ in range(20):
            st = await pg.evaluate(ST)
            if st['choices']: await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#choices button')].filter(x=>x.offsetParent); const k=b.findIndex(x=>!/離開|算了|不用/.test(x.textContent)); (b[k<0?0:k]||b[0]).click(); })()"); await pg.wait_for_timeout(900); continue
            if st['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
            if await pg.evaluate("GAME.G.zone") == ZONE: break
            await pg.wait_for_timeout(500)
        s = await D.st(pg); R.note('%s 讀檔停在門口（%s），照玩家按「進去一盞」→ %s' % (tag, s.get('interact'), s['zone']))
    if not R.check('%s 進得去一盞' % tag, s['zone'] == ZONE, J(s)): return
    its = await pg.evaluate("GAME.E.interactables.filter(i=>!i.hidden&&!i.exit&&!i.seat).map(i=>({x:+i.x.toFixed(2),z:+i.z.toFixed(2),lv:i.lv|0,label:String(typeof i.label==='function'?i.label():i.label||''),kind:i.kind||null}))")
    ct = next((i for i in its if any(w in i['label'] for w in ('點', '櫃', '茶單', '買'))), None)
    R.note('%s 互動點 %s；用「%s」當櫃台' % (tag, J(its), ct and ct['label']))
    if not R.check('%s 找得到櫃台' % tag, bool(ct), ''): return
    await L.go_to(pg, cdp, R, ct['x'], ct['z'], 0.6, ct['label'], max_s=60, lv=ct['lv']); await D.settle(pg)
    m0 = await pg.evaluate("GAME.G.money|0"); await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1200)
    lines, menus = await talk(pg, cdp, tag + ' 買', 'yz_%s_buy' % case, ['買一份帶走送人', '冷泡'])
    m1 = await pg.evaluate("GAME.G.money|0"); carry = await pg.evaluate("GIFT.carry(GAME.G).map(c=>({n:c.n, shop:c.shop}))")
    R.note('%s 錢 %s → %s；身上 %s' % (tag, m0, m1, J(carry)))
    R.check('%s 選單最下面有「買一份帶走送人…」' % tag, any(mm and mm[-1].startswith('買一份帶走送人') or any(t.startswith('買一份帶走送人') for t in mm) for mm in menus), J(menus[:1]))
    R.check('%s 買得到冷泡茶（錢有扣、帶在身上、店名一盞茶屋）' % tag, m1 < m0 and any(c['shop'] == '一盞茶屋' for c in carry), J([m0, m1, carry]))
    rec = {'slot': slot, 'meet': m, 'buy': {'lines': lines, 'menus': menus, 'money': [m0, m1], 'carry': carry}}
    if case == 'ON' and m['npc']:
        p = await pg.evaluate("(w=>{ const n=GAME.npc[w]; return [+n.obj.position.x.toFixed(2), +n.obj.position.z.toFixed(2)]; })", YT)
        await L.go_to(pg, cdp, R, p[0], p[1], 1.0, '語彤', max_s=40); await D.settle(pg)
        st = await pg.evaluate(ST); R.note('%s 走到語彤旁邊，互動鍵「%s」' % (tag, st['interact']))
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1200)
        g_lines, g_menus = await talk(pg, cdp, tag + ' 送', 'yz_%s_give' % case, ['送她', '冷泡'])
        lp = await pg.evaluate("(()=>({kind:GIFT.lastPick&&GIFT.lastPick.kind, lines:GIFT.lastPick&&GIFT.lastPick.lines, carry:GIFT.carry(GAME.G).map(c=>c.n)}))()")
        R.note('%s GIFT.lastPick %s' % (tag, J(lp)))
        R.check('%s 當場送她＝當班那一句（lastPick.kind＝shift）' % tag, lp.get('kind') == 'shift', J(lp))
        rec['give'] = {'lines': g_lines, 'menus': g_menus, 'pick': lp}
    res[case] = rec


async def main():
    print('CC 一盞外帶：SHA %s；TERM %s' % (SHA or '?', TERM), flush=True)
    res = {'sha': SHA}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); sys.exit(1)
        sc = await pg.evaluate(SCAN, {'term': TERM, 'zone': ZONE, 'who': YT}); res['scan'] = sc
        R.note('語彤作息掃描（%s 第 2 週起整學期、週三～週日 12:30～19:00）：當班 %s；不當班 %s' % (TERM, J(sc['on']), J(sc['off'])))
        for case, slot in (('OFF', sc['off']), ('ON', sc['on'])):
            if not R.check('[%s] 掃得到這種時段' % case, bool(slot), ''): continue
            try: await one(pg, cdp, case, slot, res)
            except Exception as e: R.check('[%s] 沒有探針例外' % case, False, str(e)[:200])
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    open(os.path.join(OUT, 'yizhan_take.json'), 'w', encoding='utf-8').write(J(res))
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
