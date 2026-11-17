# 線上 3D 古氏方塊（Cuisenaire Rods）國小數學教學系統

> 專為國小一至六年級數學教學設計的互動式 3D 古氏方塊教具，支援互動式電子白板、平板與桌機瀏覽器。

![React 18](https://img.shields.io/badge/React-18.3.1-blue)
![Three.js](https://img.shields.io/badge/Three.js-0.169.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.14-38bdf8)
![Vitest](https://img.shields.io/badge/Vitest-Passing-brightgreen)

---

## 🌟 核心教學模組

1. **基礎數與量模組（低年級）**
   - 1 至 10 單位標準古氏方塊無限生成。
   - 純數學離散網格零誤差磁吸對齊與垂直堆疊。
   - 10 的分解與合成、比較型加減法長度差量演示。

2. **乘除與分數相對性模組（中年級）**
   - 等量連加乘法模型。
   - 動態指定「基準單位 1」打破「1 永遠是最小單位」迷思。

3. **假分數與帶分數動態尺規模組（中高年級）**
   - 點擊任意方塊設為基準單位 $1$（`unitLength`）。
   - 場景動態即時換算懸浮分數標籤，同步顯示假分數（如 $7/3$）與帶分數（如 $2\text{ 又 }1/3$）。

4. **3D 空間幾何與三視圖模組（高年級）**
   - 支援 X / Y / Z 三軸 90° 旋轉。
   - 「X光半透明模式」透視被遮擋積木。
   - 「一鍵視圖炸開（Explode View）」拉開方塊間距，輔助立體點數與表面積計算。
   - 「3D 立體 / 2D 俯視 / 2D 正視」一鍵鏡頭切換。

5. **平均數「移多補少」統計模式（高年級）**
   - 依 X 軸欄位即時統計高度。
   - 動態渲染「即時平均高度水平虛線」，輔助學生將高於平均線的方塊拆補至矮柱達成全場等高。

6. **神秘盲盒與未知數代數模組（高年級）**
   - 深岩灰「？」問號盲盒方塊，隱藏長度與刻度。
   - 支援等量公理排法（如 $? + 5 = 9$），點擊「揭曉答案」還原真實色彩與長度驗證。

---

## 🛡️ 五大架構防護規則（Architecture Safeguards）

1. **視圖炸開防錯位**：炸開模式（`explodeFactor > 0`）專供觀察點數，點擊拖曳時自動收合歸零。
2. **盲盒材質隔離**：盲盒強制隱藏內部單位刻度線，且不受 X 光半透明影響，避免破梗。
3. **動態邊界夾緊（Dynamic Clamping）**：扣除方塊軸向跨度，確保長度 10 的積木完整留在底板內。
4. **旋轉 90° 雙重重算**：邊界夾緊修正 $\rightarrow$ 重新計算堆疊高度 $\rightarrow$ 全場重力落實。
5. **GitHub Pages 相對路徑**：`vite.config.ts` 設定 `base: './'`，全貼圖程式化動態生成，子路徑不白屏。

---

## 🚀 快速開始

### 1. 安裝相依套件
```bash
npm install
```

### 2. 本地開發伺服器
```bash
npm run dev
```

### 3. 單元測試
```bash
npx vitest run
```

### 4. 正式打包建置
```bash
npm run build
```

---

## 📦 目錄架構

```
.
├── .github/workflows/deploy.yml   # GitHub Actions 自動部署
├── src/
│   ├── constants/rods.ts          # 1~10 標準色彩、HEX 色碼、底板常數
│   ├── types/rod.types.ts         # 型別定義
│   ├── utils/
│   │   ├── gridMath.ts            # AABB 邊界、堆疊高度、重力落實
│   │   ├── fractionMath.ts        # 假分數與帶分數轉換
│   │   ├── statsMath.ts           # 平均數欄位統計
│   │   ├── textureGenerator.ts    # Offscreen Canvas 盲盒貼圖快取
│   │   └── gridMath.test.ts       # Vitest 單元測試
│   ├── store/useRodStore.ts       # Zustand 狀態庫 (含 Undo/Redo)
│   ├── components/
│   │   ├── canvas/                # Three.js (R3F) 3D 組件
│   │   └── ui/                    # 電子白板大熱區 UI
│   ├── App.tsx                    # 主應用組合
│   └── main.tsx                   # 進入點
```
