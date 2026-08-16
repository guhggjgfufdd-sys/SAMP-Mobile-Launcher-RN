import React from 'react';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import NavigationRouter from './src/routers/navigation-router';

// ====== Store بسيط جداً ======
const rootReducer = (state = {}, action: any) => state;
const store = createStore(rootReducer, applyMiddleware(thunk));

const App = () => {
  return (
    <Provider store={store}>
      <NavigationRouter />
    </Provider>
  );
};

export default App;
