import {Email, EntityId} from "./common";

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

export class EntityWithSameIdAlreadyExistError extends DomainConflictError {
    constructor(id: EntityId) {
        super(`Entity with id ${id.value} already exists.`);

        Object.setPrototypeOf(this, EntityWithSameIdAlreadyExistError.prototype);
    }
}

export class EntityWithSameEmailAlreadyExistError extends DomainConflictError {
    constructor(email: Email) {
        super(`Entity with email ${email.value} already exists.`);

        Object.setPrototypeOf(this, EntityWithSameEmailAlreadyExistError.prototype);
    }
}