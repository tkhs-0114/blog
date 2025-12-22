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
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="../css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
    <script>hljs.highlightAll();</script>
</head>
<body>
    <nav class="navbar navbar-expand-lg navbar-light bg-light border-bottom">
        <div class="container">
            <a class="navbar-brand fw-bold" href="../index.html">My Blog</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item">
                        <a class="nav-link" href="../index.html">ホーム</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#about">About</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>

    <main class="container my-5">
        <article>
            <header class="mb-4">
                <h1 class="display-4 mb-3">${title}</h1>
                <p class="text-muted">作成日: ${date}${
    updateDate ? ` / 更新日: ${updateDate}` : ""
  }</p>
            </header>

            <div class="post-content">
                ${content}
            </div>

            <div class="mt-5">
                <a href="../index.html" class="btn btn-outline-primary">← ホームに戻る</a>
            </div>
        </article>
    </main>

    <footer class="bg-light border-top py-4 mt-5">
        <div class="container text-center text-muted">
            <p class="mb-0">&copy; 2025 My Blog. All rights reserved.</p>
        </div>
    </footer>
    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`;
}

// インデックスページのテンプレート
function createIndexHTML(posts) {
  const postCards = posts
    .map(
      (post) => `
            <div class="col-md-12 mb-4">
                <div class="card h-100 shadow-sm">
                    <div class="card-body">
                        <p class="text-muted small mb-2">${post.date}</p>
                        <h2 class="card-title h4">
                            <a href="posts/${post.slug}.html" class="text-decoration-none text-dark">${post.title}</a>
                        </h2>
                        <p class="card-text text-muted">
                            ${post.excerpt}
                        </p>
                        <a href="posts/${post.slug}.html" class="btn btn-outline-primary btn-sm">続きを読む →</a>
                    </div>
                </div>
            </div>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Blog</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <nav class="navbar navbar-expand-lg navbar-light bg-light border-bottom">
        <div class="container">
            <a class="navbar-brand fw-bold" href="index.html">My Blog</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav ms-auto">
                    <li class="nav-item">
                        <a class="nav-link active" href="index.html">ホーム</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="#about">About</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>

    <main class="container my-5">
        <div class="row">
            <div class="col-lg-8 mx-auto">
                <h1 class="display-5 mb-4">最新の記事</h1>
                <div class="row">
${postCards}
                </div>
            </div>
        </div>
    </main>

    <footer class="bg-light border-top py-4 mt-5">
        <div class="container text-center text-muted">
            <p class="mb-0">&copy; 2025 My Blog. All rights reserved.</p>
        </div>
    </footer>
    
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
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
