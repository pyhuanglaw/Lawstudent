"""CC（帳號 A）11-04：WZ2 v3——溫州街第二批五間外觀（BB 06:24；LAWWW2 7cbbecbb1 櫥窗重做 → 開發分支 7fbf558c9）。五間都不能進去。
  前一版（對照）＝10b6ebbf8（整合 WZ2 v3 之前最後一個開發分支 commit；7fbf558c9 是唯一一個接 WZ2 的 commit，只動 wenzhou_street.glb／.json／.props.json＋singleside_streets_unit.js）。
  座標（7fbf558c9）：
    A3 溫州書屋（舊名巷口書房）  x 8.4～20、立面 z 5（A 側朝 −z）           src/zones3d.js:974；門口「看書店的櫥窗」(14.2,3.8) src/zones3d.js:1097
    B5 帝大紅茶（舊名巷口茶飲）  x 16～23、騎樓深 3 m、店面牆 z −8         src/zones3d.js:970,982,1102；窗口 (17.4,−7.35) src/wzshops3d.js:97
    B5i 夏日冰菓室              x 23～30、店面牆 z −8                      窗口 (24.4,−7.4)、看鐵捲門 (26.5,−7.4) src/wzshops3d.js:97；季節節點 SEASON_ICECLOSED_on_B5i* src/zones3d.js:1375-1377
    B6 阿忠鮮果（舊名阿忠水果）  x 30～40、立面 z −5（B 側朝 +z）           src/zones3d.js:983；買 (35.3,−3.9)、看 (33.6,−3.9) src/wzshops3d.js:147
    B2 常在洗衣（舊名自助洗衣）  x −21～−15、立面 z −5                      src/zones3d.js:979；看 (−18.6,−3.8)、布告欄 (−16.65,−3.8) src/wzshops3d.js:155
    第一批：A4 林家乾麵 x 32～40（進去 (35,4.6) src/data/wz_shops_layout.js:171）、B7 SUNNY SIDE（半熟）x 40～48（(42,−4.6) :21）、
            B3 小路（巷子裡定食）x −9.6～4（(−4.8,−4.6) :210）、A1 阿德影印 x −12～−4（(−8,4.6) :65）
    正式模型節點 wenzhou_street_glb（src/zones3d.js:1143）；LAWWW2 README docs/art-rebuild/second_ai/wip/wz_second_1104/README.md@7cbbecbb1。
  CASES=shots,door（預設兩段都跑）：
    shots：【前置／捷徑】讀檔到溫州街（條件事件關閉，DATEKEY 預設 2025-09-23（二））→ 等正式模型 → 鏡頭用 cinematic 擺好、HUD 和玩家藏起來（路人預設也藏，HIDE_NPC=0 不藏）
      ① 五間門口（從對面人行道看）HOURS（預設 14,21）各一張 wz2_<店>_door_<day|night>.png
      ② 五間櫥窗近景：離店面 1.5 m、高 1.5 m，日夜各一張 wz2_<店>_win_<day|night>.png
      ③ 常在洗衣晚上：店面前面那一塊的材質（emissive×emissiveIntensity）、光暈、截圖亮度（白天對照）
      ④ 夏日冰菓室：ICE_OFF（預設 2025-12-10）14:00 鐵捲門要拉下（SEASON_ICECLOSED_on_B5i* visible）、窗口按鈕換成「看夏日冰菓室」；ICE_ON（預設 2026-07-15）14:00 對照
         wz2_B5i_door_dec.png／wz2_B5i_door_jul.png、wz2_B5i_win_dec.png／wz2_B5i_win_jul.png
      ⑤ 第一批四間招牌＋雨遮，白天各一張 wz1_<店>_sign.png
      店名文字（互動 label、look、PLACES.names）印 INFO，這一版還是舊名，不算 FAIL。數值寫進 wz2_shots.json。
      截圖亮度：截圖 PNG 交給頁面自己解碼（canvas getImageData）算平均亮度；這台 PC 沒有 PIL，這支不 import PIL。
    door：五間都進不去。每間門口 2 m 內：沒有 label 以「進入」「進去」開頭的互動點、沒有 exit 型互動點；門口那一格 E.nav.free 而且 E.canStand(0.3)；
      【前置／捷徑】讀檔到門口正前方的街上（14:00）→ L.go_to 真的走到門口 → 卡住檢查（對話關、busyDepth 0、搖桿 ≥0.3 m、walkFallbacks 沒增加、沒有新的 JS 例外）。
  只有載入失敗、正式模型沒出現、冰菓室季節不對、door 段的檢查、JS 例外算 FAIL；畫面好不好看由 BB 判。
用法：LW_TESTS=<wt>/tests [CASES=shots,door] [ONLY=A3,B2] [HOURS=14,21] [DATEKEY=2025-09-23] python3 cc_wz2_probe.py <url> <out>"""
import os, sys, json, asyncio, time, math, base64
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
CASES = [c.strip() for c in (os.environ.get('CASES') or 'shots,door').split(',') if c.strip()]
ONLY = [x.strip() for x in (os.environ.get('ONLY') or '').split(',') if x.strip()]
HIDE_NPC = os.environ.get('HIDE_NPC', '1') != '0'
DATEKEY = (os.environ.get('DATEKEY') or '2025-09-23').strip()
ICE_OFF = (os.environ.get('ICE_OFF') or '2025-12-10').strip()
ICE_ON = (os.environ.get('ICE_ON') or '2026-07-15').strip()
GLB = 'wenzhou_street_glb'
FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True}
# code: (新店名, 舊店名, 側, x0, x1, 店面 z（玻璃／店面牆的那一面）, 往街的方向 dz, 門口 (x,z), 櫥窗中心 x)
SHOPS = {
    'A3':  ('溫州書屋', '巷口書房', 'A', 8.4, 20.0, 5.0, -1, (14.2, 3.8), 14.2),
    'B5':  ('帝大紅茶', '巷口茶飲', 'B', 16.0, 23.0, -8.0, 1, (17.4, -7.35), 17.4),
    'B5i': ('夏日冰菓室', '夏日冰菓室', 'B', 23.0, 30.0, -8.0, 1, (24.4, -7.4), 24.4),
    'B6':  ('阿忠鮮果', '阿忠水果', 'B', 30.0, 40.0, -5.0, 1, (35.3, -3.9), 35.0),
    'B2':  ('常在洗衣', '自助洗衣', 'B', -21.0, -15.0, -5.0, 1, (-18.6, -3.8), -18.0),
}
SEL = [k for k in SHOPS if not ONLY or k in ONLY]
# 第一批：key: (店名, 側, 中心 x, 立面 z)
WZ1 = {'lin': ('林家乾麵', 'A', 36.0, 5.0), 'sunny': ('SUNNY SIDE（半熟）', 'B', 44.0, -5.0),
       'xiaolu': ('小路（巷子裡定食）', 'B', -2.8, -5.0), 'ade': ('阿德影印輸出', 'A', -8.0, 5.0)}
