import 'express';
import { AwilixContainer } from 'awilix';

declare module 'express-serve-static-core' {
    interface Application {
        container: AwilixContainer;
    }

    interface Request {
        container: AwilixContainer;
    }
}