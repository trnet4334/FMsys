import test from 'node:test';
import assert from 'node:assert/strict';

test('createPool returns a pool with query method', async () => {
  const { createPool } = await import('../apps/api/src/db.js');
  const pool = createPool(process.env.DATABASE_URL || 'postgresql://localhost:5432/fmsys_test');
  assert.equal(typeof pool.query, 'function');
  assert.equal(typeof pool.end, 'function');
  await pool.end();
});

test('pool can execute a simple query', async () => {
  const { createPool } = await import('../apps/api/src/db.js');
  const pool = createPool(process.env.DATABASE_URL || 'postgresql://localhost:5432/fmsys_test');
  const result = await pool.query('SELECT 1 AS val');
  assert.equal(result.rows[0].val, 1);
  await pool.end();
});
