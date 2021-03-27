/////////////////
////おうむ返し⇒動作確認完了
/////////////////
//
//// //LINE Developersで取得したアクセストークンを入れる
//var CHANNEL_ACCESS_TOKEN = '0Bg2pqapJKcwbnSr9sBvbGboVS3t9BFwIQU/CUQSdcPQZddk57vWRhvmSWlCF4B5O5O+NUZgxG7wappfMdzzZpCQTfqFZWuddeeezmuM5DnKSXqXsWpA0IeniVxqaj82Mu2/Be6McMYYy12UNIVZrAdB04t89/1O/w1cDnyilFU='; 
//var line_endpoint = 'https://api.line.me/v2/bot/message/reply';
//
//
////ポストで送られてくるので、送られてきたJSONをパース
//function doPost(e) {
//  var json = JSON.parse(e.postData.contents);
//
//  //返信するためのトークン取得
//  var reply_token= json.events[0].replyToken;
//  if (typeof reply_token === 'undefined') {
//    return;
//  }
//
//  //送られたメッセージ内容を取得
//  var message = json.events[0].message.text;  
//
//  // メッセージを返信    
//  UrlFetchApp.fetch(line_endpoint, {
//    'headers': {
//      'Content-Type': 'application/json; charset=UTF-8',
//      'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
//    },
//    'method': 'post',
//    'payload': JSON.stringify({
//      'replyToken': reply_token,
//      'messages': [{
//        'type': 'text',
//        'text': message,
//      }],
//    }),
//  });
//  return ContentService.createTextOutput(JSON.stringify({'content': 'post ok'})).setMimeType(ContentService.MimeType.JSON);
//}

//////////////////
//コメント付き返信①/
//////////////////

// LINE developersのメッセージ送受信設定に記載のアクセストークン
var ACCESS_TOKEN = '0Bg2pqapJKcwbnSr9sBvbGboVS3t9BFwIQU/CUQSdcPQZddk57vWRhvmSWlCF4B5O5O+NUZgxG7wappfMdzzZpCQTfqFZWuddeeezmuM5DnKSXqXsWpA0IeniVxqaj82Mu2/Be6McMYYy12UNIVZrAdB04t89/1O/w1cDnyilFU=';

