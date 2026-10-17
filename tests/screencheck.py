"""看畫面的自動檢查（使用者 2026-10-17 23:3x：「很多我一打開遊戲就會發現的錯誤你好像也測不出來」）。
原本的流程測試只看狀態（日期、旗標、JS 例外、有沒有卡住），不看畫面；這個模組在測試走到的每個重要時刻拍一張截圖，檢查玩家一眼就看得到的錯：
  1. 3D 畫面大面積全黑、一塊全黑（例：iPhone 按地圖後整塊黑，BUG-MAPBLACK）；2D 背景圖沒出來（有設圖卻是黑的）
  2. 對話框、選項被別的東西蓋住，點不到（例：手機蓋住下課選單、起床的「早安」）
  3. 對話、選項的文字超出框
  4. 重要按鈕（互動、手機、選單、選項、對話框）跑到螢幕外
  5. 自由走動時玩家人物不在畫面裡
轉場的一瞬間不算：發現問題隔 1.5 秒再看一次，還在才記下來。
另外每次檢查都存一張縮圖，結束時拼成縮圖總表（contact sheet），給人用眼睛逐張看。
用法（流程測試裡）：
    import screencheck as SC
    sc = SC.Checker(run, OUT)
    await sc.check(pg, '9/2 早上')        # 有問題會記下來＋存原尺寸截圖
    ...
    sc.finish()                            # run.check('畫面檢查…')＋縮圖總表 OUT/screens_sheet_*.png
單獨檢查一張舊截圖的黑色比例：python3 tests/screencheck.py <png>…"""
import io, json, os, sys, time

try:
    from PIL import Image, ImageDraw, ImageFont
    import numpy as np
except Exception:   # 沒有 PIL／numpy：只做 DOM 檢查
    Image = None; np = None

