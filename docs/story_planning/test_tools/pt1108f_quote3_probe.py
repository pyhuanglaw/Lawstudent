"""BB-B 2026-11-08：TEXT-QUOTE-UNIFY-1108 第三批（LAWWW-B 0e08b4d4a＋a13c632db）瀏覽器抽查——有名字說的台詞，畫面上外面沒有「」。
看「畫面上實際顯示的字」（對話框 #dlg、字幕 #caption 的 DOM），不是只看程式傳進去的字串。
  ride   ：芷若上車、下車字幕（STORY.onRide → GM.caption）。字幕是「<b>芷若</b>＋那一句」：名字後面接的字不是「，名字和句子之間有間距（CSS margin-right）。
  intro  ：第一次見面的自我介紹（STORY.talkCharacter 的 first 分支；B 層的人）。
  decline：學姊婉拒（SISG.declineLine／offLine → INV.playLines，有名字）。
  card   ：芷若在英國的明信片（Y2B.pcScene；對話框名字「明信片」）。走到宿舍書桌旁「明信片」按互動（真的介面），走不到才【捷徑】直接開。
【捷徑】ride、intro、decline 直接叫遊戲本身的函式（觸發條件另外測過：BIKE、talkCharacter、INV.flow），只驗「顯示出來的字」。
[前置] 讀使用者存檔 day46，每一項各自改日期、地點。
用法：LW_TESTS=<測試樹>/tests MODE=all|ride|intro|decline|card python3 pt1108f_quote3_probe.py URL 存檔資料夾 輸出資料夾"""
import asyncio, json, os, sys
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.dirname(__file__))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import playlib as L
import bbplay as P
from playwright.async_api import async_playwright

URL, SAVES, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
MODE = os.environ.get('MODE', 'all')
J = lambda x, n=900: json.dumps(x, ensure_ascii=False)[:n]
# 對話框畫面上的名字、字（每 150 ms 記一次，記到有變化就留）
DLG_WATCH = """(()=>{ if(window.__DW) return; window.__DW=[]; const pick=()=>{ const n=document.querySelector('#dlgName,#dlg .name,#dlg .who'), t=document.querySelector('#dlgText,#dlg .text,#dlg .body'); const d=document.getElementById('dlg');
  if(!d||d.classList.contains('hide')||getComputedStyle(d).display==='none') return null; return {n:n?n.textContent.trim():'', t:t?t.textContent.trim():d.textContent.trim()}; };
  let last=''; setInterval(()=>{ const v=pick(); if(!v) return; const k=v.n+'|'+v.t; if(k!==last){ last=k; window.__DW.push(v); } },150); })()"""


def full_lines(dw):
    """同一句打字中的各個長度只留最後（最長）那一筆"""
    out = []
    for v in dw:
        if out and out[-1]['n'] == v['n'] and v['t'].startswith(out[-1]['t']): out[-1] = v
        else: out.append(v)
    return out


async def fresh(pg, cdp, save, when, h, zone, pos=None, flags=None, tweak=None):
    s, d = await P.base(pg, save, when, h, zone, pos=pos, flags=flags)
    s.setdefault('home', {})['at'] = False
    if tweak: tweak(s)
    await P.load(pg, cdp, s, quiet=True); await P.init(pg)
    await pg.evaluate(DLG_WATCH); await pg.evaluate("window.__DW.length=0")
    return d


async def dlg_run(pg, cdp, run, tag, max_s=120):
    await P.dialog(pg, cdp, run, picks=(), max_s=max_s, start_s=20, idle_s=4, tag=tag)
    return full_lines(await pg.evaluate("window.__DW.slice()"))


def named_ok(lines, name_pred):
    bad = [x for x in lines if x['n'] and name_pred(x['n']) and (x['t'].startswith('「') or x['t'].startswith('『'))]
    got = [x for x in lines if x['n'] and name_pred(x['n'])]
    return got, bad


