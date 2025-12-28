
import googleServices from '../../google-services.json';
import { Platform } from 'react-native';

// Parse google-services.json for Android
const androidClient = googleServices.client[0];
const projectInfo = googleServices.project_info;

const androidConfig = {
    apiKey: androidClient.api_key[0].current_key,
    authDomain: `${projectInfo.project_id}.firebaseapp.com`,
    projectId: projectInfo.project_id,
    storageBucket: projectInfo.storage_bucket,
    messagingSenderId: projectInfo.project_number,
    appId: androidClient.client_info.mobilesdk_app_id,
};

// Hardcoded values from GoogleService-Info.plist for iOS
// (Since we can't import .plist files directly in JS easily without a transformer)
const iosConfig = {
    apiKey: 'AIzaSyC-SMj2NLK27BOzvFihS8A8R4hzBQTl0dU', // from PLIST key API_KEY
    authDomain: 'reprecord-33355.firebaseapp.com',
    projectId: 'reprecord-33355',
    storageBucket: 'reprecord-33355.firebasestorage.app',
    messagingSenderId: '708122173666',
    appId: '1:708122173666:ios:2fee97d763b94bb9907ebb', // from PLIST key GOOGLE_APP_ID
};

export const firebaseConfig = Platform.OS === 'ios' ? iosConfig : androidConfig;
