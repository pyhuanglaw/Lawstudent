# AA_161 自由出行第一批四個景點（AA-B 2026-10-16）。執行：python3 build_spots.py → spots_v1.json
# 互動點 id 和約會系統相同（date_system/lines/Dxx.json、Dxx_coords.json），座標直接重用。
# 文字只有祐廷一個人；店名照 D77 不寫真的。時間是分鐘，錢是元（祐廷自己的）。
import json

SUNSET = {1: 17.5, 2: 17.83, 3: 18.08, 4: 18.25, 5: 18.5, 6: 18.75, 7: 18.75, 8: 18.5, 9: 18.0, 10: 17.58, 11: 17.25, 12: 17.17}  # 臺北大約的日落時刻（時）

SPOTS = [
 dict(id='D04', name='西門町', bg='d04_base_night', open=[17, 23], closedWd=[], weather='indoor',
      transit=dict(mode='mrt', line='捷運松山新店線', to='西門', minutes=15, fareRound=50),
      arrive=['西門站六號出口。人一下子變多了，空氣裡有炸物和香水的味道。',
              '又是六號出口。這次你知道往哪邊走。',
              '西門町。人永遠比你想的多。'],
      walk=dict(point='D04.street', label='在徒步區走走', minutes=30, cost=0, times=2, lines=[
              '街頭藝人在唱一首你高中聽過的歌。圍觀的人比你想的少，你多站了一下。',
              '一家店門口排了三十個人。你看了一眼招牌，決定不知道它在賣什麼也沒關係。',
              '古著店、刺青店、拍貼機。你走過去，像在看一個和法學院完全不同的世界。',
              '有人在發傳單。你接了一張，上面寫「國考衝刺班，試聽一個月」。你把它摺起來放進口袋。']),
      points=[
        dict(id='D04.lobby', label='看一場電影', minutes=120, cost=300, kind='fixed', lines=[
              '你隨便挑了一部剛好要開演的片。散場時，大廳的燈很亮，你還沒從最後一個鏡頭走出來。',
              '這次是一部外國的法庭片。律師轉身面對陪審團的時候，你在心裡更正了一句：台灣是國民法官，和法官一起評議的。',
              '散場的人潮把你推到電扶梯口。你發現自己記得的，是配角說的一句話。']),
        dict(id='D04.redhouse', label='西門紅樓', minutes=20, cost=0, lines=[
              '紅磚的八角樓。廣場上有人在拍婚紗，攝影師一直叫新郎「放鬆」。',
              '紅樓前的廣場。今天沒有婚紗，只有一個小孩在追鴿子。']),
        dict(id='D04.snack', label='吃一碗老店的麵線', minutes=30, cost=90, lines=[
              '一碗麵線，站在騎樓下吃。老闆一天大概要說一千次「要不要加辣」。',
              '同一家。老闆沒有認出你，這很正常。你還是說了「加一點辣」。']),
      ],
      leave='回程的捷運上，你身上還有一點炸物的味道。'),

 dict(id='D06', name='臺北市立美術館', bg='d06_base_day', open=[9.5, 17.5], closedWd=[1], weather='indoor',
      transit=dict(mode='mrt', line='捷運（中正紀念堂轉淡水信義線）', to='圓山', minutes=30, fareRound=60),
      arrive=['圓山站走過來。白色的方盒子建築，很多玻璃，很多光。',
              '北美館。你記得第一次來，在門口站了很久，找不到買票的地方。',
              '北美館。這裡安靜的方式，和總圖不一樣。'],
      walk=dict(point='D06.lawn', label='到館外的草地走走', minutes=30, cost=0, times=2, lines=[
              '館外的草地，有人在野餐，有人對著玻璃練習跳舞的動作。',
              '美術館旁邊就是公園。你繞了一圈，發現自己在想的還是下週的報告。',
              '一隻狗叼著飛盤跑過你面前，主人在後面喊牠的名字。牠沒有理。']),
      points=[
        dict(id='D06.gallery', label='看展', minutes=60, cost=30, kind='fixed', lines=[
              '這一檔是一位攝影師的回顧展。黑白的照片，很多是在法院門口拍的：等著宣判的人，表情都很像。',
              '換檔了。整個房間的布從天花板垂下來，你在中間站了五分鐘，說不出它在說什麼，但覺得好像懂了。',
              '你這次看得很慢。說明牌上的字，你一個一個讀完。']),
        dict(id='D06.frame', label='那件只有空畫框的作品', minutes=15, cost=0, lines=[
              '牆上只掛了一個空畫框。說明牌寫：「框裡是什麼，由你決定。」你想到民法第一條：法律沒有規定的，依習慣；沒有習慣的，依法理。',
              '空畫框還在。今天你覺得，裡面就是空的。這樣也可以。']),
        dict(id='D06.cafe', label='館內的咖啡廳坐一下', minutes=30, cost=150, lines=[
              '窗外是草地。你點了一杯比平常貴的拿鐵，坐到它變涼。',
              '同一個靠窗的位子。這次你帶了書，一頁也沒翻。']),
      ],
      leave='走出美術館，外面的聲音一下子全部回來。'),

 dict(id='D12', name='大稻埕碼頭與迪化街', bg='d12_base_sunset', open=[15, 20], closedWd=[], weather='outdoor',
      transit=dict(mode='mrt', line='捷運松山新店線', to='北門', minutes=30, fareRound=60),
      arrive=['從捷運站走過來，房子慢慢變矮，騎樓慢慢變深。',
              '大稻埕。你已經知道哪一條巷子會通到河邊。',
              '大稻埕。這裡的時間好像走得比較慢。'],
      walk=dict(point='D12.street', label='沿著迪化街走', minutes=30, cost=0, times=2, lines=[
              '南北貨一袋一袋堆到騎樓：乾香菇、干貝、紅棗。空氣是鹹的。',
              '一棟老洋樓，二樓的窗框漆成綠色。一樓改成了賣布的小店。',
              '一間老藥行，櫃台後面的抽屜一格一格，寫著你一個也不認得的藥名。'],
              rain='雨打在騎樓的鐵皮上。整條街的人都擠在騎樓下面，走得很慢，沒有人在趕。'),
      points=[
        dict(id='D12.tea', label='老茶行', minutes=30, cost=120, lines=[
              '一間老茶行，老闆請你試喝。「年輕人喝茶，不要急。」你喝了三杯，買了一小包。',
              '老闆說：「上次那款，喝得習慣嗎？」你不確定他是不是對每個人都這樣說。']),
        dict(id='D12.pier', label='大稻埕碼頭', minutes=20, cost=0, outdoor=True, lines=[
              '碼頭邊有貨櫃改成的攤位。河對岸是三重，風很大。',
              '你靠在欄杆上，看一艘船慢慢開走。']),
        dict(id='D12.sunset', label='在河邊看夕陽', minutes=30, cost=0, outdoor=True, sunset=True, lines=[
              '太陽落到對岸的橋後面，整條河變成橘色。你沒有拍照，只是看著。',
              '又是夕陽。你發現自己每次都停在差不多的位置。']),
      ],
      leave='回去的捷運上，你身上有一點茶的味道。'),

 dict(id='D13', name='淡水金色水岸', bg='d13_base_sunset', open=[15, 20], closedWd=[], weather='outdoor',
      transit=dict(mode='mrt', line='捷運淡水信義線（中正紀念堂轉車）', to='淡水', minutes=55, fareRound=100),
      arrive=['淡水站，終點站。坐了快一個小時，一出站就是河的味道。',
              '淡水。這次你記得要坐靠窗的位子。',
              '淡水。捷運的最後一站，好像真的到了一個地方的盡頭。'],
      walk=dict(point=None, label='沿著水岸走', minutes=30, cost=0, times=2, lines=[
              '步道的一邊是河，一邊是一整排小吃攤。每一攤都說自己是老店。',
              '有人在河邊釣魚，水桶裡什麼都沒有，他看起來一點也不在意。',
              '一群高中生在搶一包炸物，笑得很大聲。你想起自己高三那年，好像也是這樣。'],
              rain='雨下在河面上，一圈一圈。步道上只剩撐傘的人和不撐傘的狗。'),
      points=[
        dict(id='D13.drink', label='飲料攤', minutes=15, cost=60, lines=[
              '一杯古早味紅茶。比公館的甜。',
              '同一攤。你這次點了無糖，老闆看了你一眼。']),
        dict(id='D13.rail', label='靠在河邊的欄杆', minutes=20, cost=0, outdoor=True, lines=[
              '對岸是觀音山。山的形狀，真的像一個躺著的人。',
              '你又看了一次觀音山。今天覺得它像一個在睡午覺的人。']),
        dict(id='D13.bench', label='坐在長椅上', minutes=20, cost=0, lines=[
              '旁邊的阿伯在聽收音機，播的是一首很老的歌。你聽完了整首。',
              '同一張長椅。今天沒有阿伯，你有點想念那首歌。']),
        dict(id='D13.photo', label='在拍照的位置看夕陽', minutes=20, cost=0, outdoor=True, sunset=True, photo=True, lines=[
              '夕陽落到觀音山旁邊。你拍了一張，照片的顏色沒有眼睛看到的好。',
              '你又拍了一張，和上次那張幾乎一樣。你還是存起來了。']),
      ],
      leave='回程的捷運很長。你差點睡過頭，醒來剛好到中正紀念堂，要換車。'),
]

