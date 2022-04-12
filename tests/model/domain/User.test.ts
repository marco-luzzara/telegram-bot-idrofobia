import timespan from "timespan"
import { setTimeout } from 'timers/promises';

import { mock, MockProxy } from 'jest-mock-extended';
import { AdminUser, PlayingUser } from '../../../src/model/domain/User'
import '../../utils/matchers/DateMatcher'
import UserInfo from "../../../src/model/custom_types/UserInfo";
import { generateTelegramIdFromSeed } from '../../utils/factories/TelegramIdFactory'
import { generateKillCodeFromSeed } from '../../utils/factories/KillCodeFactory'

function createFakeUserInfo(seed: number): UserInfo {
    return new UserInfo(null, null, null, new URL("http://me.png"), 
        generateTelegramIdFromSeed(seed), 
        generateKillCodeFromSeed(seed))
}

function createFakeUser(
    playingUserInfo: {seed: number; target?: PlayingUser; lastKill?: Date}): PlayingUser 
{
    return new PlayingUser(createFakeUserInfo(playingUserInfo.seed), 
        playingUserInfo.target ?? null, 
        playingUserInfo.lastKill ?? new Date())
}

/**
 * return players stored in a ring data structure. 
 * targets assignment rule is 1 -> 2 -> 3 -> 1 in case of 3 players
 * @param n number of players in the ring
 */
function createRingOfPlayers(n: number): PlayingUser[] {
    const players = [...Array(n).keys()].map(i => createFakeUser({seed: i}))

    for (let i = 0; i < n; i++) {
        players[i].target = players[(i + 1) % n]
        players[i].id = i
    }
    
    return players
}

test(`given a playing user, when he kills the target with the correct code, 
        his new target is the one of the killed user`, async () => {
    const players = createRingOfPlayers(3)
    const originalLastKill = players[0].lastKill

    // delay for the lastKill comparison 
    await setTimeout(2)
    const isTargetKilled = players[0].killTarget(generateKillCodeFromSeed(1))

    expect(isTargetKilled).toBeTruthy()
    expect(players[0].target).toEqual(players[2])
    expect(players[0].lastKill).toBeAfter(originalLastKill)
    expect(players[1].isDead()).toBeTruthy()
});

test(`given a playing user, when he tries to kill the target with the wrong code, 
        the target is not killed`, async () => {
    const players = createRingOfPlayers(3)
    const originalLastKill = players[0].lastKill

    // delay for the lastKill comparison 
    await setTimeout(2)
    const isTargetKilled = players[0].killTarget(generateKillCodeFromSeed(0))

    expect(isTargetKilled).toBeFalsy()
    expect(players[0].target).toEqual(players[1])
    expect(players[0].lastKill).toEqual(originalLastKill)
    expect(players[1].isDead()).toBeFalsy()
});

test('given a playing user, when he kills the 2nd-to-last player, he is the winner', () => {
    const players = createRingOfPlayers(2)

    const isTargetKilled = players[0].killTarget(generateKillCodeFromSeed(1))

    expect(isTargetKilled).toBeTruthy()
    expect(players[0].isWinner()).toBeTruthy()
    expect(players[1].isWinner()).toBeFalsy()
});

test(`given a playing user, when he is the winner and inserts his own killcode,
    it throws because suicide is not allowed`, () => 
{
    const players = createRingOfPlayers(1)

    expect(() => players[0].killTarget(generateKillCodeFromSeed(0))).toThrow()
});

test('given a playing user that is idle, when isIdle, return true', () => {
    const user = createFakeUser({seed: 1, lastKill: new Date(2020, 1, 1, 12, 0, 0, 0)})

    const isIdle = user.isIdle(
        new Date(2020, 1, 1, 13, 0, 0, 0), 
        new timespan.TimeSpan(0, 0, 30, 0))

    expect(isIdle).toBeTruthy()
})

test('given a playing user that is not idle, when isIdle, return false', () => {
    const user = createFakeUser({seed: 1, lastKill: new Date(2020, 1, 1, 12, 0, 0, 0)})

    const isIdle = user.isIdle(
        new Date(2020, 1, 1, 13, 0, 0, 0), 
        new timespan.TimeSpan(0, 0, 30, 1))

    expect(isIdle).toBeFalsy()
})

