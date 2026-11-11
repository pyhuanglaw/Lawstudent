"""CC（帳號 A）11-11：L118D_A／L118D_B——118 巷九間店改名改菜單＋兩間外帶飲料店（L118-SHOPS-REDO-1111，USER_WANTS X338；
使用者規格 docs/handoff/user_specs/L118_SHOPS_REDO_1111.md；BB_335 驗收清單 A、B 節）。Playwright 手機模擬（橫向 844×390）≠ iPhone 實機。

A 名稱（畫面上抽字，不是讀資料）：
  在畫面上真的顯示的 DOM 掛 MutationObserver（#dlgText＋#dlgName、#choices、#interactLabel、#clockZ（左上角的地點）、#toast、#caption、#phoneBody），
  每一段顯示過的字都記下來（打字效果的半句併成一句）；最後彙總「畫面上出現的店名、菜名」清單，對舊名表歸零（舊店名九個＋簡稱；舊菜名來自線上版 779ddd650 的
  src/data/lane118_shops.js，扣掉和新菜單撞名的：石鍋拌飯、青醬培根麵、美式咖啡、拿鐵、排骨飯、自助餐（三菜一肉））。
  每間店逐項：店門口互動鍵「進{新店名}（{類型}）」（飲料店＝「{新店名}（…）」）、左上角地點「{新店名}（118 巷）」、室內「點餐（{新店名}）」、「離開{新店名}」、
  點餐選單（按「不用了」不買）；手機「地點」頁（快速前往）在巷子裡、每間店裡各抽一次。
  邀約選單、熟客招呼（AA_311 第 2 節三段）、午餐邀約的 {店名}：本探針不觸發——交給 E 探針（X339 午餐邀約）。
B 菜單：
  每間店的每一樣點一次（點畫面上的選項，觸控）：選項上的標價＝規格表的價錢＝扣的錢（點前、點完那一句、整段演完各記 GAME.G.money 和右上角 #money）；
  錢不夠：【前置】把錢設成比最便宜那樣少 1 元 → 選項是灰的（.dim）、點了出「錢不夠」、錢不變、不會變負；大學食堂（cafe2）三個份量 100／130／160；
  喝不喝咖啡（drink_a）7 樣、果茶社（drink_b）6 樣在店門口點：記互動點位置、站在那裡時範圍內有幾個互動點（候選）、畫面上的互動鍵是哪一個、
  它是不是最上層（elementFromPoint）、點下去回話的是哪一間店（招呼那一句）。
  每點完一樣，遊戲時間會往前走（一餐 40 分鐘）：【前置／捷徑】把 GAME.G.hour 設回 HOUR，才點得到下一樣（營業時間內）。
走路：每間店【前置】讀檔到那間店門口附近的人行道（離店門互動點約 4 m）→ 搖桿（CDP 觸控按在 #joy）走進互動範圍；搖桿推不動才改點地面（playlib.go_to，也是觸控），會印出來。
讀檔、設時間、設錢＝【前置／捷徑】，輸出有標。不用 ?turbo、不瞬移。
環境變數：
  PARTS  A、B 或 A,B（預設 A,B；同一間店兩段都跑時只進店一次）
  SHOPS  逗號分隔（預設全部 11 間：dian,self,tea,home,cafe2,pasta,korea,omu,noodle2,drink_a,drink_b）
  DATE   日期（預設自動挑：學期中的週三、不是假日、不是颱風假，2025-09-24 起；九間店週三都有開——週二 118牛排休、週一義大麵屋和奈良咖哩休、週四披薩休）
  HOUR   預設 12.17（12:10）
  PHONE  1＝A 段抽手機「地點」頁（預設 1）
  LOOKS  1＝A 段在店裡走到每一個「看的東西」（配置的 interact：湯桶、配菜櫃、窯爐…）按一下，抽旁白的字（預設 1）；
         逐字表寫到 <out>/looks_table.md（也印在 log），提到舊店內容的標「⚠舊內容？」（關鍵字比對）
  SIGNS  1＝A 段拍模型上畫的字（菜單牌、價目表、招牌、海報；DOM 抽不到）：【捷徑機位】獨立擺鏡頭、藏 HUD、1280×720，
         檔名 <out>/sign_<店>_<物件>.png（預設 1）。物件位置：場景裡名字或材質像「有字的板面」的網格（*_print、SIGN_FACE、VSIGN_FACE、
         ABOARD／MENU_FACE、menubox、signbox、price、poster、招牌 atlas），三角形依距離分群、每群拍一張；另外每間一定拍
         巷子：店面正面（sign_<店>_facade）、店面下半部近照（sign_<店>_front）；店內：門口往裡（sign_<店>_wide_in）、最裡面往門口（sign_<店>_wide_out）
  QUIET  1＝讀檔時關條件事件和手機自動打開（預設 1；118 巷點餐不是條件事件，照演）
  PORTRAIT 1＝直向 390×844（預設橫向，和 tests/flow_l118_shops.py 一樣）
  ITEMS_MAX 只點每間的前 N 樣（預設 0＝全部；雲端自檢用，正式跑不要設）
用法：LW_TESTS=<worktree>/tests SHA=<sha> PARTS=A SHOPS=dian,self python3 cc_l118d_ab_probe.py <url> <out>"""
import os, sys, re, json, time, math, asyncio
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests')
import playlib as L
from playwright.async_api import async_playwright

URL = sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8765/index.html'
OUT = sys.argv[2] if len(sys.argv) > 2 else 'out_l118d'
os.makedirs(OUT, exist_ok=True)
J = lambda o: json.dumps(o, ensure_ascii=False)
PARTS = [p.strip().upper() for p in (os.environ.get('PARTS') or 'A,B').split(',') if p.strip()]
ALL = ['dian', 'self', 'tea', 'home', 'cafe2', 'pasta', 'korea', 'omu', 'noodle2', 'drink_a', 'drink_b']
SHOPS = [s.strip() for s in (os.environ.get('SHOPS') or ','.join(ALL)).split(',') if s.strip()]
HOUR = float(os.environ.get('HOUR') or 12.17)
PHONE = (os.environ.get('PHONE') or '1') == '1'
LOOKS = (os.environ.get('LOOKS') or '1') == '1'
SIGNS = (os.environ.get('SIGNS') or '1') == '1'
QUIET = (os.environ.get('QUIET') or '1') == '1'
PORTRAIT = (os.environ.get('PORTRAIT') or '0') == '1'
ITEMS_MAX = int(os.environ.get('ITEMS_MAX') or 0)   # 0＝每一樣都點（正式跑）；雲端自檢可以只點前幾樣
MONEY0 = 5000
DATES = [os.environ['DATE']] if os.environ.get('DATE') else ['2025-09-24', '2025-10-01', '2025-10-15', '2025-10-22', '2025-10-29', '2025-11-05']