RULES = dict(
  _comment='AA_161 自由出行第一批（AA-B 2026-10-16）。規格在 AA_160 第 4 節；這份是內容。',
  pointOnce='每個互動點一趟做一次；散步（walk）一趟最多 times 次。做過的灰掉。',
  lineIndex='lines[i]：i＝這個玩家第幾次來這個地方（G.places.free 的次數，0 起算），超過的用最後一句。散步的 lines 是池：同一趟不重複，照順序輪。',
  arriveIndex='arrive[0] 第一次、arrive[1] 第二次、arrive[2] 第三次以後。',
  sunset='sunset:true 的互動點只在（當月日落 − 40 分）到（日落 + 10 分）之間能選；其他時間灰掉寫「還沒到夕陽的時間」或「太陽已經下山了」。SUNSET 表是臺北大約的日落時刻（時，小數）。',
  rain='下雨（G.weather 是 rain）時，outdoor:true 的互動點灰掉寫「下雨」；散步改用 rain 那一句（有的話）。室內的地點不受影響。',
  photo='拍照：沒有 photo 互動點的地點，選單另外有「拍一張照」（0 分鐘），一趟一張，存相簿（AA_128 的 Life Album）。D13 的 photo 互動點本身就是拍照。',
  fixed="kind:'fixed' 的互動點（看電影、看展）在選單上寫時間和票價；做完以後時間照 minutes 推進。",
  money='錢不夠的互動點灰掉寫「錢不夠」。車資來回 fareRound，去程、回程各扣一半。',
  sunsetTable=SUNSET)

json.dump(dict(rules=RULES, spots=SPOTS), open('spots_v1.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
n = sum(len(s['points']) for s in SPOTS)
print('ok', len(SPOTS), 'spots', n, 'points')