ACROSS = 3.0      # 門口照：鏡頭在對面人行道（A 側的店 → z −3；B 側 → z +3）
OLD_NAMES = ['巷口書房', '巷口茶飲', '阿忠水果', '自助洗衣']
NEW_NAMES = ['溫州書屋', '帝大紅茶', '阿忠鮮果', '常在洗衣', '夏日冰菓室']
FAILS = []
RES = {'sha': os.environ.get('SHA'), 'datekey': DATEKEY, 'hide_npc': HIDE_NPC, 'shots': {}, 'laundry': {}, 'ice': {}, 'wz1': {}, 'names': {}, 'door': {}}


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)
    return ok


def info(name, txt):
    print('INFO ' + name + '  ' + txt, flush=True)


class Run:   # playlib.go_to 要的最小介面
    def note(self, s): print('  ' + s, flush=True)
    def check(self, n, ok, info=''): return check(n, ok, info)


GLBREADY = "(()=>{ const z=GAME.E.zone; if(!z||!z.group) return false; const g=z.group.children.find(o=>o.name==='%s'); if(!g) return false; let m=0; g.traverse(o=>{ if(o.isMesh) m++; }); return m>0; })()" % GLB
AIM = """(async([e,l,hn])=>{ const E=GAME.E; if(E.player&&E.player.obj) E.player.obj.visible=false;
  if(hn){ window.__ccHid=window.__ccHid||[]; for(const n of (E.npcs||[])) if(n.obj&&n.obj.parent){ window.__ccHid.push([n.obj,n.obj.parent]); n.obj.parent.remove(n.obj); } }   /* 路人：從場景拿掉（LOD 每格會重設 visible，和 cc_gg_perf_probe 的 DRAW 同一種做法）*/
  E.cinematic(new THREE.Vector3(...e),new THREE.Vector3(...l)); E.camera.position.set(...e); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look);
  const f0=E.frame; for(let i=0;i<240&&E.frame<f0+6;i++) await new Promise(r=>setTimeout(r,250)); return true; })"""
