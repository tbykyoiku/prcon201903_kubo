//定数
	//ローカルストレージ最大保存件数
	const SAVE_LIMIT = 10;
	//ローカルストレージkey値接頭辞
	const SAVE_KEY = "yrmemo";
	//保存リスト表示文字数
	const CONTENT_LIST_LIMIT = 56;

	//ウィンドウメッセージ
	const MESSAGE001 = "保存できる件数は最大10件までです。\n保存済みのデータを削除しますか？";
	const MESSAGE002 = "保存しました。";
	const MESSAGE003 = "タイトル、本文のどちらか必ず入力してください。";
	const MESSAGE004 = "現在の入力内容をクリアします。\nよろしいですか？";
	const MESSAGE005 = "保存データがありません。";
	const MESSAGE006 = "保存データを削除します。\nよろしいですか？";
	const MESSAGE007 = "保存データを全て削除します。\nよろしいですか？";
	const MESSAGE008 = "申し訳ありません。\nお使いのブラウザは保存・読込機能に対応していません。";
	//エラーメッセージ
	const ERRORMESSAGE001 = "保存に失敗しました。";

//変数
	//ローカルストレージKey値
	var keyValue = "";
	//ローカルストレージオブジェクト
	var obj = "";
	//タイトル
	var titleValue = "";
	//本文
	var titleContent = "";
	//HTMLタグ
	var template = "";

//onload
$(function(){
 	// メイン画面:読込ボタン押下
	$('#loadObj').click(function(){
		//リスト内容作成
		createStorageList();

		// 保存リストの要素の存在チェック
		if($('.input-group').length){

			// ボタン・チェックボックス初期化
			$('#btnClear').prop('disabled', true);
			$('#allCheck').prop('checked', false);

			// オーバーレイ用の要素を追加
			$('body').append('<div class="modal-overlay"></div>');
			// オーバーレイをフェードイン
			$('.modal-overlay').fadeIn('slow');
			// モーダルコンテンツのIDを取得
			var modal = '#' + $(this).attr('data-target');
			// モーダルコンテンツの表示位置を設定
			modalResize(modal);
			 // モーダルコンテンツフェードイン
			$(modal).fadeIn('slow');

			// 編集・削除・チェックボックス表示/非表示制御
			$('#btnEdit').click(function(){
				$('input[name=input-check]').show();
				$('.all').show();
				$('#btnEdit').hide();
				$('#btnClear').show();
			});

			// 削除ボタン/チェックボックス
			// チェックボックス全選択/全解除
			$('#allCheck').on("click",function(){
				$('input[name=input-check]').prop("checked", $(this).prop("checked"));
			});

			$('#allCheck, input[name=input-check]').on('click', function() {
				// チェックボックスの個数を取得
				var boxCount = $('input[name=input-check]').length;
				// チェックされたチェックボックスの数を取得
				var checkCount = $(".input-group :checked").length;

				// 削除ボタン活性/非活性制御
				if ( checkCount == 0 ){
					$('#btnClear').prop('disabled', true);
				} else {
					// チェックボックスにチェックが1つでもあれば削除ボタン活性化
					$('#btnClear').prop('disabled', false);
				}

				// チェックボックス選択/解除制御
				if (boxCount === checkCount){
					$('#allCheck').prop('checked', true);
				} else {
					$('#allCheck').prop('checked', false);
				}
			});

			// モーダルウィンドウを閉じる
			$('.modal-overlay, .modal-close, .btnLoad').off().click(function(){
				// モーダルコンテンツとオーバーレイをフェードアウト
				$(modal).fadeOut('slow');
				$('.modal-overlay').fadeOut('slow',function(){
					// チェックボックス編集・削除ボタンの制御
					$('input[name=input-check]').hide();
					$('.all').hide();
					$('#btnClear').hide();
					$('#btnEdit').show();

					// 保存リストを削除
					$('.input-group').remove();
					// オーバーレイを削除
					$('.modal-overlay').remove();
				});
			});

			// リサイズしたら表示位置を再取得
			$(window).on('resize', function(){
				modalResize( modal );
			});

		}
	});

	// 新規作成ボタン押下
	$('#newObj').click(function(){
		if( confirm( MESSAGE004 )) {

		// タイトル、本文、文字カウントを初期化
			document.getElementById('title-input').value  = "";
			tinymce.get('input').setContent( "" );
			document.getElementById('lineCount').innerHTML = 0;
			document.getElementById('textCount').innerHTML = 0;
		} else {
			return;
		}
	});

	// 保存ボタン押下
	$('#saveObj').click(function(){
		// ローカルストレージが使用出来るかチェック
		if (('localStorage' in window) && 
			(window['localStorage'] !== null) && (window['localStorage'] !== undefined)) {

				var keyList = getStorageKey();

			// 保存件数が最大値に達していないかチェック		
			 if ( SAVE_LIMIT == keyList.length ) {
				if( confirm( MESSAGE001 ) ) {
					// 保存リストを表示
					$('#loadObj').trigger('click');
				} else {
					return;
				}
			}else{
				// 保存処理呼び出し
				saveStorage();
			}
		} else {		
		// ローカルストレージが使用不可ならメッセージを表示
			alert( MESSAGE008 );
			return;
		}
	});

	// モーダルウィンドウ:読込ボタン押下
	$(document).on('click','.btn-load',function(){
		var loadKey = $(this).attr("value");

		// 保存内容読込処理を呼出
		loadStorage(loadKey);
		// モーダルウィンドウを閉じる
		$('.modal-close').trigger("click");
	});

	// モーダルウィンドウ:削除ボタン押下
	$('#btnClear').click(function(){
			// ラジオボタンのvalue値=ストレージKey値を取得
			var selectKeyList = $("input[name=input-check]:checked").map(function(){
				return $(this).val();
			}).get();

		if( confirm( MESSAGE006 )) {
			// ローカルストレージ削除
			for(var i = 0; i < selectKeyList.length; i++){
				var selectDelKey = selectKeyList[i];
				localStorage.removeItem( selectDelKey );
				// 保存リストを削除
				$('#'+ selectDelKey ).remove();
			}

			// 要素の存在チェック
			if(!($('.input-group').length)){
				$('.modal-close').trigger("click");
			}
		} else {
			return;
		}
	});

	// ダウンロードボタン押下
	$('#dlObj').click(function(){
		// タイトル、本文の入力値を取得
		var fileName = document.getElementById('title-input').value;
		var fileContent = tinymce.get('input').getContent().split("<br />").join('\n');

		// タイトル、本文空文字チェック
		if( fileName !== "" || fileContent !== "" ){
			// タイトルが空だった場合は固定値をセット
			if ( fileName == "" ){
				fileName = "ゆるめも";
			}
			// 改行コードが「LF」になっているためWindowsOSだったら「CRLF」に変換
			if ( ~navigator.userAgent.indexOf("Windows")) {
				fileContent = fileContent.replace(/\n/g, "\r\n").replace(/\r\r/g, "\r")
			}

			// ダウンロード:テキストファイル処理呼出
			createTextFile( fileName,fileContent );

		} else {
			alert( MESSAGE003 );
			return;
		}
	});

});


