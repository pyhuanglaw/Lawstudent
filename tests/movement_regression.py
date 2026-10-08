"""MOVEMENT REGRESSION（手機直向 390×844、CDP 觸控直接按虛擬搖桿；所有斷言都以「玩家 world position 真的改變」為準，不看動畫）
TEST A 宿舍：spawn → 前進 → 左轉 → 走 → 跑 → 撞牆 → 沿牆滑 → 離開牆 → 繼續走（不能永久卡住）
TEST B 互動：走到書桌 → 坐下／讀書 → 起身 → 前進；圖書館座位 坐下 → 起身 → 前進
TEST C ADV：觸發 NPC ADV → 結束 → 前進 ≥5 m
TEST D 存檔：自由移動 → save → reload → 前進 ≥5 m
TEST E 區域：宿舍／霖澤館前／椰林大道／教室／咖啡廳：spawn → walk → run → turn → interact → exit → walk
用法：python3 tests/movement_regression.py [URL]（預設 build/index.html）"""
import asyncio, json, sys, math
from playwright.async_api import async_playwright
BASE=(sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8765/build/index.html')
URL=BASE+'?turbo'
FLAGS={'introDone':True,'campusIntro':True,'classDone':True,'metAn':True,'met_an':True,'afternoonDone':True,'lawclub':True}
def state(zone,pos,**kw):
    st={'day':8,'weekday':1,'hour':10.5,'zone':zone,'pos':pos,'weather':'sunny','flags':dict(FLAGS),'visited':{'dorm':True,'campus':True,'gongguan':True,'wenzhou':True,'classroom':True,'library':True,'cafe':True},'social':{'rel':{},'mem':{},'reveal':{},'prof':{},'grad':{'interest':'NONE','field':None,'prep':0}}}
    st.update(kw); return st
results=[]
def check(name,ok,info=''):
    print(('PASS ' if ok else 'FAIL ')+name+('   '+info if info else '')); results.append((name,ok))
def dist(a,b): return math.hypot(a['x']-b['x'],a['z']-b['z'])
class Rig:
    def __init__(s,pg,cdp): s.pg=pg; s.cdp=cdp
    async def load(s,st):
        js="(async()=>{ const s=GAME.defaults('祐廷'); Object.assign(s,"+json.dumps(st,ensure_ascii=False)+"); document.getElementById('titleScreen').classList.add('hide'); await GAME.applySave(s); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; })()"
        await s.pg.evaluate(js); await s.pg.wait_for_timeout(1200)
    async def pos(s): return await s.pg.evaluate("(()=>{ const P=GAME.E.player; const o=P.obj; return {x:+o.position.x.toFixed(2),z:+o.position.z.toFixed(2),yaw:+o.rotation.y.toFixed(2),pose:P.pose,busy:P.busy,cam:GAME.E.cam.mode,blocked:P.blockedAt?P.blockedAt.slide:null,stand:GAME.E.canStand(o.position.x,o.position.z,0.3)}; })()")
    async def joy(s,dx,dy,ms):
        jx,jy=await s.pg.evaluate("(()=>{ const r=document.getElementById('joy').getBoundingClientRect(); return [r.left+r.width/2, r.top+r.height/2]; })()")
        await s.cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':jx,'y':jy}]})
        for i in range(max(3,ms//80)):
            await s.cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':jx+dx,'y':jy+dy}]}); await s.pg.wait_for_timeout(80)
        await s.cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]}); await s.pg.wait_for_timeout(120)
    async def drive(s,maxIter=80,pick=0):
        for i in range(maxIter):
            r=await s.pg.evaluate("(()=>{ if(GAME.D.active){ GAME.dlgAdvance(); GAME.dlgAdvance(); return 'adv'; } const b=document.querySelectorAll('#choices button'); if(b.length&&!document.getElementById('choices').classList.contains('hide')){ b[%d<b.length?%d:b.length-1].click(); return 'click'; } return (GAME.E.player.busy||EVENTS.running)?'wait':'done'; })()" % (pick,pick))
            await s.pg.wait_for_timeout(250)
            if r=='done': break
        await s.pg.wait_for_timeout(500)
    async def use(s,label):
        # 有 NPC 坐著的座位遊戲不讓玩家坐（v9 起），所以挑沒人坐的那一個；放玩家時用 unstick 保證半徑 0.3 也站得下（nearestFree 只看單一格）
        return await s.pg.evaluate("(async(sub)=>{ const E=GAME.E; const occ=st=>E.npcs.some(n=>n.seat&&Math.hypot(n.seat.x-st.x,n.seat.z-st.z)<0.35); const it=E.interactables.find(i=>(i.label||'').includes(sub)&&!(i.seat&&occ(i.seat))); if(!it) return 'NO '+sub; const P=E.player; const nf=E.nav.nearestFree(it.x,it.z+0.6,6)||[it.x,it.z]; P.obj.position.set(nf[0],0,nf[1]); E.unstick(P,6); P.path=null; GAME.updateInteract(); await new Promise(r=>setTimeout(r,80)); GAME.updateInteract(); const ni=E.nearestInteractable(); GAME.doInteract(); return 'used '+it.label+' @'+it.x.toFixed(1)+','+it.z.toFixed(1)+' nearest='+(ni&&ni.label); })('%s')" % label)
    async def forward(s,ms=2200):
        a=await s.pos(); await s.joy(0,-60,ms); b=await s.pos(); return a,b
    async def best(s,ms=1400):
        # 室內空間小：四個方向各推一次，回傳位移最大的一次（證明「能走」，不是「往牆推」）
        a=await s.pos(); bestd=0; bestb=a; bestdir=None
        for name,(dx,dy) in {'up':(0,-60),'down':(0,60),'left':(-60,0),'right':(60,0)}.items():
            p0=await s.pos(); await s.joy(dx,dy,ms); p1=await s.pos(); d=dist(p0,p1)
            if d>bestd: bestd=d; bestb=p1; bestdir=name
        return a,bestb,bestd,bestdir
