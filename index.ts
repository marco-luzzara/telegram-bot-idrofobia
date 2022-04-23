import { Context, Telegraf } from 'telegraf'
import * as config from 'config'
import { Messages } from './src/infrastructure/utilities/GlobalizationUtil';
import { initializeBotCommands, injectErrorHandler } from './src/app/BotInitializer';
import { TelegramNotificationService } from './src/services/notification/TelegramNotificationService';
import UserService from './src/services/UserService';
import UserRepository from './src/data/repositories/UserRepository';
import AdminUserService from './src/services/AdminUserService';
import KillCodeKeyboard from './src/app/keyboards/KillCodeKeyboard'

const bot = new Telegraf(config.Bot.token)
const commands = initializeBotCommands(bot)

bot.start((ctx) => {
    ctx.reply(Messages.responses.startMessage)
});

bot.help((ctx) => {
    ctx.reply(Messages.responses.helpMessage)
});

bot.command(commands.killTargetCommand.command, async (ctx) => {
    const service = getUserService(ctx)

    const message = await ctx.reply(Messages.responses.requestForTargetKillCode, 
        {
            reply_markup: {
                inline_keyboard: KillCodeKeyboard                
            }
        })

    console.log(message.text)

    //await service.killUserTarget(ctx.from.username)
});

injectErrorHandler(bot)

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

function getUserService(ctx: Context) {
    const userRepo = new UserRepository()
    const notificationService = new TelegramNotificationService(ctx)

    return new UserService(userRepo, notificationService)
}

function getAdminUserService(ctx: Context) {
    const userRepo = new UserRepository()
    const notificationService = new TelegramNotificationService(ctx)

    return new AdminUserService(userRepo, notificationService)
}
