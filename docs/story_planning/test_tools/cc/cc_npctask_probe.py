"""CC-C（帳號 C）11-04：NPCTASK_shots（BB-C 21:44；af0170be2 NPC-ANIM-LOOPS-1104：坐著做事的路人，桌子合得上的時候播 LAWWW2 的片段；?nositask＝整個關掉當對照）。
  只截圖、只記錄，不判（穿模、功能 BB 判；人物動作 ART 由 LAWWW 標）。Windows＋GPU（電腦）／SwiftShader（雲端）≠ iPhone；顏色（④）雲端不準，PC 恢復後補。
  地點（LOCS 預設多一個 lin＝林家乾麵 12:15，BB-C 23:13：吃飯先關著，要看沒有人播吃飯片段、手上沒有浮著的筷子）：總圖大廳二樓（library_hall 第 1 層）、總圖 3F（library）、法圖（lawlib）、社科二樓（soclib_2f 第 1 層）、B1（library_b1）；14:00、2025-09-25（四）。
  每個地點：等坐著的人換上做事的片段（CHAR.sitTaskOf：playing、權重 w≥0.95），挑最多 PER（3）個（不同 kind 優先），每個人：
    數字（人物座標 x 左、y 上、z 前；桌面＝座位地面＋sitTask.deskH）：
      ① 兩手手腕離桌面多高（hand_y − 桌面；負的＝穿進桌子）；
      ② shift（往前坐多少，最多 0.12）、lift（往上坐多少，最多 0.015）、桌緣 edge（總圖大廳 0.42 的那些位子：shift 0.12、lift 0.015＝LAWWW-C 說的）；
      ③ 前臂（下臂→手腕）在桌面上方那一段離桌面最近多少（負＝穿進桌子）；寫字：筆（hand_pen）最低點離桌面多少（LAWWW-C：壓進紙 4～5 mm）；
      女生：桌面在身體哪個高度——肩膀（上臂根）、胸口（chest／upperChest）、骨盆離桌面多高（LAWWW2：肩膀只比桌面高 11 cm）。
    截圖（停主迴圈、手動畫一幀；近景約 1 m）：hands（斜前方近看兩手）、zoom（同一點、窄視角放大手）、side（側面，看往前坐自不自然）、front（對面）。
  ⑤ 打字節奏：同一個地點所有打字的人，停主迴圈、固定步長 1/30 跑 10 秒，每 0.5 秒記片段時間（u.amb.tt mod 5）＝相位；也算「兩兩相位差 ±0.25 秒以內」的比例。
  ⑥ 第一次進咖啡廳（兩點半 15:00）、第一次進總圖大廳：進區域那一刻起 15 秒，每一格（requestAnimationFrame）記滑手機的人的右手腕世界座標，列每個人一格裡最大的跳動（LAWWW-C：18 cm）。
     只有「片段晚到」才會跳：所以這兩次放在每一輪（新的頁面）最前面。
  CTL：0＝只跑一般網址、1＝只跑 ?nositask、both（預設）＝兩種都跑（同一個時間、同一個種子）。
  【前置／捷徑】讀檔指定地點時間（條件事件關閉）、固定鏡頭、停主迴圈手動推進（⑤）、玩家藏起來。
用法：LW_TESTS=<wt>/tests [LOCS=hall,lib3f,lawlib,soc2f,b1] [CTL=both] [PER=3] [CC_SEED=...] python3 cc_npctask_probe.py <url> <out>"""
import os, sys, json, asyncio, time, math
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
LOCS = {'hall': ('library_hall', 1, (-6.5, 3.0)), 'lib3f': ('library', 0, None), 'lawlib': ('lawlib', 0, None), 'soc2f': ('soclib_2f', 1, (-0.4, -0.2)), 'b1': ('library_b1', 0, None)}
SEL = [x for x in (os.environ.get('LOCS') or 'hall,lib3f,lawlib,soc2f,b1,lin').split(',') if x in LOCS or x == 'lin']
CTL = os.environ.get('CTL') or 'both'
PER = int(os.environ.get('PER') or 3)
DAY = int(os.environ.get('DAY') or 9)
FAILS = []


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)
    return ok


