import config from 'config'

import { Scenes } from "telegraf";
import AppContext from "../types/AppContext";
import { getAdminUserService } from '../factories/ServiceFactory'
import { Messages } from "../../infrastructure/utilities/GlobalizationUtil";
import { getTimespan } from '../factories/TimeSpanFactory'

const GET_IDLE_PLAYERS_SCENE = 'GET_IDLE_PLAYERS_SCENE'

const getIdlePlayersScene = new Scenes.BaseScene<AppContext>(GET_IDLE_PLAYERS_SCENE)
getIdlePlayersScene.enter(async (ctx) => {
    await ctx.reply(Messages.responses.requestForTimespan)
});

getIdlePlayersScene.on('text', async (ctx) => {
    const ts = getTimespan(ctx.message.text)

    const service = getAdminUserService(ctx)
    await service.getIdlePlayers(config.Bot.adminGroupId, ts)

    await ctx.scene.leave()
});

export default getIdlePlayersScene