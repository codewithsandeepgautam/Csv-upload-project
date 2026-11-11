# CSV Explorer — Upload, View & Filter

React + TypeScript + Tailwind CSS web page where you upload a CSV, see it in a structured table, and refine it with dynamic, stackable filters.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in /dist
```

Needs Node 18+. Click **Try the sample data** on the first screen to load the bundled shampoo share-of-shelf CSV (1,000 rows).

## Features

**Upload & view**
- Drag-and-drop or file picker (`.csv`), parsed in the browser with PapaParse — nothing leaves your machine
- Handles quoted fields, commas inside values, blank lines, and shows friendly errors for empty / wrong files
- Sticky header, row numbers, sortable columns (asc → desc → off), pagination (25/50/100/250 per page)
- Columns are auto-typed (text, number, date, boolean) so numbers right-align and sort numerically

**Filtering**
- Add as many filters as you want; each is `column + operator + value`
- Operators depend on column type
  - Text: contains, does not contain, equals, does not equal, starts with, ends with, is one of, is empty / not empty
  - Number: = ≠ > ≥ < ≤, between, is empty / not empty
  - Date: on, before, after, between, is empty / not empty
  - Boolean: is true, is false, is empty / not empty
- Multiple filters apply together: **ALL (AND)** or **ANY (OR)** toggle
- Several filters on the same column are allowed (e.g. price > 200 AND price < 400)
- Manage filters: add, remove, duplicate, switch off/on without deleting, clear all
- Incomplete filters (no value yet) are ignored and flagged instead of emptying the table
- Value suggestions for columns with few distinct values (datalist / multi-select checklist)
- Live "showing X of Y rows" count and a clear empty state when nothing matches

**Extras**
- Global search across all columns (combines with filters)
- Export the filtered rows back to CSV

## Structure

```
src/
  App.tsx                      page state: dataset, filters, match mode, search
  types.ts
  lib/csv.ts                   parsing, type inference, export
  lib/filters.ts               operators per type + filter engine
  components/
    FileUpload.tsx
    filters/FilterPanel.tsx    add / clear / AND-OR
    filters/FilterRow.tsx      one filter (column, operator, value, actions)
    table/DataTable.tsx        sorting + pagination + empty state
    ui/Button.tsx, MultiSelect.tsx
public/sample-shampoo.csv
```

## Notes
- Dates are detected in ISO format (`YYYY-MM-DD`, optionally with time).
- All processing is client-side, so very large files (hundreds of MB) depend on browser memory.
