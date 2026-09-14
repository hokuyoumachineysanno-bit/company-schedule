# v2.1.3

スマホのログインボタン無反応対策。

原因切り分けのため、認証とFirestore同期を完全に分離。
- firebase-auth.js は Googleログインだけを先に初期化
- ログインボタンのイベントを、非同期初期化より先に登録
- Firestore SDK はログイン成功後に firestore-sync.js から動的読み込み
- Firestore側で問題があってもログインボタン自体が死なない
- v2.1.2の休日保存修正・常時時計も維持
