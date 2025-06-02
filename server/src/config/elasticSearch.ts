import { Client } from '@elastic/elasticsearch'
import { ELASTICSEARCH_NODE, ELASTICSEARCH_USERNAME, ELASTICSEARCH_PASSWORD } from '@/config'


const esClient = new Client({
    node: ELASTICSEARCH_NODE,
    auth: ELASTICSEARCH_USERNAME && ELASTICSEARCH_PASSWORD ? {
        username: ELASTICSEARCH_USERNAME,
        password: ELASTICSEARCH_PASSWORD
    } : undefined
})

const connectElasticsearch = async () => {
    try {
        await esClient.info()
        console.log(`✅ Elasticsearch connected: ${ELASTICSEARCH_NODE}`)
    } catch (error) {
        console.error(error)
    }
}



export { esClient, connectElasticsearch } 