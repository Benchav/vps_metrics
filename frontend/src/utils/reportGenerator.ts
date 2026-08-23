import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { SystemMetrics } from '@vps-metrics/shared';

// Helper to format bytes
function formatBytes(bytes: number) {
  if (!bytes || bytes === 0) return '0 B/s';
  const k = 1024;
  const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function generatePDFReport(metrics: SystemMetrics, history: SystemMetrics[]) {
  // Create document: A4 landscape for better data table viewing
  const doc = new jsPDF({ orientation: 'landscape' });
  const pageWidth = doc.internal.pageSize.width;

  // ── 1. Header ────────────────────────────────────────────────────────────
  doc.setFillColor(8, 11, 16);
  doc.rect(0, 0, pageWidth, 24, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('System Performance Report', 14, 15);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(180, 180, 180);
  doc.text(`Generated at: ${new Date().toLocaleString()}`, pageWidth - 14, 15, { align: 'right' });

  // ── 2. Server Information ────────────────────────────────────────────────
  let currentY = 34;
  doc.setTextColor(40, 40, 40);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Server Environment', 14, currentY);
  
  currentY += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`OS / Platform: ${metrics.os.distro} ${metrics.os.release} (${metrics.os.platform})`, 14, currentY);
  currentY += 6;
  doc.text(`Processor: ${metrics.cpu.manufacturer} ${metrics.cpu.brand} (${metrics.cpu.cores} Cores @ ${metrics.cpu.speed}GHz)`, 14, currentY);
  currentY += 6;
  doc.text(`Total Memory: ${(metrics.memory.total / 1e9).toFixed(2)} GB`, 14, currentY);
  currentY += 6;
  doc.text(`Number of Volumes: ${metrics.disks.length}`, 14, currentY);

  // ── 3. Aggregated Analytics (Last 60s) ──────────────────────────────────
  currentY += 12;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Performance Summary (Capture Window)', 14, currentY);

  currentY += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const cpuLoads = history.map(h => h.cpu.load);
  const memLoads = history.map(h => h.memory.usagePercentage);
  const netRX = history.map(h => h.network ? h.network.rx_sec : 0);
  
  const avgCpu = cpuLoads.reduce((a, b) => a + b, 0) / (cpuLoads.length || 1);
  const maxCpu = Math.max(...cpuLoads, 0);
  
  const avgMem = memLoads.reduce((a, b) => a + b, 0) / (memLoads.length || 1);
  const maxMem = Math.max(...memLoads, 0);

  const avgRx = netRX.reduce((a, b) => a + b, 0) / (netRX.length || 1);

  // Create a mini summary table manually
  doc.setFillColor(245, 247, 250);
  doc.rect(14, currentY - 4, pageWidth - 28, 20, 'F');
  
  doc.setTextColor(60, 60, 60);
  doc.text(`Avg CPU Load: ${avgCpu.toFixed(1)}%`, 20, currentY + 3);
  doc.text(`Peak CPU Load: ${maxCpu.toFixed(1)}%`, 20, currentY + 10);

  doc.text(`Avg RAM Usage: ${avgMem.toFixed(1)}%`, 100, currentY + 3);
  doc.text(`Peak RAM Usage: ${maxMem.toFixed(1)}%`, 100, currentY + 10);

  doc.text(`Avg Network RX: ${formatBytes(avgRx)}`, 180, currentY + 3);
  doc.text(`Critical Alerts: ${metrics.alerts.filter(a => a.level === 'danger').length}`, 180, currentY + 10);

  // ── 4. Detailed Telemetry Table ──────────────────────────────────────────
  currentY += 26;

  const tableHeaders = [['Time', 'CPU Load (%)', 'RAM Usage (%)', 'Disk 0 (%)', 'Net RX', 'Net TX']];
  const tableData = history.map(h => [
    new Date(h.timestamp).toLocaleTimeString(),
    h.cpu.load.toFixed(2),
    h.memory.usagePercentage.toFixed(2),
    (h.disks[0]?.usePercentage || 0).toFixed(2),
    formatBytes(h.network?.rx_sec || 0),
    formatBytes(h.network?.tx_sec || 0)
  ]);

  autoTable(doc, {
    startY: currentY,
    head: tableHeaders,
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [79, 142, 247], textColor: 255 },
    styles: { fontSize: 9, cellPadding: 3 },
    margin: { left: 14, right: 14 },
    alternateRowStyles: { fillColor: [250, 250, 250] },
  });

  // Save PDF
  doc.save(`VPS_Report_${new Date().getTime()}.pdf`);
}
