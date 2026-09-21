# 麥寮高中 3D 校園導覽

這是一個純靜態互動網站，可放在 GitHub Pages，讓其他人以瀏覽器操作。建築輪廓、樓高與步行路線為示意，並非校方正式導覽或即時導航。

## 發布到 GitHub Pages

1. 在 GitHub 建立新的公開 repository。
2. 將這個資料夾內的**所有檔案和資料夾**上傳到 repository 根目錄。`index.html` 必須位於根目錄；請保留 `assets/`、`vendor/` 和隱藏檔 `.nojekyll`。
3. 開啟 repository 的 **Settings → Pages**。在 **Build and deployment** 中選擇 **Deploy from a branch**，Branch 選 **main**，Folder 選 **/(root)**，然後按 **Save**。
4. 發布完成後，網站網址通常為 `https://你的帳號.github.io/你的repository名稱/`。

直接打開 `index.html` 可能因瀏覽器對本機 JavaScript 模組的限制而無法運作；請透過 GitHub Pages 或其他靜態網站伺服器瀏覽。

## 地圖資料與需求

- 校舍名稱與相對位置參考[麥寮高中 115 學年度校舍配置圖](https://mljh.ylc.edu.tw/News_Content.aspx?n=54641&s=388472&sms=37179)，並依空照圖調整中央集合廣場與群英樓輪廓。
- 校地邊界參考 [OpenStreetMap](https://www.openstreetmap.org/way/263998868)；衛星模式從 Esri World Imagery 即時載入影像，使用時需網路連線。
- 本站使用 MapLibre GL JS；授權資訊見 `vendor/LICENSE-maplibre.txt`。
