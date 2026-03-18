import { useState, useEffect } from 'react';
import { Mail, Lock, ArrowRight, Sparkles, CheckCircle2, Star, Zap, Crown, Mic, FileText, Wand2, Download, Globe, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Logo } from './Logo';
import { RocketAnimation } from './RocketAnimation';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

interface AuthScreenProps {
  onAuthSuccess: () => void;
  onGetStarted: () => void;
}

const freeFeatures = [
  { icon: Mic, text: "Voice-to-Text 25+ Languages" },
  { icon: Sparkles, text: "10 AI Generations/Day" },
  { icon: Wand2, text: "25+ Writing Styles" },
  { icon: Globe, text: "Multi-language Support" },
  { icon: FileText, text: "Text Export" },
  { icon: Download, text: "Copy to Clipboard" },
];

const premiumFeatures = [
  { icon: Zap, text: "Unlimited AI Generations" },
  { icon: Wand2, text: "AI Art Generation" },
  { icon: Crown, text: "Premium Styles" },
  { icon: Shield, text: "Priority Support" },
  { icon: Download, text: "PDF/DOCX Export" },
  { icon: Globe, text: "Cloud Sync" },
];

export const AuthScreen = ({ onAuthSuccess, onGetStarted }: AuthScreenProps) => {
  const { signIn, signUp, signInWithGoogle, authUser } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; name?: string }>({});

  // Handle redirect success - when Google redirect completes
  useEffect(() => {
    const handleGoogleSignInSuccess = () => {
      console.log('Google sign-in redirect completed');
      toast.success('Signed in successfully!');
      onAuthSuccess();
    };

    window.addEventListener('google-signin-success', handleGoogleSignInSuccess);
    return () => window.removeEventListener('google-signin-success', handleGoogleSignInSuccess);
  }, [onAuthSuccess]);

  // If user is already logged in via redirect, trigger success
  useEffect(() => {
    if (authUser) {
      console.log('User is authenticated:', authUser.email);
      onAuthSuccess();
    }
  }, [authUser, onAuthSuccess]);

  const validateInputs = () => {
    const newErrors: { email?: string; password?: string; name?: string } = {};
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) newErrors.email = emailResult.error.errors[0].message;
    if (mode !== 'forgot') {
      const passwordResult = passwordSchema.safeParse(password);
      if (!passwordResult.success) newErrors.password = passwordResult.error.errors[0].message;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;
    setIsLoading(true);
    try {
      if (mode === 'forgot') {
        await sendPasswordResetEmail(auth, email);
        toast.success('Password reset email sent!');
        setMode('login');
      } else if (mode === 'signup') {
        const { error } = await signUp(email, password);
        if (error) {
          toast.error(error.code === 'auth/email-already-in-use' ? 'User already exists' : error.message);
        } else {
          toast.success("Account created!");
          onAuthSuccess();
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) toast.error('Email or password incorrect');
        else { toast.success("Welcome back!"); onAuthSuccess(); }
      }
    } catch (err) { toast.error('An error occurred'); }
    finally { setIsLoading(false); }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast.error(error.code === 'auth/unauthorized-domain' ? 'Domain not authorized' : error.message);
      }
      // Success will be handled by the event listener
    } catch (err) { toast.error("Error signing in"); }
    finally { setIsLoading(false); }
  };

  const handleGetStarted = () => {
    localStorage.setItem('echowrite_trial_used', 'true');
    localStorage.setItem('echowrite_trial_count', '5');
    onGetStarted();
  };

  return (
    <div className="min-h-screen flex bg-background font-sans">
      {/* Left Side - Simple Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col p-8 justify-center bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="mb-8">
          <Logo size="2xl" showText />
        </div>
        
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Transform Your Words with AI
        </h2>
        <p className="text-sm text-muted-foreground mb-8 max-w-md">
          Voice-to-text in 25+ languages with AI-powered writing styles and content generation.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* Free Card */}
          <div className="rounded-2xl p-5 border bg-card">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-bold uppercase">Free</span>
            </div>
            <p className="text-2xl font-bold mb-3">$0</p>
            <ul className="space-y-1.5">
              {freeFeatures.slice(0, 4).map((f, i) => (
                <li key={i} className="text-xs flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="w-3 h-3 text-green-500" />{f.text}
                </li>
              ))}
            </ul>
          </div>
          
          {/* Premium Card with Rocket */}
          <div className="rounded-2xl p-5 border border-amber-500/50 bg-amber-50 dark:bg-amber-950/20 relative">
            <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-white px-2 py-0.5 text-[10px] font-bold rounded">
              Popular
            </div>
            <div className="flex items-center gap-2 mb-3">
              <Crown className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold uppercase text-amber-500">Premium</span>
            </div>
            <p className="text-2xl font-bold mb-3">$9<span className="text-xs font-normal text-muted-foreground">/mo</span></p>
            <ul className="space-y-1.5">
              {premiumFeatures.slice(0, 4).map((f, i) => (
                <li key={i} className="text-xs flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="w-3 h-3 text-amber-500" />{f.text}
                </li>
              ))}
            </ul>
            {/* Rocket Animation */}
            <div className="absolute -bottom-2 -right-2">
              <RocketAnimation size="sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-6">
            <Logo size="xl" showText />
          </div>

          <div className="rounded-2xl p-6 border bg-card">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold">
                {mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create account' : 'Reset Password'}
              </h2>
              {mode === 'login' && (
                <Button type="button" variant="outline" onClick={handleGetStarted} className="h-7 px-3 text-xs rounded-lg">
                  Get Started
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              {mode === 'login' ? 'Sign in to continue' : mode === 'signup' ? 'Start your AI journey' : 'Enter your email'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === 'signup' && (
                <div className="relative">
                  <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    type="text" 
                    placeholder="Your name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    className="pl-10 h-11 rounded-xl text-sm" 
                  />
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  type="email" 
                  placeholder="Email address" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="pl-10 h-11 rounded-xl text-sm" 
                />
                {errors.email && <p className="text-[10px] text-destructive mt-1">{errors.email}</p>}
              </div>
              {mode !== 'forgot' && (
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    type="password" 
                    placeholder="Password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    className="pl-10 h-11 rounded-xl text-sm" 
                  />
                  {errors.password && <p className="text-[10px] text-destructive mt-1">{errors.password}</p>}
                </div>
              )}
              {mode === 'login' && <div className="text-right"><button type="button" onClick={() => setMode('forgot')} className="text-xs text-primary hover:underline">Forgot password?</button></div>}
              <Button type="submit" disabled={isLoading} className="w-full h-11 rounded-xl text-sm gap-2">
                {isLoading ? 'Processing...' : mode === 'forgot' ? 'Send Reset Link' : mode === 'login' ? 'Sign In' : 'Create Account'}
                {!isLoading && mode !== 'forgot' && <ArrowRight className="w-4 h-4" />}
              </Button>
            </form>

            {mode !== 'forgot' && (
              <>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div>
                  <div className="relative flex justify-center text-[10px]"><span className="bg-background px-2 text-muted-foreground">or continue with</span></div>
                </div>
                <Button type="button" variant="outline" onClick={handleGoogleSignIn} className="w-full h-11 rounded-xl text-sm gap-2">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </Button>
              </>
            )}
            <div className="mt-4 text-center">
              <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-xs text-muted-foreground hover:text-primary">
                {mode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
