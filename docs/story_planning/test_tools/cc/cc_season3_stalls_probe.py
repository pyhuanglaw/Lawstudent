"""CC-C 11-12：SEASON3-LINES-1111 季節攤販六攤＋季節落地布置五項 瀏覽器驗收（BB-C ⑧ 判準；判定歸 BB）。Playwright 手機橫向觸控（PC GPU／SwiftShader）≠ iPhone。
BB-C 判準：「六個季節攤販在對的日期出現、看得到、買得到（錢扣對、物品進包包），不在日期內不出現；五項季節布置看得到；每攤日夜各一張截圖給我記意見，只擋 D141 五項。」
受測：LAWWW 5fd3a61e96（SEASON3-LINES-1111：src/season_stalls3d.js SS3、src/night_market3d.js NM3.serve、src/data/season_stalls.js）以後的正式 SHA（例 1cd2116ee1）；
  對照：修改前 42a854dee9（D34：沒有 season_stalls3d.js＝沒有攤販、布置的互動點；模型 SD3 已經有）。
期望值的來源（不寫死台詞、價錢、座標、日期）：
  字（名字、品名、價錢、look、greet、buy、closed、looks、looksFruit）＝企劃稿 AA_793 @e2ea0ea3c docs/story_planning/AA_793_season3_stalls.json（git show 讀；讀不到改比頁面上的 SEASON_STALLS，log 寫明）。
  哪一攤在哪一區、客人站的位置 at、哪一組 code、日期規則、鐘點 hours、看的位置＝遊戲資料 src/data/season_deco.js（頁面上的 SEASON_DECO）；日子用 SD3.on 照規則找，md 規則 Python 另外對一次月日。
  選單「品名　價錢 元」＋「算了」、今天第一次才念 look、買了時間過 5 分鐘＝src/night_market3d.js NM3.menu／NM3.serve（tests/season3_lines_1112_unit.js 第 4 項）。
  包包：遊戲的包包只有送禮系統 GIFTH（G.flags.GIFTH.bag，src/gifthol3d.js）；季節攤販走 NM3.serve＝不放進包包（unit 第 9 項「只有錢和時間變」、AA_793 format 同 AA_752 夜市）。
    BB 判準寫「物品進包包」和遊戲設計不一樣 → 預設記成「對照／觀察」（包包前後幾樣），BAG_STRICT=1 才當檢查；交 BB 判。
PARTS（預設全部）：
  BUY     每一攤：【前置／捷徑】讀檔到窗口裡的一天（第 30 天以後第一段窗口的中間那天起，依序試 3 天；第一個月開學劇情多，不用）、開攤的白天鐘點、客人站的位置
          → 【前置／捷徑】錢設 2000、放到 4～7 m 外站得住、有路的起點 → 點地 6 秒一段走過去（途中有對話／選單／busy 就停下來記）→ 互動鍵＝「看＋稿的 name」、最上面就是它 → 按
          → 對話照點、選單照字選第一樣「品名　價錢 元」 → 判：念的句子＝稿的 look 全部＋一句稿裡的 greet（noVendor 沒有）＋那一樣的 buy（照順序）；選單＝稿的全部品項＋「算了」；
          錢少了稿的價錢（HUD 也一樣）；模型節點 SEASON_<code>_on 顯示、在截圖鏡頭裡；白天截圖（只記錄）；walkFallbacks 沒加、沒有 JS 例外、推得動 ≥0.3 m。
  NIGHT   每一攤一張晚上的截圖（只記錄）：收攤 ≥21 點＝窗口那一天收攤前 1 小時讀檔；18 點收的（愛玉、畢業花束：6～8 月 18 點天還亮）＝17:45 讀檔（攤子在），
          【前置／捷徑】GAME.advance 到 19:55（玩家待著沒走看到的樣子）再拍，然後按一次＝稿的 closed 一句、沒有選單、錢不動。
  OUT     每一攤窗口外的一天（窗口結束後第 3 天起第一個不擺的日子，同一個鐘點）：讀檔到客人站的位置 → 沒有那一攤的互動點、互動鍵不是它、模型節點沒顯示；截圖（只記錄）。
  LOOK    五項布置有的那一天（sea_fruit 用 FRUITWINTER：稿有兩句水果，驗得最多；其他用 season_deco.js 列的第一組）→ 走到「看」的範圍裡（照遊戲最近互動點的規則挑站得住的點，只用來挑，判的是畫面上的互動鍵）
          → 按 → 念的＝稿 looks 那一句（sea_fruit 再照 rule 名字裡的水果念 looksFruit）；節點顯示；截圖（只記錄）；推得動。
  LOOKOUT 五項布置窗口外那一天：沒有那一項的「看」、節點沒顯示。
CC_02 清單 2026-11-12：1✓ 2✓ 3✓ 4✓ 5✓ 6✓ 7✓ 8✓ 9✓ 10✓ 11✓ 12✓ 13✓
用法：LW_TESTS=<wt>/tests SHA=<sha> TAG=new|old [PARTS=BUY,NIGHT,OUT,LOOK,LOOKOUT] [STALLS=sea_yam,sea_aiyu,...] [LOOKS=sea_fruit,...] [BAG_STRICT=0] python3 cc_season3_stalls_probe.py <url> <out>"""
import os, sys, json, asyncio, time, math, subprocess
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL0, OUT = sys.argv[1], sys.argv[2]
URL = URL0 if 'tapguard' in URL0 else URL0 + ('&' if '?' in URL0 else '?') + 'tapguard'   # CC_02 乙 4：點對話框的探針加 ?tapguard（和手機一樣擋選單剛出來那一下）
os.makedirs(OUT, exist_ok=True)
TAG = os.environ.get('TAG') or 'x'
SHA = os.environ.get('SHA') or ''
ALL_PARTS = ['BUY', 'NIGHT', 'OUT', 'LOOK', 'LOOKOUT']
PARTS = [p.strip().upper() for p in (os.environ.get('PARTS') or ','.join(ALL_PARTS)).split(',') if p.strip()]
STALLS = [s.strip() for s in (os.environ.get('STALLS') or '').split(',') if s.strip()]
LOOKS = [s.strip() for s in (os.environ.get('LOOKS') or '').split(',') if s.strip()]
BAG_STRICT = os.environ.get('BAG_STRICT') == '1'
R = L.Run('season3_' + TAG, OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
AA_SHA, AA_PATH = 'e2ea0ea3c', 'docs/story_planning/AA_793_season3_stalls.json'
MIN_DAY = 30            # 第一個月（2025-09-16 起）開學劇情多：窗口從第 30 天以後找（CC_02 乙 3）
MONEY = 2000            # 【前置／捷徑】錢：比最貴的一樣（稿：廣式月餅禮盒 560）多
LOOK_CODE = {'sea_fruit': 'FRUITWINTER'}   # 冬天那一組稿有兩句水果（椪柑、草莓）：驗得最多；其他項用 season_deco.js 列的第一組
PUSH_MIN = 0.3          # 推得動門檻＝cc_d141_lib.pushable 的 0.3 m（D141「卡住」）
SEG_S = 6               # go_to 一段 6 秒（CC_02 乙 13）
WALK_S = 300            # 走一攤最多 300 秒真實時間（雲端 SwiftShader 1～4 fps）

ST = D.ST
SAY_HOOK = r"""(()=>{ window.__ccSay=[]; window.__ccMenus=[]; if(GAME.__ccSayW) return 1;
  const f=GAME.say, c=GAME.choose; GAME.say=function(who,text){ try{ window.__ccSay.push({w:who&&who.name?String(who.name):null,t:String(text)}); }catch(e){} return f.apply(this,arguments); };
  GAME.choose=function(opts){ try{ window.__ccMenus.push((opts||[]).map(o=>o&&o.t!=null?String(o.t):String(o))); }catch(e){} return c.apply(this,arguments); };
  GAME.__ccSayW=1; return 1; })()"""   # 只記遊戲說了什麼、出了什麼選單（SS3／NM3 呼叫的是 GAME.say／GAME.choose），不改結果
GIVE_MONEY = "(m=>{ GAME.G.money=m; if(GAME.money) GAME.money(0); return GAME.G.money; })"
BAG_N = "(()=>{ const f=GAME.G.flags||{}, g=f.GIFTH; return g&&Array.isArray(g.bag)?g.bag.length:0; })()"
HUD_MONEY = "(()=>{ const e=document.getElementById('money'); return e?(e.textContent||'').trim():null; })()"
DATA_JS = r"""(()=>{ const D=typeof SEASON_DECO!=='undefined'?SEASON_DECO:null; if(!D) return null; const out={stalls:[],looks:{},rules:D.rules};
  for(const zid of Object.keys(D.zones)){ const Z=D.zones[zid]; for(const q of (Z.stalls||[])) out.stalls.push(Object.assign({zone:zid},q));
    const Lk=Z.looks||{}; for(const c of Object.keys(Lk)) for(const q of Lk[c]) (out.looks[q.id]=out.looks[q.id]||[]).push(Object.assign({zone:zid,code:c},q)); }
  out.page=typeof SEASON_STALLS!=='undefined'?{src:SEASON_STALLS.src,stalls:SEASON_STALLS.stalls,looks:SEASON_STALLS.looks,looksFruit:SEASON_STALLS.looksFruit}:null;
  out.ss3=typeof SS3!=='undefined'; out.sd3=typeof SD3!=='undefined'; return out; })()"""
DAYS_JS = r"""(a=>{ if(typeof SD3==='undefined') return {err:'沒有 SD3'}; const on=d=>SD3.on(a.code,d,{hour:a.h,weather:'clear'}); const runs=[]; let cur=null;
  for(let d=0; d<=1800; d++){ let x=null; try{ x=CALENDAR.dateOf(d); }catch(e){} if(!x) break; if(on(d)){ if(!cur){ cur=[d,d]; runs.push(cur); } else cur[1]=d; } else cur=null; }
  const r=runs.find(r=>r[0]>=a.min); if(!r) return {err:'第 '+a.min+' 天以後沒有窗口', runs:runs.slice(0,4)};
  const mid=Math.floor((r[0]+r[1])/2), cand=[mid,mid+1,mid-1,mid+2,mid-2].filter(d=>d>=r[0]&&d<=r[1]&&on(d)).slice(0,3);
  let out=null; for(let d=r[1]+3; d<=r[1]+40; d++) if(!on(d)){ out=d; break; }
  const key=d=>{ const x=CALENDAR.dateOf(d); return {d, key:x.key, m:x.m, dd:x.d, wd:x.wd}; };
  return {run:[key(r[0]),key(r[1])], cand:cand.map(key), out:out==null?null:key(out)}; })"""
NODE_JS = r"""(a=>{ const E=GAME.E, z=E.zone, root=z&&z.seasonRoot; if(!root) return {root:false, codes:z&&z.seasonCodes||null}; let node=null;
  root.traverse(o=>{ if(o.name==='SEASON_'+a.code+'_on') node=o; }); if(!node) return {root:true,node:false,codes:z.seasonCodes||null};
  let v=true; for(let o=node;o;o=o.parent) if(!o.visible){ v=false; break; } let meshes=0; node.traverse(o=>{ if(o.isMesh) meshes++; });
  const box=new THREE.Box3().setFromObject(node); let inView=null; if(a.cam){ const cam=E.camera; cam.updateMatrixWorld(); const M=new THREE.Matrix4().multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse); inView=!box.isEmpty()&&new THREE.Frustum().setFromProjectionMatrix(M).intersectsBox(box); }
  return {root:true,node:true,visible:v,meshes,inView,codes:z.seasonCodes||null,box:box.isEmpty()?null:[box.min.x,box.max.x,box.min.z,box.max.z].map(n=>+n.toFixed(2))}; })"""
ITS_JS = r"""(a=>{ const E=GAME.E; return E.interactables.filter(i=>!i.hidden&&(a.kind==='stall'?(i.seasonStall===a.key||(a.label&&i.label===a.label)):(i.seasonLook===a.key||(a.label&&i.label===a.label&&Math.hypot(i.x-a.x,i.z-a.z)<2))))
  .map(i=>({label:i.label,x:+i.x.toFixed(2),z:+i.z.toFixed(2),r:i.radius||null,stall:i.seasonStall||null,look:i.seasonLook||null,fn:typeof i.onInteract==='function'})); })"""
NEARBY_JS = r"""(a=>GAME.E.interactables.filter(i=>!i.hidden&&Math.hypot(i.x-a.x,i.z-a.z)<a.r).map(i=>({label:i.label||'',x:+i.x.toFixed(2),z:+i.z.toFixed(2),r:i.radius||1.8,prio:i.prio||0})))"""
# 互動範圍裡挑站得住的點：照 engine3d.js nearestInteractable 的規則（d<radius||1.8、d−prio 最小；同層、不藏）找「最近的就是它」的格子；只用來挑走到哪裡，判的是畫面上的互動鍵
SPOT_JS = r"""(a=>{ const E=GAME.E, its=E.interactables.filter(i=>!i.hidden&&!(E.levels&&i.lv!==undefined&&(i.lv|0)!==0));
  const me=its.find(i=>a.kind==='stall'?i.seasonStall===a.key:(i.seasonLook===a.key)); if(!me) return {err:'沒有那個互動點'};
  const R=me.radius||1.8, cand=[]; let tried=0, stand=0;
  for(let x=me.x-R; x<=me.x+R+1e-6; x+=0.1) for(let z=me.z-R; z<=me.z+R+1e-6; z+=0.1){ const d=Math.hypot(x-me.x,z-me.z); if(d>R-0.15) continue; tried++; if(!E.canStand(x,z,0.3,0)) continue; stand++;
    let best=null, bd=1e9, sec=1e9; for(const it of its){ if(it.seat&&it.seat.taken) continue; const dd=Math.hypot(it.x-x,it.z-z); if(dd<(it.radius||1.8)){ const s=dd-(it.prio||0); if(s<bd){ sec=bd; bd=s; best=it; } else if(s<sec) sec=s; } }
    if(best!==me) continue; cand.push({x:+x.toFixed(2),z:+z.toFixed(2),d:+d.toFixed(2),margin:+Math.min(9,sec-bd).toFixed(2)}); }
  cand.sort((p,q)=>((q.margin>=0.3)-(p.margin>=0.3))||(p.d-q.d));
  return {me:{x:me.x,z:me.z,r:R,label:me.label}, tried, stand, n:cand.length, best:cand[0]||null}; })"""
# 起點：離站位 4～7 m、站得住、pathTo 有路而且不繞（≤ 直線 1.8 倍）、不在任何季節互動點範圍裡；先試「往外」（攤子 → 客人那一面）的方向
START_JS = r"""(a=>{ const E=GAME.E, out=[], why={stand:0,path:0,detour:0,inR:0}; const base=Math.atan2(a.ox,a.oz);
  for(const dist of [5,6,4,7]) for(let k=0;k<24;k++){ const ang=base+(k%2?1:-1)*Math.ceil(k/2)*Math.PI/12, x=a.x+Math.sin(ang)*dist, z=a.z+Math.cos(ang)*dist;
    if(!E.canStand(x,z,0.3,0)){ why.stand++; continue; } if(E.interactables.some(i=>(i.seasonStall||i.seasonLook)&&Math.hypot(i.x-x,i.z-z)<(i.radius||1)+0.5)){ why.inR++; continue; }
    const p=E.pathTo(x,z,0,a.x,a.z,0); if(!p||!p.length){ why.path++; continue; } let L=0, px=x, pz=z; for(const q of p){ L+=Math.hypot(q[0]-px,q[1]-pz); px=q[0]; pz=q[1]; }
    if(L>dist*1.8||Math.hypot(px-a.x,pz-a.z)>0.6){ why.detour++; continue; } out.push({x:+x.toFixed(2),z:+z.toFixed(2),dist,ang:+(ang*180/Math.PI).toFixed(0),pathLen:+L.toFixed(2)}); if(out.length>=3) return {starts:out,why}; }
  return {starts:out,why}; })"""
PLACE_JS = "(a=>{ const P=GAME.E.player; P.path=null; P.onArrive=null; P.obj.position.x=a[0]; P.obj.position.z=a[1]; P.lv=0; return true; })"   # 同 cc_us_nav_traps_probe.py【前置／捷徑】
TOP_JS = r"""(s=>{ const e=document.querySelector(s); if(!e) return {ok:false,why:'沒有 '+s}; const r=e.getBoundingClientRect(); if(!r.width||!r.height) return {ok:false,why:'看不到'};
  const t=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2); return {ok:!!t&&(t===e||e.contains(t)), top:t?(t.id||t.className||t.tagName):null, txt:(e.textContent||'').trim().slice(0,30)}; })"""
CHOICE_AT = r"""(txt=>{ const bs=[...document.querySelectorAll('#choices button')].filter(b=>b.offsetParent!==null); const i=bs.findIndex(b=>(b.innerText||'').trim()===txt); if(i<0) return null;
  const b=bs[i]; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(), cx=r.left+r.width/2, cy=r.top+r.height/2, t=document.elementFromPoint(cx,cy);
  return {i, c:[cx,cy], top:!!t&&(t===b||b.contains(t)), dim:b.classList.contains('dim')||b.disabled}; })"""
FADE_ON = "(()=>{ const f=document.getElementById('fade'); return !!f&&f.classList.contains('on'); })()"
PROBE_STATE = r"""(()=>{ const E=GAME.E, z=E.zone; return {zone:GAME.G.zone, day:GAME.G.day, hour:+(+GAME.G.hour).toFixed(3), money:GAME.G.money, fb:GAME.walkFallbacks||0,
  seasonCodes:z&&z.seasonCodes||null, seasonStalls:z&&z.seasonStalls?z.seasonStalls.map(q=>q.key):null, seasonLooks:z&&z.seasonLooks?z.seasonLooks.map(q=>q.id):null, root:!!(z&&z.seasonRoot),
  dtext:((document.getElementById('dlgText')||{}).textContent||'').slice(0,60)}; })()"""


def load_aa793():
    """企劃稿 AA_793 @e2ea0ea3c（CC_02 乙 7：讀不到就回 None，之後改比頁面上的 SEASON_STALLS）"""
    for cwd in (HERE, os.getcwd()):
        try:
            out = subprocess.run(['git', '-C', cwd, 'show', '%s:%s' % (AA_SHA, AA_PATH)], capture_output=True, text=True, timeout=30)   # gpu_wrap-ok（不開瀏覽器）
            if out.returncode == 0 and out.stdout.strip(): return json.loads(out.stdout)
        except Exception:
            pass
    return None


def md_ok(rule, key):
    """md／mds 規則（月-日，含頭尾；跨年）Python 自己對一次：這一天在不在窗口（lunar、termWeek 只能照 SD3.on，log 寫明）"""
    rs = rule.get('mds') or ([rule['md']] if rule.get('md') else None)
    if not rs: return None
    k = key[5:]
    return any((a <= k <= b) if a <= b else (k >= a or k <= b) for a, b in rs)


def eye_for(q):
    """截圖鏡頭：從攤子腳印中心往客人那一面退 4.5 m、高 2.0 m，看腳印中心 0.9 m 高（機位在玩家會站的那一側，CC_02 乙 9）"""
    f = q.get('foot') or [q['at']['x'] - 0.5, q['at']['x'] + 0.5, q['at']['z'] - 0.5, q['at']['z'] + 0.5]
    cx, cz = (f[0] + f[1]) / 2, (f[2] + f[3]) / 2; ax, az = q['at']['x'], q['at']['z']
    dx, dz = ax - cx, az - cz; m = math.hypot(dx, dz) or 1
    return {'eye': [round(cx + dx / m * 4.5, 2), 2.0, round(cz + dz / m * 4.5, 2)], 'look': [cx, 0.9, cz], 'lens': 24}, (dx / m, dz / m)


async def snap(pg, name, cam, code):
    """只記錄的截圖：1280×720、藏玩家和 HUD（CC_02 乙 9）、等淡入結束；拍之前用那個鏡頭量模型節點在不在畫面裡；拍完放回 844×390"""
    for _ in range(40):
        if not await pg.evaluate(FADE_ON): break
        await pg.wait_for_timeout(500)
    await pg.set_viewport_size({'width': 1280, 'height': 720}); await pg.wait_for_timeout(800)
    await pg.evaluate("(()=>{ GAME.E.player.obj.visible=false; })()"); await pg.evaluate(D.HUD + '(false)')
    c = await pg.evaluate(D.CAM, cam); await pg.wait_for_timeout(700); await pg.evaluate("GAME.E.render()")
    nd = await pg.evaluate(NODE_JS, {'code': code, 'cam': True}) if code else None
    m = await D.shot(pg, name)
    await pg.evaluate(D.UNCAM); await pg.evaluate(D.HUD + '(true)'); await pg.evaluate("(()=>{ GAME.E.player.obj.visible=true; })()")
    await pg.set_viewport_size({'width': 844, 'height': 390}); await pg.wait_for_timeout(800)
    R.note('[截圖] %s.png（只記錄、不判；鏡頭 %s → %s；亮度 %s；節點 %s）' % (name, c.get('eye'), c.get('look'), J(m), J(nd)))
    return nd


async def drain(pg, cdp, tag, max_s=40):
    """讀檔以後、開始以前：有插進來的對話先點完；有選單＝記下來、照字選「算了／起身／先起床」，沒有就選第一個（CC_02 乙 10、13）。回傳處理了什麼"""
    t0 = time.time(); did = []
    while time.time() - t0 < max_s:
        s = await D.st(pg)
        if s['choices']:
            pick = next((c for c in s['choices'] if c.startswith(('算了', '起身', '先起床', '站起'))), s['choices'][0])
            did.append('選單 %s → %s' % (J(s['choices']), pick)); a = await pg.evaluate(CHOICE_AT, pick)
            if a: await pg.wait_for_timeout(600); await L.touch_tap(cdp, a['c'][0], a['c'][1])
            await pg.wait_for_timeout(1000); continue
        if s['dlg']: did.append('對話 ' + (await pg.evaluate(PROBE_STATE))['dtext'][:30]); await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700); continue
        if not s['busy']: break
        await pg.wait_for_timeout(500)
    if did: R.note('%s 開始以前先處理插進來的：%s' % (tag, J(did[:8])))
    return did


