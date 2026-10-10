"""全遊戲可達性（第二層：系統整合測試）。2026-10-10 建立（永久回歸：教室上課劇情卡在桌角、坐下走到桌邊卡住）。

做法：每個區域讀檔進去（[前置] 讀檔、關掉條件事件），用引擎**真正的**找路（E.nav.path）＋移動碰撞（stepEntity）模擬走路（E.simWalk，
時間是模擬的、不畫畫面、不是瞬移；人物半徑 0.32 m；卡住 4 秒就算失敗）。每個互動點（出入口、座位、商店、告示、床、書桌……）都要：
  1. 互動範圍內有人物站得住（canStand）的位置，而且站在那裡時遊戲判定「最近的互動」就是它（按鈕會出現）；
  2. 從出生點走得到那個位置（dt=1/30 與 dt=0.1 各模擬一次——手機幀率高／低）；
  3. 座位：「坐下」會先走到椅子旁邊（GAME.seatApproach），那個點也要走得到。
劇情自動走路的目的地（教室上課、事件座位、宿舍書桌、咖啡廳、圖書館、麵店）、每個出入口到達另一區時的位置也一樣檢查。
NPC 不擋玩家（引擎的移動碰撞只看導航格），所以不列入。

這是模擬，不是「真實玩家流程」：證明「路走得通」，不證明畫面、觸控、劇情節奏；那些在 tests/flow_*.py。
?navlegacy：切回第二十五批之前的找路（貼著障礙物走），用來確認這個測試抓得到教室卡住（加 --legacy 跑，預期失敗）。
用法：python3 tests/reachability_all.py URL [--legacy]"""
import asyncio, json, sys
from playwright.async_api import async_playwright
sys.path.insert(0, __import__('os').path.dirname(__file__))
import playlib as L

URL = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith('--') else 'http://127.0.0.1:8765/index.html'
LEGACY = '--legacy' in sys.argv
ZONES = ['campus', 'gongguan', 'wenzhou', 'classroom', 'wancai', 'library', 'cafe', 'cvs', 'noodle', 'bookstore', 'dorm']
FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': True, 'lawclub': True, 'wenzhouLine': True}

