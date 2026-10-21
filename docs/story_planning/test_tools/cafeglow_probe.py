"""BB（帳號 A）2026-10-21：BUG-CAFE-KIT-GLOW-1021（LAWWW2 75d40a9e → 開發分支 80af0168）——溫州街兩點半 Café 正式外觀上不再疊著套件的 7 個光暈。
【前置】讀使用者 9/25 存檔，改到溫州街 13:00（白天）、17:50（傍晚）、20:30（晚上）。之後照玩家：走到 Café 門口，預設鏡頭、把鏡頭轉到背對 Café 的一側各拍一張；
另外一張劇情鏡頭從對街拍整個正面（只動鏡頭）。量：Café 套件建築底下的光暈（Sprite）有幾個看得到、亮度多少；正式外觀有沒有接上。
修正前的版本（54ae1009）用同一支跑一次比對：URL 換成修正前的伺服器。只加記錄，不改遊戲。Playwright 手機橫向模擬、?turbo，不是 iPhone。
用法：LW_TESTS=<開發分支>/tests python3 cafeglow_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json> [標籤]"""
import os, sys, json, asyncio, math
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
TAG = sys.argv[4] if len(sys.argv) > 4 else 'now'
def say(*a): print(' '.join(str(x) for x in a), flush=True)

CAFE = """(()=>{ const z=GAME.E.zone; if(!z||!z.group) return null; const cafe=z.group.children.find(o=>{ const f=o.userData&&o.userData.footprint; return f&&f.w===14&&f.d===13&&Math.abs(o.position.x-55.4)<0.05; }); if(!cafe) return null;
  const eff=o=>{ for(let p=o;p;p=p.parent) if(!p.visible) return false; return true; };
  const sp=cafe.children.filter(o=>o.isSprite), vis=sp.filter(o=>eff(o)&&(o.material?o.material.opacity:1)>0.02);
  const kitMesh=cafe.children.filter(o=>o.isMesh&&eff(o)&&!o.userData.formalGlow).length;
  const c=new THREE.Box3().setFromObject(cafe).getCenter(new THREE.Vector3());
  return {formal:!!cafe.userData.formal, sprites:sp.length, visible:vis.length, vis:vis.map(o=>({p:o.getWorldPosition(new THREE.Vector3()).toArray().map(v=>+v.toFixed(1)), op:+(o.material?o.material.opacity:1).toFixed(2), dayO:o.userData.dayO, nightO:o.userData.nightO})),
    kitMeshVisible:kitMesh, pos:[+cafe.position.x.toFixed(2),+cafe.position.z.toFixed(2)], rotY:+cafe.rotation.y.toFixed(3), c:c.toArray().map(v=>+v.toFixed(2)), h:+(+GAME.G.hour).toFixed(2)}; })()"""


async def one(p, base, h, run):
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True); res = {'h': h}
    try:
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        st = json.loads(json.dumps(base)); G = st.get('G', st); G.update({'hour': h, 'zone': 'wenzhou', 'pos': None})
        await L.load_state(pg, G, quiet_events=True); await pg.wait_for_timeout(9000)   # 正式外觀（GLB）載完
        run.setup('[前置] %s：使用者 9/25 存檔改到溫州街 %.2f（quiet_events：不演劇情、手機不自己打開）' % (TAG, h))
        c = await pg.evaluate(CAFE); res['before'] = c; say('   %.2f Café：%s' % (h, json.dumps(c, ensure_ascii=False)))
        door = await pg.evaluate("(()=>{ const it=(GAME.E.interactables||[]).filter(i=>!i.hidden&&/Café|兩點半|咖啡/.test(i.label||'')); return it.map(i=>[i.x,i.z,i.label]); })()")
        say('   門：%s' % door)
        if door and c:
            await L.go_to(pg, cdp, run, door[0][0], door[0][1], 1.6, door[0][2], max_s=240)
            pp = await pg.evaluate("(()=>{ const o=GAME.E.player.obj.position; return [o.x,o.z]; })()")
            yaw = math.atan2(pp[0] - c['c'][0], pp[1] - c['c'][2])   # 鏡頭在玩家的 (sin yaw, cos yaw) 那一側＝背對 Café
            for tag, d in (('default', None), ('far', 7.0)):
                await pg.evaluate("(([y,d])=>{ const C=GAME.E.cam; C.yaw=y; if(d) C.distTarget=d; C.manualT=60; })(%s)" % json.dumps([yaw, d]))
                await pg.wait_for_timeout(3000); await run.shot(pg, '%s_%02d%02d_%s' % (TAG, int(h), int(round((h % 1) * 60)), tag))
            # 對街：從 Café 中心往玩家方向 13 m、高 2.6 m，看 Café 正面 3 m 高
            n = math.hypot(pp[0] - c['c'][0], pp[1] - c['c'][2]) or 1; dx, dz = (pp[0] - c['c'][0]) / n, (pp[1] - c['c'][2]) / n
            pos = [c['c'][0] + dx * 13, 2.6, c['c'][2] + dz * 13]; look = [c['c'][0], 3.0, c['c'][2]]
            await pg.evaluate("(([p,l])=>{ GAME.E.cinematic(new THREE.Vector3(...p), new THREE.Vector3(...l)); GAME.E.snapCinematic(); })(%s)" % json.dumps([pos, look]))
            await pg.wait_for_timeout(3000); await run.shot(pg, '%s_%02d%02d_front' % (TAG, int(h), int(round((h % 1) * 60))))
            await pg.evaluate("GAME.E.endCinematic()")
        c2 = await pg.evaluate(CAFE); res['after'] = c2; say('   拍完：%s' % json.dumps(c2, ensure_ascii=False))
    except Exception as e: res['err'] = str(e)[:200]; say('   ! 例外', e)
    res['errs'] = errs[:3]
    try: await asyncio.wait_for(b.close(), 30)
    except Exception: pass
    return res


async def main():
    run = L.Run('cafeglow_' + TAG, OUT); base = json.load(open(SAVE, encoding='utf-8')); out = []
    async with async_playwright() as p:
        for h in (13.0, 17.83, 20.5):
            say('== %s %.2f' % (TAG, h)); r = await one(p, base, h, run); out.append(r)
            c = r.get('after') or r.get('before') or {}
            run.check('%s %.2f：Café 正式外觀接上，套件光暈看得到 0 個' % (TAG, h), bool(c) and c.get('formal') and c.get('visible') == 0 and not r.get('errs'), json.dumps({k: c.get(k) for k in ('formal', 'sprites', 'visible', 'vis', 'kitMeshVisible')}, ensure_ascii=False)[:300])
            json.dump(out, open(os.path.join(OUT, 'cafeglow_%s.json' % TAG), 'w'), ensure_ascii=False, indent=1)
    run.finish()
asyncio.run(main())
