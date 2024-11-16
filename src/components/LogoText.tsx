import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

const LogoText = () => {
  return (
    <View style={styles.container}>
      <Image 
        source={require('../images/logo-text.png')} 
        style={styles.logo} 
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    marginTop: 2,
    width: 150, 
  },
});

export default LogoText;
