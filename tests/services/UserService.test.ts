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

beforeEach(async () => {
    mockNotificationService = mock<INotificationService>()
    await dbInstance.sync({ force: true })
    repo = new UserRepository()
});

test(`given a non-registered user, when it tries to kill a target, 
    it cannot because he is not registered`, async () => 
{
    await seedDbWithRingOfNPlayers(3)
    const notRegisteredTId = 'user4'
    const service = new UserService(repo, mockNotificationService)

    await service.killUserTarget(notRegisteredTId, 
        generateKillCodeFromSeed('user10').toString())

    expect(mockNotificationService.sendMessage)
        .toHaveBeenCalledWith(notRegisteredTId, NotificationMessages.UnregisteredUser)
});

test(`given a non-playing user, when it tries to kill a target, 
    it cannot because he is not playing`, async () => 
{
    await seedDbWithRingOfNPlayers(3)
    const userTId = 'user0'
    const user0 = await repo.getUserByTelegramId(generateTelegramIdFromSeed(userTId))
    user0.lastKill = null
    expect(user0.isPlaying()).toBeFalsy()
    await repo.saveExistingUsers(user0)
    const service = new UserService(repo, mockNotificationService)

    await service.killUserTarget(userTId, 
        generateKillCodeFromSeed('user10').toString())

    expect(mockNotificationService.sendMessage)
        .toHaveBeenCalledWith(userTId, NotificationMessages.GameNotStartedYet)
});

test(`given a dead user, when it tries to kill a target, 
    it cannot because he is dead`, async () => 
{
    await seedDbWithRingOfNPlayers(3)
    const deadUserTId = 'user1'
    const service = new UserService(repo, mockNotificationService)
    await service.killUserTarget('user0', 
        generateKillCodeFromSeed(deadUserTId).toString())

    await service.killUserTarget(deadUserTId, 
        generateKillCodeFromSeed('user2').toString())

    expect(mockNotificationService.sendMessage)
        .toHaveBeenCalledWith(deadUserTId, NotificationMessages.DeadUserCannotKill)
});

test(`given a winning user, when it tries to kill a target, 
    it cannot because he is already the winner`, async () => 
{
    await seedDbWithRingOfNPlayers(1)
    const winningUserTId = 'user0'
    const service = new UserService(repo, mockNotificationService)

    await service.killUserTarget(winningUserTId, 
        generateKillCodeFromSeed(winningUserTId).toString())

    expect(mockNotificationService.sendMessage)
        .toHaveBeenCalledWith(winningUserTId, NotificationMessages.WinnerCannotKill)
});

test(`given a playing user, when he kills the target with the right killcode, 
    it receives a new target and the target is notified as well`, async () => 
{
    await seedDbWithRingOfNPlayers(3)
    const service = new UserService(repo, mockNotificationService)

    await service.killUserTarget('user1', 
        generateKillCodeFromSeed('user2').toString())

    expect(mockNotificationService.sendMessage)
        .toHaveBeenCalledWith('user1', NotificationMessages.KillTargetSuccessful)
    expect(mockNotificationService.sendMessage)
        .toHaveBeenCalledWith('user2', NotificationMessages.UserIsDead)
});

test(`given a playing user, when the killcode he inserts to kill the target is wrong, 
        he is notified that he did not kill the target`, async () => 
{
    await seedDbWithRingOfNPlayers(3)
    const service = new UserService(repo, mockNotificationService)

    await service.killUserTarget('user1', 
        generateKillCodeFromSeed('badkillcode').toString())

    expect(mockNotificationService.sendMessage)
        .toHaveBeenCalledWith('user1', NotificationMessages.WrongKillCode)
});

// test(`given a playing user, when he asks for the status, 
//     (killcode, lastkill, target info) are returned`, async () => 
// {
//     await seedDbWithRingOfNPlayers(3)
//     const repo: IUserRepository = new UserRepository()
//     const service = new UserService(repo)

//     const userStatus = await service.getUserStatus('user1') as PlayingUserStatus

//     expect(userStatus.killCode).toBe(generateKillCodeFromSeed('user1').toString())
//     expect(userStatus.targetAddress).toBe('user2')
//     expect(userStatus.targetFullname).toBe('user2 user2')
//     expect(userStatus.targetPhotoUrl).toBe('http://myphoto-user2.com/')
// });

// test(`given a dead user, when he asks for the status, it receives a DeadUser`, async () => 
// {
//     await seedDbWithRingOfNPlayers(2)
//     const repo: IUserRepository = new UserRepository()
//     const service = new UserService(repo)
//     await service.killUserTarget('user0', generateKillCodeFromSeed('user1').toString())
//     const userStatus = await service.getUserStatus('user1')

//     expect(userStatus).toBeInstanceOf(DeadUserStatus)
// });

// test(`given a winning user, when he asks for the status, 
//     it receives a WinningUser`, async () => 
// {
//     await seedDbWithRingOfNPlayers(1)
//     const repo: IUserRepository = new UserRepository()
//     const service = new UserService(repo)

//     const userStatus = await service.getUserStatus('user0')

//     expect(userStatus).toBeInstanceOf(WinningUserStatus)
// });