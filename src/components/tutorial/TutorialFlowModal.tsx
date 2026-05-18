import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import colors from '../../constants/colors';
import { TutorialActionTarget, TutorialFlow, TutorialHighlight } from '../../data/tutorials';
import { measureTutorialTarget } from './TutorialTarget';

type Props = {
  visible: boolean;
  flow: TutorialFlow | null;
  onFinish: () => void;
  onNavigateToTarget?: (target: TutorialActionTarget) => void;
};

function getStepIcon(target: TutorialActionTarget, locked?: boolean) {
  if (locked) return 'lock-closed';

  switch (target) {
    case 'home':
      return 'home';
    case 'household':
      return 'home';
    case 'life':
      return 'business';
    case 'bank':
      return 'card';
    case 'challenges':
      return 'trophy';
    case 'missions':
      return 'checkmark-circle';
    case 'advisor':
      return 'chatbubble-ellipses';
    default:
      return 'sparkles';
  }
}

function getTargetButtonText(target?: TutorialActionTarget) {
  switch (target) {
    case 'home':
      return 'Показать главный экран';
    case 'household':
      return 'Показать Дом';
    case 'challenges':
      return 'Показать Челленджи';
    case 'missions':
      return 'Показать Цели';
    case 'advisor':
      return 'Показать Советы';
    case 'bank':
      return 'Показать Банк';
    case 'life':
      return 'Показать Жизнь';
    default:
      return 'Дальше';
  }
}

