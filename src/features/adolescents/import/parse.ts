import { IMPORT_COLUMNS, MAX_IMPORT_ROWS, type ImportCatalogs, type ImportKey, type ImportRecord } from "./columns";

export type ParsedRow = { rowNumber: number; data: ImportRecord; errors: string[] };
export type ParseResult = { rows: ParsedRow[]; missingColumns: string[]; ignoredHeaders: string[]; sheetName: string };

const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

const pad = (n: number) => String(n).padStart(2, "0");

/** Número de serie de Excel (días desde 1899-12-30) → AAAA-MM-DD */
function excelSerialToIso(serial: number): string {
  const d = new Date(Date.UTC(1899, 11, 30) + Math.round(serial) * 86_400_000);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

function cellToText(key: ImportKey, value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "number" && key === "birth_date") {
    return excelSerialToIso(value);
  }
  if (typeof value === "number" && (key === "phone" || key === "guardian_phone")) {
    return String(Math.trunc(value));
  }
  return String(value).trim();
}

export async function parseImportFile(file: File): Promise<ParseResult> {
  const XLSX = await import("xlsx");
  const isCsv = /\.csv$/i.test(file.name);
  // En CSV se leen los textos tal cual: evita que "03/04/2011" se interprete como fecha de EE. UU.
  const workbook = XLSX.read(await file.arrayBuffer(), { type: "array", raw: isCsv, codepage: 65001 });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) return { rows: [], missingColumns: IMPORT_COLUMNS.map((c) => c.label), ignoredHeaders: [], sheetName: "" };

  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "", raw: true });
  const headers = raw.length ? Object.keys(raw[0]) : [];

  // Asocia cada encabezado del archivo con una columna conocida
  const mapping = new Map<string, ImportKey>();
  const ignoredHeaders: string[] = [];
  for (const header of headers) {
    const norm = normalize(header);
    const col = IMPORT_COLUMNS.find((c) => (c.aliases as readonly string[]).includes(norm));
    if (col && ![...mapping.values()].includes(col.key)) mapping.set(header, col.key);
    else if (header.trim()) ignoredHeaders.push(header);
  }

  const mapped = new Set(mapping.values());
  const missingColumns = IMPORT_COLUMNS.filter((c) => c.required && !mapped.has(c.key)).map((c) => c.label);

  const rows: ParsedRow[] = raw.slice(0, MAX_IMPORT_ROWS).map((line, i) => {
    const data = Object.fromEntries(IMPORT_COLUMNS.map((c) => [c.key, ""])) as ImportRecord;
    for (const [header, key] of mapping) data[key] = cellToText(key, line[header]);
    return { rowNumber: i + 2, data, errors: [] }; // fila 1 = encabezados
  });

  return {
    rows: rows.filter((r) => Object.values(r.data).some(Boolean)),
    missingColumns,
    ignoredHeaders,
    sheetName,
  };
}

/** Validación previa en el navegador. La base de datos vuelve a validar al importar. */
export function validateRows(rows: ParsedRow[], catalogs: ImportCatalogs): ParsedRow[] {
  const agapes = new Set(catalogs.agapes.map(normalize));
  const clans = new Set(catalogs.clans.flatMap((c) => [normalize(c.name), normalize(c.slug)]));
  const relationships = new Set(catalogs.relationships.map(normalize));
  const courses = new Set(catalogs.courses.map(normalize));
  const seen = new Map<string, number>();

  return rows.map((row) => {
    const d = row.data;
    const errors: string[] = [];

    if (!d.first_name) errors.push("Faltan nombres");
    if (!d.last_name) errors.push("Faltan apellidos");
    if (!/^[mhf]/i.test(d.sex)) errors.push("Sexo debe ser M o F");

    if (d.birth_date && !/^\d{4}-\d{2}-\d{2}$/.test(d.birth_date) && !/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(d.birth_date)) {
      errors.push("Fecha no válida (usa DD/MM/AAAA)");
    }

    if (!d.agape_name) errors.push("Falta el ágape");
    else if (!agapes.has(normalize(d.agape_name))) errors.push(`Ágape "${d.agape_name}" no existe`);

    if (!d.clan_name) errors.push("Falta el clan");
    else if (!clans.has(normalize(d.clan_name))) errors.push(`Clan "${d.clan_name}" no existe`);

    if (d.guardian_relationship && !relationships.has(normalize(d.guardian_relationship))) {
      errors.push(`Parentesco "${d.guardian_relationship}" no existe`);
    }
    if ((d.guardian_first_name || d.guardian_last_name) && !d.guardian_phone) {
      errors.push("Falta el teléfono del apoderado");
    }
    if (d.bible_course && !courses.has(normalize(d.bible_course))) errors.push(`Curso "${d.bible_course}" no existe`);

    const key = `${normalize(d.first_name)}|${normalize(d.last_name)}|${d.birth_date}`;
    if (d.first_name && d.last_name) {
      const first = seen.get(key);
      if (first) errors.push(`Repetido con la fila ${first}`);
      else seen.set(key, row.rowNumber);
    }

    return { ...row, errors };
  });
}

/** Descarga la plantilla oficial con una fila de ejemplo. */
export async function downloadTemplate(catalogs: ImportCatalogs) {
  const XLSX = await import("xlsx");
  const example = [
    "Ana Lucía", "Pérez Ramos", "F", "15/03/2011", "987654321", "IE Santa Rosa",
    catalogs.agapes[0] ?? "Nombre del ágape", catalogs.clans[0]?.name ?? "Nombre del clan",
    "Rosa", "Ramos", "999111222", catalogs.relationships[0] ?? "Madre", "",
  ];
  const sheet = XLSX.utils.aoa_to_sheet([IMPORT_COLUMNS.map((c) => c.label), example]);
  sheet["!cols"] = IMPORT_COLUMNS.map((c) => ({ wch: Math.max(14, c.label.length + 2) }));

  const lists = XLSX.utils.aoa_to_sheet([
    ["Ágapes", "Clanes", "Parentescos", "Cursos"],
    ...Array.from(
      { length: Math.max(catalogs.agapes.length, catalogs.clans.length, catalogs.relationships.length, catalogs.courses.length) },
      (_, i) => [catalogs.agapes[i] ?? "", catalogs.clans[i]?.name ?? "", catalogs.relationships[i] ?? "", catalogs.courses[i] ?? ""],
    ),
  ]);

  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Adolescentes");
  XLSX.utils.book_append_sheet(book, lists, "Valores válidos");
  XLSX.writeFile(book, "plantilla_adolescentes_DNS.xlsx");
}
