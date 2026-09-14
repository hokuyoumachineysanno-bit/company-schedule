# v2.1.0c Firebase login cache fix

修正点:
- Firebase APIキーをFirebase Consoleからコピーされた値で固定。
- index.html の firebase-auth.js 読み込みURLを
  `firebase-auth.js?v=2.1.0c-20260914`
  に変更。
- 旧 v2.1.0 / v2.1.0b の JavaScript キャッシュを強制的に回避。

アップロード後は index.html と firebase-auth.js の両方を必ず上書きしてください。
