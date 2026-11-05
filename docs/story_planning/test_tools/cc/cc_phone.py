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
