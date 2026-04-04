import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function AdvisorScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Экран советов</Text>
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