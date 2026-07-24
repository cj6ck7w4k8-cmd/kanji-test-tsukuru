(function () {
  "use strict";

  const STORAGE_KEY = "kanji-kotsukotsu-v1";
  const VISITOR_KEY = "kanji-kotsukotsu-visitor-id";
  const MAX_QUESTIONS = 20;
  const HIRAGANA = /^[ぁ-ゖー]+$/;
  const KANJI = /^[\u3400-\u9fff々]+$/;

  // 文部科学省の学年別漢字配当表。判定は文字単位で行う。
  const GRADE_KANJI = {
    1: "一右雨円王音下火花貝学気九休玉金空月犬見五口校左三山子四糸字耳七車手十出女小上森人水正生青夕石赤千川先早草足村大男竹中虫町天田土二日入年白八百文木本名目立力林六",
    2: "引羽雲園遠何科夏家歌画回会海絵外角楽活間丸岩顔汽記帰弓牛魚京強教近兄形計元言原戸古午後語工公広交光考行高黄合谷国黒今才細作算止市矢姉思紙寺自時室社弱首秋週春書少場色食心新親図数西声星晴切雪船線前組走多太体台地池知茶昼長鳥朝直通弟店点電刀冬当東答頭同道読内南肉馬売買麦半番父風分聞米歩母方北毎妹万明鳴毛門夜野友用曜来里理話",
    3: "悪安暗医委意育員院飲運泳駅央横屋温化荷界開階寒感漢館岸起期客究急級宮球去橋業曲局銀区苦具君係軽血決研県庫湖向幸港号根祭皿仕死使始指歯詩次事持式実写者主守取酒受州拾終習集住重宿所暑助昭消商章勝乗植申身神真深進世整昔全相送想息速族他打対待代第題炭短談着注柱丁帳調追定庭笛鉄転都度投豆島湯登等動童農波配倍箱畑発反坂板皮悲美鼻筆氷表秒病品負部服福物平返勉放味命面問役薬由油有遊予羊洋葉陽様落流旅両緑礼列練路和",
    4: "愛案以衣位茨印英栄媛塩岡億加果貨課芽賀改械害街各覚潟完官管関観願岐希季旗器機議求泣給挙漁共協鏡競極熊訓軍郡群径景芸欠結建健験固功好香候康佐差菜最埼材崎昨札刷察参産散残氏司試児治滋辞鹿失借種周祝順初松笑唱焼照城縄臣信井成省清静席積折節説浅戦選然争倉巣束側続卒孫帯隊達単置仲沖兆低底的典伝徒努灯働特徳栃奈梨熱念敗梅博阪飯飛必票標不夫付府阜富副兵別辺変便包法望牧末満未民無約勇要養浴利陸良料量輪類令冷例連老労録",
    5: "圧囲移因永営衛易益液演応往桜可仮価河過快解格確額刊幹慣眼紀基寄規喜技義逆久旧救居許境均禁句型経潔件険検限現減故個護効厚耕航鉱構興講告混査再災妻採際在財罪殺雑酸賛士支史志枝師資飼示似識質舎謝授修述術準序招証象賞条状常情織職制性政勢精製税責績接設絶祖素総造像増則測属率損貸態団断築貯張停提程適統堂銅導得毒独任燃能破犯判版比肥非費備評貧布婦武復複仏粉編弁保墓報豊防貿暴脈務夢迷綿輸余容略留領歴",
    6: "胃異遺域宇映延沿恩我灰拡革閣割株干巻看簡危机揮貴疑吸供胸郷勤筋系敬警劇激穴券絹権憲源厳己呼誤后孝皇紅降鋼刻穀骨困砂座済裁策冊蚕至私姿視詞誌磁射捨尺若樹収宗就衆従縦縮熟純処署諸除承将傷障蒸針仁垂推寸盛聖誠舌宣専泉洗染銭善奏窓創装層操蔵臓存尊退宅担探誕段暖値宙忠著庁頂腸潮賃痛敵展討党糖届難乳認納脳派拝背肺俳班晩否批秘俵腹奮並陛閉片補暮宝訪亡忘棒枚幕密盟模訳郵優預幼欲翌乱卵覧裏律臨朗論",
  };
  const gradeOf = new Map();
  Object.entries(GRADE_KANJI).forEach(([g, chars]) => [...chars].forEach((c) => gradeOf.set(c, Number(g))));

  let SAMPLE_DATA = [
    { id: 1, grade: 3, kanji: "港", yomi: "みなと", sentence: "大[おお]きな船[ふね]が{{港[みなと]}}にとまる。" },
    { id: 2, grade: 3, kanji: "港", yomi: "こう", sentence: "朝[あさ]、{{港[こう]}}内[ない]を歩[ある]く。" },
    { id: 3, grade: 3, kanji: "橋", yomi: "はし", sentence: "川[かわ]にかかる{{橋[はし]}}をわたる。" },
    { id: 4, grade: 3, kanji: "緑", yomi: "みどり", sentence: "山[やま]の{{緑[みどり]}}が美[うつく]しい。" },
    { id: 5, grade: 3, kanji: "温", yomi: "あたた", sentence: "{{温[あたた]}}かいお茶[ちゃ]を飲[の]む。" },
    { id: 6, grade: 3, kanji: "泳", yomi: "およ", sentence: "海[うみ]で元気[げんき]に{{泳[およ]}}ぐ。" },
    { id: 7, grade: 3, kanji: "農", yomi: "のう", sentence: "{{農[のう]}}家[か]が米[こめ]を育[そだ]てる。" },
    { id: 8, grade: 3, kanji: "習", yomi: "なら", sentence: "新[あたら]しい歌[うた]を{{習[なら]}}う。" },
    { id: 9, grade: 3, kanji: "旅", yomi: "たび", sentence: "家族[かぞく]で{{旅[たび]}}に出[で]る。" },
    { id: 10, grade: 3, kanji: "深", yomi: "ふか", sentence: "森[もり]の{{深[ふか]}}い所[ところ]へ行[い]く。" },
    { id: 11, grade: 3, kanji: "薬", yomi: "くすり", sentence: "食後[しょくご]に{{薬[くすり]}}を飲[の]む。" },
    { id: 12, grade: 3, kanji: "球", yomi: "きゅう", sentence: "地[ち]{{球[きゅう]}}の形[かたち]を調[しら]べる。" },
  ];

  let defaults;
  let state;
  let dragKey = null;
  let accessToken = "";
  let googleClientId = "";
  let syncTimer = null;
  let panelScroll = 0;
  let orderScroll = 0;

  function visitorId() {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id = (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`).replace(/-/g, "").slice(0, 12);
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  }

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved && Array.isArray(saved.data)) {
        const migrated = { ...defaults, ...saved };
        if (!Array.isArray(saved.writeKanjis)) {
          const oldOrder = Array.isArray(saved.order) ? saved.order : [];
          migrated.writeKanjis = oldOrder.filter((_, i) => i % 2 === 0);
          migrated.readKanjis = oldOrder.filter((_, i) => i % 2 === 1);
          migrated.order = oldOrder.map((kanji, i) => `${i % 2 === 0 ? "write" : "read"}:${kanji}`);
        }
        if (String(migrated.lastLoaded || "").startsWith("サンプルデータ")) migrated.data = SAMPLE_DATA;
        return migrated;
      }
    } catch (_) {}
    return structuredClone(defaults);
  }
  function saveState() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {}
  }
  function esc(value) {
    return String(value).replace(/[&<>'"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[c]));
  }
  function uniqueKanjis() {
    const map = new Map();
    state.data.filter((r) => r.grade === Number(state.quizGrade)).forEach((r) => {
      if (!map.has(r.kanji)) map.set(r.kanji, []);
      map.get(r.kanji).push(r);
    });
    return map;
  }
  function selectedItems() {
    const groups = uniqueKanjis();
    return state.order.map((key) => {
      const [type, kanji] = key.split(":");
      const rows = groups.get(kanji) || [];
      const chosenId = String(state.choices[key] || "");
      const row = rows.find((r) => String(r.id) === chosenId) || rows[0];
      return row ? { key, type, row } : null;
    }).filter(Boolean).slice(0, MAX_QUESTIONS);
  }

  function parseSentence(sentence) {
    const out = [];
    const regex = /\{\{([^\[\]{}]+)\[([^\[\]{}]+)\]\}\}|([^\[\]{}]+)\[([^\[\]{}]+)\]/g;
    let last = 0, match;
    while ((match = regex.exec(sentence))) {
      if (match.index > last) out.push({ type: "text", text: sentence.slice(last, match.index) });
      if (match[1]) out.push({ type: "target", text: match[1], reading: match[2] });
      else out.push({ type: "ruby", text: match[3], reading: match[4] });
      last = regex.lastIndex;
    }
    if (last < sentence.length) out.push({ type: "text", text: sentence.slice(last) });
    return out;
  }
  function canShow(word) {
    if (Number(state.displayGrade) === 0) return false;
    const chars = [...word].filter((c) => KANJI.test(c));
    return chars.length > 0 && chars.every((c) => gradeOf.has(c) && gradeOf.get(c) <= Number(state.displayGrade));
  }
  function renderSentence(row, qMode, answer) {
    return parseSentence(row.sentence).map((token) => {
      if (token.type === "text") return esc(token.text);
      if (token.type === "ruby") return esc(canShow(token.text) ? token.text : token.reading);
      if (qMode === "write") return `<span class="answer-box${answer ? " is-answer" : ""}">${answer ? esc(row.kanji) : ""}</span>`;
      return `<ruby class="reading-target"><span>${esc(row.kanji)}</span>${answer ? `<rt>${esc(row.yomi)}</rt>` : ""}</ruby>`;
    }).join("");
  }

  function renderApp(message) {
    const root = document.getElementById("kanji-app");
    panelScroll = document.querySelector(".control-panel")?.scrollTop ?? panelScroll;
    orderScroll = document.querySelector(".order-list")?.scrollTop ?? orderScroll;
    const groups = uniqueKanjis();
    const items = selectedItems();
    const gradeOptions = [...Array(6)].map((_, i) => `<option value="${i + 1}" ${Number(state.quizGrade) === i + 1 ? "selected" : ""}>${i + 1}年生</option>`).join("");
    const displayOptions = [`<option value="0" ${Number(state.displayGrade) === 0 ? "selected" : ""}>すべてひらがな</option>`]
      .concat([...Array(6)].map((_, i) => `<option value="${i + 1}" ${Number(state.displayGrade) === i + 1 ? "selected" : ""}>${i + 1}年生まで</option>`)).join("");
    const gridFor = (type) => [...groups.entries()].map(([kanji, entries]) => {
      const checked = state.order.includes(`${type}:${kanji}`);
      return `<label class="kanji-choice ${checked ? "checked" : ""}">
        <input type="checkbox" data-kanji="${esc(kanji)}" data-question-type="${type}" ${checked ? "checked" : ""}>
        <span class="kanji-glyph">${esc(kanji)}</span><span class="kanji-yomi">${esc(entries[0].yomi)}</span>
      </label>`;
    }).join("") || `<div class="empty-small">この学年のデータはありません</div>`;
    const orderItems = items.map((item, index) => {
      const { row, type, key } = item;
      const variants = groups.get(row.kanji) || [];
      return `<li class="order-item" draggable="true" data-order-key="${esc(key)}">
        <span class="drag" aria-hidden="true">⠿</span><b>${index + 1}</b><span class="type-chip ${type}">${type === "write" ? "書" : "読"}</span><span class="order-kanji">${esc(row.kanji)}</span>
        ${variants.length > 1 ? `<select class="sentence-select" data-choice="${esc(key)}" aria-label="${esc(row.kanji)}の例文">${variants.map((v) => `<option value="${esc(v.id)}" ${String(v.id) === String(row.id) ? "selected" : ""}>${esc(stripNotation(v.sentence)).slice(0, 18)}</option>`).join("")}</select>` : `<span class="sentence-snippet">${esc(stripNotation(row.sentence))}</span>`}
        <span class="move-buttons"><button data-move="up" data-index="${index}" aria-label="上へ">↑</button><button data-move="down" data-index="${index}" aria-label="下へ">↓</button></span>
      </li>`;
    }).join("");
    const density = items.length > 15 ? "dense" : items.length > 10 ? "compact" : "standard";
    const sheetConnected = Boolean(state.sheetId);

    root.innerHTML = `<div class="app-shell">
      <header class="topbar">
        <div class="brand"><span class="brand-mark">字</span><div><p>先生のプリントづくり</p><h1>漢字こつこつ</h1></div></div>
        <div class="top-actions"><span class="saved-status">● 自動保存</span><button class="print-button" id="printButton"><span>▣</span> 印刷・PDF保存</button></div>
      </header>
      <div class="workspace">
        <aside class="control-panel">
          <section class="panel-section data-section">
            <div class="section-heading"><span class="step">1</span><div><h2>例文データ</h2><p>Googleスプレッドシートと自動同期</p></div></div>
            <button class="google-sheet-button" id="googleSheetButton"><span>G</span><b>${sheetConnected ? "Googleに接続して同期" : "専用スプレッドシートを作成"}</b><small>${sheetConnected ? "編集内容を今すぐ反映します" : "あなたのGoogleドライブに作成します"}</small></button>
            ${sheetConnected ? `<div class="sheet-actions"><a href="${esc(state.sheetUrl)}" target="_blank" rel="noopener">スプレッドシートを開く ↗</a><span>30秒ごとに自動同期</span></div>` : ""}
            <details class="legacy-source"><summary>公開CSV・GAS URLを使う</summary><div class="url-row"><input id="dataUrl" type="url" placeholder="https://..." value="${esc(state.url)}"><button id="loadButton">読み込む</button></div></details>
            <div class="load-status ${message && message.type === "error" ? "error" : ""}"><span>${message?.type === "error" ? "!" : "✓"}</span><div>${message ? esc(message.text) : `${state.data.length}件の例文を利用できます`}<small>最終取得：${esc(state.lastLoaded || "未取得")}</small></div></div>
          </section>
          <section class="panel-section">
            <div class="section-heading"><span class="step">2</span><h2>出題の設定</h2></div>
            <label class="field"><span>小テストに表示する漢字は何年生までか</span><select id="displayGrade">${displayOptions}</select></label>
            <label class="field"><span>テストのタイトル</span><input id="quizTitle" maxlength="30" value="${esc(state.title)}"></label>
          </section>
          <section class="panel-section grow">
            <div class="list-heading"><div class="section-heading"><span class="step">3</span><h2>漢字を選ぶ</h2></div><span class="count-badge">${items.length} / ${MAX_QUESTIONS}問</span></div>
            <label class="field inline-grade"><span>(1) 出題する学年</span><select id="quizGrade">${gradeOptions}</select></label>
            <div class="question-picker"><div class="picker-heading"><b>(2)-1 書き問題を出題</b><span>${state.writeKanjis.length}問</span></div><div class="kanji-grid">${gridFor("write")}</div></div>
            <div class="question-picker read-picker"><div class="picker-heading"><b>(2)-2 読み問題を出題</b><span>${state.readKanjis.length}問</span></div><div class="kanji-grid">${gridFor("read")}</div></div>
            <button class="clear-selection" id="clearAll">選択をすべて解除</button>
          </section>
          <section class="panel-section order-section">
            <div class="section-heading"><span class="step">4</span><div><h2>順番・例文</h2><p>つかんで並べ替え</p></div></div>
            <ol class="order-list">${orderItems || `<li class="empty-small">漢字を選ぶとここに並びます</li>`}</ol>
          </section>
        </aside>
        <section class="preview-pane">
          <div class="preview-toolbar"><div class="tabs"><button data-tab="question" class="${state.activeTab === "question" ? "active" : ""}">問題用紙</button><button data-tab="answer" class="${state.activeTab === "answer" ? "active" : ""}">模範解答</button></div><div class="paper-note">A4 横・1ページ</div></div>
          <div class="paper-wrap"><article class="test-paper ${density} ${state.activeTab === "answer" ? "answer-sheet" : ""}">
            ${state.activeTab === "answer" ? `<div class="answer-ribbon">模範解答</div>` : ""}
            <header class="paper-header"><h2>${esc(state.title || "かん字 小テスト")}</h2><div class="student-fields"><span><b>年</b></span><span><b>組</b></span><span><b>番号</b></span><span class="name-field"><b>名前</b></span></div></header>
            <div class="paper-rule"></div>
            <div class="questions ${items.length ? "" : "empty-preview"}">${items.length ? items.map((item, i) => `<div class="question-column"><span class="question-no">${i + 1}</span><p>${renderSentence(item.row, item.type, state.activeTab === "answer")}</p><span class="mode-label">${item.type === "write" ? "書" : "読"}</span></div>`).join("") : `<div><span class="empty-mark">字</span><h3>漢字を選ぶと、ここに問題が並びます</h3><p>左の一覧から出題したい漢字を選んでください。</p></div>`}</div>
            <footer class="paper-footer"><span>${items.length}問</span><span>こつこつ がんばろう</span></footer>
          </article></div>
        </section>
      </div>
    </div>`;
    bindEvents();
    requestAnimationFrame(() => {
      const panel = document.querySelector(".control-panel"); if (panel) panel.scrollTop = panelScroll;
      const list = document.querySelector(".order-list"); if (list) list.scrollTop = orderScroll;
    });
    saveState();
  }

  function stripNotation(text) { return text.replace(/\{\{([^\[]+)\[([^\]]+)\]\}\}/g, "$1").replace(/([^\[{}]+)\[([^\]]+)\]/g, "$1"); }
  function setAndRender(key, value) { state[key] = value; renderApp(); }

  function bindEvents() {
    document.getElementById("displayGrade").onchange = (e) => setAndRender("displayGrade", Number(e.target.value));
    document.getElementById("quizGrade").onchange = (e) => {
      state.quizGrade = Number(e.target.value); state.order = []; state.writeKanjis = []; state.readKanjis = []; state.choices = {}; renderApp();
    };
    document.getElementById("quizTitle").oninput = (e) => { state.title = e.target.value; document.querySelector(".paper-header h2").textContent = state.title || "かん字 小テスト"; saveState(); };
    document.getElementById("dataUrl").oninput = (e) => { state.url = e.target.value; saveState(); };
    document.getElementById("loadButton").onclick = loadRemote;
    document.getElementById("googleSheetButton").onclick = handleGoogleSheet;
    document.getElementById("printButton").onclick = () => window.print();
    document.querySelectorAll("[data-tab]").forEach((b) => b.onclick = () => setAndRender("activeTab", b.dataset.tab));
    document.querySelectorAll("[data-kanji]").forEach((box) => box.onchange = () => toggleKanji(box.dataset.questionType, box.dataset.kanji, box.checked));
    document.getElementById("clearAll").onclick = () => { state.order = []; state.writeKanjis = []; state.readKanjis = []; state.choices = {}; renderApp(); };
    document.querySelectorAll("[data-choice]").forEach((select) => select.onchange = () => { state.choices[select.dataset.choice] = select.value; renderApp(); });
    document.querySelectorAll("[data-move]").forEach((b) => b.onclick = () => moveItem(Number(b.dataset.index), b.dataset.move === "up" ? -1 : 1));
    document.querySelectorAll("[data-order-key]").forEach((item) => {
      item.ondragstart = () => { dragKey = item.dataset.orderKey; item.classList.add("dragging"); };
      item.ondragend = () => item.classList.remove("dragging");
      item.ondragover = (e) => e.preventDefault();
      item.ondrop = (e) => { e.preventDefault(); reorder(dragKey, item.dataset.orderKey); };
    });
  }

  function toggleKanji(type, kanji, checked) {
    const key = `${type}:${kanji}`;
    const list = type === "write" ? state.writeKanjis : state.readKanjis;
    if (checked && !state.order.includes(key)) {
      if (state.order.length >= MAX_QUESTIONS) return renderApp({ type: "error", text: "問題は最大20問までです" });
      list.push(kanji); state.order.push(key);
    } else if (!checked) {
      state.order = state.order.filter((k) => k !== key);
      const index = list.indexOf(kanji); if (index >= 0) list.splice(index, 1);
      delete state.choices[key];
    }
    renderApp();
  }
  function moveItem(index, delta) {
    const next = index + delta; if (next < 0 || next >= state.order.length) return;
    [state.order[index], state.order[next]] = [state.order[next], state.order[index]]; renderApp();
  }
  function reorder(from, to) {
    if (!from || from === to) return; const next = state.order.filter((k) => k !== from); next.splice(next.indexOf(to), 0, from); state.order = next; renderApp();
  }

  async function loadRemote() {
    const url = state.url.trim();
    if (!url) return renderApp({ type: "error", text: "公開URLを入力してください" });
    if (!/^https:\/\//i.test(url)) return renderApp({ type: "error", text: "HTTPSの公開URLを入力してください" });
    if (/docs\.google\.com\/spreadsheets\/d\/[^/]+\/edit/i.test(url)) return renderApp({ type: "error", text: "編集用URLではなく「ウェブに公開」のCSV URLを使用してください" });
    const button = document.getElementById("loadButton"); button.disabled = true; button.textContent = "読込中…";
    try {
      const res = await fetch(url, { mode: "cors", cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const type = res.headers.get("content-type") || "";
      const raw = type.includes("json") || /\/exec(?:\?|$)/.test(url) ? await res.json() : parseCSV(await res.text());
      const source = Array.isArray(raw) ? raw : raw.data;
      if (!Array.isArray(source)) throw new Error("配列形式のデータが見つかりません");
      const result = validateRows(source);
      if (!result.valid.length) throw new Error(result.errors[0] || "有効な行がありません");
      state.data = result.valid; state.quizGrade = result.valid[0].grade; state.order = []; state.writeKanjis = []; state.readKanjis = []; state.choices = {};
      state.lastLoaded = new Intl.DateTimeFormat("ja-JP", { dateStyle: "short", timeStyle: "short" }).format(new Date());
      renderApp({ type: result.errors.length ? "error" : "success", text: `${result.valid.length}件を読み込みました${result.errors.length ? `（${result.errors.length}件を除外）` : ""}` });
    } catch (err) { renderApp({ type: "error", text: `読み込めませんでした。既存データを保持しています（${err.message}）` }); }
  }
  function parseCSV(text) {
    const rows = []; let row = [], field = "", quote = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (quote && c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') quote = !quote;
      else if (c === "," && !quote) { row.push(field); field = ""; }
      else if ((c === "\n" || c === "\r") && !quote) { if (c === "\r" && text[i + 1] === "\n") i++; row.push(field); if (row.some(Boolean)) rows.push(row); row = []; field = ""; }
      else field += c;
    }
    row.push(field); if (row.some(Boolean)) rows.push(row);
    const headers = (rows.shift() || []).map((h) => h.trim().replace(/^\uFEFF/, ""));
    return rows.map((values) => Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""])));
  }
  function validateRows(rows) {
    const valid = [], errors = [], ids = new Set();
    rows.forEach((raw, i) => {
      const r = { id: raw.id, grade: Number(raw.grade), kanji: String(raw.kanji || "").trim(), yomi: String(raw.yomi || "").trim(), sentence: String(raw.sentence || "").trim() };
      let reason = "";
      if (r.id === undefined || r.id === "" || !r.kanji || !r.yomi || !r.sentence) reason = "必須項目が不足";
      else if (ids.has(String(r.id))) reason = "idが重複";
      else if (!Number.isInteger(r.grade) || r.grade < 1 || r.grade > 6) reason = "gradeは1〜6";
      else if ([...r.kanji].length !== 1 || !KANJI.test(r.kanji)) reason = "kanjiは漢字1文字";
      else if (!HIRAGANA.test(r.yomi)) reason = "yomiはひらがな";
      else {
        const targets = [...r.sentence.matchAll(/\{\{([^\[\]{}]+)\[([^\[\]{}]+)\]\}\}/g)];
        if (targets.length !== 1) reason = "対象マーカーは1つ必要";
        else if (targets[0][1] !== r.kanji || targets[0][2] !== r.yomi) reason = "対象マーカーとkanji・yomiが不一致";
      }
      if (reason) errors.push(`${i + 2}行目: ${reason}`); else { ids.add(String(r.id)); valid.push(r); }
    });
    return { valid, errors };
  }

  function nowLabel() {
    return new Intl.DateTimeFormat("ja-JP", { dateStyle: "short", timeStyle: "short" }).format(new Date());
  }

  function buildSampleData(readings) {
    let id = 1;
    return Object.entries(GRADE_KANJI).flatMap(([grade, chars]) => [...chars].map((kanji) => {
      const yomi = readings[kanji];
      return { id: id++, grade: Number(grade), kanji, yomi, sentence: `「${yomi}」と読[よ]む{{${kanji}[${yomi}]}}を練習[れんしゅう]する。` };
    }));
  }

  function waitForGoogleIdentity() {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const check = () => {
        if (window.google?.accounts?.oauth2) return resolve();
        if (++attempts > 50) return reject(new Error("Googleログインを読み込めませんでした"));
        setTimeout(check, 100);
      };
      check();
    });
  }

  async function authorizeGoogle() {
    const clientId = await getGoogleClientId();
    if (!clientId) throw new Error("Google OAuthクライアントIDが未設定です");
    await waitForGoogleIdentity();
    return new Promise((resolve, reject) => {
      const client = google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: "https://www.googleapis.com/auth/drive.file",
        callback: (response) => {
          if (response.error) return reject(new Error(response.error_description || response.error));
          accessToken = response.access_token;
          resolve(accessToken);
        },
        error_callback: (error) => reject(new Error(error.message || error.type || "Googleログインを完了できませんでした")),
      });
      client.requestAccessToken({ prompt: accessToken ? "" : "consent" });
    });
  }

  async function getGoogleClientId() {
    if (googleClientId) return googleClientId;
    const embedded = document.querySelector('meta[name="google-oauth-client-id"]')?.content?.trim();
    if (embedded) return googleClientId = embedded;
    const response = await fetch("/api/config", { cache: "no-store" });
    if (!response.ok) throw new Error("Google連携の設定を取得できませんでした");
    const config = await response.json();
    googleClientId = String(config.googleOAuthClientId || "").trim();
    return googleClientId;
  }

  async function googleFetch(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}`, ...(options.headers || {}) },
    });
    if (response.status === 401) accessToken = "";
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error?.message || `Google API HTTP ${response.status}`);
    }
    return response.json();
  }

  async function createPersonalSheet() {
    const created = await googleFetch("https://sheets.googleapis.com/v4/spreadsheets", {
      method: "POST",
      body: JSON.stringify({
        properties: { title: `漢字こつこつ 例文データ ${visitorId()}`, locale: "ja_JP" },
        sheets: [{ properties: { title: "例文データ", gridProperties: { rowCount: 1100, columnCount: 5, frozenRowCount: 1 } } }],
      }),
    });
    const values = [["id", "grade", "kanji", "yomi", "sentence"], ...SAMPLE_DATA.map((row) => [row.id, row.grade, row.kanji, row.yomi, row.sentence])];
    await googleFetch(`https://sheets.googleapis.com/v4/spreadsheets/${created.spreadsheetId}/values/${encodeURIComponent("例文データ!A1:E1027")}?valueInputOption=RAW`, {
      method: "PUT", body: JSON.stringify({ range: "例文データ!A1:E1027", majorDimension: "ROWS", values }),
    });
    state.sheetId = created.spreadsheetId;
    state.sheetUrl = created.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${created.spreadsheetId}/edit`;
    state.lastLoaded = `${nowLabel()}（Googleスプレッドシート作成）`;
    saveState();
  }

  async function syncFromSheet({ silent = false } = {}) {
    if (!state.sheetId || !accessToken) return;
    try {
      const result = await googleFetch(`https://sheets.googleapis.com/v4/spreadsheets/${state.sheetId}/values/${encodeURIComponent("例文データ!A:E")}`);
      const [headers = [], ...values] = result.values || [];
      const rows = values.map((cells) => Object.fromEntries(headers.map((header, i) => [header, cells[i] ?? ""])));
      const checked = validateRows(rows);
      if (!checked.valid.length) throw new Error(checked.errors[0] || "有効な例文がありません");
      state.data = checked.valid;
      const available = new Set(checked.valid.filter((row) => row.grade === Number(state.quizGrade)).map((row) => row.kanji));
      state.writeKanjis = state.writeKanjis.filter((kanji) => available.has(kanji));
      state.readKanjis = state.readKanjis.filter((kanji) => available.has(kanji));
      state.order = state.order.filter((key) => available.has(key.split(":")[1]));
      state.lastLoaded = `${nowLabel()}（Google同期）`;
      renderApp(silent ? undefined : { type: checked.errors.length ? "error" : "success", text: `${checked.valid.length}件を同期しました${checked.errors.length ? `（${checked.errors.length}件を除外）` : ""}` });
    } catch (error) {
      renderApp({ type: "error", text: `同期できませんでした。既存データを保持しています（${error.message}）` });
    }
  }

  function startSyncTimer() {
    clearInterval(syncTimer);
    syncTimer = setInterval(() => syncFromSheet({ silent: true }), 30000);
  }

  async function handleGoogleSheet() {
    const button = document.getElementById("googleSheetButton");
    button.disabled = true;
    try {
      await authorizeGoogle();
      if (!state.sheetId) {
        await createPersonalSheet();
        window.open(state.sheetUrl, "_blank", "noopener");
      }
      await syncFromSheet();
      startSyncTimer();
    } catch (error) {
      renderApp({ type: "error", text: `Googleスプレッドシートを利用できません（${error.message}）` });
    }
  }

  async function init() {
    try {
      const response = await fetch("/kanji-readings.json", { cache: "force-cache" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const readings = await response.json();
      SAMPLE_DATA = buildSampleData(readings);
    } catch (error) {
      console.error("1026字サンプルを読み込めませんでした", error);
    }
    const gradeOne = [...GRADE_KANJI[1]];
    defaults = {
      url: "", displayGrade: 2, quizGrade: 1, title: "かん字 小テスト", activeTab: "question",
      data: SAMPLE_DATA, writeKanjis: gradeOne.slice(0, 5), readKanjis: gradeOne.slice(5, 10), choices: {},
      order: [...gradeOne.slice(0, 5).map((kanji) => `write:${kanji}`), ...gradeOne.slice(5, 10).map((kanji) => `read:${kanji}`)],
      sheetId: "", sheetUrl: "", lastLoaded: `サンプルデータ（${SAMPLE_DATA.length}件）`,
    };
    state = loadState();
    state.writeKanjis ||= [];
    state.readKanjis ||= [];
    state.order ||= [];
    state.choices ||= {};
    renderApp();
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible" && accessToken && state.sheetId) syncFromSheet({ silent: true });
    });
  }

  init();
})();
