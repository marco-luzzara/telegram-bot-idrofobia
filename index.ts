import { Telegraf } from 'telegraf'
import * as config from 'config'
import { Messages } from './src/infrastructure/utilities/GlobalizationUtil';
import { initializeBot } from './src/app/BotInitializer';

const bot = new Telegraf(config.Bot.token)
initializeBot(bot)

bot.start((ctx) => {
    ctx.reply(Messages.responses.StartMessage)
});

bot.help((ctx) => {
    ctx.reply(Messages.responses.HelpMessage)
});

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))