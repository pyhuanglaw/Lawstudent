"""CC（帳號 A）11-10：花序 Flower Notes（FLOWER-NOTES-1110／X325；BB_312 驗收計畫）三支探針共用的函式：cc_fn_func_probe.py、cc_fn_migrate_probe.py、cc_fn_shots_probe.py。
改之前＝開發分支 632ef134e：公館捷運口花攤「晨露花舖」(−47, 11.6)，互動點 kind gg_flower「看看花攤」（src/zones3d.js 1069～1077：阻擋 rect 中心 (−47, 11.725) 寬 2.9 深 2.05、
  互動點 (−47.2, 13.45) r 1.3；模型 bldg.gg_flower_stall＝場景物件 gg_flower_stall_glb、材質 ggf_*）；買花＝src/gifthol3d.js 122～124、348（STORY.interact 包一層：
  kind gg_flower 而且 GIFTH.flowerOpen(G)〔09:00≤h<21:00〕→ GIFTH.shopOpt(G,'gg_flower') → GIFTH.pick → GIFTH.buy：GM.choose「品名　價錢 元」＋「算了」、
  錢不夠＝dim 但照樣按得到 → toast「錢不夠」不扣、買了 GM.money(-價錢)、bag.push({id,day,shop:'gg_flower'})）；商品資料＝GIFT_HOLIDAY.shops.gg_flower.items、GIFT_HOLIDAY.items[id]
  （src/data/gift_holiday.js 137～144、676～697：g_bouquet 一束花 450、g_sunflower 一朵向日葵 120）。G11＝公館店面街第 12 間（src/zones3d.js 937 shops[11] 泰米村食，
  type none＝沒有互動點、進不去；userData.ggShop＝'G11'，世界 x 41.3～51.6、立面 z≈19）。
新版的店名、內部區域、商品清單、二樓都還不知道：這裡一律從遊戲的全域物件偵測（gg_flower 互動點、exit、ggShop、GIFTH／GIFT_HOLIDAY），不寫死新版的座標或區域名。
用法：import cc_fn_lib as F；F.setup(R, OUT)。
CC-C 11-12（FLOWER-NOTES-1110 接 AA_792，fb55a19173；BB-C 驗收「十樣花買得到、花藝師台詞、10:00 開／21:00 關、13 處「看」有字、三種舊存檔進原 G11 不壞」）加的（舊的函式沒改行為）：
  doc792()＝AA_792 稿（企劃線 8475a3b85，git show；讀不到＝回 None，探針改比頁面上的資料並寫明）；fn_data()＝頁面上的 FLOWER_NOTES_TEXT／GIFT_HOLIDAY／FNS.hours／PLACES.hours／XSCLOSE／FN3.GG；
  fn_expect()＝期望值（有稿用稿、同時比頁面＝稿）；dlg()＝對話框這一句（說話的人＋整句 GAME.D.full）；look_cells()＝站在哪裡互動鍵會是那一個「看」；
  joy_to 多 btn（互動鍵出現那個字就算到）、stop_on_event（途中出現對話／選單就停下來回報，不盲點）；walk_seg（觸控走路，途中有劇情就停下、照字處理、記下來）；cur_btn（互動鍵最上層是不是它）。
CC_02 清單 2026-11-12：1✓ 2✓ 3✓ 4✓ 5✓ 6n/a（共用函式不判時間；時間餘裕在各探針） 7✓ 8✓ 9n/a（共用函式不截判斷用的圖） 10✓ 11n/a（不排佇列） 12n/a（共用函式不下結論） 13✓——這次只改／加上面列的那幾個，舊的函式（OLDSPOT 的 rect、give、shop_names…）沒重審"""
import os, sys, json, math, time, re, subprocess
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
EXPECT_NAME = os.environ.get('FN_SHOP_NAME') or '花序 Flower Notes'   # 包包、送禮選單上要看到的店名（dbbe05fa5 GIFTH.SHOP_RENAME.gg_flower；店名再改就用 FN_SHOP_NAME 蓋過）


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
    """G11 的店門：先看 exit 的目的區域 id（FN_ZONE，預設 flower_notes）；再看位置（在 G11 寬度裡、前緣前 −1～+5 m；往汀州路的巷子在 G10，不算）；
    最後才看字（label／區域名有「花序」「Flower」——店名之後會改，不靠它；FN_DOOR_LABEL 可指定）"""
    exs = await pg.evaluate(EXITS_JS)
    lab = os.environ.get('FN_DOOR_LABEL'); zid = os.environ.get('FN_ZONE') or 'flower_notes'
    for e in exs:
        if lab and e['label'].startswith(lab): return e, exs
    for e in exs:
        if e['to'] == zid and not e['hidden']: return e, exs
    if g:
        for e in exs:
            if g['x0'] - 0.5 <= e['x'] <= g['x1'] + 0.5 and g['zf'] - 1 <= e['z'] <= g['zf'] + 5 and e['to'] not in ('tingzhou', 'campus'): return e, exs
    for e in exs:
        if '花序' in e['label'] or 'flower' in e['label'].lower() or '花序' in e['toName'] or 'flower' in e['to'].lower(): return e, exs
    return None, exs


