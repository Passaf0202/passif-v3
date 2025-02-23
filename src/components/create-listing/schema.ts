
import * as z from "zod";

export const formSchema = z.object({
  title: z.string().min(3, "Le titre doit faire au moins 3 caractères"),
  description: z.string().min(10, "La description doit faire au moins 10 caractères"),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Le prix doit être un nombre positif",
  }),
  location: z.string().min(2, "La localisation est requise"),
  crypto_currency: z.string().default("POL"),
  crypto_amount: z.number().default(0),
});

export type FormValues = z.infer<typeof formSchema>;
