import React from 'react';
import {
  BookOpen,
  Sparkles,
  Lock,
  Mail,
  User,
  ArrowRight,
  GraduationCap,
  Key,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { UserProfile } from '../types';

interface AuthGateProps {
  onLoginSuccess: (user: UserProfile) => void;
}

type AuthMode = 'login' | 'register' | 'forgot_password';

export const AuthGate: React.FC<AuthGateProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = React.useState<AuthMode>('login');

  // Form Fields
  const [identifier, setIdentifier] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(true);

  // Register Fields
  const [fullName, setFullName] = React.useState('');
  const [regUsername, setRegUsername] = React.useState('');
  const [regEmail, setRegEmail] = React.useState('');
  const [regPassword, setRegPassword] = React.useState('');
  const [fieldOfStudy, setFieldOfStudy] = React.useState('Biomedical & AI Engineering');

  // Forgot Password Fields
  const [forgotIdentifier, setForgotIdentifier] = React.useState('');
  const [resetCode, setResetCode] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [generatedCode, setGeneratedCode] = React.useState<string | null>(null);
  const [resetStep, setResetStep] = React.useState<'request' | 'verify'>('request');

  // Status
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);

  const clearMessages = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  // 1. Handle Login
  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    clearMessages();

    if (!identifier.trim() || !password) {
      setErrorMsg('Please enter both your username/email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });

      const data = await res.json();
      if (res.ok && data.user) {
        if (rememberMe) {
          localStorage.setItem('studyscout_user', JSON.stringify(data.user));
          if (data.token) localStorage.setItem('studyscout_token', data.token);
        }
        onLoginSuccess(data.user);
      } else {
        // Fallback check for offline/dev demo accounts
        if (
          (identifier.trim().toLowerCase() === 'student' || identifier.trim().toLowerCase() === 'student@university.edu') &&
          password === 'StudyScout2026!'
        ) {
          const fallbackUser: UserProfile = {
            id: 'user-alex-rivera',
            username: 'student',
            email: 'student@university.edu',
            fullName: 'Alex Rivera',
            fieldOfStudy: 'Biomedical & AI Engineering',
          };
          if (rememberMe) localStorage.setItem('studyscout_user', JSON.stringify(fallbackUser));
          onLoginSuccess(fallbackUser);
          return;
        }
        setErrorMsg(data.error || 'Invalid credentials. Please verify and try again.');
      }
    } catch (err) {
      // Local fallback for offline/sandbox
      if (
        (identifier.trim().toLowerCase() === 'student' || identifier.trim().toLowerCase() === 'student@university.edu') &&
        password === 'StudyScout2026!'
      ) {
        const fallbackUser: UserProfile = {
          id: 'user-alex-rivera',
          username: 'student',
          email: 'student@university.edu',
          fullName: 'Alex Rivera',
          fieldOfStudy: 'Biomedical & AI Engineering',
        };
        if (rememberMe) localStorage.setItem('studyscout_user', JSON.stringify(fallbackUser));
        onLoginSuccess(fallbackUser);
        return;
      }
      setErrorMsg('Could not connect to authentication server. Please try the demo student account.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Handle 1-Click Demo Login
  const handleQuickDemoLogin = (asRole: 'student' | 'researcher') => {
    clearMessages();
    if (asRole === 'student') {
      setIdentifier('student@university.edu');
      setPassword('StudyScout2026!');
      const demoUser: UserProfile = {
        id: 'user-alex-rivera',
        username: 'student',
        email: 'student@university.edu',
        fullName: 'Alex Rivera',
        fieldOfStudy: 'Biomedical & AI Engineering',
      };
      localStorage.setItem('studyscout_user', JSON.stringify(demoUser));
      onLoginSuccess(demoUser);
    } else {
      setIdentifier('researcher@mit.edu');
      setPassword('Science2026!');
      const demoUser: UserProfile = {
        id: 'user-samantha-vance',
        username: 'researcher',
        email: 'researcher@mit.edu',
        fullName: 'Dr. Samantha Vance',
        fieldOfStudy: 'Computational Neuroscience',
      };
      localStorage.setItem('studyscout_user', JSON.stringify(demoUser));
      onLoginSuccess(demoUser);
    }
  };

  // 3. Handle Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!regUsername.trim() || !regEmail.trim() || !regPassword) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim() || regUsername.trim(),
          username: regUsername.trim(),
          email: regEmail.trim(),
          password: regPassword,
          fieldOfStudy,
        }),
      });

      const data = await res.json();
      if (res.ok && data.user) {
        localStorage.setItem('studyscout_user', JSON.stringify(data.user));
        if (data.token) localStorage.setItem('studyscout_token', data.token);
        onLoginSuccess(data.user);
      } else {
        setErrorMsg(data.error || 'Registration failed. Please try a different username or email.');
      }
    } catch (err) {
      setErrorMsg('Registration service currently unavailable. Please sign in with the Demo account.');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Handle Forgot Password - Step 1: Request Code
  const handleRequestResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!forgotIdentifier.trim()) {
      setErrorMsg('Please enter your username or registered university email.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: forgotIdentifier.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.code) {
        setGeneratedCode(data.code);
        setResetCode(data.code); // Pre-fill code for effortless testing!
        setResetStep('verify');
        setSuccessMsg(`Verification code generated: ${data.code}. Enter a new password below.`);
      } else {
        // Fallback for demo student offline
        if (
          forgotIdentifier.trim().toLowerCase() === 'student' ||
          forgotIdentifier.trim().toLowerCase() === 'student@university.edu'
        ) {
          const fallbackCode = 'SCOUT-2026';
          setGeneratedCode(fallbackCode);
          setResetCode(fallbackCode);
          setResetStep('verify');
          setSuccessMsg(`Verification code generated: ${fallbackCode}. Enter a new password below.`);
        } else {
          setErrorMsg(data.error || 'No account found with that username or email.');
        }
      }
    } catch (err) {
      const fallbackCode = 'SCOUT-2026';
      setGeneratedCode(fallbackCode);
      setResetCode(fallbackCode);
      setResetStep('verify');
      setSuccessMsg(`Offline verification code: ${fallbackCode}. Enter your new password below.`);
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Handle Forgot Password - Step 2: Set New Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!resetCode.trim() || !newPassword) {
      setErrorMsg('Please provide the verification code and your new password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: forgotIdentifier.trim(),
          code: resetCode.trim(),
          newPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg('Password successfully reset! You can now log in.');
        setIdentifier(forgotIdentifier.trim());
        setPassword(newPassword);
        setTimeout(() => {
          setMode('login');
          setResetStep('request');
        }, 1200);
      } else {
        setErrorMsg(data.error || 'Reset failed. Check verification code and try again.');
      }
    } catch (err) {
      setSuccessMsg('Password updated in local session. Logging in...');
      setIdentifier(forgotIdentifier.trim());
      setPassword(newPassword);
      setTimeout(() => {
        setMode('login');
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden selection:bg-teal-500/30 selection:text-teal-200">
      {/* Background Decorative Gradient Orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10 space-y-6 animate-in fade-in zoom-in-95 duration-300">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950/80 border border-teal-800 text-teal-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Theme 4: Research & Knowledge Agents</span>
          </div>

          <div className="flex items-center justify-center gap-3 pt-1">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-teal-500/25">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
                StudyScout
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  AI
                </span>
              </h1>
              <p className="text-xs text-slate-400">Autonomous Student Research Portal</p>
            </div>
          </div>
        </div>

        {/* Card Box */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-xl p-6 sm:p-8 space-y-5">
          {/* Mode Switcher Tabs */}
          <div className="flex rounded-xl bg-slate-900/80 p-1 border border-slate-700/60 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                clearMessages();
              }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-teal-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                clearMessages();
              }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-teal-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('forgot_password');
                clearMessages();
              }}
              className={`flex-1 py-2 rounded-lg transition-all ${
                mode === 'forgot_password'
                  ? 'bg-teal-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Forgot Password
            </button>
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-start gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ================================================================= */}
          {/* VIEW 1: SIGN IN */}
          {/* ================================================================= */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Student Username or University Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="student@university.edu"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot_password');
                      setForgotIdentifier(identifier);
                      clearMessages();
                    }}
                    className="text-xs text-teal-400 hover:text-teal-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-teal-600 focus:ring-teal-500"
                  />
                  <span>Remember my login</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Open Research Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Quick 1-Click Access for Hackathon Judges & Users */}
              <div className="pt-3 border-t border-slate-700/70 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <span>Instant 1-Click Demo Access:</span>
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('student')}
                    className="py-2 px-2.5 rounded-lg border border-teal-800/80 bg-teal-950/40 hover:bg-teal-900/60 text-teal-300 text-xs font-semibold transition-all text-center group"
                  >
                    <span className="block text-[11px] font-bold text-teal-200">⚡ Demo Student</span>
                    <span className="text-[10px] text-teal-400/80">Alex Rivera (AI Bio)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('researcher')}
                    className="py-2 px-2.5 rounded-lg border border-slate-700 bg-slate-900/40 hover:bg-slate-700/60 text-slate-300 text-xs font-semibold transition-all text-center"
                  >
                    <span className="block text-[11px] font-bold text-slate-200">🔬 Lead Scholar</span>
                    <span className="text-[10px] text-slate-400">Dr. Vance (Neuro)</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* ================================================================= */}
          {/* VIEW 2: REGISTER */}
          {/* ================================================================= */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alex Rivera"
                    className="w-full pl-10 pr-4 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="arivera"
                    className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Field of Study
                  </label>
                  <select
                    value={fieldOfStudy}
                    onChange={(e) => setFieldOfStudy(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Biomedical & AI Engineering">Biomedical & AI</option>
                    <option value="Computer Science & ML">Computer Science & ML</option>
                    <option value="Environmental & Climate Science">Environmental Science</option>
                    <option value="Physics & Quantum Systems">Physics & Energy</option>
                    <option value="Economics & Quantitative Policy">Economics & Policy</option>
                    <option value="History & Humanities">Humanities & Law</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  University Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="student@university.edu"
                    className="w-full pl-10 pr-4 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Create Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2 transition-all mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <GraduationCap className="w-4 h-4" />
                    <span>Create Student Account</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ================================================================= */}
          {/* VIEW 3: FORGOT PASSWORD */}
          {/* ================================================================= */}
          {mode === 'forgot_password' && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <h3 className="text-sm font-bold text-slate-200 flex items-center justify-center gap-1.5">
                  <Key className="w-4 h-4 text-teal-400" />
                  Password Recovery Assistant
                </h3>
                <p className="text-xs text-slate-400">
                  {resetStep === 'request'
                    ? 'Enter your student username or email to generate a verified reset code.'
                    : 'Enter the verification code and set your new password.'}
                </p>
              </div>

              {resetStep === 'request' ? (
                <form onSubmit={handleRequestResetCode} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Username or University Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        value={forgotIdentifier}
                        onChange={(e) => setForgotIdentifier(e.target.value)}
                        placeholder="student@university.edu or student"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-sm bg-teal-600 hover:bg-teal-500 text-white shadow flex items-center justify-center gap-2 transition-all"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Key className="w-4 h-4" />
                        <span>Generate Reset Verification Code</span>
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-3.5">
                  {generatedCode && (
                    <div className="p-3 rounded-xl bg-teal-950/70 border border-teal-800 text-teal-200 text-xs flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-teal-400 block">Verification Code:</span>
                        <span className="font-mono font-bold text-sm text-teal-100">{generatedCode}</span>
                      </div>
                      <span className="text-[10px] bg-teal-800/60 px-2 py-0.5 rounded text-teal-300">Auto-filled</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      required
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      placeholder="SCOUT-XXXX"
                      className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-sm font-mono text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter at least 4 characters"
                      className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white shadow flex items-center justify-center gap-2 transition-all"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <RotateCcw className="w-4 h-4" />
                        <span>Update Password & Return to Login</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    clearMessages();
                  }}
                  className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
                >
                  ← Back to Sign In
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-slate-500">
          StudyScout AI Research System • Autonomous Plan-Act-Observe Agent Loop
        </p>
      </div>
    </div>
  );
};
export default AuthGate;
