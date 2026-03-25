import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../Redux/store';

/** Typed dispatch — use instead of plain useDispatch() */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/** Typed selector — use instead of plain useSelector() */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
