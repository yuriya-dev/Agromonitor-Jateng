"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const morgan_1 = __importDefault(require("morgan"));
const commodityRoutes_1 = __importDefault(require("./routes/commodityRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5001;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, morgan_1.default)('dev'));
// API Routes
app.use('/api/commodities', commodityRoutes_1.default);
app.use('/api/notifications', notificationRoutes_1.default);
// Basic Route
app.get('/', (req, res) => {
    res.json({
        message: 'Agromonitor Jateng API is running',
        version: '1.0.0',
    });
});
// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map