export interface CustomerCacheClearer {
    clear(): Promise<void>;
}