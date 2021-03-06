import * as timespan from "timespan"
import { strict as assert } from 'assert';

import UserInfo from "../custom_types/UserInfo"
import KillCode from "../custom_types/KillCode";

export enum KillTargetResult {
    KillTargetSuccessful,
    WrongKillCode,
    WinnerCannotKill,
    DeadUserCannotKill
}

export default class PlayingUser {
    id: number
    readonly userInfo: UserInfo
    target: PlayingUser
    lastKill: Date
    killCount: number

    constructor(
        userInfo: UserInfo, 
        target: PlayingUser, 
        lastKill: Date,
        killCount: number) 
    {
        this.userInfo = userInfo
        this.target = target
        this.lastKill = lastKill
        this.killCount = killCount
    }

    killTarget(killCode: KillCode): KillTargetResult {
        assert(this.isPlaying(), 'The game has not been started yet')

        if (this.isWinner())
            return KillTargetResult.WinnerCannotKill

        if (this.isDead())
            return KillTargetResult.DeadUserCannotKill

        if (!this.target.hasKillCode(killCode))
            return KillTargetResult.WrongKillCode

        const killedUser = this.target
        const killedUserTarget = killedUser.target

        killedUser.die()
        this.target = killedUserTarget

        this.lastKill = new Date()
        this.killCount++

        return KillTargetResult.KillTargetSuccessful
    }

    startPlaying(startGameDate: Date) {
        this.lastKill = startGameDate
        this.killCount = 0
    }

    die() {
        assert(!this.isDead(), 'user cannot die twice')
        this.target = null
    }

    getFormattedLastKill(locale?: string, timeZone?: string) {
        const defaultOptions = Intl.DateTimeFormat().resolvedOptions()
        const localeOrDefault = locale ?? defaultOptions.locale
        const timeZoneOrDefault = timeZone ?? defaultOptions.timeZone
        return this.lastKill.toLocaleString(localeOrDefault, { timeZone: timeZoneOrDefault })
    }

    hasKillCode(killCode: KillCode): boolean {
        return killCode.toString() === this.userInfo.killCode.toString()
    }

    isIdle(now: Date, idleTimeSpan: timespan.TimeSpan): boolean {
        assert(!this.isDead(), `player ${this.id} cannot be idle if it is not playing`)

        const playerIdleTime = timespan.fromDates(this.lastKill, now)
        return playerIdleTime.totalSeconds() > idleTimeSpan.totalSeconds()
    }

    isWinner(): boolean {
        assert(this.isPlaying(), `player ${this.id} cannot be the winner if it is not playing`)
        return !this.isDead() && this.target.id === this.id
    }

    isDead(): boolean {
        assert(this.isPlaying(), `player ${this.id} cannot be dead if it is not playing`)
        return this.target === null
    }

    isPlaying(): boolean {
        return this.lastKill !== null
    }
}
