import React, { useState, InputHTMLAttributes } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface LoginInputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  value: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export default function LoginInput({
  id,
  label,
  value,
  type,
  icon,
  rightElement,
  placeholder,
  className,
  ...props
}: LoginInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="space-y-1.5 w-full">
      {/* Premium label in sentence-case Inter style */}
      <div className="flex justify-between items-center px-1">
        <Label 
          htmlFor={id} 
          className={`text-sm font-medium transition-colors duration-300 ${
            isFocused ? 'text-orange-500' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          {label}
        </Label>
      </div>

      <div className="relative group/input">
        {/* Glow border ring background */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/5 to-amber-500/5 opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-300 p-[1px] pointer-events-none" />
        
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`h-12 lg:h-13 bg-white/[0.35] dark:bg-slate-950/[0.3] border-white/30 dark:border-white/10 hover:border-white/45 dark:hover:border-white/20 rounded-2xl px-5 font-sans font-medium text-slate-800 dark:text-white focus:bg-white/[0.5] dark:focus:bg-slate-950/[0.4] focus-visible:ring-4 focus-visible:ring-orange-500/10 focus:border-orange-500/40 transition-all placeholder:text-slate-500 dark:placeholder:text-slate-400 shadow-sm relative z-10 ${
            type === 'password' ? 'tracking-[0.1em] placeholder:tracking-normal font-mono' : 'tracking-normal'
          } ${className}`}
          {...props}
        />

        {/* Custom Icons & Password Toggles */}
        {rightElement ? (
          <div className="absolute right-5 top-1/2 -translate-y-1/2 z-20 flex items-center">
            {rightElement}
          </div>
        ) : icon ? (
          <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-550 group-focus-within/input:text-orange-500 transition-colors pointer-events-none z-20">
            {icon}
          </div>
        ) : null}
      </div>
    </div>
  );
}