async def expect(pg):
    return await pg.evaluate("(%s)(%s)" % (EXPECT_JS, J(SHOP_KEY)))


# ---------------------------------------------------------------- 走路
async def joy_to(pg, cdp, tag, tx, tz, near=0.6, lv=None, max_s=90, straight=False, push_ms=600, btn=None, stop_on_event=False):
    """搖桿走到 (tx,tz)：straight＝一直朝目標直線推（測「這裡走不走得過去」，不繞路）；否則朝 E.pathTo 前方 1.5 m 推（玩家看著路推搖桿）。
    每一步記位置；兩次取樣之間位移 > max(2.5, 6.2×1.5×秒) m＝跳（傳送；跑速 6.2）。回傳 {ok, t, pushes, jumps, end, log}
    CC-C 11-12：btn＝互動鍵出現這個字（開頭）就算到了（CC_02 乙 5：走向互動物件看按鈕、不看座標）；
    stop_on_event＝途中出現對話或選單就停下來回報（why＝途中出現對話／選單、event＝那一句），不自己點掉（CC_02 乙 13）"""
    t0 = time.time(); log = []; jumps = []; pushes = 0; last_prog = (time.time(), None); prev = None
    while time.time() - t0 < max_s:
        s = await D.st(pg); now = time.time()
        if btn and s['interact'].startswith(btn) and (lv is None or s['lv'] == lv) and not s['dlg'] and not s['choices']:
            log.append([round(now - t0, 1), s['x'], s['z'], s['lv']])
            return {'ok': True, 't': round(now - t0, 1), 'pushes': pushes, 'jumps': jumps, 'end': s, 'log': log, 'by': '互動鍵＝' + s['interact']}
        if stop_on_event and (s['dlg'] or s['choices']):
            ev = await dlg(pg) if s['dlg'] else {'choices': s['choices']}
            return {'ok': False, 't': round(now - t0, 1), 'pushes': pushes, 'jumps': jumps, 'end': s, 'log': log, 'why': '途中出現%s' % ('對話' if s['dlg'] else '選單'), 'event': ev}
        if prev is not None:
            dd = math.hypot(s['x'] - prev[1], s['z'] - prev[2]); dt = now - prev[0]
            if s['zone'] == prev[3] and dd > max(2.5, 6.2 * 1.5 * dt):  jumps.append({'t': round(now - t0, 1), 'from': prev[1:3], 'to': [s['x'], s['z']], 'd': round(dd, 2)})   # CC 12:1x：跑速 6.2（E.SPD.run），原本 6×秒 低於跑速，10 fps 取樣 0.5 秒誤判（逐幀比值最大 1.0）
        if straight and prev is not None and s['zone'] == prev[3]:   # r3（CC 01:4x）：直線測「走不走得過去」——兩次取樣之間的線段穿過目標 near 以內也算到（PC 上會衝過頭）
            ax0, az0, bx0, bz0 = prev[1], prev[2], s['x'], s['z']; vx0, vz0 = bx0 - ax0, bz0 - az0; L2 = vx0 * vx0 + vz0 * vz0
            u0 = max(0.0, min(1.0, ((tx - ax0) * vx0 + (tz - az0) * vz0) / L2)) if L2 > 1e-9 else 0.0
            if math.hypot(ax0 + vx0 * u0 - tx, az0 + vz0 * u0 - tz) <= near and (lv is None or s['lv'] == lv):
                log.append([round(now - t0, 1), s['x'], s['z'], s['lv']])
                return {'ok': True, 't': round(now - t0, 1), 'pushes': pushes, 'jumps': jumps, 'end': s, 'log': log, 'crossed': True}
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
        pm = push_ms if d > 2.5 else max(250, int(push_ms * d / 2.5)); mag = 45 if d > 2.5 else max(16, 45 * d / 2.5)   # r3：近目標也推輕一點（走慢）   # r2（CC 01:2x）：離目標 2.5 m 內推短一點——PC 上每推 0.6 秒走 1 m 多，會在目標兩邊來回晃（FN OLDSPOT、STAIRS 第一輪 TEST_BUG）
        await L.joystick(pg, cdp, sx / m * mag, sy / m * mag, pm); pushes += 1
    s = await D.st(pg)
    # BB 01:47：走不到時分清楚是沒路還是探針——從停下的位置問 E.pathTo 到目標（null＝遊戲找不到路）
    pd = await pg.evaluate("(a=>{ const E=GAME.E,P=E.player,o=P.obj.position; const r=E.pathTo?E.pathTo(o.x,o.z,P.lv|0,a[0],a[1],(a[2]==null?(P.lv|0):a[2])):null; return {from:[+o.x.toFixed(2),+o.z.toFixed(2)], n:r?r.length:null, pts:r?r.slice(0,10).map(p=>Array.isArray(p)?[+(+p[0]).toFixed(2),+(+p[1]).toFixed(2)]:[+(+p.x).toFixed(2),+(+p.z).toFixed(2)]):null, standTarget:E.canStand?!!E.canStand(a[0],a[1],0.3,(a[2]==null?(P.lv|0):a[2])):null}; })", [tx, tz, lv])
    R.note('%s 走不到 (%.2f,%.2f)：E.pathTo 從停下的位置 %s → %s 點 %s；目標站得住 %s' % (tag, tx, tz, pd['from'], pd['n'], J(pd['pts']), pd['standTarget']))
    return {'ok': False, 't': round(time.time() - t0, 1), 'pushes': pushes, 'jumps': jumps, 'end': s, 'log': log, 'why': '%d 秒沒走到' % max_s, 'pathDiag': pd}


