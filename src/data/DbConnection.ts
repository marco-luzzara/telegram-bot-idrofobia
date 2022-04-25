import { Sequelize } from 'sequelize'
import config from 'config'

const connString = config.Db.connectionString
const sequelize = new Sequelize(connString, {
        logging: config.Db.logging
    })

export { sequelize as dbInstance }