async def wait_root(pg, code, max_s=60):
    """模型是進區域以後才載入（SD3.attach → ASSETS.loadOne）：等到有 seasonRoot（上限 max_s 秒，CC_02 乙 6）"""
    t0 = time.time(); nd = None
    while time.time() - t0 < max_s:
        nd = await pg.evaluate(NODE_JS, {'code': code, 'cam': False})
        if nd.get('root'): return nd
        await pg.wait_for_timeout(1000)
    return nd


async def walk_to_button(pg, cdp, tag, tx, tz, label):
    """點地 6 秒一段走到 (tx,tz)；每段之前看對話／選單／busy（有就停下來記，不盲點）；互動鍵出現 label＝到了（CC_02 乙 5、13）。回傳 (到了, 原因, 狀態)"""
    t0 = time.time(); segs = 0
    stop = lambda q: q['interact'].startswith(label) or q['dlg'] or bool(q['choices']) or q['busy']
    while time.time() - t0 < WALK_S:
        s = await D.st(pg)
        if s['dlg'] or s['choices'] or s['busy']:
            R.note('%s 走路途中畫面有東西：%s → 停下來' % (tag, J({'dlg': s['dlg'], 'choices': s['choices'], 'busy': s['busy'], 'dtext': (await pg.evaluate(PROBE_STATE))['dtext']})))
            return False, '途中出現對話／選單／busy', s
        if s['interact'].startswith(label):
            s2 = await D.settle(pg)
            if s2['interact'].startswith(label): return True, '互動鍵是「%s」（%d 段、%.0f 秒）' % (label, segs, time.time() - t0), s2
            s = s2
        segs += 1
        await L.go_to(pg, cdp, R, tx, tz, 0.25, tag, max_s=SEG_S, stop=stop)
    s = await D.st(pg)
    return False, '%d 秒沒看到互動鍵「%s」' % (WALK_S, label), s


