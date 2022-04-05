import TelegramId from './TelegramId'

export default class UserInfo {
    readonly name: string
    readonly surname: string
    readonly address:  string
    readonly profilePictureUrl: URL
    readonly telegramId: TelegramId

    constructor(name: string, 
                surname: string, 
                address: string, 
                profilePictureUrl: URL,
                telegramId: TelegramId) {
        this.name = name
        this.surname = surname
        this.address = address
        this.profilePictureUrl = profilePictureUrl
        this.telegramId = telegramId
    }
}