"""CC-C（帳號 C）11-05：手機「地點」頁（快速前往）——QUICK-TRAVEL-AREAS-1105（12cb1426c 起）全部地點分地區兩層：
  一開始只展開「你所在的地區」，其他地區要先點地區（[data-parea="..."]）才看得到店（[data-place="<zone>|<名字>"]）。
  reveal(pg, cdp, zone)：照玩家——那一間的按鈕不在畫面上，就一個一個點還沒展開的地區，直到看到它（舊版本沒有分區＝直接回 True）。"""
import playlib as L

HAS = "(z=>!![...document.querySelectorAll('#phoneBody [data-place]')].find(b=>b.dataset.place.startsWith(z+'|')||b.dataset.place===z))"
AREAS = "(()=>[...document.querySelectorAll('#phoneBody [data-parea]')].map(b=>({id:b.dataset.parea, on:b.getAttribute('aria-expanded')==='true'})))()"


async def reveal(pg, cdp, zone, tries=12):
    if await pg.evaluate(HAS, zone): return True
    seen = set()
    for _ in range(tries):
        areas = await pg.evaluate(AREAS)
        if not areas: return False
        nxt = next((a for a in areas if not a['on'] and a['id'] not in seen), None)
        if not nxt: return False
        seen.add(nxt['id'])
        await L.tap(pg, cdp, '#phoneBody [data-parea="%s"]' % nxt['id']); await pg.wait_for_timeout(600)
        if await pg.evaluate(HAS, zone): return True
    return False


async def all_rows(pg, cdp, js, key='rows', tries=16):
    """要看「全部地點」的探針（例：退宿後列表裡有沒有宿舍）：先讀一次（目前展開的地區＋上面的固定列），
      再照玩家一個一個點還沒看過的地區、每點一次讀一次，合併成一份（順序＝第一次讀到的在前）。回傳 js 的結果，多 areas 欄位。"""
    r = await pg.evaluate(js)
    if not r: return r
    seen_rows = {(x.get('name'), x.get('place'), x.get('gohome')) for x in r[key]}
    done = {a['id'] for a in (await pg.evaluate(AREAS)) if a['on']}
    order = [a['id'] for a in await pg.evaluate(AREAS)]
    for _ in range(tries):
        areas = await pg.evaluate(AREAS)
        nxt = next((a for a in areas if a['id'] not in done), None)
        if not nxt: break
        done.add(nxt['id'])
        await L.tap(pg, cdp, '#phoneBody [data-parea="%s"]' % nxt['id']); await pg.wait_for_timeout(600)
        q = await pg.evaluate(js)
        for x in (q or {}).get(key, []):
            k = (x.get('name'), x.get('place'), x.get('gohome'))
            if k not in seen_rows: seen_rows.add(k); x['area'] = nxt['id']; r[key].append(x)
    r['areas'] = order
    return r
