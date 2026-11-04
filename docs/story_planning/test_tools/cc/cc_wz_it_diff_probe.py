"""CC（帳號 A）11-04：溫州街互動點「正式模型 vs ?nobldg」差在哪（LAWWW 07:51：wz_street_integration「互動點完全相同」FAIL，39 對 39 個，log 沒寫哪幾個）。
  【前置／捷徑】兩個網址各讀檔到溫州街 (0, 1.6) 14:00（條件事件關閉）→ 等 25 秒（正式模型載好）→ 列出所有互動點（label、x、z、radius、exit.to、wzShop、hidden）→ 逐一比對、印出不同的。
用法：LW_TESTS=<wt>/tests python3 cc_wz_it_diff_probe.py <url> <out>"""
import os, sys, json, asyncio
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
LIST = "(()=>GAME.E.interactables.map(i=>({label:i.label||'',x:+(+i.x).toFixed(2),z:+(+i.z).toFixed(2),r:+(+(i.radius||0)).toFixed(2),to:i.exit&&i.exit.to||null,wz:i.wzShop||null,hidden:!!i.hidden,seat:!!i.seat})))()"


async def grab(p, url):
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    await pg.goto(url); await L.wait_loaded(pg)
    await pg.evaluate("localStorage.clear(); if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}")
    await L.load_state(pg, {'zone': 'wenzhou', 'hour': 14.0, 'weather': 'clear', 'pos': {'x': 0, 'z': 1.6, 'yaw': 0, 'lv': 0}}, quiet_events=True)
    await pg.wait_for_timeout(25000)
    its = await pg.evaluate(LIST); await b.close(); return its


async def main():
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        a = await grab(p, URL)
        n = await grab(p, URL + ('&' if '?' in URL else '?') + 'nobldg')
    key = lambda i: (i['label'], i['x'], i['z'], i['r'])
    ka, kn = {key(i): i for i in a}, {key(i): i for i in n}
    only_a = [ka[k] for k in ka if k not in kn]; only_n = [kn[k] for k in kn if k not in ka]
    print('正式 %d 個、?nobldg %d 個' % (len(a), len(n)), flush=True)
    print('只在正式模型（%d）：%s' % (len(only_a), J(only_a)), flush=True)
    print('只在 ?nobldg（%d）：%s' % (len(only_n), J(only_n)), flush=True)
    # 同名但位置／半徑不同
    by = {}
    for i in only_a: by.setdefault(i['label'], [None, None])[0] = i
    for i in only_n: by.setdefault(i['label'], [None, None])[1] = i
    for lb, (x, y) in by.items():
        if x and y: print('同名不同位置：%s  正式 (%s,%s) r%s ／ nobldg (%s,%s) r%s' % (lb, x['x'], x['z'], x['r'], y['x'], y['z'], y['r']), flush=True)
    json.dump({'formal': a, 'nobldg': n}, open(os.path.join(OUT, 'its.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('INFO 只是列出差異，不判 PASS／FAIL', flush=True)

asyncio.run(main())