export default function TutorialFlowModal({
  visible,
  flow,
  onFinish,
  onNavigateToTarget,
}: Props) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const [stepIndex, setStepIndex] = useState(0);
  const [measuredHighlight, setMeasuredHighlight] =
    useState<TutorialHighlight | null>(null);

  const steps = flow?.steps ?? [];
  const currentStep = steps[stepIndex];
  const nextStep = steps[stepIndex + 1];

  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === steps.length - 1;

  const lastNavigatedStepIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!visible || !currentStep) {
      return;
    }

    if (lastNavigatedStepIdRef.current === currentStep.id) {
      return;
    }

    lastNavigatedStepIdRef.current = currentStep.id;

    if (currentStep.actionTarget && currentStep.actionTarget !== 'none') {
      onNavigateToTarget?.(currentStep.actionTarget);
    }
  }, [
    visible,
    currentStep?.id,
    currentStep?.actionTarget,
    onNavigateToTarget,
  ]);

  useEffect(() => {
    setStepIndex(0);
    setMeasuredHighlight(null);
    lastNavigatedStepIdRef.current = null;
  }, [flow?.id]);

  useEffect(() => {
    let cancelled = false;

    setMeasuredHighlight(null);

    if (!visible || !currentStep?.targetKey) {
      return;
    }

    const padding = currentStep.targetPadding ?? 8;

    const measure = async () => {
      const layout = await measureTutorialTarget(currentStep.targetKey!);

      if (cancelled || !layout) {
        return;
      }

      const top = Math.max(8, layout.y - padding);
      const left = Math.max(8, layout.x - padding);

      const rawWidth = layout.width + padding * 2;
      const rawHeight = layout.height + padding * 2;

      const width = Math.min(rawWidth, screenWidth - left - 8);
      const height = Math.min(rawHeight, screenHeight - top - 8);

      setMeasuredHighlight({
        top,
        left,
        width,
        height,
        borderRadius: currentStep.highlight?.borderRadius ?? 24,
        cardPosition: currentStep.highlight?.cardPosition ?? 'bottom',
      });
    };

    const timers = [
      setTimeout(measure, 80),
      setTimeout(measure, 250),
      setTimeout(measure, 550),
    ];

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [
    visible,
    currentStep?.id,
    currentStep?.targetKey,
    currentStep?.targetPadding,
    screenWidth,
    screenHeight,
  ]);

  const progressText = useMemo(() => {
    if (!flow || steps.length === 0) return '';
    return `${stepIndex + 1}/${steps.length}`;
  }, [flow, stepIndex, steps.length]);

  if (!flow || !currentStep) {
    return null;
  }

  const highlight = currentStep.targetKey
    ? measuredHighlight
    : currentStep.highlight ?? null;

  const hasHighlight = Boolean(highlight);

  const highlightTop = highlight?.top ?? 0;
  const highlightLeft = highlight?.left ?? 0;
  const highlightWidth = highlight?.width ?? 0;
  const highlightHeight = highlight?.height ?? 0;
  const highlightRadius = highlight?.borderRadius ?? 22;

  const cardPosition = highlight?.cardPosition ?? 'bottom';

  const cardTop =
    hasHighlight && cardPosition === 'bottom'
      ? Math.min(highlightTop + highlightHeight + 14, screenHeight - 335)
      : undefined;

  const cardBottom =
    hasHighlight && cardPosition === 'top'
      ? Math.max(screenHeight - highlightTop + 14, 85)
      : undefined;

  const cardStyle =
    hasHighlight && cardPosition === 'top'
      ? [
          styles.infoCard,
          styles.infoCardFloating,
          {
            bottom: cardBottom,
          },
        ]
      : hasHighlight
      ? [
          styles.infoCard,
          styles.infoCardFloating,
          {
            top: cardTop,
          },
        ]
      : [styles.infoCard, styles.infoCardBottom];

  const handleBack = () => {
    if (!isFirstStep) {
      setStepIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (isLastStep) {
      setStepIndex(0);
      setMeasuredHighlight(null);
      onFinish();
      return;
    }

    setStepIndex((prev) => prev + 1);
  };

  const handleClose = () => {
    setStepIndex(0);
    setMeasuredHighlight(null);
    lastNavigatedStepIdRef.current = null;
    onFinish();
  };

  const nextButtonText = isLastStep
    ? 'Завершить'
    : nextStep?.actionText ??
      getTargetButtonText(nextStep?.actionTarget) ??
      'Дальше';

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay} pointerEvents="box-none">
        {hasHighlight ? (
          <>
            <View
              style={[
                styles.dimPart,
                {
                  top: 0,
                  left: 0,
                  right: 0,
                  height: highlightTop,
                },
              ]}
            />

            <View
              style={[
                styles.dimPart,
                {
                  top: highlightTop + highlightHeight,
                  left: 0,
                  right: 0,
                  bottom: 0,
                },
              ]}
            />

            <View
              style={[
                styles.dimPart,
                {
                  top: highlightTop,
                  left: 0,
                  width: highlightLeft,
                  height: highlightHeight,
                },
              ]}
            />

            <View
              style={[
                styles.dimPart,
                {
                  top: highlightTop,
                  left: highlightLeft + highlightWidth,
                  right: 0,
                  height: highlightHeight,
                },
              ]}
            />

            <View
              pointerEvents="none"
              style={[
                styles.highlightBox,
                {
                  top: highlightTop,
                  left: highlightLeft,
                  width: highlightWidth,
                  height: highlightHeight,
                  borderRadius: highlightRadius,
                },
              ]}
            />

            <View
              pointerEvents="none"
              style={[
                styles.highlightGlow,
                {
                  top: highlightTop - 3,
                  left: highlightLeft - 3,
                  width: highlightWidth + 6,
                  height: highlightHeight + 6,
                  borderRadius: highlightRadius + 3,
                },
              ]}
            />
          </>
        ) : (
          <View style={styles.dimLayer} />
        )}

        <View style={cardStyle}>
          <View style={styles.topRow}>
            <View
              style={[
                styles.badge,
                currentStep.locked && styles.lockedBadge,
              ]}
            >
              <Ionicons
                name={getStepIcon(
                  currentStep.actionTarget ?? 'none',
                  currentStep.locked
                )}
                size={15}
                color={currentStep.locked ? '#8A5A00' : colors.primary}
              />

              <Text
                style={[
                  styles.badgeText,
                  currentStep.locked && styles.lockedBadgeText,
                ]}
              >
                {currentStep.locked ? 'Закрыто' : 'Обучение'}
              </Text>
            </View>

            <View style={styles.rightTop}>
              <Text style={styles.progress}>{progressText}</Text>

              <Pressable onPress={handleClose} hitSlop={10}>
                <Ionicons name="close" size={21} color="#7B8B86" />
              </Pressable>
            </View>
          </View>

          <Text style={styles.title}>{currentStep.title}</Text>

          <Text style={styles.subtitle}>{currentStep.subtitle}</Text>

          <Text style={styles.description}>{currentStep.description}</Text>

          {currentStep.locked ? (
            <View style={styles.lockedBox}>
              <Ionicons name="lock-closed" size={17} color="#8A5A00" />

              <Text style={styles.lockedText}>
                {currentStep.lockedText ?? 'Эта возможность откроется позже'}
              </Text>
            </View>
          ) : null}

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.backButton, isFirstStep && styles.disabledButton]}
              activeOpacity={0.85}
              disabled={isFirstStep}
              onPress={handleBack}
            >
              <Text
                style={[
                  styles.backButtonText,
                  isFirstStep && styles.disabledButtonText,
                ]}
              >
                Назад
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.nextButton}
              activeOpacity={0.9}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText} numberOfLines={1}>
                {nextButtonText}
              </Text>

              {!isLastStep ? (
                <Ionicons name="arrow-forward" size={17} color="#FFFFFF" />
              ) : null}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  dimLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(6, 20, 18, 0.68)',
  },
  dimPart: {
    position: 'absolute',
    backgroundColor: 'rgba(6, 20, 18, 0.68)',
  },
  highlightBox: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#F8D95B',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  highlightGlow: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(255, 236, 120, 0.65)',
    backgroundColor: 'transparent',
  },
  infoCard: {
    backgroundColor: '#FFFDF6',
    borderRadius: 26,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    borderWidth: 1,
    borderColor: '#E8DFC8',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 9,
  },
  infoCardBottom: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 18,
  },
  infoCardFloating: {
    position: 'absolute',
    left: 14,
    right: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rightTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF6F2',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  lockedBadge: {
    backgroundColor: '#FFF1C7',
  },
  badgeText: {
    marginLeft: 6,
    color: colors.primary,
    fontSize: 13,
    fontWeight: '900',
  },
  lockedBadgeText: {
    color: '#8A5A00',
  },
  progress: {
    fontSize: 13,
    fontWeight: '900',
    color: '#7B8B86',
  },
  title: {
    marginTop: 14,
    fontSize: 21,
    fontWeight: '900',
    color: colors.primaryDark,
  },
  subtitle: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: '900',
    color: '#3B5F58',
  },
  description: {
    marginTop: 9,
    fontSize: 14,
    lineHeight: 20,
    color: '#60716C',
  },
  lockedBox: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF1C7',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  lockedText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    lineHeight: 18,
    color: '#8A5A00',
    fontWeight: '800',
  },
  footer: {
    marginTop: 15,
    flexDirection: 'row',
    gap: 10,
  },
  backButton: {
    width: 105,
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D8CDB6',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  backButtonText: {
    color: '#48655F',
    fontSize: 15,
    fontWeight: '900',
  },
  nextButton: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
    paddingHorizontal: 12,
  },
  nextButtonText: {
    flexShrink: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  disabledButton: {
    opacity: 0.45,
  },
  disabledButtonText: {
    color: '#98A6A2',
  },
});