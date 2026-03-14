import { useState, useEffect } from 'react';
import { X, Crown, CreditCard, Tag, CheckCircle2, Sparkles, Shield, Loader2, Settings, ExternalLink, Check, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { dispatchPremiumActivated } from '@/hooks/useAuth';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialAction?: SubscriptionAction;
}

const premiumBenefits = [
  "Unlimited AI Generations",
  "All 25+ Writing Styles",
  "Advanced Noise Cancellation",
  "Cloud Sync & Backup",
  "PDF, DOCX, Markdown Export",
  "Priority AI Processing",
  "All Premium Themes",
  "End-to-End Encryption",
];

const PRICE_USD = 9.99;
const PRICE_INR = 999;
const FREE_PROMO_DISCOUNT = 100;

// Payment URLs
const STRIPE_PAYMENT_URL = "https://buy.stripe.com/test_9B69AS107aYufkJgZn5os00";
const RAZORPAY_PAYMENT_URL = "https://rzp.io/rzp/9Xn8ZCL";

// Valid promo codes - 100% free for these codes
const VALID_PROMO_CODES: Record<string, number> = {
  'SWEETY50': 100,
  'ECHOWRITE100': 100,
  'SPEED50': 100,
};

type SubscriptionAction = 'subscribe' | 'unsubscribe' | 'upgrade' | 'manage' | null;
type PaymentMethod = 'card' | 'razorpay';

