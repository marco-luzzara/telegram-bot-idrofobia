import { mock, MockProxy } from 'jest-mock-extended';
import IUserRepository from '../../../src/model/interfaces/data/IUserRepository';
import { AdminUser, PlayingUser } from '../../../src/model/domain/User'
import '../../utils/matchers/DateMatcher'

import { setTimeout } from 'timers/promises';

function createFakeUser(target?: PlayingUser, lastKill?: Date): PlayingUser {
    return new PlayingUser(null, target ?? null, lastKill ?? new Date())
}

/**
 * return players stored in a ring data structure. 
 * targets assignment rule is 1 -> 2 -> 3 -> 1 in case of 3 players
 * @param n number of players in the ring
 */
function createRingOfPlayers(n: number): PlayingUser[] {
    const players = [...Array(n).keys()].map(_ => createFakeUser())

    for (let i = 0; i < n; i++)
        players[i].target = players[(i + 1) % n]
    
    return players
}

test('given a playing user, when he kills the target, his new target is the one of the killed user', async () => {
    const players = createRingOfPlayers(3)
    const originalLastKill = players[0].lastKill

    // delay for the lastKill comparison 
    await setTimeout(2)
    players[0].killTarget()

    expect(players[0].target).toEqual(players[2])
    expect(players[0].isWinner()).toBeFalsy()
    expect(players[0].lastKill).toBeAfter(originalLastKill)
    expect(players[1].isDead()).toBeTruthy()
});

test('given a playing user, when he kills the 2nd-to-last player, he is the winner', async () => {
    const players = createRingOfPlayers(2)

    players[0].killTarget()

    expect(players[0].isWinner()).toBeTruthy()
    expect(players[1].isWinner()).toBeFalsy()
});

test('given an admin user, when he manually kills another player, his target is reassigned', async () => {
});