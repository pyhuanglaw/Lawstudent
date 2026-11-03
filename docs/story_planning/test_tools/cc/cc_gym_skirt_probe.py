"""CC（帳號 A）11-03：BUG-GYM-SKIRT-1103（BB 17:20，P2）：穿裙子的路人在健身中心墊子上拉筋（gym_stretch），裙子後片穿到地板下 0.45～0.47 m。
  雲端 ffeec06e0 第一次看到（cc_gym_shot_probe motion：Clothes_NF14_1／NF10_1 的一個頂點掛在 J_Bip_C_Hips）。
  路人穿什麼是每次進場挑的（crowd3d.js daySlots），所以照下面的時段一個一個讀檔，直到找到 SKIRT_N 個「穿裙子在拉筋」的人（或時段用完）。
  【前置／捷徑】每個時段都直接讀檔進 gym_b1（條件事件關閉）——只為了看路人的網格，不是玩家流程。
  每一位在拉筋的人：在一個動作循環（6.5 秒）裡取樣，量看得見的 SkinnedMesh 最低的頂點（含蒙皮），記下是哪一個網格、哪一根骨頭。
  檢查：
    前置：至少找到 1 位穿裙子（網格名稱符合 SKIRT_RE，預設 NF10／NF14／NF17／NF19／skirt）在拉筋的人（找不到＝這次路人沒抽到，FAIL 並列出看到的衣服，不是 PASS）
    ① 每一位在拉筋的人（不論衣服）最低點離地 ≥ −0.05 m（不穿進地板）
    ② 穿裙子的那幾位最低點離地 ≥ −0.05 m（修正前約 −0.45 m）
  截圖：每一位穿裙子在拉筋的人，鏡頭從側上方。
用法：LW_TESTS=<wt>/tests SHA=<sha> [SKIRT_N=2] [SKIRT_RE=...] python3 cc_gym_skirt_probe.py <url> <out>
exit 0＝ALL PASS；1＝有 FAIL。Playwright 手機模擬，不是 iPhone 實機。"""
import os, re, sys, json, asyncio
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
SHA = os.environ.get('SHA', '?')
SKIRT_N = int(os.environ.get('SKIRT_N', '2'))
SKIRT_RE = re.compile(os.environ.get('SKIRT_RE', r'NF1[0479]|[Ss]kirt'))   # 雲端 ffee：NF10 −0.498、NF17 −0.329、NF19 −0.485、NF14（第一次）都掛在 J_Bip_C_Hips
J = lambda o: json.dumps(o, ensure_ascii=False)
FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True}
# (第幾天, 週幾, 幾點)：第 1 天＝2025-09-17（三）；傍晚、週末人多（crowd3d.js daySlots）
SLOTS = [(7, 2, 18.83), (11, 6, 19.0), (7, 2, 18.5), (14, 2, 19.5), (21, 2, 18.0), (25, 6, 19.0), (12, 0, 15.0), (18, 6, 16.0), (8, 3, 17.0), (15, 3, 20.5),
         (28, 2, 18.5), (32, 6, 19.0), (35, 2, 19.0), (39, 6, 16.0), (42, 2, 18.0), (46, 6, 19.0), (49, 2, 18.5), (53, 6, 15.0)]
FAILS = []


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)
    return ok


STRETCH = """(()=>(GAME.E.npcs||[]).filter(n=>n.crowd&&String(n.crowd).startsWith('gym_b1')&&n.pose==='gym_stretch').map(n=>{ const meshes=[];
  n.obj.traverse(c=>{ if(c.isSkinnedMesh&&c.visible) meshes.push(c.name||'?'); }); const p=n.obj.position; return {key:n.crowdKey||'', x:+p.x.toFixed(2), z:+p.z.toFixed(2), meshes}; }))()"""
