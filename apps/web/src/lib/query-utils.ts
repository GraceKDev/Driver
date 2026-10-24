import type { QueryClient } from "@tanstack/react-query";

export function invalidateDriveData(queryClient: QueryClient): void {
  void queryClient.invalidateQueries({ queryKey: ["drive"] });
  void queryClient.invalidateQueries({ queryKey: ["trash"] });
  void queryClient.invalidateQueries({ queryKey: ["me"] });
  void queryClient.invalidateQueries({ queryKey: ["search"] });
}
