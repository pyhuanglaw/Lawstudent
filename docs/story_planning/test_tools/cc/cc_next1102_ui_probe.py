"""CC（帳號 A）11-02：下一版 int/next1102（正式 SHA 673ef2185）三個畫面的瀏覽器探針（BB 14:02，LAWWW 建議優先看）。
不是 iPhone：Playwright 手機模擬（is_mobile、觸控；SwiftShader 1～4 fps）。每個 case 的每個方向（直向 390×844、橫向 844×390）各開一個新的瀏覽器。
URL 照給的跑；TURBO=1（預設）＝自動加 ?turbo（只加快對話等待、走路瞬間到；遊戲時間 dt 上限 0.3 秒＝等時間比較快）——三個 case 要看的畫面（對話框、字幕、黑板貼圖、
觀念卡對話框）都不受 turbo 影響；報告照樣標示。

讀碼看到的規則（673ef2185；相關 commit e7a4383b0＝合併 AA_588＋AA_585，子代理 a56503a4c）：
(a) noodle：AA_588 第 1 節，沛珊和柏翰公開那一段從「考完的晚餐」（ev_midterm_supper_y1s2）搬到 4/15 傍晚麵店。
    事件 id＝ev_psbh_public_0415（src/data/events.js），location 'noodle'、trigger 'auto'（EVENTS.tick：人在麵店區域、沒在忙／對話／ADV 時檢查）、
    term ['Y1S2']、weeks [8]、weekday [3]（2026-04-15 週三＝STORY.termDay('Y1S2',8,3)）、time [17,20.5]、once、background 'blur'、prereq PS_BH
    （STORY.knows('classmate_peishan') 且沒有 dating_classmate_peishan）。台詞 6 句：「柏翰幫沛珊把滷蛋切成兩半。」「……喔。」「全桌安靜三秒。」
    「對，我們在一起了。你們吃你們的。」「上禮拜的事。」「（他把另一半滷蛋推回她碗裡。）」。consequences memo（沛珊和柏翰在麵店說了（4/15））。
    story3d.js phoneRules（4/15、4/16，law 階段、在麵店團群組 noodle_team、認識沛珊、沒和她交往）：4/15 20:30 以前＝PHONE.at(max(17,現在)) 群組兩則
    （柏翰「今天晚上麵店，有空的來。」沛珊「我會到。」，tag psbh_0415_ask）；4/15 20:30 以後或 4/16、事件沒演＝missedPhoto：20:30 阿哲三則
    （📷 切成兩半的滷蛋／柏翰幫沛珊切的／……他們在一起了，tag zhe_supper_mid2_egg）＋ SOCIAL.remember(沛珊,'HEARD_ABOUT')。
    whois3d.js psBh 讀 events.last.ev_psbh_public_0415。
    NOODLE_SUBS（預設 in,enter,away）：
      in    【前置】4/15 16:59 已經在麵店（區域 noodle 出生點）→ 條件事件打開 → 站著等：17:00 群組兩則、事件自己開始 → 點完 → 動得了（搖桿）
      enter 【前置】4/15 18:00 在公館 →【捷徑】GAME.enter('noodle')（店門口互動點進去的同一個函式）→ 事件開始 → 點完 → 動得了
      away  【前置】4/15 16:59 在宿舍 → 17:00 群組兩則（手機群組截圖）→【前置】同一份進度跳到 20:27 宿舍 → 20:30 阿哲的照片三則（截圖）、
            HEARD_ABOUT、事件沒演；動得了
    check：事件照設計觸發（in／enter：EVENTS.run 有 ev_psbh_public_0415、6 句照順序、done 有記、沒有滷蛋照片；away：沒演、照片三則、HEARD_ABOUT）、
           結束後不卡（對話框收起、player.busy false、ADV 關、搖桿推得動）、沒有 JS 例外。
(b) board：AA_585 第 8、9 週黑板（30 門 × 2 週＝60 塊；tests/syllabus_unit 半形算半格、上限 30）。黑板在遊戲裡顯示的入口（classes3d.js attend 322～323）：
      ①L201（區域 classroom，zones3d.js z.setBoard）＝3D 黑板貼圖：1024×256 畫布，第一行 bold 44px x=40、第二三行 30px x=40（"Noto Sans TC",sans-serif）
      ②其他教室（法律系館A 202 linze_202、萬才館多功能 wancai_multi、萬才館門口上課）＝字幕 GAME.caption('黑板', 三行用全形空白接起來, 6000)
       （#caption：橫向 max-width min(620px,100%−340px)、直向 max-width 100%−40px）
      ③法律頁、自習筆記（66a269434：LISTED 加第 8、9 週）——法律頁有觀念卡的課只列卡，第 8、9 週沒有卡（study_units 沒有 w8／w9），這支不測。
    BOARD_SUBS（預設 measure,class3d,classcap）：
      measure 【只讀】60 塊黑板用同一組字型在頁面畫布量寬（右緣＝40＋寬 ≤1024）；【捷徑】字幕那一組（②）每一塊用遊戲的 GAME.caption 顯示、量 #caption
              （在畫面內、沒有橫向溢出、幾行）；最長那一塊截圖
      class3d 【前置】BOARD3D（預設 crim_gen1，大一上第 8 週週三上午 L201）那一天上課前 7 分鐘在教室 → 手機「今天」出發鈕（沒有＝【捷徑】CLS.goClass forced）→
              座位選單「坐中間的位子」→ 上課：記 setBoard 的三行、抓黑板貼圖（PNG）、量貼圖最右邊有字的像素、截圖
      classcap【前置】BOARDCAP（預設 tax_law，大四上第 8 週週四下午一 L202）同上 → 字幕「黑板」出現時量 #caption、截圖
(c) card：0fcf962ea study3d.js S.cardLines：白話＋例子 ≤220 字（S.CARD_CHUNK）一則；超過＝白話照句號（。！？）分成幾則、例子另一則（不拆卡）。
    顯示入口：STUDY.review（考前總複習）每張卡「【課名　k／N】標題」一句＋cardLines 每則一句（GAME.say，#dlg）。最長的卡＝CARD（預設 securities_w5，白話 1170 字）。
    【前置】那門課那一學期 STUDY.remindDay（期末週前一週的週日）10:00 宿舍 →【捷徑】STORY.interact(宿舍書桌, GAME)（書桌互動點的同一個處理函式，沒有走過去）→
    書桌選單「考前總複習」→ 跳到那一科（「跳到下一科」）→「下一張」到那一張 → 每一則：打完字量 #dlg／#dlgText（在畫面內、文字完整、沒有被裁、能不能捲）、截圖 →「結束總複習」→ 不卡。
用法：LW_TESTS=<工作樹>/tests SHA=673ef2185 [CASES=noodle,board,card] [ORIENTS=port,land] python3 cc_next1102_ui_probe.py <URL index.html> <輸出資料夾>
最後一行 ALL PASS 或 FAILED: ...；transcript_<case>_<sub>_<orient>.json。等待上限（秒）：EV_MAX（事件開始，300）、CLASS_MAX（上課到黑板，420）、CARD_MAX（總複習到那一張，900）。"""
import os, sys, json, asyncio, time, traceback, base64
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__)))); import bbplay as P   # bbplay 在上一層（BB 的 test_tools）
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
if os.environ.get('TURBO', '1') == '1' and 'turbo' not in URL: URL = URL + ('&' if '?' in URL else '?') + 'turbo'
J = lambda o: json.dumps(o, ensure_ascii=False)
ENVI = lambda k, d: int(os.environ.get(k, str(d)))
LST = lambda k, d: [c.strip() for c in os.environ.get(k, d).split(',') if c.strip()]
CASES = LST('CASES', 'noodle,board,card')
ORIENTS = LST('ORIENTS', 'port,land')
NOODLE_SUBS = LST('NOODLE_SUBS', 'in,enter,away')
BOARD_SUBS = LST('BOARD_SUBS', 'measure,class3d,classcap')
BOARD3D = os.environ.get('BOARD3D', 'crim_gen1'); BOARDCAP = os.environ.get('BOARDCAP', 'tax_law'); BOARD_WEEK = ENVI('BOARD_WEEK', 8)
CARD = os.environ.get('CARD', 'securities_w5')
EVID = 'ev_psbh_public_0415'
PS_LINES = ['柏翰幫沛珊把滷蛋切成兩半。', '……喔。', '全桌安靜三秒。', '對，我們在一起了。你們吃你們的。', '上禮拜的事。', '（他把另一半滷蛋推回她碗裡。）']
A585 = ['civ_general', 'crim_gen1', 'const_1', 'const_2', 'crim_gen2', 'oblig_gen1', 'admin_law', 'crim_spec', 'property', 'oblig_gen2', 'oblig_spec', 'family_law', 'admin_remedy',
        'legal_english', 'civpro_1', 'crimpro', 'company_law', 'securities', 'civpro_2', 'insurance', 'negotiable', 'labor_law', 'enforcement', 'legal_ethics', 'ip_law', 'labor_social',
        'tax_law', 'crim_judgment_sem', 'public_judgment_sem', 'maritime']

# ---------------------------------------------------------------- 存檔（cc_layout16_probe 的 state_at，複製）
BASEF = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'MET_ZHE': True,
         'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True,
         'fundsV2': 1, 'KX_DEC3_MIGRATED': True, 'dating_kexin': False}
ROOMS = (('ROOM_Y2', '2026-09-06'), ('ROOM_Y3', '2027-09-05'), ('ROOM_Y4', '2028-09-03'))
VISITED = ('noodle', 'cafe', 'library_hall', 'library', 'lawlib', 'wancai', 'linze', 'gongguan', 'wenzhou', 'soclib', 'cvs', 'bookstore', 'classroom', 'linze_202', 'wancai_multi')


async def state_at(pg, key, h, zone, flags=None, pos=None):
    d = await P.day_of(pg, key)
    st = {'name': '祐廷', 'energy': 100, 'events': {'done': {}, 'last': {}, 'count': 0}, 'contacts': {}}
    F = st['flags'] = dict(BASEF)
    for k, kk in ROOMS:
        dd = (await P.day_of(pg, kk))['d']
        if dd <= d['d']: F[k] = dd
    F.update(flags or {})
    st.update(day=d['d'], weekday=d['wd'], hour=h, zone=zone, pos=pos, weather='clear', stage='law', money=30000)
    st['visited'] = {z: True for z in VISITED}
    st['courses'] = {'done': {}, 'attend': {}, 'prep': {}, 'electives': {}, 'note': {}, 'disc': {}, 'ask': {}, 'late': {}, 'abs': {}, 'exam': {}, 'grades': {}}
    return st, d


async def load(pg, cdp, st, quiet=True):
    await L.load_state(pg, st, quiet_events=quiet, quiet_phone=True)
    await pg.wait_for_timeout(3000)
    try: await L.phone_away(pg, cdp, tries=2)
    except Exception: pass


# 記錄（只記不改）：GAME.say／choose／caption、EVENTS.run、zone.setBoard（每 150 ms 看一次目前區域有沒有 setBoard、包一層記參數）
HOOK = r"""(()=>{ if(window.__PLH) return 'again'; window.__PLH=1; window.__PL=[];
  const push=o=>{ try{ o.h=+(+GAME.G.hour).toFixed(3); o.d=GAME.G.day; o.z=GAME.G.zone; o.ms=Math.round(performance.now()); window.__PL.push(o); }catch(e){} };
  const s0=GAME.say; GAME.say=function(w,t){ push({k:'say',n:(w&&w.name)||(typeof w==='string'?w:''),t:String(t==null?'':t)}); return s0.apply(this,arguments); };
  const c0=GAME.choose; GAME.choose=function(o){ push({k:'choose',t:(o||[]).filter(x=>x&&!x.hidden).map(x=>(x.t||x.text)||''),hint:(o||[]).filter(x=>x&&!x.hidden).map(x=>x.hint||'')}); return c0.apply(this,arguments); };
  const p0=GAME.caption; if(p0) GAME.caption=function(w,t,ms){ push({k:'caption',n:String(w||''),t:String(t==null?'':t),dur:ms||null}); return p0.apply(this,arguments); };
  const r0=EVENTS.run; EVENTS.run=function(ev){ push({k:'event',id:ev&&ev.id||String(ev)}); return r0.apply(this,arguments); };
  if(typeof ADV!=='undefined'){ const bgOf=m=>m&&typeof m==='object'?{image:m.image||null,label:m.label||null}:(m==null?null:String(m));
    for(const fn of ['begin','setBg','cg','end']){ const f0=ADV[fn]; if(typeof f0!=='function') continue; ADV[fn]=function(a){ push({k:'adv',fn,arg:fn==='begin'?{background:bgOf(a&&a.background),right:a&&a.right&&a.right.charId||null,left:a&&a.left&&a.left.charId||null}:(fn==='setBg'?bgOf(a):(fn==='cg'?String(a):null))}); return f0.apply(this,arguments); }; } }
  setInterval(()=>{ try{ const z=GAME.E&&GAME.E.zone; if(z&&z.setBoard&&!z.setBoard.__w){ const f=z.setBoard; z.setBoard=function(a,b,c){ push({k:'board',t:[a,b,c]}); return f.apply(this,arguments); }; z.setBoard.__w=1; } }catch(e){} },150);
  return 'ok'; })()"""