def info(s): print('INFO ' + s, flush=True)


HUD = """(on=>{ for(const id of ['hud','hudR','minimap','ctlR','joy','interact','toast']){ const e=document.getElementById(id); if(e) e.style.visibility=on?'':'hidden'; } })"""
# 坐著做事的人：位置、片段、權重、shift／lift、骨頭世界座標、桌面、量出來的數字
TASKERS = r"""(()=>{ const E=GAME.E, V=THREE.Vector3, out=[]; if(typeof CHAR==='undefined'||!CHAR.sitTaskOf) return {err:'沒有 CHAR.sitTaskOf', list:out, sitTask:typeof CHAR!=='undefined'?CHAR.sitTask:null};
  for(const n of (E.npcs||[])){ const o=n&&n.obj; if(!o||o.visible===false) continue; const t=CHAR.sitTaskOf(o); const u=o.userData||{}; if(!t) continue;
    const vrm=u.vrm, hb=nm=>{ try{ const b=vrm&&vrm.humanoid&&(vrm.humanoid.getRawBoneNode?vrm.humanoid.getRawBoneNode(nm):vrm.humanoid.getBoneNode(nm)); return b?b.getWorldPosition(new V()):null; }catch(e){ return null; } };
    o.updateWorldMatrix(true,true); const root=o.getWorldPosition(new V()), T=u.sitTask||{}, deskY=root.y+(T.deskH!=null?T.deskH:0.75);
    const loc=p=>p?o.worldToLocal(p.clone()):null, P=k=>{ const w=hb(k); return w?{w:[+w.x.toFixed(3),+w.y.toFixed(3),+w.z.toFixed(3)], l:(q=>[+q.x.toFixed(3),+q.y.toFixed(3),+q.z.toFixed(3)])(loc(w))}:null; };
    const lh=hb('leftHand'), rh=hb('rightHand'), ll=hb('leftLowerArm'), rl=hb('rightLowerArm');
    const fore=(a,b)=>{ if(!a||!b) return null; let mn=null; for(let i=0;i<=10;i++){ const p=a.clone().lerp(b,i/10), q=loc(p); if(q.z<(T.edge!=null?T.edge:0.3)) continue; const d=p.y-deskY; if(mn==null||d<mn) mn=d; } return mn==null?null:+mn.toFixed(4); };
    let pen=null; const pp=u.taskProps&&u.taskProps.hand_pen; if(pp&&pp.visible){ const bx=new THREE.Box3().setFromObject(pp); pen=+(bx.min.y-deskY).toFixed(4); }
    const sh=hb('rightUpperArm'), ch=hb('upperChest')||hb('chest'), hip=hb('hips');
    const f=new V(0,0,1).applyQuaternion(o.getWorldQuaternion(new THREE.Quaternion())), side=new V(1,0,0).applyQuaternion(o.getWorldQuaternion(new THREE.Quaternion()));
    out.push({id:n.charId||n.id||null, name:n.name||'', kind:t.kind, clip:t.clip, body:t.body, prop:t.prop, w:+(+t.w||0).toFixed(2), shift:t.shift, lift:t.lift, deskH:T.deskH, edge:T.edge, phase:u.amb&&u.amb.tt!=null?+((u.amb.tt%5+5)%5).toFixed(2):null,
      root:[+root.x.toFixed(3),+root.y.toFixed(3),+root.z.toFixed(3)], f:[+f.x.toFixed(3),+f.z.toFixed(3)], s:[+side.x.toFixed(3),+side.z.toFixed(3)], deskY:+deskY.toFixed(3),
      handL:lh?+(lh.y-deskY).toFixed(4):null, handR:rh?+(rh.y-deskY).toFixed(4):null, handLl:P('leftHand'), handRl:P('rightHand'), foreL:fore(ll,lh), foreR:fore(rl,rh), pen,
      shoulder:sh?+(sh.y-deskY).toFixed(3):null, chest:ch?+(ch.y-deskY).toFixed(3):null, hips:hip?+(hip.y-deskY).toFixed(3):null,
      mid:lh&&rh?[+((lh.x+rh.x)/2).toFixed(3),+((lh.y+rh.y)/2).toFixed(3),+((lh.z+rh.z)/2).toFixed(3)]:null, hipW:hip?[+hip.x.toFixed(3),+hip.y.toFixed(3),+hip.z.toFixed(3)]:null}); }
  return {list:out, sitTask:CHAR.sitTask, seated:(E.npcs||[]).filter(n=>n&&n.obj&&(n.seat||n.beh==='sit')).length}; })()"""
