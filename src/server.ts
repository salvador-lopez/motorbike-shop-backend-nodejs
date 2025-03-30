import "reflect-metadata";
import createApp from './app';
import { defaultDataSource } from './database/typeorm/data-source';

const port: number = 3000;

const startServer = async () => {
    const app = await createApp(defaultDataSource);
        
    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`);
    });
};

startServer();
