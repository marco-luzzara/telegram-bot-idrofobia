import { PlayingUser } from '../../model/domain/User'
import { PlayingUserModel, UserModel } from '../model/UserModel'
import IUserRepository from '../../model/interfaces/data/IUserRepository'
import TelegramId from '../../model/custom_types/TelegramId';
import { Includeable } from 'sequelize/types';

export default class UserRepository implements IUserRepository {
    async findPlayerThatHasTarget(target: PlayingUser, nestedLevel: number): Promise<PlayingUserModel> {
        return null
    }

    async getByTelegramId(telegramId: TelegramId, nestedLevel: number = 0): Promise<PlayingUserModel> {
        const includeOption = this.createRecursiveIncludeOption(nestedLevel)

        const playingUserModel = await PlayingUserModel.findOne({
            where: {
                telegramId: telegramId.toString()
            },
            include: this.createRecursiveIncludeOption(nestedLevel)
        })

        return playingUserModel;
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

    async getAllUsers(): Promise<PlayingUserModel[]> {
        return await PlayingUserModel.findAll()
    }
}