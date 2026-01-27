import './Button.css';

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false, 
  className = '', 
  children, 
  ...props 
}) {
  const classes = `btn btn-${variant} btn-${size} ${fullWidth ? 'btn-full-width' : ''} ${className}`.trim();
  
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}


