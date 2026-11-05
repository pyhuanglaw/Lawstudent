"""CC-C（帳號 C）11-04：TAPPREF_zone（BB-C 14:54；engine3d.js:496 的 tapPref 比 E.zone.id——LAWWW-C 048b4c898 以前 E.zone.id 都是 undefined，兩邊相等，
  在溫州街點過的位置會被帶進別的區域，當成「點地面走過來的」偏好去選互動點）。
  期望值的出處：BB-C 14:54「確認拿到的是一盞自己的互動點，不是溫州街那個位置留下來的偏好」；engine3d.js:496 的註解（tapPref 只算同一區、同一層）。
  做法（玩家操作：點地面、按互動鈕；只有讀檔和旗標是【前置／捷徑】）：
    0. 偵察：讀檔到溫州街、走到「進去一盞」按互動鈕進門，記進門那一刻玩家的位置、範圍內的互動點（哪一個離人最近）。
    1. 重新讀檔到溫州街、走到門口（按鈕出現）；
       - 偵察時範圍內有兩個以上 → 在溫州街點「不是最近的那一個」的座標（點得到的話），這樣舊版一定會選錯；
       - 點不到或只有一個 → 點門口前方的路面（只能驗 tapPref 有沒有生效，選不出差別）。
       點下去人開始走，趁按鈕還在按「進去一盞」（＝走到一半就進門）。
    2. 進門後馬上記：P.tapPref、E.zone.id、tapPref 有沒有生效（zone、lv 都一樣才生效）、互動鈕上的字、不算 tapPref 時離人最近的那一個；然後按互動鈕，記發生什麼。
  檢查：①進門後溫州街留下的 tapPref 不生效 ②（選得出差別時）互動鈕是離人最近的那一個。修改前（e9b3b82bf）①要 FAIL，修改後（048b4c898）要 PASS。
  Windows＋GPU（電腦）／SwiftShader（雲端）≠ iPhone。
用法：LW_TESTS=<wt>/tests python3 cc_tappref_zone_probe.py <url> <out>"""
import os, sys, json, asyncio, time, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
URL = os.environ.get('LIVE_URL') or URL   # CC-C 11-05 LIVE_V91020：PC 佇列在線上網址跑（runner 給的是本機網址，LIVE_URL 蓋過）
J = lambda o: json.dumps(o, ensure_ascii=False)
FAILS = []
DOOR = (-20.5, 4.6, '進去一盞')
START = (-20.5, 2.4)
ZONE = 'wz_teahouse'


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)
    return ok


# 進門那一刻：範圍內的互動點（照 engine3d.js:496 的規則：hidden、別層、高度差、半徑、prio）、不算 tapPref 時誰最近、tapPref 有沒有生效、算 tapPref 時誰會被選
PICK_JS = r"""(()=>{ const E=GAME.E, P=E.player, plv=P.lv|0, py=P.obj.position.y, px=P.obj.position.x, pz=P.obj.position.z; const tp0=P.tapPref||null;
  const tpOn=!!(tp0&&tp0.zone===(E.zone&&E.zone.id)&&(tp0.lv|0)===plv);
  let best=null, bd=1e9, tpIt=null, tpd=1e9; const inR=[];
  for(const it of E.interactables){ if(it.hidden) continue; if(E.levels&&it.lv!==undefined&&(it.lv|0)!==plv) continue; if(it.y!==undefined&&Math.abs(it.y-py)>1.4) continue;
    const d=Math.hypot(it.x-px,it.z-pz), r=it.radius||1.8; if(d>=r) continue; inR.push({label:it.label, x:+(+it.x).toFixed(2), z:+(+it.z).toFixed(2), r, prio:it.prio||0, d:+d.toFixed(2)});
    if(d-(it.prio||0)<bd){ bd=d-(it.prio||0); best=it; }
    if(tpOn){ const dt=Math.hypot(it.x-tp0.x,it.z-tp0.z); if(dt<r&&dt<tpd){ tpd=dt; tpIt=it; } } }
  const btn=document.getElementById('interact'); const shown=btn&&!btn.classList.contains('hide')&&getComputedStyle(btn).display!=='none'?(btn.textContent||'').trim():'';
  return {zone:GAME.G.zone, zoneId:E.zone&&E.zone.id===undefined?'(undefined)':(E.zone&&E.zone.id), pos:[+px.toFixed(2),+pz.toFixed(2)], lv:plv,
    tapPref:tp0?{x:+(+tp0.x).toFixed(2), z:+(+tp0.z).toFixed(2), lv:tp0.lv, zone:tp0.zone===undefined?'(undefined)':tp0.zone}:null, tpActive:tpOn,
    inRange:inR, bestNoTp:best&&best.label, withTp:(tpIt&&tpIt!==best)?tpIt.label:(best&&best.label), button:shown}; })()"""
