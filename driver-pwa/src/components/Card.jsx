import './Card.css';

export function Card({ children, className = '', padding = 'md' }) {
  const paddingClass = `card-padding-${padding}`;
  return (
    <div className={`card ${paddingClass} ${className}`}>
      {children}
    </div>
  );
}


