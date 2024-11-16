import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface IconLogoutProps {
  onPress: () => void;
}

const IconLogout: React.FC<IconLogoutProps> = ({ onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Icon name="logout" size={30} color="#1E3E69" />
    </TouchableOpacity>
  );
};

export default IconLogout;
