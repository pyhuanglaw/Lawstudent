# CHARACTER / SOCIAL / MEMORY / RELATIONSHIP / GRAD-SCHOOL SCHEMA（v1）

資料：`src/data/characters.js`（`CHARACTERS`、`UNFAMILIAR_POOL`、`SOCIAL_GRAPH`、`PORTRAITS`）
引擎：`src/social3d.js`（`SOCIAL`）、`src/story3d.js`（日程生成 `populateSchedule`、對話入口 `talkCharacter`）、`src/game3d.js`（`spawnCharacter`）

## 1. Character（CHARACTERS[id]）

```js
{
  id:'heroine_03',                  // character_id：同時連結 3D 模型、2D 立繪、日程、關係、記憶、事件、存檔
  name:'陳語彤', nickname:'語彤', fullname, age:19, gender:'f'|'m',
  department:'社會系', year:1,      // year 可為數字或字串（'碩二'）
  social_layer:'A'|'B'|'C'|'D'|'E'|'F'|'G',   // A 法律系熟同學 B 不熟同學 pool C 其他系／通識 D 五位主要女主角 E 教授 F 助教／研究生／學長姐 G ambient
  visual_tier:0|1|2|3,              // 0 只有 3D；1 簡單立繪；2 完整立繪；3 多服裝多表情＋CG
  // 個性與生活（D 層必填全部；A/C 層至少 personality/academic_strength/career_goal）
  personality, speech_pattern, humor, strengths[], weaknesses[], contradictions, family_context, academic_status, career_goal, romantic_style, social_circle[],
  academic_strength, favorite_subjects[], weak_subjects[], study_habits, social_style, current_concerns,
  height_range, visual_identity, hair, eyes, clothing_style, accessories[],   // Character Bible 摘要（完整見 CHARACTER_ART_SPEC.md）
  daily_schedule:[ {days:[1,2,3,4,5], from:9, to:12, zone:'library', act:'read'|'class'|'wander'|'sit'|'barista'|'help'|'ta'|'club'|'eat'|'desk'|'wait', seat:[row,col]|'bell', note} ],
  story_arc:[…], possible_endings:[…],
  // 教授專用
  course:'刑事訴訟法', weekday:2, time:[10.2,12.1], field:'刑事訴訟法', teaching_style, exam_style, temperament, grad_mentor:true,
  // 視覺資產連結（替換資產只改這裡）
  char3d:{ spec:'hero_f' | {…P3 spec…}, model:'char.rpm_sample'(可選：ASSETS key，rigged GLB), extra:i(pool 用) },
  portrait:'heroine_03'             // PORTRAITS key（null = 沒有立繪，只有 3D）
}
```

`UNFAMILIAR_POOL`（B 層，20 人）另有 `descriptor`（RECOGNIZABLE 階段顯示的描述，例如「坐第三排的人」）與 `facts[]`（逐步揭露的小事實）。

## 2. Social Graph（SOCIAL_GRAPH）

`[{a:'heroine_02', b:'npc_fangyt', type:'highschool'}, …]`
type：friend / rival_friend / teammate / highschool / mentor / classmate / club / advisor / advisee / study_group / dj_crew / likes。
查詢：`SOCIAL.linksOf(id)`、`SOCIAL.link(a,b)`。玩家不是唯一連結；事件可用 `{npc:'heroine_02'}` 引用第三者。

## 3. Relationship（G.social.rel[id]）

```js
{ fam:0-100（FAMILIARITY）, trust, aff（AFFECTION）, resp（RESPECT）, comf（COMFORT）, rom（ROMANTIC_INTEREST，玩家→NPC）, npcRom（NPC→玩家）, seen, talked }
```
- 調整：`SOCIAL.adjust(id,{fam:+6,comf:+4})`（事件 consequences.rel）。玩家看不到數字。
- 階段 `SOCIAL.stage(id)`：STRANGER → ACQUAINTANCE(fam≥5) → FAMILIAR(≥20) → FRIEND(fam≥40 & trust≥25) → CLOSE_FRIEND(fam≥60 & trust≥45 & comf≥40) → POSSIBLE_ROMANTIC_INTEREST(fam≥45 & trust≥30 & (rom≥30 | npcRom≥30)) → ROMANTIC_TENSION(rom≥55 & npcRom≥45 & fam≥55) → RELATIONSHIP(flag dating_<id>)。
- 關係不一定往下走：事件可以降低 comf/trust、寫入 DECLINED_INVITE 等記憶；淡掉＝長期不互動（未來可加 decay）。
- 舊版存檔的單一數字 `G.rel[id]` 會遷移成 fam/trust。