PL = "(n=>(window.__PL||[]).slice(n))"
PLN = "(window.__PL||[]).length"

DLGM = r"""(()=>{ const $=id=>document.getElementById(id);
  const R=e=>{ if(!e) return null; const b=e.getBoundingClientRect(); return {l:+b.left.toFixed(1),t:+b.top.toFixed(1),r:+b.right.toFixed(1),b:+b.bottom.toFixed(1),w:+b.width.toFixed(1),h:+b.height.toFixed(1)}; };
  const vis=e=>{ if(!e) return false; const cs=getComputedStyle(e), b=e.getBoundingClientRect(); return cs.display!=='none'&&cs.visibility!=='hidden'&&+cs.opacity>0.05&&b.width>0&&b.height>0&&!e.classList.contains('hide'); };
  const dlg=$('dlg'), tx=$('dlgText'); const dc=getComputedStyle(dlg), tc=getComputedStyle(tx); const tr=tx.getBoundingClientRect();
  const st=document.createElement('style'); st.textContent='#dlg,#dlg *{pointer-events:auto!important}'; document.head.appendChild(st);   /* #dlg 是 pointer-events:none 時 elementFromPoint 會穿過去：量的時候暫時打開 */
  const samp=[]; if(vis(dlg)&&tr.width>0&&tr.height>0){ for(const [fx,fy] of [[.05,.02],[.5,.5],[.05,.98],[.9,.98]]){ const x=tr.left+Math.max(4,Math.min(tr.width-4,tr.width*fx)), y=tr.top+Math.max(4,Math.min(tr.height-4,tr.height*fy)); const inV=x>=0&&y>=0&&x<innerWidth&&y<innerHeight; const e=inV?document.elementFromPoint(x,y):null; samp.push({x:+x.toFixed(1),y:+y.toFixed(1),inView:inV,inDlg:!!(e&&dlg.contains(e)),el:e?(e.id||e.tagName):null}); } } st.remove();
  return {W:innerWidth,H:innerHeight,adv:document.body.classList.contains('adv-on'),vis:vis(dlg),cls:[...dlg.classList],name:($('dlgName')||{}).textContent||'',text:tx.textContent||'',
    next:($('dlgNext')||{style:{}}).style.visibility||'',dlg:R(dlg),txt:R(tx),dlgScroll:[dlg.scrollHeight,dlg.clientHeight,dlg.scrollWidth,dlg.clientWidth],txtScroll:[tx.scrollHeight,tx.clientHeight,tx.scrollWidth,tx.clientWidth],
    ovf:{dlgY:dc.overflowY,dlgMaxH:dc.maxHeight,txtY:tc.overflowY,txtMaxH:tc.maxHeight},font:tc.fontSize+'/'+tc.lineHeight,samples:samp}; })()"""

CAPM = r"""(()=>{ const e=document.getElementById('caption'); const b=e.getBoundingClientRect(), cs=getComputedStyle(e); const lh=parseFloat(cs.lineHeight)||21, pad=parseFloat(cs.paddingTop)+parseFloat(cs.paddingBottom);
  return {W:innerWidth,H:innerHeight,rect:{l:+b.left.toFixed(1),t:+b.top.toFixed(1),r:+b.right.toFixed(1),b:+b.bottom.toFixed(1),w:+b.width.toFixed(1),h:+b.height.toFixed(1)},
    sw:e.scrollWidth,cw:e.clientWidth,sh:e.scrollHeight,ch:e.clientHeight,lines:Math.round((b.height-pad)/lh),maxW:cs.maxWidth,ws:cs.whiteSpace,ovf:cs.overflow,hidden:e.classList.contains('hide'),op:cs.opacity,text:(e.textContent||'')}; })()"""


def inside(r, W, H):
    return bool(r) and r['l'] >= -0.5 and r['t'] >= -0.5 and r['r'] <= W + 0.5 and r['b'] <= H + 0.5


def dump(tag, **kw):
    kw.setdefault('sha', os.environ.get('SHA', '?')); kw['tag'] = tag; kw['url'] = URL
    with open(os.path.join(OUT, 'transcript_%s.json' % tag), 'w', encoding='utf-8') as f: json.dump(kw, f, ensure_ascii=False, indent=1)


async def joy_moves(pg, cdp):
    """搖桿往前、往右各推 1.2 秒，回傳移動距離（m）"""
    out = []
    for dx, dy in ((0, -45), (45, 0), (0, 45)):
        a = await pg.evaluate("(()=>{ const p=GAME.E.player.obj.position; return [p.x,p.z]; })()")
        await L.joystick(pg, cdp, dx, dy, 1200); await pg.wait_for_timeout(500)
        b = await pg.evaluate("(()=>{ const p=GAME.E.player.obj.position; return [p.x,p.z]; })()")
        out.append(round(((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2) ** 0.5, 2))
    return out


async def free_state(pg):
    return await pg.evaluate("(()=>({busy:!!GAME.E.player.busy,dlg:!!(GAME.D&&GAME.D.active),depth:(GAME.D&&GAME.D.busyDepth)|0,adv:!!(typeof ADV!=='undefined'&&ADV.active),phone:!!(GAME.phoneIsOpen&&GAME.phoneIsOpen()),zone:GAME.G.zone,h:+(+GAME.G.hour).toFixed(3),running:(typeof EVENTS!=='undefined'&&EVENTS.running)||null}))()")


async def wait_free(pg, cdp, max_s=60):
    t0 = time.time(); s = None
    while time.time() - t0 < max_s:
        s = await free_state(pg)
        if s['phone']: await L.phone_away(pg, cdp, tries=2); continue
        if not s['busy'] and not s['dlg'] and not s['adv'] and s['depth'] == 0: return True, s
        if s['dlg']: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(700)
    return False, s


# ================================================================ (a) noodle
SETUP_PS = r"""(()=>{ const G=GAME.G; G.contacts=G.contacts||{}; const day0=STORY.dayOfKey('2025-09-24');
  for(const [id,v] of [['classmate_peishan',[45,30,10]],['classmate_bohan',[45,30,10]],['zhe',[65,50,45]]]){ const R=SOCIAL.rel(id); R.fam=v[0]; R.trust=v[1]; R.comf=v[2]; SOCIAL.remember(id,'FIRST_MET',''); if(G.contacts[id]==null) G.contacts[id]=day0; }
  if(!PHONE.inGroup(G,'noodle_team')) PHONE.join(G,'noodle_team','麵店團');
  const ev=STORY_EVENTS.find(e=>e.id==='__ID__'); const d=STORY.termDay('Y1S2',8,3);
  return {knowsPS:STORY.knows('classmate_peishan',G),knowsBH:STORY.knows('classmate_bohan',G),knowsZhe:STORY.knows('zhe',G),group:PHONE.inGroup(G,'noodle_team'),dating:!!G.flags.dating_classmate_peishan,
    psbh:!!(ev&&ev.prereq&&ev.prereq.custom(G)),termDay:d,key:CALENDAR.dateOf(d).key,ev:ev?{location:ev.location,trigger:ev.trigger,term:ev.term,weeks:ev.weeks,weekday:ev.weekday,time:ev.time,once:ev.once,lines:ev.dialogue.length}:null}; })()""".replace('__ID__', EVID)
NSTATE = r"""(()=>{ const G=GAME.G, done=G.events&&G.events.done||{}, last=G.events&&G.events.last||{};
  const msgs=(G.msgs||[]).filter(m=>/psbh_0415_ask|zhe_supper_mid2_egg/.test(m.tag||'')).map(m=>({th:m.th,day:m.day,h:m.h,from:m.from||'',tag:m.tag,text:String(m.text||'')}));
  const mem=(typeof SOCIAL!=='undefined'&&SOCIAL.memories?SOCIAL.memories('classmate_peishan'):[]).filter(x=>x.tag==='HEARD_ABOUT').map(x=>({day:x.day,note:x.note||x.n||''}));
  return {day:G.day,key:CALENDAR.dateOf(G.day).key,h:+(+G.hour).toFixed(3),zone:G.zone,done:!!done.__ID__,last:last.__ID__!=null?last.__ID__:null,msgs,heard:mem,sentAsk:PHONE.sent(G,'psbh_0415_ask'),sentEgg:PHONE.sent(G,'zhe_supper_mid2_egg')}; })()""".replace('__ID__', EVID)


async def noodle_pass(p, run, sub, orient):
    tag = 'noodle_%s_%s' % (sub, orient); land = orient == 'land'
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=land)
    pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
    rec = {'sub': sub, 'orient': orient, 'shots': {}}; warns = []
    pg.on('console', lambda m: warns.append(m.text[:300]) if m.type in ('warning', 'error') else None)
    try:
        await pg.goto(URL); ok = await L.wait_loaded(pg); run.check('%s：遊戲載入' % tag, ok)
        await pg.evaluate("localStorage.clear()"); await P.init(pg); await pg.evaluate(HOOK)
        zone, h = {'in': ('noodle', 16 + 59 / 60), 'enter': ('gongguan', 18.0), 'away': ('dorm', 16 + 59 / 60)}[sub]
        st, d = await state_at(pg, ['Y1S2', 8, 3], h, zone)
        await load(pg, cdp, st)
        su = await pg.evaluate(SETUP_PS); rec['setup'] = su
        snap = await P.snapshot(pg); await load(pg, cdp, snap)
        await P.events_on(pg)
        run.setup('[前置] %s：最小存檔 %s（%s 第 %s 週 週三）%s %s；【捷徑】認識沛珊、柏翰、阿哲（SOCIAL FIRST_MET）、加入麵店團群組 → 快照重讀；條件事件打開（只關手機自動打開）；URL %s'
                  % (tag, d['key'], d['term'], d['week'], P_hm(h), zone, URL))
        run.check('%s：前置成立（4/15＝termDay(Y1S2,8,3)、PS_BH 成立、在群組、沒交往）' % tag, su['key'] == '2026-04-15' and su['psbh'] and su['group'] and not su['dating'], J(su))
        z = await pg.evaluate("GAME.G.zone"); rec['zone0'] = z
        if z != zone: run.note('%s：讀檔後區域是 %s（要的是 %s）' % (tag, z, zone))
        n0 = await pg.evaluate(PLN)
        if sub == 'enter':
            await pg.evaluate("void GAME.enter('noodle')")
            run.setup('【捷徑】%s：在公館 18:00 呼叫 GAME.enter(\'noodle\')（麵店門口互動點進店的同一個函式，沒有走到門口）' % tag)
            await pg.wait_for_timeout(4000)
        if sub in ('in', 'enter'):
            t0 = time.time(); started = False; shot_lines = set(); seen = []
            while time.time() - t0 < ENVI('EV_MAX', 300):
                s = await P.ts(pg)
                if s['phone'] and not s['dlg']: await L.phone_away(pg, cdp, tries=2); continue
                if s['ch']:
                    run.note('%s：途中選單 %s → 第一個' % (tag, J([o['t'] for o in s['ch']])))
                    await P.tap_choice(pg, cdp, 0); await pg.wait_for_timeout(1000); continue
                if s['dlg']:
                    started = True
                    m = await pg.evaluate(DLGM)
                    if m['next'] != 'visible': await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(400); m = await pg.evaluate(DLGM)
                    seen.append(m['text'])
                    for i, ln in ((0, PS_LINES[0]), (3, PS_LINES[3])):
                        if m['text'] == ln and i not in shot_lines:
                            shot_lines.add(i); rec['shots']['line%d' % i] = await run.shot(pg, '%s_line%d' % (tag, i + 1)); rec['dlg_line%d' % i] = m
                            run.check('%s：第 %d 句對話框在畫面內、文字完整' % (tag, i + 1), m['vis'] and inside(m['dlg'], m['W'], m['H']) and m['txtScroll'][0] <= m['txtScroll'][1] + 2,
                                      J({'dlg': m['dlg'], 'txt': m['txtScroll'], 'adv': m['adv']}))
                    await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
                ns = await pg.evaluate(NSTATE)
                if ns['done'] and started and not s['busy'] and s['depth'] == 0: break
                await pg.wait_for_timeout(700)
            R = await pg.evaluate(PL, n0); rec['log'] = R
            evs = [x['id'] for x in R if x['k'] == 'event']; says = [x['t'] for x in R if x['k'] == 'say']
            rec['events'] = evs; ns = await pg.evaluate(NSTATE); rec['after'] = ns
            run.note('%s：EVENTS.run %s；GAME.say %s；狀態 %s' % (tag, J(evs), J(says[:20]), J(ns)))
            run.check('%s：ev_psbh_public_0415 自己開始（EVENTS.run）' % tag, EVID in evs, J(evs))
            i0 = says.index(PS_LINES[0]) if PS_LINES[0] in says else -1
            run.check('%s：6 句照順序' % tag, i0 >= 0 and says[i0:i0 + 6] == PS_LINES, J(says[max(0, i0):i0 + 6] if i0 >= 0 else says[:10]))
            ev_say = next((x for x in R if x['k'] == 'say' and x['t'] == PS_LINES[0]), None); rec['ev_time'] = ev_say and [ev_say['h'], ev_say['z']]
            run.check('%s：在麵店、17:00～20:30 之間演（%s）' % (tag, J(rec['ev_time'])), bool(ev_say) and ev_say['z'] == 'noodle' and 17 - 1e-3 <= ev_say['h'] <= 20.5)
            run.check('%s：events.done 有記、沒有滷蛋照片' % tag, ns['done'] and not any(m['tag'] == 'zhe_supper_mid2_egg' for m in ns['msgs']), J(ns))
            run.check('%s：（只記）17:00 群組兩則 psbh_0415_ask' % tag, True, J([m for m in ns['msgs'] if m['tag'] == 'psbh_0415_ask']))
        else:   # away
            okh = await P.wait_hour(pg, cdp, 17.02, max_s=ENVI('EV_MAX', 300))
            ns = await pg.evaluate(NSTATE); rec['at17'] = ns
            ask = [m for m in ns['msgs'] if m['tag'] == 'psbh_0415_ask']
            run.check('%s：17:00 麵店團群組兩則（柏翰「今天晚上麵店，有空的來。」沛珊「我會到。」）' % tag, okh and len(ask) == 2 and ask[0]['text'] == '今天晚上麵店，有空的來。' and ask[1]['text'] == '我會到。', J(ns))
            th = await P.phone_thread(pg, cdp, 'g:noodle_team'); rec['thread17'] = th['text'][-600:]
            rec['shots']['group17'] = await run.shot(pg, tag + '_group17'); await L.close_panels(pg, cdp)
            await P.jump(pg, cdp, run, ['Y1S2', 8, 3], 20 + 27 / 60, 'dorm', note='（沒去麵店，等 20:30）'); await P.events_on(pg)
            okh = await P.wait_hour(pg, cdp, 20.52, max_s=ENVI('EV_MAX', 300))
            t1 = time.time()   # PHONE.at 先排進佇列、下一次 PHONE.tick 才到 G.msgs：多等一下（第一輪只等 2.5 秒＝探針太早看）
            while time.time() - t1 < ENVI('EGG_WAIT', 120):
                ns = await pg.evaluate(NSTATE)
                if len([m for m in ns['msgs'] if m['tag'] == 'zhe_supper_mid2_egg']) >= 3: break
                await pg.wait_for_timeout(2000)
            ns = await pg.evaluate(NSTATE); rec['at2030'] = ns; run.note('%s：照片到的時間（遊戲）%s，等了 %.0f 秒' % (tag, ns['h'], time.time() - t1))
            egg = [m for m in ns['msgs'] if m['tag'] == 'zhe_supper_mid2_egg']
            run.check('%s：20:30 阿哲三則（📷 滷蛋／柏翰幫沛珊切的／……他們在一起了）' % tag, okh and [m['text'] for m in egg] == ['📷（一顆切成兩半的滷蛋）', '柏翰幫沛珊切的', '……他們在一起了'], J(egg))
            run.check('%s：記「聽說」（HEARD_ABOUT）、事件沒演' % tag, bool(ns['heard']) and not ns['done'], J({'heard': ns['heard'], 'done': ns['done']}))
            rec['warns2030'] = warns[-20:]; run.note('%s：console warning／error（最後 8 則）%s' % (tag, J(warns[-8:])))
            if not egg:   # 【診斷】只記：手動叫一次 STORY.phoneRules、看條件；再看隔天（4/16）補不補
                dg = await pg.evaluate(r"""(()=>{ const G=GAME.G, d=STORY.termDay('Y1S2',8,3), ev=STORY_EVENTS.find(e=>e.id==='%s'); const c={day:G.day,d,h:G.hour,stage:G.stage||'law',group:PHONE.inGroup(G,'noodle_team'),knows:STORY.knows('classmate_peishan',G),
                  dating:!!G.flags.dating_classmate_peishan,done:!!(G.events.done&&G.events.done['%s']),sentEgg:PHONE.sent(G,'zhe_supper_mid2_egg'),hasMissed:!!(ev&&ev.missedPhoto),psbh:!!(ev&&ev.prereq.custom(G))};
                  let err=null; try{ STORY.phoneRules(GAME); }catch(e){ err=String(e&&e.stack||e).slice(0,400); } c.err=err; c.sentEggAfter=PHONE.sent(G,'zhe_supper_mid2_egg');
                  let err2=null, r2=null; if(!c.sentEggAfter&&ev&&ev.missedPhoto){ try{ r2=ev.missedPhoto(G,d); }catch(e){ err2=String(e&&e.stack||e).slice(0,400); } } c.direct=r2; c.err2=err2; c.sentEggDirect=PHONE.sent(G,'zhe_supper_mid2_egg'); return c; })()""" % (EVID, EVID))
                rec['diag'] = dg; run.note('%s：【診斷】%s' % (tag, J(dg)))
            th = await P.phone_thread(pg, cdp, 'g:noodle_team'); rec['thread2030'] = th['text'][-600:]
            rec['shots']['group2030'] = await run.shot(pg, tag + '_group2030'); await L.close_panels(pg, cdp)
            R = await pg.evaluate(PL, n0); rec['log'] = R; rec['events'] = [x['id'] for x in R if x['k'] == 'event']
            run.check('%s：沒有跑 ev_psbh_public_0415' % tag, EVID not in rec['events'], J(rec['events']))
        okf, fs = await wait_free(pg, cdp, 60); rec['free'] = fs
        mv = await joy_moves(pg, cdp); rec['joy'] = mv
        run.check('%s：結束後不卡（對話框收、沒在忙、ADV 關；搖桿推得動 >0.3 m）' % tag, okf and max(mv) > 0.3, J({'free': fs, 'joy': mv}))
        rec['shots']['end'] = await run.shot(pg, tag + '_end')
    except Exception as e:
        run.check('%s：跑完（沒有探針例外）' % tag, False, repr(e)[:500]); traceback.print_exc()
        try: await run.shot(pg, tag + '_exception')
        except Exception: pass
    finally:
        rec['errs'] = errs[:5]
        run.check('%s：沒有 JS 例外' % tag, not errs, J(errs[:3]))
        dump(tag, **rec)
        try: await asyncio.wait_for(b.close(), 30)
        except Exception: pass


