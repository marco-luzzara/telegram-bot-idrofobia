import { InlineKeyboardButton } from "telegraf/typings/core/types/typegram"

const confirmButton: InlineKeyboardButton.CallbackButton = {
    text: '✅',
    callback_data: 'ok'
}

const cancelButton: InlineKeyboardButton.CallbackButton = {
    text: '❌',
    callback_data: 'cancel'
}

export { confirmButton, cancelButton }