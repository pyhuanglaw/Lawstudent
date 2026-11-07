"""BB-B 2026-11-07：YT-INVITE-LINES-1107 瀏覽器驗收（LAWWW-B a737644e2；語彤的邀約回覆照 AA_415 c71772fbc 改）。
使用者 11-07 試玩：總圖約念書回「好。我先把菜洗完。」、Café 回「……那裡很貴。」（語彤家裡不缺錢）。
[前置／捷徑] 讀使用者自己的存檔（user_saves/2026-11-07/，AA-B 收在 claude/cool-heisenberg-o8kuqx）；之後全部用觸控：手機「朋友」→ 語彤「約」→ 地方 → 時間 → 點對話。
每個情境都重新讀檔，只看她回的那幾句：
  ① 舊句不能再出現（先把菜洗完、那裡很貴、我點最小杯的、我媽會等我）；
  ② 她說的每一句都在遊戲的 INVITE_REPLIES 語彤那一組（＝AA_415 c71772fbc 的定稿）或 invites.js 的婉拒句裡。
用法：LW_TESTS=<開發分支>/tests python3 yt1107_probe.py URL 存檔.json 輸出資料夾"""
import asyncio, json, os, sys
from playwright.async_api import async_playwright
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.dirname(__file__))
import playlib as L

URL, SAVE, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
OLD = ['先把菜洗完', '那裡很貴', '我點最小杯的', '我媽會等我']
PLACES = [('lib', '念書', '總圖'), ('cafe_drink', '喝咖啡', '2:30 AM'), ('cafe_study', '念書', '2:30 AM')]   # 手機地點選單兩層：活動 → 店（2:30 AM＝兩點半 Café）


async def tap_sel(pg, cdp, sel):
    ok = await pg.evaluate("(s=>{ const e=document.querySelector(s); if(!e) return false; e.scrollIntoView({block:'center'}); return true; })(%s)" % json.dumps(sel))
    if not ok: return False
    await pg.wait_for_timeout(500)
    return await L.tap(pg, cdp, sel)


async def choose(pg, cdp, word):
    c = await pg.evaluate("(w=>{ const b=[...document.querySelectorAll('#choices button')].find(x=>x.textContent.includes(w)); if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,b.textContent.trim()]; })(%s)" % json.dumps(word))
    if not c: return None
    await L.touch_tap(cdp, c[0], c[1]); await pg.wait_for_timeout(1500); return c[2]


async def opts(pg):
    return await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim())")


async def main():
    run = L.Run('yt1107', OUT)
    save = json.load(open(SAVE, encoding='utf-8'))
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        allowed = await pg.evaluate("(()=>{ const P=(INVITE_REPLIES.people||{}).heroine_03||[]; const s=new Set(); for(const r of P) for(const l of (r.lines||[])) s.add(l); return [...s]; })()")
        run.check('遊戲裡的語彤回覆表照 c71772fbc', await pg.evaluate("INVITE_REPLIES.sha") == 'c71772fbc', await pg.evaluate("INVITE_REPLIES.sha"))
        for key, cat, word in PLACES:
            run.setup('讀使用者存檔 %s（第 %s 天 %s:%02d %s）' % (os.path.basename(SAVE), save.get('day'), int(save.get('hour', 0)), int(round((save.get('hour', 0) % 1) * 60)), save.get('zone')))
            await L.load_state(pg, save, quiet_phone=True)
            await pg.wait_for_timeout(3500)
            st = await pg.evaluate("({stage:(typeof SOCIAL!=='undefined'&&SOCIAL.stage)?SOCIAL.stage('heroine_03'):null, inv:(typeof INV!=='undefined'&&INV.stageOf)?INV.stageOf(GAME.G,'heroine_03'):null})")
            print('  [%s] 語彤關係' % key, st, flush=True)
            if await pg.evaluate("document.getElementById('phone').classList.contains('hide')"):
                await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
            await L.tap(pg, cdp, '#phoneTabs button[data-ptab="friends"]'); await pg.wait_for_timeout(700)
            has = await pg.evaluate("!!document.querySelector('#phoneBody [data-inv=\"heroine_03\"]')")
            run.check('[%s] 手機「朋友」有語彤的「約」' % key, has, (await pg.evaluate("(document.getElementById('phoneBody')||{}).textContent||''"))[:120])
            if not has: continue
            await tap_sel(pg, cdp, '#phoneBody [data-inv="heroine_03"]'); await pg.wait_for_timeout(1500)
            o = await opts(pg); print('   地方', o, flush=True)
            m0 = await pg.evaluate("(GAME.G.msgs||[]).length")
            got = await choose(pg, cdp, cat)
            o2 = await opts(pg); print('   店', o2, flush=True)
            got2 = await choose(pg, cdp, word) if got else None
            run.check('[%s] 選得到「%s」→「%s」' % (key, cat, word), bool(got and got2), json.dumps([o, o2], ensure_ascii=False))
            if not got2: continue
            said, picked = [], [got, got2]
            for _ in range(30):
                q = await L.state(pg)
                if q['dtext'] and (not said or said[-1] != q['dtext']): said.append(q['dtext'])
                if q['choices']:
                    o = await opts(pg); print('   選項', o, flush=True)
                    t = next((x for x in o if x.startswith('好，就')), None) or next((x for x in o if x.startswith('明天 19:00')), None) or next((x for x in o if x.startswith('今天') or x.startswith('明天')), None) or next((x for x in o if '算了' not in x and '返回' not in x), o[0])
                    picked.append(await choose(pg, cdp, t)); continue
                if not q['busy'] and not q['dlg']: break
                await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(1200)
            await pg.wait_for_timeout(3000)
            msgs = await pg.evaluate("(m0=>(GAME.G.msgs||[]).slice(m0).map(m=>[m.from||m.who||'',m.text||'']))(%d)" % m0)
            print('   新訊息', msgs, flush=True)
            said += [t for w, t in msgs if 'heroine_03' in str(w) or '語彤' in str(w)]
            await run.shot(pg, 'yt_%s' % key)
            print('   她說', said, flush=True)
            bad = [l for l in said if any(w in l for w in OLD)]
            run.check('[%s] 舊句沒有出現（%s）' % (key, '、'.join(OLD)), not bad, json.dumps(bad, ensure_ascii=False))
            hers = [l.split('｜', 1)[-1] for l in said if l.split('｜', 1)[-1].startswith('「') or l in [t for w, t in msgs]]   # 對話框「名字｜台詞」；手機訊息不一定有「」
            off = [l for l in hers if l not in allowed and ('「' + l + '」') not in allowed]
            run.check('[%s] 她說的「」句都在 AA_415 c71772fbc 語彤那一組（%d 句）' % (key, len(hers)), hers and not off, json.dumps({'said': said, 'off': off, 'picked': picked, 'stage': st}, ensure_ascii=False))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:5], ensure_ascii=False))
        await b.close()
    return run.finish()


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
