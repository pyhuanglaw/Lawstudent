"""CC（帳號 A）11-03：體育課在體育館真的上課（AA_644；開發分支 933f8e08d 合併子代理 2284e12e9；BB 23:29 驗收項目）。
  沿用 cc_pe_in_gym_probe.py（4ce25dc1d）的寫法：門口「體育館」→ 按互動 →「進去上課：體育」→ 點對話直到下課。
  站位照 933f8e08d 的程式（不是舊的 (0,−2.6) 中圈前）：
    1F 球場：老師 (0,−7.0) 面南（yaw 0）；同學 10 人在圓心 (0,−6.8) 半徑 4.2 m 的半圈上、面向老師；玩家在半圈最南邊 CLS.PE_IN_GYM (0,−2.6)；羽球場沒人
    B1 池邊（游泳週＝大一上第 10～16 週、B1 開著）：老師 (19.8,−3.4)；同學 6 人坐東側兩張長椅（z≈−1.1）＋2 人站；玩家 CLS.PE_POOL (16.6,−2.2)
  CASES（逗號分隔；預設全部）：
    normal       大一上第 8 週 2025-10-20（一）15:30–17:20：球場站位、旁白「（分組比賽。輸的那一組收球。）」逐字對稿
    name         大一下第 3 週 2026-03-09（一）：球場、旁白有名字「Alison 每打一球就喊一聲」（Alison 不在場／不認識＝「有人每打一球…」）
                 （大一上舊局 9/17 開局：第 1～3 週在開局以前、第 5～7 週 9/29、10/6、10/13 放假——大一上球場有名字的兩句（第 2、6 週）在遊戲裡出不來，見回報）
    swim         大一上第 10 週 2025-11-03（一）：B1 池邊、旁白第 10 週、池邊鏡頭構圖（射線、水面）
    swim_closed  大一上第 13 週 2025-11-24（第四個星期一 B1 休館）：照舊在球場、旁白「（今天在球場講游泳的安全守則。下週下水。）」
    late         大一上第 14 週 2025-12-01（一，游泳週）：開始以後才走進去＝遲到 1～15 分鐘：R.late、出席 +1、沒有 R.abs；旁白照說
    absent       大一上第 11 週 2025-11-10（一）：人在校園、不去，站著等到「沒去」：沒有 done、出席不加（點名週＝缺一次）
    econ_card    舊序章系所快轉（d5138cd27 起，AA_644 第 6 節）：讀檔 2024-09-02 早上男宿（E01_MORNING；正常網址），照遊戲的事件接事件跑到 9/13 保齡球以後，
                 記每一張日期卡（#title3）和對話；「（體育課暖身跑了六圈。舊序章同學跑在最前面，回頭喊你們快一點。）」逐字 1 次、沒有別的體育課句子、9/4 和 9/11 自動算出席
    econ_ff      舊序章系所那一年 2024-09-11，照正常網址讀檔：只記錄「事件接事件」（econff3d.js）會不會把體育課跳過、自動算出席（INFO，不判 FAIL）
    econ         同一堂，網址加 ?nofastecon（[前置／捷徑]，關掉事件接事件）：旁白名字換舊序章系所的同學、沒有法律系的名字
                 （PE644 第一次跑：讀檔 15:10 → 空下來 1.5 秒就跳到 9/12 21:00，體育課自動算出席，門口沒有「進去上課」）
  每一個 CASE 的檢查：
    ① 第一句對話時人在 gym／gym_b1、ADV 背景 freeze ② 玩家站位 ③ 老師站位、朝向、名牌 ④ 同學人數、半圈／長椅、面向老師
    ⑤ 那段時間羽球場（游泳週：池邊公眾長椅）沒有人 ⑥ 這週的旁白和 AA_644 稿逐字一樣（本檔 DOC 照抄稿，名字照在場與否換「有人」）、只出現一句、沒有台詞池那一句
    ⑦ 館內沒有「黑板」字幕 ⑧ freeze 那一刻，站進半圈的朋友（peFriend）是 VRM（driver＝vrm、userData.vrm），不是備用人物
    ⑨ 鏡頭構圖：從鏡頭打射線到每個人頭部，記第一個打到的（老師、朋友被擋＝FAIL，路人只記錄）；游泳池：鏡頭 y 和水面高度、鏡頭有沒有在水裡
    ⑩ 下課：done、出席、遲到、缺席照舊
  截圖：normal、swim 各兩張（第一句、旁白那一句）、name、econ 兩張、swim_closed 一張、late 一張（第一句）；每個 CASE 另有下課後一張。
  每一個捷徑前置都印「[前置／捷徑]」：讀檔（日期、時間、門口南邊）、條件事件關閉、手機自動訊息關閉、讓朋友「認識」（SOCIAL.meet）。
  對照組（修正前 6c14ce66d）跑 normal：③ 老師 z（−7.9）④ 6 人、不在半圈 ⑤ 羽球照打 ⑥ 台詞池那一句（不是稿上的旁白）⑧ 沒有朋友站進來 應該 FAIL；① ② ⑩ 應該 PASS。
用法：LW_TESTS=<wt>/tests [CASES=normal,swim] python3 cc_pe_aa644_probe.py <url> <out>"""
import os, sys, json, asyncio, time, math
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
ALL = ['normal', 'name', 'swim', 'swim_closed', 'late', 'absent', 'econ_card', 'econ_ff', 'econ']
CASES = [c.strip() for c in (os.environ.get('CASES') or ','.join(ALL)).split(',') if c.strip()]
J = lambda o: json.dumps(o, ensure_ascii=False)
FAILS = []

