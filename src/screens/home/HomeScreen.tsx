import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { RootTabParamList } from '../../navigation/AppNavigator';

type Props = BottomTabScreenProps<RootTabParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.logoIcon}>F</Text>
        <Text style={styles.logoText}>FINITY</Text>

        <View style={styles.coinSection}>
          <Text style={styles.sparkleLeft}>✦</Text>
          <View style={styles.coinShadow} />
          <View style={styles.coinOuter}>
            <View style={styles.coinMiddle}>
              <View style={styles.coinInner}>
                <Text style={styles.coinDollar}>$</Text>
              </View>
            </View>
          </View>
          <Text style={styles.sparkleRight}>✦</Text>
        </View>

        <Text style={styles.title}>
          Изучайте{'\n'}
          финансовую{'\n'}
          грамотность, играя
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('MissionsTab')}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>Миссии</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Life')}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>Играть</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A6A61',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 18,
  },
  logoIcon: {
    fontSize: 44,
    fontWeight: '900',
    color: '#F2C84B',
    marginBottom: 6,
  },
  logoText: {
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 5,
    color: '#F2C84B',
    marginBottom: 22,
  },
  coinSection: {
    position: 'relative',
    width: 240,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  coinShadow: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#B87608',
    right: 28,
    top: 42,
  },
  coinOuter: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#F5D15A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 8,
    borderColor: '#F8E28E',
  },
  coinMiddle: {
    width: 148,
    height: 148,
    borderRadius: 74,
    backgroundColor: '#E2A91A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#B77909',
  },
  coinInner: {
    width: 122,
    height: 122,
    borderRadius: 61,
    backgroundColor: '#F2C84B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#F7DE7B',
  },
  coinDollar: {
    fontSize: 62,
    fontWeight: '900',
    color: '#C18A10',
  },
  sparkleLeft: {
    position: 'absolute',
    left: 6,
    bottom: 45,
    fontSize: 28,
    color: '#F2C84B',
  },
  sparkleRight: {
    position: 'absolute',
    right: 0,
    top: 36,
    fontSize: 28,
    color: '#F2C84B',
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    color: '#F7F1E4',
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    width: '100%',
    backgroundColor: '#F2C84B',
    borderRadius: 28,
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 3,
  },
  buttonText: {
    fontSize: 30,
    fontWeight: '900',
    color: '#0A4F4A',
  },
});