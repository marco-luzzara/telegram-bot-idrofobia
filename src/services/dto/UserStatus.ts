import { PlayingUser } from "../../model/domain/User";

export class PlayingUserStatus {
    readonly killCode: string
    readonly lastKill: Date
    readonly targetFullname: string
    readonly targetAddress: string
    readonly targetPhotoUrl: string

    constructor(user: PlayingUser) {
        const target = user.target
        this.killCode = user.userInfo.killCode.toString()
        this.lastKill = user.lastKill
        this.targetFullname = `${target.userInfo.name} ${target.userInfo.surname}`
        this.targetAddress = target.userInfo.address
        this.targetPhotoUrl = target.userInfo.profilePictureUrl.toString()
    }
}

export class DeadUserStatus {
}

export class WinningUserStatus {
}