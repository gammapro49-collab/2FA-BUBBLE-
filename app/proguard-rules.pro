# Proguard rules for Floating 2FA
-keepattributes *Annotation*
-keepclassmembers class * {
    @androidx.room.* <methods>;
}
