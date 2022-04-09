import TelegramId from '../model/custom_types/TelegramId';
import IUserRepository from '../model/interfaces/data/IUserRepository'

export default class UserService {
    private readonly repo: IUserRepository

    constructor (repo: IUserRepository) {
        this.repo = repo
    }

    /**
     * the target of the user identified by `telegramId` is killed
     * @param telegramId the telegram id of the user whose target must be killed
     */
    async killUserTarget(telegramId: string) {
        // const tId = new TelegramId(telegramId)
        // const playingUserData = await this.repo.getByTelegramId(tId)
    }
}