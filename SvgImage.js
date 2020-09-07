// @flow

import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

const getHTML = (svgContent, style) => `
<html data-key="key-${style.height}-${style.width}">
  <head>
    <style>
      html, body {
        margin: 0;
        padding: 0;
        height: 100%;
        width: 100%;
        overflow: hidden;
        background-color: transparent;
      }
      svg {
        position: fixed;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        overflow: hidden;
      }
    </style>
  </head>
  <body>
    ${svgContent}
  </body>
</html>
`;

class SvgImage extends Component {
  state = { fetchingUrl: null, svgContent: null };
  componentDidMount() {
    this.doFetch(this.props);
  }
  componentWillReceiveProps(nextProps) {
    const { source } = this.props;
    const prevUri = source && source.uri;
    const nextUri = nextProps.source && nextProps.source.uri;

    if (nextUri && prevUri !== nextUri) {
      this.doFetch(nextProps);
    }
  }
  doFetch = async props => {
    const { source, onLoadStart, onLoadEnd } = props;
    let uri = source && source.uri;
    if (uri) {
      onLoadStart && onLoadStart();
      if (uri.match(/^data:image\/svg/)) {
        const index = uri.indexOf('<svg');
        this.setState({ fetchingUrl: uri, svgContent: uri.slice(index) });
      } else {
        try {
          const res = await fetch(uri);
          const text = await res.text();
          this.setState({ fetchingUrl: uri, svgContent: text });
        } catch (err) {
          console.error('got error', err);
        }
      }
      onLoadEnd && onLoadEnd();
    }
  };
  render() {
    const { disableAndroidHardwareAcceleration, containerStyle, style } = this.props;
    const { svgContent } = this.state;
    if (svgContent) {
      const flattenedStyle = StyleSheet.flatten(style) || {};
      const html = getHTML(svgContent, flattenedStyle);

      return (
        <View pointerEvents="none" style={[style, containerStyle]}>
          <WebView
            originWhitelist={['*']}
            scalesPageToFit={true}
            useWebKit={false}
            style={[
              {
                width: 200,
                height: 100,
                backgroundColor: 'transparent',
              },
              style,
            ]}
            scrollEnabled={false}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            androidHardwareAccelerationDisabled={disableAndroidHardwareAcceleration}
            source={{ html }}
          />
        </View>
      );
    } else {
      return (
        <View
          pointerEvents="none"
          style={[containerStyle, style]}
        />
      );
    }
  }
}

export default SvgImage;
