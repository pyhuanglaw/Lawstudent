"""CC-C（帳號 C）11-05：12cb1426c 那一批（BB-C 08:05 第 3～5 點＋快速前往截圖）——先用 12cb1426c 跑，V21R 拿到最終 SHA 再跑一次。
  PARTS（預設全部）：
    afar     AFAR-VIEW-1105（a86f2b105）：afar 窗外的公館街景，白天 14:00、晚上 21:00 各拍（不判）；記窗景卡用的照片（期望照 commit f65f20f4a：白天 afar_view_day、晚上 afar_view_night）。
    qt       QUICK-TRAVEL-AREAS-1105＋XS-PHONEMAP-1105（7073683ed）：手機「地點」頁兩層（一開始只展開所在地區；點「新生南路」地區看得到七間店）、地點地圖上新生南路的圖釘——截圖（橫、直）；
             判：一次只展開一個地區（aria-expanded 只有一個 true）、新生南路地區點開後有七間店（PLACES 新生南路那七間：大口、南洋、山嵐、同弦、大步、好拍、運動廣場）。
    wake     WAKE-AT-DOOR-1105（2dd9d1bd9）：宿舍晚上照玩家走到床邊「睡覺」→ 隔天早上醒來直接站在房門口（「走出房間」往房間裡 1 m 內、面向門）、站得住、推得動、照玩家走得出房間。
    journal  JOURNAL-DATES-1105（85fb5ef9b）：使用者的存檔（遊戲 repo tests/fixtures/user_save_day37_1105.json）打開選單「日誌」，點 10/21、10/22：
             10/21 有「HH:MM 和（以安）約在新體育館羽球場」、10/22 最上面兩行是和溫書瑀的兩個約（總圖、afar café）（使用者 11-05 09:0x 原話＋commit 85fb5ef9b）。截圖。
    maphours MAP-HOURS-OVERLAP-1105（a17515abc）：公館 14:00 從手機打開大地圖，截圖給 BB 看營業時間有沒有蓋到店名（不判，canvas 只能看圖）。
    fgo      FGO-COUNTER-1105（5b054e9b7）：使用者的存檔、10/23 19:30（芷若在兩點半 Café 吧台後面上班），手機「朋友」→ 芷若「直接過去」：
             ① 從溫州街（別的區域）② 從 Café 門口（同一區）。落點不在吧台裡：站得住、推得動、照玩家走得到 Café 的出口；離芷若 3.6 m 內（commit 5b054e9b7：1.1～3.5 m）。
  【前置／捷徑】讀檔指定地點時間（條件事件關閉）；fgo、journal 讀使用者的存檔後改時間地點。Windows＋GPU／SwiftShader ≠ iPhone。
用法：LW_TESTS=<wt>/tests [PARTS=afar,qt,wake,journal,maphours,fgo] python3 cc_v12cb_probe.py <url> <out>"""
import os, sys, json, asyncio, math, time, re
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
import cc_d141_lib as D
import cc_phone
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = D.J
PARTS = [x for x in (os.environ.get('PARTS') or 'afar,qt,wake,journal,maphours,fgo').split(',') if x]
R = L.Run('v12cb', OUT); D.setup(R, OUT)
DAY = '2025-10-18'
FIX = 'tests/fixtures/user_save_day37_1105.json'   # 遊戲 repo 裡的使用者存檔（不複製到 cc-testing）
XS7 = ['大口', '南洋', '山嵐', '同弦', '大步', '好拍', '運動廣場']
UIQ = r"""(()=>({dlg:!!(GAME.D&&GAME.D.active), opts:[...document.querySelectorAll('#choices button')].filter(b=>b.offsetParent!==null).map(b=>(b.innerText||'').trim()), busy:!!GAME.E.player.busy, day:GAME.G.day, hour:+(+GAME.G.hour).toFixed(2), zone:GAME.G.zone}))()"""


