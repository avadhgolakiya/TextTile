# Flutter + Supabase ProGuard rules
# Keep all Flutter engine classes
-keep class io.flutter.** { *; }
-keep class io.flutter.plugins.** { *; }

# Supabase / Ktor / OkHttp
-keep class io.github.jan.supabase.** { *; }
-dontwarn io.ktor.**
-keep class io.ktor.** { *; }

# Gal (gallery plugin)
-keep class jp.co.shi_waka.gal.** { *; }

# Keep data model classes (JSON deserialization)
-keep class com.example.saarika.** { *; }

# Suppress common warnings from third-party libs
-dontwarn org.conscrypt.**
-dontwarn org.bouncycastle.**
-dontwarn org.openjsse.**
