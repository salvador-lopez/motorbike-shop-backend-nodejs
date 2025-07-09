export interface Command {
    readonly $name: string
    readonly $version: number
}

type CommandConstructor<TReturn> = new (...args: any[]) => TReturn;

export interface CommandHandler<TCommand extends Command = Command> {
    messageType: CommandConstructor<TCommand>;
    handle(command: TCommand): Promise<void>
}
