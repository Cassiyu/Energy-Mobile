import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface CustomPickerProps {
  selectedValue: string;
  onValueChange: (itemValue: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  style?: ViewStyle;
}

const CustomPicker: React.FC<CustomPickerProps> = ({ selectedValue, onValueChange, style, options, placeholder }) => {
  return (
    <View style={styles.pickerContainer}>
      <Picker
        selectedValue={selectedValue}
        onValueChange={(itemValue) => onValueChange(itemValue)}
        style={[styles.picker, style]}
        itemStyle={styles.pickerItem}
      >
        {placeholder && <Picker.Item label={placeholder} value="" />}
        {options.map((option) => (
          <Picker.Item key={option.value} label={option.label} value={option.value} />
        ))}
      </Picker>
    </View>
  );
};

const styles = StyleSheet.create({
  pickerContainer: {
    marginTop: 8,
    borderColor: '#bbb',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#ccc'
  },
  picker: {
    height: 55,
    width: '100%',
  },
  pickerItem: {
    fontSize: 16,
    color: '#333',
  },
});

export default CustomPicker;
