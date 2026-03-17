import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { authAPI } from '../services/endpoints';
import { useAuthStore } from '../store/store';
import { Input, Button } from '../components/FormElements';
import { Mail, Lock, User } from 'lucide-react';

export const Register = () => {
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState('participant');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    bootstrapSecret: '',
  });

  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        role,
      };
      if (role === 'participant') delete data.bootstrapSecret;

      const response = await authAPI.register(data);
      if (!response.data?.token) {
        toast.error('Registration failed: missing token from server');
        return;
      }

      setAuth(response.data.user, response.data.token);
      toast.success('Registration successful!');
      navigate(role === 'admin' ? '/admin' : role === 'judge' ? '/judge' : '/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Join HackSphere
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Create your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-slate-400" size={18} />
                <Input
                  type="text"
                  name="name"
                  placeholder="Vishnu"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                <Input
                  type="email"
                  name="email"
                  placeholder="vishnu@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                <Input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="input-field"
              >
                <option value="participant">Participant</option>
                <option value="admin">Admin</option>
                <option value="judge">Judge</option>
              </select>
            </div>

            {/* Bootstrap Secret */}
            {role !== 'participant' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Bootstrap Secret
                </label>
                <Input
                  type="password"
                  name="bootstrapSecret"
                  placeholder="Admin/Judge secret"
                  value={formData.bootstrapSecret}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            {/* Submit */}
            <Button variant="primary" type="submit" className="w-full mt-6" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-slate-600 dark:text-slate-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
