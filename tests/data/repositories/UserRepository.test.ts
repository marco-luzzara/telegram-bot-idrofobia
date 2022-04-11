import { PlayingUserModel, UserModel } from '../../../src/data/model/UserModel'
import UserRepository from '../../../src/data/repositories/UserRepository'
import { dbInstance } from '../../../src/data/DbConnectionUtils'
import IUserRepository from '../../../src/data/repositories/interfaces/IUserRepository'
import { generateTelegramIdFromSeed } from '../../utils/factories/TelegramIdFactory'
import { generateKillCodeFromSeed } from '../../utils/factories/KillCodeFactory'

beforeEach(async () => {
    await dbInstance.sync({ force: true })
});

async function createFakePlayingUserDbObject(seed: string): Promise<PlayingUserModel> {
    const user = await UserModel.create(
            {
                name: seed,
                surname: seed,
                address: seed
            }
        )
    const playingUser = await PlayingUserModel.create(
            {
                id: user.id,
                telegramId: generateTelegramIdFromSeed(seed).toString(),
                lastKill: new Date(),
                profilePictureUrl: "http://myphoto.com",
                killCode: generateKillCodeFromSeed(seed).toString()
            }
        )

    return playingUser
}

async function seedDbWithRingOf3Players(): Promise<PlayingUserModel[]> {
    const playingUser1 = await createFakePlayingUserDbObject('user1')
    const playingUser2 = await createFakePlayingUserDbObject('user2')
    const playingUser3 = await createFakePlayingUserDbObject('user3')

    await playingUser1.setTargetUser(playingUser2)
    await playingUser2.setTargetUser(playingUser3)
    await playingUser3.setTargetUser(playingUser1)

    return [playingUser1, playingUser2, playingUser3]
}

// test('test for update, TODO: reload necessary?', async () => {
//     await seedDbWithRingOf3Players()
//     const repo: IUserRepository = new UserRepository()
//     const playingUserModel = await repo.getByTelegramId(new TelegramId('user2'), 2)
//     const playingUser = playingUserModel.getPlayingUser(2)
//     const killedUser = playingUser.target
//     playingUser.killTarget()

//     await playingUserModel.targetUser.updateFromPlayingUser(killedUser)
//     // for some reason the foreignkey is still accessible without a reload
//     await playingUserModel.targetUser.reload()
//     await playingUserModel.updateFromPlayingUser(playingUser)
//     await playingUserModel.reload()

//     expect(playingUserModel.targetUser.telegramId).toBe('user1')
//     expect(await (await repo.getByTelegramId(new TelegramId('user3'))).getTargetUser()).toBeNull()
// });

test('given a telegramId, when getUserByTelegramId, it returns the user associated to that id', async () => {
    await seedDbWithRingOf3Players()
    const repo: IUserRepository = new UserRepository()

    const player = await repo.getUserByTelegramId(generateTelegramIdFromSeed('user2'))

    expect(player.userInfo.telegramId.toString()).toBe('user2')
});

test('given a telegramId, when getUserByTelegramId and id not exists, it returns null', async () => {
    await seedDbWithRingOf3Players()
    const repo: IUserRepository = new UserRepository()

    const player = await repo.getUserByTelegramId(generateTelegramIdFromSeed('not_a_user'))

    expect(player).toBeNull()
});

test(`given a telegramId, when getUserByTelegramId and I load many targets,
        then i can traverse them`, async () => 
{
    await seedDbWithRingOf3Players()
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
    await seedDbWithRingOf3Players()
    const repo: IUserRepository = new UserRepository()

    const player = await repo.getUserByTelegramId(generateTelegramIdFromSeed('user1'), 1)

    expect(() => player.target.target.id).toThrow()
});

test('given a set of users, when getAllUsers, return all users', async () => {
    await seedDbWithRingOf3Players()
    const repo: IUserRepository = new UserRepository()

    const retPlayers = await repo.getAllUsers()

    expect(retPlayers.length).toBe(3)
});

test('given a user with a changed field, when i want to save it, it is persisted on data store', async () => {
    await createFakePlayingUserDbObject('user1')
    const repo: IUserRepository = new UserRepository()
    const user = await repo.getUserByTelegramId(generateTelegramIdFromSeed('user1'))
    user.lastKill = new Date(2000, 12, 1)

    await repo.saveExistingUser(user)

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

    await repo.saveExistingUser(user1)

    const updatedUser = await repo.getUserByTelegramId(generateTelegramIdFromSeed('user1'), 1)
    expect(updatedUser.target.id).toBe(user2.id)
});

test(`given a user with a target, when i want to reassign the target to null, 
    it is persisted on data store`, async () => 
{
    await seedDbWithRingOf3Players()
    const repo: IUserRepository = new UserRepository()
    const user1 = await repo.getUserByTelegramId(generateTelegramIdFromSeed('user1'), 1)
    user1.target = null

    await repo.saveExistingUser(user1)

    const updatedUser = await repo.getUserByTelegramId(generateTelegramIdFromSeed('user1'), 1)
    expect(updatedUser.target).toBeNull()
});