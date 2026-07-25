import fs from "node:fs";

const sourcePath = process.argv[2];
const destinationPath = process.argv[3] || "public/kanji-sample-data.json";
if (!sourcePath) throw new Error("Usage: node scripts/build-sample-data.mjs <kanjitest.json> [output]");

const gradeKanji = {
  1: "一右雨円王音下火花貝学気九休玉金空月犬見五口校左三山子四糸字耳七車手十出女小上森人水正生青夕石赤千川先早草足村大男竹中虫町天田土二日入年白八百文木本名目立力林六",
  2: "引羽雲園遠何科夏家歌画回会海絵外角楽活間丸岩顔汽記帰弓牛魚京強教近兄形計元言原戸古午後語工公広交光考行高黄合谷国黒今才細作算止市矢姉思紙寺自時室社弱首秋週春書少場色食心新親図数西声星晴切雪船線前組走多太体台地池知茶昼長鳥朝直通弟店点電刀冬当東答頭同道読内南肉馬売買麦半番父風分聞米歩母方北毎妹万明鳴毛門夜野友用曜来里理話",
  3: "悪安暗医委意育員院飲運泳駅央横屋温化荷界開階寒感漢館岸起期客究急級宮球去橋業曲局銀区苦具君係軽血決研県庫湖向幸港号根祭皿仕死使始指歯詩次事持式実写者主守取酒受州拾終習集住重宿所暑助昭消商章勝乗植申身神真深進世整昔全相送想息速族他打対待代第題炭短談着注柱丁帳調追定庭笛鉄転都度投豆島湯登等動童農波配倍箱畑発反坂板皮悲美鼻筆氷表秒病品負部服福物平返勉放味命面問役薬由油有遊予羊洋葉陽様落流旅両緑礼列練路和",
  4: "愛案以衣位茨印英栄媛塩岡億加果貨課芽賀改械害街各覚潟完官管関観願岐希季旗器機議求泣給挙漁共協鏡競極熊訓軍郡群径景芸欠結建健験固功好香候康佐差菜最埼材崎昨札刷察参産散残氏司試児治滋辞鹿失借種周祝順初松笑唱焼照城縄臣信井成省清静席積折節説浅戦選然争倉巣束側続卒孫帯隊達単置仲沖兆低底的典伝徒努灯働特徳栃奈梨熱念敗梅博阪飯飛必票標不夫付府阜富副兵別辺変便包法望牧末満未民無約勇要養浴利陸良料量輪類令冷例連老労録",
  5: "圧囲移因永営衛易益液演応往桜可仮価河過快解格確額刊幹慣眼紀基寄規喜技義逆久旧救居許境均禁句型経潔件険検限現減故個護効厚耕航鉱構興講告混査再災妻採際在財罪殺雑酸賛士支史志枝師資飼示似識質舎謝授修述術準序招証象賞条状常情織職制性政勢精製税責績接設絶祖素総造像増則測属率損貸態団断築貯張停提程適統堂銅導得毒独任燃能破犯判版比肥非費備評貧布婦武復複仏粉編弁保墓報豊防貿暴脈務夢迷綿輸余容略留領歴",
  6: "胃異遺域宇映延沿恩我灰拡革閣割株干巻看簡危机揮貴疑吸供胸郷勤筋系敬警劇激穴券絹権憲源厳己呼誤后孝皇紅降鋼刻穀骨困砂座済裁策冊蚕至私姿視詞誌磁射捨尺若樹収宗就衆従縦縮熟純処署諸除承将傷障蒸針仁垂推寸盛聖誠舌宣専泉洗染銭善奏窓創装層操蔵臓存尊退宅担探誕段暖値宙忠著庁頂腸潮賃痛敵展討党糖届難乳認納脳派拝背肺俳班晩否批秘俵腹奮並陛閉片補暮宝訪亡忘棒枚幕密盟模訳郵優預幼欲翌乱卵覧裏律臨朗論",
};

