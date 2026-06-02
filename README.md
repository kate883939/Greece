# 希臘旅誌 Hellas — 網站使用說明

## 檔案結構

```
greece-site/
├── index.html              首頁（已完成）
├── css/style.css           全站樣式
├── js/main.js              互動功能 + 載入資料
├── data/                   ← 你之後主要會改這裡
│   ├── accommodations.json   住宿（含 Booking 連結）
│   ├── landmarks.json        著名景點
│   ├── restaurants.json      餐廳
│   └── tours.json            跟團行程（含預訂連結）
└── images/                 之後放你自己的照片
```

## 如何新增內容（不用改 HTML）

打開對應的 JSON 檔，複製一筆資料、改內容即可。例如新增一間住宿，
在 `data/accommodations.json` 裡加一段：

```json
{
  "name_zh": "旅館中文名",
  "name_en": "Hotel English Name",
  "region": "聖托里尼 Santorini",
  "location": "Oia",
  "rating": "實住推薦",
  "blurb": "一句話介紹這間旅館的特色。",
  "image": "圖片網址或 images/你的照片.jpg",
  "booking_url": "你的 Booking 聯盟連結"
}
```

存檔、重新部署，畫面就會自動更新。

## 換成自己的照片

1. 把照片放進 `images/` 資料夾
2. 在 JSON 裡把 `image` 的網址改成 `images/檔名.jpg`

## 放上 Booking.com 聯盟連結

1. 申請通過後，到 Booking 後台為每間旅館產生專屬連結
2. 貼到對應住宿的 `booking_url` 欄位

## 部署到 Vercel

1. 把整個 `greece-site` 資料夾上傳到 GitHub
2. Vercel 連結該 repo，Framework 選「Other」，直接 Deploy
3. 之後設定自訂網域即可

## 待補頁面

目前先完成首頁。下一步可做：
- athens.html / crete.html / santorini.html（地區頁）
- landmarks.html / restaurants.html / accommodations.html（集合頁）
- about.html（關於我們）

Nav 連結都已指向這些檔名，做好放進同層資料夾即可。

## 確定網域後，批次替換 tripick.com

確定網域（例如 myhellasguide.com）後，在專案根目錄執行：

```bash
# macOS / Linux
find . -name "*.html" -o -name "*.xml" -o -name "*.txt" | \
  xargs sed -i 's|https://tripick.com|https://你的網域.com|g'
```

或在 Cursor 用 Find & Replace（Cmd+Shift+H）：
- 搜尋：`https://tripick.com`
- 取代：`https://你的網域.com`
- 範圍：全部檔案

這樣 canonical、og:url、sitemap、robots.txt 全部一次更新。

## 上線後要做的事

1. 確定網域 → 批次替換 tripick.com
2. 部署到 Vercel（見下方步驟）
3. 到 Google Search Console 提交 sitemap：
   `https://你的網域.com/sitemap.xml`
4. 申請 Booking.com 聯盟，填入真實網址
5. 用 Google Rich Results Test 驗證 FAQ 結構化資料
