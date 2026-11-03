# -*- coding: utf-8 -*-
"""CC（帳號 A）11-03：v9.10.20 第一批美術整合的遊戲截圖（BB 21:32；開發分支 2aaa7d22b「接 LAWWW2 美術一批」＋d2b962a3f）。
每一張都是遊戲畫面（不是 Blender 渲染）。能量的照遊戲狀態量（PASS／FAIL）；好不好看留給 BB 看圖。
CASES（逗號分開，預設全部）：
- xinhai：辛亥路彎道第二版（src/zones3d.js:393 XH／ribbon，網格 xinhai_curve_road）。
    ① 【前置／捷徑】讀檔到萬才館二樓陽台（校園第 1 層 (84.96,-87.45)，tests/flow_wancai_floors.py 用的同一點），滑畫面把鏡頭轉向彎道，截 2 張（直路結束處、彎道中段）；
    ② 【捷徑】劇情鏡頭 E.cinematic 放到彎道上空 70 m 俯視，截 1 張（只為了截圖，不是玩家看得到的角度）。
    量：彎道路面網格在、中線取樣點有幾個在畫面裡、其中幾個從鏡頭看得到（射線第一個打到的是路面或在路面附近＝沒被房子擋住）。
- study08：研究小間 08 坐下以後的鏡頭（src/library_upper3d.js:66：坐在 08 → distTarget 1.7、轉到背後 yaw≈π）。
    【前置／捷徑】讀檔到 library_carrels、flags.carrelDay＝今天（＝有預約，08 的門開、可以坐；免預約版本照舊要這個旗標才有座位，library_upper3d.js:61、:70），
    站在 08 座位的走近點，像玩家按互動鍵「坐下（研究小間）」；坐下的選單出來後等 5 秒截圖、選「坐一下，看看四周」再截一張。
    量：坐下了（E.player.seat＝08 的椅子）、distTarget＝1.7、yaw 和 π 差 < 0.3、從鏡頭到玩家頭部的射線第一個打到的是玩家自己（沒被隔板擋住）、
    其他九間玻璃後面的讀者（populateCarrels，carrelId）是 VRM（driver vrm，不是方塊）、研究小間正式模型載好（fallback 群組藏起來）。
- sixlaw：宿舍書桌的六法（ITEM_desk_liufa_203）＋「看看房間裡的東西」選了以後鏡頭的路線（E.cinematic 的 via，story3d.js:3256）。
    【前置／捷徑】讀檔到宿舍 203（大一）、站在「看看房間裡的東西」前（z.spots.roomItems），像玩家按互動鍵、選單一項一項選（有鏡頭的每一項），
    每一項：選了以後每 0.4 秒截一張（共 8 張），同時頁面裡每一格記錄鏡頭位置；量鏡頭（每一格的位置＋相鄰兩格之間的線段）有沒有進到
    梯子（dorm_room_layout.js L2 的 stair_u：x −2.0～−0.9、z 1.245～1.765、y 0～2.02）、上舖床板床欄（x −2.0～−0.9、z −0.805～1.765、y 1.56～2.02）；
    有 dorm_room4 的網格名字含 ladder／LADDER 的，也用它的包圍盒量一次。六法本身：【捷徑】劇情鏡頭看書桌上的六法，截 1 張；量節點在、看得到（visible）。
- teahouse：一盞茶屋的圓木凳（水屋旁 (3.05,3.35)）＋長桌面向院子的兩個位子（(-0.7,0.95)、(-0.7,2.45)）。
    【前置／捷徑】讀檔到 wz_teahouse 週六 14:00；站著截木凳、長桌各 1 張；再像玩家走到木凳前按「坐在水屋旁」坐下，截 1 張。
    量：座位在 E.seats／互動點裡、木凳的網格（名字含 stool）在、坐下以後 E.player.seat 是木凳、玩家坐的高度和木凳座面差多少（只記錄）。
- aunts：蘇姨（圈子表 wz_su，model char.su_apron）在一盞茶屋（hcircle3d.js S.CLERK.wz_teahouse 水屋 (2.95,1.3)）、秀琴姨（char.xiuqin／char.xiuqin_apron）。
    【前置／捷徑】大一上的週末找一天 14:00 HCIRCLE.rowsIn 有 wz_su 那一列（S.roll 擲到的），讀檔進 wz_teahouse；中距離（3～4 m）截圖。
    量：蘇姨的 NPC 在、driver vrm、model char.su_apron、在畫面裡。
    秀琴姨：d2b962a3f 的 src 只有 manifest（assets3d.js:227-228）和 MODEL_PROPS（character3d.js:159），沒有任何區域或劇情把她放進 3D（privtalk3d.js:213「她家沒有 3D」）
    ＝照實記 FAIL「遊戲沒有放她」；另外【捷徑】在茶屋用 CHAR.build({model:'char.xiuqin_apron'}) 放一個，只為了看模型在遊戲光線下的樣子（標明不是遊戲自己放的）。
- cat：溫州街公園的橘貓（src/wzcat3d.js）。GLB 的片段（wz_cat.json）：cat_walk、cat_idle、cat_sit、cat_sit_idle＋f22ef5dcd 新加五段 cat_rub、cat_rub_r、cat_lie_idle、cat_jump_down、cat_jump_up。
    2aaa7d22b 只接了 cat_rub／cat_rub_r（蹭的方向照玩家在哪一邊，S.rubClip），趴姿、跳上跳下還沒接（commit 說明）。
    ① 【前置／捷徑】讀檔到溫州街 10:00 晴天、站在貓（第一個點 (26.0,23.3)）旁 1.6～2.5 m；【捷徑】把貓的亂數換成固定序列（c.rnd：先擲中蹭腳，再決定繞的方向 dir＝1／−1），
       玩家站著不動等貓走過來蹭。dir＝1（玩家在貓的左邊）、dir＝−1（右邊）各一次，蹭的時候每 0.5 秒截一張（共 6 張）。
       量：播的片段是 cat_rub（dir 1）／cat_rub_r（dir −1）；蹭的那幾格裡，玩家在貓身體的左邊（貓朝向的左手邊）／右邊的比例 ≥ 0.6。
    ② 每一段片段在遊戲裡的樣子：【捷徑】直接用貓的 mixer 播 cat_walk、cat_idle、cat_sit、cat_sit_idle、cat_lie_idle、cat_jump_down、cat_jump_up 各 1 張（貓停住、鏡頭拉近）；
       量：九段都在 GLB 裡（mixer 的 action 有）、播了以後骨架有動（頭或尾巴尖的骨頭在 2 秒內移動 > 5 mm；第一次只看 0.6 秒，cat_sit_idle 4 秒一圈的慢甩尾只量到 3 mm）。
用法：LW_TESTS=<wt>/tests SHA=<sha> [CASES=xinhai,study08,sixlaw,teahouse,aunts,cat] python3 cc_art_v20_shots_probe.py <url> <out>   （PC 用 CC_HEADLESS=0）
"""
import os, sys, json, math, asyncio, time
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
CASES = [c.strip() for c in (os.environ.get('CASES') or 'xinhai,study08,sixlaw,teahouse,aunts,cat').split(',') if c.strip()]
HEADLESS = os.environ.get('CC_HEADLESS', '1') != '0'
J = lambda o: json.dumps(o, ensure_ascii=False)
FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'zheNoodleDone': True, 'lawclub': True, 'wenzhouLine': True}
FAILS = []
REC = {'sha': os.environ.get('SHA'), 'url': URL, 'cases': CASES, 'shots': [], 'data': {}}


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + (info if isinstance(info, str) else J(info))) if info != '' else ''), flush=True)
    if not ok: FAILS.append(name)
    return ok


