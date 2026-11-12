/* 自動產生：tools/date/import_she_pays.py（docs/story_planning/AA_782_she_pays.json@f7a23d408＋docs/story_planning/AA_812_date_pays_promises.json@d7d818f8a8）。不要手改，改企劃 AA_782／AA_812 再重新匯入。
   她請客的格：pays＝{她:{互動點 id:[那一句]}}，src/date3d.js 載入時合進 S.SHE_PAYS（她在那個互動點說了那一句的那一次，祐廷那一份不扣）；
   split＝她付一部分（AA_812 SPLIT），合進 S.SPLIT（那一次祐廷那一份扣一半）；同一個互動點兩種都說了＝最後說的那一句算。
   cells＝AA_782 每一列（格號 n＝date_rewrite.py list 的編號、key＝哪一套、at＝date_lines.js 裡的位置）；superseded＝AA_782 被 AA_812 換了字的列；cells812＝AA_812 每一句（dup＝已經有了、不重複）。
   以安三格在 date3d.js 手寫（AA_780）。測試 tests/date_she_pays_1111_unit.js、tests/date_she_pays_812_1111_unit.js */
'use strict';
const SHE_PAYS_DATA={
 "src": "docs/story_planning/AA_782_she_pays.json@f7a23d408＋docs/story_planning/AA_812_date_pays_promises.json@d7d818f8a8",
 "pays": {
  "heroine_05": {
   "D10.snack": [
    "這次我請。"
   ],
   "D20.street": [
    "竹筒飯。我買一個，你也一個。我請。"
   ],
   "D22.fish": [
    "（活魚料理）這家我請。你不要搶。",
    "今天這家，還是我請。"
   ],
   "D23.cook": [
    "（代客料理）這頓我請。"
   ],
   "D30.stall": [
    "這攤還在。今天兩杯都我付。"
   ],
   "D06.cafe": [
    "這次我請。你坐著就好。"
   ],
   "D24.street": [
    "蔥餅這次我先買。"
   ]
  },
  "kexin": {
   "D30.stall": [
    "烤玉米這攤還在。這次我付。"
   ],
   "D13.drink": [
    "你上次點{lastDrink}，這次換我幫你點。"
   ]
  },
  "heroine_01": {
   "D29.sculpture": [
    "去買水吧。我請。"
   ],
   "D31.egg": [
    "你一顆，我一顆。我付過了。"
   ]
  },
  "heroine_03": {
   "D10.boat": [
    "上次坐完，我跟我媽說了。她說「有穿救生衣嗎」。這次船票我請。"
   ],
   "D12.pier": [
    "盡頭有一個賣咖啡的貨櫃，我請你。"
   ],
   "D15.store": [
    "謝謝，那關東煮我請。"
   ]
  },
  "heroine_04": {
   "D06.cafe": [
    "這家我來過兩次了。這次我請，你不要算。"
   ]
  },
  "classmate_peishan": {
   "D15.store": [
    "今天宵夜算我的。上次就想請了。"
   ],
   "D21.street": [
    "你要吃什麼？這攤我請。"
   ]
  }
 },
 "cells": [
  {
   "who": "heroine_05",
   "loc": "D10",
   "n": 54,
   "key": "D10.snack.remember",
   "pid": "D10.snack",
   "text": "這次我請。",
   "at": "/loc/D10/lines/heroine_05/hotspots/D10.snack/remember/lines/0/text"
  },
  {
   "who": "heroine_05",
   "loc": "D20",
   "n": 18,
   "key": "D20.street.normal#0",
   "pid": "D20.street",
   "text": "竹筒飯。我買一個，你也一個。我請。",
   "at": "/loc/D20/lines/heroine_05/hotspots/D20.street/normal/0/lines/0/text"
  },
  {
   "who": "heroine_05",
   "loc": "D22",
   "n": 45,
   "key": "D22.fish.first",
   "pid": "D22.fish",
   "text": "（活魚料理）這家我請。你不要搶。",
   "at": "/loc/D22/lines/heroine_05/hotspots/D22.fish/first/lines/0/text"
  },
  {
   "who": "heroine_05",
   "loc": "D22",
   "n": 54,
   "key": "D22.fish.remember",
   "pid": "D22.fish",
   "text": "今天這家，還是我請。",
   "at": "/loc/D22/lines/heroine_05/hotspots/D22.fish/remember/lines/0/text"
  },
  {
   "who": "heroine_05",
   "loc": "D23",
   "n": 23,
   "key": "D23.cook.first",
   "pid": "D23.cook",
   "text": "（代客料理）這頓我請。",
   "at": "/loc/D23/lines/heroine_05/hotspots/D23.cook/first/lines/0/text"
  },
  {
   "who": "heroine_05",
   "loc": "D30",
   "n": 54,
   "key": "D30.stall.remember",
   "pid": "D30.stall",
   "text": "這攤還在。今天兩杯都我付。",
   "at": "/loc/D30/lines/heroine_05/hotspots/D30.stall/remember/lines/0/text"
  },
  {
   "who": "kexin",
   "loc": "D30",
   "n": 54,
   "key": "D30.stall.remember",
   "pid": "D30.stall",
   "text": "烤玉米這攤還在。這次我付。",
   "at": "/loc/D30/lines/kexin/hotspots/D30.stall/remember/lines/0/text"
  }
 ],
 "superseded": [
  {
   "who": "heroine_05",
   "loc": "D06",
   "n": 45,
   "key": "D06.cafe.remember",
   "pid": "D06.cafe",
   "text": "上次你請的。這次我請。",
   "by": "docs/story_planning/AA_812_date_pays_promises.json",
   "now": [
    "這次我請。你坐著就好。"
   ]
  },
  {
   "who": "classmate_peishan",
   "loc": "D21",
   "n": 20,
   "key": "D21.street.normal#2",
   "pid": "D21.street",
   "text": "你要吃什麼？我請你，上次是你請的。",
   "by": "docs/story_planning/AA_812_date_pays_promises.json",
   "now": [
    "你要吃什麼？這攤我請。"
   ]
  }
 ],
 "dropped": [
  {
   "who": "classmate_peishan",
   "loc": "D31",
   "n": 53,
   "key": "D31.egg.normal#2",
   "text": "你要不要再一顆？我請你。",
   "why": "AA 11-11 18:58 回 LAWWW（BB 18:56 疑點②）：照 AA_812（較新）「只多買一顆蛋的不算」——「你要不要再一顆？我請你。」不是她付整份"
  }
 ],
 "split": {
  "heroine_01": {
   "D22.fish": [
    "一人一半。"
   ],
   "D25.cafe": [
    "謝謝，那蛋糕我點，一人一半。"
   ],
   "D30.stall": [
    "謝謝，那玉米我買，一人一半。"
   ]
  },
  "heroine_04": {
   "D32.stall": [
    "那甜湯我請你。"
   ]
  },
  "heroine_05": {
   "D22.fish": [
    "飯我請，飲料你請。",
    "你堅持的話。"
   ]
  },
  "classmate_peishan": {
   "D22.fish": [
    "這頓我們平分喔。你開車了，不能讓你出。"
   ],
   "D25.cafe": [
    "謝謝。那蛋糕我請。"
   ]
  },
  "kexin": {
   "D05.cafe": [
    "這裡的蛋糕很貴，一人一半就還好。"
   ],
   "D10.snack": [
    "這串我們一人一半。好，你多一口。"
   ],
   "D31.egg": [
    "那紅茶我請。"
   ]
  }
 },
 "cells812": [
  {
   "kind": "pays",
   "who": "heroine_01",
   "loc": "D29",
   "n": 31,
   "key": "D29.sculpture.normal#2",
   "pid": "D29.sculpture",
   "text": "去買水吧。我請。",
   "at": "/loc/D29/lines/heroine_01/hotspots/D29.sculpture/normal/2/lines/0/text"
  },
  {
   "kind": "pays",
   "who": "heroine_01",
   "loc": "D31",
   "n": 52,
   "key": "D31.egg.normal#1",
   "pid": "D31.egg",
   "text": "你一顆，我一顆。我付過了。",
   "at": "/loc/D31/lines/heroine_01/hotspots/D31.egg/normal/1/lines/0/text"
  },
  {
   "kind": "pays",
   "who": "heroine_03",
   "loc": "D10",
   "n": 32,
   "key": "D10.boat.remember",
   "pid": "D10.boat",
   "text": "上次坐完，我跟我媽說了。她說「有穿救生衣嗎」。這次船票我請。",
   "at": "/loc/D10/lines/heroine_03/hotspots/D10.boat/remember/lines/0/text"
  },
  {
   "kind": "pays",
   "who": "heroine_03",
   "loc": "D12",
   "n": 39,
   "key": "D12.pier.first.choice[1]",
   "pid": "D12.pier",
   "text": "盡頭有一個賣咖啡的貨櫃，我請你。",
   "at": "/loc/D12/lines/heroine_03/hotspots/D12.pier/first/choice/1/reply/0/text"
  },
  {
   "kind": "pays",
   "who": "heroine_03",
   "loc": "D15",
   "n": 37,
   "key": "D15.store.first.choice[0]",
   "pid": "D15.store",
   "text": "謝謝，那關東煮我請。",
   "at": "/loc/D15/lines/heroine_03/hotspots/D15.store/first/choice/0/reply/0/text"
  },
  {
   "kind": "pays",
   "who": "heroine_04",
   "loc": "D06",
   "n": 45,
   "key": "D06.cafe.remember",
   "pid": "D06.cafe",
   "text": "這家我來過兩次了。這次我請，你不要算。",
   "at": "/loc/D06/lines/heroine_04/hotspots/D06.cafe/remember/lines/0/text"
  },
  {
   "kind": "pays",
   "who": "heroine_05",
   "loc": "D06",
   "n": 45,
   "key": "D06.cafe.remember",
   "pid": "D06.cafe",
   "text": "這次我請。你坐著就好。",
   "at": "/loc/D06/lines/heroine_05/hotspots/D06.cafe/remember/lines/0/text"
  },
  {
   "kind": "pays",
   "who": "heroine_05",
   "loc": "D10",
   "n": 54,
   "key": "D10.snack.remember",
   "pid": "D10.snack",
   "text": "這次我請。",
   "at": "/loc/D10/lines/heroine_05/hotspots/D10.snack/remember/lines/0/text",
   "dup": "AA_782 D10.snack.remember"
  },
  {
   "kind": "pays",
   "who": "heroine_05",
   "loc": "D20",
   "n": 18,
   "key": "D20.street.normal#0",
   "pid": "D20.street",
   "text": "竹筒飯。我買一個，你也一個。我請。",
   "at": "/loc/D20/lines/heroine_05/hotspots/D20.street/normal/0/lines/0/text",
   "dup": "AA_782 D20.street.normal#0"
  },
  {
   "kind": "pays",
   "who": "heroine_05",
   "loc": "D22",
   "n": 45,
   "key": "D22.fish.first",
   "pid": "D22.fish",
   "text": "（活魚料理）這家我請。你不要搶。",
   "at": "/loc/D22/lines/heroine_05/hotspots/D22.fish/first/lines/0/text",
   "dup": "AA_782 D22.fish.first"
  },
  {
   "kind": "pays",
   "who": "heroine_05",
   "loc": "D22",
   "n": 54,
   "key": "D22.fish.remember",
   "pid": "D22.fish",
   "text": "今天這家，還是我請。",
   "at": "/loc/D22/lines/heroine_05/hotspots/D22.fish/remember/lines/0/text",
   "dup": "AA_782 D22.fish.remember"
  },
  {
   "kind": "pays",
   "who": "heroine_05",
   "loc": "D23",
   "n": 23,
   "key": "D23.cook.first",
   "pid": "D23.cook",
   "text": "（代客料理）這頓我請。",
   "at": "/loc/D23/lines/heroine_05/hotspots/D23.cook/first/lines/0/text",
   "dup": "AA_782 D23.cook.first"
  },
  {
   "kind": "pays",
   "who": "heroine_05",
   "loc": "D24",
   "n": 32,
   "key": "D24.street.remember",
   "pid": "D24.street",
   "text": "蔥餅這次我先買。",
   "at": "/loc/D24/lines/heroine_05/hotspots/D24.street/remember/lines/0/text"
  },
  {
   "kind": "pays",
   "who": "heroine_05",
   "loc": "D30",
   "n": 54,
   "key": "D30.stall.remember",
   "pid": "D30.stall",
   "text": "這攤還在。今天兩杯都我付。",
   "at": "/loc/D30/lines/heroine_05/hotspots/D30.stall/remember/lines/0/text",
   "dup": "AA_782 D30.stall.remember"
  },
  {
   "kind": "pays",
   "who": "classmate_peishan",
   "loc": "D15",
   "n": 43,
   "key": "D15.store.remember",
   "pid": "D15.store",
   "text": "今天宵夜算我的。上次就想請了。",
   "at": "/loc/D15/lines/classmate_peishan/hotspots/D15.store/remember/lines/0/text"
  },
  {
   "kind": "pays",
   "who": "classmate_peishan",
   "loc": "D21",
   "n": 20,
   "key": "D21.street.normal#2",
   "pid": "D21.street",
   "text": "你要吃什麼？這攤我請。",
   "at": "/loc/D21/lines/classmate_peishan/hotspots/D21.street/normal/2/lines/0/text"
  },
  {
   "kind": "pays",
   "who": "kexin",
   "loc": "D13",
   "n": 19,
   "key": "D13.drink.remember",
   "pid": "D13.drink",
   "text": "你上次點{lastDrink}，這次換我幫你點。",
   "at": "/loc/D13/lines/kexin/hotspots/D13.drink/remember/lines/0/text"
  },
  {
   "kind": "pays",
   "who": "kexin",
   "loc": "D30",
   "n": 54,
   "key": "D30.stall.remember",
   "pid": "D30.stall",
   "text": "烤玉米這攤還在。這次我付。",
   "at": "/loc/D30/lines/kexin/hotspots/D30.stall/remember/lines/0/text",
   "dup": "AA_782 D30.stall.remember"
  },
  {
   "kind": "split",
   "who": "heroine_01",
   "loc": "D22",
   "n": 50,
   "key": "D22.fish.first.choice[1]",
   "pid": "D22.fish",
   "text": "一人一半。",
   "at": "/loc/D22/lines/heroine_01/hotspots/D22.fish/first/choice/1/reply/0/text"
  },
  {
   "kind": "split",
   "who": "heroine_01",
   "loc": "D25",
   "n": 25,
   "key": "D25.cafe.first.choice[0]",
   "pid": "D25.cafe",
   "text": "謝謝，那蛋糕我點，一人一半。",
   "at": "/loc/D25/lines/heroine_01/hotspots/D25.cafe/first/choice/0/reply/0/text"
  },
  {
   "kind": "split",
   "who": "heroine_01",
   "loc": "D30",
   "n": 50,
   "key": "D30.stall.first.choice[1]",
   "pid": "D30.stall",
   "text": "謝謝，那玉米我買，一人一半。",
   "at": "/loc/D30/lines/heroine_01/hotspots/D30.stall/first/choice/1/reply/0/text"
  },
  {
   "kind": "split",
   "who": "heroine_04",
   "loc": "D32",
   "n": 48,
   "key": "D32.stall.first.choice[0]",
   "pid": "D32.stall",
   "text": "那甜湯我請你。",
   "at": "/loc/D32/lines/heroine_04/hotspots/D32.stall/first/choice/0/reply/0/text"
  },
  {
   "kind": "split",
   "who": "heroine_05",
   "loc": "D22",
   "n": 48,
   "key": "D22.fish.first.choice[0]",
   "pid": "D22.fish",
   "text": "飯我請，飲料你請。",
   "at": "/loc/D22/lines/heroine_05/hotspots/D22.fish/first/choice/0/reply/0/text"
  },
  {
   "kind": "split",
   "who": "heroine_05",
   "loc": "D22",
   "n": 50,
   "key": "D22.fish.first.choice[1]",
   "pid": "D22.fish",
   "text": "你堅持的話。",
   "at": "/loc/D22/lines/heroine_05/hotspots/D22.fish/first/choice/1/reply/0/text"
  },
  {
   "kind": "split",
   "who": "classmate_peishan",
   "loc": "D22",
   "n": 53,
   "key": "D22.fish.normal#2",
   "pid": "D22.fish",
   "text": "這頓我們平分喔。你開車了，不能讓你出。",
   "at": "/loc/D22/lines/classmate_peishan/hotspots/D22.fish/normal/2/lines/0/text"
  },
  {
   "kind": "split",
   "who": "classmate_peishan",
   "loc": "D25",
   "n": 26,
   "key": "D25.cafe.first.choice[0]",
   "pid": "D25.cafe",
   "text": "謝謝。那蛋糕我請。",
   "at": "/loc/D25/lines/classmate_peishan/hotspots/D25.cafe/first/choice/0/reply/0/text"
  },
  {
   "kind": "split",
   "who": "kexin",
   "loc": "D05",
   "n": 19,
   "key": "D05.cafe.normal#1",
   "pid": "D05.cafe",
   "text": "這裡的蛋糕很貴，一人一半就還好。",
   "at": "/loc/D05/lines/kexin/hotspots/D05.cafe/normal/1/lines/0/text"
  },
  {
   "kind": "split",
   "who": "kexin",
   "loc": "D10",
   "n": 55,
   "key": "D10.snack.dating#0",
   "pid": "D10.snack",
   "text": "這串我們一人一半。好，你多一口。",
   "at": "/loc/D10/lines/kexin/hotspots/D10.snack/dating/0/lines/0/text"
  },
  {
   "kind": "split",
   "who": "kexin",
   "loc": "D31",
   "n": 50,
   "key": "D31.egg.first.choice[1]",
   "pid": "D31.egg",
   "text": "那紅茶我請。",
   "at": "/loc/D31/lines/kexin/hotspots/D31.egg/first/choice/1/reply/0/text"
  }
 ]
};
