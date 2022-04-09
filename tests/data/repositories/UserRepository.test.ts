import { PlayingUserModel, UserModel } from '../../../src/data/model/UserModel'
import UserRepository from '../../../src/data/repositories/UserRepository'
import { dbInstance } from '../../../src/data/DbConnectionUtils'
import IUserRepository from '../../../src/model/interfaces/data/IUserRepository'
import TelegramId from '../../../src/model/custom_types/TelegramId'

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
                telegramId: seed,
                lastKill: new Date(),
                profilePictureUrl: "http://myphoto.com"
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

test('test for update, TODO: reload necessary?', async () => {
    await seedDbWithRingOf3Players()
    const repo: IUserRepository = new UserRepository()
    const playingUserModel = await repo.getByTelegramId(new TelegramId('user2'), 2)
    const playingUser = playingUserModel.getPlayingUser(2)
    const killedUser = playingUser.target
    playingUser.killTarget()

    await playingUserModel.targetUser.updateFromPlayingUser(killedUser)
    // for some reason the foreignkey is still accessible without a reload
    await playingUserModel.targetUser.reload()
    await playingUserModel.updateFromPlayingUser(playingUser)
    await playingUserModel.reload()

    expect(playingUserModel.targetUser.telegramId).toBe('user1')
    expect(await (await repo.getByTelegramId(new TelegramId('user3'))).getTargetUser()).toBeNull()
});

test('given a telegramId, when getByTelegramId, it returns the user associated to that id', async () => {
    const players = await seedDbWithRingOf3Players()
    const repo: IUserRepository = new UserRepository()

    const player = await repo.getByTelegramId(new TelegramId('user2'))

    expect(player.telegramId).toBe(players[1].telegramId)
});

test('given a telegramId, when getByTelegramId and id not exists, it returns null', async () => {
    const players = await seedDbWithRingOf3Players()
    const repo: IUserRepository = new UserRepository()

    const player = await repo.getByTelegramId(new TelegramId('user10'))

    expect(player).toBeNull()
});