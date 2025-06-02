const express = require('express');
const fs = require('fs');
const path = require('path');
const Docker = require('dockerode');
const docker = new Docker();
const router = express.Router();
const { auth } = require('../utils/authenticate');

router.post('/', async (req, res) => {
  const { code, language, input } = req.body;

  try {
    const result = await executeCodeInDocker(language, code, input);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error during code execution:", error);
    res.status(500).json({ result: 'SERVER ERROR', log: 'Internal Server Error' });
  }
});

async function executeCodeInDocker(language, code, input) {
  const codeDir = path.join(__dirname, '..', 'ide_submissions');
  if (!fs.existsSync(codeDir)) {
    fs.mkdirSync(codeDir, { recursive: true });
  }

  const codeFilePath = path.join(codeDir, `main.${language}`);
  const inputFilePath = path.join(codeDir, 'input.txt');
  const outputFilePath = path.join(codeDir, 'output.txt');
  const errorFilePath = path.join(codeDir, 'error.txt');

  fs.writeFileSync(codeFilePath, code);
  fs.writeFileSync(inputFilePath, input);

  const result = await executeInDocker(language, {
    codeFilePath,
    inputFilePath,
    outputFilePath,
    errorFilePath,
  });

  const output = fs.readFileSync(outputFilePath, 'utf-8');
  const error = fs.readFileSync(errorFilePath, 'utf-8');

  if (error) {
    return {
      result: 'COMPILATION ERROR',
      log: 'Compilation or Runtime error occurred',
      error,
    };
  }

  return { result: 'SUCCESS', log: 'Code executed successfully', output: output.trim() };
}

async function executeInDocker(language, filePaths) {
  const { codeFilePath, inputFilePath, outputFilePath, errorFilePath } = filePaths;
  let imageName;
  let entryPoint;

  switch (language) {
    case 'cpp':
      imageName = 'codearena_cpp_docker';
      entryPoint = 'g++ main.cpp -o main && timeout 6s ./main';
      break;
    case 'py':
      imageName = 'codearena_python_docker';
      entryPoint = 'timeout 6s python main.py';
      break;
    default:
      throw new Error('Unsupported language');
  }

  const container = await docker.createContainer({
    Image: imageName,
    Cmd: ['sh', '-c', `${entryPoint} < input.txt > output.txt 2> error.txt`],
    Tty: false,
    HostConfig: {
      Binds: [`${path.dirname(codeFilePath)}:/usr/src/app`],
    },
    WorkingDir: '/usr/src/app',
  });

  try {
    await container.start();

    const result = await container.wait();

    if (result.StatusCode !== 0) {
      const error = fs.readFileSync(errorFilePath, 'utf-8');
      return {
        result: 'RUNTIME ERROR',
        log: `Runtime error occurred or code took too long to execute`,
        error,
      };
    }
  } 
  catch (err) {
    if (err.message.includes('timeout')) {
      return {
        result: 'TIME LIMIT EXCEEDED',
        log: 'The code execution exceeded the time limit of 6 seconds',
      };
    }
    throw err;
  } 
  finally {
    await container.remove();
  }
}
module.exports = router;
