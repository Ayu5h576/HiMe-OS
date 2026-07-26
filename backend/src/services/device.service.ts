import { Device, DeviceStatus, ConnectionState } from '@prisma/client';
import { DeviceRepository } from '../repositories/device.repository';
import { ProjectRepository } from '../repositories/project.repository';
import { DeviceRegistryService } from './device-registry.service';
import {
  CreateDeviceInput,
  UpdateDeviceInput,
  GetDevicesQueryInput,
} from '../schemas/device.schema';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import { PaginatedResult } from '../repositories/memory.repository';

export class DeviceService {
  private deviceRepo: DeviceRepository;
  private projectRepo: ProjectRepository;
  private registryService: DeviceRegistryService;

  constructor(
    deviceRepo: DeviceRepository = new DeviceRepository(),
    projectRepo: ProjectRepository = new ProjectRepository(),
    registryService: DeviceRegistryService = new DeviceRegistryService(),
  ) {
    this.deviceRepo = deviceRepo;
    this.projectRepo = projectRepo;
    this.registryService = registryService;
  }

  private async validateProjectOwnership(userId: string, projectId: string): Promise<void> {
    const project = await this.projectRepo.findById(projectId);
    if (!project) {
      throw new NotFoundError('Project not found');
    }
    if (project.ownerId !== userId) {
      throw new ForbiddenError('You do not have access to this project');
    }
  }

  private async getDeviceWithOwnershipCheck(userId: string, deviceId: string): Promise<Device> {
    const device = await this.deviceRepo.findById(deviceId);
    if (!device) {
      throw new NotFoundError('Device not found');
    }
    await this.validateProjectOwnership(userId, device.projectId);
    return device;
  }

  async createDevice(userId: string, projectId: string, input: CreateDeviceInput): Promise<Device> {
    await this.validateProjectOwnership(userId, projectId);

    const capabilities = this.registryService.resolveCapabilities(input.type, input.capabilities);
    const createData: CreateDeviceInput = {
      ...input,
      capabilities: capabilities as CreateDeviceInput['capabilities'],
    };

    return this.deviceRepo.create(createData, projectId);
  }

  async getProjectDevices(
    userId: string,
    projectId: string,
    query: GetDevicesQueryInput,
  ): Promise<PaginatedResult<Device>> {
    await this.validateProjectOwnership(userId, projectId);
    return this.deviceRepo.findProjectDevices(projectId, query);
  }

  async getDeviceById(userId: string, deviceId: string): Promise<Device> {
    return this.getDeviceWithOwnershipCheck(userId, deviceId);
  }

  async updateDevice(userId: string, deviceId: string, input: UpdateDeviceInput): Promise<Device> {
    await this.getDeviceWithOwnershipCheck(userId, deviceId);
    return this.deviceRepo.update(deviceId, input);
  }

  async deleteDevice(userId: string, deviceId: string): Promise<void> {
    await this.getDeviceWithOwnershipCheck(userId, deviceId);
    await this.deviceRepo.delete(deviceId);
  }

  async connectDevice(userId: string, deviceId: string): Promise<Device> {
    await this.getDeviceWithOwnershipCheck(userId, deviceId);
    return this.deviceRepo.update(deviceId, {
      status: DeviceStatus.ONLINE,
      connectionState: ConnectionState.CONNECTED,
      lastSeen: new Date(),
    });
  }

  async disconnectDevice(userId: string, deviceId: string): Promise<Device> {
    await this.getDeviceWithOwnershipCheck(userId, deviceId);
    return this.deviceRepo.update(deviceId, {
      status: DeviceStatus.OFFLINE,
      connectionState: ConnectionState.DISCONNECTED,
    });
  }
}
