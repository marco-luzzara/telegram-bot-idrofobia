import AdminUserModel from '../../../src/data/model/AdminUserModel'
import { generateTelegramIdFromSeed } from './TelegramIdFactory'

export async function createFakeAdminUserDbObject(seed: string): Promise<AdminUserModel> {
    const adminUser = await AdminUserModel.create(
            {
                telegramId: generateTelegramIdFromSeed(seed).toString(),
                name: seed,
                surname: seed
            }
        )

    return adminUser
}