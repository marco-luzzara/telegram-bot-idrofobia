import { mock, MockProxy } from 'jest-mock-extended';
import IUserRepository from '../../../src/model/interfaces/data/IUserRepository';
import { AdminUser, PlayingUser } from '../../../src/model/domain/User'

function createFakeUser(id: number, target: number, repo: IUserRepository): PlayingUser {
    const player = new PlayingUser(repo, null, target, new Date());
    player.id = id

    return player
}

/**
 * create a stub repo with players stored in a ring data structure. 
 * targets assignment rule is 1 -> 2 -> 3 -> 1 in case of 3 players
 * @param n number of players
 */
function createMockedRingOfPlayers(n: number, 
        mockedRepo: MockProxy<IUserRepository>): PlayingUser[] {
    const players = [...Array(n).keys()].map(i => createFakeUser(i, (i + 1) % n, mockedRepo))

    for (let p of players) {
        mockedRepo.getById.calledWith(p.id).mockResolvedValue(p)
        mockedRepo.findPlayerThatHasTarget.calledWith(p.id)
            .mockResolvedValue(players[(n - 1 + p.id) % n])
    }
    
    return players
}

test('given a playing user, when he kills the target, his new target is the one of the killed user', async () => {
    const mockedRepo = mock<IUserRepository>()
    const players = createMockedRingOfPlayers(3, mockedRepo)

    await players[0].killTarget()

    expect(players[0].target).toEqual(players[2].id)
    expect(players[0].isWinner()).toBeFalsy()
    expect(players[1].target).toBeNull()
});

test('given a playing user, when he kills the 2nd-to-last player, he is the winner', async () => {
    const mockedRepo = mock<IUserRepository>()
    const players = createMockedRingOfPlayers(2, mockedRepo)

    await players[0].killTarget()

    expect(players[0].isWinner()).toBeTruthy()
    expect(players[1].isWinner()).toBeFalsy()
});

test('given an admin user, when he manually kills another player, his target is reassigned', async () => {
    // let user3 = createFakeUser(null)
    // let user2 = createFakeUser(user3)
    // let user1 = createFakeUser(user2)
    // let mockedUserRepo = mock<IUserRepository>()
    // mockedUserRepo.findPlayerThatHasTarget
    //     .calledWith(user2)
    //     .mockReturnValueOnce(Promise.resolve(user1))
    // let adminUser = new AdminUser(mockedUserRepo)

    // await adminUser.killPlayer(user2)

    // expect(user2.target).toBeNull()
    // expect(user1.target).toEqual(user3)
});