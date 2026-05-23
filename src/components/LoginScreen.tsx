import React from 'react';
import { ArrowRight, AlertCircle, User } from 'lucide-react';

interface LoginScreenProps {
  loginError: string;
  handleLogin: (e: React.FormEvent) => void;
  loginData: { username: string; password: string };
  setLoginData: React.Dispatch<React.SetStateAction<{ username: string; password: string }>>;
  triggerQuickLogin: (uname: string) => void;
}

export default function LoginScreen({
  loginError,
  handleLogin,
  loginData,
  setLoginData,
  triggerQuickLogin
}: LoginScreenProps) {
  return (
    <div className="flex flex-col min-h-screen justify-center items-center px-4 bg-slate-50 font-sans">

      <div className="w-full max-w-[420px] bg-white border border-slate-200/80 rounded-2xl p-8 shadow-sm">

        {/* Logo + Brand */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-13 h-13 w-[52px] h-[52px] bg-blue-50 rounded-xl mb-4 text-blue-800 font-medium text-xl">
            V
          </div>
          <h1 className="text-xl font-medium text-slate-800">
            <span className="text-blue-600">Visit Traker</span>
          </h1>
          <p className="text-[13px] text-slate-400 mt-1">
            {/* Schedule client field activities and log live visits */}
          </p>
        </div>

        {/* Error */}
        {loginError && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-[13px] p-3 rounded-lg flex gap-2 items-start">
            <AlertCircle className="shrink-0 text-red-400 mt-0.5" size={15} />
            <span>{loginError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              className="block text-[11px] font-medium text-slate-400 uppercase tracking-widest mb-1.5"
              htmlFor="username"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder=""
              className="w-full h-10 px-3 rounded-lg border border-slate-200 outline-none focus:border-blue-400 focus:ring-3 focus:ring-blue-500/10 transition-all text-[14px] text-slate-800 bg-slate-50 placeholder:text-slate-300"
              value={loginData.username}
              onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
            />
          </div>

          <div>
            <label
              className="block text-[11px] font-medium text-slate-400 uppercase tracking-widest mb-1.5"
              htmlFor="password"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              className="w-full h-10 px-3 rounded-lg border border-slate-200 outline-none focus:border-blue-400 focus:ring-3 focus:ring-blue-500/10 transition-all text-[14px] text-slate-800 bg-slate-50 placeholder:text-slate-300"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
            />
          </div>

          <button
            id="login_submit_btn"
            type="submit"
            className="w-full h-[42px] bg-blue-600 text-blue-50 rounded-lg font-medium text-[14px] hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            Let's Start <ArrowRight size={15} />
          </button>
        </form>

        {/* Quick sign-in demo section hidden as requested
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-slate-100" />
          <span className="text-[11px] font-medium text-slate-300 uppercase tracking-widest whitespace-nowrap">
            Quick sign-in (demo)
          </span>
          <div className="flex-1 h-px bg-slate-100" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => triggerQuickLogin('admin')}
            className="flex items-center gap-2 px-3 py-2 text-[13px] border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 bg-slate-50/60 rounded-lg transition-all cursor-pointer"
          >
            <User size={14} className="text-blue-500" /> Administrative
          </button>
          <button
            type="button"
            onClick={() => triggerQuickLogin('hitesh')}
            className="flex items-center gap-2 px-3 py-2 text-[13px] border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 bg-slate-50/60 rounded-lg transition-all cursor-pointer"
          >
            <User size={14} className="text-emerald-500" /> Hitesh (Sales)
          </button>
          <button
            type="button"
            onClick={() => triggerQuickLogin('amit')}
            className="flex items-center gap-2 px-3 py-2 text-[13px] border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 bg-slate-50/60 rounded-lg transition-all cursor-pointer"
          >
            <User size={14} className="text-purple-500" /> Amit Kumar
          </button>
          <button
            type="button"
            onClick={() => triggerQuickLogin('pooja')}
            className="flex items-center gap-2 px-3 py-2 text-[13px] border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 bg-slate-50/60 rounded-lg transition-all cursor-pointer"
          >
            <User size={14} className="text-amber-500" /> Pooja
          </button>
        </div>
        */}
      </div>

      {/* Footer */}
      <div className="text-center mt-5 text-[11px] text-slate-300 font-medium">
        Visit Traker Application &nbsp;•&nbsp;
      </div>
    </div>
  );
}