async def walk_diag(pg, tag, tx, tz):
    """走不到的時候：pathTo、canStand、附近的互動點、截圖（CC_02 乙 5）"""
    dg = await pg.evaluate("""(a=>{ const E=GAME.E, o=E.player.obj.position; const p=E.pathTo(o.x,o.z,0,a.x,a.z,0); return {at:[+o.x.toFixed(2),+o.z.toFixed(2)], standHere:E.canStand(o.x,o.z,0.3,0), standTarget:E.canStand(a.x,a.z,0.3,0), path:p?p.slice(0,8).map(q=>[+q[0].toFixed(2),+q[1].toFixed(2)]):null}; })""", {'x': tx, 'z': tz})
    nb = await pg.evaluate(NEARBY_JS, {'x': tx, 'z': tz, 'r': 3.0})
    R.note('%s 【診斷】%s；目標附近 3 m 的互動點 %s' % (tag, J(dg), J(nb)))
    await D.shot(pg, 'season3_%s_walkdiag_%s' % (TAG, tag.strip('[]').split()[0]), judge_black=False)


async def tap_interact(pg, cdp, tag, label):
    top = await pg.evaluate(TOP_JS, '#interact')
    if not R.check('%s 按之前：最上面就是互動鍵「%s」（elementFromPoint）' % (tag, label), top.get('ok') and top.get('txt', '').startswith(label), J(top)): return False
    await L.tap(pg, cdp, '#interact'); return True


