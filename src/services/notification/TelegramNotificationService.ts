import { format } from 'util'
import { Context } from "telegraf";

import INotificationService from "./INotificationService";
import NotificationMessages from "./NotificationMessages";
import { getFormattedMessage, Messages } from '../../infrastructure/utilities/GlobalizationUtil'
import IUsernameMapping from '../mapping/IUsernameMapping'

export default class TelegramNotificationService implements INotificationService {
    private readonly ctx: Context
    private readonly usernameMapping: IUsernameMapping
    
    constructor(ctx: Context, usernameMapping: IUsernameMapping) {
        this.ctx = ctx
        this.usernameMapping = usernameMapping
    }

    async sendCustomMessage(receiver: any, message: string, ...params: string[]): Promise<void> {
        let chatId = await this.getChatId(receiver)

        await this.ctx.telegram.sendMessage(chatId, format(message, ...params))
    }    

    async sendMessage(receiver: any, messageId: NotificationMessages, ...params: string[]): Promise<void> {
        let chatId = await this.getChatId(receiver)

        const formattedMessage = getFormattedMessage('notifications', messageId.toString(), ...params)
        await this.ctx.telegram.sendMessage(chatId, formattedMessage)
    }
    async sendPicture(receiver: any, messageId: NotificationMessages, imageUrl: URL, ...params: string[]): Promise<void> {
        let chatId = await this.getChatId(receiver)

        const formattedMessage = getFormattedMessage('notifications', messageId.toString(), ...params)
        await this.ctx.telegram.sendPhoto(chatId, imageUrl.toString(), 
            { caption: formattedMessage })
    }

    private async getChatId(receiver: any): Promise<number> {
        return typeof receiver === 'string' ?
            await this.usernameMapping.getChatIdFromUsername(receiver) :
            Promise.resolve(receiver)
    }
}