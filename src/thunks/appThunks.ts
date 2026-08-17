import { setGPU, setInitial } from '../actions/appActions';
import { AppThunk } from '../store/store';
import { fetchArticles } from './articleThunks';
import { fetchDistribution } from './distributionThunks';
import { fetchDonates } from './donateThunks';
import { appRegisterDeviceForRemoteMessages } from './notificationThunks';
import { fetchInitialSettings } from './settingsThunks';

// بديل وهمي لمكتبة GPU لتجاوز نقص الحزمة أثناء التجميع
const RNGpuInfo = {
  getGlRenderer: () => 'etc',
};

// بديل وهمي لدالة الصلاحيات لتجنب عدم وجود ملف permissionThunks
const fetchPermissions = (): AppThunk => async () => {};

export const fetchInitialApp = (): AppThunk => async dispatch => {
  const glRenderer = RNGpuInfo.getGlRenderer();
  dispatch(setGPU(glRenderer));

  await dispatch(fetchPermissions());
  await dispatch(fetchInitialSettings());
  await dispatch(fetchDistribution());
  await dispatch(fetchArticles());
  await dispatch(fetchDonates());
  await dispatch(appRegisterDeviceForRemoteMessages());

  dispatch(setInitial({ initial: true }));
};
