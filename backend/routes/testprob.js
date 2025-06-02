const express = require('express');
const fs = require('fs');
const path = require('path');
const Docker = require('dockerode');
const docker = new Docker();
const router = express.Router();
const { auth } = require('../utils/authenticate');

router.post('/', auth, async (req, res) => {
  const submission = req.body;
  const problem = await db.collection('problems').findOne({ title: submission.title });

  if (!problem) {
    return res.status(400).json({ result: 'PROBLEM NOT FOUND', log: 'The specified problem does not exist.' });
  }

  try {
    const result = await runTestcase(problem, submission);
    const submissionIndex = await db.collection('submissions').countDocuments() + 1;
    await db.collection('submissions').insertOne({
      username: submission.username,
      problemName: submission.title,
      status: result.result,
      log: result.log,
      output: result.output,
      error: result.error,
      submissionIndex
    });

    await db.collection('users').updateOne(
      { username: submission.username },
      { 
        $push: { 
          submissionDates: new Date().toISOString() 
        }
      },
      { 
        upsert: false
      }
    );

    res.status(200).json(result);
  } catch (error) {
    console.error("Error during code execution:", error);
    res.status(500).json({ result: 'SERVER ERROR', log: 'Internal Server Error' });
  }
});


async function runTestcase(problem, submission) {
  const submissionDir = path.join(__dirname, '..', 'submissions', submission.username);

  if (!fs.existsSync(submissionDir)) {
    fs.mkdirSync(submissionDir, { recursive: true });
  }

  const codeFilePath = path.join(submissionDir, `main.${submission.language}`);
  const inputFilePath = path.join(submissionDir, 'input.txt');
  const outputFilePath = path.join(submissionDir, 'output.txt');
  const errorFilePath = path.join(submissionDir, 'error.txt');

  fs.writeFileSync(codeFilePath, submission.code);

  for (let i = 0; i < problem.testcase.length; i++) {
    const testcase = problem.testcase[i];

    fs.writeFileSync(inputFilePath, '');
    fs.writeFileSync(outputFilePath, '');
    fs.writeFileSync(errorFilePath, '');

    fs.writeFileSync(inputFilePath, testcase.input);

    const result = await executeInDocker(submission.language, {
      codeFilePath,
      inputFilePath,
      outputFilePath,
      errorFilePath
    });

    const output = fs.readFileSync(outputFilePath, 'utf-8');
    const error = fs.readFileSync(errorFilePath, 'utf-8');

    if (error) {
      return {
        result: 'COMPILATION ERROR',
        log: `Compilation error occurred at testcase ${i + 1}`,
        error,
      };
    }

    if (output.trim() !== testcase.output.trim()) {
      return {
        result: 'WRONG ANSWER',
        log: `Wrong answer at testcase ${i + 1}`,
        input: testcase.input,
        expectedOutput: testcase.output,
        actualOutput: output.trim(),
      };
    }
  }

  return { result: 'ACCEPTED', log: 'All test cases passed successfully', expectedOutput: problem.testcase[0].output, actualOutput: problem.testcase[0].output, input: problem.testcase[0].input };
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
      entryPoint = 'timeout 6s python3 main.py';
      break;
    default:
      throw new Error('Unsupported language');
  }

  const container = await docker.createContainer({
    Image: imageName,
    Cmd: ['sh', '-c', `timeout 6 ${entryPoint} < input.txt > output.txt 2> error.txt`],
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
  } catch (err) {
    if (err.message.includes('timeout')) {
      return {
        result: 'TIME LIMIT EXCEEDED',
        log: 'The code execution exceeded the time limit of 6 seconds',
      };
    }
    throw err;
  } finally {
    await container.remove();
  }
}


module.exports = router;