def note(s):
    print('  ' + s, flush=True)


# 頁面裡的共用工具（讀檔不會重新整理頁面，載入一次就好）
HELPERS = r"""(()=>{ if(window.__CC) return true; const V=(x,y,z)=>new THREE.Vector3(x,y,z);
  const visibleChain=o=>{ for(let q=o;q;q=q.parent) if(q.visible===false) return false; return true; };
  const matOK=o=>{ const m=o.material; if(!m) return false; const ms=Array.isArray(m)?m:[m]; return ms.some(x=>x&&x.visible!==false&&!(x.transparent&&x.opacity<0.05)&&x.colorWrite!==false); };
  const C={};
  C.cam=()=>{ const E=GAME.E, c=E.camera.position, K=E.cam; return {x:+c.x.toFixed(3),y:+c.y.toFixed(3),z:+c.z.toFixed(3),yaw:+(+K.yaw).toFixed(3),pitch:K.pitch!=null?+(+K.pitch).toFixed(3):null,dist:K.dist!=null?+(+K.dist).toFixed(2):null,distTarget:K.distTarget!=null?+(+K.distTarget).toFixed(2):null,mode:K.mode}; };
  /* 從鏡頭往 p 打一條射線：第一個看得到的網格（略過看不見的、導航用的透明面、sprite）＝誰、多遠 */
  C.hit=(p,self)=>{ const E=GAME.E, cam=E.camera, cp=cam.getWorldPosition(V()), d=p.clone().sub(cp), L=d.length(); d.normalize();
    const rc=new THREE.Raycaster(cp,d,0.05,L+0.5); rc.camera=cam; let hs=[]; try{ hs=rc.intersectObjects(E.scene.children,true); }catch(e){ return {err:String(e)}; }
    for(const h of hs){ const o=h.object; if(o.isSprite||o.isPoints||o.isLine) continue; if(!visibleChain(o)||!matOK(o)) continue;
      let mine=false; if(self) for(let q=o;q;q=q.parent) if(q===self){ mine=true; break; }
      return {name:o.name||(o.parent&&o.parent.name)||'?', d:+h.distance.toFixed(2), L:+L.toFixed(2), mine}; }
    return {name:null, d:null, L:+L.toFixed(2), mine:false}; };
  C.proj=p=>{ const v=p.clone().project(GAME.E.camera); return {sx:Math.round((v.x+1)/2*innerWidth), sy:Math.round((1-v.y)/2*innerHeight), inView:v.z<1&&v.x>-1&&v.x<1&&v.y>-1&&v.y<1}; };
  C.model=o=>{ if(!o) return null; const u=o.userData||{}, sp=u.spec||u.buildSpec||{}; let vrm=!!u.vrm; if(!vrm) o.traverse(c=>{ if(c.userData&&c.userData.vrm) vrm=true; }); return {driver:u.driver||null, model:sp.model||null, vrm, placeholder:!!u.placeholder}; };
  C.npcs=()=>{ const E=GAME.E, out=[]; const ids={}; if(GAME.npc) for(const k in GAME.npc) if(GAME.npc[k]) ids[k]=GAME.npc[k];
    for(const n of (E.npcs||[])){ const o=n.obj; if(!o) continue; let key=null; for(const k in ids) if(ids[k]===n) key=k; const p=o.position;
      out.push(Object.assign({id:key||n.id||n.charId||null, name:n.name||'', carrelId:n.carrelId||null, clerk:!!n.clerk, x:+p.x.toFixed(2), y:+p.y.toFixed(2), z:+p.z.toFixed(2), vis:o.visible!==false&&!n.hidden, pose:n.pose||null}, C.model(o))); }
    return out; };
  window.__CC=C; return true; })()"""


async def helpers(pg):
    await pg.evaluate(HELPERS)


async def shot(pg, name):
    f = os.path.join(OUT, name + '.png')
    await pg.screenshot(path=f)
    REC['shots'].append(f)
    return f


async def put(pg, cdp, st, why, wait=9000):
    st = dict(st); st.setdefault('flags', dict(FLAGS)); st.setdefault('weather', 'clear')
    note('[前置／捷徑] 讀檔：%s（%s）' % (why, J({k: st[k] for k in ('zone', 'day', 'weekday', 'hour', 'pos') if k in st})))
    await L.load_state(pg, st, quiet_events=True)
    await pg.wait_for_timeout(wait)
    await L.close_panels(pg, cdp)
    await L.phone_away(pg, cdp)


async def interact_label(pg):
    s = await L.state(pg)
    return s.get('interact') or ''


async def tap_interact(pg, cdp, want):
    """像玩家一樣按互動鍵（字要是 want 開頭）；回傳按了沒"""
    for _ in range(16):
        s = await L.state(pg)
        if s['dlg'] and not s['choices']:   # 進來時的旁白（例：研究小間第一次進去「很安靜」那一句）先點掉
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700); continue
        lab = s.get('interact') or ''
        if lab.startswith(want):
            await L.tap(pg, cdp, '#interact'); return True
        await pg.wait_for_timeout(500)
    dbg = await pg.evaluate("(()=>{ const E=GAME.E, p=E.player.obj.position; return {busy:!!E.player.busy, seat:!!E.player.seat, near:E.interactables.filter(i=>Math.hypot(i.x-p.x,i.z-p.z)<2.5).map(i=>[i.label,+i.x.toFixed(2),+i.z.toFixed(2),i.radius,i.lv,!!i.hidden]), ni:(E.nearestInteractable()||{}).label||null, p:[+p.x.toFixed(2),+p.z.toFixed(2)]}; })()")
    note('互動鍵不是「%s」：%r；%s；附近的互動點 %s' % (want, await interact_label(pg), J({k: s[k] for k in ('dlg', 'dtext', 'choices', 'busy', 'paused') if k in s}), J(dbg)))
    return False


async def choices(pg):
    return await pg.evaluate("[...document.querySelectorAll('#choices button')].filter(b=>b.offsetParent!==null).map(b=>b.textContent.trim())")


async def pick(pg, cdp, pred):
    opts = await choices(pg)
    for i, o in enumerate(opts):
        if pred(o):
            c = await pg.evaluate("(i=>{ const b=[...document.querySelectorAll('#choices button')].filter(b=>b.offsetParent!==null)[i]; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%d)" % i)
            await L.touch_tap(cdp, c[0], c[1]); return o
    return None


async def wait_choices(pg, s=10):
    for _ in range(int(s * 2)):
        o = await choices(pg)
        if o: return o
        await pg.wait_for_timeout(500)
    return []


async def low_cam(pg, pitch=None, dist=None):
    """【前置／捷徑】只為了截圖：鏡頭俯角、距離（量的東西不受影響）"""
    js = "(([p,d])=>{ const c=GAME.E.cam; if(p!==null) c.pitch=p; if(d!==null){ c.dist=d; c.distTarget=d; } })(%s)" % J([pitch, dist])
    await pg.evaluate(js)


