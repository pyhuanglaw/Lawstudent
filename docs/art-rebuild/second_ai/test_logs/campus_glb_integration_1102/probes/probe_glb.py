"""探針：campus_glb_integration 要改的數字（一般網址＝正式模型那一輪；mode=stub：key 留著、模型不載入的那一輪）。
用法：python3 probe_glb.py <repo> <URL> [formal|stub|delete]"""
import asyncio, json, sys, os
REPO, URL = sys.argv[1], sys.argv[2]
MODE = sys.argv[3] if len(sys.argv) > 3 else 'formal'
sys.path.insert(0, os.path.join(REPO, 'tests'))
from playwright.async_api import async_playwright
import playlib as PL
GLBS = ['campus_library_glb', 'campus_bell_glb', 'campus_admin_glb', 'campus_arts_glb', 'campus_hist_glb', 'campus_pavilion_glb', 'campus_socsci_glb',
        'campus_gongtong_glb', 'campus_freshman_glb', 'campus_gate_glb', 'campus_male1_glb', 'campus_putong_glb', 'campus_boya_glb']
TAGMAP = {'library': 'campus_library_glb', 'bell': 'campus_bell_glb', 'admin': 'campus_admin_glb', 'arts': 'campus_arts_glb', 'hist': 'campus_hist_glb',
          'pavilion': 'campus_pavilion_glb', 'soc': 'campus_socsci_glb', 'gongtong': 'campus_gongtong_glb', 'freshman': 'campus_freshman_glb',
          'gate': 'campus_gate_glb', 'male1': 'campus_male1_glb', 'putong': 'campus_putong_glb', 'boya': 'campus_boya_glb'}
SETTLED = "(async()=>{ for(let i=0;i<480;i++){ const A=ASSETS; const n=Object.keys(A.status).filter(k=>!A.cache[k]&&!A.errors.some(e=>e.startsWith(k+':'))).length; if(!n) return i; await new Promise(r=>setTimeout(r,250)); } return -1; })()"
STUB = ['bldg.campus_library', 'bldg.campus_socsci', 'bldg.campus_gate']
DEL = ['bldg.campus_bell', 'bldg.campus_admin', 'bldg.campus_arts', 'bldg.campus_hist', 'bldg.campus_pavilion', 'bldg.campus_gongtong', 'bldg.campus_freshman',
       'bldg.campus_male1', 'bldg.campus_putong', 'bldg.campus_boya']


