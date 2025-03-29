export class DomainConflictError extends Error {
    constructor(message: string) {
        super(message);

        Object.setPrototypeOf(this, DomainConflictError.prototype);
    }
}