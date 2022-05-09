import * as timespan from "timespan"

import { BotLanguage } from '../infrastructure/utilities/GlobalizationUtil'
import TelegramId from '../model/custom_types/TelegramId';
import IUserRepository from '../data/repositories/interfaces/IUserRepository'
import PlayingUser from '../model/domain/PlayingUser';
import INotificationService from "./notification/INotificationService";
import UserService from "./UserService";
import NotificationMessages from "./notification/NotificationMessages";

export default class AdminUserService {
    private readonly userRepo: IUserRepository

    private readonly notificationService: INotificationService
    private readonly userService: UserService

    constructor(userRepo: IUserRepository/*, adminRepo: IAdminUserRepository*/, 
        notificationService: INotificationService) 
    {
        this.userRepo = userRepo
        this.notificationService = notificationService
        this.userService = new UserService(this.userRepo, this.notificationService)
    }

    /**
     * start or restart the game by reassigning targets and setting the lastKill to the current
     * date for all the users
     * @param adminGroupId the group id of the admin group
     */
    async startGame(adminGroupId: number): Promise<void> {
        const userGenerator = this.userRepo.getAllUsers()
        const startingGameDate = new Date()

        const firstPlayer = (await userGenerator.next()).value as PlayingUser
        // there is not any user
        if (firstPlayer === undefined)
            return
        firstPlayer.startPlaying(startingGameDate)

        let previousPlayer = firstPlayer
        for await (let player of userGenerator) {
            previousPlayer.target = player
            await this.userRepo.saveExistingUsers(previousPlayer)
            await this.notificationService.sendMessage(previousPlayer.userInfo.telegramId.toString(), 
                NotificationMessages.GameStarted)

            player.startPlaying(startingGameDate)
            previousPlayer = player
        }

        previousPlayer.target = firstPlayer
        await this.userRepo.saveExistingUsers(previousPlayer)
        await this.notificationService.sendMessage(previousPlayer.userInfo.telegramId.toString(), 
            NotificationMessages.GameStarted)

        await this.notificationService.sendMessage(adminGroupId, 
            NotificationMessages.GameStartedSuccessfully)
    }

    /**
     * manually kill a player
     * @param adminGroupId the group id of the admin group
     * @param telegramId the telegram id of the player to be killed
     */
    async killPlayer(adminGroupId: number, telegramId: string): Promise<void> {
        const userTId = new TelegramId(telegramId)
        const user = await this.userRepo.getUserFromTargetTId(userTId, 1)

        await this.userService.killUserTarget(user.userInfo.telegramId.toString(), 
            user.target.userInfo.killCode.toString())

        await this.notificationService.sendMessage(adminGroupId, 
            NotificationMessages.AskToUserForKillResult)
    }

    /**
     * get a list of those player that have not killed their target within the `idleTimeSpan` time.
     * these players are called idle players and are listed as (Id, telegram Id, target Id, last kill)
     * @param adminGroupId the group id of the admin group
     * @param idleTimeSpan the maximum amount of time a player can play without killing anyone
     */
    async getIdlePlayers(adminGroupId: number, idleTimeSpan: timespan.TimeSpan): Promise<void> {
        let stringBuilder = ''
        let params: string[] = []
        const idleCheckTime = new Date()

        for await (let player of this.userRepo.getPlayersInRing()) {
            if (player.isIdle(idleCheckTime, idleTimeSpan)) {
                stringBuilder += "Id: %s, Telegram Id: @%s, Target Id: %s, Last Kill: %s\n\n"
                params.push(player.id.toString(), player.userInfo.telegramId.toString(),
                    player.target.id.toString(), player.lastKill.toLocaleString(BotLanguage))
            }
        }

        if (stringBuilder === '')
            this.notificationService.sendMessage(adminGroupId, NotificationMessages.NoUserIdle)
        else
            this.notificationService.sendCustomMessage(adminGroupId, 
                stringBuilder.slice(0, -2), ...params)
    }

    /**
     * send a custom message to the specified players
     * @param message 
     * @param receiverType a type that identify a group of users
     */
    async sendMessageToUsers(adminGroupId: number, message: string, receiverType: MessageReceiverType): Promise<void> {
        let userIter: AsyncGenerator<PlayingUser, any, undefined>
        switch(receiverType) {
            case MessageReceiverType.AllLivingUsers:
                userIter = this.userRepo.getAllLivingUsers()
                break
            case MessageReceiverType.AllUsers:
                userIter = this.userRepo.getAllUsers()
                break
            default:
                throw new Error(`sendMessageToUsers does not handle the receiverType ${MessageReceiverType[receiverType]}`)
        }

        for await (const player of userIter) {
            await this.notificationService.sendCustomMessage(
                player.userInfo.telegramId.toString(), message)
        }

        await this.notificationService.sendMessage(adminGroupId, 
            NotificationMessages.MessageSentToTheUsers)
    }
}

export enum MessageReceiverType {
    AllUsers,
    AllLivingUsers
}