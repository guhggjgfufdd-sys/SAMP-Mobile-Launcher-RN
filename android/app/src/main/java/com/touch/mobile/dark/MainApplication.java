package com.touch.mobile.dark;

import android.app.Application;
import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.soloader.SoLoader;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost =
      new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
          return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
          @SuppressWarnings("UnnecessaryLocalVariable")
          List<ReactPackage> packages = new PackageList(this).getPackages();
          return packages;
        }

        @Override
        protected String getJSMainModuleName() {
          return "indexلا تعقد نفسك، لا تحاول إضافة سطر واحد. بما أنك تستخدم الهاتف، أسهل وأضمن طريقة هي **استبدال محتوى الملف بالكامل**.

### اتبع هذه الخطوات بدقة:

1.  افتح ملف `MainApplication.java` في المسار:
    `android/app/src/main/java/com/touch/mobile/dark/MainApplication.java`
2.  اضغط على **أيقونة القلم** (للتعديل).
3.  **امسح كل شيء** موجود داخل الملف (حدد الكل واضغط حذف).
4.  الصق الكود التالي بالكامل:

```java
package com.touch.mobile.dark;

import android.app.Application;
import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.soloader.SoLoader;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost =
      new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
          return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
          @SuppressWarnings("UnnecessaryLocalVariable")
          List<ReactPackage> packages = new PackageList(this).getPackages();
          return packages;
        }

        @Override
        protected String getJSMainModuleName() {
          return "index";
        }
      };

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
  }

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }
}
