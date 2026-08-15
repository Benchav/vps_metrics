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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startMonitoring = startMonitoring;
const systeminformation_1 = __importDefault(require("systeminformation"));
const INTERVAL_MS = 2000; // Emit every 2 seconds
// Simple in-memory alert history (last 50 alerts)
const alertHistory = [];
function addAlert(type, level, message, value) {
    const newAlert = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
        type,
        level,
        message,
        value
    };
    alertHistory.unshift(newAlert);
    if (alertHistory.length > 50) {
        alertHistory.pop();
    }
}
function startMonitoring(io) {
    console.log('Started hardware monitoring loop...');
    setInterval(() => __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            // Run queries in parallel for efficiency
            // si.time() is included here — calling it outside Promise.all would block synchronously
            const [cpu, mem, osInfo, currentLoad, fsSize, networkStats, time] = yield Promise.all([
                systeminformation_1.default.cpu(),
                systeminformation_1.default.mem(),
                systeminformation_1.default.osInfo(),
                systeminformation_1.default.currentLoad(),
                systeminformation_1.default.fsSize(),
                systeminformation_1.default.networkStats(),
                systeminformation_1.default.time()
            ]);
            const metrics = {
                timestamp: new Date().toISOString(),
                cpu: {
                    manufacturer: cpu.manufacturer,
                    brand: cpu.brand,
                    cores: cpu.cores,
                    speed: cpu.speed,
                    load: currentLoad.currentLoad // percentage
                },
                memory: {
                    total: mem.total,
                    used: mem.active,
                    free: mem.free,
                    buffcache: mem.buffcache,
                    available: mem.available,
                    usagePercentage: (mem.active / mem.total) * 100
                },
                disks: fsSize.map(disk => ({
                    fs: disk.fs,
                    type: disk.type,
                    size: disk.size,
                    used: disk.used,
                    usePercentage: disk.use
                })),
                // systeminformation returns -1 for rx_sec/tx_sec on the first sample
                // because it needs two data points to calculate throughput. Clamp to 0.
                network: networkStats.length > 0 ? {
                    interface: networkStats[0].iface,
                    rx_sec: Math.max(0, (_a = networkStats[0].rx_sec) !== null && _a !== void 0 ? _a : 0),
                    tx_sec: Math.max(0, (_b = networkStats[0].tx_sec) !== null && _b !== void 0 ? _b : 0)
                } : null,
                os: {
                    platform: osInfo.platform,
                    distro: osInfo.distro,
                    release: osInfo.release,
                    uptime: time.uptime
                },
                alerts: alertHistory
            };
            // --- Evaluate Alerts ---
            // CPU
            if (metrics.cpu.load > 95) {
                addAlert('cpu', 'danger', `Critical CPU Load: ${metrics.cpu.load.toFixed(1)}%`, metrics.cpu.load);
            }
            else if (metrics.cpu.load > 90) {
                addAlert('cpu', 'warning', `High CPU Load: ${metrics.cpu.load.toFixed(1)}%`, metrics.cpu.load);
            }
            // RAM
            if (metrics.memory.usagePercentage > 95) {
                addAlert('ram', 'danger', `Critical RAM Usage: ${metrics.memory.usagePercentage.toFixed(1)}%`, metrics.memory.usagePercentage);
            }
            else if (metrics.memory.usagePercentage > 90) {
                addAlert('ram', 'warning', `High RAM Usage: ${metrics.memory.usagePercentage.toFixed(1)}%`, metrics.memory.usagePercentage);
            }
            // Disk
            metrics.disks.forEach(disk => {
                if (disk.usePercentage > 95) {
                    addAlert('disk', 'danger', `Critical Disk Usage on ${disk.fs}: ${disk.usePercentage.toFixed(1)}%`, disk.usePercentage);
                }
                else if (disk.usePercentage > 90) {
                    addAlert('disk', 'warning', `High Disk Usage on ${disk.fs}: ${disk.usePercentage.toFixed(1)}%`, disk.usePercentage);
                }
            });
            // ------------------------
            io.emit('metrics', metrics);
        }
        catch (error) {
            console.error('Error fetching system metrics:', error);
        }
    }), INTERVAL_MS);
}
