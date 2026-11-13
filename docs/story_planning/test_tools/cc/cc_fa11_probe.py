"""CC（帳號 A）11-02：FA-11 大一宿舍房間牆上的法服傳單文字（BB_222 驗收計畫 B-2 FA-11；共同規則第 221–237 行）。
方法：瀏覽器實玩（不用 turbo）。URL 用 '<URL>/index.html'（沒有 ?turbo；有的話探針會記一筆注意）。
不是 iPhone：Playwright 手機模擬（SwiftShader 1–4 fps）。直向、橫向各開一次瀏覽器（ORIENT，預設 portrait,landscape）。

傳單在哪（讀碼，a3b1bd647）：src/zones3d.js:1827–1828 宿舍房間 build：W3.canvasTex('dormFlyer',128,180, …) 畫字，
  貼在 DORM_ROOM.units 的 L2（祐廷）wall_spot_by_desk＝(-2.896, 1.2, -0.735)、朝 +x、0.42×0.6 m 的平面，名字 'dorm_flyer'（材質獨一份，P3.mergeStatic 不會合併）。
  每一年（非舊序章的系）都有；大二起往房間多 2 cm（釘在軟木板上）。這支探針看大一（203）。
存檔【前置】：最小存檔（GAME.defaults＋過了開場的旗標 BASEF；同 cc_dl04b_probe 的 state_at），大一上第 6 週週日（DATE，預設 2025-10-12）14:00、宿舍、出生點。
  QUIET=1（預設）＝讀檔時關條件事件與手機自動打開（playlib 的 quiet_events，【前置】：這一項只看牆上的貼圖，不測劇情）；QUIET=0 照常（劇情對話會自動點過去）。
只讀的紀錄：
  - 頁面載入前（add_init_script）包 CanvasRenderingContext2D.prototype.fillText：照原樣畫，另外把字串記在那張 canvas 的 __txt（只記不改）。
    讀檔後找 'dorm_flyer' 這個 mesh → material.map.image.__txt＝傳單貼圖上畫的每一行字（連字型、顏色、座標）；貼圖本身存成 flyer_texture_<方向>.png（canvas.toDataURL）。
  - HOOK（GAME.say／choose／caption／toast）記逐字稿 → transcript_<方向>.json。
玩家操作（真的介面）：L.go_to 走到傳單前（點地面，走不動才推搖桿）→ 雙指張開（CDP 兩指觸控）把鏡頭拉近（室內最近 2.2 m）→
  單指左右滑轉鏡頭（yaw）、上下滑壓低俯角（pitch）→ 每試一個角度量一次：傳單四角投影到螢幕的範圍、從鏡頭到傳單中心的射線第一個打到的東西（被人物、床板擋住？）→
  挑傳單在畫面上最大、沒被擋住的角度截圖（整張＋同一張截圖裁出傳單附近的放大圖，裁切不改畫面）。
check（客觀記錄，判定由 BB 做）：走到傳單前（walkFallbacks＝0）；傳單在畫面裡、沒被擋住；貼圖字串含不含「週三晚上 社課」「社辦」
  （修改前預期這兩項 FAIL：貼圖寫「一年級也可以／週三晚上 社課／法律系館B 社辦」）；沒有 JS 例外。「文字符合現行設定」由 BB 對 D27 判。
環境變數：ORIENT、DATE、HOUR（預設 14）、QUIET。
用法：LW_TESTS=<工作樹>/tests SHA=<sha> python3 cc_fa11_probe.py '<URL>/index.html' <輸出資料夾>"""
import os, sys, json, asyncio, math, time, base64, traceback
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); import bbplay as P   # bbplay 在上一層（BB 的 test_tools）
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
ORIENTS = [o.strip() for o in os.environ.get('ORIENT', 'portrait,landscape').split(',') if o.strip()]
DATE = os.environ.get('DATE', '2025-10-12')
HOUR = float(os.environ.get('HOUR', '14'))
QUIET = os.environ.get('QUIET', '1') == '1'
BAD = ('週三晚上 社課', '社辦')   # 驗收計畫「修改前預期」寫的字

BASEF = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'MET_ZHE': True,
         'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True,
         'fundsV2': 1, 'KX_DEC3_MIGRATED': True, 'dating_kexin': False}
