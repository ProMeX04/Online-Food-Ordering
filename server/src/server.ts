import express from "express";
import cors from "cors";
import router from "./routes/index";
import { API_PREFIX } from "./config";
import { connectDB } from "./config/mongodb";
import path from "path";
import SearchService from "./services/search.service";
import { checkConnection } from "./config/elasticSearch";
import DishService from "./services/dish.service";
import compression from "compression";
import morgan from "morgan";


connectDB()
const initElasticsearch = async () => {
    try {
        const connected = await checkConnection();
        if (!connected) {
            console.warn('⚠️ Không thể kết nối với Elasticsearch. Tìm kiếm nâng cao sẽ không hoạt động.');
            return;
        }
        SearchService.resetIndexStatus();

        const autoSync = process.env.AUTO_SYNC_ELASTICSEARCH !== 'false';
        if (autoSync) {
            console.info('🔄 Bắt đầu đồng bộ dữ liệu từ MongoDB sang Elasticsearch...');
            const success = await DishService.syncAllDishesToElasticsearch();
            if (success) {
                console.info('✅ Đồng bộ dữ liệu từ MongoDB sang Elasticsearch thành công');
            } else {
                console.warn('⚠️ Đồng bộ dữ liệu từ MongoDB sang Elasticsearch không thành công');
            }
        }
    } catch (error: any) {
        console.error(`❌ Lỗi khi khởi tạo Elasticsearch: ${error.message}`);
    }
}
initElasticsearch();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(compression({
    threshold: 0,
    filter: (req, res) => {
        const acceptEncoding = req.get('Accept-Encoding') || '';
        const shouldCompress = acceptEncoding.includes('gzip') && compression.filter(req, res);
        console.log(`Compression decision for ${req.url}:`, {
            acceptEncoding,
            shouldCompress
        });
        return shouldCompress;
    },
    level: 6
}));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use(API_PREFIX, router)


app.listen(3000, () => {
    console.log("✅ Server is running on port 3000");
});
