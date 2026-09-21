plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "id.pyclass.ujian"
    compileSdk = 34

    defaultConfig {
        applicationId = "id.pyclass.ujian"
        // Android 7.0. Screen pinning ada sejak Android 5.0, jadi HP lama tetap terkunci.
        minSdk = 24
        targetSdk = 34
        versionCode = 2
        versionName = "1.1"
    }

    buildTypes {
        // Rilis memakai tanda tangan debug: APK dibagikan lewat tautan, bukan Play Store.
        // Pemasangan tetap perlu izin "instal aplikasi tidak dikenal" di HP murid.
        release {
            isMinifyEnabled = false
            signingConfig = signingConfigs.getByName("debug")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
}

// Tanpa dependensi pihak ketiga: hanya kelas bawaan Android. Build CI jadi cepat
// dan tidak ada pustaka yang perlu diaudit sebelum masuk HP murid.
dependencies {}
