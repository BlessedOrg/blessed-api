import z from "zod";

const OtpCodeSchema = z.object({
  code: z.string().min(5).max(5)
});

const EmailSchema = z.object({
  email: z.string().email()
});

export { OtpCodeSchema, EmailSchema };