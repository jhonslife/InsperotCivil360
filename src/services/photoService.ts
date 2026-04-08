import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { generateId } from '../utils/generateId';

const PHOTOS_DIR = `${FileSystem.documentDirectory}photos/`;

async function ensurePhotosDir(): Promise<void> {
  const dirInfo = await FileSystem.getInfoAsync(PHOTOS_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(PHOTOS_DIR, { intermediates: true });
  }
}

export async function takePhoto(): Promise<string | null> {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    return null;
  }

  const result = await ImagePicker.launchCameraAsync({
    quality: 0.8,
    allowsEditing: false,
    mediaTypes: ['images'],
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  return await savePhoto(result.assets[0].uri);
}

export async function pickPhoto(): Promise<string | null> {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    quality: 0.8,
    allowsEditing: false,
    mediaTypes: ['images'],
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  return await savePhoto(result.assets[0].uri);
}

async function savePhoto(sourceUri: string): Promise<string> {
  await ensurePhotosDir();
  const filename = `${generateId()}.jpg`;
  const destUri = `${PHOTOS_DIR}${filename}`;
  await FileSystem.copyAsync({ from: sourceUri, to: destUri });
  return destUri;
}

export async function getPhotoBase64(uri: string): Promise<string> {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return `data:image/jpeg;base64,${base64}`;
  } catch {
    return '';
  }
}

export async function saveSignature(base64Data: string): Promise<string> {
  await ensurePhotosDir();
  const filename = `sig_${generateId()}.png`;
  const destUri = `${PHOTOS_DIR}${filename}`;
  const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
  await FileSystem.writeAsStringAsync(destUri, cleanBase64, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return destUri;
}

export async function replaceSignatureFile(
  base64Data: string,
  currentPath: string | null,
  persistSignaturePath?: (nextPath: string) => Promise<void>
): Promise<string> {
  const nextPath = await saveSignature(base64Data);

  try {
    if (persistSignaturePath) {
      await persistSignaturePath(nextPath);
    }
  } catch (error) {
    await deleteStoredFile(nextPath);
    throw error;
  }

  if (currentPath && currentPath !== nextPath) {
    await deleteStoredFile(currentPath);
  }

  return nextPath;
}

export async function deleteStoredFile(uri: string): Promise<void> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    }
  } catch {
    // Ignore deletion errors to avoid blocking record cleanup.
  }
}
