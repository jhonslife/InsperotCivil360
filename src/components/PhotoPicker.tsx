import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../constants/theme';
import { Photo, PhotoEntityType } from '../models/Photo';
import { takePhoto, pickPhoto, deleteStoredFile } from '../services/photoService';
import { addPhoto, deletePhoto } from '../database/repositories/photoRepository';

interface PhotoPickerProps {
  photos: Photo[];
  entityType: PhotoEntityType;
  entityId?: string;
  onPhotosChanged: () => void;
  onAddPhoto?: (uri: string) => Promise<void>;
  onDeletePhoto?: (photo: Photo) => Promise<void>;
}

export function PhotoPicker({
  photos,
  entityType,
  entityId,
  onPhotosChanged,
  onAddPhoto,
  onDeletePhoto,
}: PhotoPickerProps) {
  const addPersistedPhoto = async (uri: string) => {
    try {
      if (onAddPhoto) {
        await onAddPhoto(uri);
      } else if (entityId) {
        await addPhoto(entityType, entityId, uri);
      }
      onPhotosChanged();
    } catch (error) {
      console.error('Erro ao adicionar foto:', error);
      Alert.alert('Erro', 'Não foi possível adicionar a foto.');
    }
  };

  const handleAddPhoto = () => {
    Alert.alert('Adicionar Foto', 'Escolha a origem da foto', [
      {
        text: 'Câmera',
        onPress: async () => {
          const uri = await takePhoto();
          if (uri) {
            await addPersistedPhoto(uri);
          }
        },
      },
      {
        text: 'Galeria',
        onPress: async () => {
          const uri = await pickPhoto();
          if (uri) {
            await addPersistedPhoto(uri);
          }
        },
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const handleDeletePhoto = (photo: Photo) => {
    Alert.alert('Remover Foto', 'Deseja remover esta foto?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          try {
            if (onDeletePhoto) {
              await onDeletePhoto(photo);
            } else {
              await deletePhoto(photo.id);
              await deleteStoredFile(photo.uri);
            }
            onPhotosChanged();
          } catch (error) {
            console.error('Erro ao remover foto:', error);
            Alert.alert('Erro', 'Não foi possível remover a foto.');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addButton} onPress={handleAddPhoto} activeOpacity={0.7}>
        <MaterialCommunityIcons name="camera" size={22} color={COLORS.surface} />
        <Text style={styles.addButtonText}>Adicionar Fotos</Text>
      </TouchableOpacity>

      {photos.length > 0 && (
        <FlatList
          data={photos}
          horizontal
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.photoList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.photoItem}
              onLongPress={() => handleDeletePhoto(item)}
            >
              <Image source={{ uri: item.uri }} style={styles.photo} />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.sm,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.small,
  },
  addButtonText: {
    color: COLORS.surface,
    fontSize: 15,
    fontWeight: '600',
    marginLeft: SPACING.sm,
  },
  photoList: {
    paddingTop: SPACING.sm,
  },
  photoItem: {
    marginRight: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.md,
  },
});
