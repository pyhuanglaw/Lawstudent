"""CC（帳號 A）11-10：花序 Flower Notes（FLOWER-NOTES-1110／X325；BB_312 驗收計畫）三支探針共用的函式：cc_fn_func_probe.py、cc_fn_migrate_probe.py、cc_fn_shots_probe.py。
改之前＝開發分支 632ef134e：公館捷運口花攤「晨露花舖」(−47, 11.6)，互動點 kind gg_flower「看看花攤」（src/zones3d.js 1069～1077：阻擋 rect 中心 (−47, 11.725) 寬 2.9 深 2.05、
  互動點 (−47.2, 13.45) r 1.3；模型 bldg.gg_flower_stall＝場景物件 gg_flower_stall_glb、材質 ggf_*）；買花＝src/gifthol3d.js 122～124、348（STORY.interact 包一層：
  kind gg_flower 而且 GIFTH.flowerOpen(G)〔09:00≤h<21:00〕→ GIFTH.shopOpt(G,'gg_flower') → GIFTH.pick → GIFTH.buy：GM.choose「品名　價錢 元」＋「算了」、
  錢不夠＝dim 但照樣按得到 → toast「錢不夠」不扣、買了 GM.money(-價錢)、bag.push({id,day,shop:'gg_flower'})）；商品資料＝GIFT_HOLIDAY.shops.gg_flower.items、GIFT_HOLIDAY.items[id]
  （src/data/gift_holiday.js 137～144、676～697：g_bouquet 一束花 450、g_sunflower 一朵向日葵 120）。G11＝公館店面街第 12 間（src/zones3d.js 937 shops[11] 泰米村食，
  type none＝沒有互動點、進不去；userData.ggShop＝'G11'，世界 x 41.3～51.6、立面 z≈19）。
新版的店名、內部區域、商品清單、二樓都還不知道：這裡一律從遊戲的全域物件偵測（gg_flower 互動點、exit、ggShop、GIFTH／GIFT_HOLIDAY），不寫死新版的座標或區域名。
用法：import cc_fn_lib as F；F.setup(R, OUT)。"""
import os, sys, json, math, time, re
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D

R = None
OUT = '.'
J = lambda o: json.dumps(o, ensure_ascii=False)
SAVE = os.path.join(HERE, 'fixtures', 'user_saves_1107', 'fatiao3d_save_day46.json')
OLD_STALL = {'cx': -47.0, 'cz': 11.725, 'w': 2.9, 'd': 2.05, 'ix': -47.2, 'iz': 13.45}   # 改之前的花攤（src/zones3d.js 1073）
FLOWER_KIND = 'gg_flower'
SHOP_KEY = os.environ.get('FN_SHOP') or 'gg_flower'   # GIFTH 的店代號（BB_312 第 1 節：不改）


def setup(run, out):
    global R, OUT
    R = run; OUT = out; D.setup(run, out)


# ---------------------------------------------------------------- 讀檔
def day46():
    s = json.load(open(SAVE, encoding='utf-8')); return dict(s.get('G', s))


async def load(pg, cdp, why, zone='gongguan', x=-40.0, z=8.0, yaw=0.0, hour=10.0, day_key=None, money=5000, clear_bag=True, quiet_events=True, extra=None):
    """【前置／捷徑】day46 存檔改區域、位置、時間（、日期）、錢，包包清空（GIFTH.bag＝[]，不動 given／sent／fest）"""
    st = day46(); st['zone'] = zone; st['pos'] = {'x': x, 'z': z, 'yaw': yaw, 'lv': 0}; st['hour'] = hour; st['money'] = money; st['invites'] = []
    if day_key:
        d = await pg.evaluate("(k=>{ if(typeof STORY!=='undefined'&&STORY.dayOfKey) return STORY.dayOfKey(k); for(let d=0;d<4000;d++){ try{ if(CALENDAR.dateOf(d).key===k) return d; }catch(e){} } return null; })(%s)" % J(day_key))
        st['day'] = d
        try: st['weekday'] = await pg.evaluate("(d=>CALENDAR.dateOf(d).wd%%7)(%d)" % d)
        except Exception: pass
    if clear_bag:
        fl = dict(st.get('flags') or {}); g = dict(fl.get('GIFTH') or {}); g['bag'] = []; fl['GIFTH'] = g; st['flags'] = fl
    if extra: extra(st)
    try: await L.load_state(pg, st, quiet_events=quiet_events, quiet_phone=True)
    except TypeError: await L.load_state(pg, st, quiet_events=quiet_events)
    await pg.wait_for_timeout(5000); await L.close_panels(pg, cdp)
    await pg.evaluate(TOAST_HOOK)
    R.setup('【前置／捷徑】%s：day46 存檔 → %s (%.1f, %.1f) %s %05.2f、錢 %d%s%s' % (why, zone, x, z, day_key or ('第 %s 天' % st.get('day')), hour, money, '、包包清空' if clear_bag else '', '、關條件事件' if quiet_events else ''))
    return await D.st(pg)


