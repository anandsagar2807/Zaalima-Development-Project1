import * as React from "react";

/**
 * Simple loading spinner component.
 * Uses Tailwind CSS classes for a lightweight spinner.
 */
export const LoadingSpinner = ({ size = 8 }: { size?: number }) => (
    <div className="flex items-center justify-center">
        <div
            className={`animate-spin rounded-full border-4 border-t-primary border-b-transparent`}
            style={{ width: `${size * 0.25}rem`, height: `${size * 0.25}rem` }}
        />
    </div>
);

export default LoadingSpinner;
