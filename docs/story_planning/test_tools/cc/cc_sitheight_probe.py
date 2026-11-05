"""CC-C（帳號 C）11-05：SIT-HEIGHT＋吃飯（BB-C 00:25；SHA f5c38f2ba＝坐下高度 b1ca12646＋吃飯 71ba5870e）。只截圖、量數字，判定歸 BB（雲端看穿模、坐得高不高；顏色 PC 補）。
  BB-C 已知照舊、不判：裙子坐下穿過椅面；階梯教室高個子男生的腳陷進平台最多 7 cm；0.485 的椅子陷 2 cm、0.45 的長椅浮 1.5 cm。
  MODE（預設全部，逗號分開）：
   eat    林家乾麵（wz_lin）12:15：吃飯的人（CHAR.sitTaskOf kind eat*）——右手筷子（hand_chopsticks 看得到）、筷子尖離嘴最近多少（5 秒片段每 0.25 秒）、
          左手離碗最近多少、眼睛離碗多遠（LAWWW 量約 37 cm）、桌上那一雙筷子藏起來了沒（同一張桌子 0.6 m 內看得到的 chopstick 0 個）；側面、正面、送到嘴邊那一格各一張。
   rooms  階梯教室 201（classroom）、博思 101（boya）、共同教學館（gongtong）、總圖大廳二樓自習區（library_hall 第 1 層）：上課／自習的時候進去，
          挑 2 個女生＋1 個最高的男生：大腿（骨盆→膝蓋那一段）最低點離座面、膝蓋高度、肩膀／手肘／眼睛離桌面多高；側面、正面、膝蓋近看各一張。
   swing  溫州街公園鞦韆（20:30）：玩家按「盪鞦韆」坐上去，量骨盆、大腿最低點離座板；側面、正面。
   bar    118 巷（l118_cafe2／l118_omu／l118_pasta／l118_tea）吧台高腳凳：玩家坐上去（找得到 lift 的座位），量同上。
   （腳踏車後座：BB-C 00:30 這一輪記「沒測到」，之後找劇情裡載人的段落在 PC 照玩家走。階梯教室：b1ca12646 改到桌下置物架的 201、博思（boya_interior）、共同（gongtong_interior）——座位照位置分間，每一間玩家【捷徑】坐進去也拍。博雅 101、霖澤 201 的 SITAMB class 鏡頭並排：另外跑 cc_sitamb_probe LOC=class CTL=0 再用 sit_cmp.py 和 d3828 比。）
  【前置／捷徑】讀檔指定地點時間（條件事件關閉）、停主迴圈手動推進片段、藏 HUD；鞦韆／吧台用遊戲自己的 GAME.sitAt 坐（互動鍵按不到時，標【捷徑】）。
用法：LW_TESTS=<wt>/tests [MODE=eat,rooms,swing,bar] python3 cc_sitheight_probe.py <url> <out>"""
import os, sys, json, asyncio, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
MODES = [m for m in (os.environ.get('MODE') or 'eat,rooms,swing,bar').split(',') if m]
FAILS = []


def check(name, ok, inf=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + inf) if inf else ''), flush=True)
    if not ok: FAILS.append(name)
    return ok


def info(s): print('INFO ' + s, flush=True)