async def play_out(pg, cdp, tag, want_opt, max_s=150):
    """按了以後：對話照點、選單照字選 want_opt（None＝不該有選單；有就選「算了」）；等到沒有對話、選單、busy 1.5 秒。回傳 {'menus':[看到的選單], 'picked':..., 'timeout':bool}"""
    t0 = time.time(); menus = []; picked = None; idle = None; last_prog = time.time(); last_key = None
    while time.time() - t0 < max_s:
        s = await D.st(pg)
        key = (s['dlg'], tuple(s['choices']), (await pg.evaluate(PROBE_STATE))['dtext'])
        if key != last_key: last_key = key; last_prog = time.time()
        if time.time() - last_prog > 30:
            R.note('%s 30 秒沒有進展：%s' % (tag, J(s))); await D.shot(pg, 'season3_%s_idle_%d' % (TAG, int(time.time())), judge_black=False); last_prog = time.time()
        if s['choices']:
            idle = None; menus.append(s['choices']); await pg.wait_for_timeout(700)   # tapguard：選單剛出來那一下不收
            want = want_opt if (want_opt and want_opt in s['choices']) else next((c for c in s['choices'] if c.startswith('算了')), None)
            if want is None: R.note('%s 選單沒有「%s」也沒有「算了」：%s' % (tag, want_opt, J(s['choices']))); return {'menus': menus, 'picked': None, 'timeout': False}
            a = await pg.evaluate(CHOICE_AT, want)
            if not a: R.note('%s 找不到選項按鈕「%s」' % (tag, want)); await pg.wait_for_timeout(500); continue
            if not a['top']: R.note('%s 選項「%s」被蓋住（elementFromPoint 不是它）' % (tag, want))
            picked = want; await L.touch_tap(cdp, a['c'][0], a['c'][1]); await pg.wait_for_timeout(1200); continue
        if s['dlg']:
            idle = None; await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700); continue
        if s['busy']: idle = None; await pg.wait_for_timeout(500); continue
        if idle is None: idle = time.time()
        if time.time() - idle >= 1.5: return {'menus': menus, 'picked': picked, 'timeout': False}
        await pg.wait_for_timeout(300)
    return {'menus': menus, 'picked': picked, 'timeout': True}


class Ctx:
    data = None; aa = None; src = ''


def stall_text(key):
    """攤子的字：稿（AA_793）優先，讀不到用頁面的 SEASON_STALLS"""
    if Ctx.aa: return (Ctx.aa.get('stalls') or {}).get(key)
    pg_ = (Ctx.data or {}).get('page') or {}
    return (pg_.get('stalls') or {}).get(key)


