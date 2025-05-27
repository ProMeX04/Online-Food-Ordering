import express from "express";
import cors from "cors";
import router from "./routes/index";
import { API_PREFIX } from "./config";
import { connectDB } from "./config/mongodb";
import path from "path";
import compression from "compression";
import morgan from "morgan";
import { connectElasticsearch } from "./config/elasticSearch";

connectDB()
connectElasticsearch()


const compressOptions = {
    threshold: 1024,
    level: 6,
}

const app = express();
app.use(cors());
app.use(express.json());
app.use(compression(compressOptions));
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(API_PREFIX, router)


app.listen(3000, '0.0.0.0', () => {
    console.log(" Server is running on port 3000");
});