HUD = """(on=>{ for(const id of ['hud','hudR','minimap','ctlR','joy','interact','toast','choices']){ const e=document.getElementById(id); if(e) e.style.visibility=on?'':'hidden'; } })"""
BONES = r"""const V=THREE.Vector3; const hb=(u,nm)=>{ try{ const b=u.vrm&&u.vrm.humanoid&&(u.vrm.humanoid.getRawBoneNode?u.vrm.humanoid.getRawBoneNode(nm):u.vrm.humanoid.getBoneNode(nm)); return b?b.getWorldPosition(new V()):null; }catch(e){ return null; } };
  const r3=p=>p?[+p.x.toFixed(3),+p.y.toFixed(3),+p.z.toFixed(3)]:null;
  const meas=(n,o)=>{ const u=o.userData||{}; o.updateWorldMatrix(true,true); const root=o.getWorldPosition(new V()), T=u.sitTask||{}, s=n.seat||n.sitSeat||{};
    const seatH=s.seatH!=null?s.seatH:(s.h!=null?s.h:0.47), seatY=root.y+seatH, deskY=root.y+(T.deskH!=null?T.deskH:0.75);
    const hip=hb(u,'hips'), lul=hb(u,'leftUpperLeg'), rul=hb(u,'rightUpperLeg'), lk=hb(u,'leftLowerLeg'), rk=hb(u,'rightLowerLeg'), sh=hb(u,'rightUpperArm')||hb(u,'leftUpperArm'), el=hb(u,'rightLowerArm')||hb(u,'leftLowerArm'), hd=hb(u,'head');
    const thigh=(a,b)=>{ if(!a||!b) return null; let mn=null; for(let i=0;i<=10;i++){ const p=a.clone().lerp(b,i/10); if(mn==null||p.y<mn) mn=p.y; } return mn; };
    const tl=thigh(lul,lk), tr=thigh(rul,rk), tmin=[tl,tr].filter(x=>x!=null);
    const f=new V(0,0,1).applyQuaternion(o.getWorldQuaternion(new THREE.Quaternion())), sd=new V(1,0,0).applyQuaternion(o.getWorldQuaternion(new THREE.Quaternion()));
    return {name:n.name||n.charId||n.id||'', id:n.charId||n.id||null, body:(CHAR.bodyOf?CHAR.bodyOf(o):null)||u.body||(String(u.model||u.modelKey||'').match(/_f\d|_nf|heroine|f\d/)?'F?':'?'), model:u.model||u.modelKey||null,
      root:r3(root), f:[+f.x.toFixed(3),+f.z.toFixed(3)], s:[+sd.x.toFixed(3),+sd.z.toFixed(3)], seatH:+seatH.toFixed(3), seatSrc:s.seatH!=null?'seatH':(s.h!=null?'h':'預設 0.47'), deskH:T.deskH!=null?T.deskH:null,
      hips_floor:hip?+(hip.y-root.y).toFixed(3):null, thighLow_vs_seat:tmin.length?+(Math.min(...tmin)-seatY).toFixed(3):null, knee_floor:lk&&rk?+(Math.max(lk.y,rk.y)-root.y).toFixed(3):null,
      shoulder_desk:sh?+(sh.y-deskY).toFixed(3):null, elbow_desk:el?+(el.y-deskY).toFixed(3):null, eye_desk:hd?+(hd.y-deskY).toFixed(3):null, head:r3(hd), headY:hd?hd.y:0, task:(CHAR.sitTaskOf&&CHAR.sitTaskOf(o))?CHAR.sitTaskOf(o).kind:null}; };"""
SEATED = r"""(()=>{ """ + BONES + r""" const out=[]; for(const n of (GAME.E.npcs||[])){ const o=n&&n.obj; if(!o||o.visible===false) continue; const u=o.userData||{}; if(!(n.seat||n.beh==='sit'||n.pose==='sit'||u.sitPose)) continue; if(!u.vrm) continue; out.push(meas(n,o)); } return out; })()"""
PLAYER = r"""(()=>{ """ + BONES + r""" const P=GAME.E.player; return meas(P,P.obj); })()"""
AIM = """(([e,l,fov])=>{ const E=GAME.E, cam=E.camera; E.paused=true; const fov0=cam.fov; E.cinematic(new THREE.Vector3(...e),new THREE.Vector3(...l));
  for(let i=0;i<2;i++){ cam.position.set(...e); E.cam.look=new THREE.Vector3(...l); cam.lookAt(E.cam.look); cam.updateMatrixWorld(); }
  cam.fov=fov; cam.updateProjectionMatrix(); E.render(); cam.fov=fov0; cam.updateProjectionMatrix(); return true; })"""