VISITED = ('noodle', 'cafe', 'library_hall', 'library', 'lawlib', 'wancai', 'linze', 'gongguan', 'wenzhou', 'soclib', 'cvs', 'bookstore')

# 頁面載入前：fillText 照原樣畫，另外記字串（只記不改）
INIT_JS = r"""(()=>{ const P=CanvasRenderingContext2D.prototype, f0=P.fillText;
  P.fillText=function(t,x,y){ try{ const c=this.canvas; if(c){ (c.__txt=c.__txt||[]).push({t:String(t),x:Math.round(x),y:Math.round(y),font:String(this.font||''),fill:String(this.fillStyle||'')}); } }catch(e){} return f0.apply(this,arguments); }; })();"""

HOOK = r"""(()=>{ if(window.__PLH) return 'again'; window.__PLH=1; window.__PL=[];
  const at=()=>{ try{ return {d:CALENDAR.dateOf(GAME.G.day).key, h:+(+GAME.G.hour).toFixed(3), z:GAME.G.zone}; }catch(e){ return {}; } };
  const push=o=>{ try{ Object.assign(o,at()); window.__PL.push(o); if(window.__PL.length>8000) window.__PL.splice(0,2000); }catch(e){} return o; };
  const s0=GAME.say; GAME.say=function(w,t){ push({k:'say',n:(w&&w.name)||(typeof w==='string'?w:''),t:String(t==null?'':t)}); return s0.apply(this,arguments); };
  const c0=GAME.choose; GAME.choose=function(o){ push({k:'choose',n:'',t:(o||[]).filter(x=>x&&!x.hidden).map(x=>((x.t||x.text)||'')+(x.hint?'〔'+x.hint+'〕':'')).join('｜')}); return c0.apply(this,arguments); };
  if(GAME.caption){ const p0=GAME.caption; GAME.caption=function(n,t){ push({k:'cap',n:String(n||''),t:String(t==null?'':t)}); return p0.apply(this,arguments); }; }
  if(GAME.toast){ const o0=GAME.toast; GAME.toast=function(t){ push({k:'toast',n:'',t:String(t||'')}); return o0.apply(this,arguments); }; }
  return 'ok'; })()"""

FLYER_JS = r"""(()=>{ const E=GAME.E; let m=null; if(E.zone&&E.zone.group) E.zone.group.traverse(o=>{ if(!m&&o.name==='dorm_flyer') m=o; }); if(!m) return null;
  m.updateWorldMatrix(true,false); const p=new THREE.Vector3(); m.getWorldPosition(p); const img=m.material&&m.material.map&&m.material.map.image;
  let url=null; try{ url=img&&img.toDataURL?img.toDataURL('image/png'):null; }catch(e){}
  return {pos:[+p.x.toFixed(3),+p.y.toFixed(3),+p.z.toFixed(3)],ry:+m.rotation.y.toFixed(4),size:[m.geometry.parameters.width,m.geometry.parameters.height],visible:m.visible,
    tex:img?{w:img.width,h:img.height}:null,txt:(img&&img.__txt)||null,url,room:E.zone.dormSetKey||null,stage:GAME.G.stage||'law',date:CALENDAR.dateOf(GAME.G.day).key,zone:GAME.G.zone}; })()"""

