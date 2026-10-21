"""BB（帳號 A）2026-10-21：UX-KAI-TAPE-CAM-1021（LAWWW 2eba2fab）——ev_kai_tape2（10/30 18:00 以後第一次回 203）開場鏡頭貼近地上的膠帶，讀得到「法律系免簽」。
【前置／捷徑】讀使用者 9/25 存檔，改到 2025-10-30（四）；ev_kai_tape 演過＋KAI_TAPE（10/27 第一晚的「國界」）。之後照玩家：
  W_L：橫向。17:50 在 203 → 走出房門到走廊 → 等到 18:01 → 走回房門、點門進去（enter 事件；模型已經載過）
  W_P：直向，同上
  S_L：橫向。17:57 人在 203 裡，等到 18:00（Y1FILL.tapeDue：時間到了、人在房間）
  C_L：橫向。18:05 從宿舍一樓（讀檔直接在走廊，203 的模型這次還沒載過）走上二樓、點門進去——讀檔以後第一次進房間
每一個：開場第一句（旁白「膠帶上多了一行麥克筆的大字…」）的時候量：鏡頭有沒有用 ev.shot、字（Y1_KAI_TAPE_TEXT）投影到畫面的範圍（整段在畫面裡嗎、多大）、
有沒有被對話框／標題字幕／立繪／其他介面蓋住；截圖＋把字那一塊另存。第二句（阿凱說話）立繪出來；演完以後地上還是寫字的那段、鏡頭回到跟隨。
只加記錄（包 GAME.cine、E.cinematic 記參數），不改遊戲。Playwright 手機模擬（844×390／390×844）、?turbo，不是 iPhone。
用法：LW_TESTS=<開發分支>/tests python3 tapecam_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>"""
import os, sys, json, asyncio, time
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
SCEN = os.environ.get('SCEN', 'W_L,W_P,S_L,C_L').split(',')
def say(*a): print(' '.join(str(x) for x in a), flush=True)

HOOK = """(()=>{ if(window.__TC) return; window.__TC=1; window.__CINE=[];
  const oc=GAME.cine; GAME.cine=function(kind,A,B,opt){ try{ const o=opt||{}; window.__CINE.push({kind, pos:o.pos?o.pos.toArray().map(v=>+v.toFixed(3)):null, look:o.look?o.look.toArray().map(v=>+v.toFixed(3)):null, ev:(typeof EVENTS!=='undefined'&&EVENTS.running)||null, t:Date.now()}); }catch(e){} return oc.apply(this,arguments); };
  window.__TZ={}; setInterval(()=>{ try{ const T=window.__TZ, now=Date.now(), h=+GAME.G.hour; if(T.dormAt==null&&GAME.G.zone==='dorm'){ T.dormAt=now; T.dormH=h; } if(T.evAt==null&&typeof EVENTS!=='undefined'&&EVENTS.running==='ev_kai_tape2'){ T.evAt=now; T.evH=h; T.txtAtEv=!!GAME.E.scene.getObjectByName('Y1_KAI_TAPE_TEXT'); } }catch(e){} },100);
  const E=GAME.E, ocm=E.cinematic; E.cinematic=function(p,l){ try{ window.__CINE.push({kind:'E.cinematic', pos:p?[+p.x.toFixed(3),+p.y.toFixed(3),+p.z.toFixed(3)]:null, look:l?[+l.x.toFixed(3),+l.y.toFixed(3),+l.z.toFixed(3)]:null, ev:(typeof EVENTS!=='undefined'&&EVENTS.running)||null, t:Date.now()}); }catch(e){} return ocm.apply(this,arguments); }; })()"""

