/**
 * Shared Framer Motion animation variants - Standardized for Phase-5
 * FAST: 0.15s | NORMAL: 0.25s | SLOW: 0.4s
 * Easing: [0.2, 0, 0, 1] (Productive) | [0.4, 0, 0.2, 1] (Expressive)
 */

import { Variants } from 'framer-motion';

const EASE_PRODUCTIVE = [0.2, 0, 0, 1];
const EASE_EXPRESSIVE = [0.4, 0, 0.2, 1];

/**
 * Page transition animations
 */
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: EASE_PRODUCTIVE,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.15,
      ease: [0.4, 0, 1, 1],
    },
  },
};

/**
 * Modal/Dialog animations
 */
export const modalVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.98,
    y: 10,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: EASE_EXPRESSIVE,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: 10,
    transition: {
      duration: 0.15,
      ease: EASE_PRODUCTIVE,
    },
  },
};

/**
 * Backdrop/Overlay animations
 */
export const backdropVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.25,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.15,
    },
  },
};

/**
 * Sidebar animations (Mobile Drawer)
 */
export const sidebarVariants: Variants = {
  open: {
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 350,
      damping: 35,
    },
  },
  closed: {
    x: '-100%',
    transition: {
      type: 'spring',
      stiffness: 350,
      damping: 35,
    },
  },
};

/**
 * Sidebar collapse animation (for desktop)
 */
export const sidebarCollapseVariants: Variants = {
  expanded: {
    width: '280px',
    transition: {
      type: 'spring',
      stiffness: 350,
      damping: 35,
    },
  },
  collapsed: {
    width: '88px',
    transition: {
      type: 'spring',
      stiffness: 350,
      damping: 35,
    },
  },
};

/**
 * Dropdown menu animations
 */
export const dropdownVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.98,
    y: -8,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.15,
      ease: EASE_PRODUCTIVE,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: -8,
    transition: {
      duration: 0.12,
      ease: EASE_PRODUCTIVE,
    },
  },
};

/**
 * Toast notification animations
 */
export const toastVariants: Variants = {
  initial: {
    opacity: 0,
    y: -20,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    x: '100%',
    transition: {
      duration: 0.15,
      ease: EASE_PRODUCTIVE,
    },
  },
};

/**
 * Card hover animations
 */
export const cardHoverVariants: Variants = {
  rest: {
    scale: 1,
    y: 0,
    boxShadow: "0 0 0 0 rgba(0,0,0,0)",
  },
  hover: {
    scale: 1.01,
    y: -4,
    boxShadow: "0 20px 40px -15px rgba(0,0,0,0.1)",
    transition: {
      duration: 0.25,
      ease: EASE_EXPRESSIVE,
    },
  },
};

/**
 * Fade in animation
 */
export const fadeInVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.25,
      ease: EASE_PRODUCTIVE,
    },
  },
};

/**
 * Slide up animation
 */
export const slideUpVariants: Variants = {
  initial: {
    opacity: 0,
    y: 12,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: EASE_EXPRESSIVE,
    },
  },
};

/**
 * Slide in from left
 */
export const slideInLeftVariants: Variants = {
  initial: {
    opacity: 0,
    x: -12,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: EASE_EXPRESSIVE,
    },
  },
};

/**
 * Stagger children animation
 */
export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.04,
    },
  },
};

/**
 * Scale in animation
 */
export const scaleInVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: EASE_PRODUCTIVE,
    },
  },
};