def P_hm(h):
    m = int(round(float(h) * 60)); return '%02d:%02d' % (m // 60, m % 60)


# ================================================================ (b) board
BOARDS = r"""(ids=>{ const fontOK={t:document.fonts?document.fonts.check('bold 44px "Noto Sans TC"'):null,l:document.fonts?document.fonts.check('30px "Noto Sans TC"'):null};
  const cv=document.createElement('canvas'); cv.width=1024; cv.height=256; const x=cv.getContext('2d'); const out=[];
  const hw=s=>[...s].reduce((a,ch)=>a+(/[\x20-\x7e]/.test(ch)?0.5:1),0);
  for(const id of ids){ const c=COURSES.list.find(q=>q.id===id); if(!c) continue; const room=COURSES.rooms[c.room]||{}; const syl=(SYLLABUS.courses[id]||[]);
    for(const w of syl.filter(w=>w.w===8||w.w===9)){ const b=w.board||[]; const ws=b.map((t,i)=>{ x.font=i===0?'bold 44px "Noto Sans TC",sans-serif':'30px "Noto Sans TC",sans-serif'; return +(40+x.measureText(t||'').width).toFixed(1); });
      out.push({id,name:c.name,term:c.term,w:w.w,room:c.room,zone:room.zone||null,door:!!room.door,board:b,right:ws,hw:b.map(hw),len:b.map(t=>[...(t||'')].length),
        mode:(!room.door&&room.zone==='classroom')?'3d':'caption',slots:c.slots}); } }
  return {fontOK,rows:out}; })"""
CAPSHOW = "(t=>{ GAME.caption('黑板',t,6000); })"
FINDDAY = r"""(([cid,w])=>{ const c=CLS.byId(cid); if(!c) return {err:'沒有 '+cid}; for(const s of c.slots){ const d=STORY.termDay(c.term,w,s.wd); if(d==null) continue; if(CALENDAR.holiday&&CALENDAR.holiday(d)) continue;
  const b=COURSES.blocks[s.block]; const room=COURSES.rooms[c.room]||{}; return {day:d,key:CALENDAR.dateOf(d).key,wd:s.wd,block:s.block,t0:b.t0,t1:b.t1,room:c.room,zone:room.zone||null,door:!!room.door,choice:c.choice||null,term:c.term,name:c.name,
  board:((SYLLABUS.courses[cid]||[]).find(x=>x.w===w)||{}).board||null}; } return {err:'第 '+w+' 週都放假'}; })"""
GOITEM = r"""(cid=>{ try{ const it=CLS.goList(GAME.G).find(it=>it.c.id===cid&&!it.exam); window.__IT=it||null; return it?{key:it.key,t0:it.t0,room:it.room&&it.room.name,status:CLS.status(GAME.G,it)}:null; }catch(e){ return {err:String(e.message)}; } })"""
GOFORCED = "(()=>{ if(!window.__IT) return false; void CLS.goClass(GAME,window.__IT,{forced:true}); return true; })()"
CHALK = r"""(()=>{ const out=[]; const sc=GAME.E.scene; if(!sc) return out; sc.traverse(o=>{ const ms=o.material?(Array.isArray(o.material)?o.material:[o.material]):[]; for(const m of ms){ const im=m&&m.map&&m.map.image; if(!im||im.width!==1024||im.height!==256||!im.getContext) continue;
  let v=true; for(let p=o;p;p=p.parent) if(p.visible===false){ v=false; break; }
  const x=im.getContext('2d'), D=x.getImageData(0,0,1024,256).data; let mx=-1, mn=1e9; for(let yy=0;yy<256;yy++) for(let xx=0;xx<1024;xx++){ if(D[(yy*1024+xx)*4+3]>40){ if(xx>mx) mx=xx; if(xx<mn) mn=xx; } }
  out.push({name:o.name||o.type,visible:v,minX:mn,maxX:mx,png:im.toDataURL('image/png')}); } }); return out; })()"""


async def board_measure(p, run, orient):
    tag = 'board_measure_%s' % orient; land = orient == 'land'
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=land)
    rec = {'orient': orient, 'shots': {}}
    try:
        await pg.goto(URL); ok = await L.wait_loaded(pg); run.check('%s：遊戲載入' % tag, ok)
        await pg.evaluate("localStorage.clear()"); await P.init(pg); await pg.evaluate(HOOK)
        st, d = await state_at(pg, ['Y2S1', 8, 6], 10.0, 'dorm'); await load(pg, cdp, st)
        run.setup('[前置] %s：最小存檔 %s 10:00 宿舍（只為了有畫面；條件事件關掉）' % (tag, d['key']))
        bd = await pg.evaluate(BOARDS, A585); rows = bd['rows']; rec['font'] = bd['fontOK']
        run.note('%s：字型 Noto Sans TC 可用＝%s（不可用＝畫布用 sans-serif fallback，寬度和 iPhone 不同）' % (tag, J(bd['fontOK'])))
        run.check('%s：AA_585 30 門第 8、9 週黑板都找得到（%d 塊）' % (tag, len(rows)), len(rows) == 60, J(sorted(set(r['id'] for r in rows)) if len(rows) != 60 else ''))
        hwbad = [(r['id'], r['w'], r['hw']) for r in rows if max(r['hw']) > 30]
        run.check('%s：每行半形算半格 ≤30（同 tests/syllabus_unit）' % tag, not hwbad, J(hwbad))
        over = [(r['id'], r['w'], r['right']) for r in rows if max(r['right']) > 1024]
        mx = max(rows, key=lambda r: max(r['right'])) if rows else None
        run.check('%s：3D 黑板畫布 1024 px：60 塊每行右緣（40＋字寬）≤1024（最寬 %s W%s %s px）' % (tag, mx and mx['id'], mx and mx['w'], mx and max(mx['right'])), not over, J(over))
        rec['rows'] = rows
        caps = [r for r in rows if r['mode'] == 'caption']; res = []
        for r in caps:
            t = '　'.join([x for x in r['board'] if x])
            await pg.evaluate(CAPSHOW, t); await pg.wait_for_timeout(120)
            m = await pg.evaluate(CAPM); res.append({'id': r['id'], 'w': r['w'], 'm': m})
        rec['captions'] = res
        bad = [(x['id'], x['w'], x['m']['rect'], x['m']['sw'], x['m']['cw']) for x in res if not inside(x['m']['rect'], x['m']['W'], x['m']['H']) or x['m']['sw'] > x['m']['cw'] + 1]
        lines = [x['m']['lines'] for x in res]
        run.setup('【捷徑】%s：字幕那一組 %d 塊（L202／萬才館多功能／萬才館門口）每一塊呼叫 GAME.caption(\'黑板\',三行,6000)（classes3d.js 323 的同一個呼叫）量 #caption' % (tag, len(caps)))
        run.check('%s：字幕黑板 %d 塊都在畫面內、沒有橫向溢出（scrollWidth ≤ clientWidth）' % (tag, len(caps)), bool(caps) and not bad, J(bad[:5]))
        run.note('%s：字幕行數分布 %s；max-width %s；寬 %s～%s px' % (tag, J({k: lines.count(k) for k in sorted(set(lines))}), res and res[0]['m']['maxW'],
                                                         min(x['m']['rect']['w'] for x in res) if res else '-', max(x['m']['rect']['w'] for x in res) if res else '-'))
        if res:
            lg = max(res, key=lambda x: (x['m']['lines'], len(x['m']['text'])))
            r = next(x for x in caps if x['id'] == lg['id'] and x['w'] == lg['w'])
            await pg.evaluate(CAPSHOW, '　'.join([x for x in r['board'] if x])); await pg.wait_for_timeout(700)
            m = await pg.evaluate(CAPM); rec['longest_caption'] = {'id': r['id'], 'w': r['w'], 'm': m}
            rec['shots']['caption_longest'] = await run.shot(pg, '%s_caption_%s_w%s' % (tag, r['id'], r['w']))
            run.note('%s：最多行的字幕 %s W%s：%s 行、rect %s' % (tag, r['id'], r['w'], m['lines'], J(m['rect'])))
    except Exception as e:
        run.check('%s：跑完（沒有探針例外）' % tag, False, repr(e)[:500]); traceback.print_exc()
    finally:
        run.check('%s：沒有 JS 例外' % tag, not errs, J(errs[:3])); rec['errs'] = errs[:5]
        dump(tag, **rec)
        try: await asyncio.wait_for(b.close(), 30)
        except Exception: pass


