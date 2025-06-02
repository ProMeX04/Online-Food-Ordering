import ChatHistoryWorkerService from "./services/message-worker.service";
import { connectDB } from "./config/mongodb";

connectDB();
ChatHistoryWorkerService.start();