AIM = """(([e,l,fov])=>{ const E=GAME.E, cam=E.camera; E.paused=true; if(E.player&&E.player.obj) E.player.obj.visible=false; const fov0=cam.fov; E.cinematic(new THREE.Vector3(...e),new THREE.Vector3(...l));
  for(let i=0;i<2;i++){ cam.position.set(...e); E.cam.look=new THREE.Vector3(...l); cam.lookAt(E.cam.look); cam.updateMatrixWorld(); }
  cam.fov=fov; cam.updateProjectionMatrix(); E.render(); const ri=E.renderer.info.render; cam.fov=fov0; cam.updateProjectionMatrix(); return {calls:ri.calls, tris:ri.triangles}; })"""
# 林家乾麵 12:15（BB-C 23:13）：吃飯照 BB 的意見先關著——坐著吃飯的人要播舊的靜態姿勢、不播吃飯片段、手上沒有浮著的筷子（hand_chopsticks）
SEATED_ALL = r"""(()=>{ const E=GAME.E, V=THREE.Vector3, out=[]; for(const n of (E.npcs||[])){ const o=n&&n.obj; if(!o||o.visible===false) continue; const u=o.userData||{}; const sat=!!(n.seat||n.beh==='sit'||n.pose==='sit'||u.sitPose); if(!sat) continue;
    const t=(typeof CHAR!=='undefined'&&CHAR.sitTaskOf)?CHAR.sitTaskOf(o):null; const vrm=u.vrm, hb=nm=>{ try{ const b=vrm&&vrm.humanoid&&(vrm.humanoid.getRawBoneNode?vrm.humanoid.getRawBoneNode(nm):vrm.humanoid.getBoneNode(nm)); return b?b.getWorldPosition(new V()):null; }catch(e){ return null; } };
    o.updateWorldMatrix(true,true); const root=o.getWorldPosition(new V()), lh=hb('leftHand'), rh=hb('rightHand'), hd=hb('head');
    const props=[]; if(u.taskProps) for(const k in u.taskProps){ const q=u.taskProps[k]; let vis=!!(q&&q.visible); for(let x=q;x&&vis;x=x.parent) if(x.visible===false) vis=false; if(vis) props.push(k); }
    let chop=[]; o.traverse(x=>{ if(/chopstick/i.test(x.name||'')){ let vis=x.visible!==false; for(let y=x.parent;y&&vis;y=y.parent) if(y.visible===false) vis=false; if(vis) chop.push(x.name); } });
    const f=new V(0,0,1).applyQuaternion(o.getWorldQuaternion(new THREE.Quaternion())), s=new V(1,0,0).applyQuaternion(o.getWorldQuaternion(new THREE.Quaternion()));
    out.push({id:n.charId||n.id||null, name:n.name||'', task:t?{kind:t.kind,clip:t.clip,playing:t.playing,w:+(+t.w||0).toFixed(2)}:null, act:u.seatAct||u.sitAct||n.act||null, sitPose:u.sitPose||null, hold:u.holdItem||u.hold||null, props, chop,
      root:[+root.x.toFixed(3),+root.y.toFixed(3),+root.z.toFixed(3)], f:[+f.x.toFixed(3),+f.z.toFixed(3)], s:[+s.x.toFixed(3),+s.z.toFixed(3)],
      mid:lh&&rh?[+((lh.x+rh.x)/2).toFixed(3),+((lh.y+rh.y)/2).toFixed(3),+((lh.z+rh.z)/2).toFixed(3)]:null, head:hd?[+hd.x.toFixed(3),+hd.y.toFixed(3),+hd.z.toFixed(3)]:null}); }
  return {list:out, sitTask:typeof CHAR!=='undefined'?CHAR.sitTask:null, zone:GAME.G.zone}; })()"""