// ローカルストレージ関連
// ゆるめもの保存データ件数取得処理
function getStorageKey() {
	// ローカルストレージの保存件数を取得
	var saveNum = localStorage.length;
	// ローカルストレージからkey値を取得
	var storageArray = [];
	for(var i = 0; i < saveNum; i++){
	// ローカルストレージからkey値を取得
		var storageKey = localStorage.key(i);
		// key値接頭辞を含むデータのみ抽出				
		if ( storageKey.indexOf( SAVE_KEY ) != -1 ){
			storageArray.push( storageKey );
		}
	}
	return storageArray;
}

// ローカルストレージ:保存処理
function saveStorage() {
	// タイトル、本文の入力値を取得
	titleValue   = document.getElementById('title-input').value ;
	contentValue = tinymce.get('input').getContent();
	// タイトル、本文空文字チェック
	if( titleValue !== "" || contentValue !== "" ){

		//現在日時取得処理呼出
		var keyDate = getCurrentDate();
		//key値にセット
		var keyValue = SAVE_KEY + keyDate;
		//本文オブジェクト作成
		obj = {
			title:titleValue, 
			content:contentValue
		};
		// JSON形式に変換してローカルストレージに保存
		var obj = JSON.stringify(obj);
		localStorage.setItem(keyValue, obj);
		alert( MESSAGE002 );
	} else {
		// タイトル、本文ともに空なら保存処理中断
		alert( MESSAGE003);
		return;
	}
}

