import UserRepository from '../../../src/data/repositories/UserRepository'
import { dbInstance } from '../../../src/data/DbConnectionUtils'
import IUserRepository from '../../../src/data/repositories/interfaces/IUserRepository'
import { generateTelegramIdFromSeed } from '../../utils/factories/TelegramIdFactory'
import { createFakePlayingUserDbObject } from '../../utils/factories/DbUserFactory'
import { seedDbWithRingOfNPlayers } from '../../utils/factories/DbUserFactory'

beforeEach(async () => {
    await dbInstance.sync({ force: true })
});

test('given a telegramId, when getUserByTelegramId, it returns the user associated to that id', async () => {
    await seedDbWithRingOfNPlayers(3)
    const repo: IUserRepository = new UserRepository()

    const player = await repo.getUserByTelegramId(generateTelegramIdFromSeed('user2'))

    expect(player.userInfo.telegramId.toString()).toBe('user2')
});

test('given a telegramId, when getUserByTelegramId and id not exists, it returns null', async () => {
    await seedDbWithRingOfNPlayers(3)
    const repo: IUserRepository = new UserRepository()

    const player = await repo.getUserByTelegramId(generateTelegramIdFromSeed('not_a_user'))

    expect(player).toBeNull()
});

test(`given a telegramId, when getUserByTelegramId and I load many targets,
        then i can traverse them`, async () => 
{
    await seedDbWithRingOfNPlayers(3)
    const repo: IUserRepository = new UserRepository()

    const player = await repo.getUserByTelegramId(generateTelegramIdFromSeed('user1'), 3)

    expect(player.target.target.target.userInfo.telegramId)
        .toEqual(generateTelegramIdFromSeed('user1'))
});

test(`given a telegramId, when getUserByTelegramId and the target is null,
        then it returns null`, async () => 
{
    await createFakePlayingUserDbObject('user1')
    const repo: IUserRepository = new UserRepository()

    const player = await repo.getUserByTelegramId(generateTelegramIdFromSeed('user1'), 2)

    expect(player.target).toBeNull()
});

test(`given a telegramId, when getUserByTelegramId but i have not loaded enough relations,
        then it throws`, async () => 
{
    await seedDbWithRingOfNPlayers(3)
    const repo: IUserRepository = new UserRepository()

    const player = await repo.getUserByTelegramId(generateTelegramIdFromSeed('user1'), 1)

    expect(() => player.target.target.id).toThrow()
});

test('given a set of users, when getAllUsers, return all users', async () => {
    await seedDbWithRingOfNPlayers(3)
    const repo: IUserRepository = new UserRepository()

    const retPlayers = await repo.getAllUsers()

    expect(retPlayers.length).toBe(3)
});

test('given a user with a changed field, when i want to save it, it is persisted on data store', async () => {
    await createFakePlayingUserDbObject('user1')
    const repo: IUserRepository = new UserRepository()
    const user = await repo.getUserByTelegramId(generateTelegramIdFromSeed('user1'))
    
    user.lastKill = new Date(2000, 12, 1)
    await repo.saveExistingUsers(user)

    const updatedUser = await repo.getUserByTelegramId(generateTelegramIdFromSeed('user1'))
    expect(updatedUser.lastKill).toEqual(new Date(2000, 12, 1))
});

test(`given a user with a null target, when i want to reassign the target, 
    it is persisted on data store`, async () => 
{
    await createFakePlayingUserDbObject('user1')
    await createFakePlayingUserDbObject('user2')
    const repo: IUserRepository = new UserRepository()
    const user1 = await repo.getUserByTelegramId(generateTelegramIdFromSeed('user1'), 1)
    const user2 = await repo.getUserByTelegramId(generateTelegramIdFromSeed('user2'))
    
    user1.target = user2
    await repo.saveExistingUsers(user1)

    const updatedUser = await repo.getUserByTelegramId(generateTelegramIdFromSeed('user1'), 1)
    expect(updatedUser.target.id).toBe(user2.id)
});

test(`given a user with a target, when i want to reassign the target to null, 
    it is persisted on data store`, async () => 
{
    await seedDbWithRingOfNPlayers(3)
    const repo: IUserRepository = new UserRepository()
    const user1 = await repo.getUserByTelegramId(generateTelegramIdFromSeed('user1'), 1)
    
    user1.target = null
    await repo.saveExistingUsers(user1)

    const updatedUser = await repo.getUserByTelegramId(generateTelegramIdFromSeed('user1'), 1)
    expect(updatedUser.target).toBeNull()
});

test(`given many users, when i want to update all of them, i save all their data`, async () => 
{
    await seedDbWithRingOfNPlayers(3)
    const repo: IUserRepository = new UserRepository()
    const user1 = await repo.getUserByTelegramId(generateTelegramIdFromSeed('user1'), 1)
    const user2 = user1.target
    
    user1.lastKill = new Date(2001, 10, 2)
    user2.lastKill = new Date(2001, 10, 3)
    await repo.saveExistingUsers(user1, user2)

    const updatedUser1 = await repo.getUserByTelegramId(generateTelegramIdFromSeed('user1'))
    const updatedUser2 = await repo.getUserByTelegramId(generateTelegramIdFromSeed('user2'))
    expect(updatedUser1.lastKill).toEqual(new Date(2001, 10, 2))
    expect(updatedUser2.lastKill).toEqual(new Date(2001, 10, 3))
});