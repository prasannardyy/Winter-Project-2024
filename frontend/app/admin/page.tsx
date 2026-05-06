'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, FileText, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
    const [docs, setDocs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchDocs = async () => {
        const token = localStorage.getItem('token');
        if (!token) return router.push('/login');

        try {
            const res = await fetch('http://localhost:5000/api/documents/pending', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setDocs(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocs();
    }, [router]);

    const handleAction = async (id: number, status: string) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:5000/api/documents/${id}/verify`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status, comments: `Manual ${status} by Admin` })
            });

            if (res.ok) {
                // Refresh list
                fetchDocs();
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <Link href="/dashboard" className="p-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-50">
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </Link>
                        <h1 className="text-2xl font-bold text-slate-800">Admin Verification Console</h1>
                    </div>
                    <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-mono text-sm">
                        Role: ADMIN
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center p-12"><Loader2 className="animate-spin w-8 h-8 text-blue-500" /></div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4 text-sm font-semibold text-slate-600">ID</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-slate-600">User</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-slate-600">Document</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-slate-600">AI Confidence</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
                                        <th className="px-6 py-4 text-sm font-semibold text-slate-600 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {docs.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                                No pending documents found.
                                            </td>
                                        </tr>
                                    ) : docs.map((doc) => (
                                        <tr key={doc.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 text-sm text-slate-500">#{doc.id}</td>
                                            <td className="px-6 py-4 text-sm font-medium text-slate-800">
                                                {doc.User ? doc.User.email : `User ${doc.userId}`}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2">
                                                    <FileText className="w-4 h-4 text-slate-400" />
                                                    <span className="text-sm text-slate-700">{doc.type}</span>
                                                    <a href={`http://localhost:5000/${doc.filePath}`} target="_blank" className="text-xs text-blue-600 hover:underline">(View)</a>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full ${doc.aiConfidence > 0.8 ? 'bg-green-500' : 'bg-orange-500'}`}
                                                            style={{ width: `${doc.aiConfidence * 100}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs font-mono text-slate-600">{(doc.aiConfidence * 100).toFixed(0)}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-700 rounded-full">
                                                    {doc.verificationStatus}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <button
                                                    onClick={() => handleAction(doc.id, 'VERIFIED')}
                                                    className="px-3 py-1.5 bg-green-50 text-green-600 text-xs font-bold rounded hover:bg-green-100 transition-colors"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleAction(doc.id, 'REJECTED')}
                                                    className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded hover:bg-red-100 transition-colors"
                                                >
                                                    Reject
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
