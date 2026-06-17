import { test, before, after } from 'node:test';
import { SecRunner } from '@sectester/runner';
import { AttackParamLocation, HttpMethod } from '@sectester/scan';

const timeout = 40 * 60 * 1000;
const baseUrl = process.env.BRIGHT_TARGET_URL!;

let runner!: SecRunner;

before(async () => {
  runner = new SecRunner({
    hostname: process.env.BRIGHT_HOSTNAME!,
    projectId: process.env.BRIGHT_PROJECT_ID!
  });

  await runner.init();
});

after(() => runner.clear());

test('POST /BasketApi.Basket/DeleteBasket', { signal: AbortSignal.timeout(timeout) }, async () => {
  await runner
    .createScan({
      tests: ['jwt', 'insecure_tls_configuration'],
      attackParamLocations: [AttackParamLocation.HEADER],
      starMetadata: {
        code_source: 'lsndr/dotnet-eshop:main',
        databases: ['PostgreSQL', 'Redis'],
        user_roles: []
      },
      poolSize: +process.env.SECTESTER_SCAN_POOL_SIZE || undefined
    })
    .setFailFast(false)
    .timeout(timeout)
    .run({
      method: HttpMethod.POST,
      url: `${baseUrl}/BasketApi.Basket/DeleteBasket`,
      headers: {
        authorization: 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6ImRldi1rZXktMSJ9.eyJzdWIiOiJ1c2VyLTEyMyIsImF1ZCI6ImJhc2tldCIsImV4cCI6MTc5MjQ5MjAwMH0.signature',
        'content-type': 'application/grpc',
        te: 'trailers'
      }
    });
});