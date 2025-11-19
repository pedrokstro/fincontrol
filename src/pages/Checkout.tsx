import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { 
  CreditCard, 
  Lock, 
  Check, 
  ArrowLeft, 
  Crown,
  Shield,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user: _user } = useAuthStore();
  
  // Obter plano da URL (monthly ou yearly)
  const plan = searchParams.get('plan') || 'monthly';
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'pix'>('credit_card');
  
  // Dados do cartão
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  
  // Preços
  const prices = {
    monthly: { value: 14.99, label: 'Mensal', period: 'mês' },
    yearly: { value: 149.99, label: 'Anual', period: 'ano', monthlyEquivalent: 12.49 }
  };
  
  const selectedPrice = prices[plan as keyof typeof prices] || prices.monthly;
  const savings = plan === 'yearly' ? ((14.99 * 12 - 149.99) / (14.99 * 12) * 100).toFixed(0) : 0;

  // Formatação de cartão
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.slice(0, 19); // 16 dígitos + 3 espaços
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardNumber(formatCardNumber(e.target.value));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardExpiry(formatExpiry(e.target.value));
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCardCvv(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (paymentMethod === 'credit_card') {
      // Validações
      if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
        toast.error('Número do cartão inválido');
        return;
      }
      
      if (!cardName) {
        toast.error('Nome do titular é obrigatório');
        return;
      }
      
      if (!cardExpiry || cardExpiry.length < 5) {
        toast.error('Data de validade inválida');
        return;
      }
      
      if (!cardCvv || cardCvv.length < 3) {
        toast.error('CVV inválido');
        return;
      }
    }

    setIsProcessing(true);

    try {
      // Simular processamento de pagamento
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // TODO: Integrar com API de pagamento real
      // await subscriptionService.createSubscription({
      //   plan,
      //   paymentMethod,
      //   cardData: { ... }
      // });

      toast.success('Pagamento processado com sucesso!');
      toast.success('Bem-vindo ao Premium! 🎉');
      
      // Redirecionar para dashboard
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
      
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      toast.error('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/plans')}
            className="flex items-center gap-2 text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar para planos
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Finalizar Assinatura
              </h1>
              <p className="text-gray-600 dark:text-neutral-400">
                Você está a um passo do Premium!
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulário de Pagamento */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Informações de Pagamento
              </h2>

              {/* Método de Pagamento */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-3">
                  Método de Pagamento
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      paymentMethod === 'credit_card'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-neutral-700 hover:border-gray-300 dark:hover:border-neutral-600'
                    }`}
                  >
                    <CreditCard className={`w-6 h-6 mx-auto mb-2 ${
                      paymentMethod === 'credit_card' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'
                    }`} />
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Cartão de Crédito
                    </p>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('pix')}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      paymentMethod === 'pix'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-neutral-700 hover:border-gray-300 dark:hover:border-neutral-600'
                    }`}
                  >
                    <div className={`w-6 h-6 mx-auto mb-2 font-bold text-lg ${
                      paymentMethod === 'pix' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'
                    }`}>
                      PIX
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      PIX
                    </p>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {paymentMethod === 'credit_card' ? (
                  <>
                    {/* Número do Cartão */}
                    <div>
                      <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
                        Número do Cartão
                      </label>
                      <div className="relative">
                        <input
                          id="cardNumber"
                          type="text"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          placeholder="1234 5678 9012 3456"
                          className="input pl-10"
                          required
                        />
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      </div>
                    </div>

                    {/* Nome do Titular */}
                    <div>
                      <label htmlFor="cardName" className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
                        Nome do Titular
                      </label>
                      <input
                        id="cardName"
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value.toUpperCase())}
                        placeholder="NOME COMO ESTÁ NO CARTÃO"
                        className="input"
                        required
                      />
                    </div>

                    {/* Validade e CVV */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="cardExpiry" className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
                          Validade
                        </label>
                        <input
                          id="cardExpiry"
                          type="text"
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          placeholder="MM/AA"
                          className="input"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="cardCvv" className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
                          CVV
                        </label>
                        <input
                          id="cardCvv"
                          type="text"
                          value={cardCvv}
                          onChange={handleCvvChange}
                          placeholder="123"
                          className="input"
                          required
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-center">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">PIX</div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Pagamento via PIX
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-neutral-400 mb-4">
                      Ao confirmar, você receberá um QR Code para realizar o pagamento
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                      <Sparkles className="w-4 h-4" />
                      <span>Aprovação instantânea</span>
                    </div>
                  </div>
                )}

                {/* Botão de Pagamento */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full btn-primary py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processando...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Lock className="w-5 h-5" />
                      Confirmar Pagamento - R$ {selectedPrice.value.toFixed(2)}
                    </span>
                  )}
                </button>

                {/* Segurança */}
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-neutral-400">
                  <Shield className="w-4 h-4" />
                  <span>Pagamento 100% seguro e criptografado</span>
                </div>
              </form>
            </div>
          </div>

          {/* Resumo do Pedido */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-8">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Resumo do Pedido
              </h3>

              {/* Plano Selecionado */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      Plano Premium
                    </p>
                    <p className="text-sm text-gray-600 dark:text-neutral-400">
                      {selectedPrice.label}
                    </p>
                  </div>
                </div>
                
                {plan === 'yearly' && (
                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded px-2 py-1">
                    <Check className="w-4 h-4" />
                    <span>Economize {savings}% no plano anual</span>
                  </div>
                )}
              </div>

              {/* Detalhes */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-neutral-400">Subtotal</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    R$ {selectedPrice.value.toFixed(2)}
                  </span>
                </div>
                
                {plan === 'yearly' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-neutral-400">
                      Equivalente mensal
                    </span>
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      R$ {'monthlyEquivalent' in selectedPrice ? selectedPrice.monthlyEquivalent : selectedPrice.value}/mês
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-neutral-400">Período de teste</span>
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    30 dias grátis
                  </span>
                </div>
                
                <div className="border-t border-gray-200 dark:border-neutral-700 pt-3 flex justify-between">
                  <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                  <span className="font-bold text-xl text-gray-900 dark:text-white">
                    R$ {selectedPrice.value.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Benefícios */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700 dark:text-neutral-300">
                  Você terá acesso a:
                </p>
                <div className="space-y-2">
                  {[
                    'Ícones e emojis exclusivos',
                    'Personalização avançada',
                    'Relatórios detalhados',
                    'Suporte prioritário',
                    'Sem anúncios',
                    'Novos recursos primeiro'
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-neutral-400">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Aviso */}
              <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-800 dark:text-blue-300">
                    <p className="font-medium mb-1">Período de teste grátis</p>
                    <p>
                      Você não será cobrado nos primeiros 30 dias. Cancele a qualquer momento.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
