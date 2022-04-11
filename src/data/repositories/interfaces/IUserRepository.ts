import { PlayingUserModel } from '../../model/UserModel'
import TelegramId from '../../../model/custom_types/TelegramId'
import { PlayingUser } from '../../../model/domain/User'

export default interface IUserRepository {
    /**
     * Find the unique player that has `target` as his target
     * @param target the target of the player to find
     */
    //findPlayerThatHasTarget(target: PlayingUser, nestedLevel: number): Promise<PlayingUserModel>
    /**
     * get a `PlayingUser` with the specified `telegramId`. the returned user is eagerly
     * loaded with as many targets as `nestedLevel`.
     * @param telegramId 
     * @param nestedLevel with a `nestedLevel = 2`, you can access fields inside user.target.target
     */
    getUserByTelegramId(telegramId: TelegramId, nestedLevel?: number): Promise<PlayingUser>

    /**
     * returns all users, both those who are playing and the ones who are not
     */
    getAllUsers(): Promise<PlayingUser[]>

    /**
     * save an existing user and the loaded associations. for example, if target is
     * loaded, then it is updated as well
     * @param playingUser the user to update
     */
    saveExistingUsers(...playingUsers: PlayingUser[]): Promise<void>;
}