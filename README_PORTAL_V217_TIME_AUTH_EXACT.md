# PORTAL v2.1.7 TIME認証実装移植版

今回は「TIME風」ではなく、スマホで実働している TIME v8.5 の認証処理の構造をそのまま移植。

- Firebase project: roumu-119cd
- Firebase SDK: 12.11.0
- config: window.FIREBASE_CONFIG（TIMEと同方式）
- setPersistence(browserLocalPersistence)
- onAuthStateChanged
- getRedirectResult
- スマホもまず signInWithPopup
- popup-blocked / cancelled-popup-request / operation-not-supported / web-storage-unsupported の時だけ redirect
- Firestoreも同じモジュール内で初期化
- Portal保存先: shared/portal-main
- TIME保存先 shared/attendance-main とは別
- 既存ポータル機能、休日保存修正、常時時計は維持
