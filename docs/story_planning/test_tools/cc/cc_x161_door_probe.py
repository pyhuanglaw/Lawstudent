# -*- coding: utf-8 -*-
"""CC（帳號 A）11-03：X161「教室門口不聚人」瀏覽器探針（STORY-CLASSROOM-CROWD-SOCKET-1103／CROWD-NO-DOOR-1103）。
使用者原話（11-03 08:1x、09:4x）：「教室外面可以不要有一坨人嗎」「就是外面的人很怪，主要也是因為他們都不動」。
AA 選 (a)：門口不聚人；AA_495 第 3、4 節原本在教室門口的對話，改由教室裡前一排或同一排的同學說。
修正：09a1b02af（合併 0a37eaf1d：src/crowd3d.js 拿掉 indoorSpots 的 pre|／post|，加 S.seatTalkPrep／seatTalkPlay；src/classes3d.js S.attend 叫它們）。
     9a1c037a6 是總表更新（只有 docs）。目標版＝開發分支最新（9a1c037a6 是它的祖先）。
對照：修正前＝09a1b02af^1（e8589020f）。注意 9a1c037a6^＝09a1b02af 本身已經有修正，不能當對照。
     預期：目標版 ALL PASS；對照版第 1 項（門口站著不動）FAIL、第 2 項（教室裡的台詞）FAIL。

情境（CASES，逗號分開；預設 ge,law；一個情境一個新瀏覽器）：
  ge   普通 101「電影與敘事」（ge_film_y1s1，通識）2025-09-30（二）第 5 週 13:20–15:10。上課前那一段＝AA_495 第 3 節 GE 第 3 或 4 組；下課後＝第 8 或 10 組。
  law  普通 101「經濟學原理（上）」（econ_principles_1，法律系必修）2025-10-03（五）第 5 週 09:10–12:10。上課前＝LAW 第 2 組；下課後＝第 3 或 5 組（兩個人都是「法律系的學生」）。
流程：
  【前置／捷徑】用遊戲自己的讀檔（playlib.load_state，條件事件關閉、手機自動打開關閉）放在普通教學館大門內（spawn (0,5.8)）、上課前 20 分鐘。
  之後全部照玩家：站在大門內把鏡頭轉向 101 門口（單指滑畫面），遊戲時間照常流動（不用 ?turbo）等到上課前 PRE_SIT 分鐘（預設 10）；
  點地面／搖桿走到 101 第 3 排的空位旁（playlib.go_to），按互動鈕「坐下」→ 選「上課：…」；對話照玩家點 #dlg、選項點第一個（課堂提問）；
  下課選單點「先自由活動」；站在教室裡讓時間照常走到下課後 12 分鐘。沒有用任何快轉、瞬移；提早坐下時遊戲自己轉暗等到上課（玩家也是這樣）。
  每 SHOT_MIN 遊戲分鐘（預設 1.5）截一張看 101 門口的圖；對話出現 AA_495 那幾句時也截圖。
判斷（只讀遊戲狀態；頁面裡每 250 ms 取樣 E.npcs、G.hour、#fade）：
  1. 門口不聚人：門口區＝layout waitSpots 那一點（原本等的人站的地方）和 101 的門，半徑 DOOR_R（3 m）、101 教室外面。
     每個 NPC 在門口區「站著不動」（離起點 < 0.5 m）連續累計的遊戲時間；有人超過 DWELL_S（60 遊戲秒）＝FAIL。
     （遊戲時間 1 小時＝畫面時間 150 秒，1 遊戲秒≈0.04 秒；走過門口的人會一直離開起點，不會累計。）另外記錄從大門走進來坐下、下課站起來走出去的人數（要各 ≥ 3）。
  2. 台詞：GAME.say 的紀錄（文字＋說話的人＋那個人坐在哪）＋對話框 #dlgName／#dlgText。
     上課前：「（你在座位上等。教室慢慢坐滿了。）」之後、老師那一句（CLS.content 的 line）之前，連續出現一組 AA_495 的句子，每句 startswith 原文、名字是那一組的系；
     下課後：「下課了。」字幕之後連續出現一組。說話的人都坐在座位上、同一排、在玩家前一排（中間沒有別排）或玩家這一排，左右 3.2 m 內；說的時候畫面沒有轉暗。
     原文照抄 src/data/crowd_depts.js（AA_495，AA-C 2026-10-28 定稿）寫死在下面 TALKS；也和頁面上的 CROWD_DEPTS 對一次（只記錄）。
  3. 入座看得到走進來：每個坐下的 NPC 第一次坐下時——之前被看到離座位 ≥ 1.5 m（走過來的）＝OK；畫面轉暗時坐好的（seatTalkPrep 挪位子、settleRoom）＝OK（記錄人數）；
     讀檔那一刻已經坐著的＝記錄；畫面亮著的時候突然出現在座位上（之前沒看到、或之前就在座位旁）＝FAIL。
不是 iPhone：Playwright 手機模擬（is_mobile、觸控）。雲端是 SwiftShader（1～4 fps）；PC 用 CC_HEADLESS=0（有視窗＋顯示卡）。
用法：LW_TESTS=<工作樹>/tests SHA=<sha> [CASES=ge,law] [ORIENT=land|port] python3 cc_x161_door_probe.py '<URL>/index.html' <輸出資料夾>
每項一行 PASS／FAIL，最後 ALL PASS 或 FAILED n；exit 0／1。"""
import os, sys, json, math, time, asyncio
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
URL = URL.replace('?turbo&', '?').replace('&turbo', '').replace('?turbo', '')
SHA = os.environ.get('SHA', '?')
HEADLESS = os.environ.get('CC_HEADLESS', '1') != '0'
LAND = os.environ.get('ORIENT', 'land') != 'port'
CASES = [c.strip() for c in (os.environ.get('CASES') or 'ge,law').split(',') if c.strip()]
PRE_SIT = float(os.environ.get('PRE_SIT', '10'))      # 上課前幾分鐘開始走進教室
SHOT_MIN = float(os.environ.get('SHOT_MIN', '1.5'))   # 每幾遊戲分鐘截一張
DWELL_S = float(os.environ.get('DWELL_S', '60'))      # 門口站著不動超過幾遊戲秒＝FAIL
DOOR_R = 3.0
POST_MIN = 12.0
CASE_MAX_S = float(os.environ.get('CASE_MAX_S', '3000'))
J = lambda o: json.dumps(o, ensure_ascii=False, default=str)
FAILS = []

