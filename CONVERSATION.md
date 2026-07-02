# 專案開發對話紀錄

本檔案記錄 global_weather 專案從需求確認、開發、除錯到部署上線的完整對話過程。使用者訊息為逐字保留（未修改內容），部分訊息附有截圖，因無法將圖片內嵌於本檔案，以 *(使用者附上截圖)* 標註。

---

### 1. 使用者

> # Project: global_weather
>
> ## 目標
> 建立一個氣象衛星雲圖網站，使用 React + Vite。
>
> ## 技術棧
> - React + Vite
> - Windy Map Forecast API（全球衛星雲圖）
> - CWA 中央氣象署 API（台灣一週天氣預報）
> - 部署：GitHub → Vercel
>
> ## 功能需求
> 1. 主畫面：Windy 互動地圖，預設圖層為衛星雲圖（satellite），預設中心點台灣（lat: 23.5, lon: 121, zoom: 5）
> 2. 當使用者縮放地圖到 zoom >= 6 時，地圖下方顯示台灣一週天氣預報面板
> 3. 預報面板顯示：日期、天氣描述（Wx）、高溫（MaxT）、低溫（MinT）、降雨機率（PoP12h）
> 4. 預設顯示臺中市的預報
>
> ## 環境變數（.env）
> VITE_WINDY_API_KEY=（使用者自填）
> VITE_CWA_API_KEY=（使用者自填）
>
> ## CWA API
> - Endpoint: https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-D0047-091
> - 參數: Authorization={VITE_CWA_API_KEY}&locationName=臺中市&elementName=Wx,PoP12h,MaxT,MinT
>
> ## Windy API
> - Script src: https://api.windy.com/assets/map-forecast/libBoot.js
> - 用 useEffect 動態插入 script tag
> - 地圖容器 id 必須為 "windy"
> - 監聽 map zoomend 事件，zoom >= 6 時觸發顯示預報面板
>
> ## 專案結構
> src/
> ├── App.jsx
> ├── components/
> │   ├── WindyMap.jsx     # Windy 地圖元件
> │   └── ForecastPanel.jsx # 一週預報面板
> └── api/
>     └── cwa.js           # CWA fetch 函式
>
> ## 注意事項
> - .env 加入 .gitignore
> - 所有金鑰使用 import.meta.env.VITE_xxx 讀取，不得 hardcode
> - 不需要 RWD，一般桌面網站即可
> - 不需要額外 UI 套件，CSS 自己寫即可
>
> 請幫我按步驟來 我要確認是否有問題

### 2. Claude

檢視現有專案骨架後，提出兩個需要確認的疑慮：

1. **CWA API 資料集疑慮**：`F-D0047-091` 是「臺中市鄉鎮區一週預報」，`locationName` 應為行政區而非「臺中市」本身，直接查詢可能查不到資料。
2. **Windy API 初始化細節**：官方文件顯示 `libBoot.js` 之前需先載入 `Leaflet 1.4.0`，專案說明未提及，將會補上。

透過互動問題確認：

- **問題**：CWA 一週預報要抓哪個資料集/地點？
  **使用者回覆**：全台
- **問題**：這個資料夾還不是 git repository，且部署目標是 GitHub → Vercel，這次要不要順便執行 git init？
  **使用者回覆**：先不要，只寫程式碼

由於「全台」的範圍不明確，追加提問：

- **問題**：「全台」是指底層資料集改用涵蓋全部縣市的 F-D0047-089（畫面仍固定顯示臺中市），還是要加一個城市下拉選單讓使用者切換全台？
  **使用者回覆**：加城市下拉選單，可切換全台

確認方向後，建立專案（`npm install`、撰寫 `src/api/cwa.js`、`src/components/ForecastPanel.jsx`、`src/components/WindyMap.jsx`、`src/App.jsx`、`src/index.css`），並啟動本機預覽測試。測試中發現：Windy 地圖腳本載入正常（顯示官方 401 錯誤提示，證實串接邏輯無誤）；暫時將 zoom 設為 6 確認 ForecastPanel 正確顯示；CWA 請求出現 `net::ERR_FAILED`，經 `curl` 檢查後懷疑是 CORS 問題，但無法在沒有真實金鑰的情況下確認，因此先完成程式碼並提醒使用者填入金鑰後留意此風險。

---

### 3. 使用者

> 請確認金鑰

### 4. Claude

讀取 `.env` 確認兩把金鑰已填入。實際用真實金鑰測試 CWA API 後發現先前選用的 `F-D0047-089` 其實是錯誤的資料集（實際是「未來3天逐時預報」，欄位結構完全不同），進一步測試確認正確資料集其實是原本規劃的 **`F-D0047-091`**（全台縣市未來1週逐12小時預報），並發現其查詢參數與回傳欄位皆為大寫開頭（`LocationName`、`ElementName` 等），因此重寫 `src/api/cwa.js` 對應正確結構。

測試結果：

