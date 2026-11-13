"""CC-C 11-12：SAVE-LZ-1104 第二步「每次都壓縮」量測（BB_384，BB-C 分支 0f0f62a39a；結果交 BB 判、BB 給 LAWWW）。Playwright（PC GPU）≠ iPhone 實機；CPU 4 倍降速只是手機的近似值。
每一份存檔 FIXES（A＝day54_1110 真實最大；B＝random_play_sim 長大的，另外排）× MODES（plain＝不加 ?lzsave、lz＝加 ?lzsave）× RATES（CDP CPU 降速 1、4）：
  ①② AUTO：【前置／捷徑】讀檔（GAME.applySave，條件事件關掉）→ 把 GAME.lastAuto 往前撥 46 秒＝遊戲主迴圈下一格自己存（game3d.js「45 秒存一次」那一行，真的自動存檔）
        → 記那一下前 1.5 秒到後 1 秒每一幀的間隔：最長一幀、>50 ms 幾幀；另外直接計時 GAME.autosave() 本身多久。各 N 次（預設 5），取最長和中位數。
  ③ STORE（只在 CPU 1 倍）：localStorage 每一欄（fatiao3d_*）存的字元數、是不是 LZ1:、解開以後 JSON 多長；7 欄全滿＝把這份存檔照遊戲的寫法（lz：'LZ1:'＋LZString.compressToUTF16）
        寫進 auto、quick、slot_1～5，記總字元數、有沒有 QuotaExceeded（寫完刪掉多寫的那幾欄）。
  ④ LOAD：把存檔（照模式：plain＝JSON、lz＝壓縮）放進自動存檔 → 重新整理頁面 → 標題按「繼續」（真的按）→ 到能走動（GAME.G 有、不在標題、player 沒有 busy、沒有換區域、沒有劇情）的時間；
        另外計時 GAME.readSave('fatiao3d_auto') 本身（解壓＋JSON.parse）。各 N 次。
  ⑤ RT：自動存檔那一下 JSON.stringify 出來的字串（包 JSON.stringify 抓長度 >10000 的那一次）和 GAME.readSave 讀回來的物件深比較，列第一個不一樣的欄位；lz 模式另外看存的是不是 LZ1: 開頭。
  ⑦ OLD（只在 lz 模式）：沒壓過的 JSON 放進自動存檔 → 重新整理、按「繼續」讀得進來（日期、地點對）→ 存一次（GAME.autosave）變成 LZ1: → 讀回來深比較一樣 → 再重新整理按「繼續」，日期地點一樣。
門檻（BB 判，探針只記）：⑤⑦ 不一樣＝FAIL；PC ② 最長一幀 ≤100 ms 且比 ① 多 ≤50 ms；4 倍降速 ② ≤250 ms；④ 讀檔多 ≤300 ms。探針的 check 只放「量得到、讀得進來、⑤⑦一致」。
CC_02 清單 2026-11-12：1✓（自動存檔用遊戲自己的 45 秒那一格觸發，不另外編時間） 2✓（存檔 key、壓縮前綴照 game3d.js：fatiao3d_auto、LZ1:、LZString.compressToUTF16） 3✓（每一組重新開頁面，模式互不影響） 4✓（繼續＝#btnContinue） 5n/a（不走路） 6✓（讀檔後等 6 秒、角色載完才算能走動） 7✓ 8✓（門檻是 BB_384 第三節，探針不判；只判量到沒、讀得進來、一致） 9n/a（不截圖判） 10✓（條件事件關掉：劇情會讓 autosave 不存） 11✓ 12✓（每次記數字；最長、中位數） 13✓（讀檔捷徑標【前置／捷徑】）
用法：LW_TESTS=<wt>/tests SHA=<sha> [FIXES=A=tests/fixtures/user_save_day54_1110.json,B=<路徑>] [MODES=plain,lz] [RATES=1,4] [N=5] [PARTS=AUTO,STORE,LOAD,RT,OLD] python3 cc_save_lz_probe.py <url> <out>"""
import os, sys, json, asyncio, statistics, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SHA = (os.environ.get('SHA') or '')[:10]
TESTS = os.environ.get('LW_TESTS') or 'tests'
FIXES = [x.split('=', 1) for x in (os.environ.get('FIXES') or 'A=tests/fixtures/user_save_day54_1110.json').split(',') if '=' in x]
MODES = [m for m in (os.environ.get('MODES') or 'plain,lz').split(',') if m]
RATES = [int(r) for r in (os.environ.get('RATES') or '1,4').split(',') if r]
N = int(os.environ.get('N') or '5')
PARTS = [x for x in (os.environ.get('PARTS') or 'AUTO,STORE,LOAD,RT,OLD').split(',') if x]
R = L.Run('save_lz', OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)


