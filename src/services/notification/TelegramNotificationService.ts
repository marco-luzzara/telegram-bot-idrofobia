import INotificationService from "./INotificationService";
import NotificationMessages from "./NotificationMessages";
import { Context } from "telegraf";
import { getFormattedMessage, Messages } from '../../infrastructure/utilities/GlobalizationUtil'

export default class TelegramNotificationService implements INotificationService {
    private readonly ctx: Context
    
    constructor(ctx: Context) {
        this.ctx = ctx
    }

    async sendMessage(receiver: string, messageId: NotificationMessages, ...params: string[]): Promise<void> {
        const formattedMessage = getFormattedMessage('notifications', messageId.toString(), ...params)
        await this.ctx.telegram.sendMessage(receiver, formattedMessage)
    }
    async sendPicture(receiver: string, messageId: NotificationMessages, imageUrl: URL, ...params: string[]): Promise<void> {
        const formattedMessage = getFormattedMessage('notifications', messageId, ...params)
        await this.ctx.telegram.sendPhoto(receiver, imageUrl.toString(), 
            { caption: formattedMessage })
    }
}