TOAST_HOOK = r"""(()=>{ window.__fnToast=window.__fnToast||[]; if(window.__fnToastHooked) return; window.__fnToastHooked=1; const t=document.getElementById('toast'); if(t){ new MutationObserver(()=>{ const x=(t.innerText||'').trim(); if(x&&window.__fnToast[window.__fnToast.length-1]!==x) window.__fnToast.push(x); }).observe(t,{childList:true,subtree:true,characterData:true,attributes:true}); } })()"""


async def toasts(pg, clear=False):
    v = await pg.evaluate("(window.__fnToast||[]).slice()")
    if clear: await pg.evaluate("window.__fnToast=[]")
    return v


# ---------------------------------------------------------------- 找東西
G11_JS = r"""((ov)=>{ if(ov) return {x0:ov[0],x1:ov[1],zf:ov[2],cx:(ov[0]+ov[1])/2,src:'FN_G11'}; const E=GAME.E; let b=null;
  E.scene.traverse(o=>{ if(b||!o.userData||o.userData.ggShop!=='G11') return; const bb=new THREE.Box3().setFromObject(o); if(!bb.isEmpty()) b=bb; });
  if(!b) return null; return {x0:+b.min.x.toFixed(2),x1:+b.max.x.toFixed(2),zf:+b.min.z.toFixed(2),cx:+((b.min.x+b.max.x)/2).toFixed(2),src:'ggShop G11'}; })"""
LIST_FLOWER_JS = r"""((k)=>(GAME.E.interactables||[]).filter(i=>i.kind===k).map(i=>({zone:GAME.G.zone,label:i.label,x:+i.x.toFixed(2),z:+i.z.toFixed(2),lv:i.lv|0,r:i.radius||null,hidden:!!i.hidden,exit:i.exit?i.exit.to:null,look:i.look?String(i.look).slice(0,60):null})))"""
EXITS_JS = r"""(()=>{ const ZN=id=>(typeof Z3!=='undefined'&&Z3.ZONES&&Z3.ZONES[id]&&Z3.ZONES[id].name)||''; return (GAME.E.interactables||[]).filter(i=>i.exit).map(i=>({label:i.label,x:+i.x.toFixed(2),z:+i.z.toFixed(2),lv:i.lv|0,r:i.radius||1,to:i.exit.to,toName:ZN(i.exit.to),hidden:!!i.hidden,kind:i.kind||null})); })()"""
SRC_SCAN_JS = r"""(async(k)=>{ const out=[]; const srcs=[...document.scripts].map(s=>s.src).filter(Boolean).filter(u=>/\/src\//.test(u));
  for(const u of srcs){ try{ const t=await (await fetch(u)).text(); const L=t.split('\n'); for(let i=0;i<L.length;i++) if(L[i].indexOf(k)>=0) out.push([u.replace(/^.*\/src\//,'src/'), i+1, L[i].trim().slice(0,160)]); }catch(e){ out.push([u,0,'讀不到 '+e]); } }
  return out; })"""
