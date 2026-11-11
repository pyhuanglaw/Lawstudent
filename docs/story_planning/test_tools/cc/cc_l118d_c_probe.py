"""CC（帳號 A）11-11：L118D_C——118 巷九間店改名改菜單（L118-SHOPS-REDO-1111，使用者規格 docs/handoff/user_specs/L118_SHOPS_REDO_1111.md）的舊存檔相容。
BB_335 驗收清單 C 節（＋H 節的「畫面上不出現 undefined、舊店名」）。Playwright 手機模擬（PC GPU）≠ iPhone。
做法照 cc_fn_migrate_probe.py：改之前的版本（線上版 779ddd650）用真的玩法做存檔（GAME.quickSave＝右上「存檔」同一個函式 → GAME.readSave('fatiao3d_quick')），
改之後的版本（c19d8b763）從標題「繼續」讀進來（重新整理 → 自動存檔 fatiao3d_auto 放這一份 → 觸控按 #btnContinue）。
存檔的底：fixtures/user_saves_1107/fatiao3d_save_day46.json（repo 裡已經有的那一份；只拿來當底，改日期、時間、地點，邀約只留做完的）＝【前置／捷徑】。
日子（CALENDAR 查過：學期第 10 週、不是假日、不是颱風天；探針開頭會再查一次）：A＝2025-11-05（三）、B＝2025-11-06（四）。
五種（CASES，預設 1,2,3,4,5；每一種印「== case N」）：
  1  人在街上（lane118）：1a 站在舊「一一八茶飲」店門口（現在是辛亥韓食）B 12:00；1b 站在東側 z −4.5（新的外帶店喝不喝咖啡那一段）B 12:00。
  2  人在舊茶飲 l118_tea 室內（現在＝辛亥韓食，區域 id 不變）：2a B 12:00（新店有開：預期還在 l118_tea）；
     2b B 15:30（舊茶飲 10～21 有開；新店 14:00～17:00 午休：預期 XSCLOSE「讀檔回到沒開的時候＝走出去」→ lane118 店門口 spawn_out (−3.9, 13.2)）。
  3  人在舊慢讀 l118_cafe2 室內（現在＝大學食堂）：3a B 12:00（新店 11:00～13:30 有開：預期還在 l118_cafe2）；3b B 15:00（舊慢讀 9～18 有開；新店 13:30～17:00 沒開：預期 lane118 (−3.9, −10.8)）。
  4  熟客紀錄：A 15:00 觸控進一一八茶飲點一次、出來走到慢讀咖啡進去點一次；【捷徑】換到 B 15:00、再進一一八茶飲點一次（G.l118 的 n、d、last 是真的點出來的）；
     其他店的次數、上次點的（老樣子）、一起吃的次數 w、ZHE_118_RANK、SIS_TEA_ORDER＝【捷徑】直接寫（寫了什麼印在 log）；存檔時人在巷子裡。
  5  已經約了慢讀念書（手機「朋友」→ 約 → 念書 → 慢讀咖啡 → 時間，A 09:30；約的人 INV_WHO 預設 heroine_01）：
     5a 約「明天 15:30」（木曜日 13:00～20:30 開始、週二休以內＝預期改去木曜日 wz_mokuyobi、狀態不變）→ 新版【捷徑】撥到約好的前 10 分鐘 → 手機「今天」按前往 → 到木曜日見面；
     5b 約「明天 12:10」（木曜日還沒開＝預期取消 cancelled）→ 新版用手機再約一次木曜日（念書 → 木曜日）。
     UI 約不成（她改時間、婉拒）＝【捷徑】改那一筆的時間或直接寫一筆（會寫在 log）。
     5b 另外記：取消的時候玩家看得到什麼（讀檔時的 toast、對話、手機「訊息」「今天」頁逐字、G.msgs 裡那一筆的訊息）、有沒有說要去哪裡約；
     再做「沒去過木曜日」的版本：【捷徑】刪掉 G.visited.wz_mokuyobi → 手機約 → 念書…選單截圖、列出選項全文、看得到看不到木曜日。
  6  人卡住（P0 類；BB 06:55）：舊版把人存在辛亥韓食門外那一格 (−2.896, 11.657)（照 11-11 雲端第一次重現：day46 → lane118 (0,16)、B 12:00、觸控點地面走到 (−3.0,11.5)；
     走到的位置差 0.15 m 以上＝【捷徑】放到那一格再存，log 寫確切座標）。新版讀進來以後：搖桿八方向（每 45°）各推 1 秒、整組 5 輪，每一下記位移
     （第 1 輪第 1 下是真的從讀進來的位置推；其他每一下之前【捷徑】把人放回那一格）；再在那一格周圍 0.5 m 的 3×3 格（【捷徑】放到每一格）各推八方向一次。
     每一格記 E.canStand（r 0.2／0.25／0.3／0.33／0.4）、導航格 5×5 阻擋、freeScore、附近 NPC（座標、半徑）、互動點、E.unstick 被叫幾次（包一層計數）、
     walkFallbacks、busy／seat／面板；推不動截圖。最後一行總結：哪幾格推不動、哪些方向。
  2b、3b 另外：被送到店門口以後在那個位置推八方向各 1 秒（記位移），推不動截圖、印狀態。
新版讀進來以後（每一個都）：沒有 JS 例外；同一天；區域照上面的預期；站的格子可走（E.canStand r0.3）；搖桿推得動 ≥0.3 m；
  G.l118 的 n、d、last、w 照規格搬（BB_335：麵舖→清州刀削麵 noodle2→korea、韓食→辛亥韓食 korea→tea、自助餐→大學食堂 self→cafe2、茶飲→喝不喝咖啡 tea→drink_a、
  慢讀 cafe2→併進 G.mokuyobi.n；dian、home、omu、pasta 不動；w：阿哲 noodle2→korea、korea→tea、self→home，柏翰 self→cafe2；ZHE_118_RANK noodle2→korea、korea→tea）——
  期望值由探針自己照這張表從舊存檔算（不讀遊戲的 L118.MV772），last 再對新菜單（新版 LANE118_SHOPS），對不到的要被清掉；mv772＝2；SIS_TEA_ORDER 保留；
  畫面文字（document.body.innerText）、這一區看得到的互動按鈕、區域名稱不出現 undefined、舊店名。
  前後存檔差異：舊存檔 JSON 和新版讀進來馬上再存一次的 JSON 遞迴比對，寫 <out>/diff_<case>.txt；log 印 l118、mokuyobi、相關旗標、pos、zone、slowread 邀約。
兩種跑法：
  A 一支跑完（PC 佇列 kind game，XARGS={url2} {url} {out}）：python3 cc_l118d_c_probe.py <改之前網址> <改之後網址> <out>
  B 兩段：MODE=make python3 cc_l118d_c_probe.py <改之前網址> <out>（存檔寫到 <out>/saves/）；
         MODE=load SAVES_FROM=<上一段的 out 或 saves 資料夾> python3 cc_l118d_c_probe.py <改之後網址> <out>
  D34（沒遷移時會不會 FAIL）：MODE=load 拿改之前的網址讀同一批存檔＝舊版讀舊檔，搬法、店名、區域那幾項應該 FAIL。
環境變數：CASES、DAY_A、DAY_B、INV_WHO。用法：LW_TESTS=<wt>/tests SHA=<sha> python3 cc_l118d_c_probe.py ...
存檔是合成的（底是 repo 裡已有的 fixture），只寫在 <out>/，不要放進 repo。"""
import os, sys, json, asyncio, math, time
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import importlib.util
_spec = importlib.util.spec_from_file_location('pe', os.path.join(HERE, 'pt1107e_arcs_probe.py')); pe = importlib.util.module_from_spec(_spec); _spec.loader.exec_module(pe)
L = pe.L
import cc_d141_lib as D
import cc_fn_lib as F
from playwright.async_api import async_playwright
TWO = len(sys.argv) >= 4
if TWO: URL_OLD, URL_NEW, OUT = sys.argv[1], sys.argv[2], sys.argv[3]; MODE = 'both'
else:
    MODE = (os.environ.get('MODE') or 'make').lower(); OUT = sys.argv[2]
    URL_OLD = sys.argv[1] if MODE == 'make' else None; URL_NEW = sys.argv[1] if MODE == 'load' else None
os.makedirs(OUT, exist_ok=True)
CASES = [c.strip() for c in (os.environ.get('CASES') or '1,2,3,4,5,6').split(',') if c.strip()]
R = L.Run('l118d_c_' + MODE, OUT); F.setup(R, OUT)
J = F.J
DAY_A = os.environ.get('DAY_A') or '2025-11-05'
DAY_B = os.environ.get('DAY_B') or '2025-11-06'
INV_WHO = os.environ.get('INV_WHO') or 'heroine_01'
SAVEDIR = os.path.join(OUT, 'saves')
SRC_DIR = None
SUBS = {'1': ['1a', '1b'], '2': ['2a', '2b'], '3': ['3a', '3b'], '4': ['4'], '5': ['5a', '5b'], '6': ['6']}
LAST_CONT_LOG = []

