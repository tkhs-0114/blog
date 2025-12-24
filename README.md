# My Blog

GitHub Pages で公開する静的ブログです。マークダウンで記事を書いて、GitHub Actions で自動的に HTML に変換してデプロイします。

## 構成

```
blog/
├── .github/workflows/  # GitHub Actions設定
├── templates/         # HTMLテンプレート（ヘッダー・フッター等）
├── posts-md/          # マークダウンソース（ここに記事を書く）
├── posts/             # 生成されたHTML（自動生成）
├── css/               # スタイルシート
├── index.html         # トップページ（自動生成）
├── about.html         # Aboutページ（自動生成）
├── posts.html         # 記事一覧ページ（自動生成）
├── build.js           # ビルドスクリプト
└── package.json       # 依存関係
```

## テンプレートシステム

このブログは、ヘッダーやフッターなどの共通部分を `templates/` ディレクトリに分割して管理しています。

### テンプレートファイル

- `templates/header.html` - 全ページ共通のヘッダー（ナビゲーション含む）
- `templates/footer.html` - 全ページ共通のフッター
- `templates/home-content.html` - ホームページのコンテンツ部分
- `templates/about-content.html` - About ページのコンテンツ部分
- `templates/posts-list-content.html` - 記事一覧ページのコンテンツ部分

### テンプレートのカスタマイズ

1. `templates/` 内のファイルを編集
2. `npm run build` で HTML を再生成
3. 変更を確認

テンプレート内で使える変数：

- `{{TITLE}}` - ページタイトル
- `{{ROOT_PATH}}` - ルートパスへのパス
- `{{CSS_PATH}}` - CSS ファイルへのパス
- `{{HOME_ACTIVE}}`, `{{POSTS_ACTIVE}}`, `{{ABOUT_ACTIVE}}` - アクティブなナビゲーション項目

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. ローカルでビルド

```bash
npm run build
```

### 3. ローカルでプレビュー

```bash
npm run dev
```

ブラウザで `http://localhost:8000` にアクセスします。

## 記事の書き方

### 新しい記事を作成

1. `posts-md/` ディレクトリに新しい `.md` ファイルを作成
2. Front matter を含むマークダウンを記述：

```markdown
---
title: 記事のタイトル
date: 2025-12-22
excerpt: トップページに表示される要約文
---

# 見出し

記事の本文をここに書きます。

## サブ見出し

マークダウン記法が使えます。
```

3. ファイルを保存してコミット＆プッシュ

### Front matter（必須項目）

- `title`: 記事のタイトル
- `date`: 投稿日（YYYY-MM-DD 形式）
- `excerpt`: 記事の要約（トップページに表示）

### テンプレート

`posts-md/_template.md` にサンプルテンプレートがあります。

## GitHub Pages へのデプロイ

### 初回設定

1. このリポジトリを GitHub にプッシュ
2. リポジトリの **Settings** > **Pages** に移動
3. **Source** を "**GitHub Actions**" に設定
4. 保存

### 記事の公開

マークダウンファイルを `posts-md/` に追加してプッシュするだけで、自動的にビルド＆デプロイされます：

```bash
git add posts-md/your-new-post.md
git commit -m "新しい記事を追加"
git push
```

数分後、`https://ユーザー名.github.io/リポジトリ名/` に反映されます。

## ワークフロー

1. `posts-md/` にマークダウンで記事を書く
2. `git push` で GitHub にプッシュ
3. GitHub Actions が自動的に：
   - 依存関係をインストール
   - `build.js` を実行して HTML を生成
   - GitHub Pages にデプロイ

## カスタマイズ

- **デザイン**: `css/style.css` を編集
- **ビルド処理**: `build.js` を編集
- **テンプレート**: `build.js` 内の HTML テンプレートを変更

## ローカル開発

マークダウンを編集したら：

```bash
npm run build  # HTMLを生成
```

生成された HTML をブラウザで確認。

## トラブルシューティング

### ビルドが失敗する場合

1. GitHub Actions のログを確認
2. ローカルで `npm run build` を実行してエラーを確認
3. Front matter の形式が正しいか確認

### ページが表示されない場合

- Settings > Pages で Source が "GitHub Actions" になっているか確認
- Actions タブでワークフローが成功しているか確認

## ライセンス

MIT License
