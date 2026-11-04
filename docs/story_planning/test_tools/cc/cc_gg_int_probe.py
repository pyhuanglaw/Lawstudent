"""CC（帳號 A）11-04：GG_int——公館三間新室內（LAWWW 3159276dd／eb6d1c7b6：日和便利店 v2、青木茶室 aoki、頁間書屋 v2）＋溫州街日和的單車（cb1d84290）。測 cb1d84290。
  真實玩家流程（不用 ?turbo、不瞬移、不改劇情狀態）；只有前置讀檔，標【前置／捷徑】。每一段都卡住檢查、逐句印對話（transcript）、截圖。CASES 可以單獨跑：cvs,aoki,yejian,wzbike,art
  cvs（日和 v2）
    C1 【前置／捷徑】公館店門前 (−29.4, 15)、23:30 → 走到店門口「進入便利商店」→ 進店：窗景不是 cvs_wz；截圖 cvs_night.png → 走到出口出來回公館
    C2 【前置／捷徑】溫州街 A5 門前 (45.8, 0.4)、15:00 → 「進入日和便利店」→ 窗景是 cvs_wz（zone.wins[*].userData.pview＝cvs_wz、看得到）→ 出來回溫州街
    C3 8 個座位逐一（窗邊吧台四張「坐在窗邊吧台」、內用桌四張）：走過去、按座位的按鈕 → 坐下（P.seat、pose sit）→ 選單沒有讀書類（讀書／念書／看書／自習／慢慢讀）→「起身」
    C4 走到結帳 (1.5, 0.75)「結帳…」→ 點第一樣買得起的 → 扣的錢＝選項上的價格
  aoki（青木茶室）
    A1 【前置／捷徑】公館青木茶室門前 (−54.05, 15)、15:00 → 走到門口（x −54.05）「進入青木茶室」→ 進去、出來
    A2 吧台「點茶」(3.9, −1.2)：桂花烏龍奶茶 70、柚香綠茶 60、春摘白茶 65 各點一次：扣錢對；每一次之後存檔（GAME.autosave）→ 重新整理 → 繼續：錢和存檔前一樣
    A3 20 個玩家可坐的座位逐一坐下、起身：起身後腳下站得住（E.nav.free、canStand 0.3）
    A4 10:30、21:30 各一次：【前置／捷徑】讀檔到門前 → 走到門口按「進入青木茶室」→ 不能進 aoki、要有打烊的字（toast、對話、門口的字）；另印 PLACES.hours.aoki
    A5 手機「地點」→ 青木茶室：快速前往到得了（zone aoki）
  yejian（頁間 v2）
    Y1 16 個座位逐一（每一張先【前置／捷徑】讀檔到店裡進門的地方 14:00，時段次數才是新的）：坐下 → 選單有「讀書」（不是灰的）→ 按讀書 → 選第一個長度 → 讀書時 P.seat 有、pose 是 sit／read → 結束後起身；
       另記每一張坐下的位置和座位差多少（INFO）；沙發東邊那張（v3b (4.7, −3.85)）：坐下前要站在走近點（GAME.seatApproach）0.3 m 內、坐下那一下移動 ≤ 0.9 m、路上不穿過配置阻擋（BB 04:30 改判 PASS／FAIL）
    Y2 「看看法律書與文具」(−4.0, −3.9)、「門上的告示」(−4.0, 3.6)：各按一次、有反應（對話／選單／toast）、不卡住
    Y3 「找書的女生」（pool_story.js pool_1，平日 13～17 在書牆前 (0.3, −3.95)）：場景裡有她（E.npcs 找 charId，不看 obj.visible：鏡頭看不到的人引擎會設 false；看 n.hidden）、量她到書牆（z −4.78＋0.22）的距離（≤ 1.2 m）
  wzbike（cb1d84290）
    B1 【前置／捷徑】溫州街 (40, 0.4) 15:00，車停在溫州街一個合法停車處（先讀一次檔算 BIKE.parkSpots，再讀檔把車放那裡）→ 走到車旁上車 → 騎到 A5 門口 → 騎著按「進入日和便利店」
       → 店裡：G.bike.zone＝wenzhou、在 A5 附近（≤ BIKE.MAXD）；在店裡存檔 → 重新整理 → 繼續：G.bike.zone 還是 wenzhou、人還在店裡
       → 出來回溫州街：車在 A5 附近、BIKE.parkOK、不擋門（車身外框不碰任何門口 0.6 m）、不在騎樓（|z| ≤ 4.3：路邊機車排 z ±3.95～4.1 是合法停車處，店門在 |z| 4.6）
    B2 再騎到 A5 門口、按「下車」停在門口 → 走進去、出來 → 同樣的停車檢查
  art：三間各拍門口 art_<店>_door.png（門前 6 m 面向店門，14:00）、店內 art_<店>_inside.png（進門站的地方、面向店裡 −z）
  卡住檢查：對話框關掉、GAME.D.busyDepth 0、搖桿推得動 ≥ 0.3 m（四個方向試）、GAME.walkFallbacks 沒有增加、沒有 JS 例外。
  ---- 809163ee4（b1ea98f26 AA_653 接進來：日和 v2b、青木 v2c／v2d、頁間 v3b；ggshops_sys3d.js）補的段落（BB 04:30）----
  cvs_menu   熱食櫃四樣（烤地瓜 45、茶葉蛋 13、肉包 25、關東煮 60：先看一句〔白天兩句之一〕、買完店員那句、扣款）；22:00～06:00（23:00、01:00、03:00）熱食櫃＝晚上那一句、只剩茶葉蛋和肉包；
             咖啡三樣（美式 45、拿鐵 60、冰美式 45）＋「大杯還是中杯？」＋旁白；包裹＝「……查不到耶。可能還沒到。」；微波：沒買＝貼紙那句 → 結帳買微波義大利麵 → 微波＝「叮了一聲」→ 再按＝貼紙；
             冷藏櫃：15:00、23:00＝白天兩句之一，01:00、03:00＝半夜那一句。24 小時照 cc_cvs24_probe.py。
  yejian_menu  看看書牆、看新書各一次（稿上之一）；點咖啡四樣（美式 90、拿鐵 110、紅茶 80、今日蛋糕 100）：今天第一次點＝店員那句＋旁白，之後只有旁白。
  aoki       進出（門 x −54.05）；門口外帶 (−55.79, 21) 三樣（桂花烏龍奶茶 70、柚香綠茶 60、春摘白茶 65）、每次存檔 → 重新整理 → 繼續；手機快速前往。
  aoki_menu  吧台內用點茶七樣（四種熱茶一壺 220／260／240／200＝店員那句＋點完兩句之一；冷泡 120、茶點 80／80＝稿上沒有點完的句子，只記 INFO）；錢不夠＝店員那句；看書櫃、茶具櫃、茶罐各一次。
  aoki_seats 22 張都坐得下（17 張可以讀書、吧台五張沒有「讀書」；第一張可以讀的真的讀一次）、坐下那一句照位子（GGS.seatKind）、卡座走 ap 按得到、起身站得住。
  aoki_hours 10:59、11:00、20:59、21:00（【前置】讀檔到門口早 3 分鐘、等到那一刻才按）：開＝進得去；關＝門口那一句（AA_653 §0 逐字），按「外帶」也是那一句、不賣；颱風假＝颱風那一句。
  aoki_closein 20:57 在店裡等到 21:00：店員一句＋旁白（逐字、照順序）、回公館門口。
  aoki_date  照 cc_gg_shops2_probe.py 的 date（smoke Person）：還沒去過＝手機約的地點沒有青木 → 真的走進去一次 → 約得到 → X207（坐下才開演、同桌、帶路、道別）、答應的一句、開場句（AA_653）。
用法：LW_TESTS=<wt>/tests [CASES=cvs,cvs_menu,aoki,aoki_menu,aoki_seats,aoki_hours,aoki_closein,aoki_date,yejian,yejian_menu,wzbike,art] [SEATS=0,1,2] python3 cc_gg_int_probe.py <url> <out>"""
import os, sys, json, asyncio, time, math, re
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
CASES = [c.strip() for c in (os.environ.get('CASES') or 'cvs,cvs_menu,aoki,aoki_menu,aoki_seats,aoki_hours,aoki_closein,aoki_date,yejian,yejian_menu,wzbike,art').split(',') if c.strip()]
SEATSEL = [int(x) for x in (os.environ.get('SEATS') or '').split(',') if x.strip()]
J = lambda o: json.dumps(o, ensure_ascii=False)
FLAGS = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True, 'BIKE_TIP': True, 'BIKE_PARK_TIP': True}
DAY, WD = 7, 2          # 2025-09-23（二）
OUTDOOR = ['campus', 'gongguan', 'wenzhou', 'lane118', 'xinsheng']
STUDY_WORDS = ['讀書', '念書', '看書', '自習', '慢慢讀']
CLOSED_WORDS = ['打烊', '關門', '營業時間', '公休', '還沒開', '明天再來', '鐵捲門', '休息']
TEAS = [('桂花烏龍奶茶', 70), ('柚香綠茶', 60), ('春摘白茶', 65)]
DOORX = {'cvs': -29.4, 'aoki': -54.05, 'yejian': -36.4}
DOORLB = {'cvs': '進入便利商店', 'aoki': '進入青木茶室', 'yejian': '進入頁間書屋'}
ZONE = {'cvs': 'cvs', 'aoki': 'aoki', 'yejian': 'bookstore'}
FAILS = []


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)
    return ok


def obs(name, info=''):
    print('OBS ' + name + (('  ' + info) if info else ''), flush=True)


class Run:   # playlib.go_to 要的最小介面
    def note(self, s): print('  ' + s, flush=True)
    def check(self, n, ok, info=''): return check(n, ok, info)


