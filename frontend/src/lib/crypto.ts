// 簡単なBase64エンコード（開発者ツールで機密情報を隠すため）
export const encodeCredentials = (data: Record<string, unknown>): string => {
  const jsonString = JSON.stringify(data);
  return btoa(jsonString);
};

export const decodeCredentials = <T = Record<string, unknown>>(
  encoded: string
): T => {
  const jsonString = atob(encoded);
  return JSON.parse(jsonString) as T;
};
