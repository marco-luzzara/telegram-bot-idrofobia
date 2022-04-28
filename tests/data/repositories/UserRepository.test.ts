import UserRepository from '../../../src/data/repositories/UserRepository'
import { dbInstance } from '../../../src/infrastructure/storage/DbConnection'
import IUserRepository from '../../../src/data/repositories/interfaces/IUserRepository'
import { generateTelegramIdFromSeed } from '../../utils/factories/TelegramIdFactory'
import { createFakePlayingUserDbObject } from '../../utils/factories/DbPlayingUserFactory'
import { seedDbWithRingOfNPlayers } from '../../utils/factories/DbPlayingUserFactory'

let repo: IUserRepository = null

beforeEach(async () => {
    await dbInstance.sync({ force: true })
    repo = new UserRepository()
});

describe('getUserByTelegramId', () => {
    test('given a telegramId, when getUserByTelegramId, it returns the user associated to that id', async () => {
        await seedDbWithRingOfNPlayers(3)
    
        const player = await repo.getUserByTelegramId(generateTelegramIdFromSeed('user2'))
    
        expect(player.userInfo.telegramId).toEqual(generateTelegramIdFromSeed('user2'))
    });
    
    test('given a telegramId, when getUserByTelegramId and id not exists, it returns null', async () => {
        await seedDbWithRingOfNPlayers(3)
    
        const player = await repo.getUserByTelegramId(generateTelegramIdFromSeed('not_a_user'))
    
        expect(player).toBeNull()
    });
    
    test(`given a telegramId, when getUserByTelegramId and I load many targets,
            then i can traverse them`, async () => 
    {
        await seedDbWithRingOfNPlayers(3)
    
        const player = await repo.getUserByTelegramId(generateTelegramIdFromSeed('user1'), 3)
    
        expect(player.target.target.target.userInfo.telegramId)
            .toEqual(generateTelegramIdFromSeed('user1'))
    });
    
    test(`given a telegramId, when getUserByTelegramId and the target is null,
            then it returns null`, async () => 
    {
        await createFakePlayingUserDbObject('user1')
    
        const player = await repo.getUserByTelegramId(generateTelegramIdFromSeed('user1'), 2)
    
        expect(player.target).toBeNull()
    });
    
    test(`given a telegramId, when getUserByTelegramId but i have not loaded enough relations,
            then it throws`, async () => 
    {
        await seedDbWithRingOfNPlayers(3)
    
        const player = await repo.getUserByTelegramId(generateTelegramIdFromSeed('user1'), 1)
    
        expect(() => player.target.target.id).toThrow()
    });
});

describe('getAllUsers', () => {
    test(`given a set of users, when getAllUsers and the number is smaller than the limit,
        return all users`, async () => {
        await seedDbWithRingOfNPlayers(3)
    
        let countPlayers = 0
        for await (let p of repo.getAllUsers()) {
            countPlayers++
        }
    
        expect(countPlayers).toBe(3)
    });

    test(`given a set of users, when getAllUsers and the number is bigger than the limit, 
        return all users`, async () => {
        await seedDbWithRingOfNPlayers(12)
    
        let countPlayers = 0
        for await (const p of repo.getAllUsers()) {
            countPlayers++
        }
    
        expect(countPlayers).toBe(12)
    });

    test(`given a set of users, when getAllUsers and the number is exactly the limit, 
        return all users`, async () => {
        await seedDbWithRingOfNPlayers(10)
    
        let countPlayers = 0
        for await (const p of repo.getAllUsers()) {
            countPlayers++
        }
    
        expect(countPlayers).toBe(10)
    });
});

describe('getAllLivingUsers', () => {
    test(`given a set of users including dead ones, when getAllLivingUsers, 
        return only alive users`, async () => 
    {
        // user0 not playing
        await createFakePlayingUserDbObject('user0')
        const user1 = await createFakePlayingUserDbObject('user1')
        const user2 = await createFakePlayingUserDbObject('user2')
        // user1 playing and living user
        user1.lastKill = new Date()
        await user1.setTargetUser(user2)
        await user1.save()
        // user2 playing and dead user
        user2.lastKill = new Date()
        await user2.save()

        let countPlayers = 0
        for await (const p of repo.getAllLivingUsers()) {
            countPlayers++
            expect(p.userInfo.telegramId).toEqual(generateTelegramIdFromSeed('user1'))
        }

        expect(countPlayers).toBe(1)
    })
});

