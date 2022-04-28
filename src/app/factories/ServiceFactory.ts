import { Context } from "telegraf"
import UserRepository from "../../data/repositories/UserRepository"
import UserService from "../../services/UserService"
import AdminUserService from '../../services/AdminUserService'
import TelegramNotificationService from '../../services/notification/TelegramNotificationService';
import RedisUsernameMapping from '../../services/mapping/RedisUsernameMapping'

export function getUserService(ctx: Context) {
    const userRepo = new UserRepository()
    const usernameMappingService = new RedisUsernameMapping()
    const notificationService = new TelegramNotificationService(ctx, usernameMappingService)

    return new UserService(userRepo, notificationService)
}

export function getAdminUserService(ctx: Context) {
    const userRepo = new UserRepository()
    const usernameMappingService = new RedisUsernameMapping()
    const notificationService = new TelegramNotificationService(ctx, usernameMappingService)

    return new AdminUserService(userRepo, notificationService)
}