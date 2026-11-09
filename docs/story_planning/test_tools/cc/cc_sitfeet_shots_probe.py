"""CC-B（帳號 B）11-09：坐著的人的腳（BB-B 17:38；PERF-XS-NPC-1108 (A)，LAWWW-B abfa888cf：坐姿算腳只更新兩條腿的矩陣，CHAR.sitFeetFast=false＝舊算法）。判定＝BB。
每個場景：【前置／捷徑】讀檔（load_zone，條件事件、手機關）到 SCENES 的區域、日期、時間 → 等 8 秒 → 挑離玩家最近、坐著（pose sit/read）的人
→ 鏡頭近景（從他正面斜 35°、離 1.5 m、高 0.75 m，看他的膝蓋到腳）→ CHAR.sitFeetFast=true（新）等 1.5 秒：量腳＋拍；=false（舊）等 1.5 秒：量腳＋拍；同一個角度並排。
量：VRM raw 骨架 leftFoot／rightFoot／leftToes／rightToes 的世界高度 − 這個人的 obj.position.y（他所在的地板高度），負＝穿進地板，> 0.08 m＝浮起來；
膝蓋方向：大腿到小腿的彎曲方向和他面向的夾角（> 90°＝膝蓋往後彎）。
SCENES 例：cafe:2025-09-16:14,classroom:2025-09-16:10.2,xs_shanlan:2025-10-18:14:2   （最後一欄 2＝放到 2F）
用法：LW_TESTS=<wt>/tests [SCENES=...] python3 cc_sitfeet_shots_probe.py <url> <out>"""
import os, sys, json, asyncio, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests')); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SCENES = [x.split(':') for x in (os.environ.get('SCENES') or 'cafe:2025-09-16:14,classroom:2025-09-16:10.2,xs_shanlan:2025-10-18:14:2').split(',') if x]
R = L.Run('sitfeet_shots', OUT); D.setup(R, OUT)
PICK = """(()=>{ const E=GAME.E, P=E.player.obj.position; const L=(E.npcs||[]).filter(n=>/sit|read/.test(n.pose||'')&&n.obj.visible!==false&&n.obj.userData&&n.obj.userData.vrm);
  L.sort((a,b)=>Math.hypot(a.obj.position.x-P.x,a.obj.position.z-P.z)-Math.hypot(b.obj.position.x-P.x,b.obj.position.z-P.z));
  const n=L[0]; if(!n) return {n:0}; const o=n.obj; return {n:L.length, id:n.id||n.charId||n.name||'?', pose:n.pose, x:+o.position.x.toFixed(3), y:+o.position.y.toFixed(3), z:+o.position.z.toFixed(3), ry:+o.rotation.y.toFixed(3), lv:n.lv|0, idx:E.npcs.indexOf(n)}; })()"""
FEET = """(i=>{ const E=GAME.E, n=E.npcs[i], o=n.obj, hu=o.userData.vrm.humanoid, V=THREE.Vector3; o.updateWorldMatrix(true,true);
  const g=k=>{ const b=hu.getRawBoneNode(k); if(!b) return null; const v=new V(); b.getWorldPosition(v); return v; };
  const r={}; for(const k of ['leftFoot','rightFoot','leftToes','rightToes']){ const v=g(k); r[k]=v?+(v.y-o.position.y).toFixed(3):null; }
  const fw=new V(Math.sin(o.rotation.y),0,Math.cos(o.rotation.y));
  for(const s of ['left','right']){ const u=g(s+'UpperLeg'), l=g(s+'LowerLeg'), f=g(s+'Foot'); if(u&&l&&f){ const k=l.clone().sub(u.clone().add(f).multiplyScalar(0.5)); k.y=0; r[s+'KneeVsFacing']=k.length()<1e-4?null:Math.round(Math.acos(Math.max(-1,Math.min(1,k.normalize().dot(fw))))*180/Math.PI); } }
  return r; })"""