async def board_class(p, run, sub, cid, orient):
    tag = 'board_%s_%s_%s' % (sub, cid, orient); land = orient == 'land'
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=land)
    pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
    rec = {'orient': orient, 'cid': cid, 'shots': {}}
    try:
        await pg.goto(URL); ok = await L.wait_loaded(pg); run.check('%s：遊戲載入' % tag, ok)
        await pg.evaluate("localStorage.clear()"); await P.init(pg); await pg.evaluate(HOOK)
        st, d = await state_at(pg, '2025-09-20', 10.0, 'dorm'); await load(pg, cdp, st)
        fd = await pg.evaluate(FINDDAY, [cid, BOARD_WEEK]); rec['day'] = fd
        if fd.get('err'): run.check('%s：找得到第 %d 週那一堂' % (tag, BOARD_WEEK), False, J(fd)); return
        zone = fd['zone'] or 'linze'; h = fd['t0'] - 7 / 60
        flags = {'ROOM_FIRST_' + zone: True}
        st, d = await state_at(pg, fd['key'], h, zone, flags)
        if fd['choice']: st['courses']['electives'][fd['choice']['group']] = cid
        await load(pg, cdp, st)
        run.setup('[前置] %s：最小存檔 %s（%s 第 %d 週）%s %s（%s %s %s 開始；這間教室的第一次旁白關掉；條件事件關掉）'
                  % (tag, fd['key'], fd['term'], BOARD_WEEK, P_hm(h), zone, fd['name'], fd['room'], P_hm(fd['t0'])))
        it = await pg.evaluate(GOITEM, cid); rec['go'] = it; route = None
        if it and not it.get('err'):
            await P.phone_tab(pg, cdp, 'today'); sel = '#phoneBody [data-go="%s"]' % it['key']
            if await pg.evaluate("s=>!!document.querySelector(s)", sel):
                await L.tap(pg, cdp, sel); route = 'phone'; run.note('%s：手機「今天」按 %s 的出發鈕' % (tag, it['key']))
            else:
                try: await L.close_panels(pg, cdp)
                except Exception: pass
                await pg.evaluate(GOFORCED); route = 'forced'; run.setup('【捷徑】%s：手機「今天」沒有那一堂的按鈕 → CLS.goClass(GAME,it,{forced:true})' % tag)
        else: run.check('%s：goList 有那一堂' % tag, False, J(it)); return
        rec['route'] = route
        n0 = 0; t0 = time.time(); got = None
        while time.time() - t0 < ENVI('CLASS_MAX', 420):
            R = await pg.evaluate(PL, n0)
            bd = [x for x in R if x['k'] == 'board']; cp = [x for x in R if x['k'] == 'caption' and x['n'] == '黑板']
            if bd or cp: got = (bd or cp)[0]; break
            s = await P.ts(pg)
            if s['phone'] and not s['dlg'] and not s['ch']: await L.phone_away(pg, cdp, tries=2); continue
            if s['ch']:
                T = [o['t'] for o in s['ch']]
                k = next((i for i, t in enumerate(T) if t.startswith('坐中間') or t.startswith('老位子')), None)
                if k is None: k = next((i for i, t in enumerate(T) if not t.startswith('自己找位子') and not t.startswith('算了')), 0)
                run.note('%s：選單 %s → %s' % (tag, J(T), T[k])); await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1200); continue
            if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
            await pg.wait_for_timeout(500)
        rec['log'] = await pg.evaluate(PL, 0)
        run.check('%s：上課開始、黑板出現（%s）' % (tag, 'setBoard' if sub == 'class3d' else '字幕「黑板」'), bool(got) and (got['k'] == 'board') == (sub == 'class3d'), J(got))
        if not got: rec['shots']['fail'] = await run.shot(pg, tag + '_noboard'); return
        rec['board_call'] = got
        want = [x for x in (fd['board'] or []) if x]
        if got['k'] == 'board':
            await pg.wait_for_timeout(1500)
            rec['shots']['class'] = await run.shot(pg, tag + '_class')
            ch = await pg.evaluate(CHALK); rec['chalk'] = [{k: v for k, v in c.items() if k != 'png'} for c in ch]
            tex = [c for c in ch if c['maxX'] > 0 and c['visible']] or [c for c in ch if c['maxX'] > 0]
            for i, c in enumerate(ch):
                pth = os.path.join(OUT, '%s_chalk%d.png' % (tag, i))
                with open(pth, 'wb') as f: f.write(base64.b64decode(c['png'].split(',', 1)[1]))
                rec['shots']['chalk%d' % i] = pth
            run.check('%s：setBoard 三行＝AA_585 第 %d 週黑板' % (tag, BOARD_WEEK), got['t'] == (fd['board'] or [])[:3], J({'call': got['t'], 'syllabus': fd['board']}))
            mxs = [c['maxX'] for c in tex]
            run.check('%s：黑板貼圖（1024×256）最右邊有字的像素 <1020（沒有被畫布右緣切掉）' % tag, bool(tex) and max(mxs) < 1020, J(rec['chalk']))
            run.note('%s：黑板貼圖 %s；畫面截圖 %s（鏡頭不一定對著黑板，只記）' % (tag, J(rec['chalk']), rec['shots']['class']))
        else:
            await pg.wait_for_timeout(300)
            m = await pg.evaluate(CAPM); rec['caption'] = m
            rec['shots']['caption'] = await run.shot(pg, tag + '_caption')
            run.check('%s：字幕文字＝黑板三行（全形空白接）' % tag, got['t'] == '　'.join(want), J({'cap': got['t'], 'want': want}))
            run.check('%s：字幕在畫面內、沒有橫向溢出（%s 行）' % (tag, m['lines']), not m['hidden'] and inside(m['rect'], m['W'], m['H']) and m['sw'] <= m['cw'] + 1, J(m))
            dm = await pg.evaluate(DLGM); rec['dlg_at_caption'] = {k: dm[k] for k in ('vis', 'dlg', 'text')}
            ovl = dm['vis'] and dm['dlg'] and min(dm['dlg']['r'], m['rect']['r']) - max(dm['dlg']['l'], m['rect']['l']) > 0.5 and min(dm['dlg']['b'], m['rect']['b']) - max(dm['dlg']['t'], m['rect']['t']) > 0.5
            run.check('%s：（只記）字幕和對話框重疊＝%s' % (tag, bool(ovl)), True, J({'dlg': dm['dlg'], 'cap': m['rect']}))
    except Exception as e:
        run.check('%s：跑完（沒有探針例外）' % tag, False, repr(e)[:500]); traceback.print_exc()
        try: await run.shot(pg, tag + '_exception')
        except Exception: pass
    finally:
        run.check('%s：沒有 JS 例外' % tag, not errs, J(errs[:3])); rec['errs'] = errs[:5]
        dump(tag, **rec)
        try: await asyncio.wait_for(b.close(), 30)
        except Exception: pass


# ================================================================ (c) card
CARDINFO = r"""(id=>{ const u=STUDY.unit(id); if(!u) return {err:'沒有 '+id}; const c=CLS.byId(u.course); const v=STUDY.view(u); const lines=STUDY.cardLines(u);
  const rd=STUDY.remindDay(u.term); return {id,course:u.course,name:c&&c.name,term:u.term,week:u.week,title:v.title,plain:v.plain,example:v.example,lines,chunk:STUDY.CARD_CHUNK,remindKey:rd!=null?CALENDAR.dateOf(rd).key:null}; })"""
REVINFO = r"""(()=>{ const i=STUDY.reviewInfo(GAME.G,'final'); const o=STUDY.reviewOpt(GAME.G); return {info:i?{term:i.term,courses:i.courses.map(x=>({id:x.c.id,name:x.c.name,n:x.units.length,ids:x.units.map(u=>u.id)}))}:null,opt:o}; })()"""
DESK = r"""(()=>{ const it=(GAME.E.interactables||[]).find(x=>x.deskStudy); if(!it) return null; void STORY.interact(it,GAME); return {x:it.x,z:it.z,label:it.label||null}; })()"""