# ---------------------------------------------------------------- 規格（BB_335 C 節／使用者規格第一節）：探針自己的表，不讀遊戲的 L118.MV772
OLD_NAMES = ['滇香小館', '好家自助餐', '一一八茶飲', '巷口家常菜', '慢讀咖啡', 'Pasta 118', '韓食小廚', '蛋包飯研究所', '六張犁麵舖']
NEW_NAME = {'dian': '118牛排', 'self': '水上便當', 'tea': '辛亥韓食', 'home': '五湖四海', 'cafe2': '大學食堂', 'pasta': '義大麵屋', 'korea': '清州刀削麵', 'omu': '奈良咖哩', 'noodle2': '迪倫窯烤披薩', 'drink_a': '喝不喝咖啡', 'drink_b': '果茶社'}
MOVE_N = {'noodle2': 'korea', 'korea': 'tea', 'self': 'cafe2', 'tea': 'drink_a'}   # 熟客次數跟著店員走（麵舖→清州刀削麵、韓食→辛亥韓食、自助餐→大學食堂、茶飲→喝不喝咖啡）
GONE = 'cafe2'   # 慢讀咖啡的次數 → G.mokuyobi.n（慢讀整套搬到木曜日）
MOVE_W = {'zhe': {'noodle2': 'korea', 'korea': 'tea', 'self': 'home'}, 'classmate_bohan': {'self': 'cafe2'}}
MOVE_RANK = {'noodle2': 'korea', 'korea': 'tea'}
MOKU_OPEN = (13.0, 20.5)   # 木曜日約念書：13:00～20:30 開始（坐一個半小時、22:00 關）、週二休
# 舊版的店門、室內（779ddd650 src/data/l118_shop_layouts.js）
OLD_SHOP = {'tea': {'door': (-4.3, 11.5), 'out': (-3.9, 13.2), 'order': (-0.35, 0.15)}, 'cafe2': {'door': (-4.3, -12.5), 'out': (-3.9, -10.8), 'order': (0.1, -2.45)}}
# 新版這個時間開不開（c19d8b763 src/data/lane118_shops.js hours）：2a、3a 開著＝留在店裡；2b、3b 沒開＝XSCLOSE 走出去
PLAN = {
    '1a': {'day': DAY_B, 'h': 12.0, 'zone': 'lane118', 'start': (0.0, 16.0), 'goto': (-3.0, 11.5), 'door': 'tea', 'expect': 'lane118', 'why': '站在舊「一一八茶飲」店門口（現在是辛亥韓食）'},
    '1b': {'day': DAY_B, 'h': 12.0, 'zone': 'lane118', 'start': (0.0, -1.0), 'goto': (2.9, -4.5), 'expect': 'lane118', 'why': '站在東側 z −4.5（新的喝不喝咖啡那一段）'},
    '2a': {'day': DAY_B, 'h': 12.0, 'shop': 'tea', 'expect': 'l118_tea', 'why': '在舊一一八茶飲室內（新店辛亥韓食這時候有開）'},
    '2b': {'day': DAY_B, 'h': 15.5, 'shop': 'tea', 'expect': 'lane118', 'why': '在舊一一八茶飲室內（新店辛亥韓食這時候午休）'},
    '3a': {'day': DAY_B, 'h': 12.0, 'shop': 'cafe2', 'expect': 'l118_cafe2', 'why': '在舊慢讀咖啡室內（新店大學食堂這時候有開）'},
    '3b': {'day': DAY_B, 'h': 15.0, 'shop': 'cafe2', 'expect': 'lane118', 'why': '在舊慢讀咖啡室內（新店大學食堂這時候沒開）'},
    '6': {'day': DAY_B, 'h': 12.0, 'zone': 'lane118', 'start': (0.0, 16.0), 'goto': (-3.0, 11.5), 'expect': 'lane118', 'why': '辛亥韓食門外那一格（11-11 雲端推不動的位置）'},
}
CELL6 = (-2.896, 11.657)   # 11-11 雲端第一次（c19d8b76）推 0.00 m 的位置（l118d_c1.log）
DIRS8 = [(a, int(round(60 * math.sin(math.radians(a)))), int(round(-60 * math.cos(math.radians(a))))) for a in range(0, 360, 45)]   # 搖桿畫面方向：0＝往上（前）、90＝往右
DIRN = {0: '上', 45: '右上', 90: '右', 135: '右下', 180: '下', 225: '左下', 270: '左', 315: '左上'}
# 讀檔以前就掛上（每次重新整理都會跑）：E.unstick 被叫幾次（包一層計數）、#toast 出現過的字（讀檔當下的 toast 也收得到）
INIT_JS = r"""(()=>{ window.__unstickN=0; window.__unstickLog=[]; window.__ccToasts=[];
  const t=setInterval(()=>{ try{ const E=(typeof GAME!=='undefined'&&GAME)?GAME.E:null; if(E&&E.unstick&&!E.__ccUw){ const f=E.unstick; E.unstick=function(ent){ const o=ent&&ent.obj&&ent.obj.position, a=o?[+o.x.toFixed(2),+o.z.toFixed(2)]:null; const r=f.apply(this,arguments); window.__unstickN++; window.__unstickLog.push({who:ent===E.player?'player':String((ent&&(ent.charId||ent.id))||'?'),at:a,moved:!!r}); return r; }; E.__ccUw=1; clearInterval(t); } }catch(e){} },20);
  const hook=()=>{ const el=document.getElementById('toast'); if(!el){ setTimeout(hook,50); return; } new MutationObserver(()=>{ const x=(el.innerText||el.textContent||'').trim(); const L=window.__ccToasts; if(x&&L[L.length-1]!==x) L.push(x); }).observe(el,{childList:true,subtree:true,characterData:true,attributes:true}); };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',hook); else hook(); })()"""
CELLDIAG_JS = r"""(()=>{ const E=GAME.E, P=E.player, o=P.obj.position, lv=P.lv|0, n=E.navOf?E.navOf(lv):E.nav; const cell=n&&n.toCell?n.toCell(o.x,o.z):null; const blk=[];
  if(n&&cell){ for(let dz=-2;dz<=2;dz++) for(let dx=-2;dx<=2;dx++) if(n.blocked(cell[0]+dx,cell[1]+dz)) blk.push([dx,dz]); }
  const cs={}; for(const r of [0.2,0.25,0.3,0.33,0.4]) cs[r]=E.canStand?!!E.canStand(o.x,o.z,r,lv):null;
  const npcs=(E.npcs||[]).filter(q=>q&&q.obj&&Math.hypot(q.obj.position.x-o.x,q.obj.position.z-o.z)<2.5).map(q=>({id:String(q.charId||q.id||q.name||''),x:+q.obj.position.x.toFixed(2),z:+q.obj.position.z.toFixed(2),r:q.radius||null,d:+Math.hypot(q.obj.position.x-o.x,q.obj.position.z-o.z).toFixed(2),beh:q.beh||null,frozen:!!q.frozen,seat:!!q.seat,vis:q.obj.visible!==false}));
  const its=(E.interactables||[]).filter(i=>!i.hidden&&Math.hypot(i.x-o.x,i.z-o.z)<2.5).map(i=>({label:String(i.label||'').slice(0,24),x:+i.x.toFixed(2),z:+i.z.toFixed(2),r:i.radius||null}));
  const ov=['phone','menu','bigmap','dlg','choices','titleScreen'].filter(id=>{ const e=document.getElementById(id); return e&&!e.classList.contains('hide')&&getComputedStyle(e).display!=='none'; });
  return {x:+o.x.toFixed(3),z:+o.z.toFixed(3),lv,cell,cellBlocked:n&&cell?n.blocked(cell[0],cell[1]):null,blk5x5:blk,canStand:cs,freeScore:E.freeScore?E.freeScore(o.x,o.z,0.3,lv):null,
    npcs,its,colliders:(E.colliders||[]).length,radius:P.radius||null,busy:!!P.busy,seat:!!P.seat,path:P.path?P.path.length:0,paused:!!E.paused,ov,fb:GAME.walkFallbacks||0,unstick:window.__unstickN||0,unstickLog:(window.__unstickLog||[]).slice(-5),frame:E.frame|0}; })()"""
PLACE_JS = "(([x,z])=>{ const E=GAME.E, P=E.player; P.path=null; P.obj.position.set(x,P.obj.position.y,z); if(E.settleY) E.settleY(P); return [+P.obj.position.x.toFixed(3),+P.obj.position.z.toFixed(3)]; })"

# case 4【捷徑】寫入的其他店紀錄（[店, 次數, 上次那天＝今天＋幾天, 上次點的]）、一起吃的次數；茶飲、慢讀是真的點出來的，不寫
SC4_REC = [['noodle2', 3, -3, '牛肉麵'], ['korea', 2, -5, '石鍋拌飯'], ['self', 4, -2, '自助餐（三菜一肉）'], ['dian', 1, -7, '椒麻雞飯'], ['pasta', 2, -6, '青醬培根麵']]
SC4_W = {'zhe@noodle2': {'n': 2, 'd0': 20, 'd': 40}, 'zhe@korea': {'n': 1, 'd0': 27, 'd': 27}, 'zhe@self': {'n': 1, 'd0': 34, 'd': 34}, 'zhe@home': {'n': 1, 'd0': 30, 'd': 30},
         'classmate_bohan@self': {'n': 3, 'd0': 22, 'd': 45}, 'heroine_01@pasta': {'n': 1, 'd0': 33, 'd': 33}}
SC4_RANK = 'noodle2'

