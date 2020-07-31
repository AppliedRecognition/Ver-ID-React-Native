'use strict';
import React, { Component } from 'react';
import { store } from '../redux/store';
import { Provider } from 'react-redux';
import TestRunnerComponent from './TestRunnerComponent';
import ReactNativePluginVerId from '../../src/imports';

class TestMainComponent extends Component {
    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <Provider store={store}>
                <TestRunnerComponent verid={ReactNativePluginVerId} />
            </Provider>
        );
    }
}
export default TestMainComponent;
