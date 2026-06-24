import { ReactNode } from 'react';
import { FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';

interface FormFieldProps {
  label: string;
  children: ReactNode;
  description?: string;
  error?: string;
}

export function FormField({ label, children, description, error }: FormFieldProps) {
  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        {children}
      </FormControl>
      {description && <FormDescription>{description}</FormDescription>}
      {error && <FormMessage>{error}</FormMessage>}
    </FormItem>
  );
}