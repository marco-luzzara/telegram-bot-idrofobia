import { PlayingUser } from '../../model/domain/User'
import { PlayingUserModel, UserModel } from '../model/UserModel'
import IUserRepository from './interfaces/IUserRepository'
import TelegramId from '../../model/custom_types/TelegramId';
import { Includeable } from 'sequelize/types';
import { dbInstance } from '../DbConnectionUtils';

export default class UserRepository implements IUserRepository {
    async getUserByTelegramId(telegramId: TelegramId, nestedLevel: number = 0): Promise<PlayingUser> {
        const includeOption = this.createRecursiveIncludeOption(nestedLevel)

        const playingUserModel = await PlayingUserModel.findOne({
            where: {
                telegramId: telegramId.toString()
            },
            include: includeOption
        })

        return playingUserModel?.getPlayingUser(nestedLevel) ?? null;
    }

    private createRecursiveIncludeOption(nestedLevel: number): Includeable {
        return nestedLevel == 0 ? 
            {
                model: UserModel
            } : 
            [
                {
                    model: UserModel
                },
                {
                    model: PlayingUserModel,
                    as: 'targetUser',
                    include: this.createRecursiveIncludeOption(nestedLevel - 1)
                }
            ] as Includeable
    }

    async getAllUsers(): Promise<PlayingUser[]> {
        return (await PlayingUserModel.findAll({
                    include: {
                        model: UserModel
                    }
                }
            )).map(m => m.getPlayingUser())
    }

    async saveExistingUsers(...playingUsers: PlayingUser[]): Promise<void> {
        await dbInstance.transaction(async (t) => 
            {
                for (const playingUser of playingUsers) {
                    const data = PlayingUserModel.getModelDataFromDomainUser(playingUser)
                    await PlayingUserModel.update(data, {
                            where: {
                                id: playingUser.id
                            },
                            transaction: t
                        })
                }
            })
    }
}