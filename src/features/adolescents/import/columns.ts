/** Columnas de la plantilla Excel ↔ columnas de public.staging_adolescents */
export const IMPORT_COLUMNS = [
  { key: "first_name", label: "Nombres", required: true, aliases: ["nombres", "nombre", "first_name"] },
  { key: "last_name", label: "Apellidos", required: true, aliases: ["apellidos", "apellido", "last_name"] },
  { key: "sex", label: "Sexo (M/F)", required: true, aliases: ["sexo", "sexo_m_f", "genero", "sex"] },
  { key: "birth_date", label: "Fecha de nacimiento", required: false, aliases: ["fecha_de_nacimiento", "fecha_nacimiento", "nacimiento", "birth_date"] },
  { key: "phone", label: "Celular", required: false, aliases: ["celular", "telefono", "phone"] },
  { key: "school_name", label: "Colegio", required: false, aliases: ["colegio", "school_name"] },
  { key: "agape_name", label: "Ágape", required: true, aliases: ["agape", "agape_name"] },
  { key: "clan_name", label: "Clan", required: true, aliases: ["clan", "clan_name"] },
  { key: "guardian_first_name", label: "Apoderado nombres", required: false, aliases: ["apoderado_nombres", "apoderado", "guardian_first_name"] },
  { key: "guardian_last_name", label: "Apoderado apellidos", required: false, aliases: ["apoderado_apellidos", "guardian_last_name"] },
  { key: "guardian_phone", label: "Apoderado teléfono", required: false, aliases: ["apoderado_telefono", "telefono_apoderado", "guardian_phone"] },
  { key: "guardian_relationship", label: "Parentesco", required: false, aliases: ["parentesco", "guardian_relationship"] },
  { key: "bible_course", label: "Curso Escuela Bíblica", required: false, aliases: ["curso_escuela_biblica", "curso", "escuela_biblica", "bible_course"] },
] as const;

export type ImportKey = (typeof IMPORT_COLUMNS)[number]["key"];
export type ImportRecord = Record<ImportKey, string>;

export type ImportCatalogs = {
  agapes: string[];
  clans: { name: string; slug: string }[];
  relationships: string[];
  courses: string[];
};

export const MAX_IMPORT_ROWS = 2000;