async def load_fixture(pg, cdp, zone=None, hour=None, day=None, pos=None, wait=6000):
    sv = await pg.evaluate("fetch(%s).then(r=>r.ok?r.json():null)" % J(FIX))
    if not sv: return None
    if zone: sv['zone'] = zone; sv.pop('pos', None)
    if pos: sv['pos'] = pos
    if hour is not None: sv['hour'] = hour
    if day is not None: sv['day'] = day
    R.setup('讀使用者的存檔 %s（改成 %s %s %s）' % (FIX, zone or sv['zone'], day if day is not None else sv['day'], hour if hour is not None else sv['hour']))
    await pg.evaluate("(async(s)=>{ document.getElementById('titleScreen').classList.add('hide'); const rot=document.getElementById('rotate'); if(rot) rot.classList.remove('want'); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}; await GAME.applySave(s); })", sv)
    await pg.wait_for_timeout(wait); await L.close_panels(pg, cdp)
    return await D.st(pg)


async def open_phone(pg, cdp, tab):
    await L.close_panels(pg, cdp)
    ok1 = await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1200)
    ok2 = await L.tap(pg, cdp, '#phoneTabs [data-ptab="%s"]' % tab); await pg.wait_for_timeout(1200)
    return ok1 and ok2


# ---------- afar ----------
VIEWCAM = r"""(()=>{ const E=GAME.E, z=E.zone; let m=null; z.group.traverse(o=>{ if(!m&&o.isMesh&&/VIEW/.test(o.name)) m=o; }); if(!m) return null;
  m.updateWorldMatrix(true,false); const b=new THREE.Box3().setFromObject(m), c=b.getCenter(new THREE.Vector3()), s=b.getSize(new THREE.Vector3()); const sp=z.spawn||{x:0,z:0};
  const mat=[].concat(m.material)[0], url=(mat&&mat.map&&mat.map.userData&&mat.map.userData.url)||'';
  return {name:m.name, c:[+c.x.toFixed(2),+c.y.toFixed(2),+c.z.toFixed(2)], size:[+s.x.toFixed(2),+s.y.toFixed(2),+s.z.toFixed(2)], spawn:[sp.x,sp.z], url, color:mat&&mat.color?+mat.color.r.toFixed(2):null}; })()"""


async def part_afar(pg, cdp):
    for hh, tn, want in ((14.0, 'day', 'afar_view_day'), (21.0, 'night', 'afar_view_night')):
        R.setup('讀檔 afar %s %05.2f（出生點）' % (DAY, hh))
        s = await D.load_zone(pg, cdp, 'afar', DAY, hh, wait=8000)
        if not R.check('[afar %s] 讀到 afar' % tn, s['zone'] == 'afar', J(s)): continue
        for _ in range(20):   # 進門的旁白、店員那一句先點掉（截圖不要有對話框）
            q = await D.st(pg)
            if not q['dlg'] and not q['busy']: break
            if q['dlg']: await L.tap(pg, cdp, '#dlg')
            await pg.wait_for_timeout(500)
        v = None
        for _ in range(20):
            v = await pg.evaluate(VIEWCAM)
            if v and v['url']: break
            await pg.wait_for_timeout(500)
        R.note('[afar %s] 窗景卡：%s' % (tn, J(v)))
        R.check('[afar %s] 窗景卡用的是 %s（commit f65f20f4a）' % (tn, want), bool(v) and want in v['url'], J(v and v['url']))
        if not v: continue
        c, sz, sp = v['c'], v['size'], v['spawn']
        thin = 'x' if sz[0] < sz[2] else 'z'   # 窗景卡是一片：薄的那一軸＝法線
        if thin == 'x': d = 1 if sp[0] > c[0] else -1; eye = [c[0] + d * 7.0, 1.55, c[2]]; eye2 = [c[0] + d * 4.0, 1.25, c[2] + 2.0]
        else: d = 1 if sp[1] > c[2] else -1; eye = [c[0], 1.55, c[2] + d * 7.0]; eye2 = [c[0] + 2.0, 1.25, c[2] + d * 4.0]
        await D.user_shot(pg, cdp, 'afar_view_%s' % tn, {'eye': eye, 'look': [c[0], 1.6, c[2]], 'lens': 24})
        await D.user_shot(pg, cdp, 'afar_view_seat_%s' % tn, {'eye': eye2, 'look': [c[0], 1.5, c[2]], 'lens': 28})
        await D.user_shot(pg, cdp, 'afar_view_player_%s' % tn, {'eye': [sp[0], 1.6, sp[1]], 'look': [c[0], 1.6, c[2]], 'lens': 24})


