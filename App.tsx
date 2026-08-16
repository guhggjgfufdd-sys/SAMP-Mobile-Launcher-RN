import React from 'react';
import { Provider } from 'react-redux';
import { store } from './src/store';
import NavigationRouter from './src/navigation/navigation-router';

const App = () => {
  return (
    <Provider store={store}>
      <NavigationRouter />
    </Provider>
  );
};

export default App;
