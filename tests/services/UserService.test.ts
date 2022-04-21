import { dbInstance } from '../../src/data/DbConnection'
import { seedDbWithRingOfNPlayers } from '../utils/factories/DbPlayingUserFactory'
import IUserRepository from '../../src/data/repositories/interfaces/IUserRepository'
import UserRepository from '../../src/data/repositories/UserRepository'
import UserService from '../../src/services/UserService'
import { generateKillCodeFromSeed } from '../utils/factories/KillCodeFactory'
import { DeadUserStatus, PlayingUserStatus, WinningUserStatus } from '../../src/services/dto/UserStatus'
import { generateTelegramIdFromSeed } from '../utils/factories/TelegramIdFactory'
import { mock } from 'jest-mock-extended'
import INotificationService from '../../src/services/notification/INotificationService'
import NotificationMessages from '../../src/services/notification/NotificationMessages'

let mockNotificationService: INotificationService = null;
let repo: IUserRepository = null
let service: UserService

beforeEach(async () => {
    mockNotificationService = mock<INotificationService>()
    await dbInstance.sync({ force: true })
    repo = new UserRepository()

    service = new UserService(repo, mockNotificationService)
});

describe('killUserTarget', () => {
    test(`given a non-registered user, when it tries to kill a target, 
        it cannot because he is not registered`, async () => 
    {
        await seedDbWithRingOfNPlayers(3)
        const notRegisteredTId = generateTelegramIdFromSeed('user4').toString()
        
        await service.killUserTarget(notRegisteredTId, 
            generateKillCodeFromSeed('user1').toString())

        expect(mockNotificationService.sendMessage)
            .toHaveBeenCalledWith(notRegisteredTId, NotificationMessages.UnregisteredUser)
    });

    test(`given a non-playing user, when he tries to kill a target, 
        it cannot because he is not playing`, async () => 
    {
        await seedDbWithRingOfNPlayers(3)
        const userTId = generateTelegramIdFromSeed('user0').toString()
        const user0 = await repo.getUserByTelegramId(generateTelegramIdFromSeed(userTId), 1)
        user0.lastKill = null
        user0.target = null
        expect(user0.isPlaying()).toBeFalsy()
        await repo.saveExistingUsers(user0)
        
        await service.killUserTarget(userTId, 
            generateKillCodeFromSeed('user1').toString())

        expect(mockNotificationService.sendMessage)
            .toHaveBeenCalledWith(userTId, NotificationMessages.GameNotStartedYet)
    });

    test(`given a dead user, when it tries to kill a target, 
        it cannot because he is dead`, async () => 
    {
        await seedDbWithRingOfNPlayers(3)
        const deadUserTId = generateTelegramIdFromSeed('user1').toString()
        await service.killUserTarget(generateTelegramIdFromSeed('user0').toString(), 
            generateKillCodeFromSeed('user1').toString())

        await service.killUserTarget(deadUserTId, 
            generateKillCodeFromSeed('user2').toString())

        expect(mockNotificationService.sendMessage)
            .toHaveBeenCalledWith(deadUserTId, NotificationMessages.DeadUserCannotKill)
    });

    test(`given a winning user, when it tries to kill a target, 
        it cannot because he is already the winner`, async () => 
    {
        await seedDbWithRingOfNPlayers(1)
        const winningUserTId = generateTelegramIdFromSeed('user0').toString()
        
        await service.killUserTarget(winningUserTId, 
            generateKillCodeFromSeed(winningUserTId).toString())

        expect(mockNotificationService.sendMessage)
            .toHaveBeenCalledWith(winningUserTId, NotificationMessages.WinnerCannotKill)
    });

    test(`given a playing user, when he kills the target with the right killcode, 
        it receives a new target and the target is notified as well`, async () => 
    {
        await seedDbWithRingOfNPlayers(3)
        const killerTId = generateTelegramIdFromSeed('user1').toString()
        
        await service.killUserTarget(killerTId, 
            generateKillCodeFromSeed('user2').toString())

        expect(mockNotificationService.sendMessage)
            .toHaveBeenCalledWith(killerTId, NotificationMessages.KillTargetSuccessful)
        expect(mockNotificationService.sendMessage)
            .toHaveBeenCalledWith(generateTelegramIdFromSeed('user2').toString(),
                NotificationMessages.UserIsDead)
    });

    test(`given a playing user, when the killcode he inserts to kill the target is wrong, 
            he is notified that he did not kill the target`, async () => 
    {
        await seedDbWithRingOfNPlayers(3)
        const killerTId = generateTelegramIdFromSeed('user1').toString()
        
        await service.killUserTarget(killerTId, 
            generateKillCodeFromSeed('badkillcode').toString())

        expect(mockNotificationService.sendMessage)
            .toHaveBeenCalledWith(killerTId, NotificationMessages.WrongKillCode)
    });
})

describe('getUserStatus', () => {
    test(`given a non-registered user, when he asks for the status, 
        he cannot because not registered`, async () => 
    {
        await seedDbWithRingOfNPlayers(3)
        const notRegisteredTId = generateTelegramIdFromSeed('user4').toString()
        
        await service.getUserStatus(notRegisteredTId)

        expect(mockNotificationService.sendMessage)
            .toHaveBeenCalledWith(notRegisteredTId, NotificationMessages.UnregisteredUser)
    });

    test(`given a non-playing user, when he asks for the status, 
        he receives game not started`, async () => 
    {
        await seedDbWithRingOfNPlayers(3)
        const userTId = generateTelegramIdFromSeed('user0').toString()
        const user0 = await repo.getUserByTelegramId(generateTelegramIdFromSeed(userTId), 1)
        user0.lastKill = null
        user0.target = null
        expect(user0.isPlaying()).toBeFalsy()
        await repo.saveExistingUsers(user0)
        
        await service.getUserStatus(userTId)

        expect(mockNotificationService.sendMessage)
            .toHaveBeenCalledWith(userTId, NotificationMessages.GameNotStartedYet)
    });

    test(`given a playing user, when he asks for the status, 
        he receives messages containing lastKill, kill code and target info`, async () => 
    {
        await seedDbWithRingOfNPlayers(3)
        const userTId = generateTelegramIdFromSeed('user1').toString()
        
        await service.getUserStatus(userTId)

        expect(mockNotificationService.sendMessage)
            .toHaveBeenCalledWith(userTId, NotificationMessages.UserStatusPlaying,
                expect.anything(), expect.anything())
        expect(mockNotificationService.sendPicture)
            .toHaveBeenCalledWith(userTId, NotificationMessages.UserStatusTargetInfo,
                expect.anything(), expect.anything(), expect.anything())
    });

    test(`given a dead user, when he asks for the status, 
        it receives a DeadUser status`, async () => 
    {
        await seedDbWithRingOfNPlayers(2)
        const userTId = generateTelegramIdFromSeed('user1').toString()
        await service.killUserTarget(generateTelegramIdFromSeed('user0').toString(),
            generateKillCodeFromSeed('user1').toString())

        await service.getUserStatus(userTId)

        expect(mockNotificationService.sendMessage)
            .toHaveBeenCalledWith(userTId, NotificationMessages.UserStatusDead)
    });

    test(`given a winning user, when he asks for the status, 
        it receives a WinningUser`, async () => 
    {
        await seedDbWithRingOfNPlayers(1)
        const userTId = generateTelegramIdFromSeed('user0').toString()
        
        await service.getUserStatus(userTId)

        expect(mockNotificationService.sendMessage)
            .toHaveBeenCalledWith(userTId, NotificationMessages.UserStatusWinner)
    });
})
