import INotificationService from "./INotificationService";
import NotificationMessages from "./NotificationMessages";
import { Context } from "telegraf";
import { Messages } from '../../infrastructure/utilities/GlobalizationUtil'
import { format } from 'util'

export class TelegramNotificationService implements INotificationService {
    private readonly ctx: Context
    
    constructor(ctx: Context) {
        this.ctx = ctx
    }

    async sendMessage(receiver: string, messageId: NotificationMessages, ...params: string[]): Promise<void> {
        const formattedMessage = this.getFormattedMessage(messageId, ...params)
        await this.ctx.telegram.sendMessage(receiver, formattedMessage)
    }
    async sendPicture(receiver: string, messageId: NotificationMessages, imageUrl: URL, ...params: string[]): Promise<void> {
        const formattedMessage = this.getFormattedMessage(messageId, ...params)
        await this.ctx.telegram.sendPhoto(receiver, imageUrl.toString(), 
            { caption: formattedMessage })
    }

    private getFormattedMessage(messageId: NotificationMessages, ...params: string[]): string {
        const message: string = Messages[messageId.toString()]
        return format(message, params)
    }
}