async def enter_door(pg, cdp, tag, door, max_s=120):
    """搖桿走到店門（door＝EXITS_JS 的一筆）、按鈕是它就按、等換區域；回傳 D.st 或 None（觸控點地板 D.use_exit 在騎樓柱子旁邊雲端常要 1～3 分鐘，改搖桿）"""
    r = await joy_to(pg, cdp, tag, door['x'], door['z'], near=min(0.9, door['r'] * 0.5), lv=door['lv'], max_s=max_s, btn=door['label'])   # CC-C 11-12：互動鍵出現門的字就算到（乙 5）
    s = await wait_btn(pg, door['label'], 5)
    if not R.check('%s 搖桿走到「%s」，按鈕是它（%s 秒、沒有跳）' % (tag, door['label'], r['t']), s['interact'].startswith(door['label']) and not r['jumps'], J({'end': [s['x'], s['z']], 'btn': s['interact'], 'jumps': r['jumps'], 'why': r.get('why')})): return None
    await L.tap(pg, cdp, '#interact'); await D.wait_zone(pg, cdp, door['to']); await pg.wait_for_timeout(2500); await L.close_panels(pg, cdp); s = await D.st(pg)
    R.check('%s 按「%s」到了 %s、站得住' % (tag, door['label'], door['to']), s['zone'] == door['to'] and s['stand'], J(s))
    return s if s['zone'] == door['to'] else None


async def tap_near(pg, cdp, tag, x, z, near, max_s=180, lv=None):
    """觸控點地板走過去（L.go_to）；走完等人停下來"""
    ok = await L.go_to(pg, cdp, R, x, z, near, tag, max_s=max_s, lv=lv)
    await D.settle(pg); return ok