# ---------------------------------------------------------------- 稿（AA_644 第 2 節，照抄；不讀遊戲的 CLS.PE_NARR）
DOC = {
    'pe_y1s1': ['（第一堂。老師點完名，說這學期分三段：體適能、球類、游泳。）', '（暖身跑了六圈。阿哲跑在最前面，回頭喊你們快一點。）', '（量身高、體重、坐姿體前彎。排隊的時候大家都在講昨天的報告。）',
                '（折返跑。最後一趟，你聽到自己的心跳。）', '（開始打籃球。老師先教運球，球一直滾到隔壁的羽球場。）', '（分組三對三。柏翰站在籃下，算好位置才動。）', '（排球低手傳球。整堂課都在撿球。）',
                '（分組比賽。輸的那一組收球。）', '（老師說下週開始游泳，記得帶泳衣泳帽。）', '（第一次下水。水比想像中冷。老師說先閉氣十秒就好。）', '（扶著池邊練踢水。旁邊那一水道有人游得很快。）',
                '（第一次不扶池邊，游了半趟。上岸的時候腿有點軟。）', '（換氣。嗆了兩次水，第三次就對了。）', '（老師說期末要游二十五公尺，不限姿勢。）', '（期末前最後一次練習。你游到對面，扶著牆喘了很久。）',
                '（期末測驗。二十五公尺，你游完了。）'],
    'pe_y1s2': ['（這學期打羽球。老師發球拍，有幾支的線鬆了。）', '（練握拍和高遠球。羽球一直往旁邊飛。）', '（兩人一組對打。Alison 每打一球就喊一聲。）', '（練殺球。老師說手腕不要太用力。）',
                '（雙打的站位。你和同組的人撞在一起兩次。）', '（羽球分組比賽。打到後來沒人在記分。）', '（換排球。網子拉起來，比去年高。）', '（練發球。第五球終於過網。）',
                '（排球分組比賽。明軒一直跑到你的位置接球。）', '（練扣球。跳起來的那一下，球擦過手指。）', '（排球分組比賽第二輪。這次贏了一局。）', '（體適能檢測前的練習：仰臥起坐一分鐘。）',
                '（立定跳遠。粉筆在地上畫了一條線。）', '（八百公尺。跑完大家都坐在地上。）', '（體適能檢測。老師一個一個登記。）', '（期末：羽球和排球各考一項。考完老師說暑假也要動。）'],
    'pe_y2s1': ['（這學期打桌球和籃球。桌球桌從倉庫推出來，有一張的網歪了。）', '（練正手推擋。球一直彈到別桌。）', '（練反手。老師說腳要動，不要只動手。）', '（練發球。芯慈一直在調球拍的角度，發得很準。）',
                '（桌球單打比賽。打到十一分，換人。）', '（桌球雙打。輪流接球，常常兩個人都沒動。）', '（桌球考試前的練習。一直有人喊「好球」。）', '（桌球考試：推擋連續二十下。）',
                '（換籃球。阿哲說他等這一段等一年了。）', '（練上籃。第三次終於進了。）', '（練傳球和跑位。老師一直吹哨。）', '（分組比賽。阿哲傳給你一球，你沒進，他說沒事啦。）',
                '（分組比賽第二輪。中場的時候大家都在喝水。）', '（體適能：一分鐘仰臥起坐、坐姿體前彎。）', '（八百公尺。今年比去年快了一點。）', '（期末：投籃十球、運球繞錐。考完大家一起收球。）'],
}
DOC_SWIM_WEEKS = {'pe_y1s1': [10, 11, 12, 13, 14, 15, 16]}
DOC_CLOSED = '（今天在球場講游泳的安全守則。下週下水。）'
LAW_NAMES = {'阿哲': 'zhe', '柏翰': 'classmate_bohan', '明軒': 'classmate_mingxuan', 'Alison': 'yu', '芯慈': 'classmate_xinci'}
LAW_FRIENDS = ['zhe', 'classmate_bohan', 'classmate_mingxuan', 'yu', 'classmate_xinci', 'classmate_youchen']
ECON_NAMES = {'舊序章同學': 'econ_weilun', '舊序章同學': 'econ_zhengxun'}   # 稿：「名字改成舊序章系所的同學（舊序章同學、舊序章同學）」——沒寫誰換誰
ECON_FRIENDS = ['econ_weilun', 'econ_zhengxun']

# 舊序章系所快轉的日期卡（AA_644 第 6 節，企劃線 27c0193e9；開發 d5138cd27 econff3d.js S.PE_FF）
PE_FF = '（體育課暖身跑了六圈。舊序章同學跑在最前面，回頭喊你們快一點。）'
CARD_REC = r"""(()=>{ if(window.__CARDS) return true; window.__CARDS=[]; const parse=h=>{ const i=h.indexOf('<small>'); const t=(i<0?h:h.slice(0,i)).replace(/<[^>]+>/g,'').trim(); const sub=i<0?'':h.slice(i+7).replace(/<\/small>.*$/s,'');
    return {text:t, sub:sub.split(/<br\s*\/?>/i).map(x=>x.replace(/<[^>]+>/g,'').trim()).filter(Boolean)}; };
  const el=document.getElementById('title3'); let lastH='';
  if(el) new MutationObserver(()=>{ const h=el.innerHTML||''; if(!h||h===lastH) return; lastH=h; const p=parse(h); p.src='dom'; try{ p.at=CALENDAR.dateOf(GAME.G.day).key+' '+(+GAME.G.hour).toFixed(2); }catch(e){} window.__CARDS.push(p); }).observe(el,{childList:true,subtree:true,characterData:true});
  const G0=typeof GAME!=='undefined'?GAME:null; if(G0&&typeof G0.titleCard==='function'&&!G0.titleCard.__cc){ const f=G0.titleCard; const w=function(text,sub,ms){ const p=parse(String(text||'')+(sub?'<small>'+sub+'</small>':'')); p.src='call'; window.__CARDS.push(p); return f.apply(this,arguments); }; w.__cc=true; G0.titleCard=w; }
  return true; })()"""

# ---------------------------------------------------------------- 期望的站位（933f8e08d 的程式／BB 23:29）
TEACHER_1F = (0.0, -7.0)
RING_C, RING_R = (0.0, -6.8), 4.2
PLAYER_1F = (0.0, -2.6)
TEACHER_POOL = (19.8, -3.4)
PLAYER_POOL = (16.6, -2.2)
BENCH_Z = -1.1

FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'afternoonDone': True, 'metAn': True, 'met_an': True, 'MET_ZHE': True, 'met_yu': True, 'zheNoodleDone': True,
         'fundsV2': 1, 'KX_DEC3_MIGRATED': True}
ECON0 = {'ECON_CAMP_OPEN': True, 'E15_BUS': 'nosleep', 'E15_WENT': True, 'ECON_CAMP_DONE': True, 'E01_DONE': True, 'E01_MORNING': True, 'KX_FIRST_MSG': True,
         'fundsV2': 1, 'Y0_STICKY': True, 'KX_DEC3_MIGRATED': True, 'dating_kexin': False}
DOOR_SOUTH = {'x': 74, 'z': 54, 'yaw': 0}


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)
    return ok


def info(name, s):
    print('INFO ' + name + '  ' + s, flush=True)


class Run:   # playlib.go_to 要的最小介面
    def note(self, s): print('  ' + s, flush=True)
    def check(self, n, ok, i=''): return check(n, ok, i)


def dist(a, b): return math.hypot(a[0] - b[0], a[1] - b[1])


# ---------------------------------------------------------------- 頁面裡的工具
HELPERS = r"""(()=>{ if(window.__PE) return true; const V=(x,y,z)=>new THREE.Vector3(x,y,z);
  const visibleChain=o=>{ for(let q=o;q;q=q.parent) if(q.visible===false) return false; return true; };
  const matOK=o=>{ const m=o.material; if(!m) return false; const ms=Array.isArray(m)?m:[m]; return ms.some(x=>x&&x.visible!==false&&!(x.transparent&&x.opacity<0.05)&&x.colorWrite!==false); };
  const C={};
  C.hit=(p,self)=>{ const E=GAME.E, cam=E.camera, cp=cam.getWorldPosition(V()), d=p.clone().sub(cp), Ln=d.length(); d.normalize();
    const rc=new THREE.Raycaster(cp,d,0.05,Ln+0.5); rc.camera=cam; let hs=[]; try{ hs=rc.intersectObjects(E.scene.children,true); }catch(e){ return {err:String(e)}; }
    for(const h of hs){ const o=h.object; if(o.isSprite||o.isPoints||o.isLine) continue; if(!visibleChain(o)||!matOK(o)) continue;
      let mine=false; if(self) for(let q=o;q;q=q.parent) if(q===self){ mine=true; break; }
      let who=null; for(let q=o;q;q=q.parent){ const n=(E.npcs||[]).find(k=>k.obj===q); if(n){ who=n.charId||n.name||n.crowdKey||'npc'; break; } if(E.player&&q===E.player.obj){ who='player'; break; } }
      return {name:o.name||(o.parent&&o.parent.name)||'?', who, d:+h.distance.toFixed(2), L:+Ln.toFixed(2), mine}; }
    return {name:null, who:null, d:null, L:+Ln.toFixed(2), mine:false}; };
  C.proj=p=>{ const v=p.clone().project(GAME.E.camera); return {sx:Math.round((v.x+1)/2*innerWidth), sy:Math.round((1-v.y)/2*innerHeight), inView:v.z<1&&v.x>-1&&v.x<1&&v.y>-1&&v.y<1}; };
  C.model=o=>{ if(!o) return null; const u=o.userData||{}, sp=u.spec||u.buildSpec||{}; let vrm=!!u.vrm; if(!vrm) o.traverse(c=>{ if(c.userData&&c.userData.vrm) vrm=true; }); return {driver:u.driver||null, model:sp.model||null, vrm, placeholder:!!u.placeholder}; };
  C.head=n=>{ const o=n.obj, p=o.position; let y=p.y+1.55; try{ const b=new THREE.Box3().setFromObject(o); if(isFinite(b.max.y)&&b.max.y-p.y>0.8&&b.max.y-p.y<2.4) y=b.max.y-0.12; }catch(e){} return V(p.x,y,p.z); };
  C.water=()=>{ const out=[]; GAME.E.scene.traverse(o=>{ if(!o.isMesh||!visibleChain(o)) return; const nm=(o.name||'')+'|'+((o.parent&&o.parent.name)||'')+'|'+((o.material&&o.material.name)||''); if(!/water|pool_?surf|水/i.test(nm)) return;
      const b=new THREE.Box3().setFromObject(o); if(!isFinite(b.max.y)) return; out.push({name:nm.slice(0,60), y:+b.max.y.toFixed(3), x0:+b.min.x.toFixed(2), x1:+b.max.x.toFixed(2), z0:+b.min.z.toFixed(2), z1:+b.max.z.toFixed(2)}); }); return out; };
  window.__PE=C; return true; })()"""

