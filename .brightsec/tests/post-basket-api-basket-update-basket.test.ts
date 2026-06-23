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

test('POST /BasketApi.Basket/UpdateBasket', { signal: AbortSignal.timeout(timeout) }, async () => {
  await runner
    .createScan({
      tests: ['jwt', 'business_constraint_bypass', 'id_enumeration'],
      attackParamLocations: [AttackParamLocation.HEADER, AttackParamLocation.BODY],
      starMetadata: {
        code_source: 'lsndr/dotnet-eshop:main',
        databases: ['PostgreSQL'],
        user_roles: []
      },
      poolSize: +process.env.SECTESTER_SCAN_POOL_SIZE || undefined
    })
    .setFailFast(false)
    .timeout(timeout)
    .run({
      method: HttpMethod.POST,
      url: `${baseUrl}/BasketApi.Basket/UpdateBasket`,
      body: {
        items: [
          { product_id: 42, quantity: 2 },
          { product_id: 314, quantity: 1 }
        ]
      },
      headers: {
        authorization:
          'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6ImJhc2tldC1zYW1wbGUifQ.eyJzdWIiOiJ1c2VyLTEyMyIsImF1ZCI6ImJhc2tldCJ9.signature',
        'content-type': 'application/grpc',
        te: 'trailers'
      }
    });
});