ST = """(()=>{ const G=GAME.G, E=GAME.E, P=E.player, p=P.obj.position, D=GAME.D||{}; const it=document.getElementById('interact');
  return {zone:G.zone, hour:+(+G.hour).toFixed(4), x:+p.x.toFixed(2), z:+p.z.toFixed(2), dlg:!!D.active, depth:D.busyDepth|0, busy:!!P.busy, money:G.money|0, riding:!!P.riding,
    pose:P.pose||null, seat:P.seat?[+(+P.seat.x).toFixed(2),+(+P.seat.z).toFixed(2)]:null,
    name:((document.getElementById('dlgName')||{}).textContent||'').trim(), text:String(D.full||((document.getElementById('dlgText')||{}).textContent)||'').slice(0,160),
    choices:[...document.querySelectorAll('#choices:not(.hide) button')].map(b=>(b.textContent||'').trim()),
    dims:[...document.querySelectorAll('#choices:not(.hide) button')].map(b=>b.classList.contains('dim')),
    interact:(it&&!it.classList.contains('hide')&&getComputedStyle(it).display!=='none')?(it.textContent||'').trim():'', fb:GAME.walkFallbacks||0,
    toast:((document.getElementById('toast')||{}).textContent||'').trim().slice(0,80), cvsFrom:(G.flags||{}).CVS_FROM||null}; })()"""
FIND_JS = """(q=>{ const p=GAME.E.player.obj.position; const its=GAME.E.interactables.filter(i=>!i.hidden&&(q.exitTo?(i.exit&&i.exit.to===q.exitTo):(q.at?Math.hypot(i.x-q.at[0],i.z-q.at[1])<0.3:(i.label||'').startsWith(q.label))));
  its.sort((a,b)=>Math.hypot(a.x-p.x,a.z-p.z)-Math.hypot(b.x-p.x,b.z-p.z)); const it=its[0];
  return it?{x:+it.x.toFixed(2),z:+it.z.toFixed(2),r:it.radius||1.5,label:it.label,to:it.exit?it.exit.to:null}:null; })(%s)"""
SEATS_JS = """(()=>GAME.E.interactables.filter(i=>i.seat&&!i.hidden).map(i=>({x:+i.x.toFixed(2),z:+i.z.toFixed(2),sx:+(+i.seat.x).toFixed(2),sz:+(+i.seat.z).toFixed(2),r:i.radius||0.8,label:i.label,study:!!i.study,ap:i.seat.ap||null})))()"""
NEAREST_JS = """(([x,z])=>{ const it=GAME.E.nearestInteractable&&GAME.E.nearestInteractable(); return !!it&&!!it.seat&&Math.abs(it.x-x)<0.01&&Math.abs(it.z-z)<0.01; })(%s)"""
PICKPT_JS = """(([x,z])=>{ const E=GAME.E, P=E.player, plv=P.lv|0; const it=E.interactables.find(i=>i.seat&&!i.hidden&&Math.abs(i.x-x)<0.01&&Math.abs(i.z-z)<0.01); if(!it) return null;
  /* 照 engine3d.js E.nearestInteractable：範圍內、距離－prio 最小；有人坐的位子不算 */
  const occ=st=>(E.npcs||[]).some(n=>n.seat&&Math.hypot(n.seat.x-st.x,n.seat.z-st.z)<0.35);
  const best=(px,pz)=>{ let b=null, bd=1e9; for(const q of E.interactables){ if(q.hidden) continue; if(q.seat&&(occ(q.seat)||q.seat.taken)) continue; if(E.levels&&q.lv!==undefined&&(q.lv|0)!==plv) continue; const d=Math.hypot(q.x-px,q.z-pz); if(d<(q.radius||1.8)&&d-(q.prio||0)<bd){ bd=d-(q.prio||0); b=q; } } return b; };
  const r0=(it.radius||1.8)-0.05, out=[]; for(let r=0;r<=r0+1e-6;r+=0.1) for(let k=0;k<16;k++){ const px=it.x+Math.sin(k*Math.PI/8)*r, pz=it.z+Math.cos(k*Math.PI/8)*r; if(!E.canStand(px,pz,0.3,plv)) continue; if(best(px,pz)!==it) continue;
    const pth=E.pathTo?E.pathTo(P.obj.position.x,P.obj.position.z,plv,px,pz,plv):[[px,pz]]; if(!pth||!pth.length) continue; out.push([+px.toFixed(2),+pz.toFixed(2),+r.toFixed(1)]); if(out.length>=4) return out; }
  return out; })(%s)"""
NEARSEAT_JS = """(()=>{ const it=GAME.E.nearestInteractable&&GAME.E.nearestInteractable(); return it&&it.seat?{x:+it.x.toFixed(2),z:+it.z.toFixed(2),sx:+(+it.seat.x).toFixed(2),sz:+(+it.seat.z).toFixed(2),label:it.label}:null; })()"""
APPROACH_JS = """(([x,z])=>{ const it=GAME.E.interactables.find(i=>i.seat&&Math.abs(i.x-x)<0.01&&Math.abs(i.z-z)<0.01); if(!it||!GAME.seatApproach) return null; const a=GAME.seatApproach(it.seat); return a?[+a[0].toFixed(2),+a[1].toFixed(2)]:null; })(%s)"""
STAND_JS = """(()=>{ const E=GAME.E, p=E.player.obj.position; return {free:!!E.nav.free(p.x,p.z), stand:!!E.canStand(p.x,p.z,0.3,E.player.lv|0)}; })()"""
WINS_JS = """(()=>{ const z=GAME.E.zone; const w=(z&&z.wins)||[]; const vis=o=>{ for(let q=o;q;q=q.parent) if(q.visible===false) return false; return true; };
  const umap=o=>{ const U=o.material&&o.material.uniforms; const t=(U&&U.map&&U.map.value)||(o.material&&o.material.map)||null; return t?{img:!!(t.image&&(t.image.width||t.image.videoWidth)), w:t.image&&t.image.width||0}:null; };
  return w.map(o=>({pview:o.userData&&o.userData.pview||null, visible:vis(o), self:o.visible!==false, map:umap(o), parent:o.parent&&o.parent.name||null})); })()"""
BK = """(()=>{ const E=GAME.E, G=GAME.G, P=E.player; const pk=E.zone&&E.zone.group.children.find(o=>o.name==='bike_ride');
  return {zone:G.zone, riding:!!P.riding, parked:pk?[+pk.position.x.toFixed(2),+pk.position.z.toFixed(2)]:null, bike:G.bike?JSON.parse(JSON.stringify(G.bike)):null}; })()"""
PCHK = """(()=>{ const E=GAME.E, G=GAME.G, s=G.bike||{}; const pk=E.zone.group.children.find(o=>o.name==='bike_ride'); let bb=null;
  if(pk){ pk.updateMatrixWorld(true); const B=new THREE.Box3().setFromObject(pk); bb={x0:B.min.x,x1:B.max.x,z0:B.min.z,z1:B.max.z}; }
  const doors=E.interactables.filter(i=>!i.bike&&((i.exit&&i.exit.to&&!['campus','gongguan','wenzhou','lane118','xinsheng'].includes(i.exit.to))||(i.wzShop&&i.kind==='enter')||(i.label||'').startsWith('進入')));
  const hit=bb?doors.filter(d=>Math.hypot(Math.max(bb.x0-d.x,0,d.x-bb.x1),Math.max(bb.z0-d.z,0,d.z-bb.z1))<0.6).map(d=>d.label):null;
  const a5=WZS.AA413.cvs.enter; return {zone:s.zone, x:s.x, z:s.z, yaw:s.yaw, ok:BIKE.parkOK(E,{x:s.x,z:s.z,yaw:s.yaw||0}), dA5:+Math.hypot(s.x-a5.x,s.z-a5.z).toFixed(2), maxd:BIKE.MAXD, hit, nDoors:doors.length, parked:!!pk}; })()"""
SPOTS_JS = """(()=>BIKE.parkSpots(GAME.E,'wenzhou').map(q=>({x:+q.x.toFixed(2),z:+q.z.toFixed(2),yaw:q.yaw||0})))()"""
FARSIDE_JS = """(([bx,bz])=>{ const E=GAME.E; const ds=E.interactables.filter(i=>(i.exit||i.wzShop)&&!i.bike).sort((a,b)=>Math.hypot(a.x-bx,a.z-bz)-Math.hypot(b.x-bx,b.z-bz)); const d=ds[0];
  const cand=[]; for(let k=0;k<12;k++){ const a=k/12*Math.PI*2; for(const r of [0.7,0.95]){ const x=bx+Math.sin(a)*r, z=bz+Math.cos(a)*r; if(!E.canStand(x,z,0.3,0)) continue; cand.push({x:+x.toFixed(2),z:+z.toFixed(2),dd:d?Math.hypot(d.x-x,d.z-z)-(d.radius||1.5):99}); } }
  cand.sort((a,b)=>b.dd-a.dd); return cand.slice(0,4); })(%s)"""
BLOCKS_JS = """(()=>(typeof YEJIAN_LAYOUT!=='undefined'?YEJIAN_LAYOUT.blocks:[]))()"""
GIRL_JS = """(()=>{ let at=null; try{ for(const k in POOL_STORY.PEOPLE){ const p=POOL_STORY.PEOPLE[k]; for(const w of (p&&p.where)||[]) if(w.zone==='bookstore'&&w.at) at={id:k,at:w.at}; } }catch(e){}
  /* 不能用 obj.visible 篩：engine3d.js 的 NPC 迴圈（距離 LOD＋視錐）把鏡頭看不到的人設 obj.visible=false——玩家站在門口面向窗、她在背後的書牆前就被濾掉（PC 11-04 809163ee4：npcs 整個是空的，連店員都沒有）。
     遊戲層面「不在」看 n.hidden（底模還沒下載完、被劇情藏起來）；vis 只記錄這一格畫面有沒有畫她 */
  const out={want:at, npcs:[]}; for(const n of GAME.E.npcs||[]){ if(!n.obj) continue; const p=n.obj.position; out.npcs.push({id:n.charId||n.id||n.poolId||null,clerk:!!n.clerk,hidden:!!n.hidden,vis:n.obj.visible!==false,x:+p.x.toFixed(2),z:+p.z.toFixed(2),ry:+n.obj.rotation.y.toFixed(2)}); }
  return out; })()"""


