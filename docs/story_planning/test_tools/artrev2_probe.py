"""BB（帳號 A）2026-10-21：LAWWW2 三件畫面驗收「補拍」——BB-C artrev_probe.py 的修正版。
  ① 體育館 1F／B1（09324bda→77e990dc）：玩家鏡頭四方向＋往上看天花板燈（劇情鏡頭 E.cinematic，從玩家頭的高度看最近的光暈）
  ② 大一 203（36c07603→7ef4ff56）：把玩家真的放到紙箱互動點旁邊（舊版 p.position.x 設了兩次、沒設 z，玩家一直在門口），
     玩家鏡頭拉近往下看；劇情鏡頭近拍紙箱和阿凱的國界膠帶（封好／壓平、中間那段有字／沒字）
  ③ 美國 C 棟 208（13707c1f→fc645c8b）：走廊四方向（鏡頭卡牆的重現）＋門口、A／B 門前（臥室不能進，當「床邊」）的預設鏡頭＋
     照配置座標近拍吸頂燈、版畫、拍立得、B 門外套（臥室 B 裡面、客廳兩側）；泡麵袋在 EVENT_US2（平常藏著）→ [捷徑] 打開再拍；玩家站在廚房的鏡頭
  角度照 LAWWW2（帳號 A）2026-10-21 15:34 的要求。
[前置] 讀使用者 9/25 存檔（開發分支 tests/repro_1020/user_save_day9.json）；[捷徑] GAME.enter、設時間、設旗標、搬玩家、劇情鏡頭。
不是 iPhone：只看畫面。用法：LW_TESTS=<開發分支>/tests python3 artrev2_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>"""
import os, sys, json, asyncio
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
GLOW = """(n=>{ let m=null; GAME.E.scene.traverse(o=>{ if(o.name===n) m=o; }); return m?{n, vis:m.visible, k:m.material&&m.material.emissiveIntensity, cnt:(m.geometry&&m.geometry.attributes.position?m.geometry.attributes.position.count:0)}:null; })"""
Y1 = """(()=>{ const r=[]; GAME.E.scene.traverse(o=>{ if(/^Y1_/.test(o.name)) r.push(o.name+':'+o.visible); }); return r; })()"""
# 看得到（自己和所有上層都 visible）、名字符合的物件：回傳名字、世界座標的中心與大小；上層已經符合的不重複列
FIND = """(re=>{ const R=new RegExp(re,'i'), out=[], vis=o=>{ for(let p=o;p;p=p.parent) if(!p.visible) return false; return true; };
  GAME.E.scene.traverse(o=>{ if(!o.name||!R.test(o.name)||!vis(o)) return; for(let p=o.parent;p;p=p.parent) if(p.name&&R.test(p.name)) return;
    const b=new THREE.Box3().setFromObject(o); if(b.isEmpty()) return; const c=b.getCenter(new THREE.Vector3()), s=b.getSize(new THREE.Vector3());
    out.push({n:o.name, c:[+c.x.toFixed(2),+c.y.toFixed(2),+c.z.toFixed(2)], s:[+s.x.toFixed(2),+s.y.toFixed(2),+s.z.toFixed(2)]}); });
  return out.slice(0,40); })"""
NAMES = """(()=>{ const s=new Set(); GAME.E.zone&&GAME.E.zone.group.traverse(o=>{ if(o.name) s.add(o.name); }); return [...s].slice(0,400); })()"""
# 光暈網格（合批的四邊形）：取離玩家水平距離最近的頂點（世界座標）
NEAR_GLOW = """(n=>{ let m=null; GAME.E.scene.traverse(o=>{ if(o.name===n) m=o; }); if(!m||!m.geometry) return null; m.updateMatrixWorld(true);
  const a=m.geometry.attributes.position, p=GAME.E.player.obj.position, v=new THREE.Vector3(); let best=null, bd=1e9;
  for(let i=0;i<a.count;i++){ v.fromBufferAttribute(a,i).applyMatrix4(m.matrixWorld); const d=Math.hypot(v.x-p.x,v.z-p.z); if(d>1.2&&d<bd){ bd=d; best=[v.x,v.y,v.z]; } } return best; })"""