# AA_495 原文（src/data/crowd_depts.js，逐字照抄）：who＝各句說話的人的系（LAW 全部是法律）
TALKS = {
    'GE3': (['化學', '社工'], 'A：上禮拜的片你看完了嗎？／B：看了前面一半。／A：後面那一半呢？／B：後面那一半我在宿舍看完的。結局我不喜歡。'),
    'GE4': (['資工', '經濟'], 'A：我坐後面喔，我要寫作業。／B：你上禮拜也這樣說。／A：上禮拜的也還沒寫完。'),
    'GE8': (['土木', '醫學'], 'A：你們下一堂在哪？／B：醫學院那邊，要趕公車。／A：那不就是另一個校區？／B：對，所以我先走了。'),
    'GE10': (['歷史', '電機'], 'A：最後那個鏡頭為什麼拍那麼久？／B：老師說是要讓我們不舒服。／A：她成功了。'),
    'LAW2': (None, 'A：你判決看了嗎？／B：看了開頭跟結論。中間好長。'),
    'LAW3': (None, 'A：剛剛那個學說我抄下來了。可是我不知道我抄了什麼。／B：借我抄。'),
    'LAW5': (None, 'A：下一堂是誰的課？／B：同一個老師。／A：……我去買咖啡。'),
}
SPEC = {
    'ge': dict(cid='ge_film_y1s1', date='2025-09-30', pre=['GE3', 'GE4'], post=['GE8', 'GE10']),
    'law': dict(cid='econ_principles_1', date='2025-10-03', pre=['LAW2'], post=['LAW3', 'LAW5']),
}
FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'MET_ZHE': True,
         'zheNoodleDone': True, 'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True,
         'fundsV2': 1, 'KX_DEC3_MIGRATED': True, 'ROOM_FIRST_putong': True}


def steps(key):
    who, d = TALKS[key]
    out = []
    for s in d.split('／'):
        i = 'ABC'.index(s[0])
        out.append({'who': ('法律' if who is None else who[i]) + '系的學生', 't': s[2:]})
    return out


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + (info if isinstance(info, str) else J(info))) if info != '' else ''), flush=True)
    if not ok:
        FAILS.append(name)
    return ok


def setup(s): print('  [前置／捷徑] ' + s, flush=True)
def note(s): print('  ' + s, flush=True)


FIND_JS = r"""(([cid,date])=>{ let day=null; for(let d=-60;d<400;d++){ if(CALENDAR.dateOf(d).key===date){ day=d; break; } } if(day===null) return {err:'找不到日期 '+date};
  const D0=GAME.defaults('祐廷'), wd=CALENDAR.dateOf(day).wd; const G=Object.assign({},D0,{day,hour:6,weekday:wd%7,zone:'campus',stage:'law',flags:{}});
  const it=CLS.dayItems(G).find(q=>q.c.id===cid); if(!it) return {err:'那天沒有 '+cid,day};
  const T=CALENDAR.termOf(day); return {day,wd,key:it.key,name:it.c.name,kind:it.c.kind,t0:it.t0,t1:it.t1,zone:it.room.zone,room:it.room.room,term:T&&T.id,week:T&&T.week}; })(%s)"""

