import assert from "node:assert/strict";
import test from "node:test";
import { changePasswordSchema } from "../auth/auth.schemas";
import { userIdParamsSchema } from "./admin.schemas";
import { generateTemporaryPassword } from "../../utils/generateTemporaryPassword";

test("reset password endpoint accepts UUID user ids only", () => {
  assert.equal(
    userIdParamsSchema.safeParse({ id: "00000000-0000-4000-8000-000000000001" }).success,
    true
  );

  for (const id of ["123456", "user-1", "", "00000000-0000-4000-8000-00000000000g"]) {
    assert.equal(userIdParamsSchema.safeParse({ id }).success, false);
  }
});

test("temporary passwords meet password rules and contain only unambiguous characters", () => {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const password = generateTemporaryPassword();
    assert.equal(password.length, 10);
    assert.match(password, /^[A-HJ-NP-Zabcdefghijkmnpqrstuvwxyz2-9]+$/);
    assert.match(password, /[A-HJ-NP-Z]/);
    assert.match(password, /[abcdefghijkmnpqrstuvwxyz]/);
    assert.match(password, /[2-9]/);
    assert.equal(
      changePasswordSchema.safeParse({ currentPassword: "old-password", newPassword: password })
        .success,
      true
    );
  }
});
