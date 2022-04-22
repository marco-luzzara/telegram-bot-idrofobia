import * as config from 'config'

const language: string = config.Bot.language
const messages = require(`../../../globalization/${language}.json`)

export { messages as Messages }