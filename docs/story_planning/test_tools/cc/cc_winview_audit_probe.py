"""CC（帳號 A）11-10：X254 窗景巡拍（WINVIEW-AUDIT-1105；BB 08:46，LAWWW2 請求；開發分支 8c050804c）。
  每間店：站在店裡靠窗的座位（沒有靠窗座位＝窗前 1.6 m 站得住的地方）往窗外看，白天 14:00、晚上 21:00 各一張；
  另外一張「門口外面、往窗戶朝向那一邊看」的街景（玩家出店落點，鏡頭朝窗戶往外的方向；14:00），讓 BB 比對窗外和那條街像不像。
  店（SHOPS 可選，預設全部；可以寫 key、區域名、店名或群組 gen5／xs7／tea／own）：
    gen5  通用視差窗的 5 間：日和(cvs)、慢輪(bikeshop)、公館燒臘(noodle)、阿德(wz_print)、林家(wz_lin)
    xs7   新生南路那排 7 間：山嵐、南洋、大步、好拍、運動廣場、同弦、大口（xs_*）
    tea   一盞（wz_teahouse；沒有窗景卡，從緣側往前院看）
    own   已經換成自己位置照片的店：候選 afar／aoki／bookstore／daybreak／yangyang／corner_records／wz_teishoku／wz_mokuyobi／wz_offbeat／wz_brunch／cafe，
          執行時從程式判斷（窗景卡是一般材質、貼圖網址是專屬照片 *_view*、不是視差窗 W3.windowMat、也不是木曜日的樹 mok_view）；是的才拍，每間只拍白天一張（STREET_OWN=1 另拍街景）。
  沒有窗景卡的店（11-10 試跑：8c050804c 的山嵐、南洋、同弦，大概還有運動廣場，模型裡只有玻璃）：INFO 照實記，改對著最大的玻璃拍（JSON kind＝glass、has_card＝false）。
  窗景卡怎麼找（執行時、不寫死）：區域群組裡的網格，材質有 uniforms.depth＋photo＋map＝視差窗（W3.windowMat：ggViewPanes 的 VIEWPANE_*、room() 的窗、新生南路的 pane）；
    名字有 VIEW／NIGHT_、或材質名 *window_view＝照片卡（GG_VIEW、WZ_VIEW 換過的那幾張）。同一面牆只留最大的一片；每間最多 MAXCARDS 片（預設 2）。
  方向：窗往外＝從店裡中間（非出口互動點的平均）往卡的那一側（卡最薄的那一軸）；街上的方向＝店裡「出口在哪一側」和街上「店門 → 出店落點」對齊（轉 90° 的倍數）以後同樣轉過去。
  【前置／捷徑】讀檔（條件事件關掉）直接把人放到座位旁（或窗前）、街上的出店落點；鏡頭 eye／look 直接擺、暫停主迴圈、藏 HUD 和玩家（只為截圖）。
  只 check：進得了那個區域、窗景卡找得到、截圖有存；美術像不像 BB 判（不判 PASS／FAIL）。21:00 店關了：讀檔放得進去就照拍，放不進去寫 INFO。
  輸出：<out>/winview_audit.json（每間：zone、窗的位置朝向、窗景卡網格名／貼圖網址、店內站位、街上站位、截圖檔名）＋截圖 wv_<key>_*.png；拼圖用 cc_winview_montage.py（雲端，PIL）。
  Windows＋GPU／SwiftShader ≠ iPhone。
r2（BB 11:48）：OWN_ALL=1（own 也拍全部時段＋門外）；MAXD_<key>＝鏡頭離窗最多幾公尺；鏡頭左右夾在同一面牆的玻璃範圍內（2:30 AM 東窗只拍到牆）。
用法：LW_TESTS=<wt>/tests [SHOPS=gen5,xs_shanlan,...] [HOURS=14,21] [DAY=2025-10-18] [MAXCARDS=2] [STREET_OWN=0] [WAIT=9000] [LENS=18] python3 cc_winview_audit_probe.py <url> <out>"""
import os, sys, json, math, asyncio
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
J = D.J
R = L.Run('winview_audit', OUT); D.setup(R, OUT)
DAY = os.environ.get('DAY') or '2025-10-18'
HOURS = [float(h) for h in (os.environ.get('HOURS') or '14,21').split(',') if h.strip()]
MAXCARDS = int(os.environ.get('MAXCARDS') or 2)
STREET_OWN = os.environ.get('STREET_OWN', '0') == '1'
OWN_ALL = os.environ.get('OWN_ALL', '0') == '1'   # r2（BB 11:48）：own 也拍 HOURS 全部＋門外街景（打烊放不進去照舊寫 INFO）
if OWN_ALL: STREET_OWN = True
WAIT = int(os.environ.get('WAIT') or 9000)
LENS = float(os.environ.get('LENS') or 18)   # 店裡往窗外的鏡頭：18＝水平 90°（和窗景照片同一個視角；11-10 試跑 22 太窄、只看到窗台）
STREETS = ('gongguan', 'wenzhou', 'xinsheng', 'lane118', 'campus')

