import { AppThunk } from '../store/store';

export const appRegisterDeviceForRemoteMessages = (): AppThunk => async () => {
  // دالة وهمية لتجاوز نقص مكتبات الإشعارات
};

export const createPushNotificationLeader = (): AppThunk => async dispatch => {
  dispatch(onUploadTaskEventLoader({ status: 'cancel' }));
};

export const onUploadTaskEventLoader = (_event: any): AppThunk => async () => {
  // دالة وهمية لتحديث شريط إشعارات التحميل دون أخطاء
};
