"""CC（帳號 A）11-11：正式發行打包 dist/web 的瀏覽器驗收（REL-PACKAGING-1111／USER_WANTS X340；BB 範圍①～⑧；受測 554d1488b）。
玩的是 tools/release/pack.py --target web 打出來的 dist/web（不是 repo 根目錄）。每一行先在 worktree 根目錄打包一次（記秒數、manifest sha256），
自己開 http.server 服務 dist/web（埠 DIST_PORT 起找空的），結束關掉、刪掉 dist（KEEP_DIST=1 不刪）。Playwright（PC GPU）≠ iPhone 實機。
PARTS（逗號分隔）：
  PACK          打包＋node verify_dist.js＋node smoke_dist.js（SMOKE_ZONES 區、SMOKE_BUDGET 秒；node 或 node 的 playwright 沒有＝SKIP）；寫 dist_files.json（雲端 cc_relpack_diff.py 讀）
  MISS          ① 在瀏覽器裡收執行期會用到的資產路徑（ASSETS.manifest＋遠距離版本、PORTRAIT_FILES、CG_REGISTRY、OUT.BG、海報、各資料表裡的 assets/ 字串）＋包的 manifest.required，
                逐一 HEAD：包（dist）和 repo 根目錄（runner 的 url）各一次；只在包裡缺＝FAIL，兩邊都缺＝INFO（遊戲資料指到不存在的選用檔）
  Z3D_<n>       ② 區域第 n 批（Z3.ZONES 排序後每批 ZB 區，預設 12）在包裡【前置／捷徑】GAME.applySave 進去；等到載完（G.zone 對、GAME.isEntering()=false、
                ASSETS.loadingNow()=false、#fade 收起）再等 NPC 換上正式模型（最多 NPC_SETTLE 秒），記人物驅動（vrm／glb／proc）、CHAR.failures、ASSETS.errors、
                這一區要的正式模型（GAME._zoneReq）哪些沒進快取（建築退回備用），每區一張 jpg（品質 60）
  Z3D_ROOT_<n>  同一批在 repo 根目錄（runner 的 url，同 SHA）跑一次當對照；兩邊 zones_*.json 用 cc_relpack_diff.py --zones 比
  P2D_PORTRAIT  ③ PORTRAIT_FILES 每位每套每個表情：ADV.begin＋ADV.show（遊戲自己的立繪路徑），等 #adv 右框的 img 換成那一張且 naturalWidth>0；拼縮圖總表
  P2D_CG        ③ CG_REGISTRY 每一張：ADV.cg(id)（事件 CG 的顯示路徑），等圖載好、#adv 有 cg、底圖是那一張；另外【捷徑】把全部 CG 設成解鎖，手機 → 相簿看 .alb 張數與每張載得到
  P2D_POSTER    ③ 南洋戲院片單每一部：MOVIES.posterUrl＋fetch＋Image 解碼、MOVIES.drawPoster 畫圖＋片名拼總表（預期 72 部）
  P2D_BG        ③ OUT.BG 每個代號：ADV.begin({background:{image}})（劇情背景的顯示路徑），等圖載好、#adv 是 image（沒有退回 blur）；image:null 的列出；拼縮圖總表
  MAPS          ④ 校園⇄公館⇄溫州街⇄118 巷：【前置】放在出口前 START_D 公尺，之後只用觸控搖桿走到門口、按互動鈕過門（不用 ?turbo）；
                另外【前置／捷徑】美國（us_outside）、日本（jp_hub）各進出一次、家（HOME.go，選單選「回宿舍」）進出一次
  SAVE          ⑤ 包裡按「從法律系開始」開新遊戲、點完開場（最多 NEWGAME_S 秒），選單存三格、匯出（文字＋下載），重新整理後從標題讀三格，比對名字／天數／時間／地點／金錢；
                同一個瀏覽器開 repo 根目錄（另一個埠）看不看得到包的存檔（localStorage 依 origin 分開）
  MAIN12        ⑤ 對包跑 tests/flow_main_day12.py（真實流程：新遊戲第一天到第二天、存欄位 1、重新整理讀檔）；PC 上經 gpu_wrap 用顯示卡
  OLDSAVE       ⑤ repo 的 fixture tests/fixtures/user_save_day54_1110.json 用標題「讀取 → 匯入」讀進包；有 url2（kind game：XARGS={url} {out} {url2}，SHA2=779ddd65…）時，
                另外在舊版真的開新遊戲、存欄位 1、匯出，再匯入包
  V7            ⑤ 對包跑 tests/save_compat_v7.py <url2> <包的網址>（kind game：SHA2=385e19471…＝v7）
  PAGES         ⑥ 線上 GitHub Pages（main）：git ls-remote 的 main SHA、首頁版本字樣、按新遊戲 25 秒；只在 PC 跑（雲端連不到 github.io）
  SIZE          ⑦ 重跑 tools/release/size_report.py（SIZE_ZIP=1 加 --zip），和 docs/release/SIZE_REPORT_2026-11-11.json 對數字；列包裡最大的 20 個檔
全部的 part：本機（包或 repo 根目錄）非 200（含 requestfailed）都收進 net_<part>.json；pageerror、console error 都收。
用法：LW_TESTS=<wt>/tests SHA=<sha> PARTS=... python cc_relpack_probe.py <url> <out> [url2]
其他 ENV：ZB（每批幾區）、ZONES（指定區，逗號）、LIMIT（P2D 每類只測前 N 個，雲端自檢用）、PACK=0（不打包，用已經有的 dist/web）、DIST_PORT（預設 8900）、
  NPC_SETTLE（秒，預設 20）、START_D（公尺，預設 9）、HOPS（例 campus>gongguan,gongguan>campus）、EXPECT_MAIN（預設 779ddd65…）"""
import os, sys, json, time, asyncio, hashlib, inspect, re, shutil, socket, subprocess, base64, math

HERE = os.path.dirname(os.path.abspath(__file__))
_lt = os.environ.get('LW_TESTS') or (os.path.join(os.getcwd(), 'tests') if os.path.exists(os.path.join(os.getcwd(), 'tests', 'playlib.py')) else os.path.join(HERE, '..', '..', '..', '..', 'tests'))
LW_TESTS = os.path.abspath(_lt)
sys.path.insert(0, LW_TESTS)
import playlib as L
from playwright.async_api import async_playwright

WT = os.path.dirname(LW_TESTS)
URL = sys.argv[1]; OUT = os.path.abspath(sys.argv[2]); URL2 = sys.argv[3] if len(sys.argv) > 3 else ''
os.makedirs(OUT, exist_ok=True)
PARTS = [x.strip() for x in (os.environ.get('PARTS') or 'PACK').split(',') if x.strip()]
J = lambda o: json.dumps(o, ensure_ascii=False)
ZB = int(os.environ.get('ZB') or 12)
LIMIT = int(os.environ.get('LIMIT') or 0)
NPC_SETTLE = float(os.environ.get('NPC_SETTLE') or 20)
START_D = float(os.environ.get('START_D') or 9)
EXPECT_MAIN = os.environ.get('EXPECT_MAIN') or '779ddd65081bf770e9850d948b54ecc21dc4d120'
LIVE = os.environ.get('LIVE_URL') or 'https://pyhuanglaw.github.io/Lawstudent/'
DIST = os.path.join(WT, 'dist', 'web')
FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': True, 'lawclub': True, 'wenzhouLine': True}
OK_STATUS = (200, 204, 206, 304)
FAILS = []; T0 = time.time()

# gpu_wrap（PC 上 runner 用它開顯示卡）：本探針是被 gpu_wrap 用 runpy 執行的，呼叫堆疊裡有它；子程序（save_compat_v7、flow_main_day12）也經它跑
GPU_WRAP = os.environ.get('CC_GPU_WRAP') or next((f.filename for f in inspect.stack() if f.filename.endswith('gpu_wrap.py')), '') or ''
if not GPU_WRAP:
    for c in (os.path.join(HERE, '..', '..', '..', '..', 'tools', 'cc_local', 'gpu_wrap.py'),):
        if os.path.exists(c) and os.environ.get('CC_GPU'):
            GPU_WRAP = os.path.abspath(c)


def sanitize(s):
    """輸出裡不留這台機器的路徑、使用者名稱"""
    s = str(s)
    for p, tag in ((WT, '<WT>'), (WT.replace('\\', '/'), '<WT>'), (os.path.expanduser('~'), '<HOME>'), (os.path.expanduser('~').replace('\\', '/'), '<HOME>')):
        if p and len(p) > 3: s = s.replace(p, tag)
    s = re.sub(r'(?i)([A-Z]:[\\/]+Users[\\/]+)[^\\/"\s]+', r'\1<USER>', s)
    s = re.sub(r'/home/[^/\s"]+', '/home/<USER>', s)
    return s


def check(name, ok, info=''):
    print(sanitize(('PASS ' if ok else 'FAIL ') + name + (('  ' + str(info)) if info != '' else '')), flush=True)
    if not ok: FAILS.append(name)
    return ok


def note(s): print(sanitize('  [%6.1fs] %s' % (time.time() - T0, s)), flush=True)


def setup(s): print(sanitize('  [前置／捷徑] %s' % s), flush=True)


def wjson(name, obj):
    with open(os.path.join(OUT, name), 'w', encoding='utf-8') as f:
        f.write(sanitize(json.dumps(obj, ensure_ascii=False, indent=1)))


def free_port(start):
    for p in range(start, start + 200):
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        try:
            s.bind(('127.0.0.1', p)); s.close(); return p
        except OSError:
            s.close()
    raise RuntimeError('沒有空的埠')


def run(cmd, cwd=None, timeout=1800):
    t = time.time()
    try:
        r = subprocess.run(cmd, cwd=cwd or WT, capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=timeout)
        return r.returncode, (r.stdout or '') + (r.stderr or ''), time.time() - t
    except subprocess.TimeoutExpired as e:
        return 'TIMEOUT', str(e.stdout or '')[-4000:], time.time() - t
    except FileNotFoundError as e:
        return 'NOTFOUND', str(e), time.time() - t


def sha256f(p):
    h = hashlib.sha256()
    with open(p, 'rb') as f:
        for b in iter(lambda: f.read(1 << 20), b''): h.update(b)
    return h.hexdigest()


def tail(s, n=25):
    return '\n'.join(sanitize(x) for x in s.strip().splitlines()[-n:])


# ---------------- 打包 ----------------
PACKINFO = {}