SAVE_NOW_JS = F.SAVE_NOW_JS
DAYOF_JS = "(k=>{ if(typeof STORY!=='undefined'&&STORY.dayOfKey) return STORY.dayOfKey(k); for(let d=0;d<4000;d++){ try{ if(CALENDAR.dateOf(d).key===k) return d; }catch(e){} } return null; })"
CALCHK_JS = "(d=>{ const C=CALENDAR, x=C.dateOf(d), t=C.termOf?C.termOf(d):null; return {key:x.key, wd:x.wd%7, kind:C.kind?C.kind(d):null, hol:C.holiday?C.holiday(d):null, typhoon:C.typhoon?!!C.typhoon(d):null, term:t?t.id:null, week:t?t.week:null, exam:t?(t.exam||null):null}; })"
SETDAY_JS = "(([d,h])=>{ const G=GAME.G; G.day=d; G.weekday=CALENDAR.dateOf(d).wd%7; G.hour=h; return {day:G.day, wd:G.weekday, hour:G.hour}; })"
NEWSHOPS_JS = "(()=>typeof LANE118_SHOPS==='undefined'?null:Object.fromEntries((LANE118_SHOPS.shops||[]).map(s=>[s.id,{name:s.name,menu:(s.menu||[]).map(m=>m[0])}])))()"
SHOPMENU_JS = "(id=>{ const s=(typeof LANE118_SHOPS!=='undefined'?LANE118_SHOPS.shops||[]:[]).find(q=>q.id===id); return s?{name:s.name,menu:s.menu.map(m=>m[0])}:null; })"
L118_JS = "(()=>{ const G=GAME.G; return JSON.parse(JSON.stringify({l118:G.l118||null, mok:G.mokuyobi||null, rank:(G.flags||{}).ZHE_118_RANK||null, tea:(G.flags||{}).SIS_TEA_ORDER||null, day:G.day, hour:+(+G.hour).toFixed(2), money:G.money|0})); })()"
DOM_JS = r"""(()=>{ const t=document.body.innerText||''; const its=(GAME.E.interactables||[]).filter(i=>!i.hidden).map(i=>String(i.label||'')); const zn=(typeof Z3!=='undefined'&&Z3.ZONES&&Z3.ZONES[GAME.G.zone]&&Z3.ZONES[GAME.G.zone].name)||'';
  return {text:t, its, zn}; })()"""
ORDERIT_JS = r"""(id=>{ const it=(GAME.E.interactables||[]).find(i=>i.shop118===id&&!i.hidden); return it?{label:it.label,x:+it.x.toFixed(2),z:+it.z.toFixed(2),r:it.radius||1,lv:it.lv|0}:null; })"""
INVS_JS = r"""((w)=>(GAME.G.invites||[]).filter(v=>v&&v.place==='slowread'&&(!w||v.who===w)).map(v=>({id:v.id,who:v.who,place:v.place,zone:v.zone||null,day:v.day,h:v.h,state:v.state,label:v.label||null,by:v.by||null})))"""
OVERLAY_JS = "['phone','menu','bigmap','dlg','choices','titleScreen','loading','fade'].filter(id=>{ const e=document.getElementById(id); return e&&!e.classList.contains('hide')&&getComputedStyle(e).display!=='none'&&(id!=='fade'||e.classList.contains('on')); })"
NPC_NEAR_JS = r"""(()=>{ const P=GAME.E.player.obj.position; return (GAME.E.npcs||[]).filter(n=>n.obj&&Math.hypot(n.obj.position.x-P.x,n.obj.position.z-P.z)<2.5).map(n=>({id:n.charId||n.id||'',x:+n.obj.position.x.toFixed(2),z:+n.obj.position.z.toFixed(2),beh:n.beh||null})); })()"""
NEAR_IT_JS = r"""(()=>{ const E=GAME.E, P=E.player.obj.position; return (E.interactables||[]).filter(i=>!i.hidden).map(i=>({label:String(i.label||''),d:+Math.hypot(i.x-P.x,i.z-P.z).toFixed(2),r:i.radius||1,shop:i.shop118||null,exit:i.exit?i.exit.to:null})).sort((a,b)=>a.d-b.d).slice(0,5); })()"""


# ---------------------------------------------------------------- 期望值（照規格的表，從舊存檔算）
def _obj(v):
    return v if isinstance(v, dict) else {}


def expect_of(old, menus):
    """old＝改之前存的那一份；menus＝新版 {店: {name, menu}}。回傳 {n, d, last, cleared, w, mok_n, rank, mv}"""
    R = old.get('l118') if isinstance(old.get('l118'), dict) else None
    F0 = _obj(old.get('flags'))
    mk_old = _obj(old.get('mokuyobi'))
    mok_n0 = mk_old.get('n') if isinstance(mk_old.get('n'), (int, float)) and mk_old.get('n') >= 0 else 0
    if R is None and not F0.get('ZHE_118_RANK'):
        return {'n': {}, 'd': {}, 'last': {}, 'cleared': [], 'w': {}, 'once': {}, 'mok_n': mok_n0, 'rank': None, 'mv': None}
    R = R or {}
    src = list(MOVE_N) + [GONE]
    out = {}
    for f in ('n', 'd', 'last'):
        T = dict(_obj(R.get(f))); old_v = {}
        for k in src:
            if k in T: old_v[k] = T.pop(k)
        for k, to in MOVE_N.items():
            if k in old_v: T[to] = old_v[k]
        out[f] = T
    n_gone = int(_obj(R.get('n')).get(GONE) or 0)
    cleared = []
    for k in list(out['last']):
        m = menus.get(k)
        if not m or out['last'][k] not in m['menu']: cleared.append([k, out['last'][k]]); del out['last'][k]
    W = dict(_obj(R.get('w')))
    for who, M in MOVE_W.items():
        keys = [k for k in W if k.startswith(who + '@')]
        if not any(k[len(who) + 1:] in M for k in keys): continue
        acc = {}
        for k in keys:
            shop = k[len(who) + 1:]; to = who + '@' + M.get(shop, shop); v = W[k]
            if not isinstance(v, dict):
                acc.setdefault(to, v); continue
            o = acc.get(to)
            if not isinstance(o, dict): acc[to] = dict(v); continue
            o['n'] = int(o.get('n') or 0) + int(v.get('n') or 0)
            if isinstance(v.get('d0'), (int, float)) and (not isinstance(o.get('d0'), (int, float)) or v['d0'] < o['d0']): o['d0'] = v['d0']
            if isinstance(v.get('d'), (int, float)) and (not isinstance(o.get('d'), (int, float)) or v['d'] > o['d']): o['d'] = v['d']
        for k in keys: del W[k]
        W.update(acc)
    rank = F0.get('ZHE_118_RANK')
    if isinstance(rank, str) and rank in MOVE_RANK: rank = MOVE_RANK[rank]
    return {'n': out['n'], 'd': out['d'], 'last': out['last'], 'cleared': cleared, 'w': W, 'once': _obj(R.get('once')), 'mok_n': mok_n0 + (n_gone if n_gone > 0 else 0), 'rank': rank, 'mv': 2}


def inv_expect(iv):
    """slowread 那一筆：還沒見面而且時間在木曜日開的時段（13:00～20:30、不是週二）＝改去木曜日、狀態不變；時段外＝取消；已經結束的只換區域"""
    pend = iv.get('state') in ('offered', 'changed', 'accepted', 'going')
    if not pend: return {'zone': None, 'state': iv.get('state')}   # 已經結束的：規格沒說，只看狀態不變（區域印出來）
    ok = MOKU_OPEN[0] <= float(iv.get('h') or 0) <= MOKU_OPEN[1] and iv.get('_wd') != 2
    return {'zone': 'wz_mokuyobi', 'state': iv.get('state') if ok else 'cancelled'}


# ---------------------------------------------------------------- 前後存檔差異
def rdiff(a, b, path='', out=None):
    out = [] if out is None else out
    if isinstance(a, dict) and isinstance(b, dict):
        for k in sorted(set(a) | set(b), key=str):
            p = '%s.%s' % (path, k) if path else str(k)
            if k not in a: out.append((p, '（沒有）', b[k]))
            elif k not in b: out.append((p, a[k], '（沒有）'))
            else: rdiff(a[k], b[k], p, out)
    elif isinstance(a, list) and isinstance(b, list):
        for i in range(max(len(a), len(b))):
            p = '%s[%d]' % (path, i)
            if i >= len(a): out.append((p, '（沒有）', b[i]))
            elif i >= len(b): out.append((p, a[i], '（沒有）'))
            else: rdiff(a[i], b[i], p, out)
    elif a != b:
        out.append((path, a, b))
    return out


def short(v, n=160):
    s = v if isinstance(v, str) else J(v)
    return s if len(s) <= n else s[:n] + '…'


KEY_ROOTS = ('l118', 'mokuyobi', 'pos', 'zone', 'day')
KEY_PREFIX = ('flags.SIS_TEA_ORDER', 'flags.ZHE_118_RANK', 'flags.SLOWREAD', 'flags.L118', 'visited.l118', 'visited.wz_mokuyobi')


def is_key(p):
    return any(p == r or p.startswith(r + '.') or p.startswith(r + '[') for r in KEY_ROOTS) or p.startswith(KEY_PREFIX)


def write_diff(k, old, new):
    d = rdiff(old, new)
    slow = {i for i, v in enumerate(old.get('invites') or []) if isinstance(v, dict) and v.get('place') == 'slowread'}
    key = [x for x in d if is_key(x[0]) or any(x[0].startswith('invites[%d]' % i) for i in slow)]
    p = os.path.join(OUT, 'diff_%s.txt' % k)
    with open(p, 'w', encoding='utf-8') as f:
        f.write('# L118D_C case %s：改之前存的 → 改之後讀進來馬上再存的（遞迴比對，只列有變的路徑；共 %d 條）\n' % (k, len(d)))
        f.write('## 重點（l118、mokuyobi、相關旗標、pos、zone、slowread 邀約）\n')
        for x in key: f.write('%s : %s → %s\n' % (x[0], short(x[1], 400), short(x[2], 400)))
        f.write('## 全部\n')
        for x in d: f.write('%s : %s → %s\n' % (x[0], short(x[1], 400), short(x[2], 400)))
    R.note('[DIFF %s] 共 %d 條有變（全部寫在 %s）；重點 %d 條：' % (k, len(d), p, len(key)))
    for x in key: print('    %s : %s → %s' % (x[0], short(x[1]), short(x[2])), flush=True)
    others = sorted({x[0].split('.')[0].split('[')[0] for x in d if x not in key})
    R.note('[DIFF %s] 其他有變的頂層欄位（新版補的預設、時間走了這類）：%s' % (k, J(others[:60])))
    return d


