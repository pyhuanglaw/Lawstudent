/* 自動產生：tools/date/import_she_pays.py（docs/story_planning/AA_782_she_pays.json@f7a23d408）。不要手改，改企劃 AA_782 再重新匯入。
   她請客的格：pays＝{她:{互動點 id:[那一句]}}，src/date3d.js 載入時合進 S.SHE_PAYS（她在那個互動點說了那一句的那一次，祐廷那一份不扣）；
   cells＝稿的每一列（格號 n＝date_rewrite.py list 的編號、key＝哪一套、at＝date_lines.js 裡的位置）。以安三格在 date3d.js 手寫（AA_780）。測試 tests/date_she_pays_1111_unit.js */
'use strict';
const SHE_PAYS_DATA={
 "src": "docs/story_planning/AA_782_she_pays.json@f7a23d408",
 "pays": {
  "heroine_05": {
   "D06.cafe": [
    "上次你請的。這次我請。"
   ],
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
   ]
  },
  "classmate_peishan": {
   "D21.street": [
    "你要吃什麼？我請你，上次是你請的。"
   ],
   "D31.egg": [
    "你要不要再一顆？我請你。"
   ]
  },
  "kexin": {
   "D30.stall": [
    "烤玉米這攤還在。這次我付。"
   ]
  }
 },
 "cells": [
  {
   "who": "heroine_05",
   "loc": "D06",
   "n": 45,
   "key": "D06.cafe.remember",
   "pid": "D06.cafe",
   "text": "上次你請的。這次我請。",
   "at": "/loc/D06/lines/heroine_05/hotspots/D06.cafe/remember/lines/0/text"
  },
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
   "who": "classmate_peishan",
   "loc": "D21",
   "n": 20,
   "key": "D21.street.normal#2",
   "pid": "D21.street",
   "text": "你要吃什麼？我請你，上次是你請的。",
   "at": "/loc/D21/lines/classmate_peishan/hotspots/D21.street/normal/2/lines/0/text"
  },
  {
   "who": "classmate_peishan",
   "loc": "D31",
   "n": 53,
   "key": "D31.egg.normal#2",
   "pid": "D31.egg",
   "text": "你要不要再一顆？我請你。",
   "at": "/loc/D31/lines/classmate_peishan/hotspots/D31.egg/normal/2/lines/0/text"
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
 ]
};
