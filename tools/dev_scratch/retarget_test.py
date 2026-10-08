import asyncio, json
from playwright.async_api import async_playwright
URL='http://127.0.0.1:8765/index.html'
JS=r"""
(async()=>{
  const src=ASSETS.getRaw('char.mixamo_clips'), tpl=ASSETS.getRaw('char.rpm_sample');
  const hero=GAME.E.player.obj; const u=hero.userData;
  // 目標 skinned mesh：hero 內的 Wolf3D_Body
  let skin=null; hero.traverse(o=>{ if(o.isSkinnedMesh&&!skin) skin=o; });
  const bones=[]; src.scene.traverse(o=>{ if(/^mixamorig/.test(o.name)){ o.isBone=true; bones.push(o); } }); let root=bones.find(b=>b.name==='mixamorigHips'); bones.splice(bones.indexOf(root),1); bones.unshift(root); const skeleton=new THREE.Skeleton(bones);
  const SU=THREE_JSM.SkeletonUtils; const out={};
  for(const a of src.animations){ const c=SU.retargetClip(skin, skeleton, a, {hip:'mixamorigHips', scale:0.01, getBoneName:b=>'mixamorig'+b.name}); for(const t of c.tracks) t.name=t.name.replace(/^\.bones\[(.+?)\]/,'$1'); c.tracks=c.tracks.filter(t=>!/\.position$/.test(t.name)); out[a.name]=c; }
  // 換掉 hero 的 actions
  const mixer=u.anim.mixer; for(const n in u.anim.actions) u.anim.actions[n].stop(); u.anim.actions={}; for(const n in out){ u.anim.actions[n]=mixer.clipAction(out[n]); } u.anim.cur=null;
  return {tracks:out.idle.tracks.length, names:out.idle.tracks.slice(0,6).map(t=>t.name), skin:skin&&skin.name};
})()
"""
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        ctx=await b.new_context(viewport={'width':844,'height':390},device_scale_factor=1,has_touch=True)
        pg=await ctx.new_page(); msgs=[]
        pg.on('console', lambda m: msgs.append(m.type+': '+m.text) if m.type in ('error',) and '404' not in m.text else None)
        pg.on('pageerror', lambda e: msgs.append('PAGEERROR: '+str(e)))
        await pg.goto(URL); await pg.wait_for_timeout(7000)
        st={'day':14,'weekday':1,'hour':13.0,'zone':'campus','pos':{'x':-40,'z':-5,'yaw':0},'weather':'sunny','flags':{'introDone':True,'classDone':True,'metAn':True,'met_an':True,'afternoonDone':True,'lawclub':True},'visited':{'dorm':True,'campus':True}}
        js="(async()=>{ const s=GAME.defaults('祐廷'); Object.assign(s,"+json.dumps(st,ensure_ascii=False)+"); document.getElementById('titleScreen').classList.add('hide'); await GAME.applySave(s); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; })()"
        await pg.evaluate(js); await pg.wait_for_timeout(1500)
        print(await pg.evaluate(JS))
        await pg.evaluate("GAME.E.cam.yaw=GAME.E.player.obj.rotation.y; GAME.E.cam.manualT=99; GAME.E.cam.distTarget=3.2; GAME.E.cam.pitch=0.12;")
        for i in range(3):
            await pg.wait_for_timeout(900)
            await pg.screenshot(path=f'shots/rt_idle_{i}.png',clip={'x':300,'y':60,'width':250,'height':330})
        await pg.keyboard.down('s')
        for i in range(3):
            await pg.wait_for_timeout(500)
            await pg.screenshot(path=f'shots/rt_walk_{i}.png',clip={'x':300,'y':60,'width':250,'height':330})
        await pg.keyboard.up('s')
        print(await pg.evaluate("(()=>{ const u=GAME.E.player.obj.userData; return {cur:u.anim.cur, y:GAME.E.player.obj.position.y, my:u.model.position.y}; })()"))
        for m in msgs[:5]: print(m)
        await b.close()
asyncio.run(main())
