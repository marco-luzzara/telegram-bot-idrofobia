export default class TelegramId {
    readonly telegramId: string
    constructor(telegramId: string) {
        this.telegramId = telegramId
        // TODO: implement validation
    }

    toString() {
        return this.telegramId
    }
}