# ---- 規格（使用者原文 L118_SHOPS_REDO_1111.md 第一、二節；飲料店名照最後的補充）：不讀遊戲資料，拿來對畫面 ----
SPEC = {
    'dian': ('118牛排', '夜市鐵板牛排', [('鐵板牛排', 190), ('雪花牛排', 230), ('雞排', 180), ('豬排', 170), ('雙拼', 280)]),
    'self': ('水上便當', '雞腿、雞排便當', [('炸雞腿飯', 145), ('雞排飯', 135), ('滷雞腿飯', 130), ('排骨飯', 125), ('雙拼', 165)]),
    'tea': ('辛亥韓食', '韓式鍋物、鐵板烤肉', [('泡菜鍋', 190), ('海鮮豆腐鍋', 210), ('鐵板豬肉', 200), ('鐵板牛肉', 230), ('石鍋拌飯', 180)]),
    'home': ('五湖四海', '水餃店', [('高麗菜水餃10顆', 80), ('韭菜水餃10顆', 85), ('酸辣湯', 45), ('玉米濃湯', 45)]),
    'cafe2': ('大學食堂', '秤重自助餐', None),   # 秤重：規格只寫一餐約 100–160；BB_335 第 6 條：三個份量 100／130／160
    'pasta': ('義大麵屋', '平價義大利麵', [('番茄肉醬麵', 170), ('奶油雞肉麵', 190), ('青醬培根麵', 190), ('蒜香蛤蜊麵', 210)]),
    'korea': ('清州刀削麵', '刀削麵館', [('牛肉刀削麵', 190), ('番茄刀削麵', 150), ('木須炒刀削麵', 170), ('炸醬刀削麵', 140)]),
    'omu': ('奈良咖哩', '日式咖哩飯', [('豬排咖哩', 190), ('雞肉咖哩', 180), ('牛肉咖哩', 210), ('可樂餅咖哩', 170)]),
    'noodle2': ('迪倫窯烤披薩', '個人窯烤披薩', [('瑪格麗特', 180), ('夏威夷', 200), ('燻雞蘑菇', 210), ('四種起司', 230)]),   # 規格「個人尺寸瑪格麗特」：品名不含「個人尺寸」也算對（印出來給 BB 判）
    'drink_a': ('喝不喝咖啡', None, None),   # 傳統台式手搖飲兼賣咖啡，約 $30–75
    'drink_b': ('果茶社', None, None),       # 水果茶與鮮果飲（多多系列），約 $50–95
}
CAFE2_PRICES = [100, 130, 160]
DRINK_RANGE = {'drink_a': (30, 75, 7, r'咖啡|拿鐵'), 'drink_b': (50, 95, 6, r'多多')}
OLD_SHOP_NAMES = ['滇香小館', '好家自助餐', '一一八茶飲', '巷口家常菜', '慢讀咖啡', 'Pasta 118', '韓食小廚', '蛋包飯研究所', '六張犁麵舖']
OLD_SHORT = ['滇香', '滇緬', '好家', '一一八', '家常菜', '慢讀', '韓食小廚', '蛋包飯', '六張犁']   # 簡稱（tests/l118_old_names_zero_unit.js 的 NAMES）
# 舊菜名：git show 779ddd650:src/data/lane118_shops.js 的九間 menu（扣掉新菜單也有的：石鍋拌飯、青醬培根麵、美式咖啡、拿鐵、排骨飯、自助餐（三菜一肉））
OLD_ITEMS = ['椒麻雞飯', '酸辣河粉', '打拋豬飯', '自助餐（兩菜一雞腿）', '加滷蛋', '紅茶拿鐵', '檸檬綠', '無糖綠茶', '雞腿便當', '番茄炒蛋（單點）', '今日蛋糕',
             '白醬雞肉麵', '番茄海鮮麵', '泡菜豆腐鍋', '海苔飯捲', '咖哩蛋包飯', '番茄醬蛋包飯', '牛肉麵', '乾麵＋滷蛋', '餛飩湯',
             '椒麻雞', '打拋豬', '兩菜一雞腿', '大碗加蛋', '番茄炒蛋']   # 後四個是 l118_old_names_zero_unit.js 的 ITEMS 裡的簡寫
SKIP = [('檸檬綠茶', '檸檬綠'), ('慢慢讀', '慢讀')]   # 撞字：果茶社的「檸檬綠茶」、「點杯咖啡慢慢讀」——遮掉再比
BASE = {'introDone': True, 'campusIntro': True, 'readCase': 'full', 'classDone': True, 'afternoonDone': True, 'metAn': True, 'zheNoodleDone': True,
        'KX_FIRST_MSG': True, 'KX_EVE_MSG': True, 'FAM_GROUP_SENT': True, 'CEREMONY_Y1': True, 'KAI_MOVEIN': True, 'LAW_RECAP_SEEN': True, 'fundsV2': 1, 'L118_FIRST_SENT': True}
R = L.Run('l118d_ab', OUT)

# ---- 畫面上的字：MutationObserver（看得到的才記；打字效果的半句併成一句）----
OBS_JS = r"""(()=>{ if(window.__ccObs) return window.__ccTxt.length; const T=window.__ccTxt=[]; const last={};
  const ids=['dlgText','choices','interactLabel','clockZ','toast','caption','phoneBody'];
  const shown=e=>{ let x=e; while(x&&x!==document.body){ if(x.classList&&x.classList.contains('hide')) return false; const cs=getComputedStyle(x); if(cs.display==='none'||cs.visibility==='hidden') return false; x=x.parentElement; } return e.getClientRects().length>0; };
  const grab=(id,e)=>id==='choices'?[...e.querySelectorAll('button')].filter(b=>b.getClientRects().length).map(b=>(b.innerText||'').replace(/\s+/g,' ').trim()).join(' ｜ '):(e.innerText||e.textContent||'').replace(/[ \t]+\n/g,'\n').trim();
  for(const id of ids){ const e=document.getElementById(id); if(!e) continue;
    const rec=()=>{ if(!shown(e)) return; const t=grab(id,e); if(!t) return; const nm=id==='dlgText'?((document.getElementById('dlgName')||{}).textContent||'').trim():'';
      const G=typeof GAME!=='undefined'?GAME.G:null, m=G?G.money:null;   /* m：這段字出現在畫面上那一刻的 GAME.G.money（「你點了…」那一句出來時扣了多少）*/
      const L=last[id]; if(L&&L.nm===nm&&(t===L.t||t.startsWith(L.t))&&T.length-L.i<6){ L.t=t; T[L.i].t=t; return; }
      T.push({id,nm,t,m,zone:G?G.zone:'',h:G?+(+G.hour).toFixed(2):null}); last[id]={i:T.length-1,t,nm}; };
    new MutationObserver(rec).observe(e,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class','style']}); rec(); }
  window.__ccObs=true; return T.length; })()"""
TXT_FROM = "(n=>(window.__ccTxt||[]).slice(n))"
IT_JS = r"""(()=>{ const b=document.getElementById('interact'), lb=document.getElementById('interactLabel'); if(!b) return {shown:false,t:''};
  const cs=getComputedStyle(b), shown=!b.classList.contains('hide')&&cs.display!=='none'&&cs.visibility!=='hidden'&&b.getClientRects().length>0; let top=null;
  if(shown){ const r=b.getBoundingClientRect(), h=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2); top=h?(h===b||b.contains(h)?'interact':(h.id||h.className||h.tagName)):null; }
  const n=[...document.querySelectorAll('#interact')].filter(x=>!x.classList.contains('hide')&&x.getClientRects().length).length;
  return {shown, t:shown?((lb||b).textContent||'').trim():'', top, n}; })()"""
CHOICES_JS = r"""(()=>{ const ch=document.getElementById('choices'); if(!ch||ch.classList.contains('hide')) return []; return [...ch.querySelectorAll('button')].filter(b=>b.getClientRects().length).map((b,i)=>({i,t:(b.innerText||'').replace(/\s+/g,' ').trim(),dim:b.classList.contains('dim')})); })()"""
TAP_CHOICE_JS = r"""(i=>{ const b=[...document.querySelectorAll('#choices button')].filter(b=>b.getClientRects().length)[i]; if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })"""
MONEY_JS = r"""(()=>({g:GAME.G.money, hud:((document.getElementById('money')||{}).textContent||'').trim()}))()"""
CLOCKZ_JS = r"""(()=>((document.getElementById('clockZ')||{}).textContent||'').trim())()"""
NEAR_JS = r"""(()=>{ const E=GAME.E, P=E.player.obj.position; return E.interactables.filter(i=>!i.hidden&&Math.hypot(i.x-P.x,i.z-P.z)<(i.radius||1.8)).map(i=>({label:i.label||'',d:+Math.hypot(i.x-P.x,i.z-P.z).toFixed(2),r:i.radius||1.8,prio:i.prio||0,x:+i.x.toFixed(2),z:+i.z.toFixed(2)})); })()"""
DOOR_JS = r"""(id=>{ const its=GAME.E.interactables.filter(i=>i.shop118===id||(i.exit&&i.exit.to==='l118_'+id)); return its.map(i=>({x:i.x,z:i.z,r:i.radius||1.4,label:i.label,hidden:!!i.hidden,enter:!!i.exit})); })"""
LOOKS_JS = r"""(()=>{ const sid=(GAME.G.zone||'').replace(/^l118_/,''), LY=(typeof L118_SHOP_LAYOUTS!=='undefined'&&L118_SHOP_LAYOUTS[sid])||{interact:[]};
  return GAME.E.interactables.filter(i=>i.look&&!i.seat&&!i.exit&&!i.shop118&&!i.hidden&&!i.npc).map(i=>{ const q=(LY.interact||[]).find(q=>Math.abs(q.x-i.x)<0.01&&Math.abs(q.z-i.z)<0.01)||{};
    return {x:i.x,z:i.z,r:i.radius||0.8,label:i.label||'',id:q.id||'',data:typeof i.look==='string'?i.look:''}; }); })()"""
