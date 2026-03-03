## Why

目前個人與家庭資產資料分散在銀行、券商、交易所與記帳工具，缺乏可持續追蹤的單一視圖，難以快速判讀淨值變化、資產配置偏離與現金流風險。現在提出 v2.0 變更，是為了以快照式資料模型建立一致的財務事實來源，並在 Web 端先落地可擴展到多用戶與 App 的分析平台。

## What Changes

- 建立「快照驅動」的資產資料流程：支援手動/排程觸發、外部交易系統拉取、匯率快照固化、差異與異常計算。
- 提供財務儀表板核心視圖：淨值卡片、趨勢圖、資產分類總覽、最近快照變動、異常警示。
- 納入多幣別估值能力：以 TWD 為主幣別並支援 USD 切換，保留歷史匯率上下文以確保報表一致性。
- 定義四大資產類別（現金/股票/加密/外匯）與多帳戶彙總規則，支援帳戶維度分析。
- 規劃收支追蹤、資產配置分析、投資績效、報表匯出與風控警示等後續能力，按 Phase 1-4 分階段交付。
- 建立資料輸入管道（手動表單 + CSV/Excel 匯入）與對外 API/Webhook 串接契約。
- 納入安全與治理需求：JWT/OAuth、MFA、RBAC、稽核日誌、備份與災難復原基線。

## Capabilities

### New Capabilities
- `snapshot-lifecycle-management`: 管理快照觸發、資料收集、儲存、差異計算、異常偵測與摘要產生生命週期。
- `asset-and-account-modeling`: 定義多帳戶與四大資產類別資料結構、估值欄位與彙總行為。
- `multi-currency-valuation`: 提供主幣別/顯示幣別切換、匯率快照保存、匯損益分離呈現。
- `net-worth-dashboard`: 提供淨值、趨勢、分類快照、近期變動與警示視覺化。
- `cashflow-tracking`: 提供收支分類、月度收支分析、預算警示與比較能力。
- `allocation-and-performance-analytics`: 提供配置分析、偏離警示、TWR/MWR、基準對比與被動收入追蹤。
- `reporting-and-export-automation`: 提供週報/月報/年報/臨時報表產生、排程、存檔與 PDF/Excel/CSV/Email 匯出。
- `security-and-audit-controls`: 提供身份驗證、權限管控、加密、稽核與備援規範。

### Modified Capabilities
- None.

## Impact

- Affected systems: Next.js Web 前端、後端 API 服務、PostgreSQL、Redis、排程/佇列服務、外部交易系統 API、匯率與市價 API。
- Affected interfaces: 新增快照觸發與通知流程（`POST /api/snapshot/trigger`、`POST /webhook/snapshot-ready`），以及持倉/損益/現金流讀取端點契約。
- Data impact: 新增快照主表、快照持倉明細、快照差異等核心資料模型與索引策略。
- Operational impact: 增加週期性任務、報表產生流程與通知機制，需納入監控、重試與告警。
- Risk/coordination impact: 與外部交易系統對接規格、匯率來源可靠性、合規與隱私需求會影響 Phase 2 後交付節奏。
