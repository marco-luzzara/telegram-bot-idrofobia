import { Scenes, session, Telegraf } from 'telegraf'
import * as config from 'config'
import { Messages } from './src/infrastructure/utilities/GlobalizationUtil';
import { initializeBotCommands, injectErrorHandler } from './src/app/BotInitializer';
import AppContext from './src/app/types/AppContext'
import killTargetScene from './src/app/scenes/KillTargetScene'

const bot = new Telegraf<AppContext>(config.Bot.token)
const commands = initializeBotCommands(bot)

bot.start((ctx) => {
    ctx.reply(Messages.responses.startMessage)
});

bot.help((ctx) => {
    ctx.reply(Messages.responses.helpMessage)
});

const stage = new Scenes.Stage<AppContext>([killTargetScene])
bot.use(session())
bot.use(stage.middleware())

bot.command(commands.killTargetCommand.command, async (ctx) => {
    await ctx.scene.enter(killTargetScene.id)
});

injectErrorHandler(bot)

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
