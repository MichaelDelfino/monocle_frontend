// Redux store configuration file

import { configureStore } from '@reduxjs/toolkit';
import configReducer from './configSlice';

export default configureStore( {
    reducer: {
        config: configReducer
    }
})