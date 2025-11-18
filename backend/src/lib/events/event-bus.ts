import { Injectable, Logger } from '@nestjs/common';
import { DomainEvent, AllDomainEvents } from './domain-events';

type EventHandler = (event: DomainEvent) => Promise<void> | void;

@Injectable()
export class EventBus {
  private readonly logger = new Logger(EventBus.name);
  private handlers: Map<string, EventHandler[]> = new Map();

  /**
   * Subscribe to a specific event type
   */
  on(eventType: string, handler: EventHandler): void {
    const existing = this.handlers.get(eventType) || [];
    this.handlers.set(eventType, [...existing, handler]);
    this.logger.log(`Handler registered for event type: ${eventType}`);
  }

  /**
   * Publish an event to all registered handlers
   */
  async publish(event: AllDomainEvents): Promise<void> {
    const handlers = this.handlers.get(event.type) || [];

    this.logger.log(
      `Publishing event: ${event.type} (${handlers.length} handlers)`,
    );

    for (const handler of handlers) {
      try {
        await handler(event);
      } catch (error) {
        this.logger.error(
          `Error in event handler for ${event.type}:`,
          error.stack,
        );
        // Continue processing other handlers even if one fails
      }
    }
  }

  /**
   * Remove all handlers for a specific event type
   */
  clear(eventType: string): void {
    this.handlers.delete(eventType);
  }

  /**
   * Remove all handlers
   */
  clearAll(): void {
    this.handlers.clear();
  }
}
