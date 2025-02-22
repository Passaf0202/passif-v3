
import { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { UseFormReturn } from 'react-hook-form';

const EXAMPLE_EMAILS = [
  "john@tradecoiner.com",
  "sarah@tradecoiner.com",
  "marc@tradecoiner.com",
  "julie@tradecoiner.com",
  "david@tradecoiner.com",
  "emma@tradecoiner.com"
];

interface AnimatedEmailInputProps {
  form: UseFormReturn<any>;
}

export function AnimatedEmailInput({ form }: AnimatedEmailInputProps) {
  const [currentExample, setCurrentExample] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!isTyping) {
      intervalRef.current = setInterval(() => {
        setCurrentExample(prev => (prev + 1) % EXAMPLE_EMAILS.length);
      }, 2000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isTyping]);

  return (
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem className="space-y-1">
          <FormLabel className="text-sm font-medium">
            E-mail <span className="text-red-500">*</span>
          </FormLabel>
          <FormControl>
            <Input
              {...field}
              type="email"
              placeholder={isTyping ? "votre@email.com" : EXAMPLE_EMAILS[currentExample]}
              className="h-10"
              onFocus={() => setIsTyping(true)}
              onChange={(e) => {
                setIsTyping(true);
                field.onChange(e);
              }}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
}
