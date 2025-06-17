export interface CustomerCacheClearer {
    clear(): Promise<void>;
    disconnect(): Promise<void>;
}