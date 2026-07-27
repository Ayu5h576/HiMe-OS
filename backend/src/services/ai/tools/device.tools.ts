import { z } from 'zod';
import { Device, DeviceType, DeviceStatus, ConnectionState } from '@prisma/client';
import { ITool, IToolDefinition } from './tool.interface';
import { IToolResponse, ToolResponseFormatter } from './tool-response';
import { ToolValidator } from './tool-validator';
import { DeviceService } from '../../device.service';
import { DeviceRegistryService } from '../../device-registry.service';

function getDeviceCapabilitiesList(
  device: Device,
  registryService: DeviceRegistryService,
): string[] {
  if (Array.isArray(device.capabilities)) {
    return device.capabilities as string[];
  }
  if (device.capabilities && typeof device.capabilities === 'object') {
    return Object.keys(device.capabilities as Record<string, unknown>);
  }
  return registryService.getDefaultCapabilities(device.type);
}

function validateDeviceCapability(
  device: Device,
  capability: string,
  registryService: DeviceRegistryService,
): string | null {
  const caps = getDeviceCapabilitiesList(device, registryService);
  if (!caps.includes(capability)) {
    return `Device '${device.name}' (type: ${device.type}) does not support capability '${capability}'`;
  }
  return null;
}

function validateDeviceOnline(device: Device): string | null {
  if (
    device.status === DeviceStatus.OFFLINE ||
    device.connectionState === ConnectionState.DISCONNECTED
  ) {
    return `Device '${device.name}' is currently offline. Please connect the device first.`;
  }
  return null;
}

export class ListDevicesTool implements ITool {
  readonly name = 'listDevices';
  readonly description = 'List virtual registered devices in a project workspace.';
  readonly parameterSchema = z.object({
    projectId: z.string().min(1, 'projectId is required'),
    type: z.nativeEnum(DeviceType).optional(),
    status: z.nativeEnum(DeviceStatus).optional(),
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(20),
  });

  private deviceService: DeviceService;

  constructor(deviceService: DeviceService = new DeviceService()) {
    this.deviceService = deviceService;
  }

  getDefinition(): IToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          projectId: { type: 'string', description: 'ID of project workspace' },
          type: { type: 'string', enum: Object.values(DeviceType) },
          status: { type: 'string', enum: Object.values(DeviceStatus) },
          page: { type: 'number' },
          limit: { type: 'number' },
        },
        required: ['projectId'],
      },
    };
  }

  async execute(userId: string, params: unknown): Promise<IToolResponse> {
    try {
      const validated = ToolValidator.validate(this.parameterSchema, params, this.name);
      const result = await this.deviceService.getProjectDevices(userId, validated.projectId, {
        type: validated.type,
        status: validated.status,
        page: validated.page ?? 1,
        limit: validated.limit ?? 20,
      });
      return ToolResponseFormatter.success(this.name, result);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      return ToolResponseFormatter.error(this.name, msg);
    }
  }
}

export class GetDeviceTool implements ITool {
  readonly name = 'getDevice';
  readonly description =
    'Retrieve details, status, capabilities, and metadata of a registered device.';
  readonly parameterSchema = z.object({
    deviceId: z.string().min(1, 'deviceId is required'),
  });

  private deviceService: DeviceService;

  constructor(deviceService: DeviceService = new DeviceService()) {
    this.deviceService = deviceService;
  }

  getDefinition(): IToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          deviceId: { type: 'string', description: 'Device ID' },
        },
        required: ['deviceId'],
      },
    };
  }

  async execute(userId: string, params: unknown): Promise<IToolResponse> {
    try {
      const validated = ToolValidator.validate(this.parameterSchema, params, this.name);
      const device = await this.deviceService.getDeviceById(userId, validated.deviceId);
      return ToolResponseFormatter.success(this.name, device);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      return ToolResponseFormatter.error(this.name, msg);
    }
  }
}

