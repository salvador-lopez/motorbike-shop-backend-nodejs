export interface CustomerCacheClearer {
    clear(): Promise<void>;
    disconnect(): Promise<void>;
}

export class NoOpCustomerCacheClearer implements CustomerCacheClearer {
    async clear(): Promise<void> {
    }

    async disconnect(): Promise<void> {
    }
}