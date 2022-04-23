import * as config from 'config'
import { format } from 'util'

const language: string = config.Bot.language
const messages = require(`../../../globalization/${language}.json`)

export function getFormattedMessage(section: string, messageId: string, 
    ...params: string[]): string 
{
    const message: string = messages[section][messageId]
    return format(message, params)
}

export { messages as Messages }