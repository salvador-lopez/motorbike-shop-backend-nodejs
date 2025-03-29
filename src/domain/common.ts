import {validate} from "uuid";
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