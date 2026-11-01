"""BB-B 11-01：開發分支 885010347（60cafcb06 也包含：885010347..60cafcb06 只改 r2y3b3d／social3d playSteps／story3d dormLive，和這三件無關）——照玩家在畫面上看、按、截圖。一支用 MODE 分（逗號隔開可以一次跑好幾個，每個 MODE 開一個新的瀏覽器）。
  d09caf0fe  AA_204 第 1-4 節 Y1-WINTER-AA204：大一 2025-12-24 聖誕交換禮物群戲（ev_xmas_exchange，xmas_y1）散場以後和以安／語彤兩個人的那一段（fest3d.js S.grpQ／grpAfter、fest_events.js xmas.grp）
  52bfa7b5d  V6-B（src/v6b_3d.js；條件、台詞照 tests/v6b_unit.js）：芷若「英國的雨」、沛珊「她的第一堂試教」、子晴「工作室的深夜」、沛珊紅筆短版視訊＋紅筆照片
  dcbd50b01  美國收尾（LAWWW2 ccf717fe0）：公寓第八版屋外白天壓暗（陽台、門外平台）＋C 棟合租戶 us_shared 光照烘焙第二版
不是 iPhone：Playwright 手機橫向模擬（SwiftShader，2～4 fps）。URL 用 '<URL>/index.html?turbo'（同 d42_probe、fb1101_probe）。
存檔：「最小存檔」（GAME.defaults＋過了開場的旗標，同 d42_probe 的 state_at；日子過了就補 ROOM_Y2／Y3／Y4；去過的地方 visited 補齊）。每一個讀檔都印 [前置]；
  讀檔後用遊戲 API 補的（關係、交往、群組、旗標）另外寫【捷徑】（補完 GAME.snapshot() 再讀一次）。頁面裡只「讀」的掛勾（GAME.say／choose／ADV／caption／titleCard／toast／money 記錄）不改遊戲狀態。
之後照玩家：點對話、選選項、手機「朋友」→ 她的「約」→「約她過節：聖誕節」→「晚上場」、手機「訊息」→ 她的對話 → 回覆鍵、手機「朋友」→「約」→「視訊？」、
  床「快轉」→「到下一個有事的…」、站著等（晚上選「再撐一下」）、出遊「出發：…」／「不去了」、走路（點地面／搖桿）、手指滑鏡頭（跟隨鏡頭）截圖。

MODE：
  y1xmas   AA_204 1-4（d09caf0fe）。XM＝an_single,an_dating,yt_single_yes,yt_single_no,yt_dating,noshow（預設全部）。
            每一個：[前置] 最小存檔 XM_DAY（預設 2025-12-23，大一寒假第二天）10:00 宿舍；【捷徑】她第 5 階（熟 45／信任 30／自在 20／她的戀愛 35；交往中＝熟 65／信任 50／自在 45／戀愛 60＋dating）、
              聯絡方式、加入「麵店團」群組（PHONE.join；阿哲 12/22 21:00 的揪團＝讀檔後照遊戲規則補收、排 xmas_y1）。
            → 手機「朋友」→ 她「約」→「約她過節：聖誕節」→「晚上場（18:00～21:30）」：PASS＝晚上場沒灰掉、小字「聖誕交換禮物散場以後」、不另外選地點、
              「約好 12/24（三），聖誕交換禮物散場以後。」、沒有排邀約／另外的出遊（G.fest.bk 記 grp xmas_y1）。
            → 12/24 晚上：XM_JUMP＝auto（預設：第一個用床「快轉 → 到下一個有事的日子」走過去，其他的 [前置] 同一份進度跳到 12/24 17:50 宿舍）／1（全部跳）／0（全部快轉）
            →「出發：聖誕交換禮物」→ 群戲（禮物選第一個）→ 散場以後：
              an_single  旁白「（大家在麵店門口散了。以安沒有往女舍的方向走。）」→「剛剛那個是抽的。」「我另外有帶一個。走一段再給你。」→ 送禮選單 → 她回那個禮物的一句
              an_dating  旁白「（大家在麵店門口散了。以安從包包裡拿出一個小盒子。）」→「這個不是抽的。」「鋼筆。申論題寫比較快。」→ 送禮
              yt_single_yes  旁白＋「阿姨說明天要用的蒜頭還沒剝。」「打烊以後，你要不要來幫忙。」→ 選項「好。」／「今天不行。」→「好。」→ 旁白「（剝到九點半，手上都是蒜味。）」→ 送禮
              yt_single_no   同上 →「今天不行。」→ 語彤「嗯，沒關係。」結束：沒有送禮選單、done＝declined、沒有節日記憶 HOL_XMAS_2025、回到學校 20:30
              yt_dating  旁白「（大家走了以後，語彤從櫃台底下拿出一個紙袋。）」→「給你。圍巾。」「你騎車脖子都露在外面。」→ 送禮
              noshow     約了以安散場以後、群戲選「不去了」：散場以後那一段不演、沒有群戲、FEST miss 記 missed、沒有節日記憶、沒有 AA_416 原本的晚上場
            共同 PASS：那一段在群戲（「（禮物先疊在桌子中間，吃完再抽。）」）之後；不演 AA_416 原本的聖誕台詞；done＝meet、記憶 HOL_XMAS_2025、禮物錢照扣；回到學校 21:30（「回到…」字幕的遊戲時間）。
  v6b      V6-B（52bfa7b5d）。V6＝zr,ps,zq,psred（預設全部）。
            zr     芷若「英國的雨」：[前置] 2028-12-18（大四上）20:45 宿舍、臺灣路線；【捷徑】熟 45／信任 30＋交往中（ROM.start）、聯絡方式（她人在英國：MSG.inUK）。
                   站著等 → 21:00 她私訊「這裡的寒假很冷。雨一直下。」「……你要來嗎？不來也沒關係，真的。」＋回覆「我去。」「這個寒假不行。」→ 手機點「我去。」→「……好。那我先排好要看的片。」、排 1/15 21:00 出發
                   → [前置] 同一份進度跳到 2029-01-15 19:30 宿舍（中間一個月不玩）→ 站著等「出發：去英國找…」→ 1/16（日期卡「英國」）旁白＋三張照片 → 1/20 19:30（英國時間）老戲院 → CG BCG-25（截圖）
                   →「這次，兩張是本來就買的。」→ 散場「這間只有六十個位子。……」21:30 → 1/22 08:30 回到臺北（時差換回 0）、ZR_UK_TRIP done、記憶 UK_VISIT；途中 1/21 她的每週視訊不排。
            ps     沛珊「她的第一堂試教」：PS_ROUTE＝TW（預設）／JP。[前置] 2028-11-07 20:45 宿舍、PS_RECONNECT；【捷徑】熟 45／信任 30（沒交往）、聯絡方式（她在台南）。
                   21:00 她私訊兩句＋「好」「不行」→ 點「好」→ 排 11/8 19:30 台南 → 床「快轉」→ 停在 17:30「出發：去台南找…」→ 旁白「（她第一次站上課輔班的講台試教。）」→ 沛珊「有一個小朋友舉了六次手。……這次我有看到他。」
                   PASS：沒有告白、PS_FIRST_LESSON met、高鐵票（GAME.money 記到的那一筆＝HOMETOWN_LINES 台南的 fare）、正式約會次數 +1、回到臺北。
            zq     子晴「工作室的深夜」：[前置] 2028-11-10 17:45 宿舍、臺灣路線、ZQ_CONTRACT lawyer；【捷徑】熟 45／信任 30、聯絡方式。18:00 她私訊兩句＋「好」「不行」→「好」→ 排 21:00
                   → 床「快轉」→「出發：子晴的工作室…」→ 旁白「（她請你試玩新關卡。）」、ZQ_STUDIO met。【觀察】背景 ziqing_studio 還沒有圖＝深色底＋地點字幕（照記、截圖，不算 PASS／FAIL）。
            psred  沛珊紅筆：[前置] 2028-11-20（一）21:05 宿舍、PS_RECONNECT、PS_RED_PEN_SHORT＝11/17（5-2 沒到）；【捷徑】熟 45／信任 30＋交往中、聯絡方式。
                   手機「朋友」→ 沛珊「約」→「這個時候才有」→「視訊？」→ 視訊開頭 → 短版四句「這裡你寫得特別快。」「我學生寫快的地方，通常是還沒想清楚。」（旁白兩句）→ 結尾；PS_RED_PEN true。
                   之後床「快轉」過日子到 PSRED_UNTIL（預設 2028-11-30）：PASS＝出現「📷（便利貼上一個紅筆笑臉）」23:10＋「今天的」23:11（同一天）、一個自然月最多一次。
                   每天的手機小事一天一則、照輪替：PSRED_UNTIL 內自然輪不到＝記【觀察】，再【捷徑】把輪替指標 dpLast 撥到紅筆照片前一則、快轉 7 天（PSRED_PTR=1＝一開始就撥）。
  usfinal  美國收尾（dcbd50b01）。[前置] 最小存檔 2028-09-20（美國路線、已抵達，同 post91015_probe vis_us 的旗標）、quiet_events（只看畫面）。
            公寓 us_apartment 14:00：出生點（門外平台）跟隨鏡頭 → 走到陽台（跟隨鏡頭、手指轉向欄杆外）→ 走回門外平台（跟隨鏡頭、轉向大門、轉向欄杆外）。每張量平均亮度、近白（>235）、死白（>248）比例（全畫面、下半部）。
              PASS：陽台、平台的每一張死白（>248）≤ US_WHITE_MAX（預設 0.15，全畫面和下半部都看）、正式模型有光照貼圖。
            C 棟合租戶 us_shared 14:00、20:30：出生點（平台）→ 走到客廳 → 手指轉向客廳東邊（【觀察】LAWWW2 還在修「東邊偏暗」）→ 走到平台轉向 207 的門（【觀察】「207 門白天偏亮」）。
              PASS：有光照貼圖（lightMap 的網格數 > 0）、每張沒有整片黑（<12 的 ≤ 0.25）。東邊、207 只記數字不判。
用法：LW_TESTS=<工作樹>/tests SHA=<sha> MODE=<mode>[,<mode>...] python3 d885_probe.py '<URL>/index.html?turbo' <輸出資料夾>
等待上限（秒）都可以用環境變數改：XM_MAX、V6_MAX、ZR_WAIT、PSRED_MAX、WALK_MAX、LM_WAIT。"""
import os, sys, json, asyncio, re, math, time, copy, traceback
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); import bbplay as P
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
MODES = [m.strip() for m in os.environ.get('MODE', 'y1xmas,v6b,usfinal').split(',') if m.strip()]
J = lambda o: json.dumps(o, ensure_ascii=False)
ENV = lambda k, d: [x.strip() for x in os.environ.get(k, d).split(',') if x.strip()]
ENVI = lambda k, d: int(os.environ.get(k, str(d)))
ENVF = lambda k, d: float(os.environ.get(k, str(d)))
AN, ZR, YT, ZQ, SIS, PS = 'heroine_01', 'heroine_02', 'heroine_03', 'heroine_04', 'heroine_05', 'classmate_peishan'
STAY = ('再撐一下', '先不睡')

# ---------------------------------------------------------------- 存檔（d42_probe.py 的做法）
BASEF = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'MET_ZHE': True,
         'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True,
         'fundsV2': 1, 'KX_DEC3_MIGRATED': True, 'dating_kexin': False}   # 法律系、過了開場；GAME.defaults 的 dating_kexin:true 拿掉
ROOMS = (('ROOM_Y2', '2026-09-06'), ('ROOM_Y3', '2027-09-05'), ('ROOM_Y4', '2028-09-03'))
VISITED = ('noodle', 'cafe', 'library_hall', 'library', 'lawlib', 'wancai', 'linze', 'gongguan', 'wenzhou', 'soclib', 'cvs', 'bookstore')
TWF = {'EXCHANGE_ROUTE': 'TW', 'EXCH_RULE': 1}
Y4F = dict(TWF, Y4_PATH='other')

