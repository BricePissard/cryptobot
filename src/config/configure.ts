const DEFAULT_SERVER_PORT = 3005;

export default () => ({
  port: parseInt(process.env.PORT, 10) || DEFAULT_SERVER_PORT,
});
