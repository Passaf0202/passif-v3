
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { AnimatedEmailInput } from "./AnimatedEmailInput";

const emailSchema = z.object({
  email: z.string().email("Veuillez entrer une adresse email valide"),
});

type EmailStepProps = {
  onSubmit: (values: z.infer<typeof emailSchema>) => void;
};

export function EmailStep({ onSubmit }: EmailStepProps) {
  const form = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <AnimatedEmailInput form={form} />
        <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600">
          Continuer
        </Button>
      </form>
    </Form>
  );
}