JSENV = """(()=>{ const G=GAME.G, F=G.flags, D=k=>STORY.dayOfKey(k);
  const STG=id=>(typeof DATE!=='undefined'&&DATE.stageNum)?DATE.stageNum(id):null;
  const LV=(id,f,t,c,o)=>{ const r=SOCIAL.rel(id); r.fam=f; r.trust=t||0; r.comf=c||0; if(o) Object.assign(r,o); SOCIAL.remember(id,'FIRST_MET',''); G.contacts=G.contacts||{}; if(G.contacts[id]==null) G.contacts[id]=G.day-30;
    return {id,fam:r.fam,trust:r.trust,comf:r.comf,npcRom:r.npcRom|0,rom:r.rom|0,stage:SOCIAL.stage(id),stg:STG(id)}; };
  const NOKX=()=>{ F.dating_kexin=false; if(F.romance) delete F.romance.kexin; F.ROMANCE_HISTORY=(F.ROMANCE_HISTORY||[]).filter(r=>r&&r.id!=='kexin'); delete F.DATED_1_kexin; delete F.KX_TOUR_YES; };
  const DT=id=>{ F['dating_'+id]=true; try{ if(typeof ROM!=='undefined'&&ROM.get){ const r=ROM.get(G,id); if(r&&typeof r==='object') r.status='dating'; } }catch(e){} return !!F['dating_'+id]; };
  const RS=id=>{ try{ if(typeof ROM!=='undefined'&&ROM.start) ROM.start(G,id); }catch(e){} if(!F['dating_'+id]) DT(id); return !!F['dating_'+id]; };
  __BODY__ })()"""


async def state_at(pg, key, h, zone, flags=None, pos=None, weather='clear', money=30000, done=None, drop=()):
    """法律系的最小存檔改到那一天、那個時間、那一區；key 可以是 'YYYY-MM-DD' 或 [學期, 週, 星期]"""
    d = await P.day_of(pg, key)
    st = {'name': '祐廷', 'energy': 100, 'events': {'done': {}, 'last': {}, 'count': 0}, 'contacts': {}}
    F = st['flags'] = dict(BASEF)
    for k, kk in ROOMS:
        dd = (await P.day_of(pg, kk))['d']
        if dd <= d['d']: F[k] = dd
    F.update(flags or {})
    for k in drop: F.pop(k, None)
    st.update(day=d['d'], weekday=d['wd'], hour=h, zone=zone, pos=pos, weather=weather, stage='law', money=money)
    st['visited'] = {z: True for z in VISITED}
    if done: st['events']['done'].update(done)
    return st, d


async def load(pg, cdp, run, st, label, js=None, quiet=False):
    """[前置] 讀檔（遊戲自己的 GAME.applySave）；js＝讀檔後用遊戲 API 補的【捷徑】，補完 GAME.snapshot() 再讀一次（區域照新狀態重建）。手機自己打開（D103）照玩家收起來"""
    await L.load_state(pg, st, quiet_events=quiet, quiet_phone=False)
    await pg.wait_for_timeout(3500); r = None
    if js:
        r = await pg.evaluate(JSENV.replace('__BODY__', js))
        s2 = await pg.evaluate("()=>GAME.snapshot()")
        await L.load_state(pg, s2, quiet_events=quiet, quiet_phone=False); await pg.wait_for_timeout(3500)
    await L.phone_away(pg, cdp, tries=2)
    run.setup('[前置] %s%s%s' % (label, '（quiet_events）' if quiet else '', ('；【捷徑】讀檔後用遊戲 API 補：%s → %s' % (js.strip()[:300], J(r)[:600])) if js else ''))
    return r


async def shortcut(pg, cdp, run, js, label):
    """【捷徑】玩到一半用遊戲 API 改狀態，存成快照再讀一次"""
    r = await pg.evaluate(JSENV.replace('__BODY__', js))
    s2 = await pg.evaluate("()=>GAME.snapshot()")
    await L.load_state(pg, s2, quiet_events=False, quiet_phone=False); await pg.wait_for_timeout(3500); await L.phone_away(pg, cdp, tries=2)
    run.setup('【捷徑】%s：%s → %s' % (label, js.strip()[:300], J(r)[:500]))
    return r


async def snap(pg):
    return await pg.evaluate("()=>GAME.snapshot()")


async def jump(pg, cdp, run, s0, key, h, zone=None, pos='keep', quiet=False, note=''):
    """[前置] 同一份進度（s0＝GAME.snapshot()）跳到另一天、另一個時間再讀"""
    s = copy.deepcopy(s0); d = await P.day_of(pg, key)
    s.update(day=d['d'], weekday=d['wd'], hour=h)
    if zone: s['zone'] = zone
    if pos != 'keep': s['pos'] = pos
    await L.load_state(pg, s, quiet_events=quiet, quiet_phone=False); await pg.wait_for_timeout(3500); await L.phone_away(pg, cdp, tries=2)
    run.setup('[前置] 同一份進度跳到 %s %.2f %s%s' % (d['key'], h, s['zone'], ('；' + note) if note else ''))
    return d


# ---------------------------------------------------------------- 記錄（GAME.say、選項＋小字、ADV 背景、CG、字幕、日期卡、提示、錢）——只記不改
HOOK = r"""(()=>{ if(window.__PLH) return 'again'; window.__PLH=1; window.__PL=[];
  const at=()=>{ try{ let tz=0; try{ tz=(typeof STORY!=='undefined'&&STORY.tzOffset)?(+STORY.tzOffset(GAME.G)||0):0; }catch(e){} return {d:CALENDAR.dateOf(GAME.G.day).key, h:+(+GAME.G.hour).toFixed(3), z:GAME.G.zone, tz}; }catch(e){ return {}; } };
  const push=o=>{ try{ Object.assign(o,at()); window.__PL.push(o); if(window.__PL.length>8000) window.__PL.splice(0,2000); }catch(e){} return o; };
  const bgs=b=>typeof b==='string'?b:JSON.stringify(b||null);
  const s0=GAME.say; GAME.say=function(w,t){ push({k:'say',n:(w&&w.name)||(typeof w==='string'?w:''),c:(w&&w.charId)||null,t:String(t==null?'':t)}); return s0.apply(this,arguments); };
  const c0=GAME.choose; GAME.choose=function(o){ const A=o||[]; push({k:'choose',n:'',t:A.map(x=>x&&(x.t||x.text)||'').join('｜'),hs:A.map(x=>(x&&x.hint)||''),ds:A.map(x=>!!(x&&x.dim))}); return c0.apply(this,arguments); };
  if(typeof ADV!=='undefined'&&ADV.begin){ const b0=ADV.begin; ADV.begin=function(o){ push({k:'bg',n:'begin',t:bgs(o&&o.background)}); return b0.apply(this,arguments); }; }
  if(typeof ADV!=='undefined'&&ADV.setBg){ const g0=ADV.setBg; ADV.setBg=function(b){ push({k:'bg',n:'setBg',t:bgs(b)}); return g0.apply(this,arguments); }; }
  if(typeof ADV!=='undefined'&&ADV.cg){ const q0=ADV.cg; ADV.cg=function(id){ push({k:'cg',n:'',t:String(id||'')}); return q0.apply(this,arguments); }; }
  if(GAME.caption){ const p0=GAME.caption; GAME.caption=function(n,t){ push({k:'cap',n:String(n||''),t:String(t==null?'':t)}); return p0.apply(this,arguments); }; }
  if(GAME.titleCard){ const t0=GAME.titleCard; GAME.titleCard=function(a,b){ push({k:'card',n:String(a||''),t:String(b||'')}); return t0.apply(this,arguments); }; }
  if(GAME.toast){ const o0=GAME.toast; GAME.toast=function(t){ push({k:'toast',n:'',t:String(t||'')}); return o0.apply(this,arguments); }; }
  if(GAME.money){ const m0=GAME.money; GAME.money=function(d,l){ push({k:'money',n:String(l||''),t:String(d)}); return m0.apply(this,arguments); }; }
  return 'ok'; })()"""
NAMES = """(id=>{ const s=new Set(); try{ s.add(SOCIAL.displayName(id)); }catch(e){} try{ s.add(SOCIAL.npcName(id)); }catch(e){} const c=(typeof CHARACTERS!=='undefined'&&CHARACTERS[id])||{}; if(c.name) s.add(c.name); if(c.nickname) s.add(c.nickname); return [...s].filter(Boolean); })"""
ADVST = """(()=>{ try{ const A=ADV, r=A.root, b=A.bg, c=A.cgEl, e=document.getElementById('caption');
  return {active:!!A.active, cls:r?String(r.className||''):null, bgMode:typeof A.bgMode==='object'?JSON.stringify(A.bgMode):(A.bgMode||null), bgImg:b?String(b.style.backgroundImage||'').slice(0,160):null,
    cgImg:c?String(c.style.backgroundImage||'').slice(0,160):null, cgShown:c?getComputedStyle(c).display!=='none':null,
    caption:e?(e.textContent||'').trim():null, capVis:!!e&&!e.classList.contains('hide')&&e.style.opacity!=='0'}; }catch(x){ return {err:String(x.message)}; } })()"""


async def pl_len(pg):
    return await pg.evaluate("(window.__PL||[]).length")


async def rows(pg, n0=0, k=None):
    R = (await pg.evaluate("n=>(window.__PL||[]).slice(n)", n0))
    return [r for r in R if k is None or r['k'] == k]


def said(R):
    return [[r['n'], r['t']] for r in R if r['k'] == 'say']


async def names_of(pg, cid, extra=()):
    return set(await pg.evaluate(NAMES, cid)) | set(extra)


def is_her(r, cid, names):
    return r['k'] == 'say' and (r.get('c') == cid or r['n'] in names)


def row_of(R, text, k='say'):
    return next((r for r in R if r['k'] == k and r['t'] == text), None)


# ---------------------------------------------------------------- 照玩家操作（d42_probe／fb1101_probe）
DECL = ('晚一點', '不去了', '自己走過去', '先不', '不用了', '算了', '就這樣', '先這樣', '沒事', '「我晚上要念書。」', '「那天我有事。」', '「我也要念書。」', '「我週六有事。」')
FF_OPTS = ('到下一個有事的日子', '到下一個有事的時候')
GO_PREFIX = ('出發：', '直接過去：', '接起來：', '上線：')
AVOID = ('算了', '換一天', '先不要', '（離開）', '不用了', '其他日子…', '返回')


def pick_opt(ch, picks=(), ff=True):
    """選哪一個：picks（開頭符合、或包含；照順序）→ 快轉 → 床的選單（快轉，不快轉就睡）→ 起床選單「先起床」→ 婉拒那一類 → 第一個不是「出發：」那一類的"""
    T = [o['t'] for o in ch]; live = [i for i, o in enumerate(ch) if not o['dim']] or list(range(len(ch)))
    for p in picks or ():
        for i in live:
            if T[i].startswith(p) or (len(p) >= 4 and p in T[i]): return i, 'pick'
    if ff:
        for i in live:
            if T[i].startswith(FF_OPTS): return i, 'ff'
    if any(t.startswith(('再撐一下', '先不睡')) for t in T) or (any(t.startswith('睡覺') for t in T) and any(t.startswith('快轉') for t in T)):
        if ff:
            for i in live:
                if T[i].startswith('快轉'): return i, 'ff'
        for w in ('睡到明天', '睡覺', '睡一下', '睡到傍晚', '小睡 2 小時', '小睡'):
            for i in live:
                if T[i].startswith(w): return i, 'sleep'
    for i in live:
        if T[i].startswith('先起床'): return i, 'wake'
    for w in DECL:
        for i in live:
            if T[i].startswith(w): return i, 'decline'
    for i in live:
        if not T[i].startswith(GO_PREFIX) and '存檔' not in T[i]: return i, 'first'
    return live[0], 'first'


async def press_bed(pg, cdp, run):
    bed = await pg.evaluate("(()=>{ const it=(GAME.E.interactables||[]).find(i=>i.sleep&&!i.hidden); return it?[it.x,it.z]:null; })()")
    if not bed: return False
    await L.phone_away(pg, cdp, tries=1)
    await L.go_to(pg, cdp, run, bed[0], bed[1], 0.8, '床', max_s=150, stop=lambda s: s['dlg'] or s['choices'])
    for _ in range(4):
        await L.phone_away(pg, cdp, tries=1)
        s = await P.ts(pg)
        if s['ch'] or s['dlg']: return True
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1600)
        s = await P.ts(pg)
        if s['ch'] or s['dlg'] or s['busy']: return True
    return False