# 有字的板面：名字或材質（INTERIOR_FACE＝店內景深卡，沒有字，不算）
SIGN_FIND_JS = r"""(rg=>{ const E=GAME.E, re=/print|SIGN_FACE|VSIGN_FACE|ABOARD|MENU_FACE|menubox|signbox|price|poster|menu|board|signs_atlas|small_atlas/i;
  const v=new THREE.Vector3(), tris=[];
  E.scene.traverse(o=>{ if(!o.isMesh||o.isInstancedMesh||!o.geometry||!o.geometry.attributes.position) return; let x=o, vis=true; while(x){ if(!x.visible){ vis=false; break; } x=x.parent; } if(!vis&&!rg.all) return;   /* 店內（rg.all）：牆淡出時板面也跟著藏，照樣算 */
    const mn=[].concat(o.material).map(m=>(m&&m.name)||'').join(','); if(!re.test(o.name+' '+mn)||/INTERIOR_FACE/.test(o.name)) return;
    o.updateWorldMatrix(true,false); const P=o.geometry.attributes.position, I=o.geometry.index, n=I?I.count:P.count; const nm=(o.name||mn||'mesh').replace(/[^A-Za-z0-9_]+/g,'_');
    for(let k=0;k+2<n&&k<60000;k+=3){ const b=[1e9,1e9,1e9,-1e9,-1e9,-1e9]; for(let j=0;j<3;j++){ v.fromBufferAttribute(P,I?I.getX(k+j):k+j).applyMatrix4(o.matrixWorld); b[0]=Math.min(b[0],v.x); b[1]=Math.min(b[1],v.y); b[2]=Math.min(b[2],v.z); b[3]=Math.max(b[3],v.x); b[4]=Math.max(b[4],v.y); b[5]=Math.max(b[5],v.z); }
      const cx=(b[0]+b[3])/2, cz=(b[2]+b[5])/2; if(cx<rg.x0||cx>rg.x1||cz<rg.z0||cz>rg.z1) continue; tris.push({b,nm}); } });
  const cl=[], g=0.2;   /* 依距離分群：外框（放寬 0.2 m）碰到就併 */
  for(const t of tris){ let hit=null; for(const c of cl){ const a=c.b, b=t.b; if(a[0]-g<=b[3]&&b[0]<=a[3]+g&&a[1]-g<=b[4]&&b[1]<=a[4]+g&&a[2]-g<=b[5]&&b[2]<=a[5]+g){ hit=c; break; } }
    if(hit){ for(let j=0;j<3;j++){ hit.b[j]=Math.min(hit.b[j],t.b[j]); hit.b[j+3]=Math.max(hit.b[j+3],t.b[j+3]); } hit.n++; hit.nm[t.nm]=1; } else cl.push({b:t.b.slice(),n:1,nm:{[t.nm]:1}}); }
  for(let pass=0;pass<3;pass++) for(let i=0;i<cl.length;i++) for(let j=cl.length-1;j>i;j--){ const a=cl[i].b, b=cl[j].b; if(a[0]-g<=b[3]&&b[0]<=a[3]+g&&a[1]-g<=b[4]&&b[1]<=a[4]+g&&a[2]-g<=b[5]&&b[2]<=a[5]+g){ for(let k=0;k<3;k++){ a[k]=Math.min(a[k],b[k]); a[k+3]=Math.max(a[k+3],b[k+3]); } cl[i].n+=cl[j].n; Object.assign(cl[i].nm,cl[j].nm); cl.splice(j,1); } }
  return cl.map(c=>({nm:Object.keys(c.nm).join('+').slice(0,40), n:c.n, c:[(c.b[0]+c.b[3])/2,(c.b[1]+c.b[4])/2,(c.b[2]+c.b[5])/2], s:[c.b[3]-c.b[0],c.b[4]-c.b[1],c.b[5]-c.b[2]]}))
    .filter(c=>Math.max(c.s[0],c.s[1],c.s[2])>=0.12).sort((a,b)=>Math.max(b.s[0],b.s[2])*b.s[1]-Math.max(a.s[0],a.s[2])*a.s[1]); })"""
# 【捷徑機位】：鏡頭擺到 e、看 l；藏人物、藏 HUD（只留 canvas），等幾幀再拍
SIGN_CAM_JS = r"""(async(e,l)=>{ const E=GAME.E; E.cinematic(new THREE.Vector3(...e),new THREE.Vector3(...l)); E.camera.position.set(...e); E.cam.look=new THREE.Vector3(...l); E.camera.lookAt(E.cam.look);
  if(!window.__ccHid){ window.__ccHid=[E.player.obj,...E.npcs.map(n=>n.obj)].filter(o=>o&&o.visible); window.__ccHid.forEach(o=>o.visible=false); }
  if(!document.getElementById('__ccSignCss')){ const st=document.createElement('style'); st.id='__ccSignCss'; st.textContent='*{visibility:hidden!important}'; document.head.appendChild(st); E.renderer.domElement.style.setProperty('visibility','visible','important'); }   /* 只留 3D 畫面的 canvas（小地圖也是 canvas，要藏）*/
  const f0=E.frame; for(let i=0;i<240&&E.frame<f0+5;i++) await new Promise(r=>setTimeout(r,200)); return E.frame-f0; })"""
SIGN_END_JS = r"""(()=>{ const E=GAME.E; (window.__ccHid||[]).forEach(o=>o.visible=true); window.__ccHid=null; const st=document.getElementById('__ccSignCss'); if(st) st.remove(); E.renderer.domElement.style.removeProperty('visibility'); E.endCinematic(); return true; })()"""
OLD_LOOK_KW = ['書架', '漫畫', '念書', '讀書', '桌位', '咖啡店', '咖啡廳', '自習', '書本', '小說']   # 舊店內容（慢讀咖啡的書架、漫畫、念書位…）
LOOK_ROWS = []     # 「看的東西」逐字表
INSIDE_JS = r"""(()=>{ const its=GAME.E.interactables; const o=its.find(i=>i.shop118); const x=its.find(i=>i.exit&&i.exit.to==='lane118'); return {order:o?{x:o.x,z:o.z,r:o.radius||0.8}:null, exit:x?{x:x.x,z:x.z,r:x.radius||0.7}:null}; })()"""
LAYOUT_JS = r"""(()=>{ const L=typeof LANE118_LAYOUT!=='undefined'?LANE118_LAYOUT:null; if(!L) return null; const fw=L.facade.west, fe=L.facade.east;
  return {fw,fe,shops:L.shops.map(s=>({id:s.id,side:s.side,x:s.side==='W'?fw+0.9:fe-0.9,z:(s.z0+s.z1)/2,z0:s.z0,z1:s.z1})), lamps:[-30,-10,10,28].map(z=>[fe-0.35,z])}; })()"""
DAYS_JS = r"""(ks=>ks.map(k=>{ const d=STORY.dayOfKey(k), x=CALENDAR.dateOf(d), t=CALENDAR.termOf(d); return {k,d,wd:x.wd%7,hol:CALENDAR.holiday(d),ty:CALENDAR.typhoon(d),term:t?t.id:null,week:t?t.week:null}; }))"""
OPEN_JS = r"""(()=>{ const G=GAME.G; const sh=(typeof LANE118_SHOPS!=='undefined'?LANE118_SHOPS.shops:[]); return sh.map(s=>({id:s.id, open:typeof L118!=='undefined'&&L118.isOpen?!!L118.isOpen(s.id,G):null, note:typeof SIDEQ!=='undefined'&&SIDEQ.closedNote?SIDEQ.closedNote(G,s.id):null})); })()"""

