import { describe, expect, test } from "@jest/globals";

import { DbRole, Role } from "../../src/entity/Role.js";

describe("Role", () => {
  const role = new Role();

  test("should return true if the role is the same as the role (for 'none')", () => {
    role.dbRole = DbRole.None;
    expect(role.isDbRoleAtLeast(DbRole.None)).toBe(true);
  });

  test("should return true if the role is the same as the role (for team captain')", () => {
    role.dbRole = DbRole.TeamCaptain;
    expect(role.isDbRoleAtLeast(DbRole.TeamCaptain)).toBe(true);
  });

  test("should return true if the role is greater than the role", () => {
    role.dbRole = DbRole.Committee;
    expect(role.isDbRoleAtLeast(DbRole.TeamCaptain)).toBe(true);
  });

  test("should return false if the role is less than the role", () => {
    role.dbRole = DbRole.TeamMember;
    expect(role.isDbRoleAtLeast(DbRole.Committee)).toBe(false);
  });
});