# 傳單四角投影＋鏡頭到傳單中心的射線（只讀）
VIEW_JS = r"""(()=>{ const E=GAME.E, cam=E.camera; let m=null; E.zone.group.traverse(o=>{ if(!m&&o.name==='dorm_flyer') m=o; }); if(!m) return null; m.updateWorldMatrix(true,false);
  const w=m.geometry.parameters.width/2, h=m.geometry.parameters.height/2, pts=[[-w,-h],[w,-h],[w,h],[-w,h],[0,0]].map(([x,y])=>new THREE.Vector3(x,y,0).applyMatrix4(m.matrixWorld));
  const sc=pts.map(v=>{ const q=v.clone().project(cam); return [(q.x+1)/2*innerWidth,(1-q.y)/2*innerHeight,q.z]; });
  const xs=sc.slice(0,4).map(a=>a[0]), ys=sc.slice(0,4).map(a=>a[1]), front=sc.every(a=>a[2]<1);
  const bb={x0:Math.min(...xs),y0:Math.min(...ys),x1:Math.max(...xs),y1:Math.max(...ys)}; const inView=front&&bb.x0>=0&&bb.y0>=0&&bb.x1<=innerWidth&&bb.y1<=innerHeight;
  const cp=cam.getWorldPosition(new THREE.Vector3()), ctr=pts[4], dir=ctr.clone().sub(cp), dist=dir.length(); dir.normalize();
  const n=new THREE.Vector3(0,0,1).transformDirection(m.matrixWorld), facing=+(-dir.dot(n)).toFixed(3);   /* 1＝正對 */
  const rc=new THREE.Raycaster(cp,dir,0.05,dist+0.05); const vis=o=>{ for(let q=o;q;q=q.parent){ if(q.visible===false) return false; } const mt=o.material; if(!mt||Array.isArray(mt)) return true; return mt.visible!==false&&!(mt.transparent&&mt.opacity<0.1); };
  const objs=[E.zone.group]; if(E.player&&E.player.obj) objs.push(E.player.obj); for(const n2 of (E.npcs||[])) if(n2.obj) objs.push(n2.obj);
  const hits=rc.intersectObjects(objs,true).filter(x=>vis(x.object)); const first=hits[0]||null;
  let who=first?first.object.name||first.object.type:null; if(first){ for(let q=first.object;q;q=q.parent){ if(q===E.player.obj){ who='玩家：'+who; break; } } }
  const P=E.player.obj.position;
  return {bb:{x0:Math.round(bb.x0),y0:Math.round(bb.y0),x1:Math.round(bb.x1),y1:Math.round(bb.y1)},area:Math.round(Math.max(0,bb.x1-bb.x0)*Math.max(0,bb.y1-bb.y0)),inView,facing,
    dist:+dist.toFixed(2),firstHit:who,clear:!!first&&first.object===m,cam:{yaw:+E.cam.yaw.toFixed(3),pitch:+E.cam.pitch.toFixed(3),dist:+E.cam.dist.toFixed(2),distTarget:+(E.cam.distTarget||0).toFixed(2)},
    player:[+P.x.toFixed(2),+P.z.toFixed(2)],vw:innerWidth,vh:innerHeight}; })()"""


async def state_at(pg, key, h, zone):
    d = await P.day_of(pg, key)
    st = {'name': '祐廷', 'energy': 100, 'events': {'done': {}, 'last': {}, 'count': 0}, 'contacts': {}, 'flags': dict(BASEF)}
    st.update(day=d['d'], weekday=d['wd'], hour=h, zone=zone, pos=None, weather='clear', stage='law', money=30000)
    st['visited'] = {z: True for z in VISITED}
    return st, d


async def free_spot(pg):
    """畫面上半部、不是按鈕的地方（拖鏡頭的起點；同 playlib.turn_camera_to 的做法）"""
    return await pg.evaluate("""(()=>{ for(const fy of [0.4,0.33,0.5,0.27,0.6]) for(const fx of [0.5,0.4,0.6]){ const x=innerWidth*fx, y=innerHeight*fy, e=document.elementFromPoint(x,y); if(e&&e.id==='c') return {x,y}; } return null; })()""")


async def pinch_in(pg, cdp, spread=150, steps=10):
    """雙指從中間往外張開（engine3d.js：兩指距離變大 → distTarget 變小＝拉近；室內最近 2.2 m）"""
    c = await free_spot(pg)
    if not c: return False
    x, y = c['x'], c['y']; d0 = 25
    await cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': x - d0, 'y': y, 'id': 1}, {'x': x + d0, 'y': y, 'id': 2}]})
    for i in range(1, steps + 1):
        d = d0 + (spread - d0) * i / steps
        await cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': x - d, 'y': y, 'id': 1}, {'x': x + d, 'y': y, 'id': 2}]}); await pg.wait_for_timeout(60)
    await cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []}); await pg.wait_for_timeout(500)
    return True


