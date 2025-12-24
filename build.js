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
const TEMPLATES_DIR = path.join(__dirname, "templates");
const INDEX_FILE = path.join(__dirname, "index.html");

// テンプレート読み込み関数
function loadTemplate(name) {
  const templatePath = path.join(TEMPLATES_DIR, `${name}.html`);
  return fs.readFileSync(templatePath, "utf-8");
}

// テンプレート置換関数
function renderTemplate(template, variables) {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, "g");
    result = result.replace(regex, value || "");
  }
  return result;
}

// HTMLページ生成関数（共通）
function buildPage(options) {
  const header = loadTemplate("header");
  const footer = loadTemplate("footer");
  const content = options.content || "";

  const fullHTML =
    renderTemplate(header, {
      TITLE: options.title || "My Blog",
      CSS_PATH: options.cssPath || "",
      ROOT_PATH: options.rootPath || "",
      HEAD_EXTRA: options.headExtra || "",
      HOME_ACTIVE: options.page === "home" ? "active" : "",
      POSTS_ACTIVE: options.page === "posts" ? "active" : "",
      ABOUT_ACTIVE: options.page === "about" ? "active" : "",
    }) +
    "\n" +
    content +
    "\n" +
    renderTemplate(footer, {
      ROOT_PATH: options.rootPath || "",
      SCRIPTS_EXTRA: options.scriptsExtra || "",
    });

  return fullHTML;
}

// HTMLテンプレート（記事ページ用）
function createPostHTML(title, date, updateDate, content, mdFilename) {
  const headExtra = `
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
    <script>hljs.highlightAll();</script>`;

  const scriptsExtra = `<script>
    async function editPost(filename, title) {
        const GITHUB_USER = 'tkhs-0114';
        const GITHUB_REPO = 'blog';
        const RAW_URL = \`https://raw.githubusercontent.com/\${GITHUB_USER}/\${GITHUB_REPO}/main/posts-md/\${filename}\`;
        
        try {
            // マークダウンファイルを取得
            const response = await fetch(RAW_URL);
            if (!response.ok) {
                throw new Error('ファイルの取得に失敗しました');
            }
            const mdContent = await response.text();
            
            // Front Matterをパースして本文とメタデータを分離
            let content = mdContent;
            let excerpt = 'ここに新しい要約を入力';
            let published = 'true';
            
            // 簡易的なFront Matterパース
            const fmMatch = mdContent.match(/^---\n([\\s\\S]*?)\n---\n([\\s\\S]*)$/);
            if (fmMatch) {
                const fmContent = fmMatch[1];
                content = fmMatch[2].trim(); // 本文のみ抽出
                
                // excerpt抽出
                const excerptMatch = fmContent.match(/^excerpt:\\s*(.*)$/m);
                if (excerptMatch) excerpt = excerptMatch[1].trim();
                
                // published抽出
                const publishedMatch = fmContent.match(/^published:\\s*(.*)$/m);
                if (publishedMatch) published = publishedMatch[1].trim();
            }
            
            // クリップボードにコピー（本文のみ）
            await navigator.clipboard.writeText(content);
            
            // 通知表示
            alert('本文をコピーしました。Issueの Content セクションにペーストして編集してください。');
            
            // GitHub Issue作成画面へリダイレクト
            const issueURL = new URL(\`https://github.com/\${GITHUB_USER}/\${GITHUB_REPO}/issues/new\`);
            issueURL.searchParams.set('template', 'edit_post.md');
            issueURL.searchParams.set('title', \`[Edit] \${title}\`);
            issueURL.searchParams.set('labels', 'edit');
            
            // Issueボディにファイル名とタイトルを事前入力
            const body = \`FILENAME: \${filename}\nTITLE: \${title}\nEXCERPT: \${excerpt}\nPUBLISHED: \${published}\n\n---\n\n<!-- ここにクリップボードの中身をペーストして、修正を加えてください -->\n\`;
            issueURL.searchParams.set('body', body);
            
            window.open(issueURL.toString(), '_blank');
        } catch (error) {
            alert('エラーが発生しました: ' + error.message);
        }
    }
    </script>`;

  const postContent = `
    <main class="container my-5">
        <article>
            <header class="mb-4">
                <h1 class="display-4 mb-3">${title}</h1>
                <p class="text-muted">作成日: ${date}${
    updateDate ? ` / 更新日: ${updateDate}` : ""
  }</p>
                <button class="btn btn-outline-secondary btn-sm mt-2" onclick="editPost('${mdFilename}', '${title.replace(
    /'/g,
    "\\'"
  )}')">
                    ✏️ 編集
                </button>
            </header>

            <div class="post-content">
                ${content}
            </div>

            <div class="mt-5">
                <a href="../index.html" class="btn btn-outline-primary">← ホームに戻る</a>
            </div>
        </article>
    </main>`;

  return buildPage({
    title: title,
    cssPath: "../",
    rootPath: "../",
    headExtra: headExtra,
    scriptsExtra: scriptsExtra,
    content: postContent,
  });
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

  const homeContent = loadTemplate("home-content");
  const content = renderTemplate(homeContent, {
    RECENT_POSTS: postCards,
  });

  return buildPage({
    title: "My Blog",
    page: "home",
    content: content,
  });
}

// 記事一覧ページのテンプレート
function createPostsHTML(posts) {
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

  const postsListContent = loadTemplate("posts-list-content");
  const content = renderTemplate(postsListContent, {
    POSTS_LIST: postCards,
  });

  return buildPage({
    title: "記事一覧",
    page: "posts",
    content: content,
  });
}

// Aboutページのテンプレート
function createAboutHTML() {
  const aboutContent = loadTemplate("about-content");

  return buildPage({
    title: "About",
    page: "about",
    content: aboutContent,
  });
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

    // published が false の場合はスキップ
    if (data.published === false) {
      console.log(`⏭️  ${file} は非公開のためスキップしました`);
      continue;
    }

    // マークダウンをHTMLに変換
    const htmlContent = marked(content);

    // スラッグ（ファイル名）を生成
    const slug = path.basename(file, ".md");

    // 日付のフォーマット
    const formattedDate = formatDate(data.date);
    const buildDate = getJSTDate();
    // 作成日とビルド日が異なる場合、またはupdate/updated項目が明示的に指定されている場合は更新日を表示
    const updateDate =
      data.updated ||
      data.update ||
      (formattedDate !== buildDate && formattedDate)
        ? data.updated
          ? formatDate(data.updated)
          : buildDate
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
      htmlContent,
      file // マークダウンファイル名を渡す
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

  // posts.htmlを生成
  const postsHTML = createPostsHTML(posts);
  const postsFile = path.join(__dirname, "posts.html");
  fs.writeFileSync(postsFile, postsHTML);
  console.log("✅ posts.html を更新しました");

  // about.htmlを生成
  const aboutHTML = createAboutHTML();
  const aboutFile = path.join(__dirname, "about.html");
  fs.writeFileSync(aboutFile, aboutHTML);
  console.log("✅ about.html を更新しました");

  console.log(`\n🎉 ビルド完了！ ${posts.length} 件の記事を生成しました`);
}

// エラーハンドリング
build().catch((err) => {
  console.error("❌ ビルドエラー:", err);
  process.exit(1);
});