# (key, 區域, 店名, 群組)
SHOPS_ALL = [
    ('cvs', 'cvs', '日和便利店', 'gen5'), ('bikeshop', 'bikeshop', '慢輪單車', 'gen5'), ('noodle', 'noodle', '公館燒臘', 'gen5'),
    ('ade', 'wz_print', '阿德影印輸出', 'gen5'), ('lin', 'wz_lin', '林家乾麵', 'gen5'),
    ('shanlan', 'xs_shanlan', '山嵐書店', 'xs7'), ('nanyang', 'xs_nanyang', '南洋戲院', 'xs7'), ('dabu', 'xs_dabu', '大步球鞋', 'xs7'),
    ('haopai', 'xs_haopai', '好拍運動', 'xs7'), ('xsports', 'xs_xsports', '新生運動廣場', 'xs7'), ('tongxian', 'xs_tongxian', '同弦樂器', 'xs7'),
    ('dakou', 'xs_dakou', '大口漢堡', 'xs7'),
    ('teahouse', 'wz_teahouse', '一盞', 'tea'),
    ('afar', 'afar', 'afar café', 'own'), ('aoki', 'aoki', '青木茶室', 'own'), ('bookstore', 'bookstore', '頁間書屋', 'own'),
    ('daybreak', 'daybreak', 'Daybreak', 'own'), ('yangyang', 'yangyang', '洋洋鹹酥雞', 'own'), ('corner', 'corner_records', '轉角唱片', 'own'),
    ('komichi', 'wz_teishoku', '小路', 'own'), ('mokuyobi', 'wz_mokuyobi', '木曜日', 'own'), ('offbeat', 'wz_offbeat', '日常失速', 'own'),
    ('sunnyside', 'wz_brunch', 'SUNNY SIDE', 'own'), ('cafe', 'cafe', '2:30 AM', 'own'),
]
_sel = [s.strip() for s in (os.environ.get('SHOPS') or '').split(',') if s.strip()]
SHOPS = [s for s in SHOPS_ALL if not _sel or any(x in (s[0], s[1], s[2], s[3]) for x in _sel)]

# 窗景卡（執行時找）：視差窗（W3.windowMat 的 uniforms）、照片卡（名字 VIEW／NIGHT_、材質 *window_view）
CARDS = r"""(()=>{ const E=GAME.E, z=E.zone, out=[]; if(!z||!z.group) return out; const LG=z.levelGroups||[], lgi=new Map(LG.map((l,i)=>[l.group,i])); const q=new THREE.Quaternion();
  const urlOf=t=>{ if(!t) return null; const u=(t.userData&&t.userData.url)||(t.image&&(t.image.currentSrc||t.image.src))||''; return /^(blob|data):/.test(u)||(!u&&t.image)?'(GLB 內嵌:'+(t.name||'?')+')':(u.replace(/^https?:\/\/[^/]+\//,'')||null); };
  z.group.traverse(o=>{ if(!o.isMesh) return; const m=[].concat(o.material)[0]; if(!m) return; const u=m.uniforms; let kind=null;
    if(u&&u.depth&&u.photo&&u.map) kind='parallax'; else if(/VIEW/.test(o.name||'')||/^NIGHT_/.test(o.name||'')||/window_view/i.test(m.name||'')) kind='photo';
    else if(/glass/i.test((o.name||'')+' '+(m.name||''))&&!/case|sconce|cup|bottle|lamp/i.test((o.name||'')+' '+(m.name||''))) kind='glass';   /* 沒有窗景卡的店（11-10 試跑：山嵐只有玻璃 shl_glass）：退回對著玻璃拍、照實記 */
    if(!kind) return;
    let vis=true, lv=null; for(let p=o;p&&p!==z.group.parent;p=p.parent){ if(lgi.has(p)){ lv=lgi.get(p); continue; } if(p.visible===false){ vis=false; break; } }
    o.updateWorldMatrix(true,false); const b=new THREE.Box3().setFromObject(o), c=b.getCenter(new THREE.Vector3()), s=b.getSize(new THREE.Vector3());
    o.getWorldQuaternion(q); const n=new THREE.Vector3(0,0,1).applyQuaternion(q);
    if(lv==null){ lv=0; for(let k=0;k<LG.length;k++) if(LG[k].y<=c.y-0.5) lv=k; }
    if(o.userData&&o.userData.dkLv!=null) lv=o.userData.dkLv;
    const tex=kind==='parallax'?u.map.value:m.map;
    out.push({name:o.name||('(無名'+(o.userData&&o.userData.pview?' pview:'+o.userData.pview:'')+')'), kind, vis, lv, mat:m.name||'', pview:(o.userData&&o.userData.pview)||null,
      c:[+c.x.toFixed(3),+c.y.toFixed(3),+c.z.toFixed(3)], size:[+s.x.toFixed(2),+s.y.toFixed(2),+s.z.toFixed(2)], n:[+n.x.toFixed(3),+n.y.toFixed(3),+n.z.toFixed(3)],
      url:urlOf(tex), photoOn:kind==='parallax'?+u.photo.value:null, depth:kind==='parallax'?+(+u.depth.value).toFixed(2):null,
      loaded:!!(tex&&tex.image&&(tex.image.complete!==false)&&(tex.image.width||tex.image.naturalWidth))}); });
  return out; })()"""