CAPTION = """(()=>{ for(const id of ['caption','dlg','toast']){ const e=document.getElementById(id); if(e&&!e.classList.contains('hide')){ const t=(e.textContent||'').trim(); if(t) return id+'：'+t.slice(0,80); } } return ''; })()"""
BTN = "(()=>{ const b=document.getElementById('interact'); return b&&!b.classList.contains('hide')&&getComputedStyle(b).display!=='none'?(b.textContent||'').trim():''; })()"


async def to_wenzhou(pg, cdp):
    # 同 cc_wz_shop_shots_probe 的 enter_gate（PC 上進得了門的做法）：帶開場已過的旗標、只關手機自動打開（quiet_events 會連門口的流程一起關）
    st = {'zone': 'wenzhou', 'hour': 14.0, 'weather': 'clear', 'pos': {'x': START[0], 'z': START[1], 'yaw': 0, 'lv': 0},
          'flags': {'introDone': True, 'campusIntro': True, 'classDone': True, 'afternoonDone': True, 'metAn': True, 'WZ_TEA_YARD_IN': True}}
    await L.load_state(pg, st, quiet_phone=True)
    await pg.wait_for_timeout(5000); await L.close_panels(pg, cdp)
    it = await pg.evaluate("(lb=>{ const i=GAME.E.interactables.find(i=>(i.label||'').startsWith(lb)); return i?{x:i.x,z:i.z,r:i.radius||1.2,label:i.label}:null; })(%s)" % J(DOOR[2]))
    return it


async def wait_zone(pg, z, secs=40):
    for _ in range(int(secs * 10)):
        if await pg.evaluate("GAME.G.zone===%s&&!!GAME.E.zone" % J(z)): return True
        await pg.wait_for_timeout(100)
    return False