def fix_path(rel):
    for base in (os.path.dirname(TESTS), '.'):
        p = os.path.join(base, rel)
        if os.path.exists(p): return p
    return rel


def url_of(mode):
    # 11-13 LAWWW-C c10937dddb：壓縮改成預設開、?nolzsave 關。DEFAULT_LZ=1（新版）：plain＝加 ?nolzsave、lz＝不加；舊版照舊 plain 不加、lz 加 ?lzsave
    if os.environ.get('DEFAULT_LZ') == '1':
        return URL + ((('&' if '?' in URL else '?') + 'nolzsave') if mode != 'lz' else '')
    return URL + (('&' if '?' in URL else '?') + 'lzsave' if mode == 'lz' else '')


def mm(xs):
    xs = [x for x in xs if x is not None]
    return {'max': max(xs) if xs else None, 'med': round(statistics.median(xs), 1) if xs else None, 'all': xs}


APPLY = r"""(async(s)=>{ document.getElementById('titleScreen').classList.add('hide'); const rot=document.getElementById('rotate'); if(rot) rot.classList.remove('want'); EVENTS.onEnter=()=>false; EVENTS.tick=()=>false; if(typeof STORY!=='undefined') STORY.phoneAuto=()=>{}; await GAME.applySave(s); return {day:GAME.G.day, zone:GAME.G.zone, lz:GAME.lzSave}; })"""
# 每一幀的時間＋包 JSON.stringify（抓自動存檔那一次的字串，給 ⑤）
REC = r"""(()=>{ if(!window.__lzR){ window.__lzR={f:[], j:null, jt:0}; const loop=t=>{ const F=window.__lzR.f; F.push(t); if(F.length>4000) F.splice(0,2000); requestAnimationFrame(loop); }; requestAnimationFrame(loop);
    const s0=JSON.stringify; JSON.stringify=function(v){ const r=s0.apply(this,arguments); try{ if(typeof r==='string'&&r.length>10000&&v&&typeof v==='object'&&'day' in v&&'zone' in v){ window.__lzR.j=r; window.__lzR.jt=performance.now(); } }catch(e){} return r; }; } return true; })()"""
TRIG = r"""(async(n)=>{ const out=[]; for(let i=0;i<n;i++){ await new Promise(r=>setTimeout(r,1200)); const a0=GAME.lastAuto; GAME.lastAuto=performance.now()-46000; const t0=performance.now();
    while(GAME.lastAuto===a0||GAME.lastAuto<t0-46000+1){ await new Promise(r=>setTimeout(r,20)); if(performance.now()-t0>5000) break; }
    const ta=GAME.lastAuto; await new Promise(r=>setTimeout(r,1000)); const F=window.__lzR.f.filter(t=>t>=ta-1500&&t<=ta+1000); let mx=0, n50=0; for(let k=1;k<F.length;k++){ const d=F[k]-F[k-1]; if(d>mx) mx=d; if(d>50) n50++; }
    out.push({fired:ta!==a0, max:+mx.toFixed(1), gt50:n50, frames:F.length}); }
  const fn=[]; for(let i=0;i<n;i++){ await new Promise(r=>setTimeout(r,300)); const t=performance.now(); GAME.autosave(); fn.push(+(performance.now()-t).toFixed(1)); }
  return {nat:out, fn, err:GAME.saveErr||null}; })"""
