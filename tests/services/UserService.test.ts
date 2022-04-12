import { dbInstance } from '../../src/data/DbConnectionUtils'
import { seedDbWithRingOfNPlayers } from '../utils/factories/DbUserFactory'
import IUserRepository from '../../src/data/repositories/interfaces/IUserRepository'
import UserRepository from '../../src/data/repositories/UserRepository'
import UserService from '../../src/services/UserService'
import { generateKillCodeFromSeed } from '../utils/factories/KillCodeFactory'
import { DeadUserStatus, PlayingUserStatus, WinningUserStatus } from '../../src/services/dto/UserStatus'

beforeEach(async () => {
    await dbInstance.sync({ force: true })
});

test(`given a playing user, when it kills the target through the service, 
    it receives a new target`, async () => 
{
    await seedDbWithRingOfNPlayers(3)
    const repo: IUserRepository = new UserRepository()
    const service = new UserService(repo)

    const isTargetKilled = await service.killUserTarget('user1', 
        generateKillCodeFromSeed('user2').toString())

    expect(isTargetKilled).toBeTruthy()
    const userStatus = await service.getUserStatus('user1') as PlayingUserStatus
    expect(userStatus.targetFullname).toBe('user0 user0')
});

test(`given a playing user, when the killcode he inserts to kill the target is wrong, 
    nothing happens`, async () => 
{
    await seedDbWithRingOfNPlayers(3)
    const repo: IUserRepository = new UserRepository()
    const service = new UserService(repo)

    const isTargetKilled = await service.killUserTarget('user1', 
        generateKillCodeFromSeed('badkillcode').toString())

    expect(isTargetKilled).toBeFalsy()
    const userStatus = await service.getUserStatus('user1') as PlayingUserStatus
    expect(userStatus.targetFullname).toBe('user2 user2')
});

test(`given a winning user, when he tries to kill himself, nothing happens`, async () => 
{
    await seedDbWithRingOfNPlayers(1)
    const repo: IUserRepository = new UserRepository()
    const service = new UserService(repo)

    const isTargetKilled = await service.killUserTarget('user0', 
        generateKillCodeFromSeed('user0').toString())

    expect(isTargetKilled).toBeFalsy()
});

test(`given a playing user, when he asks for the status, 
    (killcode, lastkill, target info) are returned`, async () => 
{
    await seedDbWithRingOfNPlayers(3)
    const repo: IUserRepository = new UserRepository()
    const service = new UserService(repo)

    const userStatus = await service.getUserStatus('user1') as PlayingUserStatus

    expect(userStatus.killCode).toBe(generateKillCodeFromSeed('user1').toString())
    expect(userStatus.targetAddress).toBe('user2')
    expect(userStatus.targetFullname).toBe('user2 user2')
    expect(userStatus.targetPhotoUrl).toBe('http://myphoto-user2.com/')
});

test(`given a dead user, when he asks for the status, it receives a DeadUser`, async () => 
{
    await seedDbWithRingOfNPlayers(2)
    const repo: IUserRepository = new UserRepository()
    const service = new UserService(repo)
    await service.killUserTarget('user0', generateKillCodeFromSeed('user1').toString())
    const userStatus = await service.getUserStatus('user1')

    expect(userStatus).toBeInstanceOf(DeadUserStatus)
});

test(`given a winning user, when he asks for the status, 
    it receives a WinningUser`, async () => 
{
    await seedDbWithRingOfNPlayers(1)
    const repo: IUserRepository = new UserRepository()
    const service = new UserService(repo)

    const userStatus = await service.getUserStatus('user0')

    expect(userStatus).toBeInstanceOf(WinningUserStatus)
});