import {EntityId} from "./common";

export class DomainConflictError extends Error {
    constructor(message: string) {
        super(message);

        Object.setPrototypeOf(this, DomainConflictError.prototype);
    }
}

export class EntityNotFoundError extends Error {
    constructor(id: EntityId) {
        super("Entity not found with id " + id.value);

        Object.setPrototypeOf(this, EntityNotFoundError.prototype);
    }
}