async def card_pass(p, run, orient):
    tag = 'card_%s_%s' % (CARD, orient); land = orient == 'land'
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=land)
    pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
    rec = {'orient': orient, 'card': CARD, 'shots': {}, 'chunks': []}
    try:
        await pg.goto(URL); ok = await L.wait_loaded(pg); run.check('%s：遊戲載入' % tag, ok)
        await pg.evaluate("localStorage.clear()"); await P.init(pg); await pg.evaluate(HOOK)
        ci = await pg.evaluate(CARDINFO, CARD); rec['info'] = {k: v for k, v in ci.items() if k != 'plain'}
        if ci.get('err'): run.check('%s：找得到卡' % tag, False, J(ci)); return
        lines = ci['lines']; plain = ci['plain']
        run.note('%s：%s〈%s〉白話 %d 字、例子 %d 字 → %d 則 %s' % (tag, ci['name'], ci['title'], len(plain), len(ci['example']), len(lines), J([len(x) for x in lines])))
        body = [x for x in lines if not x.startswith('例子：') and not x.startswith('課堂提問：')]
        enders = all(x[-1] in '。！？' for x in body[:-1]) if len(body) > 1 else True
        run.check('%s：分段：白話照句號分成 %d 則（每則 ≤%d 字或單句；接起來＝原文；例子另一則）' % (tag, len(body), ci['chunk']),
                  len(lines) > 1 and ''.join(body) == plain and enders and all(len(x) <= ci['chunk'] or x.count('。') <= 1 for x in body) and (not ci['example'] or ('例子：' + ci['example']) in lines),
                  J([len(x) for x in lines]))
        st, d = await state_at(pg, ci['remindKey'], 10.0, 'dorm'); await load(pg, cdp, st)
        run.setup('[前置] %s：最小存檔 %s（%s 期末週前一週的週日）10:00 宿舍；條件事件關掉' % (tag, ci['remindKey'], ci['term']))
        ri = await pg.evaluate(REVINFO); rec['review'] = ri
        crs = [x['id'] for x in (ri['info'] or {}).get('courses', [])]
        run.check('%s：前置成立（總複習開著、範圍有 %s、有這張卡）' % (tag, ci['course']), ci['course'] in crs and any(CARD in x['ids'] for x in ri['info']['courses']), J(ri))
        dk = await pg.evaluate(DESK); rec['desk'] = dk
        run.setup('【捷徑】%s：STORY.interact(宿舍書桌互動點, GAME)（按「書桌」的同一個處理函式；沒有走過去）%s' % (tag, J(dk)))
        if not dk: run.check('%s：宿舍有書桌互動點' % tag, False); return
        cname = ci['name']; last_n = -1; target_hdr = None; in_target = False; done_target = False; idx = 0; t0 = time.time(); menu_shot = False
        while time.time() - t0 < ENVI('CARD_MAX', 900):
            s = await P.ts(pg)
            if s['phone'] and not s['dlg'] and not s['ch']: await L.phone_away(pg, cdp, tries=2); continue
            if s['ch']:
                T = [o['t'] for o in s['ch']]
                if any(t.startswith('考前總複習') for t in T):   # 按鈕文字含提示（「考前總複習這學期還要考的…」）
                    if not menu_shot: rec['shots']['menu'] = await run.shot(pg, tag + '_deskmenu'); menu_shot = True
                    k = next(i for i, t in enumerate(T) if t.startswith('考前總複習'))
                elif done_target and any(t.startswith('結束總複習') for t in T): k = next(i for i, t in enumerate(T) if t.startswith('結束總複習'))
                elif target_hdr is None and any(t.startswith('跳到下一科') for t in T): k = next(i for i, t in enumerate(T) if t.startswith('跳到下一科'))
                elif any(t.startswith('下一張') for t in T): k = next(i for i, t in enumerate(T) if t.startswith('下一張'))
                else: k = 0
                run.note('%s：選單 %s → %s' % (tag, J(T), T[k])); await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1000)
                if done_target and T[k].startswith('結束總複習'): break
                continue
            if s['dlg']:
                says = [x for x in await pg.evaluate(PL, 0) if x['k'] == 'say']   # 現在這一句＝GAME.say 的最後一句（輪詢看畫面會漏句）
                tx = says[-1]['t'] if says else ''
                if len(says) == last_n: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue   # 這一句處理過了（上一次的點擊還沒換句）
                last_n = len(says)
                m = await pg.evaluate(DLGM)
                if m['text'] != tx: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); m = await pg.evaluate(DLGM)   # 打字中：點一下打完
                if tx.startswith('【') and in_target: in_target = False; done_target = True   # 下一張卡的標題列＝那一張結束
                if tx.startswith('【' + cname + '　'):
                    target_hdr = target_hdr or ('course:' + tx)   # 已經在那一科：之後只按「下一張」
                    if not done_target and ci['title'] in tx and 'header' not in rec:
                        target_hdr = tx; in_target = True; idx = 0; rec['header'] = tx; rec['shots']['header'] = await run.shot(pg, tag + '_header')
                elif in_target and idx < len(lines) and tx == lines[idx]:
                    shp = await run.shot(pg, '%s_chunk%d' % (tag, idx + 1))
                    rec['chunks'].append({'i': idx, 'len': len(tx), 'm': m, 'shot': shp})
                    W, H = m['W'], m['H']; full = m['text'] == lines[idx]
                    clip = not (m['txtScroll'][0] <= m['txtScroll'][1] + 2 or m['ovf']['txtY'] in ('auto', 'scroll'))
                    samp = all(x['inView'] and x['inDlg'] for x in m['samples'])
                    run.check('%s：第 %d／%d 則（%d 字）對話框在畫面內、文字完整、沒被裁（取樣點在畫面內且最上層是 #dlg）' % (tag, idx + 1, len(lines), len(tx)),
                              m['vis'] and inside(m['dlg'], W, H) and full and not clip and samp,
                              J({'dlg': m['dlg'], 'txt': m['txt'], 'scroll': m['txtScroll'], 'ovf': m['ovf'], 'samples': m['samples'], 'font': m['font']}))
                    idx += 1
                    if idx >= len(lines): done_target = True; in_target = False
                await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
            if done_target and not s['busy'] and s['depth'] == 0: break
            await pg.wait_for_timeout(600)
        run.check('%s：那一張的 %d 則都出現過（實際 %d 則）' % (tag, len(lines), len(rec['chunks'])), len(rec['chunks']) == len(lines), J(rec.get('header')))
        if rec['chunks']:
            hs = [c['m']['dlg']['h'] for c in rec['chunks']]
            run.note('%s：每則對話框高 %s px（視窗高 %s）；文字區 overflow-y %s' % (tag, J(hs), rec['chunks'][0]['m']['H'], rec['chunks'][0]['m']['ovf']['txtY']))
        okf, fs = await wait_free(pg, cdp, 90); rec['free'] = fs
        rec['log'] = (await pg.evaluate(PL, 0))[-80:]
        run.check('%s：結束總複習後不卡（對話框收、沒在忙）' % tag, okf, J(fs))
        rec['shots']['end'] = await run.shot(pg, tag + '_end')
    except Exception as e:
        run.check('%s：跑完（沒有探針例外）' % tag, False, repr(e)[:500]); traceback.print_exc()
        try: await run.shot(pg, tag + '_exception')
        except Exception: pass
    finally:
        run.check('%s：沒有 JS 例外' % tag, not errs, J(errs[:3])); rec['errs'] = errs[:5]
        dump(tag, **rec)
        try: await asyncio.wait_for(b.close(), 30)
        except Exception: pass


# ================================================================ 4e72c157a 追加（BB 16:59）：psbhbg、boardcap2、ancf
ADVST = r"""(()=>{ const A=typeof ADV!=='undefined'?ADV:null; if(!A) return null; const m=A.bgMode; return {active:!!A.active,mode:m&&typeof m==='object'?{image:m.image||null}:(m==null?null:String(m)),
  bgImg:A.bg&&A.bg.style?A.bg.style.backgroundImage:null,cls:A.root?A.root.className:null,cgImg:A.cgEl&&A.cgEl.style?A.cgEl.style.backgroundImage:null}; })()"""
CGST = r"""(()=>{ const G=GAME.G; return {unlocked:(G.cg&&G.cg.unlocked||[]).slice(),reg:typeof CG_REGISTRY!=='undefined'&&!!CG_REGISTRY.cg_reason_column_heroine01,regFile:typeof CG_REGISTRY!=='undefined'&&CG_REGISTRY.cg_reason_column_heroine01?CG_REGISTRY.cg_reason_column_heroine01.file:null}; })()"""


def pick_by(opts, prefs):
    for pf in prefs:
        for i, o in enumerate(opts):
            if not o['dim'] and o['t'].startswith(pf): return i
    for i, o in enumerate(opts):
        if not o['dim']: return i
    return 0


async def play(pg, cdp, run, tag, prefs=(), shot_if=None, max_s=600, idle_s=5, stop=None):
    """照 GAME.say 的紀錄一句一句點（輪詢畫面會漏句）；選單照 prefs（開頭符合、照順序），沒有＝第一個沒變暗的。
    shot_if(text, idx)→名字（要截圖）或 None。回傳 {lines:[{n,t,adv,shot}], chose:[{opts,picked,shot}]}"""
    t0 = time.time(); last_n = None; idle = None; out = {'lines': [], 'chose': []}; started = False
    while time.time() - t0 < max_s:
        s = await P.ts(pg)
        if s['phone'] and not s['dlg'] and not s['ch']: await L.phone_away(pg, cdp, tries=2); continue
        if s['ch']:
            started = True; idle = None; await pg.wait_for_timeout(500); s = await P.ts(pg)
            if not s['ch']: continue
            k = pick_by(s['ch'], prefs); nm = shot_if('__choice__', len(out['chose'])) if shot_if else None
            shp = await run.shot(pg, '%s_%s' % (tag, nm)) if nm else None
            out['chose'].append({'opts': [o['t'] for o in s['ch']], 'picked': s['ch'][k]['t'], 'shot': shp})
            run.note('%s：選單 %s → %s' % (tag, J([o['t'] for o in s['ch']]), s['ch'][k]['t']))
            await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1200); continue
        if s['dlg']:
            started = True; idle = None
            says = [x for x in await pg.evaluate(PL, 0) if x['k'] == 'say']
            if last_n is not None and len(says) == last_n: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
            for x in says[(last_n or 0) if last_n is not None else len(says) - 1:-1]: out['lines'].append({'n': x['n'], 't': x['t'], 'h': x.get('h'), 'adv': None, 'shot': None, 'missed': True})   # 兩次輪詢之間就點過去的句子（只記字）
            last_n = len(says); cur = says[-1] if says else {'n': '', 't': ''}
            m = await pg.evaluate(DLGM)
            if m['text'] != cur['t']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500)
            adv = await pg.evaluate(ADVST); nm = shot_if(cur['t'], len(out['lines'])) if shot_if else None
            shp = await run.shot(pg, '%s_%s' % (tag, nm)) if nm else None
            out['lines'].append({'n': cur['n'], 't': cur['t'], 'h': cur.get('h'), 'adv': adv, 'shot': shp})
            if stop and stop(cur['t']): return out
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
        if s['busy'] or s['depth'] > 0: idle = None; await pg.wait_for_timeout(500); continue
        if started:
            idle = idle or time.time()
            if time.time() - idle > idle_s: break
        elif time.time() - t0 > 30: break
        await pg.wait_for_timeout(500)
    return out


async def psbhbg_pass(p, run, orient):
    """UX-PSBH-BG：4/15 麵店那一幕的背景＝noodle_table（2D）。前置同 noodle in"""
    tag = 'psbhbg_%s' % orient; land = orient == 'land'
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=land)
    pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
    rec = {'orient': orient}
    try:
        await pg.goto(URL); ok = await L.wait_loaded(pg); run.check('%s：遊戲載入' % tag, ok)
        await pg.evaluate("localStorage.clear()"); await P.init(pg); await pg.evaluate(HOOK)
        st, d = await state_at(pg, ['Y1S2', 8, 3], 16 + 59 / 60, 'noodle'); await load(pg, cdp, st)
        su = await pg.evaluate(SETUP_PS); snap = await P.snapshot(pg); await load(pg, cdp, snap); await P.events_on(pg)
        run.setup('[前置] %s：最小存檔 %s 16:59 麵店；【捷徑】認識沛珊、柏翰、阿哲、加入麵店團群組 → 快照重讀；條件事件打開；URL %s' % (tag, d['key'], URL))
        run.check('%s：前置成立' % tag, su['key'] == '2026-04-15' and su['psbh'], J(su))
        r = await play(pg, cdp, run, tag, shot_if=lambda t, i: ('line1' if t == PS_LINES[0] else ('line4' if t == PS_LINES[3] else None)), max_s=ENVI('EV_MAX', 300))
        R = await pg.evaluate(PL, 0); rec['log'] = R; rec['play'] = r
        advs = [x for x in R if x['k'] == 'adv']; rec['adv_calls'] = advs
        ev = [x['id'] for x in R if x['k'] == 'event']
        says = [x['t'] for x in R if x['k'] == 'say']
        run.check('%s：ev_psbh_public_0415 演了（6 句，GAME.say 紀錄）' % tag, EVID in ev and [t for t in says if t in PS_LINES] == PS_LINES, J(says))
        beg = next((x for x in advs if x['fn'] == 'begin'), None)
        run.check('%s：（只記）ADV.begin 的 background＝%s；之後 setBg %s' % (tag, J(beg and beg['arg']), J([x['arg'] for x in advs if x['fn'] == 'setBg'])), True)
        l1 = next((l for l in r['lines'] if l['t'] == PS_LINES[0]), None); l4 = next((l for l in r['lines'] if l['t'] == PS_LINES[3]), None)
        for nm_, l in (('第 1 句', l1), ('第 4 句', l4)):
            a = l and l['adv']
            run.check('%s：%s的背景是 noodle_table 2D 圖（ADV.bgMode 是圖、#advBg 是 noodle_table）' % (tag, nm_),
                      bool(a) and a['active'] and isinstance(a['mode'], dict) and 'noodle_table' in str(a['mode'].get('image')) and 'noodle_table' in str(a['bgImg']), J(a))
        rec['shots'] = [l['shot'] for l in r['lines'] if l['shot']]
        okf, fs = await wait_free(pg, cdp, 60); mv = await joy_moves(pg, cdp)
        run.check('%s：結束後不卡' % tag, okf and max(mv) > 0.3, J({'free': fs, 'joy': mv}))
    except Exception as e:
        run.check('%s：跑完（沒有探針例外）' % tag, False, repr(e)[:500]); traceback.print_exc()
    finally:
        run.check('%s：沒有 JS 例外' % tag, not errs, J(errs[:3])); rec['errs'] = errs[:5]
        dump(tag, **rec)
        try: await asyncio.wait_for(b.close(), 30)
        except Exception: pass


# 字幕「黑板」出現後的第一句 GAME.say：頁面裡在那一句畫出來以後（300 ms）量字幕和對話框（不靠 Python 輪詢，SwiftShader 太慢會錯過）
CAPHOOK = r"""(()=>{ if(window.__CAPH) return 'again'; window.__CAPH=1; window.__capAt=null; window.__CAPDLG=null;
  const R=e=>{ const b=e.getBoundingClientRect(); return {l:+b.left.toFixed(1),t:+b.top.toFixed(1),r:+b.right.toFixed(1),b:+b.bottom.toFixed(1),w:+b.width.toFixed(1),h:+b.height.toFixed(1)}; };
  const meas=(why)=>{ const c=document.getElementById('caption'), d=document.getElementById('dlg'), cs=getComputedStyle(c), ds=getComputedStyle(d);
    return {why,ms:Math.round(performance.now()),W:innerWidth,H:innerHeight,cap:R(c),capHidden:c.classList.contains('hide'),capOp:+cs.opacity,capBottom:cs.bottom,capText:(c.textContent||''),
      dlg:R(d),dlgHidden:d.classList.contains('hide'),dlgText:(document.getElementById('dlgText').textContent||''),dlgH:getComputedStyle(document.getElementById('ui')).getPropertyValue('--dlgH'),
      hasSel:(()=>{ try{ return document.querySelector('#ui:has(#dlg:not(.hide)) #caption')!==null; }catch(e){ return 'unsupported'; } })()}; };
  window.__capMeas=meas;
  const p0=GAME.caption; GAME.caption=function(w,t){ const r=p0.apply(this,arguments); if(w==='黑板'){ window.__capAt=performance.now(); window.__CAPM0=meas('caption'); } return r; };
  const s0=GAME.say; GAME.say=function(w,t){ const r=s0.apply(this,arguments); if(window.__capAt&&!window.__CAPDLG&&performance.now()-window.__capAt<6000){ window.__SAY1=String(t); setTimeout(()=>{ window.__CAPDLG=meas('say'); },300); } return r; };
  return 'ok'; })()"""


