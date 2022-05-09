import timespan from "timespan"
import {jest} from '@jest/globals'

import { dbInstance } from '../../src/infrastructure/storage/DbConnection'
import { createFakePlayingUserDbObject, seedDbWithRingOfNPlayers } from '../utils/factories/DbPlayingUserFactory'
import IUserRepository from '../../src/data/repositories/interfaces/IUserRepository'
import UserRepository from '../../src/data/repositories/UserRepository'
import AdminUserService, { MessageReceiverType } from '../../src/services/AdminUserService'
import { generateTelegramIdFromSeed } from '../utils/factories/TelegramIdFactory'
import INotificationService from '../../src/services/notification/INotificationService'
import { mock } from 'jest-mock-extended'
import NotificationMessages from '../../src/services/notification/NotificationMessages'
import { generateKillCodeFromSeed } from "../utils/factories/KillCodeFactory"
import TelegramId from "../../src/model/custom_types/TelegramId"

let mockNotificationService: INotificationService = null;
let repo: IUserRepository = null
let service: AdminUserService
const adminGId = 1000

beforeEach(async () => {
    mockNotificationService = mock<INotificationService>()
    await dbInstance.sync({ force: true })
    repo = new UserRepository()

    service = new AdminUserService(repo, mockNotificationService)
});

afterAll(async () => {
    await dbInstance.sync({ force: true })
})

describe('killPlayer', () => {
    // TODO: tests with errors too
    test(`given an admin user, when he kills the player manually, 
        the associated killer receives a new target`, async () => 
    {
        await seedDbWithRingOfNPlayers(3)

        await service.killPlayer(adminGId, generateTelegramIdFromSeed('user2').toString())

        expect(mockNotificationService.sendMessage)
            .toHaveBeenCalledWith(generateTelegramIdFromSeed('user1').toString(), 
                NotificationMessages.KillTargetSuccessful)
        expect(mockNotificationService.sendMessage)
            .toHaveBeenCalledWith(generateTelegramIdFromSeed('user2').toString(), 
                NotificationMessages.UserIsDead)
        expect(mockNotificationService.sendMessage)
            .toHaveBeenCalledWith(adminGId, NotificationMessages.AskToUserForKillResult)
    });
});

describe('startGame', () => {
    // TODO: test with restarts
    test(`given an admin user, when he starts the game, 
        targets and lastKills are reinitialized`, async () => 
    {
        const players = [
            await createFakePlayingUserDbObject('user0'),
            await createFakePlayingUserDbObject('user1'),
            await createFakePlayingUserDbObject('user2')
        ]

        await service.startGame(adminGId)

        let curPlayer = await repo.getUserByTelegramId(generateTelegramIdFromSeed('user0'), 3)
        const starterPlayerId = curPlayer.id
        for (let i = 0; i < 3; i++) {
            expect(curPlayer.lastKill).not.toBeNull()
            expect(mockNotificationService.sendMessage)
                .toHaveBeenCalledWith(generateTelegramIdFromSeed('user' + i).toString(), 
                    NotificationMessages.GameStarted)
            curPlayer = curPlayer.target
        }
        expect(curPlayer.id).toBe(starterPlayerId)
    });

    test(`given an admin user, when he starts the game with a single player, 
        he is automatically the winner`, async () => 
    {
        const players = [
            await createFakePlayingUserDbObject('user0')
        ]

        await service.startGame(adminGId)

        let curPlayer = await repo.getUserByTelegramId(generateTelegramIdFromSeed('user0'), 1)
        expect(curPlayer.isWinner()).toBeTruthy()
        expect(mockNotificationService.sendMessage)
            .toHaveBeenCalledWith(generateTelegramIdFromSeed('user0').toString(), 
                NotificationMessages.GameStarted)
    });
});

