import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram"

const buildInlineButton: (text: string, cbData: string) => InlineKeyboardButton.CallbackButton = 
    (text, callback_data) => ({
        text,
        callback_data
    })

const numbers = [...Array(10).keys()].map(c => buildInlineButton(c.toString(), c.toString()))

const firstRowOfLetters = 'QWERTYUIOP'.split('').map(c => buildInlineButton(c, c))
const secondRowOfLetters = 'ASDFGHJKL'.split('').map(c => buildInlineButton(c, c))
const thirdRowOfLetters = 'ZXCVBNM'.split('').map(c => buildInlineButton(c, c))
const delSymbol = buildInlineButton('⌫', 'DEL')

const keyboard: InlineKeyboardButton[][] = [
    numbers, 
    firstRowOfLetters, 
    secondRowOfLetters,
    thirdRowOfLetters.concat([delSymbol])
]

export default keyboard