DEEP = r"""(()=>{ const a=window.__lzR&&window.__lzR.j?JSON.parse(window.__lzR.j):null, raw=localStorage.getItem('fatiao3d_auto'), b=GAME.readSave('fatiao3d_auto');
  const first=(x,y,p)=>{ if(x===y) return null; if(typeof x!==typeof y||x===null||y===null||typeof x!=='object') return {path:p, a:JSON.stringify(x)?.slice(0,80), b:JSON.stringify(y)?.slice(0,80)};
    if(Array.isArray(x)!==Array.isArray(y)) return {path:p, why:'array'}; const ks=new Set(Object.keys(x).concat(Object.keys(y))); for(const k of ks){ const r=first(x[k],y[k],p+'.'+k); if(r) return r; } return null; };
  return {have:!!a, lz:typeof raw==='string'&&raw.slice(0,4)==='LZ1:', rawLen:raw?raw.length:0, jsonLen:window.__lzR&&window.__lzR.j?window.__lzR.j.length:0, diff:a&&b?first(a,b,'G'):'缺', day:b&&b.day}; })()"""
STORE = r"""((mode)=>{ const j=window.__lzR&&window.__lzR.j; const out={keys:[]}; for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if(!k||k.indexOf('fatiao3d')!==0) continue; const v=localStorage.getItem(k)||''; let jl=null; try{ const o=GAME.readSave(k); jl=o?JSON.stringify(o).length:null; }catch(e){} out.keys.push({k, chars:v.length, lz:v.slice(0,4)==='LZ1:', json:jl}); }
  if(!j) return Object.assign(out,{full:'沒有存檔字串'});   /* j 在最前面先拿：下面讀每一欄的 JSON.stringify 也會被 REC 包到、蓋掉 */ const t=performance.now(); const enc=mode==='lz'?'LZ1:'+LZString.compressToUTF16(j):j; const encMs=+(performance.now()-t).toFixed(1);
  const t2=performance.now(); if(mode==='lz') LZString.decompressFromUTF16(enc.slice(4)); const decMs=+(performance.now()-t2).toFixed(1);
  const ks=['fatiao3d_auto','fatiao3d_quick','fatiao3d_slot_1','fatiao3d_slot_2','fatiao3d_slot_3','fatiao3d_slot_4','fatiao3d_slot_5']; const had=new Set(ks.filter(k=>localStorage.getItem(k)!=null)); let ok=0, err=null;
  for(const k of ks){ try{ localStorage.setItem(k,enc); ok++; }catch(e){ err=e.name||String(e); break; } }
  let total=0; for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); total+=(k||'').length+(localStorage.getItem(k)||'').length; }
  for(const k of ks) if(!had.has(k)&&k!=='fatiao3d_auto') localStorage.removeItem(k);
  return Object.assign(out,{full:{one:enc.length, json:j.length, ratio:+(enc.length/j.length).toFixed(3), wrote:ok, err, totalChars:total, encMs, decMs}}); })"""
READY = r"""(async()=>{ const t0=performance.now(); document.getElementById('btnContinue').click();
  const ok=()=>{ try{ const E=GAME.E; return !!(GAME.G&&!GAME.titleIdle&&E&&E.player&&!E.player.busy&&!(GAME.isEntering&&GAME.isEntering())&&!(GAME.D&&GAME.D.busyDepth>0)); }catch(e){ return false; } };
  while(!ok()){ await new Promise(r=>setTimeout(r,25)); if(performance.now()-t0>90000) return {ms:null, timeout:true}; }
  return {ms:+(performance.now()-t0).toFixed(0), day:GAME.G.day, zone:GAME.G.zone}; })()"""


