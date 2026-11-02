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
  const mem=(G.social&&G.social.mem&&G.social.mem.classmate_peishan||[]).filter(x=>x.tag==='HEARD_ABOUT').map(x=>({day:x.day,note:x.note||x.n||''}));
  return {day:G.day,key:CALENDAR.dateOf(G.day).key,h:+(+G.hour).toFixed(3),zone:G.zone,done:!!done.__ID__,last:last.__ID__!=null?last.__ID__:null,msgs,heard:mem,sentAsk:PHONE.sent(G,'psbh_0415_ask'),sentEgg:PHONE.sent(G,'zhe_supper_mid2_egg')}; })()""".replace('__ID__', EVID)


async def noodle_pass(p, run, sub, orient):
    tag = 'noodle_%s_%s' % (sub, orient); land = orient == 'land'
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=land)
    pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
    rec = {'sub': sub, 'orient': orient, 'shots': {}}
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
            await pg.wait_for_timeout(2500)
            ns = await pg.evaluate(NSTATE); rec['at2030'] = ns
            egg = [m for m in ns['msgs'] if m['tag'] == 'zhe_supper_mid2_egg']
            run.check('%s：20:30 阿哲三則（📷 滷蛋／柏翰幫沛珊切的／……他們在一起了）' % tag, okh and [m['text'] for m in egg] == ['📷（一顆切成兩半的滷蛋）', '柏翰幫沛珊切的', '……他們在一起了'], J(egg))
            run.check('%s：記「聽說」（HEARD_ABOUT）、事件沒演' % tag, bool(ns['heard']) and not ns['done'], J({'heard': ns['heard'], 'done': ns['done']}))
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
        cname = ci['name']; target_hdr = None; in_target = False; done_target = False; idx = 0; t0 = time.time(); menu_shot = False
        while time.time() - t0 < ENVI('CARD_MAX', 900):
            s = await P.ts(pg)
            if s['phone'] and not s['dlg'] and not s['ch']: await L.phone_away(pg, cdp, tries=2); continue
            if s['ch']:
                T = [o['t'] for o in s['ch']]
                if '考前總複習' in T:
                    if not menu_shot: rec['shots']['menu'] = await run.shot(pg, tag + '_deskmenu'); menu_shot = True
                    k = T.index('考前總複習')
                elif done_target and any(t.startswith('結束總複習') for t in T): k = next(i for i, t in enumerate(T) if t.startswith('結束總複習'))
                elif target_hdr is None and any(t.startswith('跳到下一科') for t in T): k = next(i for i, t in enumerate(T) if t.startswith('跳到下一科'))
                elif any(t.startswith('下一張') for t in T): k = next(i for i, t in enumerate(T) if t.startswith('下一張'))
                else: k = 0
                run.note('%s：選單 %s → %s' % (tag, J(T), T[k])); await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1000)
                if done_target and T[k].startswith('結束總複習'): break
                continue
            if s['dlg']:
                m = await pg.evaluate(DLGM)
                if m['next'] != 'visible': await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); m = await pg.evaluate(DLGM)
                tx = m['text']
                if tx.startswith('【') and in_target: in_target = False; done_target = True   # 下一張卡的標題列＝那一張結束
                if tx.startswith('【' + cname + '　'):
                    target_hdr = target_hdr or ('course:' + tx)   # 已經在那一科：之後只按「下一張」
                    if not done_target and ci['title'] in tx and 'header' not in rec:
                        target_hdr = tx; in_target = True; idx = 0; rec['header'] = tx; rec['shots']['header'] = await run.shot(pg, tag + '_header')
                elif in_target and idx < len(lines) and tx == lines[idx]:
                    shp = await run.shot(pg, '%s_chunk%d' % (tag, idx + 1))
                    rec['chunks'].append({'i': idx, 'len': len(tx), 'm': m, 'shot': shp})
                    W, H = m['W'], m['H']; full = tx == lines[idx]
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
                else: run.check('CASE %s 認得' % cs, False, '可以用：noodle,board,card')
    print('SHA', os.environ.get('SHA', '?'), 'CASES', ','.join(CASES), flush=True)
    sys.exit(run.finish())

if __name__ == '__main__':
    asyncio.run(main())