def do_pack():
    print('== PACK（打包）', flush=True)
    if os.environ.get('PACK') == '0':
        ok = os.path.exists(os.path.join(DIST, 'manifest.json'))
        check('PACK=0：沿用已經有的 dist/web', ok, DIST)
    else:
        code, out, sec = run([sys.executable, os.path.join(WT, 'tools', 'release', 'pack.py'), '--target', 'web'], timeout=1800)
        print(tail(out, 30), flush=True)
        PACKINFO['seconds'] = round(sec, 1)
        ok = check('打包 pack.py --target web 結束碼 0', code == 0, 'exit %s，%.1f 秒' % (code, sec))
    if not os.path.exists(os.path.join(DIST, 'manifest.json')):
        check('dist/web/manifest.json 存在', False); return False
    man = json.load(open(os.path.join(DIST, 'manifest.json'), encoding='utf-8'))
    PACKINFO.update({'manifestSha256': sha256f(os.path.join(DIST, 'manifest.json')), 'commit': man.get('commit'), 'version': man.get('version'),
                     'files': man['totals']['files'], 'bytes': man['totals']['bytes'], 'runtimeTablesRead': man.get('runtimeTablesRead'), 'dirty': man.get('dirty')})
    note('打包結果：%s' % J(PACKINFO))
    sha = os.environ.get('SHA') or ''
    if sha: check('manifest 的 commit＝受測 SHA', man.get('commit') == sha, '%s vs %s' % (man.get('commit'), sha))
    check('manifest：執行期表有讀到（node runtime_manifest.js）', bool(man.get('runtimeTablesRead')), str(man.get('runtimeTablesRead')))
    check('manifest：工作樹乾淨（dirty=false）', man.get('dirty') is False, str(man.get('dirty')))
    return ok


def dist_files():
    man = json.load(open(os.path.join(DIST, 'manifest.json'), encoding='utf-8'))
    mf = {x['path']: x for x in man['files']}
    rows = []
    for d, _ds, names in os.walk(DIST):
        for n in names:
            p = os.path.join(d, n); rel = os.path.relpath(p, DIST).replace('\\', '/')
            rows.append({'path': rel, 'size': os.path.getsize(p), 'sha256': sha256f(p), 'rule': (mf.get(rel) or {}).get('rule'), 'manifestSha256': (mf.get(rel) or {}).get('sha256')})
    rows.sort(key=lambda r: r['path'])
    bad = [r['path'] for r in rows if r['path'] != 'manifest.json' and r['manifestSha256'] and r['manifestSha256'] != r['sha256']]
    check('dist_files：每個檔的 sha256 和 manifest 一樣', not bad, J(bad[:10]))
    obj = {'commit': man.get('commit'), 'version': man.get('version'), 'versionDate': man.get('versionDate'), 'target': man.get('target'), 'totals': man.get('totals'),
           'runtimeTablesRead': man.get('runtimeTablesRead'), 'dirty': man.get('dirty'), 'packSeconds': PACKINFO.get('seconds'), 'manifestSha256': PACKINFO.get('manifestSha256'),
           'platform': sys.platform, 'required': man.get('required', []), 'unsure': man.get('unsure', []), 'files': rows}
    wjson('dist_files.json', obj)
    big = sorted(rows, key=lambda r: -r['size'])[:20]
    note('包裡最大的 20 個檔：' + '；'.join('%s %.2f MB' % (r['path'], r['size'] / 1e6) for r in big))
    note('dist_files.json：%d 個檔、%.2f MB' % (len(rows), sum(r['size'] for r in rows) / 1e6))


def part_pack_node(dist_url):
    node = shutil.which('node')
    if not node:
        print('SKIP verify_dist／smoke_dist：這台機器找不到 node（不安裝）', flush=True); return
    code, out, sec = run([node, os.path.join(WT, 'tools', 'release', 'verify_dist.js'), DIST, '--json', os.path.join(OUT, 'verify_dist.json')], timeout=1200)
    print(tail(out, 20), flush=True)
    check('verify_dist.js dist/web 結束碼 0（逐檔 GET、sha256、開發檔 404）', code == 0, 'exit %s，%.1f 秒' % (code, sec))
    if os.environ.get('SMOKE') == '0':
        print('SKIP smoke_dist（SMOKE=0）', flush=True); return
    zones = os.environ.get('SMOKE_ZONES') or '5'
    code, out, sec = run([node, os.path.join(WT, 'tools', 'release', 'smoke_dist.js'), dist_url, '--json', os.path.join(OUT, 'smoke_dist.json'), '--zones', zones,
                          '--budget', os.environ.get('SMOKE_BUDGET') or '420'], timeout=1500)
    if "Cannot find module 'playwright'" in out:
        print("SKIP smoke_dist：node 找不到 playwright 模組（這台機器只有 Python 的 playwright；不安裝）", flush=True); return
    print(tail(out, 30), flush=True)
    check('smoke_dist.js 結束碼 0（標題、新遊戲、%s 區、404、JS 例外）' % zones, code == 0, 'exit %s，%.1f 秒' % (code, sec))
    for p in ('verify_dist.json', 'smoke_dist.json'):
        fp = os.path.join(OUT, p)
        if os.path.exists(fp):
            with open(fp, encoding='utf-8') as f: t = f.read()
            with open(fp, 'w', encoding='utf-8') as f: f.write(sanitize(t))


# ---------------- 瀏覽器共用 ----------------
class Net:
    def __init__(self, tag):
        self.tag = tag; self.bad = []; self.ext = []; self.cons = []; self.perr = []; self.n = 0; self.mark = ''

    def hook(self, pg, origin):
        def on_resp(r):
            u = r.url
            if u.startswith('data:') or u.startswith('blob:') or r.request.method == 'HEAD': return   # HEAD＝MISS 探針自己發的檢查，不算遊戲的請求
            if u.startswith(origin):
                self.n += 1
                if r.status not in OK_STATUS: self.bad.append({'at': self.mark, 'status': r.status, 'url': u[len(origin):]})
            elif r.status >= 400: self.ext.append({'status': r.status, 'url': u[:160]})

        def on_fail(rq):
            u = rq.url
            if u.startswith('data:') or u.startswith('blob:') or rq.method == 'HEAD': return
            err = (rq.failure or '') if isinstance(rq.failure, str) else str(rq.failure)
            if 'ERR_ABORTED' in err and (u.endswith('.webp') or u.endswith('.jpg')): err += '（取消：換圖）'
            (self.bad if u.startswith(origin) else self.ext).append({'at': self.mark, 'status': 'FAILED ' + err, 'url': u[len(origin):] if u.startswith(origin) else u[:160]})
        pg.on('response', on_resp); pg.on('requestfailed', on_fail)
        pg.on('console', lambda m: self.cons.append(m.text[:300]) if m.type == 'error' else None)
        pg.on('pageerror', lambda e: self.perr.append(str(e)[:300]))

    def real_bad(self):
        return [b for b in self.bad if not str(b['status']).endswith('（取消：換圖）')]

    def report(self, part):
        rb = self.real_bad()
        wjson('net_%s.json' % part, {'part': part, 'localRequests': self.n, 'bad': self.bad, 'external': self.ext[:50], 'console': self.cons[:80], 'pageerror': self.perr[:40]})
        check('[%s] 本機資源全部 200（非 200／載入失敗 %d 個；共 %d 個回應）' % (part, len(rb), self.n), not rb, J(rb[:12]))
        check('[%s] 沒有 JS 例外（pageerror）' % part, not self.perr, J(self.perr[:4]))
        if self.cons: note('[%s] console error（只列出，不算失敗）%d 則：%s' % (part, len(self.cons), J(list(dict.fromkeys(self.cons))[:6])))
        if self.ext: note('[%s] 對外網址失敗（只列出）：%s' % (part, J(self.ext[:4])))


UA = L.UA


async def new_page(b, viewport=(844, 390)):
    ctx = await b.new_context(viewport={'width': viewport[0], 'height': viewport[1]}, device_scale_factor=1, has_touch=True, is_mobile=True, user_agent=UA, accept_downloads=True)
    pg = await ctx.new_page(); cdp = await ctx.new_cdp_session(pg)
    return ctx, pg, cdp


def origin_of(u):
    m = re.match(r'(https?://[^/]+)', u); return m.group(1) if m else u


def base_of(u):
    return u.rsplit('/', 1)[0] + '/' if not u.endswith('/') else u


async def open_game(b, url, part, net_tag=None):
    ctx, pg, cdp = await new_page(b)
    net = Net(net_tag or part); net.hook(pg, origin_of(url))
    t = time.time(); await pg.goto(url, timeout=180000)
    ok = await L.wait_loaded(pg, 300)
    check('[%s] 遊戲載入完成（%s）' % (part, 'dist' if url.startswith(DIST_URL_BASE or '@') else url.split('//')[-1].split('/')[0]), ok, '%.1f 秒' % (time.time() - t))
    return ctx, pg, cdp, net


async def quiet_load(pg, st, timeout=150):
    await asyncio.wait_for(L.load_state(pg, st, quiet_events=True), timeout)


DIST_URL_BASE = ''


# ---------------- ① MISS ----------------
COLLECT_JS = r"""(async()=>{ const out=new Map(); const add=(u,from)=>{ if(typeof u!=='string') return; u=u.split('?')[0].split('#')[0]; if(!/^assets\/[\w\-./]+\.[A-Za-z0-9]+$/.test(u)) return; if(!out.has(u)) out.set(u,from); };
  try{ for(const k of Object.keys(ASSETS.manifest)){ const m=ASSETS.manifest[k]; for(const f of Object.keys(m||{})){ const v=m[f]; if(typeof v==='string') add(v,'manifest.'+k+'.'+f); } try{ add(ASSETS.lodUrl(k),'lod.'+k); }catch(e){} } }catch(e){}
  try{ for(const id of Object.keys(PORTRAIT_FILES)) for(const of of Object.keys(PORTRAIT_FILES[id]||{})) for(const ex of PORTRAIT_FILES[id][of]||[]) add('assets/portraits/'+id+'/'+of+'/'+ex+'.webp','PORTRAIT_FILES'); }catch(e){}
  try{ for(const k of Object.keys(CG_REGISTRY)) add(CG_REGISTRY[k].file,'CG_REGISTRY.'+k); }catch(e){}
  try{ for(const k of Object.keys(OUT.BG)) add((OUT.BG[k]||{}).image,'OUT.BG.'+k); }catch(e){}
  try{ for(const p of NANYANG_MOVIES.periods) for(const b of p.bill) add(MOVIES.posterUrl(b.id),'poster.'+b.id); }catch(e){}
  /* 各資料表（頂層 const）裡完整寫成 assets/ 的字串：和 tools/release/runtime_manifest.js 同一個做法，但是在真的瀏覽器裡 */
  const names=new Set(); for(const s of document.scripts){ const src=s.getAttribute('src'); if(!src||/^https?:/.test(src)) continue; try{ const t=await (await fetch(src.split('?')[0])).text(); for(const m of t.matchAll(/^const (\w+)\s*=/mg)) names.add(m[1]); }catch(e){} }
  const plain=v=>{ if(Array.isArray(v)) return true; const p=Object.getPrototypeOf(v); return p===Object.prototype||p===null; };
  for(const n of names){ if(n==='ASSETS'||/^THREE/.test(n)) continue; let root; try{ root=(0,eval)('typeof '+n+'!=="undefined"?'+n+':undefined'); }catch(e){ continue; } if(root==null||typeof root!=='object'&&typeof root!=='function') continue;
    const seen=new Set(); let budget=200000; const walk=(v,d)=>{ if(budget--<=0||d>8||v==null) return; if(typeof v==='string'){ add(v,n); return; } if(typeof v!=='object'||seen.has(v)) return; if(d>0&&!plain(v)) return; seen.add(v);
      if(Array.isArray(v)){ for(const x of v) walk(x,d+1); return; } let ks; try{ ks=Object.keys(v); }catch(e){ return; } for(const k of ks){ let x; try{ x=v[k]; }catch(e){ continue; } walk(x,d+1); } }; walk(root,0); }
  return [...out].map(([u,from])=>({url:u,from})); })()"""