async def main():
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await PL.launch(p, landscape=True)
        await pg.goto(URL); print('loaded', await PL.wait_loaded(pg))
        if MODE == 'stub':
            await pg.evaluate("(ks=>{ const o=ASSETS.loadOne.bind(ASSETS); ASSETS.loadOne=k=>ks.includes(k)?Promise.resolve(null):o(k); })(%s)" % json.dumps(STUB))
            await pg.evaluate("(ks=>{ for(const k of ks) delete ASSETS.manifest[k]; })(%s)" % json.dumps(DEL))
        if MODE == 'delete':
            await pg.evaluate("(ks=>{ for(const k of ks) delete ASSETS.manifest[k]; })(%s)" % json.dumps(STUB + DEL))
        await pg.evaluate(SETTLED)
        await PL.load_state(pg, {'zone': 'campus', 'hour': 17.5, 'pos': {'x': 74, 'z': 2, 'yaw': 1.5708}}, quiet_events=True)
        await pg.evaluate("(()=>{ const E=GAME.E; E.player.busy=true; GAME.G.hour=17.5; E.hour=17.5; E.applyTime(17.5); })()")
        if MODE == 'formal':
            for g in GLBS:
                ok = await pg.evaluate("(async n=>{ for(let i=0;i<240;i++){ if(GAME.E.zone.group.children.some(o=>o.name===n)) return true; await new Promise(r=>setTimeout(r,250)); } return false; })(%s)" % json.dumps(g))
                print('attached', g, ok)
        else:
            await pg.wait_for_timeout(4000)
        print('settled', await pg.evaluate(SETTLED))
        await pg.wait_for_timeout(1500)
        info = await pg.evaluate("""(()=>{ const z=GAME.E.zone; const per={}; for(const b of z.group.children.filter(o=>o.userData&&o.userData.ckTag)){ const t=b.userData.ckTag; const q=per[t]||(per[t]={n:0,formal:[],dyn:[],kitVisible:0,kitMeshes:0});
            q.n++; q.formal.push(!!b.userData.formal); q.dyn.push(!!b.userData.dyn); q.kitVisible+=b.children.filter(o=>(o.isMesh||o.isSprite)&&o.visible).length; q.kitMeshes+=b.children.filter(o=>o.isMesh||o.isSprite).length; } return per; })()""")
        print('INFO', json.dumps(info, ensure_ascii=False))
        print('LAMPS', await pg.evaluate("(()=>{ const E=GAME.E; E.applyTime(20.5); const on=E.lampGlows.filter(l=>l.visible).length, n=E.lampGlows.length; E.applyTime(17.5); return {on, n}; })()"))
        print('OTHERS', await pg.evaluate("""(()=>{ const z=GAME.E.zone; let n=0, empty=0, gates=0; const skip=new Set(GAME.E.lampGlows||[]); const shown=m=>{ for(let p=m;p&&p!==z.group;p=p.parent) if(!p.visible) return false; return true; };
            for(const o of z.group.children){ if(!o.isGroup||(o.userData&&o.userData.ckTag)||/_glb$/.test(o.name)) continue; if(o.userData&&o.userData.gate) gates++; n++; let has=false, vis=false; o.traverse(m=>{ if((m.isMesh||m.isSprite)&&!skip.has(m)){ has=true; if(!vis&&shown(m)) vis=true; } }); if(has&&!vis) empty++; }
            return {n, empty, untaggedWithGate:gates}; })()"""))
        print('NAVHASH', await pg.evaluate("(()=>{ const n=GAME.E.nav; let h=0; for(let i=0;i<n.b.length;i++){ h=(h*31+n.b[i]+i%7)>>>0; } return [n.cols,n.rows,h, n.b.reduce((a,v)=>a+(v?1:0),0)]; })()"))
        print('COLS', await pg.evaluate("GAME.E.colliders.length"), 'IT', await pg.evaluate("GAME.E.interactables.length"))
        if MODE == 'formal':
            for tag, glb in TAGMAP.items():
                g = await pg.evaluate("""(([tag,glbName])=>{ const z=GAME.E.zone; const kits=z.group.children.filter(o=>o.userData&&o.userData.ckTag===tag), glb=z.group.children.find(o=>o.name===glbName); if(!glb) return null;
                    z.group.updateMatrixWorld(true); const r=b=>[b.min.x,b.min.y,b.min.z,b.max.x,b.max.y,b.max.z].map(v=>Math.round(v*100)/100);
                    const bk=new THREE.Box3(), bg=new THREE.Box3(); for(const k of kits) k.traverse(o=>{ if(o.isMesh){ o.geometry.computeBoundingBox(); bk.union(o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld)); } });
                    glb.traverse(o=>{ if(!o.isMesh) return; o.geometry.computeBoundingBox(); bg.union(o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld)); });
                    return {kit:r(bk), glb:r(bg), kits:kits.length}; })""" + "(%s)" % json.dumps([tag, glb]))
                if g: g['diff'] = [round(abs(a - b), 2) for a, b in zip(g['kit'], g['glb'])]
                print('BBOX', tag, json.dumps(g))
                pl = await pg.evaluate("""(glbName=>{ const root=GAME.E.zone.group.children.find(o=>o.name===glbName); if(!root) return 'noroot'; const at=root.getObjectByName('wz_plates_atlas'); if(!at) return null;
                    const m=at.material.map, img=m&&m.image, it=at.userData.atlas.items; return {visible:at.visible, canvas:!!(m&&(m.isCanvasTexture||(img&&img.getContext))), n:it.length, names:it.map(i=>i.name), ratio:it.map(i=>+((i.w/i.h)/i.board).toFixed(3))}; })""" + "(%s)" % json.dumps(glb))
                print('PLATE', tag, json.dumps(pl, ensure_ascii=False))
                sh = await pg.evaluate("""(n=>{ const root=GAME.E.zone.group.children.find(o=>o.name===n); if(!root) return null; const out={}; root.traverse(m=>{ if(m.isMesh) out[m.material.name]=m.castShadow; }); return out; })""" + "(%s)" % json.dumps(glb))
                print('SHADOW', tag, json.dumps(sh))
                night = await pg.evaluate("""(name=>{ const E=GAME.E, root=E.zone.group.children.find(o=>o.name===name); if(!root) return null; const mats={}; let glass=null;
                    root.traverse(o=>{ if(o.isMesh){ mats[o.material.name]=o.material; if(o.material.name==='ck_glass') glass=o; } });
                    const read=()=>{ const o={}; for(const k in mats) o[k]=+(mats[k].emissiveIntensity||0).toFixed(2); return o; };
                    E.applyTime(11); const day=read(); E.applyTime(20.5); const n2030=read(); E.applyTime(17.5);
                    const m=mats.ck_glass, t=m&&m.emissiveMap, img=t&&t.image; let left=-1, right=-1, grad=0;
                    if(img){ const c=document.createElement('canvas'); c.width=img.width; c.height=img.height; const x=c.getContext('2d'); x.drawImage(img,0,0); const d=x.getImageData(0,0,c.width,c.height).data;
                      left=0; right=0; for(let j=0;j<c.height;j++) for(let i=0;i<c.width;i++){ const k=(j*c.width+i)*4, v=Math.max(d[k],d[k+1],d[k+2]); if(i<c.width/4) left=Math.max(left,v); else if(i>=3*c.width/4) right=Math.max(right,v); }
                      const top=(r)=>{ const k=(r*c.width+c.width-1)*4; return d[k]+d[k+1]+d[k+2]; }; grad=top(0)-top(c.height-1); }
                    let lit=0, dark=0, bad=0; if(glass){ const uv=glass.geometry.attributes.uv; if(uv) for(let i=0;i<uv.count;i++){ const u=uv.getX(i); if(Math.abs(u-0.875)<0.01) lit++; else if(Math.abs(u-0.125)<0.01) dark++; else bad++; } else bad=-1; }
                    return {day, n2030, map:!!t, mip:t?t.generateMipmaps:null, minLinear:t?t.minFilter===THREE.LinearFilter:null, tex:img?[img.width,img.height]:null, leftMax:left, rightMax:right, grad, uv:{lit, dark, bad}, oldLitMat:!!mats.ck_glass_lit}; })""" + "(%s)" % json.dumps(glb))
                print('NIGHT', tag, json.dumps(night))
        print('ERRS', errs[:5])
        await b.close()

asyncio.run(main())
