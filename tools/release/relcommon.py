"""正式發行打包的共用程式（REL-PACKAGING-1111，USER_WANTS X340）。

只讀檔、不改任何遊戲檔。規格：docs/RELEASE_PACKAGING.md。
- 檔案清單：預設用 git 追蹤的檔（＝GitHub Pages 實際會服務的內容）；沒有 .git 的目錄（git archive 解出來的樹）就走訪整棵樹。
- JS 字串掃描：跳過註解，取出字串與樣板字串（給 deps.py 找資產路徑）。
- 分類：容量報告用的素材分類（size_report.py）。
"""
import hashlib, os, pathlib, re, subprocess

# ---------- 檔案清單 ----------
WALK_SKIP_DIRS = {'.git', 'dist', 'build', 'node_modules', '__pycache__'}

def is_git_tree(root):
    return (pathlib.Path(root) / '.git').exists()

def list_files(root, mode='auto'):
    """回傳 (相對路徑清單（/ 分隔、排序）, 實際用的模式 'git'|'walk')。
    mode：'git'＝只算 git 追蹤的；'walk'＝整棵樹（跳過 WALK_SKIP_DIRS）；'auto'＝有 .git 用 git，沒有就 walk。"""
    root = pathlib.Path(root)
    if mode == 'auto':
        mode = 'git' if is_git_tree(root) else 'walk'
    if mode == 'git':
        out = subprocess.run(['git', '-C', str(root), 'ls-files', '-z'], capture_output=True, check=True).stdout
        files = [f for f in out.decode('utf-8').split('\0') if f]
        files = [f for f in files if (root / f).is_file()]   # 工作樹裡刪掉、還沒 commit 的不算
    else:
        files = []
        for d, dirs, names in os.walk(root):
            dirs[:] = [x for x in dirs if x not in WALK_SKIP_DIRS]
            for n in names:
                p = pathlib.Path(d) / n
                if p.is_file():
                    files.append(p.relative_to(root).as_posix())
    return sorted(files), mode

def sha256_file(path, bufsize=1 << 20):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        while True:
            b = f.read(bufsize)
            if not b:
                break
            h.update(b)
    return h.hexdigest()

def git_info(root):
    """回傳 {commit, branch, dirty}；不是 git 樹就回空的。"""
    def run(*a):
        r = subprocess.run(['git', '-C', str(root)] + list(a), capture_output=True, text=True)
        return r.stdout.strip() if r.returncode == 0 else ''
    if not is_git_tree(root):
        return {'commit': '', 'branch': '', 'dirty': None}
    return {'commit': run('rev-parse', 'HEAD'), 'branch': run('rev-parse', '--abbrev-ref', 'HEAD'),
            'dirty': bool(run('status', '--porcelain', '--untracked-files=no'))}

# ---------- 樹：磁碟上的目錄，或 git 裡的某個版本（不用解到磁碟上） ----------
class DiskTree:
    """磁碟上的一棵樹（repo 的工作樹，或 git archive 解出來的目錄）。"""
    kind = 'disk'

    def __init__(self, root, mode='auto'):
        self.root = pathlib.Path(root).resolve()
        self.files, self.mode = list_files(self.root, mode)
        self.label = '這個 repo 的工作樹' if self.root == pathlib.Path(__file__).resolve().parents[2] else str(self.root)   # 報告裡不寫這台機器的絕對路徑
        self.cache = {}

    def size(self, f):
        return (self.root / f).stat().st_size

    def read_bytes(self, f):
        return (self.root / f).read_bytes()

    def read_prefix(self, f, n):
        with open(self.root / f, 'rb') as fh:
            return fh.read(n)

    def read_text(self, f):
        return (self.root / f).read_text(encoding='utf-8', errors='replace')

    def content_id(self, f):
        return sha256_file(self.root / f)

    def git_info(self):
        return git_info(self.root)

    def git_repo(self):
        return self.root if is_git_tree(self.root) else None