# 頁面裡的取樣器：門口站著不動的累計時間、每個 NPC 第一次坐下是怎麼坐下的、走出去的人
SAMPLER_JS = r"""(([zone,room,R,cap])=>{ if(window.__X161&&window.__X161.timer) clearInterval(window.__X161.timer);
  const Ls={putong:PUTONG_LAYOUT,boya:BOYA_LAYOUT,gongtong:typeof GONGTONG_LAYOUT!=='undefined'?GONGTONG_LAYOUT:null}, LY=Ls[zone], rm=LY.rooms.find(q=>q.id===room);
  const pts=[]; for(const w of (LY.waitSpots||[])) if(w.room===room) pts.push({x:w.x,z:w.z,lv:w.lv|0,what:'waitSpot'});
  if(rm.kind==='lecture'&&rm.door){ const d=rm.door, m=(d.a0+d.a1)/2; pts.push(d.wall==='W'||d.wall==='E'?{x:d.x,z:m,lv:rm.lv|0,what:'door'}:{x:m,z:d.z,lv:rm.lv|0,what:'door'}); }
  else if(rm.doorFront) pts.push({x:(rm.doorFront[0]+rm.doorFront[1])/2,z:rm.doorZ!=null?rm.doorZ:-0.4,lv:rm.lv|0,what:'door'});
  const ex=LY.entrance.exit, inRoom=(x,z)=>x>rm.x0&&x<rm.x1&&z>rm.z0&&z<rm.z1;
  const W=window.__X161={pts,ex:{x:ex.x,z:ex.z},room:{x0:rm.x0,x1:rm.x1,z0:rm.z0,z1:rm.z1},st:{},n:0,dwellMax:{s:0},dwellBad:[],seatLog:[],fadeSamples:0,lastH:null,zone0:zone,pid:0,samples:0,startH:GAME.G.hour};
  const tick=()=>{ try{ const E=GAME.E, G=GAME.G; if(G.zone!==W.zone0) return; const f=document.getElementById('fade'), fade=!!(f&&f.classList.contains('on'));
    const h=+G.hour, dh=W.lastH==null?0:Math.max(0,Math.min(h-W.lastH,cap)); W.lastH=h; W.samples++; if(fade) W.fadeSamples++; const first=W.samples===1;
    for(const n of E.npcs){ if(!n.obj||!n.obj.position) continue; if(n.__x161==null) n.__x161=++W.pid; const id=n.__x161, p=n.obj.position, lv=n.lv|0;
      let S=W.st[id]; if(!S){ S=W.st[id]={id,firstH:h,firstFade:fade,firstAtLoad:first,first:[+p.x.toFixed(2),+p.z.toFixed(2)],fromEntrance:Math.hypot(p.x-W.ex.x,p.z-W.ex.z)<4,anchor:null,dwell:0,maxD:0,seatedAt:null,how:null,trail:[],teacher:!!(n.clsTeacher||n.tSpot),name:n.name||'',lastPos:null,stoodAfterSit:false,leftSeatDist:0,walkOut:false}; }
      S.name=n.name||S.name; S.teacher=S.teacher||!!(n.clsTeacher||n.tSpot);
      const st=n.seat, sitting=!!st&&(n.pose==='sit'||n.pose==='read')&&Math.hypot(p.x-st.x,p.z-st.z)<0.45;
      /* 1. 門口站著不動 */
      const inDoor=!S.teacher&&!sitting&&!inRoom(p.x,p.z)&&pts.some(q=>q.lv===lv&&Math.hypot(p.x-q.x,p.z-q.z)<R);
      if(inDoor){ if(S.anchor&&Math.hypot(p.x-S.anchor[0],p.z-S.anchor[1])<0.5){ S.dwell+=dh; } else { S.anchor=[p.x,p.z]; S.dwell=0; }
        const sec=S.dwell*3600; if(sec>W.dwellMax.s) W.dwellMax={s:+sec.toFixed(1),id,name:S.name,x:+p.x.toFixed(2),z:+p.z.toFixed(2),h:+h.toFixed(4),pose:n.pose||null,path:!!(n.path&&n.path.length),crowd:n.crowd||null,crowdCls:n.crowdCls||null};
        if(sec>%DWELL%&&!S.badLogged){ S.badLogged=true; W.dwellBad.push({id,name:S.name,x:+p.x.toFixed(2),z:+p.z.toFixed(2),h:+h.toFixed(4),pose:n.pose||null,crowd:n.crowd||null,crowdCls:n.crowdCls||null}); } }
      else { S.anchor=null; S.dwell=0; }
      /* 3. 第一次坐下 */
      if(S.seatedAt==null){ if(sitting){ let how; const far=S.trail.length?Math.max(...S.trail.map(q=>Math.hypot(q[0]-st.x,q[1]-st.z))):0;
          if(S.firstAtLoad&&!S.trail.length) how='atLoad'; else if(far>=1.5) how='walked'; else if(fade||S.prevFade) how='fade'; else how='popped';
          S.seatedAt=h; S.how=how; S.seat=[st.x,st.z]; W.seatLog.push({id,how,h:+h.toFixed(4),seat:[st.x,st.z],far:+far.toFixed(2),fromEntrance:S.fromEntrance,first:S.first,firstFade:S.firstFade,name:S.name}); }
        else { S.trail.push([+p.x.toFixed(2),+p.z.toFixed(2)]); if(S.trail.length>400) S.trail.splice(0,100); } }
      else if(!sitting){ const d=Math.hypot(p.x-S.seat[0],p.z-S.seat[1]); if(d>S.leftSeatDist) S.leftSeatDist=d; if(n.leaving) S.walkOut=true; }
      S.prevFade=fade; S.lastPos=[+p.x.toFixed(2),+p.z.toFixed(2)]; S.lastH=h; }
  }catch(e){ W.err=String(e).slice(0,200); } };
  tick(); W.timer=setInterval(tick,250); return {pts,ex:W.ex,room:W.room}; })(%s)"""