OBJ_NEAR_JS = r"""((q)=>{ const E=GAME.E, out=[], bx=new THREE.Box3(new THREE.Vector3(q.x0,0.05,q.z0),new THREE.Vector3(q.x1,4,q.z1));
  E.scene.traverse(o=>{ if(!o.isMesh||!o.visible) return; let v=true; for(let p=o.parent;p;p=p.parent) if(p.visible===false){ v=false; break; } if(!v) return;
    const b=new THREE.Box3().setFromObject(o); if(b.isEmpty()||!b.intersectsBox(bx)) return; if(b.max.y-b.min.y<0.08) return;   /* 地面、人行道磚（薄片）不算 */
    const sz=b.getSize(new THREE.Vector3()); if(sz.x>30||sz.z>30) return;   /* 整區合併的大塊（整條街）不算 */
    out.push({name:o.name||'', mat:(o.material&&o.material.name)||'', parent:(o.parent&&o.parent.name)||'', min:[+b.min.x.toFixed(1),+b.min.y.toFixed(1),+b.min.z.toFixed(1)], max:[+b.max.x.toFixed(1),+b.max.y.toFixed(1),+b.max.z.toFixed(1)]}); });
  let stall=false; E.scene.traverse(o=>{ if(/^gg_flower_stall/.test(o.name||'')&&o.visible) stall=true; });
  return {objs:out.slice(0,60), n:out.length, stallObj:stall, ggf:out.filter(o=>/^ggf_/.test(o.mat)||/^ggf_/.test(o.name)).length}; })"""
NPC_NEAR_JS = r"""((q)=>(GAME.E.npcs||[]).filter(n=>n.obj&&n.obj.visible!==false&&Math.hypot(n.obj.position.x-q.x,n.obj.position.z-q.z)<q.r).map(n=>({id:n.charId||n.id||n.name||'',name:n.name||'',extra:!!n.isExtra,x:+n.obj.position.x.toFixed(2),z:+n.obj.position.z.toFixed(2),frozen:!!n.frozen,path:n.path?n.path.length:0,beh:n.beh||null})))"""
NAV_RECT_JS = r"""((q)=>{ const E=GAME.E, bad=[]; let n=0; for(let x=q.x0;x<=q.x1+1e-6;x+=0.5) for(let z=q.z0;z<=q.z1+1e-6;z+=0.5){ n++; if(!E.canStand(x,z,0.3,0)) bad.push([+x.toFixed(2),+z.toFixed(2)]); } return {n,bad}; })"""
EXPECT_JS = r"""((k)=>{ const G=GAME.G, X=typeof GIFT_HOLIDAY!=='undefined'?GIFT_HOLIDAY:null; if(typeof GIFTH==='undefined'||!X) return null; const sh=X.shops[k]||null; const sells=GIFTH.sells(G,k);
  const CK=['cat','category','kind','type','group','section','line_cat'];
  return {shop:sh?{name:sh.name, shopName:GIFTH.shopName(k), items:(sh.items||[]).slice(), note:sh.note||null, keys:Object.keys(sh)}:null,
    sells:sells.map(id=>{ const it=GIFTH.item(id)||{}; const c=CK.find(q=>it[q]!=null); return {id, name:it.name, price:it.price, shop:it.shop||null, cat:c?String(it[c]):null, catKey:c||null, season:!!(GIFTH.SEASON&&GIFTH.SEASON[id])}; }),
    open:GIFTH.flowerOpen?GIFTH.flowerOpen(G):null, hour:+(+G.hour).toFixed(2)}; })"""
BAG_JS = r"""(()=>{ const G=GAME.G; if(typeof GIFTH==='undefined') return null; return {money:G.money|0, bag:GIFTH.bag(G).map(b=>({id:b.id,shop:b.shop,day:b.day})), raw:((G.flags||{}).GIFTH||{}).bag||null}; })()"""
GIFTREC_JS = r"""((pid)=>{ const G=GAME.G, R=((G.flags||{}).GIFTH)||{}; const M=(typeof SOCIAL!=='undefined'&&SOCIAL.memories)?(SOCIAL.memories(pid)||[]):[];
  return {given:(R.given||{})[pid]||[], sent:Object.fromEntries(Object.entries(R.sent||{}).filter(([k])=>k.indexOf(pid+'|')===0)), fest:R.fest||{}, bag:(R.bag||[]).map(b=>b.id+'@'+b.shop),
    mem:M.filter(m=>m&&/^GIFT_/.test(m.tag||'')).map(m=>({tag:m.tag,day:m.day,v:m.v||m.detail||m.note||m.text||null}))}; })"""
