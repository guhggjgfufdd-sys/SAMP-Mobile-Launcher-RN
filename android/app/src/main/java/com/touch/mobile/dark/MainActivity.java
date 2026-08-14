package com.touch.mobile.dark;

import android.os.Bundle;
import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;

public class MainActivity extends ReactActivity {

  @Override
  protected String getMainComponentName() {
    return "TouchMobile"; // ← تأكد من هذا الاسم
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(null); // ← هذا السطر يمنع التعطل مع React Navigation
  }
}
