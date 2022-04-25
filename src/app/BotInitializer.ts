import { Telegraf } from "telegraf";
import { BotCommand } from "telegraf/typings/core/types/typegram";
import { Messages } from "../infrastructure/utilities/GlobalizationUtil";
import config from 'config'
import ValidationError from "../infrastructure/errors/ValidationError";

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

    const killIdlePlayersCommand: BotCommand = {
        command: 'kill_idle_players',
        description: Messages.commandDescriptions.kill_idle_players
    }

    const killUserCommand: BotCommand = {
        command: 'kill_user',
        description: Messages.commandDescriptions.kill_user
    }

    const startGameCommand: BotCommand = {
        command: 'start_game',
        description: Messages.commandDescriptions.start_game
    }

    await bot.telegram.setMyCommands([killIdlePlayersCommand, killUserCommand, startGameCommand], 
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
        killIdlePlayersCommand,
        killUserCommand,
        startGameCommand
    }
}

export function injectErrorHandler(bot: Telegraf): Telegraf {
    bot.catch(async (err: Error, ctx) => {
        if (err instanceof ValidationError)
            await ctx.reply(err.message)
        else
            await ctx.telegram.sendMessage(config.Bot.adminGroupId, err.message)
    })

    return bot
}