# ---------------------------------------------------------------- 共用
def errs_since(errs, n0):
    return errs[n0:]


async def base_load(pg, cdp, why, zone, x, z, day_key, hour, quiet=True):
    """【前置／捷徑】day46 存檔（repo fixture）→ 區域、位置、日子、時間；邀約只留做完的（歷史），錢 5000"""
    st = F.day46(); st['zone'] = zone; st['pos'] = {'x': x, 'z': z, 'yaw': 0.0, 'lv': 0}; st['hour'] = hour; st['money'] = 5000
    st['invites'] = [v for v in (st.get('invites') or []) if isinstance(v, dict) and v.get('state') in ('done', 'missed', 'cancelled')]
    d = await pg.evaluate("(%s)(%s)" % (DAYOF_JS, J(day_key))); st['day'] = d
    st['weekday'] = await pg.evaluate("(d=>CALENDAR.dateOf(d).wd%%7)(%d)" % d)
    try: await L.load_state(pg, st, quiet_events=quiet, quiet_phone=True)
    except TypeError: await L.load_state(pg, st, quiet_events=quiet)
    await pg.wait_for_timeout(5000); await L.close_panels(pg, cdp); await pg.evaluate(F.TOAST_HOOK)
    R.setup('%s：day46 存檔 → %s (%.1f, %.1f) %s（第 %s 天）%05.2f、錢 5000、邀約只留做完的%s' % (why, zone, x, z, day_key, d, hour, '、關條件事件' if quiet else ''))
    return await D.st(pg)


async def save_now(pg, k, why, extra=None):
    r = await pg.evaluate(SAVE_NOW_JS)
    meta = await pg.evaluate(L118_JS); s = await D.st(pg)
    meta.update({'zone': s['zone'], 'x': s['x'], 'z': s['z'], 'lv': s['lv']})
    if extra: meta.update(extra)
    os.makedirs(SAVEDIR, exist_ok=True)
    json.dump(r['s'], open(os.path.join(SAVEDIR, 'save_%s.json' % k), 'w', encoding='utf-8'), ensure_ascii=False)
    R.note('[MAKE %s] 存了（%s；%s）：%s' % (k, r['how'], why, J(meta)))
    R.check('[MAKE %s] 用遊戲的快速存檔存得起來（不是退回 snapshot）' % k, r['ok'], r['how'])
    return {'why': why, 'how': r['how'], 'meta': meta}


async def enter_shop(pg, cdp, tag, sid):
    exs = await pg.evaluate(D.EXITS)
    ex = next((e for e in exs if e['to'] == 'l118_' + sid), None)
    if not R.check('%s 巷子裡有進 l118_%s 的店門（%s）' % (tag, sid, ex and ex['label']), bool(ex), J(exs)): return None
    return await D.use_exit(pg, cdp, tag, ex['label'], 'l118_' + sid)


async def walk_to_order(pg, cdp, tag, sid):
    it = await pg.evaluate("(%s)(%s)" % (ORDERIT_JS, J(sid)))
    if not R.check('%s 店裡有點餐的地方（shop118 %s）' % (tag, sid), bool(it), ''): return None
    s = await D.st(pg)
    if not s['interact'].startswith(it['label']):
        tgt = await D.standable_near(pg, it['x'], it['z'], it['r'] * 0.6, it['lv'])
        await F.tap_near(pg, cdp, '%s 走到「%s」' % (tag, it['label']), (tgt or it)['x'], (tgt or it)['z'], 0.3, max_s=120)
    s = await F.wait_btn(pg, it['label'], 6)
    R.check('%s 走到「%s」，按鈕是它' % (tag, it['label']), s['interact'].startswith(it['label']), J({'at': [s['x'], s['z']], 'btn': s['interact']}))
    return it


async def order_first(pg, cdp, tag, sid):
    """觸控點餐：按「點餐（…）」→ 對話點過去 → 選單選第一樣（有「好／看一下菜單」先選看一下菜單）→ 點完、離開選單"""
    it = await walk_to_order(pg, cdp, tag, sid)
    if not it: return None
    m = await pg.evaluate("(%s)(%s)" % (SHOPMENU_JS, J(sid))); first = m['menu'][0]
    r0 = await pg.evaluate(L118_JS)
    await L.tap(pg, cdp, '#interact'); said = []; picked = None; t0 = time.time()
    while time.time() - t0 < 120:
        q = await L.state(pg)
        if q['choices']:
            o = await F.pe_opts(pg); ts = [x['t'] for x in o]; said.append('選項：' + '｜'.join(ts))
            if picked is None:
                k = next((i for i, x in enumerate(ts) if x.startswith(first)), None)
                if k is None: k = next((i for i, x in enumerate(ts) if x.startswith('看一下菜單')), None)
                if k is not None:
                    if ts[k].startswith(first): picked = ts[k]
                    await F.choose_k(pg, cdp, k); continue
            k = next((i for i, x in enumerate(ts) if any(w in x for w in ('算了', '不用了', '離開', '就這樣', '先這樣', '沒事'))), None)
            if k is None: k = next((i for i, x in enumerate(o) if not x['dim']), 0)
            said.append('【選】' + ts[k][:20]); await F.choose_k(pg, cdp, k); continue
        if q['dlg']:
            if not said or said[-1] != q['dtext']: said.append(q['dtext'])
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
        if picked and not q['busy']: break
        if not picked and not q['busy'] and time.time() - t0 > 12: break
        await pg.wait_for_timeout(500)
    r1 = await pg.evaluate(L118_JS)
    n0 = ((r0['l118'] or {}).get('n') or {}).get(sid, 0); n1 = ((r1['l118'] or {}).get('n') or {}).get(sid, 0)
    last1 = ((r1['l118'] or {}).get('last') or {}).get(sid)
    R.note('%s 點餐過程：%s' % (tag, J(said[-12:])))
    R.check('%s 點了「%s」（G.l118.n.%s %s→%s、last＝%s、錢 %d→%d）' % (tag, first, sid, n0, n1, last1, r0['money'], r1['money']), bool(picked) and last1 == first and r1['money'] < r0['money'], J({'picked': picked}))
    return {'item': first, 'n': n1}


# ---------------------------------------------------------------- MAKE（改之前）
async def make_case(pg, cdp, c, idx, errs):
    if c == '1':
        for k in SUBS['1']:
            P = PLAN[k]; tag = '[MAKE %s]' % k
            await base_load(pg, cdp, '%s %s' % (tag, P['why']), 'lane118', P['start'][0], P['start'][1], P['day'], P['h'])
            gx, gz = P['goto']
            if P.get('door'):
                tg = await D.standable_near(pg, OLD_SHOP[P['door']]['door'][0], OLD_SHOP[P['door']]['door'][1], 1.4 * 0.6, 0)
                if tg: gx, gz = tg['x'], tg['z']
            await F.tap_near(pg, cdp, '%s 走到 (%.1f, %.1f)' % (tag, gx, gz), gx, gz, 0.3, max_s=150)
            if P.get('door'): await F.wait_btn(pg, '進', 5)
            s = await D.st(pg)
            R.note('%s 停在 (%s, %s)；按鈕「%s」；附近的互動：%s' % (tag, s['x'], s['z'], s['interact'], J(await pg.evaluate(NEAR_IT_JS))))
            idx[k] = await save_now(pg, k, P['why'], {'btn': s['interact']})
    elif c == '6':
        k = '6'; P = PLAN[k]; tag = '[MAKE 6]'
        await base_load(pg, cdp, '%s %s' % (tag, P['why']), 'lane118', P['start'][0], P['start'][1], P['day'], P['h'])
        await F.tap_near(pg, cdp, '%s 走到 (%.1f, %.1f)（照 11-11 第一次）' % (tag, P['goto'][0], P['goto'][1]), P['goto'][0], P['goto'][1], 0.35, max_s=150)
        s = await D.st(pg); d = math.hypot(s['x'] - CELL6[0], s['z'] - CELL6[1])
        R.note('%s 觸控走到的確切座標 (%s, %s)，離那一格 (%.3f, %.3f) %.2f m' % (tag, s['x'], s['z'], CELL6[0], CELL6[1], d))
        if d > 0.15:
            got = await place(pg, CELL6)
            R.setup('%s【捷徑】走到的位置差 %.2f m（>0.15）：把人放到那一格 %s 再存' % (tag, d, J(got)))
        s = await D.st(pg)
        R.note('%s 存檔時的確切座標 (%s, %s) lv %s；canStand %s；附近：%s' % (tag, s['x'], s['z'], s['lv'], s['stand'], J(await pg.evaluate(CELLDIAG_JS))))
        idx[k] = await save_now(pg, k, P['why'], {'btn': s['interact']})
    elif c in ('2', '3'):
        for k in SUBS[c]:
            P = PLAN[k]; tag = '[MAKE %s]' % k; sid = P['shop']; dx, dz = OLD_SHOP[sid]['door']
            await base_load(pg, cdp, '%s %s' % (tag, P['why']), 'lane118', -1.6, dz, P['day'], P['h'])
            s = await enter_shop(pg, cdp, tag, sid)
            if not s: continue
            await walk_to_order(pg, cdp, tag, sid)
            await D.shot(pg, 'l118d_make_%s' % k, judge_black=False)
            idx[k] = await save_now(pg, k, P['why'])
    elif c == '4':
        tag = '[MAKE 4]'
        await base_load(pg, cdp, '%s 熟客紀錄（A 天 15:00）' % tag, 'lane118', -1.6, OLD_SHOP['tea']['door'][1], DAY_A, 15.0)
        ok = True
        for sid in ('tea', 'cafe2'):
            if not await enter_shop(pg, cdp, '%s A 天 %s' % (tag, sid), sid): ok = False; break
            if not await order_first(pg, cdp, '%s A 天 %s' % (tag, sid), sid): ok = False
            await F.finish_dialog(pg, cdp)
            if not await D.use_exit(pg, cdp, '%s A 天 %s 出店' % (tag, sid), '離開', 'lane118'): ok = False; break
        if ok:
            d = await pg.evaluate("(%s)(%s)" % (DAYOF_JS, J(DAY_B)))
            r = await pg.evaluate("(%s)(%s)" % (SETDAY_JS, J([d, 15.0])))
            R.setup('%s【捷徑】換到 B 天 %s 15:00（G.day、G.weekday、G.hour 直接改；人留在巷子裡）：%s' % (tag, DAY_B, J(r)))
            await pg.wait_for_timeout(1500); await F.ready(pg, cdp, 15)
            if await enter_shop(pg, cdp, '%s B 天 tea' % tag, 'tea'):
                await order_first(pg, cdp, '%s B 天 tea' % tag, 'tea'); await F.finish_dialog(pg, cdp)
                await D.use_exit(pg, cdp, '%s B 天 tea 出店' % tag, '離開', 'lane118')
        real = await pg.evaluate(L118_JS)
        R.note('%s 真的點出來的紀錄：%s' % (tag, J(real['l118'])))
        sc = await pg.evaluate("""((o)=>{ const G=GAME.G; const R=G.l118||(G.l118={}); for(const k of ['n','d','last','w','once']) if(!R[k]||typeof R[k]!=='object'||Array.isArray(R[k])) R[k]={};
          for(const [id,n,dd,last] of o.rec){ R.n[id]=n; R.d[id]=G.day+dd; R.last[id]=last; } Object.assign(R.w,o.w); const F=G.flags||(G.flags={}); F.ZHE_118_RANK=o.rank; F.SIS_TEA_ORDER=true;
          return JSON.parse(JSON.stringify({l118:R, rank:F.ZHE_118_RANK, tea:F.SIS_TEA_ORDER})); })(%s)""" % J({'rec': SC4_REC, 'w': SC4_W, 'rank': SC4_RANK}))
        R.setup('%s【捷徑】直接寫進 G.l118／G.flags：其他店 %s；w %s；ZHE_118_RANK＝%s；SIS_TEA_ORDER＝true（tea、cafe2 的 n／d／last 是上面真的點出來的，沒有動）' % (tag, J(SC4_REC), J(SC4_W), SC4_RANK))
        R.note('%s 寫完以後：%s' % (tag, J(sc)))
        idx['4'] = await save_now(pg, '4', '熟客紀錄（tea、cafe2 真的點；其他【捷徑】寫入）；人在巷子裡')
    elif c == '5':
        for k, prefer, want in (('5a', ['明天 15:30', '今天 15:30'], 'keep'), ('5b', ['明天 12:10', '今天 12:10'], 'cancel')):
            tag = '[MAKE %s]' % k
            await base_load(pg, cdp, '%s 約 %s 去慢讀念書（A 天 09:30）' % (tag, INV_WHO), 'lane118', 0.0, 0.0, DAY_A, 9.5)
            iv = await invite_slowread(pg, cdp, tag, INV_WHO, '慢讀咖啡', prefer)
            iv = await fix_invite(pg, tag, iv, want)
            if iv: idx[k] = await save_now(pg, k, '已經約了 %s 慢讀念書 %s（第 %s 天 %s）' % (INV_WHO, want, iv['day'], iv['h']), {'iv': iv})


