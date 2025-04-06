import type { IAsyncRouteState } from '@/store/modules/asyncRoute';
import type { IUserState } from '@/store/modules/user';
import type { IScreenLockState } from '@/store/modules/screenLock';
import type { ITabsViewState } from '@/store/modules/tabsView';

export interface IStore {
  asyncRoute: IAsyncRouteState;
  user: IUserState;
  screenLock: IScreenLockState;
  tabsView: ITabsViewState;
  count: number;
}
