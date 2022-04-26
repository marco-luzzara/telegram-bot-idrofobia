import config from 'config'

import { Scenes } from "telegraf";
import AppContext from "../types/AppContext";
import { cancelButton, confirmButton } from './buttons/CallbackButtons'
import { getAdminUserService } from '../factories/ServiceFactory'
import { Messages } from "../../infrastructure/utilities/GlobalizationUtil";

const START_GAME_SCENE = 'START_GAME_SCENE'

const startGameScene = new Scenes.BaseScene<AppContext>(START_GAME_SCENE)
startGameScene.enter(async (ctx) => {
    await ctx.reply(Messages.responses.confirmToStartTheGame, {
        reply_markup: {
            inline_keyboard: [[confirmButton, cancelButton]]
        }
    })
});

startGameScene.action('ok', async (ctx) => {
    const service = getAdminUserService(ctx)

    await service.startGame(config.Bot.adminGroupId)

    await ctx.answerCbQuery()
    await ctx.scene.leave()
});

startGameScene.action('cancel', async (ctx) => {
    await ctx.answerCbQuery()
    await ctx.scene.leave()
});

export default startGameScene