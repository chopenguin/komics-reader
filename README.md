<img src="assets/icon.svg" width="64" height="64" alt="">

# 小漫畫書房

一個純靜態的漫畫閱讀器，專門用來收藏與閱讀社群上的小漫畫。支援**作品分類**、**中文標題**、單頁／連續捲動兩種閱讀模式，並會記住每部作品的閱讀進度。

Created in [T3 Code](https://t3.codes).

## 功能

- 📚 書架依分類篩選，可搜尋標題、作者、標籤
- 📖 單頁模式下可用按鈕、方向鍵或手機滑動翻頁
- 🖼️ 三種縮放：適合視窗 / 適合寬度 / 適合高度
- ↕️ 連續捲動模式，一次看完所有頁
- 💾 自動記錄閱讀進度（localStorage），回到書架會顯示「讀到第 N 頁」
- 📱 響應式設計，手機也能看

## 在本機預覽

因為是純靜態網站，直接用瀏覽器打開 `index.html` 即可；若想模擬 GitHub Pages：

```bash
python3 -m http.server 8000
# 打開 http://localhost:8000
```

## 新增一部漫畫

1. 把圖片放進一個新資料夾，例如 `my_work/01.jpg`、`my_work/02.jpg` …
2. 編輯 [`assets/data.js`](assets/data.js)：
   - 在 `CATEGORIES` 增加分類（若需要的話）
   - 複製 `WORKS` 裡的物件，填入 `id`、`title`（中文標題）、`originalTitle`、`author`、`category`、`description`、`pages`（圖片路徑陣列）
3. 重新整理頁面即可，不需要任何建置步驟。

> 分類只會顯示「至少有作品」的類別，所以可以先在 `CATEGORIES` 定義好，之後慢慢補作品。

## 部署到 GitHub Pages

1. 把這個資料夾的內容推送到你的 GitHub repository（`main` 分支）
2. 到 repository 的 **Settings → Pages**
3. **Build and deployment** 設定：
   - Source: `Deploy from a branch`
   - Branch: `main` / `/(root)`
4. 儲存後等待部署完成，網址會是 `https://<你的帳號>.github.io/<repo名稱>/`

網站使用相對路徑與 hash routing（`#/read/...`），放在任何子路徑下都能正常運作。`.nojekyll` 已加入，可避免 Jekyll 干擾靜態檔案。
