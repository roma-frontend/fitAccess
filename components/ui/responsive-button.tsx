import React from 'react';
import { Button, ButtonProps } from './button';
import { cn } from '@/lib/utils';

interface ResponsiveButtonProps extends ButtonProps {
  hideTextOnMobile?: boolean;
}

export function ResponsiveButton({ 
  children, 
  hideTextOnMobile = false, 
  className, 
  ...props 
}: ResponsiveButtonProps) {
  return (
    <Button
      className={cn(
        hideTextOnMobile && "sm:px-4 px-2",
        className
      )}
      {...props}
    >
      {hideTextOnMobile ? (
        <span className="flex items-center">
          {React.Children.toArray(children).map((child, index) => {
            if (typeof child === 'string' && index > 0) {
              return (
                <span key={index} className="hidden sm:inline ml-2">
                  {child}
                </span>
              );
            }
            return child;
          })}
        </span>
      ) : (
        children
      )}
    </Button>
  );
}
