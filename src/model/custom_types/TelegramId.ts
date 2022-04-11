import RegexType from "../../infrastructure/types/RegexType"

export default class TelegramId extends RegexType {
    private readonly telegramId: string
    constructor(telegramId: string) {
        super(telegramId, /^\w{5,}$/)
        this.telegramId = telegramId
    }

    toString() {
        return this.telegramId
    }
}