SCAN = r"""(()=>{ const E=GAME.E, R=0.32; const P=E.player.obj.position; const start=[P.x,P.z]; const zone=GAME.G.zone; const out={zone, start:[+start[0].toFixed(2),+start[1].toFixed(2)], startStand:E.canStand(start[0],start[1],R), items:[], arrivals:[]};
  const walk=(x,z)=>{ const a=E.simWalk(start[0],start[1],x,z,{dt:1/30}); if(!a.ok) return a; const b=E.simWalk(start[0],start[1],x,z,{dt:0.1}); return b.ok?a:Object.assign({lowfps:true},b); };
  const items=E.interactables.slice();
  const occupiedBy=(st)=>{ const n=E.npcs.find(n=>n.seat&&Math.hypot(n.seat.x-st.x,n.seat.z-st.z)<0.35); return n?(n.name||n.charId||'路人'):null; };   // 和 E.nearestInteractable 同一條規則：有人坐的位子不能坐
  for(const it of items){ const r=(it.radius||1.5)-0.05; const lab=it.label||'?'; const rec={label:lab, kind:it.exit?'exit':(it.seat?'seat':'other'), x:+it.x.toFixed(2), z:+it.z.toFixed(2), r:+r.toFixed(2)};
    if(it.seat){ const who=occupiedBy(it.seat); if(who){ rec.ok=true; rec.info='這個時段有人坐在這個位子（'+who+'）：設計上不能坐，靠近時不會出現「坐下」'; out.items.push(rec); continue; } }
    // 互動範圍內站得住、而且「最近的互動」就是它的位置（照距離排）
    const cands=[]; for(let dz=-r;dz<=r+1e-6;dz+=0.2) for(let dx=-r;dx<=r+1e-6;dx+=0.2){ const d=Math.hypot(dx,dz); if(d>r) continue; const x=it.x+dx, z=it.z+dz; if(E.canStand(x,z,R)) cands.push([d,x,z]); }
    cands.sort((a,b)=>a[0]-b[0]); let ok=null, tried=0, standButOther=0, npcBlock=0, npcName='', lastFail=null;
    for(const [d,x,z] of cands){ P.set(x,0,z); const near=E.nearestInteractable(); if(near!==it){ if(near&&near.obj){ npcBlock++; npcName=near.name||near.charId||'NPC'; } else standButOther++; continue; } if(++tried>6) break; const w=walk(x,z); if(w.ok){ ok={x:+x.toFixed(2),z:+z.toFixed(2),d:+d.toFixed(2)}; break; } lastFail=Object.assign({at:[+x.toFixed(2),+z.toFixed(2)]},w); }
    P.set(start[0],0,start[1]);
    rec.standable=cands.length; rec.ok=!!ok; rec.at=ok; if(!ok){ rec.why=!cands.length?'互動範圍內沒有站得住的位置':(tried===0?(standButOther?'站得住的位置都被別的互動點搶走（按鈕不會出現）':'被 NPC 佔用（'+npcName+'在這裡，靠近時出現的是和他說話）'):'走不到'); rec.fail=lastFail;
      /* 座位被這個時段的 NPC 坐著：設計如此（人優先於物件），列為說明、不算失敗；出入口等其他互動點被 NPC 擋住仍然算失敗 */ if(tried===0&&!standButOther&&npcBlock&&it.seat){ rec.ok=true; rec.info=rec.why; } }
    if(it.seat&&GAME.seatApproach){ const ap=GAME.seatApproach(it.seat); const w=walk(ap[0],ap[1]); rec.seatApproach={at:[+ap[0].toFixed(2),+ap[1].toFixed(2)], ok:w.ok, fail:w.ok?null:w}; }
    if(it.exit&&it.exit.spawn) out.arrivals.push({to:it.exit.to, x:it.exit.spawn.x, z:it.exit.spawn.z, from:zone, label:lab});
    out.items.push(rec); }
  // 劇情自動走路的目的地（和 story3d.js／events3d.js 的 walkTo 相同）
  const story=[]; const S=E.zone.seats||[];
  if(zone==='classroom'){ const s13=S.find(s=>s.row===1&&s.col===3); if(s13) story.push(['上課劇情：走到第二排座位後面（classScene）',s13.x,s13.z+0.6]);
    for(const ev of (typeof STORY_EVENTS!=='undefined'?STORY_EVENTS:[])){ if(ev.location==='classroom'&&ev.player_seat){ const st=S.find(x=>x.row===ev.player_seat[0]&&x.col===ev.player_seat[1])||S[0]; if(st) story.push(['事件 '+ev.id+'：走到座位後面',st.x,st.z+0.6]); } } }
  if(zone==='cafe'){ story.push(['咖啡廳劇情：玩家走到桌邊（cafeScene）',4.5-0.6,-2.5+1.6]); story.push(['咖啡廳劇情：小安走到桌子對面',4.5-0.6,-2.5-1.6]); }
  if(zone==='library'&&S.length>1){ story.push(['圖書館劇情：玩家走到座位（libraryScene）',S[0].x,S[0].z-0.7]); story.push(['圖書館劇情：小安走到對面座位',S[1].x,S[1].z+0.7]); }
  for(const it of items){ if(it.seat&&(zone==='dorm'||zone==='noodle')) story.push([(zone==='dorm'?'宿舍書桌（deskScene）':'麵店座位（noodleScene）')+'：'+it.label,it.seat.x,it.seat.z+0.5]); }
  out.story=story.map(([lab,x,z])=>{ const st=E.canStand(x,z,R); const w=walk(x,z); return {label:lab,x:+x.toFixed(2),z:+z.toFixed(2),stand:st,ok:w.ok,fail:w.ok?null:w}; });
  return out; })()"""