async def converse(pg, cdp, tag, plan=None, max_s=180, samples=None):
    """逐句印對話（transcript）、點到底；選單照 plan 的順序挑（字開頭；'' ＝第一個），對不上：選「不用了／起身／再看看」或最後一個。
    samples：list 的話，每一圈記一筆 (pose, seat)。回傳 (台詞, 選單, 對不上的選單)"""
    plan = list(plan or []); lines = []; menus = []; odd = []; last = None; t0 = time.time(); idle = None; lastc = None
    while time.time() - t0 < max_s:
        s = await pg.evaluate(ST)
        if samples is not None: samples.append((s['pose'], s['seat'], s['x'], s['z']))
        if s['toast'] and (not lines or lines[-1] != '［toast］' + s['toast']): lines.append('［toast］' + s['toast'])
        if s['choices'] and lastc and lastc[0] == tuple(s['choices']) and time.time() - lastc[2] < 5 and lastc[3] < 3:
            # 剛點過同一個選單、畫面還是它（點下去沒反應：toast、選單剛重畫）：再點同一個，不把 plan 往下用
            print('  [%s] 選單還在（點了沒反應），再點一次「%s」' % (tag, s['choices'][lastc[1]]), flush=True)
            await L.tap(pg, cdp, '#choices button:nth-child(%d)' % (lastc[1] + 1)); lastc = (lastc[0], lastc[1], time.time(), lastc[3] + 1); await pg.wait_for_timeout(1100); continue
        if s['choices']:
            menus.append(s['choices']); k = None
            if plan:
                k = next((i for i, c in enumerate(s['choices']) if c.startswith(plan[0])), None)
                if k is not None: plan.pop(0)
            if k is None:
                odd.append(s['choices']); k = next((i for i, c in enumerate(s['choices']) if c.startswith(('不用了', '起身', '再看看', '算了'))), len(s['choices']) - 1)
            print('  [%s] 選單 %s → %s' % (tag, J(s['choices']), s['choices'][k]), flush=True)
            await L.tap(pg, cdp, '#choices button:nth-child(%d)' % (k + 1)); lastc = (tuple(s['choices']), k, time.time(), 0); await pg.wait_for_timeout(900); idle = None; last = None; continue
        lastc = None
        if s['dlg']:
            if (s['name'], s['text']) != last:
                last = (s['name'], s['text']); lines.append(((s['name'] + '：') if s['name'] else '') + s['text'])
                print('  [%s] %s：%s' % (tag, s['name'] or '（旁白）', s['text']), flush=True)
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700); idle = None; continue
        if s['depth'] == 0 and not s['busy']:
            if idle is None: idle = time.time()
            if time.time() - idle > 2.5: break
        await pg.wait_for_timeout(400)
    if plan: print('  [%s] 選單計畫沒用完：%s' % (tag, J(plan)), flush=True)
    return lines, menus, odd


async def stuck_check(pg, cdp, tag, fb0, e0, errs, soft=False):
    """卡住檢查：對話框關掉、busyDepth 0、搖桿推得動 ≥ 0.3 m（前、後、右、左都試，前面是牆不算卡住）、walkFallbacks 沒增加、沒有新的 JS 例外。soft＝只記 OBS"""
    await converse(pg, cdp, tag, None, 15)
    moved = 0.0
    for dx, dy in ((0, -60), (0, 60), (60, 0), (-60, 0)):
        moved, _, _ = await L.push_until(pg, cdp, dx, dy, 0.3, max_pushes=2, ms=1500)
        if moved >= 0.3: break
    s = await pg.evaluate(ST); new = errs[e0:]
    ok = (not s['dlg'] and not s['choices'] and s['depth'] == 0 and moved >= 0.3 and s['fb'] == fb0 and not new)
    info = J({'zone': s['zone'], 'dlg': s['dlg'], 'depth': s['depth'], 'moved': round(moved, 2), 'fb': [fb0, s['fb']], 'errs': new[:2]})
    if soft: obs('[%s] 卡住檢查%s' % (tag, '通過' if ok else '沒通過'), info)
    else: check('[%s] 卡住檢查（對話關、busyDepth 0、搖桿 ≥0.3 m、walkFallbacks 沒增加、沒有 JS 例外）' % tag, ok, info)
    if not ok: await pg.screenshot(path=os.path.join(OUT, 'STUCK_%s.png' % tag))
    return ok


async def wait_js(pg, js, secs):
    t0 = time.time()
    while time.time() - t0 < secs:
        if await pg.evaluate(js): return True
        await pg.wait_for_timeout(800)
    return False


async def load(pg, cdp, zone, x, z, hour, desc, money=3000, extra=None, yaw=math.pi):
    st = {'zone': zone, 'hour': hour, 'day': DAY, 'weekday': WD, 'weather': 'clear', 'flags': dict(FLAGS), 'money': money, 'pos': {'x': x, 'z': z, 'yaw': yaw, 'lv': 0}}
    if extra:
        fl = extra.pop('flags', None)
        st.update(extra)
        if fl: st['flags'].update(fl)
    print('  [前置／捷徑] 讀檔：%s (%s, %s)、2025-09-23（二）%s、money %d、條件事件關閉%s' % (zone, x, z, hhmm(hour), money, ('、' + desc) if desc else ''), flush=True)
    await L.load_state(pg, st, quiet_events=True)
    await pg.wait_for_timeout(6500); await L.close_panels(pg, cdp); await converse(pg, cdp, 'load', None, 15)


def hhmm(h):
    h = h % 24; return '%02d:%02d' % (int(h + 1e-6), int(round((h % 1) * 60)) % 60)


async def walk_tap(pg, cdp, tag, q, label_prefix, near=None):
    """走到互動點 → 互動按鈕要是 label_prefix → 按下去。回傳互動點（dict）或 None"""
    it = await pg.evaluate(FIND_JS % J(q))
    if not check('[%s] 有「%s」互動點' % (tag, label_prefix or q), bool(it), J(it)): return None
    await L.go_to(pg, cdp, Run(), it['x'], it['z'], near if near is not None else max(0.4, it['r'] * 0.6), it['label'], max_s=600)
    await pg.wait_for_timeout(1000); s = await pg.evaluate(ST)
    if not check('[%s] 走到旁邊：互動按鈕是「%s…」' % (tag, label_prefix or it['label']), s['interact'].startswith(label_prefix or it['label']), J({k: s[k] for k in ('x', 'z', 'interact')})):
        await pg.screenshot(path=os.path.join(OUT, 'NOBTN_%s.png' % tag)); return None
    await L.tap(pg, cdp, '#interact'); return it


async def enter_via(pg, cdp, tag, q, label_prefix, want_zone, near=None):
    z0 = (await pg.evaluate(ST))['zone']
    it = await walk_tap(pg, cdp, tag, q, label_prefix, near)
    if not it: return False
    ok = await wait_js(pg, "GAME.G.zone===%s&&!GAME.E.player.busy" % J(want_zone), 60); await pg.wait_for_timeout(2500)
    s = await pg.evaluate(ST)
    check('[%s] 按「%s」：%s → %s' % (tag, it['label'], z0, want_zone), ok and s['zone'] == want_zone, J({k: s[k] for k in ('zone', 'x', 'z', 'toast')}))
    return ok


async def go_out(pg, cdp, tag, want_zone):
    return await enter_via(pg, cdp, tag, {'label': '離開'}, '離開', want_zone)


async def reload_continue(pg, cdp, tag):
    print('  [捷徑] 存檔：GAME.autosave()（和換區域時的自動存檔同一個）→ 重新整理 → 標題「繼續」', flush=True)
    await pg.evaluate("GAME.autosave()"); await pg.wait_for_timeout(1000)
    await pg.reload(); await L.wait_loaded(pg); await L.no_phone_auto(pg); await pg.wait_for_timeout(1500)
    ok = await L.tap(pg, cdp, '#btnContinue'); await pg.wait_for_timeout(8000); await L.close_panels(pg, cdp)
    check('[%s] 標題有「繼續」、按下去回到遊戲' % tag, ok)
    return ok


async def approach_seat(pg, cdp, t, sv):
    """走到「最近的互動就是這一張」的地方（照 E.nearestInteractable 的規則算：相鄰座位同一個字，站在兩張中間會變成另一張）。
    PC 11-04 GG_int_cvs C3：原本走到座位本身 0.35 m，最近的常是隔壁那張（字一樣），判 FAIL。回傳 True＝按鈕就是這一張"""
    cands = await pg.evaluate(PICKPT_JS % J([sv['x'], sv['z']])) or []
    tries = ([sv['ap']] if sv.get('ap') else []) + [c[:2] for c in cands][:3] + [[sv['x'], sv['z']]]
    for k, tp in enumerate(tries):
        await L.go_to(pg, cdp, Run(), tp[0], tp[1], 0.15 if k < len(tries) - 1 else 0.3, '座位 (%s,%s) 的按鈕點 %s' % (sv['sx'], sv['sz'], J(tp)), max_s=300)
        await pg.wait_for_timeout(800)
        if await pg.evaluate(NEAREST_JS % J([sv['x'], sv['z']])): break
    s = await pg.evaluate(ST); near_ok = await pg.evaluate(NEAREST_JS % J([sv['x'], sv['z']])); nb = await pg.evaluate(NEARSEAT_JS)
    return check('[%s] 走到座位旁：最近的互動是這一張（%s,%s）「%s」' % (t, sv['sx'], sv['sz'], sv['label']), near_ok and s['interact'].startswith(sv['label']),
                 J({'at': [s['x'], s['z']], 'interact': s['interact'], 'nearest': nb, 'cands': cands}))


async def sit_each(pg, cdp, tag, seats, idx, plan_extra, check_menu, after=None):
    """座位逐一：走過去、確定最近的互動是這一張、按下去、坐下、看選單、起身"""
    sv = seats[idx]; t = '%s_seat%02d' % (tag, idx)
    if not await approach_seat(pg, cdp, t, sv): return None
    s = await pg.evaluate(ST)
    p0 = (s['x'], s['z']); samples = []; pre = []
    apx = await pg.evaluate(APPROACH_JS % J([sv['x'], sv['z']]))   # 遊戲自己的走近點（GAME.seatApproach）
    await L.tap(pg, cdp, '#interact')
    t0 = time.time(); s = None; last = None
    while time.time() - t0 < 90:
        s = await pg.evaluate(ST); samples.append((s['pose'], s['seat'], s['x'], s['z']))
        if s['choices']: break
        if s['dlg']:   # 坐下那一句（青木、afar、Daybreak 的 STORY.onSeat）
            if (s['name'], s['text']) != last: last = (s['name'], s['text']); pre.append(((s['name'] + '：') if s['name'] else '') + s['text']); print('  [%s] %s：%s' % (t, s['name'] or '（旁白）', s['text']), flush=True)
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700); continue
        await pg.wait_for_timeout(400)
    seated = bool(s and s['seat']) and s['pose'] in ('sit', 'read')
    check('[%s] 坐下（P.seat 有、pose sit）' % t, seated, J({k: s[k] for k in ('pose', 'seat', 'x', 'z')}) if s else 'null')
    menu = (s or {}).get('choices') or []
    k1 = next((i for i, q in enumerate(samples) if q[1]), None)
    walk_end = (samples[k1 - 1][2], samples[k1 - 1][3]) if k1 else p0   # 坐下前最後一個取樣（走到走近點、還沒坐下）
    res = {'menu': menu, 'p0': p0, 'sit': (s['x'], s['z']) if s else None, 'seat': (sv['sx'], sv['sz']), 'samples': samples, 'pre': pre, 'ap': apx, 'walkEnd': walk_end}
    if check_menu: check_menu(t, menu, s)
    await pg.screenshot(path=os.path.join(OUT, '%s.png' % t))
    lines, menus, odd = await converse(pg, cdp, t, plan_extra + ['起身'], 300, samples)
    res['lines'] = pre + lines
    s2 = await pg.evaluate(ST)
    check('[%s] 起身（P.seat 沒了）' % t, not s2['seat'], J({k: s2[k] for k in ('pose', 'seat', 'x', 'z')}))
    if after: await after(t, s2)
    return res


