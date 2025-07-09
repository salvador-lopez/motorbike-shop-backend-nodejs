import {Command} from "./command";

export interface CommandBus {
    send(command: Command): Promise<void>
}