RELEASE = "(()=>{ const E=GAME.E; E.paused=false; E.endCinematic&&E.endCinematic(); })()"
STEP = """(n=>{ const E=GAME.E; E.paused=true; for(let i=0;i<n;i++){ E.update(1/30); } E.render(); return true; })"""
EAT = r"""(()=>{ """ + BONES + r""" const E=GAME.E, z=E.zone, out=[]; for(const n of (E.npcs||[])){ const o=n&&n.obj; if(!o||o.visible===false) continue; const u=o.userData||{}; const t=CHAR.sitTaskOf&&CHAR.sitTaskOf(o); if(!t||!/eat/.test(t.kind||'')) continue;
    const m=meas(n,o), chop=u.taskProps&&u.taskProps.hand_chopsticks; let tip=null, vis=false; if(chop){ vis=true; for(let x=chop;x;x=x.parent) if(x.visible===false) vis=false; if(vis){ const bx=new THREE.Box3().setFromObject(chop), c=bx.getCenter(new V()), hd=hb(u,'head'); const cs=[[bx.min.x,bx.min.y,bx.min.z],[bx.max.x,bx.max.y,bx.max.z],[bx.min.x,bx.max.y,bx.min.z],[bx.max.x,bx.min.y,bx.max.z]].map(a=>new V(...a)); tip=cs.sort((a,b)=>a.distanceTo(hd)-b.distanceTo(hd))[0]; } }
    const hd=hb(u,'head'), lh=hb(u,'leftHand'), rh=hb(u,'rightHand'), root=o.getWorldPosition(new V()), f=new V(0,0,1).applyQuaternion(o.getWorldQuaternion(new THREE.Quaternion()));
    let bowl=null, bd=1e9, tableChop=[]; z.group.traverse(x=>{ if(!x.isMesh) return; let own=false; for(let p=x;p;p=p.parent) if(p===o){ own=true; break; } if(own) return; const nm=(x.name||'')+'|'+((x.parent&&x.parent.name)||''); const c=new THREE.Box3().setFromObject(x).getCenter(new V());
      const dd=Math.hypot(c.x-(root.x+f.x*0.35),c.z-(root.z+f.z*0.35)); if(/bowl|碗/i.test(nm)&&dd<bd){ bd=dd; bowl=c; } if(/chopstick/i.test(nm)&&dd<0.6){ let v=true; for(let p=x;p;p=p.parent) if(p.visible===false) v=false; if(v) tableChop.push(nm.slice(0,40)); } });
    out.push(Object.assign(m,{chopVisible:vis, tipMouth:tip&&hd?+(tip.distanceTo(hd)-0.09).toFixed(3):null, rhHead:rh&&hd?+rh.distanceTo(hd).toFixed(3):null, lhBowl:lh&&bowl?+lh.distanceTo(bowl).toFixed(3):null, eyeBowl:hd&&bowl?+hd.distanceTo(bowl).toFixed(3):null, bowl:bowl?r3(bowl):null, tableChop, clip:t.clip, mid:rh&&lh?r3(rh.clone().add(lh).multiplyScalar(0.5)):null})); }
  return out; })()"""


async def shots_for(pg, x, tag, extra_knee=False):
    r, f, s = x['root'], x['f'], x['s']; hy = x['head'][1] if x['head'] else r[1] + 1.2
    cams = {'side': ([r[0] + s[0] * 1.4 + f[0] * 0.25, r[1] + 0.75, r[2] + s[1] * 1.4 + f[1] * 0.25], [r[0] + f[0] * 0.25, r[1] + 0.6, r[2] + f[1] * 0.25], 50),
            'front': ([r[0] + f[0] * 1.5, hy - 0.15, r[2] + f[1] * 1.5], [r[0], r[1] + 0.7, r[2]], 50)}
    if extra_knee: cams['knee'] = ([r[0] + s[0] * 0.9 + f[0] * 0.55, r[1] + 0.35, r[2] + s[1] * 0.9 + f[1] * 0.55], [r[0] + f[0] * 0.4, r[1] + 0.5, r[2] + f[1] * 0.4], 45)
    files = []
    for cn, (e, l, fov) in cams.items():
        await pg.evaluate(AIM + '(%s)' % J([e, l, fov])); fn = '%s_%s.png' % (tag, cn); await pg.screenshot(path=os.path.join(OUT, fn)); files.append(fn)
    await pg.evaluate(RELEASE)
    return files


