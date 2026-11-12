#!/usr/bin/env python3
"""CANON-NO-ECON-1112 第四批：AA 的「src 對照表」（AA_892、AA_894…，舊 → 新，整句）疊在匯入工具讀到的稿上。
匯入工具讀稿（read_fix 換名）以後、建資料以前呼叫 fix(稿的路徑, 稿的文字)：每一列的「舊」要在稿裡找得到（對不到就停，不猜），整句換成「新」。
舊字用 \\u 跳脫寫（D158：這個檔不出現那些字）。AA 把稿本身改掉以後，這裡那幾列對不到就會停——到時候刪掉那幾列。"""
import sys
U = lambda t: t.encode('ascii').decode('unicode_escape')

ROWS = {
    # AA_894 第 3 節（src/data/msg_replies.js；稿 AA_709）＋AA_892 第 2 節那張照片
    'docs/story_planning/AA_709_msg_replies.json': ('AA_894', [
        (U(r'\u9019\u5834\u4f60\u61c9\u8a72\u6703\u60f3\u807d\u3002\u963f\u52f3\u4e5f\u6703\u53bb\u3002'), '這場你應該會想聽。'),
        (U(r'\u7269\u6b0a\u8003\u58de\u7684\u90a3\u4e00\u7ae0\uff0c\u6211\u8b1b\u7d66\u4e88\u6a02\u807d\uff0c\u8b1b\u5230\u5979\u61c2\u3002'), '物權考壞的那一章，我講給我室友聽，講到她懂。'),
        (U(r'\u4e88\u6a02\u6709\u8aaa\u8b1d\u8b1d\u55ce\uff1f'), '妳室友有說謝謝嗎？'),
        (U(r'\u4e88\u6a02\u8aaa\u6211\u8b80\u66f8\u7684\u6642\u5019\u6703\u81ea\u8a00\u81ea\u8a9e\u3002\u5979\u9304\u4e0b\u4f86\u4e86\u3002\u6211\u4e0d\u627f\u8a8d\u3002'), '我室友說我讀書的時候會自言自語。她錄下來了。我不承認。'),
        (U(r'\u4e88\u6a02\u8aaa\u6211\u4e00\u76f4\u5728\u7f75\u6c11\u6cd5\u3002'), '我室友說我一直在罵民法。'),
        (U(r'\u518d\u6c92\u5230\uff0c\u6211\u628a\u8868\u683c\u5206\u4eab\u7d66\u4e88\u6a02\uff0c\u53eb\u5979\u76ef\u4f60\u3002'), '再沒到，我叫我室友去你宿舍樓下堵你。'),
        (U(r'\U0001f4f7\uff08\u8b80\u66f8\u6703\u7684\u9577\u684c\u3002\u4e88\u6a02\u6bd4 YA\uff0c\u53ef\u6615\u4f4e\u982d\u5728\u5beb\u8b1b\u7fa9\uff0c\u6c92\u6709\u770b\u93e1\u982d\u3002\uff09'), '📷（大口漢堡二樓的長桌。阿哲比 YA，可昕低頭在寫講義，沒有看鏡頭。）'),
        (U(r'\u4e88\u6a02\u62cd\u7684\u3002\u5979\u62cd\u5b8c\u624d\u8ddf\u6211\u8aaa\u3002'), '阿哲拍的。他拍完才跟我說。'),
        (U(r'\u4e88\u6a02\u5f88\u6709\u7cbe\u795e\u3002'), '阿哲很有精神。'),
    ]),
    # AA_894 第 5 節（src/data/activity_scenes.js；稿 AA_708）
    'docs/story_planning/AA_708_activity_scenes.json': ('AA_894', [
        (U(r'\u50b3\u7d66\u4e88\u6a02\u3002\u5979\u6703\u554f\u6211\u5403\u4e86\u4ec0\u9ebc\uff0c\u6211\u5c31\u53eb\u5979\u81ea\u5df1\u731c\u3002'), '傳給我室友。她會問我吃了什麼，我就叫她自己猜。'),
        (U(r'\u4e88\u6a02\u53eb\u6211\u5e36\u5979\u559c\u6b61\u7684\u90a3\u9593\u7684\u7167\u7247\u56de\u53bb\u3002\u5979\u8aaa\u8981\u4f86\u3002'), '我室友叫我拍她喜歡的那間的照片回去。她說要來。'),
        (U(r'\uff08\u5979\u62cd\u4e86\u5e97\u88e1\u7684\u83dc\u55ae\uff0c\u50b3\u7d66\u4e88\u6a02\uff0c\u4e88\u6a02\u99ac\u4e0a\u56de\u4e86\u4e00\u4e32\u9a5a\u5606\u865f\u3002\uff09'), '（她拍了店裡的菜單傳給室友，對方馬上回了一串驚嘆號。）'),
        (U(r'\u4e88\u6a02\u8aaa\u5979\u8981\u53eb\u4f60\u300c\u53f8\u6a5f\u300d\u3002\u6211\u8aaa\u4f60\u6c92\u6709\u8eca\u3002'), '我室友問我你是誰。我說是同學。……她不信。'),
        (U(r'\uff08\u5979\u628a\u624b\u6a5f\u84cb\u8d77\u4f86\uff0c\u6c92\u6709\u56de\u4e88\u6a02\u3002\uff09'), '（她把手機蓋起來，沒有回室友。）'),
        (U(r'\u6728\u67f5\u6709\u4e00\u9593\u4e5d\u5206\u7684\u3002\u4f60\u4f86\uff0c\u6211\u518d\u544a\u8a34\u4f60\u662f\u54ea\u4e00\u9593\u3002'), '高雄有一間九分的。這間七分，已經很高了。'),
        (U(r'\u4f60\u5011\u9019\u908a\u7684\u5496\u5561\u5ef3\u597d\u591a\u3002\u6728\u67f5\u53ea\u6709\u5e7e\u9593\u3002'), '公館的咖啡廳好多。我在高雄家附近只有兩間。'),
        (U(r'\u300c\u6728\u67f5\u90a3\u5e7e\u9593\u59b3\u90fd\u53bb\u904e\uff1f\u300d'), '「高雄那兩間妳都去過？」'),
        (U(r'\u81fa\u5317\u7684\u96fb\u5f71\u9662\u597d\u5927\u3002\u6728\u67f5\u90a3\u9593\u53ea\u6709\u4e09\u500b\u5ef3\u3002'), '臺北的電影院好大。我家附近那間只有三個廳。'),
        (U(r'\u2026\u2026\u6211\u9084\u4e0d\u60f3\u56de\u6728\u67f5\u3002'), '……我還不想回宿舍。'),
        (U(r'\u4e88\u6a02\u751f\u65e5\u5feb\u5230\u4e86\uff0c\u6211\u60f3\u9001\u5979\u4e00\u672c\u66f8\u3002\u4f60\u5e6b\u6211\u6311\u3002'), '我室友生日快到了，我想送她一本書。你幫我挑。'),
    ]),
}


def fix(path, text):
    row = ROWS.get(path)
    if not row:
        return text
    doc, L = row
    bad = []
    for old, new in L:
        if old not in text:
            bad.append(old[:24])
            continue
        text = text.replace(old, new)
    if bad:
        raise SystemExit(f'CANON-NO-ECON-1112（{doc}）{path}：舊字對不到（AA 改了稿就刪掉那幾列）：' + '｜'.join(bad))
    return text


def tag(path):
    row = ROWS.get(path)
    return row[0] if row else ''


if __name__ == '__main__':
    print({k: len(v[1]) for k, v in ROWS.items()})