async def main():
    run = L.Run('reachability_all' + (' (navlegacy)' if LEGACY else ''), '/tmp/reachability_all')
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL + '?turbo' + ('&navlegacy' if LEGACY else ''))
        run.check('遊戲載入', await L.wait_loaded(pg))
        has = await pg.evaluate("typeof GAME.E.simWalk==='function'")
        if not run.check('引擎有 E.simWalk（第二十五批以後）', has):
            await b.close(); sys.exit(run.finish())
        results = {}; arrivals = []
        for z in ZONES:
            run.setup(f'讀檔進 {z}（11:00，條件事件關閉）')
            await L.load_state(pg, {'zone': z, 'hour': 11.0, 'day': 8, 'weekday': 6, 'weather': 'sunny', 'pos': None, 'flags': FLAGS}, quiet_events=True)
            await pg.wait_for_timeout(1500)
            r = await pg.evaluate(SCAN); results[z] = r; arrivals += r['arrivals']
            bad = [it for it in r['items'] if not it['ok']]; badseat = [it for it in r['items'] if it.get('seatApproach') and not it['seatApproach']['ok']]; badstory = [s for s in r['story'] if not s['ok'] or not s['stand']]
            run.check(f'{z}：出生點站得住', r['startStand'], str(r['start']))
            for it in r['items']:
                if it.get('info'): print(f"INFO {z}：「{it['label']}」{it['info']}", flush=True)
            run.check(f'{z}：{len(r["items"])} 個互動點都站得到、按鈕會出現、走得到', not bad, '\n      ' + '\n      '.join(f"「{it['label']}」({it['x']},{it['z']}) {it['why']} {json.dumps(it.get('fail'), ensure_ascii=False)[:200]}" for it in bad))
            if any(it.get('seatApproach') for it in r['items']):
                run.check(f'{z}：「坐下」走到椅子旁邊的點都走得到', not badseat, '\n      ' + '\n      '.join(f"「{it['label']}」→ {it['seatApproach']['at']} {json.dumps(it['seatApproach']['fail'], ensure_ascii=False)[:200]}" for it in badseat))
            if r['story']:
                run.check(f'{z}：劇情自動走路的 {len(r["story"])} 個目的地站得住、走得到', not badstory, '\n      ' + '\n      '.join(f"{s['label']} ({s['x']},{s['z']}) 站得住={s['stand']} {json.dumps(s['fail'], ensure_ascii=False)[:200]}" for s in badstory))
        # 出入口到達點（在目的區域）
        for z in ZONES:
            arr = [a for a in arrivals if a['to'] == z]
            if not arr: continue
            await L.load_state(pg, {'zone': z, 'hour': 11.0, 'day': 8, 'weekday': 6, 'weather': 'sunny', 'pos': None, 'flags': FLAGS}, quiet_events=True)
            await pg.wait_for_timeout(1200)
            res = await pg.evaluate("""(arr=>{ const E=GAME.E, P=E.player.obj.position; const s=[P.x,P.z]; return arr.map(a=>{ const st=E.canStand(a.x,a.z,0.32); const w=E.simWalk(a.x,a.z,s[0],s[1],{dt:1/30}); return Object.assign({},a,{stand:st,ok:w.ok,fail:w.ok?null:w}); }); })(%s)""" % json.dumps(arr))
            bad = [a for a in res if not a['stand'] or not a['ok']]
            run.check(f'{z}：從別區進來的 {len(res)} 個到達點站得住、走得到出生點', not bad, '\n      ' + '\n      '.join(f"從 {a['from']}「{a['label']}」到 ({a['x']},{a['z']}) 站得住={a['stand']} {json.dumps(a['fail'], ensure_ascii=False)[:160]}" for a in bad))
        tot = sum(len(r['items']) for r in results.values()); st = sum(len(r['story']) for r in results.values())
        print(f'統計：{len(results)} 個區域、{tot} 個互動點、{st} 個劇情走路目的地、{len(arrivals)} 個出入口到達點', flush=True)
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    sys.exit(run.finish())

asyncio.run(main())
