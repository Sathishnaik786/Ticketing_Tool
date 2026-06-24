// Helper function to check if a user can chat with another user based on role rules
// ROLE-BASED CHAT RULES:
// ADMIN: Can chat with ADMIN, MANAGER, HR, EMPLOYEE
// MANAGER: Can chat with EMPLOYEE, ADMIN
// EMPLOYEE: Can chat with MANAGER only
// HR: Can chat with MANAGER, EMPLOYEE
export function canChat(currentUserRole: string, targetUserRole: string): boolean {
  if (currentUserRole === "ADMIN") return true;
  if (currentUserRole === "MANAGER" && ["EMPLOYEE", "ADMIN"].includes(targetUserRole)) return true;
  if (currentUserRole === "EMPLOYEE" && targetUserRole === "MANAGER") return true;
  if (currentUserRole === "HR" && ["MANAGER", "EMPLOYEE"].includes(targetUserRole)) return true;
  return false;
}