import TelegramId from '../model/custom_types/TelegramId';
import IUserRepository from '../data/repositories/interfaces/IUserRepository'
import KillCode from '../model/custom_types/KillCode';
import { DeadUserStatus, PlayingUserStatus, WinningUserStatus } from './dto/UserStatus'
import PlayingUser, { KillTargetResult } from '../model/domain/PlayingUser';
import INotificationService from './notification/INotificationService'
import NotificationMessages from './notification/NotificationMessages'

export default class UserService {
    private readonly repo: IUserRepository
    private readonly notificationService: INotificationService

    constructor (repo: IUserRepository, notificationService: INotificationService) {
        this.repo = repo
        this.notificationService = notificationService
    }

    /**
     * the user (identified by `telegramId`) is trying to kill his target
     * @param telegramId the telegram id of the user whose target must be killed
     * @param killCode the kill code of the target
     */
    async killUserTarget(telegramId: string, killCode: string): Promise<void> {
        const tId = new TelegramId(telegramId)
        const kCode = new KillCode(killCode)
        
        const killer = await this.repo.getUserByTelegramId(tId, 2)
        if (!(await this.isUserPlaying(killer, telegramId)))
            return

        const possiblyKilledUser = killer.target
        const killTargetResult = killer.killTarget(kCode)

        switch (killTargetResult) {
            case KillTargetResult.KillTargetSuccessful:
                await this.repo.saveExistingUsers(killer, possiblyKilledUser)
                await this.notificationService.sendMessage(telegramId, NotificationMessages.KillTargetSuccessful )
                await this.notificationService.sendMessage(
                    possiblyKilledUser.userInfo.telegramId.toString(), 
                    NotificationMessages.UserIsDead)
                // TODO: notify whether he is the winner
                break
            case KillTargetResult.DeadUserCannotKill:
                await this.notificationService.sendMessage(telegramId, NotificationMessages.DeadUserCannotKill)
                break
            case KillTargetResult.WinnerCannotKill:
                await this.notificationService.sendMessage(telegramId, NotificationMessages.WinnerCannotKill)
                break
            case KillTargetResult.WrongKillCode:
                await this.notificationService.sendMessage(telegramId, NotificationMessages.WrongKillCode)     
                break
        }            
    }

    /**
     * return the status of the current player, including his own kill code 
     * and target info
     * @param telegramId the telegram id of the player
     */
    // async getUserStatus(telegramId: string): Promise<void> 
    // {
    //     const tId = new TelegramId(telegramId)
    //     const user = await this.repo.getUserByTelegramId(tId, 1)
    //     if (!this.isUserPlaying(user))
    //         return

    //     if (user.isDead())
    //         return new DeadUserStatus()
    //     else if (user.isWinner())
    //         return new WinningUserStatus()
    //     else 
    //         return new PlayingUserStatus(user)
    // }

    private async isUserPlaying(user: PlayingUser, telegramId: string): Promise<boolean> {
        if (user === null) {
            await this.notificationService.sendMessage(telegramId, NotificationMessages.UnregisteredUser)
            return false
        }

        if (!user.isPlaying()) {
            await this.notificationService.sendMessage(telegramId, NotificationMessages.GameNotStartedYet)
            return false
        }

        return true
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