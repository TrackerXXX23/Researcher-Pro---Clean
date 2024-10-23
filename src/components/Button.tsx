import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyles = "px-4 py-2 rounded font-bold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variantStyles = variant === 'primary' 
    ? "bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500" 
    : "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500";

  return (
    <button className={`${baseStyles} ${variantStyles} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
