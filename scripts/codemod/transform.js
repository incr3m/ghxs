const path = require('path');
const { run: jscodeshift } = require('jscodeshift/src/Runner');

const options = {
  // dry: true,
  print: true,
  verbose: 1,
  extensions: 'js,jsx,ts,tsx',
  parser: 'tsx',
  // ...
};

(async () => {
  const res = await jscodeshift(
    // eslint-disable-next-line no-undef
    // path.join(__dirname, 'mui-icons.js'),
    path.join(__dirname, 'lodash-modular.js'),
    // ['src/modules/timesheets/TimesheetReport'],
    // ['src/modules/scheduler/SchedGanttChart/GanttChart'],
    // ['src/components/BeTable/v1.2'],
    ['src'],
    options,
  );
  console.log(res);
})();