export const PaymentModal = ({ isOpen, onClose, onSuccess, initialAction }: PaymentModalProps) => {
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [subscriptionAction, setSubscriptionAction] = useState<SubscriptionAction>(initialAction || null);
  const [isVerifyingPromo, setIsVerifyingPromo] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [showUnsubscribeConfirm, setShowUnsubscribeConfirm] = useState(false);

  useEffect(() => {
    if (isOpen && initialAction) {
      setSubscriptionAction(initialAction);
    }
    // Reset state when modal opens
    if (isOpen) {
      setAppliedPromo(null);
      setDiscount(0);
      setPromoCode('');
      setShowUnsubscribeConfirm(false);
    }
  }, [isOpen, initialAction]);

  // Auto-apply known promo codes immediately
  const validatePromoCode = (code: string): { valid: boolean; discount: number } => {
    const codeUpper = code.trim().toUpperCase();
    if (VALID_PROMO_CODES[codeUpper]) {
      return { valid: true, discount: VALID_PROMO_CODES[codeUpper] };
    }
    return { valid: false, discount: 0 };
  };

  const applyPromoCode = async () => {
    if (!promoCode.trim()) {
      toast.error('Please enter a promo code');
      return;
    }
    setIsVerifyingPromo(true);
    
    // Simulate verification delay for UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const result = validatePromoCode(promoCode);
    if (result.valid) {
      setAppliedPromo(promoCode.trim().toUpperCase());
      setDiscount(result.discount);
      toast.success(`Promo code applied! ${result.discount}% off - You get it FREE!`);
    } else {
      toast.error('Invalid promo code. Try SWEETY50 or ECHOWRITE100 for free access!');
    }
    setIsVerifyingPromo(false);
  };

  // Handle payment redirect
  const handlePaymentRedirect = () => {
    if (paymentMethod === 'card') {
      window.open(STRIPE_PAYMENT_URL, '_blank');
    } else {
      window.open(RAZORPAY_PAYMENT_URL, '_blank');
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    setDiscount(0);
    setPromoCode('');
  };

  const handleUnsubscribeConfirm = () => {
    setShowUnsubscribeConfirm(true);
  };

  const handleUnsubscribeConfirmed = async () => {
    setIsProcessing(true);
    try {
      localStorage.removeItem('echowrite_premium');
      localStorage.removeItem('echowrite_promo_used');
      dispatchPremiumActivated();
      toast.success('Successfully unsubscribed. You are now on Free Trial.');
      setShowUnsubscribeConfirm(false);
      onClose();
    } catch (error) {
      toast.error('Failed to unsubscribe. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnsubscribeCancel = () => {
    setShowUnsubscribeConfirm(false);
  };

  const handleManageSubscription = () => {
    window.open(STRIPE_PAYMENT_URL, '_blank');
  };

  const finalPriceUSD = PRICE_USD - (PRICE_USD * discount / 100);
  const finalPriceINR = PRICE_INR - (PRICE_INR * discount / 100);
  const isFreePromo = discount >= FREE_PROMO_DISCOUNT;

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      if (isFreePromo) {
        // Free promo code - activate immediately
        localStorage.setItem('echowrite_premium', 'true');
        localStorage.setItem('echowrite_promo_used', appliedPromo || promoCode.trim().toUpperCase());
        dispatchPremiumActivated();
        toast.success('Welcome to Premium! Enjoy unlimited access!');
        onSuccess();
        onClose();
      } else {
        // Redirect to payment
        handlePaymentRedirect();
      }
    } catch (error: any) {
      console.error('Payment/activation error:', error);
      toast.error(error?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  const getUserTier = (): boolean => {
    return localStorage.getItem('echowrite_premium') === 'true';
  };
  const isPremium = getUserTier();

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-card rounded-3xl shadow-2xl overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
          <div className="relative p-6 gold-gradient">
            <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-colors">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {subscriptionAction === 'unsubscribe' ? 'Cancel Subscription' : 
                   subscriptionAction === 'upgrade' ? 'Upgrade Plan' :
                   subscriptionAction === 'manage' ? 'Manage Subscription' : 'Upgrade to Premium'}
                </h2>
                <p className="text-white/80 text-sm">
                  {subscriptionAction === 'unsubscribe' ? 'We hate to see you go' :
                   subscriptionAction === 'upgrade' ? 'Get more features' :
                   subscriptionAction === 'manage' ? 'Manage your subscription' : 'Unlock the full power of EchoWrite'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {subscriptionAction === 'unsubscribe' ? (
              !showUnsubscribeConfirm ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-8 h-8 text-destructive" />
                  </div>
                  <p className="text-muted-foreground">Are you sure you want to cancel your Premium subscription?</p>
                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" onClick={onClose} className="flex-1 h-12 rounded-xl">
                      Keep Premium
                    </Button>
                    <Button onClick={handleUnsubscribeConfirm} className="flex-1 h-12 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Yes, Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <p className="text-lg font-semibold">Please confirm:</p>
                  <p className="text-muted-foreground">Are you sure you want to unsubscribe? You'll lose all Premium features.</p>
                  <div className="flex gap-3 pt-4">
                    <Button variant="outline" onClick={handleUnsubscribeCancel} className="flex-1 h-12 rounded-xl">
                      No, Keep It
                    </Button>
                    <Button onClick={handleUnsubscribeConfirmed} disabled={isProcessing} className="flex-1 h-12 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Yes, Unsubscribe'}
                    </Button>
                  </div>
                </div>
              )
            ) : subscriptionAction === 'manage' ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Settings className="w-8 h-8 text-primary" />
                </div>
                <p className="text-muted-foreground">Manage your subscription, view billing history, or update payment methods.</p>
                <Button onClick={handleManageSubscription} className="w-full h-12 rounded-xl gold-gradient gap-2">
                  <ExternalLink className="w-5 h-5" />
                  Open Billing Portal
                </Button>
                <Button variant="outline" onClick={() => setSubscriptionAction(null)} className="w-full h-12 rounded-xl">
                  Back to Options
                </Button>
              </div>
            ) : subscriptionAction === 'upgrade' ? (
              <div className="space-y-4">
                <div className="neu-flat rounded-2xl p-4 border-2 border-gold">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-lg">Pro Plan</span>
                    <span className="text-2xl font-bold text-gold">$9<span className="text-sm text-muted-foreground">/mo</span></span>
                  </div>
                  <p className="text-sm text-muted-foreground">Best for power users</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {premiumBenefits.map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
                <Button onClick={() => setSubscriptionAction(null)} className="w-full h-14 rounded-2xl gold-gradient text-white font-bold text-base">
                  Select Pro Plan
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-3">
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
                          placeholder="Enter promo code"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                          onKeyDown={(e) => e.key === 'Enter' && applyPromoCode()}
                          className="pl-10 h-12 rounded-xl neu-pressed border-0"
                        />
                      </div>
                      <Button
                        onClick={applyPromoCode}
                        disabled={isVerifyingPromo || !promoCode.trim()}
                        className="h-12 px-6 rounded-xl neu-flat border-0"
                      >
                        {isVerifyingPromo ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Apply'}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-primary/10">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-primary" />
                        <span className="text-sm font-semibold text-primary">{appliedPromo}</span>
                        <span className="text-xs text-muted-foreground">({discount}% off)</span>
                      </div>
                      <button onClick={removePromoCode} className="text-xs text-destructive hover:underline font-semibold">
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {premiumBenefits.map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>

                <div className="neu-flat rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-muted-foreground">Monthly Plan</span>
                    <div className="text-right">
                      {discount > 0 && (
                        <span className="text-sm text-muted-foreground line-through mr-2">${PRICE_USD}</span>
                      )}
                      <span className="text-2xl font-bold text-foreground">${finalPriceUSD.toFixed(2)} USD</span>
                      <span className="text-sm text-muted-foreground ml-2">({finalPriceINR} INR)</span>
                    </div>
                  </div>
                  {appliedPromo && discount > 0 && (
                    <div className="flex items-center justify-between p-2 rounded-xl bg-primary/10 mb-3">
                      <span className="text-xs text-muted-foreground">Promo {appliedPromo} applied</span>
                    </div>
                  )}
                </div>

                {!isFreePromo && (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select Payment Method</p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setPaymentMethod('card')}
                        className={cn(
                          'flex items-center justify-center gap-2 p-4 rounded-xl transition-all',
                          paymentMethod === 'card' ? 'neu-pressed ring-2 ring-primary' : 'neu-flat hover:scale-[1.02]'
                        )}
                      >
                        <CreditCard className="w-5 h-5" />
                        <span className="font-semibold">Card (Stripe)</span>
                      </button>
                      <button
                        onClick={() => setPaymentMethod('razorpay')}
                        className={cn(
                          'flex items-center justify-center gap-2 p-4 rounded-xl transition-all',
                          paymentMethod === 'razorpay' ? 'neu-pressed ring-2 ring-primary' : 'neu-flat hover:scale-[1.02]'
                        )}
                      >
                        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                        </svg>
                        <span className="font-semibold">UPI/Pay</span>
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      {paymentMethod === 'card' ? 'Pay securely with Stripe (Cards)' : 'Pay via Razorpay (UPI, Cards, Wallets)'}
                    </p>
                  </div>
                )}

                <Button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full h-14 rounded-2xl gold-gradient text-white font-bold text-base gap-2 hover:shadow-premium transition-all"
                >
                  {isProcessing ? (
                    <><Loader2 className="w-5 h-5 animate-spin" />Processing...</>
                  ) : isFreePromo ? (
                    <><Sparkles className="w-5 h-5" />Claim Free Premium</>
                  ) : (
                    <><Sparkles className="w-5 h-5" />Pay ${finalPriceUSD.toFixed(2)}</>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Secure payment • Cancel anytime</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