# 某一天的體育課（門口 gym）：時間、週次、key、課程、在哪裡上
FIND = r"""(a=>{ const day=STORY.dayOfKey(a.key), d=CALENDAR.dateOf(day); const g={day, hour:12, zone:'campus', flags:{}, weekday:d.wd%7, stage:a.stage||'law'};
  const it=(CLS.dayItems(g)||[]).find(q=>q.room&&q.room.door==='gym'); if(!it) return {day, wd:d.wd%7, it:null};
  const pl=CLS.pePlace?CLS.pePlace(g,it):null;
  return {day, wd:d.wd%7, it:{key:it.key, id:it.c.id, name:it.c.name, week:it.week, t0:it.t0, t1:it.t1, swim:!!(CLS.peSwim&&CLS.peSwim(g,it)), place:pl}}; })(__A__)"""

ST = """(()=>{ const G=GAME.G, p=GAME.E.player.obj.position, A=(typeof ADV!=='undefined')?ADV:{}; const D=GAME.D||{}; const cap=document.getElementById('caption');
  return {zone:G.zone, hour:+(+G.hour).toFixed(3), x:+p.x.toFixed(2), z:+p.z.toFixed(2), adv:!!A.active, bg:A.bgMode||null, freeze:!!(A.root&&A.root.classList.contains('freeze')),
    dlg:!!D.active, name:((document.getElementById('dlgName')||{}).textContent||'').trim(), text:((document.getElementById('dlgText')||{}).textContent||'').trim(),
    cap:cap&&!cap.classList.contains('hide')?(cap.textContent||'').trim():'',
    choices:[...document.querySelectorAll('#choices:not(.hide) button')].map(b=>(b.textContent||'').trim())}; })()"""

# freeze 那一刻：站位、人物模型、鏡頭構圖
SNAP = r"""(a=>{ const C=window.__PE, G=GAME.G, E=GAME.E, P=E.player.obj, it=(CLS.dayItems(G)||[]).find(q=>q.key===a.key)||null;
  const ns=(E.npcs||[]).filter(n=>n&&n.obj&&((n.crowd&&/^gym_/.test(n.crowd))||n.peFriend));
  const cnt={}; for(const n of (E.npcs||[])) if(n&&n.crowdRole) cnt[n.crowdRole]=(cnt[n.crowdRole]||0)+1;
  const pe=ns.filter(n=>n.peFriend||/^pe_/.test(n.crowdRole||''));
  const cam=E.camera.getWorldPosition(new THREE.Vector3());
  const row=n=>{ const p=n.obj.position, h=C.head(n), hit=C.hit(h,n.obj), pr=C.proj(h);
    return {id:n.charId||null, name:n.name||'', role:n.crowdRole||null, friend:n.peFriend||null, x:+p.x.toFixed(2), y:+p.y.toFixed(2), z:+p.z.toFixed(2), yaw:+(+n.obj.rotation.y).toFixed(3),
      seat:!!n.seat, pose:n.pose||null, vis:n.obj.visible!==false&&!n.hidden, model:C.model(n.obj), headY:+h.y.toFixed(2), hit, view:pr}; };
  let fr=[]; try{ fr=it&&CLS.peFriends?CLS.peFriends(G,it):[]; }catch(e){}
  const here={}; for(const id of a.friends){ let pr=true, kn=true; try{ pr=typeof STORY.present==='function'?!!STORY.present(id,G):true; }catch(e){} try{ kn=typeof STORY.knows==='function'?!!STORY.knows(id,G):true; }catch(e){} here[id]={present:pr, knows:kn}; }
  let narr=null; try{ narr=it&&CLS.peNarr?CLS.peNarr(G,it):null; }catch(e){}
  return {zone:G.zone, hour:+(+G.hour).toFixed(3), player:{x:+P.position.x.toFixed(2), z:+P.position.z.toFixed(2), yaw:+(+P.rotation.y).toFixed(3)},
    cam:{x:+cam.x.toFixed(2), y:+cam.y.toFixed(2), z:+cam.z.toFixed(2), near:E.camera.near}, cnt, people:pe.map(row),
    ring:(typeof CROWD!=='undefined'&&CROWD.PE_RING)||null, peIn:CLS.PE_IN_GYM||null, pePool:CLS.PE_POOL||null, peFriends:fr, here, gameNarr:narr,
    week:it?it.week:null, water:a.pool?C.water():[], basin:(typeof GYM_LAYOUT!=='undefined'&&GYM_LAYOUT.b1&&GYM_LAYOUT.b1.pool)?GYM_LAYOUT.b1.pool.basin:null}; })(__A__)"""

REC = r"""(a=>{ const G=GAME.G, R=CLS.rec(G), it=(CLS.dayItems(G)||[]).find(q=>q.key===a.key)||null; let rs=null;
  try{ if(it&&CLS.rollStat){ const s=CLS.rollStat(G,it.c,it.term,G.day); rs={weeks:s.weeks, past:s.past, present:s.present, missed:s.missed, rollWeek:(s.weeks||[]).includes(it.week)}; } }catch(e){ rs={err:String(e)}; }
  let today=''; try{ today=(CLS.todayHTML?CLS.todayHTML(G):'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').slice(0,300); }catch(e){}
  return {st:it?CLS.status(G,it):null, done:!!R.done[a.key], late:!!R.late[a.key], abs:!!R.abs[a.key], attend:(R.attend||{})[a.cid]||0, hour:+(+G.hour).toFixed(3), zone:G.zone, roll:rs, today,
    lateMin:it&&CLS.lateMin?+CLS.lateMin(G,it).toFixed(1):null}; })(__A__)"""

POOL_LINES = r"""(cid=>{ const p=(typeof SYLLABUS!=='undefined'&&SYLLABUS.pools&&SYLLABUS.pools[cid])||{}; return {lines:(p.lines||[]).map(String), react:(p.react||[]).map(r=>String(r&&r.text||r))}; })(__A__)"""

MEET = r"""(ids=>{ const out={}; for(const id of ids){ try{ if(typeof SOCIAL!=='undefined'&&SOCIAL.meet) SOCIAL.meet(id,'cc_probe'); out[id]=!!STORY.knows(id,GAME.G); }catch(e){ out[id]='ERR '+e; } } return out; })(__A__)"""


