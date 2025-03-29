import {validate} from "uuid";
import isEmail from 'validator/lib/isEmail';
import {DomainConflictError} from "./errors";

export class EntityId {
    private id: string;
    constructor(id: string) {
        if (!validate(id)) {
            throw new DomainConflictError("Invalid UUID: " + id);
        }
        this.id = id;
    }
}

export class Email {
    private value: string;
    constructor(value: string) {
        if (!isEmail(value)) {
            throw new DomainConflictError("Invalid email: " + value);
        }
        this.value = value;
    }
}