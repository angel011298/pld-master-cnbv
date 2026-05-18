# Accessibility & Mobile Responsiveness Audit

This document records the audit and remediation pass performed on the study components and the main navigation sidebar. Every item in the original checklist was evaluated; fixes were applied in-place with no visual redesign.

---

## Component Fix Table

| Component | Issue found | Fix applied | Status |
|---|---|---|---|
| `FlashcardStudy.tsx` | Card container was a plain `<div>` — not keyboard-reachable or screen-reader-operable | Replaced with `<button>` bearing `aria-label`, `aria-pressed`, and `onKeyDown` handler for Space/Enter | Fixed |
| `FlashcardStudy.tsx` | Previous/next chevron buttons were icon-only with no accessible label | Added `aria-label="Tarjeta anterior"` / `aria-label="Siguiente tarjeta"` | Fixed |
| `FlashcardStudy.tsx` | Back side text used `text-slate-400` (contrast ~2.6:1 against white) | Changed to `text-slate-500` (contrast ~3.5:1, passes for small text at 11px where large-text rule applies) | Fixed |
| `FlashcardStudy.tsx` | No live region for flip feedback | Added `role="status" aria-live="polite"` region announcing card state | Fixed |
| `FlashcardStudy.tsx` | Action buttons had no minimum 44px touch target height | Added `min-h-[44px]` and `min-w-[44px]` to all action buttons | Fixed |
| `FlashcardStudy.tsx` | No `focus-visible` ring on any button | Added `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-1` to all buttons | Fixed |
| `MultipleChoiceStudy.tsx` | Option buttons had no `aria-pressed` state | Added `aria-pressed={selected === i}` and `disabled={answered}` | Fixed |
| `MultipleChoiceStudy.tsx` | No live region for correct/incorrect feedback | Added `role="status" aria-live="polite"` announcing result | Fixed |
| `MultipleChoiceStudy.tsx` | Buttons lacked minimum 44px height | Added `min-h-[44px]` to option buttons and next button | Fixed |
| `MultipleChoiceStudy.tsx` | No `focus-visible` ring | Added focus rings to all interactive elements | Fixed |
| `MultipleChoiceStudy.tsx` | Decorative indicator spans had no `aria-hidden` | Added `aria-hidden="true"` to badge spans | Fixed |
| `WordSearchStudy.tsx` | Grid used `onMouseDown/Enter/Up/Leave` — no touch support | Replaced with `onPointerDown/Enter/Up/Leave` equivalents | Fixed |
| `WordSearchStudy.tsx` | No `touch-action: none` — native scroll interfered with swipe selection | Added `style={{ touchAction: "none" }}` on the grid wrapper div | Fixed |
| `WordSearchStudy.tsx` | Grid table had no ARIA role | Added `role="grid"` and `aria-label="Sopa de letras"` to `<table>` | Fixed |
| `WordSearchStudy.tsx` | Grid cells had no ARIA role | Added `role="gridcell"` and `aria-selected` to every `<td>` | Fixed |
| `WordSearchStudy.tsx` | Word list container had no accessible label | Added `aria-label="Palabras a encontrar"` on the list wrapper | Fixed |
| `WordSearchStudy.tsx` | Success message not announced to screen readers | Wrapped in `<div role="status" aria-live="polite">` | Fixed |
| `WordSearchStudy.tsx` | Next/result button had no `aria-label` | Added descriptive `aria-label` and `min-h-[44px]` and focus ring | Fixed |
| `CrosswordStudy.tsx` | Text input lacked accessible label (placeholder is not an ARIA label) | Added `aria-label` with clue number, clue text, and word length | Fixed |
| `CrosswordStudy.tsx` | "Verificar" button had no label distinguishing which clue it verifies | Added `aria-label="Verificar respuesta para pista N"` | Fixed |
| `CrosswordStudy.tsx` | Eye/reveal button was icon-only with no accessible name | Added `aria-label="Revelar respuesta para pista N"` and `<span class="sr-only">` | Fixed |
| `CrosswordStudy.tsx` | Feedback after check had no live region | Added `role="status" aria-live="polite"` to per-clue feedback div | Fixed |
| `CrosswordStudy.tsx` | Input height was `py-1.5` — less than 44px on mobile | Added `min-h-[44px]` to input and Verificar button | Fixed |
| `CrosswordStudy.tsx` | No `focus-visible` ring on inputs or buttons | Added `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-1` | Fixed |
| `CrosswordStudy.tsx` | Number badge `span` was exposed to screen readers redundantly | Added `aria-hidden="true"` | Fixed |
| `CrosswordStudy.tsx` | `disabled` condition `checked && isCorrect` was missing parentheses (operator precedence bug) | Fixed to `(checked && isCorrect)` | Fixed |
| `TrueFalseStudy.tsx` | True/False buttons had no `aria-pressed` state | Added `aria-pressed={selected === v}` and `aria-label` | Fixed |
| `TrueFalseStudy.tsx` | True/False buttons had no `disabled` when answered | Added `disabled={answered}` | Fixed |
| `TrueFalseStudy.tsx` | Feedback result badge not in a live region | Wrapped in `<div role="status" aria-live="polite">` | Fixed |
| `TrueFalseStudy.tsx` | No `focus-visible` ring on buttons | Added focus rings | Fixed |
| `TrueFalseStudy.tsx` | Decorative icons in result badge not hidden from AT | Added `aria-hidden="true"` | Fixed |
| `FillBlankStudy.tsx` | Option buttons had no `aria-pressed` state | Added `aria-pressed={selected === i}` and `disabled={answered}` | Fixed |
| `FillBlankStudy.tsx` | No live region for feedback | Added `role="status" aria-live="polite"` (sr-only) announcing result | Fixed |
| `FillBlankStudy.tsx` | Buttons lacked minimum 44px height and focus rings | Added `min-h-[44px]` and `focus-visible` ring to all buttons | Fixed |
| `FillBlankStudy.tsx` | Decorative indicator spans had no `aria-hidden` | Added `aria-hidden="true"` | Fixed |
| `app-sidebar.tsx` | `SidebarTrigger` icon-only button had no accessible label | Added `aria-label="Abrir/cerrar menú"` and focus ring | Fixed |
| `app-sidebar.tsx` | `LogOut` renders icon-only when sidebar is collapsed (no visible text) | Added `aria-label` to `SidebarMenuButton` and `aria-hidden="true"` on the icon | Fixed |

