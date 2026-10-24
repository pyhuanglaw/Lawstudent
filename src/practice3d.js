/* 大四下法律實習：每週一句旁白（AA_441，企劃線 70d31d938；法扶・臺北的辦公室，韓律師）——classes3d.js 的 S.goOffsite 走 CLS.OFFSITE_LINES（一天一句）。
   - 第一次出席那天用第 1 週那一句（出席前 R.attend.legal_practice 是 0）；暑假去過 C16（INTERN_LEGALAID）換另一句。
   - 租屋的大姊：第 5 週（3/20）記 LP_RENT_SEEN；第 6 週（3/27）、第 12 週（5/8）照有沒有這個旗標分 A／B（第 6 週 B 也記）。
   - 3/13 那一句照舊（twfill3d.js 的 TWFILL_LINES.practice0313，AA_342 4-2）。BB_102 的隨機句池（legal_practice.lines）不用。
   - 4/24 21:00 麵店團：阿哲、柏翰各一句（照認不認識；兩位都不認識不發；沒有選項）。
   交換延畢的玩家在大五上實習（r2y4b3d.js S.INTERN），不在這裡。測試：node tests/aa441_practice_unit.js */
const PRACTICE=(function(){
  const S={};
  S.SRC='AA_441@70d31d938';
  S.FIRST='（實習的第一天。帶實習的韓律師三十出頭，先給你一張保密約定。簽完，你分到一張靠窗的桌子，桌上只有一支筆和一疊空白的諮詢單。）';
  S.FIRST_C16='（實習的第一天。櫃台後面那一整排檔案櫃還在。韓律師把保密約定推過來：「簽過了。再簽一次。」靠窗那張桌子上，放著一疊空白的諮詢單。）';
  S.DAYS={
    '2029-02-27':'（韓律師讓你坐在旁邊聽諮詢。一位阿伯帶了一整袋文件，從二十年前的收據開始講。韓律師一張一張看完，沒有催他。）',
    '2029-03-06':'（你寫的答辯狀草稿拿回來了。第一頁只剩兩行沒被劃掉，旁邊寫著：「第二版，禮拜五前。」）',
    '2029-03-20':'（今天的諮詢是一位租屋的大姊。房東把房子賣了，新屋主在門上貼了一張紙，叫她月底搬走。你想起大二債各講過的那一條。）',
    '2029-04-10':'（期中考那一週，實習照樣要去。午休的時候，你在會議室角落讀筆記。助理經過，把冷氣調小了一點。）',
    '2029-04-17':'（跟韓律師去地方法院開庭。你坐在旁聽席最後一排，看著你整理的那張時間表被交上去。）',
    '2029-04-24':'（一整天都在影印。卷宗疊起來比桌子還高。助理說，這個案子已經打了六年。）',
    '2029-05-15':'（你寫的存證信函，韓律師只改了一個字，簽了名，讓你拿去郵局寄。）',
    '2029-05-22':'（中午韓律師請大家吃便當，問你畢業以後要做什麼。你說了。韓律師點點頭，把自己便當裡的滷蛋夾給你。）',
    '2029-05-29':'（最後一次實習。靠窗那張桌子上，空白的諮詢單只剩兩張。韓律師在你的實習時數表上簽名：「禮拜六畢業典禮吧。恭喜。」）' };
  S.RENT={ '2029-03-27':{a:'（租屋的大姊帶著租約回來。韓律師讓你唸出租期那一行。她聽完，把租約折好，收進包包最裡面那一層。）',
                         b:'（一位租屋的大姊帶著租約來。房東把房子賣了，新屋主叫她月底搬走。韓律師讓你唸出租期那一行。她聽完，把租約折好，收進包包最裡面那一層。）',seeB:true},
           '2029-05-08':{a:'（租屋的大姊打電話來。韓律師聽了兩句，把話筒遞給你：新屋主答應讓她住到租約到期。她在電話那頭說了三次謝謝。）',
                         b:'（韓律師說，三月來諮詢的一位租屋的大姊打電話來了：新屋主答應讓她住到租約到期。）'} };
  S.GROUP={day:'2029-04-24',h:21,tag:'lp_noodle_0424',ms:[['zhe','今天影印了三百頁 手好痠'],['classmate_bohan','我的書狀改到第三版了。']]};
  const keyOf=d=>{ if(typeof CALENDAR==='undefined'||!CALENDAR.dateOf) return null; const q=CALENDAR.dateOf(d); return q&&q.key; };
  const D=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const knows=id=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(id,'FIRST_MET');
  /* 那一天的句子（goOffsite 叫，一天叫一次：租屋的旗標在這裡記）*/
  S.lineFor=function(G,it){ if(!it||!it.c||it.c.id!=='legal_practice') return null; const F=G.flags||(G.flags={});
    const R=typeof CLS!=='undefined'&&CLS.rec?CLS.rec(G):null; if(R&&!(R.attend&&R.attend.legal_practice)) return F.INTERN_LEGALAID?S.FIRST_C16:S.FIRST;   /* 第一次出席＝第 1 週那一句 */
    const k=keyOf(it.day); if(!k) return null;
    if(S.RENT[k]){ const r=S.RENT[k]; if(F.LP_RENT_SEEN) return r.a; if(r.seeB) F.LP_RENT_SEEN=true; return r.b; }
    if(k==='2029-03-20') F.LP_RENT_SEEN=true;
    return S.DAYS[k]||null; };
  S.phone=function(G){ const g=S.GROUP; if(typeof PHONE==='undefined'||PHONE.sent(G,g.tag)) return; const d=D(g.day); if(d==null||G.day<d||G.day>d+1) return;
    if(!(PHONE.inGroup&&PHONE.inGroup(G,'noodle_team'))) return; const M=g.ms.filter(([id])=>knows(id)).map(([from,text])=>({th:'g:noodle_team',from,text})); if(!M.length) return;
    PHONE.at(G,d,g.h,M,g.tag); };
  if(typeof CLS!=='undefined'&&Array.isArray(CLS.OFFSITE_LINES)&&!CLS._practice){ CLS.OFFSITE_LINES.push((G,it)=>S.lineFor(G,it)); CLS._practice=true; }
  if(typeof STORY!=='undefined'&&Array.isArray(STORY.PHONE_RULES)&&!STORY._practice){ STORY.PHONE_RULES.push(G=>S.phone(G)); STORY._practice=true; }
  return S;
})();
if(typeof window!=='undefined') window.PRACTICE=PRACTICE;
