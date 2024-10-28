export function getLanguage(): string {
    return window.navigator.language?.slice(0, 2);
}

export function getFullLanguage(): string {
    return window.navigator.language;
}
