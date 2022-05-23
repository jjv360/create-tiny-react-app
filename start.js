import inquirer from 'inquirer'
import path from 'path'
import fs from 'fs'
import { oraPromise } from 'ora'
import copy from 'copy-template-dir'
import { fileURLToPath } from 'url'
import ChildProcess from 'child_process'
import chalk from 'chalk'

// Start function
async function start() {

    // Ask for project name
    let answers = await inquirer.prompt([
        { type: 'input', name: 'appName', message: 'New app name:', default: 'My React App' }
    ])
    
    // Figure out package name
    let packageName = answers.appName.toLowerCase().replaceAll(/\W/g, '-')

    // Ask to create it
    let parentFolder = path.resolve(process.cwd())
    let packageFolder = path.resolve(parentFolder, packageName)

    // Check if folder exists already
    if (fs.existsSync(packageFolder))
        throw new Error("The folder already exists at " + packageFolder)

    // Sanity check: Confirm if we are inside a node project already
    if (fs.existsSync(path.resolve(parentFolder, "package.json"))) {

        // Confirm
        let answers3 = await inquirer.prompt([ { type: 'confirm', name: 'confirmed', message: "You are creating a React app inside another package. Do you want to continue? "} ])
        if (!answers3.confirmed)
            return

    }

    // We are ready! Start the extraction
    let promise = new Promise((resolve, reject) => {

        // Run the copy
        let __filename = fileURLToPath(import.meta.url)
        let __dirname = path.dirname(__filename)
        copy(path.resolve(__dirname, 'template/simple'), packageFolder, {
            APP_NAME: answers.appName,
            PKG_NAME: packageName,
        }, (err, createdFiles) => {

            // Resolve promise
            if (err) reject(err)
            else resolve(createdFiles)

        })
        
    })
    let createdFiles = await oraPromise(promise, { text: 'Creating project...' })

    // Install dependencies
    let dependencies = ['react', 'react-dom']
    for (let dep of dependencies)
        await oraPromise(runCmd(packageFolder, "npm install " + dep), { text: 'Installing ' + dep + '...' })

    // Install dev dependencies
    let devDependencies = ['parcel']
    for (let dep of devDependencies)
        await oraPromise(runCmd(packageFolder, "npm install --save-dev " + dep), { text: 'Installing ' + dep + '...' })

    // Done
    console.log(``)
    console.log(`Done! Run '${chalk.blue(`cd ${packageName}`)}' and then '${chalk.blue(`npm start`)}' to run your app.`)
    console.log(``)

}

/** Run a command in the context of the directory */
async function runCmd(path, cmd) {

    // Run it
    let { exitCode, text } = await new Promise((resolve, reject) => {
        
        // Start process
        let proc = null
        proc = ChildProcess.exec(cmd, { cwd: path }, (err, stdout, stderr) => {
            if (err) reject(err)
            else resolve({ exitCode: proc.exitCode, text: stdout + stderr })
        })
        
    })

    // Fail if exit code is not 0
    if (exitCode != 0)
        throw new Error("Process failed: " + cmd + "\n" + text)

}

// Run the main function
start().catch(err => {

    // Show error
    console.error(chalk.red('Failed: ') + err.message)

})