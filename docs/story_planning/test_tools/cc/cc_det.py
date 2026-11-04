"""CC-C（帳號 C）11-04：探針共用的「固定住會變的東西」（BB_257 T0；CC_50 第 10、38 條）。
  用法（探針裡）：
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))   # 和探針同一個資料夾
    import cc_det
    await cc_det.install(pg)                        # goto 之前：CC_SEED 有值就把 Math.random 換成固定種子的版本
    await pg.evaluate(cc_det.HIDE_PEOPLE_JS)       # 藏玩家、NPC、路人、騎車的路人（回傳藏了幾個）
    await pg.evaluate(cc_det.SHOW_PEOPLE_JS)       # 量完要放回來的時候
    await pg.evaluate('window.__ccSeed(%d)' % n)   # 某一段之前重設種子
  藏人物為什麼要這樣寫（11-04 T0 試點抓到的探針 bug）：
    - engine3d.js 每一幀做畫面外剔除，照 `!n.hidden && 距離 && 在畫面裡` 把 obj.visible 設回來 → 只設 visible=false 下一幀就又出現，要設 n.hidden；
    - 騎腳踏車的路人（bike3d.js:223 B.rider 的 update）自己照距離 LOD 設 visible，不看 hidden → 把 update 包一層，跑完再藏；
    - extras 裡的遠景樹系統（townkit3d.js treeFieldExtra，有 trees 欄位）不是人，不藏。
  page.clock（Playwright 固定時鐘）不放在這裡，要用的探針自己裝（cc_baseline_probe.py 的 CLOCK）。
  11-04 雲端試點（322cd967，溫州街＋公館 16 個鏡頭，同一個 SHA 跑兩輪）：
    - 固定種子＋HIDE_PEOPLE_JS＋停主迴圈手動畫一幀＋page.clock：16 張的逐像素差最大 23（地面的細小雜訊），超過 30 的像素 0；draw call、三角形兩輪完全相同。
    - 沒有 page.clock 的組合，在騎士修正之後還沒比過，所以還不知道 page.clock 本身有沒有幫助。"""
import os

SEED_ENV = 'CC_SEED'


def seed_init_js(seed):
    """mulberry32；window.__ccSeed(n) 重設種子"""
    return """(()=>{ let s=%d>>>0; const f=function(){ s=(s+0x6D2B79F5)>>>0; let t=s; t=Math.imul(t^(t>>>15),t|1); t^=t+Math.imul(t^(t>>>7),t|61); return ((t^(t>>>14))>>>0)/4294967296; };
  Math.random=f; window.__ccSeed=n=>{ s=n>>>0; return true; }; window.__ccSeeded=%d; })();""" % (int(seed), int(seed))


def seed():
    v = os.environ.get(SEED_ENV)
    return int(v) if v not in (None, '') else None


async def install(pg, value=None):
    """goto 之前呼叫。value 沒給就看環境變數 CC_SEED；都沒有就什麼都不做（回傳 None）"""
    v = value if value is not None else seed()
    if v is None: return None
    await pg.add_init_script(seed_init_js(v))
    print('  [前置／捷徑] CC_SEED=%d：遊戲載入前把 Math.random 換成固定種子的版本（BB_257 T0）' % v, flush=True)
    return v


HIDE_PEOPLE_JS = """(()=>{ const E=GAME.E; let n=0; if(E.player&&E.player.obj) E.player.obj.visible=false;
  for(const q of (E.npcs||[])) if(q&&q.obj&&!q.hidden){ q.hidden=true; q.__ccHid=true; q.obj.visible=false; n++; }
  for(const x of (E.extras||[])) if(x&&x.obj&&!x.trees&&x.name!=='treeFieldExtra'&&!x.hidden){ x.hidden=true; x.__ccHid=true; x.obj.visible=false;
    if(x.update&&!x.update.__ccHide){ const u=x.update; x.update=function(dt){ const r=u.apply(this,arguments); if(this.hidden&&this.obj) this.obj.visible=false; return r; }; x.update.__ccHide=true; }
    n++; }
  return n; })()"""

# 只放回 HIDE_PEOPLE_JS 藏的（遊戲自己 hidden 的人不動）
SHOW_PEOPLE_JS = """(()=>{ const E=GAME.E; let n=0; if(E.player&&E.player.obj) E.player.obj.visible=true;
  for(const q of [].concat(E.npcs||[], E.extras||[])) if(q&&q.__ccHid){ q.hidden=false; q.__ccHid=false; n++; }
  return n; })()"""
