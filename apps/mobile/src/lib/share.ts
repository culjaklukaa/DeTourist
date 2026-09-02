import * as Sharing from 'expo-sharing';

export async function shareRecapImage(imageUri: string) {
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Sharing is not available on this device');
  }

  await Sharing.shareAsync(imageUri, {
    mimeType: 'image/png',
    dialogTitle: 'Share your Trip Recap',
    UTI: 'public.png', // for iOS
  });
}
