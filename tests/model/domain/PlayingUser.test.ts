import timespan from "timespan"
import { setTimeout } from 'timers/promises';

import { mock, MockProxy } from 'jest-mock-extended';
import PlayingUser, { KillTargetResult } from '../../../src/model/domain/PlayingUser'
import '../../utils/matchers/DateMatcher'
import UserInfo from "../../../src/model/custom_types/UserInfo";
import { generateTelegramIdFromSeed } from '../../utils/factories/TelegramIdFactory'
import { generateKillCodeFromSeed } from '../../utils/factories/KillCodeFactory'
import { createRingOfPlayers, createFakeUser } from "../../utils/factories/DomainPlayingUserFactory";

test(`given a playing user, when he kills the target with the correct code, 
        his new target is the one of the killed user`, async () => {
    const players = createRingOfPlayers(3)
    const originalLastKill = players[0].lastKill

    // delay for the lastKill comparison 
    await setTimeout(2)
    const targetKilledResult = players[0].killTarget(generateKillCodeFromSeed(1))

    expect(targetKilledResult).toBe(KillTargetResult.KillTargetSuccessful)
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
    const targetKilledResult = players[0].killTarget(generateKillCodeFromSeed(0))

    expect(targetKilledResult).toBe(KillTargetResult.WrongKillCode)
    expect(players[0].target).toEqual(players[1])
    expect(players[0].lastKill).toEqual(originalLastKill)
    expect(players[1].isDead()).toBeFalsy()
});

test(`given a winning user, when he tries to kill the target, 
        he cannot because he is the winner`, async () => {
    const players = createRingOfPlayers(1)

    const targetKilledResult = players[0].killTarget(generateKillCodeFromSeed(0))

    expect(targetKilledResult).toBe(KillTargetResult.WinnerCannotKill)
    expect(players[0].isWinner()).toBeTruthy()
    expect(players[0].isDead()).toBeFalsy()
});

test(`given a dead user, when he tries to kill the target, 
        he cannot because he does not have any target`, async () => {
    const players = createRingOfPlayers(2)
    players[0].killTarget(generateKillCodeFromSeed(1))

    const targetKilledResult = players[1].killTarget(generateKillCodeFromSeed(100)) // the killcode does not matter

    expect(targetKilledResult).toBe(KillTargetResult.DeadUserCannotKill)
    expect(players[1].isDead()).toBeTruthy()
});

test('given a playing user, when he kills the 2nd-to-last player, he is the winner', () => {
    const players = createRingOfPlayers(2)

    const targetKilledResult = players[0].killTarget(generateKillCodeFromSeed(1))

    expect(targetKilledResult).toBe(KillTargetResult.KillTargetSuccessful)
    expect(players[0].isWinner()).toBeTruthy()
    expect(players[1].isWinner()).toBeFalsy()
    expect(players[1].isDead()).toBeTruthy()
});

test('given a playing user that is idle, when isIdle, return true', () => {
    const target = createFakeUser({seed: 0})
    const user = createFakeUser({seed: 1, lastKill: new Date(2020, 1, 1, 12, 0, 0, 0), target})

    const isIdle = user.isIdle(
        new Date(2020, 1, 1, 13, 0, 0, 0), 
        new timespan.TimeSpan(0, 0, 30, 0))

    expect(isIdle).toBeTruthy()
})

test('given a playing user that is not idle, when isIdle, return false', () => {
    const target = createFakeUser({seed: 0})
    const user = createFakeUser({seed: 1, lastKill: new Date(2020, 1, 1, 12, 0, 0, 0), target})

    const isIdle = user.isIdle(
        new Date(2020, 1, 1, 13, 0, 0, 0), 
        new timespan.TimeSpan(0, 0, 30, 1))

    expect(isIdle).toBeFalsy()
})
