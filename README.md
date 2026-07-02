# global_weather

氣象衛星雲圖網站，主畫面為 Windy 互動地圖，縮放到一定程度後顯示台灣一週天氣預報面板。

## 技術棧

- React + Vite
- [Windy Map Forecast API](https://api.windy.com/map-forecast/docs)（互動地圖）
- [中央氣象署開放資料 CWA API](https://opendata.cwa.gov.tw/)（一週天氣預報）
- 部署：GitHub → Vercel

## 功能

1. Windy 互動地圖，預設中心點台灣（lat: 23.5, lon: 121, zoom: 5）
2. 地圖縮放到 zoom ≥ 6 時，下方顯示一週天氣預報面板
3. 預報面板可用下拉選單切換全台 22 縣市，預設顯示臺中市
4. 預報內容：時間、天氣描述、高溫、低溫、降雨機率（12 小時）

## 專案結構

```
src/
├── App.jsx                    # 管理 zoom state，決定是否顯示預報面板
├── components/
│   ├── WindyMap.jsx           # Windy 地圖元件（動態載入 Leaflet + libBoot.js）
│   └── ForecastPanel.jsx      # 一週預報面板 + 縣市下拉選單
└── api/
    └── cwa.js                 # CWA fetch / 資料解析
```

## 本機開發

```bash
npm install
npm run dev
```

### 環境變數（`.env`，不會被提交到 git）

```
VITE_WINDY_API_KEY=你的 Windy API 金鑰
VITE_CWA_API_KEY=你的 CWA 開放資料授權碼
```

## Windy API 設定注意事項

1. 到 [Windy API 後台](https://api.windy.com/keys) 申請 Map Forecast API 金鑰。
2. **金鑰有「Domain restrictions」網域白名單**，沒加入的網域呼叫會得到 `403 Cannot use Windy API, key is used from unauthorized domain`。開發與部署都要記得加：
   - 本機開發：`localhost`
   - 部署後：Vercel 給的網域（純 hostname，不要加 `https://` 或結尾 `/`）
   - 多個網域用**逗號**分隔（例如 `localhost, global-weather-beta.vercel.app`），最多 5 個
3. **Project identification** 為必填欄位，填你的網站 URL 或應用程式識別名稱即可。
4. **圖層（overlay）限制**：`store.getAllowed('overlay')` 回傳的允許清單依帳號方案而定。免費／試用方案目前僅開放 `wind`、`temp`、`pressure`，`satellite`、`rain` 等圖層需要升級付費方案才能使用。本專案目前預設使用 `wind` 圖層（[src/components/WindyMap.jsx](src/components/WindyMap.jsx)），之後若升級方案，把 `store.set('overlay', 'wind')` 改成 `'satellite'` 即可。

## CWA API 設定注意事項

- 使用的資料集是 **`F-D0047-091`**（臺灣各縣市未來 1 週逐 12 小時天氣預報，涵蓋全部 22 縣市）。
  - 注意：`F-D0047-089` 是「未來 3 天逐時預報」，欄位結構完全不同，不要混用。
- CWA 這組資料集的查詢參數與回傳欄位皆為**大寫開頭**（`LocationName`、`ElementName`、`WeatherElement`、`Time`…），跟 `F-C0032` 系列（小寫 `locationName`）不同。
- `LocationName` 直接對應縣市名稱（例如「臺中市」），`ElementName` 用中文（例如「最高溫度」「12小時降雨機率」），可用逗號分隔做伺服器端篩選：

  ```
  https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-D0047-091
    ?Authorization={金鑰}
    &LocationName=臺中市
    &ElementName=天氣現象,最高溫度,最低溫度,12小時降雨機率
  ```

- 該 API 有回傳 `Access-Control-Allow-Origin: *`，前端可直接呼叫，不需要後端 proxy。

## 部署到 Vercel

1. 到 [vercel.com](https://vercel.com) 用 GitHub 帳號登入，Import 本專案 repo。
2. 在 **Environment Variables** 設定加入以下兩組（Key 是變數名稱、Value 才是金鑰本身，兩者容易填反）：

   | Key | Value |
   |---|---|
   | `VITE_WINDY_API_KEY` | 你的 Windy 金鑰 |
   | `VITE_CWA_API_KEY` | 你的 CWA 授權碼 |

3. Deploy 完成後，回 Windy API 後台把 Vercel 網域加進金鑰的 Domain restrictions（見上方「Windy API 設定注意事項」）。
4. 打開部署好的網址確認：地圖正常顯示（無 unauthorized domain 錯誤）、縮放到 zoom ≥ 6 時預報面板正常出現且有資料。

## 注意事項

- `.env` 已加入 `.gitignore`，所有金鑰皆透過 `import.meta.env.VITE_xxx` 讀取，未 hardcode。
- 不需要 RWD，僅支援桌面瀏覽器。