async def drag_cam(pg, cdp, want_yaw=None, want_pitch=None, tries=4):
    """單指滑：左右 dx → yaw −= dx×0.0075；上下 dy → pitch += dy×0.005（engine3d.js pointermove）。回傳最後的 (yaw, pitch)"""
    for _ in range(tries):
        s = await pg.evaluate("({yaw:GAME.E.cam.yaw,pitch:GAME.E.cam.pitch})")
        dyaw = 0 if want_yaw is None else (want_yaw - s['yaw'] + math.pi) % (2 * math.pi) - math.pi
        dp = 0 if want_pitch is None else want_pitch - s['pitch']
        if abs(dyaw) < 0.08 and abs(dp) < 0.05: return s
        px = max(-220.0, min(220.0, -dyaw / 0.0075)) if abs(dyaw) >= 0.08 else 0
        py = max(-150.0, min(150.0, dp / 0.005)) if abs(dp) >= 0.05 else 0
        c = await free_spot(pg)
        if not c: return s
        x0 = max(20, min(c['x'] - px / 2, (await pg.evaluate('innerWidth')) - 20 - abs(px)))
        y0 = c['y'] - py / 2
        await L.drag(pg, cdp, x0, y0, x0 + px, y0 + py, steps=12); await pg.wait_for_timeout(500)
    return await pg.evaluate("({yaw:GAME.E.cam.yaw,pitch:GAME.E.cam.pitch})")


