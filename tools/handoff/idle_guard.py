"""Stop hook（D152，使用者 2026-11-12：「你再等一個東西的時候要做其他可以做的事情不是嗎……我還要一個一個盯著 明明就寫過了」）：
回合要結束時，看這一回合最後一則回覆。如果寫的是「等測試／等 GHA／等某人回覆／幾分鐘後回來看」，卻沒有寫等的時候正在做哪一項（任務 ID），
就擋一次、叫它先挑一項不相依的待辦開工（CLAUDE.md §5 第 3 點，D125）。只擋一次（stop_hook_active 就放行），不讀、不改 repo 的檔。
自己測：python3 tools/handoff/idle_guard.py --selftest"""
import json, re, sys

WAIT = re.compile(r'(等|待)[^。\n]{0,24}(測試|GHA|綠燈|綠了|結果|跑完|回覆|回來|登記|交件|交稿)|(分鐘後|稍後|晚點|到時)[^。\n]{0,12}(回來|再看|再查|接著)|我(再)?回來看')
TASK = re.compile(r'\b[A-Z][A-Z0-9]{1,}(?:-[A-Z0-9]+)+\b|X\d{2,3}\b')
DOING = re.compile(r'(同時|這段時間|等的時候|先做|正在做|接著做|現在做|開工|已經開始|改好|修好|合併|已推|push)')
STOPOK = re.compile(r'(交班完成|現在換班|停止一般|請你決定|選擇題|要你決定|需要你)')

def verdict(text):
    """回傳 None＝放行；字串＝擋下來的理由"""
    if not text or STOPOK.search(text):
        return None
    if not WAIT.search(text):
        return None
    if TASK.search(text) and DOING.search(text):
        return None
    return ('D152／D125：這則回覆說在等（測試、GHA、別人的回覆或交件），卻沒寫等的時候在做哪一項。'
            '先跑 python3 tools/handoff/check_handoff.py queue --owner <你的職位>，挑一項不依賴那個結果的待辦馬上開工，'
            '回覆裡寫任務 ID 和做到哪；真的沒有可做的，照 CLAUDE.md §5「手上沒工作時」找窗口要，並寫明問了誰。')

def last_assistant_text(path):
    last = ''
    try:
        with open(path, encoding='utf-8') as f:
            for line in f:
                try:
                    o = json.loads(line)
                except ValueError:
                    continue
                if o.get('type') != 'assistant':
                    continue
                c = (o.get('message') or {}).get('content')
                t = c if isinstance(c, str) else ''.join(b.get('text', '') for b in (c or []) if isinstance(b, dict) and b.get('type') == 'text')
                if t.strip():
                    last = t
    except OSError:
        return ''
    return last

if __name__ == '__main__':
    if '--selftest' in sys.argv:
        cases = [('全套測試大約 18 分鐘後跑完，我排了提醒回來看。', True), ('接著我回去等全套測試結果，綠了就把版本交給 BB。', True),
                 ('等 GHA 的時候我正在做 PHONE-GO-PROMPT-1111，已推 abc1234。', False), ('兩件事都處理了，已推上去。', False),
                 ('交班完成了。等下一班 BB 回來判。', False), ('這題需要你決定，我用選擇題問。等你回覆。', False)]
        bad = [c for c, want in cases if bool(verdict(c)) != want]
        print('ALL PASS' if not bad else 'FAIL ' + json.dumps(bad, ensure_ascii=False)); sys.exit(1 if bad else 0)
    try:
        d = json.load(sys.stdin)
    except Exception:
        sys.exit(0)
    if d.get('stop_hook_active'):
        sys.exit(0)
    r = verdict(last_assistant_text(d.get('transcript_path') or ''))
    if r:
        print(json.dumps({'decision': 'block', 'reason': r}, ensure_ascii=False))
