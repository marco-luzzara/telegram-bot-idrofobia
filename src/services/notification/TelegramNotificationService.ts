import INotificationService from "./INotificationService";
import NotificationMessages from "./NotificationMessages";
import { Context } from "telegraf";
import { getFormattedMessage, Messages } from '../../infrastructure/utilities/GlobalizationUtil'
import IUsernameMapping from '../mapping/IUsernameMapping'

export default class TelegramNotificationService implements INotificationService {
    private readonly ctx: Context
    private readonly usernameMapping: IUsernameMapping
    
    constructor(ctx: Context, usernameMapping: IUsernameMapping) {
        this.ctx = ctx
        this.usernameMapping = usernameMapping
    }

    async sendMessage(receiver: any, messageId: NotificationMessages, ...params: string[]): Promise<void> {
        let chatId = typeof receiver === 'string' ?
            await this.usernameMapping.getChatIdFromUsername(receiver) :
            receiver

        const formattedMessage = getFormattedMessage('notifications', messageId.toString(), ...params)
        await this.ctx.telegram.sendMessage(chatId, formattedMessage)
    }
    async sendPicture(receiver: any, messageId: NotificationMessages, imageUrl: URL, ...params: string[]): Promise<void> {
        let chatId = typeof receiver === 'string' ?
            await this.usernameMapping.getChatIdFromUsername(receiver) :
            receiver

        const formattedMessage = getFormattedMessage('notifications', messageId.toString(), ...params)
        await this.ctx.telegram.sendPhoto(chatId, imageUrl.toString(), 
            { caption: formattedMessage })
    }
}