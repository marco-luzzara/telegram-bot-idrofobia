import config from 'config'
import { format } from 'util'

const language = config.Bot.language
const { default: messages } = await import(`../../../globalization/${language}.json`, 
    {
        assert: { type: 'json' }
    })

export function getFormattedMessage(section: string, messageId: string, 
    ...params: string[]): string 
{
    const message: string = messages[section][messageId]
    return format(message, ...params)
}

export { messages as Messages }