async def run_orient(p, run, orient):
    land = orient == 'landscape'
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=land)
    await pg.add_init_script(INIT_JS)   # 頁面載入前（只記 fillText 的字串）
    pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
    res = {'orient': orient}
    try:
        await pg.goto(URL); ok = await L.wait_loaded(pg); run.check('%s：遊戲載入' % orient, ok)
        await pg.evaluate("localStorage.clear()"); await P.init(pg); await pg.evaluate(HOOK)
        st, d = await state_at(pg, DATE, HOUR, 'dorm')
        await L.load_state(pg, st, quiet_events=QUIET, quiet_phone=True); await pg.wait_for_timeout(4000)
        await L.phone_away(pg, cdp, tries=2); await L.close_panels(pg, cdp)
        run.setup('[前置] 最小存檔（GAME.defaults＋BASEF）→ %s（%s 第 %s 週）%s 宿舍出生點；%s' % (d['key'], d['term'], d['week'], '%02d:%02d' % (int(HOUR), round(HOUR % 1 * 60)),
                  '【前置】quiet_events（關條件事件、手機自動打開：只看牆上貼圖）' if QUIET else '條件事件照常（quiet_phone 關手機自動打開）'))
        fl = await pg.evaluate(FLYER_JS)
        if fl and fl.get('url'):
            pth = os.path.join(OUT, 'flyer_texture_%s.png' % orient)
            with open(pth, 'wb') as f: f.write(base64.b64decode(fl['url'].split(',', 1)[1]))
            fl['url'] = pth
        res['flyer'] = fl
        run.note('%s 傳單：%s' % (orient, J({k: v for k, v in (fl or {}).items() if k != 'txt'})))
        txt = [x['t'] for x in ((fl or {}).get('txt') or [])]
        run.note('%s 傳單貼圖上畫的字（canvas fillText，照順序）：%s' % (orient, J(txt)))
        run.check('%s：找到 dorm_flyer、在大一 203 房間' % orient, bool(fl) and fl.get('room') == '203' and fl.get('visible'), J({k: (fl or {}).get(k) for k in ('room', 'stage', 'date', 'visible', 'pos')}))
        run.check('%s：讀得到傳單貼圖的字串（fillText 紀錄）' % orient, bool(txt), J(txt))
        for w in BAD:
            hit = [t for t in txt if w in t]
            run.check('%s：傳單貼圖不含「%s」（修改前預期 FAIL）' % (orient, w), not hit, J(hit))
        res['shots'] = [await run.shot(pg, orient + '_spawn')]
        # 走到傳單前：候選站位（站得住的才走；照 E.canStand 只讀判斷）
        fx, fz = fl['pos'][0], fl['pos'][2]
        cands = [(-1.5, -0.75), (-1.55, -0.2), (-1.5, -1.3)]
        best = None; res['tries'] = []
        fb0 = (await L.state(pg))['fallbacks']
        for (sx, sz) in cands:
            okst = await pg.evaluate("([x,z])=>!GAME.E.canStand||GAME.E.canStand(x,z,0.3,0)", [sx, sz])
            if not okst: run.note('%s：候選站位 (%.2f,%.2f) 站不住，跳過' % (orient, sx, sz)); continue
            arrived = await L.go_to(pg, cdp, run, sx, sz, 0.35, '傳單前 (%.2f,%.2f)' % (sx, sz), max_s=360)
            s = await L.state(pg)
            run.check('%s：走到傳單前 (%.2f,%.2f)' % (orient, sx, sz), arrived, J({k: s[k] for k in ('x', 'z', 'fallbacks', 'stand')}))
            if not arrived: continue
            await pinch_in(pg, cdp); await pinch_in(pg, cdp)
            base_yaw = math.atan2(s['x'] - fx, s['z'] - fz)   # 鏡頭在玩家的 (sin yaw, cos yaw) 那一側＝傳單的反方向
            for off in (0.45, -0.45, 0.25, -0.25, 0.0):
                for pitch in (0.12, 0.25):
                    cs = await drag_cam(pg, cdp, base_yaw + off, pitch)
                    await pg.wait_for_timeout(900)
                    v = await pg.evaluate(VIEW_JS)
                    rec = {'stand': [sx, sz], 'off': off, 'pitch_want': pitch, 'view': v}
                    res['tries'].append(rec)
                    run.note('%s 站 (%.2f,%.2f) yaw 偏 %+.2f pitch %.2f → %s' % (orient, sx, sz, off, pitch, J(v)))
                    if v and v['inView'] and v['clear']:
                        if not best or v['area'] > best['view']['area']:
                            best = dict(rec); best['shot'] = await run.shot(pg, '%s_try_%d' % (orient, len(res['tries'])))
                    if best and best['view']['area'] > (6000 if land else 4000): break
                if best and best['view']['area'] > (6000 if land else 4000): break
            if best: break
        res['best'] = best
        s = await L.state(pg); res['walkFallbacks'] = s['fallbacks'] - fb0
        run.check('%s：走路沒有被放到目的地（walkFallbacks 增加 0）' % orient, res['walkFallbacks'] == 0, str(res['walkFallbacks']))
        run.check('%s：傳單在畫面裡、沒被擋住（有可用的近距離角度）' % orient, bool(best), J(best and best['view']))
        if best:
            # 回到最好的那個角度再截一次（整張＋同一張截圖裁出傳單附近；裁切不改畫面）
            await drag_cam(pg, cdp, best['view']['cam']['yaw'], best['view']['cam']['pitch']); await pg.wait_for_timeout(1000)
            v = await pg.evaluate(VIEW_JS); res['final_view'] = v
            full = await run.shot(pg, orient + '_flyer_full'); res['full'] = full
            if v and v['inView']:
                bb = v['bb']; pad = 40
                clip = {'x': max(0, bb['x0'] - pad), 'y': max(0, bb['y0'] - pad)}
                clip['width'] = min(v['vw'], bb['x1'] + pad) - clip['x']; clip['height'] = min(v['vh'], bb['y1'] + pad) - clip['y']
                cp = os.path.join(OUT, '%02d_%s_flyer_crop.png' % (run.n + 1, orient)); run.n += 1
                await pg.screenshot(path=cp, clip=clip); res['crop'] = cp; res['crop_clip'] = clip
            run.note('%s 最後的畫面：%s；截圖 %s %s' % (orient, J(v), full, res.get('crop')))
        res['rows'] = await pg.evaluate("(window.__PL||[])")
        run.check('%s：沒有 JS 例外' % orient, not errs, J(errs[:3]))
    except Exception as e:
        run.check('%s：跑完（沒有探針例外）' % orient, False, repr(e)[:500]); traceback.print_exc()
        try: await run.shot(pg, orient + '_exception')
        except Exception: pass
    finally:
        with open(os.path.join(OUT, 'transcript_%s.json' % orient), 'w', encoding='utf-8') as f:
            json.dump(res, f, ensure_ascii=False, indent=1)
        try: await asyncio.wait_for(b.close(), 30)
        except Exception: pass
    return res


async def main():
    run = L.Run('fa11_' + '+'.join(ORIENTS), OUT); os.makedirs(OUT, exist_ok=True)
    print('==== FA-11（SHA %s）URL %s ====' % (os.environ.get('SHA', '?'), URL), flush=True)
    if 'turbo' in URL: run.note('注意：URL 有 turbo（驗收計畫寫實玩、不用 turbo）')
    async with async_playwright() as p:
        for o in ORIENTS:
            print('---- %s ----' % o, flush=True)
            await run_orient(p, run, o)
    print('SHA', os.environ.get('SHA', '?'), flush=True)
    sys.exit(run.finish())

if __name__ == '__main__':
    asyncio.run(main())
