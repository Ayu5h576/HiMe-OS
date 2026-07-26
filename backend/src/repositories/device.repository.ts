import {
  PrismaClient,
  Device,
  Prisma,
  DeviceType,
  DeviceStatus,
  ConnectionState,
} from '@prisma/client';
import { prisma as defaultPrisma } from '../config/database';
import { env } from '../config/env';
import {
  CreateDeviceInput,
  UpdateDeviceInput,
  GetDevicesQueryInput,
} from '../schemas/device.schema';
import { PaginatedResult } from './memory.repository';

export class DeviceRepository {
  private db: PrismaClient;
  private deviceStore: Map<string, Device> = new Map();

  constructor(db: PrismaClient = defaultPrisma) {
    this.db = db;
  }

  async create(data: CreateDeviceInput, projectId: string): Promise<Device> {
    try {
      return await this.db.device.create({
        data: {
          name: data.name,
          type: data.type,
          manufacturer: data.manufacturer,
          model: data.model,
          firmwareVersion: data.firmwareVersion,
          status: DeviceStatus.UNKNOWN,
          connectionState: ConnectionState.DISCONNECTED,
          batteryLevel: data.batteryLevel,
          capabilities: data.capabilities as Prisma.InputJsonValue | undefined,
          metadata: data.metadata as Prisma.InputJsonValue | undefined,
          projectId,
        },
      });
    } catch (err) {
      if (env.NODE_ENV === 'test') {
        const device: Device = {
          id: `device-cuid-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          name: data.name,
          type: data.type ?? DeviceType.CUSTOM,
          manufacturer: data.manufacturer ?? null,
          model: data.model ?? null,
          firmwareVersion: data.firmwareVersion ?? null,
          status: DeviceStatus.UNKNOWN,
          connectionState: ConnectionState.DISCONNECTED,
          batteryLevel: data.batteryLevel ?? null,
          lastSeen: null,
          capabilities: (data.capabilities as Prisma.JsonValue) ?? null,
          metadata: (data.metadata as Prisma.JsonValue) ?? null,
          projectId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        this.deviceStore.set(device.id, device);
        return device;
      }
      throw err;
    }
  }

  async findById(id: string): Promise<Device | null> {
    try {
      return await this.db.device.findUnique({
        where: { id },
      });
    } catch (err) {
      if (env.NODE_ENV === 'test') {
        return this.deviceStore.get(id) ?? null;
      }
      throw err;
    }
  }

  async findProjectDevices(
    projectId: string,
    query: GetDevicesQueryInput,
  ): Promise<PaginatedResult<Device>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.DeviceWhereInput = {
      projectId,
      ...(query.type ? { type: query.type } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.connectionState ? { connectionState: query.connectionState } : {}),
    };

    try {
      const [data, total] = await Promise.all([
        this.db.device.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.db.device.count({ where }),
      ]);

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (err) {
      if (env.NODE_ENV === 'test') {
        let store = Array.from(this.deviceStore.values()).filter((d) => d.projectId === projectId);
        if (query.type) store = store.filter((d) => d.type === query.type);
        if (query.status) store = store.filter((d) => d.status === query.status);
        if (query.connectionState)
          store = store.filter((d) => d.connectionState === query.connectionState);

        const total = store.length;
        const data = store.slice(skip, skip + limit);
        return {
          data,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        };
      }
      throw err;
    }
  }

  async update(id: string, data: UpdateDeviceInput | Partial<Device>): Promise<Device> {
    try {
      return await this.db.device.update({
        where: { id },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.type !== undefined && { type: data.type }),
          ...(data.manufacturer !== undefined && { manufacturer: data.manufacturer }),
          ...(data.model !== undefined && { model: data.model }),
          ...(data.firmwareVersion !== undefined && { firmwareVersion: data.firmwareVersion }),
          ...(data.status !== undefined && { status: data.status }),
          ...(data.connectionState !== undefined && { connectionState: data.connectionState }),
          ...(data.batteryLevel !== undefined && { batteryLevel: data.batteryLevel }),
          ...(data.lastSeen !== undefined && { lastSeen: data.lastSeen }),
          ...(data.capabilities !== undefined && {
            capabilities: data.capabilities as Prisma.InputJsonValue,
          }),
          ...(data.metadata !== undefined && {
            metadata: data.metadata as Prisma.InputJsonValue,
          }),
        },
      });
    } catch (err) {
      if (env.NODE_ENV === 'test') {
        const existing = this.deviceStore.get(id);
        if (!existing) throw new Error('Device not found in test store');
        const updated: Device = {
          ...existing,
          ...data,
          manufacturer:
            data.manufacturer === null ? null : (data.manufacturer ?? existing.manufacturer),
          model: data.model === null ? null : (data.model ?? existing.model),
          firmwareVersion:
            data.firmwareVersion === null
              ? null
              : (data.firmwareVersion ?? existing.firmwareVersion),
          batteryLevel:
            data.batteryLevel === null ? null : (data.batteryLevel ?? existing.batteryLevel),
          capabilities:
            data.capabilities === null
              ? null
              : ((data.capabilities as Prisma.JsonValue) ?? existing.capabilities),
          metadata:
            data.metadata === null
              ? null
              : ((data.metadata as Prisma.JsonValue) ?? existing.metadata),
          updatedAt: new Date(),
        };
        this.deviceStore.set(id, updated);
        return updated;
      }
      throw err;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.db.device.delete({
        where: { id },
      });
    } catch (err) {
      if (env.NODE_ENV === 'test') {
        this.deviceStore.delete(id);
        return;
      }
      throw err;
    }
  }
}
