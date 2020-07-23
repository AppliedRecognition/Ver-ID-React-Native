const initialState = {
  testing: false,
  test_results: [],
};

const reducer = (state = initialState, action: any) => {
  switch (action.type) {
    case 'SET_TESTS':
      return { ...state, test_results: action.payload };
    case 'SET_TESTING':
      return { ...state, testing: action.payload };
    case 'ADD_TESTS':
      let testArray: any[] = state.test_results;
      testArray.push(action.payload);
      return { ...state, test_results: testArray };
    default:
      return state;
  }
};

export default reducer;
