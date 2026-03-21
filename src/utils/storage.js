import localforage from 'localforage';

localforage.config({
    name: 'AntigravityLink',
    storeName: 'app_data'
});

export const saveAppData = async (data) => {
    try {
        const { expressions, globalSettings, calibratedNormal } = data;

        await localforage.setItem('appData', {
            expressions,
            globalSettings,
            calibratedNormal
        });
        console.log('App data saved successfully.');
    } catch (err) {
        console.error('Error saving app data:', err);
        window.alert('‼️ セーブ失敗 ‼️\n容量オーバーか、ブラウザのセキュリティ制限により保存できませんでした。\n' + err.message);
        throw err;
    }
};

export const loadAppData = async () => {
    try {
        const data = await localforage.getItem('appData');
        return data; // Returns { expressions, globalSettings, calibratedNormal } or null
    } catch (err) {
        console.error('Error loading app data:', err);
        return null;
    }
};

export const clearAppData = async () => {
    try {
        await localforage.clear();
    } catch (err) {
        console.error('Error clearing app data:', err);
        throw err;
    }
};

export const saveLastMicDevice = async (deviceId) => {
    try {
        await localforage.setItem('lastMicDeviceId', deviceId);
    } catch (err) {
        console.error('Error saving mic device:', err);
    }
};

export const loadLastMicDevice = async () => {
    try {
        return await localforage.getItem('lastMicDeviceId');
    } catch (err) {
        console.error('Error loading mic device:', err);
        return null;
    }
};
