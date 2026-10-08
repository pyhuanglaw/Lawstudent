/* ===== 02 人物：固定 NPC、隱藏人生軌跡、記憶旗標 ===== */
const NPCS = {
  an:{ id:'an', name:'小安', full:'安佳蓉', role:'同學', hair:'#2B2118', hairStyle:2, top:'#4A6C8C', skin:'#F3D2B6',
    bio:'認真、講話直接，大一就決定要考司法官。', goal:'judicial' },
  zhe:{ id:'zhe', name:'阿哲', full:'林柏哲', role:'同學', hair:'#3A2A1A', hairStyle:1, top:'#C9A24F', skin:'#E9C4A2',
    bio:'社團咖，看起來什麼都不在意，其實家裡的事很多。', goal:'undecided' },
  sis:{ id:'sis', name:'溫學姊', full:'溫語珊', role:'大三學姊', hair:'#1F1710', hairStyle:2, top:'#2F5D50', skin:'#F0D0B4',
    bio:'嚴格，但願意教人。筆記做得很漂亮，借了要記得還。', goal:'lawyer' },
  kai:{ id:'kai', name:'阿凱', full:'許家凱', role:'室友（資工系）', hair:'#2B2118', hairStyle:3, top:'#7B6A5A', skin:'#E9C4A2',
    bio:'半夜三點還在寫程式，覺得法律系的書都長得一樣。', goal:'startup' },
  yu:{ id:'yu', name:'小語', full:'周子語', role:'外文系', hair:'#4B2E1E', hairStyle:2, top:'#7A2E3B', skin:'#F5DCC4',
    bio:'在社團認識的，聽你講法律會認真問「所以那是合法的嗎？」', goal:'abroad' },
  mom:{ id:'mom', name:'媽媽', full:'媽媽', role:'家人', hair:'#3A2A1A', hairStyle:2, top:'#8B5E3C', skin:'#F0D0B4',
    bio:'很熱心，不太懂法律職涯，但每次都會問「以後是要當律師還是法官」。', goal:'' },
  cat:{ id:'cat', name:'阿判', full:'阿判', role:'早餐店的貓', hair:'#7B6A5A', hairStyle:0, top:'#7B6A5A', skin:'#7B6A5A',
    bio:'圖書館旁早餐店的店貓，會坐在你書上。', goal:'' , cat:true },
  // 職涯後才出現
  boss:{ id:'boss', name:'高律師', full:'高承翰', role:'指導律師', hair:'#2B2118', hairStyle:1, top:'#1E4038', skin:'#E9C4A2', bio:'話少，改狀很兇，但從不遲到。', later:true },
  clerk:{ id:'clerk', name:'小方', full:'方書記官', role:'書記官', hair:'#3A2A1A', hairStyle:2, top:'#4A6C8C', skin:'#F3D2B6', bio:'庭期、卷宗、報結，什麼都知道。', later:true },
  chief:{ id:'chief', name:'庭長', full:'庭長', role:'庭長', hair:'#7B6A5A', hairStyle:1, top:'#2B2118', skin:'#E9C4A2', bio:'講話慢，但案件量的數字記得很清楚。', later:true },
  cop:{ id:'cop', name:'阿豪', full:'蔡警官', role:'偵查佐', hair:'#2B2118', hairStyle:3, top:'#3E5A48', skin:'#D9B48E', bio:'辦案很拚，有時候太拚。', later:true },
  sales:{ id:'sales', name:'Kevin', full:'業務 Kevin', role:'業務部', hair:'#3A2A1A', hairStyle:1, top:'#C9A24F', skin:'#E9C4A2', bio:'每一份合約都「很簡單，請法務快速看一下」。', later:true },
  mgr:{ id:'mgr', name:'王經理', full:'王經理', role:'主管', hair:'#2B2118', hairStyle:2, top:'#7A2E3B', skin:'#F0D0B4', bio:'以前都這樣做。', later:true },
};
const MAIN_NPCS = ['an','zhe','sis','kai','yu','mom','cat'];

