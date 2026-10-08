"""第一、二天固定劇情回歸：新遊戲 → 宿舍 intro → 校園早上 → 上課 → 小安追上來 → 咖啡廳 → 麵店 → 睡覺（直接串接各場景）。"""
import asyncio, json, sys
from playwright.async_api import async_playwright
URL='http://127.0.0.1:8765/build/index.html?turbo&lowres'
DRIVER=r"""
window.__sleep=ms=>new Promise(r=>setTimeout(r,ms));
window.__drive=async function(maxMs,pick){ pick=pick||0; const t0=performance.now(); let lines=[]; let idle=0; while(performance.now()-t0<maxMs){ await __sleep(50);
  if(GAME.D.active){ idle=0; if(lines.length<400) lines.push((document.getElementById('dlgName').textContent||'')+'：'+GAME.D.full); GAME.dlgAdvance(); await __sleep(15); GAME.dlgAdvance(); continue; }
  const ch=document.getElementById('choices'); if(!ch.classList.contains('hide')){ const b=ch.querySelectorAll('button'); if(b.length){ idle=0; const i=Math.min(pick,b.length-1); lines.push('▶'+b[i].innerText.replace(/\n/g,' | ')); b[i].click(); await __sleep(60); continue; } }
  if(!GAME.E.player.busy&&!EVENTS.running){ idle+=50; if(idle>3000) break; } else idle=0; }
  return {lines, day:GAME.G.day, hour:+GAME.G.hour.toFixed(2), zone:GAME.G.zone, flags:Object.keys(GAME.G.flags).filter(k=>GAME.G.flags[k]===true), goal:GAME.G.goal, busy:GAME.E.player.busy, adv:ADV.active}; };
window.__use=async function(sub){ const it=GAME.E.interactables.find(i=>(i.label||'').includes(sub)); if(!it) return 'NO '+sub; const P=GAME.E.player; P.obj.position.set(it.x,0,it.z+0.3); P.path=null; GAME.updateInteract(); await __sleep(80); GAME.updateInteract(); GAME.doInteract(); return 'used '+it.label; };
1;
"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        ctx=await b.new_context(viewport={'width':844,'height':390},device_scale_factor=1,has_touch=True)
        pg=await ctx.new_page(); msgs=[]
        pg.on('console', lambda m: msgs.append(m.type+': '+m.text) if m.type in ('error','warning') and '404' not in m.text and 'portrait missing' not in m.text and 'ERR_TUNNEL' not in m.text else None)
        pg.on('pageerror', lambda e: msgs.append('PAGEERROR: '+str(e)))
        await pg.goto(URL); await pg.wait_for_timeout(6000)
        await pg.evaluate(DRIVER)
        def show(tag,r):
            print(f"== {tag}: day{r['day']} {r['hour']} {r['zone']} busy={r['busy']} adv={r['adv']} goal={r['goal']}")
            for l in r['lines'][:3]+(['…'] if len(r['lines'])>6 else [])+r['lines'][-3:]: print('   ',l[:80])
            print('    flags',r['flags'])
        # 1 新遊戲
        await pg.fill('#nameInput','祐廷'); await pg.click('#btnNew'); await pg.wait_for_timeout(1500)
        r=await pg.evaluate("__drive(40000)"); show('intro',r); await pg.screenshot(path='shots/flow_01_intro.png')
        # 2 宿舍：讀案例（書桌）→ 出門
        print(await pg.evaluate("__use('書桌')")); r=await pg.evaluate("__drive(20000)"); show('desk',r)
        print(await pg.evaluate("__use('睡覺')")); r=await pg.evaluate("__drive(30000)"); show('sleep1',r)
        print(await pg.evaluate("__use('離開宿舍')")); r=await pg.evaluate("__drive(40000)"); show('leave dorm / campus morning',r); await pg.screenshot(path='shots/flow_02_morning.png')
        # 4 上課：週四 13:00 進教室
        await pg.evaluate("GAME.G.hour=12.95; GAME.E.hour=12.95;")
        print(await pg.evaluate("__use('進入霖澤館')")); r=await pg.evaluate("__drive(90000,1)"); show('class',r); await pg.screenshot(path='shots/flow_03_class.png')
        # 5 下課：離開教室 → 小安追上來
        print(await pg.evaluate("__use('離開教室')")); r=await pg.evaluate("__drive(8000,0)"); await pg.evaluate("GAME.E.player.obj.position.set(34,0,-88)")
        for i in range(40):
            await pg.wait_for_timeout(1000)
            if await pg.evaluate("!!GAME.G.flags.metAn"): break
        r=await pg.evaluate("__drive(120000,0)"); show('meetAn',r); await pg.screenshot(path='shots/flow_04_meetan.png')
        # 6 跟小安走：直接進咖啡廳（若 plan 是 cafe）或圖書館
        plan=await pg.evaluate("GAME.G.flags.plan||''"); comp=await pg.evaluate("GAME.G.flags.companion||''"); print('plan',plan,'companion',comp)
        target='cafe' if plan!='library' else 'library'
        await pg.evaluate(f"GAME.enter('{target}',undefined,{{noFade:true}})"); r=await pg.evaluate("__drive(90000,2)"); show(target,r); await pg.screenshot(path=f'shots/flow_05_{target}.png')
        # 7 晚上麵店（公館）
        await pg.evaluate("GAME.enter('gongguan',{x:-20,z:40,yaw:0},{noFade:true})"); r=await pg.evaluate("__drive(20000)"); show('gongguan',r)
        print(await pg.evaluate("__use('麵店')")); r=await pg.evaluate("__drive(60000,1)"); show('noodle',r); await pg.screenshot(path='shots/flow_06_noodle.png')
        # 8 回宿舍睡覺
        await pg.evaluate("GAME.enter('dorm',{x:0,z:2.4,yaw:Math.PI},{noFade:true})"); r=await pg.evaluate("__drive(20000)"); show('dorm night',r)
        print(await pg.evaluate("__use('睡覺')")); r=await pg.evaluate("__drive(60000,0)"); show('sleep',r)
        # 9 第三天自由：檢查存檔往返
        s=await pg.evaluate("JSON.stringify(GAME.snapshot?GAME.snapshot():null)")
        print('snapshot bytes',len(s) if s else None)
        await pg.evaluate("GAME.applySave(JSON.parse(localStorage.getItem('fatiao3d_auto')||'null')||GAME.snapshot())"); await pg.wait_for_timeout(1500)
        r=await pg.evaluate("__drive(5000)"); show('after reload',r)
        print('console issues:',len(msgs)); [print('  ',m[:300]) for m in msgs[:20]]
        await b.close()
asyncio.run(main())
