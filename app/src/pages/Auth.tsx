import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2, Mail, Lock, User, ArrowLeft, ShieldCheck, TrendingUp } from 'lucide-react';
import { Logo } from '@/components/shared/Logo';
import { lovable } from '@/integrations/lovable';

type Mode = 'signin' | 'signup' | 'reset';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<Mode>(() => searchParams.get('mode') === 'signup' ? 'signup' : 'signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const { signUp, signIn, resetPassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isSignUp = mode === 'signup';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'reset') {
        const { error } = await resetPassword(email);
        if (error) {
          toast({ title: "Couldn't send reset link", description: error.message, variant: 'destructive' });
        } else {
          setResetSent(true);
        }
        setLoading(false);
        return;
      }

      let result;
      if (isSignUp) {
        if (!fullName.trim()) {
          toast({ title: 'Error', description: 'Please enter your full name', variant: 'destructive' });
          setLoading(false);
          return;
        }
        result = await signUp(email, password, fullName);
      } else {
        result = await signIn(email, password);
      }

      if (result.error) {
        toast({ title: 'Error', description: result.error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: isSignUp ? 'Account created successfully!' : 'Welcome back!' });
        navigate('/');
      }
    } catch {
      toast({ title: 'Error', description: 'An unexpected error occurred', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await lovable.auth.signInWithOAuth('google', { redirect_uri: window.location.origin });
      if (error) toast({ title: 'Error', description: error.message || 'Failed to sign in with Google', variant: 'destructive' });
    } catch {
      toast({ title: 'Error', description: 'An unexpected error occurred', variant: 'destructive' });
    } finally {
      setGoogleLoading(false);
    }
  };

  const switchMode = (next: Mode) => { setMode(next); setResetSent(false); };

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col relative overflow-hidden">
      {/* Decorative backdrop — subtle sparkline motif, purely visual */}
      <svg className="absolute inset-x-0 top-0 w-full h-[280px] text-primary/10 pointer-events-none" viewBox="0 0 400 160" preserveAspectRatio="none" fill="none">
        <path d="M0,120 L40,100 L80,115 L120,70 L160,85 L200,40 L240,60 L280,25 L320,45 L360,15 L400,30" stroke="currentColor" strokeWidth="3" />
      </svg>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 relative">
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center text-center animate-fade-in">
          <Logo size="lg" />
          <div className="mt-4 flex items-center gap-1.5 text-[11px] font-semibold text-primary bg-primary/10 rounded-full px-3 py-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            Track the Nairobi Securities Exchange, securely
          </div>
        </div>

        <div className="w-full max-w-sm rounded-3xl border border-border bg-card shadow-xl animate-fade-in overflow-hidden">
          {mode !== 'reset' ? (
            <>
              {/* Sign in / Sign up segmented toggle */}
              <div className="grid grid-cols-2 p-1.5 m-4 mb-0 bg-muted/50 rounded-full">
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className={`h-9 rounded-full text-[13.5px] font-semibold transition-colors ${mode === 'signin' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className={`h-9 rounded-full text-[13.5px] font-semibold transition-colors ${mode === 'signup' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
                >
                  Sign Up
                </button>
              </div>

              <div className="p-6 pt-5">
                <h1 className="text-[19px] font-extrabold tracking-tight">
                  {isSignUp ? 'Create your account' : 'Welcome back'}
                </h1>
                <p className="text-[13px] text-muted-foreground mt-1 mb-5">
                  {isSignUp ? 'Start researching and tracking NSE stocks in minutes.' : 'Log in to pick up where you left off.'}
                </p>

                <Button type="button" variant="outline" className="w-full h-11 mb-4 font-medium rounded-xl" onClick={handleGoogleSignIn} disabled={googleLoading}>
                  {googleLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                  )}
                  Continue with Google
                </Button>

                <div className="relative mb-4">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                  <div className="relative flex justify-center text-[11px]"><span className="bg-card px-2 text-muted-foreground uppercase tracking-wide">or use email</span></div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  {isSignUp && (
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Full name"
                        className="h-12 pl-10 rounded-xl text-[14px]"
                        required={isSignUp}
                      />
                    </div>
                  )}

                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email address"
                      className="h-12 pl-10 rounded-xl text-[14px]"
                      required
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="h-12 pl-10 pr-10 rounded-xl text-[14px]"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {!isSignUp && (
                    <div className="flex justify-end">
                      <button type="button" onClick={() => switchMode('reset')} className="text-[12.5px] font-semibold text-primary hover:underline">
                        Forgot password?
                      </button>
                    </div>
                  )}

                  <Button type="submit" className="w-full h-12 text-[14.5px] font-semibold rounded-xl mt-1" disabled={loading}>
                    {loading ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{isSignUp ? 'Creating account…' : 'Logging in…'}</>
                    ) : (
                      isSignUp ? 'Create account' : 'Log In'
                    )}
                  </Button>
                </form>
              </div>
            </>
          ) : (
            /* Reset password */
            <div className="p-6">
              <button type="button" onClick={() => switchMode('signin')} className="flex items-center gap-1.5 text-[12.5px] font-semibold text-muted-foreground mb-4">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to log in
              </button>
              {resetSent ? (
                <div className="text-center py-6">
                  <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                    <Mail className="h-5 w-5" />
                  </div>
                  <h2 className="text-[16px] font-bold mb-1">Check your inbox</h2>
                  <p className="text-[13px] text-muted-foreground">We've sent a password reset link to <span className="font-medium text-foreground">{email}</span>.</p>
                </div>
              ) : (
                <>
                  <h1 className="text-[19px] font-extrabold tracking-tight">Reset your password</h1>
                  <p className="text-[13px] text-muted-foreground mt-1 mb-5">Enter your email and we'll send you a link to reset it.</p>
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email address"
                        className="h-12 pl-10 rounded-xl text-[14px]"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full h-12 text-[14.5px] font-semibold rounded-xl" disabled={loading}>
                      {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                      Send reset link
                    </Button>
                  </form>
                </>
              )}
            </div>
          )}
        </div>

        {mode !== 'reset' && (
          <p className="text-[13px] text-muted-foreground mt-5 text-center">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button type="button" className="font-semibold text-primary hover:underline" onClick={() => switchMode(isSignUp ? 'signin' : 'signup')}>
              {isSignUp ? 'Log In' : 'Sign Up'}
            </button>
          </p>
        )}

        <div className="flex items-center gap-1.5 mt-6 text-[11px] text-muted-foreground">
          <TrendingUp className="h-3 w-3" />
          Real-time research on NSE-listed companies
        </div>

        <p className="text-[11px] text-muted-foreground/80 mt-3 text-center max-w-xs">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}