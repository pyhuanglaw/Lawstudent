"""產生 SOURCE REVIEW ZIP 與 REVIEW_FILE_INDEX.txt。用法：python3 tools/make_review_zip.py"""
import os, zipfile, datetime, pathlib, re
ROOT=pathlib.Path(__file__).resolve().parent.parent
EXCLUDE_DIRS={'build','shots','node_modules','.git','__pycache__'}
EXCLUDE_FILES={'assets/models/Michelle.glb','assets/models/Soldier.glb','assets/models/Xbot.glb','assets/models/readyplayer.me.glb'}
TAGS=[
 ('index.html','[CORE][UI][CONFIG] 開發版入口：UI DOM、CSS（HUD／對話框／選項／選單／載入／直向提示）、script 載入順序、GAME.boot()'),
 ('build.py','[CONFIG] 打包：內嵌 script、複製 GLB、產生 .glb.json、artifact 版'),
 ('package.json','[CONFIG] 專案資訊與 scripts（無 npm 相依）'),
 ('.env.example','[CONFIG] 無秘密；佔位'),
 ('README.md','[CONFIG] 遊玩／操作／系統／結構／限制'),
 ('LICENSES.md','[ASSET][CONFIG] 第三方素材與授權'),
 ('SOURCES.md','[CONFIG] 研究參考來源'),
 ('lib/three.bundle.js','[RENDERING][ASSET] three.js r187dev（MIT）classic-script 打包'),
 ('lib/three.jsm.bundle.js','[RENDERING][ASSET] GLTFLoader / SkeletonUtils / BufferGeometryUtils 打包'),
 ('lib/three-vrm.bundle.js','[RENDERING][ASSET][CHARACTER] @pixiv/three-vrm（MIT）自 TS 原始碼以 esbuild 打包成 classic script'),
 ('test_vrm.html','[CHARACTER][ASSET] VRM pipeline 驗證頁（載入、Mixamo 重定向、表情、姿勢）'),
 ('src/people3d.js','[CHARACTER][PLACEHOLDER] PLACEHOLDER_CHARACTER：程序化人物（身體、髮型含馬尾、表情、動畫）、mergeStatic'),
 ('src/assets3d.js','[ASSET] 資產層：manifest（GLB、來源、授權、fallback）、loader（glb / .glb.json / ASSET_DATA）、instance'),
 ('src/character3d.js','[CHARACTER][ASSET] 人物介面 CHAR.build/animate/setExpr/headY；GLB driver、Mixamo rest-pose 重定向、sit/read 姿勢、口型'),
 ('src/world3d.js','[ENVIRONMENT][PLACEHOLDER] LEVEL_BLOCKOUT 產生器：Canvas 貼圖、建築、fallback 樹、路燈、腳踏車、校門、風動 shader'),
 ('src/engine3d.js','[CORE][RENDERING][GAMEPLAY] 引擎：renderer、光線／時間關鍵影格、天氣、天空、鏡頭（跟隨／碰撞／cinematic）、觸控輸入、NavGrid A*、碰撞、NPC 行為（wander/route/follow/greet）、LOD、分區載入'),
 ('src/zones3d.js','[ENVIRONMENT][PLACEHOLDER] 區域定義：校園、公館、溫州街、教室、萬才館、總圖、咖啡廳、便利商店、麵店、書店、宿舍；nav、互動點、座位、道具'),
 ('src/audio3d.js','[CORE] WebAudio 合成環境音'),
 ('src/data/characters.js','[NPC][CHARACTER] CHARACTERS（五女主、熟同學、其他系、助教、8 教授）、UNFAMILIAR_POOL（20）、SOCIAL_GRAPH、PORTRAITS registry'),
 ('src/data/legal_qbank.js','[LEGAL] 刑訴題庫 Q001–Q084（使用者提供；答案不可改）＋誤解標籤'),
 ('src/data/events.js','[GAMEPLAY][NPC] STORY_EVENTS 事件包 v1（18）＋ v1.1（34）＝ 52 ＋ SMALLTALK'),
 ('src/social3d.js','[NPC][GAMEPLAY][SAVE] 關係六維、階段、記憶、揭露、教授紀錄、社會圖查詢、研究所志向'),
 ('src/adv3d.js','[UI][CHARACTER] ADV 模式：背景（freeze/blur/image）、立繪槽、fallback、歷史、CG 登錄'),
 ('src/legal3d.js','[LEGAL][GAMEPLAY] 知識狀態機、誤解、抽題、上課／同學／讀書會包裝、筆記本摘要'),
 ('src/events3d.js','[GAMEPLAY][NPC] 條件事件引擎：條件評估、auto/enter/interact 觸發、對話執行、選項、後果'),
 ('src/game3d.js','[CORE][GAMEPLAY][UI][SAVE] 遊戲層：狀態、HUD、對話框／選項／caption、運鏡、座位互動、讀書、存檔（自動／欄位／匯出／匯入／驗證／遷移）、選單（筆記／人物／法律／地圖／存檔／設定）、搖桿、主迴圈、boot'),
 ('src/story3d.js','[GAMEPLAY][NPC] 劇本：第一／二天固定劇情、日程生成 populate/populateSchedule、路人、環境事件、talkCharacter、互動（商店／床／書桌）'),
 ('src/chars3d.js','[PLACEHOLDER] 已淘汰的 Q 版人物（未載入，供對照）'),
 ('tools/undraco.js','[ASSET] Draco glTF → GLB 離線解碼'),
 ('tools/cut_portraits.py','[ASSET][CHARACTER] 使用者五人合圖 → 五張透明背景立繪（flood fill 去背、每列分界、去鄰人碎片）'),
 ('tools/gen_portrait_manifest.py','[ASSET][UI] 掃描 assets/portraits 產生 PORTRAIT_FILES manifest（build 自動執行）'),
 ('tools/shrink_vrm.py','[ASSET] VRM 貼圖縮小／移除縮圖'),
 ('tools/recolor_player_vrm.py','[ASSET][CHARACTER] Seed-san 服裝貼圖改色（玩家模型）'),
 ('tests/p0_movement.py','[CONFIG][GAMEPLAY] P0 回歸：8 個出生點手機搖桿移動、點地面、事件鎖定／解鎖、save→reload'),
 ('tests/movement_regression.py','[CONFIG][GAMEPLAY] MOVEMENT REGRESSION A–E（宿舍／互動／ADV／存檔／各區域），斷言 world position'),
 ('src/data/portrait_manifest.js','[UI][ASSET] 自動產生：實際存在的立繪檔案'),
 ('docs/MISSING_EXTERNAL_ART.md','[CONFIG][CHARACTER] 尚未提供的正式美術清單（tier、路徑）'),
 ('tools/make_review_zip.py','[CONFIG] 本索引與 zip 產生器'),
 ('play.py','[CONFIG] Playwright 自動遊玩測試腳本'),
 ('shot3d.py','[CONFIG] Playwright 截圖腳本'),
 ('test3d.html','[CONFIG] 3D 最小測試頁'),('test_char.html','[PLACEHOLDER] 舊 Q 版人物測試頁'),('test_people.html','[PLACEHOLDER] 程序化人物 lineup/faces 測試頁'),('test_glb.html','[CHARACTER] GLB 重定向早期實驗頁'),('test_rpm.html','[CHARACTER] RPM＋Mixamo 重定向驗證頁'),('test_assets.html','[ASSET] 資產層測試頁'),('test_world.html','[ENVIRONMENT] 區域渲染測試頁'),
 ('docs/REVIEW_README.md','[CONFIG] Review 說明 A–T'),('docs/REVIEW_NOTES.md','[CONFIG] 10 個技術疑慮'),('docs/STORY_EVENT_SCHEMA.md','[GAMEPLAY] 事件 schema'),('docs/CHARACTER_SCHEMA.md','[NPC] 人物／關係／記憶／研究所 schema'),('docs/ADV_SYSTEM.md','[UI] ADV 系統說明'),('docs/CHARACTER_ART_SPEC.md','[CHARACTER] 正式 2D 美術規格與五女主 Character Bible'),
]
TAGMAP=dict(TAGS)
def tag_for(rel):
    if rel in TAGMAP: return TAGMAP[rel]
    if rel.startswith('assets/models/env/'): return '[ASSET] CC0 環境模型（市場：market.pmnd.rs；見 LICENSES.md）'
    if rel.startswith('assets/models/char/'): return '[ASSET][CHARACTER] 玩家 VRM（Seed-san 改）／TEMP_PLAYER_DEV_MODEL GLB／Mixamo 動畫骨架／小安 VRM（見 LICENSES.md）'
    if rel.startswith('assets/portraits/'): return '[ASSET][CHARACTER] 正式 2D 立繪（使用者提供合圖切出；production）'
    if rel.startswith('docs/'): return '[CONFIG] 文件'
    if rel.startswith('screenshots/'): return '[CONFIG] 交付截圖（Playwright/SwiftShader 844×390；非真機）'
    if rel=='REVIEW_FILE_INDEX.txt': return '[CONFIG] 本索引'
    return '[CONFIG] 其他'
