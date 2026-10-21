"""BB（帳號 A）2026-10-21：寒暑假快轉的停點，和 BB_HOLFF_ROOMS_1021 第一節（LAWWW）的預期一站一站對。
用法：python3 holff_compare.py <holff_probe 輸出資料夾>/holff.json
預期照清單原文（「旁白卡」「手機」「回家」是註記；沒寫時間的只比日期）。大三暑假只寫頭尾（中間照 BB_R2Y3B_1021 S1～S3），只比頭尾。"""
import sys, json, re
EXPECT = {
    'Y1W': ['1/14 18:30 旁白卡', '1/15 21:30 手機（阿哲）', '1/20', '2/5', '2/16 12:00', '2/16 17:00 回家', '2/17 11:00', '2/22 12:00'],
    'Y1S': ['7/9 12:00', '7/15 10:00', '7/15 21:00 手機（C05）', '7/20', '8/12 旁白卡', '8/25', '9/6 08:30'],
    'Y2W': ['1/20 20:00', '1/28', '2/5 12:00', '2/5 17:00', '2/6 11:00', '2/16 旁白卡', '2/21 12:00'],
    'Y2S': ['6/28', '7/15', '7/20 18:30', '7/20 21:30 手機（VA10）', '8/1 20:30 手機（沒回才有）', '8/15 旁白卡', '8/25', '9/5 12:00'],
    'Y3W': ['1/10 21:30 手機（姊姊）', '1/19 旁白卡', '1/25 12:00', '1/25 17:00 回家', '1/26 07:00 主線 9', '1/26 11:00', '2/2 旁白卡', '2/9 21:30 手機（阿哲）', '2/20 12:00'],
    'Y3S': ['7/18 旁白卡', '9/3 12:00'],
    'Y4W': ['1/17 國考那一句', '1/24', '2/12 12:00', '2/12 17:00', '2/13 11:00', '2/18 12:00'],
}


def parse_exp(s):
    m = re.match(r'(\d+)/(\d+)(?: (\d+):(\d+))?\s*(.*)', s)
    mo, d = int(m.group(1)), int(m.group(2)); h = int(m.group(3)) + int(m.group(4)) / 60 if m.group(3) else None
    return mo, d, h, m.group(5)


def parse_obs(at):
    m = re.match(r'\d{4}-(\d+)-(\d+) ([\d.]+)', at)
    return int(m.group(1)), int(m.group(2)), float(m.group(3))


def main():
    d = json.load(open(sys.argv[1], encoding='utf-8')); res = d.get('res', d); bad = 0
    for bk, exp in EXPECT.items():
        stops = res.get(bk)
        if stops is None: print('== %s：沒有跑' % bk); continue
        obs = [(parse_obs(s['at']), s) for s in stops if s.get('at')]
        print('== %s：預期 %d 站、實際記到 %d 筆' % (bk, len(exp), len(obs)))
        used = set()
        for e in exp:
            mo, dd, h, note = parse_exp(e)
            hit = None
            for i, ((m2, d2, h2), s) in enumerate(obs):
                if i in used or (m2, d2) != (mo, dd): continue
                if h is None or abs(h2 - h) <= 0.6: hit = i; break
            if hit is None:
                bad += 1; print('   ✗ 沒停到：%s' % e)
            else:
                used.add(hit); (m2, d2, h2), s = obs[hit]; print('   ✓ %s ← %d/%d %.2f %s' % (e, m2, d2, h2, (s.get('what') or '')[:40]))
        extra = [obs[i] for i in range(len(obs)) if i not in used]
        for (m2, d2, h2), s in extra:
            print('   ＋ 多停：%d/%d %.2f %s %s' % (m2, d2, h2, (s.get('what') or '')[:40], json.dumps((s.get('lines') or [])[:2], ensure_ascii=False)[:120]))
    print('預期的站沒停到：%d' % bad)


main()
