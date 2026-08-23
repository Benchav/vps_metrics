"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMetricsHistory = getMetricsHistory;
exports.startMonitoring = startMonitoring;
const hardware_service_1 = require("./services/hardware.service");
const alert_engine_1 = require("./services/alert.engine");
const INTERVAL_MS = 2000;
const SERVER_VERSION = Date.now().toString();
// State managers
const alertEngine = new alert_engine_1.AlertEngine(100);
const metricsHistory = [];
const MAX_HISTORY = 30; // Keeps 1 minute of data if INTERVAL_MS = 2000
function getMetricsHistory() {
    return metricsHistory;
}
function startMonitoring(io) {
    console.log('Started hardware monitoring loop...');
    setInterval(() => __awaiter(this, void 0, void 0, function* () {
        try {
            const rawMetrics = yield (0, hardware_service_1.getHardwareMetrics)();
            alertEngine.evaluate(rawMetrics);
            const metrics = Object.assign(Object.assign({ serverVersion: SERVER_VERSION, timestamp: new Date().toISOString() }, rawMetrics), { alerts: alertEngine.getHistory() });
            // Update history buffer
            metricsHistory.push(metrics);
            if (metricsHistory.length > MAX_HISTORY) {
                metricsHistory.shift();
            }
            // Emit to all connected clients
            io.emit('metrics', metrics);
        }
        catch (err) {
            console.error('Error fetching metrics:', err);
        }
    }), INTERVAL_MS);
}
