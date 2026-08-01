import { Device, DeviceType, DeviceStatus, ConnectionState } from '@prisma/client';
import { DeviceService } from '../device.service';
import { RuntimeEventBusService } from './event-bus.service';

export class DeviceSimulatorService {
  private deviceService: DeviceService;

  constructor(deviceService: DeviceService = new DeviceService()) {
    this.deviceService = deviceService;
  }

  /**
   * Generates realistic initial capabilities & state metadata for a virtual device type.
   */
  static getInitialStateForType(type: DeviceType): Record<string, unknown> {
    switch (type) {
      case DeviceType.LIGHT:
        return { power: false, brightness: 80, colorTemp: 3000 };
      case DeviceType.FAN:
        return { power: false, speed: 2, oscillation: false };
      case DeviceType.THERMOSTAT:
        return { currentTemp: 22, targetTemp: 24, mode: 'auto' };
      case DeviceType.LOCK:
        return { locked: true, batteryLevel: 95 };
      case DeviceType.CAMERA:
        return { power: true, recording: false, nightVision: true };
      case DeviceType.SENSOR:
        return { motion: false, temperature: 21.5, humidity: 45, batteryLevel: 90 };
      case DeviceType.SWITCH:
        return { power: false };
      default:
        return { power: false };
    }
  }

  /**
   * Simulates realistic state update on a virtual device.
   */
  async simulateDeviceUpdate(
    userId: string,
    deviceId: string,
    updatedState: Record<string, unknown>,
  ): Promise<Device> {
    const device = await this.deviceService.getDeviceById(userId, deviceId);

    const existingMeta = (device.metadata as Record<string, unknown>) || {};
    const mergedMetadata = {
      ...existingMeta,
      ...updatedState,
      simulatedAt: new Date().toISOString(),
    };

    let batteryLevel = device.batteryLevel;
    if (typeof updatedState.batteryLevel === 'number') {
      batteryLevel = Math.max(0, Math.min(100, updatedState.batteryLevel));
    }

    const updatedDevice = await this.deviceService.updateDevice(userId, deviceId, {
      metadata: mergedMetadata,
      status: DeviceStatus.ONLINE,
      connectionState: ConnectionState.CONNECTED,
      batteryLevel,
    });

    RuntimeEventBusService.publish('DeviceChanged', userId, {
      deviceId: updatedDevice.id,
      deviceName: updatedDevice.name,
      deviceType: updatedDevice.type,
      state: mergedMetadata,
    }, updatedDevice.projectId);

    return updatedDevice;
  }
}
