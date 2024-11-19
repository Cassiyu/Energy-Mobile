import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface IconLeftProps {
  onPress: () => void;
}

const IconLeft: React.FC<IconLeftProps> = ({ onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Icon name="arrow-left" size={35} color="#1E3E69" />
    </TouchableOpacity>
  );
};

export default IconLeft;