PATH_AHEAD_JS = r"""(([tx,tz,tlv,ahead])=>{ const E=GAME.E,P=E.player,o=P.obj.position,plv=P.lv|0; const glv=(tlv===null||tlv===undefined)?plv:tlv; if(!E.pathTo) return null; const p=E.pathTo(o.x,o.z,plv,tx,tz,glv); if(!p||!p.length) return null;
  let ax=o.x,az=o.z,acc=0; for(const q of p){ const L=Math.hypot(q[0]-ax,q[1]-az); if(acc+L>=ahead){ const f=(ahead-acc)/Math.max(L,1e-6); return {x:ax+(q[0]-ax)*f,z:az+(q[1]-az)*f,n:p.length}; } acc+=L; ax=q[0]; az=q[1]; } return {x:ax,z:az,n:p.length}; })"""
FPS_JS = r"""((ms)=>new Promise(res=>{ let n=0; const t0=performance.now(); const f=()=>{ n++; const t=performance.now()-t0; if(t<ms) requestAnimationFrame(f); else res({frames:n, ms:+t.toFixed(0), fps:+(n*1000/t).toFixed(2)}); }; requestAnimationFrame(f); }))"""
SAVE_NOW_JS = r"""(()=>{ let ok=false, how='quickSave'; try{ ok=!!(GAME.quickSave&&GAME.quickSave()); }catch(e){ how='quickSave 例外 '+e; } let s=null;
  if(ok&&GAME.readSave) s=GAME.readSave('fatiao3d_quick'); if(!s){ s=GAME.snapshot(); how=how+'→snapshot'; } return {ok, how, s}; })()"""


async def g11(pg):
    ov = os.environ.get('FN_G11')   # 'x0,x1,zf'：手動指定 G11 的範圍（偵測不到時）
    return await pg.evaluate("(%s)(%s)" % (G11_JS, J([float(v) for v in ov.split(',')] if ov else None)))


async def find_door(pg, g):
    """G11 的店門：exit 的 label／區域名有「花序」「Flower」，或位置在 G11 的寬度裡、立面前 0～5 m（往汀州路的巷子在 G10，不算）"""
    exs = await pg.evaluate(EXITS_JS)
    lab = os.environ.get('FN_DOOR_LABEL')
    for e in exs:
        if lab and e['label'].startswith(lab): return e, exs
    for e in exs:
        if '花序' in e['label'] or 'flower' in e['label'].lower() or '花序' in e['toName'] or 'flower' in e['to'].lower(): return e, exs
    if g:
        for e in exs:
            if g['x0'] - 0.5 <= e['x'] <= g['x1'] + 0.5 and g['zf'] - 1 <= e['z'] <= g['zf'] + 5 and e['to'] not in ('tingzhou', 'campus'): return e, exs
    return None, exs


async def expect(pg):
    return await pg.evaluate("(%s)(%s)" % (EXPECT_JS, J(SHOP_KEY)))


