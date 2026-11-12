# 新店參考圖（使用者 11-03 生成）

| 店 | 外觀 | 室內 | 可以開工？ |
|---|---|---|---|
| 好拍運動 | haopai_ext.webp | haopai_int.webp | 可以 |
| 大步球鞋 | dabu_ext.webp | dabu_int.webp | 可以 |
| 同弦樂器 | tongxian_ext.webp | tongxian_int.webp | 可以 |
| 山嵐書店 | shanlan_ext.webp | shanlan_int.webp | 可以 |
| 南洋戲院 | nanyang_ext.webp | nanyang_lobby.webp（大廳；影廳先用 2D） | 可以（大廳） |
| 新生運動廣場 | xinsheng_sports_ext.webp | xinsheng_sports_int.webp | 可以 |
| 大口漢堡 | dakou_ext.webp（夜） | dakou_2f.webp（二樓自習區；一樓照外觀圖看得到的櫃檯） | 可以 |
| 公館燒臘 | gongguan_shaola_ext.webp | gongguan_shaola_int.webp | 可以（改現有阿鳳麵店） |
| 新生南路街景＋首都帝大側門 | xinsheng_street_b.webp（**用 b**：巷口路牌是溫州街）；xinsheng_street_a.webp 只當參考（路牌寫成濟南路，不對） | — | 可以 |
| 木曜日、日常失速 | ../wz_cafes/*_v2.webp（外觀＋室內合成一張） | 同左 | 可以 |
| **日和便利店**（公館，取代日日便利；使用者 11-04 01:0x） | gongguan_cvs_ext.webp | gongguan_cvs_int.webp | 可以 |
| **慢輪單車**（公館，取代輪轉單車） | gongguan_bike_ext.webp | gongguan_bike_int.webp | 可以 |
| **青木茶室**（公館，取代清葉茶行；改成可以進去坐） | gongguan_tea_ext.webp | gongguan_tea_int.webp | 可以 |
| **頁間書屋**（公館，取代舊路書房） | gongguan_book_ext.webp | gongguan_book_int.webp | 可以 |
| **Afar café**（公館 G07，取代「咖啡・輕食」；第二批 AA_650） | gongguan_afar_ext.webp | gongguan_afar_int.webp | 可以 |
| **洋洋鹹酥雞**（公館 G05，取代「滷味・鹹酥雞」；第二批） | gongguan_yangyang_ext.webp | gongguan_yangyang_int.webp | 可以 |
| **轉角唱片**（公館 G12，取代「二手唱片」；第二批） | gongguan_corner_ext.webp | gongguan_corner_int.webp | 可以 |
| **daybreak**（公館 G14，取代「早午餐」；第二批） | gongguan_daybreak_ext.webp | gongguan_daybreak_int.webp | 可以 |
| **2:30 AM**（溫州街東端路口，取代兩點半 Café；溫州街第一批 AA_654） | wz_230am_ext.webp | wz_230am_int.webp | 定案（使用者 11-04 04:4x 授權四人自行決定） |
| **林家乾麵**（溫州街 A4，不改名） | wz_lin_ext.webp | wz_lin_int.webp | 定案（使用者 11-04 04:4x 授權四人自行決定） |
| **SUNNY SIDE**（溫州街 B7，取代半熟） | wz_sunnyside_ext.webp | wz_sunnyside_int.webp | 定案（使用者 11-04 04:4x 授權四人自行決定） |
| **阿德影印輸出**（溫州街 A1，不改名） | wz_ade_ext.webp | wz_ade_int.webp | 定案（使用者 11-04 04:4x 授權四人自行決定） |
| **小路**（溫州街 B3，取代巷子裡定食；居酒屋） | wz_komichi_ext.webp | wz_komichi_int.webp | 定案（使用者 11-04 04:4x 授權四人自行決定） |
| **一盞茶屋**（溫州街日式宿舍改的茶屋，不改名；使用者 11-04 05:0x「一盞內外部改成這樣 庭院要能走到」，AA_656） | wz_yizhan_ext.webp | wz_yizhan_int.webp | 開工 |

## 照圖做的時候要改的地方
- **大步球鞋**：圖上的鞋子有像真實品牌的勾勾標誌（內外都有），建模時**一律拿掉**，鞋側面用虛構的線條或不畫標誌（D77）。室內地板是中間色的木地板，D112 不要深色：照圖或再淺一點。
- **同弦樂器**：吉他外型可以照圖，琴頭不要有任何品牌字樣。
- **山嵐書店**：二樓有人坐在地板看書（floorSit）；樓梯是寬木樓梯，要真的走得上去。
- **南洋戲院**：海報上的片名是虛構的，可以照用（夏天的約定、霧裡的來信、轉角的青春、第七夜、夏日的風、河邊的約定、小站的…）。售票口時刻表寫 10:00／13:00／16:00／19:30，和 AA_615 寫的場次（12:00、15:00、18:30、21:30）不同：**照圖改，AA_615 跟著改**。
- 路牌都寫「新生南路」，照用。
- **新生運動廣場**：圖上的球衣印了「大同大學」「台北大學」「明志大學」，都是**真實學校，一律換掉**；「華江大學」「新生大學」也換。改成首都帝大的系隊（法律系、舊序章、電機系、土木系……），或不印校名只印背號（D77、D115）。
- **大口漢堡**：二樓牆上「2F 學生自習區、全區插座、免費 Wi-Fi」照用。桌上的書（民法總則、刑法、憲法）照用。
- **公館燒臘**：這是把現有的「阿鳳麵店」改成燒臘店（AA_612 A 表），座標、門口不動；門牌「羅斯福路四段 316」照用。
- **新生南路街景**：第二張的街口路牌寫「溫州街」才對。側門的門柱寫「首都帝大」照用。
- **公館四間新店（11-04）**：圖上的「臺灣大學」「臺大（公館校區）」旗子、路牌是**真實校名，一律換成「首都帝大」**（D115）；頁間書屋外觀的門牌「羅斯福路四段 136」照用；日和便利店的「營業時間 07:00～24:00」照用（遊戲裡的便利商店營業時間照這個改）；青木茶室外帶窗口「外帶點單」照用；慢輪單車的「維修價目表」照用（價錢以 AA_646 為準，價目表上的數字可以照圖）。地板都是淺色（D112）：便利店淺灰磁磚、慢輪淺灰水泥、青木和頁間淺色磨石子。
- **公館第二批（11-04 02:1x，AA_650）**：
  - **Afar café**（11-04 02:2x 使用者換了新版兩張，招牌、室內牆上、黑板、書封都寫「afar」，**照新版做**；舊版 Elsewhere 那兩張作廢，git 歷史還在）：招牌是深綠飾帶上的小寫「afar」；室內吧台後面是深綠牆加「afar」字；黑板「afar COFFEE MENU」照用（Espresso 100、Americano 110、Latte 140、Cappuccino 140、Mocha 160、Pour Over 170）。門牌「羅斯福路四段 106、108」照用。地板是淺灰磨石子（D112），深色胡桃木只用在家具。
  - **洋洋鹹酥雞**：招牌、店名照用。菜單用室內那一份（外面立牌的價錢不同，改成和室內一樣）。門牌「羅斯福路四段 136」和頁間書屋撞號，換一個號碼。地板淺灰磁磚。
  - **轉角唱片**：店名照用。營業時間照圖改成「週一～週日 12:00～21:00」（AA_650 原本寫週一公休，改掉）。「二手唱片 每張 150 元起」、海報「公館的風」「城市耳機」都照用。門牌「羅斯福路四段 92」照用。
  - **轉角唱片（室內）**：牆上的「轉角唱片 Corner Records」、海報「台北的午後」「公館聲響祭 Gongguan Sound Festival '02」「河岸音樂節 Riverside Music Festival 2000」（星際樂團、午後回聲、白色電車、南方早晨）都是虛構的，照用；分類牌（搖滾／Indie、民謠／Folk、電子／Electronic）照用；右邊是試聽區（耳機＋高腳椅）。地板淺灰磨石子。
  - **daybreak**：招牌「Daybreak」照用（遊戲裡寫 daybreak 或 Daybreak 都可以，照招牌用 **Daybreak**）。門牌又是「羅斯福路四段 136」，和頁間書屋、洋洋撞號，換號碼。黑板只有分類（Brunch、Plates、Sandwiches、Salads、Drinks、Sweets）沒有價錢，品項和價錢照 AA_650。地板淺色磨石子＋淺色磁磚，家具淺色木頭。
  - 外觀圖裡左右鄰居的招牌（文具・生活、公館麵館、公館書坊）不用照畫，鄰居照遊戲裡現在的店。
- **溫州街第一批（11-04 04:4x，AA_654）**：
  - 2:30 AM、小路的室內是中深色木地板，照 D112 改成淺色木地板。
  - 2:30 AM 外觀牌子寫的營業時間 21:00～02:30，要不要照用，等使用者決定。
  - 小路的清酒瓶、海報、木札菜單上的字都當成虛構的，照用。
  - 外觀圖的鄰居招牌不用照畫。

## 溫州街第二批（11-04，X214，已在遊戲裡）——11-10 BB 從 LAWWW2 分支複製
- 來源：claude/second-ai-env-art a118abd49 `docs/art-rebuild/second_ai/wip/wz_second_1104/ref/`
- wenzhou_books_ext（溫州書屋）、dida_tea_ext（帝大紅茶）、azhong_fruit_ext（阿忠水果）、changzai_laundry_ext（自助洗衣）、summer_ice_ext（夏日冰菓室）：都是外觀。