# 對話、字幕的紀錄（只記，不改行為）
HOOK_JS = r"""(()=>{ if(window.__X161H) return 'again'; const H=window.__X161H={log:[],seq:0};
  const fadeOn=()=>{ const f=document.getElementById('fade'); return !!(f&&f.classList.contains('on')); };
  const rel=(me,q)=>{ const fx=Math.sin(me.yaw||0), fz=Math.cos(me.yaw||0), dx=q.x-me.x, dz=q.z-me.z; return {f:+(dx*fx+dz*fz).toFixed(2),l:+(dx*fz-dz*fx).toFixed(2)}; };
  const s0=GAME.say; GAME.say=function(w,t){ try{ const E=GAME.E, me=E.player&&E.player.seat; let sp=null;
      if(w&&w.obj){ const n=E.npcs.find(m=>m.obj===w.obj); if(n){ const st=n.seat, p=n.obj.position; sp={pid:n.__x161||null,seated:!!st&&(n.pose==='sit'||n.pose==='read')&&Math.hypot(p.x-st.x,p.z-st.z)<0.45,
          seat:st?[st.x,st.z,st.lv|0,st.room||null]:null,rel:(st&&me)?rel(me,st):null,sameRoom:!!(st&&me&&st.room===me.room&&((st.lv|0)===(me.lv|0)))}; } else sp={pid:null,notNpc:true}; }
      H.log.push({k:'say',i:++H.seq,who:(w&&w.name)||(typeof w==='string'?w:''),t:String(t==null?'':t),fade:fadeOn(),h:+(+GAME.G.hour).toFixed(4),sp,
        me:me?{x:me.x,z:me.z,yaw:me.yaw,room:me.room||null,row:me.row}:null}); }catch(e){} return s0.apply(this,arguments); };
  const c0=GAME.caption; GAME.caption=function(w,t){ try{ H.log.push({k:'caption',i:++H.seq,who:String(w||''),t:String(t==null?'':t),fade:fadeOn(),h:+(+GAME.G.hour).toFixed(4)}); }catch(e){} return c0.apply(this,arguments); };
  return 'ok'; })()"""

ROOMSEATS_JS = r"""(([room,me])=>{ const z=GAME.E.zone; return (z.seats||[]).filter(q=>q.room===room&&(q.kind==='class'||q.kind==='lecture')).map(q=>{ const fx=Math.sin(me.yaw||0), fz=Math.cos(me.yaw||0), dx=q.x-me.x, dz=q.z-me.z; return +(dx*fx+dz*fz).toFixed(2); }); })(%s)"""

PICK_SEAT_JS = r"""(room=>{ const E=GAME.E, z=E.zone; const sts=(z.seats||[]).filter(q=>q.room===room&&(q.kind==='class'||q.kind==='lecture'));
  const rows=[...new Set(sts.map(q=>q.row))].sort((a,b)=>a-b); const used=q=>q.taken||E.npcs.some(n=>{ const s=n.seat||n.seatTarget; return s&&Math.hypot(s.x-q.x,s.z-q.z)<0.35; });
  for(const r of [rows[Math.min(2,rows.length-1)],rows[Math.min(3,rows.length-1)],rows[1]]){ const c=sts.filter(q=>q.row===r&&!used(q)).sort((a,b)=>Math.abs(a.col-1.5)-Math.abs(b.col-1.5)); if(c.length){ const q=c[0], ap=GAME.seatApproach(q); return {x:q.x,z:q.z,row:q.row,col:q.col,lv:q.lv|0,yaw:q.yaw,ap}; } }
  return null; })(%s)"""

DOMDLG_JS = "(()=>({n:((document.getElementById('dlgName')||{}).textContent||'').trim(),t:((document.getElementById('dlgText')||{}).textContent||'').trim()}))()"
CHOICES_JS = "[...document.querySelectorAll('#choices button')].map(b=>({t:(b.textContent||'').trim(),dim:b.classList.contains('dim')||b.disabled}))"


async def tap_choice(pg, cdp, i):
    await pg.evaluate("(i=>{ const b=document.querySelectorAll('#choices button'); (b[i]||b[0]).scrollIntoView({block:'center'}); })(%d)" % i)
    c = await pg.evaluate("(i=>{ const b=document.querySelectorAll('#choices button'); const e=b[i]||b[0]; const r=e.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%d)" % i)
    await L.touch_tap(cdp, c[0], c[1])