UNAIM = """(()=>{ const E=GAME.E; if(E.player&&E.player.obj) E.player.obj.visible=true; for(const a of (window.__ccHid||[])) if(!a[0].parent) a[1].add(a[0]); window.__ccHid=[]; E.endCinematic&&E.endCinematic(); })()"""
HUD = """(on=>{ const c=GAME.E.renderer.domElement; const keep=new Set(); for(let n=c;n;n=n.parentElement) keep.add(n);
  document.querySelectorAll('body *').forEach(el=>{ if(keep.has(el)||c.contains(el)) return; if(el.parentElement&&keep.has(el.parentElement)){ if(on){ if(el.dataset.ccVis!==undefined){ el.style.visibility=el.dataset.ccVis; delete el.dataset.ccVis; } } else { el.dataset.ccVis=el.style.visibility||''; el.style.visibility='hidden'; } } }); })"""
# 世界座標的長方形（x0..x1、y0..y1、z）投影到螢幕（CSS 像素）；z 在鏡頭後面（v.z≥1）的點標出來
PROJ = """(([x0,x1,y0,y1,zz])=>{ const E=GAME.E; E.camera.updateMatrixWorld(); return [[x0,y0],[x1,y0],[x1,y1],[x0,y1]].map(([x,y])=>{ const v=new THREE.Vector3(x,y,zz).project(E.camera); return [+((v.x+1)/2*innerWidth).toFixed(1),+((1-v.y)/2*innerHeight).toFixed(1),+v.z.toFixed(4)]; }); })"""
# 截圖（PNG base64）在頁面裡解碼，量一塊的平均亮度（Rec.601）；不用 PIL
LUMA = """(async([b64,quad])=>{ if(quad.some(p=>p[2]>=1)) return null; const im=new Image(); im.src='data:image/png;base64,'+b64; await im.decode();
  const W=im.naturalWidth, H=im.naturalHeight, sx=W/innerWidth, sy=H/innerHeight; let x0=Math.max(0,Math.min(...quad.map(p=>p[0]))*sx), x1=Math.min(W,Math.max(...quad.map(p=>p[0]))*sx);
  let y0=Math.max(0,Math.min(...quad.map(p=>p[1]))*sy), y1=Math.min(H,Math.max(...quad.map(p=>p[1]))*sy); const dx=(x1-x0)*0.1, dy=(y1-y0)*0.1; x0=Math.round(x0+dx); x1=Math.round(x1-dx); y0=Math.round(y0+dy); y1=Math.round(y1-dy);
  if(x1-x0<4||y1-y0<4) return null; const c=document.createElement('canvas'); c.width=x1-x0; c.height=y1-y0; const cx=c.getContext('2d'); cx.drawImage(im,x0,y0,x1-x0,y1-y0,0,0,x1-x0,y1-y0);
  const d=cx.getImageData(0,0,c.width,c.height).data; let s=0; for(let i=0;i<d.length;i+=4) s+=0.299*d[i]+0.587*d[i+1]+0.114*d[i+2]; return +(s/(d.length/4)).toFixed(1); })"""
