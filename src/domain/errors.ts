import {EntityId} from "./common";

export class DomainConflictError extends Error {
    constructor(message: string) {
        super(message);

        Object.setPrototypeOf(this, DomainConflictError.prototype);
    }
}

export class EntityNotFoundError extends Error {
    constructor(id: EntityId) {
        super(`Entity not found with id ${id.value}`);

        Object.setPrototypeOf(this, EntityNotFoundError.prototype);
    }
}

export class EntityAlreadyExistError extends DomainConflictError {
    constructor(id: EntityId) {
        super(`Entity with id ${id.value} cannot be created because it already exists with same id and/or unique constraint.`);

        Object.setPrototypeOf(this, EntityAlreadyExistError.prototype);
    }
}