async def case_cvs(pg, cdp, errs):
    print('== cvs 日和便利店 v2', flush=True)
    # C1 公館 23:30
    await load(pg, cdp, 'gongguan', -29.4, 15.0, 23.5, '公館日和便利店門前')
    fb0 = (await pg.evaluate(ST))['fb']; e0 = len(errs)
    if await enter_via(pg, cdp, 'C1', {'label': DOORLB['cvs']}, DOORLB['cvs'], 'cvs', near=1.2):
        w = await pg.evaluate(WINS_JS)
        check('C1 從公館進：窗景不是 cvs_wz', not any(q['pview'] == 'cvs_wz' for q in w), J(w))
        await L.turn_camera_to(pg, cdp, 0.4, -2.0); await pg.wait_for_timeout(2500)
        await pg.screenshot(path=os.path.join(OUT, 'cvs_night.png')); print('  [C1] 截圖 cvs_night.png（23:30）', flush=True)
        await stuck_check(pg, cdp, 'C1_inside', fb0, e0, errs)
        await go_out(pg, cdp, 'C1_out', 'gongguan')
    # C2 溫州街 A5 15:00
    await load(pg, cdp, 'wenzhou', 45.8, 0.4, 15.0, '溫州街 A5 日和便利店門前')
    fb0 = (await pg.evaluate(ST))['fb']; e0 = len(errs)
    if await enter_via(pg, cdp, 'C2', {'label': '進入日和便利店'}, '進入日和便利店', 'cvs', near=0.6):
        await wait_js(pg, "!!(GAME.E.zone&&GAME.E.zone.wins&&GAME.E.zone.wins.length)", 20)
        w0 = await pg.evaluate(WINS_JS)
        print('  [C2] 剛進門（鏡頭在店門外那一側，前牆淡出時窗的零件一起藏）：%s' % J(w0), flush=True)
        # PC 11-04：剛進門判 visible false、map false——貼圖在 ShaderMaterial 的 uniforms.map（不是 material.map），前牆淡出時窗一起藏。走到店中間、鏡頭朝店門（窗）再看
        await L.go_to(pg, cdp, Run(), 0.4, 0.2, 0.5, '店中間（看窗）')
        await L.turn_camera_to(pg, cdp, 0.4, 6.0)
        await wait_js(pg, "(()=>{ const w=(GAME.E.zone.wins||[])[0]; const U=w&&w.material&&w.material.uniforms; const t=U&&U.map&&U.map.value; return !!(t&&t.image&&t.image.width); })()", 30); await pg.wait_for_timeout(1500)
        w = await pg.evaluate(WINS_JS)
        check('C2 從溫州街 A5 進：窗景是 cvs_wz（userData.pview）、貼圖載好了（uniforms.map 有圖）', bool(w) and all(q['pview'] == 'cvs_wz' for q in w) and any(q['map'] and q['map']['img'] for q in w), J(w))
        check('C2 鏡頭朝窗的時候窗景看得到（自己和父節點都 visible）', any(q['visible'] for q in w), J(w))
        await pg.screenshot(path=os.path.join(OUT, 'C2_cvs_from_wz.png'))
        await stuck_check(pg, cdp, 'C2_inside', fb0, e0, errs)
        # C3 8 個座位
        seats = await pg.evaluate(SEATS_JS)
        check('C3 座位 8 個', len(seats) == 8, J([[q['sx'], q['sz'], q['label']] for q in seats]))
        def cm(t, menu, s):
            bad = [c for c in menu if any(w in c for w in STUDY_WORDS)]
            check('[%s] 座位選單沒有讀書類選項' % t, bool(menu) and not bad, J(menu))
        for i in range(len(seats)):
            if SEATSEL and i not in SEATSEL: continue
            await sit_each(pg, cdp, 'C3', seats, i, [], cm)
        await stuck_check(pg, cdp, 'C3_end', fb0, e0, errs)
        # C4 結帳
        m0 = (await pg.evaluate(ST))['money']
        if await walk_tap(pg, cdp, 'C4', {'at': [1.5, 0.75]}, '結帳'):
            t0 = time.time(); s = None
            while time.time() - t0 < 30:
                s = await pg.evaluate(ST)
                if s['choices']: break
                if s['dlg']: await L.tap(pg, cdp, '#dlg')
                await pg.wait_for_timeout(600)
            items = []
            for c, d in zip(s['choices'], s['dims']):
                if '元' in c and not d:
                    try: items.append((c, int(c.split('　')[-1].split('元')[0].strip().replace(',', ''))))
                    except ValueError: pass
            check('C4 結帳選單有買得起的品項（「品名　N 元」）', bool(items), J(s['choices']))
            if items:
                name, price = items[0]
                lines, menus, odd = await converse(pg, cdp, 'C4', [name], 120)
                m1 = (await pg.evaluate(ST))['money']
                check('C4 買「%s」：扣的錢＝價格 %d' % (name, price), m0 - m1 == price, J({'money': [m0, m1], 'lines': lines[-3:]}))
            await stuck_check(pg, cdp, 'C4_end', fb0, e0, errs)
        await go_out(pg, cdp, 'C2_out', 'wenzhou')
        s = await pg.evaluate(ST)
        check('C2 出來回溫州街 A5 門外', s['zone'] == 'wenzhou' and abs(s['x'] - 44) < 3, J({k: s[k] for k in ('zone', 'x', 'z')}))


# ---------------------------------------------------------------- AA_653（企劃線 a7f16be34 docs/story_planning/AA_653_回LAWWW_公館三間室內缺的台詞_青木外帶與讀書.md；遊戲 src/ggshops_sys3d.js）
A653 = {
    'cvs': {'hot_day': ['（熱食櫃裡有烤地瓜、茶葉蛋、兩種包子。烤地瓜的牌子寫著「剛出爐」。）', '（關東煮的鍋子在冒煙。白蘿蔔已經賣掉一半了。）'], 'hot_night': '（熱食櫃剩下兩顆茶葉蛋和一個肉包。）',
            'hot_items': [('烤地瓜', 45), ('茶葉蛋', 13), ('肉包', 25), ('關東煮（三樣）', 60)], 'hot_night_items': ['茶葉蛋', '肉包'], 'hot_after': '要加熱嗎？……那幫你裝袋。',
            'coffee': [('美式', 45), ('拿鐵', 60), ('冰美式', 45)], 'coffee_after': ['大杯還是中杯？', '（咖啡機響了一陣，杯子上印著一片小小的葉子。）'],
            'parcel_no': '……查不到耶。可能還沒到。', 'micro_yes': '（微波爐轉了一分鐘，叮了一聲。）', 'micro_no': '（微波爐旁邊貼著「請勿加熱鋁箔包裝」。）',
            'cool_day': ['（冷藏櫃裡一整排飲料，最下面一層是牛奶。有一瓶豆漿被人放到茶的那一格。）', '（冷藏櫃的玻璃起了一層霧。你拉開門，冷氣撲到臉上。）'], 'cool_night': '（冷藏櫃最上面那層的飯糰只剩鮪魚口味。）'},
    'yejian': {'shelf': ['（書牆一直頂到天花板，最上面那層要用梯子才拿得到。類別牌寫著「大學生活」。）', '（「法律」那一格有一本書夾著一張便條：「第三章很重要」。不知道是誰留的。）', '（你在「散文・人文」那一格停了很久。最後一本也沒拿。）'],
               'new': ['（斜面書架上擺著這個月的新書。有一本的封面是一扇開著的窗。）', '（新書架旁邊的小卡寫著店員的推薦：「適合下雨天。」）'],
               'cafe': [('美式', 90), ('拿鐵', 110), ('紅茶', 80), ('今日蛋糕', 100)], 'first': '書可以帶到位子上看喔。……沒買的看完放回去就好。', 'after': '（咖啡吧的磨豆機響了一下。店員把杯子放在一個小木盤上。）'},
    'aoki': {'order': [('桂花烏龍', 220, 'pot'), ('東方美人', 260, 'pot'), ('春摘白茶', 240, 'pot'), ('包種', 200, 'pot'), ('柚香綠茶', 120, 'cold'), ('綠豆糕', 80, 'snack'), ('桂花糕', 80, 'snack')],
             'pot': '第一泡我幫你泡，之後可以自己加熱水。', 'pot_after': ['（店員把茶壺、公道杯、兩個小杯放在木盤上，端到你的位子。）', '（第一泡的茶很香。店員說：「三十秒就好，不要泡太久。」）'],
             'poor': '冷泡的柚香綠茶比較便宜喔。',
             'look': {'bookcase': ['（書櫃裡多半是茶的書，也有幾本旅行的書和一本《民法總則》，不知道是誰留下的。）', '（書櫃中間那一層放著一個小盆栽，葉子垂到下一層的書上。）'],
                      'vitrine': ['（玻璃櫃裡擺著白瓷茶壺和幾盒茶葉禮盒。最上面那盒用麻繩綁著。）', '（茶具櫃的燈打在一只淺綠色的茶壺上。旁邊的小卡寫著「非賣品」。）'],
                      'tea_tins': ['（後牆一整排深綠色的茶罐，每一罐都貼著手寫的標籤：烏龍、綠茶、白茶、包種、鐵觀音……）', '（有一罐的標籤寫著「今年第一批」。店員說那是春天的白茶。）']},
             'seat': ['（窗外的騎樓有人走過。茶杯的影子落在桌上。）', '（綠色的卡座很軟，旁邊的書櫃伸手就拿得到。）', '（茶的香味很淡，店裡只聽得到熱水壺的聲音。）', '（吧台前面看得到店員秤茶葉，一克一克地放。）'],
             'close': ['我們九點打烊。……茶葉要帶走的話，可以幫你包。', '（你走出青木茶室。門口的外帶窗口已經關上了。）'],
             'door_typhoon': '（青木茶室的門上貼著「颱風天暫停營業」。）', 'door_closed': '（青木茶室的燈關了，外帶窗口也拉下來了。門上的木牌寫著「11:00～21:00」。）',
             'take': [('桂花烏龍奶茶', 70), ('柚香綠茶', 60), ('春摘白茶', 65)], 'take_at': (-55.79, 21.0)}}
