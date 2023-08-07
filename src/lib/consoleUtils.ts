export function getConsoleSize() {
  return {
    columns: process.stdout.columns,
    rows: process.stdout.rows
  };
}