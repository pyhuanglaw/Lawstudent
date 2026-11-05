"""CC-C（帳號 C）11-05：GUITAR_DORM（BB-C 04:40 派工；LAWWW-C GUITAR-OUTER-MENU-1105，BB-C 04:48 用 13700be8f）——宿舍 203「彈吉他」移到外層。判定歸 BB。
  期望（BB-C 04:40；旁白照 AA_693 2-4，企劃線 c4b14a901，同 cc_guitar_x196_play.py 的 T['dorm']）：
    有琴（OWN_GUITAR）：房間裡外層有「彈吉他」按鈕（和「坐在書桌前」「睡覺」「看看房間裡的東西」同一層），位置在自己書桌前；
      照玩家走過去按：轉暗、30 分鐘、旁白兩句之一（阿凱還是室友＝兩句都可能）；「看看房間裡的東西」裡面不再有「彈吉他」。
    沒琴：外層沒有「彈吉他」；「看看房間裡的東西」裡面也沒有。
  各拍一張。【前置】讀檔宿舍 2025-10-14（二）22:00、吉他社社員；有琴那一組另設 OWN_GUITAR＝entry。
用法：LW_TESTS=<wt>/tests [CASES=own,none] python3 cc_guitar_dorm_probe.py <url> <out>"""
import os, sys, json, asyncio, math, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
CASES = [c for c in (os.environ.get('CASES') or 'own,none').split(',') if c]
R = L.Run('guitar_dorm', OUT)
DORM = ['（你練了刷法。阿凱戴上耳機。）', '（你彈了一首社課教的歌，彈到副歌就忘了。）']   # AA_693 2-4（c4b14a901）
LABEL = '彈吉他'
ITS = r"""(()=>{ const P=GAME.E.player.obj.position; return (GAME.E.interactables||[]).filter(i=>i&&!i.hidden).map(i=>({x:+(+i.x).toFixed(2),z:+(+i.z).toFixed(2),label:i.label||'',guitar:i.guitar||null,r:i.radius||1,d:+Math.hypot(i.x-P.x,i.z-P.z).toFixed(2)})); })()"""
UI = r"""(()=>{ const t=(document.getElementById('dlgText')||{}).textContent||'', ch=document.getElementById('choices'); const open=!!ch&&!ch.classList.contains('hide');
  const opts=open?[...ch.querySelectorAll('button')].filter(b=>b.offsetParent!==null).map(b=>(b.innerText||b.textContent||'').trim()):[]; const it=document.getElementById('interact');
  return {dlg:!!(GAME.D&&GAME.D.active), text:t, opts, hour:+(+GAME.G.hour).toFixed(3), zone:GAME.G.zone, busy:!!GAME.E.player.busy,
    interact:(it&&!it.classList.contains('hide')&&getComputedStyle(it).display!=='none')?(it.textContent||'').trim():''}; })()"""
SAYHOOK = r"""(()=>{ if(window.__ccSayOn) return true; window.__ccSay=[]; const s0=GAME.say; GAME.say=function(who,t){ try{ window.__ccSay.push({t:String(t), h:+(+GAME.G.hour).toFixed(3)}); }catch(e){} return s0.apply(this,arguments); }; window.__ccSayOn=true; return true; })()"""


async def pick(pg, cdp, pred):
    ok = await pg.evaluate("(src=>{ const f=new Function('t','return ('+src+')(t)'); const ch=document.getElementById('choices'); if(!ch) return false; const b=[...ch.querySelectorAll('button')].filter(x=>x.offsetParent!==null).find(x=>f((x.innerText||x.textContent||'').trim())); if(!b) return false; b.setAttribute('data-ccpick','1'); return true; })", pred)
    if not ok: return False
    await L.tap(pg, cdp, '[data-ccpick="1"]'); await pg.wait_for_timeout(700)
    await pg.evaluate("(()=>{ const b=document.querySelector('[data-ccpick]'); if(b) b.removeAttribute('data-ccpick'); })()")
    return True


