import AdminUser from '../../model/domain/AdminUser'
import AdminUserModel from '../model/AdminUserModel'
import TelegramId from '../../model/custom_types/TelegramId';
import IAdminUserRepository from './interfaces/IAdminUserRepository';

export default class AdminUserRepository implements IAdminUserRepository {
    async getAdminUserByTelegramId(telegramId: TelegramId): Promise<AdminUser> {
        const adminUser = await AdminUserModel.findByPk(telegramId.toString())

        return adminUser?.getAdminUser() ?? null;
    }
}