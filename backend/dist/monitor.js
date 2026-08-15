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
function startMonitoring(io) {
    console.log('Started hardware monitoring loop...');
    setInterval(() => __awaiter(this, void 0, void 0, function* () {
        try {
            // Run queries in parallel for efficiency
            const [cpu, mem, osInfo, currentLoad, fsSize, networkStats] = yield Promise.all([
                systeminformation_1.default.cpu(),
                systeminformation_1.default.mem(),
                systeminformation_1.default.osInfo(),
                systeminformation_1.default.currentLoad(),
                systeminformation_1.default.fsSize(),
                systeminformation_1.default.networkStats()
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
                    free: mem.available,
                    usagePercentage: (mem.active / mem.total) * 100
                },
                disks: fsSize.map(disk => ({
                    fs: disk.fs,
                    type: disk.type,
                    size: disk.size,
                    used: disk.used,
                    usePercentage: disk.use
                })),
                network: networkStats.length > 0 ? {
                    interface: networkStats[0].iface,
                    rx_sec: networkStats[0].rx_sec,
                    tx_sec: networkStats[0].tx_sec
                } : null,
                os: {
                    platform: osInfo.platform,
                    distro: osInfo.distro,
                    release: osInfo.release,
                    uptime: systeminformation_1.default.time().uptime
                }
            };
            io.emit('metrics', metrics);
        }
        catch (error) {
            console.error('Error fetching system metrics:', error);
        }
    }), INTERVAL_MS);
}