async def go_place(pg, cdp, run, zone, max_s=120, name=None):
    """手機「地點」→ 那一區的「前往」；途中的對話點過去、選單選「前往／直接」那一類。回傳 {ok, why}"""
    await P.phone_tab(pg, cdp, 'places')
    sel = ('#phoneBody [data-place="%s|%s"]' % (zone, name)) if name else ('#phoneBody [data-place^="%s|"]' % zone)
    if not await pg.evaluate("s=>!!document.querySelector(s)", sel):
        txt = await pg.evaluate("(document.getElementById('phoneBody')||{}).innerText||''")
        await L.phone_away(pg, cdp, tries=2); await L.close_panels(pg, cdp); return {'ok': False, 'why': txt[:300]}
    await L.tap(pg, cdp, sel); t0 = time.time()
    while time.time() - t0 < max_s:
        await pg.wait_for_timeout(1000); s = await P.ts(pg)
        if s['ch']:
            k, _ = pick_opt(s['ch'], ('前往', '直接'), False); await P.tap_choice(pg, cdp, k); continue
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); continue
        if s['phone']: await L.phone_away(pg, cdp, tries=1); continue
        if s['zone'] == zone and not s['busy']: return {'ok': True, 'at': await P.clock(pg)}
    return {'ok': (await P.ts(pg))['zone'] == zone, 'why': 'timeout'}


async def to_dorm(pg, cdp, run):
    r = await go_place(pg, cdp, run, 'dorm', 90)
    return r['ok']


DUE_SOON = """(()=>{ const G=GAME.G, now=G.day*24+G.hour; let best=null; const c=(t,lab)=>{ if(best==null||t<best.t) best={t,lab}; };
  for(const iv of (G.invites||[])) if(iv.state==='accepted'&&now<iv.day*24+iv.h+0.6) c(iv.day*24+iv.h-0.5,'約：'+iv.who+' '+iv.h);
  try{ for(const q of OUT.rec(G)) if(q.state==='planned'&&now<q.day*24+q.h+0.75){ const tr=OUT.trip?OUT.trip(G,q,true):{}; c(q.day*24+q.h-((tr&&tr.travelH)||q.travelH||0)-0.25,'出遊：'+(q.title||q.id)); } }catch(e){}
  return best?{gap:+(best.t-now).toFixed(2),lab:best.lab}:null; })()"""
DLGFULL = "((GAME.D&&GAME.D.full)||(document.getElementById('dlgText')||{}).textContent||'')"


async def play(pg, cdp, run, until_js=None, max_s=1800, picks=(), tag='', ff=True, shots_at=(), on_line=None, on_phone=None, on_idle=None):
    """照玩家過日子（d42_probe／fb1101_probe 的 play）：對話點過去、選項照 pick_opt、手機自己打開就收起來（on_phone 先看要不要回）、空下來先問 on_idle、再去床「快轉」（ff）；
    約好的事、該出發的出遊 1.5 小時內就站著等。shots_at＝對話框出現這幾句（包含）就截圖；on_line＝{句子的一段: async 函式}，對話框第一次出現那一句時先呼叫（只讀）。回傳 until_js 是否成立"""
    t0 = time.time(); idle = 0; last = None; same = 0; waited = None; pend = list(shots_at); nshot = 0; hooks = dict(on_line or {})
    while time.time() - t0 < max_s:
        s = await P.ts(pg)
        free = not s['dlg'] and not s['ch'] and not s['busy'] and s['depth'] == 0
        if until_js and free and await pg.evaluate(until_js):
            await pg.wait_for_timeout(1500); s2 = await P.ts(pg)
            if not s2['dlg'] and not s2['ch'] and not s2['busy'] and await pg.evaluate(until_js): return True
            continue
        if s['phone'] and not s['ch'] and not s['dlg']:
            if on_phone and await on_phone(): idle = 0; continue
            await L.phone_away(pg, cdp, tries=1); await pg.wait_for_timeout(500); idle = 0; continue
        if s['ch']:
            sig = (s['day'], s['h'], tuple(o['t'] for o in s['ch'])); same = same + 1 if sig == last else 0; last = sig
            if same > 25:
                run.note('%s：同一個選單點了 25 次沒有反應：%s' % (tag, J(s['ch'])[:400])); await run.shot(pg, tag + '_stuck'); return False
            k, why = pick_opt(s['ch'], picks, ff)
            if why not in ('ff', 'sleep'): run.note('%s %s %.2f 選項 %s → %s' % (tag, (await P.clock(pg))['key'], s['h'], J([o['t'][:22] for o in s['ch']]), s['ch'][k]['t'][:30]))
            await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1000); idle = 0; continue
        if s['dlg']:
            if pend or hooks:
                full = await pg.evaluate(DLGFULL)
                for key in [x for x in hooks if x and x in full]:
                    fn = hooks.pop(key)
                    try: await fn()
                    except Exception as ex: run.note('%s：on_line「%s」出錯 %r' % (tag, key[:20], ex))
                hit = next((x for x in pend if x and x in full), None)
                if hit:
                    await pg.wait_for_timeout(1000); nshot += 1; await run.shot(pg, '%s_line%02d' % (tag, nshot)); pend.remove(hit)
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); idle = 0; continue
        if s['busy'] or s['depth'] > 0: await pg.wait_for_timeout(700); continue
        idle += 1
        if on_idle and await on_idle(): idle = 0; continue
        if idle < 3 or not ff: await pg.wait_for_timeout(1500); continue
        if await pg.evaluate("!!(typeof HOME!=='undefined'&&HOME.at&&HOME.at(GAME.G))"): await pg.wait_for_timeout(1500); continue
        due = await pg.evaluate(DUE_SOON)
        if due and due['gap'] <= 1.5:
            if waited is None or waited[0] != due['lab']: waited = (due['lab'], time.time())
            if time.time() - waited[1] < 420: await pg.wait_for_timeout(2000); continue
            run.note('%s：等「%s」超過 7 分鐘沒有出發提示，照樣快轉' % (tag, due['lab']))
        if s['zone'] != 'dorm' and not await to_dorm(pg, cdp, run):
            run.note('%s：回不了宿舍（%s）' % (tag, s['zone'])); await pg.wait_for_timeout(3000); continue
        if not await press_bed(pg, cdp, run):
            run.note('%s：按不到床（%s）' % (tag, J(await P.clock(pg)))); await run.shot(pg, tag + '_nobed'); return False
        idle = 0
    return False


async def stand(pg, cdp, run, secs, tag, on_line=None, shots_at=()):
    """站著（不快轉、不睡）secs 秒；途中的對話點過去、晚上的床選單選「再撐一下」"""
    await play(pg, cdp, run, None, max_s=secs, ff=False, picks=STAY, tag=tag, on_line=on_line, shots_at=shots_at)


async def wait_h(pg, cdp, run, key, h, max_s, tag, on_line=None):
    """站著等到那一天的 h 點（沒睡覺過了半夜 G.hour 會超過 24：h 可以寫 24.5）。回傳是否等到"""
    d = (await P.day_of(pg, key))['d']
    js = "(GAME.G.day>%d)||(GAME.G.day===%d&&GAME.G.hour>=%.4f)" % (d, d, h)
    return await play(pg, cdp, run, js, max_s=max_s, ff=False, picks=STAY, tag=tag, on_line=on_line)


async def phone_inv(pg, cdp, run, cid, tag):
    """手機「朋友」→ 他那一列「約」"""
    await P.phone_tab(pg, cdp, 'friends')
    if await pg.evaluate("!!document.querySelector('#phoneBody [data-personback]')"):
        await L.tap(pg, cdp, '#phoneBody [data-personback]'); await pg.wait_for_timeout(700)
    sel = '#phoneBody [data-inv="%s"]' % cid
    if not await pg.evaluate("s=>!!document.querySelector(s)", sel):
        txt = await pg.evaluate("(document.getElementById('phoneBody')||{}).innerText||''"); await L.close_panels(pg, cdp)
        return {'ok': False, 'why': '朋友那一列沒有「約」', 'text': txt[:400]}
    await run.shot(pg, tag + '_friends'); await L.tap(pg, cdp, sel); await pg.wait_for_timeout(1500)
    return {'ok': True}


async def menu_drive(pg, cdp, run, prefs, tag, max_s=150):
    """約人的選單一路點下去：每一層照 prefs（開頭符合，照順序）選；都沒有就第一個沒變暗、不是「算了／換一天」那一類的。回傳每一層的選項、選了什麼"""
    t0 = time.time(); menus = []; picked = []; started = False; idle = None
    while time.time() - t0 < max_s and len(menus) < 14:
        s = await P.ts(pg)
        if s['ch']:
            started = True; idle = None; T = [o['t'] for o in s['ch']]; menus.append(T)
            live = [i for i, o in enumerate(s['ch']) if not o['dim']] or list(range(len(T)))
            k = None
            for p in prefs:
                k = next((i for i in live if T[i].startswith(p)), None)
                if k is not None: break
            if k is None: k = next((i for i in live if not T[i].startswith(AVOID)), live[0])
            picked.append(T[k]); await run.shot(pg, '%s_menu%d' % (tag, len(menus)))
            await P.tap_choice(pg, cdp, k); await pg.wait_for_timeout(1100); continue
        if s['dlg']: started = True; idle = None; await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); continue
        if s['phone']: await L.phone_away(pg, cdp, tries=1); continue
        if s['busy'] or s['depth'] > 0: started = True; idle = None; await pg.wait_for_timeout(600); continue
        if started:
            idle = idle or time.time()
            if time.time() - idle > 5: break
        elif time.time() - t0 > 12: break
        await pg.wait_for_timeout(500)
    return {'menus': menus, 'picked': picked}


FIND_ASK = """(([how,s])=>{ const m=(GAME.G.msgs||[]).slice().reverse().find(x=>x&&x.ask&&(how==='eq'?x.ask.id===s:(how==='suffix'?String(x.ask.id).endsWith(s):String(x.ask.id).startsWith(s))));
  return m?{id:m.ask.id, th:(PHONE.th?PHONE.th(m):m.th), opts:(m.ask.opts||[]).map(o=>o.t), ans:m.ans!=null?m.ans:null}:null; })"""


async def answer(pg, cdp, run, how, label, tag):
    """手機：那一則有選項的訊息（how＝('eq'|'suffix'|'prefix', 字)）→ 打開那個對話 → 點開頭是 label 的回覆鍵"""
    m = await pg.evaluate(FIND_ASK, list(how))
    if not m: return None
    await P.phone_thread(pg, cdp, m['th'], open_folds=False)
    await run.shot(pg, tag + '_ask')
    opts = await pg.evaluate("id=>[...document.querySelectorAll('#phoneBody [data-ask]')].filter(x=>(x.dataset.ask||'').startsWith(id+'|')).map(x=>(x.textContent||'').trim())", m['id'])
    b = await pg.evaluate("([id,lab])=>{ const e=[...document.querySelectorAll('#phoneBody [data-ask]')].find(x=>(x.dataset.ask||'').startsWith(id+'|')&&(x.textContent||'').trim().startsWith(lab)); if(!e) return null; e.scrollIntoView({block:'center'}); const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2,(e.textContent||'').trim()]; }", [m['id'], label])
    if b:
        await L.touch_tap(cdp, b[0], b[1]); await pg.wait_for_timeout(1800); await run.shot(pg, tag + '_answered')
    txt = await pg.evaluate("(document.getElementById('phoneBody')||{}).innerText||''")
    await L.close_panels(pg, cdp)
    return {'id': m['id'], 'th': m['th'], 'opts': opts, 'data_opts': m['opts'], 'tapped': b[2] if b else None, 'text': txt[-600:]}


MSG_HAS = "(tag=>(GAME.G.msgs||[]).some(m=>m&&m.tag===tag))(%s)"
MSG_OF = """(tag=>(GAME.G.msgs||[]).filter(m=>m&&m.tag===tag).map(m=>({text:String(m.text||''),from:m.from||null,name:m.name||null,th:(PHONE.th?PHONE.th(m):m.th),
  day:CALENDAR.dateOf(m.day).key,h:m.h!=null?+(+m.h).toFixed(3):null,opts:m.ask?(m.ask.opts||[]).map(o=>o.t):null})))"""
