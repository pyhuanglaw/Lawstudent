"""CC-C（帳號 C）11-05：BB-C 02:06 P1——v9.10.20 pool_17（蕭乃文，總圖 B1 研究小間 2025-09-15 20:00）點地走 0.00 m，先分清楚。判定歸 BB。
  A／B：線上 main b0c3032af（v9.10.19.1）和 d3828 各跑一次（URLS 逗號分開，照順序）。同一個房間、同一個時間：
    1 【前置／捷徑】讀檔 library_b1 2025-09-15 20:00（手機自動打開關掉）；找蕭乃文（pool_17）在哪一間（LIBRARY_B1_LAYOUT.rooms）；玩家放在她旁邊站得住的格子（她那一間裡）。
    2 房間裡點三個地面點：門口（門內 0.6 m）、中間、靠桌子（那一間座位旁站得住的格子），再加 pool4 那一次點的 (7.37, 12.14)。每點一次以前把玩家放回同一個起點。
    3 對照：研究小間外面的走道（門外），玩家站在走道、點走道上另一點。
  每一次記：點的那一點在不在 nav 格上（nav.free）、站不站得住（nav.clear 半徑 0.3＝clearMask）、找不找得到路（nav.path）、畫面上點不點得到（tap_ground verify）、
  8 秒內走了幾公尺、GAME.walkFallbacks 有沒有增加、點完以後 P.path／P.busy／E.cam.mode。
用法：LW_TESTS=<wt>/tests URLS=<main>,<d3828> TAGS=main_b0c3,d3828 python3 cc_tap_b1room_ab.py <out>"""
import os, sys, json, asyncio, time, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
from playwright.async_api import async_playwright

OUT = sys.argv[1]
URLS = [u for u in (os.environ.get('URLS') or '').split(',') if u]
TAGS = [t for t in (os.environ.get('TAGS') or '').split(',') if t] or ['v%d' % i for i in range(len(URLS))]
J = lambda o: json.dumps(o, ensure_ascii=False)
R = L.Run('tap_b1room_ab', OUT)

PLAN = r"""(()=>{ const E=GAME.E, N=E.nav, LY=typeof LIBRARY_B1_LAYOUT!=='undefined'?LIBRARY_B1_LAYOUT:null; const npc=(E.npcs||[]).find(n=>n&&(n.charId==='pool_17'||n.id==='pool_17'));
  if(!npc||!LY) return {err:!npc?'找不到 pool_17':'沒有 LIBRARY_B1_LAYOUT', npcs:(E.npcs||[]).map(n=>n.charId||n.id||n.name).slice(0,30)};
  const p=npc.obj.position, room=(LY.rooms||[]).find(r=>p.x>r.x0&&p.x<r.x1&&p.z>r.z0&&p.z<r.z1)||null;
  const st=(x,z)=>N.free(x,z)&&N.clear(x,z,0.3);
  const near=(x,z,inR,max)=>{ for(let r=0;r<=(max||2);r+=0.1){ for(let a=0;a<16;a++){ const xx=x+Math.cos(a*Math.PI/8)*r, zz=z+Math.sin(a*Math.PI/8)*r; if(inR&&room&&!(xx>room.x0+0.2&&xx<room.x1-0.2&&zz>room.z0+0.2&&zz<room.z1-0.2)) continue; if(st(xx,zz)) return [+xx.toFixed(2),+zz.toFixed(2)]; } } return null; };
  const start=near(p.x,p.z,true,1.6);
  let door=null, center=null, table=null, cor=null, corT=null;
  if(room){ const d=room.door||null, cx=(room.x0+room.x1)/2, cz=(room.z0+room.z1)/2; center=near(cx,cz,true,1.5);
    if(d){ const inz=d.z<=room.z0+0.01?1:(d.z>=room.z1-0.01?-1:0), inx=d.x<=room.x0+0.01?1:(d.x>=room.x1-0.01?-1:0); door=near(d.x+inx*0.6,d.z+inz*0.6,true,0.8); cor=near(d.x-inx*1.0,d.z-inz*1.0,false,1.0); corT=cor?near(cor[0]+(inz?2.5:0),cor[1]+(inx?2.5:0),false,1.0):null; }
    const seats=(E.zone.seats||[]).filter(s=>s.x>room.x0&&s.x<room.x1&&s.z>room.z0&&s.z<room.z1);
    for(const s of seats){ const fx=Math.sin(s.yaw||0), fz=Math.cos(s.yaw||0); const c=near(s.x-fx*0.6+0.0,s.z-fz*0.6,true,0.5); if(c&&(!start||Math.hypot(c[0]-start[0],c[1]-start[1])>0.8)){ table=c; break; } } }
  return {npc:[+p.x.toFixed(2),+p.z.toFixed(2)], room:room&&{id:room.id,label:room.label,x0:room.x0,x1:room.x1,z0:room.z0,z1:room.z1,door:room.door||null}, start, door, center, table, cor, corT}; })()"""
INFO = r"""(([x,z,sx,sz])=>{ const N=GAME.E.nav; const p=N.path(sx,sz,x,z); let len=null; if(p){ len=0; let a=[sx,sz]; for(const q of p){ len+=Math.hypot(q[0]-a[0],q[1]-a[1]); a=q; } }
  return {free:N.free(x,z), canStand:N.clear(x,z,0.3), path:!!p, pathLen:len==null?null:+len.toFixed(2), end:p&&p.length?p[p.length-1].map(v=>+v.toFixed(2)):null}; })"""