def look_text():
    if Ctx.aa: return Ctx.aa.get('looks') or {}, Ctx.aa.get('looksFruit') or {}
    pg_ = (Ctx.data or {}).get('page') or {}
    return pg_.get('looks') or {}, pg_.get('looksFruit') or {}


async def pick_days(pg, code, h, tag):
    dd = await pg.evaluate(DAYS_JS, {'code': code, 'h': h, 'min': MIN_DAY})
    rule = (Ctx.data.get('rules') or {}).get(code) or {}
    if dd.get('err'): R.check('%s 找得到窗口（%s %s）' % (tag, code, J(rule)), False, J(dd)); return None
    chk = [md_ok(rule, c['key']) for c in dd['cand']] + [md_ok(rule, dd['out']['key']) if dd.get('out') else None]
    R.note('%s 規則 %s：第一段 ≥第 %d 天的窗口 %s～%s；候選 %s；窗口外 %s；md 規則 Python 對：%s' % (tag, J({k: rule.get(k) for k in ('md', 'mds', 'lunar', 'from', 'to', 'termWeek', 'hours') if rule.get(k) is not None}), MIN_DAY, dd['run'][0]['key'], dd['run'][1]['key'], [c['key'] for c in dd['cand']], (dd.get('out') or {}).get('key'), chk if any(x is not None for x in chk) else '（不是 md 規則，照 SD3.on）'))
    if any(x is False for x in chk[:-1]) or chk[-1] is True: R.check('%s 候選日和 md 規則一致（Python 自己對）' % tag, False, J(chk)); return None
    return dd


async def load_at(pg, cdp, tag, zone, key, h, x, z, why):
    s = await D.load_zone(pg, cdp, zone, key, h, x=x, z=z, yaw=0.0, wait=8000)
    await pg.evaluate(SAY_HOOK)
    R.setup('%s 【前置／捷徑】讀檔到 %s %s %05.2f (%.2f, %.2f)；天氣 clear、關條件事件、關手機自動打開（%s）' % (tag, zone, key, h, x, z, why))
    return s


async def stall_buy(pg, cdp, q, errs):
    key = q['key']; st_ = stall_text(key); tag = '[BUY %s]' % key
    if not R.check('%s 稿上有這一攤（%s）' % (tag, Ctx.src), bool(st_), ''): return None
    label = '看' + st_['name']; op = st_.get('open') or {}
    rule = (Ctx.data['rules'] or {}).get(q['code']) or {}; hrs = rule.get('hours') or [op.get('from'), op.get('to')]
    h = max(hrs[0] + 1.0, 14.0); h = 16.0 if h > hrs[1] - 3 else h   # 白天、離收攤 ≥3 小時（CC_02 乙 6）；烤地瓜 15～22 → 16:00（12 月 17 點就日落）
    dd = await pick_days(pg, q['code'], h, tag)
    if not dd: return None
    item = st_['items'][0]; opt = '%s　%d 元' % (item['name'], item['price'])
    exp_menu = ['%s　%d 元' % (it['name'], it['price']) for it in st_['items']] + ['算了']
    used = None
    for c in dd['cand']:   # CC_02 乙 3：依序試，跳過的記原因
        s = await load_at(pg, cdp, tag, q['zone'], c['key'], h, q['at']['x'], q['at']['z'], '窗口裡、開攤的白天；客人站的位置')
        did = await drain(pg, cdp, tag)
        s = await D.st(pg)
        if s['zone'] != q['zone']: R.note('%s %s 讀檔沒到 %s（%s）：換下一天' % (tag, c['key'], q['zone'], s['zone'])); continue
        if s['dlg'] or s['choices'] or s['busy']: R.note('%s %s 處理完插進來的還有 %s：換下一天' % (tag, c['key'], J(did))); continue
        used = c; break
    if not R.check('%s 讀檔到窗口裡的一天（試 %s）' % (tag, [c['key'] for c in dd['cand']]), bool(used), ''): return None
    e0 = len(errs); nd = await wait_root(pg, q['code'])
    ps = await pg.evaluate(PROBE_STATE); its = await pg.evaluate(ITS_JS, {'kind': 'stall', 'key': key, 'label': label})
    R.note('%s %s %05.2f：zone 狀態 %s；這一攤的互動點 %s；模型 %s' % (tag, used['key'], h, J(ps), J(its), J(nd)))
    R.check('%s %s（窗口裡）有這一攤的互動點「%s」、在客人站的位置 1 m 內' % (tag, used['key'], label), len(its) == 1 and its[0]['label'] == label and math.hypot(its[0]['x'] - q['at']['x'], its[0]['z'] - q['at']['z']) <= 1.0, J(its))
    R.check('%s 模型節點 SEASON_%s_on 顯示、有網格' % (tag, q['code']), bool(nd and nd.get('node') and nd.get('visible') and nd.get('meshes')), J(nd))
    if not its: return None
    sp = await pg.evaluate(SPOT_JS, {'kind': 'stall', 'key': key})
    if not R.check('%s 互動範圍裡有站得住、最近的就是它的點' % tag, bool(sp.get('best')), J(sp)): return None
    cam, out_dir = eye_for(q)
    sts = await pg.evaluate(START_JS, {'x': sp['best']['x'], 'z': sp['best']['z'], 'ox': out_dir[0], 'oz': out_dir[1]})
    if not R.check('%s 4～7 m 外有站得住、有路的起點' % tag, bool(sts.get('starts')), J(sts)): return None
    st0 = sts['starts'][0]
    await pg.evaluate(PLACE_JS, [st0['x'], st0['z']]); await pg.wait_for_timeout(1500)
    R.setup('%s 【前置／捷徑】放到起點 %s（站位 %s、離 %s m、路長 %s m）' % (tag, J([st0['x'], st0['z']]), J(sp['best']), st0['dist'], st0['pathLen']))
    m0 = await pg.evaluate(GIVE_MONEY, MONEY); R.setup('%s 【前置／捷徑】錢設 %d' % (tag, m0))
    fb0 = (await D.st(pg))['fb']; bag0 = await pg.evaluate(BAG_N)
    ok, why, s = await walk_to_button(pg, cdp, tag, sp['best']['x'], sp['best']['z'], label)
    R.note('%s 走的路：起點 %s → 點地 6 秒一段走向站位 %s：%s；停在 %s' % (tag, J([st0['x'], st0['z']]), J([sp['best']['x'], sp['best']['z']]), why, J({k: s.get(k) for k in ('x', 'z', 'interact', 'stand')})))
    if not R.check('%s 走得到：互動鍵出現「%s」（D141 走不到）' % (tag, label), ok, J(s)):
        await walk_diag(pg, tag, sp['best']['x'], sp['best']['z']); return None
    await pg.evaluate("(()=>{ window.__ccSay=[]; window.__ccMenus=[]; })()")
    t_hour0 = (await pg.evaluate(PROBE_STATE))['hour']; m1 = (await pg.evaluate(PROBE_STATE))['money']
    if not await tap_interact(pg, cdp, tag, label): return None
    res = await play_out(pg, cdp, tag, opt)
    said = await pg.evaluate("window.__ccSay||[]"); menus = await pg.evaluate("window.__ccMenus||[]"); ps2 = await pg.evaluate(PROBE_STATE)
    R.note('%s 按了以後念的 %s；選單 %s；選了 %s' % (tag, J(said), J(menus), J(res.get('picked'))))
    look, greet, buy = st_.get('look') or [], st_.get('greet') or [], item.get('buy') or []
    texts = [x['t'] for x in said]; n_l, n_g = len(look), (1 if greet else 0)
    R.check('%s 按完不是逾時、選到「%s」' % (tag, opt), not res['timeout'] and res.get('picked') == opt, J(res))
    R.check('%s 選單＝稿的全部品項「品名　價錢 元」＋「算了」' % tag, bool(menus) and menus[0] == exp_menu, J({'got': menus[:1], 'want': exp_menu}))
    R.check('%s 今天第一次：先念稿的 look（%d 句）' % (tag, n_l), texts[:n_l] == look, J(texts[:n_l]))
    if greet: R.check('%s 攤販一句稿裡的 greet（說話的人有名字）' % tag, len(said) > n_l and said[n_l]['t'] in greet and bool(said[n_l]['w']), J(said[n_l:n_l + 1]))
    else: R.check('%s 稿上沒有 greet（noVendor）：look 以後直接出選單、不說話' % tag, len(texts) == n_l + len(buy), J(texts))
    R.check('%s 買了：念那一樣的 buy（%d 句，照順序）、念完就結束' % (tag, len(buy)), texts[n_l + n_g:] == buy, J(texts[n_l + n_g:]))
    hud = await pg.evaluate(HUD_MONEY); digits = ''.join(ch for ch in (hud or '') if ch.isdigit())
    R.check('%s 錢扣對：%s → %s（稿的價錢 %d）；HUD 顯示 %s' % (tag, m1, ps2['money'], item['price'], hud), ps2['money'] == m1 - item['price'] and digits == str(ps2['money']), J({'before': m1, 'after': ps2['money'], 'hud': hud}))
    R.note('%s 時間 %.3f → %.3f（NM3.HRS：買一樣過 5 分鐘＝0.083；走路途中也在走，只記錄）' % (tag, t_hour0, ps2['hour']))
    bag1 = await pg.evaluate(BAG_N)
    if BAG_STRICT: R.check('%s 物品進包包（BB 判準；BAG_STRICT=1）：GIFTH 包包 %d → %d' % (tag, bag0, bag1), bag1 == bag0 + 1, '')
    else: R.note('%s 【對照／觀察，不判】物品進包包：GIFTH 包包 %d → %d 樣。遊戲設計：季節攤販走 NM3.serve，買的東西不放進包包（unit 第 9 項「只有錢和時間變」）；BB 判準寫「物品進包包」→ 交 BB 判' % (tag, bag0, bag1))
    nd2 = await snap(pg, 'season3_%s_%s_day' % (TAG, key), cam, q['code'])
    R.check('%s 看得到：白天截圖的鏡頭裡有模型節點 SEASON_%s_on（顯示中）' % (tag, q['code']), bool(nd2 and nd2.get('visible') and nd2.get('inView')), J(nd2))
    fb1 = (await D.st(pg))['fb']; mv = await D.pushable(pg, cdp)
    R.check('%s walkFallbacks 沒加（%d → %d）' % (tag, fb0, fb1), fb1 == fb0, '')
    R.check('%s 買完推得動 ≥%.1f m（D141 卡住）' % (tag, PUSH_MIN), mv >= PUSH_MIN, J(mv))
    R.check('%s 沒有 JS 例外' % tag, len(errs) == e0, J(errs[e0:e0 + 3]))
    return dd


