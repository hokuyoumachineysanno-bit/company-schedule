# PORTAL v2.2.1 iPhoneログイン復旧版

実機スクリーンショットで iPhone Safari が
`auth/popup-closed-by-user` を返してログイン画面に戻ることを確認したため、
このエラーを「ユーザーキャンセル」として終了せず、Firebase の
`signInWithRedirect` へ自動フォールバックするよう修正。

その他の v2.2.0 / v2.1.9 業務機能は維持。
