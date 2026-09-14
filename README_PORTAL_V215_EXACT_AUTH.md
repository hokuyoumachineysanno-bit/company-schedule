# v2.1.5 exact v2.1.0c authentication

スマホログインは、過去にPC・スマホ双方で実際に動作確認済みの v2.1.0c と
同じ Firebase Auth 初期化順序・popup-first ロジックへ完全に戻した。

重要:
- Firestore同期は Google認証成功後にのみ読み込む。
- Firestoreで失敗しても、Google認証済みならポータル自体には入れる。
- 休日保存修正、常時時計、Firestore同期機能は維持。
