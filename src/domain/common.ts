import {validate} from "uuid";
import isEmail from 'validator/lib/isEmail';
import {DomainConflictError} from "./errors";

export class EntityId {
    readonly value: string;
    constructor(id: string) {
        if (!validate(id)) {
            throw new DomainConflictError("Invalid UUID: " + id);
        }
        this.value = id;
    }
}

export class Email {
    readonly value: string;
    constructor(value: string) {
        if (!isEmail(value)) {
            throw new DomainConflictError("Invalid email: " + value);
        }
        this.value = value;
    }
}

export class Credit {
    readonly value: number;
    constructor(value: number) {
        this.value = value;
    }
    add(credit: Credit) {
        return new Credit(this.value + credit.value);
    }
}