def collect():
    out=[]
    for p in sorted(ROOT.rglob('*')):
        if p.is_dir(): continue
        rel=p.relative_to(ROOT).as_posix()
        parts=rel.split('/')
        if parts[0] in EXCLUDE_DIRS: continue
        if rel in EXCLUDE_FILES: continue
        if rel.endswith('.zip') or rel.endswith('.pyc'): continue
        out.append(rel)
    return out
def main():
    files=collect()
    src=[f for f in files if f.endswith(('.js','.py','.html','.css'))]
    bins=[f for f in files if f.endswith(('.glb','.vrm','.png','.jpg','.webp'))]
    lines=['法條之外 SOURCE REVIEW — FILE INDEX','產生時間：'+datetime.datetime.now().strftime('%Y-%m-%d %H:%M'),'標籤：[CORE][GAMEPLAY][RENDERING][CHARACTER][ENVIRONMENT][NPC][LEGAL][SAVE][UI][ASSET][PLACEHOLDER][CONFIG]','']
    for f in files:
        size=(ROOT/f).stat().st_size
        lines.append(f'{f:48s} {size//1024:6d} KB  {tag_for(f)}')
    lines.append(''); lines.append(f'檔案總數 {len(files)}；source files（js/py/html/css）{len(src)}；binary assets {len(bins)}')
    (ROOT/'REVIEW_FILE_INDEX.txt').write_text('\n'.join(lines),encoding='utf-8')
    files=collect()
    name='法條之外_SOURCE_REVIEW_'+datetime.datetime.now().strftime('%Y%m%d_%H%M')+'.zip'
    outp=ROOT.parent/name
    with zipfile.ZipFile(outp,'w',zipfile.ZIP_DEFLATED) as z:
        for f in files: z.write(ROOT/f,'fatiao3d/'+f)
    print(name, outp.stat().st_size//1024,'KB', 'files',len(files),'src',len(src),'bin',len(bins))
if __name__=='__main__': main()
