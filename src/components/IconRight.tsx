import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface IconRightProps {
  onPress: () => void;
}

const IconRight: React.FC<IconRightProps> = ({ onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Icon name="arrow-right" size={30} color="#1E3E69" />
    </TouchableOpacity>
  );
};

export default IconRight;
