import React from 'react';

const AccessibleInput = ({ 
  label, 
  error, 
  className = '', 
  ...props 
}) => {
  const inputClasses = [
    'input',
    error ? 'input-error' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="input-group">
      {label && (
        <label className="input-label" htmlFor={props.id}>
          {label}
        </label>
      )}
      <input
        className={inputClasses}
        {...props}
      />
      {error && (
        <span className="input-error-message">{error}</span>
      )}
    </div>
  );
};

export default AccessibleInput;