RELEASE = "(()=>{ const E=GAME.E; E.paused=false; if(E.player&&E.player.obj) E.player.obj.visible=true; E.endCinematic&&E.endCinematic(); })()"
STEP = """(n=>{ const E=GAME.E; E.paused=true; for(let i=0;i<n;i++){ E.update(1/30); } E.render(); return true; })"""
PHASES = r"""(()=>{ const out=[]; for(const n of (GAME.E.npcs||[])){ const o=n&&n.obj, u=o&&o.userData; const t=o&&CHAR.sitTaskOf&&CHAR.sitTaskOf(o); if(!t||!/^type/.test(t.kind)||!u.amb||u.amb.tt==null) continue; out.push({id:n.charId||n.id||n.name||'', kind:t.kind, ph:+((u.amb.tt%5+5)%5).toFixed(3), w:+(+t.w||0).toFixed(2)}); } return out; })()"""
# ⑥ 進區域那一刻起每一格記滑手機的人的右手腕
REC_ON = r"""(()=>{ window.__ccWr={t0:performance.now(), frames:0, by:{}, kinds:{}}; const V=THREE.Vector3; const tick=()=>{ const R=window.__ccWr; if(!R||R.stop) return; R.frames++;
  try{ for(const n of (GAME.E.npcs||[])){ const o=n&&n.obj, u=o&&o.userData; if(!o||!u||!u.vrm) continue; const t=CHAR.sitTaskOf&&CHAR.sitTaskOf(o); const phone=(t&&t.kind==='phone')||(u.sitPose==='read'&&/phone/.test(String(u.holdItem||u.hold||'')))||(n.pose==='read'&&/phone/i.test(String(n.item||'')));
      if(!phone) continue; let b=null; try{ b=u.vrm.humanoid.getRawBoneNode?u.vrm.humanoid.getRawBoneNode('rightHand'):u.vrm.humanoid.getBoneNode('rightHand'); }catch(e){} if(!b) continue; const p=b.getWorldPosition(new V()), k=String(n.charId||n.id||n.name||'?')+'@'+(o.position.x).toFixed(1)+','+(o.position.z).toFixed(1);
      const A=R.by[k]||(R.by[k]={n:0,last:null,max:0,maxAt:null,task:[]}); if(A.last){ const d=Math.hypot(p.x-A.last[0],p.y-A.last[1],p.z-A.last[2]); if(d>A.max){ A.max=d; A.maxAt=+((performance.now()-R.t0)/1000).toFixed(2); } } A.last=[p.x,p.y,p.z]; A.n++;
      const tk=t?t.kind+':'+(+t.w||0).toFixed(2):'none'; if(!A.task.length||A.task[A.task.length-1][0]!==tk) A.task.push([tk,+((performance.now()-R.t0)/1000).toFixed(2)]); } }catch(e){}
  requestAnimationFrame(tick); }; requestAnimationFrame(tick); return true; })()"""
REC_OFF = "(()=>{ const R=window.__ccWr; if(!R) return null; R.stop=true; const out={frames:R.frames, secs:+((performance.now()-R.t0)/1000).toFixed(1), people:Object.entries(R.by).map(([k,A])=>({k, n:A.n, maxJump_cm:+(A.max*100).toFixed(1), at:A.maxAt, task:A.task.slice(0,6)}))}; window.__ccWr=null; return out; })()"