describe('getUserFromTargetTId', () => {
    test('given a tId of a dead player, when getUserFromTargetTId, returns null', async () => {
        await createFakePlayingUserDbObject('user1')

        const player = await repo.getUserFromTargetTId(generateTelegramIdFromSeed('user1'), 1)

        expect(player).toBeNull()
    });

    test('given a non-existing tId, when getUserFromTargetTId, returns null', async () => {
        await createFakePlayingUserDbObject('user1')

        const player = await repo.getUserFromTargetTId(generateTelegramIdFromSeed('user2'), 1)

        expect(player).toBeNull()
    });

    test(`given a valid tId, when getUserFromTargetTId with 1 nested level, 
        returns the associated killer`, async () => {
        await seedDbWithRingOfNPlayers(3)
        const targetTId = generateTelegramIdFromSeed('user1')

        const player = await repo.getUserFromTargetTId(targetTId, 1)

        expect(player.target.userInfo.telegramId).toEqual(targetTId)
    });

    test(`given a valid tId, when getUserFromTargetTId with 2 nested level,
        returns the associated killer`, async () => {
        await seedDbWithRingOfNPlayers(3)
        const targetTId = generateTelegramIdFromSeed('user1')

        const player = await repo.getUserFromTargetTId(targetTId, 2)

        expect(player.target.userInfo.telegramId).toEqual(targetTId)
        expect(player.target.target.userInfo.telegramId).toEqual(generateTelegramIdFromSeed('user2'))
    });
});

describe('saveExistingUsers', () => {
    test('given a user with a changed field, when i want to save it, it is persisted on data store', async () => {
        await createFakePlayingUserDbObject('user1')
        const user = await repo.getUserByTelegramId(generateTelegramIdFromSeed('user1'))
        
        user.lastKill = new Date(2000, 12, 1)
        await repo.saveExistingUsers(user)
    
        const updatedUser = await repo.getUserByTelegramId(generateTelegramIdFromSeed('user1'))
        expect(updatedUser.lastKill).toEqual(new Date(2000, 12, 1))
    });
    
    test(`given a user with a null target, when i want to reassign the target, 
        it is persisted on data store`, async () => 
    {
        await createFakePlayingUserDbObject('user1')
        await createFakePlayingUserDbObject('user2')
        const user1 = await repo.getUserByTelegramId(generateTelegramIdFromSeed('user1'), 1)
        const user2 = await repo.getUserByTelegramId(generateTelegramIdFromSeed('user2'))
        
        user1.target = user2
        await repo.saveExistingUsers(user1)
    
        const updatedUser = await repo.getUserByTelegramId(generateTelegramIdFromSeed('user1'), 1)
        expect(updatedUser.target.id).toBe(user2.id)
    });
    
    test(`given a user with a target, when i want to reassign the target to null, 
        it is persisted on data store`, async () => 
    {
        await seedDbWithRingOfNPlayers(3)
        const user1 = await repo.getUserByTelegramId(generateTelegramIdFromSeed('user1'), 1)
        
        user1.die()
        await repo.saveExistingUsers(user1)
    
        const updatedUser = await repo.getUserByTelegramId(generateTelegramIdFromSeed('user1'), 1)
        expect(updatedUser.target).toBeNull()
    });
    
    test(`given many users, when i want to update all of them, i save all their data`, async () => 
    {
        await seedDbWithRingOfNPlayers(3)
        const user1 = await repo.getUserByTelegramId(generateTelegramIdFromSeed('user1'), 1)
        const user2 = user1.target
        
        user1.lastKill = new Date(2001, 10, 2)
        user2.lastKill = new Date(2001, 10, 3)
        await repo.saveExistingUsers(user1, user2)
    
        const updatedUser1 = await repo.getUserByTelegramId(generateTelegramIdFromSeed('user1'))
        const updatedUser2 = await repo.getUserByTelegramId(generateTelegramIdFromSeed('user2'))
        expect(updatedUser1.lastKill).toEqual(new Date(2001, 10, 2))
        expect(updatedUser2.lastKill).toEqual(new Date(2001, 10, 3))
    });
})
