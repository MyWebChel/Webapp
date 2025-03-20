import React, { useState, useEffect } from 'react';
import { Star, MessageCircle, CreditCard, ShieldCheck, ArrowRight, Zap, Clock, Award, Sparkles, Gift, Heart, CheckCircle2, AlertCircle, RefreshCw, TrendingUp, Shield, Rocket, Crown } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';

// Версия приложения для контроля кеша
const APP_VERSION = '1.0.3';

// Доступные промокоды и их скидки
const PROMO_CODES = {
  'stars2024': 10, // 10% скидка
  'vip2024': 15,   // 15% скидка
  'super50': 20,   // 20% скидка
  'mega100': 25    // 25% скидка
};

// Пакеты звёзд
const STAR_PACKAGES = [
  { amount: 100, discount: 5, label: 'Стартовый' },
  { amount: 500, discount: 10, label: 'Продвинутый' },
  { amount: 1000, discount: 15, label: 'VIP' },
  { amount: 5000, discount: 20, label: 'Максимальный' }
];

function App() {
  const [username, setUsername] = useState('');
  const [starsCount, setStarsCount] = useState(50);
  const [selectedPayment, setSelectedPayment] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPromo, setShowPromo] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [activePromoDiscount, setActivePromoDiscount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showPackages, setShowPackages] = useState(false);
  
  const basePrice = starsCount * 1.9;
  const packageDiscount = STAR_PACKAGES.find(pkg => starsCount >= pkg.amount)?.discount || 0;
  const totalDiscount = Math.max(packageDiscount, activePromoDiscount);
  const discount = basePrice * (totalDiscount / 100);
  const totalPrice = (basePrice - discount).toFixed(2);
  
  const tg = window.Telegram.WebApp;
  const isInTelegram = Boolean(window.Telegram?.WebApp);

  useEffect(() => {
    if (isInTelegram) {
      const savedVersion = localStorage.getItem('app_version');
      if (savedVersion !== APP_VERSION) {
        localStorage.clear();
        localStorage.setItem('app_version', APP_VERSION);
        window.location.reload();
        return;
      }

      tg.ready();
      tg.expand();
      
      if (tg.initDataUnsafe?.user?.username) {
        setUsername('@' + tg.initDataUnsafe.user.username);
      }
      
      tg.MainButton.setParams({
        text: `Оплатить ${totalPrice}₽`,
        color: "#8B5CF6",
        text_color: "#FFFFFF",
      });
      
      if (username && selectedPayment) {
        tg.MainButton.show();
      } else {
        tg.MainButton.hide();
      }

      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
        setIsLoading(false);
      }, 1000);
    } else {
      setIsLoading(false);
    }
  }, [username, selectedPayment, totalPrice]);

  const simulatePayment = () => {
    setIsProcessing(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        setIsProcessing(false);
        resolve(true);
      }, 2000);
    });
  };

  const handlePayment = async () => {
    if (!username) {
      toast.error('Введите ваш username', {
        icon: '🚫',
        duration: 2000,
        style: {
          background: '#ef4444',
          color: '#fff',
        },
      });
      return;
    }

    if (!selectedPayment) {
      toast.error('Выберите способ оплаты', {
        icon: '💳',
        duration: 2000,
        style: {
          background: '#ef4444',
          color: '#fff',
        },
      });
      return;
    }

    if (isInTelegram) {
      await simulatePayment();
      const result = await tg.showPopup({
        title: '🌟 Оплата',
        message: `${username}, спасибо за заказ!\n\n` +
                `Количество звёзд: ${starsCount} ⭐\n` +
                `Способ оплаты: ${selectedPayment}\n` +
                `${totalDiscount > 0 ? `Скидка: ${totalDiscount}%\n` : ''}` +
                `Сумма к оплате: ${totalPrice}₽\n\n` +
                `Выберите действие:`,
        buttons: [
          {
            id: 'pay',
            type: 'default',
            text: '💳 Перейти к оплате'
          },
          {
            id: 'support',
            type: 'default',
            text: '👨‍💻 Поддержка'
          },
          {
            id: 'cancel',
            type: 'cancel',
            text: 'Отмена'
          }
        ]
      });

      switch (result.button_id) {
        case 'pay':
          toast.success('Переход к оплате...', {
            icon: '💫',
            duration: 2000,
          });
          break;
        case 'support':
          toast('Связываемся с поддержкой...', {
            icon: '👨‍💻',
            duration: 2000,
          });
          break;
        case 'cancel':
          toast('Заказ отменён', {
            icon: '❌',
            duration: 2000,
          });
          break;
      }
    } else {
      await simulatePayment();
      toast.success('Переход к оплате...', {
        icon: '💫',
        duration: 2000,
      });
    }
  };

  useEffect(() => {
    if (isInTelegram) {
      tg.MainButton.onClick(handlePayment);
      return () => {
        tg.MainButton.offClick(handlePayment);
      };
    }
  }, [username, starsCount, selectedPayment]);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    if (!value.startsWith('@') && value !== '') {
      setUsername('@' + value);
    } else {
      setUsername(value);
    }
  };

  const handlePaymentSelect = (payment: string) => {
    setSelectedPayment(payment);
    toast.success(`✨ Выбран способ оплаты: ${payment}`, {
      duration: 2000,
      style: {
        background: '#22c55e',
        color: '#fff',
      },
    });
  };

  const handleStarsChange = (value: number) => {
    const newValue = Math.max(50, value);
    setStarsCount(newValue);
    if (newValue >= 1000) {
      toast('🎉 Вау! Большой заказ!', {
        duration: 2000,
        style: {
          background: '#8B5CF6',
          color: '#fff',
        },
      });
    }
  };

  const handlePromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoCode.toLowerCase();
    const discount = PROMO_CODES[code as keyof typeof PROMO_CODES];
    
    if (discount) {
      setActivePromoDiscount(discount);
      toast.success(`🎉 Промокод активирован! Скидка ${discount}%`, {
        duration: 3000,
      });
      setShowPromo(false);
    } else {
      toast.error('❌ Неверный промокод', {
        duration: 2000,
      });
    }
  };

  const selectPackage = (amount: number) => {
    setStarsCount(amount);
    setShowPackages(false);
    toast.success('✨ Выбран пакет звёзд!', {
      duration: 2000,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-purple-900 via-indigo-900 to-black flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-purple-900 via-indigo-900 to-black text-white pb-24">
      <Toaster position="top-center" />
      
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 -top-48 -left-48 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-blue-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        {showConfetti && (
          <div className="absolute inset-0 animate-fade-out">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              >
                ✨
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="relative container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative group cursor-pointer">
            <Star className="w-16 h-16 text-yellow-400 animate-pulse mb-4 transform transition-transform group-hover:scale-110" />
            <div className="absolute top-0 left-0 w-full h-full bg-yellow-400/20 blur-xl rounded-full animate-pulse"></div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
            Звёзды Telegram
          </h1>
          <p className="text-base text-gray-300 max-w-2xl">
            Мгновенное повышение рейтинга вашего Telegram-канала.<br/>
            От 50 звёзд всего за 1.9₽ за звезду.
          </p>
        </div>

        <div className="max-w-md mx-auto space-y-6">
          {/* Features Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white/5 backdrop-blur-lg p-3 rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105">
              <Zap className="w-6 h-6 text-yellow-400 mb-2" />
              <h3 className="font-bold text-sm mb-1">Мгновенно</h3>
              <p className="text-xs text-gray-400">Моментальная доставка</p>
            </div>
            <div className="bg-white/5 backdrop-blur-lg p-3 rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105">
              <Shield className="w-6 h-6 text-green-400 mb-2" />
              <h3 className="font-bold text-sm mb-1">Безопасно</h3>
              <p className="text-xs text-gray-400">Гарантия качества</p>
            </div>
            <div className="bg-white/5 backdrop-blur-lg p-3 rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105">
              <Rocket className="w-6 h-6 text-blue-400 mb-2" />
              <h3 className="font-bold text-sm mb-1">Быстро</h3>
              <p className="text-xs text-gray-400">Скорость доставки</p>
            </div>
            <div className="bg-white/5 backdrop-blur-lg p-3 rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105">
              <Crown className="w-6 h-6 text-purple-400 mb-2" />
              <h3 className="font-bold text-sm mb-1">Премиум</h3>
              <p className="text-xs text-gray-400">Высокое качество</p>
            </div>
          </div>

          {/* Order Form */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 transform transition-all duration-300 hover:border-purple-500/50">
            <div className="space-y-4">
              <div>
                <label className="block text-base font-medium mb-1">
                  Ваш username в Telegram
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={handleUsernameChange}
                    placeholder="@username"
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    required
                  />
                  {username && (
                    <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-400" />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-base font-medium mb-1 flex justify-between items-center">
                  <span>Количество звёзд</span>
                  <button
                    onClick={() => setShowPackages(!showPackages)}
                    className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
                  >
                    <TrendingUp className="w-4 h-4" />
                    Готовые пакеты
                  </button>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="50"
                    step="1"
                    value={starsCount}
                    onChange={(e) => handleStarsChange(parseInt(e.target.value) || 50)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    required
                  />
                  <Sparkles className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-yellow-400" />
                </div>

                {/* Пакеты звёзд */}
                {showPackages && (
                  <div className="mt-2 space-y-2">
                    {STAR_PACKAGES.map((pkg) => (
                      <button
                        key={pkg.amount}
                        onClick={() => selectPackage(pkg.amount)}
                        className="w-full p-3 rounded-xl bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-500 transition-all duration-300 text-left flex justify-between items-center"
                      >
                        <div>
                          <span className="font-medium">{pkg.label}</span>
                          <p className="text-sm text-gray-400">{pkg.amount} звёзд</p>
                        </div>
                        <div className="text-right">
                          <span className="text-green-400">-{pkg.discount}%</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Промокод */}
              <div>
                <button
                  onClick={() => setShowPromo(!showPromo)}
                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
                >
                  <Gift className="w-4 h-4" />
                  {activePromoDiscount > 0 
                    ? `Активирована скидка ${activePromoDiscount}%` 
                    : 'У меня есть промокод'}
                </button>
                {showPromo && (
                  <form onSubmit={handlePromoSubmit} className="mt-2 flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Введите промокод"
                      className="flex-1 px-3 py-2 bg-white/5 border border-white/20 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition text-sm"
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors text-sm"
                    >
                      ОК
                    </button>
                  </form>
                )}
              </div>

              <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 p-4 rounded-xl border border-white/10">
                <div className="flex justify-between items-center mb-2">
                  <span>Цена за звезду:</span>
                  <span className="font-mono">1.9₽</span>
                </div>
                {packageDiscount > 0 && (
                  <div className="flex justify-between items-center mb-2 text-green-400">
                    <span>Пакетная скидка:</span>
                    <span className="font-mono">-{packageDiscount}%</span>
                  </div>
                )}
                {activePromoDiscount > 0 && (
                  <div className="flex justify-between items-center mb-2 text-green-400">
                    <span>Промокод:</span>
                    <span className="font-mono">-{activePromoDiscount}%</span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="flex justify-between items-center mb-2 text-green-400">
                    <span>Экономия:</span>
                    <span className="font-mono">-{discount.toFixed(2)}₽</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Итого:</span>
                  <span className="font-mono bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {totalPrice}₽
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              Способ оплаты
            </h2>
            {[
              { id: 'cryptobot', name: 'CryptoBot', icon: '🤖', description: 'Оплата в криптовалюте' },
              { id: 'crystalpay', name: 'CrystalPay', icon: '💎', description: 'Любой способ оплаты' },
              { id: 'lolz', name: 'Lolz.live (Market)', icon: '🛒', description: 'Безопасная сделка' },
              { id: 'ton', name: 'TON/USDT', icon: '💰', description: 'Быстрые переводы' }
            ].map((payment) => (
              <button
                key={payment.id}
                onClick={() => handlePaymentSelect(payment.name)}
                className={`w-full p-4 rounded-xl backdrop-blur-lg border transition-all duration-300 flex items-center gap-3 hover:transform hover:scale-[1.02]
                  ${selectedPayment === payment.name 
                    ? 'bg-purple-500/20 border-purple-500' 
                    : 'bg-white/5 border-white/20 hover:border-purple-500/50'}`}
              >
                <span className="text-2xl">{payment.icon}</span>
                <div className="text-left">
                  <span className="font-medium block">{payment.name}</span>
                  <span className="text-sm text-gray-400">{payment.description}</span>
                </div>
                {selectedPayment === payment.name && (
                  <span className="ml-auto text-purple-400">✓</span>
                )}
              </button>
            ))}
          </div>

          {/* Additional Info */}
          <div className="text-center text-sm text-gray-400 space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Gift className="w-4 h-4 text-purple-400" />
              <p>После оплаты звёзды будут добавлены автоматически</p>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Heart className="w-4 h-4 text-pink-400" />
              <p>Возникли вопросы? Обратитесь в поддержку</p>
            </div>
          </div>
        </div>
      </div>

      {/* Фиксированная кнопка оплаты */}
      {!isInTelegram && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
          <div className="container mx-auto max-w-md">
            <button
              onClick={handlePayment}
              disabled={isProcessing || !username || !selectedPayment}
              className={`w-full py-4 px-6 rounded-xl text-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg transition-all duration-300 backdrop-blur-lg transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none
                ${isProcessing ? 'animate-pulse' : ''}`}
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⭐</span>
                  Обработка...
                </span>
              ) : (
                `Оплатить ${totalPrice}₽`
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;