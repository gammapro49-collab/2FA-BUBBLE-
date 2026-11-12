export interface TotpAccount {
  id: string;
  issuer: string;
  accountName: string;
  secret: string; // Base32 encoded
  digits: number;
  period: number;
  algorithm: 'SHA1' | 'SHA256' | 'SHA512';
  color: string;
  icon?: string;
  createdAt: number;
}

export type Language = 'en' | 'bn';

export interface AppSettings {
  language: Language;
  bubbleEnabled: boolean;
  biometricEnabled: boolean;
  darkMode: boolean;
  vibrationEnabled: boolean;
  overlayPermissionGranted: boolean;
  bubbleSizeDp: number;
  bubbleAlpha: number;
}

export type SimulatedScreen = 'main_app' | 'browser_login' | 'crypto_app' | 'home_screen';

export interface AndroidFile {
  path: string;
  name: string;
  language: 'kotlin' | 'xml' | 'toml' | 'markdown' | 'pro' | 'gradle' | 'yaml' | 'shell';
  category: 'manifest' | 'gradle' | 'kotlin_data' | 'kotlin_service' | 'kotlin_ui' | 'res' | 'docs' | 'ci';
  content: string;
}
