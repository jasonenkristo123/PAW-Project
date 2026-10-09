const applyLightTheme = () => {
    if (typeof document === 'undefined') {
        return;
    }

    document.documentElement.classList.remove('dark');
    document.documentElement.style.colorScheme = 'light';
};

export function initializeTheme() {
    applyLightTheme();
}

export function useAppearance() {
    return {
        appearance: 'light',
        resolvedAppearance: 'light',
        updateAppearance: applyLightTheme,
    };
}