async def enter(pg, cdp, zone, lv, pos, h=14.0):
    st = {'zone': zone, 'hour': h, 'day': DAY, 'weather': 'clear'}
    if pos: st['pos'] = {'x': pos[0], 'z': pos[1], 'yaw': 0, 'lv': lv}
    await pg.evaluate(RELEASE)
    await L.load_state(pg, st, quiet_events=True)
    await pg.wait_for_timeout(3000); await L.close_panels(pg, cdp)


async def wait_tasks(pg, maxs=75):
    t0 = time.time(); r = None
    while time.time() - t0 < maxs:
        r = await pg.evaluate(TASKERS)
        if r.get('list') and all(x['w'] >= 0.95 for x in r['list'][:PER]): break
        await pg.wait_for_timeout(2500)
    return r, time.time() - t0


async def run_mode(p, mode, meta):
    url = URL + ('' if mode == 'amb' else ('&' if '?' in URL else '?') + 'nositask')
    print('== %s：%s' % (mode, url), flush=True)
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    await cc_det.install(pg, int(os.environ.get('CC_SEED') or 1104))
    t0 = time.time(); await pg.goto(url); ok = await L.wait_loaded(pg); check('[%s] 遊戲載入' % mode, ok, '%.0f 秒' % (time.time() - t0))
    if not ok: await b.close(); return
    await pg.evaluate("localStorage.clear(); if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}")
    st = await pg.evaluate("({sitTask:typeof CHAR!=='undefined'?CHAR.sitTask:null, fn:typeof CHAR!=='undefined'&&typeof CHAR.sitTaskOf})")
    check('[%s] CHAR.sitTask=%s（一般網址要 true、?nositask 要 false）' % (mode, st['sitTask']), st['sitTask'] == (mode == 'amb') and st['fn'] == 'function', J(st))
    M = meta.setdefault(mode, {'locs': {}, 'entry': {}})
    # ⑥ 第一次進咖啡廳、第一次進總圖大廳（片段還沒下載＝會跳的那一刻）
    for zname, zone, lv, pos, hh in (('cafe', 'cafe', 0, None, 15.0), ('hall', 'library_hall', 1, (-6.5, 3.0), 14.0)):
        await pg.evaluate(REC_ON)
        st2 = {'zone': zone, 'hour': hh, 'day': DAY, 'weather': 'clear'}
        if pos: st2['pos'] = {'x': pos[0], 'z': pos[1], 'yaw': 0, 'lv': lv}
        await L.load_state(pg, st2, quiet_events=True)
        await pg.wait_for_timeout(15000)
        r = await pg.evaluate(REC_OFF); M['entry'][zname] = r
        big = [x for x in (r or {}).get('people', []) if x['maxJump_cm'] >= 10]
        info('[%s] ⑥ 第一次進 %s：%s 格／%s 秒、滑手機的人 %d 個；一格裡右手腕最大的跳動 %s；≥10 cm 的 %s' % (mode, zone, r and r['frames'], r and r['secs'], len((r or {}).get('people', [])),
             J(sorted([x['maxJump_cm'] for x in (r or {}).get('people', [])], reverse=True)[:6]), J(big)))
    if 'lin' in SEL:
        print('  [前置／捷徑] 讀檔：林家乾麵（wz_lin）12:15、day %d、條件事件關閉' % DAY, flush=True)
        await enter(pg, cdp, 'wz_lin', 0, None, 12.25)
        await pg.wait_for_timeout(8000)
        r = await pg.evaluate(SEATED_ALL); Ls = r.get('list') or []
        zok = r.get('zone')
        if check('[%s lin] 讀到 wz_lin、有坐著的客人' % mode, zok == 'wz_lin' and len(Ls) > 0, J({'zone': zok, 'n': len(Ls)})):
            info('[%s lin] 坐著的 %d 人：%s' % (mode, len(Ls), J([[x['name'] or x['id'], x['task'], x['act'], x['sitPose'], x['hold'], x['props'], x['chop']] for x in Ls])))
            eat = [x for x in Ls if x['task'] and 'eat' in str(x['task'].get('kind', ''))]
            chop = [x for x in Ls if x['chop'] or any('chop' in p for p in x['props'])]
            check('[%s lin] 吃飯先關著：沒有人播吃飯片段（sitTaskOf 不是 eat）（BB-C 23:13）' % mode, not eat, J([[x['name'], x['task']] for x in eat]))
            check('[%s lin] 手上沒有浮著的筷子（hand_chopsticks 看得到的 0 個）' % mode, not chop, J([[x['name'], x['props'], x['chop']] for x in chop]))
            await pg.evaluate(HUD + '(false)')
            for i, x in enumerate(Ls[:2]):
                mid = x['mid'] or [x['root'][0] + x['f'][0] * 0.35, x['root'][1] + 0.8, x['root'][2] + x['f'][1] * 0.35]
                f, sv = x['f'], x['s']
                cams = {'hands': ([mid[0] - f[0] * 0.25 + sv[0] * 0.65, mid[1] + 0.45, mid[2] - f[1] * 0.25 + sv[1] * 0.65], mid, 45),
                        'front': ([mid[0] + f[0] * 0.95, mid[1] + 0.35, mid[2] + f[1] * 0.95], [mid[0], mid[1] + 0.1, mid[2]], 50),
                        'side': ([x['root'][0] + sv[0] * 1.3 + f[0] * 0.2, mid[1] + 0.1, x['root'][2] + sv[1] * 1.3 + f[1] * 0.2], [x['root'][0] + f[0] * 0.25, mid[1], x['root'][2] + f[1] * 0.25], 50)}
                for cn, (e, l, fov) in cams.items():
                    await pg.evaluate(AIM + '(%s)' % J([e, l, fov]))
                    await pg.screenshot(path=os.path.join(OUT, 'npctask_%s_lin_%d_%s.png' % (mode, i, cn)))
            await pg.evaluate(RELEASE); await pg.evaluate(HUD + '(true)')
        M['locs']['lin'] = {'seated': Ls}
    for key in [k for k in SEL if k in LOCS]:
        zone, lv, pos = LOCS[key]
        await enter(pg, cdp, zone, lv, pos)
        r, sec = await wait_tasks(pg) if mode == 'amb' else (await pg.evaluate(TASKERS), 0)
        zok = await pg.evaluate("GAME.G.zone")
        if not check('[%s %s] 讀到 %s' % (mode, key, zone), zok == zone, zok): continue
        L0 = r.get('list') or []
        info('[%s %s] 坐著的人 %s、在做事的 %d（%s）；等了 %.0f 秒' % (mode, key, r.get('seated'), len(L0), J(sorted(set(x['kind'] for x in L0))), sec))
        M['locs'][key] = {'all': L0}
        # 挑：不同 kind 優先；女生優先一位（量桌面在身體哪裡）
        pick, kinds = [], set()
        for x in sorted(L0, key=lambda x: (x['kind'] in kinds, x['body'] != 'F')):
            if len(pick) >= PER: break
            if x['kind'] in kinds and len(pick) < PER - 1: continue
            pick.append(x); kinds.add(x['kind'])
        if mode == 'amb' and not L0: check('[%s %s] 有人在做事（sitTaskOf playing）' % (mode, key), False, '一個都沒有'); continue
        await pg.evaluate(HUD + '(false)')
        for i, x in enumerate(pick):
            mid = x['mid'] or [x['root'][0] + x['f'][0] * 0.35, x['deskY'] + 0.05, x['root'][2] + x['f'][1] * 0.35]
            f, s = x['f'], x['s']
            cams = {'hands': ([mid[0] - f[0] * 0.25 + s[0] * 0.65, mid[1] + 0.45, mid[2] - f[1] * 0.25 + s[1] * 0.65], mid, 45),
                    'zoom': ([mid[0] - f[0] * 0.25 + s[0] * 0.65, mid[1] + 0.45, mid[2] - f[1] * 0.25 + s[1] * 0.65], mid, 18),
                    'side': ([x['root'][0] + s[0] * 1.3 + f[0] * 0.2, x['deskY'] + 0.05, x['root'][2] + s[1] * 1.3 + f[1] * 0.2], [x['root'][0] + f[0] * 0.2, x['deskY'] - 0.05, x['root'][2] + f[1] * 0.2], 50),
                    'front': ([mid[0] + f[0] * 0.95, mid[1] + 0.35, mid[2] + f[1] * 0.95], [mid[0], mid[1] + 0.1, mid[2]], 50)}
            for cn, (e, l, fov) in cams.items():
                ri = await pg.evaluate(AIM + '(%s)' % J([e, l, fov]))
                fn = 'npctask_%s_%s_%d_%s_%s.png' % (mode, key, i, x['kind'], cn)
                await pg.screenshot(path=os.path.join(OUT, fn))
            info('[%s %s #%d] %s %s（%s）：w %s、shift %s、lift %s、桌面 %s、桌緣 %s｜① 手腕離桌面 左 %s 右 %s｜③ 前臂在桌上那段離桌面最近 左 %s 右 %s、筆最低點 %s｜身體：肩膀 %s、胸口 %s、骨盆 %s（離桌面，m）｜相位 %s' % (
                mode, key, i, x['kind'], x['body'], x['clip'], x['w'], x['shift'], x['lift'], x['deskH'], x['edge'], x['handL'], x['handR'], x['foreL'], x['foreR'], x['pen'], x['shoulder'], x['chest'], x['hips'], x['phase']))
        if mode == 'amb' and key == 'hall':
            e042 = [x for x in L0 if x['edge'] is not None and abs(x['edge'] - 0.42) < 0.03]
            info('[amb hall] ② 桌緣 0.42 m 的位子：%d 人；shift／lift＝%s（LAWWW-C：往前 0.12、往上 0.015）' % (len(e042), J([[x['kind'], x['body'], x['shift'], x['lift']] for x in e042])))
        fem = [x for x in L0 if x['body'] == 'F'][:2]
        if fem: info('[%s %s] 女生坐著桌面在身體哪裡：%s（肩膀／胸口／骨盆離桌面，m）' % (mode, key, J([[x['kind'], x['shoulder'], x['chest'], x['hips']] for x in fem])))
        # ⑤ 打字節奏：停主迴圈固定步長跑 10 秒，每 0.5 秒記相位
        if mode == 'amb':
            seq = []
            for k in range(21):
                seq.append(await pg.evaluate(PHASES))
                await pg.evaluate(STEP + '(15)')
            typ = seq[0]
            if len(typ) >= 2:
                ph = [x['ph'] for x in typ]; pairs = [(a, b2) for i2, a in enumerate(ph) for b2 in ph[i2 + 1:]]
                close = sum(1 for a, b2 in pairs if min(abs(a - b2), 5 - abs(a - b2)) <= 0.25)
                info('[amb %s] ⑤ 打字的 %d 人：起始相位 %s；兩兩相位差 ±0.25 秒以內 %d／%d；10 秒後 %s' % (key, len(typ), J(ph), close, len(pairs), J([x['ph'] for x in seq[-1]])))
                M['locs'][key]['typePhases'] = seq
            else:
                info('[amb %s] ⑤ 打字的人 %d 個（不夠比節奏）' % (key, len(typ)))
            await pg.evaluate(RELEASE)
        await pg.evaluate(HUD + '(true)')
    check('[%s] 沒有 JS 例外' % mode, not errs, J(errs[:3]))
    await b.close()


async def main():
    os.makedirs(OUT, exist_ok=True)
    print('CC NPCTASK_shots：LOCS=%s、CTL=%s、PER=%d；SHA=%s；Windows＋GPU／SwiftShader ≠ iPhone（顏色 ④ 雲端不準）' % (SEL, CTL, PER, os.environ.get('SHA', '?')), flush=True)
    meta = {}
    modes = {'0': ['amb'], '1': ['ctl'], 'both': ['amb', 'ctl']}.get(CTL, ['amb', 'ctl'])
    async with async_playwright() as p:
        for m in modes: await run_mode(p, m, meta)
    json.dump(meta, open(os.path.join(OUT, 'npctask.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS)), flush=True)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