async def invite_slowread(pg, cdp, tag, who, place_word, prefer):
    """手機「朋友」→ 她的「約」→ 念書 → place_word → 時間（prefer 依序找）→ 對話點過去（改時間＝「好，就…」）。回傳那一筆新的 slowread 邀約或 None"""
    before = {v['id'] for v in await pg.evaluate("(%s)(%s)" % (INVS_JS, J(who)))}
    await pe.phone(pg, cdp, 'friends')
    if not R.check('%s 手機「朋友」有 %s 的「約」' % (tag, who), await pe.tap_sel(pg, cdp, '#phoneBody [data-inv="%s"]' % who), ''): await pe.close_phone(pg, cdp); return None
    await pg.wait_for_timeout(1500); log = []
    for _ in range(12):   # 她說話（你等一下有空嗎？）到出現分類選單
        q = await L.state(pg)
        if q['choices']: break
        if q['dlg']: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(600)
    o = await pe.opts(pg); log.append('選項：' + '｜'.join(x['t'] for x in o))
    if not await pe.choose(pg, cdp, '念書'):
        R.check('%s 約的選單有「念書」' % tag, False, J(log)); await F.finish_dialog(pg, cdp); return None
    o = await pe.opts(pg); log.append('選項：' + '｜'.join(x['t'] for x in o))
    if not await pe.choose(pg, cdp, place_word):
        R.check('%s 「念書」裡有「%s」' % (tag, place_word), False, J(log)); await F.finish_dialog(pg, cdp); return None
    for _ in range(10):
        q = await L.state(pg)
        if q['choices']: break
        if q['dlg']: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(600)
    o = await pe.opts(pg); ts = [x['t'] for x in o]; log.append('時間：' + '｜'.join(ts))
    t = None
    for p in prefer:
        t = next((x for x in o if x['t'].startswith(p) and not x['dim']), None)
        if t: break
    if not t: t = next((x for x in o if (x['t'].startswith('今天') or x['t'].startswith('明天')) and not x['dim']), None)
    if not R.check('%s 有可以選的時間（想要 %s）' % (tag, J(prefer)), bool(t), J(log)): await F.finish_dialog(pg, cdp); return None
    await pe.choose(pg, cdp, t['t'], True)
    await pe.settle(pg, cdp, log, 40)
    R.note('%s 約的過程：%s' % (tag, J(log[-14:])))
    await pe.close_phone(pg, cdp); await F.ready(pg, cdp, 10)
    now = [v for v in await pg.evaluate("(%s)(%s)" % (INVS_JS, J(who))) if v['id'] not in before]
    R.note('%s 手機約完以後的新邀約：%s' % (tag, J(now)))
    return now[-1] if now else None


async def fix_invite(pg, tag, iv, want):
    """UI 約出來的不是想要的那一種（她改了時間）或沒約成＝【捷徑】改時間／寫一筆（舊版 slowread 的樣子）"""
    def kind(v):
        return 'keep' if MOKU_OPEN[0] <= float(v['h']) <= MOKU_OPEN[1] else 'cancel'
    if iv and iv['state'] in ('accepted', 'offered', 'changed') and kind(iv) == want:
        R.check('%s 用手機真的約成了（%s 第 %s 天 %s、%s）' % (tag, iv['state'], iv['day'], iv['h'], want), True, J(iv)); return iv
    h = 15.5 if want == 'keep' else 12 + 10 / 60
    if iv:
        await pg.evaluate("(([id,h])=>{ const v=(GAME.G.invites||[]).find(x=>x.id===id); if(v){ v.h=h; if(v.state!=='accepted') v.state='accepted'; } })(%s)" % J([iv['id'], h]))
        R.setup('%s【捷徑】手機約成的是 %s（%s 第 %s 天 %s），改成 %s：h＝%.2f、state＝accepted' % (tag, kind(iv) if iv['state'] in ('accepted', 'offered', 'changed') else iv['state'], iv['state'], iv['day'], iv['h'], want, h))
    else:
        await pg.evaluate("""(([w,h])=>{ const G=GAME.G; G.invSeq=(G.invSeq|0)+1; const nm=(CHARACTERS[w]||{}).name||w;
          (G.invites||(G.invites=[])).push({id:'iv'+G.invSeq, who:w, place:'slowread', zone:'l118_cafe2', day:G.day+1, h, state:'accepted', accepted:true, by:'player', now:false, label:'和'+nm+'約在慢讀咖啡'}); })(%s)""" % J([INV_WHO, h]))
        R.setup('%s【捷徑】手機沒約成：直接寫一筆 slowread 邀約（明天 %.2f、accepted、zone l118_cafe2、label「和…約在慢讀咖啡」，照舊版 S.accept 的欄位）' % (tag, h))
    v = await pg.evaluate("(%s)(%s)" % (INVS_JS, J(INV_WHO)))
    return v[-1] if v else None


# ---------------------------------------------------------------- 推八方向（case 6、2b、3b）
async def place(pg, pt):
    r = await pg.evaluate("(%s)(%s)" % (PLACE_JS, J(list(pt)))); await pg.wait_for_timeout(350); return r


async def push8(pg, cdp, tag, reset=None, first_real=False, ms=1000, shot=None):
    """搖桿八方向各推 ms 毫秒、記位移。reset＝每一下之前【捷徑】把人放回那一點（first_real＝第一下不放，真的從現在的位置推）。
    回傳 [{a, dir, mv, from, to}]；有一下 <0.05 m＝截圖（shot 名）、印 CELLDIAG"""
    out = []
    for i, (a, dx, dy) in enumerate(DIRS8):
        if reset and not (first_real and i == 0): await place(pg, reset)
        s0 = await L.state(pg)
        await L.joystick(pg, cdp, dx, dy, ms); await pg.wait_for_timeout(300)
        s1 = await L.state(pg)
        mv = round(math.hypot(s1['x'] - s0['x'], s1['z'] - s0['z']), 2)
        out.append({'a': a, 'dir': DIRN[a], 'mv': mv, 'from': [s0['x'], s0['z']], 'to': [s1['x'], s1['z']], 'zone': s1['zone']})
    R.note('%s 八方向各推 %.1f 秒的位移：%s' % (tag, ms / 1000.0, '、'.join('%s %.2f' % (x['dir'], x['mv']) for x in out)))
    stuck = [x for x in out if x['mv'] < 0.05]
    if stuck:
        if reset: await place(pg, reset)
        dg = await pg.evaluate(CELLDIAG_JS)
        R.note('%s 推不動（<0.05 m）的方向 %s；那時候的狀態：%s' % (tag, J([x['dir'] for x in stuck]), J(dg)))
        if shot: await D.shot(pg, shot, judge_black=False)
    return out


