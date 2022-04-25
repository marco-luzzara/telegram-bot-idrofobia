import config from 'config'

import { Scenes } from "telegraf";
import AppContext from "../types/AppContext";
import { getAdminUserService } from '../factories/ServiceFactory'
import { Messages, getFormattedMessage } from "../../infrastructure/utilities/GlobalizationUtil";
import { getTimespan } from '../factories/TimeSpanFactory'
import { InlineKeyboardButton } from 'telegraf/typings/core/types/typegram';

const KILL_IDLE_PLAYERS_SCENE = 'KILL_IDLE_PLAYERS_SCENE'

const confirmButton: InlineKeyboardButton.CallbackButton = {
    text: '✅',
    callback_data: 'ok'
}

const cancelButton: InlineKeyboardButton.CallbackButton = {
    text: '❌',
    callback_data: 'cancel'
}

const killIdlePlayersScene = new Scenes.BaseScene<AppContext>(KILL_IDLE_PLAYERS_SCENE)
killIdlePlayersScene.enter(async (ctx) => {
    await ctx.reply(Messages.responses.requestForTimespan)
});
killIdlePlayersScene.on('text', async (ctx) => {
    const ts = getTimespan(ctx.message.text)
    const confirmIdlePlayersKillMessage = getFormattedMessage('responses', 'confirmIdlePlayersKill', 
        ts.days, ts.hours, ts.minutes)

    await ctx.reply(confirmIdlePlayersKillMessage, {
            reply_markup: {
                inline_keyboard: [[confirmButton, cancelButton]]
            }
        })
});

killIdlePlayersScene.action('ok', async (ctx) => {
    // const service = getAdminUserService(ctx)

    // await service.killIdlePlayers(config.Bot.adminGroupId, ts)

    await ctx.reply('done')
    await ctx.answerCbQuery()
    await ctx.scene.leave()
});

killIdlePlayersScene.action('cancel', async (ctx) => {
    await ctx.reply('cancel')
    await ctx.answerCbQuery()
    await ctx.scene.leave()
});

export default killIdlePlayersScene