def js(fn, arg): return fn.replace('__A__', json.dumps(arg, ensure_ascii=False))


def expected_line(cid, week, here, names, rename=None):
    """稿上這一週的那一句；名字的人在場而且認識才寫名字，不然換「有人」（稿第 3 節；Alison 後面的半形空格一起拿掉）"""
    if cid == 'pe_y0s1':
        rows = DOC['pe_y1s1'][:8]
    else:
        rows = DOC.get(cid) or []
    if not (1 <= week <= len(rows)): return None, []
    t = rows[week - 1]
    alts = []
    if rename:   # 舊序章系所：阿哲／柏翰 換成舊序章系所的同學（稿沒寫誰換誰：舊序章同學、舊序章同學、有人都接受，但要和那個人在不在一致）
        for law in ('阿哲', '柏翰'):
            if law in t:
                for nm, idd in names.items():
                    h = here.get(idd) or {}
                    alts.append(t.replace(law, nm) if (h.get('present') and h.get('knows')) else t.replace(law, '有人'))
                return None, sorted(set(alts))
        return t, [t]
    for nm, idd in names.items():
        if nm not in t: continue
        h = here.get(idd) or {}
        if not (h.get('present') and h.get('knows')):
            t = t.replace(nm + (' ' if nm[0].isascii() else ''), '有人')
    return t, [t]


async def tap_choice(pg, cdp, prefix):
    s = await pg.evaluate(ST)
    i = next((k for k, t in enumerate(s['choices']) if t.startswith(prefix)), None)
    if i is None: return None
    await L.tap(pg, cdp, '#choices button:nth-child(%d)' % (i + 1)); return s['choices'][i]


async def stable_text(pg):
    """打字機效果：等對話框的字兩次一樣才算"""
    s = await pg.evaluate(ST)
    for _ in range(8):
        await pg.wait_for_timeout(450); s2 = await pg.evaluate(ST)
        if s2['text'] == s['text'] and s2['dlg'] == s['dlg']: return s2
        s = s2
    return s


async def load(pg, cdp, st, label, meet=None):
    print('  [前置／捷徑] 讀檔：%s（條件事件關閉、手機自動訊息關閉）' % label, flush=True)
    await L.load_state(pg, st, quiet_events=True)
    await pg.evaluate("STORY.phoneAuto=()=>{}")
    await pg.wait_for_timeout(9000); await L.close_panels(pg, cdp)
    await pg.evaluate(HELPERS)
    if meet:
        r = await pg.evaluate(js(MEET, meet))
        print('  [前置／捷徑] 讓有修這堂的朋友「認識」（SOCIAL.meet，在不在場照遊戲的作息）：%s' % J(r), flush=True)


async def walk_in_and_class(pg, cdp, tag, fh, shots, narr_ok):
    """門口走進去上課；回傳 {first, snap, lines, caps, end}。narr_ok(text)：這一句是不是稿上的旁白（拍第二張）"""
    it = await L.find_it(pg, '體育館')
    check('%s：校園有「體育館」門口互動點' % tag, bool(it), J(it))
    if not it: return None
    ok = await L.go_to(pg, cdp, Run(), it['x'], it['z'], it['r'] * 0.8, '體育館')
    check('%s：走到體育館門口' % tag, ok)
    await pg.wait_for_timeout(800)
    s = await L.state(pg)
    check('%s：互動按鈕是「體育館…」' % tag, (s.get('interact') or '').startswith('體育館'), s.get('interact'))
    await L.tap(pg, cdp, '#interact')
    t0 = time.time(); picked = None
    while time.time() - t0 < 30 and not picked:
        await pg.wait_for_timeout(600); picked = await tap_choice(pg, cdp, '進去上課')
    check('%s：選單有「進去上課…」並選了它' % tag, bool(picked), str(picked))
    if not picked: return None
    first = snap = None; lines = []; caps = set(); t0 = time.time(); last = None; narr_shot = False
    while time.time() - t0 < 600:
        s = await pg.evaluate(ST)
        if s['cap']: caps.add(s['cap'][:60])
        if s['dlg'] and not first:
            await pg.wait_for_timeout(1200); s = await pg.evaluate(ST); first = s
            snap = await pg.evaluate(js(SNAP, {'key': fh['it']['key'], 'friends': fh['friends'], 'pool': fh['it']['swim']}))
            if 'first' in shots: await pg.screenshot(path=os.path.join(OUT, '%s_first_line.png' % tag))
            print('  %s 第一句：%s' % (tag, J(s)), flush=True)
        if first and not s['dlg'] and not s['choices'] and not s['adv']:
            await pg.wait_for_timeout(2000); s2 = await pg.evaluate(ST)
            if not s2['dlg'] and not s2['choices'] and not s2['adv']: break
        if s['choices']:
            print('  [選項] %s → 選第一個' % J(s['choices']), flush=True)
            lines.append(('[選項]', ' / '.join(s['choices'])))
            await L.tap(pg, cdp, '#choices button:nth-child(1)'); await pg.wait_for_timeout(900); continue
        if s['dlg']:
            s = await stable_text(pg)
            if s['cap']: caps.add(s['cap'][:60])
            sig = (s['name'], s['text'])
            if sig != last:
                print('  %-6s %s' % (s['name'] or '（旁白）', s['text']), flush=True); last = sig; lines.append(sig)
                if 'narr' in shots and not narr_shot and narr_ok(s['text']):
                    narr_shot = True; await pg.screenshot(path=os.path.join(OUT, '%s_narration.png' % tag))
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700); continue
        await pg.wait_for_timeout(600)
    end = await pg.evaluate(ST)
    return {'first': first, 'snap': snap, 'lines': lines, 'caps': sorted(caps), 'end': end}


def faces(p, yaw, tgt, lim=0.9):
    dx, dz = tgt[0] - p[0], tgt[1] - p[1]; L_ = math.hypot(dx, dz) or 1
    return (math.sin(yaw) * dx + math.cos(yaw) * dz) / L_ > lim


def check_layout_1f(tag, sn):
    ppl = sn['people']; T = [q for q in ppl if q['role'] == 'pe_teacher']
    p = sn['player']
    check('%s ② 玩家在半圈最南邊 (0,−2.6) 1.2 m 內、在老師南邊' % tag, dist((p['x'], p['z']), PLAYER_1F) <= 1.2 and (not T or p['z'] > T[0]['z'] + 3), J(p))
    t = T[0] if T else None
    check('%s ③ 老師一位：(0,−7.0) 0.3 m 內、面南（yaw≈0）、名牌「體育老師」' % tag,
          len(T) == 1 and dist((t['x'], t['z']), TEACHER_1F) <= 0.3 and math.cos(t['yaw']) > 0.95 and t['name'] == '體育老師',
          J([{k: q[k] for k in ('name', 'x', 'z', 'yaw')} for q in T]))
    ring = [q for q in ppl if q['role'] == 'pe_student' or (q['friend'] and q['role'] != 'pe_teacher')]
    tp = (t['x'], t['z']) if t else TEACHER_1F
    bad = [q for q in ring if abs(dist((q['x'], q['z']), RING_C) - RING_R) > 0.15 or not faces((q['x'], q['z']), q['yaw'], tp) or q['z'] < tp[1] - 1]
    check('%s ④ 同學 10 人（含站進來的朋友）在圓心 (0,−6.8) 半徑 4.2 m 的半圈上、面向老師' % tag, len(ring) == 10 and not bad,
          '%d 人；不合：%s' % (len(ring), J([{k: q[k] for k in ('id', 'role', 'x', 'z', 'yaw')} for q in bad[:4]])))
    near = min([dist((q['x'], q['z']), (p['x'], p['z'])) for q in ring] or [99])
    info('%s 半圈離玩家最近' % tag, '%.2f m' % near)
    check('%s ⑤ 上課那段時間羽球場沒人打（crowdRole badminton＝0）' % tag, not sn['cnt'].get('badminton'), J(sn['cnt']))