async def main():
    run = L.Run('pt1108f_quote3_' + MODE, OUT)
    save = json.load(open(os.path.join(SAVES, 'fatiao3d_save_day46.json'), encoding='utf-8'))
    modes = ['ride', 'intro', 'decline', 'card'] if MODE == 'all' else [MODE]
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL); run.check('遊戲載入', await L.wait_loaded(pg))
        await P.init(pg)
        if 'ride' in modes:
            await fresh(pg, cdp, save, '2026-10-14', 16.5, 'campus')
            info = await pg.evaluate("(()=>{ const r=STORY.rideInfo(GAME.G,'heroine_02'); return {r, nm:SOCIAL.displayName('heroine_02')}; })()")
            run.setup('[前置] day46 存檔改到 2026-10-14 16:30 校園；【捷徑】STORY.onRide(芷若) 上車／下車；rideInfo＝%s' % J(info))
            caps = []
            for on in (True, False):
                await pg.evaluate("(on=>{ const n=GAME.npc&&GAME.npc['heroine_02']||{charId:'heroine_02',id:'heroine_02'}; STORY.onRide(GAME,n,on); })(%s)" % ('true' if on else 'false'))
                await pg.wait_for_timeout(500)
                c = await pg.evaluate("(()=>{ const el=document.getElementById('caption'); const b=el.querySelector('b'); const bn=b?b.textContent:''; const all=el.textContent; const r=b?b.getBoundingClientRect():null, cr=el.getBoundingClientRect(); return {html:el.innerHTML, name:bn, text:all.slice(bn.length), gap:b?parseFloat(getComputedStyle(b).marginRight):null, vis:!el.classList.contains('hide')&&+getComputedStyle(el).opacity>0.5}; })()")
                caps.append(c); print('[CAP]', 'on' if on else 'off', J(c))
                await run.shot(pg, 'ride_' + ('on' if on else 'off'))
                await pg.wait_for_timeout(3200)
            want = [(info['r'] or {}).get('on'), (info['r'] or {}).get('off')]
            for c, w, lab in zip(caps, want, ('上車', '下車')):
                if not w: run.note('%s：rideInfo 沒有這一句（%s），略過' % (lab, J(info['r']))); continue
                run.check('%s字幕：名字「%s」＋那一句、外面沒有「」（%s）' % (lab, info['nm'], w), c['vis'] and c['name'] == info['nm'] and c['text'] == w and not c['text'].startswith('「'), J(c))
                run.check('%s字幕：名字和句子之間有間距（margin-right %s px）' % (lab, c['gap']), (c['gap'] or 0) >= 4, J(c['gap']))
        if 'intro' in modes:
            await fresh(pg, cdp, save, '2025-10-14', 12.3, 'campus')
            cand = await pg.evaluate("""(()=>{ const out=[]; for(const [id,c] of Object.entries(CHARACTERS)){ if(c&&c.social_layer==='B'&&!(SOCIAL.has&&SOCIAL.has(id,'FIRST_MET'))) out.push(id); } return out; })()""")
            run.setup('[前置] day46 存檔改到 2025-10-14 12:18 校園；B 層還沒認識的人：%s' % J(cand))
            if not cand:
                # 存檔裡 B 層的都認識了：【捷徑】把第一個 B 層的人的 FIRST_MET 拿掉（只為了看到第一次見面那一句）
                cand = await pg.evaluate("""(()=>{ const out=[]; for(const [id,c] of Object.entries(CHARACTERS)){ if(c&&c.social_layer==='B') out.push(id); } return out.slice(0,1); })()""")
                if cand: await pg.evaluate("(id=>{ const M=SOCIAL.mem?SOCIAL.mem(id):null; if(SOCIAL.forget) SOCIAL.forget(id,'FIRST_MET'); else if(M&&M.FIRST_MET!=null) delete M.FIRST_MET; })(%s)" % json.dumps(cand[0]))
                run.note('【捷徑】B 層的人存檔裡都認識了，拿掉 %s 的 FIRST_MET' % J(cand[:1]))
            if cand:
                cid = cand[0]
                nm = await pg.evaluate("id=>SOCIAL.displayName(id)", cid)
                await pg.evaluate("(id=>{ const P=GAME.E.player.obj.position; let n=GAME.npc[id]; if(!n&&GAME.spawnCharacter) n=GAME.spawnCharacter(id,P.x+1.2,P.z,{}); void STORY.talkCharacter(id,n); })(%s)" % json.dumps(cid))
                lines = await dlg_run(pg, cdp, run, 'intro')
                print('[INTRO]', cid, nm, J(lines, 1500))
                await run.shot(pg, 'intro_after')
                got, bad = named_ok(lines, lambda n: n == nm or nm in n)
                run.check('第一次見面（%s %s）：對話框有她說的句子，名字欄是她、句子外面沒有「」' % (cid, nm), got and not bad, J([got[:3], bad[:3]]))
            else:
                run.check('第一次見面：找得到 B 層的人', False, '沒有 social_layer B 的人')
        if 'decline' in modes:
            await fresh(pg, cdp, save, '2026-04-21', 18.0, 'campus')
            sid = await pg.evaluate("(()=>{ for(const [id,c] of Object.entries(CHARACTERS)) if(c&&c.name==='溫書瑀') return id; return null; })()")
            nm = await pg.evaluate("id=>SOCIAL.displayName(id)", sid)
            run.setup('[前置] day46 存檔改到 2026-04-21 18:00 校園；學姊＝%s（%s）；【捷徑】INV.playLines(學姊, SISG.declineLine／offLine)' % (sid, nm))
            await pg.evaluate("(id=>{ const G=GAME.G; const n=GAME.npc&&GAME.npc[id]; const who=n?{name:SOCIAL.displayName(id),obj:n.obj,charId:id}:{name:SOCIAL.displayName(id),charId:id}; void (async()=>{ GAME.sceneBegin&&GAME.sceneBegin(); try{ await INV.playLines(GAME,who,[SISG.declineLine(G),SISG.offLine(G),SISG.STUDY_YES]); } finally { GAME.sceneEnd&&GAME.sceneEnd(); } })(); })(%s)" % json.dumps(sid))
            lines = await dlg_run(pg, cdp, run, 'decline')
            print('[DECLINE]', J(lines, 1500))
            await run.shot(pg, 'decline_after')
            want = await pg.evaluate("[SISG.DECLINE[0],SISG.DECLINE_OFF[0],SISG.STUDY_YES]")
            got, bad = named_ok(lines, lambda n: n == nm or (nm and nm in n))
            run.check('學姊婉拒三句（DECLINE、考前、答應一起念）：名字欄是學姊、外面沒有「」', len(got) >= 3 and not bad and all(any(w == x['t'] or w in x['t'] for x in got) for w in want), J([got, bad, want]))
        if 'card' in modes:
            def tw(s):
                F = s['flags']; F['dating_kexin'] = False
                R = F.get('romance') or {}
                if isinstance(R.get('kexin'), dict): R['kexin']['status'] = 'none'
            d0 = (await P.day_of(pg, '2027-10-22'))['d']; d924 = (await P.day_of(pg, '2027-09-24'))['d']
            fl = {'ROOM_Y2': d0 - 400, 'ROOM_Y3': d0 - 47, 'ZR_PC': {'ver': {'2027-09-24': 'dorm'}, 'read': {'2027-09-24': d924}, 'sent': {'2027-09-24': 'slow'}}, 'ZR_CARDS_SENT': ['slow']}
            await fresh(pg, cdp, save, '2027-10-22', 12.5, 'dorm', flags=fl, tweak=tw)
            await pg.evaluate("(()=>{ const R=SOCIAL.rel('heroine_02'); R.fam=Math.max(R.fam||0,45); R.trust=Math.max(R.trust||0,30); R.comf=Math.max(R.comf||0,30); SOCIAL.remember('heroine_02','FIRST_MET',''); })()")
            await pg.wait_for_timeout(4000)
            pend = await pg.evaluate("(()=>{ try{ return {cards:Y2B.pcCards(GAME.G).map(c=>({key:c.key,ver:c.ver})), pend:Y2B.pcPending(GAME.G).map(c=>c.key)}; }catch(e){ return {err:String(e)}; } })()")
            run.setup('[前置] day46 存檔改到 2027-10-22 12:30 宿舍（沒交往；9/24 那張已讀已回）；明信片：%s' % J(pend))
            it = await L.find_it(pg, '明信片'); print('[CARD IT]', J(it))
            walked = False
            if it:
                walked = await L.go_to(pg, cdp, run, it['x'], it['z'], 0.6, '明信片', max_s=180)
                if walked: await L.tap(pg, cdp, '#interact')
            if not walked:
                run.note('【捷徑】走不到「明信片」互動點，直接 Y2B.pcScene(GAME)')
                await pg.evaluate("void Y2B.pcScene(GAME)")
            lines = await dlg_run(pg, cdp, run, 'card', max_s=150)
            print('[CARD]', J(lines, 1500))
            await run.shot(pg, 'card_after')
            got, bad = named_ok(lines, lambda n: '明信片' in n)
            run.check('明信片：名字欄「明信片」、句子外面沒有「」', got and not bad, J([got[:4], bad[:3]]))
        run.check('沒有 JS 例外', not errs, J(errs[:5]))
        await b.close()
    return run.finish()


if __name__ == '__main__':
    sys.exit(asyncio.run(main()))