# 店面前面那一塊（x0..x1、y、z 範圍）裡有頂點的網格，照材質分：頂點數、emissive、emissiveIntensity、map／emissiveMap；光暈合成網格裡落在這一塊的光暈（白天、晚上值）
LIT_JS = """(([x0,x1,y0,y1,z0,z1])=>{ const E=GAME.E, g=E.zone&&E.zone.group; if(!g) return null; const root=g.children.find(o=>o.name==='%s'); if(!root) return null; root.updateMatrixWorld(true);
  const v=new THREE.Vector3(), mats={}; const inB=p=>p.x>=x0&&p.x<=x1&&p.y>=y0&&p.y<=y1&&p.z>=z0&&p.z<=z1;
  root.traverse(o=>{ if(!o.isMesh||!o.geometry||!o.geometry.attributes.position) return; const pa=o.geometry.attributes.position; let n=0; for(let i=0;i<pa.count;i++){ v.fromBufferAttribute(pa,i).applyMatrix4(o.matrixWorld); if(inB(v)) n++; } if(!n) return;
    const ms=Array.isArray(o.material)?o.material:[o.material]; for(const mt of ms){ if(!mt) continue; const k=mt.name||'(無名)'; const r=mats[k]||(mats[k]={verts:0,meshes:[]}); r.verts+=n; if(r.meshes.indexOf(o.name)<0&&r.meshes.length<4) r.meshes.push(o.name);
      r.color=mt.color?'#'+mt.color.getHexString():null; r.emissive=mt.emissive?'#'+mt.emissive.getHexString():null; r.emissiveIntensity=+(mt.emissiveIntensity||0).toFixed(3); r.emissiveMap=!!mt.emissiveMap; r.map=!!mt.map; r.vcol=!!mt.vertexColors; r.visible=o.visible;
      r.lum=mt.emissive?+((0.2126*mt.emissive.r+0.7152*mt.emissive.g+0.0722*mt.emissive.b)*(mt.emissiveIntensity||0)).toFixed(3):0; } });
  const glows=[]; g.traverse(o=>{ const gb=o.userData&&o.userData.glowBatch; if(!gb||!gb.items) return; for(const it of gb.items) if(inB({x:it.x,y:it.y,z:it.z})) glows.push(Object.assign({batch:o.name,visible:o.visible},it)); });
  return {mats, glows}; })""" % GLB
ICE_JS = """(()=>{ const E=GAME.E, g=E.zone&&E.zone.group; const root=g&&g.children.find(o=>o.name==='%s'); const out={nodes:[], items:[]};
  if(root) root.traverse(o=>{ if(/^SEASON_ICECLOSED/.test(o.name||'')){ let shown=true; for(let p=o;p&&p!==root;p=p.parent) if(!p.visible){ shown=false; break; } out.nodes.push({n:o.name,visible:o.visible,shown}); } });
  for(const it of E.interactables) if(Math.abs(it.z+7.4)<1.2&&it.x>22&&it.x<30) out.items.push({label:it.label,x:+it.x.toFixed(2),z:+it.z.toFixed(2),hidden:!!it.hidden});
  let m=null; try{ m=CALENDAR.dateOf(GAME.G.day); }catch(e){} out.date=m&&m.key; out.month=m&&m.m; try{ out.inSeason=!!WZS.inSeason('ice',GAME.G); }catch(e){ out.inSeason=null; } return out; })()""" % GLB
DAYOF = "(k=>{ try{ const d=STORY.dayOfKey(k); if(d==null) return null; const c=CALENDAR.dateOf(d); return {day:d, wd:c.wd, key:c.key}; }catch(e){ return null; } })(%s)"
NAMES_JS = """(([pts,olds,news])=>{ const E=GAME.E; const near=[]; for(const it of E.interactables){ const p=pts.find(q=>Math.hypot(it.x-q[1],it.z-q[2])<3); if(!p) continue;
    let lab=''; try{ lab=String(it.label||''); }catch(e){} near.push({shop:p[0],label:lab,look:typeof it.look==='string'?it.look.slice(0,80):null,hidden:!!it.hidden}); }
  const pl=typeof PLACES!=='undefined'&&PLACES.names?PLACES.names:{}; const plHits={}; for(const k in pl){ const v=String(pl[k]); if(olds.concat(news).some(n=>v.indexOf(n)>=0)) plHits[k]=v; }
  return {near, places:plHits}; })(%s)"""
ST = """(()=>{ const G=GAME.G, E=GAME.E, P=E.player, p=P.obj.position, D=GAME.D||{}; const it=document.getElementById('interact');
  return {zone:G.zone, hour:+(+G.hour).toFixed(3), x:+p.x.toFixed(2), z:+p.z.toFixed(2), dlg:!!D.active, depth:D.busyDepth|0, busy:!!P.busy,
    name:((document.getElementById('dlgName')||{}).textContent||'').trim(), text:String(D.full||((document.getElementById('dlgText')||{}).textContent)||'').slice(0,120),
    choices:[...document.querySelectorAll('#choices:not(.hide) button')].map(b=>(b.textContent||'').trim()),
    interact:(it&&!it.classList.contains('hide')&&getComputedStyle(it).display!=='none')?(it.textContent||'').trim():'', fb:GAME.walkFallbacks||0}; })()"""