NZ = lambda t: re.sub(r'[「」\s]', '', t or '')
TYPHOON_KEY = '2025-10-13'


def ln_text(x):
    return x.split('：', 1)[1] if ('：' in x and not x.startswith('（') and not x.startswith('［')) else x


def has_line(lines, t):
    return any(NZ(ln_text(x)) == NZ(t) for x in lines)


def any_line(lines, pool):
    return [t for t in pool if has_line(lines, t)]


GGSIT_JS = """(k=>{ const it=GAME.E.interactables.find(i=>!i.hidden&&i.ggs===k); return it?{x:it.x,z:it.z,r:it.radius||0.9,label:it.label}:null; })(%s)"""


async def ggs_tap(pg, cdp, tag, kind):
    it = await pg.evaluate(GGSIT_JS % J(kind))
    if not check('[%s] 有 ggs＝%s 的互動點' % (tag, kind), bool(it), J(it)): return None
    if not await walk_tap(pg, cdp, tag, {'at': [it['x'], it['z']]}, it['label']): return None
    return it


async def buy_menu(pg, cdp, tag, kind, name, price, at=None, label=None):
    """走到互動點（ggs kind 或 at）→ 按 → 選 name → 回傳 (台詞, 選單, 扣的錢, 時間差)"""
    if at: ok = await walk_tap(pg, cdp, tag, {'at': list(at)}, label)
    else: ok = await ggs_tap(pg, cdp, tag, kind)
    if not ok: return None
    s0 = await pg.evaluate(ST)
    lines, menus, odd = await converse(pg, cdp, tag, [name], 120)
    s1 = await pg.evaluate(ST)
    opt = next((c for m in menus for c in m if c.startswith(name)), '')
    check('[%s] 選項「%s」價錢 %d、扣 %d' % (tag, name, price, price), ('%d 元' % price) in opt and s0['money'] - s1['money'] == price, J({'opt': opt, 'money': [s0['money'], s1['money']], 'lines': lines[-4:]}))
    return lines, menus, s0['money'] - s1['money'], s1['hour'] - s0['hour']


async def case_cvs_menu(pg, cdp, errs):
    print('== cvs_menu 日和 v2b（AA_653 第 1 節）', flush=True)
    A = A653['cvs']; si = await pg.evaluate("(()=>{ const q=Z3.SHOP_IN.cvs; return {x:q.x,z:q.z}; })()")
    await load(pg, cdp, 'cvs', si['x'], si['z'], 15.0, '日和便利店進門的地方（白天）', money=3000)
    fb0 = (await pg.evaluate(ST))['fb']; e0 = len(errs)
    for nm, pr in A['hot_items']:
        r = await buy_menu(pg, cdp, 'cvs_hot_' + nm, 'hotfood', nm, pr)
        if r:
            check('[cvs_hot_%s] 先看熱食櫃（白天兩句之一）、買完店員那一句（逐字）' % nm, len(any_line(r[0], A['hot_day'])) == 1 and has_line(r[0], A['hot_after']), J(r[0]))
    menu = None
    for nm, pr in A['coffee']:
        r = await buy_menu(pg, cdp, 'cvs_coffee_' + nm, 'coffee', nm, pr)
        if r:
            menu = r[1]
            check('[cvs_coffee_%s] 店員「大杯還是中杯？」＋旁白（逐字、照順序）' % nm, all(has_line(r[0], t) for t in A['coffee_after']), J(r[0]))
    if menu: check('cvs 咖啡選單三樣（美式 45、拿鐵 60、冰美式 45）', [c for c in menu[0] if c != '不用了'] == [q[0] + '　%d 元' % q[1] for q in A['coffee']], J(menu[0]))
    if await ggs_tap(pg, cdp, 'cvs_parcel', 'parcel'):
        lines, _, _ = await converse(pg, cdp, 'cvs_parcel', None, 30)
        check('cvs 包裹暫取（沒有包裹）：店員「%s」（逐字）' % A['parcel_no'], has_line(lines, A['parcel_no']), J(lines))
    if await ggs_tap(pg, cdp, 'cvs_micro_no', 'microwave'):
        lines, _, _ = await converse(pg, cdp, 'cvs_micro_no', None, 30)
        check('cvs 微波（今天還沒買微波義大利麵）：貼紙那一句、不熱', has_line(lines, A['micro_no']) and not has_line(lines, A['micro_yes']), J(lines))
    r = await buy_menu(pg, cdp, 'cvs_pasta', None, '微波義大利麵', 75, at=(1.5, 0.75), label='結帳')
    if r and await ggs_tap(pg, cdp, 'cvs_micro_yes', 'microwave'):
        lines, _, _ = await converse(pg, cdp, 'cvs_micro_yes', None, 30)
        check('cvs 微波（今天買了微波義大利麵）：「%s」' % A['micro_yes'], has_line(lines, A['micro_yes']), J(lines))
        if await ggs_tap(pg, cdp, 'cvs_micro_again', 'microwave'):
            lines, _, _ = await converse(pg, cdp, 'cvs_micro_again', None, 30)
            check('cvs 微波（熱過了，再按一次）：回到貼紙那一句', has_line(lines, A['micro_no']), J(lines))
    if await ggs_tap(pg, cdp, 'cvs_cool_day', 'cooler'):
        lines, _, _ = await converse(pg, cdp, 'cvs_cool_day', None, 30)
        check('cvs 冷藏櫃（15:00）：白天兩句之一', len(any_line(lines, A['cool_day'])) == 1 and not has_line(lines, A['cool_night']), J(lines))
    await stuck_check(pg, cdp, 'cvs_menu_day', fb0, e0, errs)
    for h, tag in ((23.0, 'cvs_night23'), (1.0, 'cvs_night01'), (3.0, 'cvs_night03')):
        await load(pg, cdp, 'cvs', si['x'], si['z'], h, '日和便利店進門的地方（%s）' % hhmm(h), money=3000)
        fb0 = (await pg.evaluate(ST))['fb']; e0 = len(errs)
        if await ggs_tap(pg, cdp, tag + '_hot', 'hotfood'):
            lines, menus, _ = await converse(pg, cdp, tag + '_hot', None, 60)
            opts = [c.split('　')[0] for c in (menus[0] if menus else []) if c != '不用了']
            check('[%s] 22:00～06:00 熱食櫃：晚上那一句（逐字）、只剩茶葉蛋和肉包' % tag, has_line(lines, A['hot_night']) and opts == A['hot_night_items'], J({'lines': lines, 'opts': opts}))
        if await ggs_tap(pg, cdp, tag + '_cool', 'cooler'):
            lines, _, _ = await converse(pg, cdp, tag + '_cool', None, 30)
            night = h < 6
            check('[%s] 冷藏櫃：%s' % (tag, '00:00～06:00 半夜那一句（逐字）' if night else '23:00 還是白天的句子'), has_line(lines, A['cool_night']) if night else (len(any_line(lines, A['cool_day'])) == 1), J(lines))
        await stuck_check(pg, cdp, tag, fb0, e0, errs)
    print('  [cvs_menu] 24 小時（進得去、不跳打烊）照 cc_cvs24_probe.py 的判法（CVS24 佇列）', flush=True)


async def case_yejian_menu(pg, cdp, errs):
    print('== yejian_menu 頁間 v3b（AA_653 第 2 節）', flush=True)
    A = A653['yejian']; si = await pg.evaluate("(()=>{ const q=Z3.SHOP_IN.bookstore; return {x:q.x,z:q.z}; })()")
    await load(pg, cdp, 'bookstore', si['x'], si['z'], 14.0, '頁間書屋進門的地方', money=3000)
    fb0 = (await pg.evaluate(ST))['fb']; e0 = len(errs)
    for kind, pool in (('shelf_browse', A['shelf']), ('new_books', A['new'])):
        if await ggs_tap(pg, cdp, 'yj_' + kind, kind):
            lines, _, _ = await converse(pg, cdp, 'yj_' + kind, None, 30)
            check('[yj_%s] 稿上那幾句之一（逐字）' % kind, len(any_line(lines, pool)) == 1, J(lines))
    for n, (nm, pr) in enumerate(A['cafe']):
        r = await buy_menu(pg, cdp, 'yj_cafe_' + nm, 'cafe_order', nm, pr)
        if r:
            if n == 0: check('[yj_cafe_%s] 今天第一次點：店員那一句（逐字）＋點完的旁白' % nm, has_line(r[0], A['first']) and has_line(r[0], A['after']), J(r[0]))
            else: check('[yj_cafe_%s] 同一天再點：店員那句不再說、點完的旁白照說' % nm, not has_line(r[0], A['first']) and has_line(r[0], A['after']), J(r[0]))
    await stuck_check(pg, cdp, 'yejian_menu', fb0, e0, errs)