// ローカルストレージ:保存リスト作成処理
function createStorageList(){
	// ローカルストレージに値の存在チェック
	var keyList = getStorageKey();
	var keyNum  = keyList.length;

	if ( keyNum == 0 || keyNum == null ) {
		alert( MESSAGE005 );
		return;
	} else {
		// 保存データ数分ループする
		for(var i = 0; i < keyNum; i++){
			var keyValue  = keyList[i];
			var obj = JSON.parse(localStorage.getItem( keyValue ));
			var titleValue   = obj.title;
			var contentValue = (obj.content).split("<br />").join("　");
			// 本文文字列を画面表示用に指定文字数で抽出
			contentValue = substrText(contentValue, CONTENT_LIST_LIMIT, '…');

			// 保存リストHTML作成
			var div_element = document.createElement("div");

			div_element.innerHTML = '<div class="input-group" id="' + keyValue + '">' +
									'	<input type="checkbox" name="input-check" style="display: none;" value="' + keyValue + '" />' + 
									'	<input type="text" class="input-title" readonly="readonly" value="'+ titleValue + '" />' + 
									'	<input type="text" class="input-content" readonly="readonly" value="'+ contentValue + '" />' + 
									'	<button type="button" class="btn-load" id="btnLoad' + i + '" value="' + keyValue + '" >読込</button>' + 
									'</div>';

			// id="saveList"を書き換え
			var parent_object = document.getElementById("saveList");
			parent_object.appendChild(div_element);
		}
	}
}

// ローカルストレージ:読込処理
function loadStorage( key ){
	var selectLoadKey = key;
	// ローカルストレージからValue値を取得(文字列→JSON変換)
	obj = JSON.parse(localStorage.getItem( selectLoadKey ));
	titleValue   = obj.title;
	contentValue = obj.content;

	// タイトル、本文、行数、文字数を画面の各要素にセット
	document.getElementById('title-input').value  = titleValue;
	tinymce.get('input').setContent( contentValue );
	document.getElementById('lineCount').innerHTML = (tinymce.get('input').getContent().match( new RegExp("<br />", "g" )) || []).length +1;
	document.getElementById('textCount').innerHTML = tinymce.get('input').getContent({ format: 'text' }).replace(/\s/g, '').length;
}


// ダウンロード:テキストファイル処理
function createTextFile( fname,fcontent ){
	//webAPI Blobクラス
	var textFileBlob = new Blob([fcontent], {type:'text/plain'});
	var downloadLink = document.createElement("a");

	downloadLink.download = fname;
	downloadLink.innerHTML = "Download File";

	if (window.webkitURL != null){
		// Chrome allows the link to be clicked
		// without actually adding it to the DOM.
		downloadLink.href = window.webkitURL.createObjectURL(textFileBlob);
	} else {
		// Firefox requires the link to be added to the DOM
		// before it can be clicked.
		downloadLink.href = window.URL.createObjectURL(textFileBlob);
		downloadLink.onclick = destroyClickedElement;
		downloadLink.style.display = "none";
		document.body.appendChild(downloadLink);
	}
	downloadLink.click();
}

// モーダルコンテンツの表示位置を設定する関数
// 引数：要素ID
function modalResize( elm ){
	// ウィンドウの横幅、高さを取得
	var w = $(window).width();
	var h = $(window).height();

	// モーダルコンテンツの表示位置を取得
	var x = (w - $(elm).outerWidth(true)) / 2;
	var y = (h - $(elm).outerHeight(true)) / 2;

	// モーダルコンテンツの表示位置を設定
	$(elm).css({'left': x + 'px','top': y + 'px'});
}

// 現在日時取得処理(YYYYMMDDHH24MISS形式)
function getCurrentDate() {
	var date = new Date();

	var year  = date.getFullYear();
	var month = ( '0' + (date.getMonth()+1)).slice(-2);
	var day   = ( '0' +  date.getDate()).slice(-2);
	var hour  = ( '0' +  date.getHours()).slice(-2);
	var min   = ( '0' +  date.getMinutes()).slice(-2);
	var sec   = ( '0' +  date.getSeconds()).slice(-2);
	var msec  = date.getMilliseconds();

	var nowDate = year + month + day + hour + min + sec + msec;
	return nowDate;
}

// 文字列抽出処理
function substrText(text, len, truncation) {

	if (truncation === undefined) {
		truncation = ''; 
	}

	var text_array = text.split('');
	var count = 0;
	var str = '';

	for (i = 0; i < text_array.length; i++) {
		var n = escape(text_array[i]);
		if (n.length < 4) count++;
			else count += 2;
		if (count > len) {
			return str + truncation;
		}
		str += text.charAt(i);
	}
	return text;
}
