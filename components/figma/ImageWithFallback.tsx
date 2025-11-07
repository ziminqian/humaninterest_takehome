import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageProps,
  ImageSourcePropType,
  StyleSheet,
  View,
} from 'react-native';

type Props = Omit<ImageProps, 'source'> & {
  source: ImageSourcePropType;
  fallbackSrc?: string;
};

export const ImageWithFallback: React.FC<Props> = ({
  source,
  fallbackSrc,
  style,
  onError,
  ...rest
}) => {
  const [currentSource, setCurrentSource] = useState<ImageSourcePropType>(source);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <View style={[styles.container, style]}>
      <Image
        {...rest}
        source={currentSource}
        style={StyleSheet.absoluteFill}
        onLoadEnd={() => setIsLoading(false)}
        onError={(error) => {
          if (fallbackSrc) {
            setCurrentSource({ uri: fallbackSrc });
          }
          setIsLoading(false);
          onError?.(error);
        }}
        resizeMode={rest.resizeMode ?? 'cover'}
      />
      {isLoading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator color="#4A90E2" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
});
