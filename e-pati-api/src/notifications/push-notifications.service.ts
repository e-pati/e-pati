import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  cert,
  getApps,
  initializeApp,
  type App,
  type ServiceAccount,
} from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

type PushPayload = {
  token: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
};

@Injectable()
export class PushNotificationsService {
  private readonly logger = new Logger(PushNotificationsService.name);
  private firebaseApp?: App;

  constructor(private readonly configService: ConfigService) {}

  async send(payload: PushPayload): Promise<void> {
    if (this.isExpoToken(payload.token)) {
      await this.sendExpoPush(payload);
      return;
    }

    await this.sendFirebasePush(payload);
  }

  private async sendFirebasePush(payload: PushPayload): Promise<void> {
    const app = this.getFirebaseApp();

    await getMessaging(app).send({
      token: payload.token,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: this.stringifyData(payload.data),
    });
  }

  private async sendExpoPush(payload: PushPayload): Promise<void> {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: payload.token,
        title: payload.title,
        body: payload.body,
        data: payload.data ?? {},
        sound: 'default',
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      throw new ServiceUnavailableException(
        `Expo push failed with ${response.status}: ${details}`,
      );
    }
  }

  private getFirebaseApp(): App {
    if (this.firebaseApp) {
      return this.firebaseApp;
    }

    const existingApp = getApps()[0];
    if (existingApp) {
      this.firebaseApp = existingApp;
      return existingApp;
    }

    const serviceAccount = this.getServiceAccount();
    this.firebaseApp = initializeApp({
      credential: cert(serviceAccount),
    });

    return this.firebaseApp;
  }

  private getServiceAccount(): ServiceAccount {
    const rawJson = this.configService.get<string>(
      'FIREBASE_SERVICE_ACCOUNT_JSON',
    );

    if (rawJson) {
      const serviceAccount = JSON.parse(rawJson) as unknown;
      return serviceAccount as ServiceAccount;
    }

    const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
    const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
    const privateKey = this.configService
      .get<string>('FIREBASE_PRIVATE_KEY')
      ?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      throw new ServiceUnavailableException('Firebase is not configured.');
    }

    return {
      projectId,
      clientEmail,
      privateKey,
    };
  }

  private isExpoToken(token: string): boolean {
    return (
      token.startsWith('ExponentPushToken[') ||
      token.startsWith('ExpoPushToken[')
    );
  }

  private stringifyData(
    data?: Record<string, unknown>,
  ): Record<string, string> {
    return Object.fromEntries(
      Object.entries(data ?? {}).map(([key, value]) => [key, String(value)]),
    );
  }
}