MSG_RE = """(re=>{ const R=new RegExp(re); return (GAME.G.msgs||[]).filter(m=>m&&R.test(m.tag||'')).map(m=>({text:String(m.text||''),from:m.from||null,tag:m.tag,day:CALENDAR.dateOf(m.day).key,d:m.day,h:m.h!=null?+(+m.h).toFixed(3):null})); })"""
THREAD = """(([th,n])=>(GAME.G.msgs||[]).filter(m=>m&&(PHONE.th?PHONE.th(m):m.th)===th).slice(-n).map(m=>[m.from||'',String(m.text||''),CALENDAR.dateOf(m.day).key,m.h!=null?+(+m.h).toFixed(2):null,m.tag||null]))"""
OUTQ = """(id=>{ const q=OUT.get(GAME.G,id); return q?{id:q.id,day:CALENDAR.dateOf(q.day).key,h:+(+q.h).toFixed(3),state:q.state,ev:q.ev||null,title:q.title||null,place:q.place||null,travel:q.travel||null,travelH:q.travelH||0,late:q.late,alarm:!!q.alarm}:null; })"""
FLAGV = "(k=>{ const v=GAME.G.flags[k]; return v===undefined?null:v; })"


async def wait_msg(pg, cdp, run, tag, max_s, label):
    ok = await play(pg, cdp, run, MSG_HAS % J(tag), max_s=max_s, ff=False, tag=label, picks=STAY)
    return ok, await pg.evaluate(MSG_OF, tag)


async def thread_shot(pg, cdp, run, th, tag):
    """手機「訊息」→ 那個對話（截圖）；回傳畫面上的字"""
    t = await P.phone_thread(pg, cdp, th, open_folds=False); await pg.wait_for_timeout(600)
    await pg.evaluate("(()=>{ const b=document.getElementById('phoneBody'); if(b) b.scrollTop=b.scrollHeight; })()"); await pg.wait_for_timeout(500)
    await run.shot(pg, tag)
    txt = await pg.evaluate("(document.getElementById('phoneBody')||{}).innerText||''")
    await L.close_panels(pg, cdp)
    return {'ok': t['ok'], 'text': txt[-900:]}


def seq_from(R, i0, n=12):
    return [r for r in R[i0:] if r['k'] in ('say', 'choose')][:n]


def short(rs):
    return [[r['k'], r['n'], r['t'][:46], r.get('d'), r.get('h')] for r in rs]


# ================================================================ 1. y1xmas：AA_204 1-4 大一聖誕群戲散場以後
XM_CASES = {'an_single': (AN, False, None), 'an_dating': (AN, True, None), 'yt_single_yes': (YT, False, '「好。」'),
            'yt_single_no': (YT, False, '「今天不行。」'), 'yt_dating': (YT, True, None), 'noshow': (AN, False, None)}
AN_S6 = ['（大家在麵店門口散了。以安沒有往女舍的方向走。）', '剛剛那個是抽的。', '我另外有帶一個。走一段再給你。']
AN_DT = ['（大家在麵店門口散了。以安從包包裡拿出一個小盒子。）', '這個不是抽的。', '鋼筆。申論題寫比較快。']
YT_S6 = ['（大家走了以後，語彤還沒走。阿姨在櫃台後面喊她。）', '阿姨說明天要用的蒜頭還沒剝。', '打烊以後，你要不要來幫忙。']
YT_DT = ['（大家走了以後，語彤從櫃台底下拿出一個紙袋。）', '給你。圍巾。', '你騎車脖子都露在外面。']
YT_OPTS = ['「好。」', '「今天不行。」']; YT_YES = '（剝到九點半，手上都是蒜味。）'; YT_NO = '嗯，沒關係。'
GRP_MARK = '（禮物先疊在桌子中間，吃完再抽。）'
VENUE = '聖誕交換禮物散場以後'; BOOKED = '約好 12/24（三），聖誕交換禮物散場以後。'
XMAS_ASK = '聖誕交換禮物，週三晚上六點半，麵店 一百五以內'
ORIG = {AN: ['聖誕節。……我手帳上這一天本來是空的。', '現在不是了。', '字很少。回去再看。', '（她遞過來一張卡片）'],
        YT: ['聖誕節麵店照常。……打烊以後，你要不要來剝蒜頭。', '今天打烊早。阿姨說，聖誕節要給年輕人。', '交換禮物我抽到一條圍巾。……我換給你了。阿哲不知道。']}
GRPJS = """(id=>{ const P=(typeof FEST_DATA!=='undefined'&&FEST_DATA.PEOPLE[id])||{}, c=(P.fest||{}).xmas||{}, g=c.grp||null; const tx=L=>(L||[]).filter(l=>l&&l.text!==undefined).map(l=>l.text);
  return {grp:g?{years:g.years,q:g.q,ev:g.ev,end:g.end,s6:tx(g.s6),dt:tx(g.dt),choice:(((g.s6||[]).find(l=>l&&l.choice)||{}).choice||[]).map(x=>x.text)}:null,
    gifts:(P.gifts||[]).map(x=>({id:x.id,name:x.name,price:x.price,lines:(x.lines||[]).map(l=>l.text)}))}; })"""
FESTJS = """(id=>{ const G=GAME.G, R=(G.fest&&typeof G.fest==='object')?G.fest:{}, k=id+':xmas:2025', q=OUT.get(G,'xmas_y1');
  return {done:(R.done||{})[k]||null, miss:(R.miss||{})[k]||null, gifts:(R.gifts||{})[id]||[], bk:(R.bk||[]).filter(b=>b.who===id).map(b=>({d:CALENDAR.dateOf(b.d).key,slot:b.slot,grp:b.grp||null,ref:b.ref,mode:b.mode})),
    mem:SOCIAL.has(id,'HOL_XMAS_2025'), garlic:G.flags.YT_XMAS_GARLIC_Y1==null?null:G.flags.YT_XMAS_GARLIC_Y1, q:q?{state:q.state,day:CALENDAR.dateOf(q.day).key,h:q.h}:null,
    ivs:(G.invites||[]).filter(v=>v.who===id&&(v.state==='accepted'||v.state==='going')).map(v=>({d:CALENDAR.dateOf(v.day).key,h:v.h,place:v.place})), festOut:!!OUT.get(G,'fest_'+id+'_xmas_2025'),
    money:G.money|0, ev:!!((G.events||{}).done||{}).ev_xmas_exchange}; })"""
XQ_PLANNED = "(()=>{ const q=OUT.get(GAME.G,'xmas_y1'); return !!q&&q.state==='planned'; })()"
XQ_GONE = "(()=>{ const q=OUT.get(GAME.G,'xmas_y1'); return !!q&&q.state!=='planned'; })()"   # 演完（done）或錯過（missed：沒走到出發，檢查會 FAIL）就停


