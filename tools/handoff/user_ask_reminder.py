"""UserPromptSubmit hook（HV-18，使用者 2026-10-18 選「三個都做」）：使用者每傳一則訊息，提醒這個工作階段把要求寫進自己職位的使用者要求檔。
不讀、不改任何檔案；只印一段 additionalContext。設定在 .claude/settings.json。"""
import json, sys
try:
    p = (json.load(sys.stdin).get('prompt') or '').strip()
except Exception:
    p = ''
SYS = ('<task-notification', '[SYSTEM NOTIFICATION', '<agent-message', '<webhook-payload', '<wake ', '<scheduled')
if p and not any(m in p[:400] for m in SYS):   # 背景工作完成、子代理回報、排程叫醒也會走 UserPromptSubmit：那些不是使用者的訊息，不提醒（14:1x 發現）
    print(json.dumps({'hookSpecificOutput': {'hookEventName': 'UserPromptSubmit', 'additionalContext':
        '（自動提醒 HV-18，使用者 2026-10-18 選定）使用者剛傳了訊息。如果是要求、修改、決定、選擇題答案、取消：回覆時就寫進你職位的 '
        'docs/handoff/user_asks_<LAWWW|LAWWW2|AA|BB>.json，一則一筆（id、at、quote＝原話、kind＝原話／選擇題答案／轉述／AI解讀、status、wants＝USER_WANTS 的列或 task＝任務 ID），'
        '同一批 commit＋push；AI 自己擴大或推論的寫 kind:AI解讀、confirmed:false，問過使用者才改 true。只是問問題、閒聊、問進度就不用寫。'
        '值班 LAWWW 每批工作結束跑 python3 tools/handoff/check_handoff.py asks。'}}, ensure_ascii=False))
