## API Report File for "@lumino/commands"

> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).

```ts

import { IDisposable } from '@lumino/disposable';
import { ISignal } from '@lumino/signaling';
import { ReadonlyJSONObject } from '@lumino/coreutils';
import { ReadonlyPartialJSONObject } from '@lumino/coreutils';
import { VirtualElement } from '@lumino/virtualdom';

// @public
export class CommandRegistry {
    addCommand(id: string, options: CommandRegistry.ICommandOptions): IDisposable;
    addKeyBinding(options: CommandRegistry.IKeyBindingOptions): IDisposable;
    caption(id: string, args?: ReadonlyPartialJSONObject): string;
    className(id: string, args?: ReadonlyPartialJSONObject): string;
    get commandChanged(): ISignal<this, CommandRegistry.ICommandChangedArgs>;
    get commandExecuted(): ISignal<this, CommandRegistry.ICommandExecutedArgs>;
    dataset(id: string, args?: ReadonlyPartialJSONObject): CommandRegistry.Dataset;
    describedBy(id: string, args?: ReadonlyPartialJSONObject): Promise<CommandRegistry.Description>;
    execute(id: string, args?: ReadonlyPartialJSONObject): Promise<any>;
    hasCommand(id: string): boolean;
    icon(id: string, args?: ReadonlyPartialJSONObject): VirtualElement.IRenderer | undefined;
    iconClass(id: string, args?: ReadonlyPartialJSONObject): string;
    iconLabel(id: string, args?: ReadonlyPartialJSONObject): string;
    isEnabled(id: string, args?: ReadonlyPartialJSONObject): boolean;
    isToggleable(id: string, args?: ReadonlyJSONObject): boolean;
    isToggled(id: string, args?: ReadonlyPartialJSONObject): boolean;
    isVisible(id: string, args?: ReadonlyPartialJSONObject): boolean;
    get keyBindingChanged(): ISignal<this, CommandRegistry.IKeyBindingChangedArgs>;
    get keyBindings(): ReadonlyArray<CommandRegistry.IKeyBinding>;
    label(id: string, args?: ReadonlyPartialJSONObject): string;
    listCommands(): string[];
    mnemonic(id: string, args?: ReadonlyPartialJSONObject): number;
    notifyCommandChanged(id?: string): void;
    processKeydownEvent(event: KeyboardEvent): void;
    usage(id: string, args?: ReadonlyPartialJSONObject): string;
}

// @public
export namespace CommandRegistry {
    export type CommandFunc<T> = (args: ReadonlyPartialJSONObject) => T;
    export type Dataset = {
        readonly [key: string]: string;
    };
    export type Description = {
        args: ReadonlyJSONObject | null;
    };
    export function formatKeystroke(keystroke: string): string;
    export interface ICommandChangedArgs {
        readonly id: string | undefined;
        readonly type: 'added' | 'removed' | 'changed' | 'many-changed';
    }
    export interface ICommandExecutedArgs {
        readonly args: ReadonlyPartialJSONObject;
        readonly id: string;
        readonly result: Promise<any>;
    }
    export interface ICommandOptions {
        caption?: string | CommandFunc<string>;
        className?: string | CommandFunc<string>;
        dataset?: Dataset | CommandFunc<Dataset>;
        describedBy?: Partial<Description> | CommandFunc<Partial<Description> | Promise<Partial<Description>>>;
        execute: CommandFunc<any | Promise<any>>;
        icon?: VirtualElement.IRenderer | undefined | CommandFunc<VirtualElement.IRenderer | undefined>;
        iconClass?: string | CommandFunc<string>;
        iconLabel?: string | CommandFunc<string>;
        isEnabled?: CommandFunc<boolean>;
        isToggleable?: boolean;
        isToggled?: CommandFunc<boolean>;
        isVisible?: CommandFunc<boolean>;
        label?: string | CommandFunc<string>;
        mnemonic?: number | CommandFunc<number>;
        usage?: string | CommandFunc<string>;
    }
    export interface IKeyBinding {
        readonly args: ReadonlyPartialJSONObject;
        readonly command: string;
        readonly keys: ReadonlyArray<string>;
        readonly selector: string;
    }
    export interface IKeyBindingChangedArgs {
        readonly binding: IKeyBinding;
        readonly type: 'added' | 'removed';
    }
    export interface IKeyBindingOptions {
        args?: ReadonlyPartialJSONObject;
        command: string;
        keys: string[];
        linuxKeys?: string[];
        macKeys?: string[];
        selector: string;
        winKeys?: string[];
    }
    export interface IKeystrokeParts {
        alt: boolean;
        cmd: boolean;
        ctrl: boolean;
        key: string;
        shift: boolean;
    }
    export function isModifierKeyPressed(event: KeyboardEvent): boolean;
    export function keystrokeForKeydownEvent(event: KeyboardEvent): string;
    export function normalizeKeys(options: IKeyBindingOptions): string[];
    export function normalizeKeystroke(keystroke: string): string;
    export function parseKeystroke(keystroke: string): IKeystrokeParts;
}

// (No @packageDocumentation comment for this package)

```
