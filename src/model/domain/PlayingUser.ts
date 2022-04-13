import * as timespan from "timespan"
import { strict as assert } from 'assert';

import UserInfo from "../custom_types/UserInfo"
import KillCode from "../custom_types/KillCode";

export default class PlayingUser {
    id: number
    readonly userInfo: UserInfo
    target: PlayingUser
    lastKill: Date

    constructor(
        userInfo: UserInfo, 
        target: PlayingUser, 
        lastKill: Date) 
    {
        this.userInfo = userInfo
        this.target = target
        this.lastKill = lastKill
    }

    killTarget(killCode: KillCode): boolean {
        assert(this.isPlaying(), 'The game has not been started yet')
        assert(!this.isWinner(), 'There is no other player to kill but yourself')
        assert(!this.isDead(), 'A dead player cannot kill anyone')

        if (!this.target.hasKillCode(killCode))
            return false

        const killedUser = this.target
        const killedUserTarget = killedUser.target

        killedUser.target = null
        this.target = killedUserTarget

        this.lastKill = new Date()
        return true
    }

    hasKillCode(killCode: KillCode): boolean {
        return killCode.toString() === this.userInfo.killCode.toString()
    }

    isIdle(now: Date, idleTimeSpan: timespan.TimeSpan): boolean {
        assert(this.isPlaying(), `player ${this.id} cannot be idle if it is not playing`)

        const playerIdleTime = timespan.fromDates(this.lastKill, now)
        return playerIdleTime.totalSeconds() > idleTimeSpan.totalSeconds()
    }

    isWinner(): boolean {
        return !this.isDead() && this.target.id === this.id
    }

    isDead(): boolean {
        return this.target === null
    }

    isPlaying(): boolean {
        return this.lastKill !== null
    }
}