STATE_JS = r"""(()=>{
  const vis=id=>{ const e=document.getElementById(id); if(!e) return false; if(e.classList.contains('hide')) return false; const cs=getComputedStyle(e); return cs.display!=='none'&&cs.visibility!=='hidden'&&+cs.opacity>0.05; };
  const W=innerWidth, H=innerHeight, out={W,H,problems:[],info:{}};
  const fade=document.getElementById('fade'), t3=document.getElementById('title3');
  out.info.fade=fade?+getComputedStyle(fade).opacity:0; out.info.title=t3?+getComputedStyle(t3).opacity:0;
  out.info.overlays=['phone','menu','bigmap','titleScreen','loading','rotate'].filter(id=>vis(id)&&(id!=='rotate'||document.getElementById('rotate').classList.contains('want')));
  const adv=document.getElementById('adv'), advBg=document.getElementById('advBg');
  out.info.adv=!!(typeof ADV!=='undefined'&&ADV.active); out.info.advDark=!!(adv&&adv.classList.contains('dark')); out.info.advImg=!!(advBg&&advBg.style.backgroundImage&&advBg.style.backgroundImage!=='none');
  out.info.dlg=vis('dlg'); out.info.choices=vis('choices')?document.querySelectorAll('#choices button').length:0;
  try{ const G=GAME.G; out.info.zone=G.zone; out.info.hour=+G.hour.toFixed(2); out.info.day=(typeof CALENDAR!=='undefined'?CALENDAR.dateOf(G.day).key:G.day); }catch(e){}
  const inside=(el,x,y)=>{ const h=document.elementFromPoint(x,y); return !!h&&(h===el||el.contains(h)); };
  const coverName=(x,y)=>{ const h=document.elementFromPoint(x,y); if(!h) return '（沒有）'; let e=h; while(e&&!e.id&&e.parentElement) e=e.parentElement; return (e&&e.id)||h.tagName; };
  const onScreen=r=>r.right>2&&r.bottom>2&&r.left<W-2&&r.top<H-2&&r.left>-2&&r.top>-2&&r.right<W+2&&r.bottom<H+2;
  /* 2. 被蓋住、4. 跑出螢幕 */
  const chk=(el,name)=>{ const r=el.getBoundingClientRect(); if(r.width<4||r.height<4) return; const cx=Math.min(W-3,Math.max(2,r.left+r.width/2)), cy=Math.min(H-3,Math.max(2,r.top+r.height/2));
    if(!onScreen(r)) out.problems.push({k:'offscreen',msg:name+' 跑到螢幕外',rect:[r.left|0,r.top|0,r.right|0,r.bottom|0]});
    else if(getComputedStyle(el).pointerEvents!=='none'&&!inside(el,cx,cy)) out.problems.push({k:'covered',msg:name+' 被「'+coverName(cx,cy)+'」蓋住，點不到'}); };   /* 本來就不給點的（例：出選項時的對話框 pointer-events:none）不算 */
  if(out.info.dlg) chk(document.getElementById('dlg'),'對話框');
  document.querySelectorAll('#choices button').forEach((b,i)=>{ if(out.info.choices) chk(b,'選項「'+b.textContent.trim().slice(0,14)+'」'); });
  for(const [id,name] of [['interact','互動鍵'],['btnPhone','手機鍵'],['btnMenu','選單鍵']]) if(vis(id)&&!out.info.overlays.length&&!out.info.adv){ const e=document.getElementById(id), r=e.getBoundingClientRect(); if(r.width>4&&!onScreen(r)) out.problems.push({k:'offscreen',msg:name+' 跑到螢幕外'}); }
  /* 3. 文字超出框 */
  const ov=(el,name)=>{ if(el&&el.scrollHeight>el.clientHeight+3&&getComputedStyle(el).overflowY!=='auto'&&getComputedStyle(el).overflowY!=='scroll') out.problems.push({k:'overflow',msg:name+' 文字超出框（'+el.scrollHeight+'＞'+el.clientHeight+'）'}); };
  if(out.info.dlg) ov(document.getElementById('dlgText'),'對話');
  document.querySelectorAll('#choices button').forEach(b=>{ if(out.info.choices&&b.scrollWidth>b.clientWidth+3) out.problems.push({k:'overflow',msg:'選項「'+b.textContent.trim().slice(0,14)+'」文字超出框'}); });
  /* 5. 自由走動時玩家在不在畫面裡 */
  out.info.free=!out.info.adv&&!out.info.dlg&&!out.info.choices&&!out.info.overlays.length&&out.info.fade<0.3&&out.info.title<0.3;
  try{ const E=GAME.E, P=E.player&&E.player.obj; if(out.info.free&&P&&E.camera&&typeof THREE!=='undefined'){ const v=new THREE.Vector3(P.position.x,P.position.y+1.0,P.position.z).project(E.camera); out.info.playerNdc=[+v.x.toFixed(2),+v.y.toFixed(2),+v.z.toFixed(2)];
      if(!(Math.abs(v.x)<1.05&&Math.abs(v.y)<1.05&&v.z<1)) out.problems.push({k:'player',msg:'自由走動時玩家人物不在畫面裡（ndc '+v.x.toFixed(2)+','+v.y.toFixed(2)+'）'}); } }catch(e){}
  return out; })()"""


