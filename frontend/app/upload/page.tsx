'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, FileText, ArrowLeft, Loader2, CheckCircle, XCircle, ShieldCheck, AlertCircle, ScanLine, Smartphone, CreditCard } from 'lucide-react';
import Link from 'next/link';

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [docType, setDocType] = useState('ID_PROOF');
    const [uploading, setUploading] = useState(false);
    const [polling, setPolling] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [message, setMessage] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const router = useRouter();

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setUploading(true);
        setMessage('');
        setResult(null);

        const formData = new FormData();
        formData.append('document', file);
        formData.append('docType', docType);

        const token = localStorage.getItem('token');

        try {
            const res = await fetch('http://localhost:5000/api/documents/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });

            const data = await res.json();

            if (res.ok) {
                setMessage('Scanning document...');
                setPolling(true);
                pollResult(data.documentId);
            } else {
                setMessage('Upload failed: ' + data.error);
                setUploading(false);
            }
        } catch (err) {
            setMessage('Server error.');
            setUploading(false);
        }
    };

    const pollResult = async (id: number) => {
        const token = localStorage.getItem('token');
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/documents/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const doc = await res.json();
                // Stop polling if we have aiConfidence (meaning OCR finished)
                if (doc.aiConfidence > 0 || doc.extractionStatus === 'FAILED') {
                    clearInterval(interval);
                    setResult(doc);
                    setPolling(false);
                    setUploading(false);
                }
            } catch (e) {
                console.error(e);
            }
        }, 2000); // Check every 2s
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 -z-10 rounded-b-[3rem] shadow-2xl" />
            <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute top-20 left-20 w-48 h-48 bg-white/5 rounded-full blur-3xl" />

            <div className="max-w-3xl mx-auto px-6 py-10 relative">
                <Link href="/dashboard" className="inline-flex items-center text-blue-100 hover:text-white mb-8 transition-colors group">
                    <div className="bg-white/10 p-2 rounded-full mr-3 group-hover:bg-white/20 transition-all backdrop-blur-sm shadow-sm ring-1 ring-white/10">
                        <ArrowLeft className="w-4 h-4" />
                    </div>
                    <span className="font-medium tracking-wide">Back to Dashboard</span>
                </Link>

                <div className="bg-white rounded-3xl shadow-2xl shadow-blue-900/10 border border-slate-100 overflow-hidden backdrop-blur-xl">
                    {/* Header */}
                    <div className="bg-slate-50/50 p-8 border-b border-slate-100 flex flex-col items-center text-center relative">
                        <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4 transform group-hover:rotate-12 transition-transform duration-500">
                            <ScanLine className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
                            {result ? "Verification Report" : "Document Scanner"}
                        </h2>
                        <p className="text-slate-500 mt-2 max-w-md text-base leading-relaxed">
                            {result ? "AI analysis complete. Review the extracted details below." : "Upload a clear photo of your ID using our secure AI scanner."}
                        </p>
                    </div>

                    <div className="p-8 sm:p-10">
                        {message && (
                            <div className={`mb-8 p-4 rounded-2xl flex items-center justify-center text-sm font-medium animate-in fade-in slide-in-from-top-4 ${message.includes('failed') ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
                                {uploading && <Loader2 className="animate-spin w-5 h-5 mr-3" />}
                                {message}
                            </div>
                        )}

                        {!result ? (
                            <form onSubmit={handleUpload} className="space-y-8">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2.5 ml-1">Select Document Type</label>
                                    <div className="relative group">
                                        <select
                                            value={docType}
                                            onChange={(e) => setDocType(e.target.value)}
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none font-medium cursor-pointer hover:border-blue-300"
                                        >
                                            <option value="ID_PROOF">Government ID Proof (Aadhaar / PAN / Voter)</option>
                                            <option value="ADDRESS_PROOF">Address Proof</option>
                                            <option value="PHOTO">Recent Photograph</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity">
                                            <CreditCard className="w-5 h-5 text-blue-500" />
                                        </div>
                                    </div>
                                </div>

                                <div
                                    className={`relative border-3 border-dashed rounded-3xl p-12 transition-all duration-300 ease-in-out cursor-pointer flex flex-col items-center justify-center text-center group
                                        ${dragActive ? 'border-blue-500 bg-blue-50/50 scale-[1.01] shadow-xl' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50/50'}`}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                >
                                    <div className={`w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-100 ring-8 ring-blue-50/50 ${file ? 'bg-green-50 ring-green-50/50' : ''}`}>
                                        {file ? <CheckCircle className="w-10 h-10 text-green-500" /> : <UploadCloud className="w-10 h-10 text-blue-500" />}
                                    </div>

                                    <input
                                        type="file"
                                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        accept="image/*"
                                    />

                                    <h3 className="text-xl font-bold text-slate-800 mb-2">
                                        {file ? file.name : "Tap to Upload or Drag & Drop"}
                                    </h3>
                                    <p className="text-sm text-slate-500 max-w-xs mx-auto">
                                        {file ? "File selected. Tap Verify to proceed." : "Supports high-quality JPG, PNG. Max file size 5MB."}
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={uploading || !file}
                                    className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg rounded-2xl hover:translate-y-[-2px] hover:shadow-lg hover:shadow-blue-500/30 active:translate-y-[0px] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none shadow-blue-500/20"
                                >
                                    {uploading ? (
                                        <span className="flex items-center justify-center">
                                            <Loader2 className="animate-spin w-5 h-5 mr-2" />
                                            Analyzing Document...
                                        </span>
                                    ) : (
                                        "Verify Document Now"
                                    )}
                                </button>
                            </form>
                        ) : (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                                {/* Result Badge */}
                                <div className={`p-6 rounded-2xl border flex items-start gap-5 shadow-sm ${result.verificationStatus === 'VERIFIED' ? 'bg-green-50/50 border-green-200' : 'bg-orange-50/50 border-orange-200'}`}>
                                    <div className={`p-3 rounded-xl shrink-0 shadow-sm ${result.verificationStatus === 'VERIFIED' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                        {result.verificationStatus === 'VERIFIED' ? <ShieldCheck className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
                                    </div>
                                    <div>
                                        <h3 className={`text-xl font-bold ${result.verificationStatus === 'VERIFIED' ? 'text-green-800' : 'text-orange-800'}`}>
                                            {result.verificationStatus === 'VERIFIED' ? 'Verification Successful' : 'Action Required'}
                                        </h3>
                                        <p className="text-slate-600 mt-1 leading-relaxed text-sm">
                                            {result.verificationStatus === 'VERIFIED'
                                                ? "Identity verified successfully. Your document matches our records."
                                                : "We couldn't fully verify this document automatically. It has been flagged for manual review."}
                                        </p>
                                    </div>
                                </div>

                                {result.extractedData && (
                                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                        <div className="bg-slate-50/80 backdrop-blur-sm px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                                            <h4 className="font-bold text-slate-800 flex items-center text-sm uppercase tracking-wider">
                                                <FileText className="w-4 h-4 mr-2 text-blue-600" />
                                                Extracted Data
                                            </h4>
                                            <span className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                                                {result.extractedData.ai_confidence} Match
                                            </span>
                                        </div>

                                        <div className="divide-y divide-slate-100">
                                            {[
                                                { label: "Document Type", value: result.extractedData.document_type },
                                                { label: "ID Number", value: result.extractedData.id_number, mono: true },
                                                { label: "Date of Birth", value: result.extractedData.dob },
                                                { label: "Name Detected", value: result.extractedData.name_guess }
                                            ].map((item, idx) => (
                                                <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 px-6 py-4 hover:bg-slate-50/50 transition-colors gap-1 sm:gap-4">
                                                    <span className="text-sm font-medium text-slate-500">{item.label}</span>
                                                    <span className={`col-span-1 sm:col-span-2 text-sm font-semibold text-slate-800 ${item.mono ? 'font-mono bg-slate-100 px-2 py-0.5 rounded w-fit border border-slate-200' : ''}`}>
                                                        {item.value}
                                                    </span>
                                                </div>
                                            ))}

                                            {/* Raw Text Accordion-style */}
                                            <div className="bg-slate-50/50 px-6 py-5 border-t border-slate-100">
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">AI Raw Output</p>
                                                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-inner">
                                                    <p className="text-xs text-slate-600 font-mono whitespace-pre-wrap leading-relaxed opacity-80">
                                                        {result.extractedData.raw_text || "No readable text found."}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                                    <button
                                        onClick={() => { setFile(null); setResult(null); }}
                                        className="py-4 border-2 border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 hover:border-slate-300 transition-all text-sm uppercase tracking-wide"
                                    >
                                        Scan Another
                                    </button>
                                    <Link
                                        href="/dashboard"
                                        className="py-4 bg-blue-600 text-white text-center font-bold rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/20 transition-all flex items-center justify-center text-sm uppercase tracking-wide"
                                    >
                                        Go to Dashboard <span className="ml-2">→</span>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer simple tag */}
                <div className="text-center mt-8 text-slate-400 text-sm font-medium">
                    Secured by <span className="text-white/80">Antigravity AI</span>
                </div>
            </div>
        </div>
    );
}
