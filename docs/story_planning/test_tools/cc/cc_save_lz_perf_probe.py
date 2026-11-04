"""CC-C（帳號 C）11-04：SAVE_LZ_perf（BB-C 15:42；SAVE-LZ-1104 第一步 a8755309f：存檔可以用 lz-string 壓縮，GM.lzSave／?lzsave）。只量數字，判定歸 BB。
  BB 的判準（寫在這裡當出處，探針不判）：PC 上自動存檔最大值 ≤300 ms 算 OK，300～800 ms 記 P2，超過 800 ms 就要改成閒置時壓。**PC≠手機**（手機大概慢 3～5 倍）。
  Node 參考數字（BB）：1.25M 字元，壓＋驗 699 ms、解 60 ms。
  做法：
    1.【前置／捷徑】讀檔到宿舍，把存檔灌到重度玩家的大小：G.msgs 多塞手機訊息（文字從遊戲裡現有的訊息、SMALLTALK 輪流取，天數、時間照順序），
      直到 JSON.stringify(GAME.snapshot()) ≥ TARGET 字元（預設 1,250,000；BB_00 帳號 A 的 BUG-SAVE-QUOTA-HEAVY-1102：7 份存檔約 5.93 MB）。
    2. GAME.lzSave＝true（壓縮）和 false（JSON 對照）各 N 次（預設 5）：
       - 自動存檔一次：GAME.autosave(true) 的總時間（snapshot＋JSON.stringify＋壓縮＋解回比對＋寫入）；
       - 存進去多大（localStorage 那一格的字元數）、是不是 LZ1: 開頭；
       - 讀回：GAME.readSave('fatiao3d_auto')（解壓＋JSON.parse）的時間，讀回來和 snapshot 一樣；
       - 壓縮那一輪另外單獨量 LZString.compressToUTF16＋decompressFromUTF16（＝encSave 裡的「壓完先解回來比對」）。
    3. 印平均和最大值。原本的存檔在最後還原（localStorage 清掉）。
  Windows＋GPU（電腦）／SwiftShader（雲端）≠ iPhone；雲端只驗流程，數字不採信（CC_50 第 15 條）。
用法：LW_TESTS=<wt>/tests [TARGET=1250000] [N=5] python3 cc_save_lz_perf_probe.py <url> <out>"""
import os, sys, json, asyncio, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = lambda o: json.dumps(o, ensure_ascii=False)
TARGET = int(os.environ.get('TARGET') or 1250000)
N = int(os.environ.get('N') or 5)
FAILS = []


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + info) if info else ''), flush=True)
    if not ok: FAILS.append(name)
    return ok


HAS = "(()=>({lz:typeof LZString!=='undefined'&&!!LZString.compressToUTF16, readSave:typeof GAME.readSave==='function', lzSave:GAME.lzSave, autosave:typeof GAME.autosave==='function', snapshot:typeof GAME.snapshot==='function'}))()"
# 灌存檔：照遊戲現有的 G.msgs 格式（看第一筆的欄位）多塞訊息；沒有現成的就用最簡單的 {th,who,text,day,hour}
INFLATE = r"""((target)=>{ const G=GAME.G; G.msgs=G.msgs||[]; const pool=[];
  for(const m of G.msgs) if(m&&m.text) pool.push(m);
  if(typeof SMALLTALK!=='undefined'){ for(const k in SMALLTALK){ const v=SMALLTALK[k]; const arr=Array.isArray(v)?v:(v&&typeof v==='object'?Object.values(v).flat():[]); for(const t of arr){ const s=typeof t==='string'?t:(t&&(t.text||t.t)); if(s) pool.push({text:String(s)}); if(pool.length>4000) break; } if(pool.length>4000) break; } }
  if(!pool.length) pool.push({text:'今天的課有點難，下課要不要一起去吃飯？'});
  const ths=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','zhe','yu','kai','kexin','classmate_bohan'];
  const proto=G.msgs[0]||null; let i=0, len=JSON.stringify(GAME.snapshot()).length; const t0=performance.now();
  while(len<target&&i<400000){ const src=pool[i%pool.length]; const m=proto?Object.assign({},proto):{};
    m.th=ths[i%ths.length]; m.who=(i%3===0)?'me':m.th; m.text=src.text; m.day=1+Math.floor(i/40); m.hour=8+(i%40)*0.35; if('read' in m) m.read=true; if('id' in m) m.id='cc_lz_'+i;
    G.msgs.push(m); i++; if(i%500===0) len=JSON.stringify(GAME.snapshot()).length; }
  len=JSON.stringify(GAME.snapshot()).length; return {added:i, chars:len, msgs:G.msgs.length, pool:pool.length, ms:Math.round(performance.now()-t0), proto:proto?Object.keys(proto):null}; })"""
