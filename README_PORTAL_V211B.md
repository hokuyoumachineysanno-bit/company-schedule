# v2.1.1b mobile login / Firestore sync fix

- スマホではGoogleログインを popup ではなく redirect 優先に変更
- 利用許可済みユーザーは、Firestore同期エラーだけでログイン画面に閉じ込めない
- クラウド読込失敗時はポータルを開き、ヘッダーにエラー表示
- firebase-auth.js のキャッシュバスター更新

初回クラウド登録は、従来どおり「PC側」でのみ実行してください。
