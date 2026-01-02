
import React, { useState, useEffect, useRef } from 'react';
import { Shield, Lock, Mail, Key, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import * as THREE from 'three';

interface AdminLoginPageProps {
    onAdminLogin: (email: string, password: string) => void;
    onPageChange: (page: string) => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onAdminLogin, onPageChange }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showCredentials, setShowCredentials] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Three.js Background Animation
    useEffect(() => {
        if (!canvasRef.current) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true, antialias: true });

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        camera.position.z = 5;

        // Create particles
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 1000;
        const posArray = new Float32Array(particlesCount * 3);

        for (let i = 0; i < particlesCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 10;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.015,
            color: 0x0071e3,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
        });

        const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particlesMesh);

        // Create glowing sphere
        const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
        const sphereMaterial = new THREE.MeshBasicMaterial({
            color: 0x0071e3,
            transparent: true,
            opacity: 0.1,
            wireframe: true,
        });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        scene.add(sphere);

        // Animation
        let mouseX = 0;
        let mouseY = 0;

        const handleMouseMove = (event: MouseEvent) => {
            mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        };

        window.addEventListener('mousemove', handleMouseMove);

        const animate = () => {
            requestAnimationFrame(animate);

            particlesMesh.rotation.y += 0.001;
            particlesMesh.rotation.x += 0.0005;

            sphere.rotation.y += 0.002;
            sphere.rotation.x += 0.001;

            camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05;
            camera.position.y += (mouseY * 0.5 - camera.position.y) * 0.05;
            camera.lookAt(scene.position);

            renderer.render(scene, camera);
        };

        animate();

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
            renderer.dispose();
        };
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate admin credentials
        if (email === 'admin@luxelaptops.com' && password === 'LuxeAdmin2025!') {
            onAdminLogin(email, password);
        } else {
            setError('Invalid administrator credentials. Access denied.');
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
            {/* Three.js Canvas Background */}
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950/90 pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
                <div className="w-full max-w-md">
                    {/* Security Badge */}
                    <div className="text-center mb-8 animate-in fade-in slide-in-from-top duration-700">
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-gradient-to-br from-blue-500 to-blue-700 shadow-2xl shadow-blue-500/50 mb-6 animate-pulse">
                            <Shield size={48} className="text-white" />
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tighter mb-2">
                            ADMIN ACCESS
                        </h1>
                        <p className="text-sm font-black text-blue-400 uppercase tracking-[0.3em]">
                            Restricted Area • Level 5 Clearance
                        </p>
                    </div>

                    {/* Login Form */}
                    <div className="glass p-10 rounded-[3rem] bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-700 delay-200">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email Input */}
                            <div className="space-y-2">
                                <label className="flex items-center space-x-2 text-xs font-black text-blue-400 uppercase tracking-wider">
                                    <Mail size={14} />
                                    <span>Administrator Email</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="admin@luxelaptops.com"
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="space-y-2">
                                <label className="flex items-center space-x-2 text-xs font-black text-blue-400 uppercase tracking-wider">
                                    <Lock size={14} />
                                    <span>Security Passphrase</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter admin password"
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="flex items-center space-x-3 bg-red-500/10 border border-red-500/30 rounded-2xl px-5 py-3 animate-in fade-in slide-in-from-top duration-300">
                                    <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
                                    <p className="text-sm text-red-400 font-bold">{error}</p>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white py-5 rounded-2xl font-black text-lg shadow-2xl shadow-blue-500/30 transition-all active:scale-95 flex items-center justify-center space-x-3 group"
                            >
                                <Key size={20} className="group-hover:rotate-12 transition-transform" />
                                <span>AUTHENTICATE</span>
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </form>

                        {/* Demo Credentials Toggle */}
                        <div className="mt-8 pt-6 border-t border-white/10">
                            <button
                                onClick={() => setShowCredentials(!showCredentials)}
                                className="w-full text-sm text-slate-400 hover:text-blue-400 transition-colors font-bold flex items-center justify-center space-x-2"
                            >
                                <Key size={14} />
                                <span>{showCredentials ? 'Hide' : 'Show'} Demo Credentials</span>
                            </button>

                            {showCredentials && (
                                <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top duration-300">
                                    <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5">
                                        <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Email</p>
                                        <p className="text-sm text-blue-400 font-mono font-bold">admin@luxelaptops.com</p>
                                    </div>
                                    <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5">
                                        <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Password</p>
                                        <p className="text-sm text-blue-400 font-mono font-bold">LuxeAdmin2025!</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Back to User Login */}
                    <div className="text-center mt-8">
                        <button
                            onClick={() => onPageChange('login')}
                            className="text-sm text-slate-400 hover:text-white transition-colors font-bold"
                        >
                            ← Back to User Login
                        </button>
                    </div>

                    {/* Security Notice */}
                    <div className="mt-8 flex items-start space-x-3 bg-blue-500/5 border border-blue-500/20 rounded-2xl p-5">
                        <CheckCircle size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs font-black text-blue-400 uppercase tracking-wider mb-1">Secure Connection</p>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                This admin portal uses end-to-end encryption and multi-factor authentication protocols.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