export class ConnectDeviceTool implements ITool {
  readonly name = 'connectDevice';
  readonly description =
    'Connect a virtual device (sets status to ONLINE and connectionState to CONNECTED).';
  readonly parameterSchema = z.object({
    deviceId: z.string().min(1, 'deviceId is required'),
  });

  private deviceService: DeviceService;

  constructor(deviceService: DeviceService = new DeviceService()) {
    this.deviceService = deviceService;
  }

  getDefinition(): IToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          deviceId: { type: 'string', description: 'Device ID to connect' },
        },
        required: ['deviceId'],
      },
    };
  }

  async execute(userId: string, params: unknown): Promise<IToolResponse> {
    try {
      const validated = ToolValidator.validate(this.parameterSchema, params, this.name);
      const device = await this.deviceService.connectDevice(userId, validated.deviceId);
      return ToolResponseFormatter.success(this.name, device);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      return ToolResponseFormatter.error(this.name, msg);
    }
  }
}

export class DisconnectDeviceTool implements ITool {
  readonly name = 'disconnectDevice';
  readonly description =
    'Disconnect a virtual device (sets status to OFFLINE and connectionState to DISCONNECTED).';
  readonly parameterSchema = z.object({
    deviceId: z.string().min(1, 'deviceId is required'),
  });

  private deviceService: DeviceService;

  constructor(deviceService: DeviceService = new DeviceService()) {
    this.deviceService = deviceService;
  }

  getDefinition(): IToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          deviceId: { type: 'string', description: 'Device ID to disconnect' },
        },
        required: ['deviceId'],
      },
    };
  }

  async execute(userId: string, params: unknown): Promise<IToolResponse> {
    try {
      const validated = ToolValidator.validate(this.parameterSchema, params, this.name);
      const device = await this.deviceService.disconnectDevice(userId, validated.deviceId);
      return ToolResponseFormatter.success(this.name, device);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      return ToolResponseFormatter.error(this.name, msg);
    }
  }
}

export class TurnOnDeviceTool implements ITool {
  readonly name = 'turnOnDevice';
  readonly description = 'Turn on a device that supports the turnOn capability.';
  readonly parameterSchema = z.object({
    deviceId: z.string().min(1, 'deviceId is required'),
  });

  private deviceService: DeviceService;
  private registryService: DeviceRegistryService;

  constructor(
    deviceService: DeviceService = new DeviceService(),
    registryService: DeviceRegistryService = new DeviceRegistryService(),
  ) {
    this.deviceService = deviceService;
    this.registryService = registryService;
  }

  getDefinition(): IToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          deviceId: { type: 'string', description: 'Device ID to turn on' },
        },
        required: ['deviceId'],
      },
    };
  }

  async execute(userId: string, params: unknown): Promise<IToolResponse> {
    try {
      const validated = ToolValidator.validate(this.parameterSchema, params, this.name);
      const device = await this.deviceService.getDeviceById(userId, validated.deviceId);

      const capErr = validateDeviceCapability(device, 'turnOn', this.registryService);
      if (capErr) return ToolResponseFormatter.error(this.name, capErr);

      const onlineErr = validateDeviceOnline(device);
      if (onlineErr) return ToolResponseFormatter.error(this.name, onlineErr);

      const existingMeta = (device.metadata as Record<string, unknown>) ?? {};
      const updated = await this.deviceService.updateDevice(userId, validated.deviceId, {
        metadata: { ...existingMeta, powerState: 'ON' },
        status: DeviceStatus.ONLINE,
      });
      return ToolResponseFormatter.success(this.name, updated);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      return ToolResponseFormatter.error(this.name, msg);
    }
  }
}

export class TurnOffDeviceTool implements ITool {
  readonly name = 'turnOffDevice';
  readonly description = 'Turn off a device that supports the turnOff capability.';
  readonly parameterSchema = z.object({
    deviceId: z.string().min(1, 'deviceId is required'),
  });

  private deviceService: DeviceService;
  private registryService: DeviceRegistryService;

