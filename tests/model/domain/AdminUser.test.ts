import timespan from "timespan"
import { setTimeout } from 'timers/promises';

import AdminUser from '../../../src/model/domain/AdminUser'
import PlayingUser from '../../../src/model/domain/PlayingUser'
import '../../utils/matchers/DateMatcher'
import UserInfo from "../../../src/model/custom_types/UserInfo";
import { generateTelegramIdFromSeed } from '../../utils/factories/TelegramIdFactory'
import { generateKillCodeFromSeed } from '../../utils/factories/KillCodeFactory'
import { createFakeUser, createRingOfPlayers } from '../../utils/factories/DomainPlayingUserFactory';

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