# ---------------------------------------------------------------- xinhai
XH_JS = r"""(()=>{ const E=GAME.E; let rd=null; E.scene.traverse(o=>{ if(o.name==='xinhai_curve_road') rd=o; }); if(!rd) return {road:false};
  rd.updateMatrixWorld(true); const pa=rd.geometry.attributes.position, n=pa.count, pts=[]; const v=new THREE.Vector3();
  /* 路面帶子每一段 6 個頂點：A(o0) C(o1) D(o0) A B C → 取 A、B 的中點＝中線 */
  for(let i=0;i+5<n;i+=6){ const a=new THREE.Vector3().fromBufferAttribute(pa,i), b=new THREE.Vector3().fromBufferAttribute(pa,i+4); v.copy(a).add(b).multiplyScalar(0.5); pts.push(rd.localToWorld(v.clone())); }
  rd.geometry.computeBoundingBox(); const bb=rd.geometry.boundingBox;
  return {road:true, n:pts.length, bbox:[+bb.min.x.toFixed(1),+bb.min.z.toFixed(1),+bb.max.x.toFixed(1),+bb.max.z.toFixed(1)], pts:pts.map(p=>[+p.x.toFixed(2),+p.y.toFixed(3),+p.z.toFixed(2)]), vis:rd.visible!==false}; })()"""
XH_VIS_JS = r"""(pts=>{ const C=window.__CC; let inView=0, seen=0; const who={}; for(const q of pts){ const p=new THREE.Vector3(q[0],q[1]+0.05,q[2]); const pr=C.proj(p); if(!pr.inView) continue; inView++;
    const h=C.hit(p,null); const ok=h.name==='xinhai_curve_road'||(h.d!=null&&h.d>=h.L-1.5); if(ok) seen++; else who[h.name]=(who[h.name]||0)+1; }
  return {inView, seen, blockers:Object.entries(who).sort((a,b)=>b[1]-a[1]).slice(0,5)}; })(%s)"""