  constructor(
    deviceService: DeviceService = new DeviceService(),
    registryService: DeviceRegistryService = new DeviceRegistryService(),
  ) {
    this.deviceService = deviceService;
    this.registryService = registryService;
  }

  getDefinition(): IToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          deviceId: { type: 'string', description: 'Device ID to turn off' },
        },
        required: ['deviceId'],
      },
    };
  }

  async execute(userId: string, params: unknown): Promise<IToolResponse> {
    try {
      const validated = ToolValidator.validate(this.parameterSchema, params, this.name);
      const device = await this.deviceService.getDeviceById(userId, validated.deviceId);

      const capErr = validateDeviceCapability(device, 'turnOff', this.registryService);
      if (capErr) return ToolResponseFormatter.error(this.name, capErr);

      const onlineErr = validateDeviceOnline(device);
      if (onlineErr) return ToolResponseFormatter.error(this.name, onlineErr);

      const existingMeta = (device.metadata as Record<string, unknown>) ?? {};
      const updated = await this.deviceService.updateDevice(userId, validated.deviceId, {
        metadata: { ...existingMeta, powerState: 'OFF' },
      });
      return ToolResponseFormatter.success(this.name, updated);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      return ToolResponseFormatter.error(this.name, msg);
    }
  }
}

export class SetBrightnessTool implements ITool {
  readonly name = 'setBrightness';
  readonly description = 'Set the brightness percentage (0-100) of a device.';
  readonly parameterSchema = z.object({
    deviceId: z.string().min(1, 'deviceId is required'),
    brightness: z.number().int().min(0).max(100),
  });

  private deviceService: DeviceService;
  private registryService: DeviceRegistryService;

  constructor(
    deviceService: DeviceService = new DeviceService(),
    registryService: DeviceRegistryService = new DeviceRegistryService(),
  ) {
    this.deviceService = deviceService;
    this.registryService = registryService;
  }

  getDefinition(): IToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          deviceId: { type: 'string', description: 'Device ID' },
          brightness: { type: 'number', description: 'Brightness level from 0 to 100' },
        },
        required: ['deviceId', 'brightness'],
      },
    };
  }

  async execute(userId: string, params: unknown): Promise<IToolResponse> {
    try {
      const validated = ToolValidator.validate(this.parameterSchema, params, this.name);
      const device = await this.deviceService.getDeviceById(userId, validated.deviceId);

      const capErr = validateDeviceCapability(device, 'brightness', this.registryService);
      if (capErr) return ToolResponseFormatter.error(this.name, capErr);

      const onlineErr = validateDeviceOnline(device);
      if (onlineErr) return ToolResponseFormatter.error(this.name, onlineErr);

      const existingMeta = (device.metadata as Record<string, unknown>) ?? {};
      const updated = await this.deviceService.updateDevice(userId, validated.deviceId, {
        metadata: { ...existingMeta, brightness: validated.brightness },
      });
      return ToolResponseFormatter.success(this.name, updated);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      return ToolResponseFormatter.error(this.name, msg);
    }
  }
}

export class SetTemperatureTool implements ITool {
  readonly name = 'setTemperature';
  readonly description = 'Set the temperature of a thermostat or temperature-controlled device.';
  readonly parameterSchema = z.object({
    deviceId: z.string().min(1, 'deviceId is required'),
    temperature: z.number(),
  });

  private deviceService: DeviceService;
  private registryService: DeviceRegistryService;

  constructor(
    deviceService: DeviceService = new DeviceService(),
    registryService: DeviceRegistryService = new DeviceRegistryService(),
  ) {
    this.deviceService = deviceService;
    this.registryService = registryService;
  }