SEEN = []          # 全部看得到的字（彙總用）
_mark = [0]        # 已經印到第幾筆
STAT = {}          # 每間店的摘要


def norm_spec(n):
    return n.replace('個人尺寸', '')


def old_hits(t):
    s = t
    for a, b in SKIP:
        s = s.replace(a, '〇' * len(a))
    out = []
    for w in OLD_SHOP_NAMES + OLD_SHORT + OLD_ITEMS:
        if w in s:
            out.append(w)
    return out


async def flush(pg, tag):
    """把新出現在畫面上的字逐字印出來（BB 要逐字 log）"""
    new = await pg.evaluate("(%s)(%d)" % (TXT_FROM, _mark[0]))
    for e in new:
        SEEN.append(dict(e, tag=tag))
        t = e['t'] if e['id'] != 'phoneBody' else re.sub(r'\s+', ' ', e['t'])[:500] + ('…（全文存檔）' if len(e['t']) > 500 else '')
        print('  逐字｜%s｜%s｜%s%s｜%s' % (tag, e['zone'], e['id'], ('｜' + e['nm']) if e['nm'] else '', t.replace('\n', ' ⏎ ')), flush=True)
    _mark[0] += len(new)


async def st(pg):
    return await L.state(pg)


async def money(pg):
    return await pg.evaluate(MONEY_JS)


async def it_label(pg, want=None, wait_s=4.0):
    t0 = time.time(); r = await pg.evaluate(IT_JS)
    while want and not r['t'].startswith(want) and time.time() - t0 < wait_s:
        await pg.wait_for_timeout(300); r = await pg.evaluate(IT_JS)
    return r


async def talk_idle(pg, cdp, tag, max_s=60):
    """路上跳出來的對話（不是點餐）：照第一個選項點完"""
    t0 = time.time()
    while time.time() - t0 < max_s:
        s = await st(pg)
        if s['choices']:
            await pg.wait_for_timeout(600); c = await pg.evaluate("(%s)(0)" % TAP_CHOICE_JS)
            if c: await L.touch_tap(cdp, c[0], c[1])
            await pg.wait_for_timeout(800); continue
        if s['dlg']:
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(600); continue
        if not s['busy']: break
        await pg.wait_for_timeout(400)
    await flush(pg, tag)


async def joy_to(pg, cdp, tx, tz, near, label, max_s=150):
    """搖桿（CDP 觸控按 #joy，往鏡頭座標換算的方向推）走到 (tx,tz) near 公尺內；連續 6 次沒有更近就改點地面（L.go_to）。回傳 (到了沒, 方法)"""
    t0 = time.time(); best = 1e9; stall = 0; pushes = 0
    while time.time() - t0 < max_s:
        s = await st(pg)
        if s['dlg'] or s['choices']:
            await talk_idle(pg, cdp, label); continue
        if s.get('paused'):
            await L.close_panels(pg, cdp); await pg.wait_for_timeout(500); continue
        d = math.hypot(tx - s['x'], tz - s['z'])
        if d <= near:
            R.note('搖桿走到「%s」（%.2f m，推 %d 次，%.0f 秒）' % (label, d, pushes, time.time() - t0)); return True, '搖桿'
        if d < best - 0.12: best = d; stall = 0
        else: stall += 1
        if stall >= 6: break
        yaw = s['camYaw']; fx, fz = -math.sin(yaw), -math.cos(yaw); rx, rz = -fz, fx
        ux, uz = (tx - s['x']) / d, (tz - s['z']) / d
        ms = int(min(1100, max(330, d * 420)))
        await L.joystick(pg, cdp, int(38 * (ux * rx + uz * rz)), int(-38 * (ux * fx + uz * fz)), ms); pushes += 1
        await pg.wait_for_timeout(250)
    R.note('「%s」搖桿推不到（推 %d 次、最近 %.2f m），改點地面（L.go_to，也是觸控）' % (label, pushes, best))
    ok = await L.go_to(pg, cdp, R, tx, tz, near, label, max_s=240)
    return ok, '點地面'


async def scene(pg, cdp, tag, pick, max_s=110):
    """點下互動鍵以後的整段：對話點過去；出現選單（兩個以上「… N 元」）時由 pick(選項) 決定點哪一個（回傳索引）；其他選項點第一個。
    回傳 {menu:[{t,dim,name,price}], picked, m_pick（點選單前）, m_line（「你點了」那一句出來時）, m_end, toast:[…]}"""
    res = {'menu': None, 'picked': None, 'm_pick': None, 'm_line': None, 'm_end': None, 'other': []}
    t0 = time.time(); idle = None; mk = (await pg.evaluate("(window.__ccTxt||[]).length"))
    while time.time() - t0 < max_s:
        s = await st(pg)
        if s['choices']:
            idle = None; await pg.wait_for_timeout(650)   # 選項剛出來太快點會被吃掉（game3d.js tapTooSoon）
            opts = await pg.evaluate(CHOICES_JS)
            for o in opts:
                m = re.match(r'^(.+?)\s+(\d+)\s*元', o['t']); o['name'], o['price'] = (m.group(1), int(m.group(2))) if m else (None, None)
            k = 0
            if sum(1 for o in opts if o['price'] is not None) >= 2:
                res['menu'] = opts; res['m_pick'] = await money(pg)
                k = pick(opts)
                res['picked'] = opts[k]['t'] if k is not None and k < len(opts) else None
                if k is None: k = len(opts) - 1
            else:
                res['other'].append([o['t'] for o in opts])
            c = await pg.evaluate("(%s)(%d)" % (TAP_CHOICE_JS, k))
            if c: await L.touch_tap(cdp, c[0], c[1])
            before = [o['t'] for o in opts]
            for _ in range(8):   # 等選項收起來（沒收＝再點一次）
                await pg.wait_for_timeout(300)
                if [o['t'] for o in (await pg.evaluate(CHOICES_JS))] != before: break
            else:
                if c: await L.touch_tap(cdp, c[0], c[1])
            continue
        if s['dlg']:
            idle = None
            if res['picked'] and res['m_line'] is None and '你點了' in (s['dtext'] or ''): res['m_line'] = await money(pg)
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(650); continue
        if not s['busy']:
            idle = idle or time.time()
            if time.time() - idle > 1.6: break
        else: idle = None
        await pg.wait_for_timeout(350)
    res['m_end'] = await money(pg)
    tx = await pg.evaluate("(n=>(window.__ccTxt||[]).slice(n).filter(e=>e.id==='toast').map(e=>e.t))(%d)" % mk)
    res['toast'] = tx
    if res['picked'] and res['m_line'] is None:   # 短句打字很快、可能在兩次檢查之間就點過去了：用畫面上那一句出現那一刻記的錢
        ln = await pg.evaluate("(n=>(window.__ccTxt||[]).slice(n).find(e=>e.id==='dlgText'&&e.t.indexOf('你點了')>=0)||null)(%d)" % mk)
        if ln: res['m_line'] = {'g': ln['m'], 'hud': '（畫面上那一句出現時記的）'}
    await flush(pg, tag)
    return res


async def phone_scan(pg, cdp, tag):
    """手機「地點」頁（快速前往）：抽畫面上的字、存全文"""
    if not await L.tap(pg, cdp, '#btnPhone'):
        R.check('%s 手機按鈕按得到' % tag, False); return None
    await pg.wait_for_timeout(900)
    await L.tap(pg, cdp, '#phoneTabs [data-ptab="places"]'); await pg.wait_for_timeout(1200)
    txt = await pg.evaluate("((document.getElementById('phoneBody')||{}).innerText||'')")
    open(os.path.join(OUT, 'phone_%s.txt' % re.sub(r'\W+', '_', tag)), 'w', encoding='utf-8').write(txt)
    await R.shot(pg, '%s_phone_places' % tag)
    rows = [ln for ln in txt.split('\n') if '118' in ln]
    R.note('%s 手機「地點」有 118 的那幾行：%s' % (tag, J(rows[:8])))
    hits = old_hits(txt)
    R.check('A %s 手機「地點」（快速前往）頁沒有舊店名、舊菜名' % tag, not hits, '命中 %s' % J(hits) if hits else '%d 字' % len(txt))
    await L.tap(pg, cdp, '#btnPhoneClose'); await pg.wait_for_timeout(700)
    await L.close_panels(pg, cdp)
    await flush(pg, tag)
    return txt


