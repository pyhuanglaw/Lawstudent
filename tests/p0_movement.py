"""P0 回歸測試：霖澤館前（與其他出生點）玩家必須能用手機虛擬搖桿移動。
流程：BOOT → 讀檔出生在霖澤館前 → 搖桿上（位置必須改變）→ 搖桿左／右（轉向／移動）→ 跑 → 觸發對話 → 結束對話 → 移動必須恢復 → 存檔 → 重新讀取 → 移動仍正常。
用 iPhone 直向 viewport（390×844）＋ CDP 觸控事件直接按在 #joy 上（不是鍵盤）。
用法：python3 tests/p0_movement.py [URL]   （預設 http://127.0.0.1:8765/build/index.html）"""
import asyncio, json, sys, math
from playwright.async_api import async_playwright
URL=(sys.argv[1] if len(sys.argv)>1 else 'http://127.0.0.1:8765/build/index.html')+'?turbo'
SPAWNS=[('霖澤館前（教室出口）','campus',{'x':34,'z':-99,'yaw':0}),('霖澤館門口','campus',{'x':34,'z':-101,'yaw':0}),('校園預設出生點','campus',{'x':34,'z':-98,'yaw':0}),('宿舍門口','campus',{'x':20,'z':54,'yaw':3.1416}),('公館麵店門口','gongguan',{'x':-63,'z':48,'yaw':3.1416}),('公館便利商店門口','gongguan',{'x':-19,'z':48,'yaw':3.1416}),('校門外','gongguan',{'x':-2.5,'z':-29,'yaw':0}),('溫州街','wenzhou',{'x':40,'z':-1,'yaw':-1.5708})]
async def joystick(pg,cdp,dx,dy,ms):
    jx,jy=await pg.evaluate("(()=>{ const r=document.getElementById('joy').getBoundingClientRect(); return [r.left+r.width/2, r.top+r.height/2]; })()")
    await cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':jx,'y':jy}]})
    steps=max(4,ms//80)
    for i in range(steps):
        await cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':jx+dx,'y':jy+dy}]}); await pg.wait_for_timeout(80)
    await cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
async def pos(pg): return await pg.evaluate("(()=>{ const o=GAME.E.player.obj; return {x:+o.position.x.toFixed(2),z:+o.position.z.toFixed(2),yaw:+o.rotation.y.toFixed(2),pose:GAME.E.player.pose,busy:GAME.E.player.busy,cam:GAME.E.cam.mode}; })()")
def dist(a,b): return math.hypot(a['x']-b['x'],a['z']-b['z'])
async def main():
    fails=[]
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium',args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        ctx=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=1,has_touch=True,is_mobile=True,user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1')
        pg=await ctx.new_page(); msgs=[]
        pg.on('console', lambda m: msgs.append(m.type+': '+m.text) if m.type in ('error','warning') and '404' not in m.text and 'portrait missing' not in m.text and 'ERR_TUNNEL' not in m.text else None)
        pg.on('pageerror', lambda e: msgs.append('PAGEERROR: '+str(e)))
        await pg.goto(URL); await pg.wait_for_timeout(9000)
        cdp=await ctx.new_cdp_session(pg)
        await pg.evaluate("document.getElementById('rotate').classList.remove('want')")
        def check(name,ok,info=''):
            print(('PASS ' if ok else 'FAIL ')+name+('  '+info if info else ''))
            if not ok: fails.append(name)
        for label,zone,sp in SPAWNS:
            st={'day':8,'weekday':4,'hour':13.3,'zone':zone,'pos':sp,'weather':'sunny','flags':{'introDone':True,'campusIntro':True,'classDone':True,'metAn':True,'met_an':True,'afternoonDone':True,'lawclub':True},'visited':{'dorm':True,'campus':True,'gongguan':True,'wenzhou':True,'classroom':True},'social':{'rel':{},'mem':{},'reveal':{},'prof':{},'grad':{'interest':'NONE','field':None,'prep':0}}}
            js="(async()=>{ const s=GAME.defaults('祐廷'); Object.assign(s,"+json.dumps(st,ensure_ascii=False)+"); document.getElementById('titleScreen').classList.add('hide'); await GAME.applySave(s); })()"
            await pg.evaluate(js); await pg.wait_for_timeout(1500)
            p0=await pos(pg); await joystick(pg,cdp,0,-60,1200); p1=await pos(pg)
            check(f'{label}：搖桿上 → 位置改變', dist(p0,p1)>0.3, f'{p0} → {p1}')
            await joystick(pg,cdp,60,0,900); p2=await pos(pg)
            check(f'{label}：搖桿右 → 移動／轉向', dist(p1,p2)>0.2 or abs(p2['yaw']-p1['yaw'])>0.2, f'{p2}')
            await joystick(pg,cdp,-60,0,900); p3=await pos(pg)
            check(f'{label}：搖桿左 → 移動／轉向', dist(p2,p3)>0.2 or abs(p3['yaw']-p2['yaw'])>0.2, f'{p3}')
            if label.startswith('霖澤館前'):
                await pg.screenshot(path='screenshots/A_linze_move_01.png')
                await joystick(pg,cdp,0,-58,1600); p4=await pos(pg)  # 幾乎推到底 → 跑
                check('霖澤館前：推到底 → 跑', p4['pose'] in ('run','walk') or dist(p3,p4)>1.0, f'{p4}')
                await pg.screenshot(path='screenshots/A_linze_move_02.png')
                # 點地面走路（tap-to-move）
                await cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':230,'y':400}]}); await pg.wait_for_timeout(60); await cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
                await pg.wait_for_timeout(2500); p5=await pos(pg)
                check('霖澤館前：點地面 → 走過去', dist(p4,p5)>0.3, f'{p5}')
                # 對話（阿哲／任一 NPC 或事件）→ 結束 → 恢復移動
                await pg.evaluate("void EVENTS.run(STORY_EVENTS.find(e=>e.id==='ev_bike_flat'))"); await pg.wait_for_timeout(2500)
                busy=await pg.evaluate("GAME.E.player.busy||GAME.D.active"); check('事件中玩家鎖定', busy)
                await joystick(pg,cdp,0,-60,700); p6=await pos(pg); check('事件中搖桿不移動', dist(p5,p6)<0.3, f'{p6}')
                for i in range(60):
                    r=await pg.evaluate("(()=>{ if(GAME.D.active){ GAME.dlgAdvance(); GAME.dlgAdvance(); return 'adv'; } const b=document.querySelectorAll('#choices button'); if(b.length&&!document.getElementById('choices').classList.contains('hide')){ b[0].click(); return 'click'; } return EVENTS.running?'wait':'done'; })()")
                    await pg.wait_for_timeout(300)
                    if r=='done': break
                await pg.wait_for_timeout(800); p7=await pos(pg)
                check('對話結束後 busy 解除', not p7['busy'] and p7['cam']=='follow', f'{p7}')
                await joystick(pg,cdp,0,-60,1200); p8=await pos(pg)
                check('對話結束後移動恢復', dist(p7,p8)>0.3, f'{p7} → {p8}')
                # 存檔 → 重新讀取 → 移動
                await pg.evaluate("GAME.autosave()")
                await pg.evaluate("(async()=>{ const s=JSON.parse(localStorage.getItem('fatiao3d_auto')||'null'); if(s) await GAME.applySave(s); })()"); await pg.wait_for_timeout(1500)
                p9=await pos(pg); await joystick(pg,cdp,0,-60,1200); p10=await pos(pg)
                check('讀檔後移動仍正常', dist(p9,p10)>0.3, f'{p9} → {p10}')
                await pg.screenshot(path='screenshots/A_linze_move_03_after_reload.png')
        print('console:',msgs[:5])
        await b.close()
    print('RESULT:', 'ALL PASS' if not fails else f'{len(fails)} FAIL → '+'; '.join(fails))
    sys.exit(0 if not fails else 1)
asyncio.run(main())