//  * doPOST
//  * POSTリクエストのハンドリング
function doPost(e) {
  // 送信された内容
  var events = JSON.parse(e.postData.contents).events[0];
  // WebHookで受信した応答用Token
  var replyToken = events.replyToken;
  // ユーザーのメッセージを取得
  var userMessage = events.message;
  //ユーザーID取得
  var lineUserId = events.source.userId;

  // 返却用のメッセージ
  var replyMessage = "";

  // スプレッドシート記録用の情報
  var reqDate = new Date();
  var saveType = "";
  var saveMessage = "";

  //①Stringでの応答
  if(userMessage.text.match(/おはよう|おはようございます/)){
    replyMessage = userMessage.text+"。体温を入力してください！";
  } else if (userMessage.text == "報告"){//以下リッチメニュー対応分
      replyMessage = "体温を入力してください！\n体温は「数値」での入力をお願いします！\n例：36.5";
  } else if (userMessage.text == "履歴"){
    replyMessage = "";
  } else if (userMessage.text == "確認"){
    replyMessage = "ごめんなさい。\nこの機能は現在実装中です。。\n（間に合いませんでした。。）";
  } else if (userMessage.text == "上長"){
    replyMessage = "上長報告フォームをお送りします。\nhttps://docs.google.com/forms/d/e/1FAIpQLSelDwt4idwNiHBJoUx_0xgnHvNJNrsqRkV7ugAsl3mcEQ3g0Q/viewform";
  } else if (userMessage.type === 'sticker'){
  //②LINEスタンプでの応答⇒動かず・・・
    // https://static.worksmobile.net/static/wm/media/message-bot-api/line_works_sticker_list_new.pdf
      if(userMessage.stickerId === "150"){
        replyMessage = "報告フォームをお送りします。\nhttps://docs.google.com/forms/d/e/1FAIpQLSelDwt4idwNiHBJoUx_0xgnHvNJNrsqRkV7ugAsl3mcEQ3g0Q/viewform";
        saveType = "検温";
        saveMessage = "報告フォーム";
      } else {

      }
    //スプレッドに記録
    log(reqDate,saveType,saveMessage,lineUserId);
  //③数値判定!isNaNの場合の応答：数値かどうかの判断。数値判定でNaNではない＝数値になるという考え。
  } else if (!isNaN(userMessage.text)){ 
      //40.0℃以上の場合
      if (userMessage.text >= 40.0){
      // メッセージテキストを送信
      //??改行の方法がうまくいかず・・・要質問
      replyMessage = "検温報告ありがとうございます。\n高温ですね。\n上長報告が必要です！\nhttps://docs.google.com/forms/d/e/1FAIpQLSelDwt4idwNiHBJoUx_0xgnHvNJNrsqRkV7ugAsl3mcEQ3g0Q/viewform\nコロナ緊急ダイアルもご確認ください\nhttps://www.mhlw.go.jp/stf/newpage_09347.html";
      saveType = "検温";
      saveMessage = userMessage.text;
      } else if (userMessage.text >= 37.5) {
        //37.5℃以上の場合
        // メッセージテキストを送信
        replyMessage = "検温報告ありがとうございます。\n上長報告が必要です！\nhttps://docs.google.com/forms/d/e/1FAIpQLSelDwt4idwNiHBJoUx_0xgnHvNJNrsqRkV7ugAsl3mcEQ3g0Q/viewform";
        saveType = "検温";
        saveMessage = userMessage.text;
      } else if (userMessage.text <= 35.5) {
        //35.5℃以下の場合
        // メッセージテキストを送信
        replyMessage = "検温報告ありがとうございます。\n逆に大丈夫ですか？";
        saveType = "検温";
        saveMessage = userMessage.text;
      } else {
        //上記以外の体温の場合
        // メッセージテキストを送信
        replyMessage = "検温報告ありがとうございます。\n手洗いうがいを徹底しましょうね！";
        saveType = "検温";
        saveMessage = userMessage.text;
      } 
      //スプレッドシートに記録
      log(reqDate,saveType,saveMessage,lineUserId);
    } else {
      //上記条件分岐以外の場合：stringはおはようは通る
      replyMessage = "数値以外が入力されています。\n再度体温を数値で入力してください\n入力例：36.5";
    }

  // 応答メッセージ用のAPI URL
  var reply = 'https://api.line.me/v2/bot/message/reply';

  UrlFetchApp.fetch(reply, {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + ACCESS_TOKEN,
    },
    'method': 'post',
    'payload': JSON.stringify({
      'replyToken': replyToken,
      'messages': [{
        'type': 'text',
        'text': replyMessage,
      }],
    }),
    });
  return ContentService.createTextOutput(JSON.stringify({'content': 'post ok'})).setMimeType(ContentService.MimeType.JSON);
}

///////////////////////////////
// ユーザーのプロフィール名取得
///////////////////////////////
function getUserDisplayName(userId) {
  const url = 'https://api.line.me/v2/bot/profile/' + userId;
  const userProfile = UrlFetchApp.fetch(url,{
    'headers': {
      'Authorization' :  'Bearer ' + ACCESS_TOKEN,
    },
  })
  return JSON.parse(userProfile).displayName;
}

///////////////////////////////
// ユーザーのプロフィール画像取得 
///////////////////////////////
function getUserDisplayIMG(userId) {
  const url = 'https://api.line.me/v2/bot/profile/' + userId;
  const userProfile = UrlFetchApp.fetch(url,{
    'headers': {
      'Authorization' :  'Bearer ' + ACCESS_TOKEN,
    },
  })
  return JSON.parse(userProfile).pictureUrl;
}


//スプレッドシートへの記載の関数
function log(reqDate,saveType,saveMessage,userId, userIMG){
  var target = "19HtQhqjEpRY9JlCBqMIbkWfFmEqsmK4H9kgTvrXa60w";
  var spreadsheet = SpreadsheetApp.openById(target);
  var sheet = spreadsheet.getSheetByName(saveType);
  var lastRow = sheet.getLastRow();
  var userName = getUserDisplayName(userId);
  var userIMG = getUserDisplayIMG(userId);
// 数値のフォーマットを指定。（googleフォームの表示形式で設定のためコメントアウト）
// var numFormats = '#,##0.0;[Red](#,##0)';
// // 指定したセル範囲にフォーマットを適用
// numberRange.setNumberFormat(numFormats);
sheet.getRange(lastRow + 1, 1).setValue(reqDate);
sheet.getRange(lastRow + 1, 2).setValue(saveMessage);
sheet.getRange(lastRow + 1, 3).setValue(userId);
sheet.getRange(lastRow + 1, 4).setValue(`=IFERROR(VLOOKUP("${userId}",'メンバー'!A:B, 2, FALSE), "${userName}")`);
sheet.getRange(lastRow + 1, 5).setValue(userIMG);
sheet.getRange(lastRow + 1, 6).setValue(`=IFERROR(IFS(${saveMessage}>=37.5,"要確認",${saveMessage}<37.5,"問題無"),"")`);
}