async def boardcap2_pass(p, run, orient, cid='tax_law'):
    """UX-BOARDCAP-LAND：實際上課，字幕「黑板」和老師那一句同時在畫面上：字幕底 ≤ 對話框頂"""
    tag = 'boardcap2_%s_%s' % (cid, orient); land = orient == 'land'
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=land)
    pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
    rec = {'orient': orient, 'cid': cid, 'shots': {}}
    try:
        await pg.goto(URL); ok = await L.wait_loaded(pg); run.check('%s：遊戲載入' % tag, ok)
        await pg.evaluate("localStorage.clear()"); await P.init(pg); await pg.evaluate(HOOK)
        st, d = await state_at(pg, '2025-09-20', 10.0, 'dorm'); await load(pg, cdp, st)
        await pg.evaluate(CAPHOOK)
        fd = await pg.evaluate(FINDDAY, [cid, BOARD_WEEK]); rec['day'] = fd
        if fd.get('err'): run.check('%s：找得到第 %d 週那一堂' % (tag, BOARD_WEEK), False, J(fd)); return
        zone = fd['zone'] or 'linze'; h = fd['t0'] - 7 / 60
        st, d = await state_at(pg, fd['key'], h, zone, {'ROOM_FIRST_' + zone: True})
        if fd['choice']: st['courses']['electives'][fd['choice']['group']] = cid
        await load(pg, cdp, st)
        run.setup('[前置] %s：最小存檔 %s（%s 第 %d 週）%s %s（%s %s，%s 開始；這間教室第一次的旁白關掉；條件事件關掉）'
                  % (tag, fd['key'], fd['term'], BOARD_WEEK, P_hm(h), zone, fd['name'], fd['room'], P_hm(fd['t0'])))
        it = await pg.evaluate(GOITEM, cid); rec['go'] = it
        if not it or it.get('err'): run.check('%s：goList 有那一堂' % tag, False, J(it)); return
        await P.phone_tab(pg, cdp, 'today'); sel = '#phoneBody [data-go="%s"]' % it['key']
        if await pg.evaluate("s=>!!document.querySelector(s)", sel): await L.tap(pg, cdp, sel); rec['route'] = 'phone'
        else:
            await L.close_panels(pg, cdp); await pg.evaluate(GOFORCED); rec['route'] = 'forced'; run.setup('【捷徑】%s：手機「今天」沒有按鈕 → CLS.goClass forced' % tag)
        t0 = time.time(); got = None
        while time.time() - t0 < ENVI('CLASS_MAX', 420):
            got = await pg.evaluate("window.__CAPDLG")
            if got: break
            capAt = await pg.evaluate("window.__capAt")
            s = await P.ts(pg)
            if s['phone'] and not s['dlg'] and not s['ch']: await L.phone_away(pg, cdp, tries=2); continue
            if s['ch'] and not capAt:
                T = [o['t'] for o in s['ch']]
                k = next((i for i, t in enumerate(T) if t.startswith('坐中間') or t.startswith('老位子')), None)
                if k is None: k = next((i for i, t in enumerate(T) if not t.startswith('自己找位子') and not t.startswith('算了')), 0)
                run.note('%s：選單 %s → %s' % (tag, J(T), T[k])); await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1200); continue
            if s['dlg'] and not capAt: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
            await pg.wait_for_timeout(200)
        if not got:
            rec['shots']['fail'] = await run.shot(pg, tag + '_nocap'); run.check('%s：字幕「黑板」之後老師那一句出現' % tag, False, J(await pg.evaluate("[window.__capAt,window.__CAPM0]"))); return
        rec['shots']['both'] = await run.shot(pg, tag + '_cap_and_say')   # 不點對話框：老師那一句停著，字幕 6 秒內
        live = await pg.evaluate("window.__capMeas('shot')"); rec['inpage'] = got; rec['live'] = live; rec['m0'] = await pg.evaluate("window.__CAPM0"); rec['say1'] = await pg.evaluate("window.__SAY1")
        rec['log'] = await pg.evaluate(PL, 0)
        for nm_, m in (('老師那一句畫出來 300 ms', got), ('截圖之後', live)):
            vis = not m['capHidden'] and m['capOp'] > 0.5 and not m['dlgHidden']
            gap = round(m['dlg']['t'] - m['cap']['b'], 1)
            run.check('%s：%s：字幕和對話框同時在畫面上、字幕底 %s ≤ 對話框頂 %s（間距 %s px）' % (tag, nm_, m['cap']['b'], m['dlg']['t'], gap),
                      vis and gap >= 0 and inside(m['cap'], m['W'], m['H']), J({k: m[k] for k in ('cap', 'capHidden', 'capOp', 'capBottom', 'dlg', 'dlgHidden', 'dlgH', 'hasSel', 'dlgText', 'capText')}))
        run.note('%s：老師那一句「%s」；字幕「%s」；:has() 支援＝%s' % (tag, rec['say1'], got['capText'], got['hasSel']))
    except Exception as e:
        run.check('%s：跑完（沒有探針例外）' % tag, False, repr(e)[:500]); traceback.print_exc()
        try: await run.shot(pg, tag + '_exception')
        except Exception: pass
    finally:
        run.check('%s：沒有 JS 例外' % tag, not errs, J(errs[:3])); rec['errs'] = errs[:5]
        dump(tag, **rec)
        try: await asyncio.wait_for(b.close(), 30)
        except Exception: pass


# ---------------- 以安告白（3043c1d27）
AN = 'heroine_01'
SETUP_AN = r"""(term=>{ const G=GAME.G, id='heroine_01'; G.contacts=G.contacts||{}; const R=SOCIAL.rel(id); R.fam=Math.max(R.fam|0,60); R.trust=Math.max(R.trust|0,50); R.comf=Math.max(R.comf|0,50); R.npcRom=Math.max(+R.npcRom||0,45); R.rom=Math.max(+R.rom||0,45);
  if(!SOCIAL.has(id,'FIRST_MET')) SOCIAL.remember(id,'FIRST_MET',''); if(G.contacts[id]==null) G.contacts[id]=G.day-30;
  const Lg=DATE.log(G,id); Lg.count=Math.max(Lg.count|0,4); Lg.wish=true; Lg.wishKnown=true;
  const w=TERMEND.windowOf(term); const P=TERMEND.plan(G,w); const Rt=TERMEND.rec(G);
  return {term,w:{from:CALENDAR.dateOf(w.from).key,to:CALENDAR.dateOf(w.to).key},plan:{back:P.back!=null?CALENDAR.dateOf(P.back).key:null,heart:P.heart,friend:P.friend,fallback:P.fallback,nope:P.nope},
    cond:TERMEND.cond(G,id),think:Rt.think,dating:!!G.flags['dating_'+id],stage:SOCIAL.stage(id),npcRom:R.npcRom}; })"""
TESTATE = r"""(term=>{ const G=GAME.G, id='heroine_01', R=TERMEND.rec(G,term), Rt=TERMEND.rec(G); const q=OUT.get(G,'te_'+term);
  const msgs=(G.msgs||[]).filter(m=>m.th==='p:'+id&&/^te_/.test(m.tag||'')).map(m=>({tag:m.tag,day:CALENDAR.dateOf(m.day).key,h:m.h,text:String(m.text||''),ask:m.ask?m.ask.opts.map(o=>o.t):null}));
  return {picked:R.picked||null,done:R.done||null,result:R.result||null,second:R.second||null,think:Rt.think,dating:!!G.flags['dating_'+id],confessed:G.flags.confessed||null,
    out:q?{day:q.day,key:CALENDAR.dateOf(q.day).key,h:q.h,state:q.state,title:q.title}:null,msgs,queued:PHONE.sent(G,'te_'+term+'_'+id)}; })"""
AN_KEY = ('想去的店', '和你', '勾了', '你不說的話', '最下面那一行', '這一行我先不劃掉', '同一家', '走一下', '走出店門')


async def an_term(pg, cdp, run, tag, term, prefs, land, rec):
    """一個學期：【前置】時段前一天設條件、算 plan → 跳到邀約那天 20:20 → 手機邀約（截圖）→「好。」→ 跳到那天 18:20 → 出發 → 飯 → 回家路上"""
    R = {}
    w0 = await pg.evaluate("t=>{ const w=TERMEND.windowOf(t); return {from:w.from,key:CALENDAR.dateOf(w.from-1).key}; }", term)
    await P.jump(pg, cdp, run, w0['key'], 10.0, 'dorm', pos=None, note='（%s 期末時段前一天：設條件）' % term)
    su = await pg.evaluate(SETUP_AN, term); R['setup'] = su
    run.setup('【捷徑】%s %s：以安 npcRom≥45、熟度、FIRST_MET、DATE.log 正式約會 4 次＋心願地點（C1、C2）；TERMEND.plan 先算好 → %s' % (tag, term, J(su)))
    run.check('%s %s：心意邀約排了以安（plan.heart）' % (tag, term), AN in su['plan']['heart'], J(su))
    if AN not in su['plan']['heart']: return R
    snap = await P.snapshot(pg)
    await P.jump(pg, cdp, run, su['plan']['back'], 20 + 20 / 60, 'dorm', snap=snap, note='（邀約那天 20:20，等 20:30 她的訊息）')
    await P.wait_hour(pg, cdp, 20.55, max_s=300); await pg.wait_for_timeout(3000)
    st = await pg.evaluate(TESTATE, term); R['invite'] = st['msgs']
    th = await P.phone_thread(pg, cdp, 'p:' + AN); R['thread'] = th['text'][-500:]; R['asks'] = th['asks']
    R['shot_invite'] = await run.shot(pg, '%s_%s_invite' % (tag, term))
    ans = await P.phone_answer(pg, cdp, 'p:' + AN, '好。'); R['shot_answer'] = await run.shot(pg, '%s_%s_answered' % (tag, term)); await L.close_panels(pg, cdp)
    t1 = time.time()
    while time.time() - t1 < 60:   # TE_PICK → 下一次手機規則（pickCheck）才排出遊
        st = await pg.evaluate(TESTATE, term)
        if st['out']: break
        await pg.wait_for_timeout(2000)
    R['after_ok'] = st
    run.check('%s %s：手機邀約（%s）→ 按「好。」→ 排了出遊 te_%s' % (tag, term, J([m['text'] for m in st['msgs']]), term), ans is not None and st['out'] is not None, J({'asks': th['asks'], 'out': st['out'], 'picked': st['picked']}))
    if not st['out']: return R
    q = st['out']; await P.jump(pg, cdp, run, q['key'], q['h'] - 0.6, 'dorm', note='（飯那天 %s，等出發的提示）' % P_hm(q['h']))
    n0 = await pg.evaluate(PLN)
    def shot_if(t, i):
        if t == '__choice__': return 'choice%d' % (i + 1)
        if not land: return 'L%02d' % (i + 1)
        return ('L%02d' % (i + 1)) if any(k in t for k in AN_KEY) else None
    r = await play(pg, cdp, run, '%s_%s' % (tag, term), prefs=('出發',) + tuple(prefs), shot_if=shot_if, max_s=ENVI('AN_MAX', 900), idle_s=8)
    if not r['lines']:
        st2 = await pg.evaluate(TESTATE, term); run.setup('【捷徑】%s %s：30 秒內沒有出發的提示（%s）→ 直接 OUT.go(GAME, 那一趟)' % (tag, term, J(st2['out'])))
        await pg.evaluate("t=>{ void OUT.go(GAME, OUT.get(GAME.G,'te_'+t)); }", term); R['forced_go'] = True
        r = await play(pg, cdp, run, '%s_%s' % (tag, term), prefs=tuple(prefs), shot_if=shot_if, max_s=ENVI('AN_MAX', 900), idle_s=8)
    R['play'] = r; R['log'] = await pg.evaluate(PL, n0); R['end'] = await pg.evaluate(TESTATE, term); R['cg'] = await pg.evaluate(CGST)
    return R


