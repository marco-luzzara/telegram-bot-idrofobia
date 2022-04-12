import TelegramId from '../../../model/custom_types/TelegramId'
import { AdminUser } from '../../../model/domain/User'

export default interface IAdminUserRepository {
    /**
     * get the admin user given his telegram Id, or null if it is not admin (or
     * in the data storage)
     * @param telegramId 
     */
    getAdminUserByTelegramId(telegramId: TelegramId): Promise<AdminUser>
}