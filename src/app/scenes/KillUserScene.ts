import config from 'config'

import { Scenes } from "telegraf";
import AppContext from "../types/AppContext";
import { cancelButton, confirmButton } from './buttons/CallbackButtons'
import { getAdminUserService } from '../factories/ServiceFactory'
import { getFormattedMessage, Messages } from "../../infrastructure/utilities/GlobalizationUtil";

const KILL_USER_SCENE = 'KILL_USER_SCENE'

const killUserScene = new Scenes.BaseScene<AppContext>(KILL_USER_SCENE)
killUserScene.enter(async (ctx) => {
    await ctx.reply(Messages.responses.requestForUsernameToKill)
});

killUserScene.on('text', async (ctx) => {
    const username = ctx.message.text
    const confirmUserToKillMessage = getFormattedMessage('responses', 'confirmUserToKill', 
        `@${username}`)

    ctx.scene.state = { victimUsername: username }

    await ctx.reply(confirmUserToKillMessage, {
            reply_markup: {
                inline_keyboard: [[confirmButton, cancelButton]]
            }
        })
});

killUserScene.action('ok', async (ctx) => {
    const username = ctx.scene.state['victimUsername']
    const service = getAdminUserService(ctx)

    await service.killPlayer(config.Bot.adminGroupId, username)

    await ctx.answerCbQuery()
    await ctx.scene.leave()
});

killUserScene.action('cancel', async (ctx) => {
    await ctx.answerCbQuery()
    await ctx.scene.leave()
});

export default killUserScene