HEAD_JS = r"""(async(paths)=>{ const res=[]; let i=0; const one=async()=>{ while(i<paths.length){ const p=paths[i++]; let st=0; try{ const r=await fetch(p,{method:'HEAD',cache:'no-store'}); st=r.status; }catch(e){ st='ERR'; } res.push([p,st]); } };
  await Promise.all(Array.from({length:8},one)); return res; })"""


async def part_miss(b, dist_url):
    print('== MISS（①：執行期會用到的資產路徑，包和 repo 根目錄各 HEAD 一次）', flush=True)
    man = json.load(open(os.path.join(DIST, 'manifest.json'), encoding='utf-8'))
    res = {}
    for tag, url in (('dist', dist_url), ('root', URL)):
        ctx, pg, cdp, net = await open_game(b, url, 'MISS_' + tag)
        refs = await pg.evaluate(COLLECT_JS)
        paths = sorted(set([r['url'] for r in refs] + list(man.get('required', []))))
        st = dict(await pg.evaluate(HEAD_JS, paths))
        res[tag] = {'refs': refs, 'status': st}
        note('[%s] 執行期路徑 %d 個（加上 manifest.required 共 %d 個）；非 200：%d' % (tag, len(refs), len(paths), sum(1 for v in st.values() if v != 200)))
        net.report('MISS_' + tag); await ctx.close()
    frm = {r['url']: r['from'] for r in res['dist']['refs']}
    only = sorted(p for p, v in res['dist']['status'].items() if v != 200 and res['root']['status'].get(p) == 200)
    both = sorted(p for p, v in res['dist']['status'].items() if v != 200 and res['root']['status'].get(p) != 200)
    req_bad = [p for p in man.get('required', []) if res['dist']['status'].get(p) != 200]
    wjson('miss.json', {'distOnlyMissing': [{'url': p, 'from': frm.get(p)} for p in only], 'bothMissing': [{'url': p, 'from': frm.get(p), 'dist': res['dist']['status'].get(p), 'root': res['root']['status'].get(p)} for p in both],
                        'requiredBad': req_bad, 'counts': {k: len(v['status']) for k, v in res.items()}})
    check('[MISS] manifest.required 每個在包裡都 200', not req_bad, J(req_bad[:10]))
    check('[MISS] 執行期會用到、repo 有、包裡沒有的：0', not only, J([[p, frm.get(p)] for p in only[:15]]))
    note('[MISS] 兩邊都沒有（遊戲資料指到不存在的檔，INFO，不算包的問題）%d 個：%s' % (len(both), J([[p, frm.get(p)] for p in both[:15]])))


# ---------------- ② 3D ----------------
READY_JS = r"""(z=>{ const G=GAME.G, f=document.getElementById('fade'); return {zone:G&&G.zone, entering:GAME.isEntering?GAME.isEntering():null, loading:ASSETS.loadingNow?ASSETS.loadingNow():null,
  fade:f?f.classList.contains('on'):null, chars:!GAME.charsAllP||!!GAME.charsAll, dlg:!!(GAME.D&&GAME.D.active)}; })"""
ZDATA_JS = r"""(()=>{ const E=GAME.E; const drv=o=>{ let d=null; o.traverse(c=>{ if(!d&&c.userData&&c.userData.driver) d=c.userData.driver; }); return d||'none'; };
  const npc={}, procWho=[]; for(const n of E.npcs||[]){ const k=drv(n.obj); npc[k]=(npc[k]||0)+1; if(k!=='vrm'&&k!=='glb') procWho.push(n.id||n.name||n.charId||'?'); }
  const req=(GAME._zoneReq||[]).map(k=>{ const m=ASSETS.manifest[k]||{}; return {k, type:m.type||null, cached:!!ASSETS.cache[k], url:m.url||null}; });
  const za=(typeof ZONE_ASSETS!=='undefined'&&ZONE_ASSETS[GAME.G.zone])||[];
  return {player:E.player?drv(E.player.obj):null, npc, npcTotal:(E.npcs||[]).length, proc:procWho.length, procWho:procWho.slice(0,10),
    reqTotal:req.length, notCached:req.filter(r=>!r.cached), bldgFallback:req.filter(r=>!r.cached&&r.type==='building').map(r=>r.k),
    zoneAssetsNotReq:za.filter(k=>!(GAME._zoneReq||[]).includes(k)), charFail:(CHAR.failures||[]).slice(), assetErr:(ASSETS.errors||[]).map(e=>String(e&&e.message||e).slice(0,200)), frame:E.frame|0}; })()"""


async def zone_list(pg):
    return sorted(await pg.evaluate("Object.keys(Z3.ZONES)"))


async def part_z3d(b, url, part, n):
    tag = 'root' if part.startswith('Z3D_ROOT') else 'dist'
    print('== %s（②：區域第 %d 批，%s）' % (part, n, '包 dist/web' if tag == 'dist' else 'repo 根目錄（對照）'), flush=True)
    ctx, pg, cdp, net = await open_game(b, url, part)
    allz = await zone_list(pg)
    batch = [z for z in os.environ['ZONES'].split(',') if z] if os.environ.get('ZONES') else allz[(n - 1) * ZB:n * ZB]
    note('遊戲共 %d 區（Z3.ZONES）；每批 %d 區＝%d 批；這一批：%s' % (len(allz), ZB, math.ceil(len(allz) / ZB), ','.join(batch)))
    if n == 1: wjson('zones_all_%s.json' % tag, allz)
    setup('每區用 GAME.applySave 讀檔進去（第 8 天 11:00 晴天、條件事件關掉；和 tests/deploy_check.py、smoke_dist.js 同一個做法），不是照劇情走進去')
    rows = []
    for z in batch:
        net.mark = z; t = time.time(); err = None
        st = {'zone': z, 'hour': 11.0, 'day': 8, 'weekday': 6, 'weather': 'sunny', 'pos': None, 'flags': FLAGS}
        try:
            await quiet_load(pg, st, 150)
        except Exception as e:
            err = repr(e)[:200]
        r = None
        for i in range(240):
            r = await pg.evaluate(READY_JS, z)
            if r['zone'] == z and not r['entering'] and not r['loading'] and not r['fade']: break
            if r['dlg']: await pg.evaluate("(()=>{ try{ GAME.dlgAdvance(); }catch(e){} })()")
            await pg.wait_for_timeout(500)
        t_ready = time.time() - t
        d0 = await pg.evaluate(ZDATA_JS); d = d0; t1 = time.time()
        while d['proc'] and time.time() - t1 < NPC_SETTLE:
            await pg.wait_for_timeout(1000); d = await pg.evaluate(ZDATA_JS)
        row = {'zone': z, 'ok': r['zone'] == z and not err, 'err': err, 'readyS': round(t_ready, 1), 'ready': r, 'procAtReady': d0['proc'], 'settleS': round(time.time() - t1, 1)}
        row.update(d); row['bad'] = [x for x in net.real_bad() if x['at'] == z]
        try:
            await pg.screenshot(path=os.path.join(OUT, 'z3d_%s_%s.jpg' % (tag, z)), type='jpeg', quality=60)
        except Exception as e:
            row['shotErr'] = repr(e)[:120]
        rows.append(row)
        loaded = r['zone'] == z and not r['entering'] and not r['loading'] and not r['fade']
        check('[%s] %s 進得去、載完（%.1f 秒）' % (part, z, t_ready), row['ok'] and loaded, J({'ready': r, 'err': err}))
        check('[%s] %s 玩家與 NPC 都是正式模型（程序化／沒有模型 0；等 %.0f 秒後）' % (part, z, row['settleS']), d['proc'] == 0 and d['player'] in ('vrm', 'glb'),
              J({'player': d['player'], 'npc': d['npc'], 'procWho': d['procWho'], 'procAtReady': d0['proc']}))
        check('[%s] %s 這一區要的建築 GLB 都進了快取（沒有退回備用）' % (part, z), not d['bldgFallback'], J({'bldgFallback': d['bldgFallback'], 'notCached': [x['k'] for x in d['notCached']]}))
        check('[%s] %s 本機資源都 200' % (part, z), not row['bad'], J(row['bad'][:6]))
    end = await pg.evaluate("({charFail:(CHAR.failures||[]).slice(0,30),assetErr:(ASSETS.errors||[]).map(e=>String(e&&e.message||e).slice(0,200)).slice(0,30)})")
    check('[%s] 整批結束 CHAR.failures 空的' % part, not end['charFail'], J(end['charFail']))
    check('[%s] 整批結束 ASSETS.errors 空的' % part, not end['assetErr'], J(end['assetErr']))
    wjson('zones_%s_%d.json' % (tag, n), {'tag': tag, 'batch': n, 'zb': ZB, 'zonesTotal': len(allz), 'rows': rows, 'end': end, 'pack': PACKINFO})
    net.report(part); await ctx.close()


# ---------------- ③ 2D ----------------
P2D_PAGE = {}


async def p2d_page(b, dist_url):
    if 'pg' in P2D_PAGE: return P2D_PAGE['pg'], P2D_PAGE['cdp'], P2D_PAGE['net']
    ctx, pg, cdp, net = await open_game(b, dist_url, 'P2D')
    setup('讀檔到宿舍（第 8 天 11:00、條件事件關掉），之後直接呼叫 ADV／MOVIES 的顯示函式（不是照劇情演到那一幕）')
    await quiet_load(pg, {'zone': 'dorm', 'hour': 11.0, 'day': 8, 'weekday': 6, 'weather': 'sunny', 'pos': None, 'flags': FLAGS})
    await pg.wait_for_timeout(2000)
    P2D_PAGE.update({'ctx': ctx, 'pg': pg, 'cdp': cdp, 'net': net})
    return pg, cdp, net


