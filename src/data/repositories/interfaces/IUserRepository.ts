import TelegramId from '../../../model/custom_types/TelegramId'
import PlayingUser from '../../../model/domain/PlayingUser'

export default interface IUserRepository {
    /**
     * get a `PlayingUser` with the specified `telegramId`, or null if not found. 
     * the returned user is eagerly loaded with as many targets as `nestedLevel`.
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