async def go_and_tap(pg, cdp, tag, it):
    await L.go_to(pg, cdp, R, it['x'], it['z'], 0.3, '%s %s' % (tag, it['label']), max_s=120)
    u = await pg.evaluate(UI)
    for _ in range(10):
        if u['interact'].startswith(it['label']): break
        await pg.wait_for_timeout(500); u = await pg.evaluate(UI)
    if not R.check('%s 走到「%s」旁邊，互動按鈕是它' % (tag, it['label']), u['interact'].startswith(it['label']), J(u['interact'])): return False
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500); return True


async def room_items_menu(pg, cdp, tag):
    its = await pg.evaluate(ITS); look = next((i for i in its if i['label'].startswith('看看房間裡的東西')), None)
    if not R.check('%s 有「看看房間裡的東西」' % tag, bool(look), J([i['label'] for i in its])): return None
    if not await go_and_tap(pg, cdp, tag, look): return None
    menu = None
    for _ in range(20):
        u = await pg.evaluate(UI)
        if u['opts']: menu = u['opts']; break
        if u['dlg']: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(500)
    await R.shot(pg, '%s_room_items' % tag.strip('[]'))
    if menu: await pick(pg, cdp, "t=>t.startsWith('不看了')")
    for _ in range(10):
        u = await pg.evaluate(UI)
        if not u['opts'] and not u['dlg'] and not u['busy']: break
        if u['dlg']: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(500)
    return menu