async def xm_case(pg, cdp, run, case, jump_it):
    cid, dating, ans = XM_CASES[case]; tag = 'xm_' + case
    key = os.environ.get('XM_DAY', '2025-12-23'); h0 = ENVF('XM_H', 10.0)
    st, d = await state_at(pg, key, h0, 'dorm')
    lv = "const rel=LV(id,65,50,45,{npcRom:60,rom:35}); DT(id);" if dating else "const rel=LV(id,45,30,20,{npcRom:35,rom:10});"
    body = ("NOKX(); const id=%s; %s PHONE.join(G,'noodle_team','麵店團'); "
            "return {id, rel, dating:!!F['dating_'+id], grp:PHONE.inGroup(G,'noodle_team'), here:(typeof XMAS_HERE==='function')?XMAS_HERE(G):null, "
            "elig:FEST.eligible(G,id,'xmas',2025), fo:FEST.flowOpt(G,id,null,false)};") % (J(cid), lv)
    r = await load(pg, cdp, run, st, '%s：最小存檔 %s（大一寒假）%.2f 宿舍' % (tag, key, h0), js=body)
    run.check('%s：【捷徑】%s %s（FEST.eligible 聖誕 2025）、在麵店團、群戲在場的人有她（XMAS_HERE）' % (tag, cid, '交往中' if dating else '第 5 階'),
              bool(r) and r.get('elig') is True and r.get('grp') is True and cid in (r.get('here') or []) and (r.get('dating') is True) == dating, J(r))
    n0 = await pl_len(pg)
    ok_q = await play(pg, cdp, run, XQ_PLANNED, max_s=120, ff=False, tag=tag + '_plan', picks=STAY)
    ask = await pg.evaluate(MSG_OF, 'xmas_ask'); q = await pg.evaluate(OUTQ, 'xmas_y1')
    run.check('%s：讀檔後遊戲照規則補收阿哲在麵店團的揪團「%s」、排進行程 xmas_y1 12/24 18:30 阿鳳麵店' % (tag, XMAS_ASK),
              ok_q and [m['text'] for m in ask] == [XMAS_ASK] and bool(q) and q['day'] == '2025-12-24' and abs(q['h'] - 18.5) < 1e-6, J({'ask': ask, 'q': q}))
    if not q: return
    # ---- 約她：手機「朋友」→ 她「約」→「約她過節：聖誕節」→「晚上場」
    pi = await phone_inv(pg, cdp, run, cid, tag)
    if not pi['ok']: run.check('%s：手機「朋友」→ 她「約」' % tag, False, J(pi)); return
    md = await menu_drive(pg, cdp, run, ['約她過節', '這個時候才有', '晚上場'], tag)
    R = await rows(pg, n0); fx = await pg.evaluate(FESTJS, cid)
    slot = next((x for x in R if x['k'] == 'choose' and '晚上場（18:00～21:30）' in x['t']), None)
    eve = None
    if slot:
        T = slot['t'].split('｜'); i = next((j for j, t in enumerate(T) if t.startswith('晚上場')), None)
        if i is not None: eve = {'t': T[i], 'hint': slot['hs'][i], 'dim': slot['ds'][i], 'all': T, 'hints': slot['hs']}
    after_slot = [x for x in R[R.index(slot) + 1:] if x['k'] == 'choose'] if slot else []
    bk = [b for b in fx['bk'] if b['d'] == '2025-12-24']
    run.note('%s：約的選單 %s；選了 %s；說的 %s' % (tag, J(md['menus'])[:900], J(md['picked']), J(said(R)[-8:])))
    run.check('%s：「約她過節：聖誕節」→ 晚上場（18:00～21:30）沒灰掉、小字「%s」' % (tag, VENUE), bool(eve) and eve['hint'] == VENUE and not eve['dim'] and any(p.startswith('晚上場') for p in md['picked']), J(eve))
    run.check('%s：選了晚上場不另外選地點、「%s」；G.fest 記 grp xmas_y1（晚上場）、沒有排邀約或另外的出遊' % (tag, BOOKED),
              not after_slot and any(x['t'] == BOOKED and x['n'] == '' for x in R if x['k'] == 'say') and len(bk) == 1 and bk[0]['grp'] == 'xmas_y1' and bk[0]['slot'] == 'eve'
              and not [v for v in fx['ivs'] if v['d'] == '2025-12-24'] and not fx['festOut'], J({'after_slot': short(after_slot), 'bk': fx['bk'], 'ivs': fx['ivs'], 'festOut': fx['festOut']}))
    if not bk: return
    exp = await pg.evaluate(GRPJS, cid)
    want = (AN_DT if dating else AN_S6) if cid == AN else (YT_DT if dating else YT_S6)
    g = exp.get('grp') or {}
    run.check('%s：頁面的 FEST_DATA %s xmas.grp 和 AA_204 1-4 稿一字不差（只有 2025、接 xmas_y1）' % (tag, cid),
              g.get('years') == [2025] and g.get('q') == 'xmas_y1' and (g.get('dt') if dating else g.get('s6', [])[:3]) == want
              and (cid != YT or dating or (g.get('choice') == YT_OPTS and YT_YES in g.get('s6', []) and YT_NO in g.get('s6', []))), J(g))
    # ---- 12/24 晚上
    if jump_it:
        s0 = await snap(pg)
        await jump(pg, cdp, run, s0, '2025-12-24', 17 + 50 / 60, zone='dorm', pos=None, note='約好以後到 12/24 晚上中間不玩（XM_JUMP）')
    else:
        run.note('%s：約好以後照玩家：床「快轉 → 到下一個有事的日子」走到 12/24 晚上（XM_JUMP=0／auto 的第一個）' % tag)
    n1 = await pl_len(pg); m0 = await pg.evaluate("GAME.G.money|0")
    nm = await names_of(pg, cid)
    if case == 'noshow':
        dd = (await P.day_of(pg, '2025-12-24'))['d']
        until = "(()=>{ const q=OUT.get(GAME.G,'xmas_y1'); return !!q&&q.state==='missed'&&(GAME.G.day>%d||GAME.G.hour>=21.75); })()" % dd
        ok = await play(pg, cdp, run, until, max_s=ENVI('XM_MAX', 1500), picks=['不去了'], ff=True, tag=tag)
    else:
        picks = ['出發：聖誕交換禮物'] + ([ans] if ans else [])
        obs = {}

        async def at_line():
            obs['adv'] = await pg.evaluate(ADVST); obs['clock'] = await P.clock(pg)
        ok = await play(pg, cdp, run, XQ_GONE, max_s=ENVI('XM_MAX', 1500), picks=picks, ff=True, tag=tag,
                        shots_at=[want[0][1:10], want[1][:8], GRP_MARK[1:9]], on_line={want[0][1:10]: at_line})
    await pg.wait_for_timeout(2500)
    R = await rows(pg, n1); fx = await pg.evaluate(FESTJS, cid)
    d24 = [x for x in R if x.get('d') == '2025-12-24']
    run.note('%s：12/24 說的、選的 %s' % (tag, J(short([x for x in d24 if x['k'] in ('say', 'choose', 'cap', 'card')])[-40:])[:3500]))
    run.note('%s：FEST（只讀）%s' % (tag, J(fx)))
    orig = [x['t'] for x in d24 if x['k'] == 'say' and x['t'] in ORIG[cid]]
    if case == 'noshow':
        after = [x for x in R if x['k'] == 'say' and x['t'] in (AN_S6 + AN_DT)]
        run.check('%s：群戲那一刻選「不去了」→ xmas_y1 missed、沒有群戲（沒有「%s」）' % (tag, GRP_MARK), ok and (fx['q'] or {}).get('state') == 'missed' and not row_of(R, GRP_MARK) and not fx['ev'], J(fx['q']))
        run.check('%s：約了散場以後卻沒去群戲：散場以後那一段不演、沒有送禮、FEST miss＝missed、沒有 done、沒有節日記憶 HOL_XMAS_2025' % tag,
                  not after and not any(x['k'] == 'choose' and '（沒有準備）' in x['t'] for x in R) and fx['miss'] == 'missed' and not fx['done'] and not fx['mem'], J({'after': short(after), 'fx': fx}))
        run.check('%s：也沒有 AA_416 原本的晚上場（%s）' % (tag, ORIG[cid][0]), not orig, J(orig))
        await run.shot(pg, tag + '_end')
        return
    gm = row_of(R, GRP_MARK)
    run.check('%s：「出發：聖誕交換禮物」→ 群戲照演（「%s」，12/24）、演完 xmas_y1 done' % (tag, GRP_MARK), ok and bool(gm) and gm['d'] == '2025-12-24' and (fx['q'] or {}).get('state') == 'done', J({'gm': gm, 'q': fx['q']}))
    i0 = next((i for i, x in enumerate(R) if x['k'] == 'say' and x['t'] == want[0]), None)
    if i0 is None:
        run.check('%s：散場以後那一段（「%s」）有演' % (tag, want[0]), False, J(said(d24)[-12:])); await run.shot(pg, tag + '_end'); return
    S = seq_from(R, i0, 10)
    head_ok = len(S) >= 3 and [x['t'] for x in S[:3]] == want and S[0]['k'] == 'say' and S[0]['n'] == '' and all(is_her(x, cid, nm) for x in S[1:3])
    run.check('%s：群戲演完接著演（在「%s」之後）：%s（第一句旁白、後兩句她說）' % (tag, GRP_MARK, J(want)), head_ok and bool(gm) and R.index(gm) < i0, J(short(S)))
    if obs:
        run.note('【觀察】%s：那一段第一句的畫面（ADV，只讀）%s；時間 %s' % (tag, J(obs.get('adv')), J(obs.get('clock'))))
    rest = S[3:]; gift = exp.get('gifts') or []
    isgift = lambda x: x['k'] == 'choose' and '（沒有準備）' in x['t'] and any(gg['name'] in x['t'] for gg in gift)
    if cid == YT and not dating:
        ch_ok = bool(rest) and rest[0]['k'] == 'choose' and rest[0]['t'] == '｜'.join(YT_OPTS)
        run.check('%s：接著選項「好。」／「今天不行。」' % tag, ch_ok, J(short(rest[:2])))
        if ans == '「好。」':
            nx = rest[1:4]
            run.check('%s：「好。」→ 旁白「%s」→ 送禮選單；YT_XMAS_GARLIC_Y1＝yes；沒有「%s」' % (tag, YT_YES, YT_NO),
                      len(nx) >= 2 and nx[0]['k'] == 'say' and nx[0]['t'] == YT_YES and nx[0]['n'] == '' and isgift(nx[1]) and fx['garlic'] == 'yes' and not row_of(R, YT_NO), J(short(nx)))
            rest = rest[2:]
        else:
            nx = rest[1:3]
            run.check('%s：「今天不行。」→ 語彤「%s」，這一場結束：沒有送禮選單、沒有旁白「%s」；YT_XMAS_GARLIC_Y1＝no' % (tag, YT_NO, YT_YES),
                      bool(nx) and nx[0]['k'] == 'say' and nx[0]['t'] == YT_NO and is_her(nx[0], cid, nm) and not any(isgift(x) for x in R[i0:]) and not row_of(R, YT_YES) and fx['garlic'] == 'no', J(short(nx)))
            cap = [x for x in R[i0:] if x['k'] == 'cap' and '回到' in x['t'] and x.get('d') == '2025-12-24']
            run.check('%s：不扣分那一條：done＝declined、沒有節日記憶 HOL_XMAS_2025、沒有買禮物（錢 %s → %s）、回到學校照群戲散場 20:30（字幕的遊戲時間 %s）' % (tag, m0, fx['money'], J([c['h'] for c in cap])),
                      fx['done'] == 'declined' and not fx['mem'] and not fx['gifts'] and not [x for x in R[i0:] if x['k'] == 'money'] and bool(cap) and abs(cap[0]['h'] - 20.5) < 0.05, J({'fx': fx, 'cap': short(cap)}))
            run.check('%s：沒有 AA_416 原本的聖誕台詞' % tag, not orig, J(orig))
            await run.shot(pg, tag + '_end'); return
    # ---- 送禮
    gi = next((j for j, x in enumerate(rest) if isgift(x)), None)
    run.check('%s：接著送禮選單（%s）' % (tag, '／'.join(gg['name'] for gg in gift)), gi == 0, J(short(rest[:3])))
    gid = (fx['gifts'] or [None])[-1]; gg = next((x for x in gift if x['id'] == gid), None)
    gl = rest[gi + 1] if gi is not None and gi + 1 < len(rest) else None
    pay = [x for x in R[i0:] if x['k'] == 'money']
    run.check('%s：送了「%s」→ 她回「%s」、錢扣 %s（GAME.money 記到 %s）' % (tag, gg and gg['name'], gg and gg['lines'][:1], gg and gg['price'], J([x['t'] for x in pay])),
              bool(gg) and bool(gl) and gl['k'] == 'say' and gl['t'] == gg['lines'][0] and is_her(gl, cid, nm) and any(x['t'] == str(-gg['price']) for x in pay), J({'gift': gg, 'line': gl and short([gl]), 'pay': short(pay)}))
    cap = [x for x in R[i0:] if x['k'] == 'cap' and '回到' in x['t'] and x.get('d') == '2025-12-24']
    run.check('%s：done＝meet、節日記憶 HOL_XMAS_2025、回到學校 21:30（「回到…」字幕的遊戲時間 %s）' % (tag, J([c['h'] for c in cap])),
              fx['done'] == 'meet' and fx['mem'] and bool(cap) and abs(cap[0]['h'] - 21.5) < 0.05, J({'fx': fx, 'cap': short(cap)}))
    run.check('%s：不演 AA_416 原本的聖誕台詞（%s…）' % (tag, ORIG[cid][0][:14]), not orig, J(orig))
    await run.shot(pg, tag + '_end')


async def m_y1xmas(pg, cdp, run):
    cases = ENV('XM', 'an_single,an_dating,yt_single_yes,yt_single_no,yt_dating,noshow'); jm = os.environ.get('XM_JUMP', 'auto')
    for k, c in enumerate(cases):
        run.note('==== y1xmas：%s ====' % c)
        if c not in XM_CASES: run.check('y1xmas %s 認得' % c, False, '可以用：' + ','.join(XM_CASES)); continue
        ji = jm == '1' or (jm == 'auto' and k > 0)
        try: await xm_case(pg, cdp, run, c, ji)
        except Exception as ex: run.check('y1xmas %s：跑完（沒有探針例外）' % c, False, repr(ex)[:400]); traceback.print_exc()


# ================================================================ 2. v6b：V6-B
V6L = {'zrAsk': ['這裡的寒假很冷。雨一直下。', '……你要來嗎？不來也沒關係，真的。'], 'zrYes': ['我去。', '……好。那我先排好要看的片。'],
       'ukTown': '英國的一座小城。雨一直下。', 'ukPhotos': ['📷（她指給你看的書店櫥窗）', '📷（兩杯熱可可，一杯加了濃縮）', '📷（雨中的紅磚街）'],
       'ukLast': '（她穿雨衣、撐傘，在一間老戲院門口等，手上兩張票。）', 'ukTwo': '這次，兩張是本來就買的。', 'ukAfter': '這間只有六十個位子。……我以後的，要再小一點。',
       'psAsk': ['明天傍晚六點半，我第一次站上講台。課輔班。', '……下課以後，可以陪我走去小公園嗎？'], 'psLesson': '（她第一次站上課輔班的講台試教。）',
       'psLine': '有一個小朋友舉了六次手。……這次我有看到他。', 'zqAsk': ['今天晚上九點 來工作室', '新關卡要人試玩 你是測試員'], 'zqPlay': '（她請你試玩新關卡。）',
       'rpPhoto': ['📷（便利貼上一個紅筆笑臉）', '今天的'], 'yes': '好', 'no': '不行'}
RED_SHORT = ['這裡你寫得特別快。', '我學生寫快的地方，通常是還沒想清楚。', '（你看了第三段。……她說對了。）', '（她在旁邊畫了一個笑臉，沒有說話，把本子推回來。）']
UK_CG = 'cg_uk_rain_heroine02'
V6PAGE = """(()=>{ const L=(typeof V6B!=='undefined')?V6B.L:null; return L?{zrAsk:L.zrAsk,zrYes:L.zrYes,ukTown:L.ukTown,ukPhotos:L.ukPhotos,ukLast:L.ukLast,ukTwo:L.ukTwo,ukAfter:L.ukAfter,psAsk:L.psAsk,psLesson:L.psLesson,psLine:L.psLine,zqAsk:L.zqAsk,zqPlay:L.zqPlay,rpPhoto:L.rpPhoto,yes:L.yes,no:L.no}:null; })()"""


async def v6_page(pg, run):
    pl = await pg.evaluate(V6PAGE)
    run.check('v6b：頁面的 V6B.L 和這支探針抄的稿（tests/v6b_unit.js 讀稿比對過的那一份）一字不差', bool(pl) and all(pl.get(k) == v for k, v in V6L.items()),
              J({k: pl.get(k) for k in V6L if pl and pl.get(k) != V6L[k]} if pl else None))


