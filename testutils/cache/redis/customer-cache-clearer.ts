import {CustomerCacheClearer} from "../customer-cache-clearer";

export class RedisCustomerCacheClearer implements CustomerCacheClearer {
    async clear(): Promise<void> {
        throw new Error('Method not implemented.');
    }
}