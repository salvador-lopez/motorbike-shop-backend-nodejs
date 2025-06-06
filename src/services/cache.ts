
import {CustomerDTO} from "./customer";

export interface CustomerCache {
    set:(customer:CustomerDTO, ttl: number)=> Promise<void>;
    get:(id:string)=> Promise<CustomerDTO | null>;
    getAll:()=> Promise<CustomerDTO[] | null>;
}

