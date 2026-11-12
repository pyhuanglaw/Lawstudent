"""CC-C 11-12：送學姊帝大紅茶的「紅茶（中）」她演不演紅茶那一句（AA_710@335301d353 → ad4b2ad076 gift_lines.js 學姊 opinion「紅茶」ns 紅茶／紅茶（中）／紅茶（大）；LAWWW-C 11:22 交排 de8d72d279，範圍照 BB）。結果給 BB 判。Playwright（PC GPU）≠ iPhone。
每一樣（ITEMS，預設 紅茶（中）、紅茶（大）、紅茶、奶茶（中）對照）各自重新讀檔：
  【前置／捷徑】讀檔到 ZONE（預設 campus）DAY HOUR（條件事件關掉；和學姊認識）→ 先記帝大紅茶的禮物菜單（GIFT.menu(G,'帝大紅茶')：買得到的品名、選項）→
  【捷徑】手上放一杯（照 GIFT.buy 買完放進 G.carry 的同一個樣子：{n, cat, day, shop:'帝大紅茶'}）→【捷徑】學姊放在祐廷前面 1.3 m →
  真的走過去按互動 → 選單裡找「送她<品名>」按（找不到＝記下選單、改呼叫 GIFT.give，標捷徑）→ 一句一句記 → 記 GIFT.lastPick（kind：opinion／yes／fav…、哪一組）。
CC_02 清單 2026-11-12：1✓（平日下午） 2✓（品名、選項從遊戲的禮物菜單找） 3✓（每一樣重新讀檔） 4✓（選項照字「送她…」） 5✓（走到她旁邊按） 6✓（讀檔等 6 秒、一句一句點） 7✓ 8n/a（不判，字給 BB） 9n/a（不藏人：要看她） 10✓（條件事件關掉） 11✓ 12✓（每一樣同樣欄位、有奶茶對照） 13✓（讀檔、手上那杯、她的位置是捷徑，標）
用法：LW_TESTS=<wt>/tests SHA=<sha> [ZONE=campus] [DAY=2025-10-14] [HOUR=15] [ITEMS=紅茶（中）,紅茶（大）,紅茶,奶茶（中）] [WHO=heroine_05] python3 cc_gift_redtea_probe.py <url> <out>"""
import os, sys, json, asyncio
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SHA = (os.environ.get('SHA') or '')[:10]; ZONE = os.environ.get('ZONE') or 'campus'; DAY = os.environ.get('DAY') or '2025-10-14'; HOUR = float(os.environ.get('HOUR') or 15)
ITEMS = [x for x in (os.environ.get('ITEMS') or '紅茶（中）,紅茶（大）,紅茶,奶茶（中）').split(',') if x]
WHO = os.environ.get('WHO') or 'heroine_05'
R = L.Run('gift_redtea', OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
ST = r"""(()=>{ const d=document.getElementById('dlg'); return {dlg:!!(d&&d.offsetParent), t:(document.getElementById('dlgText')||{}).textContent||'', who:(document.getElementById('dlgName')||{}).textContent||'',
  choices:[...document.querySelectorAll('#choices button')].filter(b=>b.offsetParent).map(b=>b.textContent.trim()), busy:!!(GAME.E.player&&GAME.E.player.busy), interact:(document.getElementById('interact')||{}).textContent||''}; })()"""
MENU = r"""(()=>{ try{ return GIFT.menu(GAME.G,'帝大紅茶').map(it=>({n:it.n, p:it.p, cat:it.cat, opt:it.opt||null})); }catch(e){ return 'ERR '+String(e).slice(0,80); } })()"""
PREP = r"""(a=>{ const G=GAME.G, E=GAME.E; G.flags=G.flags||{}; G.flags['met_'+a.who]=true; if(typeof SOCIAL!=='undefined'&&SOCIAL.meet) try{ SOCIAL.meet(a.who); }catch(e){}
  const base=a.item.replace(/（.*）$/,''); let cat='drink'; try{ const m=GIFT.menu(G,'帝大紅茶').find(it=>it.n===base||it.n===a.item); if(m&&m.cat) cat=m.cat; }catch(e){}
  const C=GIFT.carry(G); C.length=0; const c={n:a.item, cat, day:G.day, shop:'帝大紅茶'}; C.push(c);
  if(GAME.npc&&GAME.npc[a.who]&&GAME.removeNPC) GAME.removeNPC(a.who);
  const P=E.player.obj, yaw=P.rotation.y, x=P.position.x+Math.sin(yaw)*1.3, z=P.position.z+Math.cos(yaw)*1.3;
  const n=GAME.spawnCharacter(a.who,x,z,{yaw:yaw+Math.PI, pose:'idle'}); if(n){ n.frozen=true; }
  return {carry:C.slice(), npc:n?{x:+n.obj.position.x.toFixed(2), z:+n.obj.position.z.toFixed(2)}:null, pickPreview:GIFT.pick(G,a.who,c), known:typeof STORY!=='undefined'&&STORY.knows?STORY.knows(a.who,G):null}; })"""


async def one(pg, cdp, item, res):
    tag = '[%s]' % item
    s = await D.load_zone(pg, cdp, ZONE, DAY, HOUR, wait=6000)
    pre = await pg.evaluate(PREP, {'who': WHO, 'item': item})
    R.setup('%s 【前置／捷徑】讀檔到 %s %s %.1f（條件事件關掉）；【捷徑】手上一杯 %s；【捷徑】%s 放在前面 1.3 m %s' % (tag, ZONE, DAY, HOUR, J(pre['carry']), WHO, J(pre['npc'])))
    R.note('%s 送之前先算的反應（GIFT.pick，不會記）：%s；STORY.knows=%s' % (tag, J(pre['pickPreview']), pre['known']))
    if not R.check('%s 她站出來了' % tag, bool(pre['npc']), ''): return
    await L.go_to(pg, cdp, R, pre['npc']['x'], pre['npc']['z'], 1.0, WHO, max_s=30)
    st = await pg.evaluate(ST); R.note('%s 互動鍵「%s」' % (tag, st['interact']))
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1200)
    lines, menus, gave, via = [], [], False, 'talk'
    for k in range(60):
        st = await pg.evaluate(ST)
        if st['choices']:
            menus.append(st['choices']); want = next((i for i, t in enumerate(st['choices']) if t.startswith('送') and item in t), None)
            if want is None and not gave:
                bye = next((i for i, t in enumerate(st['choices']) if any(w in t for w in ('算了', '沒事', '離開', '再見'))), len(st['choices']) - 1)
                i = bye
            else:
                i = want if want is not None else 0
                if want is not None: gave = True
            lines.append('▶ ' + st['choices'][i])
            await pg.screenshot(path=os.path.join(OUT, 'gift_%s_menu_%02d.png' % (len(res), len(menus))))
            await pg.evaluate("(i=>{ const b=[...document.querySelectorAll('#choices button')].filter(x=>x.offsetParent); (b[i]||b[0]).click(); })(%d)" % i); await pg.wait_for_timeout(800); continue
        if st['dlg']:
            ln = st['who'] + '｜' + st['t']
            if not lines or lines[-1] != ln:
                lines.append(ln); await pg.screenshot(path=os.path.join(OUT, 'gift_%s_line_%02d.png' % (len(res), len(lines))))
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
        if not st['busy'] and k > 1: break
        await pg.wait_for_timeout(500)
    if not gave:
        via = 'GIFT.give（捷徑：選單沒有「送她%s」）' % item
        await pg.evaluate("(a=>{ window.__gv=undefined; const c=GIFT.carry(GAME.G).find(x=>x.n===a.item); GIFT.give(GAME,{name:(CHARACTERS[a.who]||{}).name},a.who,c).then(r=>{ window.__gv=r; }); })", {'who': WHO, 'item': item})
        for k in range(40):
            st = await pg.evaluate(ST)
            if st['dlg']:
                ln = st['who'] + '｜' + st['t']
                if not lines or lines[-1] != ln: lines.append(ln)
                await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
            if await pg.evaluate("window.__gv!==undefined"): break
            await pg.wait_for_timeout(400)
    lp = await pg.evaluate("(()=>({lastPick:GIFT.lastPick||null, carry:GIFT.carry(GAME.G).map(c=>c.n), last:(GAME.G.flags.GIFT||{}).last}))()")
    res.append({'item': item, 'via': via, 'lines': lines, 'menus': menus, 'pick': lp, 'pre': pre['pickPreview']})
    R.note('%s 怎麼送：%s；選單 %s' % (tag, via, J(menus)))
    R.note('%s 整段：%s' % (tag, J(lines)))
    R.note('%s GIFT.lastPick：%s' % (tag, J(lp)))
    R.check('%s 送得出去（有她的反應）' % tag, bool(lp.get('lastPick')) and len(lines) >= 2, '')


async def main():
    print('CC 送學姊紅茶：SHA %s；%s %s %.1f；ITEMS %s；WHO %s' % (SHA or '?', ZONE, DAY, HOUR, ITEMS, WHO), flush=True)
    res = []
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); sys.exit(1)
        await D.load_zone(pg, cdp, ZONE, DAY, HOUR, wait=4000)
        menu = await pg.evaluate(MENU); R.note('帝大紅茶的禮物菜單（GIFT.menu）：%s' % J(menu))
        for it in ITEMS:
            try: await one(pg, cdp, it, res)
            except Exception as e: R.check('[%s] 沒有探針例外' % it, False, str(e)[:200])
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    open(os.path.join(OUT, 'gift_redtea.json'), 'w', encoding='utf-8').write(J({'sha': SHA, 'menu': menu, 'res': res}))
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