async def enter(pg, cdp, zone, day, h, pos=None, lv=0):
    st = {'zone': zone, 'hour': h, 'day': day, 'weather': 'clear'}
    if pos: st['pos'] = {'x': pos[0], 'z': pos[1], 'yaw': 0, 'lv': lv}
    await pg.evaluate(RELEASE)
    await L.load_state(pg, st, quiet_events=True); await pg.wait_for_timeout(6000); await L.close_panels(pg, cdp)


async def mode_eat(pg, cdp, M):
    await enter(pg, cdp, 'wz_lin', 9, 12.25)
    r = []
    for _ in range(20):
        r = await pg.evaluate(EAT)
        if r: break
        await pg.wait_for_timeout(2000)
    if not check('[eat] 林家乾麵 12:15 有人在吃飯（sitTaskOf eat*）', bool(r), ''): return
    await pg.evaluate(HUD + '(false)')
    for i, x in enumerate(r[:2]):
        seq = []
        for k in range(21):
            seq.append(await pg.evaluate(EAT)); await pg.evaluate(STEP + '(8)')
        me = [next((y for y in s if y['name'] == x['name'] and y['root'] == x['root']), None) for s in seq]; me = [y for y in me if y]
        tips = [y['tipMouth'] for y in me if y['tipMouth'] is not None]; lhb = [y['lhBowl'] for y in me if y['lhBowl'] is not None]; eyes = [y['eyeBowl'] for y in me if y['eyeBowl'] is not None]
        best = min(me, key=lambda y: y['tipMouth'] if y['tipMouth'] is not None else 9) if me else x
        info('[eat #%d] %s（%s）：筷子看得到 %s；筷子尖離嘴（估計，頭骨往前 9 cm）最近 %s m；右手離頭最近 %s；左手離碗最近 %s m；眼睛離碗 %s～%s m（LAWWW 約 0.37）；桌上看得到的筷子 %s；肩／肘／眼離桌面 %s／%s／%s' % (
            i, x['name'], x['clip'], x['chopVisible'], min(tips) if tips else None, min(y['rhHead'] for y in me if y['rhHead']) if me else None, min(lhb) if lhb else None, min(eyes) if eyes else None, max(eyes) if eyes else None, J(x['tableChop']), x['shoulder_desk'], x['elbow_desk'], x['eye_desk']))
        check('[eat #%d] 右手拿著筷子（hand_chopsticks 看得到）' % i, x['chopVisible'], J(x['chopVisible']))
        check('[eat #%d] 桌上不剩一雙筷子（同一桌 0.6 m 內看得到的 chopstick 0 個）' % i, not x['tableChop'], J(x['tableChop']))
        M.setdefault('eat', []).append({'first': x, 'seq': [{k: y[k] for k in ('tipMouth', 'rhHead', 'lhBowl', 'eyeBowl')} for y in me]})
        await pg.evaluate(STEP + '(0)')
        files = await shots_for(pg, x, 'eat_%d' % i)
        info('[eat #%d] 截圖 %s' % (i, files))
    await pg.evaluate(HUD + '(true)')


