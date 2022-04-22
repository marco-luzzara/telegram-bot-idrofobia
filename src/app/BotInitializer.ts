import { Telegraf } from "telegraf";
import { BotCommand } from "telegraf/typings/core/types/typegram";
import { Messages } from "../infrastructure/utilities/GlobalizationUtil";
import * as config from 'config'

export function initializeBot(bot: Telegraf): void {
    const killTargetCommand: BotCommand = {
        command: 'kill_target',
        description: Messages.commandDescriptions.kill_target
    }

    const getStatusCommand: BotCommand = {
        command: 'get_status',
        description: Messages.commandDescriptions.get_status
    }
    
    bot.telegram.setMyCommands([killTargetCommand, getStatusCommand], 
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

    bot.telegram.setMyCommands([killIdlePlayersCommand, killUserCommand, startGameCommand], 
        { 
            scope: { 
                type: "chat_administrators",
                chat_id: config.Bot.adminGroupId
            }
        })
}