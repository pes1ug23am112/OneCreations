module.exports = {
  apps: [
    {
      name: 'onecreations-api',
      script: 'dist/index.js',
      cwd: '/home/deploy/oneCreations/api',
      instances: 1,
      exec_mode: 'fork',
      env: { NODE_ENV: 'production' },
      max_memory_restart: '300M',
      error_file: '/home/deploy/logs/api.err.log',
      out_file: '/home/deploy/logs/api.out.log',
      merge_logs: true,
      time: true,
      kill_timeout: 10000,
    },
  ],
};
