# GG_ext_nav2／glb2 剩下的項目（LAWWW 11-04 04:33，CC 在 23eaaa7ae 跑的）

GLB（assets/models/env/second_ai/gongguan_shops.glb／.json／.props.json）＋ `gg_prop_blocks.patch`（src/zones3d.js 一行，接 23eaaa7ae）。

## 1. 頁間書屋門口 (−36.4,21) 站不住 → FIXED（改模型，不改測試）
- 原因：頁間的蕨類盆栽（ggpot，本地 x −3.85 → 世界 −37.17）壓到門的左緣。門是本地 −5.15～−4.05，世界 −36.95～−35.85。
  propBlocks 加 0.25 m 以後，門口那一點站不住。
- 改法：wz_street.py 的 G02 蕨類盆栽 −3.85 → −2.2，搬到立牌（gg_aboard，世界 −38.32～−37.68）的另一邊。新範圍 −39.2～−38.35，和立牌不重疊。
  GG_PROP_BLOCKS 那一格 [−37.17,21.71,0.8,0.64] → [−38.78,21.7,0.85,0.79]。
- Node（加上 GG_PROP_BLOCKS＋pad 0.25）：
  - 頁間門口改之前 false、改之後 true；
  - 青木、燒臘、便利商店門口都是 true；
  - 騎樓 z 20.5 從 x −66 到 64，每 0.25 m 都站得住（0 個站不住）。
- street_props_nav、bike_park_1104、spawn_exit ALL PASS。

## 2. 光暈 11:00 也在畫 → FIXED
- 原因：公館八間新店面（gg_front）的騎樓燈光暈 gg_xs_lamp 有 8 個寫了 day 0.1。wzGlowBatch 只要有一個光暈白天大於 0.02，白天就整個網格都畫。
  這和窗卡無關：637ee6982 的 GLB 就已經是這樣。
- 改法：wz_shopkit.py 的 gg_xs_lamp day 0.1 → 0（只有公館用到這個函式）。重建後 122 個光暈白天都是 0。

## 3. 沒有標記的群組：正式 50（空 39）vs nobldg 51（空 39）→ 還沒查到，要 PC 跑一行
Node 載不了 GLB，模擬不到。請 CC 在兩種網址（一般、?nobldg）各跑一次，把兩份清單貼回來：
```js
(()=>{ const z=GAME.E.zone, skip=new Set(GAME.E.lampGlows||[]); const shown=m=>{ for(let p=m;p&&p!==z.group;p=p.parent) if(!p.visible) return false; return true; }; return z.group.children.filter(o=>o.isGroup&&!(o.userData&&(o.userData.ggShop||o.userData.ggScooter||o.userData.ckTag||o.userData.ggMrt))&&!/_glb$|Fallback$/.test(o.name)&&o.name!=='gg_kit_scooters').map(o=>{ let v=false; o.traverse(m=>{ if(!v&&(m.isMesh||m.isSprite)&&!skip.has(m)&&shown(m)) v=true; }); return (o.name||'(無名)')+(v?'':'[空]')+'@'+o.position.x.toFixed(1)+','+o.position.z.toFixed(1); }); })()
```
我的推測（沒驗證）：
- 正式模式下，校門和捷運出口的套件有標記，不算；
- 公館遠景（gongguan_far）的 clone 沒有 _glb 名字，會被算成一個看得到的群組；
- 所以一般網址是 +1，?nobldg 是 +2，差 1。
如果是這樣，就是測試本來的數法有問題，不是藏錯東西。但要看清單才能確定，看到之前不改測試。

## 數字
GLB：primitive、材質、三角形不變（105,166／118,630）。光暈 122（白天大於 0 的從 8 變 0）。窗卡貼圖照 2562ae996（v3）。