# 從 c 往水平四個方向打射線，挑最空的方向，放在 d 公尺（撞到東西就停在前面 0.3 m）
FREE_DIR = """(([cx,cy,cz,d])=>{ const rc=new THREE.Raycaster(), o=new THREE.Vector3(cx,cy,cz); let best=null, bd=-1;
  for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1],[0.7,0.7],[-0.7,0.7],[0.7,-0.7],[-0.7,-0.7]]){ rc.set(o,new THREE.Vector3(dx,0,dz).normalize()); rc.far=d+0.3;
    const h=rc.intersectObjects(GAME.E.zone.group.children,true).filter(x=>x.distance>0.25); const free=h.length?h[0].distance-0.3:d; if(free>bd){ bd=free; best=[dx,dz]; } }
  const f=Math.max(0.6,Math.min(d,bd)); return [cx+best[0]*f, cy, cz+best[1]*f, f]; })"""
async def enter(pg, z, h):
    await pg.evaluate("(async(z,h)=>{ GAME.G.hour=h; GAME.E.hour=h; await GAME.enter(z); })(%s,%s)" % (json.dumps(z), h))
    await pg.wait_for_timeout(15000); await pg.evaluate("(h=>{ GAME.G.hour=h; GAME.E.hour=h; })(%s)" % h); await pg.wait_for_timeout(5000)
async def closephone(pg):
    await pg.evaluate("(()=>{ try{ if(typeof PHONE!=='undefined'&&PHONE.pending) for(const k of (PHONE.pending()||[])){ try{ PHONE.answer&&PHONE.answer(k,0); }catch(e){} } }catch(e){} const b=document.getElementById('btnPhoneClose'); if(b&&b.offsetParent) b.click(); })()")
    await pg.wait_for_timeout(800)
async def yaws(pg, run, tag, n=4, dist=None, pitch=None, y0=None):
    await closephone(pg)
    if y0 is None: y0 = await pg.evaluate("GAME.E.cam.yaw")
    for k in range(n):
        await pg.evaluate("(([y,d,p])=>{ const C=GAME.E.cam; C.yaw=y; if(d) C.distTarget=d; if(p) C.pitch=p; C.manualT=60; })(%s)" % json.dumps([y0 + k * 3.14159 / 2, dist, pitch]))
        await pg.wait_for_timeout(2500); await closephone(pg); await run.shot(pg, '%s_y%d' % (tag, k))
async def cine(pg, run, tag, pos, look):
    await closephone(pg)
    await pg.evaluate("(([p,l])=>{ GAME.E.cinematic(new THREE.Vector3(...p), new THREE.Vector3(...l)); GAME.E.snapCinematic(); })(%s)" % json.dumps([pos, look]))
    await pg.wait_for_timeout(2500); await run.shot(pg, tag); await pg.evaluate("GAME.E.endCinematic()"); await pg.wait_for_timeout(800)
async def put(pg, x, z):
    return await pg.evaluate("(([x,z])=>{ const P=GAME.E.player; P.path=null; P.target=null; P.obj.position.set(x,P.obj.position.y,z); try{ GAME.E.unstick&&GAME.E.unstick(P,8); }catch(e){} return [+P.obj.position.x.toFixed(2),+P.obj.position.z.toFixed(2)]; })(%s)" % json.dumps([x, z]))
async def player_pos(pg):
    return await pg.evaluate("(()=>{ const p=GAME.E.player.obj.position; return [p.x,p.y,p.z]; })()")
async def section(run, name, coro):
    try: await coro
    except Exception as e:
        print('  ! %s 失敗：%s' % (name, e), flush=True); run.check('%s 跑完' % name, False, str(e)[:200])
