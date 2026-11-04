export function generateMockUsers(count = 200) {
  return Array.from({ length: count }).map((_, i) => {
    const idx = i + 1;
    const id = `00000000-0000-0000-0000-${String(idx).padStart(12, '0')}`;
    const givenName = `User${idx}`;
    const surname = `Test${idx}`;
    const displayName = `${givenName} ${surname}`;
    const companyName = `Company ${(idx % 12) + 1}`;
    const department = ['HR', 'Sales', 'IT', 'R&D', 'Finance', 'Legal'][idx % 6];
    const userPrincipalName = `user${idx}@example.com`;
    return {
      id,
      givenName,
      surname,
      displayName,
      companyName,
      department,
      userPrincipalName
    };
  });
}