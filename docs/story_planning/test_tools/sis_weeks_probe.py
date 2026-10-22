"""BB（帳號 A）2026-10-22：學姊每一週在哪裡（AA 01:23「你測試時記到的學姊沒出現的週，也請傳給我」）。
不是走路測試：讀一次使用者存檔，在頁面裡用遊戲自己的 STORY.schedEnt（和 INV 排約用的同一個，noInvite）逐日逐小時（08～23 點）問她在哪裡，
照學期週次彙總：每週在台大附近（總圖閱覽室、法圖、Café、校園、118 巷、萬才館……）的小時數；0 小時＝那一週玩家在學校遇不到她。
2025-09 到 2029-06，法律系、沒有交往、沒有約（她自己的作息）。另外記寒暑假。
用法：LW_TESTS=<開發分支>/tests python3 sis_weeks_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>"""
import os, sys, json, asyncio
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
SWEEP = """(()=>{ const c=CHARACTERS.heroine_05, G=GAME.G; const d0=STORY.dayOfKey('2025-09-01'), d1=STORY.dayOfKey('2029-06-30'); const out={};
  for(let d=d0; d<=d1; d++){ const x=CALENDAR.dateOf(d), T=CALENDAR.termOf(d); const key=T?T.id+' 第'+T.week+'週':'假期 '+x.key.slice(0,7);
    const r=out[key]||(out[key]={from:x.key,to:x.key,hours:0,zones:{},away:{}}); r.to=x.key;
    for(let h=8; h<24; h++){ const fg={day:d,hour:h,weekday:x.wd%7,flags:G.flags||{},noInvite:true,stage:'law'}; let pr=null; try{ pr=STORY.presence?STORY.presence('heroine_05',fg):null; }catch(err){}
      if(pr&&pr.here===false&&pr.kind!=='taipei'){ const k='不在：'+(pr.kind||pr.where||'?'); r.away[k]=(r.away[k]||0)+1; continue; }   /* 美國那半年等（characters.js presence）*/
      let e=null; try{ e=STORY.schedEnt(c,fg); }catch(err){ e={zone:'ERR'}; }
      if(e&&e.zone){ r.hours++; r.zones[e.zone]=(r.zones[e.zone]||0)+1; } else if(e&&e.away){ r.away[e.away]=(r.away[e.away]||0)+1; } } }
  return out; })()"""
async def main():
    os.makedirs(OUT, exist_ok=True); base = json.load(open(SAVE, encoding='utf-8')); run = L.Run('sis_weeks', OUT)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        st = json.loads(json.dumps(base)); G = st.get('G', st)
        await L.load_state(pg, G, quiet_events=True); await pg.wait_for_timeout(4000)
        run.setup('[前置] 讀使用者存檔（舊局）；只在頁面裡呼叫 STORY.schedEnt（noInvite）逐時查學姊的作息，不走路、不改存檔')
        r = await pg.evaluate(SWEEP)
        json.dump(r, open(os.path.join(OUT, 'sis_weeks.json'), 'w'), ensure_ascii=False, indent=1)
        zero = [(k, v['from'], v['to'], v['away']) for k, v in r.items() if v['hours'] == 0]
        low = [(k, v['from'], v['to'], v['hours'], v['zones']) for k, v in r.items() if 0 < v['hours'] <= 6]
        print('學期週＋假期共 %d 段；0 小時 %d 段；1～6 小時 %d 段' % (len(r), len(zero), len(low)), flush=True)
        for z in zero: print('  0 小時', z[0], z[1], '～', z[2], json.dumps(z[3], ensure_ascii=False), flush=True)
        for z in low: print('  少', z[0], z[1], '～', z[2], z[3], 'h', json.dumps(z[4], ensure_ascii=False), flush=True)
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    run.finish()
asyncio.run(main())
