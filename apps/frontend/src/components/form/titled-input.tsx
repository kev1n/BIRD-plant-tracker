import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import React from 'react';

interface TitledInputProps {
  title: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

const TitledInput = ({ title, required, children, className }: TitledInputProps) => {
  return (
    <div className={cn("grid w-full items-center gap-1.5", className)}>
      <Label className="mb-1">
        {title}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
    </div>
  );
};

export default TitledInput;