PLACE = r"""(([x,z])=>{ const P=GAME.E.player; P.path=null; P.tapPref=null; P.obj.position.x=x; P.obj.position.z=z; if(GAME.E.settleY) try{ GAME.E.settleY(P); }catch(e){} return true; })"""
ST = r"""(()=>{ const E=GAME.E, P=E.player; return {x:+P.obj.position.x.toFixed(3), z:+P.obj.position.z.toFixed(3), busy:!!P.busy, path:P.path?P.path.length:0, cam:E.cam.mode, wf:GAME.walkFallbacks||0, paused:!!E.paused, dlg:!!(GAME.D&&GAME.D.active)}; })()"""


async def one(pg, cdp, tag, name, start, tgt):
    await pg.evaluate(PLACE, start); await pg.wait_for_timeout(1500)
    # 鏡頭轉到看得到那一點（玩家也會轉鏡頭）：跟隨鏡頭放在起點和目標連線的反方向
    await pg.evaluate("(([sx,sz,tx,tz])=>{ const E=GAME.E; const a=Math.atan2(sx-tx,sz-tz); if(E.cam){ E.cam.yaw=a; E.cam.yawTarget=a; } })", [start[0], start[1], tgt[0], tgt[1]]); await pg.wait_for_timeout(1200)
    inf = await pg.evaluate(INFO, [tgt[0], tgt[1], start[0], start[1]])
    s0 = await pg.evaluate(ST)
    r = await L.tap_ground(pg, cdp, tgt[0], tgt[1], lv=0, verify=True)
    if not r:
        R.note('[%s %s] 目標 %s：畫面上點不到（verify 不過）；nav %s' % (tag, name, J(tgt), J(inf))); return {'name': name, 'tgt': tgt, 'tappable': False, 'nav': inf}
    mv = 0.0; s1 = s0
    for _ in range(16):
        await pg.wait_for_timeout(500); s1 = await pg.evaluate(ST); mv = math.hypot(s1['x'] - s0['x'], s1['z'] - s0['z'])
        if s1['path'] == 0 and mv > 0.3: break
    rec = {'name': name, 'start': start, 'tgt': tgt, 'tappable': True, 'hit': r.get('hit'), 'nav': inf, 'moved': round(mv, 2), 'dist_left': round(math.hypot(s1['x'] - tgt[0], s1['z'] - tgt[1]), 2), 'wf': [s0['wf'], s1['wf']], 'after': s1}
    R.note('[%s %s] 起點 %s → 點 %s（落點 %s）：走了 %.2f m、離目標 %.2f m；nav free=%s canStand=%s path=%s（%s m）；walkFallbacks %s→%s；點完 %s' % (
        tag, name, J(start), J(tgt), J(r.get('hit')), mv, rec['dist_left'], inf['free'], inf['canStand'], inf['path'], inf['pathLen'], s0['wf'], s1['wf'], J({k: s1[k] for k in ('busy', 'path', 'cam', 'paused', 'dlg')})))
    await R.shot(pg, '%s_%s' % (tag, name))
    return rec


async def main():
    print('CC tap_b1room_ab（BB-C 02:06 P1：pool_17 研究小間點地）：%s；SwiftShader ≠ iPhone' % J(list(zip(TAGS, URLS))), flush=True)
    res = {}
    async with async_playwright() as p:
        for tag, url in zip(TAGS, URLS):
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
            await cc_det.install(pg, 20261105)
            await pg.goto(url); ok = await L.wait_loaded(pg); R.check('[%s] 遊戲載入' % tag, ok, url)
            if not ok: await b.close(); continue
            await pg.evaluate("localStorage.clear()")
            d = await pg.evaluate("STORY.dayOfKey('2025-09-15')")
            R.setup('[%s] 讀檔：總圖 B1、2025-09-15（一）20:00（pool_17 那一次同一天同一時間）；手機自動打開關掉' % tag)
            await L.load_state(pg, {'zone': 'library_b1', 'hour': 20.0, 'day': d, 'weather': 'clear'}, quiet_phone=True)
            await pg.wait_for_timeout(6000); await L.close_panels(pg, cdp)
            plan = await pg.evaluate(PLAN)
            R.note('[%s] 蕭乃文和那一間：%s' % (tag, J(plan)))
            if plan.get('err') or not plan.get('start'):
                R.check('[%s] 找得到蕭乃文、她那一間、站得住的起點' % tag, False, J(plan)); await b.close(); continue
            R.setup('[%s] 玩家放到蕭乃文旁邊站得住的格子 %s（她那一間裡）' % (tag, J(plan['start'])))
            recs = []
            for name in ('door', 'center', 'table'):
                if plan.get(name): recs.append(await one(pg, cdp, tag, name, plan['start'], plan[name]))
                else: R.note('[%s] %s：那一間找不到站得住的點' % (tag, name))
            recs.append(await one(pg, cdp, tag, 'pool4_point', plan['start'], [7.37, 12.14]))
            if plan.get('cor') and plan.get('corT'):
                R.setup('[%s] 對照：玩家放到門外走道 %s，點走道上 %s' % (tag, J(plan['cor']), J(plan['corT'])))
                recs.append(await one(pg, cdp, tag, 'corridor', plan['cor'], plan['corT']))
            res[tag] = {'plan': plan, 'recs': recs}
            R.check('[%s] 沒有 JS 例外' % tag, not errs, J(errs[:3]))
            await b.close()
    json.dump(res, open(os.path.join(OUT, 'tap_b1room_ab.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('\n== 摘要（判定歸 BB）')
    for tag, v in res.items():
        for r in v['recs']:
            print('  %-10s %-12s 點得到=%s 走了=%s m 離目標=%s nav(free=%s stand=%s path=%s) wf=%s' % (tag, r['name'], r['tappable'], r.get('moved'), r.get('dist_left'), r['nav']['free'], r['nav']['canStand'], r['nav']['path'], r.get('wf')), flush=True)
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