DOOR_JS = """(([x,z])=>{ const E=GAME.E; const its=[]; for(const it of E.interactables){ const d=Math.hypot(it.x-x,it.z-z); if(d>2.0) continue; let lab=''; try{ lab=String(it.label||''); }catch(e){}
    its.push({label:lab,d:+d.toFixed(2),x:+it.x.toFixed(2),z:+it.z.toFixed(2),exit:it.exit?(it.exit.to||true):(it.enter?('enter:'+(it.enter.to||it.enter)):null),hidden:!!it.hidden}); }
  const nav=E.nav; return {items:its, free:nav&&nav.free?!!nav.free(x,z):null, stand:E.canStand?!!E.canStand(x,z,0.3,0):null}; })(%s)"""
NEAREST = """(([x,z])=>{ const E=GAME.E; for(let r=0;r<=3.01;r+=0.25) for(let k=0;k<16;k++){ const a=k/16*Math.PI*2, px=x+Math.sin(a)*r, pz=z+Math.cos(a)*r; if(E.canStand(px,pz,0.35,0)) return [+px.toFixed(2),+pz.toFixed(2)]; } return null; })(%s)"""


async def load_wz(pg, hour, x, z, yaw, datekey, tag):
    dn = await pg.evaluate(DAYOF % J(datekey))
    st = {'zone': 'wenzhou', 'hour': hour, 'weather': 'clear', 'flags': FLAGS, 'money': 3000, 'pos': {'x': x, 'z': z, 'yaw': yaw, 'lv': 0}}
    if dn: st['day'] = dn['day']; st['weekday'] = dn['wd']
    print('  [前置／捷徑] 讀檔到溫州街 (%.2f, %.2f)、%s（day %s）%s 時、晴天、條件事件關閉［%s］' % (x, z, datekey, dn and dn['day'], hour, tag), flush=True)
    check('[%s] 日期 %s 換得到遊戲的 day' % (tag, datekey), bool(dn), J(dn))
    t1 = time.time()
    await L.load_state(pg, st, quiet_events=True)
    t_glb = None
    for _ in range(480):
        if await pg.evaluate(GLBREADY): t_glb = round(time.time() - t1, 2); break
        await pg.wait_for_timeout(250)
    check('[%s] 正式模型 %s 有載入' % (tag, GLB), t_glb is not None, '讀檔後 %s 秒' % t_glb)
    await pg.wait_for_timeout(3000)
    return t_glb


async def shoot(pg, fn, eye, look, rect):
    await pg.evaluate(AIM + '(%s)' % J([eye, look, HIDE_NPC]))
    await pg.wait_for_timeout(600)
    png = await pg.screenshot(path=os.path.join(OUT, fn))
    quad = await pg.evaluate(PROJ + '(%s)' % J(rect))
    try:
        luma = await pg.evaluate(LUMA + '(%s)' % J([base64.b64encode(png).decode('ascii'), quad]))
    except Exception as e:
        luma = None; print('  亮度量不出來：%s' % str(e)[:120], flush=True)
    rec = {'file': fn, 'eye': eye, 'look': look, 'rect': rect, 'screen': quad, 'luma': luma}
    print('  截圖 %s：鏡頭 %s → %s；店面那一塊平均亮度 %s' % (fn, J(eye), J(look), luma), flush=True)
    return rec


def door_view(code):
    nm, old, side, x0, x1, fz, dz, door, wx = SHOPS[code]
    cx = round((x0 + x1) / 2, 2); ez = ACROSS if side == 'B' else -ACROSS
    return [cx, 1.7, ez], [cx, 2.2, fz], [x0, x1, 0.3, 3.0, fz]


def win_view(code):
    nm, old, side, x0, x1, fz, dz, door, wx = SHOPS[code]
    ez = round(fz + dz * 1.5, 2)
    return [wx, 1.5, ez], [wx, 1.4, fz], [round(wx - 1.2, 2), round(wx + 1.2, 2), 0.5, 2.4, fz]