def check_layout_pool(tag, sn):
    ppl = sn['people']; p = sn['player']; T = [q for q in ppl if q['role'] == 'pe_swim_teacher']
    check('%s ② 玩家在池邊 (16.6,−2.2) 1.0 m 內' % tag, dist((p['x'], p['z']), PLAYER_POOL) <= 1.0, J(p))
    t = T[0] if T else None
    check('%s ③ 老師一位：(19.8,−3.4) 0.3 m 內、名牌「體育老師」' % tag, len(T) == 1 and dist((t['x'], t['z']), TEACHER_POOL) <= 0.3 and t['name'] == '體育老師',
          J([{k: q[k] for k in ('name', 'x', 'z', 'yaw')} for q in T]))
    cls = [q for q in ppl if q['role'] == 'pe_swim' or (q['friend'] and q['role'] != 'pe_swim_teacher')]
    sit = [q for q in cls if q['seat'] or q['pose'] == 'sit']; stand = [q for q in cls if q not in sit]
    badsit = [q for q in sit if not (q['x'] > 17.0 and abs(q['z'] - BENCH_Z) < 0.4)]
    check('%s ④ 同學坐東側長椅 6 人（x>17、z≈−1.1）＋站 2 人' % tag, len(sit) == 6 and len(stand) == 2 and not badsit,
          '坐 %d、站 %d；不在長椅：%s' % (len(sit), len(stand), J([{k: q[k] for k in ('id', 'x', 'z')} for q in badsit[:4]])))
    tp = (t['x'], t['z']) if t else TEACHER_POOL
    check('%s ④ 站著的同學面向老師' % tag, all(faces((q['x'], q['z']), q['yaw'], tp) for q in stand), J([{k: q[k] for k in ('id', 'x', 'z', 'yaw')} for q in stand]))
    check('%s ⑤ 池邊公眾長椅沒有一般的人（pool_bench＝0）、救生員照舊（lifeguard＝1）' % tag, not sn['cnt'].get('pool_bench') and sn['cnt'].get('lifeguard') == 1, J(sn['cnt']))


def check_vrm_and_view(tag, sn, pool):
    ppl = sn['people']
    fr = [q for q in ppl if q['friend']]
    print('  %s 有修這堂的朋友在不在場：%s；遊戲 CLS.peFriends＝%s' % (tag, J(sn['here']), J(sn['peFriends'])), flush=True)
    if sn['peFriends']:
        check('%s ⑧ 在場的朋友都站進來了（peFriend）' % tag, sorted(q['id'] for q in fr) == sorted(sn['peFriends']), J([q['id'] for q in fr]))
        bad = [q for q in fr if not (q['model'] and q['model']['driver'] == 'vrm' and q['model']['vrm'] and not q['model']['placeholder'] and q['vis'])]
        check('%s ⑧ freeze 那一刻朋友是 VRM（driver＝vrm、userData.vrm、看得到），不是方塊／空的' % tag, not bad,
              J([{'id': q['id'], 'model': q['model'], 'vis': q['vis']} for q in fr]))
    else:
        info('%s ⑧ 朋友 VRM' % tag, '這一堂沒有在場的朋友（遊戲 CLS.peFriends 空），只記錄其他人：%s' % J(sorted(set(J(q['model']) for q in ppl))))
    drv = {}
    for q in ppl: drv[(q['model'] or {}).get('driver') or 'none'] = drv.get((q['model'] or {}).get('driver') or 'none', 0) + 1
    info('%s 這一班的人物模型' % tag, J(drv))
    # 構圖：鏡頭 → 頭
    blocked = [q for q in ppl if not (q['hit'] and q['hit'].get('mine'))]
    for q in ppl:
        print('    構圖 %-22s role=%-16s 頭 y=%.2f 畫面內=%s 第一個打到：%s' % (q['id'] or q['name'], q['role'] or ('friend' if q['friend'] else '-'), q['headY'], q['view']['inView'], J(q['hit'])), flush=True)
    key = [q for q in ppl if q['role'] in ('pe_teacher', 'pe_swim_teacher') or q['friend']]
    kb = [q for q in key if q in blocked or not q['view']['inView']]
    check('%s ⑨ 鏡頭構圖：老師、朋友的頭在畫面內、沒有被擋（射線第一個打到的是本人）' % tag, not kb,
          J([{'id': q['id'] or q['name'], 'hit': q['hit'], 'inView': q['view']['inView']} for q in kb]))
    info('%s ⑨ 路人同學被擋／在畫面外' % tag, '%d／%d：%s' % (len([q for q in blocked if q not in key]), len([q for q in ppl if q not in key]),
         J([(q['id'] or q['name'], (q['hit'] or {}).get('who') or (q['hit'] or {}).get('name')) for q in blocked if q not in key][:8])))
    if pool:
        w = sn['water']; cam = sn['cam']
        wy = max([x['y'] for x in w]) if w else None
        print('  %s 水面網格：%s；鏡頭：%s' % (tag, J(w[:6]), J(cam)), flush=True)
        inside = any(x['x0'] <= cam['x'] <= x['x1'] and x['z0'] <= cam['z'] <= x['z1'] for x in w)
        check('%s ⑨ 找得到水面網格（名字有 water／水）' % tag, bool(w), J(w[:3]))
        if wy is not None:
            check('%s ⑨ 鏡頭沒有切到水裡（鏡頭在水面範圍內時 y 要高於水面 0.3 m 以上）' % tag, (not inside) or cam['y'] > wy + 0.3,
                  '鏡頭 y=%.2f、水面 y=%.2f、鏡頭在水面範圍內=%s' % (cam['y'], wy, inside))


def check_narration(tag, fh, r, pool_lines, names, rename=None):
    cid, week = fh['it']['id'], fh['it']['week']
    sn = r['snap'] or {}
    here = sn.get('here') or {}
    if fh.get('closed'):
        exp, alts = DOC_CLOSED, [DOC_CLOSED]
    else:
        exp, alts = expected_line(cid, week, here, names, rename)
    texts = [t for (n, t) in r['lines'] if n != '[選項]']
    doc_all = set(DOC['pe_y1s1'] + DOC['pe_y1s2'] + DOC['pe_y2s1'] + [DOC_CLOSED])
    hit = [t for t in texts if t in alts]
    print('  %s 稿上第 %s 週（%s）：%s；遊戲 CLS.peNarr＝%s' % (tag, week, cid, J(alts), J(sn.get('gameNarr'))), flush=True)
    check('%s ⑥ 這週的旁白和 AA_644 稿逐字一樣（名字照在場與否換「有人」）' % tag, len(hit) >= 1, '說了：%s' % J(texts[:12]))
    narrish = [t for t in texts if t.startswith('（') and t.endswith('）') and (t in doc_all or '有人' in t or any(t.replace(a, b) in doc_all for a, b in (('有人', '阿哲'), ('有人', '柏翰'), ('有人', '明軒'), ('有人', 'Alison '), ('有人', '芯慈'), ('舊序章同學', '阿哲'), ('舊序章同學', '柏翰'), ('舊序章同學', '柏翰'), ('舊序章同學', '阿哲'))))]
    check('%s ⑥ 稿上的旁白只出現一句' % tag, len(narrish) == 1, J(narrish))
    pl = [t for t in texts if any(x and x in t for x in pool_lines['lines'])] + [t for t in texts if any(x and x in t for x in pool_lines['react'])]
    check('%s ⑥ 沒有台詞池那一句／同學反應（旁白取代）' % tag, not pl, J(pl[:3]))
    if hit:
        i = texts.index(hit[0])
        info('%s [稿對照] 稿第 1 節「一進場先出旁白」' % tag, '旁白是第 %d 句；之前：%s' % (i + 1, J(texts[:i])))
    check('%s ⑦ 館內沒有「黑板」字幕' % tag, not any(c.startswith('黑板') for c in r['caps']), J(r['caps']))
    return texts


