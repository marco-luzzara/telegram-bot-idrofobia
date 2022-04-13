import { DataTypes, 
    InferAttributes, 
    InferCreationAttributes, Model } from 'sequelize'
    
import AdminUser from '../../model/domain/AdminUser'
import { dbInstance as sequelize } from '../DbConnection'

export default class AdminUserModel extends Model<InferAttributes<AdminUserModel>, InferCreationAttributes<AdminUserModel>> {
    declare telegramId: string
    declare name: string
    declare surname: string

    getAdminUser(): AdminUser {
        return new AdminUser()
    }
}

AdminUserModel.init(
        {
            telegramId: {
                type: DataTypes.STRING,
                primaryKey: true,
                field: 'telegram_id'
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
            }
        },
        {
            sequelize,
            modelName: 'adminUser',
            tableName: 'bot_admins',
            timestamps: false
        }
    );