async def case(pg, cdp, own):
    tag = '[有琴]' if own else '[沒琴]'
    d = await pg.evaluate("STORY.dayOfKey('2025-10-14')")
    R.setup('%s 讀檔宿舍 2025-10-14（二）22:00、吉他社社員%s' % (tag, '、OWN_GUITAR＝entry' if own else '、沒有琴'))
    await L.load_state(pg, {'zone': 'dorm', 'hour': 22.0, 'day': d, 'weather': 'clear'}, quiet_phone=True)
    await pg.wait_for_timeout(5000); await L.close_panels(pg, cdp)
    await pg.evaluate("((own)=>{ const F=GAME.G.flags; F.EXCHANGE_ROUTE='TW'; F.ROOM_Y2=false; F.CLUB_club_guitar=true; if(own){ F.OWN_GUITAR='entry'; GUITAR.rec(GAME.G).items.entry=GAME.G.day-1; } else { delete F.OWN_GUITAR; } })", own)
    await pg.wait_for_timeout(1500); await pg.evaluate(SAYHOOK)
    its = await pg.evaluate(ITS); g = next((i for i in its if i['label'].startswith(LABEL)), None)
    lst = await pg.evaluate("(()=>STORY.roomItemList(GAME.G).map(r=>r[0]))()")
    R.note('%s 房間的按鈕 %s；房間物件 %s' % (tag, J([[i['label'], i['x'], i['z']] for i in its]), J(lst)))
    if own:
        desk = next((i for i in its if i['label'].startswith('坐在書桌前')), None)
        spot = await pg.evaluate("(()=>{ const R=DORM_ROOM, U=R.units.find(u=>u.id===(R.player_unit||'L2')); return {unit:U.id, seat:[U.seat.x,U.seat.z], ap:U.seat_approach, all:R.units.filter(u=>u.seat).map(u=>({id:u.id, seat:[u.seat.x,u.seat.z]}))}; })()")
        R.note('%s 自己的書桌：%s；「坐在書桌前」%s' % (tag, J(spot), J(desk)))
        R.check('%s 外層有「%s」按鈕' % (tag, LABEL), bool(g), J([i['label'] for i in its]))
        if g:
            ds = sorted([[round(math.hypot(g['x'] - u['seat'][0], g['z'] - u['seat'][1]), 2), u['id']] for u in spot['all']])
            R.check('%s 位置在自己書桌前：離它最近的書桌是自己的（%s 號；各書桌距離 %s）' % (tag, spot['unit'], J(ds)), bool(ds) and ds[0][1] == spot['unit'], J({'btn': [g['x'], g['z']], 'seat': spot['seat'], 'ap': spot['ap']}))
        R.check('%s「看看房間裡的東西」的物件清單不再有「%s」（STORY.roomItemList）' % (tag, LABEL), LABEL not in lst, J(lst))
        menu = await room_items_menu(pg, cdp, tag)
        R.check('%s 照玩家點「看看房間裡的東西」：選單裡沒有「%s」' % (tag, LABEL), menu is not None and not any(o.startswith(LABEL) for o in menu), J(menu))
        if not g: return
        n0 = len(await pg.evaluate("window.__ccSay||[]"))   # 按下去以前記（PC 11-05：轉暗＋旁白在按下去後 1.5 秒內就演完，原本漏記）
        if not await go_and_tap(pg, cdp, tag, g): return
        for _ in range(60):
            u = await pg.evaluate(UI)
            if u['dlg'] and u['text']: break
            await pg.wait_for_timeout(300)
        S1 = (await pg.evaluate("window.__ccSay||[]"))[n0:]
        await R.shot(pg, 'own_play_line')
        nar = next((x for x in S1 if x['t'] in DORM), None)
        hb = await pg.evaluate("(()=>window.__ccH0||null)()")
        R.note('%s 按下去以後的台詞 %s' % (tag, J(S1)))
        for _ in range(20):
            u = await pg.evaluate(UI)
            if not u['dlg'] and not u['busy'] and not u['opts']: break
            if u['dlg']: await L.tap(pg, cdp, '#dlg')
            await pg.wait_for_timeout(400)
        R.check('%s 按下去：旁白是 AA_693 兩句之一（%s）' % (tag, nar and nar['t']), bool(nar), J(S1))
        return nar
    else:
        R.check('%s 外層沒有「%s」' % (tag, LABEL), not g, J(g))
        R.check('%s 房間物件清單沒有「%s」' % (tag, LABEL), LABEL not in lst, J(lst))
        menu = await room_items_menu(pg, cdp, tag)
        R.check('%s 照玩家點「看看房間裡的東西」：選單裡沒有「%s」' % (tag, LABEL), menu is not None and not any(o.startswith(LABEL) for o in menu), J(menu))
        await R.shot(pg, 'none_room')


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC GUITAR_DORM（宿舍「彈吉他」移外層）：CASES=%s；SHA=%s（worktree 實際 %s）；Windows＋GPU／SwiftShader ≠ iPhone' % (CASES, os.environ.get('SHA', '?'), real or '?'), flush=True)
    for c in CASES:
        async with async_playwright() as p:
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
            await cc_det.install(pg, 20261105)
            await pg.goto(URL); ok = await L.wait_loaded(pg); R.check('[%s] 遊戲載入' % c, ok, '')
            if ok:
                await pg.evaluate("localStorage.clear()")
                if c == 'own':
                    # 30 分鐘：按下去那一刻的時間（走過去的時間不算）
                    await pg.evaluate("(()=>{ const f=GUITAR.playDorm; GUITAR.playDorm=async function(GM){ window.__ccH0=+GM.G.hour; const r=await f.apply(this,arguments); window.__ccH1=+GM.G.hour; return r; }; })()")
                    nar = await case(pg, cdp, True)
                    h = await pg.evaluate("[window.__ccH0||null, window.__ccH1||null]")
                    if h[0] is not None and h[1] is not None:
                        R.check('[有琴] 轉暗、30 分鐘（%.2f → %.2f）' % (h[0], h[1]), abs(h[1] - h[0] - 0.5) < 0.05, J(h))
                    else: R.check('[有琴] 轉暗、30 分鐘', False, J(h))
                else:
                    await case(pg, cdp, False)
            R.check('[%s] 沒有 JS 例外' % c, not errs, J(errs[:3]))
            await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
