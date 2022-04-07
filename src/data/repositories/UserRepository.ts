import { PlayingUser } from '../../model/domain/User'
import { UserModel } from '../model/UserModel'
import IUserRepository from '../../model/interfaces/data/IUserRepository'

export default class UserRepository implements IUserRepository {
    async findPlayerThatHasTarget<TId>(targetId: TId): Promise<PlayingUser> {
        return null;
    }

    async getById<TId>(playerId: TId): Promise<PlayingUser> {
        throw new Error('Method not implemented.');
    }

    async update(playingUser: PlayingUser): Promise<void> {
        throw new Error('Method not implemented.');
    }

}