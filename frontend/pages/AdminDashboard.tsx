
import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, Package, ShoppingBag, BarChart3, TrendingUp, 
  Plus, Edit2, Trash2, CheckCircle, MessageSquare, Save, X, UserCog,
  Cpu as CpuIcon, Layout, Info, Send, ArrowRight, Activity, Shield, UserCheck, UserX, Github, ExternalLink
} from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { api } from '../services/apiService';
import { Laptop, User, Order, AnalyticsData, OrderStatus } from '../types';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { BRANDS, CATEGORIES, MOCK_REVENUE } from '../constants';

// --- 3D Dashboard Background ---
const DashMesh = 'mesh' as any;
const DashSphereGeometry = 'sphereGeometry' as any;
const DashMeshStandardMaterial = 'meshStandardMaterial' as any;
const DashAmbientLight = 'ambientLight' as any;
const DashPointLight = 'pointLight' as any;

const NeuralNode: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime + position[0]) * 0.005;
    }
  });
  return (
    <DashMesh position={position} ref={meshRef}>
      <DashSphereGeometry args={[0.05, 16, 16]} />
      <DashMeshStandardMaterial color="#2997FF" emissive="#2997FF" emissiveIntensity={2} />
    </DashMesh>
  );
};

const TechBackground = () => (
  <div className="fixed inset-0 -z-10 pointer-events-none opacity-30">
    <Canvas camera={{ position: [0, 0, 5] }}>
      <DashAmbientLight intensity={0.2} />
      <DashPointLight position={[10, 10, 10]} intensity={1} />
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <Sphere args={[1.5, 64, 64]}>
          <MeshDistortMaterial color="#1E1E1E" distort={0.3} speed={2} metalness={1} roughness={0} />
        </Sphere>
      </Float>
      {Array.from({ length: 20 }).map((_, i) => (
        <NeuralNode key={i} position={[(Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, (Math.random() - 0.5) * 5]} />
      ))}
      <Environment preset="city" />
    </Canvas>
  </div>
);

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'stats' | 'laptops' | 'users' | 'orders'>('stats');
  const [laptops, setLaptops] = useState<Laptop[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingLaptop, setEditingLaptop] = useState<Laptop | null>(null);
  const [isAddingLaptop, setIsAddingLaptop] = useState(false);
  
  const initialNewLaptop: Omit<Laptop, 'id'> = {
    brand: BRANDS[0], model: '', price: 0, cpu: '', gpu: '', ram: '', storage: '',
    images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop'], 
    description: '', stock: 10, isFeatured: false, category: CATEGORIES[0]
  };
  const [laptopForm, setLaptopForm] = useState<Omit<Laptop, 'id'> | Laptop>(initialNewLaptop);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [l, u, o] = await Promise.all([api.getLaptops(), api.getUsers(), api.getOrders()]);
      setLaptops(l); setUsers(u); setOrders(o);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveLaptop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (laptopForm.price <= 0) return alert("Validation: Price must be positive.");
    if (laptopForm.model.length < 3) return alert("Validation: Model name too short.");
    
    try {
      await api.saveLaptop(laptopForm);
      setEditingLaptop(null);
      setIsAddingLaptop(false);
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteLaptop = async (id: string) => {
    if (confirm("Erase asset from database?")) {
      await api.deleteLaptop(id);
      loadData();
    }
  };

  const handleToggleUser = async (id: string) => {
    await api.toggleUser(id);
    loadData();
  };

  const handleStatusChange = async (id: string, status: OrderStatus) => {
    await api.updateOrderStatus(id, status);
    loadData();
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-luxe-accent-dark font-black uppercase tracking-widest animate-pulse">Synchronizing Data...</div>;

  return (
    <div className="relative min-h-screen">
      <TechBackground />
      <div className="container mx-auto px-6 py-12 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-72 space-y-2">
            <div className="bg-luxe-card-dark p-8 rounded-[2.5rem] mb-6 border border-white/5">
              <h1 className="text-3xl font-black tracking-tighter text-white">CENTRAL<br/><span className="text-luxe-accent-dark">COMMAND</span></h1>
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] mt-2 flex items-center gap-2"><Shield size={10} className="text-luxe-accent-dark" /> V5.2 SECURE</p>
            </div>
            
            {['stats', 'laptops', 'orders', 'users'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab as any)} className={`w-full flex items-center space-x-4 px-8 py-5 rounded-3xl transition-all font-black text-sm uppercase tracking-widest ${activeTab === tab ? 'bg-luxe-accent-dark text-white shadow-2xl shadow-blue-500/20' : 'bg-luxe-card-dark/40 hover:bg-luxe-card-dark text-slate-500 border border-white/5'}`}>
                {tab === 'stats' && <BarChart3 />}
                {tab === 'laptops' && <Package />}
                {tab === 'orders' && <ShoppingBag />}
                {tab === 'users' && <Users />}
                <span>{tab}</span>
              </button>
            ))}

            <div className="pt-6">
              <a 
                href="https://github.com/sandaru-fx/MY_LAPTOP_SHOP.git" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between px-8 py-5 rounded-3xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all font-black text-[10px] uppercase tracking-widest group"
              >
                <div className="flex items-center space-x-3">
                  <Github size={16} />
                  <span>Source Protocol</span>
                </div>
                <ExternalLink size={12} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </a>
            </div>
          </div>

          <div className="flex-1 space-y-8 animate-in fade-in duration-500">
            {activeTab === 'stats' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Net Revenue" value={`$${orders.reduce((a,b)=>a+b.total,0).toLocaleString()}`} icon={<TrendingUp />} />
                <StatCard label="Inventory" value={laptops.length} icon={<Package />} />
                <StatCard label="Orders" value={orders.length} icon={<ShoppingBag />} />
                <StatCard label="Citizens" value={users.length} icon={<Users />} />
              </div>
            )}

            {activeTab === 'laptops' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                   <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Hardware Vault</h2>
                   <button onClick={() => { setLaptopForm(initialNewLaptop); setIsAddingLaptop(true); }} className="bg-luxe-accent-dark text-white px-8 py-4 rounded-2xl font-black shadow-xl flex items-center gap-2"><Plus size={20}/> Deploy Asset</button>
                </div>
                <div className="bg-luxe-card-dark rounded-[2.5rem] overflow-hidden border border-white/5">
                  <table className="w-full text-left">
                    <thead className="bg-white/5 text-[10px] uppercase font-black text-slate-500">
                      <tr><th className="px-8 py-6">Identity</th><th className="px-8 py-6">Value</th><th className="px-8 py-6">Status</th><th className="px-8 py-6 text-right">Action</th></tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {laptops.map(l => (
                        <tr key={l.id} className="hover:bg-white/5">
                          <td className="px-8 py-6 font-bold text-white">{l.model}<br/><span className="text-[9px] text-luxe-accent-dark">{l.brand}</span></td>
                          <td className="px-8 py-6 font-black text-lg text-white">${l.price.toLocaleString()}</td>
                          <td className="px-8 py-6"><span className={`text-xs font-black uppercase ${l.stock < 5 ? 'text-red-500' : 'text-green-500'}`}>{l.stock} In Stock</span></td>
                          <td className="px-8 py-6 text-right space-x-2">
                             <button onClick={() => { setEditingLaptop(l); setLaptopForm(l); }} className="p-3 bg-white/5 text-white rounded-xl hover:bg-luxe-accent-dark"><Edit2 size={16}/></button>
                             <button onClick={() => handleDeleteLaptop(l.id)} className="p-3 bg-red-600/10 text-red-500 rounded-xl hover:bg-red-600 hover:text-white"><Trash2 size={16}/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="bg-luxe-card-dark rounded-[3rem] border border-white/5 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-white/5 text-[10px] uppercase font-black text-slate-500">
                    <tr><th className="px-8 py-6">Order ID</th><th className="px-8 py-6">Total</th><th className="px-8 py-6">Status</th><th className="px-8 py-6 text-right">Update</th></tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {orders.map(o => (
                      <tr key={o.id} className="hover:bg-white/5">
                        <td className="px-8 py-6 font-mono text-xs text-slate-400">{o.id}</td>
                        <td className="px-8 py-6 font-black text-white">${o.total.toLocaleString()}</td>
                        <td className="px-8 py-6">
                           <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase ${o.status === 'Completed' ? 'bg-green-500/20 text-green-500' : 'bg-blue-500/20 text-blue-500'}`}>{o.status}</span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button onClick={() => handleStatusChange(o.id, o.status === 'Pending' ? 'Processing' : 'Completed')} className="bg-luxe-accent-dark text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase">Next State</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {(isAddingLaptop || editingLaptop) && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
             <div className="bg-luxe-card-dark w-full max-w-4xl p-12 rounded-[3.5rem] border border-white/10 overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-10">
                   <h2 className="text-4xl font-black text-white uppercase tracking-tighter">{editingLaptop ? 'Modify Identity' : 'Deploy New Asset'}</h2>
                   <button onClick={() => { setEditingLaptop(null); setIsAddingLaptop(false); }} className="p-2 text-slate-500 hover:text-white"><X size={32}/></button>
                </div>
                <form onSubmit={handleSaveLaptop} className="space-y-6">
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-slate-500">Asset Model</label>
                         <input required className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white outline-none focus:ring-2 focus:ring-luxe-accent-dark" value={laptopForm.model} onChange={e => setLaptopForm({...laptopForm, model: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-slate-500">Valuation ($)</label>
                         <input type="number" required className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white" value={laptopForm.price} onChange={e => setLaptopForm({...laptopForm, price: parseInt(e.target.value)})} />
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-slate-500">Quantity</label>
                         <input type="number" required className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white" value={laptopForm.stock} onChange={e => setLaptopForm({...laptopForm, stock: parseInt(e.target.value)})} />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-slate-500">Category</label>
                         <select className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-white" value={laptopForm.category} onChange={e => setLaptopForm({...laptopForm, category: e.target.value})}>
                            {CATEGORIES.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                         </select>
                      </div>
                   </div>
                   <button type="submit" className="w-full bg-luxe-accent-dark text-white py-6 rounded-2xl font-black text-xl shadow-2xl transition-all active:scale-95">Commit Transaction</button>
                </form>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon }: any) => (
  <div className="bg-luxe-card-dark p-8 rounded-[2.5rem] border border-white/5 group hover:-translate-y-1 transition-all">
    <div className="flex justify-between items-center mb-4">
      <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{label}</span>
      <div className="text-luxe-accent-dark">{icon}</div>
    </div>
    <div className="text-4xl font-black text-white">{value}</div>
  </div>
);