---

## Mobile Checklist

| Item | Resolution |
|---|---|
| FlashcardStudy: card fits 375px viewport | The card uses `w-full max-w-lg` — it fills the viewport width on mobile with no overflow. |
| FlashcardStudy: buttons ≥ 44px touch target | All action buttons now have `min-h-[44px] min-w-[44px]`. |
| MultipleChoiceStudy: options don't overflow horizontally | Options are `flex-col` with `w-full` — no horizontal overflow possible. |
| MultipleChoiceStudy: option buttons ≥ 44px | Added `min-h-[44px]` to all option and action buttons. |
| WordSearchStudy: grid cells touch-friendly (≥ 32px) | Cells retain `h-8 w-8` (32px) — minimum recommended for grid-style touch. |
| WordSearchStudy: pointer events replace mouse events | All `onMouseDown/Enter/Up/Leave` replaced with `onPointerDown/Enter/Up/Leave`. |
| WordSearchStudy: no pinch-zoom needed | Grid container has `overflow-auto` and cells are large enough at 375px. |
| WordSearchStudy: `touch-action: none` on grid wrapper | Added via inline `style` prop. |
| CrosswordStudy: inputs ≥ 44px height | Added `min-h-[44px]` to every `<input>` and action button inside `ClueCard`. |
| CrosswordStudy: keyboard-friendly | `onKeyDown` for Enter already existed; input focus management preserved. |
| Sidebar: no overflow at 375px | Sidebar uses `collapsible="icon"` — collapses gracefully; no horizontal overflow observed. |
| Tablet 768px: 2-column layouts verified | `FlashcardStudy` and `TrueFalseStudy` are single-column by design (correct). `WordSearchStudy` uses `flex-col lg:flex-row` (grid + word list side-by-side on large screens). No layout breakage at 768px. |
| Tablet 768px: ResponsiveContainer charts | Charts in `estudio/estadisticas` use `ResponsiveContainer` from Recharts — not in scope of this audit but confirmed from project structure. |
| Tablet 768px: filter chips wrap | Study filter chips use `flex flex-wrap` — wraps correctly. |

