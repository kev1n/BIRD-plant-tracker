"use client";

import { cn } from "@/lib/utils";
import * as React from "react";
import { IMaskInput } from 'react-imask';

interface DateInputProps {
  date: Date | null;
  setDate: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
}

export function DateInput({
  date,
  setDate,
  placeholder = "MM/DD/YYYY",
  className = "",
}: DateInputProps) {
  const [inputValue, setInputValue] = React.useState("");

  // Initialize with today's date if no date is provided
  React.useEffect(() => {
    if (!date) {
      const today = new Date();
      setDate(today);
    }
  }, [date, setDate]);

  // Update input value when date changes
  React.useEffect(() => {
    if (date) {
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = String(date.getFullYear());
      setInputValue(`${month}/${day}/${year}`);
    } else {
      setInputValue("");
    }
  }, [date]);

  const handleAccept = (value: string) => {
    setInputValue(value);

    // Only parse and validate when we have a complete date
    if (value.length === 10 && !value.includes('_')) {
      const [month, day, year] = value.split('/').map(Number);
      
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 1900 && year <= 2100) {
        const newDate = new Date(year, month - 1, day);
        // Verify the date is valid (handles cases like February 30th)
        if (newDate.getMonth() === month - 1 && newDate.getDate() === day) {
          setDate(newDate);
        }
      }
    }
    // Note: We don't clear the date for incomplete/invalid inputs to avoid infinite loops
  };

  // Check if current input represents a valid, complete date
  const isValidCompleteDate = () => {
    if (!date || !inputValue) return false;
    
    // Check if input is complete (no underscores)
    if (inputValue.includes('_') || inputValue.length !== 10) return false;
    
    // Parse the input to verify it matches our stored date
    const [month, day, year] = inputValue.split('/').map(Number);
    if (isNaN(month) || isNaN(day) || isNaN(year)) return false;
    
    // Verify the parsed date matches our stored date
    return (
      date.getMonth() === month - 1 &&
      date.getDate() === day &&
      date.getFullYear() === year
    );
  };

  const formatDateDisplay = (date: Date) => {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    
    const getOrdinalSuffix = (day: number) => {
      if (day > 3 && day < 21) return "th";
      switch (day % 10) {
        case 1: return "st";
        case 2: return "nd";
        case 3: return "rd";
        default: return "th";
      }
    };

    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    
    // Calculate relative time
    const today = new Date();
    const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const inputDateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    const diffTime = inputDateOnly.getTime() - todayDateOnly.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    let relativeText = "";
    if (diffDays === 0) {
      relativeText = " - today";
    } else if (diffDays === 1) {
      relativeText = " - tomorrow";
    } else if (diffDays === -1) {
      relativeText = " - yesterday";
    } else if (diffDays > 0) {
      // Future dates
      if (diffDays < 7) {
        relativeText = ` - ${diffDays} days from now`;
      } else if (diffDays < 30) {
        const weeks = Math.round(diffDays / 7);
        relativeText = ` - ${weeks} week${weeks > 1 ? 's' : ''} from now`;
      } else if (diffDays < 365) {
        const months = Math.round(diffDays / 30);
        relativeText = ` - ${months} month${months > 1 ? 's' : ''} from now`;
      } else {
        const years = Math.round(diffDays / 365);
        relativeText = ` - ${years} year${years > 1 ? 's' : ''} from now`;
      }
    } else {
      // Past dates
      const absDays = Math.abs(diffDays);
      if (absDays < 7) {
        relativeText = ` - ${absDays} days ago`;
      } else if (absDays < 30) {
        const weeks = Math.round(absDays / 7);
        relativeText = ` - ${weeks} week${weeks > 1 ? 's' : ''} ago`;
      } else if (absDays < 365) {
        const months = Math.round(absDays / 30);
        relativeText = ` - ${months} month${months > 1 ? 's' : ''} ago`;
      } else {
        const years = Math.round(absDays / 365);
        relativeText = ` - ${years} year${years > 1 ? 's' : ''} ago`;
      }
    }
    
    return `${month} ${day}${getOrdinalSuffix(day)}, ${year}${relativeText}`;
  };

  return (
    <div className={cn("space-y-1", className)}>
      <IMaskInput
        mask="00/00/0000"
        value={inputValue}
        onAccept={handleAccept}
        placeholder={placeholder}
        lazy={false}
        placeholderChar="_"
        className="font-mono tracking-wider text-left flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      />
      <p className="text-sm text-muted-foreground">
        MM/DD/YYYY - {" "}
        {isValidCompleteDate() ? formatDateDisplay(date!) : "invalid date"}
      </p>
    </div>
  );
} 