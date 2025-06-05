
export interface CacheOptions {
    ttl?: number;
}

export interface ICache{

    get:<T>(key:string)=> Promise<T | null>;

    set:<T>( key:string, value: T, options?: CacheOptions)=> void;
}

