'use strict';
import React, { Component } from 'react';
import {
  Text,
  TouchableHighlight,
  StyleSheet,
  View,
  ScrollView,
} from 'react-native';
import TestRunner from '../TestRunner';
import _ from 'lodash';
import { connect } from 'react-redux';

type Props = {
  verid: any;
  testing: boolean;
  test_results: any[];
};

var styles = StyleSheet.create(require('./component_styles'));
class TestRunnerComponent extends Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  onStartTests() {
    //We could use an "actions" module here but for the sake of brevity I am
    //directly invoking the TestRunner
    let { verid } = this.props;
    TestRunner.execute(verid);
  }

  render() {
    var buttonStyle = styles.button;
    let { testing } = this.props as Props;
    if (testing) {
      buttonStyle = styles.button_disabled;
    }
    var startButton = (
      <View style={styles.container}>
        <TouchableHighlight
          onPress={this.onStartTests.bind(this)}
          style={buttonStyle}
        >
          <Text style={styles.buttonText}>Start Tests</Text>
        </TouchableHighlight>
      </View>
    );
    var testResults: any[] = [],
      { test_results } = this.props as Props;
    _.each(test_results, function (test_result: any, index: number) {
      //test_result has style names, we need to pluck them out of styles object
      var result_styles = _.values(_.pick(styles, test_result.classes));
      //and add a common style for each result
      result_styles.push(styles.test_result);

      testResults.push(
        <Text key={'result_' + index} style={result_styles}>
          {test_result.text}
        </Text>
      );
    });
    return (
      <View style={styles.container}>
        <View style={styles.resultsContainer}>
          <ScrollView>
            <View>{testResults}</View>
          </ScrollView>
        </View>
        {startButton}
      </View>
    );
  }
}

const mapStateToProps = (state: any) => ({
  testing: state.testing,
  test_results: state.test_results,
});

export default connect(mapStateToProps)(TestRunnerComponent);