ROUND = r"""((lz)=>{ const E=GAME.E, p0=E.paused; E.paused=true;   /* 時刻、位置不要在量的時候往前走（讀回來要和 snapshot 比） */ GAME.lzSave=!!lz; const K='fatiao3d_auto'; const st=window.localStorage;
  const t0=performance.now(); const ok=GAME.autosave(true); const t1=performance.now();
  const raw=st.getItem(K)||''; const t2=performance.now(); const back=GAME.readSave(K); const t3=performance.now();
  const snap=JSON.stringify(GAME.snapshot()); const same=!!back&&JSON.stringify(Object.assign({},back,{savedAt:0}))===JSON.stringify(Object.assign(JSON.parse(snap),{savedAt:0}));
  let enc=null; if(lz&&typeof LZString!=='undefined'){ const e0=performance.now(); const c=LZString.compressToUTF16(snap); const e1=performance.now(); const d=LZString.decompressFromUTF16(c); const e2=performance.now(); enc={comp:+(e1-e0).toFixed(1), decomp:+(e2-e1).toFixed(1), ok:d===snap, clen:c.length}; }
  E.paused=p0; return {ok, err:GAME.saveErr||null, save_ms:+(t1-t0).toFixed(1), read_ms:+(t3-t2).toFixed(1), stored:raw.length, lzPrefix:raw.slice(0,4)==='LZ1:', jsonChars:snap.length, same, enc}; })"""


def stats(xs):
    xs = [x for x in xs if x is not None]
    return {'avg': round(sum(xs) / len(xs), 1) if xs else None, 'max': round(max(xs), 1) if xs else None, 'n': len(xs)}


async def main():
    os.makedirs(OUT, exist_ok=True)
    print('CC SAVE_LZ_perf：TARGET=%d 字元、N=%d；SHA=%s；PC≠手機（手機大概慢 3～5 倍）' % (TARGET, N, os.environ.get('SHA', '?')), flush=True)
    res = {}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, int(os.environ.get('CC_SEED') or 20261104))
        t0 = time.time(); await pg.goto(URL); ok = await L.wait_loaded(pg); check('遊戲載入', ok, '%.1f 秒' % (time.time() - t0))
        if not ok:
            await b.close(); print('FAILED 1: 遊戲載入', flush=True); sys.exit(1)
        await pg.evaluate("localStorage.clear(); if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}")
        has = await pg.evaluate(HAS)
        if not check('這一版有 lz-string、GAME.readSave、GAME.autosave（SAVE-LZ-1104 第一步以後）', has['lz'] and has['readSave'] and has['autosave'] and has['snapshot'], J(has)):
            await b.close(); print('FAILED %d' % len(FAILS), flush=True); sys.exit(1)
        print('  [前置／捷徑] 讀檔：宿舍、14:00、晴、條件事件關閉', flush=True)
        await L.load_state(pg, {'zone': 'dorm', 'hour': 14.0, 'weather': 'clear', 'pos': {'x': 0, 'z': 0, 'yaw': 0, 'lv': 0}}, quiet_events=True)
        await pg.wait_for_timeout(5000); await L.close_panels(pg, cdp)
        inf = await pg.evaluate(INFLATE + '(%d)' % TARGET)
        print('  [前置／捷徑] 灌存檔：%s' % J(inf), flush=True)
        check('存檔灌到 %d 字元以上' % TARGET, inf['chars'] >= TARGET, '%d 字元、訊息 %d 則' % (inf['chars'], inf['msgs']))
        for lz in (True, False):
            rows = []
            for i in range(N):
                r = await pg.evaluate(ROUND + '(%s)' % ('true' if lz else 'false'))
                rows.append(r); print('  [%s #%d] %s' % ('壓縮' if lz else 'JSON', i + 1, J(r)), flush=True)
                await pg.wait_for_timeout(300)
            tag = 'lz' if lz else 'json'
            res[tag] = {'save': stats([r['save_ms'] for r in rows]), 'read': stats([r['read_ms'] for r in rows]), 'stored': rows[-1]['stored'], 'jsonChars': rows[-1]['jsonChars'],
                        'comp': stats([(r['enc'] or {}).get('comp') for r in rows]), 'decomp': stats([(r['enc'] or {}).get('decomp') for r in rows]), 'rows': rows}
            check('[%s] %d 次自動存檔都成功、讀回來和 snapshot 一樣' % (tag, N), all(r['ok'] and r['same'] for r in rows), J([(r['ok'], r['same'], r['err']) for r in rows]))
            check('[%s] 存進去的格式對（壓縮＝LZ1: 開頭；JSON＝不是）' % tag, all(r['lzPrefix'] == lz for r in rows), J([r['lzPrefix'] for r in rows]))
            print('INFO [%s] 自動存檔 平均 %s ms、最大 %s ms；讀回（解壓＋parse） 平均 %s ms、最大 %s ms；存進去 %d 字元（JSON %d 字元）%s' % (
                tag, res[tag]['save']['avg'], res[tag]['save']['max'], res[tag]['read']['avg'], res[tag]['read']['max'], res[tag]['stored'], res[tag]['jsonChars'],
                '；壓 %s／%s ms、解 %s／%s ms（平均／最大）' % (res[tag]['comp']['avg'], res[tag]['comp']['max'], res[tag]['decomp']['avg'], res[tag]['decomp']['max']) if lz else ''), flush=True)
        if res.get('lz') and res.get('json'):
            print('INFO 壓縮率 %.1f%%（%d → %d 字元）；BB 的判準：PC 自動存檔最大 ≤300 ms OK、300～800 P2、>800 改閒置時壓（探針不判）' % (
                100.0 * res['lz']['stored'] / max(1, res['json']['stored']), res['json']['stored'], res['lz']['stored']), flush=True)
        await pg.evaluate("localStorage.clear()")
        check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    json.dump(res, open(os.path.join(OUT, 'save_lz_perf.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS)), flush=True)
    sys.exit(1 if FAILS else 0)

asyncio.run(main())
