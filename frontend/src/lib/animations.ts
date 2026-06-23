// Optimized animation variants for faster response times
// Reduced stagger and duration values for snappier UI interactions

export const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.02, // Reduced from 0.05 for faster response
            delayChildren: 0.05 // Minimal delay before children start animating
        }
    },
}

export const itemVariants = {
    hidden: { opacity: 0, y: 10 }, // Reduced y from 20 to 10 for subtler, faster animation
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.2, // Reduced duration for snappier feel
            ease: "easeOut"
        }
    },
}

// For elements that should appear instantly (no animation)
export const instantVariants = {
    hidden: { opacity: 1 },
    visible: { opacity: 1 },
}

// For hover animations on buttons/cards - optimized for quick response
export const hoverVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.02, transition: { duration: 0.1 } }, // Quick scale on hover
    tap: { scale: 0.98, transition: { duration: 0.1 } }, // Quick feedback on click
}
