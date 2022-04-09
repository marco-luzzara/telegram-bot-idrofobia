import timespan from "timespan"
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

        //await this.userRepository.update(this, killedUser)
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
    private userRepository: IUserRepository

    constructor(userRepository: IUserRepository) {
        this.userRepository = userRepository
    }

    startGame(): void {
        this.shuffleTargets()
    }

    async killPlayer(player: PlayingUser): Promise<void> {
        // let playerToAssignNewTarget = await this.userRepository.findPlayerThatHasTarget(player)
        // let currentPlayerTarget = player.target

        // playerToAssignNewTarget.target = currentPlayerTarget
        // player.target = null
    }

    async removeIdlePlayers(timeSpan: timespan.TimeSpan): Promise<void> {

    }

    shuffleTargets(): void {

    }
}