PORTRAIT_JS = r"""(async([id,of,ex,url])=>{ const sl=ms=>new Promise(r=>setTimeout(r,ms)); if(!ADV.active) ADV.begin({background:'dark'});
  const rs=ADV.resolve(id,of,ex); ADV.show('right',id,ex,of); const t0=performance.now(); let im=null;
  while(performance.now()-t0<10000){ if(ADV.missing&&ADV.missing[url]) return {ok:false,why:'missing（圖載不到）',chain0:rs.chain&&rs.chain[0]};
    im=ADV.R&&ADV.R.querySelector('img'); if(im&&decodeURI(im.src).endsWith(url)&&im.complete&&im.naturalWidth>0) return {ok:true,w:im.naturalWidth,h:im.naturalHeight,chain0:rs.chain&&rs.chain[0]};
    await sl(100); }
  return {ok:false,why:rs.placeholder?'placeholder（遊戲找不到這個人的立繪登錄）':'timeout',src:im&&decodeURI(im.src).split('/').slice(-4).join('/'),chain0:rs.chain&&rs.chain[0]}; })"""
CG_JS = r"""(async([id,file])=>{ const sl=ms=>new Promise(r=>setTimeout(r,ms)); if(ADV.active) ADV.end(); await sl(60); ADV.begin({background:'dark'});
  if(!ADV.cg(id)) return {ok:false,why:'ADV.cg 回 false'}; let im=null, err=null;
  try{ im=await Promise.race([ADV.cache[file],sl(15000).then(()=>null)]); }catch(e){ err=String(e&&e.message||e).slice(0,120); }
  for(let i=0;i<20&&!/\bcg\b/.test(ADV.root.className);i++) await sl(100);
  const cls=ADV.root.className, bg=ADV.cgEl?ADV.cgEl.style.backgroundImage:''; const has=decodeURI(bg).includes(file);
  return {ok:!!im&&im.naturalWidth>0&&/\bcg\b/.test(cls)&&has,w:im&&im.naturalWidth,h:im&&im.naturalHeight,cls,bgHas:has,err,missing:!!(ADV.missing&&ADV.missing[file])}; })"""
BG_JS = r"""(async([k,img])=>{ const sl=ms=>new Promise(r=>setTimeout(r,ms)); if(ADV.active) ADV.end(); await sl(60); ADV.begin({background:{image:img}});
  let im=null, err=null; try{ im=await Promise.race([ADV.cache[img],sl(15000).then(()=>null)]); }catch(e){ err=String(e&&e.message||e).slice(0,120); }
  await sl(120); const cls=ADV.root.className, bg=decodeURI(ADV.bg.style.backgroundImage||'');
  return {ok:!!im&&im.naturalWidth>0&&/\bimage\b/.test(cls)&&bg.includes(img),w:im&&im.naturalWidth,h:im&&im.naturalHeight,cls,err,missing:!!(ADV.missing&&ADV.missing[img])}; })"""
SHEET_JS = r"""(async([urls,labels,W,H,cols])=>{ const rows=Math.ceil(urls.length/cols); const c=document.createElement('canvas'); c.width=W*cols; c.height=(H+12)*rows; const g=c.getContext('2d'); g.fillStyle='#222'; g.fillRect(0,0,c.width,c.height); g.font='9px sans-serif';
  for(let i=0;i<urls.length;i++){ const x=(i%cols)*W, y=Math.floor(i/cols)*(H+12); const im=await new Promise(r=>{ const q=new Image(); q.onload=()=>r(q); q.onerror=()=>r(null); q.src=urls[i]; });
    if(im){ const s=Math.min(W/im.naturalWidth,H/im.naturalHeight); g.drawImage(im,x+(W-im.naturalWidth*s)/2,y,im.naturalWidth*s,im.naturalHeight*s); } else { g.fillStyle='#a00'; g.fillRect(x,y,W,H); }
    g.fillStyle='#ddd'; g.fillText(String(labels[i]).slice(0,18),x+2,y+H+9); }
  return c.toDataURL('image/jpeg',0.7); })"""


def save_dataurl(u, fn):
    if u: open(os.path.join(OUT, fn), 'wb').write(base64.b64decode(u.split(',', 1)[1]))