async def main():
    os.makedirs(OUT, exist_ok=True)
    print('CC TAPPREF_zone：SHA=%s；Windows＋GPU／SwiftShader ≠ iPhone' % os.environ.get('SHA', '?'), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, int(os.environ.get('CC_SEED') or 20261104))
        t0 = time.time(); await pg.goto(URL); ok = await L.wait_loaded(pg); check('遊戲載入', ok, '%.1f 秒' % (time.time() - t0))
        if not ok:
            await b.close(); print('FAILED 1: 遊戲載入', flush=True); sys.exit(1)
        await pg.evaluate("localStorage.clear(); if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}")
        # ---- 0. 偵察 ----
        print('  [前置／捷徑] 讀檔：溫州街 (%s, %s)、14:00、晴；開場已過的旗標＋WZ_TEA_YARD_IN（第一次進門的旁白當看過了，進門後才能馬上按互動鈕）；只關手機自動打開' % (START[0], START[1]), flush=True)
        door = await to_wenzhou(pg, cdp)
        if not check('溫州街有「%s」' % DOOR[2], bool(door), J(door)):
            await b.close(); print('FAILED %d' % len(FAILS), flush=True); sys.exit(1)
        await L.go_to(pg, cdp, L.Run('recon', OUT), door['x'], door['z'], max(0.4, door['r'] * 0.6), door['label'], max_s=120)
        await pg.wait_for_timeout(800)
        b0 = await pg.evaluate(BTN); r0 = await L.tap(pg, cdp, '#interact')
        print('  [偵察] 按之前按鈕「%s」、按下去 %s' % (b0, r0), flush=True)
        okz = await wait_zone(pg, ZONE)
        if not okz: await pg.screenshot(path=os.path.join(OUT, 'recon_fail.png')); print('  [偵察] 沒進門：區域 %s、按鈕「%s」、%s' % (await pg.evaluate('GAME.G.zone'), await pg.evaluate(BTN), await pg.evaluate(CAPTION)), flush=True)
        if not check('[偵察] 按「%s」進得了一盞' % DOOR[2], okz, ''):
            await b.close(); print('FAILED %d' % len(FAILS), flush=True); sys.exit(1)
        await pg.wait_for_timeout(500)
        rec = await pg.evaluate(PICK_JS)
        print('  [偵察] 進門那一刻：%s' % J(rec), flush=True)
        # 偵察本身就是玩家流程：go_to 在溫州街點地面走到門口（tapPref＝溫州街的點）→ 按「進去一盞」→ 一盞
        check('[TAPPREF] 點地面走到門口、按進去：進門後溫州街留下的 tapPref 不生效（tapPref.zone %s、E.zone.id %s）' % (rec['tapPref'] and rec['tapPref']['zone'], rec['zoneId']), not rec['tpActive'], J(rec['tapPref']))
        others = [q for q in rec['inRange'] if q['label'] != rec['bestNoTp']]
        # ---- 1. 溫州街點地面、走到一半進門 ----
        door = await to_wenzhou(pg, cdp)
        await L.go_to(pg, cdp, L.Run('walk', OUT), door['x'], door['z'], max(0.4, door['r'] * 0.6), door['label'], max_s=120)
        await pg.wait_for_timeout(600)
        print('  走到門口：按鈕「%s」' % (await pg.evaluate(BTN)), flush=True)
        tapped = None; mode = ''
        if others:
            c = others[0]
            await L.turn_camera_to(pg, cdp, c['x'], c['z'])
            for dx, dz in [(0, 0), (0.6, 0), (-0.6, 0), (0, 0.6), (0, -0.6)]:
                tapped = await L.tap_ground(pg, cdp, c['x'] + dx, c['z'] + dz)
                if tapped: mode = '點「%s」在一盞裡的座標 (%.1f, %.1f)（溫州街這裡是路面）' % (c['label'], c['x'] + dx, c['z'] + dz); break
        if not tapped:   # 鏡頭在玩家背後（−z 那一側）看向門：挑門的左右、前面的點（後面的點在鏡頭下面點不到）
            for tx, tz in [(door['x'] + 3, door['z'] - 0.3), (door['x'] - 3, door['z'] - 0.3), (door['x'] + 5, door['z'] - 0.6), (door['x'] - 5, door['z'] - 0.6), (door['x'] + 2, door['z'] + 0.6), (door['x'] - 2, door['z'] + 0.6)]:
                tapped = await L.tap_ground(pg, cdp, tx, tz)
                if tapped: mode = '點門口前方的路面 (%.1f, %.1f)（%s）' % (tx, tz, '偵察時範圍內只有 %d 個互動點，選不出差別' % len(rec['inRange']) if not others else '一盞那個座標在溫州街點不到'); break
        if not tapped:
            print('INFO 走到門口以後在溫州街點不到地面（附近的點都不在畫面上）：「走到一半進門」這一段沒測，只驗上面偵察那一次', flush=True)
            check('沒有 JS 例外', not errs, J(errs[:3])); await b.close()
            print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS)), flush=True); sys.exit(1 if FAILS else 0)
        print('  點地面：%s' % mode, flush=True)
        pre = None
        for _ in range(30):   # 點下去人開始走；按鈕還在就按（走到一半進門）
            await pg.wait_for_timeout(100)
            if (await pg.evaluate(BTN)).startswith(DOOR[2]):
                pre = await pg.evaluate("(()=>{ const P=GAME.E.player, t=P.tapPref; return {pos:[+P.obj.position.x.toFixed(2),+P.obj.position.z.toFixed(2)], moving:!!P.path, tapPref:t?{x:+(+t.x).toFixed(2),z:+(+t.z).toFixed(2),lv:t.lv,zone:t.zone===undefined?'(undefined)':t.zone}:null}; })()")
                await L.tap(pg, cdp, '#interact'); break
        if not check('點地面以後按鈕還在，走到一半按「%s」' % DOOR[2], bool(pre), J(pre)):
            await b.close(); print('FAILED %d' % len(FAILS), flush=True); sys.exit(1)
        print('  進門前：%s' % J(pre), flush=True)
        if not check('進得了一盞', await wait_zone(pg, ZONE), ''):
            await b.close(); print('FAILED %d' % len(FAILS), flush=True); sys.exit(1)
        await pg.wait_for_timeout(300)
        st = await pg.evaluate(PICK_JS)
        print('  進門後：%s' % J(st), flush=True)
        await pg.screenshot(path=os.path.join(OUT, 'tappref_after_enter.png'))
        check('[TAPPREF] 進門後溫州街留下的 tapPref 不生效（tapPref.zone %s、E.zone.id %s）' % (st['tapPref'] and st['tapPref']['zone'], st['zoneId']), not st['tpActive'], J(st['tapPref']))
        if len(st['inRange']) >= 2 and st['withTp'] != st['bestNoTp']:
            check('[TAPPREF] 互動鈕是離人最近的「%s」，不是溫州街點的位置那邊的「%s」' % (st['bestNoTp'], st['withTp']), st['button'] == st['bestNoTp'] if st['button'] else False, '按鈕：%s' % st['button'])
        else:
            print('INFO [TAPPREF] 這一次選不出差別（範圍內 %d 個、算 tapPref 和不算都是「%s」）：只驗上面那一條' % (len(st['inRange']), st['bestNoTp']), flush=True)
        btn = st['button']
        if btn:
            await L.tap(pg, cdp, '#interact'); got = ''
            for _ in range(30):
                await pg.wait_for_timeout(200); c = await pg.evaluate(CAPTION)
                if c: got = c; break
            print('  按互動鈕「%s」：%s；區域 %s' % (btn, got or '（沒有字幕／對話）', await pg.evaluate("GAME.G.zone")), flush=True)
            await pg.screenshot(path=os.path.join(OUT, 'tappref_after_press.png'))
        else:
            print('INFO 進門後沒有互動鈕（範圍內沒有東西）', flush=True)
        check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS)), flush=True)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
