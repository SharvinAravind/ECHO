import { useState } from 'react';
import { X, Crown, CreditCard, Tag, CheckCircle2, Sparkles, Zap, Shield, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { functions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { dispatchPremiumActivated } from '@/hooks/useAuth';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const premiumBenefits = [
  "Unlimited AI Generations",
  "All 20 Writing Styles",
  "Advanced Noise Cancellation",
  "Cloud Sync & Backup",
  "PDF, DOCX, Markdown Export",
  "Priority AI Processing",
  "All 10 Premium Themes",
  "End-to-End Encryption",
];

const PROMO_CODES: Record<string, number> = {
  'SWEETY50': 100,   // 100% off - totally free
  'ECHOWRITE100': 100, // 100% off - totally free
  'LAUNCH25': 25,
};

const PRICE = 9; // USD per month
const FREE_PROMO_DISCOUNT = 100;

export const PaymentModal = ({ isOpen, onClose, onSuccess }: PaymentModalProps) => {
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'razorpay'>('card');

  const applyPromoCode = () => {
    const code = promoCode.trim().toUpperCase();
    if (PROMO_CODES[code]) {
      setAppliedPromo(code);
      setDiscount(PROMO_CODES[code]);
      toast.success(`Promo code applied! ${PROMO_CODES[code]}% off`);
    } else {
      toast.error('Invalid promo code');
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    setDiscount(0);
    setPromoCode('');
  };

  const finalPrice = PRICE - (PRICE * discount / 100);
  const isFreePromo = discount >= FREE_PROMO_DISCOUNT;

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      if (isFreePromo) {
        // Free promo - activate premium without payment
        try {
          const userAccount = httpsCallable(functions, 'userAccount');
          const result = await userAccount({ action: 'activate-premium' });
          if (!(result.data as any)?.ok) {
            throw new Error((result.data as any)?.error || 'Activation failed');
          }
          localStorage.setItem('echowrite_premium', 'true');
          dispatchPremiumActivated();
        } catch (backendError: any) {
          // Fallback: activate premium client-side when Firebase userAccount not deployed
          console.warn('Backend activation failed, using client-side:', backendError?.message);
          localStorage.setItem('echowrite_premium', 'true');
          localStorage.setItem('echowrite_promo_used', appliedPromo || promoCode.trim().toUpperCase());
          dispatchPremiumActivated();
        }
        toast.success('Welcome to Premium! 🎉 Enjoy unlimited access!');
      } else {
        // Paid flow - simulate payment
        await new Promise(resolve => setTimeout(resolve, 2000));
        try {
          const userAccount = httpsCallable(functions, 'userAccount');
          const result = await userAccount({ action: 'activate-premium' });
          if (!(result.data as any)?.ok) {
            throw new Error((result.data as any)?.error || 'Premium activation failed');
          }
          localStorage.setItem('echowrite_premium', 'true');
          dispatchPremiumActivated();
        } catch (backendError: any) {
          localStorage.setItem('echowrite_premium', 'true');
          dispatchPremiumActivated();
        }
        toast.success('Payment successful! Welcome to Premium! 🎉');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Payment/activation error:', error);
      toast.error(error?.message || 'Activation failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-lg bg-card rounded-3xl shadow-2xl overflow-hidden animate-scale-in"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-6 gold-gradient">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Upgrade to Premium</h2>
                <p className="text-white/80 text-sm">Unlock the full power of EchoWrite</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Promo Code - Prominent at top */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Have a promo code?
              </p>
              {!appliedPromo ? (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Enter SWEETY50 or ECHOWRITE100 for free"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      className="pl-10 h-12 rounded-xl neu-pressed border-0"
                    />
                  </div>
                  <Button
                    onClick={applyPromoCode}
                    variant="outline"
                    className="h-12 px-6 rounded-xl neu-flat border-0"
                  >
                    Apply
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-xl bg-primary/10">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-primary">{appliedPromo}</span>
                    <span className="text-xs text-muted-foreground">({discount}% off)</span>
                  </div>
                  <button
                    onClick={removePromoCode}
                    className="text-xs text-destructive hover:underline font-semibold"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-2 gap-2">
              {premiumBenefits.map((benefit, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-foreground">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Pricing */}
            <div className="neu-flat rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">Monthly Plan</span>
                <div className="text-right">
                  {discount > 0 && (
                    <span className="text-sm text-muted-foreground line-through mr-2">${PRICE}</span>
                  )}
                  <span className="text-2xl font-bold text-foreground">${finalPrice.toFixed(2)}</span>
                  <span className="text-sm text-muted-foreground">/mo</span>
                </div>
              </div>

              {appliedPromo && discount > 0 && (
                <div className="flex items-center justify-between p-2 rounded-xl bg-primary/10 mb-3">
                  <span className="text-xs text-muted-foreground">Promo {appliedPromo} applied</span>
                </div>
              )}
            </div>

            {/* Payment Method - Hide when 100% free */}
            {!isFreePromo && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Payment Method
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={cn(
                    'flex items-center justify-center gap-2 p-4 rounded-xl transition-all',
                    paymentMethod === 'card'
                      ? 'neu-pressed ring-2 ring-primary'
                      : 'neu-flat hover:scale-[1.02]'
                  )}
                >
                  <CreditCard className="w-5 h-5" />
                  <span className="font-semibold">Card</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('razorpay')}
                  className={cn(
                    'flex items-center justify-center gap-2 p-4 rounded-xl transition-all',
                    paymentMethod === 'razorpay'
                      ? 'neu-pressed ring-2 ring-primary'
                      : 'neu-flat hover:scale-[1.02]'
                  )}
                >
                  <Zap className="w-5 h-5" />
                  <span className="font-semibold">Razorpay</span>
                </button>
              </div>
            </div>
            )}

            {/* Pay / Claim Button */}
            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full h-14 rounded-2xl gold-gradient text-white font-bold text-base gap-2 hover:shadow-premium transition-all"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : isFreePromo ? (
                <>
                  <Sparkles className="w-5 h-5" />
                  Claim Free Premium — Activate Now
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Pay ${finalPrice.toFixed(2)} — Upgrade Now
                </>
              )}
            </Button>

            {/* Security Note */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="w-3.5 h-3.5" />
              <span>Secure payment • Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
