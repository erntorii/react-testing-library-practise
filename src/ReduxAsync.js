import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCount, fetchDummy } from './features/customCounter/customCounterSlice';

const ReduxAsync= () => {
  const count = useSelector(selectCount);
  const dispatch = useDispatch();

  return (
    <div>
      <span data-testid="count-value">{count}</span>
      <button onClick={() => dispatch(fetchDummy(5))}>FetchDummy</button>
    </div>
  );
};

export default ReduxAsync
