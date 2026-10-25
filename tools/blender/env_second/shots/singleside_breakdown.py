"""單面的好處來自哪一組東西（PERF-SINGLESIDE-GLB-1025，LAWWW2-B 2026-10-25）：同一頁、同一個鏡頭，區域裡每一個大的頂層群組（正式模型、行道樹、公園…）
輪流把雙面材質改單面量 fps（改前 → 這一組改單面 → 還原），最後全部一起改單面再量一次（上限）。路人拿掉。
【捷徑】直接改 three.js 材質的 side（不匯出 GLB）：葉片卡、十字薄片這些單面會少一半，所以是上限，不是交件的數字。
用法（repo 根目錄開 http server）：
  python3 tools/blender/env_second/shots/singleside_breakdown.py <URL> <區域> <輸出.json> [時刻=15] [最少三角形=5000]
同一台機器上同時只跑這一個瀏覽器工作。"""
import asyncio, json, sys
from playwright.async_api import async_playwright
URL, ZONE, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
HOUR = float(sys.argv[4]) if len(sys.argv) > 4 else 15.0
MIN_TRIS = int(sys.argv[5]) if len(sys.argv) > 5 else 5000
FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': True, 'lawclub': True, 'wenzhouLine': True}
HIDE = "#hud,#hudR,#joy,#interact,#minimap,#btnMenu,#btnRun,#ctlR,#goal,#toast,#caption,#clock,#bar,#energy,#money,#mdbg,#fps,#devErr,#rotate,#phone,#adv,#dlg{display:none!important}"
GROUPS = """(min=>{ const g=GAME.E.zone.group, out=[];
  g.children.forEach((c,i)=>{ let tris=0, ds=0; c.traverse(o=>{ if(!o.isMesh||!o.geometry) return; const ix=o.geometry.index, n=(ix?ix.count:(o.geometry.attributes.position?o.geometry.attributes.position.count:0))/3; tris+=n*(o.isInstancedMesh?o.count:1);
    [].concat(o.material).forEach(m=>{ if(m&&m.side===THREE.DoubleSide) ds++; }); });
    if(tris>=min&&ds>0) out.push({i, name:c.name||c.type, tris:Math.round(tris), ds}); });
  return out.sort((a,b)=>b.tris-a.tris); })"""
FRONT = """(sel=>{ const g=GAME.E.zone.group, seen=new Set(); window.__undo=[]; const roots=sel==='all'?[g]:sel.map(i=>g.children[i]);
  for(const r of roots) r.traverse(o=>{ if(!o.isMesh) return; [].concat(o.material).forEach(m=>{ if(m&&!seen.has(m)&&m.side===THREE.DoubleSide){ seen.add(m); m.side=THREE.FrontSide; m.needsUpdate=true; window.__undo.push(m); } }); });
  return seen.size; })"""
UNDO = "(()=>{ (window.__undo||[]).forEach(m=>{ m.side=THREE.DoubleSide; m.needsUpdate=true; }); window.__undo=[]; })()"


async def fps(pg, n=4):
    await pg.wait_for_timeout(4000); r = []
    for _ in range(n):
        f0 = await pg.evaluate("GAME.E.frame"); await pg.wait_for_timeout(5000); f1 = await pg.evaluate("GAME.E.frame"); r.append((f1 - f0) / 5)
    return round(sum(r) / len(r), 2)


async def main():
    res = {'zone': ZONE, 'views': []}
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        ctx = await b.new_context(viewport={'width': 844, 'height': 390}, device_scale_factor=1, has_touch=True, is_mobile=True)
        pg = await ctx.new_page(); await pg.goto(URL)
        for i in range(240):
            if await pg.evaluate("!!(window.GAME&&document.getElementById('loading')&&document.getElementById('loading').classList.contains('hide'))"): break
            await pg.wait_for_timeout(500)
        await pg.evaluate("(css=>{ const el=document.createElement('style'); el.textContent=css; document.head.appendChild(el); setInterval(()=>{ try{ if(window.ADV&&ADV.active&&ADV.end) ADV.end(); if(GAME.E.paused) GAME.E.paused=false; }catch(e){} },300); })(%s)" % json.dumps(HIDE))
        st = {'zone': ZONE, 'day': -330, 'hour': HOUR, 'stage': 'econ', 'weather': 'sunny', 'flags': FLAGS}
        await pg.evaluate("(async()=>{ const s=GAME.defaults('祐廷'); Object.assign(s,%s); s.weekday=3; document.getElementById('titleScreen').classList.add('hide'); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; GAME.phoneThread=()=>Promise.resolve(); await GAME.applySave(s); })()" % json.dumps(st, ensure_ascii=False))
        await pg.wait_for_timeout(20000)
        await pg.evaluate("(()=>{ const E=GAME.E; E.player.busy=true; E.npcs.forEach(n=>{ n.hidden=true; n.obj.visible=false; }); (E.extras||[]).forEach(x=>{ if(x.obj&&x.obj.parent) x.obj.parent.remove(x.obj); }); })()")
        groups = await pg.evaluate(GROUPS + "(%d)" % MIN_TRIS); res['groups'] = groups
        print('groups', json.dumps(groups, ensure_ascii=False), flush=True)
        y0 = await pg.evaluate("GAME.E.cam.yaw")
        for k, yaw in enumerate([y0, y0 + 3.14159]):
            await pg.evaluate("(y=>{ const C=GAME.E.cam; C.mode='follow'; C.yaw=y; C.manualT=1e9; })(%s)" % yaw)
            v = {'view': k, 'rows': []}
            for g in groups + [{'i': 'all', 'name': '全部', 'tris': None}]:
                base = await fps(pg)
                n = await pg.evaluate(FRONT + "(%s)" % (json.dumps('all') if g['i'] == 'all' else json.dumps([g['i']])))
                front = await fps(pg); await pg.evaluate(UNDO)
                row = dict(name=g['name'], tris=g['tris'], mats=n, base=base, front=front, gain=round((front / base - 1) * 100) if base else None)
                v['rows'].append(row); print(k, json.dumps(row, ensure_ascii=False), flush=True)
            res['views'].append(v)
        await b.close()
    json.dump(res, open(OUT, 'w'), ensure_ascii=False, indent=1)
asyncio.run(main())