ZINFO = r"""((streets)=>{ const E=GAME.E, z=E.zone, its=E.interactables||[]; const LG=(z&&z.levelGroups)||[]; const sp=(z&&z.spawn)||{x:0,z:0};
  const non=its.filter(i=>!i.exit&&!i.hidden&&((i.lv|0)===0)); let cx=0,cz=0; if(non.length){ for(const i of non){ cx+=i.x; cz+=i.z; } cx/=non.length; cz/=non.length; } else { cx=sp.x; cz=sp.z; }
  const ex=its.filter(i=>i.exit&&!i.hidden).map(i=>({label:i.label, x:+i.x.toFixed(2), z:+i.z.toFixed(2), lv:i.lv|0, to:i.exit.to, spawn:i.exit.spawn?{x:+(+i.exit.spawn.x).toFixed(2),z:+(+i.exit.spawn.z).toFixed(2),yaw:i.exit.spawn.yaw==null?null:+(+i.exit.spawn.yaw).toFixed(3),lv:i.exit.spawn.lv|0}:null}));
  return {zone:GAME.G.zone, center:[+cx.toFixed(2),+cz.toFixed(2)], spawn:[+(+sp.x).toFixed(2),+(+sp.z).toFixed(2)], levels:LG.map(l=>+(+l.y).toFixed(2)), exits:ex,
    street:ex.find(e=>streets.includes(e.to))||null}; })"""
DOOR = r"""((to)=>{ const i=(GAME.E.interactables||[]).find(i=>i.exit&&i.exit.to===to); return i?{label:i.label,x:+i.x.toFixed(2),z:+i.z.toFixed(2)}:null; })"""
FLOORY = r"""((lv)=>{ const z=GAME.E.zone, LG=z&&z.levelGroups; return LG&&LG[lv]?+LG[lv].y:0; })"""
GROUNDY = r"""(()=>+GAME.E.player.obj.position.y)()"""
HIDE_NEAR = r"""((a)=>{ const E=GAME.E, out=[]; for(const n of (E.npcs||[])){ const o=n&&n.obj; if(!o||!o.visible) continue; if(Math.hypot(o.position.x-a.eye[0],o.position.z-a.eye[2])<a.r){ o.visible=false; out.push(n.id||n.name||'?'); } } E.render(); return out; })"""
STANDNEAR = r"""((e)=>{ const E=GAME.E; let best=null; for(let r=0;r<=e.r+1e-6;r+=0.1) for(let a=0;a<360;a+=15){ const x=e.x+r*Math.sin(a*Math.PI/180), z=e.z+r*Math.cos(a*Math.PI/180);
  if(!E.canStand(x,z,0.3,e.lv)) continue; const d=Math.hypot(x-e.x,z-e.z); if(!best||d<best.d) best={x:+x.toFixed(2),z:+z.toFixed(2),d}; } return best; })"""


def ang(v): return math.atan2(v[0], v[1])
def vec(a): return [math.sin(a), math.cos(a)]
def snap90(a): return round(a / (math.pi / 2)) * (math.pi / 2)
def norm(v):
    d = math.hypot(v[0], v[1]); return [v[0] / d, v[1] / d] if d > 1e-6 else None


def card_axis(c):
    """卡最薄的那一水平軸：0＝x（卡立在 x＝常數的牆上）、2＝z"""
    return 0 if c['size'][0] < c['size'][2] else 2


