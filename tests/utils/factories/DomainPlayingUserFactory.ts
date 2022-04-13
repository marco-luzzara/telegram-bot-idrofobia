import UserInfo from "../../../src/model/custom_types/UserInfo";
import PlayingUser from "../../../src/model/domain/PlayingUser";
import { generateKillCodeFromSeed } from "./KillCodeFactory";
import { generateTelegramIdFromSeed } from "./TelegramIdFactory";

export function createFakeUserInfo(seed: number): UserInfo {
    return new UserInfo(null, null, null, new URL("http://me.png"), 
        generateTelegramIdFromSeed(seed), 
        generateKillCodeFromSeed(seed))
}

export function createFakeUser(
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
export function createRingOfPlayers(n: number): PlayingUser[] {
    const players = [...Array(n).keys()].map(i => createFakeUser({seed: i}))

    for (let i = 0; i < n; i++) {
        players[i].target = players[(i + 1) % n]
        players[i].id = i
    }
    
    return players
}