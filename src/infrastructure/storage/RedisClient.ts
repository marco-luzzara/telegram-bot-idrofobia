import config from 'config'
import { createClient } from 'redis'

const client = createClient({
    url: config.Redis.url
})
await client.connect()

export default client