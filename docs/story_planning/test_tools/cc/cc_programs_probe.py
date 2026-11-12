"""CC-C 11-12：開跑那一下多編了哪幾支 shader（DN_PROGRAMS；LAWWW-C 11:45：BB 1d60cca3a5 東南大聯開跑 programs 56→59，要名單加進預熱）。結果給 BB、LAWWW-C。Playwright（PC GPU）≠ iPhone。
每個區域（ZONES，預設 tz_dongnan 東南大聯店內、xinsheng 新生南路街上、gongguan 公館街上）：
  【前置／捷徑】讀檔進去（區域出生點，條件事件關掉）→ 站 3 秒 → 記 renderer.info.programs 每一支（id、name、cacheKey 前 200 字、usedTimes）→
  開始記：每一幀時間、E.addNPC（誰：name／charId／spec 摘要、哪個函式叫的：stack 前 5 行）→ 按「跑」（#btnRun）＋搖桿往前推 2 秒 → 再記一次 programs →
  多出來的那幾支：當下 scene 裡用它的 mesh（名字、父節點、材質 type／name、skinning、morphTargets、receiveShadow／castShadow、defines）；
  >50 ms 的幀：那一幀前 30 ms 內新生的人（addNPC）。
CC_02 清單 2026-11-12：1✓（平日 14:00） 2✓（programs、mesh 全從 renderer 讀：renderer.properties.get(材質).currentProgram） 3✓（每個區域重新讀檔） 4✓（按跑照按鈕 #btnRun） 5✓（搖桿推，照玩家） 6✓（站 3 秒才記基準） 7✓ 8n/a（不判，名單給 LAWWW） 9n/a（不截圖、不藏人：量的是場景原樣） 10✓（條件事件關掉） 11✓ 12✓（三個區域同樣欄位） 13✓（讀檔捷徑標）
用法：LW_TESTS=<wt>/tests SHA=<sha> [ZONES=tz_dongnan,xinsheng,gongguan] [DAY=2025-10-14] [HOUR=14] [RUN_MS=2000] python3 cc_programs_probe.py <url> <out>"""
import os, sys, json, asyncio
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SHA = (os.environ.get('SHA') or '')[:10]; DAY = os.environ.get('DAY') or '2025-10-14'; HOUR = float(os.environ.get('HOUR') or 14)
ZONES = [z for z in (os.environ.get('ZONES') or 'tz_dongnan,xinsheng,gongguan').split(',') if z]
RUN_MS = int(os.environ.get('RUN_MS') or 2000)
R = L.Run('programs', OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
PROGS = r"""(()=>{ const r=GAME.E.renderer, P=(r.info&&r.info.programs)||[]; return P.map(p=>({id:p.id, name:p.name||'', key:String(p.cacheKey||'').slice(0,200), used:p.usedTimes})); })()"""
HOOK = r"""(()=>{ const E=GAME.E; window.__pg={f:[], npc:[]}; window.__pgOn=true; const t0=performance.now();
  if(!E.__pgHook){ E.__pgHook=true; const a0=E.addNPC; if(a0) E.addNPC=function(o){ try{ if(window.__pgOn){ const st=String(new Error().stack||'').split('\n').slice(2,7).map(s=>s.trim().slice(0,160));
      const sp=o&&o.obj&&o.obj.userData&&o.obj.userData.spec; window.__pg.npc.push({t:+(performance.now()-window.__pgT0).toFixed(1), name:(o&&o.name)||'', id:(o&&(o.charId||o.id))||'', isExtra:!!(o&&o.isExtra), crowd:(o&&o.crowd)||null, spec:sp?JSON.stringify(sp).slice(0,160):null, stack:st}); } }catch(e){} return a0.apply(this,arguments); }; }
  window.__pgT0=t0; let last=null; const f=t=>{ if(!window.__pgOn) return; if(last!=null) window.__pg.f.push([+(t-t0).toFixed(1), +(t-last).toFixed(1)]); last=t; requestAnimationFrame(f); }; requestAnimationFrame(f); })()"""
USERS = r"""(ids=>{ const E=GAME.E, r=E.renderer, PR=r.properties, out={}; for(const id of ids) out[id]=[];
  const want=new Set(ids); const P=(r.info.programs||[]); const byId=new Map(P.map(p=>[p.id,p]));
  E.scene.traverse(o=>{ if(!o.isMesh&&!o.isPoints&&!o.isLine&&!o.isSprite) return; const ms=Array.isArray(o.material)?o.material:[o.material];
    for(const m of ms){ if(!m) continue; let pr=null; try{ const p=PR.get(m); pr=p&&p.currentProgram; }catch(e){} if(!pr||!want.has(pr.id)) continue;
      if(out[pr.id].length>=12) continue; const g=o.geometry||{};
      out[pr.id].push({mesh:o.name||'', parent:(o.parent&&o.parent.name)||'', type:o.type, mat:m.type, matName:m.name||'', skinning:!!o.isSkinnedMesh, morph:g.morphAttributes?Object.keys(g.morphAttributes):[], morphTargets:!!(o.morphTargetInfluences&&o.morphTargetInfluences.length),
        recv:!!o.receiveShadow, cast:!!o.castShadow, visible:o.visible, defines:m.defines?JSON.stringify(m.defines).slice(0,160):null, vertexColors:!!m.vertexColors, transparent:!!m.transparent, map:!!m.map, alphaTest:m.alphaTest||0}); } });
  return out; })"""


async def main():
    print('CC 開跑多編的 shader：SHA %s；ZONES %s；%s %.1f；跑 %d ms' % (SHA or '?', ZONES, DAY, HOUR, RUN_MS), flush=True)
    res = {'sha': SHA, 'zones': {}}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); sys.exit(1)
        for z in ZONES:
            tag = '[%s]' % z
            await pg.goto(URL); await L.wait_loaded(pg)
            s = await D.load_zone(pg, cdp, z, DAY, HOUR, wait=3000)
            R.setup('%s 【前置／捷徑】讀檔進 %s %s %.1f（出生點、條件事件關掉）、站 3 秒' % (tag, z, DAY, HOUR))
            if not R.check('%s 讀到 %s' % (tag, z), s['zone'] == z, J(s)): continue
            p0 = await pg.evaluate(PROGS)
            await pg.evaluate(HOOK)
            if not await pg.evaluate("!!GAME.E.player.runHold"): await L.tap(pg, cdp, '#btnRun'); await pg.wait_for_timeout(100)
            run_on = await pg.evaluate("!!GAME.E.player.runHold")
            await L.joystick(pg, cdp, 0, -50, RUN_MS)
            await pg.wait_for_timeout(300)
            rec = await pg.evaluate("(()=>{ window.__pgOn=false; return window.__pg; })()")
            p1 = await pg.evaluate(PROGS)
            if await pg.evaluate("!!GAME.E.player.runHold"): await L.tap(pg, cdp, '#btnRun')
            ids0 = {q['id'] for q in p0}; new = [q for q in p1 if q['id'] not in ids0]
            users = await pg.evaluate(USERS, [q['id'] for q in new]) if new else {}
            longs = [f for f in rec['f'] if f[1] > 50]
            near = [{'frame_end_ms': f[0], 'dt': f[1], 'npc': [n for n in rec['npc'] if f[0] - f[1] - 30 <= n['t'] <= f[0]]} for f in longs]
            res['zones'][z] = {'programs_before': p0, 'programs_after': p1, 'new': new, 'users': users, 'npc': rec['npc'], 'long_frames': near, 'runHold': run_on, 'frames': len(rec['f'])}
            R.note('%s programs %d → %d（runHold=%s）；多出來 %d 支：%s' % (tag, len(p0), len(p1), run_on, len(new), J([{k: q[k] for k in ('id', 'name', 'used')} for q in new])))
            for q in new:
                R.note('%s 新 program #%s「%s」cacheKey %s' % (tag, q['id'], q['name'], q['key']))
                R.note('%s   用它的 mesh：%s' % (tag, J(users.get(str(q['id'])) or users.get(q['id']) or [])))
            R.note('%s 開跑 %d ms 共 %d 幀、>50 ms %d 幀：%s' % (tag, RUN_MS, len(rec['f']), len(longs), J([[f[0], f[1]] for f in longs])))
            R.note('%s 這段時間新生的人（addNPC）%d 個：%s' % (tag, len(rec['npc']), J(rec['npc'][:12])))
            for x in near: R.note('%s 長幀 %.1f ms（結束於 %.1f ms）前 30 ms 新生的人：%s' % (tag, x['dt'], x['frame_end_ms'], J(x['npc'])))
            R.check('%s 量得到 programs' % tag, bool(p0) and bool(p1), '')
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    open(os.path.join(OUT, 'programs.json'), 'w', encoding='utf-8').write(J(res))
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