async def stall_night(pg, cdp, q, errs, dd):
    key = q['key']; st_ = stall_text(key) or {}; tag = '[NIGHT %s]' % key
    rule = (Ctx.data['rules'] or {}).get(q['code']) or {}; hrs = rule.get('hours') or [10, 21]
    linger = hrs[1] < 21
    h = (hrs[1] - 0.25) if linger else (hrs[1] - 1.0)
    if not dd: dd = await pick_days(pg, q['code'], h, tag)
    if not dd: return
    c = dd['cand'][0]; e0 = len(errs)
    await load_at(pg, cdp, tag, q['zone'], c['key'], h, q['at']['x'], q['at']['z'], '窗口裡，' + ('18 點收攤：收攤前 15 分鐘（攤子在）' if linger else '收攤前 1 小時（天黑）'))
    await drain(pg, cdp, tag); nd = await wait_root(pg, q['code'])
    if linger:
        adv = round(19.92 - h, 3)
        await pg.evaluate("(h=>{ GAME.advance(h); return GAME.G.hour; })", adv)
        R.setup('%s 【前置／捷徑】GAME.advance(%.2f)：%05.2f → 19:55（玩家待著沒走：攤子是進區域那一刻決定的，還在）' % (tag, adv, h))
        await pg.wait_for_timeout(2500)
    cam, _ = eye_for(q)
    lh = await pg.evaluate("(()=>({hour:+(+GAME.G.hour).toFixed(2), lightH:GAME.E.lightH!=null?+(+GAME.E.lightH).toFixed(2):null, lamps:!!GAME.E.lampsOn}))()")
    R.note('%s 晚上：%s；模型 %s' % (tag, J(lh), J(nd)))
    await snap(pg, 'season3_%s_%s_night' % (TAG, key), cam, q['code'])
    if linger and st_.get('closed'):
        label = '看' + st_['name']; s = await D.st(pg)
        if not s['interact'].startswith(label):
            sp = await pg.evaluate(SPOT_JS, {'kind': 'stall', 'key': key})
            if sp.get('best'): ok, why, s = await walk_to_button(pg, cdp, tag, sp['best']['x'], sp['best']['z'], label); R.note('%s 走到站位：%s' % (tag, why))
        if R.check('%s 19:55 還在攤子前：互動鍵「%s」' % (tag, label), s['interact'].startswith(label), J(s)):
            m1 = (await pg.evaluate(PROBE_STATE))['money']; await pg.evaluate("(()=>{ window.__ccSay=[]; window.__ccMenus=[]; })()")
            if await tap_interact(pg, cdp, tag, label):
                res = await play_out(pg, cdp, tag, None, max_s=60)
                said = [x['t'] for x in await pg.evaluate("window.__ccSay||[]")]; m2 = (await pg.evaluate(PROBE_STATE))['money']
                R.check('%s 收攤以後按＝稿的 closed 一句、沒有選單、錢不動' % tag, said == [st_['closed']] and not res['menus'] and m2 == m1, J({'said': said, 'menus': res['menus'], 'money': [m1, m2]}))
    mv = await D.pushable(pg, cdp)
    R.check('%s 推得動 ≥%.1f m、沒有 JS 例外' % (tag, PUSH_MIN), mv >= PUSH_MIN and len(errs) == e0, J({'moved': mv, 'errs': errs[e0:e0 + 3]}))