ROOMS_JS = r"""(rooms=>{ const out={}; const ROOMS=(typeof CLS!=='undefined'&&CLS.ROOMS)||{}; for(const R of rooms){ const c=(COURSES.list||[]).find(c=>c.room===R&&/^Y[1-4]S[12]$/.test(c.term)&&c.slots&&c.slots.length); if(!c){ out[R]=null; continue; }
    const s=c.slots[0], b=(COURSES.blocks||{})[s.block]||{}; const d=STORY.termDay(c.term,4,s.wd); const h=(b.from!=null?b.from:(b.start!=null?b.start:9))+0.35; out[R]={course:c.id,name:c.name,term:c.term,day:d,key:d!=null?CALENDAR.dateOf(d).key:null,h,zone:(ROOMS[R]||{}).zone||null}; } return out; })"""


SPLIT_JS = r"""(()=>{ const S=(GAME.E.zone.seats||[]).filter(q=>q&&q.x!=null&&q.z!=null); if(!S.length) return [];
  const cut=(arr,key)=>{ const a=arr.slice().sort((p,q)=>p[key]-q[key]); let gi=-1, gm=0; for(let i=1;i<a.length;i++){ const g=a[i][key]-a[i-1][key]; if(g>gm){ gm=g; gi=i; } } return gm>3?[a.slice(0,gi),a.slice(gi)]:[a]; };
  let parts=[S]; for(const key of ['x','z']){ const nx=[]; for(const p of parts) nx.push(...cut(p,key)); parts=nx; }
  return parts.map(p=>{ const xs=p.map(q=>q.x), zs=p.map(q=>q.z), cx=(Math.min(...xs)+Math.max(...xs))/2, cz=(Math.min(...zs)+Math.max(...zs))/2; const m=p.slice().sort((a,b)=>Math.hypot(a.x-cx,a.z-cz)-Math.hypot(b.x-cx,b.z-cz))[0];
    return {n:p.length, box:[+Math.min(...xs).toFixed(1),+Math.min(...zs).toFixed(1),+Math.max(...xs).toFixed(1),+Math.max(...zs).toFixed(1)], seat:{x:m.x,z:m.z,lv:m.lv|0}}; }); })()"""


