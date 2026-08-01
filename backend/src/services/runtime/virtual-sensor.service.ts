import { Device, DeviceStatus, ConnectionState, TriggerType } from '@prisma/client';
import { DeviceService } from '../device.service';
import { DeviceSimulatorService } from './device-simulator.service';
import { DeviceEventService } from '../automation/device-event.service';
import { NotificationService } from '../notification/notification.service';

export type VirtualSensorEventType =
  | 'MOTION_DETECTED'
  | 'TEMPERATURE_CHANGE'
  | 'HUMIDITY_CHANGE'
  | 'BATTERY_LOW'
  | 'CONNECTION_LOST'
  | 'CONNECTION_RESTORED'
  | 'DEVICE_ERROR'
  | 'CAPABILITY_CHANGED';

export class VirtualSensorService {
  private deviceService: DeviceService;
  private deviceSimulatorService: DeviceSimulatorService;
  private deviceEventService: DeviceEventService;
  private notificationService: NotificationService;

  constructor(
    deviceService: DeviceService = new DeviceService(),
    deviceSimulatorService: DeviceSimulatorService = new DeviceSimulatorService(),
    deviceEventService: DeviceEventService = new DeviceEventService(),
    notificationService: NotificationService = new NotificationService(),
  ) {
    this.deviceService = deviceService;
    this.deviceSimulatorService = deviceSimulatorService;
    this.deviceEventService = deviceEventService;
    this.notificationService = notificationService;
  }

  /**
   * Triggers a specific virtual sensor event on a device.
   */
  async triggerEvent(
    userId: string,
    deviceId: string,
    eventType: VirtualSensorEventType,
    payload: Record<string, unknown> = {},
  ): Promise<{ device: Device; event: string }> {
    await this.deviceService.getDeviceById(userId, deviceId);
    let stateUpdates: Record<string, unknown> = {};

    switch (eventType) {
      case 'MOTION_DETECTED':
        stateUpdates = { motion: true, lastMotionAt: new Date().toISOString(), ...payload };
        break;
      case 'TEMPERATURE_CHANGE':
        stateUpdates = { temperature: payload.temperature ?? 26.5, ...payload };
        break;
      case 'HUMIDITY_CHANGE':
        stateUpdates = { humidity: payload.humidity ?? 60, ...payload };
        break;
      case 'BATTERY_LOW':
        stateUpdates = { batteryLevel: payload.batteryLevel ?? 10, ...payload };
        break;
      case 'CONNECTION_LOST':
        await this.deviceService.updateDevice(userId, deviceId, {
          connectionState: ConnectionState.DISCONNECTED,
          status: DeviceStatus.OFFLINE,
        });
        break;
      case 'CONNECTION_RESTORED':
        await this.deviceService.updateDevice(userId, deviceId, {
          connectionState: ConnectionState.CONNECTED,
          status: DeviceStatus.ONLINE,
        });
        break;
      case 'DEVICE_ERROR':
        await this.deviceService.updateDevice(userId, deviceId, {
          status: DeviceStatus.ERROR,
        });
        break;
      case 'CAPABILITY_CHANGED':
        stateUpdates = { capabilitiesUpdated: true, ...payload };
        break;
    }

    const updatedDevice = await this.deviceSimulatorService.simulateDeviceUpdate(
      userId,
      deviceId,
      stateUpdates,
    );

    // Process triggers via DeviceEventService
    let triggerType: TriggerType = TriggerType.DEVICE_STATE_CHANGED;
    if (eventType === 'BATTERY_LOW') triggerType = TriggerType.DEVICE_BATTERY_LOW;
    if (eventType === 'CONNECTION_LOST') triggerType = TriggerType.DEVICE_DISCONNECTED;
    if (eventType === 'CONNECTION_RESTORED') triggerType = TriggerType.DEVICE_CONNECTED;
    if (eventType === 'DEVICE_ERROR') triggerType = TriggerType.DEVICE_ERROR;

    try {
      await this.deviceEventService.dispatchDeviceEvent(userId, updatedDevice.projectId, {
        deviceId,
        eventType: triggerType,
        deviceName: updatedDevice.name,
        deviceType: updatedDevice.type,
        currentState: stateUpdates,
        batteryLevel: updatedDevice.batteryLevel ?? undefined,
      });
    } catch {
      // Ignore if no automations match
    }

    // Create Notification if critical sensor event
    if (['BATTERY_LOW', 'DEVICE_ERROR', 'CONNECTION_LOST'].includes(eventType)) {
      await this.notificationService.createNotification(userId, {
        title: `Sensor Alert: ${updatedDevice.name}`,
        message: `Event [${eventType}] triggered on device ${updatedDevice.name}`,
        type: 'DEVICE',
        projectId: updatedDevice.projectId,
        metadata: { deviceId, eventType },
      });
    }

    return { device: updatedDevice, event: eventType };
  }

  /**
   * Generates a random simulated sensor event for a device.
   */
  async triggerRandomEvent(userId: string, deviceId: string) {
    const eventTypes: VirtualSensorEventType[] = [
      'MOTION_DETECTED',
      'TEMPERATURE_CHANGE',
      'HUMIDITY_CHANGE',
      'BATTERY_LOW',
      'CONNECTION_RESTORED',
    ];

    const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    return this.triggerEvent(userId, deviceId, randomType);
  }
}
