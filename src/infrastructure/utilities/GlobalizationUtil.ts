import config from 'config'
import { format } from 'util'

const locale = config.Bot.locale
const timeZone = config.Bot.timeZone
const { default: messages } = await import(`../../../globalization/${locale}.json`, 
    {
        assert: { type: 'json' }
    })

export function getFormattedMessage(section: string, messageId: string, 
    ...params: string[]): string 
{
    const message: string = messages[section][messageId]
    return format(message, ...params)
}

export { timeZone as BotTimeZone }
export { locale as BotLocale }
export { messages as Messages }