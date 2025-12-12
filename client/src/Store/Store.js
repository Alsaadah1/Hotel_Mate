
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import usersReducer from './usersSlice'; // ✅ adjust if your path is different
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // uses localStorage
import cartReducer from './cartSlice';

// Combine reducers
const rootReducer = combineReducers({
  users: usersReducer,
  cart: cartReducer,
  
});

// Persist config
const persistConfig = {
  key: 'root',
  storage,
};

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store with middleware fixes for redux-persist
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Export persistor for PersistGate
export const persistore = persistStore(store);