async def find_class(pg, key, stage='law'):
    fh = await pg.evaluate(js(FIND, {'key': key, 'stage': stage}))
    print('  %s 的體育課：%s' % (key, J(fh)), flush=True)
    return fh


async def case_class(pg, cdp, tag, key, expect, lead_h, shots, stage='law', flags=None, meet=None, names=None, friends=None, rename=None, closed=False):
    fh = await find_class(pg, key, stage)
    if not check('%s 前置：%s 有體育課（%s 第 %s 週，%s）' % (tag, key, expect['cid'], expect['week'], '游泳池' if expect['swim'] else '球場'),
                 bool(fh.get('it')) and fh['it']['id'] == expect['cid'] and fh['it']['week'] == expect['week'], J(fh)):
        if not fh.get('it'): return
    fh['friends'] = friends or LAW_FRIENDS; fh['closed'] = closed
    swim = expect['swim']
    check('%s 前置：遊戲判定在 %s（CLS.pePlace）' % (tag, 'gym_b1 池邊' if swim else 'gym 球場'), bool(fh['it'].get('place')) and fh['it']['place'].get('zone') == ('gym_b1' if swim else 'gym'), J(fh['it'].get('place')))
    h = fh['it']['t0'] + lead_h
    F = dict(FLAGS); F.update(flags or {})
    st = {'zone': 'campus', 'hour': h, 'day': fh['day'], 'weekday': fh['wd'], 'weather': 'clear', 'flags': F, 'pos': DOOR_SOUTH, 'stage': stage, 'energy': 90, 'money': 20000}
    await load(pg, cdp, st, '%s %.2f 時（上課 %.2f–%.2f）、校園體育館門口南邊 (74,54)、stage=%s' % (key, h, fh['it']['t0'], fh['it']['t1'], stage), meet=meet or fh['friends'])
    pool_lines = await pg.evaluate(js(POOL_LINES, fh['it']['id']))
    r0 = await pg.evaluate(js(REC, {'key': fh['it']['key'], 'cid': fh['it']['id']}))
    print('  上課前：%s' % J(r0), flush=True)
    if not check('%s 前置：讀檔以後時間沒有被跳走（還在 %.2f 時附近、這堂還沒上）' % (tag, h), not r0['done'] and abs(r0['hour'] - h) < 0.5, J({k: r0[k] for k in ('hour', 'st', 'done', 'zone')})):
        return None
    exp_rows = DOC['pe_y1s1'][:8] if fh['it']['id'] == 'pe_y0s1' else DOC.get(fh['it']['id'], [])
    base = exp_rows[fh['it']['week'] - 1] if 1 <= fh['it']['week'] <= len(exp_rows) else ''
    def narr_ok(t):
        if closed: return t == DOC_CLOSED
        return t.startswith('（') and len(t) > 6 and (t == base or t[:6] == base[:6])
    r = await walk_in_and_class(pg, cdp, tag, fh, shots, narr_ok)
    if not r or not r['first']:
        check('%s：上課的對話有出現' % tag, False, J(r and r['end'])); return None
    f, sn = r['first'], r['snap']
    zone = 'gym_b1' if swim else 'gym'
    check('%s ① 上課第一句時人在 %s' % (tag, zone), f['zone'] == zone, J(f))
    check('%s ① 上課時 ADV 背景是館內 3D（bgMode＝freeze）' % tag, f['adv'] and f['bg'] == 'freeze' and f['freeze'], J({k: f[k] for k in ('adv', 'bg', 'freeze')}))
    if swim: check_layout_pool(tag, sn)
    else: check_layout_1f(tag, sn)
    check_vrm_and_view(tag, sn, swim)
    texts = check_narration(tag, fh, r, pool_lines, names or LAW_NAMES, rename)
    r1 = await pg.evaluate(js(REC, {'key': fh['it']['key'], 'cid': fh['it']['id']}))
    print('  下課後：%s' % J(r1), flush=True)
    await pg.screenshot(path=os.path.join(OUT, '%s_after.png' % tag))
    return {'fh': fh, 'r': r, 'r0': r0, 'r1': r1, 'texts': texts}


