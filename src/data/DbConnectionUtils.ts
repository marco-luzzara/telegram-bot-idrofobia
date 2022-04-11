import { Sequelize } from 'sequelize'
import * as config from 'config'

const connString = config.Db.connectionString
const sequelize = new Sequelize(connString, {
        logging: config.Db.logging
    })

export { sequelize as dbInstance }