def spawn_for(lay, sid):
    """店門口附近的人行道：同一側、離門口 4～5.5 m、離別間店門 2.4 m 以上、離路燈 1.2 m 以上"""
    me = next((s for s in lay['shops'] if s['id'] == sid), None)
    if not me: return None
    x = -3.9 if me['side'] == 'W' else 3.9
    for dz in (4.0, -4.0, 5.0, -5.0, 3.4, -3.4):
        z = me['z'] + dz
        if any(math.hypot(o['x'] - x, o['z'] - z) < 2.4 for o in lay['shops'] if o['id'] != sid): continue
        if any(math.hypot(a - x, b - z) < 1.2 for a, b in lay['lamps']): continue
        yaw = math.atan2(me['x'] - x, me['z'] - z)
        return {'x': x, 'z': z, 'yaw': yaw, 'door': [me['x'], me['z']]}
    return {'x': x, 'z': me['z'] + 4.0, 'yaw': 0.0, 'door': [me['x'], me['z']]}


async def load_at(pg, day, wd, pos, why):
    R.setup('讀檔：%s %s 118 巷 (%.2f, %.2f)，%.2f 點、錢 %d、QUIET=%s（%s）' % (DAY['k'], '週' + '日一二三四五六'[wd % 7], pos['x'], pos['z'], HOUR, MONEY0, QUIET, why))
    await L.load_state(pg, {'zone': 'lane118', 'hour': HOUR, 'day': day, 'weekday': wd, 'weather': 'sunny', 'stage': 'law', 'money': MONEY0, 'flags': BASE,
                            'pos': {'x': pos['x'], 'z': pos['z'], 'yaw': pos['yaw']}}, quiet_events=QUIET, quiet_phone=True)
    for _ in range(30):
        if await pg.evaluate("GAME.G.zone==='lane118'&&!GAME.E.player.busy"): break
        await pg.wait_for_timeout(500)
    await pg.wait_for_timeout(2500); await L.close_panels(pg, cdp_g[0])
    await pg.evaluate(OBS_JS)


cdp_g = [None]
DAY = {}


def menu_check(sid, opts, tag):
    """選單上的品名、價錢對規格（B 第 5、6 條）"""
    name, _, spec = SPEC[sid]
    items = [(o['name'], o['price']) for o in opts if o['price'] is not None]
    R.note('%s 選單（畫面）：%s' % (tag, J([o['t'] + ('［灰］' if o['dim'] else '') for o in opts])))
    if sid == 'cafe2':
        R.check('B %s 大學食堂三個份量 100／130／160' % tag, sorted(p for _, p in items) == CAFE2_PRICES, J(items))
    elif sid in DRINK_RANGE:
        lo, hi, n, must = DRINK_RANGE[sid]
        R.check('B %s %s %d 樣、價錢都在 %d～%d' % (tag, name, n, lo, hi), len(items) == n and all(lo <= p <= hi for _, p in items), J(items))
        R.check('B %s %s 菜單有「%s」' % (tag, name, must), any(re.search(must, nm or '') for nm, _ in items), J([nm for nm, _ in items]))
    else:
        want = [(norm_spec(a), b) for a, b in spec]
        R.check('B %s %s 選單＝規格表（品名、價錢、項數）' % (tag, name), sorted(items) == sorted(want), '預期 %s；實際 %s' % (J(want), J(items)))
    return items


async def order_all(pg, cdp, sid, tag, reenter):
    """B：每一樣點一次＋錢不夠"""
    if not await reenter():
        R.check('B %s 按得到點餐' % tag, False); return None
    first = await scene(pg, cdp, tag + '_menu', lambda o: len(o) - 1)   # 先開一次選單看有哪些（按最後一個「不用了」）
    if not R.check('B %s 點餐有選單' % tag, bool(first['menu']), J(first)):
        return first
    items = menu_check(sid, first['menu'], tag)
    STAT.setdefault(sid, {})['menu'] = items
    if ITEMS_MAX:
        R.note('ITEMS_MAX=%d：只點前 %d 樣（自檢用，不是完整驗收）' % (ITEMS_MAX, ITEMS_MAX))
    for nm, pr in (items[:ITEMS_MAX] if ITEMS_MAX else items):
        await R_hour(pg, '下一樣（%s）' % nm)
        ok = await reenter()
        if not ok:
            R.check('B %s 「%s」：互動鍵還在、按得到' % (tag, nm), False); continue
        res = await scene(pg, cdp, '%s_%s' % (tag, nm), lambda o, nm=nm: next((i for i, x in enumerate(o) if x['name'] == nm), None))
        mp, ml, me = res['m_pick'], res['m_line'], res['m_end']
        if not res['menu'] or not res['picked'] or not res['picked'].startswith(nm):
            R.check('B %s 「%s」點得到（選單上點了它）' % (tag, nm), False, J(res)); continue
        d_line = (mp['g'] - ml['g']) if (mp and ml) else None
        d_end = (mp['g'] - me['g']) if (mp and me) else None
        R.check('B %s 「%s」標價 %d＝扣的錢（點完那一句時）' % (tag, nm, pr), d_line == pr, '點前 %s → 你點了 %s → 演完 %s' % (J(mp), J(ml), J(me)))
        R.check('B %s 「%s」整段演完只扣自己的 %d（玩家只付自己的餐費）' % (tag, nm, pr), d_end == pr, '扣 %s；其他選項 %s' % (d_end, J(res['other'])))
        R.check('B %s 「%s」右上角錢數跟著變（#money＝$%d）' % (tag, nm, me['g']), str(me['g']) in me['hud'].replace(',', ''), me['hud'])
    # 錢不夠
    cheapest = min(p for _, p in items)
    await R_hour(pg, '錢不夠那一次')
    R.setup('把錢設成 %d（比最便宜的 %d 少 1 元；直接改 GAME.G.money，右上角 #money 不會跟著重畫——捷徑造成的，不是遊戲問題）' % (cheapest - 1, cheapest))
    await pg.evaluate("GAME.G.money=%d" % (cheapest - 1)); await pg.wait_for_timeout(600)
    ok = await reenter()
    cn = next(nm for nm, p in items if p == cheapest)
    res = await scene(pg, cdp, '%s_錢不夠' % tag, lambda o: next((i for i, x in enumerate(o) if x['name'] == cn), None))
    await R.shot(pg, '%s_no_money' % sid)
    dims = [o['dim'] for o in (res['menu'] or []) if o['price'] is not None]
    R.check('B %s 錢不夠（$%d）：選單每一樣都是灰的（.dim）' % (tag, cheapest - 1), ok and bool(dims) and all(dims), J(res['menu']))
    R.check('B %s 錢不夠：點「%s」出「錢不夠」、錢不變（%d）、不會變負' % (tag, cn, cheapest - 1),
            ok and res['m_end'] and res['m_end']['g'] == cheapest - 1 and res['m_end']['g'] >= 0 and any('錢不夠' in t for t in res['toast']),
            '演完 %s；toast %s' % (J(res['m_end']), J(res['toast'])))
    R.setup('錢設回 %d' % MONEY0)
    await pg.evaluate("GAME.G.money=%d" % MONEY0)
    return first


async def R_hour(pg, why):
    h = await pg.evaluate("GAME.G.hour")
    if abs(h - HOUR) > 0.01:
        R.setup('遊戲時間 %.2f → 設回 %.2f（%s；一餐 40 分鐘、飲料 5 分鐘，不設回會過營業時間）' % (h, HOUR, why))
        await pg.evaluate("GAME.G.hour=%f" % HOUR); await pg.wait_for_timeout(500)


