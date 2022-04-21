import * as timespan from "timespan"

import TelegramId from '../model/custom_types/TelegramId';
import IUserRepository from '../data/repositories/interfaces/IUserRepository'
import PlayingUser from '../model/domain/PlayingUser';
import IAdminUserRepository from '../data/repositories/interfaces/IAdminUserRepository';
import INotificationService from "./notification/INotificationService";
import UserService from "./UserService";
import NotificationMessages from "./notification/NotificationMessages";

/**
 * Note: `AdminUserService` returns a `Proxy` instance that takes care of 
 * the requests that needs authorization. The assumptions are:
 * - the methods to authorize should be added to `authorizedMethods`
 * - the first argument of a method to authorize is the telegramId
 */
export default class AdminUserService {
    private readonly userRepo: IUserRepository
    private readonly adminRepo: IAdminUserRepository

    private readonly notificationService: INotificationService
    private readonly userService: UserService

    // private readonly authorizedMethods = [
    //     this.startGame,
    //     this.killUserTarget,
    //     this.killIdlePlayers
    // ].map(f => f.name)

    constructor(userRepo: IUserRepository/*, adminRepo: IAdminUserRepository*/, 
        notificationService: INotificationService) 
    {
        this.userRepo = userRepo
        //this.adminRepo = adminRepo
        this.notificationService = notificationService
        this.userService = new UserService(this.userRepo, this.notificationService)

        // const thisService = this

        // for (const authorizedMethod of this.authorizedMethods) {
        //     this[authorizedMethod] = new Proxy(this[authorizedMethod], {
        //             apply: async function(target: any, thisArg, argumentsList) {
        //                 // I am assuming the first parameter is the telegram id of the caller
        //                 const adminTelegramId = new TelegramId(argumentsList[0])
        //                 const adminUser = await thisService.adminRepo.getAdminUserByTelegramId(adminTelegramId)
        //                 if (adminUser === null)
        //                     throw new UnauthorizedError(adminTelegramId.toString(), 'Admin')
        
        //                 const boundTarget = target.bind(thisService)
        //                 return boundTarget(...argumentsList)
        //             }
        //         })
        // }
    }

    /**
     * start or restart the game by reassigning targets and setting the lastKill to the current
     * date for all the users
     * @param adminTelegramId the telegram id of the admin
     */
    async startGame(adminTelegramId: string): Promise<void> {
        const userGenerator = this.userRepo.getAllUsers()
        const startingGameDate = new Date()

        const firstPlayer: PlayingUser = (await userGenerator.next()).value as PlayingUser
        // there is not any user
        if (firstPlayer === undefined)
            return
        firstPlayer.lastKill = startingGameDate

        let previousPlayer = firstPlayer
        for await (let player of userGenerator) {
            previousPlayer.target = player
            await this.userRepo.saveExistingUsers(previousPlayer)
            await this.notificationService.sendMessage(previousPlayer.userInfo.telegramId.toString(), 
                NotificationMessages.GameStarted)

            player.lastKill = startingGameDate
            previousPlayer = player
        }

        previousPlayer.target = firstPlayer
        await this.userRepo.saveExistingUsers(previousPlayer)
        await this.notificationService.sendMessage(previousPlayer.userInfo.telegramId.toString(), 
            NotificationMessages.GameStarted)

        await this.notificationService.sendMessage(adminTelegramId, 
            NotificationMessages.GameStartedSuccessfully)
    }

    /**
     * manually kill a player
     * @param adminTelegramId the telegram id of the admin
     * @param telegramId the telegram id of the player to be killed
     */
    async killPlayer(adminTelegramId: string, telegramId: string): Promise<void> {
        const userTId = new TelegramId(telegramId)
        const user = await this.userRepo.getUserFromTargetTId(userTId, 1)

        await this.userService.killUserTarget(user.userInfo.telegramId.toString(), 
            user.target.userInfo.killCode.toString())

        await this.notificationService.sendMessage(adminTelegramId, 
            NotificationMessages.AskToUserForKillResult)
    }

    /**
     * kill those players that have not killed their target within the `idleTimeSpan` time.
     * these players are called idle players.
     * @param adminTelegramId the telegram id of the admin
     * @param idleTimeSpan the maximum amount of time a player can play without killing anyone
     */
    async killIdlePlayers(adminTelegramId: string, idleTimeSpan: timespan.TimeSpan): Promise<void> {
        let firstNotIdle: PlayingUser = undefined
        let previousNotIdle: PlayingUser = undefined
        const idleCheckTime = new Date()

        for await (let player of this.userRepo.getAllLivingUsers()) {
            if (player.isIdle(idleCheckTime, idleTimeSpan)) {
                player.die()
                await this.userRepo.saveExistingUsers(player)
                this.notificationService.sendMessage(player.userInfo.telegramId.toString(),
                    NotificationMessages.UserIsDeadBecauseOfIdleness)
                continue
            }

            if (firstNotIdle === undefined) {
                firstNotIdle = previousNotIdle = player
                continue
            }

            previousNotIdle.target = player
            await this.userRepo.saveExistingUsers(previousNotIdle)
            await this.userService.getUserStatus(previousNotIdle.userInfo.telegramId.toString())
            previousNotIdle = player
        }

        if (previousNotIdle !== undefined) {
            previousNotIdle.target = firstNotIdle
            await this.userRepo.saveExistingUsers(previousNotIdle)
            await this.userService.getUserStatus(previousNotIdle.userInfo.telegramId.toString())
        }

        await this.notificationService.sendMessage(adminTelegramId, 
            NotificationMessages.IdleUsersKilledSuccessfully)
    }
}