// ////////////////////////
// //コメント付き返信⇒後日確認
// ////////////////////////

// // 利用しているシート
// var SHEET_ID = '19HtQhqjEpRY9JlCBqMIbkWfFmEqsmK4H9kgTvrXa60w';
// // 利用しているSSのシート名（※変えるとみえなくなる）
// var SHEET_NAME = 'https://docs.google.com/spreadsheets/d/19HtQhqjEpRY9JlCBqMIbkWfFmEqsmK4H9kgTvrXa60w/edit#gid=0';
// // 利用しているもしかしてSSのシート名（※変えるとみえなくなる）
// var SHEET_NAME_MAYBE = 'maybe';

// // LINE Message API アクセストークン
// var ACCESS_TOKEN = '0Bg2pqapJKcwbnSr9sBvbGboVS3t9BFwIQU/CUQSdcPQZddk57vWRhvmSWlCF4B5O5O+NUZgxG7wappfMdzzZpCQTfqFZWuddeeezmuM5DnKSXqXsWpA0IeniVxqaj82Mu2/Be6McMYYy12UNIVZrAdB04t89/1O/w1cDnyilFU=';
// // 通知URL
// var PUSH = "https://api.line.me/v2/bot/message/push";
// // リプライ時URL
// var REPLY = "https://api.line.me/v2/bot/message/reply";
// // プロフィール取得URL
// var PROFILE = "https://api.line.me/v2/profile";

// /**
//  * doPOST
//  * POSTリクエストのハンドリング
//  */
// function doPost(e) {
//   var json = JSON.parse(e.postData.contents);
//   reply(json);
// }

// /** 
//  * doGet
//  * GETリクエストのハンドリング
//  */
// function doGet(e) {
//     return ContentService.createTextOutput("SUCCESS");
// }

// /** 
//  * reply
//  * ユーザからのアクションに返信する
//  */
// function reply(data) {
//   // POST情報から必要データを抽出
//   var lineUserId = data.events[0].source.userId;
//   var postMsg    = data.events[0].message.text;
//   var replyToken = data.events[0].replyToken;
//   var action    = data.events[0].message.action;
//   // 記録用に検索語とuserIdを記録
// //  debug(postMsg, lineUserId);
//   debug(action, lineUserId);

//   // 検索語に対しての回答をSSから取得
//   var answers = findResponseArray(postMsg);

//   // 回答メッセージを作成
//   var replyText = '「' + postMsg + '」ですね。かしこまりました。以下、回答です。';
//   // 回答の有無に応じて分岐
//   if (answers.length === 0) {
//     // 「類似の検索キーワード」がないかチェック
//     var mayBeWord = findMaybe(postMsg);
//     if (typeof mayBeWord === "undefined") {
//       // 回答がない場合の定型文
//       sendMessage(replyToken, '答えが見つかりませんでした。別のキーワードで質問してみてください。');        
//     } else {
//       sendMayBe(replyToken, mayBeWord);
//     }
//   } else {
//     // 回答がある場合のメッセージ生成
//     answers.forEach(function(answer) {
//       replyText = replyText + "\n\n＝＝＝＝＝＝＝＝＝＝＝＝＝\n\nQ：" + answer.key + "\n\nA：" + answer.value;
//     });

//     // 1000文字を超える場合は途中で切る
//     if (replyText.length > 1000) {
//       replyText = replyText.slice(0,1000) + "……\n\n＝＝＝＝＝＝＝＝＝＝＝＝＝\n\n回答文字数オーバーです。詳細に検索キーワードを絞ってください。";
//     }
//     // メッセージAPI送信
//     sendMessage(replyToken, replyText);
//   }
// }

// // SSからデータを取得
// function getData() {
//   var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
//   var data = sheet.getDataRange().getValues();

