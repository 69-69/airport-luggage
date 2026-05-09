// actions/services/storageService.ts

const storageService = {
    get<T>(key: string, fallback: T): T {
        if (typeof window === 'undefined') {
            // Server-side: just return fallback
            return fallback;
        }

        // Client-side: safe to use localStorage/sessionStorage
        const data = localStorage.getItem(key) || sessionStorage.getItem(key);
        return data ? JSON.parse(data) : fallback;
    },

    set<T>(key: string, value: T, remember?: boolean) {
        if (typeof window === 'undefined') return;

        // const storage = remember ? localStorage : sessionStorage;
        localStorage.setItem(key, JSON.stringify(value));
    },

    remove(key: string) {
        if (typeof window === 'undefined') return;

        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
    },
}

export default storageService;