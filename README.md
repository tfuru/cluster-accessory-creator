# cluster-accessory-creator
cluster の アクセサリーをブラウザから作成,アップロードするためのツール  
PCだけでなく、スマートフォンからもアクセサリーを作成することができます。


# 環境  
- firebase  
Hosting  
Functions (Python)  

# 利用ライブラリやAPI 
- cluster アップロードAPI  
https://docs.cluster.mu/creatorkit/pitm/api-spec/

- Three.js  
https://threejs.org/

- Vue.js  
https://ja.vuejs.org/

# デプロイ

```bash
cd webapp
firebase deploy

# firebase deploy --only functions
# firebase deploy --only hosting
```

# 使い方

## アクセサリー テクスチャーの編集
1. アクセサリーをプルダウンから選択
2. テクスチャーをダウンロード
3. テクスチャーを編集
4. テクスチャーをアップロード
5. サムネイル画像撮影 

## アクセサリーアップロード
1. cluster アカウント画面で Creator Kit トークン を 取得する
2. cluster-accessory-creator にアクセス
3. Creator Kit トークン を 入力欄に入力
4. アクセサリー glb,サムネイル画像 をアップロード
5. 次回から Creator Kit トークン は保存される


# glb 出力
 chunk0 json に `pbrMetallicRoughness` が必要  
 UniGLTF -> export -> glb で出力すると `pbrMetallicRoughness` が追加される  
    
