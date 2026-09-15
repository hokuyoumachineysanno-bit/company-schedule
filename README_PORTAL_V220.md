# PORTAL v2.2.0 スマホログイン復旧版

v2.1.9 の業務機能は維持し、認証ファイルだけ v2.1.8 の実働版へ戻した版。

維持:
- スマホ月フォーカス俯瞰
- スマホ案件一覧俯瞰
- 支払先→請求先
- 納期デフォルト=今日
- 即納希望→納期/施工予定日を今日へ反映
- 日フォーカス=今日
- スマホ再配置

認証:
- firebase-auth.js / firebase-config.js は v2.1.8 実働版を基準に復元
- Firebase roumu-119cd
- SDK 12.11.0
- popup first / 対象エラー時のみ redirect
- shared/portal-main
- キャッシュ識別子のみ v2.2.0 に更新
