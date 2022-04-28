import client from "../../infrastructure/storage/RedisClient";
import IUsernameMapping from "./IUsernameMapping";

export default class RedisUsernameMapping implements IUsernameMapping {
    async getChatIdFromUsername(username: string): Promise<number> {
        return parseInt(await client.get(username))
    }

    async storeChatId(username: string, chatId: number): Promise<void> {
        await client.set(username, chatId)
    }
}