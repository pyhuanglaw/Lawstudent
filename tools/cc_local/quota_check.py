# -*- coding: utf-8 -*-
"""CC（帳號 A）：M5 真實瀏覽器 localStorage 配額（K3，BUG-SAVE-QUOTA-1102 的基準）。
用法：python tools/cc_local/quota_check.py <遊戲網址 index.html> <輸出資料夾>
在全新的 Chromium 設定檔（Playwright 暫時的 context，不碰使用者自己的瀏覽器）開遊戲，等載入後：
  1. navigator.storage.estimate()（quota／usage）
  2. 只用測試用的 key（cc_quota_*，不碰 fatiao3d_*），每次寫 256K 字元（ASCII，以及中文各一輪），寫到 QuotaExceededError 為止，記總字元數
  3. 用遊戲自己的存檔欄位大小做對照：GAME.snapshot() 的 JSON 字元數（新遊戲開局）
  4. 清掉 cc_quota_*
結果寫 <輸出資料夾>/quota.json 與 quota.txt。"""
import sys, os, json, asyncio, time
from playwright.async_api import async_playwright

PROBE = r"""async (chunk) => {
  const out = {};
  try { out.estimate = navigator.storage && navigator.storage.estimate ? await navigator.storage.estimate() : null; } catch (e) { out.estimate = String(e); }
  const used0 = (() => { let n = 0; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); n += k.length + (localStorage.getItem(k) || '').length; } return n; })();
  out.lsChars0 = used0;
  for (const [lab, ch] of [['ascii', 'a'], ['cjk', '法']]) {
    for (let i = 0; i < 9999; i++) { const k = 'cc_quota_' + lab + '_' + i; if (localStorage.getItem(k) == null) break; localStorage.removeItem(k); }
    let total = 0, err = null, i = 0; const s = ch.repeat(chunk);
    for (; i < 400; i++) { try { localStorage.setItem('cc_quota_' + lab + '_' + i, s); total += s.length; } catch (e) { err = e.name + ': ' + e.message; break; } }
    /* 尾段：每次寫新的 key（舊版寫同一個 key 會一直成功＝無窮迴圈，cc-local 04_quota 逾時 20 分）*/
    let small = 0, t = 0; if (err) { let n = chunk >> 1; while (n >= 64 && t < 5000) { try { localStorage.setItem('cc_quota_' + lab + '_tail' + (t++), ch.repeat(n)); small += n; } catch (e) { n >>= 1; } } }
    out[lab] = { chunks: i, chars: total + small, error: err, tailKeys: t };
    for (const k of Object.keys(localStorage)) if (k.indexOf('cc_quota_') === 0) localStorage.removeItem(k);
  }
  try { out.snapshotChars = JSON.stringify(GAME.snapshot ? GAME.snapshot() : GAME.G).length; } catch (e) { out.snapshotChars = String(e); }
  out.lsKeys = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); out.lsKeys.push([k, (localStorage.getItem(k) || '').length]); }
  return out;
}"""

async def main(url, od):
    os.makedirs(od, exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch(headless=True)
        ctx = await b.new_context(); pg = await ctx.new_page()
        await pg.goto(url)
        for _ in range(360):
            if await pg.evaluate("typeof GAME!=='undefined'&&!!document.getElementById('loading')&&document.getElementById('loading').classList.contains('hide')"): break
            await pg.wait_for_timeout(500)
        r = await pg.evaluate(PROBE, 256 * 1024)
        r['userAgent'] = await pg.evaluate('navigator.userAgent')
        await b.close()
    json.dump(r, open(os.path.join(od, 'quota.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    lines = ['localStorage 配額（Chromium，全新設定檔）', 'UA: ' + r['userAgent'], 'storage.estimate: ' + json.dumps(r.get('estimate'), ensure_ascii=False),
             'ASCII 寫到滿：%s 字元（%s）' % (r['ascii']['chars'], r['ascii']['error']), '中文寫到滿：%s 字元（%s）' % (r['cjk']['chars'], r['cjk']['error']),
             '開局 GAME.snapshot JSON：%s 字元' % r.get('snapshotChars'), '開局時 localStorage 已用：%s 字元；keys %s' % (r['lsChars0'], json.dumps(r['lsKeys'], ensure_ascii=False))]
    open(os.path.join(od, 'quota.txt'), 'w', encoding='utf-8').write('\n'.join(lines) + '\n'); print('\n'.join(lines))

if __name__ == '__main__':
    asyncio.run(main(sys.argv[1], sys.argv[2]))