MEAS = """(()=>{ const E=GAME.E, cam=E.camera, sc=E.scene; const t=sc.getObjectByName('Y1_KAI_TAPE_TEXT'), m=sc.getObjectByName('Y1_KAI_TAPE_MID');
  const eff=o=>{ if(!o) return false; for(let p=o;p;p=p.parent) if(!p.visible) return false; return true; };
  const cv=document.getElementById('c').getBoundingClientRect(); let px=null, box=null, behind=false;
  if(t){ t.updateWorldMatrix(true,true); cam.updateMatrixWorld(); const b=new THREE.Box3().setFromObject(t); const pts=[];
    for(const x of [b.min.x,b.max.x]) for(const y of [b.min.y,b.max.y]) for(const z of [b.min.z,b.max.z]){ const v=new THREE.Vector3(x,y,z).project(cam); if(v.z>1) behind=true; pts.push([cv.left+(v.x+1)/2*cv.width, cv.top+(1-v.y)/2*cv.height]); }
    const xs=pts.map(p=>p[0]), ys=pts.map(p=>p[1]); px=[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)].map(v=>Math.round(v));
    box={c:b.getCenter(new THREE.Vector3()).toArray().map(v=>+v.toFixed(2)), s:b.getSize(new THREE.Vector3()).toArray().map(v=>+v.toFixed(3))}; }
  const vis=e=>{ if(!e) return false; for(let p=e;p&&p!==document.body;p=p.parentElement){ if(p.classList&&p.classList.contains('hide')) return false; const cs=getComputedStyle(p); if(cs.display==='none'||cs.visibility==='hidden'||+cs.opacity<0.05) return false; } return true; };
  const R=e=>{ if(!vis(e)) return null; const r=e.getBoundingClientRect(); return r.width>2&&r.height>2?[Math.round(r.left),Math.round(r.top),Math.round(r.right),Math.round(r.bottom)]:null; };
  const ui={}; for(const id of ['dlg','caption','advTop','choices','toast','hud','hudR','minimap','goal','guide','clock','money','btnPhone','btnMenu','interact','joy','nextClass','phone','fade']){ const r=R(document.getElementById(id)); if(r) ui[id]=r; }
  for(const s of ['advL','advR']){ const sl=document.getElementById(s); if(sl&&sl.classList.contains('show')){ const im=sl.querySelector('img'); const r=R(im)||R(sl); if(r) ui[s]=r; } }
  const over=(a,b)=>!!a&&!!b&&a[0]<b[2]&&b[0]<a[2]&&a[1]<b[3]&&b[1]<a[3];
  const hits=px?Object.keys(ui).filter(k=>k!=='fade'&&over(px,ui[k])):[];
  const fade=(()=>{ const f=document.getElementById('fade'); return f?+getComputedStyle(f).opacity:0; })();
  const dl=(document.getElementById('dlgText')||{}).textContent||'', nm=(document.getElementById('dlgName')||{}).textContent||'';
  const advCls=(document.getElementById('adv')||{}).className||'';
  const cp=cam.position; return {ev:(typeof EVENTS!=='undefined'&&EVENTS.running)||null, zone:GAME.G.zone, h:+(+GAME.G.hour).toFixed(2), txtVis:eff(t), midVis:eff(m), hasTxt:!!t, px, box, behind, vw:innerWidth, vh:innerHeight,
    inView:!!px&&!behind&&px[0]>=0&&px[1]>=0&&px[2]<=innerWidth&&px[3]<=innerHeight, ui, hits, fade, dlg:dl.slice(0,40), name:nm, advCls, cam:[+cp.x.toFixed(2),+cp.y.toFixed(2),+cp.z.toFixed(2)], cine:E.cam.mode==='cinematic', fov:cam.fov, asp:+cam.aspect.toFixed(3),
    done:!!((GAME.G.events||{}).done||{}).ev_kai_tape2 }; })()"""


async def tapw(pg, cdp, label):
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(900)


async def settle(pg, cdp, until_js, secs=180, keep_tape=True):
    """等 until_js 成立；中間的其他對話照點、選項選最後一個（通常是「不／之後」），手機跳出來就收起來（照玩家）。keep_tape：ev_kai_tape2 開始就停（不點它的對話）"""
    t0 = time.time()
    while time.time() - t0 < secs:
        if await pg.evaluate(until_js): return True
        if keep_tape and await pg.evaluate("(typeof EVENTS!=='undefined'&&EVENTS.running)==='ev_kai_tape2'"): return True
        s = await L.state(pg)
        if s['choices']:
            c = await pg.evaluate("(()=>{ const bs=[...document.querySelectorAll('#choices button')]; const e=bs.find(x=>/不|晚一點|之後|待著|先不/.test(x.textContent))||bs[bs.length-1]; const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,e.textContent.trim().slice(0,24)]; })()")
            await L.touch_tap(cdp, c[0], c[1]); say('   ▶ 選項：', c[2]); await pg.wait_for_timeout(900); continue
        if s['dlg']:
            say('   （對話：%s）' % (s.get('dtext') or '')[:40]); await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
        if await pg.evaluate("!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())"): await L.phone_away(pg, cdp); continue
        await pg.wait_for_timeout(700)
    return False


