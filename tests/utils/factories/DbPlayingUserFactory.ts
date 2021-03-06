import { PlayingUserModel, UserModel } from '../../../src/data/model/UserModel'
import { generateTelegramIdFromSeed } from './TelegramIdFactory'
import { generateKillCodeFromSeed } from './KillCodeFactory'

export async function createFakePlayingUserDbObject(seed: string): Promise<PlayingUserModel> {
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
                lastKill: null,
                profilePictureUrl: `http://myphoto-${seed}.com/`,
                killCode: generateKillCodeFromSeed(seed).toString()
            }
        )

    return playingUser
}

export async function seedDbWithRingOfNPlayers(numPlayers: number): Promise<PlayingUserModel[]> {
    const players: PlayingUserModel[] = []
    for (let i in [...Array(numPlayers)]) {
        // i am not using map to avoid the parallel requests to db
        players.push(await createFakePlayingUserDbObject('user' + i))
    }

    for (let i = 0; i < numPlayers; i++) {
        await players[i].update({ lastKill: new Date() })
        await players[i].setTargetUser(players[(i + 1) % numPlayers])
    }

    return players
}