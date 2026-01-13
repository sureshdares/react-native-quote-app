/**
 * Custom debounce hook for React components
 */
export function useDebounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): T {
    let timeout: NodeJS.Timeout | null = null;

    const debouncedFunc = ((...args: Parameters<T>) => {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
            func(...args);
        }, wait);
    }) as T;

    return debouncedFunc;
}

/**
 * Custom debounce function (non-hook version)
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            timeout = null;
            func(...args);
        };

        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(later, wait);
    };
}