async def case_shots(pg, errs):
    print('== shots', flush=True)
    hrs = [float(x) for x in (os.environ.get('HOURS') or '14,21').split(',')]
    whens = [('day', hrs[0])] + ([('night', hrs[1])] if len(hrs) > 1 else [])
    for when, hour in whens:
        tag = 'shots_' + when
        await load_wz(pg, hour, 10.0, 0.0, math.pi / 2, DATEKEY, tag)
        await pg.evaluate(HUD + '(false)')
        for code in SEL:
            nm = SHOPS[code][0]
            e, l, r = door_view(code)
            RES['shots']['%s_door_%s' % (code, when)] = dict(await shoot(pg, 'wz2_%s_door_%s.png' % (code, when), e, l, r), shop=nm, hour=hour)
            e, l, r = win_view(code)
            RES['shots']['%s_win_%s' % (code, when)] = dict(await shoot(pg, 'wz2_%s_win_%s.png' % (code, when), e, l, r), shop=nm, hour=hour)
        if 'B2' in SEL:
            x0, x1 = SHOPS['B2'][3], SHOPS['B2'][4]
            lit = await pg.evaluate(LIT_JS + '(%s)' % J([x0, x1, 0.0, 4.5, -6.6, -4.4]))
            RES['laundry'][when] = lit
            top = sorted(((k, v) for k, v in ((lit or {}).get('mats') or {}).items()), key=lambda kv: -kv[1].get('lum', 0))[:6]
            info('常在洗衣 %s（%s 時）店面那一塊的材質' % (when, hour), J([{k: {q: v.get(q) for q in ('verts', 'emissive', 'emissiveIntensity', 'lum', 'emissiveMap', 'vcol')}} for k, v in top]))
            info('常在洗衣 %s 光暈' % when, J([{q: g.get(q) for q in ('x', 'y', 'z', 'day', 'night', 'visible')} for g in ((lit or {}).get('glows') or [])][:8]))
        if when == 'day':
            for k, (nm, side, cx, fz) in WZ1.items():
                ez = ACROSS if side == 'B' else -ACROSS
                RES['wz1'][k] = dict(await shoot(pg, 'wz1_%s_sign.png' % k, [cx, 1.7, ez], [cx, 3.0, fz], [cx - 3.5, cx + 3.5, 2.2, 3.8, fz]), shop=nm, hour=hour)
        await pg.evaluate(HUD + '(true)')
        await pg.evaluate(UNAIM)
        if when == 'day':
            pts = [[c, SHOPS[c][7][0], SHOPS[c][7][1]] for c in SEL]
            nms = await pg.evaluate(NAMES_JS % J([pts, OLD_NAMES, NEW_NAMES]))
            RES['names'] = nms
            for it in (nms or {}).get('near') or []:
                txt = it['label'] + ' ' + (it.get('look') or '')
                old = [n for n in OLD_NAMES if n in txt]; new = [n for n in NEW_NAMES if n in txt]
                info('店名文字 %s' % it['shop'], '「%s」%s%s%s' % (it['label'], ('look：' + it['look']) if it.get('look') else '', '（舊名 %s）' % '、'.join(old) if old else '', '（新名 %s）' % '、'.join(new) if new else ''))
            info('店名文字 PLACES.names', J((nms or {}).get('places')))
    # 常在洗衣晚上有沒有亮（INFO；判定 BB）
    if 'B2' in SEL and RES['laundry'].get('day') and RES['laundry'].get('night'):
        dm, nm_ = RES['laundry']['day'].get('mats') or {}, RES['laundry']['night'].get('mats') or {}
        lumd = max([v.get('lum', 0) for v in dm.values()] + [0]); lumn = max([v.get('lum', 0) for v in nm_.values()] + [0])
        sd = (RES['shots'].get('B2_win_day') or {}).get('luma'); sn = (RES['shots'].get('B2_win_night') or {}).get('luma')
        RES['laundry']['summary'] = {'max_emissive_lum_day': lumd, 'max_emissive_lum_night': lumn, 'win_luma_day': sd, 'win_luma_night': sn}
        info('常在洗衣晚上有沒有亮', '店面那一塊最亮的材質 emissive×強度：白天 %s → 晚上 %s；櫥窗截圖亮度：白天 %s → 晚上 %s' % (lumd, lumn, sd, sn))
    # 夏日冰菓室：12 月拉鐵門、7 月營業
    if 'B5i' in SEL:
        for tagm, dk, want_closed in (('dec', ICE_OFF, True), ('jul', ICE_ON, False)):
            tag = 'ice_' + tagm
            await load_wz(pg, 14.0, 24.4, 0.0, math.pi, dk, tag)
            st = await pg.evaluate(ICE_JS)
            await pg.evaluate(HUD + '(false)')
            e, l, r = door_view('B5i'); s1 = await shoot(pg, 'wz2_B5i_door_%s.png' % tagm, e, l, r)
            e, l, r = win_view('B5i'); s2 = await shoot(pg, 'wz2_B5i_win_%s.png' % tagm, e, l, r)
            await pg.evaluate(HUD + '(true)'); await pg.evaluate(UNAIM)
            RES['ice'][tagm] = {'date': dk, 'state': st, 'door': s1, 'win': s2}
            nodes = st.get('nodes') or []
            shut = [n for n in nodes if n['n'].startswith('SEASON_ICECLOSED_on')]
            check('[%s] 冰菓室季節節點找得到（SEASON_ICECLOSED_on_B5i*）' % tag, bool(shut), J(nodes))
            if shut:
                vis = all(n['shown'] for n in shut) if want_closed else not any(n['shown'] for n in shut)
                check('[%s] %s（%s 月）鐵捲門%s' % (tag, dk, st.get('month'), '拉下（節點顯示）' if want_closed else '拉開（節點不顯示）'), vis, J(shut))
            labs = {i['label']: i['hidden'] for i in st.get('items') or []}
            if want_closed:
                ok = labs.get('看夏日冰菓室') is False and labs.get('買一碗冰', True) is True
            else:
                ok = labs.get('買一碗冰') is False and labs.get('看夏日冰菓室', True) is True
            check('[%s] 窗口按鈕：%s' % (tag, '「看夏日冰菓室」出現、「買一碗冰」藏起來' if want_closed else '「買一碗冰」出現、「看夏日冰菓室」藏起來'), ok, J(st.get('items')))
            info('[%s] WZS.inSeason(ice)' % tag, str(st.get('inSeason')))


