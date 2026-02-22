/**
 * Skip Link Component
 * 
 * Accessibility component that allows keyboard users to skip
 * navigation and jump directly to main content.
 * 
 * WCAG 2.1 Success Criterion 2.4.1: Bypass Blocks
 */

import { useState } from 'react';

interface SkipLinkProps {
    targetId?: string;
    label?: string;
}

export default function SkipLink({
    targetId = 'main-content',
    label = 'Skip to main content'
}: SkipLinkProps) {
    const [isFocused, setIsFocused] = useState(false);

    const handleClick = (e: React.MouseEvent | React.KeyboardEvent) => {
        e.preventDefault();
        const target = document.getElementById(targetId);

        if (target) {
            // Make the target focusable if it isn't already
            if (!target.hasAttribute('tabindex')) {
                target.setAttribute('tabindex', '-1');
            }
            target.focus();
            // Scroll to target
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
            handleClick(e);
        }
    };

    return (
        <a
            href={`#${targetId}`}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`
                fixed top-4 left-4 z-[9999]
                px-4 py-2 rounded-lg
                bg-primary text-primary-foreground
                font-semibold text-sm
                shadow-lg
                transition-transform duration-200
                focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
                ${isFocused ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}
            `}
            style={{
                // Ensure it's visible only when focused
                clip: isFocused ? 'auto' : 'rect(0 0 0 0)',
                clipPath: isFocused ? 'none' : 'inset(50%)',
                height: isFocused ? 'auto' : '1px',
                width: isFocused ? 'auto' : '1px',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
            }}
        >
            {label}
        </a>
    );
}

/**
 * Main Content Wrapper
 * 
 * Use this to wrap your main content area to provide the skip link target.
 */
interface MainContentProps {
    children: React.ReactNode;
    id?: string;
    className?: string;
}

export function MainContent({
    children,
    id = 'main-content',
    className = ''
}: MainContentProps) {
    return (
        <main
            id={id}
            tabIndex={-1}
            className={`outline-none ${className}`}
            role="main"
            aria-label="Main content"
        >
            {children}
        </main>
    );
}