  getDefinition(): IToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          deviceId: { type: 'string', description: 'Device ID' },
          temperature: { type: 'number', description: 'Target temperature value' },
        },
        required: ['deviceId', 'temperature'],
      },
    };
  }

  async execute(userId: string, params: unknown): Promise<IToolResponse> {
    try {
      const validated = ToolValidator.validate(this.parameterSchema, params, this.name);
      const device = await this.deviceService.getDeviceById(userId, validated.deviceId);

      const capErr =
        validateDeviceCapability(device, 'temperature', this.registryService) &&
        validateDeviceCapability(device, 'setPoint', this.registryService);
      if (capErr) return ToolResponseFormatter.error(this.name, capErr);

      const onlineErr = validateDeviceOnline(device);
      if (onlineErr) return ToolResponseFormatter.error(this.name, onlineErr);

      const existingMeta = (device.metadata as Record<string, unknown>) ?? {};
      const updated = await this.deviceService.updateDevice(userId, validated.deviceId, {
        metadata: { ...existingMeta, temperature: validated.temperature },
      });
      return ToolResponseFormatter.success(this.name, updated);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      return ToolResponseFormatter.error(this.name, msg);
    }
  }
}

export class LockDeviceTool implements ITool {
  readonly name = 'lockDevice';
  readonly description = 'Lock a smart lock or security device.';
  readonly parameterSchema = z.object({
    deviceId: z.string().min(1, 'deviceId is required'),
  });

  private deviceService: DeviceService;
  private registryService: DeviceRegistryService;

  constructor(
    deviceService: DeviceService = new DeviceService(),
    registryService: DeviceRegistryService = new DeviceRegistryService(),
  ) {
    this.deviceService = deviceService;
    this.registryService = registryService;
  }

  getDefinition(): IToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          deviceId: { type: 'string', description: 'Device ID to lock' },
        },
        required: ['deviceId'],
      },
    };
  }

  async execute(userId: string, params: unknown): Promise<IToolResponse> {
    try {
      const validated = ToolValidator.validate(this.parameterSchema, params, this.name);
      const device = await this.deviceService.getDeviceById(userId, validated.deviceId);

      const capErr = validateDeviceCapability(device, 'lock', this.registryService);
      if (capErr) return ToolResponseFormatter.error(this.name, capErr);

      const onlineErr = validateDeviceOnline(device);
      if (onlineErr) return ToolResponseFormatter.error(this.name, onlineErr);

      const existingMeta = (device.metadata as Record<string, unknown>) ?? {};
      const updated = await this.deviceService.updateDevice(userId, validated.deviceId, {
        metadata: { ...existingMeta, lockState: 'LOCKED' },
      });
      return ToolResponseFormatter.success(this.name, updated);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      return ToolResponseFormatter.error(this.name, msg);
    }
  }
}

export class UnlockDeviceTool implements ITool {
  readonly name = 'unlockDevice';
  readonly description = 'Unlock a smart lock or security device.';
  readonly parameterSchema = z.object({
    deviceId: z.string().min(1, 'deviceId is required'),
  });

  private deviceService: DeviceService;
  private registryService: DeviceRegistryService;

  constructor(
    deviceService: DeviceService = new DeviceService(),
    registryService: DeviceRegistryService = new DeviceRegistryService(),
  ) {
    this.deviceService = deviceService;
    this.registryService = registryService;
  }

  getDefinition(): IToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          deviceId: { type: 'string', description: 'Device ID to unlock' },
        },
        required: ['deviceId'],
      },
    };
  }

  async execute(userId: string, params: unknown): Promise<IToolResponse> {
    try {
      const validated = ToolValidator.validate(this.parameterSchema, params, this.name);
      const device = await this.deviceService.getDeviceById(userId, validated.deviceId);

      const capErr = validateDeviceCapability(device, 'unlock', this.registryService);
      if (capErr) return ToolResponseFormatter.error(this.name, capErr);

      const onlineErr = validateDeviceOnline(device);
      if (onlineErr) return ToolResponseFormatter.error(this.name, onlineErr);

      const existingMeta = (device.metadata as Record<string, unknown>) ?? {};
      const updated = await this.deviceService.updateDevice(userId, validated.deviceId, {
        metadata: { ...existingMeta, lockState: 'UNLOCKED' },
      });
      return ToolResponseFormatter.success(this.name, updated);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      return ToolResponseFormatter.error(this.name, msg);
    }
  }
}