//   return data.map(function(row) { return {key: row[0], value: row[1], type: row[2]}; });
// }

// // SSから「もしかして」データを取得
// function getMayBeData() {
//   var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME_MAYBE);
//   var data = sheet.getDataRange().getValues();
//   return data.map(function(row) { return {key: row[0], value: row[1], type: row[2]}; });
// }

// // 単語が一致したセルの回答を配列で返す
// function findResponseArray(word) {
//   // スペース検索用のスペースを半角に統一
//   word = word.replace('　',' ');
//   // 単語ごとに配列に分割
//   var wordArray = word.split(' ');
//   return getData().reduce(function(memo, row) {
//     // 値が入っているか
//     if (row.value) {
//       // AND検索ですべての単語を含んでいるか
//       var matchCnt = 0;
//       wordArray.forEach(function(wordUnit) {
//         // 単語を含んでいればtrue
//         if (row.key.indexOf(wordUnit) > -1) {
//           matchCnt = matchCnt + 1;
//         }
//       });
//       if (wordArray.length === matchCnt) {
//         memo.push(row);
//       }
//     }
//     return memo;
//   }, []) || [];
// }

// // 単語が一致したセルの回答を「もしかして」を返す
// function findMaybe(word) {
//   return getMayBeData().reduce(function(memo, row) { return memo || (row.key === word && row.value); }, false) || undefined;
// }

// // 画像形式でAPI送信
// function sendMessageImage(replyToken, imageUrl) {
//   // replyするメッセージの定義
//   var postData = {
//     "replyToken" : replyToken,
//     "messages" : [
//       {
//         "type": "image",
//         "originalContentUrl": imageUrl
//       }
//     ]
//   };
//   return postMessage(postData);
// }

// // LINE messaging apiにJSON形式でデータをPOST
// function sendMessage(replyToken, replyText) {  
//   // replyするメッセージの定義
//   var postData = {
//     "replyToken" : replyToken,
//     "messages" : [
//       {
//         "type" : "text",
//         "text" : replyText
//       }
//     ]
//   };
//   return postMessage(postData);
// }

// // LINE messaging apiにJSON形式で確認をPOST
// function sendMayBe(replyToken, mayBeWord) {  
//   // replyするメッセージの定義
//   var postData = {
//     "replyToken" : replyToken,
//     "messages" : [
//       {
//         "type" : "template",
//         "altText" : "もしかして検索キーワードは「" + mayBeWord + "」ですか？",
//         "template": {
//           "type": "confirm",
//           "actions": [
//             {
//                 "type":"postback",
//                 "label":"はい",
//                 "data":"action=detail",
//             },
//             {
//                 "type": "message",
//                 "label": "いいえ",
//                 "text": "いいえ、違います。"
//             }
//           ],
//           "text": "答えが見つかりませんでした。もしかして検索キーワードは「" + mayBeWord + "」ですか？"
//         }

//       }
//     ]
//   };
//   return postMessage(postData);
// }

// // LINE messaging apiにJSON形式でデータをPOST
// function postMessage(postData) {  
//   // リクエストヘッダ
//   var headers = {
//     "Content-Type" : "application/json; charset=UTF-8",
//     "Authorization" : "Bearer " + ACCESS_TOKEN
//   };
//   // POSTオプション作成
//   var options = {
//     "method" : "POST",
//     "headers" : headers,
//     "payload" : JSON.stringify(postData)
//   };
//   return UrlFetchApp.fetch(REPLY, options);      
// }

// /** ユーザーのアカウント名を取得
//  */
// function getUserDisplayName(userId) {
//   var url = 'https://api.line.me/v2/bot/profile/' + userId;
//   var userProfile = UrlFetchApp.fetch(url,{
//     'headers': {
//       'Authorization' :  'Bearer ' + ACCESS_TOKEN,
//     },
//   })
//   return JSON.parse(userProfile).displayName;
// }

// // userIdシートに記載
// function lineUserId(userId) {
//   var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('userId');
//   sheet.appendRow([userId]);
// }

// // debugシートに値を記載
// function debug(text, userId) {
//   var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('debug');
//   var date = new Date();
//   var userName = getUserDisplayName(userId);
//   sheet.appendRow([userId, userName, text, Utilities.formatDate( date, 'Asia/Tokyo', 'yyyy-MM-dd HH:mm:ss')]);
// }