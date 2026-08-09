const fs = require('fs');
const svg = fs.readFileSync('dist/notification logo one.svg', 'utf8');
const paths = [...svg.matchAll(/d="([^"]+)"/g)].map(m => m[1]);
const xml = `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="24dp"
    android:height="24dp"
    android:viewportWidth="901"
    android:viewportHeight="901">
` + paths.map(p => `    <path android:fillColor="@android:color/white" android:fillType="evenOdd" android:pathData="${p}" />`).join('\n') + `
</vector>`;
fs.writeFileSync('android/app/src/main/res/drawable/ic_stat_icon_config_sample.xml', xml);
console.log('Done converting SVG to Android Vector!');
