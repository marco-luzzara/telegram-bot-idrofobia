import { mock } from 'jest-mock-extended';
import IUserRepository from '../../../src/model/interfaces/data/IUserRepository';
import { AdminUser, PlayingUser } from '../../../src/model/domain/User'

function createFakeUser(target: PlayingUser): PlayingUser {
    return new PlayingUser(
        {
            findPlayerThatHasTarget: (target: PlayingUser) => Promise.resolve(this),
            update: () => Promise.resolve()
        }, null, target, new Date());
}

test('given a playing user, when he kills the target, his new target is the one of the killed user', () => {
    let futureTargetOfKiller = createFakeUser(null);
    let userToKill = createFakeUser(futureTargetOfKiller)
    let userKiller = createFakeUser(userToKill)

    userKiller.killTarget()

    expect(userKiller.target).toEqual(futureTargetOfKiller)
    expect(userKiller.isWinner()).toBeFalsy()
    expect(userToKill.target).toBeNull()
});

test('given a playing user, when he kills the 2nd-to-last player, he is the winner', () => {
    let userToKill = createFakeUser(null)
    let userKiller = createFakeUser(userToKill)
    userToKill.target = userKiller

    userKiller.killTarget()

    expect(userKiller.isWinner()).toBeTruthy()
    expect(userToKill.target).toBeNull()
});

test('given an admin user, when he manually kills another player, his target is reassigned', async () => {
    let user3 = createFakeUser(null)
    let user2 = createFakeUser(user3)
    let user1 = createFakeUser(user2)
    let mockedUserRepo = mock<IUserRepository>()
    mockedUserRepo.findPlayerThatHasTarget
        .calledWith(user2)
        .mockReturnValueOnce(Promise.resolve(user1))
    let adminUser = new AdminUser(mockedUserRepo)

    await adminUser.killPlayer(user2)

    expect(user2.target).toBeNull()
    expect(user1.target).toEqual(user3)
});