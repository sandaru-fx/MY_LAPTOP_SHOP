
import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { LandingPage } from './pages/LandingPage';
import { ShopPage } from './pages/ShopPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { CheckoutPage } from './pages/CheckoutPage';
import { LogoutPage } from './pages/LogoutPage';
import { Toast, ToastType } from './components/Toast';
import { LiveConcierge } from './components/LiveConcierge';
import { AIChatWidget } from './components/AIChatWidget';
import { api } from './services/apiService';
import { Laptop, CartItem, User, Order } from './types';
import { 
  Trash2, Plus, Minus, ShoppingBag, ArrowRight, Mail, User as UserIcon, Lock, Key, ShieldCheck
} from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState('landing');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toast, setToast] = useState<{message: string, type: ToastType} | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>((localStorage.getItem('luxe_theme') as 'dark' | 'light') || 'dark');
  const [isLiveConciergeOpen, setIsLiveConciergeOpen] = useState(false);

  useEffect(() => {
    const savedAuth = localStorage.getItem('luxe_auth');
    if (savedAuth) {
      const u = JSON.parse(savedAuth);
      setCurrentUser(u);
      setCurrentPage(u.role === 'ADMIN' ? 'admin' : 'home');
    }
  }, []);

  useEffect(() => {
    const savedCart = localStorage.getItem('luxe_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    localStorage.setItem('luxe_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.classList.toggle('light', theme === 'light');
    localStorage.setItem('luxe_theme', theme);
  }, [theme]);

  const notify = (message: string, type: ToastType = 'success') => setToast({ message, type });

  const handlePageChange = (page: string) => {
    if ((page === 'admin' || page === 'profile') && !currentUser) return setCurrentPage('login');
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogin = async (email: string) => {
    // Regex Validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return notify("Identity: Invalid email format.", 'error');
    
    try {
      const u = await api.login(email);
      if (u) {
        setCurrentUser(u);
        notify(`Authorized: Welcome back ${u.name}`);
        handlePageChange(u.role === 'ADMIN' ? 'admin' : 'home');
      }
    } catch (err: any) {
      notify(err.message, 'error');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('luxe_auth');
    setCurrentUser(null);
    handlePageChange('landing');
    notify('Securely Terminated Session', 'info');
  };

  const addToCart = (laptop: Laptop) => {
    if (laptop.stock <= 0) return notify("Logistics: Asset out of stock.", "error");
    setCart(prev => {
      const existing = prev.find(item => item.id === laptop.id);
      if (existing) return prev.map(item => item.id === laptop.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...laptop, quantity: 1 }];
    });
    notify(`Asset ${laptop.model} added to bag.`);
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const renderContent = () => {
    switch (currentPage) {
      case 'landing': return <LandingPage onPageChange={handlePageChange} />;
      case 'home': return <HomePage onPageChange={handlePageChange} onProductClick={() => setCurrentPage('shop')} onOpenConcierge={() => setIsLiveConciergeOpen(true)} />;
      case 'shop': return <ShopPage onProductClick={(id) => notify("Technical specs detail pending implementation.")} />;
      case 'admin': return <AdminDashboard />;
      case 'cart': return <CartPage cart={cart} total={cartTotal} onUpdateQty={(id: string, d: number) => setCart(prev => prev.map(i => i.id === id ? {...i, quantity: Math.max(1, i.quantity+d)} : i))} onRemove={(id: string) => setCart(prev => prev.filter(i => i.id !== id))} onCheckout={() => handlePageChange('checkout')} />;
      case 'login': return <LoginPage onLogin={handleLogin} onPageChange={handlePageChange} />;
      case 'logout': return <LogoutPage onConfirm={handleLogout} onCancel={() => handlePageChange('home')} />;
      case 'register': return <RegisterPage onRegister={async (n, e) => { try { await api.register(n, e); notify('Registered.'); handlePageChange('login'); } catch (err: any) { notify(err.message, 'error'); } }} onPageChange={handlePageChange} />;
      case 'checkout': return <CheckoutPage cart={cart} total={cartTotal} onPlaceOrder={async (addr, pay) => { try { await api.createOrder({ userId: currentUser?.id || 'guest', items: cart, total: cartTotal, status: 'Pending', paymentMethod: pay, shippingAddress: addr }); setCart([]); notify('Order Transmitted.'); handlePageChange('home'); } catch (err: any) { notify(err.message, 'error'); } }} onCancel={() => handlePageChange('cart')} />;
      default: return <LandingPage onPageChange={handlePageChange} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-luxe-light dark:bg-luxe-dark text-luxe-text-brandLight dark:text-luxe-text-bodyDark transition-colors duration-500">
      <Navbar onPageChange={handlePageChange} cartCount={cart.reduce((a, b) => a + b.quantity, 0)} theme={theme} onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')} user={currentUser} onLogout={() => handlePageChange('logout')} onOpenConcierge={() => setIsLiveConciergeOpen(true)} />
      <main className="flex-1">{renderContent()}</main>
      <Footer onPageChange={handlePageChange} isAdmin={currentUser?.role === 'ADMIN'} />
      <LiveConcierge isOpen={isLiveConciergeOpen} onClose={() => setIsLiveConciergeOpen(false)} />
      {currentUser && <AIChatWidget />}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

const LoginPage = ({ onLogin, onPageChange }: any) => {
  const [email, setEmail] = useState('');
  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center p-6 relative">
      <div className="glass p-14 rounded-[3.5rem] bg-luxe-card-dark border-white/10 shadow-3xl w-full max-w-xl animate-in fade-in duration-700">
        <h2 className="text-5xl font-black text-white tracking-tighter mb-4">Initialize Session</h2>
        <p className="text-slate-500 mb-10 font-bold uppercase tracking-widest text-xs">Identity Verification Node</p>
        <div className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-luxe-accent-dark" size={20} />
            <input className="w-full bg-luxe-dark border border-white/10 rounded-2xl pl-14 pr-6 py-5 outline-none focus:ring-2 focus:ring-luxe-accent-dark text-white" placeholder="Authorized Email..." value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <button onClick={() => onLogin(email)} className="w-full bg-luxe-accent-dark text-white py-5 rounded-2xl font-black text-xl shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-2">Initialize <ArrowRight size={20}/></button>
          <button onClick={() => onPageChange('register')} className="w-full text-slate-500 text-sm hover:text-white transition-colors">Request New Identity Access</button>
        </div>
      </div>
    </div>
  );
};

const RegisterPage = ({ onRegister, onPageChange }: any) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center p-6">
      <div className="glass p-14 rounded-[3.5rem] bg-luxe-card-dark border-white/10 shadow-3xl w-full max-w-xl">
        <h2 className="text-5xl font-black text-white mb-10 tracking-tighter">New Identity</h2>
        <div className="space-y-6">
          <input className="w-full bg-luxe-dark border border-white/10 rounded-2xl p-5 text-white" placeholder="Full Name..." value={name} onChange={e => setName(e.target.value)} />
          <input className="w-full bg-luxe-dark border border-white/10 rounded-2xl p-5 text-white" placeholder="Email..." value={email} onChange={e => setEmail(e.target.value)} />
          <button onClick={() => onRegister(name, email)} className="w-full bg-luxe-accent-dark text-white py-5 rounded-2xl font-black text-xl shadow-2xl">Create Access</button>
        </div>
      </div>
    </div>
  );
};

const CartPage = ({ cart, total, onUpdateQty, onRemove, onCheckout }: any) => (
  <div className="container mx-auto px-6 py-24 min-h-[70vh]">
    <h2 className="text-8xl font-black tracking-tighter uppercase opacity-10 mb-10">THE BAG</h2>
    {cart.length === 0 ? <p className="text-slate-500 text-2xl font-bold text-center py-20">Logistics queue empty.</p> : (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
        <div className="lg:col-span-2 space-y-6">
          {cart.map((i: any) => (
            <div key={i.id} className="bg-luxe-card-dark p-8 rounded-[2rem] border border-white/5 flex items-center gap-8">
              <img src={i.images[0]} className="w-24 h-24 object-contain" />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white">{i.model}</h3>
                <p className="text-luxe-accent-dark font-black">${i.price}</p>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => onUpdateQty(i.id, -1)} className="p-2 bg-white/5 rounded-lg text-white"><Minus size={14}/></button>
                <span className="font-black text-white">{i.quantity}</span>
                <button onClick={() => onUpdateQty(i.id, 1)} className="p-2 bg-white/5 rounded-lg text-white"><Plus size={14}/></button>
              </div>
              <button onClick={() => onRemove(i.id)} className="text-red-500 hover:bg-red-500/10 p-4 rounded-full"><Trash2 /></button>
            </div>
          ))}
        </div>
        <div className="bg-luxe-card-dark p-10 rounded-[3rem] border border-white/5 h-fit shadow-2xl">
          <h3 className="text-2xl font-black text-white mb-6">Summary</h3>
          <div className="flex justify-between text-3xl font-black text-white pt-6 border-t border-white/10"><span>Total</span><span>${total}</span></div>
          <button onClick={onCheckout} className="w-full bg-luxe-accent-dark text-white py-6 rounded-2xl font-black text-xl shadow-2xl mt-8">Secure Checkout</button>
        </div>
      </div>
    )}
  </div>
);

export default App;
