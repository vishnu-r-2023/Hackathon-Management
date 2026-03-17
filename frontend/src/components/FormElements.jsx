import { motion } from 'framer-motion';

export const Card = ({ children, className = '', ...props }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className={`card p-6 ${className}`}
    {...props}
  >
    {children}
  </motion.div>
);

export const Button = ({ variant = 'primary', className = '', children, ...props }) => {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export const Input = ({ className = '', ...props }) => (
  <motion.input
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className={`input-field ${className}`}
    {...props}
  />
);

export const TextArea = ({ className = '', ...props }) => (
  <motion.textarea
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className={`input-field resize-none ${className}`}
    {...props}
  />
);