const fallbacks = {
  "分": ["わ", "お金[かね]を{{分[わ]}}ける。"],
  "里": ["さと", "{{里[さと]}}山[やま]を歩[ある]く。"],
  "畑": ["はたけ", "祖父[そふ]は{{畑[はたけ]}}で野菜[やさい]を育[そだ]てる。"],
  "茨": ["いばら", "庭[にわ]の{{茨[いばら]}}に気[き]をつける。"],
  "岡": ["おか", "{{岡[おか]}}の上[うえ]から町[まち]を見[み]る。"],
  "埼": ["さき", "武蔵[むさし]{{埼[さき]}}から海[うみ]を見[み]る。"],
  "栃": ["とち", "{{栃[とち]}}の木[き]の葉[は]を見[み]る。"],
  "阪": ["さか", "大{{阪[さか]}}へ電車[でんしゃ]で行[い]く。"],
  "阜": ["ふ", "岐[ぎ]{{阜[ふ]}}県[けん]を地図[ちず]で探[さが]す。"],
  "孝": ["こう", "{{孝[こう]}}太[た]くんと遊[あそ]ぶ。"],
  "兄": ["あに", "{{兄[あに]}}と公園[こうえん]で遊[あそ]ぶ。"],
  "姉": ["あね", "{{姉[あね]}}と買[か]い物[もの]に行[い]く。"],
  "決": ["き", "話[はな]し合[あ]って日[ひ]を{{決[き]}}める。"],
  "岐": ["き", "分[ぶん]{{岐[き]}}点[てん]で道[みち]を選[えら]ぶ。"],
  "臣": ["じん", "大{{臣[じん]}}の話[はなし]を聞[き]く。"],
  "選": ["えら", "好[す]きな色[いろ]を{{選[えら]}}ぶ。"],
  "達": ["だち", "友{{達[だち]}}と遊[あそ]ぶ。"],
  "奈": ["な", "{{奈[な]}}良[ら]の大仏[だいぶつ]を見学[けんがく]する。"],
  "河": ["かわ", "{{河[かわ]}}原[ら]で遊[あそ]ぶ。"],
  "接": ["つ", "枝[えだ]を{{接[つ]}}ぐ。"],
  "設": ["もう", "新[あたら]しい部屋[へや]を{{設[もう]}}ける。"],
  "貴": ["とうと", "{{貴[とうと]}}い命[いのち]を大切[たいせつ]にする。"],
  "己": ["おのれ", "{{己[おのれ]}}の力[ちから]を信[しん]じる。"],
};

const toHiragana = (value) => value.replace(/[ァ-ヶ]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0x60));
const normalize = (value) => toHiragana(String(value || "").replace(/[・.]/g, "").replace(/[()]/g, ""));
const isKanji = (char) => /[\u3400-\u9fff々]/.test(char);

const entries = new Map(JSON.parse(fs.readFileSync(sourcePath, "utf8")).map((entry) => [entry.kanji, entry]));
const candidates = new Map([...entries.values()].map((entry) => {
  const readings = [...(entry.kun || []), ...(entry.on || [])].map(normalize).filter(Boolean);
  // The source lists dictionary forms (e.g. やすむ), while an example can
  // contain an inflected spelling (休める). Prefixes let the following kana
  // consume the inflection and preserve the ruby for just the kanji.
  const variants = readings.flatMap((reading) => [...Array(reading.length)].map((_, index) => reading.slice(0, index + 1)));
  return [entry.kanji, [...new Set(variants)].sort((a, b) => b.length - a.length)];
}));

function alignWord(word, reading) {
  const chars = [...word];
  const kana = normalize(reading);
  const memo = new Map();
  function walk(index, readingIndex) {
    const key = `${index}:${readingIndex}`;
    if (memo.has(key)) return memo.get(key);
    if (index === chars.length) return readingIndex === kana.length ? [] : null;
    const char = chars[index];
    const options = isKanji(char) ? candidates.get(char) || [] : [normalize(char)];
    for (const option of options) {
      if (!kana.startsWith(option, readingIndex)) continue;
      const tail = walk(index + 1, readingIndex + option.length);
      if (tail) return [option, ...tail];
    }
    memo.set(key, null);
    return null;
  }
  return walk(0, 0);
}

function markWord(word, readings, target, targetReading) {
  return [...word].map((char, index) => {
    if (!isKanji(char)) return char;
    const reading = readings[index];
    return char === target && reading === targetReading ? `{{${char}[${reading}]}}` : `${char}[${reading}]`;
  }).join("");
}

function selectExample(entry) {
  const kun = (entry.kun || []).map(normalize);
  const scored = (entry.examples || []).map((example, index) => {
    const readings = alignWord(example.word, example.reading);
    if (!readings) return null;
    const position = [...example.word].indexOf(entry.kanji);
    if (position < 0) return null;
    const reading = readings[position];
    if (!reading) return null;
    return { example, readings, reading, score: (kun.some((value) => value.startsWith(reading)) ? 100 : 0) + (example.sentence?.includes(example.word) ? 10 : 0) - index };
  }).filter(Boolean).sort((a, b) => b.score - a.score);
  return scored[0] || null;
}

const rows = [];
for (const [grade, chars] of Object.entries(gradeKanji)) {
  let id = 1;
  for (const kanji of chars) {
    const entry = entries.get(kanji);
    const chosen = entry && selectExample(entry);
    if (chosen) {
      const marked = markWord(chosen.example.word, chosen.readings, kanji, chosen.reading);
      // Some source entries provide a vocabulary example but not a full
      // sentence (or use a numeral variant in the sentence). Keep the
      // reading exact and use a classroom-natural fallback in that case.
      const sentence = chosen.example.sentence?.includes(chosen.example.word)
        ? chosen.example.sentence.replace(chosen.example.word, marked)
        : `「${marked}」という言葉[ことば]を覚[おぼ]える。`;
      rows.push({ id: id++, grade: Number(grade), kanji, yomi: chosen.reading, sentence });
    } else if (fallbacks[kanji]) {
      const [yomi, sentence] = fallbacks[kanji];
      rows.push({ id: id++, grade: Number(grade), kanji, yomi, sentence });
    } else {
      throw new Error(`No example found for ${kanji}`);
    }
  }
}

fs.writeFileSync(destinationPath, `${JSON.stringify(rows)}\n`);
console.log(`Wrote ${rows.length} rows to ${destinationPath}`);