# ---------- qt ----------
async def part_qt(pg, cdp):
    s = await load_fixture(pg, cdp, zone='campus', hour=14.0)
    if not R.check('[qt] 讀使用者的存檔到校園', bool(s) and s['zone'] == 'campus', J(s)): return
    for orient, vp in (('land', (844, 390)), ('port', (390, 844))):
        await pg.set_viewport_size({'width': vp[0], 'height': vp[1]}); await pg.wait_for_timeout(1200)
        await pg.evaluate("(()=>{ const r=document.getElementById('rotate'); if(r) r.classList.remove('want'); })()")
        ok = await open_phone(pg, cdp, 'places')
        areas = await pg.evaluate(cc_phone.AREAS)
        on = [a['id'] for a in areas if a['on']]
        R.note('[qt %s] 地點頁的地區：%s' % (orient, J(areas)))
        R.check('[qt %s] 手機「地點」打得開、分地區、一開始只展開一個（所在的地區）' % orient, ok and len(areas) >= 2 and len(on) == 1, J({'areas': len(areas), 'on': on}))
        await pg.screenshot(path=os.path.join(OUT, 'qt_%s_0_start.png' % orient))
        xs = next((a['id'] for a in areas if 'xinsheng' in a['id'] or '新生' in a['id']), None)
        if not xs:
            names = await pg.evaluate("[...document.querySelectorAll('#phoneBody [data-parea]')].map(b=>[b.dataset.parea,(b.innerText||'').trim().slice(0,20)])")
            xs = next((n[0] for n in names if '新生' in n[1]), None)
        if not R.check('[qt %s] 有「新生南路」地區' % orient, bool(xs), J(areas)): await L.close_panels(pg, cdp); continue
        await L.tap(pg, cdp, '#phoneBody [data-parea="%s"]' % xs); await pg.wait_for_timeout(900)
        rows = await pg.evaluate("[...document.querySelectorAll('#phoneBody .phrow')].map(r=>{ const b=r.querySelector('[data-place]'); return (((r.firstElementChild&&r.firstElementChild.firstChild&&r.firstElementChild.firstChild.textContent)||'').trim())+(b?' ['+b.dataset.place+']':' [沒有前往]'); })")
        areas2 = await pg.evaluate(cc_phone.AREAS)
        miss = [n for n in XS7 if not any(n in r for r in rows)]
        R.check('[qt %s] 點「新生南路」：只展開它、看得到七間店（%s；店沒去過可以沒有「前往」，只看列出來）' % (orient, '、'.join(XS7)), [a['id'] for a in areas2 if a['on']] == [xs] and not miss, J({'miss': miss, 'rows': rows}))
        await pg.evaluate("(()=>{ const e=document.querySelector('#phoneBody [data-parea=\"%s\"]'); if(e) e.scrollIntoView({block:'start'}); })()" % xs); await pg.wait_for_timeout(500)
        await pg.screenshot(path=os.path.join(OUT, 'qt_%s_1_xinsheng.png' % orient))
        svg = await pg.evaluate("(()=>{ const s=document.querySelector('#phoneBody [data-pmapsvg]'); if(!s) return null; s.scrollIntoView({block:'center'}); return s.dataset.pmapsvg; })()")
        await pg.wait_for_timeout(500); await pg.screenshot(path=os.path.join(OUT, 'qt_%s_2_map.png' % orient))
        pins = await pg.evaluate("(()=>typeof PLACEMAP!=='undefined'?PLACEMAP.PINS.filter(p=>/xs_|xinsheng/.test(p.id+'|'+(p.zone||''))).map(p=>[p.id,p.name||p.label||'']):null)()")
        R.note('[qt %s] 地點地圖（data-pmapsvg=%s）新生南路的圖釘：%s' % (orient, J(svg), J(pins)))
        R.check('[qt %s] 地點地圖上有新生南路的圖釘' % orient, bool(pins), J(pins))
        await L.close_panels(pg, cdp)
    await pg.set_viewport_size({'width': 844, 'height': 390}); await pg.wait_for_timeout(1000)


