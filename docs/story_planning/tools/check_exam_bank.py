"""期末考題庫檢查（AA_126 1-5）。

用法：python3 docs/story_planning/tools/check_exam_bank.py docs/story_planning/exam_bank [快取資料夾]

做兩件事：
1. 格式：欄位齊全、id 不重複、是非題 answer 是 true/false、選擇題三或四個不同的選項且 answer 是索引、
   status 是 LEGAL_REVIEW_REQUIRED、每科至少 15 題、週次在 1～16 且不是期中考週（8、9）。
   檔案可以是 {"course":…, "questions":[…]}，也可以直接是題目的陣列（課程代號看檔名）。
2. 條文：basis 引號裡的每一句，都要原文出現在全國法規資料庫的現行條文裡（下載全文比對）。
   「……」是省略，前後分開比；括號裡的「對照」說明不比。
   basis 只寫條號、沒有原文的題目，列成「提醒」（不算錯），請補上原文：成績單要顯示條文。
這是抄寫錯誤的檢查，不是法律審查：答案對不對、題意清不清楚，還是要人看。
"""
import glob, json, os, re, subprocess, sys, tempfile, html

# basis 開頭 → 法規代碼（越具體的放越前面）
LAWS = [("中華民國憲法增修條文", "A0000002"), ("增修條文", "A0000002"), ("憲法訴訟法", "A0030159"),
        ("行政程序法", "A0030055"), ("公民與政治權利", "I0020028"), ("刑事訴訟法", "C0010001"),
        ("中華民國刑法", "C0000001"), ("刑法", "C0000001"), ("民法", "B0000001"), ("中華民國憲法", "A0000001"),
        ("憲法", "A0000001")]
FIELDS = ["id", "course", "week", "type", "q", "answer", "core", "basis", "status"]
# 只有條號、沒有原文的片段（例如「民法第184條第2項」「刑法第27條第1項前段」）
CITE = re.compile(r"[^：。]{0,20}?第\d+條(?:之\d+)?(?:第\d+項)?(?:第\d+款)?(?:前段|後段|但書|本文)?(?:[、及和與]第?\d+(?:條|項|款)(?:前段|後段|但書|本文)?)*")


def law_text(pcode, cache):
    path = os.path.join(cache, f"law_{pcode}.txt")
    if not os.path.exists(path):
        t = subprocess.run(["curl", "-sS", "-m", "30", f"https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode={pcode}"],
                           capture_output=True, text=True).stdout
        i = t.find("law-reg-content")
        s = t[i:] if i >= 0 else ""
        s = re.split(r'<div class="law-tools|<footer', s)[0]
        s = html.unescape(re.sub(r"<[^>]+>", "", s))
        if len(s) < 50:
            sys.exit(f"下載不到 {pcode}（網路？）")
        open(path, "w").write(s)
    return re.sub(r"\s+", "", open(path).read())


def main():
    root = sys.argv[1]
    cache = sys.argv[2] if len(sys.argv) > 2 else os.path.join(tempfile.gettempdir(), "exam_bank_lawcache")
    os.makedirs(cache, exist_ok=True)
    bad = 0
    notes = 0
    seen = set()
    for f in sorted(glob.glob(os.path.join(root, "*.json"))):
        d = json.load(open(f))
        if isinstance(d, list):
            d = {"course": os.path.splitext(os.path.basename(f))[0], "questions": d}
        qs = d.get("questions", [])
        if len(qs) < 15:
            bad += 1; print(f"{f}: 只有 {len(qs)} 題（至少 15）")
        for q in qs:
            tag = q.get("id", "?")
            for k in FIELDS:
                if k not in q:
                    bad += 1; print(tag, "少了欄位", k)
            if tag in seen:
                bad += 1; print(tag, "id 重複")
            seen.add(tag)
            if q.get("course") != d.get("course"):
                bad += 1; print(tag, "course 和檔案不一致")
            w = q.get("week")
            if not isinstance(w, int) or not 1 <= w <= 16 or w in (8, 9):
                bad += 1; print(tag, "週次不對", w)
            if q.get("type") == "tf":
                if q.get("options", None) is not None or not isinstance(q.get("answer"), bool):
                    bad += 1; print(tag, "是非題：options 要是 null、answer 要是 true/false")
            elif q.get("type") == "mc":
                o, a = q.get("options"), q.get("answer")
                if not (isinstance(o, list) and len(o) in (3, 4) and len(set(o)) == len(o) and isinstance(a, int)
                        and not isinstance(a, bool) and 0 <= a < len(o)):
                    bad += 1; print(tag, "選擇題：三或四個不同的選項、answer 是選項的索引")
            else:
                bad += 1; print(tag, "type 只能是 tf 或 mc")
            if q.get("status") != "LEGAL_REVIEW_REQUIRED":
                bad += 1; print(tag, "status 要先標 LEGAL_REVIEW_REQUIRED")
            b = q.get("basis", "")
            pc = next((p for k, p in LAWS if b.startswith(k)), None)
            if not pc:
                bad += 1; print(tag, "basis 開頭認不出是哪一部法：", b[:20]); continue
            body = re.sub(r"[（(]對照[^）)]*[）)]", "", b)
            # 用括號保留分隔的引用標頭：標頭裡寫了別的法（例如「憲法訴訟法第 1 條：」），後面的原文就換那部法比對
            parts = re.split(r"([^：。]{0,40}?第 ?\d+ ?條(?:之 ?\d+)?(?:第 ?\d+ ?項)?(?:第 ?\d+ ?款)?：|前言：|……)", body)
            n = 0
            for i, part in enumerate(parts):
                if i % 2 == 1:
                    pc = next((p for k, p in LAWS if k in part), pc)
                    continue
                for sent in re.split(r"。", re.sub(r"\s+", "", part)):
                    sent = sent.strip("，；")
                    if len(sent) < 6 or CITE.fullmatch(sent):
                        continue
                    n += 1
                    if sent not in law_text(pc, cache):
                        bad += 1; print(tag, "條文對不上：", sent[:50])
            if n == 0:
                notes += 1; print(tag, "提醒：basis 只有條號，請補上條文原文")
    print(f"檢查 {len(seen)} 題，問題 {bad} 個，提醒 {notes} 個")
    sys.exit(1 if bad else 0)


main()
