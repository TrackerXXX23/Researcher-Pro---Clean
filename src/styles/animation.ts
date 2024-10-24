export interface AnimationVariant {
  initial?: Record<string, any>
  animate?: Record<string, any>
  exit?: Record<string, any>
  transition?: {
    duration?: number
    ease?: string | number[]
    delay?: number
    type?: string
  }
}

export interface AnimationConfig {
  duration: number
  easing: string
  delay: number
  variants: Record<string, AnimationVariant>
}

export const defaultAnimationConfig: AnimationConfig = {
  duration: 0.3,
  easing: 'easeInOut',
  delay: 0,
  variants: {
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: {
        duration: 0.3,
        ease: 'easeInOut',
      },
    },
    slideIn: {
      initial: { x: -20, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: 20, opacity: 0 },
      transition: {
        duration: 0.3,
        ease: 'easeInOut',
      },
    },
    scaleIn: {
      initial: { scale: 0.9, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 0.9, opacity: 0 },
      transition: {
        duration: 0.3,
        ease: 'easeInOut',
      },
    },
  },
}

export const loadingAnimations = {
  pulse: {
    initial: { opacity: 0.6 },
    animate: { opacity: 1 },
    transition: {
      duration: 0.8,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatType: 'reverse',
    },
  },
  spin: {
    animate: { 
      rotate: 360,
      transition: {
        duration: 1,
        ease: 'linear',
        repeat: Infinity,
      },
    },
  },
  shimmer: {
    initial: { x: '-100%' },
    animate: { x: '100%' },
    transition: {
      duration: 1.5,
      ease: 'easeInOut',
      repeat: Infinity,
    },
  },
}

export const transitionPresets = {
  fast: {
    duration: 0.2,
    ease: 'easeOut',
  },
  smooth: {
    duration: 0.3,
    ease: 'easeInOut',
  },
  elastic: {
    type: 'spring',
    stiffness: 400,
    damping: 30,
  },
}

export const createAnimation = (
  variant: keyof typeof defaultAnimationConfig.variants,
  custom?: Partial<AnimationVariant>
): AnimationVariant => {
  const baseVariant = defaultAnimationConfig.variants[variant]
  return {
    ...baseVariant,
    ...custom,
    transition: {
      ...baseVariant.transition,
      ...custom?.transition,
    },
  }
}

export const combineAnimations = (
  variants: AnimationVariant[]
): AnimationVariant => {
  return variants.reduce((combined, current) => ({
    initial: { ...combined.initial, ...current.initial },
    animate: { ...combined.animate, ...current.animate },
    exit: { ...combined.exit, ...current.exit },
    transition: { ...combined.transition, ...current.transition },
  }))
}