# ---------- wake ----------
async def part_wake(pg, cdp):
    R.setup('讀檔宿舍 %s 23:00（出生點）' % DAY)
    s = await D.load_zone(pg, cdp, 'dorm', DAY, 23.0, wait=6000)
    if not R.check('[wake] 讀到宿舍', s['zone'] == 'dorm', J(s)): return
    d0 = await pg.evaluate("GAME.G.day")
    bed = await pg.evaluate("(()=>{ const i=GAME.E.interactables.find(i=>!i.hidden&&/^睡覺/.test(i.label||'')); return i?{x:i.x,z:i.z,r:i.radius||1,label:i.label}:null; })()")
    if not R.check('[wake] 房間裡有「睡覺」', bool(bed), J(bed)): return
    tgt = await D.standable_near(pg, bed['x'], bed['z'], 0.3)   # 床邊那一點本身（0.54 m 外是「收拾背包回家」那一格）
    await L.go_to(pg, cdp, R, tgt['x'], tgt['z'], 0.1, '[wake] 床邊', max_s=120); q = await D.settle(pg)
    for _ in range(6):
        if q['interact'].startswith('睡覺'): break
        await pg.wait_for_timeout(500); q = await D.st(pg)
    R.check('[wake] 走到床邊，互動按鈕是「睡覺」', q['interact'].startswith('睡覺'), J(q))
    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
    t0 = time.time(); woke = None
    while time.time() - t0 < 180:
        u = await pg.evaluate(UIQ)
        if u['opts']:
            k = next((i for i, t in enumerate(u['opts']) if t.startswith('睡') or t.startswith('好')), 0)
            await pg.evaluate("(k=>{ const b=[...document.querySelectorAll('#choices button')].filter(b=>b.offsetParent!==null)[k]; if(b) b.click(); })(%d)" % k); await pg.wait_for_timeout(800); continue
        if u['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(400); continue
        if u['day'] > d0 and u['hour'] < 12 and not u['busy']: woke = u; break
        await pg.wait_for_timeout(500)
    if not R.check('[wake] 睡到隔天早上（醒來、不忙）', bool(woke), J(await pg.evaluate(UIQ))): return
    # 醒來那一段（STORY 的 wakePlace → 躺一下 → wakeUp → getUp）跑完：不是躺著、沒有 _bedBusy、沒有 _bed.waking，連續 2 秒（雲端 12cb 第一次只等 1.5 秒＝還躺在床上就量了）
    BED = "(()=>({pose:GAME.E.player.pose||null, busy:!!GAME.E.player.busy, bb:!!STORY._bedBusy, waking:!!(STORY._bed&&STORY._bed.waking), y:+GAME.E.player.obj.position.y.toFixed(2), dlg:!!(GAME.D&&GAME.D.active), dt:GAME.D&&GAME.D.active?((document.getElementById('dlgText')||document.getElementById('dlg')||{}).innerText||'').slice(0,40):''}))()"
    t0 = time.time(); ok_n = 0; trail = []; said = []
    while time.time() - t0 < 40:
        b2 = await pg.evaluate(BED)
        if b2['dlg']:   # 早上的旁白（照玩家點掉）
            if b2['dt'] and (not said or said[-1] != b2['dt']): said.append(b2['dt'])
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(400); continue
        u2 = await pg.evaluate(UIQ)
        if u2['opts']: said.append('選項 ' + J(u2['opts'])); await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#choices button')].filter(b=>b.offsetParent!==null)[0]; if(b) b.click(); })()"); await pg.wait_for_timeout(600); continue
        if not trail or trail[-1][1:] != [b2['pose'], b2['busy'], b2['bb'], b2['waking'], b2['y'], b2['dlg']]: trail.append([round(time.time() - t0, 1), b2['pose'], b2['busy'], b2['bb'], b2['waking'], b2['y'], b2['dlg']])
        ok_n = ok_n + 1 if (b2['pose'] != 'lie' and not b2['busy'] and not b2['bb'] and not b2['waking']) else 0
        if ok_n >= 8: break
        await pg.wait_for_timeout(250)
    R.note('[wake] 醒來那一段（秒、pose、忙、_bedBusy、waking、y、對話）：%s；點掉的對話：%s' % (J(trail), J(said)))
    R.check('[wake] 醒來那一段 40 秒內跑完（不是一直躺在床上）', ok_n >= 8, J(trail[-3:]))
    w = await pg.evaluate("""(()=>{ const E=GAME.E, P=E.player.obj, ds=STORY.doorStand?STORY.doorStand(E):null, ex=E.interactables.find(i=>i.exit&&i.exit.to==='dorm_hall');
      return {x:+P.position.x.toFixed(2), z:+P.position.z.toFixed(2), yaw:+P.rotation.y.toFixed(2), ds, ex:ex?{x:ex.x,z:ex.z,label:ex.label}:null, flag:STORY.WAKE_AT_DOOR,
        stand:E.canStand(P.position.x,P.position.z,0.3,0), y:+P.position.y.toFixed(2)}; })()""")
    R.note('[wake] 醒來：%s' % J(w))
    await D.shot(pg, 'wake_door_1')
    ex = w['ex']
    dex = math.hypot(w['x'] - ex['x'], w['z'] - ex['z']) if ex else 99
    face = math.atan2(ex['x'] - w['x'], ex['z'] - w['z']) if ex else 0
    dyaw = abs((w['yaw'] - face + math.pi) % (2 * math.pi) - math.pi)
    R.check('[wake] 醒來直接站在房門口：離「%s」%.2f m（≤1.9 m，commit 2dd9d1bd9：往房間裡 1 m）、在地上、站得住' % (ex and ex['label'], dex), bool(ex) and dex <= 1.9 and abs(w['y']) < 0.05 and w['stand'], J(w))
    R.check('[wake] 面向門（差 %.0f° ≤ 30°）' % math.degrees(dyaw), dyaw <= math.radians(30), J(w))
    q0 = await D.st(pg)
    R.note('[wake] 醒來站的那一點，互動按鈕是「%s」（雲端 12cb：0,2.3～0,2.5 是「收拾背包回家」、0,2.6 才是「走出房間」——給 BB 看要不要算）' % q0['interact'])
    mv = await D.pushable(pg, cdp)
    R.check('[wake] 推得動（搖桿 ≥0.3 m）', mv >= 0.3, J(mv))
    if not ex: return
    tgt = await D.standable_near(pg, ex['x'], ex['z'], 0.6)   # 門口那一側（出口範圍 1.4 m 的前 0.6 m）
    await L.go_to(pg, cdp, R, tgt['x'], tgt['z'], 0.12, '[wake] 房門', max_s=120); q = await D.settle(pg)
    R.check('[wake] 照玩家走到房門，互動按鈕是「%s」' % ex['label'], q['interact'].startswith(ex['label']), J(q))
    if q['interact'].startswith(ex['label']):
        await L.tap(pg, cdp, '#interact'); q = await D.wait_zone(pg, cdp, 'dorm_hall'); await pg.wait_for_timeout(2000); q = await D.st(pg)
        R.check('[wake] 按下去走出房間（到 dorm_hall、站得住）', q['zone'] == 'dorm_hall' and q['stand'], J(q))


# ---------- journal ----------
async def part_journal(pg, cdp):
    s = await load_fixture(pg, cdp)
    if not R.check('[journal] 讀使用者的存檔（day37 10/23 宿舍）', bool(s) and s['zone'] == 'dorm', J(s)): return
    await L.close_panels(pg, cdp)
    ok = await L.tap(pg, cdp, '#btnMenu'); await pg.wait_for_timeout(1500)
    ok2 = await L.tap(pg, cdp, '.tabs button[data-tab="journal"]'); await pg.wait_for_timeout(1200)
    R.check('[journal] 選單「日誌」打得開', ok and ok2 and await pg.evaluate("!!document.querySelector('#tab-journal.on #journalBox .jrTop')"))
    hs = '和(沈以安|以安|小安)約在新體育館羽球場'
    for key, tn in (('2025-10-21', '1021'), ('2025-10-22', '1022')):
        d = await pg.evaluate("STORY.dayOfKey('%s')" % key)
        hit = await L.tap(pg, cdp, '#journalBox [data-jrday="%d"]' % d); await pg.wait_for_timeout(900)
        lines = await pg.evaluate("[...document.querySelectorAll('#journalBox .jrDay > div')].map(e=>(e.innerText||'').replace(/^·\\s*/,'').trim())")
        R.note('[journal %s] 點了那一格（%s）：%s' % (key, hit, J(lines)))
        await pg.screenshot(path=os.path.join(OUT, 'journal_%s.png' % tn))
        if tn == '1021':
            R.check('[journal 10/21] 有「HH:MM 和以安約在新體育館羽球場」', any(re.match(r'^\d\d:\d\d ' + hs + '$', t) for t in lines), J(lines))
        else:
            ia = next((i for i, t in enumerate(lines) if re.search(r'和.+約在總圖', t)), None); ib = next((i for i, t in enumerate(lines) if re.search(r'和.+約在 afar café', t)), None)
            R.check('[journal 10/22] 最上面兩行是和溫書瑀的兩個約（總圖、afar café），照時間排', ia == 0 and ib == 1, J(lines))
    await L.close_panels(pg, cdp)
    await pg.evaluate("(()=>{ const b=[...document.querySelectorAll('#menu button')].find(b=>/返回/.test(b.innerText||'')); if(b) b.click(); })()"); await pg.wait_for_timeout(800)


# ---------- maphours ----------
async def part_maphours(pg, cdp):
    for zone, hh in (('gongguan', 14.0), ('wenzhou', 14.0)):
        R.setup('讀檔 %s %s %05.2f（出生點）' % (zone, DAY, hh))
        s = await D.load_zone(pg, cdp, zone, DAY, hh, wait=6000)
        ok = await open_phone(pg, cdp, 'places')
        b = await L.tap(pg, cdp, '#phoneBody [data-bigmap]'); await pg.wait_for_timeout(2000)
        opened = await pg.evaluate("!document.getElementById('bigmap').classList.contains('hide')")
        R.check('[maphours %s] 從手機打開大地圖' % zone, ok and b and opened, J({'zone': s['zone'], 'btn': b}))
        await pg.screenshot(path=os.path.join(OUT, 'maphours_%s.png' % zone))
        await L.tap(pg, cdp, '#bmClose'); await pg.wait_for_timeout(800); await L.close_panels(pg, cdp)


# ---------- fgo ----------
async def fgo_once(pg, cdp, tag, zone, pos=None):
    s = await load_fixture(pg, cdp, zone=zone, hour=19.5, pos=pos)
    if not R.check('%s 讀使用者的存檔到 %s 19:30' % (tag, zone), bool(s) and s['zone'] == zone, J(s)): return
    work = await pg.evaluate("STORY.ladWorking(GAME.G,'heroine_02')")
    R.check('%s 這時候芷若在兩點半 Café 上班（STORY.ladWorking）' % tag, bool(work), J(work))
    ok = await open_phone(pg, cdp, 'friends')
    btn = await pg.evaluate("!!document.querySelector('#phoneBody [data-fgo=\"heroine_02\"]')")
    if not R.check('%s 手機「朋友」有芷若的「直接過去」' % tag, ok and btn, J({'ok': ok, 'btn': btn})): await L.close_panels(pg, cdp); return
    await L.tap(pg, cdp, '#phoneBody [data-fgo="heroine_02"]')
    t0 = time.time(); tl = []; last = None
    while time.time() - t0 < 30:   # 時間軸（診斷）：換區域、芷若出現在 GAME.npc 的先後
        q = await pg.evaluate("(()=>{ const n=GAME.npc&&GAME.npc.heroine_02, P=GAME.E.player.obj.position; return {zone:GAME.G.zone, busy:!!GAME.E.player.busy, zr:!!(n&&n.obj), me:[+P.x.toFixed(1),+P.z.toFixed(1)]}; })()")
        k = (q['zone'], q['busy'], q['zr'], tuple(q['me']))
        if k != last: tl.append([round(time.time() - t0, 1)] + list(k)); last = k
        if q['zone'] == 'cafe' and not q['busy'] and time.time() - t0 > 3: break
        await pg.wait_for_timeout(150)
    R.note('%s 按下去的時間軸（秒、區域、忙、芷若在不在 GAME.npc、玩家位置）：%s' % (tag, J(tl)))
    await pg.wait_for_timeout(2500); await L.close_panels(pg, cdp)
    q = await D.st(pg)
    z = await pg.evaluate("""(()=>{ const E=GAME.E, P=E.player.obj.position, n=GAME.npc&&GAME.npc.heroine_02, ex=E.interactables.find(i=>i.exit&&!i.hidden);
      let t=null; if(ex) for(let rr=0;rr<=(ex.radius||1)*0.6&&!t;rr+=0.1) for(let a=0;a<360&&!t;a+=15){ const x=ex.x+rr*Math.sin(a*Math.PI/180), z=ex.z+rr*Math.cos(a*Math.PI/180); if(E.canStand(x,z,0.3,ex.lv|0)) t=[x,z]; }   /* 出口那一點在門框裡站不住：走到範圍裡站得住的那一點 */
      const r=t&&E.simWalk?E.simWalk(P.x,P.z,t[0],t[1],{lv0:E.player.lv|0,lv1:ex.lv|0,dt:1/15}):null;
      return {me:[+P.x.toFixed(2),+P.z.toFixed(2)], zr:n&&n.obj?[+n.obj.position.x.toFixed(2),+n.obj.position.z.toFixed(2)]:null, ex:ex?{label:ex.label,x:ex.x,z:ex.z,to:ex.exit.to}:null, sim:r?{ok:!!r.ok,to:t}:null}; })()""")
    dz = math.hypot(z['me'][0] - z['zr'][0], z['me'][1] - z['zr'][1]) if z['zr'] else 99
    R.note('%s 直接過去以後：%s；離芷若 %.2f m' % (tag, J(z), dz))
    await D.shot(pg, 'fgo_%s' % zone)
    R.check('%s 到了兩點半 Café、站得住、離芷若 3.6 m 內（commit 5b054e9b7：1.1～3.5 m）' % tag, q['zone'] == 'cafe' and q['stand'] and dz <= 3.6, J({'st': q, 'd': round(dz, 2)}))
    R.check('%s 從落點走得到 Café 的出口（E.simWalk）' % tag, bool(z['sim'] and z['sim']['ok']), J(z))
    mv = await D.pushable(pg, cdp)
    R.check('%s 推得動（搖桿 ≥0.3 m；不在吧台裡卡住）' % tag, mv >= 0.3, J(mv))
    if z['ex']: await D.use_exit(pg, cdp, tag, z['ex']['label'][:3], z['ex']['to'])


async def part_fgo(pg, cdp):
    await fgo_once(pg, cdp, '[fgo ① 溫州街]', 'wenzhou')
    await fgo_once(pg, cdp, '[fgo ② Café 門口]', 'cafe')


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC V12CB（afar 窗景、快速前往兩層、起床站門口、日誌寫約會、大地圖營業時間、直接過去不進吧台）：SHA=%s（worktree 實際 %s）；PARTS=%s；Windows＋GPU／SwiftShader ≠ iPhone' % (os.environ.get('SHA', '?'), real or '?', PARTS), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, 20261105)
        await pg.goto(URL); ok = await L.wait_loaded(pg); R.check('遊戲載入', ok, '')
        if not ok: await b.close(); sys.exit(1)
        await pg.evaluate("localStorage.clear()")
        for nm, fn in (('afar', part_afar), ('qt', part_qt), ('wake', part_wake), ('journal', part_journal), ('maphours', part_maphours), ('fgo', part_fgo)):
            if nm not in PARTS: continue
            print('== %s' % nm, flush=True)
            try: await fn(pg, cdp)
            except Exception as ex: R.check('[%s] 探針沒有例外' % nm, False, repr(ex)[:300])
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
