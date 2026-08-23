import React, { useState } from 'react';

export interface TooltipProps {
  content: string | React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactNode;
  className?: string;
}

export function Tooltip({ content, position = 'top', children, className = '' }: TooltipProps) {
  const [visible, setVisible] = useState(false);

  if (!content) return <>{children}</>;

  return (
    <div
      className={`tooltip-trigger inline-flex items-center ${className}`}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div className={`tooltip-content tooltip-${position}`}>
          {content}
        </div>
      )}
    </div>
  );
}

export default Tooltip;
