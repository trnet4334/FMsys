# Midnight Obsidian — 色彩設計規範

個人資產交易紀錄面板的亮暗模式文字與色彩規範。
Token 定義檔：`apps/web/src/styles/tokens.css`

---

## 文字色彩 (Typography Colors)

| 類別 | CSS Token | 亮色 (Light) | 暗色 (Dark) | 用途 |
| :--- | :--- | :--- | :--- | :--- |
| **主要標題** | `--ink-0` | `#0F172A` | `#FFFFFF` | 頁面大標題、卡片標題 |
| **次要文字** | `--ink-1` | `#475569` | `#94A3B8` | 說明文字、側邊欄項目 |
| **禁用/預位文字** | `--ink-disabled` | `#94A3B8` | `#475569` | 輸入框預位符、禁用狀態 |
| **品牌強調色** | `--brand` | `#0066FF` | `#3B82F6` | 連結、主要按鈕文字 |

---

## 背景與容器 (Background & Surface)

| 類別 | CSS Token | 亮色 (Light) | 暗色 (Dark) | 視覺邏輯 |
| :--- | :--- | :--- | :--- | :--- |
| **全域背景** | `--bg-0` | `#F8FAFC` | `#020617` | 最底層頁面背景 |
| **容器背景** | `--card` | `#FFFFFF` | `#0F172A` | 資訊卡片、導航列背景 |
| **懸停/選中狀態** | `--bg-1` | `#F1F5F9` | `#1E293B` | 清單項目或按鈕互動態 |
| **邊框線條** | `--line` | `#E2E8F0` | `#334155` | 分隔線、卡片描邊 |

---

## 語意色彩 (Semantic Colors)

| 類別 | CSS Token | 亮色 (Light) | 暗色 (Dark) | 應用 |
| :--- | :--- | :--- | :--- | :--- |
| **成功** | `--success` | `#16A34A` | `#22C55E` | 資金流入、資產增值 |
| **危險/警告** | `--danger` | `#DC2626` | `#EF4444` | 資金流出、風險警告 |
| **資訊** | `--info` | `#0284C7` | `#38BDF8` | 系統提示、一般說明 |
| **警示** | `--warn` | `#D97706` | `#F59E0B` | 一般警告 |
| **品牌色淡** | `--brand-weak` | `#DBEAFE` | `#1E3A5F` | 徽章、柔性高亮 |

---

## 設計原則

1. **對比度：** 暗色模式使用深藍灰色調（非純黑）配上非純白文字，減少眼睛疲勞。
2. **層級感：**
   - 亮色模式：透過陰影 (`--shadow-soft`) 產生層級。
   - 暗色模式：透過背景色變淺 (`--bg-1` > `--card` > `--bg-0`) 模擬光源深度。
3. **行動點 (CTA)：** `--brand` 在兩種模式下均作為主要行動點色彩，確保冷色調介面保有視覺焦點。

---

## 主題切換

主題由 `<html>` 元素上的 `data-theme` 屬性控制：

```html
<html data-theme="dark">   <!-- 強制暗色 -->
<html data-theme="light">  <!-- 強制亮色 -->
<html>                     <!-- 跟隨 OS prefers-color-scheme -->
```

---

## Tailwind 使用方式

Token 已映射至 Tailwind 工具類別，可直接使用：

```tsx
// 背景
<div className="bg-card">...</div>
<div className="bg-bg-0">...</div>

// 文字
<p className="text-ink-0">主要標題</p>
<p className="text-ink-1">次要說明</p>
<p className="text-ink-disabled">禁用文字</p>

// 邊框
<div className="border border-line">...</div>

// 語意
<span className="text-success">+12.5%</span>
<span className="text-danger">-3.2%</span>

// 圓角與陰影
<div className="rounded-lg shadow-soft">...</div>
```
