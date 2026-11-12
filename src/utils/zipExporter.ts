import JSZip from 'jszip';
import { androidProjectFiles } from '../data/androidProjectFiles';

export async function generateAndDownloadAndroidZip() {
  const zip = new JSZip();

  // Root files
  zip.file(
    'build.gradle.kts',
    `plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.kapt) apply false
    alias(libs.plugins.hilt.android) apply false
}`
  );

  zip.file(
    'settings.gradle.kts',
    `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "Floating2FA"
include(":app")`
  );

  // Layout files
  zip.file(
    'app/src/main/res/layout/layout_floating_bubble.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="56dp"
    android:layout_height="56dp"
    android:background="@drawable/bg_floating_bubble"
    android:elevation="12dp">

    <ImageView
        android:layout_width="28dp"
        android:layout_height="28dp"
        android:layout_gravity="center"
        android:src="@drawable/ic_shield_lock"
        android:tint="#FFFFFF"
        android:contentDescription="Floating 2FA" />
</FrameLayout>`
  );

  zip.file(
    'app/src/main/res/drawable/bg_floating_bubble.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android"
    android:shape="oval">
    <gradient
        android:type="linear"
        android:angle="135"
        android:startColor="#4F46E5"
        android:endColor="#7C3AED" />
    <size
        android:width="56dp"
        android:height="56dp" />
</shape>`
  );

  zip.file(
    'app/src/main/res/drawable/ic_shield_lock.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="24"
    android:viewportHeight="24">
    <path
        android:fillColor="#FFFFFFFF"
        android:pathData="M12,1L3,5v6c0,5.55 3.84,10.74 9,12c5.16,-1.26 9,-6.45 9,-12V5L12,1zM12,11.99h7c-0.53,4.12 -3.28,7.79 -7,8.94V12H5V6.3l7,-3.11V11.99z" />
</vector>`
  );

  zip.file(
    'gradle/wrapper/gradle-wrapper.properties',
    `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.4-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists`
  );

  zip.file(
    'gradlew',
    `#!/bin/sh
exec gradle "$@"`
  );

  // Add all files from androidProjectFiles
  for (const file of androidProjectFiles) {
    zip.file(file.path, file.content);
  }

  // Generate zip blob and trigger download
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Floating2FA-Android-Kotlin-Project.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
