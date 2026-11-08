"""CC-B（帳號 B）11-09：GIFT7＋GIFT-ZHE（BB-B 18:16；照 BB-B pt1108n 改）。判定＝BB。
每一位：【前置／捷徑】讀檔（SAVES/SAVE，預設 qa day46）改到 13:00 日和便利店、關條件事件 → 觸控走到櫃台「買一份帶走送人…」青茶（微糖）
→【捷徑】STORY.whereIs 找人（不在就撥時間；不在這一區用目前狀態讀檔到那一區）→ 走到旁邊按互動。
 女主角（WHO 預設 芷若、語彤、子晴、學姊、沛珊、可昕）：當面說話選單要有「送她青茶」、選了以後東西送出去、她有回話。
 阿哲（zhe）：要找他「不是走走」的時段（whereIs.act），選單沒有「送他」、東西還在。
不在台灣／這天見不到＝寫明跳過。不是 iPhone：Playwright 手機橫向模擬（SwiftShader）。
用法：LW_TESTS=<wt>/tests SAVES=<資料夾> [SAVE=day46.json] [WHO=heroine_02,...,zhe] python3 cc_gift7_probe.py <url> <out>"""
import asyncio, json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or HERE); sys.path.insert(0, HERE)
URL, OUT = sys.argv[1], sys.argv[2]
SAVES = os.environ.get('SAVES') or '.'
sys.argv = [sys.argv[0], URL, SAVES, OUT]   # pt1108n 在 import 時讀 argv
import playlib as L
import pt1107c_probe as C
import pt1108g_gift_friends_probe as G8
import pt1108n_gift_romance_only_probe as N
from playwright.async_api import async_playwright
J = N.J
_wu = C.walk_use
ALIAS = {'和沈以安說話': '和小安說話'}   # 11-09 GIFT-MORNING：以安的互動鍵寫「和小安說話」（pt1108n 用全名找＝走到了也判走不到）
async def _walk_use(pg, cdp, run, x, z, lv, label, near=1.2):
    ok, st = await _wu(pg, cdp, run, x, z, lv, label, near)
    if not ok and label in ALIAS and (st.get('interact') or '').startswith(ALIAS[label]):
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1200); return True, st
    return ok, st
C.walk_use = _walk_use
NAMES = {'heroine_01': '以安', 'heroine_02': '芷若', 'heroine_03': '語彤', 'heroine_04': '子晴', 'heroine_05': '學姊', 'classmate_peishan': '沛珊', 'kexin': '可昕', 'zhe': '阿哲'}
WHO = [w for w in (os.environ.get('WHO') or 'heroine_02,heroine_03,heroine_04,heroine_05,classmate_peishan,kexin,zhe').split(',') if w]
ITEM = os.environ.get('ITEM') or '青茶'   # GIFT-MORNING：ITEM=飯糰 EXTRA= BUYH=8.5 HOURS=8.5,9,9.5,10 NODRINK=1
EXTRA = os.environ.get('EXTRA', '微糖') or None
BUYH = float(os.environ.get('BUYH') or 13.0)
HOURS = [float(x) for x in (os.environ.get('HOURS') or '13,13.5,14,14.5,15,15.5,16,16.5,17,17.5,18,18.5,19,19.5,20,12,11.5,11,10.5,10,9.5,9').split(',') if x]
ALLOW_WALK = os.environ.get('ALLOW_WALK') == '1'   # 女主角（不是阿哲）可以在走走的時候送
NODRINK = os.environ.get('NODRINK') == '1'         # 早餐：她的回話不能是飲料那幾句（不能有「喝」）