// NPC 人生軌跡：依（學年,學期）或職涯年份更新；某些分支看玩家旗標
// stage 用來描述近況；scene 用來顯示重逢時的敘述
function npcLifeUpdate(id){
  const n=G.npcs[id]; if(!n) return;
  const y=G.time.year, s=G.time.sem, inCareer=G.phase==='career'||G.phase==='bar', cy=G.careerYears||0;
  const F=k=>!!G.flags[k];
  const set=(stage, news)=>{ if(n.stage!==stage){ n.stage=stage; n.news=news; n.newsFresh=true; } };
  if(id==='an'){
    if(!inCareer){
      if(y===1) set('大一，已經決定要考司法官','她已經去問過補習班了。');
      else if(y===2) set('大二，開始有系統地做筆記','她的筆記開始有目錄。');
      else if(y===3) set('大三，每天固定在圖書館同一個位子','大家都知道那是她的位子。');
      else set('大四，全職備考模式','她說：「我不是不理你，我是在讀刑訴。」');
    } else {
      if(cy<=1) set('畢業後全職準備司法官','一試過了，二試差一點。');
      else if(cy<=2) set('第二年，司法官二試通過','她說她哭了十分鐘，然後去買了一杯珍奶。');
      else if(cy<=4) set('司法官學院受訓中','她說訓練比考試累。');
      else if(cy<=7) set(F('an_pros')?'分發到地檢署當檢察官':'分發到地方法院當法官','她的辦公室有你們大一合照。');
      else set(F('an_pros')?'資深檢察官，帶新人':'法官，開始參與合議庭','她在同學會說：「大家不要再問我案子了。」');
    }
  }
  if(id==='zhe'){
    if(!inCareer){
      if(y===1) set('大一，社團活動比課還多','他說：「大一不玩什麼時候玩？」');
      else if(y===2) set('大二，學分岌岌可危',F('help_zhe')?'他說多虧你借他筆記，不然真的要重修。':'他重修了一科。');
      else if(y===3) set('大三，開始去事務所打工','他說事務所的影印機比圖書館的好用。');
      else set('大四，猶豫要不要考國考','「大家都在考，我不考好像很奇怪。」');
    } else {
      if(cy<=1) set('畢業後邊工作邊準備律師考試','在一間小事務所當助理。');
      else if(cy<=2) set(F('help_zhe')?'第二年考上律師':'律師考試落榜，決定不考了',F('help_zhe')?'他傳訊息：「欸，我考上了，你請客。」':'他說：「我覺得我不適合考試，但我適合工作。」');
      else if(cy<=5) set(F('help_zhe')?'受僱律師，做商務案':'進了一間科技公司當法務','他說他終於知道什麼叫「業務說很簡單」。');
      else set(F('help_zhe')?'資深律師，考慮跟人合開事務所':'法務主管，帶三個人','他在同學會上第一個到，最後一個走。');
    }
  }
  if(id==='sis'){
    if(!inCareer){
      if(y===1) set('大三，系上的筆記女王','她在圖書館的位子永遠有一杯冰美式。');
      else if(y===2) set('大四，全職準備律師考試','她開始不回訊息，然後在半夜回一長串。');
      else if(y===3) set('畢業，律師考試通過','她說：「終於可以把那些書賣掉了。」然後沒賣。');
      else set('律師職前訓練與實習中','她說實習律師的工作是「把所有東西都做一遍」。');
    } else {
      if(cy<=2) set('受僱律師，訴訟組','她的開庭筆記跟大學筆記一樣整齊。');
      else if(cy<=5) set('資深律師，開始帶新人',F('sis_trust')?'她說有機會會拉你一把。':'她偶爾會在臉書上發開庭心得。');
      else set(F('sis_trust')?'成為事務所合夥人':'和朋友合開了一間小事務所','她的名片終於印上了自己的名字。');
    }
  }
  if(id==='kai'){
    if(!inCareer){
      if(y<=2) set('資工系，每天寫程式到凌晨','他說法律系的書都長得一樣。');
      else set('大三大四，在新創公司實習','他開始問你「合約這樣寫可以嗎」。');
    } else {
      if(cy<=2) set('和朋友創業，做一個 App','他說法務他們「先用範本」。');
      else if(cy<=5) set('公司拿到投資，開始找法務','他問你認不認識可以看合約的人。');
      else set('公司被併購，開始新的計畫','他還是每天凌晨三點傳訊息。');
    }
  }
  if(id==='yu'){
    if(!n.met) return;
    if(!inCareer){
      if(y<=2) set('外文系，忙社團和翻譯打工','她說你講話越來越像課本。');
      else set('大三大四，準備出國念研究所','她問你要不要一起去。');
    } else {
      if(cy<=2) set(F('yu_partner')?'在國外念書，遠距中':'在國外念研究所','她的時差跟你的加班剛好錯開。');
      else set(F('yu_partner')?'回台灣，在出版社工作':'留在國外工作','她偶爾傳一張很好看的街景給你。');
    }
  }
  if(id==='mom'){
    if(!inCareer) set('每週打一次電話','「有沒有好好吃飯？」');
    else if(cy<=3) set('會跟親戚說你在做什麼','親戚聽到「法律」，又拿出土地資料。');
    else set('開始問你要不要買房子','「你們這一行很穩定吧？」');
  }
  if(id==='cat'){
    if(!inCareer) set('每天坐在早餐店門口','牠對你的書沒有興趣，但對你的書袋有。');
    else set('早餐店還在，牠變胖了','你回母校時特地去看牠，牠沒認出你。');
  }
}