async def v6_zr(pg, cdp, run):
    tag = 'v6_zr'
    st, d = await state_at(pg, '2028-12-18', 20.75, 'dorm', flags=Y4F)
    body = "NOKX(); const id=%s; const r=LV(id,45,30,0); const dt=RS(id); return {r, dating:dt, inUK:MSG.inUK(G,id), zrOk:V6B.zrOk(G)};" % J(ZR)
    r = await load(pg, cdp, run, st, '%s：最小存檔 2028-12-18（%s 第 %s 週，週一）20:45 宿舍、臺灣路線、Y4_PATH other' % (tag, d['term'], d['week']), js=body)
    run.check('%s：【捷徑】和芷若交往中、她在英國（MSG.inUK）、V6B.zrOk' % tag, bool(r) and r.get('dating') and r.get('inUK') and r.get('zrOk'), J(r))
    got, M = await wait_msg(pg, cdp, run, 'v6b_zr_uk_ask', ENVI('ZR_WAIT', 600), tag + '_wait')
    run.check('%s：12/18（一）21:00 她私訊「%s」「%s」＋回覆「我去。」「這個寒假不行。」' % (tag, V6L['zrAsk'][0], V6L['zrAsk'][1]),
              got and [m['text'] for m in M] == V6L['zrAsk'] and all(m['from'] == ZR and m['day'] == '2028-12-18' for m in M) and abs(M[0]['h'] - 21) < 0.3 and M[-1]['opts'] == ['我去。', '這個寒假不行。'], J(M))
    if not got: return
    a = await answer(pg, cdp, run, ('eq', 'v6b_zr_uk_ask'), '我去。', tag)
    await play(pg, cdp, run, "!!OUT.get(GAME.G,'v6b_zr_uk')", max_s=40, ff=False, tag=tag + '_plan', picks=STAY)
    th = await pg.evaluate(THREAD, ['p:' + ZR, 6]); q = await pg.evaluate(OUTQ, 'v6b_zr_uk'); go = await pg.evaluate(FLAGV, 'ZR_UK_GO')
    run.check('%s：手機點「我去。」→ 她回「%s」；ZR_UK_GO yes；排 2029-01-15 21:00（去機場 約 1 小時）' % (tag, V6L['zrYes'][1]),
              bool(a) and a['tapped'] == '我去。' and any(t[1] == V6L['zrYes'][1] and t[0] == ZR for t in th) and go == 'yes' and bool(q) and q['day'] == '2029-01-15' and abs(q['h'] - 21) < 1e-6 and q['state'] == 'planned',
              J({'a': a and a['tapped'], 'th': th, 'q': q, 'go': go}))
    if not q: return
    s0 = await snap(pg)
    await jump(pg, cdp, run, s0, '2029-01-15', 19.5, zone='dorm', pos=None, note='答應以後到 1/15 出發前中間一個月不玩')
    nm = await names_of(pg, ZR); n0 = await pl_len(pg); obs = {}

    async def at_two():
        obs['reg'] = await pg.evaluate("(id=>(typeof CG_REGISTRY!=='undefined'&&CG_REGISTRY[id])||null)", UK_CG)
        for _ in range(12):   # CG 圖是非同步載入（ADV.cg 的 loadImage）：最多等 6 秒看 #adv 有沒有 cg
            obs['adv'] = await pg.evaluate(ADVST)
            if 'cg' in ((obs['adv'] or {}).get('cls') or '').split(): break
            await pg.wait_for_timeout(500)
    until = "(()=>{ const F=GAME.G.flags, q=OUT.get(GAME.G,'v6b_zr_uk'); return (F.ZR_UK_TRIP==='done'||F.ZR_UK_TRIP==='missed')&&!!q&&q.state!=='planned'; })()"
    ok = await play(pg, cdp, run, until, max_s=ENVI('V6_MAX', 1500), picks=['出發：去英國'], ff=True, tag=tag,
                    shots_at=[V6L['ukTown'][:6], V6L['ukLast'][1:9], V6L['ukTwo'][:6], V6L['ukAfter'][:6]], on_line={V6L['ukTwo'][:6]: at_two})
    await pg.wait_for_timeout(2000)
    R = await rows(pg, n0)
    want = [V6L['ukTown']] + V6L['ukPhotos'] + [V6L['ukLast'], V6L['ukTwo'], V6L['ukAfter']]
    S = [x for x in R if x['k'] == 'say' and x['t'] in want]
    run.note('%s：說的、卡、字幕 %s' % (tag, J(short([x for x in R if x['k'] in ('say', 'card', 'cap', 'cg', 'bg')])[:40])[:3500]))
    run.check('%s：「出發：去英國找…」→ 照順序：「%s」、三張手機照片、（老戲院門口）、「%s」、散場「%s」（照片、戲院門口是旁白；兩句是她說）' % (tag, V6L['ukTown'], V6L['ukTwo'], V6L['ukAfter']),
              ok and [x['t'] for x in S] == want and all(x['n'] == '' for x in S[:5]) and all(is_her(x, ZR, nm) for x in S[5:]), J(short(S)))
    w = {x['t']: x for x in S}
    t1, t2, t3 = w.get(V6L['ukTown']), w.get(V6L['ukTwo']), w.get(V6L['ukAfter'])
    run.check('%s：到英國 1/16、最後一晚 1/20（六）19:30 英國時間（時差 −8）、散場 21:30' % tag,
              bool(t1 and t2 and t3) and t1['d'] == '2029-01-16' and t1.get('tz') == -8 and t2['d'] == '2029-01-20' and abs(t2['h'] - 19.5) < 0.05 and t2.get('tz') == -8 and t3['d'] == '2029-01-20' and abs(t3['h'] - 21.5) < 0.05,
              J(short([x for x in (t1, t2, t3) if x]) + [[x and x.get('tz') for x in (t1, t2, t3)]]))
    cards = [[x['n'], x['t']] for x in R if x['k'] == 'card']
    run.check('%s：日期卡 1/16（二）英國、1/20（六）英國' % tag, ['1/16（二）', '英國'] in cards and ['1/20（六）', '英國'] in cards, J(cards))
    cgr = [x for x in R if x['k'] == 'cg']
    ci = next((i for i, x in enumerate(R) if x['k'] == 'cg' and x['t'] == UK_CG), None); ti = R.index(t2) if t2 else None
    run.check('%s：BCG-25（%s，CG_REGISTRY 有登錄）放在「%s」那一句（前一拍）；那一句畫面是 CG（#adv.cg）' % (tag, UK_CG, V6L['ukTwo']),
              ci is not None and ti is not None and ci < ti and not [x for x in R[ci + 1:ti] if x['k'] == 'say'] and bool(obs.get('reg')) and 'cg' in ((obs.get('adv') or {}).get('cls') or '').split(),
              J({'cg': short(cgr), 'adv': obs.get('adv'), 'reg': obs.get('reg')}))
    fin = await pg.evaluate("""(()=>{ const G=GAME.G, F=G.flags, q=OUT.get(G,'v6b_zr_uk'); let tz=null, clk=null; try{ tz=STORY.tzOffset(G); }catch(e){} try{ clk=VAC.clock?VAC.clock(G):null; }catch(e){}
      return {key:CALENDAR.dateOf(G.day).key, h:+(+G.hour).toFixed(3), tz, clock:clk, trip:F.ZR_UK_TRIP||null, visit:!!F.ZR_UK_VISIT, mem:SOCIAL.has('heroine_02','UK_VISIT'), q:q?q.state:null,
        w21:!!OUT.get(G,'zruk_w_2029-01-21'), miss21:(G.msgs||[]).some(m=>m&&m.tag==='zruk_w_miss_2029-01-21')}; })()""")
    back = [x for x in R if x['k'] == 'cap' and '回到臺北' in x['t']]
    run.check('%s：1/22（一）早上回到臺北（字幕「回到臺北。」%s）、時差換回 0、ZR_UK_TRIP done、ZR_UK_VISIT、記憶 UK_VISIT、出遊 done' % (tag, J([[x['d'], x['h'], x.get('tz')] for x in back])),
              bool(back) and back[0]['d'] == '2029-01-22' and abs(back[0]['h'] - 8.5) < 0.1 and back[0].get('tz') == 0 and fin['trip'] == 'done' and fin['visit'] and fin['mem'] and fin['q'] == 'done' and not fin['clock'], J(fin))
    run.check('%s：途中（1/21 週日）她在英國的每週視訊沒排、沒有「沒接」' % tag, not fin['w21'] and not fin['miss21'], J(fin))
    await run.shot(pg, tag + '_end')


async def v6_ps(pg, cdp, run):
    route = os.environ.get('PS_ROUTE', 'TW'); tag = 'v6_ps_' + route.lower()
    st, d = await state_at(pg, '2028-11-07', 20.75, 'dorm', flags={'EXCHANGE_ROUTE': route, 'EXCH_RULE': 1, 'Y4_PATH': 'other', 'PS_RECONNECT': True})
    body = ("NOKX(); const id=%s; const r=LV(id,45,30,0); const d=D('2028-11-08'); return {r, dating:!!F['dating_'+id], psCond:V6B.psCond(G,d), where:(DATE.whereOn?DATE.whereOn(G,id,d):null), "
            "fare:((typeof HOMETOWN_LINES!=='undefined'&&HOMETOWN_LINES[id+'@台南'])||{}).fare||null, visits:(DATE.log?DATE.log(G,id).count|0:null)};") % J(PS)
    r = await load(pg, cdp, run, st, '%s：最小存檔 2028-11-07（%s 第 %s 週，週二）20:45 宿舍、%s 路線、PS_RECONNECT（放榜後聯絡上）' % (tag, d['term'], d['week'], route), js=body)
    run.check('%s：【捷徑】沛珊朋友（熟 45／信任 30、沒交往）、有聯絡方式、11/8 她在台南（V6B.psCond）' % tag, bool(r) and r.get('psCond') is True and not r.get('dating'), J(r))
    got, M = await wait_msg(pg, cdp, run, 'v6b_ps_lesson_ask', ENVI('ZR_WAIT', 600), tag + '_wait')
    run.check('%s：11/7（二）21:00 她私訊「%s」「%s」＋回覆「好」「不行」' % (tag, V6L['psAsk'][0], V6L['psAsk'][1]),
              got and [m['text'] for m in M] == V6L['psAsk'] and all(m['from'] == PS and m['day'] == '2028-11-07' for m in M) and abs(M[0]['h'] - 21) < 0.3 and M[-1]['opts'] == ['好', '不行'], J(M))
    if not got: return
    a = await answer(pg, cdp, run, ('eq', 'v6b_ps_lesson_ask'), '好', tag)
    await play(pg, cdp, run, "!!OUT.get(GAME.G,'v6b_ps_lesson')", max_s=40, ff=False, tag=tag + '_plan', picks=STAY)
    q = await pg.evaluate(OUTQ, 'v6b_ps_lesson'); go = await pg.evaluate(FLAGV, 'PS_FIRST_LESSON_GO')
    run.check('%s：點「好」→ PS_FIRST_LESSON_GO yes、排 11/8（三）19:30 台南（高鐵、18:00 以前要出發）' % tag,
              bool(a) and a['tapped'] == '好' and go == 'yes' and bool(q) and q['day'] == '2028-11-08' and abs(q['h'] - 19.5) < 1e-6 and q['place'] == '台南' and q['alarm'], J({'a': a and a['tapped'], 'q': q, 'go': go}))
    if not q: return
    nm = await names_of(pg, PS); n0 = await pl_len(pg); v0 = await pg.evaluate("(id=>DATE.log?DATE.log(GAME.G,id).count|0:null)", PS)
    until = "(()=>{ const F=GAME.G.flags, q=OUT.get(GAME.G,'v6b_ps_lesson'); return ['met','missed'].includes(F.PS_FIRST_LESSON)&&!!q&&q.state!=='planned'; })()"
    ok = await play(pg, cdp, run, until, max_s=ENVI('V6_MAX', 1500), picks=['出發：去台南找'], ff=True, tag=tag, shots_at=[V6L['psLesson'][1:9], V6L['psLine'][:8]])
    await pg.wait_for_timeout(2000)
    R = await rows(pg, n0)
    S = [x for x in R if x['k'] == 'say' and x['t'] in (V6L['psLesson'], V6L['psLine'])]
    run.note('%s：說的、卡、字幕、背景 %s' % (tag, J(short([x for x in R if x['k'] in ('say', 'card', 'cap', 'bg', 'money', 'choose')])[-30:])[:3000]))
    fin = await pg.evaluate("""(id=>{ const G=GAME.G, F=G.flags, q=OUT.get(G,'v6b_ps_lesson'); return {met:F.PS_FIRST_LESSON||null, q:q?q.state:null, visits:DATE.log?DATE.log(G,id).count|0:null, key:CALENDAR.dateOf(G.day).key, h:+(+G.hour).toFixed(2)}; })""", PS)
    go_row = next((x for x in R if x['k'] == 'choose' and '出發：去台南找' in x['t']), None)
    run.check('%s：床「快轉」停在 11/8 出發前（%s）→「出發：去台南找…」→ 旁白「%s」→ 沛珊「%s」' % (tag, go_row and [go_row['d'], go_row['h']], V6L['psLesson'], V6L['psLine']),
              ok and bool(go_row) and go_row['d'] == '2028-11-08' and [x['t'] for x in S] == [V6L['psLesson'], V6L['psLine']] and S[0]['n'] == '' and is_her(S[1], PS, nm), J(short(S)))
    run.check('%s：沒有告白（沒有「奇怪的問題」「重新認識」）；PS_FIRST_LESSON met、出遊 done' % tag,
              not any(re.search('奇怪的問題|重新認識', x['t']) for x in R if x['k'] == 'say') and fin['met'] == 'met' and fin['q'] == 'done', J(fin))
    pay = [x for x in R if x['k'] == 'money']; fare = (r or {}).get('fare')
    run.check('%s：高鐵票 %s（GAME.money 記到 %s）、正式校外約會 %s → %s（+1）、回到臺北' % (tag, fare, J([[x['t'], x['n']] for x in pay]), v0, fin['visits']),
              fare is not None and any(x['t'] == str(-fare) for x in pay) and fin['visits'] == (v0 or 0) + 1 and any(x['k'] == 'cap' and '回到臺北' in x['t'] for x in R), J({'pay': short(pay), 'fin': fin}))
    bg = [x for x in R if x['k'] == 'bg']
    run.note('【觀察】%s：背景（ADV begin／setBg）%s' % (tag, J(short(bg)[:8])))
    await run.shot(pg, tag + '_end')


