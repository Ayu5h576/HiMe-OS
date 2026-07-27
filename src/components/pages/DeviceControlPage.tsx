import React, { useState } from 'react';
import { 
  Laptop, 
  Smartphone, 
  Activity, 
  Server, 
  Lightbulb, 
  RotateCw, 
  Radio,
  X
} from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import type { DeviceItem } from '../../types';

interface DeviceControlPageProps {
  devices: DeviceItem[];
}

export const DeviceControlPage: React.FC<DeviceControlPageProps> = ({ devices }) => {
  const [deviceList, setDeviceList] = useState<DeviceItem[]>(devices);
  const [selectedDevice, setSelectedDevice] = useState<DeviceItem | null>(null);
  const [pingMessage, setPingMessage] = useState<string | null>(null);

  const deviceCategoryIcons: Record<string, React.ReactNode> = {
    'laptop': <Laptop className="w-6 h-6 text-cyan-400" />,
    'phone': <Smartphone className="w-6 h-6 text-blue-400" />,
    'wearable': <Activity className="w-6 h-6 text-purple-400" />,
    'hub': <Server className="w-6 h-6 text-emerald-400" />,
    'iot': <Lightbulb className="w-6 h-6 text-amber-400" />
  };

  const handlePingDevice = (dev: DeviceItem) => {
    setPingMessage(`Ping packet sent to ${dev.name} [${dev.ipAddress}]... Response: 4ms latency. Signal 100%.`);
    setTimeout(() => setPingMessage(null), 4000);
  };

  const handleToggleStatus = (id: string) => {
    setDeviceList((prev) => prev.map(d => {
      if (d.id === id) {
        const nextStatus = d.status === 'online' ? 'standby' : 'online';
        return { ...d, status: nextStatus };
      }
      return d;
    }));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Card */}
      <GlassCard className="p-6 rounded-3xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl glass border border-emerald-400/30 text-emerald-400">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Connected Device Mesh
                <span className="text-xs px-3 py-0.5 rounded-full bg-emerald-400 text-black font-extrabold font-mono glow-cyan">
                  {deviceList.filter(d => d.status === 'online').length} Active
                </span>
              </h2>
              <p className="text-xs text-white/50 font-mono">Real-time BLE & encrypted RPC network topology</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setDeviceList([...deviceList])}
              className="px-4 py-2 rounded-full glass hover:bg-white/15 border border-white/20 text-xs font-mono font-bold text-white flex items-center gap-2 transition-all uppercase tracking-wider"
            >
              <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Rescan Mesh</span>
            </button>
          </div>
        </div>

        {pingMessage && (
          <div className="mt-4 p-3.5 rounded-2xl glass border border-emerald-400/40 text-xs font-mono text-emerald-400 animate-in fade-in font-bold">
            {pingMessage}
          </div>
        )}
      </GlassCard>

      {/* Device Mesh Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {deviceList.map((dev) => (
          <GlassCard key={dev.id} glowColor="emerald" className="p-6 space-y-4 flex flex-col justify-between rounded-3xl">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="p-3 rounded-2xl glass border border-white/10">
                  {deviceCategoryIcons[dev.category] || <Server className="w-6 h-6 text-cyan-400" />}
                </div>

                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${dev.status === 'online' ? 'bg-emerald-400 animate-pulse glow-cyan' : 'bg-amber-400'}`} />
                  <span className="text-[11px] font-mono font-extrabold uppercase text-white/80">{dev.status}</span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white leading-snug">{dev.name}</h3>
                <p className="text-[11px] text-white/50 font-mono mt-0.5">{dev.osVersion}</p>
              </div>

              {/* Telemetry metrics bar */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/10 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-white/40 font-extrabold uppercase tracking-wider block">IP ADDRESS</span>
                  <span className="text-white/80 font-bold">{dev.ipAddress}</span>
                </div>
                <div>
                  <span className="text-[10px] text-white/40 font-extrabold uppercase tracking-wider block">BATTERY</span>
                  <span className="text-emerald-400 font-extrabold">{dev.batteryPct ? `${dev.batteryPct}%` : 'AC Power'}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-mono">
              <button
                onClick={() => handlePingDevice(dev)}
                className="px-3.5 py-1.5 rounded-full glass text-white/70 hover:text-white transition-colors font-bold text-[11px]"
              >
                Ping RPC
              </button>

              <button
                onClick={() => setSelectedDevice(dev)}
                className="px-4 py-1.5 rounded-full bg-cyan-400 text-black font-extrabold text-[11px] uppercase tracking-wider glow-cyan transition-all hover:bg-cyan-300"
              >
                Telemetry
              </button>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Selected Device Detail Dialog */}
      {selectedDevice && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-6 rounded-3xl glass border border-cyan-400/40 shadow-2xl space-y-5 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl glass border border-emerald-400/40">
                  {deviceCategoryIcons[selectedDevice.category]}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{selectedDevice.name}</h3>
                  <p className="text-xs text-white/50 font-mono">{selectedDevice.osVersion}</p>
                </div>
              </div>
              <button onClick={() => setSelectedDevice(null)} className="text-white/50 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-4 rounded-2xl glass border border-white/10 space-y-2">
                <div className="flex justify-between">
                  <span className="text-white/60">Connection Signal</span>
                  <span className="text-emerald-400 font-extrabold">{selectedDevice.connectionSignal}% (Wi-Fi 7 / BLE)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Temperature</span>
                  <span className="text-cyan-400 font-bold">{selectedDevice.temperatureC || 36}°C Nominal</span>
                </div>
                {selectedDevice.details && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-white/60">CPU Load</span>
                      <span className="text-purple-400 font-bold">{selectedDevice.details.cpuLoad}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Bandwidth Speed</span>
                      <span className="text-cyan-400 font-bold">{selectedDevice.details.networkSpeedMbps} Mbps</span>
                    </div>
                  </>
                )}
              </div>

              <div className="pt-2 grid grid-cols-2 gap-3">
                <button
                  onClick={() => { handleToggleStatus(selectedDevice.id); setSelectedDevice(null); }}
                  className="py-3 rounded-full glass border border-white/20 text-white font-extrabold uppercase tracking-wider transition-colors hover:bg-white/15"
                >
                  Toggle Power
                </button>
                <button
                  onClick={() => handlePingDevice(selectedDevice)}
                  className="py-3 rounded-full bg-cyan-400 text-black font-extrabold uppercase tracking-wider glow-cyan hover:bg-cyan-300 transition-colors"
                >
                  Ping Telemetry
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
