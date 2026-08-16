import React, { Component, ReactNode } from 'react';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import NavigationRouter from './src/routers/navigation-router';

const rootReducer = (state = {}, action: any) => state;
const store = createStore(rootReducer, applyMiddleware(thunk));

// ====== Error Boundary ======
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: string }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: '' };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error: String(error) };
  }

  componentDidCatch(error: any, info: any) {
    console.error('APP CRASH:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0b0c10', padding: 20 }}>
          <Text style={{ color: '#ef4444', fontSize: 18, textAlign: 'center' }}>
            خطأ في التطبيق:{'\n'}{this.state.error}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

// ====== App ======
import { View, Text } from 'react-native';

const App = () => {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <NavigationRouter />
      </ErrorBoundary>
    </Provider>
  );
};

export default App;
