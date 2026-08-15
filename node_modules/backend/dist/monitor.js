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
const INTERVAL_MS = 2000;
const alertHistory = [];
function addAlert(type, level, message, value) {
    // Debounce: avoid duplicates in the same 10s window
    const now = Date.now();
    const recent = alertHistory.find(a => a.type === type && a.level === level && (now - new Date(a.timestamp).getTime()) < 10000);
    if (recent)
        return;
    alertHistory.unshift({
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
        type, level, message, value
    });
    if (alertHistory.length > 100)
        alertHistory.pop();
}
function startMonitoring(io) {
    console.log('Started hardware monitoring loop...');
    setInterval(() => __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        try {
            const [cpu, mem, osInfo, currentLoad, fsSize, networkStats, time, disksIO] = yield Promise.all([
                systeminformation_1.default.cpu(),
                systeminformation_1.default.mem(),
                systeminformation_1.default.osInfo(),
                systeminformation_1.default.currentLoad(),
                systeminformation_1.default.fsSize(),
                systeminformation_1.default.networkStats(),
                systeminformation_1.default.time(),
                systeminformation_1.default.disksIO().catch(() => null)
            ]);
            const metrics = {
                timestamp: new Date().toISOString(),
                cpu: {
                    manufacturer: cpu.manufacturer,
                    brand: cpu.brand,
                    cores: cpu.cores,
                    physicalCores: cpu.physicalCores,
                    speed: cpu.speed,
                    speedMax: cpu.speedMax,
                    load: currentLoad.currentLoad,
                    loadUser: currentLoad.currentLoadUser,
                    loadSystem: currentLoad.currentLoadSystem,
                },
                memory: {
                    total: mem.total,
                    used: mem.active,
                    free: mem.free,
                    buffcache: mem.buffcache,
                    available: mem.available,
                    swapTotal: mem.swaptotal,
                    swapUsed: mem.swapused,
                    usagePercentage: (mem.active / mem.total) * 100,
                },
                disks: fsSize.map(disk => ({
                    fs: disk.fs,
                    type: disk.type,
                    size: disk.size,
                    used: disk.used,
                    usePercentage: disk.use,
                })),
                diskIO: disksIO ? {
                    readSpeed: Math.max(0, (_a = disksIO.rIO_sec) !== null && _a !== void 0 ? _a : 0),
                    writeSpeed: Math.max(0, (_b = disksIO.wIO_sec) !== null && _b !== void 0 ? _b : 0),
                    readOps: Math.max(0, (_c = disksIO.rIO) !== null && _c !== void 0 ? _c : 0),
                    writeOps: Math.max(0, (_d = disksIO.wIO) !== null && _d !== void 0 ? _d : 0),
                } : null,
                network: networkStats.length > 0 ? {
                    interface: networkStats[0].iface,
                    rx_sec: Math.max(0, (_e = networkStats[0].rx_sec) !== null && _e !== void 0 ? _e : 0),
                    tx_sec: Math.max(0, (_f = networkStats[0].tx_sec) !== null && _f !== void 0 ? _f : 0),
                    rx_bytes: (_g = networkStats[0].rx_bytes) !== null && _g !== void 0 ? _g : 0,
                    tx_bytes: (_h = networkStats[0].tx_bytes) !== null && _h !== void 0 ? _h : 0,
                } : null,
                os: {
                    platform: osInfo.platform,
                    distro: osInfo.distro,
                    release: osInfo.release,
                    uptime: time.uptime,
                },
                alerts: alertHistory,
            };
            // ── Alert Engine ─────────────────────────────────
            if (metrics.cpu.load > 95)
                addAlert('cpu', 'danger', `Critical CPU Load: ${metrics.cpu.load.toFixed(1)}%`, metrics.cpu.load);
            else if (metrics.cpu.load > 85)
                addAlert('cpu', 'warning', `High CPU Load: ${metrics.cpu.load.toFixed(1)}%`, metrics.cpu.load);
            if (metrics.memory.usagePercentage > 95)
                addAlert('ram', 'danger', `Critical RAM: ${metrics.memory.usagePercentage.toFixed(1)}%`, metrics.memory.usagePercentage);
            else if (metrics.memory.usagePercentage > 85)
                addAlert('ram', 'warning', `High RAM Usage: ${metrics.memory.usagePercentage.toFixed(1)}%`, metrics.memory.usagePercentage);
            metrics.disks.forEach(d => {
                if (d.usePercentage > 95)
                    addAlert('disk', 'danger', `Critical Disk ${d.fs}: ${d.usePercentage.toFixed(1)}%`, d.usePercentage);
                else if (d.usePercentage > 90)
                    addAlert('disk', 'warning', `Disk ${d.fs} almost full: ${d.usePercentage.toFixed(1)}%`, d.usePercentage);
            });
            io.emit('metrics', metrics);
        }
        catch (err) {
            console.error('Error fetching metrics:', err);
        }
    }), INTERVAL_MS);
}
