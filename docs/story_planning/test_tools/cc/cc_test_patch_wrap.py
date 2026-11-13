"""CC-C 11-14：包住 tests/ 的一支（不改原檔，tests/ 歸 LAWWW）——讀原檔、照 PATCH 換幾行、用原檔的路徑執行（playlib 照原樣 import）。判定歸 BB。
CC_02 清單 2026-11-14：1n/a（日期照原檔） 2✓（換的那幾行先確認原檔裡剛好出現一次，對不到＝FAIL_SETUP 不跑） 3n/a（原檔的判定不動） 4n/a（原檔的判定不動） 5n/a（照原檔） 6n/a（等待照原檔） 7✓（lint） 8✓（多印的只記不判） 9✓（多印的寫進原檔的 run.note） 10n/a（事件和手機照原檔） 11✓（SHA 40 碼、ENV 沒有「;」「|」） 12✓（FAIL_SETUP：原檔找得到、每個替換點剛好一次；live 另外查舊版開局 stage 不是 econ） 13n/a（不走路）
PATCH：
  live         save_compat_v95.py：舊版網址照 BB-C 21:02 ③ 用「?start0&turbo」開（原檔是 V95+'?turbo'）；開完新遊戲先查 GAME.G.stage 不是 econ（舊序章年），是＝FAIL_SETUP 停。
  ladder_diag  flow_ladder_y1s2.py：每個時段讀檔以後（找人之前）印 GAME.npc 每個 id、STORY.ladData 有沒有、STORY.ladNext 的 id（BB-C 21:02 ④，兩版對照）。
用法：LW_TESTS=<wt>/tests TEST=<檔名> PATCH=<live|ladder_diag> python3 cc_test_patch_wrap.py <原檔的參數…>"""
import os, sys
T = os.environ.get('LW_TESTS') or 'tests'
TEST = os.environ.get('TEST') or ''
PATCH = os.environ.get('PATCH') or ''
OLDQ = os.environ.get('OLDQ') or 'start0&turbo'

LAD_DIAG = r'''_cc_d = await pg.evaluate("""(()=>{ const G=GAME.G, out=[]; for(const id of Object.keys(GAME.npc||{})){ const n=GAME.npc[id]; const cid=(n&&n.charId)||id; let d=null, nx=null; try{ d=STORY.ladData(G,cid); }catch(e){ d='ERR:'+e.message; } try{ nx=d&&typeof d==='object'?(STORY.ladNext(G,cid)||{}).id||null:null; }catch(e){ nx='ERR:'+e.message; } out.push({key:id,cid,staff:!!(n&&n.staff),obj:!!(n&&n.obj),lad:d?(typeof d==='object'?(d.key||'有'):d):null,next:nx}); } return {zone:G.zone,day:G.day,hour:+(+G.hour).toFixed(2),stage:G.stage||'',n:out.length,npc:out}; })()""")
        run.note('CC 診斷（ladder_diag）%s %s：%s' % (zone, hour, json.dumps(_cc_d, ensure_ascii=False)))
        '''

STAGE_CHK = r'''_cc_stg = await pg.evaluate("(GAME.G&&GAME.G.stage)||''")
        if not run.check('FAIL_SETUP 檢查：舊版用 ?%s 開局，stage 不是 econ（舊序章年）' % __import__('os').environ.get('OLDQ', 'start0&turbo'), _cc_stg != 'econ', 'stage=' + repr(_cc_stg)):
            await b.close(); sys.exit(run.finish())
        '''

PATCHES = {
    'live': ('save_compat_v95.py', [
        ("await pg.goto(V95 + '?turbo')", "await pg.goto(V95 + '?' + %r)" % OLDQ),
        ("saves = {'auto': await pg.evaluate(", STAGE_CHK + "saves = {'auto': await pg.evaluate("),
    ]),
    'ladder_diag': ('flow_ladder_y1s2.py', [
        ("c = await pg.evaluate(FIND_JS)", LAD_DIAG + "c = await pg.evaluate(FIND_JS)"),
    ]),
}


def fail(msg):
    print('FAIL: FAIL_SETUP 檢查：' + msg, flush=True); print('FAILED 1: FAIL_SETUP', flush=True); sys.exit(1)


if PATCH not in PATCHES: fail('PATCH=%r 不認得（%s）' % (PATCH, '、'.join(PATCHES)))
want, subs = PATCHES[PATCH]
if TEST and TEST != want: fail('TEST=%s 和 PATCH=%s 要的 %s 不一樣' % (TEST, PATCH, want))
path = os.path.join(T, want)
if not os.path.exists(path): fail('找不到 %s' % path)
src = open(path, encoding='utf-8').read()
for a, b in subs:
    n = src.count(a)
    if n != 1: fail('%s 裡「%s」出現 %d 次（要剛好 1 次）' % (want, a, n))
    src = src.replace(a, b)
print('CC 包裝：%s，PATCH=%s（%d 處），參數 %s' % (path, PATCH, len(subs), sys.argv[1:]), flush=True)
sys.argv = [path] + sys.argv[1:]
sys.path.insert(0, T)
g = {'__name__': '__main__', '__file__': path}
exec(compile(src, path, 'exec'), g)