async def mode_rooms(pg, cdp, M):
    plan = await pg.evaluate(ROOMS_JS, ['L201', 'BOYA', 'GONGTONG', 'PUTONG'])
    info('[rooms] 上課時間（照課表，第 4 週）：%s' % J(plan))
    locs = [('class201', 'classroom', 8, 9.5, None, 0, True)]
    for R, tag in (('BOYA', 'boya101'), ('GONGTONG', 'gongtong'), ('PUTONG', 'putong101')):
        p = plan.get(R)
        if p and p['day'] is not None and p['zone']: locs.append((tag, p['zone'], p['day'], p['h'], None, 0, True))
        else: info('[rooms] %s：找不到課表上的時間或區域（%s）' % (R, J(p)))
    locs.append(('lib2f', 'library_hall', 9, 14.0, (-6.5, 3.0), 1, False))
    for tag, zone, day, h, pos, lv, lecture in locs:
        await enter(pg, cdp, zone, day, h, pos, lv)
        zok = await pg.evaluate("GAME.G.zone")
        if not check('[rooms %s] 讀到 %s' % (tag, zone), zok == zone, zok): continue
        await pg.wait_for_timeout(6000)
        L0 = await pg.evaluate(SEATED)
        info('[rooms %s] 坐著的 %d 人' % (tag, len(L0)))
        if not check('[rooms %s] 有坐著的人' % tag, bool(L0), ''): continue
        fem = [x for x in L0 if str(x['body']).startswith('F')][:2]
        male = sorted([x for x in L0 if not str(x['body']).startswith('F')], key=lambda x: -x['headY'])[:1]
        pick = (fem + male) or L0[:3]
        await pg.evaluate(HUD + '(false)')
        for i, x in enumerate(pick):
            files = await shots_for(pg, x, 'sit_%s_%d' % (tag, i), extra_knee=lecture)
            info('[rooms %s #%d] %s（%s、%s）：座面 %s（%s）、大腿最低點離座面 %s m（負＝陷進去）、骨盆離座位地面 %s、膝蓋 %s；肩膀／手肘／眼睛離桌面 %s／%s／%s；截圖 %s' % (
                tag, i, x['name'], x['body'], x['model'], x['seatH'], x['seatSrc'], x['thighLow_vs_seat'], x['hips_floor'], x['knee_floor'], x['shoulder_desk'], x['elbow_desk'], x['eye_desk'], files))
        M.setdefault('rooms', {})[tag] = {'all': L0, 'pick': pick}
        if lecture:   # BB-C 00:30：b1ca12646 改到桌下置物架的每一間都拍——這一區的座位照位置分成幾間（x、z 最大的空隙＞3 m 就切開），每一間玩家坐中間那一個位子
            parts = await pg.evaluate(SPLIT_JS)
            info('[rooms %s] 座位分成 %d 間：%s' % (tag, len(parts), J([[p_['n'], p_['box']] for p_ in parts])))
            for j, p_ in enumerate(parts):
                print('  [前置／捷徑] [rooms %s 第 %d 間] 玩家用 GAME.sitAt 坐進 %s（這一間有沒有排課都一樣）' % (tag, j, J(p_['seat'])), flush=True)
                await pg.evaluate("(([x,z])=>{ const E=GAME.E, s=(E.zone.seats||[]).find(q=>Math.abs(q.x-x)<0.01&&Math.abs(q.z-z)<0.01); if(s){ if(E.player.seat&&GAME.standUp) GAME.standUp(E.player); GAME.sitAt(E.player,s); } })", [p_['seat']['x'], p_['seat']['z']])
                await pg.wait_for_timeout(2500)
                x = await pg.evaluate(PLAYER)
                files = await shots_for(pg, x, 'sit_%s_room%d_player' % (tag, j), extra_knee=True)
                info('[rooms %s 第 %d 間 玩家] 座面 %s（%s）、大腿最低點離座面 %s、膝蓋 %s；肩膀／手肘／眼睛離桌面 %s／%s／%s；截圖 %s' % (tag, j, x['seatH'], x['seatSrc'], x['thighLow_vs_seat'], x['knee_floor'], x['shoulder_desk'], x['elbow_desk'], x['eye_desk'], files))
                M['rooms'][tag].setdefault('player', []).append(x)
        await pg.evaluate(HUD + '(true)')


async def player_seat(pg, cdp, tag, label_re, M):
    lab = (await L.state(pg)).get('interact') or ''
    import re
    if lab and re.search(label_re, lab):
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(4000)
        for _ in range(8):
            s = await L.state(pg)
            if s['dlg'] and not s['choices']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
            if s['choices']:
                await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#choices button')].find(x=>/坐|盪|看看四周/.test(x.innerText||'')); if(b) b.setAttribute('data-ccpick','1'); })()")
                if await pg.evaluate("!!document.querySelector('[data-ccpick]')"): await L.tap(pg, cdp, '[data-ccpick="1"]'); await pg.wait_for_timeout(2500)
                break
            await pg.wait_for_timeout(600)
    seated = await pg.evaluate("!!GAME.E.player.seat")
    if not seated: info('%s 互動鍵 %r 坐不上去' % (tag, lab))
    return seated


