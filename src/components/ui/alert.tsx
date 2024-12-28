import React from 'react';

interface AlertProps {
  variant?: 'default' | 'destructive';
  children: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({ variant = 'default', children }) => {
  const baseStyles = "p-4 rounded-md mb-4";
  const variantStyles = variant === 'destructive' ? "bg-red-100 text-red-900" : "bg-gray-100 text-gray-900";
  
  return (
    <div className={`${baseStyles} ${variantStyles}`}>
      {children}
    </div>
  );
};

export const AlertTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h5 className="font-medium mb-2">{children}</h5>
);