def dark_stats(img):
    """回傳 (全畫面近黑比例, 近黑的格子數, 格子總數)。近黑＝RGB 最大值 < 14；畫面切 8×6 格，一格 96% 以上近黑算「一塊黑」"""
    a = np.asarray(img.convert('RGB'), dtype=np.uint8)
    m = a.max(axis=2) < 14
    h, w = m.shape; gy, gx = 6, 8; n = 0
    for j in range(gy):
        for i in range(gx):
            c = m[j * h // gy:(j + 1) * h // gy, i * w // gx:(i + 1) * w // gx]
            if c.size and c.mean() > 0.96: n += 1
    return float(m.mean()), n, gx * gy


def pixel_problems(img, info):
    """1. 黑畫面：自由走動（3D）時大面積黑或三格以上全黑；2D 背景有設圖卻幾乎全黑。轉場、字卡、刻意的深色底（ADV dark、沒有圖）不算"""
    if np is None or img is None: return []
    if info.get('fade', 0) > 0.3 or info.get('title', 0) > 0.3 or info.get('overlays'): return []
    frac, cells, total = dark_stats(img)
    out = []
    if not info.get('adv'):
        if frac > 0.30 or cells >= 3:
            out.append({'k': 'black', 'msg': '3D 畫面黑了一大塊（近黑 %d%%、全黑格 %d/%d）' % (frac * 100, cells, total)})
    elif info.get('advImg') and frac > 0.65:
        out.append({'k': 'black', 'msg': '2D 背景有設圖，畫面卻幾乎全黑（近黑 %d%%）：圖可能沒載到' % (frac * 100)})
    return out


class Checker:
    def __init__(self, run, outdir, recheck_ms=1500, thumbs=True):
        self.run, self.out, self.recheck_ms, self.thumbs = run, outdir, recheck_ms, thumbs
        self.found = []; self.sheet = []; self.n = 0; self.seen = set()
        os.makedirs(outdir, exist_ok=True)

    async def _sample(self, pg):
        st = await pg.evaluate(STATE_JS)
        img = None
        if Image is not None:
            try: img = Image.open(io.BytesIO(await pg.screenshot()))
            except Exception: img = None
        probs = st['problems'] + pixel_problems(img, st['info'])
        return st, img, probs

    async def check(self, pg, label):
        """拍一張、檢查；有問題隔 recheck_ms 再看一次，兩次都有的才算。回傳這次確定的問題（list of str）"""
        self.n += 1
        st, img, probs = await self._sample(pg)
        if probs:
            await pg.wait_for_timeout(self.recheck_ms)
            st2, img2, probs2 = await self._sample(pg)
            keys2 = {p['k'] + p['msg'].split('（')[0] for p in probs2}
            probs = [p for p in probs if p['k'] + p['msg'].split('（')[0] in keys2]
            if probs: st, img = st2, img2
        info = st['info']; where = '%s %s %s' % (info.get('day', ''), info.get('hour', ''), info.get('zone', ''))
        msgs = [p['msg'] for p in probs]
        if self.thumbs and img is not None:
            self.sheet.append((img.copy(), '%d %s%s' % (self.n, label, '（有問題）' if msgs else '')))
        if msgs:
            key = (label, tuple(sorted(msgs)))
            if key not in self.seen:
                self.seen.add(key)
                fn = os.path.join(self.out, 'screen_problem_%02d.png' % (len(self.found) + 1))
                if img is not None: img.save(fn)
                self.found.append({'label': label, 'where': where, 'msgs': msgs, 'shot': fn})
                self.run.note('畫面檢查有問題：%s（%s）：%s' % (label, where, '；'.join(msgs)))
        return msgs

    def contact_sheet(self, per=12, w=280):
        """縮圖總表：每張 12 格（4×3），存在 OUT/screens_sheet_N.png，回傳檔名"""
        if Image is None or not self.sheet: return []
        files = []
        try: font = ImageFont.truetype('/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc', 14)
        except Exception: font = None
        for s in range(0, len(self.sheet), per):
            chunk = self.sheet[s:s + per]
            h = int(w * chunk[0][0].height / chunk[0][0].width)
            cols = 4; rows = (len(chunk) + cols - 1) // cols
            sheet = Image.new('RGB', (cols * w, rows * (h + 22)), (24, 24, 24)); d = ImageDraw.Draw(sheet)
            for i, (im, lab) in enumerate(chunk):
                x, y = (i % cols) * w, (i // cols) * (h + 22)
                sheet.paste(im.convert('RGB').resize((w, h)), (x, y + 22))
                d.text((x + 4, y + 3), lab[:28], fill=(255, 120, 120) if '有問題' in lab else (230, 230, 230), font=font)
            fn = os.path.join(self.out, 'screens_sheet_%d.png' % (s // per + 1)); sheet.save(fn); files.append(fn)
        return files

    def finish(self):
        files = self.contact_sheet()
        summary = json.dumps([{k: f[k] for k in ('label', 'where', 'msgs')} for f in self.found[:12]], ensure_ascii=False)
        self.run.check('畫面檢查（自動，%d 次）：沒有黑畫面、被蓋住、文字超框、按鈕出界、人物不在畫面' % self.n, not self.found, summary)
        if files: self.run.note('縮圖總表：' + '、'.join(files))
        return self.found


if __name__ == '__main__':   # 舊截圖的黑色比例（調門檻用）
    for p in sys.argv[1:]:
        f, c, t = dark_stats(Image.open(p)); print('%s  近黑 %.0f%%  全黑格 %d/%d' % (p, f * 100, c, t))