# ---------------------------------------------------------------- 走路
async def joy_to(pg, cdp, tag, tx, tz, near=0.6, lv=None, max_s=90, straight=False, push_ms=600):
    """搖桿走到 (tx,tz)：straight＝一直朝目標直線推（測「這裡走不走得過去」，不繞路）；否則朝 E.pathTo 前方 1.5 m 推（玩家看著路推搖桿）。
    每一步記位置；兩次取樣之間位移 > max(2.5, 6×秒) m＝跳（傳送）。回傳 {ok, t, pushes, jumps, end, log}"""
    t0 = time.time(); log = []; jumps = []; pushes = 0; last_prog = (time.time(), None); prev = None
    while time.time() - t0 < max_s:
        s = await D.st(pg); now = time.time()
        if prev is not None:
            dd = math.hypot(s['x'] - prev[1], s['z'] - prev[2]); dt = now - prev[0]
            if s['zone'] == prev[3] and dd > max(2.5, 6 * dt): jumps.append({'t': round(now - t0, 1), 'from': prev[1:3], 'to': [s['x'], s['z']], 'd': round(dd, 2)})
        prev = (now, s['x'], s['z'], s['zone']); log.append([round(now - t0, 1), s['x'], s['z'], s['lv']])
        d = math.hypot(tx - s['x'], tz - s['z'])
        if d <= near and (lv is None or s['lv'] == lv):
            return {'ok': True, 't': round(now - t0, 1), 'pushes': pushes, 'jumps': jumps, 'end': s, 'log': log}
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(400); continue
        if s['choices']: await pg.wait_for_timeout(400); return {'ok': False, 't': round(now - t0, 1), 'pushes': pushes, 'jumps': jumps, 'end': s, 'log': log, 'why': '出現選項：%s' % J(s['choices'])}
        if last_prog[1] is None or math.hypot(s['x'] - last_prog[1][0], s['z'] - last_prog[1][1]) > 0.3: last_prog = (now, (s['x'], s['z']))
        elif now - last_prog[0] > 20:
            return {'ok': False, 't': round(now - t0, 1), 'pushes': pushes, 'jumps': jumps, 'end': s, 'log': log, 'why': '20 秒沒有前進 0.3 m（卡住）'}
        ax, az = tx, tz
        if not straight:
            ah = await pg.evaluate("(%s)(%s)" % (PATH_AHEAD_JS, J([tx, tz, lv, 1.5])))
            if ah: ax, az = ah['x'], ah['z']
        yaw = s.get('camYaw')
        if yaw is None: yaw = await pg.evaluate("GAME.E.cam.yaw")
        fx, fz = -math.sin(yaw), -math.cos(yaw); rx, rz = -fz, fx
        da = max(math.hypot(ax - s['x'], az - s['z']), 0.01); ux, uz = (ax - s['x']) / da, (az - s['z']) / da
        sx, sy = ux * rx + uz * rz, -(ux * fx + uz * fz); m = math.hypot(sx, sy) or 1
        await L.joystick(pg, cdp, sx / m * 45, sy / m * 45, push_ms); pushes += 1
    s = await D.st(pg)
    return {'ok': False, 't': round(time.time() - t0, 1), 'pushes': pushes, 'jumps': jumps, 'end': s, 'log': log, 'why': '%d 秒沒走到' % max_s}


async def tap_near(pg, cdp, tag, x, z, near, max_s=180, lv=None):
    """觸控點地板走過去（L.go_to）；走完等人停下來"""
    ok = await L.go_to(pg, cdp, R, x, z, near, tag, max_s=max_s, lv=lv)
    await D.settle(pg); return ok


async def wait_btn(pg, prefix, secs=5):
    for _ in range(int(secs * 2)):
        s = await D.st(pg)
        if s['interact'].startswith(prefix): return s
        await pg.wait_for_timeout(500)
    return await D.st(pg)


# ---------------------------------------------------------------- 店：買
def match_opts(opts, sells):
    """畫面上的選項（textContent 含 hint）對資料：每一樣找開頭是品名的那一個；回傳 {id: {t, dim, price_shown}}、多出來的選項"""
    got = {}; used = set()
    for it in sells:
        for k, o in enumerate(opts):
            if k in used: continue
            if o['t'].startswith(it['name']):
                rest = o['t'][len(it['name']):len(it['name']) + 16]
                ps = None
                m = re.search(r'(\d[\d,]*)\s*元', rest)
                if m: ps = int(m.group(1).replace(',', ''))
                got[it['id']] = {'k': k, 't': o['t'][:60], 'dim': o['dim'], 'price_shown': ps}; used.add(k); break
    extra = [o['t'][:40] for k, o in enumerate(opts) if k not in used and not o['t'].startswith('算了')]
    return got, extra


