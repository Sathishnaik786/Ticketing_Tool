import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

import GlassLoginLayout from '@/components/auth/GlassLoginLayout';
import LoginGlassCard from '@/components/auth/LoginGlassCard';
import LoginForm from '@/components/auth/LoginForm';
import TrustBadge from '@/components/auth/TrustBadge';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (isAuthenticated) {
    return <Navigate to="/app/dashboard" replace />;
  }

  const loadingTexts = [
    'Authenticating...',
    'Verifying Access...',
    'Securing Workspace...',
    'Preparing Dashboard...'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: 'Validation Error',
        description: 'Please enter both email and password.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setLoadingStep(0);

    // Animate loader text changes
    const timer1 = setTimeout(() => setLoadingStep(1), 800);
    const timer2 = setTimeout(() => setLoadingStep(2), 1600);
    const timer3 = setTimeout(() => setLoadingStep(3), 2400);

    try {
      await login(email, password);
      navigate('/app/dashboard');
    } catch (error: any) {
      // Clear timers
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);

      const errorMessage = error?.message?.includes('NetworkError') || error?.status === 0
        ? 'Operational database connection failed. Verify server is online.'
        : 'Invalid email or password. Please try again.';

      toast({
        title: 'Authentication Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GlassLoginLayout>
      <LoginGlassCard>
        <LoginForm
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          isLoading={isLoading}
          loadingStep={loadingStep}
          loadingTexts={loadingTexts}
          handleSubmit={handleSubmit}
        />
        <TrustBadge />
      </LoginGlassCard>
    </GlassLoginLayout>
  );
}