async def press_at(pg, cdp, tag, x, z_load, h, d=None, desc=''):
    """【前置】讀檔到門口比 h 早 3 分鐘 → 等到 h → 按（照 cc_gg_shops2_probe.py 的 press_door）。回傳 (按下那一刻的 G.hour, 按鈕, 台詞, 狀態, toasts)"""
    ex = {'weather': 'clear'}
    if d is not None: ex.update({'day': d['day'], 'weekday': d['wd']})
    for attempt in (0, 1):
        await load(pg, cdp, 'gongguan', x, z_load, h - (3 if attempt == 0 else 1.5) / 60, desc, extra=dict(ex))
        t0 = time.time()
        while time.time() - t0 < 300:
            s = await pg.evaluate(ST)
            if (s['hour'] % 24) >= h - 1e-4: break
            await pg.wait_for_timeout(250)
        s = await pg.evaluate(ST)
        if (s['hour'] % 24) < h + 0.9 / 60 or attempt == 1: break
        print('  [%s] 等到的時候已經 %s，重來一次' % (tag, hhmm(s['hour'])), flush=True)
    hp, label = s['hour'], s['interact']
    await L.tap(pg, cdp, '#interact')
    toasts = []; t0 = time.time()
    while time.time() - t0 < 5:
        q = await pg.evaluate(ST)
        if q['toast'] and q['toast'] not in toasts: toasts.append(q['toast'])
        if q['zone'] != 'gongguan' or q['choices'] or q['dlg']: break
        await pg.wait_for_timeout(300)
    lines, menus, odd = await converse(pg, cdp, tag, None, 40)
    await wait_js(pg, "!GAME.E.player.busy", 20); await pg.wait_for_timeout(1500)
    s2 = await pg.evaluate(ST)
    print('  [%s] 按下去那一刻 %s（G.hour %.4f）、按鈕「%s」→ zone %s；toast %s；對話 %s；選單 %s' % (tag, hhmm(hp), hp, label, s2['zone'], J(toasts), J(lines), J(menus[:1])), flush=True)
    return hp, label, lines, s2, toasts, menus


async def case_aoki(pg, cdp, errs):
    print('== aoki 青木茶室（v2d：門口外帶、22 張座位）', flush=True)
    A = A653['aoki']
    await load(pg, cdp, 'gongguan', DOORX['aoki'], 15.0, 15.0, '青木茶室門前', money=2000)
    fb0 = (await pg.evaluate(ST))['fb']; e0 = len(errs)
    if not await enter_via(pg, cdp, 'A1', {'label': DOORLB['aoki']}, DOORLB['aoki'], 'aoki', near=1.2): return
    await stuck_check(pg, cdp, 'A1_inside', fb0, e0, errs)
    await go_out(pg, cdp, 'A1_out', 'gongguan')
    s = await pg.evaluate(ST)
    check('A1 出來回公館青木茶室門口（x ≈ −54.05）', s['zone'] == 'gongguan' and abs(s['x'] - DOORX['aoki']) < 2, J({k: s[k] for k in ('zone', 'x', 'z')}))
    # A2 門口外帶（AA_653 §0 A：照舊三樣）＋存檔讀檔
    for nm, price in A['take']:
        r = await buy_menu(pg, cdp, 'A2_' + nm, None, nm, price, at=A['take_at'], label='外帶')
        m_save = (await pg.evaluate(ST))['money']
        if r and await reload_continue(pg, cdp, 'A2_' + nm):
            s = await pg.evaluate(ST)
            check('A2 外帶「%s」之後存檔 → 重新整理 → 繼續：人在公館、錢和存檔前一樣（%d）' % (nm, m_save), s['zone'] == 'gongguan' and s['money'] == m_save, J({k: s[k] for k in ('money', 'zone', 'x', 'z')}))
    fb0 = (await pg.evaluate(ST))['fb']; e0 = len(errs)
    await stuck_check(pg, cdp, 'A2_end', fb0, e0, errs)
    # A5 手機快速前往（已經進過一次）
    await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1000)
    await L.tap(pg, cdp, '#phoneTabs button[data-ptab="places"]'); await pg.wait_for_timeout(900)
    keys = await pg.evaluate("[...document.querySelectorAll('#phoneBody [data-place]')].map(e=>e.getAttribute('data-place'))")
    sel = '#phoneBody [data-place^="aoki|"]'
    has = any(k.startswith('aoki|') for k in keys)
    check('A5 手機「地點」有青木茶室', has, J(keys))
    if has:
        await pg.evaluate("(s=>{ const e=document.querySelector(s); if(e) e.scrollIntoView({block:'center'}); })(%s)" % J(sel)); await pg.wait_for_timeout(600)
        await L.tap(pg, cdp, sel)
        ok = await wait_js(pg, "GAME.G.zone==='aoki'&&!GAME.E.player.busy", 60); await converse(pg, cdp, 'A5', None, 20)
        s = await pg.evaluate(ST)
        check('A5 快速前往到青木茶室（zone aoki）', ok and s['zone'] == 'aoki', J({k: s[k] for k in ('zone', 'x', 'z', 'hour')}))
        await pg.screenshot(path=os.path.join(OUT, 'A5_quick.png'))
    else:
        await L.close_panels(pg, cdp)
    await stuck_check(pg, cdp, 'A5', fb0, e0, errs)


async def case_aoki_menu(pg, cdp, errs):
    print('== aoki_menu 青木內用點茶、看東西（AA_653 第 3 節）', flush=True)
    A = A653['aoki']; si = await pg.evaluate("(()=>{ const q=Z3.SHOP_IN.aoki; return {x:q.x,z:q.z}; })()")
    await load(pg, cdp, 'aoki', si['x'], si['z'], 13.0, '青木茶室進門的地方', money=3000)
    fb0 = (await pg.evaluate(ST))['fb']; e0 = len(errs)
    first = None
    for nm, pr, kind in A['order']:
        r = await buy_menu(pg, cdp, 'A_order_' + nm, 'order', nm, pr)
        if not r: continue
        first = first or r[1]
        if kind == 'pot':
            check('[A_order_%s] 熱茶一壺：店員「%s」＋點完的一句（兩句之一，逐字）' % (nm, A['pot']), has_line(r[0], A['pot']) and len(any_line(r[0], A['pot_after'])) == 1, J(r[0]))
        else:
            toast = [x for x in r[0] if x.startswith('［toast］')]
            print('INFO [A_order_%s] %s：稿上沒有點完的句子，遊戲只出「買了○○」：%s' % (nm, '冷泡' if kind == 'cold' else '茶點', J(toast)), flush=True)
    if first:
        got = [c.split('　')[0] for c in first[0] if c != '不用了']
        check('A_order 內用選單七樣（四種熱茶一壺、冷泡、兩樣茶點；名字照稿開頭）', len(got) == 7 and all(g.startswith(a[0]) for g, a in zip(got, A['order'])), J(first[0]))
    for kind, pool in A['look'].items():
        if await ggs_tap(pg, cdp, 'A_look_' + kind, kind):
            lines, _, _ = await converse(pg, cdp, 'A_look_' + kind, None, 30)
            check('[A_look_%s] 稿上那幾句之一（逐字）' % kind, len(any_line(lines, pool)) == 1, J(lines))
    await stuck_check(pg, cdp, 'aoki_menu', fb0, e0, errs)
    # 錢不夠
    await load(pg, cdp, 'aoki', si['x'], si['z'], 13.0, '青木茶室進門的地方、money 150', money=150)
    if await ggs_tap(pg, cdp, 'A_order_poor', 'order'):
        s0 = await pg.evaluate(ST)
        lines, _, _ = await converse(pg, cdp, 'A_order_poor', ['桂花烏龍'], 60)
        s1 = await pg.evaluate(ST)
        check('A_order 錢不夠點熱茶：店員「%s」（逐字）、不扣錢' % A['poor'], has_line(lines, A['poor']) and s0['money'] == s1['money'], J({'money': [s0['money'], s1['money']], 'lines': lines}))


async def case_aoki_seats(pg, cdp, errs):
    print('== aoki_seats 青木 22 張（17 張可以讀書、吧台不能讀、卡座走 ap）', flush=True)
    si = await pg.evaluate("(()=>{ const q=Z3.SHOP_IN.aoki; return {x:q.x,z:q.z}; })()")
    await load(pg, cdp, 'aoki', si['x'], si['z'], 12.0, '青木茶室進門的地方')
    seats = await pg.evaluate(SEATS_JS)
    check('aoki_seats 玩家可坐 22 張、可以讀書 17 張', len(seats) == 22 and sum(1 for q in seats if q['study']) == 17, J([[q['sx'], q['sz'], q['label'], q['study'], q['ap']] for q in seats]))
    read_once = False
    for i in range(len(seats)):
        if SEATSEL and i not in SEATSEL: continue
        if i > 0: await load(pg, cdp, 'aoki', si['x'], si['z'], 12.0, '青木茶室進門的地方（每一張重讀）')
        fb0 = (await pg.evaluate(ST))['fb']; e0 = len(errs); sv = seats[i]
        want = await pg.evaluate("(([x,z])=>{ const k=GGS.seatKind({x,z}); return k?GGS.L.seat[k]:null; })(%s)" % J([sv['sx'], sv['sz']]))
        def cm(t, menu, s, sv=sv):
            st = [c for c in menu if c.startswith('讀書')]
            if sv['study']: check('[%s] 可以讀書的位子：選單有「讀書」' % t, bool(st), J(menu))
            else: check('[%s] 吧台高腳椅：選單沒有「讀書」' % t, not st, J(menu))
        plan = ['讀書', ''] if (sv['study'] and not read_once) else []
        if plan: read_once = True
        async def after(t, s2):
            r = await pg.evaluate(STAND_JS)
            check('[%s] 起身後腳下站得住（nav.free、canStand 0.3）' % t, r['free'] and r['stand'], J(dict(r, x=s2['x'], z=s2['z'])))
        res = await sit_each(pg, cdp, 'aoki', seats, i, plan, cm, after)
        if res:
            t = 'aoki_seat%02d' % i
            check('[%s] 坐下那一句照位子類型（AA_653，逐字）' % t, (has_line(res['pre'], want) if want else not any_line(res['pre'], A653['aoki']['seat'])), J({'want': want, 'got': res['pre']}))
            if sv['ap']: check('[%s] 卡座：走到 ap %s 按得到' % (t, J(sv['ap'])), math.hypot(res['walkEnd'][0] - sv['ap'][0], res['walkEnd'][1] - sv['ap'][1]) <= 0.4, J({'walkEnd': res['walkEnd']}))
        await stuck_check(pg, cdp, 'aoki_seat%02d' % i, fb0, e0, errs)


