import type { PersistenceStore, StoreData, OutboxEventRecord, OutboxReceiptRecord } from './persistence/types.js';
import type { PersonaVersionTransition } from './persona-domain.js';

export type PersonaOutboxStatus = OutboxEventRecord['status'];
export interface ConsumerReceipt {
  receiptId: string;
  eventId: string;
  consumer: string;
  status: 'processed' | 'failed';
  attempts: number;
  processedAt?: string;
  failedAt?: string;
  response?: Record<string, unknown>;
  error?: string;
}
export interface PersonaOutboxEvent extends OutboxEventRecord {
  aggregateType: 'persona_version';
  deliveredAt?: string;
  consumerReceipts?: ConsumerReceipt[];
}
export interface RecordPersonaEventInput { eventType: string; payload: Record<string, unknown>; maxAttempts?: number; }
export interface ConsumeResult { duplicate: boolean; receipt: ConsumerReceipt; }

const secretKey = /(?:secret|token|password|passwd|credential|authorization|api[-_]?key|private[-_]?key|client[-_]?secret|cvc|cvv)/i;
const now = () => new Date().toISOString();

export function sanitizePersonaEventPayload(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitizePersonaEventPayload);
  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) if (!secretKey.test(key)) result[key] = sanitizePersonaEventPayload(item);
    return result;
  }
  return value;
}

const asRecord = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
const receiptStatus = (receipt: OutboxReceiptRecord): 'processed' | 'failed' => asRecord(receipt.response).status === 'failed' ? 'failed' : 'processed';

export class PersonaEventOutbox {
  constructor(private readonly store: PersistenceStore, private readonly context: { projectId: string; ownerId: string }) {}

  async recordTransition(transition: PersonaVersionTransition, input: RecordPersonaEventInput): Promise<PersonaOutboxEvent> {
    const eventId = `persona-event-${transition.id}`;
    const payload = sanitizePersonaEventPayload(input.payload) as Record<string, unknown>;
    await this.store.append('persona_version_transitions', transition, this.context);
    const event: PersonaOutboxEvent = {
      id: eventId, eventId, eventType: input.eventType, aggregateType: 'persona_version', aggregateId: transition.personaVersionId,
      payload, status: 'pending', attempts: 0, maxAttempts: Math.max(1, input.maxAttempts ?? 3), createdAt: now(),
    };
    await this.store.append('outbox_events', event as OutboxEventRecord, this.context);
    return event;
  }

  async get(eventId: string): Promise<PersonaOutboxEvent | undefined> {
    const data = await this.store.read(this.context);
    const event = data.outbox_events.find((item) => item.eventId === eventId);
    if (!event) return undefined;
    const receipts = data.outbox_receipts.filter((item) => item.eventId === eventId).map((item) => this.toReceipt(item));
    return { ...event, aggregateType: 'persona_version', consumerReceipts: receipts };
  }

  async consume(eventId: string, consumer: string, handler: (payload: Record<string, unknown>) => Promise<unknown> | unknown): Promise<ConsumeResult> {
    if (!consumer.trim()) throw new Error('consumer_required');
    const event = await this.get(eventId);
    if (!event) throw new Error('outbox_event_not_found');
    const existing = event.consumerReceipts?.find((receipt) => receipt.consumer === consumer && receipt.status === 'processed');
    if (existing) return { duplicate: true, receipt: existing };
    if (event.status === 'dead_letter') throw new Error('outbox_event_dead_letter');

    event.attempts += 1;
    const receiptId = `${event.eventId}:${consumer}`;
    const previous = event.consumerReceipts?.find((item) => item.receiptId === receiptId);
    const receipt: ConsumerReceipt = { receiptId, eventId, consumer, status: 'failed', attempts: (previous?.attempts ?? 0) + 1 };
    try {
      const response = sanitizePersonaEventPayload(await handler(event.payload));
      receipt.status = 'processed'; receipt.processedAt = now(); receipt.response = asRecord(response);
      event.status = 'delivered';
      event.deliveredAt = receipt.processedAt;
      delete event.nextRetryAt;
      delete event.lastError;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'consumer_failed';
      receipt.error = message; receipt.failedAt = now();
      event.lastError = message;
      if (event.attempts >= event.maxAttempts) {
        event.status = 'dead_letter';
        event.deadLetteredAt = receipt.failedAt;
        delete event.nextRetryAt;
      } else { event.status = 'retrying'; event.nextRetryAt = new Date(Date.now() + 1000 * (2 ** (event.attempts - 1))).toISOString(); }
      await this.save(event, receipt);
      throw error;
    }
    await this.save(event, receipt);
    return { duplicate: false, receipt };
  }

  private async save(event: PersonaOutboxEvent, receipt: ConsumerReceipt): Promise<void> {
    const persistedReceipt: OutboxReceiptRecord = {
      id: receipt.receiptId, receiptId: receipt.receiptId, eventId: receipt.eventId, consumer: receipt.consumer,
      response: receipt.status === 'failed' ? { status: 'failed', error: receipt.error, attempts: receipt.attempts } : { status: 'processed', value: receipt.response },
      createdAt: receipt.processedAt ?? receipt.failedAt ?? now(),
    };
    const data = await this.store.read(this.context);
    const old = data.outbox_receipts.find((item) => item.id === persistedReceipt.id);
    if (old) await this.store.replace('outbox_receipts', old.id, persistedReceipt, this.context);
    else await this.store.append('outbox_receipts', persistedReceipt, this.context);
    await this.store.replace('outbox_events', event.id, event as OutboxEventRecord, this.context);
  }

  private toReceipt(value: OutboxReceiptRecord): ConsumerReceipt {
    const response = asRecord(value.response);
    const status = receiptStatus(value);
    if (status === 'failed') {
      const failed: ConsumerReceipt = { receiptId: value.receiptId, eventId: value.eventId, consumer: value.consumer, status: 'failed', attempts: Number(response.attempts ?? 1), failedAt: value.createdAt };
      if (typeof response.error === 'string') failed.error = response.error;
      return failed;
    }
    return { receiptId: value.receiptId, eventId: value.eventId, consumer: value.consumer, status: 'processed', attempts: Number(response.attempts ?? 1), processedAt: value.createdAt, response: asRecord(response.value) };
  }
}

export type PersonaOutboxCollections = Pick<StoreData, 'outbox_events' | 'outbox_receipts'>;
