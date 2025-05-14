import { Client } from '@elastic/elasticsearch'

const elasticNode = process.env.ELASTICSEARCH_NODE || 'http://localhost:9200'
const elasticUsername = process.env.ELASTICSEARCH_USERNAME
const elasticPassword = process.env.ELASTICSEARCH_PASSWORD

const esClient = new Client({
    node: elasticNode,
    auth: elasticUsername && elasticPassword ? {
        username: elasticUsername,
        password: elasticPassword
    } : undefined
})

const checkConnection = async () => {
    try {
        const info = await esClient.info()
        console.log(`✅ Elasticsearch connected: ${info.name} (version ${info.version.number})`)
        return true
    } catch (error: any) {
        return false
    }
}


const setupDishIndex = async () => {
    try {
        const indexExists = await esClient.indices.exists({
            index: 'dishes'
        })

        if (!indexExists) {
            await createDishIndex()
        }
    } catch (error: any) {
        console.error(`❌ Error setting up Elasticsearch index: ${error.message}`)
    }
}

const createDishIndex = async () => {
    try {
        await esClient.indices.create({
            index: 'dishes',
            mappings: {
                properties: {
                    name: { type: 'text', analyzer: 'standard' },
                    description: { type: 'text', analyzer: 'standard' },
                    price: { type: 'float' },
                    category: { type: 'keyword' },
                    isAvailable: { type: 'boolean' },
                    rating: { type: 'float' },
                    soldCount: { type: 'integer' },
                    imageUrl: { type: 'keyword' },
                    isPopular: { type: 'boolean' },
                    isNewDish: { type: 'boolean' },
                    isSpecial: { type: 'boolean' }
                }
            }
        })
        console.log('✅ Elasticsearch index "dishes" created')
        return true
    } catch (error: any) {
        console.error(`❌ Error creating Elasticsearch index: ${error.message}`)
        return false
    }
}

export { esClient, checkConnection, setupDishIndex, createDishIndex } 