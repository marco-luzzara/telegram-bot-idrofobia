import { Scenes } from "telegraf";
import AppContext from "../types/AppContext";
import { getUserService } from '../factories/ServiceFactory'
import { Messages } from "../../infrastructure/utilities/GlobalizationUtil";

const KILL_TARGET_SCENE = 'KILL_TARGET_SCENE'

const killTargetScene = new Scenes.BaseScene<AppContext>(KILL_TARGET_SCENE)
killTargetScene.enter(async (ctx) => {
    await ctx.reply(Messages.responses.requestForTargetKillCode)
});

killTargetScene.on('text', async (ctx) => {
    const killCode = ctx.message.text.toUpperCase()
    const service = getUserService(ctx)

    await service.killUserTarget(ctx.from.username, killCode)
});

export default killTargetScene