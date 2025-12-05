import { Client, ConnectConfig } from 'ssh2';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface SSHConfig {
  host: string;
  port: number;
  username: string;
  password?: string;
  privateKey?: Buffer;
}

class SSHService {
  private get config(): SSHConfig {
    const privateKeyPath = process.env.DESKTOP_SSH_PRIVATE_KEY_PATH;

    const config: SSHConfig = {
      host: process.env.DESKTOP_SSH_HOST || 'localhost',
      port: parseInt(process.env.DESKTOP_SSH_PORT || '22'),
      username: process.env.DESKTOP_SSH_USER || 'user',
    };

    if (privateKeyPath && fs.existsSync(privateKeyPath)) {
      config.privateKey = fs.readFileSync(privateKeyPath);
    } else if (process.env.DESKTOP_SSH_PASSWORD) {
      config.password = process.env.DESKTOP_SSH_PASSWORD;
    }

    return config;
  }

  private isLocalhost(): boolean {
    const host = this.config.host;
    return host === 'localhost' || host === '127.0.0.1' || host === '192.168.1.164';
  }

  async executeCommand(command: string): Promise<string> {
    // If connecting to localhost, execute locally instead of via SSH
    if (this.isLocalhost()) {
      try {
        const { stdout, stderr } = await execAsync(command);
        return stdout + stderr;
      } catch (error: any) {
        throw new Error(error.message || 'Command execution failed');
      }
    }

    // Otherwise use SSH
    return new Promise((resolve, reject) => {
      const conn = new Client();
      let output = '';

      conn.on('ready', () => {
        conn.exec(command, (err, stream) => {
          if (err) {
            conn.end();
            return reject(err);
          }

          stream.on('close', () => {
            conn.end();
            resolve(output);
          }).on('data', (data: Buffer) => {
            output += data.toString();
          }).stderr.on('data', (data: Buffer) => {
            output += data.toString();
          });
        });
      }).on('error', (err) => {
        reject(err);
      }).connect(this.config as ConnectConfig);
    });
  }

  async launchApp(appCommand: string): Promise<{ success: boolean; message: string }> {
    try {
      const output = await this.executeCommand(appCommand);
      return {
        success: true,
        message: output || 'Application launched successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to launch application',
      };
    }
  }

  async getSystemInfo(): Promise<any> {
    try {
      const [cpuInfo, memInfo, diskInfo] = await Promise.all([
        this.executeCommand("top -bn1 | grep 'Cpu(s)' | sed 's/.*, *\\([0-9.]*\\)%* id.*/\\1/' | awk '{print 100 - $1}'"),
        this.executeCommand("free -m | awk 'NR==2{printf \"%.2f\", $3*100/$2 }'"),
        this.executeCommand("df -h / | awk 'NR==2{print $5}' | sed 's/%//'"),
      ]);

      return {
        cpu: parseFloat(cpuInfo.trim()) || 0,
        memory: parseFloat(memInfo.trim()) || 0,
        disk: parseFloat(diskInfo.trim()) || 0,
      };
    } catch (error) {
      throw new Error('Failed to get system info: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }
}

export default new SSHService();
