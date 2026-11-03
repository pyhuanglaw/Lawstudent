"""CC（帳號 A）11-03：AA_608 宿營整段（8/22～8/24）真實玩家探針（第 3 級）。
實作：6a8033f4e（df63cb10c 合併 AA_608＋AA_606）；src/data/camp_y1.js、src/story3d.js 的 S.CAMP_SEQ／S.campY1。
做法：乾淨的瀏覽器（新 context，沒有存檔）→ 標題按「從法律系開始」（#btnNewLaw）→ 回顧、宿營全部在 2D 畫面，照玩家點對話框、選項一律第一個（沒變暗的）
     → 宿營演完、回家那句、到 8/29 搬宿舍的字卡就停。不用 ?turbo、不瞬移、不改劇情狀態、沒有捷徑（宿營是連續的劇情，時間由遊戲自己跳）。
     只記錄：HOOK 包 GAME.say／choose／titleCard／EVENTS.run（呼叫原本的函式，只多記一筆）。
名單照程式：camp_y1.js 開頭註解「宿營只認識芯慈、阿哲、沛珊；明軒、Alison 只有一句印象旁白（不寫名字、不記認識）；柏翰、Kevin 不出場」。
  可以講話的：classmate_xinci、zhe、classmate_peishan、玩家、沒有名字的背景（小隊輔、系學會）、旁白。
  其他 CHARACTERS／PORTRAIT_ONLY 的人（以安 heroine_01、學姊 heroine_05、Alison yu、明軒、柏翰、阿凱、Kevin npc_kevin、可昕…）講話或被記「認識」＝FAIL。
檢查（每項一行 PASS／FAIL）：
  a 八段照 S.CAMP_SEQ 的順序、日子、時間演（ev id、G.day、G.hour）；retired 的段落沒有演
  b 每天：講話的人、新認識的人都在名單內（逐天列出）；每天一張截圖（那天第一句台詞時）
  c 認識的順序：芯慈（破冰）→ 阿哲（撕名牌，ev_camp_d1_field）→ 大老二＋學測（ev_camp_d1_free 裡「十五級分。」）→ 沛珊（ev_camp_d2_fire）
  d 沛珊在營火之前沒有出現：營火以前沒有她的台詞、沒有 FIRST_MET；營火裡第一句「嗨。」；認識地點 note＝camp
  e 演完：CAMP_Y1、campStep／campSeqV 清掉；只認識這三個人（FIRST_MET note camp 的只有三個）；walkFallbacks 0；沒有 JS 例外
  另外匯出 8/24 的存檔（演完最後一段 ev_camp_d3_end 以後的自動存檔，campStep 8、8/24）→ <out>/camp608_824_save.json（＋camp608_824_save.json.meta.json：寫的版本 SHA、時間），給 cc_friends606_probe.py、cc_kexin_hsr_probe.py 當起點。
用法：LW_TESTS=<工作樹>/tests [SHA=<sha>] [MAX_S=3600] python3 cc_camp608_probe.py '<URL>/index.html' <輸出資料夾>
exit 0＝ALL PASS；1＝有 FAIL。不是 iPhone：Playwright 手機橫向模擬（844×390）。"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import cc_camp608_common as C
L = C.L
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
SHA = os.environ.get('SHA', '?')
MAX_S = int(os.environ.get('MAX_S', '3600'))
STUCK_S = int(os.environ.get('STUCK_S', '240'))
J = C.J
ALLOW_IDS = {'zhe', 'classmate_xinci', 'classmate_peishan'}
if '?turbo' in URL or '&turbo' in URL: raise SystemExit('真實流程不能用 ?turbo')


async def main():
    run = L.Run('cc_camp608', OUT); os.makedirs(OUT, exist_ok=True)
    print('cc_camp608_probe  SHA=%s  URL=%s' % (SHA, URL), flush=True)
    recs, picks, polls = [], [], []
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg, 600))
        d0 = await pg.evaluate("STORY.dayOfKey(STORY.CAMP_DAY||'2025-08-22')")
        seq = await pg.evaluate("(STORY.CAMP_SEQ||[]).map(x=>x.slice())")
        retired = await pg.evaluate("STORY_EVENTS.filter(e=>e.trigger==='camp'&&e.retired).map(e=>e.id)")
        roster = (await pg.evaluate(C.ROSTER, sorted(ALLOW_IDS)))['ids']
        run.note('宿營第一天 day=%s；CAMP_SEQ=%s；retired=%s' % (d0, J(seq), J(retired)))
        run.check('這一版有 S.CAMP_SEQ（8 段）', len(seq) == 8, J([x[0] for x in seq]))
        await run.shot(pg, 'title')
        run.check('標題畫面按「從法律系開始」', await C.new_game_law(pg, cdp, run))
        pname = await pg.evaluate("GAME.G.name")
        allow_names = {pname, '小隊輔', '系學會', ''}
        t0 = time.time(); last = None; since = time.time(); shot_days = set(); saved = None; ended = None
        while time.time() - t0 < MAX_S:
            s = await C.ts(pg)
            if not s: await pg.wait_for_timeout(800); continue
            polls.append({k: s[k] for k in ('key', 'h', 'campStep', 'ev', 'dlg', 'name')})
            recs.extend(await pg.evaluate(C.TAKE))
            # 每天第一句台詞截一張
            if s['campOn'] and s['dlg'] and s['key'] not in shot_days:
                shot_days.add(s['key']); await run.shot(pg, 'day_%s' % s['key'])
            # 8/24 的存檔（最後一段演完的自動存檔）
            if s['campStep'] == len(seq) and saved is None:
                sv = await C.save_auto(pg)
                if sv and sv.get('day') == d0 + 2 and (sv.get('flags') or {}).get('campStep') == len(seq):
                    saved = sv; C.write_save(os.path.join(OUT, 'camp608_824_save.json'), sv, SHA)
                    run.note('匯出 8/24 存檔：day=%s h=%s campStep=%s → camp608_824_save.json' % (sv.get('day'), sv.get('hour'), sv['flags'].get('campStep')))
            if s['CAMP_Y1'] and not s['campOn'] and s['day'] > d0 + 2:
                ended = 'after camp (%s)' % s['key']; break
            sig = (s['key'], s['h'], s['txt'][:40], len(s['ch']), s['ev'], s['busy'])
            if sig != last: last = sig; since = time.time()
            elif time.time() - since > STUCK_S:
                await run.shot(pg, 'stuck'); run.check('沒有卡住（同一個畫面 %d 秒）' % STUCK_S, False, J(s)); ended = 'stuck'; break
            if await C.step(pg, cdp, s, picks): continue
            await pg.wait_for_timeout(700)
        else:
            ended = 'MAX_S'
        recs.extend(await pg.evaluate(C.TAKE))
        await run.shot(pg, 'end')
        fin = await C.ts(pg)
        run.note('結束：%s；最後 %s' % (ended, J({k: fin[k] for k in ('key', 'h', 'zone', 'CAMP_Y1', 'campOn', 'campStep')})))
        run.check('宿營演完（走到 8/24 以後）', ended and ended.startswith('after camp'), ended)

        # ---- a 順序、日子、時間 ----
        evs = [r for r in recs if r['k'] == 'ev' and r['t'].startswith('ev_camp_')]
        got = [r['t'] for r in evs]
        run.note('宿營演過的段落：%s' % J([[r['t'], r['d'], C.hm(r['h'])] for r in evs]))
        run.check('a 八段照 CAMP_SEQ 的順序演', got == [x[0] for x in seq], '演的=%s' % J(got))
        bad_t = []
        for r in evs:
            q = next((x for x in seq if x[0] == r['t']), None)
            if q and (r['day'] != d0 + q[1] or abs(r['h'] - q[2]) > 0.02): bad_t.append([r['t'], r['d'], C.hm(r['h']), '應為 第%d天 %s' % (q[1] + 1, C.hm(q[2]))])
        run.check('a 每段的日子、時間照 CAMP_SEQ', not bad_t, J(bad_t))
        run.check('a retired 的段落沒有演', not [x for x in got if x in retired], J([x for x in got if x in retired]))

        # ---- b 每天的人 ----
        says = [r for r in recs if r['k'] == 'say' and r.get('camp')]
        bad = []
        days = sorted(set(r['d'] for r in says))
        met_by_day = {}
        fin_met = fin['met']
        for id_, m in fin_met.items():
            met_by_day.setdefault(m['day'], []).append('%s(%s)' % (id_, m['note']))
        for dk in days:
            sp = {}
            for r in says:
                if r['d'] != dk: continue
                key = (r.get('n') or '（旁白）') + ('〔%s〕' % r['cid'] if r.get('cid') else '')
                sp[key] = sp.get(key, 0) + 1
                c = C.classify(r, roster, ALLOW_IDS, allow_names)
                if c: bad.append([dk, C.hm(r['h']), r.get('ev'), r.get('n'), r.get('cid'), r['t'][:30], '→' + c])
            dd = await pg.evaluate("k=>STORY.dayOfKey(k)", dk)
            print('DAY %s 講話的人：%s｜新認識：%s' % (dk, J(sp), J(met_by_day.get(dd, []))), flush=True)
        run.check('b 宿營三天講話的人都在名單內（阿哲、芯慈、沛珊、玩家、背景、旁白）', not bad, J(bad[:8]))
        camp_met = {k: v for k, v in fin_met.items() if v['note'] == 'camp'}
        run.check('b／e 宿營認識的（FIRST_MET note camp）只有阿哲、芯慈、沛珊', set(camp_met) == ALLOW_IDS, J(camp_met))
        other_met = [k for k, v in fin_met.items() if d0 <= v['day'] <= d0 + 2 and k not in ALLOW_IDS]
        run.check('b 8/22～8/24 沒有認識別人（任何 note）', not other_met, J({k: fin_met[k] for k in other_met}))
        run.check('b 每天都有截圖（3 張）', len(shot_days) == 3, J(sorted(shot_days)))

        # ---- c 順序 ----
        def first(pred):
            x = next((r for r in recs if pred(r)), None); return x['i'] if x else None
        i_field = first(lambda r: r['k'] == 'ev' and r['t'] == 'ev_camp_d1_field')
        i_free = first(lambda r: r['k'] == 'ev' and r['t'] == 'ev_camp_d1_free')
        i_fire = first(lambda r: r['k'] == 'ev' and r['t'] == 'ev_camp_d2_fire')
        i_zhe_name = first(lambda r: r['k'] == 'say' and r['t'].startswith('張哲維，叫我阿哲'))
        i_15 = first(lambda r: r['k'] == 'say' and r['t'].startswith('十五級分'))
        i_ps = first(lambda r: r['k'] == 'say' and (r.get('cid') == 'classmate_peishan'))
        i_xc = first(lambda r: r['k'] == 'say' and (r.get('cid') == 'classmate_xinci'))
        order = {'芯慈第一句': i_xc, '撕名牌': i_field, '阿哲報名字': i_zhe_name, '自由時間': i_free, '十五級分': i_15, '營火': i_fire, '沛珊第一句': i_ps}
        run.note('順序（紀錄編號）：%s' % J(order))
        ok = all(v is not None for v in order.values()) and i_xc < i_field < i_zhe_name < i_free < i_15 < i_fire < i_ps
        run.check('c 芯慈 → 撕名牌（阿哲）→ 大老二＋學測（十五級分）→ 營火沛珊', ok, J(order))
        x15 = next((r for r in recs if r['k'] == 'say' and r['t'].startswith('十五級分')), None)
        run.check('c 「十五級分。」在自由時間（ev_camp_d1_free）裡', bool(x15) and x15.get('ev') == 'ev_camp_d1_free', J(x15))
        dm = {k: fin_met.get(k) for k in ALLOW_IDS}
        run.check('c 認識的日子：芯慈、阿哲 8/22，沛珊 8/23', bool(dm['classmate_xinci']) and dm['classmate_xinci']['day'] == d0 and bool(dm['zhe']) and dm['zhe']['day'] == d0
                  and bool(dm['classmate_peishan']) and dm['classmate_peishan']['day'] == d0 + 1, J(dm))

        # ---- d 沛珊 ----
        early_ps = [r for r in recs if r['k'] == 'say' and r.get('cid') == 'classmate_peishan' and i_fire is not None and r['i'] < i_fire]
        run.check('d 營火之前沒有沛珊的台詞', i_fire is not None and not early_ps, J(early_ps[:3]))
        ps_say = next((r for r in recs if r['k'] == 'say' and r.get('cid') == 'classmate_peishan'), None)
        run.check('d 沛珊第一句是營火裡的「嗨。」', bool(ps_say) and ps_say.get('ev') == 'ev_camp_d2_fire' and ps_say['t'].startswith('嗨。'), J(ps_say))
        ps_seen = [pl for pl in polls if pl.get('name', '').startswith('沛珊') and (pl.get('campStep') or 0) < 5]
        run.check('d 營火（第 6 段）以前對話框沒有出現「沛珊」的名牌', not ps_seen, J(ps_seen[:3]))

        # ---- e ----
        run.check('e 演完：CAMP_Y1＝true、campStep／campSeqV 清掉', fin['CAMP_Y1'] and fin['campStep'] is None and fin['campSeqV'] is None, J({k: fin[k] for k in ('CAMP_Y1', 'campStep', 'campSeqV')}))
        run.check('e 8/24 的存檔匯出了（camp608_824_save.json）', saved is not None)
        run.check('e walkFallbacks 0', fin['fb'] == 0, str(fin['fb']))
        run.check('e 沒有 JS 例外', not errs, J(errs[:3]))
        json.dump({'sha': SHA, 'ended': ended, 'records': recs, 'picks': picks, 'met': fin_met}, open(os.path.join(OUT, 'camp608_log.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
        await b.close()
    print('ALL PASS' if not run.fails else 'FAILED %d' % len(run.fails), flush=True)
    return 1 if run.fails else 0


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