READY_JS = r"""(()=>{ const f=document.getElementById('fade'); return {fade:!!(f&&f.classList.contains('on')), paused:!!GAME.E.paused, title:!document.getElementById('titleScreen').classList.contains('hide'),
  phone:!!(GAME.phoneIsOpen&&GAME.phoneIsOpen()), dlg:!!(GAME.D&&GAME.D.active), busy:!!GAME.E.player.busy}; })()"""


async def ready(pg, cdp, secs=40):
    """等畫面可以玩：黑幕（#fade.on）退了、沒有暫停（手機、選單自己打開的就像玩家一樣收起來）、沒有對話（點掉）。回傳最後的狀態、做了什麼"""
    did = []; ok_n = 0; q = None
    for _ in range(int(secs * 2)):
        q = await pg.evaluate(READY_JS)
        if q['phone']: did.append('收手機'); await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(700); ok_n = 0; continue
        if q['paused'] and not q['fade']:
            sh = await L.close_panels(pg, cdp)
            if sh: did.append('關 ' + ','.join(sh)); ok_n = 0; continue
        if q['dlg']: did.append('點對話'); await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); ok_n = 0; continue
        if not q['fade'] and not q['paused'] and not q['busy']:
            ok_n += 1
            if ok_n >= 3: return q, did
        else: ok_n = 0
        await pg.wait_for_timeout(500)
    return q, did


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
        if cap and cap not in caps: caps.add(cap); trace.append('旁白：' + cap[:300])
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
    out['label'] = s['interact']; out['talks'] = 0
    for talk in range(3):   # 這次說話沒有選單（例：圖書館讀書區今天第一次遇到＝只點頭，game3d.js doInteract → GM.guardTalk、D127）：像玩家一樣再按一次說話
        s = await wait_btn(pg, out['label'], 4)
        if not s['interact'].startswith(out['label']): out['why'] = '第 %d 次說話前按鈕變成「%s」' % (talk + 1, s['interact']); break
        await L.tap(pg, cdp, '#interact'); out['talks'] += 1; n_opts = len(out['opts'])
        for _ in range(120):
            await pg.wait_for_timeout(600); q = await L.state(pg)
            if q['choices']:
                o = await pe_opts(pg); out['opts'].append([x['t'][:40] for x in o])
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
        if out['offered'] or len(out['opts']) > n_opts: break
        dg = await pg.evaluate("(%s)(%s)" % (TALK_DIAG_JS, J(pid)))
        out['said'].append('【第 %d 次說話沒有選單（%s），等 2 秒再按一次】' % (talk + 1, J(dg))); await pg.wait_for_timeout(2000)
    return out


TALK_DIAG_JS = r"""((pid)=>{ const n=(GAME.npc&&GAME.npc[pid])||(GAME.E.npcs||[]).find(q=>q.charId===pid); const it=GAME.E.nearestInteractable&&GAME.E.nearestInteractable();
  return {talking:!!(n&&n._talking), busyDepth:GAME.D?GAME.D.busyDepth:null, pbusy:!!GAME.E.player.busy, ev:typeof EVENTS!=='undefined'&&EVENTS.running?(EVENTS.running.id||1):null, near:it?(it.label||''):null, nearNpc:!!(it&&it.npc), hour:+(+GAME.G.hour).toFixed(2)}; })"""


async def go_her(pg, cdp, tag, pid):
    """【捷徑】GAME.enter 到她現在在的區域（STORY.whereIs）；回傳這一區有沒有她"""
    w = await pg.evaluate("(%s)(%s)" % (WHO_JS, J([pid])))
    R.note('%s 她（%s）：%s' % (tag, pid, J(w)))
    z = (w[0].get('where') or {}).get('zone') if w else None
    if not R.check('%s %s 現在在遊戲的場景裡（STORY.whereIs）、GIFTH.canGet' % (tag, pid), bool(z) and w[0]['can'], J(w)): return False
    if await pg.evaluate("GAME.G.zone") != z:
        await pg.evaluate("(z=>{ void GAME.enter(z); })(%s)" % J(z))
        await D.wait_zone(pg, cdp, z); await pg.wait_for_timeout(4000); await L.close_panels(pg, cdp)
        R.setup('%s【捷徑】GAME.enter(%s)（她 %s 在那裡；不測走過去的路）' % (tag, z, pid))
    n = None
    for _ in range(10):
        n = await pg.evaluate("(%s)(%s)" % (NPC_JS, J(pid)))
        if n: break
        await pg.wait_for_timeout(1000)
    return R.check('%s 這一區有她（%s）' % (tag, pid), bool(n), J(n))


