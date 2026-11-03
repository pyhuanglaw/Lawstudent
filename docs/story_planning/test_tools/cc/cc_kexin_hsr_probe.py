"""CC（帳號 A）11-03：可昕 8/30 坐高鐵到台北、祐廷開車去接（STORY-KX-NCCU-MOVEIN-1103，AA_607）真實玩家探針（第 3 級）。
實作（6a8033f4e）：src/story3d.js 1929～1939（8/29 21:30 私訊「明天一點半的高鐵到台北。」＋「行李兩箱。你來車站接我，直接上山。」→ OUT.plan y0_e37：
  8/30 13:30、late 0.25、台北車站（高鐵出口）、開車 travelH 2/3、alarm）、S.e37CallDue（13:30＋15 分鐘＝13:45 還沒出發＝可昕打來「你在哪？我已經出閘門了。行李好重。」→ 直接出發）；
  src/outings3d.js OUT.due（約好的時間減車程再減 15 分鐘起問「出發」，到約好的時間＋late）、OUT.go（抵達＝max(出發＋車程, 13:30)，演 ev_y0_e37，演完 GM.advance(ev.hours＝4)、回到原本的地方）；
  src/data/events.js ev_y0_e37（第一句「（八月三十日下午。你在台北車站的高鐵出口接到她…）」；AA_599：開車直接回宿舍，afterOuting 不再多 1 小時）。
所以合理的時間（依據就是上面這些程式值，探針從遊戲裡讀，不寫死）：
  出發 ∈ [h − travelH − 0.25, h + late]（12:35～13:45；13:45 以後是可昕的電話那一條，也算出發，另外記）；
  抵達 ＝ max(出發 + travelH, h)（照時間出發＝13:30，最晚約 14:25）；回來 ＝ 抵達 + ev.hours（約 17:30），還是 8/30。
做法：
  起點（兩種）：SAVE=<檔案>【前置／捷徑：讀 cc_camp608_probe.py 匯出的 8/24 存檔 camp608_824_save.json，標題「讀取／匯入存檔」→「匯入」（玩家搬存檔的方式）】；
              沒給 SAVE＝乾淨的瀏覽器、標題「從法律系開始」照玩家點完宿營（沒有捷徑，多幾分鐘）。
  之後照玩家：對話點過去、選項一律第一個（出發選單、私訊的回覆「好。一點半，車站。」都是第一個）；手機自己打開＝按第一個回覆再收起來；
  空下來在宿舍：晚上（17:30 以後、05:00 以前）床「睡到明天…」；白天床「睡到傍晚」（有出遊的鬧鐘會在出發前叫醒，床的選單小字有寫）；不在宿舍＝手機「地點」回宿舍。
  不用 ?turbo、不瞬移、不改劇情狀態。
檢查（每項一行 PASS／FAIL）：
  1 收到可昕的私訊「明天一點半的高鐵到台北。」（8/29 21:30 起，或 8/30 早上補）；行程排好 y0_e37（8/30、13:30、台北車站（高鐵出口）、開車）
  2 可以出發：8/30 出現「出發：…」選單（或 13:45 的電話），出發的時間在合理範圍
  3 到達：演 ev_y0_e37、第一句照 AA_607、8/30、抵達時間＝max(出發＋車程, 13:30)
  4 回來：演完回到 3D、玩家空下來；還是 8/30；時間＝抵達＋ev.hours（±15 分鐘）；回到出發的區域
  5 時鐘：8/30 起床以後每一次看到的遊戲時鐘都不倒退；單次跳超過 0.75 小時的都列出原因，除了「出遊 ev.hours」和「出發到抵達的車程」，沒有超過 1 小時的跳
  6 walkFallbacks 0、沒有 JS 例外
用法：LW_TESTS=<工作樹>/tests [SHA=…] [SAVE=<camp608_824_save.json>] [MAX_S=5400] python3 cc_kexin_hsr_probe.py '<URL>/index.html' <輸出資料夾>
exit 0＝ALL PASS；1＝有 FAIL。不是 iPhone：Playwright 手機橫向模擬。"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cc_camp608_common as C
L = C.L
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
SHA = os.environ.get('SHA', '?')
SAVE = os.environ.get('SAVE', '')
SAVE_SHA = os.environ.get('SAVE_SHA', '')          # 存檔要是這一版寫的（cc_camp608_probe.py 的 meta.json）；PC 佇列放 camp608 那一項的 SHA
SAVE_WAIT_MIN = float(os.environ.get('SAVE_WAIT_MIN', '0'))   # camp608 那一項還在跑就等，最多幾分鐘
MAX_S = int(os.environ.get('MAX_S', '5400'))
STUCK_S = int(os.environ.get('STUCK_S', '300'))
J = C.J
if '?turbo' in URL or '&turbo' in URL: raise SystemExit('真實流程不能用 ?turbo')

OUTQ = r"""(()=>{ try{ const q=OUT.get(GAME.G,'y0_e37'); if(!q) return null; return {day:q.day,key:CALENDAR.dateOf(q.day).key,h:q.h,late:q.late,place:q.place,travel:q.travel,travelH:q.travelH,state:q.state,alarm:!!q.alarm}; }catch(e){ return {err:String(e)}; } })()"""
MSG = r"""(()=>{ try{ return (GAME.G.msgs||[]).filter(m=>String(m.text||'').startsWith('明天一點半的高鐵到台北')).map(m=>({day:m.day,h:m.h,key:CALENDAR.dateOf(m.day).key})); }catch(e){ return []; } })()"""
BED = "(()=>{ const it=(GAME.E.interactables||[]).find(i=>i.sleep&&!i.hidden); return it?[it.x,it.z,it.lv|0,it.label||'']:null; })()"


async def quick_go(pg, cdp, run, zone):
    await L.close_panels(pg, cdp)
    await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await L.tap(pg, cdp, '#phoneTabs button[data-ptab="places"]'); await pg.wait_for_timeout(900)
    c = await pg.evaluate("(z=>{ const e=[...document.querySelectorAll('#phoneBody [data-place]')].find(b=>b.dataset.place.startsWith(z+'|')); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })", zone)
    if not c: await L.close_panels(pg, cdp); run.note('手機「地點」沒有 %s' % zone); return False
    await L.touch_tap(cdp, c[0], c[1])
    for _ in range(90):
        await pg.wait_for_timeout(1000)
        s = await C.ts(pg)
        if s['zone'] == zone or s['dlg'] or s['ch']: break
    return True


async def go_bed(pg, cdp, run):
    """走到床、按互動（床的選單由主迴圈照 prefer 選）"""
    it = await pg.evaluate(BED)
    if not it: run.note('這一區找不到床'); return False
    await L.go_to(pg, cdp, run, it[0], it[1], 0.8, '床', max_s=300, lv=it[2], stop=lambda s: s['dlg'] or s['choices'])
    for _ in range(4):
        s = await C.ts(pg)
        if s['ch'] or s['dlg']: return True
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1600)
    return True


async def main():
    run = L.Run('cc_kexin_hsr', OUT); os.makedirs(OUT, exist_ok=True)
    print('cc_kexin_hsr_probe  SHA=%s  URL=%s  SAVE=%s' % (SHA, URL, SAVE or '（沒有：新局照玩家玩完宿營）'), flush=True)
    sp = None
    if SAVE:
        sp = C.wait_save(run, SAVE, SAVE_SHA, SAVE_WAIT_MIN)   # PC 佇列：camp608 那一項寫好（版本相符）才開始
        if not sp:
            run.check('有 8/24 存檔 %s（SAVE_SHA=%s）' % (SAVE, SAVE_SHA or '不限'), False); print('FAILED %d' % len(run.fails), flush=True); return 1
    recs, picks, clocks = [], [], []
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg, 600))
        d30 = await pg.evaluate("STORY.dayOfKey('2025-08-30')")
        ev_hours = await pg.evaluate("(STORY_EVENTS.find(e=>e.id==='ev_y0_e37')||{}).hours||2")
        if SAVE:
            run.setup('讀 8/24 的存檔 %s（cc_camp608_probe.py 匯出；標題「讀取／匯入存檔」→「匯入」）' % SAVE)
            run.check('匯入 8/24 存檔', await C.import_save(pg, cdp, run, sp))
            ok_r, s_r = await C.resume_ok(pg, cdp, run, int(os.environ.get('RESUME_S', '240')))
            run.check('讀 8/24 存檔以後遊戲接著演、走到 8/29（不停在 8/24）', ok_r, J({k: s_r.get(k) for k in ('key', 'h', 'zone', 'campOn', 'CAMP_Y1', 'campStep')} if s_r else None))
            if not ok_r:
                await run.shot(pg, 'resume_stuck'); await b.close(); print('FAILED %d' % len(run.fails), flush=True); return 1
        else:
            run.check('標題畫面按「從法律系開始」', await C.new_game_law(pg, cdp, run))
        t0 = time.time(); last = None; since = time.time(); ended = None
        dep = arr = ret = None; dep_how = None; prompt_at = None; call_at = None; shots = set()
        while time.time() - t0 < MAX_S:
            s = await C.ts(pg)
            if not s: await pg.wait_for_timeout(800); continue
            rr = await pg.evaluate(C.TAKE); recs.extend(rr)
            for r in rr:
                if r['k'] == 'outgo' and r['t'] == 'y0_e37' and dep is None: dep = r
                if r['k'] == 'ev' and r['t'] == 'ev_y0_e37' and arr is None: arr = r
                if r['k'] == 'say' and r['t'].startswith('你在哪？我已經出閘門了') and call_at is None: call_at = r
                if r['k'] == 'choose' and r['t'].startswith('出發') and '接可昕' in r['t'] and prompt_at is None: prompt_at = r
            if s['day'] >= d30 - 1 and not s['title']:
                clocks.append({'t': C.tval(s), 'key': s['key'], 'h': s['h'], 'zone': s['zone'], 'ev': s['ev'], 'dlg': s['dlg'], 'ch': [o['t'][:20] for o in s['ch']], 'txt': s['txt'][:30], 'lastpick': picks[-1]['pick'] if picks else ''})
            if s['key'] not in shots and s['day'] >= d30 - 1 and s['running'] and not s['title']:
                shots.add(s['key']); await run.shot(pg, 'day_%s' % s['key'])
            if arr is not None and ret is None and C.is_free(s):
                dn = await pg.evaluate("!!(GAME.G.events&&GAME.G.events.done&&GAME.G.events.done.ev_y0_e37)")
                if dn:
                    await pg.wait_for_timeout(2500); s2 = await C.ts(pg)
                    if C.is_free(s2):
                        ret = s2; await run.shot(pg, 'returned'); ended = 'returned'; break
            if s['day'] > d30 + 1: ended = 'passed 8/31'; break
            sig = (s['key'], round(s['h'], 2), s['txt'][:40], len(s['ch']), s['ev'], s['busy'], s['phone'], s['zone'])
            if sig != last: last = sig; since = time.time()
            elif time.time() - since > STUCK_S:
                await run.shot(pg, 'stuck'); run.check('沒有卡住（同一個畫面 %d 秒）' % STUCK_S, False, J(s)); ended = 'stuck'; break
            if s['ch']:
                await C.step(pg, cdp, s, picks, prefer=('出發', '好。', '睡到明天', '睡到傍晚', '睡覺'), skip=('快轉', '再撐一下', '不用了')); continue
            if await C.step(pg, cdp, s, picks): continue
            if not C.is_free(s) or s['stage'] != 'law' or not s['running']:
                await pg.wait_for_timeout(800); continue
            if s['day'] < d30 - 1:   # 宿營、搬宿舍以前（新局）：等劇情
                await pg.wait_for_timeout(800); continue
            await pg.wait_for_timeout(1600)   # 起床選單、出發選單要空下來才出
            s = await C.ts(pg)
            if not C.is_free(s): continue
            if s['zone'] != 'dorm':
                run.note('%s %s 在 %s：手機「地點」回宿舍' % (s['key'], C.hm(s['h']), s['zone'])); await quick_go(pg, cdp, run, 'dorm'); continue
            run.note('%s %s 空下來在宿舍：去床（%s）' % (s['key'], C.hm(s['h']), '晚上' if (s['h'] % 24 >= 17.5 or s['h'] % 24 < 5) else '白天'))
            await go_bed(pg, cdp, run)
        else:
            ended = 'MAX_S'
        recs.extend(await pg.evaluate(C.TAKE))
        q = await pg.evaluate(OUTQ); msg = await pg.evaluate(MSG)
        fin = await C.ts(pg)
        run.note('結束：%s；%s；行程 y0_e37=%s；私訊=%s' % (ended, J({k: fin[k] for k in ('key', 'h', 'zone', 'fb')}), J(q), J(msg)))
        run.check('1 收到可昕的私訊「明天一點半的高鐵到台北。」（8/29 21:30 起或 8/30）', bool(msg) and msg[0]['key'] in ('2025-08-29', '2025-08-30'), J(msg))
        run.check('1 行程 y0_e37：8/30 13:30、台北車站（高鐵出口）、開車', bool(q) and q.get('key') == '2025-08-30' and abs((q.get('h') or 0) - 13.5) < 0.01 and (q.get('place') or '').startswith('台北車站') and q.get('travel') == '開車', J(q))
        qh = (q or {}).get('h') or 13.5; tH = (q or {}).get('travelH') or (2 / 3.0); late = (q or {}).get('late') if (q or {}).get('late') is not None else 0.25
        lo, hi = qh - tH - 0.25, qh + late + 0.1
        dep_how = 'phone_call' if call_at and (not prompt_at or call_at['i'] < prompt_at['i']) else ('prompt' if prompt_at else None)
        run.note('出發選單：%s；電話：%s' % (J(prompt_at and {'d': prompt_at['d'], 'h': C.hm(prompt_at['h']), 't': prompt_at['t'][:40]}), J(call_at and {'d': call_at['d'], 'h': C.hm(call_at['h'])})))
        run.check('2 可以出發（OUT.go y0_e37；方式=%s）' % dep_how, dep is not None, J(dep))
        if dep:
            run.check('2 出發的時間在 %s～%s（約好的 %s − 車程 %.0f 分 − 15 分；最晚 %s＋late）' % (C.hm(lo), C.hm(hi), C.hm(qh), tH * 60, C.hm(qh)),
                      dep['day'] == d30 and lo - 0.01 <= dep['h'] <= hi + (0.4 if dep_how == 'phone_call' else 0), '%s %s' % (dep['d'], C.hm(dep['h'])))
        run.check('3 到達：演 ev_y0_e37', arr is not None, J(arr))
        if arr and dep:
            exp_arr = max(dep['h'] + tH, qh)
            run.check('3 抵達 8/30 %s（＝max(出發 %s＋車程, %s)）' % (C.hm(exp_arr), C.hm(dep['h']), C.hm(qh)), arr['day'] == d30 and abs(arr['h'] - exp_arr) < 0.05, '%s %s' % (arr['d'], C.hm(arr['h'])))
        first = next((r for r in recs if r['k'] == 'say' and r.get('ev') == 'ev_y0_e37'), None)
        run.check('3 第一句「（八月三十日下午。你在台北車站的高鐵出口接到她…」', bool(first) and first['t'].startswith('（八月三十日下午。你在台北車站的高鐵出口接到她'), J(first and first['t'][:40]))
        run.check('4 回來：演完以後回到 3D、空下來', ret is not None, ended)
        if ret and arr:
            exp_ret = arr['h'] + ev_hours
            run.check('4 回來的時間 %s（＝抵達＋ev.hours %s 小時，±15 分）、還是 8/30' % (C.hm(exp_ret), ev_hours), ret['day'] == d30 and abs(ret['h'] - exp_ret) <= 0.25, '%s %s' % (ret['key'], C.hm(ret['h'])))
            run.check('4 回到出發的區域（%s）' % (dep and dep['z']), bool(dep) and ret['zone'] == dep['z'], 'ret=%s dep=%s' % (ret['zone'], dep and dep['z']))
        # 5 時鐘
        wake = next((i for i, c in enumerate(clocks) if c['key'] == '2025-08-30' and not c['dlg'] and not c['ch']), None)
        seg = clocks[wake:] if wake is not None else []
        back, jumps = [], []
        for a, c2 in zip(seg, seg[1:]):
            dt = c2['t'] - a['t']
            if dt < -0.01: back.append([a['key'], C.hm(a['h']), '→', c2['key'], C.hm(c2['h'])])
            if dt > 0.75: jumps.append({'from': '%s %s' % (a['key'], C.hm(a['h'])), 'to': '%s %s' % (c2['key'], C.hm(c2['h'])), 'dt': round(dt, 2), 'ev_from': a['ev'], 'ev_to': c2['ev'], 'txt': c2['txt'], 'lastpick': c2['lastpick']})
        for j in jumps:
            if j['lastpick'].startswith(('睡到', '睡一下', '小睡', '再睡一下')): j['why'] = '床：' + j['lastpick'][:20]
            elif arr and j['to'] == '%s %s' % (arr['d'], C.hm(arr['h'])): j['why'] = '車程（出發→抵達）'
            elif arr and abs(j['dt'] - ev_hours) < 0.3: j['why'] = '出遊 ev.hours'
            else: j['why'] = None
        run.note('8/30 起床以後超過 45 分鐘的跳：%s' % J(jumps))
        run.check('5 8/30 起床以後遊戲時鐘沒有倒退', bool(seg) and not back, J(back[:5]))
        bad_j = [j for j in jumps if j['dt'] > 1.0 and not j['why']]
        run.check('5 沒有不合理的大跳（超過 1 小時的只有床、車程、出遊 %s 小時）' % ev_hours, not bad_j, J(bad_j[:5]))
        run.check('6 walkFallbacks 0', fin['fb'] == 0, str(fin['fb']))
        run.check('6 沒有 JS 例外', not errs, J(errs[:3]))
        json.dump({'sha': SHA, 'ended': ended, 'records': recs, 'picks': picks, 'clocks': clocks, 'outing': q, 'dep': dep, 'arr': arr, 'ret': ret},
                  open(os.path.join(OUT, 'kexin_hsr_log.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
        await b.close()
    print('ALL PASS' if not run.fails else 'FAILED %d' % len(run.fails), flush=True)
    return 1 if run.fails else 0


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
