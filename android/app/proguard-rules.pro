-keep class com.facebook.react.** { *; }
-keep class com.facebook.react.bridge.** { *; }
-keep class com.facebook.react.modules.** { *; }
-keep class com.facebook.react.uimanager.** { *; }
-keep class com.facebook.react.fabric.** { *; }
-keep class com.facebook.react.common.** { *; }

-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.jsi.** { *; }

-keep class com.swmansion.gesturehandler.** { *; }
-keep class com.swmansion.reanimated.** { *; }
-keep class com.swmansion.rnscreens.** { *; }
-keep class com.swmansion.rnscreens.ScreenFragment { *; }
-keep class com.swmansion.rnscreens.Screen { *; }

-keep class com.th3rdwave.safeareacontext.** { *; }

-keep class com.rnfs.** { *; }
-keep class com.rnziparchive.** { *; }

-keep class com.touch.mobile.dark.** { *; }

-keepclasseswithmembernames class * {
    native <methods>;
}

-keepattributes JavascriptInterface
-keep class * { @com.facebook.react.bridge.JavascriptInterface <methods>; }

-keepattributes *Annotation*
-keepattributes Signature
-keepattributes Exceptions
-keepattributes SourceFile,LineNumberTable

-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn com.squareup.okhttp.**
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }

-keepclassmembers class * {
    @com.facebook.react.uimanager.annotations.ReactProp <methods>;
    @com.facebook.react.uimanager.annotations.ReactPropGroup <methods>;
}
