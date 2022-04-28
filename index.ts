import { Scenes, session, Telegraf } from 'telegraf'
import config from 'config'
import { Messages } from './src/infrastructure/utilities/GlobalizationUtil';
import { initializeBotCommands, injectErrorHandler, injectMiddlewareForChatIdStorage } from './src/app/BotInitializer';
import AppContext from './src/app/types/AppContext'
import killTargetScene from './src/app/scenes/KillTargetScene'
import killIdlePlayersScene from './src/app/scenes/KillIdlePlayersScene'
import killUserScene from './src/app/scenes/KillUserScene'
import startGameScene from './src/app/scenes/StartGameScene'
import { getUserService } from './src/app/factories/ServiceFactory';

const bot = new Telegraf<AppContext>(config.Bot.token)
const commands = await initializeBotCommands(bot)

bot.start(async (ctx) => {
    await ctx.reply(Messages.responses.startMessage)
});

bot.help(async (ctx) => {
    await ctx.reply(Messages.responses.helpMessage)
});

const stage = new Scenes.Stage<AppContext>([
        killTargetScene, 
        killIdlePlayersScene,
        killUserScene,
        startGameScene
    ])
bot.use(session())
injectMiddlewareForChatIdStorage(bot)
bot.use(stage.middleware())

bot.command(commands.killTargetCommand.command, async (ctx) => {
    await ctx.scene.enter(killTargetScene.id)
});

bot.command(commands.getStatusCommand.command, async (ctx) => {
    const service = getUserService(ctx)
    await service.getUserStatus(ctx.from.username)
});

bot.command(commands.killIdlePlayersCommand.command, async (ctx) => {
    await ctx.scene.enter(killIdlePlayersScene.id)
});

bot.command(commands.killUserCommand.command, async (ctx) => {
    await ctx.scene.enter(killUserScene.id)
});

bot.command(commands.startGameCommand.command, async (ctx) => {
    await ctx.scene.enter(startGameScene.id)
});

injectErrorHandler(bot)

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