async def do_shop(pg, cdp, sid, lay, first_shop):
    t_shop = time.time(); name, typ, _ = SPEC[sid]; tag = sid
    print('\n===== %s %s（PARTS=%s）=====' % (sid, name, ','.join(PARTS)), flush=True)
    sp = spawn_for(lay, sid) if lay else None
    if not R.check('%s 118 巷配置有這間店（LANE118_LAYOUT）' % tag, bool(sp)):
        return
    await load_at(pg, DAY['d'], DAY['wd'], sp, '%s 店門口附近的人行道' % name)
    s = await st(pg)
    R.check('%s 讀檔後站在 118 巷人行道、站得住' % tag, s['zone'] == 'lane118' and s['stand'], J(s))
    await flush(pg, tag + '_load')
    if first_shop and 'A' in PARTS and PHONE:
        await phone_scan(pg, cdp, 'lane118')
    doors = await pg.evaluate("(%s)(%s)" % (DOOR_JS, J(sid)))
    vis = [d for d in doors if not d['hidden']]
    if not R.check('%s 巷子裡有這間店的店門口互動點' % tag, bool(vis), J(doors)):
        return
    dx, dz = vis[0]['x'], vis[0]['z']
    ok, how = await joy_to(pg, cdp, dx, dz, 0.85, '%s 店門口' % name)
    r = await it_label(pg, ('進' + name) if sid not in DRINK_RANGE else name)
    near = await pg.evaluate(NEAR_JS)
    await R.shot(pg, '%s_door' % sid)
    await flush(pg, tag + '_door')
    if 'A' in PARTS and SIGNS and lay:
        await sign_shots_street(pg, sid, lay)
        ok2, _ = await joy_to(pg, cdp, dx, dz, 0.85, '%s 店門口（拍完招牌走回來）' % name)
        r = await it_label(pg, ('進' + name) if sid not in DRINK_RANGE else name)
    STAT.setdefault(sid, {})['door'] = {'at': [round(dx, 2), round(dz, 2)], 'label': r['t'], 'near': near, 'how': how}
    if sid in DRINK_RANGE:
        R.check('A %s 店門口互動鍵（畫面）是「%s（…）」' % (tag, name), ok and r['t'].startswith(name + '（'), '畫面：「%s」；%s' % (r['t'], how))
        R.note('%s 互動點 (%.2f, %.2f)；站的位置範圍內的互動點 %d 個：%s；畫面上的互動鍵 %d 個、最上層＝%s' % (tag, dx, dz, len(near), J(near), r['n'], r['top']))
        R.check('B %s 站在店門口：畫面上的互動鍵就是它、在最上層（沒被別的蓋住）' % tag, r['shown'] and r['t'].startswith(name) and r['top'] == 'interact' and r['n'] == 1, J(r))
        others = [n for n in near if not n['label'].startswith(name)]
        R.check('B %s 站在店門口：範圍內沒有別的互動點跟它搶' % tag, not others, J(others))
        mk = await pg.evaluate("(window.__ccTxt||[]).length")
        async def reenter():
            q = await it_label(pg, name, 3)
            if not q['t'].startswith(name):
                await joy_to(pg, cdp, dx, dz, 0.85, '%s 店門口（再走一次）' % name); q = await it_label(pg, name, 3)
            if not q['t'].startswith(name): return False
            await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(700); return True
        if 'B' in PARTS:
            res0 = await order_all(pg, cdp, sid, tag, reenter)
            said = await pg.evaluate("(n=>(window.__ccTxt||[]).slice(n).filter(e=>e.id==='dlgText').map(e=>(e.nm?e.nm+'：':'')+e.t))(%d)" % mk)
            R.check('B %s 點下互動鍵：回話的是這一間（招呼、選單上是這間的菜：%s）' % (tag, name), bool(res0 and res0['menu']) and all((o['name'] or '') in [a for a, _ in STAT[sid].get('menu', [])] for o in res0['menu'] if o['price'] is not None),
                    J({'said': said[:3], 'menu': [o['t'] for o in ((res0 or {}).get('menu') or [])]}))
        else:
            if await reenter():
                res = await scene(pg, cdp, tag + '_menuA', lambda o: len(o) - 1)
                if res['menu']: menu_check(sid, res['menu'], tag)
        await R.shot(pg, '%s_after' % sid)
        await flush(pg, tag + '_end')
        R.note('%s 這一間花了 %.0f 秒' % (tag, time.time() - t_shop)); return
    # ---- 走得進去的九間 ----
    want = '進%s（%s）' % (name, typ)
    R.check('A %s 店門口互動鍵（畫面）「%s」' % (tag, want), ok and r['t'] == want, '畫面：「%s」；%s；範圍內 %s' % (r['t'], how, J([n['label'] for n in near])))
    if not r['t'].startswith('進'):
        R.check('%s 進得去（營業中，互動鍵是「進…」）' % tag, False, r['t']); return
    await L.tap(pg, cdp, '#interact')
    for _ in range(60):
        if await pg.evaluate("GAME.G.zone==='l118_%s'&&!GAME.E.player.busy" % sid): break
        await pg.wait_for_timeout(1000)
    for _ in range(30):
        if await pg.evaluate("!!(GAME.E.zone&&GAME.E.zone.formal)"): break
        await pg.wait_for_timeout(1000)
    await pg.wait_for_timeout(1500)
    s = await st(pg); cz = await pg.evaluate(CLOCKZ_JS)
    await R.shot(pg, '%s_inside' % sid)
    await flush(pg, tag + '_inside')
    R.check('%s 進到店裡（l118_%s）、站得住' % (tag, sid), s['zone'] == 'l118_' + sid and s['stand'], J(s))
    R.check('A %s 左上角地點（畫面 #clockZ）是「%s（118 巷）」' % (tag, name), cz == name + '（118 巷）', '畫面：「%s」' % cz)
    if 'A' in PARTS and PHONE:
        await phone_scan(pg, cdp, sid)
    ins = await pg.evaluate(INSIDE_JS)
    if not R.check('%s 店裡有點餐、出口的互動點' % tag, bool(ins['order'] and ins['exit']), J(ins)):
        return
    o = ins['order']
    ok, how = await joy_to(pg, cdp, o['x'], o['z'], 0.45, '%s 櫃台' % name)
    r = await it_label(pg, '點餐（')
    await R.shot(pg, '%s_counter' % sid)
    R.check('A %s 櫃台前面互動鍵（畫面）「點餐（%s）」' % (tag, name), ok and r['t'] == '點餐（%s）' % name, '畫面：「%s」；%s' % (r['t'], how))

    async def reenter():
        q = await it_label(pg, '點餐（', 3)
        if not q['t'].startswith('點餐（'):
            await joy_to(pg, cdp, o['x'], o['z'], 0.45, '%s 櫃台（再走一次）' % name); q = await it_label(pg, '點餐（', 3)
        if not q['t'].startswith('點餐（'): return False
        await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(700); return True
    if 'B' in PARTS:
        await order_all(pg, cdp, sid, tag, reenter)
    elif await reenter():
        res = await scene(pg, cdp, tag + '_menuA', lambda o: len(o) - 1)
        if R.check('A %s 點餐有選單（按「不用了」不買）' % tag, bool(res['menu']), J(res)):
            menu_check(sid, res['menu'], tag)
    if 'A' in PARTS and LOOKS:
        lk = await pg.evaluate(LOOKS_JS)
        R.note('%s 店裡「看的東西」%d 個（位置讀資料、字從畫面抽）' % (tag, len(lk)))
        for q in lk:
            # 看東西的互動 prio −0.3、讓位給「坐下」（src/l118_shops3d.js）：第一個站點的互動鍵不是它，就換範圍裡別的站點（最多 6 個），每個試過的點記座標＋互動鍵
            tried = []; hit = None
            for fr, ang in [(0.0, None), (0.5, 0), (0.5, 90), (0.5, 180), (0.5, 270), (0.85, 45)]:
                cx = q['x'] + (q['r'] * fr * math.cos(math.radians(ang)) if ang is not None else 0)
                cz = q['z'] + (q['r'] * fr * math.sin(math.radians(ang)) if ang is not None else 0)
                ok, how = await joy_to(pg, cdp, cx, cz, max(0.25, q['r'] * 0.3), '%s 看的東西「%s」站點 (%.2f,%.2f)' % (name, q['label'], cx, cz), max_s=60)
                r = await it_label(pg, q['label'] or None, 2.5); s_ = await st(pg)
                tried.append([round(s_['x'], 2), round(s_['z'], 2), r['t']])
                if r['t'] and q['label'] and r['t'].startswith(q['label']): hit = r; break
            R.note('%s「%s」試過的站點（座標、互動鍵）：%s' % (tag, q['label'], J(tried)))
            if not hit:
                look_row(sid, q, '', '', '⚠找不到看那個東西的位置（試過 %s）' % J(tried)); continue
            r = hit
            mk = await pg.evaluate("(window.__ccTxt||[]).length")
            await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)   # 看東西是 caption('',look,4600)（#caption 字幕，約 4.6 秒淡出，不是對話框）：觀察器在字出現那一刻就記下來
            cap = await pg.evaluate("(()=>{ const e=document.getElementById('caption'); return e&&!e.classList.contains('hide')&&+getComputedStyle(e).opacity>0.05?(e.innerText||e.textContent||'').trim():''; })()")
            await talk_idle(pg, cdp, tag + '_look', 30)
            got = await pg.evaluate("(n=>(window.__ccTxt||[]).slice(n).filter(e=>e.id==='dlgText'||e.id==='caption'||e.id==='toast').map(e=>(e.nm?e.nm+'：':'')+e.t))(%d)" % mk)
            if cap and not any(cap in g for g in got): got.append(cap)   # 補讀（觀察器漏掉時）
            look_row(sid, q, r['t'], ' ⏎ '.join(x.replace('\n', ' ') for x in got), '' if got else '（按了，畫面上沒抽到字）')
        await flush(pg, tag + '_looks')
    if 'A' in PARTS and SIGNS:
        await sign_shots_inside(pg, sid)
    await R_hour(pg, '出店前')
    x = ins['exit']
    ok, how = await joy_to(pg, cdp, x['x'], x['z'], 0.4, '%s 出口' % name)
    r = await it_label(pg, '離開')
    await R.shot(pg, '%s_exit' % sid)
    R.check('A %s 出口互動鍵（畫面）「離開%s」' % (tag, name), ok and r['t'] == '離開' + name, '畫面：「%s」；%s' % (r['t'], how))
    if r['t'].startswith('離開'):
        await L.tap(pg, cdp, '#interact')
        for _ in range(60):
            if await pg.evaluate("GAME.G.zone==='lane118'&&!GAME.E.player.busy"): break
            await pg.wait_for_timeout(1000)
        await pg.wait_for_timeout(2000)
        s = await st(pg); r2 = await pg.evaluate(IT_JS); cz = await pg.evaluate(CLOCKZ_JS)
        await R.shot(pg, '%s_back_lane' % sid)
        R.check('%s 出來回到 118 巷、站得住、互動鍵不是「進%s」' % (tag, name), s['zone'] == 'lane118' and s['stand'] and not r2['t'].startswith('進' + name), J(dict(s, it=r2['t'], clockZ=cz)))
    await flush(pg, tag + '_end')
    R.note('%s 這一間花了 %.0f 秒' % (tag, time.time() - t_shop))


