import { BaseRepository, RepositoryResult } from '@carbonteq/hexapp';

import { TaskEntity } from './todo-entity';
import { TaskNotFoundError } from './todo-entity-exceptions';

export abstract class TodoRepository extends BaseRepository<TaskEntity> {
    abstract fetchByUserId(userId: string, page: number): Promise<RepositoryResult<TaskEntity[], TaskNotFoundError>>;
}
