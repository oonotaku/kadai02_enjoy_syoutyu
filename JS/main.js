// ファイル選択のイベントリスナーを追加
document.getElementById('cameraInput').addEventListener('change', async function (event) {
    // 選択されたファイルを取得
    const file = event.target.files[0];
    if (file) {  // ファイルが存在する場合のみ処理を進める
        const reader = new FileReader();  // FileReaderオブジェクトを作成（ファイルを読み込むために使用）
        // ファイルの読み込み完了時の処理を定義
        reader.onload = async function (e) {
            const previewImage = document.getElementById('previewImage');  // プレビュー用のimg要素を取得
            previewImage.src = e.target.result;  // 画像のプレビューを表示
            previewImage.style.display = 'block';  // プレビュー画像を表示する

            // 画像認識APIに送信して焼酎の銘柄名を取得（ここではテスト用に固定の名前を返す）
            const shochuName = await identifyShochu(e.target.result);

            if (shochuName) {  // 焼酎名が取得できた場合
                // OpenAI APIに送信して焼酎情報を取得
                const shochuInfo = await fetchShochuInfo(shochuName);

                // 取得した情報を表示
                displayShochuInfo(shochuInfo);
            } else {  // 銘柄名が特定できなかった場合の処理
                alert("焼酎の名前が特定できませんでした");
            }
        };
        reader.readAsDataURL(file);  // ファイルをData URL形式で読み込み、画像として使用できるようにする
    }
});

// 焼酎の銘柄を特定する関数（ユーザー入力を利用）
async function identifyShochu() {
    const userInput = document.querySelector('.shochuInput').value;  // クラス名を使って要素を取得
    if (userInput.trim() === "") {
        alert("焼酎名を入力してください");
        return null;  // 入力が空の場合はnullを返し、処理を中断
    }
    return userInput;  // ユーザー入力を返す
}


// OpenAI APIを使用して焼酎情報を取得する関数
async function fetchShochuInfo(shochuName) {
    // OpenAI APIに送信するプロンプトを作成
    const prompt = `${shochuName}について：
    - どんな焼酎なのか？
    - どんなつまみが合うのか？
    - 似たような焼酎でおすすめは？`;

    try {
        // OpenAIのAPIキー（実際には環境変数などで安全に管理してください）
        const apiKey = "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";
        // OpenAI APIへのリクエストを送信（/v1/chat/completionsエンドポイントを使用）
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",  // POSTメソッドでリクエストを送信
            headers: {
                "Content-Type": "application/json",  // リクエストの内容がJSON形式であることを指定
                "Authorization": `Bearer ${apiKey}`  // OpenAIのAPIキーを設定
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",  // 使用するモデル
                messages: [
                    { role: "system", content: "You are an assistant that provides information about shochu (Japanese distilled spirits)." },
                    { role: "user", content: prompt }
                ],
                max_tokens: 1000  // 応答の最大トークン数（応答の長さを制限）
            })
        });

        const data = await response.json();  // レスポンスをJSON形式で取得
        console.log("OpenAI API Response:", JSON.stringify(data, null, 2));  // レスポンス全体を詳細に出力

        // choicesプロパティが存在し、結果が含まれているか確認
        if (data.choices && data.choices.length > 0) {
            return data.choices[0].message.content.trim();  // 応答のテキストを返す
        } else {
            console.error("OpenAI APIのレスポンスにchoicesプロパティがありません。");
            console.log("Received response:", data);  // エラー時にレスポンス全体を出力
            return "情報を取得できませんでした";
        }
    } catch (error) {
        console.error("Error with ChatGPT API:", error);  // ネットワークエラーなどの一般エラー
        alert("ChatGPT APIの呼び出し中にエラーが発生しました");
        return "情報を取得できませんでした";
    }
}
// 取得した焼酎情報を表示する関数
function displayShochuInfo(info) {
    const infoContainer = document.getElementById('shochuInfo');
    infoContainer.innerText = info;
    infoContainer.style.display = 'block';  // 初期状態で表示する
    document.getElementById('toggleButton').innerText = '結果を非表示';  // ボタンのテキストを「非表示」に変更
}

// 折りたたみボタンのクリックイベントを追加
document.getElementById('toggleButton').addEventListener('click', function () {
    const infoContainer = document.getElementById('shochuInfo');
    const isVisible = infoContainer.style.display === 'block';

    if (isVisible) {
        // 現在表示中の場合、非表示にする
        infoContainer.style.display = 'none';
        this.innerText = 'この焼酎に関して';
    } else {
        // 現在非表示の場合、表示する
        infoContainer.style.display = 'block';
        this.innerText = '結果を非表示';
    }
});

document.addEventListener('DOMContentLoaded', function () {
    var today = new Date();
    var year = today.getFullYear();
    var month = today.getMonth() + 1; // 月は0から始まるため+1
    var day = today.getDate();
    var formattedDate = year + '年' + month + '月' + day + '日';
    document.getElementById('current-date').textContent = formattedDate;
});