test('given an admin user, when he manually kills another player target, his target is reassigned', async () => {
    const players = createRingOfPlayers(3)
    const admin = new AdminUser()
    const originalLastKill = players[0].lastKill

    await setTimeout(2)
    admin.killPlayerTarget(players[0])

    expect(players[0].target).toEqual(players[2])
    expect(players[0].lastKill).toBeAfter(originalLastKill)
    expect(players[1].isDead()).toBeTruthy()
});

test('given an admin user, when he kills idle players and any is idle, return the players as they are', () => {
    const players = createRingOfPlayers(3)
    const admin = new AdminUser()

    admin.killIdlePlayers(players, new timespan.TimeSpan(0, 0, 0, 10))

    expect(players.map(p => p.isDead())).not.toContain(true)
    expect(players[0].target).toEqual(players[1])
    expect(players[1].target).toEqual(players[2])
    expect(players[2].target).toEqual(players[0])
})

test('given an admin user, when he kills idle players and one is idle, reassign target', () => {
    const players = createRingOfPlayers(3)
    players[0].lastKill = new Date(2020, 1, 1)
    const admin = new AdminUser()

    admin.killIdlePlayers(players, new timespan.TimeSpan(0, 0, 0, 10))

    expect(players[0].isDead()).toBeTruthy()
    expect(players[1].isDead() || players[2].isDead()).toBeFalsy()
    expect(players[1].target).toEqual(players[2])
    expect(players[2].target).toEqual(players[1])
})

test('given an admin user, when he kills idle players and consecutives ones are idle, reassign target', () => {
    const players = createRingOfPlayers(4)
    players[1].lastKill = new Date(2020, 1, 1)
    players[2].lastKill = new Date(2020, 1, 1)
    const admin = new AdminUser()

    admin.killIdlePlayers(players, new timespan.TimeSpan(0, 0, 0, 10))

    expect(players[1].isDead() && players[2].isDead()).toBeTruthy()
    expect(players[0].isDead() || players[3].isDead()).toBeFalsy()
    expect(players[0].target).toEqual(players[3])
    expect(players[3].target).toEqual(players[0])
})

test('given an admin user, when he kills idle players and multiple ones are idle, reassign target', () => {
    const players = createRingOfPlayers(4)
    players[1].lastKill = new Date(2020, 1, 1)
    players[3].lastKill = new Date(2020, 1, 1)
    const admin = new AdminUser()

    admin.killIdlePlayers(players, new timespan.TimeSpan(0, 0, 0, 10))

    expect(players[1].isDead() && players[3].isDead()).toBeTruthy()
    expect(players[0].isDead() || players[2].isDead()).toBeFalsy()
    expect(players[0].target).toEqual(players[2])
    expect(players[2].target).toEqual(players[0])
})

test('given an admin user, when he kills idle players and all but one are idles, the last one is the winner', () => {
    const players = createRingOfPlayers(3)
    players[0].lastKill = new Date(2020, 1, 1)
    players[2].lastKill = new Date(2020, 1, 1)
    const admin = new AdminUser()

    admin.killIdlePlayers(players, new timespan.TimeSpan(0, 0, 0, 10))

    expect(players[0].isDead() && players[2].isDead()).toBeTruthy()
    expect(players[1].isWinner()).toBeTruthy()
})

test('given an admin user, when he starts the game, the targets and lastKill are assigned', () => {
    const player1 = createFakeUser({seed: 1, lastKill: new Date(2020, 1, 1, 12, 0, 0, 0)})
    const player2 = createFakeUser({seed: 2, lastKill: new Date(2020, 1, 1, 12, 0, 0, 0)})
    const player3 = createFakeUser({seed: 3, lastKill: new Date(2020, 1, 1, 12, 0, 0, 0)})
    const admin = new AdminUser()

    admin.startGame((function* () { yield player1; yield player2; yield player3; })())

    expect([player1, player2, player3]).not.toContain(null)
    expect(player1.target).toEqual(player2)
    expect(player2.target).toEqual(player3)
    expect(player3.target).toEqual(player1)
    expect(player1.lastKill).not.toBeNull()
    expect(player2.lastKill).not.toBeNull()
    expect(player3.lastKill).not.toBeNull()
})