class GitTree:
    """git 裡的某個版本（例：origin/main），直接從物件庫讀，不解到磁碟上（整棵樹一點多 GB，暫存碟放不下）。
    只給「量」和「檢查」用；打包（pack.py）要真的複製檔案，只吃磁碟上的樹。"""
    kind = 'git-ref'

    def __init__(self, repo, ref):
        self.repo = pathlib.Path(repo).resolve()
        self.ref = ref
        self.commit = subprocess.run(['git', '-C', str(self.repo), 'rev-parse', ref + '^{commit}'], capture_output=True, text=True, check=True).stdout.strip()
        out = subprocess.run(['git', '-C', str(self.repo), 'ls-tree', '-r', '-l', '-z', self.commit], capture_output=True, check=True).stdout.decode('utf-8')
        self._size, self._blob = {}, {}
        for rec in out.split('\0'):
            if not rec:
                continue
            meta, path = rec.split('\t', 1)
            mode, typ, sha, sz = meta.split()
            if typ != 'blob':
                continue
            self._size[path] = int(sz)
            self._blob[path] = sha
        self.files = sorted(self._size)
        self.mode = 'git-ref'
        self.label = 'git:%s（%s）' % (ref, self.commit[:9])
        self.cache = {}
        self._proc = None
        self._last = (None, None)

    def size(self, f):
        return self._size[f]

    def read_bytes(self, f):
        if self._last[0] == f:
            return self._last[1]
        if self._proc is None:
            self._proc = subprocess.Popen(['git', '-C', str(self.repo), 'cat-file', '--batch'], stdin=subprocess.PIPE, stdout=subprocess.PIPE)
        self._proc.stdin.write((self._blob[f] + '\n').encode())
        self._proc.stdin.flush()
        head = self._proc.stdout.readline().split()
        n = int(head[2])
        data = b''
        while len(data) < n:
            chunk = self._proc.stdout.read(n - len(data))
            if not chunk:
                raise IOError('git cat-file 讀到一半斷了：' + f)
            data += chunk
        self._proc.stdout.read(1)
        self._last = (f, data)
        return data

    def read_prefix(self, f, n):
        return self.read_bytes(f)[:n]

    def read_text(self, f):
        return self.read_bytes(f).decode('utf-8', errors='replace')

    def content_id(self, f):
        return self._blob[f]   # git 的 blob 編號：內容一樣編號就一樣

    def git_info(self):
        return {'commit': self.commit, 'branch': self.ref, 'dirty': False}

    def git_repo(self):
        return self.repo

    def materialize(self, paths, dest):
        """把指定的檔寫到 dest（給 Node 讀執行期表：只要 index.html 和它載入的 script，約二十幾 MB）。"""
        dest = pathlib.Path(dest)
        for f in paths:
            if f in self._size:
                (dest / f).parent.mkdir(parents=True, exist_ok=True)
                (dest / f).write_bytes(self.read_bytes(f))
        return dest


def open_tree(spec, mode='auto', repo=None):
    """spec：磁碟路徑、'git:<ref>'（從 repo 的物件庫讀那個版本）、或已經開好的樹。"""
    if isinstance(spec, (DiskTree, GitTree)):
        return spec
    spec = str(spec)
    if spec.startswith('git:'):
        return GitTree(repo or pathlib.Path(__file__).resolve().parents[2], spec[4:])
    return DiskTree(spec, mode)


# ---------- 版本（單一來源：index.html 標題畫面的「版本 vX（日期）」） ----------
VERSION_RE = re.compile(r'版本 v([0-9][0-9.]*)（([0-9]{4}-[0-9]{2}-[0-9]{2})）')

def read_version(root):
    """從 index.html 讀版本與日期；回傳 {version, date, queryVersions:{版號:次數}}。"""
    return read_version_text((pathlib.Path(root) / 'index.html').read_text(encoding='utf-8'))


def read_version_text(html):
    m = VERSION_RE.search(html)
    q = {}
    for v in re.findall(r'\?v=([0-9][0-9.]*)"', html):
        q[v] = q.get(v, 0) + 1
    return {'version': m.group(1) if m else '', 'date': m.group(2) if m else '', 'queryVersions': q}

# ---------- JS 字串掃描 ----------
_INTEREST = re.compile(r'''["'`/]''')
_SQ = re.compile(r"'(?:[^'\\\n]|\\.)*'", re.S)
_DQ = re.compile(r'"(?:[^"\\\n]|\\.)*"', re.S)
_REGEX_PREV = set('(,=:[!&|?{};+-*%<>~^')
_REGEX_WORDS = ('return', 'typeof', 'case', 'in', 'of', 'do', 'else', 'void', 'delete', 'throw', 'new')

def _prev_sig(text, i):
    j = i - 1
    while j >= 0 and text[j] in ' \t\r\n':
        j -= 1
    return j

def _regex_ok(text, i):
    j = _prev_sig(text, i)
    if j < 0:
        return True
    c = text[j]
    if c in _REGEX_PREV:
        return True
    if c.isalnum() or c in '_$':
        k = j
        while k >= 0 and (text[k].isalnum() or text[k] in '_$'):
            k -= 1
        return text[k + 1:j + 1] in _REGEX_WORDS
    return False

def _skip_regex(text, i):
    """i 指向 '/'；回傳正規表示式結束後的位置，不是正規表示式就回 None。"""
    j = i + 1
    n = len(text)
    in_class = False
    while j < n:
        c = text[j]
        if c == '\n':
            return None
        if c == '\\':
            j += 2
            continue
        if c == '[':
            in_class = True
        elif c == ']':
            in_class = False
        elif c == '/' and not in_class:
            j += 1
            while j < n and text[j].isalpha():
                j += 1
            return j
        j += 1
    return None