LOWEST = """(async key=>{ const E=GAME.E, n=(E.npcs||[]).find(q=>q.crowdKey===key); if(!n) return {err:'找不到 '+key}; const o=n.obj, v=new THREE.Vector3();
  const g=E.heightAt?E.heightAt(o.position.x,o.position.z,n.lv|0):0; let best=1e9, who=null;
  for(let s=0;s<14;s++){ o.updateMatrixWorld(true); o.traverse(c=>{ if(!c.isSkinnedMesh||!c.visible||!c.geometry||!c.geometry.attributes.position) return; let vis=true; for(let q=c;q;q=q.parent) if(q.visible===false) vis=false; if(!vis) return;
      if(c.skeleton) c.skeleton.update(); const N=c.geometry.attributes.position.count, si=c.geometry.attributes.skinIndex; for(let i=0;i<N;i++){ c.getVertexPosition(i,v); c.localToWorld(v);
        if(v.y<best){ best=v.y; const b=si&&c.skeleton?c.skeleton.bones[si.getComponent(i,0)]:null; who={mesh:c.name||'?', bone:b?b.name:null, at:[+v.x.toFixed(2),+v.z.toFixed(2)]}; } } });
    await new Promise(r=>setTimeout(r,500)); }
  return {low:+(best-g).toFixed(3), ground:+(+g).toFixed(3), who, pose:n.pose}; })(%s)"""


async def main():
    os.makedirs(OUT, exist_ok=True); rec = []; skirts = []
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); check('遊戲載入', await L.wait_loaded(pg))
        await pg.evaluate("localStorage.clear(); STORY.phoneAuto=()=>{}")
        for (day, wd, hour) in SLOTS:
            print('  [前置／捷徑] 讀檔進 gym_b1 第 %d 天（週%d）%.2f 時（條件事件關閉）' % (day, wd, hour), flush=True)
            await L.load_state(pg, {'zone': 'gym_b1', 'hour': hour, 'day': day, 'weekday': wd, 'weather': 'clear', 'pos': {'x': -19.59, 'z': 5.86, 'yaw': 0}, 'flags': FLAGS}, quiet_events=True, quiet_phone=True)
            await pg.wait_for_timeout(8000)
            for s in await pg.evaluate(STRETCH):
                m = await pg.evaluate(LOWEST % J(s['key']))
                skirt = any(SKIRT_RE.search(x) for x in s['meshes'])
                r = dict(s, slot=[day, wd, hour], skirt=skirt, **m); rec.append(r)
                print('  拉筋：%s 第 %d 天 %.2f 時 (%s,%s) 裙子=%s 最低 %s m（%s）衣服 %s' % (s['key'], day, hour, s['x'], s['z'], skirt, m.get('low'), J(m.get('who')), J(s['meshes'])), flush=True)
                if skirt:
                    await pg.evaluate("(([x,z])=>{ const c=GAME.E.cam; if(c&&c.dist!=null) c.dist=Math.max(2.2,c.dist*0.6); })(%s)" % J([s['x'], s['z']]))
                    await pg.wait_for_timeout(1200); await pg.screenshot(path=os.path.join(OUT, 'skirt_%d_%s.png' % (len(skirts), s['key'].replace('|', '_'))))
                    skirts.append(r)
            if len(skirts) >= SKIRT_N: break
        with open(os.path.join(OUT, 'stretchers.json'), 'w', encoding='utf-8') as f: json.dump(rec, f, ensure_ascii=False, indent=1)
        check('前置：找到穿裙子在拉筋的人（%s）' % SKIRT_RE.pattern, bool(skirts), '看到 %d 位在拉筋，衣服：%s' % (len(rec), J(sorted({x for r in rec for x in r['meshes']}))))
        bad = [r for r in rec if r.get('low') is None or r['low'] < -0.05]
        check('① 每一位在拉筋的人最低點離地 ≥ −0.05 m（不穿進地板）', bool(rec) and not bad, J([{k: r.get(k) for k in ('key', 'skirt', 'low', 'who')} for r in bad[:4]]))
        bads = [r for r in skirts if r.get('low') is None or r['low'] < -0.05]
        check('② 穿裙子在拉筋的人最低點離地 ≥ −0.05 m（修正前約 −0.45 m）', bool(skirts) and not bads, J([{k: r.get(k) for k in ('key', 'low', 'who')} for r in (bads or skirts)[:4]]))
        check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), ', '.join(FAILS[:6])), flush=True)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
