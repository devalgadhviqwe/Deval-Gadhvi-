import React from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';

interface ScrollPopProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  initialScale?: number;
  yOffset?: number;
  className?: string;
  amount?: number | 'some' | 'all';
  once?: boolean;
}

/**
 * ScrollPop Component
 * Displays elements (especially images) with a fluid, spring-damped "pop-up"
 * effect when they scroll into the viewport.
 */
export const ScrollPop: React.FC<ScrollPopProps> = ({
  children,
  delay = 0,
  initialScale = 0.95,
  yOffset = 20,
  className = '',
  amount = 'some',
  once = true,
  ...props
}) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: initialScale,
        y: yOffset
      }}
      whileInView={{
        opacity: 1,
        scale: 1,
        y: 0
      }}
      viewport={{
        once,
        amount: 'some',
        margin: '100px 0px 100px 0px'
      }}
      transition={{
        duration: 0.45,
        ease: [0.16, 1, 0.3, 1],
        delay
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default ScrollPop;
