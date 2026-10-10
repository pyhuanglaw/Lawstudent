"""在實際遊戲裡拍指定場景（不是合成圖）：讀入一個存檔狀態 → 等模型載入 → 設定鏡頭 → 截圖。
用法：python3 tools/shots/scene_shot.py <URL> <shots.json>
shots.json：[{ "out":"path.png", "w":1536, "h":1024, "mobile":false,
  "state":{ "zone":"wenzhou","hour":17.5,"pos":{"x":..,"z":..,"yaw":..},"flags":{...} },
  "companion":{"dx":..,"dz":..,"yaw":..}  # 選用：把同行的小安放到玩家旁邊的位置（遊戲內 NPC，不是貼圖）
  "cam":{"pos":[x,y,z],"look":[x,y,z]} 或 {"yaw":..,"pitch":..,"dist":..},   # 演出鏡頭（E.cinematic）或一般跟隨鏡頭
  "hud":true/false, "wait":3000 }]
鏡頭位置與人物站位由腳本設定（類似拍照模式）；畫面是遊戲引擎即時算圖。"""
import asyncio, json, sys
from playwright.async_api import async_playwright
UA='Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
FLAGS={'introDone':True,'campusIntro':True,'classDone':True,'metAn':True,'met_an':True,'afternoonDone':True,'lawclub':True,'wenzhouLine':True}
async def main():
    url=sys.argv[1]; shots=json.load(open(sys.argv[2]))
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/opt/pw-browsers/chromium',args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        for s in shots:
            mobile=s.get('mobile',False)
            ctx=await b.new_context(viewport={'width':s.get('w',1536),'height':s.get('h',1024)},device_scale_factor=1,has_touch=mobile,is_mobile=mobile,user_agent=UA if mobile else None)
            pg=await ctx.new_page(); errs=[]
            pg.on('pageerror',lambda e: errs.append(str(e)))
            await pg.goto(url)
            for i in range(240):
                if await pg.evaluate("!!(window.GAME&&document.getElementById('loading')&&document.getElementById('loading').classList.contains('hide'))"): break
                await pg.wait_for_timeout(500)
            st=dict(s['state']); fl=dict(FLAGS); fl.update(st.get('flags',{})); st['flags']=fl
            js="(async()=>{ const s=GAME.defaults('祐廷'); Object.assign(s,%s); s.day=s.day||8; s.weekday=s.weekday||6; s.weather=s.weather||'sunny'; document.getElementById('titleScreen').classList.add('hide'); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; await GAME.applySave(s); })()" % json.dumps(st,ensure_ascii=False)
            await pg.evaluate(js)
            await pg.evaluate("document.getElementById('rotate')&&document.getElementById('rotate').classList.remove('want')")
            # 等人物模型（VRM）載入完成
            for i in range(120):
                ok=await pg.evaluate("(()=>{ const E=GAME.E; const all=[E.player].concat(E.npcs); return all.every(n=>{ const m=n.obj.userData&&n.obj.userData.model; return !m||!m.userData||m.userData.driver!=='pending'; }); })()")
                if ok: break
                await pg.wait_for_timeout(500)
            if s.get('companion'):
                c=s['companion']
                await pg.evaluate("""(c=>{ const E=GAME.E, P=E.player.obj; const an=E.npcs.find(n=>n.id==='an'); if(!an) return 'no companion';
                  if('x' in c){ an.obj.position.set(c.x,0,c.z); } else { an.obj.position.set(P.position.x+c.dx,0,P.position.z+c.dz); }
                  an.obj.rotation.y=c.yaw; an.path=null; an.beh='idle'; an.frozen=true; an.speed=0; an.waveT=0; an.greet=false; an.pose=an.idlePose||'idle'; if(c.pose){ an.pose=c.pose; an.idlePose=c.pose; } if(c.lookAt) an.lookAt={x:c.lookAt[0],z:c.lookAt[1]}; })(%s)""" % json.dumps(c))
            if s.get('player'):
                await pg.evaluate("""(c=>{ const P=GAME.E.player; if(c.pose){ P.pose=c.pose; } if(c.lookAt) P.lookAt={x:c.lookAt[0],z:c.lookAt[1]}; })(%s)""" % json.dumps(s['player']))
            # 在場景裡生成指定人物（遊戲本身的 spawnCharacter：同一個 character_id 的 3D 模型、配件、身高）
            if s.get('hideNPCs'):
                await pg.evaluate("GAME.E.npcs.slice().forEach(n=>{ if(n.id!=='an') n.obj.visible=false; })")
            for sp in s.get('spawn',[]):
                r=await pg.evaluate("""(c=>{ const n=GAME.spawnCharacter(c.id,c.x,c.z,{yaw:c.yaw||0}); if(!n) return 'NO '+c.id; n.obj.position.set(c.x,0,c.z); n.obj.rotation.y=c.yaw||0; n.obj.visible=true; n.path=null; n.beh='idle'; n.frozen=true; n.greet=false; n.waveT=0; n.speed=0; n.pose=c.pose||'idle'; n.idlePose=n.pose; if(c.lookAt) n.lookAt={x:c.lookAt[0],z:c.lookAt[1]}; return n.charId+':'+(n.obj.userData&&n.obj.userData.driver)+':'+(n.obj.userData&&n.obj.userData.key); })(%s)""" % json.dumps(sp))
                print('   spawn',r)
            if s.get('hidePlayer'):
                await pg.evaluate("GAME.E.player.obj.visible=false")
            if s.get('js'): await pg.evaluate(s['js'])
            # 拍照模式：截圖這幾秒不眨眼（眨眼時間是隨機的，避免剛好拍到閉眼）
            await pg.evaluate("[GAME.E.player].concat(GAME.E.npcs).forEach(n=>{ const u=n.obj&&n.obj.userData; if(u&&u.anim){ u.anim.blink=1e9; u.anim.blinkT=0; } })")
            if 'hour' in s.get('state',{}): await pg.evaluate("GAME.E.applyTime(%s)" % s['state']['hour'])
            cam=s.get('cam',{})
            if 'pos' in cam:
                # 演出鏡頭（遊戲內的 E.cinematic）；拍照時直接切到定位，不等平滑移動
                await pg.evaluate("((p,l)=>{ const E=GAME.E; E.cinematic(new THREE.Vector3(...p),new THREE.Vector3(...l)); E.camera.position.set(...p); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look); })(%s,%s)" % (json.dumps(cam['pos']),json.dumps(cam['look'])))
            elif cam:
                await pg.evaluate("(c=>{ const C=GAME.E.cam; C.mode='follow'; C.yaw=c.yaw; C.pitch=c.pitch; C.distTarget=c.dist; C.dist=c.dist; C.manualT=999; })(%s)" % json.dumps(cam))
            if s.get('walk'):
                w=s['walk']
                await pg.evaluate("""(w=>{ const E=GAME.E; const n=w.id==='player'?E.player:E.npcs.find(k=>k.charId===w.id||k.id===w.id); if(!n) return; if(w.id==='player'){ n.path=E.nav.path(n.obj.position.x,n.obj.position.z,w.to[0],w.to[1]); } else { n.frozen=false; n.beh='route'; n.waypoints=[w.to,[n.obj.position.x,n.obj.position.z]]; n.ri=0; n.walkSpeed=1.3; n.pauseAt=false; } })(%s)""" % json.dumps(w))
            if not s.get('hud',False):
                await pg.add_style_tag(content="#hud,#hudR,#joy,#interact,#minimap,#btnMenu,#btnRun,#ctlR,#goal,#toast,#caption,#clock,#bar,#energy,#money,#mdbg,#fps,#devErr,#rotate{display:none!important}")
            await pg.wait_for_timeout(s.get('wait',4000))
            info=await pg.evaluate("(()=>{ const E=GAME.E, P=E.player.obj.position, C=E.camera.position; return {zone:GAME.G.zone, player:[+P.x.toFixed(2),+P.z.toFixed(2)], cam:[+C.x.toFixed(2),+C.y.toFixed(2),+C.z.toFixed(2)], mode:E.cam.mode}; })()")
            await pg.screenshot(path=s['out']); print('shot',s['out'],info,'errors:',errs[:3])
            await ctx.close()
        await b.close()
asyncio.run(main())
