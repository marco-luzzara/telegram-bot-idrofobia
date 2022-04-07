import { BelongsToCreateAssociationMixin, BelongsToGetAssociationMixin, BelongsToSetAssociationMixin, CreationOptional, DataTypes, HasOneCreateAssociationMixin, HasOneGetAssociationMixin, HasOneSetAssociationMixin, InferAttributes, InferCreationAttributes, Model } from 'sequelize'
import { dbInstance as sequelize } from '../DbConnectionUtils'

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
            }
        },
        {
            sequelize,
            modelName: 'User',
            tableName: 'players',
            timestamps: false
        }
    );

class PlayingUserModel extends Model<InferAttributes<PlayingUserModel>, InferCreationAttributes<PlayingUserModel>> {
    declare id: number
    declare telegramId: string
    declare lastKill: Date

    declare getUser: BelongsToGetAssociationMixin<UserModel>;
    declare setUser: BelongsToSetAssociationMixin<UserModel, number>;
    declare createUser: BelongsToCreateAssociationMixin<UserModel>;

    declare getTarget: HasOneGetAssociationMixin<PlayingUserModel>;
    declare setTarget: HasOneSetAssociationMixin<PlayingUserModel, number>;
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
            }
        },
        {   
            sequelize, 
            modelName: 'PlayingUser',
            tableName: 'idrofobia_players',
            timestamps: false
        }
    );

PlayingUserModel.belongsTo(UserModel, { foreignKey: 'id' });

PlayingUserModel.hasOne(PlayingUserModel, { foreignKey: 'target', as: 'Target' })

export { UserModel, PlayingUserModel };