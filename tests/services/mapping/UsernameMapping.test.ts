import client from "../../../src/infrastructure/storage/RedisClient";
import IUsernameMapping from "../../../src/services/mapping/IUsernameMapping";
import UsernameMapping from "../../../src/services/mapping/RedisUsernameMapping";

let service: IUsernameMapping = null

beforeEach(async () => {
    client.sendCommand(['FLUSHDB'])
    service = new UsernameMapping()
})

test(`given a new username, when it is stored with chatId, I can retrieve the chatId`, async () => {
    const username = 'user0'
    await service.storeChatId(username, 1000)

    const chatId = await service.getChatIdFromUsername(username)
    expect(chatId).toBe(1000)
});