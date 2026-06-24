import { motion, useReducedMotion } from "framer-motion";

interface AnimatedContainerProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right";
  animationsDisabled?: boolean;
}

const getInitialState = (direction: "up" | "left" | "right") => {
  switch (direction) {
    case "up":
      return { opacity: 0, y: 30, x: 0 };
    case "left":
      return { opacity: 0, x: -40, y: 0 };
    case "right":
      return { opacity: 0, x: 40, y: 0 };
  }
};

const springConfig = {
  type: "spring" as const,
  stiffness: 100,
  damping: 18,
};

export function AnimatedContainer({
  children,
  className,
  delay = 0,
  direction = "up",
  animationsDisabled = false,
}: AnimatedContainerProps) {
  const shouldReduceMotion = useReducedMotion();

  // Skip animation when reduced motion is preferred or animations are disabled via in-page toggle
  if (shouldReduceMotion || animationsDisabled) {
    return <div className={className}>{children}</div>;
  }

  const initialState = getInitialState(direction);

  return (
    <motion.div
      className={className}
      initial={initialState}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{
        ...springConfig,
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}

export default AnimatedContainer;