async def main():
    run = L.Run('cc_gift7', OUT)
    SAVE = os.environ.get('SAVE', 'day46.json')
    s = json.load(open(os.path.join(SAVES, SAVE), encoding='utf-8'))
    s2 = dict(s); s2.update({'zone': 'cvs', 'hour': BUYH, 'pos': None})
    s2['money'] = max(int(s2.get('money') or 0), 2000)
    rec = []
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg))
        run.note('存檔 %s：day %s；GIFT.FRIEND_OK %s' % (SAVE, s.get('day'), J(await pg.evaluate("(typeof GIFT!=='undefined'&&GIFT.FRIEND_OK)?Object.keys(GIFT.FRIEND_OK):null"))))
        for who in WHO:
            nm = NAMES.get(who, who); tag = '[%s]' % nm; r0 = {'who': who, 'name': nm}
            run.setup('%s 【捷徑】存檔 %s 改成 13:00 日和便利店、錢 ≥2000、關條件事件' % (tag, SAVE))
            await L.load_state(pg, s2, quiet_events=True); await pg.wait_for_timeout(3500); await C.run_dialog(pg, cdp, [], 30)
            ct = await pg.evaluate("(()=>{ const i=GAME.E.interactables.find(q=>q.shop==='cvs'||q.counter==='cvs'); return i?{x:i.x,z:i.z,lv:i.lv|0,label:i.label}:null; })()")
            if not ct or not await G8.buy(pg, cdp, run, ct, ITEM, EXTRA):
                r0['skip'] = '買不到'; rec.append(r0); continue
            c0 = await C.carry(pg); r0['carry0'] = c0
            if True:   # 找他／她「不是走走、不是在打工」的時段（11-09 第二輪：芷若 13:00 在 2:30 AM 櫃台裡打工，走不到旁邊，30 分鐘逾時）
                h = await pg.evaluate("(w=>{ const h0=GAME.G.hour; for(const h of HS){ GAME.G.hour=h; const r=STORY.whereIs(GAME,w); const a=String(r&&(r.act||r.label||r.doing)||''); if(r&&r.zone&&!r.away&&!/打工|上班|值班|班/.test(a)&&(AW||!/走走|walk|wander|stroll/i.test(a))){ GAME.G.hour=h0; return {h, r}; } } GAME.G.hour=h0; return null; })(%s)".replace('HS', J(HOURS)).replace('AW', 'true' if (ALLOW_WALK and (who != 'zhe' or os.environ.get('ZHE_WALK') == '1')) else 'false') % J(who))
                run.note('%s 不是走走的時段：%s' % (tag, J(h)))
                if not h: r0['skip'] = '今天找不到他坐著或站著的時段'; rec.append(r0); continue
                await pg.evaluate("h=>{ GAME.G.hour=h; }", h['h'])
            ab = await pg.evaluate("(w=>{ const r=STORY.whereIs(GAME,w); return r||null; })(%s)" % J(who))
            r0['whereIs0'] = ab
            n = await G8.go_to_person(pg, cdp, run, s2, who, None)
            if not n:
                for _ in range(20):
                    if await N.npc_of(pg, who): break
                    await pg.wait_for_timeout(2000)
            if not await N.npc_of(pg, who):
                r0['skip'] = '這天找不到（whereIs %s）' % J(await pg.evaluate("(w=>STORY.whereIs(GAME,w)||null)(%s)" % J(who)))
                run.note('%s 跳過：%s' % (tag, r0['skip'])); rec.append(r0); continue
            r0['at'] = await pg.evaluate("({zone:GAME.G.zone, h:+(+GAME.G.hour).toFixed(2), day:GAME.G.day})")
            prefs = N.NEUTRAL if who == 'zhe' else ['送她' + ITEM]
            if '走走' in str((ab or {}).get('act', '')):   # BB-B 19:31：走走的人先等他／她停住（2 秒沒動）再靠近，最多等 90 秒
                last = None; still = 0
                for _ in range(90):
                    q = await N.npc_of(pg, who)
                    if q and last and abs(q['x'] - last['x']) + abs(q['z'] - last['z']) < 0.05: still += 1
                    else: still = 0
                    last = q
                    if still >= 2: break
                    await pg.wait_for_timeout(1000)
                run.note('%s 走走：等他／她停住 still=%d 在 %s' % (tag, still, J(last)))
            t = await N.talk(pg, cdp, run, who, prefs, 'g_' + who)
            if not t and os.environ.get('TRY2') == '1':   # 最多兩次
                run.note('%s 第一次走不到，再試一次' % tag); t = await N.talk(pg, cdp, run, who, prefs, 'g2_' + who)
            if not t: r0['skip'] = '走不到旁邊'; rec.append(r0); continue
            menu, seen, said = t
            gifts = [o for grp in seen for o in grp if o.startswith('送他') or o.startswith('送她')]
            c2 = await C.carry(pg); r0.update({'menu': menu, 'gifts': gifts, 'said': said[:24], 'carry2': c2})
            if who == 'zhe':
                run.check('%s 當面說話選項沒有「送他／送她○○」' % tag, bool(menu) and not gifts, J({'menu': menu, 'gifts': gifts}))
                run.check('%s 東西還在身上' % tag, sorted(c2) == sorted(c0), J({'before': c0, 'after': c2}))
            else:
                had = any(('送她' + ITEM) in o for o in menu)
                run.check('%s 選項有「送她%s」' % (tag, ITEM), had, J(menu))
                run.check('%s 選了以後收下、東西不在身上、她有回話' % tag, had and not any(x.startswith(ITEM) for x in c2) and len(said) >= 2, J({'carry': c2, 'said': said[:6]}))
                if NODRINK:
                    after = said[next((i for i, x in enumerate(said) if '遞給' in x or ITEM in x), 0):]
                    run.check('%s 她的回話是早餐那幾句、不是飲料（沒有「喝」）' % tag, had and bool(after) and not any('喝' in x for x in after), J(after[:8]))
            rec.append(r0)
        run.check('沒有 JS 例外', not errs, J(errs[:5]))
        await b.close()
    json.dump(rec, open(os.path.join(OUT, 'gift7.json'), 'w'), ensure_ascii=False, indent=1)
    return run.finish()

if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
