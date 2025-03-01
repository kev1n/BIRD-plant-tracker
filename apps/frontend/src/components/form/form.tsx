import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FormEvent, ReactNode } from 'react';

interface FormProps {
  children: ReactNode;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  title?: string;
  subtitle?: string;
  submitText?: string;
  isSubmitting?: boolean;
  className?: string;
}

export function Form({
  children,
  onSubmit,
  title,
  subtitle,
  submitText = 'Submit',
  isSubmitting = false,
  className,
}: FormProps) {
  return (
    <form 
      className={cn(
        "flex flex-col gap-4 p-8 rounded-lg bg-white shadow-md w-full max-w-[450px]",
        className
      )}
      onSubmit={onSubmit}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h2 className="text-2xl m-0 text-center">{title}</h2>}
          {subtitle && <p className="text-muted-foreground mt-2 mb-0 text-center">{subtitle}</p>}
        </div>
      )}

      {children}

      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full mt-4"
      >
        {isSubmitting ? 'Processing...' : submitText}
      </Button>
    </form>
  );
}
