export default class TelegramId {
    private readonly telegramId: string
    constructor(telegramId: string) {
        this.telegramId = telegramId
        // TODO: implement validation
    }

    toString() {
        return this.telegramId
    }
}