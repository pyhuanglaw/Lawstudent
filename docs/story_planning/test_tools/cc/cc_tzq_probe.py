"""CC（帳號 A）11-10：BB 22:05 三項——TZQ（TINGZHOU-SHOPS-MOVE-1110 汀州路快速前往）、TZP（TINGZHOU-WALKERS-1110 汀州路路人）、WZQ（WZ-QUICKTRAVEL-1110 溫州街快速前往，X319）。
受測：開發分支 5e6f4990c；WZQ 的舊版對照 c17a9919e。LAWWW 說這批只有 Node 測過（tests/tingzhou_places_1110_unit.js、tingzhou_walkers_1110_unit.js、wz_quicktravel_1110_unit.js）。
Playwright（PC GPU）≠ iPhone。捷徑只當前置條件（R.setup 印【前置／捷徑】）；快速前往照玩家按法：觸控點 📱 → 「地點」→ 地區 → 那一列的「前往」；不用 ?turbo、不瞬移玩家。

對照的程式（5e6f4990c）：
  src/data/places.js     quickList() 的 TZ（汀州路＋PLACES.TZ_SHOPS 八間，落點 PLACES.tzDoor：立面往騎樓裡 arcade−0.9、店面中間、yaw＝sx·π/2）、WZ（四家進得去的店＋三家窗口／櫥窗，第 4 格＝營業時間照哪一家）；
                         known0.tingzhou=1（一開始就知道）；landmarks.tingzhou
  src/game3d.js          placeState（第 4 格 hz、汀州路／溫州街照距離算 here）、quickGo（advance(st.mins/60) → enter(z,sp)）、phone [data-place] 點了照「zone|名字」找那一筆
  src/classes3d.js       travelMinutes：同一區（公館、溫州街、汀州路）照距離 d<12＝0、否則 max(5, round((2+d/13)/5)·5)；不同區照 ANCHOR
  src/placemap3d.js      PINS 多一顆 tingzhou (104,240)（公館 (100,172) 下面）、AREAS 多一塊、GROUPS 公館後面是 tingzhou、ZONE_PIN.tingzhou
  src/tingzhou3d.js      店門互動點 label「看／進＋店名」(tzShop)、夜市攤 stalls（導航照 block 擋）、zoneTime：stallsOpen && !zone.tzStallsClosed；路邊機車擋導航；公館 G10「往汀州路（巷子）」
  src/data/tingzhou_walk.js  count(h,level,typhoon,x)：base[17,23]=8 × CROWD_X 2 × 畫質（low .5、medium .75、high 1）＝8／12／16；颱風 0.5→1 人；plan() 排方向、起點、速度
  src/story3d.js         S.populate 汀州路：CALENDAR.typhoon(G.day) → E.zone.tzStallsClosed；TW.plan → GM.spawnExtra(extraSpec(xi++))；extraSpec 上衣 5×下身 4×髮型
  src/guide3d.js         大地圖標題 #bmTitle＝PLACES.names[zone]（點小地圖 #minimap 打開）；HUD 的地名 #clockZ
  src/wzshops3d.js       溫州街窗口：帝大紅茶「買一杯飲料」(wzShop tea)、夏日冰菓室「買一碗冰」（季節外是「看夏日冰菓室」）；zones3d.js 溫州書屋「看書店的櫥窗」

PARTS（逗號分開；TZQ、TZP 是下面幾個的總稱）：
  TZQ_MAP  A1 手機「地點」：地區 tingzhou 排在 gongguan 正後面；地圖上的汀州路圖釘在公館圖釘下面；點圖釘列出九筆；人在汀州路：#clockZ、點小地圖的大地圖標題 #bmTitle、預設展開的地區
  TZQ_GO   A2 九個點各一次：【前置】讀檔到公館商圈 (−2.5,−29) 14:00 → 手機點「前往」→ 落點站得住（E.nav.free、E.canStand 0.3）、不在攤子範圍、店在騎樓上（|x|>路寬）、
           面向店面（±25°）、互動鍵是那一間（#interactLabel）、時間照距離扣（G.hour 前後＋量 G.hour 的跳動＝快速前往扣的那一段；和清單上寫的「約 N 分鐘」比）；
           再從汀州路巷子口讀一次清單，九筆的分鐘數照距離公式核對，按最遠的那一間看扣的時間
  TZQ_NEW  A3 新存檔（GAME.defaults：visited 只有宿舍）：汀州路那一區的九筆照 BB「顯示還沒去過、不能直接傳送」核對（程式 known0.tingzhou=1，會在 note 寫出來）
  TZQ_OLD  A4 公館那一區的清單、公館圖釘沒有泰米村食、洗樂洗衣坊、印得好；舊存檔站在 G09～G11 門口（z 21）與人行道（z 18）讀得進來、站得住、2 秒不被帶走、點地面走得動
  TZP_CNT  B1、B2、B3（靜態）每個畫質（Q＝low,medium,high，預設三個都跑）× 14:00、18:30、22:30、01:00：站路中間 (0,6)，觸控轉鏡頭往北、往南各拍一張（亮度從截圖算），
           數 E.npcs 的無名路人（在場、看得到）、和 TINGZHOU_WALK.count 與 BB 的 8／12／16 比；列每個路人的底模、上衣、下身、髮型，算幾種；18:30 用獨立鏡頭拍最近三個人的近圖
  TZP_WALK B3 18:30（Q 的第一個）每秒記每個路人的位置 60 秒：不在導航擋住的格子（穿牆、機車、攤子）、不在攤子範圍、不停在店門 1 m 內、沒有原地踏步（連 2 秒移動 <0.05 m）
  TZP_TY   B4 【捷徑】行事曆颱風假（CALENDAR.typhoon，2025-10-13）18:30：tzStallsClosed、攤子收、路人 1 個；同一時間的平常日對照
  TZP_FPS  B5 高畫質 18:30 路中間 8 秒 requestAnimationFrame（PC GPU 才有意義；雲端 SwiftShader 不當結論）
  WZQ      C 手機「地點」溫州街那一區列出全部 11 間（舊版 c17a9919e 會 FAIL：印出有幾間、少哪幾間）；每一間：【前置】讀檔到新生南路（側門進來的地方）、visited 有那幾家店、
           挑那一家開門的日子時間 → 點「前往」→ 到那一區、落點、站得住、面向、互動鍵是那一間（窗口／櫥窗三家：照 wzshops3d.js 的 label；店裡：不是別家的名字）
用法：LW_TESTS=<wt>/tests SHA=<sha> PARTS=TZQ,TZP,WZQ [Q=low|medium|high（可以逗號列多個）] [WAIT=8000] [ONLY=店名,…（雲端自檢：A2、C 只跑這幾筆）] [HOURS=14,18.5,22.5,25（TZP_CNT 的時間）] [OBS_S=60] python3 cc_tzq_probe.py <url> <out>"""
import os, sys, json, asyncio, time, base64, math, re
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SHA = os.environ.get('SHA', '')
ALIAS = {'TZQ': ['TZQ_MAP', 'TZQ_GO', 'TZQ_NEW', 'TZQ_OLD'], 'TZP': ['TZP_CNT', 'TZP_WALK', 'TZP_TY', 'TZP_FPS']}
PARTS = []
for p in (os.environ.get('PARTS') or 'TZQ,TZP,WZQ').split(','):
    p = p.strip().upper()
    for q in ALIAS.get(p, [p]):
        if q and q not in PARTS: PARTS.append(q)
