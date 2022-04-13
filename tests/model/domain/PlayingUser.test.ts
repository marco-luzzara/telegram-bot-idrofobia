import timespan from "timespan"
import { setTimeout } from 'timers/promises';

import { mock, MockProxy } from 'jest-mock-extended';
import PlayingUser from '../../../src/model/domain/PlayingUser'
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
