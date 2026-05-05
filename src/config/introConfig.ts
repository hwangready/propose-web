export interface IntroConfig {
  enabled: boolean;
  introMode: 'google' | 'chatgpt';
  name: string;
  chatResponse: string;
}

const KEY = 'propose_intro_config';

const DEFAULT: IntroConfig = {
  enabled: true,
  introMode: 'google',
  name: '한아',
  chatResponse: '한아는 세상에서 가장 따뜻한 사람이에요. 그녀의 웃음은 주변을 환하게 만들고, 작은 것에도 진심으로 감동받는 순수한 마음을 가졌어요. 함께하는 모든 순간이 빛나는 이유는, 바로 그녀가 있기 때문이에요.',
};

export function loadIntroConfig(): IntroConfig {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT };
    return { ...DEFAULT, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT };
  }
}

export function saveIntroConfig(config: IntroConfig): void {
  localStorage.setItem(KEY, JSON.stringify(config));
}
