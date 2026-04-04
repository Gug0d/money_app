import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function MissionsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Экран миссий</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4EEDB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0A6A61',
  },
});