async def test_A(rig):
    print('--- TEST A 宿舍')
    await rig.load(state('dorm',{'x':0,'z':2.8,'yaw':3.1416}))
    a,b=await rig.forward(2600); check('A1 宿舍 spawn → 前進 ≥ 3 m', dist(a,b)>=3.0, f'{a} → {b}')
    await rig.joy(-60,0,700); c=await rig.pos(); check('A2 左（轉向＋位移）', dist(b,c)>0.2 or abs(c['yaw']-b['yaw'])>0.3, f'{c}')
    await rig.joy(0,40,900); d=await rig.pos(); check('A3 走（半推，往回）位置改變', dist(c,d)>0.3, f'{d} pose={d["pose"]}')
    await rig.joy(0,60,900); e=await rig.pos(); check('A4 跑（推到底）位置改變', dist(d,e)>0.5, f'{e} pose={e["pose"]}')
    # 撞牆：往前牆持續推 3 秒（會撞到書架／牆）
    await rig.joy(0,-60,3200); f=await rig.pos(); check('A5 撞牆後仍在合法位置（standable，沒有陷進去）', f['stand'] and f['blocked'] is not None, f'{f}')
    await rig.joy(45,-45,1500); g=await rig.pos(); check('A6 斜推 → 沿牆滑動（x 改變）', abs(g['x']-f['x'])>0.3, f'{f} → {g}')
    await rig.joy(0,60,1500); h=await rig.pos(); check('A7 離開牆 → 繼續走', dist(g,h)>0.8, f'{h}')
    await rig.pg.screenshot(path='screenshots/T_A_dorm_move.png')
async def test_B(rig):
    print('--- TEST B 互動（坐下→起身→走）')
    await rig.load(state('dorm',{'x':0,'z':2.0,'yaw':3.1416}))
    print(await rig.use('坐在書桌前')); await rig.pg.wait_for_timeout(1500)
    await rig.drive(pick=0)   # 讀書
    p=await rig.pos(); check('B1 起身後位置合法（standable）且無 seat/busy', p['stand'] and not p['busy'], f'{p}')
    a,b,d,dr=await rig.best(1600); check('B2 起身後能走（最佳方向位移 ≥ 1.2 m，宿舍空間有限）', d>=1.2, f'{a} → {b} via {dr}')
    await rig.pg.screenshot(path='screenshots/T_B_after_desk.png')
    await rig.load(state('library',{'x':0,'z':6.5,'yaw':3.1416}))
    print(await rig.use('坐下讀書')); await rig.pg.wait_for_timeout(1500)
    await rig.drive(pick=99)  # 最後一項＝起身
    p=await rig.pos(); check('B3 圖書館起身後 standable、不 busy', p['stand'] and not p['busy'], f'{p}')
    a,b,d,dr=await rig.best(1800); check('B4 圖書館起身後能走（最佳方向 ≥ 2 m）', d>=2.0, f'{a} → {b} via {dr}')
async def test_C(rig):
    print('--- TEST C ADV 結束後移動')
    await rig.load(state('campus',{'x':78,'z':-52,'yaw':1.5708},weather='rain'))
    await rig.pg.evaluate("void EVENTS.run(STORY_EVENTS.find(e=>e.id==='ev_rain_library_door'))"); await rig.pg.wait_for_timeout(3000)
    p=await rig.pos(); check('C1 ADV 中玩家鎖定', p['busy'])
    await rig.pg.screenshot(path='screenshots/T_C_adv.png')
    await rig.drive(pick=0)
    p=await rig.pos(); check('C2 ADV 結束後解鎖（busy=false, cam=follow）', (not p['busy']) and p['cam']=='follow', f'{p}')
    a,b=await rig.forward(3200); check('C3 ADV 結束後前進 ≥ 5 m', dist(a,b)>=5.0, f'{a} → {b}')
    await rig.pg.screenshot(path='screenshots/T_C_after_adv_move.png')
