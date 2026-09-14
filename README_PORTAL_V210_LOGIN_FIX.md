# v2.1.0b Firebase login fix

`auth/api-key-not-valid` の原因となっていた firebaseConfig の apiKey 転記ミスを修正。
Firebase Console の Web アプリ設定に表示された値をそのまま使用。
