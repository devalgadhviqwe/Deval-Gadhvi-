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
  initialScale = 0.88,
  yOffset = 32,
  className = '',
  amount = 0.15,
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
        amount,
        margin: '0px 0px -40px 0px'
      }}
      transition={{
        type: 'spring',
        damping: 22,
        stiffness: 130,
        mass: 0.85,
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
