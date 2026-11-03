# -*- coding: utf-8 -*-
"""CC（帳號 A）：健身房（B1 重訓室）截圖探針（BUG-GYM-CROWD-STIFF-1103，55332d899；BB 2026-11-03 08:49）。
使用者原話：「健身房新增了人 但是都不太會動 更詭異好嗎」。修正：深蹲架、啞鈴架前不再擺站著不動的人（CROWD.GYM_STAND_FIT=false）。
用法：LW_TESTS=<wt>/tests SHA=<sha> python3 cc_gym_shot_probe.py <url> <out>   （PC 用 CC_HEADLESS=0 有視窗＋顯示卡）
【前置／捷徑】用遊戲自己的讀檔（playlib.load_state，條件事件關閉）把玩家放進 gym_b1（週三 17:00、有人在練的時段），不是玩家走過去。
檢查（只讀遊戲狀態）：E.zone 是 gym_b1；CROWD.GYM_STAND_FIT 是 false（舊版沒有這個開關＝記錄）；記下場上每個 NPC 的位置與 15 秒內移動距離（站著不動、
   而且在深蹲架／啞鈴架前 1.5 m 內的人＝FAIL）。截圖：橫向、直向各一張，間隔 5 秒再各一張（BB／使用者看圖）。
"""
import sys, os, json, asyncio
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..', 'tests'))
import playlib as L
from playwright.async_api import async_playwright

FLAGS = {'introDone': True, 'campusIntro': True, 'classDone': True, 'metAn': True, 'met_an': True, 'afternoonDone': True, 'lawclub': True, 'wenzhouLine': True}
NPCS = """(()=>{ const E=GAME.E, out=[]; for(const n of (E.npcs||[])){ const o=n.obj||n; if(!o||!o.position) continue;
  out.push({id:n.charId||n.id||n.name||'', x:+o.position.x.toFixed(2), z:+o.position.z.toFixed(2), vis:o.visible!==false, pose:n.pose||null}); } return out; })()"""
INFO = """(()=>({zone:(GAME.E.zone&&(GAME.E.zone.id||(GAME.E.zone.def&&GAME.E.zone.def.id)))||GAME.G.zone, hour:+(+GAME.G.hour).toFixed(2),
  fit:(typeof CROWD!=='undefined'&&('GYM_STAND_FIT' in CROWD))?CROWD.GYM_STAND_FIT:'(沒有這個開關)'}))()"""
fails = []


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + ('  ' + str(info) if info != '' else ''), flush=True)
    if not ok:
        fails.append(name)


async def main(url, od):
    os.makedirs(od, exist_ok=True)
    rec = {'sha': os.environ.get('SHA'), 'shots': []}
    async with async_playwright() as p:
        for land in (True, False):
            tag = 'land' if land else 'port'
            b, ctx, pg, cdp, errs = await L.launch(p, landscape=land)
            await pg.goto(url)
            check('%s：遊戲載入' % tag, await L.wait_loaded(pg))
            print('[前置／捷徑] 讀檔進 gym_b1 週三 17:00（條件事件關閉）', flush=True)
            await L.load_state(pg, {'zone': 'gym_b1', 'hour': 17.0, 'day': 8, 'weekday': 3, 'weather': 'sunny', 'pos': None, 'flags': FLAGS}, quiet_events=True, quiet_phone=True)
            await pg.wait_for_timeout(8000)
            info = await pg.evaluate(INFO)
            check('%s：人在 gym_b1' % tag, info.get('zone') == 'gym_b1', info)
            a = await pg.evaluate(NPCS)
            f1 = os.path.join(od, '%s_1.png' % tag); await pg.screenshot(path=f1)
            await pg.wait_for_timeout(5000)
            f2 = os.path.join(od, '%s_2.png' % tag); await pg.screenshot(path=f2)
            await pg.wait_for_timeout(10000)
            bb = await pg.evaluate(NPCS)
            pos0 = {(x['id'], i): x for i, x in enumerate(a)}
            moves = []
            for i, x in enumerate(bb):
                y = pos0.get((x['id'], i))
                if y:
                    moves.append({'id': x['id'], 'x': x['x'], 'z': x['z'], 'moved': round(((x['x'] - y['x']) ** 2 + (x['z'] - y['z']) ** 2) ** 0.5, 2), 'vis': x['vis'], 'pose': x['pose']})
            rec['shots'] += [f1, f2]
            rec[tag] = {'info': info, 'npcs': moves}
            if tag == 'land':
                check('CROWD.GYM_STAND_FIT 是 false（修正版）', info.get('fit') is False, info.get('fit'))
            print('  %s：NPC %d 位；15 秒內沒動（<0.05 m）的：%s' % (tag, len(moves), [m for m in moves if m['moved'] < 0.05 and m['vis']]), flush=True)
            check('%s：沒有 JS 例外' % tag, not errs, errs[:3])
            await b.close()
    json.dump(rec, open(os.path.join(od, 'gym.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('截圖：' + ', '.join(rec['shots']), flush=True)
    print('ALL PASS' if not fails else 'FAILED %d' % len(fails))
    return 1 if fails else 0

if __name__ == '__main__':
    sys.exit(asyncio.run(main(sys.argv[1], sys.argv[2])))