async def shop_names(pg, cdp, tag, ui=None, gift_opts=None):
    """店名：GIFTH.shopName(店代號)（遊戲現在顯示的）、包包（選單「物品」）每一樣的那一行、送禮選單（「送她禮物…」之後那一層）每一樣的 hint；對 EXPECT_NAME"""
    sn = await pg.evaluate("(k=>typeof GIFTH!=='undefined'?GIFTH.shopName(k):null)(%s)" % J(SHOP_KEY))
    R.note('%s GIFTH.shopName(%s)＝%s（要「%s」）' % (tag, SHOP_KEY, J(sn), EXPECT_NAME))
    R.check('%s GIFTH.shopName(%s)＝「%s」' % (tag, SHOP_KEY, EXPECT_NAME), sn == EXPECT_NAME, J(sn))
    if ui is not None:
        lines = [x for x in ui.split('\n') if '元' in x and '・' in x]
        R.note('%s 包包（選單「物品」）的店名那幾行：%s' % (tag, J(lines)))
        R.check('%s 包包裡每一樣的店名那一行（「店名・價錢 元」）都寫「%s」（這幾支探針的包包裡只有花）' % (tag, EXPECT_NAME), bool(lines) and all(x.startswith(EXPECT_NAME + '・') for x in lines), J(lines))
    if gift_opts is not None:
        R.note('%s 送禮選單（「送她禮物…」之後）：%s' % (tag, J(gift_opts)))
        fl = [t for t in gift_opts if t.startswith('一束花') or t.startswith('一朵向日葵')]
        R.check('%s 送禮選單上花的店名是「%s」' % (tag, EXPECT_NAME), bool(fl) and all(EXPECT_NAME in t for t in fl), J(gift_opts))
    return sn


def gift_menu(g):
    """F.give 的 opts 裡「送她禮物…」之後那一層（品名＋店名 hint）"""
    for o in g.get('opts') or []:
        if any(t.startswith('一束花') or t.startswith('一朵向日葵') for t in o): return o
    return None


async def shot(pg, cdp, name, cam=None):
    """有 cam＝D.user_shot（1280×720、藏 HUD 和玩家、指定鏡頭，page.screenshot 算亮度）之後換回 844×390；沒有＝目前畫面"""
    if cam:
        c = await D.user_shot(pg, cdp, name, cam)
        await pg.set_viewport_size({'width': 844, 'height': 390}); await pg.wait_for_timeout(800)
        return c
    return await D.shot(pg, name, judge_black=False)


# ---------------------------------------------------------------- CC-C 11-12：花序接 AA_792（fb55a19173）——稿、頁面上的資料、對話、「看」
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..', '..'))
DOC792_SHA = '8475a3b85'
DOC792 = 'docs/story_planning/AA_792_flower_notes.json'


def doc792():
    """AA_792 稿（企劃線 8475a3b85；fb55a19173 的 src/data/flower_notes_text.js、gift_holiday.js 就是從它匯入的）。
    依序試：FN_DOC792（json 檔路徑）→ 這支探針所在的 repo、目前目錄的 git show。讀不到回 (None, 原因)——探針改比頁面上的資料，log 寫明（CC_02 乙 7）"""
    p = os.environ.get('FN_DOC792')
    if p and os.path.exists(p):
        try: return json.load(open(p, encoding='utf-8')), 'FN_DOC792=' + p
        except Exception as e: return None, 'FN_DOC792 讀不懂：%r' % e
    why = []
    for root in (REPO, os.getcwd()):
        try:
            b = subprocess.check_output(['git', '-C', root, 'show', DOC792_SHA + ':' + DOC792], stderr=subprocess.STDOUT, timeout=30)
            return json.loads(b.decode('utf-8')), 'git show %s:%s（%s）' % (DOC792_SHA, DOC792, root)
        except Exception as e:
            why.append('%s：%s' % (root, (getattr(e, 'output', b'') or b'').decode('utf-8', 'replace').strip()[-120:] or repr(e)[:120]))
    return None, '；'.join(why)