async def v6_zq(pg, cdp, run):
    tag = 'v6_zq'
    st, d = await state_at(pg, '2028-11-10', 17.75, 'dorm', flags=dict(Y4F, ZQ_CONTRACT='lawyer'))
    body = "NOKX(); const id=%s; const r=LV(id,45,30,0); return {r, dating:!!F['dating_'+id], zqCond:V6B.zqCond(G,D('2028-11-10')), q15:F.ZQ_Q15==null?null:F.ZQ_Q15};" % J(ZQ)
    r = await load(pg, cdp, run, st, '%s：最小存檔 2028-11-10（%s 第 %s 週，週五）17:45 宿舍、臺灣路線、ZQ_CONTRACT lawyer（Q14 回過）' % (tag, d['term'], d['week']), js=body)
    run.check('%s：【捷徑】子晴朋友（熟 45／信任 30、沒交往）、有聯絡方式、V6B.zqCond' % tag, bool(r) and r.get('zqCond') is True, J(r))
    got, M = await wait_msg(pg, cdp, run, 'v6b_zq_studio_ask', ENVI('ZR_WAIT', 600), tag + '_wait')
    run.check('%s：11/10（五）18:00 她私訊「%s」「%s」＋回覆「好」「不行」' % (tag, V6L['zqAsk'][0], V6L['zqAsk'][1]),
              got and [m['text'] for m in M] == V6L['zqAsk'] and all(m['from'] == ZQ for m in M) and abs(M[0]['h'] - 18) < 0.3 and M[-1]['opts'] == ['好', '不行'], J(M))
    if not got: return
    a = await answer(pg, cdp, run, ('eq', 'v6b_zq_studio_ask'), '好', tag)
    await play(pg, cdp, run, "!!OUT.get(GAME.G,'v6b_zq_studio')", max_s=40, ff=False, tag=tag + '_plan', picks=STAY)
    q = await pg.evaluate(OUTQ, 'v6b_zq_studio'); go = await pg.evaluate(FLAGV, 'ZQ_STUDIO_GO')
    run.check('%s：點「好」→ ZQ_STUDIO_GO yes、排 21:00 子晴的工作室（捷運＋公車 約 30 分鐘）' % tag,
              bool(a) and a['tapped'] == '好' and go == 'yes' and bool(q) and abs(q['h'] - 21) < 1e-6 and q['place'] == '子晴的工作室' and abs(q['travelH'] - 0.5) < 1e-6, J({'a': a and a['tapped'], 'q': q, 'go': go}))
    if not q: return
    n0 = await pl_len(pg); obs = {}

    async def at_play():
        obs['adv'] = await pg.evaluate(ADVST); obs['clock'] = await P.clock(pg)
    until = "(()=>{ const F=GAME.G.flags, q=OUT.get(GAME.G,'v6b_zq_studio'); return ['met','missed'].includes(F.ZQ_STUDIO)&&!!q&&q.state!=='planned'; })()"
    ok = await play(pg, cdp, run, until, max_s=ENVI('V6_MAX', 1500), picks=['出發：子晴的工作室'], ff=True, tag=tag, shots_at=[V6L['zqPlay'][1:9]], on_line={V6L['zqPlay'][1:9]: at_play})
    await pg.wait_for_timeout(2000)
    R = await rows(pg, n0); fin = await pg.evaluate("(()=>{ const F=GAME.G.flags, q=OUT.get(GAME.G,'v6b_zq_studio'); return {st:F.ZQ_STUDIO||null, q:q?q.state:null}; })()")
    pr = row_of(R, V6L['zqPlay']); go_row = next((x for x in R if x['k'] == 'choose' and '出發：子晴的工作室' in x['t']), None)
    run.check('%s：「出發：子晴的工作室…」（%s）→ 旁白「%s」；ZQ_STUDIO met、出遊 done' % (tag, go_row and [go_row['d'], go_row['h']], V6L['zqPlay']),
              ok and bool(go_row) and bool(pr) and pr['n'] == '' and pr['d'] == '2028-11-10' and fin['st'] == 'met' and fin['q'] == 'done', J({'row': pr, 'fin': fin}))
    run.check('%s：沒有告白（沒有「你認真的」「回答.exe」）' % tag, not any(re.search('你認真的|回答\\.exe', x['t']) for x in R if x['k'] == 'say'), '')
    bg = [x for x in R if x['k'] in ('bg', 'cap', 'card')]
    run.note('【觀察】%s：工作室那一場的背景與字幕（只讀）：ADV %s；背景／字幕／日期卡紀錄 %s（ziqing_studio 還沒有圖＝深色底＋地點字幕是預期，BG-ZQ-STUDIO-1101 等美術；不算 PASS／FAIL）' %
             (tag, J(obs.get('adv')), J(short(bg)[:10])))
    await run.shot(pg, tag + '_end')


async def v6_psred(pg, cdp, run):
    tag = 'v6_psred'
    d17 = (await P.day_of(pg, '2028-11-17'))['d']
    st, d = await state_at(pg, '2028-11-20', 21 + 5 / 60, 'dorm', flags=dict(Y4F, PS_RECONNECT=True, PS_RED_PEN_SHORT=d17))
    body = ("NOKX(); const id=%s; const r=LV(id,45,30,0); const dt=RS(id); return {r, dating:dt, vo:(typeof HV!=='undefined'&&HV.videoOffer)?HV.videoOffer(G,id):null, short:F.PS_RED_PEN_SHORT, red:!!F.PS_RED_PEN, "
            "page:(typeof ROM1016_EVENTS!=='undefined')?ROM1016_EVENTS.RED_PEN_SHORT.map(x=>x.text||x.narr):null};") % J(PS)
    r = await load(pg, cdp, run, st, '%s：最小存檔 2028-11-20（%s 第 %s 週，週一）21:05 宿舍、臺灣路線、PS_RECONNECT、PS_RED_PEN_SHORT＝11/17（5-2 沒到）' % (tag, d['term'], d['week']), js=body)
    run.check('%s：【捷徑】和沛珊交往中、她在台南、手機「視訊？」約得到（HV.videoOffer ok）；頁面的短版四句和稿一樣' % tag,
              bool(r) and r.get('dating') and (r.get('vo') or {}).get('ok') and not r.get('red') and r.get('page') == RED_SHORT, J(r))
    nm = await names_of(pg, PS); n0 = await pl_len(pg)
    pi = await phone_inv(pg, cdp, run, PS, tag)
    if not pi['ok']: run.check('%s：手機「朋友」→ 沛珊「約」' % tag, False, J(pi)); return
    md = await menu_drive(pg, cdp, run, ['視訊？', '這個時候才有'], tag, max_s=300)
    await play(pg, cdp, run, "!GAME.E.player.busy", max_s=60, ff=False, tag=tag + '_drain', picks=STAY, shots_at=[RED_SHORT[0][:8]])
    R = await rows(pg, n0); fl = await pg.evaluate("(()=>{ const F=GAME.G.flags; return {red:F.PS_RED_PEN===true, short:F.PS_RED_PEN_SHORT==null?null:F.PS_RED_PEN_SHORT, vid:F.PS_VIDEO||null}; })()")
    run.note('%s：選單 %s；選了 %s；說的 %s' % (tag, J(md['menus'])[:600], J(md['picked']), J(said(R)[:20])))
    i0 = next((i for i, x in enumerate(R) if x['k'] == 'say' and x['t'] == RED_SHORT[0]), None)
    S = [x for x in R[i0:] if x['k'] == 'say'][:4] if i0 is not None else []
    vq = next((i for i, x in enumerate(R) if x['k'] == 'say' and x['t'] == '視訊？'), None)
    cl = next((i for i, x in enumerate(R) if x['k'] == 'say' and x['t'] == '好，我要去備課了。晚安！'), None)
    run.check('%s：手機「約」→「視訊？」→ 視訊開頭以後演短版：「%s」「%s」（她說）→ 旁白兩句；在結尾「好，我要去備課了。晚安！」之前' % (tag, RED_SHORT[0], RED_SHORT[1]),
              [x['t'] for x in S] == RED_SHORT and all(is_her(x, PS, nm) for x in S[:2]) and all(x['n'] == '' for x in S[2:]) and vq is not None and i0 > vq and (cl is None or cl > i0),
              J({'S': short(S), 'video': vq, 'close': cl}))
    run.check('%s：PS_RED_PEN true、PS_RED_PEN_SHORT 清掉' % tag, fl['red'] and fl['short'] is None, J(fl))
    await run.shot(pg, tag + '_after_video')
    PTRJS = "const L=STORY.DAILY_PHONE, i=L.findIndex(x=>x.id==='v6b_ps_redpen'); if(i>0) F.dpLast=L[i-1].id; return {i, dpLast:F.dpLast||null, n:L.length};"
    stages = []
    if os.environ.get('PSRED_PTR') == '1':
        await shortcut(pg, cdp, run, PTRJS, '%s：每天的手機小事輪替指標 dpLast 撥到紅筆照片前一則（PSRED_PTR=1）' % tag); stages.append('ptr')
    dun = (await P.day_of(pg, os.environ.get('PSRED_UNTIL', '2028-11-30')))['d']
    ok = await play(pg, cdp, run, "GAME.G.day>=%d" % dun, max_s=ENVI('PSRED_MAX', 1500), ff=True, tag=tag + '_days')
    M = await pg.evaluate(MSG_RE, '^dp_v6b_ps_redpen_')
    if not M and 'ptr' not in stages:
        dp0 = await pg.evaluate("(()=>{ const F=GAME.G.flags; return {dpLast:F.dpLast||null, dpDayOf:Object.fromEntries(Object.entries(F.dpDayOf||{}).map(([k,v])=>[k,CALENDAR.dateOf(v).key]))}; })()")
        run.note('【觀察】%s：自然輪到 %s 還沒輪到紅筆照片（每天的手機小事一天一則、照輪替；只讀 %s）——改【捷徑】撥輪替指標再過 7 天' % (tag, os.environ.get('PSRED_UNTIL', '2028-11-30'), J(dp0)))
        await shortcut(pg, cdp, run, PTRJS, '%s：每天的手機小事輪替指標 dpLast 撥到紅筆照片前一則' % tag); stages.append('ptr')
        c = await P.clock(pg)
        ok = await play(pg, cdp, run, "GAME.G.day>=%d" % (c['day'] + 7), max_s=ENVI('PSRED_MAX', 1500), ff=True, tag=tag + '_days2')
        M = await pg.evaluate(MSG_RE, '^dp_v6b_ps_redpen_')
    dp = await pg.evaluate("(()=>{ const F=GAME.G.flags; return {dpLast:F.dpLast||null, dpDayOf:Object.fromEntries(Object.entries(F.dpDayOf||{}).map(([k,v])=>[k,CALENDAR.dateOf(v).key])), now:CALENDAR.dateOf(GAME.G.day).key}; })()")
    run.note('%s：紅筆照片訊息 %s；每天的手機小事（只讀）%s' % (tag, J(M), J(dp)))
    pairs = {}
    for m in M: pairs.setdefault(m['day'], []).append(m)
    months = {}
    for k in pairs: months.setdefault(k[:7], []).append(k)
    good = [k for k, v in pairs.items() if [x['text'] for x in v] == V6L['rpPhoto'] and all(x['from'] == PS for x in v) and abs(v[0]['h'] - (23 + 10 / 60)) < 0.1 and abs(v[1]['h'] - (23 + 11 / 60)) < 0.1 and k > '2028-11-20']
    run.check('%s：床「快轉」過日子（到 %s；%s%s）：紅筆以後出現「%s」23:10、「%s」23:11（同一天、沛珊）' % (tag, dp['now'], '到了' if ok else '時間到', '；用了【捷徑】輪替指標' if stages else '', V6L['rpPhoto'][0], V6L['rpPhoto'][1]),
              bool(pairs) and len(good) == len(pairs), J(pairs))
    run.check('%s：一個自然月最多一次（%s）' % (tag, J(months)), all(len(v) <= 1 for v in months.values()), J(months))
    if M: await thread_shot(pg, cdp, run, 'p:' + PS, tag + '_photo_thread')


