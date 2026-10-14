"""舊存檔的女主角初遇遷移（AA_120 7-4 第 7 點；src/game3d.js 的 relabelFirstMet）——真的讀檔流程（標題畫面「繼續」）。
[前置／捷徑] 放一份「舊版一般自我介紹留下芷若 FIRST_MET、她的相遇事件一次都沒播過」的自動存檔到 localStorage（模擬舊版玩家的存檔），之後都走真的介面。
檢查：
  1. 標題畫面按「繼續」讀得進來；芷若的 FIRST_MET 變成「打過招呼」（GREETED）、熟悉度不變；遊戲把她當成還沒見過（相遇事件不會永久錯過）。
  2. 改之前的原始存檔備份在 fatiao3d_backup（和放進去的一模一樣）。
  3. 已經正常相遇的人（子晴：吉他社事件播過）不動。
  4. 存檔、重新整理、再讀一次：不會再改一次（fm120），備份不會被蓋掉。
D61（使用者 2026-10-14）：另外檢查這個存檔專用的備份 fatiao3d_backup_fm120_<savedAt>、芷若的 met_ 旗標跟著拿掉。Node 版（六個條件、資料壞掉、備份寫不進去）：tests/save_firstmet_unit.js
用法：python3 tests/save_firstmet_migration.py URL [輸出資料夾]"""
import asyncio, json, sys
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else '/tmp/save_firstmet_migration'
BASE_FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True}


async def main():
    run = L.Run('save_firstmet_migration', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        run.check('遊戲載入', await L.wait_loaded(pg))
        run.setup('放一份舊版風格的自動存檔：第 10 天、校園；芷若 FIRST_MET（一般自我介紹，事件沒播過）、子晴 FIRST_MET（吉他社事件播過）')
        raw = await pg.evaluate("""(F=>{ const s=GAME.defaults('舊版玩家'); Object.assign(s,{day:10,hour:15,weekday:5,zone:'campus',pos:{x:0,z:6,yaw:3.14,lv:0},flags:F});
            s.social={rel:{heroine_02:{fam:12,comf:3,trust:0,resp:0,rom:0,talked:2}},mem:{heroine_02:[{tag:'FIRST_MET',day:4,note:'campus'}],heroine_04:[{tag:'FIRST_MET',day:6,note:'wancai'}]},reveal:{heroine_02:'ACQUAINTANCE',heroine_04:'ACQUAINTANCE'},prof:{},grad:{interest:'NONE',field:null,prep:0}};
            s.events={done:{ev_ziqing_club:1},last:{ev_ziqing_club:6},count:1}; s.savedAt=Date.now();
            localStorage.setItem('fatiao3d_auto',JSON.stringify(s)); localStorage.removeItem('fatiao3d_backup'); return JSON.stringify(s); })(%s)""" % json.dumps(dict(BASE_FLAGS, met_heroine_02=True, met_heroine_04=True)))   # 舊版 SOCIAL.meet 同時記 FIRST_MET 和 met_ 旗標
        await pg.reload(); await L.wait_loaded(pg); await pg.wait_for_timeout(1500)
        await L.tap(pg, cdp, '#btnContinue'); await pg.wait_for_timeout(6000)
        st = await pg.evaluate("""(()=>{ const G=GAME.G; const m=(G.social.mem.heroine_02||[]).map(x=>x.tag); return {day:G.day, zone:G.zone, tags:m, met:SOCIAL.has('heroine_02','FIRST_MET'), fam:SOCIAL.rel('heroine_02').fam,
            zq:SOCIAL.has('heroine_04','FIRST_MET'), fm:!!G.social.fm120, backup:localStorage.getItem('fatiao3d_backup'),
            own:localStorage.getItem('fatiao3d_backup_fm120_'+JSON.parse(localStorage.getItem('fatiao3d_backup')||'{}').savedAt), metFlag:!!G.flags.met_heroine_02, zqFlag:!!G.flags.met_heroine_04}; })()""")
        run.check('1 按「繼續」讀得進來（第 10 天、校園）', st['day'] == 10 and st['zone'] == 'campus', json.dumps({k: st[k] for k in ('day', 'zone')}))
        run.check('1 芷若的 FIRST_MET → GREETED（打過招呼），熟悉度 12 不變；遊戲當作還沒見過', st['tags'] == ['GREETED'] and not st['met'] and st['fam'] == 12, json.dumps({k: st[k] for k in ('tags', 'met', 'fam')}))
        run.check('2 改之前的原始存檔在 fatiao3d_backup（一模一樣）', st['backup'] == raw, (st['backup'] or '無')[:80])
        run.check('2 這個存檔專用的備份 fatiao3d_backup_fm120_<savedAt>（之後存到欄位也不會被蓋掉，D61 ①）也一模一樣', st['own'] == raw, (st['own'] or '無')[:80])
        run.check('1 芷若同一次記下的 met_ 旗標也拿掉（人物名單不會先出現她，D61 ②）', not st['metFlag'])
        run.check('3 子晴（吉他社事件播過）不動（FIRST_MET、met_ 旗標都在）', st['zq'] and st['fm'] and st['zqFlag'])
        await pg.evaluate("GAME.autosave()"); await pg.wait_for_timeout(500)
        await pg.reload(); await L.wait_loaded(pg); await pg.wait_for_timeout(1500)
        await L.tap(pg, cdp, '#btnContinue'); await pg.wait_for_timeout(6000)
        st2 = await pg.evaluate("(()=>{ const G=GAME.G; return {tags:(G.social.mem.heroine_02||[]).map(x=>x.tag), backup:localStorage.getItem('fatiao3d_backup')}; })()")
        run.check('4 再讀一次：不再改（還是 GREETED）、備份還是原始的那一份', st2['tags'] == ['GREETED'] and st2['backup'] == raw, json.dumps(st2['tags']))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    print('ALL PASS' if not run.fails else 'FAILED: ' + ', '.join(run.fails))


asyncio.run(main())