async def sheets(pg, urls, labels, prefix, W, H, cols, per=240):
    for i in range(0, len(urls), per):
        save_dataurl(await pg.evaluate(SHEET_JS, [urls[i:i + per], labels[i:i + per], W, H, cols]), '%s_%02d.jpg' % (prefix, i // per + 1))


async def part_portrait(b, dist_url):
    print('== P2D_PORTRAIT（③：每位每套每個表情，ADV.show）', flush=True)
    pg, cdp, net = await p2d_page(b, dist_url); net.mark = 'P2D_PORTRAIT'
    items = await pg.evaluate("(()=>{ const o=[]; for(const id of Object.keys(PORTRAIT_FILES).sort()) for(const of of Object.keys(PORTRAIT_FILES[id]||{}).sort()) for(const ex of PORTRAIT_FILES[id][of]||[]) o.push([id,of,ex,'assets/portraits/'+id+'/'+of+'/'+ex+'.webp']); return o; })()")
    note('PORTRAIT_FILES：%d 人、%d 張' % (len(set(x[0] for x in items)), len(items)))
    if LIMIT: items = items[:LIMIT]
    rows = []; bad = []
    for it in items:
        r = await pg.evaluate(PORTRAIT_JS, it); r['k'] = '/'.join(it[:3]); rows.append(r)
        if not r['ok']: bad.append(r)
    await pg.evaluate("(()=>{ if(ADV.active) ADV.end(); })()")
    wjson('p2d_portrait.json', rows)
    check('[P2D_PORTRAIT] %d 張立繪用 ADV.show 都顯示得出來（img 是那一張、naturalWidth>0）' % len(items), not bad, J(bad[:12]))
    sizes = {}
    for r in rows:
        if r.get('w'): sizes['%dx%d' % (r['w'], r['h'])] = sizes.get('%dx%d' % (r['w'], r['h']), 0) + 1
    note('立繪尺寸分布：%s' % J(sorted(sizes.items(), key=lambda x: -x[1])[:10]))
    await sheets(pg, [x[3] for x in items], ['/'.join(x[:3]) for x in items], 'p2d_portrait_sheet', 60, 140, 24)


async def part_cg(b, dist_url, cdp_tap=True):
    print('== P2D_CG（③：事件 CG，ADV.cg＋相簿）', flush=True)
    pg, cdp, net = await p2d_page(b, dist_url); net.mark = 'P2D_CG'
    items = await pg.evaluate("Object.keys(CG_REGISTRY).map(k=>[k,CG_REGISTRY[k].file])")
    note('CG_REGISTRY：%d 張' % len(items))
    if LIMIT: items = items[:LIMIT]
    rows = []; bad = []
    for it in items:
        r = await pg.evaluate(CG_JS, it); r['id'] = it[0]; r['file'] = it[1]; rows.append(r)
        if not r['ok']: bad.append(r)
    await pg.evaluate("(()=>{ if(ADV.active) ADV.end(); })()")
    wjson('p2d_cg.json', rows)
    check('[P2D_CG] %d 張 CG 用 ADV.cg 顯示得出來（圖載好、#adv 有 cg、底圖是那一張）' % len(items), not bad, J(bad[:10]))
    await sheets(pg, [x[1] for x in items], [x[0] for x in items], 'p2d_cg_sheet', 160, 90, 10)
    # 相簿（玩家的看法）：【捷徑】全部設成解鎖
    setup('把 CG_REGISTRY 全部放進 G.cg.unlocked（相簿要解鎖才看得到），之後用手指按手機 → 相簿')
    await pg.evaluate("(ids=>{ GAME.G.cg=GAME.G.cg||{unlocked:[]}; GAME.G.cg.unlocked=ids.slice(); })(%s)" % J([x[0] for x in items]))
    await pg.wait_for_timeout(500)
    await L.close_panels(pg, cdp)
    if await pg.evaluate("document.getElementById('phone').classList.contains('hide')"):
        await L.tap(pg, cdp, '#btnPhone'); await pg.wait_for_timeout(1200)
    await L.tap(pg, cdp, '#phoneTabs button[data-ptab="album"]'); await pg.wait_for_timeout(1500)
    alb = await pg.evaluate(r"""(async()=>{ const L=[...document.querySelectorAll('.alb')].map(e=>({cap:(e.querySelector('.cap')||{}).textContent||'', bg:(getComputedStyle(e).backgroundImage.match(/url\("?([^")]+)"?\)/)||[])[1]||''}));
      for(const a of L){ if(!a.bg){ a.ok=null; continue; } a.ok=await new Promise(r=>{ const q=new Image(); q.onload=()=>r(q.naturalWidth>0); q.onerror=()=>r(false); q.src=a.bg; }); } return L; })()""")
    cgs = [a for a in alb if '/assets/cg/' in a['bg']]
    try:
        await pg.screenshot(path=os.path.join(OUT, 'p2d_album.jpg'), type='jpeg', quality=60)
    except Exception:
        pass
    check('[P2D_CG] 相簿裡的 CG 張數＝解鎖的 %d 張' % len(items), len(cgs) == len(items), '相簿 .alb %d 個，其中 CG %d 個' % (len(alb), len(cgs)))
    check('[P2D_CG] 相簿每張 CG 都載得到', all(a['ok'] for a in cgs), J([a['bg'].split('/assets/')[-1] for a in cgs if not a['ok']][:10]))
    await L.close_panels(pg, cdp)


POSTER_JS = r"""(async()=>{ const M=NANYANG_MOVIES, out=[]; for(const p of M.periods) for(const b of p.bill){ const url=MOVIES.posterUrl(b.id); const r={id:b.id,period:p.from,title:b.title,url,inList:MOVIES.POSTERS.includes(b.id)};
    if(url){ try{ const f=await fetch(url,{cache:'no-store'}); r.status=f.status; }catch(e){ r.status='ERR'; } r.img=await new Promise(res=>{ const im=new Image(); im.onload=()=>res([im.naturalWidth,im.naturalHeight]); im.onerror=()=>res(null); im.src=url; }); } out.push(r); } return out; })()"""
ALL72_JS = r"""(async()=>{ const M=NANYANG_MOVIES, ids=[]; for(const p of M.periods) for(const b of p.bill) ids.push(b);
  const W=128, H=192, C=12, rows=Math.ceil(ids.length/C), k=document.createElement('canvas'); k.width=W*C; k.height=(H+18)*rows; const g=k.getContext('2d'); g.fillStyle='#222'; g.fillRect(0,0,k.width,k.height);
  for(let i=0;i<ids.length;i++){ const b=ids[i], url=MOVIES.posterUrl(b.id); const x=(i%C)*W, y=Math.floor(i/C)*(H+18); const im=url?await new Promise(res=>{ const q=new Image(); q.onload=()=>res(q); q.onerror=()=>res(null); q.src=url; }):null;
    if(im){ const c=MOVIES.drawPoster(im,b.title); if(c) g.drawImage(c,x,y,W,H); } else { g.fillStyle='#a00'; g.fillRect(x,y,W,H); }
    g.fillStyle='#ddd'; g.font='12px sans-serif'; g.fillText(b.id,x+4,y+H+13); }
  return k.toDataURL('image/jpeg',0.75); })()"""


async def part_poster(b, dist_url):
    print('== P2D_POSTER（③：南洋戲院海報）', flush=True)
    pg, cdp, net = await p2d_page(b, dist_url); net.mark = 'P2D_POSTER'
    res = await pg.evaluate(POSTER_JS)
    wjson('p2d_poster.json', res)
    check('[P2D_POSTER] 片單一共 72 部', len(res) == 72, str(len(res)))
    bad = [[r['id'], r.get('status'), r.get('img')] for r in res if not r.get('url') or r.get('status') != 200 or not r.get('img')]
    check('[P2D_POSTER] 每一張海報 fetch 200、Image 解得開', not bad, J(bad[:12]))
    save_dataurl(await pg.evaluate(ALL72_JS), 'p2d_poster_all.jpg')
    note('MOVIES.drawPoster（遊戲把片名畫上海報的函式）畫出來的總表：p2d_poster_all.jpg')


async def part_bg(b, dist_url):
    print('== P2D_BG（③：OUT.BG 每個代號，ADV 背景）', flush=True)
    pg, cdp, net = await p2d_page(b, dist_url); net.mark = 'P2D_BG'
    items = await pg.evaluate("Object.keys(OUT.BG).sort().map(k=>[k,(OUT.BG[k]||{}).image||null])")
    noimg = [k for k, v in items if not v]
    note('OUT.BG：%d 個代號，其中 %d 個有圖、%d 個 image:null（遊戲用深色底＋字幕）：%s' % (len(items), len(items) - len(noimg), len(noimg), J(noimg[:30])))
    files = await pg.evaluate("(async()=>{ try{ const m=await (await fetch('manifest.json',{cache:'no-store'})).json(); return m.files.map(f=>f.path).filter(p=>p.startsWith('assets/bg/')); }catch(e){ return null; } })()")
    if files is not None:
        used = set(v for k, v in items if v)
        unref = [f for f in files if f not in used]
        note('包裡 assets/bg/ %d 個檔；OUT.BG 沒指到的 %d 個（可能是相簿 memory、約會、夜景用的；INFO）：%s' % (len(files), len(unref), J(unref[:20])))
    items = [x for x in items if x[1]]
    if LIMIT: items = items[:LIMIT]
    rows = []; bad = []
    for it in items:
        r = await pg.evaluate(BG_JS, it); r['k'] = it[0]; r['img'] = it[1]; rows.append(r)
        if not r['ok']: bad.append(r)
    await pg.evaluate("(()=>{ if(ADV.active) ADV.end(); })()")
    wjson('p2d_bg.json', rows)
    check('[P2D_BG] %d 張背景用 ADV.begin({background:{image}}) 顯示得出來（沒有退回模糊底）' % len(items), not bad, J(bad[:10]))
    await sheets(pg, [x[1] for x in items], [x[0] for x in items], 'p2d_bg_sheet', 128, 72, 12)


# ---------------- ④ 地圖進出 ----------------
EXIT_JS = r"""(([dst])=>{ const E=GAME.E; const L=E.interactables.filter(i=>i.exit&&!i.hidden).map(i=>({label:i.label,x:i.x,z:i.z,r:i.radius||1.5,lv:i.lv|0,to:typeof i.exit.to==='string'?i.exit.to:JSON.stringify(i.exit.to).slice(0,40)}));
  return {exits:L, hit:L.filter(e=>e.to===dst)}; })"""
PLACE_JS = r"""(([ex,D])=>{ const E=GAME.E, P=E.player; const all=E.interactables.filter(i=>i.exit&&!i.hidden); let best=null;
  for(let k=0;k<24;k++){ const a=k/24*Math.PI*2; for(const d of [D,D*0.75,D*1.3,D*0.5]){ const q=E.nav.nearestFree(ex.x+Math.cos(a)*d,ex.z+Math.sin(a)*d,1.0); if(!q) continue;
      if(E.canStand&&!E.canStand(q[0],q[1],0.33,0)) continue; if(all.some(i=>Math.hypot(i.x-q[0],i.z-q[1])<(i.radius||1.5)+1)) continue;
      const p=E.pathTo(q[0],q[1],0,ex.x,ex.z,0); if(!p||!p.length) continue; let len=0, px=q[0], pz=q[1]; for(const s of p){ len+=Math.hypot(s[0]-px,s[1]-pz); px=s[0]; pz=s[1]; }
      if(len>d*1.8+3) continue; const sc=Math.abs(d-D)+len*0.1; if(!best||sc<best.sc) best={x:q[0],z:q[1],len,sc,d}; break; } }
  if(!best) return null; P.obj.position.set(best.x,0,best.z); P.path=null; P.target=null; return best; })"""
STEER_JS = r"""(([tx,tz])=>{ const E=GAME.E, o=E.player.obj.position; const p=E.pathTo(o.x,o.z,E.player.lv|0,tx,tz,E.player.lv|0); let w=[tx,tz];
  if(p&&p.length){ let acc=0, px=o.x, pz=o.z; w=[p[p.length-1][0],p[p.length-1][1]]; for(const s of p){ acc+=Math.hypot(s[0]-px,s[1]-pz); px=s[0]; pz=s[1]; if(acc>=2.2){ w=[s[0],s[1]]; break; } } }
  const dx=w[0]-o.x, dz=w[1]-o.z, n=Math.hypot(dx,dz)||1, ux=dx/n, uz=dz/n, y=E.cam.yaw; const fx=-Math.sin(y), fz=-Math.cos(y), rx=Math.cos(y), rz=-Math.sin(y);
  return {jr:ux*rx+uz*rz, jf:ux*fx+uz*fz, dist:Math.hypot(tx-o.x,tz-o.z), path:!!(p&&p.length)}; })"""


async def wait_zone(pg, cdp, dst, max_s=60):
    t = time.time(); adv = 0
    while time.time() - t < max_s:
        s = await L.state(pg)
        if s['zone'] == dst and not s['busy'] and not s['dlg']:
            for k in range(30):
                if not await pg.evaluate("(()=>{ const f=document.getElementById('fade'); return !!(f&&f.classList.contains('on')); })()"): break
                await pg.wait_for_timeout(200)
            return s, adv
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); adv += 1
        elif s['choices']:
            await L.tap(pg, cdp, '#choices button'); adv += 1
        await pg.wait_for_timeout(400)
    return await L.state(pg), adv


async def hop(pg, cdp, net, src, dst):
    net.mark = '%s>%s' % (src, dst)
    setup('讀檔到 %s（第 8 天 11:00、條件事件關掉），把玩家放在往 %s 的出口前約 %.0f m（人站得住、走得到）' % (src, dst, START_D))
    await quiet_load(pg, {'zone': src, 'hour': 11.0, 'day': 8, 'weekday': 6, 'weather': 'sunny', 'pos': None, 'flags': FLAGS})
    await pg.wait_for_timeout(1500)
    ex = await pg.evaluate(EXIT_JS, [dst])
    if not ex['hit']:
        check('[MAPS] %s 有往 %s 的出口' % (src, dst), False, J(ex['exits'][:12])); return None
    e = ex['hit'][0]
    pl = await pg.evaluate(PLACE_JS, [e, START_D])
    if not pl:
        check('[MAPS] %s：出口「%s」前找得到起點' % (src, e['label']), False, J(e)); return None
    await pg.wait_for_timeout(800)
    t = time.time(); pushes = 0; how = None; s = None; last = []
    while time.time() - t < 150:
        s = await L.state(pg)
        if s['zone'] == dst: how = '走進觸發範圍自己換區域'; break
        if s['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
        if s['interact'] and (s['interact'] in e['label'] or e['label'].startswith(s['interact'][:6])):
            await L.tap(pg, cdp, '#interact'); how = '按互動鈕「%s」' % s['interact']; break
        g = await pg.evaluate(STEER_JS, [e['x'], e['z']])
        R = 58
        await L.joystick(pg, cdp, round(g['jr'] * R), round(-g['jf'] * R), 700); pushes += 1
        last.append(round(g['dist'], 1)); last = last[-8:]
        if len(last) == 8 and max(last) - min(last) < 0.3:
            note('[MAPS] %s>%s：推了 8 次距離沒變（%s），試著轉鏡頭' % (src, dst, J(last)))
            await L.turn_camera_to(pg, cdp, e['x'], e['z']); last = []
    walk_s = time.time() - t
    if not how:
        check('[MAPS] %s → %s：用搖桿走到出口「%s」（150 秒內）' % (src, dst, e['label']), False, J({'start': pl, 'end': s, 'pushes': pushes})); return None
    s2, adv = await wait_zone(pg, cdp, dst)
    stand = await pg.evaluate("(()=>{ const E=GAME.E, o=E.player.obj.position; return E.canStand?E.canStand(o.x,o.z,0.3,E.player.lv|0):null; })()")
    try:
        await pg.screenshot(path=os.path.join(OUT, 'maps_%s_to_%s.jpg' % (src, dst)), type='jpeg', quality=60)
    except Exception:
        pass
    check('[MAPS] %s → %s：搖桿走 %.1f m（%d 次、%.0f 秒）、%s、到了 %s 站得住' % (src, dst, pl['len'], pushes, walk_s, how, dst), s2['zone'] == dst and stand is not False,
          J({'label': e['label'], 'arrive': [s2['x'], s2['z']], 'stand': stand, 'dialogTaps': adv, 'walkFallbacks': s2.get('fallbacks')}))
    return s2


async def shortcut_exits(pg, cdp, net, z):
    net.mark = 'X:' + z
    setup('【捷徑】讀檔到 %s（第 8 天 11:00），把玩家放在出口旁邊、直接按互動（不走路）' % z)
    try:
        await quiet_load(pg, {'zone': z, 'hour': 11.0, 'day': 8, 'weekday': 6, 'weather': 'sunny', 'pos': None, 'flags': FLAGS})
    except Exception as ex:
        check('[MAPS] %s 讀得進去' % z, False, repr(ex)[:200]); return
    await pg.wait_for_timeout(1500)
    zz = await pg.evaluate("GAME.G.zone")
    if not check('[MAPS] %s 讀得進去' % z, zz == z, zz): return
    exits = (await pg.evaluate(EXIT_JS, ['']))['exits']
    note('[MAPS] %s 的出口：%s' % (z, J(exits)))
    zones = await pg.evaluate("Object.keys(Z3.ZONES)")
    tgt = [e for e in exits if e['to'] in zones and e['to'] != z]
    if not tgt:
        check('[MAPS] %s 有通到別的 3D 區域的出口' % z, False, J(exits)); return
    e = tgt[0]
    use = r"""((lb)=>{ const E=GAME.E, P=E.player; const it=E.interactables.find(i=>i.label===lb&&i.exit); const nf=E.nav.nearestFree(it.x,it.z,6)||[it.x,it.z]; P.obj.position.set(nf[0],0,nf[1]); P.path=null; P.target=null; GAME.updateInteract&&GAME.updateInteract(); return true; })"""
    await pg.evaluate(use, e['label']); await pg.wait_for_timeout(800)
    s = await L.state(pg)
    if s['interact']: await L.tap(pg, cdp, '#interact')
    else: await pg.evaluate("(()=>{ GAME.doInteract(); })()")
    s2, adv = await wait_zone(pg, cdp, e['to'])
    check('[MAPS] %s →「%s」→ %s' % (z, e['label'], e['to']), s2['zone'] == e['to'], J({'arrive': s2['zone'], 'xy': [s2['x'], s2['z']], 'taps': adv}))
    back = [x for x in (await pg.evaluate(EXIT_JS, [z]))['hit']]
    if not back:
        note('[MAPS] %s 沒有直接回 %s 的出口（INFO）' % (e['to'], z)); return
    await pg.evaluate(use, back[0]['label']); await pg.wait_for_timeout(800)
    s = await L.state(pg)
    if s['interact']: await L.tap(pg, cdp, '#interact')
    else: await pg.evaluate("(()=>{ GAME.doInteract(); })()")
    s3, adv = await wait_zone(pg, cdp, z)
    check('[MAPS] %s →「%s」→ 回到 %s' % (e['to'], back[0]['label'], z), s3['zone'] == z, J({'arrive': s3['zone'], 'xy': [s3['x'], s3['z']]}))


async def home_trip(pg, cdp, net):
    net.mark = 'home'
    setup('【捷徑】讀檔到宿舍、第 12 天（週五）18:00，條件事件關掉；呼叫 HOME.go(GAME)（＝手機「地點」的「回家」），之後對話用手指點、選單選「回宿舍」')
    await quiet_load(pg, {'zone': 'dorm', 'hour': 18.0, 'day': 12, 'weekday': 5, 'weather': 'sunny', 'pos': None, 'flags': FLAGS})
    await pg.wait_for_timeout(1500)
    can = await pg.evaluate("(()=>({canGo:HOME.canGo(GAME.G),at:HOME.at(GAME.G)}))()")
    if not check('[MAPS] 家：週五 18:00 可以回家（HOME.canGo）', can['canGo'], J(can)): return
    await pg.evaluate("(()=>{ void HOME.go(GAME); })()")
    arrived = False; left = False; picks = []; bg = None
    for i in range(160):
        st = await pg.evaluate("(()=>{ const ch=document.getElementById('choices'); const cs=(ch&&!ch.classList.contains('hide'))?[...ch.querySelectorAll('button')].map(b=>(b.textContent||'').trim()):[]; return {at:HOME.at(GAME.G), dlg:!!(GAME.D&&GAME.D.active), cs, zone:GAME.G.zone, advBg:(ADV.bg&&ADV.bg.style.backgroundImage)||'', advCls:(ADV.root&&ADV.root.className)||''}; })()")
        if st['at'] and not arrived:
            arrived = True; bg = {'advBg': st['advBg'][-60:], 'advCls': st['advCls']}
            try:
                await pg.screenshot(path=os.path.join(OUT, 'maps_home.jpg'), type='jpeg', quality=60)
            except Exception:
                pass
        if arrived and not st['at']:
            left = True; break
        if st['cs']:
            k = next((j for j, c in enumerate(st['cs']) if '回宿舍' in c), None)
            if k is None: k = next((j for j, c in enumerate(st['cs']) if c.startswith('不用') or '先不' in c), 0)
            picks.append(st['cs'][k][:12])
            await pg.evaluate("(i=>{ const b=document.querySelectorAll('#choices button')[i]; b.scrollIntoView({block:'center'}); })(%d)" % k)
            c = await pg.evaluate("(i=>{ const r=document.querySelectorAll('#choices button')[i].getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })(%d)" % k)
            await L.touch_tap(cdp, c[0], c[1])
        elif st['dlg']:
            await L.tap(pg, cdp, '#dlg')
        await pg.wait_for_timeout(600)
    s, adv = await wait_zone(pg, cdp, 'dorm', 40)
    check('[MAPS] 家：到家（HOME.at）', arrived, J(bg))
    check('[MAPS] 家：選「回宿舍」離開、回到 3D（宿舍）', left and s['zone'] in ('dorm', 'dorm_205', 'dorm_hall'), J({'zone': s['zone'], 'picks': picks[:12]}))


async def part_maps(b, dist_url):
    print('== MAPS（④：校園⇄公館⇄溫州街⇄118 巷用搖桿走過門；美國、日本、家【捷徑】進出）', flush=True)
    ctx, pg, cdp, net = await open_game(b, dist_url, 'MAPS')
    hops = [h.split('>') for h in (os.environ.get('HOPS') or 'campus>gongguan,gongguan>campus,gongguan>wenzhou,wenzhou>gongguan,wenzhou>lane118,lane118>wenzhou').split(',') if '>' in h]
    for src, dst in hops:
        try:
            await hop(pg, cdp, net, src, dst)
        except Exception as ex:
            check('[MAPS] %s → %s 沒有中斷' % (src, dst), False, repr(ex)[:300])
    for z in [x for x in (os.environ.get('XZONES') or 'us_outside,jp_hub').split(',') if x]:
        try:
            await shortcut_exits(pg, cdp, net, z)
        except Exception as ex:
            check('[MAPS] %s 進出沒有中斷' % z, False, repr(ex)[:300])
    if os.environ.get('HOME_TRIP', '1') == '1':
        try:
            await home_trip(pg, cdp, net)
        except Exception as ex:
            check('[MAPS] 家進出沒有中斷', False, repr(ex)[:300])
    net.report('MAPS'); await ctx.close()


# ---------------- ⑤ 存檔 ----------------
SNAP_JS = "(()=>{ const G=GAME.G; return G?{name:G.name, day:G.day, hour:+(+G.hour).toFixed(2), zone:G.zone, money:G.money, stage:G.stage, nflags:Object.keys(G.flags||{}).length}:null; })()"
LS_JS = "(()=>{ const o={}; for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if(/^fatiao3d_/.test(k)) o[k]=(localStorage.getItem(k)||'').length; } return o; })()"


async def open_menu_save(pg, cdp):
    await L.close_panels(pg, cdp)
    await L.tap(pg, cdp, '#btnMenu'); await pg.wait_for_timeout(900)
    await L.tap(pg, cdp, '#menu button[data-tab="save"]'); await pg.wait_for_timeout(900)


async def slot_btn(pg, cdp, label, text):
    """#saveSlots 裡標題是 label 的那一格，按文字是 text 的按鈕"""
    c = await pg.evaluate(r"""(([lb,tx])=>{ const it=[...document.querySelectorAll('#saveSlots .item')].find(d=>((d.querySelector('b')||{}).textContent||'').trim()===lb); if(!it) return null;
      const b=[...it.querySelectorAll('button')].find(x=>(x.textContent||'').trim()===tx); if(!b) return null; b.scrollIntoView({block:'center'}); const r=b.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })""", [label, text])
    if not c: return False
    await L.touch_tap(cdp, c[0], c[1]); return True


async def title_load_slot(pg, cdp, label):
    await L.tap(pg, cdp, '#btnLoadMenu'); await pg.wait_for_timeout(1200)
    if not await pg.evaluate("!!document.querySelector('#menu button[data-tab=\"save\"].on')"):
        await L.tap(pg, cdp, '#menu button[data-tab="save"]'); await pg.wait_for_timeout(800)
    ok = await slot_btn(pg, cdp, label, '讀取')
    if not ok: return None
    for i in range(240):
        r = await pg.evaluate("(()=>({title:!document.getElementById('titleScreen').classList.contains('hide'), entering:GAME.isEntering?GAME.isEntering():false, g:!!GAME.G, run:!!GAME.running}))()")
        if not r['title'] and not r['entering'] and r['g']: break
        await pg.wait_for_timeout(500)
    await pg.wait_for_timeout(1500)
    return await pg.evaluate(SNAP_JS)


async def new_game_play(pg, cdp, secs):
    """按「從法律系開始」，之後像玩家一樣點對話、選第一個選項，直到玩家可以自己走或時間到"""
    try:
        await pg.click('#btnNewLaw', timeout=10000); how = '一般點擊'
    except Exception:
        await L.tap(pg, cdp, '#btnNewLaw'); how = '手指點'
    t = time.time(); free_since = None
    while time.time() - t < secs:
        s = await L.state(pg)
        if s['dlg'] or s['choices'] or s['busy']: free_since = None
        if s['dlg']: await L.tap(pg, cdp, '#dlg')
        elif s['choices']: await L.tap(pg, cdp, '#choices button')
        elif s['busy']: pass
        elif free_since is None: free_since = time.time()
        elif time.time() - free_since > 6: break
        await L.phone_away(pg, cdp, 1)
        await pg.wait_for_timeout(600)
    return how, time.time() - t


async def part_save(b, dist_url):
    print('== SAVE（⑤：包裡新遊戲 → 存三格 → 匯出 → 重新整理 → 讀三格；origin 分開）', flush=True)
    ctx, pg, cdp = await new_page(b)
    net = Net('SAVE'); net.hook(pg, origin_of(dist_url))
    await pg.goto(dist_url, timeout=180000); check('[SAVE] 包載入完成', await L.wait_loaded(pg, 300))
    await pg.wait_for_timeout(1500)
    how, sec = await new_game_play(pg, cdp, float(os.environ.get('NEWGAME_S') or 240))
    s0 = await pg.evaluate(SNAP_JS)
    check('[SAVE] 按「從法律系開始」開新遊戲（%s）、點完開場 %.0f 秒' % (how, sec), bool(s0 and s0.get('zone')), J(s0))
    await open_menu_save(pg, cdp)
    s0 = await pg.evaluate(SNAP_JS)   # 選單開著＝遊戲暫停：存進去的就是這一刻
    for i in (1, 2, 3):
        ok = await slot_btn(pg, cdp, '欄位 %d' % i, '存檔'); await pg.wait_for_timeout(900)
        check('[SAVE] 選單 → 存檔 → 欄位 %d 的「存檔」' % i, ok)
    ls = await pg.evaluate(LS_JS); note('[SAVE] localStorage（包的 origin）：%s' % J(ls))
    check('[SAVE] 三格都寫進 localStorage', all(('fatiao3d_slot_%d' % i) in ls for i in (1, 2, 3)), J(ls))
    exp = None
    if await L.tap(pg, cdp, '#btnExport'):
        await pg.wait_for_timeout(800); exp = await pg.evaluate("(document.getElementById('exportText')||{}).value||''")
    check('[SAVE] 匯出文字（#btnExport → #exportText）有內容', bool(exp) and len(exp) > 200, '%d 字' % len(exp or ''))
    dl = None
    try:
        async with pg.expect_download(timeout=15000) as di:
            await L.tap(pg, cdp, '#btnDownload')
        d = await di.value; p = os.path.join(OUT, 'save_export_download.json'); await d.save_as(p); dl = os.path.getsize(p)
        try:
            txt = open(p, encoding='utf-8').read().strip(); obj = json.loads(txt) if txt.startswith('{') else json.loads(base64.b64decode(txt).decode('utf-8'))
            check('[SAVE] 下載的存檔檔案讀得出來、名字天數一樣', obj.get('name') == s0['name'] and obj.get('day') == s0['day'], J({'name': obj.get('name'), 'day': obj.get('day')}))
        except Exception as ex:
            check('[SAVE] 下載的存檔檔案讀得出來', False, repr(ex)[:160])
        os.remove(p)
    except Exception as ex:
        note('[SAVE] 下載（#btnDownload）沒有收到檔案：%s' % repr(ex)[:160])
    check('[SAVE] 匯出下載（#btnDownload）收到檔案', dl is not None, str(dl))
    await L.close_panels(pg, cdp)
    # 另一個 origin（repo 根目錄，另一個埠）看不看得到
    pg2 = await ctx.new_page(); await pg2.goto(URL, timeout=180000); await pg2.wait_for_timeout(3000)
    ls2 = await pg2.evaluate(LS_JS); await pg2.close()
    check('[SAVE] repo 根目錄（%s）看不到包（%s）的存檔：localStorage 依 origin 分開' % (origin_of(URL).split('//')[-1], origin_of(dist_url).split('//')[-1]),
          not any(k.startswith('fatiao3d_slot_') for k in ls2), J(ls2))
    await pg.reload(); check('[SAVE] 重新整理後載入完成', await L.wait_loaded(pg, 300)); await pg.wait_for_timeout(2000)
    for i in (1, 2, 3):
        if i > 1:
            await pg.reload(); await L.wait_loaded(pg, 300); await pg.wait_for_timeout(1500)
        s = await title_load_slot(pg, cdp, '欄位 %d' % i)
        same = bool(s) and all(s.get(k) == s0.get(k) for k in ('name', 'day', 'zone', 'money', 'stage')) and abs((s.get('hour') or 0) - (s0.get('hour') or 0)) < 0.25
        check('[SAVE] 標題「讀取」→ 欄位 %d：名字／天數／時間／地點／金錢一樣' % i, same, J({'load': s, 'saved': s0}))
    net.report('SAVE'); await ctx.close()


async def import_into(pg, cdp, text):
    """標題「讀取」→ 存檔頁 →「匯入」→ 貼上 →「匯入」"""
    await L.tap(pg, cdp, '#btnLoadMenu'); await pg.wait_for_timeout(1200)
    if not await pg.evaluate("!!document.querySelector('#menu button[data-tab=\"save\"].on')"):
        await L.tap(pg, cdp, '#menu button[data-tab="save"]'); await pg.wait_for_timeout(800)
    await L.tap(pg, cdp, '#btnImport'); await pg.wait_for_timeout(600)
    await pg.fill('#importText', text); await pg.wait_for_timeout(300)
    await L.tap(pg, cdp, '#btnImportGo')
    for i in range(240):
        r = await pg.evaluate("(()=>({title:!document.getElementById('titleScreen').classList.contains('hide'), entering:GAME.isEntering?GAME.isEntering():false, msg:(document.getElementById('importMsg')||{}).textContent||''}))()")
        if r['msg'].startswith('匯入失敗'): return {'err': r['msg']}
        if not r['title'] and not r['entering'] and await pg.evaluate("!!GAME.G"): break
        await pg.wait_for_timeout(500)
    await pg.wait_for_timeout(2500)
    s = await pg.evaluate(SNAP_JS)
    s['stand'] = await pg.evaluate("(()=>{ try{ const E=GAME.E, o=E.player.obj.position; return E.canStand?E.canStand(o.x,o.z,0.3,E.player.lv|0):null; }catch(e){ return null; } })()")
    return s


async def part_oldsave(b, dist_url):
    print('== OLDSAVE（⑤：舊存檔讀進包）', flush=True)
    fx = os.path.join(LW_TESTS, 'fixtures', 'user_save_day54_1110.json')
    ctx, pg, cdp = await new_page(b); net = Net('OLDSAVE'); net.hook(pg, origin_of(dist_url))
    await pg.goto(dist_url, timeout=180000); await L.wait_loaded(pg, 300); await pg.wait_for_timeout(1500)
    if os.path.exists(fx):
        raw = json.load(open(fx, encoding='utf-8')); sv = raw.get('data') or raw.get('save') or raw
        setup('repo 的 fixture tests/fixtures/user_save_day54_1110.json（11-10 使用者存檔，已在 repo 裡）轉成匯出文字格式（base64），用標題「讀取 → 匯入」貼進包')
        txt = base64.b64encode(json.dumps(sv, ensure_ascii=False).encode('utf-8')).decode('ascii')
        s = await import_into(pg, cdp, txt)
        check('[OLDSAVE] fixture day54 匯入包：名字／天數／地點一樣、站得住', s.get('name') == sv.get('name') and s.get('day') == sv.get('day') and s.get('zone') == sv.get('zone') and s.get('stand') is not False, J({'got': s, 'want': {k: sv.get(k) for k in ('name', 'day', 'zone', 'money')}}))
        try:
            await pg.screenshot(path=os.path.join(OUT, 'oldsave_fixture.jpg'), type='jpeg', quality=60)
        except Exception:
            pass
    else:
        check('[OLDSAVE] fixture 存在', False, fx)
    if URL2:
        setup('在舊版（url2）真的開新遊戲、點完開場、選單存欄位 1、匯出文字；再到包的標題「讀取 → 匯入」')
        pgo = await ctx.new_page(); cdpo = await ctx.new_cdp_session(pgo)
        await pgo.goto(URL2, timeout=180000); check('[OLDSAVE] 舊版載入完成', await L.wait_loaded(pgo, 300)); await pgo.wait_for_timeout(1500)
        ver = await pgo.evaluate("(document.getElementById('verLabel')||{}).textContent||''"); note('[OLDSAVE] 舊版標題字樣：%s' % ver)
        how, sec = await new_game_play(pgo, cdpo, float(os.environ.get('NEWGAME_S') or 180))
        so = await pgo.evaluate(SNAP_JS)
        await open_menu_save(pgo, cdpo); await slot_btn(pgo, cdpo, '欄位 1', '存檔'); await pgo.wait_for_timeout(800)
        await L.tap(pgo, cdpo, '#btnExport'); await pgo.wait_for_timeout(800)
        txt = await pgo.evaluate("(document.getElementById('exportText')||{}).value||''")
        check('[OLDSAVE] 舊版開新遊戲（%s，%.0f 秒）、存檔、匯出文字' % (how, sec), bool(so) and len(txt) > 200, J(so))
        await pgo.close()
        await pg.reload(); await L.wait_loaded(pg, 300); await pg.wait_for_timeout(1500)
        s = await import_into(pg, cdp, txt)
        check('[OLDSAVE] 舊版（%s）的存檔匯入包：名字／天數／時間／地點／金錢一樣、站得住' % ver.strip(), bool(so) and all(s.get(k) == so.get(k) for k in ('name', 'day', 'zone', 'money')) and s.get('stand') is not False, J({'got': s, 'want': so}))
    else:
        note('[OLDSAVE] 沒有 url2（要在舊版真的存，佇列用 kind game、SHA2=舊版、XARGS={url} {out} {url2}）')
    net.report('OLDSAVE'); await ctx.close()


def sub_test(script, args, label, timeout_min):
    sp = os.path.join(WT, 'tests', script)
    cmd = ([sys.executable, GPU_WRAP, sp] if GPU_WRAP else [sys.executable, sp]) + args
    note('%s：%s%s' % (label, 'gpu_wrap ' if GPU_WRAP else '', ' '.join([script] + args)))
    code, out, sec = run(cmd, timeout=int(timeout_min * 60))
    for ln in out.splitlines():
        if ln.startswith('PASS ') or ln.startswith('FAIL '):
            print(sanitize(ln[:5] + '[%s] ' % label + ln[5:])[:600], flush=True)
    print(tail(out, 6), flush=True)
    check('[%s] %s 結束碼 0（%.0f 秒）' % (label, script, sec), code == 0, 'exit %s' % code)


# ---------------- ⑥ Pages ----------------
async def part_pages(b):
    print('== PAGES（⑥：線上 GitHub Pages 沒被動到）', flush=True)
    code, out, _ = run(['git', '-C', WT, 'ls-remote', 'origin', 'refs/heads/main'], timeout=120)
    main = out.split()[0] if code == 0 and out.strip() else ''
    note('git ls-remote origin main：%s' % (main or out[:200]))
    check('[PAGES] 線上 main 還是 %s（打包任務沒有合併、沒有發布）' % EXPECT_MAIN[:9], main == EXPECT_MAIN, main)
    want = ''
    code, html, _ = run(['git', '-C', WT, 'show', '%s:index.html' % (main or EXPECT_MAIN)], timeout=60)
    m = re.search(r'版本 v([0-9][0-9.]*)（([0-9-]{10})）', html or '') if code == 0 else None
    if m: want = 'v%s（%s）' % (m.group(1), m.group(2))
    else: note('[PAGES] 本機沒有 main 那個 commit 的物件，讀不到 index.html 的版本（只記線上字樣）')
    ctx, pg, cdp = await new_page(b); net = Net('PAGES'); net.hook(pg, origin_of(LIVE))
    try:
        await pg.goto(LIVE, timeout=180000)
    except Exception as ex:
        check('[PAGES] 開得了線上版 %s' % LIVE, False, repr(ex)[:200]); await ctx.close(); return
    check('[PAGES] 線上版載入完成', await L.wait_loaded(pg, 400))
    ver = await pg.evaluate("(document.getElementById('verLabel')||{}).textContent||''")
    note('[PAGES] 線上標題字樣：%s' % ver)
    if want: check('[PAGES] 線上標題版本＝main 的 index.html（%s）' % want, want.split('（')[0] in ver, ver)
    try:
        await pg.screenshot(path=os.path.join(OUT, 'pages_title.jpg'), type='jpeg', quality=60)
    except Exception:
        pass
    try:
        await pg.click('#btnNewLaw', timeout=15000); how = '一般點擊'
    except Exception:
        await L.tap(pg, cdp, '#btnNewLaw'); how = '手指點'
    await pg.wait_for_timeout(25000)
    st = await pg.evaluate("(()=>{ try{ const G=GAME.G; return {zone:G&&G.zone, day:G&&G.day, running:!!GAME.running, title:!document.getElementById('titleScreen').classList.contains('hide'), charFail:(CHAR.failures||[]).slice(0,10), assetErr:(ASSETS.errors||[]).length}; }catch(e){ return {err:String(e)}; } })()")
    check('[PAGES] 線上版按「從法律系開始」（%s）25 秒後在遊戲裡、沒有退回備用模型' % how, bool(st.get('zone')) and not st.get('title') and not st.get('charFail') and not st.get('assetErr'), J(st))
    try:
        await pg.screenshot(path=os.path.join(OUT, 'pages_newgame.jpg'), type='jpeg', quality=60)
    except Exception:
        pass
    net.report('PAGES'); await ctx.close()


# ---------------- ⑦ 容量 ----------------
def part_size():
    print('== SIZE（⑦：重跑 size_report.py，和 SIZE_REPORT_2026-11-11 對）', flush=True)
    args = [sys.executable, os.path.join(WT, 'tools', 'release', 'size_report.py'), '--tree', '受測=%s' % WT, '--json', os.path.join(OUT, 'size.json'), '--md', os.path.join(OUT, 'size.md')]
    if os.environ.get('SIZE_ZIP') == '1': args.append('--zip')
    code, out, sec = run(args, timeout=1800)
    print(tail(out, 8), flush=True)
    for p in ('size.json', 'size.md'):
        fp = os.path.join(OUT, p)
        if os.path.exists(fp):
            with open(fp, encoding='utf-8') as f: t = f.read()
            with open(fp, 'w', encoding='utf-8') as f: f.write(sanitize(t))
    if not check('[SIZE] size_report.py 結束碼 0（%.0f 秒）' % sec, code == 0 and os.path.exists(os.path.join(OUT, 'size.json')), 'exit %s' % code): return
    now = json.load(open(os.path.join(OUT, 'size.json'), encoding='utf-8'))['trees'][0]
    ref = json.load(open(os.path.join(WT, 'docs', 'release', 'SIZE_REPORT_2026-11-11.json'), encoding='utf-8'))['trees']
    mb = lambda n: '%.2f MB' % (n / 1e6)
    for r in ref:
        note('對照「%s」（commit %s）' % (r['label'], (r['git'].get('commit') or '')[:9]))
        for k in ('web', 'win-stage'):
            a, c = now['packages'][k], r['packages'][k]
            note('  %s 包：這次 %d 個 %s；報告 %d 個 %s；差 %+d 個 %+.2f MB' % (k, a['files'], mb(a['bytes']), c['files'], mb(c['bytes']), a['files'] - c['files'], (a['bytes'] - c['bytes']) / 1e6))
        rc_ = {x['category']: x for x in r['categoriesPackage']}
        for x in now['categoriesPackage']:
            y = rc_.get(x['category'], {'files': 0, 'bytes': 0})
            note('  %-34s 這次 %4d 個 %12s；報告 %4d 個 %12s；差 %+.2f MB' % (x['category'], x['files'], mb(x['bytes']), y['files'], mb(y['bytes']), (x['bytes'] - y['bytes']) / 1e6))
    dev = ref[0]
    check('[SIZE] web 包的檔數、容量和報告（開發分支那一欄）差 ≤ 1%%（報告量的是 %s，受測是 %s）' % ((dev['git'].get('commit') or '')[:9], (now['git'].get('commit') or '')[:9]),
          abs(now['packages']['web']['bytes'] - dev['packages']['web']['bytes']) <= 0.01 * dev['packages']['web']['bytes'],
          '%s vs %s' % (mb(now['packages']['web']['bytes']), mb(dev['packages']['web']['bytes'])))
    note('包裡最大的 20 個檔（size_report largestPackage）：')
    for x in now['largestPackage'][:20]:
        note('  %10s  %s' % (mb(x['bytes']), x['path']))
    if PACKINFO:
        check('[SIZE] 這一行實際打出來的包＝size_report 算的 web 包（檔數、容量）', PACKINFO['files'] == now['packages']['web']['files'] and PACKINFO['bytes'] == now['packages']['web']['bytes'],
              '%d 個 %s vs %d 個 %s' % (PACKINFO['files'], mb(PACKINFO['bytes']), now['packages']['web']['files'], mb(now['packages']['web']['bytes'])))
    note('README 對照用：web 包 %d 個檔 %s；原始 %s；win-stage 壓縮後 %s；無法判定先保留 %s 個 %s' % (
        now['packages']['web']['files'], mb(now['packages']['web']['bytes']), mb(now['source']['bytes']), mb(now['zip']['bytes']) if now.get('zip') else '未量（SIZE_ZIP=1 才量）',
        now['packages']['web'].get('unsureFiles'), mb(now['packages']['web'].get('unsureBytes') or 0)))


# ---------------- 主程式 ----------------
def start_server():
    port = free_port(int(os.environ.get('DIST_PORT') or 8900))
    srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(port), '--bind', '127.0.0.1', '--directory', DIST], cwd=DIST, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for i in range(60):
        try:
            socket.create_connection(('127.0.0.1', port), 1).close(); break
        except OSError:
            time.sleep(0.5)
    return srv, 'http://127.0.0.1:%d/index.html' % port


async def browser_parts(dist_url):
    async with async_playwright() as p:
        kw = {'executable_path': '/opt/pw-browsers/chromium'} if os.path.exists('/opt/pw-browsers/chromium') else {}   # 雲端才用；PC 上 gpu_wrap 換成顯示卡
        b = await p.chromium.launch(args=L.ARGS, **kw)
        for part in PARTS:
            try:
                m = re.match(r'Z3D_(ROOT_)?(\d+)$', part)
                if m: await part_z3d(b, URL if m.group(1) else dist_url, part, int(m.group(2)))
                elif part == 'MISS': await part_miss(b, dist_url)
                elif part == 'P2D_PORTRAIT': await part_portrait(b, dist_url)
                elif part == 'P2D_CG': await part_cg(b, dist_url)
                elif part == 'P2D_POSTER': await part_poster(b, dist_url)
                elif part == 'P2D_BG': await part_bg(b, dist_url)
                elif part == 'MAPS': await part_maps(b, dist_url)
                elif part == 'SAVE': await part_save(b, dist_url)
                elif part == 'OLDSAVE': await part_oldsave(b, dist_url)
                elif part == 'PAGES': await part_pages(b)
            except Exception as ex:
                check('[%s] 沒有中斷' % part, False, repr(ex)[:400])
        if 'net' in P2D_PAGE:
            P2D_PAGE['net'].report('P2D')
            await P2D_PAGE['ctx'].close()
        await b.close()


def main():
    print('CC 正式發行打包驗收：PARTS=%s；受測 %s；runner url %s%s；Playwright ≠ iPhone' % (','.join(PARTS), (os.environ.get('SHA') or '')[:9], URL, ('；url2 ' + URL2) if URL2 else ''), flush=True)
    note('平台 %s；python %s；gpu_wrap %s；node %s' % (sys.platform, sys.version.split()[0], '有' if GPU_WRAP else '沒有（雲端／直接跑）', '有' if shutil.which('node') else '沒有'))
    need_dist = any(p for p in PARTS if p not in ('PAGES', 'SIZE') and not p.startswith('Z3D_ROOT'))
    packed = do_pack() if (need_dist or os.environ.get('PACK') != '0') else False
    srv = None; dist_url = ''
    if need_dist and (packed or os.path.exists(os.path.join(DIST, 'manifest.json'))):
        srv, dist_url = start_server()
        global DIST_URL_BASE
        DIST_URL_BASE = dist_url.rsplit('/', 1)[0]
        note('包的網址：%s（http.server 服務 dist/web）' % dist_url)
    try:
        if 'PACK' in PARTS and dist_url:
            dist_files(); part_pack_node(dist_url)
        bparts = [p for p in PARTS if p not in ('PACK', 'SIZE', 'MAIN12', 'V7')]
        if bparts:
            if need_dist and not dist_url:
                check('有包可以測（dist/web）', False)
            else:
                asyncio.run(browser_parts(dist_url))
        if 'MAIN12' in PARTS and dist_url:
            print('== MAIN12（⑤：tests/flow_main_day12.py 對包跑，真實流程）', flush=True)
            sub_test('flow_main_day12.py', [dist_url, os.path.join(OUT, 'main12')], 'MAIN12', float(os.environ.get('MAIN12_MIN') or 40))
        if 'V7' in PARTS and dist_url:
            print('== V7（⑤：tests/save_compat_v7.py，v7＝url2，新版＝包）', flush=True)
            if URL2: sub_test('save_compat_v7.py', [URL2, dist_url], 'V7', float(os.environ.get('V7_MIN') or 30))
            else: check('[V7] 有 url2（v7 的網址；佇列 kind game、SHA2=385e19471…、XARGS={url} {out} {url2}）', False)
        if 'SIZE' in PARTS: part_size()
    finally:
        if srv:
            srv.terminate()
            try:
                srv.wait(10)
            except Exception:
                srv.kill()
        if os.environ.get('KEEP_DIST') != '1' and os.path.isdir(os.path.join(WT, 'dist')) and os.path.exists(os.path.join(DIST, 'manifest.json')):
            shutil.rmtree(os.path.join(WT, 'dist'), ignore_errors=True); note('刪掉 dist/（KEEP_DIST=1 不刪）')
        if PACKINFO: note('這一行的打包：%s' % J(PACKINFO))
        tot = 0
        for d, _ds, ns in os.walk(OUT):
            for n in ns:
                fp = os.path.join(d, n); tot += os.path.getsize(fp)
                if n.endswith(('.txt', '.json', '.md', '.log')) and os.path.getsize(fp) < 30e6:
                    with open(fp, encoding='utf-8', errors='replace') as f: t = f.read()
                    s2 = sanitize(t)
                    if s2 != t:
                        with open(fp, 'w', encoding='utf-8') as f: f.write(s2)
        check('out/ 總大小 < 50 MB', tot < 50e6, '%.1f MB' % (tot / 1e6))
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS[:40])), flush=True)
    sys.exit(1 if FAILS else 0)


main()