async def ancf_pass(p, run, orient):
    tag = 'ancf_%s' % orient; land = orient == 'land'
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=land)
    pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
    rec = {'orient': orient}
    try:
        await pg.goto(URL); ok = await L.wait_loaded(pg); run.check('%s：遊戲載入' % tag, ok)
        await pg.evaluate("localStorage.clear()"); await P.init(pg); await pg.evaluate(HOOK)
        st, d = await state_at(pg, '2025-12-20', 10.0, 'dorm'); await load(pg, cdp, st)
        run.setup('[前置] %s：最小存檔（法律系、大一上）；條件事件關掉、手機不自動打開' % tag)
        rec['cg0'] = await pg.evaluate(CGST)
        # 第一次（大一上）：（先不說）→ 她說 →「讓我想想。」
        R1 = await an_term(pg, cdp, run, tag, 'Y1S1', ('（先不說）', '「讓我想想。」'), land, rec); rec['Y1S1'] = R1
        if R1.get('play'):
            L1 = R1['play']['lines']; T1 = [l['t'] for l in L1]
            walk = [l for l in L1 if l['adv'] and l['adv']['active'] and 'gongguan' in J(l['adv'])]
            advs = [x for x in R1['log'] if x['k'] == 'adv']
            begs = [x['arg'] for x in advs if x['fn'] == 'begin']
            run.check('%s：(a) 回家路上 ADV.begin 背景＝gongguan（公館巷子）（全部 begin：%s）' % (tag, J(begs)), any('gongguan' in J(a) for a in begs), '')
            iw = next((i for i, t in enumerate(T1) if t.startswith('（走出店門')), -1)
            run.check('%s：(a) 「（走出店門，她沒有往宿舍那邊走。）」那一句畫面背景是 gongguan 圖（#advBg）' % tag, iw >= 0 and 'gongguan' in str(L1[iw]['adv'] and L1[iw]['adv']['bgImg']), J(L1[iw]['adv'] if iw >= 0 else T1[-12:]))
            want = '（那一頁的標題是「想去的店」。一行一家，前面的都打了勾，今天這一家也勾了。最下面一行沒有店名，只寫著：和你。）'
            run.check('%s：(b) 手帳那一頁＝「想去的店」、最下面一行「和你」（逐字）' % tag, want in T1, J([t for t in T1 if '手帳' in t or '想去' in t]))
            run.check('%s：(b) 選單有「（先不說）」→ 她說 → 「讓我想想。」→「好。這一行我先不劃掉。」、這學期沒交往' % tag,
                      '好。這一行我先不劃掉。' in T1 and R1['end']['result'] == 'think' and not R1['end']['dating'], J({'chose': [c['picked'] for c in R1['play']['chose']], 'end': R1['end']}))
        # 第二次（大一下）：invite2 → （先不說）→ she2 →「好。」
        R2 = await an_term(pg, cdp, run, tag, 'Y1S2', ('（先不說）', '「好。」'), land, rec); rec['Y1S2'] = R2
        if R2.get('play'):
            T2 = [l['t'] for l in R2['play']['lines']]
            run.check('%s：第二次的邀約＝「考完了。七點，同一家。」' % tag, any(m['text'] == '考完了。七點，同一家。' for m in R2['invite']), J(R2['invite']))
            run.check('%s：(d) 第二次她說＝「上次那一頁，最下面那一行還沒勾。……你要看嗎？」（3043c1d27 的 she2）' % tag, '上次那一頁，最下面那一行還沒勾。……你要看嗎？' in T2, J(T2[-10:]))
            run.check('%s：(d)（只記）AN_SHOP_PAGE（AA_589 承接字）在這一版沒有出現（src 裡找不到）' % tag, True, J([t for t in T2 if '想去的店' in t or '那一頁' in t]))
            run.check('%s：第二次「好。」→ 交往' % tag, R2['end']['dating'], J(R2['end']))
        cgs = [x for k in ('Y1S1', 'Y1S2') for x in (rec.get(k, {}).get('log') or []) if x['k'] == 'adv' and x['fn'] == 'cg']
        cgE = await pg.evaluate(CGST); rec['cgEnd'] = cgE
        run.check('%s：(c) 沒有呼叫 ADV.cg、存檔 G.cg.unlocked 沒有 cg_reason_column_heroine01（登錄表還在＝%s %s）' % (tag, cgE['reg'], cgE['regFile']),
                  not any('reason_column' in J(x) for x in cgs) and 'cg_reason_column_heroine01' not in cgE['unlocked'], J({'cg_calls': cgs, 'unlocked': cgE['unlocked']}))
        with open(os.path.join(OUT, '%s_lines.txt' % tag), 'w', encoding='utf-8') as f:
            for k in ('Y1S1', 'Y1S2'):
                Rk = rec.get(k) or {}; f.write('==== %s ====\n手機：%s\n' % (k, J([m['text'] for m in Rk.get('invite') or []])))
                for x in (Rk.get('log') or []):
                    if x['k'] == 'say': f.write('%s：%s\n' % (x['n'] or '（旁白）', x['t']))
                    elif x['k'] == 'choose': f.write('［選項］%s\n' % J(x['t']))
                    elif x['k'] == 'adv': f.write('［ADV.%s］%s\n' % (x['fn'], J(x['arg'])))
                    elif x['k'] == 'caption': f.write('［字幕］%s\n' % x['t'])
                f.write('選了：%s\n結果：%s\n\n' % (J([c['picked'] for c in (Rk.get('play') or {}).get('chose', [])]), J(Rk.get('end'))))
    except Exception as e:
        run.check('%s：跑完（沒有探針例外）' % tag, False, repr(e)[:500]); traceback.print_exc()
        try: await run.shot(pg, tag + '_exception')
        except Exception: pass
    finally:
        run.check('%s：沒有 JS 例外' % tag, not errs, J(errs[:3])); rec['errs'] = errs[:5]
        dump(tag, **rec)
        try: await asyncio.wait_for(b.close(), 30)
        except Exception: pass


# ================================================================ int/m590 0e11c43a3 追加（BB 19:43，BB_246）：ancf2（讓我想想→第二次 she2→好＝she2Yes＋CG-27）、ancfsay（第一次說出來）、examgoal（P5 EXAMDAY-GOAL）
# 讀碼（0e11c43a3）：0383ed3e2 termend_lines.js heroine_01 she2Yes＝[旁白「（她把手帳翻到「想去的店」那一頁，推到你面前。在「和你」旁邊，畫了一個勾。）」,「……勾了。」]，
#   sheMem／she2YesMem＝'AN_SHOP_PAGE'（SOCIAL.MEMORY_HIDE：人物面板不顯示，SOCIAL.panelMemories）；termend3d.js walkHome：第一次她說＝記 AN_SHOP_PAGE；第二次選「好。」＝先演 she2Yes、記 AN_SHOP_PAGE 再交往。
#   CG-27：這一版的 src 裡沒有（CG_REGISTRY 沒有新的手帳圖、she2Yes 沒有 {cg}）；總表 0aaf93529 寫「CG-27 已實作（c9aa5f3ad）」，c9aa5f3ad 不在這個 repo（fetch 後也沒有）＝不在 0e11c43a3。
#   CG-24（1a5110e07）：cg_valentine_taichung_heroine01 在 an_yt_hol_events.js 的 ev_an_vday_y1（2026-02-14 台中情人節出遊）／ev_an_vday_tc（2029 補救）傍晚車子旁那一拍；
#   條件：CG_REGISTRY 有登錄、沒有 AN_VDAY_CG。期末飯路線不會經過＝只記條件。
SOCMEM = r"""(()=>({mem:SOCIAL.memories('heroine_01').map(m=>m.tag),panel:(SOCIAL.panelMemories?SOCIAL.panelMemories('heroine_01'):[]).map(m=>m.tag),hide:SOCIAL.MEMORY_HIDE?[...SOCIAL.MEMORY_HIDE]:null}))()"""
SHE2YES = ['（她把手帳翻到「想去的店」那一頁，推到你面前。在「和你」旁邊，畫了一個勾。）', '……勾了。']


async def ancf2_pass(p, run, orient, route):
    """route 'think'：大一上（先不說）→「讓我想想。」→ 大一下（先不說）→ she2 →「好。」；route 'say'：大一上「我喜歡妳。」"""
    tag = 'ancf2_%s_%s' % (route, orient); land = orient == 'land'
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=land)
    pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
    rec = {'orient': orient, 'route': route}
    try:
        await pg.goto(URL); ok = await L.wait_loaded(pg); run.check('%s：遊戲載入' % tag, ok)
        await pg.evaluate("localStorage.clear()"); await P.init(pg); await pg.evaluate(HOOK)
        st, d = await state_at(pg, '2025-12-20', 10.0, 'dorm'); await load(pg, cdp, st)
        run.setup('[前置] %s：最小存檔（法律系、大一上）；條件事件關掉、手機不自動打開' % tag)
        rec['cg0'] = await pg.evaluate(CGST)
        if route == 'say':
            R1 = await an_term(pg, cdp, run, tag, 'Y1S1', ('「我喜歡妳。」',), land, rec); rec['Y1S1'] = R1
            if R1.get('play'):
                says = [x['t'] for x in R1['log'] if x['k'] == 'say']
                run.check('%s：第一次說出來＝交往（result yes、dating）、沒有她說的手帳那一段' % tag, R1['end']['result'] == 'yes' and R1['end']['dating'] and not any('想去的店' in t for t in says), J({'end': R1['end'], 'tail': says[-6:]}))
        else:
            R1 = await an_term(pg, cdp, run, tag, 'Y1S1', ('（先不說）', '「讓我想想。」'), land, rec); rec['Y1S1'] = R1
            m1 = await pg.evaluate(SOCMEM); rec['mem1'] = m1
            run.check('%s：第一次她說＝記 AN_SHOP_PAGE、人物面板不顯示' % tag, 'AN_SHOP_PAGE' in m1['mem'] and 'AN_SHOP_PAGE' not in m1['panel'], J(m1))
            if R1.get('end'): run.check('%s：第一次「讓我想想」＝think、沒交往' % tag, R1['end']['result'] == 'think' and not R1['end']['dating'], J(R1['end']))
            R2 = await an_term(pg, cdp, run, tag, 'Y1S2', ('（先不說）', '「好。」'), land, rec); rec['Y1S2'] = R2
            if R2.get('play'):
                says = [x['t'] for x in R2['log'] if x['k'] == 'say']
                i = says.index('上次那一頁，最下面那一行還沒勾。……你要看嗎？') if '上次那一頁，最下面那一行還沒勾。……你要看嗎？' in says else -1
                rec['after_she2'] = says[i:] if i >= 0 else says[-8:]
                run.check('%s：she2 之後選「好。」＝承接兩拍（逐字）' % tag, i >= 0 and says[i + 1:i + 3] == SHE2YES, J(rec['after_she2']))
                run.check('%s：第二次「好。」→ 交往（sheSaid）' % tag, R2['end']['result'] == 'sheSaid' and R2['end']['dating'], J(R2['end']))
                cg2 = [x for x in R2['log'] if x['k'] == 'adv' and x['fn'] == 'cg']; rec['cg_calls_Y1S2'] = cg2
                cge = await pg.evaluate(CGST); rec['cgEnd'] = cge
                run.check('%s：CG-27 出現（she2Yes 那一段有 ADV.cg、G.cg.unlocked 有它）' % tag, bool(cg2) and any(x['arg'] in cge['unlocked'] for x in cg2),
                          J({'cg_calls': cg2, 'unlocked': cge['unlocked'], 'note': '0e11c43a3 的 src 沒有 CG-27（c9aa5f3ad 不在這一版）'}))
                m2 = await pg.evaluate(SOCMEM); rec['mem2'] = m2
                run.check('%s：（只記）第二次後記憶 %s；人物面板 %s' % (tag, J(m2['mem'][-6:]), J(m2['panel'][-6:])), True)
        cgs = [x for k in ('Y1S1', 'Y1S2') for x in ((rec.get(k) or {}).get('log') or []) if x['k'] == 'adv' and x['fn'] == 'cg']
        cge = await pg.evaluate(CGST); rec['cgAll'] = cgs
        run.check('%s：CG-11 舊圖（cg_reason_column_heroine01）沒有呼叫、沒有解鎖' % tag, not any('reason_column' in J(x) for x in cgs) and 'cg_reason_column_heroine01' not in cge['unlocked'], J({'cg_calls': cgs, 'unlocked': cge['unlocked']}))
        with open(os.path.join(OUT, '%s_lines.txt' % tag), 'w', encoding='utf-8') as f:
            for k in ('Y1S1', 'Y1S2'):
                Rk = rec.get(k)
                if not Rk: continue
                f.write('==== %s ====\n手機：%s\n' % (k, J([m['text'] for m in Rk.get('invite') or []])))
                for x in (Rk.get('log') or []):
                    if x['k'] == 'say': f.write('%s：%s\n' % (x['n'] or '（旁白）', x['t']))
                    elif x['k'] == 'choose': f.write('［選項］%s\n' % J(x['t']))
                    elif x['k'] == 'adv': f.write('［ADV.%s］%s\n' % (x['fn'], J(x['arg'])))
                    elif x['k'] == 'caption': f.write('［字幕］%s\n' % x['t'])
                f.write('結果：%s\n\n' % J(Rk.get('end')))
    except Exception as e:
        run.check('%s：跑完（沒有探針例外）' % tag, False, repr(e)[:500]); traceback.print_exc()
        try: await run.shot(pg, tag + '_exception')
        except Exception: pass
    finally:
        run.check('%s：沒有 JS 例外' % tag, not errs, J(errs[:3])); rec['errs'] = errs[:5]
        dump(tag, **rec)
        try: await asyncio.wait_for(b.close(), 30)
        except Exception: pass


