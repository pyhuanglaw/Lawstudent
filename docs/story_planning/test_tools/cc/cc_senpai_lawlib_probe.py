"""CC-B（帳號 B）11-09：學姊在法圖（day38 15:00）身邊站不站得住（BB-B 20:42；判定＝BB：最近站得住的點 >1.4 m＝玩家也說不到話→轉 LAWWW-B；有點但探針走不到＝探針的）。
不走路：【前置／捷徑】讀使用者 day38 存檔到 lawlib 15:00（條件事件關）→ 記學姊位置、lv、她的互動半徑；她周圍 1.4 m（0.1 m、15°）內 E.canStand(x,z,0.3,lv) 的點；
最近一個站得住的點離她多遠 →【捷徑】讀檔把玩家放到那一點（面向她）→ 記互動鍵；拍俯視圖（她頭頂 6 m 往下）＋玩家視角各一張。
用法：LW_TESTS=<wt>/tests SAVES=<資料夾> [SAVE=day38.json] [WHO=heroine_05] [ZONE=lawlib] [HOUR=15] python3 cc_senpai_lawlib_probe.py <url> <out>"""
import os, sys, json, asyncio, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or HERE); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SAVES = os.environ.get('SAVES') or '.'; SAVE = os.environ.get('SAVE') or 'day38.json'
WHO = os.environ.get('WHO') or 'heroine_05'; ZONE = os.environ.get('ZONE') or 'lawlib'; HOUR = float(os.environ.get('HOUR') or 15)
J = lambda o: json.dumps(o, ensure_ascii=False)
R = L.Run('senpai_lawlib', OUT); D.setup(R, OUT)
SCAN = r"""((e)=>{ const E=GAME.E, n=E.npcs.find(q=>q.id===e.w||q.charId===e.w); if(!n) return null; const p=n.obj.position, lv=n.lv|0;
  const pts=[]; for(let r=0.3; r<=1.4+1e-6; r+=0.1) for(let a=0; a<360; a+=15){ const x=p.x+r*Math.sin(a*Math.PI/180), z=p.z+r*Math.cos(a*Math.PI/180); if(E.canStand(x,z,0.3,lv)) pts.push({x:+x.toFixed(2),z:+z.toFixed(2),r:+r.toFixed(1),a}); }
  const it=E.interactables.filter(i=>!i.hidden&&Math.hypot(i.x-p.x,i.z-p.z)<3).map(i=>({label:i.label,x:+i.x.toFixed(2),z:+i.z.toFixed(2),r:i.radius,lv:i.lv|0,npc:!!i.npc}));
  const others=E.npcs.filter(q=>q!==n&&Math.hypot(q.obj.position.x-p.x,q.obj.position.z-p.z)<3).map(q=>({id:q.id||q.charId,x:+q.obj.position.x.toFixed(2),z:+q.obj.position.z.toFixed(2),d:+Math.hypot(q.obj.position.x-p.x,q.obj.position.z-p.z).toFixed(2)}));
  let near=null; for(let r=0.3; r<=4+1e-6; r+=0.1){ for(let a=0; a<360; a+=10){ const x=p.x+r*Math.sin(a*Math.PI/180), z=p.z+r*Math.cos(a*Math.PI/180); if(E.canStand(x,z,0.3,lv)){ near={x:+x.toFixed(2),z:+z.toFixed(2),d:+r.toFixed(1)}; break; } } if(near) break; }
  return {pos:{x:+p.x.toFixed(2),z:+p.z.toFixed(2),y:+p.y.toFixed(2)}, lv, pose:n.pose||n.state||null, seated:!!(n.seat||n.sitting), talkRadius:n.talkRadius||null, n14:pts.length, pts:pts.slice(0,40), nearest:near, interactables:it, others}; })"""
async def main():
    s = json.load(open(os.path.join(SAVES, SAVE), encoding='utf-8')); s2 = dict(s); s2.update({'zone': ZONE, 'hour': HOUR, 'pos': None})
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
        R.setup('【前置／捷徑】讀 %s 到 %s %s:00（條件事件關），不走路' % (SAVE, ZONE, HOUR))
        await L.load_state(pg, s2, quiet_events=True); await pg.wait_for_timeout(6000)
        sc = None
        for _ in range(20):
            sc = await pg.evaluate(SCAN, {'w': WHO})
            if sc: break
            await pg.wait_for_timeout(1500)
        R.note('whereIs：%s' % J(await pg.evaluate("(w=>STORY.whereIs(GAME,w)||null)(%s)" % J(WHO))))
        if not R.check('%s 在 %s（NPC）' % (WHO, ZONE), bool(sc), ''): await b.close(); return
        R.note('她：%s；lv %s；pose %s；坐著 %s' % (J(sc['pos']), sc['lv'], sc['pose'], sc['seated']))
        R.note('1.4 m 內站得住的點：%d 個；前 40 個 %s' % (sc['n14'], J(sc['pts'])))
        R.note('最近一個站得住的點：%s' % J(sc['nearest']))
        R.note('附近 3 m 的互動點：%s' % J(sc['interactables'])); R.note('附近 3 m 的其他人：%s' % J(sc['others']))
        P = sc['pos']
        await D.user_shot(pg, cdp, 'senpai_top', {'eye': [P['x'] + 0.01, P['y'] + 6.5, P['z'] + 0.01], 'look': [P['x'], P['y'], P['z']], 'lens': 18}, hide_player=False)
        nr = sc['nearest']; res = {'scan': sc}
        if nr:
            yaw = math.atan2(P['x'] - nr['x'], P['z'] - nr['z'])
            R.setup('【捷徑】讀檔把玩家放到最近站得住的點 %s（面向她）' % J(nr))
            st2 = dict(s2); st2['pos'] = {'x': nr['x'], 'z': nr['z'], 'yaw': yaw, 'lv': sc['lv']}
            await L.load_state(pg, st2, quiet_events=True); await pg.wait_for_timeout(4000)
            st = await L.state(pg); res['at_nearest'] = {'interact': st.get('interact'), 'player': await pg.evaluate("(()=>{ const o=GAME.E.player.obj.position; return [+o.x.toFixed(2),+o.z.toFixed(2)]; })()"),
                                                          'her': await pg.evaluate("(w=>{ const n=GAME.E.npcs.find(q=>q.id===w||q.charId===w); return n?[+n.obj.position.x.toFixed(2),+n.obj.position.z.toFixed(2)]:null; })(%s)" % J(WHO))}
            R.note('站到最近那一點：%s' % J(res['at_nearest']))
            await pg.screenshot(path=os.path.join(OUT, 'senpai_player_view.png'))
        R.check('最近站得住的點 ≤ 1.4 m（玩家說得到話的必要條件）', bool(nr) and nr['d'] <= 1.4, J(nr))
        R.check('站到那一點時互動鍵是和她說話', bool(res.get('at_nearest')) and '溫書瑀' in (res['at_nearest']['interact'] or '') or '學姊' in ((res.get('at_nearest') or {}).get('interact') or ''), J(res.get('at_nearest')))
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        json.dump(res, open(os.path.join(OUT, 'senpai_lawlib.json'), 'w'), ensure_ascii=False, indent=1)
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