async def gym(pg, run):
    for z, nm in (('gym', 'gym_glows'), ('gym_b1', 'gym_b1_glows')):
        for h in (13, 20.5):
            await enter(pg, z, h); run.setup('[捷徑] %s %.1f' % (z, h))
            mid = await pg.evaluate("(z=>{ const L=GYM_LAYOUT, b=L.b1||{}, l=b.lobby; if(z==='gym') return [0,0]; return (l&&l.x0!=null)?[(l.x0+l.x1)/2,(l.z0+l.z1)/2]:[0,-5]; })(%s)" % json.dumps(z))
            at = await put(pg, mid[0], mid[1]); print('   玩家放到中間', mid, '→', at, flush=True); run.setup('[捷徑] 玩家搬到 %s 中間 %s' % (z, at))
            g = await pg.evaluate(GLOW + "(%s)" % json.dumps(nm)); print('  ', z, h, json.dumps(g, ensure_ascii=False), flush=True)
            run.check('%s %.1f 有光暈網格' % (z, h), bool(g), json.dumps(g))
            await yaws(pg, run, '%s_%02d' % (z, int(h)))
            p = await player_pos(pg); v = await pg.evaluate(NEAR_GLOW + "(%s)" % json.dumps(nm)); print('   最近的光暈', v, flush=True)
            if v:
                await cine(pg, run, '%s_%02d_up_near' % (z, int(h)), [p[0], p[1] + 1.5, p[2]], v)
                await cine(pg, run, '%s_%02d_up_far' % (z, int(h)), [p[0] - (v[0] - p[0]) * 0.6, p[1] + 1.5, p[2] - (v[2] - p[2]) * 0.6], v)
                await cine(pg, run, '%s_%02d_up_near_b' % (z, int(h)), [p[0] + 0.04, p[1] + 1.54, p[2] + 0.03], v)   # 同角度偏 4 cm：兩張比對，燈和天花板有沒有閃（z-fighting）
            await cine(pg, run, '%s_%02d_up_top' % (z, int(h)), [p[0], p[1] + 1.5, p[2]], [p[0] + 0.3, p[1] + 9, p[2] - 1.2])   # 從中間幾乎正上方
async def dorm(pg, run):
    for tag, fl, done in (('closed', {}, {}), ('tape_text', {'KAI_TAPE': True}, {'ev_kai_tape2': True}), ('folded_tape', {'BOX_WINTER_OPEN': True, 'KAI_TAPE': True}, {})):
        await pg.evaluate("((fl,dn)=>{ const G=GAME.G; for(const k of ['KAI_TAPE','BOX_WINTER_OPEN','KAI_TAPE_GONE']) delete G.flags[k]; G.events=G.events||{}; G.events.done=G.events.done||{}; delete G.events.done.ev_kai_tape2; Object.assign(G.flags,fl); Object.assign(G.events.done,dn); })(%s,%s)" % (json.dumps(fl), json.dumps(done)))
        await enter(pg, 'dorm', 15); run.setup('[捷徑] dorm %s' % tag)
        d0, p0 = await pg.evaluate("[GAME.E.cam.distTarget, GAME.E.cam.pitch]"); print('   預設鏡頭', d0, p0, flush=True)
        st = await pg.evaluate(Y1); print('   dorm', tag, st, flush=True)
        it = await pg.evaluate("(()=>{ const i=(GAME.E.interactables||[]).find(i=>i.y1WinterBox); return i?[i.x,i.z,i.label]:null; })()")
        box = await pg.evaluate(FIND + "('^Y1_BOX')"); tape = await pg.evaluate(FIND + "('^Y1_KAI_TAPE')")
        print('   紙箱互動點', it, '紙箱', box, '膠帶', tape, flush=True)
        if it:
            at = await put(pg, it[0] + 0.55, it[1]); print('   玩家放到', at, flush=True)
            p = await player_pos(pg); import math; yb = math.atan2(p[0] - it[0], p[2] - it[1])
            await yaws(pg, run, 'dorm_%s_box_default' % tag, n=1, dist=d0, pitch=p0, y0=yb)   # 預設跟隨鏡頭（進區域時的距離、俯角）
            await yaws(pg, run, 'dorm_%s_box_closest' % tag, n=1, dist=2.2, pitch=p0, y0=yb)   # 拉到最近（室內 2.2 m）
            await yaws(pg, run, 'dorm_%s_box' % tag, dist=2.2, pitch=0.85, y0=yb)
        for b in box[:2]:
            c = b['c']; await cine(pg, run, 'dorm_%s_%s' % (tag, b['n']), [c[0] + 0.8, 0.95, c[2] + 0.5], c)
        for t in tape[:3]:
            c = t['c']; await cine(pg, run, 'dorm_%s_%s' % (tag, t['n']), [c[0] + 0.2, c[1] + 1.25, c[2] + 0.55], c)
        if tape:
            c = tape[0]['c']; at = await put(pg, c[0] + 0.5, c[2]); print('   玩家放到膠帶旁', at, flush=True)
            await yaws(pg, run, 'dorm_%s_tape_player' % tag, n=2, dist=2.2, pitch=0.95)
