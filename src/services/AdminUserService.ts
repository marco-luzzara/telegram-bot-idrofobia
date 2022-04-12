import TelegramId from '../model/custom_types/TelegramId';
import IUserRepository from '../data/repositories/interfaces/IUserRepository'
import KillCode from '../model/custom_types/KillCode';
import { DeadUserStatus, PlayingUserStatus, WinningUserStatus } from './dto/UserStatus'
import { PlayingUser } from '../model/domain/User';
import IAdminUserRepository from '../data/repositories/interfaces/IAdminUserRepository';

import * as timespan from "timespan"
import UnauthorizedError from './errors/UnauthorizedError';

/**
 * Note: `AdminUserService` returns a `Proxy` instance that takes care of 
 * the requests that needs authorization. The assumptions are:
 * - the methods to authorize should be added to `authorizedMethods`
 * - the first argument of a method to authorize is the telegramId
 */
export default class AdminUserService {
    private readonly userRepo: IUserRepository
    private readonly adminRepo: IAdminUserRepository
    private readonly authorizedMethods = [
        this.startGame,
        this.killUserTarget,
        this.killIdlePlayers
    ].map(f => f.name)

    constructor(userRepo: IUserRepository, adminRepo: IAdminUserRepository) {
        this.userRepo = userRepo
        this.adminRepo = adminRepo
        const thisService = this

        for (const authorizedMethod of this.authorizedMethods) {
            this[authorizedMethod] = new Proxy(this[authorizedMethod], {
                    apply: async function(target: any, thisArg, argumentsList) {
                        // I am assuming the first parameter is the telegram id of the caller
                        const adminTelegramId = new TelegramId(argumentsList[0])
                        const adminUser = await thisService.adminRepo.getAdminUserByTelegramId(adminTelegramId)
                        if (adminUser === null)
                            throw new UnauthorizedError(adminTelegramId.toString(), 'Admin')
        
                        return target(...argumentsList)
                    }
                })
        }
    }

    async startGame(adminTelegramId: string): Promise<void> {

    }

    async killUserTarget(adminTelegramId: string, userTelegramId: string): Promise<void> {
    }

    async killIdlePlayers(adminTelegramId: string, idleTimeSpan: timespan.TimeSpan): Promise<void> {

    }
}