## 4. Reveal（不熟的人如何被認識；G.social.reveal[id]）

UNKNOWN（顯示「法律系一年級的女生」）→ RECOGNIZABLE（看到 ≥3 次；顯示 descriptor「常在圖書館的女生」）→ ACQUAINTANCE（說過話；顯示名字）→ FRIEND（關係到 FRIEND）。
`SOCIAL.displayName(id)` 依此回傳名稱；互動按鈕、對話名牌、人物面板都用它。`SOCIAL.noticed(id)` 在人物被生成到玩家所在區域時累計。

## 5. NPC Memory（G.social.mem[id] = [{tag, day, note}]）

`SOCIAL.remember(id,tag,note)`、`SOCIAL.has(id,tag)`、`SOCIAL.lastDay(id,tag)`、`SOCIAL.memories(id)`。
標籤（可自由擴充；`SOCIAL.MEMORY_LABEL` 提供玩家可讀文字）：FIRST_MET, SHARED_CLASS, SHARED_MEAL, STUDIED_TOGETHER, HELPED, REFUSED_HELP, ARGUED, APOLOGIZED, SHARED_SECRET, SHARED_UMBRELLA, MISSED_DINNER, HELPED_WITH_REPORT, STUDIED_ALL_NIGHT, ARGUED_ABOUT_CAREER, GRAD_SCHOOL_DISCUSSION, BAR_EXAM_DISCUSSION, WALKED_TOGETHER, CAFE_AFTERNOON, LIBRARY_AFTERNOON, DECLINED_INVITE, CLASS_ANSWER_GOOD, CLASS_ANSWER_BAD, LENT_NOTES, INVITED_CLUB, TALKED_FAMILY, RAIN_LIBRARY, LATE_NIGHT_TALK, PLAYER_ASKED_QUESTION, CONFESSION, DATING, BREAKUP, EXAM_RESULT, GRAD_SCHOOL_RESULT, IMPORTANT_CONVERSATION。
同一天同 tag 只記一次；每人最多保留 80 筆。事件對話用 `{if:{memory:[…]}}` 引用。

## 6. Professor record（G.social.prof[id]）

`{perf（COURSE_PERFORMANCE）, part（CLASS_PARTICIPATION）, office（OFFICE_HOUR_VISITS）, research（RESEARCH_INTEREST）, rep（ACADEMIC_REPUTATION）, notes[]}`
`SOCIAL.profEvent(id,kind,delta,note)`；`SOCIAL.profKnowsYou(id)`（part+perf+office×2+research ≥ 20）。課堂答題（LEGAL.ask context 'class'）自動寫入。

## 7. Graduate-school path（G.social.grad）

`{interest:'NONE'|'CURIOUS'|'CONSIDERING'|'PREPARING'|'APPLYING'|'ADMITTED', field:'民法'|'民事訴訟法'|'商法'|'刑法'|'刑事訴訟法'|'公法'|'國際法'|'基礎法學'|'財經法'|'科技法', prep:0, log:[{day,reason}]}`
- `SOCIAL.gradBump(reason,field)`：累積「接觸」（教授課堂、seminar、學長姊、朋友準備研究所…）；每累積 2 筆自動從 NONE→CURIOUS→CONSIDERING。之後的階段（PREPARING/APPLYING/ADMITTED）由事件明確 `grad:{set}`。
- 尚未實作：選組課程需求、研究計畫／筆試／口試準備的時間消耗、與國考準備的衝突、NPC 也考研究所的結果事件。schema 已預留，見 REVIEW_README「尚未完成」。

## 8. Portrait Registry（PORTRAITS[id]）

見 ADV_SYSTEM.md。由 `visual_tier` 自動生成 outfit×expression 路徑；圖片不存在時 fallback 到 PLACEHOLDER_2D_PORTRAIT。

## 9. 存檔 schema 摘要（G）

```
v:2, name, day, weekday, hour, energy, money, zone, pos{x,z,yaw}, weather, flags{}, rel{}(舊), notes[], memo[], visited{}, stats{}, choices{},
social:{rel{}, mem{}, reveal{}, prof{}, grad{}}, events:{done{}, last{}, count}, legal:{q{}, misc{}, log[]}, cg:{unlocked[]}, savedAt
```
