import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { Colors } from '../../constants/colors';

interface SheetOption {
  label: string;
  onPress: () => void;
  destructive?: boolean;
  icon?: React.ReactNode;
}

interface Props {
  visible: boolean;
  title?: string;
  options: SheetOption[];
  onClose: () => void;
}

export function Sheet({ visible, title, options, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>
      <View style={styles.sheet}>
        <View style={styles.handle} />
        {title && <Text style={styles.title}>{title}</Text>}
        {options.map((opt, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.option, i < options.length - 1 && styles.optionBorder]}
            onPress={() => { opt.onPress(); onClose(); }}
            activeOpacity={0.7}
          >
            {opt.icon}
            <Text style={[styles.optionText, opt.destructive && styles.destructive]}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingBottom: 34, paddingHorizontal: 16,
  },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: Colors.border, alignSelf: 'center', marginVertical: 10 },
  title: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary, textAlign: 'center', marginBottom: 10 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 16 },
  optionBorder: { borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  optionText: { fontSize: 16, color: Colors.text },
  destructive: { color: Colors.high },
  cancelBtn: {
    marginTop: 10, backgroundColor: Colors.backgroundSecondary,
    borderRadius: 14, paddingVertical: 14, alignItems: 'center',
  },
  cancelText: { fontSize: 16, fontWeight: '500', color: Colors.text },
});
