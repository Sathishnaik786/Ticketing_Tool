import { motion } from 'framer-motion';
import { pageVariants } from '@/animations/motionVariants';
import { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

/**
 * Wrapper component for page transitions
 * Use this to wrap page content for smooth transitions
 */
export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
    >
      {children}
    </motion.div>
  );
}




