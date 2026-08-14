package com.touch.mobile.dark;

import com.candidegardening.gpuinfo.GLSurfaceInspector;
import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;
import android.os.Bundle;
import com.zoontek.rnbootsplash.RNBootSplash;

public class MainActivity extends ReactActivity {

  private GLSurfaceInspector surfaceInspector = new GLSurfaceInspector();

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    RNBootSplash.init(this);
    super.onCreate(null);
    surfaceInspector.init(this);
  }

  @Override
  protected void onPause() {
    super.onPause();
    surfaceInspector.onPause();
  }

  @Override
  protected void onResume() {
    super.onResume();
    surfaceInspector.onResume();
  }

  @Override
  protected String getMainComponentName() {
    return "TouchMobile";
  }

  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new MainActivityDelegate(this, getMainComponentName());
  }

  public static class MainActivityDelegate extends ReactActivityDelegate {
    public MainActivityDelegate(ReactActivity activity, String mainComponentName) {
      super(activity, mainComponentName);
    }

    @Override
    protected ReactRootView createRootView() {
      ReactRootView reactRootView = new ReactRootView(getContext());
      reactRootView.setIsFabric(false);  // ← تعديل: بدل BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
      return reactRootView;
    }

    @Override
    protected boolean isConcurrentRootEnabled() {
      return false;  // ← تعديل: بدل BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
    }
  }
}
