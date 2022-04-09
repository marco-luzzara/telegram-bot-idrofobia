import { Sequelize } from 'sequelize'
import * as config from 'config'

const connString = config.Db.connectionString
const sequelize = new Sequelize(connString)

export { sequelize as dbInstance }