async def m_v6b(pg, cdp, run):
    await v6_page(pg, run)   # V6B.L 是頁面載入時就有的（不用讀檔；quiet_events 讀檔會把 EVENTS.onEnter／tick、手機自動打開關掉，後面的情境要照常）
    fns = {'zr': v6_zr, 'ps': v6_ps, 'zq': v6_zq, 'psred': v6_psred}
    for c in ENV('V6', 'zr,ps,zq,psred'):
        run.note('==== v6b：%s ====' % c)
        if c not in fns: run.check('v6b %s 認得' % c, False, '可以用：' + ','.join(fns)); continue
        try: await fns[c](pg, cdp, run)
        except Exception as ex: run.check('v6b %s：跑完（沒有探針例外）' % c, False, repr(ex)[:400]); traceback.print_exc()


# ================================================================ 3. usfinal：美國收尾
US_DAY = '2028-09-20'
USCHK = """(()=>{ const E=GAME.E, Z=E.zone; let lm=0, mesh=0; const urls=new Set(); let conc=null;
  E.scene.traverse(o=>{ if(!o.isMesh||!o.visible) return; mesh++; const ms=[].concat(o.material); if(ms.some(m=>m&&m.lightMap)){ lm++; for(const m of ms){ const im=m&&m.lightMap&&m.lightMap.image; if(im&&(im.currentSrc||im.src)) urls.add(String(im.currentSrc||im.src).split('/').pop()); } }
    for(const m of ms){ if(!conc&&m&&m.name==='usa_concrete'){ const t=m.map; conc={tex:t?(t.name||''):null, lm:!!m.lightMap}; } } });
  const P=E.player.obj.position;
  return {zone:GAME.G.zone, key:CALENDAR.dateOf(GAME.G.day).key, h:+(+GAME.G.hour).toFixed(2), lmMeshes:lm, mesh, zLightmapped:Z&&Z.lightmapped!=null?Z.lightmapped:null, rtNight:Z&&Z.rtNight!=null?+(+Z.rtNight).toFixed(3):null,
    lmUrls:[...urls].slice(0,4), concrete:conc, me:[+P.x.toFixed(2),+P.z.toFixed(2)], camYaw:+(+E.cam.yaw).toFixed(3)}; })()"""
WHITE_MAX = ENVF('US_WHITE_MAX', 0.15)


def lum_stats(path, box=None):
    """平均亮度（0～255）、死白（>248）、近白（>235）、黑（<12）比例；box＝(x0,y0,x1,y1) 的比例（0～1）"""
    try:
        from PIL import Image
        im = Image.open(path).convert('L')
        if box: im = im.crop((int(box[0] * im.width), int(box[1] * im.height), int(box[2] * im.width), int(box[3] * im.height)))
        im = im.resize((max(1, im.width // 4), max(1, im.height // 4))); px = list(im.getdata()); n = len(px)
        return {'mean': round(sum(px) / n, 1), 'white248': round(sum(1 for v in px if v > 248) / n, 3), 'near235': round(sum(1 for v in px if v > 235) / n, 3), 'dark12': round(sum(1 for v in px if v < 12) / n, 3)}
    except Exception as e:
        return {'err': str(e)}


async def wait_lm(pg, zone, max_s):
    t0 = time.time(); ck = None
    while time.time() - t0 < max_s:
        ck = await pg.evaluate(USCHK)
        if ck['zone'] == zone and ck['lmMeshes'] > 0: break
        await pg.wait_for_timeout(1000)
    await pg.wait_for_timeout(5000)
    return await pg.evaluate(USCHK)


async def us_shot(pg, run, tag):
    await pg.wait_for_timeout(2500)
    f = await run.shot(pg, tag); ck = await pg.evaluate(USCHK)
    return {'tag': tag, 'file': os.path.basename(f), 'me': ck['me'], 'camYaw': ck['camYaw'], 'h': ck['h'], 'full': lum_stats(f), 'lower': lum_stats(f, (0, 0.5, 1, 1))}


async def us_walk(pg, cdp, run, x, z, label):
    ok = await L.go_to(pg, cdp, run, x, z, 0.5, label, max_s=ENVI('WALK_MAX', 150))
    ck = await pg.evaluate(USCHK)
    run.note('走到%s（%.1f, %.1f）：%s，人在 %s' % (label, x, z, '到了' if ok else '沒到', ck['me']))
    return ok


async def us_load(pg, cdp, run, zone, h, label):
    da = (await P.day_of(pg, '2028-08-02'))['d']; dp = (await P.day_of(pg, '2028-06-08'))['d']
    USF = {'EXCHANGE_ROUTE': 'US', 'EXCH_RULE': 1, 'US_DEPARTED': True, 'US_ARRIVED': True, 'US_ARRIVED_DAY': da, 'Y4_PATH': 'bar', 'Y4_PATH_DAY': dp, 'USL_JETLAG': True}
    st, d = await state_at(pg, US_DAY, h, zone, flags=USF)
    await load(pg, cdp, run, st, '%s：最小存檔 %s（美國路線、已抵達）%s（出生點）' % (label, US_DAY, '%02d:%02d' % (int(h), round((h % 1) * 60))), quiet=True)
    return await wait_lm(pg, zone, ENVI('LM_WAIT', 90))


async def us_apt(pg, cdp, run):
    tag = 'usapt_1400'
    ck = await us_load(pg, cdp, run, 'us_apartment', 14.0, tag + '：公寓 us_apartment')
    run.check('%s：公寓載入、正式模型有光照貼圖（lightMap 的網格 %s）；門外、陽台的水泥是素面（%s）' % (tag, ck['lmMeshes'], J(ck['concrete'])),
              ck['zone'] == 'us_apartment' and ck['lmMeshes'] > 0, J(ck))
    if ck['zone'] != 'us_apartment': return
    res = [await us_shot(pg, run, tag + '_spawn_platform')]
    await us_walk(pg, cdp, run, -0.4, -3.75, '陽台')
    res.append(await us_shot(pg, run, tag + '_balcony_follow'))
    await L.turn_camera_to(pg, cdp, -1.0, -9.0); res.append(await us_shot(pg, run, tag + '_balcony_lookout'))
    await us_walk(pg, cdp, run, -0.2, 4.1, '門外平台')
    res.append(await us_shot(pg, run, tag + '_platform_follow'))
    await L.turn_camera_to(pg, cdp, -1.0, 3.0); res.append(await us_shot(pg, run, tag + '_platform_door'))
    await L.turn_camera_to(pg, cdp, -0.2, 9.0); res.append(await us_shot(pg, run, tag + '_platform_out'))
    for r in res: run.note('%s：平均 %s、死白 %s、近白 %s；下半部 平均 %s、死白 %s、近白 %s（人 %s、鏡頭 yaw %s）' %
                           (r['tag'], r['full'].get('mean'), r['full'].get('white248'), r['full'].get('near235'), r['lower'].get('mean'), r['lower'].get('white248'), r['lower'].get('near235'), r['me'], r['camYaw']))
    bad = [r for r in res if 'err' in r['full'] or r['full'].get('white248', 1) > WHITE_MAX or r['lower'].get('white248', 1) > WHITE_MAX]
    run.check('%s：陽台、門外平台（跟隨鏡頭＋手指轉向）每張死白（>248）≤ %.2f（全畫面、下半部）：不再一片白（%d 張）' % (tag, WHITE_MAX, len(res)), len(res) == 6 and not bad,
              J([[r['tag'], r['full'], r['lower']] for r in bad]))


async def us_shared(pg, cdp, run, h):
    tg = '%02d%02d' % (int(h), round((h % 1) * 60)); tag = 'usshared_' + tg
    ck = await us_load(pg, cdp, run, 'us_shared', h, tag + '：C 棟合租戶 us_shared')
    run.check('%s：合租戶載入、有光照貼圖（lightMap 的網格 %s、區域記 lightmapped %s、晚上係數 rtNight %s；貼圖 %s）' % (tag, ck['lmMeshes'], ck['zLightmapped'], ck['rtNight'], J(ck['lmUrls'])),
              ck['zone'] == 'us_shared' and ck['lmMeshes'] > 0 and (not ck['lmUrls'] or any('us_shared_lm' in u for u in ck['lmUrls'])), J(ck))
    if ck['zone'] != 'us_shared': return
    res = [await us_shot(pg, run, tag + '_spawn_platform')]
    await us_walk(pg, cdp, run, -1.2, -0.6, '客廳')
    res.append(await us_shot(pg, run, tag + '_living_follow'))
    await L.turn_camera_to(pg, cdp, 1.3, -1.0); east = await us_shot(pg, run, tag + '_living_east'); res.append(east)
    await us_walk(pg, cdp, run, -1.6, 4.1, '門外平台（207 那一側）')
    await L.turn_camera_to(pg, cdp, -2.6, 4.0); d207 = await us_shot(pg, run, tag + '_door207'); res.append(d207)
    for r in res: run.note('%s：平均 %s、死白 %s、近白 %s、黑 %s；下半部 平均 %s（人 %s、鏡頭 yaw %s）' %
                           (r['tag'], r['full'].get('mean'), r['full'].get('white248'), r['full'].get('near235'), r['full'].get('dark12'), r['lower'].get('mean'), r['me'], r['camYaw']))
    run.note('【觀察】%s：客廳東邊（LAWWW2 還在修「白天偏暗」）平均亮度 %s／客廳跟隨鏡頭 %s；207 的門（LAWWW2 還在修「白天偏亮」）平均 %s、死白 %s——只記數字、截圖，不算 PASS／FAIL' %
             (tag, east['full'].get('mean'), res[1]['full'].get('mean'), d207['full'].get('mean'), d207['full'].get('white248')))
    bad = [r for r in res if 'err' in r['full'] or r['full'].get('dark12', 1) > 0.25]
    run.check('%s：平台、客廳、東邊、207 每張都有畫面（黑 <12 的 ≤ 0.25；%d 張）' % (tag, len(res)), len(res) == 4 and not bad, J([[r['tag'], r['full']] for r in bad]))


async def m_usfinal(pg, cdp, run):
    for name, fn in (('apt', us_apt), ('shared1400', lambda a, b, c: us_shared(a, b, c, 14.0)), ('shared2030', lambda a, b, c: us_shared(a, b, c, 20.5))):
        if name not in ENV('US', 'apt,shared1400,shared2030'): continue
        run.note('==== usfinal：%s ====' % name)
        try: await fn(pg, cdp, run)
        except Exception as ex: run.check('usfinal %s：跑完（沒有探針例外）' % name, False, repr(ex)[:400]); traceback.print_exc()


# ================================================================ main
MODEFN = {'y1xmas': m_y1xmas, 'v6b': m_v6b, 'usfinal': m_usfinal}


async def main():
    run = L.Run('d885_' + '+'.join(MODES), OUT); os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        for m in MODES:
            fn = MODEFN.get(m)
            if not fn: run.check('MODE %s 認得' % m, False, '可以用：' + ','.join(MODEFN)); continue
            print('==== MODE %s（SHA %s）====' % (m, os.environ.get('SHA', '?')), flush=True)
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
            pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
            try:
                await pg.goto(URL); ok = await L.wait_loaded(pg); run.check('%s：遊戲載入' % m, ok)
                await pg.evaluate("localStorage.clear()"); await P.init(pg); await pg.evaluate(HOOK)
                await fn(pg, cdp, run)
            except Exception as e:
                run.check('%s：跑完（沒有探針例外）' % m, False, repr(e)[:500]); traceback.print_exc()
                try: await run.shot(pg, m + '_exception')
                except Exception: pass
            run.check('%s：沒有 JS 例外' % m, not errs, J(errs[:3]))
            try: await asyncio.wait_for(b.close(), 30)
            except Exception: pass
    print('SHA', os.environ.get('SHA', '?'), 'MODE', ','.join(MODES), flush=True)
    sys.exit(run.finish())

if __name__ == '__main__':
    asyncio.run(main())
