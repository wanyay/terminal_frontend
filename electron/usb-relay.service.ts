import { BrowserWindow } from 'electron';
import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';

interface RelayConfig {
  vendorId: number;
  productId: number;
  configurationValue: number;
  interfaceNumber: number;
  endpointIn: number;
  endpointOut: number;
}

interface RelayStatus {
  channel: number;
  isOpen: boolean;
}

const RELAY_APP_PATH = path.join(
  __dirname,
  '..',
  'relay-tools',
  'usbrelay.exe'
);

const SERIAL_NUMBER = 'BITFT';

class UsbRelayService {
  private config: RelayConfig | null = null;
  private relayCount = 2;
  private _isConnected = false;
  /** Track relay states locally */
  private relayStates: boolean[] = [false, false];

  /**
   * Run the manufacturer's command-line tool and return the exit code.
   */
  private runCommand(
    action: 'on' | 'off',
    channel: number
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      execFile(
        RELAY_APP_PATH,
        ['-serial', SERIAL_NUMBER, `-${action}`, channel.toString()],
        { timeout: 5000 },
        (error, stdout) => {
          if (error) {
            reject(new Error(`Relay command failed: ${error.message}`));
            return;
          }
          resolve(stdout);
        }
      );
    });
  }

  private readStatus(): Promise<string> {
    return new Promise((resolve, reject) => {
      execFile(
        RELAY_APP_PATH,
        ['-serial', SERIAL_NUMBER, '-status'],
        { timeout: 5000 },
        (error, stdout) => {
          if (error) {
            reject(new Error(`Status command failed: ${error.message}`));
            return;
          }
          resolve(stdout);
        }
      );
    });
  }

  /**
   * Connect to the USB relay device.
   */
  async connect(_config: RelayConfig): Promise<boolean> {
    // Verify the EXE is accessible
    if (!fs.existsSync(RELAY_APP_PATH)) {
      throw new Error(
        `CommandApp_USBRelay.exe not found at ${RELAY_APP_PATH}`
      );
    }

    this._isConnected = true;
    this.config = _config;
    this.relayStates = Array(this.relayCount).fill(false);

    this.sendToRenderer('usb:status', {
      connected: true,
      statuses: this.getRelayStatuses(),
    });

    return true;
  }

  /**
   * Disconnect from the USB relay device.
   */
  async disconnect(): Promise<void> {
    this._isConnected = false;
    this.config = null;
  }

  /**
   * Set a specific relay channel on or off.
   */
  async setRelay(channel: number, state: 'on' | 'off'): Promise<boolean> {
    if (!this._isConnected) {
      throw new Error('USB device not connected');
    }

    try {
      await this.runCommand(state, channel);
      console.log(`✅ Relay ${channel} set to ${state}`);

      this.relayStates[channel - 1] = state === 'on';

      this.sendToRenderer('usb:status', {
        statuses: this.getRelayStatuses(),
      });

      return true;
    } catch (error) {
      this.sendToRenderer('usb:error', {
        message: `Failed to set relay ${channel} to ${state}: ${error}`,
      });
      throw error;
    }
  }

  /**
   * Toggle a relay channel.
   */
  async toggleRelay(channel: number): Promise<boolean> {
    const currentState = this.relayStates[channel - 1] ?? false;
    const newState = currentState ? 'off' : 'on';
    return this.setRelay(channel, newState);
  }

  /**
   * Set all relays on or off.
   */
  async setAllRelays(state: 'on' | 'off'): Promise<boolean> {
    if (!this._isConnected) {
      throw new Error('USB device not connected');
    }

    this.relayStates = Array(this.relayCount).fill(state === 'on');

    // Set each channel individually
    for (let ch = 1; ch <= this.relayCount; ch++) {
      await this.setRelay(ch, state);
    }
    return true;
  }

  /**
   * Get the current device status (tracked locally).
   */
  async getStatus(): Promise<{ statuses: RelayStatus[] }> {
    return { statuses: this.getRelayStatuses() };
  }

  /**
   * Get device information.
   */
  async getDeviceInfo(): Promise<Record<string, unknown>> {
    return {
      manufacturer: 'DCTech',
      product: 'USBRelay2',
      serialNumber: SERIAL_NUMBER,
      relayCount: this.relayCount,
    };
  }

  // --- Private helpers ---

  private getRelayStatuses(): RelayStatus[] {
    return Array.from({ length: this.relayCount }, (_, i) => ({
      channel: i + 1,
      isOpen: this.relayStates[i] ?? false,
    }));
  }

  private sendToRenderer(channel: string, data: unknown): void {
    BrowserWindow.getAllWindows().forEach((win) => {
      if (!win.isDestroyed()) {
        win.webContents.send(channel, data);
      }
    });
  }
}

export const usbRelayService = new UsbRelayService();
