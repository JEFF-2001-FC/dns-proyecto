"use client";

import Link from "next/link";
import { useMemo, useRef, useState, useTransition } from "react";
import { CheckCircle2, Download, FileSpreadsheet, TriangleAlert, Upload } from "lucide-react";
import { importAdolescents, type ImportResult } from "../actions";
import { IMPORT_COLUMNS, type ImportCatalogs } from "../columns";
import { downloadTemplate, parseImportFile, validateRows, type ParsedRow } from "../parse";

type Step = { name: "pick" } | { name: "preview"; fileName: string; rows: ParsedRow[]; ignored: string[] } | { name: "done"; result: Extract<ImportResult, { ok: true }> };

const PREVIEW_COLUMNS = IMPORT_COLUMNS.filter((c) =>
  ["first_name", "last_name", "sex", "birth_date", "agape_name", "clan_name", "guardian_phone"].includes(c.key),
);

export function ImportWizard({ catalogs }: { catalogs: ImportCatalogs }) {
  const [step, setStep] = useState<Step>({ name: "pick" });
  const [message, setMessage] = useState("");
  const [onlyErrors, setOnlyErrors] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [reading, setReading] = useState(false);
  const [importing, startImport] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setMessage("");
    if (!/\.(xlsx|xls|csv)$/i.test(file.name)) {
      setMessage("Sube un archivo .xlsx, .xls o .csv.");
      return;
    }
    setReading(true);
    try {
      const parsed = await parseImportFile(file);
      if (parsed.missingColumns.length) {
        setMessage(`Faltan columnas obligatorias: ${parsed.missingColumns.join(", ")}. Descarga la plantilla.`);
        return;
      }
      if (parsed.rows.length === 0) {
        setMessage("El archivo no tiene filas con datos.");
        return;
      }
      setStep({ name: "preview", fileName: file.name, rows: validateRows(parsed.rows, catalogs), ignored: parsed.ignoredHeaders });
    } catch {
      setMessage("No se pudo leer el archivo. Verifica que no esté dañado o protegido con contraseña.");
    } finally {
      setReading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const stats = useMemo(() => {
    if (step.name !== "preview") return { valid: 0, invalid: 0 };
    const invalid = step.rows.filter((r) => r.errors.length).length;
    return { valid: step.rows.length - invalid, invalid };
  }, [step]);

  function runImport() {
    if (step.name !== "preview") return;
    const valid = step.rows.filter((r) => r.errors.length === 0).map((r) => r.data);
    startImport(async () => {
      const result = await importAdolescents(valid);
      if (!result.ok) {
        setMessage(result.message);
        return;
      }
      setStep({ name: "done", result });
    });
  }

  if (step.name === "done") {
    const { result } = step;
    return (
      <div className="space-y-5">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <CheckCircle2 className="h-6 w-6 text-emerald-700" aria-hidden />
          <p className="mt-3 text-lg font-semibold text-emerald-900">{result.imported} adolescentes importados</p>
          {result.failed > 0 && <p className="text-sm text-emerald-900">{result.failed} filas no se pudieron importar.</p>}
          <p className="mt-1 text-xs text-emerald-800">Lote: {result.batch}</p>
        </div>

        {result.errors.length > 0 && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-5">
            <p className="font-medium">Filas rechazadas por la base de datos</p>
            <ul className="mt-3 space-y-2 text-sm">
              {result.errors.map((e, i) => (
                <li key={i} className="flex flex-col sm:flex-row sm:gap-2">
                  <span className="font-medium">{e.name}</span>
                  <span className="text-red-700">{e.error}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <Link href="/adolescentes" className="rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800">
            Ver adolescentes
          </Link>
          <button type="button" onClick={() => setStep({ name: "pick" })} className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium hover:bg-zinc-50">
            Importar otro archivo
          </button>
        </div>
      </div>
    );
  }

  if (step.name === "preview") {
    const rows = onlyErrors ? step.rows.filter((r) => r.errors.length) : step.rows;
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="h-5 w-5 text-zinc-500" aria-hidden />
            <div>
              <p className="font-medium">{step.fileName}</p>
              <p className="text-sm text-zinc-500">
                <span className="text-emerald-700">{stats.valid} listas</span>
                {stats.invalid > 0 && <span className="text-red-700">, {stats.invalid} con errores (no se importarán)</span>}
              </p>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={onlyErrors} onChange={(e) => setOnlyErrors(e.target.checked)} className="accent-zinc-900" />
            Ver solo errores
          </label>
        </div>

        {step.ignored.length > 0 && (
          <p className="text-sm text-zinc-500">Columnas ignoradas: {step.ignored.join(", ")}</p>
        )}

        <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-zinc-200 bg-zinc-50 text-zinc-500">
              <tr>
                <th className="px-3 py-2 font-medium">Fila</th>
                {PREVIEW_COLUMNS.map((c) => (
                  <th key={c.key} className="px-3 py-2 font-medium">{c.label}</th>
                ))}
                <th className="px-3 py-2 font-medium">Observación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {rows.slice(0, 300).map((r) => (
                <tr key={r.rowNumber} className={r.errors.length ? "bg-red-50/60" : undefined}>
                  <td className="px-3 py-2 text-zinc-500">{r.rowNumber}</td>
                  {PREVIEW_COLUMNS.map((c) => (
                    <td key={c.key} className="px-3 py-2">{r.data[c.key] || <span className="text-zinc-300">—</span>}</td>
                  ))}
                  <td className="px-3 py-2">
                    {r.errors.length ? <span className="text-red-700">{r.errors.join("; ")}</span> : <span className="text-emerald-700">OK</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rows.length > 300 && <p className="p-3 text-xs text-zinc-500">Mostrando 300 de {rows.length} filas.</p>}
        </div>

        {message && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{message}</p>}

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={runImport}
            disabled={importing || stats.valid === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            <Upload className="h-4 w-4" aria-hidden />
            {importing ? "Importando…" : `Importar ${stats.valid} ${stats.valid === 1 ? "fila" : "filas"}`}
          </button>
          <button
            type="button"
            onClick={() => setStep({ name: "pick" })}
            disabled={importing}
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium hover:bg-zinc-50"
          >
            Cambiar archivo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files[0]);
        }}
        className={`rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
          dragging ? "border-zinc-900 bg-zinc-100" : "border-zinc-300 bg-white"
        }`}
      >
        <FileSpreadsheet className="mx-auto h-8 w-8 text-zinc-400" aria-hidden />
        <p className="mt-3 font-medium">Arrastra tu Excel aquí</p>
        <p className="mt-1 text-sm text-zinc-500">.xlsx, .xls o .csv, hasta 2 000 filas</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={reading}
          className="mt-5 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
        >
          {reading ? "Leyendo…" : "Elegir archivo"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="sr-only"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      {message && (
        <p role="alert" className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {message}
        </p>
      )}

      <button
        type="button"
        onClick={() => downloadTemplate(catalogs)}
        className="inline-flex items-center gap-2 text-sm font-medium text-zinc-700 underline-offset-4 hover:underline"
      >
        <Download className="h-4 w-4" aria-hidden /> Descargar plantilla con valores válidos
      </button>
    </div>
  );
}