async def mode_swing(pg, cdp, M):
    await enter(pg, cdp, 'wenzhou', 9, 20.5)
    it = await pg.evaluate("(()=>{ const i=(GAME.E.interactables||[]).find(x=>x&&x.park==='swing'); return i?{x:i.x,z:i.z,label:i.label,seat:i.seat?{x:i.seat.x,z:i.seat.z}:null}:null; })()")
    if not check('[swing] 找得到鞦韆的互動點', bool(it), J(it)): return
    print('  [前置／捷徑] 站到鞦韆的互動點（%s, %s）' % (it['x'], it['z']), flush=True)
    await pg.evaluate("(([x,z])=>{ const P=GAME.E.player; P.obj.position.x=x; P.obj.position.z=z; })", [it['x'], it['z']]); await pg.wait_for_timeout(2500)
    ok = await player_seat(pg, cdp, '[swing]', '鞦韆', M)
    if not ok:
        print('  [前置／捷徑] 互動鍵坐不上去，改用 GAME.sitAt 坐鞦韆（只為了量和截圖）', flush=True)
        await pg.evaluate("(()=>{ const i=(GAME.E.interactables||[]).find(x=>x&&x.park==='swing'); if(i&&i.seat) GAME.sitAt(GAME.E.player,i.seat); })()"); await pg.wait_for_timeout(2500)
    x = await pg.evaluate(PLAYER)
    await pg.evaluate(HUD + '(false)'); files = await shots_for(pg, x, 'swing_player'); await pg.evaluate(HUD + '(true)')
    info('[swing] 玩家坐鞦韆：座面 %s（%s）、大腿最低點離座面 %s、骨盆離地 %s；截圖 %s' % (x['seatH'], x['seatSrc'], x['thighLow_vs_seat'], x['hips_floor'], files))
    M['swing'] = x


async def mode_bar(pg, cdp, M):
    for zone in ('l118_cafe2', 'l118_omu', 'l118_pasta', 'l118_tea'):
        await enter(pg, cdp, zone, 9, 12.5)
        zok = await pg.evaluate("GAME.G.zone")
        if zok != zone: info('[bar] %s 讀不到（%s）' % (zone, zok)); continue
        st = await pg.evaluate("(()=>{ const s=(GAME.E.zone.seats||[]).find(q=>q&&(q.lift||q.kind==='stool')); return s?{x:s.x,z:s.z,lift:s.lift||null,kind:s.kind||null}:null; })()")
        if not st: info('[bar] %s 沒有高腳凳（lift／stool）的座位' % zone); continue
        print('  [前置／捷徑] %s 吧台高腳凳：GAME.sitAt 直接坐（%s）' % (zone, J(st)), flush=True)
        await pg.evaluate("(([x,z])=>{ const s=(GAME.E.zone.seats||[]).find(q=>Math.hypot(q.x-x,q.z-z)<0.05); if(s) GAME.sitAt(GAME.E.player,s); })", [st['x'], st['z']]); await pg.wait_for_timeout(3000)
        x = await pg.evaluate(PLAYER)
        await pg.evaluate(HUD + '(false)'); files = await shots_for(pg, x, 'bar_%s' % zone); await pg.evaluate(HUD + '(true)')
        info('[bar %s] 玩家坐吧台：座面 %s（%s）、大腿最低點離座面 %s、骨盆離座位地面 %s；截圖 %s' % (zone, x['seatH'], x['seatSrc'], x['thighLow_vs_seat'], x['hips_floor'], files))
        M.setdefault('bar', {})[zone] = x
        return


async def main():
    os.makedirs(OUT, exist_ok=True)
    print('CC SIT-HEIGHT：MODE=%s；SHA=%s；SwiftShader ≠ iPhone（只看穿模、高度；顏色 PC 補）' % (MODES, os.environ.get('SHA', '?')), flush=True)
    meta = {}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, int(os.environ.get('CC_SEED') or 1105))
        t0 = time.time(); await pg.goto(URL); ok = await L.wait_loaded(pg); check('遊戲載入', ok, '%.0f 秒' % (time.time() - t0))
        if not ok: await b.close(); sys.exit(1)
        await pg.evaluate("localStorage.clear(); if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}")
        for m in MODES:
            try: await {'eat': mode_eat, 'rooms': mode_rooms, 'swing': mode_swing, 'bar': mode_bar}[m](pg, cdp, meta)
            except Exception as e: check('[%s] 探針沒有例外' % m, False, repr(e)[:300])
        check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    json.dump(meta, open(os.path.join(OUT, 'sitheight.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS)), flush=True)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
