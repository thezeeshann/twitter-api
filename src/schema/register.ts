import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(5).max(50),
  userName: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long",
  }),
  profileImgUrl: z.string().optional(),
  backImgUrl: z.string().optional(),
  bio: z.string().optional(),
  dateOfBirth: z.string().transform((val) => new Date(val)),
});
