export class UniqueConstraintError extends Error {
    constructor(message: string) {
        super(message);

        Object.setPrototypeOf(this, UniqueConstraintError.prototype);
    }
}