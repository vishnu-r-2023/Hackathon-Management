import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '../components/FormElements';
import { Sparkles, Rocket, Users, Trophy } from 'lucide-react';

export const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto px-4 py-20 text-center"
      >
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-white mb-6"
        >
          Manage Your <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Hackathon
          </span> Effortlessly
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto"
        >
          HackSphere is your all-in-one platform for organizing, managing, and showcasing hackathons. From registration to evaluation, we've got you covered.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        >
          <Link to="/register">
            <Button variant="primary" className="px-8 py-3">
              Get Started
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="ghost" className="px-8 py-3">
              Sign In
            </Button>
          </Link>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16"
        >
          {[
            { icon: Rocket, label: 'Fast Setup', desc: 'Launch hackathons in minutes' },
            { icon: Users, label: 'Team Management', desc: 'Organize participants easily' },
            { icon: Trophy, label: 'Fair Judging', desc: 'Transparent evaluation process' },
            { icon: Sparkles, label: 'Real Analytics', desc: 'Track metrics live' },
          ].map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -8 }}
              className="card p-6"
            >
              <feature.icon className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                {feature.label}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>
    </div>
  );
};
