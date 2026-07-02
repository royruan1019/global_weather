# global_weather 專案討論紀錄

---

## 專案基本資訊

- **專案名稱**：global_weather
- **性質**：學校個人作業
- **目標**：氣象衛星雲圖網站（Bonus：顯示台灣一週天氣預報）

---

## 對話紀錄

---

**RJH：**

新增專案(學校功課)-> global_weather
討論:
1. 目標:做一個氣象衛星雲圖網站(bonus:預測1週天氣狀況
2. 工具:
   a. 目前已知可以用免費的windy api https://api.windy.com/
   b. 會部屬到github
   c. 資料可撈中央氣象屬API: （已隱藏，金鑰請見 .env）
3. 提問:
   a. 還需要什麼東西
   b. 執行步驟
   c. 你有什麼疑問，越詳細越好

---

**Claude：**

先提醒一件重要的事：你把 CWA 的 API 金鑰直接貼在對話裡了。這種金鑰不該公開分享，建議你到中央氣象署開放資料平台重新產生一組新的，舊的作廢。之後部署到 GitHub 時也千萬不要把金鑰寫死在程式碼裡，等等會講怎麼處理。

### a. 還需要什麼東西

**技術層面**

1. **前端框架**：建議直接用你熟悉的 React + Vite。
2. **地圖顯示方案**：衛星雲圖本質上是「地圖 + 圖層疊加」。Windy 提供的是 **Map Forecast API**（嵌入式互動地圖，內建衛星、雷達、風場等圖層），這是最快的路。
3. **Windy API 金鑰**：去 https://api.windy.com/ 註冊申請，免費版有每日請求次數限制。
4. **CWA 資料集確認**：
   - `F-D0047-xxx` 系列：鄉鎮一週天氣預報（Bonus 資料來源，CWA 直接給未來 7 天預報）
   - `O-B0032-001` 或衛星雲圖圖資：CWA 有提供真實色/紅外線衛星影像
5. **部署方案**：GitHub 放程式碼，Vercel 負責部署顯示。
6. **環境變數管理**：`.env` 檔 + `.gitignore`，金鑰不進 repo。

**非技術層面**

7. **作業需求規格**：老師的評分標準是什麼？要不要 RWD？要不要報告文件？
8. **範圍界定**：「全球」雲圖用 Windy，CWA 只有台灣周邊資料。建議：Windy 負責全球互動雲圖，CWA 負責台灣一週預報。

### b. 執行步驟

**Phase 1：環境與資料探索（第 1~2 天）**
1. 申請 Windy API key、重新產生 CWA key
2. 用 Postman 或瀏覽器直接打 CWA 的 `F-D0047-091`，看 JSON 結構
3. 讀 Windy Map Forecast API 文件，跑通官方最小範例

**Phase 2：專案骨架（第 3~4 天）**
4. `npm create vite@latest global_weather -- --template react`
5. 建 GitHub repo、設好 `.gitignore` 和 `.env`
6. 規劃頁面結構：「全球雲圖頁」+「台灣一週預報頁」

**Phase 3：核心功能（第 5~8 天）**
7. 整合 Windy 地圖元件，預設開啟衛星（satellite）圖層
8. 寫 CWA 資料的 fetch 函式，處理載入中/錯誤狀態
9. 一週預報 UI：卡片式呈現每日高低溫、降雨機率、天氣圖示

**Phase 4：Bonus 與打磨（第 9~10 天）**
10. 加上縣市選擇器（切換不同地區的一週預報）
11. RWD 調整、載入動畫
12. 部署 + 寫 README

### c. Claude 的疑問

1. **金鑰暴露問題**：純前端部署後，CWA 金鑰會出現在瀏覽器 DevTools 裡，你要知道這件事。你想做到哪個程度？
2. **GitHub Pages 還是 Vercel？** 老師的要求具體是什麼？
3. Windy 呈現方式是「嵌入 Windy 的互動地圖」，客製化空間有限。你能接受網站核心區塊長得像 Windy 官網嗎？
4. Windy 免費金鑰有網域限制，部署後的正式網址要加進白名單，你知道最終網址嗎？
5. **「預測」的定義**：是 (a) 顯示 CWA 官方一週預報，還是 (b) 自己用歷史資料訓練模型做預測？
6. 如果走 (b)，資料來源打算用什麼？
7. 全球雲圖 + CWA（台灣）的組合，使用者體驗上怎麼銜接？
8. 個人作業還是小組作業？期限是什麼時候？
9. 需要支援手機瀏覽嗎？

---

**RJH：**

1. 收到不應該貼上的，但目前金鑰主要負責撈資料而已
2. Vercel抓Github程式顯示畫面
3. 可以要Windy官網
4. 不知道
5. 顯示 CWA 官方的一週預報(簡單,一天搞定)
6. 不選B
7. 地圖縮放到台灣時才顯示 CWA 預報
8. 算一個簡單的個人作業(盡量早上時間結案
9. 不需要，一般網站即可

---

**Claude：**

### 技術架構確認

```
React + Vite
├── Windy Map Forecast API（全球衛星雲圖，嵌入式）
├── CWA API（台灣一週預報，縮放到台灣時顯示）
└── 部署：GitHub → Vercel
```

金鑰處理：作業性質 + CWA 只是讀取公開氣象資料，放 `.env` + Vercel 環境變數即可，不用做後端代理。

### 執行步驟

#### Step 1｜建立專案與 GitHub repo（30 分鐘）

```bash
npm create vite@latest global_weather -- --template react
cd global_weather
npm install
```

建立 `.env`：
```
VITE_WINDY_API_KEY=你的windy金鑰
VITE_CWA_API_KEY=你的cwa金鑰
```

建立 `.gitignore`，確認 `.env` 在裡面（Vite 預設已有）。
push 到 GitHub，Vercel import repo，把兩組金鑰加到 Vercel Environment Variables。

#### Step 2｜申請 Windy API 金鑰（15 分鐘）

去 https://api.windy.com/map-forecast → 登入 → 建立 App → 填 domain（先填 `localhost`，之後加正式網址）。

#### Step 3｜整合 Windy 地圖（1~2 小時）

```jsx
// src/components/WindyMap.jsx
import { useEffect, useRef } from 'react'

export default function WindyMap({ onZoomTaiwan }) {
  const mapRef = useRef(null)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://api.windy.com/assets/map-forecast/libBoot.js'
    script.async = true
    script.onload = () => {
      windyInit(
        {
          key: import.meta.env.VITE_WINDY_API_KEY,
          lat: 23.5,
          lon: 121,
          zoom: 5,
          overlay: 'satellite',
        },
        (windyAPI) => {
          const { map } = windyAPI
          map.on('zoomend', () => {
            const zoom = map.getZoom()
            onZoomTaiwan(zoom >= 6)
          })
        }
      )
    }
    document.body.appendChild(script)
  }, [])

  return <div id="windy" style={{ width: '100%', height: '80vh' }} />
}
```

#### Step 4｜撈 CWA 一週預報（1 小時）

```js
// src/api/cwa.js
const BASE = 'https://opendata.cwa.gov.tw/api/v1/rest/datastore'
const KEY = import.meta.env.VITE_CWA_API_KEY

export async function fetchWeekForecast(locationName = '臺中市') {
  const res = await fetch(
    `${BASE}/F-D0047-091?Authorization=${KEY}&locationName=${locationName}&elementName=Wx,PoP12h,MaxT,MinT`
  )
  const data = await res.json()
  return data.records.Locations[0].Location[0]
}
```

#### Step 5｜一週預報 UI（1~2 小時）

```jsx
// src/App.jsx
import { useState } from 'react'
import WindyMap from './components/WindyMap'
import ForecastPanel from './components/ForecastPanel'

export default function App() {
  const [showForecast, setShowForecast] = useState(false)

  return (
    <div>
      <h1>Global Weather</h1>
      <WindyMap onZoomTaiwan={setShowForecast} />
      {showForecast && <ForecastPanel />}
    </div>
  )
}
```

`ForecastPanel` 裡呼叫 `fetchWeekForecast()`，渲染 7 天卡片（日期、天氣描述、高低溫、降雨機率）。

#### Step 6｜部署（15 分鐘）

```bash
git add .
git commit -m "feat: global weather with windy map and CWA forecast"
git push
```

Vercel 自動部署。拿到正式網址後，回 Windy 後台把網址加入 allowed domains。

### ⚠️ 未解決事項

**Windy domain 設定流程**：
1. 先用 `localhost` 開發
2. Vercel 第一次部署後拿到 `xxx.vercel.app` 網址
3. 把網址貼回 Windy 後台

---

**RJH：**

幫我整理資訊我要請code處理

---

**Claude：**

### 給 Claude Code 的 Prompt

```
# Project: global_weather

## 目標
建立一個氣象衛星雲圖網站，使用 React + Vite。

## 技術棧
- React + Vite
- Windy Map Forecast API（全球衛星雲圖）
- CWA 中央氣象署 API（台灣一週天氣預報）
- 部署：GitHub → Vercel

## 功能需求
1. 主畫面：Windy 互動地圖，預設圖層為衛星雲圖（satellite），預設中心點台灣（lat: 23.5, lon: 121, zoom: 5）
2. 當使用者縮放地圖到 zoom >= 6 時，地圖下方顯示台灣一週天氣預報面板
3. 預報面板顯示：日期、天氣描述（Wx）、高溫（MaxT）、低溫（MinT）、降雨機率（PoP12h）
4. 預設顯示臺中市的預報

## 環境變數（.env）
VITE_WINDY_API_KEY=（使用者自填）
VITE_CWA_API_KEY=（使用者自填）

## CWA API
- Endpoint: https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-D0047-091
- 參數: Authorization={VITE_CWA_API_KEY}&locationName=臺中市&elementName=Wx,PoP12h,MaxT,MinT

## Windy API
- Script src: https://api.windy.com/assets/map-forecast/libBoot.js
- 用 useEffect 動態插入 script tag
- 地圖容器 id 必須為 "windy"
- 監聽 map zoomend 事件，zoom >= 6 時觸發顯示預報面板

## 專案結構
src/
├── App.jsx
├── components/
│   ├── WindyMap.jsx      # Windy 地圖元件
│   └── ForecastPanel.jsx # 一週預報面板
└── api/
    └── cwa.js            # CWA fetch 函式

## 注意事項
- .env 加入 .gitignore
- 所有金鑰使用 import.meta.env.VITE_xxx 讀取，不得 hardcode
- 不需要 RWD，一般桌面網站即可
- 不需要額外 UI 套件，CSS 自己寫即可
```

### 執行前置作業

1. 建立專案：
```bash
npm create vite@latest global_weather -- --template react
cd global_weather
```

2. 建立 `.env`，填入金鑰：
```
VITE_WINDY_API_KEY=你的windy金鑰
VITE_CWA_API_KEY=你的cwa金鑰
```

3. 把上面 prompt 貼給 Claude Code 實作所有檔案。

4. 完成後 push 到 GitHub，Vercel import 部署，拿到網址後回 Windy 後台加入 allowed domains。

---

## 決策摘要

| 項目 | 決定 |
|---|---|
| 前端框架 | React + Vite |
| 地圖 | Windy Map Forecast API（嵌入式） |
| 氣象資料 | CWA F-D0047-091（一週預報） |
| 預報觸發條件 | 地圖 zoom >= 6 |
| 預設地區 | 臺中市 |
| 部署 | GitHub → Vercel |
| RWD | 不需要 |
| Bonus | 顯示 CWA 官方一週預報（非自訓練模型） |
| 金鑰管理 | .env + Vercel Environment Variables |
