import config from 'config'

import { Scenes } from "telegraf";
import AppContext from "../types/AppContext";
import { cancelButton } from './buttons/CallbackButtons'
import { getAdminUserService } from '../factories/ServiceFactory'
import { Messages } from "../../infrastructure/utilities/GlobalizationUtil";
import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram';
import { MessageReceiverType } from '../../services/AdminUserService';

const SEND_MESSAGE_TO_USERS_SCENE = 'SEND_MESSAGE_TO_USERS_SCENE'

const allUsersButton: InlineKeyboardButton.CallbackButton = {
    text: 'All users',
    callback_data: 'all_users'
}

const aliveUsersButton: InlineKeyboardButton.CallbackButton = {
    text: 'Only alive users',
    callback_data: 'alive_users'
}

const sendMessageToUsersScene = new Scenes.BaseScene<AppContext>(SEND_MESSAGE_TO_USERS_SCENE)
sendMessageToUsersScene.enter(async (ctx) => {
    await ctx.reply(Messages.responses.requestForMessageReceiver, {
        reply_markup: {
            inline_keyboard: [[allUsersButton, aliveUsersButton], [cancelButton]]
        }
    })
});

sendMessageToUsersScene.action(allUsersButton.callback_data, async (ctx) => {
    ctx.scene.state = { receiverType: MessageReceiverType.AllUsers }
    await ctx.answerCbQuery()
    await ctx.reply(Messages.responses.requestForMessage)
});

sendMessageToUsersScene.action(aliveUsersButton.callback_data, async (ctx) => {
    ctx.scene.state = { receiverType: MessageReceiverType.AllLivingUsers }
    await ctx.answerCbQuery()
    await ctx.reply(Messages.responses.requestForMessage)
});

sendMessageToUsersScene.action('cancel', async (ctx) => {
    await ctx.answerCbQuery()
    await ctx.scene.leave()
});

sendMessageToUsersScene.on('text', async (ctx) => {
    const messageReceiverType = ctx.scene.state['receiverType']
    const message = ctx.message.text
    const service = getAdminUserService(ctx)

    await service.sendMessageToUsers(config.Bot.adminGroupId, message, messageReceiverType)
    
    await ctx.scene.leave()
});

export default sendMessageToUsersScene