async def case6(pg, cdp, tag, s):
    p0 = (s['x'], s['z'])
    dg0 = await pg.evaluate(CELLDIAG_JS)
    R.note('%s 讀進來的那一格：%s' % (tag, J(dg0)))
    bad = []
    for r in range(5):
        res = await push8(pg, cdp, '%s 第 %d 輪（%s）' % (tag, r + 1, '第 1 下真的從讀進來的位置推，其他每一下之前【捷徑】放回 (%.3f, %.3f)' % (p0[0], p0[1]) if r == 0 else '每一下之前【捷徑】放回那一格'),
                          reset=p0, first_real=(r == 0), shot='l118d_6_round%d_stuck' % (r + 1))
        best = max(x['mv'] for x in res)
        R.check('%s 第 %d 輪：讀進來的那一格 (%.3f, %.3f) 八方向至少一個推得動 ≥0.3 m（最多 %.2f）' % (tag, r + 1, p0[0], p0[1], best), best >= 0.3, J([[x['dir'], x['mv']] for x in res]))
        st = [x['dir'] for x in res if x['mv'] < 0.05]
        if st: bad.append(['讀進來的那一格 第 %d 輪' % (r + 1), p0, st])
    R.setup('%s【捷徑】接下來把人放到那一格周圍 0.5 m 的 3×3 格，每一格推八方向（每一下之前放回那一格）' % tag)
    for dz in (-0.5, 0.0, 0.5):
        for dx in (-0.5, 0.0, 0.5):
            c = (round(p0[0] + dx, 3), round(p0[1] + dz, 3)); got = await place(pg, c)
            dg = await pg.evaluate(CELLDIAG_JS)
            R.note('%s 格 (%+.1f, %+.1f)＝(%.3f, %.3f)：%s' % (tag, dx, dz, c[0], c[1], J(dg)))
            res = await push8(pg, cdp, '%s 格 (%+.1f, %+.1f)' % (tag, dx, dz), reset=c, shot='l118d_6_cell_%+.1f_%+.1f_stuck' % (dx, dz))
            best = max(x['mv'] for x in res); st = [x['dir'] for x in res if x['mv'] < 0.05]
            if st: bad.append(['格 (%+.1f, %+.1f)' % (dx, dz), c, st])
            if dg['canStand'].get('0.3'):
                R.check('%s 格 (%+.1f, %+.1f) 站得住（canStand r0.3），八方向至少一個推得動 ≥0.3 m（最多 %.2f）' % (tag, dx, dz, best), best >= 0.3, J({'放到': got, 'mv': [[x['dir'], x['mv']] for x in res]}))
            else:
                R.note('%s 格 (%+.1f, %+.1f) 本來就站不住（canStand r0.3＝false；玩家走不到這一格，不算卡住）：最多推 %.2f m' % (tag, dx, dz, best))
    await place(pg, p0)
    dg1 = await pg.evaluate(CELLDIAG_JS)
    R.note('%s 結束：E.unstick 一共被叫 %s 次（%s）、walkFallbacks %s' % (tag, dg1['unstick'], J(dg1['unstickLog']), dg1['fb']))
    print('  [總結 6] 推不動（<0.05 m）的：%s' % (J(bad) if bad else '沒有（每一格每一輪都至少有一個方向推得動、而且沒有一個方向 <0.05 m）'), flush=True)


async def cancel_seen(pg, cdp, tag, new, inv):
    """5b：邀約被取消，玩家看得到什麼（觀察，不判對錯）"""
    ids = [i for i, x in inv.items() if x['exp']['state'] == 'cancelled']
    toasts = await pg.evaluate("(window.__ccToasts||[]).slice()")
    R.note('%s 【觀察】讀檔以後出現過的 toast：%s' % (tag, J(toasts)))
    R.note('%s 【觀察】讀檔以後點過的對話／選項：%s' % (tag, J(LAST_CONT_LOG[-12:])))
    ms = [m for m in (new.get('msgs') or []) if isinstance(m, dict) and (m.get('iv') in ids or '木曜日' in str(m.get('text', '')) or '慢讀' in str(m.get('text', '')))]
    R.note('%s 【觀察】G.msgs 裡和這一筆（%s）有關的訊息：%s' % (tag, J(ids), J(ms[-6:])))
    pages = {}
    for tab in ('msg', 'today'):
        pages[tab] = (await pe.phone(pg, cdp, tab)).strip()
        R.note('%s 【觀察】手機「%s」頁全文：%s' % (tag, {'msg': '訊息', 'today': '今天'}[tab], pages[tab][:600].replace('\n', '／')))
    await D.shot(pg, 'l118d_5b_cancel_phone', judge_black=False)
    await pe.close_phone(pg, cdp); await F.ready(pg, cdp, 10)
    alltxt = ' '.join(toasts + [str(x) for x in LAST_CONT_LOG] + [str(m.get('text', '')) for m in ms] + list(pages.values()))
    told = '取消' in alltxt or '作罷' in alltxt
    R.note('%s 【觀察】玩家有沒有被告知取消：%s；有沒有說要去哪裡約（木曜日）：%s' % (tag, '有' if told else '沒有看到', '有' if '木曜日' in alltxt else '沒有看到'))


async def no_moku_menu(pg, cdp, tag, who):
    """5b：【捷徑】刪掉 G.visited.wz_mokuyobi（沒去過木曜日）→ 手機約 → 念書…選單：截圖、列出選項全文"""
    v = await pg.evaluate("(()=>{ const V=GAME.G.visited||{}; const b=!!V.wz_mokuyobi; delete V.wz_mokuyobi; return b; })()")
    R.setup('%s【捷徑】刪掉 G.visited.wz_mokuyobi（原本 %s）＝沒去過木曜日的版本' % (tag, v))
    await pe.phone(pg, cdp, 'friends')
    if not await pe.tap_sel(pg, cdp, '#phoneBody [data-inv="%s"]' % who):
        R.check('%s 手機「朋友」有 %s 的「約」' % (tag, who), False, ''); await pe.close_phone(pg, cdp); return
    await pg.wait_for_timeout(1500)
    for _ in range(12):
        q = await L.state(pg)
        if q['choices']: break
        if q['dlg']: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(600)
    top = [x['t'] for x in await pe.opts(pg)]
    R.note('%s 約的第一層選項全文：%s' % (tag, J(top)))
    sub = None
    if await pe.choose(pg, cdp, '念書'):
        await pg.wait_for_timeout(800); sub = [x['t'] for x in await pe.opts(pg)]
        await D.shot(pg, 'l118d_5b_nomoku_study_menu', judge_black=False)
        R.note('%s 「念書」那一層的選項全文：%s' % (tag, J(sub)))
    else: R.note('%s 第一層沒有「念書」' % tag)
    seen = any('木曜日' in t for t in (sub or [])) or any('木曜日' in t for t in top)
    R.note('%s 【觀察】沒去過木曜日：約的選單%s木曜日' % (tag, '看得到' if seen else '看不到'))
    bad = [t for t in top + (sub or []) if any(n in t for n in OLD_NAMES) or 'undefined' in t]
    R.check('%s 約的選單沒有舊店名、undefined' % tag, not bad, J(bad))
    await F.finish_dialog(pg, cdp); await pe.close_phone(pg, cdp); await F.ready(pg, cdp, 10)


# ---------------------------------------------------------------- LOAD（改之後）
async def cont(pg, cdp, url, save):
    """重新整理 → 自動存檔放這一份 → 標題「繼續」（觸控）。照 cc_fn_migrate_probe.cont"""
    await pg.evaluate("(v=>{ try{ if(typeof GAME!=='undefined'&&GAME) GAME.titleIdle=true; }catch(e){} localStorage.setItem('fatiao3d_auto', v); })(%s)" % J(json.dumps(save, ensure_ascii=False)))
    await pg.goto(url)
    if not await L.wait_loaded(pg): return False
    await pg.wait_for_timeout(800)
    ok = await L.tap(pg, cdp, '#btnContinue')
    if not ok: ok = await pg.evaluate("(()=>{ const b=document.getElementById('btnContinue'); if(b&&b.offsetParent){ b.click(); return true; } return false; })()")
    for _ in range(40):
        await pg.wait_for_timeout(500)
        if await pg.evaluate("!!(GAME.G&&GAME.E&&GAME.E.player&&document.getElementById('titleScreen').classList.contains('hide'))"): break
    await pg.wait_for_timeout(5000); await L.close_panels(pg, cdp)
    log = []; await pe.settle(pg, cdp, log, 20)
    LAST_CONT_LOG[:] = log
    if log: R.note('讀進來以後先點完的對話／選項：%s' % J(log[-10:]))
    q, did = await F.ready(pg, cdp)
    R.note('讀進來以後等畫面可以玩：%s；做了 %s' % (J(q), J(did)))
    await pg.evaluate(F.TOAST_HOOK)
    return ok


def check_names(tag, dom, where):
    bad = sorted({n for n in OLD_NAMES if n in dom['text'] or n in dom['zn'] or any(n in t for t in dom['its'])})
    und = 'undefined' in dom['text'] or 'undefined' in dom['zn'] or any('undefined' in t for t in dom['its'])
    R.check('%s %s：畫面文字、互動按鈕、區域名稱沒有舊店名' % (tag, where), not bad, J({'old': bad, 'zone': dom['zn'], 'its': dom['its'][:12]}))
    R.check('%s %s：畫面文字、互動按鈕沒有 undefined' % (tag, where), not und, J({'zone': dom['zn'], 'its': [t for t in dom['its'] if 'undefined' in t][:5]}))


