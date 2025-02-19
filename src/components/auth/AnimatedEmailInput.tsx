
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
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();
  const typeIntervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!isTyping && !isFocused) {
      // Start new typing animation
      const startTyping = () => {
        const targetText = EXAMPLE_EMAILS[currentExample];
        let currentIndex = 0;
        setDisplayedText("");

        typeIntervalRef.current = setInterval(() => {
          if (currentIndex <= targetText.length) {
            setDisplayedText(targetText.slice(0, currentIndex));
            currentIndex++;
          } else {
            if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
            
            // Wait before starting next email
            setTimeout(() => {
              setCurrentExample((prev) => (prev + 1) % EXAMPLE_EMAILS.length);
            }, 2000);
          }
        }, 100);
      };

      startTyping();
    }

    return () => {
      if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [currentExample, isTyping, isFocused]);

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
              placeholder={isFocused ? "votre@email.com" : displayedText}
              className="h-10 bg-white"
              onFocus={() => {
                setIsFocused(true);
                setIsTyping(true);
              }}
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
