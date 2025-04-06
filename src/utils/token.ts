import { storageEncrypt } from '@boe/utils-es';

//token在storage存放名称
export const TOKEN_NAME = 'Authorization';

const { storageSet, storageGet, storageRemove } = storageEncrypt('boeet_');
export function setToken(val = ''): void {
  storageSet(TOKEN_NAME, val);
}

export function getToken(): string {
  return (storageGet(TOKEN_NAME, false) as string) || '';
}

export function removeToken() {
  storageRemove(TOKEN_NAME);
}
