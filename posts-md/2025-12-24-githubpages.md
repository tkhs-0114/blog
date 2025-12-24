---
title: GitHubPagesで個人ブログを作成♪
date: 2025/12/24
excerpt: WebUI上で記事投稿がしたい！
published: true
---


この投稿は**HxSコンピューター部 Advent Calendar 2025**の23日目の記事です♬
## 個人ブログを作りたい🔥
Qiitaとかって気軽に書いた記事でも、♡付いてモチベにはなるけど、あまりにも薄い内容だと投稿するのは気が引けちゃう...
だったら個人ブログを作って、うっすい内容の記事を投稿しよう！ってことでこのブログができました。
## さて、どこで公開しましょうか？
ここは無料！簡単！定期的なアクセスの必要無し！のGitHubPagesが最強なのですが
GitHubPagesは静的なサイトしか公開できません
→つまり、投稿のたびにエディタを開く、HTMLを書く、Commit、GitHub上にPush、なんかの面倒臭い作業が必要になります
## 3日坊主でも続けられる投稿フロー
1. まずはHTMLを書く手間を省きましょう。
->これは適当にマークダウンからHTMLにビルドできるJavaScriptを書きました。
2. 次にWebブラウザからマークダウンを書けるようにしましょう
-> これにはGitHubのISSUEを活用します。ISSUEが投稿されるをトリガーにGitHubActionsを起動させ、ISSUEの内容からマークダウン作成&ビルドまでを行ってPRを送信します
3. PRのマージをトリガーにデプロイを実施

<img width=880 height=563 alt=Image src=https://github.com/user-attachments/assets/3f01fe77-7f7e-4471-a9e2-9320db9ab21d />

## 最強のブログ環境の完成！！
これで超気軽に記事の投稿ができるGitHubPagesブログの完成です！