FN_DATA_JS = r"""(()=>{ const T=typeof FLOWER_NOTES_TEXT!=='undefined'?FLOWER_NOTES_TEXT:null, X=typeof GIFT_HOLIDAY!=='undefined'?GIFT_HOLIDAY:null, sh=X&&X.shops&&X.shops.gg_flower;
  const its=(GAME.E.interactables||[]).filter(i=>i.fnLook).map(i=>({kind:i.fnLook,label:i.label||'',x:+i.x.toFixed(2),z:+i.z.toFixed(2),lv:i.lv|0,r:i.radius||1,look:i.look||'',hidden:!!i.hidden}));
  return {text:T?{src:T.src||null,staff:T.staff,looks:T.looks}:null, shop:sh?{name:sh.name,items:sh.items.slice()}:null,
    items:sh?Object.fromEntries(sh.items.map(g=>[g,{name:X.items[g].name,price:X.items[g].price,shop:X.items[g].shop}])):null,
    hours:typeof FNS!=='undefined'&&FNS.hours?FNS.hours():null, place:typeof PLACES!=='undefined'&&PLACES.hours?(PLACES.hours.flower_notes||null):null,
    xs:typeof XSCLOSE!=='undefined'&&XSCLOSE.ZONES&&XSCLOSE.ZONES.flower_notes?Object.assign({line:XSCLOSE.LINE},XSCLOSE.ZONES.flower_notes):null,
    fns:typeof FNS!=='undefined', gg:typeof FN3!=='undefined'&&FN3.GG?Object.assign({},FN3.GG):null, zone:GAME.G.zone, lookIts:GAME.G.zone==='flower_notes'?its:null,
    lookLabels:GAME.G.zone==='flower_notes'?(GAME.E.interactables||[]).filter(i=>/^看/.test(i.label||'')).map(i=>i.label):null}; })()"""


async def fn_data(pg):
    return await pg.evaluate(FN_DATA_JS)


def _hours_of(s):
    m = re.match(r'^(\d\d):(\d\d)～(\d\d):(\d\d)$', s or '')
    return [int(m.group(1)) + int(m.group(2)) / 60.0, int(m.group(3)) + int(m.group(4)) / 60.0] if m else None


