"""CC（帳號 A）11-04：使用者 1104 卡住的存檔（BB 00:43 P0）：「跑去找其中一個 npc 聊天，然後就卡住了」（沒說是誰）。
  存檔：企劃線 docs/story_planning/bb_runs/user_saves/1104_day35_library_media_stuck.json（第 35 天週二 15:23、library_media (−3.12,0.12)）。
  探針用 git 從企劃線讀（不複製進 cc-testing，使用者存檔不 commit）；或 SAVE_FILE＝本機路徑。
  讀檔＝遊戲自己的流程：存檔放進 localStorage 的自動存檔（fatiao3d_auto）→ 重新載入 → 標題按「繼續」（#btnContinue）。不改任何旗標。
  1. 列出這一區所有 NPC：id、名字、位置、pose、走過去以後有沒有互動按鈕。
  2. 每一個人：重新讀檔 → 走過去（點地／搖桿）→ 按互動 → 對話一路點到底；第一個選單的每一個選項各試一次（每次重新讀檔），之後的選單都點第一個。
  3. 每一次結束都檢查（15 秒內要恢復，不然 FAIL）：對話框、選項關了；GAME.D.active false、busyDepth 0；ADV 沒開；搖桿推得動（≥ 0.3 m）；
     HUD 手機按鈕按得開、關得掉；遊戲時間有在走；player 沒有 frozen；沒有新的 JS 例外。
  4. 卡住：截圖，記 console 最後 30 行、GAME.D（active、busyDepth、busyWho）、E.cam.mode、P.frozen、P.pose、對話文字、選項。
用法：LW_TESTS=<wt>/tests [SAVE_FILE=...] [STORY_REF=origin/claude/story-planning] [ONLY=id,id] python3 cc_stuck1104_probe.py <url> <out>"""
import os, sys, json, asyncio, time, subprocess
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
REPO = os.environ.get('LW_REPO') or os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..'))
REF = os.environ.get('STORY_REF', 'origin/claude/story-planning')
SAVE_PATH = 'docs/story_planning/bb_runs/user_saves/1104_day35_library_media_stuck.json'
ONLY = [x for x in (os.environ.get('ONLY') or '').split(',') if x]
J = lambda o: json.dumps(o, ensure_ascii=False)
FAILS = []; CONSOLE = []


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)
    return ok


def read_save():
    if os.environ.get('SAVE_FILE'): return open(os.environ['SAVE_FILE'], encoding='utf-8').read()
    for attempt in (0, 1):
        r = subprocess.run(['git', '-C', REPO, 'show', '%s:%s' % (REF, SAVE_PATH)], capture_output=True, timeout=60)   # 路徑全是 ASCII
        if r.returncode == 0 and r.stdout: return r.stdout.decode('utf-8')
        if attempt == 0 and REF.startswith('origin/'): subprocess.run(['git', '-C', REPO, 'fetch', 'origin', REF[len('origin/'):]], capture_output=True, timeout=240)
    raise SystemExit('讀不到存檔：%s:%s（%s）' % (REF, SAVE_PATH, r.stderr.decode('utf-8', 'replace')[:200]))


NPCS = """(()=>{ const E=GAME.E, out=[]; for(const n of (E.npcs||[])){ const o=n.obj; if(!o||o.visible===false||n.hidden) continue; let key=null; if(GAME.npc) for(const k in GAME.npc) if(GAME.npc[k]===n) key=k;
  const id=key||n.id||n.charId||null; const nm=(id&&typeof SOCIAL!=='undefined'&&SOCIAL.displayName)?SOCIAL.displayName(id):(n.name||'');
  out.push({id, key, name:nm, crowd:n.crowd||null, x:+o.position.x.toFixed(2), z:+o.position.z.toFixed(2), lv:n.lv|0, pose:n.pose||null}); } return out; })()"""
ST = """(()=>{ const G=GAME.G, E=GAME.E, P=E.player, D=GAME.D||{}, p=P.obj.position; const it=document.getElementById('interact');
  return {zone:G.zone, hour:+(+G.hour).toFixed(4), day:G.day, x:+p.x.toFixed(2), z:+p.z.toFixed(2), lv:P.lv|0,
    dlg:!!D.active, depth:D.busyDepth|0, who:(D.busyWho||[]).slice(-4), adv:!!(typeof ADV!=='undefined'&&ADV.active), cam:E.cam&&E.cam.mode||null, frozen:!!P.frozen, busy:!!P.busy, pose:P.pose||null, paused:!!E.paused,
    name:((document.getElementById('dlgName')||{}).textContent||'').trim(), text:((document.getElementById('dlgText')||{}).textContent||'').slice(0,60),
    choices:[...document.querySelectorAll('#choices:not(.hide) button')].map(b=>(b.textContent||'').trim().slice(0,40)),
    interact:(it&&!it.classList.contains('hide')&&getComputedStyle(it).display!=='none')?(it.textContent||'').trim():''}; })()"""


async def boot(pg, cdp, save):
    """遊戲自己的讀檔：自動存檔 → 重新載入 → 標題「繼續」"""
    await pg.evaluate("s=>{ localStorage.clear(); localStorage.setItem('fatiao3d_auto', s); }", save)
    await pg.reload(); ok = await L.wait_loaded(pg)
    await pg.wait_for_timeout(1500)
    tapped = await L.tap(pg, cdp, '#btnContinue')
    await pg.wait_for_timeout(9000)
    s = await pg.evaluate(ST)
    return ok and tapped, s


