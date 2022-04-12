import { dbInstance } from '../../src/data/DbConnectionUtils'
import { seedDbWithRingOfNPlayers } from '../utils/factories/DbUserFactory'
import IUserRepository from '../../src/data/repositories/interfaces/IUserRepository'
import UserRepository from '../../src/data/repositories/UserRepository'
import UserService from '../../src/services/UserService'
import { generateKillCodeFromSeed } from '../utils/factories/KillCodeFactory'
import { createFakeAdminUserDbObject } from '../utils/factories/DbAdminUserFactory'
import IAdminUserRepository from '../../src/data/repositories/interfaces/IAdminUserRepository'
import AdminUserRepository from '../../src/data/repositories/AdminUserRepository'
import AdminUserService from '../../src/services/AdminUserService'
import { generateTelegramIdFromSeed } from '../utils/factories/TelegramIdFactory'
import UnauthorizedError from '../../src/services/errors/UnauthorizedError'

beforeEach(async () => {
    await dbInstance.sync({ force: true })
});

test(`given a playing user, when he tries to kill the target as an admin, 
    it receives an authorization error`, async () => 
{
    await seedDbWithRingOfNPlayers(2)
    await createFakeAdminUserDbObject('a0')
    const userRepo: IUserRepository = new UserRepository()
    const adminRepo: IAdminUserRepository = new AdminUserRepository()
    const service = new AdminUserService(userRepo, adminRepo)

    await expect(service.killUserTarget(
        generateTelegramIdFromSeed('user0').toString(), 
        generateTelegramIdFromSeed('user0').toString())).rejects.toThrowError(UnauthorizedError)
});

