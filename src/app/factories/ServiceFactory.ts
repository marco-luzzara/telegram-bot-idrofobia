import { Context } from "telegraf"
import UserRepository from "../../data/repositories/UserRepository"
import UserService from "../../services/UserService"
import AdminUserService from '../../services/AdminUserService'
import TelegramNotificationService from '../../services/notification/TelegramNotificationService';

export function getUserService(ctx: Context) {
    const userRepo = new UserRepository()
    const notificationService = new TelegramNotificationService(ctx)

    return new UserService(userRepo, notificationService)
}

export function getAdminUserService(ctx: Context) {
    const userRepo = new UserRepository()
    const notificationService = new TelegramNotificationService(ctx)

    return new AdminUserService(userRepo, notificationService)
}