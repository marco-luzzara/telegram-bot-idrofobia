import timespan from "timespan"

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
    private userRepository: IUserRepository

    target: PlayingUser
    lastKill: Date

    constructor(userRepository: IUserRepository, 
        userInfo: UserInfo, 
        target: PlayingUser, 
        lastKill: Date) {
        super(userInfo)
        this.userRepository = userRepository
        this.target = target
        this.lastKill = lastKill
    }

    async killTarget(): Promise<void> {
        let targetOfKilledUser = this.target.target
        this.target.target = null
        this.target = targetOfKilledUser

        // await this.userRepository.update(this)
        // await this.userRepository.update(this.target)
    }

    isWinner(): boolean {
        return this.target == this
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
        let playerToAssignNewTarget = await this.userRepository.findPlayerThatHasTarget(player)
        let currentPlayerTarget = player.target

        playerToAssignNewTarget.target = currentPlayerTarget
        player.target = null
    }

    async removeIdlePlayers(timeSpan: timespan.TimeSpan): Promise<void> {

    }

    shuffleTargets(): void {

    }
}