def find_seq(says, key, lo, hi):
    """says[lo:hi] 裡連續出現 key 那一組（每句 startswith 原文、名字一樣）→ 回傳起點 index 或 -1"""
    want = steps(key)
    for i in range(max(lo, 0), max(hi - len(want) + 1, 0)):
        if all(says[i + k]['t'].startswith(w['t']) and says[i + k]['who'] == w['who'] for k, w in enumerate(want)):
            return i
    return -1


def seat_ok(lines, front_rows):
    """說話的人：都坐在座位上、同一間、同一排；前一排（玩家前面最近的一排，中間沒有別排）或玩家這一排；左右 3.2 m 內"""
    sp = [x.get('sp') or {} for x in lines]
    ppl = {}
    for x in sp:
        if x.get('pid') is not None:
            ppl[x['pid']] = x
    if not ppl or any(x.get('notNpc') or x.get('pid') is None for x in sp):
        return False, '說話的人不是 3D 人物：%s' % J(sp)
    P = list(ppl.values())
    if not all(x.get('seated') and x.get('sameRoom') and x.get('rel') for x in P):
        return False, '有人沒坐在玩家那一間的座位上：%s' % J(P)
    fs = [x['rel']['f'] for x in P]
    same = all(abs(f - fs[0]) < 0.3 for f in fs)
    ahead = sorted(set(round(f, 1) for f in front_rows if f > 0.3))
    frontrow = bool(ahead) and abs(fs[0] - ahead[0]) < 0.3
    beside = abs(fs[0]) < 0.3
    near = all(abs(x['rel']['l']) <= 3.2 for x in P)
    ok = len(P) >= 2 and same and (frontrow or beside) and near and not any(x.get('fade') for x in lines)
    return ok, J({'n': len(P), 'sameRow': same, 'frontRow': frontrow, 'beside': beside, 'near': near, 'f': fs, 'l': [x['rel']['l'] for x in P], 'fade': [x.get('fade') for x in lines]})


