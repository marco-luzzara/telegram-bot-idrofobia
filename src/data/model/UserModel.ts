import { BelongsToCreateAssociationMixin, BelongsToGetAssociationMixin, 
    BelongsToSetAssociationMixin, CreationOptional, DataTypes, 
    HasOneGetAssociationMixin, HasOneSetAssociationMixin, InferAttributes, 
    InferCreationAttributes, Model, NonAttribute } from 'sequelize'
import { createThrowingProxy } from '../../infrastructure/utilities/ProxyUtil'
import TelegramId from '../../model/custom_types/TelegramId'
import UserInfo from '../../model/custom_types/UserInfo'
import { PlayingUser } from '../../model/domain/User'
import { dbInstance as sequelize } from '../DbConnectionUtils'

const util = require('util')

class UserModel extends Model<InferAttributes<UserModel>, InferCreationAttributes<UserModel>> {
    declare id: CreationOptional<number>
    declare name: string
    declare surname: string
    declare address: string
}

UserModel.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                field: 'id'
            },
            name: {
                type: DataTypes.STRING(100),
                allowNull: false,
                field: 'name'
            },
            surname: {
                type: DataTypes.STRING(100),
                allowNull: false,
                field: 'surname'
            },
            address: {
                type: DataTypes.STRING(100),
                allowNull: false,
                field: 'address'
            },

        },
        {
            sequelize,
            modelName: 'user',
            tableName: 'players',
            timestamps: false
        }
    );

class PlayingUserModel extends Model<InferAttributes<PlayingUserModel>, InferCreationAttributes<PlayingUserModel>> {
    declare id: number
    declare telegramId: string
    declare lastKill: Date | null
    declare profilePictureUrl: string

    declare getUser: BelongsToGetAssociationMixin<UserModel>;
    declare setUser: BelongsToSetAssociationMixin<UserModel, number>;
    declare createUser: BelongsToCreateAssociationMixin<UserModel>;
    declare user?: NonAttribute<UserModel>


    declare getTargetUser: HasOneGetAssociationMixin<PlayingUserModel>;
    declare setTargetUser: HasOneSetAssociationMixin<PlayingUserModel, number>;
    declare targetUser?: NonAttribute<PlayingUserModel>

    getUserInfo(userModel: UserModel): UserInfo {
        return new UserInfo(
                userModel.name, 
                userModel.surname, 
                userModel.address, 
                new URL(this.profilePictureUrl),
                new TelegramId(this.telegramId)
            )
    }

    /**
     * converts a `PlayingUserModel` into the domain-specific `PlayingUser`.
     * @param repo 
     * @param playingUserModel 
     * @param nestedLevel it specifies the number of target the `PlayingUser` will need to 
     * traverse. For example, with `nestedLevel = 2`, the entity can access all the members of
     * `this.targetUser.targetUser`
     * @returns the `PlayingUser` instance
     */
    getPlayingUser(nestedLevel: number = 0): PlayingUser {
        // if i try to access a target that i have not loaded with eager loading,
        // then it throws. in this way i must set in advance the number of targets 
        // i need to load
        const userTarget = this.targetUser?.getPlayingUser(nestedLevel - 1) ?? createThrowingProxy<PlayingUser>()
        
        const userInfo = this.getUserInfo(this.user)
        const playingUser = new PlayingUser( 
            userInfo,
            userTarget,
            this.lastKill)
        playingUser.id = this.id

        return playingUser
    }

    /**
     * reflect the fields of `playingUser` into this instance. 
     * Note: associations are ignored
     * @param playingUser 
     */
    async updateFromPlayingUser(playingUser: PlayingUser): Promise<void> {
        this.lastKill = playingUser.lastKill
        await this.save()
        if (!util.types.isProxy(playingUser.target))
            await this.setTargetUser(playingUser.target?.id ?? null)
    }
}

PlayingUserModel.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                field: 'id'
            },
            telegramId: {
                type: DataTypes.STRING(100),
                allowNull: false,
                field: 'telegram_id',
                unique: true
            },
            lastKill: {
                type: DataTypes.DATE,
                field: 'last_kill'
            },
            profilePictureUrl: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    isUrl: true
                },
                field: 'profile_picture_url'
            }
        },
        {   
            sequelize, 
            modelName: 'playingUser',
            tableName: 'idrofobia_players',
            timestamps: false
        }
    );

PlayingUserModel.belongsTo(UserModel, { foreignKey: 'id' });

PlayingUserModel.belongsTo(PlayingUserModel, { foreignKey: 'target', as: 'targetUser' })

export { UserModel, PlayingUserModel };