import * as timespan from "timespan"
import { strict as assert } from 'assert';

import TelegramId from "../custom_types/TelegramId"
import UserInfo from "../custom_types/UserInfo"
import IUserRepository from "../interfaces/data/IUserRepository"

export class User {
    readonly userInfo: UserInfo

    constructor(userInfo: UserInfo) {
        this.userInfo = userInfo
    }
}

export class PlayingUser extends User {
    id: number
    target: PlayingUser
    lastKill: Date

    constructor(
        userInfo: UserInfo, 
        target: PlayingUser, 
        lastKill: Date) 
    {
        super(userInfo)
        this.target = target
        this.lastKill = lastKill
    }

    killTarget(): void {
        assert(this.isPlaying(), 'The game has not been started yet')
        assert(!this.isWinner(), 'There is no other player to kill but yourself')
        assert(!this.isDead(), 'A dead player cannot kill anyone')

        const killedUser = this.target
        const killedUserTarget = killedUser.target

        killedUser.target = null
        this.target = killedUserTarget

        this.lastKill = new Date()
    }

    isIdle(now: Date, idleTimeSpan: timespan.TimeSpan): boolean {
        assert(this.isPlaying(), `player ${this.id} cannot be idle if it is not playing`)

        const playerIdleTime = timespan.fromDates(this.lastKill, now)
        return playerIdleTime.totalSeconds() > idleTimeSpan.totalSeconds()
    }

    isWinner(): boolean {
        return this.target === this
    }

    isDead(): boolean {
        return this.target === null
    }

    isPlaying(): boolean {
        return this.lastKill !== null
    }
}

export class AdminUser {
    /**
     * Start (or restart) the game by assigning targets until they form a ring.
     * lastKill fields are assigned as the current timestamp
     * @param players 
     */
    startGame(players: Iterable<PlayingUser>): void {
        this.createRing(players, true)
    }

    /**
     * kill the player that is the target of `player`
     * @param player the player whose target must be killed
     */
    killPlayerTarget(player: PlayingUser): void {
        player.killTarget()
    }

    /**
     * kill those players that have not killed their target within the `idleTimeSpan` time.
     * these players are called idle players.
     * @param players the list of possible players to kill
     * @param idleTimeSpan the maximum amount of time a player can play without killing anyone
     */
    killIdlePlayers(players: Iterable<PlayingUser>, idleTimeSpan: timespan.TimeSpan): void {
        let firstNotIdle = undefined
        let previousNotIdle = undefined
        const idleCheckTime = new Date()

        for (let player of players) {
            if (player.isIdle(idleCheckTime, idleTimeSpan)) {
                player.target = null
                continue
            }

            if (firstNotIdle === undefined) {
                firstNotIdle = previousNotIdle = player
                continue
            }

            previousNotIdle.target = player
            previousNotIdle = player
        }

        previousNotIdle.target = firstNotIdle
    }

    shuffleTargets(): void {

    }

    private createRing(players: Iterable<PlayingUser>, initializeLastKill: boolean): void {
        let firstPlayer = undefined
        let previousPlayer = undefined
        const startingGameDate = new Date()
        let initLastKillIfNecessary = (player: PlayingUser) => {
            if (initializeLastKill)
                player.lastKill = startingGameDate
        }

        for (let player of players) {
            if (previousPlayer === undefined) {
                firstPlayer = player
                initLastKillIfNecessary(player)
            }
            else {
                previousPlayer.target = player
                initLastKillIfNecessary(player)
            }
            previousPlayer = player
        }

        previousPlayer.target = firstPlayer
    }
}
