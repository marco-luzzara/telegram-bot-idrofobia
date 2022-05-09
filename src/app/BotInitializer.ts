import { Telegraf } from "telegraf";
import { BotCommand } from "telegraf/typings/core/types/typegram";
import { Messages } from "../infrastructure/utilities/GlobalizationUtil";
import config from 'config'
import ValidationError from "../infrastructure/errors/ValidationError";
import RedisUsernameMapping from "../services/mapping/RedisUsernameMapping";
import AppContext from "./types/AppContext";

export async function initializeBotCommands(bot: Telegraf): Promise<{ [key: string]: BotCommand }> {
    const killTargetCommand: BotCommand = {
        command: 'kill_target',
        description: Messages.commandDescriptions.kill_target
    }

    const getStatusCommand: BotCommand = {
        command: 'get_status',
        description: Messages.commandDescriptions.get_status
    }
    
    await bot.telegram.setMyCommands([killTargetCommand, getStatusCommand], 
        { 
            scope: { 
                type: "all_private_chats" 
            }
        })

    const getIdlePlayersCommand: BotCommand = {
        command: 'get_idle_players',
        description: Messages.commandDescriptions.get_idle_players
    }

    const killUserCommand: BotCommand = {
        command: 'kill_user',
        description: Messages.commandDescriptions.kill_user
    }

    const startGameCommand: BotCommand = {
        command: 'start_game',
        description: Messages.commandDescriptions.start_game
    }

    const sendMessageToUsersCommand: BotCommand = {
        command: 'send_message_to_users',
        description: Messages.commandDescriptions.send_message_to_users
    }

    await bot.telegram.setMyCommands([getIdlePlayersCommand, killUserCommand, 
        startGameCommand, sendMessageToUsersCommand], 
        { 
            scope: { 
                type: "chat_administrators",
                chat_id: config.Bot.adminGroupId
            }
        })

    return {
        killTargetCommand,
        getStatusCommand,
        
        // admin only
        getIdlePlayersCommand,
        killUserCommand,
        startGameCommand,
        sendMessageToUsersCommand
    }
}

export function injectErrorHandler(bot: Telegraf): Telegraf {
    bot.catch(async (err: Error, ctx: AppContext) => {
        if (err instanceof ValidationError)
            await ctx.reply(err.message)
        else
            await ctx.telegram.sendMessage(config.Bot.adminGroupId, 
                `Error from user @${(ctx.from?.username ?? 'admin')}: \n<pre>${JSON.stringify(err)}</pre>`,
                {
                    parse_mode: 'HTML'
                })
        
        if (ctx.scene.current !== undefined)
            await ctx.scene.leave()
    })

    return bot
}

export function injectMiddlewareForChatIdStorage(bot: Telegraf): Telegraf {
    bot.use(async (ctx, next) => {
        const chatId = ctx.chat.id
        const username = ctx.from.username
        if (chatId !== config.Bot.adminGroupId && username) {
            const usernameMappingService = new RedisUsernameMapping()
            await usernameMappingService.storeChatId(username, chatId)
        }
        await next()
    });

    return bot
}