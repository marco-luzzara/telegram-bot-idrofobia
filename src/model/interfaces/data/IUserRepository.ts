import { PlayingUserModel } from '../../../data/model/UserModel'
import TelegramId from '../../custom_types/TelegramId'

export default interface IUserRepository {
    /**
     * Find the unique player that has `target` as his target
     * @param target the target of the player to find
     */
    //findPlayerThatHasTarget(target: PlayingUser, nestedLevel: number): Promise<PlayingUserModel>
    /**
     * get a `PlayingUserModel` with the specified `telegramId`. the returned user is eagerly
     * loaded with as many targets as `nestedLevel`.
     * @param telegramId 
     * @param nestedLevel with a `nestedLevel = 2`, you can access fields inside user.target.target
     */
    getByTelegramId(telegramId: TelegramId, nestedLevel?: number): Promise<PlayingUserModel>
    getAllUsers(): Promise<PlayingUserModel[]>
}