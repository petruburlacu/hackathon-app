type Cell = string | number;

// A leading = + - @ tab or CR makes Excel and Sheets run the cell as a formula; team names are user input.
const FORMULA_START = /^[=+\-@\t\r]/;

function csvCell(value: Cell): string {
  if (typeof value === "number") return String(value);
  const text = FORMULA_START.test(value) ? `'${value}` : value;
  return /[",\r\n]/.test(text) || text !== value
    ? `"${text.replace(/"/g, '""')}"`
    : text;
}

export function toCsv(
  header: readonly string[],
  rows: readonly (readonly Cell[])[],
): string {
  return (
    [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n") +
    "\r\n"
  );
}