// 記憶旗標的說明（用於人生記憶面板與結局回顧）
const FLAG_TEXT = {
  study_with_an:'曾和小安一起準備考試',
  help_zhe:'在阿哲學分危機時借他筆記',
  refuse_zhe:'拒絕了阿哲的夜唱邀約（不只一次）',
  borrow_sis:'跟溫學姊借過筆記',
  sis_trust:'把補充過的筆記還給溫學姊，得到她的信任',
  midnight_notes:'期中考前，凌晨兩點和同學一起找那份筆記',
  footnote:'花兩小時研究第七頁的註腳',
  uncle_land:'親戚給你看過土地資料',
  quiz_good:'第一次民總小考表現不錯',
  quiz_bad:'第一次民總小考一團亂',
  mid_bad:'某次期中考失利',
  fin_great:'某門課期末表現很好',
  failed_course:'曾經被當，重修過',
  yu_met:'在社團認識了小語',
  yu_partner:'和小語交往',
  yu_break:'和小語分開了',
  club_leader:'當過社團幹部',
  exch_applied:'申請過交換學生',
  exch_go:'去了交換',
  exch_skip:'放棄交換，留在台灣',
  exch_friend:'交換時交到一起吃飯的朋友',
  exch_speak:'第一次用外語完整講出自己的法律觀點',
  exch_broke:'交換時預算不足，開始自己煮',
  intern_firm:'大學時在事務所實習過',
  court_visit:'大學時常去法院旁聽',
  bar_fail:'國考落榜過',
  bar_pass:'國考通過',
  judicial_pass:'司法官考試通過',
  refuse_job:'拒絕過一個工作機會',
  conflict_boss:'和主管起過衝突',
  repair_zhe:'修復了和阿哲的關係',
  career_switch:'轉換過職涯',
  own_firm:'開了自己的事務所',
  partner:'成為事務所合夥人',
  legal_head:'成為法務主管',
  judge_panel:'參與合議庭審判',
  pros_chief:'擔任主任檢察官',
  kai_client:'阿凱的公司成為你的客戶或雇主',
  an_pros:'小安選了檢察官',
  helped_friend:'曾幫助一位朋友度過難關',
  rest_lots:'很懂得休息',
  overwork:'曾經連續高強度讀書到效率下降',
};