async def stall_out(pg, cdp, q, errs, dd):
    key = q['key']; st_ = stall_text(key) or {}; tag = '[OUT %s]' % key; label = '看' + (st_.get('name') or '?')
    rule = (Ctx.data['rules'] or {}).get(q['code']) or {}; hrs = rule.get('hours') or [10, 21]
    h = max(hrs[0] + 1.0, 14.0); h = 16.0 if h > hrs[1] - 3 else h
    if not dd: dd = await pick_days(pg, q['code'], h, tag)
    if not dd or not dd.get('out'): R.check('%s 找得到窗口外的一天' % tag, False, J(dd)); return
    o = dd['out']; e0 = len(errs)
    await load_at(pg, cdp, tag, q['zone'], o['key'], h, q['at']['x'], q['at']['z'], '窗口外（%s 結束後第一個不擺的日子）、同一個鐘點；客人站的位置' % dd['run'][1]['key'])
    await drain(pg, cdp, tag); await pg.wait_for_timeout(4000)
    nd = await pg.evaluate(NODE_JS, {'code': q['code'], 'cam': False}); its = await pg.evaluate(ITS_JS, {'kind': 'stall', 'key': key, 'label': label})
    s = await D.settle(pg); ps = await pg.evaluate(PROBE_STATE)
    R.note('%s %s：zone 狀態 %s；站在 %s 互動鍵「%s」' % (tag, o['key'], J(ps), J([s['x'], s['z']]), s['interact']))
    R.check('%s %s（窗口外）沒有這一攤的互動點' % (tag, o['key']), not its, J(its))
    R.check('%s 站在客人的位置，互動鍵不是「%s」' % (tag, label), not s['interact'].startswith(label), J(s['interact']))
    R.check('%s 模型節點 SEASON_%s_on 沒顯示（沒載入或藏著）' % (tag, q['code']), not (nd.get('node') and nd.get('visible')), J(nd))
    cam, _ = eye_for(q)
    await snap(pg, 'season3_%s_%s_out' % (TAG, key), cam, q['code'])
    R.check('%s 沒有 JS 例外' % tag, len(errs) == e0, J(errs[e0:e0 + 3]))


def look_expect(lid, code):
    looks, fruit = look_text(); first = looks.get(lid)
    if not first: return None, '稿 looks 沒有 %s' % lid
    out = [first]
    if lid == 'sea_fruit':   # 今天那一組是哪幾種水果：season_deco.js rule 名字「…：椪柑、草莓」（遊戲資料）→ 稿 looksFruit 裡寫那種水果的那一句（照名字的順序）
        nm = ((Ctx.data['rules'] or {}).get(code) or {}).get('name') or ''; names = [x.strip() for x in nm.split('：')[-1].split('、') if x.strip()]
        for n in names:
            hit = [t for t in fruit.values() if ('木箱裡是' + n) in t]
            if len(hit) != 1: return None, '水果「%s」在 looksFruit 找到 %d 句' % (n, len(hit))
            out.append(hit[0])
    return out, ''


async def look_one(pg, cdp, lid, errs, parts):
    rows = (Ctx.data.get('looks') or {}).get(lid) or []
    code = LOOK_CODE.get(lid) or (rows[0]['code'] if rows else None)
    q = next((r for r in rows if r['code'] == code), None); tag = '[LOOK %s]' % lid
    if not R.check('%s season_deco.js 有這一項（%s）' % (tag, code), bool(q), J([r.get('code') for r in rows])): return
    rule = (Ctx.data['rules'] or {}).get(code) or {}; hrs = rule.get('hours')
    h = (hrs[0] + 2.0) if hrs else 14.0   # 中秋烤肉架 17～23：19:00
    dd = await pick_days(pg, code, h, tag)
    if not dd: return
    exp, why = look_expect(lid, code)
    if not R.check('%s 稿上有字（%s）' % (tag, Ctx.src), bool(exp), why): return
    if 'LOOK' in parts:
        used = None
        for c in dd['cand']:
            s = await load_at(pg, cdp, tag, q['zone'], c['key'], h, q['x'], q['z'] + 1.5, '有這一項的日子；看的位置旁邊')
            await drain(pg, cdp, tag); s = await D.st(pg)
            if s['zone'] != q['zone'] or s['dlg'] or s['choices'] or s['busy']: R.note('%s %s 不能用（%s）：換下一天' % (tag, c['key'], J(s))); continue
            used = c; break
        if R.check('%s 讀檔到有這一項的一天（試 %s）' % (tag, [c['key'] for c in dd['cand']]), bool(used), ''):
            e0 = len(errs); nd = await wait_root(pg, code); its = await pg.evaluate(ITS_JS, {'kind': 'look', 'key': lid, 'label': q['label'], 'x': q['x'], 'z': q['z']})
            R.note('%s %s：%s；互動點 %s；模型 %s' % (tag, used['key'], J(await pg.evaluate(PROBE_STATE)), J(its), J(nd)))
            R.check('%s 有「%s」的互動點（在 season_deco.js 的位置）' % (tag, q['label']), len(its) == 1 and its[0]['label'] == q['label'] and its[0]['x'] == q['x'] and its[0]['z'] == q['z'], J(its))
            R.check('%s 模型節點 SEASON_%s_on 顯示、有網格' % (tag, code), bool(nd and nd.get('node') and nd.get('visible') and nd.get('meshes')), J(nd))
            sp = await pg.evaluate(SPOT_JS, {'kind': 'look', 'key': lid}) if its else {'err': '沒有互動點'}
            if R.check('%s 看的範圍裡有站得住、最近的就是它的點' % tag, bool(sp.get('best')), J(sp)):
                dx, dz = sp['best']['x'] - q['x'], sp['best']['z'] - q['z']; m = math.hypot(dx, dz) or 1
                sts = await pg.evaluate(START_JS, {'x': sp['best']['x'], 'z': sp['best']['z'], 'ox': dx / m, 'oz': dz / m})
                if R.check('%s 4～7 m 外有站得住、有路的起點' % tag, bool(sts.get('starts')), J(sts)):
                    st0 = sts['starts'][0]; await pg.evaluate(PLACE_JS, [st0['x'], st0['z']]); await pg.wait_for_timeout(1500)
                    R.setup('%s 【前置／捷徑】放到起點 %s（站位 %s）' % (tag, J([st0['x'], st0['z']]), J(sp['best'])))
                    fb0 = (await D.st(pg))['fb']
                    ok, why2, s = await walk_to_button(pg, cdp, tag, sp['best']['x'], sp['best']['z'], q['label'])
                    R.note('%s 走的路：起點 %s → 點地 6 秒一段走向站位 %s：%s' % (tag, J([st0['x'], st0['z']]), J([sp['best']['x'], sp['best']['z']]), why2))
                    if R.check('%s 走得到：互動鍵出現「%s」（D141 走不到）' % (tag, q['label']), ok, J(s)):
                        await pg.evaluate("(()=>{ window.__ccSay=[]; window.__ccMenus=[]; })()"); m1 = (await pg.evaluate(PROBE_STATE))['money']
                        if await tap_interact(pg, cdp, tag, q['label']):
                            res = await play_out(pg, cdp, tag, None, max_s=60)
                            said = await pg.evaluate("window.__ccSay||[]"); m2 = (await pg.evaluate(PROBE_STATE))['money']
                            R.note('%s 念的 %s' % (tag, J(said)))
                            R.check('%s 按了念稿的 %d 句（旁白、沒有名字），文字不是空的；沒有選單、錢不動' % (tag, len(exp)), [x['t'] for x in said] == exp and all(not x['w'] for x in said) and all(x['t'].strip() for x in said) and not res['menus'] and m1 == m2 and not res['timeout'], J({'said': said, 'want': exp, 'menus': res['menus']}))
                    else: await walk_diag(pg, tag, sp['best']['x'], sp['best']['z'])
                    fb1 = (await D.st(pg))['fb']; mv = await D.pushable(pg, cdp)
                    R.check('%s walkFallbacks 沒加（%d → %d）、推得動 ≥%.1f m' % (tag, fb0, fb1, PUSH_MIN), fb1 == fb0 and mv >= PUSH_MIN, J(mv))
            cam = {'eye': [q['x'], 2.2, q['z'] + 4.0], 'look': [q['x'], 1.0, q['z']], 'lens': 24}   # 沒有站位時的備用：+z 那一側 4 m
            if sp.get('best'):   # 從看的位置往玩家站的那一側退 4 m（CC_02 乙 9）
                dx, dz = sp['best']['x'] - q['x'], sp['best']['z'] - q['z']; m = math.hypot(dx, dz) or 1
                cam = {'eye': [round(q['x'] + dx / m * 4.0, 2), 2.2, round(q['z'] + dz / m * 4.0, 2)], 'look': [q['x'], 1.0, q['z']], 'lens': 24}
            await snap(pg, 'season3_%s_look_%s' % (TAG, lid), cam, code)
            R.check('%s 沒有 JS 例外' % tag, len(errs) == e0, J(errs[e0:e0 + 3]))
    if 'LOOKOUT' in parts:
        o = dd.get('out')
        if not R.check('%s 找得到窗口外的一天' % tag, bool(o), J(dd)): return
        e0 = len(errs)
        await load_at(pg, cdp, tag + '[窗口外]', q['zone'], o['key'], h, q['x'], q['z'] + 1.5, '窗口外（%s 結束後第一個沒有的日子）' % dd['run'][1]['key'])
        await drain(pg, cdp, tag); await pg.wait_for_timeout(4000)
        its = await pg.evaluate(ITS_JS, {'kind': 'look', 'key': lid, 'label': q['label'], 'x': q['x'], 'z': q['z']}); nd = await pg.evaluate(NODE_JS, {'code': code, 'cam': False})
        R.note('%s 窗口外 %s：%s' % (tag, o['key'], J(await pg.evaluate(PROBE_STATE))))
        R.check('%s %s（窗口外）沒有「%s」' % (tag, o['key'], q['label']), not its, J(its))
        R.check('%s %s（窗口外）模型節點 SEASON_%s_on 沒顯示' % (tag, o['key'], code), not (nd.get('node') and nd.get('visible')), J(nd))
        R.check('%s 窗口外 沒有 JS 例外' % tag, len(errs) == e0, J(errs[e0:e0 + 3]))


