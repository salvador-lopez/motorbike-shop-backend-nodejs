import {EntityManager, DataSource, QueryRunner, QueryFailedError} from "typeorm";
import { AsyncLocalStorage } from "node:async_hooks";
import {UnitOfWork} from "../../services/unit-of-work";

export class TypeOrmTransactionManager implements UnitOfWork {
    private asyncLocalStorage = new AsyncLocalStorage<QueryRunner>();
    private dataSource :DataSource

    constructor({dataSource}: {dataSource: DataSource }) {
        this.dataSource = dataSource;
    }

    async transaction<T>(fn: () => Promise<T>): Promise<T> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();

        try {
            await queryRunner.startTransaction();

            return await this.asyncLocalStorage.run(queryRunner, async () => {
                try {
                    const result = await fn();

                    await queryRunner.commitTransaction();

                    return result;
                } catch (error) {
                    if(error instanceof  QueryFailedError){
                        console.log('Error in transaction', error.message)
                    }else{
                        console.log("Error in transaction", error)
                    }

                    await queryRunner.rollbackTransaction();
                    throw error;
                }
            });
        } finally {
            await queryRunner.release();
        }
    }

    get repository(): EntityManager {
        const queryRunner = this.asyncLocalStorage.getStore();

        return queryRunner ? queryRunner.manager : this.dataSource.manager;
    }
}
