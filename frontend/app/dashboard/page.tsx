'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, CheckCircle, AlertCircle, FileText, LogOut, Shield, Clock, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
    const [user, setUser] = useState<any>(null);
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (!userData || !token) {
            router.push('/login');
        } else {
            setUser(JSON.parse(userData));
            fetchDocuments(token);
        }
    }, [router]);

    const fetchDocuments = async (token: string) => {
        try {
            const res = await fetch('http://localhost:5000/api/documents/my-documents', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setDocuments(data);
            }
        } catch (err) {
            console.error('Failed to fetch docs', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    // Determine overall status based on latest doc
    // If ANY doc is VERIFIED, we are good. If one is PENDING, we are pending.
    const verifiedDoc = documents.find(d => d.verificationStatus === 'VERIFIED');
    const pendingDoc = documents.find(d => d.verificationStatus === 'PENDING');
    const rejectedDoc = documents.find(d => d.verificationStatus === 'REJECTED');

    let status = 'NOT_SUBMITTED';
    if (verifiedDoc) status = 'VERIFIED';
    else if (pendingDoc) status = 'PENDING_VERIFICATION';
    else if (rejectedDoc) status = 'REJECTED';
    else if (documents.length > 0) status = 'PENDING'; // Fallback

    const getStatusColor = (s: string) => {
        switch (s) {
            case 'VERIFIED': return 'bg-green-100 text-green-800 border-green-200';
            case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
            case 'PENDING_VERIFICATION': return 'bg-orange-100 text-orange-800 border-orange-200';
            default: return 'bg-slate-100 text-slate-800 border-slate-200';
        }
    };

    const getStatusIcon = (s: string) => {
        switch (s) {
            case 'VERIFIED': return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'REJECTED': return <XCircle className="w-5 h-5 text-red-600" />;
            case 'PENDING_VERIFICATION': return <Clock className="w-5 h-5 text-orange-600" />;
            default: return <AlertCircle className="w-5 h-5 text-slate-600" />;
        }
    };

    const getStatusLabel = (s: string) => {
        switch (s) {
            case 'VERIFIED': return 'Verified Customer';
            case 'REJECTED': return 'Verification Failed';
            case 'PENDING_VERIFICATION': return 'Verification Pending';
            default: return 'Pending Submission';
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Navbar */}
            <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <Shield className="w-8 h-8 text-blue-600" />
                        <span className="font-bold text-slate-800 text-xl tracking-tight">SecureKYC</span>
                    </div>
                    <div className="flex items-center space-x-6">
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-sm font-bold text-slate-800">{user?.fullName || 'User'}</span>
                            <span className="text-xs text-slate-500">{user?.email || 'No Email'}</span>
                        </div>
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                            {user?.fullName ? user.fullName.charAt(0) : 'U'}
                        </div>
                        <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-600 transition-colors" title="Logout">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Profile & Status Header */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    {/* User Profile Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex items-center space-x-4">
                        <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/30">
                            {user?.fullName ? user.fullName.charAt(0) : 'U'}
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-800">{user?.fullName || 'User'}</h2>
                            <p className="text-sm text-slate-500">{user?.email || 'No Email'}</p>
                            <span className="inline-block mt-2 px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-md border border-slate-200">
                                ID: {user.id}
                            </span>
                        </div>
                    </div>

                    {/* Verification Status Card */}
                    <div className="md:col-span-2 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl shadow-lg border border-slate-700 p-6 flex items-center justify-between text-white">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-200">Verification Status</h2>
                            <p className="text-slate-400 text-sm">Current Level: {status === 'VERIFIED' ? 'Tier 2 (Verified)' : 'Tier 1 (Pending)'}</p>
                        </div>
                        <div className={`flex items-center space-x-3 px-5 py-3 rounded-xl border ${status === 'VERIFIED' ? 'bg-green-500/20 border-green-500/50 text-green-300' : 'bg-orange-500/20 border-orange-500/50 text-orange-300'}`}>
                            {getStatusIcon(status)}
                            <span className="font-bold text-sm tracking-wide uppercase">
                                {getStatusLabel(status)}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Upload Section */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">Your Documents</h3>

                            {/* List of Uploaded Docs */}
                            {documents.length > 0 ? (
                                <div className="mb-8 space-y-3">
                                    {documents.map((doc: any) => (
                                        <div key={doc.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors">
                                            <div className="flex items-center space-x-4">
                                                <div className="p-2 bg-white rounded-lg border border-slate-200">
                                                    <FileText className="w-6 h-6 text-blue-500" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-800">{doc.type}</p>
                                                    <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
                                                        <Clock className="w-3 h-3" />
                                                        <span>{new Date(doc.createdAt).toLocaleDateString()} at {new Date(doc.createdAt).toLocaleTimeString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${doc.verificationStatus === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                                                    doc.verificationStatus === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                        'bg-orange-100 text-orange-700'
                                                    }`}>
                                                    {doc.verificationStatus}
                                                </span>
                                                {doc.aiConfidence > 0 && (
                                                    <p className="text-xs text-slate-400 mt-1">AI Score: {(doc.aiConfidence * 100).toFixed(0)}%</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="mb-8 text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                    <p className="text-slate-500 text-sm">No documents uploaded yet.</p>
                                </div>
                            )}

                            <h4 className="text-sm font-semibold text-slate-700 mb-3">Upload New Document</h4>
                            <div className="grid grid-cols-2 gap-4">
                                {/* ID Proof */}
                                <Link href="/upload" className="block border border-slate-200 rounded-xl p-4 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group bg-white">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <span className="font-medium text-slate-700">Govt ID Proof</span>
                                    </div>
                                    <p className="text-xs text-slate-500">Passport, Driving License</p>
                                </Link>

                                {/* Address Proof */}
                                <Link href="/upload" className="block border border-slate-200 rounded-xl p-4 hover:border-purple-500 hover:shadow-md transition-all cursor-pointer group bg-white">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <span className="font-medium text-slate-700">Address Proof</span>
                                    </div>
                                    <p className="text-xs text-slate-500">Utility Bill, Wifi Bill</p>
                                </Link>
                            </div>

                            <Link href="/upload" className="mt-4 w-full block p-4 bg-slate-50 border border-slate-300 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-100 transition-colors">
                                <UploadCloud className="w-10 h-10 text-slate-400 mb-2" />
                                <p className="text-sm font-medium text-slate-700">Or Drag & Drop files here</p>
                            </Link>

                        </div>
                    </div>

                    {/* Sidebar / Info */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg p-6 text-white">
                            <h3 className="font-semibold text-lg mb-2">Need Help?</h3>
                            <p className="text-blue-100 text-sm mb-4">
                                Our support team is available 24/7 to assist you.
                            </p>
                            <button className="w-full py-2 bg-white/10 border border-white/20 text-white font-semibold rounded-lg text-sm hover:bg-white/20 transition-colors backdrop-blur-sm">
                                Contact Support
                            </button>
                        </div>

                        {/* Recent Activity Log */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <h3 className="font-semibold text-slate-800 mb-3">Activity Log</h3>
                            <div className="space-y-4">
                                {documents.slice(0, 5).map((doc: any) => (
                                    <div key={doc.id} className="relative pl-6 border-l-2 border-slate-200 pb-0 last:border-0 last:pb-0">
                                        <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-white ${doc.verificationStatus === 'VERIFIED' ? 'bg-green-500' :
                                            doc.verificationStatus === 'REJECTED' ? 'bg-red-500' : 'bg-orange-400'
                                            }`}></div>
                                        <div>
                                            <p className="text-sm text-slate-800 font-medium">Uploaded {doc.type}</p>
                                            <p className="text-xs text-slate-500">{new Date(doc.createdAt).toLocaleTimeString()} - {doc.verificationStatus}</p>
                                        </div>
                                    </div>
                                ))}
                                {documents.length === 0 && (
                                    <div className="relative pl-6 border-l-2 border-slate-200">
                                        <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-green-500 ring-4 ring-white"></div>
                                        <div>
                                            <p className="text-sm text-slate-700">Account Created</p>
                                            <p className="text-xs text-slate-500">Today</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
