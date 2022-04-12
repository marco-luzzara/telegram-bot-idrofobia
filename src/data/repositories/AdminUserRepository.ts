import { AdminUser, PlayingUser } from '../../model/domain/User'
import AdminUserModel from '../model/AdminUserModel'
import TelegramId from '../../model/custom_types/TelegramId';
import { Includeable } from 'sequelize/types';
import { dbInstance } from '../DbConnectionUtils';
import IAdminUserRepository from './interfaces/IAdminUserRepository';
import IUserRepository from './interfaces/IUserRepository';

export default class AdminUserRepository implements IAdminUserRepository {
    async getAdminUserByTelegramId(telegramId: TelegramId): Promise<AdminUser> {
        const adminUser = await AdminUserModel.findByPk(telegramId.toString())

        return adminUser?.getAdminUser() ?? null;
    }
}