async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC 坐著的人的腳：worktree %s；Playwright ≠ iPhone' % (real or '?'), flush=True)
    res = []
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
        R.note('CHAR.sitFeetFast 預設：%s' % await pg.evaluate("typeof CHAR.sitFeetFast==='undefined'?'沒有這個 patch':CHAR.sitFeetFast"))
        for sc in SCENES:
            zone, day, h = sc[0], sc[1], float(sc[2]); fl2 = len(sc) > 3 and sc[3] == '2'; tag = '[%s %s %s%s]' % (zone, day, h, ' 2F' if fl2 else '')
            try:
                R.setup('%s 【前置／捷徑】讀檔到 %s %s %s（條件事件、手機關）' % (tag, zone, day, h))
                await D.load_zone(pg, cdp, zone, day, h, wait=9000)
                if fl2:
                    p2 = await pg.evaluate("(()=>{ const q=GAME.E.interactables.find(i=>i.seat&&((i.seat.lv|0)>=1||(i.lv|0)>=1)); return q?{x:q.x,z:q.z}:null; })()")
                    if p2: await D.load_zone(pg, cdp, zone, day, h, x=p2['x'], z=p2['z'] + 0.6, yaw=0.0, lv=1, wait=9000)
                await pg.wait_for_timeout(8000)
                pk = await pg.evaluate(PICK); R.note('%s 坐著的人：%s' % (tag, json.dumps(pk, ensure_ascii=False)))
                if not R.check('%s 有坐著的人' % tag, pk.get('n', 0) > 0, ''): res.append({'scene': sc, 'skip': '沒有坐著的人'}); continue
                x, z, y0 = pk['x'], pk['z'], pk['y']
                cams = {}
                for ang in [float(q) for q in (os.environ.get('ANGLES') or '35,90,-90').split(',')]:   # 11-09 雲端試跑：正面斜看會被桌子擋（教室的桌板、Café 桌腳）→ 另外從兩側各拍
                    a = pk['ry'] + math.radians(ang)
                    cams[int(ang)] = {'eye': [round(x + 1.7 * math.sin(a), 3), round(y0 + 0.5, 3), round(z + 1.7 * math.cos(a), 3)], 'look': [x, round(y0 + 0.2, 3), z], 'lens': 18}
                rec = {'scene': sc, 'npc': pk, 'cams': cams}
                for fast in (True, False):
                    await pg.evaluate("v=>{ CHAR.sitFeetFast=v; }", fast); await pg.wait_for_timeout(1500)
                    ft = await pg.evaluate(FEET, pk['idx']); k = 'new' if fast else 'old'; rec[k] = ft
                    R.note('%s sitFeetFast=%s（%s）腳離地板（m）＋膝蓋和面向的夾角（度）：%s' % (tag, fast, '新' if fast else '舊', json.dumps(ft)))
                    for ang, cam in cams.items(): await D.user_shot(pg, cdp, 'feet_%s_%s_%s' % (zone, ang, k), cam, hide_player=True)
                await pg.evaluate("()=>{ CHAR.sitFeetFast=true; }")
                for k in ('new', 'old'):
                    f = rec[k]; vals = [f[q] for q in ('leftToes', 'rightToes', 'leftFoot', 'rightFoot') if f.get(q) is not None]
                    R.check('%s %s：腳沒有穿進地板（腳、腳尖 ≥ -0.02 m）' % (tag, k), bool(vals) and min(vals) >= -0.02, json.dumps(f))
                    R.check('%s %s：膝蓋沒有往後彎（夾角 ≤ 90°）' % (tag, k), all((f.get(s + 'KneeVsFacing') or 0) <= 90 for s in ('left', 'right')), json.dumps(f))
                d = {q: round((rec['new'][q] or 0) - (rec['old'][q] or 0), 3) for q in ('leftFoot', 'rightFoot', 'leftToes', 'rightToes')}
                rec['diff'] = d; R.note('%s 新－舊（m）：%s' % (tag, json.dumps(d)))
                res.append(rec)
            except Exception as ex:
                R.check('%s 沒有例外' % tag, False, repr(ex)[:300]); res.append({'scene': sc, 'err': repr(ex)[:300]})
        R.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    json.dump(res, open(os.path.join(OUT, 'sitfeet.json'), 'w'), ensure_ascii=False, indent=1)
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
