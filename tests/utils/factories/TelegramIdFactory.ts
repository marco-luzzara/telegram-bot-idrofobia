import TelegramId from '../../../src/model/custom_types/TelegramId'

export function generateTelegramIdFromSeed(seed: any): TelegramId {
    return new TelegramId(seed.toString().repeat(5).substring(0, 5))
}