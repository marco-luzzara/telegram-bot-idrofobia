import TelegramId from './TelegramId'
import KillCode from './KillCode'

export default class UserInfo {
    readonly name: string
    readonly surname: string
    readonly address:  string
    readonly profilePictureUrl: URL
    readonly telegramId: TelegramId
    readonly killCode: KillCode

    constructor(name: string, 
                surname: string, 
                address: string, 
                profilePictureUrl: URL,
                telegramId: TelegramId,
                killCode: KillCode) {
        this.name = name
        this.surname = surname
        this.address = address
        this.profilePictureUrl = profilePictureUrl
        this.telegramId = telegramId
        this.killCode = killCode
    }
}