async def open_shop(pg, cdp, tag, label, sells, max_steps=30):
    """互動按鈕是 label 時按下去，一路點對話；遇到「買禮物…」「選物…」「買花」這類選項先選它；出現有品名的選單就停。
    回傳 {'opts': 選項 or None, 'trace': [...]}（opts＝出現品名的那一個選單）"""
    s = await wait_btn(pg, label, 6)
    if not s['interact'].startswith(label): return {'opts': None, 'trace': ['互動按鈕不是「%s」：%s' % (label, s['interact'])]}
    await L.tap(pg, cdp, '#interact'); trace = []; names = [x['name'] for x in sells]; idle = 0; caps = set()
    for _ in range(max_steps):
        await pg.wait_for_timeout(700); q = await L.state(pg)
        cap = await pg.evaluate(CAPTION_JS)   # 「看」的旁白是 GM.caption（#caption，game3d.js doInteract：it.look → caption('',it.look,4600)），不是對話框
        if cap and cap not in caps: caps.add(cap); trace.append('旁白：' + cap[:80])
        if q['choices']:
            o = await pe_opts(pg); trace.append('選項：' + '｜'.join(x['t'][:24] for x in o))
            if any(x['t'].startswith(n) for x in o for n in names): return {'opts': o, 'trace': trace}
            k = next((i for i, x in enumerate(o) if any(w in x['t'] for w in ('買禮物', '選物', '買花', '看花', '購買', '買東西'))), None)
            if k is None: return {'opts': None, 'trace': trace, 'stuck_opts': o}
            await choose_k(pg, cdp, k); continue
        if q['dlg']: trace.append('對話：' + q['dtext']); await L.tap(pg, cdp, '#dlg'); idle = 0; continue
        if not q['busy']:
            idle += 1
            if idle >= 4: break   # 按下去約 3 秒都沒有對話、選項（只有旁白或什麼都沒有）
    return {'opts': None, 'trace': trace}


CAPTION_JS = r"""(()=>{ const e=document.getElementById('caption'); if(!e) return ''; const cs=getComputedStyle(e); if(e.classList.contains('hide')||cs.display==='none'||cs.visibility==='hidden'||+cs.opacity<0.05) return ''; return (e.innerText||'').trim(); })()"""


async def pe_opts(pg):
    return await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>({t:b.textContent.trim(),dim:!!(b.disabled||b.classList.contains('dim'))}))")


async def opt_xy(pg, k):
    return await pg.evaluate("(i=>{ const b=document.querySelectorAll('#choices button')[i]; if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%d)" % k)


async def choose_k(pg, cdp, k, double=False):
    c = await opt_xy(pg, k)
    if not c: return False
    await L.touch_tap(cdp, c[0], c[1])
    if double: await pg.wait_for_timeout(70); await L.touch_tap(cdp, c[0], c[1])   # 連點兩下（70 ms）：第二下落在原地（選單已收＝點到對話框或地板）
    await pg.wait_for_timeout(900); return True


async def finish_dialog(pg, cdp, secs=20, pick_exit=True):
    """點完對話；之後還有選單（買完回到店家選單）就選「算了／就這樣／離開」"""
    said = []
    for _ in range(int(secs * 2)):
        q = await L.state(pg)
        if q['dlg']:
            if not said or said[-1] != q['dtext']: said.append(q['dtext'])
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
        if q['choices'] and pick_exit:
            o = await pe_opts(pg); k = next((i for i, x in enumerate(o) if any(w in x['t'] for w in ('算了', '就這樣', '離開', '不用了', '先這樣', '沒事'))), len(o) - 1)
            said.append('【選】' + o[k]['t'][:20]); await choose_k(pg, cdp, k); continue
        if not q['busy'] and not q['dlg'] and not q['choices']: return said
        await pg.wait_for_timeout(500)
    return said


async def bag_ui(pg, cdp):
    """選單 → 物品：包包那一頁的字（玩家看得到的）"""
    await L.tap(pg, cdp, '#btnMenu'); await pg.wait_for_timeout(900)
    await L.tap(pg, cdp, '#menu .tabs button[data-tab="items"]'); await pg.wait_for_timeout(900)
    txt = await pg.evaluate("((document.getElementById('itemsList')||{}).innerText||'').trim()")
    await D.shot(pg, 'fn_bag_ui', judge_black=False)
    await L.close_panels(pg, cdp); await pg.wait_for_timeout(500)
    return txt