async def case_xinhai(pg, cdp):
    await put(pg, cdp, {'zone': 'campus', 'hour': 10.0, 'day': 8, 'weekday': 3, 'weather': 'clear', 'pos': {'x': 84.96, 'z': -87.45, 'yaw': 2.4086, 'lv': 1, 'y': 3.63}},
              '萬才館二樓陽台（校園第 1 層），10:00 晴', 12000)
    s = await L.state(pg)
    check('xinhai：人在校園第 1 層的陽台上（lv 1、y > 3）', s['zone'] == 'campus' and s['lv'] == 1 and s['y'] > 3, J({k: s[k] for k in ('zone', 'x', 'z', 'y', 'lv')}))
    g = await pg.evaluate(XH_JS)
    REC['data']['xinhai_geo'] = {k: g.get(k) for k in ('road', 'n', 'bbox', 'vis')}
    check('xinhai：背景有彎道路面網格 xinhai_curve_road（顯示中）', g.get('road') and g.get('vis'), J(REC['data']['xinhai_geo']))
    if not g.get('road'): return
    pts = g['pts']
    # 看兩個方向：直路結束、彎道開始那一點（第 1 個中線點）；彎道中段（第 7 個）
    res = []
    for tag, idx in (('curve_start', 0), ('curve_mid', min(7, len(pts) - 1)), ('se_leg', min(18, len(pts) - 1))):
        tx, tz = pts[idx][0], pts[idx][2]
        ok = await L.turn_camera_to(pg, cdp, tx, tz, tries=6)
        await low_cam(pg, 0.12, 6.0); await pg.wait_for_timeout(2500)
        vv = await pg.evaluate(XH_VIS_JS % J(pts)); cam = await pg.evaluate("window.__CC.cam()")
        f = await shot(pg, 'xinhai_balcony_%s' % tag)
        note('陽台看 %s（%.1f,%.1f）：轉到了 %s、中線點在畫面裡 %d、看得到 %d、擋住的 %s；鏡頭 %s → %s' % (tag, tx, tz, ok, vv['inView'], vv['seen'], J(vv['blockers']), J(cam), f))
        res.append({'tag': tag, 'turned': ok, 'vis': vv, 'cam': cam})
    REC['data']['xinhai_balcony'] = res
    best = max(r['vis']['seen'] for r in res)
    check('xinhai：從陽台看出去，彎道中線至少 3 個取樣點看得到（沒被房子、樹全部擋住；路在萬才館背後〔東北〕、陽台朝西南，先量看看）', best >= 3, J([[r['tag'], r['vis']['inView'], r['vis']['seen']] for r in res]))
    # 【捷徑】俯視：彎道中段上空
    mid = pts[min(9, len(pts) - 1)]
    # 鏡頭放在馬路東北邊（城市那一側）往西南看：萬才館在路的西南邊，從校園那一側往下看會被萬才館的屋頂擋住一大塊（第一次跑 17／43）
    note('[捷徑] 劇情鏡頭 E.cinematic 放到彎道東北邊上空 75 m 往西南俯視（只為了截圖）')
    await pg.evaluate("(([x,z])=>{ const E=GAME.E; E.cinematic(new THREE.Vector3(x+40,75,z-40), new THREE.Vector3(x-8,0,z+8)); E.snapCinematic&&E.snapCinematic(); })(%s)" % J([mid[0], mid[2]]))
    await pg.wait_for_timeout(3000)
    vv = await pg.evaluate(XH_VIS_JS % J(pts))
    f = await shot(pg, 'xinhai_overhead')
    note('俯視：中線點在畫面裡 %d／%d、看得到 %d、擋住 %s → %s' % (vv['inView'], len(pts), vv['seen'], J(vv['blockers']), f))
    REC['data']['xinhai_overhead'] = vv
    check('xinhai：俯視看得到彎道中線一半以上的取樣點', vv['seen'] >= len(pts) // 2, '%d／%d' % (vv['seen'], len(pts)))
    await pg.evaluate("GAME.E.endCinematic()")


# ---------------------------------------------------------------- study08
S8_JS = r"""(()=>{ const E=GAME.E, P=E.player, C=window.__CC, s=P.seat; const head=P.obj.position.clone(); head.y+=(typeof CHAR!=='undefined'&&CHAR.headY)?CHAR.headY(P.obj.children.find(c=>c.userData&&c.userData.driver)||P.obj):1.2;
  const body=P.obj.position.clone(); body.y+=0.9; let fb=null; E.zone.group&&E.zone.group.traverse(o=>{ if(o.name==='fallback'&&!fb) fb=o; });
  const npcs=C.npcs().filter(n=>n.carrelId);
  const pp=P.obj.position; return {seat:s?{x:s.x,z:s.z}:null, pose:P.pose||null, idlePose:P.idlePose||null, frozen:!!P.frozen, busy:!!P.busy, pxz:[+pp.x.toFixed(2),+pp.y.toFixed(2),+pp.z.toFixed(2)], cam:C.cam(), head:C.hit(head,P.obj), body:C.hit(body,P.obj), pHead:C.proj(head), fbVisible:fb?visibleOf(fb):null, readers:npcs, zone:GAME.G.zone};
  function visibleOf(o){ for(let q=o;q;q=q.parent) if(q.visible===false) return false; return true; } })()"""


async def case_study08(pg, cdp):
    st = {'zone': 'library_carrels', 'hour': 10.0, 'day': 9, 'weekday': 4, 'pos': {'x': 0.2, 'z': 1.85, 'yaw': 0}}
    st['flags'] = dict(FLAGS, carrelDay=9)
    await put(pg, cdp, st, '研究小間（flags.carrelDay＝今天＝有預約，08 的門開），站在 08 椅子的走近點、面向椅子', 12000)
    await helpers(pg)
    t0 = await pg.evaluate(S8_JS)
    await shot(pg, 'study08_0_stand')
    sat = False
    if await tap_interact(pg, cdp, '坐下'):
        o = await wait_choices(pg, 12)
        note('坐下以後的選單：%s' % J(o))
        await pg.wait_for_timeout(5000)
        sat = True
    else:
        note('[捷徑] 互動鍵按不到「坐下」，改用 GAME.sitAt 直接坐（只為了截圖）')
        await pg.evaluate("(()=>{ const s=(GAME.E.zone.seats||[]).find(q=>Math.hypot(q.x-0.2,q.z-2.45)<0.1); if(s) GAME.sitAt(GAME.E.player,s); })()")
        await pg.wait_for_timeout(5000)
    a = await pg.evaluate(S8_JS)
    f1 = await shot(pg, 'study08_1_sat_menu')
    note('坐下（選單還開著）：%s → %s' % (J({k: a[k] for k in ('seat', 'pose', 'pxz', 'cam', 'head', 'body', 'pHead')}), f1))
    picked = await pick(pg, cdp, lambda t: t.startswith('坐一下'))
    note('選了：%r' % picked)
    for _ in range(20):
        s = await L.state(pg)
        if s['dlg']: await L.tap(pg, cdp, '#dlg')
        elif not s['choices']: break
        await pg.wait_for_timeout(700)
    await pg.wait_for_timeout(3000)
    b = await pg.evaluate(S8_JS)
    f2 = await shot(pg, 'study08_2_sat')
    note('選完：%s → %s' % (J({k: b[k] for k in ('seat', 'pose', 'idlePose', 'frozen', 'busy', 'pxz', 'cam', 'head', 'body', 'pHead')}), f2))
    note('（只記錄）選「坐一下，看看四周」以後：%s——game3d.js seatMenu 這一項做完就起身（照設計），所以第二張是站在 08 裡' % J({k: b[k] for k in ('seat', 'pose', 'pxz')}))
    REC['data']['study08'] = {'stand': t0, 'sat_menu': a, 'sat': b, 'real_tap': sat}
    check('study08：坐在 08 的椅子 (0.2,2.45)', bool(a['seat']) and math.hypot(a['seat']['x'] - 0.2, a['seat']['z'] - 2.45) < 0.1, J(a['seat']))
    check('study08：坐下以後 distTarget＝1.7', a['cam']['distTarget'] == 1.7, J(a['cam']))
    dy = abs(((a['cam']['yaw'] - math.pi) + math.pi) % (2 * math.pi) - math.pi)
    check('study08：鏡頭轉到背後（yaw 和 π 差 < 0.3）', dy < 0.3, '差 %.3f' % dy)
    check('study08：鏡頭到玩家頭部／身體的射線先打到玩家自己（沒被隔板、牆擋住）', a['head'].get('mine') or a['body'].get('mine'), J([a['head'], a['body']]))
    check('study08：玩家頭部在畫面裡', a['pHead']['inView'], J(a['pHead']))
    r = a['readers']
    check('study08：其他間玻璃後面的讀者都是 VRM（不是方塊、程序化人物）', all(n['driver'] == 'vrm' for n in r), J([[n['carrelId'], n['driver'], n['model']] for n in r]))
    note('讀者 %d 位：%s' % (len(r), J([n['carrelId'] for n in r])))
    check('study08：研究小間正式模型載好（fallback 群組藏起來）', a['fbVisible'] is False, J(a['fbVisible']))


# ---------------------------------------------------------------- sixlaw
DESK_GEO = r"""(()=>{ const E=GAME.E; const lf=E.scene.getObjectByName('ITEM_desk_liufa_203'); const any=E.scene.getObjectByName('ITEM_desk_civil')||lf; if(!any) return {err:'沒有 ITEM_desk_ 節點（dorm_desk_items.glb 沒載好？）'};
  const par=any.parent; par.updateMatrixWorld(true); const W=(x,y,z)=>{ const v=par.localToWorld(new THREE.Vector3(x,y,z)); return [+v.x.toFixed(3),+v.y.toFixed(3),+v.z.toFixed(3)]; };
  const box=(a,b)=>{ const p=W(a[0],a[1],a[2]), q=W(b[0],b[1],b[2]); return {min:[Math.min(p[0],q[0]),Math.min(p[1],q[1]),Math.min(p[2],q[2])],max:[Math.max(p[0],q[0]),Math.max(p[1],q[1]),Math.max(p[2],q[2])]}; };
  const vis=o=>{ for(let q=o;q;q=q.parent) if(q.visible===false) return false; return true; };
  const named=[]; E.scene.traverse(o=>{ if(o.isMesh&&/ladder|LADDER|梯/.test(o.name||'')&&vis(o)){ const b=new THREE.Box3().setFromObject(o); named.push({name:o.name,min:[b.min.x,b.min.y,b.min.z].map(v=>+v.toFixed(3)),max:[b.max.x,b.max.y,b.max.z].map(v=>+v.toFixed(3))}); } });
  let lb=null; if(lf){ const b=new THREE.Box3().setFromObject(lf); lb={min:[b.min.x,b.min.y,b.min.z].map(v=>+v.toFixed(3)),max:[b.max.x,b.max.y,b.max.z].map(v=>+v.toFixed(3))}; }
  return {ladder:box([-2.0,0,1.245],[-0.9,2.02,1.765]), deck:box([-2.0,1.56,-0.805],[-0.9,2.02,1.765]), named, liufa:lf?{vis:vis(lf),box:lb}:null, room:GAME.E.zone&&GAME.E.zone.dormSetKey}; })()"""
CAMLOG_START = "(()=>{ window.__camLog=[]; const E=GAME.E; const f=()=>{ if(!window.__camOn) return; const c=E.camera.position; window.__camLog.push([+c.x.toFixed(3),+c.y.toFixed(3),+c.z.toFixed(3),E.cam.mode==='cinematic'?1:0,E.cam.cine&&E.cam.cine.via?1:0]); requestAnimationFrame(f); }; window.__camOn=true; requestAnimationFrame(f); })()"


def seg_box(p, q, b, m=0.0):
    """線段 p→q 有沒有穿過盒子（slab test；m＝盒子往外放大）"""
    t0, t1 = 0.0, 1.0
    for k in range(3):
        lo, hi = b['min'][k] - m, b['max'][k] + m
        d = q[k] - p[k]
        if abs(d) < 1e-9:
            if p[k] < lo or p[k] > hi: return False
            continue
        a, c = (lo - p[k]) / d, (hi - p[k]) / d
        if a > c: a, c = c, a
        t0, t1 = max(t0, a), min(t1, c)
        if t0 > t1: return False
    return True


def in_box(p, b, m=0.0):
    return all(b['min'][k] - m <= p[k] <= b['max'][k] + m for k in range(3))


async def case_sixlaw(pg, cdp):
    await put(pg, cdp, {'zone': 'dorm', 'hour': 20.0, 'day': 9, 'weekday': 4, 'pos': {'x': -0.55, 'z': -0.4, 'yaw': 3.1416}}, '宿舍 203（大一）、書桌前「看看房間裡的東西」旁', 14000)
    await helpers(pg)
    geo = await pg.evaluate(DESK_GEO)
    REC['data']['sixlaw_geo'] = geo
    note('房間 %s；梯子盒 %s；床板盒 %s；名字有 ladder 的網格 %d 個 %s' % (geo.get('room'), J(geo.get('ladder')), J(geo.get('deck')), len(geo.get('named') or []), J((geo.get('named') or [])[:4])))
    check('sixlaw：書桌上的六法 ITEM_desk_liufa_203 在、顯示中', bool(geo.get('liufa')) and geo['liufa']['vis'], J(geo.get('liufa') or geo.get('err')))
    if geo.get('err'): return
    # 六法本身【捷徑】
    if geo.get('liufa') and geo['liufa'].get('box'):
        b = geo['liufa']['box']; cx, cy, cz = [(b['min'][k] + b['max'][k]) / 2 for k in range(3)]
        note('[捷徑] 劇情鏡頭看書桌上的六法（不在「看東西」選單裡，只為了截圖）')
        await pg.evaluate("(([x,y,z])=>{ const E=GAME.E; E.cinematic(new THREE.Vector3(-0.75,y+0.55,z+0.25), new THREE.Vector3(x,y,z)); E.snapCinematic&&E.snapCinematic(); })(%s)" % J([cx, cy, cz]))
        await pg.wait_for_timeout(2500); f = await shot(pg, 'sixlaw_book'); note('六法 → %s' % f)
        await pg.evaluate("GAME.E.endCinematic()"); await pg.wait_for_timeout(4000)
    # 走到「看看房間裡的東西」前（點地面）
    sp = await pg.evaluate("(()=>{ const z=GAME.E.zone; return z&&z.spots&&z.spots.roomItems; })()")
    if sp:
        await L.tap_ground(pg, cdp, sp[0], sp[1] + 0.25); await pg.wait_for_timeout(4000)
    results = []
    menu = None
    o = []
    for t in range(3):   # 第一次全跑：劇情鏡頭（看六法）收回來的時候按，選單沒有出來（選單 []）；按不到就再按一次
        if await tap_interact(pg, cdp, '看看房間裡的東西'):
            o = await wait_choices(pg, 12)
            if o: break
        await pg.wait_for_timeout(2000)
    menu = o; note('選單：%s' % J(o))
    items = [t for t in o if t != '不看了']
    for k, want in enumerate(items):
        if not await choices(pg):
            note('選單不見了（第 %d 項以前）' % k); break
        cam0 = await pg.evaluate("window.__CC.cam()")
        await pg.evaluate(CAMLOG_START)
        await pick(pg, cdp, lambda t: t == want)
        files = []
        for i in range(8):
            await pg.wait_for_timeout(400)
            files.append(await shot(pg, 'sixlaw_path_%d_%02d' % (k, i)))
        log = await pg.evaluate("(()=>{ window.__camOn=false; return window.__camLog; })()")
        cine = any(r[3] for r in log)
        hitL = [r for r in log if in_box(r, geo['ladder'])]; hitD = [r for r in log if in_box(r, geo['deck'])]
        segL = sum(1 for a, b in zip(log, log[1:]) if seg_box(a, b, geo['ladder'])); segD = sum(1 for a, b in zip(log, log[1:]) if seg_box(a, b, geo['deck']))
        segN = []
        for nb in geo.get('named') or []:
            n = sum(1 for a, b in zip(log, log[1:]) if seg_box(a, b, nb))
            if n: segN.append([nb['name'], n])
        r = {'item': want, 'cam0': cam0, 'frames': len(log), 'cine': cine, 'via_used': any(r[4] for r in log), 'first': log[:1], 'last': log[-1:],
             'in_ladder': len(hitL), 'seg_ladder': segL, 'in_deck': len(hitD), 'seg_deck': segD, 'seg_named': segN, 'shots': files[:1] + files[-1:]}
        results.append(r)
        note('「%s」：%d 格、劇情鏡頭 %s、用了 via %s；起點 %s 終點 %s；在梯子裡 %d 格／穿過 %d 段、在床板裡 %d／%d、名字有 ladder 的 %s' % (
            want, len(log), cine, r['via_used'], J(log[:1]), J(log[-1:]), len(hitL), segL, len(hitD), segD, J(segN)))
        # 講完旁白：選單會再出來（roomItems 一次最多 12 項），像玩家一樣接著選下一項
        for _ in range(30):
            s = await L.state(pg)
            if s['choices']: break
            if s['dlg']: await L.tap(pg, cdp, '#dlg')
            await pg.wait_for_timeout(600)
        await pg.wait_for_timeout(1500)
    if await choices(pg):
        await pick(pg, cdp, lambda t: t == '不看了'); await pg.wait_for_timeout(2500)
    REC['data']['sixlaw_paths'] = results
    check('sixlaw：選單裡有鏡頭的東西都量到了（至少 1 項）', len(results) >= 1, J(menu))
    camr = [r for r in results if r['cine']]
    check('sixlaw：選了以後鏡頭轉過去（劇情鏡頭）', len(camr) == len(results) and results, J([[r['item'], r['cine']] for r in results]))
    bad = [r['item'] for r in results if r['in_ladder'] or r['seg_ladder'] or any(n for _, n in r['seg_named'])]
    check('sixlaw：鏡頭路線（每一格＋相鄰兩格的線段）沒有進到梯子的範圍', not bad, J(bad))
    badD = [r['item'] for r in results if r['in_deck'] or r['seg_deck']]
    check('sixlaw：鏡頭路線沒有穿過上舖床板、床欄', not badD, J(badD))


# ---------------------------------------------------------------- teahouse / aunts
TEA_GEO = r"""(()=>{ const E=GAME.E, C=window.__CC; const st=[];
  /* 正式模型照材質合併（wz_teahouse_interior.glb 的網格名字是 wzs_planks…，沒有 stool）：從木凳正上方往下打射線，第一個打到的看得見的網格＝木凳的座面（打到地板＝沒有木凳）*/
  for(const [x,z] of [[3.05,3.35],[2.95,3.35],[3.15,3.35],[3.05,3.25],[3.05,3.45]]){ const rc=new THREE.Raycaster(new THREE.Vector3(x,2.2,z),new THREE.Vector3(0,-1,0),0,3); const hs=rc.intersectObjects(E.scene.children,true);
    const h=hs.find(q=>{ const o=q.object; if(!o.isMesh||!o.material) return false; for(let p=o;p;p=p.parent) if(p.visible===false) return false; return (Array.isArray(o.material)?o.material:[o.material]).some(m=>m.visible!==false); });
    if(h) st.push({name:h.object.name, c:[x,z], top:+h.point.y.toFixed(3)}); }
  const seats=(E.zone.seats||E.seats||[]).map(s=>[s.x,s.z,s.label||'']); const its=E.interactables.filter(i=>i.seat).map(i=>[i.x,i.z,i.label]);
  return {stools:st, seats, its, zone:GAME.G.zone}; })()"""


async def tea_view(pg, cdp, px, pz, tx, tz, name, pitch=0.18, dist=3.2):
    await L.turn_camera_to(pg, cdp, tx, tz, tries=5)
    await low_cam(pg, pitch, dist); await pg.wait_for_timeout(2500)
    return await shot(pg, name)


async def case_teahouse(pg, cdp):
    await put(pg, cdp, {'zone': 'wz_teahouse', 'hour': 14.0, 'day': 11, 'weekday': 6, 'pos': {'x': 0.9, 'z': 3.6, 'yaw': -1.5708}}, '一盞茶屋週六 14:00，茶席旁', 12000)
    await helpers(pg)
    g = await pg.evaluate(TEA_GEO)
    REC['data']['teahouse_geo'] = g
    note('木凳網格 %s；座位 %s' % (J(g['stools']), J(g['seats'][:10])))
    check('teahouse：區域的座位有水屋旁的木凳 (3.05,3.35)', any(abs(s[0] - 3.05) < 0.05 and abs(s[1] - 3.35) < 0.05 for s in g['seats']), '')
    check('teahouse：長桌面向院子的兩個位子 (-0.7,0.95)、(-0.7,2.45) 都在', all(any(abs(s[0] + 0.7) < 0.05 and abs(s[1] - z) < 0.05 for s in g['seats']) for z in (0.95, 2.45)), '')
    tops = [x['top'] for x in g['stools']]
    check('teahouse：木凳正上方往下打射線，打到 0.3～0.7 m 高的座面（不是地板＝有木凳）', len(tops) >= 3 and sorted(tops)[len(tops) // 2] > 0.3 and sorted(tops)[len(tops) // 2] < 0.7, J(g['stools']))
    occ = await pg.evaluate("window.__CC.npcs().filter(n=>n.vis&&(Math.hypot(n.x-3.05,n.z-3.35)<0.4||Math.hypot(n.x+0.7,n.z-0.95)<0.4||Math.hypot(n.x+0.7,n.z-2.45)<0.4)).map(n=>[n.name,n.model,n.x,n.z,n.pose])")
    note('坐在木凳、長桌那兩個位子上的 NPC：%s' % J(occ))
    REC['data']['teahouse_occupied'] = occ
    f = await tea_view(pg, cdp, 0.9, 3.6, 3.05, 3.35, 'teahouse_stool_follow'); note('木凳（跟隨鏡頭）→ %s' % f)
    # 【捷徑】跟隨鏡頭在玩家背後、玩家會擋住木凳：用劇情鏡頭從茶席那一側斜看木凳、長桌（只為了截圖）
    for nm, eye, look in (('teahouse_stool', [1.0, 1.55, 4.7], [3.05, 0.45, 3.35]), ('teahouse_table', [1.2, 1.7, 4.3], [-0.9, 0.6, 1.7])):
        await pg.evaluate("(([e,l])=>{ const E=GAME.E; E.cinematic(new THREE.Vector3(e[0],e[1],e[2]), new THREE.Vector3(l[0],l[1],l[2])); E.snapCinematic&&E.snapCinematic(); })(%s)" % J([eye, look]))
        await pg.wait_for_timeout(2500); f = await shot(pg, nm); note('[捷徑] %s → %s' % (nm, f))
    await pg.evaluate("GAME.E.endCinematic()")
    # 像玩家走到木凳前、按「坐在水屋旁」
    await put(pg, cdp, {'zone': 'wz_teahouse', 'hour': 14.0, 'day': 11, 'weekday': 6, 'pos': {'x': 2.3, 'z': 3.4, 'yaw': 1.5708}}, '一盞茶屋，站在木凳旁（c510_3_2 的 standAt (2.3,3.4)）', 9000)
    await helpers(pg)
    rm = await pg.evaluate("(()=>{ const E=GAME.E, out=[]; for(const n of (E.npcs||[]).slice()){ const p=n.obj&&n.obj.position; if(p&&Math.hypot(p.x-3.05,p.z-3.35)<0.4){ out.push([n.name||'',+p.x.toFixed(2),+p.z.toFixed(2)]); E.removeNPC(n); } } return out; })()")
    if rm: note('[捷徑] 木凳上已經有路人坐著 %s：先把他拿掉，玩家才坐得下（只為了截圖；玩家實際上會看到「有人坐了」）' % J(rm))
    real = await tap_interact(pg, cdp, '坐在水屋旁')
    if not real:
        note('[捷徑] 互動鍵按不到「坐在水屋旁」，改用 GAME.sitAt 直接坐（只為了截圖）')
        await pg.evaluate("(()=>{ const s=(GAME.E.zone.seats||[]).find(q=>Math.hypot(q.x-3.05,q.z-3.35)<0.1); if(s) GAME.sitAt(GAME.E.player,s); })()")
    o = await wait_choices(pg, 12); note('坐下以後的選單：%s' % J(o))
    await pg.wait_for_timeout(3000)
    a = await pg.evaluate("(()=>{ const P=GAME.E.player, s=P.seat, C=window.__CC; const h=P.obj.position.clone(); h.y+=1.1; return {seat:s?[s.x,s.z,s.label||'']:null, y:+P.obj.position.y.toFixed(3), cam:C.cam(), hit:C.hit(h,P.obj)}; })()")
    f = await shot(pg, 'teahouse_sat_stool'); note('坐在木凳上：%s → %s' % (J(a), f))
    await L.turn_camera_to(pg, cdp, 3.05 - 2.0, 3.35, tries=5); await low_cam(pg, 0.15, 2.6); await pg.wait_for_timeout(2500)
    f = await shot(pg, 'teahouse_sat_stool_side'); note('另一個角度 → %s' % f)
    top = sorted(tops)[len(tops) // 2] if tops else None
    REC['data']['teahouse_sat'] = dict(a, stool_top=top, real_tap=real)
    check('teahouse：坐下了，坐的是木凳', bool(a['seat']) and abs(a['seat'][0] - 3.05) < 0.05 and abs(a['seat'][1] - 3.35) < 0.05, J(a['seat']))
    note('（只記錄）玩家根節點高度 %s、木凳座面（射線中位數）%s' % (a['y'], top))
    await pick(pg, cdp, lambda t: t.startswith('坐一下'))
    for _ in range(15):
        s = await L.state(pg)
        if s['dlg']: await L.tap(pg, cdp, '#dlg')
        elif not s['choices']: break
        await pg.wait_for_timeout(700)


FIND_SU = r"""(()=>{ if(typeof HCIRCLE==='undefined') return {err:'沒有 HCIRCLE'}; const out=[]; const base=GAME.G;
  for(let d=-20;d<=130;d++){ const wd=((3+(d-1))%7+7)%7; if(wd!==6&&wd!==0) continue; for(const h of [14,15.5]){ const G=Object.assign({},base,{day:d,weekday:wd,hour:h,flags:base.flags});
      let rs=[]; try{ rs=HCIRCLE.rowsIn(G,'wz_teahouse'); }catch(e){ return {err:String(e)}; } const r=rs.find(q=>(q.with||[]).includes('wz_su')); if(r){ out.push({day:d,wd,h,row:r.id}); break; } } if(out.length>=3) break; }
  return {found:out}; })()"""


async def case_aunts(pg, cdp):
    AF = dict(FLAGS, YT_MET_JOB=True)   # 語彤的作息要有 YT_MET_JOB 才排（story3d.js:409 schedEnt）；沒有她，圈子表 wz_su 那幾列不成立（第一次跑 found []）
    await put(pg, cdp, {'zone': 'wz_teahouse', 'hour': 14.0, 'day': 11, 'weekday': 6, 'pos': {'x': -1.0, 'z': 3.8, 'yaw': -1.2}, 'flags': AF}, '一盞茶屋（先進來找蘇姨在的日子；flags.YT_MET_JOB）', 9000)
    await helpers(pg)
    fs = await pg.evaluate(FIND_SU)
    note('HCIRCLE 有 wz_su 那一列的日子：%s' % J(fs))
    REC['data']['aunts_days'] = fs
    days = fs.get('found') or []
    su = None
    for dd in days[:2]:
        await put(pg, cdp, {'zone': 'wz_teahouse', 'hour': dd['h'], 'day': dd['day'], 'weekday': dd['wd'], 'pos': {'x': -0.3, 'z': 3.4, 'yaw': -1.2}, 'flags': AF},
                  '一盞茶屋第 %d 天（週%d）%.1f 時，圈子表 %s' % (dd['day'], dd['wd'], dd['h'], dd['row']), 16000)
        await helpers(pg)
        ns = await pg.evaluate("window.__CC.npcs()")
        su = next((n for n in ns if n['id'] == 'wz_su' or n['name'] == '蘇姨'), None)
        note('NPC：%s' % J([[n['id'], n['name'], n['driver'], n['model'], n['x'], n['z']] for n in ns]))
        if su: break
    check('aunts：蘇姨在一盞茶屋（圈子表 wz_su 成立的日子）', bool(su), J(days[:2]))
    if su:
        check('aunts：蘇姨是 VRM、model char.su_apron（不是方塊、不是路人底模）', su['driver'] == 'vrm' and su['model'] == 'char.su_apron', J(su))
        await L.turn_camera_to(pg, cdp, su['x'], su['z'], tries=6); await low_cam(pg, 0.12, 2.4); await pg.wait_for_timeout(2500)
        pv = await pg.evaluate("(([x,z])=>{ const C=window.__CC; const p=new THREE.Vector3(x,1.2,z); return {p:C.proj(p), hit:C.hit(p,null), d:+Math.hypot(GAME.E.player.obj.position.x-x,GAME.E.player.obj.position.z-z).toFixed(2)}; })(%s)" % J([su['x'], su['z']]))
        f = await shot(pg, 'aunts_su'); note('蘇姨（離玩家 %s m）：%s → %s' % (pv['d'], J(pv), f))
        check('aunts：蘇姨在畫面裡（胸口高度投影在畫面內）', pv['p']['inView'], J(pv['p']))
        REC['data']['aunts_su'] = dict(su, view=pv)
    # 秀琴姨：遊戲沒有放她
    xq = await pg.evaluate("(()=>{ const ns=window.__CC.npcs(); return ns.filter(n=>/xiuqin/.test(n.model||'')||n.name==='秀琴姨'); })()")
    check('aunts：秀琴姨由遊戲自己放在店裡（d2b962a3f src 沒有任何地方放 char.xiuqin／xiuqin_apron）', bool(xq), J(xq))
    note('[捷徑] 在茶屋用 CHAR.build 放一個秀琴姨（char.xiuqin_apron），站在長桌東邊，只為了看模型在遊戲光線下的樣子——不是遊戲自己放的')
    await pg.evaluate("(async()=>{ try{ await ASSETS.loadOne('char.xiuqin_apron'); }catch(e){} try{ await ASSETS.loadOne('prop.glasses_xiuqin'); }catch(e){} })()")
    await pg.evaluate("(()=>{ const E=GAME.E; const o=CHAR.build({model:'char.xiuqin_apron',height:1.58,sex:'f'}); o.position.set(0.4,0,1.7); o.rotation.y=Math.PI/2; const n=E.addNPC({obj:o,name:'秀琴姨（捷徑）',beh:'idle',frozen:true,isExtra:true}); window.__xq=o; })()")
    for _ in range(40):
        m = await pg.evaluate("window.__CC.model(window.__xq)")
        if m and m['driver'] == 'vrm' and m['model'] == 'char.xiuqin_apron': break
        await pg.wait_for_timeout(1000)
    await L.turn_camera_to(pg, cdp, 0.4, 1.7, tries=6); await low_cam(pg, 0.12, 2.4); await pg.wait_for_timeout(3000)
    m = await pg.evaluate("window.__CC.model(window.__xq)")
    f = await shot(pg, 'aunts_xiuqin_shortcut'); note('秀琴姨（捷徑）%s → %s' % (J(m), f))
    REC['data']['aunts_xiuqin_shortcut'] = m
    gl = await pg.evaluate("(()=>{ let g=0; window.__xq&&window.__xq.traverse(o=>{ if(/glass/i.test(o.name||'')) g++; }); return g; })()")
    check('aunts：（捷徑放的）秀琴姨模型載好：VRM、model char.xiuqin_apron、有眼鏡配件（名字含 glass 的節點 %d 個）' % gl, bool(m) and m['driver'] == 'vrm' and m['model'] == 'char.xiuqin_apron' and gl > 0, J(m))


# ---------------------------------------------------------------- cat
CAT_ST = "(()=>typeof WZCAT!=='undefined'&&WZCAT.state?WZCAT.state():null)()"
CAT_SIDE = r"""(()=>{ const c=WZCAT._cat(); if(!c) return null; const o=c.obj, p=GAME.E.player.obj.position, y=o.rotation.y; const lx=Math.cos(y), lz=-Math.sin(y);   /* 貓朝 (sin y, cos y)；左手邊＝(cos y, −sin y)（朝 +z 時左邊是 +x，wz_cat.json：cat_rub 往左邊 +x 貼）*/
  const dx=p.x-o.position.x, dz=p.z-o.position.z; return {side:dx*lx+dz*lz, clip:c.cur, state:c.state, dir:c.rub?c.rub.dir:null, d:+Math.hypot(dx,dz).toFixed(2)}; })()"""
CAT_RND = r"""(dir=>{ const c=WZCAT._cat(); if(!c) return false; const seq=[0.1, dir>0?0.2:0.8, 0.6]; let i=0; c.rnd=()=> i<seq.length?seq[i++]:0.6; c.rubCd=0; c.rolled=false; c.still=0; return true; })(%d)"""


async def case_cat(pg, cdp):
    rubs = {}
    for dir_, tag in ((1, 'left'), (-1, 'right')):
        await put(pg, cdp, {'zone': 'wenzhou', 'hour': 10.0, 'day': 9, 'weekday': 4, 'weather': 'clear', 'pos': {'x': 26.0, 'z': 21.3, 'yaw': 3.1416}}, '溫州街公園 10:00 晴，貓（圓椅前 (26.0,23.3)）北邊 2 m', 15000)
        await helpers(pg)
        for _ in range(30):   # 進溫州街時的劇情、旁白（GAME.D.busyWho）先等它演完、點掉
            bz = await pg.evaluate("(()=>({busy:!!GAME.E.player.busy, who:(GAME.D&&GAME.D.busyWho||[]).slice(), dlg:!!document.querySelector('#dlg:not(.hide)')}))()")
            if not bz['busy']: break
            s = await L.state(pg)
            if s['dlg']: await L.tap(pg, cdp, '#dlg')
            elif s['choices']: await pick(pg, cdp, lambda t: True)
            await pg.wait_for_timeout(700)
        note('讀檔後 busy：%s' % J(bz))
        st = await pg.evaluate(CAT_ST)
        note('貓：%s' % J(st))
        if not st:
            check('cat：公園有會動的貓（WZCAT 接手了有骨架的模型）', False, '沒有 WZCAT.state()'); return
        acts = await pg.evaluate("Object.keys(WZCAT._cat().act)")
        if tag == 'left':
            want = ['cat_walk', 'cat_idle', 'cat_sit', 'cat_sit_idle', 'cat_rub', 'cat_rub_r', 'cat_lie_idle', 'cat_jump_down', 'cat_jump_up']
            check('cat：GLB 的九段片段都在（含 f22ef5dcd 新加的五段）', all(a in acts for a in want), J(acts))
        note('[捷徑] 貓的亂數換成固定序列：蹭腳擲中、繞的方向 dir＝%d（玩家在貓的%s邊）' % (dir_, '左' if dir_ > 0 else '右'))
        await pg.evaluate(CAT_RND % dir_)
        await L.turn_camera_to(pg, cdp, 26.0, 23.3, tries=5); await low_cam(pg, 0.35, 3.0)
        got = None
        for i in range(60):   # 站著不動：3 秒以後擲骰、站起來、走過來
            await pg.wait_for_timeout(500)
            s = await pg.evaluate(CAT_SIDE)
            if s and s['state'] == 'rub': got = s; break
        if not got:
            check('cat %s：貓走過來蹭（state rub）' % tag, False, J(await pg.evaluate(CAT_ST))); continue
        samples = []
        for i in range(6):
            s = await pg.evaluate(CAT_SIDE); samples.append(s)
            await shot(pg, 'cat_rub_%s_%d' % (tag, i))
            await pg.wait_for_timeout(500)
        rr = [x for x in samples if x and x['state'] == 'rub']
        clips = sorted(set(x['clip'] for x in rr))
        frac = (sum(1 for x in rr if (x['side'] > 0) == (dir_ > 0)) / len(rr)) if rr else 0
        rubs[tag] = {'samples': samples, 'clips': clips, 'frac': frac}
        note('%s：%s' % (tag, J(samples)))
        wantc = 'cat_rub' if dir_ > 0 else 'cat_rub_r'
        check('cat %s：蹭的時候播 %s' % (tag, wantc), bool(rr) and clips == [wantc], J(clips))
        check('cat %s：玩家在貓的%s邊（蹭的那幾格 ≥ 60%%）' % (tag, '左' if dir_ > 0 else '右'), frac >= 0.6, '%.2f（%d 格）' % (frac, len(rr)))
    REC['data']['cat_rub'] = rubs
    # 每一段片段【捷徑】
    note('[捷徑] 直接用貓的 mixer 播每一段（貓停住、鏡頭拉近）——cat_lie_idle、cat_jump_down、cat_jump_up 遊戲還沒接（2aaa7d22b 說明）')
    await pg.evaluate("(()=>{ const c=WZCAT._cat(); c.rub=null; c.path=null; c.state='hold_cc'; })()")
    seg = {}
    for clip in ('cat_walk', 'cat_idle', 'cat_sit', 'cat_sit_idle', 'cat_rub', 'cat_rub_r', 'cat_lie_idle', 'cat_jump_down', 'cat_jump_up'):
        r = await pg.evaluate(r"""(async name=>{ const c=WZCAT._cat(); if(!c||!c.act[name]) return {err:'沒有 '+name}; for(const k in c.act){ c.act[k].stop(); } const a=c.act[name]; a.reset(); a.setLoop(THREE.LoopRepeat,Infinity); a.clampWhenFinished=false; a.timeScale=1; a.enabled=true; a.setEffectiveWeight(1); a.play(); c.cur=name;
            const bones={}; c.obj.traverse(o=>{ if(o.isBone) bones[o.name]=o; }); const names=Object.keys(bones); const head=names.find(n=>/head/i.test(n)), tail=names.filter(n=>/tail/i.test(n)).pop(); const P=n=>bones[n]?bones[n].getWorldPosition(new THREE.Vector3()):null;
            const ps=[]; for(let i=0;i<9;i++){ c.mixer.update(0.25); c.obj.updateMatrixWorld(true); ps.push([P(head),P(tail)]); }
            let mh=0, mt=0; for(let i=1;i<ps.length;i++){ if(ps[i][0]&&ps[0][0]) mh=Math.max(mh,ps[i][0].distanceTo(ps[0][0])); if(ps[i][1]&&ps[0][1]) mt=Math.max(mt,ps[i][1].distanceTo(ps[0][1])); }
            c.mixer.timeScale=0; return {head, tail, moveHead:+mh.toFixed(4), moveTail:+mt.toFixed(4)}; })(%s)""" % J(clip))
        await pg.evaluate("(()=>{ const c=WZCAT._cat(); const p=c.obj.position; const E=GAME.E; E.cinematic(new THREE.Vector3(p.x+1.1,0.75,p.z+1.1), new THREE.Vector3(p.x,0.18,p.z)); E.snapCinematic&&E.snapCinematic(); })()")
        await pg.wait_for_timeout(1500)
        f = await shot(pg, 'cat_clip_%s' % clip)
        await pg.evaluate("WZCAT._cat().mixer.timeScale=1")
        seg[clip] = r; note('%s：%s → %s' % (clip, J(r), f))
    REC['data']['cat_clips'] = seg
    moved = {k: v for k, v in seg.items() if not v.get('err') and max(v['moveHead'], v['moveTail']) > 0.005}
    check('cat：九段片段播了以後骨架有動（頭或尾巴 2 秒內 > 5 mm）', len(moved) == 9, J({k: [v.get('moveHead'), v.get('moveTail'), v.get('err')] for k, v in seg.items()}))
    await pg.evaluate("GAME.E.endCinematic()")


async def main():
    os.makedirs(OUT, exist_ok=True)
    t_all = time.time()
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True) if HEADLESS else await launch_headed(p)
        await pg.goto(URL); check('遊戲載入', await L.wait_loaded(pg))
        await pg.evaluate("localStorage.clear(); STORY.phoneAuto=()=>{}")
        await helpers(pg)
        for c in CASES:
            fn = {'xinhai': case_xinhai, 'study08': case_study08, 'sixlaw': case_sixlaw, 'teahouse': case_teahouse, 'aunts': case_aunts, 'cat': case_cat}.get(c)
            if not fn: note('不認得的 CASE：%s' % c); continue
            t0 = time.time(); print('== %s' % c, flush=True)
            try:
                await fn(pg, cdp)
            except Exception as e:
                check('%s：探針沒有例外' % c, False, repr(e)[:300])
                try: await shot(pg, 'exception_%s' % c)
                except Exception: pass
            note('%s 用了 %.0f 秒' % (c, time.time() - t0))
        check('沒有 JS 例外', not errs, J(errs[:3]))
        REC['errs'] = errs[:10]
        await b.close()
    REC['fails'] = FAILS; REC['secs'] = round(time.time() - t_all)
    with open(os.path.join(OUT, 'art_v20.json'), 'w', encoding='utf-8') as f:
        json.dump(REC, f, ensure_ascii=False, indent=1, default=str)
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS[:8])), flush=True)
    sys.exit(1 if FAILS else 0)


async def launch_headed(p):
    """PC（CC_HEADLESS=0）：有視窗＋顯示卡；其他和 playlib.launch 一樣（橫向 844×390、手機模擬）"""
    b = await p.chromium.launch(headless=False)
    ctx = await b.new_context(viewport={'width': 844, 'height': 390}, device_scale_factor=1, has_touch=True, is_mobile=True, user_agent=L.UA)
    pg = await ctx.new_page(); cdp = await ctx.new_cdp_session(pg); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    return b, ctx, pg, cdp, errs


asyncio.run(main())