async def c208(pg, run):
    await pg.evaluate("(()=>{ Object.assign(GAME.G.flags,{US_DEPARTED:true,US_ARRIVED:true}); })()")
    for h in (17.75, 19.0):
        await enter(pg, 'us_shared', h); run.setup('[捷徑] us_shared %.2f（旗標 US_DEPARTED、US_ARRIVED；日期仍是 9/25 存檔那天）' % h)
        print('   us_shared', h, await pg.evaluate("GAME.G.zone"), await player_pos(pg), flush=True)
        await yaws(pg, run, 'c208_%02d_corridor' % int(h))
        if h == 17.75: print('   物件名稱（前 400）', json.dumps(await pg.evaluate(NAMES), ensure_ascii=False), flush=True)
        items = await pg.evaluate(FIND + "('noodle|polaroid|life_|coat|CEILINGLIGHT|EVENT_US2')")
        print('   室內物件', json.dumps(items, ensure_ascii=False), flush=True)
        d0, p0 = await pg.evaluate("[GAME.E.cam.distTarget, GAME.E.cam.pitch]")
        at = await put(pg, -1.0, 2.2); print('   玩家放到門口', at, flush=True)
        await yaws(pg, run, 'c208_%02d_door_default' % int(h), n=1, dist=d0, pitch=p0, y0=0.0)   # 一進門面向北（客廳），鏡頭在背後
        await yaws(pg, run, 'c208_%02d_door' % int(h), dist=2.6, y0=0.0)
        at = await put(pg, 0.9, -0.6); print('   玩家放到 A、B 門前（臥室不能進）', at, flush=True)
        await yaws(pg, run, 'c208_%02d_bedside_default' % int(h), n=1, dist=d0, pitch=p0, y0=1.5708)   # 面向西（沙發、版畫），鏡頭在東邊
        await yaws(pg, run, 'c208_%02d_bedside_east' % int(h), n=1, dist=2.6, pitch=p0, y0=-1.5708)   # 面向東（A、B 門）
        shots = [('bedB_inside', [3.0, 1.45, 0.55], [1.45, 1.35, -0.2]), ('bdoor_living', [0.2, 1.5, 0.35], [1.4, 1.45, -0.2]),
                 ('kitlamp_under', [-2.9, 1.35, 1.55], [-3.2, 2.58, 2.0]), ('kitlamp_side', [-2.0, 1.55, 2.6], [-3.2, 2.5, 2.0]),
                 ('art', [-2.5, 1.6, -1.2], [-4.5, 1.72, -1.2]), ('polaroid', [-3.35, 1.6, -2.2], [-4.5, 1.6, -2.6])]
        for nm, pos, look in shots: await cine(pg, run, 'c208_%02d_%s' % (int(h), nm), pos, look)
        ev = await pg.evaluate("(()=>{ const z=GAME.E.zone; if(z&&z.us2){ z.us2(true); return 'us2(true)'; } let n=0; GAME.E.scene.traverse(o=>{ if(o.name==='EVENT_US2'){ o.visible=true; n++; } }); return 'EVENT_US2 visible x'+n; })()")
        run.setup('[捷徑] 打開 US2 道具（%s；平常藏著，9/13 演出才開）' % ev)
        for nm, pos, look in (('noodle_living', [-3.0, 1.45, 0.25], [-3.0, 1.05, 1.18]), ('noodle_kitchen', [-3.05, 1.55, 2.25], [-3.0, 1.05, 1.18]), ('noodle_wide', [-1.6, 1.6, -0.3], [-3.0, 1.0, 1.4])):
            await cine(pg, run, 'c208_%02d_%s' % (int(h), nm), pos, look)
        await pg.evaluate("(()=>{ const z=GAME.E.zone; if(z&&z.us2) z.us2(false); else GAME.E.scene.traverse(o=>{ if(o.name==='EVENT_US2') o.visible=false; }); })()")
        at = await put(pg, -2.6, 1.9); print('   玩家放到廚房旁', at, flush=True)
        await yaws(pg, run, 'c208_%02d_kitchen_player' % int(h), dist=2.6)
async def main():
    run = L.Run('artrev2', OUT); base = json.load(open(SAVE, encoding='utf-8'))
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        await L.load_state(pg, base.get('G', base)); await pg.wait_for_timeout(6000); run.setup('讀 9/25 存檔')
        await section(run, '體育館', gym(pg, run))
        await section(run, '203', dorm(pg, run))
        await section(run, 'C208', c208(pg, run))
        run.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
    run.finish()
asyncio.run(main())
