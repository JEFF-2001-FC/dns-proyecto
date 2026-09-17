import { z } from "zod";

const status = z.enum(["present", "late", "absent", "justified"]);

const meetingKey = {
  agapeId: z.uuid({ error: "Elige el ágape" }),
  meetingTypeId: z.uuid({ error: "Elige el tipo de reunión" }),
  date: z.iso.date({ error: "Fecha no válida" }),
  topic: z.string().trim().min(2, { error: "Escribe el tema" }).max(120),
};

export const saveAttendanceSchema = z.object({
  ...meetingKey,
  records: z
    .array(z.object({ adolescentId: z.uuid(), status }))
    .min(1, { error: "No hay adolescentes para guardar" })
    .max(500),
});

export const expressRegisterSchema = z.object({
  ...meetingKey,
  firstName: z.string().trim().min(2, { error: "Escribe los nombres" }).max(60),
  lastName: z.string().trim().min(2, { error: "Escribe los apellidos" }).max(60),
  sex: z.enum(["male", "female"], { error: "Elige el sexo" }),
  clanId: z.uuid({ error: "Elige el clan" }),
  phone: z.string().trim().max(20).optional(),
  guardianPhone: z.string().trim().max(20).optional(),
});

export type SaveAttendanceInput = z.infer<typeof saveAttendanceSchema>;
export type ExpressRegisterInput = z.infer<typeof expressRegisterSchema>;
