import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

export interface StoreData { opportunities: unknown[]; seeds: unknown[]; profiles: unknown[]; content: unknown[]; briefs: unknown[]; assets: unknown[]; approvals: unknown[]; receipts: unknown[]; metrics: unknown[]; feedback: unknown[]; events: unknown[]; research: unknown[]; farmer_profiles: unknown[]; post_machine: unknown[]; }
const empty: StoreData = { opportunities: [], seeds: [], profiles: [], content: [], briefs: [], assets: [], approvals: [], receipts: [], metrics: [], feedback: [], events: [], research: [], farmer_profiles: [], post_machine: [] };

export class JsonStore {
  constructor(private readonly file: string) {}
  async read(): Promise<StoreData> {
    try { return { ...empty, ...JSON.parse(await readFile(this.file, 'utf8')) as Partial<StoreData> }; }
    catch (error: unknown) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return structuredClone(empty); throw error; }
  }
  async append(collection: keyof StoreData, value: unknown): Promise<unknown> {
    const data = await this.read(); data[collection].push(value); await mkdir(dirname(this.file), { recursive: true }); await writeFile(this.file, JSON.stringify(data, null, 2)); return value;
  }
  async replace(collection: keyof StoreData, id: string, value: unknown): Promise<unknown> {
    const data = await this.read(); const index = data[collection].findIndex((item) => typeof item === 'object' && item !== null && 'id' in item && item.id === id);
    if (index < 0) throw new Error('not_found'); data[collection][index] = value; await mkdir(dirname(this.file), { recursive: true }); await writeFile(this.file, JSON.stringify(data, null, 2)); return value;
  }
}
