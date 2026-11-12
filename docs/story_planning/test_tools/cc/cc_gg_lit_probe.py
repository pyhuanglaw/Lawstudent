"""CC-C 11-12：公館打烊亮窗（GG-LIT-12-1112，LAWWW2；LAWWW-C 08:32 交排，結果給 BB 判）。Playwright（PC GPU）≠ iPhone。
要看的：①公館燒臘 23:00 打烊以後店裡變暗 ②公館亮窗 12 間照各店營業時間（舊 bug：花序、轉角唱片、榮恩典、Daybreak 打烊後窗永遠亮）③日和便利店 24 小時＝23:30 還亮 ④公館燒臘招牌寫什麼字（舊名「阿鳳麵店」要改）。
做法：【前置／捷徑】讀檔到公館（gongguan）DATE（預設 2025-11-05 週三，晴）HOURS 每個時間（預設 20:00、23:30），條件事件關掉、等素材載完 →
  店的位置從遊戲自己的亮窗網格讀（xs_fronts_lit 的 uv1＝第幾間、模型 userData.xsShops＝每一間的 id；店在哪一格＝那一間頂點的外框），
  公館燒臘（模型裡的立體店內 G00，不在亮窗名單）用街上「進燒臘店」的出口互動點（exit.to＝noodle）。
  拍照鏡頭（不動遊戲鏡頭；拍的那一格藏玩家、路人，拍完還原）：全景三張（街上高 6 m、退 26 m 看店面那一排）、每間近照（店面外 DIST m、高 2.2 m 平視店面 3 m 高）；街在哪一邊用導航格判（往 ±z 2～12 m 能走的格數多的那邊）。
  每間記：遊戲認為現在開不開（PLACES.isOpen＋颱風）、近照中間那塊的平均亮度（只給參考；開關看圖由 BB 判）。
CC_02 清單 2026-11-12：1✓（營業時間讀 PLACES.isOpen；20:00 全開、23:30 多數打烊是 LAWWW 給的） 2✓（店位置從亮窗網格和出口互動點讀，不寫死座標） 3✓（每個時間各讀一次檔） 4n/a（不按按鈕） 5n/a（不走路，拍照鏡頭） 6✓（等 ASSETS 載完、夜間亮度更新 3 秒） 7✓ 8n/a（不判，亮度只是參考，BB 看圖） 9✓（拍照藏玩家、路人） 10✓（條件事件關掉） 11✓ 12✓（每間記 id、位置、開不開、亮度） 13✓（讀檔捷徑標【前置／捷徑】）
用法：LW_TESTS=<wt>/tests SHA=<sha> TAG=new|old [DATE=2025-11-05] [HOURS=20,23.5] [DIST=8] python3 cc_gg_lit_probe.py <url> <out>"""
import os, sys, json, asyncio, base64
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
TAG = os.environ.get('TAG') or 'new'; SHA = (os.environ.get('SHA') or '')[:10]
DATE = os.environ.get('DATE') or '2025-11-05'
HOURS = [float(h) for h in (os.environ.get('HOURS') or '20,23.5').split(',') if h]
DIST = float(os.environ.get('DIST') or '8')
R = L.Run('gg_lit_' + TAG, OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
ZK = {'ggtea': 'aoki', 'ggbook': 'bookstore', 'ggcvs': 'cvs', 'ggyy': 'yangyang', 'ggbike': 'bikeshop', 'ggafar': 'afar', 'ggcorner': 'corner_records', 'ggdb': 'daybreak',
      'ggantai': 'gg_antai', 'ggfruit': 'gg_xianguo', 'ggfn': 'flower_notes', 'ggrong': 'gg_rongendian'}   # 同 zones3d.js GG_LIT_ZONE（bc559a032d）

SHOPS_JS = r"""((zk)=>{ const E=GAME.E, G=GAME.G; let mesh=null, ids=null; E.scene.traverse(o=>{ if(!mesh&&o.isMesh&&/xs_fronts_lit/.test(o.name||'')) mesh=o; if(!ids&&o.userData&&o.userData.xsShops) ids=String(o.userData.xsShops).split(','); });
  if(!mesh){ E.scene.traverse(o=>{ if(!mesh&&o.name==='NOSHADOW_xs_fronts_lit') o.traverse(q=>{ if(!mesh&&q.isMesh) mesh=q; }); }); }
  const open=k=>{ try{ return !!(PLACES.isOpen(k,(+G.hour)%24,G.day)&&!(PLACES.typhoonClosed&&PLACES.typhoonClosed(k,G.day))); }catch(e){ return null; } };
  const nm=k=>{ try{ return (PLACES[k]&&PLACES[k].name)||(PLACES.get&&PLACES.get(k)&&PLACES.get(k).name)||(Z3.ZONES&&Z3.ZONES[k]&&Z3.ZONES[k].name)||k; }catch(e){ return k; } };
  const out=[]; ids=ids||['ggtea','ggbook','ggcvs','ggyy','ggbike','ggafar','ggcorner','ggdb'];
  if(mesh&&mesh.geometry&&mesh.geometry.attributes.uv1){ const P=mesh.geometry.attributes.position, S=mesh.geometry.attributes.uv1, v=new THREE.Vector3(), box={}; mesh.updateMatrixWorld(true);
    for(let i=0;i<P.count;i++){ const s=Math.round(S.getX(i)); if(s<1||s>16) continue; v.fromBufferAttribute(P,i); mesh.localToWorld(v); const b=box[s]||(box[s]={x0:1e9,x1:-1e9,y0:1e9,y1:-1e9,z0:1e9,z1:-1e9}); b.x0=Math.min(b.x0,v.x); b.x1=Math.max(b.x1,v.x); b.y0=Math.min(b.y0,v.y); b.y1=Math.max(b.y1,v.y); b.z0=Math.min(b.z0,v.z); b.z1=Math.max(b.z1,v.z); }
    for(const s in box){ const id=ids[s-1]||('#'+s), k=zk[id]||null, b=box[s]; out.push({idx:+s, id, zone:k, name:k?nm(k):id, x:+((b.x0+b.x1)/2).toFixed(2), y:+((b.y0+b.y1)/2).toFixed(2), z:+((b.z0+b.z1)/2).toFixed(2), w:+(b.x1-b.x0).toFixed(2), d:+(b.z1-b.z0).toFixed(2), open:k?open(k):null}); } }
  const nd=(E.interactables||[]).find(i=>i.exit&&i.exit.to==='noodle'&&!i.hidden);
  if(nd) out.push({idx:0, id:'G00', zone:'noodle', name:nm('noodle')+'（燒臘）', label:nd.label, x:+nd.x.toFixed(2), y:2, z:+nd.z.toFixed(2), w:4, d:0, open:open('noodle'), door:true});
  const N=E.nav, free=(x,z)=>!N||N.free(x,z), run=(x,z,sg)=>{ let n=0; for(let r=2;r<=12;r+=1) if(free(x,z+sg*r)) n++; return n; };
  for(const q of out){ const a=run(q.x,q.z,1), b=run(q.x,q.z,-1); q.side=a>=b?1:-1; q.freeRun=[a,b]; }   /* 街在店面哪一邊：往 +z／−z 各看 2～12 m 能走的格數，多的那邊＝街上（signs 探針：公館街在 +z）*/
  out.sort((a,b)=>a.x-b.x); return {mesh:mesh?mesh.name:null, ids, hour:G.hour, day:G.day, shops:out}; })"""
SNAP = r"""(a=>{ const E=GAME.E, r=E.renderer, c=r.domElement; const cam=new THREE.PerspectiveCamera(a.fov, c.width/c.height, 0.1, 500); cam.position.set(...a.from); cam.lookAt(...a.at); cam.updateMatrixWorld(true);
  const hid=[]; const P=E.player&&E.player.obj; if(P){ hid.push([P,P.visible]); P.visible=false; } for(const n of (E.npcs||[])) if(n.obj){ hid.push([n.obj,n.obj.visible,n,n.hidden]); n.hidden=true; n.obj.visible=false; }
  let url, lum=null; try{ r.render(E.scene,cam); const k=document.createElement('canvas'); k.width=a.tw; k.height=Math.round(a.tw*c.height/c.width); const g=k.getContext('2d'); g.drawImage(c,0,0,k.width,k.height);
    const cw=Math.round(k.width*0.3), ch=Math.round(k.height*0.3); const px=g.getImageData(Math.round((k.width-cw)/2),Math.round((k.height-ch)/2),cw,ch).data; let s=0; for(let i=0;i<px.length;i+=4) s+=0.2126*px[i]+0.7152*px[i+1]+0.0722*px[i+2]; lum=+(s/(px.length/4)).toFixed(1);
    g.fillStyle='rgba(0,0,0,0.6)'; g.fillRect(0,0,k.width,20); g.fillStyle='#fff'; g.font='14px sans-serif'; g.fillText(a.label,5,15); (window.__GL=window.__GL||[]).push(k.toDataURL('image/jpeg',0.88));
    url=c.toDataURL('image/jpeg',0.9); } finally { for(const [o,v,n,h] of hid){ o.visible=v; if(n) n.hidden=h; } } return {url, lum}; })"""
MONT = r"""(async a=>{ const L=window.__GL||[]; if(!L.length) return null; const ims=await Promise.all(L.map(u=>new Promise(res=>{ const q=new Image(); q.onload=()=>res(q); q.src=u; })));
  const w=ims[0].width, h=ims[0].height, C=a.cols, rows=Math.ceil(ims.length/C), k=document.createElement('canvas'); k.width=w*C; k.height=h*rows+28; const g=k.getContext('2d'); g.fillStyle='#000'; g.fillRect(0,0,k.width,k.height);
  g.fillStyle='#fff'; g.font='bold 20px sans-serif'; g.fillText(a.title,8,21); ims.forEach((im,i)=>g.drawImage(im,(i%C)*w,28+Math.floor(i/C)*h)); window.__GL=[]; return k.toDataURL('image/jpeg',0.88); })"""


def save(u, name):
    if u: open(os.path.join(OUT, name), 'wb').write(base64.b64decode(u.split(',', 1)[1]))


async def main():
    print('CC 公館打烊亮窗：TAG %s；SHA %s；%s %s；Playwright ≠ iPhone' % (TAG, SHA or '?', DATE, HOURS), flush=True)
    res = {'tag': TAG, 'sha': SHA, 'date': DATE, 'hours': {}}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); sys.exit(1)
        try:
            for h in HOURS:
                hh = '%02d%02d' % (int(h), round((h % 1) * 60))
                s = await D.load_zone(pg, cdp, 'gongguan', DATE, h, wait=9000)
                R.setup('【前置／捷徑】讀檔到公館 %s %s（晴；條件事件關掉）' % (DATE, hh))
                if not R.check('[%s] 讀到 gongguan' % hh, s.get('zone') == 'gongguan', J(s)): continue
                await pg.wait_for_timeout(3000)
                info = await pg.evaluate(SHOPS_JS, ZK)
                R.note('[%s] 亮窗網格 %s；xsShops %s；店 %s' % (hh, info['mesh'], J(info['ids']), J(info['shops'])))
                R.check('[%s] 找得到亮窗網格（xs_fronts_lit）' % hh, bool(info['mesh']), '')
                R.check('[%s] 找得到公館燒臘的門（exit.to＝noodle）' % hh, any(q['id'] == 'G00' for q in info['shops']), '')
                shops = info['shops']
                if not shops: continue
                zs = sorted(q['z'] for q in shops); zmid = zs[len(zs) // 2]
                side = 1 if sum(q.get('side', 1) for q in shops) >= 0 else -1
                xs = [q['x'] for q in shops]; x0, x1 = min(xs), max(xs)
                await pg.evaluate("window.__GL=[]")
                for i, px in enumerate([x0 + (x1 - x0) * f for f in (0.17, 0.5, 0.83)]):
                    o = await pg.evaluate(SNAP, {'from': [px, 6, zmid + side * 26], 'at': [px, 3, zmid], 'fov': 70, 'tw': 640, 'label': '%s %s %s 全景 %d' % (TAG, SHA, hh, i + 1)})
                    save(o['url'], 'pano_%s_%s_%d.jpg' % (TAG, hh, i + 1))
                u = await pg.evaluate(MONT, {'cols': 3, 'title': '公館全景 %s %s %s %s' % (TAG, SHA, DATE, hh)}); save(u, 'pano_%s_%s.jpg' % (TAG, hh))
                rows = []
                for q in shops:
                    o = await pg.evaluate(SNAP, {'from': [q['x'], 2.2, q['z'] + q.get('side', side) * DIST], 'at': [q['x'], 3.0, q['z']], 'fov': 50, 'tw': 420,
                                                 'label': '%s %s %s %s %s' % (TAG, hh, q['name'], {True: '開', False: '關', None: '?'}[q['open']], q['id'])})
                    save(o['url'], 'shop_%s_%s_%s.jpg' % (TAG, hh, q['id']))
                    q['lum'] = o['lum']; rows.append(q)
                    R.note('[%s] %s（%s）遊戲認為 %s；近照中間亮度 %s' % (hh, q['name'], q['id'], {True: '開著', False: '打烊', None: '不知道'}[q['open']], o['lum']))
                u = await pg.evaluate(MONT, {'cols': 4, 'title': '公館店面近照 %s %s %s %s（標題：開／關＝遊戲 PLACES.isOpen）' % (TAG, SHA, DATE, hh)}); save(u, 'shops_%s_%s.jpg' % (TAG, hh))
                res['hours'][hh] = {'mesh': info['mesh'], 'ids': info['ids'], 'shops': rows}
        except Exception as e:
            R.check('沒有中斷', False, repr(e)[:300])
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    open(os.path.join(OUT, 'gg_lit_%s.json' % TAG), 'w', encoding='utf-8').write(J(res))
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