async def converse(pg, cdp, tag, max_s=30):
    last = None; t0 = time.time(); idle = None
    while time.time() - t0 < max_s:
        s = await pg.evaluate(ST)
        if s['choices']:
            print('  [%s] 選單 %s → %s' % (tag, J(s['choices']), s['choices'][0]), flush=True)
            await L.tap(pg, cdp, '#choices button:nth-child(1)'); await pg.wait_for_timeout(900); idle = None; continue
        if s['dlg']:
            if (s['name'], s['text']) != last: last = (s['name'], s['text']); print('  [%s] %s：%s' % (tag, s['name'] or '（旁白）', s['text']), flush=True)
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700); idle = None; continue
        if s['depth'] == 0 and not s['busy']:
            if idle is None: idle = time.time()
            if time.time() - idle > 2.0: return True
        await pg.wait_for_timeout(500)
    return False


async def stuck_check(pg, cdp, tag, fb0, e0, errs):
    await converse(pg, cdp, tag, 15)
    moved = 0.0
    for dx, dy in ((0, -60), (0, 60), (60, 0), (-60, 0)):
        moved, _, _ = await L.push_until(pg, cdp, dx, dy, 0.3, max_pushes=2, ms=1500)
        if moved >= 0.3: break
    s2 = await pg.evaluate(ST); new = errs[e0:]
    ok = (not s2['dlg'] and not s2['choices'] and s2['depth'] == 0 and moved >= 0.3 and s2['fb'] == fb0 and not new)
    check('[%s] 卡住檢查（對話關、busyDepth 0、搖桿 ≥0.3 m、walkFallbacks 沒增加、沒有 JS 例外）' % tag, ok,
          J({'dlg': s2['dlg'], 'depth': s2['depth'], 'moved': round(moved, 2), 'fb': [fb0, s2['fb']], 'errs': new[:2]}))
    if not ok: await pg.screenshot(path=os.path.join(OUT, 'STUCK_%s.png' % tag))
    return ok


