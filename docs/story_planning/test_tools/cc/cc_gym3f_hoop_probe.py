"""CC-B（帳號 B）11-07：GYM3F_HOOP_41bf（BB-B 06:08；體育館 3F 主球場的籃架，LAWWW2-B e92e8c517，開發 41bfc5cbe）。
  籃架（gym_arena 正式模型的 SET_HOOPS，從屋頂吊下來；gym_layout arena.court.hoops 兩座 (0, −14.43)、(0, 10.43)）。
  平常日子（2025-10-15 三 17:00、10:00）：場邊、看台（東側看台前緣 x 22 後面、高處）各拍一張；SET_HOOPS 要看得到；
    打球的路人：場上每個路人離籃框（地上投影）最近多少 m、有沒有站在籃架正下方（記錄，籃架吊在屋頂、地上沒東西擋，穿模看圖）。
  典禮那天（開學典禮 2025-08-31，gym_layout arena.sets.ceremony.days）：同樣角度；SET_HOOPS 要收起來（看不到）。
  【前置／捷徑】讀檔到 gym_arena 出生點（條件事件關閉）；截圖停主迴圈、藏 HUD 和玩家。Windows＋GPU／SwiftShader ≠ iPhone。
用法：LW_TESTS=<wt>/tests python3 cc_gym3f_hoop_probe.py <url> <out>"""
import os, sys, json, asyncio, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = D.J
R = L.Run('gym3f_hoop', OUT); D.setup(R, OUT)
GEO = r"""(()=>{ const A=GYM_LAYOUT.arena; return {hoops:A.court.hoops, stands:A.stands, cer:A.sets&&A.sets.ceremony&&A.sets.ceremony.days}; })()"""
HOOPS = r"""(()=>{ const z=GAME.E.zone; let h=null; z.group.traverse(o=>{ if(!h&&o.name==='SET_HOOPS') h=o; }); let vis=null; if(h){ vis=true; for(let p=h;p;p=p.parent) if(p.visible===false){ vis=false; break; } }
  return {found:!!h, vis, cer:!!z.ceremonyOn}; })()"""
NPCS = r"""((hs)=>(GAME.E.npcs||[]).filter(n=>n&&n.obj&&!n.hidden).map(n=>{ const p=n.obj.position; const d=Math.min(...hs.map(h=>Math.hypot(p.x-h[0],p.z-h[1]))); return {id:n.id||n.crowdKey||'?', x:+p.x.toFixed(2), z:+p.z.toFixed(2), y:+p.y.toFixed(2), pose:n.pose||null, d:+d.toFixed(2)}; }))"""


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC GYM3F_HOOP（3F 主球場籃架）：SHA=%s（worktree 實際 %s）；Windows＋GPU／SwiftShader ≠ iPhone' % (os.environ.get('SHA', '?'), real or '?'), flush=True)
    rec = {}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, 20261107)
        await pg.goto(URL); ok = await L.wait_loaded(pg); R.check('遊戲載入', ok, '')
        if not ok: await b.close(); sys.exit(1)
        await pg.evaluate("localStorage.clear()")
        if not R.check('這一版有 gym_arena', await pg.evaluate("!!Z3.ZONES.gym_arena")): await b.close(); sys.exit(1)
        g = await pg.evaluate(GEO); hs = g['hoops']; R.note('籃架 %s；典禮 %s' % (J(hs), J(g['cer'])))
        cer_day = next((k for k, v in (g['cer'] or {}).items() if v == 'open'), None) or '2025-08-31'
        h0 = hs[0]
        CAMS = {'courtside': {'eye': [8.0, 1.7, h0[1] + 6.0], 'look': [h0[0], 3.05, h0[1]], 'lens': 24},
                'stands': {'eye': [24.0, 6.0, h0[1] + 8.0], 'look': [h0[0], 3.05, h0[1]], 'lens': 28}}
        for tn, day, h in (('normal', '2025-10-15', 17.0), ('normal_am', '2025-10-15', 10.0), ('ceremony', cer_day, 9.0)):
            tag = '[%s %s %05.2f]' % (tn, day, h)
            R.setup('%s 讀檔 gym_arena 出生點' % tag)
            s = await D.load_zone(pg, cdp, 'gym_arena', day, h, wait=9000)
            if not R.check('%s 讀到 gym_arena' % tag, s['zone'] == 'gym_arena', J(s)): continue
            await pg.wait_for_timeout(3000)
            hp = await pg.evaluate(HOOPS); ns = await pg.evaluate(NPCS, hs)
            under = [n for n in ns if n['d'] < 1.2]
            R.note('%s SET_HOOPS %s；場上路人 %d 位，離籃框最近 %s m；籃框 1.2 m 內：%s' % (tag, J(hp), len(ns), min([n['d'] for n in ns] or [None]) if ns else None, J(under)))
            if tn.startswith('normal'): R.check('%s 平常日子：籃架放下來看得到（SET_HOOPS 存在、visible）' % tag, hp['found'] and hp['vis'] and not hp['cer'], J(hp))
            else: R.check('%s 典禮那天：籃架收起來（SET_HOOPS 看不到）' % tag, hp['cer'] and hp['vis'] is False, J(hp))
            rec[tn] = {'hoops': hp, 'npcs': ns, 'shots': {}}
            for nm, c in CAMS.items():
                rec[tn]['shots'][nm] = await D.user_shot(pg, cdp, 'hoop_%s_%s' % (tn, nm), c)
        with open(os.path.join(OUT, 'gym3f_hoop.json'), 'w', encoding='utf-8') as f:
            json.dump(rec, f, ensure_ascii=False, indent=1)
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
