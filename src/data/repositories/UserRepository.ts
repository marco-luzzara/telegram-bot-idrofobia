import { strict as assert } from 'assert';

import PlayingUser from '../../model/domain/PlayingUser'
import { PlayingUserModel, UserModel } from '../model/UserModel'
import IUserRepository from './interfaces/IUserRepository'
import TelegramId from '../../model/custom_types/TelegramId';
import { FindOptions, Includeable, Op } from 'sequelize';
import { dbInstance } from '../DbConnection';

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

    async * getAllUsers(): AsyncGenerator<PlayingUser, any, undefined> {
        yield* this.getAllUsersWithFilters()
    }

    async * getAllLivingUsers(): AsyncGenerator<PlayingUser, any, undefined> {
        yield* this.getAllUsersWithFilters({
            [Op.and]: [
                {
                    lastKill: {
                        [Op.not]: null
                    },
                    target: {
                        [Op.not]: null
                    }
                }
            ]
        })
    }

    async getUserFromTargetTId(telegramId: TelegramId, nestedLevel: number): Promise<PlayingUser> {
        assert(nestedLevel >= 1, 'cannot check the telegramId if you do not load the associated target')
        const includeOption = this.createRecursiveIncludeOption(nestedLevel)

        const playingUserModel = await PlayingUserModel.findOne(
            {
                where: {
                    '$targetUser.telegram_id$': telegramId.toString()
                },
                include: includeOption
            }
        )

        return playingUserModel?.getPlayingUser(nestedLevel) ?? null
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

    private async * getAllUsersWithFilters(whereOptions?: object): AsyncGenerator<PlayingUser, any, undefined> {
        let fetchedRows = 0
        let players: PlayingUser[] = []
        do {
            const findAllOptions = {
                    include: {
                        model: UserModel
                    },
                    limit: 10,
                    offset: fetchedRows
                }
            if (whereOptions !== undefined)
                findAllOptions['where'] = whereOptions
            // TODO: can be optimized by starting the next promise (but not awaiting it)
            //       before the yield
            players = (await PlayingUserModel.findAll(findAllOptions))
                .map(m => m.getPlayingUser());

            if (players.length > 0)
                yield* players

            fetchedRows += players.length
        } while (players.length > 0)
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
}