async def case_door(pg, cdp, errs):
    print('== door', flush=True)
    for code in SEL:
        nm, old, side, x0, x1, fz, dz, door, wx = SHOPS[code]
        tag = 'door_' + code
        dxz = list(door)
        st0 = [door[0], 0.0]
        await load_wz(pg, 14.0, st0[0], st0[1], 0.0 if side == 'B' else math.pi, DATEKEY, tag)
        await L.close_panels(pg, cdp)
        start = await pg.evaluate(NEAREST % J(st0))
        if start and math.hypot(start[0] - st0[0], start[1] - st0[1]) > 0.05:
            print('  [前置／捷徑] (%.2f, 0) 站不住，改讀檔到 %s' % (st0[0], J(start)), flush=True)
            await load_wz(pg, 14.0, start[0], start[1], 0.0 if side == 'B' else math.pi, DATEKEY, tag)
            await L.close_panels(pg, cdp)
        d = await pg.evaluate(DOOR_JS % J(dxz))
        RES['door'][code] = {'door': dxz, 'static': d}
        bad_lab = [i for i in d['items'] if i['label'].startswith('進入') or i['label'].startswith('進去')]
        bad_exit = [i for i in d['items'] if i['exit']]
        check('[%s] %s 門口 %s 2 m 內沒有「進入／進去」開頭的互動點' % (tag, nm, J(dxz)), not bad_lab, J(bad_lab))
        check('[%s] %s 門口 2 m 內沒有 exit 型（含 enter）互動點' % (tag, nm), not bad_exit, J(bad_exit))
        info('[%s] 門口 2 m 內的互動點' % tag, J([{q: i[q] for q in ('label', 'd', 'hidden')} for i in d['items']]))
        check('[%s] 門口那一格 nav.free 而且 canStand(0.3)' % tag, d['free'] is True and d['stand'] is True, J({'free': d['free'], 'stand': d['stand']}))
        fb0 = (await pg.evaluate(ST))['fb']; e0 = len(errs)
        reached = await L.go_to(pg, cdp, Run(), dxz[0], dxz[1], 0.8, '%s 門口' % nm, max_s=240)
        await pg.wait_for_timeout(1200); s = await pg.evaluate(ST)
        dd = math.hypot(s['x'] - dxz[0], s['z'] - dxz[1])
        check('[%s] 從街上真的走到 %s 門口 %s' % (tag, nm, J(dxz)), reached and dd <= 1.0, J({'x': s['x'], 'z': s['z'], 'd': round(dd, 2), 'interact': s['interact'], 'zone': s['zone']}))
        check('[%s] 走到門口以後還在溫州街（沒有被送進店裡）' % tag, s['zone'] == 'wenzhou', s['zone'])
        info('[%s] 門口的互動按鈕' % tag, s['interact'] or '（沒有）')
        RES['door'][code].update({'reached': reached, 'at': [s['x'], s['z']], 'dist': round(dd, 2), 'interact': s['interact']})
        await pg.screenshot(path=os.path.join(OUT, 'door_%s.png' % code))
        RES['door'][code]['stuck_ok'] = await stuck_check(pg, cdp, tag, fb0, e0, errs)


async def main():
    os.makedirs(OUT, exist_ok=True)
    print('CC WZ2 v3 溫州街第二批五間；SHA=%s；CASES=%s；店=%s；Playwright（PC 有 GPU、有視窗），不是手機實機' % (os.environ.get('SHA', '?'), ','.join(CASES), ','.join(SEL)), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        t0 = time.time(); await pg.goto(URL); ok = await L.wait_loaded(pg); boot = time.time() - t0
        check('遊戲載入', ok, '%.1f 秒' % boot)
        if not ok:
            await b.close(); print('FAILED 1: 遊戲載入', flush=True); sys.exit(1)
        RES['boot_s'] = round(boot, 1)
        await pg.evaluate("localStorage.clear(); if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}")
        if 'shots' in CASES:
            await case_shots(pg, errs)
        if 'door' in CASES:
            await case_door(pg, cdp, errs)
        check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    json.dump(RES, open(os.path.join(OUT, 'wz2_shots.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS[:10])), flush=True)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