async def fresh(pg, cdp, mode, rate):
    await cdp.send('Emulation.setCPUThrottlingRate', {'rate': 1})
    await pg.goto(url_of(mode))
    ok = await L.wait_loaded(pg)
    await cdp.send('Emulation.setCPUThrottlingRate', {'rate': rate})
    return ok


async def put_auto(pg, txt):
    await pg.evaluate("(t=>{ localStorage.setItem('fatiao3d_auto', t); })", txt)


async def main():
    print('CC SAVE-LZ：SHA %s；FIXES %s；MODES %s；RATES %s；N %d；Playwright ≠ iPhone' % (SHA or '?', FIXES, MODES, RATES, N), flush=True)
    res = {'sha': SHA, 'n': N, 'rows': []}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        for fname, fpath in FIXES:
            raw = open(fix_path(fpath), encoding='utf-8').read(); sv = json.loads(raw); plain = json.dumps(sv, ensure_ascii=False, separators=(',', ':'))
            R.note('[%s] %s：檔案 %d 字元、壓成一行 JSON %d 字元、day %s' % (fname, fpath, len(raw), len(plain), sv.get('day')))
            for mode in MODES:
                for rate in RATES:
                    tag = '[%s %s CPU×%d]' % (fname, mode, rate); row = {'fix': fname, 'mode': mode, 'rate': rate}
                    try:
                        if not R.check('%s 遊戲載入' % tag, await fresh(pg, cdp, mode, rate), ''): continue
                        await pg.evaluate(REC)
                        a = await pg.evaluate(APPLY, sv)
                        R.setup('%s 【前置／捷徑】讀檔（applySave，條件事件關掉）：day %s %s；GAME.lzSave=%s' % (tag, a['day'], a['zone'], a['lz']))
                        R.check('%s 模式對（lzSave=%s）' % (tag, a['lz']), bool(a['lz']) == (mode == 'lz'), '')
                        await pg.wait_for_timeout(6000)
                        if 'AUTO' in PARTS:
                            t = await pg.evaluate(TRIG, N)
                            row['auto'] = {'frame_max': mm([x['max'] for x in t['nat']]), 'gt50': mm([x['gt50'] for x in t['nat']]), 'fn_ms': mm(t['fn']), 'fired': [x['fired'] for x in t['nat']], 'err': t['err']}
                            R.note('%s ①② 自動存檔：最長一幀 %s；>50ms %s；GAME.autosave 本身 %s ms；觸發到 %s；saveErr %s' % (tag, J(row['auto']['frame_max']), J(row['auto']['gt50']), J(row['auto']['fn_ms']), row['auto']['fired'], t['err']))
                            R.check('%s 自動存檔真的觸發了 %d 次' % (tag, N), all(row['auto']['fired']), J(row['auto']['fired']))
                        if 'RT' in PARTS:
                            d = await pg.evaluate(DEEP); row['rt'] = d
                            R.check('%s ⑤ 存→讀 GAME.readSave 和存的那一份完全一樣（存 %d 字元、JSON %d 字元、LZ1:=%s）' % (tag, d['rawLen'], d['jsonLen'], d['lz']), d['have'] and d['diff'] is None, J(d['diff']))
                            if mode == 'lz': R.check('%s ⑤ lz 模式存的是 LZ1: 開頭' % tag, d['lz'], '')
                        if 'STORE' in PARTS and rate == 1:
                            s_ = await pg.evaluate(STORE, mode); row['store'] = s_
                            R.note('%s ③ 每一欄 %s；7 欄全滿 %s' % (tag, J(s_['keys']), J(s_['full'])))
                        if 'LOAD' in PARTS:
                            enc = await pg.evaluate("(m=>{ const j=JSON.stringify(GAME.readSave('fatiao3d_auto')); return m==='lz'?'LZ1:'+LZString.compressToUTF16(j):j; })", mode)
                            ms, rd = [], []
                            for i in range(N):
                                await put_auto(pg, enc)
                                await cdp.send('Emulation.setCPUThrottlingRate', {'rate': 1}); await pg.reload(); await L.wait_loaded(pg); await cdp.send('Emulation.setCPUThrottlingRate', {'rate': rate})
                                q = await pg.evaluate(READY); ms.append(q['ms'])
                                t3 = await pg.evaluate("(()=>{ const t=performance.now(); GAME.readSave('fatiao3d_auto'); return +(performance.now()-t).toFixed(1); })()"); rd.append(t3)
                            row['load'] = {'continue_ms': mm(ms), 'readSave_ms': mm(rd), 'stored_chars': len(enc)}
                            R.note('%s ④ 標題「繼續」到能走動 %s ms；GAME.readSave 本身 %s ms；存的字元數 %d' % (tag, J(row['load']['continue_ms']), J(row['load']['readSave_ms']), len(enc)))
                            R.check('%s ④ 讀得進來 %d 次' % (tag, N), all(x is not None for x in ms), J(ms))
                        if 'OLD' in PARTS and mode == 'lz' and rate == 1:
                            await put_auto(pg, plain)
                            await pg.reload(); await L.wait_loaded(pg); await pg.evaluate(REC)
                            q = await pg.evaluate(READY)
                            R.check('%s ⑦ 沒壓過的舊存檔在 ?lzsave 讀得進來（day %s %s）' % (tag, q.get('day'), q.get('zone')), q.get('ms') is not None and q.get('day') == sv.get('day'), J(q))
                            await pg.wait_for_timeout(3000); await pg.evaluate("GAME.autosave(true)")
                            d = await pg.evaluate(DEEP)
                            R.check('%s ⑦ 存一次以後變壓縮（LZ1:）' % tag, d['lz'], J({k: d[k] for k in ('rawLen', 'jsonLen')}))
                            R.check('%s ⑦ 讀回來和存的一樣' % tag, d['have'] and d['diff'] is None, J(d['diff']))
                            await pg.reload(); await L.wait_loaded(pg)
                            q2 = await pg.evaluate(READY)
                            R.check('%s ⑦ 再重新整理按「繼續」日期地點一樣' % tag, q2.get('day') == q.get('day') and q2.get('zone') == q.get('zone'), J([q, q2]))
                            row['old'] = {'first': q, 'rt': d, 'again': q2}
                    except Exception as e:
                        R.check('%s 沒有中斷' % tag, False, repr(e)[:300])
                    res['rows'].append(row)
        await cdp.send('Emulation.setCPUThrottlingRate', {'rate': 1})
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    # 總表（給 BB：A／B × 模式 × 降速，每格最長／中位數）
    lines = ['| 存檔 | 模式 | CPU | 自動存檔最長一幀 max/med | >50ms | autosave 本身 ms | 繼續到能走動 ms | readSave ms | 存的字元 |', '|---|---|---|---|---|---|---|---|---|']
    for r in res['rows']:
        au, lo = r.get('auto') or {}, r.get('load') or {}
        f = lambda d: '%s/%s' % (d.get('max'), d.get('med')) if d else ''
        lines.append('| %s | %s | ×%d | %s | %s | %s | %s | %s | %s |' % (r['fix'], r['mode'], r['rate'], f(au.get('frame_max')), f(au.get('gt50')), f(au.get('fn_ms')), f(lo.get('continue_ms')), f(lo.get('readSave_ms')), lo.get('stored_chars', '')))
    open(os.path.join(OUT, 'save_lz_table.md'), 'w', encoding='utf-8').write('\n'.join(lines) + '\n')
    R.note('總表\n' + '\n'.join(lines))
    open(os.path.join(OUT, 'save_lz.json'), 'w', encoding='utf-8').write(J(res))
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