async def main():
    print('CC SEASON3-LINES-1111：TAG %s；SHA %s；PARTS %s；STALLS %s；LOOKS %s；BAG_STRICT %s；網址 %s；Playwright ≠ iPhone' % (TAG, SHA or '?', ','.join(PARTS), ','.join(STALLS) or '全部', ','.join(LOOKS) or '全部', BAG_STRICT, URL), flush=True)
    R.setup('網址加 ?tapguard（CC_02 乙 4：和手機一樣擋選單剛出來那一下的點擊）')
    Ctx.aa = load_aa793()
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); sys.exit(1)
        await pg.evaluate("localStorage.clear()")
        Ctx.data = await pg.evaluate(DATA_JS)
        if not R.check('頁面上有 SEASON_DECO（攤子位置、日期規則）', bool(Ctx.data), ''): await b.close(); sys.exit(1)
        page = Ctx.data.get('page')
        if Ctx.aa:
            Ctx.src = 'AA_793 @%s' % AA_SHA
            if page:
                diff = [k for k in Ctx.aa.get('stalls', {}) if J({f: Ctx.aa['stalls'][k].get(f) for f in ('name', 'items', 'look', 'greet', 'closed')}) != J({f: (page['stalls'].get(k) or {}).get(f) for f in ('name', 'items', 'look', 'greet', 'closed')})]
                R.note('稿 AA_793 和頁面 SEASON_STALLS（%s）不一樣的攤：%s（tests/season3_lines_1112_unit.js 第 2 項逐字比）' % (page.get('src'), J(diff) if diff else '沒有'))
        else:
            Ctx.src = '頁面 SEASON_STALLS（讀不到稿 AA_793 @%s，改比頁面）' % AA_SHA; R.note('讀不到稿 %s:%s：改比頁面上的 SEASON_STALLS（%s）' % (AA_SHA, AA_PATH, bool(page)))
        R.note('頁面：SS3 %s、SD3 %s；season_deco.js 的攤 %s；看的位置 %s' % (Ctx.data.get('ss3'), Ctx.data.get('sd3'), [q['key'] for q in Ctx.data['stalls']], J({k: [r['code'] for r in v] for k, v in Ctx.data['looks'].items()})))
        sts = [q for q in Ctx.data['stalls'] if not STALLS or q['key'] in STALLS]
        aa_keys = sorted((Ctx.aa or page or {}).get('stalls', {}).keys())
        R.check('稿的六攤一對一對到 season_deco.js 擺好的攤（key）', sorted(q['key'] for q in Ctx.data['stalls']) == aa_keys and len(aa_keys) == 6, J({'deco': [q['key'] for q in Ctx.data['stalls']], 'aa': aa_keys}))
        await pg.evaluate(SAY_HOOK)
        for q in sts:
            dd = None
            if 'BUY' in PARTS:
                try: dd = await stall_buy(pg, cdp, q, errs)
                except Exception as e: R.check('[BUY %s] 沒有中斷' % q['key'], False, repr(e)[:300])
            if 'NIGHT' in PARTS:
                try: await stall_night(pg, cdp, q, errs, dd)
                except Exception as e: R.check('[NIGHT %s] 沒有中斷' % q['key'], False, repr(e)[:300])
            if 'OUT' in PARTS:
                try: await stall_out(pg, cdp, q, errs, dd)
                except Exception as e: R.check('[OUT %s] 沒有中斷' % q['key'], False, repr(e)[:300])
        if 'LOOK' in PARTS or 'LOOKOUT' in PARTS:
            looks, _ = look_text()
            lids = [k for k in looks if not LOOKS or k in LOOKS]
            R.check('稿的五項布置都對到 season_deco.js 看的位置（id）', all(k in (Ctx.data.get('looks') or {}) for k in looks) and len(looks) == 5, J({'aa': list(looks), 'deco': list((Ctx.data.get('looks') or {}).keys())}))
            for lid in lids:
                try: await look_one(pg, cdp, lid, errs, PARTS)
                except Exception as e: R.check('[LOOK %s] 沒有中斷' % lid, False, repr(e)[:300])
        R.check('全程沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