- **CWA 金鑰 ✅ 正常**：F-D0047-091 資料解析正確，實測畫面顯示真實預報資料。
- **Windy 金鑰 ⚠️ 網域未授權**：金鑰格式正確，但 Windy 回傳 403「key is used from unauthorized domain」，需要使用者到 Windy API 後台把測試網域加入允許清單。

---

### 5. 使用者

> 到 Windy API 後台把 localhost 加入該金鑰的允許網域（部署後也要記得加上 Vercel 網域）這部分怎麼做

### 6. Claude

說明因為是使用者私人帳號後台，無法直接查看，提供一般性操作步驟：登入 [api.windy.com/keys](https://api.windy.com/keys) → 編輯對應金鑰 → 找到「Domains / Allowed domains」欄位 → 加入 `localhost`（本機）與之後部署的 Vercel 網域 → 存檔。並請使用者若介面不同可截圖確認。

---

### 7. 使用者

*(使用者附上截圖：Windy Edit 對話框，Domain restrictions = "localhost"，Project identification = "HW_temp")*
> 這樣對嗎?

### 8. Claude

確認設定正確，並補充：之後部署到 Vercel 後記得回來這個欄位用逗號分隔補上 Vercel 網域；Project identification 為必填欄位，填寫識別名稱即可，與網域白名單無關。請使用者存檔後告知，會再重新測試地圖。

---

### 9. 使用者

> saved

### 10. Claude

重新啟動本機預覽，確認 Windy 金鑰已通過網域驗證、地圖成功載入，但發現顯示的圖層看起來像風速/降雨而非衛星雲圖，著手進一步確認原因（此過程被使用者中斷）。

---

### 11. 使用者（中斷提問）

> 請問風速/降雨跟衛星雲圖可以替換嗎?

### 12. Claude

透過瀏覽器 console 直接查詢 `window.W.store.getAllowed('overlay')`，發現這把金鑰實際只被允許顯示 `wind`（風速）、`temp`（溫度）、`pressure`（氣壓）三種圖層，`satellite`（衛星雲圖）與 `rain`（降雨）皆不在允許清單內。結論：**這不是程式問題，是 Windy 帳號方案的限制**，衛星雲圖需要升級付費方案才能解鎖。

透過互動問題確認後續處理：

- **問題**：衛星雲圖需要升級 Windy 付費方案才能解鎖，現在想怎麼處理？
  **使用者回覆**：先改用 wind 圖層，之後再說

將 `src/components/WindyMap.jsx` 的 `store.set('overlay', 'satellite')` 改為 `'wind'`，驗證後確認整體進度：Windy 地圖 ✅、CWA 一週預報 ✅、衛星雲圖層 ⏸️（待方案升級）。

---

### 13. 使用者

> 不 我沒有要升級 這樣就可以了

### 14. Claude

確認維持 `wind` 圖層即可、不需升級 Windy 方案。目前功能皆已完成並實測通過（Windy 互動地圖、zoom ≥ 6 顯示預報面板並可切換全台縣市、CWA 資料正確解析顯示），詢問是否要接著執行 `npm run build` 確認正式建置。

---

### 15. 使用者

> npm run build
> 沒問題後再跟我說接下來要做啥

### 16. Claude

執行 `npm run build`，34 個模組正常打包完成，無錯誤。說明接下來可做的事：部署到 Vercel（需設定環境變數、Windy 網域白名單加上 Vercel 網域）、或先執行 `git init` 建立版本控制。詢問是否要協助 `git init` 並建立第一個 commit。

---

### 17. 使用者

> 可以git 到https://github.com/royruan1019/global_weather

### 18. Claude

確認遠端 repo 為空的可安全推送後，執行 `git init`、`git add -A`，準備 commit 時發現尚未設定 git 使用者身分，透過互動問題確認：

- **問題**：這個 repo 還沒設定 git 使用者身分（name/email），需要用什麼資訊作為 commit author？只會設在這個 repo 本地，不會改 global 設定。
  **使用者回覆**：royruan1019 / roy24862@gmail.com

設定本地 git 身分後完成 commit，並執行 `git branch -M main`、`git remote add origin`、`git push -u origin main`，成功推送到 [royruan1019/global_weather](https://github.com/royruan1019/global_weather)。說明接下來部署 Vercel 的步驟（Import repo、設定環境變數、部署後補 Windy 網域白名單），並詢問本機測試用的 `.claude/launch.json` 是否要保留在 repo 中。

---

### 19. 使用者

*(使用者附上截圖：Vercel Environment Variables 設定畫面，Key 欄位誤填成金鑰本身、Value 欄位空白)*
> Environment Variables這樣設定可以嗎?

### 20. Claude

指出 Key 與 Value 欄位填反了，說明正確對應應為 `VITE_WINDY_API_KEY` / `VITE_CWA_API_KEY` 作為 Key，實際金鑰字串填入 Value，並請使用者修正後再截圖確認一次。

---

### 21. 使用者

*(使用者附上修正後的截圖，未附文字)*

### 22. Claude

確認 Key 欄位名稱（`VITE_WINDY_API_KEY`、`VITE_CWA_API_KEY`）皆正確對應程式碼讀取的環境變數名稱。Value 欄位因遮罩無法從畫面確認內容，請使用者自行點開眼睛圖示核對是否與 `.env` 一致。並提醒部署完成後：取得 Vercel 網域、回 Windy 後台加入網域白名單、回報以便協助驗證正式環境。

---

### 23. 使用者

*(使用者附上截圖：Windy Domain restrictions 欄位填入 "localhost;https://global-weather-beta.vercel.app/")*
> 這樣嗎?

### 24. Claude

指出兩個問題：分隔符號應為逗號而非分號；網域格式只需填 hostname，不需要 `https://` 開頭與結尾的 `/`。提供正確格式範例：`localhost, global-weather-beta.vercel.app`。

---

### 25. 使用者

> Saved

### 26. Claude

以 `curl` 確認 Vercel 部署網址回應 HTTP 200、HTML 結構與 build 產出一致。說明正式環境的瀏覽器渲染與 API 行為無法由 Claude 直接驗證，請使用者自行打開網址檢查 Windy 地圖是否正常顯示、zoom ≥ 6 時預報面板是否正確出現，若有錯誤請截圖回報。

---

### 27. 使用者

> 以上流程幫我寫到github readme

### 28. Claude

建立 `README.md`，內容涵蓋技術棧、功能、專案結構、本機開發、Windy 金鑰網域白名單設定（含踩過的雷）、CWA API 正確用法（F-D0047-091 而非 089、大寫欄位格式）、Vercel 部署步驟（含 Key/Value 容易填反的提醒）。詢問是否要協助 commit 並 push。

---

### 29. 使用者

> commit

### 30. Claude

確認僅 `README.md` 為新增變更，執行 `git add` 與 `git commit`。

---

### 31. 使用者

> push

### 32. Claude

執行 `git push`，成功推送到 [royruan1019/global_weather](https://github.com/royruan1019/global_weather)。

---

### 33. 使用者

> 看到readme了，幫我調整一下， 給vercel網址讓使用者可以直接進入看，可以加個流程圖讓閱讀更明確，你覺得呢，你流程圖會怎麼做

### 34. Claude

建議使用 Mermaid 流程圖（GitHub 原生渲染，易於維護），提出畫「使用者操作 + 資料流」：開站 → 載入 Windy 地圖 → 判斷 zoom 是否 ≥ 6 → 顯示預報面板 → 選縣市 → 打 CWA API → 顯示結果。在 README 最上方加入 Vercel 線上體驗連結，並加入此流程圖，詢問是否要 commit + push。

---

### 35. 使用者

> push

### 36. Claude

commit 並 push 至 GitHub。

---

### 37. 使用者

> mermaid有問題:
> 1.不美觀
> 2.是想說明製作此專案規劃與流程

### 38. Claude

理解需求為呈現「專案規劃與開發流程」而非執行期資料流，改為分階段（① 規劃 ② 開發 ③ 除錯與調整 ④ 上線）並以 `classDef` 上色的流程圖，每個節點對應實際走過的步驟（含中途修正資料集、排除網域白名單問題等）。詢問是否要 push。

---

### 39. 使用者

> push 確認

### 40. Claude

commit 並 push。

---

### 41. 使用者

*(使用者附上截圖：直式流程圖版面過長)*
> mermaid版面太長 可以新增調整縮小版面嗎

### 42. Claude

將 `flowchart TD` 改為 `flowchart LR`（左右流向），四個階段變成橫向排列的欄以縮短垂直高度，詢問是否要 push。

---

### 43. 使用者

> push 確認

### 44. Claude

commit 並 push。

---

### 45. 使用者

*(使用者附上截圖：橫向流程圖因節點過多被縮得字體極小)*
> 太小了

### 46. Claude

說明 GitHub 會把整張圖等比縮放塞進欄寬，節點拆太細導致整體被縮小。改成每個階段只用一個節點呈現（濃縮成 4 個大方框），降低節點數量讓文字可讀。詢問是否要 push。

---

### 47. 使用者

> push 確認

### 48. Claude

commit 並 push。

---

### 49. 使用者

*(使用者附上截圖：4 個橫向節點仍然偏小)*
> 還是太小 有更好的方式嗎

### 50. Claude

說明 4 個節點橫向排一列寬度仍超過欄寬導致縮小，改為 **2×2 網格**（上排 2 個、下排 2 個節點），透過 `subgraph` 分兩行並隱藏 subgraph 邊框，將最大寬度減半以放大文字。詢問是否要 push。

---

### 51. 使用者

> push 確認

### 52. Claude

commit 並 push。

---

### 53. 使用者

> 以上內容幫我寫成MD檔含我的對話(不修改我的對話內容

*(本檔案 `CONVERSATION.md` 即為此請求的回應)*