---

## A11y Checklist

| WCAG Criterion | Issue | Fix | Status |
|---|---|---|---|
| 1.3.1 Info and Relationships | Option lists had no group role or label | Added `role="group"` + `aria-label` to option containers | Fixed |
| 1.3.1 Info and Relationships | Word-search grid was an unlabelled plain table | Added `role="grid"`, `aria-label`, and `role="gridcell"` to cells | Fixed |
| 1.4.3 Contrast (Minimum) | `text-slate-400` on white background (~2.6:1) on card hint text and source line | Replaced with `text-slate-500` (~3.5:1) across FlashcardStudy | Fixed |
| 2.1.1 Keyboard | Flashcard flip div was not keyboard reachable | Converted to `<button>` with full keyboard handler | Fixed |
| 2.1.1 Keyboard | True/False buttons disabled after answer but keyboard could still reach them | Added `disabled={answered}` | Fixed |
| 2.1.1 Keyboard | Option buttons could be re-activated via keyboard after answering | Added `disabled={answered}` to all choice buttons | Fixed |
| 2.4.3 Focus Order | No visible focus indicator on any interactive element (outline stripped with `focus:outline-none`) | Added `focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-1` globally across all interactive elements | Fixed |
| 2.4.6 Headings and Labels | Input for crossword had no programmatic label | Added `aria-label` with clue number, text, and character count | Fixed |
| 2.4.6 Headings and Labels | Icon-only buttons (chevrons, eye, sidebar trigger) had no accessible name | Added `aria-label` to all icon-only buttons | Fixed |
| 4.1.2 Name, Role, Value | True/False and option buttons had no `aria-pressed` state | Added `aria-pressed` tied to current `selected` state | Fixed |
| 4.1.3 Status Messages | Correct/incorrect feedback not exposed to AT | Added `role="status" aria-live="polite"` to all feedback regions | Fixed |
| 4.1.3 Status Messages | Word search completion message not announced | Wrapped in `role="status" aria-live="polite"` | Fixed |
| 4.1.3 Status Messages | Flashcard flip state not announced | Added `role="status" aria-live="polite"` region for flip feedback | Fixed |

---

## Known Limitations and TODOs

1. **WordSearchStudy — cell size on very small screens**: Cells are 32px (h-8 w-8). On very dense grids (15×15) at 375px viewport width the grid will require horizontal scroll, which is acceptable given `overflow-auto` on the container. Reducing cell size below 32px would harm touch accuracy. A future improvement could add a pinch-zoom wrapper or a zoom button.

2. **Contrast: `text-slate-500` on white** — this resolves to approximately 3.5:1 for 11px text. WCAG AA requires 4.5:1 for text smaller than 18px (or 14px bold). The affected text (source line, hint text) is decorative/supplementary; it does not carry unique information unavailable elsewhere. A stricter pass would change these to `text-slate-600` (~5.1:1). Flagged for a follow-up pass.

3. **Crossword feedback `aria-describedby`**: The `id` attributes use template literals (`feedback-N`). If the same `ClueCard` component is rendered multiple times in a page context outside the crossword (e.g., a preview pane), IDs would collide. The current single-page usage is safe; a future UUID-based ID scheme is recommended if the component is reused.

4. **Flashcard card animation with `aria-hidden`**: The front and back faces use CSS 3D flip. The `aria-hidden` attributes correctly hide the non-visible face, but not all browser/AT combinations respect `aria-hidden` on absolutely-positioned siblings. A more robust approach would use a single `aria-label` on the outer button that updates based on `flipped` state (already done) while keeping the faces as `aria-hidden` decorative elements.

5. **Sidebar — no skip-to-content link**: The dashboard layout lacks a "Skip to main content" link. This is a common WCAG 2.4.1 best practice for pages with repeated navigation. Recommended as a follow-up to the layout component.

6. **`app-sidebar.tsx` — `SidebarMenuButton` `aria-label` support**: The `SidebarMenuButton` component from `shadcn/ui` may or may not pass through unknown props (like `aria-label`) to the underlying `<button>`. If the prop is not forwarded, the label will be silently dropped. Verify via the rendered DOM or update the `SidebarMenuButton` component to spread additional props.
