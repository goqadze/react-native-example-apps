import * as React from 'react';
import {
  StatusBar,
  FlatList,
  Image,
  Animated,
  Text,
  View,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  Easing,
  SafeAreaViewBase,
  SafeAreaView,
} from 'react-native';
const { width, height } = Dimensions.get('screen');

const API_KEY = '563492ad6f91700001000001d035a85b2c2840729b9dffc0e5ce928b';
const API_URL =
  'https://api.pexels.com/v1/search?query=nature&orientation=portrait&size=small&per_page=20';
const IMAGE_SIZE = 80;
const SPACING = 10;

const fetchImagesFromPexels = async () => {
  const data = await fetch(API_URL, {
    headers: {
      Authorization: API_KEY,
    },
  });

  const { photos } = await data.json();

  return photos;
};

export default () => {
  const [images, setImages] = React.useState(null);

  React.useEffect(() => {
    const fetchImages = async () => {
      const images = await fetchImagesFromPexels();

      setImages(images);
    };

    fetchImages();
  }, []);

  const topRef = React.useRef(null);
  const thumbRef = React.useRef(null);
  const [activeIndex, setActiveIndex] = React.useState(0);

  const scrollToActiveIndex = (index) => {
    setActiveIndex(index);

    // scroll top flat list
    topRef?.current?.scrollToOffset({
      offset: index * width,
      animated: true,
    });

    // scroll thumb flat list
    if (index * (IMAGE_SIZE + SPACING) - IMAGE_SIZE / 2 > width / 2) {
      thumbRef?.current?.scrollToOffset({
        offset: index * (IMAGE_SIZE + SPACING) - width / 2 + IMAGE_SIZE / 2,
        animated: true
      });
    } else {
      thumbRef?.current?.scrollToOffset({
        offset: 0,
        animated: true
      });
    }
  };

  if (!images) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text>Loading...</Text>
      </View>
    );
  }

  // console.log(images);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <FlatList
        ref={topRef}
        data={images}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        onMomentumScrollEnd={(ev) => {
          // console.log(Math.floor((ev.nativeEvent.contentOffset.x + 1e-3) / width), ev.nativeEvent.contentOffset.x, width);
          scrollToActiveIndex(
            Math.floor((ev.nativeEvent.contentOffset.x + 1e-3) / width)
          );
        }}
        renderItem={({ item }) => {
          return (
            <View style={{ width, height }}>
              <Image
                source={{
                  uri: item.src.portrait,
                }}
                style={StyleSheet.absoluteFillObject}
              />
            </View>
          );
        }}
      />
      <FlatList
        ref={thumbRef}
        data={images}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{
          position: 'absolute',
          bottom: IMAGE_SIZE,
        }}
        contentContainerStyle={{
          paddingHorizontal: SPACING,
        }}
        renderItem={({ item, index }) => {
          return (
            <TouchableOpacity onPress={() => scrollToActiveIndex(index)}>
              <Image
                source={{
                  uri: item.src.portrait,
                }}
                style={{
                  width: IMAGE_SIZE,
                  height: IMAGE_SIZE,
                  borderRadius: 12,
                  marginRight: SPACING,
                  borderWidth: 2,
                  borderColor: activeIndex === index ? '#fff' : 'transparent',
                }}
              />
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};
