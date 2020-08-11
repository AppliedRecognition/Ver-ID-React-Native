'use strict';

const inquirer = require('inquirer');
const { spawn } = require('child_process');

const SELECTION_OPTIONS = [{ name: 'Plugin Project', value: 0 }];
const commands = {
    0: 'yarn build-project',
};

inquirer
    .prompt([
        {
            type: 'list',
            name: 'build',
            message: 'What do you want to build?',
            choices: SELECTION_OPTIONS,
        },
    ])
    .then(({ build }) => {
        const command = spawn(commands[build], {
            shell: true,
        });
        command.stdout.on('data', (data) => {
            console.log(data.toString());
        });
        command.stderr.on('data', (data) => {
            console.log(data.toString());
        });
    });
