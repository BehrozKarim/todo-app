import { BaseRepository, RepositoryResult } from '@carbonteq/hexapp';

import { UserEntity } from './user-entity';
import { UserNotFoundError } from './user-entity-exceptions';

export abstract class UserRepository extends BaseRepository<UserEntity> {
    abstract fetchByUsername(username: string): Promise<RepositoryResult<UserEntity, UserNotFoundError>>;
    abstract fetchByEmail(email: string): Promise<RepositoryResult<UserEntity, UserNotFoundError>>;
}