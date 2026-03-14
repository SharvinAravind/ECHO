import { useState } from 'react';
import { Mail, Lock, ArrowRight, Sparkles, Languages, CheckCircle2, Star, Zap, Crown, KeyRound, Mic, FileText, Palette, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Logo } from './Logo';
import { RocketAnimation } from './RocketAnimation';
import {
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { z } from 'zod';

// Validation schemas
const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

interface AuthScreenProps {
  onAuthSuccess: () => void;
}

const freeFeatures = [
  "Voice-to-Text in 25+ Languages",
  "10 AI Generations/Day",
  "All Writing Style Variations",
  "Basic Noise Reduction",
  "3 Free Theme Options",
  "Last 5 Items History",
  "Diagrams & Flowcharts Preview"
];

const premiumFeatures = [
  "Unlimited AI Generations",
  "All 25+ Writing Styles",
  "AI Art Generation (2-4 Images)",
  "Advanced AI Noise Cancellation",
  "PDF, DOCX, Markdown Export",
  "Cloud Sync Across Devices",
  "All 10 Premium Themes",
  "Priority AI Processing",
  "Emojis, Bullet Points & More",
  "One-Click Enable All Features"
];

export const AuthScreen = ({ onAuthSuccess }: AuthScreenProps) => {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string }>({});

  const validateInputs = () => {
    const newErrors: { email?: string; password?: string; name?: string } = {};

    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }

    if (mode !== 'forgot') {
      const passwordResult = passwordSchema.safeParse(password);
      if (!passwordResult.success) {
        newErrors.password = passwordResult.error.errors[0].message;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateInputs()) {
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'forgot') {
        await sendPasswordResetEmail(auth, email);
        toast.success('Password reset email sent! Check your inbox.');
        setMode('login');
      } else if (mode === 'signup') {
        const { error } = await signUp(email, password);
        if (error) {
          if (error.code === 'auth/email-already-in-use') {
            toast.error('User already exists. Please sign in');
          } else {
            toast.error(error.message || 'Sign up failed');
          }
        } else {
          toast.success("Account created successfully!");
          onAuthSuccess();
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error('Email or password is incorrect');
        } else {
          toast.success("Welcome back!");
          onAuthSuccess();
        }
      }
    } catch (err: any) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await signInWithGoogle();
      
      if (error) {
        const errorCode = error.code;
        const errorMessage = error.message || '';
        
        if (errorCode === 'auth/unauthorized-domain') {
          toast.error('Google login domain not authorized.');
        } else if (errorCode === 'auth/popup-closed-by-user') {
          toast.error('Sign-in was closed. Please try again.');
        } else if (errorCode === 'auth/network-request-failed') {
          toast.error('Network error. Please check your connection.');
        } else if (errorMessage.includes('DEFAULT_ERROR') || errorMessage.includes('FirebaseError')) {
          toast.error('Firebase configuration error.');
        } else if (errorCode === 'auth/operation-not-allowed') {
          toast.error('Google Sign-In is not enabled.');
        } else if (errorCode === 'auth/admin-restricted-operation') {
          toast.error('This operation is restricted.');
        } else {
          toast.error(error.message || "Google sign-in failed.");
        }
        console.error('Google Sign-In Error:', error);
      } else {
        // Check if it's a redirect flow (mobile) or popup (web)
        const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
          // For mobile, the page will redirect and auth state will update via listener
          toast.message("Redirecting to Google...");
          // Don't call onAuthSuccess() here - the page will reload
        } else {
          // For web popup, show success
          toast.success("Signed in with Google");
          onAuthSuccess();
        }
      }
    } catch (err: any) {
      console.error('Unexpected error:', err);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background font-sans selection:bg-primary/30 overflow-x-hidden">
      {/* Left Side: Hero & Tier Comparison - Desktop only */}
      <div className="hidden lg:flex w-1/2 flex-col p-8 lg:p-12 overflow-y-auto relative">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-32 right-10 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }} />
        </div>

        <div className="relative z-10">
          {/* Vintage Mic Logo with Text */}
          <div className="mb-12">
            <Logo size="3xl" showText animated />
          </div>

          <h2 className="text-3xl font-display font-bold text-foreground mb-4 leading-tight">
            Transform Your Words with AI-Powered Writing
          </h2>
          <p className="text-muted-foreground mb-8 max-w-md">
            Voice-to-text in 25+ languages with 25+ AI writing styles, AI art generation,
            visual diagrams, and seamless export. Your complete writing assistant.
          </p>

          {/* Tier Comparison */}
          <div className="grid grid-cols-2 gap-4 flex-1">
            {/* Free Tier */}
            <div className="neu-flat rounded-3xl p-6 flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-muted-foreground" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                  Free
                </h3>
              </div>
              <p className="text-2xl font-bold text-foreground mb-4">$0</p>
              <ul className="space-y-2.5 flex-1">
                {freeFeatures.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Premium Tier */}
            <div className="neu-convex rounded-3xl p-6 flex flex-col relative overflow-hidden ring-2 ring-gold">
              <div className="absolute top-0 right-0 gold-gradient text-white px-3 py-1 text-[8px] font-bold uppercase tracking-widest rounded-bl-xl">
                Popular
              </div>
              <div className="flex items-center gap-2 mb-4">
                <Crown className="w-5 h-5 text-gold" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-gold">
                  Premium
                </h3>
              </div>
              <p className="text-2xl font-bold text-foreground mb-4">$9/mo</p>
              <ul className="space-y-2.5 flex-1">
                {premiumFeatures.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-foreground font-medium">
                    <Zap className="w-3.5 h-3.5 text-gold shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Feature Icons */}
          <div className="mt-8 flex items-center gap-4 flex-wrap">
            {[
              { icon: Mic, label: 'Voice Input' },
              { icon: Sparkles, label: '25+ AI Styles' },
              { icon: Globe, label: '25+ Languages' },
              { icon: FileText, label: 'AI Art & Export' },
              { icon: Palette, label: '10 Themes' },
            ].map(({ icon: Icon, label }, idx) => (
              <div key={label + idx} className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl neu-flat flex items-center justify-center">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-xs font-semibold text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>

          {/* Rocket Animation - Bottom Right */}
          <div className="absolute bottom-8 right-8">
            <RocketAnimation size="lg" />
          </div>
        </div>
      </div>

      {/* Right Side: Auth Form - Full width on mobile */}
      <div className="flex-1 flex items-center justify-center px-4 py-6 sm:px-6 sm:py-8 lg:p-12 min-h-screen lg:min-h-0 overflow-y-auto">
        <div className="w-full max-w-sm sm:max-w-md">
          {/* Mobile Logo - Smaller on mobile */}
          <div className="lg:hidden flex justify-center mb-6 sm:mb-8">
            <Logo size="xl" showText animated />
          </div>

          {/* Form Card - Responsive padding */}
          <div className="neu-flat rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 md:p-10">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">
              {mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create account' : 'Reset Password'}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mb-5 sm:mb-8">
              {mode === 'login'
                ? 'Enter your credentials to continue'
                : mode === 'signup'
                  ? 'Start your AI writing journey'
                  : 'Enter your email to receive a reset link'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              {mode === 'signup' && (
                <div className="relative">
                  <Sparkles className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 sm:pl-12 h-12 sm:h-14 rounded-xl sm:rounded-2xl neu-pressed border-0 focus-visible:ring-primary text-sm sm:text-base"
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive mt-1">{errors.name}</p>
                  )}
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 sm:pl-12 h-12 sm:h-14 rounded-xl sm:rounded-2xl neu-pressed border-0 focus-visible:ring-primary text-sm sm:text-base"
                />
                {errors.email && (
                  <p className="text-xs text-destructive mt-1">{errors.email}</p>
                )}
              </div>

              {mode !== 'forgot' && (
                <div className="relative">
                  <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 sm:pl-12 h-12 sm:h-14 rounded-xl sm:rounded-2xl neu-pressed border-0 focus-visible:ring-primary text-sm sm:text-base"
                  />
                  {errors.password && (
                    <p className="text-xs text-destructive mt-1">{errors.password}</p>
                  )}
                </div>
              )}

              {/* Forgot Password Link */}
              {mode === 'login' && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-xs text-primary hover:underline font-semibold"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 sm:h-14 primary-button rounded-xl sm:rounded-2xl text-sm sm:text-base gap-2"
              >
                {isLoading ? (
                  <span className="animate-pulse">Processing...</span>
                ) : mode === 'forgot' ? (
                  <>
                    <KeyRound className="w-4 h-4 sm:w-5 sm:h-5" />
                    Send Reset Link
                  </>
                ) : (
                  <>
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </>
                )}
              </Button>

              {/* Divider - only show for login/signup */}
              {mode !== 'forgot' && (
                <>
                  <div className="relative my-4 sm:my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border/50" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-3 text-muted-foreground">or continue with</span>
                    </div>
                  </div>

                  {/* Google Sign In */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl neu-flat border-0 gap-2 sm:gap-3 text-xs sm:text-sm font-semibold hover:scale-[1.02] transition-transform"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                  </Button>
                </>
              )}
            </form>

            <div className="mt-4 sm:mt-6 text-center">
              {mode === 'forgot' ? (
                <button
                  onClick={() => setMode('login')}
                  className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Back to Sign In
                </button>
              ) : (
                <button
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {mode === 'login'
                    ? "Don't have an account? Sign up"
                    : 'Already have an account? Sign in'}
                </button>
              )}
            </div>
          </div>

          {/* Free tier notice - Responsive */}
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 rounded-xl sm:rounded-2xl neu-flat text-center">
            <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">Free tier includes:</span>{' '}
              <span className="block sm:inline mt-1 sm:mt-0">10 generations/day • Voice in 25+ languages • 5 styles</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