async def crop(pg, run, tag, px):
    if not px: return None
    x0, y0, x1, y1 = max(0, px[0] - 24), max(0, px[1] - 24), px[2] + 24, px[3] + 24
    vw, vh = await pg.evaluate("[innerWidth, innerHeight]"); x1, y1 = min(vw, x1), min(vh, y1)
    if x1 - x0 < 4 or y1 - y0 < 4: return None
    p = os.path.join(OUT, '%s_crop.png' % tag); await pg.screenshot(path=p, clip={'x': x0, 'y': y0, 'width': x1 - x0, 'height': y1 - y0}); return p


async def one(p, base, sid, run):
    land = not sid.endswith('_P'); mode = sid.split('_')[0]
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=land)
    if mode == 'F':   # 模型載不到（載入失敗）：擋掉 dorm_y1_items 的下載，看 12 秒保底會不會照原本的鏡頭演（LAWWW 2469df7f）
        async def _abort(route): await route.abort()
        await ctx.route('**/*dorm_y1_items*', _abort)
    res = {'id': sid, 'bad': [], 'notes': []}; bad = res['bad']
    try:
        await pg.goto(URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
        st = json.loads(json.dumps(base)); G = st.get('G', st)
        d = await pg.evaluate("STORY.dayOfKey('2025-10-30')")
        h0, zone = {'W': (17.83, 'dorm'), 'S': (17.95, 'dorm'), 'C': (18.08, 'dorm_hall'), 'F': (18.08, 'dorm_hall')}[mode]
        G.update({'day': d, 'hour': h0, 'zone': zone, 'pos': None, 'weekday': 4})
        G['flags'].update({'KAI_TAPE': True}); ev = G.setdefault('events', {}); ev.setdefault('done', {})['ev_kai_tape'] = 1; ev['done'].pop('ev_kai_tape2', None)
        await L.load_state(pg, G); await pg.wait_for_timeout(4000); await pg.evaluate(HOOK)
        run.setup('[前置／捷徑] %s：使用者 9/25 存檔改到 2025-10-30 %.2f %s；ev_kai_tape 演過＋KAI_TAPE（第一晚的「國界」）' % (sid, h0, zone))
        await settle(pg, cdp, "false", secs=8, keep_tape=True)   # 讀檔以後補演的、手機（照實收起來）
        if mode == 'W':
            await pg.wait_for_timeout(4000)   # 房間的模型載好
            pre = await pg.evaluate("(()=>{ const t=GAME.E.scene.getObjectByName('Y1_KAI_TAPE_TEXT'); return {hasTxt:!!t}; })()"); say('   %s：在 203，模型 %s' % (sid, pre))
            door = await pg.evaluate("(()=>{ const it=(GAME.E.interactables||[]).find(i=>!i.hidden&&i.exit&&i.exit.to!=='dorm'); return it?[it.x,it.z,it.label||'',it.exit.to]:null; })()")
            say('   房門：%s' % door)
            if not door: bad.append('203 找不到出去的門'); raise RuntimeError('no door')
            await L.go_to(pg, cdp, run, door[0], door[1], 0.8, door[2], max_s=120); await tapw(pg, cdp, door[2])
            await settle(pg, cdp, "GAME.G.zone!=='dorm'&&!GAME.E.player.busy", secs=60)
            say('   出房門：%s %.2f' % tuple(await pg.evaluate("[GAME.G.zone, +GAME.G.hour]")))
            await settle(pg, cdp, "+GAME.G.hour>=18.02", secs=420)   # 在走廊等到 18:01 以後（時間照走）
            await pg.evaluate("window.__TZ={}")   # 從走廊再進房間才開始算
            say('   走廊等到：%.2f' % await pg.evaluate("+GAME.G.hour"))
        if mode in ('W', 'C', 'F'):
            d203 = await pg.evaluate("(()=>{ const it=(GAME.E.interactables||[]).find(i=>!i.hidden&&i.exit&&i.exit.to==='dorm'); return it?[it.x,it.z,it.label||'',it.lv|0]:null; })()")
            say('   房門（走廊那一側）：%s；玩家 lv=%s' % (d203, await pg.evaluate("GAME.E.player.lv|0")))
            if not d203: bad.append('走廊找不到 203 的門'); raise RuntimeError('no 203 door')
            ok = await L.go_to(pg, cdp, run, d203[0], d203[1], 0.6, d203[2], max_s=300, lv=d203[3])
            await tapw(pg, cdp, d203[2])
            for k in range(3):
                if await pg.evaluate("GAME.G.zone==='dorm'"): break
                await pg.wait_for_timeout(1500); await tapw(pg, cdp, d203[2])
        # 等 ev_kai_tape2 開始（時間到／進門）
        got = await settle(pg, cdp, "(typeof EVENTS!=='undefined'&&EVENTS.running)==='ev_kai_tape2'", secs=240)
        if not got: bad.append('ev_kai_tape2 沒有開始（%s）' % json.dumps(await pg.evaluate(MEAS), ensure_ascii=False)[:200]); raise RuntimeError('no event')
        await pg.wait_for_timeout(400)   # 頁面裡每 100 ms 記一次：剛偵測到開演時可能還沒記到
        tz = await pg.evaluate("(()=>{ const T=Object.assign({},window.__TZ||{}); const c=(window.__CINE||[]).find(x=>x.ev==='ev_kai_tape2'); if(c) T.cineAt=c.t; return T; })()"); res['tz'] = tz
        ev_at = tz.get('evAt') or tz.get('cineAt')
        if tz.get('dormAt') is not None and ev_at is not None:
            say('   進 203 → 開演：%.1f 秒%s；開演時膠帶模型 %s' % ((ev_at - tz['dormAt']) / 1000, '（遊戲時間 %.1f 分鐘）' % ((tz['evH'] - tz['dormH']) * 60) if tz.get('evH') is not None else '', '在' if tz.get('txtAtEv') else ('還沒載到' if 'txtAtEv' in tz else '?')))
        # 第一句（旁白）出現
        t0 = time.time(); m1 = None
        while time.time() - t0 < 30:
            m = await pg.evaluate(MEAS)
            if '膠帶上多了一行' in m['dlg']: m1 = m; break
            await pg.wait_for_timeout(300)
        say('   第一句出現時：%s' % json.dumps(m1, ensure_ascii=False))
        if not m1: bad.append('第一句「膠帶上多了一行…」沒有出現'); raise RuntimeError('no line')
        shots = []
        for k, wait in enumerate((0, 1800, 3500)):   # 標題字幕 1.5 秒、鏡頭移過去要一點時間：剛出現、1.8 秒、5.3 秒各量一次
            if wait: await pg.wait_for_timeout(wait)
            m = await pg.evaluate(MEAS); shots.append(m); tag = '%s_line1_%d' % (sid, k)
            await run.shot(pg, tag); c = await crop(pg, run, tag, m['px'] if m['inView'] else None)
            say('   第一句 +%.1f s：字在畫面 %s（%s×%s px）、蓋到：%s、立繪：%s、鏡頭 %s、advCls=%s%s' % (sum((0, 1800, 3500)[:k + 1]) / 1000, m['px'], (m['px'][2] - m['px'][0]) if m['px'] else '-', (m['px'][3] - m['px'][1]) if m['px'] else '-', m['hits'], [s for s in ('advL', 'advR') if s in m['ui']], m['cam'], m['advCls'], '、放大：' + os.path.basename(c) if c else ''))
        cines = await pg.evaluate("(window.__CINE||[]).filter(c=>c.ev==='ev_kai_tape2')"); res['cine'] = cines
        say('   這個事件的鏡頭呼叫：%s' % json.dumps(cines, ensure_ascii=False))
        last = shots[-1]; res['line1'] = shots
        used = any(c['kind'] == 'close' and c['pos'] for c in cines)
        if mode == 'F':
            res['notes'].append('F：模型載不到，照原本的鏡頭演（%s）' % ('ev.shot' if used else 'talk'))
        elif not used: bad.append('開場沒有用 ev.shot（%s）——模型沒載到？' % json.dumps(cines, ensure_ascii=False)[:160])
        if mode != 'F':
            if not last['txtVis'] or last['midVis']: bad.append('第一句時地上不是寫字的那段（TEXT %s、MID %s）' % (last['txtVis'], last['midVis']))
            if not last['inView']: bad.append('第一句時字不在畫面裡（%s，畫面 %d×%d）' % (last['px'], last['vw'], last['vh']))
            cover = [h for h in last['hits'] if h not in ('fade',)]
            if cover: bad.append('第一句時字被蓋住：%s（字 %s；%s）' % (cover, last['px'], json.dumps({k: last['ui'][k] for k in cover})))
            if last['px'] and min(last['px'][2] - last['px'][0], last['px'][3] - last['px'][1]) < 14: bad.append('字太小（範圍 %s）' % last['px'])
        if any(s in last['ui'] for s in ('advL', 'advR')): bad.append('第一句（旁白）就出現立繪（portraitLater 沒生效）')
        if last['fade'] > 0.3: bad.append('第一句時畫面還在淡出入（fade %.2f）' % last['fade'])
        # 第二句（阿凱）
        await L.tap(pg, cdp, '#dlg'); m2 = None; t0 = time.time()
        while time.time() - t0 < 20:
            m = await pg.evaluate(MEAS)
            if '國界放寬' in m['dlg'] or '期中考完了' in m['dlg']: m2 = m; break
            await pg.wait_for_timeout(300)
        if m2:
            await pg.wait_for_timeout(1200); m2 = await pg.evaluate(MEAS); await run.shot(pg, '%s_line2' % sid)
            say('   第二句：name=%s、立繪 %s、字 %s、蓋到 %s' % (m2['name'], [s for s in ('advL', 'advR') if s in m2['ui']], m2['px'], m2['hits']))
            if not any(s in m2['ui'] for s in ('advL', 'advR')): res['notes'].append('第二句（阿凱說話）沒有立繪（阿凱可能沒有立繪＝compact，照實記）')
        else: bad.append('第二句（阿凱「期中考完了。國界放寬。」）沒有出現')
        res['line2'] = m2
        # 演完
        await settle(pg, cdp, "!(typeof EVENTS!=='undefined'&&EVENTS.running)&&!document.getElementById('dlg').offsetParent", secs=60, keep_tape=False)
        await pg.wait_for_timeout(2500); m3 = await pg.evaluate(MEAS); await run.shot(pg, '%s_after' % sid); res['after'] = m3
        aw = float(os.environ.get('AFTER_WAIT', '0') or 0)   # 演完以後多等幾秒再看一次地上的字（劇情的 tick 每 0.5 秒遊戲時間才跑；低幀率下 2.5 秒可能一次都還沒跑）
        if aw:
            await pg.wait_for_timeout(int(aw * 1000)); m4 = await pg.evaluate(MEAS); res['after2'] = m4
            say('   演完 +%.0f 秒：%s' % (aw + 2.5, json.dumps({k: m4[k] for k in ('ev', 'done', 'txtVis', 'midVis', 'h')}, ensure_ascii=False)))
            await pg.evaluate("(()=>{ const t=GAME.E.scene.getObjectByName('Y1_KAI_TAPE_TEXT')||GAME.E.scene.getObjectByName('Y1_KAI_TAPE_MID'); if(!t) return; const c=new THREE.Box3().setFromObject(t).getCenter(new THREE.Vector3()); GAME.E.cinematic(new THREE.Vector3(c.x-0.6,0.9,c.z), c); GAME.E.snapCinematic(); })()")
            await pg.wait_for_timeout(2000); await run.shot(pg, '%s_after_floor' % sid); await pg.evaluate("(()=>{ try{ GAME.E.endCinematic(); }catch(e){} })()")
            m3 = m4
        say('   演完：%s' % json.dumps({k: m3[k] for k in ('ev', 'done', 'txtVis', 'midVis', 'cam', 'cine', 'zone')}, ensure_ascii=False))
        if not m3['done']: bad.append('演完沒有記 ev_kai_tape2 done')
        if mode != 'F' and (not m3['txtVis'] or m3['midVis']): bad.append('演完以後地上不是寫字的那段（TEXT %s、MID %s）' % (m3['txtVis'], m3['midVis']))
    except RuntimeError as e: say('   ⚠ %s 中止：%s' % (sid, e))
    except Exception as e: bad.append('腳本例外：%s' % str(e)[:200]); say('   ! 例外', e)
    if errs: bad.append('JS 例外 %s' % json.dumps(errs[:2], ensure_ascii=False)[:200])
    try: await asyncio.wait_for(b.close(), 30)
    except Exception: pass
    return res


async def main():
    run = L.Run('tapecam', OUT); base = json.load(open(SAVE, encoding='utf-8')); out = []
    async with async_playwright() as p:
        for sid in SCEN:
            say('== %s' % sid); r = await one(p, base, sid, run); out.append(r)
            run.check('%s：10/30 晚回 203，ev_kai_tape2 開場鏡頭讀得到「法律系免簽」（整段在畫面、沒被蓋、沒立繪、演完還是寫字那段）' % sid, not r['bad'], json.dumps(r['bad'][:5], ensure_ascii=False))
            json.dump(out, open(os.path.join(OUT, 'tapecam.json'), 'w'), ensure_ascii=False, indent=1)
    run.finish()
asyncio.run(main())