async def check_migr(tag, old, new, menus):
    E = expect_of(old, menus); Rn = _obj(new.get('l118')); Fn = _obj(new.get('flags')); Fo = _obj(old.get('flags'))
    Ro = _obj(old.get('l118'))
    R.note('%s 舊 G.l118＝%s；舊 mokuyobi.n＝%s；舊 ZHE_118_RANK＝%s' % (tag, J(Ro), _obj(old.get('mokuyobi')).get('n'), Fo.get('ZHE_118_RANK')))
    for f in ('n', 'd', 'last', 'w'):
        got = _obj(Rn.get(f))
        R.check('%s G.l118.%s 照規格搬（期望 %s）' % (tag, f, J(E[f])), got == E[f], '實際 %s' % J(got))
    if E['cleared']: R.note('%s 老樣子（last）對不到新菜單、應該被清掉的：%s' % (tag, J(E['cleared'])))
    for sid, item in E['cleared']:
        R.check('%s 老樣子「%s」（搬到 %s %s）對不到新菜單＝被清掉' % (tag, item, sid, NEW_NAME.get(sid, '')), _obj(Rn.get('last')).get(sid) != item, J(_obj(Rn.get('last'))))
    R.check('%s G.l118.once 照留' % tag, _obj(Rn.get('once')) == E['once'], J({'old': E['once'], 'new': _obj(Rn.get('once'))}))
    mk = _obj(new.get('mokuyobi')).get('n')
    R.check('%s 慢讀咖啡的次數併進木曜日 G.mokuyobi.n（期望 %s＝舊 %s＋慢讀 %s）' % (tag, E['mok_n'], _obj(old.get('mokuyobi')).get('n'), _obj(Ro.get('n')).get(GONE)), mk == E['mok_n'], '實際 %s' % mk)
    if E['mv'] is not None:
        R.check('%s G.l118.mv772＝2（搬過一次、不會再搬）' % tag, Rn.get('mv772') == 2, J(Rn.get('mv772')))
    R.check('%s ZHE_118_RANK（期望 %s）' % (tag, E['rank']), Fn.get('ZHE_118_RANK') == E['rank'], '實際 %s' % Fn.get('ZHE_118_RANK'))
    R.check('%s SIS_TEA_ORDER 保留（舊 %s）' % (tag, Fo.get('SIS_TEA_ORDER')), Fn.get('SIS_TEA_ORDER') == Fo.get('SIS_TEA_ORDER'), '新 %s' % Fn.get('SIS_TEA_ORDER'))


async def wd_of(pg, day):
    return await pg.evaluate("(d=>CALENDAR.dateOf(d).wd%%7)(%d)" % int(day))


async def check_invites(pg, tag, old, new):
    oi = {v.get('id'): v for v in (old.get('invites') or []) if isinstance(v, dict) and v.get('place') == 'slowread'}
    ni = {v.get('id'): v for v in (new.get('invites') or []) if isinstance(v, dict)}
    res = {}
    for i, v in oi.items():
        v = dict(v); v['_wd'] = await wd_of(pg, v.get('day') or 0); e = inv_expect(v); n = ni.get(i) or {}
        pend = v.get('state') in ('offered', 'changed', 'accepted', 'going')
        lab = n.get('label') or ''
        R.check('%s slowread 邀約 %s（舊：%s 第 %s 天 %s %s）→ 區域 %s、狀態 %s' % (tag, i, v.get('zone'), v.get('day'), v.get('h'), v.get('state'), e['zone'] or '（不看）', e['state']),
                (e['zone'] is None or n.get('zone') == e['zone']) and n.get('state') == e['state'], J({k: n.get(k) for k in ('zone', 'state', 'day', 'h', 'label')}))
        if pend: R.check('%s 邀約 %s 的標題沒有舊店名（%s）' % (tag, i, lab), not any(x in lab for x in OLD_NAMES), '')
        res[i] = {'old': v, 'new': n, 'exp': e}
    return res


async def meet_go(pg, cdp, tag, iv):
    """手機「今天」按前往 → 跟著演到見面結束（照 pt1107e meet_once）"""
    await pe.phone(pg, cdp, 'today')
    body = await pg.evaluate("(document.getElementById('phoneBody')||{}).innerText||''")
    R.note('%s 手機「今天」：%s' % (tag, body[:300].replace('\n', '／')))
    R.check('%s 手機「今天」沒有舊店名' % tag, not any(x in body for x in OLD_NAMES), '')
    if not R.check('%s 手機「今天」有那一筆的「前往」' % tag, await pe.tap_sel(pg, cdp, '#phoneBody [data-invgo="%s"]' % iv['id']), ''):
        await pe.close_phone(pg, cdp); return None
    said = []; reached = False; t0 = time.time(); st = None
    while time.time() - t0 < 300:
        q = await L.state(pg)
        if q['zone'] == 'wz_mokuyobi': reached = True
        if not q['dlg'] and not q['choices'] and await pg.evaluate("!document.getElementById('phone').classList.contains('hide')"):
            await pe.close_phone(pg, cdp); continue
        if q['dtext'] and (not said or said[-1] != q['dtext']): said.append(q['dtext'])
        st = await pg.evaluate("(id=>{ const v=(GAME.G.invites||[]).find(x=>String(x.id)===String(id)); return v?{st:v.state, ph:v.lead&&v.lead.ph, zone:v.zone}:null; })(%s)" % J(iv['id']))
        if st and st['st'] in ('done', 'met', 'over', 'cancelled', 'missed') and not q['dlg'] and not q['busy'] and not q['choices']: break
        if q['choices']:
            o = await pe.opts(pg); ts = [x['t'] for x in o]; said.append('選項：' + '｜'.join(ts))
            pick = next((x['t'] for x in o if not x['dim'] and not any(w in x['t'] for w in ('算了', '返回', '下次再說', '自己走過去'))), ts[0])
            await pe.choose(pg, cdp, pick, True); continue
        if st and (st['ph'] == 'wait' or (st['st'] == 'accepted' and not st['ph'])) and q['zone'] == 'wz_mokuyobi' and not q['busy']:
            n = await pg.evaluate("(w=>{ const n=GAME.E.npcs.find(q=>q.id===w||q.charId===w); return n?{x:n.obj.position.x,z:n.obj.position.z,lv:n.lv|0}:null; })(%s)" % J(iv['who']))
            if n: await L.go_to(pg, cdp, R, n['x'], n['z'], 1.8, '%s 走到她旁邊' % tag, lv=n['lv']); await pg.wait_for_timeout(1000); continue
        if q['dlg']: await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(500)
    R.note('%s 見面過程：%s' % (tag, J(said[-16:])))
    R.check('%s 按前往到了木曜日（wz_mokuyobi）' % tag, reached, J(await D.st(pg)))
    R.check('%s 見面演完（邀約 state＝done）' % tag, bool(st) and st['st'] == 'done', J(st))
    await D.shot(pg, 'l118d_%s_meet' % tag.strip('[]').replace(' ', '_'), judge_black=False)
    return st


