import { PlayingUser } from '../../../src/model/domain/User'
import { PlayingUserModel, UserModel } from '../../../src/data/model/UserModel'
import UserRepository from '../../../src/data/repositories/UserRepository'
import { dbInstance } from '../../../src/data/DbConnectionUtils'

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
                lastKill: new Date()
            }
        )

    return playingUser
}

async function seedDbWithRingOf3Players(): Promise<PlayingUserModel[]> {
    const playingUser1 = await createFakePlayingUserDbObject('user1')
    const playingUser2 = await createFakePlayingUserDbObject('user2')
    const playingUser3 = await createFakePlayingUserDbObject('user3')

    await playingUser1.setTarget(playingUser2)
    await playingUser2.setTarget(playingUser3)
    await playingUser3.setTarget(playingUser1)

    return [playingUser1, playingUser2, playingUser3]
}

test('findPlayerThatHasTarget should return the player that has the specified target', async () => {
    const players = await seedDbWithRingOf3Players()
    const repo = new UserRepository()

    // await repo.findPlayerThatHasTarget(players[])
});