def look_row(sid, q, key, screen, why):
    txt = screen or q.get('data') or ''
    flag = [k for k in OLD_LOOK_KW if k in txt] + old_hits(txt)
    row = {'shop': sid, 'name': SPEC[sid][0], 'id': q.get('id') or '?', 'label': q.get('label') or '', 'key': key, 'screen': screen, 'data': q.get('data') or '', 'why': why, 'flag': flag}
    LOOK_ROWS.append(row)
    print('  看的東西｜%s｜%s｜%s｜畫面：%s｜資料：%s%s%s' % (sid, row['id'], row['label'], screen or '—', row['data'] or '—', ('｜' + why) if why else '',
                                                    ('｜⚠舊內容？（%s）' % '、'.join(flag)) if flag else ''), flush=True)


def write_looks_table():
    if not LOOK_ROWS: return
    md = ['# 118 巷「看的東西」逐字表', '', 'SHA=%s；%s；畫面＝按下互動鍵後畫面上抽到的字（#dlgText／#caption／#toast）；資料＝互動點掛的旁白（對照用）。' % (os.environ.get('SHA', '（沒給）'), DAY.get('k', '')),
          '「⚠舊內容？」＝關鍵字比對（%s，加舊店名、舊菜名），要人看過才算數。' % '、'.join(OLD_LOOK_KW), '',
          '| 店 | 物件 id | 互動鍵 | 全文（畫面） | 資料 | 標記 |', '|---|---|---|---|---|---|']
    esc = lambda t: (t or '').replace('|', '｜').replace('\n', ' ')
    for r in LOOK_ROWS:
        md.append('| %s（%s） | %s | %s | %s | %s | %s |' % (r['name'], r['shop'], esc(r['id']), esc(r['key'] or r['label']), esc(r['screen']) or esc(r['why']), esc(r['data']),
                                                        ('⚠舊內容？（%s）' % '、'.join(r['flag'])) if r['flag'] else ''))
    open(os.path.join(OUT, 'looks_table.md'), 'w', encoding='utf-8').write('\n'.join(md) + '\n')
    print('\n===== 看的東西：逐字表（%d 列，%s）=====' % (len(LOOK_ROWS), os.path.join(OUT, 'looks_table.md')), flush=True)
    for line in md[6:]: print('  ' + line, flush=True)
    nf = sum(1 for r in LOOK_ROWS if r['flag'])
    R.note('看的東西 %d 列，其中 %d 列標「⚠舊內容？」（關鍵字比對，交 BB 判，不算 FAIL）' % (len(LOOK_ROWS), nf))


SHOPLAY_JS = r"""(sid=>{ const L=typeof L118_SHOP_LAYOUTS!=='undefined'?L118_SHOP_LAYOUTS[sid]:null; return L?{b:L.bounds,h:L.h||3,door:L.door}:null; })"""


async def sign_shots(pg, sid, where, region, ref, extra, ymax=None):
    """【捷徑機位】拍模型上畫的字。region：只看這個範圍裡的板面；ref：板面朝向哪一邊（店內＝房間中心，巷子＝巷子中線）；extra：一定拍的幾張 (名, 鏡頭, 看的點)"""
    R.setup('%s %s：拍模型上的字——鏡頭獨立擺（不跟人物）、藏人物和 HUD、視窗暫時 1280×720' % (sid, where))
    vp = pg.viewport_size
    await pg.set_viewport_size({'width': 1280, 'height': 720}); await pg.wait_for_timeout(1200)
    n = 0
    try:
        fov = await pg.evaluate("GAME.E.camera.fov") or 50
        th = math.tan(math.radians(fov) / 2); asp = 1280 / 720
        cl = await pg.evaluate("(%s)(%s)" % (SIGN_FIND_JS, J(region)))
        R.note('%s %s 有字的板面（依距離分群）%d 群：%s' % (sid, where, len(cl), J([{'nm': c['nm'], 'c': [round(v, 2) for v in c['c']], 's': [round(v, 2) for v in c['s']]} for c in cl[:16]])))
        shots = []
        for k, c in enumerate(cl[:14]):
            cx, cy, cz = c['c']; sx, sy, sz = c['s']
            if sy < 0.3 * min(max(sx, 0.01), max(sz, 0.01)):   # 平放的（檯面上的菜單）：從斜上方看
                d = max(0.7, min(4.0, max(sx, sz) / th * 0.75))
                e = [cx + (ref[0] - cx) * 0.15, cy + d, cz + (ref[2] - cz) * 0.15 + 0.01]
            else:
                ax = 0 if sx < sz else 2; w = sz if ax == 0 else sx
                d = max(0.6, min(5.0, max(w / asp, sy) / (2 * th) * 1.35))
                sg = 1 if (ref[ax] - c['c'][ax]) >= 0 else -1
                e = [cx, cy, cz]; e[ax] += sg * d
                if ymax: e[1] = min(e[1], ymax)
            nm = re.sub(r'[^A-Za-z0-9_]+', '_', c['nm'])[:28]
            shots.append(('%s_%02d_%s' % (where, k, nm), e, [cx, cy, cz]))
        for nm, e, l in shots + extra:
            fr = await pg.evaluate("(%s)(%s,%s)" % (SIGN_CAM_JS, J([round(v, 3) for v in e]), J([round(v, 3) for v in l])))
            path = os.path.join(OUT, 'sign_%s_%s.png' % (sid, nm))
            try: await pg.screenshot(path=path); n += 1
            except Exception as ex: R.note('截圖失敗 %s：%r' % (path, ex))
            R.note('%s 板面近照 %s（鏡頭 %s → %s，%d 幀）' % (sid, os.path.basename(path), J([round(v, 2) for v in e]), J([round(v, 2) for v in l]), fr))
    finally:
        await pg.evaluate(SIGN_END_JS)
        await pg.set_viewport_size(vp); await pg.wait_for_timeout(2000)
    STAT.setdefault(sid, {}).setdefault('signs', 0); STAT[sid]['signs'] += n
    return n


