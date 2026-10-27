"""開門：全部區域的出入口總表（label／to／exit.door／目前 DOOR.kind／找不找得到門板）。[捷徑] GAME.enter 直接進各區域。用法：python3 survey_all.py 工作樹 URL 輸出"""
import asyncio, json, sys
sys.path.insert(0, sys.argv[1] + '/tests')
import playlib as L
from playwright.async_api import async_playwright
URL, OUT = sys.argv[2], sys.argv[3]
JS = """(z=>{ const E=GAME.E, out=[]; for(const it of E.interactables){ if(!it.exit) continue; let lb=''; try{ lb=String(it.label); }catch(e){ lb='ERR'; }
  let k=null; try{ k=DOOR.kind(it,z); }catch(e){ k='ERR'; } let leaf=null; try{ const L=DOOR.findLeaf(E,it); leaf=L?L.o.name:null; }catch(e){}
  out.push({label:lb, to:it.exit.to, door:it.exit.door||null, locked:!!it.exit.locked, kind:k, leaf, x:+(+it.x).toFixed(1), z:+(+it.z).toFixed(1)}); } return out; })"""
async def main():
    res = {}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear(); STORY.phoneAuto=()=>{}")
        day = await pg.evaluate("STORY.dayOfKey('2025-10-15')")
        await L.load_state(pg, {'zone': 'dorm', 'hour': 11.0, 'day': day, 'weather': 'sunny', 'flags': {'introDone': True}, 'pos': None}, quiet_events=True)
        await pg.wait_for_timeout(6000)
        zones = await pg.evaluate("Object.keys(Z3.ZONES)")
        print('zones', len(zones), flush=True)
        for z in zones:
            try:
                ok = await pg.evaluate("(async z=>{ try{ await GAME.enter(z); return true; }catch(e){ return String(e); } })(%s)" % json.dumps(z))
                await pg.wait_for_timeout(1500)
                r = await pg.evaluate(JS + "(%s)" % json.dumps(z)) if ok is True else {'err': ok}
                res[z] = r; print(z, json.dumps(r, ensure_ascii=False)[:600], flush=True)
            except Exception as e:
                res[z] = {'err': str(e)[:200]}; print(z, 'ERR', str(e)[:200], flush=True)
            json.dump(res, open(OUT + '/survey_all.json', 'w'), ensure_ascii=False, indent=1)
        print('errs', errs[:5]); await b.close()
asyncio.run(main())
