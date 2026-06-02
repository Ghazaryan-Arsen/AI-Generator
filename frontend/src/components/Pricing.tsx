import React from 'react';
import { Check, Zap, Crown, Star, ArrowLeft } from 'lucide-react';

interface PricingProps {
  onBack: () => void;
}

const Pricing: React.FC<PricingProps> = ({ onBack }) => {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      description: 'Perfect for trying out our AI',
      features: ['5 images per day', 'Standard styles', '1:1 aspect ratio', 'Community support'],
      icon: <Star className="text-slate-400" />,
      buttonText: 'Current Plan',
      popular: false
    },
    {
      name: 'Pro',
      price: '$19',
      description: 'For power users and creators',
      features: ['Unlimited images', 'All art styles', 'All aspect ratios', 'Fast generation', 'HD downloads', 'Priority support'],
      icon: <Zap className="text-amber-400" />,
      buttonText: 'Upgrade (Coming Soon)',
      popular: true
    },
    {
      name: 'Studio',
      price: '$49',
      description: 'Professional grade tools',
      features: ['API Access', 'Custom models', 'Commercial license', 'Bulk generation', '24/7 dedicated support'],
      icon: <Crown className="text-blue-400" />,
      buttonText: 'Contact Sales',
      popular: false
    }
  ];

  return (
    <div className="min-h-screen py-10 px-4">
      <button
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-slate-500 hover:text-white transition-colors"
      >
        <ArrowLeft size={20} />
        Back to Generator
      </button>

      <div className="max-w-6xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <h2 className="text-5xl font-black text-white tracking-tight">Simple Pricing</h2>
          <p className="text-slate-400 text-xl max-w-2xl mx-auto">Choose the perfect plan for your creative journey. No hidden fees.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-slate-900 border ${plan.popular ? 'border-blue-500 shadow-blue-900/20' : 'border-slate-800'} p-8 rounded-[32px] flex flex-col space-y-8 shadow-2xl transition-transform hover:scale-[1.02]`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full">
                  Most Popular
                </div>
              )}

              <div className="space-y-4">
                <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center">
                  {plan.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">{plan.price}</span>
                    <span className="text-slate-500">/month</span>
                  </div>
                </div>
                <p className="text-slate-400 text-sm">{plan.description}</p>
              </div>

              <div className="flex-1 space-y-4">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div className="w-5 h-5 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500">
                      <Check size={12} />
                    </div>
                    <span className="text-slate-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                className={`w-full py-4 rounded-xl font-bold transition-all active:scale-[0.98] ${
                  plan.popular
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pricing;
