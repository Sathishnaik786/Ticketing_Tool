import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Database } from 'lucide-react';
import LoginInput from './LoginInput';
import LoginButton from './LoginButton';

interface LoginFormProps {
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  showPassword: boolean;
  setShowPassword: (val: boolean) => void;
  isLoading: boolean;
  loadingStep: number;
  loadingTexts: string[];
  handleSubmit: (e: React.FormEvent) => void;
}

export default function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  isLoading,
  loadingStep,
  loadingTexts,
  handleSubmit
}: LoginFormProps) {
  return (
    <form onSubmit={handleSubmit} className="space-y-5 w-full">
      <div className="space-y-4">
        {/* Field 1: Email / Corporate ID */}
        <LoginInput
          id="email"
          type="email"
          label="Email Address"
          placeholder="Enter your professional mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          autoComplete="username"
          icon={<Database size={15} className="stroke-[2]" />}
        />

        {/* Field 2: Password / Password */}
        <LoginInput
          id="password"
          type={showPassword ? 'text' : 'password'}
          label="Password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          autoComplete="current-password"
          rightElement={
            <div className="flex items-center gap-2.5">
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-orange-500 hover:text-orange-400 hover:underline transition-colors select-none focus:outline-none font-sans"
              >
                Forgot?
              </Link>
              <div className="h-3 w-[1px] bg-white/10" />
              <button
                type="button"
                tabIndex={0}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="text-slate-400 hover:text-slate-200 transition-colors focus:outline-none focus:text-orange-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={15} className="stroke-[2]" /> : <Eye size={15} className="stroke-[2]" />}
              </button>
            </div>
          }
        />
      </div>

      {/* Primary Access Button */}
      <LoginButton
        isLoading={isLoading}
        loadingStep={loadingStep}
        loadingTexts={loadingTexts}
        className="mt-1"
      >
        Login
      </LoginButton>
    </form>
  );
}
