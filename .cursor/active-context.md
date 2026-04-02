> **BrainSync Context Pumper** 🧠
> Dynamically loaded for active file: `src/pages/ruqyah-diagnosis/[testId].astro` (Domain: **Generic Logic**)

### 🔴 Generic Logic Gotchas
- **gotcha in [testId].astro**: -   background: #fff; border: 1.5px solid var(--border);
-   border-radius: 24px;
-   box-shadow: 0 8px 40px rgba(0,0,0,0.08);
-   overflow: hidden;
- }
- 
- /* Header */
- .rc-header {
-   display: flex; align-items: center; gap: 24px;
-   padding: 32px 36px 24px;
-   border-bottom: 1.5px solid var(--border);
-   background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%);
- }
- .rc-gauge-wrap {
-   display: flex; flex-direction: column; align-items: center; flex-shrink: 0;
-   gap: 6px;
- }
- .ri[REDACTED] { display: block; }
- .rc-level-badge {
-   display: inline-block; font-size: 12px; font-weight: 800;
-   padding: 4px 14px; border-radius: 20px; letter-spacing: 0.3px;
-   white-space: nowrap;
- }
- .rc-title-area { flex: 1; min-width: 0; }
- .rc-main-title {
-   font-size: 1.6rem; font-weight: 800; color: var(--text-dark);
-   margin-bottom: 12px; line-height: 1.2;
- }
- .rc-meta-chips { display: flex; flex-wrap: wrap; gap: 6px; }
- .rc-chip {
-   font-size: 12px; font-weight: 600; padding: 4px 12px;
-   border-radius: 20px; border: 1px solid var(--border);
-   background: #f8fafc; color: var(--text-muted); white-space: nowrap;
- }
- .rc-chip-yes   { background: #f0fdf4; border-color: #86efac; color: #15803d; }
- .rc-chip-maybe { background: #fffbeb; border-color: #fde68a; color: #d97706; }
- .rc-chip-no    { background: #fafafa; border-color: #e5e7eb; color: #6b7280; }
- 
- /* Result box */
- .rc-result-box {
-   margin: 24px 36px;
-   padding: 20px 22px;
-   border-radius: 14px; border: 1.5px solid;
- }
- .rc-result-label {
-   display: block; font-size: 11px; font-weight: 800;
-   text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px;
- }
- .rc-result-text {
-   font-size: 15px; line-height: 1.75; color: var(--text-dark);
-   margin: 0;
- }
- 
- /* Protocol block */
- .rc-protocol {
-   margin: 0 36px 24px;
-   border: 1.5px solid #bbf7d0; border-radius: 16px;
-   background: #f0fdf4; overflow: hidden;
- }
- .rc-section-label {
-   display: flex; align-items: center; gap: 8px;
-   padding: 14px 20px; font-size: 15px; font-weight: 800;
-   color: #15803d; background: #dcfce7;
-   border-bottom: 1px solid #bbf7d0;
- }
- .rc-section-icon { font-size: 16px; }
- 
- /* Numbered steps (evil-eye) */
- .rc-steps { padding: 16px 20px; display: flex; flex-direction: column; gap: 12px; }
- .rc-step {
-   display: flex; align-items: flex-start; gap: 14px;
- }
- .rc-step-num {
-   flex-shrink: 0; width: 28px; height: 28px;
-   border-radius: 50%; background: #15803d; color: #fff;
-   font-size: 13px; font-weight: 800;
-   display: flex; align-items: center; justify-content: center;
- }
- .rc-step-text { font-size: 14px; line-height: 1.7; color: var(--text-dark); padding-top: 4px; }
- 
- /* Subsections (7-day detox) */
- .rc-subsection { padding: 16px 20px; border-top: 1px solid #bbf7d0; }
- .rc-subsection:first-of-type { border-top: none; }
- .rc-subsec-title {
-   font-size: 13px; font-weight: 700; color: #166534;
-   margin-bottom: 10px;
- }
- .rc-list {
-   list-style: none; padding: 0; margin: 0;
-   display: flex; flex-direction: column; gap: 8px;
- }
- .rc-list li {
-   font-size: 14px; color: var(--text-medium); line-height: 1.65;
-   padding-left: 18px; position: relative;
- }
- .rc-list li::before {
-   content: '▸'; position: absolute; left: 0; color: #15803d; font-size: 12px; top: 2px;
- }
- .rc-note {
-   font-size: 13px; color: #4b5563; font-style: italic; margin-bottom: 10px;
- }
- 
- /* Tabeez warning */
- .rc-warning {
-   display: flex; align-items: flex-start; gap: 10px;
-   margin: 16px 20px;
-   padding: 14px 16px;
-   background: #fff7ed; border: 1.5px solid #fed7aa;
-   border-radius: 12px; font-size: 13px; color: #9a3412; line-height: 1.65;
- }
- .rc-warning-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
- 
- /* Problems block */
- .rc-problems {
-   margin: 0 36px 24px;
-   border: 1.5px solid var(--border); border-radius: 16px;
-   background: #fafafa; overflow: hidden;
- }
- .rc-problems .rc-section-label {
-   color: #374151; background: #f1f5f9;
-   border-bottom-color: var(--border);
- }
- .rc-badges {
-   padding: 16px 20px;
-   display: flex; flex-direction: column; gap: 10px;
- }
- .rc-badge-item {
-   display: flex; align-items: flex-start; gap: 12px;
-   padding: 12px 14px; border-radius: 12px;
-   border: 1px solid;
- }
- .rc-badge-yes   { background: #f0fdf4; border-color: #86efac; }
- .rc-badge-maybe { background: #fffbeb; border-color: #fde68a; }
- .rc-badge-num {
-   flex-shrink: 0; width: 22px; height: 22px;
-   border-radius: 50%; background: currentColor; color: inherit;
-   font-size: 11px; font-weight: 800; opacity: 0.7;
-   display: flex; align-items: center; justify-content: center;
- }
- .rc-badge-yes .rc-badge-num   { background: #15803d; color: #fff; opacity: 1; }
- .rc-badge-maybe .rc-badge-num { background: #d97706; color: #fff; opacity: 1; }
- .rc-badge-text {
-   flex: 1; font-size: 13px; line-height: 1.65;
-   color: var(--text-dark);
- }
- .rc-badge-tag {
-   flex-shrink: 0; font-size: 11px; font-weight: 700;
-   padding: 2px 10px; border-radius: 12px; align-self: center;
- }
- .rc-badge-yes .rc-badge-tag   { background: #15803d; color: #fff; }
- .rc-badge-maybe .rc-badge-tag { background: #d97706; color: #fff; }
- 
- /* Action buttons */
- .rc-actions {
-   padding: 0 36px 20px;
-   display: flex; flex-direction: column; gap: 10px;
- }
- .rc-btn {
-   display: flex; align-items: center; justify-content: center;
-   padding: 15px 24px; border-radius: 40px;
-   font-size: 15px; font-weight: 700; text-decoration: none;
-   transition: all 0.2s; min-height: 50px;
- }
- .rc-btn-primary  { background: var(--primary); color: #fff; }
- .rc-btn-primary:hover  { filter: brightness(1.08); transform: translateY(-1px); }
- .rc-btn-urgent   { background: #dc2626; color: #fff; }
- .rc-btn-urgent:hover   { background: #b91c1c; transform: translateY(-1px); }
- .rc-btn-secondary { background: #fff; color: var(--text-dark); border: 1.5px solid var(--border); }
- .rc-btn-secondary:hover { border-color: var(--primary); color: var(--primary); }
- 
- /* Footer */
- .rc-footer {
-   display: flex; align-items: center; justify-content: center; gap: 24px;
-   padding: 16px 36px 24px;
-   border-top: 1px solid var(--border);
-   flex-wrap: wrap;
- }
- .rc-restart {
-   display: flex; align-items: center; gap: 6px;
-   background: none; border: none; color: var(--text-muted);
-   font-size: 13px; cursor: pointer; font-family: inherit;
-   text-decoration: underline; padding: 0;
- }
- .rc-other-link {
-   display: flex; align-items: center; gap: 4px;
-   font-size: 13px; font-weight: 600; color: var(--primary);
-   text-decoration: none;
- }
- .rc-other-link:hover { text-decoration: underline; }
- 
- /* ── Responsive ── */
- @media (max-width: 600px) {
-   .question-card { padding: 24px 18px; }
-   .answer-options { grid-template-columns: repeat(3, 1fr); gap: 8px; }
-   .answer-btn { padding: 14px 6px; min-height: 76px; }
-   .opt-emoji { font-size: 18px; }
-   .opt-label { font-size: 12px; }
-   .rc-header { padding: 24px 18px 20px; gap: 16px; }
-   .rc-main-title { font-size: 1.3rem; }
-   .rc-result-box { margin: 16px 18px; }
-   .rc-protocol, .rc-problems { margin: 0 18px 18px; }
-   .rc-actions { padding: 0 18px 16px; }
-   .rc-footer { padding: 14px 18px 20px; }
-   .age-btns { grid-template-columns: 1fr 1fr; }
-   .rc-badge-item { gap: 8px; }
- }
- </style>
- 

📌 IDE AST Context: Modified symbols likely include [getStaticPaths, testId, category, isKids, questions]
- **gotcha in [testId].astro**: - .result-card {
+ <style is:global>
-   max-width: 720px; margin: 0 auto;
+ /* ═══════════════════════════════════════════════
-   background: #fff; border: 1.5px solid var(--border);
+    RESULT CARD — Global styles for dynamic innerHTML
-   border-radius: 24px;
+    ═══════════════════════════════════════════════ */
-   box-shadow: 0 8px 40px rgba(0,0,0,0.08);
+ 
-   overflow: hidden;
+ /* ── 1. Header section ── */
- }
+ .rc-header {
- 
+   text-align: center;
- /* Header */
+   padding: 36px 32px 24px;
- .rc-header {
+   background: linear-gradient(160deg, #f0fdf4 0%, #ffffff 60%);
-   display: flex; align-items: center; gap: 24px;
+   border-bottom: 1px solid #e5e7eb;
-   padding: 32px 36px 24px;
+ }
-   border-bottom: 1.5px solid var(--border);
+ .rc-gauge-wrap {
-   background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%);
+   display: flex;
- }
+   flex-direction: column;
- .rc-gauge-wrap {
+   align-items: center;
-   display: flex; flex-direction: column; align-items: center; flex-shrink: 0;
+   gap: 10px;
-   gap: 6px;
+   margin-bottom: 16px;
- .rc-level-badge {
+ 
-   display: inline-block; font-size: 12px; font-weight: 800;
+ .rc-level-badge {
-   padding: 4px 14px; border-radius: 20px; letter-spacing: 0.3px;
+   display: inline-block;
-   white-space: nowrap;
+   font-size: 12px;
- }
+   font-weight: 800;
- .rc-title-area { flex: 1; min-width: 0; }
+   padding: 5px 18px;
- .rc-main-title {
+   border-radius: 100px;
-   font-size: 1.6rem; font-weight: 800; color: var(--text-dark);
+   letter-spacing: 0.5px;
-   margin-bottom: 12px; line-height: 1.2;
+   text-transform: uppercase;
- .rc-meta-chips { display: flex; flex-wrap: wrap; gap: 6px; }
+ 
- .rc-chip {
+ .rc-main-title {
-   font-size: 12px; font-weight: 600; padding: 4px 12px;
+   font-size: 1.5rem;
-   border-radius: 20px; border: 1px solid var(--border);
+   font-weight: 800;
-   background: #f8fafc; color: var(--text-muted); white-space: nowrap;
+   color: #1a2332;
- }
+   margin: 0 0 16px 0;
- .rc-chip-yes   { background: #f0fdf4; border-color: #86efac; color: #15803d; }
+   line-height: 1.3;
- .rc-chip-maybe { background: #fffbeb; border-color: #fde68a; color: #d97706; }
+ }
- .rc-chip-no    { background: #fafafa; border-color: #e5e7eb; color: #6b7280; }
+ 
- 
+ .rc-meta-chips {
- /* Result box */
+   display: flex;
- .rc-result-box {
+   flex-wrap: wrap;
-   margin: 24px 36px;
+   gap: 8px;
-   padding: 20px 22px;
+   justify-content: center;
-   border-radius: 14px; border: 1.5px solid;
+ }
- }
+ .rc-chip {
- .rc-result-label {
+   display: inline-flex;
-   display: block; font-size: 11px; font-weight: 800;
+   align-items: center;
-   text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px;
+   gap: 4px;
- }
+   font-size: 13px;
- .rc-result-text {
+   font-weight: 600;
-   font-size: 15px; line-height: 1.75; color: var(--text-dark);
+   padding: 5px 14px;
-   margin: 0;
+   border-radius: 100px;
- }
+   border: 1.5px solid #e5e7eb;
- 
+   background: #f9fafb;
- /* Protocol block */
+   color: #4b5563;
- .rc-protocol {
+   white-space: nowrap;
-   margin: 0 36px 24px;
+ }
-   border: 1.5px solid #bbf7d0; border-radius: 16px;
+ .rc-chip-yes   { background: #f0fdf4; border-color: #86efac; color: #15803d; }
-   background: #f0fdf4; overflow: hidden;
+ .rc-chip-maybe { background: #fffbeb; border-color: #fde68a; color: #b45309; }
- }
+ .rc-chip-no    { background: #f9fafb; border-color: #e5e7eb; color: #6b7280; }
- .rc-section-label {
+ 
-   display: flex; align-items: center; gap: 8px;
+ /* ── 2. Result box ── */
-   padding: 14px 20px; font-size: 15px; font-weight: 800;
+ .rc-result-box {
-   color: #15803d; background: #dcfce7;
+   margin: 0;
-   border-bottom: 1px solid #bbf7d0;
+   padding: 20px 28px;
- }
+   border-left: 4px solid currentColor;
- .rc-section-icon { font-size: 16px; }
+   background: #fffbeb;
- 
+ }
- /* Numbered steps (evil-eye) */
+ .rc-result-label {
- .rc-steps { padding: 16px 20px; display: flex; flex-direction: column; gap: 12px; }
+   display: block;
- .rc-step {
+   font-size: 10px;
-   display: flex; align-items: flex-start; gap: 14px;
+   font-weight: 800;
- }
+   letter-spacing: 1.5px;
- .rc-step-num {
+   text-transform: uppercase;
-   flex-shrink: 0; width: 28px; height: 28px;
+   margin-bottom: 8px;
-   border-radius: 50%; background: #15803d; color: #fff;
+   opacity: 0.7;
-   font-size: 13px; font-weight: 800;
+ }
-   display: flex; align-items: center; justify-content: center;
+ .rc-result-text {
- }
+   font-size: 14.5px;
- .rc-step-text { font-size: 14px; line-height: 1.7; color: var(--text-dark); padding-top: 4px; }
+   line-height: 1.75;
- 
+   color: #374151;
- /* Subsections (7-day detox) */
+   margin: 0;
- .rc-subsection { padding: 16px 20px; border-top: 1px solid #bbf7d0; }
+ }
- .rc-subsection:first-of-type { border-top: none; }
+ 
- .rc-subsec-title {
+ /* ── 3. Section headers ── */
-   font-size: 13px; font-weight: 700; color: #166534;
+ .rc-section-header {
-   margin-bottom: 10px;
+   display: flex;
- }
+   align-items: center;
- .rc-list {
+   gap: 10px;
-   list-style: none; padding: 0; margin: 0;
+   padding: 16px 28px;
-   display: flex; flex-direction: column; gap: 8px;
+   font-size: 15px;
- }
+   font-weight: 800;
- .rc-list li {
+   color: #fff;
-   font-size: 14px; color: var(--text-medium); line-height: 1.65;
+   letter-spacing: 0.3px;
-   padding-left: 18px; position: relative;
+ }
- }
+ .rc-section-header svg {
- .rc-list li::before {
+   flex-shrink: 0;
-   content: '▸'; position: absolute; left: 0; color: #15803d; font-size: 12px; top: 2px;
+ }
- }
+ 
- .rc-note {
+ /* ── 4. Karoniyo / Protocol ── */
-   font-size: 13px; color: #4b5563; font-style: italic; margin-bottom: 10px;
+ .rc-protocol {
- }
+   border-top: 1px solid #e5e7eb;
- 
+ }
- /* Tabeez warning */
+ .rc-steps {
- .rc-warning {
+   padding: 4px 28px 16px;
-   display: flex; align-items: flex-start; gap: 10px;
+ }
-   margin: 16px 20px;
+ .rc-step {
-   padding: 14px 16px;
+   display: flex;
-   background: #fff7ed; border: 1.5px solid #fed7aa;
+   align-items: flex-start;
-   border-radius: 12px; font-size: 13px; color: #9a3412; line-height: 1.65;
+   gap: 14px;
- }
+   padding: 12px 0;
- .rc-warning-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
+   border-bottom: 1px solid #f3f4f6;
- 
+ }
- /* Problems block */
+ .rc-step:last-child { border-bottom: none; }
- .rc-problems {
+ .rc-step-num {
-   margin: 0 36px 24px;
+   display: flex;
-   border: 1.5px solid var(--border); border-radius: 16px;
+   align-items: center;
-   background: #fafafa; overflow: hidden;
+   justify-content: center;
- }
+   width: 28px;
- .rc-problems .rc-section-label {
+   height: 28px;
-   color: #374151; background: #f1f5f9;
+   min-width: 28px;
-   border-bottom-color: var(--border);
+   border-radius: 50%;
- }
+   background: #10b981;
- .rc-badges {
+   color: #fff;
-   padding: 16px 20px;
+   font-size: 13px;
-   display: flex; flex-direction: column; gap: 10px;
+   font-weight: 800;
- }
+   flex-shrink: 0;
- .rc-badge-item {
+   margin-top: 1px;
-   display: flex; align-items: flex-start; gap: 12px;
+ }
-   padding: 12px 14px; border-radius: 12px;
+ .rc-step-text {
-   border: 1px solid;
+   font-size: 14px;
- }
+   line-height: 1.65;
- .rc-badge-yes   { background: #f0fdf4; border-color: #86efac; }
+   color: #374151;
- .rc-badge-maybe { background: #fffbeb; border-color: #fde68a; }
+   flex: 1;
- .rc-badge-num {
+ }
-   flex-shrink: 0; width: 22px; height: 22px;
+ 
-   border-radius: 50%; background: currentColor; color: inherit;
+ /* ── 5. Sub-sections (ingredients, tilawat, effects) ── */
-   font-size: 11px; font-weight: 800; opacity: 0.7;
+ .rc-subsection {
-   display: flex; align-items: center; justify-content: center;
+   padding: 14px 28px;
- }
+   border-top: 1px solid #e5e7eb;
- .rc-badge-yes .rc-badge-num   { background: #15803d; color: #fff; opacity: 1; }
+   background: #f9fafb;
- .rc-badge-maybe .rc-badge-num { background: #d97706; color: #fff; opacity: 1; }
+ }
- .rc-badge-text {
+ .rc-subsec-title {
-   flex: 1; font-size: 13px; line-height: 1.65;
+   font-size: 13px;
-   color: var(--text-dark);
+   font-weight: 800;
- }
+   color: #065f46;
- .rc-badge-tag {
+   margin-bottom: 10px;
-   flex-shrink: 0; font-size: 11px; font-weight: 700;
+   display: flex;
-   padding: 2px 10px; border-radius: 12px; align-self: center;
+   align-items: center;
- }
+   gap: 6px;
- .rc-badge-yes .rc-badge-tag   { background: #15803d; color: #fff; }
+ }
- .rc-badge-maybe .rc-badge-tag { background: #d97706; color: #fff; }
+ .rc-subsec-title::before {
- 
+   content: '';
- /* Action buttons */
+   display: inline-block;
- .rc-actions {
+   width: 3px;
-   padding: 0 36px 20px;
+   height: 14px;
-   display: flex; flex-direction: column; gap: 10px;
+   background: #10b981;
- }
+   border-radius: 2px;
- .rc-btn {
+   flex-shrink: 0;
-   display: flex; align-items: center; justify-content: center;
+ }
-   padding: 15px 24px; border-radius: 40px;
+ .rc-note {
-   font-size: 15px; font-weight: 700; text-decoration: none;
+   font-size: 13px;
-   transition: all 0.2s; min-height: 50px;
+   color: #6b7280;
- }
+   margin: 0 0 10px;
- .rc-btn-primary  { background: var(--primary); color: #fff; }
+   font-style: italic;
- .rc-btn-primary:hover  { filter: brightness(1.08); transform: translateY(-1px); }
+ }
- .rc-btn-urgent   { background: #dc2626; color: #fff; }
+ .rc-list {
- .rc-btn-urgent:hover   { background: #b91c1c; transform: translateY(-1px); }
+   margin: 0;
- .rc-btn-secondary { background: #fff; color: var(--text-dark); border: 1.5px solid var(--border); }
+   padding: 0 0 0 16px;
- .rc-btn-secondary:hover { border-color: var(--primary); color: var(--primary); }
+   list-style: disc;
- 
+ }
- /* Footer */
+ .rc-list li {
- .rc-footer {
+   font-size: 14px;
-   display: flex; align-items: center; justify-content: center; gap: 24px;
+   line-height: 1.65;
-   padding: 16px 36px 24px;
+   color: #374151;
-   border-top: 1px solid var(--border);
+   padding: 3px 0;
-   flex-wrap: wrap;
+ }
- }
+ 
- .rc-restart {
+ /* ── 6. Warning box ── */
-   display: flex; align-items: center; gap: 6px;
+ .rc-warning {
-   background: none; border: none; color: var(--text-muted);
+   display: flex;
-   font-size: 13px; cursor: pointer; font-family: inherit;
+   gap: 12px;
-   text-decoration: underline; padding: 0;
+   align-items: flex-start;
- }
+   margin: 0 28px 16px;
- .rc-other-link {
+   padding: 14px 18px;
-   display: flex; align-items: center; gap: 4px;
+   background: #fff7ed;
-   font-size: 13px; font-weight: 600; color: var(--primary);
+   border: 1.5px solid #fdba74;
-   text-decoration: none;
+   border-radius: 12px;
- }
+   font-size: 13.5px;
- .rc-other-link:hover { text-decoration: underline; }
+   line-height: 1.65;
- 
+   color: #92400e;
- /* ── Responsive ── */
+ }
- @media (max-width: 600px) {
+ .rc-warning-icon {
-   .question-card { padding: 24px 18px; }
+   font-size: 18px;
-   .answer-options { grid-template-columns: repeat(3, 1fr); gap: 8px; }
+   flex-shrink: 0;
-   .answer-btn { padding: 14px 6px; min-height: 76px; }
+   margin-top: 1px;
-   .opt-emoji { font-size: 18px; }
+ }
-   .opt-label { font-size: 12px; }
+ 
-   .rc-header { padding: 24px 18px 20px; gap: 16px; }
+ /* ── 7. Problems section ── */
-   .rc-main-title { font-size: 1.3rem; }
+ .rc-problems {
-   .rc-result-box { margin: 16px 18px; }
+   border-top: 1px solid #e5e7eb;
-   .rc-protocol, .rc-problems { margin: 0 18px 18px; }
+ }
-   .rc-actions { padding: 0 18px 16px; }
+ .rc-badges {
-   .rc-footer { padding: 14px 18px 20px; }
+   padding: 8px 20px 16px;
-   .age-btns { grid-template-columns: 1fr 1fr; }
+   display: flex;
-   .rc-badge-item { gap: 8px; }
+   flex-direction: column;
- }
+   gap: 8px;
- </style>
+ }
- 
+ .rc-badge-item {
+   display: flex;
+   align-items: center;
+   gap: 12px;
+   padding: 10px 14px;
+   border-radius: 12px;
+   border: 1.5px solid #e5e7eb;
+   background: #fff;
+ }
+ .rc-badge-yes   { border-color: #86efac; background: #f0fdf4; }
+ .rc-badge-maybe { border-color: #fde68a; background: #fffbeb; }
+ .rc-badge-num {
+   display: flex;
+   align-items: center;
+   justify-content: center;
+   width: 26px;
+   height: 26px;
+   min-width: 26px;
+   border-radius: 50%;
+   background: #e5e7eb;
+   color: #374151;
+   font-size: 12px;
+   font-weight: 800;
+   flex-shrink: 0;
+ }
+ .rc-badge-yes .rc-badge-num   { background: #bbf7d0; color: #14532d; }
+ .rc-badge-maybe .rc-badge-num { background: #fef08a; color: #713f12; }
+ .rc-badge-text {
+   flex: 1;
+   font-size: 13.5px;
+   line-height: 1.5;
+   color: #374151;
+ }
+ .rc-badge-tag {
+   display: inline-block;
+   font-size: 11px;
+   font-weight: 700;
+   padding: 3px 10px;
+   border-radius: 100px;
+   white-space: nowrap;
+   flex-shrink: 0;
+ }
+ .rc-badge-yes .rc-badge-tag   { background: #22c55e; color: #fff; }
+ .rc-badge-maybe .rc-badge-tag { background: #f59e0b; color: #fff; }
+ 
+ /* ── 8. Action buttons ── */
+ .rc-actions {
+   display: flex;
+   flex-direction: column;
+   gap: 10px;
+   padding: 20px 28px 16px;
+   border-top: 1px solid #f3f4f6;
+ }
+ .rc-btn-primary {
+   display: block; width: 100%; text-align: center;
+   padding: 14px 24px;
+   background: linear-gradient(135deg, #10b981 0%, #059669 100%);
+   color: #fff; font-weight: 700; font-size: 15px;
+   border: none; border-radius: 14px; cursor: pointer;
+   font-family: inherit; transition: opacity 0.18s, transform 0.12s;
+   text-decoration: none; line-height: 1.3;
+ }
+ .rc-btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }
+ .rc-btn-secondary {
+   display: block; width: 100%; text-align: center;
+   padding: 13px 24px;
+   background: #fff; color: #10b981;
+   border: 2px solid #10b981; border-radius: 14px;
+   font-weight: 700; font-size: 14px; cursor: pointer;
+   font-family: inherit; transition: background 0.18s, color 0.18s;
+   text-decoration: none; line-height: 1.3;
+ }
+ .rc-btn-secondary:hover { background: #f0fdf4; }
+ 
+ /* ── 9. Footer links ── */
+ .rc-footer {
+   border-top: 1px solid #f3f4f6;
+   padding: 14px 28px 24px;
+   display: flex;
+   gap: 24px;
+   justify-content: center;
+   flex-wrap: wrap;
+ }
+ .rc-footer a {
+   font-size: 13.5px;
+   color: #6b7280;
+   text-decoration: none;
+   font-weight: 600;
+   transition: color 0.18s;
+ }
+ .rc-footer a:hover { color: #10b981; }
+ 
+ /* ── Mobile responsive ── */
+ @media (max-width: 600px) {
+   .rc-header { padding: 28px 20px 20px; }
+   .rc-main-title { font-size: 1.25rem; }
+   .rc-section-header { padding: 14px 20px; }
+   .rc-steps { padding: 4px 20px 16px; }
+   .rc-subsection { padding: 12px 20px; }
+   .rc-result-box { padding: 16px 20px; }
+   .rc-warning { margin: 0 20px 14px; }
+   .rc-badges { padding: 8px 14px 14px; }
+   .rc-actions { padding: 16px 20px 12px; }
+   .rc-footer { padding: 12px 20px 20px; }
+ }
+ </style>
+ 
+   max-width: 720px; margin: 0 auto;
+   background: #fff; border: 1.5px solid var(--border);
+   border-radius: 24px;
+   box-shadow: 0 8px 40px rgba(0,0,0,0.08);
+   overflow: hidden;
+ }
+ 
+ /* Header */
+ .rc-header {
+   display: flex; align-items: center; gap: 24px;
+   padding: 32px 36px 24px;
+   border-bottom: 1.5px solid var(--border);
+   background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%);
+ }
+ .rc-gauge-wrap {
+   display: flex; flex-direction: column; align-items: center; flex-shrink: 0;
+   gap: 6px;
+ }
+ .ri[REDACTED] { display: block; }
+ .rc-level-badge {
+   display: inline-block; font-size: 12px; font-weight: 800;
+   padding: 4px 14px; border-radius: 20px; letter-spacing: 0.3px;
+   white-space: nowrap;
+ }
+ .rc-title-area { flex: 1; min-width: 0; }
+ .rc-main-title {
+   font-size: 1.6rem; font-weight: 800; color: var(--text-dark);
+   margin-bottom: 12px; line-height: 1.2;
+ }
+ .rc-meta-chips { display: flex; flex-wrap: wrap; gap: 6px; }
+ .rc-chip {
+   font-size: 12px; font-weight: 600; padding: 4px 12px;
+   border-radius: 20px; border: 1px solid var(--border);
+   background: #f8fafc; color: var(--text-muted); white-space: nowrap;
+ }
+ .rc-chip-yes   { background: #f0fdf4; border-color: #86efac; color: #15803d; }
+ .rc-chip-maybe { background: #fffbeb; border-color: #fde68a; color: #d97706; }
+ .rc-chip-no    { background: #fafafa; border-color: #e5e7eb; color: #6b7280; }
+ 
+ /* Result box */
+ .rc-result-box {
+   margin: 24px 36px;
+   padding: 20px 22px;
+   border-radius: 14px; border: 1.5px solid;
+ }
+ .rc-result-label {
+   display: block; font-size: 11px; font-weight: 800;
+   text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px;
+ }
+ .rc-result-text {
+   font-size: 15px; line-height: 1.75; color: var(--text-dark);
+   margin: 0;
+ }
+ 
+ /* Protocol block */
+ .rc-protocol {
+   margin: 0 36px 24px;
+   border: 1.5px solid #bbf7d0; border-radius: 16px;
+   background: #f0fdf4; overflow: hidden;
+ }
+ .rc-section-label {
+   display: flex; align-items: center; gap: 8px;
+   padding: 14px 20px; font-size: 15px; font-weight: 800;
+   color: #15803d; background: #dcfce7;
+   border-bottom: 1px solid #bbf7d0;
+ }
+ .rc-section-icon { font-size: 16px; }
+ 
+ /* Numbered steps (evil-eye) */
+ .rc-steps { padding: 16px 20px; display: flex; flex-direction: column; gap: 12px; }
+ .rc-step {
+   display: flex; align-items: flex-start; gap: 14px;
+ }
+ .rc-step-num {
+   flex-shrink: 0; width: 28px; height: 28px;
+   border-radius: 50%; background: #15803d; color: #fff;
+   font-size: 13px; font-weight: 800;
+   display: flex; align-items: center; justify-content: center;
+ }
+ .rc-step-text { font-size: 14px; line-height: 1.7; color: var(--text-dark); padding-top: 4px; }
+ 
+ /* Subsections (7-day detox) */
+ .rc-subsection { padding: 16px 20px; border-top: 1px solid #bbf7d0; }
+ .rc-subsection:first-of-type { border-top: none; }
+ .rc-subsec-title {
+   font-size: 13px; font-weight: 700; color: #166534;
+   margin-bottom: 10px;
+ }
+ .rc-list {
+   list-style: none; padding: 0; margin: 0;
+   display: flex; flex-direction: column; gap: 8px;
+ }
+ .rc-list li {
+   font-size: 14px; color: var(--text-medium); line-height: 1.65;
+   padding-left: 18px; position: relative;
+ }
+ .rc-list li::before {
+   content: '▸'; position: absolute; left: 0; color: #15803d; font-size: 12px; top: 2px;
+ }
+ .rc-note {
+   font-size: 13px; color: #4b5563; font-style: italic; margin-bottom: 10px;
+ }
+ 
+ /* Tabeez warning */
+ .rc-warning {
+   display: flex; align-items: flex-start; gap: 10px;
+   margin: 16px 20px;
+   padding: 14px 16px;
+   background: #fff7ed; border: 1.5px solid #fed7aa;
+   border-radius: 12px; font-size: 13px; color: #9a3412; line-height: 1.65;
+ }
+ .rc-warning-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
+ 
+ /* Problems block */
+ .rc-problems {
+   margin: 0 36px 24px;
+   border: 1.5px solid var(--border); border-radius: 16px;
+   background: #fafafa; overflow: hidden;
+ }
+ .rc-problems .rc-section-label {
+   color: #374151; background: #f1f5f9;
+   border-bottom-color: var(--border);
+ }
+ .rc-badges {
+   padding: 16px 20px;
+   display: flex; flex-direction: column; gap: 10px;
+ }
+ .rc-badge-item {
+   display: flex; align-items: flex-start; gap: 12px;
+   padding: 12px 14px; border-radius: 12px;
+   border: 1px solid;
+ }
+ .rc-badge-yes   { background: #f0fdf4; border-color: #86efac; }
+ .rc-badge-maybe { background: #fffbeb; border-color: #fde68a; }
+ .rc-badge-num {
+   flex-shrink: 0; width: 22px; height: 22px;
+   border-radius: 50%; background: currentColor; color: inherit;
+   font-size: 11px; font-weight: 800; opacity: 0.7;
+   display: flex; align-items: center; justify-content: center;
+ }
+ .rc-badge-yes .rc-badge-num   { background: #15803d; color: #fff; opacity: 1; }
+ .rc-badge-maybe .rc-badge-num { background: #d97706; color: #fff; opacity: 1; }
+ .rc-badge-text {
+   flex: 1; font-size: 13px; line-height: 1.65;
+   color: var(--text-dark);
+ }
+ .rc-badge-tag {
+   flex-shrink: 0; font-size: 11px; font-weight: 700;
+   padding: 2px 10px; border-radius: 12px; align-self: center;
+ }
+ .rc-badge-yes .rc-badge-tag   { background: #15803d; color: #fff; }
+ .rc-badge-maybe .rc-badge-tag { background: #d97706; color: #fff; }
+ 
+ /* Action buttons */
+ .rc-actions {
+   padding: 0 36px 20px;
+   display: flex; flex-direction: column; gap: 10px;
+ }
+ .rc-btn {
+   display: flex; align-items: center; justify-content: center;
+   padding: 15px 24px; border-radius: 40px;
+   font-size: 15px; font-weight: 700; text-decoration: none;
+   transition: all 0.2s; min-height: 50px;
+ }
+ .rc-btn-primary  { background: var(--primary); color: #fff; }
+ .rc-btn-primary:hover  { filter: brightness(1.08); transform: translateY(-1px); }
+ .rc-btn-urgent   { background: #dc2626; color: #fff; }
+ .rc-btn-urgent:hover   { background: #b91c1c; transform: translateY(-1px); }
+ .rc-btn-secondary { background: #fff; color: var(--text-dark); border: 1.5px solid var(--border); }
+ .rc-btn-secondary:hover { border-color: var(--primary); color: var(--primary); }
+ 
+ /* Footer */
+ .rc-footer {
+   display: flex; align-items: center; justify-content: center; gap: 24px;
+   padding: 16px 36px 24px;
+   border-top: 1px solid var(--border);
+   flex-wrap: wrap;
+ }
+ .rc-restart {
+   display: flex; align-items: center; gap: 6px;
+   background: none; border: none; color: var(--text-muted);
+   font-size: 13px; cursor: pointer; font-family: inherit;
+   text-decoration: underline; padding: 0;
+ }
+ .rc-other-link {
+   display: flex; align-items: center; gap: 4px;
+   font-size: 13px; font-weight: 600; color: var(--primary);
+   text-decoration: none;
+ }
+ .rc-other-link:hover { text-decoration: underline; }
+ 
+ /* ── Responsive ── */
+ @media (max-width: 600px) {
+   .question-card { padding: 24px 18px; }
+   .answer-options { grid-template-columns: repeat(3, 1fr); gap: 8px; }
+   .answer-btn { padding: 14px 6px; min-height: 76px; }
+   .opt-emoji { font-size: 18px; }
+   .opt-label { font-size: 12px; }
+   .rc-header { padding: 24px 18px 20px; gap: 16px; }
+   .rc-main-title { font-size: 1.3rem; }
+   .rc-result-box { margin: 16px 18px; }
+   .rc-protocol, .rc-problems { margin: 0 18px 18px; }
+   .rc-actions { padding: 0 18px 16px; }
+   .rc-footer { padding: 14px 18px 20px; }
+   .age-btns { grid-template-columns: 1fr 1fr; }
+   .rc-badge-item { gap: 8px; }
+ }
+ </style>
+ 

📌 IDE AST Context: Modified symbols likely include [getStaticPaths, testId, category, isKids, questions]
- **gotcha in [testId].astro**: - /* ── Result Section ── */
+ 
- .result-section { padding: 60px 0 80px; }
+ /* ── Result Section ── */
- .result-card {
+ .result-section { padding: 48px 0 80px; }
-   max-width: 680px; margin: 0 auto; text-align: left;
+ .result-card {
-   background: #fff; border: 1.5px solid var(--border);
+   max-width: 720px; margin: 0 auto;
-   border-radius: 24px; padding: 44px 36px;
+   background: #fff; border: 1.5px solid var(--border);
-   box-shadow: 0 4px 24px rgba(0,0,0,0.06);
+   border-radius: 24px;
-   display: flex; flex-direction: column; gap: 0;
+   box-shadow: 0 8px 40px rgba(0,0,0,0.08);
- }
+   overflow: hidden;
- 
+ }
- /* ── Result Section ── */
+ 
- .result-section { padding: 48px 0 80px; }
+ /* Header */
- .result-card {
+ .rc-header {
-   max-width: 720px; margin: 0 auto;
+   display: flex; align-items: center; gap: 24px;
-   background: #fff; border: 1.5px solid var(--border);
+   padding: 32px 36px 24px;
-   border-radius: 24px;
+   border-bottom: 1.5px solid var(--border);
-   box-shadow: 0 8px 40px rgba(0,0,0,0.08);
+   background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%);
-   overflow: hidden;
+ }
- }
+ .rc-gauge-wrap {
- 
+   display: flex; flex-direction: column; align-items: center; flex-shrink: 0;
- /* Header */
+   gap: 6px;
- .rc-header {
+ }
-   display: flex; align-items: center; gap: 24px;
+ .ri[REDACTED] { display: block; }
-   padding: 32px 36px 24px;
+ .rc-level-badge {
-   border-bottom: 1.5px solid var(--border);
+   display: inline-block; font-size: 12px; font-weight: 800;
-   background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%);
+   padding: 4px 14px; border-radius: 20px; letter-spacing: 0.3px;
- }
+   white-space: nowrap;
- .rc-gauge-wrap {
+ }
-   display: flex; flex-direction: column; align-items: center; flex-shrink: 0;
+ .rc-title-area { flex: 1; min-width: 0; }
-   gap: 6px;
+ .rc-main-title {
- }
+   font-size: 1.6rem; font-weight: 800; color: var(--text-dark);
- .ri[REDACTED] { display: block; }
+   margin-bottom: 12px; line-height: 1.2;
- .rc-level-badge {
+ }
-   display: inline-block; font-size: 12px; font-weight: 800;
+ .rc-meta-chips { display: flex; flex-wrap: wrap; gap: 6px; }
-   padding: 4px 14px; border-radius: 20px; letter-spacing: 0.3px;
+ .rc-chip {
-   white-space: nowrap;
+   font-size: 12px; font-weight: 600; padding: 4px 12px;
- }
+   border-radius: 20px; border: 1px solid var(--border);
- .rc-title-area { flex: 1; min-width: 0; }
+   background: #f8fafc; color: var(--text-muted); white-space: nowrap;
- .rc-main-title {
+ }
-   font-size: 1.6rem; font-weight: 800; color: var(--text-dark);
+ .rc-chip-yes   { background: #f0fdf4; border-color: #86efac; color: #15803d; }
-   margin-bottom: 12px; line-height: 1.2;
+ .rc-chip-maybe { background: #fffbeb; border-color: #fde68a; color: #d97706; }
- }
+ .rc-chip-no    { background: #fafafa; border-color: #e5e7eb; color: #6b7280; }
- .rc-meta-chips { display: flex; flex-wrap: wrap; gap: 6px; }
+ 
- .rc-chip {
+ /* Result box */
-   font-size: 12px; font-weight: 600; padding: 4px 12px;
+ .rc-result-box {
-   border-radius: 20px; border: 1px solid var(--border);
+   margin: 24px 36px;
-   background: #f8fafc; color: var(--text-muted); white-space: nowrap;
+   padding: 20px 22px;
- }
+   border-radius: 14px; border: 1.5px solid;
- .rc-chip-yes   { background: #f0fdf4; border-color: #86efac; color: #15803d; }
+ }
- .rc-chip-maybe { background: #fffbeb; border-color: #fde68a; color: #d97706; }
+ .rc-result-label {
- .rc-chip-no    { background: #fafafa; border-color: #e5e7eb; color: #6b7280; }
+   display: block; font-size: 11px; font-weight: 800;
- 
+   text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px;
- /* Result box */
+ }
- .rc-result-box {
+ .rc-result-text {
-   margin: 24px 36px;
+   font-size: 15px; line-height: 1.75; color: var(--text-dark);
-   padding: 20px 22px;
+   margin: 0;
-   border-radius: 14px; border: 1.5px solid;
+ }
- }
+ 
- .rc-result-label {
+ /* Protocol block */
-   display: block; font-size: 11px; font-weight: 800;
+ .rc-protocol {
-   text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px;
+   margin: 0 36px 24px;
- }
+   border: 1.5px solid #bbf7d0; border-radius: 16px;
- .rc-result-text {
+   background: #f0fdf4; overflow: hidden;
-   font-size: 15px; line-height: 1.75; color: var(--text-dark);
+ }
-   margin: 0;
+ .rc-section-label {
- }
+   display: flex; align-items: center; gap: 8px;
- 
+   padding: 14px 20px; font-size: 15px; font-weight: 800;
- /* Protocol block */
+   color: #15803d; background: #dcfce7;
- .rc-protocol {
+   border-bottom: 1px solid #bbf7d0;
-   margin: 0 36px 24px;
+ }
-   border: 1.5px solid #bbf7d0; border-radius: 16px;
+ .rc-section-icon { font-size: 16px; }
-   background: #f0fdf4; overflow: hidden;
+ 
- }
+ /* Numbered steps (evil-eye) */
- .rc-section-label {
+ .rc-steps { padding: 16px 20px; display: flex; flex-direction: column; gap: 12px; }
-   display: flex; align-items: center; gap: 8px;
+ .rc-step {
-   padding: 14px 20px; font-size: 15px; font-weight: 800;
+   display: flex; align-items: flex-start; gap: 14px;
-   color: #15803d; background: #dcfce7;
+ }
-   border-bottom: 1px solid #bbf7d0;
+ .rc-step-num {
- }
+   flex-shrink: 0; width: 28px; height: 28px;
- .rc-section-icon { font-size: 16px; }
+   border-radius: 50%; background: #15803d; color: #fff;
- 
+   font-size: 13px; font-weight: 800;
- /* Numbered steps (evil-eye) */
+   display: flex; align-items: center; justify-content: center;
- .rc-steps { padding: 16px 20px; display: flex; flex-direction: column; gap: 12px; }
+ }
- .rc-step {
+ .rc-step-text { font-size: 14px; line-height: 1.7; color: var(--text-dark); padding-top: 4px; }
-   display: flex; align-items: flex-start; gap: 14px;
+ 
- }
+ /* Subsections (7-day detox) */
- .rc-step-num {
+ .rc-subsection { padding: 16px 20px; border-top: 1px solid #bbf7d0; }
-   flex-shrink: 0; width: 28px; height: 28px;
+ .rc-subsection:first-of-type { border-top: none; }
-   border-radius: 50%; background: #15803d; color: #fff;
+ .rc-subsec-title {
-   font-size: 13px; font-weight: 800;
+   font-size: 13px; font-weight: 700; color: #166534;
-   display: flex; align-items: center; justify-content: center;
+   margin-bottom: 10px;
- .rc-step-text { font-size: 14px; line-height: 1.7; color: var(--text-dark); padding-top: 4px; }
+ .rc-list {
- 
+   list-style: none; padding: 0; margin: 0;
- /* Subsections (7-day detox) */
+   display: flex; flex-direction: column; gap: 8px;
- .rc-subsection { padding: 16px 20px; border-top: 1px solid #bbf7d0; }
+ }
- .rc-subsection:first-of-type { border-top: none; }
+ .rc-list li {
- .rc-subsec-title {
+   font-size: 14px; color: var(--text-medium); line-height: 1.65;
-   font-size: 13px; font-weight: 700; color: #166534;
+   padding-left: 18px; position: relative;
-   margin-bottom: 10px;
+ }
- }
+ .rc-list li::before {
- .rc-list {
+   content: '▸'; position: absolute; left: 0; color: #15803d; font-size: 12px; top: 2px;
-   list-style: none; padding: 0; margin: 0;
+ }
-   display: flex; flex-direction: column; gap: 8px;
+ .rc-note {
- }
+   font-size: 13px; color: #4b5563; font-style: italic; margin-bottom: 10px;
- .rc-list li {
+ }
-   font-size: 14px; color: var(--text-medium); line-height: 1.65;
+ 
-   padding-left: 18px; position: relative;
+ /* Tabeez warning */
- }
+ .rc-warning {
- .rc-list li::before {
+   display: flex; align-items: flex-start; gap: 10px;
-   content: '▸'; position: absolute; left: 0; color: #15803d; font-size: 12px; top: 2px;
+   margin: 16px 20px;
- }
+   padding: 14px 16px;
- .rc-note {
+   background: #fff7ed; border: 1.5px solid #fed7aa;
-   font-size: 13px; color: #4b5563; font-style: italic; margin-bottom: 10px;
+   border-radius: 12px; font-size: 13px; color: #9a3412; line-height: 1.65;
- 
+ .rc-warning-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
- /* Tabeez warning */
+ 
- .rc-warning {
+ /* Problems block */
-   display: flex; align-items: flex-start; gap: 10px;
+ .rc-problems {
-   margin: 16px 20px;
+   margin: 0 36px 24px;
-   padding: 14px 16px;
+   border: 1.5px solid var(--border); border-radius: 16px;
-   background: #fff7ed; border: 1.5px solid #fed7aa;
+   background: #fafafa; overflow: hidden;
-   border-radius: 12px; font-size: 13px; color: #9a3412; line-height: 1.65;
+ }
- }
+ .rc-problems .rc-section-label {
- .rc-warning-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
+   color: #374151; background: #f1f5f9;
- 
+   border-bottom-color: var(--border);
- /* Problems block */
+ }
- .rc-problems {
+ .rc-badges {
-   margin: 0 36px 24px;
+   padding: 16px 20px;
-   border: 1.5px solid var(--border); border-radius: 16px;
+   display: flex; flex-direction: column; gap: 10px;
-   background: #fafafa; overflow: hidden;
+ }
- }
+ .rc-badge-item {
- .rc-problems .rc-section-label {
+   display: flex; align-items: flex-start; gap: 12px;
-   color: #374151; background: #f1f5f9;
+   padding: 12px 14px; border-radius: 12px;
-   border-bottom-color: var(--border);
+   border: 1px solid;
- .rc-badges {
+ .rc-badge-yes   { background: #f0fdf4; border-color: #86efac; }
-   padding: 16px 20px;
+ .rc-badge-maybe { background: #fffbeb; border-color: #fde68a; }
-   display: flex; flex-direction: column; gap: 10px;
+ .rc-badge-num {
- }
+   flex-shrink: 0; width: 22px; height: 22px;
- .rc-badge-item {
+   border-radius: 50%; background: currentColor; color: inherit;
-   display: flex; align-items: flex-start; gap: 12px;
+   font-size: 11px; font-weight: 800; opacity: 0.7;
-   padding: 12px 14px; border-radius: 12px;
+   display: flex; align-items: center; justify-content: center;
-   border: 1px solid;
+ }
- }
+ .rc-badge-yes .rc-badge-num   { background: #15803d; color: #fff; opacity: 1; }
- .rc-badge-yes   { background: #f0fdf4; border-color: #86efac; }
+ .rc-badge-maybe .rc-badge-num { background: #d97706; color: #fff; opacity: 1; }
- .rc-badge-maybe { background: #fffbeb; border-color: #fde68a; }
+ .rc-badge-text {
- .rc-badge-num {
+   flex: 1; font-size: 13px; line-height: 1.65;
-   flex-shrink: 0; width: 22px; height: 22px;
+   color: var(--text-dark);
-   border-radius: 50%; background: currentColor; color: inherit;
+ }
-   font-size: 11px; font-weight: 800; opacity: 0.7;
+ .rc-badge-tag {
-   display: flex; align-items: center; justify-content: center;
+   flex-shrink: 0; font-size: 11px; font-weight: 700;
- }
+   padding: 2px 10px; border-radius: 12px; align-self: center;
- .rc-badge-yes .rc-badge-num   { background: #15803d; color: #fff; opacity: 1; }
+ }
- .rc-badge-maybe .rc-badge-num { background: #d97706; color: #fff; opacity: 1; }
+ .rc-badge-yes .rc-badge-tag   { background: #15803d; color: #fff; }
- .rc-badge-text {
+ .rc-badge-maybe .rc-badge-tag { background: #d97706; color: #fff; }
-   flex: 1; font-size: 13px; line-height: 1.65;
+ 
-   color: var(--text-dark);
+ /* Action buttons */
- }
+ .rc-actions {
- .rc-badge-tag {
+   padding: 0 36px 20px;
-   flex-shrink: 0; font-size: 11px; font-weight: 700;
+   display: flex; flex-direction: column; gap: 10px;
-   padding: 2px 10px; border-radius: 12px; align-self: center;
+ }
- }
+ .rc-btn {
- .rc-badge-yes .rc-badge-tag   { background: #15803d; color: #fff; }
+   display: flex; align-items: center; justify-content: center;
- .rc-badge-maybe .rc-badge-tag { background: #d97706; color: #fff; }
+   padding: 15px 24px; border-radius: 40px;
- 
+   font-size: 15px; font-weight: 700; text-decoration: none;
- /* Action buttons */
+   transition: all 0.2s; min-height: 50px;
- .rc-actions {
+ }
-   padding: 0 36px 20px;
+ .rc-btn-primary  { background: var(--primary); color: #fff; }
-   display: flex; flex-direction: column; gap: 10px;
+ .rc-btn-primary:hover  { filter: brightness(1.08); transform: translateY(-1px); }
- }
+ .rc-btn-urgent   { background: #dc2626; color: #fff; }
- .rc-btn {
+ .rc-btn-urgent:hover   { background: #b91c1c; transform: translateY(-1px); }
-   display: flex; align-items: center; justify-content: center;
+ .rc-btn-secondary { background: #fff; color: var(--text-dark); border: 1.5px solid var(--border); }
-   padding: 15px 24px; border-radius: 40px;
+ .rc-btn-secondary:hover { border-color: var(--primary); color: var(--primary); }
-   font-size: 15px; font-weight: 700; text-decoration: none;
+ 
-   transition: all 0.2s; min-height: 50px;
+ /* Footer */
- }
+ .rc-footer {
- .rc-btn-primary  { background: var(--primary); color: #fff; }
+   display: flex; align-items: center; justify-content: center; gap: 24px;
- .rc-btn-primary:hover  { filter: brightness(1.08); transform: translateY(-1px); }
+   padding: 16px 36px 24px;
- .rc-btn-urgent   { background: #dc2626; color: #fff; }
+   border-top: 1px solid var(--border);
- .rc-btn-urgent:hover   { background: #b91c1c; transform: translateY(-1px); }
+   flex-wrap: wrap;
- .rc-btn-secondary { background: #fff; color: var(--text-dark); border: 1.5px solid var(--border); }
+ }
- .rc-btn-secondary:hover { border-color: var(--primary); color: var(--primary); }
+ .rc-restart {
- 
+   display: flex; align-items: center; gap: 6px;
- /* Footer */
+   background: none; border: none; color: var(--text-muted);
- .rc-footer {
+   font-size: 13px; cursor: pointer; font-family: inherit;
-   display: flex; align-items: center; justify-content: center; gap: 24px;
+   text-decoration: underline; padding: 0;
-   padding: 16px 36px 24px;
+ }
-   border-top: 1px solid var(--border);
+ .rc-other-link {
-   flex-wrap: wrap;
+   display: flex; align-items: center; gap: 4px;
- }
+   font-size: 13px; font-weight: 600; color: var(--primary);
- .rc-restart {
+   text-decoration: none;
-   display: flex; align-items: center; gap: 6px;
+ }
-   background: none; border: none; color: var(--text-muted);
+ .rc-other-link:hover { text-decoration: underline; }
-   font-size: 13px; cursor: pointer; font-family: inherit;
+ 
-   text-decoration: underline; padding: 0;
+ /* ── Responsive ── */
- }
+ @media (max-width: 600px) {
- .rc-other-link {
+   .question-card { padding: 24px 18px; }
-   display: flex; align-items: center; gap: 4px;
+   .answer-options { grid-template-columns: repeat(3, 1fr); gap: 8px; }
-   font-size: 13px; font-weight: 600; color: var(--primary);
+   .answer-btn { padding: 14px 6px; min-height: 76px; }
-   text-decoration: none;
+   .opt-emoji { font-size: 18px; }
- }
+   .opt-label { font-size: 12px; }
- .rc-other-link:hover { text-decoration: underline; }
+   .rc-header { padding: 24px 18px 20px; gap: 16px; }
- 
+   .rc-main-title { font-size: 1.3rem; }
- /* ── Responsive ── */
+   .rc-result-box { margin: 16px 18px; }
- @media (max-width: 600px) {
+   .rc-protocol, .rc-problems { margin: 0 18px 18px; }
-   .question-card { padding: 24px 18px; }
+   .rc-actions { padding: 0 18px 16px; }
-   .answer-options { grid-template-columns: repeat(3, 1fr); gap: 8px; }
+   .rc-footer { padding: 14px 18px 20px; }
-   .answer-btn { padding: 14px 6px; min-height: 76px; }
+   .age-btns { grid-template-columns: 1fr 1fr; }
-   .opt-emoji { font-size: 18px; }
+   .rc-badge-item { gap: 8px; }
-   .opt-label { font-size: 12px; }
+ }
-   .rc-header { padding: 24px 18px 20px; gap: 16px; }
+ </style>
-   .rc-main-title { font-size: 1.3rem; }
+ 
-   .rc-result-box { margin: 16px 18px; }
-   .rc-protocol, .rc-problems { margin: 0 18px 18px; }
-   .rc-actions { padding: 0 18px 16px; }
-   .rc-footer { padding: 14px 18px 20px; }
-   .age-btns { grid-template-columns: 1fr 1fr; }
-   .rc-badge-item { gap: 8px; }
- }
- </style>
- 

📌 IDE AST Context: Modified symbols likely include [getStaticPaths, testId, category, isKids, questions]
- **gotcha in [testId].astro**: - /* Result Header */
+ /* ── Result Section ── */
- .result-header-block {
+ .result-section { padding: 48px 0 80px; }
-   text-align: center;
+ .result-card {
-   padding-bottom: 24px;
+   max-width: 720px; margin: 0 auto;
-   margin-bottom: 24px;
+   background: #fff; border: 1.5px solid var(--border);
-   border-bottom: 1.5px solid var(--border);
+   border-radius: 24px;
- }
+   box-shadow: 0 8px 40px rgba(0,0,0,0.08);
- .result-main-title {
+   overflow: hidden;
-   font-size: 1.8rem; font-weight: 800;
+ }
-   color: var(--text-dark); margin-bottom: 12px;
+ 
- }
+ /* Header */
- .result-meta {
+ .rc-header {
-   font-size: 14px; color: var(--text-muted);
+   display: flex; align-items: center; gap: 24px;
-   margin-bottom: 6px; line-height: 1.5;
+   padding: 32px 36px 24px;
- }
+   border-bottom: 1.5px solid var(--border);
- .result-meta strong { color: var(--text-dark); }
+   background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%);
- .result-falafal {
+ }
-   margin-top: 14px; padding: 16px 20px;
+ .rc-gauge-wrap {
-   background: #eff6ff; border-radius: 12px;
+   display: flex; flex-direction: column; align-items: center; flex-shrink: 0;
-   font-size: 15px; line-height: 1.7; text-align: right;
+   gap: 6px;
-   border: 1px solid #bfdbfe;
+ }
- }
+ .ri[REDACTED] { display: block; }
- .falafal-label { font-weight: 800; color: #1e40af; margin-left: 6px; }
+ .rc-level-badge {
- .falafal-text  { color: #1e3a8a; }
+   display: inline-block; font-size: 12px; font-weight: 800;
- 
+   padding: 4px 14px; border-radius: 20px; letter-spacing: 0.3px;
- /* Protocol Block */
+   white-space: nowrap;
- .protocol-block {
+ }
-   background: #f0fdf4; border: 1.5px solid #bbf7d0;
+ .rc-title-area { flex: 1; min-width: 0; }
-   border-radius: 16px; padding: 24px 24px;
+ .rc-main-title {
-   margin-bottom: 20px;
+   font-size: 1.6rem; font-weight: 800; color: var(--text-dark);
- }
+   margin-bottom: 12px; line-height: 1.2;
- .protocol-title {
+ }
-   font-size: 1.15rem; font-weight: 800;
+ .rc-meta-chips { display: flex; flex-wrap: wrap; gap: 6px; }
-   color: #15803d; margin-bottom: 16px;
+ .rc-chip {
-   border-bottom: 1px solid #86efac; padding-bottom: 10px;
+   font-size: 12px; font-weight: 600; padding: 4px 12px;
- }
+   border-radius: 20px; border: 1px solid var(--border);
- .protocol-section { margin-bottom: 18px; }
+   background: #f8fafc; color: var(--text-muted); white-space: nowrap;
- .protocol-section:last-child { margin-bottom: 0; }
+ }
- .protocol-sec-title {
+ .rc-chip-yes   { background: #f0fdf4; border-color: #86efac; color: #15803d; }
-   font-size: 14px; font-weight: 700;
+ .rc-chip-maybe { background: #fffbeb; border-color: #fde68a; color: #d97706; }
-   color: var(--text-dark); margin-bottom: 10px;
+ .rc-chip-no    { background: #fafafa; border-color: #e5e7eb; color: #6b7280; }
-   text-transform: uppercase; letter-spacing: 0.4px;
+ 
- }
+ /* Result box */
- .protocol-section ul {
+ .rc-result-box {
-   list-style: disc; padding-left: 20px;
+   margin: 24px 36px;
-   display: flex; flex-direction: column; gap: 8px;
+   padding: 20px 22px;
- }
+   border-radius: 14px; border: 1.5px solid;
- .protocol-section li {
+ }
-   font-size: 14px; color: var(--text-medium);
+ .rc-result-label {
-   line-height: 1.65;
+   display: block; font-size: 11px; font-weight: 800;
- }
+   text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px;
- .protocol-line {
+ }
-   font-size: 14px; color: var(--text-medium);
+ .rc-result-text {
-   line-height: 1.7; margin-bottom: 10px;
+   font-size: 15px; line-height: 1.75; color: var(--text-dark);
- }
+   margin: 0;
- .protocol-note {
+ }
-   font-size: 13px; font-style: italic;
+ 
-   color: var(--text-muted); margin-bottom: 10px;
+ /* Protocol block */
- }
+ .rc-protocol {
- 
+   margin: 0 36px 24px;
- /* Tabeez Warning */
+   border: 1.5px solid #bbf7d0; border-radius: 16px;
- .tabeej-warning {
+   background: #f0fdf4; overflow: hidden;
-   background: #fff7ed; border: 1.5px solid #fed7aa;
+ }
-   border-radius: 10px; padding: 14px 16px;
+ .rc-section-label {
-   font-size: 13px; color: #9a3412; line-height: 1.65;
+   display: flex; align-items: center; gap: 8px;
-   margin-top: 16px;
+   padding: 14px 20px; font-size: 15px; font-weight: 800;
- }
+   color: #15803d; background: #dcfce7;
- 
+   border-bottom: 1px solid #bbf7d0;
- /* Problems Block */
+ }
- .problems-block {
+ .rc-section-icon { font-size: 16px; }
-   background: #fafafa; border: 1.5px solid var(--border);
+ 
-   border-radius: 16px; padding: 24px;
+ /* Numbered steps (evil-eye) */
-   margin-bottom: 20px;
+ .rc-steps { padding: 16px 20px; display: flex; flex-direction: column; gap: 12px; }
- }
+ .rc-step {
- .problems-title {
+   display: flex; align-items: flex-start; gap: 14px;
-   font-size: 1.1rem; font-weight: 800;
+ }
-   color: var(--text-dark); margin-bottom: 14px;
+ .rc-step-num {
-   border-bottom: 1px solid var(--border); padding-bottom: 10px;
+   flex-shrink: 0; width: 28px; height: 28px;
- }
+   border-radius: 50%; background: #15803d; color: #fff;
- .problems-list {
+   font-size: 13px; font-weight: 800;
-   list-style: none; display: flex; flex-direction: column; gap: 10px;
+   display: flex; align-items: center; justify-content: center;
- .problem-item {
+ .rc-step-text { font-size: 14px; line-height: 1.7; color: var(--text-dark); padding-top: 4px; }
-   font-size: 14px; color: var(--text-medium);
+ 
-   padding: 10px 14px;
+ /* Subsections (7-day detox) */
-   background: #fff; border-radius: 10px;
+ .rc-subsection { padding: 16px 20px; border-top: 1px solid #bbf7d0; }
-   border: 1px solid var(--border);
+ .rc-subsection:first-of-type { border-top: none; }
-   line-height: 1.55;
+ .rc-subsec-title {
- }
+   font-size: 13px; font-weight: 700; color: #166534;
- .problem-item strong { color: #dc2626; }
+   margin-bottom: 10px;
- .problem-item strong:has(+ :empty), .problem-item strong {
+ }
-   color: #15803d;
+ .rc-list {
- }
+   list-style: none; padding: 0; margin: 0;
- /* Yes = red badge, মাঝেমাঝে = yellow */
+   display: flex; flex-direction: column; gap: 8px;
- 
+ }
- /* Action Buttons */
+ .rc-list li {
- .result-actions { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
+   font-size: 14px; color: var(--text-medium); line-height: 1.65;
- .btn-action {
+   padding-left: 18px; position: relative;
-   display: flex; align-items: center; justify-content: center; gap: 8px;
+ }
-   padding: 14px 24px; border-radius: 40px;
+ .rc-list li::before {
-   font-size: 15px; font-weight: 700; text-decoration: none;
+   content: '▸'; position: absolute; left: 0; color: #15803d; font-size: 12px; top: 2px;
-   transition: all 0.2s; min-height: 48px;
+ }
- }
+ .rc-note {
- .btn-primary-action { background: var(--primary); color: #fff; }
+   font-size: 13px; color: #4b5563; font-style: italic; margin-bottom: 10px;
- .btn-primary-action:hover { background: var(--primary-dark, #059669); transform: translateY(-1px); }
+ }
- .btn-urgent { background: #dc2626; color: #fff; }
+ 
- .btn-urgent:hover { background: #b91c1c; transform: translateY(-1px); }
+ /* Tabeez warning */
- .btn-secondary-action { background: #fff; color: var(--text-dark); border: 1.5px solid var(--border); }
+ .rc-warning {
- .btn-secondary-action:hover { border-color: var(--primary); color: var(--primary); }
+   display: flex; align-items: flex-start; gap: 10px;
- 
+   margin: 16px 20px;
- /* Footer links */
+   padding: 14px 16px;
- .result-footer {
+   background: #fff7ed; border: 1.5px solid #fed7aa;
-   display: flex; align-items: center; justify-content: center; gap: 24px;
+   border-radius: 12px; font-size: 13px; color: #9a3412; line-height: 1.65;
-   flex-wrap: wrap;
+ }
- }
+ .rc-warning-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
- .restart-link {
+ 
-   display: flex; align-items: center; gap: 6px;
+ /* Problems block */
-   background: none; border: none; color: var(--text-muted);
+ .rc-problems {
-   font-size: 13px; cursor: pointer; font-family: inherit;
+   margin: 0 36px 24px;
-   text-decoration: underline; padding: 0;
+   border: 1.5px solid var(--border); border-radius: 16px;
- }
+   background: #fafafa; overflow: hidden;
- .other-tests-link {
+ }
-   display: flex; align-items: center; gap: 4px;
+ .rc-problems .rc-section-label {
-   font-size: 13px; font-weight: 600; color: var(--primary);
+   color: #374151; background: #f1f5f9;
-   text-decoration: none;
+   border-bottom-color: var(--border);
- .other-tests-link:hover { text-decoration: underline; }
+ .rc-badges {
- 
+   padding: 16px 20px;
- /* ── Responsive ── */
+   display: flex; flex-direction: column; gap: 10px;
- @media (max-width: 600px) {
+ }
-   .question-card { padding: 24px 18px; }
+ .rc-badge-item {
-   .answer-options { grid-template-columns: repeat(3, 1fr); gap: 8px; }
+   display: flex; align-items: flex-start; gap: 12px;
-   .answer-btn { padding: 14px 6px; min-height: 76px; }
+   padding: 12px 14px; border-radius: 12px;
-   .opt-emoji { font-size: 18px; }
+   border: 1px solid;
-   .opt-label { font-size: 12px; }
+ }
-   .result-card { padding: 28px 18px; }
+ .rc-badge-yes   { background: #f0fdf4; border-color: #86efac; }
-   .age-btns { grid-template-columns: 1fr 1fr; }
+ .rc-badge-maybe { background: #fffbeb; border-color: #fde68a; }
- }
+ .rc-badge-num {
- </style>
+   flex-shrink: 0; width: 22px; height: 22px;
- 
+   border-radius: 50%; background: currentColor; color: inherit;
+   font-size: 11px; font-weight: 800; opacity: 0.7;
+   display: flex; align-items: center; justify-content: center;
+ }
+ .rc-badge-yes .rc-badge-num   { background: #15803d; color: #fff; opacity: 1; }
+ .rc-badge-maybe .rc-badge-num { background: #d97706; color: #fff; opacity: 1; }
+ .rc-badge-text {
+   flex: 1; font-size: 13px; line-height: 1.65;
+   color: var(--text-dark);
+ }
+ .rc-badge-tag {
+   flex-shrink: 0; font-size: 11px; font-weight: 700;
+   padding: 2px 10px; border-radius: 12px; align-self: center;
+ }
+ .rc-badge-yes .rc-badge-tag   { background: #15803d; color: #fff; }
+ .rc-badge-maybe .rc-badge-tag { background: #d97706; color: #fff; }
+ 
+ /* Action buttons */
+ .rc-actions {
+   padding: 0 36px 20px;
+   display: flex; flex-direction: column; gap: 10px;
+ }
+ .rc-btn {
+   display: flex; align-items: center; justify-content: center;
+   padding: 15px 24px; border-radius: 40px;
+   font-size: 15px; font-weight: 700; text-decoration: none;
+   transition: all 0.2s; min-height: 50px;
+ }
+ .rc-btn-primary  { background: var(--primary); color: #fff; }
+ .rc-btn-primary:hover  { filter: brightness(1.08); transform: translateY(-1px); }
+ .rc-btn-urgent   { background: #dc2626; color: #fff; }
+ .rc-btn-urgent:hover   { background: #b91c1c; transform: translateY(-1px); }
+ .rc-btn-secondary { background: #fff; color: var(--text-dark); border: 1.5px solid var(--border); }
+ .rc-btn-secondary:hover { border-color: var(--primary); color: var(--primary); }
+ 
+ /* Footer */
+ .rc-footer {
+   display: flex; align-items: center; justify-content: center; gap: 24px;
+   padding: 16px 36px 24px;
+   border-top: 1px solid var(--border);
+   flex-wrap: wrap;
+ }
+ .rc-restart {
+   display: flex; align-items: center; gap: 6px;
+   background: none; border: none; color: var(--text-muted);
+   font-size: 13px; cursor: pointer; font-family: inherit;
+   text-decoration: underline; padding: 0;
+ }
+ .rc-other-link {
+   display: flex; align-items: center; gap: 4px;
+   font-size: 13px; font-weight: 600; color: var(--primary);
+   text-decoration: none;
+ }
+ .rc-other-link:hover { text-decoration: underline; }
+ 
+ /* ── Responsive ── */
+ @media (max-width: 600px) {
+   .question-card { padding: 24px 18px; }
+   .answer-options { grid-template-columns: repeat(3, 1fr); gap: 8px; }
+   .answer-btn { padding: 14px 6px; min-height: 76px; }
+   .opt-emoji { font-size: 18px; }
+   .opt-label { font-size: 12px; }
+   .rc-header { padding: 24px 18px 20px; gap: 16px; }
+   .rc-main-title { font-size: 1.3rem; }
+   .rc-result-box { margin: 16px 18px; }
+   .rc-protocol, .rc-problems { margin: 0 18px 18px; }
+   .rc-actions { padding: 0 18px 16px; }
+   .rc-footer { padding: 14px 18px 20px; }
+   .age-btns { grid-template-columns: 1fr 1fr; }
+   .rc-badge-item { gap: 8px; }
+ }
+ </style>
+ 

📌 IDE AST Context: Modified symbols likely include [getStaticPaths, testId, category, isKids, questions]
- **⚠️ GOTCHA: Fixed null crash in Left — prevents null/undefined runtime crashes**: -     <!-- ② রুকইয়াহ কি এবং কেনো করা হয়? -->
+     <!-- ⑦.৫ নামাজের ওয়াক্ত -->
-     <section class="section info-section reveal">
+     <section class="prayer-section reveal">
-       <div class="container info-grid">
+       <div class="container">
-         <div class="info-text scroll-reveal">
+         <div class="prayer-widget scroll-reveal">
-           <h2>রুকইয়াহ কি এবং<br/>কেনো করা হয়?</h2>
+ 
-           <p>
+           <!-- Left: landscape image -->
-             রুকইয়াহ হলো কুরআনের আয়াত ও হাদিসে বর্ণিত দোয়ার মাধ্যমে আধ্যাত্মিক ও শারীরিক রোগের চিকিৎসা।
+           <div class="pw-landscape">
-             ইসলামে স্বীকৃত এই পদ্ধতিতে জিনের আছর, জাদু, বদনজর ও মানসিক সমস্যার কার্যকর চিকিৎসা করা হয়।
+             <img src="/images/prayer-landscape.webp" alt="" loading="lazy" width="480" height="240" />
-           </p>
+           </div>
-           <ul class="info-bullets">
+ 
-             <li>শারীরিক রোগ, যেমন মাথাব্যথা, পেটের ব্যথা, অনিদ্রা নিরাময়</li>
+           <!-- Center: location + prayers -->
-             <li>মানসিক অস্থিরতা, ভয়, উদ্বেগ ও বিষণ্নতা থেকে মুক্তি</li>
+           <div class="pw-center">
-             <li>বদনজর, হাসদ ও জাদুর প্রভাব থেকে রক্ষা</li>
+             <div class="pw-top-row">
-             <li>জিনের আছর ও ওয়াসওয়াসা দূর করা</li>
+               <!-- Location -->
-             <li>বিয়ে, সন্তান ও রিজিকে বাধা দূর করা</li>
+               <div class="pw-location">
-           </ul>
+                 <div class="pw-city" id="pt-city">ঢাকা,</div>
-           <a class="whatsapp-cta" href="https://wa.me/8801992575874" target="_blank" rel="noopener">
+                 <div class="pw-country" id="pt-country">বাংলাদেশ</div>
-             <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13
… [diff truncated]

📌 IDE AST Context: Modified symbols likely include [allPosts, blogs, services, rakis, packages]

### 📐 Generic Logic Conventions & Fixes
- **[convention] what-changed in [testId].astro — confirmed 3x**: -           <a href="/ruqyah-diagnosis">সেলফ রুকইয়াহ টেস্ট</a>
+           <a href="/ruqyah-diagnosis">রুকইয়াহ ডায়াগনোসিস</a>

📌 IDE AST Context: Modified symbols likely include [getStaticPaths, testId, category, isKids, questions]
- **[what-changed] what-changed in ruqyah-diagnosis.astro**: -   title="সেলফ রুকইয়াহ টেস্ট | Ruqyah Healing Center"
+   title="রুকইয়াহ ডায়াগনোসিস | Ruqyah Healing Center"
-   description="সেলফ রুকইয়াহ ডায়াগনোসিস সিস্টেম। বদনজর, যাদু, জীন বা ওয়াসওয়াসার লক্ষণ পরীক্ষা করুন।"
+   description="রুকইয়াহ ডায়াগনোসিস - আপনার সমস্যাটি কি শারীরিক, মানসিক নাকি আসলেই জিন বা জাদুর প্রভাব? বিজ্ঞানসম্মত ও শরয়ী পদ্ধতিতে নিজে নিজে যাচাই করুন।"
-     <!-- Page Header -->
+     <div class="page-header">
-     <div class="page-header">
+       <div class="container">
-       <div class="container">
+         <!-- Breadcrumb -->
-           <span>সেলফ রুকইয়াহ টেস্ট</span>
+           <span>রুকইয়াহ ডায়াগনোসিস</span>

📌 IDE AST Context: Modified symbols likely include [categories, BaseLayout, style]
- **[what-changed] what-changed in ruqyah-diagnosis.astro**: File updated (external): src/pages/ruqyah-diagnosis.astro

Content summary (301 lines):
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import { testCategories } from '../data/test-data';

const categories = testCategories.map(c => ({
  id:          c.id,
  title:       c.title,
  subtitle:    c.subtitle,
  description: c.description,
  icon:        c.icon,
  color:       c.color,
  colorLight:  c.colorLight,
  count:       c.id === 'kids' ? '6 / 19' : c.questions.length.toSt
- **[convention] Fixed null crash in Ruqyah — prevents null/undefined runtime crashes — confirmed 3x**: -   { label: 'রুকইয়াহ টেস্ট', href: '/ruqyah-test' },
+   { label: 'সেলফ রুকইয়াহ', href: '/self-ruqyah' },
-   { label: 'সেলফ রুকইয়াহ', href: '/self-ruqyah' },
+   { label: 'রুকইয়াহ সাপ্লিমেন্ট', href: '/supplements' },
-   { label: 'রুকইয়াহ সাপ্লিমেন্ট', href: '/supplements' },
+   { label: 'রুকইয়াহ ব্লগ', href: '/blog' },
-   { label: 'রুকইয়াহ ব্লগ', href: '/blog' },
+   { label: 'পিডিএফ', href: '/pdf' },
-   { label: 'পিডিএফ', href: '/pdf' },
+   { label: 'কোর্স', href: '/courses' },
-   { label: 'কোর্স', href: '/courses' },
+   { label: 'রাকী পরিচয়', href: '/team' },
-   { label: 'রাকী পরিচয়', href: '/team' },
+   { label: 'নোটিশ', href: '/notices' },
-   { label: 'নোটিশ', href: '/notices' },
+   { label: 'প্রোফাইল', href: '/profile' },
-   { label: 'প্রোফাইল', href: '/profile' },
+ ];
- ];
+ ---
- ---
+ 
- 
+ <header class="site-header" transition:persist>
- <header class="site-header" transition:persist>
+   <div class="container header-inner">
-   <div class="container header-inner">
+     <a href="/" class="logo">
-     <a href="/" class="logo">
+       <div class="logo-icon" style="background: transparent;">
-       <div class="logo-icon" style="background: transparent;">
+         <img src="/images/ruqyah-logo.png" alt="Ruqyah Healing Logo" style="width: 100%; height: 100%; object-fit: contain;" />
-         <img src="/images/ruqyah-logo.png" alt="Ruqyah Healing Logo" style="width: 100%; height: 100%; object-fit: contain;" />
+       </div>
-       </div>
+       <div class="logo-text">
-       <div class="logo-text">
+         <span class="logo-name">Ruqyah</span>
-         <span class="logo-name">Ruqyah</span>
+         <span class="logo-sub">Healing</span>
-         <span class="logo-sub">Healing</span>
+       </div>
-       </div>
+     </a>
-     </a>
+ 
- 
+     <nav class="main-nav" id="main-nav" aria-label="প্রধান নেভিগেশন">
-     <nav class="main-nav" id="main-nav" aria-label="প্রধান নেভিগেশন">
+       {navItems.map(item => (
-       {na
… [diff truncated]

📌 IDE AST Context: Modified symbols likely include [navItems, div.logo-text, nav#main-nav.main-nav, button#menu-toggle.menu-toggle, div#nav-overlay.nav-overlay]
- **[what-changed] Replaced dependency Brand**: - import { clinicNumbers, clinicSchedule, getWhatsappUrl, socialLinks } from '../data/clinic.js';
+ ---
- ---
+ import { clinicNumbers, clinicSchedule, getWhatsappUrl, socialLinks } from '../data/clinic.js';
- <footer class="site-footer">
+ ---
-   <div class="container footer-inner">
+ <footer class="site-footer">
-     <!-- Brand -->
+   <div class="container footer-inner">
-     <div class="footer-brand">
+     <!-- Brand -->
-       <a href="/" class="footer-logo">
+     <div class="footer-brand">
-         <div class="footer-logo-icon" style="background: transparent;">
+       <a href="/" class="footer-logo">
-           <img src="/images/ruqyah-logo.png" alt="Ruqyah Healing Logo" style="width: 100%; height: 100%; object-fit: contain;" />
+         <div class="footer-logo-icon" style="background: transparent;">
-         </div>
+           <img src="/images/ruqyah-logo.png" alt="Ruqyah Healing Logo" style="width: 100%; height: 100%; object-fit: contain;" />
-         <div>
+         </div>
-           <div class="footer-logo-name">Ruqyah Healing</div>
+         <div>
-         </div>
+           <div class="footer-logo-name">Ruqyah Healing</div>
-       </a>
+         </div>
-       <p class="footer-desc">ইসলামী রুকইয়ার মাধ্যমে হালাল হিলিং সার্ভিস। কুরআন ও সুন্নাহ ভিত্তিক আধ্যাত্মিক ও শারীরিক সুস্থতার পথে আপনার বিশ্বস্ত সঙ্গী।</p>
+       </a>
-       <div class="social-links">
+       <p class="footer-desc">ইসলামী রুকইয়ার মাধ্যমে হালাল হিলিং সার্ভিস। কুরআন ও সুন্নাহ ভিত্তিক আধ্যাত্মিক ও শারীরিক সুস্থতার পথে আপনার বিশ্বস্ত সঙ্গী।</p>
-         <a href={socialLinks.facebook} class="social-icon" aria-label="Facebook" title="Facebook" target="_blank" rel="noopener noreferrer">
+       <div class="social-links">
-           <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
+         <a href={socialLinks.facebook} class="social-icon" aria-label="Facebook" title="Facebook
… [diff truncated]

📌 IDE AST Context: Modified symbols likely include [footer.site-footer, script, style]
- **[what-changed] what-changed in index.astro**: -       let nextKey = keys[0][0];
+       let nextKey: (typeof keys)[number][0] = keys[0][0];

📌 IDE AST Context: Modified symbols likely include [allPosts, blogs, services, rakis, packages]
- **[decision] decision in appointment.astro**: File updated (external): src/pages/appointment.astro

Content summary (1053 lines):
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import {
  beforeYouBookChecklist,
  bookingInstructions,
  clinicNumbers,
  clinicSchedule,
  getWhatsappUrl,
  paymentDetails,
  paymentMethods,
  postSubmitGuidelines,
  pricingHighlights,
  primaryContact,
  religionOptions,
  serviceModes,
  sessionFormats,
  specialOffers,
  treatmentCatalog,
  durationOptions,
  genderOptions,
} from '
- **[what-changed] what-changed in index.astro**: File updated (external): src/pages/index.astro

Content summary (1387 lines):
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Header from '../components/Header.astro';
import Hero from '../components/Hero.astro';
import Footer from '../components/Footer.astro';
import ServiceCard from '../components/ServiceCard.astro';
import BlogCard from '../components/BlogCard.astro';
import { getCollection } from 'astro:content';
import { clinicNumbers, clinicSchedule, getWhatsappUrl } from '../data/clinic.js';

const allPosts = await getCollection('posts');
const blo
- **[problem-fix] Patched security issue Helper — prevents XSS injection attacks**: -     // Simple markdown to HTML parser for basic output (bold, lists, links)
+     // Helper to escape HTML to prevent XSS
-     const parseMarkdown = (text: string) => {
+     const escapeHTML = (str: string) => {
-       let html = text
+       return str
-         .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
+         .replace(/&/g, '&amp;')
-         .replace(/\*(.*?)\*/g, '<em>$1</em>')
+         .replace(/</g, '&lt;')
-         .replace(/`([^`]+)`/g, '<code class="bg-gray-200 px-1 rounded text-pink-600">$1</code>')
+         .replace(/>/g, '&gt;')
-         .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-emerald-600 underline" target="_blank">$1</a>')
+         .replace(/"/g, '&quot;')
-         .replace(/\n\n/g, '<br><br>')
+         .replace(/'/g, '&#039;');
-         .replace(/\n/g, '<br>');
+     };
-       return html;
+ 
-     };
+     // Simple markdown to HTML parser for basic output (bold, lists, links)
- 
+     const parseMarkdown = (text: string) => {
-     // UI Builders
+       let escaped = escapeHTML(text);
-     const appendUserMessage = (text: string) => {
+       let html = escaped
-       const msgDiv = document.createElement('div');
+         .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
-       msgDiv.className = "flex flex-col items-end gap-1 mb-2 animate-fade-in";
+         .replace(/\*(.*?)\*/g, '<em>$1</em>')
-       msgDiv.innerHTML = `
+         .replace(/`([^`]+)`/g, '<code class="bg-gray-200 px-1 rounded text-pink-600">$1</code>')
-         <div class="bg-gray-800 text-white border border-gray-700 rounded-2xl rounded-tr-sm px-4 py-2 shadow-sm max-w-[85%] break-words">
+         .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-emerald-600 underline" target="_blank">$1</a>')
-           ${text}
+         .replace(/\n\n/g, '<br><br>')
-         </div>
+         .replace(/\n/g, '<br>');
-       `;
+       return html;
-       messageList?.appendChild(msgDiv);
+     };
-       scrollToBottom();
+ 
-     };
+
… [diff truncated]

📌 IDE AST Context: Modified symbols likely include [div#ai-agent-widget.fixed.bottom-24.left-6.z-50.flex.flex-col.items-start.font-sans, script, style]
- **[convention] Fixed null crash in Error — prevents null/undefined runtime crashes — confirmed 3x**: -     if (window._aiAgentInitialized) return;
+     if ((window as any)._aiAgentInitialized) return;
-     window._aiAgentInitialized = true;
+     (window as any)._aiAgentInitialized = true;
-         const decoder = new TextDecoder();
+         if (!reader) throw new Error("No response body.");
-         let aiText = '';
+         
-         let buffer = '';
+         const decoder = new TextDecoder();
-         aiBubble.innerHTML = '';
+         let aiText = '';
- 
+         let buffer = '';
-         while (true) {
+         aiBubble.innerHTML = '';
-           const { done, value } = await reader.read();
+ 
-           if (done) break;
+         while (true) {
- 
+           const { done, value } = await reader.read();
-           buffer += decoder.decode(value, { stream: true });
+           if (done) break;
-           const lines = buffer.split('\n');
+ 
-           buffer = lines.pop() || '';
+           buffer += decoder.decode(value, { stream: true });
- 
+           const lines = buffer.split('\n');
-           for (const line of lines) {
+           buffer = lines.pop() || '';
-             if (line.startsWith('data: ')) {
+ 
-               const dataStr = line.slice(6).trim();
+           for (const line of lines) {
-               if (dataStr === '[DONE]') break;
+             if (line.startsWith('data: ')) {
-               if (!dataStr) continue;
+               const dataStr = line.slice(6).trim();
- 
+               if (dataStr === '[DONE]') break;
-               try {
+               if (!dataStr) continue;
-                 const data = JSON.parse(dataStr);
+ 
-                 const delta = data.choices?.[0]?.delta?.content;
+               try {
-                 if (delta) {
+                 const data = JSON.parse(dataStr);
-                   aiText += delta;
+                 const delta = data.choices?.[0]?.delta?.content;
-                   aiBubble.innerHTML = parseMarkdown(aiText);
+                 if (delta) {
-                  
… [diff truncated]

📌 IDE AST Context: Modified symbols likely include [div#ai-agent-widget.fixed.bottom-24.left-6.z-50.flex.flex-col.items-start.font-sans, script, style]
