"""CC-C 11-13：L118_CLOSED_LOOK（LAWWW-C 03:25；BB 照 §12 第 1 點判：打烊看得出來關了）。只拍、只記，判定歸 BB。
118 巷每一間有名字的店（LANE118_LAYOUT.shops 有 name 的，九間＋兩間飲料）：
  ① 公休日白天：從 2025-10-20 起往後 14 天找第一個 PLACES.isOpen(店, 14 點) 是 false 的日子（颱風天不算）
  ② 營業日打烊：2025-10-22 從 21:30 起每 15 分鐘找第一個 isOpen 是 false 的時間（找不到就 23:30）
  每一個時段【前置／捷徑】讀檔到 118 巷那間店門口（PLACES.l118Door），拍兩張：
    街景角度（門的朝外方向退 5 m、高 1.7 m、看門上 2.5 m；兩個時段同一個鏡頭）、門口近照（退 2 m、高 1.6 m、看門）；
  另記 zone.shopReal 這間的 on／built／shutter、場景裡亮著的燈數。
CC_02 清單 2026-11-13：1✓（公休日、打烊時間都照 PLACES.isOpen 找，不寫死） 2✓（店的清單從 LANE118_LAYOUT 讀、門從 PLACES.l118Door 讀） 3✓（每一間都拍，不挑） 4n/a（不點按鈕） 5n/a（讀檔到門口，不走路：只看外觀） 6✓（讀檔後等 4 秒、截圖前 render） 7✓（lint、node 驗 JS） 8n/a（不判數字） 9✓（藏玩家和 HUD） 10n/a（條件事件關掉、只看店面） 11✓（SHA 40 碼、ENV 沒有「|」） 12✓（FAIL_SETUP 檢查：店的清單不是空的、每間都找得到門和關店的時段） 13n/a（不走路）
用法：LW_TESTS=<wt>/tests SHA=<sha> [FROM=2025-10-20 NIGHT_DAY=2025-10-22] python3 cc_l118_closed_probe.py <url> <out>"""
import os, sys, json, asyncio
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SHA = os.environ.get('SHA') or ''
FROM = os.environ.get('FROM') or '2025-10-20'; NIGHT_DAY = os.environ.get('NIGHT_DAY') or '2025-10-22'
J = lambda o: json.dumps(o, ensure_ascii=False)
R = L.Run('l118_closed', OUT); D.setup(R, OUT)

PLAN = r"""((a)=>{ const Lay=typeof LANE118_LAYOUT!=='undefined'?LANE118_LAYOUT:null; if(!Lay) return {err:'沒有 LANE118_LAYOUT'};
  const d0=STORY.dayOfKey(a.from), dn=STORY.dayOfKey(a.night), out=[];
  const tz=(z,d)=>{ try{ return !!(PLACES.typhoonClosed&&PLACES.typhoonClosed(z,d)); }catch(e){ return false; } };
  for(const q of Lay.shops.filter(q=>q.name)){ const z=q.zone||('l118_'+q.id); let door=null; try{ door=PLACES.l118Door(q.id); }catch(e){}
    const open=(h,d)=>{ try{ return !!PLACES.isOpen(z,h,d); }catch(e){ return null; } };
    let off=null; for(let d=d0; d<d0+14; d++){ if(open(14,d)===false&&!tz(z,d)){ off=CALENDAR.dateOf(d).key; break; } }
    let shut=null; for(let h=21.5; h<=23.51; h+=0.25){ if(open(h,dn)===false){ shut=+h.toFixed(2); break; } }
    out.push({id:q.id, z, name:q.name, side:q.side||null, door:door?{x:door.x, z:door.z}:null, off, shut:shut??23.5, open14:open(14,dn), text:(PLACES.text&&PLACES.text(z))||null}); }
  return {shops:out, facade:Lay.facade||null}; })"""
SHOPINFO = r"""((z)=>{ const E=GAME.E, S=E.zone&&E.zone.shopReal, s=S&&(S.shops||[]).find(q=>q.place===z||q.id===z); let lit=0; E.scene.traverse(o=>{ if(o.isLight&&o.visible&&o.intensity>0) lit++; });
  return {shopReal:s?{on:!!s.on, built:!!s.built, shutter:s.shutter?s.shutter.visible:null}:null, lights:lit, hour:+(+GAME.G.hour).toFixed(2)}; })"""


async def shoot(pg, cdp, sh, tag):
    dx = 1 if (sh['side'] or 'W') == 'W' else -1   # 西側的店門朝東（往巷子），東側的朝西
    x, z = sh['door']['x'], sh['door']['z']
    await D.load_zone(pg, cdp, 'lane118', sh['_day'], sh['_h'], x=x + dx * 1.5, z=z, yaw=0.0, wait=8000)
    R.setup('%s【前置／捷徑】讀檔到 118 巷 %s 門口 %s %.2f（條件事件關掉）' % (sh['name'], sh['z'], sh['_day'], sh['_h']))
    await pg.wait_for_timeout(4000)
    info = await pg.evaluate(SHOPINFO, sh['z'])
    await D.user_shot(pg, cdp, '%s_%s_street' % (sh['id'], tag), {'eye': [x + dx * 5, 1.7, z], 'look': [x, 2.5, z], 'lens': 24})
    await D.user_shot(pg, cdp, '%s_%s_door' % (sh['id'], tag), {'eye': [x + dx * 2, 1.6, z], 'look': [x, 1.5, z], 'lens': 24})
    R.note('%s %s（%s %.2f）：%s' % (sh['name'], tag, sh['_day'], sh['_h'], J(info)))
    return info


async def main():
    print('CC L118_CLOSED_LOOK：SHA %s；Playwright ≠ iPhone' % (SHA or '?'), flush=True)
    res = {'sha': SHA, 'shops': []}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg, 600), ''): await b.close(); sys.exit(1)
        await D.load_zone(pg, cdp, 'lane118', NIGHT_DAY, 14.0, wait=6000)
        plan = await pg.evaluate(PLAN, {'from': FROM, 'night': NIGHT_DAY})
        R.note('店的清單、公休日、打烊時間：%s' % J(plan))
        shops = plan.get('shops') or []
        if not R.check('FAIL_SETUP 檢查：118 巷有店（LANE118_LAYOUT 有 name 的）', bool(shops), J(plan)): await b.close(); sys.exit(1)
        for sh in shops:
            row = {'id': sh['id'], 'z': sh['z'], 'name': sh['name'], 'off': sh['off'], 'shut': sh['shut'], 'text': sh['text']}
            if not R.check('FAIL_SETUP 檢查：%s 找得到門（PLACES.l118Door）' % sh['name'], bool(sh['door']), J(sh)): res['shops'].append(row); continue
            try:
                if sh['off']:
                    sh['_day'], sh['_h'] = sh['off'], 14.0; row['off_info'] = await shoot(pg, cdp, sh, 'off')
                else: R.note('%s %s 起 14 天都沒有公休（%s）：公休那一組不拍' % (sh['name'], FROM, sh['text']))
                sh['_day'], sh['_h'] = NIGHT_DAY, sh['shut']; row['shut_info'] = await shoot(pg, cdp, sh, 'shut')
                sh['_day'], sh['_h'] = NIGHT_DAY, 14.0; row['open_info'] = await shoot(pg, cdp, sh, 'open')   # 對照：同一天 14:00 營業中
            except Exception as e:
                R.check('%s 沒有中斷' % sh['name'], False, repr(e)[:300])
            res['shops'].append(row)
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    open(os.path.join(OUT, 'l118_closed.json'), 'w', encoding='utf-8').write(J(res))
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
