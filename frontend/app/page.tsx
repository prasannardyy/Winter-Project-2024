import Link from 'next/link';
import { ShieldCheck, UploadCloud, UserCheck, Lock } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-slate-800">SecureKYC Bank</span>
          </div>
          <div className="space-x-4">
            <Link href="/login" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              Login
            </Link>
            <Link href="/register" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg">
              Open Account
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="max-w-4xl w-full grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">
              Identity Verification <br />
              <span className="text-blue-600">Reimagined.</span>
            </h1>
            <p className="text-lg text-slate-600">
              Complete your KYC in seconds with our AI-powered verification system. Secure, fast, and fully compliant.
            </p>
            <div className="flex space-x-4">
              <Link href="/register" className="flex items-center justify-center px-8 py-3 text-base font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/30">
                Start Verification
              </Link>
              <Link href="/login" className="flex items-center justify-center px-8 py-3 text-base font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-all">
                Existing User
              </Link>
            </div>

            <div className="pt-8 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="mx-auto w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mb-2">
                  <UploadCloud className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-xs font-semibold text-slate-700">Easy Upload</p>
              </div>
              <div>
                <div className="mx-auto w-10 h-10 bg-green-50 rounded-full flex items-center justify-center mb-2">
                  <UserCheck className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-xs font-semibold text-slate-700">AI Verified</p>
              </div>
              <div>
                <div className="mx-auto w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center mb-2">
                  <Lock className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-xs font-semibold text-slate-700">Bank Grade</p>
              </div>
            </div>
          </div>

          {/* Visual/Image Placeholder */}
          <div className="relative h-[400px] bg-slate-200 rounded-2xl overflow-hidden shadow-2xl border border-slate-300 flex items-center justify-center">
            {/* Abstract UI Representation */}
            <div className="absolute inset-x-12 top-12 bottom-0 bg-white rounded-t-xl shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.1)] p-6 space-y-4">
              <div className="h-4 w-1/3 bg-slate-100 rounded"></div>
              <div className="h-8 w-2/3 bg-slate-100 rounded"></div>
              <div className="h-40 bg-blue-50/50 rounded-xl border-2 border-dashed border-blue-200 flex items-center justify-center">
                <span className="text-blue-400 text-sm">Document Preview</span>
              </div>
              <div className="h-10 w-full bg-blue-600 rounded-lg opacity-90"></div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          &copy; 2025 SecureKYC Bank. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
