import {DataSource, QueryRunner, EntityManager, EntityTarget} from "typeorm";
import { AsyncLocalStorage } from "node:async_hooks";
import {UnitOfWork} from "../../services/unit-of-work";

export interface TypeOrmConnectionAware{
    entityManager(): EntityManager
}

export class TypeOrmConnection implements UnitOfWork, TypeOrmConnectionAware {
    private asyncLocalStorage = new AsyncLocalStorage<QueryRunner>();
    private dataSource :DataSource

    constructor({dataSource}: { dataSource: DataSource }) {
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
                    await queryRunner.rollbackTransaction();
                    throw error;
                }
            });
        } finally {
            await queryRunner.release();
        }
    }

    entityManager(): EntityManager {
        const queryRunner = this.asyncLocalStorage.getStore();

        return queryRunner ? queryRunner.manager : this.dataSource.manager;
    }
}