async def sign_shots_street(pg, sid, lay):
    me = next((x for x in lay['shops'] if x['id'] == sid), None)
    if not me: return 0
    fw, fe = lay['fw'], lay['fe']; zc = me['z']
    za, zb = sorted([me.get('z0', zc - 2.5), me.get('z1', zc + 2.5)])
    if me['side'] == 'W':
        rg = {'x0': fw - 2.5, 'x1': fw + 2.4, 'z0': za - 0.3, 'z1': zb + 0.3}; fx, sg = fw, 1
    else:
        rg = {'x0': fe - 2.4, 'x1': fe + 2.5, 'z0': za - 0.3, 'z1': zb + 0.3}; fx, sg = fe, -1
    extra = [('facade', [fx + sg * (fe - fw) * 0.85, 2.3, zc], [fx, 2.4, zc]),   # 從巷子對面看整個店面（招牌）
             ('front', [fx + sg * 2.4, 1.5, zc], [fx, 1.3, zc])]                  # 店面下半部（門口的菜單、價目牌、海報）
    return await sign_shots(pg, sid, 'street', rg, [0.0, 1.5, zc], extra)


async def sign_shots_inside(pg, sid):
    ly = await pg.evaluate("(%s)(%s)" % (SHOPLAY_JS, J(sid)))
    if not ly or not ly.get('b'):
        R.note('%s 讀不到室內配置（L118_SHOP_LAYOUTS），只拍不了店內板面' % sid); return 0
    b, h, dr = ly['b'], ly['h'], ly['door'] or {}
    cx, cz = (b['x0'] + b['x1']) / 2, (b['z0'] + b['z1']) / 2
    dx, dz = dr.get('x', cx), dr.get('z', b['z1'])
    yc = min(h - 0.35, 2.1)
    extra = [('wide_in', [dx + (cx - dx) * 0.12, yc, dz + (cz - dz) * 0.12], [cx - (dx - cx) * 0.6, 1.3, cz - (dz - cz) * 0.6]),   # 門口往裡
             ('wide_out', [cx - (dx - cx) * 0.85, yc, cz - (dz - cz) * 0.85], [dx, 1.3, dz])]                                       # 最裡面往門口
    rg = {'x0': b['x0'] - 0.3, 'x1': b['x1'] + 0.3, 'z0': b['z0'] - 0.3, 'z1': b['z1'] + 0.3, 'all': True}
    return await sign_shots(pg, sid, 'inside', rg, [cx, 1.5, cz], extra, ymax=h - 0.15)


def summary():
    print('\n===== 畫面上抽到的字：彙總（A）=====', flush=True)
    names_new = [SPEC[k][0] for k in ALL]
    items_new = sorted({a for k in ALL if SPEC[k][2] for a, _ in SPEC[k][2]} | {nm for k in STAT for nm, _ in STAT[k].get('menu', [])})
    where = {}
    for e in SEEN:
        for w in names_new + items_new:
            if w in e['t']: where.setdefault(w, set()).add(e['id'])
    print('  新店名（出現在哪些畫面元素）：' + J({w: sorted(where.get(w, [])) for w in names_new}), flush=True)
    print('  菜名（出現在哪些畫面元素）：' + J({w: sorted(where.get(w, [])) for w in items_new}), flush=True)
    hits = []
    for e in SEEN:
        for w in old_hits(e['t']):
            k = e['t'].find(w); hits.append('%s｜%s｜%s｜「%s」…%s…' % (e['tag'], e['zone'], e['id'], w, e['t'][max(0, k - 20):k + len(w) + 20].replace('\n', ' ')))
    for h in hits[:80]: print('  舊名命中｜' + h, flush=True)
    R.check('A 畫面上抽到的字（%d 段）裡舊店名、舊菜名命中數＝0' % len(SEEN), not hits, '命中 %d 筆' % len(hits))
    json.dump({'seen': SEEN, 'stat': STAT}, open(os.path.join(OUT, 'l118d_seen.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1, default=list)


async def main():
    print('受測 SHA=%s；PARTS=%s；SHOPS=%s；URL=%s' % (os.environ.get('SHA', '（沒給）'), ','.join(PARTS), ','.join(SHOPS), URL), flush=True)
    print('Playwright 手機模擬（%s）≠ iPhone 實機' % ('直向 390×844' if PORTRAIT else '橫向 844×390'), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=not PORTRAIT)
        cdp_g[0] = cdp
        await pg.goto(URL)
        R.check('遊戲載入', await L.wait_loaded(pg))
        ver = await pg.evaluate("(document.body.innerText.match(/版本 v[0-9.]+[^\\n]*/)||[''])[0]")
        R.note('畫面上的版本字樣：%s' % ver)
        await pg.evaluate("localStorage.clear()")
        days = await pg.evaluate("(%s)(%s)" % (DAYS_JS, J(DATES)))
        ok_days = [d for d in days if not d['hol'] and not d['ty'] and d['term'] and d['week'] and d['week'] < 16 and (d['wd'] == 3 or os.environ.get('DATE'))]
        R.note('候選日期：%s' % J(days))
        DAY.update(ok_days[0] if ok_days else days[0])
        R.check('日期 %s：學期中（%s 第 %s 週）、不是假日、不是颱風假' % (DAY['k'], DAY['term'], DAY['week']), bool(ok_days), J(DAY))
        lay = await pg.evaluate(LAYOUT_JS)
        # 營業：先讀檔一次看九間＋兩間在這個時間開不開
        await load_at(pg, DAY['d'], DAY['wd'], {'x': 0, 'z': 31, 'yaw': math.pi}, '查營業時間（巷口）')
        op = await pg.evaluate(OPEN_JS)
        R.note('營業（L118.isOpen，%s %.2f）：%s' % (DAY['k'], HOUR, J(op)))
        for sid in SHOPS:
            q = next((x for x in op if x['id'] == sid), None)
            R.check('%s 這個時間有開（沒有公休紙）' % sid, bool(q and q['open'] and not q['note']), J(q))
        await flush(pg, 'start')
        for i, sid in enumerate(SHOPS):
            if sid not in SPEC:
                R.check('SHOPS 裡的「%s」是認得的店 id' % sid, False); continue
            try:
                await do_shop(pg, cdp, sid, lay, i == 0)
            except Exception as e:
                R.check('%s 探針沒有中途出錯' % sid, False, repr(e)[:300])
                try: await R.shot(pg, '%s_exception' % sid)
                except Exception: pass
        summary()
        write_looks_table()
        for e in errs: print('  pageerror｜' + e[:400], flush=True)
        R.check('沒有 JS 例外（pageerror）', not errs, '%d 個' % len(errs))
        fb = await pg.evaluate("GAME.walkFallbacks||0")
        R.check('劇情自動走路沒有用到卡住保險（walkFallbacks＝0）', fb == 0, str(fb))
        await b.close()
    print('總結：%d 項 FAIL%s' % (len(R.fails), ('：' + '、'.join(R.fails[:40])) if R.fails else ''), flush=True)
    sys.exit(R.finish())

asyncio.run(main())
