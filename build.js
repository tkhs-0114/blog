const fs = require("fs");
const path = require("path");
const { marked } = require("marked");
const matter = require("gray-matter");

// markedの設定
marked.setOptions({
  breaks: true,
  gfm: true,
});

// 日本時間で現在日付を取得 (YYYY/MM/DD形式)
function getJSTDate() {
  const now = new Date();
  const jstOffset = 9 * 60; // JST is UTC+9
  const jstDate = new Date(
    now.getTime() + (jstOffset + now.getTimezoneOffset()) * 60000
  );
  const year = jstDate.getFullYear();
  const month = String(jstDate.getMonth() + 1).padStart(2, "0");
  const day = String(jstDate.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
}

// YYYY-MM-DD形式をYYYY/MM/DD形式に変換
function formatDate(dateStr) {
  if (!dateStr) return getJSTDate();
  // すでにYYYY/MM/DD形式ならそのまま返す
  if (dateStr.includes("/")) return dateStr;
  // YYYY-MM-DD形式ならYYYY/MM/DD形式に変換
  return dateStr.replace(/-/g, "/");
}

// ディレクトリ設定
const POSTS_MD_DIR = path.join(__dirname, "posts-md");
const POSTS_HTML_DIR = path.join(__dirname, "posts");
const INDEX_FILE = path.join(__dirname, "index.html");

// HTMLテンプレート（記事ページ用）
function createPostHTML(title, date, updateDate, content) {
  return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - My Blog</title>
    <link rel="stylesheet" href="../css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
    <script>hljs.highlightAll();</script>
</head>
<body>
    <header class="site-header">
        <div class="container">
            <h1 class="site-title">My Blog</h1>
            <nav class="site-nav">
                <ul>
                    <li><a href="../index.html">ホーム</a></li>
                    <li><a href="#about">About</a></li>
                </ul>
            </nav>
        </div>
    </header>

    <main class="container">
        <article>
            <header class="post-header">
                <h1 class="post-title">${title}</h1>
                <div class="post-meta">作成日: ${date}${
    updateDate ? ` / 更新日: ${updateDate}` : ""
  }</div>
            </header>

            <div class="post-content">
                ${content}
            </div>

            <a href="../index.html" class="back-link">← ホームに戻る</a>
        </article>
    </main>

    <footer class="site-footer">
        <div class="container">
            <p>&copy; 2025 My Blog. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>`;
}

// インデックスページのテンプレート
function createIndexHTML(posts) {
  const postCards = posts
    .map(
      (post) => `
            <article class="post-card">
                <div class="post-date">${post.date}</div>
                <h2 class="post-title">
                    <a href="posts/${post.slug}.html">${post.title}</a>
                </h2>
                <p class="post-excerpt">
                    ${post.excerpt}
                </p>
                <a href="posts/${post.slug}.html" class="read-more">続きを読む →</a>
            </article>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Blog</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <header class="site-header">
        <div class="container">
            <h1 class="site-title">My Blog</h1>
            <nav class="site-nav">
                <ul>
                    <li><a href="index.html">ホーム</a></li>
                    <li><a href="#about">About</a></li>
                </ul>
            </nav>
        </div>
    </header>

    <main class="container">
        <section class="blog-posts">
${postCards}
        </section>
    </main>

    <footer class="site-footer">
        <div class="container">
            <p>&copy; 2025 My Blog. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>`;
}

// メイン処理
async function build() {
  console.log("🚀 ビルド開始...");

  // postsディレクトリが存在しない場合は作成
  if (!fs.existsSync(POSTS_HTML_DIR)) {
    fs.mkdirSync(POSTS_HTML_DIR, { recursive: true });
  }

  // マークダウンファイルを読み込み
  const files = fs
    .readdirSync(POSTS_MD_DIR)
    .filter((file) => file.endsWith(".md"));

  if (files.length === 0) {
    console.log("⚠️  posts-md/ にマークダウンファイルがありません");
    return;
  }

  const posts = [];

  // 各マークダウンファイルを処理
  for (const file of files) {
    if (file === "_template.md") continue; // テンプレートファイルはスキップ
    const filePath = path.join(POSTS_MD_DIR, file);
    const fileContent = fs.readFileSync(filePath, "utf-8");

    // Front matterをパース
    const { data, content } = matter(fileContent);

    // マークダウンをHTMLに変換
    const htmlContent = marked(content);

    // スラッグ（ファイル名）を生成
    const slug = path.basename(file, ".md");

    // 日付のフォーマット
    const formattedDate = formatDate(data.date);
    const buildDate = getJSTDate();
    // 作成日とビルド日が異なる場合、またはupdate項目が明示的に指定されている場合は更新日を表示
    const updateDate =
      data.update || (formattedDate !== buildDate && formattedDate)
        ? buildDate
        : null;

    // 記事情報を保存
    posts.push({
      title: data.title || "Untitled",
      date: formattedDate,
      excerpt: data.excerpt || "",
      slug: slug,
      content: htmlContent,
    });

    // HTMLファイルを生成
    const postHTML = createPostHTML(
      data.title,
      formattedDate,
      updateDate,
      htmlContent
    );
    const outputPath = path.join(POSTS_HTML_DIR, `${slug}.html`);
    fs.writeFileSync(outputPath, postHTML);

    console.log(`✅ ${slug}.html を生成しました`);
  }

  // 日付でソート（新しい順）
  posts.sort((a, b) => new Date(b.date) - new Date(a.date));

  // index.htmlを生成
  const indexHTML = createIndexHTML(posts);
  fs.writeFileSync(INDEX_FILE, indexHTML);
  console.log("✅ index.html を更新しました");

  console.log(`\n🎉 ビルド完了！ ${posts.length} 件の記事を生成しました`);
}

// エラーハンドリング
build().catch((err) => {
  console.error("❌ ビルドエラー:", err);
  process.exit(1);
});