async def case_aoki_hours(pg, cdp, errs):
    print('== aoki_hours 青木 11:00～21:00、颱風假', flush=True)
    A = A653['aoki']
    for h, want in ((10 + 59 / 60, False), (11.0, True), (20 + 59 / 60, True), (21.0, False)):
        tag = 'aoki_hours_' + hhmm(h).replace(':', '')
        hp, label, lines, s, toasts, menus = await press_at(pg, cdp, tag, DOORX['aoki'], 20.0, h, desc='青木茶室門口（門前 1 m）')
        e0 = len(errs); hh = hp % 24
        hit = h - 1e-4 <= hh < h + 1 / 60
        if not hit: obs('[%s] 按下去那一刻 %s 不在 %s 那一分鐘裡，照那一刻判' % (tag, hhmm(hp), hhmm(h)))
        exp_open = want if hit else (11 <= hh < 21)
        await pg.screenshot(path=os.path.join(OUT, '%s.png' % tag))
        if exp_open:
            check('[%s] %s 開著：進得去' % (tag, hhmm(hp)), s['zone'] == 'aoki', J({k: s[k] for k in ('zone', 'x', 'z')}))
            if s['zone'] == 'aoki': await go_out(pg, cdp, tag + '_out', 'gongguan')
        else:
            check('[%s] %s 關著：進不去' % (tag, hhmm(hp)), s['zone'] == 'gongguan', J({k: s[k] for k in ('zone', 'x', 'z')}))
            check('[%s] 關著到門口：「%s」（AA_653 §0，逐字）' % (tag, A['door_closed']), has_line(lines, A['door_closed']), J({'lines': lines, 'toasts': toasts}))
            # 外帶窗口也是同一句、不賣
            hp2, l2, lines2, s2, t2, m2 = await press_at(pg, cdp, tag + '_take', A['take_at'][0], 20.0, hh if hh >= 6 else h, desc='青木茶室外帶窗口前')
            check('[%s] 關著按「外帶」：同一句、沒有選單（不賣）' % tag, has_line(lines2, A['door_closed']) and not m2, J({'lines': lines2, 'menus': m2}))
        await stuck_check(pg, cdp, tag, s['fb'], e0, errs)
    tag = 'aoki_typhoon'
    td = await pg.evaluate("(k=>{ const d=STORY.dayOfKey(k); return {day:d, wd:CALENDAR.dateOf(d).wd%7, typhoon:!!CALENDAR.typhoon(d)}; })(%s)" % J(TYPHOON_KEY))
    check('[%s] 前置：%s 是颱風假' % (tag, TYPHOON_KEY), td['typhoon'], J(td))
    hp, label, lines, s, toasts, menus = await press_at(pg, cdp, tag, DOORX['aoki'], 20.0, 15.0, d=td, desc='青木茶室門口、%s 颱風假' % TYPHOON_KEY)
    check('[%s] 颱風假 15:00：進不去、「%s」（逐字）' % (tag, A['door_typhoon']), s['zone'] == 'gongguan' and has_line(lines, A['door_typhoon']), J({'zone': s['zone'], 'lines': lines, 'toasts': toasts}))
    await pg.screenshot(path=os.path.join(OUT, '%s.png' % tag))
    await stuck_check(pg, cdp, tag, s['fb'], len(errs), errs)


async def case_aoki_closein(pg, cdp, errs):
    print('== aoki_closein 21:00 人在店裡', flush=True)
    A = A653['aoki']; si = await pg.evaluate("(()=>{ const q=Z3.SHOP_IN.aoki; return {x:q.x,z:q.z,out:q.out}; })()")
    await load(pg, cdp, 'aoki', si['x'], si['z'], 21 - 3 / 60, '青木茶室進門的地方、打烊前 3 分鐘')
    fb0 = (await pg.evaluate(ST))['fb']; e0 = len(errs)
    lines = []; t0 = time.time()
    while time.time() - t0 < 600:
        s = await pg.evaluate(ST)
        if s['dlg'] or s['choices']: lines += (await converse(pg, cdp, 'aoki_closein', None, 60))[0]
        s = await pg.evaluate(ST)
        if s['zone'] != 'aoki' and not s['busy']: break
        await pg.wait_for_timeout(1000)
    await pg.wait_for_timeout(1500); s = await pg.evaluate(ST)
    idx = [next((i for i, x in enumerate(lines) if NZ(ln_text(x)) == NZ(t)), -1) for t in A['close']]
    check('aoki_closein 21:00：店員一句＋旁白（AA_653，逐字、照順序）', all(i >= 0 for i in idx) and idx[0] < idx[1], J({'want': A['close'], 'got': lines}))
    check('aoki_closein：回公館青木茶室門口（SHOP_IN.out %s 1.5 m 內）' % J(si['out']), s['zone'] == 'gongguan' and math.hypot(s['x'] - si['out']['x'], s['z'] - si['out']['z']) <= 1.5, J({k: s[k] for k in ('zone', 'x', 'z')}))
    await pg.screenshot(path=os.path.join(OUT, 'aoki_closein.png'))
    await stuck_check(pg, cdp, 'aoki_closein', fb0, e0, errs)


async def case_aoki_date(pw):
    """約去青木茶室（AA_653 第 3 節）：照 cc_gg_shops2_probe.py 的 date（smoke Person；去過青木以後才列、X207 坐下才開演）"""
    import types as _t
    path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'cc_gg_shops2_probe.py'); src = open(path, encoding='utf-8').read()
    k = src.rstrip().rfind('asyncio.run(main())'); mod = _t.ModuleType('cc_gg_shops2'); mod.__file__ = path
    exec(compile(src[:k], path, 'exec'), mod.__dict__)
    await mod.case_date(pw, 'aoki')
    for f in mod.GI.FAILS: FAILS.append(f)


async def case_yejian(pg, cdp, errs):
    print('== yejian 頁間書屋 v2', flush=True)
    sp = await pg.evaluate("(()=>{ const q=Z3.SHOP_IN&&Z3.SHOP_IN.bookstore; return q?{x:q.x,z:q.z}:null; })()")
    check('Y 有 Z3.SHOP_IN.bookstore（頁間書屋 v2 進門站的地方）', bool(sp), J(sp))
    if not sp: return
    blocks = await pg.evaluate(BLOCKS_JS)
    await load(pg, cdp, 'bookstore', sp['x'], sp['z'], 14.0, '頁間書屋進門的地方')
    seats = await pg.evaluate(SEATS_JS)
    check('Y1 座位 16 個、都標可以讀書', len(seats) == 16 and all(q['study'] for q in seats), J([[q['sx'], q['sz'], q['study']] for q in seats]))
    def cm(t, menu, s):
        st = [c for c in menu if c.startswith('讀書')]
        check('[%s] 座位選單有「讀書」' % t, bool(st), J(menu))
    for i in range(len(seats)):
        if SEATSEL and i not in SEATSEL: continue
        if i > 0: await load(pg, cdp, 'bookstore', sp['x'], sp['z'], 14.0, '頁間書屋進門的地方（每一張重讀：讀書的時段次數是新的）')
        fb0 = (await pg.evaluate(ST))['fb']; e0 = len(errs)
        res = await sit_each(pg, cdp, 'Y1', seats, i, ['讀書', ''], cm)
        if not res: continue
        sm = res['samples']
        reading = [q for q in sm if q[1] and q[0] in ('sit', 'read')]
        check('[Y1_seat%02d] 按讀書以後：讀書時 P.seat 有、pose sit／read' % i, len(reading) >= 2, J(sorted(set(q[0] or '' for q in sm))))
        lines = res['lines']
        print('  [Y1_seat%02d] 讀書的台詞：%s' % (i, J(lines[-4:])), flush=True)
        if res['sit']:
            slide = math.hypot(res['sit'][0] - res['p0'][0], res['sit'][1] - res['p0'][1]); off = math.hypot(res['sit'][0] - res['seat'][0], res['sit'][1] - res['seat'][1])
            print('INFO [Y1_seat%02d] 座位 %s：按下去的位置 %s → 坐好 %s（移動 %.2f m、離座位 %.2f m）' % (i, J(res['seat']), J(res['p0']), J(res['sit']), slide, off), flush=True)
            if abs(res['seat'][0] - 4.7) < 0.05 and abs(res['seat'][1] + 3.85) < 0.25:
                # 頁間 v3b（919ec0f7c）：沙發照一般走近（沒有 ap）→ 走近點＝GAME.seatApproach；BB 04:30：「東邊那張不能再滑」改判 PASS／FAIL
                thru = [q for q in sm if any(abs(q[2] - b[0]) < b[2] / 2 - 0.05 and abs(q[3] - b[1]) < b[3] / 2 - 0.05 for b in blocks) and not q[1]]
                we, ap = res['walkEnd'], res['ap']; d_ap = math.hypot(we[0] - ap[0], we[1] - ap[1]) if ap else None; sl = math.hypot(res['sit'][0] - we[0], res['sit'][1] - we[1])
                print('INFO [Y1_seat%02d] 沙發東邊：走近點 %s、坐下前站的地方 %s（離走近點 %s m）、坐好 %s（坐下那一下移動 %.2f m）；路上踩進配置阻擋 %d 筆' % (i, J(ap), J(we), d_ap if d_ap is None else round(d_ap, 2), J(res['sit']), sl, len(thru)), flush=True)
                check('[Y1_seat%02d] 沙發東邊不再滑：坐下前站在走近點 0.3 m 內（GAME.seatApproach；v3b 沒有 ap）' % i, d_ap is not None and d_ap <= 0.3, J({'ap': ap, 'walkEnd': we}))
                check('[Y1_seat%02d] 沙發東邊：坐下那一下移動 ≤ 0.9 m（走近點的候選最遠 0.9 m；v3a 滑 1.3 m）、路上沒有穿過配置的阻擋' % i, sl <= 0.9 and not thru, J({'slide': round(sl, 2), 'thru': thru[:3]}))
        await stuck_check(pg, cdp, 'Y1_seat%02d' % i, fb0, e0, errs)
    # Y2 買書、打工告示
    await load(pg, cdp, 'bookstore', sp['x'], sp['z'], 14.0, '頁間書屋進門的地方')
    for tag, at, lb in (('Y2_book', [-4.0, -3.9], '看看法律書與文具'), ('Y2_job', [-4.0, 3.6], '')):
        fb0 = (await pg.evaluate(ST))['fb']; e0 = len(errs)
        it = await pg.evaluate(FIND_JS % J({'at': at}))
        if not check('[%s] (%s,%s) 有互動點' % (tag, at[0], at[1]), bool(it), J(it)): continue
        if not await walk_tap(pg, cdp, tag, {'at': at}, lb or it['label']): continue
        await pg.wait_for_timeout(1500)
        s = await pg.evaluate(ST); first = {k: s[k] for k in ('dlg', 'choices', 'toast')}
        lines, menus, odd = await converse(pg, cdp, tag, None, 120)
        check('[%s] 按「%s」有反應（對話、選單或 toast）' % (tag, it['label']), bool(first['dlg'] or first['choices'] or first['toast'] or lines or menus), J({'first': first, 'lines': lines[:4], 'menus': menus[:2]}))
        await pg.screenshot(path=os.path.join(OUT, '%s.png' % tag))
        await stuck_check(pg, cdp, tag, fb0, e0, errs)
    # Y3 找書的女生
    await pg.wait_for_timeout(3000)
    g = await pg.evaluate(GIRL_JS)
    print('  [Y3] 找書的女生：%s' % J(g), flush=True)
    if g['want']:
        wx, wz = g['want']['at'][0], g['want']['at'][1]
        mine = [n for n in g['npcs'] if n['id'] == g['want']['id']]   # 先認人（charId pool_1）；沒有才退回離配置點最近、不是店員的人
        cand = mine or sorted([n for n in g['npcs'] if not n['clerk'] and not n['hidden']], key=lambda n: math.hypot(n['x'] - wx, n['z'] - wz))
        n = cand[0] if cand else None
        if n and n['hidden']: print('INFO [Y3] 她在 E.npcs 裡但 n.hidden（底模還沒下載完／被藏起來）：%s' % J(n), flush=True)
        ok = bool(n) and not n['hidden'] and math.hypot(n['x'] - wx, n['z'] - wz) < 1.0
        check('Y3 場景裡有找書的女生（在配置的 (%.2f, %.2f) 1 m 內）' % (wx, wz), ok, J(n))
        if ok:
            wall = -4.78 + 0.22
            d = round(n['z'] - wall, 2)
            check('Y3 她在書牆前（到書牆正面 z %.2f 的距離 %.2f m ≤ 1.2）' % (wall, d), 0 <= d <= 1.2, J(n))
    else:
        check('Y3 pool_story.js 有頁間書屋的位置', False, J(g))
    await pg.screenshot(path=os.path.join(OUT, 'Y3_girl.png'))


