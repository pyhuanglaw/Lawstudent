"""CC-C 11-14：WEEKEND_HOME（BB-C 11:41，TEST-04，BB_466 最後一節，P2）——週五晚上回家、週日回宿舍：日期、地點對不對，週一的課有沒有錯過，朋友有沒有不見。判定歸 BB；Playwright ≠ iPhone。
遊戲的做法（main 6106fae2d2 src/home3d.js HOME）：週五 17:00 以後到週日可以回家（HOME.canGo）；手機「地點」最上面「回家」（game3d.js data-gohome）→ HOME.go：字卡「回家」→「（家。HH:MM。）」＋媽媽一句 → 家裡的選單（HOME.loop）：
  吃晚餐（18:30～20:00）／等吃晚餐／存檔／睡覺（隔天早上在家醒來）／在家休息一下／回宿舍；週日的「睡覺」＝先回宿舍再睡（S.back＋S.sleepAtDorm），週日另有「今晚住家裡，明天一早直接去學校」；
  時間會跳過有事的時候先問「會錯過：…」（照樣／先不要）。
這支照玩家（不墊時間）：【前置／捷徑】讀檔到宿舍房間 DAY（週五）HOUR（條件事件關掉）→ 記室友、朋友在哪（STORY.whereIs）、週一的課（CLS.dayItems）
  → 手機「地點」→「回家」→ 家裡的選單照順序點：週五「吃晚餐」（沒有就「等吃晚餐」、再沒有「睡覺」）→ 週五晚上之後「睡覺」→ 週六「睡覺」→ 週日「睡覺」（＝回宿舍再睡）
  「會錯過：…」那一句照實記、點「照樣」；週日 21:30 媽媽問回不回宿舍＝點「回宿舍」。每個選單記當下的日期、星期、時間、區域、HOME.at，截圖。
  → 到週一早上在宿舍醒來：記日期、星期、時間、區域；週一每一堂課的狀態（CLS.status：upcoming／open＝還來得及，missed＝錯過）；室友、朋友（STORY.whereIs、GAME.npc）跟週五比。
CC_02 清單 2026-11-14：1✓（DAY 預設 2025-10-17 週五 19:00，FAIL_SETUP 確認是週五、在宿舍、HOME.canGo） 2✓（課表、室友名單、朋友位置全部從遊戲讀：CLS.dayItems／status、DORM203 或 TZIS.MATES、STORY.whereIs） 3n/a（選單照固定順序挑字，不是第一個） 4✓（手機用 L.tap 點 #btnPhone、地點分頁、data-gohome；選單點 #choices 第 n 個） 5n/a（不走路，回家、回宿舍是遊戲的選單） 6✓（對話等字打完才記、每個選單都等） 7✓（lint） 8✓（週五和週一逐欄比：日期、區域、室友、朋友） 9✓（每個選單、到家、回到宿舍、週一醒來都截圖） 10✓（只有讀檔是捷徑） 11✓（佇列 probe、SHA 40 碼） 12✓（FAIL_SETUP：週五、在宿舍、可以回家、手機有「回家」、按了真的到家） 13n/a（不走路）
用法：LW_TESTS=<wt>/tests SHA=<sha> [DAY=2025-10-17] [HOUR=19] python3 cc_weekend_home_probe.py <url> <out>"""
import os, sys, json, asyncio
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SHA = os.environ.get('SHA') or ''
DAY = os.environ.get('DAY') or '2025-10-17'; HOUR = float(os.environ.get('HOUR') or 19)
R = L.Run('weekend_home', OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
WD = ['日', '一', '二', '三', '四', '五', '六']

STATE_JS = r"""(()=>{ const G=GAME.G, d=CALENDAR.dateOf(G.day); return {day:G.day, key:d.key, wd:G.weekday, cwd:d.wd%7, hour:+(+G.hour).toFixed(2), zone:G.zone, home:!!(G.home&&G.home.at),
  canGo:typeof HOME!=='undefined'&&HOME.canGo?!!HOME.canGo(G):null}; })()"""
PEOPLE_JS = r"""(()=>{ const G=GAME.G; let mates=null; try{ mates=(typeof TZIS!=='undefined'&&TZIS.MATES)?TZIS.MATES.slice():['zhe','classmate_bohan','kai']; }catch(e){ mates=['zhe','classmate_bohan','kai']; }
  const met=Object.keys((G.social&&G.social.rel)||{}).filter(id=>typeof CHARACTERS!=='undefined'&&CHARACTERS[id]);
  const ids=[...new Set(mates.concat(met, ['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','kexin']))];
  const where={}; for(const id of ids){ let w=null; try{ w=STORY.whereIs(GAME,id); }catch(e){ w='ERR '+e.message; } where[id]=w?(typeof w==='object'?{zone:w.zone||null, away:w.away||null, what:(w.what||w.label||w.act||'').toString().slice(0,30)}:String(w).slice(0,40)):null; }
  const here=Object.keys(GAME.npc||{}); let allIn=null; try{ allIn=typeof DORM203!=='undefined'&&DORM203.allIn?!!DORM203.allIn(G,mates,G.day,G.hour):null; }catch(e){ allIn='ERR'; }
  return {mates, where, here, allIn}; })()"""
CLASS_JS = r"""(d=>{ const G=GAME.G; try{ return CLS.dayItems(G,d).map(it=>({id:it.c.id, name:(it.c.name||it.c.title||it.c.id), req:!!(it.c.required||it.c.req||it.c.must||it.c.kind==='required'), t0:it.t0, t1:it.t1, status:CLS.status(G,it), exam:it.exam||null})); }catch(e){ return 'ERR '+e.message; } })"""
UI_JS = r"""(()=>{ const D=GAME.D, vis=e=>!!e&&!!e.offsetParent&&!e.classList.contains('hide');
  const ch=[...document.querySelectorAll('#choices button')].filter(b=>b.offsetParent).map(b=>(b.innerText||b.textContent||'').replace(/\s+/g,' ').trim());
  const cap=document.getElementById('caption'), tc=document.getElementById('title3');
  return {dlg:!!(D&&D.active), who:((document.getElementById('dlgName')||{}).textContent||'').trim(), text:((document.getElementById('dlgText')||{}).textContent||'').trim(), choices:ch,
    caption:vis(cap)?(cap.innerText||'').replace(/\s+/g,' ').trim():'', card:(tc&&+getComputedStyle(tc).opacity>0.5)?(tc.innerText||'').replace(/\s+/g,' ').trim():'', busy:!!(GAME.E.player&&GAME.E.player.busy)}; })()"""


def pick(ch, st, log):
    """家裡的選單照固定順序挑：週五吃晚餐→睡覺、週六睡覺、週日睡覺（＝回宿舍再睡）；會錯過＝照樣；週日晚上問回不回宿舍＝回宿舍"""
    if any(t.startswith('照樣') for t in ch): return next(i for i, t in enumerate(ch) if t.startswith('照樣'))
    if any(t.startswith('回宿舍') for t in ch) and any(t.startswith('今晚住家裡') for t in ch) and not any(t.startswith('睡覺') for t in ch): return next(i for i, t in enumerate(ch) if t.startswith('回宿舍'))
    order = ['吃晚餐', '等吃晚餐', '睡覺'] if st['wd'] == 5 else ['睡覺']
    for w in order:
        k = next((i for i, t in enumerate(ch) if t.startswith(w)), None)
        if k is not None: return k
    return None


async def main():
    print('CC WEEKEND_HOME：SHA %s；%s %.1f；Windows＋GPU ≠ iPhone' % (SHA or '?', DAY, HOUR), flush=True)
    res = {'sha': SHA, 'steps': []}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('FAIL_SETUP 檢查：遊戲載入', await L.wait_loaded(pg), ''): await b.close(); sys.exit(R.finish())
        await D.load_zone(pg, cdp, 'dorm', DAY, HOUR, wait=6000)
        s0 = await pg.evaluate(STATE_JS); R.setup('【前置／捷徑】讀檔到宿舍房間 %s %.1f（條件事件關掉）：%s' % (DAY, HOUR, J(s0)))
        if not R.check('FAIL_SETUP 檢查：週五、在宿舍、可以回家（HOME.canGo）', s0['wd'] == 5 and s0['zone'] == 'dorm' and s0['canGo'] is True and not s0['home'], J(s0)): await b.close(); sys.exit(R.finish())
        p0 = await pg.evaluate(PEOPLE_JS); mon = s0['day'] + 3
        c0 = await pg.evaluate(CLASS_JS, mon); res['fri'] = {'state': s0, 'people': p0, 'mon_classes': c0}
        R.note('週五 室友 %s；這裡的人 %s；DORM203.allIn %s；誰在哪 %s' % (J(p0['mates']), J(p0['here']), J(p0['allIn']), J(p0['where'])))
        R.note('週一（第 %d 天）的課：%s' % (mon, J(c0)))
        await pg.screenshot(path=os.path.join(OUT, 'wh_0_fri_dorm.png'))
        # 手機「地點」→「回家」
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1000)
        await L.tap(pg, cdp, '#phoneTabs button[data-ptab="places"]'); await pg.wait_for_timeout(1000)
        hb = await pg.evaluate("(()=>{ const b=document.querySelector('#phoneBody [data-gohome]'); if(!b) return null; b.scrollIntoView({block:'center'}); return (b.closest('.item')||b).innerText.replace(/\\s+/g,' ').trim(); })()")
        await pg.screenshot(path=os.path.join(OUT, 'wh_1_phone_places.png'))
        if not R.check('FAIL_SETUP 檢查：手機「地點」有「回家」', bool(hb), J(hb)): await b.close(); sys.exit(R.finish())
        await L.tap(pg, cdp, '#phoneBody [data-gohome]'); await pg.wait_for_timeout(1500)
        log = []; seen = set(); nmenu = 0; quiet = 0; arrived = None
        for _ in range(400):
            u = await pg.evaluate(UI_JS); st = await pg.evaluate(STATE_JS)
            if st['home'] and arrived is None: arrived = st; R.note('到家：%s' % J(st)); await pg.screenshot(path=os.path.join(OUT, 'wh_2_home.png'))
            for k_ in ('card', 'caption'):
                if u[k_] and (k_, u[k_]) not in seen: seen.add((k_, u[k_])); log.append(['字卡' if k_ == 'card' else '字幕', u[k_], st['key'], round(st['hour'], 2), st['zone']])
            if u['choices']:
                nmenu += 1; k = pick(u['choices'], st, log)
                log.append(['選單', u['choices'], st['key'], '週' + WD[st['wd']], round(st['hour'], 2), st['zone'], st['home']])
                if nmenu <= 12: await pg.screenshot(path=os.path.join(OUT, 'wh_menu_%02d.png' % nmenu))
                if k is None: log.append(['停', '選單沒有要的字']); break
                log.append(['點', u['choices'][k]]); await pg.evaluate("(i=>{ const b=[...document.querySelectorAll('#choices button')].filter(x=>x.offsetParent); (b[i]||b[0]).click(); })(%d)" % k)
                await pg.wait_for_timeout(900); quiet = 0; continue
            if u['dlg']:
                for _w in range(8):
                    await pg.wait_for_timeout(250); u2 = await pg.evaluate(UI_JS)
                    if not u2['dlg'] or u2['text'] == u['text']: break
                    u = u2
                kk = ('dlg', u['who'], u['text'])
                if kk not in seen: seen.add(kk); log.append(['對話', (u['who'] + '：' if u['who'] else '') + u['text'], st['key'], round(st['hour'], 2), st['zone']])
                await pg.evaluate("GAME.dlgAdvance()"); await pg.wait_for_timeout(400); quiet = 0; continue
            if st['wd'] == 1 and st['zone'] == 'dorm' and not st['home'] and not u['busy']:
                quiet += 1
                if quiet >= 4: break
            await pg.wait_for_timeout(500)
        for row in log: R.note('    ' + J(row))
        res['log'] = log
        s1 = await pg.evaluate(STATE_JS); await pg.screenshot(path=os.path.join(OUT, 'wh_3_mon.png'))
        p1 = await pg.evaluate(PEOPLE_JS); c1 = await pg.evaluate(CLASS_JS, s1['day'])
        res['mon'] = {'state': s1, 'people': p1, 'classes': c1}
        R.note('最後：%s；週一的課 %s' % (J(s1), J(c1)))
        R.note('週一 這裡的人 %s；DORM203.allIn %s；誰在哪 %s' % (J(p1['here']), J(p1['allIn']), J(p1['where'])))
        R.check('真的回到家（HOME.at，有「回家」字卡或「（家。…）」那一句）', bool(arrived), J(arrived))
        R.check('週一早上在宿舍（日期＝週五＋3 天、星期一、區域 dorm、不在家）', s1['day'] == mon and s1['wd'] == 1 and s1['cwd'] == 1 and s1['zone'] == 'dorm' and not s1['home'], J(s1))
        missed = [c for c in (c1 if isinstance(c1, list) else []) if c['status'] == 'missed']
        R.check('週一的課一堂都沒有被跳過（醒來時 status 都是 upcoming／open）', isinstance(c1, list) and not missed, J(missed or c1))
        warn = [r_ for r_ in log if r_[0] == '對話' and '會錯過' in r_[1]]
        R.note('「會錯過：…」那幾句：%s' % J(warn))
        gone = [k for k, v in p0['where'].items() if v is not None and p1['where'].get(k) is None]
        R.check('週五找得到的室友、朋友，週一都還找得到（STORY.whereIs 不是 null）', not gone, J({k: [p0['where'][k], p1['where'].get(k)] for k in gone}))
        open(os.path.join(OUT, 'weekend_home.json'), 'w', encoding='utf-8').write(J(res))
        R.check('沒有 pageerror／JS 例外', not errs, J(errs[:5]))
        await b.close()
    sys.exit(R.finish())

asyncio.run(main())
