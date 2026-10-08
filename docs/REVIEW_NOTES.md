# REVIEW_NOTES — 目前最不滿意／最擔心的 10 個技術問題

1. **人物資產大多仍是 placeholder**。兩條 pipeline 都已驗證：rigged GLB（RPM 範例＋Mixamo 重定向 v2）給主角、VRM（three-vrm 自 TS 原始碼打包＋官方 Mixamo→humanoid 作法）給小安；但只有這兩個模型可用（環境無法下載其他人物），其他四位女主角與所有 NPC 仍是程序化人物。VRM 實例用 pool（預先 parse 2 個），同時出現超過 2 個同模型人物會退回 placeholder。要正式解決需要外部提供依 Character Bible 製作的 VRM。
2. **三種人物來源並存**（legacy `spawnNPC`、`spawnCharacter`、extras）與 id 別名（an↔heroine_01 等）。第一、二天劇情是程式碼，之後的人物是資料驅動；同一人（小安）在兩個系統裡的日程與狀態可能不一致。應把 legacy 劇情改寫成事件資料並移除別名。
3. **draw call 與三角形數**：人物每個約 40 mesh（無 skinning，層級合併只能合併髮型），教室同畫面 12 人≈ 500 draw call；low-poly-tree 9.4k 三角形一棵（已限 14 棵）。真機（尤其中階 Android）表現未知，只在 SwiftShader 測過。
4. **靜態網格合併是「建立區域時」做的**，之後所有合併物件不能單獨移動或隱藏（例如想拿走一張長椅）；也讓 frustum culling 失效（合併後 bounding sphere 很大）。
5. **事件引擎的 `auto` 觸發**用每 0.5 秒輪詢＋機率/60 的近似，不是真正的「每分鐘機率」；沒有事件優先權排程（多個 auto 事件同時符合時取第一個）。
6. **存檔把整個 G 序列化**（含 notes、memo、事件 done、legal log、social mem），沒有大小上限管理；長期遊玩後匯出文字會很長。也沒有存檔內容的完整 schema 驗證（只驗證版本與幾個欄位）。
7. **ADV 與 3D 的耦合**：ADV.begin 是在劇本／事件中手動呼叫，且 `GM.say` 透過全域 `ADV.active` 判斷是否更新立繪；freeze 背景直接沿用當下 cinematic 鏡頭，效果不穩定。應改成事件層統一決定「這段對話的演出模式」。
8. **hard-coded 內容仍多**：zones3d.js 每個區域是命令式建置程式（座標寫死）、story3d.js 的 populate 也有大量寫死座標；法律題目的誤解標籤是程式端分配（非使用者審核）；SMALLTALK 是陣列而非事件。
9. **手機控制只在 Playwright 觸控模擬驗證**：真機的 pointer capture、雙指縮放與瀏覽器手勢衝突（iOS Safari 的 pinch-zoom、地址列高度變化、safe-area）都可能有問題。
10. **重複程式碼**：路燈光暈、鏡頭碰撞盒、座位互動在三個戶外區域各寫一遍；legacy talkX 函式與 talkCharacter 邏輯重疊；ADV 表情對照表在兩處（events3d、game3d）。

11. **重定向 v2 只驗證了一個目標骨架（RPM 範例）**：`CHAIN_CHILD` 表假設 Mixamo 命名；最小旋轉 A 對「骨頭方向相同但 roll 不同」的骨架（例如某些 VRM）可能給出錯誤的手腕扭轉；Hips 只轉移 Y 位移（原地走路，位移交給引擎）。
12. **NPC 配對是 populate 時一次決定的**：進入區域那一刻誰有空就配誰，之後不會重新配對或解散；同一區停留很久時兩人會一直聊。

13. **導航格與世界幾何是兩套手寫資料**：這次 P0（法學院區在格外、店門口在 blockOutside 外、起身點貼桌）都是同一類錯：座標寫在 zones3d，格子範圍另外寫，沒有從幾何自動產生。已加 `E.unstick`（出生點修正）與「卡在阻擋格時允許不變糟的移動」兜底，但正解是從 collider 自動 bake 導航格，或至少在 build 時跑 `tests/p0_movement.py` 那種出生點掃描。
14. **立繪切圖是半自動**：`tools/cut_portraits.py` 對這張合圖調過參數（語彤｜子晴分界手動固定 688）；換一張新合圖不保證直接可用。正式流程應該是單人透明背景圖。

另外：題庫檔在 Q085 截斷（實際 84 題）；`fps` 顯示在 SwiftShader 下無意義；`three.jsm.bundle.js` 含未使用的 BufferGeometryUtils。
