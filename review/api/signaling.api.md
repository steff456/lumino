## API Report File for "@lumino/signaling"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

// @public
export interface ISignal<T, U> {
    connect(slot: Slot<T, U>, thisArg?: any): boolean;
    disconnect(slot: Slot<T, U>, thisArg?: any): boolean;
}

// @public
export class Signal<T, U> implements ISignal<T, U> {
    constructor(sender: T);
    connect(slot: Slot<T, U>, thisArg?: unknown): boolean;
    disconnect(slot: Slot<T, U>, thisArg?: unknown): boolean;
    emit(args: U): void;
    readonly sender: T;
}

// @public
export namespace Signal {
    export function clearData(object: unknown): void;
    export function disconnectAll(object: unknown): void;
    export function disconnectBetween(sender: unknown, receiver: unknown): void;
    export function disconnectReceiver(receiver: unknown): void;
    export function disconnectSender(sender: unknown): void;
    export type ExceptionHandler = (err: Error) => void;
    export function getExceptionHandler(): ExceptionHandler;
    export function setExceptionHandler(handler: ExceptionHandler): ExceptionHandler;
}

// @public
export type Slot<T, U> = (sender: T, args: U) => void;

// (No @packageDocumentation comment for this package)

```
