import TelegramId from '../model/custom_types/TelegramId';
import IUserRepository from '../data/repositories/interfaces/IUserRepository'
import KillCode from '../model/custom_types/KillCode';
import { DeadUserStatus, PlayingUserStatus, WinningUserStatus } from './dto/UserStatus'
import { PlayingUser } from '../model/domain/User';

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
    async killUserTarget(telegramId: string, killCode: string): Promise<boolean> {
        const tId = new TelegramId(telegramId)
        const kCode = new KillCode(killCode)
        
        const killer = await this.repo.getUserByTelegramId(tId, 2)
        const possiblyKilledUser = killer.target

        if (killer.isWinner())
            return false

        const isTargetKilled = killer.killTarget(kCode)

        if (isTargetKilled)
            await this.repo.saveExistingUsers(killer, possiblyKilledUser)
           
        return isTargetKilled
    }

    /**
     * return the status of the current player, including his own kill code 
     * and target info
     * @param telegramId the telegram id of the player
     */
    async getUserStatus(telegramId: string): 
        Promise<PlayingUserStatus | DeadUserStatus | WinningUserStatus> 
    {
        const tId = new TelegramId(telegramId)
        const user = await this.repo.getUserByTelegramId(tId, 1)

        if (user.isDead())
            return new DeadUserStatus()
        else if (user.isWinner())
            return new WinningUserStatus()
        else 
            return new PlayingUserStatus(user)
    }

    /**
     * returns whether the user identified by `telegramId` is the winner
     * @param telegramId 
     */
    async isWinner(telegramId: string): Promise<boolean> {
        const tId = new TelegramId(telegramId)
        const user = await this.repo.getUserByTelegramId(tId, 1)

        return user.isWinner()
    }
}