# ---------------------------------------------------------------- 送花（現有 GIFTH 送禮流程：節日當面說話 → 「送她禮物…」→ 挑一樣）
NPC_JS = r"""((pid)=>{ const E=GAME.E, n=(GAME.npc&&GAME.npc[pid])||(E.npcs||[]).find(q=>q.charId===pid); if(!n||!n.obj) return null; const o=n.obj.position; return {x:+o.x.toFixed(2),z:+o.z.toFixed(2),lv:n.lv|0,label:n.talkLabel||null,name:n.name||null,frozen:!!n.frozen,vis:n.obj.visible!==false}; })"""
WHO_JS = r"""((ids)=>{ const G=GAME.G; return ids.map(id=>({id, can:typeof GIFTH!=='undefined'&&GIFTH.canGet(G,id), hol:typeof GIFTH!=='undefined'?GIFTH.holOf(id,G.day):null, where:typeof STORY!=='undefined'&&STORY.whereIs?STORY.whereIs(GAME,id):null, st:typeof GIFTH!=='undefined'?(()=>{ const s=GIFTH.state(G,id); return s?{items:s.items.map(b=>b.id),capped:s.capped}:null; })():null})); })"""


async def give(pg, cdp, tag, pid, gid, max_walk=180, select=True):
    """走到她旁邊（觸控點地板）、按「和她說話」、選「送她禮物…」、選 gid 那一樣、點完。回傳 {offered, picked, said, opts}。
    select=False：只看選單有沒有「送她禮物…」（offered），不選它"""
    out = {'offered': False, 'picked': False, 'said': [], 'opts': []}
    name = await pg.evaluate("(g=>(typeof GIFTH!=='undefined'&&GIFTH.item(g)||{}).name||null)(%s)" % J(gid))
    for attempt in range(4):
        n = await pg.evaluate("(%s)(%s)" % (NPC_JS, J(pid)))
        if not n: out['why'] = '這一區沒有她（GAME.npc／E.npcs）'; return out
        await L.go_to(pg, cdp, R, n['x'], n['z'], 1.1, '%s 走到她旁邊（第 %d 次）' % (tag, attempt + 1), max_s=max_walk, lv=n['lv'])
        await D.settle(pg)
        lab = n['label'] or '和'
        s = await wait_btn(pg, lab, 4)
        if s['interact'].startswith(lab) and s['interact'].startswith('和'): break
        R.note('%s 走到她旁邊，互動按鈕是「%s」（要「%s」）' % (tag, s['interact'], lab))
    else:
        out['why'] = '走不到她旁邊、沒有「和她說話」'; return out
    out['label'] = s['interact']
    await L.tap(pg, cdp, '#interact')
    for _ in range(120):
        await pg.wait_for_timeout(600); q = await L.state(pg)
        if q['choices']:
            o = await pe_opts(pg); out['opts'].append([x['t'][:24] for x in o])
            if not out['picked']:
                k = next((i for i, x in enumerate(o) if x['t'].startswith('送她禮物')), None)
                if k is not None and not out['offered']:
                    out['offered'] = True; out['offer_dim'] = o[k]['dim']
                    if select: await choose_k(pg, cdp, k); continue
                k = next((i for i, x in enumerate(o) if name and x['t'].startswith(name)), None) if out['offered'] else None
                if k is not None: out['picked'] = True; await choose_k(pg, cdp, k); continue
            k = next((i for i, x in enumerate(o) if any(w in x['t'] for w in ('就這樣', '算了', '沒事', '先這樣', '下次', '不用了', '再見', '離開'))), len(o) - 1)
            await choose_k(pg, cdp, k); continue
        if q['dlg']:
            if not out['said'] or out['said'][-1] != q['dtext']: out['said'].append(q['dtext'])
            await L.tap(pg, cdp, '#dlg'); continue
        if not q['busy']:
            await pg.wait_for_timeout(1200); q = await L.state(pg)
            if not q['busy'] and not q['dlg'] and not q['choices']: break
    return out


async def shot(pg, cdp, name, cam=None):
    """有 cam＝D.user_shot（1280×720、藏 HUD 和玩家、指定鏡頭，page.screenshot 算亮度）之後換回 844×390；沒有＝目前畫面"""
    if cam:
        c = await D.user_shot(pg, cdp, name, cam)
        await pg.set_viewport_size({'width': 844, 'height': 390}); await pg.wait_for_timeout(800)
        return c
    return await D.shot(pg, name, judge_black=False)
