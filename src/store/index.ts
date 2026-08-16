import { createStore, applyMiddleware, combineReducers } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import thunk from 'redux-thunk';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ====== Reducers ======
const appReducer = (state = { mode: 'default' }, action: any) => {
  switch (action.type) {
    case 'SET_MODE_TYPE':
      return { ...state, mode: action.payload };
    default:
      return state;
  }
};

const rootReducer = combineReducers({
  app: appReducer,
});

// ====== Persist Config ======
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['app'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// ====== Store ======
export const store = createStore(persistedReducer, applyMiddleware(thunk));
export const persistor = persistStore(store);

// ====== Types ======
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