async def fn_expect(pg, tag):
    """期望值：有 AA_792 稿就用稿（十樣 id／名字／價錢、花藝師 who／greet／buy／closed／hours、13 區的 looks），並檢查頁面上的資料＝稿；
    讀不到稿＝用頁面上的資料（FLOWER_NOTES_TEXT、GIFT_HOLIDAY），R.note 寫「讀不到稿，改比頁面」。回傳 dict（src＝'doc'／'page'）"""
    pd = await fn_data(pg); d, how = doc792()
    if d:
        R.note('%s 期望值：AA_792 稿（%s）' % (tag, how))
        st = d.get('staff') or {}; it = d.get('items') or {}; ids = (d.get('shop') or {}).get('items') or []
        ex = {'src': 'doc', 'ids': ids, 'items': {g: {'name': (it.get(g) or {}).get('name'), 'price': (it.get(g) or {}).get('price'), 'shop': (it.get(g) or {}).get('shop')} for g in ids},
              'who': st.get('who'), 'greet': st.get('greet') or [], 'buy': st.get('buy') or {}, 'closed': st.get('closed'), 'hours': _hours_of(st.get('hours')), 'hours_s': st.get('hours'),
              'looks': d.get('looks') or {}, 'shop_name': (d.get('shop') or {}).get('name')}
        pt = pd.get('text') or {}; ps = pt.get('staff') or {}
        R.check('%s 頁面上的資料＝AA_792 稿：十樣 id 和順序、名字、價錢、shop' % tag, (pd.get('shop') or {}).get('items') == ids and all((pd.get('items') or {}).get(g) == ex['items'][g] for g in ids),
                J({'page': pd.get('items'), 'doc': ex['items']})[:600])
        R.check('%s 頁面上的資料＝AA_792 稿：花藝師 who、greet、buy、closed、hours' % tag, ps.get('who') == ex['who'] and ps.get('greet') == ex['greet'] and ps.get('buy') == ex['buy'] and ps.get('closed') == ex['closed'] and ps.get('hours') == ex['hours_s'], J(ps)[:600])
        R.check('%s 頁面上的資料＝AA_792 稿：13 區的「看」' % tag, pt.get('looks') == ex['looks'] and len(ex['looks']) == 13, '稿 %d 句、頁面 %d 句' % (len(ex['looks']), len(pt.get('looks') or {})))
    else:
        R.note('%s ★讀不到 AA_792 稿（%s）——期望值改用頁面上的資料（FLOWER_NOTES_TEXT、GIFT_HOLIDAY）' % (tag, how))
        pt = pd.get('text') or {}; st = pt.get('staff') or {}; ids = (pd.get('shop') or {}).get('items') or []
        ex = {'src': 'page', 'ids': ids, 'items': pd.get('items') or {}, 'who': st.get('who'), 'greet': st.get('greet') or [], 'buy': st.get('buy') or {}, 'closed': st.get('closed'),
              'hours': _hours_of(st.get('hours')), 'hours_s': st.get('hours'), 'looks': pt.get('looks') or {}, 'shop_name': (pd.get('shop') or {}).get('name')}
    ex['page'] = pd
    return ex


DLG_JS = r"""(()=>{ const D=GAME.D, n=document.getElementById('dlgName'), t=document.getElementById('dlgText'); const on=!!(D&&D.active);
  const who=(n&&n.style.display!=='none'&&getComputedStyle(n).display!=='none')?(n.textContent||'').trim():''; return {on, who, t:on?String(D.full!=null?D.full:((t&&t.textContent)||'')).trim():''}; })()"""


async def dlg(pg):
    """對話框現在這一句：說話的人（#dlgName，沒顯示＝旁白 ''）、整句（GAME.D.full，打字效果還沒打完也是整句）"""
    return await pg.evaluate(DLG_JS)


async def lines_until_idle(pg, cdp, secs=30, pick=None):
    """點完對話，逐句記 {who, t}；出現選單：pick(選項文字清單) 回傳要選第幾個（None＝停下來回傳）。回傳 (lines, 停下來時的選項 or None)"""
    out = []
    for _ in range(int(secs * 2)):
        q = await L.state(pg)
        if q['choices']:
            o = await pe_opts(pg); k = pick([x['t'] for x in o]) if pick else None
            if k is None: return out, o
            out.append({'who': '【選】', 't': o[k]['t'][:40]}); await pg.wait_for_timeout(600); await choose_k(pg, cdp, k); continue   # ?tapguard：選單出現 350 ms 內不收（game3d.js TAP_GUARD）
        if q['dlg']:
            d = await dlg(pg)
            if not out or out[-1] != {'who': d['who'], 't': d['t']}: out.append({'who': d['who'], 't': d['t']})
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
        if not q['busy']: return out, None
        await pg.wait_for_timeout(500)
    return out, None


BTN_TOP_JS = r"""(()=>{ const e=document.getElementById('interact'); if(!e||e.classList.contains('hide')) return {ok:false,why:'沒有互動鍵'}; const r=e.getBoundingClientRect(); if(!r.width) return {ok:false,why:'互動鍵大小 0'};
  const h=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2); return {ok:!!h&&(h===e||e.contains(h)), top:h?(h.id||h.tagName)+(h.className&&typeof h.className==='string'?'.'+h.className.split(' ')[0]:''):null, t:(e.textContent||'').trim()}; })()"""


