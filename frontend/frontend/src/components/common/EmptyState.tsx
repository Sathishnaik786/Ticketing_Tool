import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { fadeInVariants, slideUpVariants } from '@/animations/motionVariants';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  children?: ReactNode;
}

/**
 * Reusable empty state component
 * Use for no data, first-time user, or error fallback states
 */
export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action,
  children 
}: EmptyStateProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
      initial="initial"
      animate="animate"
      variants={fadeInVariants}
    >
      {Icon && (
        <motion.div
          variants={slideUpVariants}
          className="mb-6 p-4 rounded-full bg-muted"
        >
          <Icon className="h-12 w-12 text-muted-foreground" />
        </motion.div>
      )}
      
      <motion.h3
        variants={slideUpVariants}
        className="text-2xl font-semibold mb-2"
      >
        {title}
      </motion.h3>
      
      <motion.p
        variants={slideUpVariants}
        className="text-muted-foreground mb-6 max-w-md"
      >
        {description}
      </motion.p>
      
      {action && (
        <motion.div variants={slideUpVariants}>
          <Button onClick={action.onClick}>
            {action.label}
          </Button>
        </motion.div>
      )}
      
      {children && (
        <motion.div variants={slideUpVariants} className="mt-6">
          {children}
        </motion.div>
      )}
    </motion.div>
  );
}




