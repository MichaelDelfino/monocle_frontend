// Redux store imports
import { createSlice } from "@reduxjs/toolkit";

export const configSlice = createSlice({
  name: "config",
  initialState: {
    partDef: [],
    euclidMachs: [],
    drillOrder: [],
  },
  reducers: {
    setPartDef: (state, action) => {
      state.partDef = action.payload;
    },
    setEuclidMachs: (state, action) => {
      state.euclidMachs = action.payload;
    },
    setDrillOrder: (state, action) => {
      state.drillOrder = action.payload;
    },
  },
});

export const { setPartDef, setEuclidMachs, setDrillOrder } =
  configSlice.actions;

export default configSlice.reducer;