async def load_one(pg, cdp, url, k, ent, save, menus, errs):
    tag = '[LOAD %s]' % k; m0 = ent['meta']; n0 = len(errs)
    R.note('%s 存檔（改之前）：%s' % (tag, J(m0)))
    ok = await cont(pg, cdp, url, save)
    P = PLAN.get(k) or {}
    exp_zone = P.get('expect') or m0['zone']
    if exp_zone != m0['zone']:   # 讀進來在沒開的店裡＝XSCLOSE 走出去（每 0.5 秒看一次）
        await D.wait_zone(pg, cdp, exp_zone, 40); await pg.wait_for_timeout(2500); await F.ready(pg, cdp, 15)
    r = await pg.evaluate(SAVE_NOW_JS)
    new = r['s']; os.makedirs(SAVEDIR, exist_ok=True)
    json.dump(new, open(os.path.join(OUT, 'saves', 'after_%s.json' % k), 'w', encoding='utf-8'), ensure_ascii=False)
    R.check('%s 讀進來以後再存一次存得起來（%s）' % (tag, r['how']), r['ok'], '')
    write_diff(k, save, new)
    s = await D.st(pg)
    R.note('%s 讀進來（改之後）：區域 %s (%s, %s) lv %s、第 %s 天 %s、按鈕「%s」' % (tag, s['zone'], s['x'], s['z'], s['lv'], new.get('day'), s['hour'], s['interact']))
    R.check('%s 標題「繼續」讀得進來、同一天（%s）' % (tag, m0['day']), ok and new.get('day') == m0['day'], J({'ok': ok, 'day': new.get('day')}))
    why = '' if exp_zone == m0['zone'] else '（存檔在 %s；新店這時候沒開＝走出去到店門口）' % m0['zone']
    R.check('%s 區域是 %s%s' % (tag, exp_zone, why), s['zone'] == exp_zone, J({'zone': s['zone']}))
    if exp_zone == 'lane118' and P.get('shop'):
        ox, oz = OLD_SHOP[P['shop']]['out']
        R.check('%s 站在 %s 店門口（離 spawn_out (%.1f, %.1f) %.2f m ≤1.5）' % (tag, NEW_NAME[P['shop']], ox, oz, math.hypot(s['x'] - ox, s['z'] - oz)), math.hypot(s['x'] - ox, s['z'] - oz) <= 1.5, J([s['x'], s['z']]))
    R.check('%s 站的格子可走（canStand r0.3；(%s, %s) lv %s）' % (tag, s['x'], s['z'], s['lv']), bool(s['stand']), J(s))
    await D.shot(pg, 'l118d_%s_loaded' % k, judge_black=False)
    await check_migr(tag, save, new, menus)
    inv = await check_invites(pg, tag, save, new)
    dom = await pg.evaluate(DOM_JS); check_names(tag, dom, '讀進來的畫面')
    near = await pg.evaluate(NEAR_IT_JS)
    R.note('%s 附近的互動：%s' % (tag, J(near)))
    if k == '1a':
        R.check('%s 店門口的按鈕換成新店名（進辛亥韓食…；舊版存的時候是「%s」）' % (tag, m0.get('btn')), s['interact'].startswith('進' + NEW_NAME['tea']) or s['interact'].startswith(NEW_NAME['tea']), J(s['interact']))
    if k == '1b':
        da = next((x for x in near if x['shop'] == 'drink_a'), None)
        if da and da['d'] <= da['r']:
            R.check('%s 站在喝不喝咖啡的範圍裡，按鈕是它' % tag, s['interact'].startswith(NEW_NAME['drink_a']), J({'btn': s['interact'], 'it': da}))
        else: R.note('%s 不在喝不喝咖啡的按鈕範圍（%s）：只看站得住、推得動' % (tag, J(da)))
    if k in ('2a', '3a'):
        sid = P['shop']; it = await pg.evaluate("(%s)(%s)" % (ORDERIT_JS, J(sid)))
        R.check('%s 店裡點餐的按鈕是新店名（%s）' % (tag, it and it['label']), bool(it) and NEW_NAME[sid] in it['label'], J(it))
    dgl = await pg.evaluate(CELLDIAG_JS)
    R.note('%s 讀進來的那一格：E.unstick 被叫 %s 次 %s、walkFallbacks %s、canStand %s' % (tag, dgl['unstick'], J(dgl['unstickLog']), dgl['fb'], J(dgl['canStand'])))
    if k == '6':
        await case6(pg, cdp, tag, s)
        ne = errs_since(errs, n0)
        R.check('%s 沒有 JS 例外' % tag, not ne, J(ne[:3])); return
    await F.ready(pg, cdp, 15)
    if k in ('2b', '3b'):
        s2 = await D.st(pg)
        res = await push8(pg, cdp, '%s 被送到店門口 (%s, %s) 以後' % (tag, s2['x'], s2['z']), shot='l118d_%s_door_stuck' % k)
        best = max(x['mv'] for x in res)
        R.check('%s 店門口八方向至少一個推得動 ≥0.3 m（最多 %.2f）' % (tag, best), best >= 0.3, J([[x['dir'], x['mv']] for x in res]))
    mv = await D.pushable(pg, cdp)
    if mv < 0.3:   # 分清楚是卡牆還是遊戲沒在收搖桿（暫停、劇情、面板）：印狀態、再等一下推一次
        q = await L.state(pg); ov = await pg.evaluate(OVERLAY_JS)
        R.note('%s 推不動時的狀態：%s；開著的面板／對話：%s；附近的人：%s' % (tag, J(q), J(ov), J(await pg.evaluate(NPC_NEAR_JS))))
        await D.shot(pg, 'l118d_%s_nopush' % k, judge_black=False)
        await F.ready(pg, cdp, 20); mv2 = await D.pushable(pg, cdp)
        R.note('%s 等畫面可以玩以後再推一次：%.2f m' % (tag, mv2)); mv = max(mv, mv2)
    R.check('%s 搖桿推得動 %.2f m（≥0.3，人不卡牆）' % (tag, mv), mv >= 0.3, '')
    if k == '5a':
        e = next((x for x in inv.values() if x['exp']['state'] != 'cancelled' and x['old'].get('state') in ('accepted', 'offered', 'changed')), None)
        if R.check('%s 有改去木曜日的那一筆' % tag, bool(e), J(list(inv.values()))):
            iv = e['new']
            r2 = await pg.evaluate("(%s)(%s)" % (SETDAY_JS, J([iv['day'], float(iv['h']) - 0.17])))
            R.setup('%s【捷徑】撥到約好的前 10 分鐘（G.day、G.weekday、G.hour 直接改）：%s' % (tag, J(r2)))
            await pg.wait_for_timeout(1500); await F.ready(pg, cdp, 15)
            await meet_go(pg, cdp, tag, iv)
    if k == '5b':
        e = next((x for x in inv.values() if x['exp']['state'] == 'cancelled'), None)
        if R.check('%s 有被取消的那一筆' % tag, bool(e), J(list(inv.values()))):
            await cancel_seen(pg, cdp, tag, new, inv)
            vis = (new.get('visited') or {}).get('wz_mokuyobi')
            R.note('%s 這份存檔去過木曜日（G.visited.wz_mokuyobi＝%s；新版約念書的木曜日要自己去過一次才列）' % (tag, vis))
            iv = await invite_slowread(pg, cdp, tag + ' 再約', INV_WHO, '木曜日', ['今天 15:30', '明天 15:30', '今天 19:00', '明天 19:00'])
            dom2 = await pg.evaluate(DOM_JS); check_names(tag, dom2, '再約以後的畫面')
            R.check('%s 取消以後可以再約木曜日（新的一筆 place slowread、zone wz_mokuyobi、state accepted／offered／changed）' % tag,
                    bool(iv) and iv['zone'] == 'wz_mokuyobi' and iv['state'] in ('accepted', 'offered', 'changed'), J(iv))
            await no_moku_menu(pg, cdp, tag + ' 沒去過木曜日', INV_WHO)
    ne = errs_since(errs, n0)
    R.check('%s 沒有 JS 例外' % tag, not ne, J(ne[:3]))


async def calendar_ok(pg):
    for k in (DAY_A, DAY_B):
        d = await pg.evaluate("(%s)(%s)" % (DAYOF_JS, J(k))); c = await pg.evaluate("(%s)(%d)" % (CALCHK_JS, d))
        R.note('[日子] %s＝第 %s 天：%s' % (k, d, J(c)))
        R.check('[日子] %s 是學期中的上課日（不是假日、颱風天、考試週）' % k, c['kind'] == 'term' and not c['hol'] and not c['typhoon'] and not c['exam'] and c['wd'] not in (0, 6), J(c))


async def main():
    global SRC_DIR
    sha = os.environ.get('SHA', '')[:9]
    print('CC L118D_C（118 巷九間店改版：舊存檔相容）：MODE %s；CASES %s；SHA %s；A %s、B %s；約 %s；Playwright ≠ iPhone' % (MODE, ','.join(CASES), sha, DAY_A, DAY_B, INV_WHO), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        idx = {}
        if MODE in ('make', 'both'):
            await pg.goto(URL_OLD)
            if not R.check('改之前的版本載入', await L.wait_loaded(pg), ''): await b.close(); return
            ver = await pg.evaluate("(document.body.innerText.match(/版本 v[0-9.]+/)||[''])[0]"); R.note('[MAKE] 改之前的版本：%s' % ver)
            await calendar_ok(pg)
            ip = os.path.join(SAVEDIR, 'index.json')
            if os.path.exists(ip): idx = json.load(open(ip, encoding='utf-8'))
            for c in CASES:
                print('== case %s（改之前：做存檔）' % c, flush=True); n0 = len(errs)
                try: await make_case(pg, cdp, c, idx, errs)
                except Exception as e:
                    R.check('[MAKE %s] 沒有中斷' % c, False, repr(e)[:300]); await D.shot(pg, 'l118d_make_exc_%s' % c, judge_black=False)
                ne = errs_since(errs, n0)
                R.check('[MAKE %s] 改之前的版本沒有 JS 例外' % c, not ne, J(ne[:3]))
                os.makedirs(SAVEDIR, exist_ok=True)
                json.dump(idx, open(ip, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
            R.note('[MAKE] 存檔 %s 寫在 %s' % (J(sorted(idx)), SAVEDIR))
        if MODE in ('load', 'both'):
            if MODE == 'load':
                sf = os.environ.get('SAVES_FROM') or ''
                SRC_DIR = sf if os.path.exists(os.path.join(sf, 'index.json')) else os.path.join(sf, 'saves')
                if not R.check('SAVES_FROM 有 index.json（%s）' % SRC_DIR, os.path.exists(os.path.join(SRC_DIR, 'index.json')), ''): await b.close(); return
                idx = json.load(open(os.path.join(SRC_DIR, 'index.json'), encoding='utf-8'))
            else:
                SRC_DIR = SAVEDIR; await pg.close(); pg = await ctx.new_page(); cdp = await ctx.new_cdp_session(pg); errs.clear(); pg.on('pageerror', lambda e: errs.append(str(e)))
            await pg.add_init_script(INIT_JS)   # E.unstick 計數、toast 紀錄（每次重新整理都會掛）
            await pg.goto(URL_NEW)
            if not R.check('改之後的版本載入', await L.wait_loaded(pg), ''): await b.close(); return
            menus = await pg.evaluate(NEWSHOPS_JS) or {}
            R.note('[LOAD] 這個版本的 118 巷店家：%s' % J({k: v['name'] for k, v in menus.items()}))
            for c in CASES:
                print('== case %s（改之後：讀進來）' % c, flush=True)
                subs = [k for k in SUBS.get(c, [c]) if k in idx]
                if not R.check('[LOAD %s] 有改之前做好的存檔（%s）' % (c, J(subs)), bool(subs), J(sorted(idx))): continue
                for k in subs:
                    try: await load_one(pg, cdp, URL_NEW, k, idx[k], json.load(open(os.path.join(SRC_DIR, 'save_%s.json' % k), encoding='utf-8')), menus, errs)
                    except Exception as e:
                        R.check('[LOAD %s] 沒有中斷' % k, False, repr(e)[:300]); await D.shot(pg, 'l118d_exc_%s' % k, judge_black=False)
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