async def test_D(rig):
    print('--- TEST D save → reload → 走')
    await rig.load(state('campus',{'x':-40,'z':-5,'yaw':-1.5708}))
    await rig.joy(0,-60,1500); await rig.pg.evaluate("GAME.autosave()")
    await rig.pg.evaluate("(async()=>{ const s=JSON.parse(localStorage.getItem('fatiao3d_auto')); await GAME.applySave(s); })()"); await rig.pg.wait_for_timeout(1500)
    p=await rig.pos(); check('D1 reload 後未鎖定', (not p['busy']) and p['cam']=='follow', f'{p}')
    a,b=await rig.forward(3200); check('D2 reload 後前進 ≥ 5 m', dist(a,b)>=5.0, f'{a} → {b}')
    await rig.pg.screenshot(path='screenshots/T_D_after_reload.png')
async def test_E(rig):
    print('--- TEST E 各區域')
    zones=[('宿舍','dorm',{'x':0,'z':2.8,'yaw':3.1416},'坐在書桌前',1.5),('霖澤館前','campus',{'x':34,'z':-99,'yaw':0},'進入霖澤館',5.0),('椰林大道','campus',{'x':-40,'z':-5,'yaw':-1.5708},'坐在椰林大道的長椅上',5.0),('教室','classroom',{'x':0,'z':4.6,'yaw':3.1416},'坐下',2.0),('咖啡廳','cafe',{'x':0,'z':4.6,'yaw':3.1416},'坐在窗邊的雙人桌',2.0)]
    for name,zone,pos,inter,need in zones:
        await rig.load(state(zone,pos,weekday=2,hour=10.3))   # 週二 10:20 刑訴：霖澤館可以進
        a,b=await rig.forward(2400); check(f'E {name}：walk 位置改變', dist(a,b)>=min(need,1.5), f'{a} → {b}')
        await rig.joy(60,0,800); c=await rig.pos(); check(f'E {name}：turn', dist(b,c)>0.2 or abs(c['yaw']-b['yaw'])>0.3, f'{c}')
        _,d,dd,dr=await rig.best(1000); check(f'E {name}：run（最佳方向）', dd>0.5, f'{d} via {dr} pose={d["pose"]}')
        r=await rig.use(inter); print('   ',r); await rig.pg.wait_for_timeout(1500)
        if inter.startswith('進入'):
            # 進了另一區：再走出來
            z=await rig.pg.evaluate("GAME.G.zone"); check(f'E {name}：interact 進入 {z}', z!=zone, z)
            await rig.drive(pick=0); await rig.pg.evaluate("GAME.doInteract()"); await rig.pg.wait_for_timeout(600); await rig.drive(pick=0)
            ex=await rig.pg.evaluate("(async()=>{ const it=GAME.E.interactables.find(i=>i.exit); if(!it) return 'no exit'; const P=GAME.E.player; const nf=GAME.E.nav.nearestFree(it.x,it.z-0.6,6)||[it.x,it.z]; P.obj.position.set(nf[0],0,nf[1]); GAME.updateInteract(); await new Promise(r=>setTimeout(r,80)); GAME.updateInteract(); GAME.doInteract(); return 'exit '+it.label; })()"); print('   ',ex); await rig.pg.wait_for_timeout(2500); await rig.drive(pick=0)
        else:
            await rig.drive(pick=99)
        p=await rig.pos(); check(f'E {name}：interact 結束後未鎖定且 standable', (not p['busy']) and p['stand'], f'{p}')
        a,b,dd,dr=await rig.best(1600); check(f'E {name}：exit 後能走（最佳方向 ≥ 1 m）', dd>=1.0, f'{a} → {b} via {dr}')
        await rig.pg.screenshot(path=f'screenshots/T_E_{zone}.png')
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium',args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        ctx=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=1,has_touch=True,is_mobile=True,user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1')
        pg=await ctx.new_page(); msgs=[]
        pg.on('console', lambda m: msgs.append(m.type+': '+m.text) if m.type in ('error',) and '404' not in m.text and 'ERR_TUNNEL' not in m.text else None)
        pg.on('pageerror', lambda e: msgs.append('PAGEERROR: '+str(e)))
        await pg.goto(URL); await pg.wait_for_timeout(9000)
        cdp=await ctx.new_cdp_session(pg)
        await pg.evaluate("document.getElementById('rotate').classList.remove('want'); GAME.S.mdbg=true; document.getElementById('mdbg').style.display='block';")
        rig=Rig(pg,cdp)
        only=sys.argv[2] if len(sys.argv)>2 else 'ABCDE'
        for t,fn in [('A',test_A),('B',test_B),('C',test_C),('D',test_D),('E',test_E)]:
            if t in only:
                try: await fn(rig)
                except Exception as e: check(f'TEST {t} 執行錯誤', False, str(e)[:200])
        print('console errors:', msgs[:5])
        await b.close()
    bad=[n for n,ok in results if not ok]
    print(f'RESULT: {len(results)-len(bad)}/{len(results)} PASS' + ('' if not bad else '  FAILED: '+' | '.join(bad)))
    sys.exit(0 if not bad else 1)
asyncio.run(main())
