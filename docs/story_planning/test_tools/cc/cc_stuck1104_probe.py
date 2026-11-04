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
    interact:(it&&!it.classList.contains('hide')&&getComputedStyle(it).display!=='none')?(it.textContent||'').trim():'', running:(typeof EVENTS!=='undefined'&&EVENTS.running)?String(EVENTS.running.id||EVENTS.running):null, lastTalkError:GAME.lastTalkError?(()=>{ const e=GAME.lastTalkError; try{ const m=e.message||e.msg||(e.err&&e.err.message)||JSON.stringify(e); return String(m).slice(0,240)+(e.stack?' @ '+String(e.stack).split('\\n')[1]:''); }catch(x){ return String(e).slice(0,200); } })():null, nch:document.querySelectorAll('#choices button').length}; })()"""


DIAG = """(()=>{ const G=GAME.G, D=GAME.D||{}; const t=document.getElementById('dlgText'), box=document.getElementById('dlg');
  const lines=((t&&t.innerText)||'').split('\\n').filter(x=>x.trim());
  const dq={}; for(const k of ['queue','sayStack','chooseStack','busyWho','pending']) if(D[k]!=null) dq[k]=Array.isArray(D[k])?D[k].map(x=>typeof x==='string'?x.slice(0,80):(x&&(x.text||x.t||x.who||x.id)?String(x.who||'')+':'+String(x.text||x.t||x.id||'').slice(0,60):typeof x)).slice(-8):String(D[k]).slice(0,80);
  let pe=null; try{ pe=(CLS.dayItems(G)||[]).filter(q=>q.room&&q.room.door==='gym').map(q=>({id:q.c.id, st:CLS.status(G,q), key:q.key, skip:!!(G.classRec&&G.classRec.note&&G.classRec.note['skip_'+q.key])})); }catch(e){ pe=String(e); }
  const skipBtn=[...document.querySelectorAll('#advTop button, #adv button')].find(b=>(b.textContent||'').includes('略過對話'));
  return {lines, nlines:lines.length, boxLines:((box&&box.innerText)||'').split('\\n').filter(x=>x.trim()).slice(0,12), D:dq, pe, skip:!!skipBtn, skipOn:!!(typeof ADV!=='undefined'&&ADV.skip)}; })()"""
TAP_SKIP = """(()=>{ const b=[...document.querySelectorAll('#advTop button, #adv button')].find(b=>(b.textContent||'').includes('略過對話')); if(!b) return null; const r=b.getBoundingClientRect(); return [r.left+r.width/2, r.top+r.height/2]; })()"""


async def diag_stuck(pg, cdp, tag):
    """BB 00:53：使用者截圖＝芷若的對話框疊了 5 行（前 4 行是體育課的）。記 ①行數與內容 ②每點一次有沒有變 ③「略過對話」能不能解開 ④當天體育課的狀態 ⑤GAME.D 的佇列"""
    d0 = await pg.evaluate(DIAG); print('  [%s] ①對話框 %d 行：%s ④體育課 %s ⑤D %s' % (tag, d0['nlines'], J(d0['lines'] or d0['boxLines']), J(d0['pe']), J(d0['D'])), flush=True)
    for k in range(3):
        await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(1200); d = await pg.evaluate(DIAG)
        print('  [%s] ②第 %d 次點：%d 行 %s' % (tag, k + 1, d['nlines'], J(d['lines'][-2:])), flush=True)
    xy = await pg.evaluate(TAP_SKIP)
    if xy:
        await L.touch_tap(cdp, xy[0], xy[1]); await pg.wait_for_timeout(3000); d = await pg.evaluate(DIAG); s2 = await pg.evaluate(ST)
        print('  [%s] ③按「略過對話」以後：%d 行、dlg=%s depth=%s choices=%s' % (tag, d['nlines'], s2['dlg'], s2['depth'], J(s2['choices'])), flush=True)
    else:
        print('  [%s] ③畫面上沒有「略過對話」' % tag, flush=True)
    await pg.screenshot(path=os.path.join(OUT, 'DIAG_%s.png' % tag))


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
        await diag_stuck(pg, cdp, tag)
        print('  卡住細節 %s：%s\n  console 最後 30 行：\n    %s' % (tag, J(res), '\n    '.join(CONSOLE[-30:])), flush=True)
    return ok, res


async def talk(pg, cdp, save, n, path, errs):
    tag = '%s_%s' % (n['id'] or n['name'] or 'npc', '-'.join(str(x + 1) for x in path) or '1')
    ok, s = await boot(pg, cdp, save)
    if not ok: check('[%s] 讀檔（繼續）' % tag, False, J(s)); return None
    reached = await L.go_to(pg, cdp, Runner(), n['x'], n['z'], 1.2, n['name'] or str(n['id']), lv=n['lv'])
    await pg.wait_for_timeout(800); s = await pg.evaluate(ST)
    info = {'reached': reached, 'interact': s['interact']}
    if not s['interact']:
        print('  [%s] 走到旁邊沒有互動按鈕：%s' % (tag, J(info)), flush=True); return {'interact': '', 'menus': []}
    e0 = len(errs); await L.tap(pg, cdp, '#interact')
    await pg.wait_for_timeout(1500); dd = await pg.evaluate(DIAG)
    print('  [%s] 按互動以後：對話框 %d 行 %s；體育課 %s' % (tag, dd['nlines'], J(dd['lines'][:6]), J(dd['pe'])), flush=True)
    # BB 00:56（LAWWW 判讀）：使用者截圖那五行是「紀錄」面板（adv3d A.log），不是對話框疊字——只記錄，不判 FAIL
    menus = []; t0 = time.time(); last = None; still = time.time(); step = 0
    while time.time() - t0 < 240:
        s = await pg.evaluate(ST)
        sig = (s['text'], tuple(s['choices']))
        if sig != last:
            last = sig; still = time.time(); step += 1
            # BB 00:56：每一步記 busy／depth／ADV＋截圖（前 12 步），看 talkNo 那一句點掉以後出現什麼
            print('  [%s] 第 %d 步：%s「%s」選單 %s｜busy=%s depth=%s adv=%s running=%s frozen=%s lastTalkError=%s' % (tag, step, s['name'] or '（旁白）', s['text'], J(s['choices']), s['busy'], s['depth'], s['adv'], s['running'], s['frozen'], s.get('lastTalkError')), flush=True)
            if step <= 12: await pg.screenshot(path=os.path.join(OUT, 'step_%s_%02d.png' % (tag, step)))
            warns = [c for c in CONSOLE[-40:] if c.startswith(('warning', 'error'))]
            if warns: print('  [%s]   console warn/error（最近）：%s' % (tag, J(warns[-4:])), flush=True)
        if time.time() - still > 15 and (s['dlg'] or s['choices'] or s['depth']):
            # 停在同一處 15 秒：④ 點「下一句」／選項有沒有反應
            b4 = await pg.evaluate(ST)
            await L.tap(pg, cdp, '#choices button:nth-child(1)' if s['choices'] else '#dlg'); await pg.wait_for_timeout(1500)
            af = await pg.evaluate(ST)
            print('  [%s] 卡在同一處 15 秒：①字幕／選單 %s ③busy=%s running=%s depth=%s adv=%s 按鈕 %s ④點了以後 %s' % (tag, J([b4['name'], b4['text'], b4['choices']]), b4['busy'], b4['running'], b4['depth'], b4['adv'], b4['nch'], '有反應' if (af['text'], af['choices']) != (b4['text'], b4['choices']) else '沒反應'), flush=True)
            if (af['text'], af['choices']) != (b4['text'], b4['choices']): still = time.time(); continue
            await diag_stuck(pg, cdp, tag)
            break
        if s['choices']:
            lvl = len(menus); menus.append(s['choices']); k = min(path[lvl], len(s['choices']) - 1) if lvl < len(path) else 0
            print('  [%s] 選單 %s → %s' % (tag, J(s['choices']), s['choices'][k]), flush=True)
            await L.tap(pg, cdp, '#choices button:nth-child(%d)' % (k + 1)); await pg.wait_for_timeout(1200); continue
        if s['dlg']:
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700); continue
        if not s['adv'] and s['depth'] == 0: break
        await pg.wait_for_timeout(600)
    ok, res = await unstuck_check(pg, cdp, tag, errs[e0:])
    check('[%s] 和「%s」說話（選項路徑 %s）以後沒有卡住' % (tag, n['name'], J(menus and [m[min(path[i], len(m) - 1)] if i < len(path) else m[0] for i, m in enumerate(menus)])), ok, J({k: res[k] for k in ('moved', 'time_flows', 'phone_open')}) + ' ' + J({k: res['state'][k] for k in ('zone', 'dlg', 'depth', 'adv', 'frozen', 'cam', 'pose')}))
    return {'interact': info['interact'], 'menus': menus}


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
        todo.sort(key=lambda n: (n['id'] != 'heroine_02', n['crowd'] is not None, n['name'] or ''))   # BB 00:45：LAWWW 從存檔推出卡住的是芷若（ZR_MEDIA_TALK）→ 先跑她；有名字的角色先、路人後
        MAXRUN = int(os.environ.get('MAXRUN', '15'))
        for n in todo:
            print('== %s（%s）(%s,%s) pose=%s' % (n['name'], n['id'], n['x'], n['z'], n['pose']), flush=True)
            queue = [[]]; seen = set(); runs = 0
            while queue and runs < MAXRUN:
                path = queue.pop(0); runs += 1
                r = await talk(pg, cdp, save, n, path, errs)
                if not r: continue
                for lvl, opts in enumerate(r['menus'][:3]):   # 每一層沒試過的選項排進去（前面照這次的路徑）
                    pre = [path[i] if i < len(path) else 0 for i in range(lvl)]
                    for k in range(len(opts)):
                        np_ = tuple(pre + [k])
                        if np_ not in seen and list(np_) != [path[i] if i < len(path) else 0 for i in range(lvl + 1)]:
                            seen.add(np_); queue.append(list(np_))
                    seen.add(tuple(pre + [path[lvl] if lvl < len(path) else 0]))
            print('== %s 跑了 %d 次（上限 %d，還有 %d 條沒試）' % (n['name'], runs, MAXRUN, len(queue)), flush=True)
        check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS[:8])), flush=True)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
