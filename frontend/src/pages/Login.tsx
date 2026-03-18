import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { TrendingUp, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    }
  };
  
  return (
    <div className="min-h-screen bg-panel-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4">
            <TrendingUp className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-primary-700">TradePro</h1>
          <p className="text-panel-500 mt-2">Professional Trading Platform</p>
        </div>
        
        {/* Login Form */}
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-panel-900 mb-6">Sign In</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-sell-100 text-sell-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-panel-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-panel-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                  placeholder="Enter your email"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-panel-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-panel-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10 pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-panel-400 hover:text-panel-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded border-panel-300" />
                <span className="text-sm text-panel-600">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">
                Forgot password?
              </Link>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <span className="text-panel-600">Don't have an account? </span>
            <Link to="/signup" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign Up
            </Link>
          </div>
        </div>
        
        {/* Demo Credentials */}
        <div className="mt-4 p-4 bg-primary-50 rounded-lg">
          <p className="text-sm text-primary-700 font-medium mb-2">Demo Credentials:</p>
          <p className="text-sm text-panel-600">Email: trader@example.com</p>
          <p className="text-sm text-panel-600">Password: (any)</p>
        </div>
      </div>
    </div>
  );
}