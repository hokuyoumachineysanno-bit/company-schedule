# v2.1.4 Mobile Google login fix

- スマホでは Google popup を使わず、Firebase `signInWithRedirect()` を直接使用。
- PCは popup のまま。
- PC popup がブロックされた場合のみ redirect へフォールバック。
- redirect 復帰後の状態表示を追加。
- v2.1.3 の Firestore分離、休日保存修正、常時時計を維持。
