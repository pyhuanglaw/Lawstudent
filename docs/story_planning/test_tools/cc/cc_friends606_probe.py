"""CC（帳號 A）11-03：AA_606 好朋友的名片場——宿營完（8/24）照玩家玩到第 4 週 9/23 22:00 以後人在 203（約 25 天，第 3 級真實玩家探針）。
實作（6a8033f4e）：src/data/events.js 4980 起「好朋友的名片場」＋ZHE_FIRST_TABLE（Alison）；觸發條件照程式：
  ev_card_kai      「凌晨的作業」 trigger auto、location dorm、weeks [1]、time [23.5,26]、9/2 起、阿凱照 203 作息在房間（STORY.dormWho）
  ev_card_bohan    「第一排」     trigger class、beforeClass＝民法總則（civ_general）、weeks [2]、carryTo 5（同一堂有別的課前事件就讓位，延到下一次）
  Alison（yu）     第一次和阿哲去麵店（ev_zhe_long_table_out：第 2 週週四民總下課 ev_zhe_noodle_invite 選「好。」→ 18:30 出遊；或之後第一次在麵店遇到 ev_zhe_long_table）
                   開頭 ZHE_FIRST_TABLE_YU：大一上、還不認識 Alison → 認識她（FIRST_MET note noodle）
  ev_card_mingxuan 「公館便宜好吃.xlsx」 trigger class、afterClass＝第一次上完法律系必修（kind required）、weeks [3]、carryTo 5
  ev_card_zhe      「四碗麵」     trigger auto、location dorm、weeks [4]、time [22,26]、9/23 起、阿凱和柏翰都在房間
起點：SAVE=<camp608_824_save.json>【前置：cc_camp608_probe.py 在 8/24 匯出的存檔；標題「讀取／匯入存檔」→「匯入存檔」→「匯入」（玩家搬存檔的方式）】；
      沒給 SAVE＝【前置：沒有 ① 的存檔】乾淨的瀏覽器、標題「從法律系開始」照玩家點完宿營（不是捷徑，只是多幾分鐘）。
玩家的操作（不用 ?turbo、不瞬移、不改劇情狀態；不主動找人說話——名片場要自己播）：
  對話點過去；選項：起床選單「直接去上課」、出發選單「出發」、阿哲約吃麵「「好。」」、其他第一個（沒變暗的）；手機自己打開＝按第一個回覆再收起來。
  空下來：今天還有課、1 小時內開始 → 手機「今天」的「直接去上課」；不在宿舍 → 手機「地點」回宿舍；
  在宿舍 → 床：9/1 起選「快轉」→「到下一個有事的時候」（學期中的快轉：有劇情的課前 20 分、一定要演的事件、出遊、要回的訊息都會停；沒有劇情的課自動去上）；
  9/1 以前（開學前）與快轉不能用的日子：晚上「睡到明天…」、白天「睡到傍晚」。
結束：9/23 22:00 以後人在宿舍、空下來（四碗麵演過、或等到 23:40）；或日期過了 9/23。
每一場記三件事（stdout 的 CARD 行＋summary.json）：有沒有自動播、播出的日期和時間、對話框顯示的名字。檢查：
  1 五場都播了、各一次；2 日期時間照條件（阿凱 9/2 23:30 以後；柏翰第 2 週民總課前；Alison 在和阿哲第一次的麵店、note noodle；明軒第 3 週必修下課；阿哲 9/23 22:00 以後）；
  3 名字：阿凱、柏翰、明軒、Alison、阿哲（那一場那個人的每一句）；4 FRIEND_CARD_<id> 旗標都設了；5 walkFallbacks 0、沒有卡住、沒有 JS 例外。
用法：LW_TESTS=<工作樹>/tests [SHA=…] [SAVE=…] [MAX_S=36000] [UNTIL=2025-09-23] python3 cc_friends606_probe.py '<URL>/index.html' <輸出資料夾>
  雲端（SwiftShader 1～4 fps）跑不完整段：UNTIL=2025-09-02 之類只證明探針沒問題，沒跑到的場次印 FAIL「沒有跑到」。
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
MAX_S = int(os.environ.get('MAX_S', '36000'))
STUCK_S = int(os.environ.get('STUCK_S', '420'))
UNTIL = os.environ.get('UNTIL', '2025-09-23')
J = C.J
if '?turbo' in URL or '&turbo' in URL: raise SystemExit('真實流程不能用 ?turbo')

CARDS = [  # (場, ev id, 人, 叫的名字)
    ('阿凱「凌晨的作業」', 'ev_card_kai', 'kai', '阿凱'),
    ('柏翰「第一排」', 'ev_card_bohan', 'classmate_bohan', '柏翰'),
    ('阿哲介紹 Alison', ('ev_zhe_long_table_out', 'ev_zhe_long_table'), 'yu', 'Alison'),
    ('明軒「公館便宜好吃.xlsx」', 'ev_card_mingxuan', 'classmate_mingxuan', '明軒'),
    ('阿哲「四碗麵」', 'ev_card_zhe', 'zhe', '阿哲'),
]
CLSINFO = r"""(()=>{ try{ const G=GAME.G, R=CLS.rec(G); const its=CLS.dayItems(G).filter(it=>!CLS.storyClass(G,it)).map(it=>({key:it.key,cid:it.c.id,name:it.c.name,kind:it.c.kind,t0:it.t0,t1:it.t1,st:CLS.status(G,it),done:!!R.done[it.key]}));
  const gl=CLS.goList(G).filter(it=>!R.done[it.key]&&!(R.note&&R.note['plan_skip_'+it.key])).map(it=>({key:it.key,t0:it.t0})); return {its,gl}; }catch(e){ return {its:[],gl:[],err:String(e)}; } })()"""
FLAGS = "(()=>{ const F=GAME.G.flags||{}; const o={}; for(const k in F) if(k.startsWith('FRIEND_CARD_')||k==='ZHE_NOODLE_INV'||k==='noodleTableDay') o[k]=F[k]; return o; })()"
BED = "(()=>{ const it=(GAME.E.interactables||[]).find(i=>i.sleep&&!i.hidden); return it?[it.x,it.z,it.lv|0,it.label||'']:null; })()"
WEEK = "d=>{ try{ const t=CALENDAR.termOf(d); return t?{term:t.id,week:t.week}:null; }catch(e){ return null; } }"


async def phone_tab(pg, cdp, tab):
    if await pg.evaluate("document.getElementById('phone').classList.contains('hide')"):
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await L.tap(pg, cdp, '#phoneTabs button[data-ptab="%s"]' % tab); await pg.wait_for_timeout(900)


async def quick_go(pg, cdp, run, zone):
    await L.close_panels(pg, cdp); await phone_tab(pg, cdp, 'places')
    c = await pg.evaluate("(z=>{ const e=[...document.querySelectorAll('#phoneBody [data-place]')].find(b=>b.dataset.place.startsWith(z+'|')); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })", zone)
    if not c: await L.close_panels(pg, cdp); run.note('手機「地點」沒有 %s' % zone); return False
    await L.touch_tap(cdp, c[0], c[1])
    for _ in range(90):
        await pg.wait_for_timeout(1000)
        s = await C.ts(pg)
        if s['zone'] == zone or s['dlg'] or s['ch']: break
    return True


async def go_class(pg, cdp, run, key):
    """手機「今天」那一堂的「直接去上課」（玩家的快速前往）；之後交給主迴圈照演"""
    await L.close_panels(pg, cdp); await phone_tab(pg, cdp, 'today')
    sel = '#phoneBody [data-go="%s"]' % key
    btn = await pg.evaluate("(s=>{ const e=document.querySelector(s); return e?(e.textContent||'').trim():null; })", sel)
    if not btn: await L.close_panels(pg, cdp); run.note('手機「今天」沒有 %s 的按鈕' % key); return False
    await L.tap(pg, cdp, sel); await pg.wait_for_timeout(1500)
    run.note('手機「今天」→ %s「%s」' % (key, btn)); return True


async def go_bed(pg, cdp, run):
    it = await pg.evaluate(BED)
    if not it: run.note('這一區找不到床'); return False
    await L.go_to(pg, cdp, run, it[0], it[1], 0.8, '床', max_s=300, lv=it[2], stop=lambda s: s['dlg'] or s['choices'])
    for _ in range(4):
        s = await C.ts(pg)
        if s['ch'] or s['dlg']: return True
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1600)
    return True


async def main():
    run = L.Run('cc_friends606', OUT); os.makedirs(OUT, exist_ok=True)
    print('cc_friends606_probe  SHA=%s  URL=%s  SAVE=%s  UNTIL=%s' % (SHA, URL, SAVE or '（沒有）', UNTIL), flush=True)
    sp = None
    if SAVE:
        sp = C.wait_save(run, SAVE, SAVE_SHA, SAVE_WAIT_MIN)   # PC 佇列：camp608 那一項寫好（版本相符）才開始
        if not sp:
            run.check('有 8/24 存檔 %s（SAVE_SHA=%s）' % (SAVE, SAVE_SHA or '不限'), False); print('FAILED %d' % len(run.fails), flush=True); return 1
    recs, picks = [], []
    summary = {'sha': SHA, 'url': URL, 'save': SAVE, 'until': UNTIL, 'cards': [], 'days': []}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg, 600))
        d0 = await pg.evaluate("STORY.dayOfKey('2025-08-22')"); d901 = await pg.evaluate("STORY.dayOfKey('2025-09-01')")
        d_end = await pg.evaluate("k=>STORY.dayOfKey(k)", UNTIL)
        if SAVE:
            run.setup('讀 ① 匯出的 8/24 存檔 %s（標題「讀取／匯入存檔」→「匯入存檔」→「匯入」）' % SAVE)
            run.check('匯入 8/24 存檔', await C.import_save(pg, cdp, run, sp))
            ok_r, s_r = await C.resume_ok(pg, cdp, run, int(os.environ.get('RESUME_S', '240')))
            run.check('讀 8/24 存檔以後遊戲接著演、走到 8/29（不停在 8/24）', ok_r, J({k: s_r.get(k) for k in ('key', 'h', 'zone', 'campOn', 'CAMP_Y1', 'campStep')} if s_r else None))
            if not ok_r:
                await run.shot(pg, 'resume_stuck'); await b.close(); print('FAILED %d' % len(run.fails), flush=True); return 1
        else:
            run.setup('沒有 ① 的 8/24 存檔：乾淨的瀏覽器、標題「從法律系開始」照玩家點完宿營（不是捷徑）')
            run.check('標題畫面按「從法律系開始」', await C.new_game_law(pg, cdp, run))
        t0 = time.time(); last = None; since = time.time(); ended = None; tried = set(); day_key = None; shot_days = set()
        while time.time() - t0 < MAX_S:
            s = await C.ts(pg)
            if not s: await pg.wait_for_timeout(800); continue
            recs.extend(await pg.evaluate(C.TAKE))
            if s['running'] and not s['title'] and s['key'] != day_key:
                day_key = s['key']; tried = set(); summary['days'].append({'key': s['key'], 'real_s': round(time.time() - t0)})
                print('DAY %s（%s 第 %s 週）%s 實際 %d 秒' % (s['key'], s['term'], s['week'], C.hm(s['h']), time.time() - t0), flush=True)
                if s['day'] >= d901 and s['key'] not in shot_days and s['day'] % 7 == 0:
                    shot_days.add(s['key']); await run.shot(pg, 'day_%s' % s['key'])
            # 結束
            if s['day'] > d_end: ended = 'passed %s' % UNTIL; break
            if s['day'] == d_end and C.is_free(s) and s['zone'] == 'dorm' and s['h'] >= 22:
                fl = await pg.evaluate(FLAGS)
                if UNTIL != '2025-09-23' or fl.get('FRIEND_CARD_zhe') or s['h'] >= 23.65:
                    await pg.wait_for_timeout(3000); s2 = await C.ts(pg)
                    if C.is_free(s2): ended = 'reached %s %s in dorm' % (s2['key'], C.hm(s2['h'])); await run.shot(pg, 'end_203'); break
            # 卡住
            sig = (s['key'], round(s['h'], 2), s['txt'][:40], len(s['ch']), s['ev'], s['busy'], s['phone'], s['zone'])
            if sig != last: last = sig; since = time.time()
            elif time.time() - since > STUCK_S:
                await run.shot(pg, 'stuck_%s' % s['key']); run.check('%s %s 沒有卡住（同一個狀態 %d 秒）' % (s['key'], C.hm(s['h']), STUCK_S), False, J(s)); ended = 'stuck'; break
            # 對話、選項、手機
            if s['ch']:
                pre = ['直接去上課', '出發', '「好。」', '好。', '到下一個有事的時候']
                skip = ('再撐一下', '不用了', '翹這堂課')
                if s['day'] >= d901: pre += ['快轉', '睡到明天', '睡覺', '睡到傍晚']
                else: pre += ['睡到明天', '睡覺', '睡到傍晚']; skip = skip + ('快轉',)
                await C.step(pg, cdp, s, picks, prefer=tuple(pre), skip=skip); continue
            if await C.step(pg, cdp, s, picks): continue
            if not C.is_free(s) or not s['running'] or s['stage'] != 'law' or s['day'] < d0 + 3:
                await pg.wait_for_timeout(800); continue
            await pg.wait_for_timeout(1600)   # 起床選單、下課選單要空下來才出
            s = await C.ts(pg)
            if not C.is_free(s): continue
            ci = await pg.evaluate(CLSINFO)
            h = s['h']
            soon = [g for g in ci['gl'] if g['key'] not in tried and g['t0'] - h <= 1.0]
            if soon:
                tried.add(soon[0]['key']); await go_class(pg, cdp, run, soon[0]['key']); since = time.time(); continue
            if s['zone'] != 'dorm':
                run.note('%s %s 在 %s：手機「地點」回宿舍' % (s['key'], C.hm(h), s['zone'])); await quick_go(pg, cdp, run, 'dorm'); continue
            # 9/23：22:00 以前不快轉過頭——在 203 等（快轉也會在四碗麵那一刻停；這裡照玩家「晚上待在房間」）
            if s['day'] == d_end and UNTIL == '2025-09-23' and 17.5 <= h < 24:
                run.note('%s %s 在 203 等到 22:00 以後（不上床）' % (s['key'], C.hm(h))); await pg.wait_for_timeout(5000); continue
            run.note('%s %s 在宿舍空下來：去床' % (s['key'], C.hm(h)))
            await go_bed(pg, cdp, run)
        else:
            ended = 'MAX_S'
        recs.extend(await pg.evaluate(C.TAKE))
        fin = await C.ts(pg); fl = await pg.evaluate(FLAGS)
        run.note('結束：%s；%s；旗標 %s' % (ended, J({k: fin[k] for k in ('key', 'h', 'zone', 'fb', 'week')}), J(fl)))
        reached = ended and (ended.startswith('reached') or ended.startswith('passed'))
        run.check('走到 %s 22:00 以後人在 203（或日期過了）' % UNTIL, bool(reached), ended)

        evs = [r for r in recs if r['k'] == 'ev']
        for title, eid, cid, nm in CARDS:
            ids = eid if isinstance(eid, tuple) else (eid,)
            runs = [r for r in evs if r['t'] in ids]
            lines = [r for r in recs if r['k'] == 'say' and r.get('ev') in ids]
            names = sorted(set((r.get('n') or '') for r in lines if r.get('cid') == cid))
            row = {'card': title, 'ev': runs[0]['t'] if runs else None, 'auto': bool(runs), 'n_runs': len(runs),
                   'when': ('%s %s' % (runs[0]['d'], C.hm(runs[0]['h']))) if runs else None, 'zone': runs[0]['z'] if runs else None, 'names': names}
            if runs: row['week'] = await pg.evaluate(WEEK, runs[0]['day'])
            summary['cards'].append(row)
            print('CARD %s｜自動播：%s｜時間：%s（%s）｜區域 %s｜對話框名字：%s' % (title, '有' if runs else '沒有', row['when'], J(row.get('week')), row['zone'], J(names)), flush=True)
            if not runs:
                run.check('1 %s 有自動播（%s）' % (title, '沒有跑到' if not reached else '沒播'), False, '結束 %s' % ended); continue
            run.check('1 %s 播一次' % title, len(runs) == 1, str(len(runs)))
            r0 = runs[0]; wk = (row.get('week') or {}).get('week')
            if cid == 'kai': ok, why = r0['d'] == '2025-09-02' and 23.5 <= r0['h'] < 26, '9/2 23:30～02:00'
            elif cid == 'classmate_bohan':
                nxt = [r for r in evs if r['i'] > r0['i'] and r['k'] == 'ev']
                ok, why = wk == 2, '第 2 週民總課前（之後接的事件 %s）' % J([x['t'] for x in nxt[:2]])
            elif cid == 'yu':
                fm = (fin['met'] or {}).get('yu') or {}
                ok, why = fm.get('note') == 'noodle' and fm.get('day') == r0['day'], '和阿哲第一次去麵店時認識（FIRST_MET %s）' % J(fm)
            elif cid == 'classmate_mingxuan': ok, why = wk == 3, '第 3 週必修下課'
            else: ok, why = r0['d'] == '2025-09-23' and 22 <= r0['h'] < 26, '9/23 22:00 以後、203'
            if cid in ('kai', 'zhe'): ok = ok and r0['z'] == 'dorm'
            run.check('2 %s 的時間：%s %s（應為 %s）' % (title, r0['d'], C.hm(r0['h']), why), ok, J(row))
            run.check('3 %s 對話框名字都是「%s」' % (title, nm), bool(names) and all(n.startswith(nm) for n in names), J(names))
        for _, _, cid, _ in CARDS:
            if cid == 'yu': continue
            run.check('4 旗標 FRIEND_CARD_%s' % cid, bool(fl.get('FRIEND_CARD_' + cid)), J(fl))
        run.check('5 walkFallbacks 0', fin['fb'] == 0, str(fin['fb']))
        run.check('5 沒有 JS 例外', not errs, J(errs[:3]))
        summary.update(ended=ended, flags=fl, picks=picks[-400:], fails=run.fails)
        json.dump(summary, open(os.path.join(OUT, 'summary.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        json.dump(recs, open(os.path.join(OUT, 'records.json'), 'w', encoding='utf-8'), ensure_ascii=False)
        try:
            sv = await pg.evaluate("JSON.stringify(GAME.snapshot())")
            open(os.path.join(OUT, 'final_save.json'), 'w', encoding='utf-8').write(sv)
        except Exception as e: run.note('final_save 匯出失敗 %r' % e)
        await b.close()
    print('ALL PASS' if not run.fails else 'FAILED %d' % len(run.fails), flush=True)
    return 1 if run.fails else 0


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
