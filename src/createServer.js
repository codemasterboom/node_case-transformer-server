const http = require('http');
const { detectCase } = require('./convertToCase/detectCase');
const { convertToCase } = require('./convertToCase/convertToCase');

function createServer() {
  return http.createServer((req, res) => {
    const requestURL = new URL(req.url, `http://${req.headers.host}`);
    const params = new URLSearchParams(requestURL.search);
    const errorResponse = { errors: [] };

    if (!requestURL.pathname || requestURL.pathname === '/') {
      errorResponse.errors.push({
        message:
          `Text to convert is required. ` +
          `Correct request is: ` +
          `"/<TEXT_TO_CONVERT>?toCase=<CASE_NAME>".`,
      });
    }

    const toCase = params.get('toCase');

    if (!toCase) {
      errorResponse.errors.push({
        message:
          `"toCase" query param is required. ` +
          `Correct request is: ` +
          `"/<TEXT_TO_CONVERT>?toCase=<CASE_NAME>".`,
      });
    } else if (
      !['SNAKE', 'KEBAB', 'CAMEL', 'PASCAL', 'UPPER'].includes(toCase)
    ) {
      errorResponse.errors.push({
        message:
          `This case is not supported. Available cases: ` +
          `SNAKE, KEBAB, CAMEL, PASCAL, UPPER.`,
      });
    }

    if (errorResponse.errors.length > 0) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(errorResponse));
    } else {
      const inputText = requestURL.pathname.slice(1);
      const fromCase = detectCase(inputText);
      const outText = convertToCase(inputText, toCase).convertedText;

      const response = {
        originalCase: fromCase,
        targetCase: toCase,
        originalText: inputText,
        convertedText: outText,
      };

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(response));
    }
  });
}

module.exports = { createServer };
