'use strict';
var component_styles = {
  resultsContainer: {
    maxHeight: '70%',
    paddingBottom: 10,
    paddingTop: 20,
  },
  container: {
    paddingTop: 20,
    backgroundColor: '#FFFFFF',
    flex: 1,
    alignItems: 'flex-start',
    alignSelf: 'stretch',
    padding: 10,
  },
  button: {
    height: 50,
    backgroundColor: '#48BBEC',
    alignSelf: 'stretch',
    marginTop: 10,
    justifyContent: 'center',
  },
  button_disabled: {
    height: 50,
    backgroundColor: '#A1A1A1',
    alignSelf: 'stretch',
    marginTop: 10,
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 22,
    color: '#FFF',
    alignSelf: 'center',
  },
  suite_started: {
    fontWeight: 'bold',
  },
  test_result: {
    paddingLeft: 5,
    paddingTop: 5,
    paddingRight: 5,
    paddingBottom: 5,
  },
  passed: {
    backgroundColor: '#0FDB20',
    color: '#FFF',
    marginLeft: 20,
  },
  failed: {
    backgroundColor: '#DB0F42',
    color: '#FFF',
    marginLeft: 20,
  },
  empty: {
    backgroundColor: '#DBBD0F',
    color: '#FFF',
    marginLeft: 20,
  },
};
module.exports = component_styles;