EXAMDAY_FIND = r"""(()=>{ const G0=GAME.G; for(let d=-200;d<400;d++){ const t=CALENDAR.termOf(d); if(!t||t.id!=='Y1S1') continue; const G=Object.assign({},G0,{day:d,weekday:CALENDAR.dateOf(d).wd%7,hour:6});
  const x=CLS.dayItems(G).find(q=>q.exam==='final'); if(x){ let n=null; for(let e=d-1;e>d-10;e--){ const G2=Object.assign({},G0,{day:e,weekday:CALENDAR.dateOf(e).wd%7,hour:6}); if(CLS.dayItems(G2).some(q=>!q.exam)){ n=e; break; } }
    return {day:d,key:CALENDAR.dateOf(d).key,t0:x.t0,name:x.c.name,room:x.room&&x.room.name,normal:n,normalKey:n!=null?CALENDAR.dateOf(n).key:null}; } } return null; })()"""
GOALST = r"""(()=>{ const e=document.getElementById('goal'); let ce=null; try{ ce=typeof CLS.curExam==='function'?CLS.curExam(GAME.G):(CLS.curExam||null); if(ce&&typeof ce==='object') ce={key:ce.key||null,exam:ce.exam||null,name:ce.c&&ce.c.name||null}; }catch(x){ ce='err:'+x.message; }
  const nx=CLS.next(GAME.G); return {goalG:GAME.G.goal==null?null:(typeof GAME.G.goal==='object'?JSON.stringify(GAME.G.goal):String(GAME.G.goal)),dom:e?(e.textContent||'').trim():null,
    next:nx?{exam:nx.exam||null,t0:nx.t0,name:nx.c.name}:null,curExam:ce,h:+(+GAME.G.hour).toFixed(3),zone:GAME.G.zone}; })()"""


async def examgoal_pass(p, run, orient):
    tag = 'examgoal_%s' % orient; land = orient == 'land'
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=land)
    pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
    rec = {'orient': orient}
    try:
        await pg.goto(URL); ok = await L.wait_loaded(pg); run.check('%s：遊戲載入' % tag, ok)
        await pg.evaluate("localStorage.clear()"); await P.init(pg); await pg.evaluate(HOOK)
        st, d = await state_at(pg, '2025-12-20', 10.0, 'dorm'); await load(pg, cdp, st)
        fd = await pg.evaluate(EXAMDAY_FIND); rec['find'] = fd
        if not fd: run.check('%s：找得到大一上的期末考日' % tag, False); return
        for sub, key, h in (('exam', fd['key'], 6.5), ('normal', fd['normalKey'], 6.5)):
            st, d = await state_at(pg, key, h, 'dorm'); st['goal'] = '—'
            await load(pg, cdp, st, quiet=False); await P.events_on(pg)
            run.setup('[前置] %s %s：最小存檔 %s 06:30 宿舍、目標欄「—」（劇情演完沒有目標的狀態）；條件事件照常（起床／室友的劇情照玩家點）' % (tag, sub, key))
            r = await play(pg, cdp, run, '%s_%s' % (tag, sub), shot_if=lambda t, i: None, max_s=240, idle_s=6)
            await pg.wait_for_timeout(4000)
            g = await pg.evaluate(GOALST); rec[sub] = {'goal': g, 'lines': [l['t'] for l in r['lines']], 'chose': r['chose']}
            rec[sub]['shot'] = await run.shot(pg, '%s_%s_goal' % (tag, sub))
            run.note('%s %s：途中台詞 %s；選單 %s' % (tag, sub, J([l['t'][:24] for l in r['lines']][:12]), J([c['picked'] for c in r['chose']])))
            if sub == 'exam':
                hm = P_hm(fd['t0'])
                run.check('%s：考試日劇情後目標欄＝「%s 期末考：%s…」（G.goal 與 #goal）' % (tag, hm, fd['name']),
                          (g['goalG'] or '').startswith(hm + ' 期末考：' + fd['name']) and (hm + ' 期末考：' + fd['name']) in (g['dom'] or ''), J(g))
            else:
                run.check('%s：一般有課的日子（%s）目標欄沒有「期末考：」' % (tag, key), '期末考：' not in (g['goalG'] or '') + (g['dom'] or ''), J(g))
    except Exception as e:
        run.check('%s：跑完（沒有探針例外）' % tag, False, repr(e)[:500]); traceback.print_exc()
        try: await run.shot(pg, tag + '_exception')
        except Exception: pass
    finally:
        run.check('%s：沒有 JS 例外' % tag, not errs, J(errs[:3])); rec['errs'] = errs[:5]
        dump(tag, **rec)
        try: await asyncio.wait_for(b.close(), 30)
        except Exception: pass


# ---------------- examgoal_wake（BB 對 CC_30：補「起床劇情演完以後」那一條路；直向一趟）
# a5935aa30：S.goalFor 考試日＝「09:10 期末考：課名（教室）」；S.oneTick：G.goal 空或「—」、今天還有考試＝S.setGoal。
# 前置：2025-12-14 22:30 宿舍（隔天 12/15 憲法（上）期末考），條件事件照常；之後全部照玩家：走到床（互動點 sleep:true，按鈕「睡覺」）→ 床的選單 → 睡到隔天 → 起床劇情照玩家點 → 讀 G.goal 與 #goal
BEDIT = "(()=>{ const it=(GAME.E.interactables||[]).find(x=>x.sleep); return it?{x:it.x,z:it.z,label:it.label||null}:null; })()"


async def examgoal_wake_pass(p, run, orient):
    tag = 'examgoal_wake_%s' % orient; land = orient == 'land'
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=land)
    pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
    rec = {'orient': orient}
    try:
        await pg.goto(URL); ok = await L.wait_loaded(pg); run.check('%s：遊戲載入' % tag, ok)
        await pg.evaluate("localStorage.clear()"); await P.init(pg); await pg.evaluate(HOOK)
        st, d = await state_at(pg, '2025-12-14', 22.5, 'dorm')
        await load(pg, cdp, st, quiet=False); await P.events_on(pg)
        fd = await pg.evaluate(EXAMDAY_FIND); rec['find'] = fd
        run.setup('[前置] %s：最小存檔 2025-12-14 22:30 宿舍（隔天 %s %s 期末考 %s）；條件事件照常、只關手機自動打開' % (tag, fd and fd['key'], fd and fd['name'], fd and P_hm(fd['t0'])))
        bed = await pg.evaluate(BEDIT); rec['bed'] = bed
        if not bed: run.check('%s：宿舍有床的互動點' % tag, False); return
        n0 = await pg.evaluate(PLN)
        arrived = await L.go_to(pg, cdp, run, bed['x'], bed['z'], 0.7, '床', max_s=300, stop=lambda s: s['interact'].startswith('睡覺'))
        lab = (await P.ts(pg))['lab']
        run.check('%s：照玩家走到床、按鈕是「睡覺」' % tag, arrived and lab.startswith('睡覺'), J({'lab': lab}))
        rec['shot_bed'] = await run.shot(pg, tag + '_bed')
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
        def shot_if(t, i):
            if t == '__choice__': return 'choice%d' % (i + 1)
            return 'L%02d' % (i + 1)
        r = await play(pg, cdp, run, tag, prefs=('早上', '睡到明天', '睡覺', '照樣', '起床'), shot_if=shot_if, max_s=600, idle_s=6)
        R = await pg.evaluate(PL, n0); rec['log'] = R; rec['play'] = {'lines': [l['t'] for l in r['lines']], 'chose': r['chose']}
        says = [x for x in R if x['k'] == 'say']; evs = [x['id'] for x in R if x['k'] == 'event']
        wake_says = [x for x in says if fd and x.get('d') == fd['day']]
        rec['events'] = evs; rec['wake_says'] = [[x['n'], x['t'], x['h']] for x in wake_says]
        run.note('%s：EVENTS.run %s；隔天的台詞 %s；選單 %s' % (tag, J(evs), J(rec['wake_says'][:12]), J([c['picked'] for c in r['chose']])))
        g0 = await pg.evaluate(GOALST); t0 = time.time(); rec['goal_after_story'] = g0
        run.check('%s：睡到考試日早上、真的有起床劇情（隔天有台詞或事件）' % tag, bool(fd) and await pg.evaluate("GAME.G.day") == fd['day'] and (bool(wake_says) or bool(evs)), J({'day': await pg.evaluate("GAME.G.day"), 'events': evs, 'wake': rec['wake_says'][:6]}))
        want = '%s 期末考：' % (fd and P_hm(fd['t0']))
        g = g0; hist = [[0, g0['h'], g0['goalG']]]
        while time.time() - t0 < 180:
            g = await pg.evaluate(GOALST)
            if hist[-1][2] != g['goalG']: hist.append([round(time.time() - t0, 1), g['h'], g['goalG']])
            if (g['goalG'] or '').startswith(want): break
            s = await P.ts(pg)
            if s['ch'] or s['dlg']: run.note('%s：等目標時又出現對話／選單 %s' % (tag, J([s['txt'][:30], [o['t'] for o in s['ch']]])))
            if s['dlg']: await L.tap(pg, cdp, '#dlg')
            elif s['ch']: await P.tap_choice(pg, cdp, pick_by(s['ch'], ('起床', '照樣')))
            await pg.wait_for_timeout(1000)
        rec['goal_hist'] = hist; rec['goal_final'] = g; rec['shot_goal'] = await run.shot(pg, tag + '_goal')
        run.note('%s：劇情結束時目標＝%s（遊戲 %s）；變化 %s（實際秒、遊戲時刻、目標）' % (tag, J(g0['goalG']), P_hm(g0['h']), J(hist)))
        ok2 = (g['goalG'] or '').startswith(want) and fd['name'] in (g['goalG'] or '') and bool(fd['room']) and fd['room'] in (g['goalG'] or '') and (want + fd['name']) in (g['dom'] or '')
        run.check('%s：劇情演完後目標＝「%s%s（%s）」（G.goal 與 #goal）' % (tag, want, fd['name'], fd['room']), ok2, J(g))
    except Exception as e:
        run.check('%s：跑完（沒有探針例外）' % tag, False, repr(e)[:500]); traceback.print_exc()
        try: await run.shot(pg, tag + '_exception')
        except Exception: pass
    finally:
        run.check('%s：沒有 JS 例外' % tag, not errs, J(errs[:3])); rec['errs'] = errs[:5]
        dump(tag, **rec)
        try: await asyncio.wait_for(b.close(), 30)
        except Exception: pass


async def main():
    os.makedirs(OUT, exist_ok=True)
    run = L.Run('next1102_ui_' + '+'.join(CASES), OUT)
    async with async_playwright() as p:
        for cs in CASES:
            print('==== CASE %s（SHA %s，ORIENTS %s）====' % (cs, os.environ.get('SHA', '?'), ','.join(ORIENTS)), flush=True)
            for o in ORIENTS:
                if cs == 'noodle':
                    for sb in NOODLE_SUBS: await noodle_pass(p, run, sb, o)
                elif cs == 'board':
                    for sb in BOARD_SUBS:
                        if sb == 'measure': await board_measure(p, run, o)
                        elif sb == 'class3d': await board_class(p, run, 'class3d', BOARD3D, o)
                        elif sb == 'classcap': await board_class(p, run, 'classcap', BOARDCAP, o)
                        else: run.check('BOARD_SUBS %s 認得' % sb, False)
                elif cs == 'card': await card_pass(p, run, o)
                elif cs == 'psbhbg': await psbhbg_pass(p, run, o)
                elif cs == 'boardcap2': await boardcap2_pass(p, run, o, BOARDCAP)
                elif cs == 'ancf': await ancf_pass(p, run, o)
                elif cs == 'ancf2': await ancf2_pass(p, run, o, 'think')
                elif cs == 'ancfsay': await ancf2_pass(p, run, o, 'say')
                elif cs == 'examgoal': await examgoal_pass(p, run, o)
                elif cs == 'examgoal_wake': await examgoal_wake_pass(p, run, o)
                else: run.check('CASE %s 認得' % cs, False, '可以用：noodle,board,card,psbhbg,boardcap2,ancf,ancf2,ancfsay,examgoal')
    print('SHA', os.environ.get('SHA', '?'), 'CASES', ','.join(CASES), flush=True)
    sys.exit(run.finish())

if __name__ == '__main__':
    asyncio.run(main())
