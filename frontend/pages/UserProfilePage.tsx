
import React, { useState, useEffect } from 'react';
import { User as UserIcon, Mail, Phone, MapPin, Calendar, Edit2, Save, X, Package, ShieldCheck, Crown } from 'lucide-react';
import { User, Order } from '../types';
import { api } from '../services/apiService';

interface UserProfilePageProps {
    user: User;
    onUserUpdate: (user: User) => void;
    onNotify: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const UserProfilePage: React.FC<UserProfilePageProps> = ({ user, onUserUpdate, onNotify }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedUser, setEditedUser] = useState<User>(user);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadOrders();
    }, [user.id]);

    const loadOrders = async () => {
        try {
            const userOrders = await api.getUserOrders(user.id);
            setOrders(userOrders);
        } catch (err) {
            console.error('Failed to load orders:', err);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const updated = await api.updateUserProfile(user.id, {
                name: editedUser.name,
                email: editedUser.email,
                phone: editedUser.phone,
                address: editedUser.address,
            });
            onUserUpdate(updated);
            setIsEditing(false);
            onNotify('Profile updated successfully', 'success');
        } catch (err: any) {
            onNotify(err.message || 'Failed to update profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setEditedUser(user);
        setIsEditing(false);
    };

    return (
        <div className="min-h-screen bg-luxe-light dark:bg-luxe-dark py-24 px-6">
            <div className="container mx-auto max-w-6xl">
                {/* Page Header */}
                <div className="mb-16">
                    <h1 className="text-7xl md:text-8xl font-black tracking-tighter uppercase text-luxe-text-brandLight dark:text-luxe-text-brandDark mb-4">
                        MY PROFILE
                    </h1>
                    <p className="text-xl text-slate-500 dark:text-luxe-text-bodyDark font-medium">
                        Manage your personal information and view your order history
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Profile Card */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Header Section */}
                        <div className="glass p-10 rounded-[3rem] bg-luxe-card-light dark:bg-luxe-card-dark border border-slate-200 dark:border-white/10 shadow-2xl">
                            <div className="flex items-start justify-between mb-8">
                                <div className="flex items-center space-x-6">
                                    {/* Avatar */}
                                    <div className="relative group">
                                        <div className="w-28 h-28 rounded-[2rem] bg-gradient-to-br from-luxe-accent-light to-luxe-accent-dark flex items-center justify-center text-white text-4xl font-black shadow-2xl">
                                            {user.avatar ? (
                                                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-[2rem] object-cover" />
                                            ) : (
                                                user.name.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        {isEditing && (
                                            <button className="absolute inset-0 bg-black/50 rounded-[2rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Edit2 size={24} className="text-white" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Name & Role */}
                                    <div>
                                        <h2 className="text-4xl font-black text-luxe-text-brandLight dark:text-luxe-text-brandDark tracking-tight">
                                            {user.name}
                                        </h2>
                                        <div className="flex items-center space-x-2 mt-2">
                                            {user.role === 'ADMIN' ? (
                                                <div className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-1.5 rounded-full">
                                                    <Crown size={14} className="text-white" />
                                                    <span className="text-xs font-black text-white uppercase tracking-wider">Administrator</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center space-x-2 bg-luxe-accent-light/10 dark:bg-luxe-accent-dark/10 px-4 py-1.5 rounded-full border border-luxe-accent-light/30 dark:border-luxe-accent-dark/30">
                                                    <ShieldCheck size={14} className="text-luxe-accent-light dark:text-luxe-accent-dark" />
                                                    <span className="text-xs font-black text-luxe-accent-light dark:text-luxe-accent-dark uppercase tracking-wider">Verified User</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Edit Button */}
                                {!isEditing ? (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center space-x-2 bg-luxe-accent-light dark:bg-luxe-accent-dark text-white px-6 py-3 rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg"
                                    >
                                        <Edit2 size={18} />
                                        <span>Edit Profile</span>
                                    </button>
                                ) : (
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={handleSave}
                                            disabled={loading}
                                            className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-green-700 transition-all shadow-lg disabled:opacity-50"
                                        >
                                            <Save size={18} />
                                            <span>{loading ? 'Saving...' : 'Save'}</span>
                                        </button>
                                        <button
                                            onClick={handleCancel}
                                            disabled={loading}
                                            className="flex items-center space-x-2 bg-slate-500 text-white px-6 py-3 rounded-2xl font-bold hover:bg-slate-600 transition-all shadow-lg disabled:opacity-50"
                                        >
                                            <X size={18} />
                                            <span>Cancel</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Profile Fields */}
                            <div className="space-y-6">
                                {/* Name */}
                                <div>
                                    <label className="flex items-center space-x-2 text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                        <UserIcon size={16} />
                                        <span>Full Name</span>
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={editedUser.name}
                                            onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                                            className="w-full bg-luxe-light dark:bg-luxe-dark border border-slate-300 dark:border-white/10 rounded-2xl px-6 py-4 text-luxe-text-brandLight dark:text-luxe-text-brandDark font-bold text-lg outline-none focus:ring-2 focus:ring-luxe-accent-light dark:focus:ring-luxe-accent-dark transition-all"
                                        />
                                    ) : (
                                        <p className="text-xl font-bold text-luxe-text-brandLight dark:text-luxe-text-brandDark">{user.name}</p>
                                    )}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="flex items-center space-x-2 text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                        <Mail size={16} />
                                        <span>Email Address</span>
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            value={editedUser.email}
                                            onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                                            className="w-full bg-luxe-light dark:bg-luxe-dark border border-slate-300 dark:border-white/10 rounded-2xl px-6 py-4 text-luxe-text-brandLight dark:text-luxe-text-brandDark font-bold text-lg outline-none focus:ring-2 focus:ring-luxe-accent-light dark:focus:ring-luxe-accent-dark transition-all"
                                        />
                                    ) : (
                                        <p className="text-xl font-bold text-luxe-text-brandLight dark:text-luxe-text-brandDark">{user.email}</p>
                                    )}
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="flex items-center space-x-2 text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                        <Phone size={16} />
                                        <span>Phone Number</span>
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            value={editedUser.phone || ''}
                                            onChange={(e) => setEditedUser({ ...editedUser, phone: e.target.value })}
                                            placeholder="Enter phone number"
                                            className="w-full bg-luxe-light dark:bg-luxe-dark border border-slate-300 dark:border-white/10 rounded-2xl px-6 py-4 text-luxe-text-brandLight dark:text-luxe-text-brandDark font-bold text-lg outline-none focus:ring-2 focus:ring-luxe-accent-light dark:focus:ring-luxe-accent-dark transition-all"
                                        />
                                    ) : (
                                        <p className="text-xl font-bold text-luxe-text-brandLight dark:text-luxe-text-brandDark">
                                            {user.phone || <span className="text-slate-400 italic">Not provided</span>}
                                        </p>
                                    )}
                                </div>

                                {/* Address */}
                                <div>
                                    <label className="flex items-center space-x-2 text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                        <MapPin size={16} />
                                        <span>Shipping Address</span>
                                    </label>
                                    {isEditing ? (
                                        <textarea
                                            value={editedUser.address || ''}
                                            onChange={(e) => setEditedUser({ ...editedUser, address: e.target.value })}
                                            placeholder="Enter your shipping address"
                                            rows={3}
                                            className="w-full bg-luxe-light dark:bg-luxe-dark border border-slate-300 dark:border-white/10 rounded-2xl px-6 py-4 text-luxe-text-brandLight dark:text-luxe-text-brandDark font-bold text-lg outline-none focus:ring-2 focus:ring-luxe-accent-light dark:focus:ring-luxe-accent-dark transition-all resize-none"
                                        />
                                    ) : (
                                        <p className="text-xl font-bold text-luxe-text-brandLight dark:text-luxe-text-brandDark whitespace-pre-line">
                                            {user.address || <span className="text-slate-400 italic">Not provided</span>}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Order History */}
                        <div className="glass p-10 rounded-[3rem] bg-luxe-card-light dark:bg-luxe-card-dark border border-slate-200 dark:border-white/10 shadow-2xl">
                            <div className="flex items-center space-x-3 mb-8">
                                <Package size={28} className="text-luxe-accent-light dark:text-luxe-accent-dark" />
                                <h3 className="text-3xl font-black text-luxe-text-brandLight dark:text-luxe-text-brandDark tracking-tight">
                                    Order History
                                </h3>
                            </div>

                            {orders.length === 0 ? (
                                <div className="text-center py-12">
                                    <Package size={64} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                                    <p className="text-xl text-slate-500 dark:text-slate-400 font-bold">No orders yet</p>
                                    <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">Start shopping to see your orders here</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {orders.map((order) => (
                                        <div
                                            key={order.id}
                                            className="bg-luxe-light dark:bg-luxe-dark p-6 rounded-2xl border border-slate-200 dark:border-white/5 hover:border-luxe-accent-light dark:hover:border-luxe-accent-dark transition-all"
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <p className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                        Order #{order.id}
                                                    </p>
                                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                        })}
                                                    </p>
                                                </div>
                                                <span
                                                    className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${order.status === 'Completed'
                                                            ? 'bg-green-500/10 text-green-600 border border-green-500/30'
                                                            : order.status === 'Processing'
                                                                ? 'bg-blue-500/10 text-blue-600 border border-blue-500/30'
                                                                : order.status === 'Cancelled'
                                                                    ? 'bg-red-500/10 text-red-600 border border-red-500/30'
                                                                    : 'bg-amber-500/10 text-amber-600 border border-amber-500/30'
                                                        }`}
                                                >
                                                    {order.status}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                                    {order.items.length} item{order.items.length > 1 ? 's' : ''}
                                                </p>
                                                <p className="text-2xl font-black text-luxe-accent-light dark:text-luxe-accent-dark">
                                                    ${order.total.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stats Sidebar */}
                    <div className="space-y-6">
                        {/* Account Info */}
                        <div className="glass p-8 rounded-[2.5rem] bg-luxe-card-light dark:bg-luxe-card-dark border border-slate-200 dark:border-white/10 shadow-xl">
                            <div className="flex items-center space-x-2 mb-6">
                                <Calendar size={20} className="text-luxe-accent-light dark:text-luxe-accent-dark" />
                                <h4 className="text-lg font-black text-luxe-text-brandLight dark:text-luxe-text-brandDark uppercase tracking-wider">
                                    Account Info
                                </h4>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                                        Member Since
                                    </p>
                                    <p className="text-lg font-bold text-luxe-text-brandLight dark:text-luxe-text-brandDark">
                                        {user.joinedDate
                                            ? new Date(user.joinedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
                                            : 'Recently'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                                        Account Status
                                    </p>
                                    <p className="text-lg font-bold text-green-600">Active</p>
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="glass p-8 rounded-[2.5rem] bg-luxe-card-light dark:bg-luxe-card-dark border border-slate-200 dark:border-white/10 shadow-xl">
                            <h4 className="text-lg font-black text-luxe-text-brandLight dark:text-luxe-text-brandDark uppercase tracking-wider mb-6">
                                Your Stats
                            </h4>
                            <div className="space-y-6">
                                <div>
                                    <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                        Total Orders
                                    </p>
                                    <p className="text-4xl font-black text-luxe-accent-light dark:text-luxe-accent-dark">
                                        {orders.length}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                        Total Spent
                                    </p>
                                    <p className="text-4xl font-black text-luxe-accent-light dark:text-luxe-accent-dark">
                                        ${orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
