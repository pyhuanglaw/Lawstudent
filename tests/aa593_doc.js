// AA_593 學姊改稿①b：手機與其他系統（企劃線 6cbb0b4ab；使用者 2026-11-02 19:xx 選擇題確認，第 10 節）的稿——給舊測試的「每一句都在稿裡」檢查用（同 tests/aa591_doc.js）：
//   被 AA_593 改過的句子不在原來的源稿裡（AA 沒有回頭改源稿），改成「在原稿裡，或在 AA_593 表的『改成』欄」。
//   has(t)：t 一字不差是 AA_593 某一列（只算這一次手抄檔真的換了的列，APPLIED）「改成」欄的整格（第 10 節使用者的選擇已經寫在那一欄），或 EXTRA。
//   MAP：原句 → 改成（只放 APPLIED、而且原句不是到處都有的短句；舊測試從原稿抄的句子換成 AA_593 的）；GONE：拿掉的句子。
//   沒換的列（產生檔等源稿、後來的稿已經改掉、和後來的稿衝突）不放進來：舊測試照原本的期待值（第 28、67～73、78、80、81、106、116 列等，見 tests/aa593_sis_1b_unit.js 開頭）。
const cp=require('child_process'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
const SHA='6cbb0b4ab', P='docs/story_planning/AA_593_學姊改稿_1b_手機與其他系統.md';
let DOC=''; try{ DOC=cp.execFileSync('git',['-C',ROOT,'show',SHA+':'+P],{encoding:'utf8',maxBuffer:64*1024*1024}); }catch(e){ DOC=''; }
/* 這一次手抄檔換了的列（src/ 直接改；產生檔 pg_dates、date_wish、solo_before、date_lines 的列等源稿重匯，不在這裡）*/
const APPLIED=new Set(['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','107','108','109','17','18','19','20','21','22','23','24','25','26','27',
  '29','30','31','32','33','34','35','36','112','新1','新3','50','51','52','53','54','55','56','57','58','59','60','61','62','63','64','74','75','76','77','79','99','100','101','102','103','104','105','114','115','117']);
/* 原句是到處都有的短句（別人也說、同一個人別的場也說）的列不放進 MAP：只換表上那一處，舊測試逐一改 */
const AMBIG=new Set(['3','9','11','16','63','102','108','114','117']);
/* 第 57 列：稿寫「半熟」，店名 11-04 起是 SUNNY SIDE（AA_655 第 1 節，f48b92738）——原句、改成都照現在的店名 */
const EXTRA={'週日九點，SUNNY SIDE。不要遲到。':'週日早上要不要去 SUNNY SIDE？九點。'};
const NEW=new Set(), MAP={}, GONE=new Set();
for(const line of DOC.split('\n')){
  const m=line.match(/^\|\s*([0-9]+|新[0-9]+)\s*\|(.*)$/); if(!m||!APPLIED.has(m[1])) continue;
  const c=m[2].split('|').map(s=>s.trim()); if(c.length<4) continue;
  const o=c[2].replace(/^`|`$/g,'').replace(/^「(.*)」$/,'$1'), v=c[3].replace(/^`|`$/g,'').replace(/^「(.*)」$/,'$1');   /* 有名字說的不加外面的「」（TEXT-QUOTE-UNIFY-1108）*/
  if(!v) continue;
  if(v.startsWith('（刪')){ if(o&&o!=='—') GONE.add(o); continue; }
  if(m[1]==='57') continue;
  NEW.add(v);
  if(/^[0-9]+$/.test(m[1])&&!AMBIG.has(m[1])&&o&&o!=='—'&&o!==v&&!(o in MAP)) MAP[o]=v;
}
for(const [o,v] of Object.entries(EXTRA)){ MAP[o]=v; NEW.add(v); }
/* 第 10 節使用者的選擇已經寫進表的「改成」欄（第 5、10、18、50、53、57、59、107 列等），不另外收第 10 節的引號：沒換的列（礁溪、pg_dates）的句子不會混進來 */
module.exports={SHA,P,DOC,APPLIED,NEW,MAP,GONE,has:t=>NEW.has(t)};
