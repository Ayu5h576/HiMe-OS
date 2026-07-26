import { DeviceType } from '@prisma/client';

export class DeviceRegistryService {
  private defaultCapabilities: Record<DeviceType, string[]> = {
    LIGHT: ['turnOn', 'turnOff', 'brightness', 'setColor'],
    FAN: ['turnOn', 'turnOff', 'speed'],
    THERMOSTAT: ['temperature', 'setPoint', 'mode'],
    LOCK: ['lock', 'unlock'],
    CAMERA: ['recordVideo', 'snapshot', 'stream'],
    SENSOR: ['detectMotion', 'readSensor'],
    SWITCH: ['turnOn', 'turnOff', 'toggle'],
    CUSTOM: ['status'],
  };

  getDefaultCapabilities(type: DeviceType): string[] {
    return this.defaultCapabilities[type] ?? ['status'];
  }

  resolveCapabilities(
    type: DeviceType,
    userCapabilities?: string[] | Record<string, unknown>,
  ): string[] | Record<string, unknown> {
    if (userCapabilities) {
      return userCapabilities;
    }
    return this.getDefaultCapabilities(type);
  }
}