QS = [q.strip() for q in (os.environ.get('Q') or 'low,medium,high').split(',') if q.strip()]
WAIT = int(os.environ.get('WAIT') or 8000)
R = L.Run('cc_tzq', OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
DAY = '2025-11-01'          # 汀州路沒有營業時間；和 cc_tingzhou_probe.py 同一天
TY_DAY = '2025-10-13'       # src/data/calendar.js TYPHOON：'2025-10-13':'颱風假'
TZ9 = ['汀州路', '泰米村食', '洗樂洗衣坊', '印得好', '越好吃小館', '客居雲南', '東南大聯商行', '汀州聯通', '溫特寶邸']
GG3 = ['泰米村食', '洗樂洗衣坊', '印得好']
WZ11 = ['2:30 AM', '木曜日', '日常失速', '一盞', 'SUNNY SIDE', '阿德影印輸出', '林家乾麵', '小路', '帝大紅茶', '夏日冰菓室', '溫州書屋']
WZ_VISIT = {'dorm': True, 'cafe': True, 'wz_mokuyobi': True, 'wz_offbeat': True, 'wz_teahouse': True, 'wz_brunch': True, 'wz_print': True, 'wz_lin': True, 'wz_teishoku': True}
WZ_WIN = {'帝大紅茶': ['買一杯飲料'], '夏日冰菓室': ['買一碗冰', '看夏日冰菓室'], '溫州書屋': ['看書店的櫥窗']}   # wzshops3d.js S.windowItems、zones3d.js 溫州街櫥窗
GG_START = (-2.5, -29.0, 0.0)   # places.js「公館商圈」落點
NIGHT_N = {'low': 8, 'medium': 12, 'high': 16}   # BB：17～23 點依畫質 8／12／16
TZP_HOURS = [float(h) for h in (os.environ.get('HOURS') or '14,18.5,22.5,25').split(',')]           # 01:00＝前一天的 25:00（遊戲過午夜 G.hour 繼續往上加；populate 用 hour%24）

DAYOF = "(k=>{ if(typeof STORY!=='undefined'&&STORY.dayOfKey) return STORY.dayOfKey(k); for(let d=0;d<4000;d++){ try{ if(CALENDAR.dateOf(d).key===k) return d; }catch(e){} } return null; })"
ME = r"""(()=>{ const E=GAME.E, P=E.player, p=P.obj.position, N=E.nav, it=document.getElementById('interact'), lb=document.getElementById('interactLabel');
  return {zone:GAME.G.zone, h:+(+GAME.G.hour).toFixed(4), x:+p.x.toFixed(2), z:+p.z.toFixed(2), ry:+P.obj.rotation.y.toFixed(3), lv:P.lv|0,
    free:N?!!N.free(p.x,p.z):null, stand:E.canStand?!!E.canStand(p.x,p.z,0.3,P.lv|0):null,
    interact:(it&&!it.classList.contains('hide')&&getComputedStyle(it).display!=='none')?((lb||it).textContent||'').trim():'',
    ent:!!(GAME.isEntering&&GAME.isEntering()), busy:!!P.busy, fb:GAME.walkFallbacks|0, clockZ:((document.getElementById('clockZ')||{}).textContent||'').trim(),
    phone:!!(GAME.phoneIsOpen&&GAME.phoneIsOpen()), dlg:!!(GAME.D&&GAME.D.active), toast:((document.getElementById('toast')||{}).textContent||'').trim().slice(0,60),
    q:E.q?E.q.level:null}; })()"""
# 手機「地點」：地區按鈕（順序、展開了沒）、每一列（名字、狀態字、前往按鈕的 data-place、在哪一區的框裡 area；圖釘選中的那一塊 pin＝圖釘名字（placemap3d.js S.html 的 <b>）；最上面的「回家」兩個都是 null）
AREAS = "(()=>[...document.querySelectorAll('#phoneBody [data-parea]')].map(b=>({id:b.dataset.parea, on:b.getAttribute('aria-expanded')==='true', txt:(b.textContent||'').trim()})))()"
ROWS = r"""(()=>[...document.querySelectorAll('#phoneBody .phrow')].map(r=>{ const d=r.querySelector('div'); const nm=d&&d.childNodes[0]?(d.childNodes[0].textContent||'').trim():''; const mu=r.querySelector('.muted');
  const b=r.querySelector('[data-place]'); const box=r.closest('[data-parea-box]'), pb=r.parentElement&&r.parentElement.querySelector(':scope > b');
  return {name:nm, st:mu?(mu.textContent||'').trim():'', place:b?b.dataset.place:null, btn:b?(b.textContent||'').trim():null, area:box?box.dataset.pareaBox:null, pin:(!box&&pb)?(pb.textContent||'').trim():null}; }))()"""
# 汀州路的幾何（配置＋區域）：攤子擋導航的範圍（tingzhou3d.js：blockRect(x−sin·back, z−cos·back, ax?d:w, ax?w:d)）、店門互動點、路寬、攤子現在擺不擺
TZGEO = r"""(()=>{ const L=TINGZHOU_LAYOUT, Z=GAME.E.zone||{}, B=L.stalls?L.stalls.block:null;
  const stalls=(L.stalls?L.stalls.list:[]).map(q=>{ const c=Math.cos(q.yaw), s=Math.sin(q.yaw), ax=Math.abs(s)>0.5; return {id:q.id,kind:q.kind,x:q.x,z:q.z,cx:q.x-s*B.back,cz:q.z-c*B.back,w:ax?B.d:B.w,d:ax?B.w:B.d}; });
  const doors=(GAME.E.interactables||[]).filter(i=>i.tzShop).map(i=>({id:i.tzShop,label:i.label,x:i.x,z:i.z,r:i.radius||1}));
  return {stalls,doors,roadX1:L.road.x1,F:L.facade,on:!!Z.tzStallsOn,closed:!!Z.tzStallsClosed,scooters:Z.tzScooters|0,
    stallVis:(Z.tzStalls||[]).map(q=>({id:q.id,open:q.open?!!q.open.visible:null,closed:q.closed?!!q.closed.visible:null}))}; })()"""
QL = "(()=>PLACES.quickList().filter(Boolean).map(p=>({z:p[0],name:p[1],sp:p[2]||null,hz:p[3]||null})))()"
EXTRAS = r"""(()=>{ const E=GAME.E, N=E.nav; return (E.npcs||[]).filter(n=>n&&n.isExtra&&n.obj).map(n=>{ const o=n.obj, p=o.position, u=o.userData||{}, b=u.buildSpec||{}, of=b.outfit||{}, t=of.top||{}, bt=of.bottom||{}, hr=b.hair||{};
  let key=null; try{ key=CHAR.anonKeyOf?CHAR.anonKeyOf(o):null; }catch(e){} key=key||u.key||(u.spec&&u.spec.model)||null;
  return {id:String(b.id||o.uuid), x:+p.x.toFixed(2), z:+p.z.toFixed(2), vis:!!o.visible, hid:!!n.hidden, model:key, drv:u.driver||null, sex:b.sex||null,
    top:(t.type||'')+' '+(t.color||''), bot:(bt.type||'')+' '+(bt.color||''), hair:(hr.style||'')+' '+(hr.color||''), ht:b.height||null, bag:of.bag||null,
    pose:n.pose||null, ws:n.walkSpeed==null?null:+(+n.walkSpeed).toFixed(2), free:N?!!N.free(p.x,p.z):null, stand:E.canStand?!!E.canStand(p.x,p.z,0.25,0):null}; }); })()"""
TWCOUNT = "(a=>{ if(typeof TINGZHOU_WALK==='undefined') return null; return {n:TINGZHOU_WALK.count(a.h,GAME.E.q.level,a.ty,(typeof STORY!=='undefined'&&STORY.CROWD_X!=null)?STORY.CROWD_X:2), level:GAME.E.q.level, x:(typeof STORY!=='undefined')?STORY.CROWD_X:null}; })"
SETQ = "(q=>{ const s=document.getElementById('setQuality'); if(!s) return null; s.value=q; s.dispatchEvent(new Event('change')); return GAME.E.q.level; })"
# 量快速前往扣的時間：G.hour 改成 getter／setter，記下一次跳超過 0.02 小時（1.2 分鐘）的改變（主迴圈每格只加 dt×hourRate；quickGo 的 advance 是一次加 mins/60）
HOOK = r"""(()=>{ const G=GAME.G; let v=G.hour; window.__hj=[]; Object.defineProperty(G,'hour',{configurable:true,enumerable:true,get(){ return v; },set(n){ if(Math.abs(n-v)>0.02) window.__hj.push([+(+v).toFixed(4),+(+n).toFixed(4)]); v=n; }}); return v; })()"""
UNHOOK = r"""(()=>{ const G=GAME.G, v=G.hour; Object.defineProperty(G,'hour',{configurable:true,enumerable:true,writable:true,value:v}); return window.__hj||[]; })()"""
# 獨立鏡頭（不是遊戲的跟隨鏡頭）拍離玩家最近的 k 個路人：鏡頭放在他們中心往玩家那一側 3 m＋散開的距離、高 1.6、看 1.1 高；
# 路人顯不顯示照新鏡頭的視錐重算、遠距離版本換回近距離（同 cc_d141_lib.CAM 的做法），拍完下一格主迴圈自己會重算
CLOSE = r"""(a=>{ const E=GAME.E, r=E.renderer, c=r.domElement, P=E.player.obj.position;
  const ex=(E.npcs||[]).filter(n=>n&&n.isExtra&&n.obj&&!n.hidden).map(n=>({n,d:Math.hypot(n.obj.position.x-P.x,n.obj.position.z-P.z)})).sort((p,q)=>p.d-q.d).slice(0,a.k);
  if(!ex.length) return null; let cx=0,cz=0; for(const e of ex){ cx+=e.n.obj.position.x; cz+=e.n.obj.position.z; } cx/=ex.length; cz/=ex.length;
  let sp=0; for(const e of ex) sp=Math.max(sp,Math.hypot(e.n.obj.position.x-cx,e.n.obj.position.z-cz));
  let dx=P.x-cx, dz=P.z-cz, dl=Math.hypot(dx,dz); if(dl<0.5){ dx=cx>=0?-1:1; dz=0; dl=1; } dx/=dl; dz/=dl; const dist=3+sp*1.2;
  const cam=new THREE.PerspectiveCamera(45,c.width/c.height,0.1,300); cam.position.set(cx+dx*dist,1.6,cz+dz*dist); cam.lookAt(cx,1.1,cz); cam.updateMatrixWorld(true);
  const fr=new THREE.Frustum(), M=new THREE.Matrix4(), S=new THREE.Sphere(); M.multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse); fr.setFromProjectionMatrix(M);
  for(const n of (E.npcs||[])){ const o=n&&n.obj; if(!o) continue; S.center.set(o.position.x,o.position.y+0.9,o.position.z); S.radius=1.3; o.visible=!n.hidden&&fr.intersectsSphere(S);
    try{ if(n.isExtra&&o.userData.farLOD&&CHAR.setFar){ const was=!!o.userData.isFar; CHAR.setFar(o,false); if(was) CHAR.animate(o,0.016,{pose:n.pose,speed:n.speed}); } }catch(e){} }
  const z=E.zone, PL=E.player.obj, pv=PL.visible; if(z&&z.fadeWalls){ try{ z.fadeWalls(cam,P); if(E.hideFaded) E.hideFaded(); }catch(e){} }
  PL.visible=false; let url=null; try{ r.render(E.scene,cam); const k=document.createElement('canvas'); k.width=c.width; k.height=c.height; const g=k.getContext('2d'); g.drawImage(c,0,0);
    g.fillStyle='rgba(0,0,0,0.6)'; g.fillRect(0,0,k.width,22); g.fillStyle='#fff'; g.font='15px sans-serif'; g.fillText(a.label,6,16); url=k.toDataURL('image/jpeg',0.9); }
  finally { PL.visible=pv; if(z&&z.fadeWalls&&E.camera){ try{ z.fadeWalls(E.camera,P); if(E.hideFaded) E.hideFaded(); }catch(e){} } }
  return {url, who:ex.map(e=>({id:String((e.n.obj.userData.buildSpec||{}).id||''),d:+e.d.toFixed(2)})), cam:[+(cx+dx*dist).toFixed(2),1.6,+(cz+dz*dist).toFixed(2)], at:[+cx.toFixed(2),1.1,+cz.toFixed(2)]}; })"""
FPS8 = "(ms=>new Promise(res=>{ let n=0; const t0=performance.now(); const f=()=>{ n++; if(performance.now()-t0<ms) requestAnimationFrame(f); else res(+(n/((performance.now()-t0)/1000)).toFixed(1)); }; requestAnimationFrame(f); }))"


def save(u, fn):
    if u: open(os.path.join(OUT, fn), 'wb').write(base64.b64decode(u.split(',', 1)[1]))


def ang(a, b):
    return abs((a - b + math.pi) % (2 * math.pi) - math.pi)


def js_round(x):
    return math.floor(x + 0.5)


def mins_by_dist(d):   # classes3d.js travelMinutes：同一區照距離
    return 0 if d < 12 else max(5, js_round((2 + d / 13) / 5) * 5)


def in_rect(x, z, s, pad=0.0):
    return abs(x - s['cx']) <= s['w'] / 2 + pad and abs(z - s['cz']) <= s['d'] / 2 + pad


async def load(pg, cdp, zone, day_key, h, x=None, z=None, yaw=None, extra=None, why=''):
    d = await pg.evaluate(DAYOF, day_key)
    st0 = {'zone': zone, 'hour': h, 'day': d, 'weather': 'clear'}
    if x is not None: st0['pos'] = {'x': x, 'z': z, 'yaw': yaw if yaw is not None else 0.0, 'lv': 0}
    if extra: st0.update(extra)
    try: await L.load_state(pg, st0, quiet_events=True, quiet_phone=True)
    except TypeError: await L.load_state(pg, st0, quiet_events=True)
    await pg.wait_for_timeout(WAIT); await unfade(pg); await L.close_panels(pg, cdp)
    R.setup('讀檔到 %s %s %s 時%s%s %s' % (zone, day_key, h, '' if x is None else ' (%.2f,%.2f)' % (x, z), (' ' + J(extra)) if extra else '', why))
    return await pg.evaluate(ME)


async def unfade(pg, secs=12):
    """等黑幕（#fade.on，game3d.js fade()）退掉再拍、再算亮度：剛到的那一刻畫面還是黑的（雲端自檢 A2 第一版拍到全黑＋字卡）"""
    t0 = time.time()
    while time.time() - t0 < secs:
        if await pg.evaluate("(()=>{ const f=document.getElementById('fade'); return !f||(!f.classList.contains('on')&&+getComputedStyle(f).opacity<0.05); })()"): break
        await pg.wait_for_timeout(250)
    await pg.wait_for_timeout(600)


async def set_q(pg, q):
    lv = await pg.evaluate(SETQ, q)
    R.setup('設定頁畫質改成 %s（#setQuality 改值＋change；之後讀檔才照新畫質生路人）→ E.q.level=%s' % (q, lv))
    return lv


async def phone_places(pg, cdp):
    if not await pg.evaluate("!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())"):
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(900)
    await L.tap(pg, cdp, '#phoneTabs button[data-ptab="places"]'); await pg.wait_for_timeout(900)


async def open_area(pg, cdp, aid):
    """照玩家點地區（[data-parea]）；已經展開就不點（再點一次會收起來）"""
    a = next((x for x in await pg.evaluate(AREAS) if x['id'] == aid), None)
    if not a: return False
    if not a['on']: await L.tap(pg, cdp, '#phoneBody [data-parea="%s"]' % aid); await pg.wait_for_timeout(700)
    a = next((x for x in await pg.evaluate(AREAS) if x['id'] == aid), None)
    return bool(a and a['on'])


async def wait_arrive(pg, cdp, want, secs=60):
    t0 = time.time(); me = None
    while time.time() - t0 < secs:
        me = await pg.evaluate(ME)
        if me['zone'] == want and not me['ent'] and not me['busy']: break
        if me['dlg']: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(300)
    if (await pg.evaluate(ME))['phone']: await L.phone_away(pg, cdp, tries=2)
    await L.close_panels(pg, cdp); await unfade(pg)
    return round(time.time() - t0, 1), me


async def quick_go_row(pg, cdp, area, zone, name, tag):
    """手機「地點」→ 地區 area → 「name」那一列的「前往」。回傳 (列, 跳動紀錄, 到達後 ME, 前 ME)"""
    await L.close_panels(pg, cdp); await phone_places(pg, cdp)
    ok_a = await open_area(pg, cdp, area)
    rows = await pg.evaluate(ROWS); row = next((r for r in rows if r['area'] == area and r['name'] == name), None)
    if not R.check('%s 手機「地點」的「%s」那一區有「%s」' % (tag, area, name), ok_a and bool(row), J([r for r in rows if r['area'] == area])):
        await L.close_panels(pg, cdp); return None, [], None, None
    if not row['place']:
        R.note('%s「%s」沒有前往按鈕：狀態「%s」' % (tag, name, row['st'])); await L.close_panels(pg, cdp); return row, [], None, None
    b4 = await pg.evaluate(ME); await pg.evaluate(HOOK)
    sel = '#phoneBody [data-parea-box="%s"] [data-place=%s]' % (area, J(row['place']))
    tapped = await L.tap(pg, cdp, sel)
    secs, me = await wait_arrive(pg, cdp, zone)
    jumps = await pg.evaluate(UNHOOK); me = await pg.evaluate(ME)
    R.note('%s 按「%s」（%s）%s；%.1f 秒後 %s；G.hour 跳動 %s' % (tag, row['btn'], row['st'], '' if tapped else '【按不到】', secs, J(me), J(jumps)))
    return row, jumps, me, b4


def mins_of(row):
    m = re.search(r'約 (\d+) 分鐘', (row or {}).get('st') or '')
    return int(m.group(1)) if m else None


# ---------------------------------------------------------------- A：汀州路快速前往
async def part_tzq_map(pg, cdp, errs):
    await load(pg, cdp, 'gongguan', DAY, 14.0, *GG_START, why='（公館商圈；看手機「地點」）')
    await phone_places(pg, cdp)
    areas = await pg.evaluate(AREAS); ids = [a['id'] for a in areas]
    R.note('[A1] 地區按鈕（順序）：%s' % J(areas))
    R.check('[A1] 手機「地點」有「汀州路」這一區、排在公館正後面', 'tingzhou' in ids and 'gongguan' in ids and ids.index('tingzhou') == ids.index('gongguan') + 1, J(ids))
    pins = await pg.evaluate("(()=>{ const o={}; for(const id of ['gongguan','tingzhou']){ const g=document.querySelector('#phoneBody [data-pmap=\"'+id+'\"]'); const c=g&&g.querySelector('circle'); o[id]=c?{cx:+c.getAttribute('cx'),cy:+c.getAttribute('cy'),txt:(g.textContent||'').trim()}:null; } return o; })()")
    R.note('[A1] 地圖圖釘：%s' % J(pins))
    R.check('[A1] 地圖上有汀州路圖釘、在公館圖釘下面（SVG y 比較大、x 相差 <30）', bool(pins.get('tingzhou') and pins.get('gongguan')) and pins['tingzhou']['cy'] > pins['gongguan']['cy'] and abs(pins['tingzhou']['cx'] - pins['gongguan']['cx']) < 30 and '汀州路' in pins['tingzhou']['txt'], J(pins))
    # 點圖釘（玩家點地圖：game3d.js 照手指位置 PLACEMAP.pick 最近的圖釘）
    c = await pg.evaluate("(()=>{ const g=document.querySelector('#phoneBody [data-pmap=\"tingzhou\"]'); if(!g) return null; const k=g.querySelector('circle')||g; k.scrollIntoView({block:'center'}); const r=k.getBoundingClientRect(); const x=r.left+r.width/2, y=r.top+r.height/2; const e=document.elementFromPoint(x,y); return {x,y,inSvg:!!(e&&e.closest&&e.closest('[data-pmapsvg]'))}; })()")
    if c and c['inSvg']:
        await L.touch_tap(cdp, c['x'], c['y']); await pg.wait_for_timeout(900)
    rows = await pg.evaluate(ROWS); pinrows = [r for r in rows if r['pin'] == '汀州路']
    R.note('[A1] 點汀州路圖釘（螢幕 %s）→ 圖釘那一塊列出：%s' % (J(c), J(pinrows)))
    R.check('[A1] 點汀州路圖釘：列出九筆（汀州路＋八間店，名字一字不差）', sorted(r['name'] for r in pinrows) == sorted(TZ9), J([r['name'] for r in pinrows]))
    await pg.screenshot(path=os.path.join(OUT, 'A1_phone_pin.png'))
    await open_area(pg, cdp, 'tingzhou')
    rows = await pg.evaluate(ROWS); ar = [r for r in rows if r['area'] == 'tingzhou']
    R.check('[A1] 汀州路那一區（地區清單）列出同樣九筆', sorted(r['name'] for r in ar) == sorted(TZ9), J(ar))
    await L.close_panels(pg, cdp)
    # 人在汀州路：HUD 地名、點小地圖的大地圖標題、手機預設展開的地區
    me = await load(pg, cdp, 'tingzhou', DAY, 14.0, None, None, why='（巷子口出生點）')
    R.check('[A1] 人在汀州路：小地圖旁的地名（#clockZ）是「汀州路」', me['clockZ'] == '汀州路', J(me))
    await L.tap(pg, cdp, '#minimap'); await pg.wait_for_timeout(1200)
    bm = await pg.evaluate("(()=>{ const b=document.getElementById('bigmap'); return {open:!!b&&!b.classList.contains('hide'), title:((document.getElementById('bmTitle')||{}).textContent||'').trim()}; })()")
    await D.shot(pg, 'A1_bigmap_tingzhou')
    R.check('[A1] 點小地圖打開大地圖、標題是「汀州路」', bm['open'] and bm['title'].startswith('汀州路'), J(bm))
    await L.close_panels(pg, cdp)
    await phone_places(pg, cdp); areas = await pg.evaluate(AREAS)
    here = await pg.evaluate("(()=>{ const p=GAME.E.player.obj.position; return {hereId:PLACEMAP.hereId(GAME.G.zone,p.x,p.z), area:PLACEMAP.hereArea({zone:GAME.G.zone,x:p.x,z:p.z})}; })()")
    R.check('[A1] 人在汀州路：手機「地點」預設展開汀州路那一區（PLACEMAP.hereArea）', any(a['id'] == 'tingzhou' and a['on'] for a in areas), J({'areas': areas, 'here': here}))
    await pg.screenshot(path=os.path.join(OUT, 'A1_phone_in_tingzhou.png'))
    await L.close_panels(pg, cdp)


async def check_tz_spot(pg, name, me, sp, geo, tag):
    """快速前往到汀州路的落點：位置、站得住、不在攤子、店在騎樓（不在路邊機車格）、面向、互動鍵"""
    R.check('%s 到 tingzhou、落在清單的落點 (%s,%s)（0.5 m 內）' % (tag, sp and sp['x'], sp and sp['z']), me['zone'] == 'tingzhou' and bool(sp) and math.hypot(me['x'] - sp['x'], me['z'] - sp['z']) < 0.5, J(me))
    R.check('%s 站得住（E.nav.free、E.canStand 半徑 0.3：不在牆裡、機車、攤子的導航格）' % tag, bool(me['free']) and bool(me['stand']), J(me))
    inst = [s['id'] for s in geo['stalls'] if in_rect(me['x'], me['z'], s, 0.3)]
    R.check('%s 不在夜市攤的範圍（含 0.3 m 人的半徑）' % tag, not inst, J(inst))
    if name == '汀州路':
        R.check('%s 巷子口落點在巷 A 裡（x > 立面 %.1f）' % (tag, geo['F']['east']), me['x'] > geo['F']['east'], J(me))
        R.check('%s 面向和配置 fromGongguan.yaw 一樣（±25°）' % tag, ang(me['ry'], sp['yaw']) < math.radians(25), 'ry %.3f yaw %.3f' % (me['ry'], sp['yaw']))
        R.note('%s 巷子口的互動鍵：「%s」' % (tag, me['interact']))
        return
    door = next((d for d in geo['doors'] if d['label'] in ('看' + name, '進' + name)), None)
    R.check('%s 在騎樓／人行道上（|x| %.2f > 路寬 %.1f＋0.3：不在路邊機車格）' % (tag, abs(me['x']), geo['roadX1']), abs(me['x']) > geo['roadX1'] + 0.3, J(me))
    sx = -1 if me['x'] < 0 else 1; want = sx * math.pi / 2   # 西側的店在 −x：面向西（yaw −π/2，facing (sin,cos)=(−1,0)）
    R.check('%s 面向店面（ry %.2f，店在 %s 側＝要 %.2f；±25°）' % (tag, me['ry'], '西' if sx < 0 else '東', want), ang(me['ry'], want) < math.radians(25), J(me))
    R.check('%s 互動鍵是那一間（「看／進%s」）' % (tag, name), me['interact'] in ('看' + name, '進' + name), '畫面「%s」；店門互動點 %s' % (me['interact'], J(door)))


async def part_tzq_go(pg, cdp, errs):
    only = [n for n in (os.environ.get('ONLY') or '').split(',') if n]   # 雲端自檢用：只跑這幾筆（逗號分開；PC 佇列不用）
    for name in TZ9:
        if only and name not in only: continue
        tag = '[A2 %s]' % name
        await load(pg, cdp, 'gongguan', DAY, 14.0, *GG_START, why='（從公館商圈出發）')
        ql = await pg.evaluate(QL); sp = next((q['sp'] for q in ql if q['z'] == 'tingzhou' and q['name'] == name), None)
        row, jumps, me, b4 = await quick_go_row(pg, cdp, 'tingzhou', 'tingzhou', name, tag)
        if not me: continue
        geo = await pg.evaluate(TZGEO)
        await check_tz_spot(pg, name, me, sp, geo, tag)
        n = mins_of(row); jm = sum((b - a) for a, b in jumps) * 60
        R.check('%s 時間照清單扣：「約 %s 分鐘」，G.hour 跳了 %.1f 分鐘（±1）；前 %.3f → 後 %.3f' % (tag, n, jm, b4['h'], me['h']), n is not None and abs(jm - n) <= 1.0 and me['h'] - b4['h'] >= n / 60 - 0.02, J(jumps))
        await D.shot(pg, 'A2_%02d_%s' % (TZ9.index(name), name))
        await pg.wait_for_timeout(1500); me2 = await pg.evaluate(ME)
        R.check('%s 1.5 秒後沒有被推走（0.3 m 內）' % tag, math.hypot(me2['x'] - me['x'], me2['z'] - me['z']) < 0.3 and me2['zone'] == 'tingzhou', J(me2))
    # 同一區照距離：從巷子口讀清單，每一筆的分鐘數照 classes3d.js 的公式；按最遠那一間
    tag = '[A2 同區]'
    me0 = await load(pg, cdp, 'tingzhou', DAY, 14.0, None, None, why='（巷子口出生點；看同一區的分鐘數）')
    ql = [q for q in await pg.evaluate(QL) if q['z'] == 'tingzhou']
    await phone_places(pg, cdp); await open_area(pg, cdp, 'tingzhou')
    rows = [r for r in await pg.evaluate(ROWS) if r['area'] == 'tingzhou']; bad = []; far = None
    for q in ql:
        r = next((x for x in rows if x['name'] == q['name']), None); d = math.hypot(q['sp']['x'] - me0['x'], q['sp']['z'] - me0['z']); want = mins_by_dist(d)
        got = 0 if (r and '你在這裡' in r['st']) else mins_of(r)
        if got != want: bad.append({'name': q['name'], 'd': round(d, 1), 'want': want, 'got': got, 'st': r and r['st']})
        if r and r['place'] and (far is None or d > far[1]): far = (q['name'], d, want)
    R.note('%s 巷子口 (%.1f,%.1f) 看九筆：%s' % (tag, me0['x'], me0['z'], J([(r['name'], r['st'], r['btn']) for r in rows])))
    R.check('%s 九筆的分鐘數照距離（d<12＝你在這裡、否則 max(5, round((2+d/13)/5)×5)）' % tag, not bad and len(rows) == 9, J(bad))
    await L.close_panels(pg, cdp)
    if far:
        row, jumps, me, b4 = await quick_go_row(pg, cdp, 'tingzhou', 'tingzhou', far[0], '%s 最遠「%s」' % (tag, far[0]))
        if me:
            jm = sum((b - a) for a, b in jumps) * 60
            R.check('%s 按最遠的「%s」（%.1f m）：扣 %.1f 分鐘＝公式 %d（±1）' % (tag, far[0], far[1], jm, far[2]), abs(jm - far[2]) <= 1.0, J(jumps))
            sp = next((q['sp'] for q in ql if q['name'] == far[0]), None)
            await check_tz_spot(pg, far[0], me, sp, await pg.evaluate(TZGEO), '%s「%s」' % (tag, far[0]))


async def part_tzq_new(pg, cdp, errs):
    await load(pg, cdp, 'gongguan', DAY, 14.0, *GG_START, extra={'visited': {'dorm': True}}, why='（新存檔：GAME.defaults 的 visited 只有宿舍、沒去過汀州路）')
    k0 = await pg.evaluate("(()=>({known0:!!(PLACES.known0&&PLACES.known0.tingzhou), visited:GAME.G.visited||null}))()")
    await phone_places(pg, cdp); await open_area(pg, cdp, 'tingzhou')
    rows = [r for r in await pg.evaluate(ROWS) if r['area'] == 'tingzhou']
    R.note('[A3] PLACES.known0.tingzhou=%s（places.js：「和公館一樣一開始就知道」）；G.visited=%s' % (k0['known0'], J(k0['visited'])))
    R.note('[A3] 新存檔的汀州路九筆：%s' % J(rows))
    await pg.screenshot(path=os.path.join(OUT, 'A3_new_save_list.png'))
    R.check('[A3] 新存檔：汀州路九筆都顯示「還沒去過」、沒有前往按鈕（BB 的規格；和其他沒去過的店一樣）', len(rows) == 9 and all(r['st'].startswith('還沒去過') and not r['place'] for r in rows), J([(r['name'], r['st'], r['btn']) for r in rows]))
    await open_area(pg, cdp, 'gongguan')
    ref = next((r for r in await pg.evaluate(ROWS) if r['area'] == 'gongguan' and r['name'] == '公館燒臘'), None)
    R.note('[A3] 對照：同一個新存檔的「公館燒臘」（沒去過的店）＝%s' % J(ref))
    await L.close_panels(pg, cdp)
    btn = next((r for r in rows if r['place']), None)
    if btn:   # 有按鈕：照玩家按一次，記下會不會直接傳送
        _, jumps, me, b4 = await quick_go_row(pg, cdp, 'tingzhou', 'tingzhou', btn['name'], '[A3 按看看]')
        R.check('[A3] 新存檔按「%s」不能直接傳送到汀州路（BB 的規格）' % btn['name'], not me or me['zone'] != 'tingzhou', J(me))


async def part_tzq_old(pg, cdp, errs):
    await load(pg, cdp, 'gongguan', DAY, 14.0, *GG_START, why='（看公館那一區）')
    await phone_places(pg, cdp); await open_area(pg, cdp, 'gongguan')
    rows = [r for r in await pg.evaluate(ROWS) if r['area'] == 'gongguan']
    R.note('[A4] 公館那一區：%s' % J([r['name'] for r in rows]))
    R.check('[A4] 公館那一區的清單沒有泰米村食、洗樂洗衣坊、印得好', rows and not [r for r in rows if r['name'] in GG3], J([r['name'] for r in rows]))
    c = await pg.evaluate("(()=>{ const g=document.querySelector('#phoneBody [data-pmap=\"gongguan\"]'); if(!g) return null; const k=g.querySelector('circle')||g; k.scrollIntoView({block:'center'}); const r=k.getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2}; })()")
    if c: await L.touch_tap(cdp, c['x'], c['y']); await pg.wait_for_timeout(900)
    pr = [r for r in await pg.evaluate(ROWS) if r['pin'] == '公館']
    R.note('[A4] 點公館圖釘：%s' % J([r['name'] for r in pr]))
    R.check('[A4] 公館圖釘列出的地點沒有那三間', pr and not [r for r in pr if r['name'] in GG3], J([r['name'] for r in pr]))
    lm = await pg.evaluate("(()=>(PLACES.landmarks&&PLACES.landmarks.gongguan||[]).map(q=>q[0]))()")
    R.check('[A4] 大地圖的公館地名（PLACES.landmarks.gongguan）沒有那三間', not [n for n in lm if n in GG3], J(lm))
    await L.close_panels(pg, cdp)
    # 舊存檔：三間原本在公館店面街 G09～G11（zones3d.js 店面街 x 從 −68 起照寬度＋前 8 間 1.2 m 縫排：G09 洗樂 23.6～32.6、G10 印得好 32.6～41.6、G11 泰米 41.6～51.6；店門互動點 z FZ+2＝21、人行道 z 18）
    for nm, x in (('洗樂洗衣坊 G09', 28.1), ('印得好 G10', 37.1), ('泰米村食 G11', 46.6)):
        for z in (21.0, 18.0):
            tag = '[A4 舊存檔 %s (%.1f,%.1f)]' % (nm, x, z)
            me = await load(pg, cdp, 'gongguan', DAY, 14.0, x, z, math.pi, why='（舊格式存檔的 pos：三間還在公館時站的地方）')
            await pg.wait_for_timeout(2000); me2 = await pg.evaluate(ME)
            R.note('%s 讀進來 %s；2 秒後 %s' % (tag, J(me), J(me2)))
            sh = math.hypot(me['x'] - x, me['z'] - z)
            if sh > 0.1: R.note('%s 讀檔時被挪了 %.2f m（存的那一點在擋住的格子上，engine3d.js 出生點 E.unstick）' % (tag, sh))
            R.check('%s 讀得進來、在公館、站得住（讀檔挪動 ≤1 m）、之後 2 秒沒有被帶走（<0.3 m）' % tag, me2['zone'] == 'gongguan' and me2['free'] and me2['stand'] and sh <= 1.0 and math.hypot(me2['x'] - me['x'], me2['z'] - me['z']) < 0.3, J(me2))
            ok = await L.go_to(pg, cdp, R, x, 14.0, 0.8, '%s 點地面走到人行道 (%.1f,14)' % (tag, x), max_s=60)
            R.check('%s 走得動（點地面走到 (%.1f,14)）' % (tag, x), ok, J(await pg.evaluate(ME)))
    R.check('[A4] walkFallbacks 0', (await pg.evaluate("GAME.walkFallbacks|0")) == 0, '')


# ---------------------------------------------------------------- B：汀州路路人
def hh(h):
    h = h % 24; return '%02d%02d' % (int(h), int(round((h % 1) * 60)))


async def part_tzp_cnt(pg, cdp, errs):
    table = {}
    for q in QS:
        await set_q(pg, q)
        for h in TZP_HOURS:
            tag = '[B1 %s %s]' % (q, hh(h))
            await load(pg, cdp, 'tingzhou', DAY, h, 0.0, 6.0, 0.0, why='（路中間）')
            await pg.wait_for_timeout(2500)
            ex = await pg.evaluate(EXTRAS); exp = await pg.evaluate(TWCOUNT, {'h': h % 24, 'ty': False}); geo = await pg.evaluate(TZGEO)
            shots = []
            for lab, tz in (('N', -40.0), ('S', 40.0)):
                await L.turn_camera_to(pg, cdp, 0.0, tz); await pg.wait_for_timeout(900)
                vis = sum(1 for e in await pg.evaluate(EXTRAS) if e['vis'])
                m = await D.shot(pg, 'B1_%s_%s_%s' % (q, hh(h), lab)); shots.append({'dir': lab, 'vis': vis, 'lum': m})
            n = len(ex); table[(q, h)] = n
            R.note('%s 路人 %d（TINGZHOU_WALK.count %s）；兩張截圖看得到 %s；攤子 %s' % (tag, n, J(exp), J(shots), '擺' if geo['on'] else '收'))
            R.check('%s 路人數＝TINGZHOU_WALK.count（%s）' % (tag, exp and exp['n']), bool(exp) and n == exp['n'], J([e['id'] for e in ex]))
            if 17 <= h % 24 < 23:
                R.check('%s 夜市時段路人數＝BB 的 %d（畫質 %s）' % (tag, NIGHT_N.get(q, -1), q), n == NIGHT_N.get(q, -1), 'n=%d' % n)
            # B2 外型
            combos = {(e['model'], e['top'], e['bot'], e['hair']) for e in ex}
            R.note('%s 路人外型：%s' % (tag, J([{k: e[k] for k in ('id', 'model', 'sex', 'top', 'bot', 'hair', 'ht', 'bag', 'ws')} for e in ex])))
            R.note('%s 種類：底模 %d 種、上衣 %d、下身 %d、髮型 %d、整套 %d／%d 人' % (tag, len({e['model'] for e in ex}), len({e['top'] for e in ex}), len({e['bot'] for e in ex}), len({e['hair'] for e in ex}), len(combos), n))
            if n >= 2:
                R.check('%s 不是同一個人複製一排：整套外型（底模＋上衣＋下身＋髮型）%d 種／%d 人，而且底模至少 2 種' % (tag, len(combos), n), len(combos) == n and len({e['model'] for e in ex}) >= 2, '')
            # B3 靜態：這一刻的位置
            bad = [e for e in ex if not e['free'] or any(in_rect(e['x'], e['z'], s) for s in geo['stalls'])]
            R.check('%s 這一刻每個路人都在走得到的格子、不在攤子範圍' % tag, not bad, J(bad))
            if abs(h - 18.5) < 1e-6:
                c = await pg.evaluate(CLOSE, {'k': 3, 'label': '%s 汀州路 %s 畫質 %s：離玩家最近的三個路人（獨立鏡頭）' % (SHA[:9], hh(h), q)})
                if c and c['url']: save(c['url'], 'B2_close_%s_%s.jpg' % (q, hh(h))); R.note('%s 近圖 B2_close_%s_%s.jpg：%s' % (tag, q, hh(h), J({k: c[k] for k in ('who', 'cam', 'at')})))
                else: R.note('%s 沒有路人可以拍近圖' % tag)
    for q in QS:
        ns = {h: table.get((q, h)) for h in TZP_HOURS}
        night = [v for h, v in ns.items() if 17 <= h % 24 < 23 and v is not None]; other = [v for h, v in ns.items() if not (17 <= h % 24 < 23) and v is not None]
        if night and other:
            R.check('[B1 %s] 17～23 點最多：夜市時段 %s > 其他時段 %s' % (q, night, other), min(night) > max(other), J(ns))


async def part_tzp_walk(pg, cdp, errs):
    q = QS[0]; await set_q(pg, q)
    await load(pg, cdp, 'tingzhou', DAY, 18.5, 0.0, 6.0, 0.0, why='（路中間；觀察 60 秒）')
    await pg.wait_for_timeout(2000)
    geo = await pg.evaluate(TZGEO); nav = []
    track = {}; t0 = time.time(); N = int(os.environ.get('OBS_S') or 60)
    for k in range(N + 1):
        for e in await pg.evaluate(EXTRAS): track.setdefault(e['id'], []).append([round(time.time() - t0, 2), e['x'], e['z'], e['free'], e['pose'], e['vis']])
        await pg.wait_for_timeout(max(0, int(1000 * (k + 1) - (time.time() - t0) * 1000)))
    open(os.path.join(OUT, 'B3_tracks_%s.json' % q), 'w', encoding='utf-8').write(J(track))
    notfree, install, atdoor, tread, segs = [], [], [], [], []
    for pid, T in track.items():
        still = 0
        mvs = sorted(math.hypot(T[i][1] - T[i - 1][1], T[i][2] - T[i - 1][2]) for i in range(1, len(T)))
        med = mvs[len(mvs) // 2] if mvs else 0.0   # 這個人平常一秒走多少（雲端 SwiftShader 1～4 fps 時只有 0.1～0.2 m，「停下來」照這個比，不用固定的 m/s）
        stop_th, tread_th = min(0.15, 0.25 * med), min(0.05, 0.2 * med)
        for i, (t, x, z, fr, po, vis) in enumerate(T):
            if not fr: notfree.append([pid, t, x, z])
            st = [s['id'] for s in geo['stalls'] if in_rect(x, z, s)]
            if st: install.append([pid, t, x, z, st])
            if i == 0: continue
            mv = math.hypot(x - T[i - 1][1], z - T[i - 1][2])
            dd = min([math.hypot(x - d['x'], z - d['z']) for d in geo['doors']] or [99])
            if dd < 1.0 and mv < stop_th: atdoor.append([pid, t, round(dd, 2), round(mv, 3), round(med, 3)])
            still = still + 1 if mv < tread_th else 0
            if still >= 2: tread.append([pid, t, x, z, po])
            if mv > 0.02: segs.append([pid, t, T[i - 1][1], T[i - 1][2], x, z])
    # 兩次取樣之間的直線每 0.1 m 看一次導航格（一次送進瀏覽器算）
    sf = await pg.evaluate("(L=>{ const N=GAME.E.nav; return L.map(s=>{ const [a,b,c,d]=s, n=Math.max(1,Math.ceil(Math.hypot(c-a,d-b)/0.1)); for(let i=0;i<=n;i++){ const t=i/n; if(!N.free(a+(c-a)*t,b+(d-b)*t)) return false; } return true; }); })", [s_[2:] for s_ in segs]) if segs else []
    cross = [[s_[0], s_[1], s_[2:4], s_[4:6]] for s_, ok in zip(segs, sf) if not ok]
    R.note('[B3] %s 18:30 觀察 %d 秒、%d 個路人（軌跡 B3_tracks_%s.json）；每人移動總長 %s' % (q, N, len(track), q, J({p: round(sum(math.hypot(T[i][1] - T[i - 1][1], T[i][2] - T[i - 1][2]) for i in range(1, len(T))), 1) for p, T in track.items()})))
    R.check('[B3] 路人每一秒都在走得到的格子（沒有穿牆、沒有卡在機車／攤子／柱子裡）', not notfree, J(notfree[:12]))
    R.check('[B3] 路人沒有站在夜市攤的範圍', not install, J(install[:12]))
    R.check('[B3] 路人沒有停在店門互動點 1 m 內（1 m 內而且那一秒移動 < min(0.15 m, 自己每秒中位數的 1/4)）', not atdoor, J(atdoor[:12]))
    R.check('[B3] 沒有原地踏步（連續 2 秒每秒移動 < min(0.05 m, 自己每秒中位數的 1/5)）', not tread, J(tread[:12]))
    R.note('[B3] 兩次取樣之間的直線經過擋住的格子（可能是轉角切過去，不當判定）：%d 次 %s' % (len(cross), J(cross[:8])))
    R.check('[B3] 有路人可以觀察', len(track) > 0, '')


async def part_tzp_ty(pg, cdp, errs):
    q = QS[0]; await set_q(pg, q)
    d = await pg.evaluate(DAYOF, TY_DAY); ty = await pg.evaluate("(d=>!!(CALENDAR.typhoon&&CALENDAR.typhoon(d)))", d)
    R.check('[B4] 行事曆 %s 是颱風假（CALENDAR.typhoon）' % TY_DAY, ty, 'day %s' % d)
    res = {}
    for key, day, wx in (('平常日', DAY, 'clear'), ('颱風假', TY_DAY, 'rain')):
        await load(pg, cdp, 'tingzhou', day, 18.5, 0.0, 6.0, 0.0, extra={'weather': wx}, why='【捷徑】（%s 18:30、路中間）' % key)
        await pg.wait_for_timeout(4000)   # 攤位模型 tingzhou_stalls.glb 是 lazy 載入
        geo = await pg.evaluate(TZGEO); ex = await pg.evaluate(EXTRAS)
        await L.turn_camera_to(pg, cdp, 14.0, 0.0); await pg.wait_for_timeout(900)
        m = await D.shot(pg, 'B4_%s_alleyA' % ('typhoon' if key == '颱風假' else 'normal'))
        res[key] = {'on': geo['on'], 'closed': geo['closed'], 'open_vis': sum(1 for s in geo['stallVis'] if s['open']), 'closed_vis': sum(1 for s in geo['stallVis'] if s['closed']), 'loaded': sum(1 for s in geo['stallVis'] if s['open'] is not None), 'n': len(ex), 'lum': m}
        R.note('[B4] %s：%s' % (key, J(res[key])))
    a, b = res['平常日'], res['颱風假']
    R.check('[B4] 平常日 18:30 攤子擺出來（對照：tzStallsOn、看得到營業的攤）', a['on'] and (a['loaded'] == 0 or a['open_vis'] > 0), J(a))
    R.check('[B4] 颱風假 18:30 攤子收起來（tzStallsClosed、tzStallsOn false、營業的攤 0 個看得到）', b['closed'] and not b['on'] and b['open_vis'] == 0, J(b))
    R.check('[B4] 颱風假街上只剩一個路人', b['n'] == 1, J(b))
    if b['loaded'] == 0: R.note('[B4] 攤位模型沒載入（stallVis open 全是 null）：只驗了旗標，沒驗畫面')


async def part_tzp_fps(pg, cdp, errs):
    await set_q(pg, 'high')
    await load(pg, cdp, 'tingzhou', DAY, 18.5, 0.0, 6.0, 0.0, why='（高畫質、路中間 18:30）')
    await pg.wait_for_timeout(3000)
    fps = await pg.evaluate(FPS8, 8000); ex = await pg.evaluate(EXTRAS)
    R.note('[B5] 高畫質 18:30 路中間 8 秒：%s fps（路人 %d、NPC 共 %d；Playwright，不是 iPhone；雲端 SwiftShader 不當結論）' % (fps, len(ex), await pg.evaluate("(GAME.E.npcs||[]).length")))
    await D.shot(pg, 'B5_high_1830')


# ---------------------------------------------------------------- C：溫州街快速前往
WZ_TIMES = r"""(names=>{ const PL=PLACES.quickList().filter(Boolean); const days=[]; for(let d=0;d<4000;d++){ let k; try{ k=CALENDAR.dateOf(d).key; }catch(e){ continue; } if(k>='2025-09-17'&&k<='2025-09-30') days.push(d); }
  const out={}; for(const nm of names){ const pl=PL.find(q=>q[1]===nm); if(!pl){ out[nm]=null; continue; } const hz=pl[3]||pl[0]; let hit=null;
    for(const d of days){ for(let h=10;h<=22&&!hit;h+=0.5){ let ok=true; try{ ok=PLACES.isOpen(hz,h,d)&&PLACES.isOpen(hz,h+0.75,d); }catch(e){} if(ok) hit={d,h,key:CALENDAR.dateOf(d).key}; } if(hit) break; }
    out[nm]=Object.assign({zone:pl[0],sp:pl[2]||null,hz:pl[3]||null},hit||{d:null}); } return out; })"""


async def part_wzq(pg, cdp, errs):
    me = await load(pg, cdp, 'xinsheng', DAY, 14.0, None, None, extra={'visited': WZ_VISIT}, why='【捷徑】（新生南路側門進來的地方；visited 有溫州街那幾家店）')
    await phone_places(pg, cdp); await open_area(pg, cdp, 'wenzhou')
    rows = [r for r in await pg.evaluate(ROWS) if r['area'] == 'wenzhou']; names = [r['name'] for r in rows if r['name'] != '溫州街']
    miss = [n for n in WZ11 if n not in names]
    await pg.screenshot(path=os.path.join(OUT, 'C_wenzhou_list.png'))
    R.note('[C] %s 溫州街那一區：%d 筆 %s' % (SHA[:9], len(rows), J([(r['name'], r['st'], r['btn']) for r in rows])))
    R.note('[C] 店 %d 間（不算「溫州街」本身）；少 %d 間：%s；多出來的：%s' % (len(names), len(miss), J(miss), J([n for n in names if n not in WZ11])))
    R.check('[C] 快速前往列出溫州街全部 11 間', not miss, '少 %s' % J(miss))
    await L.close_panels(pg, cdp)
    times = await pg.evaluate(WZ_TIMES, WZ11)
    only = [n for n in (os.environ.get('ONLY') or '').split(',') if n]
    for name in WZ11:
        if only and name not in only: continue
        tag = '[C %s]' % name; t = times.get(name)
        if name in miss or not t:
            R.note('%s 這一版沒有這一筆，跳過' % tag); continue
        if t.get('d') is None:
            R.check('%s 9/17～9/30 找得到開門的時間' % tag, False, J(t)); continue
        key = t['key']
        await load(pg, cdp, 'xinsheng', key, t['h'], None, None, extra={'visited': WZ_VISIT}, why='【捷徑】（%s 開門的時間；從新生南路出發）' % name)
        row, jumps, me, b4 = await quick_go_row(pg, cdp, 'wenzhou', t['zone'], name, tag)
        if not me:
            R.check('%s 有前往按鈕、按得到' % tag, False, J(row)); continue
        zsp = await pg.evaluate("(()=>{ const s=GAME.E.zone&&GAME.E.zone.spawn; return s?{x:s.x,z:s.z,yaw:s.yaw||0}:null; })()")
        sp = t['sp'] or zsp
        R.check('%s 到「%s」這一區' % (tag, t['zone']), me['zone'] == t['zone'], J(me))
        R.check('%s 落在清單的落點%s (%s,%s)（0.5 m 內）' % (tag, '' if t['sp'] else '（null＝區域出生點）', sp and sp['x'], sp and sp['z']), bool(sp) and math.hypot(me['x'] - sp['x'], me['z'] - sp['z']) < 0.5, J(me))
        R.check('%s 站得住（E.nav.free、E.canStand 0.3）' % tag, bool(me['free']) and bool(me['stand']), J(me))
        if sp and sp.get('yaw') is not None:
            R.check('%s 面向和落點的 yaw 一樣（±25°）' % tag, ang(me['ry'], sp['yaw']) < math.radians(25), 'ry %.3f yaw %.3f' % (me['ry'], sp['yaw']))
        if name in WZ_WIN:
            R.check('%s 互動鍵是那一家（%s）' % (tag, '／'.join(WZ_WIN[name])), me['interact'] in WZ_WIN[name], '畫面「%s」' % me['interact'])
        else:
            other = [n for n in WZ11 if n != name and n in me['interact']]
            R.check('%s 互動鍵不是別家（「%s」）' % (tag, me['interact']), not other, J(other))
        n = mins_of(row); jm = sum((b - a) for a, b in jumps) * 60
        R.check('%s 時間照清單扣：「約 %s 分鐘」，G.hour 跳了 %.1f 分鐘（±1）' % (tag, n, jm), n is not None and abs(jm - n) <= 1.0, J(jumps))
        await D.shot(pg, 'C_%02d_%s' % (WZ11.index(name), re.sub(r'[^0-9A-Za-z一-鿿]', '_', name)))


async def main():
    print('CC TZQ／TZP／WZQ：SHA %s PARTS %s Q %s；Playwright ≠ iPhone' % (SHA[:9], ','.join(PARTS), ','.join(QS)), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); print('FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True); return
        has_tz = await pg.evaluate("typeof TINGZHOU_LAYOUT!=='undefined'&&!!(Z3.ZONES&&Z3.ZONES.tingzhou)")
        for part, fn in (('TZQ_MAP', part_tzq_map), ('TZQ_GO', part_tzq_go), ('TZQ_NEW', part_tzq_new), ('TZQ_OLD', part_tzq_old),
                         ('TZP_CNT', part_tzp_cnt), ('TZP_WALK', part_tzp_walk), ('TZP_TY', part_tzp_ty), ('TZP_FPS', part_tzp_fps), ('WZQ', part_wzq)):
            if part not in PARTS: continue
            if part.startswith('TZ') and not has_tz: R.check('[%s] 這一版有汀州路' % part, False, ''); continue
            print('== %s' % part, flush=True); e0 = len(errs)
            try: await fn(pg, cdp, errs)
            except Exception as e: R.check('[%s] 沒有中斷' % part, False, repr(e)[:300])
            R.check('[%s] 沒有 JS 例外' % part, len(errs) == e0, J(errs[e0:e0 + 3]))
            try: await L.close_panels(pg, cdp)
            except Exception: pass
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