async def cur_btn(pg):
    """互動鍵的中心，最上層是不是它自己（CC_02 乙 4：點之前確認沒被蓋住）"""
    return await pg.evaluate(BTN_TOP_JS)


LOOK_CELLS_JS = r"""((q)=>{ const E=GAME.E; const its=(E.interactables||[]).filter(i=>!i.hidden&&((i.lv|0)===q.lv)); const me=its.find(i=>i.fnLook===q.kind&&Math.abs(i.x-q.x)<1e-3&&Math.abs(i.z-q.z)<1e-3);
  if(!me) return {cells:[],why:'找不到這個互動點'}; const out=[]; let nStand=0, nNear=0;
  for(let x=me.x-me.radius;x<=me.x+me.radius+1e-6;x+=0.1) for(let z=me.z-me.radius;z<=me.z+me.radius+1e-6;z+=0.1){ const d=Math.hypot(x-me.x,z-me.z); if(d>me.radius-0.12) continue;
    if(!E.canStand(x,z,0.3,q.lv)) continue; nStand++; const oth=its.filter(i=>i!==me&&Math.hypot(i.x-x,i.z-z)<=(i.radius||1)+0.05).map(i=>Math.hypot(i.x-x,i.z-z)); const m2=oth.length?Math.min(...oth):9;
    if(m2<=d+0.25) continue; nNear++; out.push({x:+x.toFixed(2),z:+z.toFixed(2),d:+d.toFixed(2),gap:+(m2-d).toFixed(2)}); }
  out.sort((a,b)=>(b.gap-a.gap)||(a.d-b.d)); return {cells:out.slice(0,q.n||6),nStand,nNear,why:out.length?'':(nStand?'站得住的 '+nStand+' 格都離別的互動點一樣近（差不到 0.25 m）':'範圍裡沒有站得住的格子')}; })"""


async def look_cells(pg, p, n=6):
    """站在哪裡互動鍵會是這一個「看」：範圍裡站得住（canStand r0.3）、而且離它比離其他互動點近 0.25 m 以上的格子（0.1 m 一格），差距大的排前面。
    （幾何挑點，不靠遊戲的 nearestInteractable；按了以後照旁白的字判斷是不是它——CC_02 乙 4「判準不能依賴被測的程式自己的結果」）"""
    return await pg.evaluate("(%s)(%s)" % (LOOK_CELLS_JS, J({'kind': p['kind'], 'x': p['x'], 'z': p['z'], 'lv': p['lv'], 'n': n})))


async def walk_seg(pg, cdp, tag, x, z, near, lv=None, max_s=300):
    """觸控點地板走（L.go_to），途中出現對話／選單就停下來（stop），逐句記下、照字處理（選「算了／先不用／離開」那一類，沒有就停下來回報），再接著走（CC_02 乙 13）。
    回傳 {ok, events:[...], path:'觸控點地板'}"""
    t0 = time.time(); evs = []
    while time.time() - t0 < max_s:
        ok = await L.go_to(pg, cdp, R, x, z, near, tag, max_s=max(30, max_s - (time.time() - t0)), lv=lv, stop=lambda s: bool(s['dlg'] or s['choices']))
        s = await D.st(pg)
        if not (s['dlg'] or s['choices']):
            await D.settle(pg); s = await D.st(pg)
            return {'ok': bool(ok) and math.hypot(s['x'] - x, s['z'] - z) <= near + 0.6, 'events': evs, 'path': '觸控點地板', 'end': s}
        lines, stuck = await lines_until_idle(pg, cdp, 40, pick=lambda ts: next((i for i, t in enumerate(ts) if any(w in t for w in ('算了', '先不用', '離開', '下次', '不用了', '先這樣'))), None))
        evs.append({'lines': lines, 'stuck': [o['t'] for o in stuck] if stuck else None})
        R.note('%s 走路途中出現劇情／選單（停下來處理）：%s' % (tag, J(evs[-1])))
        if stuck: return {'ok': False, 'events': evs, 'path': '觸控點地板', 'why': '途中有不認識的選單', 'end': s}
    return {'ok': False, 'events': evs, 'path': '觸控點地板', 'why': '%d 秒沒走到' % max_s, 'end': await D.st(pg)}
