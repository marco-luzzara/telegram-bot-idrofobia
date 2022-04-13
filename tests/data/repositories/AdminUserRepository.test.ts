import { dbInstance } from '../../../src/data/DbConnection'
import { generateTelegramIdFromSeed } from '../../utils/factories/TelegramIdFactory'
import { createFakeAdminUserDbObject } from '../../utils/factories/DbAdminUserFactory'
import AdminUserRepository from '../../../src/data/repositories/AdminUserRepository'
import IAdminUserRepository from '../../../src/data/repositories/interfaces/IAdminUserRepository'

beforeEach(async () => {
    await dbInstance.sync({ force: true })
});

test('given a telegramId, when getAdminUserByTelegramId, it returns the admin associated to that id', async () => {
    await createFakeAdminUserDbObject('admin0')
    const repo: IAdminUserRepository = new AdminUserRepository()

    const admin = await repo.getAdminUserByTelegramId(generateTelegramIdFromSeed('admin0'))

    expect(admin).not.toBeNull()
});

test(`given a not existing telegramId, when getAdminUserByTelegramId,
    it returns null`, async () => 
{
    await createFakeAdminUserDbObject('admin0')
    const repo: IAdminUserRepository = new AdminUserRepository()

    const admin = await repo.getAdminUserByTelegramId(generateTelegramIdFromSeed('no_admin'))

    expect(admin).toBeNull()
});