async def park_check(pg, cdp, tag, errs):
    await wait_js(pg, "!!GAME.E.zone.group.children.find(o=>o.name==='bike_ride')", 30)
    c = await pg.evaluate(PCHK)
    print('  [%s] 車：%s' % (tag, J(c)), flush=True)
    check('[%s] 車在溫州街、場景裡看得到' % tag, c['zone'] == 'wenzhou' and c['parked'], J(c))
    check('[%s] 車在 A5 附近（%.2f m ≤ BIKE.MAXD %s）' % (tag, c['dA5'], c['maxd']), c['dA5'] <= c['maxd'], J(c))
    check('[%s] 停車位置合法（BIKE.parkOK：站得住、不擋出入口）' % tag, c['ok'], J(c))
    check('[%s] 車身不碰任何門口（0.6 m）' % tag, c['hit'] is not None and not c['hit'] and c['nDoors'] > 0, J(c['hit']))
    check('[%s] 不在騎樓（溫州街 |z| ≤ 4.3；路邊機車排 z ±3.95～4.1 合法）' % tag, abs(c['z']) <= 4.3, str(c['z']))
    await pg.screenshot(path=os.path.join(OUT, '%s_parked.png' % tag))


async def mount_bike(pg, cdp, tag):
    k = await pg.evaluate(BK)
    if not k['parked']: check('[%s] 場景裡有停著的車' % tag, False, J(k)); return False
    for cand in await pg.evaluate(FARSIDE_JS % J(k['parked'])):
        await L.go_to(pg, cdp, Run(), cand['x'], cand['z'], 0.3, '車旁邊')
        await pg.wait_for_timeout(900)
        if (await pg.evaluate(ST))['interact'].startswith('騎腳踏車'): break
    s = await pg.evaluate(ST)
    if not check('[%s] 車旁邊出現「騎腳踏車」' % tag, s['interact'].startswith('騎腳踏車'), s['interact']): return False
    await L.tap(pg, cdp, '#interact')
    return check('[%s] 上車' % tag, await wait_js(pg, "!!GAME.E.player.riding", 30))


async def case_wzbike(pg, cdp, errs):
    print('== wzbike 溫州街日和的單車', flush=True)
    await load(pg, cdp, 'wenzhou', 40.0, 0.4, 15.0, '算停車位用（下一次讀檔才把車放進去）')
    spots = await pg.evaluate(SPOTS_JS)
    a5 = (45.8, 3.8)
    spots = sorted([q for q in spots if 8 < math.hypot(q['x'] - a5[0], q['z'] - a5[1]) < 40], key=lambda q: math.hypot(q['x'] - 40, q['z']))
    if not check('B 溫州街有離 A5 8～40 m 的合法停車處', bool(spots), J(spots[:3])): return
    sp = spots[0]
    bike = {'zone': 'wenzhou', 'x': sp['x'], 'z': sp['z'], 'yaw': sp['yaw'], 'riding': False, 'kind': 'city', 'color': None, 'owned': [{'kind': 'city', 'color': None}]}
    await load(pg, cdp, 'wenzhou', 40.0, 0.4, 15.0, '車停在溫州街 %s' % J([sp['x'], sp['z']]), extra={'bike': bike})
    fb0 = (await pg.evaluate(ST))['fb']; e0 = len(errs)
    if not await mount_bike(pg, cdp, 'B1'): return
    # B1 騎著進門
    if not await enter_via(pg, cdp, 'B1_in', {'label': '進入日和便利店'}, '進入日和便利店', 'cvs', near=0.6): return
    k = await pg.evaluate(BK); c = await pg.evaluate("(()=>{ const s=GAME.G.bike||{}, a=WZS.AA413.cvs.enter; return {zone:s.zone, d:+Math.hypot(s.x-a.x,s.z-a.z).toFixed(2), maxd:BIKE.MAXD, from:GAME.G.flags.CVS_FROM||null}; })()")
    check('B1 騎著進 A5 日和：先下車、G.bike.zone＝wenzhou、在 A5 附近（cb1d84290）', not k['riding'] and c['zone'] == 'wenzhou' and c['d'] <= c['maxd'], J(c))
    await stuck_check(pg, cdp, 'B1_inside', fb0, e0, errs)
    if await reload_continue(pg, cdp, 'B1_save_in_shop'):
        c2 = await pg.evaluate("(()=>({zone:GAME.G.zone, bike:(GAME.G.bike||{}).zone, from:GAME.G.flags.CVS_FROM||null}))()")
        check('B1 在店裡存檔 → 重新整理 → 繼續：人在店裡、G.bike.zone 還是 wenzhou', c2['zone'] == 'cvs' and c2['bike'] == 'wenzhou', J(c2))
    fb0 = (await pg.evaluate(ST))['fb']; e0 = len(errs)
    if not await go_out(pg, cdp, 'B1_out', 'wenzhou'): return
    await park_check(pg, cdp, 'B1', errs)
    await stuck_check(pg, cdp, 'B1_out', fb0, e0, errs)
    # B2 騎到門口按下車、走進去
    if not await mount_bike(pg, cdp, 'B2'): return
    await L.go_to(pg, cdp, Run(), 45.8, 1.6, 1.0, 'A5 門口（騎車）')
    await L.tap(pg, cdp, '#btnBike'); await pg.wait_for_timeout(2000)
    k = await pg.evaluate(BK)
    check('B2 在 A5 門口按「下車」', not k['riding'] and bool(k['parked']), J(k))
    await pg.screenshot(path=os.path.join(OUT, 'B2_dismount_at_door.png'))
    if not await enter_via(pg, cdp, 'B2_in', {'label': '進入日和便利店'}, '進入日和便利店', 'cvs', near=0.6): return
    if not await go_out(pg, cdp, 'B2_out', 'wenzhou'): return
    await park_check(pg, cdp, 'B2', errs)
    fb0 = (await pg.evaluate(ST))['fb']; e0 = len(errs)
    await stuck_check(pg, cdp, 'B2_out', fb0, e0, errs)


async def case_art(pg, cdp, errs):
    print('== art 截圖', flush=True)
    for key in ('cvs', 'aoki', 'yejian'):
        dx = DOORX[key]
        await load(pg, cdp, 'gongguan', dx, 15.0, 14.0, '%s 門前' % key)
        fb0 = (await pg.evaluate(ST))['fb']; e0 = len(errs)
        await L.go_to(pg, cdp, Run(), dx, 15.0, 0.6, '%s 門前 6 m' % key)
        await L.turn_camera_to(pg, cdp, dx, 22.0); await pg.wait_for_timeout(2500)
        await pg.screenshot(path=os.path.join(OUT, 'art_%s_door.png' % key)); print('  [art] art_%s_door.png' % key, flush=True)
        if await enter_via(pg, cdp, 'art_' + key, {'label': DOORLB[key]}, DOORLB[key], ZONE[key], near=1.2):
            await wait_js(pg, "!!(GAME.E.zone&&GAME.E.zone.formal!==false)", 30); await pg.wait_for_timeout(3000)
            s = await pg.evaluate(ST)
            await L.turn_camera_to(pg, cdp, s['x'], s['z'] - 5.0); await pg.wait_for_timeout(2500)
            await pg.screenshot(path=os.path.join(OUT, 'art_%s_inside.png' % key)); print('  [art] art_%s_inside.png（進門站的地方 (%s,%s)、面向 −z）' % (key, s['x'], s['z']), flush=True)
            await stuck_check(pg, cdp, 'art_' + key, fb0, e0, errs)


async def main():
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); check('遊戲載入', await L.wait_loaded(pg))
        await pg.evaluate("localStorage.clear(); if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}")
        for name, fn in (('cvs', case_cvs), ('cvs_menu', case_cvs_menu), ('aoki', case_aoki), ('aoki_menu', case_aoki_menu), ('aoki_seats', case_aoki_seats), ('aoki_hours', case_aoki_hours), ('aoki_closein', case_aoki_closein),
                         ('yejian', case_yejian), ('yejian_menu', case_yejian_menu), ('wzbike', case_wzbike), ('art', case_art)):
            if name in CASES:
                try: await fn(pg, cdp, errs)
                except Exception as e: check('[%s] 探針本身沒有例外' % name, False, repr(e)[:300])
        check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
        if 'aoki_date' in CASES:
            try: await case_aoki_date(p)
            except Exception as e: check('[aoki_date] 探針本身沒有例外', False, repr(e)[:300])
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS[:10])), flush=True)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