def card_out(c, center):
    ax = card_axis(c); d = c['c'][ax] - (center[0] if ax == 0 else center[1]); s = 1 if d >= 0 else -1
    return [float(s), 0.0] if ax == 0 else [0.0, float(s)]


def pick_cards(cards, center, n):
    """看得到的卡，同一面牆（同一軸、座標差 < 0.4）只留面積最大的；照面積排、取前 n"""
    groups = []
    for c in cards:
        if not c['vis']: continue
        ax = card_axis(c); area = c['size'][1] * max(c['size'][0], c['size'][2])
        g = next((g for g in groups if g['ax'] == ax and g['lv'] == c['lv'] and abs(g['coord'] - c['c'][ax]) < 0.4), None)
        if g is None: groups.append({'ax': ax, 'lv': c['lv'], 'coord': c['c'][ax], 'card': c, 'area': area})
        elif area > g['area']: g['card'], g['area'] = c, area
    groups.sort(key=lambda g: -g['area'])
    return [g['card'] for g in groups[:n]]


def dedicated(c):
    u = c.get('url') or ''   # 換過的照片有網址（*_view_day／night.webp）；GLB 內嵌的照片卡（SUNNY SIDE、2:30 AM）只有貼圖名字；木曜日的樹（mok_view）不算
    return c['kind'] == 'photo' and bool(u) and 'mok_view' not in u


def pick_seat(seats, card, out):
    """窗前的座位：在卡的店裡那一側 0.3～6 m、左右不超出卡寬 + 1 m；分數＝離窗距離＋超出的左右距離"""
    ax = card_axis(card); lat_ax = 2 if ax == 0 else 0; halfw = card['size'][lat_ax] / 2; best = None
    for s in seats:
        if s['slv'] != card['lv']: continue
        p = [s['sx'], s['sz']]; cc = [card['c'][0], card['c'][2]]
        dperp = (cc[0] - p[0]) * out[0] + (cc[1] - p[1]) * out[1]
        lat = abs((p[0] - cc[0]) if lat_ax == 0 else (p[1] - cc[1]))
        if dperp < 0.3 or dperp > 6 or lat > halfw + 1.0: continue
        sc = dperp + 0.5 * max(0.0, lat - halfw)
        if best is None or sc < best[0]: best = (sc, s, round(dperp, 2), round(lat, 2))
    return best


async def clear_ui(pg, cdp):
    for _ in range(20):
        q = await D.st(pg)
        if not q['dlg'] and not q['choices']: break
        if q['dlg']: await L.tap(pg, cdp, '#dlg')
        elif q['choices']: await L.tap(pg, cdp, '#choices button:last-child')
        await pg.wait_for_timeout(400)


async def wait_tex(pg, max_ms=12000):
    """視差窗的照片載好（photoOn=1）、照片卡的圖載好；最多等 max_ms"""
    t = 0; cards = []
    while t <= max_ms:
        cards = await pg.evaluate(CARDS)
        if all((c['photoOn'] == 1 if c['kind'] == 'parallax' else c['loaded']) for c in cards if c['vis'] and c['kind'] != 'glass'): return cards
        await pg.wait_for_timeout(1000); t += 1000
    return cards


async def ushot(pg, name, cam):
    """截圖給 BB 看（不判黑畫面）：1280×720、藏 HUD 和玩家、照 cam 擺鏡頭（D.CAM：暫停、重算淡出牆／樓層／NPC 顯示）"""
    await pg.set_viewport_size({'width': 1280, 'height': 720}); await pg.wait_for_timeout(600)
    await pg.evaluate("(()=>{ GAME.E.player.obj.visible=false; })()"); await pg.evaluate(D.HUD + '(false)')
    c = await pg.evaluate(D.CAM, cam); await pg.wait_for_timeout(700); await pg.evaluate(D.CAM, cam)
    hid = await pg.evaluate(HIDE_NEAR, {'eye': cam['eye'], 'r': 1.6})   # 鏡頭旁邊 1.6 m 內的人（坐在那張座位上的客人）藏起來，不然整個畫面是後腦勺（11-10 試跑：一盞、山嵐）
    path = os.path.join(OUT, name + '.png'); b = await pg.screenshot(path=path)
    m = await D.lum_browser(pg, b)
    await pg.evaluate(D.UNCAM); await pg.evaluate(D.HUD + '(true)'); await pg.evaluate("(()=>{ GAME.E.player.obj.visible=true; })()")
    ok = os.path.exists(path) and os.path.getsize(path) > 1000
    R.check('[截圖] %s.png 有存' % name, ok, J({'cam': c, 'lum': m}))
    R.note('[截圖] %s：鏡頭 %s；亮度（平均、變化）%s；鏡頭旁藏起來的人 %s' % (name, J(c), J(m), J(hid)))
    return name + '.png' if ok else None


