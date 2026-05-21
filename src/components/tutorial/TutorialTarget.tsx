import React from 'react';
import { View, ViewProps } from 'react-native';

export type TutorialTargetLayout = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const targetRegistry = new Map<string, View | null>();

type TutorialTargetFocusListener = (targetId: string) => void;

const focusListeners = new Set<TutorialTargetFocusListener>();

type Props = ViewProps & {
  id: string;
  children: React.ReactNode;
};

export default function TutorialTarget({ id, children, ...props }: Props) {
  return (
    <View
      {...props}
      collapsable={false}
      ref={(node) => {
        if (node) {
          targetRegistry.set(id, node);
        } else {
          targetRegistry.delete(id);
        }
      }}
    >
      {children}
    </View>
  );
}

export function measureTutorialTarget(
  id: string
): Promise<TutorialTargetLayout | null> {
  return new Promise((resolve) => {
    const target = targetRegistry.get(id);

    if (!target || typeof target.measureInWindow !== 'function') {
      resolve(null);
      return;
    }

    target.measureInWindow((x, y, width, height) => {
      if (!width || !height) {
        resolve(null);
        return;
      }

      resolve({
        x,
        y,
        width,
        height,
      });
    });
  });
}

export function addTutorialTargetFocusListener(
  listener: TutorialTargetFocusListener
) {
  focusListeners.add(listener);

  return () => {
    focusListeners.delete(listener);
  };
}

export function emitTutorialTargetFocus(targetId: string) {
  focusListeners.forEach((listener) => {
    listener(targetId);
  });
}