"""CC（帳號 A）11-02 BB_245 第二批瀏覽器探針共用的小工具（cc_b245_*_probe.py 用；本身不是探針）。
check／info／setup（【前置／捷徑】）、讀檔、點 #interact、點選項（startswith）、等選項、收 caption（MutationObserver）。
playlib 由 LW_TESTS（受測或目標工作樹的 tests/）載入。"""
import os, sys, json
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests'))
import playlib as L  # noqa: E402

J = lambda o: json.dumps(o, ensure_ascii=False)
FAILS = []
BASE_FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True,
              'zheNoodleDone': True, 'fundsV2': 1, 'allowanceMonth': 9, 'KX_FIRST_MSG': True}


def check(name, ok, info_=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info_) if info_ else ''), flush=True)
    if not ok: FAILS.append(name)
    return ok


def info(s): print('INFO ' + s, flush=True)


def setup(s): print('  【前置／捷徑】' + s, flush=True)


def finish():
    print('ALL PASS' if not FAILS else 'FAILED %d：%s' % (len(FAILS), '、'.join(FAILS)), flush=True)
    return 1 if FAILS else 0


def st(zone, hour, x, z, yaw=0.0, day=7, weekday=2, lv=0, flags=None, extra=None):
    f = dict(BASE_FLAGS); f.update(flags or {})
    s = {'zone': zone, 'hour': hour, 'day': day, 'weekday': weekday, 'weather': 'sunny', 'pos': {'x': x, 'z': z, 'yaw': yaw, 'lv': lv}, 'flags': f, 'energy': 80,
         'visited': {k: True for k in ('dorm', 'campus', 'gongguan', 'wenzhou', 'classroom', 'library', 'library_hall', 'cafe', 'linze', 'wancai')}}
    s.update(extra or {})
    return s


async def load(pg, s, label):
    setup('load_state（quiet_events）%s' % label)
    await L.load_state(pg, s, quiet_events=True)
    await pg.wait_for_timeout(3500)


async def choices(pg):
    return await pg.evaluate("(()=>{ const ch=document.getElementById('choices'); if(!ch||ch.classList.contains('hide')) return []; return [...ch.querySelectorAll('button')].map(b=>(b.textContent||'').trim()); })()")


async def tap_choice(pg, cdp, prefix):
    c = await pg.evaluate("(p=>{ const b=[...document.querySelectorAll('#choices button')].find(x=>(x.textContent||'').trim().startsWith(p)); if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%s)" % J(prefix))
    if not c: return False
    await L.touch_tap(cdp, c[0], c[1]); return True


async def wait_choices(pg, s=40):
    for _ in range(int(s * 2.5)):
        ch = await choices(pg)
        if ch: return ch
        await pg.wait_for_timeout(400)
    return []


async def interact_label(pg):
    return await pg.evaluate("(()=>{ const it=document.getElementById('interact'); return (it&&!it.classList.contains('hide')&&getComputedStyle(it).display!=='none')?(it.textContent||'').trim():''; })()")


async def tap_interact(pg, cdp, s=20):
    """等 #interact 出現（遊戲照最近的互動點顯示）再用手指點一下；回傳按下去時的字"""
    for _ in range(int(s * 2.5)):
        t = await interact_label(pg)
        if t:
            await L.tap(pg, cdp, '#interact'); return t
        await pg.wait_for_timeout(400)
    return ''


CAP_HOOK = """(()=>{ if(window.__ccCap) return 'already'; window.__ccCap=[]; const el=document.getElementById('caption'); if(!el) return 'no #caption';
  const mo=new MutationObserver(()=>{ const t=(el.textContent||'').trim(); const a=window.__ccCap; if(t&&(!a.length||a[a.length-1].t!==t||a[a.length-1].z!==GAME.G.zone)) a.push({t, z:GAME.G.zone, h:+GAME.G.hour.toFixed(3)}); });
  mo.observe(el,{childList:true,subtree:true,characterData:true,attributes:true}); return 'ok'; })()"""


async def dismiss_dialogs(pg, cdp, n=8):
    """對話框開著（GAME.D.active）：像玩家一樣點對話框往下（最多 n 次）"""
    for _ in range(n):
        if not await pg.evaluate("!!(GAME.D&&GAME.D.active)"): return
        await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700)
