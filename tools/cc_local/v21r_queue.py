"""CC-C 11-05：v9.10.21 發布前那一組（BB-C 06:41 P0、06:41 打烊統一）——LAWWW-C 給最終 SHA 以後，一次插到 PC 佇列最前面。
  用法：python3 tools/cc_local/v21r_queue.py <最終 SHA> [--dry]
  順序照 BB-C：長的先開（D118 兩支、social），短的塞空檔；全部同一個 SHA，ID 開頭 V21R_。
    1 回歸（p0、movement_regression、reachability_all、flow_class_real、minimap_direction、zone_transitions、touch_flow_wenzhou〔SOLO〕、save_compat_v7、TAPPREF）
    2 social_smoke（和 v9.10.20 同一組）
    3 新生南路 7 間（同弦、南洋、山嵐、大口、大步、好拍、運動廣場）：擋玩五項＋互動點＋點地；打烊統一一句＝CLOSE_ALL（PLACES 裡每一間有營業時間的店）
    4 點地：南洋 1 廳（NANYANG 探針裡）、體育館看台、TAPSCAN（一盞下沉地板優先）
    5 林家 v1c（點椅子）＋日和牆淡出（WZLIN 探針）、男一舍牆縫、彈吉他外層
    6 流程：D118B7、D118B5（aunt、sats…全部）、GUITAR_play
    7 總圖三樓 NPCTASK（P3，不擋）"""
import os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
Q = os.path.join(HERE, 'queue.txt')
P = 'docs/story_planning/test_tools/cc/'