async def main():
    os.makedirs(OUT, exist_ok=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); check('遊戲載入', await L.wait_loaded(pg))
        await pg.evaluate("localStorage.clear(); STORY.phoneAuto=()=>{}")
        has = await pg.evaluate("({narr:!!(typeof CLS!=='undefined'&&CLS.PE_NARR), place:!!(typeof CLS!=='undefined'&&CLS.pePlace), ring:!!(typeof CROWD!=='undefined'&&CROWD.PE_RING), b1:!!(typeof Z3!=='undefined'&&Z3.ZONES.gym_b1)})")
        info('這一版有沒有 AA_644 的程式', J(has))

        if 'normal' in CASES:
            print('== normal 一般週（球場）', flush=True)
            x = await case_class(pg, cdp, 'normal', '2025-10-20', {'cid': 'pe_y1s1', 'week': 8, 'swim': False}, -0.4, ('first', 'narr'))
            if x:
                r0, r1 = x['r0'], x['r1']
                check('normal ⑩ 下課：done、出席 +1、沒有缺席', r1['st'] == 'done' and r1['done'] and r1['attend'] == r0['attend'] + 1 and not r1['abs'], J(r1))
                if not r1['late']: check('normal ⑩ 準時進去：沒有記遲到', not r1['late'], J(r1))
                else: info('normal ⑩ 走進去時已經開始（記了遲到）', J(r1))

        if 'name' in CASES:
            print('== name 旁白有名字（大一下第 3 週 Alison）', flush=True)
            x = await case_class(pg, cdp, 'name', '2026-03-09', {'cid': 'pe_y1s2', 'week': 3, 'swim': False}, -0.4, ('first', 'narr'))
            if x:
                sn = x['r']['snap'] or {}; h = (sn.get('here') or {}).get('yu') or {}
                info('name Alison 在場／認識', J(h))
                check('name ⑩ 下課：done', x['r1']['st'] == 'done', J(x['r1']))

        if 'swim' in CASES:
            print('== swim 游泳週（B1 池邊）', flush=True)
            x = await case_class(pg, cdp, 'swim', '2025-11-03', {'cid': 'pe_y1s1', 'week': 10, 'swim': True}, -0.4, ('first', 'narr'))
            if x:
                r0, r1 = x['r0'], x['r1']
                check('swim ⑩ 下課：done、出席 +1、沒有缺席', r1['st'] == 'done' and r1['done'] and r1['attend'] == r0['attend'] + 1 and not r1['abs'], J(r1))

        if 'swim_closed' in CASES:
            print('== swim_closed 游泳週、B1 休館（第四個星期一）', flush=True)
            x = await case_class(pg, cdp, 'swim_closed', '2025-11-24', {'cid': 'pe_y1s1', 'week': 13, 'swim': False}, -0.4, ('first',), closed=True)
            if x:
                check('swim_closed ⑩ 下課：done', x['r1']['st'] == 'done', J(x['r1']))
                info('swim_closed [稿對照]', '稿第 3 節這一句是「B1 還沒開放（closed_b1）」用的；第 13 週已經下水三週了，「下週下水。」——給 AA 看')

        if 'late' in CASES:
            print('== late 遲到 1～15 分鐘', flush=True)
            x = await case_class(pg, cdp, 'late', '2025-12-01', {'cid': 'pe_y1s1', 'week': 14, 'swim': True}, 0.03, ('first',))
            if x:
                r0, r1 = x['r0'], x['r1']
                lm = [t for t in x['texts'] if '後面有位子' in t]
                info('late 走進去那一刻的遲到分鐘', '下課後 lateMin 不準（整堂課）；老師那一句「後面有位子」：%s' % J(lm))
                check('late ⑩ 遲到 1～15 分鐘：記遲到（R.late）、出席 +1、done、沒有缺席（R.abs）', r1['done'] and r1['late'] and r1['attend'] == r0['attend'] + 1 and not r1['abs'], J(r1))
                check('late ⑥ 遲到也照說這週的旁白', any(t == DOC['pe_y1s1'][13] for t in x['texts']), J(x['texts'][:8]))

        if 'absent' in CASES:
            print('== absent 沒去', flush=True)
            fh = await find_class(pg, '2025-11-10')
            ok = check('absent 前置：2025-11-10 有體育課（pe_y1s1 第 11 週）', bool(fh.get('it')) and fh['it']['id'] == 'pe_y1s1' and fh['it']['week'] == 11, J(fh))
            if ok:
                h = fh['it']['t0'] - 0.2
                st = {'zone': 'campus', 'hour': h, 'day': fh['day'], 'weekday': fh['wd'], 'weather': 'clear', 'flags': dict(FLAGS), 'pos': {'x': 74, 'z': 40, 'yaw': 0}, 'stage': 'law', 'energy': 90, 'money': 20000}
                await load(pg, cdp, st, '2025-11-10 %.2f 時（上課 %.2f–%.2f）、校園 (74,40)，不去體育館' % (h, fh['it']['t0'], fh['it']['t1']))
                a = {'key': fh['it']['key'], 'cid': fh['it']['id']}
                r0 = await pg.evaluate(js(REC, a)); print('  一開始：%s' % J(r0), flush=True)
                t0 = time.time(); r1 = r0
                while time.time() - t0 < 1200:
                    s = await pg.evaluate(ST)
                    if s['choices']:
                        print('  [選項] %s → 選最後一個（不去）' % J(s['choices']), flush=True)
                        await L.tap(pg, cdp, '#choices button:last-child'); await pg.wait_for_timeout(900); continue
                    if s['dlg']:
                        print('  %-6s %s' % (s['name'] or '（旁白）', s['text'][:60]), flush=True)
                        await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(700); continue
                    r1 = await pg.evaluate(js(REC, a))
                    if r1['st'] == 'missed' or r1['hour'] > fh['it']['t1'] + 0.1: break
                    await pg.wait_for_timeout(5000)
                await pg.wait_for_timeout(1500); r1 = await pg.evaluate(js(REC, a))
                print('  等到 %.0f 秒後：%s' % (time.time() - t0, J(r1)), flush=True)
                check('absent ⑩ 沒去：狀態「沒去」（missed）、沒有 done、出席不加', r1['st'] == 'missed' and not r1['done'] and r1['attend'] == r0['attend'], J(r1))
                check('absent ⑩ 今天的課表寫「沒去」', '沒去' in (r1['today'] or ''), r1['today'][:160])
                rs = r1.get('roll') or {}
                if rs.get('rollWeek'):
                    check('absent ⑩ 這週是點名週：點名缺一次（rollStat.missed ≥1）', (rs.get('missed') or 0) >= 1, J(rs))
                else:
                    info('absent ⑩ 點名', '這週不是點名週（不算缺）：%s' % J(rs))
                await pg.screenshot(path=os.path.join(OUT, 'absent_after.png'))

        if 'econ_card' in CASES:
            # AA_644 第 6 節（企劃線 27c0193e9；開發 d5138cd27）：舊序章系所快轉第一次跨過體育課（pe_y0s1，週三 pm2），日期卡多一句 ECONFF.PE_FF，整段只出一次。
            # 日期卡＝GM.titleCard(text, sub, ms) → #title3 的 innerHTML＝text＋<small>sub</small>，sub 裡多句用 <br> 接（econff3d.js S.peAdd）
            print('== econ_card 舊序章系所快轉 9/2 → 9/13：日期卡的體育課那一句（正常網址，事件接事件照跑）', flush=True)
            u = URL + ('&' if '?' in URL else '?') + 'cc_econ_card'
            await pg.goto(u); check('econ_card：遊戲載入（正常網址，沒有 nofastecon）', await L.wait_loaded(pg))
            await pg.evaluate("localStorage.clear()")
            await pg.evaluate(CARD_REC)
            d = await pg.evaluate("STORY.dayOfKey('2024-09-02')")
            F = dict(ECON0); F.pop('ECONFF', None)
            st = {'stage': 'econ', 'name': '祐廷', 'day': d, 'weekday': 1, 'hour': 7.6, 'zone': 'dorm', 'pos': None, 'weather': 'clear', 'energy': 100, 'money': 20000,
                  'flags': F, 'contacts': {k: d - 8 for k in ('kexin', 'econ_zhengxun', 'econ_weilun', 'econ_tangrui', 'econ_jiahao', 'econ_pinyu')},
                  'events': {'done': {}, 'last': {}, 'count': 0}}
            print('  [前置／捷徑] 讀檔：2024-09-02（一）07:36 舊序章系所男宿（E01_MORNING 以後、ECONFF 還沒開始；條件事件、手機照開；網址沒有 nofastecon）', flush=True)
            print('  [前置／記錄] 頁面裡掛 MutationObserver 看 #title3（日期卡）、包一層 GAME.titleCard 只記參數（不改行為）', flush=True)
            await L.load_state(pg, st)
            ff0 = await pg.evaluate("(()=>{ const G=GAME.G; return {ffOn:typeof ECONFF!=='undefined'&&ECONFF.on?!!ECONFF.on(G):null, PE_FF:typeof ECONFF!=='undefined'?ECONFF.PE_FF||null:null}; })()")
            check('econ_card 前置：讀檔後事件接事件開著（ECONFF.on）', ff0['ffOn'] is True, J(ff0))
            info('econ_card 遊戲的 ECONFF.PE_FF', J(ff0['PE_FF']))
            UNTIL = "(()=>{ const G=GAME.G, k=CALENDAR.dateOf(G.day).key, e14=!!(G.events&&G.events.done&&G.events.done.ev_y0_e14); return (e14||k>'2024-09-13')&&!GAME.E.player.busy&&!GAME.D.active; })()"
            t0 = time.time(); talk = []; last = None; reached = False
            while time.time() - t0 < 1200:
                if await pg.evaluate(UNTIL): reached = True; break
                s2 = await L.state(pg)
                if s2.get('choices'):
                    print('  [選項] %s → 選第一個' % J(s2['choices']), flush=True)
                    await L.tap(pg, cdp, '#choices button:nth-child(1)')
                elif s2.get('dlg'):
                    tx = (s2.get('dtext') or '').strip()
                    if tx and tx != last: talk.append(tx); last = tx; print('  對話 %s' % tx[:70], flush=True)
                    await L.tap(pg, cdp, '#dlg')
                elif await pg.evaluate("!!(GAME.phoneIsOpen&&GAME.phoneIsOpen())"):
                    n = await L.phone_away(pg, cdp); print('  ［手機自己跳出來 → 收起來／跳過 %d 次］' % n, flush=True)
                await pg.wait_for_timeout(700)
            await pg.wait_for_timeout(1500)
            cards = await pg.evaluate("window.__CARDS||[]")
            fin = await pg.evaluate(r"""(()=>{ const G=GAME.G, R=CLS.rec(G), F=G.flags||{}; const pe=Object.keys(R.done).filter(k=>/:pe_y0s1:/.test(k)).map(k=>({k, d:CALENDAR.dateOf(+k.split(':')[0]).key, skip:!!(R.note||{})['skip_'+k]}));
              return {key:CALENDAR.dateOf(G.day).key, hour:+(+G.hour).toFixed(2), zone:G.zone, e14:!!(G.events&&G.events.done&&G.events.done.ev_y0_e14), pe, ffPe:(F.ECONFF||{}).pe||null}; })()""")
            print('  跑到：%s（%.0f 秒）' % (J(fin), time.time() - t0), flush=True)
            for c in cards: print('  日期卡 %s｜%s｜%s' % (c['src'], c['text'], J(c['sub'])), flush=True)
            await pg.screenshot(path=os.path.join(OUT, 'econ_card_end.png'))
            check('econ_card 快轉照遊戲流程跑到 9/13（保齡球 ev_y0_e14）或更後面', reached and (fin['e14'] or fin['key'] > '2024-09-13'), J(fin))
            dom = [c for c in cards if c['src'] == 'dom']; src = dom if dom else [c for c in cards if c['src'] == 'call']
            info('econ_card 日期卡來源', '用 %s（#title3 %d 張、titleCard 呼叫 %d 次）' % ('#title3' if dom else 'titleCard 參數', len(dom), len(cards) - len(dom)))
            subs = [x for c in src for x in c['sub']]
            n_pe = sum(1 for x in subs if x == PE_FF) + sum(1 for x in talk if x == PE_FF)
            check('econ_card 日期卡那一句「%s」逐字出現 1 次（不是 0 次、不是 2 次）' % PE_FF, n_pe == 1, '%d 次；日期卡：%s' % (n_pe, J([(c['text'], c['sub']) for c in src])))
            econ_doc = set()
            for t in DOC['pe_y1s1'][:8]:
                for a in ('舊序章同學', '舊序章同學', '有人'):
                    econ_doc.add(t.replace('阿哲', a).replace('柏翰', a))
            other = [x for x in subs + talk if x != PE_FF and ('體育' in x or '暖身' in x or x in econ_doc)]
            check('econ_card 同一段快轉裡沒有別的體育課句子（日期卡、對話）', not other, J(other))
            pd = sorted(q['d'] for q in fin['pe'])
            check('econ_card 跨過的 9/4、9/11 體育課都自動算出席（skip 記號）', '2024-09-04' in pd and '2024-09-11' in pd and all(q['skip'] for q in fin['pe'] if q['d'] <= '2024-09-13'), J(fin['pe']))
            check('econ_card 只出一次的記號（G.flags.ECONFF.pe＝1）', fin['ffPe'] == 1, J(fin['ffPe']))
            hit = [c for c in src if PE_FF in c['sub']]
            if hit: info('econ_card 那一句在哪一張日期卡', J(hit[0]))

        if 'econ_ff' in CASES:
            # 舊序章系所 9/2～10/31 是「事件接事件」（src/econff3d.js ECONFF.on：stage econ、E01_MORNING、沒有 Y0_MOVED_OUT）：
            # 玩家空下來 1.5 秒就黑幕跳到下一個事件，中間的課自動算出席（R.note['skip_'+key]）——PE644 第一次跑 econ 就是這樣跳到 9/12 21:00
            print('== econ_ff 舊序章系所那一年、照正常網址（事件接事件）：記錄體育課會不會被跳過', flush=True)
            fh = await find_class(pg, '2024-09-11', 'econ')
            if fh.get('it'):
                h = fh['it']['t0'] - 0.4; F = dict(FLAGS); F.update(ECON0)
                st = {'zone': 'campus', 'hour': h, 'day': fh['day'], 'weekday': fh['wd'], 'weather': 'clear', 'flags': F, 'pos': DOOR_SOUTH, 'stage': 'econ', 'energy': 90, 'money': 20000}
                await load(pg, cdp, st, '2024-09-11 %.2f 時、體育館門口南邊、stage=econ（正常網址）' % h)
                ff = await pg.evaluate(js(r"""(k=>{ const G=GAME.G, R=CLS.rec(G); return {ffOn:typeof ECONFF!=='undefined'&&ECONFF.on?!!ECONFF.on(G):null, day:G.day, hour:+(+G.hour).toFixed(2), done:!!R.done[k], skipNote:!!(R.note||{})['skip_'+k]}; })(__A__)""", fh['it']['key']))
                print('  讀檔 9 秒後：%s' % J(ff), flush=True)
                info('econ_ff [稿對照] 正常玩舊序章系所那一年，體育課是被「事件接事件」自動算出席、不演的',
                     '事件接事件=%s；體育課 done=%s、自動出席記號 skip=%s、時間跳到 day %s %.2f 時（讀檔 day %s %.2f 時）' % (ff['ffOn'], ff['done'], ff['skipNote'], ff['day'], ff['hour'], fh['day'], h))
                await pg.screenshot(path=os.path.join(OUT, 'econ_ff_after_load.png'))

        if 'econ' in CASES:
            print('== econ 舊序章系所那一年（網址加 ?nofastecon：關掉事件接事件，才走得到門口上體育課）', flush=True)
            u = URL + ('&' if '?' in URL else '?') + 'nofastecon'
            print('  [前置／捷徑] 重新載入 %s（econff3d.js 給測試舊流程用的開關；正常玩不會這樣）' % u, flush=True)
            await pg.goto(u); check('econ：遊戲載入（nofastecon）', await L.wait_loaded(pg))
            await pg.evaluate("localStorage.clear(); STORY.phoneAuto=()=>{}")
            x = await case_class(pg, cdp, 'econ', '2024-09-11', {'cid': 'pe_y0s1', 'week': 2, 'swim': False}, -0.4, ('first', 'narr'), stage='econ', flags=ECON0,
                                 meet=ECON_FRIENDS, names=ECON_NAMES, friends=ECON_FRIENDS, rename=True)
            if x:
                law = [t for t in x['texts'] if any(n in t for n in ('阿哲', '柏翰', '明軒', 'Alison', '芯慈', '宥辰'))]
                check('econ ⑥ 旁白、對話裡沒有法律系同學的名字', not law, J(law))
                fr = [q['id'] for q in (x['r']['snap'] or {}).get('people', []) if q['friend']]
                check('econ ⑧ 站進半圈的只有舊序章系所的同學', all(i in ECON_FRIENDS for i in fr), J(fr))
                check('econ ⑩ 下課：done', x['r1']['st'] == 'done', J(x['r1']))
                info('econ [稿對照]', '稿只寫「名字改成舊序章系所的同學（舊序章同學、舊序章同學）」，沒寫阿哲、柏翰各換誰；遊戲：阿哲→舊序章同學、柏翰→舊序章同學（LAWWW 註「給 AA 確認」）')

        check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS[:10])), flush=True)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
