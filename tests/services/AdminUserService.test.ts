import { dbInstance } from '../../src/data/DbConnection'
import { seedDbWithRingOfNPlayers } from '../utils/factories/DbPlayingUserFactory'
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

test(`given an admin user, when he kills the target manually, 
    the target is killed and reassigned`, async () => 
{
    await seedDbWithRingOfNPlayers(3)
    await createFakeAdminUserDbObject('a0')
    const userTelegramId = generateTelegramIdFromSeed('user0')
    const userRepo: IUserRepository = new UserRepository()
    const adminRepo: IAdminUserRepository = new AdminUserRepository()
    const service = new AdminUserService(userRepo, adminRepo)

    await service.killUserTarget(
        generateTelegramIdFromSeed('a0').toString(), 
        userTelegramId.toString())

    const user = await userRepo.getUserByTelegramId(userTelegramId, 1)
    expect(user.target.userInfo.telegramId).toEqual(generateTelegramIdFromSeed('user2'))
    const userKilled = await userRepo.getUserByTelegramId(generateTelegramIdFromSeed('user1'), 1)
    expect(userKilled.isDead()).toBeTruthy()
});

// test(`given an admin user, when he kills the winner manually, 
//     nothing happens`, async () => 
// {
//     await seedDbWithRingOfNPlayers(1)
//     await createFakeAdminUserDbObject('a0')
//     const userTelegramId = generateTelegramIdFromSeed('user0')
//     const userRepo: IUserRepository = new UserRepository()
//     const adminRepo: IAdminUserRepository = new AdminUserRepository()
//     const service = new AdminUserService(userRepo, adminRepo)

//     await service.killUserTarget(
//         generateTelegramIdFromSeed('a0').toString(), 
//         userTelegramId.toString())

//     const user = await userRepo.getUserByTelegramId(userTelegramId, 1)
//     expect(user.target.userInfo.telegramId).toEqual(generateTelegramIdFromSeed('user2'))
//     const userKilled = await userRepo.getUserByTelegramId(generateTelegramIdFromSeed('user1'), 1)
//     expect(userKilled.isDead()).toBeTruthy()
// });