def _scan_template(text, i, out):
    """i 指向開頭的 `；把整個樣板字串（含 ${…}）放進 out，回傳結束後的位置。${…} 裡面的字串也會掃。"""
    n = len(text)
    j = i + 1
    while j < n:
        c = text[j]
        if c == '\\':
            j += 2
            continue
        if c == '`':
            out.append((i, j + 1, text[i + 1:j], 'tpl'))
            return j + 1
        if c == '$' and j + 1 < n and text[j + 1] == '{':
            depth = 1
            j += 2
            while j < n and depth:
                d = text[j]
                if d == '{':
                    depth += 1
                elif d == '}':
                    depth -= 1
                elif d in '\'"':
                    m = (_SQ if d == "'" else _DQ).match(text, j)
                    if m:
                        out.append((j, m.end(), m.group(0)[1:-1], 'str'))
                        j = m.end()
                        continue
                elif d == '`':
                    j = _scan_template(text, j, out)
                    continue
                j += 1
            continue
        j += 1
    return n

def js_strings(text):
    """回傳 [(開始, 結束, 內容, 'str'|'tpl')]：註解以外的字串與樣板字串。內容是原始碼裡的寫法（不解跳脫）。"""
    out = []
    i = 0
    n = len(text)
    while True:
        m = _INTEREST.search(text, i)
        if not m:
            break
        i = m.start()
        c = text[i]
        if c == '/':
            d = text[i + 1] if i + 1 < n else ''
            if d == '/':
                j = text.find('\n', i)
                i = n if j < 0 else j
                continue
            if d == '*':
                j = text.find('*/', i + 2)
                i = n if j < 0 else j + 2
                continue
            if _regex_ok(text, i):
                j = _skip_regex(text, i)
                if j:
                    i = j
                    continue
            i += 1
            continue
        if c == '`':
            i = _scan_template(text, i, out)
            continue
        mm = (_SQ if c == "'" else _DQ).match(text, i)
        if mm:
            out.append((i, mm.end(), mm.group(0)[1:-1], 'str'))
            i = mm.end()
        else:
            i += 1
    return out

def line_of(text, pos, _cache={}):
    key = id(text)
    idx = _cache.get(key)
    if idx is None or idx[0] is not text:
        starts = [0]
        for m in re.finditer('\n', text):
            starts.append(m.end())
        idx = (text, starts)
        _cache.clear()
        _cache[key] = idx
    import bisect
    return bisect.bisect_right(idx[1], pos)

# ---------- 素材分類（容量報告） ----------
# 順序有意義：第一條符合的算。規則寫在 docs/RELEASE_PACKAGING.md 第 8 節。
CATEGORIES = [
    ('3D 場景（GLB、窗外景、匯出側寫）', lambda p: p.startswith('assets/models/env/')),
    ('3D 人物（VRM、配件、動作、遠距離版本）', lambda p: p.startswith('assets/models/char/')),
    ('早期的範例人物模型（assets/models/*.glb）', lambda p: p.startswith('assets/models/')),
    ('2D 背景', lambda p: p.startswith('assets/bg/')),
    ('事件 CG', lambda p: p.startswith('assets/cg/')),
    ('電影海報', lambda p: p.startswith('assets/posters/')),
    ('立繪', lambda p: p.startswith('assets/portraits/')),
    ('貼圖（地面、牆面）', lambda p: p.startswith('assets/textures/')),
    ('Blender 工作原檔（assets/blender）', lambda p: p.startswith('assets/blender/')),
    ('其他 assets', lambda p: p.startswith('assets/')),
    ('遊戲資料（src/data）', lambda p: p.startswith('src/data/')),
    ('遊戲程式（src）', lambda p: p.startswith('src/')),
    ('函式庫（lib：three.js、three-vrm、lz-string）', lambda p: p.startswith('lib/')),
    ('入口（index.html）', lambda p: p == 'index.html'),
    ('音效檔', lambda p: p.rsplit('.', 1)[-1].lower() in ('mp3', 'ogg', 'wav', 'm4a', 'flac')),
    ('文件（docs）', lambda p: p.startswith('docs/')),
    ('開發工具（tools）', lambda p: p.startswith('tools/')),
    ('測試（tests）', lambda p: p.startswith('tests/')),
    ('備份（wip_backup）', lambda p: p.startswith('wip_backup/')),
    ('GitHub／AI 設定（.github、.claude）', lambda p: p.startswith('.github/') or p.startswith('.claude/')),
    ('其他頂層檔', lambda p: True),
]

def category_of(path):
    for name, fn in CATEGORIES:
        if fn(path):
            return name
    return '其他頂層檔'

def fmt_size(n):
    """位元組 → 'x.xx MB（y.yy MiB）'：MB＝10^6、MiB＝2^20，兩種都寫，避免單位混淆。"""
    return '%.2f MB（%.2f MiB）' % (n / 1e6, n / 1048576)