async def do_shop(pg, cdp, key, zone, name, group):
    tag = '[%s %s]' % (name, zone); h0 = HOURS[0] if HOURS else 14.0
    rec = {'key': key, 'name': name, 'group': group, 'zone': zone, 'day': DAY, 'shots': {}, 'notes': []}
    R.setup('%s 讀檔 %s %s %05.2f（區域出生點；條件事件關掉）' % (tag, zone, DAY, h0))
    s = await D.load_zone(pg, cdp, zone, DAY, h0, wait=WAIT)
    if not R.check('%s 進得了 %s' % (tag, zone), s['zone'] == zone, J(s)): rec['error'] = 'zone'; return rec
    await clear_ui(pg, cdp)
    zi = await pg.evaluate(ZINFO, list(STREETS)); rec['zinfo'] = zi
    seats = await pg.evaluate(D.SEATS)
    center = zi['center']
    # 先把鏡頭擺到店裡中間（重算淡出的牆、窗景卡）再找卡
    fy0 = await pg.evaluate(FLOORY, 0)
    await pg.evaluate(D.CAM, {'eye': [center[0], fy0 + 1.6, center[1]], 'look': [center[0], fy0 + 1.6, center[1] + 1], 'lens': 24})
    cards = await wait_tex(pg); await pg.evaluate(D.UNCAM)
    if len(zi['levels']) > 1:   # 樓上的卡（大口、山嵐、運動廣場的二樓）：人放到二樓再找一次
        p2 = await pg.evaluate(STANDNEAR, {'x': center[0], 'z': center[1], 'r': 6, 'lv': 1})
        if p2:
            await D.load_zone(pg, cdp, zone, DAY, h0, x=p2['x'], z=p2['z'], lv=1, wait=max(3000, WAIT // 2)); await clear_ui(pg, cdp)
            fy1 = await pg.evaluate(FLOORY, 1)
            await pg.evaluate(D.CAM, {'eye': [p2['x'], fy1 + 1.6, p2['z']], 'look': [p2['x'], fy1 + 1.6, p2['z'] + 1], 'lens': 24})
            more = await wait_tex(pg, 6000); await pg.evaluate(D.UNCAM)
            names = {(c['name'], tuple(c['c'])) for c in cards}
            cards += [c for c in more if (c['name'], tuple(c['c'])) not in names and c['lv'] >= 1]
    rec['cards_all'] = cards
    R.note('%s 窗景卡（全部，含藏起來的）%d 片：%s' % (tag, len(cards), J([{k: c[k] for k in ('name', 'kind', 'vis', 'lv', 'c', 'size', 'url')} for c in cards])))
    ded = [c for c in cards if c['vis'] and dedicated(c)]
    rec['dedicated'] = bool(ded)
    if group == 'own':
        if not ded:
            R.note('%s INFO：沒有專屬照片的窗景卡（%s）→ 不拍' % (tag, J([[c['name'], c['kind'], c['url']] for c in cards if c['vis']])))
            rec['skipped'] = 'not_dedicated'; return rec
        chosen = pick_cards(ded, center, 1)
    elif group == 'tea':
        chosen = []
    else:
        chosen = pick_cards([c for c in cards if c['kind'] != 'glass'], center, MAXCARDS)
        rec['has_card'] = bool(chosen)
        if not chosen:   # 沒有窗景卡（視差窗、照片卡都沒有）：照實記 INFO，改對著最大的幾片玻璃（立著、薄、寬高都 > 1 m）拍——玻璃外面是什麼就是什麼
            gl = [c for c in cards if c['kind'] == 'glass' and min(c['size'][0], c['size'][2]) < 0.3 and c['size'][1] > 1.0 and max(c['size'][0], c['size'][2]) > 1.0]
            R.note('%s INFO：這一間沒有窗景卡（視差窗、照片卡都沒有）；改對著玻璃拍：%s' % (tag, J([[c['name'], c['vis'], c['lv'], c['c'], c['size']] for c in gl])))
            chosen = pick_cards(gl, center, 1)   # 玻璃只拍最大的那一片（11-10 試跑：山嵐第二大的 shl_glass 是書櫃的玻璃門）
        if not R.check('%s 找得到看得見的窗景卡（沒有卡時：玻璃）' % tag, bool(chosen), J([[c['name'], c['kind'], c['vis']] for c in cards])):
            rec['error'] = 'nocard'; return rec
    views = []
    for c in chosen:
        out = card_out(c, center); views.append({'card': c, 'out': out, 'virtual': False})
    if group == 'tea':   # 一盞：沒有窗景卡；從緣側（「坐在緣側」那一張）往前院看＝座位面向的方向
        eng = [q for q in seats if '緣側' in (q['label'] or '')]
        R.note('%s 「坐在緣側」：%s；（窗景卡 %s）' % (tag, J(eng), J([c['name'] for c in cards if c['vis']])))
        rec['has_card'] = False
        if not R.check('%s 有緣側的座位（往前院看的位置）' % tag, bool(eng), J(seats)): rec['error'] = 'noengawa'; return rec
        q = min(eng, key=lambda q: abs(q['sx'] - sum(e['sx'] for e in eng) / len(eng)))
        yaw = await pg.evaluate("((p)=>{ const i=GAME.E.interactables.find(i=>i.seat&&Math.abs(i.seat.x-p[0])<1e-3&&Math.abs(i.seat.z-p[1])<1e-3); return i&&i.seat.yaw!=null?+i.seat.yaw:0; })", [q['sx'], q['sz']])
        out = vec(snap90(yaw)); fy = await pg.evaluate(FLOORY, 0)
        vc = {'name': '(前院，沒有窗景卡)', 'kind': 'yard', 'vis': True, 'lv': 0, 'c': [round(q['sx'] + out[0] * 5, 2), fy + 0.9, round(q['sz'] + out[1] * 5, 2)], 'size': [0, 0, 0], 'url': None}
        views.append({'card': vc, 'out': out, 'virtual': True, 'seat': q})
    rec['views'] = []
    for vi, v in enumerate(views):
        c, out = v['card'], v['out']; sfx = '' if vi == 0 else '_c%d' % (vi + 1); vt = '%s 卡 %s' % (tag, c['name'])
        fy = await pg.evaluate(FLOORY, c['lv'])
        if v.get('seat'): ps = (0, v['seat'], 0, 0)
        else: ps = pick_seat(seats, c, out)
        if ps:
            s0 = ps[1]; eye_xz = [s0['sx'] - out[0] * 0.15, s0['sz'] - out[1] * 0.15]
            eyeh = 0.95 if (group == 'tea' or '緣側' in (s0['label'] or '')) else (1.2 + (s0.get('lift') or 0))
            stand_at = s0['ap'] or [s0['sx'], s0['sz']]; where = '座位「%s」(%s, %s)%s，離窗 %s m、左右偏 %s m' % (s0['label'], s0['sx'], s0['sz'], ' 二樓' if s0['slv'] else '', ps[2], ps[3])
        else:
            eye_xz = [c['c'][0] - out[0] * 1.6, c['c'][2] - out[1] * 1.6]; eyeh = 1.6; stand_at = eye_xz; where = '窗前 1.6 m（沒有靠窗的座位）'
        st_pt = await pg.evaluate(STANDNEAR, {'x': stand_at[0], 'z': stand_at[1], 'r': 1.5, 'lv': c['lv']})
        if st_pt and not ps: eye_xz = [st_pt['x'], st_pt['z']]
        put = [st_pt['x'], st_pt['z']] if st_pt else [center[0], center[1]]
        ax = card_axis(c); lat_ax = 2 if ax == 0 else 0
        if not v['virtual']:
            dp = (c['c'][0] - eye_xz[0]) * out[0] + (c['c'][2] - eye_xz[1]) * out[1]
            if dp < 1.2: eye_xz = [eye_xz[0] - out[0] * (1.2 - dp), eye_xz[1] - out[1] * (1.2 - dp)]   # 離玻璃至少 1.2 m（太近只看到窗框、斜著擦過玻璃）
        if not v['virtual']:
            mxd = os.environ.get('MAXD_%s' % key)   # r2（BB 11:48 好拍白天鏡頭朝店裡）：鏡頭離卡最多幾公尺
            dp = (c['c'][0] - eye_xz[0]) * out[0] + (c['c'][2] - eye_xz[1]) * out[1]
            if mxd and dp > float(mxd): eye_xz = [eye_xz[0] + out[0] * (dp - float(mxd)), eye_xz[1] + out[1] * (dp - float(mxd))]; R.note('%s MAXD_%s=%s：鏡頭往窗移 %.2f m' % (vt, key, mxd, dp - float(mxd)))
            # r2（BB 11:48 2:30 AM 東窗只拍到牆）：同一面牆的玻璃（平面差 <3 m、同一軸）左右範圍；鏡頭左右在範圍外就夾進去（留 0.4 m）
            gl = [g for g in cards if g['kind'] == 'glass' and g['vis'] and g['lv'] == c['lv'] and card_axis(g) == ax and abs(g['c'][ax] - c['c'][ax]) < 3 and min(g['size'][0], g['size'][2]) < 0.3 and g['size'][lat_ax] > 0.8]
            if gl:
                lo = min(g['c'][lat_ax] - g['size'][lat_ax] / 2 for g in gl) + 0.4; hi = max(g['c'][lat_ax] + g['size'][lat_ax] / 2 for g in gl) - 0.4
                li = 0 if lat_ax == 0 else 1; e0 = eye_xz[li]
                if hi > lo and not (lo <= e0 <= hi):
                    eye_xz[li] = min(max(e0, lo), hi); R.note('%s 鏡頭左右 %.2f 在同一面牆的玻璃範圍 [%.2f, %.2f] 外：夾到 %.2f' % (vt, e0, lo, hi, eye_xz[li]))
        eye = [round(eye_xz[0], 3), round(fy + eyeh, 3), round(eye_xz[1], 3)]
        look = [c['c'][0], round(fy + eyeh - 0.05, 3), c['c'][2]]
        if not v['virtual'] and gl and c['size'][lat_ax] <= 3: look[lat_ax] = eye[lat_ax]   # 窄的卡：照鏡頭左右正對
        if not v['virtual'] and c['size'][lat_ax] > 3:   # 寬的窗（放大的視差窗、整面玻璃）：正對著看（看的點＝鏡頭在窗面上的投影，左右夾在窗的範圍內 0.5 m）
            half = c['size'][lat_ax] / 2 - 0.5; e_lat = eye[lat_ax]; look[lat_ax] = round(min(max(e_lat, c['c'][lat_ax] - half), c['c'][lat_ax] + half), 3)
        if abs(look[0] - eye[0]) < 0.05 and abs(look[2] - eye[2]) < 0.05: look = [eye[0] + out[0] * 3, look[1], eye[2] + out[1] * 3]
        R.note('%s 窗往外 %s（%s）；店內站位：%s；人放在 %s（第 %d 層）；鏡頭 eye %s → look %s' % (vt, J(out), '+x 東' if out == [1.0, 0.0] else '-x 西' if out == [-1.0, 0.0] else '+z' if out == [0.0, 1.0] else '-z' if out == [0.0, -1.0] else '', where, J(put), c['lv'], J(eye), J(look)))
        vrec = {'card': c['name'], 'kind': c['kind'], 'url': c.get('url'), 'center': c['c'], 'size': c['size'], 'lv': c['lv'], 'out': out, 'virtual': v['virtual'],
                'dedicated': dedicated(c), 'inside': {'where': where, 'player': put, 'eye': eye, 'look': look}, 'shots': {}}
        hrs = HOURS[:1] if (group == 'own' and not OWN_ALL) else HOURS
        for h in hrs:
            tn = 'day' if 6 <= h < 18.8 else 'night'
            R.setup('%s %05.2f 讀檔把人放到 %s（第 %d 層）' % (vt, h, J(put), c['lv']))
            s = await D.load_zone(pg, cdp, zone, DAY, h, x=put[0], z=put[1], lv=c['lv'], wait=WAIT)
            if s['zone'] != zone:
                R.note('%s INFO：%05.2f 讀檔放不進 %s（%s；可能打烊）→ 不拍' % (vt, h, zone, J(s))); vrec['shots'][tn] = None; continue
            await clear_ui(pg, cdp)
            if not v['virtual']:
                await pg.evaluate(D.CAM, {'eye': eye, 'look': look, 'lens': LENS}); cc = await wait_tex(pg, 10000); await pg.evaluate(D.UNCAM)
                now = next((x for x in cc if x['name'] == c['name'] and abs(x['c'][0] - c['c'][0]) < 0.3 and abs(x['c'][2] - c['c'][2]) < 0.3), None)
                R.note('%s %05.2f 這片卡現在：%s' % (vt, h, J(now and {k: now[k] for k in ('vis', 'url', 'photoOn', 'loaded')})))
                vrec.setdefault('url_by_hour', {})[tn] = now and now['url']
            vrec['shots'][tn] = await ushot(pg, 'wv_%s%s_%s' % (key, sfx, tn), {'eye': eye, 'look': look, 'lens': LENS})
        rec['views'].append(vrec)
    # 門口外面的街景（14:00）：出店落點，鏡頭朝窗戶往外的方向（店裡 → 街上照門的方向轉 90° 的倍數）
    if group != 'own' or STREET_OWN:
        se = zi['street']
        if not R.check('%s 有回街上的出口（含出店落點）' % tag, bool(se and se['spawn']), J(zi['exits'])): rec['error'] = 'noexit'; return rec
        f_in = norm([se['x'] - center[0], se['z'] - center[1]])
        R.setup('%s 讀檔 %s %05.2f 出店落點 %s' % (tag, se['to'], h0, J(se['spawn'])))
        s = await D.load_zone(pg, cdp, se['to'], DAY, h0, x=se['spawn']['x'], z=se['spawn']['z'], yaw=se['spawn']['yaw'], lv=se['spawn']['lv'], wait=WAIT)
        if R.check('%s 到了街上（%s）' % (tag, se['to']), s['zone'] == se['to'], J(s)):
            await clear_ui(pg, cdp)
            door = await pg.evaluate(DOOR, zone); sp = [se['spawn']['x'], se['spawn']['z']]
            f_st = norm([sp[0] - door['x'], sp[1] - door['z']]) if door else None
            if not f_st: f_st = vec(se['spawn']['yaw'] or 0.0); R.note('%s 街上找不到店門（或落點就在門上）：街上的方向照落點的 yaw' % tag)
            th = snap90(ang(f_st) - ang(f_in)) if f_in else 0.0
            gy = await pg.evaluate(GROUNDY)
            rec['street'] = {'zone': se['to'], 'spawn': se['spawn'], 'door': door, 'f_in': f_in and [round(x, 3) for x in f_in], 'f_st': [round(x, 3) for x in f_st], 'rot_deg': round(math.degrees(th)), 'shots': []}
            for vi, vr in enumerate(rec['views']):
                n_st = vec(snap90(ang(vr['out']) + th)); n_st = [round(x, 3) + 0.0 for x in n_st]
                eye = [sp[0], round(gy + 1.6, 3), sp[1]]; look = [round(sp[0] + n_st[0] * 20, 3), round(gy + 1.3, 3), round(sp[1] + n_st[1] * 20, 3)]
                R.note('%s 街景：店門 %s、出店落點 %s；店裡出口方向 %s ↔ 街上 %s（轉 %d°）；窗往外 %s → 街上看 %s；鏡頭 eye %s → look %s' % (tag, J(door), J(sp), J(f_in), J(f_st), round(math.degrees(th)), J(vr['out']), J(n_st), J(eye), J(look)))
                vr['street'] = {'dir': n_st, 'eye': eye, 'look': look}
                fn = await ushot(pg, 'wv_%s%s_street' % (key, '' if vi == 0 else '_c%d' % (vi + 1)), {'eye': eye, 'look': look, 'lens': 18})   # lens 18＝水平 90°（窗景照片的視角）
                vr['shots']['street'] = fn; rec['street']['shots'].append(fn)
    return rec


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC WINVIEW-AUDIT（X254 窗景巡拍）：worktree %s；店 %s；HOURS=%s；DAY=%s；Windows＋GPU／SwiftShader ≠ iPhone' % (real or '?', [s[0] for s in SHOPS], HOURS, DAY), flush=True)
    res = {'sha': real, 'day': DAY, 'hours': HOURS, 'shops': []}
    jpath = os.path.join(OUT, 'winview_audit.json')
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); ok = await L.wait_loaded(pg); R.check('遊戲載入', ok, '')
        if not ok: await b.close(); sys.exit(1)
        await pg.evaluate("localStorage.clear()")
        have = await pg.evaluate("Object.keys(Z3.ZONES)")
        for key, zone, name, group in SHOPS:
            print('== %s %s（%s）' % (key, name, group), flush=True)
            if zone not in have:
                if group == 'own': R.note('[%s] INFO：這一版沒有區域 %s' % (name, zone)); continue
                R.check('[%s] 這一版有區域 %s' % (name, zone), False); continue
            try: rec = await do_shop(pg, cdp, key, zone, name, group)
            except Exception as ex:
                R.check('[%s] 探針沒有例外' % name, False, repr(ex)[:300]); rec = {'key': key, 'name': name, 'group': group, 'zone': zone, 'error': repr(ex)[:300]}
            res['shops'].append(rec)
            with open(jpath, 'w', encoding='utf-8') as f: json.dump(res, f, ensure_ascii=False, indent=1)
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    ded = [s['name'] for s in res['shops'] if s.get('dedicated')]
    R.note('專屬照片窗景卡的店：%s；JSON：%s' % (J(ded), jpath))
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
