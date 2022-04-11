import TelegramId from '../model/custom_types/TelegramId';
import IUserRepository from '../data/repositories/interfaces/IUserRepository'
import KillCode from '../model/custom_types/KillCode';

export default class UserService {
    private readonly repo: IUserRepository

    constructor (repo: IUserRepository) {
        this.repo = repo
    }

    /**
     * the user (identified by `telegramId`) is trying to kill his target
     * @param telegramId the telegram id of the user whose target must be killed
     * @param killCode the kill code of the target
     */
    // async killUserTarget(telegramId: string, killCode: string): boolean {
    //     const tId = new TelegramId(telegramId)
    //     const kCode = new KillCode(killCode)
        
    //     const playingUser = await this.repo.getUserByTelegramId(tId)

    //     const isTargetKilled = playingUser.killTarget(kCode)

    //     if (isTargetKilled)
    //         //update
    //     return isTargetKilled
    // }
}