"""CC（帳號 A）11-04：GG_ext_glb「沒有標記的群組」差 1（LAWWW 04:40／LAWWW2 gg_ext_nav2_1104/README.md）：
  一般網址、?nobldg 各一次：【前置／捷徑】讀檔到公館 17:30（條件事件關閉），等正式模型（一般網址），跑 LAWWW2 README 那一行 JS，印出兩份群組名稱清單和差集。只記錄（INFO），不判 PASS／FAIL；只有載入失敗、JS 例外算 FAIL。
用法：LW_TESTS=<wt>/tests python3 cc_gg_groups_probe.py <url> <out>"""
import os, sys, json, asyncio
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
FAILS = []
GROUPS = r"""(()=>{ const z=GAME.E.zone, skip=new Set(GAME.E.lampGlows||[]); const shown=m=>{ for(let p=m;p&&p!==z.group;p=p.parent) if(!p.visible) return false; return true; }; return z.group.children.filter(o=>o.isGroup&&!(o.userData&&(o.userData.ggShop||o.userData.ggScooter||o.userData.ckTag||o.userData.ggMrt))&&!/_glb$|Fallback$/.test(o.name)&&o.name!=='gg_kit_scooters').map(o=>{ let v=false; o.traverse(m=>{ if(!v&&(m.isMesh||m.isSprite)&&!skip.has(m)&&shown(m)) v=true; }); return (o.name||'(無名)')+(v?'':'[空]')+'@'+o.position.x.toFixed(1)+','+o.position.z.toFixed(1); }); })()"""
GLBREADY = "(()=>{ const z=GAME.E.zone; const g=z&&z.group&&z.group.children.find(o=>o.name==='gongguan_shops_glb'); if(!g) return false; let m=0; g.traverse(o=>{ if(o.isMesh) m++; }); return m>0; })()"


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)


async def one(p, formal):
    url = URL if formal else URL + ('&' if '?' in URL else '?') + 'nobldg'
    tag = '一般網址' if formal else '?nobldg'
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    await pg.goto(url); check('%s：遊戲載入' % tag, await L.wait_loaded(pg))
    print('  [前置／捷徑] 讀檔到公館 17:30 (−30,14)，條件事件關閉', flush=True)
    await L.load_state(pg, {'zone': 'gongguan', 'hour': 17.5, 'pos': {'x': -30, 'z': 14, 'yaw': 1.5708}}, quiet_events=True)
    if formal:
        for _ in range(240):
            if await pg.evaluate(GLBREADY): break
            await pg.wait_for_timeout(250)
    await pg.wait_for_timeout(3000)
    g = await pg.evaluate(GROUPS)
    print('INFO %s：%d 個群組（空的 %d）' % (tag, len(g), sum(1 for x in g if '[空]' in x)), flush=True)
    for x in g: print('    ' + x, flush=True)
    check('%s：沒有 JS 例外' % tag, not errs, J(errs[:3]))
    await b.close(); return g


async def main():
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        f = await one(p, True); n = await one(p, False)
    strip = lambda s: s.split('@')[0]
    fn, nn = [strip(x) for x in f], [strip(x) for x in n]
    from collections import Counter
    cf, cn = Counter(fn), Counter(nn)
    print('INFO 只在一般網址：%s' % J(sorted((cf - cn).elements())), flush=True)
    print('INFO 只在 ?nobldg：%s' % J(sorted((cn - cf).elements())), flush=True)
    json.dump({'formal': f, 'nobldg': n}, open(os.path.join(OUT, 'groups.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS)), flush=True)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