async def one(p, case):
    sp = SPEC[case]
    tag = case
    rec = {'case': case, 'sha': SHA, 'shots': []}
    if HEADLESS:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=LAND)
    else:
        b = await p.chromium.launch(headless=False)
        vp = {'width': 844, 'height': 390} if LAND else {'width': 390, 'height': 844}
        ctx = await b.new_context(viewport=vp, device_scale_factor=1, has_touch=True, is_mobile=True, user_agent=L.UA)
        pg = await ctx.new_page(); cdp = await ctx.new_cdp_session(pg); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('dialog', lambda dd: asyncio.ensure_future(dd.accept()))
    run = L.Run('x161_' + case, OUT)
    n = [0]
    T0 = time.time()

    async def shot(lab):
        n[0] += 1
        fp = os.path.join(OUT, 'x161_%s_%02d_%s.png' % (case, n[0], lab))
        try:
            await pg.screenshot(path=fp)
        except Exception as e:
            note('截圖失敗 %r' % e)
        rec['shots'].append(fp)
        return fp

    async def hour():
        return await pg.evaluate('+GAME.G.hour')

    async def watch_until(h_end, door_pt, lab, next_shot):
        """站著、時間照常流動，到 h_end；每 SHOT_MIN 分鐘截一張看門口的圖。回傳下一張的時間"""
        last_h, last_move = None, time.time()
        while time.time() - T0 < CASE_MAX_S:
            s = await L.state(pg)
            if s.get('paused'):
                await L.phone_away(pg, cdp); await L.close_panels(pg, cdp)
            if s['dlg'] or s['choices']:
                return next_shot, s
            h = s['hour']
            if last_h is None or h > last_h + 1e-5:
                last_h = h; last_move = time.time()
            elif time.time() - last_move > 120:
                note('%s：遊戲時間 120 秒沒有前進（%s）' % (lab, J(s))); return next_shot, s
            if h >= next_shot:
                await L.turn_camera_to(pg, cdp, door_pt[0], door_pt[1], tries=2)
                await shot('%s_%s' % (lab, hm(h)))
                next_shot = h + SHOT_MIN / 60
            if h >= h_end:
                return next_shot, s
            await pg.wait_for_timeout(1000)
        return next_shot, await L.state(pg)

    try:
        await pg.goto(URL)
        check('%s：遊戲載入' % tag, await L.wait_loaded(pg))
        await pg.evaluate('localStorage.clear()')
        it = await pg.evaluate(FIND_JS % J([sp['cid'], sp['date']]))
        rec['class'] = it
        if not check('%s：%s 有 %s（課表）' % (tag, sp['date'], sp['cid']), 'err' not in it, J(it)):
            raise RuntimeError('no class')
        note('%s：%s %s %s–%s %s %s（%s 第 %s 週）' % (tag, it['name'], sp['date'], hm(it['t0']), hm(it['t1']), it['zone'], it['room'], it['term'], it['week']))
        h0 = it['t0'] - 20 / 60
        setup('%s：讀檔到 %s 第 %d 天 %s（上課前 20 分鐘），普通教學館大門內（spawn）；條件事件、手機自動打開關閉（不測劇情）' % (tag, sp['date'], it['day'], hm(h0)))
        await L.load_state(pg, {'zone': it['zone'], 'day': it['day'], 'weekday': it['wd'] % 7, 'hour': h0, 'weather': 'clear', 'pos': None, 'stage': 'law', 'money': 30000,
                                'energy': 100, 'flags': dict(FLAGS)}, quiet_events=True, quiet_phone=True)
        await pg.wait_for_timeout(1500)
        hk = await pg.evaluate(HOOK_JS)
        ln = await pg.evaluate("(k=>{ const G=GAME.G; const it=CLS.dayItems(G).find(q=>q.key===k); const ct=it&&CLS.content(it); return {line:ct&&ct.line||null}; })(%s)" % J(it['key']))
        geo = await pg.evaluate(SAMPLER_JS.replace('%DWELL%', str(DWELL_S)) % J([it['zone'], it['room'], DOOR_R, 0.5 / 60]))
        rec['geo'] = geo; rec['teacher_line'] = ln
        st0 = await L.state(pg)
        check('%s：人在 %s、時間 %s' % (tag, it['zone'], hm(st0['hour'])), st0['zone'] == it['zone'] and abs(st0['hour'] - h0) < 0.05, J({'zone': st0['zone'], 'h': st0['hour'], 'hook': hk}))
        dp = geo['pts'][0]
        door_pt = (dp['x'], dp['z'])
        note('%s：門口區 %s（半徑 %.1f m、101 外面）；大門 %s；老師那一句 %s' % (tag, J(geo['pts']), DOOR_R, J(geo['ex']), J(ln.get('line'))))
        # ---- 上課前：站在大門內看門口，時間照常流動 ----
        await pg.wait_for_timeout(2500)
        await L.turn_camera_to(pg, cdp, door_pt[0], door_pt[1])
        await shot('pre_enter_%s' % hm(await hour()))
        nx, s = await watch_until(it['t0'] - PRE_SIT / 60, door_pt, 'pre', h0 + SHOT_MIN / 60)
        # ---- 走進教室、坐下（玩家的方式）----
        seat = await pg.evaluate(PICK_SEAT_JS % J(it['room']))
        rec['seat'] = seat
        if not check('%s：101 找得到空位（第 3 排附近）' % tag, bool(seat and seat.get('ap')), J(seat)):
            raise RuntimeError('no seat')
        note('%s：%s 開始走向座位 %s（第 %s 排第 %s 個），走到座位旁 %s' % (tag, hm(await hour()), [seat['x'], seat['z']], seat['row'], seat['col'], seat['ap']))
        ok = await L.go_to(pg, cdp, run, seat['ap'][0], seat['ap'][1], 0.55, '101 座位旁', max_s=900)
        sat = False; menu = None
        for k in range(8):
            s = await L.state(pg)
            if s['choices']:
                opts = await pg.evaluate(CHOICES_JS)
                if any(o['t'].startswith('上課：') for o in opts):
                    menu = opts; break
            if s['interact'].startswith('坐下'):
                await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(2500); continue
            if s['dlg']:
                await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(800); continue
            # 按鈕不是「坐下」：往座位推一下搖桿
            await L.go_to(pg, cdp, run, seat['ap'][0], seat['ap'][1], 0.35, '101 座位旁（再靠近）', max_s=120)
            await pg.wait_for_timeout(800)
        h_sit = await hour()
        psit = await pg.evaluate("(()=>{ const s=GAME.E.player.seat; return s?{x:s.x,z:s.z,room:s.room||null,row:s.row,col:s.col,yaw:s.yaw,lv:s.lv|0}:null; })()")
        rec['player_seat'] = psit; rec['h_sit'] = h_sit
        await shot('sat_%s' % hm(h_sit))
        sat = bool(psit and psit['room'] == it['room'] and menu)
        check('%s：走到 101（點地面／搖桿）、按「坐下」、出現「上課：…」（%s 坐下，要在上課前 0.5 分鐘以前）' % (tag, hm(h_sit)), sat and ok and h_sit < it['t0'] - 0.5 / 60, J({'go': ok, 'seat': psit, 'menu': menu and [o['t'] for o in menu]}))
        if not sat:
            raise RuntimeError('not seated')
        front_rows = await pg.evaluate(ROOMSEATS_JS % J([it['room'], psit]))
        k = next(i for i, o in enumerate(menu) if o['t'].startswith('上課：'))
        await tap_choice(pg, cdp, k)
        note('%s：點「%s」' % (tag, menu[k]['t']))
        # ---- 上課：對話照玩家點；下課選單點「先自由活動」----
        dom = []; t1 = time.time(); after = None; talk_shots = 0
        all_lines = set(w['t'] for kk in sp['pre'] + sp['post'] for w in steps(kk))
        while time.time() - T0 < CASE_MAX_S and time.time() - t1 < 1800:
            s = await L.state(pg)
            if s.get('paused') and not s['dlg'] and not s['choices']:
                await L.phone_away(pg, cdp); await L.close_panels(pg, cdp)
            if s['choices']:
                await pg.wait_for_timeout(500)
                opts = await pg.evaluate(CHOICES_JS)
                if not opts:
                    continue
                if any(o['t'].startswith('先自由活動') for o in opts):
                    after = opts
                    await tap_choice(pg, cdp, next(i for i, o in enumerate(opts) if o['t'].startswith('先自由活動')))
                    note('%s：下課選單 %s → 先自由活動' % (tag, J([o['t'] for o in opts])))
                    await pg.wait_for_timeout(1500); break
                kk = next((i for i, o in enumerate(opts) if not o['dim']), 0)
                note('%s：選單 %s → %s' % (tag, J([o['t'] for o in opts]), opts[kk]['t']))
                await tap_choice(pg, cdp, kk); await pg.wait_for_timeout(1200); continue
            if s['dlg']:
                prev = None
                for _ in range(6):
                    d = await pg.evaluate(DOMDLG_JS)
                    if prev and d == prev:
                        break
                    prev = d; await pg.wait_for_timeout(450)
                dom.append(d)
                if any(d['t'].startswith(x) for x in all_lines) and talk_shots < 12:
                    talk_shots += 1; await shot('talk_%s' % hm(await hour()))
                await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700); continue
            done = await pg.evaluate("(k=>!!CLS.rec(GAME.G).done[k])(%s)" % J(it['key']))
            if done and not s['busy'] and time.time() - t1 > 10:
                cap = await pg.evaluate("window.__X161H.log.filter(x=>x.k==='caption').map(x=>x.t)")
                if any(c.startswith('今天的課上完了') for c in cap):
                    note('%s：今天的課上完了（沒有下課選單）' % tag); break
            await pg.wait_for_timeout(700)
        rec['dom'] = dom; rec['after_menu'] = after
        done = await pg.evaluate("(k=>!!CLS.rec(GAME.G).done[k])(%s)" % J(it['key']))
        check('%s：照玩家上完這堂課（done）' % tag, done, J({'after': after and [o['t'] for o in after]}))
        # ---- 下課後：站在教室裡，時間照常流動到下課後 12 分鐘 ----
        s = await L.state(pg)
        if s['busy'] and s['interact'].startswith('站起'):
            await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
        h_now = await hour()
        nx, s = await watch_until(it['t1'] + POST_MIN / 60, door_pt, 'post', h_now)
        for _ in range(3):
            if s['dlg'] or s['choices']:
                await L.advance_dialogs(pg, cdp, run, until=lambda q: not q['dlg'] and not q['choices'], max_steps=30, pick=0)
                nx, s = await watch_until(it['t1'] + POST_MIN / 60, door_pt, 'post', nx)
        h_end = await hour()
        check('%s：時間照常流動到下課後 %d 分鐘（%s）' % (tag, POST_MIN, hm(h_end)), h_end >= it['t1'] + (POST_MIN - 0.5) / 60, hm(h_end))
        # ---- 判斷 ----
        W = await pg.evaluate("(()=>{ const W=window.__X161; clearInterval(W.timer); const st=Object.values(W.st); return {dwellMax:W.dwellMax,dwellBad:W.dwellBad,seatLog:W.seatLog,samples:W.samples,fadeSamples:W.fadeSamples,err:W.err||null,"
                              "walkOut:st.filter(s=>s.seatedAt!=null&&s.leftSeatDist>=2).map(s=>({id:s.id,d:+s.leftSeatDist.toFixed(2),leaving:s.walkOut,last:s.lastPos})),"
                              "teachers:st.filter(s=>s.teacher).map(s=>s.id)}; })()")
        H = await pg.evaluate('window.__X161H.log')
        rec['sampler'] = W; rec['log'] = H
        walked = [x for x in W['seatLog'] if x['how'] == 'walked']
        walked_in = [x for x in walked if x['fromEntrance']]
        note('%s：取樣 %d 次（轉暗 %d 次）；門口站最久 %s' % (tag, W['samples'], W['fadeSamples'], J(W['dwellMax'])))
        check('%s 第 1 項：門口不聚人——上課前 20 分鐘到下課後 12 分鐘，沒有人在 101 門口（%.0f m 內、教室外）站著不動超過 %d 遊戲秒' % (tag, DOOR_R, DWELL_S),
              not W['dwellBad'] and W['samples'] > 50 and not W['err'], J({'超過的人': W['dwellBad'][:8], '最久': W['dwellMax'], 'err': W['err']}))
        check('%s 第 1 項（補）：同學從大門走進教室坐下（≥3 人，實際 %d）、下課從座位走出去（≥3 人，實際 %d）' % (tag, len(walked_in), len(W['walkOut'])),
              len(walked_in) >= 3 and len(W['walkOut']) >= 3, J({'走進來': [(x['id'], x['first'], x['seat']) for x in walked_in][:8], '走出去': W['walkOut'][:8]}))
        # 2. 台詞
        says = [x for x in H if x['k'] == 'say']
        iw = next((i for i, x in enumerate(says) if x['t'].startswith('（你在座位上等。教室慢慢坐滿了。）')), -1)
        tl = ln.get('line') or '\u0000'
        ip = next((i for i, x in enumerate(says) if i > iw and x['t'].endswith(tl)), -1)
        pre = [(kk, find_seq(says, kk, iw + 1, ip if ip >= 0 else len(says))) for kk in sp['pre']]
        pre = [(kk, i) for kk, i in pre if i >= 0]
        cap_seq = next((x['i'] for x in H if x['k'] == 'caption' and x['t'].startswith('下課了。')), None)
        ipost0 = next((i for i, x in enumerate(says) if cap_seq is not None and x['i'] > cap_seq), len(says))
        post = [(kk, find_seq(says, kk, ipost0, len(says))) for kk in sp['post']]
        post = [(kk, i) for kk, i in post if i >= 0]
        note('%s：等上課那句 #%d、老師那句 #%d、「下課了。」字幕 seq %s；GAME.say 共 %d 句' % (tag, iw, ip, cap_seq, len(says)))
        ok_pre = False; why_pre = '沒有找到 %s 任何一組（「（你在座位上等…）」之後、老師開口之前）' % sp['pre']
        if pre and iw >= 0 and ip >= 0:
            kk, i = pre[0]; lines = says[i:i + len(steps(kk))]
            ok_seat, why = seat_ok(lines, front_rows)
            dom_ok = all(any(d['t'].startswith(w['t']) and d['n'].startswith(w['who']) for d in dom) for w in steps(kk))
            ok_pre = ok_seat and dom_ok; why_pre = '%s 第 %d～%d 句；%s；對話框字一樣 %s' % (kk, i, i + len(lines) - 1, why, dom_ok)
            await_lines = lines
            rec['pre_talk'] = {'key': kk, 'lines': await_lines}
        check('%s 第 2 項（上課前）：坐下等上課、老師開口之前，前一排或同一排的同學說 AA_495 %s 之一（startswith 原文、名字照系）' % (tag, '／'.join(sp['pre'])), ok_pre, why_pre)
        ok_post = False; why_post = '沒有找到 %s 任何一組（「下課了。」之後）' % sp['post']
        if post and cap_seq is not None:
            kk, i = post[0]; lines = says[i:i + len(steps(kk))]
            ok_seat, why = seat_ok(lines, front_rows)
            dom_ok = all(any(d['t'].startswith(w['t']) and d['n'].startswith(w['who']) for d in dom) for w in steps(kk))
            ok_post = ok_seat and dom_ok; why_post = '%s 第 %d～%d 句；%s；對話框字一樣 %s' % (kk, i, i + len(lines) - 1, why, dom_ok)
            rec['post_talk'] = {'key': kk, 'lines': lines}
        check('%s 第 2 項（下課後）：「下課了。」之後，前一排或同一排的同學說 AA_495 %s 之一' % (tag, '／'.join(sp['post'])), ok_post, why_post)
        # 頁面上的 CROWD_DEPTS 和探針寫死的原文對一次（只記錄）
        cd = await pg.evaluate("(()=>{ if(typeof CROWD_DEPTS==='undefined') return null; const o={}; for(const s of ['GE','LAW']) for(const x of CROWD_DEPTS[s]) o[s+x.n]=x.d; return o; })()")
        if cd:
            diff = [kk for kk in TALKS if cd.get(kk) != TALKS[kk][1]]
            note('%s：頁面 CROWD_DEPTS 和探針的 AA_495 原文不同的組：%s' % (tag, diff or '沒有'))
        # 3. 入座
        how = {}
        for x in W['seatLog']:
            how[x['how']] = how.get(x['how'], 0) + 1
        popped = [x for x in W['seatLog'] if x['how'] == 'popped']
        check('%s 第 3 項：沒有人在畫面亮著的時候憑空出現在座位上（走過來 %d、轉暗時坐好 %d、讀檔時已坐著 %d、憑空出現 %d）' % (tag, how.get('walked', 0), how.get('fade', 0), how.get('atLoad', 0), len(popped)),
              not popped and how.get('walked', 0) >= 3, J(popped[:8]))
        check('%s：沒有 JS 例外' % tag, not errs, J(errs[:3]))
    except Exception as e:
        check('%s：探針例外' % tag, False, repr(e)[:300])
        await shot('exception')
    finally:
        rec['elapsed_s'] = round(time.time() - T0)
        json.dump(rec, open(os.path.join(OUT, 'x161_%s.json' % case), 'w', encoding='utf-8'), ensure_ascii=False, indent=1, default=str)
        await b.close()


def hm(h):
    m = int(round((h % 24) * 60))
    return '%02d%02d' % (m // 60, m % 60)


async def main():
    os.makedirs(OUT, exist_ok=True)
    print('CASES=%s headless=%s orient=%s SHA=%s URL=%s' % (','.join(CASES), HEADLESS, 'land' if LAND else 'port', SHA, URL), flush=True)
    async with async_playwright() as p:
        for c in CASES:
            if c not in SPEC:
                check('未知的情境 %s' % c, False); continue
            await one(p, c)
    print('ALL PASS' if not FAILS else 'FAILED %d' % len(FAILS), flush=True)
    return 1 if FAILS else 0

if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
