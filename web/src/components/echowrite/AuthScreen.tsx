import { useState } from 'react';
import { Mail, Lock, ArrowRight, Sparkles, CheckCircle2, Star, Zap, Crown, KeyRound, Mic, FileText, Palette, Globe, Wand2, Download, Cloud, Shield, Clock, BarChart3, Bolt } from 'lucide-react';
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
  { icon: Clock, text: "Basic Noise Reduction" },
  { icon: FileText, text: "5 History Items" },
  { icon: Palette, text: "3 Theme Options" },
  { icon: Download, text: "Text Copy Only" },
  { icon: BarChart3, text: "Basic Analytics" },
];

const premiumFeatures = [
  { icon: Bolt, text: "Unlimited AI Generations" },
  { icon: Wand2, text: "AI Art Generation" },
  { icon: Zap, text: "Priority Processing" },
  { icon: Download, text: "PDF/DOCX Export" },
  { icon: Cloud, text: "Cloud Sync" },
  { icon: Shield, text: "All Premium Features" },
  { icon: Mic, text: "Advanced Voice AI" },
  { icon: BarChart3, text: "Advanced Analytics" },
];

export const AuthScreen = ({ onAuthSuccess, onGetStarted }: AuthScreenProps) => {
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
      if (error) toast.error(error.code === 'auth/unauthorized-domain' ? 'Domain not authorized' : error.message);
      else { toast.success("Signed in!"); onAuthSuccess(); }
    } catch (err) { toast.error("Error"); }
    finally { setIsLoading(false); }
  };

  const handleGetStarted = () => {
    console.log('Get Started clicked, redirecting...');
    localStorage.setItem('echowrite_trial_used', 'true');
    localStorage.setItem('echowrite_trial_count', '5');
    onGetStarted();
  };

  return (
    <div className="min-h-screen flex bg-background font-sans relative overflow-hidden">
      {/* Floating Orbs Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="login-float-orb-1 absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="login-float-orb-2 absolute bottom-32 right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="login-float-orb-3 absolute top-1/2 left-1/3 w-56 h-56 bg-primary/5 rounded-full blur-2xl" />
      </div>

      {/* Left Side - Logo, Description, Tiers, Features */}
      <div className="hidden lg:flex lg:w-3/5 flex-col p-10 justify-center relative z-10">
        <div className="mb-8 logo-pulse">
          <Logo size="3xl" showText animated />
        </div>
        
        <h2 className="text-3xl font-bold text-foreground mb-4 stagger-fade-1">
          Transform Your Words with AI-Powered Writing
        </h2>
        <p className="text-muted-foreground mb-8 max-w-lg text-base stagger-fade-2">
          Voice-to-text in 25+ languages with 25+ AI writing styles, AI art generation, visual diagrams, and seamless export. Your complete writing assistant.
        </p>

        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Free Card */}
          <div className="login-glass rounded-3xl p-6 card-hover-lift stagger-fade-3">
            <div className="flex items-center gap-3 mb-4">
              <Star className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-sm font-bold uppercase text-muted-foreground">Free</h3>
            </div>
            <p className="text-3xl font-bold mb-4">$0</p>
            <ul className="space-y-2">
              {freeFeatures.map((f, i) => (
                <li key={i} className={`text-xs flex items-center gap-2 stagger-fade-${(i % 6) + 1}`}>
                  <f.icon className="w-3.5 h-3.5 text-muted-foreground" />{f.text}
                </li>
              ))}
            </ul>
          </div>
          
          {/* Premium Card - CENTER OF ATTRACTION */}
          <div className="login-glass rounded-3xl p-6 relative overflow-hidden premium-card-pulse premium-card-hover premium-shimmer stagger-fade-3">
            <div className="absolute top-0 right-0 badge-bounce bg-gradient-to-r from-amber-500 to-yellow-400 text-white px-3 py-1 text-[10px] font-bold rounded-bl-xl">
              Popular
            </div>
            <div className="flex items-center gap-3 mb-4">
              <Crown className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-bold uppercase text-amber-500">Premium</h3>
            </div>
            <p className="text-3xl font-bold mb-4">$9<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
            <ul className="space-y-2">
              {premiumFeatures.map((f, i) => (
                <li key={i} className={`text-xs flex items-center gap-2 stagger-fade-${(i % 6) + 1}`}>
                  <f.icon className="w-3.5 h-3.5 text-amber-500" />{f.text}
                </li>
              ))}
            </ul>
            {/* Rocket Animation inside Premium Box */}
            <div className="absolute bottom-4 right-4">
              <RocketAnimation size="md" />
            </div>
          </div>
        </div>

        {/* Feature Icons */}
        <div className="flex items-center gap-6 stagger-fade-5">
          {[{icon: Mic, l: 'Voice'}, {icon: Sparkles, l: '25+ Styles'}, {icon: Globe, l: 'Languages'}, {icon: FileText, l: 'Export'}, {icon: Palette, l: 'Themes'}].map(({icon: Icon, l}, i) => (
            <div key={i} className="feature-icon-hover flex items-center gap-2 cursor-default">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium">{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-sm form-animate-in">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-6 logo-pulse">
            <Logo size="xl" showText animated />
          </div>

          <div className="login-glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold">{mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create account' : 'Reset Password'}</h2>
              {mode === 'login' && (
                <Button type="button" variant="outline" onClick={handleGetStarted} className="h-8 px-3 text-xs rounded-lg btn-glow">
                  Get Started
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-4">{mode === 'login' ? 'Enter your credentials' : mode === 'signup' ? 'Start your AI journey' : 'Enter your email'}</p>

            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === 'signup' && (
                <div className="relative">
                  <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    type="text" 
                    placeholder="Your name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    className="pl-10 h-11 rounded-xl text-sm input-glow transition-all duration-300" 
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
                  className="pl-10 h-11 rounded-xl text-sm input-glow transition-all duration-300" 
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
                    className="pl-10 h-11 rounded-xl text-sm input-glow transition-all duration-300" 
                  />
                  {errors.password && <p className="text-[10px] text-destructive mt-1">{errors.password}</p>}
                </div>
              )}
              {mode === 'login' && <div className="text-right"><button type="button" onClick={() => setMode('forgot')} className="text-xs text-primary hover:underline">Forgot password?</button></div>}
              <Button type="submit" disabled={isLoading} className="w-full h-11 rounded-xl text-sm gap-2 btn-glow">
                {isLoading ? 'Processing...' : mode === 'forgot' ? 'Send Reset Link' : mode === 'login' ? 'Sign In' : 'Create Account'}
                {!isLoading && mode !== 'forgot' && <ArrowRight className="w-4 h-4" />}
              </Button>
            </form>

            {mode !== 'forgot' && (
              <>
                <div className="relative my-4"><div className="absolute inset-0 flex items-center"><div className="w-full border-t" /></div><div className="relative flex justify-center text-[10px]"><span className="bg-background px-2 text-muted-foreground">or continue with</span></div></div>
                <Button type="button" variant="outline" onClick={handleGoogleSignIn} className="w-full h-11 rounded-xl text-sm gap-2 btn-glow">
                  <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  Continue with Google
                </Button>
              </>
            )}
            <div className="mt-4 text-center">
              <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="text-xs text-muted-foreground hover:text-primary transition-colors">{mode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