describe('getIdlePlayers', () => {
    let sendCustomMessageParameters = []
    beforeEach(() => {
        sendCustomMessageParameters = []
        const actualCall = mockNotificationService.sendCustomMessage;
        jest.spyOn(mockNotificationService, 'sendCustomMessage').mockImplementation(
            (_receiver, _message, ...params) => {
                sendCustomMessageParameters = params
                return Promise.resolve()
            })
    });

    test(`given an admin user, when he gets idle players and any is idle, 
        does not return any player`, async () => 
    {
        await seedDbWithRingOfNPlayers(3)

        await service.getIdlePlayers(adminGId, new timespan.TimeSpan(0, 0, 0, 10))

        expectAdminNotificationIfNoUserIdle(adminGId)
    });

    test(`given an admin user, when he gets idle players and an idle player is already dead, 
        he does not receive a notification`, async () => 
    {
        await seedDbWithRingOfNPlayers(2)
        const deadPlayer = await createFakePlayingUserDbObject('user2')
        deadPlayer.lastKill = new Date(2000, 1, 1)
        await deadPlayer.save()

        await service.getIdlePlayers(adminGId, new timespan.TimeSpan(0, 0, 0, 10))

        expectAdminNotificationIfNoUserIdle(adminGId)
    });

    test(`given an admin user, when he gets idle players and one is idle, 
        it is returned`, async () => 
    {
        const players = await seedDbWithRingOfNPlayers(3)
        players[0].lastKill = new Date(2000, 1, 1)
        await players[0].save()

        await service.getIdlePlayers(adminGId, new timespan.TimeSpan(0, 0, 0, 10))

        expectIdleUsersToBe([generateTelegramIdFromSeed('user0')])
    });

    test(`given an admin user, when he gets idle players and consecutive ones are idle, 
        return them`, async () => 
    {
        const players = await seedDbWithRingOfNPlayers(4)
        players[0].lastKill = new Date(2000, 1, 1)
        await players[0].save()
        players[1].lastKill = new Date(2000, 1, 1)
        await players[1].save()

        await service.getIdlePlayers(adminGId, new timespan.TimeSpan(0, 0, 0, 10))

        expectIdleUsersToBe([
            generateTelegramIdFromSeed('user0'), 
            generateTelegramIdFromSeed('user1')])
    });

    test(`given an admin user, when he kigetlls idle players and multiple ones are idle, 
        return them`, async () => 
    {
        const players = await seedDbWithRingOfNPlayers(4)
        players[0].lastKill = new Date(2000, 1, 1)
        await players[0].save()
        players[2].lastKill = new Date(2000, 1, 1)
        await players[2].save()

        await service.getIdlePlayers(adminGId, new timespan.TimeSpan(0, 0, 0, 10))

        expectIdleUsersToBe([
            generateTelegramIdFromSeed('user0'), 
            generateTelegramIdFromSeed('user2')])
    });

    function expectAdminNotificationIfNoUserIdle(adminGId: number) {
        expect(mockNotificationService.sendMessage).toHaveBeenCalledTimes(1)
        expect(mockNotificationService.sendMessage).toHaveBeenCalledWith(
            adminGId, NotificationMessages.NoUserIdle)
    }

    function expectIdleUsersToBe(tIds: TelegramId[]) {
        expect(sendCustomMessageParameters).toEqual(
            expect.arrayContaining(tIds.map(tId => tId.toString())))
        expect(mockNotificationService.sendCustomMessage).toHaveBeenCalledTimes(1)
    }
});

describe('sendMessageToUsers', () => {
    const message = "testing"

    test(`given 2 users (1 dead), when he sends a message to all users, 
        all users receive the message`, async () => 
    {
        await setupDbWith1UserAliveAnd1UserDead()

        await service.sendMessageToUsers(adminGId, message, MessageReceiverType.AllUsers)

        expect(mockNotificationService.sendCustomMessage)
            .toHaveBeenCalledWith(generateTelegramIdFromSeed('user0').toString(), 
                message)
        expect(mockNotificationService.sendCustomMessage)
            .toHaveBeenCalledWith(generateTelegramIdFromSeed('user1').toString(), 
                message)
        expectAdminSuccessfulNotification(adminGId)
    });

    test(`given 2 users (1 dead), when he sends a message to all living users, 
        only the living user receives the message`, async () => 
    {
        await setupDbWith1UserAliveAnd1UserDead()

        await service.sendMessageToUsers(adminGId, message, MessageReceiverType.AllLivingUsers)

        expect(mockNotificationService.sendCustomMessage)
            .toHaveBeenCalledWith(generateTelegramIdFromSeed('user0').toString(), 
                message)
        expect(mockNotificationService.sendCustomMessage)
            .not.toHaveBeenCalledWith(generateTelegramIdFromSeed('user1').toString(), 
                message)
        expectAdminSuccessfulNotification(adminGId)
    });

    async function setupDbWith1UserAliveAnd1UserDead() {
        await seedDbWithRingOfNPlayers(3)
        const player = await repo.getUserByTelegramId(generateTelegramIdFromSeed('user0'), 1)
        const target = player.target
        player.killTarget(player.target.userInfo.killCode)
        await repo.saveExistingUsers(player, target)
    }

    function expectAdminSuccessfulNotification(adminGId: number) {
        expect(mockNotificationService.sendMessage)
            .toHaveBeenCalledWith(adminGId, NotificationMessages.MessageSentToTheUsers)
    }
});