def lines(sha):
    G = lambda i, t, m, xa, extra='': '%s | %s | game | %s | %s | %d | XARGS=%s;CC_HEADLESS=0%s' % (i, sha, t, 'index.html?turbo' if 'turbo' in xa else 'index.html', m, xa.replace('turbo', '').strip() or '{url}', extra)
    out = ['# ===== V21R（v9.10.21 發布前，BB-C 06:41 P0）：%s；長的先開、短的塞空檔 =====' % sha[:9]]
    # 6 流程（長的先開）
    out += ['V21R_D118B7 | %s | probe | %scc_d118b7_play.py | index.html | 70 | CC_HEADLESS=0' % (sha, P),
            'V21R_D118B5 | %s | probe | %scc_d118b5_play.py | index.html | 90 | CC_HEADLESS=0' % (sha, P)]
    # 2 social（v9.10.20 同一組）
    soc = [('heroine_01', 'h'), ('heroine_02', 'h'), ('heroine_03', 'h'), ('heroine_04', 'h'), ('heroine_05', 'h'), ('classmate_peishan', 'h'), ('kexin', 'h'), ('classmate_xinci', 'h'),
           ('zhe', 'f'), ('yu', 'f'), ('classmate_bohan', 'f'), ('classmate_mingxuan', 'f')]
    for c, kind in soc:
        if kind == 'h':
            out.append('V21R_soc_%s_talk | %s | probe | %scc_social_smoke_probe.py | index.html | 20 | CASES=%s;STEPS=media,first,greet,up,ladder,menu;CC_HEADLESS=0' % (c, sha, P, c))
            out.append('V21R_soc_%s_go | %s | probe | %scc_social_smoke_probe.py | index.html | 20 | CASES=%s;STEPS=invite,invite_study,reload,date,phone,shop,walk;CC_HEADLESS=0' % (c, sha, P, c))
        else:
            out.append('V21R_soc_fr_%s | %s | probe | %scc_social_smoke_probe.py | index.html | 20 | CASES=%s;STEPS=first,greet,up,ladder,menu,invite,invite_study,reload,phone,shop,walk;CC_HEADLESS=0' % (c, sha, P, c))
    # 1 回歸
    out += [G('V21R_p0', 'tests/p0_movement.py', 20, '{url}'), G('V21R_movreg', 'tests/movement_regression.py', 60, '{url}'),
            G('V21R_reach', 'tests/reachability_all.py', 30, 'turbo {url}'), G('V21R_class', 'tests/flow_class_real.py', 20, '{url} {out}'),
            G('V21R_mini', 'tests/minimap_direction.py', 20, 'turbo {url} {out}'), G('V21R_zone', 'tests/zone_transitions.py', 20, 'turbo {url}'),
            G('V21R_touch', 'tests/touch_flow_wenzhou.py', 20, 'turbo {url}').replace('XARGS=', 'SOLO=1;XARGS='),
            'V21R_v7 | %s | game | tests/save_compat_v7.py | index.html | 20 | SHA2=385e194;XARGS={url2} {url};CC_HEADLESS=0' % sha,
            'V21R_tappref | %s | probe | %scc_tappref_zone_probe.py | index.html | 15 | CC_HEADLESS=0' % (sha, P)]
    # 3 新生南路 7 間＋打烊統一
    out += ['V21R_xs_tongxian | %s | probe | %scc_xs_shop_probe.py | index.html | 60 | CC_HEADLESS=0;SHOP=tongxian' % (sha, P),
            'V21R_xs_nanyang | %s | probe | %scc_nanyang_v1_probe.py | index.html | 75 | CC_HEADLESS=0' % (sha, P),
            'V21R_xs_shanlan | %s | probe | %scc_shanlan_v1_probe.py | index.html | 120 | CC_HEADLESS=0' % (sha, P),
            'V21R_xs_dakou | %s | probe | %scc_xs_shop_probe.py | index.html | 120 | CC_HEADLESS=0;SHOP=dakou' % (sha, P),
            'V21R_xs_dabu | %s | probe | %scc_xs_shop_probe.py | index.html | 60 | CC_HEADLESS=0;SHOP=dabu' % (sha, P),
            'V21R_xs_haopai | %s | probe | %scc_xs_shop_probe.py | index.html | 60 | CC_HEADLESS=0;SHOP=haopai' % (sha, P),
            'V21R_xs_xsports | %s | probe | %scc_xs_shop_probe.py | index.html | 90 | CC_HEADLESS=0;SHOP=xsports' % (sha, P),
            'V21R_close_all | %s | probe | %scc_close_all_probe.py | index.html | 60 | CC_HEADLESS=0' % (sha, P)]
    # 4 點地
    out += ['V21R_gym_tap | %s | probe | %scc_tapscan_probe.py | index.html | 40 | CC_HEADLESS=0;ZONES=gym_arena;SEATS=gym_arena' % (sha, P),
            'V21R_tapscan | %s | probe | %scc_tapscan_probe.py | index.html | 90 | CC_HEADLESS=0;ZONES=wz_teahouse,xs_nanyang_hall,linze,wancai,library_hall,dorm_hall,xs_shanlan,xs_dakou,xs_xsports;SEATS=none' % (sha, P)]
    # 5 林家＋日和、男一舍、彈吉他、GUITAR_play
    out += ['V21R_wzlin | %s | probe | %scc_wzlin_v1c_probe.py | index.html | 60 | CC_HEADLESS=0' % (sha, P),
            'V21R_dorm_wall | %s | probe | %scc_dorm_wall_probe.py | index.html | 40 | CC_HEADLESS=0;TAG=v21r' % (sha, P),
            'V21R_guitar_dorm | %s | probe | %scc_guitar_dorm_probe.py | index.html | 20 | CC_HEADLESS=0' % (sha, P),
            'V21R_guitar_play | %s | probe | %scc_guitar_x196_play.py | index.html | 90 | CC_HEADLESS=0' % (sha, P)]
    # 7 P3
    out += ['V21R_npctask | %s | probe | %scc_npctask_probe.py | index.html | 60 | CTL=both;LOCS=hall,lib3f,lawlib,soc2f,b1;CC_HEADLESS=0' % (sha, P),
            '# ===== V21R 結束 =====']
    return out


def main():
    if len(sys.argv) < 2: sys.exit(__doc__)
    sha = subprocess.check_output(['git', 'rev-parse', sys.argv[1]]).decode().strip()
    new = lines(sha)
    if '--dry' in sys.argv:
        print('\n'.join(new)); return
    L = open(Q, encoding='utf-8').read().split('\n')
    if any(l.startswith('V21R_') and sha in l for l in L): sys.exit('V21R %s 已經在佇列裡' % sha[:9])
    i = next(k for k, l in enumerate(L) if l.strip() and not l.startswith('#'))   # 第一個項目前面＝最前面
    L[i:i] = new
    open(Q, 'w', encoding='utf-8').write('\n'.join(L))
    print('插入 %d 行（V21R，%s）到 queue.txt 第 %d 行' % (len([x for x in new if not x.startswith('#')]), sha[:9], i + 1))


if __name__ == '__main__':
    main()
