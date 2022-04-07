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

    id: number
    target: number
    lastKill: Date

    constructor(userRepository: IUserRepository, 
        userInfo: UserInfo, 
        target: number, 
        lastKill: Date) {
        super(userInfo)
        this.userRepository = userRepository
        this.target = target
        this.lastKill = lastKill
    }

    async killTarget(): Promise<void> {
        if (this.isWinner())
            throw new Error("You are the last one, you can only kill yourself")

        const killedUser = await this.userRepository.getById(this.target)
        const killedUserTarget = killedUser.target

        killedUser.target = null
        this.target = killedUserTarget

        await this.userRepository.update(this, killedUser)
    }

    isWinner(): boolean {
        return this.target == this.id
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
