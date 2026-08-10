import { StackActions } from '@react-navigation/native';
import { setDistribution } from '../actions/distributionActions';
import { navigationRef } from '../routers/RootNavigation';
import { DistributionService } from '../services/distribution.service';
import { AppThunk } from '../store/store';

export const fetchDistribution = (): AppThunk => async (dispatch, state) => {
  try {
    const { cache: caches, ...res } = await DistributionService.get();
    await dispatch(setDistribution(res));
    
    // ✅ نتجاوز فحص cache ونروح مباشرة للـ Main
    return navigationRef.current?.dispatch(StackActions.replace('Main'));
    
  } catch (error: any) {
    console.log(error);
    // ✅ حتى لو خطأ، نروح للـ Main مو للـ Error
    return navigationRef.current?.dispatch(StackActions.replace('Main'));
  }
};