async def unstuck_check(pg, cdp, tag, err0):
    """對話結束以後：15 秒內要回到能玩的狀態"""
    t0 = time.time(); s = None
    while time.time() - t0 < 15:
        s = await pg.evaluate(ST)
        if not s['dlg'] and not s['choices'] and not s['adv'] and s['depth'] == 0 and not s['frozen']: break
        if s['dlg'] and not s['choices']: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(1000)
    a = await pg.evaluate(ST); await L.joystick(pg, cdp, 0, -60, 1200); b = await pg.evaluate(ST)
    moved = round(((b['x'] - a['x']) ** 2 + (b['z'] - a['z']) ** 2) ** 0.5, 2)
    h0 = b['hour']; await pg.wait_for_timeout(4000); h1 = (await pg.evaluate(ST))['hour']
    phone = await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1200)
    ph_open = await pg.evaluate("!!(document.getElementById('phone')&&!document.getElementById('phone').classList.contains('hide'))")
    if ph_open: await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(800)
    res = {'state': s, 'moved': moved, 'time_flows': h1 > h0, 'phone_open': ph_open, 'new_errs': err0}
    ok = (not s['dlg'] and not s['choices'] and not s['adv'] and s['depth'] == 0 and not s['frozen'] and moved >= 0.3 and h1 > h0 and ph_open and not err0)
    if not ok:
        await pg.screenshot(path=os.path.join(OUT, 'STUCK_%s.png' % tag))
        print('  卡住細節 %s：%s\n  console 最後 30 行：\n    %s' % (tag, J(res), '\n    '.join(CONSOLE[-30:])), flush=True)
    return ok, res


async def talk(pg, cdp, save, n, pick, errs):
    tag = '%s_%d' % (n['id'] or n['name'] or 'npc', pick)
    ok, s = await boot(pg, cdp, save)
    if not ok: check('[%s] 讀檔（繼續）' % tag, False, J(s)); return None
    reached = await L.go_to(pg, cdp, Runner(), n['x'], n['z'], 1.2, n['name'] or str(n['id']), lv=n['lv'])
    await pg.wait_for_timeout(800); s = await pg.evaluate(ST)
    info = {'reached': reached, 'interact': s['interact']}
    if not s['interact']:
        print('  [%s] 走到旁邊沒有互動按鈕：%s' % (tag, J(info)), flush=True); return {'interact': '', 'n_opts': 0}
    e0 = len(errs); await L.tap(pg, cdp, '#interact')
    first_opts = None; t0 = time.time(); last = None; still = time.time()
    while time.time() - t0 < 240:
        s = await pg.evaluate(ST)
        sig = (s['text'], tuple(s['choices']))
        if sig != last: last = sig; still = time.time()
        if time.time() - still > 15 and (s['dlg'] or s['choices'] or s['depth']):
            break   # 對話停在同一處超過 15 秒：交給 unstuck_check 判
        if s['choices']:
            if first_opts is None: first_opts = s['choices']; k = min(pick, len(s['choices']) - 1)
            else: k = 0
            print('  [%s] 選單 %s → %s' % (tag, J(s['choices']), s['choices'][k]), flush=True)
            await L.tap(pg, cdp, '#choices button:nth-child(%d)' % (k + 1)); await pg.wait_for_timeout(1200); continue
        if s['dlg']:
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700); continue
        if not s['adv'] and s['depth'] == 0: break
        await pg.wait_for_timeout(600)
    ok, res = await unstuck_check(pg, cdp, tag, errs[e0:])
    check('[%s] 和「%s」說話（第一個選單選第 %d 項）以後沒有卡住' % (tag, n['name'], pick + 1), ok, J({k: res[k] for k in ('moved', 'time_flows', 'phone_open')}) + ' ' + J({k: res['state'][k] for k in ('zone', 'dlg', 'depth', 'adv', 'frozen', 'cam', 'pose')}))
    return {'interact': info['interact'], 'n_opts': len(first_opts or [])}


class Runner:
    def note(self, s): print('  ' + s, flush=True)
    def check(self, n, ok, info=''): return check(n, ok, info)


async def main():
    os.makedirs(OUT, exist_ok=True)
    save = read_save(); sj = json.loads(save)
    print('  存檔：第 %s 天、週%s、%.2f 時、%s %s' % (sj.get('day'), sj.get('weekday'), sj.get('hour', 0), sj.get('zone'), J(sj.get('pos'))), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        pg.on('console', lambda m: CONSOLE.append(('%s %s' % (m.type, m.text))[:300]))
        await pg.goto(URL); check('遊戲載入', await L.wait_loaded(pg))
        ok, s = await boot(pg, cdp, save)
        check('讀檔（自動存檔 → 標題「繼續」）', ok and s['zone'] == sj.get('zone'), J(s))
        await pg.screenshot(path=os.path.join(OUT, 'loaded.png'))
        npcs = await pg.evaluate(NPCS)
        print('  這一區的 NPC（%d）：%s' % (len(npcs), J(npcs)), flush=True)
        ok0, r0 = await unstuck_check(pg, cdp, 'after_load', list(errs))
        check('讀檔後（還沒找人說話）可以玩：搖桿、時間、手機', ok0, J({k: r0[k] for k in ('moved', 'time_flows', 'phone_open')}))
        todo = [n for n in npcs if not ONLY or (n['id'] in ONLY)]
        todo.sort(key=lambda n: (n['crowd'] is not None, n['name'] or ''))   # 有名字的角色先、路人後
        for n in todo:
            print('== %s（%s）(%s,%s) pose=%s' % (n['name'], n['id'], n['x'], n['z'], n['pose']), flush=True)
            r = await talk(pg, cdp, save, n, 0, errs)
            if r and r['n_opts'] > 1:
                for k in range(1, min(r['n_opts'], 6)):
                    await talk(pg, cdp, save, n, k, errs)
        check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS[:8])), flush=True)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
