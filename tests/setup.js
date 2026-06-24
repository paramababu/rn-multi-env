// Keep test output focused on assertions rather than the CLI's own logging.
// logger.* writes through console.log (errors go through console.error, which we
// leave intact so genuine failures are still visible).
beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});
