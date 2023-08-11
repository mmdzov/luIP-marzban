module.exports = {
  apps: [
    {
      name: "luIP-marzban",
      script: "./app.js",
      instances: 1,
      max_memory_restart: "300M",

      out_file: "./out.log",
      error_file: "./error.log",
      merge_logs: true,

      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
        exec_mode: "cluster_mode",
      },

      env_development: {
        NODE_ENV: "development",
        PORT: 4000,
        watch: true,
        ignore_watch: [
          "./node_modules",
          "./package.json",
          "./package-lock.json",
          "./error.log",
          "./out.log",
          "./ban.sqlite",
          "./db.sqlite",
        ],
      },
    },
  ],
};
